const models = require('@models');
const { QueryTypes } = require('sequelize');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

class PaymentReportsByDepartmentService {
  /**
   *
   * @param {*} data
   * @returns
   */
  static async paymentReportByDepartment(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.payment_transactions_by_department(${data.campus_id},${data.academic_year_id},
          ${data.intake_id},${data.semester_id},${data.programme_type_id},${data.academic_unit_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentReportsByDepartments.service.js`,
        `paymentReportByDepartment`,
        `GET`
      );
    }
  }

  // manual
  static async paymentReportManualByDepartment(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.payment_transactions_manual_by_department(${data.campus_id},${data.academic_year_id},
          ${data.intake_id},${data.semester_id},${data.programme_type_id},${data.academic_unit_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentReportsByDepartments.service.js`,
        `paymentReportManualByDepartment`,
        `GET`
      );
    }
  }

  /**
   * by department
   * all programme type id
   */
  static async paymentReportByDepartmentAllProgrammeTypes(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.payment_transactions_by_department_programme_type(${data.campus_id},${data.academic_year_id},
          ${data.intake_id},${data.semester_id},${data.academic_unit_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentReportsByDepartments.service.js`,
        `paymentReportByDepartmentAllProgrammeTypes`,
        `GET`
      );
    }
  }

  // manual
  static async paymentReportManualByDepartmentAllProgrammeTypes(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.payments_manual_by_department_programme_type(${data.campus_id},${data.academic_year_id},
          ${data.intake_id},${data.semester_id},${data.academic_unit_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentReportsByDepartments.service.js`,
        `paymentReportManualByDepartmentAllProgrammeTypes`,
        `GET`
      );
    }
  }

  /**
   * by department
   *  all campus
   */
  static async paymentReportByDepartmentAllCampuses(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.payment_transactions_by_department_campuses(${data.academic_year_id},
          ${data.intake_id},${data.semester_id},${data.programme_type_id},${data.academic_unit_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentReportsByDepartments.service.js`,
        `paymentReportByDepartmentAllCampuses`,
        `GET`
      );
    }
  }

  // manual
  static async paymentReportManualByDepartmentAllCampuses(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.payment_manual_by_department_campuses(${data.academic_year_id},
          ${data.intake_id},${data.semester_id},${data.programme_type_id},${data.academic_unit_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentReportsByDepartments.service.js`,
        `paymentReportManualByDepartmentAllCampuses`,
        `GET`
      );
    }
  }

  /**
   * by department
   * all  campuses,programme types
   */
  static async paymentReportByDepartmentAllCampusesProgrmmeTypes(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.payment_by_department_programme_types_campuses(${data.academic_year_id},
          ${data.intake_id},${data.semester_id},${data.academic_unit_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentReportsByDepartments.service.js`,
        `paymentReportByDepartmentAllCampusesProgrmmeTypes`,
        `GET`
      );
    }
  }

  // manual
  static async paymentReportManualByDepartmentAllCampusesProgrammeTypes(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.payment_manual_department_programme_types_campuses(${data.academic_year_id},
          ${data.intake_id},${data.semester_id},${data.academic_unit_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentReportsByDepartments.service.js`,
        `paymentReportManualByDepartmentAllCampusesProgrammeTypes`,
        `GET`
      );
    }
  }

  /**
   * all department
   * by campus, programme id
   *
   */
  static async paymentReportAllDepartment(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.payment_transactions_all_department(${data.campus_id},${data.academic_year_id},
          ${data.intake_id},${data.semester_id},${data.programme_type_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentReportsByDepartments.service.js`,
        `paymentReportAllDepartment`,
        `GET`
      );
    }
  }

  // manual
  static async paymentReportManualAllDepartment(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.payment_manual_all_department(${data.campus_id},${data.academic_year_id},
          ${data.intake_id},${data.semester_id},${data.programme_type_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentReportsByDepartments.service.js`,
        `paymentReportManualAllDepartment`,
        `GET`
      );
    }
  }

  /**
   * all departments
   *  by programme types
   * payment_all_department_programme_type
   *
   */
  static async paymentReportAllDepartmentProgrammeType(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.payment_all_department_programme_type(${data.campus_id},${data.academic_year_id},
          ${data.intake_id},${data.semester_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentReportsByDepartments.service.js`,
        `paymentReportAllDepartmentProgrammeType`,
        `GET`
      );
    }
  }

  // manual
  static async paymentReportManualAllDepartmentProgrammeTypes(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.payment_manual_all_department_programme_type(${data.campus_id},${data.academic_year_id},
          ${data.intake_id},${data.semester_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentReportsByDepartments.service.js`,
        `paymentReportManualAllDepartmentProgrammeTypes`,
        `GET`
      );
    }
  }

  /**
   * all department
   *  all campuses
   */
  static async paymentReportAllDepartmentCampuses(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.payment_all_department_campuses(${data.academic_year_id},
          ${data.intake_id},${data.semester_id},${data.programme_type_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentReportsByDepartments.service.js`,
        `paymentReportAllDepartmentCampuses`,
        `GET`
      );
    }
  }

  // manual campuses
  static async paymentReportManualAllDepartmentCampus(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.payment_manual_all_department_campuses(${data.academic_year_id},
          ${data.intake_id},${data.semester_id},${data.programme_type_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentReportsByDepartments.service.js`,
        `paymentReportManualAllDepartmentCampus`,
        `GET`
      );
    }
  }

  /**
   * all department
   *  all campuses, programme types
   */
  static async paymentReportAllDepartmentProgrammmeTypesCampuses(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.payment_all_department_programme_type_campuses(${data.academic_year_id},
          ${data.intake_id},${data.semester_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentReportsByDepartments.service.js`,
        `paymentReportAllDepartmentProgrammmeTypesCampuses`,
        `GET`
      );
    }
  }

  // manual
  static async manualReportAllDepartmentProgrammeTypesCampus(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.payment_manual_all_department_programme_type_campuses(${data.academic_year_id},
          ${data.intake_id},${data.semester_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentReportsByDepartments.service.js`,
        `manualReportAllDepartmentProgrammeTypesCampus`,
        `GET`
      );
    }
  }
}

module.exports = PaymentReportsByDepartmentService;
