const collegeValidator = require('./collegeValidator');
const facultyValidator = require('./facultyValidator');
const departmentValidator = require('./departmentValidator');
const programmeValidator = require('./programmeValidator');
const programmeVersionPlanValidator = require('./programmePlanVersionValidator');
const gradingValidator = require('./gradingValidator');
const gradingValueValidator = require('./gradingValueValidator');
const courseUnitValidator = require('./courseUnitValidator');
const progVersAdmCriteriaValidator = require('./progVersAdmCriteriaValidator');
const progVersPlanAdmCriteriaValidator = require('./progVersPlanAdmCriteriaValidator');
const semesterLoadValidator = require('./semesterLoadValidator');
const programmeAliasValidator = require('./programmeAliasValidator');
const unebSubjectValidator = require('./unebSubjectValidator');

module.exports = {
  collegeValidator,
  facultyValidator,
  departmentValidator,
  programmeValidator,
  programmeVersionPlanValidator,
  gradingValidator,
  gradingValueValidator,
  courseUnitValidator,
  progVersAdmCriteriaValidator,
  progVersPlanAdmCriteriaValidator,
  semesterLoadValidator,
  programmeAliasValidator,
  unebSubjectValidator,
};
