const models = require('@models');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for a semester
class SemesterService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all faculties or filtered using options param
   */
  static async findAllSemesters(options) {
    try {
      const results = await models.Semester.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `semester.service.js`,
        `findAllSemesters`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} options
   * @returns
   */
  static async findAllSemesterCampuses(options) {
    try {
      const results = await models.SemesterCampus.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `semester.service.js`,
        `findAllSemesterCampuses`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async bulkInsertSemesterCampuses(data, transaction) {
    try {
      const result = await models.SemesterCampus.bulkCreate(data, {
        transaction,
        returning: true,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `semester.service.js`,
        `bulkInsertSemesterCampuses`,
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
  static async bulkRemoveSemesterCampuses(data, transaction) {
    try {
      const deleted = await models.SemesterCampus.destroy({
        where: { id: data },
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `semester.service.js`,
        `bulkRemoveSemesterCampuses`,
        `DELETE`
      );
    }
  }

  /**
   *
   * @param {*} options
   * @returns
   */
  static async findAllSemesterIntakes(options) {
    try {
      const results = await models.SemesterIntake.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `semester.service.js`,
        `findAllSemesterIntakes`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async bulkInsertSemesterIntakes(data, transaction) {
    try {
      const result = await models.SemesterIntake.bulkCreate(data, {
        transaction,
        returning: true,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `semester.service.js`,
        `bulkInsertSemesterIntakes`,
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
  static async bulkRemoveSemesterIntakes(data, transaction) {
    try {
      const deleted = await models.SemesterIntake.destroy({
        where: { id: data },
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `semester.service.js`,
        `bulkRemoveSemesterIntakes`,
        `DELETE`
      );
    }
  }

  /**
   *
   * @param {*} options
   * @returns
   */
  static async findAllSemesterEntryAcademicYears(options) {
    try {
      const results = await models.SemesterEntryAcademicYear.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `semester.service.js`,
        `findAllSemesterEntryAcademicYears`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async bulkInsertSemesterEntryAcademicYears(data, transaction) {
    try {
      const result = await models.SemesterEntryAcademicYear.bulkCreate(data, {
        transaction,
        returning: true,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `semester.service.js`,
        `bulkInsertSemesterEntryAcademicYears`,
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
  static async bulkRemoveSemesterEntryAcademicYears(data, transaction) {
    try {
      const deleted = await models.SemesterEntryAcademicYear.destroy({
        where: { id: data },
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `semester.service.js`,
        `bulkRemoveSemesterEntryAcademicYears`,
        `DELETE`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single semester object basing on the options
   */
  static async findOneSemester(options) {
    try {
      const semester = await models.Semester.findOne({
        ...options,
      });

      return semester;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `semester.service.js`,
        `findOneSemester`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single semester object from data object
   *@
   */
  static async createSemester(data, transaction) {
    try {
      const newSemester = await models.Semester.findOrCreate({
        where: {
          semester_id: data.semester_id,
          academic_year_id: data.academic_year_id,
        },
        defaults: {
          ...data,
        },
        include: [
          {
            association: models.Semester.semesterCampuses,
          },
          {
            association: models.Semester.semesterIntakes,
          },
          {
            association: models.Semester.semEntryAcademicYrs,
          },
        ],
        transaction,
      });

      return newSemester;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `semester.service.js`,
        `createSemester`,
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
  static async addSemesterCampuses(data, transaction) {
    try {
      const result = await models.SemesterCampus.findOrCreate({
        where: {
          semester_id: data.semester_id,
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
        `semester.service.js`,
        `addSemesterCampuses`,
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
  static async addSemesterIntakes(data, transaction) {
    try {
      const result = await models.SemesterIntake.findOrCreate({
        where: {
          semester_id: data.semester_id,
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
        `semester.service.js`,
        `addSemesterIntakes`,
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
  static async addSemesterEntryAcademicYears(data, transaction) {
    try {
      const result = await models.SemesterEntryAcademicYear.findOrCreate({
        where: {
          semester_id: data.semester_id,
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
        `semester.service.js`,
        `addSemesterEntryAcademicYears`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of semester object to be updated
   * @returns {Promise}
   * @description updates a single semester object
   *@
   */
  static async updateSemester(id, data) {
    try {
      const updated = await models.Semester.update(
        { ...data },
        { where: { id }, returning: true }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `semester.service.js`,
        `updateSemester`,
        `PUT`
      );
    }
  }

  /**
   * @param {string} id  id of semester object to be deleted
   * @returns {Promise}
   * @description deletes a single semester object
   *@
   */
  static async deleteSemester(id) {
    try {
      const deleted = await models.Semester.destroy({
        where: { id },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `semester.service.js`,
        `deleteSemester`,
        `DELETE`
      );
    }
  }

  /**
   *
   * @param {*} id
   * @returns
   */
  static async deleteSemesterCampus(options, transaction) {
    try {
      const deleted = await models.SemesterCampus.destroy({
        ...options,
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `semester.service.js`,
        `deleteSemesterCampus`,
        `DELETE`
      );
    }
  }

  /**
   *
   * @param {*} id
   * @returns
   */
  static async deleteSemesterIntakes(options, transaction) {
    try {
      const deleted = await models.SemesterIntake.destroy({
        ...options,
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `semester.service.js`,
        `deleteSemesterIntakes`,
        `DELETE`
      );
    }
  }

  /**
   *
   * @param {*} id
   * @returns
   */
  static async deleteSemesterEntryAcademicYears(options, transaction) {
    try {
      const deleted = await models.SemesterEntryAcademicYear.destroy({
        ...options,
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `semester.service.js`,
        `deleteSemesterEntryAcademicYears`,
        `DELETE`
      );
    }
  }
}

module.exports = SemesterService;
