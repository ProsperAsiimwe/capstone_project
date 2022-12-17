const models = require('@models');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for a deletedAdmittedApplicant
class DeletedAdmittedApplicantService {
  /**
   * FIND All DeletedAdmittedApplicant Records;
   *
   * @param  {object} options
   * @returns {Promise}
   * @description returns all admittedApplicants or filtered using options param
   */
  static async findAllAdmittedApplicants(options) {
    try {
      const result = await models.DeletedAdmittedApplicant.findAll({
        ...options,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `deletedAdmittedApplicant.service.js`,
        `findAllAdmittedApplicants`,
        `GET`
      );
    }
  }

  /**
   * FIND One DeletedAdmittedApplicant Object;clear
   *
   *
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single deletedAdmittedApplicant object basing on the options
   */
  static async findOneAdmittedApplicant(options) {
    try {
      const result = await models.DeletedAdmittedApplicant.findOne({
        ...options,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `deletedAdmittedApplicant.service.js`,
        `findOneAdmittedApplicant`,
        `GET`
      );
    }
  }

  /**
   * CREATE
   *
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single deletedAdmittedApplicant object from data object
   *@
   */
  static async create(data, transaction) {
    try {
      const result = await models.DeletedAdmittedApplicant.create(data, {
        transaction,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `deletedAdmittedApplicant.service.js`,
        `create`,
        `POST`
      );
    }
  }

  /**
   * DELETE DeletedAdmittedApplicant Record;
   *
   * @param {string} option deletedAdmittedApplicant object to be deleted
   * @returns {Promise}
   * @description deletes a single deletedAdmittedApplicant object
   *@
   */
  static async deleteAdmittedApplicant(option) {
    try {
      const deleted = await models.DeletedAdmittedApplicant.destroy({
        where: { ...option },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `deletedAdmittedApplicant.service.js`,
        `deleteAdmittedApplicant`,
        `DELETE`
      );
    }
  }
}

module.exports = DeletedAdmittedApplicantService;
