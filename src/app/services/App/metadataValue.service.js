const models = require('@models');
const { trim } = require('lodash');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');
const { QueryTypes } = require('sequelize');

// This Class is responsible for handling all database interactions for a static Parameter Value
class MetadataValueService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all static Parameter Values or filtered using options param
   */
  static async findAllMetadataValues(options) {
    try {
      const results = await models.MetadataValue.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `metadataValue.service.js`,
        `findAllMetadataValues`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single Meta Data Value object basing on the options
   */
  static async findOneMetadataValue(options) {
    try {
      const metadataValue = await models.MetadataValue.findOne({
        ...options,
      });

      return metadataValue;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `metadataValue.service.js`,
        `findOneMetadataValue`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single metadataValue object from data object
   *@
   */
  static async createMetadataValue(data) {
    try {
      const newMetadataValue = await models.MetadataValue.findOrCreate({
        where: {
          metadata_id: data.metadata_id,
          metadata_value: trim(data.metadata_value),
        },
        defaults: {
          ...data,
        },
      });

      return newMetadataValue;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `metadataValue.service.js`,
        `createMetadataValue`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data Data to update.
   * @param {string} id  id of metadataValue object to be updated
   * @returns {Promise}
   * @description updates a single metadataValue object
   *@
   */
  static async updateMetadataValue(id, data) {
    try {
      const updated = await models.MetadataValue.update(data, {
        where: { id },
        returning: true,
      });

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `metadataValue.service.js`,
        `updateMetadataValue`,
        `PUT`
      );
    }
  }

  /**
   * @param {string} id  id of metadataValue object to be deleted
   * @returns {Promise}
   * @description deletes a single metadataValue object
   *@
   */
  static async deleteMetadataValue(id) {
    try {
      const deleted = await models.MetadataValue.destroy({
        where: { id },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `metadataValue.service.js`,
        `deleteMetadataValue`,
        `DELETE`
      );
    }
  }

  // search metadata

  static async findOneMetadataValueByType(data) {
    try {
      const filtered = await models.sequelize.query(
        `select 
          mv.id as id,
          mv.metadata_value as metadata_value,
          mv.metadata_value_description as metadata_value_description,
          md.metadata_name as metadata_name

          from app_mgt.metadata_values as mv
          left join app_mgt.metadata as md
          on md.id = mv.metadata_id
          where md.metadata_name = '${data.metadata}'and mv.id = ${data.id}
        `,
        {
          type: QueryTypes.SELECT,
          plain: true,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `reports.service.js`,
        `studentResults`,
        `GET`
      );
    }
  }
}

module.exports = MetadataValueService;
