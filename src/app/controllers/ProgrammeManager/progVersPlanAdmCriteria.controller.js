const { HttpResponse } = require('@helpers');
const { progVersPlanAdmCriteriaService } = require('@services/index');
const { isEmpty } = require('lodash');

const http = new HttpResponse();

class ProgVersPlanAdmCriteriaController {
  /**
   * GET All ProgVersPlanAdmCriterias.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async index(req, res) {
    try {
      const progVersPlanAdmCriterias =
        await progVersPlanAdmCriteriaService.findAllProgVersPlanAdmCriteria();

      http.setSuccess(200, 'ProgVersPlanAdmCriterias fetch successful', {
        progVersPlanAdmCriterias,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to fetch progVersPlanAdmCriterias', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * CREATE New ProgVersPlanAdmCriteria Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async createProgVersPlanAdmCriteria(req, res) {
    try {
      const submittedProgVersPlanAdmCriteria = req.body;
      const { id } = req.user;
      // submittedProgVersPlanAdmCriteria["created_by_id"] = parseInt(id, 10);
      const progVersPlanAdmCriteria =
        await progVersPlanAdmCriteriaService.createProgVersPlanAdmCriteria(
          submittedProgVersPlanAdmCriteria
        );

      http.setSuccess(201, 'ProgVersPlanAdmCriteria created successfully', {
        progVersPlanAdmCriteria,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to create this ProgVersPlanAdmCriteria.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * UPDATE Specific ProgVersPlanAdmCriteria Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async updateProgVersPlanAdmCriteria(req, res) {
    try {
      const { id } = req.params;
      const updateProgVersPlanAdmCriteria =
        await progVersPlanAdmCriteriaService.updateProgVersPlanAdmCriteria(
          id,
          req.body
        );
      const progVersPlanAdmCriteria = updateProgVersPlanAdmCriteria[1][0];

      http.setSuccess(200, 'ProgVersPlanAdmCriteria updated successfully', {
        progVersPlanAdmCriteria,
      });
      if (isEmpty(progVersPlanAdmCriteria))
        http.setError(404, 'ProgVersPlanAdmCriteria Data Not Found.');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to update this ProgVersPlanAdmCriteria.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Get Specific ProgVersPlanAdmCriteria Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async fetchProgVersPlanAdmCriteria(req, res) {
    const { id } = req.params;
    const progVersPlanAdmCriteria =
      await progVersPlanAdmCriteriaService.findOneProgVersPlanAdmCriteria({
        where: { id },
      });

    http.setSuccess(200, 'ProgVersPlanAdmCriteria fetch successful', {
      progVersPlanAdmCriteria,
    });
    if (isEmpty(progVersPlanAdmCriteria))
      http.setError(404, 'ProgVersPlanAdmCriteria Data Not Found.');

    return http.send(res);
  }

  /**
   * Destroy ProgVersPlanAdmCriteria Data
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async deleteProgVersPlanAdmCriteria(req, res) {
    try {
      const { id } = req.params;

      await progVersPlanAdmCriteriaService.deleteProgVersPlanAdmCriteria(id);
      http.setSuccess(200, 'ProgVersPlanAdmCriteria deleted successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to delete this ProgVersPlanAdmCriteria.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

module.exports = ProgVersPlanAdmCriteriaController;
