const {
  getUserRoleBoundValues,
} = require('@controllers/Helpers/userRoleHelper');
const { HttpResponse } = require('@helpers');

const http = new HttpResponse();

class UserRoleBoundController {
  /**
   * GET USER ROLE BOUND LEVELS
   *
   * @param {*} req any
   * @param {*} res any
   * @returns json
   */
  async userBoundValueFunctions(req, res) {
    try {
      if (!req.query.roleId) {
        throw new Error('Invalid Context Provided');
      }

      const { id } = req.user;
      const { roleId } = req.query;
      const context = { id, roleId };

      const data = await await getUserRoleBoundValues(context);

      http.setSuccess(200, 'User Role Bound Values fetched successfully ', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch User Role Bound Values ', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * GET USER ROLE BOUND LEVELS
   *
   * @param {*} req any
   * @param {*} res any
   * @returns json
   */
  async getUserRoleBoundValueLevels(req, res) {
    try {
      const { roleId, userId } = req.params;
      const context = {
        roleId,
        id: userId,
      };
      const data = await getUserRoleBoundValues(context);

      http.setSuccess(200, 'User Role Bound Values fetched successfully ', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch User Role Bound Values ', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

module.exports = UserRoleBoundController;
