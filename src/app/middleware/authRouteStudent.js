/* eslint-disable no-console */
const { isObject, isEmpty } = require('lodash');
const { decodeToken } = require('@helpers/jwt-token');
const { HttpResponse } = require('@helpers');
const UserAgent = require('user-agents');
const { studentService } = require('@services/index');

const http = new HttpResponse();
const userAgent = new UserAgent();

/**
 * ENSURE the user token is provided and valid;
 *
 * @param {*} req Request Header that contains the token.
 * @param {*} res Handle http Response.
 * @param {*} next continue to the next middleware if token is valid.
 *
 * @return {*} Return Json of function next response.
 */
const studentLoginRequired = async (req, res, next) => {
  // GET authorization from request Headers
  const {
    headers: { authorization },
  } = req;

  console.log('======================================================');
  console.log('ORIGIN', req.originalUrl);
  console.log('REQUEST PARAMETERS', req.body);
  console.log('PARAMS PARAMETERS', req.params);
  console.log('QUERY PARAMETERS', req.query);
  console.log('USER AGENT', userAgent.data);
  console.log('HEADERS', req.headers);
  console.log('======================================================');

  if (authorization) {
    try {
      // SPLIT Headers and check if Token is Bearer type
      const authToken = authorization.split(' ');

      if (authToken[0] !== 'Bearer') {
        http.setError(403, 'Invalid access token type provided.');

        return http.send(res);
      }

      // DECODE the token to check it returns user Object or an Error message
      const decodedToken = await decodeToken(authToken[1]);

      if (
        !isObject(decodedToken) ||
        !decodedToken.id ||
        !decodedToken.student_number ||
        !decodedToken.registration_number
      ) {
        http.setError(401, 'Invalid token provided', {
          error: { message: decodedToken },
        });

        return http.send(res);
      }

      // IDENTIFY the token user and set the request user to the new user Object
      const tokenUser =
        await studentService.findStudentByRegistrationOrStudentNumber(
          {
            student:
              decodedToken.student_number || decodedToken.registration_number,
          },
          req
        );

      if (isEmpty(tokenUser) || tokenUser.remember_token !== authToken[1]) {
        http.setError(401, 'Invalid token provided.', {
          error: { message: 'Token user does not exist' },
        });

        return http.send(res);
      }

      req.user = tokenUser;

      // PROCEED to the next middleware
      return next();
    } catch (error) {
      http.setError(400, 'Unable to process your request', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  // Return Unauthorized access message if no authorization in the request header
  http.setError(401, 'Unauthorized access.');

  return http.send(res);
};

module.exports = studentLoginRequired;
