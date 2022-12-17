const models = require('@models');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for a faculty
class FacultyService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all faculties or filtered using options param
   */
  static async findAllFaculties(options) {
    try {
      const results = await models.Faculty.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `faculty.service.js`,
        `findAllFaculties`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single faculty object basing on the options
   */
  static async findOneFaculty(options) {
    try {
      const faculty = await models.Faculty.findOne({ ...options });

      return faculty;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `faculty.service.js`,
        `findOneFaculty`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single faculty object from data object
   *@
   */
  static async createFaculty(data, transaction) {
    try {
      const record = await models.Faculty.findOrCreate({
        where: {
          faculty_code: data.faculty_code.trim(),
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
        `faculty.service.js`,
        `createFaculty`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data Data to update.
   * @param {string} id  id of faculty object to be updated
   * @returns {Promise}
   * @description updates a single faculty object
   *@
   */
  static async updateFaculty(id, data) {
    try {
      const updated = await models.Faculty.update(data, {
        where: { id },
        returning: true,
      });

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `faculty.service.js`,
        `updateFaculty`,
        `PUT`
      );
    }
  }

  /**
   * @param {string} id  id of faculty object to be deleted
   * @returns {Promise}
   * @description deletes a single faculty object
   *@
   */
  static async deleteFaculty(id) {
    try {
      const deleted = await models.Faculty.destroy({
        where: { id },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `faculty.service.js`,
        `deleteFaculty`,
        `DELETE`
      );
    }
  }
}

module.exports = FacultyService;
