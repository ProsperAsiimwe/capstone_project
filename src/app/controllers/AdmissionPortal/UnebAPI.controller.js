const { HttpResponse } = require('@helpers');
const axios = require('axios').default;
const { trim, toUpper } = require('lodash');
const envConfig = require('../../../config/app');
const http = new HttpResponse();

class UnebAPIController {
  async checkResult(req, res) {
    try {
      const { indexNumber, examYear } = req.body;
      const { user } = req;
      const requestPayload = {
        username: envConfig.UNEB_API_USERNAME,
        password: envConfig.UNEB_API_PASSWORD,
        IndexNumber: indexNumber,
        ExamYear: examYear,
      };
      const response = await axios
        .post(envConfig.UNEB_API_BASE_URL, requestPayload)
        .then((res) => res.data);

      if (response.status === 1) {
        const compareSurname = toUpper(trim(response.name)).includes(
          toUpper(trim(user.surname))
        );
        const compareOtherNames = toUpper(trim(response.name)).includes(
          toUpper(trim(user.other_names))
        );

        if (compareSurname !== true && compareOtherNames !== true) {
          const applicantFullName = `${user.surname} ${user.other_names}`;

          http.setError(
            400,
            `The name ${trim(
              response.name
            )} on this result does not match with your name ${toUpper(
              applicantFullName
            )}. Please contact support team for help!`
          );

          return http.send(res);
        }

        http.setSuccess(200, 'Student Results', { data: response });

        return http.send(res);
      } else {
        http.setError(400, response.message);

        return http.send(res);
      }
    } catch (error) {
      http.setError(400, 'Unable to Get Student Results', {
        message: error.message,
      });

      return http.send(res);
    }
  }
}

module.exports = UnebAPIController;
