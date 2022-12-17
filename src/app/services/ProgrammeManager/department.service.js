const models = require('@models');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for a department
class DepartmentService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all faculties or filtered using options param
   */
  static async findAllDepartments(options) {
    try {
      const results = await models.Department.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `department.service.js`,
        `findAllDepartments`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single department object basing on the options
   */
  static async findOneDepartment(options) {
    try {
      const department = await models.Department.findOne({ ...options });

      return department;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `department.service.js`,
        `findOneDepartment`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single department object from data object
   *@
   */
  static async createDepartment(data, transaction) {
    try {
      const record = await models.Department.findOrCreate({
        where: {
          department_code: data.department_code.trim(),
        },
        defaults: {
          ...data,
        },
        transaction,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `department.service.js`,
        `createDepartment`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of department object to be updated
   * @returns {Promise}
   * @description updates a single department object
   *@
   */
  static async updateDepartment(id, data) {
    try {
      const updated = await models.Department.update(
        { ...data },
        { where: { id }, returning: true }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `department.service.js`,
        `updateDepartment`,
        `PUT`
      );
    }
  }

  /**
   * @param {string} id  id of department object to be deleted
   * @returns {Promise}
   * @description deletes a single department object
   *@
   */
  static async deleteDepartment(id) {
    try {
      const deleted = await models.Department.destroy({
        where: { id },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `department.service.js`,
        `deleteDepartment`,
        `DELETE`
      );
    }
  }
}

module.exports = DepartmentService;
