const { HttpResponse } = require('@helpers');
const {
  detailedReportsService,
  institutionStructureService,
  detailedReportsByDepartmentsService,
  detailedReportsByFacultiesService,
} = require('@services/index');
const { sumBy } = require('lodash');

const {
  facultyReportGrouping,
  departmentReportGrouping,
  collegeReportGrouping,
} = require('../Helpers/enrollmentReportGroupingHelper');

const http = new HttpResponse();

class DetailedReportsController {
  /**
   * fees preview controller
   * @param {*} req
   * @param {*} res
   */
  async detailedReportsFunction(req, res) {
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

      let structure = 'Departments';

      let EnrolledStudentsData = {};

      const institutionStructure =
        await institutionStructureService.findInstitutionStructureRecords();

      if (
        (institutionStructure &&
          institutionStructure.academic_units.includes('Colleges')) ||
        (institutionStructure &&
          institutionStructure.academic_units.includes('COLLEGES'))
      ) {
        structure = 'Colleges';
        EnrolledStudentsData = await enrolledStudentsByCollege(req);
      } else if (
        institutionStructure &&
        (institutionStructure.academic_units.includes('Faculties') ||
          institutionStructure.academic_units.includes('Schools'))
      ) {
        structure = institutionStructure.academic_units.includes('Faculties')
          ? 'Faculties'
          : 'Schools';
        EnrolledStudentsData = await enrolledStudentsByFaculties(req);
      } else {
        EnrolledStudentsData = await enrolledStudentsByDepartment(req);
      }

      http.setSuccess(
        200,
        'Enrollment and registration detailed report fetched successfully ',
        {
          EnrolledStudentsData,
          structure,
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

/**
 *
 * College Institutions
 * EnrollmentAndRegistrationReportsService
 *
 *
 */

const enrolledStudentsByCollege = async function (req) {
  try {
    let result = {};
    const context = req.query;

    if (
      context.academic_unit_id === 'all' &&
      context.campus_id !== 'all' &&
      context.programme_type_id !== 'all'
    ) {
      const resultData = await detailedReportsService.numberOfEnrolledStudents(
        context
      );

      const enrolledStudents = await collegeReportGrouping(resultData);

      result = { enrolledStudents };
    } else if (
      context.academic_unit_id === 'all' &&
      context.campus_id !== 'all' &&
      context.programme_type_id === 'all'
    ) {
      const resultData =
        await detailedReportsService.numberOfEnrolledStudentsAllProgrammeTypes(
          context
        );

      const enrolledStudents = await collegeReportGrouping(resultData);

      result = { enrolledStudents };
    } else if (
      context.academic_unit_id === 'all' &&
      context.campus_id === 'all' &&
      context.programme_type_id !== 'all'
    ) {
      const resultData =
        await detailedReportsService.numberOfEnrolledStudentsAllCampuses(
          context
        );

      const enrolledStudents = await collegeReportGrouping(resultData);

      result = { enrolledStudents };
    } else if (
      context.academic_unit_id === 'all' &&
      context.campus_id === 'all' &&
      context.programme_type_id === 'all'
    ) {
      const resultData =
        await detailedReportsService.numberOfstudentEnrolledCampusesProgrammeTypes(
          context
        );

      const enrolledStudents = await collegeReportGrouping(resultData);

      result = { enrolledStudents };
    } else if (
      context.academic_unit_id !== 'all' &&
      context.campus_id !== 'all' &&
      context.programme_type_id !== 'all'
    ) {
      const resultData = await detailedReportsService.enrolledStudentsByCollege(
        context
      );
      const enrolledStudents = await collegeReportGrouping(resultData);

      result = { enrolledStudents };
    } else if (
      context.academic_unit_id !== 'all' &&
      context.campus_id !== 'all' &&
      context.programme_type_id === 'all'
    ) {
      const resultData =
        await detailedReportsService.enrolledStudentsByCollegeAllProgrammeTypes(
          context
        );

      const enrolledStudents = await collegeReportGrouping(resultData);

      result = { enrolledStudents };
    } else if (
      context.academic_unit_id !== 'all' &&
      context.campus_id === 'all' &&
      context.programme_type_id !== 'all'
    ) {
      const resultData =
        await detailedReportsService.enrolledStudentsByCollegeAllCampuses(
          context
        );

      const enrolledStudents = await collegeReportGrouping(resultData);

      result = { enrolledStudents };
    } else if (
      context.academic_unit_id !== 'all' &&
      context.campus_id === 'all' &&
      context.programme_type_id === 'all'
    ) {
      const resultData =
        await detailedReportsService.enrolledStudentsByCollegeAllCampusesProgrammeTypes(
          context
        );

      const enrolledStudents = await collegeReportGrouping(resultData);

      result = { enrolledStudents };
    } else {
      throw new Error('Invalid context provided');
    }

    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * department institution
 *
 */

const enrolledStudentsByDepartment = async function (req) {
  try {
    let result = {};
    const context = req.query;

    if (
      context.academic_unit_id === 'all' &&
      context.campus_id !== 'all' &&
      context.programme_type_id !== 'all'
    ) {
      const resultData =
        await detailedReportsByDepartmentsService.enrolledStudents(context);

      const enrolledStudents = await departmentReportGrouping(resultData);

      result = { enrolledStudents };
    } else if (
      context.academic_unit_id === 'all' &&
      context.campus_id !== 'all' &&
      context.programme_type_id === 'all'
    ) {
      const resultData =
        await detailedReportsByDepartmentsService.enrolledStudentsAllProgrammeTypes(
          context
        );

      const enrolledStudents = await departmentReportGrouping(resultData);

      enrolledStudents.forEach((element) => {
        const totalEnrolled = sumBy(element.programmes, (item) =>
          Number(item.total_number_enrolled_students)
        );
        const totalFullRegistered = sumBy(element.programmes, (item) =>
          Number(item.number_full_registration_students)
        );
        const totalProvisionalRegistered = sumBy(element.programmes, (item) =>
          Number(item.number_provisional_registration_students)
        );

        const summaryData = {
          totalEnrolled,
          totalFullRegistered,
          totalProvisionalRegistered,
        };

        element.summaryData = summaryData;
      });

      result = { enrolledStudents };
    } else if (
      context.academic_unit_id === 'all' &&
      context.campus_id === 'all' &&
      context.programme_type_id !== 'all'
    ) {
      const resultData =
        await detailedReportsByDepartmentsService.enrolledStudentsAllCampuses(
          context
        );

      const enrolledStudents = await departmentReportGrouping(resultData);

      result = { enrolledStudents };
    } else if (
      context.academic_unit_id === 'all' &&
      context.campus_id === 'all' &&
      context.programme_type_id === 'all'
    ) {
      const resultData =
        await detailedReportsByDepartmentsService.enrolledStudentsCampusesProgrammeTypes(
          context
        );

      const enrolledStudents = await departmentReportGrouping(resultData);

      result = { enrolledStudents };
    } else if (
      context.academic_unit_id !== 'all' &&
      context.campus_id !== 'all' &&
      context.programme_type_id !== 'all'
    ) {
      const resultData =
        await detailedReportsByDepartmentsService.enrolledStudentsByDepartment(
          context
        );

      const enrolledStudents = await departmentReportGrouping(resultData);

      result = { enrolledStudents };
    } else if (
      context.academic_unit_id !== 'all' &&
      context.campus_id !== 'all' &&
      context.programme_type_id === 'all'
    ) {
      const resultData =
        await detailedReportsByDepartmentsService.enrolledStudentsByDepartmentAllProgrammeTypes(
          context
        );

      const enrolledStudents = await departmentReportGrouping(resultData);

      result = { enrolledStudents };
    } else if (
      context.academic_unit_id !== 'all' &&
      context.campus_id === 'all' &&
      context.programme_type_id !== 'all'
    ) {
      const resultData =
        await detailedReportsByDepartmentsService.enrolledStudentsByDepartmentAllCampuses(
          context
        );

      const enrolledStudents = await departmentReportGrouping(resultData);

      result = { enrolledStudents };
    } else if (
      context.academic_unit_id !== 'all' &&
      context.campus_id === 'all' &&
      context.programme_type_id === 'all'
    ) {
      const resultData =
        await detailedReportsByDepartmentsService.enrolledStudentsByDepartmentAllCampusesProgrammeTypes(
          context
        );

      const enrolledStudents = await departmentReportGrouping(resultData);

      result = { enrolledStudents };
    } else {
      throw new Error('Invalid context provided');
    }

    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * faculty institution
 *
 */

const enrolledStudentsByFaculties = async function (req) {
  try {
    let result = {};
    const context = req.query;

    if (
      context.academic_unit_id === 'all' &&
      context.campus_id !== 'all' &&
      context.programme_type_id !== 'all'
    ) {
      const resultData =
        await detailedReportsByFacultiesService.enrolledStudents(context);

      const enrolledStudents = await facultyReportGrouping(resultData);

      result = { enrolledStudents };
    } else if (
      context.academic_unit_id === 'all' &&
      context.campus_id !== 'all' &&
      context.programme_type_id === 'all'
    ) {
      const resultData =
        await detailedReportsByFacultiesService.enrolledStudentsAllProgrammeTypes(
          context
        );

      const enrolledStudents = await facultyReportGrouping(resultData);

      result = { enrolledStudents };
    } else if (
      context.academic_unit_id === 'all' &&
      context.campus_id === 'all' &&
      context.programme_type_id !== 'all'
    ) {
      const resultData =
        await detailedReportsByFacultiesService.enrolledStudentsAllCampuses(
          context
        );
      const enrolledStudents = await facultyReportGrouping(resultData);

      result = { enrolledStudents };
    } else if (
      context.academic_unit_id === 'all' &&
      context.campus_id === 'all' &&
      context.programme_type_id === 'all'
    ) {
      const resultData =
        await detailedReportsByFacultiesService.enrolledStudentsAllCampusesProgrammeTypes(
          context
        );

      const enrolledStudents = await facultyReportGrouping(resultData);

      result = { enrolledStudents };
    } else if (
      context.academic_unit_id !== 'all' &&
      context.campus_id !== 'all' &&
      context.programme_type_id !== 'all'
    ) {
      const resultData =
        await detailedReportsByFacultiesService.enrolledStudentsByFaculty(
          context
        );

      const enrolledStudents = await facultyReportGrouping(resultData);

      result = { enrolledStudents };
    } else if (
      context.academic_unit_id !== 'all' &&
      context.campus_id !== 'all' &&
      context.programme_type_id === 'all'
    ) {
      const resultData =
        await detailedReportsByFacultiesService.enrolledStudentsByFacultyAllProgrammeTypes(
          context
        );
      const enrolledStudents = await facultyReportGrouping(resultData);

      result = { enrolledStudents };
    } else if (
      context.academic_unit_id !== 'all' &&
      context.campus_id === 'all' &&
      context.programme_type_id !== 'all'
    ) {
      const resultData =
        await detailedReportsByFacultiesService.enrolledStudentsByFacultyAllCampuses(
          context
        );

      const enrolledStudents = await facultyReportGrouping(resultData);

      result = { enrolledStudents };
    } else if (
      context.academic_unit_id !== 'all' &&
      context.campus_id === 'all' &&
      context.programme_type_id === 'all'
    ) {
      const resultData =
        await detailedReportsByFacultiesService.enrolledStudentsByFacultyAllCampusesProgrammeTypes(
          context
        );

      const enrolledStudents = await facultyReportGrouping(resultData);

      result = { enrolledStudents };
    } else {
      throw new Error('Invalid context provided');
    }

    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = DetailedReportsController;
