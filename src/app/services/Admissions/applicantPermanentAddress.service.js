const models = require('@models');
const { trim } = require('lodash');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for a applicantPermanentAddress
class ApplicantPermanentAddressService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all admission schemes or filtered using options param
   */
  static async findAllApplicantPermanentAddresses(options) {
    try {
      const results = await models.ApplicantPermanentAddress.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applicantPermanentAddress.service.js`,
        `findAllApplicantPermanentAddresses`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single applicantPermanentAddress object basing on the options
   */
  static async findOneApplicantPermanentAddress(options) {
    try {
      const applicantPermanentAddress =
        await models.ApplicantPermanentAddress.findOne({
          ...options,
        });

      return applicantPermanentAddress;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applicantPermanentAddress.service.js`,
        `findOneApplicantPermanentAddress`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single applicantPermanentAddress object from data object
   *@
   */
  static async createApplicantPermanentAddress(data, transaction) {
    try {
      const applicantPermanentAddress =
        await models.ApplicantPermanentAddress.findOrCreate({
          where: {
            form_id: trim(data.form_id),
          },
          defaults: {
            ...data,
          },
          transaction,
        });

      return applicantPermanentAddress;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applicantPermanentAddress.service.js`,
        `createApplicantPermanentAddress`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of applicantPermanentAddress object to be updated
   * @returns {Promise}
   * @description updates a single applicantPermanentAddress object
   *@
   */
  static async updateApplicantPermanentAddress(id, data) {
    try {
      const updated = await models.ApplicantPermanentAddress.update(
        { ...data },
        { where: { id }, returning: true }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applicantPermanentAddress.service.js`,
        `updateApplicantPermanentAddress`,
        `PUT`
      );
    }
  }
}

module.exports = ApplicantPermanentAddressService;
