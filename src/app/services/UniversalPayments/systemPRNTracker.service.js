const models = require('@models');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for this entity
class SystemPRNTrackerService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all records or filtered using options param
   */
  static async findAllSystemPRNTrackers(options) {
    try {
      const records = await models.SystemPrnTracker.findAll({
        ...options,
      });

      return records;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `systemPRNTracker.service.js`,
        `findAllSystemPRNTrackers`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single record object basing on the options
   */
  static async findOneSystemPRNTracker(options) {
    try {
      const record = await models.SystemPrnTracker.findOne({
        ...options,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `systemPRNTracker.service.js`,
        `findOneSystemPRNTracker`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of record object to be updated
   * @returns {Promise}
   * @description updates a single record object
   *@
   */
  static async updateSystemPRNTracker(id, data, transaction) {
    try {
      const record = await models.SystemPrnTracker.update(
        { ...data },
        { where: { id }, transaction, returning: true }
      );

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `systemPRNTracker.service.js`,
        `updateSystemPRNTracker`,
        `PUT`
      );
    }
  }

  /**
   * @param {string} id  id of record object to be deleted
   * @returns {Promise}
   * @description deletes a single record object
   *@
   */
  static async deleteSystemPRNTracker(id, transaction) {
    try {
      const deleted = await models.SystemPrnTracker.destroy({
        where: { id },
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `systemPRNTracker.service.js`,
        `deleteSystemPRNTracker`,
        `DELETE`
      );
    }
  }
}

module.exports = SystemPRNTrackerService;
