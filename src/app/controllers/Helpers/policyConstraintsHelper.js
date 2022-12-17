const {
  invoiceService,
  metadataValueService,
  semesterLoadService,
  programmeVersionService,
  otherFeesPolicyService,
  registrationService,
  academicYearFeesPolicyService,
  documentVerificationPolicyService,
  studentService,
  previousTransactionsService,
  eventService,
  academicYearService,
  enrollmentService,
  retakersFeesPolicyService,
  graduateFeesPolicyService,
  feesElementService,
  exemptedTuitionCampusService,
} = require('@services/index');
const {
  annualTuitionByContext,
  otherFeesPreviewByContext,
} = require('../FeesManager/feesAmountInvoiceHandler');
const { isEmpty, sumBy, filter, trim, toUpper, find } = require('lodash');
const {
  getMetadataValueId,
  getMetadataValueName,
} = require('@controllers/Helpers/programmeHelper');
const { Op } = require('sequelize');

/**
 *
 * @param {*} payload
 * @param {*} enrollmentRecord
 */
const checkRegistrationPolicyConstraint = async function (
  payload,
  enrollmentRecord
) {
  try {
    const metadataValues = await metadataValueService.findAllMetadataValues({
      include: {
        association: 'metadata',
        attributes: ['id', 'metadata_name'],
      },
      attributes: ['id', 'metadata_value'],
    });

    const exemptedTuitionCampuses = await exemptedTuitionCampusService
      .findAllExemptedTuitionCampuses({
        include: [
          {
            association: 'campus',
            attributes: ['id', 'metadata_value'],
          },
          {
            association: 'createdBy',
            attributes: ['id', 'surname', 'other_names'],
          },
        ],
      })
      .then((res) => {
        if (res) {
          return res.map((item) => item.get({ plain: true }));
        }
      });

    const findIfCampusIsExempted = exemptedTuitionCampuses.find(
      (exemption) =>
        parseInt(exemption.campus_id, 10) ===
        parseInt(enrollmentRecord.programme.campus_id, 10)
    );

    const findActiveInvoiceStatusId = getMetadataValueId(
      metadataValues,
      'ACTIVE',
      'INVOICE STATUSES'
    );

    const findMandatoryInvoiceTypeId = getMetadataValueId(
      metadataValues,
      'MANDATORY',
      'INVOICE TYPES'
    );

    // Check For Previous Enrollment Records

    const previousTuitionInvoices = await invoiceService.findAllTuitionInvoices(
      {
        where: {
          student_id: enrollmentRecord.student_id,
          invoice_status_id: findActiveInvoiceStatusId,
          enrollment_id: {
            [Op.ne]: enrollmentRecord.id,
          },
        },
        attributes: [
          'id',
          'percentage_completion',
          'exempted_percentage',
          'amount_due',
          'exempted_amount',
          'invoice_amount',
          'amount_paid',
          'invoice_number',
        ],
        raw: true,
      }
    );

    if (!isEmpty(previousTuitionInvoices)) {
      previousTuitionInvoices.forEach((invoice) => {
        if (parseFloat(invoice.amount_due) > 0) {
          throw new Error(
            `You Have A Previous Unpaid Invoice Amount Of ${invoice.amount_due} For A Tuition Invoice: ${invoice.invoice_number}`
          );
        }
      });
    }

    const previousFunctionalInvoices =
      await invoiceService.findAllFunctionalFeesInvoices({
        where: {
          student_id: enrollmentRecord.student_id,
          invoice_status_id: findActiveInvoiceStatusId,
          enrollment_id: {
            [Op.ne]: enrollmentRecord.id,
          },
        },
        attributes: [
          'id',
          'percentage_completion',
          'exempted_percentage',
          'amount_due',
          'exempted_amount',
          'invoice_amount',
          'amount_paid',
          'invoice_number',
        ],
        raw: true,
      });

    if (!isEmpty(previousFunctionalInvoices)) {
      previousFunctionalInvoices.forEach((invoice) => {
        if (parseFloat(invoice.amount_due) > 0) {
          throw new Error(
            `You Have A Previous Unpaid Invoice Amount Of ${invoice.amount_due} For A Functional Fees Invoice: ${invoice.invoice_number}`
          );
        }
      });
    }

    const previousOtherFeesInvoices =
      await invoiceService.findAllOtherFeesInvoices({
        where: {
          student_id: enrollmentRecord.student_id,
          invoice_status_id: findActiveInvoiceStatusId,
          enrollment_id: {
            [Op.ne]: enrollmentRecord.id,
          },
        },
        attributes: [
          'id',
          'percentage_completion',
          'exempted_percentage',
          'amount_due',
          'exempted_amount',
          'invoice_amount',
          'amount_paid',
          'description',
          'invoice_number',
        ],
        raw: true,
      });

    if (!isEmpty(previousOtherFeesInvoices)) {
      previousOtherFeesInvoices.forEach((invoice) => {
        if (parseFloat(invoice.amount_due) > 0) {
          throw new Error(
            `You Have A Previous Unpaid Invoice Amount Of ${invoice.amount_due} For An Other Fees Invoice: ${invoice.invoice_number}`
          );
        }
      });
    }

    const previousManualInvoices =
      await invoiceService.findAllEnrollmentManualInvoices({
        where: {
          student_programme_id: enrollmentRecord.student_programme_id,
          invoice_status_id: findActiveInvoiceStatusId,
        },
        attributes: [
          'id',
          'percentage_completion',
          'exempted_percentage',
          'amount_due',
          'exempted_amount',
          'invoice_amount',
          'amount_paid',
          'description',
          'invoice_number',
        ],
        raw: true,
      });

    if (!isEmpty(previousManualInvoices)) {
      previousManualInvoices.forEach((invoice) => {
        if (parseFloat(invoice.amount_due) > 0) {
          throw new Error(
            `You Have A Previous Unpaid Invoice Amount Of ${invoice.amount_due} For A Manual Invoice: ${invoice.invoice_number}`
          );
        }
      });
    }

    // Check for Current Enrollment Record
    const tuitionInvoice = await invoiceService.findOneTuitionInvoiceRecord({
      where: {
        enrollment_id: enrollmentRecord.id,
        invoice_status_id: findActiveInvoiceStatusId,
      },
      attributes: [
        'id',
        'percentage_completion',
        'exempted_percentage',
        'amount_due',
        'exempted_amount',
        'invoice_amount',
        'amount_paid',
      ],
      raw: true,
    });

    if (!findIfCampusIsExempted) {
      if (!tuitionInvoice) {
        throw new Error(
          'Unable To Find An Active Tuition Invoice For Your Enrollment Record.'
        );
      }
    }

    const functionalInvoice =
      await invoiceService.findOneFunctionalInvoiceRecord({
        where: {
          enrollment_id: enrollmentRecord.id,
          invoice_status_id: findActiveInvoiceStatusId,
        },
        attributes: [
          'id',
          'percentage_completion',
          'exempted_percentage',
          'amount_due',
          'exempted_amount',
          'invoice_amount',
          'amount_paid',
        ],
        raw: true,
      });

    const otherFeesInvoices = await invoiceService.findAllOtherFeesInvoices({
      where: {
        enrollment_id: enrollmentRecord.id,
        invoice_status_id: findActiveInvoiceStatusId,
        invoice_type_id: findMandatoryInvoiceTypeId,
      },
      attributes: [
        'id',
        'percentage_completion',
        'exempted_percentage',
        'amount_due',
        'exempted_amount',
        'invoice_amount',
        'amount_paid',
        'description',
        'invoice_number',
      ],
      raw: true,
    });

    const manualInvoices = await invoiceService.findAllEnrollmentManualInvoices(
      {
        where: {
          academic_year_id: enrollmentRecord.event.academicYear.id,
          semester_id: enrollmentRecord.event.semester.id,
          invoice_status_id: findActiveInvoiceStatusId,
          invoice_type_id: findMandatoryInvoiceTypeId,
          student_programme_id: enrollmentRecord.student_programme_id,
        },
        attributes: [
          'id',
          'percentage_completion',
          'exempted_percentage',
          'amount_due',
          'exempted_amount',
          'invoice_amount',
          'amount_paid',
          'description',
          'invoice_number',
        ],
        raw: true,
      }
    );

    let tuitionCompletion = 0;

    if (tuitionInvoice && parseFloat(tuitionInvoice.invoice_amount) > 0) {
      tuitionCompletion =
        (parseFloat(tuitionInvoice.amount_paid) /
          parseFloat(tuitionInvoice.invoice_amount)) *
        100;
    }

    if (payload.is_combined === true) {
      if (
        functionalInvoice &&
        parseFloat(functionalInvoice.invoice_amount) > 0
      ) {
        const functionalCompletion =
          (parseFloat(functionalInvoice.amount_paid) /
            parseFloat(functionalInvoice.invoice_amount)) *
          100;

        const combinedPercentage = functionalCompletion + tuitionCompletion;

        if (
          parseFloat(combinedPercentage) <
          parseFloat(payload.combined_fee_percentage)
        ) {
          throw new Error(
            `You Need A Combined Completion Percentage For Tuition And Functional Fees Invoices Of Atleast ${payload.combined_fee_percentage}%`
          );
        }
      } else {
        const combinedPercentage = tuitionCompletion;

        if (
          parseFloat(combinedPercentage) <
          parseFloat(payload.combined_fee_percentage)
        ) {
          throw new Error(
            `You Need A Combined Completion Percentage For Tuition And Functional Fees Invoices Of Atleast ${payload.combined_fee_percentage}%`
          );
        }
      }
    } else {
      if (
        parseFloat(tuitionCompletion) <
        parseFloat(payload.tuition_fee_percentage)
      ) {
        if (tuitionInvoice && parseFloat(tuitionInvoice.invoice_amount) > 0) {
          throw new Error(
            `Your Policy requires at least ${payload.tuition_fee_percentage}% Tuition Completion for you to register`
          );
        }
      }

      if (functionalInvoice) {
        const functionalCompletion =
          (parseFloat(functionalInvoice.amount_paid) /
            parseFloat(functionalInvoice.invoice_amount)) *
          100;

        if (
          parseFloat(functionalCompletion) <
          parseInt(payload.functional_fee_percentage, 10)
        ) {
          throw new Error(
            `Your Policy requires at least ${payload.functional_fee_percentage}% Functional Fees Completion for you to register`
          );
        }
      }
    }

    if (!isEmpty(otherFeesInvoices)) {
      otherFeesInvoices.forEach((invoice) => {
        const invoiceCompletion =
          (parseFloat(invoice.amount_paid) /
            parseFloat(invoice.invoice_amount)) *
          100;

        if (parseFloat(invoiceCompletion) < 100) {
          throw new Error(
            `You Cannot Proceed Without Fully Clearing The Mandatory Other Fees Invoice: ${invoice.invoice_number} For ${invoice.description}`
          );
        }
      });
    }

    if (!isEmpty(manualInvoices)) {
      manualInvoices.forEach((invoice) => {
        const invoiceCompletion =
          (parseFloat(invoice.amount_paid) /
            parseFloat(invoice.invoice_amount)) *
          100;

        if (parseFloat(invoiceCompletion) < 100) {
          throw new Error(
            `You Cannot Proceed Without Fully Clearing The Mandatory Manual Invoice: ${invoice.invoice_number} For ${invoice.description}`
          );
        }
      });
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} payload
 * @param {*} enrollmentRecord
 */
const retakersRegistrationPolicyConstraint = async function (
  payload,
  enrollmentRecord
) {
  try {
    const metadataValues = await metadataValueService.findAllMetadataValues({
      include: {
        association: 'metadata',
        attributes: ['id', 'metadata_name'],
      },
      attributes: ['id', 'metadata_value'],
    });

    const findActiveInvoiceStatusId = getMetadataValueId(
      metadataValues,
      'ACTIVE',
      'INVOICE STATUSES'
    );

    const findMandatoryInvoiceTypeId = getMetadataValueId(
      metadataValues,
      'MANDATORY',
      'INVOICE TYPES'
    );

    const tuitionInvoices = await invoiceService.findAllTuitionInvoices({
      where: {
        enrollment_id: enrollmentRecord.id,
        invoice_status_id: findActiveInvoiceStatusId,
      },
      attributes: [
        'id',
        'percentage_completion',
        'exempted_percentage',
        'amount_due',
        'exempted_amount',
        'invoice_amount',
        'amount_paid',
        'description',
        'invoice_number',
      ],
      raw: true,
    });

    const functionalInvoices =
      await invoiceService.findAllFunctionalFeesInvoices({
        where: {
          enrollment_id: enrollmentRecord.id,
          invoice_status_id: findActiveInvoiceStatusId,
        },
        attributes: [
          'id',
          'percentage_completion',
          'exempted_percentage',
          'amount_due',
          'exempted_amount',
          'invoice_amount',
          'amount_paid',
          'description',
          'invoice_number',
        ],
        raw: true,
      });

    const otherFeesInvoices = await invoiceService.findAllOtherFeesInvoices({
      where: {
        enrollment_id: enrollmentRecord.id,
        invoice_status_id: findActiveInvoiceStatusId,
        invoice_type_id: findMandatoryInvoiceTypeId,
      },
      attributes: [
        'id',
        'percentage_completion',
        'exempted_percentage',
        'amount_due',
        'exempted_amount',
        'invoice_amount',
        'amount_paid',
        'description',
        'invoice_number',
      ],
      raw: true,
    });

    const manualInvoices = await invoiceService.findAllEnrollmentManualInvoices(
      {
        where: {
          academic_year_id: enrollmentRecord.event.academicYear.id,
          semester_id: enrollmentRecord.event.semester.id,
          invoice_status_id: findActiveInvoiceStatusId,
          invoice_type_id: findMandatoryInvoiceTypeId,
          student_programme_id: enrollmentRecord.student_programme_id,
        },
        attributes: [
          'id',
          'percentage_completion',
          'exempted_percentage',
          'amount_due',
          'exempted_amount',
          'invoice_amount',
          'amount_paid',
          'description',
          'invoice_number',
        ],
        raw: true,
      }
    );

    let totalTuitionExpected = 0;

    let totalTuitionPaid = 0;

    let totalTuitionCompletion = 0;

    let totalFunctionalExpected = 0;

    let totalFunctionalPaid = 0;

    let totalFunctionalCompletion = 0;

    if (!isEmpty(tuitionInvoices)) {
      totalTuitionExpected = sumBy(tuitionInvoices, 'invoice_amount');
      totalTuitionPaid = sumBy(tuitionInvoices, 'amount_paid');

      totalTuitionCompletion =
        (parseFloat(totalTuitionPaid) / parseFloat(totalTuitionExpected)) * 100;
    }

    if (!isEmpty(functionalInvoices)) {
      totalFunctionalExpected = sumBy(functionalInvoices, 'invoice_amount');

      totalFunctionalPaid = sumBy(functionalInvoices, 'amount_paid');

      totalFunctionalCompletion =
        (parseFloat(totalFunctionalPaid) /
          parseFloat(totalFunctionalExpected)) *
        100;
    }

    if (payload.is_combined === true) {
      const combinedPercentage =
        totalTuitionCompletion + totalFunctionalCompletion;

      if (
        parseFloat(combinedPercentage) <
        parseFloat(payload.combined_fee_percentage)
      ) {
        throw new Error(
          `You Need A Combined Completion Percentage For Tuition And Functional Fees Invoices Of Atleast ${payload.combined_fee_percentage}%`
        );
      }
    } else {
      if (!isEmpty(tuitionInvoices)) {
        if (
          parseFloat(totalTuitionCompletion) <
          parseFloat(payload.tuition_fee_percentage)
        ) {
          throw new Error(
            `Your Policy requires at least ${payload.tuition_fee_percentage}% Tuition Completion for you to register`
          );
        }
      }

      if (!isEmpty(functionalInvoices)) {
        if (
          parseFloat(totalFunctionalCompletion) <
          parseInt(payload.functional_fee_percentage, 10)
        ) {
          throw new Error(
            `Your Policy requires at least ${payload.functional_fee_percentage}% Functional Fees Completion for you to register`
          );
        }
      }
    }

    if (!isEmpty(otherFeesInvoices)) {
      otherFeesInvoices.forEach((invoice) => {
        const invoiceCompletion =
          (parseFloat(invoice.amount_paid) /
            parseFloat(invoice.invoice_amount)) *
          100;

        if (parseFloat(invoiceCompletion) < 100) {
          throw new Error(
            `You Cannot Proceed Without Fully Clearing The Mandatory Other Fees Invoice: ${invoice.invoice_number} For ${invoice.description}`
          );
        }
      });
    }

    if (!isEmpty(manualInvoices)) {
      manualInvoices.forEach((invoice) => {
        const invoiceCompletion =
          (parseFloat(invoice.amount_paid) /
            parseFloat(invoice.invoice_amount)) *
          100;

        if (parseFloat(invoiceCompletion) < 100) {
          throw new Error(
            `You Cannot Proceed Without Fully Clearing The Mandatory Manual Invoice: ${invoice.invoice_number} For ${invoice.description}`
          );
        }
      });
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} enrollmentRecord
 */
const examinationCardConstraints = async function (enrollmentRecord) {
  try {
    const metadataValues = await metadataValueService.findAllMetadataValues({
      include: {
        association: 'metadata',
        attributes: ['id', 'metadata_name'],
      },
      attributes: ['id', 'metadata_value'],
    });

    const findActiveInvoiceStatusId = getMetadataValueId(
      metadataValues,
      'ACTIVE',
      'INVOICE STATUSES'
    );

    const findMandatoryInvoiceTypeId = getMetadataValueId(
      metadataValues,
      'MANDATORY',
      'INVOICE TYPES'
    );

    const tuitionInvoices = await invoiceService.findAllTuitionInvoices({
      where: {
        enrollment_id: enrollmentRecord.id,
        invoice_status_id: findActiveInvoiceStatusId,
      },
      attributes: [
        'id',
        'percentage_completion',
        'exempted_percentage',
        'amount_due',
        'exempted_amount',
        'invoice_amount',
        'amount_paid',
        'description',
        'invoice_number',
      ],
      raw: true,
    });

    const functionalInvoices =
      await invoiceService.findAllFunctionalFeesInvoices({
        where: {
          enrollment_id: enrollmentRecord.id,
          invoice_status_id: findActiveInvoiceStatusId,
        },
        attributes: [
          'id',
          'percentage_completion',
          'exempted_percentage',
          'amount_due',
          'exempted_amount',
          'invoice_amount',
          'amount_paid',
          'description',
          'invoice_number',
        ],
        raw: true,
      });

    const otherFeesInvoices = await invoiceService.findAllOtherFeesInvoices({
      where: {
        enrollment_id: enrollmentRecord.id,
        invoice_status_id: findActiveInvoiceStatusId,
        invoice_type_id: findMandatoryInvoiceTypeId,
      },
      attributes: [
        'id',
        'percentage_completion',
        'exempted_percentage',
        'amount_due',
        'exempted_amount',
        'invoice_amount',
        'amount_paid',
        'description',
        'invoice_number',
      ],
      raw: true,
    });

    const manualInvoices = await invoiceService.findAllEnrollmentManualInvoices(
      {
        where: {
          academic_year_id: enrollmentRecord.event.academicYear.id,
          semester_id: enrollmentRecord.event.semester.id,
          invoice_status_id: findActiveInvoiceStatusId,
          invoice_type_id: findMandatoryInvoiceTypeId,
          student_programme_id: enrollmentRecord.student_programme_id,
        },
        attributes: [
          'id',
          'percentage_completion',
          'exempted_percentage',
          'amount_due',
          'exempted_amount',
          'invoice_amount',
          'amount_paid',
          'description',
          'invoice_number',
        ],
        raw: true,
      }
    );

    if (!isEmpty(tuitionInvoices)) {
      tuitionInvoices.forEach((invoice) => {
        const invoiceCompletion =
          (parseFloat(invoice.amount_paid) /
            parseFloat(invoice.invoice_amount)) *
          100;

        if (parseFloat(invoiceCompletion) < 100) {
          throw new Error(
            `You Cannot Proceed Without Fully Clearing The Mandatory Tuition Invoice: ${invoice.invoice_number} For ${invoice.description}`
          );
        }
      });
    }

    if (!isEmpty(functionalInvoices)) {
      functionalInvoices.forEach((invoice) => {
        const invoiceCompletion =
          (parseFloat(invoice.amount_paid) /
            parseFloat(invoice.invoice_amount)) *
          100;

        if (parseFloat(invoiceCompletion) < 100) {
          throw new Error(
            `You Cannot Proceed Without Fully Clearing The Mandatory Functional Fees Invoice: ${invoice.invoice_number} For ${invoice.description}`
          );
        }
      });
    }

    if (!isEmpty(otherFeesInvoices)) {
      otherFeesInvoices.forEach((invoice) => {
        const invoiceCompletion =
          (parseFloat(invoice.amount_paid) /
            parseFloat(invoice.invoice_amount)) *
          100;

        if (parseFloat(invoiceCompletion) < 100) {
          throw new Error(
            `You Cannot Proceed Without Fully Clearing The Mandatory Other Fees Invoice: ${invoice.invoice_number} For ${invoice.description}`
          );
        }
      });
    }

    if (!isEmpty(manualInvoices)) {
      manualInvoices.forEach((invoice) => {
        const invoiceCompletion =
          (parseFloat(invoice.amount_paid) /
            parseFloat(invoice.invoice_amount)) *
          100;

        if (parseFloat(invoiceCompletion) < 100) {
          throw new Error(
            `You Cannot Proceed Without Fully Clearing The Mandatory Manual Invoice: ${invoice.invoice_number} For ${invoice.description}`
          );
        }
      });
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} courseUnits
 * @param {*} studentProgramme
 * @param {*} enrollmentRecord
 * @param {*} registrationEvent
 * @param {*} registrationPayload
 * @param {*} transaction
 */
const continuingAndFinalistSemesterLoadsConstraint = async function (
  courseUnits,
  studentProgramme,
  enrollmentRecord,
  registrationEvent,
  registrationPayload,
  transaction
) {
  try {
    const checkSemesterLoadsAndCourseStatus =
      await querySemesterLoadsAndMetadata(studentProgramme, courseUnits);

    if (
      !isEmpty(checkSemesterLoadsAndCourseStatus.programmeBasedSemesterLoad)
    ) {
      if (
        checkSemesterLoadsAndCourseStatus.checkRetakes === false &&
        checkSemesterLoadsAndCourseStatus.checkMissingPaper === false &&
        checkSemesterLoadsAndCourseStatus.checkSupplementaryPaper === false
      ) {
        if (
          studentProgramme.programmeVersion.has_exempt_registration === true
        ) {
          if (!isEmpty(studentProgramme.programmeVersion.exemptRegs)) {
            const findExemptedRecord =
              studentProgramme.programmeVersion.exemptRegs.find(
                (exemption) =>
                  parseInt(exemption.study_year_id, 10) ===
                    parseInt(
                      enrollmentRecord.studyYear.programme_study_year_id,
                      10
                    ) &&
                  parseInt(exemption.semester_id, 10) ===
                    parseInt(enrollmentRecord.event.semester.semester_id, 10)
              );

            if (findExemptedRecord) {
              registrationPayload.courseUnits = courseUnits;

              const result = await registrationService
                .createRegistrationRecord(registrationPayload, transaction)
                .then((res) => {
                  if (res[1] === false) {
                    throw new Error(
                      'This student is already registered in this registration event!'
                    );
                  }

                  return res[0].dataValues;
                });

              return result;
            } else {
              const checkedCourseUnits =
                await handleProgrammeBasedSemesterLoadWithAllNormalPapers(
                  checkSemesterLoadsAndCourseStatus,
                  courseUnits
                );

              registrationPayload.courseUnits = checkedCourseUnits;

              const result = await registrationService
                .createRegistrationRecord(registrationPayload, transaction)
                .then((res) => {
                  if (res[1] === false) {
                    throw new Error(
                      'This student is already registered in this registration event!'
                    );
                  }

                  return res[0].dataValues;
                });

              return result;
            }
          }
        } else {
          const checkedCourseUnits =
            await handleProgrammeBasedSemesterLoadWithAllNormalPapers(
              checkSemesterLoadsAndCourseStatus,
              courseUnits
            );

          registrationPayload.courseUnits = checkedCourseUnits;

          const result = await registrationService
            .createRegistrationRecord(registrationPayload, transaction)
            .then((res) => {
              if (res[1] === false) {
                throw new Error(
                  'This student is already registered in this registration event!'
                );
              }

              return res[0].dataValues;
            });

          return result;
        }
      } else if (
        (checkSemesterLoadsAndCourseStatus.checkRetakes === true &&
          checkSemesterLoadsAndCourseStatus.checkNormalPaper === true) ||
        (checkSemesterLoadsAndCourseStatus.checkMissingPaper === true &&
          checkSemesterLoadsAndCourseStatus.checkNormalPaper === true) ||
        (checkSemesterLoadsAndCourseStatus.checkRetakes === true &&
          checkSemesterLoadsAndCourseStatus.checkMissingPaper === true &&
          checkSemesterLoadsAndCourseStatus.checkNormalPaper === true)
      ) {
        if (
          studentProgramme.programmeVersion.has_exempt_registration === true
        ) {
          if (!isEmpty(studentProgramme.programmeVersion.exemptRegs)) {
            const findExemptedRecord =
              studentProgramme.programmeVersion.exemptRegs.find(
                (exemption) =>
                  parseInt(exemption.study_year_id, 10) ===
                    parseInt(
                      enrollmentRecord.studyYear.programme_study_year_id,
                      10
                    ) &&
                  parseInt(exemption.semester_id, 10) ===
                    parseInt(enrollmentRecord.event.semester.semester_id, 10)
              );

            if (findExemptedRecord) {
              let arrayNormalPaperCourseUnits = [];

              arrayNormalPaperCourseUnits = courseUnits.filter(
                (item) =>
                  parseInt(item.course_unit_status_id, 10) ===
                  parseInt(
                    checkSemesterLoadsAndCourseStatus.findNormalPaperId,
                    10
                  )
              );
              registrationPayload.courseUnits = arrayNormalPaperCourseUnits;

              const result = await registrationService
                .createRegistrationRecord(registrationPayload, transaction)
                .then((res) => {
                  if (res[1] === false) {
                    throw new Error(
                      'This student is already registered in this registration event!'
                    );
                  }

                  return res[0].dataValues;
                });

              await billRetakesAndMissingPaperOtherFees(
                result,
                checkSemesterLoadsAndCourseStatus,
                courseUnits,
                enrollmentRecord,
                studentProgramme,
                registrationEvent,
                transaction
              );

              return result;
            } else {
              const checkedCourseUnits =
                await handleProgrammeBasedSemesterLoadWithSomeRetakesOrMissingPapersOrBoth(
                  checkSemesterLoadsAndCourseStatus,
                  courseUnits
                );

              let arrayNormalPaperCourseUnits = [];

              arrayNormalPaperCourseUnits = checkedCourseUnits.filter(
                (item) =>
                  parseInt(item.course_unit_status_id, 10) ===
                  parseInt(
                    checkSemesterLoadsAndCourseStatus.findNormalPaperId,
                    10
                  )
              );
              registrationPayload.courseUnits = arrayNormalPaperCourseUnits;

              const result = await registrationService
                .createRegistrationRecord(registrationPayload, transaction)
                .then((res) => {
                  if (res[1] === false) {
                    throw new Error(
                      'This student is already registered in this registration event!'
                    );
                  }

                  return res[0].dataValues;
                });

              await billRetakesAndMissingPaperOtherFees(
                result,
                checkSemesterLoadsAndCourseStatus,
                checkedCourseUnits,
                enrollmentRecord,
                studentProgramme,
                registrationEvent,
                transaction
              );

              return result;
            }
          }
        } else {
          const checkedCourseUnits =
            await handleProgrammeBasedSemesterLoadWithSomeRetakesOrMissingPapersOrBoth(
              checkSemesterLoadsAndCourseStatus,
              courseUnits
            );

          let arrayNormalPaperCourseUnits = [];

          arrayNormalPaperCourseUnits = checkedCourseUnits.filter(
            (item) =>
              parseInt(item.course_unit_status_id, 10) ===
              parseInt(checkSemesterLoadsAndCourseStatus.findNormalPaperId, 10)
          );
          registrationPayload.courseUnits = arrayNormalPaperCourseUnits;

          const result = await registrationService
            .createRegistrationRecord(registrationPayload, transaction)
            .then((res) => {
              if (res[1] === false) {
                throw new Error(
                  'This student is already registered in this registration event!'
                );
              }

              return res[0].dataValues;
            });

          await billRetakesAndMissingPaperOtherFees(
            result,
            checkSemesterLoadsAndCourseStatus,
            checkedCourseUnits,
            enrollmentRecord,
            studentProgramme,
            registrationEvent,
            transaction
          );

          return result;
        }
      } else if (
        checkSemesterLoadsAndCourseStatus.checkRetakes === true ||
        checkSemesterLoadsAndCourseStatus.checkMissingPaper === true ||
        (checkSemesterLoadsAndCourseStatus.checkRetakes === true &&
          checkSemesterLoadsAndCourseStatus.checkMissingPaper === true)
      ) {
        if (
          studentProgramme.programmeVersion.has_exempt_registration === true
        ) {
          if (!isEmpty(studentProgramme.programmeVersion.exemptRegs)) {
            const findExemptedRecord =
              studentProgramme.programmeVersion.exemptRegs.find(
                (exemption) =>
                  parseInt(exemption.study_year_id, 10) ===
                    parseInt(
                      enrollmentRecord.studyYear.programme_study_year_id,
                      10
                    ) &&
                  parseInt(exemption.semester_id, 10) ===
                    parseInt(enrollmentRecord.event.semester.semester_id, 10)
              );

            if (findExemptedRecord) {
              const result = await registrationService
                .createRegistrationRecord(registrationPayload, transaction)
                .then((res) => {
                  if (res[1] === false) {
                    throw new Error(
                      'This student is already registered in this registration event!'
                    );
                  }

                  return res[0].dataValues;
                });

              await billRetakesAndMissingPaperOtherFees(
                result,
                checkSemesterLoadsAndCourseStatus,
                courseUnits,
                enrollmentRecord,
                studentProgramme,
                registrationEvent,
                transaction
              );

              return result;
            } else {
              const checkedCourseUnits =
                await handleProgrammeBasedSemesterLoadWithSomeRetakesOrMissingPapersOrBoth(
                  checkSemesterLoadsAndCourseStatus,
                  courseUnits
                );

              const result = await registrationService
                .createRegistrationRecord(registrationPayload, transaction)
                .then((res) => {
                  if (res[1] === false) {
                    throw new Error(
                      'This student is already registered in this registration event!'
                    );
                  }

                  return res[0].dataValues;
                });

              await billRetakesAndMissingPaperOtherFees(
                result,
                checkSemesterLoadsAndCourseStatus,
                checkedCourseUnits,
                enrollmentRecord,
                studentProgramme,
                registrationEvent,
                transaction
              );

              return result;
            }
          }
        } else {
          const checkedCourseUnits =
            await handleProgrammeBasedSemesterLoadWithSomeRetakesOrMissingPapersOrBoth(
              checkSemesterLoadsAndCourseStatus,
              courseUnits
            );

          const result = await registrationService
            .createRegistrationRecord(registrationPayload, transaction)
            .then((res) => {
              if (res[1] === false) {
                throw new Error(
                  'This student is already registered in this registration event!'
                );
              }

              return res[0].dataValues;
            });

          await billRetakesAndMissingPaperOtherFees(
            result,
            checkSemesterLoadsAndCourseStatus,
            checkedCourseUnits,
            enrollmentRecord,
            studentProgramme,
            registrationEvent,
            transaction
          );

          return result;
        }
      } else if (
        checkSemesterLoadsAndCourseStatus.checkSupplementaryPaper === true
      ) {
        throw new Error(
          'Policies For Supplementary Paper Are Not Yet Available On This Version Of The System.'
        );
      }
    } else if (
      !isEmpty(checkSemesterLoadsAndCourseStatus.studyLevelBasedSemesterLoad)
    ) {
      if (
        checkSemesterLoadsAndCourseStatus.checkRetakes === false &&
        checkSemesterLoadsAndCourseStatus.checkMissingPaper === false &&
        checkSemesterLoadsAndCourseStatus.checkSupplementaryPaper === false
      ) {
        if (
          studentProgramme.programmeVersion.has_exempt_registration === true
        ) {
          if (!isEmpty(studentProgramme.programmeVersion.exemptRegs)) {
            const findExemptedRecord =
              studentProgramme.programmeVersion.exemptRegs.find(
                (exemption) =>
                  parseInt(exemption.study_year_id, 10) ===
                    parseInt(
                      enrollmentRecord.studyYear.programme_study_year_id,
                      10
                    ) &&
                  parseInt(exemption.semester_id, 10) ===
                    parseInt(enrollmentRecord.event.semester.semester_id, 10)
              );

            if (findExemptedRecord) {
              registrationPayload.courseUnits = courseUnits;

              const result = await registrationService
                .createRegistrationRecord(registrationPayload, transaction)
                .then((res) => {
                  if (res[1] === false) {
                    throw new Error(
                      'This student is already registered in this registration event!'
                    );
                  }

                  return res[0].dataValues;
                });

              return result;
            } else {
              const checkedCourseUnits =
                await handleStudyLevelBasedSemesterLoadWithAllNormalPapers(
                  checkSemesterLoadsAndCourseStatus,
                  courseUnits
                );

              registrationPayload.courseUnits = checkedCourseUnits;

              const result = await registrationService
                .createRegistrationRecord(registrationPayload, transaction)
                .then((res) => {
                  if (res[1] === false) {
                    throw new Error(
                      'This student is already registered in this registration event!'
                    );
                  }

                  return res[0].dataValues;
                });

              return result;
            }
          }
        } else {
          const checkedCourseUnits =
            await handleStudyLevelBasedSemesterLoadWithAllNormalPapers(
              checkSemesterLoadsAndCourseStatus,
              courseUnits
            );

          registrationPayload.courseUnits = checkedCourseUnits;

          const result = await registrationService
            .createRegistrationRecord(registrationPayload, transaction)
            .then((res) => {
              if (res[1] === false) {
                throw new Error(
                  'This student is already registered in this registration event!'
                );
              }

              return res[0].dataValues;
            });

          return result;
        }
      } else if (
        (checkSemesterLoadsAndCourseStatus.checkRetakes === true &&
          checkSemesterLoadsAndCourseStatus.checkNormalPaper === true) ||
        (checkSemesterLoadsAndCourseStatus.checkMissingPaper === true &&
          checkSemesterLoadsAndCourseStatus.checkNormalPaper === true) ||
        (checkSemesterLoadsAndCourseStatus.checkRetakes === true &&
          checkSemesterLoadsAndCourseStatus.checkMissingPaper === true &&
          checkSemesterLoadsAndCourseStatus.checkNormalPaper === true)
      ) {
        if (
          studentProgramme.programmeVersion.has_exempt_registration === true
        ) {
          if (!isEmpty(studentProgramme.programmeVersion.exemptRegs)) {
            const findExemptedRecord =
              studentProgramme.programmeVersion.exemptRegs.find(
                (exemption) =>
                  parseInt(exemption.study_year_id, 10) ===
                    parseInt(
                      enrollmentRecord.studyYear.programme_study_year_id,
                      10
                    ) &&
                  parseInt(exemption.semester_id, 10) ===
                    parseInt(enrollmentRecord.event.semester.semester_id, 10)
              );

            if (findExemptedRecord) {
              let arrayNormalPaperCourseUnits = [];

              arrayNormalPaperCourseUnits = courseUnits.filter(
                (item) =>
                  parseInt(item.course_unit_status_id, 10) ===
                  parseInt(
                    checkSemesterLoadsAndCourseStatus.findNormalPaperId,
                    10
                  )
              );

              registrationPayload.courseUnits = arrayNormalPaperCourseUnits;

              const result = await registrationService
                .createRegistrationRecord(registrationPayload, transaction)
                .then((res) => {
                  if (res[1] === false) {
                    throw new Error(
                      'This student is already registered in this registration event!'
                    );
                  }

                  return res[0].dataValues;
                });

              await billRetakesAndMissingPaperOtherFees(
                result,
                checkSemesterLoadsAndCourseStatus,
                courseUnits,
                enrollmentRecord,
                studentProgramme,
                registrationEvent,
                transaction
              );

              return result;
            } else {
              const checkedCourseUnits =
                await handleStudyLevelBasedSemesterLoadWithSomeRetakesOrMissingPapersOrBoth(
                  checkSemesterLoadsAndCourseStatus,
                  courseUnits
                );

              let arrayNormalPaperCourseUnits = [];

              arrayNormalPaperCourseUnits = checkedCourseUnits.filter(
                (item) =>
                  parseInt(item.course_unit_status_id, 10) ===
                  parseInt(
                    checkSemesterLoadsAndCourseStatus.findNormalPaperId,
                    10
                  )
              );

              registrationPayload.courseUnits = arrayNormalPaperCourseUnits;

              const result = await registrationService
                .createRegistrationRecord(registrationPayload, transaction)
                .then((res) => {
                  if (res[1] === false) {
                    throw new Error(
                      'This student is already registered in this registration event!'
                    );
                  }

                  return res[0].dataValues;
                });

              await billRetakesAndMissingPaperOtherFees(
                result,
                checkSemesterLoadsAndCourseStatus,
                checkedCourseUnits,
                enrollmentRecord,
                studentProgramme,
                registrationEvent,
                transaction
              );

              return result;
            }
          }
        } else {
          const checkedCourseUnits =
            await handleStudyLevelBasedSemesterLoadWithSomeRetakesOrMissingPapersOrBoth(
              checkSemesterLoadsAndCourseStatus,
              courseUnits
            );

          let arrayNormalPaperCourseUnits = [];

          arrayNormalPaperCourseUnits = checkedCourseUnits.filter(
            (item) =>
              parseInt(item.course_unit_status_id, 10) ===
              parseInt(checkSemesterLoadsAndCourseStatus.findNormalPaperId, 10)
          );

          registrationPayload.courseUnits = arrayNormalPaperCourseUnits;

          const result = await registrationService
            .createRegistrationRecord(registrationPayload, transaction)
            .then((res) => {
              if (res[1] === false) {
                throw new Error(
                  'This student is already registered in this registration event!'
                );
              }

              return res[0].dataValues;
            });

          await billRetakesAndMissingPaperOtherFees(
            result,
            checkSemesterLoadsAndCourseStatus,
            checkedCourseUnits,
            enrollmentRecord,
            studentProgramme,
            registrationEvent,
            transaction
          );

          return result;
        }
      } else if (
        checkSemesterLoadsAndCourseStatus.checkRetakes === true ||
        checkSemesterLoadsAndCourseStatus.checkMissingPaper === true ||
        (checkSemesterLoadsAndCourseStatus.checkRetakes === true &&
          checkSemesterLoadsAndCourseStatus.checkMissingPaper === true)
      ) {
        if (
          studentProgramme.programmeVersion.has_exempt_registration === true
        ) {
          if (!isEmpty(studentProgramme.programmeVersion.exemptRegs)) {
            const findExemptedRecord =
              studentProgramme.programmeVersion.exemptRegs.find(
                (exemption) =>
                  parseInt(exemption.study_year_id, 10) ===
                    parseInt(
                      enrollmentRecord.studyYear.programme_study_year_id,
                      10
                    ) &&
                  parseInt(exemption.semester_id, 10) ===
                    parseInt(enrollmentRecord.event.semester.semester_id, 10)
              );

            if (findExemptedRecord) {
              const result = await registrationService
                .createRegistrationRecord(registrationPayload, transaction)
                .then((res) => {
                  if (res[1] === false) {
                    throw new Error(
                      'This student is already registered in this registration event!'
                    );
                  }

                  return res[0].dataValues;
                });

              await billRetakesAndMissingPaperOtherFees(
                result,
                checkSemesterLoadsAndCourseStatus,
                courseUnits,
                enrollmentRecord,
                studentProgramme,
                registrationEvent,
                transaction
              );

              return result;
            } else {
              const checkedCourseUnits =
                await handleStudyLevelBasedSemesterLoadWithSomeRetakesOrMissingPapersOrBoth(
                  checkSemesterLoadsAndCourseStatus,
                  courseUnits
                );

              const result = await registrationService
                .createRegistrationRecord(registrationPayload, transaction)
                .then((res) => {
                  if (res[1] === false) {
                    throw new Error(
                      'This student is already registered in this registration event!'
                    );
                  }

                  return res[0].dataValues;
                });

              await billRetakesAndMissingPaperOtherFees(
                result,
                checkSemesterLoadsAndCourseStatus,
                checkedCourseUnits,
                enrollmentRecord,
                studentProgramme,
                registrationEvent,
                transaction
              );

              return result;
            }
          }
        } else {
          const checkedCourseUnits =
            await handleStudyLevelBasedSemesterLoadWithSomeRetakesOrMissingPapersOrBoth(
              checkSemesterLoadsAndCourseStatus,
              courseUnits
            );

          const result = await registrationService
            .createRegistrationRecord(registrationPayload, transaction)
            .then((res) => {
              if (res[1] === false) {
                throw new Error(
                  'This student is already registered in this registration event!'
                );
              }

              return res[0].dataValues;
            });

          await billRetakesAndMissingPaperOtherFees(
            result,
            checkSemesterLoadsAndCourseStatus,
            checkedCourseUnits,
            enrollmentRecord,
            studentProgramme,
            registrationEvent,
            transaction
          );

          return result;
        }
      } else if (
        checkSemesterLoadsAndCourseStatus.checkSupplementaryPaper === true
      ) {
        throw new Error(
          'Policies For Supplementary Paper Are Not Yet Available On This Version Of The System.'
        );
      }
    } else {
      throw new Error(
        "Unable To Find Any Semester Load Properties For This Student's Programme Or Study type."
      );
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} courseUnits
 * @param {*} studentProgramme
 * @returns
 */
const continuingAndFinalistSemesterLoadsWithoutInsertion = async function (
  courseUnits,
  studentProgramme
) {
  try {
    const checkSemesterLoadsAndCourseStatus =
      await querySemesterLoadsAndMetadata(studentProgramme, courseUnits);

    if (
      !isEmpty(checkSemesterLoadsAndCourseStatus.programmeBasedSemesterLoad)
    ) {
      if (
        checkSemesterLoadsAndCourseStatus.checkRetakes === false &&
        checkSemesterLoadsAndCourseStatus.checkMissingPaper === false &&
        checkSemesterLoadsAndCourseStatus.checkSupplementaryPaper === false
      ) {
        const checkedCourseUnits =
          await handleProgrammeBasedSemesterLoadWithAllNormalPapers(
            checkSemesterLoadsAndCourseStatus,
            courseUnits
          );

        return checkedCourseUnits;
      } else if (
        (checkSemesterLoadsAndCourseStatus.checkRetakes === true &&
          checkSemesterLoadsAndCourseStatus.checkNormalPaper === true) ||
        (checkSemesterLoadsAndCourseStatus.checkMissingPaper === true &&
          checkSemesterLoadsAndCourseStatus.checkNormalPaper === true) ||
        (checkSemesterLoadsAndCourseStatus.checkRetakes === true &&
          checkSemesterLoadsAndCourseStatus.checkMissingPaper === true &&
          checkSemesterLoadsAndCourseStatus.checkNormalPaper === true)
      ) {
        const checkedCourseUnits =
          await handleProgrammeBasedSemesterLoadWithSomeRetakesOrMissingPapersOrBoth(
            checkSemesterLoadsAndCourseStatus,
            courseUnits
          );

        return checkedCourseUnits;
      } else if (
        checkSemesterLoadsAndCourseStatus.checkRetakes === true ||
        checkSemesterLoadsAndCourseStatus.checkMissingPaper === true ||
        (checkSemesterLoadsAndCourseStatus.checkRetakes === true &&
          checkSemesterLoadsAndCourseStatus.checkMissingPaper === true)
      ) {
        const checkedCourseUnits =
          await handleProgrammeBasedSemesterLoadWithSomeRetakesOrMissingPapersOrBoth(
            checkSemesterLoadsAndCourseStatus,
            courseUnits
          );

        return checkedCourseUnits;
      } else if (
        checkSemesterLoadsAndCourseStatus.checkSupplementaryPaper === true
      ) {
        throw new Error(
          'Policies For Supplementary Paper Are Not Yet Available On This Version Of The System.'
        );
      }
    } else if (
      !isEmpty(checkSemesterLoadsAndCourseStatus.studyLevelBasedSemesterLoad)
    ) {
      if (
        checkSemesterLoadsAndCourseStatus.checkRetakes === false &&
        checkSemesterLoadsAndCourseStatus.checkMissingPaper === false &&
        checkSemesterLoadsAndCourseStatus.checkSupplementaryPaper === false
      ) {
        const checkedCourseUnits =
          await handleStudyLevelBasedSemesterLoadWithAllNormalPapers(
            checkSemesterLoadsAndCourseStatus,
            courseUnits
          );

        return checkedCourseUnits;
      } else if (
        (checkSemesterLoadsAndCourseStatus.checkRetakes === true &&
          checkSemesterLoadsAndCourseStatus.checkNormalPaper === true) ||
        (checkSemesterLoadsAndCourseStatus.checkMissingPaper === true &&
          checkSemesterLoadsAndCourseStatus.checkNormalPaper === true) ||
        (checkSemesterLoadsAndCourseStatus.checkRetakes === true &&
          checkSemesterLoadsAndCourseStatus.checkMissingPaper === true &&
          checkSemesterLoadsAndCourseStatus.checkNormalPaper === true)
      ) {
        const checkedCourseUnits =
          await handleStudyLevelBasedSemesterLoadWithSomeRetakesOrMissingPapersOrBoth(
            checkSemesterLoadsAndCourseStatus,
            courseUnits
          );

        return checkedCourseUnits;
      } else if (
        checkSemesterLoadsAndCourseStatus.checkRetakes === true ||
        checkSemesterLoadsAndCourseStatus.checkMissingPaper === true ||
        (checkSemesterLoadsAndCourseStatus.checkRetakes === true &&
          checkSemesterLoadsAndCourseStatus.checkMissingPaper === true)
      ) {
        const checkedCourseUnits =
          await handleStudyLevelBasedSemesterLoadWithSomeRetakesOrMissingPapersOrBoth(
            checkSemesterLoadsAndCourseStatus,
            courseUnits
          );

        return checkedCourseUnits;
      } else if (
        checkSemesterLoadsAndCourseStatus.checkSupplementaryPaper === true
      ) {
        throw new Error(
          'Policies For Supplementary Paper Are Not Yet Available On This Version Of The System.'
        );
      }
    } else {
      throw new Error(
        "Unable To Find Any Semester Load Properties For This Student's Programme Or Study type."
      );
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} courseUnits
 * @param {*} studentProgramme
 */
const retakersSemesterLoadsConstraint = async function (
  courseUnits,
  studentProgramme
) {
  try {
    const checkSemesterLoadsAndCourseStatus =
      await querySemesterLoadsAndMetadata(studentProgramme, courseUnits);

    if (
      !isEmpty(checkSemesterLoadsAndCourseStatus.programmeBasedSemesterLoad)
    ) {
      if (checkSemesterLoadsAndCourseStatus.checkNormalPaper === true) {
        throw new Error('This Student Cannot Register Normal Papers.');
      } else if (
        checkSemesterLoadsAndCourseStatus.checkRetakes === true ||
        checkSemesterLoadsAndCourseStatus.checkMissingPaper === true ||
        (checkSemesterLoadsAndCourseStatus.checkRetakes === true &&
          checkSemesterLoadsAndCourseStatus.checkMissingPaper === true)
      ) {
        const result =
          await handleProgrammeBasedSemesterLoadsForRetakersAndStayPuters(
            checkSemesterLoadsAndCourseStatus,
            courseUnits
          );

        return result;
      } else if (
        checkSemesterLoadsAndCourseStatus.checkSupplementaryPaper === true
      ) {
        throw new Error(
          'Policies For Supplementary Paper Are Not Yet Available On This Version Of The System.'
        );
      }
      // End
    } else if (
      !isEmpty(checkSemesterLoadsAndCourseStatus.studyLevelBasedSemesterLoad)
    ) {
      if (checkSemesterLoadsAndCourseStatus.checkNormalPaper === true) {
        throw new Error('This Student Cannot Register Normal Papers.');
      } else if (
        checkSemesterLoadsAndCourseStatus.checkRetakes === true ||
        checkSemesterLoadsAndCourseStatus.checkMissingPaper === true ||
        (checkSemesterLoadsAndCourseStatus.checkRetakes === true &&
          checkSemesterLoadsAndCourseStatus.checkMissingPaper === true)
      ) {
        const result =
          await handleStudyLevelBasedSemesterLoadsForRetakersAndStayPuters(
            checkSemesterLoadsAndCourseStatus,
            courseUnits
          );

        return result;
      } else if (
        checkSemesterLoadsAndCourseStatus.checkSupplementaryPaper === true
      ) {
        throw new Error(
          'Policies For Supplementary Paper Are Not Yet Available On This Version Of The System.'
        );
      }
      // End
    } else {
      throw new Error(
        "Unable To Find Any Semester Load Properties For This Student's Programme Or Study type."
      );
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} courseUnits
 * @param {*} studentProgramme
 */
const freshersSemesterLoadsConstraint = async function (
  courseUnits,
  studentProgramme
) {
  try {
    const checkSemesterLoadsAndCourseStatus =
      await querySemesterLoadsAndMetadata(studentProgramme, courseUnits);

    if (
      !isEmpty(checkSemesterLoadsAndCourseStatus.programmeBasedSemesterLoad)
    ) {
      if (
        checkSemesterLoadsAndCourseStatus.checkRetakes === false &&
        checkSemesterLoadsAndCourseStatus.checkMissingPaper === false &&
        checkSemesterLoadsAndCourseStatus.checkSupplementaryPaper === false
      ) {
        const result =
          await handleProgrammeBasedSemesterLoadWithAllNormalPapers(
            checkSemesterLoadsAndCourseStatus,
            courseUnits
          );

        return result;
      } else if (
        checkSemesterLoadsAndCourseStatus.checkRetakes === true ||
        checkSemesterLoadsAndCourseStatus.checkMissingPaper === true ||
        (checkSemesterLoadsAndCourseStatus.checkRetakes === true &&
          checkSemesterLoadsAndCourseStatus.checkMissingPaper === true)
      ) {
        throw new Error('A Fresher Cannot Register Retakes Or Missing Papers.');
      } else if (
        checkSemesterLoadsAndCourseStatus.checkSupplementaryPaper === true
      ) {
        throw new Error(
          'Policies For Supplementary Paper Are Not Yet Available On This Version Of The System.'
        );
      }
    } else if (
      !isEmpty(checkSemesterLoadsAndCourseStatus.studyLevelBasedSemesterLoad)
    ) {
      if (
        checkSemesterLoadsAndCourseStatus.checkRetakes === false &&
        checkSemesterLoadsAndCourseStatus.checkMissingPaper === false &&
        checkSemesterLoadsAndCourseStatus.checkSupplementaryPaper === false
      ) {
        const result =
          await handleStudyLevelBasedSemesterLoadWithAllNormalPapers(
            checkSemesterLoadsAndCourseStatus,
            courseUnits
          );

        return result;
      } else if (
        checkSemesterLoadsAndCourseStatus.checkRetakes === true ||
        checkSemesterLoadsAndCourseStatus.checkMissingPaper === true ||
        (checkSemesterLoadsAndCourseStatus.checkRetakes === true &&
          checkSemesterLoadsAndCourseStatus.checkMissingPaper === true)
      ) {
        throw new Error('A Fresher Cannot Register Retakes Or Missing Papers.');
      } else if (
        checkSemesterLoadsAndCourseStatus.checkSupplementaryPaper === true
      ) {
        throw new Error(
          'Policies For Supplementary Paper Are Not Yet Available On This Version Of The System.'
        );
      }
    } else {
      throw new Error(
        "Unable To Find Any Semester Load Properties For This Student's Programme Or Study type."
      );
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} semesterCourseUnits
 * @param {*} findStudent
 * @param {*} findEnrollmentRecord
 * @param {*} findEvent
 */
const updateRegisteredCourseUnitsForContinuingAndFinalists = async function (
  semesterCourseUnits,
  findRegistration,
  studentProgramme,
  findEnrollmentRecord,
  findEvent,
  transaction
) {
  try {
    const checkSemesterLoadsAndCourseStatus =
      await querySemesterLoadsAndMetadata(
        studentProgramme,
        semesterCourseUnits
      );

    if (
      !isEmpty(checkSemesterLoadsAndCourseStatus.programmeBasedSemesterLoad)
    ) {
      if (
        checkSemesterLoadsAndCourseStatus.checkRetakes === false &&
        checkSemesterLoadsAndCourseStatus.checkMissingPaper === false &&
        checkSemesterLoadsAndCourseStatus.checkSupplementaryPaper === false
      ) {
        await handleProgrammeBasedSemesterLoadWithAllNormalPapers(
          checkSemesterLoadsAndCourseStatus,
          semesterCourseUnits
        );

        const addedCourseUnits = [];

        for (const eachObject of semesterCourseUnits) {
          const registrationCourseUnit = {
            registration_id: findRegistration.id,
            course_unit_id: eachObject.course_unit_id,
            course_unit_status_id: eachObject.course_unit_status_id,
          };

          const result = await registrationService.createCourseUnitsRecords(
            registrationCourseUnit,
            transaction
          );

          if (result[1] === true) {
            addedCourseUnits.push(result);
          }
        }

        return addedCourseUnits;
      } else if (
        (checkSemesterLoadsAndCourseStatus.checkRetakes === true &&
          checkSemesterLoadsAndCourseStatus.checkNormalPaper === true) ||
        (checkSemesterLoadsAndCourseStatus.checkMissingPaper === true &&
          checkSemesterLoadsAndCourseStatus.checkNormalPaper === true) ||
        (checkSemesterLoadsAndCourseStatus.checkRetakes === true &&
          checkSemesterLoadsAndCourseStatus.checkMissingPaper === true &&
          checkSemesterLoadsAndCourseStatus.checkNormalPaper === true)
      ) {
        await handleProgrammeBasedSemesterLoadWithSomeRetakesOrMissingPapersOrBoth(
          checkSemesterLoadsAndCourseStatus,
          semesterCourseUnits
        );

        let arrayNormalPaperCourseUnits = [];

        let retakesAndMissingPaperCourseUnits = [];

        arrayNormalPaperCourseUnits = semesterCourseUnits.filter(
          (item) =>
            parseInt(item.course_unit_status_id, 10) ===
            parseInt(checkSemesterLoadsAndCourseStatus.findNormalPaperId, 10)
        );

        retakesAndMissingPaperCourseUnits = semesterCourseUnits.filter(
          (item) =>
            parseInt(item.course_unit_status_id, 10) ===
              parseInt(
                checkSemesterLoadsAndCourseStatus.findRetakePaperId,
                10
              ) ||
            parseInt(item.course_unit_status_id, 10) ===
              parseInt(checkSemesterLoadsAndCourseStatus.findMissingPaperId, 10)
        );

        const addedCourseUnits = [];

        for (const eachObject of arrayNormalPaperCourseUnits) {
          const registrationCourseUnit = {
            registration_id: findRegistration.id,
            course_unit_id: eachObject.course_unit_id,
            course_unit_status_id: eachObject.course_unit_status_id,
          };

          const result = await registrationService.createCourseUnitsRecords(
            registrationCourseUnit,
            transaction
          );

          if (result[1] === true) {
            addedCourseUnits.push(result);
          }
        }

        const addedRetakesAndMissingPapers =
          await billRetakesAndMissingPaperOtherFees(
            findRegistration,
            checkSemesterLoadsAndCourseStatus,
            retakesAndMissingPaperCourseUnits,
            findEnrollmentRecord,
            studentProgramme,
            findEvent,
            transaction
          );

        addedCourseUnits.push(addedRetakesAndMissingPapers);

        return addedCourseUnits;
      } else if (
        checkSemesterLoadsAndCourseStatus.checkRetakes === true ||
        checkSemesterLoadsAndCourseStatus.checkMissingPaper === true ||
        (checkSemesterLoadsAndCourseStatus.checkRetakes === true &&
          checkSemesterLoadsAndCourseStatus.checkMissingPaper === true)
      ) {
        await handleProgrammeBasedSemesterLoadWithSomeRetakesOrMissingPapersOrBoth(
          checkSemesterLoadsAndCourseStatus,
          semesterCourseUnits
        );

        const addedRetakesAndMissingPapers =
          await billRetakesAndMissingPaperOtherFees(
            findRegistration,
            checkSemesterLoadsAndCourseStatus,
            semesterCourseUnits,
            findEnrollmentRecord,
            studentProgramme,
            findEvent,
            transaction
          );

        return addedRetakesAndMissingPapers;
      } else if (
        checkSemesterLoadsAndCourseStatus.checkSupplementaryPaper === true
      ) {
        throw new Error(
          'Policies For Supplementary Paper Are Not Yet Available On This Version Of The System.'
        );
      }
    } else if (
      !isEmpty(checkSemesterLoadsAndCourseStatus.studyLevelBasedSemesterLoad)
    ) {
      if (
        checkSemesterLoadsAndCourseStatus.checkRetakes === false &&
        checkSemesterLoadsAndCourseStatus.checkMissingPaper === false &&
        checkSemesterLoadsAndCourseStatus.checkSupplementaryPaper === false
      ) {
        await handleStudyLevelBasedSemesterLoadWithAllNormalPapers(
          checkSemesterLoadsAndCourseStatus,
          semesterCourseUnits
        );

        const addedCourseUnits = [];

        for (const eachObject of semesterCourseUnits) {
          const registrationCourseUnit = {
            registration_id: findRegistration.id,
            course_unit_id: eachObject.course_unit_id,
            course_unit_status_id: eachObject.course_unit_status_id,
          };

          const result = await registrationService.createCourseUnitsRecords(
            registrationCourseUnit,
            transaction
          );

          if (result[1] === true) {
            addedCourseUnits.push(result);
          }
        }

        return addedCourseUnits;
      } else if (
        (checkSemesterLoadsAndCourseStatus.checkRetakes === true &&
          checkSemesterLoadsAndCourseStatus.checkNormalPaper === true) ||
        (checkSemesterLoadsAndCourseStatus.checkMissingPaper === true &&
          checkSemesterLoadsAndCourseStatus.checkNormalPaper === true) ||
        (checkSemesterLoadsAndCourseStatus.checkRetakes === true &&
          checkSemesterLoadsAndCourseStatus.checkMissingPaper === true &&
          checkSemesterLoadsAndCourseStatus.checkNormalPaper === true)
      ) {
        await handleStudyLevelBasedSemesterLoadWithSomeRetakesOrMissingPapersOrBoth(
          checkSemesterLoadsAndCourseStatus,
          semesterCourseUnits
        );
        let arrayNormalPaperCourseUnits = [];

        let retakesAndMissingPaperCourseUnits = [];

        arrayNormalPaperCourseUnits = semesterCourseUnits.filter(
          (item) =>
            parseInt(item.course_unit_status_id, 10) ===
            parseInt(checkSemesterLoadsAndCourseStatus.findNormalPaperId, 10)
        );

        retakesAndMissingPaperCourseUnits = semesterCourseUnits.filter(
          (item) =>
            parseInt(item.course_unit_status_id, 10) ===
              parseInt(
                checkSemesterLoadsAndCourseStatus.findRetakePaperId,
                10
              ) ||
            parseInt(item.course_unit_status_id, 10) ===
              parseInt(checkSemesterLoadsAndCourseStatus.findMissingPaperId, 10)
        );

        const addedCourseUnits = [];

        for (const eachObject of arrayNormalPaperCourseUnits) {
          const registrationCourseUnit = {
            registration_id: findRegistration.id,
            course_unit_id: eachObject.course_unit_id,
            course_unit_status_id: eachObject.course_unit_status_id,
          };

          const result = await registrationService.createCourseUnitsRecords(
            registrationCourseUnit,
            transaction
          );

          if (result[1] === true) {
            addedCourseUnits.push(result);
          }
        }

        const addedRetakesAndMissingPapers =
          await billRetakesAndMissingPaperOtherFees(
            findRegistration,
            checkSemesterLoadsAndCourseStatus,
            retakesAndMissingPaperCourseUnits,
            findEnrollmentRecord,
            studentProgramme,
            findEvent,
            transaction
          );

        addedCourseUnits.push(addedRetakesAndMissingPapers);

        return addedCourseUnits;
      } else if (
        checkSemesterLoadsAndCourseStatus.checkRetakes === true ||
        checkSemesterLoadsAndCourseStatus.checkMissingPaper === true ||
        (checkSemesterLoadsAndCourseStatus.checkRetakes === true &&
          checkSemesterLoadsAndCourseStatus.checkMissingPaper === true)
      ) {
        await handleStudyLevelBasedSemesterLoadWithSomeRetakesOrMissingPapersOrBoth(
          checkSemesterLoadsAndCourseStatus,
          semesterCourseUnits
        );

        const addedRetakesAndMissingPapers =
          await billRetakesAndMissingPaperOtherFees(
            findRegistration,
            checkSemesterLoadsAndCourseStatus,
            semesterCourseUnits,
            findEnrollmentRecord,
            studentProgramme,
            findEvent,
            transaction
          );

        return addedRetakesAndMissingPapers;
      } else if (
        checkSemesterLoadsAndCourseStatus.checkSupplementaryPaper === true
      ) {
        throw new Error(
          'Policies For Supplementary Paper Are Not Yet Available On This Version Of The System.'
        );
      }
    } else {
      throw new Error(
        "Unable To Find Any Semester Load Properties For This Student's Programme Or Study type."
      );
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} registrationRecord
 * @param {*} semesterCourseUnits
 * @param {*} findStudent
 * @param {*} findEnrollmentRecord
 * @param {*} retakersFeesPolicy
 * @param {*} findEvent
 */
const retakersFeesPolicyConstraint = async function (
  registrationRecord,
  courseUnits,
  studentProgramme,
  enrollmentRecord,
  retakersFeesPolicy,
  registrationEvent,
  transaction
) {
  try {
    const metadataValues = await metadataValueService.findAllMetadataValues({
      include: {
        association: 'metadata',
        attributes: ['id', 'metadata_name'],
      },
      attributes: ['id', 'metadata_value'],
    });

    const academicYearFeesPolicies =
      await academicYearFeesPolicyService.findAllRecords({
        attributes: [
          'id',
          'fees_category_id',
          'enrollment_status_id',
          'bill_by_entry_academic_year',
        ],
        raw: true,
      });

    if (isEmpty(academicYearFeesPolicies)) {
      throw new Error(
        'Unable To Find Any Academic Year Fees Policies For Your Institution.'
      );
    }

    const TuitionFeesCategoryId = getMetadataValueId(
      metadataValues,
      'TUITION FEES',
      'FEES CATEGORIES'
    );

    const tuitionAcademicYearFeesPolicy = academicYearFeesPolicies.filter(
      (policy) =>
        parseInt(policy.enrollment_status_id, 10) ===
          parseInt(enrollmentRecord.enrollment_status_id, 10) &&
        parseInt(policy.fees_category_id, 10) ===
          parseInt(TuitionFeesCategoryId, 10)
    );

    if (isEmpty(tuitionAcademicYearFeesPolicy)) {
      throw new Error(
        `Unable To Find A Tuition Fees Academic Year Fees Policy For The Enrollment Status: ${enrollmentRecord.enrollmentStatus.metadata_value}`
      );
    }

    const tuitionInvoice = {
      academic_year_id:
        tuitionAcademicYearFeesPolicy[0].bill_by_entry_academic_year === true
          ? studentProgramme.entry_academic_year_id
          : registrationEvent.academic_year_id,
      intake_id: studentProgramme.intake_id,
      billing_category_id: studentProgramme.billing_category_id,
      programme_id: studentProgramme.programme_id,
      programme_type_id: studentProgramme.programme_type_id,
      programme_study_year_id: enrollmentRecord.study_year_id,
      campus_id: studentProgramme.campus_id,
    };

    const annualTuition = await annualTuitionByContext(tuitionInvoice);

    const programmeDuration = parseInt(
      studentProgramme.programme.programme_duration,
      10
    );

    const durationMeasure =
      studentProgramme.programme.durationMeasure.metadata_value;

    let graduationLoad = 0;

    if (studentProgramme.programme_version_plan_id) {
      const plan = await programmeVersionService.findOneProgrammeVersionPlan({
        where: {
          id: studentProgramme.programme_version_plan_id,
        },
        attributes: ['id', 'graduation_load'],
        raw: true,
      });

      graduationLoad = parseInt(plan.graduation_load, 10);
    } else {
      const entryYears = studentProgramme.programmeVersion.versionEntryYears;
      const checkStudentEntryYear = find(
        entryYears,
        (e) =>
          parseInt(e.entry_year_id, 10) ===
          parseInt(studentProgramme.entryStudyYear.programme_study_year_id, 10)
      );

      if (!checkStudentEntryYear || !checkStudentEntryYear.graduation_load)
        throw new Error(
          `Cannot find a valid Graduation Load for Programme: ${
            studentProgramme.programme.programme_title
          }, found ${
            checkStudentEntryYear ? checkStudentEntryYear.graduation_load : 0
          } `
        );

      graduationLoad = checkStudentEntryYear.graduation_load;
    }

    if (graduationLoad < 1)
      throw new Error(
        `This Programme has wrong Graduation load of ${graduationLoad} defined in the curriculum, Please contact an Administrator to set the right Graduation load for the programme`
      );

    if (durationMeasure !== 'YEAR') {
      throw new Error(
        `The Duration Measure of ${durationMeasure} does not have policy yet on this system.`
      );
    }

    const costPerGraduationLoad = Math.floor(
      (programmeDuration * annualTuition) / graduationLoad
    );

    const findMandatoryInvoiceTypeId = getMetadataValueId(
      metadataValues,
      'MANDATORY',
      'INVOICE TYPES'
    );

    const findActiveInvoiceStatusId = getMetadataValueId(
      metadataValues,
      'ACTIVE',
      'INVOICE STATUSES'
    );

    const courseUnitsCreated = [];

    if (!isEmpty(courseUnits)) {
      for (const eachObject of courseUnits) {
        const findCourseUnitStatusName = await getMetadataValueName(
          metadataValues,
          eachObject.course_unit_status_id,
          'REGISTRATION STATUSES'
        );

        const registrationCourseUnit = {
          registration_id: registrationRecord.id,
          course_unit_id: eachObject.course_unit_id,
          course_unit_status_id: eachObject.course_unit_status_id,
        };

        const registerCourseUnits = await registrationService
          .createCourseUnitsRecords(registrationCourseUnit, transaction)
          .then((res) => {
            if (res[1] === false) {
              throw new Error(
                'A Record Already Exists With One Of The Course Units You Are Trying To Register.'
              );
            }

            return res[0].dataValues;
          });

        if (retakersFeesPolicy.use_default_amount === true) {
          const payload = {
            data: {
              enrollment_id: enrollmentRecord.id,
              student_id: studentProgramme.student_id,
              student_programme_id: studentProgramme.id,
              registration_course_unit_id: registerCourseUnits.id,
              invoice_type_id: findMandatoryInvoiceTypeId,
              invoice_status_id: findActiveInvoiceStatusId,
              invoice_amount: costPerGraduationLoad * eachObject.credit_unit,
              amount_due: costPerGraduationLoad * eachObject.credit_unit,
              currency: 'UGX',
              description: `${findCourseUnitStatusName}: ${eachObject.course_unit_code}.`,
            },
          };

          if (eachObject.already_billed !== true) {
            await invoiceService.createRetakersAndStayPutersTuitionInvoiceBasedOnPolicy(
              payload.data,
              transaction
            );
          }
        } else {
          const payload = {
            data: {
              enrollment_id: enrollmentRecord.id,
              student_id: studentProgramme.student_id,
              student_programme_id: studentProgramme.id,
              registration_course_unit_id: registerCourseUnits.id,
              invoice_type_id: findMandatoryInvoiceTypeId,
              invoice_status_id: findActiveInvoiceStatusId,
              invoice_amount: retakersFeesPolicy.amount,
              amount_due: retakersFeesPolicy.amount,
              currency: 'UGX',
              description: `${findCourseUnitStatusName}: ${eachObject.course_unit_code}.`,
            },
          };

          if (eachObject.already_billed !== true) {
            await invoiceService.createRetakersAndStayPutersTuitionInvoiceBasedOnPolicy(
              payload.data,
              transaction
            );
          }
        }

        courseUnitsCreated.push(registerCourseUnits);
      }
    }

    return courseUnitsCreated;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} tuitionInvoice
 * @param {*} metadataValues
 * @param {*} findDueDate
 * @param {*} enrollmentStatusId
 * @param {*} enrollmentId
 * @param {*} studentProgramme
 * @param {*} enrollmentStatusValue
 * @param {*} createdById
 * @param {*} transaction
 */
const graduateFeesPolicyConstraint = async function (
  tuitionInvoice,
  metadataValues,
  findDueDate,
  enrollmentStatusId,
  enrollmentId,
  studentProgramme,
  enrollmentStatusValue,
  createdById,
  transaction
) {
  try {
    const TuitionFeesCategoryId = getMetadataValueId(
      metadataValues,
      'TUITION FEES',
      'FEES CATEGORIES'
    );

    const MandatoryInvoiceTypeId = getMetadataValueId(
      metadataValues,
      'MANDATORY',
      'INVOICE TYPES'
    );

    const ActiveInvoiceStatusId = getMetadataValueId(
      metadataValues,
      'ACTIVE',
      'INVOICE STATUSES'
    );

    const findGraduateFeesPolicy = await graduateFeesPolicyService
      .findOneRecord({
        where: {
          enrollment_status_id: enrollmentStatusId,
          study_level_id: studentProgramme.programme.programme_study_level_id,
        },
        include: [
          {
            association: 'functionalElements',
            attributes: [
              'id',
              'graduate_fees_policy_id',
              'functional_fees_element_id',
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

    if (!findGraduateFeesPolicy) {
      throw new Error(
        `Unable To Find A Graduate Fees Policy Set For The Enrollment Status Selected.`
      );
    }

    const allFeesElements = await feesElementService.findAllFeesElements({
      raw: true,
    });

    if (isEmpty(allFeesElements)) {
      throw new Error('Unable To Find Any Fees Elements.');
    }

    const findTuitionFeesElement = allFeesElements.find(
      (element) =>
        toUpper(element.fees_element_name).includes('TUITION') &&
        parseInt(element.fees_category_id, 10) ===
          parseInt(TuitionFeesCategoryId, 10)
    );

    if (!findTuitionFeesElement) {
      throw new Error(
        `Unable To Find The Tuition Fees Element's Account Code.`
      );
    }

    if (findGraduateFeesPolicy.use_default_amount === true) {
      const annualTuition = await annualTuitionByContext(tuitionInvoice);

      const graduateFees = ((annualTuition / 12) * 4).toFixed(0);

      const tuitionData = {
        enrollment_id: enrollmentId,
        student_id: studentProgramme.student_id,
        student_programme_id: studentProgramme.id,
        invoice_type_id: MandatoryInvoiceTypeId,
        invoice_status_id: ActiveInvoiceStatusId,
        invoice_amount: graduateFees,
        amount_due: graduateFees,
        currency: 'UGX',
        description: `${enrollmentStatusValue} Tuition Fees.`,
        due_date: findDueDate ? findDueDate.due_date : null,
        created_by_id: createdById,
        tuitionInvoiceFeesElement: {
          fees_element_id: findTuitionFeesElement.id,
          fees_element_code: findTuitionFeesElement.fees_element_code,
          fees_element_name: findTuitionFeesElement.fees_element_name,
          fees_element_category: 'TUITION FEES',
          paid_when: 'EveryAcademicYear/EverySemester',
          currency: 'UGX',
          amount: graduateFees,
        },
      };

      await invoiceService.createGraduatePolicyTuitionInvoices(
        tuitionData,
        transaction
      );
    } else {
      const tuitionData = {
        enrollment_id: enrollmentId,
        student_id: studentProgramme.student_id,
        student_programme_id: studentProgramme.id,
        invoice_type_id: MandatoryInvoiceTypeId,
        invoice_status_id: ActiveInvoiceStatusId,
        invoice_amount: findGraduateFeesPolicy.amount,
        amount_due: findGraduateFeesPolicy.amount,
        currency: 'UGX',
        description: `${enrollmentStatusValue} Tuition Fees.`,
        due_date: findDueDate ? findDueDate.due_date : null,
        created_by_id: createdById,
        tuitionInvoiceFeesElement: {
          fees_element_id: findTuitionFeesElement.id,
          fees_element_code: findTuitionFeesElement.fees_element_code,
          fees_element_name: findTuitionFeesElement.fees_element_name,
          fees_element_category: 'TUITION FEES',
          paid_when: 'EveryAcademicYear/EverySemester',
          currency: 'UGX',
          amount: findGraduateFeesPolicy.amount,
        },
      };

      await invoiceService.createGraduatePolicyTuitionInvoices(
        tuitionData,
        transaction
      );
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} otherFeesElementId
 * @param {*} enrollment
 * @param {*} enrollmentStatusId
 * @param {*} enrollmentStatusValue
 * @param {*} academicYearFeesPolicies
 * @param {*} otherFeesCategoryId
 * @param {*} description
 * @param {*} studentProgramme
 * @param {*} findEvent
 * @param {*} transaction
 */
const lateEnrollmentAndRegistrationSurchargeConstraint = async function (
  otherFeesElementId,
  enrollment,
  enrollmentStatusId,
  enrollmentStatusValue,
  academicYearFeesPolicies,
  otherFeesCategoryId,
  description,
  studentProgramme,
  findEvent,
  transaction
) {
  try {
    const otherFeesElements = [];

    otherFeesElements.push(otherFeesElementId);

    const metadataValues = await metadataValueService.findAllMetadataValues({
      include: {
        association: 'metadata',
        attributes: ['id', 'metadata_name'],
      },
      attributes: ['id', 'metadata_value'],
    });

    const OtherFeesCategoryId = getMetadataValueId(
      metadataValues,
      'OTHER FEES',
      'FEES CATEGORIES'
    );

    const otherFeesAcademicYearFeesPolicy = academicYearFeesPolicies.find(
      (policy) =>
        parseInt(policy.enrollment_status_id, 10) ===
          parseInt(enrollmentStatusId, 10) &&
        parseInt(policy.fees_category_id, 10) ===
          parseInt(OtherFeesCategoryId, 10)
    );

    if (!otherFeesAcademicYearFeesPolicy) {
      throw new Error(
        `Unable To Find An Other Fees Academic Year Fees Policy For The Enrollment Status: ${enrollmentStatusValue}`
      );
    }

    const otherFeesInvoice = {
      academic_year_id:
        otherFeesAcademicYearFeesPolicy.bill_by_entry_academic_year === true
          ? studentProgramme.entry_academic_year_id
          : findEvent.academic_year_id,
      campus_id: studentProgramme.campus_id,
      intake_id: studentProgramme.intake_id,
      billing_category_id: studentProgramme.billing_category_id,
      fees_waiver_id: studentProgramme.fees_waiver_id,
      other_fees: otherFeesElements,
    };

    const otherFeesInvoiceHandler = await otherFeesPreviewByContext(
      otherFeesInvoice
    );

    const otherFeesCategory = otherFeesCategoryId;

    const findMandatoryInvoiceTypeId = getMetadataValueId(
      metadataValues,
      'MANDATORY',
      'INVOICE TYPES'
    );

    const findActiveInvoiceStatusId = getMetadataValueId(
      metadataValues,
      'ACTIVE',
      'INVOICE STATUSES'
    );

    const result =
      await invoiceService.createLateEnrollmentAndRegistrationOtherFeesInvoice(
        otherFeesInvoiceHandler,
        enrollment,
        studentProgramme.student_id,
        studentProgramme.id,
        otherFeesCategory,
        description,
        findMandatoryInvoiceTypeId,
        findActiveInvoiceStatusId,
        transaction
      );

    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} studentProgramme
 * @param {*} courseUnits
 */
const querySemesterLoadsAndMetadata = async function (
  studentProgramme,
  courseUnits
) {
  const queryAllSemesterLoads = await semesterLoadService.findAllSemesterLoads({
    attributes: {
      exclude: [
        'updated_at',
        'created_at',
        'createdById',
        'createApprovedById:',
      ],
    },
    raw: true,
  });

  // const programmeBasedSemesterLoad = filter(queryAllSemesterLoads, {
  //   is_programme_based: true,
  //   programme_id: studentProgramme.programme_id,
  //   programme_study_level_id:
  //     studentProgramme.programme.programme_study_level_id,
  // });

  const programmeBasedSemesterLoad = queryAllSemesterLoads.find(
    (semesterLoad) =>
      semesterLoad.is_programme_based === true &&
      parseInt(semesterLoad.programme_id, 10) ===
        parseInt(studentProgramme.programme_id, 10) &&
      parseInt(semesterLoad.programme_study_level_id, 10) ===
        parseInt(studentProgramme.programme.programme_study_level_id, 10)
  );

  // const studyLevelBasedSemesterLoad = filter(queryAllSemesterLoads, {
  //   is_programme_based: false,
  //   programme_study_level_id:
  //     studentProgramme.programme.programme_study_level_id,
  // });

  const studyLevelBasedSemesterLoad = queryAllSemesterLoads.find(
    (semesterLoad) =>
      semesterLoad.is_programme_based === false &&
      parseInt(semesterLoad.programme_study_level_id, 10) ===
        parseInt(studentProgramme.programme.programme_study_level_id, 10)
  );

  const metadataValues = await metadataValueService.findAllMetadataValues({
    include: {
      association: 'metadata',
      attributes: ['id', 'metadata_name'],
    },
    attributes: ['id', 'metadata_value'],
  });

  const findNormalPaperId = getMetadataValueId(
    metadataValues,
    'NORMAL PAPER',
    'REGISTRATION STATUSES'
  );

  const findRetakePaperId = getMetadataValueId(
    metadataValues,
    'RETAKE PAPER',
    'REGISTRATION STATUSES'
  );

  const findMissingPaperId = getMetadataValueId(
    metadataValues,
    'MISSING PAPER',
    'REGISTRATION STATUSES'
  );

  const findSupplementaryPaperId = getMetadataValueId(
    metadataValues,
    'SUPPLEMENTARY PAPER',
    'REGISTRATION STATUSES'
  );

  const checkNormalPaper = courseUnits.some(
    (status) =>
      parseInt(status.course_unit_status_id, 10) ===
      parseInt(findNormalPaperId, 10)
  );
  const checkRetakes = courseUnits.some(
    (status) =>
      parseInt(status.course_unit_status_id, 10) ===
      parseInt(findRetakePaperId, 10)
  );
  const checkMissingPaper = courseUnits.some(
    (status) =>
      parseInt(status.course_unit_status_id, 10) ===
      parseInt(findMissingPaperId, 10)
  );
  const checkSupplementaryPaper = courseUnits.some(
    (status) =>
      parseInt(status.course_unit_status_id, 10) ===
      parseInt(findSupplementaryPaperId, 10)
  );

  const data = {
    programmeBasedSemesterLoad: programmeBasedSemesterLoad,
    studyLevelBasedSemesterLoad: studyLevelBasedSemesterLoad,
    checkNormalPaper: checkNormalPaper,
    checkRetakes: checkRetakes,
    checkMissingPaper: checkMissingPaper,
    checkSupplementaryPaper: checkSupplementaryPaper,
    findNormalPaperId: findNormalPaperId,
    findRetakePaperId: findRetakePaperId,
    findMissingPaperId: findMissingPaperId,
    findSupplementaryPaperId: findSupplementaryPaperId,
  };

  return data;
};

/** handleProgrammeBasedSemesterLoadWithAllNormalPapers
 *
 * @param {*} checkSemesterLoadsAndCourseStatus
 * @param {*} semesterCourseUnits
 */
const handleProgrammeBasedSemesterLoadWithAllNormalPapers = function (
  checkSemesterLoadsAndCourseStatus,
  semesterCourseUnits
) {
  try {
    const totalCreditUnits = sumBy(semesterCourseUnits, 'credit_unit');

    const semesterLoad =
      checkSemesterLoadsAndCourseStatus.programmeBasedSemesterLoad;

    let normalMinimumLoad = 0;

    let normalMaximumLoad = 0;

    normalMinimumLoad = semesterLoad.normal_minimum_load;

    normalMaximumLoad = semesterLoad.normal_maximum_load;

    if (
      totalCreditUnits >= normalMinimumLoad &&
      totalCreditUnits <= normalMaximumLoad
    ) {
      return semesterCourseUnits;
    } else {
      throw new Error(
        `Total Credit Units Must Be Between ${normalMinimumLoad} and ${normalMaximumLoad}.`
      );
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} checkSemesterLoadsAndCourseStatus
 * @param {*} semesterCourseUnits
 */
const handleStudyLevelBasedSemesterLoadWithAllNormalPapers = function (
  checkSemesterLoadsAndCourseStatus,
  semesterCourseUnits
) {
  const totalCreditUnits = sumBy(semesterCourseUnits, 'credit_unit');

  const semesterLoad =
    checkSemesterLoadsAndCourseStatus.studyLevelBasedSemesterLoad;

  let normalMinimumLoad = 0;

  let normalMaximumLoad = 0;

  normalMinimumLoad = semesterLoad.normal_minimum_load;

  normalMaximumLoad = semesterLoad.normal_maximum_load;

  if (
    totalCreditUnits >= normalMinimumLoad &&
    totalCreditUnits <= normalMaximumLoad
  ) {
    return semesterCourseUnits;
  } else {
    throw new Error(
      `Total Credit Units Must Be Between ${normalMinimumLoad} and ${normalMaximumLoad}.`
    );
  }
};

/**
 *
 * @param {*} checkSemesterLoadsAndCourseStatus
 * @param {*} semesterCourseUnits
 */
const handleProgrammeBasedSemesterLoadWithSomeRetakesOrMissingPapersOrBoth =
  function (checkSemesterLoadsAndCourseStatus, semesterCourseUnits) {
    const totalCreditUnits = sumBy(semesterCourseUnits, 'credit_unit');

    const semesterLoad =
      checkSemesterLoadsAndCourseStatus.programmeBasedSemesterLoad;

    let normalMinimumLoad = 0;

    let overallMaximumLoad = 0;

    normalMinimumLoad = semesterLoad.normal_minimum_load;

    overallMaximumLoad = semesterLoad.overall_maximum_load;

    if (
      totalCreditUnits >= normalMinimumLoad &&
      totalCreditUnits <= overallMaximumLoad
    ) {
      return semesterCourseUnits;
    } else {
      throw new Error(
        `Total Credit Units Must Be Between ${normalMinimumLoad} and ${overallMaximumLoad}.`
      );
    }
  };

/** handleStudyLevelBasedSemesterLoadWithSomeRetakesOrMissingPapersOrBoth
 *
 * @param {*} checkSemesterLoadsAndCourseStatus
 * @param {*} semesterCourseUnits
 */
const handleStudyLevelBasedSemesterLoadWithSomeRetakesOrMissingPapersOrBoth =
  function (checkSemesterLoadsAndCourseStatus, semesterCourseUnits) {
    const totalCreditUnits = sumBy(semesterCourseUnits, 'credit_unit');

    const semesterLoad =
      checkSemesterLoadsAndCourseStatus.studyLevelBasedSemesterLoad;

    let normalMinimumLoad = 0;

    let overallMaximumLoad = 0;

    normalMinimumLoad = semesterLoad.normal_minimum_load;

    overallMaximumLoad = semesterLoad.overall_maximum_load;

    if (
      totalCreditUnits >= normalMinimumLoad &&
      totalCreditUnits <= overallMaximumLoad
    ) {
      return semesterCourseUnits;
    } else {
      throw new Error(
        `Total Credit Units Must Be Between ${normalMinimumLoad} and ${overallMaximumLoad}.`
      );
    }
  };

/**
 *
 * @param {*} registrationRecord
 * @param {*} checkSemesterLoadsAndCourseStatus
 * @param {*} semesterCourseUnits
 * @param {*} enrollmentRecord
 * @param {*} studentProgramme
 * @param {*} registrationEvent
 * @param {*} transaction
 */
const billRetakesAndMissingPaperOtherFees = async function (
  registrationRecord,
  checkSemesterLoadsAndCourseStatus,
  semesterCourseUnits,
  enrollmentRecord,
  studentProgramme,
  registrationEvent,
  transaction
) {
  try {
    const queryOtherFeesPolicy = await otherFeesPolicyService.findAllRecords({
      attributes: ['id', 'other_fees_element_id', 'course_unit_status_id'],
      raw: true,
    });

    const checkRetakeOtherFeesPolicy = queryOtherFeesPolicy.find(
      (item) =>
        parseInt(item.course_unit_status_id, 10) ===
        parseInt(checkSemesterLoadsAndCourseStatus.findRetakePaperId, 10)
    );

    const checkMissingPaperOtherFeesPolicy = queryOtherFeesPolicy.find(
      (item) =>
        parseInt(item.course_unit_status_id, 10) ===
        parseInt(checkSemesterLoadsAndCourseStatus.findMissingPaperId, 10)
    );

    const retakeOtherFeesElements = [];
    const missingPaperOtherFeesElements = [];

    if (checkRetakeOtherFeesPolicy) {
      retakeOtherFeesElements.push(
        parseInt(checkRetakeOtherFeesPolicy.other_fees_element_id, 10)
      );
    }

    if (checkMissingPaperOtherFeesPolicy) {
      missingPaperOtherFeesElements.push(
        parseInt(checkMissingPaperOtherFeesPolicy.other_fees_element_id, 10)
      );
    }

    const arrayOfRetakePaperCourseUnits = semesterCourseUnits.filter(
      (item) =>
        parseInt(item.course_unit_status_id, 10) ===
        parseInt(checkSemesterLoadsAndCourseStatus.findRetakePaperId, 10)
    );

    const arrayOfMissingPaperCourseUnits = semesterCourseUnits.filter(
      (item) =>
        parseInt(item.course_unit_status_id, 10) ===
        parseInt(checkSemesterLoadsAndCourseStatus.findMissingPaperId, 10)
    );

    const courseUnitsCreated = [];

    const metadataValues = await metadataValueService.findAllMetadataValues({
      include: {
        association: 'metadata',
        attributes: ['id', 'metadata_name'],
      },
      attributes: ['id', 'metadata_value'],
    });

    const academicYearFeesPolicies =
      await academicYearFeesPolicyService.findAllRecords({
        attributes: [
          'id',
          'fees_category_id',
          'enrollment_status_id',
          'bill_by_entry_academic_year',
        ],
        raw: true,
      });

    if (isEmpty(academicYearFeesPolicies)) {
      throw new Error(
        'Unable To Find Any Academic Year Fees Policies For Your Institution.'
      );
    }

    const OtherFeesCategoryId = getMetadataValueId(
      metadataValues,
      'OTHER FEES',
      'FEES CATEGORIES'
    );

    const findMandatoryInvoiceTypeId = getMetadataValueId(
      metadataValues,
      'MANDATORY',
      'INVOICE TYPES'
    );

    const findActiveInvoiceStatusId = getMetadataValueId(
      metadataValues,
      'ACTIVE',
      'INVOICE STATUSES'
    );

    const otherFeesAcademicYearFeesPolicy = academicYearFeesPolicies.find(
      (policy) =>
        parseInt(policy.enrollment_status_id, 10) ===
          parseInt(enrollmentRecord.enrollment_status_id, 10) &&
        parseInt(policy.fees_category_id, 10) ===
          parseInt(OtherFeesCategoryId, 10)
    );

    if (!otherFeesAcademicYearFeesPolicy) {
      throw new Error(
        `Unable To Find An Academic Year Fees Policy For The Enrollment Status: ${enrollmentRecord.enrollmentStatus.metadata_value} and Fees Category: Other Fees.`
      );
    }

    /**
     * start if()
     */
    if (
      checkSemesterLoadsAndCourseStatus.checkRetakes === true &&
      checkSemesterLoadsAndCourseStatus.checkMissingPaper === true
    ) {
      if (isEmpty(retakeOtherFeesElements)) {
        throw new Error(
          `Other Fees Policy For Retake Papers Has Not Yet Been Defined.`
        );
      }

      if (isEmpty(missingPaperOtherFeesElements)) {
        throw new Error(
          `Other Fees Policy For Missing Papers Has Not Yet Been Defined.`
        );
      }

      for (const eachObject of arrayOfRetakePaperCourseUnits) {
        const otherFeesInvoice = {
          academic_year_id:
            otherFeesAcademicYearFeesPolicy.bill_by_entry_academic_year === true
              ? studentProgramme.entry_academic_year_id
              : registrationEvent.academic_year_id,
          campus_id: studentProgramme.campus_id,
          intake_id: studentProgramme.intake_id,
          billing_category_id: studentProgramme.billing_category_id,
          fees_waiver_id: studentProgramme.fees_waiver_id,
          other_fees: retakeOtherFeesElements,
        };

        const otherFeesInvoiceHandler = await otherFeesPreviewByContext(
          otherFeesInvoice
        );

        const registrationCourseUnit = {
          registration_id: registrationRecord.id,
          course_unit_id: eachObject.course_unit_id,
          course_unit_status_id: eachObject.course_unit_status_id,
        };

        const registerCourseUnits =
          await registrationService.createCourseUnitsRecords(
            registrationCourseUnit,
            transaction
          );

        if (registerCourseUnits[1] === true) {
          courseUnitsCreated.push(registerCourseUnits);

          const registrationCourseUnitId = registerCourseUnits[0].dataValues.id;

          const enrollmentId = enrollmentRecord.id;
          const otherFeesCategory = eachObject.course_unit_status_id;
          const description = `RETAKE PAPER: ${eachObject.course_unit_code}.`;

          if (eachObject.already_billed !== true) {
            await invoiceService.createOtherFeesInvoiceBasedOnPolicy(
              otherFeesInvoiceHandler,
              enrollmentId,
              studentProgramme.student_id,
              studentProgramme.id,
              otherFeesCategory,
              description,
              findMandatoryInvoiceTypeId,
              findActiveInvoiceStatusId,
              registrationCourseUnitId,
              transaction
            );
          }
        }
      }

      for (const eachObject of arrayOfMissingPaperCourseUnits) {
        const otherFeesInvoice = {
          academic_year_id:
            otherFeesAcademicYearFeesPolicy.bill_by_entry_academic_year === true
              ? studentProgramme.entry_academic_year_id
              : registrationEvent.academic_year_id,
          campus_id: studentProgramme.campus_id,
          intake_id: studentProgramme.intake_id,
          billing_category_id: studentProgramme.billing_category_id,
          fees_waiver_id: studentProgramme.fees_waiver_id,
          other_fees: missingPaperOtherFeesElements,
        };

        const otherFeesInvoiceHandler = await otherFeesPreviewByContext(
          otherFeesInvoice
        );

        const registrationCourseUnit = {
          registration_id: registrationRecord.id,
          course_unit_id: eachObject.course_unit_id,
          course_unit_status_id: eachObject.course_unit_status_id,
        };

        const registerCourseUnits =
          await registrationService.createCourseUnitsRecords(
            registrationCourseUnit,
            transaction
          );

        if (registerCourseUnits[1] === true) {
          courseUnitsCreated.push(registerCourseUnits);

          const registrationCourseUnitId = registerCourseUnits[0].dataValues.id;

          const enrollmentId = enrollmentRecord.id;
          const otherFeesCategory = eachObject.course_unit_status_id;
          const description = `MISSING PAPER: ${eachObject.course_unit_code}.`;

          if (eachObject.already_billed !== true) {
            await invoiceService.createOtherFeesInvoiceBasedOnPolicy(
              otherFeesInvoiceHandler,
              enrollmentId,
              studentProgramme.student_id,
              studentProgramme.id,
              otherFeesCategory,
              description,
              findMandatoryInvoiceTypeId,
              findActiveInvoiceStatusId,
              registrationCourseUnitId,
              transaction
            );
          }
        }
      }
    } else if (checkSemesterLoadsAndCourseStatus.checkRetakes === true) {
      if (isEmpty(retakeOtherFeesElements)) {
        throw new Error(
          `Other Fees Policy For Retake Papers Has Not Yet Been Defined.`
        );
      }

      for (const eachObject of arrayOfRetakePaperCourseUnits) {
        const otherFeesInvoice = {
          academic_year_id:
            otherFeesAcademicYearFeesPolicy.bill_by_entry_academic_year === true
              ? studentProgramme.entry_academic_year_id
              : registrationEvent.academic_year_id,
          campus_id: studentProgramme.campus_id,
          intake_id: studentProgramme.intake_id,
          billing_category_id: studentProgramme.billing_category_id,
          fees_waiver_id: studentProgramme.fees_waiver_id,
          other_fees: retakeOtherFeesElements,
        };

        const otherFeesInvoiceHandler = await otherFeesPreviewByContext(
          otherFeesInvoice
        );

        const registrationCourseUnit = {
          registration_id: registrationRecord.id,
          course_unit_id: eachObject.course_unit_id,
          course_unit_status_id: eachObject.course_unit_status_id,
        };

        const registerCourseUnits =
          await registrationService.createCourseUnitsRecords(
            registrationCourseUnit,
            transaction
          );

        if (registerCourseUnits[1] === true) {
          courseUnitsCreated.push(registerCourseUnits);

          const registrationCourseUnitId = registerCourseUnits[0].dataValues.id;

          const enrollmentId = enrollmentRecord.id;
          const otherFeesCategory = eachObject.course_unit_status_id;
          const description = `RETAKE PAPER: ${eachObject.course_unit_code}.`;

          if (eachObject.already_billed !== true) {
            await invoiceService.createOtherFeesInvoiceBasedOnPolicy(
              otherFeesInvoiceHandler,
              enrollmentId,
              studentProgramme.student_id,
              studentProgramme.id,
              otherFeesCategory,
              description,
              findMandatoryInvoiceTypeId,
              findActiveInvoiceStatusId,
              registrationCourseUnitId,
              transaction
            );
          }
        }
      }
    } else if (checkSemesterLoadsAndCourseStatus.checkMissingPaper === true) {
      if (isEmpty(missingPaperOtherFeesElements)) {
        throw new Error(
          `Other Fees Policy For Missing Papers Has Not Yet Been Defined.`
        );
      }
      for (const eachObject of arrayOfMissingPaperCourseUnits) {
        const otherFeesInvoice = {
          academic_year_id:
            otherFeesAcademicYearFeesPolicy.bill_by_entry_academic_year === true
              ? studentProgramme.entry_academic_year_id
              : registrationEvent.academic_year_id,
          campus_id: studentProgramme.campus_id,
          intake_id: studentProgramme.intake_id,
          billing_category_id: studentProgramme.billing_category_id,
          fees_waiver_id: studentProgramme.fees_waiver_id,
          other_fees: missingPaperOtherFeesElements,
        };

        const otherFeesInvoiceHandler = await otherFeesPreviewByContext(
          otherFeesInvoice
        );

        const registrationCourseUnit = {
          registration_id: registrationRecord.id,
          course_unit_id: eachObject.course_unit_id,
          course_unit_status_id: eachObject.course_unit_status_id,
        };

        const registerCourseUnits =
          await registrationService.createCourseUnitsRecords(
            registrationCourseUnit,
            transaction
          );

        if (registerCourseUnits[1] === true) {
          courseUnitsCreated.push(registerCourseUnits);

          const registrationCourseUnitId = registerCourseUnits[0].dataValues.id;

          const enrollmentId = enrollmentRecord.id;
          const otherFeesCategory = eachObject.course_unit_status_id;
          const description = `MISSING PAPER: ${eachObject.course_unit_code}.`;

          if (eachObject.already_billed !== true) {
            await invoiceService.createOtherFeesInvoiceBasedOnPolicy(
              otherFeesInvoiceHandler,
              enrollmentId,
              studentProgramme.student_id,
              studentProgramme.id,
              otherFeesCategory,
              description,
              findMandatoryInvoiceTypeId,
              findActiveInvoiceStatusId,
              registrationCourseUnitId,
              transaction
            );
          }
        }
      }
    }

    return courseUnitsCreated;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} courseUnits
 * @param {*} enrollmentRecordId
 * @param {*} enrollmentStatusId
 * @param {*} academicYearId
 * @param {*} studentProgramme
 * @param {*} enrollmentStatusValue
 * @param {*} programmeStudyLevelId
 * @param {*} studyYearId
 * @param {*} transaction
 * @returns
 */
const billEnrollmentRetakesAndMissingPaperOtherFees = async function (
  courseUnits,
  enrollmentRecordId,
  enrollmentStatusId,
  academicYearId,
  studentProgramme,
  enrollmentStatusValue,
  programmeStudyLevelId,
  studyYearId,
  transaction
) {
  try {
    let semesterCourseUnits = null;

    const checkSemesterLoadsAndCourseStatus =
      await querySemesterLoadsAndMetadata(studentProgramme, courseUnits);

    if (
      !isEmpty(checkSemesterLoadsAndCourseStatus.programmeBasedSemesterLoad)
    ) {
      if (checkSemesterLoadsAndCourseStatus.checkNormalPaper === true) {
        throw new Error(
          'This Student Cannot Register Normal Papers At This Stage.'
        );
      } else if (
        checkSemesterLoadsAndCourseStatus.checkRetakes === true ||
        checkSemesterLoadsAndCourseStatus.checkMissingPaper === true ||
        (checkSemesterLoadsAndCourseStatus.checkRetakes === true &&
          checkSemesterLoadsAndCourseStatus.checkMissingPaper === true)
      ) {
        semesterCourseUnits =
          await handleProgrammeBasedSemesterLoadsForRetakersAndStayPuters(
            checkSemesterLoadsAndCourseStatus,
            courseUnits
          );
      } else if (
        checkSemesterLoadsAndCourseStatus.checkSupplementaryPaper === true
      ) {
        throw new Error(
          'Policies For Supplementary Paper Are Not Yet Available On This Version Of The System.'
        );
      }
      // End
    } else if (
      !isEmpty(checkSemesterLoadsAndCourseStatus.studyLevelBasedSemesterLoad)
    ) {
      if (checkSemesterLoadsAndCourseStatus.checkNormalPaper === true) {
        throw new Error(
          'This Student Cannot Register Normal Papers At This Stage.'
        );
      } else if (
        checkSemesterLoadsAndCourseStatus.checkRetakes === true ||
        checkSemesterLoadsAndCourseStatus.checkMissingPaper === true ||
        (checkSemesterLoadsAndCourseStatus.checkRetakes === true &&
          checkSemesterLoadsAndCourseStatus.checkMissingPaper === true)
      ) {
        semesterCourseUnits =
          await handleStudyLevelBasedSemesterLoadsForRetakersAndStayPuters(
            checkSemesterLoadsAndCourseStatus,
            courseUnits
          );
      } else if (
        checkSemesterLoadsAndCourseStatus.checkSupplementaryPaper === true
      ) {
        throw new Error(
          'Policies For Supplementary Paper Are Not Yet Available On This Version Of The System.'
        );
      }
      // End
    } else {
      throw new Error(
        "Unable To Find Any Semester Load Properties For This Student's Programme Or Study type."
      );
    }

    const metadataValues = await metadataValueService.findAllMetadataValues({
      include: {
        association: 'metadata',
        attributes: ['id', 'metadata_name'],
      },
      attributes: ['id', 'metadata_value'],
    });

    const findMandatoryInvoiceTypeId = getMetadataValueId(
      metadataValues,
      'MANDATORY',
      'INVOICE TYPES'
    );

    const findActiveInvoiceStatusId = getMetadataValueId(
      metadataValues,
      'ACTIVE',
      'INVOICE STATUSES'
    );

    if (
      enrollmentStatusValue.includes('DOING RETAKES') ||
      enrollmentStatusValue.includes('STAYPUT') ||
      enrollmentStatusValue.includes('AMNESTY')
    ) {
      const checkRetakersFeesPolicy = await retakersFeesPolicyService
        .findOneRecord({
          where: {
            enrollment_status_id: enrollmentStatusId,
            study_level_id: programmeStudyLevelId,
          },
          attributes: [
            'id',
            'enrollment_status_id',
            'study_level_id',
            'use_default_amount',
            'amount',
          ],
          include: [
            {
              association: 'status',
              attributes: ['metadata_value'],
            },
          ],
          nest: true,
        })
        .then(function (res) {
          if (res) {
            const result = res.toJSON();

            return result;
          }
        });

      if (!checkRetakersFeesPolicy) {
        throw new Error(
          `Retakers Fees Policy For This Student's Context Has Not Yet Been Defined.`
        );
      }

      const academicYearFeesPolicies =
        await academicYearFeesPolicyService.findAllRecords({
          attributes: [
            'id',
            'fees_category_id',
            'enrollment_status_id',
            'bill_by_entry_academic_year',
          ],
          raw: true,
        });

      if (isEmpty(academicYearFeesPolicies)) {
        throw new Error(
          'Unable To Find Any Academic Year Fees Policies For Your Institution.'
        );
      }

      const TuitionFeesCategoryId = getMetadataValueId(
        metadataValues,
        'TUITION FEES',
        'FEES CATEGORIES'
      );

      const tuitionAcademicYearFeesPolicy = academicYearFeesPolicies.filter(
        (policy) =>
          parseInt(policy.enrollment_status_id, 10) ===
            parseInt(enrollmentStatusId, 10) &&
          parseInt(policy.fees_category_id, 10) ===
            parseInt(TuitionFeesCategoryId, 10)
      );

      if (isEmpty(tuitionAcademicYearFeesPolicy)) {
        throw new Error(
          `Unable To Find A Tuition Fees Academic Year Fees Policy For The Enrollment Status: ${enrollmentStatusValue}`
        );
      }

      const tuitionInvoice = {
        academic_year_id:
          tuitionAcademicYearFeesPolicy[0].bill_by_entry_academic_year === true
            ? studentProgramme.entry_academic_year_id
            : academicYearId,
        intake_id: studentProgramme.intake_id,
        billing_category_id: studentProgramme.billing_category_id,
        programme_id: studentProgramme.programme_id,
        programme_type_id: studentProgramme.programme_type_id,
        programme_study_year_id: studyYearId,
        campus_id: studentProgramme.campus_id,
      };

      const annualTuition = await annualTuitionByContext(tuitionInvoice);

      const programmeDuration = parseInt(
        studentProgramme.programme.programme_duration,
        10
      );

      const durationMeasure =
        studentProgramme.programme.durationMeasure.metadata_value;

      let graduationLoad = 0;

      if (studentProgramme.programme_version_plan_id) {
        const plan = await programmeVersionService.findOneProgrammeVersionPlan({
          where: {
            id: studentProgramme.programme_version_plan_id,
          },
          attributes: ['id', 'graduation_load'],
          raw: true,
        });

        graduationLoad = parseInt(plan.graduation_load, 10);
      } else {
        const entryYears = [];

        studentProgramme.programmeVersion.versionEntryYears.forEach((year) => {
          entryYears.push({
            entry_year_id: parseInt(year.entry_year_id, 10),
            graduation_load: parseInt(year.graduation_load, 10),
          });
        });

        const checkStudentEntryYear = filter(entryYears, {
          entry_year_id: parseInt(
            studentProgramme.entryStudyYear.programme_study_year_id,
            10
          ),
        });

        if (isEmpty(checkStudentEntryYear))
          throw new Error(
            `This Student's Entry Study Year Does not Match This Programme Version's Entry Years.`
          );

        graduationLoad = checkStudentEntryYear[0].graduation_load;
      }

      if (durationMeasure !== 'YEAR') {
        throw new Error(
          `The Duration Measure of ${durationMeasure} does not have policy yet on this system.`
        );
      }

      const costPerGraduationLoad = Math.floor(
        (programmeDuration * annualTuition) / graduationLoad
      );

      const courseUnitsCreated = [];

      if (!isEmpty(courseUnits)) {
        for (const eachObject of courseUnits) {
          const findCourseUnitStatusName = await getMetadataValueName(
            metadataValues,
            eachObject.course_unit_status_id,
            'REGISTRATION STATUSES'
          );

          const enrollmentCourseUnit = {
            enrollment_id: enrollmentRecordId,
            course_unit_id: eachObject.course_unit_id,
            course_unit_status_id: eachObject.course_unit_status_id,
          };

          const enrollRetakes =
            await enrollmentService.createEnrollmentCourseUnitRecords(
              enrollmentCourseUnit,
              transaction
            );

          if (enrollRetakes[1] === true) {
            if (checkRetakersFeesPolicy.use_default_amount === true) {
              const payload = {
                data: {
                  enrollment_id: enrollmentRecordId,
                  student_id: studentProgramme.student_id,
                  student_programme_id: studentProgramme.id,
                  enrollment_course_unit_id: enrollRetakes[0].dataValues.id,
                  invoice_type_id: findMandatoryInvoiceTypeId,
                  invoice_status_id: findActiveInvoiceStatusId,
                  invoice_amount:
                    costPerGraduationLoad * eachObject.credit_unit,
                  amount_due: costPerGraduationLoad * eachObject.credit_unit,
                  currency: 'UGX',
                  description: `${findCourseUnitStatusName}: ${eachObject.course_unit_code}.`,
                },
              };

              await invoiceService.createRetakersAndStayPutersTuitionInvoiceBasedOnPolicy(
                payload.data,
                transaction
              );
            } else {
              const payload = {
                data: {
                  enrollment_id: enrollmentRecordId,
                  student_id: studentProgramme.student_id,
                  student_programme_id: studentProgramme.id,
                  enrollment_course_unit_id: enrollRetakes[0].dataValues.id,
                  invoice_type_id: findMandatoryInvoiceTypeId,
                  invoice_status_id: findActiveInvoiceStatusId,
                  invoice_amount: checkRetakersFeesPolicy.amount,
                  amount_due: checkRetakersFeesPolicy.amount,
                  currency: 'UGX',
                  description: `${findCourseUnitStatusName}: ${eachObject.course_unit_code}.`,
                },
              };

              await invoiceService.createRetakersAndStayPutersTuitionInvoiceBasedOnPolicy(
                payload.data,
                transaction
              );
            }

            courseUnitsCreated.push(enrollRetakes[0]);
          }
        }
      }

      return courseUnitsCreated;
    } else {
      const queryOtherFeesPolicy = await otherFeesPolicyService.findAllRecords({
        attributes: ['id', 'other_fees_element_id', 'course_unit_status_id'],
        raw: true,
      });

      const checkRetakeOtherFeesPolicy = queryOtherFeesPolicy.find(
        (item) =>
          parseInt(item.course_unit_status_id, 10) ===
          parseInt(checkSemesterLoadsAndCourseStatus.findRetakePaperId, 10)
      );

      const checkMissingPaperOtherFeesPolicy = queryOtherFeesPolicy.find(
        (item) =>
          parseInt(item.course_unit_status_id, 10) ===
          parseInt(checkSemesterLoadsAndCourseStatus.findMissingPaperId, 10)
      );

      const retakeOtherFeesElements = [];
      const missingPaperOtherFeesElements = [];

      if (checkRetakeOtherFeesPolicy) {
        retakeOtherFeesElements.push(
          parseInt(checkRetakeOtherFeesPolicy.other_fees_element_id, 10)
        );
      }

      if (checkMissingPaperOtherFeesPolicy) {
        missingPaperOtherFeesElements.push(
          parseInt(checkMissingPaperOtherFeesPolicy.other_fees_element_id, 10)
        );
      }

      const arrayOfRetakePaperCourseUnits = semesterCourseUnits.filter(
        (item) =>
          parseInt(item.course_unit_status_id, 10) ===
          parseInt(checkSemesterLoadsAndCourseStatus.findRetakePaperId, 10)
      );

      const arrayOfMissingPaperCourseUnits = semesterCourseUnits.filter(
        (item) =>
          parseInt(item.course_unit_status_id, 10) ===
          parseInt(checkSemesterLoadsAndCourseStatus.findMissingPaperId, 10)
      );

      const courseUnitsCreated = [];

      const academicYearFeesPolicies =
        await academicYearFeesPolicyService.findAllRecords({
          attributes: [
            'id',
            'fees_category_id',
            'enrollment_status_id',
            'bill_by_entry_academic_year',
          ],
          raw: true,
        });

      if (isEmpty(academicYearFeesPolicies)) {
        throw new Error(
          'Unable To Find Any Academic Year Fees Policies For Your Institution.'
        );
      }

      const OtherFeesCategoryId = getMetadataValueId(
        metadataValues,
        'OTHER FEES',
        'FEES CATEGORIES'
      );

      const otherFeesAcademicYearFeesPolicy = academicYearFeesPolicies.find(
        (policy) =>
          parseInt(policy.enrollment_status_id, 10) ===
            parseInt(enrollmentStatusId, 10) &&
          parseInt(policy.fees_category_id, 10) ===
            parseInt(OtherFeesCategoryId, 10)
      );

      if (!otherFeesAcademicYearFeesPolicy) {
        throw new Error(
          `Unable To Find An Academic Year Fees Policy For Your Enrollment Status and Other Fees Category.`
        );
      }

      /**
       * start if()
       */
      if (
        checkSemesterLoadsAndCourseStatus.checkRetakes === true &&
        checkSemesterLoadsAndCourseStatus.checkMissingPaper === true
      ) {
        if (isEmpty(retakeOtherFeesElements)) {
          throw new Error(
            `Other Fees Policy For Retake Papers Has Not Yet Been Defined.`
          );
        }

        if (isEmpty(missingPaperOtherFeesElements)) {
          throw new Error(
            `Other Fees Policy For Missing Papers Has Not Yet Been Defined.`
          );
        }

        for (const eachObject of arrayOfRetakePaperCourseUnits) {
          const otherFeesInvoice = {
            academic_year_id:
              otherFeesAcademicYearFeesPolicy.bill_by_entry_academic_year ===
              true
                ? studentProgramme.entry_academic_year_id
                : academicYearId,
            campus_id: studentProgramme.campus_id,
            intake_id: studentProgramme.intake_id,
            billing_category_id: studentProgramme.billing_category_id,
            fees_waiver_id: studentProgramme.fees_waiver_id,
            other_fees: retakeOtherFeesElements,
          };

          const otherFeesInvoiceHandler = await otherFeesPreviewByContext(
            otherFeesInvoice
          );

          const enrollmentCourseUnit = {
            enrollment_id: enrollmentRecordId,
            course_unit_id: eachObject.course_unit_id,
            course_unit_status_id: eachObject.course_unit_status_id,
          };

          const enrollRetakes =
            await enrollmentService.createEnrollmentCourseUnitRecords(
              enrollmentCourseUnit,
              transaction
            );

          if (enrollRetakes[1] === true) {
            courseUnitsCreated.push(enrollRetakes);

            const enrollmentCourseUnitId = enrollRetakes[0].dataValues.id;

            const enrollmentId = enrollmentRecordId;
            const otherFeesCategory = eachObject.course_unit_status_id;
            const description = `RETAKE PAPER: ${eachObject.course_unit_code}.`;

            await invoiceService.createEnrollmentRetakeOtherFeesInvoiceBasedOnPolicy(
              otherFeesInvoiceHandler,
              enrollmentId,
              studentProgramme.student_id,
              studentProgramme.id,
              otherFeesCategory,
              description,
              findMandatoryInvoiceTypeId,
              findActiveInvoiceStatusId,
              enrollmentCourseUnitId,
              transaction
            );
          }
        }

        for (const eachObject of arrayOfMissingPaperCourseUnits) {
          const otherFeesInvoice = {
            academic_year_id:
              otherFeesAcademicYearFeesPolicy.bill_by_entry_academic_year ===
              true
                ? studentProgramme.entry_academic_year_id
                : academicYearId,
            campus_id: studentProgramme.campus_id,
            intake_id: studentProgramme.intake_id,
            billing_category_id: studentProgramme.billing_category_id,
            fees_waiver_id: studentProgramme.fees_waiver_id,
            other_fees: missingPaperOtherFeesElements,
          };

          const otherFeesInvoiceHandler = await otherFeesPreviewByContext(
            otherFeesInvoice
          );

          const enrollmentCourseUnit = {
            enrollment_id: enrollmentRecordId,
            course_unit_id: eachObject.course_unit_id,
            course_unit_status_id: eachObject.course_unit_status_id,
          };

          const enrollRetakes =
            await enrollmentService.createEnrollmentCourseUnitRecords(
              enrollmentCourseUnit,
              transaction
            );

          if (enrollRetakes[1] === true) {
            courseUnitsCreated.push(enrollRetakes);

            const enrollmentCourseUnitId = enrollRetakes[0].dataValues.id;

            const enrollmentId = enrollmentRecordId;
            const otherFeesCategory = eachObject.course_unit_status_id;
            const description = `MISSING PAPER: ${eachObject.course_unit_code}.`;

            await invoiceService.createEnrollmentRetakeOtherFeesInvoiceBasedOnPolicy(
              otherFeesInvoiceHandler,
              enrollmentId,
              studentProgramme.student_id,
              studentProgramme.id,
              otherFeesCategory,
              description,
              findMandatoryInvoiceTypeId,
              findActiveInvoiceStatusId,
              enrollmentCourseUnitId,
              transaction
            );
          }
        }
      } else if (checkSemesterLoadsAndCourseStatus.checkRetakes === true) {
        if (isEmpty(retakeOtherFeesElements)) {
          throw new Error(
            `Other Fees Policy For Retake Papers Has Not Yet Been Defined.`
          );
        }

        for (const eachObject of arrayOfRetakePaperCourseUnits) {
          const otherFeesInvoice = {
            academic_year_id:
              otherFeesAcademicYearFeesPolicy.bill_by_entry_academic_year ===
              true
                ? studentProgramme.entry_academic_year_id
                : academicYearId,
            campus_id: studentProgramme.campus_id,
            intake_id: studentProgramme.intake_id,
            billing_category_id: studentProgramme.billing_category_id,
            fees_waiver_id: studentProgramme.fees_waiver_id,
            other_fees: retakeOtherFeesElements,
          };

          const otherFeesInvoiceHandler = await otherFeesPreviewByContext(
            otherFeesInvoice
          );

          const enrollmentCourseUnit = {
            enrollment_id: enrollmentRecordId,
            course_unit_id: eachObject.course_unit_id,
            course_unit_status_id: eachObject.course_unit_status_id,
          };

          const enrollRetakes =
            await enrollmentService.createEnrollmentCourseUnitRecords(
              enrollmentCourseUnit,
              transaction
            );

          if (enrollRetakes[1] === true) {
            courseUnitsCreated.push(enrollRetakes);

            const enrollmentCourseUnitId = enrollRetakes[0].dataValues.id;

            const enrollmentId = enrollmentRecordId;
            const otherFeesCategory = eachObject.course_unit_status_id;
            const description = `RETAKE PAPER: ${eachObject.course_unit_code}.`;

            await invoiceService.createEnrollmentRetakeOtherFeesInvoiceBasedOnPolicy(
              otherFeesInvoiceHandler,
              enrollmentId,
              studentProgramme.student_id,
              studentProgramme.id,
              otherFeesCategory,
              description,
              findMandatoryInvoiceTypeId,
              findActiveInvoiceStatusId,
              enrollmentCourseUnitId,
              transaction
            );
          }
        }
      } else if (checkSemesterLoadsAndCourseStatus.checkMissingPaper === true) {
        if (isEmpty(missingPaperOtherFeesElements)) {
          throw new Error(
            `Other Fees Policy For Missing Papers Has Not Yet Been Defined.`
          );
        }
        for (const eachObject of arrayOfMissingPaperCourseUnits) {
          const otherFeesInvoice = {
            academic_year_id:
              otherFeesAcademicYearFeesPolicy.bill_by_entry_academic_year ===
              true
                ? studentProgramme.entry_academic_year_id
                : academicYearId,
            campus_id: studentProgramme.campus_id,
            intake_id: studentProgramme.intake_id,
            billing_category_id: studentProgramme.billing_category_id,
            fees_waiver_id: studentProgramme.fees_waiver_id,
            other_fees: missingPaperOtherFeesElements,
          };

          const otherFeesInvoiceHandler = await otherFeesPreviewByContext(
            otherFeesInvoice
          );

          const enrollmentCourseUnit = {
            enrollment_id: enrollmentRecordId,
            course_unit_id: eachObject.course_unit_id,
            course_unit_status_id: eachObject.course_unit_status_id,
          };

          const enrollRetakes =
            await enrollmentService.createEnrollmentCourseUnitRecords(
              enrollmentCourseUnit,
              transaction
            );

          if (enrollRetakes[1] === true) {
            courseUnitsCreated.push(enrollRetakes);

            const enrollmentCourseUnitId = enrollRetakes[0].dataValues.id;

            const enrollmentId = enrollmentRecordId;
            const otherFeesCategory = eachObject.course_unit_status_id;
            const description = `MISSING PAPER: ${eachObject.course_unit_code}.`;

            await invoiceService.createEnrollmentRetakeOtherFeesInvoiceBasedOnPolicy(
              otherFeesInvoiceHandler,
              enrollmentId,
              studentProgramme.student_id,
              studentProgramme.id,
              otherFeesCategory,
              description,
              findMandatoryInvoiceTypeId,
              findActiveInvoiceStatusId,
              enrollmentCourseUnitId,
              transaction
            );
          }
        }
      }

      return courseUnitsCreated;
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} courseUnits
 * @param {*} registrationCourseUnitId
 * @param {*} enrollmentId
 * @param {*} enrollmentStatusId
 * @param {*} academicYearId
 * @param {*} studentProgramme
 * @param {*} enrollmentStatusValue
 * @param {*} programmeStudyLevelId
 * @param {*} studyYearId
 * @param {*} transaction
 * @returns
 */
const billRetakesAndMissingPapersOnRegCourseUnitUpdate = async function (
  courseUnits,
  registrationCourseUnitId,
  enrollmentId,
  enrollmentStatusId,
  academicYearId,
  studentProgramme,
  enrollmentStatusValue,
  programmeStudyLevelId,
  studyYearId,
  transaction
) {
  try {
    const metadataValues = await metadataValueService.findAllMetadataValues({
      include: {
        association: 'metadata',
        attributes: ['id', 'metadata_name'],
      },
      attributes: ['id', 'metadata_value'],
    });

    const findMandatoryInvoiceTypeId = getMetadataValueId(
      metadataValues,
      'MANDATORY',
      'INVOICE TYPES'
    );

    const findActiveInvoiceStatusId = getMetadataValueId(
      metadataValues,
      'ACTIVE',
      'INVOICE STATUSES'
    );

    const findRetakePaperId = getMetadataValueId(
      metadataValues,
      'RETAKE PAPER',
      'REGISTRATION STATUSES'
    );

    const findMissingPaperId = getMetadataValueId(
      metadataValues,
      'MISSING PAPER',
      'REGISTRATION STATUSES'
    );

    if (
      enrollmentStatusValue.includes('DOING RETAKES') ||
      enrollmentStatusValue.includes('STAYPUT') ||
      enrollmentStatusValue.includes('AMNESTY')
    ) {
      const checkRetakersFeesPolicy = await retakersFeesPolicyService
        .findOneRecord({
          where: {
            enrollment_status_id: enrollmentStatusId,
            study_level_id: programmeStudyLevelId,
          },
          attributes: [
            'id',
            'enrollment_status_id',
            'study_level_id',
            'use_default_amount',
            'amount',
          ],
          include: [
            {
              association: 'status',
              attributes: ['metadata_value'],
            },
          ],
          nest: true,
        })
        .then(function (res) {
          if (res) {
            const result = res.toJSON();

            return result;
          }
        });

      if (!checkRetakersFeesPolicy) {
        throw new Error(
          `Retakers Fees Policy For This Student's Context Has Not Yet Been Defined.`
        );
      }

      const academicYearFeesPolicies =
        await academicYearFeesPolicyService.findAllRecords({
          attributes: [
            'id',
            'fees_category_id',
            'enrollment_status_id',
            'bill_by_entry_academic_year',
          ],
          raw: true,
        });

      if (isEmpty(academicYearFeesPolicies)) {
        throw new Error(
          'Unable To Find Any Academic Year Fees Policies For Your Institution.'
        );
      }

      const TuitionFeesCategoryId = getMetadataValueId(
        metadataValues,
        'TUITION FEES',
        'FEES CATEGORIES'
      );

      const tuitionAcademicYearFeesPolicy = academicYearFeesPolicies.filter(
        (policy) =>
          parseInt(policy.enrollment_status_id, 10) ===
            parseInt(enrollmentStatusId, 10) &&
          parseInt(policy.fees_category_id, 10) ===
            parseInt(TuitionFeesCategoryId, 10)
      );

      if (isEmpty(tuitionAcademicYearFeesPolicy)) {
        throw new Error(
          `Unable To Find A Tuition Fees Academic Year Fees Policy For The Enrollment Status: ${enrollmentStatusValue}`
        );
      }

      const tuitionInvoice = {
        academic_year_id:
          tuitionAcademicYearFeesPolicy[0].bill_by_entry_academic_year === true
            ? studentProgramme.entry_academic_year_id
            : academicYearId,
        intake_id: studentProgramme.intake_id,
        billing_category_id: studentProgramme.billing_category_id,
        programme_id: studentProgramme.programme_id,
        programme_type_id: studentProgramme.programme_type_id,
        programme_study_year_id: studyYearId,
        campus_id: studentProgramme.campus_id,
      };

      const annualTuition = await annualTuitionByContext(tuitionInvoice);

      const programmeDuration = parseInt(
        studentProgramme.programme.programme_duration,
        10
      );

      const durationMeasure =
        studentProgramme.programme.durationMeasure.metadata_value;

      let graduationLoad = 0;

      if (studentProgramme.programme_version_plan_id) {
        const plan = await programmeVersionService.findOneProgrammeVersionPlan({
          where: {
            id: studentProgramme.programme_version_plan_id,
          },
          attributes: ['id', 'graduation_load'],
          raw: true,
        });

        graduationLoad = parseInt(plan.graduation_load, 10);
      } else {
        const entryYears = [];

        studentProgramme.programmeVersion.versionEntryYears.forEach((year) => {
          entryYears.push({
            entry_year_id: parseInt(year.entry_year_id, 10),
            graduation_load: parseInt(year.graduation_load, 10),
          });
        });

        const checkStudentEntryYear = filter(entryYears, {
          entry_year_id: parseInt(
            studentProgramme.entryStudyYear.programme_study_year_id,
            10
          ),
        });

        if (isEmpty(checkStudentEntryYear))
          throw new Error(
            `This Student's Entry Study Year Does not Match This Programme Version's Entry Years.`
          );

        graduationLoad = checkStudentEntryYear[0].graduation_load;
      }

      if (durationMeasure !== 'YEAR') {
        throw new Error(
          `The Duration Measure of ${durationMeasure} does not have policy yet on this system.`
        );
      }

      const costPerGraduationLoad = Math.floor(
        (programmeDuration * annualTuition) / graduationLoad
      );

      const courseUnitsCreated = [];

      if (!isEmpty(courseUnits)) {
        for (const eachObject of courseUnits) {
          const findCourseUnitStatusName = await getMetadataValueName(
            metadataValues,
            eachObject.course_unit_status_id,
            'REGISTRATION STATUSES'
          );

          if (checkRetakersFeesPolicy.use_default_amount === true) {
            const payload = {
              data: {
                enrollment_id: enrollmentId,
                student_id: studentProgramme.student_id,
                student_programme_id: studentProgramme.id,
                registration_course_unit_id: registrationCourseUnitId,
                invoice_type_id: findMandatoryInvoiceTypeId,
                invoice_status_id: findActiveInvoiceStatusId,
                invoice_amount: costPerGraduationLoad * eachObject.credit_unit,
                amount_due: costPerGraduationLoad * eachObject.credit_unit,
                currency: 'UGX',
                description: `${findCourseUnitStatusName}: ${eachObject.course_unit_code}.`,
              },
            };

            await invoiceService.createRetakersAndStayPutersTuitionInvoiceBasedOnPolicy(
              payload.data,
              transaction
            );
          } else {
            const payload = {
              data: {
                enrollment_id: enrollmentId,
                student_id: studentProgramme.student_id,
                student_programme_id: studentProgramme.id,
                registration_course_unit_id: registrationCourseUnitId,
                invoice_type_id: findMandatoryInvoiceTypeId,
                invoice_status_id: findActiveInvoiceStatusId,
                invoice_amount: checkRetakersFeesPolicy.amount,
                amount_due: checkRetakersFeesPolicy.amount,
                currency: 'UGX',
                description: `${findCourseUnitStatusName}: ${eachObject.course_unit_code}.`,
              },
            };

            await invoiceService.createRetakersAndStayPutersTuitionInvoiceBasedOnPolicy(
              payload.data,
              transaction
            );
          }

          courseUnitsCreated.push(registrationCourseUnitId);
        }
      }

      return courseUnitsCreated;
    } else {
      const queryOtherFeesPolicy = await otherFeesPolicyService.findAllRecords({
        attributes: ['id', 'other_fees_element_id', 'course_unit_status_id'],
        raw: true,
      });

      const checkRetakeOtherFeesPolicy = queryOtherFeesPolicy.find(
        (item) =>
          parseInt(item.course_unit_status_id, 10) ===
          parseInt(findRetakePaperId, 10)
      );

      const checkMissingPaperOtherFeesPolicy = queryOtherFeesPolicy.find(
        (item) =>
          parseInt(item.course_unit_status_id, 10) ===
          parseInt(findMissingPaperId, 10)
      );

      const retakeOtherFeesElements = [];
      const missingPaperOtherFeesElements = [];

      if (checkRetakeOtherFeesPolicy) {
        retakeOtherFeesElements.push(
          parseInt(checkRetakeOtherFeesPolicy.other_fees_element_id, 10)
        );
      }

      if (checkMissingPaperOtherFeesPolicy) {
        missingPaperOtherFeesElements.push(
          parseInt(checkMissingPaperOtherFeesPolicy.other_fees_element_id, 10)
        );
      }

      const arrayOfRetakePaperCourseUnits = courseUnits.filter(
        (item) =>
          parseInt(item.course_unit_status_id, 10) ===
          parseInt(findRetakePaperId, 10)
      );

      const arrayOfMissingPaperCourseUnits = courseUnits.filter(
        (item) =>
          parseInt(item.course_unit_status_id, 10) ===
          parseInt(findMissingPaperId, 10)
      );

      const courseUnitsCreated = [];

      const academicYearFeesPolicies =
        await academicYearFeesPolicyService.findAllRecords({
          attributes: [
            'id',
            'fees_category_id',
            'enrollment_status_id',
            'bill_by_entry_academic_year',
          ],
          raw: true,
        });

      if (isEmpty(academicYearFeesPolicies)) {
        throw new Error(
          'Unable To Find Any Academic Year Fees Policies For Your Institution.'
        );
      }

      const OtherFeesCategoryId = getMetadataValueId(
        metadataValues,
        'OTHER FEES',
        'FEES CATEGORIES'
      );

      const otherFeesAcademicYearFeesPolicy = academicYearFeesPolicies.find(
        (policy) =>
          parseInt(policy.enrollment_status_id, 10) ===
            parseInt(enrollmentStatusId, 10) &&
          parseInt(policy.fees_category_id, 10) ===
            parseInt(OtherFeesCategoryId, 10)
      );

      if (!otherFeesAcademicYearFeesPolicy) {
        throw new Error(
          `Unable To Find An Academic Year Fees Policy For Your Enrollment Status and Other Fees Category.`
        );
      }

      /**
       * start if()
       */
      if (
        !isEmpty(arrayOfRetakePaperCourseUnits) &&
        !isEmpty(arrayOfMissingPaperCourseUnits)
      ) {
        if (isEmpty(retakeOtherFeesElements)) {
          throw new Error(
            `Other Fees Policy For Retake Papers Has Not Yet Been Defined.`
          );
        }

        if (isEmpty(missingPaperOtherFeesElements)) {
          throw new Error(
            `Other Fees Policy For Missing Papers Has Not Yet Been Defined.`
          );
        }

        for (const eachObject of arrayOfRetakePaperCourseUnits) {
          const otherFeesInvoice = {
            academic_year_id:
              otherFeesAcademicYearFeesPolicy.bill_by_entry_academic_year ===
              true
                ? studentProgramme.entry_academic_year_id
                : academicYearId,
            campus_id: studentProgramme.campus_id,
            intake_id: studentProgramme.intake_id,
            billing_category_id: studentProgramme.billing_category_id,
            fees_waiver_id: studentProgramme.fees_waiver_id,
            other_fees: retakeOtherFeesElements,
          };

          const otherFeesInvoiceHandler = await otherFeesPreviewByContext(
            otherFeesInvoice
          );

          courseUnitsCreated.push(registrationCourseUnitId);

          const otherFeesCategory = eachObject.course_unit_status_id;
          const description = `RETAKE PAPER: ${eachObject.course_unit_code}.`;

          await invoiceService.createOtherFeesInvoiceBasedOnPolicy(
            otherFeesInvoiceHandler,
            enrollmentId,
            studentProgramme.student_id,
            studentProgramme.id,
            otherFeesCategory,
            description,
            findMandatoryInvoiceTypeId,
            findActiveInvoiceStatusId,
            registrationCourseUnitId,
            transaction
          );
        }

        for (const eachObject of arrayOfMissingPaperCourseUnits) {
          const otherFeesInvoice = {
            academic_year_id:
              otherFeesAcademicYearFeesPolicy.bill_by_entry_academic_year ===
              true
                ? studentProgramme.entry_academic_year_id
                : academicYearId,
            campus_id: studentProgramme.campus_id,
            intake_id: studentProgramme.intake_id,
            billing_category_id: studentProgramme.billing_category_id,
            fees_waiver_id: studentProgramme.fees_waiver_id,
            other_fees: missingPaperOtherFeesElements,
          };

          const otherFeesInvoiceHandler = await otherFeesPreviewByContext(
            otherFeesInvoice
          );

          courseUnitsCreated.push(registrationCourseUnitId);

          const otherFeesCategory = eachObject.course_unit_status_id;
          const description = `MISSING PAPER: ${eachObject.course_unit_code}.`;

          await invoiceService.createOtherFeesInvoiceBasedOnPolicy(
            otherFeesInvoiceHandler,
            enrollmentId,
            studentProgramme.student_id,
            studentProgramme.id,
            otherFeesCategory,
            description,
            findMandatoryInvoiceTypeId,
            findActiveInvoiceStatusId,
            registrationCourseUnitId,
            transaction
          );
        }
      } else if (!isEmpty(arrayOfRetakePaperCourseUnits)) {
        for (const eachObject of arrayOfRetakePaperCourseUnits) {
          const otherFeesInvoice = {
            academic_year_id:
              otherFeesAcademicYearFeesPolicy.bill_by_entry_academic_year ===
              true
                ? studentProgramme.entry_academic_year_id
                : academicYearId,
            campus_id: studentProgramme.campus_id,
            intake_id: studentProgramme.intake_id,
            billing_category_id: studentProgramme.billing_category_id,
            fees_waiver_id: studentProgramme.fees_waiver_id,
            other_fees: retakeOtherFeesElements,
          };

          const otherFeesInvoiceHandler = await otherFeesPreviewByContext(
            otherFeesInvoice
          );

          courseUnitsCreated.push(registrationCourseUnitId);

          const otherFeesCategory = eachObject.course_unit_status_id;
          const description = `RETAKE PAPER: ${eachObject.course_unit_code}.`;

          await invoiceService.createOtherFeesInvoiceBasedOnPolicy(
            otherFeesInvoiceHandler,
            enrollmentId,
            studentProgramme.student_id,
            studentProgramme.id,
            otherFeesCategory,
            description,
            findMandatoryInvoiceTypeId,
            findActiveInvoiceStatusId,
            registrationCourseUnitId,
            transaction
          );
        }
      } else if (!isEmpty(arrayOfMissingPaperCourseUnits)) {
        for (const eachObject of arrayOfMissingPaperCourseUnits) {
          const otherFeesInvoice = {
            academic_year_id:
              otherFeesAcademicYearFeesPolicy.bill_by_entry_academic_year ===
              true
                ? studentProgramme.entry_academic_year_id
                : academicYearId,
            campus_id: studentProgramme.campus_id,
            intake_id: studentProgramme.intake_id,
            billing_category_id: studentProgramme.billing_category_id,
            fees_waiver_id: studentProgramme.fees_waiver_id,
            other_fees: missingPaperOtherFeesElements,
          };

          const otherFeesInvoiceHandler = await otherFeesPreviewByContext(
            otherFeesInvoice
          );

          courseUnitsCreated.push(registrationCourseUnitId);

          const otherFeesCategory = eachObject.course_unit_status_id;
          const description = `MISSING PAPER: ${eachObject.course_unit_code}.`;

          await invoiceService.createOtherFeesInvoiceBasedOnPolicy(
            otherFeesInvoiceHandler,
            enrollmentId,
            studentProgramme.student_id,
            studentProgramme.id,
            otherFeesCategory,
            description,
            findMandatoryInvoiceTypeId,
            findActiveInvoiceStatusId,
            registrationCourseUnitId,
            transaction
          );
        }
      }

      return courseUnitsCreated;
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} checkSemesterLoadsAndCourseStatus
 * @param {*} semesterCourseUnits
 */
const handleProgrammeBasedSemesterLoadsForRetakersAndStayPuters = function (
  checkSemesterLoadsAndCourseStatus,
  semesterCourseUnits
) {
  const totalCreditUnits = sumBy(semesterCourseUnits, 'credit_unit');

  const semesterLoad =
    checkSemesterLoadsAndCourseStatus.programmeBasedSemesterLoad;

  let overallMaximumLoad = 0;

  overallMaximumLoad = semesterLoad.overall_maximum_load;

  if (totalCreditUnits <= overallMaximumLoad) {
    return semesterCourseUnits;
  } else {
    throw new Error(`Total Credit Units Must Less Than ${overallMaximumLoad}.`);
  }
};

/**
 *
 * @param {*} checkSemesterLoadsAndCourseStatus
 * @param {*} semesterCourseUnits
 */
const handleStudyLevelBasedSemesterLoadsForRetakersAndStayPuters = function (
  checkSemesterLoadsAndCourseStatus,
  semesterCourseUnits
) {
  const totalCreditUnits = sumBy(semesterCourseUnits, 'credit_unit');

  const semesterLoad =
    checkSemesterLoadsAndCourseStatus.studyLevelBasedSemesterLoad;

  let overallMaximumLoad = 0;

  overallMaximumLoad = semesterLoad.overall_maximum_load;

  if (totalCreditUnits <= overallMaximumLoad) {
    return semesterCourseUnits;
  } else {
    throw new Error(`Total Credit Units Must Less Than ${overallMaximumLoad}.`);
  }
};

/**
 *
 * @param {*} enrollmentStatusId
 * @param {*} studentProgrammeId
 */
const checkDocumentVerificationPolicy = async (
  enrollmentStatusId,
  studentProgrammeId
) => {
  try {
    const findPolicy = await documentVerificationPolicyService.findOneRecord({
      where: {
        enrollment_status_id: enrollmentStatusId,
      },
      attributes: ['id', 'enrollment_status_id', 'is_active'],
      raw: true,
    });

    if (findPolicy) {
      if (findPolicy.is_active === true) {
        const studentProgramme = await studentService.findOneStudentProgramme({
          where: {
            id: studentProgrammeId,
          },
          attributes: [
            'id',
            'student_id',
            'documents_verified',
            'document_verification_date',
            'documents_verified_by_id',
          ],
          raw: true,
        });

        if (!studentProgramme) {
          throw new Error('Unable To Find The Academic Record.');
        }

        if (studentProgramme.documents_verified === false) {
          throw new Error(
            `Student's Academic Records Need To Be Verified By The Academic Registrar Before Proceeding With Registration.`
          );
        }
      }
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} studentProgramme
 * @param {*} academicYearVal
 * @param {*} academicYearMetadataValueId
 * @param {*} semesterVal
 * @param {*} semesterMetadataValueId
 * @param {*} programmeStudyYearId
 * @param {*} enrollmentStatusVal
 * @returns
 */
const checkPreviousEnrollmentRecords = async (
  studentProgramme,
  academicYearVal,
  academicYearMetadataValueId,
  semesterVal,
  semesterMetadataValueId,
  programmeStudyYearId,
  enrollmentStatusVal
) => {
  try {
    const metadataValues = await metadataValueService.findAllMetadataValues({
      include: {
        association: 'metadata',
        attributes: ['id', 'metadata_name'],
      },
      attributes: ['id', 'metadata_value'],
    });

    const findStudyYear = studentProgramme.programme.programmeStudyYears.find(
      (value) => parseInt(value.id, 10) === parseInt(programmeStudyYearId, 10)
    );

    if (!findStudyYear) {
      throw new Error(
        `The Study Year Chosen Doesn't Belong To The Programme's Study Years.`
      );
    }

    let previousSemesterId = null;

    let previousAcademicYearId = null;

    let previousStudyYearId = null;

    let semesterErrorMsg = null;

    let academicYearErrorMsg = null;

    let studyYearErrorMsg = null;

    if (trim(toUpper(semesterVal)) === 'SEMESTER I') {
      if (
        trim(toUpper(enrollmentStatusVal)) !== 'FRESHER' &&
        trim(toUpper(findStudyYear.programme_study_years)) !== 'YEAR 1'
      ) {
        previousAcademicYearId = getMetadataValueId(
          metadataValues,
          trim(
            `${parseInt(trim(academicYearVal).split('/')[0], 10) - 1}/${
              parseInt(trim(academicYearVal).split('/')[1], 10) - 1
            }`
          ),
          'ACADEMIC YEARS'
        );

        previousSemesterId = getMetadataValueId(
          metadataValues,
          'SEMESTER II',
          'SEMESTERS'
        );

        previousStudyYearId = getMetadataValueId(
          metadataValues,
          `YEAR ${
            parseInt(
              trim(
                toUpper(findStudyYear.programme_study_years).replace('YEAR', '')
              ),
              10
            ) - 1
          }`,
          'STUDY YEARS'
        );

        academicYearErrorMsg = trim(
          `${parseInt(trim(academicYearVal).split('/')[0], 10) - 1}/${
            parseInt(trim(academicYearVal).split('/')[1], 10) - 1
          }`
        );

        semesterErrorMsg = 'SEMESTER II';

        studyYearErrorMsg = `YEAR ${
          parseInt(
            trim(
              toUpper(findStudyYear.programme_study_years).replace('YEAR', '')
            ),
            10
          ) - 1
        }`;
      } else {
        previousAcademicYearId = academicYearMetadataValueId;
        previousSemesterId = semesterMetadataValueId;
        previousStudyYearId = getMetadataValueId(
          metadataValues,
          trim(toUpper(findStudyYear.programme_study_years)),
          'STUDY YEARS'
        );

        academicYearErrorMsg = academicYearVal;

        semesterErrorMsg = semesterVal;

        studyYearErrorMsg = trim(toUpper(findStudyYear.programme_study_years));
      }
    } else if (trim(toUpper(semesterVal)) === 'SEMESTER II') {
      previousAcademicYearId = academicYearMetadataValueId;

      previousSemesterId = getMetadataValueId(
        metadataValues,
        'SEMESTER I',
        'SEMESTERS'
      );

      previousStudyYearId = getMetadataValueId(
        metadataValues,
        trim(toUpper(findStudyYear.programme_study_years)),
        'STUDY YEARS'
      );

      academicYearErrorMsg = academicYearVal;

      semesterErrorMsg = 'SEMESTER I';

      studyYearErrorMsg = trim(toUpper(findStudyYear.programme_study_years));
    }

    if (
      trim(toUpper(enrollmentStatusVal)).includes('FRESH') ||
      trim(toUpper(enrollmentStatusVal)).includes('CONTINUING') ||
      trim(toUpper(enrollmentStatusVal)).includes('FINAL')
    ) {
      if (previousAcademicYearId && previousSemesterId && previousStudyYearId) {
        const findPastEnrollmentInMigratedRecords =
          await previousTransactionsService.findOnePreviousEnrollmentRecord({
            where: {
              student_programme_id: studentProgramme.id,
              academic_year_id: previousAcademicYearId,
              semester_id: previousSemesterId,
              study_year_id: previousStudyYearId,
            },
            raw: true,
          });

        const findPresentEnrollmentInMigratedRecords =
          await previousTransactionsService.findOnePreviousEnrollmentRecord({
            where: {
              student_programme_id: studentProgramme.id,
              academic_year_id: academicYearMetadataValueId,
              semester_id: semesterMetadataValueId,
              study_year_id: findStudyYear.programme_study_year_id,
            },
            raw: true,
          });

        if (findPastEnrollmentInMigratedRecords) {
          if (
            findPastEnrollmentInMigratedRecords.enrollment_token ||
            findPastEnrollmentInMigratedRecords.enrollment_status ||
            findPastEnrollmentInMigratedRecords.enrollment_date
          ) {
            return findPastEnrollmentInMigratedRecords;
          }
        } else if (findPresentEnrollmentInMigratedRecords) {
          if (
            findPresentEnrollmentInMigratedRecords.enrollment_token ||
            findPresentEnrollmentInMigratedRecords.enrollment_status ||
            findPresentEnrollmentInMigratedRecords.enrollment_date
          ) {
            return findPresentEnrollmentInMigratedRecords;
          }
        } else {
          const findAcademicYear = await academicYearService
            .findOneAcademicYear({
              where: {
                academic_year_id: previousAcademicYearId,
              },
              include: [
                {
                  association: 'academicYear',
                  attributes: ['id', 'metadata_value'],
                },
                {
                  association: 'semesters',
                  attributes: ['id', 'semester_id', 'academic_year_id'],
                  include: [
                    {
                      association: 'semester',
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

          if (!findAcademicYear) {
            throw new Error(
              `Unable To Find An Academic Year: ${academicYearErrorMsg} while searching for the student's enrollment history.`
            );
          }

          const semesterContext = findAcademicYear.semesters.find(
            (value) =>
              parseInt(value.semester.id, 10) ===
              parseInt(previousSemesterId, 10)
          );

          if (!semesterContext) {
            throw new Error(
              `Unable To Find A Semester Matching The Student's Previous Semester Record.`
            );
          }

          const enrollmentEvent =
            await eventService.findLateEnrollmentAndRegistrationEventsFunction(
              studentProgramme.campus_id,
              studentProgramme.intake_id,
              studentProgramme.entry_academic_year_id,
              "'ENROLLMENT'",
              "'KEY EVENT'",
              findAcademicYear.id,
              semesterContext.id
            );

          if (!enrollmentEvent) {
            throw new Error(
              `Unable To Find A Previous Enrollment Event Matching The Student's Context In Academic Year: ${findAcademicYear.academicYear.metadata_value}, Semester: ${semesterContext.semester.metadata_value}.`
            );
          }

          const studyYearContext =
            studentProgramme.programme.programmeStudyYears.find(
              (value) =>
                parseInt(value.programme_study_year_id, 10) ===
                parseInt(previousStudyYearId, 10)
            );

          if (!studyYearContext) {
            throw new Error(
              `The Student's Previous Study Year Doesn't Match Any Of Their Programme's Study Years.`
            );
          }

          const studentEnrollment = await enrollmentService.findOneRecord({
            where: {
              event_id: enrollmentEvent.id,
              student_programme_id: studentProgramme.id,
              study_year_id: studyYearContext.id,
              is_active: true,
            },
            attributes: ['id'],
            raw: true,
          });

          if (!studentEnrollment) {
            throw new Error(
              `Unable To Find Any Previous Enrollment Record For Academic Year: ${academicYearErrorMsg}, Semester: ${semesterErrorMsg} and Study Year: ${studyYearErrorMsg} For The Student.`
            );
          } else {
            return studentEnrollment;
          }
        }
      }
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} studentProgramme
 * @param {*} academicYearVal
 * @param {*} academicYearMetadataValueId
 * @param {*} semesterVal
 * @param {*} semesterMetadataValueId
 * @param {*} programmeStudyYearId
 * @param {*} enrollmentStatusVal
 * @returns
 */
const checkPreviousRegistrationRecords = async (
  studentProgramme,
  academicYearVal,
  academicYearMetadataValueId,
  semesterVal,
  semesterMetadataValueId,
  programmeStudyYearId,
  enrollmentStatusVal
) => {
  try {
    const metadataValues = await metadataValueService.findAllMetadataValues({
      include: {
        association: 'metadata',
        attributes: ['id', 'metadata_name'],
      },
      attributes: ['id', 'metadata_value'],
    });

    const findStudyYear = studentProgramme.programme.programmeStudyYears.find(
      (value) => parseInt(value.id, 10) === parseInt(programmeStudyYearId, 10)
    );

    if (!findStudyYear) {
      throw new Error(
        `The Study Year Chosen Doesn't Belong To The Programme's Study Years.`
      );
    }

    let previousSemesterId = null;

    let previousAcademicYearId = null;

    let previousStudyYearId = null;

    let semesterErrorMsg = null;

    let academicYearErrorMsg = null;

    let studyYearErrorMsg = null;

    if (trim(toUpper(semesterVal)) === 'SEMESTER I') {
      if (
        trim(toUpper(enrollmentStatusVal)) !== 'FRESHER' &&
        trim(toUpper(findStudyYear.programme_study_years)) !== 'YEAR 1'
      ) {
        previousAcademicYearId = getMetadataValueId(
          metadataValues,
          trim(
            `${parseInt(trim(academicYearVal).split('/')[0], 10) - 1}/${
              parseInt(trim(academicYearVal).split('/')[1], 10) - 1
            }`
          ),
          'ACADEMIC YEARS'
        );

        previousSemesterId = getMetadataValueId(
          metadataValues,
          'SEMESTER II',
          'SEMESTERS'
        );

        previousStudyYearId = getMetadataValueId(
          metadataValues,
          `YEAR ${
            parseInt(
              trim(
                toUpper(findStudyYear.programme_study_years).replace('YEAR', '')
              ),
              10
            ) - 1
          }`,
          'STUDY YEARS'
        );

        academicYearErrorMsg = trim(
          `${parseInt(trim(academicYearVal).split('/')[0], 10) - 1}/${
            parseInt(trim(academicYearVal).split('/')[1], 10) - 1
          }`
        );

        semesterErrorMsg = 'SEMESTER II';

        studyYearErrorMsg = `YEAR ${
          parseInt(
            trim(
              toUpper(findStudyYear.programme_study_years).replace('YEAR', '')
            ),
            10
          ) - 1
        }`;
      } else {
        previousAcademicYearId = academicYearMetadataValueId;
        previousSemesterId = semesterMetadataValueId;
        previousStudyYearId = getMetadataValueId(
          metadataValues,
          trim(toUpper(findStudyYear.programme_study_years)),
          'STUDY YEARS'
        );

        academicYearErrorMsg = academicYearVal;

        semesterErrorMsg = semesterVal;

        studyYearErrorMsg = trim(toUpper(findStudyYear.programme_study_years));
      }
    } else if (trim(toUpper(semesterVal)) === 'SEMESTER II') {
      previousAcademicYearId = academicYearMetadataValueId;

      previousSemesterId = getMetadataValueId(
        metadataValues,
        'SEMESTER I',
        'SEMESTERS'
      );

      previousStudyYearId = getMetadataValueId(
        metadataValues,
        trim(toUpper(findStudyYear.programme_study_years)),
        'STUDY YEARS'
      );

      academicYearErrorMsg = academicYearVal;

      semesterErrorMsg = 'SEMESTER I';

      studyYearErrorMsg = trim(toUpper(findStudyYear.programme_study_years));
    }

    if (
      trim(toUpper(enrollmentStatusVal)).includes('FRESH') ||
      trim(toUpper(enrollmentStatusVal)).includes('CONTINUING') ||
      trim(toUpper(enrollmentStatusVal)).includes('FINAL')
    ) {
      if (previousAcademicYearId && previousSemesterId && previousStudyYearId) {
        const findPastRegistrationInMigratedRecords =
          await previousTransactionsService.findOnePreviousEnrollmentRecord({
            where: {
              student_programme_id: studentProgramme.id,
              academic_year_id: previousAcademicYearId,
              semester_id: previousSemesterId,
              study_year_id: previousStudyYearId,
            },
            raw: true,
          });

        const findPresentRegistrationInMigratedRecords =
          await previousTransactionsService.findOnePreviousEnrollmentRecord({
            where: {
              student_programme_id: studentProgramme.id,
              academic_year_id: academicYearMetadataValueId,
              semester_id: semesterMetadataValueId,
              study_year_id: findStudyYear.programme_study_year_id,
            },
            raw: true,
          });

        if (findPastRegistrationInMigratedRecords) {
          if (
            findPastRegistrationInMigratedRecords.registration_token ||
            findPastRegistrationInMigratedRecords.registration_status ||
            findPastRegistrationInMigratedRecords.registration_date
          ) {
            return findPastRegistrationInMigratedRecords;
          }
        } else if (findPresentRegistrationInMigratedRecords) {
          if (
            findPresentRegistrationInMigratedRecords.registration_token ||
            findPresentRegistrationInMigratedRecords.registration_status ||
            findPresentRegistrationInMigratedRecords.registration_date
          ) {
            return findPresentRegistrationInMigratedRecords;
          }
        } else {
          const findAcademicYear = await academicYearService
            .findOneAcademicYear({
              where: {
                academic_year_id: previousAcademicYearId,
              },
              include: [
                {
                  association: 'academicYear',
                  attributes: ['id', 'metadata_value'],
                },
                {
                  association: 'semesters',
                  attributes: ['id', 'semester_id', 'academic_year_id'],
                  include: [
                    {
                      association: 'semester',
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

          if (!findAcademicYear) {
            throw new Error(
              `Unable To Find An Academic Year: ${academicYearErrorMsg} while searching for the student's registration history.`
            );
          }

          const semesterContext = findAcademicYear.semesters.find(
            (value) =>
              parseInt(value.semester.id, 10) ===
              parseInt(previousSemesterId, 10)
          );

          if (!semesterContext) {
            throw new Error(
              `Unable To Find A Semester Matching The Student's Previous Semester Record.`
            );
          }

          let registrationEvent =
            await eventService.findLateEnrollmentAndRegistrationEventsFunction(
              studentProgramme.campus_id,
              studentProgramme.intake_id,
              studentProgramme.entry_academic_year_id,
              "'REGISTRATION'",
              "'KEY EVENT'",
              findAcademicYear.id,
              semesterContext.id
            );

          if (!registrationEvent) {
            const registrationEventId = getMetadataValueId(
              metadataValues,
              'REGISTRATION',
              'KEY EVENTS'
            );

            const allRegistrationEvents = await eventService
              .findAllEvents({
                where: {
                  semester_id: semesterContext.id,
                  academic_year_id: findAcademicYear.id,
                  event_type: 'KEY EVENT',
                  event_id: registrationEventId,
                },
                include: [
                  {
                    association: 'eventIntakes',
                  },
                  {
                    association: 'eventCampuses',
                  },
                  {
                    association: 'eventEntryAcademicYears',
                  },
                ],
              })
              .then((res) => {
                if (res) {
                  return res.map((item) => item.get({ plain: true }));
                }
              });

            if (!isEmpty(allRegistrationEvents)) {
              allRegistrationEvents.forEach((event) => {
                const findIntake = event.eventIntakes.find(
                  (intake) =>
                    parseInt(intake.intake_id, 10) ===
                    parseInt(studentProgramme.intake_id, 10)
                );

                const findCampus = event.eventCampuses.find(
                  (campus) =>
                    parseInt(campus.campus_id, 10) ===
                    parseInt(studentProgramme.campus_id, 10)
                );

                if (findIntake && findCampus) {
                  registrationEvent = event;
                }
              });
            }

            if (!registrationEvent) {
              throw new Error(
                `Unable To Find A Previous Registration Event Matching The Student's Context In Academic Year: ${findAcademicYear.academicYear.metadata_value}, Semester: ${semesterContext.semester.metadata_value}.`
              );
            }
          }

          const studentRegistration = await registrationService.findOneRecord({
            where: {
              event_id: registrationEvent.id,
              student_programme_id: studentProgramme.id,
              is_active: true,
            },
            attributes: ['id'],
            raw: true,
          });

          if (!studentRegistration) {
            throw new Error(
              `Unable To Find Any Previous Registration Record For  Academic Year: ${academicYearErrorMsg}, Semester: ${semesterErrorMsg} and Study Year: ${studyYearErrorMsg} For The Student.`
            );
          } else {
            return studentRegistration;
          }
        }
      }
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} studentProgramme
 * @param {*} programmeStudyYearId
 */
const checkEnrollmentStudyYear = (
  studentProgramme,
  programmeStudyYearId,
  enrollmentStatusValue,
  semesterValue
) => {
  try {
    const enrollmentStudyYear =
      studentProgramme.programme.programmeStudyYears.find(
        (value) => parseInt(value.id, 10) === parseInt(programmeStudyYearId, 10)
      );

    if (!enrollmentStudyYear) {
      throw new Error(
        `The Study Year Chosen Doesn't Belong To The Programme's Study Years.`
      );
    }

    const numericalEntryStudyYear = parseInt(
      trim(
        toUpper(studentProgramme.entryStudyYear.programme_study_years).replace(
          'YEAR',
          ''
        )
      ),
      10
    );

    const numericalUnOrderedStudyYears = [];

    studentProgramme.programme.programmeStudyYears.forEach((studyYear) => {
      numericalUnOrderedStudyYears.push(
        parseInt(
          trim(toUpper(studyYear.programme_study_years).replace('YEAR', '')),
          10
        )
      );
    });

    let numericalOrderedStudyYears = numericalUnOrderedStudyYears.sort(
      (a, b) => {
        return a - b;
      }
    );

    numericalOrderedStudyYears = numericalOrderedStudyYears.filter(
      (item) => item >= numericalEntryStudyYear
    );

    const lengthOfStudyYears = numericalOrderedStudyYears.length;

    let findEnrollmentStudyYear =
      studentProgramme.programme.programmeStudyYears.find(
        (value) => parseInt(value.id, 10) === parseInt(programmeStudyYearId, 10)
      );

    findEnrollmentStudyYear = parseInt(
      trim(
        toUpper(findEnrollmentStudyYear.programme_study_years).replace(
          'YEAR',
          ''
        )
      ),
      10
    );

    if (trim(enrollmentStatusValue) === 'FRESHER') {
      if (trim(semesterValue) === 'SEMESTER I') {
        if (findEnrollmentStudyYear !== numericalOrderedStudyYears[0]) {
          throw new Error(
            `You can only enroll as a FRESHER in YEAR ${numericalOrderedStudyYears[0]}, ${semesterValue}`
          );
        }
      } else {
        throw new Error(
          `You can only enroll as a FRESHER in YEAR ${numericalOrderedStudyYears[0]}, SEMESTER I`
        );
      }
    } else if (trim(enrollmentStatusValue) === 'CONTINUING STUDENT') {
      if (
        findEnrollmentStudyYear ===
        numericalOrderedStudyYears[lengthOfStudyYears - 1]
      ) {
        throw new Error(
          `You cannot enroll as a CONTINUING STUDENT for your programme in YEAR ${
            numericalOrderedStudyYears[lengthOfStudyYears - 1]
          }`
        );
      } else if (findEnrollmentStudyYear === numericalOrderedStudyYears[0]) {
        if (trim(semesterValue) !== 'SEMESTER II') {
          throw new Error(
            `You can only enroll as a CONTINUING STUDENT for your programme in YEAR ${numericalOrderedStudyYears[0]}, SEMESTER II BUT NOT ${semesterValue}`
          );
        }
      }
    } else if (trim(enrollmentStatusValue) === 'FINALIST') {
      if (
        findEnrollmentStudyYear !==
        numericalOrderedStudyYears[lengthOfStudyYears - 1]
      ) {
        throw new Error(
          `You can only enroll as a FINALIST in YEAR ${
            numericalOrderedStudyYears[lengthOfStudyYears - 1]
          }`
        );
      }
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  checkRegistrationPolicyConstraint,
  retakersRegistrationPolicyConstraint,
  continuingAndFinalistSemesterLoadsConstraint,
  continuingAndFinalistSemesterLoadsWithoutInsertion,
  retakersFeesPolicyConstraint,
  freshersSemesterLoadsConstraint,
  lateEnrollmentAndRegistrationSurchargeConstraint,
  retakersSemesterLoadsConstraint,
  updateRegisteredCourseUnitsForContinuingAndFinalists,
  checkDocumentVerificationPolicy,
  checkPreviousEnrollmentRecords,
  checkPreviousRegistrationRecords,
  checkEnrollmentStudyYear,
  billEnrollmentRetakesAndMissingPaperOtherFees,
  billRetakesAndMissingPapersOnRegCourseUnitUpdate,
  examinationCardConstraints,
  graduateFeesPolicyConstraint,
};
