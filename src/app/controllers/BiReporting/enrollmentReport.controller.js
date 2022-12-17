// enrollmentBiReport

const { HttpResponse } = require('@helpers');
const { resultBiReportService } = require('@services/index');

const { chain, orderBy } = require('lodash');

const http = new HttpResponse();

class EnrollmentBiReportController {
  async enrollmentBiReport(req, res) {
    try {
      let result = [];

      let academicYear = '';

      if (!req.query.academic_year_id) {
        const filterYears =
          await resultBiReportService.enrollmentAcademicYears();

        const context = { academic_year_id: filterYears[0].academic_year_id };

        result = await resultBiReportService.enrollmentBiReport(context);
        academicYear = filterYears[0].academic_year;
      } else {
        const context = req.query;

        result = await resultBiReportService.enrollmentBiReport(context);
        academicYear = 'Selected';
      }

      const report = generateReport(result);

      http.setSuccess(200, 'Report fetched successfully', {
        data: { academicYear, report },
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
    const enrollment = data;

    // console.log(
    //   enrollment.filter(
    //     (e) =>
    //       Number(e.female_enrolled) + Number(e.male_enrolled) !==
    //       Number(e.enrolled_students)
    //   )
    // );

    let semester = [];

    let studyLevel = [];

    let campus = [];

    let detail = [];

    let entryAcademicYear = [];

    semester = [
      ...enrollment
        .reduce((r, o) => {
          const key = o.semester;

          const item =
            r.get(key) ||
            Object.assign({}, o, {
              enrolled_students: 0,
              full_registered: 0,
              male_enrolled: 0,
              female_enrolled: 0,
            });

          item.enrolled_students += Number(o.enrolled_students);
          item.full_registered += Number(o.full_registered);
          item.male_enrolled += Number(o.male_enrolled);
          item.female_enrolled += Number(o.female_enrolled);

          return r.set(key, item);
        }, new Map())
        .values(),
    ];

    // entryAcademicYear
    entryAcademicYear = [
      ...enrollment
        .reduce((r, o) => {
          const key = o.semester + '-' + o.entry_academic_year;

          const item =
            r.get(key) ||
            Object.assign({}, o, {
              enrolled_students: 0,
              full_registered: 0,
              male_enrolled: 0,
              female_enrolled: 0,
            });

          item.enrolled_students += Number(o.enrolled_students);
          item.full_registered += Number(o.full_registered);
          item.male_enrolled += Number(o.male_enrolled);
          item.female_enrolled += Number(o.female_enrolled);

          return r.set(key, item);
        }, new Map())
        .values(),
    ];
    // studyLevel
    studyLevel = [
      ...enrollment
        .reduce((r, o) => {
          const key = o.semester + '-' + o.study_level;

          const item =
            r.get(key) ||
            Object.assign({}, o, {
              enrolled_students: 0,
              full_registered: 0,
              male_enrolled: 0,
              female_enrolled: 0,
            });

          item.enrolled_students += Number(o.enrolled_students);
          item.full_registered += Number(o.full_registered);
          item.male_enrolled += Number(o.male_enrolled);
          item.female_enrolled += Number(o.female_enrolled);

          return r.set(key, item);
        }, new Map())
        .values(),
    ];

    // campus
    campus = [
      ...enrollment
        .reduce((r, o) => {
          const key = o.semester + '-' + o.campus;

          const item =
            r.get(key) ||
            Object.assign({}, o, {
              enrolled_students: 0,
              full_registered: 0,
              male_enrolled: 0,
              female_enrolled: 0,
            });

          item.enrolled_students += Number(o.enrolled_students);
          item.full_registered += Number(o.full_registered);
          item.male_enrolled += Number(o.male_enrolled);
          item.female_enrolled += Number(o.female_enrolled);

          return r.set(key, item);
        }, new Map())
        .values(),
    ];

    // detail
    detail = [
      ...enrollment
        .reduce((r, o) => {
          const key = o.semester + '-' + o.campus + '-' + o.study_level;

          const item =
            r.get(key) ||
            Object.assign({}, o, {
              enrolled_students: 0,
              full_registered: 0,
              male_enrolled: 0,
              female_enrolled: 0,
            });

          item.enrolled_students += Number(o.enrolled_students);
          item.full_registered += Number(o.full_registered);
          item.male_enrolled += Number(o.male_enrolled);
          item.female_enrolled += Number(o.female_enrolled);

          return r.set(key, item);
        }, new Map())
        .values(),
    ];

    // const totalEnrolled = sumBy(enrollment, (item) =>
    //   Number(item.enrolled_students)
    // );

    // const maleEnrolled = sumBy(enrollment, (item) =>
    //   Number(item.male_enrolled)
    // );

    // const femaleEnrolled = sumBy(enrollment, (item) =>
    //   Number(item.female_enrolled)
    // );

    const semesterSummary = semester.map((e) => ({
      academic_year: e.academic_year,
      semester: e.semester,
      enrolled_students: e.enrolled_students,
      male_enrolled: e.male_enrolled,
      female_enrolled: e.female_enrolled,
      full_registered: e.full_registered,
    }));

    const entryAcademicYearSummary = orderBy(
      chain(entryAcademicYear)
        .groupBy('semester')
        .map((value, key) => ({
          semester: key,
          records: value.map((e) => ({
            entry_academic_year: e.entry_academic_year,
            enrolled_students: e.enrolled_students,
            male_enrolled: e.male_enrolled,
            female_enrolled: e.female_enrolled,
            full_registered: e.full_registered,
          })),
        }))
        .value(),
      ['semester'],
      ['entry_academic_years'],
      ['desc'],
      ['asc']
    );

    const studyLevelSummary = orderBy(
      chain(studyLevel)
        .groupBy('semester')
        .map((value, key) => ({
          semester: key,
          records: value.map((e) => ({
            academic_year: e.academic_year,
            study_level: e.study_level,
            enrolled_students: e.enrolled_students,
            male_enrolled: e.male_enrolled,
            female_enrolled: e.female_enrolled,
            full_registered: e.full_registered,
          })),
        }))
        .value(),
      ['semester'],
      ['asc']
    );

    const campusSummary = orderBy(
      chain(campus)
        .groupBy('semester')
        .map((value, key) => ({
          semester: key,
          records: value.map((e) => ({
            academic_year: e.academic_year,
            semester: e.semester,
            campus: e.campus,
            enrolled_students: e.enrolled_students,
            male_enrolled: e.male_enrolled,
            female_enrolled: e.female_enrolled,
            full_registered: e.full_registered,
          })),
        }))
        .value(),
      ['semester'],
      ['asc']
    );
    const detailSummary = orderBy(
      chain(detail)
        .groupBy('semester')
        .map((value, key) => ({
          semester: key,
          records: value.map((e) => ({
            academic_year: e.academic_year,
            campus: e.campus,
            study_level: e.study_level,
            enrolled_students: e.enrolled_students,
            male_enrolled: e.male_enrolled,
            female_enrolled: e.female_enrolled,
            full_registered: e.full_registered,
          })),
        }))
        .value(),
      ['semester'],
      ['asc']
    );

    return {
      semesterSummary,
      entryAcademicYearSummary,
      studyLevelSummary,
      campusSummary,
      detailSummary,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = EnrollmentBiReportController;
