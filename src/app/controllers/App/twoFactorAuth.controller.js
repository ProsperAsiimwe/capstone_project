const { HttpResponse } = require('@helpers');
const { sendMail, sendSms } = require('@helpers/index');
const { twoFactorAuthService } = require('@services/index');
const model = require('@models');
const UserAgent = require('user-agents');
const { appConfig } = require('../../../config');
const moment = require('moment');
const EventEmitter = require('events');
// const { Op } = require('sequelize');
const { replace, isEmpty } = require('lodash');
const envConfig = require('../../../config/app');
const http = new HttpResponse();

const userAgent = new UserAgent();

EventEmitter.captureRejections = true;

const twoFaEventEmitter = new EventEmitter();

class TwoFactorAuthenticationController {
  /**
   * GET All .
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async findAll2FA(req, res) {
    try {
      const result = await twoFactorAuthService.findAllTwoFactorAuth();

      http.setSuccess(
        200,
        'All Two Factor Authentications Retrieved Successfully.',
        {
          data: result,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Factor Authentications', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async createTwoFactorAuth(req, res) {
    try {
      const data = req.body;

      const { id, remember_token: rememberToken } = req.user;

      const date = moment.utc().format();
      const local = moment.utc(date).local().format();

      const expiresAt = moment(local)
        .add(appConfig.PASSWORD_EXPIRES_IN, 'minutes')
        .utc(true);

      // const rightNow = moment(local).utc(true);

      const random = Math.floor(Math.random() * moment().unix())
        .toString()
        .slice(0, 5);

      data.user_agent = userAgent.data;
      data.user_id = id;
      data.ip_address = req.ip;
      data.expires_at = expiresAt;
      data.remember_token = rememberToken;
      data.expiry_date = moment
        .utc(expiresAt)
        .format('MMMM Do YYYY, h:mm:ss a');
      data.otp = random;

      let generatedOTP = null;

      let expiry = null;

      const findValidOTP = await twoFactorAuthService.findOneTwoFactorAuth({
        where: {
          user_id: data.user_id,
          operation: data.operation,
          area_accessed: data.area_accessed,
          remember_token: rememberToken,
          // expiry_date: {
          //   [Op.gte]: moment.utc(rightNow).format('MMMM Do YYYY, h:mm:ss a'),
          // },
        },
        attributes: { exclude: ['user_agent'] },
        raw: true,
      });

      await model.sequelize.transaction(async (transaction) => {
        if (!findValidOTP) {
          const response = await twoFactorAuthService.createTwoFactorAuth(
            data,
            transaction
          );

          generatedOTP = response.dataValues.otp;
          expiry = response.dataValues.expiry_date;
        } else {
          generatedOTP = findValidOTP.otp;
          expiry = findValidOTP.expiry_date;
        }

        if (!isEmpty(generatedOTP)) {
          const emailSubject = replace(
            `${data.operation} 2FA TOKEN.`,
            '-',
            ' '
          );

          const smsText = `${data.operation} AUTHORIZATION OTP IS: ${generatedOTP}, EXPIRY: ${expiry}`;

          twoFaEventEmitter.on('2FAOTPEmailEvent', async () => {
            await sendMail(
              req.user.email,
              emailSubject,
              {
                app: `STAFF PORTAL (${data.area_accessed})`,
                token: generatedOTP,
                validFor: `${expiry}`,
                name: req.user.surname,
                email: envConfig.SMTP_FROM,
              },
              'twoFactorAuth'
            ).catch((err) => {
              throw new Error(err.message);
            });
          });

          twoFaEventEmitter.on('2FAOTPSMSEvent', async () => {
            await sendSms(req.user.phone, smsText).catch((err) => {
              throw new Error(err.message);
            });
          });

          twoFaEventEmitter.emit('2FAOTPEmailEvent');
          twoFaEventEmitter.emit('2FAOTPSMSEvent');
        }
      });

      http.setSuccess(200, 'OTP Generated Successfully.', {
        // data: { expiry_date: expiry, operation: data.operation },
      });

      twoFaEventEmitter.removeAllListeners();

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Generate OTP', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

module.exports = TwoFactorAuthenticationController;
