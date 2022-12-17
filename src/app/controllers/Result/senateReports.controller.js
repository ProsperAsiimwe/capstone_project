const { HttpResponse } = require('@helpers');
const { senateReportService } = require('@services/index');
const models = require('@models');
const { fetchSenateReport } = require('../Helpers/senateReportHelper');
const {
  senateAnalyticsFunction,
} = require('../Helpers/senateResultAnalyticsHelper');

const http = new HttpResponse();

class SenateReportsController {
  // senate report

  async reportByAcademicUnit(req, res) {
    try {
      const context = req.query;

      if (
        !req.query.campus_id ||
        !req.query.intake_id ||
        !req.query.academic_unit_id ||
        !req.query.academic_year_id ||
        !req.query.academic_unit
      ) {
        throw new Error('Invalid Context Provided');
      }

      let data = [];

      let report = {};

      if (context.academic_unit === 'faculty') {
        data = await senateReportService.senateFacultyReport(context);

        report = senateAnalyticsFunction(data);
      } else if (context.academic_unit === 'department') {
        data = await senateReportService.senateDepartmentReport(context);

        report = senateAnalyticsFunction(data);
      }

      http.setSuccess(200, 'Result Report fetched successfully', {
        report,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Result Report', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  // senate report

  async senateResultReport(req, res) {
    try {
      const context = req.query;

      if (
        !req.query.campus_id ||
        !req.query.intake_id ||
        !req.query.academic_year_id
      ) {
        throw new Error('Invalid Context Provided');
      }

      const data = await senateReportService.senateResultReport(context);

      http.setSuccess(200, 'Senate Result Report fetched successfully', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Senate Result Report', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async generateSenateReport(req, res) {
    try {
      const context = req.body;

      const senateReport = await fetchSenateReport(context);

      const data = {};

      data.campus_id = context.campus_id;
      data.intake_id = context.intake_id;
      data.programme_id = context.programme_id;
      data.academic_year_id = context.academic_year_id;
      data.study_year_id = context.study_year_id;
      data.semester_id = context.semester_id;
      data.number_of_students = senateReport.numberOfStudents;
      data.students_by_gender = senateReport.studentsByGender;
      data.result_category = senateReport.studentsByCategory;
      data.semester_comment = senateReport.semesterComment;
      data.general_comment = senateReport.generalComment;

      const result = await models.sequelize.transaction(async (transaction) => {
        await senateReportService.createSenateReport(data, transaction);
      });

      http.setSuccess(
        200,
        'Senate Report For This Programme Generated Successfully.',
        {
          data: result,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable To Generate Senate Report For This Programme.',
        {
          error: { message: error.message },
        }
      );

      return http.send(res);
    }
  }
}

module.exports = SenateReportsController;
