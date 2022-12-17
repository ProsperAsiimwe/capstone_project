const models = require('@models');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for a subject
class SubjectService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all faculties or filtered using options param
   */
  static async findAllSubjects(options) {
    try {
      const results = await models.Subject.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `subject.service.js`,
        `findAllSubjects`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single subject object basing on the options
   */
  static async findOneSubject(options) {
    try {
      const subject = await models.Subject.findOne({ ...options });

      return subject;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `subject.service.js`,
        `findOneSubject`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single subject object from data object
   *@
   */
  static async createSubject(data) {
    try {
      const newSubject = await models.Subject.create({
        ...data,
      });

      return newSubject;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `subject.service.js`,
        `createSubject`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of subject object to be updated
   * @returns {Promise}
   * @description updates a single subject object
   *@
   */
  static async updateSubject(id, data) {
    try {
      const updated = await models.Subject.update(
        { ...data },
        { where: { id }, returning: true }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `subject.service.js`,
        `updateSubject`,
        `PUT`
      );
    }
  }

  /**
   * @param {string} id  id of subject object to be deleted
   * @returns {Promise}
   * @description deletes a single subject object
   *@
   */
  static async deleteSubject(id) {
    try {
      const deleted = await models.Subject.destroy({
        where: { id },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `subject.service.js`,
        `deleteSubject`,
        `DELETE`
      );
    }
  }
}

module.exports = SubjectService;
