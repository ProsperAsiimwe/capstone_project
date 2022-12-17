/* eslint-disable no-underscore-dangle */
const { HttpResponse } = require('@helpers');
const {
  universalInvoiceService,
  metadataValueService,
  chartOfAccountService,
} = require('@services/index');
const model = require('@models');
const moment = require('moment');
const { isEmpty, toUpper, trim, sumBy } = require('lodash');
const { generatePRN } = require('@helpers');
const envConfig = require('../../../config/app');
const { getMetadataValueId } = require('@controllers/Helpers/programmeHelper');
const {
  findPaymentStatus,
  generateSystemReference,
} = require('@controllers/Helpers/paymentReferenceHelper');
const { getPRNStatus } = require('../../helpers/URAHelper');
const { Op } = require('sequelize');

const http = new HttpResponse();

class UniversalInvoiceController {
  /**
   * GET All UniversalInvoices.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async index(req, res) {
    try {
      const context = req.query;

      if (!context.start_date || !context.end_date) {
        throw new Error('Invalid Context Provided');
      }

      let newStartDate = null;

      let newEndDate = null;

      if (context.start_date.includes('/') && context.end_date.includes('/')) {
        newStartDate = moment(context.start_date.split('/').reverse().join('-'))
          .utcOffset(0, true)
          .format();

        newEndDate = moment(context.end_date.split('/').reverse().join('-'))
          .utcOffset(0, true)
          .format();
      } else {
        newStartDate = context.start_date;
        newEndDate = context.end_date;
      }

      const result = [];

      if (newStartDate === newEndDate) {
        let response = null;

        if (context.former_student_identifier) {
          response = await universalInvoiceService.findAllUniversalInvoices({
            where: {
              //  created_at: newStartDate,
              created_at: {
                [Op.between]: [
                  moment(newStartDate).subtract(1, 'days'),
                  moment(newEndDate).add(1, 'days'),
                ],
              },
              former_student_identifier: context.former_student_identifier,
            },
            ...getUniversalInvoiceAttributes(),
          });

          result.push(...response);
        } else {
          response = await universalInvoiceService.findAllUniversalInvoices({
            where: {
              //  created_at: newStartDate,
              created_at: {
                [Op.between]: [
                  moment(newStartDate).subtract(1, 'days'),
                  moment(newEndDate).add(1, 'days'),
                ],
              },
            },
            ...getUniversalInvoiceAttributes(),
          });

          result.push(...response);
        }
      } else {
        let response = null;

        if (context.former_student_identifier) {
          response = await universalInvoiceService.findAllUniversalInvoices({
            where: {
              created_at: {
                [Op.between]: [
                  moment(newStartDate).subtract(1, 'days'),
                  moment(newEndDate).add(1, 'days'),
                ],
              },
              former_student_identifier: context.former_student_identifier,
            },
            ...getUniversalInvoiceAttributes(),
          });

          result.push(...response);
        } else {
          response = await universalInvoiceService.findAllUniversalInvoices({
            where: {
              created_at: {
                [Op.between]: [
                  moment(newStartDate).subtract(1, 'days'),
                  moment(newEndDate).add(1, 'days'),
                ],
              },
            },
            ...getUniversalInvoiceAttributes(),
          });

          result.push(...response);
        }
      }

      http.setSuccess(200, 'Universal Invoices Fetched Successfully.', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Universal Invoices.', {
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
  async createUniversalInvoice(req, res) {
    try {
      const data = req.body;

      if (req.user) {
        const user = req.user.id;

        data.created_by_id = user;
      }

      data.invoiceReceivables = [];
      const random = Math.floor(Math.random() * moment().unix());
      const generatedInvoiceNumber = `U-INV${random}`;

      if (
        isEmpty(data.full_name) ||
        isEmpty(data.email) ||
        isEmpty(data.phone_number)
      ) {
        throw new Error(
          'Please Provide Your Full Name, Email and Phone Number'
        );
      }

      const metadataValues = await metadataValueService.findAllMetadataValues({
        include: ['metadata'],
      });

      const findActiveInvoiceStatusId = getMetadataValueId(
        metadataValues,
        'ACTIVE',
        'INVOICE STATUSES'
      );

      const findMandatoryInvoiceTypeId = getMetadataValueId(
        metadataValues,
        'MANDATORY',
        'INVOICE TYPES'
      );
      const findCurrencyId = getMetadataValueId(
        metadataValues,
        'UGX',
        'CURRENCIES'
      );

      data.full_name = toUpper(trim(data.full_name));
      data.invoice_type_id = findMandatoryInvoiceTypeId;
      data.invoice_status_id = findActiveInvoiceStatusId;
      data.invoice_number = generatedInvoiceNumber;
      data.currency_id = findCurrencyId;

      if (!isEmpty(data.receivables)) {
        for (const eachObject of data.receivables) {
          const findReceivable = await chartOfAccountService.findOneReceivable({
            where: {
              id: eachObject.receivable_id,
            },
            raw: true,
          });

          if (!findReceivable) {
            throw new Error('One Of The Receivables Chosen Does not Exist.');
          }

          const totalAmount = eachObject.quantity * findReceivable.unit_cost;

          data.invoiceReceivables.push({
            receivable_id: eachObject.receivable_id,
            currency_id: data.currency_id,
            quantity: eachObject.quantity,
            amount: totalAmount,
          });
        }
      } else {
        throw new Error('Please Select at least 1 Receivable Item to Pay for.');
      }

      data.invoice_amount = sumBy(data.invoiceReceivables, 'amount');
      data.amount_due = sumBy(data.invoiceReceivables, 'amount');

      data.payment_mode = 'CASH';
      data.payment_bank_code = 'STN';

      const referenceNumberGenerator = await generatePaymentReference(
        data.invoice_amount,
        data.full_name,
        data.payment_mode,
        data.payment_bank_code,
        data.payment_mobile_no
      );

      data.reference = {
        tax_payer_name: referenceNumberGenerator.tax_payer_name,
        ura_prn: referenceNumberGenerator.ura_prn,
        system_prn: referenceNumberGenerator.system_prn,
        search_code: referenceNumberGenerator.search_code,
        amount: referenceNumberGenerator.amount,
        expiry_date: referenceNumberGenerator.expiry_date,
        payment_mode: data.payment_mode,
        payment_bank_code: data.payment_bank_code,
        tax_payer_bank_code: data.tax_payer_bank_code,
        generated_by: req.user ? 'STAFF' : data.full_name,
        ip_address: req.connection.remoteAddress,
        user_agent: req.get('user-agent'),
      };

      let result = {};

      const create = await model.sequelize.transaction(async (transaction) => {
        const response = await universalInvoiceService.createUniversalInvoice(
          data,
          transaction
        );

        if (response[1] === true) {
          const prnTrackerData = {
            universal_invoice_id: response[0].dataValues.id,
            ip_address: data.reference.ip_address,
            user_agent: data.reference.user_agent,
            category: 'UNIVERSAL',
            system_prn: referenceNumberGenerator.system_prn,
            ura_prn: referenceNumberGenerator.ura_prn,
            search_code: referenceNumberGenerator.search_code,
            amount: referenceNumberGenerator.amount,
            tax_payer_name: referenceNumberGenerator.tax_payer_name,
            payment_mode: data.payment_mode,
            payment_bank_code: data.payment_bank_code,
            tax_payer_bank_code: data.tax_payer_bank_code,
            generated_by: data.reference.generated_by,
            expiry_date: referenceNumberGenerator.expiry_date,
          };

          await prnTrackerRecord(prnTrackerData, transaction);
        }

        return response[0];
      });

      if (req.user) {
        result = create;
      } else {
        const findGeneratedInvoice = await universalInvoiceService
          .findOneUniversalInvoice({
            where: {
              id: create.dataValues.id,
            },
            ...getUniversalInvoiceAttributes(),
            nest: true,
          })
          .then(function (res) {
            if (res) {
              const result = res.toJSON();

              return result;
            }
          });

        result = findGeneratedInvoice;
      }

      http.setSuccess(200, 'Universal Invoice Created Successfully.', {
        data: !isEmpty(result) ? result : {},
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Create Universal Invoice.', {
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
  async staffPortalGeneratedUniversalInvoice(req, res) {
    try {
      const data = req.body;
      const user = req.user.id;

      data.created_by_id = user;

      data.invoiceReceivables = [];

      const random = Math.floor(Math.random() * moment().unix());
      const generatedInvoiceNumber = `U-INV${random}`;

      const metadataValues = await metadataValueService.findAllMetadataValues({
        include: ['metadata'],
      });

      const findActiveInvoiceStatusId = getMetadataValueId(
        metadataValues,
        'ACTIVE',
        'INVOICE STATUSES'
      );

      const findMandatoryInvoiceTypeId = getMetadataValueId(
        metadataValues,
        'MANDATORY',
        'INVOICE TYPES'
      );

      if (
        isEmpty(data.full_name) ||
        isEmpty(data.email) ||
        isEmpty(data.phone_number)
      ) {
        throw new Error('Please Provide A Full Name, Email and Phone Number');
      }

      data.full_name = toUpper(trim(data.full_name));
      data.invoice_type_id = findMandatoryInvoiceTypeId;
      data.invoice_status_id = findActiveInvoiceStatusId;
      data.invoice_number = generatedInvoiceNumber;

      if (!isEmpty(data.receivables)) {
        for (const eachObject of data.receivables) {
          const findReceivable = await chartOfAccountService.findOneReceivable({
            where: {
              id: eachObject.receivable_id,
            },
            raw: true,
          });

          if (!findReceivable) {
            throw new Error('One Of The Receivables Chosen Does not Exist.');
          }

          if (
            parseInt(eachObject.amount_due, 10) <
            parseInt(findReceivable.unit_cost, 10)
          ) {
            throw new Error(
              `Please Provide An Amount Of ${findReceivable.unit_cost} And Above For ${findReceivable.receivable_name}.`
            );
          }

          data.invoiceReceivables.push({
            receivable_id: eachObject.receivable_id,
            currency_id: data.currency_id,
            quantity: 1,
            amount: eachObject.amount_due,
          });
        }
      } else {
        throw new Error('Please Select at least 1 Receivable Item to Pay for.');
      }

      data.invoice_amount = sumBy(data.invoiceReceivables, 'amount');
      data.amount_due = sumBy(data.invoiceReceivables, 'amount');

      const create = await model.sequelize.transaction(async (transaction) => {
        const response = await universalInvoiceService.createUniversalInvoice(
          data,
          transaction
        );

        if (response[1] === true) {
          return response[0];
        } else {
          throw new Error(
            `A universal invoice with tag ${data.invoice_number} already exists.`
          );
        }
      });

      http.setSuccess(200, 'Universal Invoice Generated Successfully.', {
        data: create,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Generate Universal Invoice.', {
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
  async generatePaymentReferenceWithInvoiceNumber(req, res) {
    try {
      const { id } = req.params;

      const data = {};

      const invoice = await universalInvoiceService
        .findOneUniversalInvoice({
          where: {
            invoice_number: id,
          },
          ...getUniversalInvoiceAttributes(),
          nest: true,
        })
        .then(function (res) {
          if (res) {
            const result = res.toJSON();

            return result;
          }
        });

      if (!invoice) {
        throw new Error(`Unable To Find Universal Invoice.`);
      }

      data.payment_mode = 'CASH';
      data.payment_bank_code = 'STN';

      const create = await model.sequelize.transaction(async (transaction) => {
        // get PRN status
        if (invoice.reference) {
          const status = await getPRNStatus(invoice.reference.ura_prn);

          const findStatus = findPaymentStatus(status.StatusCode);

          if (findStatus.code !== 'T' || findStatus.code !== 'R') {
            await removeUniversalPaymentReferenceRecord(
              invoice.reference.id,
              transaction
            );
          } else {
            throw new Error(
              `A Payment Transaction Has Already Been Made With This Invoice's Details.`
            );
          }
        }

        const referenceNumberGenerator = await generatePaymentReference(
          invoice.invoice_amount,
          invoice.full_name,
          data.payment_mode,
          data.payment_bank_code,
          data.payment_mobile_no
        );

        data.universal_invoice_id = invoice.id;
        data.tax_payer_name = referenceNumberGenerator.tax_payer_name;
        data.ura_prn = referenceNumberGenerator.ura_prn;
        data.system_prn = referenceNumberGenerator.system_prn;
        data.search_code = referenceNumberGenerator.search_code;
        data.amount = referenceNumberGenerator.amount;
        data.expiry_date = referenceNumberGenerator.expiry_date;
        data.generated_by = invoice.full_name;
        data.ip_address = req.connection.remoteAddress;
        data.user_agent = req.get('user-agent');

        const response =
          await universalInvoiceService.createUniversalPaymentReference(
            data,
            transaction
          );

        const prnTrackerData = {
          universal_invoice_id: invoice.id,
          ip_address: data.ip_address,
          user_agent: data.user_agent,
          category: 'UNIVERSAL',
          system_prn: referenceNumberGenerator.system_prn,
          ura_prn: referenceNumberGenerator.ura_prn,
          search_code: referenceNumberGenerator.search_code,
          amount: referenceNumberGenerator.amount,
          tax_payer_name: referenceNumberGenerator.tax_payer_name,
          payment_mode: data.payment_mode,
          payment_bank_code: data.payment_bank_code,
          generated_by: data.generated_by,
          expiry_date: referenceNumberGenerator.expiry_date,
        };

        await prnTrackerRecord(prnTrackerData, transaction);

        return response;
      });

      http.setSuccess(200, 'Payment Reference Generated Successfully.', {
        data: create,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Generate Payment Reference.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * UPDATE
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async updateUniversalInvoice(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      const user = parseInt(req.user.id, 10);

      data.last_updated_by_id = user;
      data.updated_at = moment.now();

      const invoice = await universalInvoiceService
        .findOneUniversalInvoice({
          where: {
            id,
          },
          ...getUniversalInvoiceAttributes(),
          nest: true,
        })
        .then(function (res) {
          if (res) {
            const result = res.toJSON();

            return result;
          }
        });

      if (!invoice) {
        throw new Error(`Invoice doesn't exist.`);
      }

      const response = await model.sequelize.transaction(
        async (transaction) => {
          // get PRN status

          if (invoice.reference) {
            const status = await getPRNStatus(invoice.reference.ura_prn);

            const findStatus = findPaymentStatus(status.StatusCode);

            if (findStatus.code !== 'T' || findStatus.code !== 'R') {
              await removeUniversalPaymentReferenceRecord(
                invoice.reference.id,
                transaction
              );
            } else {
              throw new Error(
                `A Payment Transaction Has Already Been Made With This Invoice's Details.`
              );
            }
          }

          const invoiceReceivables = [];

          if (!isEmpty(data.receivables)) {
            data.receivables.forEach((receivable) => {
              invoiceReceivables.push({
                universal_invoice_id: id,
                receivable_id: receivable.receivable_id,
                currency_id: data.currency_id,
                quantity: 1,
                amount: receivable.amount_due,
                last_updated_by_id: user,
                updated_at: moment.now(),
              });
            });

            data.invoice_amount = sumBy(invoiceReceivables, 'amount');
            data.amount_due = sumBy(invoiceReceivables, 'amount');
          }

          const update = await universalInvoiceService.updateUniversalInvoice(
            id,
            data,
            transaction
          );

          const result = update[1][0];

          await handleUpdatingPivots(id, invoiceReceivables, transaction);

          return result;
        }
      );

      http.setSuccess(200, 'Universal Invoice Updated Successfully', {
        data: response,
      });
      if (isEmpty(response))
        http.setError(404, 'Universal Invoice Data Not Found');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Update This Universal Invoice', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Destroy UniversalInvoice Data
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async deleteUniversalInvoice(req, res) {
    try {
      const { id } = req.params;

      const invoice = await universalInvoiceService
        .findOneUniversalInvoice({
          where: {
            id,
          },
          ...getUniversalInvoiceAttributes(),
          nest: true,
        })
        .then(function (res) {
          if (res) {
            const result = res.toJSON();

            return result;
          }
        });

      if (!invoice) {
        throw new Error(`Invoice doesn't exist.`);
      }

      await model.sequelize.transaction(async (transaction) => {
        // get PRN status
        if (invoice.reference) {
          const status = await getPRNStatus(invoice.reference.ura_prn);

          const findStatus = findPaymentStatus(status.StatusCode);

          if (findStatus.code !== 'T' || findStatus.code !== 'R') {
            await removeUniversalPaymentReferenceRecord(
              invoice.reference.id,
              transaction
            );
          } else {
            throw new Error(
              `A Payment Transaction Has Already Been Made With This Invoice's Details.`
            );
          }
        }

        const receivables =
          await universalInvoiceService.findAllInvoiceReceivables({
            where: {
              universal_invoice_id: id,
            },
            attributes: ['id'],
            raw: true,
          });

        const receivablesToDelete = receivables.map((item) => {
          return item.id;
        });

        if (!isEmpty(receivablesToDelete)) {
          await universalInvoiceService.bulkRemoveInvoiceReceivables(
            receivablesToDelete,
            transaction
          );
        }

        await universalInvoiceService.deleteUniversalInvoice(id, transaction);
      });

      http.setSuccess(200, 'Invoice Deleted Successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to delete this Invoice.', {
        error: error.message,
      });

      return http.send(res);
    }
  }

  /**
   * Get Specific UniversalInvoice Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async fetchUniversalInvoiceByInvoiceNumber(req, res) {
    try {
      const { invoiceNumber } = req.params;

      const invoice = await universalInvoiceService.findOneUniversalInvoice({
        where: {
          invoice_number: trim(invoiceNumber),
        },
        ...getUniversalInvoiceAttributes(),
      });

      http.setSuccess(200, 'Universal Invoice Fetched successfully.', {
        data: invoice,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to fetch Universal Invoice.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Get Specific UniversalInvoice Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async fetchUniversalInvoiceById(req, res) {
    try {
      const { id } = req.params;

      const invoice = await universalInvoiceService.findOneUniversalInvoice({
        where: {
          id,
        },
        ...getUniversalInvoiceAttributes(),
      });

      http.setSuccess(200, 'Universal Invoice Fetched successfully.', {
        data: invoice,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to fetch Universal Invoice.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * GET All Universal Invoice Transactions.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async fetchAllUniversalInvoiceTransactions(req, res) {
    try {
      const result = await universalInvoiceService.findAllUniversalTransactions(
        {
          attributes: [
            'id',
            'universal_invoice_id',
            'reference_number',
            'amount_paid',
            'transaction_origin',
            'payment_mode',
            'currency',
            'bank_name',
            'bank_branch',
            'mode_reference',
            'narration',
            'payment_date',
          ],
          include: [
            {
              association: 'universalInvoice',
              attributes: [
                'id',
                'full_name',
                'email',
                'phone_number',
                'description',
                'invoice_number',
                'invoice_amount',
                'amount_due',
                'amount_paid',
              ],
            },
          ],
        }
      );

      http.setSuccess(
        200,
        'Universal Invoice Transactions Fetched Successfully.',
        {
          data: result,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Universal Invoice Transactions.', {
        error: error.message,
      });

      return http.send(res);
    }
  }

  /**
   * createBankPaymentTransaction
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async createUniversalInvoiceBankPaymentTransaction(req, res) {
    try {
      const data = req.body;

      data.transaction_origin = 'BANK TRANSACTION';
      data.create_approval_status = 'APPROVED';

      const paymentReference = await universalInvoiceService
        .findOneUniversalPaymentReference({
          where: {
            reference_number: data.reference_number.trim(),
          },
          attributes: [
            'id',
            'universal_invoice_id',
            'reference_number',
            'reference_origin',
            'generated_by',
            'amount',
            'expiry_date',
            'is_used',
            'ip_address',
            'user_agent',
          ],
          include: [
            {
              association: 'universalInvoice',
              attributes: [
                'id',
                'full_name',
                'email',
                'phone_number',
                'invoice_number',
                'invoice_amount',
                'amount_due',
                'amount_paid',
              ],
            },
          ],
          nest: true,
        })
        .then(function (res) {
          if (res) {
            const result = res.toJSON();

            return result;
          }
        });

      if (!paymentReference) {
        throw new Error('Payment Reference Provided Does not Exist.');
      }

      if (data.amount_paid !== paymentReference.amount) {
        throw new Error(
          `Amount Paid Must be equal to Amount Generated For This Reference Number, ${paymentReference.amount}.`
        );
      }

      data.universal_invoice_id = paymentReference.universal_invoice_id;

      const paymentTransaction = await model.sequelize.transaction(
        async (transaction) => {
          const result =
            await universalInvoiceService.createUniversalPaymentTransaction(
              data,
              transaction
            );

          await universalInvoiceService.updateUniversalPaymentReference(
            paymentReference.id,
            {
              is_used: true,
              expiry_date: moment.now(),
            },
            transaction
          );

          await universalInvoiceService.updateUniversalInvoice(
            paymentReference.universal_invoice_id,
            {
              amount_paid: data.amount_paid,
              amount_due:
                paymentReference.universalInvoice.amount_due - data.amount_paid,
            },
            transaction
          );

          return result;
        }
      );

      http.setSuccess(201, 'Payment Transaction Completed Successfully.', {
        data: paymentTransaction,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Completed This Payment Transaction.', {
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
const generatePaymentReference = async function (
  amount,
  taxPayerName,
  paymentMode,
  paymentBankCode,
  paymentMobileNo
) {
  try {
    const payload = {};

    payload.tax_head = envConfig.TAX_HEAD_CODE;
    payload.system_prn = generateSystemReference();
    payload.tax_payer_name = taxPayerName;
    payload.amount = amount;

    const requestUraPrnData = {
      TaxHead: payload.tax_head,
      TaxPayerName: payload.tax_payer_name,
      TaxPayerBankCode: paymentBankCode,
      PaymentBankCode: paymentBankCode,
      MobileNo: paymentMobileNo,
      ReferenceNo: payload.system_prn,
      ExpiryDays: envConfig.PAYMENT_REFERENCE_EXPIRES_IN,
      Amount: payload.amount,
      PaymentMode: paymentMode,
    };

    const genPRN = await generatePRN(requestUraPrnData);

    payload.ura_prn = genPRN.ura_prn;
    payload.expiry_date = genPRN.expiry_date;
    payload.search_code = genPRN.search_code;

    return payload;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} payload
 * @param {*} transaction
 */
const prnTrackerRecord = async function (payload, transaction) {
  // console.log('payload', payload);
  const response = await universalInvoiceService.createPrnTrackerRecord(
    payload,
    transaction
  );

  return response;
};

/**
 *
 * @param {*} invoiceId
 * @param {*} transaction
 * @returns
 */
const removeUniversalPaymentReferenceRecord = async function (
  invoiceId,
  transaction
) {
  await universalInvoiceService.deleteUniversalInvoicePaymentReference(
    invoiceId,
    transaction
  );
};

/**
 *
 * @param {*} universalInvoiceId
 * @param {*} invoiceReceivables
 * @param {*} transaction
 */
const handleUpdatingPivots = async function (
  universalInvoiceId,
  invoiceReceivables,
  transaction
) {
  try {
    if (!isEmpty(invoiceReceivables)) {
      await deleteOrCreateElements(
        invoiceReceivables,
        'findAllInvoiceReceivables',
        'bulkInsertInvoiceReceivables',
        'bulkRemoveInvoiceReceivables',
        'updateInvoiceReceivable',
        'receivable_id',
        universalInvoiceId,
        transaction
      );
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} firstElements
 * @param {*} findAllService
 * @param {*} insertService
 * @param {*} deleteService
 * @param {*} firstField
 * @param {*} universalInvoiceId
 * @param {*} transaction
 * @returns
 */
const deleteOrCreateElements = async (
  firstElements,
  findAllService,
  insertService,
  deleteService,
  updateService,
  firstField,
  universalInvoiceId,
  transaction
) => {
  const elementsToDelete = [];
  const elementsToInsert = [];
  const elementsToUpdate = [];

  const secondElements = await universalInvoiceService[findAllService]({
    where: {
      universal_invoice_id: universalInvoiceId,
    },
    attributes: ['id', 'universal_invoice_id', firstField],
    raw: true,
  });

  firstElements.forEach((firstElement) => {
    const myElement = secondElements.find(
      (secondElement) =>
        parseInt(firstElement[firstField], 10) ===
          parseInt(secondElement[firstField], 10) &&
        parseInt(firstElement.universal_invoice_id, 10) ===
          parseInt(secondElement.universal_invoice_id, 10)
    );

    if (!myElement) {
      elementsToInsert.push(firstElement);
    } else {
      const locateContextId = secondElements.find(
        (value) =>
          parseInt(value.universal_invoice_id, 10) ===
            parseInt(firstElement.universal_invoice_id, 10) &&
          parseInt(value.receivable_id, 10) ===
            parseInt(firstElement.receivable_id, 10)
      );

      elementsToUpdate.push({ id: locateContextId.id, ...firstElement });
    }
  });

  secondElements.forEach((secondElement) => {
    const myElement = firstElements.find(
      (firstElement) =>
        parseInt(firstElement[firstField], 10) ===
          parseInt(secondElement[firstField], 10) &&
        parseInt(firstElement.universal_invoice_id, 10) ===
          parseInt(secondElement.universal_invoice_id, 10)
    );

    if (!myElement) elementsToDelete.push(secondElement.id);
  });

  if (!isEmpty(elementsToInsert)) {
    await universalInvoiceService[insertService](elementsToInsert, transaction);
  }

  if (!isEmpty(elementsToDelete)) {
    await universalInvoiceService[deleteService](elementsToDelete, transaction);
  }

  if (!isEmpty(elementsToUpdate)) {
    for (const item of elementsToUpdate) {
      await universalInvoiceService[updateService](item.id, item, transaction);
    }
  }

  return { elementsToDelete, elementsToInsert };
};

/**
 *
 * @returns
 */
const getUniversalInvoiceAttributes = function () {
  return {
    attributes: [
      'id',
      'student_programme_id',
      'currency_id',
      'former_student_identifier',
      'full_name',
      'email',
      'phone_number',
      'invoice_number',
      'invoice_amount',
      'description',
      'amount_due',
      'amount_paid',
      'created_at',
      'updated_at',
      'created_by_id',
    ],
    include: [
      {
        association: 'currency',
        attributes: ['metadata_value'],
      },
      {
        association: 'reference',
        attributes: [
          'id',
          'system_prn',
          'ura_prn',
          'search_code',
          'tax_payer_name',
          'generated_by',
          'amount',
          'expiry_date',
          'is_used',
          'ip_address',
          'user_agent',
        ],
      },
      {
        association: 'transactions',
        attributes: [
          'id',
          'universal_invoice_id',
          'ura_prn',
          'system_prn',
          'branch',
          'banktxnid',
          'payment_date',
          'amount',
          'signature',
          'transaction_origin',
          'payment_mode',
          'currency',
          'mode_reference',
          'narration',
        ],
      },
      {
        association: 'invoiceReceivables',
        attributes: ['id', 'receivable_id', 'quantity', 'amount'],
        include: [
          {
            association: 'receivable',
            attributes: [
              'id',
              'account_id',
              'receivable_name',
              'description',
              'unit_cost',
            ],
            include: [
              {
                association: 'account',
                attributes: ['account_code', 'account_name'],
              },
            ],
          },
        ],
      },
      {
        association: 'createdBy',
        attributes: ['surname', 'other_names'],
      },
    ],
  };
};

module.exports = UniversalInvoiceController;
