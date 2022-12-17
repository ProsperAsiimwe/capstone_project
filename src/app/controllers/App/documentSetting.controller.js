const { HttpResponse } = require('@helpers');
const {
  documentSettingService,
  studentService,
  academicDocumentService,
} = require('@services/index');
const path = require('path');
const fs = require('fs');
const { appConfig } = require('@root/config');
const multerMiddleware = require('./document.helper');
const multer = require('multer');
const { isEmpty, pick, map, filter } = require('lodash');
const http = new HttpResponse();

class DocumentSettingController {
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
      const result = await documentSettingService.findAll({});

      http.setSuccess(200, 'Student Documents.', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setSuccess(400, 'Unable to fetch Institution Structure.', {
        error: error.message,
      });

      return http.send(res);
    }
  }

  /**
   * PREVIEW STUDENT DOCUMENT
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async previewDocument(req, res) {
    try {
      const { category } = req.params;
      const { studentIdentification } = req.query;

      const findStudent =
        await studentService.findStudentByRegistrationOrStudentNumber({
          student: studentIdentification,
        });

      const studentDetails = pick(findStudent, [
        'surname',
        'other_names',
        'email',
        'phone',
        'avatar',
        'date_of_birth',
        'academic_records',
      ]);

      const programmeIDs = map(
        filter(
          studentDetails.academic_records,
          (rec) => rec.on_graduation_list === true
        ),
        'id'
      );

      if (isEmpty(programmeIDs))
        throw new Error('This Student is not on Final Graduation List.');
      switch (category) {
        case 'transcript':
          break;

        default:
          throw new Error('Invalid Document category provided');
      }

      if (isEmpty(findStudent))
        throw new Error('Invalid Student Number or Registration Number');

      const result = await academicDocumentService.findAll({
        where: {
          student_programme_id: programmeIDs,
        },
      });

      if (isEmpty(result))
        throw new Error('This Student has no academic Documents generated');

      http.setSuccess(200, 'Institution Structure retrieved successfully.', {
        data: { result, studentDetails },
      });

      return http.send(res);
    } catch (error) {
      http.setSuccess(
        400,
        'Unable to fetch preview student academic Document',
        {
          error: error.message,
        }
      );

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
        await documentSettingService.findInstitutionStructureRecords();

      if (record) {
        throw new Error('Institution Structure Has Already Been Set.');
      }

      const result = await documentSettingService.createInstitutionStructure(
        data
      );

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
      const result = await documentSettingService.updateInstitutionStructure(
        id,
        data
      );

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
   * UPLOAD Signature.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  uploadSignature(req, res) {
    let filePath = 'documents/templates/MUK';

    if (appConfig.TAX_HEAD_CODE === 'FMUK01') {
      filePath = 'documents/templates/MAK';
    } else if (appConfig.TAX_HEAD_CODE === 'FKYU03') {
      filePath = 'documents/templates/KYU';
    } else if (appConfig.TAX_HEAD_CODE === 'FGUL06') {
      filePath = 'documents/templates/GUL';
    }

    const uploadPath = path.join(appConfig.ASSETS_ROOT_DIRECTORY, filePath);

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
          const { is_active: active, document_type: document } = req.body;

          const { id: authUserId } = req.user;

          const formData = {
            signature_name: filename,
            is_active: active,
            document_type: document,
            created_by_id: authUserId,
          };

          await documentSettingService.createDocumentSetting(formData);
        } else {
          throw new Error('Error while uploading Signature');
        }

        http.setSuccess(200, 'Signature uploaded successfully.');

        return http.send(res);
      } catch (error) {
        http.setError(400, 'Unable to upload this Signature.', {
          error: error.message,
        });

        return http.send(res);
      }
    });
  }
}

module.exports = DocumentSettingController;
