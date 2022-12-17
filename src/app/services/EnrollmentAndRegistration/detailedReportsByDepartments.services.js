const models = require('@models');
const { QueryTypes } = require('sequelize');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

class DetailedReportsByDepartmentsService {
  /*
   * all departments
   * by campus
   * by programme_type
   */
  static async enrolledStudents(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.detailed_report_all_departments(${data.campus_id},
            ${data.academic_year_id},${data.intake_id},${data.semester_id},${data.programme_type_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `detailedReportsByDepartments.service.js`,
        `enrolledStudents`,
        `GET`
      );
    }
  }

  //  all departments, all programme types, by campus

  static async enrolledStudentsAllProgrammeTypes(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.detailed_report_all_departments_programme_type(${data.campus_id},
            ${data.academic_year_id},${data.intake_id},${data.semester_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `detailedReportsByDepartments.service.js`,
        `enrolledStudentsAllProgrammeTypes`,
        `GET`
      );
    }
  }

  // all campus,all departments, by programme types

  static async enrolledStudentsAllCampuses(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.detailed_report_all_departments_campuses(${data.academic_year_id},
          ${data.intake_id},${data.semester_id},${data.programme_type_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `detailedReportsByDepartments.service.js`,
        `enrolledStudentsAllCampuses`,
        `GET`
      );
    }
  }

  // all departments, all programme types and all campus

  static async enrolledStudentsCampusesProgrammeTypes(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.enrollment_detailed_report(${data.academic_year_id},
          ${data.intake_id},${data.semester_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `detailedReportsByDepartments.service.js`,
        `enrolledStudentsCampusesProgrammeTypes`,
        `GET`
      );
    }
  }

  /**
   *
   * by department
   *
   * by department,campus id,programme type id
   */
  static async enrolledStudentsByDepartment(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.enrollment_detailed_by_department_report(${data.campus_id},${data.academic_year_id},
          ${data.intake_id},${data.semester_id},${data.programme_type_id},${data.academic_unit_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `detailedReportsByDepartments.service.js`,
        `enrolledStudentsByDepartment`,
        `GET`
      );
    }
  }

  // all programme types by  campus

  static async enrolledStudentsByDepartmentAllProgrammeTypes(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.enrollment_detailed_by_department_all_programme_types_function(${data.campus_id},${data.academic_year_id},
          ${data.intake_id},${data.semester_id},${data.academic_unit_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `detailedReportsByDepartments.service.js`,
        `enrolledStudentsByDepartmentAllProgrammeTypes`,
        `GET`
      );
    }
  }

  //  all campus buy programme type

  static async enrolledStudentsByDepartmentAllCampuses(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.enrollment_detailed_by_department_all_campuses_function(${data.academic_year_id},
          ${data.intake_id},${data.semester_id},${data.programme_type_id},${data.academic_unit_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `detailedReportsByDepartments.service.js`,
        `enrolledStudentsByDepartmentAllCampuses`,
        `GET`
      );
    }
  }

  // all campus,programme types
  static async enrolledStudentsByDepartmentAllCampusesProgrammeTypes(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.enrollment_detailed_by_department_programme_types_campuses_function(${data.academic_year_id},
          ${data.intake_id},${data.semester_id},${data.academic_unit_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `detailedReportsByDepartments.service.js`,
        `enrolledStudentsByDepartmentAllCampusesProgrammeTypes`,
        `GET`
      );
    }
  }
}

module.exports = DetailedReportsByDepartmentsService;
