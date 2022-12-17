/* eslint-disable camelcase */
const { HttpResponse } = require('@helpers');
const {
  courseAssignmentService,
  assignmentService,
} = require('@services/index');
const { isEmpty } = require('lodash');

const http = new HttpResponse();

class CourseAssignmentController {
  /**
   * users with lecturer role
   * @param {*} req
   * @param {*} res
   */

  async usersWithLecturerRoleFunction(req, res) {
    try {
      const result = await courseAssignmentService.usersWithLecturerRole();

      http.setSuccess(200, 'Users With Lecturer Role Fetched Successfully', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, error.message);

      return http.send(res);
    }
  }

  // users by roles function
  async usersByRolesFunction(req, res) {
    try {
      const { role } = req.query;

      const result = await courseAssignmentService.usersByRoles(role);

      http.setSuccess(200, 'Role Users Fetched Successfully', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, error.message);

      return http.send(res);
    }
  }

  // course units by context --- courseUnitsByContext
  async courseUnitByContextFunction(req, res) {
    try {
      const context = req.query;

      if (
        !context.semester_id ||
        !context.intake_id ||
        !context.academic_year_id ||
        !context.programme_version_id ||
        !context.department_id
      ) {
        throw new Error('Invalid Context provided');
      }

      const result = await courseAssignmentService.courseUnitsByContext(
        context
      );

      http.setSuccess(200, 'Course Units fetched Successfully', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, error.message);

      return http.send(res);
    }
  }

  // programme types and versions
  async programmesByCampusAndDepartmentFunction(req, res) {
    try {
      const context = req.query;

      if (!context.campus_id || !context.department_id) {
        throw new Error('Invalid Context provided');
      }

      if (context.programme_type === 'all' && context.programme_type_id) {
        throw new Error('Too many arguments provided');
      }

      let resultOne = [];

      let resultTwo = [];

      if (context.programme_type === 'all' && !context.programme_type_id) {
        resultOne =
          await courseAssignmentService.programmesByCampusAndDepartmentAllTypes(
            context
          );

        resultTwo =
          await courseAssignmentService.programmeCourseDepartmentAllTypes(
            context
          );
      } else {
        resultOne =
          await courseAssignmentService.programmesByCampusAndDepartment(
            context
          );

        resultTwo = await courseAssignmentService.programmeCourseDepartment(
          context
        );
      }
      const result = resultOne.concat(resultTwo);

      http.setSuccess(200, 'Programme Types and Version Fetched Successfully', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, error.message);

      return http.send(res);
    }
  }

  // grouping course assignment by context

  async courseAssignmentGroupingFunction(req, res) {
    try {
      const result =
        await courseAssignmentService.courseAssignmentGroupingByContext();

      http.setSuccess(200, 'Course Assignment Grouping fetched Successfully', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, error.message);

      return http.send(res);
    }
  }

  // courseAssignmentsFunction
  /**
   * findOneRecord
   * assignmentService
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async courseAssignmentsByContext(req, res) {
    try {
      const context = req.query;

      if (
        !context.academic_year_id ||
        !context.campus_id ||
        !context.semester_id ||
        !context.intake_id ||
        !context.department_id ||
        !context.programme_id ||
        !context.programme_type_id ||
        !context.programme_version_id ||
        !context.version_course_unit_id
      ) {
        throw new Error('Invalid Context provided');
      }
      const {
        academic_year_id,
        campus_id,
        semester_id,
        intake_id,
        department_id,
        programme_id,
        programme_type_id,
        programme_version_id,
      } = req.query;

      const assignment = await assignmentService.findOneRecord({
        where: {
          academic_year_id,
          campus_id,
          semester_id,
          intake_id,
          department_id,
          programme_id,
          programme_type_id,
          programme_version_id,
        },
        raw: true,
      });

      let result = {};

      if (assignment) {
        const contextData = {
          assignment_id: assignment.id,
          programme_version_course_unit_id: context.version_course_unit_id,
        };

        result = await courseAssignmentService.assignmentsFunction(contextData);
        result = !isEmpty(result) ? result[0] : {};
      }

      http.setSuccess(200, 'Course Assignments Fetched Successfully', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, error.message);

      return http.send(res);
    }
  }
}

module.exports = CourseAssignmentController;
