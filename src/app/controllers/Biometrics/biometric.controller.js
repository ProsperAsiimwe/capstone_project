const HttpResponse = require('@helpers/http-response');
const { institutionStructureService } = require('@services/index');

const http = new HttpResponse();

class BiometricController {
  async institution(req, res) {
    try {
      const institution =
        await institutionStructureService.findInstitutionStructureRecords({
          attributes: [
            'institution_name',
            'institution_address',
            'institution_slogan',
            'institution_logo',
            'institution_website',
            'academic_units',
          ],
        });

      http.setSuccess(200, 'Institution Information', {
        data: institution,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to fetch Institution Information.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

module.exports = BiometricController;
