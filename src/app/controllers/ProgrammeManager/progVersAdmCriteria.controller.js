const { HttpResponse } = require('@helpers');
const { progVersAdmCriteriaService } = require('@services/index');
const { isEmpty } = require('lodash');

const http = new HttpResponse();

class ProgVersAdmCriteriaController {
  /**
   * GET All ProgVersAdmCriterias.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async index(req, res) {
    try {
      const progVersAdmCriterias =
        await progVersAdmCriteriaService.findAllProgVersAdmCriterias();

      http.setSuccess(200, 'ProgVers AdmCriterias fetch successful', {
        progVersAdmCriterias,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to fetch progVers AdmCriterias', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * CREATE New ProgVersAdmCriteria Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async createProgVersAdmCriteria(req, res) {
    try {
      const submittedProgVersAdmCriteria = req.body;
      const { id } = req.user;
      // submittedProgVersAdmCriteria["created_by_id"] = parseInt(id, 10);
      const progVersAdmCriteria =
        await progVersAdmCriteriaService.createProgVersAdmCriteria(
          submittedProgVersAdmCriteria
        );

      http.setSuccess(201, 'ProgVersAdmCriteria created successfully', {
        progVersAdmCriteria,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to create this ProgVersAdmCriteria.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * UPDATE Specific ProgVersAdmCriteria Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async updateProgVersAdmCriteria(req, res) {
    try {
      const { id } = req.params;
      const updateProgVersAdmCriteria =
        await progVersAdmCriteriaService.updateProgVersAdmCriteria(
          id,
          req.body
        );
      const progVersAdmCriteria = updateProgVersAdmCriteria[1][0];

      http.setSuccess(200, 'ProgVersAdmCriteria updated successfully', {
        progVersAdmCriteria,
      });
      if (isEmpty(progVersAdmCriteria))
        http.setError(404, 'ProgVersAdmCriteria Data Not Found.');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to update this ProgVersAdmCriteria.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Get Specific ProgVersAdmCriteria Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async fetchProgVersAdmCriteria(req, res) {
    const { id } = req.params;
    const progVersAdmCriteria =
      await progVersAdmCriteriaService.findOneProgVersAdmCriteria({
        where: { id },
      });

    http.setSuccess(200, 'ProgVersAdmCriteria fetch successful', {
      progVersAdmCriteria,
    });
    if (isEmpty(progVersAdmCriteria))
      http.setError(404, 'ProgVersAdmCriteria Data Not Found.');

    return http.send(res);
  }

  /**
   * Destroy ProgVersAdmCriteria Data
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async deleteProgVersAdmCriteria(req, res) {
    try {
      const { id } = req.params;

      await progVersAdmCriteriaService.deleteProgVersAdmCriteria(id);
      http.setSuccess(200, 'ProgVersAdmCriteria deleted successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to delete this ProgVersAdmCriteria.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

module.exports = ProgVersAdmCriteriaController;
