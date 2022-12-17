const { HttpResponse } = require('@helpers');
const { appFunctionService } = require('@services/index');
const { application } = require('express');
const { isEmpty } = require('lodash');
const models = require('@models');

const http = new HttpResponse();

class AppFunctionController {
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
      const appFunctions = await appFunctionService.findAllAppFunctions();

      http.setSuccess(200, 'App Functions Fetched Successfully', {
        appFunctions,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch App Functions', {
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
  async createAppFunction(req, res) {
    try {
      const data = req.body;
      //  const { id } = req.user;

      data.action_group = data.action_group.toUpperCase();
      data.function_name = data.function_name.toUpperCase();
      data.function_description = data.function_description.toUpperCase();
      const appFunction = await appFunctionService.createAppFunction(data);

      http.setSuccess(201, 'App Functions Fetched Successfully', {
        appFunction,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Create This App Function', {
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
  async updateAppFunction(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      data.action_group = data.action_group.toUpperCase();
      data.function_name = data.function_name.toUpperCase();
      data.function_description = data.function_description.toUpperCase();
      const updateAppFunction = await appFunctionService.updateAppFunction(
        id,
        data
      );
      const appFunction = updateAppFunction[1][0];

      http.setSuccess(200, 'App Function updated successfully', {
        appFunction,
      });
      if (isEmpty(appFunction))
        http.setError(404, 'App Function Data Not Found');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Update This App Function', {
        error: {
          message: error.message,
        },
      });

      return http.send(res);
    }
  }

  async updateManyAppFunctions(req, res) {
    try {
      const { appId } = req.params;
      const updateAppFunctions =
        await appFunctionService.updateManyAppFunctions(appId, req.body);

      http.setSuccess(200, 'App Functions Updated Successfully', {
        updateAppFunctions,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Update These App Functions', {
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
  async fetchAppFunction(req, res) {
    try {
      const { id } = req.params;
      const appFunction = await appFunctionService.findOneAppFunction({
        where: { id },
      });

      http.setSuccess(200, 'App Function Fetch Successful', { appFunction });
      if (isEmpty(appFunction))
        http.setError(404, 'App Function Data Not Found');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Update This App Functions', {
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
  async deleteAppFunction(req, res) {
    try {
      const { id } = req.params;

      await appFunctionService.deleteAppFunction(id);
      http.setSuccess(200, 'App Function Deleted Successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Delete This App Function', {
        error: {
          message: error.message,
        },
      });

      return http.send(res);
    }
  }
}

module.exports = AppFunctionController;
