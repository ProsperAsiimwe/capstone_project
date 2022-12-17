const HttpResponse = require('@helpers/http-response');
const { createToken } = require('@helpers/jwt-token');
const { userService, applicationService } = require('@services/index');
const models = require('@models/index');
const { isEmpty } = require('lodash');
const moment = require('moment');
const bcrypt = require('bcrypt');

const http = new HttpResponse();

class BiometricAuthController {
  async login(req, res) {
    const { username } = req.body;
    const { password } = req.body;

    try {
      const findUser = await userService.findByEmailOrPhone(username);

      if (isEmpty(findUser)) {
        HttpResponse.setError(400, 'Invalid username provided.');

        return http.send(res);
      }

      if (findUser.is_active !== true) {
        throw new Error(
          `Your Account Has Been Deactivated. Please Contact Your Group Administrator.`
        );
      }
      const biometricApp = await applicationService.findOneApplication({
        where: {
          app_code: 'PB_MGT',
        },
      });

      console.log('biometricApp', biometricApp);

      const comparePassword = await bcrypt.compare(password, findUser.password);

      if (comparePassword) {
        const token = await createToken({
          id: findUser.id,
          email: findUser.email,
        });
        const tokenResponse = {
          token_type: 'Bearer',
          token,
        };

        await userService.updateUser(findUser.id, {
          last_login: moment(new Date()).format(),
          remember_token: token,
        });

        http.setSuccess(200, 'Login successful', {
          access_token: tokenResponse,
          biometricApp,
        });
      } else {
        http.setError(400, 'Wrong username or password.');
      }

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to authenticate you', {
        error: error.message,
      });

      return http.send(res);
    }
  }

  /**
   * GET AUTHENTICATED BIOMETRIC USER DETAILS
   *
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async getAuthUserProfile(req, res) {
    try {
      const { id } = req.user;
      const user = await userService.findOneUser({
        where: { id },
        include: [
          {
            association: 'userDetails',
            include: [
              {
                association: 'salutation',
                attributes: ['id', 'metadata_value'],
              },
            ],
          },
          { association: models.User.roles, include: ['apps'] },
          'roleGroups',
        ],
        attributes: { exclude: ['remember_token'] },
      });

      http.setSuccess(200, 'Profile fetched successfully', { user });
      if (isEmpty(user)) http.setError(404, 'User Data Not Found.');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to get this User.', {
        error: { error: error.message },
      });

      return http.send(res);
    }
  }
}

module.exports = BiometricAuthController;
