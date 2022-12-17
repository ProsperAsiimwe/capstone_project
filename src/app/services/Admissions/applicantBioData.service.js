const models = require('@models');
const { trim } = require('lodash');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for a applicantBioData
class ApplicantBioDataService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all admission schemes or filtered using options param
   */
  static async findAllApplicantBioData(options) {
    try {
      const results = await models.ApplicantBioData.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applicantBioData.service.js`,
        `findAllApplicantBioData`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single applicantBioData object basing on the options
   */
  static async findOneApplicantBioData(options) {
    try {
      const applicantBioData = await models.ApplicantBioData.findOne({
        ...options,
      });

      return applicantBioData;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applicantBioData.service.js`,
        `findOneApplicantBioData`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single applicantBioData object from data object
   *@
   */
  static async createApplicantBioData(data, transaction) {
    try {
      const applicantBioData = await models.ApplicantBioData.findOrCreate({
        where: {
          form_id: trim(data.form_id),
        },
        defaults: {
          ...data,
        },
        transaction,
      });

      return applicantBioData;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applicantBioData.service.js`,
        `createApplicantBioData`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of applicantBioData object to be updated
   * @returns {Promise}
   * @description updates a single applicantBioData object
   *@
   */
  static async updateApplicantBioData(id, data, transaction) {
    try {
      const updated = await models.ApplicantBioData.update(
        { ...data },
        { where: { id }, transaction, returning: true }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applicantBioData.service.js`,
        `updateApplicantBioData`,
        `PUT`
      );
    }
  }
}

module.exports = ApplicantBioDataService;
