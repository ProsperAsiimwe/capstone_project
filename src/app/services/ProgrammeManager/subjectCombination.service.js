const models = require('@models');
const { QueryTypes } = require('sequelize');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for a courseUnit
class SubjectCombinationService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all faculties or filtered using options param
   */
  static async findAllSubjectCombinations(options) {
    try {
      const results = await models.SubjectCombination.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `subjectCombination.service.js`,
        `findAllSubjectCombinations`,
        `GET`
      );
    }
  }

  static async findSubjectCombinationsWithVersions() {
    try {
      const records = await models.sequelize.query(
        `select * from programme_mgt.programme_subject_combination_subjects`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return records;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `subjectCombination.service.js`,
        `findSubjectCombinationsWithVersions`,
        `GET`
      );
    }
  }
  // programme_mgt.version_subject_combination_function(version )

  static async versionSubjectCombinations(data) {
    try {
      const records = await models.sequelize.query(
        `select * from programme_mgt.version_subject_combination_function(${data.version_id})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return records;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `subjectCombination.service.js`,
        `versionSubjectCombinations`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single object basing on the options
   */
  static async findOneSubjectCombination(options) {
    try {
      const response = await models.SubjectCombination.findOne({
        ...options,
      });

      return response;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `subjectCombination.service.js`,
        `findOneSubjectCombination`,
        `GET`
      );
    }
  }

  /**
   * findAllCombinationSubjects
   * @param {*} options
   */
  static async findAllCombinationSubjects(options) {
    try {
      const response = await models.SubjectCombinationSubject.findAll({
        ...options,
      });

      return response;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `subjectCombination.service.js`,
        `findAllCombinationSubjects`,
        `GET`
      );
    }
  }

  /**
   * findAllCombinationSubjectCourseUnits
   * @param {*} options
   */
  static async findAllCombinationSubjectCourseUnits(options) {
    try {
      const response = await models.SubjectCourseUnit.findAll({
        ...options,
      });

      return response;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `subjectCombination.service.js`,
        `findAllCombinationSubjectCourseUnits`,
        `GET`
      );
    }
  }

  /**
   * removeAllCombinationSubjectCourseUnits
   * @param {*} options
   */
  static async removeAllCombinationSubjectCourseUnits(options) {
    try {
      const response = await models.SubjectCourseUnit.destroy({
        ...options,
      });

      return response;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `subjectCombination.service.js`,
        `removeAllCombinationSubjectCourseUnits`,
        `DELETE`
      );
    }
  }

  /**
   *
   * @param {*} options
   */
  static async findOneProgrammeVersionSubjectCombinationSubject(options) {
    try {
      const courseUnit = await models.SubjectCombinationSubject.findOne({
        ...options,
      });

      return courseUnit;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `subjectCombination.service.js`,
        `findOneProgrammeVersionSubjectCombinationSubject`,
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
  static async createSubjectCombination(data, transaction) {
    try {
      const record = await models.SubjectCombination.findOrCreate({
        where: {
          combination_category_id: data.combination_category_id,
          subject_combination_code: data.subject_combination_code,
        },
        defaults: {
          ...data,
        },
        include: [
          {
            association: models.SubjectCombination.subjects,
          },
        ],
        transaction,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `subjectCombination.service.js`,
        `createSubjectCombination`,
        `POST`
      );
    }
  }

  /**
   * createCombinationSubject
   * @param {*} data
   * @param {*} transaction
   */
  static async createCombinationSubject(data, transaction) {
    try {
      const result = await models.SubjectCombinationSubject.findOrCreate({
        where: {
          subject_id: data.subject_id,
          category_combination_id: data.category_combination_id,
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
        `subjectCombination.service.js`,
        `createCombinationSubject`,
        `POST`
      );
    }
  }

  /**
   * removeCombinationSubject
   * @param {*} options
   */
  static async removeCombinationSubject(options, transaction) {
    try {
      const response = await models.SubjectCombinationSubject.destroy({
        ...options,
        transaction,
      });

      return response;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `subjectCombination.service.js`,
        `removeCombinationSubject`,
        `DELETE`
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
  static async updateSubjectCombination(id, data, transaction) {
    try {
      const updated = await models.SubjectCombination.update(
        { ...data },
        { where: { id }, transaction, returning: true }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `subjectCombination.service.js`,
        `updateSubjectCombination`,
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
  static async deleteSubjectCombination(id) {
    try {
      const deleted = await models.SubjectCombination.destroy({
        where: { id },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `subjectCombination.service.js`,
        `deleteSubjectCombination`,
        `DELETE`
      );
    }
  }
}

module.exports = SubjectCombinationService;

// without aggregations: programme_subject_combination
// programme_subject_combination_subjects
// programme_version_comb
