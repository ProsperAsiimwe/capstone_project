/* eslint-disable no-console */

const { HttpResponse } = require('@helpers');
const { userService } = require('@services/index');
const fs = require('fs');

const http = new HttpResponse();

const userPermissionsRequired = async (data, res) => {
  if (data) {
    try {
      const userPermissionsRequired = await userService.userPermissionsRequired(
        {
          user_id: data.user_id,
        }
      );

      console.log(userPermissionsRequired);

      const userData = JSON.stringify(userPermissionsRequired);

      fs.writeFileSync(
        '/Users/mac/Desktop/rkimera/terp/terp-backend/src/app/middleware/permission.json',
        userData
      );

      return userPermissionsRequired;
    } catch (error) {
      http.setError(400, 'Unable to process your request', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  http.setError(401, 'Unauthorized access.');

  return http.send(res);
};

module.exports = userPermissionsRequired;
