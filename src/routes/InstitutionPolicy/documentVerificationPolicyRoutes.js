const express = require('express');
const {
  DocumentVerificationPolicyController,
} = require('@controllers/InstitutionPolicy');
const {
  documentVerificationPolicyValidator,
} = require('@validators/InstitutionPolicy');

const documentVerificationPolicyRouter = express.Router();
const controller = new DocumentVerificationPolicyController();

documentVerificationPolicyRouter.get('/', controller.index);

documentVerificationPolicyRouter.post(
  '/',
  [
    documentVerificationPolicyValidator.validateCreateDocumentVerificationPolicy,
  ],
  controller.createRecord
);

documentVerificationPolicyRouter.put(
  '/update/:id',
  [
    documentVerificationPolicyValidator.validateUpdateDocumentVerificationPolicy,
  ],
  controller.updateRecord
);

documentVerificationPolicyRouter.delete('/:id', controller.deleteRecord);

module.exports = documentVerificationPolicyRouter;
