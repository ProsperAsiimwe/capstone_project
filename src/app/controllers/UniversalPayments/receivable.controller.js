const { HttpResponse } = require('@helpers');
const {
  chartOfAccountService,
  receivableService,
  metadataService,
  metadataValueService,
} = require('@services/index');
const model = require('@models');
const { isEmpty, toUpper, trim } = require('lodash');
const XLSX = require('xlsx');
const formidable = require('formidable');
const excelJs = require('exceljs');
const fs = require('fs');
const { receivableColumns } = require('./templateColumns');
const { now } = require('moment');
const {
  getMetadataValueId,
  getMetadataValues,
} = require('@controllers/Helpers/programmeHelper');
const { appConfig } = require('../../../config');

const http = new HttpResponse();

class ReceivableController {
  /**
   * GET All ChartOfAccounts On Staff Side.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async index(req, res) {
    try {
      const result = await receivableService.findAllReceivables({
        include: [
          {
            association: 'account',
            attributes: ['id', 'account_name', 'account_code'],
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
   * GET All ChartOfAccounts On Portal.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async indexPortal(req, res) {
    try {
      const result = await receivableService.findAllReceivables({
        where: {
          is_public: true,
          is_active: true,
        },
        include: [
          {
            association: 'account',
            attributes: ['id', 'account_name', 'account_code'],
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
   * REDIRECT USERS FOR ONLINE PAYMENTS.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  handleOnlinePayment(req, res) {
    try {
      const { searchPrnNo } = req.query;

      if (!searchPrnNo) {
        http.setError(400, 'Enter a valid reference number');

        return http.send(res);
      }

      const URAVisaURL = `${appConfig.URA_ONLINE_PAYMENT_REDIRECT}${searchPrnNo}`;

      return res.redirect(URAVisaURL);
    } catch (error) {
      http.setError(400, 'Unable To handle online payments.', {
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
  async createReceivable(req, res) {
    try {
      const data = req.body;
      const user = req.user.id;

      data.created_by_id = user;

      data.receivable_name = toUpper(trim(data.receivable_name));

      data.approvals = {
        created_by_id: user,
      };

      const result = await model.sequelize.transaction(async (transaction) => {
        const result = await insertNewAccountReceivable(data, transaction);

        return result;
      });

      http.setSuccess(200, 'Account Receivable Created Successfully.', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Create Account Receivable.', {
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
  async updateReceivable(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      let result = {};

      await model.sequelize.transaction(async (transaction) => {
        const update = await receivableService.updateReceivable(
          id,
          data,
          transaction
        );

        result = update[1][0];
      });

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
   * Destroy Data
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async deleteReceivable(req, res) {
    try {
      const { id } = req.params;

      await receivableService.deleteReceivable(id);
      http.setSuccess(200, 'Receivable Deleted Successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to delete this Receivable.', {
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
  async downloadReceivablesTemplate(req, res) {
    try {
      const { user } = req;

      const workbook = new excelJs.Workbook();

      const createReceivablesSheet =
        workbook.addWorksheet('CREATE RECEIVABLES');
      const accountsSheet = workbook.addWorksheet('Sheet2');
      const currenciesSheet = workbook.addWorksheet('Sheet3');

      createReceivablesSheet.properties.defaultColWidth =
        receivableColumns.length;
      createReceivablesSheet.columns = receivableColumns;
      accountsSheet.state = 'veryHidden';
      currenciesSheet.state = 'veryHidden';

      const chartOfAccounts =
        await chartOfAccountService.findAllChartsOfAccount({
          attributes: [
            'id',
            'account_status_id',
            'account_type_id',
            'tax_id',
            'account_code',
            'account_name',
          ],
          raw: true,
        });

      accountsSheet.addRows(
        chartOfAccounts.map((account) => [
          `(${account.account_name}):${account.account_code}`,
        ])
      );
      const metadata = await metadataService.findAllMetadata({
        attributes: ['metadata_name'],
        include: [
          { association: 'metadataValues', attributes: ['metadata_value'] },
        ],
        raw: true,
        nest: true,
      });

      currenciesSheet.addRows(getMetadataValues(metadata, 'CURRENCIES'));

      // Column Validations
      createReceivablesSheet.dataValidations.add('B2:B1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=Sheet2!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid value from the list',
      });

      createReceivablesSheet.dataValidations.add('C2:C1000', {
        type: 'whole',
        operator: 'greaterThan',
        formulae: [0],
        allowBlank: true,
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: `The value must be a whole number`,
        prompt: `The value must be a whole number`,
      });

      createReceivablesSheet.dataValidations.add('D2:D1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=Sheet3!$A$1:$A$1000'],
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

      const template = `${uploadPath}/download-receivables-upload-template-${
        user.surname
      }-${user.other_names}-${user.id}-${now()}.xlsm`;

      await workbook.xlsx.writeFile(template);
      await res.download(
        template,
        'RECEIVABLES-UPLOAD-TEMPLATE.xlsx',
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
  uploadReceivablesTemplate(req, res) {
    try {
      const data = req.body;
      const user = req.user.id;

      data.created_by_id = user;

      const form = new formidable.IncomingForm();

      const uploadedRecords = [];

      form.parse(req, async (err, fields, files) => {
        if (err) {
          http.setError(400, 'Unable To Upload Receivables.', {
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
            !isEmpty(templateHeaders['RECEIVABLE NAME']) &&
            !isEmpty(templateHeaders.ACCOUNT)
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

        const chartOfAccounts =
          await chartOfAccountService.findAllChartsOfAccount({
            attributes: [
              'id',
              'account_status_id',
              'account_type_id',
              'tax_id',
              'account_code',
              'account_name',
            ],
            raw: true,
          });

        const getAccount = (value, receivable) => {
          try {
            const checkValue = chartOfAccounts.find(
              (account) =>
                toUpper(account.account_code) ===
                toUpper(value.substring(value.indexOf(':') + 1))
            );

            if (checkValue) return parseInt(checkValue.id, 10);
            throw new Error(
              `Cannot find ${value} in the list of accounts on record with receivable: ${receivable}`
            );
          } catch (error) {
            throw new Error(error.message);
          }
        };

        try {
          await model.sequelize.transaction(async (transaction) => {
            for (const receivable of uploadedTemplate) {
              if (!receivable['RECEIVABLE NAME']) {
                throw new Error(`One Of The Receivables Provided Has No Name.`);
              }
              data.receivable_name = receivable['RECEIVABLE NAME'];

              if (!receivable.ACCOUNT) {
                throw new Error(
                  `Account For ${data.receivable_name} Is Required.`
                );
              }
              data.account_id = getAccount(
                receivable.ACCOUNT,
                data.receivable_name
              );

              if (!receivable['UNIT COST']) {
                throw new Error(
                  `Unit Cost For ${data.receivable_name} Is Required.`
                );
              }
              data.unit_cost = receivable['UNIT COST'];

              if (!receivable.CURRENCY) {
                throw new Error(
                  `Currency For ${data.receivable_name} Is Required.`
                );
              }
              data.currency_id = getMetadataValueId(
                metadataValues,
                receivable.CURRENCY,
                'CURRENCIES',
                data.receivable_name
              );

              if (receivable.DESCRIPTION) {
                data.description = receivable.DESCRIPTION;
              }

              const upload = await insertNewAccountReceivable(
                data,
                transaction
              );

              uploadedRecords.push(upload);
            }
          });
          http.setSuccess(200, 'Receivables Uploaded successfully.', {
            data: uploadedRecords,
          });

          return http.send(res);
        } catch (error) {
          http.setError(400, 'Unable to upload Receivables.', {
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
}
/**
 *
 * @param {*} data
 * @param {*} transaction
 */
const insertNewAccountReceivable = async function (data, transaction) {
  try {
    const result = await receivableService.createReceivable(data, transaction);

    return result[0];
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = ReceivableController;
