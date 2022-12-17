//
const models = require('@models');
const { QueryTypes } = require('sequelize');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

class LecturerAppService {
  static async lecturerCourses(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from course_assignment.lecturer_courses_function(${data.academic_year_id},${data.user_id})`,
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

  //  programmeEnrolledStudents

  static async programmeEnrolledStudents(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from course_assignment.programme_enrolled_students(${data.academic_year_id},${data.semester_id},
          ${data.intake_id},${data.campus_id},${data.programme_id},${data.course_id})
          where study_year_id = ${data.studyYearId.course_unit_year_id} or course_status not like 'NORMAL%'`,
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

module.exports = LecturerAppService;
