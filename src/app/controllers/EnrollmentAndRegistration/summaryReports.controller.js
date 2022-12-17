/* eslint-disable camelcase */
const { HttpResponse } = require('@helpers');
const {
  summaryReportsService,
  summaryReportsByFacultyService,
  summaryReportsByDepartmentService,
  institutionStructureService,
  metadataValueService,
  academicYearService,
} = require('@services/index');
const { isEmpty } = require('lodash');

const http = new HttpResponse();

class ReportsEnrollmentRegistrationController {
  /**
   * summary report controller
   * @param {*} req
   * @param {*} res
   */
  async summaryReportsFunction(req, res) {
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
      const institutionStructure =
        await institutionStructureService.findInstitutionStructureRecords();

      let EnrolledStudentsData = {};

      let RegisteredStudents = {};

      const semesterData = await metadataValueService.findOneMetadataValue({
        where: { id: req.query.semester_id },
      });

      const academicYearData1 = await academicYearService.findOneAcademicYear({
        where: { id: req.query.academic_year_id },
      });

      const semester = semesterData.dataValues.metadata_value;

      const academicYearEvent = academicYearData1.dataValues.academic_year_id;

      const academicYearData = await metadataValueService.findOneMetadataValue({
        where: { id: academicYearEvent },
      });

      const academicYear = academicYearData.dataValues.metadata_value;

      req.academicYear = academicYear;
      req.semester = semester;

      if (
        institutionStructure &&
        institutionStructure.academic_units.includes('Colleges')
      ) {
        structure = 'Colleges';

        EnrolledStudentsData = await numberEnrolledStudentsByCollege(req);

        RegisteredStudents = await numberRegisteredStudentsByCollege(req);
      } else if (
        institutionStructure &&
        (institutionStructure.academic_units.includes('Faculties') ||
          institutionStructure.academic_units.includes('Schools'))
      ) {
        structure = institutionStructure.academic_units.includes('Faculties')
          ? 'Faculties'
          : 'Schools';
        EnrolledStudentsData = await numberEnrolledStudentsByFaculty(req);

        RegisteredStudents = await numberRegisteredStudentsByFaculty(req);
      } else {
        EnrolledStudentsData = await numberEnrolledStudentsByDepartment(req);

        RegisteredStudents = await numberRegisteredStudentsByDepartment(req);
      }

      const studentEnrollmentData = calculateNotEnrolledStudents(
        EnrolledStudentsData,
        RegisteredStudents
      );

      http.setSuccess(
        200,
        'Enrollment and registration summary report fetched successfully ',
        {
          studentEnrollmentData,
          structure,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable To Fetch Enrollment And Registration Summary Report',
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
 * EnrollmentAndRegistrationReportsService
 */
const numberEnrolledStudentsByCollege = async function (req) {
  try {
    let result = {};
    const context = req.query;

    context.semester = req.semester;
    context.academicYear = req.academicYear;

    const institutionStructure =
      await institutionStructureService.findInstitutionStructureRecords();

    if (
      context.academic_unit_id === 'all' &&
      context.campus_id !== 'all' &&
      context.programme_type_id !== 'all'
    ) {
      const enrolledStudents =
        await summaryReportsService.numberOfEnrolledStudents(context);

      result = { enrolledStudents };
    } else if (
      context.academic_unit_id === 'all' &&
      context.campus_id !== 'all' &&
      context.programme_type_id === 'all'
    ) {
      const enrolledStudents =
        await summaryReportsService.enrolledStudentsAllProgrammeTypes(context);

      result = { enrolledStudents };
    } else if (
      context.academic_unit_id === 'all' &&
      context.campus_id === 'all' &&
      context.programme_type_id !== 'all'
    ) {
      const enrolledStudents =
        await summaryReportsService.enrolledStudentsAllCampuses(context);

      result = { enrolledStudents };
    } else if (
      context.academic_unit_id === 'all' &&
      context.campus_id === 'all' &&
      context.programme_type_id === 'all'
    ) {
      const enrolledStudents =
        await summaryReportsService.enrolledStudentsAllCampusesProgrammeTypes(
          context
        );

      result = { enrolledStudents };

      // college id
    } else if (
      institutionStructure &&
      institutionStructure.academic_units.includes('Colleges') &&
      context.academic_unit_id !== 'all' &&
      context.campus_id !== 'all' &&
      context.programme_type_id !== 'all'
    ) {
      const enrolledStudents =
        await summaryReportsService.enrolledStudentsByCollege(context);

      result = { enrolledStudents };
    } else if (
      context.academic_unit_id !== 'all' &&
      context.campus_id !== 'all' &&
      context.programme_type_id === 'all'
    ) {
      const enrolledStudents =
        await summaryReportsService.enrolledStudentsByCollegeProgrammeTypes(
          context
        );

      result = { enrolledStudents };
    } else if (
      context.academic_unit_id !== 'all' &&
      context.campus_id === 'all' &&
      context.programme_type_id !== 'all'
    ) {
      const enrolledStudents =
        await summaryReportsService.enrolledStudentsByCollegeAllCampuses(
          context
        );

      result = { enrolledStudents };
    } else if (
      context.academic_unit_id !== 'all' &&
      context.campus_id === 'all' &&
      context.programme_type_id === 'all'
    ) {
      const enrolledStudents =
        await summaryReportsService.studentsEnrolledByCollege(context);

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
 * number registered students
 */
const numberRegisteredStudentsByCollege = async function (req) {
  try {
    let result = {};
    const context = req.query;

    if (
      context.academic_unit_id === 'all' &&
      context.campus_id !== 'all' &&
      context.programme_type_id !== 'all'
    ) {
      const registeredStudents =
        await summaryReportsService.numberOfStudentsRegistered(context);

      result = { registeredStudents };
    } else if (
      context.academic_unit_id === 'all' &&
      context.campus_id !== 'all' &&
      context.programme_type_id === 'all'
    ) {
      const registeredStudents =
        await summaryReportsService.registeredStudentsAllProgrammeTypes(
          context
        );

      result = { registeredStudents };
    } else if (
      context.academic_unit_id === 'all' &&
      context.campus_id === 'all' &&
      context.programme_type_id !== 'all'
    ) {
      const registeredStudents =
        await summaryReportsService.registeredStudentsAllCampuses(context);

      result = { registeredStudents };
    } else if (
      context.academic_unit_id === 'all' &&
      context.campus_id === 'all' &&
      context.programme_type_id === 'all'
    ) {
      const registeredStudents =
        await summaryReportsService.registeredStudentsAllCampusesProgrammeTypes(
          context
        );

      result = { registeredStudents };
    } else if (
      context.academic_unit_id !== 'all' &&
      context.campus_id !== 'all' &&
      context.programme_type_id === 'all'
    ) {
      const registeredStudents =
        await summaryReportsService.registeredStudentsByCollegeProgrammeTypes(
          context
        );

      result = { registeredStudents };
    } else if (
      context.academic_unit_id !== 'all' &&
      context.campus_id !== 'all' &&
      context.programme_type_id !== 'all'
    ) {
      const registeredStudents =
        await summaryReportsService.registeredStudentsByCollegeType(context);

      result = { registeredStudents };
    } else if (
      context.academic_unit_id !== 'all' &&
      context.campus_id === 'all' &&
      context.programme_type_id !== 'all'
    ) {
      const registeredStudents =
        await summaryReportsService.registeredStudentsByCollegeAllCampuses(
          context
        );

      result = { registeredStudents };
    } else if (
      context.academic_unit_id !== 'all' &&
      context.campus_id === 'all' &&
      context.programme_type_id === 'all'
    ) {
      //
      const registeredStudents =
        await summaryReportsService.registeredStudentsByCollege(context);

      result = { registeredStudents };
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
 * department
 */

const numberEnrolledStudentsByDepartment = async function (req) {
  try {
    let result = {};
    const context = req.query;

    context.semester = req.semester;
    context.academicYear = req.academicYear;

    if (
      context.academic_unit_id === 'all' &&
      context.campus_id !== 'all' &&
      context.programme_type_id !== 'all'
    ) {
      const enrolledStudents =
        await summaryReportsService.numberOfEnrolledStudents(context);

      result = { enrolledStudents };
    } else if (
      context.academic_unit_id === 'all' &&
      context.campus_id !== 'all' &&
      context.programme_type_id === 'all'
    ) {
      const enrolledStudents =
        await summaryReportsService.enrolledStudentsAllProgrammeTypes(context);

      result = { enrolledStudents };
    } else if (
      context.academic_unit_id === 'all' &&
      context.campus_id === 'all' &&
      context.programme_type_id !== 'all'
    ) {
      const enrolledStudents =
        await summaryReportsService.enrolledStudentsAllCampuses(context);

      result = { enrolledStudents };
    } else if (
      context.academic_unit_id === 'all' &&
      context.campus_id === 'all' &&
      context.programme_type_id === 'all'
    ) {
      const enrolledStudents =
        await summaryReportsService.enrolledStudentsAllCampusesProgrammeTypes(
          context
        );

      result = { enrolledStudents };

      // academic_unit_id
    } else if (
      context.academic_unit_id !== 'all' &&
      context.campus_id !== 'all' &&
      context.programme_type_id !== 'all'
    ) {
      const enrolledStudents =
        await summaryReportsByDepartmentService.enrolledStudentsByDepartment(
          context
        );

      result = { enrolledStudents };
    } else if (
      context.academic_unit_id !== 'all' &&
      context.campus_id !== 'all' &&
      context.programme_type_id === 'all'
    ) {
      const enrolledStudents =
        await summaryReportsByDepartmentService.enrolledStudentsByDepartmentAllProgrammeTypes(
          context
        );

      result = { enrolledStudents };
    } else if (
      context.academic_unit_id !== 'all' &&
      context.campus_id === 'all' &&
      context.programme_type_id !== 'all'
    ) {
      const enrolledStudents =
        await summaryReportsByDepartmentService.enrolledStudentsByDepartmentAllCampuses(
          context
        );

      result = { enrolledStudents };
    } else if (
      context.academic_unit_id !== 'all' &&
      context.campus_id === 'all' &&
      context.programme_type_id === 'all'
    ) {
      const enrolledStudents =
        await summaryReportsByDepartmentService.enrolledStudentsByDepartment(
          context
        );

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
 * number registered students
 */
const numberRegisteredStudentsByDepartment = async function (req) {
  try {
    let result = {};
    const context = req.query;

    if (
      context.academic_unit_id === 'all' &&
      context.campus_id !== 'all' &&
      context.programme_type_id !== 'all'
    ) {
      const registeredStudents =
        await summaryReportsService.numberOfStudentsRegistered(context);

      result = { registeredStudents };
    } else if (
      context.academic_unit_id === 'all' &&
      context.campus_id !== 'all' &&
      context.programme_type_id === 'all'
    ) {
      const registeredStudents =
        await summaryReportsService.registeredStudentsAllProgrammeTypes(
          context
        );

      result = { registeredStudents };
    } else if (
      context.academic_unit_id === 'all' &&
      context.campus_id === 'all' &&
      context.programme_type_id !== 'all'
    ) {
      const registeredStudents =
        await summaryReportsService.registeredStudentsAllCampuses(context);

      result = { registeredStudents };
    } else if (
      context.academic_unit_id === 'all' &&
      context.campus_id === 'all' &&
      context.programme_type_id === 'all'
    ) {
      const registeredStudents =
        await summaryReportsService.registeredStudentsAllCampusesProgrammeTypes(
          context
        );

      result = { registeredStudents };
    } else if (
      context.academic_unit_id !== 'all' &&
      context.campus_id !== 'all' &&
      context.programme_type_id === 'all'
    ) {
      const registeredStudents =
        await summaryReportsByDepartmentService.registeredStudentsByDepartmentAllProgrammeTypes(
          context
        );

      result = { registeredStudents };
    } else if (
      context.academic_unit_id !== 'all' &&
      context.campus_id !== 'all' &&
      context.programme_type_id !== 'all'
    ) {
      const registeredStudents =
        await summaryReportsByDepartmentService.registeredStudentsByDepartment(
          context
        );

      result = { registeredStudents };
    } else if (
      context.academic_unit_id !== 'all' &&
      context.campus_id === 'all' &&
      context.programme_type_id !== 'all'
    ) {
      const registeredStudents =
        await summaryReportsByDepartmentService.registeredByDepartmentAllCampuses(
          context
        );

      result = { registeredStudents };
    } else if (
      context.academic_unit_id !== 'all' &&
      context.campus_id === 'all' &&
      context.programme_type_id === 'all'
    ) {
      const registeredStudents =
        await summaryReportsByDepartmentService.registeredStudentsByDepartment(
          context
        );

      result = { registeredStudents };
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
 * FACULTY
 */

const numberEnrolledStudentsByFaculty = async function (req) {
  try {
    let result = {};
    const context = req.query;

    context.semester = req.semester;
    context.academicYear = req.academicYear;

    // here

    if (
      context.academic_unit_id === 'all' &&
      context.campus_id !== 'all' &&
      context.programme_type_id !== 'all'
    ) {
      const enrolledStudents =
        await summaryReportsService.numberOfEnrolledStudents(context);

      result = { enrolledStudents };
    } else if (
      context.academic_unit_id === 'all' &&
      context.campus_id !== 'all' &&
      context.programme_type_id === 'all'
    ) {
      const enrolledStudents =
        await summaryReportsService.enrolledStudentsAllProgrammeTypes(context);

      result = { enrolledStudents };
    } else if (
      context.academic_unit_id === 'all' &&
      context.campus_id === 'all' &&
      context.programme_type_id !== 'all'
    ) {
      const enrolledStudents =
        await summaryReportsService.enrolledStudentsAllCampuses(context);

      result = { enrolledStudents };
    } else if (
      context.academic_unit_id === 'all' &&
      context.campus_id === 'all' &&
      context.programme_type_id === 'all'
    ) {
      const enrolledStudents =
        await summaryReportsService.enrolledStudentsAllCampusesProgrammeTypes(
          context
        );

      result = { enrolledStudents };

      // academic_unit_id
    } else if (
      context.academic_unit_id !== 'all' &&
      context.campus_id !== 'all' &&
      context.programme_type_id !== 'all'
    ) {
      const enrolledStudents =
        await summaryReportsByFacultyService.enrolledStudentsByFaculty(context);

      result = { enrolledStudents };
    } else if (
      context.academic_unit_id !== 'all' &&
      context.campus_id !== 'all' &&
      context.programme_type_id === 'all'
    ) {
      const enrolledStudents =
        await summaryReportsByFacultyService.enrolledStudentsByFacultyAllProgrammeTypes(
          context
        );

      result = { enrolledStudents };
    } else if (
      context.academic_unit_id !== 'all' &&
      context.campus_id === 'all' &&
      context.programme_type_id !== 'all'
    ) {
      const enrolledStudents =
        await summaryReportsByFacultyService.enrolledStudentsByFacultyAllCampuses(
          context
        );

      result = { enrolledStudents };
    } else if (
      context.academic_unit_id !== 'all' &&
      context.campus_id === 'all' &&
      context.programme_type_id === 'all'
    ) {
      const enrolledStudents =
        await summaryReportsByFacultyService.enrolledStudentsByFacultyCampusPorgrammeTypes(
          context
        );

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
 * number registered students
 */
const numberRegisteredStudentsByFaculty = async function (req) {
  try {
    let result = {};
    const context = req.query;

    if (
      context.academic_unit_id === 'all' &&
      context.campus_id !== 'all' &&
      context.programme_type_id !== 'all'
    ) {
      const registeredStudents =
        await summaryReportsService.numberOfStudentsRegistered(context);

      result = { registeredStudents };
    } else if (
      context.academic_unit_id === 'all' &&
      context.campus_id !== 'all' &&
      context.programme_type_id === 'all'
    ) {
      const registeredStudents =
        await summaryReportsService.registeredStudentsAllProgrammeTypes(
          context
        );

      result = { registeredStudents };
    } else if (
      context.academic_unit_id === 'all' &&
      context.campus_id === 'all' &&
      context.programme_type_id !== 'all'
    ) {
      const registeredStudents =
        await summaryReportsService.registeredStudentsAllCampuses(context);

      result = { registeredStudents };
    } else if (
      context.academic_unit_id === 'all' &&
      context.campus_id === 'all' &&
      context.programme_type_id === 'all'
    ) {
      const registeredStudents =
        await summaryReportsService.registeredStudentsAllCampusesProgrammeTypes(
          context
        );

      result = { registeredStudents };
    } else if (
      context.academic_unit_id !== 'all' &&
      context.campus_id !== 'all' &&
      context.programme_type_id === 'all'
    ) {
      const registeredStudents =
        await summaryReportsByFacultyService.registeredStudentsByFacultyAllProgrammeTypes(
          context
        );

      result = { registeredStudents };
    } else if (
      context.academic_unit_id !== 'all' &&
      context.campus_id !== 'all' &&
      context.programme_type_id !== 'all'
    ) {
      const registeredStudents =
        await summaryReportsByFacultyService.registeredStudentsByFaculty(
          context
        );

      result = { registeredStudents };
    } else if (
      context.academic_unit_id !== 'all' &&
      context.campus_id === 'all' &&
      context.programme_type_id !== 'all'
    ) {
      const registeredStudents =
        await summaryReportsByFacultyService.registeredStudentByFacultyAllCampuses(
          context
        );

      result = { registeredStudents };
    } else if (
      context.academic_unit_id !== 'all' &&
      context.campus_id === 'all' &&
      context.programme_type_id === 'all'
    ) {
      const registeredStudents =
        await summaryReportsByFacultyService.registeredStudentsByFacultyAllCampusesProgrammeTypes(
          context
        );

      result = { registeredStudents };
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
 * @param {*} enrolledObject
 * @param {*} enrolledObject
 * not enrolled students
 */
const calculateNotEnrolledStudents = function (
  enrolledObject,
  registeredObject
) {
  let enrolledStudents = [];

  if (isEmpty(enrolledObject.enrolledStudents)) {
    enrolledStudents = [
      {
        total_number_students: 0,
        total_number_enrolled_students: 0,
        number_not_enrolled_students: 0,
        total_number_fully_registered_students: 0,
        total_number_registered_students: 0,
        total_number_provisionally_registered_students: 0,
        total_number_unregistered_students: 0,
      },
    ];

    return { enrolledStudents };
  }

  const numberNotEnrolledStudents = enrolledObject.enrolledStudents.map(
    (enrolledStudent) => {
      const { total_number_students } = enrolledStudent;
      const number_not_enrolled_students =
        enrolledStudent.total_number_students -
        enrolledStudent.total_number_enrolled_students;

      if (isEmpty(registeredObject.registeredStudents)) {
        return {
          ...enrolledStudent,
          number_not_enrolled_students,
          total_number_fully_registered_students: 0,
          total_number_registered_students: 0,
          total_number_provisionally_registered_students: 0,
          total_number_unregistered_students:
            enrolledStudent.total_number_enrolled_students,
        };
      } else {
        const provisionalRegistrationStudent =
          registeredObject.registeredStudents.find(
            (row) => row.registration_type === 'PROVISIONAL REGISTRATION'
          );
        const fullRegistrationStudent =
          registeredObject.registeredStudents.find(
            (row) => row.registration_type === 'FULL REGISTRATION'
          );

        const total_number_provisionally_registered_students =
          provisionalRegistrationStudent
            ? provisionalRegistrationStudent.number_registered_students
            : 0;

        const total_number_fully_registered_students = fullRegistrationStudent
          ? fullRegistrationStudent.number_registered_students
          : 0;

        const number_registered =
          parseInt(total_number_provisionally_registered_students, 10) +
          parseInt(total_number_fully_registered_students, 10);

        const total_number_unregistered =
          enrolledStudent.total_number_enrolled_students - number_registered;

        return {
          ...enrolledStudent,
          number_not_enrolled_students,
          total_number_students: parseInt(total_number_students, 10),
          total_number_enrolled_students: parseInt(
            enrolledStudent.total_number_enrolled_students,
            10
          ),
          number_registered,
          total_number_fully_registered_students: parseInt(
            total_number_fully_registered_students,
            10
          ),
          total_number_provisionally_registered_students: parseInt(
            total_number_provisionally_registered_students,
            10
          ),
          total_number_unregistered_students: total_number_unregistered,
        };
      }
    }
  );

  return { enrolledStudents: numberNotEnrolledStudents };
};

module.exports = ReportsEnrollmentRegistrationController;
