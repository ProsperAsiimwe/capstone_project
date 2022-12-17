const Joi = require('joi');

const createTeachingTimetableSchema = Joi.object({
  weekday_id: Joi.number().required(),
  room_id: Joi.number().required(),
  start_time_hours: Joi.string().max(2).required(),
  start_time_minutes: Joi.string().max(2).required(),
  start_time_period: Joi.string().max(2).required(),
  end_time_hours: Joi.string().max(2).required(),
  end_time_minutes: Joi.string().max(2).required(),
  end_time_period: Joi.string().max(2).required(),
});

const updateTeachingTimetableSchema = Joi.object({
  weekday_id: Joi.number().required(),
  room_id: Joi.number().required(),
  start_time: Joi.string().required(),
  end_time: Joi.string().required(),
});

module.exports = {
  createTeachingTimetableSchema,
  updateTeachingTimetableSchema,
};
