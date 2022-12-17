const {
  updatePRNTransaction,
  manuallyOverridePRNTransaction,
  confirmManualOverridePRNTransaction,
  balanceStudentInvoiceElements,
  balanceInvoicesFromStudentTransactions,
} = require('@controllers/Helpers/paymentReferenceHelper');
const { HttpResponse } = require('@helpers');
const { systemPRNTrackerService } = require('@services/index');

const http = new HttpResponse();

class SystemPRNTrackerController {
  /**
   * GET All records.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async index(req, res) {
    try {
      const records = await systemPRNTrackerService.findAllSystemPRNTrackers(
        {}
      );

      http.setSuccess(
        200,
        'All System PRN Tracker Records Fetched Successfully',
        {
          data: records,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch All System PRN Tracker Records', {
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
  async acknowledgePaymentsByURA(req, res) {
    try {
      const data = req.body;
      const result = await updatePRNTransaction(data);

      http.setSuccess(200, 'Payment Notified Successfully.', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Notify Payment.', {
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
  async manuallyOverrideStudentTransaction(req, res) {
    try {
      const result = await manuallyOverridePRNTransaction();

      http.setSuccess(200, 'Payment Transactions Updated Successfully.', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Update Payment Transactions.', {
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
  async confirmManualOverrideStudentTransaction(req, res) {
    try {
      const result = await confirmManualOverridePRNTransaction();

      http.setSuccess(
        200,
        'Payment Transactions Update Confirmed Successfully.',
        {
          data: result,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Confirm Update Of Payment Transactions.', {
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
  async manuallyBalanceInvoicesFromStudentTransactions(req, res) {
    try {
      const result = await balanceInvoicesFromStudentTransactions();

      http.setSuccess(200, 'Invoices Balanced Successfully.', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Balance Invoices.', {
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
  async manuallyBalanceStudentInvoiceElements(req, res) {
    try {
      const result = await balanceStudentInvoiceElements();

      http.setSuccess(200, 'Invoice Elements Balanced Successfully.', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Balance Invoice Elements.', {
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
  async updateSystemPRNTracker(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      const updateRecord = await systemPRNTrackerService.updateRecord(id, data);
      const systemPRNTracker = updateRecord[1][0];

      http.setSuccess(200, 'System PRN Tracker Record Updated Successfully', {
        data: systemPRNTracker,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Update This System PRN Tracker Record', {
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
  async deleteSystemPRNTracker(req, res) {
    try {
      const { id } = req.params;

      await systemPRNTrackerService.deleteRecord(id);
      http.setSuccess(200, 'System PRN Tracker Record Deleted Successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Delete This System PRN Tracker Record', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

module.exports = SystemPRNTrackerController;
