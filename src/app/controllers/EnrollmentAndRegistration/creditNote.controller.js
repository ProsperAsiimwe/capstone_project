const { HttpResponse } = require('@helpers');
const {
  creditNoteService,
  invoiceService,
  feesElementService,
} = require('@services/index');
const {
  toUpper,
  now,
  isEmpty,
  map,
  uniqBy,
  chain,
  orderBy,
  sumBy,
} = require('lodash');
const model = require('@models');

const http = new HttpResponse();

class CreditNoteController {
  /**
   * CREATE New Other Fees Invoice.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async createCreditNote(req, res) {
    try {
      const { elements, invoice_number: invoiceNumber, comment } = req.body;
      const { student_id: studentId } = req.params;
      const staffId = req.user.id;

      let invoiceType;

      let findInvoice = '';

      if (toUpper(invoiceNumber).includes('T-INV')) {
        invoiceType = 'tuitionInvoice';
        findInvoice = await invoiceService
          .findOneTuitionInvoiceRecord({
            where: { invoice_number: invoiceNumber },
            include: [
              {
                association: 'tuitionInvoiceFeesElement',
              },
            ],
            nest: true,
          })
          .then((res) => {
            if (res) {
              return res.toJSON();
            }
          });

        if (findInvoice) {
          const newElements = findInvoice.tuitionInvoiceFeesElement.filter(
            (element) => element.amount_paid >= element.amount
          );

          findInvoice.newElements = newElements;

          findInvoice.tuitionInvoiceFeesElement.forEach((record) => {
            const findMatching = elements.find(
              (elmnt) =>
                parseInt(elmnt.fees_element_id, 10) ===
                parseInt(record.fees_element_id, 10)
            );

            if (findMatching) {
              let elementAmount = 0;

              let amountPaid = 0;

              if (record.new_amount) {
                elementAmount = parseFloat(record.new_amount);
              } else {
                elementAmount = parseFloat(record.amount);
              }

              if (record.amount_paid) {
                amountPaid = parseFloat(record.amount_paid);
              }

              const getBalance = elementAmount - amountPaid;

              if (findMatching.amount > getBalance) {
                throw new Error(
                  `Fees Element: ${record.fees_element_name} Has A Balance Of ${getBalance} Available For Clearing.`
                );
              }
            }
          });
        }
      } else if (toUpper(invoiceNumber).includes('F-INV')) {
        invoiceType = 'functionalFeesInvoice';
        findInvoice = await invoiceService
          .findOneFunctionalInvoiceRecord({
            where: { invoice_number: invoiceNumber },
            include: [
              {
                association: 'functionalElements',
              },
            ],
            nest: true,
          })
          .then((res) => {
            if (res) {
              return res.toJSON();
            }
          });

        if (findInvoice) {
          const newElements = findInvoice.functionalElements.filter(
            (element) => element.amount_paid >= element.amount
          );

          findInvoice.newElements = newElements;

          findInvoice.functionalElements.forEach((record) => {
            const findMatching = elements.find(
              (elmnt) =>
                parseInt(elmnt.fees_element_id, 10) ===
                parseInt(record.fees_element_id, 10)
            );

            if (findMatching) {
              let elementAmount = 0;

              let amountPaid = 0;

              if (record.new_amount) {
                elementAmount = parseFloat(record.new_amount);
              } else {
                elementAmount = parseFloat(record.amount);
              }

              if (record.amount_paid) {
                amountPaid = parseFloat(record.amount_paid);
              }

              const getBalance = elementAmount - amountPaid;

              if (findMatching.amount > getBalance) {
                throw new Error(
                  `Fees Element: ${record.fees_element_name} Has A Balance Of ${getBalance} Available For Clearing.`
                );
              }
            }
          });
        }
      } else if (toUpper(invoiceNumber).includes('O-INV')) {
        invoiceType = 'otherFeesInvoice';
        findInvoice = await invoiceService
          .findOneOtherFeesInvoiceRecords({
            where: { invoice_number: invoiceNumber },
            include: [
              {
                association: 'otherFeesInvoiceFeesElements',
              },
            ],
            nest: true,
          })
          .then((res) => {
            if (res) {
              return res.toJSON();
            }
          });

        if (findInvoice) {
          const newElements = findInvoice.otherFeesInvoiceFeesElements.filter(
            (element) => element.amount_paid >= element.amount
          );

          findInvoice.newElements = newElements;

          findInvoice.otherFeesInvoiceFeesElements.forEach((record) => {
            const findMatching = elements.find(
              (elmnt) =>
                parseInt(elmnt.fees_element_id, 10) ===
                parseInt(record.fees_element_id, 10)
            );

            if (findMatching) {
              let elementAmount = 0;

              let amountPaid = 0;

              if (record.new_amount) {
                elementAmount = parseFloat(record.new_amount);
              } else {
                elementAmount = parseFloat(record.amount);
              }

              if (record.amount_paid) {
                amountPaid = parseFloat(record.amount_paid);
              }

              const getBalance = elementAmount - amountPaid;

              if (findMatching.amount > getBalance) {
                throw new Error(
                  `Fees Element: ${record.fees_element_name} Has A Balance Of ${getBalance} Available For Clearing.`
                );
              }
            }
          });
        }
      } else if (toUpper(invoiceNumber).includes('M-INV')) {
        invoiceType = 'manualInvoice';
        findInvoice = await invoiceService
          .findOneManualInvoiceRecord({
            where: { invoice_number: invoiceNumber },
            include: [
              {
                association: 'elements',
              },
            ],
            nest: true,
          })
          .then((res) => {
            if (res) {
              return res.toJSON();
            }
          });

        if (findInvoice) {
          const newElements = findInvoice.elements.filter(
            (element) => element.amount_paid >= element.amount
          );

          findInvoice.newElements = newElements;

          findInvoice.elements.forEach((record) => {
            const findMatching = elements.find(
              (elmnt) =>
                parseInt(elmnt.fees_element_id, 10) ===
                parseInt(record.fees_element_id, 10)
            );

            if (findMatching) {
              let elementAmount = 0;

              let amountPaid = 0;

              if (record.new_amount) {
                elementAmount = parseFloat(record.new_amount);
              } else {
                elementAmount = parseFloat(record.amount);
              }

              if (record.amount_paid) {
                amountPaid = parseFloat(record.amount_paid);
              }

              const getBalance = elementAmount - amountPaid;

              if (findMatching.amount > getBalance) {
                throw new Error(
                  `Fees Element: ${record.fees_element_description} Has A Balance Of ${getBalance} Available For Clearing.`
                );
              }
            }
          });
        }
      } else {
        http.setError(400, 'Invalid Invoice number provided');

        return http.send(res);
      }

      if (!findInvoice) {
        throw Error('This Invoice number is invalid.');
      }

      const findAllFeesElements = await feesElementService.findAllFeesElements({
        attributes: ['id'],
        raw: true,
      });

      const findAllCreditNotes = await creditNoteService
        .findAll({
          where: {
            invoice_id: findInvoice.id,
            status: 'PENDING',
          },
          include: [
            {
              association: 'feesElement',
            },
            {
              association: 'student',
            },
          ],
        })
        .then((res) => {
          if (res) {
            return res.map((item) => item.get({ plain: true }));
          }
        });

      const formData = [];

      for (const invoiceElement of elements) {
        const verifyElement = findAllFeesElements.find(
          (element) =>
            parseInt(element.id, 10) ===
            parseInt(invoiceElement.fees_element_id, 10)
        );

        if (!verifyElement) {
          throw new Error(`Invalid Fees Element Provided!`);
        }

        const findCreditNote = findAllCreditNotes.find(
          (creditnote) =>
            parseInt(creditnote.fees_element_id, 10) ===
            parseInt(invoiceElement.fees_element_id, 10)
        );

        if (findCreditNote) {
          throw new Error(
            `Fees Element: ${findCreditNote.feesElement.fees_element_name} Of Invoice: ${invoiceNumber}, Still Has An Unapproved Credit Note For Student: ${findCreditNote.student.surname} ${findCreditNote.student.other_names}.`
          );
        }

        const verifyAmountElement = findInvoice.newElements.find(
          (element) =>
            parseInt(element.fees_element_id, 10) ===
            parseInt(invoiceElement.fees_element_id, 10)
        );

        if (verifyAmountElement) {
          throw new Error(
            `Fees element ${verifyAmountElement.fees_element_name} has already been cleared.`
          );
        }

        invoiceElement.student_programme_id = findInvoice.student_programme_id;

        formData.push({
          student_id: studentId,
          created_by_id: staffId,
          invoice_id: findInvoice.id,
          invoice_type: invoiceType,
          comment,
          ...invoiceElement,
        });
      }

      const result = await model.sequelize.transaction(async (transaction) => {
        const response = await creditNoteService.bulkCreate(
          formData,
          transaction
        );

        return response;
      });

      http.setSuccess(200, 'Invoice Credit Note Created Successfully.', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Create Invoice Credit Note.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * GET ALL PENDING Credit Notes
   *
   * @param {*} req
   * @param {*} res
   */
  async getInvoiceCreditNotes(req, res) {
    try {
      const { invoice_number: invoiceNumber } = req.params;

      let invoiceType;

      let findInvoice = '';

      if (toUpper(invoiceNumber).includes('T-INV')) {
        invoiceType = 'tuitionInvoice';
        findInvoice = invoiceService.findOneTuitionInvoiceRecord({
          where: { invoice_number: invoiceNumber },
        });
      } else if (toUpper(invoiceNumber).includes('F-INV')) {
        invoiceType = 'functionalFeesInvoice';
        findInvoice = invoiceService.findOneFunctionalInvoiceRecord({
          where: { invoice_number: invoiceNumber },
        });
      } else if (toUpper(invoiceNumber).includes('O-INV')) {
        invoiceType = 'functionalFeesInvoice';
        findInvoice = invoiceService.findOneOtherFeesInvoiceRecords({
          where: { invoice_number: invoiceNumber },
        });
      } else if (toUpper(invoiceNumber).includes('M-INV')) {
        invoiceType = 'functionalFeesInvoice';
        findInvoice = invoiceService.findOneManualInvoiceRecord({
          where: { invoice_number: invoiceNumber },
        });
      } else {
        http.setError(400, 'Unable To Create Manual Invoice.', {
          error: 'Invalid Invoice number provided',
        });

        return http.send(res);
      }

      const results = await creditNoteService.findAll({
        where: { invoice_id: findInvoice.id },
        include: [
          {
            association: invoiceType,
          },
          {
            association: 'feesElement',
          },
          {
            association: 'student',
          },
        ],
      });

      http.setSuccess(200, 'Invoice Credit Notes fetched successfully.', {
        data: results,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Create Manual Invoice.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * GET ALL PENDING Credit Notes
   *
   * @param {*} req
   * @param {*} res
   */
  async getPendingCreditNotes(req, res) {
    try {
      const { studentId } = req.params;

      const results = await creditNoteService.findAll({
        where: {
          status: 'PENDING',
          student_id: studentId,
        },
        include: [
          'tuitionInvoice',
          'otherFeesInvoice',
          'manualInvoice',
          'functionalFeesInvoice',
          'studentProgramme',
          'student',
          'feesElement',
          'createdBy',
        ],
      });

      http.setSuccess(200, 'Pending Credit Notes.', {
        data: results,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To get Pending Credit Notes', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * GET ALL PENDING Credit Notes
   *
   * @param {*} req
   * @param {*} res
   */
  async getBulkPendingCreditNotes(req, res) {
    try {
      const results = await creditNoteService.findAll({
        where: {
          status: 'PENDING',
        },
        include: [
          'tuitionInvoice',
          'otherFeesInvoice',
          'manualInvoice',
          'functionalFeesInvoice',
          'studentProgramme',
          'student',
          'feesElement',
          'createdBy',
        ],
      });

      http.setSuccess(200, 'Pending Credit Notes.', {
        data: results,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To get Pending Credit Notes', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * APPROVE PENDING Credit Notes
   *
   * @param {*} req
   * @param {*} res
   */
  async approveCreditNote(req, res) {
    try {
      const creditNotes = req.body.credit_notes;
      const staffID = req.user.id;

      const updatedValues = await model.sequelize.transaction(
        async (transaction) => {
          const results = [];

          const tuitionAmountToDeduct = [];
          const functionalAmountToDeduct = [];
          const otherFeesAmountToDeduct = [];
          const manualAmountToDeduct = [];

          for (const creditNoteId of creditNotes) {
            const dataToUpdate = {
              status: 'APPROVED',
              last_update_approval_status: 'APPROVED',
              create_approved_by_id: staffID,
              last_update_approved_by_id: staffID,
              create_approval_date: now(),
              last_update_approval_date: now(),
            };
            const updatedCreditNote = await creditNoteService
              .update(dataToUpdate, parseInt(creditNoteId, 10), transaction)
              .then((result) => result[1][0]);

            if (!updatedCreditNote)
              throw new Error('Unable to update this Credit Note');

            let updatedInvoice = '';

            if (updatedCreditNote.invoice_type === 'tuitionInvoice') {
              tuitionAmountToDeduct.push({
                invoice_id: updatedCreditNote.invoice_id,
                amount: parseInt(updatedCreditNote.amount, 10),
              });

              updatedInvoice = await invoiceService.incrementTuitionInvoice(
                'credit_note',
                updatedCreditNote.amount,
                updatedCreditNote.invoice_id,
                creditNoteId,
                transaction
              );
            } else if (
              updatedCreditNote.invoice_type === 'functionalFeesInvoice'
            ) {
              functionalAmountToDeduct.push({
                invoice_id: updatedCreditNote.invoice_id,
                amount: parseInt(updatedCreditNote.amount, 10),
              });

              updatedInvoice = await invoiceService.incrementFunctionalInvoice(
                'credit_note',
                updatedCreditNote.amount,
                updatedCreditNote.invoice_id,
                creditNoteId,
                transaction
              );
            } else if (updatedCreditNote.invoice_type === 'otherFeesInvoice') {
              otherFeesAmountToDeduct.push({
                invoice_id: updatedCreditNote.invoice_id,
                amount: parseInt(updatedCreditNote.amount, 10),
              });

              updatedInvoice = await invoiceService.incrementOtherFeesInvoice(
                'credit_note',
                updatedCreditNote.amount,
                updatedCreditNote.invoice_id,
                creditNoteId,
                transaction
              );
            } else if (updatedCreditNote.invoice_type === 'manualInvoice') {
              manualAmountToDeduct.push({
                invoice_id: updatedCreditNote.invoice_id,
                amount: parseInt(updatedCreditNote.amount, 10),
              });

              updatedInvoice = await invoiceService.incrementManualInvoice(
                'credit_note',
                updatedCreditNote.amount,
                updatedCreditNote.invoice_id,
                creditNoteId,
                transaction
              );
            } else {
              throw new Error('Invalid invoice Number');
            }
            results.push({ updatedCreditNote, invoice: updatedInvoice[0][0] });
          }

          if (!isEmpty(tuitionAmountToDeduct)) {
            const groupedRecords = chain(tuitionAmountToDeduct)
              .groupBy('invoice_id')
              .map((value, key) => ({
                invoice_id: key,
                amount_to_deduct: orderBy(value, 'amount'),
              }))
              .value();

            for (const item of groupedRecords) {
              await invoiceService.updateTuitioninvoiceByNotes(
                item.invoice_id,
                sumBy(item.amount_to_deduct, 'amount'),
                'credit',
                transaction
              );
            }
          }

          if (!isEmpty(functionalAmountToDeduct)) {
            const groupedRecords = chain(functionalAmountToDeduct)
              .groupBy('invoice_id')
              .map((value, key) => ({
                invoice_id: key,
                amount_to_deduct: orderBy(value, 'amount'),
              }))
              .value();

            for (const item of groupedRecords) {
              await invoiceService.updateFunctionalinvoiceByNotes(
                item.invoice_id,
                sumBy(item.amount_to_deduct, 'amount'),
                'credit',
                transaction
              );
            }
          }

          if (!isEmpty(otherFeesAmountToDeduct)) {
            const groupedRecords = chain(otherFeesAmountToDeduct)
              .groupBy('invoice_id')
              .map((value, key) => ({
                invoice_id: key,
                amount_to_deduct: orderBy(value, 'amount'),
              }))
              .value();

            for (const item of groupedRecords) {
              await invoiceService.updateOtherFeesInvoiceByNotes(
                item.invoice_id,
                sumBy(item.amount_to_deduct, 'amount'),
                'credit',
                transaction
              );
            }
          }

          if (!isEmpty(manualAmountToDeduct)) {
            const groupedRecords = chain(manualAmountToDeduct)
              .groupBy('invoice_id')
              .map((value, key) => ({
                invoice_id: key,
                amount_to_deduct: orderBy(value, 'amount'),
              }))
              .value();

            for (const item of groupedRecords) {
              await invoiceService.updateManualInvoiceByNotes(
                item.invoice_id,
                sumBy(item.amount_to_deduct, 'amount'),
                'credit',
                transaction
              );
            }
          }

          return results;
        }
      );

      http.setSuccess(200, 'Credit Notes approved successfully.', {
        data: updatedValues,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Approve these Credit Notes', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * DECLINE PENDING Credit Notes
   *
   * @param {*} req
   * @param {*} res
   */
  async declineCreditNotes(req, res) {
    try {
      const creditNotes = req.body.credit_notes;
      const staffID = req.user.id;

      const updatedValues = await model.sequelize.transaction(
        async (transaction) => {
          const results = [];

          for (const creditNoteId of creditNotes) {
            const dataToUpdate = {
              status: 'DECLINED',
              last_update_approval_status: 'DECLINED',
              create_approved_by_id: staffID,
              last_update_approved_by_id: staffID,
              create_approval_date: now(),
              last_update_approval_date: now(),
            };
            const declinedCreditNote = await creditNoteService.update(
              dataToUpdate,
              parseInt(creditNoteId, 10),
              transaction
            );

            if (!declinedCreditNote)
              throw new Error('Invalid Invoice provided');

            results.push(declinedCreditNote);
          }

          return results;
        }
      );

      http.setSuccess(200, 'Selected Credit Notes have been declined.', {
        data: updatedValues,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Decline these Credit Notes', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * GET ALL APPROVED Credit Notes
   *
   * @param {*} req
   * @param {*} res
   */
  async getAllApproved(req, res) {
    try {
      const results = await creditNoteService.findAll({
        where: { status: 'APPROVED' },
        include: [
          {
            association: 'feesElement',
          },
          {
            association: 'student',
          },
        ],
      });

      http.setSuccess(200, 'Approved Credit Notes.', {
        data: results,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To get approved Credit notes.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * GET ALL STUDENTS' APPROVED Credit Notes
   *
   * @param {*} req
   * @param {*} res
   */
  async getAllStudentApproved(req, res) {
    try {
      const { student_id: studentId } = req.params;
      const results = await creditNoteService.findAll({
        where: { status: 'APPROVED', student_id: studentId },
      });

      http.setSuccess(200, 'Approved Credit  Notes.', {
        data: results,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To get approved Credit notes.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  //  pendingCreditNotes

  async pendingNotesByDate(req, res) {
    try {
      const context = req.query;

      if (!context.date_from || !context.date_to || !context.type) {
        throw new Error('Invalid Context Provided');
      }

      if (context.date_from > context.date_to) {
        throw new Error(
          `Invalid Context Provided, 'FROM DATE' SHOULD BE LESS OR EQUAL 'TO DATE'`
        );
      }

      let data = [];
      //

      if (req.query.type === 'CREDIT') {
        data = await creditNoteService.pendingCreditNotes(context);
      } else if (req.query.type === 'DEBIT') {
        data = await creditNoteService.pendingDebitNotes(context);
      } else {
        throw new Error('Invalid Context Provided');
      }

      http.setSuccess(200, 'Students Notes, Fetched Successfully', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to fetch Student Notes.', {
        error: error.message,
      });

      return http.send(res);
    }
  }

  // creditNoteReportsDate  credit note reports

  async creditNoteReportsDate(req, res) {
    try {
      const context = req.query;

      if (!context.date_from || !context.date_to) {
        throw new Error('Invalid Context Provided');
      }

      if (context.date_from > context.date_to) {
        throw new Error(
          `Invalid Context Provided, 'FROM DATE' SHOULD BE LESS OR EQUAL 'TO DATE'`
        );
      }

      const detailData = await creditNoteService.creditNoteReportsDate(context);

      const invoiceType = analysisCreditNoteData(detailData);

      const totalAmount = sumBy(detailData, 'amount');

      const creditNotesIssued = detailData.length;

      const noOfStudents = uniqBy(map(detailData, 'email')).length;

      const summary = {
        totalAmount,
        creditNotesIssued,
        noOfStudents,
        invoiceType: invoiceType.invoiceType,
      };

      const result = { summary, detailData };

      http.setSuccess(200, 'Credit Notes Report, Fetched Successfully', {
        result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to fetch Credit Notes Reports.', {
        error: error.message,
      });

      return http.send(res);
    }
  }
}

const analysisCreditNoteData = function (data) {
  try {
    const creditNote = data;

    let invoiceType = [];

    invoiceType = [
      ...creditNote
        .reduce((r, o) => {
          const key = o.invoice_type;

          const item =
            r.get(key) ||
            Object.assign({}, o, {
              amount: 0,
            });

          item.amount += Number(o.amount);

          return r.set(key, item);
        }, new Map())
        .values(),
    ];

    return {
      invoiceType: map(invoiceType, (r) => {
        return {
          invoice_type: r.invoice_type,
          creditAmount: r.amount,
        };
      }),
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = CreditNoteController;
