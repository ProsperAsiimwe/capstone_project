const express = require('express');
const { AdmissionSchemeController } = require('@controllers/Admissions');
const { admissionSchemeValidator } = require('@validators/Admissions');

const admissionSchemeRouter = express.Router();
const controller = new AdmissionSchemeController();

// AdmissionSchemes Routes.
admissionSchemeRouter.get('/', controller.index);

admissionSchemeRouter.post(
  '/',
  [admissionSchemeValidator.validateCreateAdmissionScheme],
  controller.createAdmissionScheme
);
admissionSchemeRouter.get('/:id', controller.fetchAdmissionScheme);
admissionSchemeRouter.put(
  '/:id',
  [admissionSchemeValidator.validateUpdateAdmissionScheme],
  controller.updateAdmissionScheme
);
admissionSchemeRouter.delete('/:id', controller.hardDeleteAdmissionScheme);

admissionSchemeRouter.put(
  '/soft-delete/:id',
  controller.softDeleteAdmissionScheme
);

admissionSchemeRouter.put(
  '/restore/:id',
  controller.undoSoftDeleteAdmissionScheme
);

module.exports = admissionSchemeRouter;
