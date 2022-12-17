const models = require('@models');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for a faculty
class DocumentSettingService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all faculties or filtered using options param
   */
  static async findAll(options) {
    try {
      const results = await models.DocumentSetting.findAll({
        ...options,
        raw: true,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `documentSetting.service.js`,
        `findAll`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns one setting
   */
  static async findOne(options) {
    try {
      const results = await models.DocumentSetting.findOne({
        ...options,
        raw: true,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `documentSetting.service.js`,
        `findOne`,
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
  static async createDocumentSetting(data) {
    try {
      const result = await models.DocumentSetting.create({
        ...data,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `documentSetting.service.js`,
        `createDocumentSetting`,
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
  static async updateDocumentSetting(id, data) {
    try {
      const updated = await models.DocumentSetting.update(data, {
        where: { id },
        returning: true,
        plain: true,
      });

      return updated[1];
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `documentSetting.service.js`,
        `updateDocumentSetting`,
        `PUT`
      );
    }
  }
}

module.exports = DocumentSettingService;
