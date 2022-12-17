const models = require('@models');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for a applicantMastersQualification
class ApplicantMastersQualificationService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all admission schemes or filtered using options param
   */
  static async findAllApplicantMastersQualifications(options) {
    try {
      const results = await models.ApplicantMastersQualification.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applicantMastersQualification.service.js`,
        `findAllApplicantMastersQualifications`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single applicantMastersQualification object basing on the options
   */
  static async findOneApplicantMastersQualification(options) {
    try {
      const applicantMastersQualification =
        await models.ApplicantMastersQualification.findOne({
          ...options,
        });

      return applicantMastersQualification;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applicantMastersQualification.service.js`,
        `findOneApplicantMastersQualification`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single applicantMastersQualification object from data object
   *@
   */
  static async createApplicantMastersQualification(data, transaction) {
    try {
      const result = await models.ApplicantMastersQualification.findOrCreate({
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
        `applicantMastersQualification.service.js`,
        `createApplicantMastersQualification`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of applicantMastersQualification object to be updated
   * @returns {Promise}
   * @description updates a single applicantMastersQualification object
   *@
   */
  static async updateApplicantMastersQualification(id, data) {
    try {
      const updated = await models.ApplicantMastersQualification.update(
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
        `applicantMastersQualification.service.js`,
        `updateApplicantMastersQualification`,
        `PUT`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of applicantMastersQualification object to be updated
   * @returns {Promise}
   * @description updates a single applicantMastersQualification object
   *@
   */
  static async deleteApplicantMastersQualification(constraints) {
    try {
      const deleted = await models.ApplicantMastersQualification.destroy({
        where: constraints,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applicantMastersQualification.service.js`,
        `deleteApplicantMastersQualification`,
        `DELETE`
      );
    }
  }
}

module.exports = ApplicantMastersQualificationService;
