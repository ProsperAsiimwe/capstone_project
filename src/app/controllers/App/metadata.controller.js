const { HttpResponse } = require('@helpers');
const { metadataService } = require('@services/index');
const { isEmpty, filter, includes, toUpper } = require('lodash');

const http = new HttpResponse();

class MetadataController {
  /**
   * GET All Metadata.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async index(req, res) {
    try {
      const metadata = await metadataService.findAllMetadata({
        include: { all: true },
        order: ['metadata_name'],
      });

      http.setSuccess(200, 'Meta Data retrieved successfully.', {
        metadata,
      });

      return http.send(res);
    } catch (error) {
      http.setSuccess(400, 'Unable to fetch Meta Data', {
        error: { error: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * GET All Metadata For Students.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async getMetadataForStudents(req, res) {
    try {
      const metadata = await metadataService.findAllMetadata({
        attributes: ['id', 'metadata_name'],
        include: [
          {
            association: 'metadataValues',
            separate: true,
            attributes: ['id', 'metadata_value'],
            order: ['metadata_value'],
          },
        ],
        order: ['metadata_name'],
      });

      const studentMetadata = [
        'ACADEMIC YEARS',
        'CAMPUSES',
        'STUDY YEARS',
        'PROGRAMME STUDY LEVELS',
        'ENROLLMENT STATUSES',
        'CHANGE OF PROGRAMME TYPES',
        'REGISTRATION STATUSES',
        'REGISTRATION TYPES',
      ];

      const filteredMetadata = filter(metadata, (m) =>
        includes(studentMetadata, toUpper(m.metadata_name))
      );

      http.setSuccess(200, 'Student Metadata', {
        metadata: filteredMetadata,
      });

      return http.send(res);
    } catch (error) {
      http.setSuccess(400, 'Unable to fetch Meta Data', {
        error: { error: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * CREATE New Metadata Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async createMetadata(req, res) {
    try {
      const data = req.body;
      const { id } = req.user;

      data.created_by_id = parseInt(id, 10);
      data.is_editable = true;
      data.metadata_type = 'USER DEFINED';
      data.metadata_name = data.metadata_name.toUpperCase();
      const metadata = await metadataService.createMetadata(data);

      http.setSuccess(201, 'Meta Data created successfully', {
        metadata,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to create this Metadata.', {
        error: error.message,
      });

      return http.send(res);
    }
  }

  /**
   * UPDATE Specific Metadata Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async updateMetadata(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      data.metadata_name = data.metadata_name.toUpperCase();
      const updateMetadata = await metadataService.updateMetadata(id, data);
      const metadata = updateMetadata[1][0];

      http.setSuccess(200, 'Meta Data updated successfully', {
        metadata,
      });
      if (isEmpty(metadata)) http.setError(404, 'Meta Data Data Not Found.');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to update this Meta Data.', { error });

      return http.send(res);
    }
  }

  /**
   * Get Specific Metadata Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async fetchMetadata(req, res) {
    try {
      const { id } = req.params;
      const metadata = await metadataService.findOneMetadata({
        where: { id },
        include: { all: true },
      });

      http.setSuccess(200, 'Meta Data fetch successful', {
        metadata,
      });
      if (isEmpty(metadata)) http.setError(404, 'Metadata Data Not Found.');

      return http.send(res);
    } catch (error) {
      http.setSuccess(400, 'Unable to fetch this Meta Data', {
        error: { error: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Destroy Metadata Data
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async deleteMetadata(req, res) {
    try {
      const { id } = req.params;

      await metadataService.deleteMetadata(id);
      http.setSuccess(200, 'Meta Data deleted successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to delete this Metadata.', { error });

      return http.send(res);
    }
  }
}

module.exports = MetadataController;
