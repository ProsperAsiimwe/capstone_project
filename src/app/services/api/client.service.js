const models = require('@models');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for this entity
class ClientService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all records or filtered using options param
   */
  static async findAllClients(options) {
    try {
      const records = await models.Client.findAll({
        ...options,
      });

      return records;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `result.service.js`,
        `findAllResults`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single record object basing on the options
   */
  static async fetchOneClient(options) {
    try {
      const record = await models.Client.findOne({
        ...options,
      });

      return record;
    } catch (error) {
      // await sequelizeErrorHandler(
      //   error,
      //   `result.service.js`,
      //   `fetchResult`,
      //   `GET`
      // );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async createClient(data, transaction) {
    try {
      const record = await models.Client.create(data, {
        transaction,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `result.service.js`,
        `createResult`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of record object to be updated
   * @returns {Promise}
   * @description updates a single record object
   *@
   */
  static async updateClient(id, data, transaction) {
    try {
      const record = await models.Client.update(
        { ...data },
        {
          where: { id },
          transaction,
          returning: true,
          excludes: ['secret_number'],
          plain: true,
        }
      );

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `result.service.js`,
        `updateResult`,
        `PUT`
      );
    }
  }

  /**
   * @param {string} id  id of record object to be deleted
   * @returns {Promise}
   * @description deletes a single record object
   *@
   */
  static async deleteResult(id, transaction) {
    try {
      const deleted = await models.Client.destroy({
        where: { id },
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `result.service.js`,
        `deleteResult`,
        `DELETE`
      );
    }
  }
}

module.exports = ClientService;
