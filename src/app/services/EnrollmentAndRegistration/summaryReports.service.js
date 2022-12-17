const models = require('@models');
const { QueryTypes } = require('sequelize');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

class SummaryReportsService {
  /**
   *
   * @param {enrollment and registration service } id
   * @param {*} data
   *
   * students expected to enroll and register
   */

  static async numberOfEnrolledStudents(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.enrollment_registration_summary_all_colleges_function(${data.campus_id},
           '${data.academicYear}',${data.intake_id},'${data.semester}',${data.programme_type_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `summaryReports.service.js`,
        `numberOfEnrolledStudents`,
        `GET`
      );
    }
  }

  static async numberOfStudentsRegistered(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.registration_summary_all_colleges_function(${data.campus_id},
            ${data.academic_year_id},
            ${data.intake_id},${data.semester_id},${data.programme_type_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `summaryReports.service.js`,
        `numberOfStudentsRegistered`,
        `GET`
      );
    }
  }

  // all programme_types and all colleges

  static async enrolledStudentsAllProgrammeTypes(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.enrollment_summary_all_programme_type_function(${data.campus_id},
           '${data.academicYear}',${data.intake_id},'${data.semester}')`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `summaryReports.service.js`,
        `enrolledStudentsAllProgrammeTypes`,
        `GET`
      );
    }
  }

  static async registeredStudentsAllProgrammeTypes(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.registration_summary_all_programme_type_function(${data.campus_id},
            ${data.academic_year_id},
            ${data.intake_id},${data.semester_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `summaryReports.service.js`,
        `registeredStudentsAllProgrammeTypes`,
        `GET`
      );
    }
  }

  // all campus and all colleges

  static async enrolledStudentsAllCampuses(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.enrollment_summary_all_campuses_function('${data.academicYear}',
          ${data.intake_id},'${data.semester}',${data.programme_type_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `summaryReports.service.js`,
        `enrolledStudentsAllCampuses`,
        `GET`
      );
    }
  }

  static async registeredStudentsAllCampuses(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.registration_summary_all_campuses_function(${data.academic_year_id},
            ${data.intake_id},${data.semester_id},${data.programme_type_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `summaryReports.service.js`,
        `registeredStudentsAllCampuses`,
        `GET`
      );
    }
  }

  //  all campus , all colleges and all programme types

  static async enrolledStudentsAllCampusesProgrammeTypes(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.enrollment_summary_all_campuses_programme_types_function('${data.academicYear}',
          ${data.intake_id},'${data.semester}')`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `summaryReports.service.js`,
        `enrolledStudentsAllCampusesProgrammeTypes`,
        `GET`
      );
    }
  }

  static async registeredStudentsAllCampusesProgrammeTypes(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.registration_summary_all_campuses_programme_types_function(${data.academic_year_id},
            ${data.intake_id},${data.semester_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `summaryReports.service.js`,
        `registeredStudentsAllCampusesProgrammeTypes`,
        `GET`
      );
    }
  }

  /**
   * by college and campus id and programme type id
   *
   * number of enrolled students
   */
  static async enrolledStudentsByCollege(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.enrollment_summary_by_college__function(${data.campus_id},'${data.academicYear}',
          ${data.intake_id},'${data.semester}',${data.programme_type_id},${data.academic_unit_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `summaryReports.service.js`,
        `enrolledStudentsByCollege`,
        `GET`
      );
    }
  }

  static async registeredStudentsByCollegeType(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.registration_summary_by_college_function(${data.campus_id},${data.academic_year_id},
            ${data.intake_id},${data.semester_id},${data.programme_type_id},${data.academic_unit_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `summaryReports.service.js`,
        `registeredStudentsByCollegeType`,
        `GET`
      );
    }
  }

  //  all colleges and by programme type

  static async enrolledStudentsByCollegeProgrammeTypes(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.enrollment_summary_by_college_all_programme_types_function(${data.campus_id},'${data.academicYear}',
          ${data.intake_id},'${data.semester}',${data.academic_unit_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `summaryReports.service.js`,
        `enrolledStudentsByCollegeProgrammeTypes`,
        `GET`
      );
    }
  }

  static async registeredStudentsByCollegeProgrammeTypes(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.registration_summary_by_college_all_programme_types_function(${data.campus_id},${data.academic_year_id},
          ${data.intake_id},${data.semester_id},${data.academic_unit_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `summaryReports.service.js`,
        `registeredStudentsByCollegeProgrammeTypes`,
        `GET`
      );
    }
  }

  //  all campuses and all colleges and by

  static async enrolledStudentsByCollegeAllCampuses(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.enrollment_summary_by_college_all_campuses_function('${data.academicYear}',
          ${data.intake_id},'${data.semester}',${data.programme_type_id},${data.academic_unit_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `summaryReports.service.js`,
        `enrolledStudentsByCollegeAllCampuses`,
        `GET`
      );
    }
  }

  static async registeredStudentsByCollegeAllCampuses(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.registration_summary_by_college_all_campuses_function(${data.academic_year_id},
            ${data.intake_id},${data.semester_id},${data.programme_type_id},${data.academic_unit_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `summaryReports.service.js`,
        `registeredStudentsByCollegeAllCampuses`,
        `GET`
      );
    }
  }

  // all campus and  all programme types

  static async studentsEnrolledByCollege(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.enrollment_summary_by_college_campuses_programme_types_function('${data.academicYear}',
          ${data.intake_id},'${data.semester}',${data.academic_unit_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `summaryReports.service.js`,
        `studentsEnrolledByCollege`,
        `GET`
      );
    }
  }

  static async registeredStudentsByCollege(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.registration_summary_by_college_campuses_programme_types_function(${data.academic_year_id},
            ${data.intake_id},${data.semester_id},${data.academic_unit_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `summaryReports.service.js`,
        `registeredStudentsByCollege`,
        `GET`
      );
    }
  }
}

module.exports = SummaryReportsService;
