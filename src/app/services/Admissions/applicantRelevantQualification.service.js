const models = require('@models');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for a applicantRelevantQualification
class ApplicantRelevantQualificationService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all admission schemes or filtered using options param
   */
  static async findAllApplicantRelevantQualifications(options) {
    try {
      const results = await models.ApplicantRelevantQualification.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applicantRelevantQualification.service.js`,
        `findAllApplicantRelevantQualifications`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single applicantRelevantQualification object basing on the options
   */
  static async findOneApplicantRelevantQualification(options) {
    try {
      const applicantRelevantQualification =
        await models.ApplicantRelevantQualification.findOne({
          ...options,
        });

      return applicantRelevantQualification;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applicantRelevantQualification.service.js`,
        `findOneApplicantRelevantQualification`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single applicantRelevantQualification object from data object
   *@
   */
  static async createApplicantRelevantQualification(data, transaction) {
    try {
      const result = await models.ApplicantRelevantQualification.findOrCreate({
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
        `applicantRelevantQualification.service.js`,
        `createApplicantRelevantQualification`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of applicantRelevantQualification object to be updated
   * @returns {Promise}
   * @description updates a single applicantRelevantQualification object
   *@
   */
  static async updateApplicantRelevantQualification(id, data) {
    try {
      const updated = await models.ApplicantRelevantQualification.update(
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
        `applicantRelevantQualification.service.js`,
        `updateApplicantRelevantQualification`,
        `PUT`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of applicantRelevantQualification object to be updated
   * @returns {Promise}
   * @description updates a single applicantRelevantQualification object
   *@
   */
  static async deleteApplicantRelevantQualification(constraints) {
    try {
      const deleted = await models.ApplicantRelevantQualification.destroy({
        where: constraints,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applicantRelevantQualification.service.js`,
        `deleteApplicantRelevantQualification`,
        `DELETE`
      );
    }
  }
}

module.exports = ApplicantRelevantQualificationService;
