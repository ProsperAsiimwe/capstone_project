const models = require('@models');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for a applicantOtherQualification
class ApplicantOtherQualificationService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all admission schemes or filtered using options param
   */
  static async findAllApplicantOtherQualifications(options) {
    try {
      const results = await models.ApplicantOtherQualification.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applicantOtherQualification.service.js`,
        `findAllApplicantOtherQualifications`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single applicantOtherQualification object basing on the options
   */
  static async findOneApplicantOtherQualification(options) {
    try {
      const applicantOtherQualification =
        await models.ApplicantOtherQualification.findOne({
          ...options,
        });

      return applicantOtherQualification;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applicantOtherQualification.service.js`,
        `findOneApplicantOtherQualification`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single applicantOtherQualification object from data object
   *@
   */
  static async createApplicantOtherQualification(data, transaction) {
    try {
      const result = await models.ApplicantOtherQualification.findOrCreate({
        where: {
          institution_name: data.institution_name,
          award_obtained: data.award_obtained,
          award_start_date: data.award_start_date,
          award_end_date: data.award_end_date,
          running_admission_id: data.running_admission_id,
          applicant_id: data.applicant_id,
          form_id: data.form_id,
        },
        defaults: {
          ...data,
        },
        transaction,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applicantOtherQualification.service.js`,
        `createApplicantOtherQualification`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of applicantOtherQualification object to be updated
   * @returns {Promise}
   * @description updates a single applicantOtherQualification object
   *@
   */
  static async updateApplicantOtherQualification(id, data) {
    try {
      const updated = await models.ApplicantOtherQualification.update(
        { ...data },
        {
          where: {
            id,
          },
          returning: true,
        }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applicantOtherQualification.service.js`,
        `updateApplicantOtherQualification`,
        `PUT`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of applicantOtherQualification object to be updated
   * @returns {Promise}
   * @description updates a single applicantOtherQualification object
   *@
   */
  static async deleteApplicantOtherQualification(constraints) {
    try {
      const deleted = await models.ApplicantOtherQualification.destroy({
        where: constraints,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applicantOtherQualification.service.js`,
        `deleteApplicantOtherQualification`,
        `DELETE`
      );
    }
  }
}

module.exports = ApplicantOtherQualificationService;
