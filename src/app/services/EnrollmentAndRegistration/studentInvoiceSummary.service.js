const models = require('@models');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');
const { QueryTypes } = require('sequelize');

// This Class is responsible for handling all database interactions for this entity
class StudentInvoiceSummaryService {
  /**
   * FIND ALL CURRENT REPORT
   *
   * @param {*} options
   */
  static async findAllCurrent(context) {
    try {
      const results = await models.sequelize.query(
        `SELECT *
          FROM enrollment_and_registration_mgt.current_student_invoice_summaries as inv
          where date_from = '${context.payments_from}' AND date_to = '${context.payments_to}'
         limit 1 `,

        {
          type: QueryTypes.SELECT,
          plain: true,
        }
      );

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `findAllCurrent.service.js`,
        `findAll`,
        `GET`
      );
    }
  }

  /**
   * GET STUDENTS' INVOICE SUMMARY
   *
   * @param {*} options
   */
  static async getInvoiceSummary(context) {
    try {
      const results = await models.sequelize.query(
        `
        SELECT 
        sum(invsum.opening_receivable) opening_receivable,
        sum(invsum.opening_prepayment) opening_prepayment,
        sum(invsum.tuition_bill) tuition_bill,
        sum(invsum.functional_bill) functional_bill,
        sum(invsum.manual_bill) manual_bill,
        sum(invsum.other_fees_bill) other_fees_bill,
        sum(invsum.curr_total_bill) curr_total_bill,
        sum(invsum.curr_credit_note) curr_credit_note,
        sum(invsum.curr_debit_note) curr_debit_note,
        sum(invsum.curr_total_payment) total_payment,
        sum(invsum.amount_due) amount_due,
        sum(invsum.prepayment) prepayment
        FROM enrollment_and_registration_mgt.student_invoices_summary as invsum
          where date_from = '${context.payments_from}' AND date_to = '${context.payments_to}'
         `,

        {
          type: QueryTypes.SELECT,
          plain: true,
        }
      );

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `findAllCurrent.service.js`,
        `getInvoiceSummary`,
        `GET`
      );
    }
  }

  /**
   * FIND ALL PREVIOUS REPORT
   *
   * @param {*} options
   */
  static async findAllPrevious(context) {
    try {
      const results = await models.sequelize.query(
        `SELECT *,
        (sum(inv.tuition_bill) + sum(inv.functional_bill) + sum(inv.manual_bill) + sum(inv.other_fees_bill)) total_manual_bill,
          FROM enrollment_and_registration_mgt.previous_student_invoice_summaries as inv
          where date_from = '${context.payments_from}' AND date_to = '${context.payments_to}'
         limit 1 `,

        {
          type: QueryTypes.SELECT,
          plain: true,
        }
      );

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `findAllCurrent.service.js`,
        `findAll`,
        `GET`
      );
    }
  }

  /**
   * FIND ALL CURRENT REPORT
   *
   * @param {*} options
   */
  static async findAllCurrentSummary(context) {
    try {
      const results = await models.sequelize.query(
        `SELECT 
          count(inv.id) count,
          sum(inv.tuition_bill) as tuition_bill,
          sum(inv.functional_bill) as functional_bill,
          sum(inv.manual_bill) as manual_bill,
          sum(inv.other_fees_bill) as other_fees_bill,
          (sum(inv.tuition_bill) + sum(inv.functional_bill) + sum(inv.manual_bill) + sum(inv.other_fees_bill)) total_manual_bill,
          sum(inv.total_bill) as total_bill,
          -- sum(inv.total_due) as total_due,
          -- sum(inv.total_paid) as total_paid,
          -- sum(inv.prepayments) as total_prepayments,
          -- sum(inv.credit_notes) as credit_notes,
          -- sum(inv.debit_notes) as debit_notes,
          sum(inv.opening_balance) as opening_balance
          FROM enrollment_and_registration_mgt.current_student_invoice_summaries as inv
          where date_from = '${context.payments_from}' AND date_to = '${context.payments_to}'
         limit 1 `,

        {
          type: QueryTypes.SELECT,
          plain: true,
        }
      );

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `findAllCurrent.service.js`,
        `findAllCurrentSummary`,
        `GET`
      );
    }
  }

  /**
   * FIND ALL PREVIOUS SUMMARY REPORT
   *
   * @param {*} options
   */
  static async findAllPreviousSummary(context) {
    try {
      const results = await models.sequelize.query(
        `SELECT 
          count(inv.id) count,
          sum(inv.tuition_bill) as tuition_bill,
          sum(inv.functional_bill) as functional_bill,
          sum(inv.manual_bill) as manual_bill,
          sum(inv.other_fees_bill) as other_fees_bill,
          (sum(inv.tuition_bill) + sum(inv.functional_bill) + sum(inv.manual_bill) + sum(inv.other_fees_bill)) total_manual_bill,
          sum(inv.total_bill) as total_bill
          FROM enrollment_and_registration_mgt.previous_student_invoice_summaries as inv
          where date_from = '${context.payments_from}' AND date_to = '${context.payments_to}'
          limit 1`,

        {
          type: QueryTypes.SELECT,
          plain: true,
        }
      );

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `findAllCurrent.service.js`,
        `findAllPreviousSummary`,
        `GET`
      );
    }
  }

  /** CREATE PREVIOUS REPORT
   *
   * @param {*} id
   * @param {*} data
   */
  static async bulkCreatePrevious(data, transaction) {
    try {
      const result = await models.PreviousStudentInvoice.bulkCreate(data, {
        updateOnDuplicate: [
          'tuition_bill',
          'functional_bill',
          'manual_bill',
          'other_fees_bill',
          'total_bill',
          'last_generated_by',
        ],
        transaction,
        returning: false,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `studentInvoiceSummary.service.js`,
        `bulkCreate`,
        `POST`
      );
    }
  }

  /** CREATE CURRENT REPORT
   *
   * @param {*} id
   * @param {*} data
   */
  static async bulkCreateCurrent(data, transaction) {
    try {
      const result = await models.CurrentStudentInvoice.bulkCreate(data, {
        updateOnDuplicate: [
          'tuition_bill',
          'functional_bill',
          'manual_bill',
          'other_fees_bill',
          'total_bill',
          'prepayments',
          'opening_balance',
          'total_due',
          'total_billed',
          'total_paid',
          'credit_notes',
          'debit_notes',
        ],
        transaction,
        returning: false,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `studentInvoiceSummary.service.js`,
        `bulkCreateCurrent`,
        `POST`
      );
    }
  }

  /** CREATE CURRENT REPORT
   *
   * @param {*} id
   * @param {*} data
   */
  static async bulkCreateInvoiceSummary(data, transaction) {
    try {
      const result = await models.StudentInvoiceSummary.bulkCreate(data, {
        updateOnDuplicate: [
          'tuition_bill',
          'functional_bill',
          'manual_bill',
          'other_fees_bill',
          'prev_credit_note',
          'prev_debit_note',
          'prev_payment',
          'prev_total_payment',
          'prev_total_bill',
          'opening_receivable',
          'curr_credit_note',
          'curr_debit_note',
          'curr_total_bill',
          'curr_payment',
          'curr_total_payment',
          'prepayment',
          'amount_due',
        ],
        transaction,
        returning: false,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `studentInvoiceSummary.service.js`,
        `bulkCreateInvoiceSummary`,
        `POST`
      );
    }
  }

  /** CREATE CURRENT REPORT
   *
   * @param {*} id
   * @param {*} data
   */
  static async getReportSummaryCount(option) {
    try {
      const result = await models.StudentInvoiceSummary.count(option);

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `studentInvoiceSummary.service.js`,
        `getReportSummaryCount`,
        `GET`
      );
    }
  }

  /** FIND INVOICE TRACKER
   *
   * @param {*} id
   * @param {*} data
   */
  static async findInvoiceTracker(option) {
    try {
      const result = await models.InvoiceSummaryTracker.findOne(option);

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `studentInvoiceSummary.service.js`,
        `findInvoiceTracker`,
        `GET`
      );
    }
  }

  /** CREATE INVOICE TRACKER
   *
   * @param {*} id
   * @param {*} data
   */
  static async createInvoiceTracker(data) {
    try {
      const result = await models.InvoiceSummaryTracker.findOne({
        where: {
          activity: 'SUMMARY REPORT',
          date_from: data.date_from,
          date_to: data.date_to,
        },
      }).then(function (obj) {
        // update
        if (obj) return obj.update(data, { returning: false });

        // insert
        return models.InvoiceSummaryTracker.create(data, { returning: false });
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `studentInvoiceSummary.service.js`,
        `createInvoiceTracker`,
        `POST`
      );
    }
  }

  /** UPDATE INVOICE TRACKER
   *
   * @param {*} id
   * @param {*} data
   */
  static async updateInvoiceTracker(data, condition) {
    try {
      const result = await models.InvoiceSummaryTracker.update(data, {
        where: condition,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `studentInvoiceSummary.service.js`,
        `updateInvoiceTracker`,
        `PUT`
      );
    }
  }

  /** CREATE CURRENT REPORT
   *
   * @param {*} id
   * @param {*} data
   */
  static async updateOrCreate(data) {
    try {
      const result = await models.CurrentStudentInvoice.findOne({
        where: {
          student_programme_id: data.student_programme_id,
          programme_id: data.programme_id,
          student_id: data.student_id,
          date_from: data.date_from,
          date_to: data.date_to,
        },
      }).then(function (obj) {
        // update
        if (obj) return obj.update(data, { returning: false });

        // insert
        return models.CurrentStudentInvoice.create(data, { returning: false });
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `studentInvoiceSummary.service.js`,
        `updateOrCreate`,
        `POST`
      );
    }
  }

  /**
   * FIND ALL CURRENT PAYMENT SUMMARY REPORT
   *
   * @param {*} options
   */
  static async allCurrentPaymentSummary(context) {
    try {
      const results = await models.sequelize.query(
        `SELECT 
          sum(pay.amount) as total_paid
          from universal_payments_mgt.all_student_payments_function('${context.payments_from}','${context.payments_to}')
           as pay
          limit 1`,

        {
          type: QueryTypes.SELECT,
          plain: true,
        }
      );

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `findAllCurrent.service.js`,
        `allCurrentPaymentSummary`,
        `GET`
      );
    }
  }

  /**
   * FIND ALL PREVIOUS PAYMENT SUMMARY REPORT
   *
   * @param {*} options
   */
  static async allPreviousPaymentSummary(context) {
    try {
      const results = await models.sequelize.query(
        `SELECT 
          sum(pay.amount) as total_paid
          from universal_payments_mgt.all_student_prev_payments_function('${context.payments_from}')
           as pay
          limit 1`,

        {
          type: QueryTypes.SELECT,
          plain: true,
        }
      );

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `findAllCurrent.service.js`,
        `allPreviousPaymentSummary`,
        `GET`
      );
    }
  }

  /**
   * FIND ALL CURRENT PAYMENT SUMMARY REPORT
   *
   * @param {*} options
   */
  static async allCurrDebitNoteSummary(context) {
    try {
      const results = await models.sequelize.query(
        `SELECT 
          sum(pay.amount) as total_paid
          from universal_payments_mgt.all_student_debit_notes_function('${context.payments_from}','${context.payments_to}')
           as pay
          limit 1`,

        {
          type: QueryTypes.SELECT,
          plain: true,
        }
      );

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `findAllCurrent.service.js`,
        `allCurrDebitNoteSummary`,
        `GET`
      );
    }
  }

  /**
   * FIND ALL PREVIOUS PAYMENT SUMMARY REPORT
   *
   * @param {*} options
   */
  static async allPrevDebitNoteSummary(context) {
    try {
      const results = await models.sequelize.query(
        `SELECT 
          sum(pay.amount) as total_paid
          from universal_payments_mgt.all_student_prev_debit_notes_function('${context.payments_from}')
           as pay
          limit 1`,

        {
          type: QueryTypes.SELECT,
          plain: true,
        }
      );

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `findAllCurrent.service.js`,
        `allPrevDebitNoteSummary`,
        `GET`
      );
    }
  }

  /**
   * FIND ALL CURRENT CREDIT NOTE SUMMARY REPORT
   *
   * @param {*} options
   */
  static async allCurrCreditNoteSummary(context) {
    try {
      const results = await models.sequelize.query(
        `SELECT 
          sum(pay.amount) as total_paid
          from universal_payments_mgt.all_student_credit_notes_function('${context.payments_from}','${context.payments_to}')
           as pay
          limit 1`,

        {
          type: QueryTypes.SELECT,
          plain: true,
        }
      );

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `findAllCurrent.service.js`,
        `allCurrCreditNoteSummary`,
        `GET`
      );
    }
  }

  /**
   * FIND ALL PREVIOUS CREDIT_NOTE SUMMARY REPORT
   *
   * @param {*} options
   */
  static async allPrevCreditNoteSummary(context) {
    try {
      const results = await models.sequelize.query(
        `SELECT 
          sum(pay.amount) as total_paid
          from universal_payments_mgt.all_student_prev_credit_notes_function('${context.payments_from}')
           as pay
          limit 1`,

        {
          type: QueryTypes.SELECT,
          plain: true,
        }
      );

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `findAllCurrent.service.js`,
        `allPrevCreditNoteSummary`,
        `GET`
      );
    }
  }
}

module.exports = StudentInvoiceSummaryService;
