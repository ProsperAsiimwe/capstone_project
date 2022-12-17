const { HttpResponse } = require('@helpers');
const {
  emisService,
  metadataService,
  sponsorService,
} = require('@services/index');
const { authFunction } = require('./helper/authHelper');

const http = new HttpResponse();

class EmisController {
  async institutionDetailsFunction(req, res) {
    try {
      const data = await emisService.findInstitutionDetails({
        attributes: {
          exclude: [
            'id',
            'institution_logo',
            'created_at',
            'updated_at',
            'created_by_id',
            'create_approved_by_id',
            'create_approval_date',
            'create_approval_status',
            'last_updated_by_id',
            'last_update_approved_by_id',
            'last_update_approval_date',
            'last_update_approval_status',
            'lastUpdatedById',
            'lastUpdateApprovedById',
          ],
        },
      });

      http.setSuccess(200, 'Institution Details fetched successfully', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Data', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  // institution campus

  async institutionCampus(req, res) {
    try {
      const context = req.body;

      await authFunction(context);

      const campus = await metadataService.findAllMetadata({
        where: { metadata_name: 'CAMPUSES' },
        attributes: ['metadata_name', 'metadata_description'],
        exclude: ['id'],
        include: [
          {
            association: 'metadataValues',
            separate: true,
            attributes: ['metadata_value', 'metadata_value_description'],
            order: ['metadata_value'],
            exclude: ['id'],
          },
        ],
      });

      http.setSuccess(200, 'Institution Campuses fetched successfully', {
        data: campus,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Data', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  // study levels

  async institutionStudyLevel(req, res) {
    try {
      const context = req.body;

      await authFunction(context);

      const campus = await metadataService.findAllMetadata({
        where: { metadata_name: 'PROGRAMME STUDY LEVELS' },
        attributes: ['metadata_name', 'metadata_description'],
        exclude: ['id'],
        include: [
          {
            association: 'metadataValues',
            separate: true,
            attributes: ['metadata_value', 'metadata_value_description'],
            order: ['metadata_value'],
            exclude: ['id'],
          },
        ],
      });

      http.setSuccess(200, 'Institution STUDY Levels fetched successfully', {
        data: campus,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Data', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  // apiAdmissionSchemes

  async apiAdmissionSchemes(req, res) {
    try {
      const context = req.body;

      await authFunction(context);

      const AdmissionSchemes = await emisService.apiAdmissionSchemes();

      http.setSuccess(
        200,
        'Institution Admission Schemes fetched successfully',
        {
          data: AdmissionSchemes,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Data', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  // sponsorService

  async apiSponsors(req, res) {
    try {
      const context = req.body;

      await authFunction(context);

      const sponsors = await sponsorService.findAllRecords({
        attributes: ['sponsor_name', 'sponsor_email', 'sponsor_phone'],
      });

      http.setSuccess(200, 'Institution sponsors fetched successfully', {
        data: sponsors,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Data', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

module.exports = EmisController;
