const models = require('@models');
const { isEmpty } = require('lodash');
const { QueryTypes } = require('sequelize');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for a userRole
class RoleService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all faculties or filtered using options param
   */
  static async findAllRoles(options) {
    try {
      const results = await models.Role.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `role.service.js`,
        `findAllRoles`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all faculties or filtered using options param
   */
  static async findAllRoleBoundLevels(options) {
    try {
      const results = await models.RoleBoundLevel.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `role.service.js`,
        `findAllRoleBoundLevels`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async bulkInsertRoleBoundLevels(data, transaction) {
    try {
      const result = await models.RoleBoundLevel.bulkCreate(data, {
        transaction,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `role.service.js`,
        `bulkInsertRoleBoundLevels`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} data
   */
  static async bulkRemoveRoleBoundLevels(data, transaction) {
    try {
      const deleted = await models.RoleBoundLevel.destroy({
        where: { id: data },
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `role.service.js`,
        `bulkRemoveRoleBoundLevels`,
        `DELETE`
      );
    }
  }

  /**
   *
   * @param {*} data
   */
  static async bulkRemoveUserRoleBoundValues(data, transaction) {
    try {
      const deleted = await models.UserRoleBoundValues.destroy({
        where: { role_bound_level_id: data },
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `role.service.js`,
        `bulkRemoveUserRoleBoundValues`,
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
  static async insertNewRoleBoundLevel(data, transaction) {
    try {
      const record = await models.RoleBoundLevel.findOrCreate({
        where: {
          role_id: data.role_id,
          bound_level_id: data.bound_level_id,
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
        `role.service.js`,
        `insertNewRoleBoundLevel`,
        `POST`
      );
    }
  }

  static async findAllRolesWithApps() {
    try {
      const roles = await models.sequelize.query(
        `SELECT * FROM user_mgt.role_app_functions_view`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return roles;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `role.service.js`,
        `findAllRolesWithApps`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single userRole object basing on the options
   * data
   */
  static async findOneRole(roleId) {
    try {
      const roles = await models.sequelize.query(
        `SELECT * FROM user_mgt.user_role_app_functions(${roleId}) WHERE id = ${roleId}`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return !isEmpty(roles) ? roles[0] : roles;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `role.service.js`,
        `findOneRole`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single userRole object from data object
   *@
   */
  static async createRole(data, transaction) {
    try {
      const result = await models.Role.create(data, {
        include: [
          {
            association: models.Role.boundLevels,
          },
        ],
        transaction,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `role.service.js`,
        `createRole`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @returns
   */
  static async addUserRoles(data) {
    try {
      const result = await models.UserRole.bulkCreate(data);

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `role.service.js`,
        `addUserRoles`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @returns
   */
  static async assignRoleToUser(data, roleTitle, roleGroupTitle) {
    try {
      const result = await models.UserRole.create(data);

      return result;
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error(
          `This user has already been assigned a role of ${roleTitle} in the role group of ${roleGroupTitle}.`
        );
      } else {
        await sequelizeErrorHandler(
          error,
          `role.service.js`,
          `assignRoleToUser`,
          `POST`
        );
      }
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   * @returns
   */
  static async addRoleApps(data, transaction) {
    try {
      const result = await models.RoleUserRoleGroupApp.findOrCreate({
        where: {
          role_group_app_id: data.role_group_app_id,
          role_id: data.role_id,
        },
        defaults: {
          ...data,
        },
        include: [
          {
            association: models.RoleUserRoleGroupApp.app_functions,
          },
        ],
        transaction,
      });

      if (result[1] === false) {
        const RoleUserRoleGroupAppId = result[0].dataValues.id;

        for (const eachAppFunction of data.app_functions) {
          await models.RoleAppFunction.findOrCreate({
            where: {
              app_function_id: eachAppFunction.app_function_id,
              role_user_role_group_app_id: RoleUserRoleGroupAppId,
            },
            defaults: {
              ...eachAppFunction,
            },

            transaction,
          });
        }
      }

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `role.service.js`,
        `addRoleApps`,
        `POST`
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
  static async updateRole(id, data, transaction) {
    try {
      const updated = await models.Role.update(
        { ...data },
        { where: { id }, transaction, returning: true }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `role.service.js`,
        `updateRole`,
        `PUT`
      );
    }
  }

  /**
   * @param {string} id  id of userRole object to be deleted
   * @returns {Promise}
   * @description deletes a single userRole object
   *@
   */
  static async deleteRole(id, transaction) {
    try {
      const deleted = await models.Role.destroy({
        where: { id },
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `role.service.js`,
        `deleteRole`,
        `DELETE`
      );
    }
  }

  /**
   * @param {string} id  id of userRole object to be deleted
   * @returns {Promise}
   * @description deletes a single userRole object
   *@
   */
  static async deleteRoleBoundLevel(options, transaction) {
    try {
      const deleted = await models.RoleBoundLevel.destroy({
        ...options,
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `role.service.js`,
        `deleteRoleBoundLevel`,
        `DELETE`
      );
    }
  }

  /**
   *
   * @param {*} options
   * @returns
   */
  static async findOneRoleBoundLevel(options) {
    try {
      const results = await models.RoleBoundLevel.findOne({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `role.service.js`,
        `findOneRoleBoundLevel`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} options
   * @returns
   */
  static async findOneUserRole(options) {
    try {
      const results = await models.UserRole.findOne({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `role.service.js`,
        `findOneUserRole`,
        `GET`
      );
    }
  }

  /**
   * Delete User Roles
   * @param {*} options
   * @returns
   */
  static async deleteRoleUsers(roleId, transaction) {
    try {
      const results = await models.UserRole.destroy({
        where: { role_id: roleId },
        transaction,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `role.service.js`,
        `deleteRoleUsers`,
        `DELETE`
      );
    }
  }

  /**
   * Delete User Roles
   * @param {*} options
   * @returns
   */
  static async removeRoleFromUser(roleId, userId, transaction) {
    try {
      const results = await models.UserRole.destroy({
        where: { role_id: roleId, user_id: userId },
        transaction,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `role.service.js`,
        `removeRoleFromUser`,
        `DELETE`
      );
    }
  }

  /**
   *
   * @param {*} id
   * @param {*} data
   * @returns
   */
  static async updateUserRole(id, data) {
    try {
      const updated = await models.UserRole.update(
        { ...data },
        { where: { id }, returning: true }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `role.service.js`,
        `updateUserRole`,
        `PUT`
      );
    }
  }

  /**
   * Find Or Create User Role Bound Levels
   *
   * @param {*} options
   * @returns
   */
  static async findOrCreateUserRoleBoundLevels(condition, data, transaction) {
    try {
      const record = await models.UserRoleBoundValues.findOne({
        ...condition,
        transaction,
      }).then(function (obj) {
        // update
        if (obj) return obj.update(data);

        // insert
        return models.UserRoleBoundValues.create(data);
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `role.service.js`,
        `findOrCreateUserRoleBoundLevels`,
        `GET`
      );
    }
  }

  /**
   * Find Or Create User Role Bound Levels
   *
   * @param {*} options
   * @returns
   */
  static async bulkCreateUserBoundValues(data, type, transaction) {
    try {
      let modelName;

      if (type === 'campus') {
        modelName = 'UserBoundCampus';
      } else if (type === 'programme') {
        modelName = 'UserBoundProgramme';
      } else if (type === 'college') {
        modelName = 'UserBoundCollege';
      } else if (type === 'faculty') {
        modelName = 'UserBoundFaculty';
      } else if (type === 'department') {
        modelName = 'UserBoundDepartment';
      }
      const record = await models[modelName].bulkCreate(data, {
        transaction,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `role.service.js`,
        `bulkCreateUserBoundValues`,
        `POST`
      );
    }
  }

  /**
   * GET User Role Bound Levels
   *
   * @param {*} options
   * @returns
   */
  static async getUserBoundValues(data, type) {
    try {
      let modelName;

      if (type === 'campus') {
        modelName = 'UserBoundCampus';
      } else if (type === 'programme') {
        modelName = 'UserBoundProgramme';
      } else if (type === 'college') {
        modelName = 'UserBoundCollege';
      } else if (type === 'faculty') {
        modelName = 'UserBoundFaculty';
      } else if (type === 'department') {
        modelName = 'UserBoundDepartment';
      }
      const record = await models[modelName].findAll(data);

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `role.service.js`,
        `getUserBoundValues`,
        `POST`
      );
    }
  }

  /**
   * Find Or Create User Role Bound Levels
   *
   * @param {*} options
   * @returns
   */
  static async deleteUserBoundValues(data, type, transaction) {
    try {
      let modelName;

      if (type === 'campus') {
        modelName = 'UserBoundCampus';
      } else if (type === 'programme') {
        modelName = 'UserBoundProgramme';
      } else if (type === 'college') {
        modelName = 'UserBoundCollege';
      } else if (type === 'faculty') {
        modelName = 'UserBoundFaculty';
      } else if (type === 'department') {
        modelName = 'UserBoundDepartment';
      }
      const record = await models[modelName].destroy({
        where: { id: data },
        transaction,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `role.service.js`,
        `deleteUserBoundValues`,
        `DELETE`
      );
    }
  }

  /**
   * Find Or Create User Role Bound Levels
   *
   * @param {*} options
   * @returns
   */
  static async deleteCustomUserBoundValues(option, type, transaction) {
    try {
      let modelName;

      if (type === 'campus') {
        modelName = 'UserBoundCampus';
      } else if (type === 'programme') {
        modelName = 'UserBoundProgramme';
      } else if (type === 'college') {
        modelName = 'UserBoundCollege';
      } else if (type === 'faculty') {
        modelName = 'UserBoundFaculty';
      } else if (type === 'department') {
        modelName = 'UserBoundDepartment';
      }
      const record = await models[modelName].destroy({
        ...option,
        transaction,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `role.service.js`,
        `deleteCustomUserBoundValues`,
        `DELETE`
      );
    }
  }

  /**
   *
   * @param {*} options
   * @returns
   */
  static async findAllUserRoleBoundValues(options) {
    try {
      const results = await models.UserRoleBoundValues.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `role.service.js`,
        `findAllUserRoleBoundValues`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} options
   * @param {*} transaction
   * @returns
   */
  static async removeUserRoleBoundValues(options, transaction) {
    try {
      const deleted = await models.UserRoleBoundValues.destroy({
        ...options,
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `role.service.js`,
        `removeUserRoleBoundValues`,
        `DELETE`
      );
    }
  }

  /**
   *
   * @param {*} options
   * @param {*} transaction
   * @returns
   */
  static async removeBoundCampuses(options, transaction) {
    try {
      const deleted = await models.UserBoundCampus.destroy({
        ...options,
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `role.service.js`,
        `removeBoundCampuses`,
        `DELETE`
      );
    }
  }

  /**
   *
   * @param {*} options
   * @param {*} transaction
   * @returns
   */
  static async removeBoundProgrammes(options, transaction) {
    try {
      const deleted = await models.UserBoundProgramme.destroy({
        ...options,
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `role.service.js`,
        `removeBoundProgrammes`,
        `DELETE`
      );
    }
  }

  /**
   *
   * @param {*} options
   * @param {*} transaction
   * @returns
   */
  static async removeBoundColleges(options, transaction) {
    try {
      const deleted = await models.UserBoundCollege.destroy({
        ...options,
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `role.service.js`,
        `removeBoundColleges`,
        `DELETE`
      );
    }
  }

  /**
   *
   * @param {*} options
   * @param {*} transaction
   * @returns
   */
  static async removeBoundFaculties(options, transaction) {
    try {
      const deleted = await models.UserBoundFaculty.destroy({
        ...options,
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `role.service.js`,
        `removeBoundFaculties`,
        `DELETE`
      );
    }
  }

  /**
   *
   * @param {*} options
   * @param {*} transaction
   * @returns
   */
  static async removeBoundDepartments(options, transaction) {
    try {
      const deleted = await models.UserBoundDepartment.destroy({
        ...options,
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `role.service.js`,
        `removeBoundDepartments`,
        `DELETE`
      );
    }
  }

  /**
   *
   * @param {*} options
   * @param {*} transaction
   * @returns
   */
  static async deleteRoleAppFunctions(options, transaction) {
    try {
      const deleted = await models.RoleAppFunction.destroy({
        ...options,
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `role.service.js`,
        `deleteRoleAppFunctions`,
        `DELETE`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns one
   */
  static async findOneRoleAppFunction(options) {
    try {
      const results = await models.RoleAppFunction.findOne({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `role.service.js`,
        `findOneRoleAppFunction`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} options
   * @param {*} transaction
   * @returns
   */
  static async deleteRoleUserRoleGroupApps(options, transaction) {
    try {
      const deleted = await models.RoleUserRoleGroupApp.destroy({
        ...options,
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `role.service.js`,
        `deleteRoleUserRoleGroupApps`,
        `DELETE`
      );
    }
  }

  /**
   * Get Role User Role groups
   * @param {*} options
   * @param {*} transaction
   * @returns
   */
  static async getRoleUserRoleGroupApps(options) {
    try {
      const result = await models.RoleUserRoleGroupApp.findAll({
        ...options,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `role.service.js`,
        `getRoleUserRoleGroupApps`,
        `GET`
      );
    }
  }

  /**
   * Get Role User Role groups
   * @param {*} options
   * @param {*} transaction
   * @returns
   */
  static async findOneRoleUserRoleGroupApp(options) {
    try {
      const result = await models.RoleUserRoleGroupApp.findOne({
        ...options,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `role.service.js`,
        `findOneRoleUserRoleGroupApp`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} options
   * @param {*} transaction
   * @returns
   */
  static async deleteUserRoleGroupApps(options, transaction) {
    try {
      const deleted = await models.UserRoleGroupApp.destroy({
        ...options,
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `role.service.js`,
        `deleteUserRoleGroupApps`,
        `DELETE`
      );
    }
  }
}

module.exports = RoleService;
