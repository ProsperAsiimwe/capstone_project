const express = require('express');
const {
  UniversalInvoiceController,
  ChartOfAccountController,
} = require('@controllers/UniversalPayments');
const { universalInvoiceValidator } = require('@validators/UniversalPayments');

const universalInvoiceRouter = express.Router();
const controller = new UniversalInvoiceController();
const accountController = new ChartOfAccountController();

universalInvoiceRouter.get('/fetch-invoices', controller.index);

universalInvoiceRouter.get('/fetch-accounts', accountController.index);

universalInvoiceRouter.post(
  '/generate-invoice',
  [universalInvoiceValidator.validateCreateUniversalInvoiceByStaff],
  controller.staffPortalGeneratedUniversalInvoice
);

universalInvoiceRouter.post(
  '/universal-transaction',
  [universalInvoiceValidator.validateCreateUniversalInvoicePaymnetTransactions],
  controller.createUniversalInvoiceBankPaymentTransaction
);

universalInvoiceRouter.get('/:id', controller.fetchUniversalInvoiceById);

universalInvoiceRouter.put(
  '/:id',
  [universalInvoiceValidator.validateCreateUniversalInvoiceByStaff],
  controller.updateUniversalInvoice
);

universalInvoiceRouter.delete('/:id', controller.deleteUniversalInvoice);

module.exports = universalInvoiceRouter;
