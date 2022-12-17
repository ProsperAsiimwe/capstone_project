const express = require('express');
const { AdmissionFormController } = require('@controllers/Admissions');
const { admissionFormValidator } = require('@validators/Admissions');

const admissionFormRouter = express.Router();
const controller = new AdmissionFormController();

// AdmissionForms Routes.
admissionFormRouter.get('/', controller.index);

admissionFormRouter.post(
  '/',
  [admissionFormValidator.validateCreateAdmissionForm],
  controller.createAdmissionForm
);
admissionFormRouter.get('/:id', controller.fetchAdmissionForm);
admissionFormRouter.put(
  '/:id',
  [admissionFormValidator.validateUpdateAdmissionForm],
  controller.updateAdmissionForm
);
admissionFormRouter.delete('/:id', controller.hardDeleteAdmissionForm);

admissionFormRouter.put('/soft-delete/:id', controller.softDeleteAdmissionForm);

admissionFormRouter.put('/restore/:id', controller.undoSoftDeleteAdmissionForm);

module.exports = admissionFormRouter;
