const models = require('@models');
// const { Op } = require('sequelize');
// const moment = require('moment');
const { QueryTypes } = require('sequelize');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for this entity
class RegistrationService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all records or filtered using options param
   */
  static async findAllRecords(options) {
    try {
      const records = await models.Registration.findAll({
        ...options,
      });

      return records;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `registration.service.js`,
        `findAllRecords`,
        `GET`
      );
    }
  }

  // static async findCurrentSemester(options) {
  //   try {
  //     const records = await models.Semester.findOne({
  //       ...options,
  //       where: {
  //         start_date: {
  //           [Op.lte]: moment.now(),
  //         },
  //         end_date: {
  //           [Op.gte]: moment.now(),
  //         },
  //       },
  //     });

  //     return records;
  //   } catch (error) {
  //     throw new Error(error.message);
  //   }
  // }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single record object basing on the options
   */
  static async findOneRecord(options) {
    try {
      const record = await models.Registration.findOne({
        ...options,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `registration.service.js`,
        `findOneRecord`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single record object from data object
   *@
   */
  static async createRegistrationRecord(data, transaction) {
    try {
      const record = await models.Registration.findOrCreate({
        where: {
          event_id: data.event_id,
          student_id: data.student_id,
          is_active: true,
        },
        defaults: {
          ...data,
        },
        include: [
          {
            association: models.Registration.courseUnits,
          },
        ],
        transaction,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `registration.service.js`,
        `createRegistrationRecord`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of record object to be updated
   * @returns {Promise}
   * @description updates a single record object
   *@
   */
  static async updateRecord(id, data, transaction) {
    try {
      const record = await models.Registration.update(
        { ...data },
        { where: { id }, transaction, returning: true }
      );

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `registration.service.js`,
        `updateRecord`,
        `PUT`
      );
    }
  }

  /**
   * @param {string} id  id of record object to be deleted
   * @returns {Promise}
   * @description deletes a single record object
   *@
   */
  static async deleteRecord(id) {
    try {
      const deleted = await models.Registration.destroy({
        where: { id },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `registration.service.js`,
        `deleteRecord`,
        `DELETE`
      );
    }
  }

  /**
   *
   *
   * registration history
   */
  static async registrationHistoryCourseUnitsByStudent(studentProgrammeId) {
    try {
      const studentProgramme = await models.sequelize.query(
        `select * from  students_mgt.student_versions_functions(${studentProgrammeId})`,
        { type: QueryTypes.SELECT, plain: true }
      );

      const studentProgrammeVersion = studentProgramme.programme_version[0];

      const filtered = models.sequelize.query(
        `select * from  enrollment_and_registration_mgt.student_registration_history_function(${studentProgrammeId},${studentProgrammeVersion.programme_version_id})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `registration.service.js`,
        `registrationHistoryCourseUnitsByStudent`,
        `GET`
      );
    }
  }

  // current registration
  static async currentStudentRegistration(data) {
    try {
      const filtered = models.sequelize.query(
        `select * from  enrollment_and_registration_mgt.current_std_registration(${data.studentProgrammeId},
          ${data.event_id},${data.programme_version_id})`,
        {
          type: QueryTypes.SELECT,
          plain: true,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `registration.service.js`,
        `currentStudentRegistration`,
        `GET`
      );
    }
  }

  static async groupCourseUnitsWithFunction(
    programmeVersion,
    courseUnitSemester
  ) {
    try {
      const results = await models.sequelize.query(
        `SELECT * FROM programme_mgt.course_unit_semester_function(${programmeVersion}, ${courseUnitSemester})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `registration.service.js`,
        `groupCourseUnitsWithFunction`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} options
   */
  static async findAllCourseUnitsOfRegistrationRecord(options) {
    try {
      const records = await models.RegistrationCourseUnit.findAll({
        ...options,
      });

      return records;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `registration.service.js`,
        `findAllCourseUnitsOfRegistrationRecord`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async bulkInsertCourseUnitsOfRegistrationRecord(data, transaction) {
    try {
      const result = await models.RegistrationCourseUnit.bulkCreate(data, {
        transaction,
        returning: true,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `registration.service.js`,
        `findAllCourseUnitsOfRegistrationRecord`,
        `PUT`
      );
    }
  }

  /**
   *
   * @param {*} data
   */
  static async bulkRemoveCourseUnitsOfRegistrationRecord(data, transaction) {
    try {
      const deleted = await models.RegistrationCourseUnit.destroy({
        where: { id: data },
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `registration.service.js`,
        `bulkRemoveCourseUnitsOfRegistrationRecord`,
        `DELETE`
      );
    }
  }

  /**
   *
   * @param {*} data
   */
  static async updateCourseUnitsOfRegistrationRecord(id, data, transaction) {
    try {
      const record = await models.RegistrationCourseUnit.update(
        { ...data },
        {
          where: { id },
          transaction,
          returning: true,
        }
      );

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `registration.service.js`,
        `updateCourseUnitsOfRegistrationRecord`,
        `PUT`
      );
    }
  }

  /**
   *
   * @param {*} options
   */
  static async findOneRegisteredCourseUnit(options) {
    try {
      const records = await models.RegistrationCourseUnit.findOne({
        ...options,
      });

      return records;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `registration.service.js`,
        `findOneRegisteredCourseUnit`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async createCourseUnitsRecords(data, transaction) {
    try {
      const record = await models.RegistrationCourseUnit.findOrCreate({
        where: {
          registration_id: data.registration_id,
          course_unit_id: data.course_unit_id,
          course_unit_status_id: data.course_unit_status_id,
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
        `registration.service.js`,
        `createCourseUnitsRecords`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} id
   */
  static async deleteCourseUnits(options, data) {
    try {
      const deleted = await models.RegistrationCourseUnit.update(
        { ...data },
        {
          ...options,
          returning: true,
        }
      );

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `registration.service.js`,
        `deleteCourseUnits`,
        `PUT`
      );
    }
  }
}

module.exports = RegistrationService;
