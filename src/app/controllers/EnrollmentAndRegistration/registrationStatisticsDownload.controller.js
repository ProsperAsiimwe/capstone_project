const { HttpResponse } = require('@helpers');
const {
  registrationStatisticsService,
  institutionStructureService,
  metadataValueService,
} = require('@services/index');
const { map, upperCase, now, groupBy, flatten } = require('lodash');
const { generateReport } = require('../Helpers/registrationStatisticsHelper');

const excelJs = require('exceljs');
const fs = require('fs');
const {
  getMetadataValueName,
} = require('@controllers/Helpers/programmeHelper');
const { connect } = require('http2');
const { object } = require('joi');

const http = new HttpResponse();

class DownloadStatisticsController {
  async downloadRegistrationStatistics(req, res) {
    try {
      const context = req.query;

      const { user } = req;
      if (
        !req.query.campus_id ||
        !req.query.intake_id ||
        !req.query.academic_year_id ||
        !req.query.semester_id
      ) {
        throw new Error('Invalid Context Provided');
      }

      const institutionStructure =
        await institutionStructureService.findInstitutionStructureRecords({
          attributes: ['institution_name', 'institution_logo'],
        });

      const metadataValues = await metadataValueService.findAllMetadataValues({
        attributes: ['metadata_value', 'id'],
        include: 'metadata',
      });

      const campus = await getMetadataValueName(
        metadataValues,
        context.campus_id,
        'CAMPUSES',
        'SELECTED REGISTRATION CONTEXT'
      );
      const intake = await getMetadataValueName(
        metadataValues,
        context.intake_id,
        'INTAKES',
        'SELECTED REGISTRATION CONTEXT'
      );
      const semester = await getMetadataValueName(
        metadataValues,
        context.semester_id,
        'SEMESTERS',
        'SELECTED REGISTRATION CONTEXT'
      );

      const result =
        await registrationStatisticsService.detailedRegistrationStatistics(
          context
        );

      //  const groupedData = groupByProgramme(result);

      const generatedReport = generateReport(result);

      const workbook = new excelJs.Workbook();
      const rootSheet = workbook.addWorksheet('REPORT');

      rootSheet.mergeCells('C1', 'O3');
      rootSheet.mergeCells('A1', 'B2');
      const titleCell = rootSheet.getCell('C1');

      rootSheet.getRow(1).height = 190;

      titleCell.value = `${
        upperCase(institutionStructure.institution_name) || 'TERP'
      }\nOFFICE OF THE ACADEMIC REGISTRAR
       ENROLLMENT SUMMARY REPORT \n
       \nCampus: ${campus} / Intake: ${intake} \nSemester: ${semester}
      `;

      titleCell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
      };

      titleCell.font = { bold: true, size: 15, name: 'Arial' };

      const headerRow = rootSheet.getRow(3);

      // TEMPLATE
      const templateData = [];

      // academicUnitProgramme

      let groupedData = [];

      if (context.category === 'Programmes') {
        headerRow.values = map(statisticProgTemplate, 'header');

        headerRow.font = { bold: true, size: 12, color: '#2c3e50' };

        rootSheet.columns = statisticProgTemplate.map((column) => {
          delete column.header;

          return column;
        });
        rootSheet.getRow(3).height = 60;

        rootSheet.views = [
          {
            state: 'frozen',
            xSplit: 0,
            ySplit: 3,
            topLeftCell: 'G10',
            activeCell: 'A1',
          },
        ];

        groupedData = groupBy(
          generatedReport.academicUnitProgramme,
          'academic_unit_title'
        );

        Object.keys(groupedData).forEach((element) => {
          templateData.push({
            data: [
              [element],
              ...groupedData[element].map((element) => {
                return [
                  element.programme_code,
                  element.enrolled_students,
                  element.male_enrolled,
                  element.female_enrolled,
                  element.male_fully_registered,
                  element.female_fully_registered,
                  element.full_registered,
                  element.provisionally_registered,
                ];
              }),
              [],
              [],
            ],
          });
        });
      } else if (context.category === 'EntryAcademicYear') {
        headerRow.values = map(statisticYearTemplate, 'header');

        headerRow.font = { bold: true, size: 12, color: '#2c3e50' };

        rootSheet.columns = statisticYearTemplate.map((column) => {
          delete column.header;

          return column;
        });
        rootSheet.getRow(3).height = 60;

        rootSheet.views = [
          {
            state: 'frozen',
            xSplit: 0,
            ySplit: 3,
            topLeftCell: 'G10',
            activeCell: 'A1',
          },
        ];
        // statisticYearTemplate
        // academicUnitAcademicYear
        groupedData = groupBy(
          generatedReport.academicUnitAcademicYear,
          'academic_unit_title'
        );
        Object.keys(groupedData).forEach((element) => {
          templateData.push({
            data: [
              [element],
              ...groupedData[element].map((element) => {
                return [
                  element.entry_academic_year,
                  element.enrolled_students,
                  element.male_enrolled,
                  element.female_enrolled,
                  element.male_fully_registered,
                  element.female_fully_registered,
                  element.full_registered,
                  element.provisionally_registered,
                ];
              }),
              [],
              [],
            ],
          });
        });
      }

      const data = flatten(map(templateData, 'data'));

      rootSheet.addRows(data);

      const uploadPath = `${process.cwd()}/src/assets/documents/templates`;

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true }, (err) => {
          throw new Error(err.message);
        });
      }

      const template = `${uploadPath}/download-statistics-${user.surname}-${
        user.other_names
      }-${user.id}-${now()}.xlsm`;

      await workbook.xlsx.writeFile(template);
      await res.download(
        template,
        `${context.category}-Enrollment Report.xlsx`,
        (error) => {
          if (error) {
            throw new Error(error.message);
          }
        }
      );
    } catch (error) {
      http.setError(400, 'Unable Download Statistics Report', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

module.exports = DownloadStatisticsController;

// const statisticsReportTemplate = [
//   {
//     header: 'ACADEMIC YEAR',
//     key: 'entry_academic_year',
//     width: 35,
//   },
//   {
//     header: 'PROGRAMME CODE',
//     key: 'programme_code',
//     width: 20,
//   },
//   {
//     header: 'PROG TYPE',
//     key: 'programme_type',
//     width: 20,
//   },
//   {
//     header: 'SPONSORSHIP',
//     key: 'sponsorship',
//     width: 15,
//   },
//   {
//     header: 'MALE STD(s) ENROLLED',
//     key: 'male_enrolled',
//     width: 40,
//   },
//   {
//     header: 'FEMALE (STDs) ENROLLED',
//     key: 'female_enrolled',
//     width: 40,
//   },
//   {
//     header: 'MALE (STDs) FULLY REGISTERED',
//     key: 'male_fully_registered',
//     width: 40,
//   },
//   {
//     header: 'FEMALE FULLY REGISTERED',
//     key: 'female_fully_registered',
//     width: 40,
//   },
//   {
//     header: 'FULLY REGISTERED',
//     key: 'full_registered',
//     width: 30,
//   },
//   {
//     header: 'PROVISIONALLY REGISTERED',
//     key: 'provisionally_registered',
//     width: 40,
//   },
// ];

// programme

const statisticProgTemplate = [
  {
    header: 'PROGRAMME CODE',
    key: 'programme_code',
    width: 45,
  },
  {
    header: 'Total ENROLLED',
    key: 'enrolled_students',
    width: 25,
  },

  {
    header: 'MALE STD(s) ENROLLED',
    key: 'male_enrolled',
    width: 25,
  },
  {
    header: 'FEMALE (STDs) ENROLLED',
    key: 'female_enrolled',
    width: 30,
  },
  {
    header: 'MALE (STDs) FULLY REGISTERED',
    key: 'male_fully_registered',
    width: 45,
  },
  {
    header: 'FEMALE FULLY REGISTERED',
    key: 'female_fully_registered',
    width: 45,
  },
  {
    header: 'FULLY REGISTERED',
    key: 'full_registered',
    width: 20,
  },
  {
    header: 'PROVISIONALLY REGISTERED',
    key: 'provisionally_registered',
    width: 45,
  },
];

// academic year

const statisticYearTemplate = [
  {
    header: 'ENTRY ACADEMIC YEAR',
    key: 'programme_code',
    width: 45,
  },
  {
    header: 'Total ENROLLED',
    key: 'enrolled_students',
    width: 25,
  },

  {
    header: 'MALE STD(s) ENROLLED',
    key: 'male_enrolled',
    width: 25,
  },
  {
    header: 'FEMALE (STDs) ENROLLED',
    key: 'female_enrolled',
    width: 30,
  },
  {
    header: 'MALE (STDs) FULLY REGISTERED',
    key: 'male_fully_registered',
    width: 45,
  },
  {
    header: 'FEMALE FULLY REGISTERED',
    key: 'female_fully_registered',
    width: 45,
  },
  {
    header: 'FULLY REGISTERED',
    key: 'full_registered',
    width: 20,
  },
  {
    header: 'PROVISIONALLY REGISTERED',
    key: 'provisionally_registered',
    width: 45,
  },
];
