const { HttpResponse } = require('@helpers');
const { feesWaiverService } = require('@services/index');
const { isEmpty } = require('lodash');

const http = new HttpResponse();

class FeesWaiverController {
  /**
   * GET All FeesWaivers.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async index(req, res) {
    try {
      const feesWaivers = await feesWaiverService.findAllFeesWaivers();

      http.setSuccess(200, 'Fees Waiver fetch successful', {
        feesWaivers,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to fetch Fees Waiver', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * CREATE New FeesWaiver Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async createFeesWaiver(req, res) {
    try {
      const data = req.body;
      const { id } = req.user;

      data.created_by_id = parseInt(id, 10);
      data.fees_waiver_code = data.fees_waiver_code.toUpperCase().trim();
      data.fees_waiver_name = data.fees_waiver_name.toUpperCase().trim();

      const feesWaiver = await feesWaiverService.createFeesWaiver(data);

      http.setSuccess(201, 'Fees Waiver created successfully', {
        feesWaiver,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to create this Fees Waiver.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * UPDATE Specific FeesWaiver Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async updateFeesWaiver(req, res) {
    try {
      const data = req.body;
      const { id } = req.params;

      data.fees_waiver_code = data.fees_waiver_code.toUpperCase().trim();
      data.fees_waiver_name = data.fees_waiver_name.toUpperCase().trim();
      data.description = data.description.toUpperCase().trim();

      const updateFeesWaiver = await feesWaiverService.updateFeesWaiver(
        id,
        data
      );
      const feesWaiver = updateFeesWaiver[1][0];

      http.setSuccess(200, 'Fees Waiver updated successfully', {
        data: feesWaiver,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to update this Fees Waiver.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Get Specific FeesWaiver Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async fetchFeesWaiver(req, res) {
    const { id } = req.params;
    const feesWaiver = await feesWaiverService.findOneFeesWaiver({
      where: { id },
    });

    http.setSuccess(200, 'Fees Waiver fetch successful', {
      feesWaiver,
    });
    if (isEmpty(feesWaiver)) http.setError(404, 'Fees Waiver Data Not Found.');

    return http.send(res);
  }

  /**
   * Destroy FeesWaiver Data
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async deleteFeesWaiver(req, res) {
    try {
      const { id } = req.params;

      await feesWaiverService.deleteFeesWaiver(id);
      http.setSuccess(200, 'Fees Waiver deleted successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to delete this Fees Waiver.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

module.exports = FeesWaiverController;
