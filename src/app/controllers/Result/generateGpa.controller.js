const { HttpResponse } = require('@helpers');
const {
  graduationListService,
  resultAllocationNodeService,
  gradingService,
} = require('@services/index');
const model = require('@models');
const { chain, chunk } = require('lodash');
const {
  generateGradesHandler,
  gradeSemesterResults,
} = require('../Helpers/academicGradesHelper');

const http = new HttpResponse();

class GenerateGpaController {
  async generateStudentGpa(req, res) {
    try {
      const context = req.query;

      if (
        !context.campus_id ||
        !context.intake_id ||
        !context.programme_id ||
        !context.study_year_id
      ) {
        throw new Error('Invalid Context Provided');
      }

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

      const computedGrades = await model.sequelize.transaction(
        async (transaction) => {
          if (context.offset_value || context.limit_value) {
            const studentData =
              await graduationListService.generateGradesByOffSet(context);

            const response = await generateGrades(
              studentData,
              gradingSystem,
              transaction
            );

            return response;
          } else {
            const studentData =
              await graduationListService.generateGpaStudentList(context);

            const response = await generateGrades(
              studentData,
              gradingSystem,
              transaction
            );

            return response;
          }
        }
      );

      http.setSuccess(200, 'Student Grades Computed Successfully.', {
        data: computedGrades,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Compute Student Grades.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async generateSingleStudentGrades(req, res) {
    try {
      const context = req.query;

      if (!context.student) {
        throw new Error('Invalid Context Provided');
      }

      const semesterResults =
        await resultAllocationNodeService.studentResultsFunction(
          context.student
        );

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

      const gradedSemesterResults = gradeSemesterResults(
        semesterResults,
        gradingSystem
      );

      const newResults = generateGradesHandler(gradedSemesterResults);

      const grades = [];

      await model.sequelize.transaction(async (transaction) => {
        for (const item of newResults) {
          const response = await graduationListService.generateStudentGrades(
            item,
            transaction
          );

          grades.push(response);
        }
      });

      http.setSuccess(200, 'Student Grades Generated Successfully.', {
        data: grades,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Generate Student Grades.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  // view students
  async studentGpaList(req, res) {
    try {
      if (
        !req.query.campus_id ||
        !req.query.intake_id ||
        !req.query.programme_id ||
        !req.query.study_year_id
      ) {
        throw new Error('Invalid Context Provided');
      }

      const context = req.query;

      const studentData = await graduationListService.gpaStudentList(context);

      http.setSuccess(200, 'Student Grades Generated Successfully.', {
        data: studentData,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Graduate Student Grades.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

/**
 *
 * @param {*} studentData
 * @param {*} transaction
 * @returns
 */
const generateGrades = async function (
  studentData,
  gradingSystem,
  transaction
) {
  const gradesToCompute = [];

  const groupByStudent = chain(studentData)
    .groupBy('student_programme_id')
    .map((value, key) => ({
      student_programme_id: key,
      resultsToCompute: value,
    }))
    .value();

  const chunks = chunk(groupByStudent, 100);

  for (const chunk of chunks) {
    for (const student of chunk) {
      const gradedSemesterResults = gradeSemesterResults(
        student.resultsToCompute,
        gradingSystem
      );
      const handleAcademicGrades = generateGradesHandler(gradedSemesterResults);

      for (const item of handleAcademicGrades) {
        const grades = await graduationListService.generateStudentGrades(
          item,
          transaction
        );

        gradesToCompute.push(grades);
      }
    }
  }

  return gradesToCompute;
};

module.exports = GenerateGpaController;
