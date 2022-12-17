/* eslint-disable camelcase */
const { HttpResponse } = require('@helpers');
const { userRoleGroupService } = require('@services/index');
const { flatten, isEmpty, map, uniqBy } = require('lodash');
const model = require('@models');
const moment = require('moment');

const http = new HttpResponse();

class UserRoleGroupController {
  /**
   * GET All UserRoleGroups.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async index(req, res) {
    try {
      const userRoleGroups = await userRoleGroupService.findAllUserRoleGroups({
        include: ['apps', 'admins'],
      });

      http.setSuccess(200, 'User Role Groups fetch successful', {
        userRoleGroups,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to fetch User Role Groups', {
        error: {
          message: error.message,
        },
      });

      return http.send(res);
    }
  }

  /**
   * CREATE New UserRoleGroup Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async createUserRoleGroup(req, res) {
    try {
      const data = req.body;
      const authUserId = req.user.id;

      data.role_group_title = data.role_group_title.toUpperCase().trim();
      data.role_group_description = data.role_group_description
        .toUpperCase()
        .trim();
      const apps = [];

      data.user_role_group_apps.forEach((user_role_group_app) => {
        apps.push({
          created_by_id: authUserId,
          app_id: user_role_group_app,
        });
      });
      delete data.user_role_group_apps;

      const admins = [];

      data.group_admins.forEach((group_admin) => {
        admins.push({
          user_id: group_admin,
          admin_type: 'MAIN',
        });
      });

      data.userRoleGroupApps = apps;
      data.userRoleGroupAdmins = admins;
      data.created_by_id = authUserId;

      const userRoleGroup = await model.sequelize.transaction(
        async (transaction) => {
          const result = await userRoleGroupService.createUserRoleGroup(
            data,
            transaction
          );

          return result;
        }
      );

      http.setSuccess(201, 'User Role Groups created successfully', {
        userRoleGroup,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to create this User Role Group.', {
        message: error.message,
      });

      return http.send(res);
    }
  }

  /**
   * CREATE Role Group Apps.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async addRoleGroupApps(req, res) {
    try {
      const data = req.body;
      const { id } = req.params;
      const authUserId = req.user.id;

      const roleGroupApps = [];

      data.user_role_group_apps.forEach((roleGroup) => {
        roleGroupApps.push({
          user_role_group_id: id,
          created_by_id: authUserId,
          app_id: roleGroup,
        });
      });
      delete data.user_role_group_apps;
      data.created_by_id = authUserId;
      const apps = await userRoleGroupService.addRoleGroupApps(roleGroupApps);

      http.setSuccess(201, 'User Role Group Apps created successfully', {
        apps,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to add Role Group Apps.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * DROP Role Group Apps.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async dropRoleGroupApps(req, res) {
    try {
      const data = req.body;
      const { id } = req.params;

      if (isEmpty(data.user_role_group_apps)) {
        throw new Error('Provide a valid app IDs.');
      }
      const apps = await userRoleGroupService.dropRoleGroupApps(
        data.user_role_group_apps,
        id
      );

      http.setSuccess(201, 'User Role Group Apps removed successfully', {
        apps,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to remove Role Group Apps.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async addRoleGroupAdmin(req, res) {
    try {
      const data = req.body;
      const { id } = req.params;
      const authUserId = req.user.id;
      const formattedData = {
        created_by_id: authUserId,
        user_id: data.admin_id,
        user_role_group_id: id,
        admin_type: data.admin_type,
      };
      const apps = await userRoleGroupService.addRoleGroupAdmin(formattedData);

      http.setSuccess(201, 'User Role Group Admin created successfully', {
        apps,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to add Role Group Admin.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async removeRoleGroupAdmin(req, res) {
    try {
      const { adminContextId } = req.params;
      const authUserId = req.user.id;

      const adminRecord = await userRoleGroupService.findOneUserRoleGroupAdmin({
        where: {
          id: adminContextId,
        },
        raw: true,
      });

      if (!adminRecord) {
        throw new Error(`Unable To Find The Group Admin Chosen.`);
      }

      const authUserAccess =
        await userRoleGroupService.findOneUserRoleGroupAdmin({
          where: {
            user_role_group_id: adminRecord.user_role_group_id,
            user_id: authUserId,
          },
          raw: true,
        });

      if (!authUserAccess) {
        throw new Error(
          `You Do not have the rights to remove a group administrator.`
        );
      }

      const update = await model.sequelize.transaction(async (transaction) => {
        const response = await userRoleGroupService.updateUserRoleGroupAdmin(
          adminContextId,
          {
            deleted_at: moment.now(),
            deleted_by_id: authUserId,
          },
          transaction
        );
        const userRoleGroup = response[1][0];

        return userRoleGroup;
      });

      http.setSuccess(200, 'User Role Group Admin removed successfully', {
        data: update,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to Remove Role Group Admin.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * UPDATE Specific UserRoleGroup Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async updateUserRoleGroup(req, res) {
    try {
      const { roleGroupId } = req.params;
      const data = req.body;
      const user = req.user.id;

      data.role_group_title = data.role_group_title.toUpperCase().trim();
      data.role_group_description = data.role_group_description
        .toUpperCase()
        .trim();

      const result = await model.sequelize.transaction(async (transaction) => {
        // Handle Updating Group Apps
        if (data.user_role_group_apps) {
          const findApps = await userRoleGroupService.findAllUserRoleGroupApps({
            where: {
              user_role_group_id: roleGroupId,
            },
            attributes: ['user_role_group_id', 'app_id'],
            raw: true,
          });

          const oldList = [];
          const newList = [];

          findApps.forEach((app) => {
            oldList.push({
              user_role_group_id: parseInt(app.user_role_group_id, 10),
              app_id: parseInt(app.app_id, 10),
            });
          });

          data.user_role_group_apps.forEach((appId) => {
            newList.push({
              user_role_group_id: parseInt(roleGroupId, 10),
              app_id: parseInt(appId, 10),
            });
          });

          const deleted = [];
          const notDeleted = [];

          oldList.forEach((item) => {
            if (
              newList.some(
                (obj) =>
                  obj.user_role_group_id === item.user_role_group_id &&
                  obj.app_id === item.app_id
              )
            ) {
              notDeleted.push(item);
            } else {
              deleted.push(item);
            }
          });

          if (!isEmpty(deleted)) {
            for (const App of deleted) {
              await userRoleGroupService.deleteUserRoleGroupApp(
                {
                  where: {
                    user_role_group_id: App.user_role_group_id,
                    app_id: App.app_id,
                  },
                },
                transaction
              );
            }
          }

          if (!isEmpty(newList)) {
            for (const App of newList) {
              App.created_by_id = user;

              await userRoleGroupService.insertNewAppToRoleGroup(
                App,
                transaction
              );
            }
          }
        }

        // Handel Updating Group Admins
        if (!isEmpty(data.group_admins)) {
          const findAdmins =
            await userRoleGroupService.findAllUserRoleGroupAdmins({
              where: {
                user_role_group_id: roleGroupId,
              },
              attributes: ['user_role_group_id', 'user_id', 'admin_type'],
              raw: true,
            });

          const oldList = [];
          const newList = [];

          findAdmins.forEach((admin) => {
            oldList.push({
              user_role_group_id: parseInt(admin.user_role_group_id, 10),
              user_id: parseInt(admin.user_id, 10),
              admin_type: admin.admin_type,
            });
          });

          data.group_admins.forEach((admin) => {
            newList.push({
              user_role_group_id: parseInt(roleGroupId, 10),
              user_id: parseInt(admin.user_id, 10),
              admin_type: admin.admin_type,
            });
          });

          const deleted = [];
          const notDeleted = [];

          oldList.forEach((item) => {
            if (
              newList.some(
                (obj) =>
                  obj.user_role_group_id === item.user_role_group_id &&
                  obj.user_id === item.user_id
              )
            ) {
              notDeleted.push(item);
            } else {
              deleted.push(item);
            }
          });

          if (!isEmpty(deleted)) {
            for (const Admin of deleted) {
              await userRoleGroupService.deleteUserRoleGroupAdmin(
                {
                  where: {
                    user_role_group_id: Admin.user_role_group_id,
                    user_id: Admin.user_id,
                  },
                },
                transaction
              );
            }
          }

          if (!isEmpty(notDeleted)) {
            for (const Admin of notDeleted) {
              Admin.created_by_id = user;

              await userRoleGroupService.insertNewAdminToRoleGroup(
                Admin,
                transaction
              );
            }
          }
        }

        const updateUserRoleGroup =
          await userRoleGroupService.updateUserRoleGroup(
            roleGroupId,
            data,
            transaction
          );
        const userRoleGroup = updateUserRoleGroup[1][0];

        return userRoleGroup;
      });

      http.setSuccess(200, 'User Role Group updated successfully', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to update this User Role Group.', {
        message: error.message,
      });

      return http.send(res);
    }
  }

  /**
   * Get Specific UserRoleGroup Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async fetchUserRoleGroup(req, res) {
    try {
      const { id } = req.params;
      const userRoleGroup = await userRoleGroupService.findOneUserRoleGroup({
        where: { id },
        ...roleGroupAttributes,
      });

      http.setSuccess(200, 'User Role Group fetch successful', {
        userRoleGroup,
      });
      if (isEmpty(userRoleGroup))
        http.setError(404, 'User Role Group Data Not Found.');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to Fetch this User Role Group.', {
        error,
      });

      return http.send(res);
    }
  }

  /**
   * Destroy UserRoleGroup Data
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async deleteUserRoleGroup(req, res) {
    try {
      const { roleGroupId } = req.params;

      await userRoleGroupService.deleteUserRoleGroup(roleGroupId);
      http.setSuccess(200, 'User Role Group deleted successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to delete this User Role Group.', {
        error,
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async deleteUserRoleGroupApp(req, res) {
    try {
      const { roleGroupAppId } = req.params;

      await model.sequelize.transaction(async (transaction) => {
        await userRoleGroupService.deleteUserRoleGroupApp(
          {
            where: {
              id: roleGroupAppId,
            },
          },
          transaction
        );
      });

      http.setSuccess(200, 'User Role Group App deleted successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to delete this User Role Group App.', {
        error,
      });

      return http.send(res);
    }
  }

  // role group users

  async roleGroupUsers(req, res) {
    try {
      if (!req.params.id) {
        throw new Error('Invalid Context Provided');
      }
      const context = req.params;

      const data = await userRoleGroupService.roleGroupUsersFunction(context);

      http.setSuccess(200, 'Role Group Users fetched successfully ', {
        data: uniqBy(flatten(map(data, 'users')), 'id'),
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Role Group Users', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  // user role bound  values
  async userRoleBound(req, res) {
    try {
      if (!req.query.id || !req.query.role_id) {
        throw new Error('Invalid Context Provided');
      }
      const context = req.query;

      const data = await userRoleGroupService.userRoleBoundValues(context);

      http.setSuccess(200, 'User Role Access Domains fetched successfully ', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch User Role Access Domains ', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

/**
 *
 * @returns
 */
const roleGroupAttributes = {
  include: [
    'admins',
    {
      association: 'apps',
      include: [
        {
          association: 'appFunctions',
        },
      ],
    },
    {
      association: 'roles',
      separate: true,
      include: [
        {
          association: 'boundLevels',
          include: [
            {
              association: 'boundLevel',
              attributes: ['id', 'metadata_value'],
            },
          ],
        },
      ],
    },
  ],
};

module.exports = UserRoleGroupController;
