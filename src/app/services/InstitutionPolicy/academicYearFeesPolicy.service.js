const models = require('@models');
const { QueryTypes } = require('sequelize');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for this entity
class AcademicYearFeesPolicyService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all records or filtered using options param
   */
  static async findAllRecords(options) {
    try {
      const records = await models.AcademicYearFeesPolicy.findAll({
        ...options,
      });

      return records;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `academicYearFeesPolicy.service.js`,
        `findAllRecords`,
        `GET`
      );
    }
  }

  // all AcademicYearFeesPolicy

  static async fectchAllRecords(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from fees_mgt.academic_fees_policy`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `academicYearFeesPolicy.service.js`,
        `fectchAllRecords`,
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
      const record = await models.AcademicYearFeesPolicy.findOne({
        ...options,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `academicYearFeesPolicy.service.js`,
        `findOneRecord`,
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
  static async createAcademicYearFeesPolicyRecord(data) {
    try {
      const result = await models.AcademicYearFeesPolicy.findOrCreate({
        where: {
          fees_category_id: data.fees_category_id,
          enrollment_status_id: data.enrollment_status_id,
        },
        defaults: {
          ...data,
        },
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `academicYearFeesPolicy.service.js`,
        `createAcademicYearFeesPolicyRecord`,
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
  static async updateRecord(id, data) {
    try {
      const record = await models.AcademicYearFeesPolicy.update(
        { ...data },
        { where: { id }, returning: true }
      );

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `academicYearFeesPolicy.service.js`,
        `updateRecord`,
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
  static async deleteRecord(id) {
    try {
      const deleted = await models.AcademicYearFeesPolicy.destroy({
        where: { id },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `academicYearFeesPolicy.service.js`,
        `deleteRecord`,
        `DELETE`
      );
    }
  }
}

module.exports = AcademicYearFeesPolicyService;
