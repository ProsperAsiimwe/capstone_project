const { pujabRunningAdmissionService } = require('@services/index');
const { HttpResponse } = require('@helpers');
const model = require('@models');
const { isEmpty } = require('lodash');

const http = new HttpResponse();

class PujabRunningAdmissionController {
  // index function to show
  /**
   *
   * @param {*} req
   * @param {*} res
   */
  async getAllAdmissions(req, res) {
    try {
      const result = await pujabRunningAdmissionService.findAllApplicants({
        ...getAllAdmissionAttributes(),
      });

      http.setSuccess(200, 'Admissions Fetched Successfully', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch All Admissions.', {
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
  async createAdmission(req, res) {
    try {
      const data = req.body;
      const user = req.user.id;

      data.created_by_id = user;

      const findAcademicYear =
        await pujabRunningAdmissionService.findOneAdmission({
          where: {
            academic_year_id: data.academic_year_id,
          },
          raw: true,
        });

      if (findAcademicYear)
        throw new Error(
          'Admission has already been opened for this academic Year'
        );

      if (!isEmpty(data.institutions)) {
        data.institutions = data.institutions.map((institution) => ({
          institution_id: institution,
          created_by_id: user,
        }));
      }

      const result = await model.sequelize.transaction(async (transaction) => {
        const response = await pujabRunningAdmissionService.createAdmission(
          data,
          transaction
        );

        return response;
      });

      http.setSuccess(200, 'Admission created successfully', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to create admission', {
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
  async createAdmissionInstitutionProgramme(req, res) {
    try {
      const data = req.body;
      const user = req.user.id;

      let programmes = [];

      if (!isEmpty(data.programmes)) {
        programmes = data.programmes.map((programme) => ({
          pujab_admission_institution_id: data.pujab_admission_institution_id,
          institution_programme_id: programme.institution_programme_id,
          pujab_section_id: programme.pujab_section_id,
          created_by_id: user,
        }));
      }

      const result = await model.sequelize.transaction(async (transaction) => {
        const response =
          await pujabRunningAdmissionService.createAdmissionInstitutionProgramme(
            programmes,
            transaction
          );

        return response;
      });

      http.setSuccess(
        200,
        'Admission Institution Programmes Added Successfully',
        {
          data: result,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Create Admission Institution Programmes', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async findOneAdmission(req, res) {
    try {
      const { id } = req.params;
      const record = await pujabRunningAdmissionService.findOneAdmission({
        where: { id },
        ...getAllAdmissionAttributes(),
      });

      http.setSuccess(200, 'Admission fetched successfully', {
        record,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to get this Admission.', {
        error: { error: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async activateAdmission(req, res) {
    try {
      const { id } = req.params;

      const result = await model.sequelize.transaction(async (transaction) => {
        const findAllActive =
          await pujabRunningAdmissionService.findAllApplicants({
            where: { is_active: true },
            raw: true,
          });

        if (!isEmpty(findAllActive)) {
          for (const obj of findAllActive) {
            await pujabRunningAdmissionService.updateAdmission(
              obj.id,
              {
                is_active: false,
              },
              transaction
            );
          }
        }

        const admission = await pujabRunningAdmissionService.updateAdmission(
          id,
          {
            is_active: true,
          },
          transaction
        );
        const response = admission[1][0];

        return response;
      });

      http.setSuccess(200, 'Admission Activated Successfully', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Activate Admission.', {
        error: { error: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async deActivateAdmission(req, res) {
    try {
      const { id } = req.params;

      const result = await model.sequelize.transaction(async (transaction) => {
        const admission = await pujabRunningAdmissionService.updateAdmission(
          id,
          {
            is_active: false,
          },
          transaction
        );
        const response = admission[1][0];

        return response;
      });

      http.setSuccess(200, 'Admission De-Activated Successfully', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To De-Activate Admission.', {
        error: { error: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async findOnePujabAdmissionInstitution(req, res) {
    try {
      const { id } = req.params;

      const record =
        await pujabRunningAdmissionService.findOnePujabAdmissionInstitution({
          where: { id },
          ...getAllPujabAdmissionInstitutionAttributes(),
        });

      http.setSuccess(
        200,
        'Admission Institution Programmes fetched Successfully.',
        {
          record,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable to get this Admission Institution Programmes.',
        {
          error: { error: error.message },
        }
      );

      return http.send(res);
    }
  }

  /**
   * UPDATE Specific Admission Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async updateAdmission(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      const user = req.user.id;

      data.last_updated_by_id = user;

      const admissionInstitutions = [];

      if (!isEmpty(data.institutions)) {
        data.institutions.forEach((institution) => {
          admissionInstitutions.push({
            pujab_running_admission_id: id,
            institution_id: institution,
            last_updated_by_id: user,
            created_by_id: user,
          });
        });
      }

      const result = await model.sequelize.transaction(async (transaction) => {
        const admission = await pujabRunningAdmissionService.updateAdmission(
          id,
          data,
          transaction
        );
        const response = admission[1][0];

        await handleUpdatingPivots(id, admissionInstitutions, transaction);

        return response;
      });

      http.setSuccess(200, 'Admission updated successfully', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to update this Admission.', {
        error: { message: error.message },
      });

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
  async deleteAdmission(req, res) {
    try {
      const { id } = req.params;

      const record = await pujabRunningAdmissionService.findOneAdmission({
        where: { id },
        ...getAllAdmissionAttributes(),
      });

      await model.sequelize.transaction(async (transaction) => {
        if (!isEmpty(record.institutions)) {
          for (const item of record.institutions) {
            await pujabRunningAdmissionService.deleteAdmissionInstitutions(
              item.id,
              transaction
            );
          }
        }

        await pujabRunningAdmissionService.deleteAdmission(id, transaction);
      });

      http.setSuccess(200, 'Admission deleted successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to delete this Admission.', {
        error: { message: error.message },
      });

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
  async deletePujabAdmissionInstitution(req, res) {
    try {
      const { id } = req.params;

      await model.sequelize.transaction(async (transaction) => {
        await pujabRunningAdmissionService.deletePujabAdmissionInstitution(
          id,
          transaction
        );
      });

      http.setSuccess(200, 'Admission Institution deleted successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to delete this Admission Institution.', {
        error: { message: error.message },
      });

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
  async deletePujabAdmissionInstitutionProgrammes(req, res) {
    try {
      const data = req.body;

      await model.sequelize.transaction(async (transaction) => {
        await pujabRunningAdmissionService.deletePujabAdmissionInstitutionProgrammes(
          data.programmes,
          transaction
        );
      });

      http.setSuccess(
        200,
        'Pujab Admission Institution Programmes Deleted Successfully'
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable to delete Pujab Admission Institution Programmes.',
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
 * @param {*} pujabAdmissionId
 * @param {*} admissionInstitutions
 * @param {*} transaction
 */
const handleUpdatingPivots = async function (
  pujabAdmissionId,
  admissionInstitutions,
  transaction
) {
  try {
    if (!isEmpty(admissionInstitutions)) {
      await deleteOrCreateElements(
        admissionInstitutions,
        'findAllAdmissionInstitutions',
        'bulkInsertAdmissionInstitutions',
        'bulkRemoveAdmissionInstitutions',
        'institution_id',
        pujabAdmissionId,
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
 * @param {*} admissionId
 * @param {*} transaction
 * @returns
 */
const deleteOrCreateElements = async (
  firstElements,
  findAllService,
  insertService,
  deleteService,
  firstField,
  admissionId,
  transaction
) => {
  const elementsToDelete = [];
  const elementsToInsert = [];

  const secondElements = await pujabRunningAdmissionService[findAllService]({
    where: {
      pujab_running_admission_id: admissionId,
    },
    attributes: ['id', 'pujab_running_admission_id', firstField],
    raw: true,
  });

  firstElements.forEach((firstElement) => {
    const myElement = secondElements.find(
      (secondElement) =>
        parseInt(firstElement[firstField], 10) ===
          parseInt(secondElement[firstField], 10) &&
        parseInt(firstElement.pujab_running_admission_id, 10) ===
          parseInt(secondElement.pujab_running_admission_id, 10)
    );

    if (!myElement) elementsToInsert.push(firstElement);
  });

  secondElements.forEach((secondElement) => {
    const myElement = firstElements.find(
      (firstElement) =>
        parseInt(firstElement[firstField], 10) ===
          parseInt(secondElement[firstField], 10) &&
        parseInt(firstElement.pujab_running_admission_id, 10) ===
          parseInt(secondElement.pujab_running_admission_id, 10)
    );

    if (!myElement) elementsToDelete.push(secondElement.id);
  });

  if (!isEmpty(elementsToInsert)) {
    await pujabRunningAdmissionService[insertService](
      elementsToInsert,
      transaction
    );
  }

  if (!isEmpty(elementsToDelete)) {
    await pujabRunningAdmissionService[deleteService](
      elementsToDelete,
      transaction
    );
  }

  return { elementsToDelete, elementsToInsert };
};

const getAllPujabAdmissionInstitutionAttributes = () => ({
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
    ],
  },
  include: [
    {
      association: 'programmes',
      include: [
        {
          association: 'pujabSection',
          attributes: ['id', 'metadata_value'],
        },
        {
          association: 'institutionProgramme',
          include: [
            {
              association: 'durationMeasure',
              attributes: ['id', 'metadata_value'],
            },
            {
              association: 'award',
              attributes: ['id', 'metadata_value'],
            },
            {
              association: 'studyLevel',
              attributes: ['id', 'metadata_value'],
            },
          ],
        },
      ],
    },
  ],
});

const getAllAdmissionAttributes = () => ({
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
    ],
  },
  include: [
    {
      association: 'academicYear',
      attributes: ['id', 'metadata_value'],
    },
    {
      association: 'billingCurrency',
      attributes: ['id', 'metadata_value'],
    },
    {
      association: 'chartOfAccount',
      attributes: ['id', 'account_name', 'account_code'],
    },
    {
      association: 'createdBy',
      attributes: ['surname', 'other_names'],
    },
    {
      association: 'institutions',
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
        ],
      },
      include: [
        {
          association: 'institution',
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
            ],
          },
          include: [
            {
              association: 'institutionType',
              attributes: ['id', 'metadata_value'],
            },
          ],
        },
        // {
        //   association: 'programmes',
        //   include: [
        //     {
        //       association: 'pujabSection',
        //       attributes: ['id', 'metadata_value'],
        //     },
        //     {
        //       association: 'institutionProgramme',
        //       include: [
        //         {
        //           association: 'durationMeasure',
        //           attributes: ['id', 'metadata_value'],
        //         },
        //         {
        //           association: 'award',
        //           attributes: ['id', 'metadata_value'],
        //         },
        //         {
        //           association: 'studyLevel',
        //           attributes: ['id', 'metadata_value'],
        //         },
        //       ],
        //     },
        //   ],
        // },
      ],
    },
  ],
});

module.exports = PujabRunningAdmissionController;
