const {
  eventService,
  studentProgrammeService,
  metadataService,
  studentServicePolicyService,
  changeOfProgrammeService,
  programmeService,
} = require('@services/index');
const { isEmpty, isArray, split, toUpper, now } = require('lodash');
const model = require('@models');
const { getMetadataValueIdFromName } = require('./programmeHelper');
const { appConfig } = require('@root/config');
const { generatePRN } = require('@helpers/URAHelper');
const {
  generateSystemReference,
  prnTrackerRecord,
} = require('./paymentReferenceHelper');
const moment = require('moment');

const studentServiceEvent = async (studentId, category) => {
  try {
    const findStudentProgramme = await studentProgrammeService.findOne({
      where: {
        student_id: studentId,
        is_current_programme: true,
      },
      raw: true,
    });

    if (!findStudentProgramme) {
      throw new Error('Unable to find Student Active Academic Records.');
    }

    const currentAcademicYear = await eventService.studentAcademicYear({
      campus_id: findStudentProgramme.campus_id,
      intake_id: findStudentProgramme.intake_id,
      entry_academic_year_id: findStudentProgramme.entry_academic_year_id,
    });

    if (!currentAcademicYear) {
      throw new Error(`You currently have no running Academic Year.`);
    }

    const event =
      await eventService.findLateEnrollmentAndRegistrationEventsFunction(
        findStudentProgramme.campus_id,
        findStudentProgramme.intake_id,
        findStudentProgramme.entry_academic_year_id,
        `'${toUpper(category)}'`,
        "'KEY EVENT'",
        currentAcademicYear.id,
        currentAcademicYear.semester_context_id
      );

    const currentDate = now();

    if (
      event &&
      moment(currentDate).format() > moment(event.end_date).format()
    ) {
      throw new Error(
        'Change of Programme has already closed for this Academic Year'
      );
    }

    return {
      event,
      studentProgrammeId: findStudentProgramme.id,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

const deleteChangeOfProgramme = async (serviceId, studentId, serviceType) => {
  try {
    const findStudentCOP = await changeOfProgrammeService.findOne({
      where: {
        student_id: studentId,
        id: serviceId,
        service_type: serviceType,
        request_status: 'PENDING',
        paid: 0,
      },
      raw: true,
    });

    if (!findStudentCOP) {
      throw new Error(`No Pending ${serviceType}`);
    }

    return await changeOfProgrammeService.delete({
      where: {
        id: findStudentCOP.id,
      },
    });
  } catch (error) {
    throw new Error(error.message);
  }
};

const createChangeOfProgramme = async (studentId, data) => {
  const findStudentProgramme = await studentProgrammeService.findOne({
    where: {
      student_id: studentId,
      is_current_programme: true,
    },
    include: [
      {
        association: 'programme',
        include: [
          {
            association: 'versions',
            separate: true,
            where: {
              is_current_version: true,
            },
            attributes: ['id'],
          },
        ],
      },
    ],
    plain: true,
  });

  if (!findStudentProgramme) {
    throw new Error(`Unable To Find Your Current Active Programme.`);
  }

  if (!data.service) throw new Error('Provide a valid Service type');

  if (
    !isEmpty(findStudentProgramme.programme) &&
    !isEmpty(findStudentProgramme.programme.versions) &&
    !data.new_programme_version_id
  ) {
    // Fine New Programme's Current Version
    const findNewProgramme = await programmeService.findOneProgramme({
      where: { id: data.new_programme_id },
      include: {
        association: 'versions',
        where: {
          is_current_version: true,
        },
      },
      raw: true,
      nested: true,
    });

    data.new_programme_version_id = findNewProgramme['versions.id'];
  }

  const serviceType = split(data.service).join(' ').toUpperCase();

  const serviceMetadata = await metadataService
    .findOneMetadata({
      where: {
        metadata_name: 'CHANGE OF PROGRAMME TYPES',
      },
      attributes: ['id', 'metadata_name'],
      include: [
        {
          association: 'metadataValues',
          separate: true,
          attributes: ['id', 'metadata_value'],
        },
      ],
      plain: true,
    })
    .then((res) => {
      if (res) {
        return res.toJSON();
      }
    });

  if (!serviceMetadata) {
    throw new Error(`No Services have been defined`);
  }

  if (!serviceMetadata) {
    throw new Error(`No Active programme found`);
  }

  const changeOfProgrammeId = getMetadataValueIdFromName(
    serviceMetadata.metadataValues,
    serviceType,
    'CHANGE OF PROGRAMME TYPES'
  );

  data.student_id = studentId;
  data.student_programme_id = findStudentProgramme.id;
  data.balance = 0;
  data.amount = 0;
  data.paid = 0;
  data.currency = 'UGX';

  const findPolicy = await studentServicePolicyService
    .findOneRecord({
      where: {
        student_service_type_id: changeOfProgrammeId,
      },
      include: [
        {
          association: 'account',
          attributes: ['account_code', 'account_name'],
        },
        {
          association: 'serviceType',
          attributes: ['id', 'metadata_value'],
        },
        {
          association: 'amounts',
          include: [
            {
              association: 'billingCategory',
              attributes: ['id', 'metadata_value'],
            },
            {
              association: 'currency',
              attributes: ['id', 'metadata_value'],
            },
          ],
        },
      ],
      nest: true,
    })
    .then((res) => {
      if (res) {
        return res.toJSON();
      }
    });

  const findPendingService = await changeOfProgrammeService.findOne({
    where: {
      student_programme_id: data.student_programme_id,
      student_id: data.student_id,
      request_status: 'PENDING',
      service_type: serviceType,
    },
  });

  if (findPendingService)
    throw new Error(`You have a pending ${serviceType} application`);

  if (findPolicy) {
    const findPolicyAmount = findPolicy.amounts.find(
      (policy) =>
        parseInt(policy.billing_category_id, 10) ===
        parseInt(findStudentProgramme.billing_category_id, 10)
    );

    if (findPolicyAmount) {
      data.requires_payment = true;
      data.amount = findPolicyAmount.amount;
      data.balance = findPolicyAmount.amount;
      data.currency_id = findPolicyAmount.currency_id;
      data.currency = findPolicyAmount.currency.metadata_value;
      data.service_type = serviceType;
    }
  } else throw new Error(`No ${serviceType} Policy has been Defined`);

  const result = await model.sequelize.transaction(async (transaction) => {
    const result = await changeOfProgrammeService.createChangeOfProgramme(
      data,
      transaction
    );

    return result;
  });

  return result;
};

const generateChangeOfProgrammePRN = async (
  changeOfProgrammeId,
  studentId = null
) => {
  const payload = {};

  payload.tax_head = appConfig.TAX_HEAD_CODE;
  payload.system_prn = generateSystemReference();
  payload.payment_mode = 'CASH';
  payload.payment_bank_code = 'STN';

  let clause = {
    id: changeOfProgrammeId,
  };

  if (studentId) {
    clause = {
      id: changeOfProgrammeId,
      student_id: studentId,
    };
  }

  const findChangeOfProg = await changeOfProgrammeService
    .findOne({
      where: clause,
      include: [
        {
          association: 'student',
          attributes: ['id', 'surname', 'other_names', 'phone', 'email'],
        },
      ],
    })
    .then((res) => (res ? res.toJSON() : null));

  if (!findChangeOfProg) {
    throw new Error(`unable To Find Your Requested Service.`);
  }

  if (!findChangeOfProg.amount) {
    throw new Error(
      `You Cannot Generate A PRN For This Service Because It Is Not Billable.`
    );
  }

  if (
    findChangeOfProg.payment_status === 'T' &&
    findChangeOfProg.is_used === true
  ) {
    throw new Error(`Your Application Is already Paid For`);
  }

  if (findChangeOfProg.expiry_date) {
    if (moment(findChangeOfProg.expiry_date) > moment.now()) {
      throw new Error(
        `Your Current Reference Number ${findChangeOfProg.ura_prn} Has Not Yet Expired, Please Generate A New One After ${findChangeOfProg.expiry_date}.`
      );
    }
  }

  const {
    id,
    surname,
    other_names: otherNames,
    phone,
    email,
  } = findChangeOfProg.student;

  const names = `${surname} ${otherNames}`;

  payload.tax_payer_name = names;

  const requestUraPrnData = {
    TaxHead: payload.tax_head,
    TaxPayerName: payload.tax_payer_name,
    TaxPayerBankCode: payload.payment_bank_code,
    PaymentBankCode: payload.payment_bank_code,
    ReferenceNo: payload.system_prn,
    ExpiryDays: appConfig.PAYMENT_REFERENCE_EXPIRES_IN,
    Amount: findChangeOfProg.amount,
    PaymentMode: payload.payment_mode,
    MobileNo: phone,
    Email: email,
  };

  const genPRN = await generatePRN(requestUraPrnData);

  const updateData = {};

  updateData.ura_prn = genPRN.ura_prn;
  updateData.expiry_date = genPRN.expiry_date;
  updateData.search_code = genPRN.search_code;
  updateData.amount = findChangeOfProg.amount;
  updateData.tax_payer_name = payload.tax_payer_name;
  updateData.payment_mode = payload.payment_mode;
  updateData.payment_bank_code = payload.payment_bank_code;
  updateData.tax_payer_bank_code = payload.tax_payer_bank_code;
  updateData.generated_by = payload.tax_payer_name;
  updateData.system_prn = payload.system_prn;
  updateData.is_used = false;
  updateData.payment_status = 'PENDING';

  await model.sequelize.transaction(async (transaction) => {
    const result = await changeOfProgrammeService.update(
      changeOfProgrammeId,
      updateData,
      transaction
    );

    const prnTrackerData = {
      student_id: id,
      category: 'CHANGE-OF-PROGRAMME',
      system_prn: payload.system_prn,
      ura_prn: genPRN.ura_prn,
      search_code: genPRN.search_code,
      amount: findChangeOfProg.amount,
      tax_payer_name: payload.tax_payer_name,
      payment_mode: payload.payment_mode,
      payment_bank_code: payload.payment_bank_code,
      tax_payer_bank_code: payload.tax_payer_bank_code,
      generated_by: payload.tax_payer_name,
      expiry_date: genPRN.expiry_date,
    };

    await prnTrackerRecord(prnTrackerData, transaction);

    return isArray(result) ? result[1][0] : result;
  });
};

const changeOfProgrammeAttributes = () => [
  {
    association: 'academicYear',
    attributes: ['metadata_value'],
  },
  {
    association: 'studentProgramme',
    attributes: ['id'],
    include: [
      {
        association: 'programme',
        attributes: ['programme_code', 'programme_title'],
      },
    ],
  },
  {
    association: 'studyYear',
    attributes: ['programme_study_years'],
  },
  {
    association: 'newCampus',
    attributes: ['id', 'metadata_value'],
  },
  {
    association: 'approvedBy',
    attributes: ['id', 'surname', 'other_names'],
  },
  {
    association: 'acceptedBy',
    attributes: ['id', 'surname', 'other_names'],
  },
  {
    association: 'staffWhoCreated',
    attributes: ['id', 'surname', 'other_names'],
  },
  {
    association: 'newProgrammeType',
    attributes: ['id'],
    include: [
      { association: 'programmeType', attributes: ['id', 'metadata_value'] },
    ],
  },
  {
    association: 'newProgramme',
    attributes: ['id', 'programme_code', 'programme_title'],
  },
  {
    association: 'newSubjectComb',
    attributes: ['id', 'subject_combination_code'],
    include: [
      {
        association: 'subjects',
        separate: true,
        attributes: ['subject_id'],
        include: [
          {
            association: 'subject',
            attributes: ['subject_code', 'id', 'subject_name'],
          },
        ],
      },
    ],
  },
];

module.exports = {
  studentServiceEvent,
  createChangeOfProgramme,
  deleteChangeOfProgramme,
  changeOfProgrammeAttributes,
  generateChangeOfProgrammePRN,
};
