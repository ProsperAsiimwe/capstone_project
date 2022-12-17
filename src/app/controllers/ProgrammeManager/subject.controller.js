const { HttpResponse } = require('@helpers');
const { subjectService } = require('@services/index');
const { isEmpty } = require('lodash');

const http = new HttpResponse();

class SubjectController {
  /**
   * GET All Subjects.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async index(req, res) {
    try {
      const subjects = await subjectService.findAllSubjects();

      http.setSuccess(200, 'Subjects Fetched Successfully.', { subjects });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Error fetching Subjects', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * CREATE New Subject Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async createSubject(req, res) {
    try {
      const submittedSubject = req.body;
      const { id } = req.user;

      submittedSubject.created_by_id = parseInt(id, 10);
      const subject = await subjectService.createSubject(submittedSubject);

      http.setSuccess(201, 'Subject created successfully', { subject });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to create this Subject.', { error });

      return http.send(res);
    }
  }

  /**
   * UPDATE Specific Subject Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async updateSubject(req, res) {
    try {
      const { id } = req.params;
      const updateSubject = await subjectService.updateSubject(id, req.body);
      const subject = updateSubject[1][0];

      http.setSuccess(200, 'Subject updated successfully', { subject });
      if (isEmpty(subject)) http.setError(404, 'Subject Data Not Found.');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to update this Subject.', { error });

      return http.send(res);
    }
  }

  /**
   * Get Specific Subject Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async fetchSubject(req, res) {
    const { id } = req.params;
    const subject = await subjectService.findOneSubject({ where: { id } });

    http.setSuccess(200, 'Subject fetch successful', { subject });
    if (isEmpty(subject)) http.setError(404, 'Subject Data Not Found.');

    return http.send(res);
  }

  /**
   * Destroy Subject Data
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async deleteSubject(req, res) {
    try {
      const { id } = req.params;

      await subjectService.deleteSubject(id);
      http.setSuccess(200, 'Subject deleted successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to delete this Subject.', { error });

      return http.send(res);
    }
  }
}

module.exports = SubjectController;
