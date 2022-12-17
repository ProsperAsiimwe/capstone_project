const { HttpResponse } = require('@helpers');
const {
  departmentService,
  userService,
  facultyService,
} = require('@services/index');
const { isEmpty, now, toUpper, trim } = require('lodash');
const XLSX = require('xlsx');
const formidable = require('formidable');
const excelJs = require('exceljs');
const fs = require('fs');
const model = require('@models');
const { departmentTemplateColumns } = require('../App/templateColumns');
const {
  validateSheetColumns,
} = require('@controllers/Helpers/uploadValidator');

const http = new HttpResponse();

class DepartmentController {
  /**
   * GET All Departments.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async index(req, res) {
    try {
      const departments = await departmentService.findAllDepartments({
        include: { all: true },
        order: ['department_title'],
      });

      http.setSuccess(200, 'Departments Fetched Successfully.', {
        departments,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to Fetched Departments.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * CREATE New Department Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async createDepartment(req, res) {
    try {
      const data = req.body;
      const user = req.user.id;

      data.created_by_id = user;
      data.department_code = data.department_code.toUpperCase();
      data.department_title = data.department_title.toUpperCase();

      const department = await model.sequelize.transaction(
        async (transaction) => {
          const result = await insertNewDepartment(data, transaction);

          return result;
        }
      );

      http.setSuccess(201, 'Department created successfully.', {
        department,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to create this Department.', {
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
  async uploadDepartmentsTemplate(req, res) {
    try {
      const data = req.body;
      const user = req.user.id;
      const form = new formidable.IncomingForm();
      const results = [];

      const users = await userService.findAllUsers();

      const faculties = await facultyService.findAllFaculties({
        attributes: ['id', 'faculty_code', 'faculty_title'],
        order: ['faculty_title'],
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

        const getFaculty = (value, record) => {
          try {
            const str = value.substring(0, value.indexOf(':'));

            const checkValue = faculties.find(
              (fac) =>
                toUpper(trim(fac.faculty_code)) ===
                toUpper(trim(str.replace(/[()]/g, '')))
            );

            if (checkValue) return parseInt(checkValue.id, 10);
            throw new Error(
              `Cannot find ${value} in the list of faculties for record ${record}`
            );
          } catch (error) {
            throw new Error(error.message);
          }
        };

        try {
          await model.sequelize.transaction(async (transaction) => {
            for (const template of templateData) {
              if (!template['DEPARTMENT TITLE']) {
                throw new Error(
                  `One Of The Departments Provided Has No Title..`
                );
              }

              data.department_title =
                template['DEPARTMENT TITLE'].toUpperCase();

              validateSheetColumns(
                template,
                ['DEPARTMENT CODE', 'DEPARTMENT TITLE', 'DEPARTMENT CONTACT'],
                data.department_title
              );

              data.department_contact = template['DEPARTMENT CONTACT'];

              if (template['DEPARTMENT WEBSITE']) {
                data.department_website = template['DEPARTMENT WEBSITE'];
              }

              data.department_code = template['DEPARTMENT CODE'].toUpperCase();

              if (template['DEPARTMENT ADDRESS']) {
                data.department_address = template['DEPARTMENT ADDRESS'];
              }

              if (template['DEPARTMENT EMAIL']) {
                data.department_email = template['DEPARTMENT EMAIL'];
              }

              if (template['DATE ESTABLISHED (MM/DD/YYYY)']) {
                data.date_established =
                  template['DATE ESTABLISHED (MM/DD/YYYY)'];
              }

              if (template['DEPARTMENT HEAD']) {
                data.headed_by_id = getHead(
                  template['DEPARTMENT HEAD'],
                  data.department_code
                );
              }

              if (template.FACULTY) {
                data.faculty_id = getFaculty(
                  template.FACULTY,
                  data.department_title
                );
              }

              const upload = await insertNewDepartment(data, transaction);

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
   *
   * @param {*} req
   * @param {*} res
   */
  async downloadDepartmentTemplate(req, res) {
    try {
      const { user } = req;

      const workbook = new excelJs.Workbook();

      const users = await userService.findAllUsers();

      const faculties = await facultyService.findAllFaculties({
        attributes: ['id', 'faculty_code', 'faculty_title'],
        order: ['faculty_title'],
        raw: true,
      });

      const createDepartmentsSheet =
        workbook.addWorksheet('CREATE DEPARTMENTS');
      const headedBySheet = workbook.addWorksheet('Sheet2');
      const facultiesSheet = workbook.addWorksheet('Sheet3');

      createDepartmentsSheet.properties.defaultColWidth =
        departmentTemplateColumns.length;

      createDepartmentsSheet.columns = departmentTemplateColumns;

      headedBySheet.state = 'veryHidden';
      facultiesSheet.state = 'veryHidden';

      headedBySheet.addRows(
        users.map((user) => [`${user.surname} ${user.other_names}`])
      );

      facultiesSheet.addRows(
        faculties.map((faculty) => [
          `(${faculty.faculty_code}):${faculty.faculty_title}`,
        ])
      );

      // Column Validations

      createDepartmentsSheet.dataValidations.add('H2:H2000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=Sheet2!$A$1:$A$2000'],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: 'Please select a valid value from the list',
      });

      createDepartmentsSheet.dataValidations.add('I2:I2000', {
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

      const template = `${uploadPath}/download-departments-upload-template-${
        user.surname
      }-${user.other_names}-${user.id}-${now()}.xlsm`;

      await workbook.xlsx.writeFile(template);
      await res.download(
        template,
        'DEPARTMENTS-UPLOAD-TEMPLATE.xlsx',
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
   * UPDATE Specific Department Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async updateDepartment(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      data.department_code = data.department_code.toUpperCase();
      data.department_title = data.department_title.toUpperCase();
      const updateDepartment = await departmentService.updateDepartment(
        id,
        data
      );
      const department = updateDepartment[1][0];

      http.setSuccess(200, 'Department updated successfully', { department });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to update this Department.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Get Specific Department Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async fetchDepartment(req, res) {
    const { id } = req.params;
    const department = await departmentService.findOneDepartment({
      where: { id },
      include: { all: true },
    });

    http.setSuccess(200, 'Department fetch successful', { department });
    if (isEmpty(department)) http.setError(404, 'Department Data Not Found.');

    return http.send(res);
  }

  /**
   * Destroy Department Data
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async deleteDepartment(req, res) {
    try {
      const { id } = req.params;

      await departmentService.deleteDepartment(id);
      http.setSuccess(200, 'Department deleted successfully.');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to delete this Department.', { error });

      return http.send(res);
    }
  }
}

/**
 *
 * @param {*} data
 * @param {*} transaction
 */
const insertNewDepartment = async function (data, transaction) {
  const result = await departmentService.createDepartment(data, transaction);

  return result;
};

module.exports = DepartmentController;
