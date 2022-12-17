const { isEmpty, isObject, now } = require('lodash');
const {
  HttpResponse,
  sendMail,
  createEmailVerificationToken,
  decodeToken,
} = require('@helpers');
const { userService } = require('@services/index');
const { appConfig } = require('../../../config');
const EventEmitter = require('events');

EventEmitter.captureRejections = true;

const eventEmitter = new EventEmitter();
const http = new HttpResponse();

class MailController {
  /**
   * Resend E-mail verification Link
   *
   * @param {*} req
   * @param {*} res
   */
  async requestVerificationEmail(req, res) {
    try {
      const { email } = req.body;
      const findUser = await userService
        .findOneUser({
          raw: true,
          where: { email: email },
          attributes: ['surname', 'other_names', 'email', 'email_verified'],
        })
        .catch((error) => {
          http.setError(400, error.message);

          return http.send(res);
        });

      if (isEmpty(findUser)) {
        http.setError(404, 'Unable to find user with this email address');

        return http.send(res);
      }
      if (findUser.email_verified) {
        http.setError(400, 'This email is already verified!');

        return http.send(res);
      }

      const token = createEmailVerificationToken(findUser);
      const verificationLink = `${appConfig.STAFF_PORTAL_URL}/email/verification/${token}`;
      const emailSubject = `STAFF PORTAL ACCOUNT VERIFICATION.`;

      eventEmitter.on('emailVerificationEvent', async () => {
        await sendMail(
          findUser.email,
          emailSubject,
          { user: findUser, verificationLink, url: appConfig.STAFF_PORTAL_URL },
          'accountVerification'
        ).catch((err) => {
          throw new Error(err.message);
        });
      });

      eventEmitter.emit('emailVerificationEvent');
      http.setSuccess(200, `A Verification Link has been sent to ${email}.`);

      eventEmitter.removeAllListeners();

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to send email', { error: error.message });

      return http.send(res);
    }
  }

  /**
   * VERIFY USER EMAIL
   *
   * @param {*} req
   * @param {*} res
   */
  async verifyEmail(req, res) {
    const { token } = req.params;

    try {
      const decodedToken = await decodeToken(token);

      if (!isObject(decodedToken)) {
        throw new Error('Invalid Token provided.');
      }
      const { email } = decodedToken;
      const findTokenUser = await userService.findByEmailOrPhone(email);

      if (isEmpty(findTokenUser))
        throw new Error('This user account does not exist.');
      if (findTokenUser.email_verified === true)
        throw new Error('This E-mail address is already verified');

      await userService
        .updateUser(findTokenUser.id, {
          email_verified: true,
          email_verified_at: now(),
        })
        .then((res) => res[1]);

      http.setSuccess(
        200,
        'Your Email address has been verified successfully.'
      );

      return http.send(res);
    } catch (error) {
      http.setError(400, error.message);

      return http.send(res);
    }
  }
}

module.exports = MailController;
