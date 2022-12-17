const models = require('@models');
const { QueryTypes } = require('sequelize');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

class EnrollmentRegistrationReportsDepartmentService {
  /**
   *
   * @param {enrollment and registration service } id
   * @param {*} data
   * by department and campus id and programme type id
   */

  static async enrolledStudentsByDepartment(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.enrollment_summary_by_department_function(${data.campus_id},'${data.academicYear}',
          ${data.intake_id},'${data.semester}',${data.programme_type_id},${data.academic_unit_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `summaryReportsByDepartment.service.js`,
        `enrolledStudentsByDepartment`,
        `GET`
      );
    }
  }

  static async registeredStudentsByDepartment(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.registration_summary_by_department_function(${data.campus_id},${data.academic_year_id},
            ${data.intake_id},${data.semester_id},${data.programme_type_id},${data.academic_unit_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `summaryReportsByDepartment.service.js`,
        `registeredStudentsByDepartment`,
        `GET`
      );
    }
  }

  //  by department and all programme types

  static async enrolledStudentsByDepartmentAllProgrammeTypes(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.enrollment_summary_by_department_all_programme_types_function(${data.campus_id},'${data.academicYear}',
          ${data.intake_id},'${data.semester}',${data.academic_unit_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `summaryReportsByDepartment.service.js`,
        `enrolledStudentsByDepartmentAllProgrammeTypes`,
        `GET`
      );
    }
  }

  static async registeredStudentsByDepartmentAllProgrammeTypes(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.registration_summary_by_department_all_programme_types_function(${data.campus_id},${data.academic_year_id},
          ${data.intake_id},${data.semester_id},${data.academic_unit_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `summaryReportsByDepartment.service.js`,
        `registeredStudentsByDepartmentAllProgrammeTypes`,
        `GET`
      );
    }
  }

  //  all campus and all department

  static async enrolledStudentsByDepartmentAllCampuses(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.enrollment_summary_by_department_all_campuses_function('${data.academicYear}',
          ${data.intake_id},'${data.semester}',${data.programme_type_id},${data.academic_unit_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `summaryReportsByDepartment.service.js`,
        `enrolledStudentsByDepartmentAllCampuses`,
        `GET`
      );
    }
  }

  static async registeredByDepartmentAllCampuses(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.registration_summary_by_department_all_campuses_function(${data.academic_year_id},
            ${data.intake_id},${data.semester_id},${data.programme_type_id},${data.academic_unit_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `summaryReportsByDepartment.service.js`,
        `registeredByDepartmentAllCampuses`,
        `GET`
      );
    }
  }

  // all campus and all department

  static async enrolledStudentsByDepartment(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.enrollment_summary_by_department_campuses_programme_types_function('${data.academicYear}',
          ${data.intake_id},'${data.semester}',${data.academic_unit_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `summaryReportsByDepartment.service.js`,
        `enrolledStudentsByDepartment`,
        `GET`
      );
    }
  }

  /**
   *
   *  all campuses and all department
   * number of students registered
   */
  static async registeredStudentsByDepartment(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.registration_summary_by_department_campuses_programme_types_function(${data.academic_year_id},
            ${data.intake_id},${data.semester_id},${data.academic_unit_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `summaryReportsByDepartment.service.js`,
        `registeredStudentsByDepartment`,
        `GET`
      );
    }
  }
}

module.exports = EnrollmentRegistrationReportsDepartmentService;
