const models = require('@models');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for a applicantBachelorsQualification
class ApplicantBachelorsQualificationService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all admission schemes or filtered using options param
   */
  static async findAllApplicantBachelorsQualifications(options) {
    try {
      const results = await models.ApplicantBachelorsQualification.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applicantBachelorsQualification.service.js`,
        `findAllApplicantBachelorsQualifications`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single applicantBachelorsQualification object basing on the options
   */
  static async findOneApplicantBachelorsQualification(options) {
    try {
      const applicantBachelorsQualification =
        await models.ApplicantBachelorsQualification.findOne({
          ...options,
        });

      return applicantBachelorsQualification;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applicantBachelorsQualification.service.js`,
        `findOneApplicantBachelorsQualification`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single applicantBachelorsQualification object from data object
   *@
   */
  static async createApplicantBachelorsQualification(data, transaction) {
    try {
      const result = await models.ApplicantBachelorsQualification.findOrCreate({
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
        `applicantBachelorsQualification.service.js`,
        `createApplicantBachelorsQualification`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of applicantBachelorsQualification object to be updated
   * @returns {Promise}
   * @description updates a single applicantBachelorsQualification object
   *@
   */
  static async updateApplicantBachelorsQualification(id, data) {
    try {
      const updated = await models.ApplicantBachelorsQualification.update(
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
        `applicantBachelorsQualification.service.js`,
        `updateApplicantBachelorsQualification`,
        `PUT`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of applicantBachelorsQualification object to be updated
   * @returns {Promise}
   * @description updates a single applicantBachelorsQualification object
   *@
   */
  static async deleteApplicantBachelorsQualification(constraints) {
    try {
      const deleted = await models.ApplicantBachelorsQualification.destroy({
        where: constraints,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applicantBachelorsQualification.service.js`,
        `deleteApplicantBachelorsQualification`,
        `DELETE`
      );
    }
  }
}

module.exports = ApplicantBachelorsQualificationService;
