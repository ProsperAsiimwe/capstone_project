// graduateStatisticsReport

const { HttpResponse } = require('@helpers');
const { resultBiReportService } = require('@services/index');

const { sumBy, isEmpty } = require('lodash');

const http = new HttpResponse();

class GraduationStatisticsController {
  async graduateStatistics(req, res) {
    try {
      if (!req.query.academic_year_id) {
        throw new Error('Invalid Context Provided');
      }

      let report = [];

      const context = req.query;

      const result = await resultBiReportService.graduateStatisticsReport(
        context
      );

      report = generateReport(result);

      let data = {};

      data = { report, result };

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
}

const generateReport = function (data) {
  try {
    const graduateData = data;

    let total = 0;

    let maleGraduate = 0;

    let femaleGraduate = 0;

    let degreeClass = [];

    let entryAcademicYear = [];

    let academicUnitDegreeClass = [];

    if (isEmpty(graduateData)) {
      total = 0;

      maleGraduate = 0;

      femaleGraduate = 0;
    } else {
      academicUnitDegreeClass = [
        ...graduateData
          .reduce((r, o) => {
            const key = o.academic_unit_code + '-' + o.degree_class;

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

      degreeClass = [
        ...graduateData
          .reduce((r, o) => {
            const key = o.degree_class;

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

      entryAcademicYear = [
        ...graduateData
          .reduce((r, o) => {
            const key = o.entry_academic_year;

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

    const degreeClassSummary = degreeClass.map((e) => ({
      degree_class: e.degree_class,
      total_graduates: e.total_graduates,
      male_graduates: e.male_graduates,
      female_graduates: e.female_graduates,
    }));

    const entryAcademicYearSummary = entryAcademicYear.map((e) => ({
      entry_academic_year: e.entry_academic_year,
      total_graduates: e.total_graduates,
      male_graduates: e.male_graduates,
      female_graduates: e.female_graduates,
    }));

    const degreeClassAcademicUnit = academicUnitDegreeClass.map((e) => ({
      academic_unit_code: e.academic_unit_code,
      degree_class: e.degree_class,
      total_graduates: e.total_graduates,
      male_graduates: e.male_graduates,
      female_graduates: e.female_graduates,
    }));

    return {
      total,
      maleGraduate,
      femaleGraduate,
      degreeClassSummary,
      entryAcademicYearSummary,
      degreeClassAcademicUnit,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

//  grouping data by programme

// const groupByProgramme = (data) => {
//   try {
//     const merged = data.reduce(
//       (groupedData, { academic_unit_code, academic_unit_title, ...rest }) => {
//         const key = `${academic_unit_code}-${academic_unit_title}`;

//         groupedData[key] = groupedData[key] || {
//           academic_unit_code,
//           academic_unit_title,
//           programmes: [],
//         };

//         if (rest.programme_code) {
//           groupedData[key].programmes.push(rest);
//         }

//         return groupedData;
//       },
//       {}
//     );

//     return Object.values(merged);
//   } catch (error) {}
// };

// // groupByGraduateProgramme;

// const groupByGraduateProgramme = (data) => {
//   try {
//     const merged = data.reduce(
//       (
//         groupedData,
//         {
//           academic_unit_code,
//           academic_unit_title,
//           programme_code,
//           programme_title,
//           ...rest
//         }
//       ) => {
//         const key = `${academic_unit_code}-${academic_unit_title}-${programme_code}-${programme_title}`;

//         groupedData[key] = groupedData[key] || {
//           academic_unit_code,
//           academic_unit_title,
//           programme_code,
//           programme_title,
//           programmes: [],
//         };

//         if (rest.student_number) {
//           groupedData[key].programmes.push(rest);
//         }

//         return groupedData;
//       },
//       {}
//     );

//     return Object.values(merged);
//   } catch (error) {}
// };

module.exports = GraduationStatisticsController;
