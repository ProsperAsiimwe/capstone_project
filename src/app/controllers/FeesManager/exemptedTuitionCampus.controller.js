const { HttpResponse } = require('@helpers');
const { exemptedTuitionCampusService } = require('@services/index');
const model = require('@models');
const { isEmpty } = require('lodash');

const http = new HttpResponse();

class ExemptedTuitionCampusController {
  /**
   * GET All ExemptedTuitionCampuses.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async index(req, res) {
    try {
      const exemptedTuitionCampuses =
        await exemptedTuitionCampusService.findAllExemptedTuitionCampuses({
          include: [
            {
              association: 'campus',
              attributes: ['id', 'metadata_value'],
            },
            {
              association: 'createdBy',
              attributes: ['id', 'surname', 'other_names'],
            },
          ],
        });

      http.setSuccess(200, 'Exempted Tuition Campus fetch successful', {
        data: exemptedTuitionCampuses,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to fetch Exempted Tuition Campus', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * CREATE New ExemptedTuitionCampus Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async createExemptedTuitionCampus(req, res) {
    try {
      const data = req.body;
      const { id } = req.user;

      const response = [];

      await model.sequelize.transaction(async (transaction) => {
        if (!isEmpty(data.campuses)) {
          for (const campus of data.campuses) {
            const campusData = {
              campus_id: campus,
              created_by_id: id,
            };

            const result =
              await exemptedTuitionCampusService.createExemptedTuitionCampus(
                campusData,
                transaction
              );

            response.push(result);
          }
        }
      });

      http.setSuccess(200, 'Exempted Tuition Campus created successfully', {
        data: response,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to create this Exempted Tuition Campus.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * UPDATE Specific ExemptedTuitionCampus Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async updateExemptedTuitionCampus(req, res) {
    try {
      const data = req.body;
      const { id } = req.params;

      const updateExemptedTuitionCampus =
        await exemptedTuitionCampusService.updateExemptedTuitionCampus(
          id,
          data
        );
      const exemptedTuitionCampus = updateExemptedTuitionCampus[1][0];

      http.setSuccess(200, 'Exempted Tuition Campus updated successfully', {
        data: exemptedTuitionCampus,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to update this Exempted Tuition Campus.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Get Specific ExemptedTuitionCampus Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async fetchExemptedTuitionCampus(req, res) {
    const { id } = req.params;
    const exemptedTuitionCampus =
      await exemptedTuitionCampusService.findOneExemptedTuitionCampus({
        where: { id },
        include: [
          {
            association: 'campus',
            attributes: ['id', 'metadata_value'],
          },
          {
            association: 'createdBy',
            attributes: ['id', 'surname', 'other_names'],
          },
        ],
      });

    http.setSuccess(200, 'Exempted Tuition Campus fetch successful', {
      data: exemptedTuitionCampus,
    });

    return http.send(res);
  }

  /**
   * Destroy ExemptedTuitionCampus Data
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async deleteExemptedTuitionCampus(req, res) {
    try {
      const { id } = req.params;

      await exemptedTuitionCampusService.deleteExemptedTuitionCampus(id);
      http.setSuccess(200, 'Exempted Tuition Campus deleted successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to delete this Exempted Tuition Campus.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

module.exports = ExemptedTuitionCampusController;
