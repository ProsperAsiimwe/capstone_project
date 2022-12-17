const { HttpResponse } = require('@helpers');
const {
  bulkPaymentService,
  universalInvoiceService,
} = require('@services/index');
const model = require('@models');
const {
  generatePRN,
  acknowledgeBulkPayment,
  refreshBulkPayment,
} = require('@helpers');
const { appConfig } = require('../../../config');
const { isEmpty, trim } = require('lodash');
const {
  generateSystemReference,
} = require('@controllers/Helpers/paymentReferenceHelper');

const http = new HttpResponse();

class BulkPaymentController {
  /**
   * GET All records.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async allPendingBulkPayments(req, res) {
    try {
      const records = await bulkPaymentService.findAllRecords({
        where: {
          payment_acknowledged: false,
        },
        include: [
          {
            association: 'createdBy',
            attributes: ['surname', 'other_names'],
          },
          {
            association: 'lastUpdatedBy',
            attributes: ['surname', 'other_names'],
          },
        ],
      });

      http.setSuccess(
        200,
        'All Pending Bulk Payment Records Fetched Successfully',
        {
          data: records,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch All Pending Bulk Payment Records', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * GET All records.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async allAcknowledgedBulkPayments(req, res) {
    try {
      const records = await bulkPaymentService.findAllRecords({
        where: {
          payment_acknowledged: true,
        },
        include: [
          {
            association: 'createdBy',
            attributes: ['surname', 'other_names'],
          },
          {
            association: 'lastUpdatedBy',
            attributes: ['surname', 'other_names'],
          },
        ],
      });

      http.setSuccess(
        200,
        'All Acknowledged Bulk Payment Records Fetched Successfully',
        {
          data: records,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable To Fetch All Acknowledged Bulk Payment Records',
        {
          error: { message: error.message },
        }
      );

      return http.send(res);
    }
  }

  /**
   * GET All records.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async refresh(req, res) {
    try {
      const refresh = await refreshBulkPayment({
        tax_head: appConfig.TAX_HEAD_CODE,
      });

      const result = [];

      if (!isEmpty(refresh.payments)) {
        const allPayments = await bulkPaymentService.findAllRecords({
          raw: true,
        });

        await model.sequelize.transaction(async (transaction) => {
          for (const eachPayment of refresh.payments) {
            const findPayment = allPayments.filter(
              (payment) => trim(payment.uuid) === trim(eachPayment.uuid)
            );

            if (isEmpty(findPayment)) {
              const payload = {};

              payload.uuid = eachPayment.uuid;
              payload.amount_paid = parseFloat(eachPayment.amount_paid);
              payload.payment_date = eachPayment.payment_date;
              payload.narration = eachPayment.narration;
              payload.transaction_code = eachPayment.transaction_code;
              payload.currency = eachPayment.currency;
              payload.payment_forwarded = eachPayment.payment_forwarded;
              payload.forwarded_on = eachPayment.forwarded_on;
              payload.email_sent = eachPayment.email_sent;
              payload.email_sent_on = eachPayment.email_sent_on;
              payload.payment_acknowledged = eachPayment.payment_acknowledged;
              payload.sponsor = eachPayment.sponsor.name;
              payload.payment_bank_code = eachPayment.payment_bank.code;
              payload.payment_bank = eachPayment.payment_bank.name;
              payload.payment_mode = eachPayment.payment_mode.code;
              payload.approved = eachPayment.approved;
              payload.approval_date = eachPayment.approval_date;
              payload.approved_by = eachPayment.approved_by;
              payload.acknowledge_prn = eachPayment.acknowledge_prn;
              payload.acknowledged_on = eachPayment.acknowledged_on;
              payload.acknowledged_by = eachPayment.acknowledged_by;

              const res = await bulkPaymentService.createRecord(
                payload,
                transaction
              );

              result.push(res);
            }
          }
        });
      }

      http.setSuccess(200, 'All Bulk Payment Records Refreshed Successfully', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Refresh All Bulk Payment Records', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * CREATE New Record.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async generatePaymentReferenceNumberForBulkPayment(req, res) {
    try {
      const { bulkPaymentId } = req.params;
      const acknowledgeBulkPaymentData = {};
      const { user } = req;
      const acknowledgerName = `${user.surname} ${user.other_names}`;
      const result = await model.sequelize.transaction(async (transaction) => {
        const bulkPaymentRecord = await bulkPaymentService.findOneRecord({
          where: {
            id: bulkPaymentId,
          },
          raw: true,
        });

        if (!bulkPaymentRecord) {
          throw new Error('The Bulk Payment Record Does not Exist.');
        }

        if (bulkPaymentRecord.payment_acknowledged === true) {
          throw new Error('The Bulk Payment Has Already Been Acknowledged.');
        }

        const referenceNumberGenerator = await generatePaymentReference(
          bulkPaymentRecord.amount_paid,
          bulkPaymentRecord.sponsor,
          bulkPaymentRecord.payment_mode,
          bulkPaymentRecord.payment_bank_code,
          bulkPaymentRecord.payment_mobile_no
        );

        acknowledgeBulkPaymentData.tax_head = appConfig.TAX_HEAD_CODE;
        acknowledgeBulkPaymentData.payment_uuid = bulkPaymentRecord.uuid;
        acknowledgeBulkPaymentData.prn = referenceNumberGenerator.ura_prn;
        acknowledgeBulkPaymentData.acknowledged_by = acknowledgerName;

        const acknowledgementResponse = await acknowledgeBulkPayment(
          acknowledgeBulkPaymentData
        );

        if (
          acknowledgementResponse.payment.payment_acknowledged === true ||
          acknowledgementResponse.payment.payment_acknowledged === 'true'
        ) {
          const updateBulkPaymentData = {
            acknowledge_prn: acknowledgementResponse.payment.acknowledge_prn,
            acknowledged_on: acknowledgementResponse.payment.acknowledged_on,
            acknowledged_by: acknowledgementResponse.payment.acknowledged_by,
            payment_acknowledged: true,
            system_prn: referenceNumberGenerator.system_prn,
            search_code: referenceNumberGenerator.search_code,
            expiry_date: referenceNumberGenerator.expiry_date,
            created_by_id: user.id,
          };

          const updateRecord = await bulkPaymentService.updateRecord(
            bulkPaymentId,
            updateBulkPaymentData,
            transaction
          );

          const prnTrackerPayload = {
            ...updateBulkPaymentData,
            ...referenceNumberGenerator,
            payment_mode: bulkPaymentRecord.payment_mode,
            payment_bank_code: bulkPaymentRecord.payment_bank_code,
            payment_mobile_no: bulkPaymentRecord.payment_mobile_no,
            category: 'BULK-PAYMENTS',
            ip_address: req.connection.remoteAddress,
            generated_by: acknowledgerName,
            user_agent: req.get('user-agent'),
            is_used: false,
          };

          await universalInvoiceService.createPrnTrackerRecord(
            prnTrackerPayload,
            transaction
          );

          const bulkPayment = updateRecord[1][0];

          return bulkPayment;
        } else {
          throw new Error(
            `The Bulk Payment Record Was Not Acknowledged By URA.`
          );
        }
      });

      http.setSuccess(200, 'Bulk Payment Acknowledged Successfully.', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Acknowledge This Bulk Payment.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * CREATE New Record.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async createBulkPayment(req, res) {
    try {
      const data = req.body[0];
      const payload = {};

      payload.uuid = data.uuid;
      payload.amount_paid = parseFloat(data.amount_paid);
      payload.payment_date = data.payment_date;
      payload.narration = data.narration;
      payload.transaction_code = data.transaction_code;
      payload.currency = data.currency;
      payload.payment_forwarded = data.payment_forwarded;
      payload.forwarded_on = data.forwarded_on;
      payload.email_sent = data.email_sent;
      payload.email_sent_on = data.email_sent_on;
      payload.payment_acknowledged = data.payment_acknowledged;
      payload.sponsor = data.sponsor.name;
      payload.payment_bank_code = data.payment_bank.code;
      payload.payment_bank = data.payment_bank.name;
      payload.payment_mode = data.payment_mode.code;

      const result = await model.sequelize.transaction(async (transaction) => {
        const res = await bulkPaymentService.createRecord(payload, transaction);

        return res;
      });

      http.setSuccess(200, 'Bulk Payment Created Successfully.', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Create This Bulk Payment.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * UPDATE Specific Record.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async updateBulkPayment(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      const updateRecord = await bulkPaymentService.updateRecord(id, data);
      const bulkPayment = updateRecord[1][0];

      http.setSuccess(200, 'Bulk Payment Record Updated Successfully', {
        data: bulkPayment,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Update This Bulk Payment Record', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Destroy Record Data
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async deleteBulkPayment(req, res) {
    try {
      const { id } = req.params;

      await bulkPaymentService.deleteRecord(id);
      http.setSuccess(200, 'Bulk Payment Record Deleted Successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Delete This Bulk Payment Record', {
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

    payload.tax_head = appConfig.TAX_HEAD_CODE;
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
      ExpiryDays: appConfig.BULK_PAYMENT_REFERENCE_EXPIRES_IN,
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

module.exports = BulkPaymentController;
