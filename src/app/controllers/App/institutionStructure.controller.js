const { HttpResponse } = require('@helpers');
const { institutionStructureService } = require('@services/index');
const path = require('path');
const fs = require('fs');
const { appConfig } = require('@root/config');
const multerMiddleware = require('./institution.helper');
const multer = require('multer');
const http = new HttpResponse();

class InstitutionStructureController {
  /**
   * GET All InstitutionStructure.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async index(req, res) {
    try {
      const result =
        await institutionStructureService.findInstitutionStructureRecords({});

      http.setSuccess(200, 'Institution Structure retrieved successfully.', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setSuccess(400, 'Unable to fetch Institution Structure.', {
        error: { error: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * GET All InstitutionStructure BY STUDENT.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async structureForStudents(req, res) {
    try {
      const result =
        await institutionStructureService.findInstitutionStructureRecords({
          attributes: [
            'id',
            'institution_name',
            'institution_address',
            'institution_slogan',
            'institution_website',
            'institution_logo',
            'institution_email',
            'telephone_1',
            'telephone_2',
            'academic_units',
          ],
        });

      http.setSuccess(200, 'Institution Structure retrieved successfully.', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setSuccess(400, 'Unable to fetch Institution Structure.', {
        error: { error: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * CREATE New InstitutionStructure Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async createInstitutionStructure(req, res) {
    try {
      const data = req.body;
      const { id: authUserId } = req.user;

      data.created_by_id = authUserId;
      if (typeof data.academic_units !== 'object') {
        data.academic_units = JSON.parse(data.academic_units);
      }

      const record =
        await institutionStructureService.findInstitutionStructureRecords();

      if (record) {
        throw new Error('Institution Structure Has Already Been Set.');
      }

      const result =
        await institutionStructureService.createInstitutionStructure(data);

      http.setSuccess(201, 'Institution Structure created successfully.', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to create this Institution Structure.', {
        error: {
          message: error.message,
        },
      });

      return http.send(res);
    }
  }

  /**
   * UPDATE Specific InstitutionStructure Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async updateInstitutionStructure(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      const { id: authUserId } = req.user;

      data.last_updated_by_id = authUserId;

      if (typeof data.academic_units !== 'object') {
        data.academic_units = JSON.parse(data.academic_units);
      }
      const result =
        await institutionStructureService.updateInstitutionStructure(id, data);

      http.setSuccess(200, 'Institution Structure updated successfully.', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to update this Institution Structure.', {
        error: {
          message: error.message,
        },
      });

      return http.send(res);
    }
  }

  /**
   * UPDATE Institution Logo.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  newUploadLogo(req, res) {
    const uploadPath = path.join(appConfig.ASSETS_ROOT_DIRECTORY, 'logo');

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true }, (err) => {
        throw new Error(err.message);
      });
    }

    multerMiddleware(req, res, async (err) => {
      try {
        const { filename } = req.file;

        if (err instanceof multer.MulterError) {
          // A Multer error occurred when uploading.

          throw new Error(err);
        } else if (err) {
          // An unknown error occurred when uploading.
          throw new Error(err);
        }
        if (filename) {
          const { id: authUserId } = req.user;
          const findStructure =
            await institutionStructureService.findInstitutionStructureRecords();

          if (!findStructure) {
            throw new Error('Institution Structure Has Not Been Set.');
          }

          const data = {
            institution_logo: filename,
            last_updated_by_id: authUserId,
          };

          await institutionStructureService.updateInstitutionStructure(
            findStructure.id,
            data
          );
        } else {
          throw new Error('Error while uploading logo');
        }

        http.setSuccess(200, 'Institution Logo uploaded successfully.');

        return http.send(res);
      } catch (error) {
        http.setError(400, 'Unable to upload this Institution Logo.', {
          error: error.message,
        });

        return http.send(res);
      }
    });
  }
}

module.exports = InstitutionStructureController;
