const { HttpResponse } = require('@helpers');
const { programmeAliasService } = require('@services/index');
const { isEmpty } = require('lodash');

const http = new HttpResponse();

class ProgrammeAliasController {
  /**
   * GET All ProgrammeAliases.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async index(req, res) {
    const programmeAliases =
      await programmeAliasService.findAllProgrammeAliases();

    http.setSuccess(200, 'ProgrammeAliases', { programmeAliases });

    return http.send(res);
  }

  /**
   * CREATE New ProgrammeAlias Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async createProgrammeAlias(req, res) {
    try {
      const data = req.body;

      data.alias_code = data.alias_code.toUpperCase().trim();
      const { id } = req.user;

      data.created_by_id = parseInt(id, 10);
      const programmeAlias = await programmeAliasService.createProgrammeAlias(
        data
      );

      http.setSuccess(201, 'Programme Alias created successfully', {
        programmeAlias,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to create this Programme Alias.', {
        error: error.message,
      });

      return http.send(res);
    }
  }

  /**
   * UPDATE Specific ProgrammeAlias Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async updateProgrammeAlias(req, res) {
    try {
      const data = req.body;

      data.alias_code = data.alias_code.toUpperCase().trim();
      const { id } = req.params;
      const updateProgrammeAlias =
        await programmeAliasService.updateProgrammeAlias(id, data);
      const programmeAlias = updateProgrammeAlias[1][0];

      http.setSuccess(200, 'Programme Alias updated successfully', {
        programmeAlias,
      });
      if (isEmpty(programmeAlias))
        http.setError(404, 'Programme Alias Data Not Found.');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to update this Programme Alias.', {
        error: error.message,
      });

      return http.send(res);
    }
  }

  /**
   * Get Specific ProgrammeAlias Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async fetchProgrammeAlias(req, res) {
    const { id } = req.params;
    const programmeAlias = await programmeAliasService.findOneProgrammeAlias({
      where: { id },
    });

    http.setSuccess(200, 'Programme Alias fetch successful', {
      programmeAlias,
    });
    if (isEmpty(programmeAlias))
      http.setError(404, 'Programme Alias Data Not Found.');

    return http.send(res);
  }

  /**
   * Destroy ProgrammeAlias Data
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async deleteProgrammeAlias(req, res) {
    try {
      const { id } = req.params;

      await programmeAliasService.deleteProgrammeAlias(id);
      http.setSuccess(200, 'Programme Alias deleted successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to delete this Programme Alias.', {
        error: error.message,
      });

      return http.send(res);
    }
  }
}

module.exports = ProgrammeAliasController;
