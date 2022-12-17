const models = require('@models');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for a specialization
class SpecializationService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all faculties or filtered using options param
   */
  static async findAllSpecializations(options) {
    try {
      const specializations = await models.Specialization.findAll(options);

      return specializations;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `specialization.service.js`,
        `findAllSpecializations`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single specialization object basing on the options
   */
  static async findOneSpecialization(options) {
    try {
      const specialization = await models.Specialization.findOne({
        ...options,
      });

      return specialization;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `specialization.service.js`,
        `findOneSpecialization`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} options
   */
  static async findOneProgrammeVersionSpecialization(options) {
    try {
      const specialization =
        await models.ProgrammeVersionSpecialization.findOne({
          ...options,
        });

      return specialization;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `specialization.service.js`,
        `findOneProgrammeVersionSpecialization`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single specialization object from data object
   *@
   */
  static async createSpecialization(data) {
    try {
      const newSpecialization = await models.Specialization.create({
        ...data,
      });

      return newSpecialization;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `specialization.service.js`,
        `createSpecialization`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of specialization object to be updated
   * @returns {Promise}
   * @description updates a single specialization object
   *@
   */
  static async updateSpecialization(id, data) {
    try {
      const updated = await models.Specialization.update(
        { ...data },
        { where: { id }, returning: true }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `specialization.service.js`,
        `updateSpecialization`,
        `PUT`
      );
    }
  }

  /**
   * @param {string} id  id of specialization object to be deleted
   * @returns {Promise}
   * @description deletes a single specialization object
   *@
   */
  static async deleteSpecialization(id) {
    try {
      const deleted = await models.Specialization.destroy({
        where: { id },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `specialization.service.js`,
        `deleteSpecialization`,
        `DELETE`
      );
    }
  }
}

module.exports = SpecializationService;
