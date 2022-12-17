// transactionsReport

const { HttpResponse } = require('@helpers');
const {
  transactionsReportService,
  institutionStructureService,
} = require('@services/index');

const { sumBy, toUpper } = require('lodash');

const http = new HttpResponse();

class TransactionsReportController {
  async transactionsReport(req, res) {
    try {
      if (
        !req.query.academic_year_id ||
        Number.isInteger(parseInt(req.query.academic_year_id, 10)) === false
      ) {
        throw new Error(`Invalid Request`);
      }

      const context = req.query;

      const result = await transactionsReportService.transactionsReport(
        context
      );

      result.forEach((element) => {
        const totalBill =
          element.tuition_invoice_amount +
          element.functional_fees_invoice_amount +
          element.other_fees_invoice_amount +
          element.manual_invoice_amount;

        const totalPaid =
          element.tuition_amount_paid +
          element.functional_fees_amount_paid +
          element.other_fees_amount_paid +
          element.manual_amount_paid;

        const totalDue =
          element.tuition_amount_due +
          element.functional_fees_amount_due +
          element.other_fees_amount_due +
          element.manual_amount_due;

        const percentageCompletion = ((totalPaid / totalBill) * 100).toFixed(2);

        element.totalBill = totalBill;
        element.totalPaid = totalPaid;
        element.totalDue = totalDue;
        element.percentageCompletion = percentageCompletion;
      });

      let totalTuition = 0;

      let totalFunctional = 0;

      let totalOthers = 0;

      let totalManual = 0;

      totalTuition = sumBy(result, 'tuition_invoice_amount');

      totalFunctional = sumBy(result, 'functional_fees_invoice_amount');

      totalOthers = sumBy(result, 'other_fees_invoice_amount');

      totalManual = sumBy(result, 'manual_invoice_amount');

      // paid
      let totalTuitionPaid = 0;

      let totalFunctionalPaid = 0;

      let totalOthersPaid = 0;

      let totalManualPaid = 0;

      totalTuitionPaid = sumBy(result, 'tuition_amount_paid');

      totalFunctionalPaid = sumBy(result, 'functional_fees_amount_paid');

      totalOthersPaid = sumBy(result, 'other_fees_amount_paid');

      totalManualPaid = sumBy(result, 'manual_amount_paid');

      // due

      let totalTuitionDue = 0;

      let totalFunctionalDue = 0;

      let totalOthersDue = 0;

      let totalManualDue = 0;

      totalTuitionDue = sumBy(result, 'tuition_amount_due');

      totalFunctionalDue = sumBy(result, 'functional_fees_amount_due');

      totalOthersDue = sumBy(result, 'other_fees_amount_due');

      totalManualDue = sumBy(result, 'manual_amount_due');

      const totalBill = sumBy(result, 'totalBill');

      const totalPaid = sumBy(result, 'totalPaid');

      const totalDue = sumBy(result, 'totalDue');

      const data = {
        totalBill,
        totalPaid,
        totalDue,
        tuition: { totalTuition, totalTuitionPaid, totalTuitionDue },
        functional: {
          totalFunctional,
          totalFunctionalPaid,
          totalFunctionalDue,
        },
        otherFees: { totalOthers, totalOthersPaid, totalOthersDue },
        manualInvoices: { totalManual, totalManualPaid, totalManualDue },
        result,
      };

      http.setSuccess(200, 'Report fetched successfully', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Report', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  // transactionsAcademicUnit

  async transactionsAcademicUnit(req, res) {
    try {
      if (
        !req.query.academic_year_id ||
        Number.isInteger(parseInt(req.query.academic_year_id, 10)) === false
      ) {
        throw new Error(`Invalid Request`);
      }

      const context = req.query;

      const institutionStructure =
        await institutionStructureService.findInstitutionStructureRecords();

      const institutionStructureUpper = institutionStructure.academic_units.map(
        (e) => toUpper(e)
      );

      let data = {};

      let manual = {};

      if (
        institutionStructure &&
        institutionStructureUpper
          .map((element) => element.includes('COL'))
          .includes(true)
      ) {
        data = await transactionsReportService.transactionsCollege(context);

        manual = await transactionsReportService.transactionsManualCollege(
          context
        );
      } else if (
        institutionStructure &&
        (institutionStructureUpper
          .map((element) => element.includes('FAC'))
          .includes(true) ||
          institutionStructureUpper
            .map((element) => element.includes('SCH'))
            .includes(true))
      ) {
        data = await transactionsReportService.transactionsFaculty(context);

        manual = await transactionsReportService.transactionsManualFaculty(
          context
        );
      } else {
        throw new Error('Invalid Context Provided');
      }

      data.forEach((element) => {
        const totalBill =
          element.total_tuition_amount +
          element.total_func_amount +
          element.total_other_fees_amount;

        const totalPaid =
          element.total_tuition_paid +
          element.total_func_paid +
          element.total_other_fees_paid;

        const totalDue =
          element.total_tuition_due +
          element.total_func_due +
          element.total_other_fees_due;

        element.totalBill = totalBill;
        element.totalPaid = totalPaid;
        element.totalDue = totalDue;
      });

      const result = { data, manual };

      http.setSuccess(200, 'Report fetched successfully', {
        result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Report', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

module.exports = TransactionsReportController;
