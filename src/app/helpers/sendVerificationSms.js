const { sendSms } = require('./sms');

const sendVerificationSms = async (applicant, smsText) => {
  try {
    const { phone } = applicant;

    return await sendSms(smsText, `+${phone}`).catch((err) => {
      throw new Error(err.message);
    });
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = { sendVerificationSms };
