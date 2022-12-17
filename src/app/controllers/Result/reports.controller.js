const { HttpResponse } = require('@helpers');
const { reportsService } = require('@services/index');
const { meanBy, round, sumBy } = require('lodash');

const http = new HttpResponse();

class ReportsController {
  //  result report
  async reportFunction(req, res) {
    try {
      if (
        !req.query.campus_id ||
        !req.query.intake_id ||
        !req.query.programme_id ||
        !req.query.academic_year_id ||
        !req.query.study_year_id ||
        !req.query.semester_id
      ) {
        throw new Error('Invalid Context Provided');
      }

      const context = req.query;

      const semesterResults = await reportsService.studentResults(context);
      const resultsSummary = await reportsService.resultsByCourse(context);

      const resultSemesterGPA = semesterResults.map((result) => {
        let average = 0;

        let sum = 0;

        if (result.results) {
          average = meanBy(result.results, 'grading_point');
          sum = sumBy(result.results, 'credit_unit');
        }

        const gpa = round(average, 2).toFixed(2);

        return { ...result, semesterGPA: gpa, semesterCUs: sum };
      });
      const data = {
        resultsSummary,
        studentsDetailed: resultSemesterGPA,
      };

      http.setSuccess(200, 'Result Report fetched successfully', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Result Report', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  //  // programmesByDepartment
  async programmesByDepartment(req, res) {
    try {
      if (!req.query.department_id) {
        throw new Error('Invalid Context Provided');
      }

      const context = req.query;

      const data = await reportsService.programmesByDepartment(context);

      http.setSuccess(200, 'Programmes fetched successfully', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Programmes', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

module.exports = ReportsController;

// Analytics functions
