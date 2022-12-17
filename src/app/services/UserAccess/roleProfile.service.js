const models = require('@models');
const { QueryTypes } = require('sequelize');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible  list all user roles and their profiles
class RoleProfileService {
  /**
   *
   * @param {*} options
   * @description returns all roles and their profiles
   */

  static async findAllRoleWithProfiles() {
    try {
      const records = await models.sequelize.query(
        `select * from user_mgt.profile_app_functions_view`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return records;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `roleProfile.service.js`,
        `findAllRoleWithProfiles`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single userRole object basing on the options
   */
  static async findOneRoleProfile(options) {
    try {
      const userRole = await models.Role.findOne({
        ...options,
      });

      return userRole;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `roleProfile.service.js`,
        `findOneRoleProfile`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of userRole object to be updated
   * @returns {Promise}
   * @description updates a single userRole object
   *@
   */
  static async updateRoleProfile(id, data) {
    try {
      const updated = await models.Role.update(
        { ...data },
        { where: { id }, returning: true }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `roleProfile.service.js`,
        `updateRoleProfile`,
        `PUT`
      );
    }
  }
}

module.exports = RoleProfileService;
