const { HttpResponse } = require('@helpers');
const {
  programmeVersionWeightingCriteriaService,
  programmeService,
  metadataValueService,
} = require('@services/index');
const { isEmpty, toUpper, trim } = require('lodash');
const model = require('@models');
const moment = require('moment');
const {
  getMetadataValueId,
  getMetadataValueName,
} = require('@controllers/Helpers/programmeHelper');

const http = new HttpResponse();

class ProgrammeVersionWeightingCriteriaController {
  /**
   * GET All programmeVersionWeightingCriteria.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async index(req, res) {
    try {
      const result =
        await programmeVersionWeightingCriteriaService.findAllRecords({
          ...getProgrammeVersionWeightingCriteriaAttributes(),
        });

      http.setSuccess(
        200,
        'Programme Version Weighting Criteria Fetched Successfully',
        {
          data: result,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable To Fetch Programme Version Weighting Criteria',
        {
          error: { message: error.message },
        }
      );

      return http.send(res);
    }
  }

  /**
   * GET All programmeVersionWeightingCriteria.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async fetchProgrammeVersionWeightingCriteriaByProgramme(req, res) {
    try {
      const { programmeId } = req.params;

      const result =
        await programmeVersionWeightingCriteriaService.findAllRecords({
          where: {
            programme_id: programmeId,
          },
          ...getProgrammeVersionWeightingCriteriaAttributes(),
        });

      http.setSuccess(
        200,
        'Programme Weighting Criteria Fetched Successfully',
        {
          data: result,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Programme Weighting Criteria', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * CREATE New ProgrammeVersionWeightingCriteria Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async createProgrammeVersionWeightingCriteria(req, res) {
    try {
      const data = req.body;
      const { id: user } = req.user;

      data.created_by_id = user;

      const findProgramme = await programmeService
        .findOneProgramme({
          where: { id: data.programme_id },
          include: [
            {
              association: 'versions',
              attributes: ['id'],
            },
          ],
          nest: true,
        })
        .then((res) => {
          if (res) {
            return res.toJSON();
          }
        });

      if (!findProgramme) {
        throw new Error(`The programme provided doesnot exist.`);
      }

      const verifyVersion = findProgramme.versions.find(
        (version) =>
          parseInt(version.id, 10) === parseInt(data.programme_version_id, 10)
      );

      if (!verifyVersion) {
        throw new Error(
          `The version provided doesnot belong to this programme.`
        );
      }

      const metadataValues = await metadataValueService.findAllMetadataValues({
        include: {
          association: 'metadata',
          attributes: ['id', 'metadata_name'],
        },
        attributes: ['id', 'metadata_value'],
      });

      if (data.weigh_a_level === true) {
        const aLevelId = getMetadataValueId(
          metadataValues,
          'A LEVEL',
          'UNEB STUDY LEVELS'
        );

        const findCategory = data.categories.filter(
          (category) =>
            parseInt(category.uneb_study_level_id, 10) ===
            parseInt(aLevelId, 10)
        );

        if (isEmpty(findCategory)) {
          throw new Error(
            `Please include some A LEVEL Weighting Criteria Categories.`
          );
        }
      }

      data.weighting_criteria_code = toUpper(
        trim(data.weighting_criteria_code)
      );

      const criteriaCategories = [];

      if (!isEmpty(data.categories)) {
        data.categories.forEach((category) => {
          if (category.weighting_category_id) {
            const weightingCriteriaCategoryName = getMetadataValueName(
              metadataValues,
              category.weighting_category_id,
              'WEIGHTING CATEGORIES'
            );

            if (toUpper(trim(weightingCriteriaCategoryName)) === 'ESSENTIAL') {
              category.weight = 3;
            } else if (
              toUpper(trim(weightingCriteriaCategoryName)) === 'DESIRABLE'
            ) {
              category.weight = 2;
            } else if (
              toUpper(trim(weightingCriteriaCategoryName)) === 'RELEVANT'
            ) {
              category.weight = 1;
            } else if (
              toUpper(trim(weightingCriteriaCategoryName)) === 'OTHERS'
            ) {
              category.weight = 0.5;
            } else {
              throw new Error(
                `Invalid Weighting Criteria category ${weightingCriteriaCategoryName}`
              );
            }
          } else {
            category.weight = 0;
          }

          const subjects = [];

          category.created_by_id = user;

          if (!isEmpty(category.unebSubjects)) {
            category.unebSubjects.forEach((subject) => {
              subjects.push({
                uneb_subject_id: subject.uneb_subject_id,
                minimum_grade: toUpper(trim(subject.minimum_grade)),
                created_by_id: user,
              });
            });
          }

          category.unebSubjects = subjects;

          criteriaCategories.push(category);
        });
      }

      data.categories = criteriaCategories;

      const result = await model.sequelize.transaction(async (transaction) => {
        const result =
          await programmeVersionWeightingCriteriaService.createRecord(
            data,
            transaction
          );

        return result;
      });

      http.setSuccess(
        200,
        'Programme Version Weighting Criteria Created Successfully',
        {
          data: result,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable to create this Programme Version Weighting Criteria.',
        {
          error: { message: error.message },
        }
      );

      return http.send(res);
    }
  }

  /**
   *
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async addWeightingCriteriaCategory(req, res) {
    try {
      const data = req.body;
      const { id: user } = req.user;

      data.created_by_id = user;

      const metadataValues = await metadataValueService.findAllMetadataValues({
        include: {
          association: 'metadata',
          attributes: ['id', 'metadata_name'],
        },
        attributes: ['id', 'metadata_value'],
      });

      if (data.weighting_category_id) {
        const weightingCriteriaCategoryName = getMetadataValueName(
          metadataValues,
          data.weighting_category_id,
          'WEIGHTING CATEGORIES'
        );

        if (toUpper(trim(weightingCriteriaCategoryName)) === 'ESSENTIAL') {
          data.weight = 3;
        } else if (
          toUpper(trim(weightingCriteriaCategoryName)) === 'DESIRABLE'
        ) {
          data.weight = 2;
        } else if (
          toUpper(trim(weightingCriteriaCategoryName)) === 'RELEVANT'
        ) {
          data.weight = 1;
        } else if (toUpper(trim(weightingCriteriaCategoryName)) === 'OTHERS') {
          data.weight = 0.5;
        } else {
          throw new Error(
            `Invalid Weighting Criteria category ${weightingCriteriaCategoryName}`
          );
        }
      } else {
        data.weight = 0;
      }

      const result = await model.sequelize.transaction(async (transaction) => {
        const result =
          await programmeVersionWeightingCriteriaService.createAddWeightingCriteriacategory(
            data,
            transaction
          );

        return result;
      });

      http.setSuccess(
        200,
        'Programme Version Weighting Criteria Category Created Successfully',
        {
          data: result,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable to create this Programme Version Weighting Criteria Category.',
        {
          error: { message: error.message },
        }
      );

      return http.send(res);
    }
  }

  /**
   *
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async addWeightingCriteriaCategorySubjects(req, res) {
    try {
      const data = req.body;

      const { id: user } = req.user;

      data.created_by_id = user;

      const subjects = [];

      const findCriteriaCategory =
        await programmeVersionWeightingCriteriaService
          .findOneWeightingCriteriaCategory({
            where: {
              id: data.criteria_category_id,
            },
            include: [
              {
                association: 'criteria',
              },
            ],
            nest: true,
          })
          .then((res) => {
            if (res) {
              return res.toJSON();
            }
          });

      if (!findCriteriaCategory) {
        throw new Error('The weighting criteria category does not exist.');
      }

      const metadataValues = await metadataValueService.findAllMetadataValues({
        include: {
          association: 'metadata',
          attributes: ['id', 'metadata_name'],
        },
        attributes: ['id', 'metadata_value'],
      });

      const oLevelId = getMetadataValueId(
        metadataValues,
        'O LEVEL',
        'UNEB STUDY LEVELS'
      );

      const aLevelId = getMetadataValueId(
        metadataValues,
        'A LEVEL',
        'UNEB STUDY LEVELS'
      );

      if (!isEmpty(data.unebSubjects)) {
        if (
          parseInt(findCriteriaCategory.uneb_study_level_id, 10) ===
          parseInt(oLevelId, 10)
        ) {
          data.unebSubjects.forEach((subject) => {
            if (
              toUpper(trim(subject.minimum_grade)) !== 'D1' &&
              toUpper(trim(subject.minimum_grade)) !== 'D2' &&
              toUpper(trim(subject.minimum_grade)) !== 'C3' &&
              toUpper(trim(subject.minimum_grade)) !== 'C4' &&
              toUpper(trim(subject.minimum_grade)) !== 'C5' &&
              toUpper(trim(subject.minimum_grade)) !== 'C6' &&
              toUpper(trim(subject.minimum_grade)) !== 'P7' &&
              toUpper(trim(subject.minimum_grade)) !== 'P8' &&
              toUpper(trim(subject.minimum_grade)) !== 'F9'
            ) {
              throw new Error(
                `Invalid minimum grade value (${subject.minimum_grade}) for O Level Subjects`
              );
            }
          });
        } else if (
          parseInt(findCriteriaCategory.uneb_study_level_id, 10) ===
          parseInt(aLevelId, 10)
        ) {
          data.unebSubjects.forEach((subject) => {
            if (
              toUpper(trim(subject.minimum_grade)) !== 'A' &&
              toUpper(trim(subject.minimum_grade)) !== 'B' &&
              toUpper(trim(subject.minimum_grade)) !== 'C' &&
              toUpper(trim(subject.minimum_grade)) !== 'D' &&
              toUpper(trim(subject.minimum_grade)) !== 'E' &&
              toUpper(trim(subject.minimum_grade)) !== 'O' &&
              toUpper(trim(subject.minimum_grade)) !== 'F' &&
              toUpper(trim(subject.minimum_grade)) !== 'D1' &&
              toUpper(trim(subject.minimum_grade)) !== 'D2' &&
              toUpper(trim(subject.minimum_grade)) !== 'C3' &&
              toUpper(trim(subject.minimum_grade)) !== 'C4' &&
              toUpper(trim(subject.minimum_grade)) !== 'C5' &&
              toUpper(trim(subject.minimum_grade)) !== 'C6' &&
              toUpper(trim(subject.minimum_grade)) !== 'P7' &&
              toUpper(trim(subject.minimum_grade)) !== 'P8' &&
              toUpper(trim(subject.minimum_grade)) !== 'F9'
            ) {
              throw new Error(
                `Invalid minimum grade value (${subject.minimum_grade}) for A Level Subjects`
              );
            }
          });
        }

        data.unebSubjects.forEach((subject) => {
          subjects.push({
            criteria_category_id: data.criteria_category_id,
            ...subject,
            created_by_id: user,
          });
        });
      }

      const records = [];

      await model.sequelize.transaction(async (transaction) => {
        if (!isEmpty(subjects)) {
          for (const item of subjects) {
            const result =
              await programmeVersionWeightingCriteriaService.createWeightingCriteriaCategorySubject(
                item,
                transaction
              );

            records.push(result);
          }
        }
      });

      http.setSuccess(
        200,
        'Weighting Criteria Category Subjects Created Successfully.',
        {
          data: records,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable To Create Weighting Criteria Category Subjects.',
        {
          error: { message: error.message },
        }
      );

      return http.send(res);
    }
  }

  /**
   * UPDATE Specific ProgrammeVersionWeightingCriteria Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async updateProgrammeVersionWeightingCriteria(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      data.last_updated_by_id = parseInt(req.user.id, 10);
      data.updated_at = moment.now();
      const result =
        await programmeVersionWeightingCriteriaService.updateRecord(id, data);
      const response = result[1][0];

      http.setSuccess(
        200,
        'Programme Version Weighting Criteria Updated Successfully',
        {
          data: response,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable To Update This Programme Version Weighting Criteria',
        {
          error: { message: error.message },
        }
      );

      return http.send(res);
    }
  }

  /**
   * UPDATE
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async updateWeightingCriteriaCategory(req, res) {
    try {
      const { criteriaCategoryId } = req.params;
      const data = req.body;
      const { id: user } = req.user;

      data.last_updated_by_id = user;
      data.updated_at = moment.now();

      const subjects = [];

      if (!isEmpty(data.unebSubjects)) {
        data.unebSubjects.forEach((sbj) => {
          subjects.push({
            criteria_category_id: criteriaCategoryId,
            ...sbj,
            created_by_id: user,
          });
        });
      }
      const result = await model.sequelize.transaction(async (transaction) => {
        const result =
          await programmeVersionWeightingCriteriaService.updateWeightingCriteriaCategory(
            criteriaCategoryId,
            data,
            transaction
          );

        await handleUpdatingPivots(criteriaCategoryId, subjects, transaction);

        return result[1][0];
      });

      http.setSuccess(200, 'Criteria Category Updated Successfully', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Update This Criteria Category', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Get Specific ProgrammeVersionWeightingCriteria Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async fetchProgrammeVersionWeightingCriteria(req, res) {
    try {
      const { id } = req.params;
      const result =
        await programmeVersionWeightingCriteriaService.findOneRecord({
          where: { id },
          ...getProgrammeVersionWeightingCriteriaAttributes(),
        });

      http.setSuccess(
        200,
        'Programme Version Weighting Criteria fetch successful',
        {
          data: result,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable to get this Programme Version Weighting Criteria',
        {
          error: { message: error.message },
        }
      );

      return http.send(res);
    }
  }

  /**
   * Destroy ProgrammeVersionWeightingCriteria Data
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async deleteProgrammeVersionWeightingCriteria(req, res) {
    try {
      const { id } = req.params;

      await programmeVersionWeightingCriteriaService.deleteRecord(id);
      http.setSuccess(
        200,
        'Programme Version Weighting Criteria Deleted Successfully'
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable To Delete This Programme Version Weighting Criteria',
        {
          error: { message: error.message },
        }
      );

      return http.send(res);
    }
  }

  /**
   * Destroy
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async deleteWeightingCriteriaCategory(req, res) {
    try {
      const { criteriaCategoryId } = req.params;

      await programmeVersionWeightingCriteriaService.deleteWeightingCriteriaCategory(
        criteriaCategoryId
      );
      http.setSuccess(200, 'Weighting Criteria Category Deleted Successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Delete This Weighting Criteria Category', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

/**
 *
 * @param {*} criteriaCategoryId
 * @param {*} subjects
 * @param {*} transaction
 */
const handleUpdatingPivots = async function (
  criteriaCategoryId,
  subjects,
  transaction
) {
  try {
    if (!isEmpty(subjects)) {
      await deleteOrCreateElements(
        subjects,
        'findAllCriteriaCategorySubjects',
        'bulkInsertCriteriaCategorySubjects',
        'bulkRemoveCriteriaCategorySubjects',
        'updateCriteriaCategorySubjects',
        'uneb_subject_id',
        criteriaCategoryId,
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
 * @param {*} criteriaCategoryId
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
  criteriaCategoryId,
  transaction
) => {
  const elementsToDelete = [];
  const elementsToInsert = [];
  const elementsToUpdate = [];

  const secondElements = await programmeVersionWeightingCriteriaService[
    findAllService
  ]({
    where: {
      criteria_category_id: criteriaCategoryId,
    },
    attributes: ['id', 'criteria_category_id', firstField],
    raw: true,
  });

  firstElements.forEach((firstElement) => {
    const myElement = secondElements.find(
      (secondElement) =>
        parseInt(firstElement[firstField], 10) ===
          parseInt(secondElement[firstField], 10) &&
        parseInt(firstElement.criteria_category_id, 10) ===
          parseInt(secondElement.criteria_category_id, 10)
    );

    if (!myElement) {
      elementsToInsert.push(firstElement);
    } else {
      const locateContextId = secondElements.find(
        (value) =>
          parseInt(value.criteria_category_id, 10) ===
            parseInt(firstElement.criteria_category_id, 10) &&
          parseInt(value.uneb_subject_id, 10) ===
            parseInt(firstElement.uneb_subject_id, 10)
      );

      elementsToUpdate.push({ id: locateContextId.id, ...firstElement });
    }
  });

  secondElements.forEach((secondElement) => {
    const myElement = firstElements.find(
      (firstElement) =>
        parseInt(firstElement[firstField], 10) ===
          parseInt(secondElement[firstField], 10) &&
        parseInt(firstElement.criteria_category_id, 10) ===
          parseInt(secondElement.criteria_category_id, 10)
    );

    if (!myElement) elementsToDelete.push(secondElement.id);
  });

  if (!isEmpty(elementsToInsert)) {
    await programmeVersionWeightingCriteriaService[insertService](
      elementsToInsert,
      transaction
    );
  }

  if (!isEmpty(elementsToDelete)) {
    await programmeVersionWeightingCriteriaService[deleteService](
      elementsToDelete,
      transaction
    );
  }

  if (!isEmpty(elementsToUpdate)) {
    for (const item of elementsToUpdate) {
      await programmeVersionWeightingCriteriaService[updateService](
        item.id,
        item,
        transaction
      );
    }
  }

  return { elementsToDelete, elementsToInsert };
};

const getProgrammeVersionWeightingCriteriaAttributes = function () {
  return {
    include: [
      {
        association: 'programme',
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
            'delete_approval_status',
            'delete_approval_date',
            'delete_approved_by_id',
            'deleted_by_id',
            'last_update_approval_status',
            'last_update_approval_date',
            'last_update_approved_by_id',
            'last_updated_by_id',
            'create_approval_status',
            'create_approval_date',
            'create_approved_by_id',
            'created_by_id',
          ],
        },
      },
      {
        association: 'programmeVersion',
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
            'delete_approval_status',
            'delete_approval_date',
            'delete_approved_by_id',
            'deleted_by_id',
            'last_update_approval_status',
            'last_update_approval_date',
            'last_update_approved_by_id',
            'last_updated_by_id',
            'create_approval_status',
            'create_approval_date',
            'create_approved_by_id',
            'created_by_id',
          ],
        },
      },
      {
        association: 'categories',
        include: [
          {
            association: 'unebStudyLevel',
            attributes: ['id', 'metadata_value'],
          },
          {
            association: 'weightingCategory',
            attributes: ['id', 'metadata_value'],
          },
          {
            association: 'weightingCondition',
            attributes: ['id', 'metadata_value'],
          },
          {
            association: 'unebSubjects',
            include: [
              {
                association: 'unebSubject',
              },
            ],
          },
        ],
      },
      {
        association: 'createdBy',
        attributes: ['id', 'surname', 'other_names'],
      },
    ],
  };
};

module.exports = ProgrammeVersionWeightingCriteriaController;
