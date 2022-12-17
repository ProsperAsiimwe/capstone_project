const { HttpResponse } = require('@helpers');
const { semesterLoadService } = require('@services/index');
const { isEmpty } = require('lodash');

const http = new HttpResponse();

class SemesterLoadController {
  /**
   * GET All SemesterLoads.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async index(req, res) {
    try {
      const semesterLoads = await semesterLoadService.findAllSemesterLoads({
        include: [
          {
            association: 'studyLevel',
          },
          {
            association: 'programme',
          },
        ],
      });

      http.setSuccess(200, 'SemesterLoads fetch successful', { semesterLoads });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to fetch semesterLoads', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * CREATE New SemesterLoad Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async createSemesterLoad(req, res) {
    try {
      const submittedSemesterLoad = req.body;
      const { id } = req.user;

      submittedSemesterLoad.created_by_id = parseInt(id, 10);
      const semesterLoad = await semesterLoadService.createSemesterLoad(
        submittedSemesterLoad
      );

      http.setSuccess(201, 'Semester Load created successfully', {
        semesterLoad,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to create this Semester Load.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * UPDATE Specific SemesterLoad Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async updateSemesterLoad(req, res) {
    try {
      const { id } = req.params;
      const updateSemesterLoad = await semesterLoadService.updateSemesterLoad(
        id,
        req.body
      );
      const semesterLoad = updateSemesterLoad[1][0];

      http.setSuccess(200, 'Semester Load updated successfully', {
        semesterLoad,
      });
      if (isEmpty(semesterLoad))
        http.setError(404, 'SemesterLoad Data Not Found.');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to update this Semester Load.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Get Specific SemesterLoad Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async fetchSemesterLoad(req, res) {
    const { id } = req.params;
    const semesterLoad = await semesterLoadService.findOneSemesterLoad({
      where: { id },
    });

    http.setSuccess(200, 'Semester Load fetch successful', { semesterLoad });
    if (isEmpty(semesterLoad))
      http.setError(404, 'Semester Load Data Not Found.');

    return http.send(res);
  }

  /**
   * Destroy SemesterLoad Data
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async deleteSemesterLoad(req, res) {
    try {
      const { id } = req.params;

      await semesterLoadService.deleteSemesterLoad(id);
      http.setSuccess(200, 'Semester Load deleted successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to delete this Semester Load.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

module.exports = SemesterLoadController;
