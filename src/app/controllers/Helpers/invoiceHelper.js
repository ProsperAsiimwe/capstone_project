const {
  invoiceService,
  metadataValueService,
  paymentTransactionService,
  paymentReferenceService,
  enrollmentService,
  eventService,
  registrationService,
  studentService,
  graduationFeesService,
  graduationListService,
  feesElementService,
} = require('@services/index');

const { isEmpty, sumBy, toUpper } = require('lodash');
const { Op } = require('sequelize');
const model = require('@models');
const moment = require('moment');
const { getMetadataValueId } = require('@controllers/Helpers/programmeHelper');
const { generateSystemReference } = require('./paymentReferenceHelper');
const { paymentTransactionAllocation } = require('./paymentTransactionHelper');
const { generateLateFeePaymentInvoice } = require('./enrollmentRecord');
const { feesItemAllocation } = require('./paymentReferenceRecord');
const { handleFeesElementAllocation } = require('./paymentTransactionHelper');

/**
 *
 * @param {*} payload
 * @param {*} invoiceId
 * @param {*} findStudent
 * @param {*} transaction
 * @returns
 */
const allocateMoneyToAnInvoice = async function (
  payload,
  invoiceId,
  findStudent,
  transaction
) {
  try {
    const updatedTransactions = [];

    let newInvoiceAmountPaid = 0;

    let response = {};

    const findStudentProgramme = await studentService
      .findOneStudentProgramme({
        where: {
          student_id: findStudent.id,
          is_current_programme: true,
        },
        include: [
          {
            association: 'student',
            attributes: ['id', 'surname', 'other_names'],
          },
        ],
        nest: true,
      })
      .then((res) => {
        if (res) {
          return res.toJSON();
        }
      });

    if (!findStudentProgramme) {
      throw new Error(`Current Student Academic Record Doesn't Exist.`);
    }

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

    const studentPaymentTransactions =
      await paymentTransactionService.findAllRecordsWithModels({
        where: {
          student_id: findStudent.id,
          create_approval_status: 'APPROVED',
        },
        raw: true,
      });

    let findPaymentReference = null;

    let checkValue = null;

    if (!isEmpty(payload.payment_transactions)) {
      for (const eachTransaction of payload.payment_transactions) {
        checkValue = studentPaymentTransactions.find(
          (transaction) =>
            parseInt(transaction.id, 10) === parseInt(eachTransaction.id, 10)
        );

        if (!checkValue) {
          throw new Error(
            `Payment Transaction contributing ${eachTransaction.amount} cannot be found.`
          );
        }

        if (
          parseFloat(eachTransaction.amount, 10) >
          parseFloat(checkValue.unallocated_amount, 10)
        ) {
          throw new Error(
            `Payment Transaction contributing ${eachTransaction.amount} does not have enough unallocated funds.`
          );
        }

        const newUnallocated =
          parseFloat(checkValue.unallocated_amount) -
          parseFloat(eachTransaction.amount);

        const newAllocated =
          parseFloat(checkValue.allocated_amount) +
          parseFloat(eachTransaction.amount);

        const newTransactionData = {
          unallocated_amount: newUnallocated,
          allocated_amount: newAllocated,
        };

        const update = await paymentTransactionService.updateRecord(
          checkValue.id,
          newTransactionData,
          transaction
        );

        updatedTransactions.push(update);

        findPaymentReference =
          await paymentReferenceService.findOnePaymentReference({
            where: {
              [Op.or]: [
                { ura_prn: checkValue.ura_prn },
                { system_prn: checkValue.system_prn },
              ],
            },
            raw: true,
          });
      }

      newInvoiceAmountPaid = sumBy(payload.payment_transactions, 'amount');
    }

    if (payload.invoice_number.includes('T-INV')) {
      response = await handleTuitionInvoices(
        invoiceId,
        payload.invoice_number,
        findStudent.id,
        newInvoiceAmountPaid,
        findActiveInvoiceStatusId,
        payload.payment_transactions,
        findStudentProgramme,
        transaction,
        metadataValues
      );
    } else if (payload.invoice_number.includes('F-INV')) {
      response = await handleFunctionalInvoices(
        invoiceId,
        payload.invoice_number,
        findStudent.id,
        newInvoiceAmountPaid,
        findActiveInvoiceStatusId,
        payload.payment_transactions,
        findStudentProgramme,
        transaction
      );
    } else if (payload.invoice_number.includes('O-INV')) {
      response = await handleOtherFeesInvoices(
        invoiceId,
        payload.invoice_number,
        findStudent.id,
        newInvoiceAmountPaid,
        findActiveInvoiceStatusId,
        payload.payment_transactions,
        transaction
      );
    } else if (payload.invoice_number.includes('M-INV')) {
      response = await handleManualInvoices(
        invoiceId,
        payload.invoice_number,
        findStudent.id,
        newInvoiceAmountPaid,
        findActiveInvoiceStatusId,
        payload.payment_transactions,
        transaction
      );
    } else if (payload.invoice_number.includes('G-INV')) {
      response = await handleGraduationInvoices(
        invoiceId,
        payload.invoice_number,
        findStudent.id,
        newInvoiceAmountPaid,
        findActiveInvoiceStatusId,
        payload.payment_transactions,
        transaction
      );
    } else {
      throw new Error(
        'The invoice number provided does not match any recognized invoice number formats of the system.'
      );
    }

    await handleFeesElementAllocation(
      response.feesElementAllocationData,
      findPaymentReference,
      checkValue,
      findStudentProgramme,
      newInvoiceAmountPaid,
      findStudentProgramme.student.id,
      transaction
    );

    return response.updated;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} payload
 * @param {*} findPaymentTransaction
 * @param {*} totalInvoiceAmount
 * @param {*} findStudent
 * @param {*} transaction
 * @returns
 */
const allocateMoneyToAnInvoicesByStudent = async function (
  payload,
  findPaymentTransaction,
  totalInvoiceAmount,
  findStudent,
  transaction
) {
  try {
    let response = {};

    const findStudentProgramme = await studentService.findOneStudentProgramme({
      where: {
        student_id: findStudent.id,
        is_current_programme: true,
      },
      raw: true,
    });

    if (!findStudentProgramme) {
      throw new Error(`Current Student Academic Record Doesn't Exist.`);
    }

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

    payload.payment_transactions = [
      {
        id: findPaymentTransaction.id,
      },
    ];

    if (payload.invoice_number.includes('T-INV')) {
      response = await handleTuitionInvoices(
        payload.invoice_id,
        payload.invoice_number,
        findStudent.id,
        payload.amount,
        findActiveInvoiceStatusId,
        payload.payment_transactions,
        findStudentProgramme,
        transaction,
        metadataValues
      );
    } else if (payload.invoice_number.includes('F-INV')) {
      response = await handleFunctionalInvoices(
        payload.invoice_id,
        payload.invoice_number,
        findStudent.id,
        payload.amount,
        findActiveInvoiceStatusId,
        payload.payment_transactions,
        findStudentProgramme,
        transaction
      );
    } else if (payload.invoice_number.includes('O-INV')) {
      response = await handleOtherFeesInvoices(
        payload.invoice_id,
        payload.invoice_number,
        findStudent.id,
        payload.amount,
        findActiveInvoiceStatusId,
        payload.payment_transactions,
        transaction
      );
    } else if (payload.invoice_number.includes('M-INV')) {
      response = await handleManualInvoices(
        payload.invoice_id,
        payload.invoice_number,
        findStudent.id,
        payload.amount,
        findActiveInvoiceStatusId,
        payload.payment_transactions,
        transaction
      );
    } else {
      throw new Error(
        'The invoice number provided does not match any recognized invoice number formats of the system.'
      );
    }

    const newUnallocated =
      parseFloat(findPaymentTransaction.unallocated_amount) -
      parseFloat(totalInvoiceAmount);

    const newAllocated =
      parseFloat(findPaymentTransaction.allocated_amount) +
      parseFloat(totalInvoiceAmount);

    const newTransactionData = {
      unallocated_amount: newUnallocated,
      allocated_amount: newAllocated,
    };

    await paymentTransactionService.updateRecord(
      findPaymentTransaction.id,
      newTransactionData,
      transaction
    );

    const findPaymentReference =
      await paymentReferenceService.findOnePaymentReference({
        where: {
          [Op.or]: [
            { ura_prn: findPaymentTransaction.ura_prn },
            { system_prn: findPaymentTransaction.system_prn },
          ],
        },
        raw: true,
      });

    await handleFeesElementAllocation(
      response.feesElementAllocationData,
      findPaymentReference,
      findPaymentTransaction,
      findStudentProgramme,
      payload.amount,
      findStudentProgramme.student.id,
      transaction
    );

    return response.updated;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} invoiceId
 * @param {*} invoiceNumber
 * @param {*} studentId
 * @param {*} newInvoiceAmountPaid
 * @param {*} findActiveInvoiceStatusId
 * @param {*} paymentTransactions
 * @param {*} findStudentProgramme
 * @param {*} transaction
 * @param {*} metadataValues
 * @returns
 */
const handleTuitionInvoices = async function (
  invoiceId,
  invoiceNumber,
  studentId,
  newInvoiceAmountPaid,
  findActiveInvoiceStatusId,
  paymentTransactions,
  findStudentProgramme,
  transaction,
  metadataValues
) {
  try {
    const feesElementAllocationData = [];

    const findInvoice = await invoiceService
      .findOneTuitionInvoiceRecord({
        where: {
          id: invoiceId,
          invoice_number: invoiceNumber,
          student_id: studentId,
          invoice_status_id: findActiveInvoiceStatusId,
        },
        attributes: [
          'id',
          'student_id',
          'student_programme_id',
          'enrollment_id',
          'invoice_amount',
          'amount_paid',
          'amount_due',
          'percentage_completion',
          'invoice_number',
        ],
        include: [
          {
            association: 'tuitionInvoiceFeesElement',
            attributes: [
              'id',
              'tuition_invoice_id',
              'fees_element_id',
              'amount',
              'new_amount',
              'amount_paid',
              'cleared',
            ],
          },
          {
            association: 'enrollment',
            attributes: ['id', 'enrollment_status_id'],
            include: [
              {
                association: 'studyYear',
                attributes: ['id', 'programme_study_year_id'],
              },
              {
                association: 'event',
                attributes: ['id', 'academic_year_id', 'semester_id'],
                include: [
                  {
                    association: 'academicYear',
                    attributes: ['id', 'academic_year_id'],
                  },
                  {
                    association: 'semester',
                    attributes: ['id', 'semester_id'],
                  },
                ],
              },
            ],
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

    if (!findInvoice) {
      throw new Error(
        'The invoice you are trying to offset is either invalid or does not exist.'
      );
    }

    if (findInvoice.amount_due <= 0) {
      throw new Error(
        'The invoice you are trying to offset has no amount due.'
      );
    }
    const newAmountPaid =
      parseFloat(findInvoice.amount_paid) + parseFloat(newInvoiceAmountPaid);

    const newAmountDue =
      parseFloat(findInvoice.amount_due) - parseFloat(newInvoiceAmountPaid);

    const newPercentageCompletion = Math.floor(
      (newAmountPaid / parseFloat(findInvoice.invoice_amount)) * 100
    );

    const newInvoiceData = {
      amount_paid: newAmountPaid,
      amount_due: newAmountDue,
      percentage_completion: newPercentageCompletion,
    };

    // moment(paymentTransaction.payment_date).format('YYYY-MM-DD')

    if (isEmpty(findInvoice.tuitionInvoiceFeesElement)) {
      const TuitionFeesCategoryId = getMetadataValueId(
        metadataValues,
        'TUITION FEES',
        'FEES CATEGORIES'
      );

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

      const tuitionInvoiceFeesElement = {
        tuition_invoice_id: findInvoice.id,
        fees_element_id: findTuitionFeesElement.id,
        fees_element_code: findTuitionFeesElement.fees_element_code,
        fees_element_name: findTuitionFeesElement.fees_element_name,
        fees_element_category: 'TUITION FEES',
        paid_when: 'EveryAcademicYear/EverySemester',
        currency: 'UGX',
        amount: findInvoice.invoice_amount,
      };

      const create = await invoiceService.createTuitionInvoiceElement(
        tuitionInvoiceFeesElement,
        transaction
      );

      if (create) {
        throw new Error('Please Try Again !');
      } else {
        throw new Error(
          'Unable To Create Tuition Invoice Evelement Record For This Invoice'
        );
      }
    }

    const category = { category: 'tuition' };

    const tuitionItemAmount = feesItemAllocation(
      category,
      findInvoice,
      parseFloat(newInvoiceAmountPaid)
    );

    if (tuitionItemAmount) {
      tuitionItemAmount.tuitionInvoiceFeesElement.forEach((element) => {
        feesElementAllocationData.push({
          fees_element_id: element.fees_element_id,
          amount: element.item_amount,
          invoice_number: tuitionItemAmount.invoice_number,
          student_id: tuitionItemAmount.student_id,
          student_programme_id: tuitionItemAmount.student_programme_id,
          academic_year_id:
            tuitionItemAmount.enrollment.event.academicYear.academic_year_id,
          semester_id: tuitionItemAmount.enrollment.event.semester.semester_id,
          study_year_id:
            tuitionItemAmount.enrollment.studyYear.programme_study_year_id,
          update_at: moment.now(),
        });
      });
    }

    const update = await invoiceService.updateEnrollmentTuitionInvoice(
      invoiceId,
      newInvoiceData,
      transaction
    );

    if (!isEmpty(paymentTransactions)) {
      for (const obj of paymentTransactions) {
        await paymentTransactionAllocation(
          obj.id,
          invoiceId,
          'tuitionInvoice',
          parseFloat(newInvoiceAmountPaid),
          transaction
        );
      }
    }

    const invoice = update[1][0];

    await generateLateFeePaymentInvoice(
      findInvoice.enrollment_id,
      findInvoice.enrollment.enrollment_status_id,
      findStudentProgramme,
      transaction
    );

    return {
      updated: invoice,
      feesElementAllocationData: feesElementAllocationData,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} invoiceId
 * @param {*} invoiceNumber
 * @param {*} studentId
 * @param {*} newInvoiceAmountPaid
 * @param {*} findActiveInvoiceStatusId
 * @param {*} paymentTransactions
 * @param {*} findStudentProgramme
 * @param {*} transaction
 * @returns
 */
const handleFunctionalInvoices = async function (
  invoiceId,
  invoiceNumber,
  studentId,
  newInvoiceAmountPaid,
  findActiveInvoiceStatusId,
  paymentTransactions,
  findStudentProgramme,
  transaction
) {
  try {
    const feesElementAllocationData = [];

    const findInvoice = await invoiceService
      .findOneFunctionalInvoiceRecord({
        where: {
          id: invoiceId,
          invoice_number: invoiceNumber,
          student_id: studentId,
          invoice_status_id: findActiveInvoiceStatusId,
        },
        include: [
          {
            association: 'functionalElements',
            attributes: ['id', 'fees_element_id', 'amount', 'new_amount'],
          },
          {
            association: 'enrollment',
            attributes: ['id', 'enrollment_status_id'],
            include: [
              {
                association: 'studyYear',
                attributes: ['id', 'programme_study_year_id'],
              },
              {
                association: 'event',
                attributes: ['id', 'academic_year_id', 'semester_id'],
                include: [
                  {
                    association: 'academicYear',
                    attributes: ['id', 'academic_year_id'],
                  },
                  {
                    association: 'semester',
                    attributes: ['id', 'semester_id'],
                  },
                ],
              },
            ],
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

    if (!findInvoice) {
      throw new Error(
        'The invoice you are trying to offset is either invalid or does not exist.'
      );
    }
    if (findInvoice.amount_due <= 0) {
      throw new Error(
        'The invoice you are trying to offset has no amount due.'
      );
    }
    const newAmountPaid =
      parseFloat(findInvoice.amount_paid) + parseFloat(newInvoiceAmountPaid);

    const newAmountDue =
      parseFloat(findInvoice.amount_due) - parseFloat(newInvoiceAmountPaid);

    const newPercentageCompletion = Math.floor(
      (newAmountPaid / parseFloat(findInvoice.invoice_amount)) * 100
    );

    const newInvoiceData = {
      amount_paid: newAmountPaid,
      amount_due: newAmountDue,
      percentage_completion: newPercentageCompletion,
    };

    const category = { category: 'functional' };

    const functionalItemAmount = feesItemAllocation(
      category,
      findInvoice,
      parseFloat(newInvoiceAmountPaid)
    );

    if (functionalItemAmount) {
      functionalItemAmount.functionalElements.forEach((element) => {
        feesElementAllocationData.push({
          fees_element_id: element.fees_element_id,
          amount: element.item_amount,
          student_id: functionalItemAmount.student_id,
          student_programme_id: functionalItemAmount.student_programme_id,
          invoice_number: functionalItemAmount.invoice_number,
          academic_year_id:
            functionalItemAmount.enrollment.event.academicYear.academic_year_id,
          semester_id:
            functionalItemAmount.enrollment.event.semester.semester_id,
          study_year_id:
            functionalItemAmount.enrollment.studyYear.programme_study_year_id,
        });
      });
    }

    const update = await invoiceService.updateEnrollmentFunctionalInvoice(
      invoiceId,
      newInvoiceData,
      transaction
    );

    if (!isEmpty(paymentTransactions)) {
      for (const obj of paymentTransactions) {
        await paymentTransactionAllocation(
          obj.id,
          invoiceId,
          'functionalFeesInvoice',
          parseFloat(newInvoiceAmountPaid),
          transaction
        );
      }
    }

    const invoice = update[1][0];

    await generateLateFeePaymentInvoice(
      findInvoice.enrollment_id,
      findInvoice.enrollment.enrollment_status_id,
      findStudentProgramme,
      transaction
    );

    return {
      updated: invoice,
      feesElementAllocationData: feesElementAllocationData,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} invoiceId
 * @param {*} invoiceNumber
 * @param {*} studentId
 * @param {*} newInvoiceAmountPaid
 * @param {*} findActiveInvoiceStatusId
 * @param {*} paymentTransactions
 * @param {*} transaction
 * @returns
 */
const handleOtherFeesInvoices = async function (
  invoiceId,
  invoiceNumber,
  studentId,
  newInvoiceAmountPaid,
  findActiveInvoiceStatusId,
  paymentTransactions,
  transaction
) {
  try {
    const feesElementAllocationData = [];

    const findInvoice = await invoiceService
      .findOneOtherFeesInvoiceRecords({
        where: {
          id: invoiceId,
          invoice_number: invoiceNumber,
          student_id: studentId,
          invoice_status_id: findActiveInvoiceStatusId,
        },
        include: [
          {
            association: 'enrollment',
            attributes: ['id', 'enrollment_status_id'],
            include: [
              {
                association: 'studyYear',
                attributes: ['id', 'programme_study_year_id'],
              },
              {
                association: 'event',
                attributes: ['id', 'academic_year_id', 'semester_id'],
                include: [
                  {
                    association: 'academicYear',
                    attributes: ['id', 'academic_year_id'],
                  },
                  {
                    association: 'semester',
                    attributes: ['id', 'semester_id'],
                  },
                ],
              },
            ],
          },
          {
            association: 'otherFeesInvoiceFeesElements',
            attributes: ['id', 'fees_element_id', 'amount', 'new_amount'],
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

    if (!findInvoice) {
      throw new Error(
        'The invoice you are trying to offset is either invalid or does not exist.'
      );
    }
    if (findInvoice.amount_due <= 0) {
      throw new Error(
        'The invoice you are trying to offset has no amount due.'
      );
    }
    const newAmountPaid =
      parseFloat(findInvoice.amount_paid) + parseFloat(newInvoiceAmountPaid);

    const newAmountDue =
      parseFloat(findInvoice.amount_due) - parseFloat(newInvoiceAmountPaid);

    const newPercentageCompletion = Math.floor(
      (newAmountPaid / parseFloat(findInvoice.invoice_amount)) * 100
    );

    const newInvoiceData = {
      amount_paid: newAmountPaid,
      amount_due: newAmountDue,
      percentage_completion: newPercentageCompletion,
    };

    const category = { category: 'other' };

    const otherItemAmount = feesItemAllocation(
      category,
      findInvoice,
      parseFloat(newInvoiceAmountPaid)
    );

    if (otherItemAmount) {
      otherItemAmount.otherFeesInvoiceFeesElements.forEach((element) => {
        feesElementAllocationData.push({
          fees_element_id: element.fees_element_id,
          amount: element.item_amount,
          student_id: otherItemAmount.student_id,
          student_programme_id: otherItemAmount.student_programme_id,
          invoice_number: otherItemAmount.invoice_number,
          academic_year_id:
            otherItemAmount.enrollment.event.academicYear.academic_year_id,
          semester_id: otherItemAmount.enrollment.event.semester.semester_id,
          study_year_id:
            otherItemAmount.enrollment.studyYear.programme_study_year_id,
        });
      });
    }

    const update = await invoiceService.updateEnrollmentOtherFeesInvoice(
      invoiceId,
      newInvoiceData,
      transaction
    );

    if (!isEmpty(paymentTransactions)) {
      for (const obj of paymentTransactions) {
        await paymentTransactionAllocation(
          obj.id,
          invoiceId,
          'otherFeesInvoice',
          parseFloat(newInvoiceAmountPaid),
          transaction
        );
      }
    }

    const invoice = update[1][0];

    return {
      updated: invoice,
      feesElementAllocationData: feesElementAllocationData,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} invoiceId
 * @param {*} invoiceNumber
 * @param {*} studentId
 * @param {*} newInvoiceAmountPaid
 * @param {*} findActiveInvoiceStatusId
 * @param {*} paymentTransactions
 * @param {*} transaction
 * @returns
 */
const handleManualInvoices = async function (
  invoiceId,
  invoiceNumber,
  studentId,
  newInvoiceAmountPaid,
  findActiveInvoiceStatusId,
  paymentTransactions,
  transaction
) {
  try {
    const feesElementAllocationData = [];

    const findInvoice = await invoiceService
      .findOneManualInvoiceRecord({
        where: {
          id: invoiceId,
          invoice_number: invoiceNumber,
          student_id: studentId,
          invoice_status_id: findActiveInvoiceStatusId,
        },
        include: [
          {
            association: 'academicYear',
            attributes: ['id', 'academic_year_id'],
          },
          {
            association: 'semester',
            attributes: ['id', 'semester_id'],
          },
          {
            association: 'studyYear',
            attributes: ['id', 'programme_study_year_id'],
          },
          {
            association: 'elements',
            attributes: ['id', 'fees_element_id', 'amount'],
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

    if (!findInvoice) {
      throw new Error(
        'The invoice you are trying to offset is either invalid or does not exist.'
      );
    }
    if (findInvoice.amount_due <= 0) {
      throw new Error(
        'The invoice you are trying to offset has no amount due.'
      );
    }
    const newAmountPaid =
      parseFloat(findInvoice.amount_paid) + parseFloat(newInvoiceAmountPaid);

    const newAmountDue =
      parseFloat(findInvoice.amount_due) - parseFloat(newInvoiceAmountPaid);

    const newPercentageCompletion = Math.floor(
      (newAmountPaid / parseFloat(findInvoice.invoice_amount)) * 100
    );

    const newInvoiceData = {
      amount_paid: newAmountPaid,
      amount_due: newAmountDue,
      percentage_completion: newPercentageCompletion,
    };

    const category = { category: 'manual' };

    const manualItemAmount = feesItemAllocation(
      category,
      findInvoice,
      parseFloat(newInvoiceAmountPaid)
    );

    if (manualItemAmount) {
      manualItemAmount.elements.forEach((element) => {
        feesElementAllocationData.push({
          fees_element_id: element.fees_element_id,
          amount: element.item_amount,
          student_id: manualItemAmount.student_id,
          student_programme_id: manualItemAmount.student_programme_id,
          invoice_number: manualItemAmount.invoice_number,
          academic_year_id: manualItemAmount.academicYear.academic_year_id,
          semester_id: manualItemAmount.semester.semester_id,
          study_year_id: manualItemAmount.studyYear.programme_study_year_id,
        });
      });
    }

    const update = await invoiceService.updateEnrollmentManualInvoice(
      invoiceId,
      newInvoiceData,
      transaction
    );

    if (!isEmpty(paymentTransactions)) {
      for (const obj of paymentTransactions) {
        await paymentTransactionAllocation(
          obj.id,
          invoiceId,
          'manualInvoice',
          parseFloat(newInvoiceAmountPaid),
          transaction
        );
      }
    }

    const invoice = update[1][0];

    return {
      updated: invoice,
      feesElementAllocationData: feesElementAllocationData,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} invoiceId
 * @param {*} invoiceNumber
 * @param {*} studentId
 * @param {*} newInvoiceAmountPaid
 * @param {*} findActiveInvoiceStatusId
 * @param {*} paymentTransactions
 * @param {*} transaction
 * @returns
 */
const handleGraduationInvoices = async function (
  invoiceId,
  invoiceNumber,
  studentId,
  newInvoiceAmountPaid,
  findActiveInvoiceStatusId,
  paymentTransactions,
  transaction
) {
  try {
    const feesElementAllocationData = [];

    const findInvoice = await graduationFeesService
      .findOneGraduationFeesInvoice({
        where: {
          id: invoiceId,
          invoice_number: invoiceNumber,
          student_id: studentId,
          invoice_status_id: findActiveInvoiceStatusId,
        },
        include: [
          {
            association: 'gradList',
            include: [
              {
                association: 'provisional',
                attributes: ['id', 'academic_year_id'],
              },
            ],
          },
          {
            association: 'stdProg',
            attributes: ['id', 'current_semester_id', 'current_study_year_id'],
            include: [
              {
                association: 'currentStudyYear',
                attributes: ['id', 'programme_study_year_id'],
              },
            ],
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

    if (!findInvoice) {
      throw new Error(
        'The invoice you are trying to offset is either invalid or does not exist.'
      );
    }
    if (findInvoice.amount_due <= 0) {
      throw new Error(
        'The invoice you are trying to offset has no amount due.'
      );
    }

    if (
      parseFloat(findInvoice.amount_due) !== parseFloat(newInvoiceAmountPaid)
    ) {
      throw new Error('This Invoice Requires Payment Of The Exact Amount Due.');
    }

    const newAmountPaid =
      parseFloat(findInvoice.amount_paid) + parseFloat(newInvoiceAmountPaid);

    const newAmountDue =
      parseFloat(findInvoice.amount_due) - parseFloat(newInvoiceAmountPaid);

    const newPercentageCompletion = Math.floor(
      (newAmountPaid / parseFloat(findInvoice.invoice_amount)) * 100
    );

    const newInvoiceData = {
      amount_paid: newAmountPaid,
      amount_due: newAmountDue,
      percentage_completion: newPercentageCompletion,
    };

    const category = { category: 'graduation' };

    const graduationItemAmount = feesItemAllocation(
      category,
      findInvoice,
      parseFloat(newInvoiceAmountPaid)
    );

    if (graduationItemAmount) {
      graduationItemAmount.graduationInvoiceFeesElement.forEach((element) => {
        feesElementAllocationData.push({
          fees_element_id: element.fees_element_id,
          amount: element.item_amount,
          student_id: graduationItemAmount.student_id,
          student_programme_id: graduationItemAmount.student_programme_id,
          invoice_number: graduationItemAmount.invoice_number,
          academic_year_id:
            graduationItemAmount.gradList.provisional.academic_year_id,
          semester_id: graduationItemAmount.stdProg.current_semester_id,
          study_year_id:
            graduationItemAmount.stdProg.currentStudyYear
              .programme_study_year_id,
        });
      });
    }

    const update = await graduationFeesService.updateGraduationFeesInvoice(
      invoiceId,
      newInvoiceData,
      transaction
    );

    if (!isEmpty(paymentTransactions)) {
      for (const obj of paymentTransactions) {
        await paymentTransactionAllocation(
          obj.id,
          invoiceId,
          'graduationInvoice',
          parseFloat(newInvoiceAmountPaid),
          transaction
        );
      }
    }

    const invoice = update[1][0];

    await graduationListService.updateFinalGraduationList(
      findInvoice.grad_list_id,
      { has_paid: true },
      transaction
    );

    return {
      updated: invoice,
      feesElementAllocationData: feesElementAllocationData,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * invoiceMetadataProperties
 */
// const invoiceMetadataProperties = async function () {
//   const queryAllMetadata = await metadataService.findAllMetadata({
//     attributes: ['id', 'metadata_name'],
//     raw: true,
//   });

//   const queryAllMetadataValues = await metadataValueService.findAllMetadataValues(
//     {
//       attributes: ['id', 'metadata_id', 'metadata_value'],
//       raw: true,
//     }
//   );

//   const invoiceTypeMetadataName = filter(queryAllMetadata, {
//     metadata_name: 'INVOICE TYPES',
//   });

//   if (isEmpty(invoiceTypeMetadataName)) {
//     throw new Error('There is No Metadata of type INVOICE TYPES.');
//   }

//   const invoiceStatusMetadataName = filter(queryAllMetadata, {
//     metadata_name: 'INVOICE STATUSES',
//   });

//   if (isEmpty(invoiceStatusMetadataName)) {
//     throw new Error('There is No Metadata of type INVOICE STATUSES.');
//   }

//   const findMandatoryInvoiceType = filter(queryAllMetadataValues, {
//     metadata_value: 'MANDATORY',
//     metadata_id: invoiceTypeMetadataName[0].id,
//   });

//   if (isEmpty(findMandatoryInvoiceType)) {
//     throw new Error(
//       'There is No Metadata value with the name MANDATORY of type INVOICE TYPES.'
//     );
//   }

//   const findOptionalInvoiceType = filter(queryAllMetadataValues, {
//     metadata_value: 'OPTIONAL',
//     metadata_id: invoiceTypeMetadataName[0].id,
//   });

//   if (isEmpty(findOptionalInvoiceType)) {
//     throw new Error(
//       'There is No Metadata value with the name OPTIONAL of type INVOICE TYPES.'
//     );
//   }

//   const findActiveInvoiceStatus = filter(queryAllMetadataValues, {
//     metadata_value: 'ACTIVE',
//     metadata_id: invoiceStatusMetadataName[0].id,
//   });

//   if (isEmpty(findActiveInvoiceStatus)) {
//     throw new Error(
//       'There is No Metadata value with the name ACTIVE of type INVOICE STATUSES.'
//     );
//   }

//   const findVoidedInvoiceStatus = filter(queryAllMetadataValues, {
//     metadata_value: 'VOIDED',
//     metadata_id: invoiceStatusMetadataName[0].id,
//   });

//   if (isEmpty(findVoidedInvoiceStatus)) {
//     throw new Error(
//       'There is No Metadata value with the name VOIDED of type INVOICE STATUSES.'
//     );
//   }

//   const data = {
//     findMandatoryInvoiceType: findMandatoryInvoiceType[0],
//     findOptionalInvoiceType: findOptionalInvoiceType[0],
//     findActiveInvoiceStatus: findActiveInvoiceStatus[0],
//     findVoidedInvoiceStatus: findVoidedInvoiceStatus[0],
//   };

//   return data;
// };

/** deAllocateAndVoidOtherFeesInvoice
 *
 * @param {*} voidedInvoiceData
 * @param {*} approvedRequestData
 * @param {*} studentEnrollment
 * @param {*} enrollmentEvent
 * @param {*} findInvoice
 * @param {*} student
 * @param {*} user
 * @param {*} otherFeesInvoiceId
 * @param {*} voidRequestId
 */
const deAllocateAndVoidOtherFeesInvoice = async function (
  voidedInvoiceData,
  approvedRequestData,
  studentEnrollment,
  enrollmentEvent,
  findInvoice,
  student,
  user,
  otherFeesInvoiceId,
  voidRequestId
) {
  try {
    const generatedReferenceNumber = generateSystemReference('DA');

    const paymentTransactionData = {
      student_id: student,
      student_programme_id: findInvoice.student_programme_id,
      academic_year_id: enrollmentEvent.academic_year_id,
      semester_id: enrollmentEvent.semester_id,
      study_year_id: studentEnrollment.study_year_id,
      system_prn: null,
      amount_paid: null,
      unallocated_amount: null,
      transaction_origin: `DE-ALLOCATED INVOICE: ${findInvoice.description}`,
      currency: null,
      narration: null,
      payment_date: null,
      created_by_id: user,
      create_approval_status: 'APPROVED',
    };

    paymentTransactionData.system_prn = generatedReferenceNumber;
    paymentTransactionData.amount = findInvoice.amount_paid;
    paymentTransactionData.unallocated_amount = findInvoice.amount_paid;
    paymentTransactionData.currency = findInvoice.currency;
    paymentTransactionData.narration = `Invoice Number: ${findInvoice.invoice_number}, ${findInvoice.description}`;
    paymentTransactionData.payment_date = moment.now();

    const updateRecord = await model.sequelize.transaction(
      async (transaction) => {
        await generatePaymentReferenceByDeAllocatedInvoice(
          paymentTransactionData.amount,
          paymentTransactionData.transaction_origin,
          student,
          generatedReferenceNumber,
          user,
          transaction
        );
        await paymentTransactionService.createPaymentTransactionRecord(
          paymentTransactionData,
          transaction
        );

        const update = await invoiceService.updateEnrollmentOtherFeesInvoice(
          otherFeesInvoiceId,
          voidedInvoiceData,
          transaction
        );

        await invoiceService.updateVoidingOtherFeesInvoice(
          voidRequestId,
          approvedRequestData,
          transaction
        );

        return update;
      }
    );
    const invoice = updateRecord[1][0];

    return invoice;
  } catch (error) {
    throw new Error(error.message);
  }
};

/** deAllocateAndVoidManualInvoice
 *
 * @param {*} voidedInvoiceData
 * @param {*} approvedRequestData
 * @param {*} findInvoice
 * @param {*} student
 * @param {*} user
 * @param {*} manualInvoiceId
 * @param {*} voidRequestId
 */
const deAllocateAndVoidManualInvoice = async function (
  voidedInvoiceData,
  approvedRequestData,
  findInvoice,
  student,
  user,
  manualInvoiceId,
  voidRequestId
) {
  try {
    const generatedReferenceNumber = generateSystemReference('DA');

    const paymentTransactionData = {
      student_id: student,
      student_programme_id: findInvoice.student_programme_id,
      academic_year_id: findInvoice.academic_year_id,
      semester_id: findInvoice.semester_id,
      study_year_id: findInvoice.study_year_id,
      system_prn: null,
      amount_paid: null,
      unallocated_amount: null,
      transaction_origin: `DE-ALLOCATED INVOICE: ${findInvoice.description}`,
      currency: null,
      narration: null,
      payment_date: null,
      created_by_id: user,
      create_approval_status: 'APPROVED',
    };

    paymentTransactionData.system_prn = generatedReferenceNumber;
    paymentTransactionData.amount = findInvoice.amount_paid;
    paymentTransactionData.unallocated_amount = findInvoice.amount_paid;
    paymentTransactionData.currency = findInvoice.currency;
    paymentTransactionData.narration = `Invoice Number: ${findInvoice.invoice_number}, ${findInvoice.description}`;
    paymentTransactionData.payment_date = moment.now();

    const updateRecord = await model.sequelize.transaction(
      async (transaction) => {
        await generatePaymentReferenceByDeAllocatedInvoice(
          paymentTransactionData.amount,
          paymentTransactionData.transaction_origin,
          student,
          generatedReferenceNumber,
          user,
          transaction
        );
        await paymentTransactionService.createPaymentTransactionRecord(
          paymentTransactionData,
          transaction
        );

        const update = await invoiceService.updateEnrollmentManualInvoice(
          manualInvoiceId,
          voidedInvoiceData,
          transaction
        );

        await invoiceService.updateVoidingManualInvoice(
          voidRequestId,
          approvedRequestData,
          transaction
        );

        return update;
      }
    );
    const invoice = updateRecord[1][0];

    return invoice;
  } catch (error) {
    throw new Error(error.message);
  }
};

const handleDeAllocatingAllInvoices = async function (
  arrayOfTuitionInvoices,
  arrayOfFunctionalFeesInvoices,
  arrayOfOtherFeesInvoices,
  arrayOfManualInvoices,
  studentId,
  user,
  findActiveInvoiceStatusId
) {
  try {
    const finalResult = [];

    await model.sequelize.transaction(async (transaction) => {
      if (!isEmpty(arrayOfTuitionInvoices)) {
        for (const eachObject of arrayOfTuitionInvoices) {
          const findInvoice = await invoiceService.findOneTuitionInvoiceRecord({
            where: {
              id: eachObject.invoice_id,
              invoice_number: eachObject.invoice_number,
              student_id: studentId,
              invoice_status_id: findActiveInvoiceStatusId,
            },
            attributes: [
              'id',
              'student_programme_id',
              'enrollment_id',
              'invoice_amount',
              'amount_paid',
              'amount_due',
              'percentage_completion',
              'currency',
              'invoice_number',
              'description',
              'de_allocated_amount',
              'de_allocation_comments',
            ],
          });

          if (isEmpty(findInvoice)) {
            throw new Error(
              `The Invoice ${eachObject.invoice_number} Is Invalid.`
            );
          }

          const findRegistration = await registrationService.findOneRecord({
            where: {
              enrollment_id: findInvoice.enrollment_id,
              is_active: true,
            },
          });

          if (!isEmpty(findRegistration)) {
            throw new Error(
              `Tuition Invoice ${eachObject.invoice_number} Cannot Be De-Allocated Because Student Is Registered.`
            );
          }

          const newAmountPaid = 0;
          const newAmountDue = findInvoice.invoice_amount;
          const newPercentageCompletion = Math.floor(
            (newAmountPaid / findInvoice.invoice_amount) * 100
          );
          const deAllocatedInvoiceData = {
            de_allocated_amount:
              findInvoice.amount_paid > 0 ? findInvoice.amount_paid : 0,
            de_allocation_comments: eachObject.de_allocation_comments,
            amount_paid: newAmountPaid,
            amount_due: newAmountDue,
            percentage_completion: newPercentageCompletion,
          };

          const resultAfterDeAllocation =
            await combineDeAllocationOfAllInvoices(
              deAllocatedInvoiceData,
              findInvoice,
              studentId,
              user,
              transaction
            );

          finalResult.push(resultAfterDeAllocation);

          await paymentReferenceService.deactivateInvoiceElements(
            findInvoice.invoice_number,
            transaction
          );
        }
      }

      if (!isEmpty(arrayOfFunctionalFeesInvoices)) {
        for (const eachObject of arrayOfFunctionalFeesInvoices) {
          const findInvoice =
            await invoiceService.findOneFunctionalInvoiceRecord({
              where: {
                id: eachObject.invoice_id,
                invoice_number: eachObject.invoice_number,
                student_id: studentId,
                invoice_status_id: findActiveInvoiceStatusId,
              },
              attributes: [
                'id',
                'student_programme_id',
                'enrollment_id',
                'invoice_amount',
                'amount_paid',
                'amount_due',
                'percentage_completion',
                'currency',
                'invoice_number',
                'description',
                'de_allocated_amount',
                'de_allocation_comments',
              ],
            });

          if (isEmpty(findInvoice)) {
            throw new Error(
              `The Invoice ${eachObject.invoice_number} Is Invalid.`
            );
          }

          const findRegistration = await registrationService.findOneRecord({
            where: {
              enrollment_id: findInvoice.enrollment_id,
              is_active: true,
            },
          });

          if (!isEmpty(findRegistration)) {
            throw new Error(
              `Functional Fees Invoice ${eachObject.invoice_number} Cannot Be De-Allocated Because Student Is Registered.`
            );
          }

          const newAmountPaid = 0;
          const newAmountDue = findInvoice.invoice_amount;
          const newPercentageCompletion = Math.floor(
            (newAmountPaid / findInvoice.invoice_amount) * 100
          );
          const deAllocatedInvoiceData = {
            de_allocated_amount:
              findInvoice.amount_paid > 0 ? findInvoice.amount_paid : 0,
            de_allocation_comments: eachObject.de_allocation_comments,
            amount_paid: newAmountPaid,
            amount_due: newAmountDue,
            percentage_completion: newPercentageCompletion,
          };

          const resultAfterDeAllocation =
            await combineDeAllocationOfAllInvoices(
              deAllocatedInvoiceData,
              findInvoice,
              studentId,
              user,
              transaction
            );

          finalResult.push(resultAfterDeAllocation);

          await paymentReferenceService.deactivateInvoiceElements(
            findInvoice.invoice_number,
            transaction
          );
        }
      }

      if (!isEmpty(arrayOfOtherFeesInvoices)) {
        for (const eachObject of arrayOfOtherFeesInvoices) {
          const findInvoice =
            await invoiceService.findOneOtherFeesInvoiceRecords({
              where: {
                id: eachObject.invoice_id,
                invoice_number: eachObject.invoice_number,
                student_id: studentId,
                invoice_status_id: findActiveInvoiceStatusId,
              },
              attributes: [
                'id',
                'student_programme_id',
                'enrollment_id',
                'invoice_amount',
                'amount_paid',
                'amount_due',
                'percentage_completion',
                'currency',
                'invoice_number',
                'description',
                'de_allocated_amount',
                'de_allocation_comments',
              ],
            });

          if (isEmpty(findInvoice)) {
            throw new Error(
              `The Invoice ${eachObject.invoice_number} Is Invalid.`
            );
          }

          const newAmountPaid = 0;
          const newAmountDue = findInvoice.invoice_amount;
          const newPercentageCompletion = Math.floor(
            (newAmountPaid / findInvoice.invoice_amount) * 100
          );
          const deAllocatedInvoiceData = {
            de_allocated_amount:
              findInvoice.amount_paid > 0 ? findInvoice.amount_paid : 0,
            de_allocation_comments: eachObject.de_allocation_comments,
            amount_paid: newAmountPaid,
            amount_due: newAmountDue,
            percentage_completion: newPercentageCompletion,
          };

          const resultAfterDeAllocation =
            await combineDeAllocationOfAllInvoices(
              deAllocatedInvoiceData,
              findInvoice,
              studentId,
              user,
              transaction
            );

          finalResult.push(resultAfterDeAllocation);

          await paymentReferenceService.deactivateInvoiceElements(
            findInvoice.invoice_number,
            transaction
          );
        }
      }

      if (!isEmpty(arrayOfManualInvoices)) {
        for (const eachObject of arrayOfManualInvoices) {
          const findInvoice = await invoiceService.findOneManualInvoiceRecord({
            where: {
              id: eachObject.invoice_id,
              invoice_number: eachObject.invoice_number,
              student_id: studentId,
              invoice_status_id: findActiveInvoiceStatusId,
            },
            attributes: [
              'id',
              'student_programme_id',
              'academic_year_id',
              'semester_id',
              'study_year_id',
              'invoice_amount',
              'amount_paid',
              'amount_due',
              'percentage_completion',
              'currency',
              'invoice_number',
              'description',
              'de_allocated_amount',
              'de_allocation_comments',
            ],
          });

          if (isEmpty(findInvoice)) {
            throw new Error(
              `The Invoice ${eachObject.invoice_number} Is Invalid.`
            );
          }

          const newAmountPaid = 0;
          const newAmountDue = findInvoice.invoice_amount;
          const newPercentageCompletion = Math.floor(
            (newAmountPaid / findInvoice.invoice_amount) * 100
          );
          const deAllocatedInvoiceData = {
            de_allocated_amount:
              findInvoice.amount_paid > 0 ? findInvoice.amount_paid : 0,
            de_allocation_comments: eachObject.de_allocation_comments,
            amount_paid: newAmountPaid,
            amount_due: newAmountDue,
            percentage_completion: newPercentageCompletion,
          };

          const resultAfterDeAllocation =
            await combineDeAllocationOfAllInvoices(
              deAllocatedInvoiceData,
              findInvoice,
              studentId,
              user,
              transaction
            );

          finalResult.push(resultAfterDeAllocation);

          await paymentReferenceService.deactivateInvoiceElements(
            findInvoice.invoice_number,
            transaction
          );
        }
      }
    });

    return finalResult;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} deAllocatedInvoiceData
 * @param {*} findInvoice
 * @param {*} student
 * @param {*} user
 * @param {*} transaction
 */
const combineDeAllocationOfAllInvoices = async function (
  deAllocatedInvoiceData,
  findInvoice,
  student,
  user,
  transaction
) {
  try {
    const random = Math.floor(Math.random() * moment().unix());
    const generatedReferenceNumber = `DA${random}`;

    const paymentTransactionData = {
      student_id: student,
      student_programme_id: findInvoice.student_programme_id,
      transaction_origin: `DE-ALLOCATED INVOICE: ${findInvoice.description}`,
      created_by_id: user,
      create_approval_status: 'APPROVED',
    };

    if (
      findInvoice.invoice_number.includes('T-INV') ||
      findInvoice.invoice_number.includes('F-INV') ||
      findInvoice.invoice_number.includes('O-INV')
    ) {
      const studentEnrollment = await findStudentEnrollment(
        findInvoice.enrollment_id,
        findInvoice.invoice_number
      );

      const enrollmentEvent = await findEnrollmentEvent(
        studentEnrollment.event_id
      );

      paymentTransactionData.academic_year_id =
        enrollmentEvent.academic_year_id;
      paymentTransactionData.semester_id = enrollmentEvent.semester_id;
      paymentTransactionData.study_year_id = studentEnrollment.study_year_id;
    } else if (findInvoice.invoice_number.includes('M-INV')) {
      paymentTransactionData.academic_year_id = findInvoice.academic_year_id;
      paymentTransactionData.semester_id = findInvoice.semester_id;
      paymentTransactionData.study_year_id = findInvoice.study_year_id;
    }

    paymentTransactionData.system_prn = generatedReferenceNumber;
    paymentTransactionData.amount = findInvoice.amount_paid;
    paymentTransactionData.unallocated_amount = findInvoice.amount_paid;
    paymentTransactionData.currency = findInvoice.currency;
    paymentTransactionData.narration = `Invoice Number: ${findInvoice.invoice_number}, ${findInvoice.description}`;
    paymentTransactionData.payment_date = moment.now();

    const updateRecord = await updateInvoices(
      paymentTransactionData,
      deAllocatedInvoiceData,
      findInvoice,
      student,
      user,
      transaction
    );

    return updateRecord;
  } catch (error) {
    throw new Error(error.message);
  }
};

const updateInvoices = async function (
  paymentTransactionData,
  deAllocatedInvoiceData,
  findInvoice,
  student,
  user,
  transaction
) {
  try {
    if (findInvoice.invoice_number.includes('T-INV')) {
      if (findInvoice.amount_paid > 0) {
        await generatePaymentReferenceByDeAllocatedInvoice(
          paymentTransactionData.amount,
          paymentTransactionData.transaction_origin,
          student,
          paymentTransactionData.system_prn,
          user,
          transaction
        );

        await paymentTransactionService.createPaymentTransactionRecord(
          paymentTransactionData,
          transaction
        );
      }

      const update = await invoiceService.updateEnrollmentTuitionInvoice(
        findInvoice.id,
        deAllocatedInvoiceData,
        transaction
      );
      const invoice = update[1][0];

      return invoice;
    } else if (findInvoice.invoice_number.includes('F-INV')) {
      if (findInvoice.amount_paid > 0) {
        await generatePaymentReferenceByDeAllocatedInvoice(
          paymentTransactionData.amount,
          paymentTransactionData.transaction_origin,
          student,
          paymentTransactionData.system_prn,
          user,
          transaction
        );
        await paymentTransactionService.createPaymentTransactionRecord(
          paymentTransactionData,
          transaction
        );
      }

      const update = await invoiceService.updateEnrollmentFunctionalInvoice(
        findInvoice.id,
        deAllocatedInvoiceData,
        transaction
      );
      const invoice = update[1][0];

      return invoice;
    } else if (findInvoice.invoice_number.includes('O-INV')) {
      if (findInvoice.amount_paid > 0) {
        await generatePaymentReferenceByDeAllocatedInvoice(
          paymentTransactionData.amount,
          paymentTransactionData.transaction_origin,
          student,
          paymentTransactionData.system_prn,
          user,
          transaction
        );
        await paymentTransactionService.createPaymentTransactionRecord(
          paymentTransactionData,
          transaction
        );
      }

      const update = await invoiceService.updateEnrollmentOtherFeesInvoice(
        findInvoice.id,
        deAllocatedInvoiceData,
        transaction
      );
      const invoice = update[1][0];

      return invoice;
    } else if (findInvoice.invoice_number.includes('M-INV')) {
      if (findInvoice.amount_paid > 0) {
        await generatePaymentReferenceByDeAllocatedInvoice(
          paymentTransactionData.amount,
          paymentTransactionData.transaction_origin,
          student,
          paymentTransactionData.system_prn,
          user,
          transaction
        );
        await paymentTransactionService.createPaymentTransactionRecord(
          paymentTransactionData,
          transaction
        );
      }

      const update = await invoiceService.updateEnrollmentManualInvoice(
        findInvoice.id,
        deAllocatedInvoiceData,
        transaction
      );
      const invoice = update[1][0];

      return invoice;
    } else {
      throw new Error(
        `${findInvoice.invoice_number} is an unrecognized format.`
      );
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} exemptedInvoiceData
 * @param {*} findInvoice
 * @param {*} student
 * @param {*} user
 */
const combineExemptingOfAllInvoices = async function (
  exemptedInvoiceData,
  approvedRequestData,
  findInvoice,
  student,
  user,
  transaction
) {
  try {
    const generatedReferenceNumber = generateSystemReference('EX');

    const paymentTransactionData = {
      student_id: student,
      academic_year_id: null,
      semester_id: null,
      study_year_id: null,
      system_prn: null,
      amount_paid: null,
      unallocated_amount: null,
      transaction_origin: `EXEMPTED INVOICE: ${findInvoice.description}`,
      currency: null,
      narration: null,
      payment_date: null,
      created_by_id: user,
      create_approval_status: 'APPROVED',
    };

    if (
      findInvoice.invoice_number.includes('T-INV') ||
      findInvoice.invoice_number.includes('F-INV') ||
      findInvoice.invoice_number.includes('O-INV')
    ) {
      const studentEnrollment = await findStudentEnrollment(
        findInvoice.enrollment_id,
        findInvoice.invoice_number
      );

      const enrollmentEvent = await findEnrollmentEvent(
        studentEnrollment.event_id
      );

      paymentTransactionData.academic_year_id =
        enrollmentEvent.academic_year_id;
      paymentTransactionData.semester_id = enrollmentEvent.semester_id;
      paymentTransactionData.study_year_id = studentEnrollment.study_year_id;
    } else if (findInvoice.invoice_number.includes('M-INV')) {
      paymentTransactionData.academic_year_id = findInvoice.academic_year_id;
      paymentTransactionData.semester_id = findInvoice.semester_id;
      paymentTransactionData.study_year_id = findInvoice.study_year_id;
    }

    paymentTransactionData.system_prn = generatedReferenceNumber;
    paymentTransactionData.amount = null;
    paymentTransactionData.unallocated_amount = null;
    paymentTransactionData.currency = findInvoice.currency;
    paymentTransactionData.narration = `Invoice Number: ${findInvoice.invoice_number}, ${findInvoice.description}`;
    paymentTransactionData.payment_date = moment.now();

    const updateRecord = await updateInvoicesAfterExemption(
      paymentTransactionData,
      exemptedInvoiceData,
      approvedRequestData,
      findInvoice,
      student,
      user,
      transaction
    );

    return updateRecord;
  } catch (error) {
    throw new Error(error.message);
  }
};

const updateInvoicesAfterExemption = async function (
  paymentTransactionData,
  exemptedInvoiceData,
  approvedRequestData,
  findInvoice,
  student,
  user,
  transaction
) {
  try {
    if (findInvoice.invoice_number.includes('T-INV')) {
      if (findInvoice.amount_paid > 0) {
        if (exemptedInvoiceData.exempted_amount > findInvoice.amount_paid) {
          exemptedInvoiceData.amount_paid = 0;
          exemptedInvoiceData.percentage_completion = 0;
          exemptedInvoiceData.amount_due = 0;
          paymentTransactionData.amount = findInvoice.amount_paid;
          paymentTransactionData.unallocated_amount = findInvoice.amount_paid;
        } else if (
          exemptedInvoiceData.exempted_amount <= findInvoice.amount_paid
        ) {
          exemptedInvoiceData.amount_paid =
            findInvoice.amount_paid - exemptedInvoiceData.exempted_amount;
          exemptedInvoiceData.percentage_completion = Math.floor(
            ((findInvoice.amount_paid - exemptedInvoiceData.exempted_amount) /
              findInvoice.invoice_amount) *
              100
          );
          exemptedInvoiceData.amount_due =
            findInvoice.amount_due - exemptedInvoiceData.exempted_amount;
          paymentTransactionData.amount = exemptedInvoiceData.exempted_amount;
          paymentTransactionData.unallocated_amount =
            exemptedInvoiceData.exempted_amount;
        }

        await generatePaymentReferenceByDeAllocatedInvoice(
          paymentTransactionData.amount,
          paymentTransactionData.transaction_origin,
          student,
          paymentTransactionData.system_prn,
          user,
          transaction
        );
        await paymentTransactionService.createPaymentTransactionRecord(
          paymentTransactionData,
          transaction
        );
      }

      await invoiceService.updateRequestToExemptInvoice(
        approvedRequestData,
        transaction
      );

      const update = await invoiceService.updateEnrollmentTuitionInvoice(
        findInvoice.id,
        exemptedInvoiceData,
        transaction
      );
      const invoice = update[1][0];

      return invoice;
    } else if (findInvoice.invoice_number.includes('F-INV')) {
      if (findInvoice.amount_paid > 0) {
        if (exemptedInvoiceData.exempted_amount > findInvoice.amount_paid) {
          exemptedInvoiceData.amount_paid = 0;
          exemptedInvoiceData.percentage_completion = 0;
          exemptedInvoiceData.amount_due = 0;
          paymentTransactionData.amount = findInvoice.amount_paid;
          paymentTransactionData.unallocated_amount = findInvoice.amount_paid;
        } else if (
          exemptedInvoiceData.exempted_amount <= findInvoice.amount_paid
        ) {
          exemptedInvoiceData.amount_paid =
            findInvoice.amount_paid - exemptedInvoiceData.exempted_amount;
          exemptedInvoiceData.percentage_completion = Math.floor(
            ((findInvoice.amount_paid - exemptedInvoiceData.exempted_amount) /
              findInvoice.invoice_amount) *
              100
          );
          exemptedInvoiceData.amount_due =
            findInvoice.amount_due - exemptedInvoiceData.exempted_amount;
          paymentTransactionData.amount = exemptedInvoiceData.exempted_amount;
          paymentTransactionData.unallocated_amount =
            exemptedInvoiceData.exempted_amount;
        }
        await generatePaymentReferenceByDeAllocatedInvoice(
          paymentTransactionData.amount,
          paymentTransactionData.transaction_origin,
          student,
          paymentTransactionData.system_prn,
          user,
          transaction
        );
        await paymentTransactionService.createPaymentTransactionRecord(
          paymentTransactionData,
          transaction
        );
      }

      await invoiceService.updateRequestToExemptInvoice(
        approvedRequestData,
        transaction
      );

      const update = await invoiceService.updateEnrollmentFunctionalInvoice(
        findInvoice.id,
        exemptedInvoiceData,
        transaction
      );
      const invoice = update[1][0];

      return invoice;
    } else if (findInvoice.invoice_number.includes('O-INV')) {
      if (findInvoice.amount_paid > 0) {
        if (exemptedInvoiceData.exempted_amount > findInvoice.amount_paid) {
          exemptedInvoiceData.amount_paid = 0;
          exemptedInvoiceData.percentage_completion = 0;
          exemptedInvoiceData.amount_due = 0;
          paymentTransactionData.amount = findInvoice.amount_paid;
          paymentTransactionData.unallocated_amount = findInvoice.amount_paid;
        } else if (
          exemptedInvoiceData.exempted_amount <= findInvoice.amount_paid
        ) {
          exemptedInvoiceData.amount_paid =
            findInvoice.amount_paid - exemptedInvoiceData.exempted_amount;
          exemptedInvoiceData.percentage_completion = Math.floor(
            ((findInvoice.amount_paid - exemptedInvoiceData.exempted_amount) /
              findInvoice.invoice_amount) *
              100
          );
          exemptedInvoiceData.amount_due =
            findInvoice.amount_due - exemptedInvoiceData.exempted_amount;
          paymentTransactionData.amount = exemptedInvoiceData.exempted_amount;
          paymentTransactionData.unallocated_amount =
            exemptedInvoiceData.exempted_amount;
        }
        await generatePaymentReferenceByDeAllocatedInvoice(
          paymentTransactionData.amount,
          paymentTransactionData.transaction_origin,
          student,
          paymentTransactionData.system_prn,
          user,
          transaction
        );
        await paymentTransactionService.createPaymentTransactionRecord(
          paymentTransactionData,
          transaction
        );
      }

      await invoiceService.updateRequestToExemptInvoice(
        approvedRequestData,
        transaction
      );

      const update = await invoiceService.updateEnrollmentOtherFeesInvoice(
        findInvoice.id,
        exemptedInvoiceData,
        transaction
      );
      const invoice = update[1][0];

      return invoice;
    } else if (findInvoice.invoice_number.includes('M-INV')) {
      if (findInvoice.amount_paid > 0) {
        if (exemptedInvoiceData.exempted_amount > findInvoice.amount_paid) {
          exemptedInvoiceData.amount_paid = 0;
          exemptedInvoiceData.percentage_completion = 0;
          exemptedInvoiceData.amount_due = 0;
          paymentTransactionData.amount = findInvoice.amount_paid;
          paymentTransactionData.unallocated_amount = findInvoice.amount_paid;
        } else if (
          exemptedInvoiceData.exempted_amount <= findInvoice.amount_paid
        ) {
          exemptedInvoiceData.amount_paid =
            findInvoice.amount_paid - exemptedInvoiceData.exempted_amount;
          exemptedInvoiceData.percentage_completion = Math.floor(
            ((findInvoice.amount_paid - exemptedInvoiceData.exempted_amount) /
              findInvoice.invoice_amount) *
              100
          );
          exemptedInvoiceData.amount_due =
            findInvoice.amount_due - exemptedInvoiceData.exempted_amount;
          paymentTransactionData.amount = exemptedInvoiceData.exempted_amount;
          paymentTransactionData.unallocated_amount =
            exemptedInvoiceData.exempted_amount;
        }
        await generatePaymentReferenceByDeAllocatedInvoice(
          paymentTransactionData.amount,
          paymentTransactionData.transaction_origin,
          student,
          paymentTransactionData.system_prn,
          user,
          transaction
        );
        await paymentTransactionService.createPaymentTransactionRecord(
          paymentTransactionData,
          transaction
        );
      }

      await invoiceService.updateRequestToExemptInvoice(
        approvedRequestData,
        transaction
      );

      const update = await invoiceService.updateEnrollmentManualInvoice(
        findInvoice.id,
        exemptedInvoiceData,
        transaction
      );
      const invoice = update[1][0];

      return invoice;
    } else {
      throw new Error(
        `${findInvoice.invoice_number} is an unrecognized format.`
      );
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} referenceAmount
 * @param {*} referenceOrigin
 * @param {*} student
 * @param {*} referenceNumber
 * @param {*} staffId
 * @param {*} transaction
 * @returns
 */
const generatePaymentReferenceByDeAllocatedInvoice = async function (
  referenceAmount,
  referenceOrigin,
  student,
  referenceNumber,
  staffId,
  transaction
) {
  try {
    const generatedBy = 'STAFF';
    const expiryDate = moment.now();

    const payload = {
      system_prn: referenceNumber,
      ura_prn: `ACMIS-${referenceNumber}`,
      search_code: `N/A`,
      tax_payer_name: `N/A`,
      payment_status: `T`,
      payment_mode: 'N/A',
      payment_bank_code: 'N/A',
      payment_status_description: referenceOrigin,
      reference_origin: referenceOrigin,
      amount: referenceAmount,
      student_id: student,
      expiry_date: expiryDate,
      generated_by: generatedBy,
      is_used: true,
      created_by_id: staffId,
    };

    const paymentReference =
      await paymentReferenceService.createPaymentReference(
        payload,
        transaction
      );

    return paymentReference;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} arrayOfOtherFeesInvoices
 * @param {*} findActiveInvoiceStatusId
 * @param {*} findVoidedInvoiceStatusId
 * @param {*} user
 */
const handleApprovingVoidingOfOtherFeesInvoices = async function (
  arrayOfOtherFeesInvoices,
  findActiveInvoiceStatusId,
  findVoidedInvoiceStatusId,
  user
) {
  const otherFeesInvoiceResults = [];
  const response = [];

  await model.sequelize.transaction(async (transaction) => {
    for (const eachObject of arrayOfOtherFeesInvoices) {
      const findRequest =
        await invoiceService.findOneRequestToVoidOtherFeesInvoice({
          where: {
            id: eachObject.void_request_id,
            create_approval_status: 'PENDING',
          },
        });

      if (isEmpty(findRequest)) {
        throw new Error(
          `Request For ${eachObject.invoice_number} Is Invalid Or Does Not Exists.`
        );
      }

      const findInvoice = await invoiceService.findOneOtherFeesInvoiceRecords({
        where: {
          invoice_number: eachObject.invoice_number,
          student_id: findRequest.student_id,
          invoice_status_id: findActiveInvoiceStatusId,
        },
        attributes: [
          'id',
          'student_programme_id',
          'enrollment_id',
          'invoice_amount',
          'amount_paid',
          'amount_due',
          'percentage_completion',
          'currency',
          'invoice_number',
          'description',
        ],
      });

      if (isEmpty(findInvoice)) {
        throw new Error(
          `Invoice ${eachObject.invoice_number} Is Invalid Or Cannot Be Voided.`
        );
      }

      const studentEnrollment = await enrollmentService.findOneRecord({
        where: {
          id: findInvoice.enrollment_id,
          student_id: findRequest.student_id,
          is_active: true,
        },
        ...getStudentEnrollmentAttributes(),
      });

      if (isEmpty(studentEnrollment)) {
        throw new Error(
          'The enrollment record for which this invoice was generated is invalid.'
        );
      }

      const enrollmentEvent = await eventService.findOneEvent({
        where: {
          id: studentEnrollment.event_id,
        },
      });

      if (isEmpty(enrollmentEvent)) {
        throw new Error(
          "This Enrollment Event To Which This Student's Enrollment Record Belongs Is Invalid."
        );
      }

      const voidedInvoiceData = {
        invoice_status_id: findVoidedInvoiceStatusId,
        amount_paid: 0,
        amount_due: 0,
        percentage_completion: 0,
        deleted_at: moment.now(),
        deleted_by_id: user,
      };

      const approvedRequestData = {
        approval_remarks: eachObject.approval_remarks,
        create_approved_by_id: user,
        create_approval_status: 'APPROVED',
      };

      if (findInvoice.amount_paid > 0) {
        const resultAfterDeAllocation = await deAllocateAndVoidOtherFeesInvoice(
          voidedInvoiceData,
          approvedRequestData,
          studentEnrollment,
          enrollmentEvent,
          findInvoice,
          findRequest.student_id,
          user,
          findInvoice.id,
          eachObject.void_request_id
        );

        response.push(resultAfterDeAllocation);
      } else {
        const update = await invoiceService.updateEnrollmentOtherFeesInvoice(
          findInvoice.id,
          voidedInvoiceData,
          transaction
        );

        await invoiceService.updateVoidingOtherFeesInvoice(
          eachObject.void_request_id,
          approvedRequestData,
          transaction
        );
        const invoice = update[1][0];

        response.push(invoice);

        return update;
      }
      otherFeesInvoiceResults.push(...response);
    }
  });

  return otherFeesInvoiceResults;
};

/**
 *
 * @param {*} arrayOfManualInvoices
 * @param {*} findActiveInvoiceStatusId
 * @param {*} findVoidedInvoiceStatusId
 * @param {*} user
 */
const handleApprovingVoidingOfManualInvoices = async function (
  arrayOfManualInvoices,
  findActiveInvoiceStatusId,
  findVoidedInvoiceStatusId,
  user
) {
  const manualInvoiceResults = [];
  const response = [];

  await model.sequelize.transaction(async (transaction) => {
    for (const eachObject of arrayOfManualInvoices) {
      const findRequest =
        await invoiceService.findOneRequestToVoidManualInvoice({
          where: {
            id: eachObject.void_request_id,
            create_approval_status: 'PENDING',
          },
        });

      if (isEmpty(findRequest)) {
        throw new Error(
          `One Of The Manual Invoice Requests To Approve Is Invalid.`
        );
      }
      const findInvoice = await invoiceService.findOneManualInvoiceRecord({
        where: {
          invoice_number: eachObject.invoice_number,
          student_id: findRequest.student_id,
          invoice_status_id: findActiveInvoiceStatusId,
        },
        attributes: [
          'id',
          'student_programme_id',
          'academic_year_id',
          'semester_id',
          'study_year_id',
          'invoice_amount',
          'amount_paid',
          'amount_due',
          'percentage_completion',
          'currency',
          'invoice_number',
          'description',
        ],
      });

      if (isEmpty(findInvoice)) {
        throw new Error(
          `The Manual Invoice ${eachObject.invoice_number} Specified Is Invalid Or Cannot Be Voided.`
        );
      }

      const voidedInvoiceData = {
        invoice_status_id: findVoidedInvoiceStatusId,
        amount_paid: 0,
        amount_due: 0,
        percentage_completion: 0,
        deleted_at: moment.now(),
        deleted_by_id: user,
      };

      const approvedRequestData = {
        approval_remarks: eachObject.approval_remarks,
        create_approved_by_id: user,
        create_approval_status: 'APPROVED',
      };

      if (findInvoice.amount_paid > 0) {
        const resultAfterDeAllocation = await deAllocateAndVoidManualInvoice(
          voidedInvoiceData,
          approvedRequestData,
          findInvoice,
          findRequest.student_id,
          user,
          findInvoice.id,
          eachObject.void_request_id
        );

        response.push(resultAfterDeAllocation);
      } else {
        const update = await invoiceService.updateEnrollmentManualInvoice(
          findInvoice.id,
          voidedInvoiceData,
          transaction
        );

        await invoiceService.updateVoidingManualInvoice(
          eachObject.void_request_id,
          approvedRequestData,
          transaction
        );
        const invoice = update[1][0];

        response.push(invoice);

        return update;
      }
      manualInvoiceResults.push(...response);
    }
  });

  return manualInvoiceResults;
};

/**
 *
 * @param {*} arrayOfTuitionInvoices
 * @param {*} arrayOfFunctionalFeesInvoices
 * @param {*} arrayOfOtherFeesInvoices
 * @param {*} arrayOfManualInvoices
 * @param {*} studentId
 * @param {*} user
 */
const handleApprovingExemptionOfAllInvoices = async function (
  arrayOfTuitionInvoices,
  arrayOfFunctionalFeesInvoices,
  arrayOfOtherFeesInvoices,
  arrayOfManualInvoices,
  studentId,
  user
) {
  const finalResult = [];
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

  await model.sequelize.transaction(async (transaction) => {
    if (!isEmpty(arrayOfTuitionInvoices)) {
      for (const eachObject of arrayOfTuitionInvoices) {
        const findInvoice = await invoiceService.findOneTuitionInvoiceRecord({
          where: {
            id: eachObject.invoice_id,
            invoice_number: eachObject.invoice_number,
            student_id: studentId,
            invoice_status_id: findActiveInvoiceStatusId,
          },
          attributes: [
            'id',
            'enrollment_id',
            'invoice_amount',
            'amount_paid',
            'amount_due',
            'percentage_completion',
            'currency',
            'invoice_number',
            'description',
            'de_allocated_amount',
            'de_allocation_comments',
          ],
          raw: true,
        });

        if (!findInvoice) {
          throw new Error(
            `The Invoice ${eachObject.invoice_number} Is Not Active Or Does not Exist.`
          );
        }

        if (eachObject.exempted_amount > findInvoice.invoice_amount) {
          throw new Error(
            `The Exempted Amount For Invoice ${eachObject.invoice_number} Must Be Less Than Or Equal To ${findInvoice.invoice_amount}.`
          );
        }

        const exemptedInvoiceData = {
          exempted_amount: eachObject.exempted_amount,
          exempted_percentage: Math.floor(
            (eachObject.exempted_amount / findInvoice.invoice_amount) * 100
          ),
          exemption_comments: eachObject.exemption_comments,
          amount_due: findInvoice.amount_due - eachObject.exempted_amount,
        };

        const approvedRequestData = {
          id: eachObject.exemption_request_id,
          create_approved_by_id: user,
          create_approval_status: 'APPROVED',
        };

        const resultAfterExemption = await combineExemptingOfAllInvoices(
          exemptedInvoiceData,
          approvedRequestData,
          findInvoice,
          studentId,
          user,
          transaction
        );

        finalResult.push(resultAfterExemption);
      }
    }

    if (!isEmpty(arrayOfFunctionalFeesInvoices)) {
      for (const eachObject of arrayOfFunctionalFeesInvoices) {
        const findInvoice = await invoiceService.findOneFunctionalInvoiceRecord(
          {
            where: {
              id: eachObject.invoice_id,
              invoice_number: eachObject.invoice_number,
              student_id: studentId,
              invoice_status_id: findActiveInvoiceStatusId,
            },
            attributes: [
              'id',
              'enrollment_id',
              'invoice_amount',
              'amount_paid',
              'amount_due',
              'percentage_completion',
              'currency',
              'invoice_number',
              'description',
              'de_allocated_amount',
              'de_allocation_comments',
            ],
            raw: true,
          }
        );

        if (!findInvoice) {
          throw new Error(
            `The Invoice ${eachObject.invoice_number} Is Invalid.`
          );
        }

        if (eachObject.exempted_amount > findInvoice.invoice_amount) {
          throw new Error(
            `The Exempted Amount For Invoice ${eachObject.invoice_number} Must Be Less Than Or Equal To ${findInvoice.invoice_amount}.`
          );
        }

        const newPercentageExemption = Math.floor(
          (eachObject.exempted_amount / findInvoice.invoice_amount) * 100
        );
        const newAmountDue =
          findInvoice.amount_due - eachObject.exempted_amount;
        const exemptedInvoiceData = {
          exempted_amount: eachObject.exempted_amount,
          exempted_percentage: newPercentageExemption,
          exemption_comments: eachObject.exemption_comments,
          amount_due: newAmountDue,
        };

        const approvedRequestData = {
          id: eachObject.exemption_request_id,
          create_approved_by_id: user,
          create_approval_status: 'APPROVED',
        };

        const resultAfterExemption = await combineExemptingOfAllInvoices(
          exemptedInvoiceData,
          approvedRequestData,
          findInvoice,
          studentId,
          user,
          transaction
        );

        finalResult.push(resultAfterExemption);
      }
    }

    if (isEmpty(arrayOfOtherFeesInvoices)) {
      for (const eachObject of arrayOfOtherFeesInvoices) {
        const findInvoice = await invoiceService.findOneOtherFeesInvoiceRecords(
          {
            where: {
              id: eachObject.invoice_id,
              invoice_number: eachObject.invoice_number,
              student_id: studentId,
              invoice_status_id: findActiveInvoiceStatusId,
            },
            attributes: [
              'id',
              'enrollment_id',
              'invoice_amount',
              'amount_paid',
              'amount_due',
              'percentage_completion',
              'currency',
              'invoice_number',
              'description',
              'de_allocated_amount',
              'de_allocation_comments',
            ],
            raw: true,
          }
        );

        if (!findInvoice) {
          throw new Error(
            `The Invoice ${eachObject.invoice_number} Is Invalid.`
          );
        }

        if (eachObject.exempted_amount > findInvoice.invoice_amount) {
          throw new Error(
            `The Exempted Amount For Invoice ${eachObject.invoice_number} Must Be Less Than Or Equal To ${findInvoice.invoice_amount}.`
          );
        }

        const newPercentageExemption = Math.floor(
          (eachObject.exempted_amount / findInvoice.invoice_amount) * 100
        );
        const newAmountDue =
          findInvoice.amount_due - eachObject.exempted_amount;
        const exemptedInvoiceData = {
          exempted_amount: eachObject.exempted_amount,
          exempted_percentage: newPercentageExemption,
          exemption_comments: eachObject.exemption_comments,
          amount_due: newAmountDue,
        };

        const approvedRequestData = {
          id: eachObject.exemption_request_id,
          create_approved_by_id: user,
          create_approval_status: 'APPROVED',
        };

        const resultAfterExemption = await combineExemptingOfAllInvoices(
          exemptedInvoiceData,
          approvedRequestData,
          findInvoice,
          studentId,
          user,
          transaction
        );

        finalResult.push(resultAfterExemption);
      }
    }

    if (!isEmpty(arrayOfManualInvoices)) {
      for (const eachObject of arrayOfManualInvoices) {
        const findInvoice = await invoiceService.findOneManualInvoiceRecord({
          where: {
            id: eachObject.invoice_id,
            invoice_number: eachObject.invoice_number,
            student_id: studentId,
            invoice_status_id: findActiveInvoiceStatusId,
          },
          attributes: [
            'id',
            'academic_year_id',
            'semester_id',
            'study_year_id',
            'invoice_amount',
            'amount_paid',
            'amount_due',
            'percentage_completion',
            'currency',
            'invoice_number',
            'description',
            'de_allocated_amount',
            'de_allocation_comments',
          ],
          raw: true,
        });

        if (!findInvoice) {
          throw new Error(
            `The Invoice ${eachObject.invoice_number} Is Invalid.`
          );
        }

        if (eachObject.exempted_amount > findInvoice.invoice_amount) {
          throw new Error(
            `The Exempted Amount For Invoice ${eachObject.invoice_number} Must Be Less Than Or Equal To ${findInvoice.invoice_amount}.`
          );
        }

        const newPercentageExemption = Math.floor(
          (eachObject.exempted_amount / findInvoice.invoice_amount) * 100
        );
        const newAmountDue =
          findInvoice.amount_due - eachObject.exempted_amount;
        const exemptedInvoiceData = {
          exempted_amount: eachObject.exempted_amount,
          exempted_percentage: newPercentageExemption,
          exemption_comments: eachObject.exemption_comments,
          amount_due: newAmountDue,
        };

        const approvedRequestData = {
          id: eachObject.exemption_request_id,
          create_approved_by_id: user,
          create_approval_status: 'APPROVED',
        };

        const resultAfterExemption = await combineExemptingOfAllInvoices(
          exemptedInvoiceData,
          approvedRequestData,
          findInvoice,
          studentId,
          user,
          transaction
        );

        finalResult.push(resultAfterExemption);
      }
    }
  });

  return finalResult;
};

/**
 *
 * @param {*} arrayOfTuitionInvoices
 * @param {*} arrayOfFunctionalFeesInvoices
 * @param {*} arrayOfOtherFeesInvoices
 * @param {*} arrayOfManualInvoices
 * @param {*} studentId
 * @param {*} user
 */
const handleRequestsToExemptingAllInvoices = async function (
  arrayOfTuitionInvoices,
  arrayOfFunctionalFeesInvoices,
  arrayOfOtherFeesInvoices,
  arrayOfManualInvoices,
  studentId,
  user
) {
  const finalResult = [];
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

  await model.sequelize.transaction(async (transaction) => {
    if (!isEmpty(arrayOfTuitionInvoices)) {
      for (const eachObject of arrayOfTuitionInvoices) {
        const findInvoice = await invoiceService.findOneTuitionInvoiceRecord({
          where: {
            id: eachObject.invoice_id,
            invoice_number: eachObject.invoice_number,
            student_id: studentId,
            invoice_status_id: findActiveInvoiceStatusId,
          },
          attributes: [
            'id',
            'enrollment_id',
            'invoice_amount',
            'amount_paid',
            'amount_due',
            'percentage_completion',
            'currency',
            'invoice_number',
            'description',
            'de_allocated_amount',
            'de_allocation_comments',
          ],
          raw: true,
        });

        if (!findInvoice) {
          throw new Error(
            `The Invoice ${eachObject.invoice_number} Is Not Active Or Doesn't Belong To The Student Chosen.`
          );
        }

        if (eachObject.exempted_amount > findInvoice.invoice_amount) {
          throw new Error(
            `The Exempted Amount For Invoice ${eachObject.invoice_number} Must Be Less Than Or Equal To ${findInvoice.invoice_amount}.`
          );
        }

        const studentEnrollment = await findStudentEnrollment(
          findInvoice.enrollment_id,
          findInvoice.invoice_number
        );

        const enrollmentEvent = await findEnrollmentEvent(
          studentEnrollment.event_id
        );

        const requestToExemptedInvoiceData = {
          student_id: studentId,
          tuition_invoice_id: eachObject.invoice_id,
          invoice_number: findInvoice.invoice_number,
          academic_year_id: enrollmentEvent.academic_year_id,
          semester_id: enrollmentEvent.semester_id,
          study_year_id: studentEnrollment.study_year_id,
          exempted_amount: eachObject.exempted_amount,
          exemption_comments: eachObject.exemption_comments,
          created_by_id: user,
        };

        const request = await invoiceService.createRequestToExemptInvoices(
          requestToExemptedInvoiceData,
          transaction
        );

        if (request[1] === true) {
          finalResult.push(request);
        }
      }
    }

    if (!isEmpty(arrayOfFunctionalFeesInvoices)) {
      for (const eachObject of arrayOfFunctionalFeesInvoices) {
        const findInvoice = await invoiceService.findOneFunctionalInvoiceRecord(
          {
            where: {
              id: eachObject.invoice_id,
              invoice_number: eachObject.invoice_number,
              student_id: studentId,
              invoice_status_id: findActiveInvoiceStatusId,
            },
            attributes: [
              'id',
              'enrollment_id',
              'invoice_amount',
              'amount_paid',
              'amount_due',
              'percentage_completion',
              'currency',
              'invoice_number',
              'description',
              'de_allocated_amount',
              'de_allocation_comments',
            ],
            raw: true,
          }
        );

        if (!findInvoice) {
          throw new Error(
            `The Invoice ${eachObject.invoice_number} Is Not Active Or Doesn't Belong To The Student Chosen.`
          );
        }

        if (eachObject.exempted_amount > findInvoice.invoice_amount) {
          throw new Error(
            `The Exempted Amount For Invoice ${eachObject.invoice_number} Must Be Less Than Or Equal To ${findInvoice.invoice_amount}.`
          );
        }

        const studentEnrollment = await findStudentEnrollment(
          findInvoice.enrollment_id,
          findInvoice.invoice_number
        );

        const enrollmentEvent = await findEnrollmentEvent(
          studentEnrollment.event_id
        );

        const requestToExemptedInvoiceData = {
          student_id: studentId,
          functional_invoice_id: eachObject.invoice_id,
          invoice_number: findInvoice.invoice_number,
          academic_year_id: enrollmentEvent.academic_year_id,
          semester_id: enrollmentEvent.semester_id,
          study_year_id: studentEnrollment.study_year_id,
          exempted_amount: eachObject.exempted_amount,
          exemption_comments: eachObject.exemption_comments,
          created_by_id: user,
        };

        const request = await invoiceService.createRequestToExemptInvoices(
          requestToExemptedInvoiceData,
          transaction
        );

        if (request[1] === true) {
          finalResult.push(request);
        }
      }
    }

    if (!isEmpty(arrayOfOtherFeesInvoices)) {
      for (const eachObject of arrayOfOtherFeesInvoices) {
        const findInvoice = await invoiceService.findOneOtherFeesInvoiceRecords(
          {
            where: {
              id: eachObject.invoice_id,
              invoice_number: eachObject.invoice_number,
              student_id: studentId,
              invoice_status_id: findActiveInvoiceStatusId,
            },
            attributes: [
              'id',
              'enrollment_id',
              'invoice_amount',
              'amount_paid',
              'amount_due',
              'percentage_completion',
              'currency',
              'invoice_number',
              'description',
              'de_allocated_amount',
              'de_allocation_comments',
            ],
            raw: true,
          }
        );

        if (!findInvoice) {
          throw new Error(
            `The Invoice ${eachObject.invoice_number} Is Not Active Or Doesn't Belong To The Student Chosen.`
          );
        }

        if (eachObject.exempted_amount > findInvoice.invoice_amount) {
          throw new Error(
            `The Exempted Amount For Invoice ${eachObject.invoice_number} Must Be Less Than Or Equal To ${findInvoice.invoice_amount}.`
          );
        }

        const studentEnrollment = await findStudentEnrollment(
          findInvoice.enrollment_id,
          findInvoice.invoice_number
        );

        const enrollmentEvent = await findEnrollmentEvent(
          studentEnrollment.event_id
        );

        const requestToExemptedInvoiceData = {
          student_id: studentId,
          other_fees_invoice_id: eachObject.invoice_id,
          invoice_number: findInvoice.invoice_number,
          academic_year_id: enrollmentEvent.academic_year_id,
          semester_id: enrollmentEvent.semester_id,
          study_year_id: studentEnrollment.study_year_id,
          exempted_amount: eachObject.exempted_amount,
          exemption_comments: eachObject.exemption_comments,
          created_by_id: user,
        };

        const request = await invoiceService.createRequestToExemptInvoices(
          requestToExemptedInvoiceData,
          transaction
        );

        if (request[1] === true) {
          finalResult.push(request);
        }
      }
    }

    if (!isEmpty(arrayOfManualInvoices)) {
      for (const eachObject of arrayOfManualInvoices) {
        const findInvoice = await invoiceService.findOneManualInvoiceRecord({
          where: {
            id: eachObject.invoice_id,
            invoice_number: eachObject.invoice_number,
            student_id: studentId,
            invoice_status_id: findActiveInvoiceStatusId,
          },
          attributes: [
            'id',
            'academic_year_id',
            'semester_id',
            'study_year_id',
            'invoice_amount',
            'amount_paid',
            'amount_due',
            'percentage_completion',
            'currency',
            'invoice_number',
            'description',
            'de_allocated_amount',
            'de_allocation_comments',
          ],
          raw: true,
        });

        if (!findInvoice) {
          throw new Error(
            `The Invoice ${eachObject.invoice_number} Is Not Active Or Doesn't Belong To The Student Chosen.`
          );
        }

        if (eachObject.exempted_amount > findInvoice.invoice_amount) {
          throw new Error(
            `The Exempted Amount For Invoice ${eachObject.invoice_number} Must Be Less Than Or Equal To ${findInvoice.invoice_amount}.`
          );
        }

        const requestToExemptedInvoiceData = {
          student_id: studentId,
          manual_invoice_id: eachObject.invoice_id,
          invoice_number: findInvoice.invoice_number,
          academic_year_id: findInvoice.academic_year_id,
          semester_id: findInvoice.semester_id,
          study_year_id: findInvoice.study_year_id,
          exempted_amount: eachObject.exempted_amount,
          exemption_comments: eachObject.exemption_comments,
          created_by_id: user,
        };

        const request = await invoiceService.createRequestToExemptInvoices(
          requestToExemptedInvoiceData,
          transaction
        );

        if (request[1] === true) {
          finalResult.push(request);
        }
      }
    }
  });

  return finalResult;
};

const findEnrollmentEvent = async function (eventId) {
  const result = await eventService.findOneEvent({
    where: {
      id: eventId,
    },
    raw: true,
  });

  if (!result) {
    throw new Error(
      "This Enrollment Event To Which This Student's Enrollment Record Belongs Does not Exist."
    );
  }

  return result;
};

const findStudentEnrollment = async function (enrollmentId, invoiceNumber) {
  const result = await enrollmentService.findOneRecord({
    where: {
      id: enrollmentId,
      is_active: true,
    },
    ...getStudentEnrollmentAttributes(),
    raw: true,
  });

  if (!result) {
    throw new Error(
      `The Enrollment Record To Which The Invoice ${invoiceNumber} Was Generated Is Not Active.`
    );
  }

  return result;
};

const getStudentEnrollmentAttributes = function () {
  return {
    attributes: {
      exclude: [
        'updated_at',
        'createdById',
        'createApprovedById',
        'lastUpdatedById',
        'lastUpdateApprovedById',
        'deletedById',
        'deleteApprovedById',
        'deleteApprovedById',
        'delete_approval_status',
        'delete_approval_date',
        'delete_approved_by_id',
        'last_update_approval_status',
        'last_update_approval_date',
        'last_update_approved_by_id',
        'last_updated_by_id',
        'create_approval_status',
        'create_approval_date',
        'create_approved_by_id',
      ],
    },
    include: [
      { association: 'enrollmentStatus', attributes: ['metadata_value'] },
      { association: 'studyYear', attributes: ['programme_study_years'] },
    ],
  };
};

module.exports = {
  allocateMoneyToAnInvoice,
  deAllocateAndVoidOtherFeesInvoice,
  deAllocateAndVoidManualInvoice,
  handleApprovingVoidingOfOtherFeesInvoices,
  handleApprovingVoidingOfManualInvoices,
  handleDeAllocatingAllInvoices,
  handleRequestsToExemptingAllInvoices,
  handleApprovingExemptionOfAllInvoices,
  allocateMoneyToAnInvoicesByStudent,
};
