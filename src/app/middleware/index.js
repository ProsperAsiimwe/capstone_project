const { JoiValidator } = require('./joiValidator');
const authRoute = require('./authRoute');
const authRouteApplicant = require('./authRouteApplicant');
const authRoutePujabApplicant = require('./authRoutePujabApplicant');
const authRouteStudent = require('./authRouteStudent');
const ValidateRequest = require('./validate-request');
const filterMiddleware = require('./filterMiddleware');

module.exports = {
  JoiValidator,
  authRoute,
  authRouteApplicant,
  authRoutePujabApplicant,
  authRouteStudent,
  ValidateRequest,
  filterMiddleware,
};
