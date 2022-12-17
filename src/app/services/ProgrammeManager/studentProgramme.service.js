const models = require('@models');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for a programme
class StudentProgrammeService {
  /**
   * Find All Student Programmes
   *
   * @param  {object} options
   * @returns {Promise}
   * @description returns all faculties or filtered using options param
   */
  static async findAll(options) {
    try {
      const results = await models.StudentProgramme.findAll(options);

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeManager.studentProgramme.service.js`,
        `findAll`,
        `GET`
      );
    }
  }

  /**
   * Find One Student Programme
   *
   * @param  {object} options
   * @returns {Promise}
   * @description returns all faculties or filtered using options param
   */
  static async findOne(options) {
    try {
      const result = await models.StudentProgramme.findOne(options);

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeManager.studentProgramme.service.js`,
        `findOne`,
        `GET`
      );
    }
  }

  /**
   * Update One Student Programme
   *
   * @param  {object} options
   * @returns {Promise}
   * @description returns all faculties or filtered using options param
   */
  static async update(condition, data, transaction) {
    try {
      const result = await models.StudentProgramme.update(data, {
        where: condition,
        returning: true,
        transaction,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeManager.studentProgramme.service.js`,
        `update`,
        `PUT`
      );
    }
  }

  /**
   * CREATE One Student Programme
   *
   * @param  {object} options
   * @returns {Promise}
   * @description returns all faculties or filtered using options param
   */
  static async createAcademicStatus(condition, defaults, transaction) {
    try {
      const result =
        await models.StudentProgrammeAcademicStatusDetail.findOrCreate({
          where: condition,
          defaults,
          returning: true,
          transaction,
        });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeManager.studentProgramme.service.js`,
        `createAcademicStatus`,
        `POST`
      );
    }
  }

  /**
   * Delete One Student Programmes
   *
   * @param  {object} options
   * @returns {Promise}
   * @description returns all faculties or filtered using options param
   */
  static async destroy(options) {
    try {
      const result = await models.StudentProgramme.destroy(options);

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeManager.studentProgramme.service.js`,
        `destroy`,
        `DELETE`
      );
    }
  }
}

module.exports = StudentProgrammeService;
