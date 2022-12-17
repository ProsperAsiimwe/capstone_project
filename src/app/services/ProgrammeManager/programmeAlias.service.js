const models = require('@models');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for a ProgrammeAlias
class ProgrammeAliasService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all aliases
   */
  static async findAllProgrammeAliases(options) {
    try {
      const results = await models.ProgrammeAlias.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeAlias.service.js`,
        `findAllProgrammeAliases`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single alias object basing on the options
   */
  static async findOneProgrammeAlias(options) {
    try {
      const userProgrammeAlias = await models.ProgrammeAlias.findOne({
        ...options,
      });

      return userProgrammeAlias;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeAlias.service.js`,
        `findOneProgrammeAlias`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single userProgrammeAlias object from data object
   *@
   */
  static async createProgrammeAlias(data) {
    try {
      const newProgrammeAlias = await models.ProgrammeAlias.create({
        ...data,
      });

      return newProgrammeAlias;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeAlias.service.js`,
        `createProgrammeAlias`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of userProgrammeAlias object to be updated
   * @returns {Promise}
   * @description updates a single userProgrammeAlias object
   *@
   */
  static async updateProgrammeAlias(id, data) {
    try {
      const updated = await models.ProgrammeAlias.update(
        { ...data },
        { where: { id }, returning: true }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeAlias.service.js`,
        `updateProgrammeAlias`,
        `PUT`
      );
    }
  }

  /**
   * @param {string} id  id of userProgrammeAlias object to be deleted
   * @returns {Promise}
   * @description deletes a single userProgrammeAlias object
   *@
   */
  static async deleteProgrammeAlias(id) {
    try {
      const deleted = await models.ProgrammeAlias.destroy({
        where: { id },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeAlias.service.js`,
        `deleteProgrammeAlias`,
        `DELETE`
      );
    }
  }
}

module.exports = ProgrammeAliasService;
