/* eslint-disable indent */
const {
  invoiceService,
  metadataValueService,
  paymentReferenceService,
  studentService,
} = require('@services/index');

const { isEmpty, chain, orderBy } = require('lodash');
const moment = require('moment');
const { Op } = require('sequelize');
const { getMetadataValueId } = require('@controllers/Helpers/programmeHelper');
const { generateLateFeePaymentInvoice } = require('./enrollmentRecord');
const { feesItemAllocation } = require('./paymentReferenceRecord');
const { generateSystemReference } = require('./paymentReferenceHelper');

/**
 *
 * @param {*} payload
 * @param {*} studentId
 * @param {*} paymentTransaction
 * @param {*} totalAllocationAmount
 * @param {*} transaction
 * @returns
 */
const allocateMoneyToAnInvoice = async function (
  payload,
  studentId,
  paymentTransaction,
  totalAllocationAmount,
  transaction
) {
  try {
    const paymentTransactionId = paymentTransaction.id;

    let arrayOfTuitionInvoices = [];

    let arrayOfFunctionalInvoices = [];

    let arrayOfOtherFeesInvoices = [];

    let arrayOfManualInvoices = [];

    const tuitionAndFuntionalInvoices = [];

    const feesElementAllocationData = [];

    const findPaymentReference =
      await paymentReferenceService.findOnePaymentReference({
        where: {
          [Op.or]: [
            { ura_prn: paymentTransaction.ura_prn },
            { system_prn: paymentTransaction.system_prn },
          ],
        },
        raw: true,
      });

    const findStudentProgramme = await studentService
      .findOneStudentProgramme({
        where: {
          student_id: studentId,
          is_current_programme: true,
        },
        include: [
          {
            association: 'student',
            attributes: ['surname', 'other_names'],
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

    if (!isEmpty(payload.invoices)) {
      arrayOfTuitionInvoices = payload.invoices.filter((item) =>
        item.invoice_number.includes('T-INV')
      );
      arrayOfFunctionalInvoices = payload.invoices.filter((item) =>
        item.invoice_number.includes('F-INV')
      );
      arrayOfOtherFeesInvoices = payload.invoices.filter((item) =>
        item.invoice_number.includes('O-INV')
      );
      arrayOfManualInvoices = payload.invoices.filter((item) =>
        item.invoice_number.includes('M-INV')
      );

      const newResult = {
        tuition_invoices: null,
        functional_fees_invoices: null,
        other_fees_invoices: null,
        manual_invoices: null,
        tuition_elements: [],
        functional_elements: [],
        other_fees_elements: [],
        manual_fees_elements: [],
      };

      if (!isEmpty(arrayOfTuitionInvoices)) {
        const tuition = await handleTuitionInvoices(
          arrayOfTuitionInvoices,
          studentId,
          findActiveInvoiceStatusId,
          paymentTransactionId,
          transaction
        );

        newResult.tuition_invoices = tuition.updatedInvoices || null;

        tuitionAndFuntionalInvoices.push(...tuition.allTuitionInvoiceRecords);

        if (!isEmpty(tuition.feesElementAllocationData)) {
          feesElementAllocationData.push(...tuition.feesElementAllocationData);
        }
      }

      if (!isEmpty(arrayOfFunctionalInvoices)) {
        const functional = await handleFunctionalInvoices(
          arrayOfFunctionalInvoices,
          studentId,
          findActiveInvoiceStatusId,
          paymentTransactionId,
          transaction
        );

        newResult.functional_fees_invoices = functional.updatedInvoices || null;

        tuitionAndFuntionalInvoices.push(
          ...functional.allFunctionalInvoiceRecords
        );

        if (!isEmpty(functional.feesElementAllocationData)) {
          feesElementAllocationData.push(
            ...functional.feesElementAllocationData
          );
        }
      }

      if (!isEmpty(arrayOfOtherFeesInvoices)) {
        const otherFees = await handleOtherFeesInvoices(
          arrayOfOtherFeesInvoices,
          studentId,
          findActiveInvoiceStatusId,
          paymentTransactionId,
          transaction
        );

        newResult.other_fees_invoices = otherFees.updatedInvoices || null;

        if (!isEmpty(otherFees.feesElementAllocationData)) {
          feesElementAllocationData.push(
            ...otherFees.feesElementAllocationData
          );
        }
      }

      if (!isEmpty(arrayOfManualInvoices)) {
        const manual = await handleManualInvoices(
          arrayOfManualInvoices,
          studentId,
          findActiveInvoiceStatusId,
          paymentTransactionId,
          transaction
        );

        newResult.manual_invoices = manual.updatedInvoices || null;

        if (!isEmpty(manual.feesElementAllocationData)) {
          feesElementAllocationData.push(...manual.feesElementAllocationData);
        }
      }

      await handleFeesElementAllocation(
        feesElementAllocationData,
        findPaymentReference,
        paymentTransaction,
        findStudentProgramme,
        totalAllocationAmount,
        studentId,
        transaction
      );

      if (!isEmpty(tuitionAndFuntionalInvoices)) {
        const groupedRecords = chain(tuitionAndFuntionalInvoices)
          .groupBy('enrollment_id')
          .map((value, key) => ({
            enrollment_id: key,
            records: orderBy(value, ['amount_due'], ['desc']),
          }))
          .value();

        if (!isEmpty(groupedRecords)) {
          for (const group of groupedRecords) {
            await generateLateFeePaymentInvoice(
              group.enrollment_id,
              group.records[0].enrollment.enrollment_status_id,
              findStudentProgramme,
              transaction
            );
          }
        }
      }

      return newResult;
    } else {
      throw new Error('You have not specified any invoices');
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} arrayOfTuitionInvoices
 * @param {*} studentId
 * @param {*} findActiveInvoiceStatusId
 * @param {*} transaction
 * @returns
 */
const handleTuitionInvoices = async function (
  arrayOfTuitionInvoices,
  studentId,
  findActiveInvoiceStatusId,
  paymentTransactionId,
  transaction
) {
  try {
    const updatedInvoices = [];
    const tuitionElements = [];
    const allTuitionInvoiceRecords = [];
    const feesElementAllocationData = [];

    for (const eachInvoice of arrayOfTuitionInvoices) {
      const findInvoice = await invoiceService
        .findOneTuitionInvoiceRecord({
          where: {
            id: eachInvoice.id,
            invoice_number: eachInvoice.invoice_number,
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
          `Invoice ${eachInvoice.invoice_number} is either invalid or does not exist.`
        );
      }

      if (findInvoice.amount_due <= 0) {
        throw new Error(
          `Invoice ${eachInvoice.invoice_number} has no amount due.`
        );
      }
      if (eachInvoice.allocated_amount > findInvoice.amount_due) {
        throw new Error(
          `Invoice ${eachInvoice.invoice_number} is being allocated more than what is due.`
        );
      }

      const newAmountPaid =
        parseFloat(findInvoice.amount_paid) +
        parseFloat(eachInvoice.allocated_amount);

      const newAmountDue =
        parseFloat(findInvoice.amount_due) -
        parseFloat(eachInvoice.allocated_amount);

      const newPercentageCompletion = Math.floor(
        (newAmountPaid / parseFloat(findInvoice.invoice_amount)) * 100
      );

      const newInvoiceData = {
        amount_paid: newAmountPaid,
        amount_due: newAmountDue,
        percentage_completion: newPercentageCompletion,
      };

      const category = { category: 'tuition' };

      const tuitionItemAmount = feesItemAllocation(
        category,
        findInvoice,
        parseFloat(eachInvoice.allocated_amount)
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
            semester_id:
              tuitionItemAmount.enrollment.event.semester.semester_id,
            study_year_id:
              tuitionItemAmount.enrollment.studyYear.programme_study_year_id,
            update_at: moment.now(),
          });
        });
      }

      const update = await invoiceService.updateEnrollmentTuitionInvoice(
        eachInvoice.id,
        newInvoiceData,
        transaction
      );

      await paymentTransactionAllocation(
        paymentTransactionId,
        eachInvoice.id,
        'tuitionInvoice',
        parseFloat(eachInvoice.allocated_amount),
        transaction
      );

      if (!isEmpty(findInvoice.tuitionInvoiceFeesElement)) {
        tuitionElements.push(...findInvoice.tuitionInvoiceFeesElement);

        // await offsetTuitionInvoiceElements(
        //   eachInvoice.allocated_amount,
        //   tuitionElements,
        //   transaction
        // );
      }

      updatedInvoices.push(update);
      allTuitionInvoiceRecords.push(findInvoice);
    }

    return {
      updatedInvoices: updatedInvoices,
      tuitionElements: tuitionElements,
      allTuitionInvoiceRecords: allTuitionInvoiceRecords,
      feesElementAllocationData: feesElementAllocationData,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} amount
 * @param {*} tuitionElements
 * @param {*} transaction
 */
// const offsetTuitionInvoiceElements = async (
//   amount,
//   tuitionElements,
//   transaction
// ) => {
//   try {
//     let balance = amount;
//     const newTuitionInvoiceFeesElements = [];

//     if (!isEmpty(tuitionElements)) {
//       tuitionElements.forEach((tuitionInvoiceFeesElement) => {
//         if (tuitionInvoiceFeesElement.new_amount) {
//           if (tuitionInvoiceFeesElement.amount_paid) {
//             if (tuitionInvoiceFeesElement.amount_paid > 0) {
//               const elementBalance =
//                 parseFloat(tuitionInvoiceFeesElement.new_amount) -
//                 parseFloat(tuitionInvoiceFeesElement.amount_paid);

//               if (elementBalance > 0) {
//                 if (elementBalance > balance) {
//                   tuitionInvoiceFeesElement.amount_paid =
//                     parseFloat(tuitionInvoiceFeesElement.amount_paid) + balance;

//                   newTuitionInvoiceFeesElements.push(tuitionInvoiceFeesElement);

//                   balance = 0;
//                 } else if (elementBalance < balance) {
//                   const offset = balance - elementBalance;

//                   tuitionInvoiceFeesElement.amount_paid =
//                     parseFloat(tuitionInvoiceFeesElement.amount_paid) +
//                     elementBalance;

//                   tuitionInvoiceFeesElement.cleared = true;

//                   newTuitionInvoiceFeesElements.push(tuitionInvoiceFeesElement);

//                   balance = offset;
//                 } else {
//                   tuitionInvoiceFeesElement.amount_paid =
//                     parseFloat(tuitionInvoiceFeesElement.amount_paid) + balance;

//                   tuitionInvoiceFeesElement.cleared = true;

//                   newTuitionInvoiceFeesElements.push(tuitionInvoiceFeesElement);

//                   balance = 0;
//                 }
//               }
//             }
//           } else {
//             const elementBalance = parseFloat(
//               tuitionInvoiceFeesElement.new_amount
//             );

//             if (elementBalance > 0) {
//               if (elementBalance > balance) {
//                 tuitionInvoiceFeesElement.amount_paid = balance;

//                 newTuitionInvoiceFeesElements.push(tuitionInvoiceFeesElement);

//                 balance = 0;
//               } else if (elementBalance < balance) {
//                 const offset = balance - elementBalance;

//                 tuitionInvoiceFeesElement.amount_paid = elementBalance;

//                 tuitionInvoiceFeesElement.cleared = true;

//                 newTuitionInvoiceFeesElements.push(tuitionInvoiceFeesElement);

//                 balance = offset;
//               } else {
//                 tuitionInvoiceFeesElement.amount_paid = balance;

//                 tuitionInvoiceFeesElement.cleared = true;

//                 newTuitionInvoiceFeesElements.push(tuitionInvoiceFeesElement);

//                 balance = 0;
//               }
//             }
//           }
//         } else {
//           // Has no new_amount
//           if (tuitionInvoiceFeesElement.amount_paid) {
//             if (tuitionInvoiceFeesElement.amount_paid > 0) {
//               const elementBalance =
//                 parseFloat(tuitionInvoiceFeesElement.amount) -
//                 parseFloat(tuitionInvoiceFeesElement.amount_paid);

//               if (elementBalance > 0) {
//                 if (elementBalance > balance) {
//                   tuitionInvoiceFeesElement.amount_paid =
//                     parseFloat(tuitionInvoiceFeesElement.amount_paid) + balance;

//                   newTuitionInvoiceFeesElements.push(tuitionInvoiceFeesElement);

//                   balance = 0;
//                 } else if (elementBalance < balance) {
//                   const offset = balance - elementBalance;

//                   tuitionInvoiceFeesElement.amount_paid =
//                     parseFloat(tuitionInvoiceFeesElement.amount_paid) +
//                     elementBalance;

//                   tuitionInvoiceFeesElement.cleared = true;

//                   newTuitionInvoiceFeesElements.push(tuitionInvoiceFeesElement);

//                   balance = offset;
//                 } else {
//                   tuitionInvoiceFeesElement.amount_paid =
//                     parseFloat(tuitionInvoiceFeesElement.amount_paid) + balance;

//                   tuitionInvoiceFeesElement.cleared = true;

//                   newTuitionInvoiceFeesElements.push(tuitionInvoiceFeesElement);

//                   balance = 0;
//                 }
//               }
//             }
//           } else {
//             const elementBalance = parseFloat(tuitionInvoiceFeesElement.amount);

//             if (elementBalance > 0) {
//               if (elementBalance > balance) {
//                 tuitionInvoiceFeesElement.amount_paid = balance;

//                 newTuitionInvoiceFeesElements.push(tuitionInvoiceFeesElement);

//                 balance = 0;
//               } else if (elementBalance < balance) {
//                 const offset = balance - elementBalance;

//                 tuitionInvoiceFeesElement.amount_paid = elementBalance;

//                 tuitionInvoiceFeesElement.cleared = true;

//                 newTuitionInvoiceFeesElements.push(tuitionInvoiceFeesElement);

//                 balance = offset;
//               } else {
//                 tuitionInvoiceFeesElement.amount_paid = balance;

//                 tuitionInvoiceFeesElement.cleared = true;

//                 newTuitionInvoiceFeesElements.push(tuitionInvoiceFeesElement);

//                 balance = 0;
//               }
//             }
//           }
//         }
//       });
//     }

//     if (!isEmpty(newTuitionInvoiceFeesElements)) {
//       for (const element of newTuitionInvoiceFeesElements) {
//         await paymentReferenceService.updateTuitionInvoiceFeesElement(
//           element.id,
//           {
//             amount_paid: element.amount_paid,
//             cleared: element.cleared,
//           },
//           transaction
//         );
//       }
//     }
//   } catch (error) {
//     throw new Error(error.message);
//   }
// };

/**
 *
 * @param {*} arrayOfFunctionalInvoices
 * @param {*} studentId
 * @param {*} findActiveInvoiceStatusId
 * @param {*} transaction
 * @returns
 */
const handleFunctionalInvoices = async function (
  arrayOfFunctionalInvoices,
  studentId,
  findActiveInvoiceStatusId,
  paymentTransactionId,
  transaction
) {
  try {
    const updatedInvoices = [];
    const functionalElements = [];
    const allFunctionalInvoiceRecords = [];
    const feesElementAllocationData = [];

    for (const eachInvoice of arrayOfFunctionalInvoices) {
      const findInvoice = await invoiceService
        .findOneFunctionalInvoiceRecord({
          where: {
            id: eachInvoice.id,
            invoice_number: eachInvoice.invoice_number,
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
              association: 'functionalElements',
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
          `Invoice ${eachInvoice.invoice_number} is either invalid or does not exist.`
        );
      }

      if (findInvoice.amount_due <= 0) {
        throw new Error(
          `Invoice ${eachInvoice.invoice_number} has no amount due.`
        );
      }
      if (eachInvoice.allocated_amount > findInvoice.amount_due) {
        throw new Error(
          `Invoice ${eachInvoice.invoice_number} is being allocated more than what is due.`
        );
      }
      const newAmountPaid =
        parseFloat(findInvoice.amount_paid) +
        parseFloat(eachInvoice.allocated_amount);

      const newAmountDue =
        parseFloat(findInvoice.amount_due) -
        parseFloat(eachInvoice.allocated_amount);

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
        parseFloat(eachInvoice.allocated_amount)
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
              functionalItemAmount.enrollment.event.academicYear
                .academic_year_id,
            semester_id:
              functionalItemAmount.enrollment.event.semester.semester_id,
            study_year_id:
              functionalItemAmount.enrollment.studyYear.programme_study_year_id,
          });
        });
      }

      const update = await invoiceService.updateEnrollmentFunctionalInvoice(
        eachInvoice.id,
        newInvoiceData,
        transaction
      );

      await paymentTransactionAllocation(
        paymentTransactionId,
        eachInvoice.id,
        'functionalFeesInvoice',
        parseFloat(eachInvoice.allocated_amount),
        transaction
      );

      if (!isEmpty(findInvoice.functionalElements)) {
        functionalElements.push(...findInvoice.functionalElements);

        // await offsetFunctionalInvoiceElements(
        //   eachInvoice.allocated_amount,
        //   functionalElements,
        //   transaction
        // );
      }

      updatedInvoices.push(update);

      allFunctionalInvoiceRecords.push(findInvoice);
    }

    return {
      updatedInvoices: updatedInvoices,
      functionalElements: functionalElements,
      allFunctionalInvoiceRecords: allFunctionalInvoiceRecords,
      feesElementAllocationData: feesElementAllocationData,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} amount
 * @param {*} functionalElements
 * @param {*} transaction
 */
// const offsetFunctionalInvoiceElements = async (
//   amount,
//   functionalElements,
//   transaction
// ) => {
//   try {
//     let balance = amount;
//     const newFunctionalInvoiceFeesElements = [];

//     if (!isEmpty(functionalElements)) {
//       functionalElements.forEach((functionalElement) => {
//         if (functionalElement.new_amount) {
//           if (functionalElement.amount_paid) {
//             if (functionalElement.amount_paid > 0) {
//               const elementBalance =
//                 parseFloat(functionalElement.new_amount) -
//                 parseFloat(functionalElement.amount_paid);

//               if (elementBalance > 0) {
//                 if (elementBalance > balance) {
//                   functionalElement.amount_paid =
//                     parseFloat(functionalElement.amount_paid) + balance;

//                   newFunctionalInvoiceFeesElements.push(functionalElement);

//                   balance = 0;
//                 } else if (elementBalance < balance) {
//                   const offset = balance - elementBalance;

//                   functionalElement.amount_paid =
//                     parseFloat(functionalElement.amount_paid) + elementBalance;

//                   functionalElement.cleared = true;

//                   newFunctionalInvoiceFeesElements.push(functionalElement);

//                   balance = offset;
//                 } else {
//                   functionalElement.amount_paid =
//                     parseFloat(functionalElement.amount_paid) + balance;

//                   functionalElement.cleared = true;

//                   newFunctionalInvoiceFeesElements.push(functionalElement);

//                   balance = 0;
//                 }
//               }
//             }
//           } else {
//             const elementBalance = parseFloat(functionalElement.new_amount);

//             if (elementBalance > 0) {
//               if (elementBalance > balance) {
//                 functionalElement.amount_paid = balance;

//                 newFunctionalInvoiceFeesElements.push(functionalElement);

//                 balance = 0;
//               } else if (elementBalance < balance) {
//                 const offset = balance - elementBalance;

//                 functionalElement.amount_paid = elementBalance;

//                 functionalElement.cleared = true;

//                 newFunctionalInvoiceFeesElements.push(functionalElement);

//                 balance = offset;
//               } else {
//                 functionalElement.amount_paid = balance;

//                 functionalElement.cleared = true;

//                 newFunctionalInvoiceFeesElements.push(functionalElement);

//                 balance = 0;
//               }
//             }
//           }
//         } else {
//           // Has no new_amount
//           if (functionalElement.amount_paid) {
//             if (functionalElement.amount_paid > 0) {
//               const elementBalance =
//                 parseFloat(functionalElement.amount) -
//                 parseFloat(functionalElement.amount_paid);

//               if (elementBalance > 0) {
//                 if (elementBalance > balance) {
//                   functionalElement.amount_paid =
//                     parseFloat(functionalElement.amount_paid) + balance;

//                   newFunctionalInvoiceFeesElements.push(functionalElement);

//                   balance = 0;
//                 } else if (elementBalance < balance) {
//                   const offset = balance - elementBalance;

//                   functionalElement.amount_paid =
//                     parseFloat(functionalElement.amount_paid) + elementBalance;

//                   functionalElement.cleared = true;

//                   newFunctionalInvoiceFeesElements.push(functionalElement);

//                   balance = offset;
//                 } else {
//                   functionalElement.amount_paid =
//                     parseFloat(functionalElement.amount_paid) + balance;

//                   functionalElement.cleared = true;

//                   newFunctionalInvoiceFeesElements.push(functionalElement);

//                   balance = 0;
//                 }
//               }
//             }
//           } else {
//             const elementBalance = parseFloat(functionalElement.amount);

//             if (elementBalance > 0) {
//               if (elementBalance > balance) {
//                 functionalElement.amount_paid = balance;

//                 newFunctionalInvoiceFeesElements.push(functionalElement);

//                 balance = 0;
//               } else if (elementBalance < balance) {
//                 const offset = balance - elementBalance;

//                 functionalElement.amount_paid = elementBalance;

//                 functionalElement.cleared = true;

//                 newFunctionalInvoiceFeesElements.push(functionalElement);

//                 balance = offset;
//               } else {
//                 functionalElement.amount_paid = balance;

//                 functionalElement.cleared = true;

//                 newFunctionalInvoiceFeesElements.push(functionalElement);

//                 balance = 0;
//               }
//             }
//           }
//         }
//       });
//     }

//     if (!isEmpty(newFunctionalInvoiceFeesElements)) {
//       for (const element of newFunctionalInvoiceFeesElements) {
//         await paymentReferenceService.updateFunctionalInvoiceFeesElement(
//           element.id,
//           {
//             amount_paid: element.amount_paid,
//             cleared: element.cleared,
//           },
//           transaction
//         );
//       }
//     }
//   } catch (error) {
//     throw new Error(error.message);
//   }
// };

/**
 *
 * @param {*} arrayOfOtherFeesInvoices
 * @param {*} studentId
 * @param {*} findActiveInvoiceStatusId
 * @param {*} transaction
 * @returns
 */
const handleOtherFeesInvoices = async function (
  arrayOfOtherFeesInvoices,
  studentId,
  findActiveInvoiceStatusId,
  paymentTransactionId,
  transaction
) {
  try {
    const updatedInvoices = [];
    const otherFeesElements = [];
    const feesElementAllocationData = [];

    for (const eachInvoice of arrayOfOtherFeesInvoices) {
      const findInvoice = await invoiceService
        .findOneOtherFeesInvoiceRecords({
          where: {
            id: eachInvoice.id,
            invoice_number: eachInvoice.invoice_number,
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
          `Invoice ${eachInvoice.invoice_number} is either invalid or does not exist.`
        );
      }

      if (findInvoice.amount_due <= 0) {
        throw new Error(
          `Invoice ${eachInvoice.invoice_number} has no amount due.`
        );
      }
      if (eachInvoice.allocated_amount > findInvoice.amount_due) {
        throw new Error(
          `Invoice ${eachInvoice.invoice_number} is being allocated more than what is due.`
        );
      }
      const newAmountPaid =
        parseFloat(findInvoice.amount_paid) +
        parseFloat(eachInvoice.allocated_amount);

      const newAmountDue =
        parseFloat(findInvoice.amount_due) -
        parseFloat(eachInvoice.allocated_amount);

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
        parseFloat(eachInvoice.allocated_amount)
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
        eachInvoice.id,
        newInvoiceData,
        transaction
      );

      await paymentTransactionAllocation(
        paymentTransactionId,
        eachInvoice.id,
        'otherFeesInvoice',
        parseFloat(eachInvoice.allocated_amount),
        transaction
      );

      if (!isEmpty(findInvoice.otherFeesInvoiceFeesElements)) {
        otherFeesElements.push(...findInvoice.otherFeesInvoiceFeesElements);

        // await offsetOtherFeesInvoiceElements(
        //   eachInvoice.allocated_amount,
        //   otherFeesElements,
        //   transaction
        // );
      }

      updatedInvoices.push(update);
    }

    return {
      updatedInvoices: updatedInvoices,
      otherFeesElements: otherFeesElements,
      feesElementAllocationData: feesElementAllocationData,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} amount
 * @param {*} otherFeesElements
 * @param {*} transaction
 */
// const offsetOtherFeesInvoiceElements = async (
//   amount,
//   otherFeesElements,
//   transaction
// ) => {
//   try {
//     let balance = amount;
//     const newOtherInvoiceFeesElements = [];

//     if (!isEmpty(otherFeesElements)) {
//       otherFeesElements.forEach((otherFeesInvoiceFeesElement) => {
//         if (otherFeesInvoiceFeesElement.new_amount) {
//           if (otherFeesInvoiceFeesElement.amount_paid) {
//             if (otherFeesInvoiceFeesElement.amount_paid > 0) {
//               const elementBalance =
//                 parseFloat(otherFeesInvoiceFeesElement.new_amount) -
//                 parseFloat(otherFeesInvoiceFeesElement.amount_paid);

//               if (elementBalance > 0) {
//                 if (elementBalance > balance) {
//                   otherFeesInvoiceFeesElement.amount_paid =
//                     parseFloat(otherFeesInvoiceFeesElement.amount_paid) +
//                     balance;

//                   newOtherInvoiceFeesElements.push(otherFeesInvoiceFeesElement);

//                   balance = 0;
//                 } else if (elementBalance < balance) {
//                   const offset = balance - elementBalance;

//                   otherFeesInvoiceFeesElement.amount_paid =
//                     parseFloat(otherFeesInvoiceFeesElement.amount_paid) +
//                     elementBalance;

//                   otherFeesInvoiceFeesElement.cleared = true;

//                   newOtherInvoiceFeesElements.push(otherFeesInvoiceFeesElement);

//                   balance = offset;
//                 } else {
//                   otherFeesInvoiceFeesElement.amount_paid =
//                     parseFloat(otherFeesInvoiceFeesElement.amount_paid) +
//                     balance;

//                   otherFeesInvoiceFeesElement.cleared = true;

//                   newOtherInvoiceFeesElements.push(otherFeesInvoiceFeesElement);

//                   balance = 0;
//                 }
//               }
//             }
//           } else {
//             const elementBalance = parseFloat(
//               otherFeesInvoiceFeesElement.new_amount
//             );

//             if (elementBalance > 0) {
//               if (elementBalance > balance) {
//                 otherFeesInvoiceFeesElement.amount_paid = balance;

//                 newOtherInvoiceFeesElements.push(otherFeesInvoiceFeesElement);

//                 balance = 0;
//               } else if (elementBalance < balance) {
//                 const offset = balance - elementBalance;

//                 otherFeesInvoiceFeesElement.amount_paid = elementBalance;

//                 otherFeesInvoiceFeesElement.cleared = true;

//                 newOtherInvoiceFeesElements.push(otherFeesInvoiceFeesElement);

//                 balance = offset;
//               } else {
//                 otherFeesInvoiceFeesElement.amount_paid = balance;

//                 otherFeesInvoiceFeesElement.cleared = true;

//                 newOtherInvoiceFeesElements.push(otherFeesInvoiceFeesElement);

//                 balance = 0;
//               }
//             }
//           }
//         } else {
//           // Has no new_amount
//           if (otherFeesInvoiceFeesElement.amount_paid) {
//             if (otherFeesInvoiceFeesElement.amount_paid > 0) {
//               const elementBalance =
//                 parseFloat(otherFeesInvoiceFeesElement.amount) -
//                 parseFloat(otherFeesInvoiceFeesElement.amount_paid);

//               if (elementBalance > 0) {
//                 if (elementBalance > balance) {
//                   otherFeesInvoiceFeesElement.amount_paid =
//                     parseFloat(otherFeesInvoiceFeesElement.amount_paid) +
//                     balance;

//                   newOtherInvoiceFeesElements.push(otherFeesInvoiceFeesElement);

//                   balance = 0;
//                 } else if (elementBalance < balance) {
//                   const offset = balance - elementBalance;

//                   otherFeesInvoiceFeesElement.amount_paid =
//                     parseFloat(otherFeesInvoiceFeesElement.amount_paid) +
//                     elementBalance;

//                   otherFeesInvoiceFeesElement.cleared = true;

//                   newOtherInvoiceFeesElements.push(otherFeesInvoiceFeesElement);

//                   balance = offset;
//                 } else {
//                   otherFeesInvoiceFeesElement.amount_paid =
//                     parseFloat(otherFeesInvoiceFeesElement.amount_paid) +
//                     balance;

//                   otherFeesInvoiceFeesElement.cleared = true;

//                   newOtherInvoiceFeesElements.push(otherFeesInvoiceFeesElement);

//                   balance = 0;
//                 }
//               }
//             }
//           } else {
//             const elementBalance = parseFloat(
//               otherFeesInvoiceFeesElement.amount
//             );

//             if (elementBalance > 0) {
//               if (elementBalance > balance) {
//                 otherFeesInvoiceFeesElement.amount_paid = balance;

//                 newOtherInvoiceFeesElements.push(otherFeesInvoiceFeesElement);

//                 balance = 0;
//               } else if (elementBalance < balance) {
//                 const offset = balance - elementBalance;

//                 otherFeesInvoiceFeesElement.amount_paid = elementBalance;

//                 otherFeesInvoiceFeesElement.cleared = true;

//                 newOtherInvoiceFeesElements.push(otherFeesInvoiceFeesElement);

//                 balance = offset;
//               } else {
//                 otherFeesInvoiceFeesElement.amount_paid = balance;

//                 otherFeesInvoiceFeesElement.cleared = true;

//                 newOtherInvoiceFeesElements.push(otherFeesInvoiceFeesElement);

//                 balance = 0;
//               }
//             }
//           }
//         }
//       });
//     }

//     if (!isEmpty(newOtherInvoiceFeesElements)) {
//       for (const element of newOtherInvoiceFeesElements) {
//         await paymentReferenceService.updateOtherInvoiceFeesElement(
//           element.id,
//           {
//             amount_paid: element.amount_paid,
//             cleared: element.cleared,
//           },
//           transaction
//         );
//       }
//     }
//   } catch (error) {
//     throw new Error(error.message);
//   }
// };

/**
 *
 * @param {*} arrayOfManualInvoices
 * @param {*} studentId
 * @param {*} findActiveInvoiceStatusId
 * @param {*} transaction
 * @returns
 */
const handleManualInvoices = async function (
  arrayOfManualInvoices,
  studentId,
  findActiveInvoiceStatusId,
  paymentTransactionId,
  transaction
) {
  try {
    const updatedInvoices = [];
    const manualElements = [];
    const feesElementAllocationData = [];

    for (const eachInvoice of arrayOfManualInvoices) {
      const findInvoice = await invoiceService
        .findOneManualInvoiceRecord({
          where: {
            id: eachInvoice.id,
            invoice_number: eachInvoice.invoice_number,
            invoice_status_id: findActiveInvoiceStatusId,
            student_id: studentId,
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
          `Invoice ${eachInvoice.invoice_number} is either invalid or does not exist.`
        );
      }

      if (findInvoice.amount_due <= 0) {
        throw new Error(
          `Invoice ${eachInvoice.invoice_number} has no amount due.`
        );
      }
      if (eachInvoice.allocated_amount > findInvoice.amount_due) {
        throw new Error(
          `Invoice ${eachInvoice.invoice_number} is being allocated more than what is due.`
        );
      }
      const newAmountPaid =
        parseFloat(findInvoice.amount_paid) +
        parseFloat(eachInvoice.allocated_amount);

      const newAmountDue =
        parseFloat(findInvoice.amount_due) -
        parseFloat(eachInvoice.allocated_amount);

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
        parseFloat(eachInvoice.allocated_amount)
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
        eachInvoice.id,
        newInvoiceData,
        transaction
      );

      await paymentTransactionAllocation(
        paymentTransactionId,
        eachInvoice.id,
        'manualInvoice',
        parseFloat(eachInvoice.allocated_amount),
        transaction
      );

      if (!isEmpty(findInvoice.elements)) {
        manualElements.push(...findInvoice.elements);

        // await offsetManualInvoiceElements(
        //   eachInvoice.allocated_amount,
        //   manualElements,
        //   transaction
        // );
      }

      updatedInvoices.push(update);
    }

    return {
      updatedInvoices: updatedInvoices,
      manualElements: manualElements,
      feesElementAllocationData: feesElementAllocationData,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} amount
 * @param {*} manualElements
 * @param {*} transaction
 */
// const offsetManualInvoiceElements = async (
//   amount,
//   manualElements,
//   transaction
// ) => {
//   try {
//     let balance = amount;
//     const newManualInvoiceFeesElements = [];

//     if (!isEmpty(manualElements)) {
//       manualElements.forEach((element) => {
//         if (element.amount_paid) {
//           if (element.amount_paid > 0) {
//             const elementBalance =
//               parseFloat(element.amount) - parseFloat(element.amount_paid);

//             if (elementBalance > 0) {
//               if (elementBalance > balance) {
//                 element.amount_paid = parseFloat(element.amount_paid) + balance;

//                 newManualInvoiceFeesElements.push(element);

//                 balance = 0;
//               } else if (elementBalance < balance) {
//                 const offset = balance - elementBalance;

//                 element.amount_paid =
//                   parseFloat(element.amount_paid) + elementBalance;

//                 element.cleared = true;

//                 newManualInvoiceFeesElements.push(element);

//                 balance = offset;
//               } else {
//                 element.amount_paid = parseFloat(element.amount_paid) + balance;

//                 element.cleared = true;

//                 newManualInvoiceFeesElements.push(element);

//                 balance = 0;
//               }
//             }
//           }
//         } else {
//           const elementBalance = parseFloat(element.amount);

//           if (elementBalance > 0) {
//             if (elementBalance > balance) {
//               element.amount_paid = balance;

//               newManualInvoiceFeesElements.push(element);

//               balance = 0;
//             } else if (elementBalance < balance) {
//               const offset = balance - elementBalance;

//               element.amount_paid = elementBalance;

//               element.cleared = true;

//               newManualInvoiceFeesElements.push(element);

//               balance = offset;
//             } else {
//               element.amount_paid = balance;

//               element.cleared = true;

//               newManualInvoiceFeesElements.push(element);

//               balance = 0;
//             }
//           }
//         }
//       });
//     }

//     if (!isEmpty(newManualInvoiceFeesElements)) {
//       for (const element of newManualInvoiceFeesElements) {
//         await paymentReferenceService.updateManualInvoiceFeesElement(
//           element.id,
//           {
//             amount_paid: element.amount_paid,
//             cleared: element.cleared,
//           },
//           transaction
//         );
//       }
//     }
//   } catch (error) {
//     throw new Error(error.message);
//   }
// };

/**
 *
 * @param {*} transactionId
 * @param {*} invoiceId
 * @param {*} invoiceType
 * @param {*} amount
 * @param {*} transaction
 */
const paymentTransactionAllocation = async (
  transactionId,
  invoiceId,
  invoiceType,
  amount,
  transaction
) => {
  try {
    await invoiceService.createPaymentTransactionAllocation(
      {
        transaction_id: transactionId,
        invoice_id: invoiceId,
        invoice_type: invoiceType,
        amount: amount,
      },
      transaction
    );
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} feesElementAllocationData
 * @param {*} findPaymentReference
 * @param {*} paymentTransaction
 * @param {*} findStudentProgramme
 * @param {*} totalAllocationAmount
 * @param {*} studentId
 * @param {*} transaction
 */
const handleFeesElementAllocation = async (
  feesElementAllocationData,
  findPaymentReference,
  paymentTransaction,
  findStudentProgramme,
  totalAllocationAmount,
  studentId,
  transaction
) => {
  try {
    let newMapping = null;

    if (!isEmpty(feesElementAllocationData)) {
      const mappedData = feesElementAllocationData.map((obj) => ({
        ...obj,
        ura_prn: paymentTransaction.ura_prn,
        system_prn: paymentTransaction.system_prn,
        student_id: findStudentProgramme.student_id,
        student_programme_id: findStudentProgramme.id,
        is_paid: true,
        is_active: false,
        updated_at: paymentTransaction.payment_date
          ? moment(paymentTransaction.payment_date).format('YYYY-MM-DD')
          : moment(paymentTransaction.created_at).format('YYYY-MM-DD'),
        payment_date: paymentTransaction.payment_date
          ? moment(paymentTransaction.payment_date)
              .format('YYYY-MM-DD')
              .toString()
          : moment(paymentTransaction.created_at)
              .format('YYYY-MM-DD')
              .toString(),
      }));

      newMapping = mappedData;
    }

    if (findPaymentReference) {
      newMapping = newMapping.map((obj) => ({
        ...obj,
        payment_reference_id: findPaymentReference.id,
      }));

      // bulk create element allocation data
      await paymentReferenceService.bulkCreateFeesItemPayment(
        newMapping,
        transaction
      );
    } else {
      const newPaymentReferenceData = {};

      newPaymentReferenceData.system_prn = generateSystemReference('ALTN');
      newPaymentReferenceData.ura_prn = newPaymentReferenceData.system_prn;
      newPaymentReferenceData.student_id = studentId;
      newPaymentReferenceData.search_code = 'N/A';
      newPaymentReferenceData.amount = totalAllocationAmount;
      newPaymentReferenceData.tax_payer_name = `${findStudentProgramme.student.surname} ${findStudentProgramme.student.other_names}`;
      newPaymentReferenceData.payment_mode = `CASH`;
      newPaymentReferenceData.generated_by = `ALLOCATION`;
      newPaymentReferenceData.expiry_date = moment.now();
      newPaymentReferenceData.is_used = true;
      newPaymentReferenceData.elementAllocation = newMapping;

      await paymentReferenceService.createPaymentReference(
        newPaymentReferenceData,
        transaction
      );
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  allocateMoneyToAnInvoice,
  paymentTransactionAllocation,
  handleFeesElementAllocation,
};
