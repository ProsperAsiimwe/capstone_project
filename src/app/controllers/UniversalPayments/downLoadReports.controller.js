// allUniversalPay

const { HttpResponse } = require('@helpers');
const {
  reportsChartOfAccountService,
  institutionStructureService,
} = require('@services');
const http = new HttpResponse();
const { isEmpty, map, toUpper, now, forEach } = require('lodash');
const {
  allUniversalTransactionsColumns,
  accountSummaryColumns,
} = require('./templateColumns');
const { summaryChartOfAccountReport } = require('../Helpers/reportsHelper');
const excelJs = require('exceljs');
const fs = require('fs');

class DownLoadReportsController {
  async downloadAllUniversalPayments(req, res) {
    try {
      const { user } = req;
      const context = req.query;

      if (!context.payments_from || !context.payments_to) {
        throw new Error('Invalid Context Provided');
      }

      if (context.payments_from > context.payments_to) {
        throw new Error(
          `Invalid Context Provided, 'PAYMENT FROM DATE' SHOULD BE LESS OR EQUAL  TO 'PAYMENT TO DATE'`
        );
      }

      const unipayData = await reportsChartOfAccountService.allUniversalPay(
        context
      );

      const studentItemDetails =
        await reportsChartOfAccountService.allStudentItemPayment(context);

      const data = [...unipayData, ...studentItemDetails];

      if (isEmpty(data)) {
        throw new Error(
          `No Payments Transaction Records Available Within Range.`
        );
      }

      const institutionStructure =
        await institutionStructureService.findInstitutionStructureRecords({
          attributes: ['institution_name', 'institution_logo'],
        });

      if (!institutionStructure) {
        throw new Error('Unable To Find Institution Structure.');
      }

      const workbook = new excelJs.Workbook();
      const rootSheet = workbook.addWorksheet('PAYMENT TRANSACTIONS REPORT');

      rootSheet.mergeCells('C1', 'O3');
      rootSheet.mergeCells('A1', 'B2');
      const titleCell = rootSheet.getCell('C1');

      rootSheet.getRow(1).height = 115;

      titleCell.value = `${
        institutionStructure.institution_name || 'TERP'
      }\n Office of the Bursar  \n UNIVERSAL TRANSACTIONS REPORT  \n
      PAYMENTS \n FROM ${context.payments_from} TO ${context.payments_to}`;

      titleCell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
      };

      titleCell.font = { bold: true, size: 15, name: 'Arial' };

      const headerRow = rootSheet.getRow(3);

      headerRow.values = map(allUniversalTransactionsColumns, 'header');
      headerRow.font = { bold: true, size: 15, color: '#2c3e50' };
      rootSheet.columns = allUniversalTransactionsColumns.map((column) => {
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
            transaction.account_code,
            transaction.account_name,
            transaction.receivable_name,
            transaction.unit_cost,
            transaction.receivable_amount,
            transaction.quantity,
            transaction.full_name,
            transaction.phone_number,
            transaction.email,
            transaction.amount,
            transaction.currency,
            toUpper(transaction.bank),
            toUpper(transaction.branch),
            transaction.ura_prn,
            transaction.payment_date,
            transaction.transaction_origin,
            transaction.student_status,
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

      const template = `${uploadPath}/all-uni-payments-report-${user.surname}-${
        user.other_names
      }-${user.id}-${now()}.xlsm`;

      await workbook.xlsx.writeFile(template);
      await res.download(
        template,
        `${context.payments_from} to ${context.payments_to} UNIVERSAL TRANSACTIONS REPORT.xlsx`,
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

  // summary account code download

  async downloadSummaryAccount(req, res) {
    try {
      const { user } = req;
      const context = req.query;

      if (!context.payments_from || !context.payments_to) {
        throw new Error('Invalid Context Provided');
      }

      if (context.payments_from > context.payments_to) {
        throw new Error(
          `Invalid Context Provided, 'PAYMENT FROM DATE' SHOULD BE LESS OR EQUAL  TO 'PAYMENT TO DATE'`
        );
      }

      const data = await summaryChartOfAccountReport(context);

      if (isEmpty(data)) {
        throw new Error(`No Account Summary Records.`);
      }

      const institutionStructure =
        await institutionStructureService.findInstitutionStructureRecords({
          attributes: ['institution_name', 'institution_logo'],
        });

      if (!institutionStructure) {
        throw new Error('Unable To Find Institution Structure.');
      }

      const workbook = new excelJs.Workbook();
      const rootSheet = workbook.addWorksheet('ACCOUNTS REPORT');

      rootSheet.mergeCells('C1', 'O3');
      rootSheet.mergeCells('A1', 'B2');
      const titleCell = rootSheet.getCell('C1');

      rootSheet.getRow(1).height = 115;

      titleCell.value = `${
        institutionStructure.institution_name || 'TERP'
      }\n Office of the Bursar
      Account Collection report
      Collection From ${context.payments_from} TO ${context.payments_to}`;

      titleCell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
      };

      titleCell.font = { bold: true, size: 15, name: 'Arial' };

      const headerRow = rootSheet.getRow(3);

      headerRow.values = map(accountSummaryColumns, 'header');
      headerRow.font = { bold: true, size: 15, color: '#2c3e50' };
      rootSheet.columns = accountSummaryColumns.map((column) => {
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
        const reportCategories = [
          {
            title: 'SUMMARY COLLECTIONS',
            key: 'chartOfAccountReport',
          },
          {
            title: 'TUITION INVOICE COLLECTIONS',
            key: 'tuitionReport',
          },
          {
            title: 'FUNCTIONAL INVOICE COLLECTIONS',
            key: 'functionalReport',
          },
          {
            title: 'MANUAL INVOICE COLLECTIONS',
            key: 'manualReport',
          },
          {
            title: 'OTHER INVOICE COLLECTIONS',
            key: 'otherReport',
          },
          {
            title: 'UNIVERSAL PAYMENT COLLECTIONS',
            key: 'universalReport',
          },
          {
            title: 'APPLICATION FEE COLLECTIONS',
            key: 'applicationReport',
          },
          {
            title: 'CHANGE OF PROGRAMME COLLECTIONS',
            key: 'changeOfProgrammes',
          },
        ];

        forEach(reportCategories, (category) => {
          templateData.push(['', category.title]);

          forEach(data[category.key], (item) => {
            templateData.push([
              item.account_code,
              item.account_name,
              item.amount_billed,
              item.amount_received,
            ]);
          });

          templateData.push(['']);
          templateData.push(['']);
        });
      }

      rootSheet.addRows(templateData);

      const uploadPath = `${process.cwd()}/src/assets/documents/templates`;

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true }, (err) => {
          throw new Error(err.message);
        });
      }

      const template = `${uploadPath}/all-uni-payments-report-${user.surname}-${
        user.other_names
      }-${user.id}-${now()}.xlsm`;

      await workbook.xlsx.writeFile(template);
      await res.download(
        template,
        `${context.payments_from} to ${context.payments_to} ACCOUNT REPORT.xlsx`,
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
}

module.exports = DownLoadReportsController;
