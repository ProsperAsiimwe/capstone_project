// registrationStatisticsService
/* eslint-disable camelcase */

const { HttpResponse } = require('@helpers');
const {
  summaryPaymentReportService,
  registrationStatisticsService,

  institutionStructureService,
} = require('@services/index');
const { sumBy, isEmpty, toUpper } = require('lodash');

const http = new HttpResponse();

class RegistrationStatisticsController {
  async registrationStatistics(req, res) {
    try {
      if (
        !req.query.campus_id ||
        !req.query.intake_id ||
        !req.query.academic_year_id ||
        !req.query.semester_id
      ) {
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
        result =
          await summaryPaymentReportService.detailedRegistrationStatisticsCollege(
            context
          );

        const filtered = generateReport(result);

        const groupedData = groupByProgramme(result);

        data = { filtered, groupedData, result };
      } else if (
        institutionStructure &&
        (institutionStructureUpper
          .map((element) => element.includes('FAC'))
          .includes(true) ||
          institutionStructureUpper
            .map((element) => element.includes('SCH'))
            .includes(true))
      ) {
        result =
          await registrationStatisticsService.detailedRegistrationStatistics(
            context
          );

        report = generateReport(result);
        groupedData = groupByProgramme(result);
      } else {
        throw new Error('Invalid Context Provided');
      }

      data = { report, groupedData };

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
    const registrationData = data;

    let enrolledStudents = 0;

    let fullRegistered = 0;

    let provisionallyRegistered = 0;

    let maleEnrolled = 0;

    let femaleEnrolled = 0;

    let academicUnit = [];

    let summaryAcademicUnit = [];

    let entryAcademicYear = [];

    let summaryAcademicYear = [];

    let sponsorshipAcademicYear = [];

    if (isEmpty(registrationData)) {
      enrolledStudents = 0;

      fullRegistered = 0;

      maleEnrolled = 0;

      femaleEnrolled = 0;
    } else {
      academicUnit = [
        ...registrationData
          .reduce((r, o) => {
            const key = o.academic_unit_code + '-' + o.programme_code;

            const item =
              r.get(key) ||
              Object.assign({}, o, {
                enrolled_students: 0,
                male_enrolled: 0,
                female_enrolled: 0,
                male_fully_registered: 0,
                female_fully_registered: 0,
                full_registered: 0,
                provisionally_registered: 0,
              });

            item.enrolled_students += Number(o.enrolled_students);
            item.male_enrolled += Number(o.male_enrolled);
            item.female_enrolled += Number(o.female_enrolled);
            item.male_fully_registered += Number(o.male_fully_registered);
            item.female_fully_registered += Number(o.female_fully_registered);
            item.full_registered += Number(o.full_registered);
            item.provisionally_registered += Number(o.provisionally_registered);

            return r.set(key, item);
          }, new Map())
          .values(),
      ];

      summaryAcademicUnit = [
        ...registrationData
          .reduce((r, o) => {
            const key = o.academic_unit_code;

            const item =
              r.get(key) ||
              Object.assign({}, o, {
                enrolled_students: 0,
                male_enrolled: 0,
                female_enrolled: 0,
                male_fully_registered: 0,
                female_fully_registered: 0,
                full_registered: 0,
                provisionally_registered: 0,
              });

            item.enrolled_students += Number(o.enrolled_students);
            item.male_enrolled += Number(o.male_enrolled);
            item.female_enrolled += Number(o.female_enrolled);
            item.male_fully_registered += Number(o.male_fully_registered);
            item.female_fully_registered += Number(o.female_fully_registered);
            item.full_registered += Number(o.full_registered);
            item.provisionally_registered += Number(o.provisionally_registered);

            return r.set(key, item);
          }, new Map())
          .values(),
      ];

      // entryAcademicYear

      entryAcademicYear = [
        ...registrationData
          .reduce((r, o) => {
            const key = o.academic_unit_code + '-' + o.entry_academic_year;

            const item =
              r.get(key) ||
              Object.assign({}, o, {
                enrolled_students: 0,
                male_enrolled: 0,
                female_enrolled: 0,
                male_fully_registered: 0,
                female_fully_registered: 0,
                full_registered: 0,
                provisionally_registered: 0,
              });

            item.enrolled_students += Number(o.enrolled_students);
            item.male_enrolled += Number(o.male_enrolled);
            item.female_enrolled += Number(o.female_enrolled);
            item.male_fully_registered += Number(o.male_fully_registered);
            item.female_fully_registered += Number(o.female_fully_registered);
            item.full_registered += Number(o.full_registered);
            item.provisionally_registered += Number(o.provisionally_registered);

            return r.set(key, item);
          }, new Map())
          .values(),
      ];

      // entry academic year summary

      summaryAcademicYear = [
        ...registrationData
          .reduce((r, o) => {
            const key = o.entry_academic_year;

            const item =
              r.get(key) ||
              Object.assign({}, o, {
                enrolled_students: 0,
                male_enrolled: 0,
                female_enrolled: 0,
                male_fully_registered: 0,
                female_fully_registered: 0,
                full_registered: 0,
                provisionally_registered: 0,
              });

            item.enrolled_students += Number(o.enrolled_students);
            item.male_enrolled += Number(o.male_enrolled);
            item.female_enrolled += Number(o.female_enrolled);
            item.male_fully_registered += Number(o.male_fully_registered);
            item.female_fully_registered += Number(o.female_fully_registered);
            item.full_registered += Number(o.full_registered);
            item.provisionally_registered += Number(o.provisionally_registered);

            return r.set(key, item);
          }, new Map())
          .values(),
      ];

      sponsorshipAcademicYear = [
        ...registrationData
          .reduce((r, o) => {
            const key = o.sponsorship + '-' + o.entry_academic_year;

            const item =
              r.get(key) ||
              Object.assign({}, o, {
                enrolled_students: 0,
                male_enrolled: 0,
                female_enrolled: 0,
                male_fully_registered: 0,
                female_fully_registered: 0,
                full_registered: 0,
                provisionally_registered: 0,
              });

            item.enrolled_students += Number(o.enrolled_students);
            item.male_enrolled += Number(o.male_enrolled);
            item.female_enrolled += Number(o.female_enrolled);
            item.male_fully_registered += Number(o.male_fully_registered);
            item.female_fully_registered += Number(o.female_fully_registered);
            item.full_registered += Number(o.full_registered);
            item.provisionally_registered += Number(o.provisionally_registered);

            return r.set(key, item);
          }, new Map())
          .values(),
      ];
    }

    enrolledStudents = sumBy(registrationData, (item) =>
      Number(item.enrolled_students)
    );
    fullRegistered = sumBy(registrationData, (item) =>
      Number(item.full_registered)
    );
    maleEnrolled = sumBy(registrationData, (item) =>
      Number(item.male_enrolled)
    );
    femaleEnrolled = sumBy(registrationData, (item) =>
      Number(item.female_enrolled)
    );
    provisionallyRegistered = sumBy(registrationData, (item) =>
      Number(item.provisionally_registered)
    );

    const academicUnitProgramme = groupByProgramme(
      academicUnit.map((e) => ({
        academic_unit_code: e.academic_unit_code,
        academic_unit_title: e.academic_unit_title,
        programme_code: e.programme_code,
        programme_title: e.programme_title,
        enrolled_students: e.enrolled_students,
        male_enrolled: e.male_enrolled,
        female_enrolled: e.female_enrolled,
        male_fully_registered: e.male_fully_registered,
        female_fully_registered: e.female_fully_registered,
        full_registered: e.full_registered,
        provisionally_registered: e.provisionally_registered,
      }))
    );

    const summaryEntryAcademicYear = summaryAcademicYear.map((e) => ({
      entry_academic_year: e.entry_academic_year,
      enrolled_students: e.enrolled_students,
      male_enrolled: e.male_enrolled,
      female_enrolled: e.female_enrolled,
      male_fully_registered: e.male_fully_registered,
      female_fully_registered: e.female_fully_registered,
      full_registered: e.full_registered,
      provisionally_registered: e.provisionally_registered,
    }));
    const entryAcademicYearFiltered = entryAcademicYear.map((e) => ({
      academic_unit_code: e.academic_unit_code,
      academic_unit_title: e.academic_unit_title,
      entry_academic_year: e.entry_academic_year,
      enrolled_students: e.enrolled_students,
      male_enrolled: e.male_enrolled,
      female_enrolled: e.female_enrolled,
      male_fully_registered: e.male_fully_registered,
      female_fully_registered: e.female_fully_registered,
      full_registered: e.full_registered,
      provisionally_registered: e.provisionally_registered,
    }));

    const academicUnitAcademicYear = groupByAcademicUnit(
      entryAcademicYearFiltered
    );

    const statisticsAcademicUnit = summaryAcademicUnit.map((e) => ({
      academic_unit_code: e.academic_unit_code,
      academic_unit_title: e.academic_unit_title,
      enrolled_students: e.enrolled_students,
      male_enrolled: e.male_enrolled,
      female_enrolled: e.female_enrolled,
      male_fully_registered: e.male_fully_registered,
      female_fully_registered: e.female_fully_registered,
      full_registered: e.full_registered,
      provisionally_registered: e.provisionally_registered,
    }));
    const sponsorshipData = sponsorshipAcademicYear.map((e) => ({
      entry_academic_year: e.entry_academic_year,
      sponsorship: e.sponsorship,
      enrolled_students: e.enrolled_students,
      male_enrolled: e.male_enrolled,
      female_enrolled: e.female_enrolled,
      male_fully_registered: e.male_fully_registered,
      female_fully_registered: e.female_fully_registered,
      full_registered: e.full_registered,
      provisionally_registered: e.provisionally_registered,
    }));

    const sponsorshipEntryAcademicYear = groupBySponsorship(sponsorshipData);

    return {
      enrolledStudents,
      fullRegistered,
      maleEnrolled,
      femaleEnrolled,
      provisionallyRegistered,
      summaryEntryAcademicYear,
      statisticsAcademicUnit,
      academicUnitAcademicYear,
      sponsorshipEntryAcademicYear,
      academicUnitProgramme,
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

const groupByAcademicUnit = (data) => {
  try {
    const merged = data.reduce(
      (groupedData, { academic_unit_code, academic_unit_title, ...rest }) => {
        const key = `${academic_unit_code}-${academic_unit_title}`;

        groupedData[key] = groupedData[key] || {
          academic_unit_code,
          academic_unit_title,
          data: [],
        };

        if (rest.entry_academic_year) {
          groupedData[key].data.push(rest);
        }

        return groupedData;
      },
      {}
    );

    return Object.values(merged);
  } catch (error) {}
};

const groupBySponsorship = (data) => {
  try {
    const merged = data.reduce((groupedData, { sponsorship, ...rest }) => {
      const key = `${sponsorship}`;

      groupedData[key] = groupedData[key] || {
        sponsorship,
        data: [],
      };

      if (rest.entry_academic_year) {
        groupedData[key].data.push(rest);
      }

      return groupedData;
    }, {});

    return Object.values(merged);
  } catch (error) {}
};

module.exports = RegistrationStatisticsController;
