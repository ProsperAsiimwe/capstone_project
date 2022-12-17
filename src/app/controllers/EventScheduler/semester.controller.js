const { HttpResponse } = require('@helpers');
const {
  semesterService,
  eventService,
  academicYearService,
} = require('@services/index');
const { isEmpty } = require('lodash');
const moment = require('moment');
const model = require('@models');

const http = new HttpResponse();

class SemesterController {
  /**
   * GET All Semesters.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async index(req, res) {
    try {
      const semesters = await semesterService.findAllSemesters();

      http.setSuccess(200, 'Semesters Fetched Successfully', {
        semesters,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Semesters', {
        error: error.message,
      });

      return http.send(res);
    }
  }

  /**
   * CREATE New Semester Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async createSemester(req, res) {
    try {
      const data = req.body;
      const user = req.user.id;

      data.created_by_id = user;

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

      const campuses = [];
      const intakes = [];
      const entryAcademicYears = [];

      if (!isEmpty(academicYear.ayrIntakes)) {
        academicYear.ayrIntakes.forEach((intake) => {
          intakes.push({
            intake_id: intake.intake_id,
            created_by_id: user,
          });
        });
      }

      if (!isEmpty(academicYear.ayrCampuses)) {
        academicYear.ayrCampuses.forEach((campus) => {
          campuses.push({
            campus_id: campus.campus_id,
            created_by_id: user,
          });
        });
      }

      if (!isEmpty(academicYear.ayrEntryAcademicYrs)) {
        academicYear.ayrEntryAcademicYrs.forEach((eventEntryAcademicYear) => {
          entryAcademicYears.push({
            entry_academic_year_id:
              eventEntryAcademicYear.entry_academic_year_id,
            created_by_id: user,
          });
        });
      }

      data.semesterCampuses = campuses;
      data.semesterIntakes = intakes;
      data.semEntryAcademicYrs = entryAcademicYears;

      const academicYearStartDate = new Date(academicYear.start_date);
      const academicYearEndDate = new Date(academicYear.end_date);
      const semesterStartDate = new Date(data.start_date);
      const semesterEndDate = new Date(data.end_date);

      if (!(semesterStartDate >= academicYearStartDate)) {
        throw new Error(
          `Semester start date must be greater or equal to the academic year's start date ${academicYear.start_date}.`
        );
      }

      if (!(semesterStartDate < academicYearEndDate)) {
        throw new Error(
          `Semester start date must be less than the academic year's end date ${academicYear.end_date}.`
        );
      }

      if (!(semesterEndDate > academicYearStartDate)) {
        throw new Error(
          `Semester end date must be greater than the academic year's start date ${academicYear.start_date}.`
        );
      }

      if (!(semesterEndDate <= academicYearEndDate)) {
        throw new Error(
          `Semester end date of must be less or equal to the academic year's end date ${academicYear.end_date}.`
        );
      }

      if (!(semesterStartDate < semesterEndDate)) {
        throw new Error(
          `Semester start date cannot be greater than or equal to semester end date.`
        );
      }

      const result = await model.sequelize.transaction(async (transaction) => {
        const semester = await semesterService.createSemester(
          data,
          transaction
        );

        return semester;
      });

      http.setSuccess(200, 'Semester created successfully', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to create this Semester.', {
        error: error.message,
      });

      return http.send(res);
    }
  }

  /**
   * UPDATE Specific Semester Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async updateSemester(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      const user = parseInt(req.user.id, 10);

      data.updated_at = moment.now();
      data.last_updated_by_id = user;

      const campuses = [];
      const intakes = [];
      const entryAcademicYears = [];

      if (!isEmpty(data.semester_campuses)) {
        data.semester_campuses.forEach((campusId) => {
          campuses.push({
            semester_id: id,
            campus_id: campusId,
            created_by_id: user,
          });
        });
      }

      if (!isEmpty(data.semester_intakes)) {
        data.semester_intakes.forEach((intakeId) => {
          intakes.push({
            semester_id: id,
            intake_id: intakeId,
            created_by_id: user,
          });
        });
      }

      if (!isEmpty(data.semester_entry_academic_years)) {
        data.semester_entry_academic_years.forEach((academicYearId) => {
          entryAcademicYears.push({
            semester_id: id,
            entry_academic_year_id: academicYearId,
            created_by_id: user,
          });
        });
      }

      const result = await model.sequelize.transaction(async (transaction) => {
        const updateSemester = await semesterService.updateSemester(id, data);
        const semester = updateSemester[1][0];

        await handleUpdatingPivots(
          id,
          campuses,
          intakes,
          entryAcademicYears,
          transaction
        );

        return semester;
      });

      http.setSuccess(200, 'Semester updated successfully', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to update this Semester.', {
        error: error.message,
      });

      return http.send(res);
    }
  }

  /**
   * Get Specific Semester Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async fetchSemester(req, res) {
    const { id } = req.params;
    const semester = await semesterService.findOneSemester({ where: { id } });

    http.setSuccess(200, 'Semester fetch successful', {
      semester,
    });
    if (isEmpty(semester)) http.setError(404, 'Semester Data Not Found.');

    return http.send(res);
  }

  /**
   * Destroy Semester Data
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async deleteSemester(req, res) {
    try {
      const { id } = req.params;

      await semesterService.deleteSemester(id);
      http.setSuccess(200, 'Semester deleted successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to delete this Semester.', {
        error: error.message,
      });

      return http.send(res);
    }
  }
}

/**
 *
 * @param {*} semesterId
 * @param {*} campuses
 * @param {*} intakes
 * @param {*} entryAcademicYears
 * @param {*} transaction
 */
const handleUpdatingPivots = async function (
  semesterId,
  campuses,
  intakes,
  entryAcademicYears,
  transaction
) {
  try {
    if (!isEmpty(campuses)) {
      await deleteOrCreateElements(
        campuses,
        'findAllSemesterCampuses',
        'bulkInsertSemesterCampuses',
        'bulkRemoveSemesterCampuses',
        'campus_id',
        semesterId,
        transaction,
        'findAllEvents',
        'findAllEventCampuses',
        'bulkRemoveEventCampuses'
      );
    }

    if (!isEmpty(intakes)) {
      await deleteOrCreateElements(
        intakes,
        'findAllSemesterIntakes',
        'bulkInsertSemesterIntakes',
        'bulkRemoveSemesterIntakes',
        'intake_id',
        semesterId,
        transaction,
        'findAllEvents',
        'findAllEventIntakes',
        'bulkRemoveEventIntakes'
      );
    }

    if (!isEmpty(entryAcademicYears)) {
      await deleteOrCreateElements(
        entryAcademicYears,
        'findAllSemesterEntryAcademicYears',
        'bulkInsertSemesterEntryAcademicYears',
        'bulkRemoveSemesterEntryAcademicYears',
        'entry_academic_year_id',
        semesterId,
        transaction,
        'findAllEvents',
        'findAllEventEntryAcademicYears',
        'bulkRemoveEventEntryAcademicYears'
      );
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

const deleteOrCreateElements = async (
  firstElements,
  findAllService,
  insertService,
  deleteService,
  firstField,
  semesterId,
  transaction,
  findAllEventService,
  findAllEventPivotService,
  deleteEventPivotService
) => {
  const elementsToDelete = [];
  const elementsToInsert = [];

  const secondElements = await semesterService[findAllService]({
    where: {
      semester_id: semesterId,
    },
    attributes: ['id', 'semester_id', firstField],
    raw: true,
  });

  firstElements.forEach((firstElement) => {
    const myElement = secondElements.find(
      (secondElement) =>
        parseInt(firstElement[firstField], 10) ===
          parseInt(secondElement[firstField], 10) &&
        parseInt(firstElement.semester_id, 10) ===
          parseInt(secondElement.semester_id, 10)
    );

    if (!myElement) elementsToInsert.push(firstElement);
  });

  for (const secondElement of secondElements) {
    const myElement = firstElements.find(
      (firstElement) =>
        parseInt(firstElement[firstField], 10) ===
          parseInt(secondElement[firstField], 10) &&
        parseInt(firstElement.semester_id, 10) ===
          parseInt(secondElement.semester_id, 10)
    );

    if (!myElement) {
      elementsToDelete.push(secondElement.id);

      const findAllEvents = await eventService[findAllEventService]({
        where: {
          semester_id: semesterId,
        },
        attributes: ['id', 'event_id', 'semester_id'],
        raw: true,
      });

      if (!isEmpty(findAllEvents)) {
        const eventPivotsToDestroy = [];

        for (const event of findAllEvents) {
          const findEventPivot = await eventService[findAllEventPivotService]({
            where: {
              event_id: event.id,
            },
            attributes: ['id', 'event_id', firstField],
            raw: true,
          });

          const filtered = findEventPivot.filter(
            (pivot) =>
              parseInt(pivot[firstField], 10) ===
              parseInt(secondElement[firstField], 10)
          );

          if (!isEmpty(filtered)) {
            filtered.forEach((pivot) => {
              eventPivotsToDestroy.push(pivot.id);
            });
          }
        }

        if (!isEmpty(eventPivotsToDestroy)) {
          await eventService[deleteEventPivotService](
            eventPivotsToDestroy,
            transaction
          );
        }
      }
    }
  }

  if (!isEmpty(elementsToInsert)) {
    await semesterService[insertService](elementsToInsert, transaction);
  }

  if (!isEmpty(elementsToDelete)) {
    await semesterService[deleteService](elementsToDelete, transaction);
  }

  return { elementsToDelete, elementsToInsert };
};

module.exports = SemesterController;
