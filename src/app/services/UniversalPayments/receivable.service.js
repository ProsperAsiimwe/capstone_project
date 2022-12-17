const models = require('@models');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for this entity
class ReceivableService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all records or filtered using options param
   */
  static async findAllReceivables(options) {
    try {
      const records = await models.AccountReceivable.findAll({
        ...options,
      });

      return records;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `receivable.service.js`,
        `findAllReceivables`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single record object basing on the options
   */
  static async findOneReceivableApproval(options) {
    try {
      const record = await models.ReceivableApproval.findOne({
        ...options,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `receivable.service.js`,
        `findOneReceivableApproval`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single record object basing on the options
   */
  static async findOneReceivable(options) {
    try {
      const record = await models.AccountReceivable.findOne({
        ...options,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `receivable.service.js`,
        `findOneReceivable`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async createReceivable(data, transaction) {
    try {
      const record = await models.AccountReceivable.findOrCreate({
        where: {
          account_id: data.account_id,
          receivable_name: data.receivable_name.trim(),
        },
        defaults: {
          ...data,
        },
        include: [
          {
            association: models.AccountReceivable.approvals,
          },
        ],
        transaction,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `receivable.service.js`,
        `createReceivable`,
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
  static async approveReceivable(id, data, transaction) {
    try {
      const record = await models.ReceivableApproval.update(
        { ...data },
        { where: { id }, transaction, returning: true }
      );

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `receivable.service.js`,
        `approveReceivable`,
        `PUT`
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
  static async updateReceivable(id, data, transaction) {
    try {
      const record = await models.AccountReceivable.update(
        { ...data },
        { where: { id }, transaction, returning: true }
      );

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `receivable.service.js`,
        `updateReceivable`,
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
  static async deleteReceivable(id) {
    try {
      const deleted = await models.AccountReceivable.destroy({
        where: { id },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `receivable.service.js`,
        `deleteReceivable`,
        `DELETE`
      );
    }
  }
}

module.exports = ReceivableService;
