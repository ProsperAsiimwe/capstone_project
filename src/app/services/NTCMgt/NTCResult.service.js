const models = require('@models');
const { QueryTypes } = require('sequelize');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for a NTCResult
class NTCResultService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all NTCResults or filtered using options param
   */
  static async findAll(options) {
    try {
      const results = await models.NTCResult.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `NTCResult.service.js`,
        `findAll`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single NTCResult object basing on the options
   */
  static async findOne(options) {
    try {
      const NTCResult = await models.NTCResult.findOne({ ...options });

      return NTCResult;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `NTCResult.service.js`,
        `findOne`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single NTCResult object from data object
   *@
   */
  static async create(data, transaction) {
    try {
      const record = await models.NTCResult.create(data, {
        transaction,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `NTCResult.service.js`,
        `create`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of NTCResult object to be updated
   * @returns {Promise}
   * @description updates a single NTCResult object
   *@
   */
  static async update(id, data) {
    try {
      const updated = await models.NTCResult.update(
        { ...data },
        { where: { id }, returning: true }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `NTCResult.service.js`,
        `update`,
        `PUT`
      );
    }
  }

  /**
   * @param {string} id  id of NTCResult object to be deleted
   * @returns {Promise}
   * @description deletes a single NTCResult object
   *@
   */
  static async delete(id) {
    try {
      const deleted = await models.NTCResult.destroy({
        where: { id },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `NTCResult.service.js`,
        `delete`,
        `DELETE`
      );
    }
  }

  //  results views

  static async ntcResultFunction(data) {
    try {
      const filtered = await models.sequelize.query(
        `select *
         from ntc_mgt.ntc_result_function(${data.academic_year_id},
          ${data.study_year},${data.term},'${data.programme}')
          `,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `NTCResult.service.js`,
        `ntcResultFunction`,
        `GET`
      );
    }
  }
}

module.exports = NTCResultService;
