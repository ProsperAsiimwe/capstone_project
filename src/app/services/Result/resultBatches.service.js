const models = require('@models');
const { QueryTypes } = require('sequelize');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for this entity
class ResultBatchesService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all records or filtered using options param
   */
  static async findAllBatchResults(options) {
    try {
      const records = await models.ResultBatch.findAll({
        ...options,
      });

      return records;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `resultBatches.service.js`,
        `findAllBatchResults`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all records or filtered using options param
   */
  static async findOneBatchResult(options) {
    try {
      const records = await models.ResultBatch.findOne({
        ...options,
      });

      return records;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `resultBatches.service.js`,
        `findOneBatchResult`,
        `GET`
      );
    }
  }

  // batches by year
  static async batchesByYear(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from results_mgt.result_batch_by_year(${data.userId},${data.upload_year})
          `,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `resultBatches.service.js`,
        `batchesByYear`,
        `GET`
      );
    }
  }

  // batches by range

  static async batchesByRange(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from results_mgt.result_batch_function(${data.userId},'${data.date_from}','${data.date_to}')
          `,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `resultBatches.service.js`,
        `batchesByRange`,
        `GET`
      );
    }
  }

  //  search result batches

  // static async batchesByRange(data) {
  //   try {
  //     const filtered = await models.sequelize.query(
  //       `select * from results_mgt.result_batch_function(${data.userId},'${data.date_from}','${data.date_to}')
  //         `,
  //       {
  //         type: QueryTypes.SELECT,
  //       }
  //     );

  //     return filtered;
  //   } catch (error) {
  //     await sequelizeErrorHandler(
  //       error,
  //       `resultBatches.service.js`,
  //       `batchesByRange`,
  //       `GET`
  //     );
  //   }
  // }

  //  results_mgt.result_batch_approval..

  static async resultBatchApproval(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from results_mgt.result_batch_approval('${data.date_from}',
          '${data.date_to}',${data.departmentId})
          `,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `resultBatches.service.js`,
        `searchUserResultBatch`,
        `GET`
      );
    }
  }

  //  result courses

  static async approvalPublishCourses(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from results_mgt.approval_publish_courses(${data.campus_id},
          ${data.study_year_id},${data.academic_year_id},${data.semester_id},${data.programme_id})
          `,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `resultBatches.service.js`,
        `searchUserResultBatch`,
        `GET`
      );
    }
  }

  static async approvalPublishCoursesSubmit(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from results_mgt.approval_publish_courses(${data.campus_id},
          ${data.study_year_id},${data.academic_year_id},${data.semester_id},${data.programme_id})
          where created_by_id =${data.userId}
          `,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `resultBatches.service.js`,
        `searchUserResultBatch`,
        `GET`
      );
    }
  }

  // approvalPublishResults

  static async approvalPublishResultsSubmit(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from results_mgt.approval_publish_results(${data.campus_id},
          ${data.study_year_id},${data.academic_year_id},${data.semester_id},${data.programme_id},${data.course_id})
          where created_by_id = ${data.userId}
          order by is_submitted
          -- and is_submitted = false
          `,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `resultBatches.service.js`,
        `searchUserResultBatch`,
        `GET`
      );
    }
  }

  static async approvalPublishResultsApprove(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from results_mgt.approval_publish_results(${data.campus_id},
          ${data.study_year_id},${data.academic_year_id},${data.semester_id},${data.programme_id},${data.course_id})
          where is_submitted = true 
          order by create_approval_status
          --and create_approval_status ='PENDING'
          `,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `resultBatches.service.js`,
        `searchUserResultBatch`,
        `GET`
      );
    }
  }
  static async approvalPublishResultsPublish(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from results_mgt.approval_publish_results(${data.campus_id},
          ${data.study_year_id},${data.academic_year_id},${data.semester_id},${data.programme_id},${data.course_id})
          where is_submitted = true and create_approval_status ='APPROVED' 
          order by is_published
          --and is_published = false
          `,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `resultBatches.service.js`,
        `searchUserResultBatch`,
        `GET`
      );
    }
  }

  //  result_batch_approval

  static async searchUserResultBatch(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from results_mgt.search_result_batch(${data.semester},${data.academicYear},${data.studyYear},
          ${data.campus},${data.intake}, '${data.course}')
          where uploaded_by_id = ${data.userId} or created_by_id = ${data.userId}
        order by created_at
          `,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `resultBatches.service.js`,
        `searchUserResultBatch`,
        `GET`
      );
    }
  }

  // resultsByBatch

  static async resultsByBatch(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from results_mgt.batch_student_result(${data.userId},'${data.batch}')
        order by surname,other_names
          `,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `resultBatches.service.js`,
        `resultsByBatch`,
        `GET`
      );
    }
  }

  /**
   * @param {string} id  id of record object to be deleted
   * @returns {Promise}
   * @description deletes a single record object
   */
  static async deleteBatchResults(id, transaction) {
    try {
      const deleted = await models.ResultBatch.destroy({
        where: { id },
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `resultBatches.service.js`,
        `deleteBatchResults`,
        `DELETE`
      );
    }
  }

  // update
  static async updateResultBatchesApproval(id, data, transaction) {
    try {
      const result = await models.ResultBatch.update(
        { ...data },
        { where: { id }, transaction, returning: true }
      );

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `resultBatches.service.js`,
        `updateResultBatchesApproval`,
        `PUT`
      );
    }
  }
}

module.exports = ResultBatchesService;
