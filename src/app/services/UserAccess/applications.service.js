const models = require('@models');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for a college
class ApplicationService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all faculties or filtered using options param
   */
  static async findAllApplications(options) {
    try {
      const results = await models.Application.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applications.service.js`,
        `findAllApplications`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single college object basing on the options
   */
  static async findOneApplication(options) {
    try {
      const application = await models.Application.findOne({ ...options });

      return application;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applications.service.js`,
        `findOneApplication`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single college object from data object
   *@
   */
  static async createApplication(data, transaction) {
    try {
      const newApplication = await models.Application.create(data, {
        include: [
          {
            association: models.Application.appFunctions,
          },
        ],
        transaction,
      });

      return newApplication;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applications.service.js`,
        `createApplication`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of college object to be updated
   * @returns {Promise}
   * @description updates a single college object
   *@
   */
  static async updateApplication(id, data) {
    try {
      const updated = await models.Application.update(
        { ...data },
        { where: { id }, returning: true }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applications.service.js`,
        `updateApplication`,
        `PUT`
      );
    }
  }

  /**
   * @param {string} id  id of college object to be deleted
   * @returns {Promise}
   * @description deletes a single college object
   *@
   */
  static async deleteApplication(id) {
    try {
      const deleted = await models.Application.destroy({
        where: { id },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applications.service.js`,
        `deleteApplication`,
        `DELETE`
      );
    }
  }
}

module.exports = ApplicationService;
