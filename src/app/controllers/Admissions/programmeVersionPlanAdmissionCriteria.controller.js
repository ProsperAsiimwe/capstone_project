const { HttpResponse } = require('@helpers');
const {
  programmeVersionPlanAdmissionCriteriaService,
} = require('@services/index');
const { isEmpty } = require('lodash');
const model = require('@models');
const moment = require('moment');

const http = new HttpResponse();

class ProgrammeVersionPlanAdmissionCriteriaController {
  /**
   * GET All programmeVersionPlanAdmissionCriteria.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async index(req, res) {
    try {
      const programmeVersionPlanAdmissionCriteria =
        await programmeVersionPlanAdmissionCriteriaService.findAllProgrammeVersionPlanAdmissionCriteria(
          {
            ...getProgrammeVersionPlanAdmissionCriteriaAttributes(),
          }
        );

      http.setSuccess(
        200,
        'Programme Version Plan Admission Criteria Fetched Successfully',
        {
          programmeVersionPlanAdmissionCriteria,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable To Fetch Programme Version Plan Admission Criteria',
        {
          error: { message: error.message },
        }
      );

      return http.send(res);
    }
  }

  /**
   * CREATE New ProgrammeVersionPlanAdmissionCriteria Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async createProgrammeVersionPlanAdmissionCriteria(req, res) {
    try {
      const data = req.body;
      const { id } = req.user;

      data.created_by_id = parseInt(id, 10);

      const subjects = [];

      if (!isEmpty(data.uneb_subjects)) {
        data.uneb_subjects.forEach((uneb_subject) => {
          subjects.push({
            uneb_subject_id: uneb_subject,
            created_by_id: id,
          });
        });
      }

      data.unebSubjects = subjects;

      const programmeVersionPlanAdmissionCriteria =
        await model.sequelize.transaction(async (transaction) => {
          const result =
            await programmeVersionPlanAdmissionCriteriaService.createProgrammeVersionPlanAdmissionCriteria(
              data,
              transaction
            );

          return result;
        });

      http.setSuccess(
        201,
        'Programme Version Plan Admission Criteria created successfully',
        {
          programmeVersionPlanAdmissionCriteria,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable to create this Programme Version Plan Admission Criteria.',
        {
          error: { message: error.message },
        }
      );

      return http.send(res);
    }
  }

  /**
   * UPDATE Specific ProgrammeVersionPlanAdmissionCriteria Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async updateProgrammeVersionPlanAdmissionCriteria(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      data.last_updated_by_id = parseInt(req.user.id, 10);
      data.updated_at = moment.now();
      const updateProgrammeVersionPlanAdmissionCriteria =
        await programmeVersionPlanAdmissionCriteriaService.updateProgrammeVersionPlanAdmissionCriteria(
          id,
          data
        );
      const programmeVersionPlanAdmissionCriteria =
        updateProgrammeVersionPlanAdmissionCriteria[1][0];

      http.setSuccess(
        200,
        'Programme Version Plan Admission Criteria Updated Successfully',
        {
          programmeVersionPlanAdmissionCriteria,
        }
      );
      if (isEmpty(programmeVersionPlanAdmissionCriteria))
        http.setError(
          404,
          'Programme Version Plan Admission Criteria Data Not Found'
        );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable To Update This Programme Version Plan Admission Criteria',
        {
          error: { message: error.message },
        }
      );

      return http.send(res);
    }
  }

  /**
   * Get Specific ProgrammeVersionPlanAdmissionCriteria Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async fetchProgrammeVersionPlanAdmissionCriteria(req, res) {
    try {
      const { id } = req.params;
      const programmeVersionPlanAdmissionCriteria =
        await programmeVersionPlanAdmissionCriteriaService.findOneProgrammeVersionPlanAdmissionCriteria(
          {
            where: { id },
            ...getProgrammeVersionPlanAdmissionCriteriaAttributes(),
          }
        );

      http.setSuccess(
        200,
        'Programme Version Plan Admission Criteria fetch successful',
        {
          programmeVersionPlanAdmissionCriteria,
        }
      );
      if (isEmpty(programmeVersionPlanAdmissionCriteria))
        http.setError(
          404,
          'Programme Version Plan Admission Criteria Data Not Found'
        );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable to get this Programme Version Plan Admission Criteria',
        {
          error: { message: error.message },
        }
      );

      return http.send(res);
    }
  }

  /**
   * Destroy ProgrammeVersionPlanAdmissionCriteria Data
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async hardDeleteProgrammeVersionPlanAdmissionCriteria(req, res) {
    try {
      const { id } = req.params;

      await programmeVersionPlanAdmissionCriteriaService.hardDeleteProgrammeVersionPlanAdmissionCriteria(
        id
      );
      http.setSuccess(
        200,
        'Programme Version Plan Admission Criteria Deleted Successfully'
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable To Delete This Programme Version Plan Admission Criteria',
        {
          error: { message: error.message },
        }
      );

      return http.send(res);
    }
  }

  /**
   * SOFT DELETE Specific ProgrammeVersionPlanAdmissionCriteria Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async softDeleteProgrammeVersionPlanAdmissionCriteria(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      data.deleted_by_id = parseInt(req.user.id, 10);
      data.deleted_at = moment.now();
      const updateProgrammeVersionPlanAdmissionCriteria =
        await programmeVersionPlanAdmissionCriteriaService.softDeleteProgrammeVersionPlanAdmissionCriteria(
          id,
          data
        );
      const programmeVersionPlanAdmissionCriteria =
        updateProgrammeVersionPlanAdmissionCriteria[1][0];

      http.setSuccess(
        200,
        'Programme Version Plan Admission Criteria Soft Deleted Successfully',
        {
          programmeVersionPlanAdmissionCriteria,
        }
      );
      if (isEmpty(programmeVersionPlanAdmissionCriteria))
        http.setError(
          404,
          'Programme Version Plan Admission Criteria Data Not Found'
        );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable To Soft Delete This Programme Version Plan Admission Criteria',
        {
          error: { message: error.message },
        }
      );

      return http.send(res);
    }
  }

  /**
   * UNDO SOFT DELETE Specific ProgrammeVersionPlanAdmissionCriteria Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async undoSoftDeleteProgrammeVersionPlanAdmissionCriteria(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      data.deleted_by_id = null;
      data.deleted_at = null;
      data.delete_approval_status = 'PENDING';
      const updateProgrammeVersionPlanAdmissionCriteria =
        await programmeVersionPlanAdmissionCriteriaService.undoSoftDeleteProgrammeVersionPlanAdmissionCriteria(
          id,
          data
        );
      const programmeVersionPlanAdmissionCriteria =
        updateProgrammeVersionPlanAdmissionCriteria[1][0];

      http.setSuccess(
        200,
        'Programme Version Plan Admission Criteria Retreaved Successfully',
        {
          programmeVersionPlanAdmissionCriteria,
        }
      );
      if (isEmpty(programmeVersionPlanAdmissionCriteria))
        http.setError(
          404,
          'Programme Version Plan Admission Criteria Data Not Found'
        );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable To Retreave This Programme Version Plan Admission Criteria',
        {
          error: { message: error.message },
        }
      );

      return http.send(res);
    }
  }
}

const getProgrammeVersionPlanAdmissionCriteriaAttributes = function () {
  return {
    include: [
      {
        association: 'programmeVersionPlan',
      },
      {
        association: 'studyLevel',
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
        association: 'subjects',
      },
    ],
  };
};

module.exports = ProgrammeVersionPlanAdmissionCriteriaController;
