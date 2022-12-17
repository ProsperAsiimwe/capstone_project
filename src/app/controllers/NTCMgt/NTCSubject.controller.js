const { HttpResponse } = require('@helpers');
const {
  NTCSubjectService,
  metadataService,
  metadataValueService,
} = require('@services/index');
const { isEmpty, toUpper, now, trim, flattenDeep } = require('lodash');
const model = require('@models');
const XLSX = require('xlsx');
const excelJs = require('exceljs');
const formidable = require('formidable');
const { NTCSubjectsTemplateColumns } = require('./templateColumns');
const fs = require('fs');
const {
  getMetadataValueId,
  getMetadataValues,
} = require('../Helpers/programmeHelper');
const {
  validateSheetColumns,
} = require('@controllers/Helpers/uploadValidator');

const http = new HttpResponse();

class NTCSubjectController {
  /**
   * GET All NTCSubjects.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async index(req, res) {
    try {
      const subjects = await NTCSubjectService.findAll({
        include: [
          {
            all: true,
          },
        ],
      });

      http.setSuccess(200, 'NTCSubjects', { subjects });

      return http.send(res);
    } catch (error) {
      http.setSuccess(400, error.message);

      return http.send(res);
    }
  }

  /**
   * CREATE New NTCSubject Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async createNTCSubject(req, res) {
    try {
      const data = req.body;
      const { id } = req.user;

      data.created_by_id = parseInt(id, 10);

      data.ntc_subject_code = trim(data.ntc_subject_code);

      const submittedNTCSubject = await model.sequelize.transaction(
        async (transaction) => {
          const upload = await insertNewNTCSubject(data, transaction);

          return upload;
        }
      );

      http.setSuccess(201, 'NTCSubject created successfully', {
        data: submittedNTCSubject,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to create this NTCSubject.', { error });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   */
  uploadNTCSubjects(req, res) {
    try {
      const data = req.body;
      const user = req.user.id;
      const form = new formidable.IncomingForm();
      const uploadedNTCSubjects = [];

      data.created_by_id = user;

      form.parse(req, async (err, fields, files) => {
        if (err) {
          http.setError(400, 'Unable To Upload NTC Subjects.', {
            error: { err },
          });

          return http.send(res);
        }

        const file = files[Object.keys(files)[0]];

        if (!file) {
          http.setError(400, 'Please Select A File To Upload.');

          return http.send(res);
        }

        const workbook = XLSX.readFile(file.filepath, { cellDates: true });
        const myTemplate = workbook.SheetNames[0];
        const templateData = XLSX.utils.sheet_to_json(
          workbook.Sheets[myTemplate]
        );

        if (isEmpty(templateData)) {
          http.setError(400, 'Cannot upload an empty template.');

          return http.send(res);
        }

        const metadataValues = await metadataValueService.findAllMetadataValues(
          {
            include: ['metadata'],
          }
        );

        try {
          await model.sequelize.transaction(async (transaction) => {
            for (const row of templateData) {
              if (!row['SUBJECT CODE']) {
                throw new Error(`One Of The Records Provided Has No Code.`);
              }

              data.ntc_subject_code = toUpper(
                trim(row['SUBJECT CODE'])
              ).toString();

              validateSheetColumns(
                row,
                ['SUBJECT CODE', 'SUBJECT TITLE', 'SUBJECT CATEGORY'],
                data.ntc_subject_code
              );

              data.ntc_subject_title = toUpper(
                trim(row['SUBJECT TITLE'])
              ).toString();

              data.ntc_subject_category_id = getMetadataValueId(
                metadataValues,
                trim(row['SUBJECT CATEGORY']),
                'NTC SUBJECT CATEGORIES',
                data.ntc_subject_code
              );

              const upload = await insertNewNTCSubject(data, transaction);

              uploadedNTCSubjects.push(upload);
            }
          });
          http.setSuccess(200, 'NTC Subjects Uploaded successfully.', {
            data: uploadedNTCSubjects,
          });

          return http.send(res);
        } catch (error) {
          http.setError(400, 'Unable to upload NTC Subjects.', {
            error: { message: error.message },
          });

          return http.send(res);
        }
      });
    } catch (error) {
      http.setError(400, 'Unable To Upload This Template.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   */
  async downloadNTCSubjectsTemplate(req, res) {
    try {
      const { user } = req;
      const workbook = new excelJs.Workbook();
      const rootSheet = workbook.addWorksheet('CREATE NTC SUBJECTS');

      rootSheet.properties.defaultColWidth = NTCSubjectsTemplateColumns.length;
      rootSheet.columns = NTCSubjectsTemplateColumns;

      const metadata = await metadataService.findAllMetadata({
        attributes: ['metadata_name'],
        include: [
          { association: 'metadataValues', attributes: ['metadata_value'] },
        ],
        raw: true,
        nest: true,
      });

      const subjectCategories = flattenDeep(
        getMetadataValues(metadata, 'NTC SUBJECT CATEGORIES')
      ).toString();

      // Add some data validations
      rootSheet.dataValidations.add('D2:D1000', {
        type: 'list',
        allowBlank: false,
        formulae: [`"${subjectCategories}"`],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid value from the list',
      });

      const uploadPath = `${process.cwd()}/src/assets/documents/templates`;

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true }, (err) => {
          throw new Error(err.message);
        });
      }

      const template = `${uploadPath}/download-NTC-subjects-upload-template-${
        user.surname
      }-${user.other_names}-${user.id}-${now()}.xlsm`;

      await workbook.xlsx.writeFile(template);
      await res.download(
        template,
        'NTC-SUBJECTS-UPLOAD-TEMPLATE.xlsx',
        (error) => {
          if (error) {
            throw new Error(error.message);
          }
        }
      );
    } catch (error) {
      http.setError(400, 'Unable to download this template.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * UPDATE Specific NTCSubject Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async updateNTCSubject(req, res) {
    try {
      const { id } = req.params;
      const updateNTCSubject = await NTCSubjectService.update(id, req.body);
      const NTCSubject = updateNTCSubject[1][0];

      http.setSuccess(200, 'NTCSubject updated successfully', { NTCSubject });
      if (isEmpty(NTCSubject)) http.setError(404, 'NTCSubject Data Not Found.');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to update this NTCSubject.', { error });

      return http.send(res);
    }
  }

  /**
   * Get Specific NTCSubject Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async findNTCSubject(req, res) {
    const { id } = req.params;
    const NTCSubject = await NTCSubjectService.findOne({
      where: { id },
    });

    http.setSuccess(200, 'NTCSubject fetch successful', { NTCSubject });
    if (isEmpty(NTCSubject)) http.setError(404, 'NTCSubject Data Not Found.');

    return http.send(res);
  }

  /**
   * Destroy NTCSubject Data
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async deleteNTCSubject(req, res) {
    try {
      const { id } = req.params;

      await NTCSubjectService.delete(id);
      http.setSuccess(200, 'NTCSubject deleted successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to delete this NTCSubject.', { error });

      return http.send(res);
    }
  }
}

/**
 *
 * @param {*} data
 * @param {*} transaction
 */
const insertNewNTCSubject = async (data, transaction) => {
  const result = await NTCSubjectService.create(data, transaction);

  return result;
};

module.exports = NTCSubjectController;
