// graduationData
const { HttpResponse } = require('@helpers');
const { graduationListService } = require('@services/index');

const http = new HttpResponse();

class GraduationDetailsController {
  // graduation details
  async graduationDetails(req, res) {
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

      const data = await graduationListService.graduationData(context);

      http.setSuccess(200, 'Graduation Data fetched successfully', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Student Graduation Data', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

module.exports = GraduationDetailsController;
