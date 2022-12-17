const models = require('@models');
const { trim } = require('lodash');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for a applicantNextOfKin
class ApplicantNextOfKinService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all admission schemes or filtered using options param
   */
  static async findAllApplicantNextOfKins(options) {
    try {
      const results = await models.ApplicantNextOfKin.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applicantNextOfKin.service.js`,
        `findAllApplicantNextOfKins`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single applicantNextOfKin object basing on the options
   */
  static async findOneApplicantNextOfKin(options) {
    try {
      const applicantNextOfKin = await models.ApplicantNextOfKin.findOne({
        ...options,
      });

      return applicantNextOfKin;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applicantNextOfKin.service.js`,
        `findOneApplicantNextOfKin`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single applicantNextOfKin object from data object
   *@
   */
  static async createApplicantNextOfKin(data, transaction) {
    try {
      const applicantNextOfKin = await models.ApplicantNextOfKin.findOrCreate({
        where: {
          form_id: trim(data.form_id),
        },
        defaults: {
          ...data,
        },
        transaction,
      });

      return applicantNextOfKin;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applicantNextOfKin.service.js`,
        `createApplicantNextOfKin`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of applicantNextOfKin object to be updated
   * @returns {Promise}
   * @description updates a single applicantNextOfKin object
   *@
   */
  static async updateApplicantNextOfKin(id, data) {
    try {
      const updated = await models.ApplicantNextOfKin.update(
        { ...data },
        { where: { id }, returning: true }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applicantNextOfKin.service.js`,
        `updateApplicantNextOfKin`,
        `PUT`
      );
    }
  }
}

module.exports = ApplicantNextOfKinService;
