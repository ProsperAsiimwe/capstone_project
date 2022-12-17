const models = require('@models');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for a admissionScheme
class AdmissionSchemeService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all admission schemes or filtered using options param
   */
  static async findAllAdmissionSchemes(options) {
    try {
      const results = await models.AdmissionScheme.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `admissionScheme.service.js`,
        `findAllAdmissionSchemes`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single admissionScheme object basing on the options
   */
  static async findOneAdmissionScheme(options) {
    try {
      const admissionScheme = await models.AdmissionScheme.findOne({
        ...options,
      });

      return admissionScheme;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `admissionScheme.service.js`,
        `findOneAdmissionScheme`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single admissionScheme object from data object
   *@
   */
  static async createAdmissionScheme(data, transaction) {
    try {
      const admissionScheme = await models.AdmissionScheme.create(data, {
        transaction,
      });

      return admissionScheme;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `admissionScheme.service.js`,
        `createAdmissionScheme`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of admissionScheme object to be updated
   * @returns {Promise}
   * @description updates a single admissionScheme object
   *@
   */
  static async updateAdmissionScheme(id, data, transaction) {
    try {
      const updated = await models.AdmissionScheme.update(
        { ...data },
        { where: { id }, transaction, returning: true }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `admissionScheme.service.js`,
        `updateAdmissionScheme`,
        `PUT`
      );
    }
  }

  /**
   * @param {string} id  id of admissionScheme object to be deleted permanently
   * @returns {Promise}
   * @description deletes a single admissionScheme object permanently
   *@
   */
  static async hardDeleteAdmissionScheme(id, transaction) {
    try {
      const deleted = await models.AdmissionScheme.destroy({
        where: { id },
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `admissionScheme.service.js`,
        `hardDeleteAdmissionScheme`,
        `DELETE`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of admissionScheme object to be soft deleted
   * @returns {Promise}
   * @description soft deletes a single admissionScheme object
   *@
   */
  static async softDeleteAdmissionScheme(id, data) {
    try {
      const deleted = await models.AdmissionScheme.update(
        { ...data },
        { where: { id }, returning: false }
      );

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `admissionScheme.service.js`,
        `softDeleteAdmissionScheme`,
        `PUT`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of programmeVersionAdmissionCriteria object to be soft delete undone
   * @returns {Promise}
   * @description undoes soft delete on a single programmeVersionAdmissionCriteria object
   *@
   */
  static async undoSoftDeleteAdmissionScheme(id, data) {
    try {
      const undo = await models.AdmissionScheme.update(
        { ...data },
        { where: { id }, returning: false }
      );

      return undo;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `admissionScheme.service.js`,
        `undoSoftDeleteAdmissionScheme`,
        `PUT`
      );
    }
  }
}

module.exports = AdmissionSchemeService;
