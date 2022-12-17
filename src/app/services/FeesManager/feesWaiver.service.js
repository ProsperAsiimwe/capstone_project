const models = require('@models');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for a feesWaiver
class FeesWaiverService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all faculties or filtered using options param
   */
  static async findAllFeesWaivers(options) {
    try {
      const results = await models.FeesWaiver.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `feesWaiver.service.js`,
        `findAllFeesWaivers`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single feesWaiver object basing on the options
   */
  static async findOneFeesWaiver(options) {
    try {
      const feesWaiver = await models.FeesWaiver.findOne({
        ...options,
      });

      return feesWaiver;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `feesWaiver.service.js`,
        `findOneFeesWaiver`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single feesWaiver object from data object
   *@
   */
  static async createFeesWaiver(data) {
    try {
      const newFeesWaiver = await models.FeesWaiver.create({
        ...data,
      });

      return newFeesWaiver;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `feesWaiver.service.js`,
        `createFeesWaiver`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of feesWaiver object to be updated
   * @returns {Promise}
   * @description updates a single feesWaiver object
   *@
   */
  static async updateFeesWaiver(id, data) {
    try {
      const updated = await models.FeesWaiver.update(
        { ...data },
        { where: { id }, returning: true }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `feesWaiver.service.js`,
        `updateFeesWaiver`,
        `PUT`
      );
    }
  }

  /**
   * @param {string} id  id of feesWaiver object to be deleted
   * @returns {Promise}
   * @description deletes a single feesWaiver object
   *@
   */
  static async deleteFeesWaiver(id) {
    try {
      const deleted = await models.FeesWaiver.destroy({
        where: { id },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `feesWaiver.service.js`,
        `deleteFeesWaiver`,
        `DELETE`
      );
    }
  }
}

module.exports = FeesWaiverService;
