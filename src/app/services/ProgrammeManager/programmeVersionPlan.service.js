const models = require('@models');
const moment = require('moment');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for a programmeVersionPlan
class ProgrammeVersionPlanService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all faculties or filtered using options param
   */
  static async findAllProgrammeVersionPlans(options) {
    try {
      const results = await models.ProgrammeVersionPlan.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersionPlan.service.js`,
        `findAllProgrammeVersionPlans`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single programmeVersionPlan object basing on the options
   */
  static async findOneProgrammeVersionPlan(options) {
    try {
      const programmeVersionPlan = await models.ProgrammeVersionPlan.findOne({
        ...options,
      });

      return programmeVersionPlan;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersionPlan.service.js`,
        `findOneProgrammeVersionPlan`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single programmeVersionPlan object from data object
   *@
   */
  static async createProgrammeVersionPlan(data) {
    try {
      const defaultFields = {
        create_approval_status: 'PENDING',
        created_at: moment.now(),
        updated_at: moment.now(),
      };
      const newProgrammeVersionPlan = await models.ProgrammeVersionPlan.create({
        ...data,
        ...defaultFields,
      });

      return newProgrammeVersionPlan;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersionPlan.service.js`,
        `createProgrammeVersionPlan`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of programmeVersionPlan object to be updated
   * @returns {Promise}
   * @description updates a single programmeVersionPlan object
   *@
   */
  static async updateProgrammeVersionPlan(id, data) {
    try {
      const updated = await models.ProgrammeVersionPlan.update(
        { ...data },
        { where: { id }, returning: true }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersionPlan.service.js`,
        `updateProgrammeVersionPlan`,
        `PUT`
      );
    }
  }

  /**
   * @param {string} id  id of programmeVersionPlan object to be deleted
   * @returns {Promise}
   * @description deletes a single programmeVersionPlan object
   *@
   */
  static async deleteProgrammeVersionPlan(id) {
    try {
      const deleted = await models.ProgrammeVersionPlan.destroy({
        where: { id },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersionPlan.service.js`,
        `deleteProgrammeVersionPlan`,
        `DELETE`
      );
    }
  }
}

module.exports = ProgrammeVersionPlanService;
