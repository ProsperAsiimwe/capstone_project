// assignmentsByLecturerFunction
const { HttpResponse } = require('@helpers');
const {
  reportsUniPayService,
  institutionStructureService,
  BiReportService,
} = require('@services/index');
const { isEmpty, toUpper, now, map, sumBy, chain } = require('lodash');
const excelJs = require('exceljs');
const fs = require('fs');
const {
  handleAllTransactionReports,
  bankPaymentsReport,
  academicUnitDatePayments,
  revenuePerItemReport,
} = require('../Helpers/reportsHelper');
const { allTransactionReportColumns } = require('./templateColumns');
const http = new HttpResponse();

class ReportsUniPayController {
  // UNIVERSAL PAYMENT REPORT,

  async reportsUniPayFunction(req, res) {
    const context = req.query;

    try {
      if (
        !context.payments_from ||
        !context.payments_to ||
        !context.transaction_category ||
        !context.report_category
      ) {
        throw new Error('Invalid Context Provided');
      }

      let data = [];

      if (context.report_category === 'BANK') {
        data = await bankPaymentsReport(context);
      } else if (
        context.report_category === 'DETAILED' ||
        context.report_category === 'SUMMARY'
      ) {
        data = await handleAllTransactionReports(context);
      } else if (context.report_category === 'UNITS') {
        data = await academicUnitDatePayments(context);
      } else if (context.report_category === 'REVENUE') {
        data = await revenuePerItemReport(context);
      } else {
        throw new Error('Invalid Context Provided');
      }

      http.setSuccess(
        200,
        `Payment Transaction '${context.report_category}' REPORT for ${context.transaction_category} PAYMENTS  fetched successfully`,
        {
          data,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        `Unable To Fetch  Payment Transaction '${context.report_category}' REPORT for ${context.transaction_category} PAYMENTS`,
        {
          error: { message: error.message },
        }
      );

      return http.send(res);
    }
  }

  // daily weekly monthly reports

  async summaryReport(req, res) {
    const context = req.query;

    try {
      if (!context.duration) {
        throw new Error('Invalid Context Provided');
      }
      let data = {};

      if (context.duration === 'daily') {
        data = await reportsUniPayService.dailyReport(context);

        Object.keys(data).forEach(function (key) {
          if (data[key] === null) {
            data[key] = 0;
          }
        });
      } else if (context.duration === 'weekly') {
        data = await reportsUniPayService.weeklyReport(context);
        Object.keys(data).forEach(function (key) {
          if (data[key] === null) {
            data[key] = 0;
          }
        });
      } else if (context.duration === 'monthly') {
        data = await reportsUniPayService.monthlyReports(context);
        Object.keys(data).forEach(function (key) {
          if (data[key] === null) {
            data[key] = 0;
          }
        });
      }

      http.setSuccess(
        200,
        `${context.duration} Payment Transaction REPORT PAYMENTS  fetched successfully`,
        {
          data,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        `Unable To Fetch  ${context.duration} Payment Transaction REPORT`,
        {
          error: { message: error.message },
        }
      );

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   */
  async downloadDetailedReport(req, res) {
    try {
      const { user } = req;
      const context = req.query;

      if (
        !context.payments_from ||
        !context.payments_to ||
        !context.transaction_category ||
        !context.report_category
      ) {
        throw new Error('Invalid Context Provided');
      }

      const data = await handleAllTransactionReports(context);

      if (isEmpty(data)) {
        throw new Error(
          `No Payments Transaction Records Available Within Range.`
        );
      }

      data.forEach((i) => {
        if (i.student_status === 'Bulk') {
          i.category = 'Sponsor';
        } else {
          i.category = i.student_status;
        }
      });

      const totalAmount = sumBy(data, 'amount');

      const institutionStructure =
        await institutionStructureService.findInstitutionStructureRecords({
          attributes: ['institution_name', 'institution_logo'],
        });

      if (!institutionStructure) {
        throw new Error('Unable To Find Institution Structure.');
      }

      const workbook = new excelJs.Workbook();
      const rootSheet = workbook.addWorksheet('PAYMENT TRANSACTIONS REPORT');

      rootSheet.mergeCells('A1', 'I3');
      // rootSheet.mergeCells('A1', 'B2');
      const titleCell = rootSheet.getCell('C1');

      rootSheet.getRow(1).height = 65;

      titleCell.value = `${
        institutionStructure.institution_name || 'TERP'
      } \n PAYMENT TRANSACTION ${context.report_category} REPORT FOR ${
        context.transaction_category
      } PAYMENTS \n FROM ${context.payments_from} TO ${
        context.payments_to
      } \n TOTAL TRANSACTION AMOUNT: ${totalAmount.toLocaleString()} ${'UGX'}`;

      titleCell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
      };

      titleCell.font = { bold: true, size: 10, name: 'Arial' };

      const headerRow = rootSheet.getRow(3);

      headerRow.values = map(allTransactionReportColumns, 'header');
      headerRow.font = { bold: true, size: 11, color: '#2c3e50' };
      rootSheet.columns = allTransactionReportColumns.map((column) => {
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

      if (!isEmpty(data)) {
        data.forEach((transaction) => {
          templateData.push([
            transaction.full_name,
            transaction.phone_number,
            transaction.email,
            transaction.ura_prn,
            `${parseInt(transaction.amount, 10).toLocaleString()} ${
              transaction.currency || 'UGX'
            }`,
            toUpper(transaction.bank),
            toUpper(transaction.branch),
            transaction.payment_date,
            transaction.category,
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

      const template = `${uploadPath}/all-transactions-report-${user.surname}-${
        user.other_names
      }-${user.id}-${now()}.xlsm`;

      await workbook.xlsx.writeFile(template);
      await res.download(
        template,
        `${context.report_category} ${context.transaction_category} PAYMENT TRANSACTIONS REPORT.xlsx`,
        (error) => {
          if (error) {
            throw new Error(error.message);
          }
        }
      );
    } catch (error) {
      http.setError(400, 'Unable To Download Template.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  // monthly collections

  async monthlyCollection(req, res) {
    const context = req.query;

    try {
      const result = await BiReportService.monthlyCollections();

      Object.keys(result).forEach((key) => {
        if (result[key] === null) {
          result[key] = [];
        }
      });

      const mergedElements = [
        ...result.student_transactions,
        ...result.applicants,
        ...result.universal_payments,
      ];

      const report = chain(mergedElements)
        .groupBy('months')
        .map((obj, key) => ({
          months: key,
          total: sumBy(obj, 'total'),
        }))
        .value();

      const data = { report, result };

      http.setSuccess(200, ` Payment Report fetched successfully`, {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        `Unable To Fetch  ${context.duration} Payment Report`,
        {
          error: { message: error.message },
        }
      );

      return http.send(res);
    }
  }
}

module.exports = ReportsUniPayController;
