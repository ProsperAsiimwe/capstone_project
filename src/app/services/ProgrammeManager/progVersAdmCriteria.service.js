const models = require('../../../database/models');
const moment = require('moment');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for a progVersion_admCriteria
class ProgVersAdmCriteriaService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all faculties or filtered using options param
   */
  static async findAllProgVersAdmCriterias(options) {
    try {
      const results = await models.ProgVersAdmCriteria.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `progVersAdmCriteria.service.js`,
        `findAllProgVersAdmCriterias`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single progVersion_admCriteria object basing on the options
   */
  static async findOneProgVersAdmCriteria(options) {
    try {
      const result = await models.ProgVersAdmCriteria.findOne({
        ...options,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `progVersAdmCriteria.service.js`,
        `findOneProgVersAdmCriteria`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single progVersion_admCriteria object from data object
   *@
   */
  static async createProgVersAdmCriteria(data) {
    try {
      const defaultFields = {
        //   create_approval_status: "PENDING",
        created_at: moment.now(),
        updated_at: moment.now(),
      };
      const newProgVersAdmCriteria = await models.ProgVersAdmCriteria.create({
        ...data,
        ...defaultFields,
      });

      return newProgVersAdmCriteria;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `progVersAdmCriteria.service.js`,
        `createProgVersAdmCriteria`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of progVersion_admCriteria object to be updated
   * @returns {Promise}
   * @description updates a single progVersion_admCriteria object
   *@
   */
  static async updateProgVersAdmCriteria(id, data) {
    try {
      const updated = await models.ProgVersAdmCriteria.update(
        { ...data },
        { where: { id }, returning: true }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `progVersAdmCriteria.service.js`,
        `updateProgVersAdmCriteria`,
        `PUT`
      );
    }
  }

  /**
   * @param {string} id  id of progVersion_admCriteria object to be deleted
   * @returns {Promise}
   * @description deletes a single progVersion_admCriteria object
   *@
   */
  static async deleteProgVersAdmCriteria(id) {
    try {
      const deleted = await models.ProgVersAdmCriteria.destroy({
        where: { id },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `progVersAdmCriteria.service.js`,
        `deleteProgVersAdmCriteria`,
        `DELETE`
      );
    }
  }
}

module.exports = ProgVersAdmCriteriaService;
