const { HttpResponse } = require('@helpers');
const {
  unebSubjectService,
  metadataService,
  metadataValueService,
} = require('@services/index');
const { isEmpty, toUpper, now, trim } = require('lodash');
const model = require('@models');
const XLSX = require('xlsx');
const excelJs = require('exceljs');
const formidable = require('formidable');
const { unebSubjectsTemplateColumns } = require('./templateColumns');
const fs = require('fs');
const {
  getMetadataValueId,
  getMetadataValues,
} = require('../Helpers/programmeHelper');
const {
  validateSheetColumns,
} = require('@controllers/Helpers/uploadValidator');

const http = new HttpResponse();

class UnebSubjectController {
  /**
   * GET All UnebSubjects.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async index(req, res) {
    try {
      const unebSubjects = await unebSubjectService.findAllUnebSubjects({
        include: [
          {
            association: 'unebStudyLevel',
            attributes: ['id', 'metadata_value'],
          },
          {
            association: 'unebSubjectCategory',
            attributes: ['id', 'metadata_value'],
          },
          {
            association: 'generalSubjectCategory',
            attributes: ['id', 'metadata_value'],
          },
        ],
      });

      http.setSuccess(200, 'UnebSubjects', { unebSubjects });

      return http.send(res);
    } catch (error) {
      http.setSuccess(400, error.message);

      return http.send(res);
    }
  }

  async indexApplicantSide(req, res) {
    try {
      const unebSubjects = await unebSubjectService.findAllUnebSubjects(
        ...getUnebSubjectsForApplicantAttributes
      );

      http.setSuccess(200, 'Uneb Subjects Fetched Successfully', {
        unebSubjects,
      });

      return http.send(res);
    } catch (error) {
      http.setSuccess(400, error.message);

      return http.send(res);
    }
  }

  /**
   * CREATE New UnebSubject Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async createUnebSubject(req, res) {
    try {
      const data = req.body;
      const { id } = req.user;

      data.created_by_id = parseInt(id, 10);

      data.uneb_subject_code = trim(data.uneb_subject_code);

      const submittedUnebSubject = await model.sequelize.transaction(
        async (transaction) => {
          const upload = await insertNewUnebSubject(data, transaction);

          return upload;
        }
      );

      http.setSuccess(201, 'UnebSubject created successfully', {
        data: submittedUnebSubject,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to create this UnebSubject.', { error });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   */
  uploadUnebSubjects(req, res) {
    try {
      const data = req.body;
      const user = req.user.id;
      const form = new formidable.IncomingForm();
      const uploadedUnebSubjects = [];

      data.created_by_id = user;

      form.parse(req, async (err, fields, files) => {
        if (err) {
          http.setError(400, 'Unable To Upload Uneb Subjects.', {
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

        const getPapers = (value) => {
          try {
            const splittedText = !isEmpty(value) ? value.split(',') : [];

            const newArray = [];

            splittedText.forEach((text) => {
              newArray.push({
                paper: text,
              });
            });

            return newArray;
          } catch (error) {
            throw new Error(error.message);
          }
        };

        try {
          await model.sequelize.transaction(async (transaction) => {
            for (const row of templateData) {
              if (!row['SUBJECT CODE']) {
                throw new Error(`One Of The Records Provided Has No Code.`);
              }

              data.uneb_subject_code = toUpper(
                trim(row['SUBJECT CODE'])
              ).toString();

              validateSheetColumns(
                row,
                [
                  'SUBJECT CODE',
                  'SUBJECT TITLE',
                  'UNEB STUDY LEVEL',
                  'GENERAL SUBJECT CATEGORY',
                ],
                data.uneb_subject_code
              );

              data.uneb_subject_title = toUpper(
                trim(row['SUBJECT TITLE'])
              ).toString();

              data.uneb_study_level_id = getMetadataValueId(
                metadataValues,
                row['UNEB STUDY LEVEL'],
                'UNEB STUDY LEVELS',
                data.uneb_subject_code
              );

              data.general_subject_category_id = getMetadataValueId(
                metadataValues,
                row['GENERAL SUBJECT CATEGORY'],
                'GENERAL SUBJECT CATEGORIES',
                data.uneb_subject_code
              );

              if (row['UNEB SUBJECT CATEGORY']) {
                data.uneb_subject_category_id = getMetadataValueId(
                  metadataValues,
                  row['UNEB SUBJECT CATEGORY'],
                  'UNEB CATEGORIES',
                  data.uneb_subject_code
                );
              }

              if (row['PAPERS (COMMA SEPARATED) eg. Paper 1, Paper 2']) {
                data.papers = getPapers(
                  row['PAPERS (COMMA SEPARATED) eg. Paper 1, Paper 2']
                );
              }

              const upload = await insertNewUnebSubject(data, transaction);

              uploadedUnebSubjects.push(upload);
            }
          });
          http.setSuccess(200, 'Uneb Subjects Uploaded successfully.', {
            data: uploadedUnebSubjects,
          });

          return http.send(res);
        } catch (error) {
          http.setError(400, 'Unable to upload Uneb Subjects.', {
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
  async downloadUnebSubjectsTemplate(req, res) {
    try {
      const { user } = req;

      const workbook = new excelJs.Workbook();

      const rootSheet = workbook.addWorksheet('CREATE UNEB SUBJECTS');
      const unebStudyLevelSheet = workbook.addWorksheet('Sheet2');
      const unebSubjectCategorySheet = workbook.addWorksheet('Sheet3');
      const generalSubjectCategorySheet = workbook.addWorksheet('Sheet4');

      rootSheet.properties.defaultColWidth = unebSubjectsTemplateColumns.length;
      rootSheet.columns = unebSubjectsTemplateColumns;
      unebStudyLevelSheet.state = 'veryHidden';
      unebSubjectCategorySheet.state = 'veryHidden';
      generalSubjectCategorySheet.state = 'veryHidden';

      const metadata = await metadataService.findAllMetadata({
        attributes: ['metadata_name'],
        include: [
          { association: 'metadataValues', attributes: ['metadata_value'] },
        ],
        raw: true,
        nest: true,
      });

      unebStudyLevelSheet.addRows(
        getMetadataValues(metadata, 'UNEB STUDY LEVELS')
      );

      unebSubjectCategorySheet.addRows(
        getMetadataValues(metadata, 'UNEB CATEGORIES')
      );

      generalSubjectCategorySheet.addRows(
        getMetadataValues(metadata, 'GENERAL SUBJECT CATEGORIES')
      );

      // Add some data validations
      rootSheet.dataValidations.add('C2:C1000', {
        type: 'list',
        allowBlank: false,
        formulae: ['=Sheet2!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid value from the list',
      });

      rootSheet.dataValidations.add('E2:E1000', {
        type: 'list',
        allowBlank: false,
        formulae: ['=Sheet3!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid value from the list',
      });

      rootSheet.dataValidations.add('D2:D1000', {
        type: 'list',
        allowBlank: false,
        formulae: ['=Sheet4!$A$1:$A$1000'],
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

      const template = `${uploadPath}/download-uneb-subjects-upload-template-${
        user.surname
      }-${user.other_names}-${user.id}-${now()}.xlsm`;

      await workbook.xlsx.writeFile(template);
      await res.download(
        template,
        'UNEB-SUBJECTS-UPLOAD-TEMPLATE.xlsx',
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
   * UPDATE Specific UnebSubject Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async updateUnebSubject(req, res) {
    try {
      const { id } = req.params;
      const updateUnebSubject = await unebSubjectService.updateUnebSubject(
        id,
        req.body
      );
      const unebSubject = updateUnebSubject[1][0];

      http.setSuccess(200, 'UnebSubject updated successfully', { unebSubject });
      if (isEmpty(unebSubject))
        http.setError(404, 'UnebSubject Data Not Found.');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to update this UnebSubject.', { error });

      return http.send(res);
    }
  }

  /**
   * Get Specific UnebSubject Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async fetchUnebSubject(req, res) {
    const { id } = req.params;
    const unebSubject = await unebSubjectService.findOneUnebSubject({
      where: { id },
    });

    http.setSuccess(200, 'UnebSubject fetch successful', { unebSubject });
    if (isEmpty(unebSubject)) http.setError(404, 'UnebSubject Data Not Found.');

    return http.send(res);
  }

  /**
   * Destroy UnebSubject Data
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async deleteUnebSubject(req, res) {
    try {
      const { id } = req.params;

      await unebSubjectService.deleteUnebSubject(id);
      http.setSuccess(200, 'UnebSubject deleted successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to delete this UnebSubject.', { error });

      return http.send(res);
    }
  }
}

/**
 *
 * @param {*} data
 * @param {*} transaction
 */
const insertNewUnebSubject = async (data, transaction) => {
  const result = await unebSubjectService.createUnebSubject(data, transaction);

  return result;
};

const getUnebSubjectsForApplicantAttributes = [
  {
    attributes: ['id', 'uneb_subject_code', 'uneb_subject_title'],
    include: [
      {
        association: 'unebStudyLevel',
        attributes: ['id', 'metadata_value'],
      },
    ],
  },
];

module.exports = UnebSubjectController;
