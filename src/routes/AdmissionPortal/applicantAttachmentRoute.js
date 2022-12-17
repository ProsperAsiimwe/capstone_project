const express = require('express');
const { ApplicantAttachmentController } = require('@controllers/Admissions');

const applicantAttachmentRouter = express.Router();
const controller = new ApplicantAttachmentController();

// ApplicantAttachment Routes.
applicantAttachmentRouter.get('/', controller.index);

applicantAttachmentRouter.post(
  '/',
  // [applicantAttachmentValidator.validateCreateApplicantAttachment],
  controller.createApplicantAttachment
);
applicantAttachmentRouter.get('/:formId', controller.fetchApplicantAttachment);
applicantAttachmentRouter.put(
  '/:id',
  // [applicantAttachmentValidator.validateUpdateApplicantAttachment],
  controller.updateApplicantAttachment
);

applicantAttachmentRouter.delete('/:id', controller.deleteApplicantAttachment);

module.exports = applicantAttachmentRouter;
