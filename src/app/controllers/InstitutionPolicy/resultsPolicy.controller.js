const { HttpResponse } = require('@helpers');
const { resultsPolicyService } = require('@services/index');
const { isEmpty, toUpper, trim, isArray, map } = require('lodash');
const model = require('@models');

const http = new HttpResponse();

class ResultsPolicyController {
  /**
   * GET All ResultsPolicy.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async findAllStudyLevelPassMarkPolicy(req, res) {
    try {
      const result =
        await resultsPolicyService.findAllStudyLevelPassMarkPolicy();

      http.setSuccess(
        200,
        'Study Level Pass Mark Policies Fetched Successfully.',
        {
          data: result,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Study Level Pass Mark Policies.', {
        error: error.message,
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   */
  async findAllCourseResittingPolicy(req, res) {
    try {
      const result = await resultsPolicyService.findAllCourseResittingPolicy({
        include: [
          {
            association: 'studyLevel',
            attributes: ['id', 'metadata_value'],
          },
        ],
      });

      http.setSuccess(200, 'Course Resitting Policies Fetched Successfully.', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Course Resitting Policies.', {
        error: error.message,
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   */
  async findAllStudyLevelDegreeClassPolicy(req, res) {
    try {
      const result =
        await resultsPolicyService.findAllStudyLevelDegreeClassPolicy({
          include: [
            {
              association: 'studyLevel',
              attributes: ['id', 'metadata_value'],
            },
            {
              association: 'allocations',
              attributes: [
                'id',
                'std_lev_degree_class_id',
                'name',
                'range_from',
                'range_to',
              ],
            },
          ],
        });

      http.setSuccess(
        200,
        'Study Level Degree Class Policies Fetched Successfully.',
        {
          data: result,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Study Level Degree Class Policies.', {
        error: error.message,
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   */
  async createStudyLevelPassMarkPolicy(req, res) {
    try {
      const data = req.body;
      const user = req.user.id;

      data.created_by_id = user;

      if (
        data.all_entry_academic_years !== true &&
        (!isArray(data.academic_years) || isEmpty(data.academic_years))
      ) {
        throw new Error('Please provide Entry academic year policy');
      }

      const formData = data;

      if (data.academic_years) {
        formData.academicYears = map(data.academic_years, (academicYear) => ({
          ...academicYear,
          created_by_id: user,
          last_updated_by_id: user,
        }));
      }

      const findPolicy =
        await resultsPolicyService.findOneStudyLevelPassMarkPolicy({
          where: {
            programme_study_level_id: data.programme_study_level_id,
          },
          plain: true,
        });

      if (findPolicy)
        throw new Error(
          'A pass mark policy already exists for this Study Level.'
        );

      await model.sequelize.transaction(async (transaction) => {
        await resultsPolicyService.createStudyLevelPassMarkPolicy(
          formData,
          transaction
        );
      });

      http.setSuccess(
        200,
        'Study Level Pass Mark Policy Created Successfully.'
      );

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Create Study Level Pass Mark Policy.', {
        error: error.message,
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   */
  async createCourseResittingPolicy(req, res) {
    try {
      const data = req.body;
      const user = req.user.id;

      data.created_by_id = user;

      const result = await resultsPolicyService.createCourseResittingPolicy(
        data
      );

      http.setSuccess(200, 'Course Resitting Policy Created Successfully.', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Create Course Resitting Policy.', {
        error: error.message,
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   */
  async createStudyLevelDegreeClassPolicy(req, res) {
    try {
      const data = req.body;
      const user = req.user.id;

      data.created_by_id = user;

      const allocations = [];

      if (!isEmpty(data.degree_class_allocations)) {
        data.degree_class_allocations.forEach((allocation) => {
          allocation.name = toUpper(trim(allocation.name));
          allocations.push({
            ...allocation,
            created_by_id: user,
          });
        });
      }

      data.allocations = allocations;

      const result = await model.sequelize.transaction(async (transaction) => {
        const response =
          await resultsPolicyService.createStudyLevelDegreeClassPolicy(
            data,
            transaction
          );

        return response;
      });

      http.setSuccess(
        200,
        'Study Level Degree Class Policy Created Successfully.',
        {
          data: result,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Create Study Level Degree Class Policy.', {
        error: error.message,
      });

      return http.send(res);
    }
  }

  /**
   * Get Specific ResultsPolicy Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async findOneStudyLevelPassMarkPolicy(req, res) {
    try {
      const { id } = req.params;
      const result = await resultsPolicyService.findOneStudyLevelPassMarkPolicy(
        {
          where: { id },
        }
      );

      http.setSuccess(
        200,
        'Study Level Pass Mark Policy Fetched successfully.',
        {
          data: result,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Study Level Pass Mark Policy.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Get Specific Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async findOneCourseResittingPolicy(req, res) {
    try {
      const { id } = req.params;
      const result = await resultsPolicyService.findOneCourseResittingPolicy({
        where: { id },
        include: [
          {
            association: 'studyLevel',
            attributes: ['id', 'metadata_value'],
          },
        ],
      });

      http.setSuccess(200, 'Course Resitting Policy Fetched successfully.', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Course Resitting Policy.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Get Specific Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async findOneStudyLevelDegreeClassPolicy(req, res) {
    try {
      const { id } = req.params;
      const result =
        await resultsPolicyService.findOneStudyLevelDegreeClassPolicy({
          where: { id },
          include: [
            {
              association: 'studyLevel',
              attributes: ['id', 'metadata_value'],
            },
            {
              association: 'allocations',
              attributes: [
                'id',
                'std_lev_degree_class_id',
                'name',
                'range_from',
                'range_to',
              ],
            },
          ],
        });

      http.setSuccess(
        200,
        'Study Level Degree Class Policy Fetched successfully.',
        {
          data: result,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Study Level Degree Class.', {
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
  async updateStudyLevelPassMarkPolicy(req, res) {
    try {
      const { id } = req.params;
      const { id: userId } = req.user;

      const data = req.body;

      data.last_updated_by_id = userId;

      await model.sequelize.transaction(async (transaction) => {
        if (data.all_entry_academic_years === true) {
          await resultsPolicyService.destroyPassMarkPolicyAcademicYear(
            { pass_mark_policy_id: id },
            transaction
          );
        } else {
          data.pass_mark = 0;

          const academicYears = map(data.academic_years, (academicYear) => ({
            ...academicYear,
            pass_mark_policy_id: id,
            created_by_id: userId,
            last_updated_by_id: userId,
          }));

          await resultsPolicyService.bulkCreatePassMarkPolicyAcademicYear(
            academicYears,
            transaction
          );
        }

        await resultsPolicyService.updateStudyLevelPassMarkPolicy(
          id,
          data,
          transaction
        );
      });

      http.setSuccess(
        200,
        'Study Level Pass Mark Policy Updated Successfully.'
      );

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Update Study Level Pass Mark.', {
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
  async updateCourseResittingPolicy(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      const update = await resultsPolicyService.updateCourseResittingPolicy(
        id,
        data
      );

      const result = update[1][0];

      http.setSuccess(200, 'Course Resitting Policy Updated Successfully.', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Update Course Resitting.', {
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
  async updateStudyLevelDegreeClassPolicy(req, res) {
    try {
      const { degreeClassPolicyId } = req.params;
      const data = req.body;
      const user = req.user.id;

      const allocations = [];

      if (!isEmpty(data.degree_class_allocations)) {
        data.degree_class_allocations.forEach((allocation) => {
          allocations.push({
            std_lev_degree_class_id: degreeClassPolicyId,
            ...allocation,
            last_updated_by_id: user,
          });
        });
      }

      const result = await model.sequelize.transaction(async (transaction) => {
        const update =
          await resultsPolicyService.updateStudyLevelDegreeClassPolicy(
            degreeClassPolicyId,
            data,
            transaction
          );

        const result = update[1][0];

        await handleUpdatingPivots(
          degreeClassPolicyId,
          allocations,
          transaction
        );

        return result;
      });

      http.setSuccess(
        200,
        'Study Level Degree Class Policy Updated Successfully.',
        {
          data: result,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Update Study Level Degree Class.', {
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
  async updateStudyLevelDegreeClassPolicyAllocation(req, res) {
    try {
      const { degreeClassPolicyAllocationId } = req.params;
      const data = req.body;
      const user = req.user.id;

      data.last_updated_by_id = user;

      const result = await model.sequelize.transaction(async (transaction) => {
        const update =
          await resultsPolicyService.updateStudyLevelDegreeClassPolicyAllocation(
            degreeClassPolicyAllocationId,
            data,
            transaction
          );

        const result = update[1][0];

        return result;
      });

      http.setSuccess(
        200,
        'Study Level Degree Class Policy Allocation Updated Successfully.',
        {
          data: result,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable To Update Study Level Degree Class Policy Allocation.',
        {
          error: { message: error.message },
        }
      );

      return http.send(res);
    }
  }

  /**
   * Destroy Data
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async deleteStudyLevelPassMarkPolicy(req, res) {
    try {
      const { id } = req.params;

      await model.sequelize.transaction(async (transaction) => {
        await resultsPolicyService.deleteStudyLevelPassMarkPolicy(
          id,
          transaction
        );
      });
      http.setSuccess(200, 'Study Level Pass Mark Policy Deleted Successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Delete Study Level Pass Mark Policy..', {
        error: error.message,
      });

      return http.send(res);
    }
  }

  /**
   * Destroy Data
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async deleteCourseResittingPolicy(req, res) {
    try {
      const { id } = req.params;

      await resultsPolicyService.deleteCourseResittingPolicy(id);
      http.setSuccess(200, 'Course Resitting Policy Deleted Successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Delete Course Resitting Policy..', {
        error: error.message,
      });

      return http.send(res);
    }
  }

  /**
   * Destroy Data
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async deleteStudyLevelDegreeClassPolicy(req, res) {
    try {
      const { id } = req.params;

      await resultsPolicyService.deleteStudyLevelDegreeClassPolicy(id);
      http.setSuccess(200, 'Study Level Degree Policy Deleted Successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Delete Study Level Degree Policy.', {
        error: error.message,
      });

      return http.send(res);
    }
  }

  /**
   * Destroy Data
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async deleteStudyLevelDegreeClassPolicyAllocation(req, res) {
    try {
      const { degreeClassPolicyAllocationId } = req.params;

      await resultsPolicyService.deleteStudyLevelDegreeClassPolicyAllocation(
        degreeClassPolicyAllocationId
      );
      http.setSuccess(
        200,
        'Study Level Degree Policy Allocation Deleted Successfully'
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable To Delete Study Level Degree Policy Allocation.',
        {
          error: error.message,
        }
      );

      return http.send(res);
    }
  }
}

/**
 *
 * @param {*} degreeClassPolicyId
 * @param {*} allocations
 * @param {*} transaction
 */
const handleUpdatingPivots = async function (
  degreeClassPolicyId,
  allocations,
  transaction
) {
  try {
    if (!isEmpty(allocations)) {
      await deleteOrCreateElements(
        allocations,
        'findAllStudyLevelDegreeClassAllocations',
        'bulkInsertStudyLevelDegreeClassAllocations',
        'bulkRemoveStudyLevelDegreeClassAllocations',
        'name',
        degreeClassPolicyId,
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
 * @param {*} degreeClassPolicyId
 * @param {*} transaction
 * @returns
 */
const deleteOrCreateElements = async (
  firstElements,
  findAllService,
  insertService,
  deleteService,
  firstField,
  degreeClassPolicyId,
  transaction
) => {
  const elementsToDelete = [];
  const elementsToInsert = [];

  const secondElements = await resultsPolicyService[findAllService]({
    where: {
      std_lev_degree_class_id: degreeClassPolicyId,
    },
    attributes: [
      'id',
      'std_lev_degree_class_id',
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
        parseInt(firstElement.std_lev_degree_class_id, 10) ===
          parseInt(secondElement.std_lev_degree_class_id, 10)
    );

    if (!myElement) elementsToInsert.push(firstElement);
  });

  secondElements.forEach((secondElement) => {
    const myElement = firstElements.find(
      (firstElement) =>
        parseInt(firstElement[firstField], 10) ===
          parseInt(secondElement[firstField], 10) &&
        parseInt(firstElement.std_lev_degree_class_id, 10) ===
          parseInt(secondElement.std_lev_degree_class_id, 10)
    );

    if (!myElement) elementsToDelete.push(secondElement.id);
  });

  if (!isEmpty(elementsToInsert)) {
    await resultsPolicyService[insertService](elementsToInsert, transaction);
  }

  if (!isEmpty(elementsToDelete)) {
    await resultsPolicyService[deleteService](elementsToDelete, transaction);
  }

  return { elementsToDelete, elementsToInsert };
};

module.exports = ResultsPolicyController;
