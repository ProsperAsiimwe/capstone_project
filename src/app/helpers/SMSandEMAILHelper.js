const axios = require('axios');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const EmailTemplate = require('email-templates');
const envConfig = require('../../config/app');
const path = require('path');
const { cwd } = require('process');
const { institutionStructureService } = require('@services/index');
const app = require('../../config/app');
const accountSid = envConfig.TWILIO_ACCOUNT_SID;
const authToken = envConfig.TWILIO_AUTH_TOKEN;
const { TWILIO_PHONE, DEFAULT_SMS_GATEWAY } = envConfig;
const client = require('twilio')(accountSid, authToken);

/**
 * Send SMS TO PHONE NUMBER
 * @param {*} phoneNumber
 * @param {*} textMessage
 */
const sendSms = async function (phoneNumber, textMessage) {
  try {
    if (DEFAULT_SMS_GATEWAY === 'TWILIO') {
      await sendSmsWithTwilio(textMessage, phoneNumber);
    } else {
      const data = {
        api_id: envConfig.SPEEDA_API_ID,
        api_password: envConfig.SPEEDA_API_PASSWORD,
        sender_id: envConfig.SPEEDA_SENDER_ID,
        sms_type: envConfig.SPEEDA_SMS_TYPE,
        encoding: envConfig.SPEEDA_ENCODING,
        phonenumber: phoneNumber,
        textmessage: `${envConfig.SPEEDA_BRAND} \n${textMessage}`,
      };

      await axios({
        method: 'post',
        url: `${envConfig.SPEEDA_BASE_URL}/sendSms`,
        data: data,
      })
        .then((res) => {
          if (res.data.status !== 'S') {
            throw new Error(`Unable to send SMS because ${res.data.remarks}`);
          }
        })
        .catch((error) => {
          throw new Error(error.message);
        });
    }
  } catch (error) {
    throw new Error(`Something went wrong while sending SMS: ${error.message}`);
  }
};

/**
 *
 * @param {*} user
 * @param {*} mailText
 * @returns
 */
const sendMail = async (to, subject, local, mailTemplate = 'passwordReset') => {
  try {
    const mailTransport = nodemailer.createTransport({
      host: envConfig.SMTP_HOST,
      port: envConfig.SMTP_PORT,
      secure: false,
      auth: {
        user: envConfig.SMTP_USER_NAME,
        pass: envConfig.SMTP_PASSWORD,
      },
      tls: {
        // do not fail on invalid certs
        rejectUnauthorized: false,
      },
    });

    const structure =
      await institutionStructureService.findInstitutionStructureRecords({
        attributes: [
          'id',
          'institution_name',
          'institution_address',
          'institution_slogan',
          'institution_website',
          'institution_logo',
          'institution_email',
          'telephone_1',
          'telephone_2',
          'academic_units',
        ],
        raw: true,
      });

    if (!structure) {
      structure.institution_name = app.INSTITUTION_NAME;
    }

    const template = path.join(cwd(), `views/emails/${mailTemplate}`);
    const from = envConfig.SMTP_FROM;
    const emailTemplate = new EmailTemplate({
      transport: mailTransport,
      send: true,
      preview: false,
      views: {
        options: {
          extension: 'ejs',
        },
        root: template,
      },
      message: {
        from: envConfig.SMTP_FROM,
      },
    });

    const html = await emailTemplate.render(template, { ...local, structure });
    // .catch(console.error);

    await mailTransport.sendMail({ to, from, subject, html });
    // .then(console.log)
    // .catch(console.error);

    return true;
  } catch (error) {
    throw new Error(
      `Something went wrong while sending EMAIL: ${error.message}`
    );
  }
};

/**
 *
 * @param {*} payload
 * @returns
 */
const createEmailVerificationToken = (payload) => {
  const secret = envConfig.SECRET;
  const mailExpiry = envConfig.MAIL_EXPIRY;
  const token = jwt.sign(payload, secret, { expiresIn: mailExpiry });

  return token;
};

const sendSmsWithTwilio = (body, to) => {
  const sms = client.messages.create({
    body,
    from: TWILIO_PHONE,
    to: `+${to}`,
  });

  return sms;
};

const formatEmail = (email) => {
  const splittedEmail = email.split('@');
  const hiddenEmail = splittedEmail[0].substr(0, 3) + '...';

  return [hiddenEmail, splittedEmail[1]].join('@');
};

const formatPhoneNumber = (phoneNumber) => {
  const hiddenPhoneNumber =
    phoneNumber.substr(0, phoneNumber.length - 3) + '...';

  return hiddenPhoneNumber;
};

module.exports = {
  sendSms,
  sendMail,
  formatEmail,
  formatPhoneNumber,
  createEmailVerificationToken,
};
