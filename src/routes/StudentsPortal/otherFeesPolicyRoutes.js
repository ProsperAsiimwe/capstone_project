const express = require('express');
const { OtherFeesPolicyController } = require('@controllers/InstitutionPolicy');

const otherFeesPolicyRouter = express.Router();
const controller = new OtherFeesPolicyController();

otherFeesPolicyRouter.get('/', controller.index);

otherFeesPolicyRouter.get('/', controller.fetchOtherFeesElements);

module.exports = otherFeesPolicyRouter;
