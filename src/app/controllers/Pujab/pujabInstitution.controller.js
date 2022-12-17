const {
  pujabInstitutionService,
  metadataService,
  metadataValueService,
  pujabInstitutionProgrammeService,
} = require('@services/index');
const { HttpResponse } = require('@helpers');
const model = require('@models');
const XLSX = require('xlsx');
const excelJs = require('exceljs');
const formidable = require('formidable');
const fs = require('fs');
const { isEmpty, now } = require('lodash');
const { institutionTemplateColumns } = require('./templateColumns');
const {
  getMetadataValueId,
  getMetadataValues,
} = require('../Helpers/programmeHelper');
const {
  validateSheetColumns,
} = require('@controllers/Helpers/uploadValidator');
const http = new HttpResponse();

class InstitutionController {
  // index function to show
  /**
   *
   * @param {*} req
   * @param {*} res
   */
  async getAllInstitutions(req, res) {
    try {
      const result = await pujabInstitutionService.findAllInstitutions({
        ...getAllInstitutionAttributes(),
      });

      http.setSuccess(200, 'Institution fetched successfully', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to Institution.', {
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
  async createInstitution(req, res) {
    try {
      const data = req.body;

      const result = await model.sequelize.transaction(async (transaction) => {
        const response = await pujabInstitutionService.createInstitution(
          data,
          transaction
        );

        return response;
      });

      http.setSuccess(200, 'Institution created successfully', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to create institution', {
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
  async findOneInstitution(req, res) {
    try {
      const { id } = req.params;
      const record = await pujabInstitutionService.findOneInstitution({
        where: { id },
        ...getAllInstitutionAttributes(),
      });

      http.setSuccess(200, 'Institution fetched successfully', {
        record,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to get this Institution.', {
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
  async downloadInstitutionUploadTemplate(req, res) {
    try {
      const workbook = new excelJs.Workbook();
      const { user } = req;

      const createInstitution = workbook.addWorksheet('CREATE INSTITUTION');
      const institutionTypesSheet = workbook.addWorksheet('TYPES');

      createInstitution.properties.defaultColWidth =
        institutionTemplateColumns.length;
      createInstitution.columns = institutionTemplateColumns;
      createInstitution.getRow(1).height = 30;
      createInstitution.getRow(1).protection = {
        locked: 'TRUE',
        lockText: 'TRUE',
      };
      institutionTypesSheet.state = 'veryHidden';

      // GET VALUES FROM DATABASE
      const metadata = await metadataService.findAllMetadata({
        attributes: ['metadata_name'],
        include: [
          { association: 'metadataValues', attributes: ['metadata_value'] },
        ],
        raw: true,
        nest: true,
      });

      institutionTypesSheet.addRows(
        getMetadataValues(metadata, 'INSTITUTION TYPES')
      );

      createInstitution.dataValidations.add('M2:M1000', {
        type: 'list',
        allowBlank: false,
        formulae: ['=TYPES!$A$1:$A$1000'],
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

      const template = `${uploadPath}/download-institution-template-${
        user.surname
      }-${user.other_names}-${user.id}-${now()}.xlsm`;

      await workbook.xlsx.writeFile(template);
      await res.download(
        template,
        'INSTITUTION-UPLOAD-TEMPLATE.xlsx',
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
  uploadInstitution(req, res) {
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

        try {
          await model.sequelize.transaction(async (transaction) => {
            for (const item of uploadedRecords) {
              const errorName = item.NAME;

              validateSheetColumns(
                item,
                ['CODE', 'NAME', 'INSTITUTION TYPE'],
                errorName || 'Institution'
              );

              data.code = item.CODE.toString();
              data.name = item.NAME;
              data.address = item.ADDRESS ? item.ADDRESS : null;
              data.district = item.DISTRICT ? item.DISTRICT : null;
              data.village = item.VILLAGE ? item.VILLAGE : null;
              data.county = item.COUNTY ? item.COUNTY : null;
              data.slogan = item.SLOGAN ? item.SLOGAN : null;
              data.website = item.WEBSITE ? item.WEBSITE : null;
              data.email = item.EMAIL ? item.EMAIL : null;
              data.telephone_1 = item['TELEPHONE 1']
                ? item['TELEPHONE 1']
                : null;
              data.telephone_2 = item['TELEPHONE 2']
                ? item['TELEPHONE 2']
                : null;
              data.academic_unit = item['ACADEMIC UNIT']
                ? item['ACADEMIC UNIT']
                : null;

              data.institution_type_id = getMetadataValueId(
                metadataValues,
                item['INSTITUTION TYPE'],
                'INSTITUTION TYPES',
                errorName
              );

              const response = await pujabInstitutionService.createInstitution(
                data,
                transaction
              );

              uploads.push(response);
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
   * UPDATE Specific Institution Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async updateInstitution(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      const user = req.user.id;

      data.last_updated_by_id = user;

      const result = await model.sequelize.transaction(async (transaction) => {
        const institution = await pujabInstitutionService.updateInstitution(
          id,
          data,
          transaction
        );
        const response = institution[1][0];

        return response;
      });

      http.setSuccess(200, 'Institution updated successfully', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to update this Institution.', {
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
  async deleteInstitution(req, res) {
    try {
      const { id } = req.params;

      const record = await pujabInstitutionService.findOneInstitution({
        where: { id },
        ...getAllInstitutionAttributes(),
      });

      await model.sequelize.transaction(async (transaction) => {
        if (!isEmpty(record.programmes)) {
          for (const item of record.programmes) {
            await pujabInstitutionProgrammeService.deleteInstitutionProgramme(
              item.id,
              transaction
            );
          }
        }

        await pujabInstitutionService.deleteInstitution(id, transaction);
      });

      http.setSuccess(200, 'Institution deleted successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to delete this Institution.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

const getAllInstitutionAttributes = () => ({
  include: [
    {
      association: 'institutionType',
      attributes: ['id', 'metadata_value'],
    },
    {
      association: 'programmes',
      include: [
        {
          association: 'durationMeasure',
          attributes: ['id', 'metadata_value'],
        },
        {
          association: 'award',
          attributes: ['id', 'metadata_value'],
        },
        {
          association: 'studyLevel',
          attributes: ['id', 'metadata_value'],
        },
      ],
    },
  ],
});

module.exports = InstitutionController;
