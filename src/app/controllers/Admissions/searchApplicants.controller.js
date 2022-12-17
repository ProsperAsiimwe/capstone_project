const { HttpResponse } = require('@helpers');
const { searchApplicantsService } = require('@services/index');

const http = new HttpResponse();

class SearchApplicantsController {
  async searchApplicant(req, res) {
    try {
      let data = [];

      if (req.query.formId) {
        const context = req.query;

        data = await searchApplicantsService.searchApplicantByForm(context);
      } else if (
        req.query.contact &&
        req.query.academic_year_id &&
        req.query.intake_id &&
        req.query.admission_scheme_id
      ) {
        const context = req.query;

        data = await searchApplicantsService.searchApplicantByContact(context);
      } else if (
        req.query.name &&
        req.query.academic_year_id &&
        req.query.intake_id &&
        req.query.admission_scheme_id
      ) {
        const context = req.query;

        data = await searchApplicantsService.searchApplicantByName(context);
      } else {
        throw new Error('Invalid Data Request');
      }

      http.setSuccess(200, 'Applicant Records fetched successfully', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Applicant', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

module.exports = SearchApplicantsController;
