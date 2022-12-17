const { appConfig } = require('../../config');

const { TWILIO_PHONE, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = appConfig;
const client = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

const sendSmsWithTwilio = (body, to) => {
  const sms = client.messages.create({
    body,
    from: TWILIO_PHONE,
    to,
  });

  return sms;
};

module.exports = { sendSmsWithTwilio };
