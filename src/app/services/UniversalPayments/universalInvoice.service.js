const models = require('@models');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for this entity
class UniversalInvoiceService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all records or filtered using options param
   */
  static async findAllUniversalInvoices(options) {
    try {
      const records = await models.UniversalInvoice.findAll({
        ...options,
      });

      return records;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `universalInvoice.service.js`,
        `findAllUniversalInvoices`,
        `GET`
      );
    }
  }

  /**
   * Find All Universal Payment Transactions
   * @param {*} options
   */
  static async findAllUniversalTransactions(options) {
    try {
      const records = await models.UniversalInvoicePaymentTransactions.findAll({
        ...options,
      });

      return records;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `universalInvoice.service.js`,
        `findAllUniversalTransactions`,
        `GET`
      );
    }
  }

  /**
   * Find One Universal Payment Transactions
   *
   * @param {*} options
   */
  static async findOneRecord(options) {
    try {
      const transaction =
        await models.UniversalInvoicePaymentTransactions.findOne({
          ...options,
        });

      return transaction;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `universalInvoice.service.js`,
        `findOneRecord`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single record object basing on the options
   */
  static async findOneUniversalInvoice(options) {
    try {
      const record = await models.UniversalInvoice.findOne({
        ...options,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `universalInvoice.service.js`,
        `findOneUniversalInvoice`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} options
   */
  static async findOneUniversalPaymentReference(options) {
    try {
      const record = await models.UniversalInvoicePaymentReference.findOne({
        ...options,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `universalInvoice.service.js`,
        `findOneUniversalPaymentReference`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async createUniversalInvoice(data, transaction) {
    try {
      const record = await models.UniversalInvoice.findOrCreate({
        where: {
          invoice_number: data.invoice_number,
        },
        defaults: {
          ...data,
        },
        include: [
          {
            association: models.UniversalInvoice.invoiceReceivables,
          },
          {
            association: models.UniversalInvoice.reference,
          },
        ],
        transaction,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `universalInvoice.service.js`,
        `createUniversalInvoice`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async createUniversalPaymentReference(data, transaction) {
    try {
      const record = await models.UniversalInvoicePaymentReference.create(
        data,
        {
          transaction,
        }
      );

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `universalInvoice.service.js`,
        `createUniversalPaymentReference`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async createPrnTrackerRecord(data, transaction) {
    try {
      const record = await models.SystemPrnTracker.create(data, {
        transaction,
        returning: true,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `universalInvoice.service.js`,
        `createPrnTrackerRecord`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async createUniversalPaymentTransaction(data, transaction) {
    try {
      const record = await models.UniversalInvoicePaymentTransactions.create(
        data,
        {
          transaction,
        }
      );

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `universalInvoice.service.js`,
        `createUniversalPaymentTransaction`,
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
  static async updateUniversalInvoice(id, data, transaction) {
    try {
      const record = await models.UniversalInvoice.update(
        { ...data },
        { where: { id }, transaction, returning: true }
      );

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `universalInvoice.service.js`,
        `updateUniversalInvoice`,
        `PUT`
      );
    }
  }

  /**
   *
   * @param {*} id
   * @param {*} data
   */
  static async updateUniversalPaymentReference(id, data, transaction) {
    try {
      const record = await models.UniversalInvoicePaymentReference.update(
        { ...data },
        {
          where: { id },
          transaction,
          returning: true,
        }
      );

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `universalInvoice.service.js`,
        `updateUniversalPaymentReference`,
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
  static async deleteUniversalInvoice(id, transaction) {
    try {
      const deleted = await models.UniversalInvoice.destroy({
        where: { id },
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `universalInvoice.service.js`,
        `deleteUniversalInvoice`,
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
  static async deleteUniversalInvoicePaymentReference(id, transaction) {
    try {
      const deleted = await models.UniversalInvoicePaymentReference.destroy({
        where: { id },
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `universalInvoice.service.js`,
        `deleteUniversalInvoicePaymentReference`,
        `DELETE`
      );
    }
  }

  /**
   *
   * @param {*} options
   */
  static async findAllInvoiceReceivables(options) {
    try {
      const records = await models.UniversalInvoiceReceivable.findAll({
        ...options,
      });

      return records;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `universalInvoice.service.js`,
        `findAllInvoiceReceivables`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async bulkInsertInvoiceReceivables(data, transaction) {
    try {
      const result = await models.UniversalInvoiceReceivable.bulkCreate(data, {
        transaction,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `universalInvoice.service.js`,
        `bulkInsertInvoiceReceivables`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} data
   */
  static async bulkRemoveInvoiceReceivables(data, transaction) {
    try {
      const deleted = await models.UniversalInvoiceReceivable.destroy({
        where: { id: data },
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `universalInvoice.service.js`,
        `bulkRemoveInvoiceReceivables`,
        `DELETE`
      );
    }
  }

  /**
   *
   * @param {*} data
   */
  static async updateInvoiceReceivable(id, data, transaction) {
    try {
      const deleted = await models.UniversalInvoiceReceivable.update(
        { ...data },
        {
          where: { id },
          transaction,
          returning: true,
        }
      );

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `universalInvoice.service.js`,
        `updateInvoiceReceivable`,
        `PUT`
      );
    }
  }
}

module.exports = UniversalInvoiceService;
