/* eslint-disable no-underscore-dangle */
const { HttpResponse } = require('@helpers');
const { paymentReferenceService, invoiceService } = require('@services/index');
const { isEmpty, pick } = require('lodash');
const {
  generatePaymentReference,
  generatePaymentReferenceForAllUnpaidInvoices,
  createPaymentReferenceForFuture,
  generatePaymentReferenceForSelectUnpaidInvoices,
  getStudentPaymentReferences,
} = require('../Helpers/paymentReferenceRecord');
const axios = require('axios');
const envConfig = require('../../../config/app');
const {
  findPaymentStatus,
  updateStudentPRNTransaction,
} = require('@controllers/Helpers/paymentReferenceHelper');

const http = new HttpResponse();

class PaymentReferenceController {
  /**
   * GET All paymentReferences.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async getStudentPaymentReferenceRecordsByStudent(req, res) {
    try {
      const studentId = req.user.id;
      const paymentReferences = await getStudentPaymentReferences(studentId);

      http.setSuccess(200, 'Payment References Fetched Successfully', {
        paymentReferences,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Payment References', {
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
  async getStudentPaymentReferenceRecordsByStaff(req, res) {
    try {
      const { student_id: studentId } = req.params;
      const studentPaymentReferences = await getStudentPaymentReferences(
        studentId
      );

      http.setSuccess(200, 'Payment References Fetched Successfully', {
        data: studentPaymentReferences,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Payment Reference', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * GENERATING PAYMENT REFERENCES BY STAFF
   */

  /**
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async createPaymentReferenceForSpecificEnrollmentRecordByStaff(req, res) {
    try {
      const data = req.body;
      const staffId = req.user.id;

      data.generated_by = 'STAFF';
      data.created_by_id = staffId;

      const reference = await generatePaymentReference(data);

      http.setSuccess(201, 'Payment Reference Generated successfully', {
        data: reference,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to Generate Payment References.', {
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
  async createPaymentReferenceForAllUnpaidInvoicesByStaff(req, res) {
    try {
      const { student_id: studentId } = req.params;
      const data = req.body;

      const staffId = req.user.id;
      const arrayOfTuitionInvoices = [];
      const arrayOfFunctionalInvoices = [];
      const arrayOfOtherFeesInvoices = [];
      const arrayOfManualInvoices = [];

      const allUnpaidInvoices = await invoiceService.findAllValidUnpaidInvoices(
        studentId
      );

      const allUnpaidManualInvoices =
        await invoiceService.findAllUnpaidManualInvoices(studentId);

      if (allUnpaidInvoices.manual_invoices) {
        allUnpaidInvoices.manual_invoices =
          allUnpaidManualInvoices.manual_invoices;
      } else {
        allUnpaidInvoices.manual_invoices = [];
      }

      let reference = {};

      if (allUnpaidInvoices) {
        if (!isEmpty(allUnpaidInvoices.tuition_invoices)) {
          arrayOfTuitionInvoices.push(...allUnpaidInvoices.tuition_invoices);
        }
        if (!isEmpty(allUnpaidInvoices.functional_fees_invoices)) {
          arrayOfFunctionalInvoices.push(
            ...allUnpaidInvoices.functional_fees_invoices
          );
        }
        if (!isEmpty(allUnpaidInvoices.other_fees_invoices)) {
          arrayOfOtherFeesInvoices.push(
            ...allUnpaidInvoices.other_fees_invoices
          );
        }
        if (!isEmpty(allUnpaidInvoices.manual_invoices)) {
          arrayOfManualInvoices.push(...allUnpaidInvoices.manual_invoices);
        }

        const payload = {
          tuition_invoices: arrayOfTuitionInvoices,
          functional_fees_invoices: arrayOfFunctionalInvoices,
          other_fees_invoices: arrayOfOtherFeesInvoices,
          manual_invoices: !isEmpty(arrayOfManualInvoices)
            ? arrayOfManualInvoices[0].manual_invoices
            : [],
          student_id: studentId,
          generated_by: 'STAFF',
          created_by_id: staffId,
          payment_mode: data.payment_mode,
          tax_payer_bank_code: data.tax_payer_bank_code,
        };

        reference = await generatePaymentReferenceForAllUnpaidInvoices(payload);
      } else {
        throw new Error(
          `There Are No Unpaid Invoices To Generate A Payment Reference For.`
        );
      }

      http.setSuccess(200, 'Payment Reference Generated successfully', {
        data: reference,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to Generate Payment References.', {
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
  async createPaymentReferenceForAllUnpaidInvoicesByStudent(req, res) {
    try {
      const studentId = req.user.id;
      const data = req.body;

      const arrayOfTuitionInvoices = [];
      const arrayOfFunctionalInvoices = [];
      const arrayOfOtherFeesInvoices = [];
      const arrayOfManualInvoices = [];

      const allUnpaidInvoices = await invoiceService.findAllValidUnpaidInvoices(
        studentId
      );

      const allUnpaidManualInvoices =
        await invoiceService.findAllUnpaidManualInvoices(studentId);

      // if (allUnpaidInvoices.manual_invoices) {
      //   allUnpaidInvoices.manual_invoices =
      //     allUnpaidManualInvoices.manual_invoices;
      // } else {
      //   allUnpaidInvoices.manual_invoices = [];
      // }

      let reference = {};

      if (allUnpaidInvoices) {
        if (!isEmpty(allUnpaidInvoices.tuition_invoices)) {
          arrayOfTuitionInvoices.push(...allUnpaidInvoices.tuition_invoices);
        }
        if (!isEmpty(allUnpaidInvoices.functional_fees_invoices)) {
          arrayOfFunctionalInvoices.push(
            ...allUnpaidInvoices.functional_fees_invoices
          );
        }
        if (!isEmpty(allUnpaidInvoices.other_fees_invoices)) {
          arrayOfOtherFeesInvoices.push(
            ...allUnpaidInvoices.other_fees_invoices
          );
        }
        if (!isEmpty(allUnpaidManualInvoices.manual_invoices)) {
          arrayOfManualInvoices.push(
            ...allUnpaidManualInvoices.manual_invoices
          );
        }

        const payload = {
          tuition_invoices: arrayOfTuitionInvoices,
          functional_fees_invoices: arrayOfFunctionalInvoices,
          other_fees_invoices: arrayOfOtherFeesInvoices,
          manual_invoices: !isEmpty(arrayOfManualInvoices)
            ? arrayOfManualInvoices[0].manual_invoices
            : [],
          student_id: studentId,
          generated_by: 'STUDENT',
          payment_mode: data.payment_mode,
          payment_bank_code: data.payment_bank_code,
          tax_payer_bank_code: data.tax_payer_bank_code,
        };

        reference = await generatePaymentReferenceForAllUnpaidInvoices(payload);
      } else {
        throw new Error(
          `There Are No Unpaid Invoices To Generate A Payment Reference For.`
        );
      }

      http.setSuccess(200, 'Payment Reference Generated successfully', {
        data: reference,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to Generate Payment References.', {
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
  async createPaymentReferenceForSelectedUnpaidInvoices(req, res) {
    try {
      const data = req.body;
      const { student_id: studentId } = req.params;
      const staffId = req.user.id;

      data.generated_by = 'STAFF';
      data.created_by_id = staffId;
      data.student_id = studentId;

      const reference = await generatePaymentReferenceForSelectUnpaidInvoices(
        data
      );

      http.setSuccess(200, 'Payment Reference Generated successfully', {
        data: reference,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to Generate Payment References.', {
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
  async createPaymentReferenceForSelectedUnpaidInvoicesByStudent(req, res) {
    try {
      const data = req.body;

      data.student_id = req.user.id;

      data.generated_by = 'STUDENT';

      const reference = await generatePaymentReferenceForSelectUnpaidInvoices(
        data
      );

      http.setSuccess(200, 'Payment Reference Generated successfully', {
        data: reference,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to Generate Payment References.', {
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
  async createPaymentReferenceForFuturePayments(req, res) {
    try {
      const data = req.body;
      const { student_id: studentId } = req.params;
      const staffId = req.user.id;

      data.generated_by = 'STAFF';
      data.created_by_id = staffId;
      data.student_id = studentId;

      const reference = await createPaymentReferenceForFuture(data);

      http.setSuccess(201, 'Payment Reference Generated successfully', {
        data: reference,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to Generate Payment References.', {
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
  async createPaymentReferenceForFuturePaymentsByStudent(req, res) {
    try {
      const data = req.body;
      const studentId = req.user.id;

      data.generated_by = 'STUDENT';
      data.student_id = studentId;

      const reference = await createPaymentReferenceForFuture(data);

      http.setSuccess(200, 'Payment Reference Generated successfully', {
        data: reference,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to Generate Payment References.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /** createPaymentReferenceByStudent
   *
   * @param {*} req
   * @param {*} res
   */
  async createPaymentReferenceByStudent(req, res) {
    try {
      const data = req.body;
      const { id: studentId, surname, other_names: otherNames } = req.user;

      data.generated_by = 'STUDENT';
      data.student_id = studentId;

      data.studentName = `${surname} ${otherNames}`;

      const reference = await generatePaymentReference(data);

      http.setSuccess(200, 'Payment Reference Generated successfully', {
        data: reference,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to Generate Payment References.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * UPDATE Specific Payment Reference Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async updatePaymentReference(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      const updatePaymentReference =
        await paymentReferenceService.updatePaymentReference(id, data);
      const paymentReference = updatePaymentReference[1][0];

      http.setSuccess(200, 'Payment Reference Updated Successfully', {
        paymentReference,
      });
      if (isEmpty(paymentReference))
        http.setError(404, 'Payment Reference Data Not Found');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Update This Payment Reference', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Get Specific Payment Reference Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async fetchPaymentReference(req, res) {
    try {
      const { id } = req.params;
      const paymentReference =
        await paymentReferenceService.findOnePaymentReference({
          where: { id },
          //  ...getPaymentReferenceAttributes(),
        });

      http.setSuccess(200, 'Payment Reference fetch successful', {
        paymentReference,
      });
      if (isEmpty(paymentReference))
        http.setError(404, 'Payment Reference Data Not Found');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable Payment Reference.', {
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
  async getPRNStatus(req, res) {
    try {
      const { prn } = req.params;
      const status = await axios({
        method: 'get',
        url: `${envConfig.BRIDGE_BASE_URL}/api/payments-prn/status/${prn}`,
      })
        .then((res) => res.data.__values__)
        .catch((error) => {
          throw new Error(error.message);
        });

      http.setSuccess(200, 'Payment Reference Status fetched successful', {
        data: status,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Get Payment Reference Status.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Search Student PRN
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async searchStudentPRN(req, res) {
    try {
      const { prn } = req.params;
      const student = req.user;

      const findStudentPRN =
        await paymentReferenceService.findOnePaymentReference({
          where: {
            ura_prn: prn,
            student_id: student.id,
          },
          raw: true,
        });

      if (!findStudentPRN) {
        throw new Error(`Invalid Payment Reference Number ${prn}`);
      }

      let status = await axios({
        method: 'get',
        url: `${envConfig.BRIDGE_BASE_URL}/api/payments-prn/status/${prn}`,
      })
        .then((res) => res.data.__values__)
        .catch((error) => {
          throw new Error(error.message);
        });

      const findStatus = findPaymentStatus(status.StatusCode);
      const pickValues = pick(status, [
        'AmountPaid',
        'PRN',
        'PaymentExpiryDate',
        'PaymentBank',
        'StatusCode',
        'Currency',
        'StatusDesc',
        'TaxPayerName',
      ]);

      if (findStatus) {
        status = { ...pickValues, ...findStatus };
      }

      if (findStatus.code === 'T') {
        await updateStudentPRNTransaction(findStudentPRN, status);
      }

      http.setSuccess(200, 'Payment Reference Status fetched successful', {
        data: status,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Get Payment Reference Status.', {
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
  async cancelPRNStatus(req, res) {
    try {
      const { prn } = req.params;

      let status = {};

      await axios({
        method: 'delete',
        url: `${envConfig.BRIDGE_BASE_URL}/api/payments-prn/cancel/${prn}`,
      })
        .then((res) => {
          const response = res.data.__values__;

          status = response;
        })
        .catch((error) => {
          throw new Error(error.message);
        });

      http.setSuccess(200, 'Payment Reference Status Deleted Successful', {
        data: status,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Delete Payment Reference.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Destroy Payment Reference Data
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async deletePaymentReference(req, res) {
    try {
      const { id } = req.params;

      await paymentReferenceService.deletePaymentReference(id);
      http.setSuccess(200, 'Payment Reference Deleted Successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Delete This Payment Reference', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

module.exports = PaymentReferenceController;
