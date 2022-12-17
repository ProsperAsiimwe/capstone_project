//   summaryPaymentReportService,
const { HttpResponse } = require('@helpers');
const {
  summaryPaymentReportService,
  institutionStructureService,
} = require('@services/index');
const { toUpper } = require('lodash');

const http = new HttpResponse();

class SummaryPaymentReportController {
  //  SummaryPaymentReport
  async paymentAcademicUnitReport(req, res) {
    try {
      if (
        !req.query.academic_year_id ||
        !req.query.intake_id ||
        !req.query.semester_id
      ) {
        throw new Error('Invalid Context Provided');
      }
      let result = [];

      const context = req.query;

      const institutionStructure =
        await institutionStructureService.findInstitutionStructureRecords();

      const institutionStructureUpper = institutionStructure.academic_units.map(
        (e) => toUpper(e)
      );

      if (
        context.campus_id !== 'all' &&
        institutionStructure &&
        institutionStructureUpper
          .map((element) => element.includes('COL'))
          .includes(true)
      ) {
        result = await summaryPaymentReportService.collegeByCampus(context);

        result.forEach((element) => {
          const totalPaid =
            element.tuition_amount_paid +
            element.functional_fees_amount_paid +
            element.other_fees_amount_paid +
            element.manual_invoices_amount_paid;
          const totalBilled =
            element.tuition_invoice_amount +
            element.functional_fees_invoice_amount +
            element.other_fees_invoice_amount +
            element.manual_invoice_amount;
          const totalDue =
            element.tuition_amount_due +
            element.functional_fees_amount_due +
            element.other_fees_amount_due +
            element.manual_invoice_amount_due;

          element.totalPaid = totalPaid;
          element.totalBilled = totalBilled;
          element.totalDue = totalDue;
        });
      } else if (
        context.campus_id === 'all' &&
        institutionStructure &&
        institutionStructureUpper
          .map((element) => element.includes('COL'))
          .includes(true)
      ) {
        result = await summaryPaymentReportService.allCampusCollegeByCampus(
          context
        );

        result.forEach((element) => {
          const totalPaid =
            element.tuition_amount_paid +
            element.functional_fees_amount_paid +
            element.other_fees_amount_paid +
            element.manual_invoices_amount_paid;
          const totalBilled =
            element.tuition_invoice_amount +
            element.functional_fees_invoice_amount +
            element.other_fees_invoice_amount +
            element.manual_invoice_amount;
          const totalDue =
            element.tuition_amount_due +
            element.functional_fees_amount_due +
            element.other_fees_amount_due +
            element.manual_invoice_amount_due;

          element.totalPaid = totalPaid;
          element.totalBilled = totalBilled;
          element.totalDue = totalDue;
        });
      } else if (
        context.campus_id !== 'all' &&
        institutionStructure &&
        (institutionStructureUpper
          .map((element) => element.includes('FAC'))
          .includes(true) ||
          institutionStructureUpper
            .map((element) => element.includes('SCH'))
            .includes(true))
      ) {
        result = await summaryPaymentReportService.facultyByCampus(context);

        result.forEach((element) => {
          const totalPaid =
            element.tuition_amount_paid +
            element.functional_fees_amount_paid +
            element.other_fees_amount_paid +
            element.manual_invoices_amount_paid;
          const totalBilled =
            element.tuition_invoice_amount +
            element.functional_fees_invoice_amount +
            element.other_fees_invoice_amount +
            element.manual_invoice_amount;
          const totalDue =
            element.tuition_amount_due +
            element.functional_fees_amount_due +
            element.other_fees_amount_due +
            element.manual_invoice_amount_due;

          element.totalPaid = totalPaid;
          element.totalBilled = totalBilled;
          element.totalDue = totalDue;
        });
      } else if (
        context.campus_id === 'all' &&
        institutionStructure &&
        (institutionStructureUpper
          .map((element) => element.includes('FAC'))
          .includes(true) ||
          institutionStructureUpper
            .map((element) => element.includes('SCH'))
            .includes(true))
      ) {
        result = await summaryPaymentReportService.allCampusFacultyByCampus(
          context
        );

        result.forEach((element) => {
          const totalPaid =
            element.tuition_amount_paid +
            element.functional_fees_amount_paid +
            element.other_fees_amount_paid +
            element.manual_invoices_amount_paid;
          const totalBilled =
            element.tuition_invoice_amount +
            element.functional_fees_invoice_amount +
            element.other_fees_invoice_amount +
            element.manual_invoice_amount;
          const totalDue =
            element.tuition_amount_due +
            element.functional_fees_amount_due +
            element.other_fees_amount_due +
            element.manual_invoice_amount_due;

          element.totalPaid = totalPaid;
          element.totalBilled = totalBilled;
          element.totalDue = totalDue;
        });
      } else {
        throw new Error('Invalid Context Provided');
      }

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

module.exports = SummaryPaymentReportController;
