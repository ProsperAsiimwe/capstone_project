const bcrypt = require('bcrypt');
const { isEmpty } = require('lodash');
const moment = require('moment');
const { pujabApplicantService, OTPCodeService } = require('@services/index');
const { HttpResponse, createToken, sendMail, sendSms } = require('@helpers');
const models = require('@models');
const { appConfig } = require('../../../config');
const EventEmitter = require('events');
const { Op } = require('sequelize');
const {
  formatEmail,
  formatPhoneNumber,
} = require('@helpers/SMSandEMAILHelper');

EventEmitter.captureRejections = true;

const eventEmitter = new EventEmitter();
const http = new HttpResponse();

class ApplicantAuthController {
  /**
   * Login Applicant with Either phone or Email and Password
   *
   * @param {function} req Http Request Body
   * @param {function} res Http Response
   *
   * @return {JSON} Return Json Response
   */
  async login(req, res) {
    const { username } = req.body;
    const { password } = req.body;

    try {
      const userByEmailOrPhone = await pujabApplicantService.findByEmailOrPhone(
        username
      );

      if (isEmpty(userByEmailOrPhone)) {
        http.setError(400, 'Invalid username provided.');

        return http.send(res);
      }

      const comparePassword = await bcrypt.compare(
        password,
        userByEmailOrPhone.password
      );

      if (comparePassword) {
        const token = await createToken({
          id: userByEmailOrPhone.id,
          email: userByEmailOrPhone.email,
        });
        const tokenResponse = {
          token_type: 'Bearer',
          token,
        };

        await pujabApplicantService.updatePujabApplicant(
          userByEmailOrPhone.id,
          {
            last_login: moment(new Date()).format(),
            remember_token: token,
          }
        );

        http.setSuccess(200, 'Login successful', {
          access_token: tokenResponse,
        });
      } else {
        http.setError(400, 'Wrong username or password.');
      }

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to authenticate you', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Destroy Applicant token
   *
   * @param {Object} req Http Request Body
   * @param {Object} res Http Response
   *
   * @returns {JSON} Return Json Response
   */
  async logout(req, res) {
    const { id } = req.user;

    try {
      await pujabApplicantService.updatePujabApplicant(id, {
        remember_token: null,
      });
      http.setSuccess(200, 'You have been logged out');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to log you out.', { error: error.message });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async getAuthApplicantProfile(req, res) {
    try {
      const { id } = req.user;
      const pujabApplicant = await pujabApplicantService.findOnePujabApplicant({
        where: { id },
        attributes: { exclude: ['remember_token'] },
      });

      http.setSuccess(200, 'Profile fetched successfully', {
        applicant: pujabApplicant,
      });
      if (isEmpty(pujabApplicant))
        http.setError(404, 'Applicant Data Not Found.');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to get this Applicant.', {
        error: { error: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * CREATE New Applicant Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */

  async createPujabApplicant(req, res) {
    try {
      const data = req.body;
      const findApplicant = await pujabApplicantService.invalidPhoneAndEmail(
        data
      );

      if (findApplicant && findApplicant.email === data.email) {
        throw new Error(
          `An Applicant account already exists for email: ${findApplicant.email}`
        );
      }
      if (findApplicant && findApplicant.phone === data.phone) {
        throw new Error(
          `An Applicant account already exists for phone: ${findApplicant.phone}.`
        );
      }

      const randomPassword = Math.floor(
        100000 + Math.random() * 900000
      ).toString();

      const saltRounds = parseInt(appConfig.PASSWORD_SALT_ROUNDS, 10);
      const salt = await bcrypt.genSalt(saltRounds);

      data.password = await bcrypt.hashSync(randomPassword, salt);

      await models.sequelize.transaction(async (transaction) => {
        const result = await pujabApplicantService.createPujabApplicant(
          data,
          transaction
        );

        const pujabApplicant = result.dataValues;
        const emailSubject = `ONLINE APPLICATIONS`;
        const smsText = `Dear Applicant, Your Applicant Account has been created with Username: ${pujabApplicant.email} or Phone: ${pujabApplicant.phone} and Password: ${randomPassword}`;

        eventEmitter.on('pujabApplicantEmailEvent', async () => {
          await sendMail(
            pujabApplicant.email,
            emailSubject,
            {
              app: 'PUJAB APPLICATION PORTAL',
              token: randomPassword,
              pujabApplicant,
              url: appConfig.APPLICATION_PORTAL_URL,
              validFor: `${appConfig.PASSWORD_EXPIRES_IN} Mins`,
            },
            'welcomeApplicant'
          ).catch((err) => {
            throw new Error(err.message);
          });
        });
        eventEmitter.on('pujabApplicantSMSEvent', async () => {
          await sendSms(pujabApplicant.phone, smsText).catch((err) => {
            throw new Error(err.message);
          });
        });

        eventEmitter.emit('pujabApplicantEmailEvent');
        eventEmitter.emit('pujabApplicantSMSEvent');

        return result;
      });

      http.setSuccess(
        200,
        `Your Account has been created successfully, Please check your Email address ${formatEmail(
          data.email
        )} and Phone ${formatPhoneNumber(data.phone)} for login OTP`
      );

      eventEmitter.removeAllListeners();

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable to create your Account, Please try again later',
        {
          error: error.message,
        }
      );

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async updatePujabApplicant(req, res) {
    try {
      const { id } = req.user;

      const pujabApplicant = await models.sequelize.transaction(
        async (transaction) => {
          const updatePujabApplicant =
            await pujabApplicantService.updatePujabApplicant(
              id,
              req.body,
              transaction
            );
          const pujabApplicant = updatePujabApplicant[1][0];

          return pujabApplicant;
        }
      );

      http.setSuccess(200, 'pujabApplicant updated successfully', {
        pujabApplicant,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Update This Applicant.', {
        error: {
          message: error.message,
        },
      });

      return http.send(res);
    }
  }

  /**
   * update pujabApplicant password
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async changeApplicantPassword(req, res) {
    try {
      const authUser = req.user;
      const {
        new_password: newPassword,
        old_password: oldPassword,
        confirm_password: confirmNewPassword,
      } = req.body;
      const saltRounds = parseInt(appConfig.PASSWORD_SALT_ROUNDS, 10);
      const salt = await bcrypt.genSalt(saltRounds);
      const hashedPassword = await bcrypt.hashSync(newPassword, salt);

      if (newPassword !== confirmNewPassword) {
        http.setError(
          400,
          'Your confirm password does not Match the new password'
        );

        return http.send(res);
      } else if (newPassword === oldPassword) {
        http.setError(
          400,
          'Your New password cannot be the same as the Old Password'
        );

        return http.send(res);
      }

      const comparePassword = await bcrypt.compare(
        oldPassword,
        authUser.password
      );

      if (comparePassword) {
        await pujabApplicantService.changePassword(authUser.id, {
          password: hashedPassword,
          is_default_password: false,
          last_password_changed_at: moment.now(),
        });
        http.setSuccess(200, 'Your password has been changed successfully');
      } else {
        throw new Error('Your old password does not match.');
      }

      return http.send(res);
    } catch (error) {
      http.setError(400, error.message);

      return http.send(res);
    }
  }

  /**
   * update pujabApplicant password
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async changeApplicantDefaultPassword(req, res) {
    try {
      const authUser = req.user;
      const {
        new_password: newPassword,
        confirm_password: confirmNewPassword,
      } = req.body;
      const saltRounds = parseInt(appConfig.PASSWORD_SALT_ROUNDS, 10);
      const salt = await bcrypt.genSalt(saltRounds);
      const hashedPassword = await bcrypt.hashSync(newPassword, salt);

      if (newPassword !== confirmNewPassword) {
        http.setError(
          400,
          'Your confirm password does not Match the new password'
        );

        return http.send(res);
      } else if (authUser.is_default_password === false) {
        http.setError(
          400,
          "Your Default password has been changed, If you didn't Change it yourself please reset your account Now!"
        );

        return http.send(res);
      }

      const comparePassword = await bcrypt.compare(
        newPassword,
        authUser.password
      );

      if (comparePassword) {
        throw new Error('Your New password cannot be the same as the OTP');
      } else {
        await pujabApplicantService.changePassword(authUser.id, {
          password: hashedPassword,
          is_default_password: false,
          last_password_changed_at: moment.now(),
        });
        http.setSuccess(200, 'Your password has been changed successfully');
      }

      return http.send(res);
    } catch (error) {
      http.setError(400, error.message);

      return http.send(res);
    }
  }

  // request OTP

  async requestOneTimePasswordToken(req, res) {
    try {
      const { username, account_type: requestType } = req.body;
      const expiresAt = moment()
        .add(appConfig.PASSWORD_EXPIRES_IN, 'minutes')
        .utc(true);
      const requestOrigin = 'PUJAB-APPLICATION-PORTAL';
      const purpose = 'FORGOT-PASSWORD';
      const pujabApplicantData = await pujabApplicantService.findByEmailOrPhone(
        username
      );

      if (isEmpty(pujabApplicantData)) {
        throw new Error(`Invalid ${requestType} provided.`);
      }

      let successMessage =
        'Password reset token has been sent to your username.';

      const findValidOTP = await OTPCodeService.getOTPCode({
        where: {
          username: username,
          is_used: false,
          request_origin: requestOrigin,
          purpose,
          expires_at: {
            [Op.gte]: moment.now(),
          },
        },
        raw: true,
      });

      let randomPassword = Math.floor(
        100000 + Math.random() * 900000
      ).toString();

      if (!findValidOTP) {
        await models.sequelize.transaction(async (transaction) => {
          // Save generated OTP to password reset codes table;
          await OTPCodeService.createOTPCode(
            {
              username,
              otp_code: randomPassword,
              request_origin: requestOrigin,
              purpose,
              expires_at: expiresAt,
              is_used: false,
            },
            transaction
          );
        });
      } else {
        randomPassword = findValidOTP.otp_code;
      }

      if (requestType === 'email') {
        const emailSubject = `PUJAB APPLICATION PASSWORD RESET.`;

        eventEmitter.on('PUJABOTPEmailEvent', async () => {
          await sendMail(pujabApplicantData.email, emailSubject, {
            app: 'PUJAB APPLICATION PORTAL',
            token: randomPassword,
            email: pujabApplicantData.email,
            name: pujabApplicantData.surname,
            url: appConfig.APPLICATION_PORTAL_URL,
            validFor: `${appConfig.PASSWORD_EXPIRES_IN} Mins`,
          }).catch((err) => {
            throw new Error(err.message);
          });
        });
        eventEmitter.emit('PUJABOTPEmailEvent');
        successMessage = `An OTP Has been sent to ${formatEmail(
          pujabApplicantData.email
        )}. Please Check your email`;
      } else if (requestType === 'phone') {
        const smsText = `Dear ${pujabApplicantData.surname} ${pujabApplicantData.other_names}, 
          Your Password Reset Token Is: ${randomPassword}`;

        eventEmitter.on('OTPSMSEvent', async () => {
          await sendSms(pujabApplicantData.phone, smsText).catch((err) => {
            throw new Error(err.message);
          });
        });

        eventEmitter.emit('OTPSMSEvent');
        successMessage = `OTP Has been sent to your ${formatPhoneNumber(
          pujabApplicantData.phone
        )}. Please Check your SMS`;
      }

      http.setSuccess(200, successMessage);

      eventEmitter.removeAllListeners();

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Error while submitting password reset request.', {
        error: error.message,
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   */
  async getActiveApplicantPaymentReferences(req, res) {
    try {
      const pujabApplicant = req.user.id;

      const result =
        await pujabApplicantService.findAllRunningAdmissionApplicants({
          where: {
            pujabApplicant_id: pujabApplicant,
            is_used: false,
            expiry_date: {
              [Op.gte]: moment.now(),
            },
          },
          order: [['created_at', 'DESC']],
        });

      http.setSuccess(200, 'Payment References Fetched Successfully', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Payment Reference', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async resetApplicantPassword(req, res) {
    try {
      const {
        username,
        new_password: newPassword,
        confirm_password: confirmNewPassword,
        otp: passwordToken,
      } = req.body;

      if (newPassword !== confirmNewPassword) {
        throw new Error('Passwords Do not Match.');
      }
      const pujabApplicantData = await pujabApplicantService.findByEmailOrPhone(
        username
      );

      if (isEmpty(pujabApplicantData)) {
        http.setError(400, 'Invalid username provided.');

        return http.send(res);
      }

      const requestOrigin = 'PUJAB-APPLICATION-PORTAL';
      const purpose = 'FORGOT-PASSWORD';
      const findRequest = await OTPCodeService.getOTPCode({
        where: {
          username: username,
          otp_code: passwordToken,
          is_used: false,
          request_origin: requestOrigin,
          purpose,
          expires_at: {
            [Op.gte]: moment.now(),
          },
        },
        raw: true,
      });

      if (!findRequest) {
        throw new Error('Invalid OTP Provided!');
      }

      const saltRounds = parseInt(appConfig.PASSWORD_SALT_ROUNDS, 10);
      const salt = await bcrypt.genSalt(saltRounds);

      const hashedPassword = await bcrypt.hashSync(newPassword, salt);

      await pujabApplicantService.changePassword(pujabApplicantData.id, {
        password: hashedPassword,
        is_default_password: false,
        password_changed_at: moment.now(),
      });

      await OTPCodeService.updateOTPCode(username, {
        is_used: true,
        used_at: moment.now(),
      });

      http.setError(200, 'Your password has been changed successfully.');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Error while changing password.', {
        error: error.message,
      });

      return http.send(res);
    }
  }
}

module.exports = ApplicantAuthController;
