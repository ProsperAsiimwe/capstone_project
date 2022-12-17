const { graduationListService } = require('@services/index');
const { isEmpty } = require('lodash');

/**
 *
 * @param {*} context
 * @returns
 */
const generateProvisionList = async function (context) {
  const finalStudyYear = await graduationListService.maxProgrammeStudyYear(
    context
  );

  const contextData = {
    ...context,
    finalYearMetadata: finalStudyYear.programme_study_year_id,
    finalYearContext: finalStudyYear.context_id,
  };

  const result = await graduationListService.generateProvisionalList(
    contextData
  );
  const firstObj = result[0];

  if (!firstObj) {
    throw new Error('No Student Records Returned');
  }

  let programmeLoads = [];
  const studentsToGraduate = [];

  if (
    firstObj.has_plan === false &&
    firstObj.programme_version_plan_id === null
  ) {
    programmeLoads = await graduationListService.entryYearLoads(context);

    if (
      isEmpty(programmeLoads) &&
      firstObj.programme_version_plan_id === null &&
      firstObj.has_plan === false
    ) {
      throw new Error('No Graduation Loads Defined For This Programme');
    }

    result.forEach((student) => {
      const checkValue = programmeLoads.find(
        (load) =>
          parseInt(load.entry_year_id, 10) ===
            parseInt(student.student_entry_year_id, 10) &&
          parseInt(load.programme_version_id, 10) ===
            parseInt(student.programme_version_id, 10) &&
          parseFloat(student.cumulative_tcu) >= parseFloat(load.graduation_load)
      );

      if (checkValue) {
        studentsToGraduate.push(student);
      }
    });
  } else {
    programmeLoads = await graduationListService.planGraduationLoads(context);
    if (
      isEmpty(programmeLoads) &&
      firstObj.has_plan === true &&
      firstObj.programme_version_plan_id !== null
    ) {
      throw new Error(
        'No Graduation Loads Defined For This Programme, Check The Programme Plans Versions'
      );
    }
    result.forEach((student) => {
      const checkValue = programmeLoads.find(
        (load) =>
          parseInt(load.programme_version_plan_id, 10) ===
            parseInt(student.programme_version_plan_id, 10) &&
          parseInt(load.programme_version_id, 10) ===
            parseInt(student.programme_version_id, 10) &&
          parseFloat(student.cumulative_tcu) >= parseFloat(load.graduation_load)
      );

      if (checkValue) {
        studentsToGraduate.push(student);
      }
    });
  }

  return { programmeLoads, studentsToGraduate };
};

module.exports = { generateProvisionList };
