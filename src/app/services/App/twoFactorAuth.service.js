const models = require('@models');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for a static Parameter Value
class TwoFactorAuthService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all Values or filtered using options param
   */
  static async findAllTwoFactorAuth(options) {
    try {
      const results = await models.TwoFactorAuth.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `twoFactorAuth.service.js`,
        `findAllTwoFactorAuths`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a Value object basing on the options
   */
  static async findOneTwoFactorAuth(options) {
    try {
      const result = await models.TwoFactorAuth.findOne({
        ...options,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `twoFactorAuth.service.js`,
        `findOneTwoFactorAuth`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single twoFactorAuth object from data object
   *@
   */
  static async createTwoFactorAuth(data, transaction) {
    try {
      const result = await models.TwoFactorAuth.create(data, {
        transaction,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `twoFactorAuth.service.js`,
        `createTwoFactorAuth`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data Data to update.
   * @param {string} username  username of OTPCode object to be updated
   * @returns {Promise}
   * @description updates a single OTPCode object
   *@
   */
  static async updateTwoFactorAuth(id, data, transaction) {
    try {
      const updated = await models.TwoFactorAuth.update(data, {
        where: { id },
        transaction,
        returning: true,
      });

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `twoFactorAuth.service.js`,
        `updateTwoFactorAuth`,
        `PUT`
      );
    }
  }
}

module.exports = TwoFactorAuthService;
