const models = require('@models');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for a StudentMgtActivityLog
class StudentMgtActivityLogService {
  /**
   * FIND ALL StudentMgtActivityLog
   *
   * @param {*} options
   * @returns
   */
  static async findAll(options) {
    try {
      const results = await models.StudentMgtActivityLog.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `studentMgtActivityLog.service.js`,
        `findAll`,
        `GET`
      );
    }
  }

  /**
   * FIND ONE StudentMgtActivityLog
   *
   * @param {*} options
   * @returns
   */
  static async findOne(options) {
    try {
      const record = await models.StudentMgtActivityLog.findOne(options);

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `studentMgtActivityLog.service.js`,
        `findOne`,
        `GET`
      );
    }
  }

  /**
   * CREATE NEW StudentMgtActivityLog
   *
   * @param {*} data
   * @param {*} transaction
   * @returns
   */
  static async create(data, transaction) {
    try {
      const result = await models.StudentMgtActivityLog.create(data, {
        transaction,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `studentMgtActivityLog.service.js`,
        `create`,
        `POST`
      );
    }
  }

  /**
   * DELETE StudentMgtActivityLog Record
   *
   * @param {*} id
   * @returns
   */
  static async deleteRecord(id) {
    try {
      const deleted = await models.StudentMgtActivityLog.destroy({
        where: { id },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `studentMgtActivityLog.service.js`,
        `deleteRecord`,
        `DELETE`
      );
    }
  }
}

module.exports = StudentMgtActivityLogService;
