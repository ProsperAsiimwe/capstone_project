const models = require('@models');
const { trim, toUpper } = require('lodash');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for this entity
class ResultsPolicyService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all records or filtered using options param
   */
  static async findAllStudyLevelPassMarkPolicy(options) {
    try {
      const records = await models.PassMarkPolicyView.findAll({
        ...options,
      });

      return records;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `resultsPolicy.service.js`,
        `findAllStudyLevelPassMarkPolicy`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} options
   */
  static async findAllCourseResittingPolicy(options) {
    try {
      const records = await models.CourseResittingPolicy.findAll({
        ...options,
      });

      return records;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `resultsPolicy.service.js`,
        `findAllCourseResittingPolicy`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} options
   */
  static async findAllStudyLevelDegreeClassPolicy(options) {
    try {
      const records = await models.StudyLevelDegreeClass.findAll({
        ...options,
      });

      return records;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `resultsPolicy.service.js`,
        `findAllStudyLevelDegreeClassPolicy`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} options
   */
  static async findAllStudyLevelDegreeClassAllocations(options) {
    try {
      const records = await models.StudyLevelDegreeClassAllocation.findAll({
        ...options,
      });

      return records;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `resultsPolicy.service.js`,
        `findAllStudyLevelDegreeClassAllocations`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single record object basing on the options
   */
  static async findOneStudyLevelPassMarkPolicy(options) {
    try {
      const record = await models.PassMarkPolicyView.findOne({
        ...options,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `resultsPolicy.service.js`,
        `findOneStudyLevelPassMarkPolicy`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description bulkCreatePassMarkPolicyAcademicYear object from data object
   *@
   */
  static async bulkCreatePassMarkPolicyAcademicYear(data, transaction) {
    try {
      const result = await models.PassMarkPolicyAcademicYear.bulkCreate(data, {
        updateOnDuplicate: ['pass_mark', 'updated_at', 'last_updated_by_id'],
        transaction,
        returning: false,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `resultsPolicy.service.js`,
        `bulkCreatePassMarkPolicyAcademicYear`,
        `PUT/POST`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description destroyPassMarkPolicyAcademicYear object from data object
   *@
   */
  static async destroyPassMarkPolicyAcademicYear(whereClause, transaction) {
    try {
      const result = await models.PassMarkPolicyAcademicYear.destroy({
        where: whereClause,
        transaction,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `resultsPolicy.service.js`,
        `destroyPassMarkPolicyAcademicYear`,
        `PUT/POST`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single record object basing on the options
   */
  static async findOneCourseResittingPolicy(options) {
    try {
      const record = await models.CourseResittingPolicy.findOne({
        ...options,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `resultsPolicy.service.js`,
        `findOneCourseResittingPolicy`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single record object basing on the options
   */
  static async findOneStudyLevelDegreeClassPolicy(options) {
    try {
      const record = await models.StudyLevelDegreeClass.findOne({
        ...options,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `resultsPolicy.service.js`,
        `findOneStudyLevelDegreeClassPolicy`,
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
  static async createStudyLevelPassMarkPolicy(data, transaction) {
    try {
      const result = await models.StudyLevelPassMarkPolicy.findOrCreate({
        where: {
          programme_study_level_id: data.programme_study_level_id,
        },
        include: ['academicYears'],
        defaults: {
          ...data,
        },
        transaction,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `resultsPolicy.service.js`,
        `createStudyLevelPassMarkPolicy`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single record object from data object
   *@
   */
  static async createCourseResittingPolicy(data) {
    try {
      const result = await models.CourseResittingPolicy.findOrCreate({
        where: {
          programme_study_level_id: data.programme_study_level_id,
        },
        defaults: {
          ...data,
        },
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `resultsPolicy.service.js`,
        `createCourseResittingPolicy`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single record object from data object
   *@
   */
  static async createStudyLevelDegreeClassPolicy(data, transaction) {
    try {
      const result = await models.StudyLevelDegreeClass.findOrCreate({
        where: {
          programme_study_level_id: data.programme_study_level_id,
        },
        defaults: {
          ...data,
        },
        include: [
          {
            association: models.StudyLevelDegreeClass.allocations,
          },
        ],
        transaction,
      });

      if (result[1] === false) {
        const { id } = result[0].dataValues;

        for (const allocation of data.allocations) {
          await models.StudyLevelDegreeClassAllocation.findOrCreate({
            where: {
              std_lev_degree_class_id: id,
              name: toUpper(trim(data.allocations.name)),
            },
            defaults: {
              ...allocation,
            },
            transaction,
          });
        }
      }

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `resultsPolicy.service.js`,
        `createStudyLevelDegreeClassPolicy`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async bulkInsertStudyLevelDegreeClassAllocations(data, transaction) {
    try {
      const result = await models.StudyLevelDegreeClassAllocation.bulkCreate(
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
        `resultsPolicy.service.js`,
        `bulkInsertStudyLevelDegreeClassAllocations`,
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
  static async updateStudyLevelPassMarkPolicy(id, data, transaction) {
    try {
      const record = await models.StudyLevelPassMarkPolicy.update(
        { ...data },
        { where: { id }, returning: true },
        transaction
      );

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `resultsPolicy.service.js`,
        `updateStudyLevelPassMarkPolicy`,
        `PUT`
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
  static async updateCourseResittingPolicy(id, data) {
    try {
      const record = await models.CourseResittingPolicy.update(
        { ...data },
        { where: { id }, returning: true }
      );

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `resultsPolicy.service.js`,
        `updateCourseResittingPolicy`,
        `PUT`
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
  static async updateStudyLevelDegreeClassPolicy(id, data, transaction) {
    try {
      const updated = await models.StudyLevelDegreeClass.update(data, {
        where: { id },
        returning: true,
        transaction,
      });

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `resultsPolicy.service.js`,
        `updateStudyLevelDegreeClassPolicy`,
        `PUT`
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
  static async updateStudyLevelDegreeClassPolicyAllocation(
    id,
    data,
    transaction
  ) {
    try {
      const updated = await models.StudyLevelDegreeClassAllocation.update(
        data,
        {
          where: { id },
          transaction,
          returning: true,
        }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `resultsPolicy.service.js`,
        `updateStudyLevelDegreeClassPolicyAllocation`,
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
  static async deleteStudyLevelDegreeClassPolicyAllocation(id) {
    try {
      const deleted = await models.StudyLevelDegreeClassAllocation.destroy({
        where: { id },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `resultsPolicy.service.js`,
        `deleteStudyLevelDegreeClassPolicyAllocation`,
        `DELETE`
      );
    }
  }

  /**
   * @param {string} id  id of record object to be deleted
   * @returns {Promise}
   * @description deletes a single record object
   *@
   */
  static async deleteStudyLevelPassMarkPolicy(id, transaction) {
    try {
      await models.PassMarkPolicyAcademicYear.destroy({
        where: {
          pass_mark_policy_id: id,
        },
        transaction,
        returning: false,
      });

      const deleted = await models.StudyLevelPassMarkPolicy.destroy({
        where: { id },
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `resultsPolicy.service.js`,
        `deleteStudyLevelPassMarkPolicy`,
        `DELETE`
      );
    }
  }

  /**
   * @param {string} id  id of record object to be deleted
   * @returns {Promise}
   * @description deletes a single record object
   *@
   */
  static async deleteCourseResittingPolicy(id) {
    try {
      const deleted = await models.CourseResittingPolicy.destroy({
        where: { id },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `resultsPolicy.service.js`,
        `deleteCourseResittingPolicy`,
        `DELETE`
      );
    }
  }

  /**
   * @param {string} id  id of record object to be deleted
   * @returns {Promise}
   * @description deletes a single record object
   *@
   */
  static async deleteStudyLevelDegreeClassPolicy(id) {
    try {
      const deleted = await models.StudyLevelDegreeClass.destroy({
        where: { id },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `resultsPolicy.service.js`,
        `deleteStudyLevelDegreeClassPolicy`,
        `DELETE`
      );
    }
  }

  /**
   *
   * @param {*} data
   */
  static async bulkRemoveStudyLevelDegreeClassAllocations(data, transaction) {
    try {
      const deleted = await models.StudyLevelDegreeClassAllocation.destroy({
        where: { id: data },
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `resultsPolicy.service.js`,
        `bulkRemoveStudyLevelDegreeClassAllocations`,
        `DELETE`
      );
    }
  }
}

module.exports = ResultsPolicyService;
