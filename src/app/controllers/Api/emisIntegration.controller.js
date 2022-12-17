const { HttpResponse } = require('@helpers');
const http = new HttpResponse();

const { emisIntegrationService } = require('@services/index');

class EmisIntegrationController {
  async universitySponsors(req, res) {
    try {
      const data = await emisIntegrationService.getAcmisSponsors();

      http.setSuccess(200, 'Sponsor fetched successfully', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  // getAcmisCampuses
  async universityCampuses(req, res) {
    try {
      const context = 'CAMPUSES';

      const data = await emisIntegrationService.getAcmisMetadata(context);

      http.setSuccess(200, 'Campus fetched successfully', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  // getAcmisSchemes

  async universityScheme(req, res) {
    try {
      const data = await emisIntegrationService.getAcmisSchemes();

      http.setSuccess(200, 'Schemes fetched successfully', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  //

  async universityStudyLevel(req, res) {
    try {
      const context = 'PROGRAMME STUDY LEVELS';
      const data = await emisIntegrationService.getAcmisMetadata(context);

      http.setSuccess(200, 'Study Levels fetched successfully', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  // getAcmisProgrammes
  async universityProgramme(req, res) {
    try {
      const data = await emisIntegrationService.getAcmisProgrammes();

      http.setSuccess(200, 'Programmes fetched successfully', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

module.exports = EmisIntegrationController;
