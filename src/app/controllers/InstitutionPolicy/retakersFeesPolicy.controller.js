const { HttpResponse } = require('@helpers');
const { retakersFeesPolicyService } = require('@services/index');
const { isEmpty, difference, map, isArray } = require('lodash');
const model = require('@models');

const http = new HttpResponse();

class RetakersFeesPolicyController {
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
      const records = await retakersFeesPolicyService.findAllRecords({
        where: {
          deleted_at: null,
          deleted_by_id: null,
        },
        attributes: [
          'id',
          'enrollment_status_id',
          'deleted_at',
          'deleted_by_id',
          'use_default_amount',
          'amount',
          'bill_functional_fees',
          'study_level_id',
        ],
        include: [
          {
            association: 'status',
            attributes: ['metadata_value'],
          },
          {
            association: 'studyLevel',
            attributes: ['metadata_value'],
          },
          {
            association: 'functionalElements',
            attributes: ['id', 'functional_fees_element_id'],
            include: {
              association: 'feesElement',
              attributes: [
                'fees_element_code',
                'fees_element_name',
                'description',
              ],
            },
          },
          {
            association: 'createdBy',
            attributes: ['surname', 'other_names'],
          },
          {
            association: 'createApprovedBy',
            attributes: ['surname', 'other_names'],
          },
        ],
      });

      http.setSuccess(
        200,
        'All Retakers Fees Policy Records Fetched Successfully',
        {
          data: records,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch All Retakers Fees Policy Records', {
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
  async createRecord(req, res) {
    try {
      const data = req.body;

      data.created_by_id = req.user.id;
      data.functionalElements = [];

      if (
        !isEmpty(data.functional_fees_elements) &&
        isArray(data.functional_fees_elements) &&
        data.bill_functional_fees === true
      ) {
        for (const feesElementId of data.functional_fees_elements) {
          data.functionalElements.push({
            functional_fees_element_id: feesElementId,
          });
        }
      }

      const retakersFeesPolicy = await model.sequelize.transaction(
        async (transaction) => {
          const result = await retakersFeesPolicyService.createRecord(
            data,
            transaction
          );

          return result;
        }
      );

      http.setSuccess(201, 'Retakers Fees Policy Created successfully', {
        data: retakersFeesPolicy,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable Create This Retakers Fees Policy Record', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * addElementsToPolicyRecord
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async addElementsToPolicyRecord(req, res) {
    try {
      const data = req.body;
      const { retakers_fees_policy_id: retakersFeesPolicyId } = req.params;
      const newResult = [];

      if (!isEmpty(data.functional_fees_elements)) {
        await model.sequelize.transaction(async (transaction) => {
          await retakersFeesPolicyService.updateRecord(
            retakersFeesPolicyId,
            { bill_functional_fees: true },
            transaction
          );

          for (const functionalFeesElementId of data.functional_fees_elements) {
            const queryData = {
              retakersFeesPolicyId,
              functionalFeesElementId,
            };

            const element = await retakersFeesPolicyService.addElements(
              queryData,
              transaction
            );

            newResult.push(element);
          }
        });
      }

      http.setSuccess(
        200,
        'New Functional Fees Elements Added To Retakers Fees Policy Record Successfully',
        {
          data: newResult,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable To Add New Functional Fees Elements This Retakers Fees Policy Record',
        {
          error: { message: error.message },
        }
      );

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
      const { id: retakersFeesPolicyId } = req.params;
      const data = req.body;

      let updateRecord = [];
      let newElements = [];

      await model.sequelize.transaction(async (transaction) => {
        updateRecord = await retakersFeesPolicyService.updateRecord(
          retakersFeesPolicyId,
          data,
          transaction
        );

        const findPolicyElements =
          await retakersFeesPolicyService.findPolicyElements({
            where: { retakers_fees_policy_id: retakersFeesPolicyId },
            attributes: [
              'id',
              'retakers_fees_policy_id',
              'functional_fees_element_id',
            ],
            raw: true,
          });

        if (
          (!isEmpty(data.functional_fees_elements) &&
            isArray(data.functional_fees_elements) &&
            data.bill_functional_fees === true) ||
          data.bill_functional_fees === 'true'
        ) {
          const toDeleteIds = difference(
            map(findPolicyElements, 'functional_fees_element_id'),
            data.functional_fees_elements
          );

          for (const functionalFeesElementId of data.functional_fees_elements) {
            const queryData = {
              retakersFeesPolicyId,
              functionalFeesElementId,
            };

            const element = await retakersFeesPolicyService.addElements(
              queryData,
              transaction
            );

            newElements.push(element);
          }

          if (!isEmpty(toDeleteIds)) {
            await retakersFeesPolicyService.destroyElements(
              {
                retakers_fees_policy_id: retakersFeesPolicyId,
                functional_fees_element_id: toDeleteIds,
              },
              transaction
            );
          }
        } else if (!isEmpty(findPolicyElements)) {
          await retakersFeesPolicyService.destroyElements(
            {
              retakers_fees_policy_id: retakersFeesPolicyId,
            },
            transaction
          );
        }
      });

      const retakersFeesPolicy = updateRecord[1][0];

      http.setSuccess(200, 'Retakers Fees Policy Record Updated Successfully', {
        data: { retakersFeesPolicy, newElements },
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Update This Retakers Fees Policy Record', {
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

      await retakersFeesPolicyService.deleteRecord(id);
      http.setSuccess(200, 'Retakers Fees Policy Record Deleted Successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Cannot delete this Retakers Fees Policy.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   */
  async deleteMultipleElements(req, res) {
    try {
      const data = req.body;
      const { id } = req.params;

      if (!isEmpty(data.functional_fees_elements)) {
        for (const functionalFeesElementId of data.functional_fees_elements) {
          await retakersFeesPolicyService.deleteMultipleFunctionalFeesElements(
            id,
            functionalFeesElementId
          );
        }
      }

      http.setSuccess(200, 'Fees Elements Deleted Successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to delete Fees Elements.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

module.exports = RetakersFeesPolicyController;
