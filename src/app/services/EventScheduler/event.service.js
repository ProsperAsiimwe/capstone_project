const models = require('@models');
const { isEmpty } = require('lodash');
const { QueryTypes } = require('sequelize');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for a event
class EventService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all faculties or filtered using options param
   */
  static async findAllEvents(options) {
    try {
      const results = await models.Event.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `event.service.js`,
        `findAllEvents`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} options
   * @returns
   */
  static async findAllEventCampuses(options) {
    try {
      const results = await models.EventCampus.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `event.service.js`,
        `findAllEventCampuses`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async bulkInsertEventCampuses(data, transaction) {
    try {
      const result = await models.EventCampus.bulkCreate(data, {
        transaction,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `event.service.js`,
        `bulkInsertEventCampuses`,
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
  static async bulkRemoveEventCampuses(data, transaction) {
    try {
      const deleted = await models.EventCampus.destroy({
        where: { id: data },
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `event.service.js`,
        `bulkRemoveEventCampuses`,
        `DELETE`
      );
    }
  }

  /**
   *
   * @param {*} options
   * @returns
   */
  static async findAllEventIntakes(options) {
    try {
      const results = await models.EventIntake.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `event.service.js`,
        `findAllEventIntakes`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async bulkInsertEventIntakes(data, transaction) {
    try {
      const result = await models.EventIntake.bulkCreate(data, {
        transaction,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `event.service.js`,
        `bulkInsertEventIntakes`,
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
  static async bulkRemoveEventIntakes(data, transaction) {
    try {
      const deleted = await models.EventIntake.destroy({
        where: { id: data },
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `event.service.js`,
        `bulkRemoveEventIntakes`,
        `DELETE`
      );
    }
  }

  /**
   *
   * @param {*} options
   * @returns
   */
  static async findAllEventEntryAcademicYears(options) {
    try {
      const results = await models.EventEntryAcademicYear.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `event.service.js`,
        `findAllEventEntryAcademicYears`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async bulkInsertEventEntryAcademicYears(data, transaction) {
    try {
      const result = await models.EventEntryAcademicYear.bulkCreate(data, {
        transaction,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `event.service.js`,
        `bulkInsertEventEntryAcademicYears`,
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
  static async bulkRemoveEventEntryAcademicYears(data, transaction) {
    try {
      const deleted = await models.EventEntryAcademicYear.destroy({
        where: { id: data },
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `event.service.js`,
        `bulkRemoveEventEntryAcademicYears`,
        `DELETE`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single event object basing on the options
   */
  static async findOneEvent(options) {
    try {
      const event = await models.Event.findOne({ ...options });

      return event;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `event.service.js`,
        `findOneEvent`,
        `GET`
      );
    }
  }

  /**
   *All events
   * @param {*} campus
   * @param {*} intake
   * @param {*} entryAcademicYear
   * @param {*} event
   * @param {*} eventType
   */
  static async findAllEventsWithEventsFunction(
    campus,
    intake,
    entryAcademicYear,
    event,
    eventType
  ) {
    try {
      const results = await models.sequelize.query(
        `SELECT * FROM events_mgt.all_events_function(${campus}, ${intake}, ${entryAcademicYear}, ${event}, ${eventType}) ORDER BY end_date desc`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `event.service.js`,
        `findAllEventsWithEventsFunction`,
        `GET`
      );
    }
  }

  /**
   *One event
   * @param {*} campus
   * @param {*} intake
   * @param {*} entryAcademicYear
   * @param {*} event
   * @param {*} eventType
   */
  static async findOneEventWithEventsView(
    campus,
    intake,
    entryAcademicYear,
    event,
    eventType
  ) {
    try {
      const results = await models.sequelize.query(
        `SELECT * FROM events_mgt.events_function(${campus}, ${intake}, ${entryAcademicYear}, ${event}, ${eventType})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `event.service.js`,
        `findOneEventWithEventsView`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} campus
   * @param {*} intake
   * @param {*} entryAcademicYear
   * @param {*} event
   * @param {*} eventType
   */
  static async findSemesterBoundEventWithEventsFunction(
    campus,
    intake,
    entryAcademicYear,
    event,
    eventType
  ) {
    try {
      const results = await models.sequelize.query(
        `SELECT * FROM events_mgt.current_semester_events_function(${campus}, ${intake}, ${entryAcademicYear}, ${event}, ${eventType})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `event.service.js`,
        `findSemesterBoundEventWithEventsFunction`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single event object from data object
   *@
   */
  static async createEvent(data, transaction) {
    try {
      const newEvent = await models.Event.findOrCreate({
        where: {
          academic_year_id: data.academic_year_id,
          semester_id: data.semester_id ? data.semester_id : null,
          event_id: data.event_id,
          // event_type: data.event_type,
          // start_date: trim(data.start_date),
          // end_date: trim(data.end_date),
        },
        defaults: {
          ...data,
        },
        include: [
          {
            association: models.Event.eventIntakes,
          },
          {
            association: models.Event.eventCampuses,
          },
          {
            association: models.Event.eventEntryAcademicYears,
          },
        ],
        transaction,
      });

      if (newEvent[1] === false) {
        // throw new Error(`An Event Already Exists With The Same Context`);

        const eventId = newEvent[0].id;

        if (!isEmpty(data.eventIntakes)) {
          for (const item of data.eventIntakes) {
            await models.EventIntake.findOrCreate({
              where: {
                event_id: eventId,
                intake_id: item.intake_id,
              },
              defaults: {
                ...item,
              },
              transaction,
            });
          }
        }

        if (!isEmpty(data.eventCampuses)) {
          for (const item of data.eventCampuses) {
            await models.EventCampus.findOrCreate({
              where: {
                event_id: eventId,
                campus_id: item.campus_id,
              },
              defaults: {
                ...item,
              },
              transaction,
            });
          }
        }

        if (!isEmpty(data.eventEntryAcademicYears)) {
          for (const item of data.eventEntryAcademicYears) {
            await models.EventEntryAcademicYear.findOrCreate({
              where: {
                event_id: eventId,
                entry_academic_year_id: item.entry_academic_year_id,
              },
              defaults: {
                ...item,
              },
              transaction,
            });
          }
        }
      }

      return newEvent;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `event.service.js`,
        `createEvent`,
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
  static async addEventCampuses(data, transaction) {
    try {
      const result = await models.EventCampus.findOrCreate({
        where: {
          event_id: data.event_id,
          campus_id: data.campus_id,
        },
        defaults: {
          ...data,
        },
        transaction,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `event.service.js`,
        `addEventCampuses`,
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
  static async addEventIntakes(data, transaction) {
    try {
      const result = await models.EventIntake.findOrCreate({
        where: {
          event_id: data.event_id,
          intake_id: data.intake_id,
        },
        defaults: {
          ...data,
        },
        transaction,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `event.service.js`,
        `addEventIntakes`,
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
  static async addEventEntryAcademicYears(data, transaction) {
    try {
      const result = await models.EventEntryAcademicYear.findOrCreate({
        where: {
          event_id: data.event_id,
          entry_academic_year_id: data.entry_academic_year_id,
        },
        defaults: {
          ...data,
        },
        transaction,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `event.service.js`,
        `addEventEntryAcademicYears`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of event object to be updated
   * @returns {Promise}
   * @description updates a single event object
   *@
   */
  static async updateEvent(id, data) {
    try {
      const updated = await models.Event.update(
        { ...data },
        { where: { id }, returning: true }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `event.service.js`,
        `updateEvent`,
        `PUT`
      );
    }
  }

  /**
   * @param {string} id  id of event object to be deleted
   * @returns {Promise}
   * @description deletes a single event object
   *@
   */
  static async deleteEvent(id) {
    try {
      const deleted = await models.Event.destroy({
        where: { id },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `event.service.js`,
        `deleteEvent`,
        `DELETE`
      );
    }
  }

  /**
   *
   * @param {*} id
   * @returns
   */
  static async deleteEventCampus(options, transaction) {
    try {
      const deleted = await models.EventCampus.destroy({
        ...options,
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `event.service.js`,
        `deleteEventCampus`,
        `DELETE`
      );
    }
  }

  /**
   *
   * @param {*} id
   * @returns
   */
  static async deleteEventIntakes(options, transaction) {
    try {
      const deleted = await models.EventIntake.destroy({
        ...options,
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `event.service.js`,
        `deleteEventIntakes`,
        `DELETE`
      );
    }
  }

  /**
   *
   * @param {*} id
   * @returns
   */
  static async deleteEventEntryAcademicYears(options, transaction) {
    try {
      const deleted = await models.EventEntryAcademicYear.destroy({
        ...options,
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `event.service.js`,
        `deleteEventEntryAcademicYears`,
        `DELETE`
      );
    }
  }

  /**
   *  RETURNS EVENTS THAT ARE NOT TIME CONSTRAINED GIVEN A STUDENT'S DETAILS
   * @param {*} campus
   * @param {*} intake
   * @param {*} entryAcademicYear
   * @param {*} event
   * @param {*} eventType
   * @param {*} academicYear
   * @param {*} semester
   */
  static async findLateEnrollmentAndRegistrationEventsFunction(
    campus,
    intake,
    entryAcademicYear,
    event,
    eventType,
    academicYear,
    semester
  ) {
    try {
      const results = await models.sequelize.query(
        `SELECT * FROM events_mgt.events_semester_function(${campus}, ${intake}, ${entryAcademicYear}, ${event}, ${eventType}, ${academicYear}, ${semester})`,
        {
          type: QueryTypes.SELECT,
          plain: true,
        }
      );

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `event.service.js`,
        `findLateEnrollmentAndRegistrationEventsFunction`,
        `GET`
      );
    }
  }

  /** student academic year
   * RETURNS ACADEMIC YEAR WITH IT'S SEMESTERS BOTH CONSTRAINED BY TIME GIVEN A STUDENT'S DETAILS
   * @param {*} data
   * @returns
   */
  static async studentAcademicYear(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from events_mgt.student_academic_year(${data.campus_id},${data.intake_id},
        ${data.entry_academic_year_id})`,
        {
          type: QueryTypes.SELECT,
          plain: true,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `event.service.js`,
        `studentAcademicYear`,
        `GET`
      );
    }
  }

  /** current semester events
   *  RETURNS EVENTS THAT ARE TIME CONSTRAINED GIVEN A STUDENT'S DETAILS
   * @param {*} data
   * @returns
   */
  static async currentSemesterEvents(data) {
    try {
      const filtered = await models.sequelize.query(
        `SELECT * FROM events_mgt.current_semester_events(${data.campus_id}, ${data.intake_id},
         ${data.entry_academic_year_id},
         ${data.event}, ${data.event_type}, 
         ${data.academic_year_id}, ${data.semester_id})`,
        {
          type: QueryTypes.SELECT,
          plain: true,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `event.service.js`,
        `currentSemesterEvents`,
        `GET`
      );
    }
  }
}

module.exports = EventService;
