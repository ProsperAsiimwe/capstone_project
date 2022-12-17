const models = require('@models');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for a securityProfile
class SecurityProfileService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all faculties or filtered using options param
   */
  static async findAllSecurityProfiles(options) {
    try {
      const results = await models.SecurityProfile.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `securityProfile.service.js`,
        `findAllSecurityProfiles`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single securityProfile object basing on the options
   */
  static async findOneSecurityProfile(options) {
    try {
      const securityProfile = await models.SecurityProfile.findOne({
        ...options,
      });

      return securityProfile;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `securityProfile.service.js`,
        `findOneSecurityProfile`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single securityProfile object from data object
   *@
   */
  static async createSecurityProfile(data) {
    try {
      const newSecurityProfile = await models.SecurityProfile.create({
        ...data,
      });

      return newSecurityProfile;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `securityProfile.service.js`,
        `createSecurityProfile`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of securityProfile object to be updated
   * @returns {Promise}
   * @description updates a single securityProfile object
   *@
   */
  static async updateSecurityProfile(id, data) {
    try {
      const updated = await models.SecurityProfile.update(
        { ...data },
        { where: { id }, returning: true }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `securityProfile.service.js`,
        `updateSecurityProfile`,
        `PUT`
      );
    }
  }

  /**
   * @param {string} id  id of securityProfile object to be deleted
   * @returns {Promise}
   * @description deletes a single securityProfile object
   *@
   */
  static async deleteSecurityProfile(id) {
    try {
      const deleted = await models.SecurityProfile.destroy({
        where: { id },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `securityProfile.service.js`,
        `deleteSecurityProfile`,
        `DELETE`
      );
    }
  }
}

module.exports = SecurityProfileService;
