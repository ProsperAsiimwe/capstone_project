const { HttpResponse } = require('@helpers');
const {
  admissionSchemeReportsService,
  institutionStructureService,
} = require('@services/index');

const { isEmpty, now, map, upperCase, isArray, toUpper } = require('lodash');
const excelJs = require('exceljs');
const fs = require('fs');
const { changeProgrammeColumns } = require('./templateChangeProgramme');

const http = new HttpResponse();

class ChangeProgrammeReportsController {
  // applicant subject  combination

  async downloadChangeProgramme(req, res) {
    try {
      const { id: user } = req.user;

      const context = req.body;

      if (
        !context.academic_year_id ||
        !context.application_status ||
        !context.service_type
      ) {
        throw new Error('Invalid Data Request');
      }

      let result = [];

      //  mode_of_entry

      if (context.application_status === 'ALL') {
        if (context.mode_of_entry === 'ALL') {
          result = await admissionSchemeReportsService.changeProgrammeStudents(
            context
          );
        } else {
          result = await admissionSchemeReportsService.modeEntryStudentsReport(
            context
          );
        }
      } else if (context.application_status === 'PAID') {
        if (context.mode_of_entry === 'ALL') {
          result =
            await admissionSchemeReportsService.changeProgrammeStudentsPaid(
              context
            );
        } else {
          result = await admissionSchemeReportsService.modeEntryStudentsPaid(
            context
          );
        }
      } else if (context.application_status === 'UNPAID') {
        if (context.mode_of_entry === 'ALL') {
          result =
            await admissionSchemeReportsService.changeProgrammeStudentsUnpaid(
              context
            );
        } else {
          result = await admissionSchemeReportsService.modeEntryStudentsUnpaid(
            context
          );
        }
      } else if (context.application_status === 'APPROVED') {
        if (context.mode_of_entry === 'ALL') {
          result =
            await admissionSchemeReportsService.changeProgrammeStudentsApproved(
              context
            );
        } else {
          result =
            await admissionSchemeReportsService.modeEntryStudentsApproved(
              context
            );
        }
      } else if (context.application_status === 'PENDING') {
        if (context.mode_of_entry === 'ALL') {
          result =
            await admissionSchemeReportsService.changeProgrammeStudentsPending(
              context
            );
        } else {
          result = await admissionSchemeReportsService.modeEntryStudentsPending(
            context
          );
        }
      } else {
        throw new Error('Invalid Data Request');
      }

      if (isEmpty(result)) {
        throw new Error(`No Applicant Records`);
      }

      const institutionStructure =
        await institutionStructureService.findInstitutionStructureRecords({
          attributes: ['institution_name', 'institution_logo'],
        });

      if (!institutionStructure) {
        throw new Error('Unable To Find Institution Structure.');
      }

      const workbook = new excelJs.Workbook();
      const rootSheet = workbook.addWorksheet('CHANGE OF PROGRAMME');

      rootSheet.mergeCells('C1', 'O3');
      rootSheet.mergeCells('A1', 'B2');
      const titleCell = rootSheet.getCell('C1');

      rootSheet.getRow(1).height = 70;

      titleCell.value = `${
        institutionStructure.institution_name || 'TERP'
      } \n ACADEMIC REGISTRAR'S DEPARTMENT 
       APPLICANTS CHANGE OF PROGRAMME/SUBJECT COMBINATIONS
      FOR  ACADEMIC YEAR: ${result[0].academic_year}`;
      titleCell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
      };

      titleCell.font = { bold: true, size: 12, name: 'Arial' };

      const headerRow = rootSheet.getRow(3);

      headerRow.values = map(changeProgrammeColumns, 'header');
      headerRow.font = { bold: true, size: 15, color: '#2c3e50' };
      rootSheet.columns = changeProgrammeColumns.map((column) => {
        delete column.header;

        return column;
      });
      rootSheet.getRow(3).height = 75;

      rootSheet.views = [
        {
          state: 'frozen',
          xSplit: 0,
          ySplit: 3,
          topLeftCell: 'G10',
          activeCell: 'A1',
        },
      ];

      const templateData = [];

      if (!isEmpty(result)) {
        result.forEach((element) => {
          templateData.push([
            element.student_number,
            upperCase(element.surname),
            element.other_names,
            element.gender,
            element.a_level_index,
            element.a_level_year,
            getFormattedArray(element.al_results),
            element.olevel_index,
            element.olevel_year,
            element.distinctions,
            element.credits,
            element.passes,
            element.old_programme_code,
            map(element.old_subjects, 'subject_name').toString(),
            element.new_programme_code,
            element.new_subject_combination_code,

            map(element.subjects, 'subject_name').toString(),
            element.new_programme_type,
            element.new_campus,
            element.mode_of_entry,
            element.payment_status,
          ]);
        });
      }

      rootSheet.addRows(templateData);

      const uploadPath = `${process.cwd()}/src/assets/documents/templates`;

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true }, (err) => {
          throw new Error(err.message);
        });
      }

      const template = `${uploadPath}/change-programme-${user.surname}-${
        user.other_names
      }-${user.id}-${now()}.xlsm`;

      await workbook.xlsx.writeFile(template);
      await res.download(
        template,
        `APPLICANTS CHANGE PROGRAMME.xlsx`,
        (error) => {
          if (error) {
            throw new Error(error.message);
          }
        }
      );
    } catch (error) {
      http.setError(400, 'Unable To Download Template.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

module.exports = ChangeProgrammeReportsController;

const getFormattedArray = (dataToFormat) => {
  let formattedString = '';

  if (isArray(dataToFormat) && !isEmpty(dataToFormat)) {
    for (const result of dataToFormat) {
      if (result.name) {
        const splittedName = result.name
          .split(' ')
          .map((l) => toUpper(l.substring(0, 3)));

        formattedString += `${splittedName.join('-')}=${result.result},  `;
      }
    }
  }

  return formattedString;
};
