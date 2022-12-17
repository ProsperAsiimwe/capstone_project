const models = require('@models');
const { QueryTypes } = require('sequelize');
const moment = require('moment');
const stream = require('stream');
const { sumBy, map, isEmpty, toUpper, pick } = require('lodash');
const StudentInvoiceSummaryService = require('@services/EnrollmentAndRegistration/studentInvoiceSummary.service');

class FinancialYearReport {
  /**
   * GET ALL STUDENT INVOICES WITHIN DATE RANGE
   *
   * @param {*} data
   * @returns
   */
  static async allStudentInvoices(dateFrom, dateTo, programmeId) {
    try {
      const whereClause = !programmeId
        ? ''
        : `WHERE  programme_id=${programmeId}`;

      const current = await models.sequelize.query(
        `SELECT * FROM universal_payments_mgt.all_student_invoices_function(
          '${moment(dateFrom).format()}','${moment(dateTo).format()}')
          ${whereClause}`,
        {
          type: QueryTypes.SELECT,
        }
      );

      const previous = await models.sequelize.query(
        `
        SELECT *
         FROM universal_payments_mgt.all_prev_student_invoices_function(
          '${moment(dateFrom).format()}')
          `,

        {
          type: QueryTypes.SELECT,
        }
      );

      return { current, previous };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  /**
   * GET ALL STUDENT PAYMENTS WITHIN DATE RANGE
   *
   * @param {*} data
   * @returns
   */
  static async allStudentPayments(dateFrom, dateTo, programmeId) {
    try {
      const whereClause = !programmeId
        ? ''
        : `WHERE  programme_id=${programmeId}`;

      const current = await models.sequelize.query(
        `
        SELECT *
         FROM universal_payments_mgt.all_student_payments_function(
          '${moment(dateFrom).format()}','${moment(dateTo).format()}')
          ${whereClause}`,

        {
          type: QueryTypes.SELECT,
        }
      );

      const previous = await models.sequelize.query(
        `
        SELECT *
         FROM universal_payments_mgt.all_student_prev_payments_function(
          '${moment(dateFrom).format()}')
          ${whereClause}`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return { current, previous };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  /**
   * GET ALL STUDENT CREDIT NOTES WITHIN DATE RANGE
   *
   * @param {*} data
   * @returns
   */
  static async allStudentCreditNotes(dateFrom, dateTo, programmeId) {
    try {
      const whereClause = !programmeId
        ? ''
        : `WHERE  programme_id=${programmeId}`;

      const current = await models.sequelize.query(
        `
        SELECT *
         FROM universal_payments_mgt.all_student_credit_notes_function(
          '${moment(dateFrom).format()}','${moment(dateTo).format()}')
          ${whereClause}`,

        {
          type: QueryTypes.SELECT,
        }
      );

      const previous = await models.sequelize.query(
        `
        SELECT *
         FROM universal_payments_mgt.all_student_prev_credit_notes_function(
          '${moment(dateFrom).format()}')
          ${whereClause}`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return { current, previous };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  /**
   * GET ALL STUDENT CREDIT NOTES WITHIN DATE RANGE
   *
   * @param {*} data
   * @returns
   */
  static async allStudentDebitNotes(dateFrom, dateTo, programmeId) {
    try {
      const whereClause = !programmeId
        ? ''
        : `WHERE  programme_id=${programmeId}`;

      const current = await models.sequelize.query(
        `
        SELECT *
         FROM universal_payments_mgt.all_student_debit_notes_function(
          '${moment(dateFrom).format()}','${moment(dateTo).format()}')
          ${whereClause}`,

        {
          type: QueryTypes.SELECT,
        }
      );

      const previous = await models.sequelize.query(
        `
        SELECT *
         FROM universal_payments_mgt.all_student_prev_debit_notes_function(
          '${moment(dateFrom).format()}')
          ${whereClause}`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return { current, previous };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  /**
   * GENERATE ALL STUDENT INVOICES WITHIN DATE RANGE
   *
   * @param {*} data
   * @returns
   */
  static async generateCurrentInvoices(dateFrom, dateTo, user) {
    try {
      const { Readable } = stream;
      const studProgCount = await models.StudentProgramme.count();

      const limit = 2000;

      let max = 1;

      let i = 1;

      if (studProgCount > limit) max = studProgCount / limit;

      const current = new Promise((resolve, reject) => {
        const currentData = [];

        const invoiceStream = new Readable({
          async read(size) {
            const result = await models.sequelize.query(
              `select * from universal_payments_mgt.all_student_invoices_function(
          '${moment(dateFrom).format()}','${moment(dateTo).format()}')
         LIMIT ${limit} OFFSET ${(i - 1) * limit}`,
              {
                type: QueryTypes.SELECT,
              }
            );

            if (!isEmpty(result)) this.push(JSON.stringify(result));

            i++;

            if (i === max + 1) this.push(null);
          },
        });

        invoiceStream.on('data', async (chunk) => {
          const jsonData = JSON.parse(chunk.toString());

          await StudentInvoiceSummaryService.bulkCreateCurrent(
            map(jsonData, (data) => {
              const tuition = sumBy(data.tuition_invoices, 'invoice_amount');
              const manual = sumBy(data.manual_invoices, 'invoice_amount');
              const otherFees = sumBy(data.other_invoices, 'invoice_amount');
              const functional = sumBy(
                data.functional_invoices,
                'invoice_amount'
              );

              return {
                student_programme_id: data.id,
                programme_id: data.programme_id,
                student_id: data.student_id,
                student_number: data.student_number,
                registration_number: data.registration_number,
                date_from: dateFrom,
                date_to: dateTo,
                surname: data.surname,
                other_names: data.other_names,
                current_study_year: data.current_study_year,
                programme_code: data.programme_code,
                programme_title: data.programme_title,
                tuition_bill: tuition,
                functional_bill: functional,
                manual_bill: manual,
                other_fees_bill: otherFees,
                last_generated_by: toUpper(
                  `${user.surname} ${user.other_names}`
                ),
                total_bill: tuition + manual + functional + otherFees,
              };
            })
          ).catch((err) => {
            throw new Error(err.message);
          });

          currentData.push(JSON.parse(chunk.toString()));
        });

        invoiceStream.on('end', resolve(currentData));
      });

      return current;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  /**
   * GENERATE ALL PREVIOUS STUDENT INVOICES WITHIN DATE RANGE
   *
   * @param {*} data
   * @returns
   */
  static async generatePreviousInvoices(dateFrom, dateTo, user) {
    try {
      const { Readable } = stream;
      const studProgCount = await models.StudentProgramme.count();

      const limit = 2000;

      let max = 1;

      let i = 1;

      if (studProgCount > limit) max = studProgCount / limit;

      const current = new Promise((resolve, reject) => {
        const currentData = [];

        const invoiceStream = new Readable({
          async read(size) {
            const result = await models.sequelize.query(
              `SELECT * FROM universal_payments_mgt.all_prev_student_invoices_function(
          '${moment(dateFrom).format()}')
          LIMIT ${limit} OFFSET ${(i - 1) * limit}`,
              {
                type: QueryTypes.SELECT,
              }
            );

            if (!isEmpty(result)) this.push(JSON.stringify(result));

            i++;

            if (i === max + 1) this.push(null);
          },
        });

        invoiceStream.on('data', async (chunk) => {
          const jsonData = JSON.parse(chunk.toString());

          await StudentInvoiceSummaryService.bulkCreatePrevious(
            map(jsonData, (data) => {
              const tuition = sumBy(data.tuition_invoices, 'invoice_amount');
              const manual = sumBy(data.manual_invoices, 'invoice_amount');
              const otherFees = sumBy(data.other_invoices, 'invoice_amount');
              const functional = sumBy(
                data.functional_invoices,
                'invoice_amount'
              );

              return {
                student_programme_id: data.id,
                programme_id: data.programme_id,
                student_id: data.student_id,
                student_number: data.student_number,
                registration_number: data.registration_number,
                date_from: dateFrom,
                date_to: dateTo,
                surname: data.surname,
                other_names: data.other_names,
                current_study_year: data.current_study_year,
                programme_code: data.programme_code,
                programme_title: data.programme_title,
                tuition_bill: tuition,
                functional_bill: functional,
                manual_bill: manual,
                other_fees_bill: otherFees,
                last_generated_by: toUpper(
                  `${user.surname} ${user.other_names}`
                ),
                total_bill: tuition + manual + functional + otherFees,
              };
            })
          ).catch((err) => {
            throw new Error(err.message);
          });

          currentData.push(JSON.parse(chunk.toString()));
        });

        invoiceStream.on('end', resolve(currentData));
      });

      return current;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  /**
   * GET ALL STUDENT INVOICES WITHIN DATE RANGE
   *
   * @param {*} data
   * @returns
   */
  static async singleStudentCreditNotes(dateFrom, dateTo, studentProgrammeId) {
    try {
      const current = await models.sequelize.query(
        `SELECT COALESCE(sum(amount), 0) as amount FROM universal_payments_mgt.all_student_credit_notes_function(
          '${moment(dateFrom).format()}','${moment(dateTo).format()}')
          WHERE  student_programme_id = '${studentProgrammeId}'`,
        {
          type: QueryTypes.SELECT,
          plain: true,
        }
      );

      const previous = await models.sequelize.query(
        `
        SELECT COALESCE(sum(amount), 0) as amount
         FROM universal_payments_mgt.all_student_prev_credit_notes_function(
          '${moment(dateFrom).format()}')
          WHERE  student_programme_id = '${studentProgrammeId}'`,

        {
          type: QueryTypes.SELECT,
          plain: true,
        }
      );

      return { current, previous };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  /**
   * GET ALL STUDENT INVOICES WITHIN DATE RANGE
   *
   * @param {*} data
   * @returns
   */
  static async singleStudentDebitNotes(dateFrom, dateTo, studentProgrammeId) {
    try {
      const current = await models.sequelize.query(
        `SELECT COALESCE(sum(amount), 0) as amount FROM universal_payments_mgt.all_student_debit_notes_function(
          '${moment(dateFrom).format()}','${moment(dateTo).format()}')
          WHERE  student_programme_id = '${studentProgrammeId}'`,
        {
          type: QueryTypes.SELECT,
          plain: true,
        }
      );

      const previous = await models.sequelize.query(
        `
        SELECT COALESCE(sum(amount), 0) as amount
         FROM universal_payments_mgt.all_student_prev_debit_notes_function(
          '${moment(dateFrom).format()}')
          WHERE  student_programme_id = '${studentProgrammeId}'`,

        {
          type: QueryTypes.SELECT,
          plain: true,
        }
      );

      return { current, previous };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  /**
   * GET ALL STUDENT PAYMENTS WITHIN DATE RANGE
   *
   * @param {*} data
   * @returns
   */
  static async singleStudentPayments(dateFrom, dateTo, studentProgrammeId) {
    try {
      const current = await models.sequelize.query(
        `
        SELECT COALESCE(sum(amount), 0) as amount
         FROM universal_payments_mgt.all_student_payments_function(
          '${moment(dateFrom).format()}','${moment(dateTo).format()}')
          WHERE  student_programme_id = '${studentProgrammeId}'`,

        {
          type: QueryTypes.SELECT,
          plain: true,
        }
      );

      const previous = await models.sequelize.query(
        `
        SELECT COALESCE(sum(amount), 0) as amount
         FROM universal_payments_mgt.all_student_prev_payments_function(
          '${moment(dateFrom).format()}')
           WHERE  student_programme_id = '${studentProgrammeId}'`,

        {
          type: QueryTypes.SELECT,
          plain: true,
        }
      );

      return { current, previous };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  /**
   * GET SINGLE STUDENT PREVIOUS INVOICES WITHIN DATE RANGE
   *
   * @param {*} data
   * @returns
   */
  static async singleStudentPrevInvoices(dateFrom, studentProgrammeId) {
    try {
      const result = await models.sequelize.query(
        `
        SELECT *
         FROM universal_payments_mgt.all_prev_student_invoices_function(
          '${moment(dateFrom).format()}')
        WHERE  id='${studentProgrammeId}' limit 1`,

        {
          type: QueryTypes.SELECT,
          plain: true,
        }
      );

      return result;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  /**
   * GET SINGLE STUDENT PREVIOUS INVOICES WITHIN DATE RANGE
   *
   * @param {*} data
   * @returns
   */
  static async getRangeStudentInvoices(dateFrom, dateTo, i, limit, user) {
    try {
      const result = await models.sequelize.query(
        `
       select 
          inv.id,
          inv.programme_id,
          inv.student_id,
          inv.student_number,
          inv.registration_number,
          inv.surname,
          inv.other_names,
          inv.programme_code,
          inv.programme_title,
          inv.current_study_year,
          sum (coalesce(currpay.amount, 0)) as curr_payment,
          sum (coalesce(prevpay.amount, 0)) as prev_payment,
          sum (coalesce(cred.amount, 0)) as curr_credit_note,
          sum (coalesce(prevcred.amount, 0)) as prev_credit_note,
          sum (coalesce(currdeb.amount, 0)) as curr_debit_note,
          sum (coalesce(prevdeb.amount, 0)) as prev_debit_note,
          CASE 
          WHEN previnv.id IS NULL THEN '{}'::json
          ELSE
          json_build_object(
            'tuition_invoices', to_jsonb(previnv.tuition_invoices),
            'functional_invoices', to_jsonb(previnv.functional_invoices),
            'manual_invoices', to_jsonb(previnv.manual_invoices),
            'other_invoices', to_jsonb(previnv.other_invoices)
          )
          END as prev_inv,
          to_jsonb(inv.tuition_invoices) tuition_invoices,
          to_jsonb(inv.functional_invoices) functional_invoices,
          to_jsonb(inv.manual_invoices) manual_invoices,
          to_jsonb(inv.other_invoices) other_invoices

          from universal_payments_mgt.all_student_invoices_function(
          '${dateFrom}','${dateTo}'
          ) as inv

          LEFT JOIN universal_payments_mgt.all_prev_student_invoices_function(
          '${dateFrom}'
          ) as previnv on previnv.id = inv.id

          LEFT JOIN universal_payments_mgt.all_student_credit_notes_function(
          '${dateFrom}','${dateTo}'
          ) as cred on cred.student_programme_id = inv.id

          LEFT JOIN universal_payments_mgt.all_student_prev_credit_notes_function(
          '${dateFrom}'
          ) as prevcred on prevcred.student_programme_id = inv.id

          LEFT JOIN universal_payments_mgt.all_student_debit_notes_function(
          '${dateFrom}','${dateTo}'
          ) as currdeb on currdeb.student_programme_id = inv.id

          LEFT JOIN universal_payments_mgt.all_student_prev_debit_notes_function(
          '${dateFrom}'
          ) as prevdeb on prevdeb.student_programme_id = inv.id

          LEFT JOIN universal_payments_mgt.all_student_payments_function(
          '${dateFrom}','${dateTo}'
          ) as currpay on currpay.student_programme_id = inv.id

          LEFT JOIN universal_payments_mgt.all_student_prev_payments_function(
          '${dateFrom}'
          ) as prevpay on prevpay.student_programme_id = inv.id

          group by 
          inv.id,
          inv.programme_id,
          inv.student_id,
          inv.student_number,
          inv.registration_number,
          inv.surname,
          inv.other_names,
          inv.programme_code,
          inv.programme_title,
          inv.current_study_year,
          to_jsonb(inv.tuition_invoices),
          to_jsonb(inv.functional_invoices),
          to_jsonb(inv.manual_invoices),
          to_jsonb(inv.other_invoices),
          to_jsonb(previnv.tuition_invoices),
          to_jsonb(previnv.functional_invoices),
          to_jsonb(previnv.manual_invoices),
          to_jsonb(previnv.other_invoices),
          previnv.id

           LIMIT ${limit} OFFSET ${(i - 1) * limit}`,

        {
          type: QueryTypes.SELECT,
        }
      );

      const formattedData = map(result, (data) => {
        let openingReceivable = 0;

        let openingPrepayment = 0;

        let prepayment = 0;

        let amountDue = 0;

        let prevBill = data.prev_debit_note;

        const prevPayment = data.prev_payment + data.prev_credit_note;

        if (!isEmpty(data.prev_inv)) {
          prevBill +=
            sumBy(data.prev_inv.tuition_invoices, 'invoice_amount') +
            sumBy(data.prev_inv.functional_invoices, 'invoice_amount') +
            sumBy(data.prev_inv.manual_invoices, 'invoice_amount') +
            sumBy(data.prev_inv.tuition_invoices, 'invoice_amount');
        }

        if (prevPayment > prevBill) openingPrepayment = prevPayment - prevBill;
        else openingReceivable = prevBill - prevPayment;

        const tuition = sumBy(data.tuition_invoices, 'invoice_amount');
        const manual = sumBy(data.manual_invoices, 'invoice_amount');
        const otherFees = sumBy(data.other_invoices, 'invoice_amount');
        const functional = sumBy(data.functional_invoices, 'invoice_amount');

        const currBill =
          tuition +
          manual +
          functional +
          otherFees +
          openingReceivable +
          data.curr_debit_note;

        const currPayment =
          data.curr_payment + openingPrepayment + data.curr_credit_note;

        if (currPayment > currBill) prepayment = currPayment - currBill;
        else amountDue = currBill - currPayment;

        const pickedRes = pick(data, [
          'programme_id',
          'student_id',
          'surname',
          'other_names',
          'student_number',
          'registration_number',
          'programme_code',
          'programme_title',
          'current_study_year',
          'curr_credit_note',
          'curr_debit_note',
          'prev_credit_note',
          'prev_debit_note',
          'curr_payment',
          'prev_payment',
        ]);

        return {
          ...pickedRes,
          student_programme_id: data.id,
          tuition_bill: tuition,
          functional_bill: functional,
          manual_bill: manual,
          other_fees_bill: otherFees,
          prev_total_bill: prevBill,
          prev_total_payment: prevPayment,
          curr_total_bill:
            tuition + manual + functional + otherFees + data.curr_debit_note,
          curr_total_payment: currPayment,
          amount_due: amountDue,
          opening_prepayment: openingPrepayment,
          opening_receivable: openingReceivable,
          prepayment,
          date_from: dateFrom,
          date_to: dateTo,
          last_generated_by: toUpper(`${user.surname} ${user.other_names}`),
        };
      });

      return formattedData;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

module.exports = FinancialYearReport;
