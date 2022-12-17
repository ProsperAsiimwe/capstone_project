const models = require('@models');
const { QueryTypes } = require('sequelize');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for a runningAdmissionProgramme
class RunningAdmissionProgrammeService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all filtered using options param
   */
  static async findAllRunningAdmissionProgrammes(options) {
    try {
      const results = await models.RunningAdmissionProgramme.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `RunningAdmissionProgramme.service.js`,
        `findAllRunningAdmissionProgrammes`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single runningAdmissionProgramme object basing on the options
   */
  static async findOneRunningAdmissionProgramme(options) {
    try {
      const runningAdmissionProgramme =
        await models.RunningAdmissionProgramme.findOne({
          ...options,
        });

      return runningAdmissionProgramme;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `RunningAdmissionProgramme.service.js`,
        `findOneRunningAdmissionProgramme`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single runningAdmissionProgramme object from data object
   *@
   */
  // static async createRunningAdmissionProgramme(data) {
  //   try {
  //     const runningAdmissionProgramme =
  //       await models.RunningAdmissionProgramme.bulkCreate(data, {
  //         returning: true,
  //       });

  //     return runningAdmissionProgramme;
  //   } catch (error) {
  //     throw new Error(error.message);
  //   }
  // }

  static async createRunningAdmissionProgramme(data, transaction) {
    try {
      const record = await models.RunningAdmissionProgramme.findOrCreate({
        where: {
          running_admission_id: data.running_admission_id,
          programme_id: data.programme_id,
        },
        defaults: {
          ...data,
        },
        transaction,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `RunningAdmissionProgramme.service.js`,
        `createRunningAdmissionProgramme`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of runningAdmissionProgramme object to be updated
   * @returns {Promise}
   * @description updates a single runningAdmissionProgramme object
   *@
   */
  static async updateRunningAdmissionProgramme(id, data, transaction) {
    try {
      const updated = await models.RunningAdmissionProgramme.update(
        { ...data },
        { where: { id }, transaction, returning: true }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `RunningAdmissionProgramme.service.js`,
        `updateRunningAdmissionProgramme`,
        `PUT`
      );
    }
  }

  /**
   * @param {string} id  id of runningAdmissionProgramme object to be deleted permanently
   * @returns {Promise}
   * @description deletes a single runningAdmissionProgramme object permanently
   *@
   */
  static async hardDeleteRunningAdmissionProgramme(id) {
    try {
      const deleted = await models.RunningAdmissionProgramme.destroy({
        where: { id },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `RunningAdmissionProgramme.service.js`,
        `hardDeleteRunningAdmissionProgramme`,
        `DELETE`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of runningAdmissionProgramme object to be soft deleted
   * @returns {Promise}
   * @description
   *@
   */
  static async updateRunningAdmissionProgrammeWithoutTransaction(id, data) {
    try {
      const deleted = await models.RunningAdmissionProgramme.update(
        { ...data },
        { where: { id }, returning: false }
      );

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `RunningAdmissionProgramme.service.js`,
        `updateRunningAdmissionProgrammeWithoutTransaction`,
        `PUT`
      );
    }
  }

  // running admission programmes
  static async runningAdmissionProgrammes(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from admissions_mgt.running_admission_programme_function(${data.running_admission_id})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `RunningAdmissionProgramme.service.js`,
        `runningAdmissionProgrammes`,
        `GET`
      );
    }
  }
}

module.exports = RunningAdmissionProgrammeService;
