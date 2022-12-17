const { HttpResponse } = require('@helpers');
const {
  eventService,
  semesterService,
  academicYearService,
} = require('@services/index');
const moment = require('moment');
const { isEmpty } = require('lodash');
const model = require('@models');

const http = new HttpResponse();

class EventController {
  /**
   * GET All events.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async index(req, res) {
    try {
      const events = await eventService.findAllEvents({
        ...getEventAttributes(),
      });

      http.setSuccess(200, 'Events Fetched Successfully', {
        events,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Events', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * CREATE New Event Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async createEvent(req, res) {
    try {
      const data = req.body;
      const { id } = req.user;

      data.created_by_id = parseInt(id, 10);

      const eventIntakes = [];
      const eventCampuses = [];
      const eventEntryAcademicYears = [];

      if (!isEmpty(data.campuses)) {
        data.campuses.forEach((campus) => {
          eventCampuses.push({
            campus_id: campus,
            created_by_id: id,
          });
        });
      }

      if (data.academic_year_id && data.semester_id) {
        const semester = await semesterService
          .findOneSemester({
            where: {
              id: data.semester_id,
              academic_year_id: data.academic_year_id,
            },
            attributes: ['id', 'start_date', 'end_date'],
            include: [
              {
                association: 'semesterCampuses',
                attributes: ['id', 'campus_id'],
              },
              {
                association: 'semesterIntakes',
                attributes: ['id', 'intake_id'],
              },
              {
                association: 'semEntryAcademicYrs',
                attributes: ['id', 'entry_academic_year_id'],
              },
            ],
            nest: true,
          })
          .then(function (res) {
            if (res) {
              const result = res.toJSON();

              return result;
            }
          });

        if (!semester) {
          throw new Error(
            'The semester does not match with the academic year provided.'
          );
        }

        if (!isEmpty(semester.semesterIntakes)) {
          semester.semesterIntakes.forEach((intake) => {
            eventIntakes.push({
              intake_id: intake.intake_id,
              created_by_id: id,
            });
          });
        }

        if (!isEmpty(semester.semEntryAcademicYrs)) {
          semester.semEntryAcademicYrs.forEach((eventEntryAcademicYear) => {
            eventEntryAcademicYears.push({
              entry_academic_year_id:
                eventEntryAcademicYear.entry_academic_year_id,
              created_by_id: id,
            });
          });
        }

        const semesterStartDate = new Date(semester.start_date);
        const semesterEndDate = new Date(semester.end_date);
        const eventStartDate = new Date(data.start_date);
        const eventEndDate = new Date(data.end_date);

        if (!(eventStartDate >= semesterStartDate)) {
          throw new Error(
            `Event start date must be greater or equal to the semester's start date ${semester.start_date}.`
          );
        }

        if (!(eventStartDate <= semesterEndDate)) {
          throw new Error(
            `Event start date must be less than or equal to the semester's end date ${semester.end_date}.`
          );
        }

        if (!(eventEndDate > semesterStartDate)) {
          throw new Error(
            `Event end date must be greater than the semester's start date ${semester.start_date}.`
          );
        }

        if (!(eventEndDate <= semesterEndDate)) {
          throw new Error(
            `Event end date must be less or equal to the semester's end date ${semester.end_date}.`
          );
        }

        if (!(eventStartDate <= eventEndDate)) {
          throw new Error(
            `Event start date cannot be greater than the end date.`
          );
        }
      } else if (data.academic_year_id) {
        const academicYear = await academicYearService
          .findOneAcademicYear({
            where: {
              id: data.academic_year_id,
            },
            attributes: ['id', 'start_date', 'end_date'],
            include: [
              {
                association: 'ayrCampuses',
                attributes: ['id', 'campus_id'],
              },
              {
                association: 'ayrIntakes',
                attributes: ['id', 'intake_id'],
              },
              {
                association: 'ayrEntryAcademicYrs',
                attributes: ['id', 'entry_academic_year_id'],
              },
            ],
            nest: true,
          })
          .then(function (res) {
            if (res) {
              const result = res.toJSON();

              return result;
            }
          });

        if (!academicYear) {
          throw new Error(
            'The academic year has no record of being defined yet.'
          );
        }

        if (!isEmpty(academicYear.ayrIntakes)) {
          academicYear.ayrIntakes.forEach((intake) => {
            eventIntakes.push({
              intake_id: intake.intake_id,
              created_by_id: id,
            });
          });
        }

        // if (!isEmpty(academicYear.ayrCampuses)) {
        //   academicYear.ayrCampuses.forEach((campus) => {
        //     eventCampuses.push({
        //       campus_id: campus.campus_id,
        //       created_by_id: id,
        //     });
        //   });
        // }

        if (!isEmpty(academicYear.ayrEntryAcademicYrs)) {
          academicYear.ayrEntryAcademicYrs.forEach((eventEntryAcademicYear) => {
            eventEntryAcademicYears.push({
              entry_academic_year_id:
                eventEntryAcademicYear.entry_academic_year_id,
              created_by_id: id,
            });
          });
        }

        const academicYearStartDate = new Date(academicYear.start_date);
        const academicYearEndDate = new Date(academicYear.end_date);
        const eventStartDate = new Date(data.start_date);
        const eventEndDate = new Date(data.end_date);

        if (!(eventStartDate >= academicYearStartDate)) {
          throw new Error(
            `Event start date must be greater or equal to the academic year's start date ${academicYear.start_date}.`
          );
        }

        if (!(eventStartDate <= academicYearEndDate)) {
          throw new Error(
            `Event start date must be less than or equal to the academic year's end date ${academicYear.end_date}.`
          );
        }

        if (!(eventEndDate > academicYearStartDate)) {
          throw new Error(
            `Event end date must be greater than the academic year's start date ${academicYear.start_date}.`
          );
        }

        if (!(eventEndDate <= academicYearEndDate)) {
          throw new Error(
            `Event end date must be less or equal to the academic year's end date ${academicYear.end_date}.`
          );
        }

        if (!(eventStartDate <= eventEndDate)) {
          throw new Error(
            `Event start date cannot be greater than the Event end date.`
          );
        }
      }

      data.eventIntakes = eventIntakes;
      data.eventCampuses = eventCampuses;
      data.eventEntryAcademicYears = eventEntryAcademicYears;

      const event = await model.sequelize.transaction(async (transaction) => {
        const result = await eventService.createEvent(data, transaction);

        if (result[1] === false) {
          throw new Error('An event already exists with a similar context.');
        }

        return result[0];
      });

      http.setSuccess(201, 'Event Created Successfully', {
        event,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Create This Event', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * UPDATE Specific Event Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async updateEvent(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      const user = parseInt(req.user.id, 10);

      data.updated_at = moment.now();
      data.last_updated_by_id = user;

      const campuses = [];
      const intakes = [];
      const entryAcademicYears = [];

      if (!isEmpty(data.campuses)) {
        data.campuses.forEach((campusId) => {
          campuses.push({
            event_id: id,
            campus_id: campusId,
            created_by_id: user,
          });
        });
      }

      if (!isEmpty(data.intakes)) {
        data.intakes.forEach((intakeId) => {
          intakes.push({
            event_id: id,
            intake_id: intakeId,
            created_by_id: user,
          });
        });
      }

      if (!isEmpty(data.entry_academic_years)) {
        data.entry_academic_years.forEach((academicYearId) => {
          entryAcademicYears.push({
            event_id: id,
            entry_academic_year_id: academicYearId,
            created_by_id: user,
          });
        });
      }

      const result = await model.sequelize.transaction(async (transaction) => {
        const updateEvent = await eventService.updateEvent(id, data);
        const event = updateEvent[1][0];

        await handleUpdatingPivots(
          id,
          campuses,
          intakes,
          entryAcademicYears,
          transaction
        );

        return event;
      });

      http.setSuccess(200, 'Event Updated Successfully', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Update This Event', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Get Specific Event Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async fetchEvent(req, res) {
    try {
      const { id } = req.params;
      const event = await eventService.findOneEvent({
        where: { id },
        ...getEventAttributes(),
      });

      http.setSuccess(200, 'Event fetch successful', { event });
      if (isEmpty(event)) http.setError(404, 'Event Data Not Found');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to get Academic year Events.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Get Events by selected Academic year.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async fetchEventsByAcademicYear(req, res) {
    try {
      const { id } = req.params;
      const events = await eventService.findAllEvents({
        where: { academic_year_id: id, semester_id: null },
        ...getEventAttributes(),
      });

      http.setSuccess(200, 'Academic Year Events fetch successful', { events });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to get this Event', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Get Events by selected semester context.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async fetchEventsBySemester(req, res) {
    try {
      const { id } = req.params;
      const events = await eventService.findAllEvents({
        where: { semester_id: id },
        ...getEventAttributes(),
      });

      http.setSuccess(200, 'Semester Events fetch successful', { events });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to get this Event', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Destroy Event Data
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async deleteEvent(req, res) {
    try {
      const { id } = req.params;

      await eventService.deleteEvent(id);
      http.setSuccess(200, 'Event Deleted Successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Delete This Event', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

/**
 *
 * @param {*} eventId
 * @param {*} campuses
 * @param {*} intakes
 * @param {*} entryAcademicYears
 * @param {*} transaction
 */
const handleUpdatingPivots = async function (
  eventId,
  campuses,
  intakes,
  entryAcademicYears,
  transaction
) {
  try {
    if (!isEmpty(campuses)) {
      await deleteOrCreateElements(
        campuses,
        'findAllEventCampuses',
        'bulkInsertEventCampuses',
        'bulkRemoveEventCampuses',
        'campus_id',
        eventId,
        transaction
      );
    }

    if (!isEmpty(intakes)) {
      await deleteOrCreateElements(
        intakes,
        'findAllEventIntakes',
        'bulkInsertEventIntakes',
        'bulkRemoveEventIntakes',
        'intake_id',
        eventId,
        transaction
      );
    }

    if (!isEmpty(entryAcademicYears)) {
      await deleteOrCreateElements(
        entryAcademicYears,
        'findAllEventEntryAcademicYears',
        'bulkInsertEventEntryAcademicYears',
        'bulkRemoveEventEntryAcademicYears',
        'entry_academic_year_id',
        eventId,
        transaction
      );
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} firstElements
 * @param {*} findAllService
 * @param {*} insertService
 * @param {*} deleteService
 * @param {*} firstField
 * @param {*} eventId
 * @param {*} transaction
 * @returns
 */
const deleteOrCreateElements = async (
  firstElements,
  findAllService,
  insertService,
  deleteService,
  firstField,
  eventId,
  transaction
) => {
  const elementsToDelete = [];
  const elementsToInsert = [];

  const secondElements = await eventService[findAllService]({
    where: {
      event_id: eventId,
    },
    attributes: ['id', 'event_id', firstField],
    raw: true,
  });

  firstElements.forEach((firstElement) => {
    const myElement = secondElements.find(
      (secondElement) =>
        parseInt(firstElement[firstField], 10) ===
          parseInt(secondElement[firstField], 10) &&
        parseInt(firstElement.event_id, 10) ===
          parseInt(secondElement.event_id, 10)
    );

    if (!myElement) elementsToInsert.push(firstElement);
  });

  secondElements.forEach((secondElement) => {
    const myElement = firstElements.find(
      (firstElement) =>
        parseInt(firstElement[firstField], 10) ===
          parseInt(secondElement[firstField], 10) &&
        parseInt(firstElement.event_id, 10) ===
          parseInt(secondElement.event_id, 10)
    );

    if (!myElement) elementsToDelete.push(secondElement.id);
  });

  if (!isEmpty(elementsToInsert)) {
    await eventService[insertService](elementsToInsert, transaction);
  }

  if (!isEmpty(elementsToDelete)) {
    await eventService[deleteService](elementsToDelete, transaction);
  }

  return { elementsToDelete, elementsToInsert };
};

const getEventAttributes = function () {
  return {
    include: [
      {
        association: 'event',
        attributes: ['id', 'metadata_value'],
      },
      {
        association: 'academicYear',
        attributes: ['id', 'start_date', 'end_date'],
        include: [
          {
            association: 'academicYear',
            attributes: ['metadata_value'],
          },
        ],
      },
      {
        association: 'semester',
        attributes: ['id', 'start_date', 'end_date'],
        include: [
          {
            association: 'semester',
            attributes: ['metadata_value'],
          },
        ],
      },
      {
        association: 'campuses',
        attributes: ['id', 'metadata_value'],
        through: {
          attributes: [],
        },
      },
      {
        association: 'intakes',
        attributes: ['id', 'metadata_value'],
        through: {
          attributes: [],
        },
      },
      {
        association: 'entryAcademicYears',
        attributes: ['id', 'metadata_value'],
        through: {
          attributes: [],
        },
      },
    ],
  };
};

module.exports = EventController;
