const models = require('../../../database/models');
const moment = require('moment');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for a progVersPlanAdmCriteria
class ProgVersPlanAdmCriteriaService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all faculties or filtered using options param
   */
  static async findAllProgVersPlanAdmCriteria(options) {
    try {
      const results = await models.ProgVersPlanAdmCriteria.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `progVersPlanAdmCriteria.service.js`,
        `findAllProgVersPlanAdmCriteria`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single progVersPlanAdmCriteria object basing on the options
   */
  static async findOneProgVersPlanAdmCriteria(options) {
    try {
      const progVersPlanAdmCriteria =
        await models.ProgVersPlanAdmCriteria.findOne({
          ...options,
        });

      return progVersPlanAdmCriteria;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `progVersPlanAdmCriteria.service.js`,
        `findOneProgVersPlanAdmCriteria`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single progVersPlanAdmCriteria object from data object
   *@
   */
  static async createProgVersPlanAdmCriteria(data) {
    try {
      const defaultFields = {
        //   create_approval_status: "PENDING",
        created_at: moment.now(),
        updated_at: moment.now(),
      };
      const newProgVersPlanAdmCriteria =
        await models.ProgVersPlanAdmCriteria.create({
          ...data,
          ...defaultFields,
        });

      return newProgVersPlanAdmCriteria;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `progVersPlanAdmCriteria.service.js`,
        `createProgVersPlanAdmCriteria`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of progVersPlanAdmCriteria object to be updated
   * @returns {Promise}
   * @description updates a single progVersPlanAdmCriteria object
   *@
   */
  static async updateProgVersPlanAdmCriteria(id, data) {
    try {
      const updated = await models.ProgVersPlanAdmCriteria.update(
        { ...data },
        { where: { id }, returning: true }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `progVersPlanAdmCriteria.service.js`,
        `updateProgVersPlanAdmCriteria`,
        `PUT`
      );
    }
  }

  /**
   * @param {string} id  id of progVersPlanAdmCriteria object to be deleted
   * @returns {Promise}
   * @description deletes a single progVersPlanAdmCriteria object
   *@
   */
  static async deleteProgVersPlanAdmCriteria(id) {
    try {
      const deleted = await models.ProgVersPlanAdmCriteria.destroy({
        where: { id },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `progVersPlanAdmCriteria.service.js`,
        `deleteProgVersPlanAdmCriteria`,
        `DELETE`
      );
    }
  }
}

module.exports = ProgVersPlanAdmCriteriaService;
