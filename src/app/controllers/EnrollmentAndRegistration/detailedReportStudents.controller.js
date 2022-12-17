const { HttpResponse } = require('@helpers');
const {
  detailedReportStudentsService,
  programmeService,
  institutionStructureService,
} = require('@services/index');
const { isEmpty, toUpper, now, map, upperCase } = require('lodash');
const excelJs = require('exceljs');
const fs = require('fs');

const { enrollmentReportColumns } = require('./templateColumns');

const http = new HttpResponse();

class DetailedReportStudentsController {
  /**
   * fees preview controller
   * @param {*} req
   * @param {*} res
   */
  async detailedReportStudentsFunction(req, res) {
    try {
      if (
        !req.query.campus_id ||
        !req.query.academic_year_id ||
        !req.query.intake_id ||
        !req.query.semester_id ||
        !req.query.programme_type_id ||
        !req.query.programme_id ||
        !req.query.study_year_id
      ) {
        throw new Error('Invalid Context Provided');
      }

      const data = await enrollmentRegistrationStudents(req);

      const enrolledStudents = [];

      data.enrolledStudents.forEach((element) => {
        const totalAmountInvoiced =
          element.tuition_invoice_amount +
          element.functional_fees_invoice_amount +
          element.other_fees_invoice_amount;

        const totalAmountPaid =
          element.tuition_amount_paid +
          element.functional_fees_amount_paid +
          element.other_fees_amount_paid;

        const totalAmountDue =
          element.tuition_amount_due +
          element.functional_fees_amount_due +
          element.other_fees_amount_due;

        const percentCompletion = (
          (totalAmountPaid / totalAmountInvoiced) *
          100
        ).toFixed(2);

        const elementData = {
          ...element,
          totalAmountInvoiced,
          totalAmountPaid,
          totalAmountDue,
          percentCompletion: percentCompletion + ' ' + '%',
        };

        enrolledStudents.push(elementData);
      });

      const studentEnrollmentData = { enrolledStudents };

      http.setSuccess(
        200,
        'Enrollment and registration detailed report fetched successfully ',
        {
          studentEnrollmentData,
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

  // bulky print

  async examCardCourse(req, res) {
    try {
      if (!req.body.registration) {
        throw new Error('Invalid Context Provided');
      }

      const context = req.body.registration;

      const data =
        await detailedReportStudentsService.examCardRegistrationCourses(
          context
        );

      http.setSuccess(200, 'Exam Card Courses fetched successfully ', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Bulky Exam Course', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  // download enrollment report
  async detailedReportDownLoad(req, res) {
    try {
      if (
        !req.body.campus_id ||
        !req.body.academic_year_id ||
        !req.body.intake_id ||
        !req.body.semester_id ||
        !req.body.programme_type_id ||
        !req.body.programme_id ||
        !req.body.study_year_id
      ) {
        throw new Error('Invalid Context Provided');
      }

      const context = req.body;
      const { user } = req;

      const enrollmentData = await enrollmentRegistrationData(req);

      const enrolledStudents = [];

      enrollmentData.enrolledStudents.forEach((element) => {
        const totalAmountInvoiced =
          element.tuition_invoice_amount +
          element.functional_fees_invoice_amount +
          element.other_fees_invoice_amount;

        const totalAmountPaid =
          element.tuition_amount_paid +
          element.functional_fees_amount_paid +
          element.other_fees_amount_paid;

        const totalAmountDue =
          element.tuition_amount_due +
          element.functional_fees_amount_due +
          element.other_fees_amount_due;

        const percentCompletion = (
          (totalAmountPaid / totalAmountInvoiced) *
          100
        ).toFixed(2);

        const elementData = {
          ...element,
          totalAmountInvoiced,
          totalAmountPaid,
          totalAmountDue,
          percentCompletion: percentCompletion + ' ' + '%',
        };

        enrolledStudents.push(elementData);
      });

      const data = { enrolledStudents };

      if (isEmpty(data.enrolledStudents)) {
        throw new Error(`No Enrollment And Registration Records`);
      }

      let campus = '';

      if (req.body.campus_id === 'all') {
        campus = 'ALL CAMPUSES';
      } else {
        const id = req.body.campus_id;

        const metadata = await metadataValueService.findOneMetadataValue({
          where: { id },
        });

        campus = metadata.dataValues.metadata_value;
      }
      let academicUnits = [];

      const institutionStructure =
        await institutionStructureService.findInstitutionStructureRecords({
          attributes: [
            'institution_name',
            'institution_logo',
            'academic_units',
          ],
        });

      if (!institutionStructure) {
        throw new Error('Unable To Find Institution Structure.');
      }

      let programmeData = {};

      let academicUnitData = {};

      let structure = '';

      if (institutionStructure) {
        academicUnits = map(institutionStructure.academic_units, (unit) =>
          toUpper(unit)
        );
      }

      if (
        academicUnits.includes('COLLEGES') ||
        academicUnits.map((element) => element.includes('COL')).includes(true)
      ) {
        structure = 'COLLEGE';
        programmeData = await programmeService.findProgrammeAcademicUnits(
          context
        );

        academicUnitData = programmeData.colleges;
      } else if (
        academicUnits
          .map((element) => element.includes('FAC'))
          .includes(true) ||
        academicUnits
          .map((element) => element.includes('SCHOOL'))
          .includes(true)
      ) {
        structure = academicUnits.includes('FACULT') ? 'FACULTY' : 'SCHOOL';

        programmeData = await programmeService.findProgrammeAcademicUnits(
          context
        );

        academicUnitData = programmeData.faculties;
      } else {
        structure = 'DEPARTMENT';
        programmeData = await programmeService.findProgrammeAcademicUnits(
          context
        );

        academicUnitData = programmeData.departments;
      }
      const programmeAcademicUnit = { academicUnitData, structure };

      const workbook = new excelJs.Workbook();
      const rootSheet = workbook.addWorksheet(
        'ENROLLMENT AND REGISTRATION REPORT'
      );

      rootSheet.mergeCells('C1', 'O3');
      rootSheet.mergeCells('A1', 'B2');
      const titleCell = rootSheet.getCell('C1');

      rootSheet.getRow(1).height = 190;

      titleCell.value = `${
        institutionStructure.institution_name || 'TERP'
      } \n ENROLLMENT AND REGISTRATION REPORT\n    ${
        programmeAcademicUnit.structure
      }: ${programmeAcademicUnit.academicUnitData.academic_unit_title}(${
        programmeAcademicUnit.academicUnitData.academic_unit_code
      }) \nACADEMIC YEAR ${data.enrolledStudents[0].academic_year} \nSEMESTER ${
        data.enrolledStudents[0].semester
      }\nINTAKE ${data.enrolledStudents[0].intake}\n PROGRAMME: ${
        data.enrolledStudents[0].programme_title
      }(${data.enrolledStudents[0].programme_code})\nSTUDY YEAR: ${
        data.enrolledStudents[0].programme_study_years
      } 
      
      `;

      titleCell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
      };

      titleCell.font = { bold: true, size: 15, name: 'Arial' };

      const headerRow = rootSheet.getRow(3);

      headerRow.values = map(enrollmentReportColumns, 'header');
      headerRow.font = { bold: true, size: 12, color: '#2c3e50' };
      rootSheet.columns = enrollmentReportColumns.map((column) => {
        delete column.header;

        return column;
      });
      rootSheet.getRow(3).height = 40;

      rootSheet.views = [
        {
          state: 'frozen',
          xSplit: 0,
          ySplit: 3,
          topLeftCell: 'G10',
          activeCell: 'A1',
        },
      ];

      const templateData = [];

      if (!isEmpty(data.enrolledStudents)) {
        data.enrolledStudents.forEach((element) => {
          templateData.push([
            element.name,
            element.gender,
            element.student_number,
            element.registration_number,
            element.date_of_birth,
            element.district,
            element.nationality,
            element.campus,
            element.programme_type,
            element.is_enrolled,
            element.enrollment_token,
            element.enrollment_condition,
            upperCase(element.registration_type),
            element.registration_status,
            element.is_registered,
            element.provisional_registration_type,
            element.registration_condition,
            element.tuition_invoice_amount,
            element.tuition_amount_paid,
            element.tuition_amount_due,
            element.functional_fees_invoice_amount,
            element.functional_fees_amount_paid,
            element.functional_fees_amount_due,
            element.other_fees_invoice_amount,
            element.other_fees_amount_paid,
            element.other_fees_amount_due,
            element.totalAmountInvoiced,
            element.totalAmountPaid,
            `${parseInt(element.totalAmountDue, 10).toLocaleString()} ${'UGX'}`,
            element.percentCompletion,
          ]);
        });
      }

      rootSheet.addRows(templateData);

      const uploadPath = `${process.cwd()}/src/assets/documents/templates`;

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true }, (err) => {
          throw new Error(err.message);
        });
      }

      const template = `${uploadPath}/download-report-${user.surname}-${
        user.other_names
      }-${user.id}-${now()}.xlsm`;

      await workbook.xlsx.writeFile(template);
      await res.download(
        template,
        `ENROLLMENT REGISTRATION REPORT.xlsx`,
        (error) => {
          if (error) {
            throw new Error(error.message);
          }
        }
      );
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
 * EnrollmentAndRegistrationReportsService
 */
const enrollmentRegistrationStudents = async function (req) {
  try {
    let result = {};
    const context = req.query;

    if (context.campus_id !== 'all' && context.programme_type_id === 'all') {
      const enrolledStudents =
        await detailedReportStudentsService.enrolledStudentsByCampus(context);

      result = { enrolledStudents };
    } else if (
      context.campus_id !== 'all' &&
      context.programme_type_id !== 'all'
    ) {
      const enrolledStudents =
        await detailedReportStudentsService.enrolledStudentsByCampusProgrammeType(
          context
        );

      result = { enrolledStudents };
    } else if (
      context.campus_id === 'all' &&
      context.programme_type_id === 'all'
    ) {
      const enrolledStudents =
        await detailedReportStudentsService.enrolledStudentsAllCampuses(
          context
        );

      result = { enrolledStudents };
    } else if (
      context.campus_id === 'all' &&
      context.programme_type_id !== 'all'
    ) {
      const enrolledStudents =
        await detailedReportStudentsService.enrolledStudentsAllCampusesProgrammeTypes(
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

//

const enrollmentRegistrationData = async function (req) {
  try {
    let result = {};
    const context = req.body;

    if (context.campus_id !== 'all' && context.programme_type_id === 'all') {
      const enrolledStudents =
        await detailedReportStudentsService.enrolledStudentsByCampus(context);

      result = { enrolledStudents };
    } else if (
      context.campus_id !== 'all' &&
      context.programme_type_id !== 'all'
    ) {
      const enrolledStudents =
        await detailedReportStudentsService.enrolledStudentsByCampusProgrammeType(
          context
        );

      result = { enrolledStudents };
    } else if (
      context.campus_id === 'all' &&
      context.programme_type_id === 'all'
    ) {
      const enrolledStudents =
        await detailedReportStudentsService.enrolledStudentsAllCampuses(
          context
        );

      result = { enrolledStudents };
    } else if (
      context.campus_id === 'all' &&
      context.programme_type_id !== 'all'
    ) {
      const enrolledStudents =
        await detailedReportStudentsService.enrolledStudentsAllCampusesProgrammeTypes(
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

module.exports = DetailedReportStudentsController;
