const models = require('@models');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for a institutionProgramme
class PujabInstitutionProgrammeService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all faculties or filtered using options param
   */
  static async findAllInstitutionProgrammes(options) {
    try {
      const results = await models.InstitutionProgramme.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `institutionProgramme.service.js`,
        `findAllInstitutionProgrammes`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single institutionProgramme object basing on the options
   */
  static async findOneInstitutionProgramme(options) {
    try {
      const institutionProgramme = await models.InstitutionProgramme.findOne({
        ...options,
      });

      return institutionProgramme;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `institutionProgramme.service.js`,
        `findOneInstitutionProgramme`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single institutionProgramme object from data object
   *@
   */
  static async createInstitutionProgramme(data, transaction) {
    try {
      const record = await models.InstitutionProgramme.findOrCreate({
        where: {
          programme_code: data.programme_code,
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
        `institutionProgramme.service.js`,
        `createInstitutionProgramme`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of institutionProgramme object to be updated
   * @returns {Promise}
   * @description updates a single institutionProgramme object
   *@
   */
  static async updateInstitutionProgramme(id, data) {
    try {
      const updated = await models.InstitutionProgramme.update(
        { ...data },
        { where: { id }, returning: true }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `institutionProgramme.service.js`,
        `updateInstitutionProgramme`,
        `PUT`
      );
    }
  }

  /**
   * @param {string} id  id of institutionProgramme object to be deleted
   * @returns {Promise}
   * @description deletes a single institutionProgramme object
   *@
   */
  static async deleteInstitutionProgramme(id, transaction) {
    try {
      const deleted = await models.InstitutionProgramme.destroy({
        where: { id },
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `institutionProgramme.service.js`,
        `deleteInstitutionProgramme`,
        `DELETE`
      );
    }
  }
}

module.exports = PujabInstitutionProgrammeService;
