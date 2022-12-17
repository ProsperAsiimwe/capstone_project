const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

const models = require('@models');
const { QueryTypes } = require('sequelize');

class BiReportService {
  static async monthlyCollections(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from universal_payments_mgt.monthly_collections()`,
        {
          type: QueryTypes.SELECT,
          plain: true,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `reportsUniPay.service.js`,
        `dailyReport`,
        `GET`
      );
    }
  }
}

module.exports = BiReportService;
