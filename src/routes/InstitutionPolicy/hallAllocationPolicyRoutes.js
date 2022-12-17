const express = require('express');
const {
  HallAllocationPolicyController,
} = require('@controllers/InstitutionPolicy');
const {
  hallAllocationPolicyValidator,
} = require('@validators/InstitutionPolicy');

const hallAllocationPolicyRouter = express.Router();
const controller = new HallAllocationPolicyController();

hallAllocationPolicyRouter.get('/', controller.index);

hallAllocationPolicyRouter.post(
  '/',
  [hallAllocationPolicyValidator.validateCreateHallAllocationPolicy],
  controller.createRecord
);

hallAllocationPolicyRouter.put(
  '/update/:id',
  [hallAllocationPolicyValidator.validateUpdateHallAllocationPolicy],
  controller.updateRecord
);

hallAllocationPolicyRouter.delete('/:id', controller.deleteRecord);

module.exports = hallAllocationPolicyRouter;
