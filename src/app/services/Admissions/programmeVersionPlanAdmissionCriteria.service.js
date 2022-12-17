const models = require('@models');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for a programmeVersionPlanAdmissionCriteria
class ProgrammeVersionPlanAdmissionCriteriaService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all programmeVersionPlanAdmissionCriterias or filtered using options param
   */
  static async findAllProgrammeVersionPlanAdmissionCriterias(options) {
    try {
      const results =
        await models.ProgrammeVersionPlanAdmissionCriteria.findAll({
          ...options,
        });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersionPlanAdmissionCriteria.service.js`,
        `findAllProgrammeVersionPlanAdmissionCriterias`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single programmeVersionPlanAdmissionCriteria object basing on the options
   */
  static async findOneProgrammeVersionPlanAdmissionCriteria(options) {
    try {
      const programmeVersionPlanAdmissionCriteria =
        await models.ProgrammeVersionPlanAdmissionCriteria.findOne({
          ...options,
        });

      return programmeVersionPlanAdmissionCriteria;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersionPlanAdmissionCriteria.service.js`,
        `findOneProgrammeVersionPlanAdmissionCriteria`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single programmeVersionPlanAdmissionCriteria object from data object
   *@
   */
  static async createProgrammeVersionPlanAdmissionCriteria(data, transaction) {
    try {
      const programmeVersionPlanAdmissionCriteria =
        await models.ProgrammeVersionPlanAdmissionCriteria.create(data, {
          include: [
            {
              association:
                models.ProgrammeVersionPlanAdmissionCriteria.unebSubjects,
            },
          ],
          transaction,
        });

      return programmeVersionPlanAdmissionCriteria;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersionPlanAdmissionCriteria.service.js`,
        `createProgrammeVersionPlanAdmissionCriteria`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of programmeVersionPlanAdmissionCriteria object to be updated
   * @returns {Promise}
   * @description updates a single programmeVersionPlanAdmissionCriteria object
   *@
   */
  static async updateProgrammeVersionPlanAdmissionCriteria(id, data) {
    try {
      const updated = await models.ProgrammeVersionPlanAdmissionCriteria.update(
        { ...data },
        { where: { id }, returning: true }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersionPlanAdmissionCriteria.service.js`,
        `updateProgrammeVersionPlanAdmissionCriteria`,
        `PUT`
      );
    }
  }

  /**
   * @param {string} id  id of programmeVersionPlanAdmissionCriteria object to be deleted permanently
   * @returns {Promise}
   * @description deletes a single programmeVersionPlanAdmissionCriteria object permanently
   *@
   */
  static async hardDeleteProgrammeVersionPlanAdmissionCriteria(id) {
    try {
      const deleted =
        await models.ProgrammeVersionPlanAdmissionCriteria.destroy({
          where: { id },
        });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersionPlanAdmissionCriteria.service.js`,
        `hardDeleteProgrammeVersionPlanAdmissionCriteria`,
        `DELETE`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of programmeVersionPlanAdmissionCriteria object to be soft deleted
   * @returns {Promise}
   * @description soft deletes a single programmeVersionPlanAdmissionCriteria object
   *@
   */
  static async softDeleteProgrammeVersionPlanAdmissionCriteria(id, data) {
    try {
      const deleted = await models.ProgrammeVersionPlanAdmissionCriteria.update(
        { ...data },
        { where: { id }, returning: false }
      );

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersionPlanAdmissionCriteria.service.js`,
        `softDeleteProgrammeVersionPlanAdmissionCriteria`,
        `PUT`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of programmeVersionPlanAdmissionCriteria object to be soft delete undone
   * @returns {Promise}
   * @description undoes soft delete on a single programmeVersionPlanAdmissionCriteria object
   *@
   */
  static async undoSoftDeleteProgrammeVersionPlanAdmissionCriteria(id, data) {
    try {
      const undo = await models.ProgrammeVersionPlanAdmissionCriteria.update(
        { ...data },
        { where: { id }, returning: false }
      );

      return undo;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersionPlanAdmissionCriteria.service.js`,
        `undoSoftDeleteProgrammeVersionPlanAdmissionCriteria`,
        `PUT`
      );
    }
  }
}

module.exports = ProgrammeVersionPlanAdmissionCriteriaService;
