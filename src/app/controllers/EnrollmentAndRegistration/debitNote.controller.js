const { HttpResponse } = require('@helpers');
const {
  debitNoteService,
  invoiceService,
  feesElementService,
} = require('@services/index');
const { toUpper, now, isEmpty, chain, orderBy, sumBy } = require('lodash');
const model = require('@models');

const http = new HttpResponse();

class DebitNoteController {
  /**
   * CREATE New Other Fees Invoice.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async createDebitNote(req, res) {
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
            (element) => element.amount_paid > 0
          );

          findInvoice.newElements = newElements;
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
            (element) => element.amount_paid > 0
          );

          findInvoice.newElements = newElements;
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
            (element) => element.amount_paid > 0
          );

          findInvoice.newElements = newElements;
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
            (element) => element.amount_paid > 0
          );

          findInvoice.newElements = newElements;
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

        const verifyAmountElement = findInvoice.newElements.find(
          (element) =>
            parseInt(element.fees_element_id, 10) ===
            parseInt(invoiceElement.fees_element_id, 10)
        );

        if (!verifyAmountElement) {
          throw new Error(
            `Fees element ${verifyAmountElement.fees_element_name} has already been debited.`
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
        const response = await debitNoteService.bulkCreate(
          formData,
          transaction
        );

        return response;
      });

      http.setSuccess(201, 'Invoice Debit Note Created Successfully.', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Create Invoice Debit Note.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * GET ALL PENDING Debit Notes
   *
   * @param {*} req
   * @param {*} res
   */
  async getInvoiceDebitNotes(req, res) {
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

      const results = await debitNoteService.findAll({
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

      http.setSuccess(200, 'Invoice Debit Notes fetched successfully.', {
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
   * APPROVE ALL PENDING DEBIT Notes
   *
   * @param {*} req
   * @param {*} res
   */
  async approveDebitNote(req, res) {
    try {
      const debitNotes = req.body.debit_notes;
      const staffID = req.user.id;

      const updatedValues = await model.sequelize.transaction(
        async (transaction) => {
          const results = [];

          const tuitionAmountToIncrease = [];
          const functionalAmountToIncrease = [];
          const otherFeesAmountToIncrease = [];
          const manualAmountToIncrease = [];

          for (const debitNoteId of debitNotes) {
            const dataToUpdate = {
              status: 'APPROVED',
              last_update_approval_status: 'APPROVED',
              create_approved_by_id: staffID,
              last_update_approved_by_id: staffID,
              create_approval_date: now(),
              last_update_approval_date: now(),
            };
            const updatedDebitNote = await debitNoteService
              .update(dataToUpdate, parseInt(debitNoteId, 10), transaction)
              .then((result) => result[1][0]);

            if (!updatedDebitNote)
              throw new Error('Unable to update t his Debit Note');

            let updatedInvoice = '';

            if (updatedDebitNote.invoice_type === 'tuitionInvoice') {
              tuitionAmountToIncrease.push({
                invoice_id: updatedDebitNote.invoice_id,
                amount: parseInt(updatedDebitNote.amount, 10),
              });

              updatedInvoice = await invoiceService.decrementTuitionInvoice(
                'debit_note',
                updatedDebitNote.amount,
                updatedDebitNote.invoice_id,
                debitNoteId,
                transaction
              );
            } else if (
              updatedDebitNote.invoice_type === 'functionalFeesInvoice'
            ) {
              functionalAmountToIncrease.push({
                invoice_id: updatedDebitNote.invoice_id,
                amount: parseInt(updatedDebitNote.amount, 10),
              });

              updatedInvoice = await invoiceService.decrementFunctionalInvoice(
                'debit_note',
                updatedDebitNote.amount,
                updatedDebitNote.invoice_id,
                debitNoteId,
                transaction
              );
            } else if (updatedDebitNote.invoice_type === 'otherFeesInvoice') {
              otherFeesAmountToIncrease.push({
                invoice_id: updatedDebitNote.invoice_id,
                amount: parseInt(updatedDebitNote.amount, 10),
              });

              updatedInvoice = await invoiceService.decrementOtherFeesInvoice(
                'debit_note',
                updatedDebitNote.amount,
                updatedDebitNote.invoice_id,
                debitNoteId,
                transaction
              );
            } else if (updatedDebitNote.invoice_type === 'manualInvoice') {
              manualAmountToIncrease.push({
                invoice_id: updatedDebitNote.invoice_id,
                amount: parseInt(updatedDebitNote.amount, 10),
              });

              updatedInvoice = await invoiceService.decrementManualInvoice(
                'debit_note',
                updatedDebitNote.amount,
                updatedDebitNote.invoice_id,
                debitNoteId,
                transaction
              );
            } else {
              throw new Error('Invalid invoice Number');
            }
            results.push({ updatedDebitNote, invoice: updatedInvoice[0][0] });
          }

          if (!isEmpty(tuitionAmountToIncrease)) {
            const groupedRecords = chain(tuitionAmountToIncrease)
              .groupBy('invoice_id')
              .map((value, key) => ({
                invoice_id: key,
                amount_to_increase: orderBy(value, 'amount'),
              }))
              .value();

            for (const item of groupedRecords) {
              await invoiceService.updateTuitioninvoiceByNotes(
                item.invoice_id,
                sumBy(item.amount_to_increase, 'amount'),
                'debit',
                transaction
              );
            }
          }

          if (!isEmpty(functionalAmountToIncrease)) {
            const groupedRecords = chain(functionalAmountToIncrease)
              .groupBy('invoice_id')
              .map((value, key) => ({
                invoice_id: key,
                amount_to_increase: orderBy(value, 'amount'),
              }))
              .value();

            for (const item of groupedRecords) {
              await invoiceService.updateFunctionalinvoiceByNotes(
                item.invoice_id,
                sumBy(item.amount_to_increase, 'amount'),
                'debit',
                transaction
              );
            }
          }

          if (!isEmpty(otherFeesAmountToIncrease)) {
            const groupedRecords = chain(otherFeesAmountToIncrease)
              .groupBy('invoice_id')
              .map((value, key) => ({
                invoice_id: key,
                amount_to_increase: orderBy(value, 'amount'),
              }))
              .value();

            for (const item of groupedRecords) {
              await invoiceService.updateOtherFeesInvoiceByNotes(
                item.invoice_id,
                sumBy(item.amount_to_increase, 'amount'),
                'debit',
                transaction
              );
            }
          }

          if (!isEmpty(manualAmountToIncrease)) {
            const groupedRecords = chain(manualAmountToIncrease)
              .groupBy('invoice_id')
              .map((value, key) => ({
                invoice_id: key,
                amount_to_increase: orderBy(value, 'amount'),
              }))
              .value();

            for (const item of groupedRecords) {
              await invoiceService.updateManualInvoiceByNotes(
                item.invoice_id,
                sumBy(item.amount_to_increase, 'amount'),
                'debit',
                transaction
              );
            }
          }

          return results;
        }
      );

      http.setSuccess(200, 'Debit Notes approved successfully.', {
        data: updatedValues,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Approve these Debit Notes', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * DECLINE PENDING Debit Notes
   *
   * @param {*} req
   * @param {*} res
   */
  async declineDebitNotes(req, res) {
    try {
      const debitNotes = req.body.debit_notes;
      const staffID = req.user.id;

      const updatedValues = await model.sequelize.transaction(
        async (transaction) => {
          const results = [];

          for (const debitNoteId of debitNotes) {
            const dataToUpdate = {
              status: 'DECLINED',
              last_update_approval_status: 'DECLINED',
              create_approved_by_id: staffID,
              last_update_approved_by_id: staffID,
              create_approval_date: now(),
              last_update_approval_date: now(),
            };
            const declinedDebitNote = await debitNoteService.update(
              dataToUpdate,
              parseInt(debitNoteId, 10),
              transaction
            );

            if (!declinedDebitNote) throw new Error('Invalid Invoice provided');

            results.push(declinedDebitNote);
          }

          return results;
        }
      );

      http.setSuccess(200, 'Selected Debit Notes have been declined.', {
        data: updatedValues,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Decline these Debit Notes', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * GET ALL PENDING Debit Notes
   *
   * @param {*} req
   * @param {*} res
   */
  async getPendingDebitNotes(req, res) {
    try {
      const { studentId } = req.params;

      const results = await debitNoteService.findAll({
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

      http.setSuccess(200, 'Pending Debit Notes.', {
        data: results,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To get Pending Debit Notes', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * GET ALL PENDING Debit Notes
   *
   * @param {*} req
   * @param {*} res
   */
  async getBulkPendingDebitNotes(req, res) {
    try {
      const results = await debitNoteService.findAll({
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

      http.setSuccess(200, 'Pending Debit Notes.', {
        data: results,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To get Pending Debit Notes', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * GET ALL APPROVED Debit Notes
   *
   * @param {*} req
   * @param {*} res
   */
  async getAllApproved(req, res) {
    try {
      const results = await debitNoteService.findAll({
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

      http.setSuccess(200, 'Approved Debit  Notes.', {
        data: results,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To get approved Debit notes.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * GET ALL STUDENTS' APPROVED Debit Notes
   *
   * @param {*} req
   * @param {*} res
   */
  async getAllStudentApproved(req, res) {
    try {
      const { student_id: studentId } = req.params;
      const results = await debitNoteService.findAll({
        where: { status: 'APPROVED', student_id: studentId },
      });

      http.setSuccess(200, 'Approved Debit  Notes.', {
        data: results,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To get approved Debit notes.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

module.exports = DebitNoteController;
