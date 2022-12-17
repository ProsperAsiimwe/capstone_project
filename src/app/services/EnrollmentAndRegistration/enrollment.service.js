const models = require('@models');
// const { Op } = require('sequelize');
// const moment = require('moment');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');
const { QueryTypes } = require('sequelize');

// This Class is responsible for handling all database interactions for this entity
class EnrollmentService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all records or filtered using options param
   */
  static async findAllRecords(options) {
    try {
      const records = await models.Enrollment.findAll({
        ...options,
      });

      return records;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `enrollment.service.js`,
        `findAllRecords`,
        `GET`
      );
    }
  }

  /**
   * GET INTERNSHIP STUDENTS FOR MUK
   *
   * @param {*}
   */
  static async getMUKStudentsForInternshipBilling() {
    try {
      const filtered = await models.sequelize.query(
        `select * from  enrollment_and_registration_mgt.enrollments_2020_2021_and_2021_2022_for_internship_view`,
        {
          type: QueryTypes.SELECT,
          raw: true,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `enrollment.service.js`,
        `getMUKStudentsForInternshipBilling`,
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
      const record = await models.Enrollment.findOne({
        ...options,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `enrollment.service.js`,
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
  static async createEnrollmentRecord(data, transaction) {
    try {
      const record = await models.Enrollment.findOrCreate({
        where: {
          event_id: data.event_id,
          student_id: data.student_id,
          student_programme_id: data.student_programme_id,
          is_active: true,
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
        `enrollment.service.js`,
        `createEnrollmentRecord`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async createEnrollmentCourseUnitRecords(data, transaction) {
    try {
      const record = await models.EnrollmentCourseUnit.findOrCreate({
        where: {
          enrollment_id: data.enrollment_id,
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
        `enrollment.service.js`,
        `createEnrollmentCourseUnitRecords`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} id
   * @param {*} data
   * @param {*} transaction
   * @returns
   */
  static async updateEnrollmentCourseUnit(id, data, transaction) {
    try {
      const record = await models.EnrollmentCourseUnit.update(
        { ...data },
        { where: { id }, transaction, returning: true }
      );

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `enrollment.service.js`,
        `updateEnrollmentCourseUnit`,
        `PUT`
      );
    }
  }

  /**
   *
   * @param {*} id
   * @returns
   */
  static async deleteEnrollmentCourseUnit(id, transaction) {
    try {
      const deleted = await models.EnrollmentCourseUnit.destroy({
        where: { id },
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `enrollment.service.js`,
        `deleteEnrollmentCourseUnit`,
        `DELETE`
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
      const record = await models.Enrollment.update(
        { ...data },
        { where: { id }, transaction, returning: true }
      );

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `enrollment.service.js`,
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
      const deleted = await models.Enrollment.destroy({
        where: { id },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `enrollment.service.js`,
        `deleteRecord`,
        `DELETE`
      );
    }
  }
}

module.exports = EnrollmentService;
