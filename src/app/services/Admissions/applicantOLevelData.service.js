const models = require('@models');
const { trim } = require('lodash');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for a applicantOLevelData
class ApplicantOLevelDataService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all admission schemes or filtered using options param
   */
  static async findAllApplicantOLevelData(options) {
    try {
      const results = await models.ApplicantOLevelData.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applicantOLevelData.service.js`,
        `findAllApplicantOLevelData`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single applicantOLevelData object basing on the options
   */
  static async findOneApplicantOLevelData(options) {
    try {
      const applicantOLevelData = await models.ApplicantOLevelData.findOne({
        ...options,
      });

      return applicantOLevelData;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applicantOLevelData.service.js`,
        `findOneApplicantOLevelData`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single applicantOLevelData object from data object
   *@
   */
  static async createApplicantOLevelData(data, transaction) {
    try {
      const applicantOLevelData = await models.ApplicantOLevelData.findOrCreate(
        {
          where: {
            form_id: trim(data.form_id),
          },
          defaults: {
            ...data,
          },
          include: [
            {
              association: models.ApplicantOLevelData.subjects,
            },
          ],
          transaction,
        }
      );

      return applicantOLevelData;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applicantOLevelData.service.js`,
        `createApplicantOLevelData`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of applicantOLevelData object to be updated
   * @returns {Promise}
   * @description updates a single applicantOLevelData object
   *@
   */
  static async updateApplicantOLevelData(id, data, transaction) {
    try {
      const updated = await models.ApplicantOLevelData.update(
        { ...data },
        { where: { id }, transaction, returning: true }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applicantOLevelData.service.js`,
        `updateApplicantOLevelData`,
        `PUT`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all
   */
  static async findAllApplicantOLevelDataSubjects(options) {
    try {
      const results = await models.ApplicantOLevelDataSubject.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applicantOLevelData.service.js`,
        `findAllApplicantOLevelDataSubjects`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async bulkCreateApplicantOLevelDataSubjects(data, transaction) {
    try {
      const result = await models.ApplicantOLevelDataSubject.bulkCreate(data, {
        transaction,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applicantOLevelData.service.js`,
        `bulkCreateApplicantOLevelDataSubjects`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} data
   */
  static async bulkRemoveApplicantOLevelDataSubjects(data, transaction) {
    try {
      const deleted = await models.ApplicantOLevelDataSubject.destroy({
        where: { id: data },
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applicantOLevelData.service.js`,
        `bulkRemoveApplicantOLevelDataSubjects`,
        `DELETE`
      );
    }
  }

  /**
   *
   * @param {*} id
   * @param {*} data
   * @param {*} transaction
   * @returns
   */
  static async updateApplicantOLevelDataSubjects(id, data, transaction) {
    try {
      const updated = await models.ApplicantOLevelDataSubject.update(
        { ...data },
        { where: { id }, transaction, returning: true }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applicantOLevelData.service.js`,
        `updateApplicantOLevelDataSubjects`,
        `PUT`
      );
    }
  }
}

module.exports = ApplicantOLevelDataService;
