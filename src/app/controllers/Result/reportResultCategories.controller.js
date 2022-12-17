const { HttpResponse } = require('@helpers');
const { fetchSenateReport } = require('../Helpers/senateReportHelper');

const http = new HttpResponse();

class ReportResultCategoriesController {
  //  result report ..
  async summaryReportFunction(req, res) {
    try {
      const context = req.query;

      if (
        !context.campus_id ||
        !context.intake_id ||
        !context.programme_id ||
        !context.academic_year_id ||
        !context.study_year_id ||
        !context.semester_id
      ) {
        throw new Error('Invalid Context Provided');
      }

      const data = await fetchSenateReport(context);

      http.setSuccess(200, 'Result Detailed Report fetched successfully', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Result Detailed Report', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

module.exports = ReportResultCategoriesController;
