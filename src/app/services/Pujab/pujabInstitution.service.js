const models = require('@models');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for a institution
class PujabInstitutionService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all faculties or filtered using options param
   */
  static async findAllInstitutions(options) {
    try {
      const results = await models.Institution.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `institution.service.js`,
        `findAllInstitutions`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single institution object basing on the options
   */
  static async findOneInstitution(options) {
    try {
      const institution = await models.Institution.findOne({
        ...options,
      });

      return institution;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `institution.service.js`,
        `findOneInstitution`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single institution object from data object
   *@
   */
  static async createInstitution(data, transaction) {
    try {
      const record = await models.Institution.findOrCreate({
        where: {
          code: data.code,
        },
        defaults: {
          ...data,
        },
        transaction,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `institution.service.js`,
        `createInstitution`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of institution object to be updated
   * @returns {Promise}
   * @description updates a single institution object
   *@
   */
  static async updateInstitution(id, data) {
    try {
      const updated = await models.Institution.update(data, {
        where: { id },
        returning: true,
      });

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `institution.service.js`,
        `updateInstitution`,
        `PUT`
      );
    }
  }

  /**
   * @param {string} id  id of institution object to be deleted
   * @returns {Promise}
   * @description deletes a single institution object
   *@
   */
  static async deleteInstitution(id, transaction) {
    try {
      const deleted = await models.Institution.destroy({
        where: { id },
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `institution.service.js`,
        `deleteInstitution`,
        `DELETE`
      );
    }
  }
}

module.exports = PujabInstitutionService;
