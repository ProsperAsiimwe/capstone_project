const { HttpResponse } = require('@helpers');
const {
  paymentReportsStudentsService,
  institutionStructureService,
  programmeService,
  metadataValueService,
} = require('@services/index');

const { paymentProgColumns } = require('./templateTransactions');
const { isEmpty, now, map, upperCase, toUpper } = require('lodash');
const excelJs = require('exceljs');
const fs = require('fs');
const http = new HttpResponse();

class paymentTransactionReportsStudentsController {
  /**
   * student transaction data.
   * @param {*} req
   * @param {*} res
   */
  async paymentTransactionsStudentData(req, res) {
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

      const context = req.query;
      const studentsData = await paymentTransactionsStudents(context);

      const manualData = await paymentTransactionsStudentsManualInvoices(
        context
      );

      // mergeStudentsRecordsFunction
      const data = mergeStudentsRecordsFunction(studentsData, manualData);

      // studentPaymentTransactionsData
      http.setSuccess(
        200,
        'Student Payment Transactions Records fetched successfully ',
        {
          data,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable To Fetch Student Payment Transactions Records',
        {
          error: { message: error.message },
        }
      );

      return http.send(res);
    }
  }

  // DOWNLOAD DATA

  async StudentsPaymentDataDownload(req, res) {
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

      const { user } = req;

      const context = req.body;

      // find campus
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

      // const faculty = await programmeService.findOneProgramme({
      //   where: { id: req.body.programme_id },
      //   attributes: ['id', 'programme_code', 'programme_title'],
      //   include: [
      //     {
      //       association: 'department',
      //       attributes: ['department_title', 'department_code'],
      //       include: [
      //         {
      //           association: 'faculty',
      //           attributes: ['faculty_title', 'faculty_code'],
      //         },
      //       ],
      //     },
      //   ],...
      // });

      // const department = faculty.dataValues.department;

      // const facultyData = department.dataValues.faculty.dataValues;

      const studentsData = await paymentTransactionsStudents(context);

      const manualData = await paymentTransactionsStudentsManualInvoices(
        context
      );

      // mergeStudentsRecordsFunction
      const result = mergeStudentsRecordsFunction(studentsData, manualData);

      if (isEmpty(result)) {
        throw new Error(`No PAYMENT AND TRANSACTIONS Records`);
      }

      const studentsPayments = [];

      result.studentTransactions.forEach((element) => {
        let manualInvoiceAmount = 0;

        let manualInvoiceAmountPaid = 0;

        let manualInvoiceAmountDue = 0;
        //

        let arrearsInvoiceAmount = 0;

        let arrearsAmountPaid = 0;

        let arrearsAmountDue = 0;

        if (element.manual_invoices) {
          manualInvoiceAmount =
            element.manual_invoices.manual_invoices_invoice_amount;
          manualInvoiceAmountPaid =
            element.manual_invoices.manual_invoices_amount_paid;

          manualInvoiceAmountDue =
            element.manual_invoices.manual_invoices_amount_due;

          // arrears
          arrearsInvoiceAmount = element.manual_invoices.arrears_invoice_amount;
          arrearsAmountPaid = element.manual_invoices.arrears_amount_paid;
          arrearsAmountDue = element.manual_invoices.arrears_amount_due;
        } else {
          manualInvoiceAmount = element.manual_invoices_invoice_amount;
          manualInvoiceAmountPaid = element.manual_invoices_amount_paid;
          manualInvoiceAmountDue = element.manual_invoices_amount_due;

          arrearsInvoiceAmount = element.arrears_invoice_amount;
          arrearsAmountPaid = element.arrears_amount_paid;
          arrearsAmountDue = element.arrears_amount_due;
        }

        const totalAmountInvoiced =
          Number(element.tuition_invoice_amount) +
          Number(element.functional_fees_invoice_amount) +
          Number(element.other_fees_invoice_amount) +
          Number(arrearsInvoiceAmount) +
          Number(manualInvoiceAmount);

        const totalAmountPaid =
          element.tuition_amount_paid +
          element.functional_fees_amount_paid +
          element.other_fees_amount_paid +
          Number(arrearsAmountPaid) +
          Number(manualInvoiceAmountPaid);

        const totalAmountDue =
          element.tuition_amount_due +
          element.functional_fees_amount_due +
          element.other_fees_amount_due +
          Number(arrearsAmountDue) +
          Number(manualInvoiceAmountDue);

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

        studentsPayments.push(elementData);
      });

      const data = { studentsPayments };

      if (isEmpty(data.studentsPayments)) {
        throw new Error('No Payments Report Data');
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
      const rootSheet = workbook.addWorksheet('REPORT');

      rootSheet.mergeCells('C1', 'O3');
      rootSheet.mergeCells('A1', 'B2');
      const titleCell = rootSheet.getCell('C1');

      rootSheet.getRow(1).height = 190;

      titleCell.value = `${
        upperCase(institutionStructure.institution_name) || 'TERP'
      }\nOFFICE OF THE BURSAR
      STUDENTS' PAYMENTS AND TRANSACTIONS REPORT \n
     ${programmeAcademicUnit.structure}: ${
        programmeAcademicUnit.academicUnitData.academic_unit_title
      }(${
        programmeAcademicUnit.academicUnitData.academic_unit_code
      })\n PROGRAMME: ${studentsPayments[0].programme_title}- (${
        studentsPayments[0].programme_code
      }) \n Academic Year: ${
        data.studentsPayments[0].academic_year
      }\n Semester: ${
        data.studentsPayments[0].semester
      } / Campus: ${campus} \n Intake: ${
        data.studentsPayments[0].intake
      }  / Study Year: ${data.studentsPayments[0].programme_study_years}

      `;

      titleCell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
      };

      titleCell.font = { bold: true, size: 15, name: 'Arial' };

      const headerRow = rootSheet.getRow(3);

      headerRow.values = map(paymentProgColumns, 'header');
      headerRow.font = { bold: true, size: 12, color: '#2c3e50' };
      rootSheet.columns = paymentProgColumns.map((column) => {
        delete column.header;

        return column;
      });
      rootSheet.getRow(3).height = 60;

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

      if (!isEmpty(data.studentsPayments)) {
        data.studentsPayments.forEach((element) => {
          let manualInvoiceAmount = 0;

          let manualInvoiceAmountPaid = 0;

          let manualInvoiceAmountDue = 0;

          let arrearsInvoiceAmount = 0;

          let arrearsAmountPaid = 0;

          let arrearsAmountDue = 0;

          if (element.manual_invoices) {
            manualInvoiceAmount =
              element.manual_invoices.manual_invoices_invoice_amount;
            manualInvoiceAmountPaid =
              element.manual_invoices.manual_invoices_amount_paid;

            manualInvoiceAmountDue =
              element.manual_invoices.manual_invoices_amount_due;

            arrearsInvoiceAmount =
              element.manual_invoices.arrears_invoice_amount;
            arrearsAmountPaid = element.manual_invoices.arrears_amount_paid;
            arrearsAmountDue = element.manual_invoices.arrears_amount_due;
          } else {
            manualInvoiceAmount = element.manual_invoices_invoice_amount;
            manualInvoiceAmountPaid = element.manual_invoices_amount_paid;
            manualInvoiceAmountDue = element.manual_invoices_amount_due;

            arrearsInvoiceAmount = element.arrears_invoice_amount;
            arrearsAmountPaid = element.arrears_amount_paid;
            arrearsAmountDue = element.arrears_amount_due;
          }

          templateData.push([
            element.surname,
            element.other_names,
            element.nationality,
            element.gender,
            element.programme_code,
            element.programme_title,
            element.enrollment_status,
            element.student_number,
            element.registration_number,
            element.campus,
            element.programme_type,
            element.programme_study_years,
            arrearsInvoiceAmount,
            arrearsAmountPaid,
            arrearsAmountDue,
            element.tuition_invoice_amount,
            element.tuition_amount_paid,
            element.tuition_amount_due,
            element.functional_fees_invoice_amount,
            element.functional_fees_amount_paid,
            element.functional_fees_amount_due,
            element.other_fees_invoice_amount,
            element.other_fees_amount_paid,
            element.other_fees_amount_due,
            manualInvoiceAmount,
            manualInvoiceAmountPaid,
            manualInvoiceAmountDue,

            element.is_enrolled,
            element.enrollment_condition,
            element.is_registered,

            upperCase(element.registration_type),
            element.provisional_registration_type,
            element.registration_condition,

            element.totalAmountInvoiced,
            element.totalAmountPaid,
            `${parseInt(element.totalAmountDue, 10).toLocaleString()} ${'UGX'}`,
            element.percentCompletion,
            element.sponsorship,
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

      const template = `${uploadPath}/download-transactions-${user.surname}-${
        user.other_names
      }-${user.id}-${now()}.xlsm`;

      await workbook.xlsx.writeFile(template);
      await res.download(
        template,
        `PAYMENT TRANSACTIONS REPORT.xlsx`,
        (error) => {
          if (error) {
            throw new Error(error.message);
          }
        }
      );
    } catch (error) {
      http.setError(400, 'Unable To Fetch PAYMENT TRANSACTIONS Report', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

// DOWNLOAD

/**
 *
 * PAYMENT transactions
 */
const paymentTransactionsStudents = async function (data) {
  try {
    let result = {};

    let studentTransactions = [];
    const context = data;

    if (context.campus_id !== 'all' && context.programme_type_id === 'all') {
      studentTransactions =
        await paymentReportsStudentsService.studentsByCampus(context);

      result = { studentTransactions };
    } else if (
      context.campus_id !== 'all' &&
      context.programme_type_id !== 'all'
    ) {
      studentTransactions =
        await paymentReportsStudentsService.studentsByCampusProgrammeType(
          context
        );

      result = { studentTransactions };
    } else if (
      context.campus_id === 'all' &&
      context.programme_type_id === 'all'
    ) {
      studentTransactions =
        await paymentReportsStudentsService.studentsAllCampuses(context);

      result = { studentTransactions };
    } else if (
      context.campus_id === 'all' &&
      context.programme_type_id !== 'all'
    ) {
      studentTransactions =
        await paymentReportsStudentsService.studentsAllCampusesProgrammeTypes(
          context
        );

      result = { studentTransactions };
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
 * manual invoices data
 *
 */
const paymentTransactionsStudentsManualInvoices = async function (data) {
  try {
    let result = {};
    const context = data;

    if (context.campus_id !== 'all' && context.programme_type_id === 'all') {
      const studentsManualInovices =
        await paymentReportsStudentsService.studentsManualByCampuses(context);

      result = { studentsManualInovices };
    } else if (
      context.campus_id !== 'all' &&
      context.programme_type_id !== 'all'
    ) {
      const studentsManualInovices =
        await paymentReportsStudentsService.studentsManualByCampusesProgrammeTypes(
          context
        );

      result = { studentsManualInovices };
    } else if (
      context.campus_id === 'all' &&
      context.programme_type_id === 'all'
    ) {
      const studentsManualInovices =
        await paymentReportsStudentsService.studentsManualAllCampuses(context);

      result = { studentsManualInovices };
    } else if (
      context.campus_id === 'all' &&
      context.programme_type_id !== 'all'
    ) {
      const studentsManualInovices =
        await paymentReportsStudentsService.studentsManualAllCampusesProgrammeTypes(
          context
        );

      result = { studentsManualInovices };
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
const mergeStudentsRecordsFunction = function (
  tuitionFunctionInvoicesObject,
  manualInvoicesObject
) {
  const unmatchedManualContext = [];

  manualInvoicesObject.studentsManualInovices.forEach((manualInvoice) => {
    const findContextInAuto =
      tuitionFunctionInvoicesObject.studentTransactions.find(
        (invoice) =>
          manualInvoice.semester_id === invoice.semester_id &&
          manualInvoice.study_year_id === invoice.study_year_id &&
          manualInvoice.programme_id === invoice.programme_id &&
          manualInvoice.programme_type_id === invoice.programme_type_id &&
          manualInvoice.student_number === invoice.student_number
      );

    if (!findContextInAuto) {
      unmatchedManualContext.push({
        ...manualInvoice,
        other_fees_invoice_amount: 0,
        tuition_invoice_amount: 0,
        functional_fees_invoice_amount: 0,
        tuition_amount_paid: 0,
        functional_fees_amount_paid: 0,
        other_fees_amount_paid: 0,
        tuition_amount_due: 0,
        functional_fees_amount_due: 0,
        other_fees_amount_due: 0,
        studentTransactions: [],
      });
    }
  });

  const newStudentsRecordsPaymentTransactions =
    tuitionFunctionInvoicesObject.studentTransactions.map((invoice) => {
      const findManualInvoice =
        manualInvoicesObject.studentsManualInovices.find(
          (context) =>
            context.study_year_id === invoice.study_year_id &&
            context.campus_id === invoice.campus_id &&
            context.programme_id === invoice.programme_id &&
            context.programme_type_id === invoice.programme_type_id &&
            context.student_number === invoice.student_number
        );

      // return {
      //   ...invoice,
      //   manual_invoices: findManualInvoice
      //     ? findManualInvoice.manual_invoices
      //     : [],
      // };

      return {
        ...invoice,
        manual_invoices: findManualInvoice || {
          manual_invoices_invoice_amount: 0,
          manual_invoices_amount_paid: 0,
          manual_invoices_amount_due: 0,
          arrears_invoice_amount: 0,
          arrears_amount_due: 0,
          arrears_amount_paid: 0,
        },
      };
    });

  const studentTransactions = newStudentsRecordsPaymentTransactions.concat(
    unmatchedManualContext
  );

  return {
    studentTransactions,
  };
};

module.exports = paymentTransactionReportsStudentsController;
