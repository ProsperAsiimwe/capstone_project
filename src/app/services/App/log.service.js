const models = require('@models');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for a static Parameter Value
class LogService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all Values or filtered using options param
   */
  static async findAllAdmissionLogs(options) {
    try {
      const results = await models.AdmissionLog.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `log.service.js`,
        `findAllAdmissionLogs`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} options
   * @returns
   */
  static async findAllResultLogs(options) {
    try {
      const results = await models.ResultLog.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `log.service.js`,
        `findAllResultLogs`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} options
   * @returns
   */
  static async findAllStudentRecordLogs(options) {
    try {
      const results = await models.StudentRecordsLog.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `log.service.js`,
        `findAllStudentRecordLogs`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} options
   * @returns
   */
  static async findAllUniversalPaymentLogs(options) {
    try {
      const results = await models.UniversalPaymentLog.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `log.service.js`,
        `findAllUniversalPaymentLogs`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} options
   * @returns
   */
  static async findAllEnrollmentAndRegistrationLogs(options) {
    try {
      const results = await models.EnrollmentAndRegistrationLog.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `log.service.js`,
        `findAllEnrollmentAndRegistrationLogs`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} options
   * @returns
   */
  static async findAllInstitutionPolicyLogs(options) {
    try {
      const results = await models.InstitutionPolicyLog.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `log.service.js`,
        `findAllInstitutionPolicyLogs`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} options
   * @returns
   */
  static async findAllProgrammeMgtLogs(options) {
    try {
      const results = await models.ProgrammeMgtLog.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `log.service.js`,
        `findAllProgrammeMgtLogs`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} options
   * @returns
   */
  static async findAllFeesMgtLogs(options) {
    try {
      const results = await models.FeesMgtLog.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `log.service.js`,
        `findAllFeesMgtLogs`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} options
   * @returns
   */
  static async findAllUserAccessLogs(options) {
    try {
      const results = await models.UserAccessLog.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `log.service.js`,
        `findAllUserAccessLogs`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a Value object basing on the options
   */
  static async findOneAdmissionLog(options) {
    try {
      const log = await models.AdmissionLog.findOne({
        ...options,
      });

      return log;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `log.service.js`,
        `findOneAdmissionLog`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} options
   * @returns
   */
  static async findOneResultLog(options) {
    try {
      const log = await models.ResultLog.findOne({
        ...options,
      });

      return log;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `log.service.js`,
        `findOneResultLog`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} options
   * @returns
   */
  static async findOneStudentRecordLog(options) {
    try {
      const log = await models.StudentRecordsLog.findOne({
        ...options,
      });

      return log;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `log.service.js`,
        `findOneStudentRecordLog`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} options
   * @returns
   */
  static async findOneUniversalPaymentLog(options) {
    try {
      const log = await models.UniversalPaymentLog.findOne({
        ...options,
      });

      return log;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `log.service.js`,
        `findOneUniversalPaymentLog`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} options
   * @returns
   */
  static async findOneEnrollmentAndRegistrationLog(options) {
    try {
      const log = await models.EnrollmentAndRegistrationLog.findOne({
        ...options,
      });

      return log;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `log.service.js`,
        `findOneEnrollmentAndRegistrationLog`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} options
   * @returns
   */
  static async findOneInstitutionPolicyLog(options) {
    try {
      const log = await models.InstitutionPolicyLog.findOne({
        ...options,
      });

      return log;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `log.service.js`,
        `findOneInstitutionPolicyLog`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} options
   * @returns
   */
  static async findOneProgrammeMgtLog(options) {
    try {
      const log = await models.ProgrammeMgtLog.findOne({
        ...options,
      });

      return log;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `log.service.js`,
        `findOneProgrammeMgtLog`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} options
   * @returns
   */
  static async findOneFeesMgtLog(options) {
    try {
      const log = await models.FeesMgtLog.findOne({
        ...options,
      });

      return log;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `log.service.js`,
        `findOneFeesMgtLog`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} options
   * @returns
   */
  static async findOneUserAccessLog(options) {
    try {
      const log = await models.UserAccessLog.findOne({
        ...options,
      });

      return log;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `log.service.js`,
        `findOneUserAccessLog`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single log object from data object
   *@
   */
  static async createAdmissionLog(data, transaction) {
    try {
      const newLog = await models.AdmissionLog.create(data, {
        transaction,
      });

      return newLog;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `log.service.js`,
        `createAdmissionLog`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   * @returns
   */
  static async createResultLog(data, transaction) {
    try {
      const newLog = await models.ResultLog.create(data, {
        transaction,
      });

      return newLog;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `log.service.js`,
        `createResultLog`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   * @returns
   */
  static async createStudentRecordsLog(data, transaction) {
    try {
      const newLog = await models.StudentRecordsLog.create(data, {
        transaction,
      });

      return newLog;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `log.service.js`,
        `createStudentRecordsLog`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   * @returns
   */
  static async createUniversalPaymentLog(data, transaction) {
    try {
      const newLog = await models.UniversalPaymentLog.create(data, {
        transaction,
      });

      return newLog;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `log.service.js`,
        `createUniversalPaymentLog`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   * @returns
   */
  static async createEnrollmentAndRegistrationLog(data, transaction) {
    try {
      const newLog = await models.EnrollmentAndRegistrationLog.create(data, {
        transaction,
      });

      return newLog;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `log.service.js`,
        `createEnrollmentAndRegistrationLog`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   * @returns
   */
  static async createInstitutionPolicyLog(data, transaction) {
    try {
      const newLog = await models.InstitutionPolicyLog.create(data, {
        transaction,
      });

      return newLog;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `log.service.js`,
        `createInstitutionPolicyLog`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   * @returns
   */
  static async createProgrammeMgtLog(data, transaction) {
    try {
      const newLog = await models.ProgrammeMgtLog.create(data, {
        transaction,
      });

      return newLog;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `log.service.js`,
        `createProgrammeMgtLog`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   * @returns
   */
  static async createFeesMgtLog(data, transaction) {
    try {
      const newLog = await models.FeesMgtLog.create(data, {
        transaction,
      });

      return newLog;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `log.service.js`,
        `createFeesMgtLog`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   * @returns
   */
  static async createUserAccessLog(data, transaction) {
    try {
      const newLog = await models.UserAccessLog.create(data, {
        transaction,
      });

      return newLog;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `log.service.js`,
        `createUserAccessLog`,
        `POST`
      );
    }
  }
}

module.exports = LogService;
