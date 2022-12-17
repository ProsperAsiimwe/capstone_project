// admissionStatisticsService....

/* eslint-disable camelcase */

const { HttpResponse } = require('@helpers');
const {
  admissionStatisticsService,
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

class AdmissionStatisticsController {
  async admissionStatistics(req, res) {
    try {
      if (!req.query.intake_id || !req.query.academic_year_id) {
        throw new Error('Invalid Context Provided');
      }
      let result = [];

      let report = [];

      let groupedData = [];

      const context = req.query;

      const institutionStructure =
        await institutionStructureService.findInstitutionStructureRecords();

      const institutionStructureUpper = institutionStructure.academic_units.map(
        (e) => toUpper(e)
      );

      let data = {};

      if (
        institutionStructure &&
        institutionStructureUpper
          .map((element) => element.includes('COL'))
          .includes(true)
      ) {
        result = await admissionStatisticsService.admissionCollegeStatistics(
          context
        );

        report = generateReport(result);

        groupedData = groupByProgramme(result);
      } else if (
        institutionStructure &&
        (institutionStructureUpper
          .map((element) => element.includes('FAC'))
          .includes(true) ||
          institutionStructureUpper
            .map((element) => element.includes('SCH'))
            .includes(true))
      ) {
        result = await admissionStatisticsService.admissionFacultyStatistics(
          context
        );

        report = generateReport(result);
        groupedData = groupByProgramme(result);
      } else {
        throw new Error('Invalid Context Provided');
      }

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

  //

  async downloadAdmissionStatistics(req, res) {
    try {
      const context = req.query;

      const { user } = req;
      if (!req.query.intake_id || !req.query.academic_year_id) {
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

      const intake = await getMetadataValueName(
        metadataValues,
        context.intake_id,
        'INTAKES',
        'SELECTED REGISTRATION CONTEXT'
      );
      const academicYear = await getMetadataValueName(
        metadataValues,
        context.academic_year_id,
        'ACADEMIC YEARS',
        'SELECTED ACADEMIC YEAR CONTEXT'
      );
      const sponsorship = await getMetadataValueName(
        metadataValues,
        context.sponsorship_id,
        'SPONSORSHIPS',
        'SELECTED SPONSORSHIPS CONTEXT'
      );

      const generatedReport = await admissionStatistics(req);

      const workbook = new excelJs.Workbook();
      const rootSheet = workbook.addWorksheet('REPORT');

      rootSheet.mergeCells('C1', 'O3');
      rootSheet.mergeCells('A1', 'B2');
      const titleCell = rootSheet.getCell('C1');

      rootSheet.getRow(1).height = 135;

      titleCell.value = `${
        upperCase(institutionStructure.institution_name) || 'ACMIS'
      }\nOFFICE OF THE ACADEMIC REGISTRAR\n ADMISSION STATISTICS REPORT\nCampus: All Campuses / Intake: ${intake} 
      \nAcademic Year: ${academicYear} \nSponsorship: ${sponsorship}
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

      groupedData = groupBy(
        generatedReport.data.report.academicData,
        'academic_unit_title'
      );
      Object.keys(groupedData).forEach((element) => {
        templateData.push({
          data: [
            [element],
            ...groupedData[element].map((element) => {
              return [
                element.programme_code,
                element.programme_title,
                element.male_admitted,
                element.female_admitted,
                element.admitted_students,
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

const admissionStatistics = async function (req) {
  try {
    let result = [];

    let report = [];

    let groupedData = [];

    const context = req.query;

    const institutionStructure =
      await institutionStructureService.findInstitutionStructureRecords();

    const institutionStructureUpper = institutionStructure.academic_units.map(
      (e) => toUpper(e)
    );

    let data = {};

    if (
      institutionStructure &&
      institutionStructureUpper
        .map((element) => element.includes('COL'))
        .includes(true)
    ) {
      result = await admissionStatisticsService.admissionCollegeStatistics(
        context
      );

      report = generateReport(result);

      groupedData = groupByProgramme(result);
    } else if (
      institutionStructure &&
      (institutionStructureUpper
        .map((element) => element.includes('FAC'))
        .includes(true) ||
        institutionStructureUpper
          .map((element) => element.includes('SCH'))
          .includes(true))
    ) {
      result = await admissionStatisticsService.admissionFacultyStatistics(
        context
      );

      report = generateReport(result);
      groupedData = groupByProgramme(result);
    } else {
      throw new Error('Invalid Context Provided');
    }

    data = { report, result, groupedData };

    return {
      data,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

const generateReport = function (data) {
  try {
    const admittedData = data;

    let admittedStudents = 0;

    let maleAdmitted = 0;

    let femaleAdmitted = 0;

    let summaryData = [];

    let academicUnit = [];

    let campusData = [];

    let campusSummary = [];

    if (isEmpty(admittedData)) {
      admittedStudents = 0;

      maleAdmitted = 0;

      femaleAdmitted = 0;
    } else {
      academicUnit = [
        ...admittedData
          .reduce((r, o) => {
            const key = o.academic_unit_code + '-' + o.programme_code;

            const item =
              r.get(key) ||
              Object.assign({}, o, {
                admitted_students: 0,
                male_admitted: 0,
                female_admitted: 0,
              });

            item.admitted_students += Number(o.admitted_students);
            item.male_admitted += Number(o.male_admitted);
            item.female_admitted += Number(o.female_admitted);

            return r.set(key, item);
          }, new Map())
          .values(),
      ];
      summaryData = [
        ...admittedData
          .reduce((r, o) => {
            const key = o.academic_unit_code;

            const item =
              r.get(key) ||
              Object.assign({}, o, {
                admitted_students: 0,
                male_admitted: 0,
                female_admitted: 0,
              });

            item.admitted_students += Number(o.admitted_students);
            item.male_admitted += Number(o.male_admitted);
            item.female_admitted += Number(o.female_admitted);

            return r.set(key, item);
          }, new Map())
          .values(),
      ];

      campusData = [
        ...admittedData
          .reduce((r, o) => {
            const key =
              o.campus + '-' + o.academic_unit_code + '-' + o.programme_code;

            const item =
              r.get(key) ||
              Object.assign({}, o, {
                admitted_students: 0,
                male_admitted: 0,
                female_admitted: 0,
              });

            item.admitted_students += Number(o.admitted_students);
            item.male_admitted += Number(o.male_admitted);
            item.female_admitted += Number(o.female_admitted);

            return r.set(key, item);
          }, new Map())
          .values(),
      ];

      campusSummary = [
        ...admittedData
          .reduce((r, o) => {
            const key = o.campus;

            const item =
              r.get(key) ||
              Object.assign({}, o, {
                admitted_students: 0,
                male_admitted: 0,
                female_admitted: 0,
              });

            item.admitted_students += Number(o.admitted_students);
            item.male_admitted += Number(o.male_admitted);
            item.female_admitted += Number(o.female_admitted);

            return r.set(key, item);
          }, new Map())
          .values(),
      ];
    }

    admittedStudents = sumBy(admittedData, (item) =>
      Number(item.admitted_students)
    );
    maleAdmitted = sumBy(admittedData, (item) => Number(item.male_admitted));

    femaleAdmitted = sumBy(admittedData, (item) =>
      Number(item.female_admitted)
    );

    const academicData = academicUnit.map((e) => ({
      academic_unit_code: e.academic_unit_code,
      academic_unit_title: e.academic_unit_title,
      programme_code: e.programme_code,
      programme_title: e.programme_title,
      admitted_students: e.admitted_students,
      male_admitted: e.male_admitted,
      female_admitted: e.female_admitted,
    }));

    const academicUnitProgramme = groupByProgramme(academicData);

    const campusGroupedData = campusData.map((e) => ({
      campus: e.campus,
      academic_unit_code: e.academic_unit_code,
      academic_unit_title: e.academic_unit_title,
      programme_code: e.programme_code,
      programme_title: e.programme_title,
      admitted_students: e.admitted_students,
      male_admitted: e.male_admitted,
      female_admitted: e.female_admitted,
    }));

    const campusGrouping = groupByCampusProgramme(campusGroupedData);

    const campus = groupByCampus(campusGrouping);

    const summary = summaryData.map((e) => ({
      academic_unit_code: e.academic_unit_code,
      academic_unit_title: e.academic_unit_title,
      admitted_students: e.admitted_students,
      male_admitted: e.male_admitted,
      female_admitted: e.female_admitted,
    }));

    const summaryCampus = campusSummary.map((e) => ({
      campus: e.campus,
      admitted_students: e.admitted_students,
      male_admitted: e.male_admitted,
      female_admitted: e.female_admitted,
    }));

    return {
      admittedStudents,
      maleAdmitted,
      femaleAdmitted,
      summary,
      summaryCampus,
      campus,
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

// groupByCampusProgramme
const groupByCampusProgramme = (data) => {
  try {
    const merged = data.reduce(
      (
        groupedData,
        { academic_unit_code, academic_unit_title, campus, ...rest }
      ) => {
        const key = `${campus}-${academic_unit_code}-${academic_unit_title}`;

        groupedData[key] = groupedData[key] || {
          campus,
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

//  group campus

const groupByCampus = (data) => {
  try {
    const merged = data.reduce((groupedData, { campus, ...rest }) => {
      const key = `${campus}`;

      groupedData[key] = groupedData[key] || {
        campus,
        academicUnit: [],
      };

      if (rest.academic_unit_code) {
        groupedData[key].academicUnit.push(rest);
      }

      return groupedData;
    }, {});

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
    header: 'MALE STD(s) ADMITTED',
    key: 'male_admitted',
    width: 50,
  },
  {
    header: 'FEMALE (STDs) ADMITTED',
    key: 'female_admitted',
    width: 50,
  },
  {
    header: 'ADMITTED STUDENTS',
    key: 'admitted_students',
    width: 30,
  },
];

module.exports = AdmissionStatisticsController;
