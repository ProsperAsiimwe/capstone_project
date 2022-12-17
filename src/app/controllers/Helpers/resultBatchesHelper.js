const { isEmpty } = require('lodash');
const {
  graduationListService,
  resultAllocationNodeService,
  gradingService,
} = require('@services/index');
const {
  generateGradesHandler,
  gradeSemesterResults,
} = require('./academicGradesHelper');

/**
 *
 * @param {*} studentProgrammeId
 * @param {*} transaction
 */
const handleRemovingResultComputations = async function (
  studentProgrammeId,
  transaction
) {
  const allStudentGrades = await graduationListService.findAllStudentGrades({
    where: {
      student_programme_id: studentProgrammeId,
    },
    attributes: ['id'],
    raw: true,
  });

  if (!isEmpty(allStudentGrades)) {
    const gradesToDelete = allStudentGrades.map((item) => {
      return item.id;
    });

    await graduationListService.bulkDeleteStudentGrades(
      gradesToDelete,
      transaction
    );
  }
};

/**
 *
 * @param {*} studentProgrammeId
 * @param {*} transaction
 */
const handleRecreatingResultComputations = async function (
  studentProgrammeId,
  transaction
) {
  const context = {
    student: studentProgrammeId,
  };
  const gradingSystem = await gradingService.findAllGrading({
    attributes: ['id'],
    include: [
      {
        association: 'values',
        attributes: [
          'id',
          'grading_id',
          'max_value',
          'min_value',
          'grading_point',
          'grading_letter',
          'interpretation',
        ],
      },
    ],
  });

  const semesterResults = await resultAllocationNodeService.gpaSingleStudent(
    context
  );

  const gradedResults = gradeSemesterResults(semesterResults, gradingSystem);
  const updatedCGPAs = generateGradesHandler(gradedResults);

  if (!isEmpty(updatedCGPAs)) {
    for (const item of updatedCGPAs) {
      await graduationListService.generateStudentGrades(item, transaction);
    }
  } else {
    await handleRemovingResultComputations(studentProgrammeId, transaction);
  }
};

module.exports = {
  handleRemovingResultComputations,
  handleRecreatingResultComputations,
};
