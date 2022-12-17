const express = require('express');
const { SponsorController } = require('@controllers/UniversalPayments');
const { sponsorValidator } = require('@validators/UniversalPayments');

const sponsorRouter = express.Router();
const controller = new SponsorController();

sponsorRouter.get('/', controller.index);

sponsorRouter.post(
  '/',
  [sponsorValidator.validateCreateSponsor],
  controller.create
);
sponsorRouter.post(
  '/download-sponsor-students-template',
  controller.downloadSponsorStudentsTemplate
);
sponsorRouter.post(
  '/upload-sponsor-students-template',
  controller.uploadSponsorStudents
);
sponsorRouter.post(
  '/download-sponsor-allocations-template',
  controller.downloadSponsorAllocationsTemplate
);
sponsorRouter.post(
  '/upload-sponsor-allocations-template',
  controller.uploadSponsorAllocationsTemplate
);

sponsorRouter.post(
  '/generate-invoice',
  [sponsorValidator.validateCreateInvoice],
  controller.createSponsorInvoice
);

sponsorRouter.post(
  '/de-allocate-from-sponsored-students',
  [sponsorValidator.validateDeAllocateFromSponsoredStudents],
  controller.reverseAllocationToSponsoredStudents
);

sponsorRouter.post(
  '/generate-new-prn/:sponsorInvoiceId',
  controller.generateNewSponsorInvoicePRN
);

sponsorRouter.post(
  '/allocate-to-sponsored-students/:sponsorPaymentTransactionId',
  [sponsorValidator.validateAllocateToSponsoredStudents],
  controller.allocateMoneyToSponsoredStudents
);

sponsorRouter.get(
  '/fetch-sponsor-students/:sponsorId',
  controller.fetchSponsoredStudents
);

sponsorRouter.get(
  '/all-sponsor-invoices/:sponsorId',
  controller.findAllSponsorInvoices
);

sponsorRouter.get(
  '/sponsor-account-balance/:sponsorId',
  controller.getSponsorAccountbalance
);

sponsorRouter.get(
  '/transaction-allocations/:transactionId',
  controller.getTransactionAllocations
);

sponsorRouter.get('/:id', controller.findOne);

sponsorRouter.put(
  '/:id',
  [sponsorValidator.validateCreateSponsor],
  controller.update
);

sponsorRouter.delete('/:id', controller.delete);

module.exports = sponsorRouter;
