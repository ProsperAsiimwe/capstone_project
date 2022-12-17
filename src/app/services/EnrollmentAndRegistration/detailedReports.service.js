const models = require('@models');
const { QueryTypes } = require('sequelize');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

class DetailedReportsService {
  /*
   * all colleges
   * by campus
   * by programme_type
   */
  static async numberOfEnrolledStudents(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.detailed_report_all_colleges(${data.campus_id},
            ${data.academic_year_id},${data.intake_id},${data.semester_id},${data.programme_type_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `detailedReports.service.js`,
        `numberOfEnrolledStudents`,
        `GET`
      );
    }
  }

  //  all colleges, all programme types, by campus

  static async numberOfEnrolledStudentsAllProgrammeTypes(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.detailed_report_all_colleges_programme_types(${data.campus_id},
            ${data.academic_year_id},${data.intake_id},${data.semester_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `detailedReports.service.js`,
        `numberOfEnrolledStudentsAllProgrammeTypes`,
        `GET`
      );
    }
  }

  // all campus,all colleges, by programme types

  static async numberOfEnrolledStudentsAllCampuses(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.detailed_report_all_colleges_campuses(${data.academic_year_id},
          ${data.intake_id},${data.semester_id},${data.programme_type_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `detailedReports.service.js`,
        `numberOfEnrolledStudentsAllCampuses`,
        `GET`
      );
    }
  }

  // all colleges, all programme types and all campus

  static async numberOfstudentEnrolledCampusesProgrammeTypes(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.detailed_report_colleges_programme_types_campus(${data.academic_year_id},
          ${data.intake_id},${data.semester_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `detailedReports.service.js`,
        `numberOfstudentEnrolledCampusesProgrammeTypes`,
        `GET`
      );
    }
  }

  /**
   *
   * by college
   *
   * by college,campus id,programme type id
   */
  static async enrolledStudentsByCollege(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.enrollment_detailed_by_college_report(${data.campus_id},${data.academic_year_id},
          ${data.intake_id},${data.semester_id},${data.programme_type_id},${data.academic_unit_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `detailedReports.service.js`,
        `enrolledStudentsByCollege`,
        `GET`
      );
    }
  }

  // all programme types by  campus

  static async enrolledStudentsByCollegeAllProgrammeTypes(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.enrollment_detailed_by_college_all_programme_types_function(${data.campus_id},${data.academic_year_id},
          ${data.intake_id},${data.semester_id},${data.academic_unit_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `detailedReports.service.js`,
        `enrolledStudentsByCollegeAllProgrammeTypes`,
        `GET`
      );
    }
  }

  //  all campus buy programme type

  static async enrolledStudentsByCollegeAllCampuses(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.enrollment_detailed_by_college_all_campuses__function(${data.academic_year_id},
          ${data.intake_id},${data.semester_id},${data.programme_type_id},${data.academic_unit_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `detailedReports.service.js`,
        `enrolledStudentsByCollegeAllCampuses`,
        `GET`
      );
    }
  }

  // all campus,programme types
  static async enrolledStudentsByCollegeAllCampusesProgrammeTypes(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.enrollment_detailed_by_college_programme_types_campuses_function(${data.academic_year_id},
          ${data.intake_id},${data.semester_id},${data.academic_unit_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `detailedReports.service.js`,
        `enrolledStudentsByCollegeAllCampusesProgrammeTypes`,
        `GET`
      );
    }
  }
}

module.exports = DetailedReportsService;
