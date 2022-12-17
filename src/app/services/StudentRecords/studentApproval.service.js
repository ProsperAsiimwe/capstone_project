const models = require('@models');
const { QueryTypes } = require('sequelize');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for a semester
class StudentApprovalService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all faculties or filtered using options param
   */
  static async findAllStudentApprovals(options) {
    try {
      const result = await models.StudentApproval.findAll({
        ...options,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `studentApproval.service.js`,
        `findAllStudentApprovals`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single semester object basing on the options
   */
  static async findOneStudentApproval(options) {
    try {
      const result = await models.StudentApproval.findOne({
        ...options,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `studentApproval.service.js`,
        `findOneStudentApproval`,
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
  static async createStudentApproval(data, transaction) {
    try {
      const result = await models.StudentApproval.create({
        ...data,
        transaction,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `studentApproval.service.js`,
        `createStudentApproval`,
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
  static async updateStudentApproval(id, data, transaction) {
    try {
      const result = await models.StudentApproval.update(
        { ...data },
        { where: { id }, transaction, returning: true }
      );

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `studentApproval.service.js`,
        `updateStudentApproval`,
        `PUT`
      );
    }
  }

  /**
   *
   * @param {*} id
   * @param {*} data
   */
  static async updateStudent(id, data, transaction) {
    try {
      const result = await models.Student.update(
        { ...data },
        { where: { id }, transaction, returning: true }
      );

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `studentApproval.service.js`,
        `updateStudent`,
        `PUT`
      );
    }
  }

  /**
   *
   * @param {*} id
   * @param {*} data
   */
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
        `studentApproval.service.js`,
        `updateStudentProgramme`,
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
  static async deleteStudentApproval(option) {
    try {
      const result = await models.StudentApproval.destroy(option);

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `studentApproval.service.js`,
        `deleteStudentApproval`,
        `DELETE`
      );
    }
  }

  /**
   * uploaded students
   * grouped by batch number
   */
  static async uploadedStudentsApproval() {
    try {
      const result = await models.sequelize.query(
        `select *
        from  students_mgt.uploaded_students_view
        order by uploaded_at DESC,batch_number DESC`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `studentApproval.service.js`,
        `uploadedStudentsApproval`,
        `GET`
      );
    }
  }

  // function to fetch upload students by batch
  static async uploadedStudentsByBatchNumber(data) {
    try {
      const result = await models.sequelize.query(
        `select *
        from  students_mgt.uploaded_student_by_batch_number_function('${data.batchNumber}')
        order by create_approval_status,create_approval_date DESC,
        campus,entry_academic_year_id DESC,intake,entry_study_year,
        surname,other_names`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `studentApproval.service.js`,
        `uploadedStudentsByBatchNumber`,
        `GET`
      );
    }
  }

  // batch filtering

  /**
   *
   * student batches by date
   */

  // all
  static async studentsBatchByDate(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from students_mgt.student_batch_by_date('${data.date_from}',
          '${data.date_to}')
            order by uploaded_at DESC,batch_number DESC
            `,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `studentApproval.service.js`,
        `studentsBatchByDate`,
        `GET`
      );
    }
  }

  // Approved

  static async batchesByDateApproved(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from students_mgt.student_batch_by_date('${data.date_from}',
          '${data.date_to}')
           where approval_status = 'APPROVED'
          order by uploaded_at DESC,batch_number DESC
           
            `,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `studentApproval.service.js`,
        `batchesByDateApproved`,
        `GET`
      );
    }
  }

  // NOT approved

  static async batchesByDateNotApproved(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from students_mgt.student_batch_by_date('${data.date_from}',
          '${data.date_to}')
          where approval_status = 'NOT APPROVED' or
             approval_status = 'PARTIALLY APPROVED'
            order by uploaded_at DESC,batch_number DESC
            
            `,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `studentApproval.service.js`,
        `batchesByDateNotApproved`,
        `GET`
      );
    }
  }

  // user

  static async studentsBatchByUser(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from students_mgt.student_batch_by_user(${data.userId},
          '${data.date_from}',
          '${data.date_to}')
            order by uploaded_at DESC,batch_number DESC
            `,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `studentApproval.service.js`,
        `studentsBatchByUser`,
        `GET`
      );
    }
  }

  // approved
  static async batchByUserApproved(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from students_mgt.student_batch_by_user(${data.userId},
          '${data.date_from}',
          '${data.date_to}')
          where approval_status = 'APPROVED'
            order by uploaded_at DESC,batch_number DESC
            `,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `studentApproval.service.js`,
        `batchByUserApproved`,
        `GET`
      );
    }
  }

  // not approved

  static async batchByUserNotApproved(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from students_mgt.student_batch_by_user(${data.userId},
          '${data.date_from}',
          '${data.date_to}')
           where approval_status = 'NOT APPROVED' or
             approval_status = 'PARTIALLY APPROVED'
            order by uploaded_at DESC,batch_number DESC
            `,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `studentApproval.service.js`,
        `batchByUserNotApproved`,
        `GET`
      );
    }
  }

  // students_mgt.upload_users_view

  static async uploadUsers() {
    try {
      const filtered = await models.sequelize.query(
        `select * from students_mgt.upload_users_view`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `studentApproval.service.js`,
        `uploadUsers`,
        `GET`
      );
    }
  }

  // students_mgt.change_programme_pending(academic_year bigint

  static async changeProgrammePending(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from students_mgt.change_programme_pending(${data.academic_year_id})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `studentApproval.service.js`,
        `changeProgrammePending`,
        `GET`
      );
    }
  }
}

module.exports = StudentApprovalService;
