const { HttpResponse } = require('@helpers');
const { admissionFormService } = require('@services/index');
const { createAdmissionLog } = require('../Helpers/logsHelper');
const { isEmpty } = require('lodash');
const model = require('@models');
const moment = require('moment');

const http = new HttpResponse();

class AdmissionFormController {
  /**
   * GET All admissionForms.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  // order: [['section_number', 'ASC']],
  async index(req, res) {
    try {
      const admissionForms = await admissionFormService.findAllAdmissionForms({
        ...getAdmissionFormAttributes(),
      });

      http.setSuccess(200, 'Admission Forms Fetched Successfully', {
        admissionForms,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Admission Forms', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * CREATE New AdmissionForm Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async createAdmissionForm(req, res) {
    try {
      const data = req.body;
      const { id, remember_token: rememberToken } = req.user;

      data.created_by_id = parseInt(id, 10);
      data.form_name = data.form_name.toUpperCase();

      const formSections = [];

      if (data.sections) {
        data.sections.forEach((section) => {
          formSections.push({
            ...section,
            created_by_id: id,
          });
        });
      }

      data.formSections = formSections;

      const admissionForm = await model.sequelize.transaction(
        async (transaction) => {
          const result = await admissionFormService.createAdmissionForm(
            data,
            transaction
          );

          await createAdmissionLog(
            {
              user_id: id,
              operation: `CREATE`,
              area_accessed: `ADMISSION FORMS`,
              current_data: `Form: ${data.form_name}, Decription: ${data.form_description}.`,
              ip_address: req.connection.remoteAddress,
              user_agent: req.get('user-agent'),
              token: rememberToken,
            },
            transaction
          );

          return result;
        }
      );

      http.setSuccess(200, 'Admission Form created successfully', {
        admissionForm,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to create this Admission Form.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * UPDATE Specific AdmissionForm Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async updateAdmissionForm(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      const { id: user, remember_token: rememberToken } = req.user;

      data.last_updated_by_id = user;
      data.updated_at = moment.now();

      const findAdmissionForm = await admissionFormService
        .findOneAdmissionForm({
          where: {
            id,
          },
          ...getAdmissionFormAttributes(),
          nest: true,
        })
        .then(function (res) {
          if (res) {
            const result = res.toJSON();

            return result;
          }
        });

      if (!findAdmissionForm) {
        throw new Error(`Unable To Find The Admission Form.`);
      }

      const formSections = [];

      if (!isEmpty(data.sections)) {
        data.sections.forEach((section) => {
          formSections.push({
            admission_form_id: id,
            ...section,
            created_by_id: user,
          });
        });
      }

      const result = await model.sequelize.transaction(async (transaction) => {
        const response = await admissionFormService.updateAdmissionForm(
          id,
          data,
          transaction
        );

        await createAdmissionLog(
          {
            user_id: user,
            operation: `UPDATE`,
            area_accessed: `ADMISSION FORMS`,
            current_data: `Form: ${data.form_name}, Decription: ${data.form_description}.`,
            previous_data: `id: ${findAdmissionForm.id}, Form: ${findAdmissionForm.form_name}, Decription: ${findAdmissionForm.form_description}.`,
            ip_address: req.connection.remoteAddress,
            user_agent: req.get('user-agent'),
            token: rememberToken,
          },
          transaction
        );

        const admissionForm = response[1][0];

        await handleUpdatingPivots(id, formSections, transaction);

        return admissionForm;
      });

      http.setSuccess(200, 'Admission Form Updated Successfully', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Update This Admission Form', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Get Specific AdmissionForm Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async fetchAdmissionForm(req, res) {
    try {
      const { id } = req.params;
      const admissionForm = await admissionFormService.findOneAdmissionForm({
        where: { id },
        ...getAdmissionFormAttributes(),
      });

      http.setSuccess(200, 'Admission Form fetch successful', {
        admissionForm,
      });
      if (isEmpty(admissionForm))
        http.setError(404, 'Admission Form Data Not Found');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to get this Admission Form', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Destroy AdmissionForm Data
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async hardDeleteAdmissionForm(req, res) {
    try {
      const { id } = req.params;
      const { id: user, remember_token: rememberToken } = req.user;

      const findAdmissionForm = await admissionFormService
        .findOneAdmissionForm({
          where: {
            id,
          },
          ...getAdmissionFormAttributes(),
          nest: true,
        })
        .then(function (res) {
          if (res) {
            const result = res.toJSON();

            return result;
          }
        });

      if (!findAdmissionForm) {
        throw new Error(`Unable To Find The Admission Form.`);
      }

      await model.sequelize.transaction(async (transaction) => {
        await createAdmissionLog(
          {
            user_id: user,
            operation: `DELETE`,
            area_accessed: `ADMISSION FORMS`,
            previous_data: `id: ${findAdmissionForm.id}, Form: ${findAdmissionForm.form_name}, Decription: ${findAdmissionForm.form_description}.`,
            ip_address: req.connection.remoteAddress,
            user_agent: req.get('user-agent'),
            token: rememberToken,
          },
          transaction
        );

        await admissionFormService.hardDeleteAdmissionForm(id, transaction);
      });

      http.setSuccess(200, 'Admission Form Deleted Successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Delete This Admission Form', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * SOFT DELETE Specific AdmissionForm Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async softDeleteAdmissionForm(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      data.deleted_by_id = parseInt(req.user.id, 10);
      data.deleted_at = moment.now();

      const softDeleteAdmissionForm =
        await admissionFormService.softDeleteAdmissionForm(id, data);

      const admissionForm = softDeleteAdmissionForm[1][0];

      http.setSuccess(200, 'Admission Form Soft Deleted Successfully', {
        admissionForm,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Soft Delete This Admission Form', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * UNDO SOFT DELETE Specific AdmissionForm Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async undoSoftDeleteAdmissionForm(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      data.deleted_by_id = null;
      data.deleted_at = null;
      data.delete_approval_status = 'PENDING';
      const updateAdmissionForm =
        await admissionFormService.undoSoftDeleteAdmissionForm(id, data);
      const admissionForm = updateAdmissionForm[1][0];

      http.setSuccess(200, 'Admission Form Retrieve Successfully', {
        admissionForm,
      });
      if (isEmpty(admissionForm))
        http.setError(404, 'Admission Form Data Not Found');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Retrieve This Admission Form', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

/**
 *
 * @param {*} admissionFormId
 * @param {*} formSections
 * @param {*} transaction
 */
const handleUpdatingPivots = async function (
  admissionFormId,
  formSections,
  transaction
) {
  try {
    if (!isEmpty(formSections)) {
      await deleteOrCreateElements(
        formSections,
        'findAllAdmissionFormSections',
        'bulkInsertAdmissionFormSections',
        'bulkRemoveAdmissionFormSections',
        'updateAdmissionFormSection',
        'form_section_id',
        admissionFormId,
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
 * @param {*} admissionFormId
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
  admissionFormId,
  transaction
) => {
  const elementsToDelete = [];
  const elementsToInsert = [];
  const elementsToUpdate = [];

  const secondElements = await admissionFormService[findAllService]({
    where: {
      admission_form_id: admissionFormId,
    },
    attributes: ['id', 'admission_form_id', firstField],
    raw: true,
  });

  firstElements.forEach((firstElement) => {
    const myElement = secondElements.find(
      (secondElement) =>
        parseInt(firstElement[firstField], 10) ===
          parseInt(secondElement[firstField], 10) &&
        parseInt(firstElement.admission_form_id, 10) ===
          parseInt(secondElement.admission_form_id, 10)
    );

    if (!myElement) {
      elementsToInsert.push(firstElement);
    } else {
      const locateContextId = secondElements.find(
        (value) =>
          parseInt(value.admission_form_id, 10) ===
            parseInt(firstElement.admission_form_id, 10) &&
          parseInt(value.form_section_id, 10) ===
            parseInt(firstElement.form_section_id, 10)
      );

      elementsToUpdate.push({ id: locateContextId.id, ...firstElement });
    }
  });

  secondElements.forEach((secondElement) => {
    const myElement = firstElements.find(
      (firstElement) =>
        parseInt(firstElement[firstField], 10) ===
          parseInt(secondElement[firstField], 10) &&
        parseInt(firstElement.admission_form_id, 10) ===
          parseInt(secondElement.admission_form_id, 10)
    );

    if (!myElement) elementsToDelete.push(secondElement.id);
  });

  if (!isEmpty(elementsToInsert)) {
    await admissionFormService[insertService](elementsToInsert, transaction);
  }

  if (!isEmpty(elementsToDelete)) {
    await admissionFormService[deleteService](elementsToDelete, transaction);
  }

  if (!isEmpty(elementsToUpdate)) {
    for (const item of elementsToUpdate) {
      await admissionFormService[updateService](item.id, item, transaction);
    }
  }

  return { elementsToDelete, elementsToInsert };
};

const getAdmissionFormAttributes = function () {
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
        association: 'formSections',
        attributes: [
          'id',
          'admission_form_id',
          'form_section_id',
          'section_number',
          'is_mandatory',
        ],
        include: [
          {
            association: 'formSection',
            attributes: ['id', 'metadata_value'],
          },
        ],
      },
      // {
      //   association: 'sections',
      //   attributes: ['id', 'metadata_value'],
      //   through: {
      //     attributes: ['section_number'],
      //   },
      // },
    ],
  };
};

module.exports = AdmissionFormController;
