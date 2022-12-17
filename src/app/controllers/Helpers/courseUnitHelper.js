const {
  courseUnitService,
  programmeVersionCourseUnitService,
} = require('@services/index');
const { isEmpty } = require('lodash');

/**
 *
 * @param {*} data
 * @param {*} upload
 * @param {*} user
 * @param {*} transaction
 */
const uploadModularProgrammeCourseUnits = async function (
  data,
  upload,
  user,
  transaction
) {
  try {
    const progVersionModuleOptionCourseUnitData = [];

    if (data.module_option_id) {
      progVersionModuleOptionCourseUnitData.push({
        module_option_id: data.module_option_id,
        created_by_id: user,
      });
    }

    const progVersionModuleCourseUnitData = {
      version_module_id: data.version_module_id,
      course_unit_id: upload[0].dataValues.id,
      course_unit_semester_id: data.course_unit_semester_id,
      course_unit_year_id: data.course_unit_year_id,
      course_unit_category_id: data.course_unit_category_id,
      course_unit_status: data.course_unit_status,
      number_of_assessments: data.number_of_assessments,
      version_credit_units: data.credit_unit,
      expect_result_upload: data.expect_result_upload,
      grading_id: data.grading_id,
      contribution_algorithm_id: data.contribution_algorithm_id,
      created_by_id: user,
      optionCourseUnits: progVersionModuleOptionCourseUnitData,
    };

    await courseUnitService.createProgrammeVersionModuleCourseUnit(
      progVersionModuleCourseUnitData,
      transaction
    );
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} data
 * @param {*} upload
 * @param {*} versionId
 * @param {*} user
 * @param {*} transaction
 */
const uploadNormalProgrammeCourseUnits = async function (
  data,
  upload,
  versionId,
  user,
  transaction
) {
  try {
    const planCourseUnits = [];
    const specCourseUnits = [];
    const subjectCourseUnits = [];

    if (!isEmpty(data.plans)) {
      data.plans.forEach((plan) => {
        planCourseUnits.push({
          programme_version_plan_id: plan,
          created_by_id: user,
        });
      });
    }

    if (!isEmpty(data.specializations)) {
      data.specializations.forEach((spec) => {
        specCourseUnits.push({
          version_specialization_id: spec,
          created_by_id: user,
        });
      });
    }

    if (!isEmpty(data.subjects)) {
      data.subjects.forEach((subj) => {
        subjectCourseUnits.push({
          combination_subject_id: subj,
          created_by_id: user,
        });
      });
    }

    const progVersionCourseUnitData = {
      programme_version_id: versionId,
      course_unit_id: upload[0].dataValues.id,
      course_unit_semester_id: data.course_unit_semester_id,
      course_unit_year_id: data.course_unit_year_id,
      course_unit_category_id: data.course_unit_category_id,
      course_unit_status: data.course_unit_status,
      number_of_assessments: data.number_of_assessments,
      grading_id: data.grading_id,
      contribution_algorithm_id: data.contribution_algorithm_id,
      created_by_id: user,
      version_credit_units: data.credit_unit,
      planCourseUnits: planCourseUnits,
      specCourseUnits: specCourseUnits,
      subjectCourseUnits: subjectCourseUnits,
    };

    await programmeVersionCourseUnitService.createProgrammeVersionCourseUnit(
      progVersionCourseUnitData,
      transaction
    );
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  uploadModularProgrammeCourseUnits,
  uploadNormalProgrammeCourseUnits,
};
