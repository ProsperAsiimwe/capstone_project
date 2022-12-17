const express = require('express');
const { ProgrammeAliasController } = require('@controllers/ProgrammeManager');
const { programmeAliasValidator } = require('@validators/ProgrammeManager');

const programmeAliasRouter = express.Router();
const controller = new ProgrammeAliasController();

// ProgrammeAlias Management Routes.
programmeAliasRouter.get('/', [], controller.index);
programmeAliasRouter.post(
  '/',
  [programmeAliasValidator.validateCreateProgrammeAlias],
  controller.createProgrammeAlias
);
programmeAliasRouter.get('/:id', [], controller.fetchProgrammeAlias);
programmeAliasRouter.put(
  '/:id',
  [programmeAliasValidator.validateUpdateProgrammeAlias],
  controller.updateProgrammeAlias
);
programmeAliasRouter.delete('/:id', controller.deleteProgrammeAlias);

module.exports = programmeAliasRouter;
