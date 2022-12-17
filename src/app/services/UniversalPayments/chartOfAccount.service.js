const models = require('@models');
const { toUpper, trim } = require('lodash');
const { Op } = require('sequelize');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for this entity
class ChartOfAccountService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all records or filtered using options param
   */
  static async findAllChartsOfAccount(options) {
    try {
      const records = await models.ChartOfAccount.findAll({
        ...options,
      });

      return records;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `chartOfAccount.service.js`,
        `findAllChartsOfAccount`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single record object basing on the options
   */
  static async findOneChartOfAccount(options) {
    try {
      const record = await models.ChartOfAccount.findOne({
        ...options,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `chartOfAccount.service.js`,
        `findOneChartOfAccount`,
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
        `chartOfAccount.service.js`,
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
        `chartOfAccount.service.js`,
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
  static async createAccount(data, transaction) {
    try {
      const record = await models.ChartOfAccount.findOrCreate({
        where: {
          [Op.or]: [
            { account_code: toUpper(trim(data.account_code)) },
            { account_name: toUpper(trim(data.account_name)) },
          ],
        },
        defaults: {
          ...data,
        },
        transaction,
      });

      if (record[1] === false) {
        throw new Error(
          `Account code or Account Name repeated on record ${record[0].dataValues.account_code}: ${record[0].dataValues.account_name}`
        );
      }

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `chartOfAccount.service.js`,
        `createAccount`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async createAccountReceivable(data, transaction) {
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
        `chartOfAccount.service.js`,
        `createAccountReceivable`,
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
  static async updateChartOfAccount(id, data) {
    try {
      const record = await models.ChartOfAccount.update(
        { ...data },
        { where: { id }, returning: true }
      );

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `chartOfAccount.service.js`,
        `updateChartOfAccount`,
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
  static async updateReceivableApproval(id, data, transaction) {
    try {
      const record = await models.ReceivableApproval.update(
        { ...data },
        { where: { id }, transaction, returning: true }
      );

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `chartOfAccount.service.js`,
        `updateReceivableApproval`,
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
        `chartOfAccount.service.js`,
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
  static async deleteChartOfAccount(id) {
    try {
      const deleted = await models.ChartOfAccount.destroy({
        where: { id },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `chartOfAccount.service.js`,
        `deleteChartOfAccount`,
        `DELETE`
      );
    }
  }

  /**
   * @param {string} id  id of record object to be deleted
   * @returns {Promise}
   * @description deletes a single record object
   *@
   */
  static async deleteAccountReceivable(id) {
    try {
      const deleted = await models.AccountReceivable.destroy({
        where: { id },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `chartOfAccount.service.js`,
        `deleteAccountReceivable`,
        `DELETE`
      );
    }
  }
}

module.exports = ChartOfAccountService;
