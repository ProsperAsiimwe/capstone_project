const models = require('@models');
const { QueryTypes } = require('sequelize');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

class ReportsService {
  //  reports

  static async reportsFunction() {
    try {
      const filtered = await models.sequelize.query(
        `select * from universal_payments_mgt.universal_payment_report()`,
        {
          type: QueryTypes.SELECT,
          plain: true,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `reports.service.js`,
        `reportsFunction`,
        `GET`
      );
    }
  }

  // detailed report

  static async DetailedReportsFunction() {
    try {
      const filtered = await models.sequelize.query(
        `select * from universal_payments_mgt.uni_payment_detailed_report()`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `reports.service.js`,
        `DetailedReportsFunction`,
        `GET`
      );
    }
  }

  // student report universal_payments_mgt.student_transactions_report
  static async studentReportFunction() {
    try {
      const filtered = await models.sequelize.query(
        `select * from universal_payments_mgt.student_transactions_report`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `reports.service.js`,
        `studentReportFunction`,
        `GET`
      );
    }
  }

  // unipay_transactions_report
  static async uniPayReportFunction() {
    try {
      const filtered = await models.sequelize.query(
        `select * from universal_payments_mgt.unipay_transactions_report`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `reports.service.js`,
        `uniPayReportFunction`,
        `GET`
      );
    }
  }

  // applicant payment report
  static async applicantsReportFunction() {
    try {
      const filtered = await models.sequelize.query(
        `select * from universal_payments_mgt.admissions_payments_report`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `reports.service.js`,
        `applicantsReportFunction`,
        `GET`
      );
    }
  }

  // applicant payment report unipay
  static async bulkPaymentsReport() {
    try {
      const filtered = await models.sequelize.query(
        `select * from universal_payments_mgt.bulk_payment_report`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `reports.service.js`,
        `bulkPaymentsReport`,
        `GET`
      );
    }
  }
}

module.exports = ReportsService;
