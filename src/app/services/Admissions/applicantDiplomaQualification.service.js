const models = require('@models');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for a applicantDiplomaQualification
class ApplicantDiplomaQualificationService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all admission schemes or filtered using options param
   */
  static async findAllApplicantDiplomaQualifications(options) {
    try {
      const results = await models.ApplicantDiplomaQualification.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applicantDiplomaQualification.service.js`,
        `findAllApplicantDiplomaQualifications`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single applicantDiplomaQualification object basing on the options
   */
  static async findOneApplicantDiplomaQualification(options) {
    try {
      const applicantDiplomaQualification =
        await models.ApplicantDiplomaQualification.findOne({
          ...options,
        });

      return applicantDiplomaQualification;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applicantDiplomaQualification.service.js`,
        `findOneApplicantDiplomaQualification`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single applicantDiplomaQualification object from data object
   *@
   */
  static async createApplicantDiplomaQualification(data, transaction) {
    try {
      const result = await models.ApplicantDiplomaQualification.findOrCreate({
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
        `applicantDiplomaQualification.service.js`,
        `createApplicantDiplomaQualification`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of applicantDiplomaQualification object to be updated
   * @returns {Promise}
   * @description updates a single applicantDiplomaQualification object
   *@
   */
  static async updateApplicantDiplomaQualification(id, data) {
    try {
      const updated = await models.ApplicantDiplomaQualification.update(
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
        `applicantDiplomaQualification.service.js`,
        `updateApplicantDiplomaQualification`,
        `PUT`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of applicantDiplomaQualification object to be updated
   * @returns {Promise}
   * @description updates a single applicantDiplomaQualification object
   *@
   */
  static async deleteApplicantDiplomaQualification(constraints) {
    try {
      const deleted = await models.ApplicantDiplomaQualification.destroy({
        where: constraints,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applicantDiplomaQualification.service.js`,
        `deleteApplicantDiplomaQualification`,
        `DELETE`
      );
    }
  }
}

module.exports = ApplicantDiplomaQualificationService;
