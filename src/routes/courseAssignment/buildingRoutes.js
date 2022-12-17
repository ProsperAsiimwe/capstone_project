const express = require('express');
const { BuildingController } = require('@controllers/courseAssignment');
const { buildingValidator } = require('@validators/courseAssignment');

const buildingRouter = express.Router();
const controller = new BuildingController();

// Routes.
buildingRouter.get('/', controller.index);

buildingRouter.get(
  '/buildings-by-campus/:campusId',
  controller.buildingsByCampus
);

buildingRouter.post(
  '/create-building',
  [buildingValidator.validateCreateBuilding],
  controller.createBuilding
);

buildingRouter.post(
  '/download-buildings-template',
  controller.downloadBuildingsTemplate
);

buildingRouter.post(
  '/download-rooms-template/:campusId',
  controller.downloadRoomsTemplate
);

buildingRouter.post('/upload-buildings-template', controller.uploadBuildings);

buildingRouter.post('/upload-rooms-template', controller.uploadRooms);

buildingRouter.post(
  '/add-rooms/:buildingId',
  [buildingValidator.validateAddRooms],
  controller.addRooms
);

buildingRouter.put(
  '/update-building/:buildingId',
  [buildingValidator.validateUpdateBuilding],
  controller.updateBuilding
);

buildingRouter.put(
  '/update-room/:id',
  [buildingValidator.validateUpdateRoom],
  controller.updateRoom
);

buildingRouter.delete('/delete-building/:id', controller.deleteBuilding);

buildingRouter.delete('/delete-room/:id', controller.deleteRoom);

module.exports = buildingRouter;
