const models = require('@models');
const { QueryTypes } = require('sequelize');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// courseAssignmentService

class CourseAssignmentService {
  /**
   *
   * @param {*} lecturer
   * users with lecturer role
   */

  static async usersWithLecturerRole() {
    try {
      const filtered = await models.sequelize.query(
        `select *
        from course_assignment.users_with_lecturer_role`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `courseAssignment.service.js`,
        `usersWithLecturerRole`,
        `GET`
      );
    }
  }

  // roles users.. filtered by role
  static async usersByRoles(role) {
    try {
      const filtered = await models.sequelize.query(
        `select * from course_assignment.role_users_function('%${role}%')`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `courseAssignment.service.js`,
        `usersByRoles`,
        `GET`
      );
    }
  }

  /**
   *
   * programmes by course assignment context
   */

  // programme types and programme versions

  static async programmesByCampusAndDepartment(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from course_assignment.programme_types_versions_function(${data.department_id},${data.campus_id},${data.programme_type_id})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `courseAssignment.service.js`,
        `programmesByCampusAndDepartment`,
        `GET`
      );
    }
  }

  // programmes by courses and department

  static async programmeCourseDepartment(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from course_assignment.course_programme_versions_function(${data.department_id},${data.campus_id},${data.programme_type_id})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `courseAssignment.service.js`,
        `programmeCourseDepartment`,
        `GET`
      );
    }
  }

  /**
   *
   * ALL PROGRAMME TYPES
   * @returns
   *
   * programme_all_types_function
   * course_programme_all_types_function
   */
  static async programmesByCampusAndDepartmentAllTypes(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from course_assignment.course_programme_all_types_function(${data.department_id},${data.campus_id})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `courseAssignment.service.js`,
        `programmesByCampusAndDepartmentAllTypes`,
        `GET`
      );
    }
  }

  //
  static async programmeCourseDepartmentAllTypes(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from course_assignment.programme_all_types_function(${data.department_id},${data.campus_id})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `courseAssignment.service.js`,
        `programmeCourseDepartmentAllTypes`,
        `GET`
      );
    }
  }

  // course grouping by context

  static async courseAssignmentGroupingByContext() {
    try {
      const filtered = await models.sequelize.query(
        `select * from course_assignment.course_assignments_view`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `courseAssignment.service.js`,
        `courseAssignmentGroupingByContext`,
        `GET`
      );
    }
  }

  // course unit by context
  static async courseUnitsByContext(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from course_assignment.course_unit_by_context_function(${data.academic_year_id},${data.semester_id},
          ${data.intake_id},${data.programme_version_id}, ${data.department_id})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `courseAssignment.service.js`,
        `courseUnitsByContext`,
        `GET`
      );
    }
  }

  // course assignment by filter

  static async courseAssignmentsFunction(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from course_assignment.course_assignment_function(${data.academic_year_id},
          ${data.campus_id},
          ${data.semester_id},
          ${data.intake_id},
          ${data.department_id},
          ${data.programme_id},${data.programme_type_id},${data.programme_version_id})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `courseAssignment.service.js`,
        `courseAssignmentsFunction`,
        `GET`
      );
    }
  }

  // assignments

  static async assignmentsFunction(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from course_assignment.assignments_function(${data.assignment_id},${data.programme_version_course_unit_id})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `courseAssignment.service.js`,
        `assignmentsFunction`,
        `GET`
      );
    }
  }

  // course assignment
  static async assignmentsByLecturerFunction(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from course_assignment.course_by_lecturer_function(${data.campus_id},${data.academic_year_id},${data.user_id})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `courseAssignment.service.js`,
        `assignmentsByLecturerFunction`,
        `GET`
      );
    }
  }
}

module.exports = CourseAssignmentService;
