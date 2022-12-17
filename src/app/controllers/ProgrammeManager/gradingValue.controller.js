const { HttpResponse } = require('@helpers');
const { gradingValueService } = require('@services/index');
const { isEmpty } = require('lodash');

const http = new HttpResponse();

class GradingValueController {
  /**
   * GET All GradingValues.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async index(req, res) {
    try {
      const gradingValues = await gradingValueService.findAllGradingValues();

      http.setSuccess(200, 'GradingValues fetch successful', { gradingValues });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to fetch gradingValues', {
        error: error.message,
      });

      return http.send(res);
    }
  }

  /**
   * CREATE New GradingValue Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async createGradingValue(req, res) {
    try {
      const submittedGradingValue = req.body;
      const { id } = req.user;

      submittedGradingValue.created_by_id = parseInt(id, 10);
      const gradingValue = await gradingValueService.createGradingValue(
        submittedGradingValue
      );

      http.setSuccess(201, 'GradingValue created successfully', {
        gradingValue,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to create this GradingValue.', {
        error: error.message,
      });

      return http.send(res);
    }
  }

  /**
   * UPDATE Specific GradingValue Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async updateGradingValue(req, res) {
    try {
      const { id } = req.params;
      const updateGradingValue = await gradingValueService.updateGradingValue(
        id,
        req.body
      );
      const gradingValue = updateGradingValue[1][0];

      http.setSuccess(200, 'GradingValue updated successfully', {
        gradingValue,
      });
      if (isEmpty(gradingValue))
        http.setError(404, 'GradingValue Data Not Found.');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to update this GradingValue.', {
        error: error.message,
      });

      return http.send(res);
    }
  }

  async updateManyGradingValues(req, res) {
    try {
      const { gradingId } = req.params;
      const updateGradingValues =
        await gradingValueService.updateManyGradingValues(gradingId, req.body);

      http.setSuccess(200, 'Grading Values updated successfully', {
        updateGradingValues,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to update these GradingValues.', {
        error: error.message,
      });

      return http.send(res);
    }
  }

  /**
   * Get Specific GradingValue Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async fetchGradingValue(req, res) {
    const { id } = req.params;
    const gradingValue = await gradingValueService.findOneGradingValue({
      where: { id },
    });

    http.setSuccess(200, 'GradingValue fetch successful', { gradingValue });
    if (isEmpty(gradingValue))
      http.setError(404, 'GradingValue Data Not Found.');

    return http.send(res);
  }

  /**
   * Destroy GradingValue Data
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async deleteGradingValue(req, res) {
    try {
      const { id } = req.params;

      await gradingValueService.deleteGradingValue(id);
      http.setSuccess(200, 'GradingValue deleted successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to delete this GradingValue.', {
        error: error.message,
      });

      return http.send(res);
    }
  }
}

module.exports = GradingValueController;
