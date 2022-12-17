const { HttpResponse } = require('@helpers');
const {
  userRoleService,
  metadataService,
  roleService,
  institutionStructureService,
} = require('@services/index');
const {
  isEmpty,
  find,
  includes,
  toUpper,
  map,
  capitalize,
  uniq,
  difference,
} = require('lodash');
const moment = require('moment');
const model = require('@models');
const {
  getMetadataValueIdFromName,
} = require('@controllers/Helpers/programmeHelper');
const { plural } = require('pluralize');

const http = new HttpResponse();

class RoleController {
  /**
   * GET All Roles.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async index(req, res) {
    try {
      const userRoles = await userRoleService.findAllRolesWithApps();

      http.setSuccess(200, 'Roles Fetched Successfully', {
        userRoles,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Roles', {
        error: {
          message: error.message,
        },
      });

      return http.send(res);
    }
  }

  /**
   * CREATE New Role Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async createRole(req, res) {
    try {
      let data = req.body;

      const user = req.user.id;

      data.created_by_id = user;

      const roleUserRoleGroupApps = [];
      const boundLevels = [];

      if (!isEmpty(data.role_apps)) {
        data.role_apps.forEach((app) => {
          const appFunctions = [];

          app.app_functions.forEach((appFunction) => {
            appFunctions.push({
              app_function_id: appFunction,
              created_by_id: user,
            });
          });

          roleUserRoleGroupApps.push({
            role_group_app_id: app.application_id,
            app_functions: appFunctions,
            created_by_id: user,
          });
        });
      }

      if (!isEmpty(data.bound_levels)) {
        data.bound_levels.forEach((boundLevel) => {
          boundLevels.push({
            bound_level_id: boundLevel,
            created_by_id: user,
          });
        });
      }

      data = {
        ...data,
        role_code: data.role_code.toUpperCase().trim(),
        role_title: data.role_title.toUpperCase().trim(),
        roleApps: roleUserRoleGroupApps,
        boundLevels: boundLevels,
      };

      const userRole = await model.sequelize.transaction(
        async (transaction) => {
          const result = await userRoleService.createRole(data, transaction);

          return result;
        }
      );

      http.setSuccess(200, 'Role created successfully', {
        data: userRole,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to create this Role.', {
        error: {
          message: error.message,
        },
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
  async addRoleAppsWithFunctions(req, res) {
    try {
      const { roleId } = req.params;
      const { applications } = req.body;
      const user = req.user.id;

      const findRole = await userRoleService.findOneRole(roleId);

      if (isEmpty(findRole)) {
        throw new Error(`Unable find this role`);
      }

      const formattedRoleApps = [];

      applications.forEach((app) => {
        const roleAppFunctions = [];

        app.app_functions.forEach((appFunction) => {
          roleAppFunctions.push({
            created_by_id: user,
            app_function_id: appFunction,
          });
        });
        formattedRoleApps.push({
          role_group_app_id: app.application_id,
          role_id: roleId,
          created_by_id: user,
          app_functions: roleAppFunctions,
        });
      });

      const insertedRoleApps = [];

      // formattedRoleApps.forEach((roleApp) => {
      //   const roleAppResponse = model.sequelize.transaction(
      //     async (transaction) => {
      //       const result = await userRoleService.addRoleApps(
      //         roleApp,
      //         transaction
      //       );

      //       return result;
      //     }
      //   );

      //   insertedRoleApps.push(roleAppResponse);
      // });

      await model.sequelize.transaction(async (transaction) => {
        for (const role of formattedRoleApps) {
          const result = await userRoleService.addRoleApps(role, transaction);

          insertedRoleApps.push(result[0].dataValues);
        }
      });

      http.setSuccess(200, 'Role apps added successfully.', {
        data: insertedRoleApps,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to Add apps to this role.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * UPDATE USER ROLE ACCESS DOMAIN
   *
   * @param {*} req any
   * @param {*} res any
   * @returns json
   */
  async updateUserAccessDomain(req, res) {
    try {
      const { userId, roleId, accessDomains, accessLevels } = req.body;
      const { id } = req.user;

      const findUserRole = await userRoleService.findOneUserRole({
        where: { user_id: userId, role_id: roleId },
      });

      const institutionStructure =
        await institutionStructureService.findInstitutionStructureRecords();

      const schoolOrFaculty = includes(
        map(institutionStructure.academic_units, (e) => toUpper(e)),
        toUpper('SCHOOLS')
      )
        ? 'SCHOOLS'
        : 'FACULTIES';

      const metadata = await metadataService
        .findOneMetadata({
          where: {
            metadata_name: 'ACCESS DOMAINS',
          },
          attributes: ['metadata_name', 'id'],
          include: [
            {
              association: 'metadataValues',
              separate: true,
              attributes: ['id', 'metadata_value'],
            },
          ],
        })
        .then((data) => (data ? data.toJSON() : data));

      const { metadataValues } = metadata;

      const roleBoundLevels = await roleService.findAllRoleBoundLevels({
        where: {
          role_id: roleId,
        },
        attributes: ['id', 'role_id', 'bound_level_id'],
        raw: true,
      });

      // const roleBoundLevelIds = map(roleBoundLevels, 'id');

      if (!findUserRole)
        throw new Error('This Role was not assigned to this user');

      await model.sequelize.transaction(async (transaction) => {
        for (const domain of Object.keys(accessLevels)) {
          let findRoleBasedBound;

          let type;

          let typeId;

          let dataId;

          if (domain === 'access_all_campuses') {
            dataId = getMetadataValueIdFromName(
              metadataValues,
              'CAMPUSES',
              'ACCESS DOMAINS'
            );
            type = 'campus';
            typeId = 'campus_id';
          } else if (domain === 'access_all_colleges') {
            dataId = getMetadataValueIdFromName(
              metadataValues,
              'COLLEGES',
              'ACCESS DOMAINS'
            );
            type = 'college';
            typeId = 'college_id';
          } else if (domain === 'access_all_departments') {
            dataId = getMetadataValueIdFromName(
              metadataValues,
              'DEPARTMENTS',
              'ACCESS DOMAINS'
            );
            type = 'department';
            typeId = 'department_id';
          } else if (domain === 'access_all_faculties') {
            dataId = getMetadataValueIdFromName(
              metadataValues,
              toUpper(schoolOrFaculty),
              'ACCESS DOMAINS'
            );
            type = 'faculty';
            typeId = 'faculty_id';
          } else if (domain === 'access_all_programmes') {
            dataId = getMetadataValueIdFromName(
              metadataValues,
              'PROGRAMMES',
              'ACCESS DOMAINS'
            );
            type = 'programme';
            typeId = 'programme_id';
          }

          if (dataId) {
            findRoleBasedBound = find(
              roleBoundLevels,
              (level) => level.bound_level_id === dataId
            );
          }

          if (!findRoleBasedBound) {
            throw new Error(`This Role no ${capitalize(type)} Domain Defined`);
          }

          const accessDomainIds = uniq(accessDomains[plural(type)]);

          let toCreate = accessDomainIds;

          let toDestroy = [];

          if (
            (accessLevels[domain] === false ||
              accessLevels[domain] === 'false') &&
            !isEmpty(accessDomainIds)
          ) {
            const boundValues = await userRoleService.getUserBoundValues(
              {
                where: {
                  role_id: roleId,
                  user_id: userId,
                },
                attributes: ['id', typeId],
                raw: true,
              },
              type
            );

            const boundLevelIds = map(boundValues, 'id');

            if (boundValues) {
              toCreate = difference(accessDomainIds, boundLevelIds);
              toDestroy = difference(boundLevelIds, accessDomainIds);
            }
          } else {
            await userRoleService.deleteCustomUserBoundValues(
              {
                where: {
                  role_id: roleId,
                  user_id: userId,
                },
              },
              type,
              transaction
            );

            toCreate = [];
            toDestroy = [];
          }

          if (!isEmpty(toCreate)) {
            const formattedValues = map(toCreate, (boundId) => ({
              role_id: roleId,
              user_id: userId,
              [typeId]: boundId,
              created_by_id: id,
            }));

            await userRoleService.bulkCreateUserBoundValues(
              formattedValues,
              type,
              transaction
            );
          }

          if (!isEmpty(toDestroy)) {
            await userRoleService.deleteUserBoundValues(toDestroy, type);
          }

          if (findRoleBasedBound) {
            await userRoleService.findOrCreateUserRoleBoundLevels(
              {
                where: {
                  user_id: userId,
                  role_bound_level_id: findRoleBasedBound.id,
                },
              },
              {
                user_id: userId,
                role_bound_level_id: findRoleBasedBound.id,
                has_access_to_all: accessLevels[domain],
                created_by_id: id,
              },
              transaction
            );
          }
        }
      });

      http.setSuccess(200, 'Role Access Domain Updated successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to update Role Access domains.', {
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
  async addRolesToUser(req, res) {
    try {
      const { id } = req.params;
      const { main_role: mainRole, other_roles: otherRoles } = req.body;
      const authUser = req.user;

      const formattedRoles = [];

      if (mainRole) {
        formattedRoles.push({
          role_id: mainRole,
          user_id: id,
          created_by_id: authUser.id,
          is_main_role: true,
        });
      }

      if (otherRoles) {
        otherRoles.forEach((roleId) => {
          formattedRoles.push({
            user_id: id,
            role_id: roleId,
            created_by_id: authUser.id,
          });
        });
      }

      const addedRoles = await userRoleService.addUserRoles(formattedRoles);

      http.setSuccess(200, 'User Role assigned successfully', addedRoles);

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to Assign Roles to this user', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  async assignRoleToUser(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      const authUser = req.user;

      const formattedData = {
        ...data,
        role_id: id,
        created_by_id: authUser.id,
      };

      const findRole = await userRoleService.findOneRole(id);

      if (!findRole) {
        http.setSuccess(404, 'Invalid Role selected');

        return http.send(res);
      }
      const assignRole = await userRoleService.assignRoleToUser(
        formattedData,
        findRole.role_title,
        findRole.role_group.role_group_title
      );

      http.setSuccess(200, 'Role assigned to User successfully', assignRole);

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to Assign Role to this user', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * UPDATE Specific Role
   * @param {update roles} req
   * @param {*} res
   */
  async updateRole(req, res) {
    try {
      const { roleId } = req.params;
      const data = req.body;
      const user = req.user.id;

      data.role_code = data.role_code.toUpperCase().trim();
      data.role_title = data.role_title.toUpperCase().trim();

      const boundLevels = [];

      if (!isEmpty(data.bound_levels)) {
        data.bound_levels.forEach((boundLevel) => {
          boundLevels.push({
            role_id: roleId,
            bound_level_id: boundLevel,
            created_by_id: user,
            updated_at: moment.now(),
          });
        });
      }

      const result = await model.sequelize.transaction(async (transaction) => {
        const updateUserRole = await userRoleService.updateRole(
          roleId,
          data,
          transaction
        );
        const userRoleData = updateUserRole[1][0];

        await handleUpdatingPivots(roleId, boundLevels, transaction);

        return userRoleData;
      });

      http.setSuccess(200, 'Role Updated Successfully', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to Update This Role', {
        error: {
          message: error.message,
        },
      });

      return http.send(res);
    }
  }

  /**
   * Get Specific Role Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async fetchRole(req, res) {
    const { id } = req.params;
    const userRole = await userRoleService.findOneRole(id);

    http.setSuccess(200, 'Role fetch successful', {
      userRole,
    });
    if (isEmpty(userRole)) http.setError(200, 'Role Data Not Found.');

    return http.send(res);
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async removeRoleAppFunctions(req, res) {
    try {
      const data = req.body;

      if (!isEmpty(data.app_function_ids)) {
        await model.sequelize.transaction(async (transaction) => {
          for (const obj of data.app_function_ids) {
            await userRoleService.deleteRoleAppFunctions(
              {
                where: {
                  role_user_role_group_app_id: obj.role_user_role_group_app_id,
                  app_function_id: obj.function_id,
                },
              },
              transaction
            );
          }
        });
      }

      http.setSuccess(200, 'All Role Group App Functions Removed Successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Remove Role Group App Functions.', {
        error: {
          message: error.message,
        },
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
  async removeGroupRoleApps(req, res) {
    try {
      const data = req.body;

      if (!isEmpty(data.role_user_role_group_apps)) {
        await model.sequelize.transaction(async (transaction) => {
          for (const roleGroupAppId of data.role_user_role_group_apps) {
            await userRoleService.deleteRoleAppFunctions(
              {
                where: {
                  role_user_role_group_app_id: roleGroupAppId,
                },
              },
              transaction
            );
            await userRoleService.deleteRoleUserRoleGroupApps(
              {
                where: {
                  id: roleGroupAppId,
                },
              },
              transaction
            );
          }
        });
      }

      http.setSuccess(200, 'All Role Apps Removed Successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Remove Role User Role Group Apps.', {
        error: {
          message: error.message,
        },
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
  async removeUserRoleGroupApps(req, res) {
    try {
      const data = req.body;

      await model.sequelize.transaction(async (transaction) => {
        if (!isEmpty(data.user_role_group_apps)) {
          for (const userRoleGroupAppId of data.user_role_group_apps) {
            await userRoleService.deleteUserRoleGroupApps(
              {
                where: {
                  id: userRoleGroupAppId,
                },
              },
              transaction
            );
          }
        }
      });

      http.setSuccess(200, 'All User Role Group Apps Removed Successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Remove User Role Group Apps.', {
        error: {
          message: error.message,
        },
      });

      return http.send(res);
    }
  }

  /**
   * Destroy Role Data
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async deleteRole(req, res) {
    try {
      const { roleId } = req.params;

      const findRoleGroup = await userRoleService.getRoleUserRoleGroupApps({
        where: { role_id: roleId },
      });

      await model.sequelize.transaction(async (transaction) => {
        if (!isEmpty(findRoleGroup)) {
          for (const roleGroupApp of findRoleGroup) {
            await userRoleService.deleteRoleAppFunctions(
              {
                where: {
                  role_user_role_group_app_id: roleGroupApp.id,
                },
              },
              transaction
            );
            await userRoleService.deleteRoleUserRoleGroupApps(
              {
                where: {
                  id: roleGroupApp.id,
                },
              },
              transaction
            );
          }
        }

        await userRoleService.deleteRoleUsers(roleId, transaction);
        await userRoleService.deleteRole(roleId, transaction);
      });

      http.setSuccess(200, 'Role deleted successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to delete this Role.', {
        error: {
          message: error.message,
        },
      });

      return http.send(res);
    }
  }
}

/**
 *
 * @param {*} roleId
 * @param {*} boundLevels
 * @param {*} transaction
 */
const handleUpdatingPivots = async function (roleId, boundLevels, transaction) {
  try {
    if (!isEmpty(boundLevels)) {
      await deleteOrCreateElements(
        boundLevels,
        'findAllRoleBoundLevels',
        'bulkInsertRoleBoundLevels',
        'bulkRemoveRoleBoundLevels',
        'bulkRemoveUserRoleBoundValues',
        'bound_level_id',
        roleId,
        transaction
      );
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} firstElements
 * @param {*} findAllService
 * @param {*} insertService
 * @param {*} deleteService
 * @param {*} firstField
 * @param {*} roleId
 * @param {*} transaction
 * @returns
 */
const deleteOrCreateElements = async (
  firstElements,
  findAllService,
  insertService,
  deleteService,
  deleteUserRoleBoundValuesService,
  firstField,
  roleId,
  transaction
) => {
  const elementsToDelete = [];
  const elementsToInsert = [];

  const secondElements = await userRoleService[findAllService]({
    where: {
      role_id: roleId,
    },
    attributes: ['id', 'role_id', firstField],
    raw: true,
  });

  firstElements.forEach((firstElement) => {
    const myElement = secondElements.find(
      (secondElement) =>
        parseInt(firstElement[firstField], 10) ===
          parseInt(secondElement[firstField], 10) &&
        parseInt(firstElement.role_id, 10) ===
          parseInt(secondElement.role_id, 10)
    );

    if (!myElement) elementsToInsert.push(firstElement);
  });

  secondElements.forEach((secondElement) => {
    const myElement = firstElements.find(
      (firstElement) =>
        parseInt(firstElement[firstField], 10) ===
          parseInt(secondElement[firstField], 10) &&
        parseInt(firstElement.role_id, 10) ===
          parseInt(secondElement.role_id, 10)
    );

    if (!myElement) elementsToDelete.push(secondElement.id);
  });

  if (!isEmpty(elementsToInsert)) {
    await userRoleService[insertService](elementsToInsert, transaction);
  }

  if (!isEmpty(elementsToDelete)) {
    await userRoleService[deleteUserRoleBoundValuesService](
      elementsToDelete,
      transaction
    );

    await userRoleService[deleteService](elementsToDelete, transaction);
  }

  return { elementsToDelete, elementsToInsert };
};

module.exports = RoleController;
