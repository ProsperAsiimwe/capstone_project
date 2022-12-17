const models = require('@models');
const { QueryTypes } = require('sequelize');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for a courseUnit
class CourseUnitService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all faculties or filtered using options param
   */
  static async findAllCourseUnits(options) {
    try {
      const results = await models.ProgrammeVersionCourseUnit.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersion.service.js`,
        `findAllCourseUnits`,
        `GET`
      );
    }
  }

  /**
   * FILTER ONLY COURSE CODES TO UPLOAD FROM THEIR VERSION
   *
   * @param  {object} options
   * @returns {Promise}
   * @description returns all programme version course units within the provided codes
   */
  static async filterVersionCourseUnits(courseCodes) {
    try {
      const filtered = await models.sequelize.query(
        `
         select 
          pvcu.id,
          pvcu.programme_version_id,
          pvcu.course_unit_id,
          pvcu.grading_id,
          pvcu.course_unit_semester_id,
          courseSem.metadata_value as course_unit_semester,
          pvcu.course_unit_year_id,
          courseYear.metadata_value as course_unit_year,
          cu.course_unit_code,
          progstdy.programme_study_year_id
          from programme_mgt.programme_version_course_units as pvcu
          LEFT JOIN programme_mgt.course_units as cu on cu.id = pvcu.course_unit_id
          LEFT JOIN app_mgt.metadata_values as courseSem on courseSem.id = pvcu.course_unit_semester_id
          left join programme_mgt.programme_study_years as progstdy on pvcu.course_unit_year_id = progstdy.id
          Left join app_mgt.metadata_values as courseYear on progstdy.programme_study_year_id = courseYear.id
          where cu.course_unit_code in ('${courseCodes}')
         `,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersion.service.js`,
        `findAllCourseUnits`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async createProgrammeVersionCourseUnit(data, transaction) {
    try {
      const result = await models.ProgrammeVersionCourseUnit.findOrCreate({
        where: {
          programme_version_id: data.programme_version_id,
          course_unit_id: data.course_unit_id,
        },
        defaults: {
          ...data,
        },
        include: [
          {
            association: models.ProgrammeVersionCourseUnit.planCourseUnits,
          },
          {
            association: models.ProgrammeVersionCourseUnit.specCourseUnits,
          },
          {
            association: models.ProgrammeVersionCourseUnit.subjectCourseUnits,
          },
        ],
        transaction,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersion.service.js`,
        `createProgrammeVersionCourseUnit`,
        `POST`
      );
    }
  }

  /** findAllVersionPlanCourseUnits
   *
   * @param {*} options
   */
  static async findAllVersionPlanCourseUnits(options) {
    try {
      const results = await models.ProgrammeVersionPlanCourseUnit.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersion.service.js`,
        `findAllVersionPlanCourseUnits`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async bulkInsertVersionPlanCourseUnits(data, transaction) {
    try {
      const result = await models.ProgrammeVersionPlanCourseUnit.bulkCreate(
        data,
        {
          transaction,
          returning: true,
        }
      );

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersion.service.js`,
        `bulkInsertVersionPlanCourseUnits`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} data
   */
  static async bulkRemoveVersionPlanCourseUnit(data, transaction) {
    try {
      const deleted = await models.ProgrammeVersionPlanCourseUnit.destroy({
        where: { id: data },
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersion.service.js`,
        `bulkRemoveVersionPlanCourseUnit`,
        `DELETE`
      );
    }
  }

  /** findAllVersionSpecializationCourseUnits
   *
   * @param {*} options
   */
  static async findAllVersionSpecializationCourseUnits(options) {
    try {
      const results =
        await models.ProgrammeVersionSpecializationCourseUnit.findAll({
          ...options,
        });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersion.service.js`,
        `findAllVersionSpecializationCourseUnits`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async bulkInsertVersionSpecializationCourseUnits(data, transaction) {
    try {
      const result =
        await models.ProgrammeVersionSpecializationCourseUnit.bulkCreate(data, {
          transaction,
          returning: true,
        });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersion.service.js`,
        `bulkInsertVersionSpecializationCourseUnits`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} options
   */
  static async bulkRemoveVersionSpecializationCourseUnit(data, transaction) {
    try {
      const deleted =
        await models.ProgrammeVersionSpecializationCourseUnit.destroy({
          where: { id: data },
          transaction,
        });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersion.service.js`,
        `bulkRemoveVersionSpecializationCourseUnit`,
        `DELETE`
      );
    }
  }

  /**
   *
   * @param {*} options
   */
  static async findAllVersionSubjectCourseUnits(options) {
    try {
      const results = await models.SubjectCourseUnit.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersion.service.js`,
        `findAllVersionSubjectCourseUnits`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async bulkInsertVersionSubjectCourseUnits(data, transaction) {
    try {
      const result = await models.SubjectCourseUnit.bulkCreate(data, {
        transaction,
        returning: true,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersion.service.js`,
        `bulkInsertVersionSubjectCourseUnits`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} data
   */
  static async bulkRemoveVersionSubjectCourseUnit(data, transaction) {
    try {
      const deleted = await models.SubjectCourseUnit.destroy({
        where: { id: data },
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersion.service.js`,
        `bulkRemoveVersionSubjectCourseUnit`,
        `DELETE`
      );
    }
  }

  static async getCourseUnitsDownloadData(options) {
    try {
      const coursesToDownload = await models.sequelize.query(
        `SELECT * FROM programme_mgt.course_unit_metadata_view`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return coursesToDownload;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersion.service.js`,
        `getCourseUnitsDownloadData`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single courseUnit object basing on the options
   */
  static async findOneCourseUnit(options) {
    try {
      const courseUnit = await models.ProgrammeVersionCourseUnit.findOne({
        ...options,
      });

      return courseUnit;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersion.service.js`,
        `findOneCourseUnit`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single courseUnit object from data object
   *@
   */
  static async createCourseUnit(data, transaction) {
    try {
      const newCourseUnit = await models.ProgrammeVersionCourseUnit.create(
        data,
        {
          include: [
            {
              association:
                models.ProgrammeVersionCourseUnit.courseSpecializations,
            },
          ],
          transaction,
        }
      );

      return newCourseUnit;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersion.service.js`,
        `createCourseUnit`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of courseUnit object to be updated
   * @returns {Promise}
   * @description updates a single courseUnit object
   *@
   */
  static async updateCourseUnit(id, data, transaction) {
    try {
      const updated = await models.ProgrammeVersionCourseUnit.update(data, {
        where: { id },
        returning: true,
        transaction,
      });

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersion.service.js`,
        `updateCourseUnit`,
        `PUT`
      );
    }
  }

  /**
   * @param {string} id  id of courseUnit object to be deleted
   * @returns {Promise}
   * @description deletes a single courseUnit object
   *@
   */
  static async deleteVersionCourseUnit(id) {
    try {
      const deleted = await models.ProgrammeVersionCourseUnit.destroy({
        where: { id },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersion.service.js`,
        `deleteVersionCourseUnit`,
        `DELETE`
      );
    }
  }
}

module.exports = CourseUnitService;
