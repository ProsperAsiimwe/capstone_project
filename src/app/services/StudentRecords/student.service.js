const models = require('@models');
const { map, isEmpty, flatten } = require('lodash');
const { QueryTypes } = require('sequelize');
const { Op } = require('sequelize');
const { regexFunction } = require('../helper/regexHelper');
const {
  sequelizeErrorHandler,
  middlewareSlackBot,
} = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for a student
class StudentService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all faculties or filtered using options param
   */
  static async findAllStudents(options) {
    try {
      const results = await models.Student.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `student.service.js`,
        `findAllStudents`,
        `GET`
      );
    }
  }

  /**
   * findAllStudentAcademicStatusRecords
   * @param {*} options
   */
  static async findAllStudentAcademicStatusRecords(options) {
    try {
      const results = await models.StudentProgrammeAcademicStatus.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `student.service.js`,
        `findAllStudentAcademicStatusRecords`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single student object basing on the options
   */
  static async findOneStudent(options) {
    try {
      const student = await models.Student.findOne({ ...options });

      return student;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `student.service.js`,
        `findOneStudent`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single student object basing on the options
   */
  static async findOneStudentProgramme(options) {
    try {
      const result = await models.StudentProgramme.findOne({ ...options });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `student.service.js`,
        `findOneStudentProgramme`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single student object basing on the options
   */
  static async findAllStudentProgrammes(options) {
    try {
      const result = await models.StudentProgramme.findAll({ ...options });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `student.service.js`,
        `findAllStudentProgrammes`,
        `GET`
      );
    }
  }

  /**
   * UPDATE STUDENT PROGRAMME USING ID
   *
   * @param  {object} data
   * @param {string} id  id of student object to be updated
   * @returns {Promise}
   * @description updates a single object
   *@
   */
  static async updateStudentProgramme(id, data, transaction) {
    try {
      const updated = await models.StudentProgramme.update(
        { ...data },
        { where: { id }, transaction, returning: true }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `student.service.js`,
        `updateStudentProgramme`,
        `PUT`
      );
    }
  }

  /**
   * UPDATE STUDENT PROGRAMME USING WHERE CLAUSE
   *
   * @param  {object} data
   * @param {string} id  id of student object to be updated
   * @returns {Promise}
   * @description updates a single object
   *@
   */
  static async update(clause, data, transaction) {
    try {
      const updated = await models.StudentProgramme.update(
        { ...data },
        { where: clause, transaction, returning: true }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(error, `student.service.js`, `update`, `PUT`);
    }
  }

  // duplicate studentProgrammes
  static async findDuplicateStudent(data) {
    try {
      const student = await models.StudentProgramme.findOne({
        where: {
          [Op.or]: [
            { student_number: data.student_number },
            { registration_number: data.registration_number },
          ],
        },
        raw: true,
      });

      return student;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `student.service.js`,
        `findDuplicateStudent`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single student object from data object
   *@
   */
  static async createStudent(data, transaction) {
    try {
      const newStudent = await models.Student.findOrCreate({
        where: {
          [Op.or]: [{ email: data.email }, { phone: data.phone }],
        },
        defaults: {
          ...data,
        },
        include: [
          {
            association: models.Student.admittedApplicants,
          },
        ],
        transaction,
      });

      return newStudent;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `student.service.js`,
        `createStudent`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a object from data object
   *@
   */
  static async createStudentProgramme(data, transaction) {
    try {
      const newStudent = await models.StudentProgramme.findOrCreate({
        where: {
          [Op.or]: [
            { student_number: data.student_number },
            { registration_number: data.registration_number },
          ],
        },
        defaults: {
          ...data,
        },
        include: [
          {
            association: models.StudentProgramme.approvals,
          },
          {
            association: models.StudentProgramme.studentSponsor,
          },
        ],
        transaction,
      });

      return newStudent;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `student.service.js`,
        `createStudentProgramme`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a object from data object
   *@
   */
  static async createStudentProgrammeByChangeOfProgramme(data, transaction) {
    try {
      const newStudent = await models.StudentProgramme.findOrCreate({
        where: {
          programme_id: data.programme_id,
          student_number: data.student_number,
          registration_number: data.registration_number,
        },
        defaults: {
          ...data,
        },
        include: [
          {
            association: models.StudentProgramme.approvals,
          },
          {
            association: models.StudentProgramme.studentSponsor,
          },
        ],
        transaction,
      });

      return newStudent;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `student.service.js`,
        `createStudentProgrammeByChangeOfProgramme`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} data
   */
  static async createAcademicStatus(data, transaction) {
    try {
      const academicStatus =
        await models.StudentProgrammeAcademicStatus.findOrCreate({
          where: {
            student_programme_id: data.student_programme_id,
            academic_year_id: data.academic_year_id,
            student_academic_status_id: data.student_academic_status_id,
          },
          defaults: {
            ...data,
          },
          transaction,
        });

      return academicStatus;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `student.service.js`,
        `createAcademicStatus`,
        `POST`
      );
    }
  }

  /** updateStudentWithTransaction
   *
   * @param {*} id
   * @param {*} data
   * @param {*} transaction
   */
  static async updateStudentWithTransaction(id, data, transaction) {
    try {
      const updated = await models.Student.update(
        { ...data },
        { where: { id }, transaction, returning: true }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `student.service.js`,
        `updateStudentWithTransaction`,
        `PUT`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of student object to be updated
   * @returns {Promise}
   * @description updates a single student object
   *@
   */
  static async updateStudent(id, data, rest) {
    try {
      const updated = await models.Student.update(
        { ...data },
        { where: { id }, returning: true },
        rest
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `student.service.js`,
        `updateStudent`,
        `PUT`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of student object to be updated
   * @returns {Promise}
   * @description updates a single student object
   *@
   */
  static async createStudentApplication(data, transaction) {
    try {
      const updated = await models.StudentApplication.create(data, {
        transaction,
      });

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `student.service.js`,
        `createStudentApplication`,
        `PUT`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of student object to be updated
   * @returns {Promise}
   * @description updates a single student object
   *@
   */
  static async destroyStudentApplication(options) {
    try {
      const res = await models.StudentApplication.destroy(options);

      return res;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `student.service.js`,
        `destroyStudentApplication`,
        `DELETE`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of student object to be updated
   * @returns {Promise}
   * @description updates a single student object
   *@
   */
  static async findOneStudentApplication(options) {
    try {
      const res = await models.StudentApplication.findOne(options);

      return res;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `student.service.js`,
        `findOneStudentApplication`,
        `GET`
      );
    }
  }

  /**
   * @param {string} id  id of student object to be deleted
   * @returns {Promise}
   * @description deletes a single student object
   *@
   */
  static async deleteStudent(id) {
    try {
      const deleted = await models.Student.destroy({
        where: { id },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `student.service.js`,
        `deleteStudent`,
        `DELETE`
      );
    }
  }

  /**
   * @param {string} id  id of student object to be deleted
   * @returns {Promise}
   * @description deletes a single student object
   *@
   */
  static async destroy(options) {
    try {
      const deleted = await models.Student.destroy(options);

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `student.service.js`,
        `destroy`,
        `DELETE`
      );
    }
  }

  /**
   * fetch students by context
   */
  static async findStudentsByContext(data) {
    try {
      await regexFunction(data);

      const filtered = await models.sequelize.query(
        `select *
        from  students_mgt.student_context_function(${data.campus_id},${data.academic_year_id},${data.intake_id},${data.programme_id})
        where is_current_programme = true 
        order by surname asc`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `student.service.js`,
        `findStudentsByContext`,
        `GET`
      );
    }
  }

  /**
   * fetch students by Programme and entry academic year
   */
  static async findStudentsByProgAndAcadYear(data) {
    try {
      await regexFunction(data);

      const filtered = await models.sequelize.query(
        `select *
        from  students_mgt.students_by_prog_and_acad_year(${data.academic_year_id},${data.programme_id})
        order by surname asc`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `student.service.js`,
        `findStudentsByProgAndAcadYear`,
        `GET`
      );
    }
  }

  /**
   * Update Students Prog Versions
   */
  static async updateStudentProgrammeVersions(data) {
    try {
      await regexFunction(data);

      const filtered = await models.sequelize.query(
        `update students_mgt.student_programmes set programme_version_id = ${data.version_id} 
        where programme_id = ${data.programme_id} and entry_academic_year_id = ${data.academic_year_id}`,
        {
          type: QueryTypes.UPDATE,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `student.service.js`,
        `updateStudentProgrammeVersions`,
        `PUT`
      );
    }
  }

  /**
   * Update Students Account Status
   */
  static async updateStudentsAccountStatus(id, data, transaction) {
    try {
      const updated = await models.Student.update(
        {
          student_account_status_id: data.student_account_status_id,
        },
        {
          where: { id },
          transaction,
          returning: true,
        }
      );

      await models.StudentAccountStatus.create(data, {
        transaction,
      });

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `student.service.js`,
        `updateStudentsAccountStatus`,
        `PUT`
      );
    }
  }

  /**
   * FIND Student by RegNo or StudentNo;
   *
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single Student object basing on the options
   */
  static async findByRegNoOrStudentNo(data, extra = {}) {
    try {
      const student = await models.StudentProgramme.findOne({
        where: {
          [Op.or]: [{ registration_number: data }, { student_number: data }],
        },
        raw: true,
        ...extra,
      });

      return student;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `student.service.js`,
        `findByRegNoOrStudentNo`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} extra
   * @returns
   */
  static async findActiveStudentProgramme(data, extra = {}) {
    try {
      const student = await models.StudentProgramme.findOne({
        where: {
          [Op.or]: [{ registration_number: data }, { student_number: data }],
          is_current_programme: true,
        },
        raw: true,
        ...extra,
      });

      return student;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `student.service.js`,
        `findActiveStudentProgramme`,
        `GET`
      );
    }
  }

  /**
   * GET ACTIVE RESULT STUDENT PROGRAMME DETAILS WITH PASS MARK
   *
   * @param {*} data
   * @returns
   */
  static async getResultActiveStudentProgrammeDetails(studentOrRegNumber) {
    try {
      const filtered = await models.sequelize.query(
        `
        select 
        stpr.id,
        stdypol.all_entry_academic_years,
        stpr.programme_id,
        prog.programme_code,
        prog.programme_study_level_id,
        prog.is_modular,
        stpr.is_current_programme,
        prog.programme_duration,
        durationMeasure.metadata_value as duration_measure,
        prog.duration_measure_id,
        stpr.programme_version_id,
        stpr.campus_id,
        stpr.intake_id,
        stpr.student_number,
        stpr.registration_number,
        CASE
        WHEN stdypol.all_entry_academic_years = true THEN stdypol.pass_mark
        ELSE 
        (select pass_mark from institution_policy_mgt.pass_mark_policy_academic_years as acyrpol where acyrpol.academic_year_id = stpr.entry_academic_year_id and acyrpol.pass_mark_policy_id = stdypol.id limit 1)
        END as pass_mark,
        stdylev.metadata_value as study_level,
        entyacy.metadata_value as entry_academic_year,
        stpr.on_provisional_list,
        stpr.on_graduation_list
        from students_mgt.student_programmes as stpr
        left join programme_mgt.programmes as prog on prog.id = stpr.programme_id
        left join app_mgt.metadata_values as stdylev on stdylev.id = prog.programme_study_level_id
        left join app_mgt.metadata_values as entyacy on entyacy.id = stpr.entry_academic_year_id
        left join app_mgt.metadata_values as durationMeasure on durationMeasure.id = prog.duration_measure_id
        left join institution_policy_mgt.study_level_pass_mark_policies as stdypol on prog.programme_study_level_id = stdypol.programme_study_level_id
        where stpr.is_current_programme = true
        and (stpr.student_number = '${studentOrRegNumber}' or stpr.registration_number = '${studentOrRegNumber}')
        limit 1
        `,
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
        `getStudentProgrammePassMark`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @returns
   */
  static async findDuplicateStudentRecord(data) {
    try {
      const student = await models.Student.findOne({
        where: {
          [Op.or]: [{ email: data.email }, { phone: data.phone }],
        },
        attributes: {
          exclude: ['password'],
        },
        raw: true,
      });

      return student;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `student.service.js`,
        `findDuplicateStudentRecord`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @returns
   */
  static async findDuplicateStudentProgrammeRecord(data) {
    try {
      const student = await models.StudentProgramme.findOne({
        where: {
          [Op.or]: [
            { registration_number: data.registration_number },
            { student_number: data.student_number },
          ],
        },
        raw: true,
      });

      return student;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `student.service.js`,
        `findDuplicateStudentProgrammeRecord`,
        `GET`
      );
    }
  }

  static async findOneStudentByRegNoOrStudentNoContext(options) {
    try {
      const student = await models.Student.findOne({
        ...options,
      });

      return student;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `student.service.js`,
        `findOneStudentByRegNoOrStudentNoContext`,
        `GET`
      );
    }
  }

  /**
   * UPDATE Student table;
   *
   * @param  {object} data id of Student object to be updated
   * @returns {Promise}
   * @description updates a single Student object
   *@
   */
  static async updateStudentCredentials(id, data) {
    try {
      const updated = await models.Student.update(
        { ...data },
        { where: { id }, returning: true, excludes: ['password'], raw: true }
      )
        .then((resp) => resp[1][0])
        .catch((err) => {
          throw new Error(err.message);
        });

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `student.service.js`,
        `updateStudentCredentials`,
        `PUT`
      );
    }
  }

  /**
   * UPDATE Student password basing on the id;
   *
   * @param  {object} data id of Student object to be updated
   * @returns {Promise}
   * @description updates a single Student object
   *@
   */
  static async changePassword(id, data) {
    try {
      const updated = await models.Student.update(
        { ...data },
        {
          where: { id },
          returning: true,
          excludes: ['password'],
        }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `student.service.js`,
        `changePassword`,
        `PUT`
      );
    }
  }

  /**
   * students function
   *
   *
   * '%${value}%'
   */

  static async findStudentByRegistrationOrStudentNumber(data, req) {
    try {
      await regexFunction(data);

      const filtered = await models.sequelize.query(
        `select *
        from  students_mgt.students_by_std_or_reg('${data.student}');`,
        {
          type: QueryTypes.SELECT,
        }
      );

      let response;

      if (!isEmpty(filtered)) {
        const [studentRecord] = filtered;
        const academicRecords = flatten(map(filtered, 'academic_records'));

        response = {
          ...studentRecord,
          academic_records: academicRecords,
        };
      }

      return response;
    } catch (error) {
      await middlewareSlackBot(req, error.message);
    }
  }

  // student by id

  static async findStudentById(studentId) {
    try {
      await regexFunction(studentId);

      const filtered = await models.sequelize.query(
        `select *
        from  students_mgt.students_by_id(${studentId})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `student.service.js`,
        `findStudentById`,
        `GET`
      );
    }
  }

  // Student Academic Records

  static async findStudentAcademicRecords(studentId) {
    try {
      const filtered = await models.sequelize.query(
        `select *
        from  students_mgt.student_programme_function(${studentId})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `student.service.js`,
        `findStudentAcademicRecords`,
        `GET`
      );
    }
  }

  // student by id, registration and student number

  static async findStudentByIdAndStudentAndRegistration(data) {
    try {
      const filtered = await models.sequelize.query(
        `select *
        from  students_mgt.students_by_id_and_std_and_reg(${data.student_id},'${data.registration_number}','${data.student_number}')`,
        {
          type: QueryTypes.SELECT,
          plain: true,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `student.service.js`,
        `findStudentByIdAndStudentAndRegistration`,
        `GET`
      );
    }
  }

  /**
   *  SAVE LOG FOR DELETED STUDENT RECORD
   *
   * @param {*} option
   * @returns JSON
   */
  static async createDeleteSRMStudentLog(option) {
    try {
      const result = await models.DeletedSRMStudentLog.create(option);

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `student.service.js`,
        `createDeleteSRMStudentLog`,
        `POST`
      );
    }
  }
}

module.exports = StudentService;
