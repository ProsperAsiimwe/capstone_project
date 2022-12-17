const models = require('@models');
const { QueryTypes } = require('sequelize');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// by Search student records
class StudentRecordsService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description registration number
   */
  static async findStudentByRegistrationNumber(value) {
    try {
      const filtered = await models.sequelize.query(
        `select *
        from  students_mgt.student_registration_number_function('%${value}%')
        where is_current_programme = true`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `studentsRecords.service.js`,
        `findStudentByRegistrationNumber`,
        `GET`
      );
    }
  }

  // by student number
  static async findStudentByStudentNumber(value) {
    try {
      const filtered = await models.sequelize.query(
        `select *
        from  students_mgt.student_by_student_number_function('%${value}%')
        where is_current_programme = true`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `studentsRecords.service.js`,
        `findStudentByStudentNumber`,
        `GET`
      );
    }
  }

  // by student name
  static async findStudentByName(value) {
    try {
      const filtered = await models.sequelize.query(
        `select *
        from  students_mgt.student_by_name_function('%${value}%')
        where is_current_programme = true`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `studentsRecords.service.js`,
        `findStudentByName`,
        `GET`
      );
    }
  }

  // student_by_full_name_function

  static async findStudentByFullName(value) {
    try {
      const filtered = await models.sequelize.query(
        `select *
        from  students_mgt.student_by_full_name_function('%${value}%')
        where is_current_programme = true`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `studentsRecords.service.js`,
        `findStudentByFullName`,
        `GET`
      );
    }
  }

  //  by email
  static async findStudentByEmail(value) {
    try {
      const filtered = await models.sequelize.query(
        `select *
        from  students_mgt.student_by_email_function('%${value}%')
        where is_current_programme = true`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `studentsRecords.service.js`,
        `findStudentByEmail`,
        `GET`
      );
    }
  }

  // by phone
  static async findStudentByPhone(value) {
    try {
      const filtered = await models.sequelize.query(
        `select *
        from  students_mgt.student_by_phone_function('%${value}%')
        where is_current_programme = true`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `studentsRecords.service.js`,
        `findStudentByPhone`,
        `GET`
      );
    }
  }
  // programme details

  static async programmeDetailsFunction(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from programme_mgt.programme_details_function(${data.id})`,
        {
          type: QueryTypes.SELECT,
          plain: true,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `studentsRecords.service.js`,
        `programmeDetailsFunction`,
        `GET`
      );
    }
  }

  /**
   * GET STUDENT PROGRAMME DISSERTATIONS
   *
   * @param {*} data
   * @returns
   */
  static async getStudentProgrammeDissertations(data) {
    try {
      const filtered = await models.sequelize.query(
        `SELECT 
          diss.id,
          std.surname,
          std.other_names,
          diss.student_programme_id,
          diss.batch_number,
          diss.title,
          diss.description,
          diss.created_by_id,
          stp.student_number,
          stp.registration_number,
          prog.programme_title,
          prog.programme_code,
          concat(us.surname, ' ', us.other_names) as created_by,
          diss.created_at,
          diss.updated_at
          FROM students_mgt.student_programme_dissertations as diss
          left join students_mgt.student_programmes as stp on stp.id = diss.student_programme_id
          left join students_mgt.students as std on stp.student_id = std.id
          left join programme_mgt.programmes as prog on prog.id = stp.programme_id
          left join user_mgt.users as us on us.id = diss.created_by_id
          ${data}
          order by diss.created_at desc`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `studentsRecords.service.js`,
        `getStudentProgrammeDissertations`,
        `GET`
      );
    }
  }
}

module.exports = StudentRecordsService;
