const { sendSms } = require('./sms');

const sendPasswordResetTokenSms = async (
  username,
  surname,
  other_names,
  phone,
  randomPassword,
  requestOrigin
) => {
  try {
    const smsText = `Hello username: ${username}, your UNITEERP ${requestOrigin} password reset request has been recieved. 
    Your password reset token is: ${randomPassword} and expires in 10 minutes.`;

    return await sendSms(smsText, `+${phone}`).catch((err) => {
      throw new Error(err.message);
    });
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = { sendPasswordResetTokenSms };
