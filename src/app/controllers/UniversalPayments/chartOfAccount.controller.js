const { HttpResponse } = require('@helpers');
const {
  chartOfAccountService,
  metadataValueService,
  metadataService,
  institutionStructureService,
} = require('@services/index');
const model = require('@models');
const moment = require('moment');
const { isEmpty, toUpper, trim, now, map } = require('lodash');
const XLSX = require('xlsx');
const formidable = require('formidable');
const excelJs = require('exceljs');
const fs = require('fs');
const {
  handleChartOfAccountReport,
  summaryChartOfAccountReport,
  downloadDetailedAccountReportPDF,
} = require('../Helpers/reportsHelper');
const { accountColumns, accountReportColumns } = require('./templateColumns');
const {
  getMetadataValues,
  getMetadataValueId,
} = require('@controllers/Helpers/programmeHelper');

const http = new HttpResponse();

class ChartOfAccountController {
  /**
   * GET All ChartOfAccounts.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async index(req, res) {
    try {
      const result = await chartOfAccountService.findAllChartsOfAccount({
        attributes: [
          'id',
          'account_status_id',
          'account_type_id',
          'tax_id',
          'account_code',
          'account_name',
          'created_at',
        ],
        include: [
          {
            association: 'accountType',
            attributes: ['metadata_value'],
          },
          {
            association: 'accountStatus',
            attributes: ['metadata_value'],
          },
          {
            association: 'tax',
            attributes: ['metadata_value'],
          },
          {
            association: 'receivables',
            attributes: [
              'id',
              'currency_id',
              'account_id',
              'receivable_name',
              'description',
              'unit_cost',
            ],
            include: [
              {
                association: 'currency',
                attributes: ['metadata_value'],
              },
            ],
          },
          {
            association: 'createdBy',
            attributes: ['id', 'surname', 'other_names'],
          },
        ],
      });

      http.setSuccess(200, 'Accounts Fetched Successfully.', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Accounts.', {
        error: error.message,
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   */
  async createAccount(req, res) {
    try {
      const data = req.body;
      const user = req.user.id;

      data.created_by_id = user;

      data.account_code = toUpper(trim(data.account_code));
      data.account_name = toUpper(trim(data.account_name));

      const result = await model.sequelize.transaction(async (transaction) => {
        const result = await insertNewAccount(data, transaction);

        return result;
      });

      http.setSuccess(200, 'Account Created Successfully.', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Create Account.', {
        error: error.message,
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   */
  async downloadChartOfAccountsSummaryPdf(req, res) {
    try {
      const { user } = req;

      const context = req.query;

      const data = await summaryChartOfAccountReport(context);

      if (!data) {
        throw new Error(`Unable to find transaction data.`);
      }

      if (isEmpty(data.chartOfAccountReport)) {
        throw new Error(`Transaction Records Missing.`);
      }

      const response = await downloadDetailedAccountReportPDF(
        user,
        data,
        context
      );

      response.stream.on('finish', () => {
        const file = response.docPath;

        res.download(file);
      });
    } catch (error) {
      http.setError(400, 'Unable To Download This Document.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   */
  async downloadChartOfAccountsTemplate(req, res) {
    try {
      const { user } = req;

      const workbook = new excelJs.Workbook();

      const createAccountsSheet = workbook.addWorksheet('CREATE ACCOUNTS');
      const accountTypesSheet = workbook.addWorksheet('Sheet2');
      const accountStatusesSheet = workbook.addWorksheet('Sheet3');
      const taxesSheet = workbook.addWorksheet('Sheet4');

      createAccountsSheet.properties.defaultColWidth = accountColumns.length;
      createAccountsSheet.columns = accountColumns;
      accountTypesSheet.state = 'veryHidden';
      accountStatusesSheet.state = 'veryHidden';
      taxesSheet.state = 'veryHidden';
      const metadata = await metadataService.findAllMetadata({
        attributes: ['metadata_name'],
        include: [
          { association: 'metadataValues', attributes: ['metadata_value'] },
        ],
        raw: true,
        nest: true,
      });

      accountTypesSheet.addRows(
        getMetadataValues(metadata, 'CHART OF ACCOUNT TYPES')
      );

      accountStatusesSheet.addRows(
        getMetadataValues(metadata, 'CHART OF ACCOUNT STATUSES')
      );

      taxesSheet.addRows(getMetadataValues(metadata, 'CHART OF ACCOUNT TAXES'));

      // Column Validations
      createAccountsSheet.dataValidations.add('C2:C1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=Sheet2!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid value from the list',
      });

      createAccountsSheet.dataValidations.add('D2:D1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=Sheet3!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid value from the list',
      });

      createAccountsSheet.dataValidations.add('E2:E1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=Sheet4!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid value from the list',
      });

      const uploadPath = `${process.cwd()}/src/assets/documents/templates`;

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true }, (err) => {
          throw new Error(err.message);
        });
      }

      const template = `${uploadPath}/download-chart-of-accounts-upload-template-${
        user.surname
      }-${user.other_names}-${user.id}-${now()}.xlsm`;

      await workbook.xlsx.writeFile(template);
      await res.download(
        template,
        'CHART-OF-ACCOUNTS-UPLOAD-TEMPLATE.xlsx',
        (error) => {
          if (error) {
            throw new Error(error.message);
          }
        }
      );
    } catch (error) {
      http.setError(400, 'Unable To Download This Template.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   */
  async downloadAccountReportTemplate(req, res) {
    try {
      const { user } = req;
      const context = req.query;

      if (
        !context.payments_from ||
        !context.payments_to ||
        !context.account_id ||
        !context.transaction_category
      ) {
        throw new Error('Invalid Context Provided');
      }

      const data = await handleChartOfAccountReport(context);

      if (!data) {
        throw new Error(
          `No Payments Transaction Records Available Within Range.`
        );
      }

      if (isEmpty(data.result)) {
        throw new Error(`Unable To Find Any Transactions.`);
      }

      const institutionStructure =
        await institutionStructureService.findInstitutionStructureRecords({
          attributes: ['institution_name', 'institution_logo'],
        });

      if (!institutionStructure) {
        throw new Error('Unable To Find Institution Structure.');
      }

      const workbook = new excelJs.Workbook();
      const rootSheet = workbook.addWorksheet('ACCOUNT REPORT');

      rootSheet.mergeCells('C1', 'O3');
      rootSheet.mergeCells('A1', 'B2');
      const titleCell = rootSheet.getCell('C1');

      rootSheet.getRow(1).height = 65;

      titleCell.value = `${
        institutionStructure.institution_name || 'TERP'
      } \n ${
        context.transaction_category
      } PAYMENT TRANSACTIONS REPORT \n FROM ${context.payments_from} TO ${
        context.payments_to
      } \n FOR ACCOUNT:  ${data.result[0].account_name}, CODE: ${
        data.result[0].account_code
      }\n TOTAL TRANSACTION AMOUNT: ${parseInt(
        data.totalAmount,
        10
      ).toLocaleString()} ${data.result[0].currency}`;

      titleCell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
      };

      titleCell.font = { bold: true, size: 10, name: 'Arial' };

      const headerRow = rootSheet.getRow(3);

      headerRow.values = map(accountReportColumns, 'header');
      headerRow.font = { bold: true, size: 11, color: '#2c3e50' };
      rootSheet.columns = accountReportColumns.map((column) => {
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

      if (!isEmpty(data.result)) {
        data.result.forEach((transaction) => {
          templateData.push([
            transaction.full_name,
            transaction.phone_number,
            transaction.email,
            transaction.receivable_name,
            parseInt(transaction.unit_cost, 10).toLocaleString(),
            transaction.quantity,
            parseInt(transaction.receivable_amount, 10).toLocaleString(),
            transaction.ura_prn,
            `${parseInt(transaction.amount, 10).toLocaleString()} ${
              transaction.currency
            }`,
            toUpper(transaction.bank),
            toUpper(transaction.branch),
            transaction.payment_date,
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

      const template = `${uploadPath}/chart-of-account-report-${user.surname}-${
        user.other_names
      }-${user.id}-${now()}.xlsm`;

      await workbook.xlsx.writeFile(template);
      await res.download(
        template,
        `CHART OF ACCOUNT ${context.transaction_category} PAYMENT TRANSACTIONS REPORT.xlsx`,
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

  /**
   *
   * @param {*} req
   * @param {*} res
   */
  uploadChartOfAccountsTemplate(req, res) {
    try {
      const data = req.body;
      const user = req.user.id;

      data.created_by_id = user;

      const form = new formidable.IncomingForm();

      const uploadedRecords = [];

      form.parse(req, async (err, fields, files) => {
        if (err) {
          http.setError(400, 'Unable To Upload Accounts.', {
            error: { err },
          });

          return http.send(res);
        }

        const file = files[Object.keys(files)[0]];

        if (!file) {
          http.setError(400, 'Please Select A File To Upload.');

          return http.send(res);
        }

        const workbook = XLSX.readFile(file.filepath, { cellDates: true });

        const myTemplate = workbook.SheetNames[0];

        const rows = XLSX.utils.sheet_to_json(workbook.Sheets[myTemplate]);

        const uploadedTemplate = rows.filter(
          (templateHeaders) =>
            !isEmpty(templateHeaders['ACCOUNT CODE']) &&
            !isEmpty(templateHeaders['ACCOUNT NAME'])
        );

        if (isEmpty(uploadedTemplate)) {
          http.setError(
            400,
            'Unable to upload this Document, You are missing some required fields in the template.'
          );

          return http.send(res);
        }

        const metadataValues = await metadataValueService.findAllMetadataValues(
          {
            include: ['metadata'],
          }
        );

        try {
          await model.sequelize.transaction(async (transaction) => {
            for (const account of uploadedTemplate) {
              if (!account['ACCOUNT NAME']) {
                throw new Error(`One Of The Accounts Provided Has No Name.`);
              }
              data.account_name = toUpper(trim(account['ACCOUNT NAME']));

              if (!account['ACCOUNT CODE']) {
                throw new Error(
                  `Account Code For ${data.account_name} Is Required.`
                );
              }
              data.account_code = toUpper(trim(account['ACCOUNT CODE']));

              if (!account['ACCOUNT TYPE']) {
                throw new Error(
                  `Account Type For ${data.account_name} Is Required.`
                );
              }
              data.account_type_id = getMetadataValueId(
                metadataValues,
                account['ACCOUNT TYPE'],
                'CHART OF ACCOUNT TYPES',
                data.account_name
              );

              if (!account['ACCOUNT STATUS']) {
                throw new Error(
                  `Account Status For ${data.account_name} Is Required.`
                );
              }
              data.account_status_id = getMetadataValueId(
                metadataValues,
                account['ACCOUNT STATUS'],
                'CHART OF ACCOUNT STATUSES',
                data.account_name
              );

              if (account.TAX) {
                data.tax_id = getMetadataValueId(
                  metadataValues,
                  account.TAX,
                  'CHART OF ACCOUNT TAXES',
                  data.account_name
                );
              }

              const upload = await insertNewAccount(data, transaction);

              uploadedRecords.push(upload);
            }
          });
          http.setSuccess(200, 'Accounts Uploaded successfully.', {
            data: uploadedRecords,
          });

          return http.send(res);
        } catch (error) {
          http.setError(400, 'Unable to upload Accounts.', {
            error: { message: error.message },
          });

          return http.send(res);
        }
      });
    } catch (error) {
      http.setError(400, 'Unable To Upload This Template.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async approveAccountReceivables(req, res) {
    try {
      const data = req.body;

      const user = req.user.id;

      data.create_approved_by_id = user;
      data.create_approval_date = moment.now();
      data.create_approval_status = 'APPROVED';

      const approvedReceivables = [];

      await model.sequelize.transaction(async (transaction) => {
        for (const requestId of data.approval_ids) {
          const findRequest =
            await chartOfAccountService.findOneReceivableApproval({
              where: {
                id: requestId,
                create_approval_status: 'PENDING',
              },
              raw: true,
            });

          if (!findRequest) {
            throw new Error(
              'One of the requests you are trying to approve is not valid or has already been approved.'
            );
          }

          await chartOfAccountService.updateReceivableApproval(
            requestId,
            data,
            transaction
          );

          const approvedReceivableData = {
            create_approved_by_id: user,
            create_approval_date: moment.now(),
            create_approval_status: 'APPROVED',
          };

          const updateReceivable = await chartOfAccountService.updateReceivable(
            findRequest.receivable_id,
            approvedReceivableData,
            transaction
          );

          const result = updateReceivable[1][0];

          approvedReceivables.push(result);
        }
      });

      http.setSuccess(200, 'Receivables Approved Successfully.', {
        data: approvedReceivables,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to Approve Receivables.', {
        error: error.message,
      });

      return http.send(res);
    }
  }

  /**
   * Get Specific ChartOfAccount Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async fetchChartOfAccount(req, res) {
    try {
      const { id } = req.params;
      const semester = await chartOfAccountService.findOneChartOfAccount({
        where: { id },
      });

      http.setSuccess(200, 'Account Fetched successfully.', {
        semester,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to fetch Account.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   */
  async updateAccount(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      const update = await chartOfAccountService.updateChartOfAccount(id, data);

      const result = update[1][0];

      http.setSuccess(200, 'Account updated successfully', { data: result });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to update this Account.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Destroy ChartOfAccount Data
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async deleteChartOfAccount(req, res) {
    try {
      const { id } = req.params;

      await chartOfAccountService.deleteChartOfAccount(id);
      http.setSuccess(200, 'Account Deleted Successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to delete this Account.', {
        error: error.message,
      });

      return http.send(res);
    }
  }
}

/**
 *
 * @param {*} data
 * @param {*} transaction
 */
const insertNewAccount = async function (data, transaction) {
  try {
    const result = await chartOfAccountService.createAccount(data, transaction);

    return result[0];
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = ChartOfAccountController;
