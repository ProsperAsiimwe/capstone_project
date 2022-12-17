const { HttpResponse } = require('@helpers');
const {
  transactionsReportService,
  institutionStructureService,
  collegeService,
  facultyService,
  programmeService,
  financialYearReportService,
  studentInvoiceSummaryService,
} = require('@services/index');
const { sumBy, toUpper, forEach } = require('lodash');
const {
  transactionReportColumns,
  studentsFyReportColumns,
  financialYearReportColumns,
} = require('./templateColumns');
const { isEmpty, now, map } = require('lodash');
const ExcelJS = require('exceljs');
const moment = require('moment');
const stream = require('stream');

const { checkDateRange } = require('../../helpers/dateRangeHelper');

const fs = require('fs');
const path = require('path');
const ProgrammeService = require('@services/ProgrammeManager/programme.service');
const { appConfig } = require('@root/config');
const { getAllFinancialYearReport } = require('./financialYearHelper');
const { Op } = require('sequelize');

// transactionReportColumns
const http = new HttpResponse();

class FinancialReportController {
  async transactionsReport(req, res) {
    try {
      if (!req.query.payments_from || !req.query.payments_to) {
        throw new Error(`Invalid Request`);
      }

      const context = req.query;

      const tuition = await transactionsReportService.fyTuitionBilling(context);

      const functionalFees =
        await transactionsReportService.fyFunctionalBilling(context);

      const stdPayments =
        await transactionsReportService.fyStudentPaymentReport(context);

      const result = mergeTransactions(tuition, functionalFees, stdPayments);

      const data = analysisReport(result.result);

      http.setSuccess(200, 'Report fetched successfully', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Report', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * GENERATE FINANCIAL YEAR REPORT USING STREAM
   *
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async generateReport(req, res) {
    try {
      const context = req.body;
      const { user } = req;

      if (!context.payments_from || !context.payments_to) {
        throw new Error(`Invalid Request payload`);
      }

      await financialYearReportService.generateCurrentInvoices(
        context.payments_from,
        context.payments_to,
        user
      );

      await financialYearReportService.generatePreviousInvoices(
        context.payments_from,
        context.payments_to,
        user
      );

      http.setSuccess(
        200,
        'Report is being Generated, Please check again after some minutes'
      );

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To generate Report', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * GET FINANCIAL YEAR SUMMARY REPORT
   *
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async getFinancialYearReportSummary(req, res) {
    try {
      if (!req.query.payments_from || !req.query.payments_to) {
        throw new Error(
          `Invalid Request From: ${req.query.payments_from} To: ${req.query.payments_to}`
        );
      }

      const context = req.query;

      if (context.payments_from > context.payments_to) {
        throw new Error(
          `Invalid Context Provided, 'PAYMENT FROM DATE' SHOULD BE LESS OR EQUAL  TO 'PAYMENT TO DATE'`
        );
      }

      const directoryPath = path.join(
        appConfig.ASSETS_ROOT_DIRECTORY,
        `documents/all-fy-reports/`
      );

      if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath, { recursive: true }, (err) => {
          throw new Error(err.message);
        });
      }

      const downloadableFiles = [];

      fs.readdir(directoryPath, function (err, files) {
        // handling error
        if (err) {
          throw new Error('Unable to scan directory: ' + err);
        }
        // listing all files using forEach
        files.forEach(function (file) {
          downloadableFiles.push(file);
        });
      });

      const reportCount =
        await studentInvoiceSummaryService.getReportSummaryCount({
          where: {
            date_from: context.payments_from,
            date_to: context.payments_to,
          },
        });

      if (reportCount === 0)
        throw new Error(
          `There is currently no report generated for ${context.payments_from} - ${context.payments_to}`
        );

      const currentReport =
        await studentInvoiceSummaryService.getInvoiceSummary(context);

      const reportRes = {
        totalCreditNotes: currentReport.curr_credit_note || 0,
        totalDebitNotes: currentReport.curr_debit_note || 0,
        tuitionBilled: currentReport.tuition_bill || 0,
        functionalBilled: currentReport.functional_bill || 0,
        manualBilled: currentReport.manual_bill || 0,
        otherFeesBilled: currentReport.other_fees_bill || 0,
        totalBilled: currentReport.curr_total_bill || 0,
        totalPaid: currentReport.total_payment || 0,
        totalDue: currentReport.amount_due || 0,
        totalPrepayment: currentReport.prepayment || 0,
        totalOpeningReceivable: currentReport.opening_receivable || 0,
        totalOpeningPrepayment: currentReport.opening_prepayment || 0,
        numberOfRecords: reportCount || 0,
      };

      http.setSuccess(200, 'Report fetched successfully', {
        result: {
          downloadableFiles,
          ...reportRes,
        },
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Report', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * GET PROGRAMME FINANCIAL YEAR DETAIL
   *
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async getProgrammeFYReport(req, res) {
    try {
      const context = req.query;

      if (!context.payments_from || !context.payments_to) {
        throw new Error(
          `Invalid Request From: ${context.payments_from} To: ${context.payments_to}`
        );
      }

      const { programmeId } = req.params;

      if (context.payments_from >= context.payments_to) {
        throw new Error(
          `Invalid Context Provided, 'PAYMENT FROM DATE' SHOULD BE LESS OR EQUAL  TO 'PAYMENT TO DATE'`
        );
      }

      const formattedRes = await getAllFinancialYearReport(
        context,
        programmeId,
        res
      );

      http.setSuccess(200, 'Report fetched successfully', {
        result: {
          data: formattedRes.finalReport,
          ...formattedRes.summaryReport,
        },
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Report', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * GET PROGRAMME FINANCIAL YEAR DETAIL
   *
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async downloadProgrammeFYReport(req, res) {
    try {
      if (!req.body.payments_from || !req.body.payments_to) {
        throw new Error(`Invalid Request`);
      }

      const { unit_id: unit } = req.body;
      const { user } = req;

      const context = req.body;

      if (context.payments_from > context.payments_to) {
        throw new Error(
          `Invalid Context Provided, 'PAYMENT FROM DATE' SHOULD BE LESS OR EQUAL  TO 'PAYMENT TO DATE'`
        );
      }

      let fileName = 'ALL-PROGRAMMES';

      let fileTitle = 'ALL-PROGRAMMES';

      if (unit !== 'all') {
        const findProgramme = await programmeService.findOneProgramme({
          where: {
            id: unit,
          },
          attributes: ['id', 'programme_code', 'programme_title'],
          raw: true,
        });

        if (!findProgramme) throw new Error('This programme is Invalid');
        fileName = findProgramme.programme_code;
        fileTitle = findProgramme.programme_title;
      }

      const institutionStructure =
        await institutionStructureService.findInstitutionStructureRecords();

      const workbook = await new ExcelJS.Workbook();
      const financialYearWorkSheet = workbook.addWorksheet(
        'FINANCIAL YR REPORT',
        {
          headerFooter: {
            firstHeader: 'STUDENT INVOICE REPORT',
            firstFooter: 'STUDENT INVOICE REPORT',
          },
        }
      );

      financialYearWorkSheet.mergeCells('A1', 'U1');
      financialYearWorkSheet.mergeCells('A2', 'A3');
      financialYearWorkSheet.mergeCells('B2', 'E2');

      const titleCell = financialYearWorkSheet.getCell('A1');

      financialYearWorkSheet.getRow(1).height = 60;

      titleCell.value = `${
        toUpper(institutionStructure.institution_name) || 'ACMIS'
      }:- FINANCIAL YEAR REPORT FOR :${context.payments_from} to ${
        context.payments_to
      }\n ${
        unit === 'all'
          ? 'ALL CAMPUSES,ALL ACADEMIC UNITS ,All INTAKES'
          : fileTitle
      }\n GENERATED BY: ${user.surname} ${user.other_names}`;
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

      const generateDate = moment();

      const generatedDate = generateDate.format('YYYY-MM-DD');

      const dateCell = financialYearWorkSheet.getCell('A2');

      dateCell.value = `REPORT DATE: ${generatedDate}`;
      dateCell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
      };
      dateCell.font = { bold: true, size: 11, name: 'Arial' };

      financialYearWorkSheet.getRow(2).height = 30;

      const headerRow = financialYearWorkSheet.getRow(4);

      headerRow.values = map(financialYearReportColumns, 'header');
      headerRow.font = { bold: true, size: 11, color: '#2c3e50' };
      financialYearWorkSheet.columns = financialYearReportColumns.map(
        (column) => {
          delete column.header;

          return column;
        }
      );
      financialYearWorkSheet.getRow(3).height = 40;

      financialYearWorkSheet.views = [
        {
          state: 'frozen',
          xSplit: 0,
          ySplit: 4,
          topLeftCell: 'G10',
          activeCell: 'A1',
        },
      ];

      const v4 = financialYearWorkSheet.getCell('V4');
      const w4 = financialYearWorkSheet.getCell('W4');
      const x4 = financialYearWorkSheet.getCell('X4');
      const y4 = financialYearWorkSheet.getCell('Y4');
      const z4 = financialYearWorkSheet.getCell('Z4');

      v4.font = {
        color: { argb: 'e30022' },
        bold: true,
        size: 12,
      };
      w4.font = {
        color: { argb: 'e30022' },
        bold: true,
        size: 12,
      };
      x4.font = {
        color: { argb: 'e30022' },
        bold: true,
        size: 12,
      };
      y4.font = {
        color: { argb: 'e30022' },
        bold: true,
        size: 12,
      };
      z4.font = {
        color: { argb: 'e30022' },
        bold: true,
        size: 12,
      };
      const templateData = [];

      let reportData = [];

      if (unit !== 'all') {
        reportData = await getAllFinancialYearReport(context, unit);
      } else {
        reportData = await getAllFinancialYearReport(context);
      }

      forEach(reportData.finalReport, (resp) => {
        templateData.push([
          resp.surname,
          resp.other_names,
          resp.student_number,
          resp.registration_number,
          resp.programme_code,
          resp.programme_title,
          resp.current_study_year,
          resp.opening_receivable,
          resp.opening_prepayment,
          resp.tuition_billed,
          resp.functional_billed,
          resp.manual_billed,
          resp.other_fees_billed,
          resp.debit_notes,
          resp.total_billed,
          resp.credit_notes,
          resp.payments || 0,
          resp.total_paid,
          resp.total_due,
          resp.prepayments,
        ]);
      });

      financialYearWorkSheet.addRows(templateData);

      const uploadPath = path.join(
        appConfig.ASSETS_ROOT_DIRECTORY,
        `documents/${unit === 'all' ? 'all-' : ''}fy-reports/`
      );

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true }, (err) => {
          throw new Error(err.message);
        });
      }

      const template = `${uploadPath}/${fileName}-FY-REPORT-${
        context.payments_from
      }-${context.payments_to}-${user.surname}-${
        user.id
      }-${now()}-${moment().format('YYYY-MM-DD-h:mm:ss')}.xlsm`;

      await workbook.xlsx.writeFile(template);
      await res.download(template, 'FINANCIAL-YEAR-REPORT.xlsx', (error) => {
        if (error) {
          throw new Error(error.message);
        }
      });
    } catch (error) {
      http.setError(400, 'Unable To Fetch Report', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * DOWNLOAD ALL PROGRAMME FINANCIAL YEAR DETAIL - STREAM
   *
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async allProgrammeFYReportStream(req, res) {
    try {
      const { payments_from: dateFrom, payments_to: dateTo } = req.body;
      const { user } = req;
      const { Readable } = stream;

      if (!dateFrom || !dateTo) throw new Error(`Invalid Request`);

      if (dateFrom > dateTo) {
        throw new Error(
          `Invalid Context Provided, 'PAYMENT FROM DATE' SHOULD BE LESS OR EQUAL  TO 'PAYMENT TO DATE'`
        );
      }

      const findValidGenerator =
        await studentInvoiceSummaryService.findInvoiceTracker({
          where: {
            activity: 'SUMMARY REPORT',
            date_from: dateFrom,
            date_to: dateTo,
            is_active: true,
            expected_end_date: {
              [Op.gte]: moment().format(),
            },
          },
          raw: true,
        });

      if (findValidGenerator) {
        // await studentInvoiceSummaryService.updateInvoiceTracker(
        //   {
        //     is_active: false,
        //   },
        //   {
        //     activity: 'SUMMARY REPORT',
        //     date_from: dateFrom,
        //     date_to: dateTo,
        //   }
        // );

        throw new Error(
          `The system is currently generating a report for ${dateFrom} - ${dateTo}`
        );
      } else {
        await studentInvoiceSummaryService.createInvoiceTracker({
          activity: 'SUMMARY REPORT',
          date_from: dateFrom,
          date_to: dateTo,
          is_active: true,
          created_by_id: user.id,
          expected_end_date: moment().add('30', 'minutes'),
        });
      }

      const limit = 2000;

      let i = 1;

      const invoiceStream = new Readable({
        async read(size) {
          const result =
            await financialYearReportService.getRangeStudentInvoices(
              moment(dateFrom).format(),
              moment(dateTo).format(),
              i,
              limit,
              user
            );

          i++;
          if (!isEmpty(result)) {
            this.push(JSON.stringify(result));
          } else this.push(null);
        },
      });

      invoiceStream.on('data', async (chunk) => {
        await studentInvoiceSummaryService.bulkCreateInvoiceSummary(
          JSON.parse(chunk)
        );
      });

      invoiceStream.on('end', async () => {
        await studentInvoiceSummaryService.updateInvoiceTracker(
          {
            activity: 'SUMMARY REPORT',
            date_from: dateFrom,
            date_to: dateTo,
            is_active: false,
            end_date: moment().format(),
          },
          {
            activity: 'SUMMARY REPORT',
            date_from: dateFrom,
            date_to: dateTo,
          }
        );
      });

      http.setSuccess(
        200,
        'Report is being generated, Please check again after some minutes'
      );

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Report', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * DOWNLOAD PROGRAMME FINANCIAL YEAR FILE
   *
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async downloadFile(req, res) {
    try {
      const { fileName } = req.params;

      const filePath = path.join(
        appConfig.ASSETS_ROOT_DIRECTORY,
        `documents/all-fy-reports/${fileName}`
      );

      await res.download(filePath, fileName, (error) => {
        if (error) {
          throw new Error(error.message);
        }
      });
    } catch (error) {
      http.setError(400, 'Unable To Fetch Report', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * DELETE PROGRAMME FINANCIAL YEAR FILE
   *
   * @param {*} req
   * @param {*} res
   * @returns
   */
  deleteReportFile(req, res) {
    try {
      const { fileName } = req.params;

      const filePath = path.join(
        appConfig.ASSETS_ROOT_DIRECTORY,
        `documents/all-fy-reports/${fileName}`
      );

      fs.unlink(filePath, (err, data) => {
        if (err) throw new Error('Unable to delete this file');
      });

      http.setSuccess(200, 'Report deleted successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Report', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  // summary report

  async summaryTransactionsReport(req, res) {
    try {
      if (!req.query.payments_from || !req.query.payments_to) {
        throw new Error(`Invalid Request`);
      }

      const context = req.query;

      if (context.payments_from > context.payments_to) {
        throw new Error(
          `Invalid Context Provided, 'PAYMENT FROM DATE' SHOULD BE LESS OR EQUAL  TO 'PAYMENT TO DATE'`
        );
      }

      const checkRange = checkDateRange(
        context.payments_from,
        context.payments_to,
        'months',
        15
      );

      if (checkRange === false) {
        throw new Error(`Date Range(months) Must be Less than/equal to  15`);
      }

      const newContext = await setBillingDateRanges(context);

      const tuition = await transactionsReportService.summaryTuitionBilling(
        newContext
      );

      const functionalFees =
        await transactionsReportService.summaryFunctionalBilling(newContext);

      const otherFees = await transactionsReportService.summaryOthersBilling(
        newContext
      );
      const manualFees = await transactionsReportService.summaryManualBilling(
        newContext
      );

      const resultData = mergeSummaryTransactions(
        tuition,
        functionalFees,
        otherFees,
        manualFees
      );

      const result = collegeAnalysisReport(resultData.result);

      http.setSuccess(200, 'Report fetched successfully', {
        result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Report', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  // fySummaryTransactions
  async fySummaryTransactions(req, res) {
    try {
      if (!req.query.payments_from || !req.query.payments_to) {
        throw new Error(`Invalid Request`);
      }

      const context = req.query;

      const result = await transactionsReportService.fySummaryTransactions(
        context
      );

      http.setSuccess(200, 'Report fetched successfully', {
        result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Report', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  // programmeFyReport

  async programmeFyReport(req, res) {
    try {
      if (
        !req.query.payments_from ||
        !req.query.payments_to ||
        !req.query.unit_id
      ) {
        throw new Error(`Invalid Request`);
      }

      const context = req.query;

      if (context.payments_from > context.payments_to) {
        throw new Error(
          `Invalid Context Provided, 'PAYMENT FROM DATE' SHOULD BE LESS OR EQUAL  TO 'PAYMENT TO DATE'`
        );
      }

      const checkRange = checkDateRange(
        context.payments_from,
        context.payments_to,
        'months',
        15
      );

      if (checkRange === false) {
        throw new Error(`Date Range(months) Must be Less than/equal to  15`);
      }

      context.college_id = req.query.unit_id;

      const newContext = await setBillingDateRanges(context);

      const institutionStructure =
        await institutionStructureService.findInstitutionStructureRecords();

      const institutionStructureUpper = institutionStructure.academic_units.map(
        (e) => toUpper(e)
      );

      let filter = [];

      if (
        institutionStructure &&
        institutionStructureUpper
          .map((element) => element.includes('COL'))
          .includes(true)
      ) {
        filter = await transactionsReportService.programmeFyReport(newContext);
      } else if (
        institutionStructure &&
        (institutionStructureUpper
          .map((element) => element.includes('FAC'))
          .includes(true) ||
          institutionStructureUpper
            .map((element) => element.includes('SCH'))
            .includes(true))
      ) {
        filter = await transactionsReportService.programmeFyReportFaculty(
          newContext
        );
      }

      const result = programmeAnalysisReport(filter);

      http.setSuccess(200, 'Report fetched successfully', {
        result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Report', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
  // student details FY report

  async studentFyReportDetails(req, res) {
    try {
      if (
        !req.query.payments_from ||
        !req.query.payments_to ||
        !req.query.programme_id
      ) {
        throw new Error(`Invalid Request`);
      }

      const context = req.query;

      if (context.payments_from > context.payments_to) {
        throw new Error(
          `Invalid Context Provided, 'PAYMENT FROM DATE' SHOULD BE LESS OR EQUAL  TO 'PAYMENT TO DATE'`
        );
      }

      const checkRange = checkDateRange(
        context.payments_from,
        context.payments_to,
        'months',
        15
      );

      if (checkRange === false) {
        throw new Error(`Date Range(months) Must be Less than/equal to  15`);
      }

      const newContext = await setBillingDateRanges(context);

      const filter = await transactionsReportService.programmeStudentFyReport(
        newContext
      );

      if (isEmpty(filter)) {
        throw new Error(`No Transaction data on the Defined Context`);
      }

      const result = studentAnalysisReport(filter);

      http.setSuccess(200, 'Report fetched successfully', {
        result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Report', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  async downloadProgrammeFyReport(req, res) {
    try {
      if (
        !req.body.payments_from ||
        !req.body.payments_to ||
        !req.body.unit_id
      ) {
        throw new Error(`Invalid Request`);
      }
      const context = req.body;

      if (context.payments_from > context.payments_to) {
        throw new Error(
          `Invalid Context Provided, 'PAYMENT FROM DATE' SHOULD BE LESS OR EQUAL  TO 'PAYMENT TO DATE'`
        );
      }

      const checkRange = checkDateRange(
        context.payments_from,
        context.payments_to,
        'months',
        15
      );

      if (checkRange === false) {
        throw new Error(`Date Range(months) Must be Less than/equal to  15`);
      }

      const newContext = await setBillingDateRanges(context);

      const { user } = req;

      const institutionStructure =
        await institutionStructureService.findInstitutionStructureRecords();

      const institutionStructureUpper = institutionStructure.academic_units.map(
        (e) => toUpper(e)
      );

      let filter = [];

      let collegeData = {};

      let collegeText = {};

      // programmeFyReportFaculty
      if (
        institutionStructure &&
        institutionStructureUpper
          .map((element) => element.includes('COL'))
          .includes(true)
      ) {
        if (req.body.unit_id === 'all') {
          const colleges = await transactionsReportService.universityColleges(
            newContext
          );

          const x = [];

          for (let i = 0; i < colleges.length; i++) {
            newContext.college_id = colleges[i].id;
            const data = await transactionsReportService.programmeFyReport(
              newContext
            );

            x.push(...data);
          }

          filter = x;

          collegeText = '';
        } else {
          newContext.college_id = req.body.unit_id;

          filter = await transactionsReportService.programmeFyReport(
            newContext
          );

          collegeData = await collegeService.findOneCollege({
            where: { id: req.body.unit_id },
            attributes: ['id', 'college_title', 'college_code'],
            raw: true,
          });

          collegeText = `ACADEMIC UNIT : ${collegeData.college_title}(${collegeData.college_code})`;
        }
      } else if (
        institutionStructure &&
        (institutionStructureUpper
          .map((element) => element.includes('FAC'))
          .includes(true) ||
          institutionStructureUpper
            .map((element) => element.includes('SCH'))
            .includes(true))
      ) {
        if (req.body.unit_id === 'all') {
          const faculties = await transactionsReportService.universityFaculties(
            newContext
          );

          const x = [];

          for (let i = 0; i < faculties.length; i++) {
            newContext.college_id = faculties[i].id;
            const data =
              await transactionsReportService.programmeFyReportFaculty(
                newContext
              );

            x.push(...data);
          }

          filter = x;

          collegeText = '';
        } else {
          newContext.college_id = req.body.unit_id;

          filter = await transactionsReportService.programmeFyReportFaculty(
            newContext
          );

          collegeData = await facultyService.findOneFaculty({
            where: { id: req.body.unit_id },
            attributes: ['id', 'faculty_title', 'faculty_code'],
            raw: true,
          });

          collegeText = `ACADEMIC UNIT : ${collegeData.faculty_title}(${collegeData.faculty_code})`;
        }
      }

      if (isEmpty(filter)) {
        throw new Error(`No Transaction data on the Defined Context`);
      }
      const dataFilter = programmeAnalysisReport(filter);

      const { data } = dataFilter.result;

      const workbook = await new ExcelJS.Workbook();
      const enrollmentWorkSheet = workbook.addWorksheet('TRANSACTIONS', {
        headerFooter: {
          firstHeader: 'STUDENT TRANSACTIONS',
          firstFooter: 'STUDENT TRANSACTIONS',
        },
      });

      enrollmentWorkSheet.mergeCells('A1', 'U1');
      enrollmentWorkSheet.mergeCells('A2', 'A3');
      enrollmentWorkSheet.mergeCells('B2', 'E2');

      const titleCell = enrollmentWorkSheet.getCell('A1');

      enrollmentWorkSheet.getRow(1).height = 60;

      titleCell.value = `${
        toUpper(institutionStructure.institution_name) || 'ACMIS'
      }:- TRANSACTION REPORT FOR :${newContext.payments_from} to ${
        newContext.payments_to
      }-ALL CAMPUSES,ALL ACADEMIC UNITS ,All INTAKES`;
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

      const generateDate = moment();

      const generatedDate = generateDate.format('YYYY-MM-DD');

      const dateCell = enrollmentWorkSheet.getCell('A2');

      dateCell.value = `Generate Date${generatedDate}`;
      dateCell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
      };
      dateCell.font = { bold: true, size: 11, name: 'Arial' };

      const unitCell = enrollmentWorkSheet.getCell('B2');

      unitCell.value = `${collegeText}`;
      unitCell.alignment = {
        horizontal: 'left',
        vertical: 'middle',
      };
      unitCell.font = { bold: true, size: 11, name: 'Arial' };

      // enrollmentWorkSheet.getCell('A2').value = `Generate Date${generatedDate}`;

      enrollmentWorkSheet.getRow(2).height = 30;

      const headerRow = enrollmentWorkSheet.getRow(4);

      headerRow.values = map(transactionReportColumns, 'header');
      headerRow.font = { bold: true, size: 11, color: '#2c3e50' };
      enrollmentWorkSheet.columns = transactionReportColumns.map((column) => {
        delete column.header;

        return column;
      });
      enrollmentWorkSheet.getRow(3).height = 40;

      enrollmentWorkSheet.views = [
        {
          state: 'frozen',
          xSplit: 0,
          ySplit: 4,
          topLeftCell: 'G10',
          activeCell: 'A1',
        },
      ];

      const v4 = enrollmentWorkSheet.getCell('V4');
      const w4 = enrollmentWorkSheet.getCell('W4');
      const x4 = enrollmentWorkSheet.getCell('X4');
      const y4 = enrollmentWorkSheet.getCell('Y4');
      const z4 = enrollmentWorkSheet.getCell('Z4');

      v4.font = {
        color: { argb: 'e30022' },
        bold: true,
        size: 12,
      };
      w4.font = {
        color: { argb: 'e30022' },
        bold: true,
        size: 12,
      };
      x4.font = {
        color: { argb: 'e30022' },
        bold: true,
        size: 12,
      };
      y4.font = {
        color: { argb: 'e30022' },
        bold: true,
        size: 12,
      };
      z4.font = {
        color: { argb: 'e30022' },
        bold: true,
        size: 12,
      };
      const templateData = [];

      if (!isEmpty(data)) {
        data.forEach((e) => {
          templateData.push([
            e.programme_code,
            e.invoice_amount,
            e.tuition_paid,
            e.amount_due,
            e.credit_note,
            e.functional.invoice_amount,
            e.functional.functional_paid,
            e.functional.amount_due,
            e.functional.credit_note,
            e.other_fees.invoice_amount,
            e.other_fees.other_fees_paid,
            e.other_fees.amount_due,
            e.other_fees.credit_note,
            e.manual_fees.invoice_amount,
            e.manual_fees.manual_fees_paid,
            e.manual_fees.amount_due,
            e.manual_fees.credit_note,

            e.totalBill,
            e.totalInvoiceAmountPaid,
            e.totalDue,
            e.totalCreditNotes,
            e.tuition_opening_balance,
            e.functional.functional_opening_balance,
            e.other_fees.other_opening_balance,
            e.manual_fees.manual_opening_balance,
            e.totalOpeningBalance,
          ]);
        });
      }

      enrollmentWorkSheet.addRows(templateData);

      const uploadPath = `${process.cwd()}/src/assets/documents/templates`;

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true }, (err) => {
          throw new Error(err.message);
        });
      }

      const template = `${uploadPath}/programme-payments-template-${
        user.surname
      }-${user.other_names}-${user.id}-${now()}.xlsm`;

      await workbook.xlsx.writeFile(template);
      await res.download(template, 'TRANSACTIONS-REPORT.xlsx', (error) => {
        if (error) {
          throw new Error(error.message);
        }
      });
    } catch (error) {
      http.setError(400, 'Unable Download Report', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   *
   *
   * download students
   */
  // download student details

  async downloadStudentFyReport(req, res) {
    try {
      if (
        !req.body.payments_from ||
        !req.body.payments_to ||
        !req.body.programme_id
      ) {
        throw new Error(`Invalid Request`);
      }
      const context = req.body;

      if (context.payments_from > context.payments_to) {
        throw new Error(
          `Invalid Context Provided, 'PAYMENT FROM DATE' SHOULD BE LESS OR EQUAL  TO 'PAYMENT TO DATE'`
        );
      }

      const checkRange = checkDateRange(
        context.payments_from,
        context.payments_to,
        'months',
        15
      );

      if (checkRange === false) {
        throw new Error(`Date Range(months) Must be Less than/equal to  15`);
      }

      const newContext = await setBillingDateRanges(context);

      const { user } = req;

      const institutionStructure =
        await institutionStructureService.findInstitutionStructureRecords();

      const programmeDetail = await ProgrammeService.findOneProgramme({
        where: { id: req.body.programme_id },
      });

      const programmeContext = programmeDetail.dataValues;

      let filter = [];

      if (req.body.unit_id === 'all') {
        filter = [];
      } else {
        filter = await transactionsReportService.programmeStudentFyReport(
          newContext
        );
      }

      if (isEmpty(filter)) {
        throw new Error(`No Transaction data on the Defined Context`);
      }
      const dataFilter = studentAnalysisReport(filter);

      const { data } = dataFilter.result;

      const workbook = await new ExcelJS.Workbook();
      const enrollmentWorkSheet = workbook.addWorksheet('TRANSACTIONS', {
        headerFooter: {
          firstHeader: 'STUDENT TRANSACTIONS',
          firstFooter: 'STUDENT TRANSACTIONS',
        },
      });

      enrollmentWorkSheet.mergeCells('A1', 'AH1');
      enrollmentWorkSheet.mergeCells('A2', 'A3');
      enrollmentWorkSheet.mergeCells('B2', 'E2');

      const titleCell = enrollmentWorkSheet.getCell('A1');

      enrollmentWorkSheet.getRow(1).height = 60;

      titleCell.value = `${
        toUpper(institutionStructure.institution_name) || 'ACMIS'
      }:- PROGRAMME TRANSACTIONS REPORT FOR :${newContext.payments_from} to ${
        newContext.payments_to
      }-(${programmeContext.programme_code})`;
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

      const generateDate = moment();

      const generatedDate = generateDate.format('YYYY-MM-DD');

      const dateCell = enrollmentWorkSheet.getCell('A2');

      dateCell.value = `Generate Date${generatedDate}`;
      dateCell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
      };
      dateCell.font = { bold: true, size: 11, name: 'Arial' };

      const unitCell = enrollmentWorkSheet.getCell('B2');

      unitCell.value = `PROGRAMME: ${programmeContext.programme_title}(${programmeContext.programme_code})`;
      unitCell.alignment = {
        horizontal: 'left',
        vertical: 'middle',
      };
      unitCell.font = { bold: true, size: 11, name: 'Arial' };

      enrollmentWorkSheet.getRow(2).height = 30;

      const headerRow = enrollmentWorkSheet.getRow(4);

      headerRow.values = map(studentsFyReportColumns, 'header');
      headerRow.font = { bold: true, size: 11, color: '#2c3e50' };
      enrollmentWorkSheet.columns = studentsFyReportColumns.map((column) => {
        delete column.header;

        return column;
      });
      enrollmentWorkSheet.getRow(3).height = 40;

      enrollmentWorkSheet.views = [
        {
          state: 'frozen',
          xSplit: 0,
          ySplit: 4,
          topLeftCell: 'G10',
          activeCell: 'A1',
        },
      ];

      const v4 = enrollmentWorkSheet.getCell('AA4');
      const w4 = enrollmentWorkSheet.getCell('AB4');
      const x4 = enrollmentWorkSheet.getCell('AC4');
      const y4 = enrollmentWorkSheet.getCell('AD4');
      const z4 = enrollmentWorkSheet.getCell('AE4');

      v4.font = {
        color: { argb: 'e30022' },
        bold: true,
        size: 12,
      };
      w4.font = {
        color: { argb: 'e30022' },
        bold: true,
        size: 12,
      };
      x4.font = {
        color: { argb: 'e30022' },
        bold: true,
        size: 12,
      };
      y4.font = {
        color: { argb: 'e30022' },
        bold: true,
        size: 12,
      };
      z4.font = {
        color: { argb: 'e30022' },
        bold: true,
        size: 12,
      };
      const templateData = [];

      if (!isEmpty(data)) {
        data.forEach((e) => {
          templateData.push([
            e.surname,
            e.other_names,
            e.student_number,
            e.registration_number,
            e.gender,
            e.nationality,
            e.invoice_amount,
            e.tuition_paid,
            e.amount_due,
            e.credit_note,
            e.functional.invoice_amount,
            e.functional.functional_paid,
            e.functional.amount_due,
            e.functional.credit_note,
            e.other_fees.invoice_amount,
            e.other_fees.other_fees_paid,
            e.other_fees.amount_due,
            e.other_fees.credit_note,
            e.manual_fees.invoice_amount,
            e.manual_fees.manual_fees_paid,
            e.manual_fees.amount_due,
            e.manual_fees.credit_note,

            e.totalBill,
            e.totalInvoiceAmountPaid,
            e.totalDue,
            e.totalCreditNotes,
            e.tuition_opening_balance,
            e.functional.functional_opening_balance,
            e.other_fees.other_opening_balance,
            e.manual_fees.manual_opening_balance,
            e.totalOpeningBalance,
            e.sponsorship,
            e.sponsor_name,
            e.fees_waiver,
          ]);
        });
      }

      enrollmentWorkSheet.addRows(templateData);

      const uploadPath = `${process.cwd()}/src/assets/documents/templates`;

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true }, (err) => {
          throw new Error(err.message);
        });
      }

      const template = `${uploadPath}/programme-payments-template-${
        user.surname
      }-${user.other_names}-${user.id}-${now()}.xlsm`;

      await workbook.xlsx.writeFile(template);
      await res.download(template, 'TRANSACTIONS-REPORT.xlsx', (error) => {
        if (error) {
          throw new Error(error.message);
        }
      });
    } catch (error) {
      http.setError(400, 'Unable Download Report', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

module.exports = FinancialReportController;

const mergeTransactions = function (tuition, functional, studentPayments) {
  const unmatchedFunctionalContext = [];

  tuition.forEach((manualInvoice) => {
    const findContextInAuto = functional.find(
      (invoice) =>
        manualInvoice.programme_code === invoice.programme_code &&
        manualInvoice.programme_title === invoice.programme_title
    );

    if (!findContextInAuto) {
      unmatchedFunctionalContext.push({
        programme_code: manualInvoice.programme_code,
        programme_title: manualInvoice.programme_title,
        invoice_amount: 0,
        amount_paid: 0,
        amount_due: 0,
        credit_note: 0,
        exempted_amount: 0,
        functional: manualInvoice,
      });
    }
  });

  const newReport = tuition.map((invoice) => {
    const functionalObj = functional.find(
      (context) =>
        context.programme_title === invoice.programme_title &&
        context.programme_code === invoice.programme_code
    );

    return {
      ...invoice,
      functional: functionalObj || {
        invoice_amount: 0,
        amount_paid: 0,
        amount_due: 0,
        credit_note: 0,
        exempted_amount: 0,
      },
    };
  });

  const filter = newReport.concat(unmatchedFunctionalContext);

  // payments

  const unmatchedPaymentsContext = [];

  studentPayments.forEach((i) => {
    const findContextPayments = filter.find(
      (inv) =>
        i.programme_code === inv.programme_code &&
        i.programme_title === inv.programme_title
    );

    if (!findContextPayments) {
      unmatchedPaymentsContext.push({
        programme_code: i.programme_code,
        programme_title: i.programme_title,
        invoice_amount: 0,
        amount_paid: 0,
        amount_due: 0,
        credit_note: 0,
        exempted_amount: 0,
        functional: {
          programme_code: i.programme_code,
          programme_title: i.programme_title,
          invoice_amount: 0,
          amount_paid: 0,
          amount_due: 0,
          credit_note: 0,
          exempted_amount: 0,
        },
        payments: i,
      });
    }
  });

  const newReport2 = filter.map((invoice) => {
    const paymentsObj = studentPayments.find(
      (context) =>
        context.programme_title === invoice.programme_title &&
        context.programme_code === invoice.programme_code
    );

    return {
      ...invoice,
      payments: paymentsObj || {
        trans_amount: 0,
        unallocated_amount: 0,
      },
    };
  });

  const result = newReport2.concat(unmatchedPaymentsContext);

  return {
    result,
  };
};

// analysis

const analysisReport = function (data) {
  data.forEach((i) => {
    i.tuition_paid = Number(i.amount_paid) - Number(i.credit_note);

    i.payments.allocatedAmount =
      Number(i.payments.trans_amount) - Number(i.payments.unallocated_amount);
    i.functional.functional_paid =
      Number(i.functional.amount_paid) - Number(i.functional.credit_note);

    // totals
    i.payments.totalBill =
      Number(i.functional.invoice_amount) + Number(i.invoice_amount);
    i.payments.totalDue =
      Number(i.functional.amount_due) + Number(i.amount_due);
    i.payments.totalCreditNotes =
      Number(i.functional.credit_note) + Number(i.credit_note);
    i.payments.totalInvoiceAmountPaid =
      Number(i.functional.functional_paid) + Number(i.tuition_paid);
  });

  return {
    data,
  };
};

// college reporting

const mergeSummaryTransactions = function (
  tuition,
  functional,
  otherFees,
  manualFees
) {
  const unmatchedFunctionalContext = [];

  tuition.forEach((manualInvoice) => {
    const findContextInAuto = functional.find(
      (invoice) =>
        manualInvoice.academic_unit_code === invoice.academic_unit_code &&
        manualInvoice.academic_unit_title === invoice.academic_unit_title
    );

    if (!findContextInAuto) {
      unmatchedFunctionalContext.push({
        academic_unit_code: manualInvoice.academic_unit_code,
        academic_unit_title: manualInvoice.academic_unit_title,
        invoice_amount: 0,
        amount_paid: 0,
        amount_due: 0,
        credit_note: 0,
        exempted_amount: 0,
        tuition_opening_balance: 0,
        functional: manualInvoice,
      });
    }
  });

  const newReport = tuition.map((invoice) => {
    const functionalObj = functional.find(
      (context) =>
        context.academic_unit_title === invoice.academic_unit_title &&
        context.academic_unit_code === invoice.academic_unit_code
    );

    return {
      ...invoice,
      functional: functionalObj || {
        invoice_amount: 0,
        amount_paid: 0,
        amount_due: 0,
        credit_note: 0,
        exempted_amount: 0,
        functional_opening_balance: 0,
      },
    };
  });

  const filter = newReport.concat(unmatchedFunctionalContext);

  // other

  const unmatchedOtherContext = [];

  otherFees.forEach((i) => {
    const findContextOther = filter.find(
      (invoice) =>
        i.academic_unit_code === invoice.academic_unit_code &&
        i.academic_unit_title === invoice.academic_unit_title
    );

    if (!findContextOther) {
      unmatchedOtherContext.push({
        academic_unit_code: i.academic_unit_code,
        academic_unit_title: i.academic_unit_title,
        invoice_amount: 0,
        amount_paid: 0,
        amount_due: 0,
        credit_note: 0,
        exempted_amount: 0,
        tuition_opening_balance: 0,
        functional: {
          academic_unit_code: i.academic_unit_code,
          academic_unit_title: i.academic_unit_title,
          invoice_amount: 0,
          amount_paid: 0,
          amount_due: 0,
          credit_note: 0,
          exempted_amount: 0,
          functional_opening_balance: 0,
        },
        otherFees: i,
      });
    }
  });

  const newReport2 = filter.map((invoice) => {
    const otherObj = otherFees.find(
      (context) =>
        context.academic_unit_title === invoice.academic_unit_title &&
        context.academic_unit_code === invoice.academic_unit_code
    );

    return {
      ...invoice,
      otherFees: otherObj || {
        invoice_amount: 0,
        amount_paid: 0,
        amount_due: 0,
        credit_note: 0,
        exempted_amount: 0,
        other_opening_balance: 0,
      },
    };
  });

  const filter2 = newReport2.concat(unmatchedOtherContext);

  // manual invoices

  const unmatchedManualContext = [];

  manualFees.forEach((i) => {
    const findContextOther = filter2.find(
      (invoice) =>
        i.academic_unit_code === invoice.academic_unit_code &&
        i.academic_unit_title === invoice.academic_unit_title
    );

    if (!findContextOther) {
      unmatchedManualContext.push({
        academic_unit_code: i.academic_unit_code,
        academic_unit_title: i.academic_unit_title,
        invoice_amount: 0,
        amount_paid: 0,
        amount_due: 0,
        credit_note: 0,
        exempted_amount: 0,
        tuition_opening_balance: 0,
        functional: {
          academic_unit_code: i.academic_unit_code,
          academic_unit_title: i.academic_unit_title,
          invoice_amount: 0,
          amount_paid: 0,
          amount_due: 0,
          credit_note: 0,
          exempted_amount: 0,
          functional_opening_balance: 0,
        },
        otherFees: {
          academic_unit_code: i.academic_unit_code,
          academic_unit_title: i.academic_unit_title,
          invoice_amount: 0,
          amount_paid: 0,
          amount_due: 0,
          credit_note: 0,
          exempted_amount: 0,
          other_opening_balance: 0,
        },
        manualFees: i,
      });
    }
  });

  const newReport3 = filter2.map((invoice) => {
    const manualObj = manualFees.find(
      (context) =>
        context.academic_unit_title === invoice.academic_unit_title &&
        context.academic_unit_code === invoice.academic_unit_code
    );

    return {
      ...invoice,
      manualFees: manualObj || {
        invoice_amount: 0,
        amount_paid: 0,
        amount_due: 0,
        credit_note: 0,
        exempted_amount: 0,
        manual_opening_balance: 0,
      },
    };
  });

  const result = newReport3.concat(unmatchedManualContext);

  // tuitionOpeningBal ...

  return {
    result,
  };
};

// analysis

const collegeAnalysisReport = function (data) {
  data.forEach((i) => {
    i.tuition_paid = Number(i.amount_paid) - Number(i.credit_note);
    i.functional.functional_paid =
      Number(i.functional.amount_paid) - Number(i.functional.credit_note);

    i.otherFees.other_fees_paid =
      Number(i.otherFees.amount_paid) - Number(i.otherFees.credit_note);

    i.manualFees.manual_fees_paid =
      Number(i.manualFees.amount_paid) - Number(i.manualFees.credit_note);

    // totals
    i.totalBill =
      Number(i.functional.invoice_amount) +
      Number(i.invoice_amount) +
      Number(i.manualFees.invoice_amount);
    Number(i.otherFees.invoice_amount);
    i.totalDue =
      Number(i.functional.amount_due) +
      Number(i.amount_due) +
      Number(i.manualFees.amount_due) +
      Number(i.otherFees.amount_due);
    i.totalCreditNotes =
      Number(i.functional.credit_note) +
      Number(i.credit_note) +
      Number(i.otherFees.credit_note) +
      Number(i.manualFees.credit_note);

    i.totalOpeningBalance =
      i.tuition_opening_balance +
      i.otherFees.other_opening_balance +
      i.functional.functional_opening_balance +
      i.manualFees.manual_opening_balance;
  });

  data.forEach((i) => {
    i.totalInvoiceAmountPaid =
      Number(i.functional.functional_paid) +
      Number(i.otherFees.other_fees_paid) +
      Number(i.manualFees.manual_fees_paid) +
      Number(i.tuition_paid);
  });

  // tuition

  const tuitionTotalBill = sumBy(data, (item) => Number(item.invoice_amount));
  const tuitionTotalDue = sumBy(data, (item) => Number(item.amount_due));
  const tuitionTotalPaid = sumBy(data, (item) => Number(item.tuition_paid));
  const tuitionTotalCreditNotes = sumBy(data, (item) =>
    Number(item.credit_note)
  );

  const totalTuitionOpeningBalance = sumBy(
    data,
    (item) => item.tuition_opening_balance
  );

  // functional
  const functionalTotalBill = sumBy(data, (item) =>
    Number(item.functional.invoice_amount)
  );
  const functionalTotalDue = sumBy(data, (item) =>
    Number(item.functional.amount_due)
  );
  const functionalTotalPaid = sumBy(data, (item) =>
    Number(item.functional.functional_paid)
  );
  const functionalTotalCreditNotes = sumBy(data, (item) =>
    Number(item.functional.credit_note)
  );
  const totalFunctionalOpeningBalance = sumBy(
    data,
    (item) => item.functional.functional_opening_balance
  );

  // other fees

  const otherFeesTotalBill = sumBy(data, (item) =>
    Number(item.otherFees.invoice_amount)
  );
  const otherFeesTotalDue = sumBy(data, (item) =>
    Number(item.otherFees.amount_due)
  );
  const otherFeesTotalPaid = sumBy(data, (item) =>
    Number(item.otherFees.other_fees_paid)
  );
  const otherFeesTotalCreditNotes = sumBy(data, (item) =>
    Number(item.otherFees.credit_note)
  );
  const totalOtherOpeningBalance = sumBy(
    data,
    (item) => item.otherFees.other_opening_balance
  );

  // manualFees

  const manualTotalBill = sumBy(data, (item) =>
    Number(item.manualFees.invoice_amount)
  );
  const manualTotalDue = sumBy(data, (item) =>
    Number(item.manualFees.amount_due)
  );
  const manualTotalPaid = sumBy(data, (item) =>
    Number(item.manualFees.manual_fees_paid)
  );
  const manualTotalCreditNotes = sumBy(data, (item) =>
    Number(item.manualFees.credit_note)
  );
  const totalManualOpeningBalance = sumBy(data, (item) =>
    Number(item.manualFees.manual_opening_balance)
  );

  // total
  const totalBill = sumBy(data, (item) => Number(item.totalBill));
  const totalDue = sumBy(data, (item) => Number(item.totalDue));
  const totalCreditNotes = sumBy(data, (item) => Number(item.totalCreditNotes));

  const totalAmountPaid = sumBy(data, (item) =>
    Number(item.totalInvoiceAmountPaid)
  );

  const totalOpeningBalance =
    totalManualOpeningBalance +
    totalOtherOpeningBalance +
    totalFunctionalOpeningBalance +
    totalTuitionOpeningBalance;

  const summary = {
    tuition: {
      totalBill: tuitionTotalBill,
      totalPaid: tuitionTotalPaid,
      totalDue: tuitionTotalDue,
      totalCreditNotes: tuitionTotalCreditNotes,
      openingBalance: totalTuitionOpeningBalance,
    },
    functional: {
      totalBill: functionalTotalBill,
      totalPaid: functionalTotalPaid,
      totalDue: functionalTotalDue,
      totalCreditNotes: functionalTotalCreditNotes,
      openingBalance: totalFunctionalOpeningBalance,
    },
    otherFees: {
      totalBill: otherFeesTotalBill,
      totalPaid: otherFeesTotalPaid,
      totalDue: otherFeesTotalDue,
      totalCreditNotes: otherFeesTotalCreditNotes,
      openingBalance: totalOtherOpeningBalance,
    },
    manualFees: {
      totalBill: manualTotalBill,
      totalPaid: manualTotalPaid,
      totalDue: manualTotalDue,
      totalCreditNotes: manualTotalCreditNotes,
      openingBalance: totalManualOpeningBalance,
    },
    totalBill,
    totalDue,
    totalCreditNotes,
    totalAmountPaid,
    totalOpeningBalance,
  };

  const result = { summary, data };

  return {
    result,
  };
};

//

const programmeAnalysisReport = function (data) {
  data.forEach((i) => {
    i.tuition_paid = Number(i.amount_paid) - Number(i.credit_note);
    i.functional.functional_paid =
      Number(i.functional.amount_paid) - Number(i.functional.credit_note);

    i.other_fees.other_fees_paid =
      Number(i.other_fees.amount_paid) - Number(i.other_fees.credit_note);

    i.manual_fees.manual_fees_paid =
      Number(i.manual_fees.amount_paid) - Number(i.manual_fees.credit_note);

    // totals
    i.totalBill =
      Number(i.functional.invoice_amount) +
      Number(i.invoice_amount) +
      Number(i.manual_fees.invoice_amount);
    Number(i.other_fees.invoice_amount);
    i.totalDue =
      Number(i.functional.amount_due) +
      Number(i.amount_due) +
      Number(i.manual_fees.amount_due) +
      Number(i.other_fees.amount_due);
    i.totalCreditNotes =
      Number(i.functional.credit_note) +
      Number(i.credit_note) +
      Number(i.other_fees.credit_note) +
      Number(i.manual_fees.credit_note);

    i.totalOpeningBalance =
      i.tuition_opening_balance +
      i.other_fees.other_opening_balance +
      i.functional.functional_opening_balance +
      i.manual_fees.manual_opening_balance;
  });

  data.forEach((i) => {
    i.totalInvoiceAmountPaid =
      Number(i.functional.functional_paid) +
      Number(i.other_fees.other_fees_paid) +
      Number(i.manual_fees.manual_fees_paid) +
      Number(i.tuition_paid);
  });

  // tuition

  const tuitionTotalBill = sumBy(data, (item) => Number(item.invoice_amount));
  const tuitionTotalDue = sumBy(data, (item) => Number(item.amount_due));
  const tuitionTotalPaid = sumBy(data, (item) => Number(item.tuition_paid));
  const tuitionTotalCreditNotes = sumBy(data, (item) =>
    Number(item.credit_note)
  );

  const totalTuitionOpeningBalance = sumBy(
    data,
    (item) => item.tuition_opening_balance
  );

  // functional
  const functionalTotalBill = sumBy(data, (item) =>
    Number(item.functional.invoice_amount)
  );
  const functionalTotalDue = sumBy(data, (item) =>
    Number(item.functional.amount_due)
  );
  const functionalTotalPaid = sumBy(data, (item) =>
    Number(item.functional.functional_paid)
  );
  const functionalTotalCreditNotes = sumBy(data, (item) =>
    Number(item.functional.credit_note)
  );

  const totalFunctionalOpeningBalance = sumBy(
    data,
    (item) => item.functional.functional_opening_balance
  );

  // other fees

  const otherFeesTotalBill = sumBy(data, (item) =>
    Number(item.other_fees.invoice_amount)
  );
  const otherFeesTotalDue = sumBy(data, (item) =>
    Number(item.other_fees.amount_due)
  );
  const otherFeesTotalPaid = sumBy(data, (item) =>
    Number(item.other_fees.other_fees_paid)
  );
  const otherFeesTotalCreditNotes = sumBy(data, (item) =>
    Number(item.other_fees.credit_note)
  );

  const totalOtherOpeningBalance = sumBy(
    data,
    (item) => item.other_fees.other_opening_balance
  );

  // manualFees

  const manualTotalBill = sumBy(data, (item) =>
    Number(item.manual_fees.invoice_amount)
  );
  const manualTotalDue = sumBy(data, (item) =>
    Number(item.manual_fees.amount_due)
  );
  const manualTotalPaid = sumBy(data, (item) =>
    Number(item.manual_fees.manual_fees_paid)
  );
  const manualTotalCreditNotes = sumBy(data, (item) =>
    Number(item.manual_fees.credit_note)
  );

  const totalManualOpeningBalance = sumBy(data, (item) =>
    Number(item.manual_fees.manual_opening_balance)
  );

  // total
  const totalBill = sumBy(data, (item) => Number(item.totalBill));
  const totalDue = sumBy(data, (item) => Number(item.totalDue));
  const totalCreditNotes = sumBy(data, (item) => Number(item.totalCreditNotes));

  const totalAmountPaid = sumBy(data, (item) =>
    Number(item.totalInvoiceAmountPaid)
  );

  const totalOpeningBalance =
    totalManualOpeningBalance +
    totalOtherOpeningBalance +
    totalFunctionalOpeningBalance +
    totalTuitionOpeningBalance;

  const summary = {
    tuition: {
      totalBill: tuitionTotalBill,
      totalPaid: tuitionTotalPaid,
      totalDue: tuitionTotalDue,
      totalCreditNotes: tuitionTotalCreditNotes,
      totalTuitionOpeningBalance,
    },
    functional: {
      totalBill: functionalTotalBill,
      totalPaid: functionalTotalPaid,
      totalDue: functionalTotalDue,
      totalCreditNotes: functionalTotalCreditNotes,
      totalFunctionalOpeningBalance,
    },
    otherFees: {
      totalBill: otherFeesTotalBill,
      totalPaid: otherFeesTotalPaid,
      totalDue: otherFeesTotalDue,
      totalCreditNotes: otherFeesTotalCreditNotes,
      totalOtherOpeningBalance,
    },
    manualFees: {
      totalBill: manualTotalBill,
      totalPaid: manualTotalPaid,
      totalDue: manualTotalDue,
      totalCreditNotes: manualTotalCreditNotes,
      totalManualOpeningBalance,
    },
    totalBill,
    totalDue,
    totalCreditNotes,
    totalAmountPaid,
    totalOpeningBalance,
  };

  const result = { summary, data };

  return {
    result,
  };
};

// student Analysis

const studentAnalysisReport = function (data) {
  data.forEach((i) => {
    i.tuition_paid = Number(i.amount_paid) - Number(i.credit_note);
    i.functional.functional_paid =
      Number(i.functional.amount_paid) - Number(i.functional.credit_note);

    i.other_fees.other_fees_paid =
      Number(i.other_fees.amount_paid) - Number(i.other_fees.credit_note);

    i.manual_fees.manual_fees_paid =
      Number(i.manual_fees.amount_paid) - Number(i.manual_fees.credit_note);

    // totals
    i.totalBill =
      Number(i.functional.invoice_amount) +
      Number(i.invoice_amount) +
      Number(i.manual_fees.invoice_amount);
    Number(i.other_fees.invoice_amount);
    i.totalDue =
      Number(i.functional.amount_due) +
      Number(i.amount_due) +
      Number(i.manual_fees.amount_due) +
      Number(i.other_fees.amount_due);
    i.totalCreditNotes =
      Number(i.functional.credit_note) +
      Number(i.credit_note) +
      Number(i.other_fees.credit_note) +
      Number(i.manual_fees.credit_note);

    i.totalOpeningBalance =
      i.tuition_opening_balance +
      i.other_fees.other_opening_balance +
      i.functional.functional_opening_balance +
      i.manual_fees.manual_opening_balance;
  });

  data.forEach((i) => {
    i.totalInvoiceAmountPaid =
      Number(i.functional.functional_paid) +
      Number(i.other_fees.other_fees_paid) +
      Number(i.manual_fees.manual_fees_paid) +
      Number(i.tuition_paid);
  });

  // tuition

  const tuitionTotalBill = sumBy(data, (item) => Number(item.invoice_amount));
  const tuitionTotalDue = sumBy(data, (item) => Number(item.amount_due));
  const tuitionTotalPaid = sumBy(data, (item) => Number(item.tuition_paid));
  const tuitionTotalCreditNotes = sumBy(data, (item) =>
    Number(item.credit_note)
  );

  const totalTuitionOpeningBalance = sumBy(
    data,
    (item) => item.tuition_opening_balance
  );

  // functional
  const functionalTotalBill = sumBy(data, (item) =>
    Number(item.functional.invoice_amount)
  );
  const functionalTotalDue = sumBy(data, (item) =>
    Number(item.functional.amount_due)
  );
  const functionalTotalPaid = sumBy(data, (item) =>
    Number(item.functional.functional_paid)
  );
  const functionalTotalCreditNotes = sumBy(data, (item) =>
    Number(item.functional.credit_note)
  );

  const totalFunctionalOpeningBalance = sumBy(
    data,
    (item) => item.functional.functional_opening_balance
  );

  // other fees

  const otherFeesTotalBill = sumBy(data, (item) =>
    Number(item.other_fees.invoice_amount)
  );
  const otherFeesTotalDue = sumBy(data, (item) =>
    Number(item.other_fees.amount_due)
  );
  const otherFeesTotalPaid = sumBy(data, (item) =>
    Number(item.other_fees.other_fees_paid)
  );
  const otherFeesTotalCreditNotes = sumBy(data, (item) =>
    Number(item.other_fees.credit_note)
  );

  const totalOtherOpeningBalance = sumBy(
    data,
    (item) => item.other_fees.other_opening_balance
  );

  // manualFees

  const manualTotalBill = sumBy(data, (item) =>
    Number(item.manual_fees.invoice_amount)
  );
  const manualTotalDue = sumBy(data, (item) =>
    Number(item.manual_fees.amount_due)
  );
  const manualTotalPaid = sumBy(data, (item) =>
    Number(item.manual_fees.manual_fees_paid)
  );
  const manualTotalCreditNotes = sumBy(data, (item) =>
    Number(item.manual_fees.credit_note)
  );

  const totalManualOpeningBalance = sumBy(data, (item) =>
    Number(item.manual_fees.manual_opening_balance)
  );

  // total
  const totalBill = sumBy(data, (item) => Number(item.totalBill));
  const totalDue = sumBy(data, (item) => Number(item.totalDue));
  const totalCreditNotes = sumBy(data, (item) => Number(item.totalCreditNotes));

  const totalAmountPaid = sumBy(data, (item) =>
    Number(item.totalInvoiceAmountPaid)
  );

  const totalOpeningBalance =
    totalManualOpeningBalance +
    totalOtherOpeningBalance +
    totalFunctionalOpeningBalance +
    totalTuitionOpeningBalance;

  const summary = {
    tuition: {
      totalBill: tuitionTotalBill,
      totalPaid: tuitionTotalPaid,
      totalDue: tuitionTotalDue,
      totalCreditNotes: tuitionTotalCreditNotes,
      totalTuitionOpeningBalance,
    },
    functional: {
      totalBill: functionalTotalBill,
      totalPaid: functionalTotalPaid,
      totalDue: functionalTotalDue,
      totalCreditNotes: functionalTotalCreditNotes,
      totalFunctionalOpeningBalance,
    },
    otherFees: {
      totalBill: otherFeesTotalBill,
      totalPaid: otherFeesTotalPaid,
      totalDue: otherFeesTotalDue,
      totalCreditNotes: otherFeesTotalCreditNotes,
      totalOtherOpeningBalance,
    },
    manualFees: {
      totalBill: manualTotalBill,
      totalPaid: manualTotalPaid,
      totalDue: manualTotalDue,
      totalCreditNotes: manualTotalCreditNotes,
      totalManualOpeningBalance,
    },
    totalBill,
    totalDue,
    totalCreditNotes,
    totalAmountPaid,
    totalOpeningBalance,
  };

  const result = { summary, data };

  return {
    result,
  };
};

// set date ranges

const setBillingDateRanges = function (context) {
  const paymentsTO = new Date(context.payments_to);
  const paymentsFrom = new Date(context.payments_from);

  const years = (paymentsTO.getFullYear() - paymentsFrom.getFullYear()) * 12;
  const months = years - paymentsFrom.getMonth();
  const months2 = months + paymentsTO.getMonth();

  const formatPrevMonth = new Date(
    paymentsFrom.setMonth(paymentsFrom.getMonth() - months2)
  );

  const day = formatPrevMonth.getDate();
  const openingMonth = formatPrevMonth.getMonth();
  const openingYear = formatPrevMonth.getFullYear();
  const openingBalDate = `${openingYear}-${openingMonth}-${day}`;

  const openBalFromDate = new Date(context.payments_from);

  const openingDate = new Date(
    openBalFromDate.getTime() - 1 * 24 * 60 * 60 * 1000
  );

  const xDay = openingDate.getDate();
  const xMonth = openingDate.getMonth() + 1;
  const xYear = openingDate.getFullYear();

  const openingBalDateTo = `${xYear}-${xMonth}-${xDay}`;

  context.openingBalDate = openingBalDate;
  context.openingBalDateTo = openingBalDateTo;

  return {
    ...context,
  };
};
