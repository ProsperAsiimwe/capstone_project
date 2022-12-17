const models = require('@models');
const { QueryTypes } = require('sequelize');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

class DetailedReportsByFacultyService {
  /*
   * all faculties
   * by campus
   * by programme_type
   */
  static async enrolledStudents(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.detailed_report_all_faculties(${data.campus_id},
            ${data.academic_year_id},${data.intake_id},${data.semester_id},${data.programme_type_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `detailedReportsByFaculties.service.js`,
        `enrolledStudents`,
        `GET`
      );
    }
  }

  //  all faculties, all programme types, by campus

  static async enrolledStudentsAllProgrammeTypes(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.detailed_report_all_faculties_programme_type(${data.campus_id},
            ${data.academic_year_id},${data.intake_id},${data.semester_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `detailedReportsByFaculties.service.js`,
        `enrolledStudentsAllProgrammeTypes`,
        `GET`
      );
    }
  }

  // all campus,all faculties, by programme types

  static async enrolledStudentsAllCampuses(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.detailed_report_all_faculties_campuses(${data.academic_year_id},
          ${data.intake_id},${data.semester_id},${data.programme_type_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `detailedReportsByFaculties.service.js`,
        `enrolledStudentsAllCampuses`,
        `GET`
      );
    }
  }

  // all faculties, all programme types and all campus

  static async enrolledStudentsAllCampusesProgrammeTypes(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.detailed_report_all_faculties_programme_types_campuses(${data.academic_year_id},
          ${data.intake_id},${data.semester_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `detailedReportsByFaculties.service.js`,
        `enrolledStudentsAllCampusesProgrammeTypes`,
        `GET`
      );
    }
  }

  /**
   *
   * by faculty
   *
   * by faculty,campus id,programme type id
   */
  static async enrolledStudentsByFaculty(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.enrollment_detailed_by_faculty_report(${data.campus_id},${data.academic_year_id},
          ${data.intake_id},${data.semester_id},${data.programme_type_id},${data.academic_unit_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `detailedReportsByFaculties.service.js`,
        `enrolledStudentsByFaculty`,
        `GET`
      );
    }
  }

  // all programme types by  campus

  static async enrolledStudentsByFacultyAllProgrammeTypes(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.enrollment_detailed_by_faculty_all_programme_types_function(${data.campus_id},${data.academic_year_id},
          ${data.intake_id},${data.semester_id},${data.academic_unit_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `detailedReportsByFaculties.service.js`,
        `enrolledStudentsByFacultyAllProgrammeTypes`,
        `GET`
      );
    }
  }

  //  all campus buy programme type

  static async enrolledStudentsByFacultyAllCampuses(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.enrollment_detailed_by_faculty_all_campuses_function(${data.academic_year_id},
          ${data.intake_id},${data.semester_id},${data.programme_type_id},${data.academic_unit_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `detailedReportsByFaculties.service.js`,
        `enrolledStudentsByFacultyAllCampuses`,
        `GET`
      );
    }
  }

  // all campus,programme types
  static async enrolledStudentsByFacultyAllCampusesProgrammeTypes(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.enrollment_detailed_by_faculty_programme_types_campuses_function(${data.academic_year_id},
          ${data.intake_id},${data.semester_id},${data.academic_unit_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `detailedReportsByFaculties.service.js`,
        `enrolledStudentsByFacultyAllCampusesProgrammeTypes`,
        `GET`
      );
    }
  }
}

module.exports = DetailedReportsByFacultyService;
