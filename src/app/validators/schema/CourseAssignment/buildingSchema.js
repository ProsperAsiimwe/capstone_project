const Joi = require('joi');

const roomsPayload = Joi.object().keys({
  room_tag_id: Joi.number().required(),
  room_code: Joi.string().required(),
  room_capacity: Joi.number().required(),
});

const createBuildingSchema = Joi.object({
  campus_id: Joi.number().required(),
  building_name: Joi.string().required(),
  building_description: Joi.string().required(),
  rooms: Joi.array().items(roomsPayload).required(),
});

const updateBuildingSchema = Joi.object({
  building_name: Joi.string().required(),
  building_description: Joi.string(),
});

const addRoomsSchema = Joi.object({
  rooms: Joi.array().items(roomsPayload).required(),
});

const updateRoomSchema = Joi.object({
  room_tag_id: Joi.number().required(),
  room_code: Joi.string().required(),
  room_capacity: Joi.number().required(),
});

module.exports = {
  createBuildingSchema,
  updateBuildingSchema,
  addRoomsSchema,
  updateRoomSchema,
};
