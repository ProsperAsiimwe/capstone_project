const models = require('@models');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for a faculty
class MetadataService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all faculties or filtered using options param
   */
  static async findAllMetadata(options) {
    try {
      const results = await models.Metadata.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `metadata.service.js`,
        `findAllMetadata`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single faculty object basing on the options
   */
  static async findOneMetadata(options) {
    try {
      const metadata = await models.Metadata.findOne({ ...options });

      return metadata;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `metadata.service.js`,
        `findOneMetadata`,
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
  static async createMetadata(data) {
    try {
      const newMetadata = await models.Metadata.create({
        ...data,
      });

      return newMetadata;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `metadata.service.js`,
        `createMetadata`,
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
  static async updateMetadata(id, data) {
    try {
      const updated = await models.Metadata.update(data, {
        where: { id },
        returning: true,
      });

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `metadata.service.js`,
        `updateMetadata`,
        `PUT`
      );
    }
  }

  /**
   * @param {string} id  id of faculty object to be deleted
   * @returns {Promise}
   * @description deletes a single faculty object
   *@
   */
  static async deleteMetadata(id) {
    try {
      const deleted = await models.Metadata.destroy({
        where: { id },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `metadata.service.js`,
        `deleteMetadata`,
        `DELETE`
      );
    }
  }
}

module.exports = MetadataService;
