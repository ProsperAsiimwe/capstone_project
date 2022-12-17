const models = require('@models');
const { QueryTypes } = require('sequelize');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for a academicYear
class AcademicYearService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all academic years or filtered using options param
   */
  static async findAllAcademicYears(options) {
    try {
      const results = await models.AcademicYear.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `academicYear.service.js`,
        `findAllAcademicYears`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} options
   * @returns
   */
  static async findAllAcademicYearCampuses(options) {
    try {
      const results = await models.AcademicYearCampus.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `academicYear.service.js`,
        `findAllAcademicYearCampuses`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async bulkInsertAcademicYearCampuses(data, transaction) {
    try {
      const result = await models.AcademicYearCampus.bulkCreate(data, {
        transaction,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `academicYear.service.js`,
        `bulkInsertAcademicYearCampuses`,
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
  static async bulkRemoveAcademicYearCampuses(data, transaction) {
    try {
      const deleted = await models.AcademicYearCampus.destroy({
        where: { id: data },
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `academicYear.service.js`,
        `bulkRemoveAcademicYearCampuses`,
        `DELETE`
      );
    }
  }

  /**
   *
   * @param {*} options
   * @returns
   */
  static async findAllAcademicYearIntakes(options) {
    try {
      const results = await models.AcademicYearIntake.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `academicYear.service.js`,
        `findAllAcademicYearIntakes`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async bulkInsertAcademicYearIntakes(data, transaction) {
    try {
      const result = await models.AcademicYearIntake.bulkCreate(data, {
        transaction,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `academicYear.service.js`,
        `bulkInsertAcademicYearIntakes`,
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
  static async bulkRemoveAcademicYearIntakes(data, transaction) {
    try {
      const deleted = await models.AcademicYearIntake.destroy({
        where: { id: data },
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `academicYear.service.js`,
        `bulkRemoveAcademicYearIntakes`,
        `DELETE`
      );
    }
  }

  /**
   *
   * @param {*} options
   * @returns
   */
  static async findAllAcademicYearEntryAcademicYears(options) {
    try {
      const results = await models.AcademicYearEntryAcademicYear.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `academicYear.service.js`,
        `findAllAcademicYearEntryAcademicYears`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async bulkInsertAcademicYearEntryAcademicYears(data, transaction) {
    try {
      const result = await models.AcademicYearEntryAcademicYear.bulkCreate(
        data,
        {
          transaction,
        }
      );

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `academicYear.service.js`,
        `bulkInsertAcademicYearEntryAcademicYears`,
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
  static async bulkRemoveAcademicYearEntryAcademicYears(data, transaction) {
    try {
      const deleted = await models.AcademicYearEntryAcademicYear.destroy({
        where: { id: data },
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `academicYear.service.js`,
        `bulkRemoveAcademicYearEntryAcademicYears`,
        `DELETE`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all academic years grouped by campus or filtered using options param
   */
  static async findAllAcademicYearsByCampus() {
    try {
      const results = await models.sequelize.query(
        `SELECT * FROM events_mgt.academic_year_campus_view ORDER BY campus`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `academicYear.service.js`,
        `findAllAcademicYearsByCampus`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single academicYear object basing on the options
   */
  static async findOneAcademicYear(options) {
    try {
      const academicYear = await models.AcademicYear.findOne({ ...options });

      return academicYear;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `academicYear.service.js`,
        `findOneAcademicYear`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single academicYear object from data object
   *@
   */
  static async createAcademicYear(data, transaction) {
    try {
      const newAcademicYear = await models.AcademicYear.findOrCreate({
        where: {
          academic_year_id: data.academic_year_id,
        },
        defaults: {
          ...data,
        },
        include: [
          {
            association: models.AcademicYear.ayrCampuses,
          },
          {
            association: models.AcademicYear.ayrIntakes,
          },
          {
            association: models.AcademicYear.ayrEntryAcademicYrs,
          },
          {
            association: models.AcademicYear.semesters,
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
          },
        ],
        transaction,
      });

      if (newAcademicYear[1] === false) {
        throw new Error(
          `The Academic Year You Are Trying To Create Already Exists.`
        );
      }

      return newAcademicYear;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `academicYear.service.js`,
        `createAcademicYear`,
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
  static async addAcademicYearCampuses(data, transaction) {
    try {
      const result = await models.AcademicYearCampus.findOrCreate({
        where: {
          academic_year_id: data.academic_year_id,
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
        `academicYear.service.js`,
        `addAcademicYearCampuses`,
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
  static async addAcademicYearIntakes(data, transaction) {
    try {
      const result = await models.AcademicYearIntake.findOrCreate({
        where: {
          academic_year_id: data.academic_year_id,
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
        `academicYear.service.js`,
        `addAcademicYearIntakes`,
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
  static async addAcademicYearEntryAcademicYears(data, transaction) {
    try {
      const result = await models.AcademicYearEntryAcademicYear.findOrCreate({
        where: {
          academic_year_id: data.academic_year_id,
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
        `academicYear.service.js`,
        `addAcademicYearEntryAcademicYears`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of academicYear object to be updated
   * @returns {Promise}
   * @description updates a single academicYear object
   *@
   */
  static async updateAcademicYear(id, data) {
    try {
      const updated = await models.AcademicYear.update(
        { ...data },
        { where: { id }, returning: true }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `academicYear.service.js`,
        `updateAcademicYear`,
        `PUT`
      );
    }
  }

  /**
   * @param {string} id  id of academicYear object to be deleted
   * @returns {Promise}
   * @description deletes a single academicYear object
   *@
   */
  static async deleteAcademicYear(id) {
    try {
      const deleted = await models.AcademicYear.destroy({
        where: { id },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `academicYear.service.js`,
        `deleteAcademicYear`,
        `DELETE`
      );
    }
  }

  /**
   *
   * @param {*} id
   * @returns
   */
  static async deleteAcademicYearCampus(options, transaction) {
    try {
      const deleted = await models.AcademicYearCampus.destroy({
        ...options,
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `academicYear.service.js`,
        `deleteAcademicYearCampus`,
        `DELETE`
      );
    }
  }

  /**
   *
   * @param {*} id
   * @returns
   */
  static async deleteAcademicYearIntakes(options, transaction) {
    try {
      const deleted = await models.AcademicYearIntake.destroy({
        ...options,
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `academicYear.service.js`,
        `deleteAcademicYearIntakes`,
        `DELETE`
      );
    }
  }

  /**
   *
   * @param {*} id
   * @returns
   */
  static async deleteAcademicYearEntryAcademicYears(options, transaction) {
    try {
      const deleted = await models.AcademicYearEntryAcademicYear.destroy({
        ...options,
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `academicYear.service.js`,
        `deleteAcademicYearEntryAcademicYears`,
        `DELETE`
      );
    }
  }
}

module.exports = AcademicYearService;
