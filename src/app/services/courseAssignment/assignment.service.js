const models = require('@models');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for this entity
class AssignmentService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all records or filtered using options param
   */
  static async findAllRecords(options) {
    try {
      const records = await models.Assignment.findAll({
        ...options,
      });

      return records;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `assignment.service.js`,
        `findAllRecords`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} options
   */
  static async findAllCourseUnitLecturers(options) {
    try {
      const records = await models.AssignmentCourseLecturer.findAll({
        ...options,
      });

      return records;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `assignment.service.js`,
        `findAllCourseUnitLecturers`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} options
   */
  static async findOneCourseUnitLecturer(options) {
    try {
      const records = await models.AssignmentCourseLecturer.findOne({
        ...options,
      });

      return records;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `assignment.service.js`,
        `findOneCourseUnitLecturer`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single record object basing on the options
   */
  static async findOneRecord(options) {
    try {
      const record = await models.Assignment.findOne({
        ...options,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `assignment.service.js`,
        `findOneRecord`,
        `GET`
      );
    }
  }

  /** createAssignmentRecord
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async createRecord(data, transaction) {
    try {
      const record = await models.Assignment.findOrCreate({
        where: {
          campus_id: data.campus_id,
          academic_year_id: data.academic_year_id,
          semester_id: data.semester_id,
          intake_id: data.intake_id,
          department_id: data.department_id,
          programme_id: data.programme_id,
          programme_type_id: data.programme_type_id,
          programme_version_id: data.programme_version_id,
        },
        defaults: {
          ...data,
        },
        include: [
          {
            association: models.Assignment.course_unit,
            include: [
              {
                association: models.AssignmentCourse.lecturers,
                include: [
                  {
                    association: models.AssignmentCourseLecturer.groups,
                  },
                ],
              },
              {
                association: models.AssignmentCourse.nodes,
                include: [
                  {
                    association: models.ResultAllocationNode.childNodes,
                  },
                ],
              },
            ],
          },
        ],
        transaction,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `assignment.service.js`,
        `createRecord`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async createCourseUnitIfPayloadExists(data, transaction) {
    try {
      const record = await models.AssignmentCourse.findOrCreate({
        where: {
          assignment_id: data.assignment_id,
          programme_version_course_unit_id:
            data.programme_version_course_unit_id,
        },
        defaults: {
          ...data,
        },
        include: [
          {
            association: models.AssignmentCourse.lecturers,
            include: [
              {
                association: models.AssignmentCourseLecturer.groups,
              },
            ],
          },
          {
            association: models.AssignmentCourse.nodes,
            include: [
              {
                association: models.ResultAllocationNode.childNodes,
              },
            ],
          },
        ],

        transaction,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `assignment.service.js`,
        `createCourseUnitIfPayloadExists`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} data
   */
  static async addCourseUnits(data, transaction) {
    try {
      const result = await models.AssignmentCourse.findOrCreate({
        where: {
          assignment_id: data.assignment_id,
          programme_version_course_unit_id:
            data.course_unit.programme_version_course_unit_id,
        },
        defaults: {
          ...data,
        },
        include: [
          {
            association: models.AssignmentCourse.lecturers,
            include: [
              {
                association: models.AssignmentCourseLecturer.groups,
              },
            ],
          },
        ],
        transaction,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `assignment.service.js`,
        `addCourseUnits`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} data
   */
  static async addCourseUnitGroups(data, transaction) {
    try {
      const result = await models.AssignmentCourseGroup.findOrCreate({
        where: {
          assignment_course_id: data.assignment_course_id,
          group_name: data.group_name,
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
        `assignment.service.js`,
        `addCourseUnitGroups`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} data
   */
  static async addCourseUnitLecturers(data, transaction) {
    try {
      const result = await models.AssignmentCourseLecturer.findOrCreate({
        where: {
          assignment_course_id: data.assignment_course_id,
          lecturer_id: data.lecturer_id,
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
        `assignment.service.js`,
        `addCourseUnitLecturers`,
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
  static async updateRecord(id, data) {
    try {
      const record = await models.Assignment.update(
        { ...data },
        { where: { id }, returning: true }
      );

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `assignment.service.js`,
        `updateRecord`,
        `PUT`
      );
    }
  }

  /**
   *
   * @param {*} id
   * @param {*} data
   */
  static async updateCourseUnit(id, data) {
    try {
      const record = await models.AssignmentCourse.update(
        { ...data },
        { where: { id }, returning: true }
      );

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `assignment.service.js`,
        `updateCourseUnit`,
        `PUT`
      );
    }
  }

  /**
   *
   * @param {*} id
   * @param {*} data
   */
  static async updateCourseUnitGroup(id, data) {
    try {
      const record = await models.AssignmentCourseGroup.update(
        { ...data },
        { where: { id }, returning: true }
      );

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `assignment.service.js`,
        `updateCourseUnitGroup`,
        `PUT`
      );
    }
  }

  /**
   *
   * @param {*} id
   * @param {*} data
   */
  static async updateCourseUnitLecturer(id, data, transaction) {
    try {
      const record = await models.AssignmentCourseLecturer.update(
        { ...data },
        { where: { id }, transaction, returning: true }
      );

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `assignment.service.js`,
        `updateCourseUnitLecturer`,
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
  static async deleteRecord(id) {
    try {
      const deleted = await models.Assignment.destroy({
        where: { id },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `assignment.service.js`,
        `deleteRecord`,
        `DELETE`
      );
    }
  }

  /**
   *
   * @param {*} id
   */
  static async deleteCourseUnits(id) {
    try {
      const deleted = await models.AssignmentCourse.destroy({
        where: {
          id,
        },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `assignment.service.js`,
        `deleteCourseUnits`,
        `DELETE`
      );
    }
  }

  /**
   *
   * @param {*} id
   */
  static async deleteCourseUnitGroups(id) {
    try {
      const deleted = await models.AssignmentCourseGroup.destroy({
        where: {
          id,
        },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `assignment.service.js`,
        `deleteCourseUnitGroups`,
        `DELETE`
      );
    }
  }

  /**
   *
   * @param {*} id
   */
  static async deleteCourseUnitLecturer(id) {
    try {
      const deleted = await models.AssignmentCourseLecturer.destroy({
        where: {
          id,
        },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `assignment.service.js`,
        `deleteCourseUnitLecturer`,
        `DELETE`
      );
    }
  }
}

module.exports = AssignmentService;
