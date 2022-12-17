const { JoiValidator } = require('@middleware');
const { buildingSchema } = require('../schema/CourseAssignment');

const validateCreateBuilding = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    buildingSchema.createBuildingSchema
  );
};

const validateUpdateBuilding = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    buildingSchema.updateBuildingSchema
  );
};

const validateAddRooms = async (req, res, next) => {
  return await JoiValidator(req, res, next, buildingSchema.addRoomsSchema);
};

const validateUpdateRoom = async (req, res, next) => {
  return await JoiValidator(req, res, next, buildingSchema.updateRoomSchema);
};

module.exports = {
  validateCreateBuilding,
  validateUpdateBuilding,
  validateUpdateRoom,
  validateAddRooms,
};
