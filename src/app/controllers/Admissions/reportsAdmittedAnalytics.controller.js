// admissionAnalyticsReport
const { HttpResponse } = require('@helpers');
const {
  admissionAnalyticsSummary,
  analyticsAcademicYear,
  analyticsAcademicUnits,
} = require('../Helpers/admittedAnalyticsHelper');

const http = new HttpResponse();

class ReportsAdmittedAnalyticsController {
  //  admissionAnalyticsReport
  async admissionAnalyticsReport(req, res) {
    try {
      if (!req.query.report_category) {
        throw new Error('Invalid Context Provided');
      }

      const context = req.query;

      let data = [];

      if (context.report_category === 'SUMMARY') {
        data = await admissionAnalyticsSummary(context);
      } else if (context.report_category === 'UNITS') {
        data = await analyticsAcademicUnits(context);
      } else if (context.report_category === 'YEAR') {
        data = await analyticsAcademicYear(context);
      } else {
        throw new Error('Invalid Data Request');
      }

      http.setSuccess(
        200,
        'Admitted Applicants Analytics fetched successfully',
        {
          data,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Report', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

module.exports = ReportsAdmittedAnalyticsController;
