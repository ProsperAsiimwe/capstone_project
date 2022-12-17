const models = require('@models');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for this entity
class TimetableService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all records or filtered using options param
   */
  static async getTeachingTimetable(options) {
    try {
      const records = await models.TeachingTimetable.findAll({
        ...options,
      });

      return records;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `timetable.service.js`,
        `getTeachingTimetable`,
        `GET`
      );
    }
  }

  /** createTeachingTimetable
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async createTeachingTimetable(data, transaction) {
    try {
      const record = await models.TeachingTimetable.findOrCreate({
        where: {
          assignment_course_id: data.assignment_course_id,
          weekday_id: data.weekday_id,
          room_id: data.room_id,
          start_time: data.start_time,
          end_time: data.end_time,
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
        `timetable.service.js`,
        `createTeachingTimetable`,
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
  static async updateTeachingTimetable(id, data) {
    try {
      const record = await models.TeachingTimetable.update(
        { ...data },
        { where: { id }, returning: true }
      );

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `timetable.service.js`,
        `updateTeachingTimetable`,
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
  static async deleteTeachingTimetable(id) {
    try {
      const deleted = await models.TeachingTimetable.destroy({
        where: { id },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `timetable.service.js`,
        `deleteTeachingTimetable`,
        `DELETE`
      );
    }
  }
}

module.exports = TimetableService;
