const {
  pujabRunningAdmissionService,
  pujabApplicationService,
  metadataService,
  pujabApplicantPaymentService,
} = require('@services/index');
const { HttpResponse } = require('@helpers');
const models = require('@models');
const moment = require('moment');
const { Op } = require('sequelize');
const uuid = require('uuid');
const {
  split,
  isEmpty,
  isArray,
  toUpper,
  find,
  includes,
  map,
  groupBy,
  filter,
} = require('lodash');
const { appConfig } = require('@root/config');
const {
  generateSystemReference,
  prnTrackerRecord,
} = require('@controllers/Helpers/paymentReferenceHelper');
const { generatePRN } = require('@helpers/URAHelper');
const {
  pujabProgrammeChoiceHelper,
} = require('@controllers/Helpers/pujabHelper');

const http = new HttpResponse();

class PujabApplicationController {
  /**
   * GET ALL ACTIVE RUNNING ADMISSIONS
   *
   * @param {*} req
   * @param {*} res
   */
  async getOneActiveAdmission(req, res) {
    try {
      const { id: applicantId } = req.user;
      const currentDate = moment().format();

      const admission = await pujabRunningAdmissionService.findOneAdmission({
        where: {
          admission_start_date: {
            [Op.lte]: currentDate,
          },
          admission_end_date: {
            [Op.gte]: currentDate,
          },
          is_active: true,
        },
        include: [
          {
            association: 'academicYear',
            attributes: ['id', 'metadata_value'],
          },
        ],
        attributes: [
          'id',
          'admission_start_date',
          'admission_end_date',
          'application_fee',
          'service_fee',
          'instructions',
          'created_at',
        ],
        raw: true,
        nest: true,
      });

      if (admission) {
        const pujabApplication = await pujabApplicationService.findOneAdmission(
          {
            where: {
              pujab_running_admission_id: admission.id,
              applicant_id: applicantId,
            },
            include: [
              'bioData',
              'fatherInfo',
              'motherInfo',
              'previousAdmission',
              'disability',
              {
                association: 'ordinaryLevel',
                include: [
                  {
                    association: 'subjects',
                    attributes: ['id', 'grade', 'subject'],
                    order: [['subject', 'asc']],
                    separate: true,
                  },
                ],
              },
              {
                association: 'advancedLevel',
                include: [
                  {
                    association: 'subjects',
                    attributes: ['id', 'grade', 'subject'],
                    order: [['subject', 'asc']],
                    separate: true,
                  },
                ],
              },
            ],
          }
        );

        admission.pujabApplication = pujabApplication;

        const disabilityMetadata = await metadataService.findOneMetadata({
          where: {
            metadata_name: 'PUJAB DISABILITIES',
          },
          include: [
            {
              association: 'metadataValues',
              attributes: ['id', 'metadata_value'],
            },
          ],
        });

        if (disabilityMetadata) {
          admission.disabilityMetadata = disabilityMetadata.metadataValues;
        }

        const pujabSections = await metadataService.findOneMetadata({
          where: {
            metadata_name: 'PUJAB SECTIONS',
          },
          include: [
            {
              association: 'metadataValues',
              attributes: ['id', 'metadata_value'],
            },
          ],
        });

        if (pujabSections) {
          admission.pujabSections = map(
            pujabSections.metadataValues,
            (section) => {
              const data = {
                id: section.id,
                title: section.metadata_value,
                priority: 4,
                number_of_choices: 4,
              };

              if (includes(toUpper(data.title), 'NATIONAL')) {
                data.priority = 1;
                data.number_of_choices = 6;
              } else if (includes(toUpper(data.title), 'DISTRICT'))
                data.priority = 2;
              else if (includes(toUpper(data.title), 'TERTIARY'))
                data.priority = 3;

              return data;
            }
          );
        }

        if (pujabApplication) {
          admission.programmeChoices = await pujabProgrammeChoiceHelper(
            pujabApplication.id
          );
        }
      }

      http.setSuccess(200, 'Admissions Fetched Successfully', {
        data: admission,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch All Admissions.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  async submitApplication(req, res) {
    try {
      const { id: admissionId } = req.params;
      const { id: applicantId } = req.user;
      const currentDate = moment().format();

      const findAdmission = await pujabRunningAdmissionService.findOneAdmission(
        {
          where: {
            id: admissionId,
            admission_start_date: {
              [Op.lte]: currentDate,
            },
            admission_end_date: {
              [Op.gte]: currentDate,
            },
            is_active: true,
          },
          raw: true,
        }
      );

      if (!findAdmission) throw new Error('This Admission is no longer Valid');
      const pujabApplication = await pujabApplicationService.findOneAdmission({
        where: {
          applicant_id: applicantId,
          prn: {
            [Op.ne]: null,
          },
        },
        attributes: [
          'id',
          'amount_billed',
          'amount_paid',
          'prn',
          'payment_status',
          'has_disability',
          'has_previous_admission',
          'o_level_result',
          'a_level_result',
        ],
        include: [
          'bioData',
          'fatherInfo',
          'motherInfo',
          'programmeChoices',
          'ordinaryLevel',
          'advancedLevel',
        ],
      });

      if (!pujabApplication)
        throw new Error(
          'You do not have an application record for this admission'
        );

      if (isEmpty(pujabApplication.bioData))
        throw new Error('Please fill your Bio Data');

      if (isEmpty(pujabApplication.fatherInfo))
        throw new Error("Please fill your Father's information");

      if (isEmpty(pujabApplication.motherInfo))
        throw new Error("Please fill your Mother's information");

      if (
        pujabApplication.has_disability !== 'I HAVE DISABILITIES' &&
        pujabApplication.has_disability !== 'I DO NOT HAVE DISABILITIES'
      )
        throw new Error('Please fill your Disability Section');

      if (
        pujabApplication.has_previous_admission !==
          'I HAVE PREVIOUS UNIVERSITY ADMISSION' &&
        pujabApplication.has_previous_admission !==
          'I DO NOT HAVE PREVIOUS ADMISSIONS'
      )
        throw new Error('Please fill your Disability Section');

      if (
        pujabApplication.o_level_result !== 'I HAVE RESULTS' &&
        pujabApplication.o_level_result !== 'I DO NOT HAVE RESULTS'
      )
        throw new Error('Please fill your O level information');

      if (
        pujabApplication.a_level_result !== 'I HAVE RESULTS' &&
        pujabApplication.a_level_result !== 'I DO NOT HAVE RESULTS'
      )
        throw new Error('Please fill your A level information');

      if (isEmpty(pujabApplication.programmeChoices))
        throw new Error('Please fill your programme Choices');

      if (pujabApplication.amount_paid !== pujabApplication.amount_billed)
        throw new Error(
          `Please Pay your application fee of ${pujabApplication.amount_billed} UGX before submitting your form`
        );
      else if (
        !toUpper(pujabApplication.payment_status).includes(
          'RECEIVED AND CREDITED'
        )
      )
        throw new Error(
          `Your Payment is not Reconciled, Please contact the Support Team for Assistance `
        );

      const savedData = await models.sequelize.transaction(
        async (transaction) => {
          await pujabApplicationService.updateAdmission(
            {
              application_completion_date: currentDate,
              application_status: 'COMPLETED',
            },
            {
              id: pujabApplication.id,
              applicant_id: applicantId,
            },
            transaction
          );
        }
      );

      http.setSuccess(200, 'You application has been submitted Successfully', {
        data: savedData,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Submit your application.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * GET ALL ACTIVE RUNNING ADMISSIONS
   *
   * @param {*} req
   * @param {*} res
   */
  async getAdmissionHistory(req, res) {
    try {
      const { id: applicantId } = req.user;

      const applications = await pujabApplicationService
        .findAllApplicants({
          where: {
            applicant_id: applicantId,
          },
          include: [
            'bioData',
            'fatherInfo',
            'motherInfo',
            'previousAdmission',
            'disability',
            {
              association: 'pujabRunningAdmission',
              include: [
                { association: 'academicYear', attributes: ['metadata_value'] },
              ],
              attributes: [
                'id',
                'application_fee',
                'academic_year_id',
                'admission_end_date',
                'admission_start_date',
                'is_active',
              ],
            },
            {
              association: 'ordinaryLevel',
              include: [
                {
                  association: 'subjects',
                  attributes: ['id', 'grade', 'subject'],
                  order: [['subject', 'asc']],
                  separate: true,
                },
              ],
            },
            {
              association: 'advancedLevel',
              include: [
                {
                  association: 'subjects',
                  attributes: ['id', 'grade', 'subject'],
                  order: [['subject', 'asc']],
                  separate: true,
                },
              ],
            },
          ],
        })
        .then((res) => {
          if (res) {
            return res.map((item) => item.get({ plain: true }));
          }
        });

      const newApplications = [];

      for (const pujabApplication of applications) {
        const programmeChoices = await pujabProgrammeChoiceHelper(
          pujabApplication.id
        );

        newApplications.push({
          ...pujabApplication,
          programmeChoices,
        });
      }

      http.setSuccess(200, 'Applications Fetched Successfully', {
        data: newApplications,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch your applications.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * GET PROGRAMMES FOR A RUNNING ADMISSION
   *
   * @param {*} req
   * @param {*} res
   */
  async getAdmissionProgrammes(req, res) {
    try {
      const { runningAdmissionId, section } = req.query;

      if (!runningAdmissionId || !section) {
        throw new Error('Invalid Context provided');
      }

      const metadata = await metadataService.findOneMetadata({
        where: {
          metadata_name: 'PUJAB SECTIONS',
        },
        include: [
          {
            association: 'metadataValues',
            attributes: ['id', 'metadata_value'],
          },
        ],
      });

      if (!metadata) throw new Error('PUJAB Sections have not been defined');

      const findAdmissionSection = find(metadata.metadataValues, (value) =>
        includes(value.metadata_value, section)
      );

      if (!findAdmissionSection) throw new Error('Invalid Section provided');

      const programmes =
        await pujabRunningAdmissionService.getAdmissionInstitutionProgrammes({
          where: {
            pujab_section_id: findAdmissionSection.id,
          },
          ...getAllPujabAdmissionInstitutionAttributes(runningAdmissionId),
        });

      const formattedProgrammes = map(programmes, (advert) => ({
        id: advert.id,
        programme_code: advert.institutionProgramme.programme_code,
        programme_title: toUpper(advert.institutionProgramme.programme_title),
        programme_duration: advert.institutionProgramme.programme_duration,
        institution_name: toUpper(advert.institutionProgramme.institution.name),
        institution_code: advert.institutionProgramme.institution.code,
        study_level: toUpper(
          advert.institutionProgramme.studyLevel.metadata_value
        ),
        duration_measure: toUpper(
          advert.institutionProgramme.durationMeasure.metadata_value
        ),
        pujab_section: advert.pujabSection.metadata_value,
        pujab_section_id: findAdmissionSection.id,
        award: advert.institutionProgramme.award.metadata_value,
        pujab_running_admission_id:
          advert.pujabAdmissionInstitution.pujab_running_admission_id,
      }));

      http.setSuccess(200, 'Admissions Fetched Successfully', {
        data: groupBy(formattedProgrammes, 'institution_name'),
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Single Admission.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * SAVE APPLICANT BIO-DATA
   *
   * @param {*} req
   * @param {*} res
   */
  async createApplicationSectionData(req, res) {
    try {
      const { id: applicantId } = req.user;
      const data = req.body;
      const currentDate = moment().format();

      const findAdmission = await pujabRunningAdmissionService.findOneAdmission(
        {
          where: {
            id: data.pujab_running_admission_id,
            admission_start_date: {
              [Op.lte]: currentDate,
            },
            admission_end_date: {
              [Op.gte]: currentDate,
            },
            is_active: true,
          },
          raw: true,
        }
      );

      if (!findAdmission)
        throw new Error('This PUJAB Admission Scheme is not Active');

      let pujabApplication = await pujabApplicationService.findOneAdmission({
        where: {
          applicant_id: applicantId,
        },
        raw: true,
      });

      const savedData = await models.sequelize.transaction(
        async (transaction) => {
          if (isEmpty(pujabApplication) || isEmpty(pujabApplication.id)) {
            const uuidCodes = split(uuid.v4().toUpperCase(), '-');

            const formID = `PUJAB-${uuidCodes[3]}${uuidCodes[2]}`;

            pujabApplication =
              await pujabApplicationService.createApplicantAdmission(
                {
                  form_id: formID,
                  pujab_running_admission_id: findAdmission.id,
                  applicant_id: applicantId,
                  amount_billed: findAdmission.application_fee,
                  amount_paid: 0,
                  balance: findAdmission.application_fee,
                  application_start_date: currentDate,
                },
                transaction
              );

            if (isArray(pujabApplication)) {
              pujabApplication = pujabApplication[0];
            }
          }

          switch (data.section) {
            case 'bioData':
              return await pujabApplicationService.createBioData(
                {
                  ...data,
                  surname: toUpper(data.surname),
                  other_names: toUpper(data.other_names),
                  gender: toUpper(data.gender),
                  citizenship: toUpper(data.citizenship),
                  fax_no: data.fax_no ? toUpper(data.fax_no) : '',
                  emergency_contact_address: data.emergency_contact_address
                    ? toUpper(data.emergency_contact_address)
                    : '',
                  marital_status: toUpper(data.marital_status),
                  permanent_address: toUpper(data.permanent_address),
                  religion: toUpper(data.religion),
                  home_district: toUpper(data.home_district),
                  county: toUpper(data.county),
                  sub_county: toUpper(data.sub_county),
                  parish: toUpper(data.parish),
                  village: toUpper(data.village),
                  pujab_application_id: pujabApplication.id,
                },
                transaction,
                req
              );

            case 'parents': {
              const result = {};

              if (data.fatherInfo) {
                result.fatherInfo =
                  await pujabApplicationService.createParentData(
                    {
                      ...data.fatherInfo,
                      pujab_application_id: pujabApplication.id,
                    },
                    'fatherInfo',
                    transaction
                  );
              }
              if (data.motherInfo) {
                result.motherInfo =
                  await pujabApplicationService.createParentData(
                    {
                      ...data.motherInfo,
                      pujab_application_id: pujabApplication.id,
                    },
                    'motherInfo',
                    transaction
                  );
              }

              if (isEmpty(result)) throw new Error('No information was saved');

              return result;
            }

            case 'advancedLevel':
            case 'ordinaryLevel': {
              await pujabApplicationService.updateAdmission(
                {
                  [data.section === 'ordinaryLevel'
                    ? 'o_level_result'
                    : 'a_level_result']: data.has_results
                    ? 'I HAVE RESULTS'
                    : 'I DO NOT HAVE RESULTS',
                },
                {
                  id: pujabApplication.id,
                },
                transaction
              );

              if (data.has_results) {
                return await pujabApplicationService.createResult(
                  {
                    ...data,
                    pujab_application_id: pujabApplication.id,
                  },
                  data.section,
                  transaction
                );
              } else {
                return await pujabApplicationService.deleteResults(
                  pujabApplication.id,
                  data.section,
                  transaction
                );
              }
            }

            case 'previousAdmission': {
              const formData = {};

              Object.keys(data).forEach((objKey) => {
                formData[objKey] = toUpper(data[objKey]);
              });

              await pujabApplicationService.updateAdmission(
                {
                  has_previous_admission: data.has_previous_admission
                    ? 'I HAVE PREVIOUS UNIVERSITY ADMISSION'
                    : 'I DO NOT HAVE PREVIOUS ADMISSIONS',
                },
                {
                  id: pujabApplication.id,
                },
                transaction
              );

              if (data.has_previous_admission === true) {
                return await pujabApplicationService.createPreviousAdmission(
                  {
                    ...formData,
                    pujab_application_id: pujabApplication.id,
                  },
                  transaction
                );
              } else {
                return await pujabApplicationService.deletePreviousAdmission(
                  {
                    pujab_application_id: pujabApplication.id,
                  },
                  transaction
                );
              }
            }

            case 'disability':
              await pujabApplicationService.updateAdmission(
                {
                  has_disability: data.has_disability
                    ? 'I HAVE DISABILITIES'
                    : 'I DO NOT HAVE DISABILITIES',
                },
                {
                  id: pujabApplication.id,
                },
                transaction
              );

              if (data.has_disability === true) {
                return await pujabApplicationService.createDisability(
                  {
                    ...data,
                    pujab_application_id: pujabApplication.id,
                  },
                  transaction
                );
              } else
                return await pujabApplicationService.deleteDisability(
                  {
                    pujab_application_id: pujabApplication.id,
                  },
                  transaction
                );

            case 'programmeChoice': {
              const applicantChoices =
                await pujabApplicationService.findAllProgrammeChoice({
                  where: {
                    pujab_application_id: pujabApplication.id,
                  },
                  include: {
                    association: 'admissionProgramme',
                    attributes: ['pujab_section_id'],
                  },
                });

              const dataToCreate = map(data.programmeChoices, (choice) => ({
                ...choice,
                pujab_application_id: pujabApplication.id,
                pujab_admission_institution_programme_id:
                  choice.programme_context_id,
              }));

              const newInserts = filter(dataToCreate, (createData) => {
                const findExists = find(
                  applicantChoices,
                  (appChoice) =>
                    createData.programme_context_id ===
                      appChoice.pujab_admission_institution_programme_id &&
                    createData.pujab_application_id === pujabApplication.id &&
                    createData.pujab_section_id ===
                      appChoice.admissionProgramme.pujab_section_id
                );

                return !findExists;
              });

              if (!isEmpty(applicantChoices)) {
                const toDeleteIds = map(
                  filter(applicantChoices, (choice) => {
                    const findExists = find(
                      newInserts,
                      (appChoice) =>
                        choice.choice_number === appChoice.choice_number &&
                        choice.admissionProgramme.pujab_section_id ===
                          appChoice.pujab_section_id
                    );

                    return !!findExists;
                  }),
                  'id'
                );

                if (!isEmpty(toDeleteIds)) {
                  await pujabApplicationService.deleteProgrammeChoice(
                    toDeleteIds,
                    transaction
                  );
                }
              }

              return await pujabApplicationService.createProgrammeChoice(
                newInserts,
                transaction,
                req
              );
            }

            default:
              throw new Error('Invalid Section Provided');
          }
        }
      );

      http.setSuccess(200, 'Data saved Successfully', {
        data: savedData,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable save your data.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * GENERATE APPLICANT FORM PRN
   *
   * @param {*} req
   * @param {*} res
   */
  async generatePujabPRN(req, res) {
    try {
      const { formId } = req.params;
      const {
        id: applicantId,
        surname,
        other_names: otherNames,
        phone,
        email,
      } = req.user;

      const payload = {};
      const currentDate = moment().format();

      payload.tax_head = appConfig.TAX_HEAD_CODE;
      payload.system_prn = generateSystemReference();
      payload.payment_mode = 'CASH';
      payload.payment_bank_code = 'STN';

      const admission = await pujabApplicationService.findOneAdmission({
        where: {
          applicant_id: applicantId,
          form_id: formId,
        },
        attributes: [
          'id',
          'prn',
          'expiry_date',
          'amount_billed',
          'amount_paid',
          'balance',
        ],
        raw: true,
      });

      if (!admission) throw new Error('Invalid Application Form ID provided');
      if (admission.amount_paid === admission.amount_billed)
        throw new Error('This application form has been paid for.');

      const names = `${surname} ${otherNames}`;

      if (
        admission.prn &&
        moment(admission.expiry_date).format() > currentDate
      ) {
        throw new Error(
          `Your PRN ${admission.prn} is Still valid expiring on ${admission.expiry_date}. Use it to pay your Application Fee`
        );
      }

      payload.tax_payer_name = names;

      const requestUraPrnData = {
        TaxHead: payload.tax_head,
        TaxPayerName: payload.tax_payer_name,
        TaxPayerBankCode: payload.payment_bank_code,
        PaymentBankCode: payload.payment_bank_code,
        ReferenceNo: payload.system_prn,
        ExpiryDays: appConfig.PAYMENT_REFERENCE_EXPIRES_IN,
        Amount: admission.amount_billed,
        PaymentMode: payload.payment_mode,
        MobileNo: phone,
        Email: email,
      };

      const genPRN = await generatePRN(requestUraPrnData);

      const updateData = {};

      updateData.prn = genPRN.ura_prn;
      updateData.expiry_date = genPRN.expiry_date;
      updateData.search_code = genPRN.search_code;
      updateData.amount = admission.amount_billed;
      updateData.tax_payer_name = payload.tax_payer_name;
      updateData.payment_mode = payload.payment_mode;
      updateData.payment_bank_code = payload.payment_bank_code;
      updateData.tax_payer_bank_code = payload.tax_payer_bank_code;
      updateData.generated_by = payload.tax_payer_name;
      updateData.system_prn = payload.system_prn;
      updateData.is_used = false;
      updateData.payment_status = 'PENDING';

      await models.sequelize.transaction(async (transaction) => {
        const result = await pujabApplicationService.updateAdmission(
          updateData,
          {
            applicant_id: applicantId,
            form_id: formId,
          },
          transaction
        );

        const prnTrackerData = {
          pujab_application_id: admission.id,
          category: 'PUJAB-APPLICATION',
          system_prn: payload.system_prn,
          ura_prn: genPRN.ura_prn,
          search_code: genPRN.search_code,
          amount: admission.amount_billed,
          tax_payer_name: payload.tax_payer_name,
          payment_mode: payload.payment_mode,
          payment_bank_code: payload.payment_bank_code,
          tax_payer_bank_code: payload.tax_payer_bank_code,
          generated_by: payload.tax_payer_name,
          expiry_date: genPRN.expiry_date,
        };

        await prnTrackerRecord(prnTrackerData, transaction);

        return result;
      });

      http.setSuccess(200, 'PRN Generated Successfully', { admission });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Generate your PRN.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * TRANSFER APPLICANT PRN PAYMENT
   *
   * @param {*} req
   * @param {*} res
   */
  async transferPRNPayment(req, res) {
    try {
      const { applicationId } = req.params;
      const { id: applicantId } = req.user;
      const data = req.body;

      const payload = {};

      payload.tax_head = appConfig.TAX_HEAD_CODE;
      payload.system_prn = generateSystemReference();
      payload.payment_mode = 'CASH';
      payload.payment_bank_code = 'STN';

      const admission = await pujabApplicationService.findOneAdmission({
        where: {
          id: applicationId,
          applicant_id: applicantId,
        },
        attributes: ['id', 'prn', 'amount_billed', 'amount_paid', 'balance'],
        raw: true,
      });

      if (!admission) throw new Error('This application does not Exist');
      if (admission.prn !== data.current_prn)
        throw new Error('The Old PRN is Invalid');

      const findPRNPayment = await pujabApplicantPaymentService.findOne({
        where: {
          pujab_application_id: applicationId,
          ura_prn: data.payment_prn,
        },
        raw: true,
      });

      if (!findPRNPayment)
        throw new Error(
          `This PRN ${data.payment_prn} does not have any payment associated with this Application Form`
        );

      http.setSuccess(200, 'PRN Payment Transferred Successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Transfer your PRN Payment.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

const getAllPujabAdmissionInstitutionAttributes = (runningAdmissionId) => ({
  attributes: ['id'],
  include: [
    {
      association: 'pujabAdmissionInstitution',
      where: {
        pujab_running_admission_id: runningAdmissionId,
      },
      attributes: ['id', 'pujab_running_admission_id'],
    },
    {
      association: 'institutionProgramme',
      attributes: [
        'id',
        'programme_code',
        'programme_title',
        'programme_duration',
      ],
      include: [
        {
          association: 'durationMeasure',
          attributes: ['id', 'metadata_value'],
        },
        {
          association: 'award',
          attributes: ['id', 'metadata_value'],
        },
        {
          association: 'studyLevel',
          attributes: ['id', 'metadata_value'],
        },
        {
          association: 'institution',
          attributes: ['id', 'name', 'code'],
        },
      ],
    },
    {
      association: 'pujabSection',
      attributes: ['id', 'metadata_value'],
    },
  ],
});

module.exports = PujabApplicationController;
