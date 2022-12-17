const {
  reOrderResultSemester,
} = require('@controllers/Helpers/academicGradesHelper');
const models = require('@models');
const { QueryTypes } = require('sequelize');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');
const { regexFunction } = require('../helper/regexHelper');

// This Class is responsible for handling all database interactions for this entity
class ResultAllocationNodeService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all records or filtered using options param
   */
  static async findAllResultAllocationNodes(options) {
    try {
      const records = await models.ResultAllocationNode.findAll({
        ...options,
      });

      return records;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  /**
   *
   * @param {*} options
   */
  static async findAllNodeMarks(options) {
    try {
      const records = await models.NodeMark.findAll({
        ...options,
      });

      return records;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single record object basing on the options
   */
  static async fetchResultAllocationNode(options) {
    try {
      const record = await models.ResultAllocationNode.findOne({
        ...options,
      });

      return record;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async createResultAllocationNode(data, transaction) {
    try {
      const record = await models.ResultAllocationNode.create({
        ...data,
        transaction,
      });

      return record;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async createNodeMarks(data, transaction) {
    try {
      const record = await models.NodeMark.findOrCreate({
        where: {
          result_allocation_node_id: data.result_allocation_node_id,
          student_programme_id: data.student_programme_id,
        },
        defaults: {
          ...data,
        },

        transaction,
      });

      return record;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of record object to be updated
   * @returns {Promise}
   * @description updates a single record object
   *@
   */
  static async updateResultAllocationNode(id, data, transaction) {
    try {
      const record = await models.ResultAllocationNode.update(
        { ...data },
        { where: { id }, transaction, returning: true }
      );

      return record;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of record object to be updated
   * @returns {Promise}
   * @description updates a single record object
   *@
   */
  static async updateNodeMarks(id, data, transaction) {
    try {
      const record = await models.NodeMark.update(
        { ...data },
        { where: { id }, transaction, returning: true }
      );

      return record;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  /**
   * @param {string} id  id of record object to be deleted
   * @returns {Promise}
   * @description deletes a single record object
   *@
   */
  static async deleteResultAllocationNode(id) {
    try {
      const deleted = await models.ResultAllocationNode.destroy({
        where: { id },
      });

      return deleted;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // course nodes(parent nested with the child nodes)
  static async courseNodesFunction(data) {
    try {
      const filtered = await models.sequelize.query(
        `select CAST( jsonb_pretty(course_nodes_function) AS json) as nodes
        from results_mgt.course_nodes_function(null::int,${data.course_assignment_id})`,
        {
          type: QueryTypes.SELECT,
          plain: true,
        }
      );

      return filtered;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async courseNodesFunctionTwo(context) {
    try {
      const result = await models.sequelize.query(
        `SELECT id, node_name,
         COALESCE(results_mgt.course_allocation_nodes_function(${context.course_assignment_id}), '[]')
         AS children FROM results_mgt.result_allocation_nodes;`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return result;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // course nodes(node not nested to hierarchy for result view)

  static async courseNodesDataFunction(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from results_mgt.course_nodes(${data.course_assignment_id})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // marks upload lecturers
  static async marksUploadLecturerFunction(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from results_mgt.marks_upload_lecturer_function(${data.course_assignment_id})`,
        {
          type: QueryTypes.SELECT,
          plain: true,
        }
      );

      return filtered;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // course students
  static async studentsByCourseRegistration(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from results_mgt.course_students_function(${data.course_unit_id},${data.academic_year_id},${data.semester_id},
          ${data.intake_id},${data.campus_id},${data.programme_type_id},${data.programme_version_id}
          )`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  //  student node marks
  /**
   * node_marks_function
   *
   * node_marks_function2
   */
  static async studentsNodeMarks(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from results_mgt.node_marks_function2(${data.node_id})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // results views

  static async resultViewFunction(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from results_mgt.result_function(${data.academic_year_id},${data.campus_id},${data.intake_id},${data.study_year_id},
          ${data.semester_id},${data.programme_id}) order by surname asc`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      throw new Error(error.message);
    }
  }
  //  result course units

  static async resultCoursesFunction(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from results_mgt.result_course_function(${data.academic_year_id},${data.campus_id},${data.intake_id},
          ${data.study_year_id},${data.semester_id},${data.programme_id}) order by course_unit_code asc`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // testimonial results

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
      throw new Error(error.message);
    }
  }

  // search_all_student_results

  static async searchAllStudentResults(data) {
    try {
      await regexFunction({ student: data });

      const filtered = await models.sequelize.query(
        `select * from results_mgt.search_all_student_results('${data}')`,
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

  // student results data
  static async studentResultsFunction(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from results_mgt.student_result_function('${data}')`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return reOrderResultSemester(filtered);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  //  semester date studentResultsSemesterFunction
  static async studentResultsSemesterFunction(studentNumberOrReg) {
    try {
      const filtered = await models.sequelize.query(
        `select * from results_mgt.student_result_semester_function('${studentNumberOrReg}')
        order by programme_study_year ASC,
        semester ASC`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return reOrderResultSemester(filtered);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  //  student_transcript_results

  static async studentTranscriptResults(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from results_mgt.student_transcript_results('${data}')
        order by programme_study_year ASC,semester ASC`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      throw new Error(error.message);
    }
  }
  // gpa single student

  static async gpaSingleStudent(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from results_mgt.single_student_gpa(${data.student})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      throw new Error(error.message);
    }
  }
  // parent node function

  static async parentNodeFunction(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from results_mgt.parent_node_function(${data.child_node_id})`,
        {
          type: QueryTypes.SELECT,
          plain: true,
        }
      );

      return filtered;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // department approval function

  static async departmentMarkApproval(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from results_mgt.department_marks_approval_function(${data.campus_id},${data.intake_id},
          ${data.programme_id},${data.academic_year_id},${data.semester_id},${data.programme_type_id},
          ${data.version_course_unit_id})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

module.exports = ResultAllocationNodeService;
