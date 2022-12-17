const Application = require('./app.model');
const AppFunction = require('./appFunction.model');
const Role = require('./role.model');
const RoleAppFunction = require('./roleAppFunction.model');
const RoleUserRoleGroupApp = require('./roleUserRoleGroupApp.model');
const SecurityProfile = require('./securityProfile.model');
const User = require('./user.model');
const UserBoundLevel = require('./userBoundLevel.model');
const UserDetails = require('./userDetails.model');
const UserRole = require('./userRole.model');
const UserRoleGroup = require('./userRoleGroup.model');
const UserRoleGroupAdmin = require('./userRoleGroupAdmin.model');
const UserRoleGroupApp = require('./userRoleGroupApp.model');
const UserTokens = require('./userTokens.model');
const RoleBoundLevel = require('./roleBoundLevel.model');
const UserAccountStatus = require('./userAccountStatus.model');
const UserBoundCampus = require('./userBoundCampus.model');
const UserBoundCollege = require('./userBoundCollege.model');
const UserBoundDepartment = require('./userBoundDepartment.model');
const UserBoundFaculty = require('./userBoundFaculty.model');
const UserBoundProgramme = require('./userBoundProgramme.model');
const UserRoleBoundValues = require('./userRoleBoundValues.model');

module.exports = {
  Application,
  AppFunction,
  Role,
  RoleAppFunction,
  RoleUserRoleGroupApp,
  SecurityProfile,
  User,
  UserBoundLevel,
  UserDetails,
  UserRole,
  UserRoleGroup,
  UserRoleGroupAdmin,
  UserRoleGroupApp,
  UserTokens,
  RoleBoundLevel,
  UserAccountStatus,
  UserBoundCampus,
  UserBoundCollege,
  UserBoundDepartment,
  UserBoundFaculty,
  UserBoundProgramme,
  UserRoleBoundValues,
};
