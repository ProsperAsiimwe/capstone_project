const { HttpResponse } = require('@helpers');
const { programmeVersionCourseUnitService } = require('@services/index');
const { isEmpty } = require('lodash');
const model = require('@models');

const http = new HttpResponse();

class ProgrammeVersionCourseUnitController {
  /**
   * UPDATE Specific CourseUnit Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async updateProgrammeVersionCourseUnit(req, res) {
    try {
      const { versionCourseUnitId } = req.params;
      const data = req.body;
      const user = req.user.id;

      const versionPlanCourseUnits = [];
      const versionSpecializationCourseUnits = [];
      const versionSubjectCourseUnits = [];

      if (!isEmpty(data.plans)) {
        data.plans.forEach((plan) => {
          versionPlanCourseUnits.push({
            programme_version_plan_id: plan,
            programme_version_course_unit_id: versionCourseUnitId,
            last_updated_by_id: user,
          });
        });
      }

      if (!isEmpty(data.specializations)) {
        data.specializations.forEach((spec) => {
          versionSpecializationCourseUnits.push({
            version_specialization_id: spec,
            programme_version_course_unit_id: versionCourseUnitId,
            last_updated_by_id: user,
          });
        });
      }

      if (!isEmpty(data.subjects)) {
        data.subjects.forEach((subject) => {
          versionSubjectCourseUnits.push({
            combination_subject_id: subject,
            programme_version_course_unit_id: versionCourseUnitId,
            last_updated_by_id: user,
          });
        });
      }

      const result = await model.sequelize.transaction(async (transaction) => {
        const updateCourseUnit =
          await programmeVersionCourseUnitService.updateCourseUnit(
            versionCourseUnitId,
            data,
            transaction
          );

        const courseUnit = updateCourseUnit[1][0];

        await handleUpdatingPivots(
          versionCourseUnitId,
          versionPlanCourseUnits,
          versionSpecializationCourseUnits,
          versionSubjectCourseUnits,
          transaction
        );

        return courseUnit;
      });

      if (!result) {
        throw new Error('Record Does Not Exist!');
      }

      http.setSuccess(200, 'Course Unit updated successfully', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to update this CourseUnit.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Get Specific CourseUnit Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async fetchVersionCourseUnit(req, res) {
    try {
      const { versionCourseUnitId } = req.params;

      const courseUnit =
        await programmeVersionCourseUnitService.findOneCourseUnit({
          where: {
            id: versionCourseUnitId,
          },
          ...versionCourseUnitData(),
        });

      http.setSuccess(200, 'Version Course Unit Fetched Successfully', {
        data: courseUnit,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Version Course Unit', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Destroy CourseUnit Data
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async deleteVersionCourseUnit(req, res) {
    try {
      const { versionCourseUnitId } = req.params;

      await programmeVersionCourseUnitService.deleteVersionCourseUnit(
        versionCourseUnitId
      );

      http.setSuccess(200, 'Version Course Unit Deleted Successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to Delete This Version Course Unit.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

/**
 *
 * @param {*} versionCourseUnitId
 * @param {*} versionPlanCourseUnits
 * @param {*} versionSpecializationCourseUnits
 * @param {*} versionSubjectCourseUnits
 * @param {*} user
 * @param {*} transaction
 */
const handleUpdatingPivots = async function (
  versionCourseUnitId,
  versionPlanCourseUnits,
  versionSpecializationCourseUnits,
  versionSubjectCourseUnits,
  transaction
) {
  try {
    if (!isEmpty(versionPlanCourseUnits)) {
      await deleteOrCreateElements(
        versionPlanCourseUnits,
        'findAllVersionPlanCourseUnits',
        'bulkInsertVersionPlanCourseUnits',
        'bulkRemoveVersionPlanCourseUnit',
        'programme_version_plan_id',
        versionCourseUnitId,
        transaction
      );
    }

    if (!isEmpty(versionSpecializationCourseUnits)) {
      await deleteOrCreateElements(
        versionSpecializationCourseUnits,
        'findAllVersionSpecializationCourseUnits',
        'bulkInsertVersionSpecializationCourseUnits',
        'bulkRemoveVersionSpecializationCourseUnit',
        'version_specialization_id',
        versionCourseUnitId,
        transaction
      );
    }

    if (!isEmpty(versionSubjectCourseUnits)) {
      await deleteOrCreateElements(
        versionSubjectCourseUnits,
        'findAllVersionSubjectCourseUnits',
        'bulkInsertVersionSubjectCourseUnits',
        'bulkRemoveVersionSubjectCourseUnit',
        'combination_subject_id',
        versionCourseUnitId,
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
 * @param {*} versionCourseUnitId
 * @param {*} transaction
 * @returns
 */
const deleteOrCreateElements = async (
  firstElements,
  findAllService,
  insertService,
  deleteService,
  firstField,
  versionCourseUnitId,
  transaction
) => {
  const elementsToDelete = [];
  const elementsToInsert = [];

  const secondElements = await programmeVersionCourseUnitService[
    findAllService
  ]({
    where: {
      programme_version_course_unit_id: versionCourseUnitId,
    },
    attributes: ['id', 'programme_version_course_unit_id', firstField],
    raw: true,
  });

  firstElements.forEach((firstElement) => {
    const myElement = secondElements.find(
      (secondElement) =>
        parseInt(firstElement[firstField], 10) ===
          parseInt(secondElement[firstField], 10) &&
        parseInt(firstElement.programme_version_course_unit_id, 10) ===
          parseInt(secondElement.programme_version_course_unit_id, 10)
    );

    if (!myElement) elementsToInsert.push(firstElement);
  });

  secondElements.forEach((secondElement) => {
    const myElement = firstElements.find(
      (firstElement) =>
        parseInt(firstElement[firstField], 10) ===
          parseInt(secondElement[firstField], 10) &&
        parseInt(firstElement.programme_version_course_unit_id, 10) ===
          parseInt(secondElement.programme_version_course_unit_id, 10)
    );

    if (!myElement) elementsToDelete.push(secondElement.id);
  });

  if (!isEmpty(elementsToInsert)) {
    await programmeVersionCourseUnitService[insertService](
      elementsToInsert,
      transaction
    );
  }

  if (!isEmpty(elementsToDelete)) {
    await programmeVersionCourseUnitService[deleteService](
      elementsToDelete,
      transaction
    );
  }

  return { elementsToDelete, elementsToInsert };
};

/**
 *
 * @returns
 */
const versionCourseUnitData = function () {
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
        association: 'courseUnit',
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
            association: 'department',
            attributes: ['id', 'department_code', 'department_title'],
          },
        ],
      },
      {
        association: 'planCourseUnits',
        attributes: ['id', 'programme_version_plan_id'],
        include: [
          {
            association: 'programmeVersionPlan',
            attributes: ['id', 'programme_version_plan_id'],
            include: [
              {
                association: 'plan',
                attributes: ['metadata_value'],
              },
            ],
          },
        ],
      },
      {
        association: 'specCourseUnits',
        attributes: ['id', 'version_specialization_id'],
        include: [
          {
            association: 'versionSpecialization',
            attributes: ['id', 'specialization_id'],
            include: [
              {
                association: 'spec',
                attributes: ['id', 'specialization_title'],
              },
            ],
          },
        ],
      },
      {
        association: 'subjectCourseUnits',
        attributes: ['id', 'combination_subject_id'],
        include: [
          {
            association: 'combinationSubject',
            attributes: ['id', 'category_combination_id', 'subject_id'],
            include: [
              {
                association: 'combination',
                attributes: [
                  'subject_combination_code',
                  'subject_combination_title',
                ],
              },
              {
                association: 'subject',
                attributes: ['subject_code', 'subject_name'],
              },
            ],
          },
        ],
      },
    ],
  };
};

module.exports = ProgrammeVersionCourseUnitController;
