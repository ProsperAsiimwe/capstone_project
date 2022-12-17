const models = require('@models');
const { QueryTypes } = require('sequelize');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

class PaymentReportsService {
  /** a
   * by college, campus id,programme type id
   */
  static async paymentReportByCollege(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.payment_transactions_summary_by_college_function(${data.campus_id},${data.academic_year_id},
          ${data.intake_id},${data.semester_id},${data.programme_type_id},${data.academic_unit_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentReports.service.js`,
        `paymentReportByCollege`,
        `GET`
      );
    }
  }

  // manual
  static async paymentReportManualByCollege(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.payment_transactions_summary_manual_by_college_function(${data.campus_id},${data.academic_year_id},
          ${data.intake_id},${data.semester_id},${data.programme_type_id},${data.academic_unit_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentReports.service.js`,
        `paymentReportManualByCollege`,
        `GET`
      );
    }
  }

  /**
   * by college, all programme type
   */
  static async paymentReportByCollegeAllProgrammeTypes(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.payment_transactions_summary_college_all_programme_type(${data.campus_id},${data.academic_year_id},
          ${data.intake_id},${data.semester_id},${data.academic_unit_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentReports.service.js`,
        `paymentReportByCollegeAllProgrammeTypes`,
        `GET`
      );
    }
  }

  // manual
  static async paymentReportManualByCollegeAllProgrammeTypes(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.payment_transactions_summary_manual_college_all_programme_type(${data.campus_id},${data.academic_year_id},
          ${data.intake_id},${data.semester_id},${data.academic_unit_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentReports.service.js`,
        `paymentReportManualByCollegeAllProgrammeTypes`,
        `GET`
      );
    }
  }

  /**
   * by college and all campus
   */
  static async paymentReportByCollegeCampuses(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.payment_transactions_summary_college_all_campuses(${data.academic_year_id},
          ${data.intake_id},${data.semester_id},${data.programme_type_id},${data.academic_unit_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentReports.service.js`,
        `paymentReportByCollegeCampuses`,
        `GET`
      );
    }
  }

  // manual
  static async paymentReportManualByCollegeCampuses(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.payment_transactions_summary_manual_college_all_campuses(${data.academic_year_id},
          ${data.intake_id},${data.semester_id},${data.programme_type_id},${data.academic_unit_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentReports.service.js`,
        `paymentReportManualByCollegeCampuses`,
        `GET`
      );
    }
  }

  /**
   * by college all  campuses, programme types
   */
  static async reportByCollegeAllCampusesProgrammeTypes(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.payment_transactions_summary_college_all_campuses_programme_types(${data.academic_year_id},
          ${data.intake_id},${data.semester_id},${data.academic_unit_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentReports.service.js`,
        `reportByCollegeAllCampusesProgrammeTypes`,
        `GET`
      );
    }
  }

  // manual
  static async reportManualByCollegeAllCampusesProgrammeTypes(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.payment_transactions_summary_manual_college_all_campuses_programme_types(${data.academic_year_id},
          ${data.intake_id},${data.semester_id},${data.academic_unit_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentReports.service.js`,
        `reportManualByCollegeAllCampusesProgrammeTypes`,
        `GET`
      );
    }
  }

  /**
   * all college
   */
  static async paymentReportAllCollege(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.payment_transactions_summary_all_colleges_function(${data.campus_id},${data.academic_year_id},
          ${data.intake_id},${data.semester_id},${data.programme_type_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentReports.service.js`,
        `paymentReportAllCollege`,
        `GET`
      );
    }
  }

  // manual
  static async manualReportAllCollege(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.payment_transactions_summary_manual_all_colleges_function(${data.campus_id},${data.academic_year_id},
          ${data.intake_id},${data.semester_id},${data.programme_type_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentReports.service.js`,
        `manualReportAllCollege`,
        `GET`
      );
    }
  }

  /**
   * all colleges, programme types
   */
  static async reportAllCollegeProgrammeTypes(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.payment_transactions_summary_all_colleges_programme_types_function(${data.campus_id},${data.academic_year_id},
          ${data.intake_id},${data.semester_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentReports.service.js`,
        `reportAllCollegeProgrammeTypes`,
        `GET`
      );
    }
  }

  // manual
  static async manualReportAllCollegeProgrammeTypes(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.payment_transactions_summary_manual_all_colleges_programme_types_function(${data.campus_id},${data.academic_year_id},
          ${data.intake_id},${data.semester_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentReports.service.js`,
        `manualReportAllCollegeProgrammeTypes`,
        `GET`
      );
    }
  }

  /**
   * all college , campuses
   */
  static async reportAllCollegeCampuses(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.payment_transactions_summary_all_colleges_campuses_function(${data.academic_year_id},
          ${data.intake_id},${data.semester_id},${data.programme_type_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentReports.service.js`,
        `reportAllCollegeCampuses`,
        `GET`
      );
    }
  }

  // manual
  static async manualReportAllCollegeCampus(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.payment_transactions_summary_manual_all_colleges_campuses_function(${data.academic_year_id},
          ${data.intake_id},${data.semester_id},${data.programme_type_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentReports.service.js`,
        `manualReportAllCollegeCampus`,
        `GET`
      );
    }
  }

  /**
   * all college, campuses,
   * programme types
   */
  static async reportaAllCollegeProgrammmeTypesCampuses(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.payment_transactions_summary_all_colleges_campuses_programme_types_function(${data.academic_year_id},
          ${data.intake_id},${data.semester_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentReports.service.js`,
        `reportaAllCollegeProgrammmeTypesCampuses`,
        `GET`
      );
    }
  }

  // manual
  static async manualReportAllCollegeProgrammeTypesCampus(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.payment_transactions_summary_manual_all_colleges_campuses_programme_types_function(${data.academic_year_id},
          ${data.intake_id},${data.semester_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentReports.service.js`,
        `reportaAllCollegeProgrammmeTypesCampuses`,
        `GET`
      );
    }
  }
}

module.exports = PaymentReportsService;
