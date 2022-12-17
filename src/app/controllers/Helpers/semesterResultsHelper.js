const {
  generateGradesHandler,
  gradeSemesterResults,
} = require('./academicGradesHelper');
const {
  resultAllocationNodeService,
  gradingService,
} = require('@services/index');
const { isEmpty, pick } = require('lodash');

const getStudentSemesterResults = async (registrationNumber) => {
  const results =
    await resultAllocationNodeService.studentResultsSemesterFunction(
      registrationNumber
    );

  let semesterResults = null;

  if (!isEmpty(results)) {
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

    const gradedResults = gradeSemesterResults(results, gradingSystem);
    const newResult = generateGradesHandler(gradedResults);
    const [firstSemester] = newResult;

    const studentData = pick(firstSemester, [
      'student_number',
      'registration_number',
      'date_of_birth',
      'gender',
      'avatar',
      'department_title',
      'faculty_title',
      'faculty_code',
      'college_title',
      'college_code',
      'hall_of_attachment',
      'programme_title',
      'programme_code',
      'is_classified',
      'has_dissertation',
      'programme_type',
      'surname',
      'campus',
      'intake',
      'other_names',
      'start_date',
      'end_date',
      'student_programme_id',
      'dissertation_title',
      'dissertation_description',
    ]);

    semesterResults = { ...studentData, semesters: newResult };
  }

  return semesterResults;
};

module.exports = { getStudentSemesterResults };
