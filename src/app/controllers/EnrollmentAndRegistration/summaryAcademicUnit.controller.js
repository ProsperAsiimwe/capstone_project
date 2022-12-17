const { HttpResponse } = require('@helpers');
const {
  summaryAcademicUnitService,
  institutionStructureService,
} = require('@services/index');
const { sumBy, isEmpty, map, chain, toUpper } = require('lodash');

const http = new HttpResponse();

class SummaryAcademicUnitController {
  //  summaryAcademicUnitService
  async enrollmentAcademicUnitReport(req, res) {
    try {
      if (
        !req.query.academic_year_id ||
        !req.query.intake_id ||
        !req.query.semester_id
      ) {
        throw new Error('Invalid Context Provided');
      }
      let result = [];

      const context = req.query;

      const institutionStructure =
        await institutionStructureService.findInstitutionStructureRecords();

      const institutionStructureUpper = institutionStructure.academic_units.map(
        (e) => toUpper(e)
      );

      if (
        context.campus_id !== 'all' &&
        institutionStructure &&
        (institutionStructureUpper
          .map((element) => element.includes('FAC'))
          .includes(true) ||
          institutionStructureUpper
            .map((element) => element.includes('SCH'))
            .includes(true))
      ) {
        result = await summaryAcademicUnitService.facultyByCampus(context);
      } else if (
        context.campus_id !== 'all' &&
        institutionStructure &&
        institutionStructureUpper
          .map((element) => element.includes('COL'))
          .includes(true)
      ) {
        result = await summaryAcademicUnitService.collegeByCampus(context);
      } else {
        result = await summaryAcademicUnitService.departmentByCampus(context);
      }

      const report = chain(result)
        .groupBy('faculty_code')
        .map((value, key) => ({
          faculty_code: key,
          data: map(value, (r) => {
            return {
              enrollment_type: r.enrollment_type,
              programme_type: r.programme_type,
              programme_study_years: r.programme_study_years,
              total_number_enrolled_students: r.total_number_enrolled_students,
              number_full_registration_students:
                r.number_full_registration_students,
              number_provisional_registration_students:
                r.number_provisional_registration_students,
            };
          }),
        }))
        .value();

      report.forEach((element) => {
        const enrollmentData = calculateData(element.data);

        element.summary = enrollmentData;
      });

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
}

const calculateData = function (data) {
  try {
    const enrollment = data;

    let totalEnrolled = '';

    let enrollmentType = [];

    let programmeStudyYears = [];

    let fullyRegistered = '';

    let provisionalRegistration = '';

    let notRegistered = '';

    let totalRegistered = '';

    if (isEmpty(enrollment)) {
      totalEnrolled = 0;
      fullyRegistered = 0;
      provisionalRegistration = 0;
    } else {
      enrollmentType = [
        ...enrollment
          .reduce((r, o) => {
            const key = o.enrollment_type;

            const item =
              r.get(key) ||
              Object.assign({}, o, {
                total_number_enrolled_students: 0,
                number_full_registration_students: 0,
                number_provisional_registration_students: 0,
              });

            item.total_number_enrolled_students += Number(
              o.total_number_enrolled_students
            );

            item.number_full_registration_students += Number(
              o.number_full_registration_students
            );

            item.number_provisional_registration_students += Number(
              o.number_provisional_registration_students
            );

            return r.set(key, item);
          }, new Map())
          .values(),
      ];

      // programmeStudyYears
      programmeStudyYears = [
        ...enrollment
          .reduce((r, o) => {
            const key = o.programme_study_years;

            const item =
              r.get(key) ||
              Object.assign({}, o, {
                total_number_enrolled_students: 0,
                number_full_registration_students: 0,
                number_provisional_registration_students: 0,
              });

            item.total_number_enrolled_students += Number(
              o.total_number_enrolled_students
            );

            item.number_full_registration_students += Number(
              o.number_full_registration_students
            );

            item.number_provisional_registration_students += Number(
              o.number_provisional_registration_students
            );

            return r.set(key, item);
          }, new Map())
          .values(),
      ];

      totalEnrolled = sumBy(enrollment, (item) =>
        Number(item.total_number_enrolled_students)
      );

      fullyRegistered = sumBy(enrollment, (item) =>
        Number(item.number_full_registration_students)
      );
      provisionalRegistration = sumBy(enrollment, (item) =>
        Number(item.number_provisional_registration_students)
      );

      totalRegistered = provisionalRegistration + fullyRegistered;

      notRegistered = totalEnrolled - totalRegistered;
    }

    return {
      totalEnrolled,
      notRegistered,
      totalRegistered,
      fullyRegistered,
      provisionalRegistration,
      enrollmentType: map(enrollmentType, (r) => {
        return {
          programme_study_years: r.enrollment_type,
          total_number_enrolled_students: r.total_number_enrolled_students,
          number_full_registration_students:
            r.number_full_registration_students,
          number_provisional_registration_students:
            r.number_provisional_registration_students,
        };
      }),
      programmeStudyYears: map(programmeStudyYears, (r) => {
        return {
          programme_study_years: r.programme_study_years,
          total_number_enrolled_students: r.total_number_enrolled_students,
          number_full_registration_students:
            r.number_full_registration_students,
          number_provisional_registration_students:
            r.number_provisional_registration_students,
        };
      }),
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = SummaryAcademicUnitController;
