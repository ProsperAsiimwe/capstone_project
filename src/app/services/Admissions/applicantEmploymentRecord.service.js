const models = require('@models');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for a applicantEmploymentRecord
class ApplicantEmploymentRecordService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all admission schemes or filtered using options param
   */
  static async findAllApplicantEmploymentRecords(options) {
    try {
      const results = await models.ApplicantEmploymentRecord.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applicantEmploymentRecord.service.js`,
        `findAllApplicantEmploymentRecords`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single applicantEmploymentRecord object basing on the options
   */
  static async findOneApplicantEmploymentRecord(options) {
    try {
      const applicantEmploymentRecord =
        await models.ApplicantEmploymentRecord.findOne({
          ...options,
        });

      return applicantEmploymentRecord;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applicantEmploymentRecord.service.js`,
        `findOneApplicantEmploymentRecord`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single applicantEmploymentRecord object from data object
   *@
   */
  static async createApplicantEmploymentRecord(data, transaction) {
    try {
      const applicantEmploymentRecord =
        await models.ApplicantEmploymentRecord.findOrCreate({
          where: {
            employer: data.employer,
            post_held: data.post_held,
            running_admission_id: data.running_admission_id,
            applicant_id: data.applicant_id,
            form_id: data.form_id,
          },
          defaults: {
            ...data,
          },
          transaction,
        });

      return applicantEmploymentRecord;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applicantEmploymentRecord.service.js`,
        `createApplicantEmploymentRecord`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of applicantEmploymentRecord object to be updated
   * @returns {Promise}
   * @description updates a single applicantEmploymentRecord object
   *@
   */
  static async updateApplicantEmploymentRecord(id, data) {
    try {
      const updated = await models.ApplicantEmploymentRecord.update(
        { ...data },
        { where: { id }, returning: true }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applicantEmploymentRecord.service.js`,
        `updateApplicantEmploymentRecord`,
        `PUT`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of applicantEmploymentRecord object to be deleted
   * @returns {Promise}
   * @description deletes a single applicantEmploymentRecord object
   *@
   */
  static async deleteApplicantEmploymentRecord(data) {
    try {
      const deleted = await models.ApplicantEmploymentRecord.destroy({
        where: { ...data },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applicantEmploymentRecord.service.js`,
        `deleteApplicantEmploymentRecord`,
        `DELETE`
      );
    }
  }
}

module.exports = ApplicantEmploymentRecordService;
