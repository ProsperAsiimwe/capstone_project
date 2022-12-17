const {
  pujabInstitutionProgrammeService,
  pujabInstitutionService,
  metadataService,
  metadataValueService,
} = require('@services/index');
const { HttpResponse } = require('@helpers');
const model = require('@models');
const XLSX = require('xlsx');
const excelJs = require('exceljs');
const formidable = require('formidable');
const fs = require('fs');
const { isEmpty, toUpper, now, trim } = require('lodash');
const { programmeTemplateColumns } = require('./templateColumns');
const {
  getMetadataValueId,
  getMetadataValues,
} = require('../Helpers/programmeHelper');
const {
  validateSheetColumns,
} = require('@controllers/Helpers/uploadValidator');
const http = new HttpResponse();

class PujabInstitutionProgrammeController {
  // index function to show applicants
  /**
   *
   * @param {*} req
   * @param {*} res
   */
  async getAllInstitutionProgrammes(req, res) {
    try {
      const { institutionId } = req.params;

      const applicants =
        await pujabInstitutionProgrammeService.findAllInstitutionProgrammes({
          where: {
            institution_id: institutionId,
          },
          ...getAllInstitutionProgrammeAttributes(),
        });

      http.setSuccess(200, 'Institution Programmes fetched successfully', {
        data: applicants,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to Institution Programmes', {
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
  async createProgramme(req, res) {
    try {
      const data = req.body;

      const result = await model.sequelize.transaction(async (transaction) => {
        const programmeData =
          await pujabInstitutionProgrammeService.createInstitutionProgramme(
            data,
            transaction
          );

        return programmeData;
      });

      http.setSuccess(200, 'Institution Programme created successfully', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to create institution programme', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async findOneInstitutionProgramme(req, res) {
    try {
      const { id } = req.params;
      const applicant =
        await pujabInstitutionProgrammeService.findOneInstitutionProgramme({
          where: { id },
        });

      http.setSuccess(200, 'InstitutionProgramme fetched successfully', {
        applicant,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to get this InstitutionProgramme.', {
        error: { error: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async downloadProgrammeUploadTemplate(req, res) {
    try {
      const workbook = new excelJs.Workbook();
      const { user } = req;

      const createProgramme = workbook.addWorksheet('CREATE PROGRAMME');
      const institutionSheet = workbook.addWorksheet('INSTITUTIONS');
      const durationMeasureSheet = workbook.addWorksheet('DURATION');
      const awardSheet = workbook.addWorksheet('AWARDS');
      const studyLevelSheet = workbook.addWorksheet('STUDY');

      createProgramme.properties.defaultColWidth =
        programmeTemplateColumns.length;
      createProgramme.columns = programmeTemplateColumns;
      createProgramme.getRow(1).height = 30;
      createProgramme.getRow(1).protection = {
        locked: 'TRUE',
        lockText: 'TRUE',
      };
      awardSheet.state = 'veryHidden';
      durationMeasureSheet.state = 'veryHidden';
      studyLevelSheet.state = 'veryHidden';
      institutionSheet.state = 'veryHidden';

      // GET VALUES FROM DATABASE
      const metadata = await metadataService.findAllMetadata({
        attributes: ['metadata_name'],
        include: [
          { association: 'metadataValues', attributes: ['metadata_value'] },
        ],
        raw: true,
        nest: true,
      });

      const institutions = await pujabInstitutionService.findAllInstitutions({
        raw: true,
      });

      institutionSheet.addRows(
        institutions.map((inst) => {
          return [`${inst.code}:${inst.name}`];
        })
      );

      awardSheet.addRows(getMetadataValues(metadata, 'AWARDS'));
      studyLevelSheet.addRows(
        getMetadataValues(metadata, 'PROGRAMME STUDY LEVELS')
      );
      durationMeasureSheet.addRows(
        getMetadataValues(metadata, 'DURATION MEASURES')
      );

      createProgramme.getColumn('Y').numFmt = '@';
      createProgramme.getColumn('Z').numFmt = '@';

      createProgramme.dataValidations.add('A2:A1000', {
        type: 'list',
        allowBlank: false,
        formulae: ['=INSTITUTIONS!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid VALUE from the list',
      });

      createProgramme.dataValidations.add('G2:G1000', {
        type: 'list',
        allowBlank: false,
        formulae: ['=DURATION!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid VALUE from the list',
      });

      createProgramme.dataValidations.add('H2:H1000', {
        type: 'list',
        allowBlank: false,
        formulae: ['=AWARDS!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid VALUE from the list',
      });

      createProgramme.dataValidations.add('I2:I1000', {
        type: 'list',
        allowBlank: false,
        formulae: ['=STUDY!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid VALUE from the list',
      });

      const uploadPath = `${process.cwd()}/src/assets/documents/templates`;

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true }, (err) => {
          throw new Error(err.message);
        });
      }

      const programmeTemplate = `${uploadPath}/download-institution-programme-template-${
        user.surname
      }-${user.other_names}-${user.id}-${now()}.xlsm`;

      await workbook.xlsx.writeFile(programmeTemplate);
      await res.download(
        programmeTemplate,
        'INSTITUTION-PROGRAMME-UPLOAD-TEMPLATE.xlsx',
        (error) => {
          if (error) {
            throw new Error(error.message);
          }
        }
      );
    } catch (error) {
      http.setError(400, 'Something went wrong.', { error: error.message });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   */
  uploadProgramme(req, res) {
    try {
      const data = req.body;
      const user = req.user.id;
      const form = new formidable.IncomingForm();
      const uploads = [];

      data.created_by_id = user;

      form.parse(req, async (err, fields, files) => {
        if (err) {
          http.setError(400, 'Unable To Upload Records.', {
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
        const uploadedRecords = XLSX.utils.sheet_to_json(
          workbook.Sheets[myTemplate]
        );

        if (isEmpty(uploadedRecords)) {
          http.setError(400, 'Cannot upload an empty template.');

          return http.send(res);
        }

        const metadataValues = await metadataValueService.findAllMetadataValues(
          {
            include: {
              association: 'metadata',
              attributes: ['id', 'metadata_name'],
            },
            attributes: ['id', 'metadata_value'],
          }
        );

        const institutions = await pujabInstitutionService.findAllInstitutions({
          raw: true,
        });

        /**
         *
         * @param {*} institution
         * @param {*} programmeTitle
         * @returns
         */
        const getInstitution = (institution, programmeTitle) => {
          try {
            const str = institution.substring(0, institution.indexOf(':'));

            const checkValue = institutions.find(
              (inst) => toUpper(trim(inst.code)) === toUpper(trim(str))
            );

            if (checkValue) return parseInt(checkValue.id, 10);
            throw new Error(
              `Cannot find ${institution} in the list of institutions for programme: ${programmeTitle}`
            );
          } catch (error) {
            throw new Error(error.message);
          }
        };

        try {
          await model.sequelize.transaction(async (transaction) => {
            for (const programme of uploadedRecords) {
              const data = {};

              const programmeTitle = programme['PROGRAMME TITLE'];

              validateSheetColumns(
                programme,
                [
                  'INSTITUTION',
                  'PROGRAMME TITLE',
                  'CODE',
                  'PROGRAMME DURATION',
                  'DURATION MEASURE',
                  'AWARD',
                  'STUDY LEVEL',
                ],
                programmeTitle || 'Programme'
              );

              data.programme_code = programme.CODE.toString();
              data.programme_title = programme['PROGRAMME TITLE'];
              data.programme_description = programme['PROGRAMME DESCRIPTION']
                ? programme['PROGRAMME DESCRIPTION']
                : null;
              data.academic_unit = programme['ACADEMIC UNIT']
                ? programme['ACADEMIC UNIT']
                : null;
              data.programme_duration = programme['PROGRAMME DURATION'];
              data.admission_requirements = programme['ADMISSION REQUIREMENTS']
                ? programme['ADMISSION REQUIREMENTS']
                : null;
              data.institution_id = getInstitution(
                trim(programme.INSTITUTION),
                programmeTitle
              );
              data.duration_measure_id = getMetadataValueId(
                metadataValues,
                programme['DURATION MEASURE'],
                'DURATION MEASURES',
                programmeTitle
              );
              data.award_id = getMetadataValueId(
                metadataValues,
                programme.AWARD,
                'AWARDS',
                programmeTitle
              );
              data.programme_study_level_id = getMetadataValueId(
                metadataValues,
                programme['STUDY LEVEL'],
                'PROGRAMME STUDY LEVELS',
                programmeTitle
              );

              const programmeData =
                await pujabInstitutionProgrammeService.createInstitutionProgramme(
                  data,
                  transaction
                );

              uploads.push(programmeData);
            }
          });
          http.setSuccess(200, 'All Records Uploaded Successfully.', {
            data: uploads,
          });

          return http.send(res);
        } catch (error) {
          http.setError(400, 'Unable To Upload Records.', {
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
   * UPDATE Specific Programme Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async updateInstitutionProgramme(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      const user = req.user.id;

      data.last_updated_by_id = user;

      const result = await model.sequelize.transaction(async (transaction) => {
        const program =
          await pujabInstitutionProgrammeService.updateInstitutionProgramme(
            id,
            data,
            transaction
          );
        const response = program[1][0];

        return response;
      });

      http.setSuccess(200, 'Programme updated successfully', { data: result });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to update this Programme.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Destroy
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async deleteInstitutionProgramme(req, res) {
    try {
      const { id } = req.params;

      await model.sequelize.transaction(async (transaction) => {
        await pujabInstitutionProgrammeService.deleteInstitutionProgramme(
          id,
          transaction
        );
      });

      http.setSuccess(200, 'Programme deleted successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to delete this Programme.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

const getAllInstitutionProgrammeAttributes = () => ({
  attributes: {
    exclude: [
      'created_at',
      'updated_at',
      'deleted_at',
      'createdById',
      'createApprovedById',
      'lastUpdatedById',
      'lastUpdateApprovedById',
      'deletedById',
      'deleteApprovedById',
      'deleteApprovedById',
      'delete_approval_status',
      'delete_approval_date',
      'delete_approved_by_id',
      'deleted_by_id',
      'last_update_approval_status',
      'last_update_approval_date',
      'last_update_approved_by_id',
      'last_updated_by_id',
      'create_approval_status',
      'create_approval_date',
      'create_approved_by_id',
      'created_by_id',
    ],
  },
  include: [
    {
      association: 'institution',
    },
    {
      association: 'studyLevel',
      attributes: ['id', 'metadata_value'],
    },
    {
      association: 'award',
      attributes: ['id', 'metadata_value'],
    },
    {
      association: 'durationMeasure',
      attributes: ['id', 'metadata_value'],
    },
  ],
});

module.exports = PujabInstitutionProgrammeController;
