const { HttpResponse } = require('@helpers');
const { studentServicePolicyService } = require('@services/index');
const { isEmpty } = require('lodash');
const moment = require('moment');
const model = require('@models');

const http = new HttpResponse();

class StudentServicePolicyController {
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
      const records = await studentServicePolicyService.findAllRecords({
        include: [
          {
            association: 'account',
            attributes: ['account_code', 'account_name'],
          },
          {
            association: 'serviceType',
            attributes: ['id', 'metadata_value'],
          },
          {
            association: 'amounts',
            include: [
              {
                association: 'billingCategory',
                attributes: ['id', 'metadata_value'],
              },
              {
                association: 'currency',
                attributes: ['id', 'metadata_value'],
              },
            ],
          },
        ],
      });

      http.setSuccess(
        200,
        'All Change of Programme Policy Records Fetched Successfully',
        {
          data: records,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable To Fetch All Change of Programme Policy Records',
        {
          error: { message: error.message },
        }
      );

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
  async createStudentServicePolicy(req, res) {
    try {
      const data = req.body;
      const { id } = req.user;

      data.created_by_id = id;

      const result = await model.sequelize.transaction(async (transaction) => {
        const result =
          await studentServicePolicyService.createStudentServicePolicyRecord(
            data,
            transaction
          );

        return result;
      });

      http.setSuccess(200, 'Change of Programme Policy Created Successfully.', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Create This Change of Programme Policy.', {
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
  async updateStudentServicePolicy(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      const user = req.user.id;

      data.last_updated_by_id = user;
      data.updated_at = moment.now();

      const policyAmounts = [];

      if (!isEmpty(data.amounts)) {
        data.amounts.forEach((amount) => {
          policyAmounts.push({
            policy_id: id,
            ...amount,
            created_by_id: user,
          });
        });
      }

      const result = await model.sequelize.transaction(async (transaction) => {
        const update = await studentServicePolicyService.updateRecord(
          id,
          data,
          transaction
        );
        const result = update[1][0];

        await handleUpdatingPivots(id, policyAmounts, transaction);

        return result;
      });

      http.setSuccess(
        200,
        'Change of Programme Policy Record Updated Successfully',
        {
          data: result,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable To Update This Change of Programme Policy Record',
        {
          error: { message: error.message },
        }
      );

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
  async deleteStudentServicePolicy(req, res) {
    try {
      const { id } = req.params;

      await studentServicePolicyService.deleteRecord(id);
      http.setSuccess(
        200,
        'Change of Programme Policy Record Deleted Successfully'
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable To Delete This Change of Programme Policy Record',
        {
          error: { message: error.message },
        }
      );

      return http.send(res);
    }
  }
}

/**
 *
 * @param {*} policyId
 * @param {*} policyAmounts
 * @param {*} transaction
 */
const handleUpdatingPivots = async function (
  policyId,
  policyAmounts,
  transaction
) {
  try {
    if (!isEmpty(policyAmounts)) {
      await deleteOrCreateElements(
        policyAmounts,
        'findAllPolicyAmounts',
        'bulkInsertPolicyAmounts',
        'bulkRemovePolicyAmounts',
        'updatePolicyAmounts',
        'billing_category_id',
        policyId,
        transaction
      );
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} firstElements
 * @param {*} findAllService
 * @param {*} insertService
 * @param {*} deleteService
 * @param {*} updateService
 * @param {*} firstField
 * @param {*} policyId
 * @param {*} transaction
 * @returns
 */
const deleteOrCreateElements = async (
  firstElements,
  findAllService,
  insertService,
  deleteService,
  updateService,
  firstField,
  policyId,
  transaction
) => {
  const elementsToDelete = [];
  const elementsToInsert = [];
  const elementsToUpdate = [];

  const secondElements = await studentServicePolicyService[findAllService]({
    where: {
      policy_id: policyId,
    },
    attributes: ['id', 'policy_id', 'currency_id', 'amount', firstField],
    raw: true,
  });

  firstElements.forEach((firstElement) => {
    const myElement = secondElements.find(
      (secondElement) =>
        parseInt(firstElement[firstField], 10) ===
          parseInt(secondElement[firstField], 10) &&
        parseInt(firstElement.policy_id, 10) ===
          parseInt(secondElement.policy_id, 10)
    );

    if (!myElement) {
      elementsToInsert.push(firstElement);
    } else {
      const locateContextId = secondElements.find(
        (value) =>
          parseInt(value.policy_id, 10) ===
            parseInt(firstElement.policy_id, 10) &&
          parseInt(value.billing_category_id, 10) ===
            parseInt(firstElement.billing_category_id, 10)
      );

      elementsToUpdate.push({ id: locateContextId.id, ...firstElement });
    }
  });

  secondElements.forEach((secondElement) => {
    const myElement = firstElements.find(
      (firstElement) =>
        parseInt(firstElement[firstField], 10) ===
          parseInt(secondElement[firstField], 10) &&
        parseInt(firstElement.policy_id, 10) ===
          parseInt(secondElement.policy_id, 10)
    );

    if (!myElement) elementsToDelete.push(secondElement.id);
  });

  if (!isEmpty(elementsToInsert)) {
    await studentServicePolicyService[insertService](
      elementsToInsert,
      transaction
    );
  }

  if (!isEmpty(elementsToDelete)) {
    await studentServicePolicyService[deleteService](
      elementsToDelete,
      transaction
    );
  }

  if (!isEmpty(elementsToUpdate)) {
    for (const item of elementsToUpdate) {
      await studentServicePolicyService[updateService](
        item.id,
        item,
        transaction
      );
    }
  }

  return { elementsToDelete, elementsToInsert };
};

module.exports = StudentServicePolicyController;
