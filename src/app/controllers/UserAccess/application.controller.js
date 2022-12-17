const { HttpResponse } = require('@helpers');
const { applicationService } = require('@services/index');
const { isEmpty } = require('lodash');
const models = require('@models');

const http = new HttpResponse();

class ApplicationController {
  /**
   * GET All  applications.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async index(req, res) {
    try {
      const applications = await applicationService.findAllApplications({
        include: ['appFunctions'],
      });

      http.setSuccess(200, 'Applications Fetched Successful', {
        applications,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Applications', {
        error: {
          message: error.message,
        },
      });

      return http.send(res);
    }
  }

  /**
   * CREATE New application  Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async createApplication(req, res) {
    try {
      const data = req.body;
      // const { id } = req.user;

      data.app_code = data.app_code.toUpperCase().trim();
      data.app_name = data.app_name.toUpperCase().trim();

      const appFunctions = [];

      if (!isEmpty(data.app_functions)) {
        data.app_functions.forEach((appFunction) =>
          appFunctions.push({
            ...appFunction,
            //  created_by_id: id
          })
        );
      }

      data.appFunctions = appFunctions;

      const application = await models.sequelize.transaction(
        async (transaction) => {
          const result = await applicationService.createApplication(
            data,
            transaction
          );

          return result;
        }
      );

      http.setSuccess(201, 'Application created successfully', {
        application,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to create this Application', {
        error: {
          message: error.message,
        },
      });

      return http.send(res);
    }
  }

  /**
   * UPDATE Specific Application Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async updateApplication(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      data.app_code = data.app_code.toUpperCase();
      data.app_name = data.app_name.toUpperCase();
      data.app_description = data.app_description.toUpperCase();
      const updateApplication = await applicationService.updateApplication(
        id,
        data
      );
      const application = updateApplication[1][0];

      http.setSuccess(200, 'Application updated successfully', { application });
      if (isEmpty(application))
        http.setError(200, 'Application Data Not Found');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to update this Application', {
        error: {
          message: error.message,
        },
      });

      return http.send(res);
    }
  }

  /**
   * Get Specific Application Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async fetchApplication(req, res) {
    try {
      const { id } = req.params;
      const application = await applicationService.findOneApplication({
        where: { id },
      });

      http.setSuccess(200, 'Application fetch successful', { application });
      if (isEmpty(application))
        http.setError(404, 'Application Data Not Found');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to fetch this Application', {
        error: {
          message: error.message,
        },
      });

      return http.send(res);
    }
  }

  /**
   * Destroy Application  Data
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async deleteApplication(req, res) {
    try {
      const { id } = req.params;

      await applicationService.deleteApplication(id);
      http.setSuccess(200, 'Application deleted successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to delete this application', {
        error: {
          message: error.message,
        },
      });

      return http.send(res);
    }
  }
}

module.exports = ApplicationController;
