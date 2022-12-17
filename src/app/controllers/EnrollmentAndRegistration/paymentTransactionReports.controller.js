const { HttpResponse } = require('@helpers');
const {
  paymentReportsService,
  institutionStructureService,
  paymentReportsByFacultyService,
  paymentReportsByDepartmentService,
} = require('@services/index');
const { sumBy, toUpper, map, forEach, flatten } = require('lodash');
const {
  facultyPaymentReport,
  collegePaymentReport,
  departmentPaymentReport,
} = require('../Helpers/enrollmentReportGroupingHelper');
const http = new HttpResponse();

class PaymentTransactionReportsController {
  /**
   * @param {*} req
   * @param {*} res
   *
   */
  async paymentTransactionsReports(req, res) {
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

      let tuitionFunctionAndOtherFees = [];

      let academicUnits = [];

      if (institutionStructure) {
        academicUnits = map(institutionStructure.academic_units, (unit) =>
          toUpper(unit)
        );
      }

      let manualInvoice = [];

      if (
        academicUnits.includes('COLLEGES') ||
        academicUnits.map((element) => element.includes('COL')).includes(true)
      ) {
        structure = 'Colleges';
        tuitionFunctionAndOtherFees = await tuitionFunctionalAndOtherFees(req);
        manualInvoice = await manualInvoicesTransactions(req);
      } else if (
        academicUnits
          .map((element) => element.includes('FAC'))
          .includes(true) ||
        academicUnits
          .map((element) => element.includes('SCHOOL'))
          .includes(true)
      ) {
        structure = academicUnits.includes('FACULT') ? 'Faculties' : 'Schools';

        tuitionFunctionAndOtherFees =
          await tuitionFunctionalAndOtherFeesByFaculty(req);
        manualInvoice = await manualInvoicesTransactionsByFaculty(req);
      } else {
        tuitionFunctionAndOtherFees =
          await tuitionFunctionalAndOtherFeesByDepartment(req);
        manualInvoice = await manualInvoicesTransactionsByDepartment(req);
      }
      const paymentTransactionsData = await calculatePaymentTransaction(
        tuitionFunctionAndOtherFees,
        manualInvoice,
        structure
      );

      http.setSuccess(
        200,
        'Payment Transactions report fetched successfully ',
        {
          paymentTransactionsData,
          structure,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Payment Transactions Report', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

/**
 *  COLLEGE STRUCTURE
 */
const tuitionFunctionalAndOtherFees = async function (req) {
  try {
    let result = {};
    const context = req.query;

    let paymentTransactions = [];

    if (
      context.academic_unit_id !== 'all' &&
      context.campus_id !== 'all' &&
      context.programme_type_id !== 'all'
    ) {
      paymentTransactions = await paymentReportsService.paymentReportByCollege(
        context
      );

      result = { paymentTransactions };
    } else if (
      context.academic_unit_id !== 'all' &&
      context.campus_id !== 'all' &&
      context.programme_type_id === 'all'
    ) {
      paymentTransactions =
        await paymentReportsService.paymentReportByCollegeAllProgrammeTypes(
          context
        );

      result = { paymentTransactions };
    } else if (
      context.academic_unit_id !== 'all' &&
      context.campus_id === 'all' &&
      context.programme_type_id !== 'all'
    ) {
      paymentTransactions =
        await paymentReportsService.paymentReportByCollegeCampuses(context);

      result = { paymentTransactions };
    } else if (
      context.academic_unit_id !== 'all' &&
      context.campus_id === 'all' &&
      context.programme_type_id === 'all'
    ) {
      paymentTransactions =
        await paymentReportsService.reportByCollegeAllCampusesProgrammeTypes(
          context
        );

      result = { paymentTransactions };

      // all colleges
    } else if (
      context.academic_unit_id === 'all' &&
      context.campus_id !== 'all' &&
      context.programme_type_id !== 'all'
    ) {
      paymentTransactions = await paymentReportsService.reportAllCollege(
        context
      );

      result = { paymentTransactions };
    } else if (
      context.academic_unit_id === 'all' &&
      context.campus_id !== 'all' &&
      context.programme_type_id === 'all'
    ) {
      paymentTransactions =
        await paymentReportsService.reportAllCollegeProgrammeTypes(context);

      result = { paymentTransactions };
    } else if (
      context.academic_unit_id === 'all' &&
      context.campus_id === 'all' &&
      context.programme_type_id !== 'all'
    ) {
      paymentTransactions =
        await paymentReportsService.reportAllCollegeCampuses(context);

      result = { paymentTransactions };
    } else if (
      context.academic_unit_id === 'all' &&
      context.campus_id === 'all' &&
      context.programme_type_id === 'all'
    ) {
      paymentTransactions =
        await paymentReportsService.reportaAllCollegeProgrammmeTypesCampuses(
          context
        );

      result = { paymentTransactions };
    } else {
      throw new Error('Invalid context provided');
    }

    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * manual invoices reports
 */
const manualInvoicesTransactions = async function (req) {
  try {
    let result = {};

    let manualInvoices = [];

    const context = req.query;

    if (
      context.academic_unit_id !== 'all' &&
      context.campus_id !== 'all' &&
      context.programme_type_id !== 'all'
    ) {
      manualInvoices = await paymentReportsService.paymentReportManualByCollege(
        context
      );

      result = { manualInvoices };
    } else if (
      context.academic_unit_id !== 'all' &&
      context.campus_id !== 'all' &&
      context.programme_type_id === 'all'
    ) {
      manualInvoices =
        await paymentReportsService.paymentReportManualByCollegeAllProgrammeTypes(
          context
        );

      result = { manualInvoices };
    } else if (
      context.academic_unit_id !== 'all' &&
      context.campus_id === 'all' &&
      context.programme_type_id !== 'all'
    ) {
      manualInvoices =
        await paymentReportsService.paymentReportManualByCollegeCampuses(
          context
        );

      result = { manualInvoices };
    } else if (
      context.academic_unit_id !== 'all' &&
      context.campus_id === 'all' &&
      context.programme_type_id === 'all'
    ) {
      manualInvoices =
        await paymentReportsService.reportManualByCollegeAllCampusesProgrammeTypes(
          context
        );

      result = { manualInvoices };
      // all college
    } else if (
      context.academic_unit_id === 'all' &&
      context.campus_id !== 'all' &&
      context.programme_type_id !== 'all'
    ) {
      manualInvoices = await paymentReportsService.manualReportAllCollege(
        context
      );

      result = { manualInvoices };
    } else if (
      context.academic_unit_id === 'all' &&
      context.campus_id !== 'all' &&
      context.programme_type_id === 'all'
    ) {
      manualInvoices =
        await paymentReportsService.manualReportAllCollegeProgrammeTypes(
          context
        );

      result = { manualInvoices };
    } else if (
      context.academic_unit_id === 'all' &&
      context.campus_id === 'all' &&
      context.programme_type_id !== 'all'
    ) {
      manualInvoices = await paymentReportsService.manualReportAllCollegeCampus(
        context
      );

      result = { manualInvoices };
    } else if (
      context.academic_unit_id === 'all' &&
      context.campus_id === 'all' &&
      context.programme_type_id === 'all'
    ) {
      manualInvoices =
        await paymentReportsService.manualReportAllCollegeProgrammeTypesCampus(
          context
        );

      result = { manualInvoices };
    } else {
      throw new Error('Invalid context provided');
    }

    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *  FACULTY STRUCTURE
 */
const tuitionFunctionalAndOtherFeesByFaculty = async function (req) {
  try {
    let result = {};
    const context = req.query;

    let paymentTransactions = [];

    if (
      context.academic_unit_id !== 'all' &&
      context.campus_id !== 'all' &&
      context.programme_type_id !== 'all'
    ) {
      paymentTransactions =
        await paymentReportsByFacultyService.paymentReportByFaculty(context);

      result = { paymentTransactions };
    } else if (
      context.academic_unit_id !== 'all' &&
      context.campus_id !== 'all' &&
      context.programme_type_id === 'all'
    ) {
      paymentTransactions =
        await paymentReportsByFacultyService.paymentReportByFacultyAllProgrammeTypes(
          context
        );

      result = { paymentTransactions };
    } else if (
      context.academic_unit_id !== 'all' &&
      context.campus_id === 'all' &&
      context.programme_type_id !== 'all'
    ) {
      paymentTransactions =
        await paymentReportsByFacultyService.paymentReportByFacultyAllCampuses(
          context
        );

      result = { paymentTransactions };
    } else if (
      context.academic_unit_id !== 'all' &&
      context.campus_id === 'all' &&
      context.programme_type_id === 'all'
    ) {
      paymentTransactions =
        await paymentReportsByFacultyService.paymentReportByFacultyAllCampusesProgrmmeTypes(
          context
        );

      result = { paymentTransactions };

      // all colleges ..
    } else if (
      context.academic_unit_id === 'all' &&
      context.campus_id !== 'all' &&
      context.programme_type_id !== 'all'
    ) {
      paymentTransactions =
        await paymentReportsByFacultyService.paymentReportAllFaculty(context);

      result = { paymentTransactions };
    } else if (
      context.academic_unit_id === 'all' &&
      context.campus_id !== 'all' &&
      context.programme_type_id === 'all'
    ) {
      paymentTransactions =
        await paymentReportsByFacultyService.paymentReportAllFacultyProgrammeType(
          context
        );

      result = { paymentTransactions };
    } else if (
      context.academic_unit_id === 'all' &&
      context.campus_id === 'all' &&
      context.programme_type_id !== 'all'
    ) {
      paymentTransactions =
        await paymentReportsByFacultyService.paymentReportAllFacultyCampuses(
          context
        );

      result = { paymentTransactions };
    } else if (
      context.academic_unit_id === 'all' &&
      context.campus_id === 'all' &&
      context.programme_type_id === 'all'
    ) {
      paymentTransactions =
        await paymentReportsByFacultyService.paymentReportAllFacultyProgrammmeTypesCampuses(
          context
        );

      result = { paymentTransactions };
    } else {
      throw new Error('Invalid context provided');
    }

    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};

// manual invoice reports
const manualInvoicesTransactionsByFaculty = async function (req) {
  try {
    let result = {};

    let manualInvoices = [];

    const context = req.query;

    if (
      context.academic_unit_id !== 'all' &&
      context.campus_id !== 'all' &&
      context.programme_type_id !== 'all'
    ) {
      manualInvoices =
        await paymentReportsByFacultyService.paymentReportManualByFaculty(
          context
        );

      result = { manualInvoices };
    } else if (
      context.academic_unit_id !== 'all' &&
      context.campus_id !== 'all' &&
      context.programme_type_id === 'all'
    ) {
      manualInvoices =
        await paymentReportsByFacultyService.paymentReportManualByFacultyAllProgrammeTypes(
          context
        );

      result = { manualInvoices };
    } else if (
      context.academic_unit_id !== 'all' &&
      context.campus_id === 'all' &&
      context.programme_type_id !== 'all'
    ) {
      manualInvoices =
        await paymentReportsByFacultyService.paymentReportManualByFacultyAllCampuses(
          context
        );

      result = { manualInvoices };
    } else if (
      context.academic_unit_id !== 'all' &&
      context.campus_id === 'all' &&
      context.programme_type_id === 'all'
    ) {
      manualInvoices =
        await paymentReportsByFacultyService.paymentReportManualByFacultyAllCampusesProgrammeTypes(
          context
        );

      result = { manualInvoices };
      // all college
    } else if (
      context.academic_unit_id === 'all' &&
      context.campus_id !== 'all' &&
      context.programme_type_id !== 'all'
    ) {
      manualInvoices =
        await paymentReportsByFacultyService.paymentReportManualAllFaculty(
          context
        );

      result = { manualInvoices };
    } else if (
      context.academic_unit_id === 'all' &&
      context.campus_id !== 'all' &&
      context.programme_type_id === 'all'
    ) {
      manualInvoices =
        await paymentReportsByFacultyService.paymentReportManualAllFacultyProgrammeTypes(
          context
        );

      result = { manualInvoices };
    } else if (
      context.academic_unit_id === 'all' &&
      context.campus_id === 'all' &&
      context.programme_type_id !== 'all'
    ) {
      manualInvoices =
        await paymentReportsByFacultyService.paymentReportManualAllFacultyCampus(
          context
        );

      result = { manualInvoices };
    } else if (
      context.academic_unit_id === 'all' &&
      context.campus_id === 'all' &&
      context.programme_type_id === 'all'
    ) {
      manualInvoices =
        await paymentReportsByFacultyService.manualReportAllFacultyProgrammeTypesCampus(
          context
        );

      result = { manualInvoices };
    } else {
      throw new Error('Invalid context provided');
    }

    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *  DEPARTMENT STRUCTURE
 * tuition
 * functional fees
 *  other fees invoices
 */
const tuitionFunctionalAndOtherFeesByDepartment = async function (req) {
  try {
    let result = {};
    const context = req.query;

    let paymentTransactions = [];

    if (
      context.academic_unit_id !== 'all' &&
      context.campus_id !== 'all' &&
      context.programme_type_id !== 'all'
    ) {
      paymentTransactions =
        await paymentReportsByDepartmentService.paymentReportByDepartment(
          context
        );

      result = { paymentTransactions };
    } else if (
      context.academic_unit_id !== 'all' &&
      context.campus_id !== 'all' &&
      context.programme_type_id === 'all'
    ) {
      paymentTransactions =
        await paymentReportsByDepartmentService.paymentReportByDepartmentAllProgrammeTypes(
          context
        );

      result = { paymentTransactions };
    } else if (
      context.academic_unit_id !== 'all' &&
      context.campus_id === 'all' &&
      context.programme_type_id !== 'all'
    ) {
      paymentTransactions =
        await paymentReportsByDepartmentService.paymentReportByDepartmentAllCampuses(
          context
        );

      result = { paymentTransactions };
    } else if (
      context.academic_unit_id !== 'all' &&
      context.campus_id === 'all' &&
      context.programme_type_id === 'all'
    ) {
      paymentTransactions =
        await paymentReportsByDepartmentService.paymentReportByDepartmentAllCampusesProgrmmeTypes(
          context
        );

      result = { paymentTransactions };

      // all colleges
    } else if (
      context.academic_unit_id === 'all' &&
      context.campus_id !== 'all' &&
      context.programme_type_id !== 'all'
    ) {
      paymentTransactions =
        await paymentReportsByDepartmentService.paymentReportAllDepartment(
          context
        );

      result = { paymentTransactions };
    } else if (
      context.academic_unit_id === 'all' &&
      context.campus_id !== 'all' &&
      context.programme_type_id === 'all'
    ) {
      paymentTransactions =
        await paymentReportsByDepartmentService.paymentReportAllDepartmentProgrammeType(
          context
        );

      result = { paymentTransactions };
    } else if (
      context.academic_unit_id === 'all' &&
      context.campus_id === 'all' &&
      context.programme_type_id !== 'all'
    ) {
      paymentTransactions =
        await paymentReportsByDepartmentService.paymentReportAllDepartmentCampuses(
          context
        );

      result = { paymentTransactions };
    } else if (
      context.academic_unit_id === 'all' &&
      context.campus_id === 'all' &&
      context.programme_type_id === 'all'
    ) {
      paymentTransactions =
        await paymentReportsByDepartmentService.paymentReportAllDepartmentProgrammmeTypesCampuses(
          context
        );

      result = { paymentTransactions };
    } else {
      throw new Error('Invalid context provided');
    }

    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};

// manual invoice reports
const manualInvoicesTransactionsByDepartment = async function (req) {
  try {
    let result = {};

    let manualInvoices = [];

    const context = req.query;

    if (
      context.academic_unit_id !== 'all' &&
      context.campus_id !== 'all' &&
      context.programme_type_id !== 'all'
    ) {
      manualInvoices =
        await paymentReportsByDepartmentService.paymentReportManualByDepartment(
          context
        );

      result = { manualInvoices };
    } else if (
      context.academic_unit_id !== 'all' &&
      context.campus_id !== 'all' &&
      context.programme_type_id === 'all'
    ) {
      manualInvoices =
        await paymentReportsByDepartmentService.paymentReportManualByDepartmentAllProgrammeTypes(
          context
        );

      result = { manualInvoices };
    } else if (
      context.academic_unit_id !== 'all' &&
      context.campus_id === 'all' &&
      context.programme_type_id !== 'all'
    ) {
      manualInvoices =
        await paymentReportsByDepartmentService.paymentReportManualByDepartmentAllCampuses(
          context
        );

      result = { manualInvoices };
    } else if (
      context.academic_unit_id !== 'all' &&
      context.campus_id === 'all' &&
      context.programme_type_id === 'all'
    ) {
      manualInvoices =
        await paymentReportsByDepartmentService.paymentReportManualByDepartmentAllCampusesProgrammeTypes(
          context
        );

      result = { manualInvoices };
      // all departments
    } else if (
      context.academic_unit_id === 'all' &&
      context.campus_id !== 'all' &&
      context.programme_type_id !== 'all'
    ) {
      manualInvoices =
        await paymentReportsByDepartmentService.paymentReportManualAllDepartment(
          context
        );

      result = { manualInvoices };
    } else if (
      context.academic_unit_id === 'all' &&
      context.campus_id !== 'all' &&
      context.programme_type_id === 'all'
    ) {
      manualInvoices =
        await paymentReportsByDepartmentService.paymentReportManualAllDepartmentProgrammeTypes(
          context
        );

      result = { manualInvoices };
    } else if (
      context.academic_unit_id === 'all' &&
      context.campus_id === 'all' &&
      context.programme_type_id !== 'all'
    ) {
      manualInvoices =
        await paymentReportsByDepartmentService.paymentReportManualAllDepartmentCampus(
          context
        );

      result = { manualInvoices };
    } else if (
      context.academic_unit_id === 'all' &&
      context.campus_id === 'all' &&
      context.programme_type_id === 'all'
    ) {
      manualInvoices =
        await paymentReportsByDepartmentService.manualReportAllDepartmentProgrammeTypesCampus(
          context
        );

      result = { manualInvoices };
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

const calculatePaymentTransaction = async function (
  EnrollmentInvoicesObject,
  manualInvoicesObject,
  structure
) {
  const unmatchedManualContext = [];

  manualInvoicesObject.manualInvoices.forEach((manualInvoice) => {
    const findContextInAuto = EnrollmentInvoicesObject.paymentTransactions.find(
      (invoice) =>
        manualInvoice.study_year_id === invoice.study_year_id &&
        manualInvoice.programme_id === invoice.programme_id &&
        manualInvoice.programme_type_id === invoice.programme_type_id
    );

    if (!findContextInAuto) {
      unmatchedManualContext.push({
        ...manualInvoice,
        paymentTransactions: [],
      });
    }
  });

  const newPaymentTransactions =
    EnrollmentInvoicesObject.paymentTransactions.map((invoice) => {
      const findManualInvoice = manualInvoicesObject.manualInvoices.find(
        (context) =>
          context.study_year_id === invoice.study_year_id &&
          context.programme_id === invoice.programme_id &&
          context.programme_type_id === invoice.programme_type_id
      );

      return {
        ...invoice,
        manual_invoices: findManualInvoice || {},
      };
    });

  let totalAmountBilled = 0;

  let totalAmountPaid = 0;

  let totalAmountDue = 0;

  let sumTuitionInvoiceAmount = 0;

  let sumTuitionAmountPaid = 0;

  let sumTuitionAmountDue = 0;

  let sumFunctionalFeesInvoiceAmount = 0;

  let sumFunctionalFeesAmountPaid = 0;

  let sumFunctionalFeesAmountDue = 0;

  let sumOtherFeesInvoiceAmount = 0;

  let sumOtherFeesAmountPaid = 0;

  let sumOtherFeesAmountDue = 0;

  let studentsBilled = 0;

  const payments = [];

  forEach(newPaymentTransactions, (trxn) => {
    sumTuitionInvoiceAmount += trxn.tuition_invoice_amount;
    sumTuitionAmountPaid += trxn.tuition_amount_paid;
    sumTuitionAmountDue += trxn.tuition_amount_due;

    sumOtherFeesInvoiceAmount += trxn.other_fees_invoice_amount;
    sumFunctionalFeesAmountPaid += trxn.functional_fees_amount_paid;
    sumFunctionalFeesAmountDue += trxn.functional_fees_amount_due;

    sumFunctionalFeesInvoiceAmount += trxn.functional_fees_invoice_amount;
    sumOtherFeesAmountPaid += trxn.other_fees_amount_paid;
    sumOtherFeesAmountDue += trxn.other_fees_amount_due;

    studentsBilled += trxn.number_of_students_enrolled;

    payments.push(trxn.manual_invoices);
  });

  const manualInvoicePayments = flatten(payments);

  // Handle Unmatched Transactions
  let sumManualInvoiceAmount = 0;

  let sumManualInvoiceAmountPaid = 0;

  let sumManualInvoiceAmountDue = 0;

  const unMatchedTransactions = [];

  forEach(unmatchedManualContext, (trxn) => {
    sumManualInvoiceAmount += trxn.manual_invoices_invoice_amount;
    sumManualInvoiceAmountPaid += trxn.manual_invoices_amount_paid;
    sumManualInvoiceAmountDue += trxn.manual_invoices_amount_due;
    // sumTuitionInvoiceAmount += trxn.manual_invoices_amount_due || 0;

    unMatchedTransactions.push(...trxn.paymentTransactions);
  });

  sumTuitionInvoiceAmount +=
    sumBy(unMatchedTransactions, 'tuition_invoice_amount') || 0;

  sumManualInvoiceAmount += sumBy(
    manualInvoicePayments,
    'manual_invoices_invoice_amount'
  );

  sumManualInvoiceAmountPaid += sumBy(
    manualInvoicePayments,
    'manual_invoices_amount_paid'
  );

  sumManualInvoiceAmountDue += sumBy(
    manualInvoicePayments,
    'manual_invoices_amount_due'
  );

  totalAmountBilled =
    sumTuitionInvoiceAmount +
    sumFunctionalFeesInvoiceAmount +
    sumManualInvoiceAmount +
    sumOtherFeesInvoiceAmount;
  totalAmountPaid =
    sumTuitionAmountPaid +
    sumFunctionalFeesAmountPaid +
    sumManualInvoiceAmountPaid +
    sumOtherFeesAmountPaid;
  totalAmountDue =
    sumTuitionAmountDue +
    sumFunctionalFeesAmountDue +
    sumManualInvoiceAmountDue +
    sumOtherFeesAmountDue;

  let merged = [];

  const mergeData = [...newPaymentTransactions, ...unmatchedManualContext];

  if (structure === 'Colleges') {
    merged = await collegePaymentReport(mergeData);
  } else if (structure === 'Faculties' || structure === 'Schools') {
    merged = await facultyPaymentReport(mergeData);
  } else {
    merged = await departmentPaymentReport(mergeData);
  }

  return {
    merged,
    sumTuitionInvoiceAmount,
    sumFunctionalFeesInvoiceAmount,
    sumManualInvoiceAmount,
    sumOtherFeesInvoiceAmount,

    sumTuitionAmountPaid,
    sumFunctionalFeesAmountPaid,
    sumOtherFeesAmountPaid,
    sumManualInvoiceAmountPaid,

    sumTuitionAmountDue,
    sumFunctionalFeesAmountDue,
    sumOtherFeesAmountDue,
    sumManualInvoiceAmountDue,

    totalAmountBilled: totalAmountBilled || 0,
    totalAmountPaid: totalAmountPaid || 0,
    totalAmountDue: totalAmountDue || 0,
    totalNumberStudentsBilled: parseInt(studentsBilled, 10) || 0,
  };
};

module.exports = PaymentTransactionReportsController;
