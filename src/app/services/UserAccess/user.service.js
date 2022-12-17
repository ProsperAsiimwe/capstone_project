const models = require('@models');
const { QueryTypes } = require('sequelize');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');
const { Op } = require('sequelize');
const { regexFunction } = require('../helper/regexHelper');

// This Class is responsible for handling all database interactions for a user
class UserService {
  /**
   * FIND All User Records;
   *
   * @param  {object} options
   * @returns {Promise}
   * @description returns all users or filtered using options param
   */
  static async findAllUsers() {
    try {
      const users = await models.sequelize.query(
        `SELECT * FROM user_mgt.user_roles_view ORDER BY surname`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return users;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `user.service.js`,
        `findAllUsers`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {user id} options
   * find user , roles, apps and app functions
   */
  // group by department
  static async findUserRoleAppFunctions(data) {
    try {
      const userRoleAppFunctions = await models.sequelize.query(
        `SELECT * FROM user_mgt.user_role_app_functions_function(${data})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return userRoleAppFunctions;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `user.service.js`,
        `findUserRoleAppFunctions`,
        `GET`
      );
    }
  }

  /**
   * Find all departments belonging to a HOD
   * @param {*} HOD
   *
   */
  static async fetchAllDepartmentsHeadedByUser(options) {
    try {
      const records = await models.Department.findAll({
        ...options,
      });

      return records;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `user.service.js`,
        `fetchAllDepartmentsHeadedByUser`,
        `GET`
      );
    }
  }

  /**
   * Find all departments belonging to a HOD
   * @param {*} HOD
   *
   */
  static async findAllUserAccountStatuses(options) {
    try {
      const records = await models.UserAccountStatus.findAll({
        ...options,
      });

      return records;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `user.service.js`,
        `findAllUserAccountStatuses`,
        `GET`
      );
    }
  }

  /**
   * FIND All Custom User Records;
   *
   * @param  {object} options
   * @returns {Promise}
   * @description returns all users or filtered using options param
   */
  static async findAllCustomUsers(options) {
    try {
      const results = await models.User.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `user.service.js`,
        `findAllCustomUsers`,
        `GET`
      );
    }
  }

  /**
   *
   *
   * @param  {object} options
   * @returns {Promise}
   * @description returns all users or filtered using options param
   */
  static async findAllUserRoles(options) {
    try {
      const results = await models.UserRole.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `user.service.js`,
        `findAllUserRoles`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   * @returns
   */
  static async insertNewUserRole(data, transaction) {
    try {
      const record = await models.UserRole.findOrCreate({
        where: {
          user_id: data.user_id,
          role_id: data.role_id,
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
        `user.service.js`,
        `insertNewUserRole`,
        `POST`
      );
    }
  }

  /**
   * FIND One User Object;clear
   *
   *
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single user object basing on the options
   */
  static async findOneUser(options) {
    try {
      const user = await models.User.findOne({
        ...options,
      });

      return user;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `user.service.js`,
        `findOneUser`,
        `GET`
      );
    }
  }

  /**
   *
   *
   *
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single user object basing on the options
   */
  static async findUserDetails(options) {
    try {
      const user = await models.UserDetails.findOne({
        ...options,
      });

      return user;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `user.service.js`,
        `findUserDetails`,
        `GET`
      );
    }
  }

  /**
   * FIND User by Email or Phone;
   *
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single user object basing on the options
   */
  static async findByEmailOrPhone(data) {
    try {
      const user = await models.User.findOne({
        where: {
          [Op.or]: [{ email: data }, { phone: data }],
        },
        attributes: {
          include: ['password'],
        },
        include: ['roles', 'roleGroups'],
        raw: true,
      });

      return user;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `user.service.js`,
        `findByEmailOrPhone`,
        `GET`
      );
    }
  }

  /**
   * CREATE New User Record;
   *
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single user object from data object
   *@
   */
  static async createUser(data, transaction) {
    try {
      const newUser = await models.User.create(data, {
        include: [
          {
            association: models.User.userDetails,
          },
          {
            association: models.User.userRoles,
          },
          {
            association: models.User.userRoleBoundValues,
          },
          {
            association: models.User.boundCampuses,
          },
          {
            association: models.User.boundProgrammes,
          },
          {
            association: models.User.boundColleges,
          },
          {
            association: models.User.boundFaculties,
          },
          {
            association: models.User.boundDepartments,
          },
        ],
        transaction,
      });

      return newUser;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `user.service.js`,
        `createUser`,
        `POST`
      );
    }
  }

  /**
   *
   *
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single user object from data object
   *@
   */
  static async createUserAccountStatus(data, transaction) {
    try {
      const record = await models.UserAccountStatus.create(data, {
        transaction,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `user.service.js`,
        `createUserAccountStatus`,
        `POST`
      );
    }
  }

  /**
   * UPDATE Users table;
   *
   * @param  {object} data id of user object to be updated
   * @returns {Promise}
   * @description updates a single user object
   *@
   */
  static async updateUser(id, data) {
    try {
      const updated = await models.User.update(
        { ...data },
        { where: { id }, returning: true, excludes: ['password'], plain: true }
      ).catch((err) => {
        throw new Error(err.message);
      });

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `user.service.js`,
        `updateUser`,
        `PUT`
      );
    }
  }

  /**
   *
   *
   * @param  {object} data id of user object to be updated
   * @returns {Promise}
   * @description updates a single user object
   *@
   */
  static async updateUserAccountStatus(id, data, transaction) {
    try {
      const updated = await models.UserAccountStatus.update(
        { ...data },
        { where: { id }, transaction, returning: true, plain: true }
      ).catch((err) => {
        throw new Error(err.message);
      });

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `user.service.js`,
        `updateUserAccountStatus`,
        `PUT`
      );
    }
  }

  /**
   *
   * @param {*} id
   * @param {*} data
   * @param {*} transaction
   * @returns
   */
  static async updateUserWithTransaction(id, data, transaction) {
    try {
      const updated = await models.User.update(
        { ...data },
        {
          where: {
            id,
          },
          transaction,
          returning: true,
          excludes: ['password'],
          plain: true,
        }
      ).catch((err) => {
        throw new Error(err.message);
      });

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `user.service.js`,
        `updateUserWithTransaction`,
        `PUT`
      );
    }
  }

  /**
   *
   * @param {*} id
   * @param {*} data
   * @param {*} transaction
   * @returns
   */
  static async updateUserDetails(id, data, transaction) {
    try {
      const updated = await models.UserDetails.update(
        {
          ...data,
        },
        {
          where: {
            id,
          },
          transaction,
          returning: true,
          plain: true,
        }
      ).catch((err) => {
        throw new Error(err.message);
      });

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `user.service.js`,
        `updateUserDetails`,
        `PUT`
      );
    }
  }

  /**
   * DELETE User Record;
   *
   * @param {string} option user object to be deleted
   * @returns {Promise}
   * @description deletes a single user object
   *@
   */
  static async deleteUser(option) {
    try {
      const deleted = await models.User.destroy({
        where: { ...option },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `user.service.js`,
        `deleteUser`,
        `DELETE`
      );
    }
  }

  /**
   *
   *
   * @param {string} option user object to be deleted
   * @returns {Promise}
   * @description deletes a single user object
   *@
   */
  static async deleteUserRole(options, transaction) {
    try {
      const deleted = await models.UserRole.destroy({
        ...options,
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `user.service.js`,
        `deleteUserRole`,
        `DELETE`
      );
    }
  }

  /** VALIDATE User by phone and Email;
   *
   * @param  {Request} req
   * @returns {String} a specific error as a response from operation.
   */
  static async invalidPhoneAndEmail(data) {
    try {
      const user = await models.User.findOne({
        where: {
          [Op.or]: [{ email: data.email }, { phone: data.phone }],
        },
        raw: true,
        attributes: ['id', 'email', 'phone'],
      });

      return user;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `user.service.js`,
        `invalidPhoneAndEmail`,
        `GET`
      );
    }
  }

  // user role programmes

  static async userRoleProgramme(data) {
    try {
      await regexFunction({ student: data });

      const filtered = await models.sequelize.query(
        `select id, role_id,user_id,programme_id from user_mgt.user_bound_programmes 
        where role_id = ${data.role_id} and user_id = ${data.user_id} and 
        programme_id  = ${data.programme_id}
        `,
        {
          type: QueryTypes.SELECT,
          plain: true,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `graduationList.service.js`,
        `testimonialResultsFunction`,
        `GET`
      );
    }
  }

  // user role programmes

  static async findUserRoleBoundLevel(data) {
    try {
      await regexFunction({ student: data });
      const filtered = await models.sequelize.query(
        `
        SELECT rbl.role_id,urbv.user_id,rbl.bound_level_id,
          ml.metadata_value as bound_level,
          urbv.role_bound_level_id, has_access_to_all

          from user_mgt.role_bound_level as rbl
          left join user_mgt.user_role_bound_values as urbv
          on urbv.role_bound_level_id = rbl.id
          left join app_mgt.metadata_values as ml
          on ml.id = rbl.bound_level_id
          where urbv.user_id =  ${data.user_id} and  rbl.role_id = ${data.role_id} and 
            ml.metadata_value = '${data.bound_level}'
        `,
        {
          type: QueryTypes.SELECT,
          plain: true,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `user.service.js`,
        `findUserRoleBoundLevel`,
        `GET`
      );
    }
  }

  // user permissions

  static async userPermissionsRequired(data) {
    try {
      await regexFunction({ student: data });
      const filtered = await models.sequelize.query(
        `select 
          ur.user_id,
          u.email,
          json_agg(
          af.function_name
              )
          from user_mgt.role_app_functions as raf
          left join user_mgt.app_functions as af
          on af.id = raf.app_function_id
          left join user_mgt.role_user_role_group_apps as ru
          on ru.id = raf.role_user_role_group_app_id
          left join user_mgt.user_roles  as ur
          on ur.role_id = ru.role_id
          left join user_mgt.users  as u
          on u.id = ur.user_id
          where ur.user_id = ${data.user_id} 
          group by ur.user_id,
          u.email
        `,
        {
          type: QueryTypes.SELECT,
          plain: true,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `user.service.js`,
        `userPermissionsRequired`,
        `GET`
      );
    }
  }
}

module.exports = UserService;
