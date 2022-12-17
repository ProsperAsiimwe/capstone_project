const express = require('express');
const {
  EmisCoursesController,
  EmisSubmitController,
  EmisIntegrationController,
} = require('@controllers/Api');

const courseRouter = express.Router();
const controller = new EmisCoursesController();

const submitController = new EmisSubmitController();

const emisController = new EmisIntegrationController();

// terp
courseRouter.get('/terp-sponsors', emisController.universitySponsors);
courseRouter.get('/terp-campuses', emisController.universityCampuses);
courseRouter.get('/terp-schemes', emisController.universityScheme);
courseRouter.get('/terp-study-levels', emisController.universityStudyLevel);
courseRouter.get('/terp-programmes', emisController.universityProgramme);

// emis

courseRouter.get('/course-categories', controller.unescoCourseCategories);

courseRouter.get('/sponsors', controller.universitySponsors);
courseRouter.get('/entry-schemes', controller.universityEntryScheme);
courseRouter.get('/study-levels', controller.universityStudyLevels);
courseRouter.get('/campus', controller.universityCampus);
courseRouter.get('/courses', controller.universityProgrammes);
courseRouter.get('/students', controller.universityStudents);

courseRouter.post('/sponsors', submitController.submitSponsors);

courseRouter.post('/entry-schemes', submitController.submitEntrySchemes);

courseRouter.post('/study-levels', submitController.submitStudyLevel);

courseRouter.post('/campus', submitController.submitCampus);

courseRouter.post('/programmes', submitController.submitProgrammes);
courseRouter.post('/students', submitController.submitStudents);

module.exports = courseRouter;
