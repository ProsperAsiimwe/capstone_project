const express = require('express');
const {
  AcademicYearFeesPolicyController,
} = require('@controllers/InstitutionPolicy');
const {
  academicYearFeesPolicyValidator,
} = require('@validators/InstitutionPolicy');

const academicYearFeesPolicyRouter = express.Router();
const controller = new AcademicYearFeesPolicyController();

academicYearFeesPolicyRouter.post(
  '/',
  [academicYearFeesPolicyValidator.validateCreateAcademicYearFeesPolicy],
  controller.createAcademicYearFeesPolicy
);

academicYearFeesPolicyRouter.get('/', controller.fectchAllFuction);

academicYearFeesPolicyRouter.put(
  '/:id',
  [academicYearFeesPolicyValidator.validateCreateAcademicYearFeesPolicy],
  controller.updateAcademicYearFeesPolicy
);
academicYearFeesPolicyRouter.delete(
  '/:id',
  controller.deleteAcademicYearFeesPolicy
);

module.exports = academicYearFeesPolicyRouter;
