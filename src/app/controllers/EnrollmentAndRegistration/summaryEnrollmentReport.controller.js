const { HttpResponse } = require('@helpers');
const {
  summaryEnrollmentStatusService,
  institutionStructureService,
} = require('@services/index');
const { sumBy, isEmpty, toUpper } = require('lodash');

const http = new HttpResponse();

class SummaryEnrollmentReportController {
  // report
  async enrollmentStatusFunction(req, res) {
    try {
      if (
        !req.query.campus_id ||
        !req.query.academic_year_id ||
        !req.query.intake_id ||
        !req.query.semester_id ||
        !req.query.programme_type_id ||
        !req.query.academic_unit_id
      ) {
        throw new Error('Invalid Context Provided');
      }

      const data = await summaryEnrollmentByFaculties(req);

      http.setSuccess(
        200,
        'Enrollment and registration detailed report fetched successfully ',
        {
          data,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable To Fetch Enrollment And Registration detailed Report',
        {
          error: { message: error.message },
        }
      );

      return http.send(res);
    }
  }
}

// faculty

const summaryEnrollmentByFaculties = async function (req) {
  try {
    let result = {};

    let enrollment = [];

    let summary = {};

    const context = req.query;

    const institutionStructure =
      await institutionStructureService.findInstitutionStructureRecords();

    const institutionStructureUpper = institutionStructure.academic_units.map(
      (e) => toUpper(e)
    );

    if (
      context.academic_unit_id === 'all' &&
      context.campus_id !== 'all' &&
      context.programme_type_id !== 'all'
    ) {
      enrollment = await summaryEnrollmentStatusService.campusAndProgrammeType(
        context
      );

      summary = await calculateData(enrollment);

      result = { enrollment, summary };
    } else if (
      context.academic_unit_id === 'all' &&
      context.campus_id !== 'all' &&
      context.programme_type_id === 'all'
    ) {
      enrollment = await summaryEnrollmentStatusService.campusAndEnrollment(
        context
      );
      summary = await calculateData(enrollment);

      result = { enrollment, summary };
    } else if (
      context.academic_unit_id === 'all' &&
      context.campus_id === 'all' &&
      context.programme_type_id !== 'all'
    ) {
      enrollment =
        await summaryEnrollmentStatusService.programmeTypeAndEnrollment(
          context
        );
      summary = await calculateData(enrollment);

      result = { enrollment, summary };
    } else if (
      context.academic_unit_id === 'all' &&
      context.campus_id === 'all' &&
      context.programme_type_id === 'all'
    ) {
      enrollment =
        await summaryEnrollmentStatusService.enrollmentStatusFunction(context);
      summary = await calculateData(enrollment);

      result = { enrollment, summary };

      //  academic unit
    } else if (
      context.academic_unit_id !== 'all' &&
      context.campus_id !== 'all' &&
      context.programme_type_id !== 'all' &&
      institutionStructure &&
      (institutionStructureUpper
        .map((element) => element.includes('FAC'))
        .includes(true) ||
        institutionStructureUpper
          .map((element) => element.includes('SCH'))
          .includes(true)) &&
      institutionStructureUpper.length === 2
    ) {
      enrollment =
        await summaryEnrollmentStatusService.facultyCampusProgrammeType(
          context
        );
      summary = await calculateData(enrollment);

      result = { enrollment, summary };
    } else if (
      context.academic_unit_id !== 'all' &&
      context.campus_id !== 'all' &&
      context.programme_type_id === 'all' &&
      institutionStructure &&
      (institutionStructureUpper
        .map((element) => element.includes('FAC'))
        .includes(true) ||
        institutionStructureUpper
          .map((element) => element.includes('SCH'))
          .includes(true)) &&
      institutionStructureUpper.length === 2
    ) {
      enrollment = await summaryEnrollmentStatusService.facultyCampusFunction(
        context
      );
      summary = await calculateData(enrollment);

      result = { enrollment, summary };
    } else if (
      context.academic_unit_id !== 'all' &&
      context.campus_id === 'all' &&
      context.programme_type_id !== 'all' &&
      institutionStructure &&
      (institutionStructureUpper
        .map((element) => element.includes('FAC'))
        .includes(true) ||
        institutionStructureUpper
          .map((element) => element.includes('SCH'))
          .includes(true)) &&
      institutionStructureUpper.length === 2
    ) {
      enrollment =
        await summaryEnrollmentStatusService.facultyProgrammeTypeFunction(
          context
        );
      summary = await calculateData(enrollment);

      result = { enrollment, summary };
    } else if (
      context.academic_unit_id !== 'all' &&
      context.campus_id === 'all' &&
      context.programme_type_id === 'all' &&
      institutionStructure &&
      (institutionStructureUpper
        .map((element) => element.includes('FAC'))
        .includes(true) ||
        institutionStructureUpper
          .map((element) => element.includes('SCH'))
          .includes(true)) &&
      institutionStructureUpper.length === 2
    ) {
      enrollment = await summaryEnrollmentStatusService.enrollmentStatusFaculty(
        context
      );
      summary = await calculateData(enrollment);

      result = { enrollment, summary };

      // college
    } else if (
      context.academic_unit_id !== 'all' &&
      context.campus_id !== 'all' &&
      context.programme_type_id !== 'all' &&
      institutionStructure &&
      institutionStructureUpper
        .map((element) => element.includes('COL'))
        .includes(true)
    ) {
      enrollment =
        await summaryEnrollmentStatusService.collegeCampusProgrammeType(
          context
        );
      summary = await calculateData(enrollment);

      result = { enrollment, summary };
    } else if (
      context.academic_unit_id !== 'all' &&
      context.campus_id !== 'all' &&
      context.programme_type_id === 'all' &&
      institutionStructure &&
      institutionStructureUpper
        .map((element) => element.includes('COL'))
        .includes(true)
    ) {
      enrollment = await summaryEnrollmentStatusService.collegeCampusFunction(
        context
      );
      summary = await calculateData(enrollment);

      result = { enrollment, summary };
    } else if (
      context.academic_unit_id !== 'all' &&
      context.campus_id === 'all' &&
      context.programme_type_id !== 'all' &&
      institutionStructure &&
      institutionStructure &&
      institutionStructureUpper
        .map((element) => element.includes('COL'))
        .includes(true)
    ) {
      enrollment =
        await summaryEnrollmentStatusService.collegeProgrammeTypeFunction(
          context
        );
      summary = await calculateData(enrollment);

      result = { enrollment, summary };
    } else if (
      context.academic_unit_id !== 'all' &&
      context.campus_id === 'all' &&
      context.programme_type_id === 'all' &&
      institutionStructure &&
      institutionStructureUpper
        .map((element) => element.includes('COL'))
        .includes(true)
    ) {
      enrollment = await summaryEnrollmentStatusService.enrollmentStatusCollege(
        context
      );
      summary = await calculateData(enrollment);

      result = { enrollment, summary };
    } else {
      throw new Error('Invalid context provided');
    }

    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};

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
      enrollmentType,
      programmeStudyYears,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = SummaryEnrollmentReportController;
