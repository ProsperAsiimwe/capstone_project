const { HttpResponse } = require('@helpers');
const {
  facultyService,
  userService,
  collegeService,
} = require('@services/index');
const moment = require('moment');
const { isEmpty, now, toUpper, trim } = require('lodash');
const XLSX = require('xlsx');
const formidable = require('formidable');
const excelJs = require('exceljs');
const fs = require('fs');
const model = require('@models');
const { facultyTemplateColumns } = require('../App/templateColumns');
const {
  validateSheetColumns,
} = require('@controllers/Helpers/uploadValidator');

const http = new HttpResponse();

class FacultyController {
  /**
   * Faculty Index api method.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async index(req, res) {
    const faculties = await facultyService.findAllFaculties({
      ...facultyAttributes(),
      order: ['faculty_title'],
    });

    http.setSuccess(200, 'Faculties retrieved successfully', { faculties });

    return http.send(res);
  }

  /**
   * Store New Faculty data.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async store(req, res) {
    const { body } = req;
    const { id } = req.user;

    try {
      const data = body;

      if (data.date_established)
        data.date_established = moment(body.date_established).format(
          'MM-DD-YYYY'
        );
      data.created_by_id = parseInt(id, 10);
      data.faculty_code = data.faculty_code.toUpperCase();
      data.faculty_title = data.faculty_title.toUpperCase();

      const faculty = await model.sequelize.transaction(async (transaction) => {
        const result = await insertNewFaculty(data, transaction);

        return result;
      });

      http.setSuccess(201, 'Faculty created successfully.', { faculty });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to create this Faculty.', {
        error: error,
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   */
  async downloadFacultyTemplate(req, res) {
    try {
      const { user } = req;

      const workbook = new excelJs.Workbook();

      const users = await userService.findAllUsers();

      const colleges = await collegeService.findAllColleges({
        attributes: ['id', 'college_code', 'college_title'],
        order: ['college_title'],
        raw: true,
      });

      const createFacultiesSheet = workbook.addWorksheet('CREATE FACULTIES');
      const headedBySheet = workbook.addWorksheet('Sheet2');
      const collegesSheet = workbook.addWorksheet('Sheet3');

      createFacultiesSheet.properties.defaultColWidth =
        facultyTemplateColumns.length;

      createFacultiesSheet.columns = facultyTemplateColumns;

      headedBySheet.state = 'veryHidden';
      collegesSheet.state = 'veryHidden';

      headedBySheet.addRows(
        users.map((user) => [`${user.surname} ${user.other_names}`])
      );

      collegesSheet.addRows(
        colleges.map((college) => [
          `(${college.college_code}):${college.college_title}`,
        ])
      );

      // Column Validations

      createFacultiesSheet.dataValidations.add('H2:H2000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=Sheet2!$A$1:$A$2000'],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: 'Please select a valid value from the list',
      });

      createFacultiesSheet.dataValidations.add('I2:I2000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=Sheet3!$A$1:$A$2000'],
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

      const template = `${uploadPath}/download-faculties-upload-template-${
        user.surname
      }-${user.other_names}-${user.id}-${now()}.xlsm`;

      await workbook.xlsx.writeFile(template);
      await res.download(
        template,
        'FACULTIES-UPLOAD-TEMPLATE.xlsx',
        (error) => {
          if (error) {
            throw new Error(error.message);
          }
        }
      );
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
  async uploadFacultiesTemplate(req, res) {
    try {
      const data = req.body;
      const user = req.user.id;
      const form = new formidable.IncomingForm();
      const results = [];

      const users = await userService.findAllUsers();

      const colleges = await collegeService.findAllColleges({
        attributes: ['id', 'college_code', 'college_title'],
        order: ['college_title'],
        raw: true,
      });

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

        const getCollege = (value, record) => {
          try {
            const str = value.substring(0, value.indexOf(':'));

            const checkValue = colleges.find(
              (prog) =>
                toUpper(trim(prog.college_code)) ===
                toUpper(trim(str.replace(/[()]/g, '')))
            );

            if (checkValue) return parseInt(checkValue.id, 10);
            throw new Error(
              `Cannot find ${value} in the list of colleges for record ${record}`
            );
          } catch (error) {
            throw new Error(error.message);
          }
        };

        try {
          await model.sequelize.transaction(async (transaction) => {
            for (const template of templateData) {
              if (!template['FACULTY CODE']) {
                throw new Error(`One Of The Faculties Provided Has No Code..`);
              }
              data.faculty_code = template['FACULTY CODE'].toUpperCase();

              validateSheetColumns(
                template,
                ['FACULTY CODE', 'FACULTY TITLE', 'FACULTY CONTACT'],
                data.faculty_code
              );

              data.faculty_title = template['FACULTY TITLE'].toUpperCase();

              data.faculty_contact = template['FACULTY CONTACT'];

              if (template['FACULTY WEBSITE']) {
                data.faculty_website = template['FACULTY WEBSITE'];
              }

              if (template['FACULTY ADDRESS']) {
                data.faculty_address = template['FACULTY ADDRESS'];
              }

              if (template['FACULTY EMAIL']) {
                data.faculty_email = template['FACULTY EMAIL'];
              }

              if (template['DATE ESTABLISHED (MM/DD/YYYY)']) {
                data.date_established =
                  template['DATE ESTABLISHED (MM/DD/YYYY)'];
              }

              if (template['FACULTY HEAD']) {
                data.headed_by_id = getHead(
                  template['FACULTY HEAD'],
                  data.faculty_code
                );
              }

              if (template.COLLEGE) {
                data.college_id = getCollege(
                  template.COLLEGE,
                  data.faculty_code
                );
              }

              const upload = await insertNewFaculty(data, transaction);

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
   * Faculty Index api method.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async show(req, res) {
    const { id } = req.params;

    try {
      const faculty = await facultyService.findOneFaculty({
        where: { id },
        include: { all: true },
      });

      http.setSuccess(200, 'Faculty retrieved successfully.', { faculty });
      if (isEmpty(faculty)) http.setError(404, 'Faculty Not Found.');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to get Faculty data', { error });

      return http.send(res);
    }
  }

  /**
   * UPDATE Specific Faculty Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      const updateFaculty = await facultyService.updateFaculty(id, data);
      const faculty = updateFaculty[1][0];

      data.faculty_code = data.faculty_code.toUpperCase();
      data.faculty_title = data.faculty_title.toUpperCase();
      http.setSuccess(200, 'Faculty updated successfully', { faculty });
      if (isEmpty(faculty)) http.setError(404, 'This Faculty does Not Exist.');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to update this Faculty.', { error });

      return http.send(res);
    }
  }

  /**
   * Destroy Faculty Data
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async delete(req, res) {
    try {
      const { id } = req.params;

      await facultyService.deleteFaculty(id);
      http.setSuccess(200, 'Faculty deleted successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to delete this Faculty.', { error });

      return http.send(res);
    }
  }
}

const facultyAttributes = function () {
  return {
    attributes: {
      exclude: [
        'created_at',
        'updated_at',
        'deleted_at',
        'lastUpdatedById',
        'lastUpdateApprovedById',
        'deletedById',
        'deleteApprovedById',
        'deleteApprovedById',
      ],
    },
    include: [
      {
        association: 'college',
        attributes: ['id', 'college_code', 'college_title'],
      },
      {
        association: 'headedBy',
        attributes: ['id', 'surname', 'other_names', 'email', 'phone'],
      },
    ],
  };
};

/**
 *
 * @param {*} data
 * @param {*} transaction
 */
const insertNewFaculty = async function (data, transaction) {
  const result = await facultyService.createFaculty(data, transaction);

  return result;
};

module.exports = FacultyController;
