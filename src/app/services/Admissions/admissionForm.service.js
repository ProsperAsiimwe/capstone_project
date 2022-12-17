const models = require('@models');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for a admissionForm
class AdmissionFormService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all admission schemes or filtered using options param
   */
  static async findAllAdmissionForms(options) {
    try {
      const results = await models.AdmissionForm.findAll({
        ...options,
        order: [[models.AdmissionForm.formSections, 'section_number', 'ASC']],
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `admissionForm.service.js`,
        `findAllAdmissionForms`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} options
   * @returns
   */
  static async findAllAdmissionFormSections(options) {
    try {
      const results = await models.AdmissionFormSection.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `admissionForm.service.js`,
        `findAllAdmissionFormSections`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async bulkInsertAdmissionFormSections(data, transaction) {
    try {
      const result = await models.AdmissionFormSection.bulkCreate(data, {
        transaction,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `admissionForm.service.js`,
        `bulkInsertAdmissionFormSections`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} data
   */
  static async bulkRemoveAdmissionFormSections(data, transaction) {
    try {
      const deleted = await models.AdmissionFormSection.destroy({
        where: { id: data },
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `admissionForm.service.js`,
        `bulkRemoveAdmissionFormSections`,
        `DELETE`
      );
    }
  }

  /**
   *
   * @param {*} data
   */
  static async updateAdmissionFormSection(id, data, transaction) {
    try {
      const deleted = await models.AdmissionFormSection.update(
        { ...data },
        {
          where: { id },
          transaction,
          returning: true,
        }
      );

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `admissionForm.service.js`,
        `updateAdmissionFormSection`,
        `PUT`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single admissionForm object basing on the options
   */
  static async findOneAdmissionForm(options) {
    try {
      const admissionForm = await models.AdmissionForm.findOne({
        ...options,
        order: [[models.AdmissionForm.formSections, 'section_number', 'ASC']],
      });

      return admissionForm;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `admissionForm.service.js`,
        `findOneAdmissionForm`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single admissionForm object from data object
   *@
   */
  static async createAdmissionForm(data, transaction) {
    try {
      const admissionForm = await models.AdmissionForm.create(data, {
        include: [
          {
            association: models.AdmissionForm.formSections,
          },
        ],
        transaction,
      });

      return admissionForm;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `admissionForm.service.js`,
        `createAdmissionForm`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of admissionForm object to be updated
   * @returns {Promise}
   * @description updates a single admissionForm object
   *@
   */
  static async updateAdmissionForm(id, data, transaction) {
    try {
      const updated = await models.AdmissionForm.update(
        { ...data },
        { where: { id }, transaction, returning: true }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `admissionForm.service.js`,
        `updateAdmissionForm`,
        `PUT`
      );
    }
  }

  /**
   * @param {string} id  id of admissionForm object to be deleted permanently
   * @returns {Promise}
   * @description deletes a single admissionForm object permanently
   *@
   */
  static async hardDeleteAdmissionForm(id, transaction) {
    try {
      const deleted = await models.AdmissionForm.destroy({
        where: {
          id,
        },
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `admissionForm.service.js`,
        `hardDeleteAdmissionForm`,
        `DELETE`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of admissionForm object to be soft deleted
   * @returns {Promise}
   * @description soft deletes a single admissionForm object
   *@
   */
  static async softDeleteAdmissionForm(id, data) {
    try {
      const deleted = await models.AdmissionForm.update(
        { ...data },
        { where: { id }, returning: false }
      );

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `admissionForm.service.js`,
        `softDeleteAdmissionForm`,
        `PUT`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of programmeVersionAdmissionCriteria object to be soft delete undone
   * @returns {Promise}
   * @description undoes soft delete on a single programmeVersionAdmissionCriteria object
   *@
   */
  static async undoSoftDeleteAdmissionForm(id, data) {
    try {
      const undo = await models.AdmissionForm.update(
        { ...data },
        { where: { id }, returning: false }
      );

      return undo;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `admissionForm.service.js`,
        `undoSoftDeleteAdmissionForm`,
        `PUT`
      );
    }
  }
}

module.exports = AdmissionFormService;
