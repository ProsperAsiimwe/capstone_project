const { HttpResponse } = require('@helpers');
const {
  academicYearService,
  semesterService,
  eventService,
} = require('@services/index');
const { isEmpty } = require('lodash');
const model = require('@models');
const moment = require('moment');

const http = new HttpResponse();

class AcademicYearController {
  /**
   * GET All academicYears.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async index(req, res) {
    try {
      const academicYears = await academicYearService.findAllAcademicYears({
        ...getAcademicYearAttributes(),
      });

      http.setSuccess(200, 'Academic Years Fetched Successfully', {
        academicYears,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to Fetch Academic Years', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  async academicYearsByCampus(req, res) {
    try {
      const academicYears =
        await academicYearService.findAllAcademicYearsByCampus();

      http.setSuccess(200, 'Academic Years Fetched Successfully', {
        academicYears,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to Fetch Academic Years by campus', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * CREATE New AcademicYear Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async createAcademicYear(req, res) {
    try {
      const data = req.body;
      const { id } = req.user;

      data.created_by_id = parseInt(id, 10);

      data.ayrCampuses = data.acYr_campuses.map((campus) => ({
        campus_id: campus,
        created_by_id: id,
      }));

      data.ayrEntryAcademicYrs = data.acYr_entry_academic_years.map((acYr) => ({
        entry_academic_year_id: acYr,
        created_by_id: id,
      }));

      data.ayrIntakes = data.acYr_intakes.map((intake) => ({
        intake_id: intake,
        created_by_id: id,
      }));

      const semesters = [];

      if (!isEmpty(data.semesters)) {
        data.semesters.forEach((semester) => {
          const academicYearStartDate = new Date(data.start_date);
          const academicYearEndDate = new Date(data.end_date);
          const semesterStartDate = new Date(semester.start_date);
          const semesterEndDate = new Date(semester.end_date);

          if (!(semesterStartDate >= academicYearStartDate)) {
            throw new Error(
              `Semester with start date of ${semester.start_date} must be greater or equal to the academic year's start date ${data.start_date}.`
            );
          }

          if (!(semesterStartDate < academicYearEndDate)) {
            throw new Error(
              `Semester with start date of ${semester.start_date} must be less than the academic year's end date ${data.end_date}.`
            );
          }

          if (!(semesterEndDate > academicYearStartDate)) {
            throw new Error(
              `Semester with end date of ${semester.end_date} must be greater than the academic year's start date ${data.start_date}.`
            );
          }

          if (!(semesterEndDate <= academicYearEndDate)) {
            throw new Error(
              `Semester with end date of ${semester.end_date} must be less or equal to the academic year's end date ${data.end_date}.`
            );
          }

          if (!(semesterStartDate < semesterEndDate)) {
            throw new Error(
              `Semester start date of ${semester.start_date} cannot be greater than or equal to semester end date of ${semester.end_date}.`
            );
          }

          const semesterIntakes = semester.sem_intakes.map((intake) => ({
            intake_id: intake,
            created_by_id: id,
          }));
          const semesterCampuses = semester.sem_campuses.map((campus) => ({
            campus_id: campus,
            created_by_id: id,
          }));
          const semEntryAcademicYrs = semester.sem_entry_academic_years.map(
            (acYr) => ({
              entry_academic_year_id: acYr,
              created_by_id: id,
            })
          );

          semesters.push({
            ...semester,
            semesterIntakes,
            semesterCampuses,
            semEntryAcademicYrs,
            created_by_id: id,
          });
        });
      }

      data.semesters = semesters;

      const academicYear = await model.sequelize.transaction(
        async (transaction) => {
          const result = await academicYearService.createAcademicYear(
            data,
            transaction
          );

          return result;
        }
      );

      http.setSuccess(200, 'Academic Year Created Successfully', {
        academicYear,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Create This Academic Year', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * UPDATE Specific AcademicYear Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async updateAcademicYear(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      const user = parseInt(req.user.id, 10);

      data.updated_at = moment.now();
      data.last_updated_by_id = user;

      const campuses = [];
      const intakes = [];
      const entryAcademicYears = [];

      if (!isEmpty(data.academic_year_campuses)) {
        data.academic_year_campuses.forEach((campusId) => {
          campuses.push({
            academic_year_id: id,
            campus_id: campusId,
            created_by_id: user,
          });
        });
      }

      if (!isEmpty(data.academic_year_intakes)) {
        data.academic_year_intakes.forEach((intakeId) => {
          intakes.push({
            academic_year_id: id,
            intake_id: intakeId,
            created_by_id: user,
          });
        });
      }

      if (!isEmpty(data.academic_year_entry_academic_years)) {
        data.academic_year_entry_academic_years.forEach((academicYearId) => {
          entryAcademicYears.push({
            academic_year_id: id,
            entry_academic_year_id: academicYearId,
            created_by_id: user,
          });
        });
      }

      const result = await model.sequelize.transaction(async (transaction) => {
        const updateAcademicYear = await academicYearService.updateAcademicYear(
          id,
          data
        );
        const academicYear = updateAcademicYear[1][0];

        await handleUpdatingPivots(
          id,
          campuses,
          intakes,
          entryAcademicYears,
          transaction,
          user
        );

        return academicYear;
      });

      http.setSuccess(200, 'Academic Year Updated Successfully', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Update This Academic Year', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Get Specific AcademicYear Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async fetchAcademicYear(req, res) {
    try {
      const { id } = req.params;
      const academicYear = await academicYearService.findOneAcademicYear({
        where: { id },
        ...getAcademicYearAttributes(),
        // include: [
        //   {
        //     association: 'academicYear',
        //     attributes: ['id', 'metadata_value'],
        //   },
        //   {
        //     association: 'semesters',
        //     include: [
        //       {
        //         association: 'semester',
        //         attributes: ['id', 'metadata_value'],
        //       },
        //       {
        //         association: 'campuses',
        //         attributes: ['id', 'metadata_value'],
        //         through: {
        //           attributes: [],
        //         },
        //       },
        //       {
        //         association: 'intakes',
        //         attributes: ['id', 'metadata_value'],
        //         through: {
        //           attributes: [],
        //         },
        //       },
        //     ],
        //   },
        // ],
      });

      http.setSuccess(200, 'Academic Year Fetched Successfully', {
        academicYear,
      });
      if (isEmpty(academicYear))
        http.setError(404, 'Academic Year Data Not Found');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Get This Academic Year', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Destroy AcademicYear Data
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async deleteAcademicYear(req, res) {
    try {
      const { id } = req.params;

      await academicYearService.deleteAcademicYear(id);
      http.setSuccess(200, 'Academic Year deleted successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Delete This Academic Year', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

/**
 *
 * @param {*} academicYearId
 * @param {*} campuses
 * @param {*} intakes
 * @param {*} entryAcademicYears
 * @param {*} transaction
 */
const handleUpdatingPivots = async function (
  academicYearId,
  campuses,
  intakes,
  entryAcademicYears,
  transaction,
  user
) {
  try {
    if (!isEmpty(campuses)) {
      await deleteOrCreateElements(
        campuses,
        'findAllAcademicYearCampuses',
        'bulkInsertAcademicYearCampuses',
        'bulkRemoveAcademicYearCampuses',
        'campus_id',
        academicYearId,
        transaction,
        'findAllSemesters',
        'findAllEvents',
        'findAllSemesterCampuses',
        'bulkRemoveSemesterCampuses',
        'bulkInsertSemesterCampuses',
        'findAllEventCampuses',
        'bulkRemoveEventCampuses',
        user
      );
    }

    if (!isEmpty(intakes)) {
      await deleteOrCreateElements(
        intakes,
        'findAllAcademicYearIntakes',
        'bulkInsertAcademicYearIntakes',
        'bulkRemoveAcademicYearIntakes',
        'intake_id',
        academicYearId,
        transaction,
        'findAllSemesters',
        'findAllEvents',
        'findAllSemesterIntakes',
        'bulkRemoveSemesterIntakes',
        'bulkInsertSemesterIntakes',
        'findAllEventIntakes',
        'bulkRemoveEventIntakes',
        user
      );
    }

    if (!isEmpty(entryAcademicYears)) {
      await deleteOrCreateElements(
        entryAcademicYears,
        'findAllAcademicYearEntryAcademicYears',
        'bulkInsertAcademicYearEntryAcademicYears',
        'bulkRemoveAcademicYearEntryAcademicYears',
        'entry_academic_year_id',
        academicYearId,
        transaction,
        'findAllSemesters',
        'findAllEvents',
        'findAllSemesterEntryAcademicYears',
        'bulkRemoveSemesterEntryAcademicYears',
        'bulkInsertSemesterEntryAcademicYears',
        'findAllEventEntryAcademicYears',
        'bulkRemoveEventEntryAcademicYears',
        user
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
 * @param {*} academicYearId
 * @param {*} transaction
 * @param {*} findAllSemesterService
 * @param {*} findAllEventService
 * @param {*} findAllSemesterPivotService
 * @param {*} deleteSemesterPivotService
 * @param {*} insertSemesterPivotService
 * @param {*} findAllEventPivotService
 * @param {*} deleteEventPivotService
 * @param {*} user
 * @returns
 */
const deleteOrCreateElements = async (
  firstElements,
  findAllService,
  insertService,
  deleteService,
  firstField,
  academicYearId,
  transaction,
  findAllSemesterService,
  findAllEventService,
  findAllSemesterPivotService,
  deleteSemesterPivotService,
  insertSemesterPivotService,
  findAllEventPivotService,
  deleteEventPivotService,
  user
) => {
  const elementsToDelete = [];
  const elementsToInsert = [];

  const secondElements = await academicYearService[findAllService]({
    where: {
      academic_year_id: academicYearId,
    },
    attributes: ['id', 'academic_year_id', firstField],
    raw: true,
  });

  for (const firstElement of firstElements) {
    const myElement = secondElements.find(
      (secondElement) =>
        parseInt(firstElement[firstField], 10) ===
          parseInt(secondElement[firstField], 10) &&
        parseInt(firstElement.academic_year_id, 10) ===
          parseInt(secondElement.academic_year_id, 10)
    );

    if (!myElement) {
      elementsToInsert.push(firstElement);

      const findAllSemesters = await semesterService[findAllSemesterService]({
        where: {
          academic_year_id: academicYearId,
        },
        attributes: ['id', 'semester_id', 'academic_year_id'],
        raw: true,
      });

      if (!isEmpty(findAllSemesters)) {
        const semesterPivotsToInsert = [];

        findAllSemesters.forEach((semester) => {
          semesterPivotsToInsert.push({
            semester_id: semester.id,
            [firstField]: parseInt(firstElement[firstField], 10),
            created_by_id: user,
          });
        });

        if (!isEmpty(semesterPivotsToInsert)) {
          await semesterService[insertSemesterPivotService](
            semesterPivotsToInsert,
            transaction
          );
        }
      }
    }
  }

  for (const secondElement of secondElements) {
    const myElement = firstElements.find(
      (firstElement) =>
        parseInt(firstElement[firstField], 10) ===
          parseInt(secondElement[firstField], 10) &&
        parseInt(firstElement.academic_year_id, 10) ===
          parseInt(secondElement.academic_year_id, 10)
    );

    if (!myElement) {
      elementsToDelete.push(secondElement.id);

      const findAllSemesters = await semesterService[findAllSemesterService]({
        where: {
          academic_year_id: academicYearId,
        },
        attributes: ['id', 'semester_id', 'academic_year_id'],
        raw: true,
      });

      if (!isEmpty(findAllSemesters)) {
        const semesterPivotsToDestroy = [];

        for (const semester of findAllSemesters) {
          const findSemesterPivot = await semesterService[
            findAllSemesterPivotService
          ]({
            where: {
              semester_id: semester.id,
            },
            attributes: ['id', 'semester_id', firstField],
            raw: true,
          });

          const filtered = findSemesterPivot.filter(
            (pivot) =>
              parseInt(pivot[firstField], 10) ===
              parseInt(secondElement[firstField], 10)
          );

          if (!isEmpty(filtered)) {
            filtered.forEach((pivot) => {
              semesterPivotsToDestroy.push(pivot.id);
            });
          }
        }

        if (!isEmpty(semesterPivotsToDestroy)) {
          await semesterService[deleteSemesterPivotService](
            semesterPivotsToDestroy,
            transaction
          );
        }
      }

      const findAllEvents = await eventService[findAllEventService]({
        where: {
          academic_year_id: academicYearId,
        },
        attributes: ['id', 'event_id', 'academic_year_id'],
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
    await academicYearService[insertService](elementsToInsert, transaction);
  }

  if (!isEmpty(elementsToDelete)) {
    await academicYearService[deleteService](elementsToDelete, transaction);
  }

  return { elementsToDelete, elementsToInsert };
};

/**
 *
 * @param {*} data
 * @param {*} key
 * @returns
 */
// const removeDuplicates = function (data, key) {
//   return [...new Map(data.map((item) => [key(item), item])).values()];
// };

/**
 *
 */
const getAcademicYearAttributes = function () {
  return {
    attributes: {
      exclude: [
        'created_at',
        'updated_at',
        'deleted_at',
        'createdById',
        'createApprovedById',
        'lastUpdatedById',
        'lastUpdateApprovedById',
        'deletedById',
        'deleteApprovedById',
        'deleteApprovedById',
      ],
    },
    include: [
      {
        association: 'academicYear',
        attributes: ['id', 'metadata_value'],
      },
      {
        association: 'ayrCampuses',
        separate: true,
        attributes: ['id', 'academic_year_id', 'campus_id'],
        include: [
          {
            association: 'campus',
            attributes: ['id', 'metadata_value'],
          },
        ],
      },
      {
        association: 'ayrEntryAcademicYrs',
        attributes: ['id', 'academic_year_id', 'entry_academic_year_id'],
        separate: true,
        include: [
          {
            association: 'entryAcademicYr',
            attributes: ['id', 'metadata_value'],
          },
        ],
      },
      {
        association: 'ayrIntakes',
        separate: true,
        attributes: ['id', 'academic_year_id', 'intake_id'],
        include: [
          {
            association: 'intake',
            attributes: ['id', 'metadata_value'],
          },
        ],
      },
      {
        association: 'semesters',
        attributes: {
          exclude: [
            'created_at',
            'updated_at',
            'deleted_at',
            'createdById',
            'createApprovedById',
            'lastUpdatedById',
            'lastUpdateApprovedById',
            'deletedById',
            'deleteApprovedById',
            'deleteApprovedById',
          ],
        },
        include: [
          {
            association: 'semester',
            attributes: ['id', 'metadata_value'],
          },
          {
            association: 'semesterCampuses',
            separate: true,
            attributes: ['id', 'semester_id', 'campus_id'],
            include: [
              {
                association: 'campus',
                attributes: ['id', 'metadata_value'],
              },
            ],
          },
          {
            association: 'semEntryAcademicYrs',
            separate: true,
            attributes: ['id', 'semester_id', 'entry_academic_year_id'],
            include: [
              {
                association: 'entryAcademicYr',
                attributes: ['id', 'metadata_value'],
              },
            ],
          },
          {
            association: 'semesterIntakes',
            separate: true,
            attributes: ['id', 'semester_id', 'intake_id'],
            include: [
              {
                association: 'intake',
                attributes: ['id', 'metadata_value'],
              },
            ],
          },
        ],
      },
    ],
  };
};

module.exports = AcademicYearController;
