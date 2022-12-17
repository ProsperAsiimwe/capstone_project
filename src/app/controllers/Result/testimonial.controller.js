const { HttpResponse } = require('@helpers');
const {
  graduationListService,
  academicDocumentService,
  metadataValueService,
  concededPassPolicyService,
  resultAllocationNodeService,
  userService,
} = require('@services/index');
const { isEmpty } = require('lodash');
const {
  getStudentSemesterResults,
} = require('@controllers/Helpers/semesterResultsHelper');

const http = new HttpResponse();

class TestimonialController {
  // testimonial results
  async testimonialResultView(req, res) {
    try {
      const { student } = req.query;

      if (!student) {
        throw new Error('Invalid Context Provided');
      }

      const cpMetadataValue = await metadataValueService.findOneMetadataValue({
        where: {
          metadata_value: 'CP',
        },
        attributes: ['id'],
        raw: true,
      });

      let concededPassPolicies = [];

      if (cpMetadataValue) {
        concededPassPolicies = await concededPassPolicyService.findAll({
          where: {
            remark_id: cpMetadataValue.id,
          },
        });
      }

      const context = req.query;

      const studentData = await graduationListService.findStudentByRegNo(
        context
      );

      if (isEmpty(studentData)) {
        throw new Error(
          `Wrong Student Or Registration Number Provided(No Student Record Associated to ${req.query.student}`
        );
      }

      const academicDocument = await academicDocumentService.findOne({
        where: {
          student_programme_id: studentData.student_programme_id,
        },
      });

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

      if (isEmpty(result)) throw new Error(`No Results found for ${student}`);

      const data = {
        graduationLoad: graduationLoad ? graduationLoad.graduation_load : null,
        ...result,
        academicDocument,
        concededPassPolicies,
      };

      http.setSuccess(
        200,
        'Student Testimonial Results fetched successfully ',
        {
          data,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Student Testimonial Results', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * SEARCH ALL STUDENT RESULTS
   *
   * @param {*} req
   * @param {*} res
   * @returns array of results
   */
  async searchAllStudentResults(req, res) {
    try {
      const { student } = req.query;

      if (!student) {
        throw new Error('Invalid Context Provided');
      }

      const context = req.query;

      const userId = req.user.id;

      const studentData = await graduationListService.findStudentByRegNo(
        context
      );

      if (isEmpty(studentData)) {
        throw new Error(
          `Wrong Student Or Registration Number Provided(No Student Record Associated to ${req.query.student}`
        );
      }

      let result = [];

      if (context.category === 'all') {
        const userBoundLevel = await userService.findUserRoleBoundLevel({
          user_id: userId,
          role_id: req.query.role_id,
          bound_level: 'PROGRAMMES',
        });

        if (!userBoundLevel) {
          throw new Error(`Access Domain Not Defined`);
        } else if (userBoundLevel.has_access_to_all === false) {
          const userRoleProgramme = await userService.userRoleProgramme({
            user_id: userId,
            role_id: req.query.role_id,
            programme_id: studentData.programme_id,
          });

          if (!userRoleProgramme) {
            throw new Error(
              `Access to Student Record Denied(PROGRAMME Permission Denied)`
            );
          }
        }

        /* else if (!userBoundLevel) {
          throw new Error(`Access Domain Not Defined`);
        } */

        result = await resultAllocationNodeService.searchAllStudentResults(
          studentData.registration_number
        );
      } else if (context.category === 'uploaded') {
        const data = await resultAllocationNodeService.searchAllStudentResults(
          studentData.registration_number
        );

        data.forEach((element) => {
          const filtered = element.results.filter((e) => {
            return e.uploaded_by_id === userId;
          });

          element.results = filtered;
        });

        result = data.filter((e) => {
          return e.results.length > 0;
        });
      } else {
        throw new Error(`Invalid Data Request`);
      }

      if (isEmpty(result)) throw new Error(`No Results found for ${student}`);

      const data = groupByStudent(result);

      http.setSuccess(200, 'Student  Results fetched successfully ', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Student Results', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

module.exports = TestimonialController;

const groupByStudent = (data) => {
  try {
    const merged = data.reduce(
      (
        groupedData,
        {
          student_programme_id,
          student_number,
          registration_number,
          surname,
          other_names,
          avatar,
          campus,
          gender,
          has_completed,
          is_current_programme,
          campus_id,
          programme_id,
          programme_code,
          programme_title,

          ...rest
        }
      ) => {
        const key = `${student_programme_id}-${student_number}`;

        groupedData[key] = groupedData[key] || {
          student_programme_id,
          student_number,
          registration_number,
          surname,
          other_names,
          avatar,
          campus,
          gender,
          has_completed,
          is_current_programme,
          campus_id,
          programme_id,
          programme_code,
          programme_title,
          result: [],
        };

        if (rest.academic_year) {
          groupedData[key].result.push(rest);
        }

        return groupedData;
      },
      {}
    );

    return Object.values(merged);
  } catch (error) {}
};
