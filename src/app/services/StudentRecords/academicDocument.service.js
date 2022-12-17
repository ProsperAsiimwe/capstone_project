const models = require('@models');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for a academicDocument
class AcademicDocumentService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all faculties or filtered using options param
   */
  static async findAll(options) {
    try {
      const results = await models.AcademicDocument.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `academicDocument.service.js`,
        `findAll`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single academicDocument object basing on the options
   */
  static async findOne(options) {
    try {
      const record = await models.AcademicDocument.findOne(options);

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `academicDocument.service.js`,
        `findOne`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single academicDocument object from data object
   *@
   */
  static async updateOrCreate(data, condition) {
    try {
      const record = await models.AcademicDocument.findOne({
        where: { student_programme_id: condition },
      }).then(function (obj) {
        // update
        if (obj) return obj.update(data);

        // insert
        return models.AcademicDocument.create(data);
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `academicDocument.service.js`,
        `updateOrCreate`,
        `PUT/POST`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of academicDocument object to be updated
   * @returns {Promise}
   * @description updates a single academicDocument object
   *@
   */
  static async updateRecord(id, data) {
    try {
      const updated = await models.AcademicDocument.update(
        { ...data },
        { where: { id }, returning: true }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `academicDocument.service.js`,
        `updateRecord`,
        `PUT`
      );
    }
  }

  /**
   * @param {string} id  id of academicDocument object to be deleted
   * @returns {Promise}
   * @description deletes a single academicDocument object
   *@
   */
  static async deleteRecord(condition, transaction) {
    try {
      const deleted = await models.AcademicDocument.destroy({
        where: condition,
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `academicDocument.service.js`,
        `deleteRecord`,
        `DELETE`
      );
    }
  }
}

module.exports = AcademicDocumentService;
