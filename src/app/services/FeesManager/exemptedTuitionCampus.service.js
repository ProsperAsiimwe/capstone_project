const models = require('@models');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for a result
class ExemptedTuitionCampusService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all faculties or filtered using options param
   */
  static async findAllExemptedTuitionCampuses(options) {
    try {
      const result = await models.ExemptedTuitionCampus.findAll({
        ...options,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `exemptedTuitionCampus.service.js`,
        `findAllExemptedTuitionCampuses`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single object basing on the options
   */
  static async findOneExemptedTuitionCampus(options) {
    try {
      const result = await models.ExemptedTuitionCampus.findOne({
        ...options,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `exemptedTuitionCampus.service.js`,
        `findOneExemptedTuitionCampus`,
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
  static async createExemptedTuitionCampus(data, transaction) {
    try {
      const result = await models.ExemptedTuitionCampus.findOrCreate({
        where: {
          campus_id: data.campus_id,
        },
        defaults: {
          ...data,
        },
        transaction,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `exemptedTuitionCampus.service.js`,
        `createExemptedTuitionCampus`,
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
  static async updateExemptedTuitionCampus(id, data) {
    try {
      const updated = await models.ExemptedTuitionCampus.update(
        { ...data },
        { where: { id }, returning: true }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `exemptedTuitionCampus.service.js`,
        `updateExemptedTuitionCampus`,
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
  static async deleteExemptedTuitionCampus(id) {
    try {
      const deleted = await models.ExemptedTuitionCampus.destroy({
        where: { id },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `exemptedTuitionCampus.service.js`,
        `deleteExemptedTuitionCampus`,
        `DELETE`
      );
    }
  }
}

module.exports = ExemptedTuitionCampusService;
