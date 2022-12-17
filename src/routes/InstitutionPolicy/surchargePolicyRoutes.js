const express = require('express');
const { SurchargePolicyController } = require('@controllers/InstitutionPolicy');
const { surchargePolicyValidator } = require('@validators/InstitutionPolicy');

const surchargePolicyRouter = express.Router();
const controller = new SurchargePolicyController();

surchargePolicyRouter.post(
  '/',
  [surchargePolicyValidator.validateCreateSurchargePolicy],
  controller.createRecord
);

surchargePolicyRouter.post(
  '/add-tuition-invoice-due-dates',
  controller.addTuitionInvoiceDueDates
);

surchargePolicyRouter.post(
  '/add-functional-invoice-due-dates',
  controller.addFunctionalInvoiceDueDates
);

surchargePolicyRouter.post(
  '/add-enrollment-reg-due-dates',
  controller.addEnrollmentRegistrationDueDates
);

surchargePolicyRouter.get('/', controller.index);

surchargePolicyRouter.put(
  '/:id',
  [surchargePolicyValidator.validateUpdateSurchargePolicy],
  controller.updateRecord
);
surchargePolicyRouter.delete('/:id', controller.deleteRecord);

surchargePolicyRouter.get(
  '/view-revoke-surcharge-invoice-requests/',
  controller.viewRevokeSurchargeInvoiceRequests
);

surchargePolicyRouter.post(
  '/request-revoke-surcharge-invoices/',
  [surchargePolicyValidator.validateRequestDeleteSurchargeInvoice],
  controller.requestRevokeSurchargeInvoices
);
surchargePolicyRouter.delete(
  '/revoke-surcharge-invoices/:revoke_surcharge_id',
  [surchargePolicyValidator.validateRevokeSurchargeInvoice],
  controller.revokeSurchargeInvoices
);

module.exports = surchargePolicyRouter;
