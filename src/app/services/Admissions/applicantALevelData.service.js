const models = require('@models');
const { trim } = require('lodash');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for a applicantALevelData
class ApplicantALevelDataService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all admission schemes or filtered using options param
   */
  static async findAllApplicantALevelData(options) {
    try {
      const results = await models.ApplicantALevelData.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applicantALevelData.service.js`,
        `findAllApplicantALevelData`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single applicantALevelData object basing on the options
   */
  static async findOneApplicantALevelData(options) {
    try {
      const applicantALevelData = await models.ApplicantALevelData.findOne({
        ...options,
      });

      return applicantALevelData;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applicantALevelData.service.js`,
        `findOneApplicantALevelData`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single applicantALevelData object from data object
   *@
   */
  static async createApplicantALevelData(data, transaction) {
    try {
      const applicantALevelData = await models.ApplicantALevelData.findOrCreate(
        {
          where: {
            form_id: trim(data.form_id),
          },
          defaults: {
            ...data,
          },
          include: [
            {
              association: models.ApplicantALevelData.subjects,
            },
          ],
          transaction,
        }
      );

      return applicantALevelData;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applicantALevelData.service.js`,
        `createApplicantALevelData`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of applicantALevelData object to be updated
   * @returns {Promise}
   * @description updates a single applicantALevelData object
   *@
   */
  static async updateApplicantALevelData(id, data, transaction) {
    try {
      const updated = await models.ApplicantALevelData.update(
        { ...data },
        { where: { id }, transaction, returning: true }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applicantALevelData.service.js`,
        `updateApplicantALevelData`,
        `PUT`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all
   */
  static async findAllApplicantALevelDataSubjects(options) {
    try {
      const results = await models.ApplicantALevelDataSubject.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applicantALevelData.service.js`,
        `findAllApplicantALevelDataSubjects`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async bulkCreateApplicantALevelDataSubjects(data, transaction) {
    try {
      const result = await models.ApplicantALevelDataSubject.bulkCreate(data, {
        transaction,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applicantALevelData.service.js`,
        `bulkCreateApplicantALevelDataSubjects`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} data
   */
  static async bulkRemoveApplicantALevelDataSubjects(data, transaction) {
    try {
      const deleted = await models.ApplicantALevelDataSubject.destroy({
        where: { id: data },
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applicantALevelData.service.js`,
        `bulkRemoveApplicantALevelDataSubjects`,
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
  static async updateApplicantALevelDataSubjects(id, data, transaction) {
    try {
      const updated = await models.ApplicantALevelDataSubject.update(
        { ...data },
        { where: { id }, transaction, returning: true }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applicantALevelData.service.js`,
        `updateApplicantALevelDataSubjects`,
        `PUT`
      );
    }
  }
}

module.exports = ApplicantALevelDataService;
