const {
  financialYearReportService,
  studentInvoiceSummaryService,
} = require('@services/index');
const { pick, sumBy, find, forEach } = require('lodash');
const { produce } = require('immer');

const getAllFinancialYearReport = async (context, programmeId = null) => {
  if (!context.payments_from || !context.payments_to) {
    throw new Error('Invalid context provided');
  }

  const creditNotes = await financialYearReportService.allStudentCreditNotes(
    context.payments_from,
    context.payments_to,
    programmeId
  );

  const debitNotes = await financialYearReportService.allStudentDebitNotes(
    context.payments_from,
    context.payments_to,
    programmeId
  );

  const paymentReports = await financialYearReportService.allStudentPayments(
    context.payments_from,
    context.payments_to,
    programmeId
  );

  const invoiceReport = await financialYearReportService.allStudentInvoices(
    context.payments_from,
    context.payments_to,
    programmeId
  );

  const formattedResponse = formattedStudentReports(
    invoiceReport,
    debitNotes,
    creditNotes,
    paymentReports
  );

  // console.log('formattedResponse', formattedResponse);

  return formattedResponse;
};
const getDetailedFinancialYearReport = async (context) => {
  if (!context.payments_from || !context.payments_to) {
    throw new Error('Invalid context provided');
  }

  const creditNotes = await financialYearReportService.allStudentCreditNotes(
    context.payments_from,
    context.payments_to
  );

  const debitNotes = await financialYearReportService.allStudentDebitNotes(
    context.payments_from,
    context.payments_to
  );

  const paymentReports = await financialYearReportService.allStudentPayments(
    context.payments_from,
    context.payments_to
  );

  const currentInvoiceReport =
    await studentInvoiceSummaryService.findAllCurrent(context);

  const prevInvoiceReport = await studentInvoiceSummaryService.findAllPrevious(
    context
  );

  const formattedResponse = formattedDetailedStudentReports(
    currentInvoiceReport,
    prevInvoiceReport,
    debitNotes,
    creditNotes,
    paymentReports
  );

  // console.log('formattedResponse', formattedResponse);

  return formattedResponse;
};

const getSummaryFinancialYearReport = async (context) => {
  if (!context.payments_from || !context.payments_to) {
    throw new Error('Invalid context provided');
  }

  const currentInvoiceReport =
    await studentInvoiceSummaryService.findAllCurrentSummary(context);

  const prevInvoiceReport =
    await studentInvoiceSummaryService.findAllPreviousSummary(context);

  if (
    !currentInvoiceReport.tuition_bill &&
    !currentInvoiceReport.functional_bill &&
    !currentInvoiceReport.manual_bill &&
    !currentInvoiceReport.other_fees_bill
  )
    throw new Error(
      'This DATE RANGE has no SUMMARY REPORT generated, Please generate and check again later.'
    );

  const currCreditNotes =
    await studentInvoiceSummaryService.allCurrCreditNoteSummary(context);

  const prevCreditNotes =
    await studentInvoiceSummaryService.allPrevCreditNoteSummary(context);

  const currDebitNotes =
    await studentInvoiceSummaryService.allCurrDebitNoteSummary(context);

  const prevDebitNotes =
    await studentInvoiceSummaryService.allPrevDebitNoteSummary(context);

  const currPaymentReports =
    await studentInvoiceSummaryService.allCurrentPaymentSummary(context);

  const prevPaymentReports =
    await studentInvoiceSummaryService.allPreviousPaymentSummary(context);

  /// CURRENT INVOICES
  const totalCurrentCN = currCreditNotes.total_paid || 0;
  const totalCurrentDN = currDebitNotes.total_paid || 0;
  const totalCurrentBill =
    currentInvoiceReport.total_manual_bill + totalCurrentDN;
  const totalCurrentPayments = currPaymentReports.total_paid + totalCurrentCN;

  /// PREVIOUS INVOICES
  const totalPrevCN = prevCreditNotes.total_paid || 0;
  const totalPrevDN = prevDebitNotes.total_paid || 0;
  const totalPrevBill =
    (prevInvoiceReport.total_manual_bill || 0) + totalPrevDN;
  const totalPrevPayment = (prevPaymentReports.total_paid || 0) + totalPrevCN;

  const openingBalance = totalPrevBill - totalPrevPayment;

  return {
    totalCreditNotes: totalCurrentCN,
    totalDebitNotes: totalCurrentDN,
    tuitionBilled: currentInvoiceReport.tuition_bill,
    functionalBilled: currentInvoiceReport.functional_bill,
    manualBilled: currentInvoiceReport.manual_bill,
    otherFeesBilled: currentInvoiceReport.other_fees_bill,
    totalBilled: totalCurrentBill,
    totalPaid: totalCurrentPayments,
    totalDue:
      totalCurrentPayments > totalCurrentBill
        ? totalCurrentPayments - totalCurrentBill
        : totalCurrentBill - totalCurrentPayments,
    totalPrepayment:
      totalCurrentPayments > totalCurrentBill
        ? totalCurrentBill - totalCurrentPayments
        : 0,
    totalOpeningReceivable: openingBalance >= 0 ? 0 : Math.abs(openingBalance),
    totalOpeningPrepayment: openingBalance >= 0 ? openingBalance : 0,
    numberOfRecords: currentInvoiceReport.count,
  };
};

const formattedStudentReports = (
  invoiceReport,
  debitNotes,
  creditNotes,
  paymentReports
) => {
  const finalReport = [];

  forEach(invoiceReport.current, (studentProg) => {
    const pickedRes = pick(studentProg, [
      'id',
      'surname',
      'other_names',
      'student_number',
      'registration_number',
      'programme_code',
      'programme_title',
      'current_study_year',
      'credit_notes',
      'debit_notes',
    ]);

    // HANDLE PREVIOUS PAYMENTS

    const findPrevCreditNote = find(creditNotes.previous, {
      student_programme_id: pickedRes.id,
    });
    const findPrevDebitNote = find(debitNotes.previous, {
      student_programme_id: pickedRes.id,
    });
    const prevPayments = find(paymentReports.previous, {
      student_programme_id: pickedRes.id,
    });
    const prevInvoices = find(invoiceReport.previous, {
      id: pickedRes.id,
    });

    const prevCreditNote = findPrevCreditNote ? findPrevCreditNote.amount : 0;
    const prevDebitNote = findPrevDebitNote ? findPrevDebitNote.amount : 0;

    let totalPreviousBill = 0;

    if (prevInvoices) {
      totalPreviousBill =
        sumBy(prevInvoices.tuition_invoices, 'invoice_amount') +
        sumBy(prevInvoices.functional_invoices, 'invoice_amount') +
        sumBy(prevInvoices.manual_invoices, 'invoice_amount') +
        sumBy(prevInvoices.other_invoices, 'invoice_amount');
    }

    const previousClosingBalance =
      (prevPayments ? prevPayments.amount : 0) +
      prevCreditNote -
      (totalPreviousBill + prevDebitNote);
    // ------END HANDLE PREVIOUS PAYMENTS

    const findCurrCreditNote = find(creditNotes.current, {
      student_programme_id: pickedRes.id,
    });

    const findCurrDebitNote = find(debitNotes.current, {
      student_programme_id: pickedRes.id,
    });

    const currPayments = find(paymentReports.current, {
      student_programme_id: pickedRes.id,
    });

    const currCreditNote = findCurrCreditNote ? findCurrCreditNote.amount : 0;
    const currDebitNote = findCurrDebitNote ? findCurrDebitNote.amount : 0;

    const tuitionBilled = sumBy(studentProg.tuition_invoices, 'invoice_amount');
    const functionalBilled = sumBy(
      studentProg.functional_invoices,
      'invoice_amount'
    );
    const manualBilled = sumBy(studentProg.manual_invoices, 'invoice_amount');
    const otherFeesBilled = sumBy(studentProg.other_invoices, 'invoice_amount');

    let openingReceivable = 0;

    let openingPrepayment = 0;

    if (previousClosingBalance >= 0) {
      openingPrepayment = previousClosingBalance;
    } else {
      openingReceivable = Math.abs(previousClosingBalance);
    }

    const totalPaid =
      (currPayments ? currPayments.amount : 0) +
      currCreditNote +
      openingPrepayment;

    const totalBilled =
      tuitionBilled +
      functionalBilled +
      manualBilled +
      otherFeesBilled +
      currDebitNote +
      openingReceivable;

    const totalDue = totalBilled > totalPaid ? totalBilled - totalPaid : 0;

    const totalPrepayments =
      totalPaid > totalBilled ? totalPaid - totalBilled : 0;

    finalReport.push({
      ...pickedRes,
      credit_notes: currCreditNote,
      debit_notes: currDebitNote,
      tuition_billed: tuitionBilled,
      functional_billed: functionalBilled,
      manual_billed: manualBilled,
      other_fees_billed: otherFeesBilled,
      total_billed: totalBilled,
      total_paid: totalPaid,
      total_due: totalDue,
      prepayments: totalPrepayments,
      payments: currPayments ? currPayments.amount : 0,
      opening_receivable: openingReceivable,
      opening_prepayment: openingPrepayment,
    });
  });

  const summaryReport = {
    totalCreditNotes: sumBy(finalReport, 'credit_notes'),
    totalDebitNotes: sumBy(finalReport, 'debit_notes'),
    totalOpeningReceivable: sumBy(finalReport, 'opening_receivable'),
    totalOpeningPrepayment: sumBy(finalReport, 'opening_prepayment'),
    totalPrepayments: sumBy(finalReport, 'prepayments'),
    totalDue: sumBy(finalReport, 'total_due'),
    manualBilled: sumBy(finalReport, 'manual_billed'),
    tuitionBilled: sumBy(finalReport, 'tuition_billed'),
    functionalBilled: sumBy(finalReport, 'functional_billed'),
    otherFeesBilled: sumBy(finalReport, 'other_fees_billed'),
    totalPaid: sumBy(finalReport, 'total_paid'),
    totalBilled: sumBy(finalReport, 'total_billed'),
  };

  return { finalReport, summaryReport };
};

const formattedDetailedStudentReports = (
  currInvoiceReport,
  prevInvoiceReport,
  debitNotes,
  creditNotes,
  paymentReports
) => {
  const finalReport = [];

  forEach(currInvoiceReport, (studentProg) => {
    const finalContext = produce(studentProg, (draft) => {
      const pickedRes = pick(draft, [
        'student_programme_id',
        'surname',
        'other_names',
        'student_number',
        'registration_number',
        'programme_code',
        'programme_title',
        'current_study_year',
        'credit_notes',
        'debit_notes',
      ]);

      // HANDLE PREVIOUS PAYMENTS

      const findPrevCreditNote = find(creditNotes.previous, {
        student_programme_id: pickedRes.student_programme_id,
      });
      const findPrevDebitNote = find(debitNotes.previous, {
        student_programme_id: pickedRes.student_programme_id,
      });
      const prevPayments = find(paymentReports.previous, {
        student_programme_id: pickedRes.student_programme_id,
      });
      const prevInvoices = find(prevInvoiceReport, {
        student_programme_id: pickedRes.student_programme_id,
      });

      const prevCreditNote = findPrevCreditNote ? findPrevCreditNote.amount : 0;
      const prevDebitNote = findPrevDebitNote ? findPrevDebitNote.amount : 0;

      let totalPreviousBill = 0;

      if (prevInvoices) {
        totalPreviousBill = prevInvoices.total_manual_bill || 0;
      }

      const previousClosingBalance =
        (prevPayments ? prevPayments.amount : 0) +
        prevCreditNote -
        (totalPreviousBill + prevDebitNote);
      // ------END HANDLE PREVIOUS PAYMENTS

      const findCurrCreditNote = find(creditNotes.current, {
        student_programme_id: pickedRes.id,
      });

      const findCurrDebitNote = find(debitNotes.current, {
        student_programme_id: pickedRes.id,
      });
      const currPayments = find(paymentReports.current, {
        student_programme_id: pickedRes.id,
      });

      const currCreditNote = findCurrCreditNote ? findCurrCreditNote.amount : 0;
      const currDebitNote = findCurrDebitNote ? findCurrDebitNote.amount : 0;

      const tuitionBilled = sumBy(draft.tuition_invoices, 'invoice_amount');
      const functionalBilled = sumBy(
        draft.functional_invoices,
        'invoice_amount'
      );
      const manualBilled = sumBy(draft.manual_invoices, 'invoice_amount');
      const otherFeesBilled = sumBy(draft.other_invoices, 'invoice_amount');

      let openingReceivable = 0;

      let openingPrepayment = 0;

      if (previousClosingBalance >= 0) {
        openingPrepayment = previousClosingBalance;
      } else {
        openingReceivable = Math.abs(previousClosingBalance);
      }

      const totalBilled =
        tuitionBilled +
        functionalBilled +
        manualBilled +
        otherFeesBilled +
        currDebitNote +
        Math.abs(openingReceivable);

      const totalPaid =
        (currPayments ? currPayments.amount : 0) +
        currCreditNote +
        openingPrepayment;

      const totalDue = totalBilled > totalPaid ? totalBilled - totalPaid : 0;

      const totalPrepayments =
        totalPaid > totalBilled ? totalPaid - totalBilled : 0;

      return {
        ...pickedRes,
        credit_notes: currCreditNote,
        debit_notes: currDebitNote,
        tuition_billed: tuitionBilled,
        functional_billed: functionalBilled,
        manual_billed: manualBilled,
        other_fees_billed: otherFeesBilled,
        total_billed: totalBilled,
        total_paid: totalPaid,
        total_due: totalDue,
        prepayments: totalPrepayments,
        payments: currPayments ? currPayments.amount : 0,
        opening_receivable: openingReceivable,
        opening_prepayment: openingPrepayment,
      };
    });

    finalReport.push(finalContext);
  });

  return finalReport;
};

module.exports = {
  getAllFinancialYearReport,
  getSummaryFinancialYearReport,
  getDetailedFinancialYearReport,
};
