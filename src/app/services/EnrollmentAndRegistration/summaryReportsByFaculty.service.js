const models = require('@models');
const { QueryTypes } = require('sequelize');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

class EnrollmentRegistrationReportsFacultyService {
  /**
   *
   * @param {enrollment and registration service } id
   * @param {*} data
   * by faculty and campus id and programme type id
   */

  static async enrolledStudentsByFaculty(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.enrollment_summary_by_faculty_function(${data.campus_id},'${data.academicYear}',
          ${data.intake_id},'${data.semester}',${data.programme_type_id},${data.academic_unit_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `summaryReportsByFaculty.service.js`,
        `enrolledStudentsByFaculty`,
        `GET`
      );
    }
  }

  static async registeredStudentsByFaculty(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.registration_summary_by_faculty_function(${data.campus_id},${data.academic_year_id},
            ${data.intake_id},${data.semester_id},${data.programme_type_id},${data.academic_unit_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `summaryReportsByFaculty.service.js`,
        `registeredStudentsByFaculty`,
        `GET`
      );
    }
  }

  // by faculty and all programme types

  static async enrolledStudentsByFacultyAllProgrammeTypes(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.enrollment_summary_by_faculty_all_programme_types_function(${data.campus_id},'${data.academicYear}',
          ${data.intake_id},'${data.semester}',${data.academic_unit_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `summaryReportsByFaculty.service.js`,
        `enrolledStudentsByFacultyAllProgrammeTypes`,
        `GET`
      );
    }
  }

  static async registeredStudentsByFacultyAllProgrammeTypes(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.registration_summary_by_faculty_all_programme_types_function(${data.campus_id},${data.academic_year_id},
          ${data.intake_id},${data.semester_id},${data.academic_unit_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `summaryReportsByFaculty.service.js`,
        `registeredStudentsByFacultyAllProgrammeTypes`,
        `GET`
      );
    }
  }

  //  all campus and by  faculties

  static async enrolledStudentsByFacultyAllCampuses(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.enrollment_summary_by_faculty_all_campuses_function('${data.academicYear}',
          ${data.intake_id},'${data.semester}',${data.programme_type_id},${data.academic_unit_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `summaryReportsByFaculty.service.js`,
        `enrolledStudentsByFacultyAllCampuses`,
        `GET`
      );
    }
  }

  static async registeredStudentByFacultyAllCampuses(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.registration_summary_by_faculty_all_campuses_function(${data.academic_year_id},
            ${data.intake_id},${data.semester_id},${data.programme_type_id},${data.academic_unit_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `summaryReportsByFaculty.service.js`,
        `registeredStudentByFacultyAllCampuses`,
        `GET`
      );
    }
  }

  // all campus and all faculty

  static async enrolledStudentsByFacultyCampusPorgrammeTypes(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.enrollment_summary_by_faculty_campuses_programme_types_function('${data.academicYear}',
          ${data.intake_id},'${data.semester}',${data.academic_unit_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `summaryReportsByFaculty.service.js`,
        `enrolledStudentsByFacultyCampusPorgrammeTypes`,
        `GET`
      );
    }
  }

  static async registeredStudentsByFacultyAllCampusesProgrammeTypes(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.registration_summary_by_faculty_campuses_programme_types_function(${data.academic_year_id},
            ${data.intake_id},${data.semester_id},${data.academic_unit_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `summaryReportsByFaculty.service.js`,
        `registeredStudentsByFacultyAllCampusesProgrammeTypes`,
        `GET`
      );
    }
  }
}

module.exports = EnrollmentRegistrationReportsFacultyService;
