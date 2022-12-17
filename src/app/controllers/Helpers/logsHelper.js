const { logService } = require('@services/index');
const { networkInterfaces } = require('os');

const activityLog = async (
  createLogService,
  user,
  operation,
  areaAccessed,
  currentData,
  previousData,
  recordId,
  recordType,
  ipAddress,
  userAgent,
  otp,
  transaction
) => {
  try {
    await logService[createLogService](
      {
        record_id: recordId,
        record_type: recordType,
        user_id: user,
        operation: operation,
        area_accessed: areaAccessed,
        current_data: currentData,
        previous_data: previousData,
        ip_address: ipAddress,
        detailed_user_agent: userAgent,
        otp: otp,
      },
      transaction
    );
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 */
const findLocalIpAddress = () => {
  try {
    const nets = networkInterfaces();
    const results = {};

    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
        // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
        // 'IPv4' is in Node <= 17, from 18 it's a number 4 or 6
        const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4;

        if (net.family === familyV4Value && !net.internal) {
          if (!results[name]) {
            results[name] = [];
          }
          // results[name].push(net.address);
          results.IPv4 = net.address;
        }
      }
    }

    return results.IPv4;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} payload
 * @param {*} transaction
 */
const createAdmissionLog = async (payload, transaction) => {
  try {
    await logService.createAdmissionLog(payload, transaction);
  } catch (error) {
    throw Error(error);
  }
};

/**
 *
 * @param {*} payload
 * @param {*} transaction
 */
const createResultLog = async (payload, transaction) => {
  await logService.createResultLog(payload, transaction);
};

/**
 *
 * @param {*} payload
 * @param {*} transaction
 */
const createStudentRecordsLog = async (payload, transaction) => {
  await logService.createStudentRecordsLog(payload, transaction);
};

/**
 *
 * @param {*} payload
 * @param {*} transaction
 */
const createUniversalPaymentLog = async (payload, transaction) => {
  await logService.createUniversalPaymentLog(payload, transaction);
};

/**
 *
 * @param {*} payload
 * @param {*} transaction
 */
const createEnrollmentAndRegistrationLog = async (payload, transaction) => {
  await logService.createEnrollmentAndRegistrationLog(payload, transaction);
};

/**
 *
 * @param {*} payload
 * @param {*} transaction
 */
const createInstitutionPolicyLog = async (payload, transaction) => {
  await logService.createInstitutionPolicyLog(payload, transaction);
};

/**
 *
 * @param {*} payload
 * @param {*} transaction
 */
const createProgrammeMgtLog = async (payload, transaction) => {
  await logService.createProgrammeMgtLog(payload, transaction);
};

/**
 *
 * @param {*} payload
 * @param {*} transaction
 */
const createFeesMgtLog = async (payload, transaction) => {
  await logService.createFeesMgtLog(payload, transaction);
};

/**
 *
 * @param {*} payload
 * @param {*} transaction
 */
const createUserAccessLog = async (payload, transaction) => {
  await logService.createUserAccessLog(payload, transaction);
};

module.exports = {
  activityLog,
  createAdmissionLog,
  createResultLog,
  createStudentRecordsLog,
  createUniversalPaymentLog,
  createEnrollmentAndRegistrationLog,
  createInstitutionPolicyLog,
  createProgrammeMgtLog,
  createFeesMgtLog,
  createUserAccessLog,
  findLocalIpAddress,
};
