const { HttpResponse } = require('@helpers');
const {
  programmeVersionSelectionCriteriaService,
  programmeService,
} = require('@services/index');
const { isEmpty, toUpper, trim } = require('lodash');
const model = require('@models');
const moment = require('moment');

const http = new HttpResponse();

class ProgrammeVersionSelectionCriteriaController {
  /**
   * GET All programmeVersionSelectionCriteria.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async index(req, res) {
    try {
      const result =
        await programmeVersionSelectionCriteriaService.findAllRecords({
          ...getProgrammeVersionSelectionCriteriaAttributes(),
        });

      http.setSuccess(
        200,
        'Programme Version Selection Criteria Fetched Successfully',
        {
          data: result,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable To Fetch Programme Version Selection Criteria',
        {
          error: { message: error.message },
        }
      );

      return http.send(res);
    }
  }

  /**
   * GET All programmeVersionSelectionCriteria.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async fetchProgrammeVersionSelectionCriteriaByProgramme(req, res) {
    try {
      const { programmeId } = req.params;

      const result =
        await programmeVersionSelectionCriteriaService.findAllRecords({
          where: {
            programme_id: programmeId,
          },
          ...getProgrammeVersionSelectionCriteriaAttributes(),
        });

      http.setSuccess(
        200,
        'Programme Version Selection Criteria Fetched Successfully',
        {
          data: result,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable To Fetch Programme Version Selection Criteria',
        {
          error: { message: error.message },
        }
      );

      return http.send(res);
    }
  }

  /**
   * CREATE New ProgrammeVersionSelectionCriteria Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async createProgrammeVersionSelectionCriteria(req, res) {
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

      data.selection_criteria_code = toUpper(
        trim(data.selection_criteria_code)
      );

      const criteriaStudyTypes = [];

      if (!isEmpty(data.studyTypes)) {
        data.studyTypes.forEach((studyType) => {
          criteriaStudyTypes.push({
            ...studyType,
            created_by_id: user,
          });
        });
      }

      data.studyTypes = criteriaStudyTypes;

      const result = await model.sequelize.transaction(async (transaction) => {
        const result =
          await programmeVersionSelectionCriteriaService.createRecord(
            data,
            transaction
          );

        return result;
      });

      http.setSuccess(
        200,
        'Programme Version Selection Criteria Created Successfully',
        {
          data: result,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable to create this Programme Version Selection Criteria.',
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
  async addSelectionCriteriaStudyType(req, res) {
    try {
      const data = req.body;
      const { id: user } = req.user;

      data.created_by_id = user;

      const result = await model.sequelize.transaction(async (transaction) => {
        const result =
          await programmeVersionSelectionCriteriaService.createAddSelectionCriteriaStudyType(
            data,
            transaction
          );

        return result;
      });

      http.setSuccess(
        200,
        'Programme Version Selection Criteria Study Type Created Successfully',
        {
          data: result,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable to create this Programme Version Selection Criteria Study Type.',
        {
          error: { message: error.message },
        }
      );

      return http.send(res);
    }
  }

  /**
   * UPDATE Specific ProgrammeVersionSelectionCriteria Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async updateProgrammeVersionSelectionCriteria(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      data.last_updated_by_id = parseInt(req.user.id, 10);
      data.updated_at = moment.now();
      const result =
        await programmeVersionSelectionCriteriaService.updateRecord(id, data);
      const response = result[1][0];

      http.setSuccess(
        200,
        'Programme Version Selection Criteria Updated Successfully',
        {
          data: response,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable To Update This Programme Version Selection Criteria',
        {
          error: { message: error.message },
        }
      );

      return http.send(res);
    }
  }

  /**
   * Get Specific ProgrammeVersionSelectionCriteria Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async fetchProgrammeVersionSelectionCriteria(req, res) {
    try {
      const { id } = req.params;
      const result =
        await programmeVersionSelectionCriteriaService.findOneRecord({
          where: { id },
          ...getProgrammeVersionSelectionCriteriaAttributes(),
        });

      http.setSuccess(
        200,
        'Programme Version Selection Criteria fetch successful',
        {
          data: result,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable to get this Programme Version Selection Criteria',
        {
          error: { message: error.message },
        }
      );

      return http.send(res);
    }
  }

  /**
   * Destroy ProgrammeVersionSelectionCriteria Data
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async deleteProgrammeVersionSelectionCriteria(req, res) {
    try {
      const { id } = req.params;

      await programmeVersionSelectionCriteriaService.deleteRecord(id);
      http.setSuccess(
        200,
        'Programme Version Selection Criteria Deleted Successfully'
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable To Delete This Programme Version Selection Criteria',
        {
          error: { message: error.message },
        }
      );

      return http.send(res);
    }
  }
}

const getProgrammeVersionSelectionCriteriaAttributes = function () {
  return {
    attributes: {
      exclude: [
        'updated_at',
        'deleted_at',
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
        'percentage_females',
        'percentage_males',
      ],
    },
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
        association: 'studyTypes',
        include: [
          {
            association: 'studyType',
            attributes: ['id', 'metadata_value'],
          },
          {
            association: 'entryYear',
            attributes: ['id', 'metadata_value'],
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

module.exports = ProgrammeVersionSelectionCriteriaController;
