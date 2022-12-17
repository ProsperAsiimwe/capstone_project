const models = require('@models');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for a faculty
class InstitutionStructureService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all faculties or filtered using options param
   */
  static async findInstitutionStructureRecords(options) {
    try {
      const results = await models.InstitutionStructure.findOne({
        ...options,
        raw: true,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `institutionStructure.service.js`,
        `findInstitutionStructureRecords`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single faculty object from data object
   *@
   */
  static async createInstitutionStructure(data) {
    try {
      const result = await models.InstitutionStructure.create({
        ...data,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `institutionStructure.service.js`,
        `createInstitutionStructure`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data Data to update.
   * @param {string} id  id of faculty object to be updated
   * @returns {Promise}
   * @description updates a single faculty object
   *@
   */
  static async updateInstitutionStructure(id, data) {
    try {
      const updated = await models.InstitutionStructure.update(data, {
        where: { id },
        returning: true,
        plain: true,
      });

      return updated[1];
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `institutionStructure.service.js`,
        `updateInstitutionStructure`,
        `PUT`
      );
    }
  }

  /**
   * @param  {object} data Data to update.
   * @param {string} id  id of faculty object to be updated
   * @returns {Promise}
   * @description updates a single faculty object
   *@
   */
  static async updateInstitutionLogo(id, data) {
    try {
      const updated = await models.InstitutionStructure.update(data, {
        returning: true,
        plain: true,
      });

      return updated[1];
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `institutionStructure.service.js`,
        `updateInstitutionLogo`,
        `PUT`
      );
    }
  }
}

module.exports = InstitutionStructureService;
