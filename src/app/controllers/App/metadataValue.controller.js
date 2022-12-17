const { HttpResponse } = require('@helpers');
const { metadataValueService } = require('@services/index');
const { isEmpty } = require('lodash');

const http = new HttpResponse();

class MetadataValueController {
  /**
   * GET All Meta Data Values.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async index(req, res) {
    const metadata = await metadataValueService.findAllMetadataValues();

    http.setSuccess(200, 'Meta Data Values retrieved successfully.', {
      metadata,
    });

    return http.send(res);
  }

  /**
   * CREATE New static Parameter Value Data.
   *
   * @param {*} req Request body
   * @param {*} res Res`ponse
   *
   * @return {JSON} Return JSON Response
   */
  async createMetadataValue(req, res) {
    try {
      const data = req.body;
      const { id } = req.user;

      data.created_by_id = parseInt(id, 10);
      const metadataValue = await metadataValueService.createMetadataValue(
        data
      );

      http.setSuccess(201, 'Meta Data Value created successfully', {
        metadataValue,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to create this Meta Data Value.', {
        error: error.message,
      });

      return http.send(res);
    }
  }

  /**
   * UPDATE Specific static Parameter Value Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async updateMetadataValue(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      const updatedData = await metadataValueService.updateMetadataValue(
        id,
        data
      );
      const metadata = updatedData[1][0];

      http.setSuccess(200, 'static Parameter Value updated successfully', {
        metadata,
      });
      if (isEmpty(metadata))
        http.setError(404, 'Meta Data Value Data Not Found.');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to update this Meta Data Value.', {
        error,
      });

      return http.send(res);
    }
  }

  /**
   * Get Specific static Parameter Value Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async fetchMetadataValue(req, res) {
    const { id } = req.params;
    const metadata = await metadataValueService.findOneMetadataValue({
      where: { id },
    });

    http.setSuccess(200, 'static Parameter Value fetch successful', {
      metadata,
    });
    if (isEmpty(metadata))
      http.setError(404, 'static Parameter Value Data Not Found.');

    return http.send(res);
  }

  /**
   * Destroy static Parameter Value Data
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async deleteMetadataValue(req, res) {
    try {
      const { id } = req.params;

      await metadataValueService.deleteMetadataValue(id);
      http.setSuccess(200, 'Meta Data Value deleted successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to delete this Meta Data Value.', {
        error,
      });

      return http.send(res);
    }
  }
}

module.exports = MetadataValueController;
