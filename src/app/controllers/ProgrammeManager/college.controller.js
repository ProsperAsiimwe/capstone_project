const { HttpResponse } = require('@helpers');
const { collegeService, userService } = require('@services/index');
const { isEmpty, now, toUpper } = require('lodash');
const XLSX = require('xlsx');
const formidable = require('formidable');
const excelJs = require('exceljs');
const fs = require('fs');
const model = require('@models');
const { collegeTemplateColumns } = require('../App/templateColumns');
const {
  validateSheetColumns,
} = require('@controllers/Helpers/uploadValidator');

const http = new HttpResponse();

class CollegeController {
  /**
   * GET All Colleges.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async index(req, res) {
    try {
      const colleges = await collegeService.findAllColleges({
        include: { all: true },
        order: ['college_title'],
      });

      http.setSuccess(200, 'Colleges Fetched Successfully.', { colleges });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Colleges.', { error });

      return http.send(res);
    }
  }

  /**
   * CREATE New College Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async createCollege(req, res) {
    try {
      const data = req.body;
      const { id } = req.user;

      data.created_by_id = parseInt(id, 10);
      data.college_code = data.college_code.toUpperCase();
      data.college_title = data.college_title.toUpperCase();

      const college = await model.sequelize.transaction(async (transaction) => {
        const result = await insertNewCollege(data, transaction);

        return result;
      });

      http.setSuccess(201, 'College created successfully', { college });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to create this College.', { error });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   */
  async downloadCollegeTemplate(req, res) {
    try {
      const { user } = req;

      const workbook = new excelJs.Workbook();

      const users = await userService.findAllUsers();

      const createCollegesSheet = workbook.addWorksheet('CREATE COLLEGES');
      const headedBySheet = workbook.addWorksheet('Sheet2');

      createCollegesSheet.properties.defaultColWidth =
        collegeTemplateColumns.length;

      createCollegesSheet.columns = collegeTemplateColumns;

      headedBySheet.state = 'veryHidden';

      headedBySheet.addRows(
        users.map((user) => [`${user.surname} ${user.other_names}`])
      );

      // Column Validations

      // Fees Waiver
      createCollegesSheet.dataValidations.add('H2:H2000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=Sheet2!$A$1:$A$2000'],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: 'Please select a valid value from the list',
      });

      const uploadPath = `${process.cwd()}/src/assets/documents/templates`;

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true }, (err) => {
          throw new Error(err.message);
        });
      }

      const template = `${uploadPath}/download-colleges-upload-template-${
        user.surname
      }-${user.other_names}-${user.id}-${now()}.xlsm`;

      await workbook.xlsx.writeFile(template);
      await res.download(template, 'COLLEGES-UPLOAD-TEMPLATE.xlsx', (error) => {
        if (error) {
          throw new Error(error.message);
        }
      });
    } catch (error) {
      http.setError(400, 'Unable To Download This Template.', {
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
  async uploadCollegesTemplate(req, res) {
    try {
      const data = req.body;
      const user = req.user.id;
      const form = new formidable.IncomingForm();
      const results = [];

      const users = await userService.findAllUsers();

      data.created_by_id = user;

      form.parse(req, async (err, fields, files) => {
        if (err) {
          http.setError(400, 'Unable To Upload Colleges.', {
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

        const getHead = (value, record) => {
          try {
            const checkValue = users.find(
              (user) =>
                toUpper(user.surname) === toUpper(value.split(' ')[0]) &&
                toUpper(user.other_names) === toUpper(value.split(' ')[1])
            );

            if (checkValue) return parseInt(checkValue.id, 10);
            throw new Error(
              `Cannot find ${value} in the list of users on record: ${record}`
            );
          } catch (error) {
            throw new Error(error.message);
          }
        };

        try {
          await model.sequelize.transaction(async (transaction) => {
            for (const template of templateData) {
              if (!template['COLLEGE CODE']) {
                throw new Error(`One Of The Colleges Provided Has No Code..`);
              }
              data.college_code = template['COLLEGE CODE'].toUpperCase();

              validateSheetColumns(
                template,
                ['COLLEGE CODE', 'COLLEGE TITLE', 'COLLEGE CONTACT'],
                data.college_code
              );

              data.college_title = template['COLLEGE TITLE'].toUpperCase();

              data.college_contact = template['COLLEGE CONTACT'];

              if (template['COLLEGE WEBSITE']) {
                data.college_website = template['COLLEGE WEBSITE'];
              }

              if (template['COLLEGE ADDRESS']) {
                data.college_address = template['COLLEGE ADDRESS'];
              }

              if (template['COLLEGE EMAIL']) {
                data.college_email = template['COLLEGE EMAIL'];
              }

              if (template['DATE ESTABLISHED (MM/DD/YYYY)']) {
                data.date_established =
                  template['DATE ESTABLISHED (MM/DD/YYYY)'];
              }

              if (template['COLLEGE HEAD']) {
                data.headed_by_id = getHead(
                  template['COLLEGE HEAD'],
                  data.college_code
                );
              }

              const upload = await insertNewCollege(data, transaction);

              results.push(upload[0]);
            }
          });
          http.setSuccess(200, 'Template Uploaded successfully.', {
            data: results,
          });

          return http.send(res);
        } catch (error) {
          http.setError(400, 'Unable To Upload Template.', {
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
   * UPDATE Specific College Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async updateCollege(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      data.college_code = data.college_code.toUpperCase();
      data.college_title = data.college_title.toUpperCase();
      const updateCollege = await collegeService.updateCollege(id, data);
      const college = updateCollege[1][0];

      http.setSuccess(200, 'College updated successfully', { college });
      if (isEmpty(college)) http.setError(404, 'College Data Not Found.');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to update this College.', { error });

      return http.send(res);
    }
  }

  /**
   * Get Specific College Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async fetchCollege(req, res) {
    const { id } = req.params;
    const college = await collegeService.findOneCollege({
      where: { id },
      include: { all: true },
    });

    http.setSuccess(200, 'College fetch successfull', { college });
    if (isEmpty(college)) http.setError(404, 'College Data Not Found.');

    return http.send(res);
  }

  /**
   * Destroy College Data
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async deleteCollege(req, res) {
    try {
      const { id } = req.params;

      await collegeService.deleteCollege(id);
      http.setSuccess(200, 'College deleted successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to delete this College.', { error });

      return http.send(res);
    }
  }
}

/**
 *
 * @param {*} data
 * @param {*} transaction
 */
const insertNewCollege = async function (data, transaction) {
  const result = await collegeService.createCollege(data, transaction);

  return result;
};

module.exports = CollegeController;
