const { HttpResponse } = require('@helpers');
const { gradingService, gradingValueService } = require('@services/index');
const { isEmpty, slice, map, entries } = require('lodash');
const models = require('@models');

const http = new HttpResponse();

class GradingController {
  /**
   * GET All Gradings.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async index(req, res) {
    try {
      const gradings = await gradingService.findAllGrading({
        order: [['created_at', 'desc']],
        ...getGradingAttributes(),
      });

      http.setSuccess(200, 'Result Grading System', { gradings });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to fetch Grading system', {
        error: error.message,
      });

      return http.send(res);
    }
  }

  /**
   * CREATE New Grading Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async createGrading(req, res) {
    try {
      const data = req.body;
      const { id } = req.user;

      data.created_by_id = parseInt(id, 10);

      const values = [];

      if (!isEmpty(data.values)) {
        data.values.forEach((value) =>
          values.push({ ...value, created_by_id: id })
        );
      }

      data.values = values;

      const grading = await models.sequelize.transaction(
        async (transaction) => {
          const result = await gradingService.createGrading(data, transaction);

          return result;
        }
      );

      http.setSuccess(201, 'Grading created successfully', { grading });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to create this Grading.', {
        error: error.message,
      });

      return http.send(res);
    }
  }

  /**
   * UPDATE Specific Grading Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async updateGrading(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      const { id: userID } = req.user;

      const findGrading = await gradingService
        .findOneGrading({
          where: { id },
          include: [
            {
              association: 'values',
              separate: true,
              attributes: ['id'],
            },
          ],
          plain: true,
        })
        .then((res) => (res ? res.toJSON() : null));

      if (!findGrading) throw new Error('Unable to find this grading');

      await models.sequelize.transaction(async (transaction) => {
        await gradingService.updateGrading(id, data, transaction);

        if (isEmpty(data.values)) {
          await gradingValueService.deleteGradingValue({
            where: { grading_id: id },
            transaction,
          });
        } else {
          for (const [index, grading] of entries(findGrading.values)) {
            if (index < data.values.length) {
              await gradingValueService.updateGradingValue(
                grading.id,
                data.values[index],
                transaction
              );
            }
          }

          const toInsert = slice(data.values, findGrading.values.length);
          const toDelete = slice(findGrading.values, data.values.length);

          // CREATE NEW VALUES
          if (!isEmpty(toInsert)) {
            const payload = map(toInsert, (value) => ({
              ...value,
              grading_id: id,
              created_by_id: userID,
            }));

            await gradingValueService.bulkCreateValues(payload, transaction);
          }

          // DELETE OLD VALUES
          if (!isEmpty(toDelete)) {
            const payload = map(toDelete, 'id');

            await gradingValueService.deleteGradingValue(
              { where: { id: payload } },
              transaction
            );
          }
        }
      });

      http.setSuccess(200, 'Grading updated successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to update this Grading.', {
        error: error.message,
      });

      return http.send(res);
    }
  }

  /**
   * Get Specific Grading Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async fetchGrading(req, res) {
    const { id } = req.params;
    const grading = await gradingService.findOneGrading({
      where: { id },
      ...getGradingAttributes(),
    });

    http.setSuccess(200, 'Grading fetch successful', { grading });
    if (isEmpty(grading)) http.setError(404, 'Grading Data Not Found.');

    return http.send(res);
  }

  /**
   * Destroy Grading Data
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async deleteGrading(req, res) {
    try {
      const { id } = req.params;

      await gradingService.deleteGrading(id);
      http.setSuccess(200, 'Grading deleted successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to delete this Grading.', {
        error: error.message,
      });

      return http.send(res);
    }
  }
}

const getGradingAttributes = function () {
  return {
    attributes: {
      exclude: [
        'created_at',
        'updated_at',
        'deleted_at',
        'createdById',
        'createApprovedById',
        'lastUpdatedById',
        'lastUpdateApprovedById',
        'deletedById',
        'deleteApprovedById',
        'deleteApprovedById',
      ],
    },
    include: [
      {
        association: 'values',
        separate: true,
        order: [['min_value', 'desc']],
      },
    ],
  };
};

module.exports = GradingController;
