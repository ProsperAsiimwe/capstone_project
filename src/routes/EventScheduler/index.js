const { Router } = require('express');
const academicYearRouter = require('./academicYearRoutes');
const semesterRouter = require('./semesterRoutes');
const eventRouter = require('./eventRoutes');

//  Events Module API Endpoints
const eventsRouter = Router();

eventsRouter.use('/academic-years', academicYearRouter);
eventsRouter.use('/semesters', semesterRouter);
eventsRouter.use('/events', eventRouter);

module.exports = eventsRouter;
