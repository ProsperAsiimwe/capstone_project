const express = require('express');
const { PujabApplicantUnebSelectionController } = require('@controllers/Pujab');
const { pujabAdmissionValidator } = require('@validators/Pujab');

const unebDataRouter = express.Router();
const controller = new PujabApplicantUnebSelectionController();

unebDataRouter.get(
  '/applicants-by-first-choice',
  controller.findAllApplicantsByFirstChoice
);
unebDataRouter.get(
  '/proposed-merit-admissions',
  controller.findAllProposedMeritAdmissions
);
unebDataRouter.post(
  '/download-applicant-by-first-choice-template',
  controller.downloadApplicantsByFirstChoiceTemplate
);
unebDataRouter.post(
  '/download-proposed-merit-admission-template',
  controller.downloadProposedMeritAdmissionTemplate
);

unebDataRouter.post(
  '/upload-applicant-by-first-choice-template',
  controller.uploadApplicantsByFirstChoiceTemplate
);

unebDataRouter.post(
  '/upload-proposed-merit-admission-template',
  controller.uploadProposedMeritAdmissionTemplate
);

unebDataRouter.get(
  '/applicant-by-first-choice/:id',
  controller.findoneApplicantByFirstChoice
);

unebDataRouter.get(
  '/proposed-merit-admission/:id',
  controller.findOneProposedMeritAdmission
);

unebDataRouter.put(
  '/applicants-by-first-choice/:id',
  [pujabAdmissionValidator.validateUpdateApplicantsByFirstChoice],
  controller.updateApplicantsByFirstChoice
);

unebDataRouter.put(
  '/proposed-merit-admission/:id',
  [pujabAdmissionValidator.validateUpdateProposedMeritAdmission],
  controller.updateProposedMeritAdmission
);

module.exports = unebDataRouter;
