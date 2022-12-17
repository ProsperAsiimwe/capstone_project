const models = require('@models');
const { QueryTypes } = require('sequelize');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for this entity
class PaymentTransactionService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all records or filtered using options param
   */

  static async findAllRecords(student) {
    try {
      const filtered = await models.sequelize.query(
        `select * from  enrollment_and_registration_mgt.payment_transactions_function(${student})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentTransaction.service.js`,
        `findAllRecords`,
        `GET`
      );
    }
  }

  // Deposited payment transactions on student account
  static async depositedTransactions(student) {
    try {
      const filtered = await models.sequelize.query(
        `select * from  enrollment_and_registration_mgt.payment_transactions_deposited(${student})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentTransaction.service.js`,
        `depositedTransactions`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} origin
   */
  static async findAllPendingDirectPostRecords(origin) {
    try {
      const filtered = await models.sequelize.query(
        `select * from  enrollment_and_registration_mgt.payment_transactions_pending_function(${origin})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentTransaction.service.js`,
        `findAllPendingDirectPostRecords`,
        `GET`
      );
    }
  }

  /**
   * @param {string} id  id of record object to be deleted
   * @returns {Promise}
   * @description deletes a single record object
   *@
   */
  static async deleteDirectDepositPayment(id, transaction) {
    try {
      await models.PaymentTransaction.destroy({
        where: { id },
        transaction,
      });
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentTransaction.service.js`,
        `deleteDirectDepositPayment`,
        `DELETE`
      );
    }
  }

  /** findAllApprovedTransactionsWithUnallocatedMoney
   *
   * @param {*} student
   */

  static async findAllApprovedTransactionsWithUnallocatedMoney(student) {
    try {
      const filtered = await models.sequelize.query(
        `select * from  enrollment_and_registration_mgt.payment_transactions_unallocated_function(${student})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentTransaction.service.js`,
        `findAllApprovedTransactionsWithUnallocatedMoney`,
        `GET`
      );
    }
  }

  /** findAllApprovedTransactionsWithUnallocatedMoney
   *
   * @param {*} student
   */

  static async getDirectPostAndPreviousPaymentAmounts(dateFrom, dateTo) {
    try {
      const filtered = await models.sequelize.query(
        `
        select pt.transaction_origin, sum(amount) as total_amount
        from enrollment_and_registration_mgt.payment_transactions as pt 
        where pt.transaction_origin in ('PREVIOUS STUDENT DEPOSIT', 'DIRECT POST', 'FUNDS TRANSFER') AND pt.created_at >= '${dateFrom}'
        AND pt.created_at <= '${dateTo}'
        group by pt.transaction_origin `,
        {
          type: QueryTypes.SELECT,
          raw: true,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentTransaction.service.js`,
        `findAllApprovedTransactionsWithUnallocatedMoney`,
        `GET`
      );
    }
  }

  // students_unallocated_deposits

  static async studentUnallocatedAmount(student) {
    try {
      const filtered = await models.sequelize.query(
        `select * from  enrollment_and_registration_mgt.students_unallocated_deposits(${student})`,
        {
          type: QueryTypes.SELECT,
          plain: true,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentTransaction.service.js`,
        `studentUnallocatedAmount`,
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
      const record = await models.PaymentTransaction.findOne({
        ...options,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentTransaction.service.js`,
        `findOneRecord`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   */
  static async incrementTransaction(field, by, id, transaction) {
    try {
      const incremented = await models.PaymentTransaction.increment(field, {
        by,
        where: { id },
        transaction,
        returning: true,
      });

      return incremented;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentTransaction.service.js`,
        `incrementTransaction`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   */
  static async decrementTransaction(field, by, id, transaction) {
    try {
      const incremented = await models.PaymentTransaction.decrement(field, {
        by,
        where: { id },
        transaction,
        returning: true,
      });

      return incremented;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentTransaction.service.js`,
        `decrementTransaction`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} options
   */
  static async findAllRecordsWithModels(options) {
    try {
      const record = await models.PaymentTransaction.findAll({
        ...options,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentTransaction.service.js`,
        `findAllRecordsWithModels`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single record object from data object
   *@
   */
  static async createPaymentTransactionRecord(data, transaction) {
    try {
      const result = await models.PaymentTransaction.create(
        {
          ...data,
        },
        {
          transaction,
        }
      );

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentTransaction.service.js`,
        `createPaymentTransactionRecord`,
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
      const record = await models.PaymentTransaction.update(
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
        `paymentTransaction.service.js`,
        `updateRecord`,
        `PUT`
      );
    }
  }

  /** updateRecordAfterRevokingSurcharges
   *
   * @param {*} id
   * @param {*} data
   */
  static async updateRecordAfterRevokingSurcharges(
    id,
    updatedAmountPaid,
    updatedUnallocatedAmount
  ) {
    try {
      const record = await models.PaymentTransaction.update(
        {
          amount_paid: updatedAmountPaid,
          unallocated_amount: updatedUnallocatedAmount,
        },
        { where: { id }, returning: true }
      );

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentTransaction.service.js`,
        `updateRecordAfterRevokingSurcharges`,
        `PUT`
      );
    }
  }

  /** createRefundRequest
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async createRefundRequest(data, transaction) {
    try {
      const result = await models.RefundRequest.findOrCreate({
        where: {
          student_id: data.student_id,
        },
        defaults: {
          ...data,
        },
        include: [
          {
            association: models.RefundRequest.paymentTransactions,
          },
        ],
        transaction,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentTransaction.service.js`,
        `createRefundRequest`,
        `POST`
      );
    }
  }

  /** updateRefundRequest
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async updateRefundRequest(id, data, transaction) {
    try {
      const result = await models.RefundRequest.update(
        {
          ...data,
        },
        { where: { id }, transaction, returning: true }
      );

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentTransaction.service.js`,
        `updateRefundRequest`,
        `PUT`
      );
    }
  }

  /** findOneRequestToRefund
   *
   * @param {*} options
   */
  static async findOneRequestToRefund(options) {
    try {
      const record = await models.RefundRequest.findOne({
        ...options,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentTransaction.service.js`,
        `findOneRequestToRefund`,
        `GET`
      );
    }
  }

  /** findAllRefundRequestPaymentTransactions
   *
   * @param {*} options
   */
  static async findAllRefundRequestPaymentTransactions(options) {
    try {
      const record = await models.RefundRequestPaymentTransaction.findAll({
        ...options,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentTransaction.service.js`,
        `findAllRefundRequestPaymentTransactions`,
        `GET`
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
      const deleted = await models.PaymentTransaction.destroy({
        where: { id },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentTransaction.service.js`,
        `deleteRecord`,
        `DELETE`
      );
    }
  }
}

module.exports = PaymentTransactionService;
