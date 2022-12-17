const express = require('express');
const { ResultsPolicyController } = require('@controllers/InstitutionPolicy');
const { resultsPolicyValidator } = require('@validators/InstitutionPolicy');

const resultsPolicyRouter = express.Router();
const controller = new ResultsPolicyController();

resultsPolicyRouter.get(
  '/study-level-pass-mark-policy',
  controller.findAllStudyLevelPassMarkPolicy
);

resultsPolicyRouter.get(
  '/course-resitting-policy',
  controller.findAllCourseResittingPolicy
);

resultsPolicyRouter.get(
  '/study-level-degree-class-policy',
  controller.findAllStudyLevelDegreeClassPolicy
);

resultsPolicyRouter.post(
  '/study-level-pass-mark-policy',
  [resultsPolicyValidator.validateCreateStudyLevelPassMarkPolicy],
  controller.createStudyLevelPassMarkPolicy
);

resultsPolicyRouter.post(
  '/course-resitting-policy',
  [resultsPolicyValidator.validateCreateCourseResittingPolicy],
  controller.createCourseResittingPolicy
);

resultsPolicyRouter.post(
  '/study-level-degree-class-policy',
  [resultsPolicyValidator.validateCreateStudyLevelDegreeClass],
  controller.createStudyLevelDegreeClassPolicy
);

resultsPolicyRouter.put(
  '/study-level-pass-mark-policy/:id',
  [resultsPolicyValidator.validateCreateStudyLevelPassMarkPolicy],
  controller.updateStudyLevelPassMarkPolicy
);

resultsPolicyRouter.put(
  '/course-resitting-policy/:id',
  [resultsPolicyValidator.validateCreateCourseResittingPolicy],
  controller.updateCourseResittingPolicy
);

resultsPolicyRouter.put(
  '/study-level-degree-class-policy/:degreeClassPolicyId',
  [resultsPolicyValidator.validateCreateStudyLevelDegreeClass],
  controller.updateStudyLevelDegreeClassPolicy
);

resultsPolicyRouter.put(
  '/study-level-degree-class-policy-allocation/:degreeClassPolicyAllocationId',
  [resultsPolicyValidator.validateCreateStudyLevelDegreeClassAllocation],
  controller.updateStudyLevelDegreeClassPolicyAllocation
);

resultsPolicyRouter.delete(
  '/study-level-pass-mark-policy/:id',
  controller.deleteStudyLevelPassMarkPolicy
);

resultsPolicyRouter.delete(
  '/course-resitting-policy/:id',
  controller.deleteCourseResittingPolicy
);

resultsPolicyRouter.delete(
  '/study-level-degree-class-policy/:id',
  controller.deleteStudyLevelDegreeClassPolicy
);

resultsPolicyRouter.delete(
  '/study-level-degree-class-policy-allocation/:degreeClassPolicyAllocationId',
  controller.deleteStudyLevelDegreeClassPolicyAllocation
);

module.exports = resultsPolicyRouter;
