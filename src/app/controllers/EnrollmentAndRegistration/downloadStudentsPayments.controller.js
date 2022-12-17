const { HttpResponse } = require('@helpers');
const moment = require('moment');

const {
  paymentReportsStudentsService,
  institutionStructureService,
  metadataValueService,
  academicYearService,
} = require('@services/index');

const { paymentTransactionsColumns } = require('./templateTransactions');
const {
  isEmpty,
  now,
  map,
  upperCase,
  toUpper,
  filter,
  isArray,
} = require('lodash');
const excelJs = require('exceljs');
const fs = require('fs');
const {
  getMetadataValueName,
} = require('@controllers/Helpers/programmeHelper');
const http = new HttpResponse();

class DownloadStudentsPaymentController {
  // DOWNLOAD DATA

  async downloadStudentPayments(req, res) {
    try {
      if (
        !req.body.campus_id ||
        !req.body.academic_year_id ||
        !req.body.intake_id ||
        !req.body.semester_id ||
        !req.body.programme_type_id
      ) {
        throw new Error('Invalid Context Provided');
      }

      const { user } = req;

      const context = req.body;

      const metadataValues = await metadataValueService.findAllMetadataValues({
        include: {
          association: 'metadata',
          attributes: ['id', 'metadata_name'],
        },
        attributes: ['id', 'metadata_value', 'metadata_id'],
      });

      const findAcademicYear = await academicYearService.findOneAcademicYear({
        where: { id: context.academic_year_id },
        include: ['academicYear'],
        raw: true,
        nest: true,
      });

      if (!findAcademicYear) throw new Error('Wrong Academic Year Provided');

      // find campus
      let campusName = context.campus_id;

      if (toUpper(campusName) !== 'ALL') {
        const findCampusName = getMetadataValueName(
          metadataValues,
          context.campus_id,
          'CAMPUSES'
        );

        campusName = findCampusName ? findCampusName.metadata_value : null;
      }

      const academicYear = findAcademicYear.academicYear.metadata_value;

      const intake = getMetadataValueName(
        metadataValues,
        context.intake_id,
        'INTAKES'
      );

      const semester = getMetadataValueName(
        metadataValues,
        context.semester_id,
        'SEMESTERS'
      );

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

      const workbook = new excelJs.Workbook();
      const rootSheet = workbook.addWorksheet('PAYMENT REPORT');

      rootSheet.mergeCells('C1', 'O3');
      rootSheet.mergeCells('A1', 'B2');
      const titleCell = rootSheet.getCell('C1');

      rootSheet.getRow(1).height = 100;

      titleCell.value = `${
        upperCase(institutionStructure.institution_name) || 'TERP'
      }\nOFFICE OF THE BURSAR
      STUDENTS' PAYMENTS AND TRANSACTIONS REPORT \nFOR: ${academicYear} - ${semester}\n${
        toUpper(campusName) === 'ALL' ? 'ALL CAMPUSES' : campusName
      } (${intake}-INTAKE )
      `;

      titleCell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
      };

      titleCell.font = { bold: true, size: 15, name: 'Arial' };

      const headerRow = rootSheet.getRow(3);

      headerRow.values = map(paymentTransactionsColumns, 'header');
      headerRow.font = { bold: true, size: 12, color: '#2c3e50' };
      rootSheet.columns = paymentTransactionsColumns.map((column) => {
        delete column.header;

        return column;
      });
      rootSheet.getRow(3).height = 30;

      const generatedAt = moment(moment.now()).format('Do MMM, YYYY');

      rootSheet.getCell('A1').value = `DATE GENERATED: ${generatedAt}`;
      rootSheet.getCell('A1').font = { bold: true, size: 20, name: 'Arial' };

      rootSheet.views = [
        {
          state: 'frozen',
          xSplit: 0,
          ySplit: 3,
          topLeftCell: 'G10',
          activeCell: 'A1',
        },
      ];

      let templateData = [];

      if (toUpper(campusName) !== 'ALL') {
        templateData = await handleCampusContextReport(context);
      } else if (
        toUpper(campusName) === 'ALL' &&
        context.academic_unit_id === 'all' &&
        context.programme_type_id === 'all'
      ) {
        templateData = await handleCampusContextReport(context);
      } else {
        const findAllCampuses = filter(
          metadataValues,
          (v) => toUpper(v.metadata.metadata_name) === 'CAMPUSES'
        );

        if (findAllCampuses && isArray(findAllCampuses)) {
          for (const campus of findAllCampuses) {
            const campusData = await handleCampusContextReport({
              ...context,
              campus_id: campus.id,
            });

            if (!isEmpty(campusData)) {
              templateData.push([campus.metadata_value]);
              templateData.push(...campusData);
              templateData.push([null]);
            }
          }
        }
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

const handleCampusContextReport = async (context) => {
  let studentsData = [];
  let manualData = [];
  // const studentsData = await paymentTransactionsStudents(context);

  // const manualData = await paymentTransactionsStudentsManualInvoices(context);

  if (
    context.academic_unit_id === 'all' &&
    context.programme_type_id === 'all' &&
    context.campus_id === 'all'
  ) {
    const filter = await allCampusData(context);
    studentsData = filter;
    manualData = filter;
  } else {
    studentsData = await paymentTransactionsStudents(context);

    manualData = await paymentTransactionsStudentsManualInvoices(context);
  }

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

    if (element.manual_invoices) {
      manualInvoiceAmount =
        element.manual_invoices.manual_invoices_invoice_amount;
      manualInvoiceAmountPaid =
        element.manual_invoices.manual_invoices_amount_paid;

      manualInvoiceAmountDue =
        element.manual_invoices.manual_invoices_amount_due;
    } else {
      manualInvoiceAmount = element.manual_invoices_invoice_amount;
      manualInvoiceAmountPaid = element.manual_invoices_amount_paid;
      manualInvoiceAmountDue = element.manual_invoices_amount_due;
    }

    const totalAmountInvoiced =
      Number(element.tuition_invoice_amount) +
      Number(element.functional_fees_invoice_amount) +
      Number(element.other_fees_invoice_amount) +
      Number(manualInvoiceAmount);

    const totalAmountPaid =
      element.tuition_amount_paid +
      element.functional_fees_amount_paid +
      element.other_fees_amount_paid +
      Number(manualInvoiceAmountPaid);

    const totalAmountDue =
      element.tuition_amount_due +
      element.functional_fees_amount_due +
      element.other_fees_amount_due +
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

  if (isEmpty(data.studentsPayments)) return [];

  const templateData = [];

  data.studentsPayments.forEach((element) => {
    let manualInvoiceAmount = 0;

    let manualInvoiceAmountPaid = 0;

    let manualInvoiceAmountDue = 0;

    // let arrearsInvoiceAmount = 0;

    // let arrearsAmountPaid = 0;

    // let arrearsAmountDue = 0;

    if (element.manual_invoices) {
      manualInvoiceAmount =
        element.manual_invoices.manual_invoices_invoice_amount;
      manualInvoiceAmountPaid =
        element.manual_invoices.manual_invoices_amount_paid;

      manualInvoiceAmountDue =
        element.manual_invoices.manual_invoices_amount_due;
      // arrears

      // arrearsInvoiceAmount = element.manual_invoices.arrears_invoice_amount;
      // arrearsAmountPaid = element.manual_invoices.arrears_amount_paid;
      // arrearsAmountDue = element.manual_invoices.arrears_amount_due;
    } else {
      manualInvoiceAmount = element.manual_invoices_invoice_amount;
      manualInvoiceAmountPaid = element.manual_invoices_amount_paid;
      manualInvoiceAmountDue = element.manual_invoices_amount_due;

      // arrearsInvoiceAmount = element.arrears_invoice_amount;
      // arrearsAmountPaid = element.arrears_amount_paid;
      // arrearsAmountDue = element.arrears_amount_due;
    }

    templateData.push([
      `${element.surname} ${element.other_names}`,
      element.nationality,
      element.gender,
      element.programme_code,
      element.programme_title,
      element.academic_unit_title,
      element.enrollment_status,
      element.student_number,
      element.registration_number,
      element.campus,
      element.programme_type,
      element.programme_study_years,
      element.arrears_invoice_amount,
      element.arrears_amount_paid,
      element.arrears_amount_due,
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

  return templateData;
};

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
        await paymentReportsStudentsService.downloadStudentsByCampus(context);

      result = { studentTransactions };
    } else if (
      context.campus_id !== 'all' &&
      context.programme_type_id !== 'all'
    ) {
      studentTransactions =
        await paymentReportsStudentsService.downloadByCampusProgrammeType(
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
      const studentsManualInvoices =
        await paymentReportsStudentsService.downloadManualByCampuses(context);

      result = { studentsManualInvoices };
    } else if (
      context.campus_id !== 'all' &&
      context.programme_type_id !== 'all'
    ) {
      const studentsManualInvoices =
        await paymentReportsStudentsService.downloadManualByCampusesProgrammeTypes(
          context
        );

      result = { studentsManualInvoices };
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

  manualInvoicesObject.studentsManualInvoices.forEach((manualInvoice) => {
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
        manualInvoicesObject.studentsManualInvoices.find(
          (context) =>
            context.study_year_id === invoice.study_year_id &&
            context.campus_id === invoice.campus_id &&
            context.programme_id === invoice.programme_id &&
            context.programme_type_id === invoice.programme_type_id &&
            context.student_number === invoice.student_number
        );

      return {
        ...invoice,
        manual_invoices: findManualInvoice || {
          manual_invoices_invoice_amount: 0,
          manual_invoices_amount_paid: 0,
          manual_invoices_amount_due: 0,
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

// data

const allCampusData = async function (data) {
  try {
    let result = {};

    const context = data;

    const studentTransactions =
      await paymentReportsStudentsService.studentPaymentsAllCampus(context);

    const studentsManualInvoices =
      await paymentReportsStudentsService.studentManualPaymentsAllCampus(
        context
      );
    result = { studentTransactions, studentsManualInvoices };

    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = DownloadStudentsPaymentController;
