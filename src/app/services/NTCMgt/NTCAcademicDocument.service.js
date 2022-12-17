const models = require('@models');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for a academicDocument
class NTCAcademicDocumentService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all faculties or filtered using options param
   */
  static async findAll(options) {
    try {
      const academicDocuments = await models.NTCAcademicDocument.findAll({
        ...options,
      });

      return academicDocuments;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `NTCAcademicDocument.service.js`,
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
      const academicDocument = await models.NTCAcademicDocument.findOne({
        ...options,
      });

      return academicDocument;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `NTCAcademicDocument.service.js`,
        `findOne`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single academicDocument object basing on the options
   */
  static async updateOrCreate(condition, data) {
    try {
      const academicDocument = await models.NTCAcademicDocument.findOne({
        where: condition,
      }).then(function (obj) {
        // update
        if (obj) return obj.update(data);

        // insert
        return models.NTCAcademicDocument.create(data);
      });

      return academicDocument;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `NTCAcademicDocument.service.js`,
        `updateOrCreate`,
        `PUT/POST`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single academicDocument object from data object
   *@
   */
  static async create(data, transaction) {
    try {
      const academicDocument = await models.NTCAcademicDocument.findOrCreate({
        where: {
          ntc_subject_code: data.ntc_subject_code,
        },
        defaults: { ...data },
        transaction,
      });

      if (academicDocument[1] === false) {
        throw new Error(
          `Subject With Code ${data.ntc_subject_code} Already Exists.`
        );
      } else {
        return academicDocument[0];
      }
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `NTCAcademicDocument.service.js`,
        `create`,
        `POST`
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
  static async update(id, data) {
    try {
      const academicDocument = await models.NTCAcademicDocument.update(
        { ...data },
        { where: { id }, returning: true }
      );

      return academicDocument;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `NTCAcademicDocument.service.js`,
        `update`,
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
  static async delete(id) {
    try {
      const deleted = await models.NTCAcademicDocument.destroy({
        where: { id },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `NTCAcademicDocument.service.js`,
        `delete`,
        `DELETE`
      );
    }
  }
}

module.exports = NTCAcademicDocumentService;
