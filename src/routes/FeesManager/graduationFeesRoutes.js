const express = require('express');
const { GraduationFeesController } = require('@controllers/FeesManager');
const { graduationFeesValidator } = require('@validators/FeesManager');

const graduationFeesRouter = express.Router();
const controller = new GraduationFeesController();

// Routes.
graduationFeesRouter.get('/', controller.index);

graduationFeesRouter.get('/elements', controller.graduationFeesByContext);

graduationFeesRouter.get(
  '/invoices/:studentProgrammeId',
  controller.graduationInvoiceStaff
);

graduationFeesRouter.post(
  '/bulk-create',
  [graduationFeesValidator.validateCreateGraduationFees],
  controller.bulkCreateAmounts
);

graduationFeesRouter.post(
  '/add-element-amounts/:graduationFeesId',
  [graduationFeesValidator.validateAddGraduationFeesElements],
  controller.addGraduationFeesElement
);

graduationFeesRouter.put(
  '/update-element-amount/:id',
  [graduationFeesValidator.validateUpdateGraduationFeesElement],
  controller.updateGraduationFeesElement
);
graduationFeesRouter.delete(
  '/delete-element-amount/:id',
  controller.deleteGraduationFeesElement
);

graduationFeesRouter.put(
  '/:id',
  [graduationFeesValidator.validateUpdateGraduationFees],
  controller.updateGraduationFees
);

graduationFeesRouter.get('/:id', controller.fetchGraduationFees);

graduationFeesRouter.delete('/:id', controller.deleteGraduationFees);

module.exports = graduationFeesRouter;
