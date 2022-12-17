const { HttpResponse } = require('@helpers');
const {
  clientService,
  //   institutionStructureService,
  //   metadataValueService,
} = require('@services/index');

const crypto = require('crypto');
const { lowerCase, upperCase } = require('lodash');
const models = require('@models');
const { createToken } = require('@helpers/jwt-token');
const moment = require('moment');

const http = new HttpResponse();

class ClientController {
  async clientFunction(req, res) {
    try {
      const data = await clientService.findAllClients({
        attributes: { include: ['secret_number'] },
      });

      http.setSuccess(200, 'Clients fetched successfully', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  // create client

  async createClientFunction(req, res) {
    try {
      const context = req.body;

      if (!context.application_name || !context.code) {
        throw new Error(`Access Denied`);
      }

      const findClient = await clientService.fetchOneClient({
        where: { application_name: context.application_name },
      });

      if (findClient) {
        throw new Error(`Client Already Exists`);
      }

      const randomNumber = Math.floor(Math.random() * 90000) + 10000;

      const clientId = context.code + -+222 + randomNumber;

      const generateSecrete = generateSecreteFunction(context);

      const payload = {
        application_name: context.application_name,
        code: upperCase(context.code),
        client_id: clientId,
        secret_number: generateSecrete,
        ...context,
      };

      const response = await models.sequelize.transaction(
        async (transaction) => {
          const result = await clientService.createClient(payload, transaction);

          return result;
        }
      );

      http.setSuccess(200, 'Clients fetched successfully', {
        response,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  // client login
  async clientLogin(req, res) {
    try {
      const context = req.body;

      if (!context.secret_key || !context.clientId) {
        throw new Error(`Access Denied`);
      }

      const findClient = await clientService.fetchOneClient({
        where: { client_id: context.clientId, is_active: true },
        attributes: { include: ['secret_number'] },
      });

      if (!findClient) {
        throw new Error(`Access Denied {Invalid}`);
      }

      if (findClient.secret_number !== context.secret_key) {
        throw new Error(`Access Denied {Invalid}`);
      }

      const token = await createToken({
        id: findClient.id,
        email: findClient.client_id,
      });

      const tokenResponse = {
        token_type: 'Bearer',
        token,
      };

      await clientService.updateClient(findClient.id, {
        last_login: moment(new Date()).format(),
        remember_token: token,
      });

      http.setSuccess(200, 'Clients fetched successfully', {
        access_token: tokenResponse,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

module.exports = ClientController;

const generateSecreteFunction = function (data) {
  const randomBytes = crypto.randomBytes(15).toString('hex');

  const result = data.code.toUpperCase() + lowerCase('ACMIS') + randomBytes;

  return result;
};
