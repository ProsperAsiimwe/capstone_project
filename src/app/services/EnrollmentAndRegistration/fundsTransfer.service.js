const models = require('@models');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for a result
class FundsTransferService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all faculties or filtered using options param
   */
  static async findAllFundsTransfers(options) {
    try {
      const result = await models.FundsTransfer.findAll({
        ...options,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `fundsTransfer.service.js`,
        `findAllFundsTransfers`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single object basing on the options
   */
  static async findOneFundsTransfer(options) {
    try {
      const result = await models.FundsTransfer.findOne({
        ...options,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `fundsTransfer.service.js`,
        `findOneFundsTransfer`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single result object from data object
   *@
   */
  static async createFundsTransfer(data, transaction) {
    try {
      const result = await models.FundsTransfer.create(data, {
        transaction,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `fundsTransfer.service.js`,
        `createFundsTransfer`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of result object to be updated
   * @returns {Promise}
   * @description updates a single result object
   *@
   */
  static async updateFundsTransfer(id, data) {
    try {
      const updated = await models.FundsTransfer.update(
        { ...data },
        { where: { id }, returning: true }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `fundsTransfer.service.js`,
        `updateFundsTransfer`,
        `PUT`
      );
    }
  }

  /**
   * @param {string} id  id of result object to be deleted
   * @returns {Promise}
   * @description deletes a single result object
   *@
   */
  static async deleteFundsTransfer(id) {
    try {
      const deleted = await models.FundsTransfer.destroy({
        where: { id },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `fundsTransfer.service.js`,
        `deleteFundsTransfer`,
        `DELETE`
      );
    }
  }
}

module.exports = FundsTransferService;
