const models = require('@models');
const { QueryTypes } = require('sequelize');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

class PaymentReportsByFacultyService {
  /**
   *
   * @param {*} data
   * @returns
   */
  static async paymentReportByFaculty(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.payment_transactions_summary_by_faculty(${data.campus_id},${data.academic_year_id},
          ${data.intake_id},${data.semester_id},${data.programme_type_id},${data.academic_unit_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentReportsByFaculty.service.js`,
        `paymentReportByFaculty`,
        `GET`
      );
    }
  }

  // manual
  static async paymentReportManualByFaculty(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.payment_summary_manual_by_faculty(${data.campus_id},${data.academic_year_id},
          ${data.intake_id},${data.semester_id},${data.programme_type_id},${data.academic_unit_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentReportsByFaculty.service.js`,
        `paymentReportManualByFaculty`,
        `GET`
      );
    }
  }

  /**
   * by faculty
   * all programme type id
   */
  static async paymentReportByFacultyAllProgrammeTypes(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.payment_programme_types_by_faculty(${data.campus_id},${data.academic_year_id},
          ${data.intake_id},${data.semester_id},${data.academic_unit_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentReportsByFaculty.service.js`,
        `paymentReportByFacultyAllProgrammeTypes`,
        `GET`
      );
    }
  }

  // manual
  static async paymentReportManualByFacultyAllProgrammeTypes(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.payment_manual_programme_types_by_faculty(${data.campus_id},${data.academic_year_id},
          ${data.intake_id},${data.semester_id},${data.academic_unit_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentReportsByFaculty.service.js`,
        `paymentReportManualByFacultyAllProgrammeTypes`,
        `GET`
      );
    }
  }

  /**
   * by faculty
   *  all campus
   */
  static async paymentReportByFacultyAllCampuses(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.payment_transactions_campuses_by_faculty(${data.academic_year_id},
          ${data.intake_id},${data.semester_id},${data.programme_type_id},${data.academic_unit_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentReportsByFaculty.service.js`,
        `paymentReportByFacultyAllCampuses`,
        `GET`
      );
    }
  }

  // manual
  static async paymentReportManualByFacultyAllCampuses(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.payment_transactions_manual_campuses_by_faculty(${data.academic_year_id},
          ${data.intake_id},${data.semester_id},${data.programme_type_id},${data.academic_unit_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentReportsByFaculty.service.js`,
        `paymentReportManualByFacultyAllCampuses`,
        `GET`
      );
    }
  }

  /**
   * by faculty
   * all  campuses,programme types
   */
  static async paymentReportByFacultyAllCampusesProgrmmeTypes(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.payment_transactions_programme_type_campuses_by_faculty(${data.academic_year_id},
          ${data.intake_id},${data.semester_id},${data.academic_unit_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentReportsByFaculty.service.js`,
        `paymentReportByFacultyAllCampusesProgrmmeTypes`,
        `GET`
      );
    }
  }

  // manual
  static async paymentReportManualByFacultyAllCampusesProgrammeTypes(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.payment_manual_programme_types_campuses_by_faculty(${data.academic_year_id},
          ${data.intake_id},${data.semester_id},${data.academic_unit_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentReportsByFaculty.service.js`,
        `paymentReportManualByFacultyAllCampusesProgrammeTypes`,
        `GET`
      );
    }
  }

  /**
   * all faculty
   * by campus, programme id
   *
   */
  static async paymentReportAllFaculty(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.payment_transactions_all_faculties(${data.campus_id},${data.academic_year_id},
          ${data.intake_id},${data.semester_id},${data.programme_type_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentReportsByFaculty.service.js`,
        `paymentReportAllFaculty`,
        `GET`
      );
    }
  }

  // manual
  static async paymentReportManualAllFaculty(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.payment_transactions_manual_all_faculties(${data.campus_id},${data.academic_year_id},
          ${data.intake_id},${data.semester_id},${data.programme_type_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentReportsByFaculty.service.js`,
        `paymentReportManualAllFaculty`,
        `GET`
      );
    }
  }

  /**
   * all faculties
   *  by programme types
   *
   */
  static async paymentReportAllFacultyProgrammeType(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.payment_programme_types_all_faculties(${data.campus_id},${data.academic_year_id},
          ${data.intake_id},${data.semester_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentReportsByFaculty.service.js`,
        `paymentReportAllFacultyProgrammeType`,
        `GET`
      );
    }
  }

  // manual
  static async paymentReportManualAllFacultyProgrammeTypes(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.payment_manual_programme_types_all_faculties(${data.campus_id},${data.academic_year_id},
          ${data.intake_id},${data.semester_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentReportsByFaculty.service.js`,
        `paymentReportManualAllFacultyProgrammeTypes`,
        `GET`
      );
    }
  }

  /**
   * all faculty
   *  all campuses
   */
  static async paymentReportAllFacultyCampuses(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.payment_campuses_all_faculties(${data.academic_year_id},
          ${data.intake_id},${data.semester_id},${data.programme_type_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentReportsByFaculty.service.js`,
        `paymentReportAllFacultyCampuses`,
        `GET`
      );
    }
  }

  // manual campuses
  static async paymentReportManualAllFacultyCampus(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.payment_manual_campuses_all_faculties(${data.academic_year_id},
          ${data.intake_id},${data.semester_id},${data.programme_type_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentReportsByFaculty.service.js`,
        `paymentReportManualAllFacultyCampus`,
        `GET`
      );
    }
  }

  /**
   * all faculty
   *  all campuses, programme types
   */
  static async paymentReportAllFacultyProgrammmeTypesCampuses(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.payment_campuses_programme_types_all_faculties(${data.academic_year_id},
          ${data.intake_id},${data.semester_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentReportsByFaculty.service.js`,
        `paymentReportAllFacultyProgrammmeTypesCampuses`,
        `GET`
      );
    }
  }

  // manual
  static async manualReportAllFacultyProgrammeTypesCampus(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.payment_manual_campuses_programme_types_all_faculties(${data.academic_year_id},
          ${data.intake_id},${data.semester_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentReportsByFaculty.service.js`,
        `manualReportAllFacultyProgrammeTypesCampus`,
        `GET`
      );
    }
  }
}

module.exports = PaymentReportsByFacultyService;
