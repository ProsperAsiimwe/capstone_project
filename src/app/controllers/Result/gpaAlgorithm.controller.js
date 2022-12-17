const { HttpResponse } = require('@helpers');
const {
  resultAllocationNodeService,
  gradingService,
} = require('@services/index');
const {
  generateGradesHandler,
  gradeSemesterResults,
} = require('../Helpers/academicGradesHelper');

const http = new HttpResponse();

class GpaAlgorithmController {
  // testimonial results

  /**
   *
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async singleStudentGpa(req, res) {
    try {
      if (!req.query.student) {
        throw new Error('Invalid Context Provided');
      }

      const context = req.query;

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

      const semesterResults =
        await resultAllocationNodeService.gpaSingleStudent(context);

      const gradedSemesterResults = gradeSemesterResults(
        semesterResults,
        gradingSystem
      );

      const data = generateGradesHandler(gradedSemesterResults);

      http.setSuccess(200, 'Student Assessment Computed  successfully ', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Compute Student Assessment', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

module.exports = GpaAlgorithmController;
