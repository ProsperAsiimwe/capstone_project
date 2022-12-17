// enrollmentByFacultyAllTypes
const { HttpResponse } = require('@helpers');
const {
  detailedReportStudentsService,
  facultyService,
  institutionStructureService,
} = require('@services/index');
const { isEmpty, now, map, upperCase, countBy, toUpper } = require('lodash');
const excelJs = require('exceljs');
const fs = require('fs');
const {
  enrollmentFacultyColumns,
  enrollmentReportColumns,
} = require('./templateColumnsFaculty');

const http = new HttpResponse();

class DetailedReportsDownloadsController {
  async detailedReportsDownLoad(req, res) {
    try {
      if (
        !req.body.campus_id ||
        !req.body.academic_year_id ||
        !req.body.intake_id ||
        !req.body.semester_id ||
        !req.body.programme_type_id ||
        !req.body.academic_unit_id
      ) {
        throw new Error('Invalid Context Provided');
      }

      const { user } = req;

      const result = await enrollmentDownload(req);

      const numberRegistered = map(result, 'is_registered').filter(
        (element) => element === true
      ).length;

      const numberNotRegistered = map(result, 'is_registered').filter(
        (element) => element === false
      ).length;

      const numberEnrolled = map(result, 'is_enrolled').filter(
        (element) => element === true
      ).length;

      const numberFullyRegistered = map(result, 'registration_type').filter(
        (element) => element === 'FULL REGISTRATION'
      ).length;

      const numberProvisionallyRegistered = map(
        result,
        'registration_type'
      ).filter((element) => element === 'PROVISIONAL REGISTRATION').length;

      const arrayOfGender = map(result, 'gender');

      const genderData = countBy(
        arrayOfGender.map((gender) => {
          if (toUpper(gender).includes('F')) return 'Female';
          else return 'Male';
        })
      );

      if (isEmpty(result)) {
        throw new Error(`No Enrollment And Registration Records`);
      }

      const enrolledStudents = [];

      result.forEach((element) => {
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

      const institutionStructure =
        await institutionStructureService.findInstitutionStructureRecords({
          attributes: ['institution_name', 'institution_logo'],
        });

      if (!institutionStructure) {
        throw new Error('Unable To Find Institution Structure.');
      }

      const workbook = new excelJs.Workbook();
      const rootSheet = workbook.addWorksheet('ENROLLMENT');

      rootSheet.mergeCells('A1', 'AF1');
      // rootSheet.mergeCells('A1', 'B2');
      const titleCell = rootSheet.getCell('A1');

      rootSheet.getRow(1).height = 40;

      titleCell.value = `${
        toUpper(institutionStructure.institution_name) || 'TERP'
      } || ENROLLMENT AND REGISTRATION REPORT FOR: ${
        data.enrolledStudents[0].semester
      } ->INTAKE: ${data.enrolledStudents[0].intake} (${
        data.enrolledStudents[0].academic_year
      })`;

      titleCell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
      };

      titleCell.font = {
        bold: true,
        size: 20,
        name: 'Arial',
        color: { argb: '87CEEB' },
      };

      const a2Value = rootSheet.getCell('A2');
      a2Value.value = 'STUDENTS ENROLLED';
      const a3Value = rootSheet.getCell('A3');
      a3Value.value = numberEnrolled;

      const b2Value = rootSheet.getCell('B2');
      b2Value.value = 'STUDENTS REGISTERED';
      const b3Value = rootSheet.getCell('B3');
      b3Value.value = numberRegistered;

      const c2Value = rootSheet.getCell('C2');
      c2Value.value = 'STUDENTS NOT REGISTERED';
      const c3Value = rootSheet.getCell('C3');
      c3Value.value = numberNotRegistered;

      const d2Value = rootSheet.getCell('D2');
      d2Value.value = 'FULLY REGISTERED';
      const d3Value = rootSheet.getCell('D3');
      d3Value.value = numberFullyRegistered;

      const e2Value = rootSheet.getCell('E2');
      e2Value.value = 'PROV REGISTERED';
      const e3Value = rootSheet.getCell('E3');
      e3Value.value = numberProvisionallyRegistered;

      const f2Value = rootSheet.getCell('F2');
      f2Value.value = 'MALE STUDENTS ENROLLED';
      const f3Value = rootSheet.getCell('F3');
      f3Value.value = genderData.Male;

      const g2Value = rootSheet.getCell('G2');
      g2Value.value = 'FEMALE STUDENTS ENROLLED';
      const g3Value = rootSheet.getCell('G3');
      g3Value.value = genderData.Female;

      const headerRow = rootSheet.getRow(5);

      headerRow.values = map(enrollmentReportColumns, 'header');
      headerRow.font = { bold: true, size: 11, color: '#2c3e50' };
      rootSheet.columns = enrollmentReportColumns.map((column) => {
        delete column.header;

        return column;
      });
      rootSheet.getRow(2).height = 40;
      rootSheet.getRow(3).height = 30;

      rootSheet.views = [
        {
          state: 'frozen',
          xSplit: 0,
          ySplit: 5,
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
            element.sponsorship,
            element.campus,
            element.programme_code,
            element.programme_type,
            element.programme_study_years,
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
            element.fees_waiver,
            element.sponsor_name,
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

      const template = `${uploadPath}/download-faculty-${user.surname}-${
        user.other_names
      }-${user.id}-${now()}.xlsm`;

      await workbook.xlsx.writeFile(template);
      await res.download(template, `ENROLLMENT REPORT.xlsx`, (error) => {
        if (error) {
          throw new Error(error.message);
        }
      });
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

  // registeredStudentsDownload

  async registeredStudentsDownload(req, res) {
    try {
      if (
        !req.body.campus_id ||
        !req.body.academic_year_id ||
        !req.body.intake_id ||
        !req.body.semester_id
      ) {
        throw new Error('Invalid Context Provided');
      }

      const { user } = req;

      const context = req.body;

      const result =
        await detailedReportStudentsService.registeredStudentsDownload(context);

      if (isEmpty(result)) {
        throw new Error(`No Enrollment And Registration Records`);
      }

      const enrolledStudents = [];

      result.forEach((element) => {
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

      const institutionStructure =
        await institutionStructureService.findInstitutionStructureRecords({
          attributes: ['institution_name', 'institution_logo'],
        });

      if (!institutionStructure) {
        throw new Error('Unable To Find Institution Structure.');
      }

      const workbook = new excelJs.Workbook();
      const rootSheet = workbook.addWorksheet('ENROLLMENT');

      rootSheet.mergeCells('C1', 'O3');
      rootSheet.mergeCells('A1', 'B2');
      const titleCell = rootSheet.getCell('C1');

      rootSheet.getRow(1).height = 74;

      titleCell.value = `${
        institutionStructure.institution_name || 'TERP'
      } \n ENROLLMENT AND REGISTRATION REPORT \nACADEMIC YEAR ${
        data.enrolledStudents[0].academic_year
      } \nSEMESTER: ${data.enrolledStudents[0].semester}\nINTAKE: ${
        data.enrolledStudents[0].intake
      }\nREGISTERED STUDENTS: COMPLETED TUITION AND FUNCTIONAL FEES PAYMENTS

      `;

      titleCell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
      };

      titleCell.font = { bold: true, size: 8, name: 'Arial' };

      const headerRow = rootSheet.getRow(3);

      headerRow.values = map(enrollmentReportColumns, 'header');
      headerRow.font = { bold: true, size: 11, color: '#2c3e50' };
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
            element.sponsorship,
            element.campus,
            element.programme_code,
            element.programme_type,
            element.programme_study_years,
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
            element.fees_waiver,
            element.sponsor_name,
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

      const template = `${uploadPath}/download-faculty-${user.surname}-${
        user.other_names
      }-${user.id}-${now()}.xlsm`;

      await workbook.xlsx.writeFile(template);
      await res.download(template, `ENROLLMENT REGISTRATION.xlsx`, (error) => {
        if (error) {
          throw new Error(error.message);
        }
      });
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

  //  unregisteredStudentsDownload
  async unregisteredStudentsDownload(req, res) {
    try {
      if (
        !req.body.campus_id ||
        !req.body.academic_year_id ||
        !req.body.intake_id ||
        !req.body.semester_id
      ) {
        throw new Error('Invalid Context Provided');
      }

      const { user } = req;

      const context = req.body;

      const result =
        await detailedReportStudentsService.unregisteredStudentsDownload(
          context
        );

      if (isEmpty(result)) {
        throw new Error(`No Enrollment And Registration Records`);
      }

      const enrolledStudents = [];

      result.forEach((element) => {
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

      const institutionStructure =
        await institutionStructureService.findInstitutionStructureRecords({
          attributes: ['institution_name', 'institution_logo'],
        });

      if (!institutionStructure) {
        throw new Error('Unable To Find Institution Structure.');
      }

      const workbook = new excelJs.Workbook();
      const rootSheet = workbook.addWorksheet('ENROLLMENT');

      rootSheet.mergeCells('C1', 'O3');
      rootSheet.mergeCells('A1', 'B2');
      const titleCell = rootSheet.getCell('C1');

      rootSheet.getRow(1).height = 74;

      titleCell.value = `${
        institutionStructure.institution_name || 'TERP'
      } \n ENROLLMENT AND REGISTRATION REPORT \nACADEMIC YEAR ${
        data.enrolledStudents[0].academic_year
      } \nSEMESTER: ${data.enrolledStudents[0].semester}\nINTAKE: ${
        data.enrolledStudents[0].intake
      }\nUNREGISTERED STUDENTS

      `;

      titleCell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
      };

      titleCell.font = { bold: true, size: 8, name: 'Arial' };

      const headerRow = rootSheet.getRow(3);

      headerRow.values = map(enrollmentReportColumns, 'header');
      headerRow.font = { bold: true, size: 11, color: '#2c3e50' };
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
            element.sponsorship,
            element.campus,
            element.programme_code,
            element.programme_type,
            element.programme_study_years,
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
            element.fees_waiver,
            element.sponsor_name,
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

      const template = `${uploadPath}/download-faculty-${user.surname}-${
        user.other_names
      }-${user.id}-${now()}.xlsm`;

      await workbook.xlsx.writeFile(template);
      await res.download(template, `UNREGISTERED STUDENTS.xlsx`, (error) => {
        if (error) {
          throw new Error(error.message);
        }
      });
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

const enrollmentDownload = async function (req) {
  try {
    let result = {};
    const context = req.body;

    if (
      context.academic_unit_id !== 'all' &&
      context.campus_id === 'all' &&
      context.programme_type_id !== 'all'
    ) {
      result = await detailedReportStudentsService.studentEnrollmentByFaculty(
        context
      );
    } else if (
      context.academic_unit_id !== 'all' &&
      context.campus_id === 'all' &&
      context.programme_type_id === 'all'
    ) {
      result = await detailedReportStudentsService.enrollmentByFacultyAllTypes(
        context
      );
    } else if (
      context.academic_unit_id !== 'all' &&
      context.campus_id !== 'all' &&
      context.programme_type_id === 'all'
    ) {
      result = await detailedReportStudentsService.enrollmentByFacultyCampus(
        context
      );
    } else if (
      context.academic_unit_id !== 'all' &&
      context.campus_id !== 'all' &&
      context.programme_type_id !== 'all'
    ) {
      result =
        await detailedReportStudentsService.enrollmentByFacultyCampusTypes(
          context
        );
    } else {
      throw new Error('Invalid context provided');
    }

    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = DetailedReportsDownloadsController;
