const { HttpResponse } = require('@helpers');
const { graduatedStudentsService } = require('@services/index');

const http = new HttpResponse();

class GraduatedStudentsController {
  async graduatedStudent(req, res) {
    try {
      if (
        !req.query.campus_id ||
        !req.query.intake_id ||
        !req.query.programme_id ||
        !req.query.academic_year_id
      ) {
        throw new Error('Invalid Context Provided');
      }

      const context = req.query;

      const data = await graduatedStudentsService.graduatedStudents(context);

      http.setSuccess(200, 'Graduated Students fetched successfully', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch  Graduated Students', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

module.exports = GraduatedStudentsController;
