const models = require('@models');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for a college
class AppFunctionService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all faculties or filtered using options param
   */
  static async findAllAppFunctions(options) {
    try {
      const results = await models.AppFunction.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `appfunction.service.js`,
        `findAllAppFunctions`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single college object basing on the options
   */
  static async findOneAppFunction(options) {
    try {
      const appfunction = await models.AppFunction.findOne({ ...options });

      return appfunction;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `appfunction.service.js`,
        `findOneAppFunction`,
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
  static async createAppFunction(data) {
    try {
      const newAppFunction = await models.AppFunction.create({
        ...data,
      });

      return newAppFunction;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `appfunction.service.js`,
        `createAppFunction`,
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
  static async updateAppFunction(id, data) {
    try {
      const updated = await models.AppFunction.update(
        { ...data },
        { where: { id }, returning: true }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `appfunction.service.js`,
        `updateAppFunction`,
        `PUT`
      );
    }
  }

  static async updateManyAppFunctions(appId, data) {
    try {
      const updateApplication = await models.Application.update(
        {
          app_code: data.app_code,
          app_name: data.app_name,
          app_url: data.app_url,
          app_status: data.app_status,
          app_description: data.app_description,
        },
        {
          where: { id: appId },
          returning: true,
        }
      );

      const { appFunctions } = data;
      const updateFunctions = appFunctions.forEach(async function (
        appFunction
      ) {
        const result = await models.GradingValue.update(
          { ...appFunction },
          {
            where: { id: appFunction.id, app_id: appId },
            returning: true,
          }
        );

        return result;
      });

      return { ...updateApplication, ...updateFunctions };
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `appfunction.service.js`,
        `updateManyAppFunctions`,
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
  static async deleteAppFunction(id) {
    try {
      const deleted = await models.AppFunction.destroy({
        where: { id },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `appfunction.service.js`,
        `deleteAppFunction`,
        `DELETE`
      );
    }
  }
}

module.exports = AppFunctionService;
