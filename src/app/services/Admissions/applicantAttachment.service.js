const models = require('@models');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for a applicantAttachment
class ApplicantAttachmentService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all admission schemes or filtered using options param
   */
  static async findAllApplicantAttachments(options) {
    try {
      const results = await models.ApplicantAttachment.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applicantAttachment.service.js`,
        `findAllApplicantAttachments`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single applicantAttachment object basing on the options
   */
  static async findOneApplicantAttachment(options) {
    try {
      const applicantAttachment = await models.ApplicantAttachment.findOne({
        ...options,
      });

      return applicantAttachment;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applicantAttachment.service.js`,
        `findOneApplicantAttachment`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single applicantAttachment object from data object
   *@
   */
  static async createApplicantAttachment(data, transaction) {
    try {
      const applicantAttachment = await models.ApplicantAttachment.bulkCreate(
        data,
        {
          returning: true,
          transaction,
        }
      );

      return applicantAttachment;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applicantAttachment.service.js`,
        `createApplicantAttachment`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of applicantAttachment object to be updated
   * @returns {Promise}
   * @description updates a single applicantAttachment object
   *@
   */
  static async updateApplicantAttachment(id, data) {
    try {
      const updated = await models.ApplicantAttachment.update(
        { ...data },
        { where: { id }, returning: true }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applicantAttachment.service.js`,
        `updateApplicantAttachment`,
        `PUT`
      );
    }
  }

  /**
   *
   * @param {*} id
   * @returns
   */
  static async deleteApplicantAttachment(id) {
    try {
      const deleted = await models.ApplicantAttachment.destroy({
        where: { id },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applicantAttachment.service.js`,
        `deleteApplicantAttachment`,
        `DELETE`
      );
    }
  }
}

module.exports = ApplicantAttachmentService;
