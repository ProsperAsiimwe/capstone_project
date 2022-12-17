const { clientService } = require('@services/index');
const { createToken } = require('@helpers/jwt-token');
const moment = require('moment');

/**
 *
 * @param {*} context
 * @returns
 */
const authFunction = async function (data) {
  const context = data;

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

  return {
    access_token: tokenResponse,
  };
};

module.exports = { authFunction };
