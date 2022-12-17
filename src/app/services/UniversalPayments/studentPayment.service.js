const models = require('@models');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for this entity
class StudentPaymentService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all records or filtered using options param
   */
  static async findAllStudentPayments(options) {
    try {
      const records = await models.StudentPayment.findAll({
        ...options,
      });

      return records;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `studentPayment.service.js`,
        `findAllStudentPayments`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} options
   */
  static async findAllStudentPaymentTransactions(options) {
    try {
      const records = await models.StudentPaymentTransaction.findAll({
        ...options,
      });

      return records;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `studentPayment.service.js`,
        `findAllStudentPaymentTransactions`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single record object basing on the options
   */
  static async findOneStudentPayment(options) {
    try {
      const record = await models.StudentPayment.findOne({
        ...options,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `studentPayment.service.js`,
        `findOneStudentPayment`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} options
   */
  static async findOneStudentPaymentReference(options) {
    try {
      const record = await models.StudentPaymentReference.findOne({
        ...options,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `studentPayment.service.js`,
        `findOneStudentPaymentReference`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async createStudentPayment(data, transaction) {
    try {
      const record = await models.StudentPayment.create(data, {
        include: [
          {
            association: models.StudentPayment.reference,
          },
        ],
        transaction,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `studentPayment.service.js`,
        `createStudentPayment`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async createStudentPaymentReference(data, transaction) {
    try {
      const record = await models.StudentPaymentReference.create(data, {
        transaction,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `studentPayment.service.js`,
        `createStudentPaymentReference`,
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
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `studentPayment.service.js`,
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
  static async createStudentPaymentTransaction(data, transaction) {
    try {
      const record = await models.StudentPaymentTransaction.create(data, {
        transaction,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `studentPayment.service.js`,
        `createStudentPaymentTransaction`,
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
  static async updateStudentPayment(id, data, transaction) {
    try {
      const record = await models.StudentPayment.update(
        { ...data },
        { where: { id }, transaction, returning: true }
      );

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `studentPayment.service.js`,
        `updateStudentPayment`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} id
   * @param {*} data
   */
  static async updateStudentPaymentReference(id, data, transaction) {
    try {
      const record = await models.StudentPaymentReference.update(
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
        `studentPayment.service.js`,
        `updateStudentPaymentReference`,
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
  static async deleteStudentPayment(id, transaction) {
    try {
      const deleted = await models.StudentPayment.destroy({
        where: { id },
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `studentPayment.service.js`,
        `deleteStudentPayment`,
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
  static async deleteStudentPaymentReference(id, transaction) {
    try {
      const deleted = await models.StudentPaymentReference.destroy({
        where: { id },
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `studentPayment.service.js`,
        `deleteStudentPaymentReference`,
        `DELETE`
      );
    }
  }
}

module.exports = StudentPaymentService;
