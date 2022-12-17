/* eslint-disable no-underscore-dangle */
const { HttpResponse } = require('@helpers');
const {
  studentPaymentService,
  metadataValueService,
} = require('@services/index');
const model = require('@models');
const moment = require('moment');
const { isEmpty, toUpper, trim } = require('lodash');
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

class StudentPaymentController {
  /**
   * GET All StudentPayments.
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

      const newStartDate = moment(
        context.start_date.split('/').reverse().join('-')
      )
        .utcOffset(0, true)
        .format();

      const newEndDate = moment(context.end_date.split('/').reverse().join('-'))
        .utcOffset(0, true)
        .format();

      const result = [];

      if (newStartDate === newEndDate) {
        const response = await studentPaymentService.findAllStudentPayments({
          where: {
            //  created_at: newStartDate,
            created_at: {
              [Op.between]: [newStartDate, moment(newEndDate).add(1, 'days')],
            },
            student_number: context.student_number
              ? context.student_number
              : null,
          },
          ...getStudentPaymentAttributes(),
        });

        result.push(...response);
      } else {
        const response = await studentPaymentService.findAllStudentPayments({
          where: {
            created_at: {
              [Op.between]: [newStartDate, newEndDate],
            },
            student_number: context.student_number
              ? context.student_number
              : null,
          },
          ...getStudentPaymentAttributes(),
        });

        result.push(...response);
      }

      http.setSuccess(200, 'Student Payments Fetched Successfully.', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Student Payments.', {
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
  async createStudentPayment(req, res) {
    try {
      const data = req.body;

      if (req.user) {
        const user = req.user.id;

        data.created_by_id = user;
      }

      const random = Math.floor(Math.random() * moment().unix());
      const generatedInvoiceNumber = `STUD-PAY${random}`;

      data.payment_number = generatedInvoiceNumber;

      const metadataValues = await metadataValueService.findAllMetadataValues({
        include: ['metadata'],
      });

      const findCurrencyId = getMetadataValueId(
        metadataValues,
        'UGX',
        'CURRENCIES'
      );

      data.full_name = toUpper(trim(data.full_name));
      data.student_number = trim(data.student_number);
      data.currency_id = findCurrencyId;

      data.payment_mode = 'CASH';
      data.payment_bank_code = 'STN';

      const referenceNumberGenerator = await generatePaymentReference(
        data.amount,
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
        const response = await studentPaymentService.createStudentPayment(
          data,
          transaction
        );

        const prnTrackerData = {
          student_payment_id: response.dataValues.id,
          ip_address: data.reference.ip_address,
          user_agent: data.reference.user_agent,
          category: 'STUDENT',
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

        return response;
      });

      if (req.user) {
        result = create;
      } else {
        const findGeneratedInvoice = await studentPaymentService
          .findOneStudentPayment({
            where: {
              id: create.dataValues.id,
            },
            ...getStudentPaymentAttributes(),
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

      http.setSuccess(200, 'Student Payment Created Successfully.', {
        data: !isEmpty(result) ? result : {},
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Create Student Payment.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Destroy StudentPayment Data
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async deleteStudentPayment(req, res) {
    try {
      const { id } = req.params;

      const record = await studentPaymentService
        .findOneStudentPayment({
          where: {
            id,
          },
          ...getStudentPaymentAttributes(),
          nest: true,
        })
        .then(function (res) {
          if (res) {
            const result = res.toJSON();

            return result;
          }
        });

      if (!record) {
        throw new Error(`Record doesn't exist.`);
      }

      await model.sequelize.transaction(async (transaction) => {
        // get PRN status
        if (record.reference) {
          const status = await getPRNStatus(record.reference.ura_prn);

          const findStatus = findPaymentStatus(status.StatusCode);

          if (findStatus.code !== 'T' || findStatus.code !== 'R') {
            await removeStudentPaymentReferenceRecord(
              record.reference.id,
              transaction
            );
          } else {
            throw new Error(
              `A Payment Transaction Has Already Been Made With This Record's Details.`
            );
          }
        }

        await studentPaymentService.deleteStudentPayment(id, transaction);
      });

      http.setSuccess(200, 'Student Payment Deleted Successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to delete this Student Payment.', {
        error: error.message,
      });

      return http.send(res);
    }
  }

  /**
   * Get Specific StudentPayment Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async fetchStudentPaymentByInvoiceNumber(req, res) {
    try {
      const { invoiceNumber } = req.params;

      const invoice = await studentPaymentService.findOneStudentPayment({
        where: {
          invoice_number: trim(invoiceNumber),
        },
        ...getStudentPaymentAttributes(),
      });

      http.setSuccess(200, 'Student Payment Fetched successfully.', {
        data: invoice,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to fetch Student Payment.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Get Specific StudentPayment Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async fetchStudentPaymentById(req, res) {
    try {
      const { id } = req.params;

      const record = await studentPaymentService.findOneStudentPayment({
        where: {
          id,
        },
        ...getStudentPaymentAttributes(),
      });

      http.setSuccess(200, 'Student Payment Fetched successfully.', {
        data: record,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to fetch Student Payment.', {
        error: { message: error.message },
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
  async createStudentPaymentBankPaymentTransaction(req, res) {
    try {
      const data = req.body;

      data.transaction_origin = 'BANK TRANSACTION';
      data.create_approval_status = 'APPROVED';

      const paymentReference = await studentPaymentService
        .findOneStudentPaymentReference({
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
              association: 'studentPayment',
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
            await studentPaymentService.createStudentPaymentTransaction(
              data,
              transaction
            );

          await studentPaymentService.updateStudentPaymentReference(
            paymentReference.id,
            {
              is_used: true,
              expiry_date: moment.now(),
            },
            transaction
          );

          await studentPaymentService.updateStudentPayment(
            paymentReference.universal_invoice_id,
            {
              amount_paid: data.amount_paid,
              amount_due:
                paymentReference.studentPayment.amount_due - data.amount_paid,
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
  const response = await studentPaymentService.createPrnTrackerRecord(
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
const removeStudentPaymentReferenceRecord = async function (
  invoiceId,
  transaction
) {
  await studentPaymentService.deleteStudentPaymentReference(
    invoiceId,
    transaction
  );
};

/**
 *
 * @returns
 */
const getStudentPaymentAttributes = function () {
  return {
    attributes: [
      'id',
      'currency_id',
      'student_number',
      'full_name',
      'email',
      'phone_number',
      'description',
      'amount',
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
          'student_payment_id',
          'system_prn',
          'ura_prn',
          'search_code',
          'tax_payer_name',
          'generated_by',
          'amount',
          'payment_mode',
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
          'student_payment_id',
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
        association: 'createdBy',
        attributes: ['surname', 'other_names'],
      },
    ],
  };
};

module.exports = StudentPaymentController;
