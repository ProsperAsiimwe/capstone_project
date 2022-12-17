const { HttpResponse } = require('@helpers');
const { concededPassPolicyService } = require('@services/index');
const model = require('@models');

const http = new HttpResponse();

class ConcededPassPolicyController {
  /**
   * GET All records.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async index(req, res) {
    try {
      const records = await concededPassPolicyService.findAll({
        include: [
          {
            association: 'remark',
            attributes: ['id', 'metadata_value'],
          },
          {
            association: 'grading',
            attributes: ['id', 'grading_code', 'grading_description'],
          },
          {
            association: 'createdBy',
            attributes: ['id', 'surname', 'other_names'],
          },
        ],
      });

      http.setSuccess(
        200,
        'All Conceded Pass Policy Records Fetched Successfully',
        {
          data: records,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch All Conceded Pass Policy Records', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * GET All records.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async findOne(req, res) {
    try {
      const { studyLevelConcededPassId } = req.params;

      const records = await concededPassPolicyService.findOneRecord({
        where: {
          id: studyLevelConcededPassId,
        },
        include: [
          {
            association: 'remark',
            attributes: ['id', 'metadata_value'],
          },
          {
            association: 'grading',
            attributes: ['id', 'grading_code', 'grading_description'],
          },
          {
            association: 'createdBy',
            attributes: ['id', 'surname', 'other_names'],
          },
        ],
      });

      http.setSuccess(
        200,
        'All Conceded Pass Policy Records Fetched Successfully',
        {
          data: records,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch All Conceded Pass Policy Records', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * CREATE New Record.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async create(req, res) {
    try {
      const data = req.body;
      const { id } = req.user;

      data.created_by_id = id;

      const result = await model.sequelize.transaction(async (transaction) => {
        const response = await concededPassPolicyService.create(
          data,
          transaction
        );

        return response;
      });

      http.setSuccess(200, 'Conceded Pass Policy Created Successfully.', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Create Conceded Pass Policy.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * UPDATE Specific Record.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async update(req, res) {
    try {
      const { concededPassPolicyId } = req.params;
      const data = req.body;
      const { id: userId } = req.user;

      await concededPassPolicyService.update(concededPassPolicyId, {
        number_of_sittings: data.number_of_sittings,
        maximum_number_of_cps: data.maximum_number_of_cps,
        lower_mark: data.lower_mark,
        upper_mark: data.upper_mark,
        last_updated_by_id: userId,
      });

      http.setSuccess(200, 'Conceded Pass Policy Item Updated Successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Update This Conceded Pass Policy Item', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Destroy Record Data
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async destroy(req, res) {
    try {
      const { concededPassPolicyId } = req.params;

      await concededPassPolicyService.destroy(concededPassPolicyId);
      http.setSuccess(200, 'Conceded Pass Policy Record Deleted Successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Delete This Conceded Pass Policy Record', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

module.exports = ConcededPassPolicyController;
