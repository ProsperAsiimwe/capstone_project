const models = require('@models');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for this entity
class BulkPaymentService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all records or filtered using options param
   */
  static async findAllRecords(options) {
    try {
      const records = await models.BulkPayment.findAll({
        ...options,
      });

      return records;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `bulkPayment.service.js`,
        `findAllRecords`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single record object basing on the options
   */
  static async findOneRecord(options) {
    try {
      const record = await models.BulkPayment.findOne({
        ...options,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `bulkPayment.service.js`,
        `findOneRecord`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async createRecord(data, transaction) {
    try {
      const record = await models.BulkPayment.create(data, {
        transaction,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `bulkPayment.service.js`,
        `createRecord`,
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
  static async updateRecord(id, data, transaction) {
    try {
      const record = await models.BulkPayment.update(
        {
          ...data,
        },
        {
          where: {
            id,
          },
          transaction,
          returning: true,
        }
      );

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `bulkPayment.service.js`,
        `updateRecord`,
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
  static async deleteRecord(id) {
    try {
      const deleted = await models.BulkPayment.destroy({
        where: { id },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `bulkPayment.service.js`,
        `deleteRecord`,
        `DELETE`
      );
    }
  }
}

module.exports = BulkPaymentService;
