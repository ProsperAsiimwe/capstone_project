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
      const results = await models.CourseUnit.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `courseUnit.service.js`,
        `findAllCourseUnits`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all
   */
  static async findAllPrerequisiteCourseUnits(options) {
    try {
      const results = await models.CoursePrerequisite.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `courseUnit.service.js`,
        `findAllPrerequisiteCourseUnits`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async bulkInsertPrerequisiteCourseUnits(data, transaction) {
    try {
      const result = await models.CoursePrerequisite.bulkCreate(data, {
        transaction,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `courseUnit.service.js`,
        `bulkInsertPrerequisiteCourseUnits`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} data
   */
  static async bulkRemovePrerequisiteCourseUnit(data, transaction) {
    try {
      const deleted = await models.CoursePrerequisite.destroy({
        where: { id: data },
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `courseUnit.service.js`,
        `bulkRemovePrerequisiteCourseUnit`,
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
        `courseUnit.service.js`,
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
      const courseUnit = await models.CourseUnit.findOne({ ...options });

      return courseUnit;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `courseUnit.service.js`,
        `findOneCourseUnit`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single courseUnit object basing on the options
   */
  static async findOneModuleCourseUnit(options) {
    try {
      const courseUnit = await models.ModuleCourseUnit.findOne({ ...options });

      return courseUnit;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `courseUnit.service.js`,
        `findOneModuleCourseUnit`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single courseUnit object basing on the options
   */
  static async findOneOptionCourseUnit(options) {
    try {
      const courseUnit = await models.OptionCourseUnit.findOne({ ...options });

      return courseUnit;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `courseUnit.service.js`,
        `findOneOptionCourseUnit`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} options
   */
  static async findOneProgrammeVersionCourseUnit(options) {
    try {
      const courseUnit = await models.ProgrammeVersionCourseUnit.findOne({
        ...options,
      });

      return courseUnit;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `courseUnit.service.js`,
        `findOneProgrammeVersionCourseUnit`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} options
   */
  static async findOneProgrammeVersionPlanCourseUnit(options) {
    try {
      const courseUnit = await models.ProgrammeVersionPlanCourseUnit.findOne({
        ...options,
      });

      return courseUnit;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `courseUnit.service.js`,
        `findOneProgrammeVersionPlanCourseUnit`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} options
   */
  static async findOneProgrammeVersionSpecializationCourseUnit(options) {
    try {
      const courseUnit =
        await models.ProgrammeVersionSpecializationCourseUnit.findOne({
          ...options,
        });

      return courseUnit;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `courseUnit.service.js`,
        `findOneProgrammeVersionSpecializationCourseUnit`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} options
   */
  static async findOneSubjectCourseUnit(options) {
    try {
      const courseUnit = await models.SubjectCourseUnit.findOne({
        ...options,
      });

      return courseUnit;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `courseUnit.service.js`,
        `findOneSubjectCourseUnit`,
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
      const newCourseUnit = await models.CourseUnit.findOrCreate({
        where: {
          course_unit_code: data.course_unit_code,
        },
        defaults: {
          ...data,
        },
        include: [
          {
            association: models.CourseUnit.prerequisiteCourses,
          },
        ],
        transaction,
      });

      return newCourseUnit;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `courseUnit.service.js`,
        `createCourseUnit`,
        `POST`
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
        transaction,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `courseUnit.service.js`,
        `createProgrammeVersionCourseUnit`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async createProgrammeVersionModuleCourseUnit(data, transaction) {
    try {
      const result = await models.ModuleCourseUnit.findOrCreate({
        where: {
          version_module_id: data.version_module_id,
          course_unit_id: data.course_unit_id,
        },
        defaults: {
          ...data,
        },
        include: [
          {
            association: models.ModuleCourseUnit.optionCourseUnits,
          },
        ],
        transaction,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `courseUnit.service.js`,
        `createProgrammeVersionModuleCourseUnit`,
        `POST`
      );
    }
  }

  /**
   * createModuleOptionCourseUnit
   * @param {*} data
   * @param {*} transaction
   */
  static async createModuleOptionCourseUnit(data, transaction) {
    try {
      const result = await models.OptionCourseUnit.findOrCreate({
        where: {
          module_option_id: data.module_option_id,
          module_course_unit_id: data.module_course_unit_id,
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
        `courseUnit.service.js`,
        `createModuleOptionCourseUnit`,
        `POST`
      );
    }
  }

  /**
   * createProgrammeVersionPlanCourseUnit
   * @param {*} data
   * @param {*} transaction
   */
  static async createProgrammeVersionPlanCourseUnit(data, transaction) {
    try {
      const result = await models.ProgrammeVersionPlanCourseUnit.findOrCreate({
        where: {
          programme_version_plan_id: data.programme_version_plan_id,
          programme_version_course_unit_id:
            data.programme_version_course_unit_id,
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
        `courseUnit.service.js`,
        `createProgrammeVersionPlanCourseUnit`,
        `POST`
      );
    }
  }

  /**
   * createProgrammeVersionSpecializationCourseUnit
   * @param {*} data
   * @param {*} transaction
   */
  static async createProgrammeVersionSpecializationCourseUnit(
    data,
    transaction
  ) {
    try {
      const result =
        await models.ProgrammeVersionSpecializationCourseUnit.findOrCreate({
          where: {
            version_specialization_id: data.version_specialization_id,
            programme_version_course_unit_id:
              data.programme_version_course_unit_id,
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
        `courseUnit.service.js`,
        `createProgrammeVersionSpecializationCourseUnit`,
        `POST`
      );
    }
  }

  /**
   * createSubjectCombinationSubjectCourseUnit
   * @param {*} data
   * @param {*} transaction
   */
  static async createSubjectCombinationSubjectCourseUnit(data, transaction) {
    try {
      const result = await models.SubjectCourseUnit.findOrCreate({
        where: {
          combination_subject_id: data.combination_subject_id,
          programme_version_course_unit_id:
            data.programme_version_course_unit_id,
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
        `courseUnit.service.js`,
        `createSubjectCombinationSubjectCourseUnit`,
        `POST`
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
  static async updateCourseUnit(id, data) {
    try {
      const updated = await models.CourseUnit.update(data, {
        where: { id },
        returning: true,
        plain: true,
      });

      return updated[0];
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `courseUnit.service.js`,
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
  static async deleteCourseUnit(id) {
    try {
      const deleted = await models.CourseUnit.destroy({
        where: { id },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `courseUnit.service.js`,
        `deleteCourseUnit`,
        `DELETE`
      );
    }
  }

  /**
   *
   * @param {*} id
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
        `courseUnit.service.js`,
        `deleteVersionCourseUnit`,
        `DELETE`
      );
    }
  }

  /**
   * deletePlanCourseUnit
   * @param {*} id
   */
  static async deletePlanCourseUnit(id) {
    try {
      const deleted = await models.ProgrammeVersionPlanCourseUnit.destroy({
        where: { id },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `courseUnit.service.js`,
        `deletePlanCourseUnit`,
        `DELETE`
      );
    }
  }

  /**
   * deleteSpecializationCourseUnit
   * @param {*} id
   */
  static async deleteSpecializationCourseUnit(id) {
    try {
      const deleted =
        await models.ProgrammeVersionSpecializationCourseUnit.destroy({
          where: { id },
        });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `courseUnit.service.js`,
        `deleteSpecializationCourseUnit`,
        `DELETE`
      );
    }
  }

  /**
   * deleteSubjectCourseUnit
   * @param {*} id
   */
  static async deleteSubjectCourseUnit(id) {
    try {
      const deleted = await models.SubjectCourseUnit.destroy({
        where: { id },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `courseUnit.service.js`,
        `deleteSubjectCourseUnit`,
        `DELETE`
      );
    }
  }

  /**
   * deleteModularCourseUnit
   * @param {*} id
   */
  static async deleteModularCourseUnit(id) {
    try {
      await models.OptionCourseUnit.destroy({
        where: { module_course_unit_id: id },
      });

      const deleted = await models.ModuleCourseUnit.destroy({
        where: { id },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `courseUnit.service.js`,
        `deleteModularCourseUnit`,
        `DELETE`
      );
    }
  }
}

module.exports = CourseUnitService;
