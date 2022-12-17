const { JoiValidator } = require('@middleware');
const { eventSchema } = require('../schema/EventScheduler');

const validateCreateEvent = async (req, res, next) => {
  return await JoiValidator(req, res, next, eventSchema.createEventSchema);
};

const validateUpdateEvent = async (req, res, next) => {
  return await JoiValidator(req, res, next, eventSchema.updateEventSchema);
};

module.exports = { validateCreateEvent, validateUpdateEvent };
