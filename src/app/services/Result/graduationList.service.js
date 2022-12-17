const models = require('@models');
const { QueryTypes } = require('sequelize');
const { regexFunction } = require('../helper/regexHelper');
// const errorFunction = require('../helper/errorHelper');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');
const { isArray } = require('lodash');
const ResultService = require('./result.service');

// This Class is responsible for handling all database interactions for this entity
class GraduationListService {
  // graduation list by load

  static async studentByGraduationLoad(data) {
    try {
      const filtered = await models.sequelize.query(
        `select stp.student_id,stp.student_programme_id,stp.student_number,stp.registration_number,
    surname,other_names,gender,student_account_status,programme_id,programme_title,programme_code,
    programme_type_id,has_completed,is_current_programme,
    graduation_load,student_entry_year,
    entry_academic_year,
    total_credit_units, 
    case when srt.semester_scores is null then '[]'::json
    else srt.semester_scores 
    end as semester_scores
   from results_mgt.student_grad_list(${data.campus_id},${data.intake_id},
          ${data.programme_id}) as stp
          left join  results_mgt.graduation_cgpa(${data.campus_id},${data.intake_id},
          ${data.programme_id}) as srt
          on srt.student_programme_id = stp.student_programme_id
          `,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `graduationList.service.js`,
        `studentByGraduationLoad`,
        `GET`
      );
    }
  }

  // search single student

  static async searchSingleStudent(data) {
    try {
      await regexFunction(data);

      const filtered = await models.sequelize.query(
        `select * from results_mgt.single_student_search('${data.student}',${data.campus_id},${data.intake_id})`,
        {
          type: QueryTypes.SELECT,
          plain: true,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `graduationList.service.js`,
        `searchSingleStudent`,
        `GET`
      );
    }
  }

  //  find student

  static async findStudentByRegNo(data) {
    try {
      await regexFunction(data);
      const filtered = await models.sequelize.query(
        `select * from results_mgt.find_student('${data.student}')`,
        {
          type: QueryTypes.SELECT,
          plain: true,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `graduationList.service.js`,
        `findStudentByRegNo`,
        `GET`
      );
    }
  }

  /// version grad load

  static async entryYearGraduationLoad(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from results_mgt.version_grad_load(${data.programme_version_id},${data.student_entry_year_id})`,
        {
          type: QueryTypes.SELECT,
          plain: true,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `graduationList.service.js`,
        `entryYearGraduationLoad`,
        `GET`
      );
    }
  }

  // graduation load plan

  static async planGraduationLoad(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from results_mgt.version_plan_load(${data.programme_version_id},${data.programme_version_plan_id})`,
        {
          type: QueryTypes.SELECT,
          plain: true,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `graduationList.service.js`,
        `planGraduationLoad`,
        `GET`
      );
    }
  }

  // version core courses

  static async versionCoreCourse(data) {
    try {
      await regexFunction(data);

      const filtered = await models.sequelize.query(
        `select * from results_mgt.version_core_courses(${data.programme_version_id})
        where course_unit_year >= '${data.student_entry_year}' `,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `graduationList.service.js`,
        `versionCoreCourse`,
        `GET`
      );
    }
  }

  // single student Grad.

  static async testimonialResultsFunction(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from results_mgt.testimonial_results('${data.student}')`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `graduationList.service.js`,
        `testimonialResultsFunction`,
        `GET`
      );
    }
  }

  // student_result_function

  static async studentResultsFunction(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from results_mgt.student_result_function('${data.student}')
        order by programme_study_year ASC,
        semester ASC`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `graduationList.service.js`,
        `studentResultsFunction`,
        `GET`
      );
    }
  }
  // student_result_semester_function with semester dates

  static async studentResultsSemesterFunction(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from results_mgt.student_result_semester_function('${data.student}')
        order by programme_study_year ASC,
        semester ASC`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `graduationList.service.js`,
        `studentResultsSemesterFunction`,
        `GET`
      );
    }
  }
  // max study year

  static async maxProgrammeStudyYear(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from programme_mgt.study_year_by_programme(${data.programme_id})`,
        {
          type: QueryTypes.SELECT,
          plain: true,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `graduationList.service.js`,
        `maxProgrammeStudyYear`,
        `GET`
      );
    }
  }

  // probational Graduation List

  static async graduationDraftList(data) {
    try {
      const academicYear = await models.sequelize.query(
        `select id, metadata_id,metadata_value
        from app_mgt.metadata_values where id =${data.academic_year}
          `,
        {
          type: QueryTypes.SELECT,
          plain: true,
        }
      );

      const filtered = await models.sequelize.query(
        `select * from results_mgt.probational_graduation_list(${data.campus_id},${data.intake_id},
          ${data.programme_id},${data.finalYearContext},${data.finalYearMetadata},'${academicYear.metadata_value}')

          where result_cores >= version_cores 
          `,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `graduationList.service.js`,
        `graduationDraftList`,
        `GET`
      );
    }
  }

  //
  static async fetchToProvisional(data) {
    try {
      const academicYear = await models.sequelize.query(
        `select id, metadata_id,metadata_value
        from app_mgt.metadata_values where id =${data.academic_year}
          `,
        {
          type: QueryTypes.SELECT,
          plain: true,
        }
      );

      const filtered = await models.sequelize.query(
        `select * from results_mgt.probational_graduation_list(${data.campus_id},${data.intake_id},
          ${data.programme_id},${data.finalYearContext},${data.finalYearMetadata},'${academicYear.metadata_value}')
          `,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `graduationList.service.js`,
        `fetchToProvisional`,
        `GET`
      );
    }
  }

  //  programme entry years loads

  static async entryYearLoads(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from results_mgt.version_graduation_loads(${data.programme_id})
          `,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `graduationList.service.js`,
        `entryYearLoads`,
        `GET`
      );
    }
  }
  // plan graduation loads

  static async planGraduationLoads(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from results_mgt.plan_graduation_loads(${data.programme_id})
          `,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `graduationList.service.js`,
        `planGraduationLoads`,
        `GET`
      );
    }
  }

  // generate provisional list

  static async generateProvisionalList(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from results_mgt.generate_provisional_list(${data.campus_id},${data.intake_id},
          ${data.programme_id},${data.finalYearContext},${data.finalYearMetadata},'${data.academic_year}')
          `,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `graduationList.service.js`,
        `generateProvisionalList`,
        `GET`
      );
    }
  }

  // provisional grad list

  static async graduationProvisionalList(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from results_mgt.provisional_grad_list(${data.campus_id},${data.intake_id},
          ${data.programme_id},${data.finalYearMetadata},'${data.academicYearData.metadata_value}')
          order by surname`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `graduationList.service.js`,
        `graduationProvisionalList`,
        `GET`
      );
    }
  }

  // search student on list

  static async searchStudentProvisionalList(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from results_mgt.search_student_provisional_list('${data.student}')
          `,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `graduationList.service.js`,
        `searchStudentProvisionalList`,
        `GET`
      );
    }
  }
  // graduation list

  static async graduationList(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from results_mgt.graduation_list_by_programme(${data.intake_id},${data.campus_id},
          ${data.programme_id},${data.academic_year_id})  order by surname
          `,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `graduationList.service.js`,
        `graduationList`,
        `GET`
      );
    }
  }

  // graduated students data

  static async graduationData(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from results_mgt.graduation_data(${data.intake_id},${data.campus_id},
          ${data.programme_id},${data.academic_year_id})
          `,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `graduationList.service.js`,
        `graduationData`,
        `GET`
      );
    }
  }
  // generate student gpa

  static async generateStudentGPA(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from results_mgt.graduation_student_cgpa(${data.campus_id},${data.intake_id},
          ${data.programme_id})
          `,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `graduationList.service.js`,
        `generateStudentGPA`,
        `GET`
      );
    }
  }

  // student list

  static async generateGpaStudentList(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from results_mgt.generate_grade_points(${data.campus_id},${data.intake_id},
          ${data.programme_id},${data.study_year_id})
          `,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `graduationList.service.js`,
        `generateGpaStudentList`,
        `GET`
      );
    }
  }

  // generate student grade by offset

  static async generateGradesByOffSet(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from results_mgt.generate_points_pagination(${data.campus_id},${data.intake_id},
          ${data.programme_id},${data.study_year_id},${data.offset_value},${data.limit_value})
          `,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `graduationList.service.js`,
        `generateGradesByOffSet`,
        `GET`
      );
    }
  }

  // gpa_student_list

  static async gpaStudentList(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from results_mgt.gpa_student_list(${data.campus_id},${data.intake_id},
          ${data.programme_id},${data.study_year_id})
          `,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `graduationList.service.js`,
        `gpaStudentList`,
        `GET`
      );
    }
  }

  // department_by_school
  static async departmentsBySchool(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from results_mgt.department_by_school(${data.faculty_id})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `graduationList.service.js`,
        `departmentsBySchool`,
        `GET`
      );
    }
  }

  // programmes_by_department
  static async programmesByDepartment(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from results_mgt.programmes_by_department(${data.department_id})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `graduationList.service.js`,
        `programmesByDepartment`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async createProvisionalGraduationList(data, studentName, transaction) {
    try {
      const record = await models.ProvisionalGraduationList.findOne({
        where: {
          student_programme_id: data.student_programme_id,
          academic_year_id: data.academic_year_id,
        },
      }).then(function (obj) {
        // update
        if (obj) return obj.update(data, { transaction });

        // insert
        return models.ProvisionalGraduationList.create(data, { transaction });
      });

      return record;
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error(
          `Student: ${studentName} Has Already Been Pushed To This Context's Provisional Graduation List.`
        );
      } else {
        await sequelizeErrorHandler(
          error,
          `graduationList.service.js`,
          `createProvisionalGraduationList`,
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
  static async destroyProvisionalGraduationList(condition, transaction) {
    try {
      const record = await models.ProvisionalGraduationList.destroy({
        where: condition,
        transaction,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `graduationList.service.js`,
        `destroyProvisionalGraduationList`,
        `DELETE`
      );
    }
  }

  /**
   * DELETE FROM FINAL PROVISIONAL LIST
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async destroyFinalGraduationList(condition, transaction) {
    try {
      const record = await models.GraduationList.destroy({
        where: condition,
        transaction,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `graduationList.service.js`,
        `destroyProvisionalGraduationList`,
        `DELETE`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async createFinalGraduationList(data, studentName, transaction) {
    try {
      const record = await models.GraduationList.findOrCreate({
        where: {
          provisional_list_id: data.provisional_list_id,
        },
        defaults: {
          ...data,
        },
        transaction,
      });

      return record;
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error(
          `Student: ${studentName} Has Already Been Pushed To Thi Context's Provisional Graduation List.`
        );
      } else {
        await sequelizeErrorHandler(
          error,
          `graduationList.service.js`,
          `createFinalGraduationList`,
          `POST`
        );
      }
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single record object basing on the options
   */
  static async fetchFinalGraduationList(options) {
    try {
      const record = await models.GraduationList.findOne({
        ...options,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `graduationList.service.js`,
        `fetchFinalGraduationList`,
        `GET`
      );
    }
  }

  /**
   * FINAL GRADUATION LIST
   *
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single record object basing on the options
   */
  static async allFinalGraduationList(options) {
    try {
      const record = await models.GraduationList.findAll({
        ...options,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `graduationList.service.js`,
        `allFinalGraduationList`,
        `GET`
      );
    }
  }

  //   results_mgt.graduation_list_function(student bigint)
  static async fetchStudentFinalGraduation(data) {
    try {
      const record = await models.sequelize.query(
        `select * from results_mgt.graduation_list_function(${data.student_programme_id})`,
        {
          type: QueryTypes.SELECT,
          plain: true,
        }
      );

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `graduationList.service.js`,
        `fetchStudentFinalGraduation`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single record object basing on the options
   */
  static async updateFinalGraduationList(id, data, transaction) {
    try {
      const records = await models.GraduationList.update(
        { ...data },
        { where: { id }, transaction, returning: true }
      );

      return records;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `graduationList.service.js`,
        `updateFinalGraduationList`,
        `PUT`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single record object basing on the options
   */
  static async updateFinalGraduationListWithConstraints(
    constraints,
    data,
    transaction
  ) {
    try {
      const records = await models.GraduationList.update(
        { ...data },
        {
          where: constraints,
          transaction,
          returning: true,
        }
      );

      return records;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `graduationList.service.js`,
        `updateFinalGraduationListWithConstraints`,
        `PUT`
      );
    }
  }

  /**
   *
   * @param {*} options
   * @returns
   */
  static async findOneProvisionalGraduationListRecord(options) {
    try {
      const records = await models.ProvisionalGraduationList.findOne({
        ...options,
      });

      return records;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `graduationList.service.js`,
        `findOneProvisionalGraduationListRecord`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} options
   * @returns
   */
  static async findAllProvisionalGraduationListRecords(options) {
    try {
      const records = await models.ProvisionalGraduationList.findAll({
        ...options,
      });

      return records;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `graduationList.service.js`,
        `findAllProvisionalGraduationListRecords`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} options
   * @returns
   */
  static async updateProvisionalGraduationListRecord(id, data, transaction) {
    try {
      const records = await models.ProvisionalGraduationList.update(
        { ...data },
        { where: { id }, transaction, returning: true }
      );

      return records;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `graduationList.service.js`,
        `updateProvisionalGraduationListRecord`,
        `PUT`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async createGraduationAcademicStatus(data, studentName, transaction) {
    try {
      const record = await models.StudentProgrammeAcademicStatus.findOrCreate({
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

      return record;
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error(`Student: ${studentName} Has Already Graduated.`);
      } else {
        await sequelizeErrorHandler(
          error,
          `graduationList.service.js`,
          `createGraduationAcademicStatus`,
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
  static async updateStudentProgrammeAcademicStatus(
    constraints,
    data,
    transaction
  ) {
    try {
      const record = await models.StudentProgrammeAcademicStatus.update(
        { ...data },
        {
          where: constraints,
          transaction,
          returning: true,
        }
      );

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `graduationList.service.js`,
        `updateStudentProgrammeAcademicStatus`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async generateStudentGrades(data, transaction) {
    try {
      const record = await models.StudentAcademicAssessment.findOrCreate({
        where: {
          student_programme_id: data.student_programme_id,
          study_year_id: data.study_year_id,
          semester_id: data.semester_id,
        },
        defaults: {
          ...data,
        },

        transaction,
      });

      if (data.results && isArray(data.results)) {
        for (const result of data.results) {
          await ResultService.updateResultByContext(
            {
              id: result.id,
              student_programme_id: data.student_programme_id,
            },
            {
              grading_value_id: result.grading_value_id,
              has_passed: result.final_mark >= result.pass_mark,
            }
          );
        }
      }

      if (record[1] === false) {
        const { id } = record[0].dataValues;

        await models.StudentAcademicAssessment.update(
          {
            ...data,
          },
          {
            where: {
              id,
            },
            transaction,
            returning: true,
          }
        );
      }

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `graduationList.service.js`,
        `generateStudentGrades`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all records or filtered using options param
   */
  static async findAllStudentGrades(options) {
    try {
      const records = await models.StudentAcademicAssessment.findAll({
        ...options,
      });

      return records;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `graduationList.service.js`,
        `findAllStudentGrades`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all records or filtered using options param
   */
  static async findOneStudentGrade(options) {
    try {
      const records = await models.StudentAcademicAssessment.findOne({
        ...options,
      });

      return records;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `graduationList.service.js`,
        `findOneStudentGrade`,
        `GET`
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
  static async updateStudentGrade(id, data, transaction) {
    try {
      const record = await models.StudentAcademicAssessment.update(
        { ...data },
        { where: { id }, transaction, returning: true }
      );

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `graduationList.service.js`,
        `updateStudentGrade`,
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
  static async deleteStudentGrade(options, transaction) {
    try {
      const deleted = await models.StudentAcademicAssessment.destroy({
        ...options,
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `graduationList.service.js`,
        `deleteStudentGrade`,
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
  static async bulkDeleteStudentGrades(data, transaction) {
    try {
      const deleted = await models.StudentAcademicAssessment.destroy({
        where: {
          id: data,
        },
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `graduationList.service.js`,
        `bulkDeleteStudentGrades`,
        `DELETE`
      );
    }
  }
}

module.exports = GraduationListService;
