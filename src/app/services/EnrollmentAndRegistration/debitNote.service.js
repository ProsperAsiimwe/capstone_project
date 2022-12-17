const models = require('@models');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for this entity
class DebitNoteService {
  /**
   * FIND ALL CREDIT NOTES
   *
   * @param {*} options
   */
  static async findAll(options) {
    try {
      const results = await models.DebitNote.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `debitNote.service.js`,
        `findAll`,
        `GET`
      );
    }
  }

  /** CREATE CREDIT NOTE
   *
   * @param {*} id
   * @param {*} data
   */
  static async bulkCreate(data, transaction) {
    try {
      const result = await models.DebitNote.bulkCreate(data, {
        transaction,
        returning: true,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `debitNote.service.js`,
        `bulkCreate`,
        `POST`
      );
    }
  }

  /** UPDATE DEBIT NOTE
   *
   * @param {*} id
   * @param {*} data
   */
  static async update(data, id, transaction) {
    try {
      const result = await models.DebitNote.update(data, {
        where: { id, status: 'PENDING' },
        transaction,
        returning: true,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `debitNote.service.js`,
        `update`,
        `PUT`
      );
    }
  }
}

module.exports = DebitNoteService;
