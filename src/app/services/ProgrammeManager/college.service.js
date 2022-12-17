const models = require('@models');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for a college
class CollegeService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all faculties or filtered using options param
   */
  static async findAllColleges(options) {
    try {
      const results = await models.College.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `college.service.js`,
        `findAllColleges`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single college object basing on the options
   */
  static async findOneCollege(options) {
    try {
      const college = await models.College.findOne({ ...options });

      return college;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `college.service.js`,
        `findOneCollege`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single college object from data object
   *@
   */
  static async createCollege(data, transaction) {
    try {
      const record = await models.College.findOrCreate({
        where: {
          college_code: data.college_code.trim(),
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
        `college.service.js`,
        `createCollege`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of college object to be updated
   * @returns {Promise}
   * @description updates a single college object
   *@
   */
  static async updateCollege(id, data) {
    try {
      const updated = await models.College.update(
        { ...data },
        { where: { id }, returning: true }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `college.service.js`,
        `updateCollege`,
        `PUT`
      );
    }
  }

  /**
   * @param {string} id  id of college object to be deleted
   * @returns {Promise}
   * @description deletes a single college object
   *@
   */
  static async deleteCollege(id) {
    try {
      const deleted = await models.College.destroy({
        where: { id },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `college.service.js`,
        `deleteCollege`,
        `DELETE`
      );
    }
  }
}

module.exports = CollegeService;
