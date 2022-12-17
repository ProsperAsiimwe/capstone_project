const models = require('@models');
const { QueryTypes } = require('sequelize');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for a userRoleGroup
class UserRoleGroupService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all faculties or filtered using options param
   */
  static async findAllUserRoleGroups(options) {
    try {
      const results = await models.UserRoleGroup.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `userRoleGroup.service.js`,
        `findAllUserRoleGroups`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all faculties or filtered using options param
   */
  static async findAllUserRoleGroupApps(options) {
    try {
      const results = await models.UserRoleGroupApp.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `userRoleGroup.service.js`,
        `findAllUserRoleGroupApps`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all faculties or filtered using options param
   */
  static async findAllUserRoleGroupAdmins(options) {
    try {
      const results = await models.UserRoleGroupAdmin.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `userRoleGroup.service.js`,
        `findAllUserRoleGroupAdmins`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all faculties or filtered using options param
   */
  static async findOneUserRoleGroupAdmin(options) {
    try {
      const results = await models.UserRoleGroupAdmin.findOne({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `userRoleGroup.service.js`,
        `findOneUserRoleGroupAdmin`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single userRoleGroup object basing on the options
   */
  static async findOneUserRoleGroup(options) {
    try {
      const userRoleGroup = await models.UserRoleGroup.findOne({
        ...options,
      });

      return userRoleGroup;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `userRoleGroup.service.js`,
        `findOneUserRoleGroup`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single userRoleGroup object from data object
   *@
   */
  static async createUserRoleGroup(data, transaction) {
    try {
      const newUserRoleGroup = await models.UserRoleGroup.create(data, {
        include: [
          {
            association: models.UserRoleGroup.userRoleGroupApps,
          },
          {
            association: models.UserRoleGroup.userRoleGroupAdmins,
          },
        ],
        transaction,
      });

      return newUserRoleGroup;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `userRoleGroup.service.js`,
        `createUserRoleGroup`,
        `POST`
      );
    }
  }

  static async addRoleGroupApps(data) {
    try {
      const roleGroupApps = await models.UserRoleGroupApp.bulkCreate(data, {
        raw: true,
      });

      return roleGroupApps;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `userRoleGroup.service.js`,
        `addRoleGroupApps`,
        `POST`
      );
    }
  }

  static async dropRoleGroupApps(data, id) {
    try {
      const roleGroupApps = await models.UserRoleGroupApp.destroy({
        raw: true,
        where: {
          app_id: data,
          user_role_group_id: id,
        },
      });

      return roleGroupApps;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `userRoleGroup.service.js`,
        `dropRoleGroupApps`,
        `DELETE`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   * @returns
   */
  static async insertNewAppToRoleGroup(data, transaction) {
    try {
      const record = await models.UserRoleGroupApp.findOrCreate({
        where: {
          user_role_group_id: data.user_role_group_id,
          app_id: data.app_id,
        },
        defaults: {
          ...data,
        },
        transaction,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `userRoleGroup.service.js`,
        `insertNewAppToRoleGroup`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   * @returns
   */
  static async insertNewAdminToRoleGroup(data, transaction) {
    try {
      const record = await models.UserRoleGroupAdmin.findOrCreate({
        where: {
          user_role_group_id: data.user_role_group_id,
          user_id: data.user_id,
        },
        defaults: {
          ...data,
        },
        transaction,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `userRoleGroup.service.js`,
        `insertNewAdminToRoleGroup`,
        `POST`
      );
    }
  }

  static async addRoleGroupAdmin(data) {
    try {
      const roleGroupAdmin = await models.UserRoleGroupAdmin.create(data, {
        raw: true,
      });

      return roleGroupAdmin;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `userRoleGroup.service.js`,
        `addRoleGroupAdmin`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of userRoleGroup object to be updated
   * @returns {Promise}
   * @description updates a single userRoleGroup object
   *@
   */
  static async updateUserRoleGroupAdmin(id, data, transaction) {
    try {
      const updated = await models.UserRoleGroupAdmin.update(
        { ...data },
        { where: { id }, transaction, returning: true }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `userRoleGroup.service.js`,
        `updateUserRoleGroupAdmin`,
        `PUT`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of userRoleGroup object to be updated
   * @returns {Promise}
   * @description updates a single userRoleGroup object
   *@
   */
  static async updateUserRoleGroup(id, data, transaction) {
    try {
      const updated = await models.UserRoleGroup.update(
        { ...data },
        { where: { id }, transaction, returning: true }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `userRoleGroup.service.js`,
        `updateUserRoleGroup`,
        `PUT`
      );
    }
  }

  /**
   * @param {string} id  id of userRoleGroup object to be deleted
   * @returns {Promise}
   * @description deletes a single userRoleGroup object
   *@
   */
  static async deleteUserRoleGroup(id) {
    try {
      const deleted = await models.UserRoleGroup.destroy({
        where: { id },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `userRoleGroup.service.js`,
        `deleteUserRoleGroup`,
        `DELETE`
      );
    }
  }

  /**
   * @param {string} id  id of userRoleGroup object to be deleted
   * @returns {Promise}
   * @description deletes a single userRoleGroup object
   *@
   */
  static async deleteUserRoleGroupApp(options, transaction) {
    try {
      const deleted = await models.UserRoleGroupApp.destroy({
        ...options,
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `userRoleGroup.service.js`,
        `deleteUserRoleGroupApp`,
        `DELETE`
      );
    }
  }

  /**
   * @param {string} id  id of userRoleGroup object to be deleted
   * @returns {Promise}
   * @description deletes a single userRoleGroup object
   *@
   */
  static async deleteUserRoleGroupAdmin(options, transaction) {
    try {
      const deleted = await models.UserRoleGroupAdmin.destroy({
        ...options,
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `userRoleGroup.service.js`,
        `deleteUserRoleGroupAdmin`,
        `DELETE`
      );
    }
  }

  // role group users
  /**
   *
   * @param {*} data
   * @returns
   *
   * role_group_users_function 1
   * user_group_function 2
   */
  static async roleGroupUsersFunction(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from user_mgt.role_group_user(${data.id})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `userRoleGroup.service.js`,
        `roleGroupUsersFunction`,
        `GET`
      );
    }
  }

  // user role bound values
  static async userRoleBoundValues(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from user_mgt.user_bound_values(${data.id},${data.role_id})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `userRoleGroup.service.js`,
        `userRoleBoundValues`,
        `GET`
      );
    }
  }

  static async userBoundValueFunctions(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from user_mgt.user_bound_values_function(${data.id},${data.roleId})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `userRoleGroup.service.js`,
        `userBoundValueFunctions`,
        `GET`
      );
    }
  }
}

module.exports = UserRoleGroupService;
