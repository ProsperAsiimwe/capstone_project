const { HttpResponse } = require('@helpers');
const {
  admissionSchemeReportsService,
  runningAdmissionService,
  institutionStructureService,
  admittedApplicantsViewsService,
} = require('@services/index');

const { isEmpty, now, map, toUpper, upperCase } = require('lodash');
const excelJs = require('exceljs');
const fs = require('fs');
const {
  applicantSubjectCombination,
  admittedApplicantsColumns,
} = require('./templateColumns');

const {
  admissionReportsFunctions,
} = require('@controllers/Helpers/admissionReportHelper');

const http = new HttpResponse();

class AdmissionSchemeReportsController {
  //  reports
  async admissionSchemeReport(req, res) {
    try {
      if (
        !req.query.academic_year_id ||
        !req.query.intake_id ||
        !req.query.degree_category_id ||
        !req.query.admission_scheme_id
      ) {
        throw new Error('Invalid Context Provided');
      }

      const context = req.query;

      const result = await admissionSchemeReportsService.admissionSchemeReport(
        context
      );

      let data = {};

      if (isEmpty(result)) {
        data = {
          genderApplicantData: {},
          totalApplicants: 0,
          paymentStatus: {},
          applicationStatus: {},
          nationalityData: {},
          applicantPaidByGender: {},
          applicantPaidByNationality: {},
          totalPaidSubmittedApplications: 0,
          number_of_programmes: 0,
        };
      } else {
        data = admissionReportsFunctions(result);
      }

      http.setSuccess(200, 'Admission Scheme Report fetched successfully', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Admission Report', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  //  searchAdmittedApplicant
  async searchAdmittedApplicant(req, res) {
    try {
      if (!req.query.searchParam || !req.query.searchBy) {
        throw new Error('Invalid Context Provided');
      }

      const context = req.query;

      let data = [];

      if (req.query.searchBy === 'name') {
        data = await admittedApplicantsViewsService.searchAdmittedApplicantName(
          context
        );
      } else {
        data = await admittedApplicantsViewsService.searchAdmittedApplicant(
          context
        );
      }

      if (isEmpty(data)) {
        throw new Error(`Record(s): ${context.searchParam} Not Found`);
      }

      http.setSuccess(200, 'Admitted Applicant fetched successfully', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Admitted Applicant', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  // applicant subject  combination

  async downloadApplicantSubjectCombination(req, res) {
    try {
      const { id: user } = req.user;

      const context = req.body;

      let result = [];

      if (context.programme_id) {
        result =
          await admissionSchemeReportsService.applicantCombinationsByProgramme(
            context
          );
      } else {
        result =
          await admissionSchemeReportsService.applicantSubjectCombinations(
            context
          );
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

      const findRunningAdmission = await runningAdmissionService
        .findOneRunningAdmission({
          where: {
            academic_year_id: context.academic_year_id,
            admission_scheme_id: context.admission_scheme_id,
            intake_id: context.intake_id,
            degree_category_id: context.degree_category_id,
          },
          include: [
            {
              association: 'academicYear',
              attributes: ['id', 'metadata_value'],
            },
            {
              association: 'intake',
              attributes: ['id', 'metadata_value'],
            },
            {
              association: 'degreeCategory',
              attributes: ['id', 'metadata_value'],
            },
            {
              association: 'admissionScheme',
              attributes: ['id', 'scheme_name'],
            },
          ],
          nest: true,
        })
        .then((res) => {
          if (res) {
            return res.toJSON();
          }
        });

      if (!findRunningAdmission) {
        throw new Error(`Unable To Find The Running Admission Specified.`);
      }

      const workbook = new excelJs.Workbook();
      const rootSheet = workbook.addWorksheet('APPLICANTS SUBJECTS');

      rootSheet.mergeCells('C1', 'O3');
      rootSheet.mergeCells('A1', 'B2');
      const titleCell = rootSheet.getCell('C1');

      rootSheet.getRow(1).height = 65;

      titleCell.value = `${
        institutionStructure.institution_name || 'TERP'
      } \n APPLICANTS' SUBJECTS 
      \n SCHEME: ${
        findRunningAdmission.admissionScheme.scheme_name
      }, ACADEMIC YEAR: ${
        findRunningAdmission.academicYear.metadata_value
      }, INTAKE: ${
        findRunningAdmission.intake.metadata_value
      }, DEGREE CATEGORY: ${
        findRunningAdmission.degreeCategory.metadata_value
      }.`;

      titleCell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
      };

      titleCell.font = { bold: true, size: 8, name: 'Arial' };

      const headerRow = rootSheet.getRow(3);

      headerRow.values = map(applicantSubjectCombination, 'header');
      headerRow.font = { bold: true, size: 11, color: '#2c3e50' };
      rootSheet.columns = applicantSubjectCombination.map((column) => {
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
            element.form_id,
            upperCase(element.surname),
            element.other_names,
            element.email,
            element.phone,
            element.gender,
            element.programme_code,
            element.alias_code,
            element.choice_number_name,
            element.choice_number,
            element.subject_combination_code,
            element.subject_combination_title,
            map(element.subjects, 'subject_name').toString(),
            element.subject_combination_code.concat(
              '-',
              map(element.subjects, 'subject_code').toString()
            ),
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

      const template = `${uploadPath}/download-faculty-${user.surname}-${
        user.other_names
      }-${user.id}-${now()}.xlsm`;

      await workbook.xlsx.writeFile(template);
      await res.download(
        template,
        `APPLICANT SUBJECTS REPORT.xlsx`,
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

  //  admittedApplicantsDownload ...

  async admittedApplicantsDownload(req, res) {
    try {
      const { id: user } = req.user;

      const context = req.body;

      if (
        !context.academic_year_id ||
        !context.intake_id ||
        !context.degree_category_id ||
        !context.admission_scheme_id
      ) {
        throw new Error('Invalid Context Provided');
      }

      let result = [];

      if (context.programme_id) {
        result =
          await admittedApplicantsViewsService.admittedApplicantsDownload(
            context
          );
      } else {
        result =
          await admittedApplicantsViewsService.admittedApplicantsSchemeDownload(
            context
          );
      }

      if (isEmpty(result)) {
        throw new Error(`No Admitted Applicants Records`);
      }

      const resultObject = result[0];

      const institutionStructure =
        await institutionStructureService.findInstitutionStructureRecords({
          attributes: ['institution_name', 'institution_logo'],
        });

      if (!institutionStructure) {
        throw new Error('Unable To Find Institution Structure.');
      }

      const workbook = new excelJs.Workbook();
      const rootSheet = workbook.addWorksheet('ADMITTED APPLICANTS');

      rootSheet.mergeCells('C1', 'O3');
      rootSheet.mergeCells('A1', 'B2');
      const titleCell = rootSheet.getCell('C1');

      rootSheet.getRow(1).height = 170;

      if (context.programme_id) {
        titleCell.value = `${
          toUpper(institutionStructure.institution_name) || 'TERP'
        } \n OFFICE OF THE ACADEMIC REGISTRAR \n ADMITTED APPLICANTS${
          resultObject.faculty_title
        },\n ${resultObject.programme_title} -(${
          resultObject.programme_code
        })\n SCHEME: ${
          resultObject.scheme_name || '.....'
        }\n DEGREE CATEGORY: ${
          resultObject.degree_category || '.....'
        }\n ACADEMIC YEAR: ${resultObject.entry_academic_year},.`;

        titleCell.alignment = {
          horizontal: 'center',
          vertical: 'middle',
          wrapText: true,
        };
      } else {
        titleCell.value = `${
          toUpper(institutionStructure.institution_name) || 'TERP'
        } \n  OFFICE OF THE ACADEMIC REGISTRAR \n ADMITTED APPLICANTS,\n ACADEMIC YEAR: ${
          resultObject.entry_academic_year
        }\n SCHEME: ${resultObject.scheme_name || '.....'}\n DEGREE CATEGORY: ${
          resultObject.degree_category || '.....'
        }.`;
      }

      titleCell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
      };

      titleCell.font = { bold: true, size: 15, name: 'Arial' };

      const headerRow = rootSheet.getRow(3);

      headerRow.values = map(admittedApplicantsColumns, 'header');
      headerRow.font = { bold: true, size: 11, color: '#2c3e50' };
      rootSheet.columns = admittedApplicantsColumns.map((column) => {
        delete column.header;

        return column;
      });
      rootSheet.getRow(3).height = 40;

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
            element.full_name,
            element.gender,
            element.nationality,
            element.student_number,
            element.registration_number,
            element.programme_code,
            element.alias_code,
            element.campus,
            element.programme_type,
            element.sponsorship,
            element.hall_of_attachment,
            element.year_of_entry,
            element.district_of_origin,
            map(element.subjects, 'subject_name').toString(),
            element.email,
            element.phone,
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

      const template = `${uploadPath}/download-admitted-${user.surname}-${
        user.other_names
      }-${user.id}-${now()}.xlsm`;

      await workbook.xlsx.writeFile(template);
      await res.download(
        template,
        `ADMITTED APPLICANTS REPORT.xlsx`,
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

module.exports = AdmissionSchemeReportsController;
