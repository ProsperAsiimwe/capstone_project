const models = require('@models');
const { QueryTypes } = require('sequelize');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for this entity
class CreditNoteService {
  /**
   * FIND ALL CREDIT NOTES
   *
   * @param {*} options
   */
  static async findAll(options) {
    try {
      const results = await models.CreditNote.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `creditNote.service.js`,
        `findAll`,
        `GET`
      );
    }
  }

  /**
   * FIND ONE CREDIT NOTE
   *
   * @param {*} options
   */
  static async findOne(options) {
    try {
      const results = await models.CreditNote.findOne({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `creditNote.service.js`,
        `findOne`,
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
      const result = await models.CreditNote.bulkCreate(data, {
        transaction,
        returning: true,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `creditNote.service.js`,
        `bulkCreate`,
        `POST`
      );
    }
  }

  /** UPDATE CREDIT NOTE
   *
   * @param {*} id
   * @param {*} data
   */
  static async update(data, id, transaction) {
    try {
      const result = await models.CreditNote.update(data, {
        where: { id, status: 'PENDING' },
        transaction,
        returning: true,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `creditNote.service.js`,
        `update`,
        `PUT`
      );
    }
  }

  // credit  notes pending

  static async pendingCreditNotes(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.credit_note_by_date('${data.date_from}','${data.date_to}')`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `creditNote.service.js`,
        `pendingCreditNotes`,
        `GET`
      );
    }
  }

  //  debit note by date
  static async pendingDebitNotes(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.debit_note_by_date('${data.date_from}','${data.date_to}')`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `creditNote.service.js`,
        `pendingDebitNotes`,
        `GET`
      );
    }
  }

  // credit note report

  static async creditNoteReportsDate(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.credit_note_report_date('${data.date_from}','${data.date_to}')`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `creditNote.service.js`,
        `creditNoteReportsDate`,
        `GET`
      );
    }
  }
}

module.exports = CreditNoteService;
