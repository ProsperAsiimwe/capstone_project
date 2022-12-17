const { HttpResponse } = require('@helpers');
const { resultCategoryPolicyService } = require('@services/index');
const { trim, toUpper, isEmpty } = require('lodash');
const model = require('@models');

const http = new HttpResponse();

class ResultCategoryPolicyController {
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
      const records = await resultCategoryPolicyService.findAllRecords({
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
            association: 'studyLevel',
            attributes: ['id', 'metadata_value'],
          },
          {
            association: 'graduationLists',
            attributes: [
              'id',
              'study_level_result_category_id',
              'name',
              'range_from',
              'range_to',
            ],
          },
        ],
      });

      http.setSuccess(
        200,
        'All Result Category Policy Records Fetched Successfully',
        {
          data: records,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch All Result Category Policy Records', {
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
  async fetchOne(req, res) {
    try {
      const { studyLevelResultCategoryId } = req.params;

      const records = await resultCategoryPolicyService.findOneRecord({
        where: {
          id: studyLevelResultCategoryId,
        },
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
            association: 'studyLevel',
            attributes: ['id', 'metadata_value'],
          },
          {
            association: 'graduationLists',
            attributes: [
              'id',
              'study_level_result_category_id',
              'name',
              'range_from',
              'range_to',
            ],
          },
        ],
      });

      http.setSuccess(
        200,
        'All Result Category Policy Records Fetched Successfully',
        {
          data: records,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch All Result Category Policy Records', {
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
  async createResultCategoryPolicy(req, res) {
    try {
      const data = req.body;
      const { id } = req.user;

      data.created_by_id = id;

      const graduationLists = [];

      if (!isEmpty(data.policies)) {
        data.policies.forEach((policy) => {
          policy.name = toUpper(trim(policy.name));
          graduationLists.push({
            ...policy,
            created_by_id: data.created_by_id,
          });
        });
      }

      data.graduationLists = graduationLists;

      const result = await model.sequelize.transaction(async (transaction) => {
        const response =
          await resultCategoryPolicyService.createResultCategoryPolicyRecord(
            data,
            transaction
          );

        return response;
      });

      http.setSuccess(200, 'Result Category Policy Created Successfully.', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Create This Result Category Policy.', {
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
  async updateResultCategoryPolicy(req, res) {
    try {
      const { studyLevelResultCategoryId } = req.params;
      const data = req.body;
      const user = req.user.id;

      const graduationLists = [];

      if (!isEmpty(data.policies)) {
        data.policies.forEach((policy) => {
          policy.name = toUpper(trim(policy.name));
          graduationLists.push({
            study_level_result_category_id: studyLevelResultCategoryId,
            ...policy,
            last_updated_by_id: user,
          });
        });
      }

      const result = await model.sequelize.transaction(async (transaction) => {
        const update = await resultCategoryPolicyService.updateRecord(
          studyLevelResultCategoryId,
          data,
          transaction
        );

        const result = update[1][0];

        await handleUpdatingPivots(
          studyLevelResultCategoryId,
          graduationLists,
          transaction
        );

        return result;
      });

      http.setSuccess(
        200,
        'Result Category Policy Record Updated Successfully',
        {
          data: result,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable To Update This Result Category Policy Record',
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
  async updateResultCategoryPolicyItem(req, res) {
    try {
      const { resultCategoryPolicyItemId } = req.params;
      const data = req.body;
      const user = req.user.id;

      data.last_updated_by_id = user;

      const update =
        await resultCategoryPolicyService.updateResultCategoryPolicyItem(
          resultCategoryPolicyItemId,
          data
        );

      const result = update[1][0];

      http.setSuccess(200, 'Result Category Policy Item Updated Successfully', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Update This Result Category Policy Item', {
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
  async deleteResultCategoryPolicy(req, res) {
    try {
      const { id } = req.params;

      await resultCategoryPolicyService.deleteRecord(id);
      http.setSuccess(
        200,
        'Result Category Policy Record Deleted Successfully'
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable To Delete This Result Category Policy Record',
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
  async deleteResultCategoryPolicyItem(req, res) {
    try {
      const { resultCategoryPolicyItemId } = req.params;

      await resultCategoryPolicyService.deleteResultCategoryPolicyItem(
        resultCategoryPolicyItemId
      );
      http.setSuccess(
        200,
        'Result Category Policy Record Deleted Successfully'
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable To Delete This Result Category Policy Record',
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
 * @param {*} studyLevelResultCategoryId
 * @param {*} graduationLists
 * @param {*} transaction
 */
const handleUpdatingPivots = async function (
  studyLevelResultCategoryId,
  graduationLists,
  transaction
) {
  try {
    if (!isEmpty(graduationLists)) {
      await deleteOrCreateElements(
        graduationLists,
        'findAllResultCategoryPolicies',
        'bulkInsertResultCategoryPolicies',
        'bulkRemoveResultCategoryPolicies',
        'name',
        studyLevelResultCategoryId,
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
 * @param {*} firstField
 * @param {*} studyLevelResultCategoryId
 * @param {*} transaction
 * @returns
 */
const deleteOrCreateElements = async (
  firstElements,
  findAllService,
  insertService,
  deleteService,
  firstField,
  studyLevelResultCategoryId,
  transaction
) => {
  const elementsToDelete = [];
  const elementsToInsert = [];

  const secondElements = await resultCategoryPolicyService[findAllService]({
    where: {
      study_level_result_category_id: studyLevelResultCategoryId,
    },
    attributes: [
      'id',
      'study_level_result_category_id',
      firstField,
      'range_from',
      'range_to',
    ],
    raw: true,
  });

  firstElements.forEach((firstElement) => {
    const myElement = secondElements.find(
      (secondElement) =>
        parseInt(firstElement[firstField], 10) ===
          parseInt(secondElement[firstField], 10) &&
        parseInt(firstElement.study_level_result_category_id, 10) ===
          parseInt(secondElement.study_level_result_category_id, 10)
    );

    if (!myElement) elementsToInsert.push(firstElement);
  });

  secondElements.forEach((secondElement) => {
    const myElement = firstElements.find(
      (firstElement) =>
        parseInt(firstElement[firstField], 10) ===
          parseInt(secondElement[firstField], 10) &&
        parseInt(firstElement.study_level_result_category_id, 10) ===
          parseInt(secondElement.study_level_result_category_id, 10)
    );

    if (!myElement) elementsToDelete.push(secondElement.id);
  });

  if (!isEmpty(elementsToInsert)) {
    await resultCategoryPolicyService[insertService](
      elementsToInsert,
      transaction
    );
  }

  if (!isEmpty(elementsToDelete)) {
    await resultCategoryPolicyService[deleteService](
      elementsToDelete,
      transaction
    );
  }

  return { elementsToDelete, elementsToInsert };
};

module.exports = ResultCategoryPolicyController;
