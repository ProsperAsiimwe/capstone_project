const models = require('@models');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for a applicantRefereeDetail
class ApplicantRefereeDetailService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all admission schemes or filtered using options param
   */
  static async findAllApplicantRefereeDetails(options) {
    try {
      const results = await models.ApplicantRefereeDetail.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applicantRefereeDetail.service.js`,
        `findAllApplicantRefereeDetails`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single applicantRefereeDetail object basing on the options
   */
  static async findOneApplicantRefereeDetail(options) {
    try {
      const applicantRefereeDetail =
        await models.ApplicantRefereeDetail.findOne({
          ...options,
        });

      return applicantRefereeDetail;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applicantRefereeDetail.service.js`,
        `findOneApplicantRefereeDetail`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single applicantRefereeDetail object from data object
   *@
   */
  static async createApplicantRefereeDetail(data, transaction) {
    try {
      const applicantRefereeDetail =
        await models.ApplicantRefereeDetail.findOrCreate({
          where: {
            referee_name: data.referee_name,
            referee_address: data.referee_address,
            running_admission_id: data.running_admission_id,
            applicant_id: data.applicant_id,
            form_id: data.form_id,
          },
          defaults: { ...data },
          transaction,
        });

      return applicantRefereeDetail;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applicantRefereeDetail.service.js`,
        `createApplicantRefereeDetail`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of applicantRefereeDetail object to be updated
   * @returns {Promise}
   * @description updates a single applicantRefereeDetail object
   *@
   */
  static async updateApplicantRefereeDetail(id, data) {
    try {
      const updated = await models.ApplicantRefereeDetail.update(
        { ...data },
        { where: { id }, returning: true }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applicantRefereeDetail.service.js`,
        `updateApplicantRefereeDetail`,
        `PUT`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of applicantRefereeDetail object to be deleted
   * @returns {Promise}
   * @description deletes a single applicantRefereeDetail object
   *@
   */
  static async deleteApplicantRefereeDetail(data) {
    try {
      const deleted = await models.ApplicantRefereeDetail.destroy({
        where: { ...data },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applicantRefereeDetail.service.js`,
        `deleteApplicantRefereeDetail`,
        `DELETE`
      );
    }
  }
}

module.exports = ApplicantRefereeDetailService;
