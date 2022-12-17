const models = require('@models');
const { QueryTypes } = require('sequelize');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling Fees copy
class FeesApprovalService {
  /**
   *
   * @param {*} fees
   * @param {*} Approval
   */

  static async tuitionFeesPendingApproval(data) {
    try {
      const filtered = await models.sequelize.query(
        `select *
        from fees_mgt.tuition_fees_approval(${data.campus_id},${data.academic_year_id},${data.intake_id},${data.programme_id})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `feesApproval.service.js`,
        `tuitionFeesPendingApproval`,
        `GET`
      );
    }
  }

  /**
   * functional
   */

  static async functionalFeesPendingApproval(data) {
    try {
      const filtered = await models.sequelize.query(
        `select *
        from fees_mgt.functional_fees_approval(${data.academic_year_id},${data.campus_id},${data.intake_id})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `feesApproval.service.js`,
        `functionalFeesPendingApproval`,
        `GET`
      );
    }
  }
  /**
   *
   * other fees
   */

  static async otherFeesPendingApproval(data) {
    try {
      const filtered = await models.sequelize.query(
        `select *
        from fees_mgt.other_fees_approval(${data.academic_year_id},${data.campus_id},${data.intake_id})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `feesApproval.service.js`,
        `otherFeesPendingApproval`,
        `GET`
      );
    }
  }
  /**
   * fees copy
   */

  static async feesCopyPendingApproval(data) {
    try {
      const filtered = await models.sequelize.query(
        `select *
        from fees_mgt.fees_copy_pending_approval(${data.academic_year_id},${data.campus_id})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `feesApproval.service.js`,
        `feesCopyPendingApproval`,
        `GET`
      );
    }
  }
  /**
   * fees waivers
   */

  static async feesWaiversPendingApproval(data) {
    try {
      const filtered = await models.sequelize.query(
        `select *
        from fees_mgt.fees_waiver_approval(${data.academic_year_id},${data.campus_id},${data.intake_id})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `feesApproval.service.js`,
        `feesWaiversPendingApproval`,
        `GET`
      );
    }
  }
}

module.exports = FeesApprovalService;
