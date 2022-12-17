const models = require('@models');
const { QueryTypes, Op } = require('sequelize');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for this entity
class ResultService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all records or filtered using options param
   */
  static async findAllResults(options) {
    try {
      const records = await models.Result.findAll({
        ...options,
      });

      return records;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `result.service.js`,
        `findAllResults`,
        `GET`
      );
    }
  }

  //  data

  static async findAllStudentGrades(options) {
    try {
      const records = await models.StudentAcademicAssessment.findAll({
        ...options,
      });

      return records;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `result.service.js`,
        `findAllStudentGrades`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single record object basing on the options
   */
  static async fetchResult(options) {
    try {
      const record = await models.Result.findOne({
        ...options,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `result.service.js`,
        `fetchResult`,
        `GET`
      );
    }
  }

  // rename
  static async findOneResult(options) {
    try {
      const record = await models.Result.findOne({
        ...options,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `result.service.js`,
        `findOneResult`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async createResult(data, student, transaction) {
    try {
      const record = await models.Result.create(data, {
        include: [
          {
            association: models.Result.batch,
          },
        ],
        transaction,
      });

      return record;
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error(
          `You have entered a duplicate record for registration number: ${student}.`
        );
      } else {
        await sequelizeErrorHandler(
          error,
          `result.service.js`,
          `createResult`,
          `POST`
        );
      }
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async createAcademicAssessment(data, student, transaction) {
    try {
      const record = await models.StudentAcademicAssessment.create(data, {
        transaction,
      });

      return record;
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error(
          `You have entered a duplicate record for registration number: ${student}.`
        );
      } else {
        await sequelizeErrorHandler(
          error,
          `result.service.js`,
          `createAcademicAssessment`,
          `POST`
        );
      }
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async createFirstSittingResult(data, student, transaction) {
    try {
      const record = await models.Result.create(data, {
        transaction,
      });

      return record;
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        // throw new Error(error.parent.detail);
        throw new Error(
          `You have entered a duplicate record for registration number: ${student} in your template.`
        );
      } else {
        await sequelizeErrorHandler(
          error,
          `result.service.js`,
          `createFirstSittingResult`,
          `POST`
        );
      }
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async createMultipleSittingResult(data, student, transaction) {
    try {
      const record = await models.RetakePaper.create(data, {
        transaction,
      });

      return record;
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error(
          `You have entered a duplicate record for registration number: ${student} in your template.`
        );
      } else {
        await sequelizeErrorHandler(
          error,
          `result.service.js`,
          `createMultipleSittingResult`,
          `POST`
        );
      }
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of record object to be updated
   * @returns {Promise}
   * @description updates a single record object
   *@
   */
  static async updateResult(id, data, transaction) {
    try {
      const record = await models.Result.update(
        { ...data },
        { where: { id }, transaction, returning: true }
      );

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `result.service.js`,
        `updateResult`,
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
  static async updateResultByContext(whereClause, data, transaction) {
    try {
      const record = await models.Result.update(data, {
        where: whereClause,
        transaction,
        returning: true,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `result.service.js`,
        `updateResult`,
        `PUT`
      );
    }
  }

  /**
   * BULK CREATE OR UPDATE RESULTS
   *
   * @param {*} data
   * @param {*} transaction
   * @returns
   */
  static async bulkCreateResult(data, transaction) {
    try {
      const record = await models.Result.bulkCreate(data, {
        updateOnDuplicate: ['course_work', 'final_exam', 'final_mark'],
        transaction,
        returning: true,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `result.service.js`,
        `updateResult`,
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
  static async updateBEVSResult(id, data, transaction) {
    try {
      const record = await models.Result.update(
        { ...data },
        {
          where: {
            id,
            retake_count: {
              [Op.ne]: null,
            },
          },
          transaction,
          returning: true,
        }
      );

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `result.service.js`,
        `updateResult`,
        `PUT`
      );
    }
  }

  static async updateStudentProgramme(id, data, transaction) {
    try {
      const result = await models.StudentProgramme.update(
        { ...data },
        { where: { id }, transaction, returning: true }
      );

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `result.service.js`,
        `updateStudentProgramme`,
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
  static async deleteResult(id, transaction) {
    try {
      const deleted = await models.Result.destroy({
        where: { id },
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `result.service.js`,
        `deleteResult`,
        `DELETE`
      );
    }
  }

  //  number  of sitting retake count
  static async studentRetakesByCourse(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from results_mgt.student_retake_by_course(${data.student_programme_id},
          ${data.course_id})`,
        {
          type: QueryTypes.SELECT,
          plain: true,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `result.service.js`,
        `studentRetakesByCourse`,
        `GET`
      );
    }
  }

  // student result by course
  static async studentResultByCourse(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from results_mgt.student_result_by_course(${data.student_programme_id},
          ${data.study_year_id},
          ${data.semester_id},
          ${data.course_id})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `result.service.js`,
        `studentResultByCourse`,
        `GET`
      );
    }
  }

  /**
   * GET PROGRAMME RESULTS
   *
   * @param {*} data
   * @returns
   */
  static async getProgrammeResults(programmeCode) {
    try {
      const filtered = await models.sequelize.query(
        `select 
          res.*
          from results_mgt.results as res
          left join programme_mgt.programme_version_course_units as pvcu on pvcu.id = res.programme_version_course_unit_id
          left join programme_mgt.course_units as cu on cu.id = pvcu.course_unit_id
          left join programme_mgt.programme_versions as pv on pv.id = pvcu.programme_version_id
          left join students_mgt.student_programmes as stpr on stpr.id = res.student_programme_id
          left join programme_mgt.programmes as prog on prog.id = pv.programme_id

          where 
          prog.programme_code = '${programmeCode}'
          and res.final_mark - floor(res.final_mark) > 0`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `result.service.js`,
        `getProgrammeResults`,
        `GET`
      );
    }
  }
}

module.exports = ResultService;
