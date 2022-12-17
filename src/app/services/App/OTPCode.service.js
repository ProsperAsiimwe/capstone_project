const models = require('@models');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for a OTPCode
class OTPCodeService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all faculties or filtered using options param
   */
  static async findAllOTPCode(options) {
    try {
      const results = await models.OTPCode.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `OTPCode.service.js`,
        `findAllOTPCode`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single OTPCode object basing on the options
   */
  static async getOTPCode(options) {
    try {
      const OTPCode = await models.OTPCode.findOne({
        ...options,
      });

      return OTPCode;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `OTPCode.service.js`,
        `getOTPCode`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single OTPCode object from data object
   *@
   */
  static async createOTPCode(data, transaction) {
    try {
      const newOTPCode = await models.OTPCode.create(data, {
        transaction,
      });

      return newOTPCode;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `OTPCode.service.js`,
        `createOTPCode`,
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
  static async updateOTPCode(username, data, transaction) {
    try {
      const updated = await models.OTPCode.update(data, {
        where: { username },
        transaction,
        returning: true,
      });

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `OTPCode.service.js`,
        `updateOTPCode`,
        `PUT`
      );
    }
  }

  /**
   * @param {string} id  id of OTPCode object to be deleted
   * @returns {Promise}
   * @description deletes a single OTPCode object
   *@
   */
  static async deleteOTPCode(id) {
    try {
      const deleted = await models.OTPCode.destroy({
        where: { id },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `OTPCode.service.js`,
        `deleteOTPCode`,
        `DELETE`
      );
    }
  }
}

module.exports = OTPCodeService;
