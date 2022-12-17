const authSchema = require('./authSchema');
const securityProfileSchema = require('./securityProfileSchema');
const userRoleSchema = require('./roleSchema');
const appSchema = require('./appSchema');
const appFunctionSchema = require('./appFunctionSchema');
const userRoleGroupSchema = require('./userRoleGroupSchema');
const userSchema = require('./userSchema');

module.exports = {
  authSchema,
  securityProfileSchema,
  userRoleSchema,
  appSchema,
  appFunctionSchema,
  userSchema,
  userRoleGroupSchema,
};
