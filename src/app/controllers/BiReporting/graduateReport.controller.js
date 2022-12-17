// resultBiReportService

/* eslint-disable camelcase */

const { HttpResponse } = require('@helpers');
const {
  resultBiReportService,
  institutionStructureService,
  metadataValueService,
} = require('@services/index');
const {
  getMetadataValueName,
} = require('@controllers/Helpers/programmeHelper');
const {
  sumBy,
  isEmpty,
  toUpper,
  map,
  upperCase,
  now,
  groupBy,
  flatten,
} = require('lodash');

const excelJs = require('exceljs');
const fs = require('fs');

const http = new HttpResponse();

class GraduateReportsController {
  async graduateReportFunction(req, res) {
    try {
      if (!req.query.academic_year_id) {
        throw new Error('Invalid Context Provided');
      }

      let report = [];

      let groupedData = [];

      const context = req.query;

      const result = await resultBiReportService.graduateStatistics(context);
      report = generateReport(result);

      groupedData = groupByProgramme(result);

      let data = {};

      data = { report, result, groupedData };

      http.setSuccess(200, 'Report fetched successfully', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Report', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  // detailedGraduateReport
  async detailedGraduateReport(req, res) {
    try {
      if (!req.query.academic_year_id) {
        throw new Error('Invalid Context Provided');
      }

      let report = [];

      const context = req.query;

      const result = await resultBiReportService.detailedGraduateReport(
        context
      );

      const filtered = groupByGraduateProgramme(result);

      report = groupByProgramme(filtered);

      http.setSuccess(200, 'Report fetched successfully', {
        report,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Report', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  //

  async downloadGraduationStatistics(req, res) {
    try {
      const context = req.body;

      const { user } = req;
      if (!req.body.academic_year_id) {
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

      const academicYear = await getMetadataValueName(
        metadataValues,
        context.academic_year_id,
        'ACADEMIC YEARS',
        'SELECTED ACADEMIC YEAR CONTEXT'
      );

      const result = await resultBiReportService.graduateStatistics(context);

      const report = generateReport(result);

      const groupedData = groupByProgramme(result);

      const generatedReport = { result, report, groupedData };

      const workbook = new excelJs.Workbook();
      const rootSheet = workbook.addWorksheet('REPORT');

      rootSheet.mergeCells('C1', 'O3');
      rootSheet.mergeCells('A1', 'B2');
      const titleCell = rootSheet.getCell('C1');

      rootSheet.getRow(1).height = 135;

      titleCell.value = `${
        upperCase(institutionStructure.institution_name) || 'TERP'
      }\nOFFICE OF THE ACADEMIC REGISTRAR\n GRADUATION STATISTICS REPORT\nCampus: All Campuses 
      \nAcademic Year: ${academicYear} \n
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

      let groupedGradData = [];

      headerRow.values = map(statisticProgTemplate, 'header');

      headerRow.font = { bold: true, size: 12, color: '#2c3e50' };

      rootSheet.columns = statisticProgTemplate.map((column) => {
        delete column.header;

        return column;
      });
      rootSheet.getRow(3).height = 45;

      rootSheet.views = [
        {
          state: 'frozen',
          xSplit: 0,
          ySplit: 3,
          topLeftCell: 'G10',
          activeCell: 'A1',
        },
      ];

      groupedGradData = groupBy(
        generatedReport.report.academicData,
        'academic_unit_title'
      );

      Object.keys(groupedGradData).forEach((element) => {
        templateData.push({
          data: [
            [element],
            ...groupedGradData[element].map((element) => {
              return [
                element.programme_code,
                element.programme_title,
                element.male_graduates,
                element.female_graduates,
                element.total_graduates,
              ];
            }),
            [],
            [],
          ],
        });
      });

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
        `Admission-Statistics Report.xlsx`,
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

const generateReport = function (data) {
  try {
    const graduateData = data;

    let total = 0;

    let maleGraduate = 0;

    let femaleGraduate = 0;

    let summaryData = [];

    let academicUnit = [];

    let campusData = [];

    let campusSummary = [];

    if (isEmpty(graduateData)) {
      total = 0;

      maleGraduate = 0;

      femaleGraduate = 0;
    } else {
      academicUnit = [
        ...graduateData
          .reduce((r, o) => {
            const key = o.academic_unit_code + '-' + o.programme_code;

            const item =
              r.get(key) ||
              Object.assign({}, o, {
                total_graduates: 0,
                male_graduates: 0,
                female_graduates: 0,
              });

            item.total_graduates += Number(o.total_graduates);
            item.male_graduates += Number(o.male_graduates);
            item.female_graduates += Number(o.female_graduates);

            return r.set(key, item);
          }, new Map())
          .values(),
      ];
      summaryData = [
        ...graduateData
          .reduce((r, o) => {
            const key = o.academic_unit_code;

            const item =
              r.get(key) ||
              Object.assign({}, o, {
                total_graduates: 0,
                male_graduates: 0,
                female_graduates: 0,
              });

            item.total_graduates += Number(o.total_graduates);
            item.male_graduates += Number(o.male_graduates);
            item.female_graduates += Number(o.female_graduates);

            return r.set(key, item);
          }, new Map())
          .values(),
      ];

      campusSummary = [
        ...graduateData
          .reduce((r, o) => {
            const key = o.campus;

            const item =
              r.get(key) ||
              Object.assign({}, o, {
                total_graduates: 0,
                male_graduates: 0,
                female_graduates: 0,
              });

            item.total_graduates += Number(o.total_graduates);
            item.male_graduates += Number(o.male_graduates);
            item.female_graduates += Number(o.female_graduates);

            return r.set(key, item);
          }, new Map())
          .values(),
      ];
    }

    total = sumBy(graduateData, (item) => Number(item.total_graduates));

    maleGraduate = sumBy(graduateData, (item) => Number(item.male_graduates));

    femaleGraduate = sumBy(graduateData, (item) =>
      Number(item.female_graduates)
    );

    const academicData = academicUnit.map((e) => ({
      academic_unit_code: e.academic_unit_code,
      academic_unit_title: e.academic_unit_title,
      programme_code: e.programme_code,
      programme_title: e.programme_title,
      total_graduates: e.total_graduates,
      male_graduates: e.male_graduates,
      female_graduates: e.female_graduates,
    }));

    const academicUnitProgramme = groupByProgramme(academicData);

    const summary = summaryData.map((e) => ({
      academic_unit_code: e.academic_unit_code,
      academic_unit_title: e.academic_unit_title,
      total_graduates: e.total_graduates,
      male_graduates: e.male_graduates,
      female_graduates: e.female_graduates,
    }));

    const summaryCampus = campusSummary.map((e) => ({
      campus: e.campus,
      total_graduates: e.total_graduates,
      male_graduates: e.male_graduates,
      female_graduates: e.female_graduates,
    }));

    return {
      total,
      maleGraduate,
      femaleGraduate,
      summary,
      summaryCampus,
      //campus,
      academicUnitProgramme,
      academicData,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

//  grouping data by programme

const groupByProgramme = (data) => {
  try {
    const merged = data.reduce(
      (groupedData, { academic_unit_code, academic_unit_title, ...rest }) => {
        const key = `${academic_unit_code}-${academic_unit_title}`;

        groupedData[key] = groupedData[key] || {
          academic_unit_code,
          academic_unit_title,
          programmes: [],
        };

        if (rest.programme_code) {
          groupedData[key].programmes.push(rest);
        }

        return groupedData;
      },
      {}
    );

    return Object.values(merged);
  } catch (error) {}
};

// groupByGraduateProgramme;

const groupByGraduateProgramme = (data) => {
  try {
    const merged = data.reduce(
      (
        groupedData,
        {
          academic_unit_code,
          academic_unit_title,
          programme_code,
          programme_title,
          ...rest
        }
      ) => {
        const key = `${academic_unit_code}-${academic_unit_title}-${programme_code}-${programme_title}`;

        groupedData[key] = groupedData[key] || {
          academic_unit_code,
          academic_unit_title,
          programme_code,
          programme_title,
          programmes: [],
        };

        if (rest.student_number) {
          groupedData[key].programmes.push(rest);
        }

        return groupedData;
      },
      {}
    );

    return Object.values(merged);
  } catch (error) {}
};

// download template

const statisticProgTemplate = [
  {
    header: 'PROGRAMME CODE',
    key: 'programme_code',
    width: 80,
  },
  {
    header: 'PROGRAMME TITLE',
    key: 'programme_title',
    width: 80,
  },
  {
    header: 'MALE GRADUATES',
    key: 'male_graduates',
    width: 50,
  },
  {
    header: 'FEMALE GRADUATES',
    key: 'female_graduates',
    width: 50,
  },
  {
    header: 'TOTAL NUMBER OF GRADUATES',
    key: 'total_graduates',
    width: 60,
  },
];

module.exports = GraduateReportsController;
