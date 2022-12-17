const {
  paymentReferenceService,
  metadataValueService,
  invoiceService,
  studentService,
  universalInvoiceService,
  runningAdmissionApplicantService,
} = require('@services/index');
const model = require('@models');
const moment = require('moment');
const { isEmpty, chain, orderBy } = require('lodash');
const envConfig = require('../../../config/app');
const { generatePRN } = require('@helpers');
const { getMetadataValueId } = require('@controllers/Helpers/programmeHelper');
const { Op } = require('sequelize');
const { isArray } = require('lodash');
const { generateSystemReference } = require('./paymentReferenceHelper');
const { generateLateFeePaymentInvoice } = require('./enrollmentRecord');
const {
  billApplicants,
} = require('../Helpers/runningAdmissionApplicantHelper');

/**
 * Generate payment Reference
 */
const generatePaymentReference = async function (payload) {
  payload.tax_head = envConfig.TAX_HEAD_CODE;
  payload.system_prn = generateSystemReference();

  const findTaxPayer = await studentService
    .findOneStudent({
      where: {
        id: payload.student_id,
      },
      attributes: ['id', 'surname', 'other_names', 'email', 'phone'],
      include: [
        {
          association: 'programmes',
        },
      ],
      nest: true,
    })
    .then((res) => {
      if (res) {
        return res.toJSON();
      }
    });

  if (!findTaxPayer) {
    throw new Error(`Student record doesn't exist.`);
  }

  // const findCurrentProgramme = findTaxPayer.programmes.find(
  //   (stdProg) => stdProg.is_current_programme === true
  // );

  // payload.tax_payer_name = `${findTaxPayer.surname} ${
  //   findTaxPayer.other_names
  // } - ${findCurrentProgramme ? findCurrentProgramme.student_number : ''}`;

  payload.tax_payer_name = `${findTaxPayer.surname} ${findTaxPayer.other_names}`;

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

  let functionalFeesInvoiceData = {};
  const paymentReferenceTuitionInvoices = [];
  const paymentReferenceOtherFeesInvoices = [];
  const paymentReferenceManualInvoices = [];

  let totalAmount = 0;

  if (!isEmpty(payload.tuition_invoices)) {
    for (const tuitionInvoice of payload.tuition_invoices) {
      const findInvoice = await invoiceService
        .findOneTuitionInvoiceRecord({
          where: {
            id: tuitionInvoice.tuition_invoice_id,
            student_id: payload.student_id,
            invoice_status_id: findActiveInvoiceStatusId,
          },
          attributes: [
            'id',
            'enrollment_id',
            'student_id',
            'student_programme_id',
            'invoice_amount',
            'amount_paid',
            'amount_due',
            'percentage_completion',
            'invoice_status_id',
            'currency',
            'description',
            'invoice_number',
          ],
          include: [
            {
              association: 'programme',
              attributes: [
                'id',
                'programme_id',
                'current_study_year_id',
                'is_current_programme',
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
        if (payload.generated_by === 'STAFF') {
          throw new Error(
            `The Tuition Invoice With Amount Allocation Of ${tuitionInvoice.amount} Is Either Inactive Or Doesn't Belong To This Student.`
          );
        } else {
          throw new Error(
            `The Tuition Invoice With Amount Allocation Of ${tuitionInvoice.amount} Is Either Inactive Or Doesn't Belong To You.`
          );
        }
      }

      if (tuitionInvoice.amount > findInvoice.amount_due) {
        throw new Error(
          `The Tuition Invoice Invoice With Amount Allocation Of ${tuitionInvoice.amount} Must Not Exceed ${findInvoice.amount_due}.`
        );
      }

      if (findInvoice.programme.is_current_programme !== true) {
        throw new Error(
          `The Tuition Invoice With Amount Allocation Of ${tuitionInvoice.amount} Must Be Of The Student's Current Programme.`
        );
      }

      totalAmount += parseInt(tuitionInvoice.amount, 10);
      paymentReferenceTuitionInvoices.push({
        ...tuitionInvoice,
      });
    }
  }

  if (payload.functional_fees_invoice_id && payload.functional_fees_amount) {
    const findInvoice = await invoiceService
      .findOneFunctionalInvoiceRecord({
        where: {
          id: payload.functional_fees_invoice_id,
          student_id: payload.student_id,
          invoice_status_id: findActiveInvoiceStatusId,
        },
        attributes: [
          'id',
          'enrollment_id',
          'student_id',
          'student_programme_id',
          'invoice_amount',
          'amount_paid',
          'amount_due',
          'percentage_completion',
          'invoice_status_id',
          'currency',
          'description',
          'invoice_number',
        ],
        include: [
          {
            association: 'programme',
            attributes: [
              'id',
              'programme_id',
              'current_study_year_id',
              'is_current_programme',
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
      if (payload.generated_by === 'STAFF') {
        throw new Error(
          `The Functional Fees Invoice With Amount Allocation Of ${payload.functional_fees_amount} Is Either Inactive Or Doesn't Belong To This Student.`
        );
      } else {
        throw new Error(
          `The Functional Fees Invoice With Amount Allocation Of ${payload.functional_fees_amount} Is Either Inactive Or Doesn't Belong To You.`
        );
      }
    }

    if (payload.functional_fees_amount > findInvoice.amount_due) {
      throw new Error(
        `The Functional Fees Invoice With Amount Allocation Of ${payload.functional_fees_amount} Must Not Exceed ${findInvoice.amount_due}.`
      );
    }

    if (findInvoice.programme.is_current_programme !== true) {
      throw new Error(
        `The Functional Fees Invoice With Amount Allocation Of ${payload.functional_fees_amount} Must Be Of The Student's Current Programme.`
      );
    }

    const functionalFeesAmount = parseInt(payload.functional_fees_amount, 10);

    totalAmount += functionalFeesAmount;
    functionalFeesInvoiceData = {
      functional_fees_invoice_id: payload.functional_fees_invoice_id,
      amount: functionalFeesAmount,
    };
  }

  if (!isEmpty(payload.other_fees_invoices)) {
    for (const otherFeesInvoice of payload.other_fees_invoices) {
      const findInvoice = await invoiceService
        .findOneOtherFeesInvoiceRecords({
          where: {
            id: otherFeesInvoice.other_fees_invoice_id,
            student_id: payload.student_id,
            invoice_status_id: findActiveInvoiceStatusId,
          },
          attributes: [
            'id',
            'enrollment_id',
            'student_id',
            'student_programme_id',
            'invoice_amount',
            'amount_paid',
            'amount_due',
            'percentage_completion',
            'invoice_status_id',
            'currency',
            'description',
            'invoice_number',
          ],
          include: [
            {
              association: 'programme',
              attributes: [
                'id',
                'programme_id',
                'current_study_year_id',
                'is_current_programme',
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
        if (payload.generated_by === 'STAFF') {
          throw new Error(
            `The other Fees Invoice With Amount Allocation Of ${otherFeesInvoice.amount} Is Either Inactive Or Doesn't Belong To This Student.`
          );
        } else {
          throw new Error(
            `The other Fees Invoice With Amount Allocation Of ${otherFeesInvoice.amount} Is Either Inactive Or Doesn't Belong To You.`
          );
        }
      }

      if (otherFeesInvoice.amount > findInvoice.amount_due) {
        throw new Error(
          `The Other Fees Invoice With Amount Allocation Of ${otherFeesInvoice.amount} Must Not Exceed ${findInvoice.amount_due}.`
        );
      }

      if (findInvoice.programme.is_current_programme !== true) {
        throw new Error(
          `The Other Fees Invoice With Amount Allocation Of ${otherFeesInvoice.amount} Must Be Of The Student's Current Programme.`
        );
      }

      totalAmount += parseInt(otherFeesInvoice.amount, 10);
      paymentReferenceOtherFeesInvoices.push({
        ...otherFeesInvoice,
      });
    }
  }

  if (!isEmpty(payload.manual_invoices)) {
    for (const manualInvoice of payload.manual_invoices) {
      const findInvoice = await invoiceService
        .findOneManualInvoiceRecord({
          where: {
            id: manualInvoice.manual_invoice_id,
            student_id: payload.student_id,
            invoice_status_id: findActiveInvoiceStatusId,
          },
          attributes: [
            'id',
            'student_programme_id',
            'invoice_amount',
            'amount_paid',
            'amount_due',
            'percentage_completion',
            'invoice_status_id',
            'currency',
            'description',
            'invoice_number',
          ],
          include: [
            {
              association: 'programme',
              attributes: [
                'id',
                'programme_id',
                'current_study_year_id',
                'is_current_programme',
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
        if (payload.generated_by === 'STAFF') {
          throw new Error(
            `The Manual Invoice With Amount Allocation Of ${manualInvoice.amount} Is Either Inactive Or Doesn't Belong To This Student.`
          );
        } else {
          throw new Error(
            `The Manual Invoice With Amount Allocation Of ${manualInvoice.amount} Is Either Inactive Or Doesn't Belong To You.`
          );
        }
      }

      if (manualInvoice.amount > findInvoice.amount_due) {
        throw new Error(
          `The Manual Invoice With Amount Allocation Of ${manualInvoice.amount} Must Not Exceed ${findInvoice.amount_due}.`
        );
      }

      if (findInvoice.programme.is_current_programme !== true) {
        throw new Error(
          `The Manual Invoice With Amount Allocation Of ${manualInvoice.amount} Must Be Of The Student's Current Programme.`
        );
      }

      totalAmount += parseInt(manualInvoice.amount, 10);
      paymentReferenceManualInvoices.push({
        ...manualInvoice,
      });
    }
  }

  payload.amount = totalAmount;
  payload.payment_mode = 'CASH';
  payload.payment_bank_code = 'STN';

  const requestUraPrnData = {
    TaxHead: envConfig.TAX_HEAD_CODE,
    TaxPayerName: payload.tax_payer_name,
    TaxPayerBankCode: payload.payment_bank_code,
    PaymentBankCode: payload.payment_bank_code,
    MobileNo: payload.payment_mobile_no,
    ReferenceNo: payload.system_prn,
    ExpiryDays: envConfig.PAYMENT_REFERENCE_EXPIRES_IN,
    Amount: payload.amount,
    PaymentMode: payload.payment_mode,
    Email: findTaxPayer.email,
  };

  const genPRN = await generatePRN(requestUraPrnData);

  payload.ura_prn = genPRN.ura_prn;
  payload.expiry_date = genPRN.expiry_date;
  payload.search_code = genPRN.search_code;

  payload.functionalFeesInvoice = functionalFeesInvoiceData;
  payload.tuitionInvoice = paymentReferenceTuitionInvoices;
  payload.otherFeesInvoices = paymentReferenceOtherFeesInvoices;
  payload.manualInvoices = paymentReferenceManualInvoices;

  const paymentReference = await model.sequelize.transaction(
    async (transaction) => {
      const result = await paymentReferenceService.createPaymentReference(
        payload,
        transaction
      );

      const prnTrackerData = {
        student_id: payload.student_id,
        category: 'STUDENT-TRANSACTION',
        system_prn: payload.system_prn,
        ura_prn: genPRN.ura_prn,
        search_code: genPRN.search_code,
        amount: payload.amount,
        tax_payer_name: payload.tax_payer_name,
        payment_mode: payload.payment_mode,
        payment_bank_code: payload.payment_bank_code,
        tax_payer_bank_code: payload.tax_payer_bank_code,
        generated_by: payload.generated_by,
        expiry_date: genPRN.expiry_date,
      };

      await prnTrackerRecord(prnTrackerData, transaction);

      return result;
    }
  );

  return paymentReference;
};

const getStudentPaymentReferences = async (studentId) => {
  const activePaymentReferences =
    await paymentReferenceService.findAllPaymentReferences({
      where: {
        student_id: studentId,
        is_used: false,
        expiry_date: {
          [Op.gte]: moment.now(),
        },
      },
      order: [['created_at', 'DESC']],
    });

  const inactivePaymentReferences =
    await paymentReferenceService.findAllPaymentReferences({
      where: {
        student_id: studentId,
        is_used: false,
        expiry_date: {
          [Op.lt]: moment.now(),
        },
      },
      order: [['created_at', 'DESC']],
    });

  return {
    active: activePaymentReferences,
    inactive: inactivePaymentReferences,
  };
};

/**
 * Generate payment Reference By Direct Post
 */
const generatePaymentReferenceByDirectPost = async function (
  data,
  student,
  staffId,
  transaction
) {
  const generatedBy = 'DIRECT POST';
  const expiryDate = moment.now();

  const payload = {
    ...data,
    system_prn: data.system_prn,
    ura_prn: data.system_prn,
    search_code: 'NOT AVAILABLE',
    tax_payer_name: student.surname + ' ' + student.other_names,
    generated_by: generatedBy,
    expiry_date: expiryDate,
    is_used: true,
    created_by_id: staffId,
  };

  const result = await paymentReferenceService.createPaymentReference(
    payload,
    transaction
  );

  return result;
};

/**
 *
 * @param {*} systemPrn
 * @param {*} paymentMode
 * @param {*} amountPaid
 * @param {*} studentId
 * @param {*} taxPayerName
 * @param {*} staffId
 * @param {*} origin
 * @param {*} searchCode
 * @param {*} transaction
 */
const generatePaymentReferenceRecord = async function (
  systemPrn,
  paymentMode,
  amountPaid,
  studentId,
  taxPayerName,
  staffId,
  origin,
  searchCode,
  transaction
) {
  try {
    const expiryDate = moment.now();

    const payload = {
      system_prn: systemPrn,
      ura_prn: systemPrn,
      search_code: searchCode,
      tax_payer_name: taxPayerName,
      payment_mode: paymentMode,
      amount: amountPaid,
      generated_by: origin,
      student_id: studentId,
      expiry_date: expiryDate,
      is_used: true,
      created_by_id: staffId,
    };

    await paymentReferenceService.createPaymentReference(payload, transaction);
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * Generate payment Reference By Direct Post
 */
const generatePaymentReferenceBySponsorBulkPayment = async function (
  data,
  student,
  staffId,
  transaction
) {
  try {
    const generatedBy = 'SPONSOR-BULK-PAYMENT';
    const expiryDate = moment.now();

    const payload = {
      system_prn: data.system_prn,
      ura_prn: data.system_prn,
      search_code: 'NOT AVAILABLE',
      tax_payer_name: student.surname + ' ' + student.other_names,
      payment_mode: data.payment_mode,
      amount: data.amount_paid,
      generated_by: generatedBy,
      student_id: data.student_id,
      expiry_date: expiryDate,
      is_used: true,
      created_by_id: staffId,
    };

    const result = await paymentReferenceService.createPaymentReference(
      payload,
      transaction
    );

    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} payload
 * @returns
 */
const generatePaymentReferenceForAllUnpaidInvoices = async function (payload) {
  try {
    payload.tax_head = envConfig.TAX_HEAD_CODE;
    payload.system_prn = generateSystemReference();

    const findStudentProgramme = await studentService
      .findOneStudentProgramme({
        where: {
          student_id: payload.student_id,
          is_current_programme: true,
        },
        include: [
          {
            association: 'student',
            attributes: ['id', 'surname', 'other_names', 'email', 'phone'],
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

    payload.tax_payer_name = `${findStudentProgramme.student.surname} ${findStudentProgramme.student.other_names}`;

    const paymentReferenceTuitionInvoices = [];
    const paymentReferenceFunctionalFeesInvoices = [];
    const paymentReferenceOtherFeesInvoices = [];
    const paymentReferenceManualInvoices = [];
    const tuitionAndFunctionalInvoices = [];
    const feesElementAllocationData = [];

    let totalAmount = 0;

    if (!isEmpty(payload.tuition_invoices)) {
      // payload.tuition_invoices.forEach((tuitionInvoice) => {
      //   totalAmount += parseFloat(tuitionInvoice.amount_due);
      //   paymentReferenceTuitionInvoices.push({
      //     tuition_invoice_id: tuitionInvoice.id,
      //     amount: tuitionInvoice.amount_due,
      //   });
      // });

      for (const tuitionInvoice of payload.tuition_invoices) {
        totalAmount += parseFloat(tuitionInvoice.amount_due);

        const findInvoice = await invoiceService
          .findOneTuitionInvoiceRecord({
            where: {
              id: tuitionInvoice.id,
            },
            attributes: [
              'id',
              'enrollment_id',
              'student_id',
              'student_programme_id',
              'amount_due',
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
          .then((res) => {
            if (res) {
              return res.toJSON();
            }
          });

        if (!findInvoice) {
          throw new Error(`Unable To Find One Of The Tuition Invoice Records.`);
        }

        paymentReferenceTuitionInvoices.push({
          tuition_invoice_id: tuitionInvoice.id,
          amount: tuitionInvoice.amount_due,
        });

        tuitionAndFunctionalInvoices.push(findInvoice);

        const category = { category: 'tuition' };

        const tuitionItemAmount = feesItemAllocation(
          category,
          findInvoice,
          tuitionInvoice.amount_due
        );

        if (tuitionItemAmount) {
          tuitionItemAmount.tuitionInvoiceFeesElement.forEach((element) => {
            feesElementAllocationData.push({
              fees_element_id: element.fees_element_id,
              amount: element.item_amount,
              invoice_number: tuitionItemAmount.invoice_number,
              academic_year_id:
                tuitionItemAmount.enrollment.event.academicYear
                  .academic_year_id,
              semester_id:
                tuitionItemAmount.enrollment.event.semester.semester_id,
              study_year_id:
                tuitionItemAmount.enrollment.studyYear.programme_study_year_id,
            });
          });
        }
      }
    }

    if (!isEmpty(payload.functional_fees_invoices)) {
      // payload.functional_fees_invoices.forEach((functionalFeesInvoice) => {
      //   totalAmount += parseFloat(functionalFeesInvoice.amount_due);
      //   paymentReferenceFunctionalFeesInvoices.push({
      //     functional_fees_invoice_id: functionalFeesInvoice.id,
      //     amount: functionalFeesInvoice.amount_due,
      //   });
      // });

      for (const functionalFeesInvoice of payload.functional_fees_invoices) {
        totalAmount += parseFloat(functionalFeesInvoice.amount_due);

        const findInvoice = await invoiceService
          .findOneFunctionalInvoiceRecord({
            where: {
              id: functionalFeesInvoice.id,
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
                association: 'functionalElements',
                attributes: ['id', 'fees_element_id', 'amount', 'new_amount'],
              },
            ],
            nest: true,
          })
          .then((res) => {
            if (res) {
              return res.toJSON();
            }
          });

        if (!findInvoice) {
          throw new Error(
            `Unable To Find One Of The Functional Fees Invoice Records.`
          );
        }

        paymentReferenceFunctionalFeesInvoices.push({
          functional_fees_invoice_id: functionalFeesInvoice.id,
          amount: functionalFeesInvoice.amount_due,
        });

        tuitionAndFunctionalInvoices.push(findInvoice);

        const category = { category: 'functional' };

        const functionalItemAmount = feesItemAllocation(
          category,
          findInvoice,
          functionalFeesInvoice.amount_due
        );

        if (functionalItemAmount) {
          functionalItemAmount.functionalElements.forEach((element) => {
            feesElementAllocationData.push({
              fees_element_id: element.fees_element_id,
              amount: element.item_amount,
              invoice_number: functionalItemAmount.invoice_number,
              academic_year_id:
                functionalItemAmount.enrollment.event.academicYear
                  .academic_year_id,
              semester_id:
                functionalItemAmount.enrollment.event.semester.semester_id,
              study_year_id:
                functionalItemAmount.enrollment.studyYear
                  .programme_study_year_id,
            });
          });
        }
      }
    }

    if (!isEmpty(payload.other_fees_invoices)) {
      // payload.other_fees_invoices.forEach((otherFeesInvoice) => {
      //   totalAmount += parseFloat(otherFeesInvoice.amount_due);
      //   paymentReferenceOtherFeesInvoices.push({
      //     other_fees_invoice_id: otherFeesInvoice.id,
      //     amount: otherFeesInvoice.amount_due,
      //   });
      // });

      for (const otherFeesInvoice of payload.other_fees_invoices) {
        totalAmount += parseFloat(otherFeesInvoice.amount_due);

        const findInvoice = await invoiceService
          .findOneOtherFeesInvoiceRecords({
            where: {
              id: otherFeesInvoice.id,
            },
            attributes: [
              'id',
              'enrollment_id',
              'student_id',
              'student_programme_id',
              'invoice_amount',
              'amount_paid',
              'amount_due',
              'percentage_completion',
              'invoice_status_id',
              'currency',
              'description',
              'invoice_number',
            ],
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
          .then((res) => {
            if (res) {
              return res.toJSON();
            }
          });

        paymentReferenceOtherFeesInvoices.push({
          other_fees_invoice_id: otherFeesInvoice.id,
          amount: otherFeesInvoice.amount_due,
        });

        const category = { category: 'other' };

        const otherItemAmount = feesItemAllocation(
          category,
          findInvoice,
          otherFeesInvoice.amount_due
        );

        if (otherItemAmount) {
          otherItemAmount.otherFeesInvoiceFeesElements.forEach((element) => {
            feesElementAllocationData.push({
              fees_element_id: element.fees_element_id,
              amount: element.item_amount,
              invoice_number: otherItemAmount.invoice_number,
              academic_year_id:
                otherItemAmount.enrollment.event.academicYear.academic_year_id,
              semester_id:
                otherItemAmount.enrollment.event.semester.semester_id,
              study_year_id:
                otherItemAmount.enrollment.studyYear.programme_study_year_id,
            });
          });
        }
      }
    }

    if (!isEmpty(payload.manual_invoices)) {
      // payload.manual_invoices.forEach((manualInvoice) => {
      //   totalAmount += parseFloat(manualInvoice.amount_due);
      //   paymentReferenceManualInvoices.push({
      //     manual_invoice_id: manualInvoice.id,
      //     amount: manualInvoice.amount_due,
      //   });
      // });

      for (const manualInvoice of payload.manual_invoices) {
        totalAmount += parseFloat(manualInvoice.amount_due);

        const findInvoice = await invoiceService
          .findOneManualInvoiceRecord({
            where: {
              id: manualInvoice.id,
            },
            attributes: [
              'id',
              'student_programme_id',
              'invoice_amount',
              'amount_paid',
              'amount_due',
              'percentage_completion',
              'invoice_status_id',
              'currency',
              'description',
              'invoice_number',
              'academic_year_id',
              'semester_id',
              'study_year_id',
            ],
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
          .then((res) => {
            if (res) {
              return res.toJSON();
            }
          });

        paymentReferenceManualInvoices.push({
          manual_invoice_id: manualInvoice.id,
          amount: manualInvoice.amount_due,
        });

        const category = { category: 'manual' };

        const manualItemAmount = feesItemAllocation(
          category,
          findInvoice,
          manualInvoice.amount_due
        );

        if (manualItemAmount) {
          manualItemAmount.elements.forEach((element) => {
            feesElementAllocationData.push({
              fees_element_id: element.fees_element_id,
              amount: element.item_amount,
              invoice_number: manualItemAmount.invoice_number,
              academic_year_id: manualItemAmount.academicYear.academic_year_id,
              semester_id: manualItemAmount.semester.semester_id,
              study_year_id: manualItemAmount.studyYear.programme_study_year_id,
            });
          });
        }
      }
    }

    const groupedRecords = chain(tuitionAndFunctionalInvoices)
      .groupBy('enrollment_id')
      .map((value, key) => ({
        enrollment_id: key,
        records: orderBy(value, ['amount_due'], ['desc']),
      }))
      .value();

    const paymentReference = await model.sequelize.transaction(
      async (transaction) => {
        let instructions = '';

        let totalSurcharge = 0;

        if (!isEmpty(groupedRecords)) {
          for (const group of groupedRecords) {
            const latePaymentOtherFeesInvoice =
              await generateLateFeePaymentInvoice(
                group.enrollment_id,
                group.records[0].enrollment.enrollment_status_id,
                findStudentProgramme,
                transaction
              );

            if (latePaymentOtherFeesInvoice) {
              totalAmount += parseFloat(
                latePaymentOtherFeesInvoice.dataValues.amount_due
              );

              paymentReferenceOtherFeesInvoices.push({
                other_fees_invoice_id:
                  latePaymentOtherFeesInvoice.dataValues.id,
                amount: latePaymentOtherFeesInvoice.dataValues.amount_due,
              });

              totalSurcharge += parseFloat(
                latePaymentOtherFeesInvoice.dataValues.amount_due
              );
            }
          }
        }

        payload.amount = totalAmount;
        payload.payment_mode = 'CASH';
        payload.payment_bank_code = 'STN';

        const requestUraPrnData = {
          TaxHead: payload.tax_head,
          TaxPayerName: payload.tax_payer_name,
          TaxPayerBankCode: payload.payment_bank_code,
          PaymentBankCode: payload.payment_bank_code,
          MobileNo: payload.payment_mobile_no,
          ReferenceNo: payload.system_prn,
          ExpiryDays: envConfig.PAYMENT_REFERENCE_EXPIRES_IN,
          Amount: payload.amount,
          PaymentMode: payload.payment_mode,
          Email: findStudentProgramme.student.email,
        };

        const genPRN = await generatePRN(requestUraPrnData);

        payload.ura_prn = genPRN.ura_prn;
        payload.expiry_date = genPRN.expiry_date;
        payload.search_code = genPRN.search_code;

        payload.tuitionInvoice = paymentReferenceTuitionInvoices;
        payload.functionalFeesInvoice = paymentReferenceFunctionalFeesInvoices;
        payload.otherFeesInvoices = paymentReferenceOtherFeesInvoices;
        payload.manualInvoices = paymentReferenceManualInvoices;

        if (!isEmpty(feesElementAllocationData)) {
          const mappedData = feesElementAllocationData.map((obj) => ({
            ...obj,
            ura_prn: genPRN.ura_prn,
            system_prn: payload.system_prn,
            student_id: findStudentProgramme.student_id,
            student_programme_id: findStudentProgramme.id,
          }));

          payload.elementAllocation = mappedData;
        }

        const result = await paymentReferenceService.createPaymentReference(
          payload,
          transaction
        );

        const prnTrackerData = {
          student_id: payload.student_id,
          category: 'STUDENT-TRANSACTION',
          system_prn: payload.system_prn,
          ura_prn: genPRN.ura_prn,
          search_code: genPRN.search_code,
          amount: payload.amount,
          tax_payer_name: payload.tax_payer_name,
          payment_mode: payload.payment_mode,
          payment_bank_code: payload.payment_bank_code,
          tax_payer_bank_code: payload.tax_payer_bank_code,
          generated_by: payload.generated_by,
          expiry_date: genPRN.expiry_date,
        };

        await prnTrackerRecord(prnTrackerData, transaction);

        if (totalSurcharge > 0) {
          instructions = `You Have Been Billed An Additional ${totalSurcharge} As A Surcharge For LATE FEES PAYMENT.`;
        }

        result.dataValues.instructions = instructions;

        return result;
      }
    );

    return paymentReference;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} payload
 * @returns
 */
const generatePaymentReferenceForSelectUnpaidInvoices = async function (
  payload
) {
  try {
    payload.tax_head = envConfig.TAX_HEAD_CODE;
    payload.system_prn = generateSystemReference();

    const findStudentProgramme = await studentService
      .findOneStudentProgramme({
        where: {
          student_id: payload.student_id,
          is_current_programme: true,
        },
        include: [
          {
            association: 'student',
            attributes: ['id', 'surname', 'other_names', 'email', 'phone'],
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

    // payload.tax_payer_name = `${findStudentProgramme.student.surname} ${findStudentProgramme.student.other_names} - ${findStudentProgramme.student_number}`;
    payload.tax_payer_name = `${findStudentProgramme.student.surname} ${findStudentProgramme.student.other_names}`;

    const paymentReferenceTuitionInvoices = [];
    const paymentReferenceFunctionalFeesInvoices = [];
    const paymentReferenceOtherFeesInvoices = [];
    const paymentReferenceManualInvoices = [];
    const tuitionAndFunctionalInvoices = [];
    const feesElementAllocationData = [];

    let totalAmount = 0;
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

    if (!isEmpty(payload.tuition_invoices)) {
      for (const tuitionInvoice of payload.tuition_invoices) {
        const findInvoice = await invoiceService
          .findOneTuitionInvoiceRecord({
            where: {
              id: tuitionInvoice.tuition_invoice_id,
              student_id: payload.student_id,
              invoice_status_id: findActiveInvoiceStatusId,
            },
            attributes: [
              'id',
              'enrollment_id',
              'student_id',
              'student_programme_id',
              'invoice_amount',
              'amount_paid',
              'amount_due',
              'percentage_completion',
              'invoice_status_id',
              'currency',
              'description',
              'invoice_number',
            ],
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
                association: 'tuitionInvoiceFeesElement',
                attributes: ['id', 'fees_element_id', 'amount', 'new_amount'],
              },
            ],
            nest: true,
          })
          .then((res) => {
            if (res) {
              return res.toJSON();
            }
          });

        if (!findInvoice) {
          if (payload.generated_by === 'STAFF') {
            throw new Error(
              `The Tuition Invoice With Amount Allocation Of ${tuitionInvoice.amount} Is Either Inactive Or Doesn't Belong To This Student.`
            );
          } else {
            throw new Error(
              `The Tuition Invoice With Amount Allocation Of ${tuitionInvoice.amount} Is Either Inactive Or Doesn't Belong To You.`
            );
          }
        }

        if (tuitionInvoice.amount > findInvoice.amount_due) {
          throw new Error(
            `The Tuition Invoice Invoice With Amount Allocation Of ${tuitionInvoice.amount} Must Not Exceed ${findInvoice.amount_due}.`
          );
        }

        const category = { category: 'tuition' };

        const tuitionItemAmount = feesItemAllocation(
          category,
          findInvoice,
          tuitionInvoice.amount
        );

        totalAmount += parseInt(tuitionInvoice.amount, 10);
        paymentReferenceTuitionInvoices.push({
          ...tuitionInvoice,
        });

        tuitionAndFunctionalInvoices.push(findInvoice);

        if (tuitionItemAmount) {
          tuitionItemAmount.tuitionInvoiceFeesElement.forEach((element) => {
            feesElementAllocationData.push({
              fees_element_id: element.fees_element_id,
              amount: element.item_amount,
              invoice_number: tuitionItemAmount.invoice_number,
              academic_year_id:
                tuitionItemAmount.enrollment.event.academicYear
                  .academic_year_id,
              semester_id:
                tuitionItemAmount.enrollment.event.semester.semester_id,
              study_year_id:
                tuitionItemAmount.enrollment.studyYear.programme_study_year_id,
            });
          });
        }
      }
    }

    if (!isEmpty(payload.functional_fees_invoices)) {
      for (const functionalInvoice of payload.functional_fees_invoices) {
        const findInvoice = await invoiceService
          .findOneFunctionalInvoiceRecord({
            where: {
              id: functionalInvoice.functional_fees_invoice_id,
              student_id: payload.student_id,
              invoice_status_id: findActiveInvoiceStatusId,
            },
            attributes: [
              'id',
              'enrollment_id',
              'student_id',
              'student_programme_id',
              'invoice_amount',
              'amount_paid',
              'amount_due',
              'percentage_completion',
              'invoice_status_id',
              'currency',
              'description',
              'invoice_number',
            ],
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
                association: 'functionalElements',
                attributes: ['id', 'fees_element_id', 'amount', 'new_amount'],
              },
            ],
            nest: true,
          })
          .then((res) => {
            if (res) {
              return res.toJSON();
            }
          });

        if (!findInvoice) {
          if (payload.generated_by === 'STAFF') {
            throw new Error(
              `The Functional Fees Invoice With Amount Allocation Of ${functionalInvoice.amount} Is Either Inactive Or Doesn't Belong To This Student.`
            );
          } else {
            throw new Error(
              `The Functional Fees Invoice With Amount Allocation Of ${functionalInvoice.amount} Is Either Inactive Or Doesn't Belong To You.`
            );
          }
        }

        if (functionalInvoice.amount > findInvoice.amount_due) {
          throw new Error(
            `The Functional Fees Invoice With Amount Allocation Of ${functionalInvoice.amount} Must Not Exceed ${findInvoice.amount_due}.`
          );
        }

        const category = { category: 'functional' };

        const functionalItemAmount = feesItemAllocation(
          category,
          findInvoice,
          functionalInvoice.amount
        );

        totalAmount += parseInt(functionalInvoice.amount, 10);
        paymentReferenceFunctionalFeesInvoices.push({
          ...functionalInvoice,
        });

        tuitionAndFunctionalInvoices.push(findInvoice);

        if (functionalItemAmount) {
          functionalItemAmount.functionalElements.forEach((element) => {
            feesElementAllocationData.push({
              fees_element_id: element.fees_element_id,
              amount: element.item_amount,
              invoice_number: functionalItemAmount.invoice_number,
              academic_year_id:
                functionalItemAmount.enrollment.event.academicYear
                  .academic_year_id,
              semester_id:
                functionalItemAmount.enrollment.event.semester.semester_id,
              study_year_id:
                functionalItemAmount.enrollment.studyYear
                  .programme_study_year_id,
            });
          });
        }
      }
    }

    if (!isEmpty(payload.other_fees_invoices)) {
      for (const otherFeesInvoice of payload.other_fees_invoices) {
        const findInvoice = await invoiceService
          .findOneOtherFeesInvoiceRecords({
            where: {
              id: otherFeesInvoice.other_fees_invoice_id,
              student_id: payload.student_id,
              invoice_status_id: findActiveInvoiceStatusId,
            },
            attributes: [
              'id',
              'enrollment_id',
              'student_id',
              'student_programme_id',
              'invoice_amount',
              'amount_paid',
              'amount_due',
              'percentage_completion',
              'invoice_status_id',
              'currency',
              'description',
              'invoice_number',
            ],
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
          .then((res) => {
            if (res) {
              return res.toJSON();
            }
          });

        if (!findInvoice) {
          if (payload.generated_by === 'STAFF') {
            throw new Error(
              `The other Fees Invoice With Amount Allocation Of ${otherFeesInvoice.amount} Is Either Inactive Or Doesn't Belong To This Student.`
            );
          } else {
            throw new Error(
              `The other Fees Invoice With Amount Allocation Of ${otherFeesInvoice.amount} Is Either Inactive Or Doesn't Belong To You.`
            );
          }
        }

        if (otherFeesInvoice.amount > findInvoice.amount_due) {
          throw new Error(
            `The Other Fees Invoice With Amount Allocation Of ${otherFeesInvoice.amount} Must Not Exceed ${findInvoice.amount_due}.`
          );
        }

        const category = { category: 'other' };

        const otherItemAmount = feesItemAllocation(
          category,
          findInvoice,
          otherFeesInvoice.amount
        );

        totalAmount += parseInt(otherFeesInvoice.amount, 10);
        paymentReferenceOtherFeesInvoices.push({
          ...otherFeesInvoice,
        });

        if (otherItemAmount) {
          otherItemAmount.otherFeesInvoiceFeesElements.forEach((element) => {
            feesElementAllocationData.push({
              fees_element_id: element.fees_element_id,
              amount: element.item_amount,
              invoice_number: otherItemAmount.invoice_number,
              academic_year_id:
                otherItemAmount.enrollment.event.academicYear.academic_year_id,
              semester_id:
                otherItemAmount.enrollment.event.semester.semester_id,
              study_year_id:
                otherItemAmount.enrollment.studyYear.programme_study_year_id,
            });
          });
        }
      }
    }

    if (!isEmpty(payload.manual_invoices)) {
      for (const manualInvoice of payload.manual_invoices) {
        const findInvoice = await invoiceService
          .findOneManualInvoiceRecord({
            where: {
              id: manualInvoice.manual_invoice_id,
              student_id: payload.student_id,
              invoice_status_id: findActiveInvoiceStatusId,
            },
            attributes: [
              'id',
              'student_programme_id',
              'invoice_amount',
              'amount_paid',
              'amount_due',
              'percentage_completion',
              'invoice_status_id',
              'currency',
              'description',
              'invoice_number',
              'academic_year_id',
              'semester_id',
              'study_year_id',
            ],
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
          .then((res) => {
            if (res) {
              return res.toJSON();
            }
          });

        if (!findInvoice) {
          if (payload.generated_by === 'STAFF') {
            throw new Error(
              `The Manual Invoice With Amount Allocation Of ${manualInvoice.amount} Is Either Inactive Or Doesn't Belong To This Student.`
            );
          } else {
            throw new Error(
              `The Manual Invoice With Amount Allocation Of ${manualInvoice.amount} Is Either Inactive Or Doesn't Belong To You.`
            );
          }
        }

        if (manualInvoice.amount > findInvoice.amount_due) {
          throw new Error(
            `The Manual Invoice With Amount Allocation Of ${manualInvoice.amount} Must Not Exceed ${findInvoice.amount_due}.`
          );
        }

        const category = { category: 'manual' };

        const manualItemAmount = feesItemAllocation(
          category,
          findInvoice,
          manualInvoice.amount
        );

        totalAmount += parseInt(manualInvoice.amount, 10);
        paymentReferenceManualInvoices.push({
          ...manualInvoice,
        });

        if (manualItemAmount) {
          manualItemAmount.elements.forEach((element) => {
            feesElementAllocationData.push({
              fees_element_id: element.fees_element_id,
              amount: element.item_amount,
              invoice_number: manualItemAmount.invoice_number,
              academic_year_id: manualItemAmount.academicYear.academic_year_id,
              semester_id: manualItemAmount.semester.semester_id,
              study_year_id: manualItemAmount.studyYear.programme_study_year_id,
            });
          });
        }
      }
    }

    const groupedRecords = chain(tuitionAndFunctionalInvoices)
      .groupBy('enrollment_id')
      .map((value, key) => ({
        enrollment_id: key,
        records: orderBy(value, ['amount_due'], ['desc']),
      }))
      .value();

    const paymentReference = await model.sequelize.transaction(
      async (transaction) => {
        let instructions = '';

        let totalSurcharge = 0;

        if (!isEmpty(groupedRecords)) {
          for (const group of groupedRecords) {
            const latePaymentOtherFeesInvoice =
              await generateLateFeePaymentInvoice(
                group.enrollment_id,
                group.records[0].enrollment.enrollment_status_id,
                findStudentProgramme,
                transaction
              );

            if (latePaymentOtherFeesInvoice) {
              totalAmount += parseFloat(
                latePaymentOtherFeesInvoice.dataValues.amount_due
              );

              paymentReferenceOtherFeesInvoices.push({
                other_fees_invoice_id:
                  latePaymentOtherFeesInvoice.dataValues.id,
                amount: latePaymentOtherFeesInvoice.dataValues.amount_due,
              });

              totalSurcharge += parseFloat(
                latePaymentOtherFeesInvoice.dataValues.amount_due
              );
            }
          }
        }

        payload.amount = totalAmount;
        payload.payment_mode = 'CASH';
        payload.payment_bank_code = 'STN';

        const requestUraPrnData = {
          TaxHead: payload.tax_head,
          TaxPayerName: payload.tax_payer_name,
          TaxPayerBankCode: payload.payment_bank_code,
          PaymentBankCode: payload.payment_bank_code,
          MobileNo: payload.payment_mobile_no,
          ReferenceNo: payload.system_prn,
          ExpiryDays: envConfig.PAYMENT_REFERENCE_EXPIRES_IN,
          Amount: payload.amount,
          PaymentMode: payload.payment_mode,
          Email: findStudentProgramme.student.email,
        };

        const genPRN = await generatePRN(requestUraPrnData);

        payload.ura_prn = genPRN.ura_prn;
        payload.expiry_date = genPRN.expiry_date;
        payload.search_code = genPRN.search_code;

        payload.tuitionInvoice = paymentReferenceTuitionInvoices;
        payload.functionalFeesInvoice = paymentReferenceFunctionalFeesInvoices;
        payload.otherFeesInvoices = paymentReferenceOtherFeesInvoices;
        payload.manualInvoices = paymentReferenceManualInvoices;

        if (!isEmpty(feesElementAllocationData)) {
          const mappedData = feesElementAllocationData.map((obj) => ({
            ...obj,
            ura_prn: genPRN.ura_prn,
            system_prn: payload.system_prn,
            student_id: findStudentProgramme.student_id,
            student_programme_id: findStudentProgramme.id,
          }));

          payload.elementAllocation = mappedData;
        }

        const result = await paymentReferenceService.createPaymentReference(
          payload,
          transaction
        );

        const prnTrackerData = {
          student_id: payload.student_id,
          category: 'STUDENT-TRANSACTION',
          system_prn: payload.system_prn,
          ura_prn: genPRN.ura_prn,
          search_code: genPRN.search_code,
          amount: payload.amount,
          tax_payer_name: payload.tax_payer_name,
          payment_mode: payload.payment_mode,
          payment_bank_code: payload.payment_bank_code,
          tax_payer_bank_code: payload.tax_payer_bank_code,
          generated_by: payload.generated_by,
          expiry_date: genPRN.expiry_date,
        };

        await prnTrackerRecord(prnTrackerData, transaction);

        if (totalSurcharge > 0) {
          instructions = `You Have Been Billed An Additional ${totalSurcharge} As A Surcharge For LATE FEES PAYMENT.`;
        }

        result.dataValues.instructions = instructions;

        return result;
      }
    );

    return paymentReference;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} payload
 * @returns
 */
const createPaymentReferenceForFuture = async function (payload) {
  try {
    payload.tax_head = envConfig.TAX_HEAD_CODE;
    payload.system_prn = generateSystemReference();

    const findTaxPayer = await studentService
      .findOneStudent({
        where: {
          id: payload.student_id,
        },
        attributes: ['id', 'surname', 'other_names', 'email', 'phone'],
        include: [
          {
            association: 'programmes',
          },
        ],
        nest: true,
      })
      .then((res) => {
        if (res) {
          return res.toJSON();
        }
      });

    if (!findTaxPayer) {
      throw new Error(`Student record doesn't exist.`);
    }

    const findCurrentProgramme = findTaxPayer.programmes.find(
      (stdProg) => stdProg.is_current_programme === true
    );

    if (!findCurrentProgramme) throw new Error('There is no active programme');

    payload.student_programme_id = findCurrentProgramme.id;
    // payload.tax_payer_name = `${findTaxPayer.surname} ${
    //   findTaxPayer.other_names
    // } - ${findCurrentProgramme ? findCurrentProgramme.student_number : ''}`;

    payload.tax_payer_name = `${findTaxPayer.surname} ${findTaxPayer.other_names}`;

    payload.payment_mode = 'CASH';
    payload.payment_bank_code = 'STN';

    const requestUraPrnData = {
      TaxHead: payload.tax_head,
      TaxPayerName: payload.tax_payer_name,
      TaxPayerBankCode: payload.payment_bank_code,
      PaymentBankCode: payload.payment_bank_code,
      MobileNo: payload.payment_mobile_no ? payload.payment_mobile_no : null,
      ReferenceNo: payload.system_prn,
      ExpiryDays: envConfig.PAYMENT_REFERENCE_EXPIRES_IN,
      Amount: payload.amount,
      PaymentMode: payload.payment_mode,
      Email: findTaxPayer.email,
    };

    const genPRN = await generatePRN(requestUraPrnData);

    payload.ura_prn = genPRN.ura_prn;
    payload.expiry_date = genPRN.expiry_date;
    payload.search_code = genPRN.search_code;

    const paymentReference = await model.sequelize.transaction(
      async (transaction) => {
        const result =
          await paymentReferenceService.createPaymentReferenceForFuturePayments(
            payload,
            transaction
          );

        const prnTrackerData = {
          student_id: payload.student_id,
          category: 'STUDENT-TRANSACTION',
          system_prn: payload.system_prn,
          ura_prn: genPRN.ura_prn,
          search_code: genPRN.search_code,
          amount: payload.amount,
          tax_payer_name: payload.tax_payer_name,
          payment_mode: payload.payment_mode,
          payment_bank_code: payload.payment_bank_code,
          tax_payer_bank_code: payload.tax_payer_bank_code,
          generated_by: payload.generated_by,
          expiry_date: genPRN.expiry_date,
        };

        await prnTrackerRecord(prnTrackerData, transaction);

        return result;
      }
    );

    return paymentReference;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} payload
 * @returns
 */
const createPaymentReferenceForApplicants = async (payload) => {
  try {
    payload.tax_head = envConfig.TAX_HEAD_CODE;
    payload.system_prn = generateSystemReference();
    payload.payment_mode = 'CASH';
    payload.payment_bank_code = 'STN';

    const findRunningAdmissionApplicant =
      await runningAdmissionApplicantService.findOneRunningAdmissionApplicant({
        where: {
          form_id: payload.formId,
          applicant_id: payload.applicant_id,
        },
        include: [
          {
            association: 'applicant',
            attributes: ['id', 'surname', 'other_names', 'email', 'phone'],
          },
        ],
        raw: true,
      });

    if (!findRunningAdmissionApplicant) {
      throw new Error(`Invalid Application Form.`);
    }

    if (findRunningAdmissionApplicant.application_status === 'IN-PROGRESS') {
      throw new Error(`Your Application Is Not Yet Complete.`);
    }
    if (
      findRunningAdmissionApplicant.payment_status === 'T' &&
      findRunningAdmissionApplicant.is_used === true
    ) {
      throw new Error(`Your Application Is already PaidFor`);
    }

    if (findRunningAdmissionApplicant.expiry_date) {
      if (moment(findRunningAdmissionApplicant.expiry_date) > moment.now()) {
        throw new Error(
          `Your Current Reference Number ${findRunningAdmissionApplicant.ura_prn} Has Not Yet Expired, Please Generate A New One After ${findRunningAdmissionApplicant.expiry_date}.`
        );
      }
    }

    const billingData = await billApplicants(
      findRunningAdmissionApplicant,
      findRunningAdmissionApplicant.form_id,
      {
        id: payload.applicant_id,
      }
    );

    payload.tax_payer_name = `${findRunningAdmissionApplicant['applicant.surname']} ${findRunningAdmissionApplicant['applicant.other_names']}`;

    const paymentReference = await model.sequelize.transaction(
      async (transaction) => {
        if (
          parseInt(billingData.amount, 10) !==
          parseInt(findRunningAdmissionApplicant.amount, 10)
        ) {
          await runningAdmissionApplicantService.updateRunningAdmissionApplicant(
            findRunningAdmissionApplicant.id,
            {
              amount: billingData.amount,
            },
            transaction
          );
        }

        const requestUraPrnData = {
          TaxHead: payload.tax_head,
          TaxPayerName: payload.tax_payer_name,
          TaxPayerBankCode: payload.payment_bank_code,
          PaymentBankCode: payload.payment_bank_code,
          ReferenceNo: payload.system_prn,
          ExpiryDays: envConfig.PAYMENT_REFERENCE_EXPIRES_IN,
          Amount: billingData.amount,
          PaymentMode: payload.payment_mode,
          MobileNo: findRunningAdmissionApplicant.phone,
          Email: findRunningAdmissionApplicant.email,
        };

        const genPRN = await generatePRN(requestUraPrnData);

        const updateData = {};

        updateData.ura_prn = genPRN.ura_prn;
        updateData.expiry_date = genPRN.expiry_date;
        updateData.search_code = genPRN.search_code;
        updateData.amount = billingData.amount;
        updateData.tax_payer_name = payload.tax_payer_name;
        updateData.payment_mode = payload.payment_mode;
        updateData.payment_bank_code = payload.payment_bank_code;
        updateData.tax_payer_bank_code = payload.tax_payer_bank_code;
        updateData.generated_by = payload.tax_payer_name;
        updateData.system_prn = payload.system_prn;
        updateData.is_used = false;
        updateData.payment_status = 'PENDING';

        const result =
          await runningAdmissionApplicantService.updateRunningAdmissionApplicant(
            findRunningAdmissionApplicant.id,
            updateData,
            transaction
          );

        const prnTrackerData = {
          running_admission_applicant_id: findRunningAdmissionApplicant.id,
          category: 'APPLICANTS',
          system_prn: payload.system_prn,
          ura_prn: genPRN.ura_prn,
          search_code: genPRN.search_code,
          amount: billingData.amount,
          tax_payer_name: payload.tax_payer_name,
          payment_mode: payload.payment_mode,
          payment_bank_code: payload.payment_bank_code,
          tax_payer_bank_code: payload.tax_payer_bank_code,
          generated_by: payload.tax_payer_name,
          expiry_date: genPRN.expiry_date,
        };

        await prnTrackerRecord(prnTrackerData, transaction);

        return isArray(result) ? result[1][0] : result;
      }
    );

    return paymentReference;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} payload
 * @param {*} transaction
 */
const prnTrackerRecord = async function (payload, transaction) {
  const response = await universalInvoiceService.createPrnTrackerRecord(
    payload,
    transaction
  );

  return response;
};

/**
 *
 * @param {*} category
 * @param {*} invoiceObj
 * @param {*} prnAmount
 * @returns
 */
const feesItemAllocation = (category, invoiceObj, prnAmount) => {
  try {
    const invoiceAmount = invoiceObj.invoice_amount;

    const categoryObj = category;

    if (categoryObj.category === 'tuition') {
      invoiceObj.tuitionInvoiceFeesElement.map((element) => {
        const actualItemBill = element.new_amount
          ? element.new_amount
          : element.amount;

        const itemAmount = (
          (actualItemBill / invoiceAmount) *
          prnAmount
        ).toFixed(0);

        element.item_amount = parseInt(itemAmount, 10);

        return element;
      });
    } else if (categoryObj.category === 'functional') {
      invoiceObj.functionalElements.map((element) => {
        const actualItemBill = element.new_amount
          ? element.new_amount
          : element.amount;

        const itemAmount = (
          (actualItemBill / invoiceAmount) *
          prnAmount
        ).toFixed(0);

        element.item_amount = parseInt(itemAmount, 10);

        return element;
      });
    } else if (categoryObj.category === 'other') {
      invoiceObj.otherFeesInvoiceFeesElements.map((element) => {
        const actualItemBill = element.new_amount
          ? element.new_amount
          : element.amount;

        const itemAmount = (
          (actualItemBill / invoiceAmount) *
          prnAmount
        ).toFixed(0);

        element.item_amount = parseInt(itemAmount, 10);

        return element;
      });
    } else if (categoryObj.category === 'manual') {
      invoiceObj.elements.map((element) => {
        const itemAmount = (
          (element.amount / invoiceAmount) *
          prnAmount
        ).toFixed(0);

        element.item_amount = parseInt(itemAmount, 10);

        return element;
      });
    } else if (categoryObj.category === 'graduation') {
      invoiceObj.graduationInvoiceFeesElement.map((element) => {
        const itemAmount = (
          (element.amount / invoiceAmount) *
          prnAmount
        ).toFixed(0);

        element.item_amount = parseInt(itemAmount, 10);

        return element;
      });
    }

    const data = invoiceObj;

    return data;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  generatePaymentReference,
  getStudentPaymentReferences,
  createPaymentReferenceForFuture,
  createPaymentReferenceForApplicants,
  generatePaymentReferenceByDirectPost,
  generatePaymentReferenceForAllUnpaidInvoices,
  generatePaymentReferenceForSelectUnpaidInvoices,
  generatePaymentReferenceBySponsorBulkPayment,
  prnTrackerRecord,
  generatePaymentReferenceRecord,
  feesItemAllocation,
};
