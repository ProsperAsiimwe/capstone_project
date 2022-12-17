const {
  getStudentSemesterResults,
} = require('@controllers/Helpers/semesterResultsHelper');
const { HttpResponse } = require('@helpers');
const { graduationListService } = require('@services/index');
const { isEmpty } = require('lodash');

const http = new HttpResponse();

class TranscriptController {
  // transcript results

  async transcriptResultView(req, res) {
    try {
      if (!req.query.student) {
        throw new Error('Invalid Context Provided');
      }

      const context = req.query;

      const studentData = await graduationListService.findStudentByRegNo(
        context
      );

      if (isEmpty(studentData)) {
        throw new Error(
          `Academic Record Does Not Exist,No Student Record Associated to ${req.query.student}`
        );
      }

      let graduationLoad = null;

      if (studentData.programme_version_plan_id === null) {
        const entryYearContext = {
          programme_version_id: studentData.programme_version_id,
          student_entry_year_id: studentData.student_entry_year_id,
        };

        graduationLoad = await graduationListService.entryYearGraduationLoad(
          entryYearContext
        );
      } else {
        const planContext = {
          programme_version_id: studentData.programme_version_id,
          programme_version_plan_id: studentData.programme_version_plan_id,
        };

        graduationLoad = await graduationListService.planGraduationLoad(
          planContext
        );
      }

      const result = await getStudentSemesterResults(
        studentData.registration_number
      );

      const data = {
        graduationLoad: graduationLoad ? graduationLoad.graduation_load : null,
        ...result,
      };

      http.setSuccess(200, 'Student Transcript Results fetched successfully ', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Student Transcript Results', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

module.exports = TranscriptController;
