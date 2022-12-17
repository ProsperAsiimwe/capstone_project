const models = require('@models');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for a applicantCertificateQualification
class ApplicantCertificateQualificationService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all admission schemes or filtered using options param
   */
  static async findAllApplicantCertificateQualifications(options) {
    try {
      const results = await models.ApplicantCertificateQualification.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applicantCertificateQualification.service.js`,
        `findAllApplicantCertificateQualifications`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single applicantCertificateQualification object basing on the options
   */
  static async findOneApplicantCertificateQualification(options) {
    try {
      const applicantCertificateQualification =
        await models.ApplicantCertificateQualification.findOne({
          ...options,
        });

      return applicantCertificateQualification;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applicantCertificateQualification.service.js`,
        `findOneApplicantCertificateQualification`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single applicantCertificateQualification object from data object
   *@
   */
  static async createApplicantCertificateQualification(data, transaction) {
    try {
      const result =
        await models.ApplicantCertificateQualification.findOrCreate({
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
        `applicantCertificateQualification.service.js`,
        `createApplicantCertificateQualification`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of applicantCertificateQualification object to be updated
   * @returns {Promise}
   * @description updates a single applicantCertificateQualification object
   *@
   */
  static async updateApplicantCertificateQualification(id, data) {
    try {
      const updated = await models.ApplicantCertificateQualification.update(
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
        `applicantCertificateQualification.service.js`,
        `updateApplicantCertificateQualification`,
        `PUT`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of applicantCertificateQualification object to be updated
   * @returns {Promise}
   * @description updates a single applicantCertificateQualification object
   *@
   */
  static async deleteApplicantCertificateQualification(constraints) {
    try {
      const deleted = await models.ApplicantCertificateQualification.destroy({
        where: constraints,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applicantCertificateQualification.service.js`,
        `deleteApplicantCertificateQualification`,
        `DELETE`
      );
    }
  }
}

module.exports = ApplicantCertificateQualificationService;
