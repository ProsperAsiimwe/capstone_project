const models = require('@models');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for a department
class UnebSubjectService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all faculties or filtered using options param
   */
  static async findAllUnebSubjects(options) {
    try {
      const results = await models.UnebSubject.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `unebSubject.service.js`,
        `findAllUnebSubjects`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single department object basing on the options
   */
  static async findOneUnebSubject(options) {
    try {
      const department = await models.UnebSubject.findOne({ ...options });

      return department;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `unebSubject.service.js`,
        `findOneUnebSubject`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single department object from data object
   *@
   */
  static async createUnebSubject(data, transaction) {
    try {
      const result = await models.UnebSubject.findOrCreate({
        where: {
          uneb_subject_code: data.uneb_subject_code,
        },
        defaults: { ...data },
        transaction,
      });

      if (result[1] === false) {
        throw new Error(
          `Subject With Code ${data.uneb_subject_code} Already Exists.`
        );
      } else {
        return result[0];
      }

      // if (result[1] === false) {
      //   const update = await models.UnebSubject.update(
      //     { ...data },
      //     { where: { id: result[0].dataValues.id }, transaction, returning: true }
      //   );

      //   return update[1][0];
      // } else {
      //   return result[0];
      // }
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `unebSubject.service.js`,
        `createUnebSubject`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of department object to be updated
   * @returns {Promise}
   * @description updates a single department object
   *@
   */
  static async updateUnebSubject(id, data) {
    try {
      const updated = await models.UnebSubject.update(
        { ...data },
        { where: { id }, returning: true }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `unebSubject.service.js`,
        `updateUnebSubject`,
        `PUT`
      );
    }
  }

  /**
   * @param {string} id  id of department object to be deleted
   * @returns {Promise}
   * @description deletes a single department object
   *@
   */
  static async deleteUnebSubject(id) {
    try {
      const deleted = await models.UnebSubject.destroy({
        where: { id },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `unebSubject.service.js`,
        `deleteUnebSubject`,
        `DELETE`
      );
    }
  }
}

module.exports = UnebSubjectService;
