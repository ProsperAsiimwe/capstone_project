const express = require('express');
const { EventController } = require('@controllers/EventScheduler');
const { eventValidator } = require('@validators/EventScheduler');

const eventRouter = express.Router();
const controller = new EventController();

// Events Management Routes.
eventRouter.get('/', controller.index);

eventRouter.post(
  '/',
  [eventValidator.validateCreateEvent],
  controller.createEvent
);
eventRouter.get('/:id', controller.fetchEvent);
eventRouter.get('/academic-year/:id', controller.fetchEventsByAcademicYear);
eventRouter.get('/semester/:id', controller.fetchEventsBySemester);
eventRouter.put(
  '/:id',
  [eventValidator.validateUpdateEvent],
  controller.updateEvent
);
eventRouter.delete('/:id', controller.deleteEvent);

module.exports = eventRouter;
