const models = require('@models');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for a NTCStudent
class NTCStudentService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all NTCStudents or filtered using options param
   */
  static async findAll(options) {
    try {
      const results = await models.NTCStudent.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `NTCStudent.service.js`,
        `findAll`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single NTCStudent object basing on the options
   */
  static async findOne(options) {
    try {
      const NTCStudent = await models.NTCStudent.findOne({ ...options });

      return NTCStudent;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `NTCStudent.service.js`,
        `findAll`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single NTCStudent object from data object
   *@
   */
  static async create(data, transaction) {
    try {
      const record = await models.NTCStudent.create(data, {
        transaction,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `NTCStudent.service.js`,
        `create`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of NTCStudent object to be updated
   * @returns {Promise}
   * @description updates a single NTCStudent object
   *@
   */
  static async update(id, data) {
    try {
      const updated = await models.NTCStudent.update(
        { ...data },
        { where: { id }, returning: true }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `NTCStudent.service.js`,
        `update`,
        `PUT`
      );
    }
  }

  /**
   * @param {string} id  id of NTCStudent object to be deleted
   * @returns {Promise}
   * @description deletes a single NTCStudent object
   *@
   */
  static async delete(id) {
    try {
      const deleted = await models.NTCStudent.destroy({
        where: { id },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `NTCStudent.service.js`,
        `delete`,
        `DELETE`
      );
    }
  }
}

module.exports = NTCStudentService;
