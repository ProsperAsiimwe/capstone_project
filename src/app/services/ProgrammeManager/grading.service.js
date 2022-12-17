const models = require('@models');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for a grading
class GradingService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all faculties or filtered using options param
   */
  static async findAllGrading(options) {
    try {
      const results = await models.Grading.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `grading.service.js`,
        `findAllGrading`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single grading object basing on the options
   */
  static async findOneGrading(options) {
    try {
      const grading = await models.Grading.findOne({ ...options });

      return grading;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `grading.service.js`,
        `findOneGrading`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single grading object from data object
   *@
   */
  static async createGrading(data, transaction) {
    try {
      const newGrading = await models.Grading.create(data, {
        include: [
          {
            association: models.Grading.values,
          },
        ],
        transaction,
      });

      return newGrading;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `grading.service.js`,
        `createGrading`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of grading object to be updated
   * @returns {Promise}
   * @description updates a single grading object
   *@
   */
  static async updateGrading(id, data, transaction) {
    try {
      const updated = await models.Grading.update(
        { ...data },
        { where: { id }, returning: true },
        transaction
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `grading.service.js`,
        `updateGrading`,
        `PUT`
      );
    }
  }

  /**
   * @param {string} id  id of grading object to be deleted
   * @returns {Promise}
   * @description deletes a single grading object
   *@
   */
  static async deleteGrading(id, transaction) {
    try {
      const deleted = await models.Grading.destroy({
        where: { id },
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `grading.service.js`,
        `deleteGrading`,
        `DELETE`
      );
    }
  }
}

module.exports = GradingService;
