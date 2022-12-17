const models = require('@models');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for a academicProgrammeDissertation
class StudentProgrammeDissertationService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all faculties or filtered using options param
   */
  static async findAll(options) {
    try {
      const results = await models.StudentProgrammeDissertation.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `academicProgrammeDissertation.service.js`,
        `findAll`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single academicProgrammeDissertation object basing on the options
   */
  static async findOne(options) {
    try {
      const record = await models.StudentProgrammeDissertation.findOne(options);

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `academicProgrammeDissertation.service.js`,
        `findOne`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single academicProgrammeDissertation object from data object
   *@
   */
  static async bulkCreate(data, transaction) {
    try {
      const result = await models.StudentProgrammeDissertation.bulkCreate(
        data,
        {
          updateOnDuplicate: [
            'title',
            'description',
            'batch_number',
            'updated_at',
          ],
          transaction,
          returning: false,
        }
      );

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `academicProgrammeDissertation.service.js`,
        `updateOrCreate`,
        `PUT/POST`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of academicProgrammeDissertation object to be updated
   * @returns {Promise}
   * @description updates a single academicProgrammeDissertation object
   *@
   */
  static async updateRecord(id, data) {
    try {
      const updated = await models.StudentProgrammeDissertation.update(
        { ...data },
        { where: { id }, returning: true }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `academicProgrammeDissertation.service.js`,
        `updateRecord`,
        `PUT`
      );
    }
  }

  /**
   * @param {string} id  id of academicProgrammeDissertation object to be deleted
   * @returns {Promise}
   * @description deletes a single academicProgrammeDissertation object
   *@
   */
  static async deleteRecord(id) {
    try {
      const deleted = await models.StudentProgrammeDissertation.destroy({
        where: { id },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `academicProgrammeDissertation.service.js`,
        `deleteRecord`,
        `DELETE`
      );
    }
  }
}

module.exports = StudentProgrammeDissertationService;
