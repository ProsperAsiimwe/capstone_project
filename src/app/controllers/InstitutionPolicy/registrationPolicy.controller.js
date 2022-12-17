const { HttpResponse } = require('@helpers');
const { registrationPolicyService } = require('@services/index');
const { isEmpty } = require('lodash');
const model = require('@models');

const http = new HttpResponse();

class RegistrationPolicyController {
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
      const records = await registrationPolicyService.findAllRecords({
        ...getRegistrationPolicyAttributes(),
      });

      http.setSuccess(
        200,
        'All Registration Policy Records Fetched Successfully',
        {
          data: records,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch All Registration Policy Records', {
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
  async createRegistrationPolicy(req, res) {
    try {
      const data = req.body;
      const { id } = req.user;

      data.created_by_id = id;

      const newList = [];

      if (!isEmpty(data.enrollment_statuses)) {
        data.enrollment_statuses.forEach((enrollmentStatus) => {
          newList.push({
            ...data,
            enrollment_status_id: enrollmentStatus,
          });
        });
      }

      const response = [];

      await model.sequelize.transaction(async (transaction) => {
        for (const item of newList) {
          const result =
            await registrationPolicyService.createRegistrationPolicy(
              item,
              transaction
            );

          response.push(result);
        }
      });

      http.setSuccess(200, 'Registration Policy Created Successfully.', {
        data: response,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, error.message);

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
  async updateRecord(req, res) {
    try {
      const { registrationPolicyId } = req.params;
      const data = req.body;

      const update = await registrationPolicyService.updateRegistrationPolicy(
        registrationPolicyId,
        data
      );
      const result = update[1][0];

      http.setSuccess(200, 'Registration Policy Record Updated Successfully', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Update This Registration Policy Record', {
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
  async deleteRecord(req, res) {
    try {
      const { id } = req.params;

      await registrationPolicyService.deleteRecord(id);
      http.setSuccess(200, 'Registration Policy Record Deleted Successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Cannot delete this Registration Policy.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

/**
 *
 * @returns
 */
const getRegistrationPolicyAttributes = function () {
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
        association: 'registrationType',
        attributes: ['id', 'metadata_value'],
      },
      {
        association: 'enrollmentStatus',
        attributes: ['id', 'metadata_value'],
      },
    ],
  };
};

module.exports = RegistrationPolicyController;
