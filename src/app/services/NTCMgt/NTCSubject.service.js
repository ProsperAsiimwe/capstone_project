const models = require('@models');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for a subject
class NTCSubjectService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all faculties or filtered using options param
   */
  static async findAll(options) {
    try {
      const results = await models.NTCSubject.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `NTCSubject.service.js`,
        `findAll`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single subject object basing on the options
   */
  static async findOne(options) {
    try {
      const subject = await models.NTCSubject.findOne({ ...options });

      return subject;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `NTCSubject.service.js`,
        `findOne`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single subject object from data object
   *@
   */
  static async create(data, transaction) {
    try {
      const result = await models.NTCSubject.findOrCreate({
        where: {
          ntc_subject_code: data.ntc_subject_code,
        },
        defaults: { ...data },
        transaction,
      });

      if (result[1] === false) {
        throw new Error(
          `Subject With Code ${data.ntc_subject_code} Already Exists.`
        );
      } else {
        return result[0];
      }
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `NTCSubject.service.js`,
        `create`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of subject object to be updated
   * @returns {Promise}
   * @description updates a single subject object
   *@
   */
  static async update(id, data) {
    try {
      const updated = await models.NTCSubject.update(
        { ...data },
        { where: { id }, returning: true }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `NTCSubject.service.js`,
        `update`,
        `PUT`
      );
    }
  }

  /**
   * @param {string} id  id of subject object to be deleted
   * @returns {Promise}
   * @description deletes a single subject object
   *@
   */
  static async delete(id) {
    try {
      const deleted = await models.NTCSubject.destroy({
        where: { id },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `NTCSubject.service.js`,
        `delete`,
        `DELETE`
      );
    }
  }
}

module.exports = NTCSubjectService;
