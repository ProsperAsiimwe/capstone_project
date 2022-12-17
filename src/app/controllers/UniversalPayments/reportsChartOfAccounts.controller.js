// assignmentsByLecturerFunction
const { HttpResponse } = require('@helpers');
const { handleChartOfAccountReport } = require('../Helpers/reportsHelper');
const http = new HttpResponse();

class ReportsChartOfAccountsController {
  async accountReportFunction(req, res) {
    const context = req.query;

    try {
      if (
        !context.payments_from ||
        !context.payments_to ||
        !context.account_id ||
        !context.transaction_category
      ) {
        throw new Error('Invalid Context Provided');
      }

      const data = await handleChartOfAccountReport(context);

      http.setSuccess(200, `Payment Transactions fetched successfully`, {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, `Unable To Fetch  Payment Transactions`, {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

module.exports = ReportsChartOfAccountsController;
