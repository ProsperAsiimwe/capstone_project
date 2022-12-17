const { HttpResponse } = require('@helpers');
const {
  searchTransactionsService,
  institutionStructureService,
} = require('@services/index');
const { isEmpty, sumBy, toUpper } = require('lodash');
const moment = require('moment');

const fs = require('fs');
const PDFDocument = require('pdfkit-table');
const { appConfig } = require('@root/config');

const http = new HttpResponse();

class SearchTransactionsController {
  // search transactions..
  async searchTransactionsFunction(req, res) {
    const context = req.query;

    try {
      if (!context.search_transaction || !context.transaction_category) {
        throw new Error('Invalid Context Provided');
      }

      let data = [];

      if (context.transaction_category === 'APPLICANT') {
        data = await searchTransactionsService.searchApplicantTransactions(
          context
        );
      } else if (context.transaction_category === 'UNIVERSAL') {
        data = await searchTransactionsService.searchUniversalTransactions(
          context
        );
      } else if (context.transaction_category === 'BULK') {
        data = await searchTransactionsService.searchBulkTransactions(context);
      } else if (context.transaction_category === 'STUDENT') {
        data = await searchTransactionsService.searchStudentTransactions(
          context
        );
      }

      http.setSuccess(
        200,
        `Payment Transaction '${context.search_transaction}' Category Of ${context.transaction_category} fetched successfully`,
        {
          data,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        `Unable To Fetch  Payment Transaction '${context.search_transaction}' Category of ${context.transaction_category}`,
        {
          error: { message: error.message },
        }
      );

      return http.send(res);
    }
  }

  // studentTuitionLedger

  async studentTuitionLedger(req, res) {
    const context = req.query;

    try {
      if (!context.student) {
        throw new Error('Invalid Context Provided');
      }

      const findStudent = await searchTransactionsService.findStudent(context);

      if (isEmpty(findStudent)) {
        throw new Error('Student Record Does Not Exist');
      }

      const newContext = findStudent[0];

      const invoicePayments =
        await searchTransactionsService.studentTuitionLedger(newContext, req);

      const ManualInvoices =
        await searchTransactionsService.studentLedgerManual(newContext);

      const migratedPayments =
        await searchTransactionsService.migratedPaymentLedger(newContext);

      migratedPayments.forEach((element) => {
        element.paymentDate = convertDate(element.payment_date);
      });

      const unmatchedManualContext = [];

      ManualInvoices.forEach((context) => {
        const findContextInAuto = invoicePayments.find(
          (invoice) =>
            context.student_programme_id === invoice.student_programme_id &&
            context.academic_year_id === invoice.academic_year_id &&
            context.programme_study_years === invoice.programme_study_years &&
            context.semester === invoice.semester
        );

        if (!findContextInAuto) {
          unmatchedManualContext.push({
            ...context,
            tuition_invoices: [],
            functional_fees_invoices: [],
            other_fees_invoices: [],
          });
        }
      });

      const result = invoicePayments.map((invoice) => {
        const findManualInvoice = ManualInvoices.find(
          (context) =>
            context.student_programme_id === invoice.student_programme_id &&
            context.academic_year_id === invoice.academic_year_id &&
            context.programme_study_years === invoice.programme_study_years &&
            context.semester === invoice.semester
        );

        return {
          ...invoice,
          manual_invoices: findManualInvoice
            ? findManualInvoice.manual_invoices
            : [],
        };
      });

      const studentInvoicePayments = [...result, ...unmatchedManualContext];

      const data = { migratedPayments, studentInvoicePayments };

      http.setSuccess(200, `Student Ledger fetched successfully`, {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, `Unable To Fetch Student Ledger`, {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
  /**
   *  student ledger
   * @param {*} req
   * @param {*} res
   * @returns
   */

  async studentLedgerFunction(req, res) {
    const context = req.query;

    try {
      if (!context.student) {
        throw new Error('Invalid Context Provided');
      }

      const findStudent = await searchTransactionsService.findStudent(context);

      if (isEmpty(findStudent)) {
        throw new Error('Student Record Does Not Exist');
      }

      const newContext = findStudent[0];

      const invoicePayments =
        await searchTransactionsService.studentTuitionLedger(newContext, req);

      invoicePayments.forEach((element) => {
        element.tuition_invoices.forEach((i) => {
          const tuitionBill = {
            invoice_number: i.invoice_number,
            invoice_amount: i.invoice_amount,
            currency: i.currency,
            invoice_type: i.invoice_type,
            debit_note: i.debit_note,
          };

          const tuitionPay = {
            invoice_number: i.invoice_number,
            credit_note: i.credit_note,
            amount_paid: i.amount_paid,
            amount_due: i.amount_due,
            currency: i.currency,
          };

          i.tuitionBill = tuitionBill;
          i.tuitionPay = tuitionPay;
        });

        element.functional_fees_invoices.forEach((i) => {
          const functionalBill = {
            invoice_number: i.invoice_number,
            invoice_amount: i.invoice_amount,
            currency: i.currency,
            invoice_type: i.invoice_type,
            debit_note: i.debit_note,
          };

          const functionalPay = {
            invoice_number: i.invoice_number,
            credit_note: i.credit_note,
            amount_paid: i.amount_paid,
            amount_due: i.amount_due,
            currency: i.currency,
          };

          i.functionalBill = functionalBill;
          i.functionalPay = functionalPay;
        });

        element.other_fees_invoices.forEach((i) => {
          const otherBill = {
            invoice_number: i.invoice_number,
            invoice_amount: i.invoice_amount,
            currency: i.currency,
            invoice_type: i.invoice_type,
            debit_note: i.debit_note,
          };

          const otherPay = {
            invoice_number: i.invoice_number,
            credit_note: i.credit_note,
            amount_paid: i.amount_paid,
            amount_due: i.amount_due,
            currency: i.currency,
          };

          i.otherBill = otherBill;
          i.otherPay = otherPay;
        });
      });

      const ManualInvoices =
        await searchTransactionsService.studentLedgerManual(newContext);

      const migratedPayments =
        await searchTransactionsService.migratedPaymentLedger(newContext);

      migratedPayments.forEach((element) => {
        element.paymentDate = convertDate(element.payment_date);
      });

      const unmatchedManualContext = [];

      ManualInvoices.forEach((context) => {
        const findContextInAuto = invoicePayments.find(
          (invoice) =>
            context.student_programme_id === invoice.student_programme_id &&
            context.academic_year_id === invoice.academic_year_id &&
            context.programme_study_years === invoice.programme_study_years &&
            context.semester === invoice.semester
        );

        if (!findContextInAuto) {
          unmatchedManualContext.push({
            ...context,
            tuition_invoices: [],
            functional_fees_invoices: [],
            other_fees_invoices: [],
          });
        }
      });

      const result = invoicePayments.map((invoice) => {
        const findManualInvoice = ManualInvoices.find(
          (context) =>
            context.student_programme_id === invoice.student_programme_id &&
            context.academic_year_id === invoice.academic_year_id &&
            context.programme_study_years === invoice.programme_study_years &&
            context.semester === invoice.semester
        );

        return {
          ...invoice,
          manual_invoices: findManualInvoice
            ? findManualInvoice.manual_invoices
            : [],
        };
      });

      const studentInvoicePayments = [...result, ...unmatchedManualContext];

      const data = { migratedPayments, studentInvoicePayments };

      data.studentInvoicePayments.forEach((element) => {
        element.manual_invoices.forEach((i) => {
          const manualBill = {
            invoice_number: i.invoice_number,
            invoice_amount: i.invoice_amount,
            currency: i.currency,
            invoice_type: i.invoice_type,
            debit_note: i.debit_note,
          };

          const manualPay = {
            invoice_number: i.invoice_number,
            credit_note: i.credit_note,
            amount_paid: i.amount_paid,
            amount_due: i.amount_due,
            currency: i.currency,
          };

          i.manualBill = manualBill;
          i.manualPay = manualPay;
        });
      });

      http.setSuccess(200, `Student Ledger fetched successfully`, {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, `Unable To Fetch Student Ledger`, {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  // studentPrepaymentApproval
  async studentPrepaymentApproval(req, res) {
    const context = req.query;

    try {
      if (!context.programmeId) {
        throw new Error('Invalid Context Provided');
      }

      const data = await searchTransactionsService.studentPrepaymentApproval(
        context
      );

      http.setSuccess(200, `Programme Pre-payments fetched successfully`, {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, `Unable To Fetch Programme Pre-payments`, {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  // studentFinancialStatement

  async studentFinancialStatement(req, res) {
    const context = req.query;

    try {
      if (!context.student) {
        throw new Error('Invalid Context Provided');
      }

      //  const findStudent = await searchTransactionsService.findStudent(context);

      const findStudentDetails =
        await searchTransactionsService.findStudentCollege(context);

      if (isEmpty(findStudentDetails)) {
        throw new Error('Student Record Does Not Exist');
      }

      const newContext = findStudentDetails[0];

      const financialData =
        await searchTransactionsService.studentFinancialStatement(
          newContext,
          req
        );

      const openingBal = await searchTransactionsService.studentOpeningBalance(
        newContext
      );

      const result = financialReport(financialData, openingBal);

      const data = { findStudentDetails, result };

      http.setSuccess(200, `Student Ledger fetched successfully`, {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, `Unable To Fetch Student Ledger`, {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  // print pdf financial statement

  async pdfStudentFinancialStatement(req, res) {
    try {
      const context = req.query;

      if (!context.student) {
        throw new Error('Invalid Context Provided');
      }

      const findStudentDetails =
        await searchTransactionsService.findStudentCollege(context);

      if (isEmpty(findStudentDetails)) {
        throw new Error('Student Record Does Not Exist');
      }

      const newContext = findStudentDetails[0];

      const financialData =
        await searchTransactionsService.studentFinancialStatement(
          newContext,
          req
        );
      const openingBal = await searchTransactionsService.studentOpeningBalance(
        newContext
      );
      const result = financialReport(financialData, openingBal);

      const dataFinancial = { findStudentDetails, result };

      const getData = dataFinancial.result.statement;
      const getStudentData = dataFinancial.findStudentDetails[0];

      const institutionStructure =
        await institutionStructureService.findInstitutionStructureRecords({
          attributes: ['institution_name', 'institution_logo'],
        });

      if (!institutionStructure) {
        throw new Error('Unable To Find Institution Structure.');
      }

      /// here

      const theOutput = new PDFDocument({
        size: 'A4',
        layout: 'Portrait',
        margin: 40,
        permissions: {
          copying: false,
          modifying: false,
          fillingForms: false,
        },
      });
      const pathTemplate = `${appConfig.ASSETS_ROOT_DIRECTORY}/documents/templates/`;

      const fileName = `${pathTemplate}GraduateAdmissions.pdf`;
      const institutionName = toUpper(institutionStructure.institution_name);

      const generatedAtTime = moment(moment.now()).format('lll');

      theOutput.pipe(fs.createWriteStream(fileName));

      const pathToLog = `${appConfig.ASSETS_ROOT_DIRECTORY}/logo`;

      theOutput.image(`${pathToLog}/default.png`, 380, 30, {
        align: 'center',
        fit: [70, 70],
        valign: 'center',
      });

      theOutput.moveDown();

      theOutput.moveDown(4.0).font('Times-Bold').text(`${institutionName}`, {
        align: 'center',
        bold: true,
      });

      theOutput.font('Times-Bold').text(`Office of the University Bursar`, {
        align: 'center',
        bold: true,
      });
      theOutput.moveDown();
      theOutput.moveDown();

      theOutput.text('FINANCIAL STATEMENT', {
        align: 'center',
      });

      theOutput.moveDown();
      theOutput.moveDown();

      theOutput.text(
        `To: ${getStudentData.surname} ${getStudentData.other_names} (${getStudentData.student_number})-${getStudentData.student_number}`,
        {
          align: 'left',
          fontSize: 8,
        }
      );
      theOutput.text(`AS OF:  ${generatedAtTime}`, {
        align: 'left',
        fontSize: 8,
      });

      theOutput.moveDown();

      theOutput
        .font('Times-Bold')
        .text(
          `${getStudentData.faculty_title}(${getStudentData.faculty_code})`,
          {
            align: 'left',
            fontSize: 8,
          }
        );
      theOutput
        .font('Times-Bold')
        .text(
          `${getStudentData.programme_title}(${getStudentData.programme_code})`,
          {
            align: 'left',
            fontSize: 8,
          }
        );

      theOutput.moveDown();
      theOutput.moveDown();

      theOutput
        .font('Times-Bold')
        .text(`${dataFinancial.result.contextOpeningBalance}`, {
          align: 'right',
          fontSize: 8,
        });
      theOutput.moveDown();
      theOutput.moveDown();

      // getData.forEach((e) => {
      //   e.sem = e.semester || '';
      //   e.study_years = e.programme_study_years || '';
      //   e.entry = `${e.description} #${e.invoice_number} ${e.study_years} ${e.sem}`;
      // });

      //   const generatedAt = moment(moment.now()).format('Do MMM, YYYY');

      const generatedAt = moment(moment.now()).format('lll');

      const table = {
        title: `Statement`,

        headers: [
          {
            label: '',
            property: 'sn',
            width: 30,
            renderer: null,
            bold: true,
            align: 'center',
          },
          {
            label: 'Time Stamp',
            property: 'time_stamp',
            width: 200,
            renderer: null,
            bold: true,
            align: 'center',
          },
          {
            label: 'Entity',
            property: 'entry',
            width: 150,
            renderer: null,
            align: 'center',
          },
          {
            label: 'Narration',
            property: 'narration',
            width: 100,
            renderer: null,
            align: 'center',
          },
          {
            label: 'Debit',
            property: 'invoice_amount',
            width: 100,
            renderer: null,
            align: 'center',
          },
          {
            label: 'Credit',
            property: 'amount_paid',
            width: 100,
            renderer: null,
            align: 'center',
          },
          {
            label: 'Balance',
            property: 'current_bal',
            width: 100,
            renderer: null,
            align: 'center',
          },
        ],
        datas: [...getData],
      };

      await theOutput.table(table, {
        // columnsSize: [50, 100, 100, 100, 100, 100, 100],
        prepareHeader: () =>
          theOutput.font('Helvetica-Bold').fontSize(12).moveDown(),
        prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
          theOutput.font('Helvetica').fontSize(10);
          indexColumn = 0;
        },
        align: 'center',
        columnSpacing: 10,

        width: 650,
      });

      theOutput.moveDown();
      const userDetails = req.user.dataValues;

      theOutput.text(
        `UGX NET STATEMENT BALANCE: ${getData[getData.length - 1].current_bal}`,
        {
          align: 'right',
        }
      );

      theOutput.text(`------------------------------------------------------`, {
        align: 'right',
      });
      theOutput.moveDown();

      theOutput.moveDown();
      theOutput.text(
        `Print By: ${userDetails.surname} ${userDetails.other_names}`,
        {
          align: 'left',
        }
      );
      theOutput.moveDown();

      theOutput.moveDown();
      theOutput.text(
        `Signature:.................................................................................`,
        {
          align: 'left',
        }
      );
      theOutput.moveDown();

      theOutput.text(`Date: ${generatedAt}`, {
        align: 'left',
      });

      theOutput.end();

      const dataReport = res;

      return theOutput.pipe(dataReport);
    } catch (error) {
      http.setError(400, 'Unable to Download Financial Statement.', {
        error: { error: error.message },
      });

      return http.send(res);
    }
  }
}

module.exports = SearchTransactionsController;

const convertDate = function (str) {
  const date = new Date(str);
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);

  return [date.getFullYear(), month, day].join('-');
};

// data format

const financialReport = function (data, openingBal) {
  const filter = data.map((e) => ({
    time_stamp: moment(e.time_stamp).format('lll'),
    academic_year: e.academic_year,
    semester: e.semester,
    programme_study_years: e.programme_study_years,
    invoice_number: e.invoice_number,
    invoice_amount: e.invoice_amount,
    amount_paid: e.amount_paid,
    narration: e.narration,
    description: e.description,
  }));
  const output = [];

  let bal = 0;

  filter.forEach((item, index) => {
    if (item.narration !== 'Payment' && item.narration !== 'Credit note') {
      output.push({
        ...item,
        amount_paid: 0,
        current_bal: bal - item.invoice_amount,
        sn: index + 1,
      });
      bal = bal - item.invoice_amount;
    } else {
      output.push({
        ...item,
        current_bal: bal + item.amount_paid,
        sn: index + 1,
      });
      bal = bal + item.amount_paid;
    }
  });

  const trimSem = (sem) => {
    if (sem === 'SEMESTER III') return 'SEM 3';
    if (sem === 'SEMESTER II') return 'SEM 2';
    if (sem === 'SEMESTER I') return 'SEM 1';

    return '';
  };
  // output.map((it) => {
  //   return { ...it, sem: trimSem(it.semester) };
  // });

  output.forEach((e) => {
    e.sem = trimSem(e.semester) || '';
    e.study_years = e.programme_study_years || '';
    e.entry = `${e.description} #${e.invoice_number} ${e.study_years} ${e.sem}`;
  });

  const totalDebit = sumBy(output, 'invoice_amount');
  const totalCredit = sumBy(output, 'amount_paid');

  let openingBalance = 0;

  openingBal.forEach((e) => {
    if (e.tuition_is_billed === false) {
      openingBalance = openingBalance + e.tuition_total_due;
    }

    if (e.other_is_billed === false) {
      openingBalance = openingBalance + e.other_total_due;
    }
  });

  let contextOpeningBalance = '';

  if (openingBalance > 0) {
    contextOpeningBalance = `Opening Balance(Not Billed): ${openingBalance} UGX`;
  }

  const result = {
    totalDebit,
    totalCredit,
    contextOpeningBalance,
    statement: output,
  };

  return result;
};
