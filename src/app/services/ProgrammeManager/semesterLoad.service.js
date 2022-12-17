const models = require('@models');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for a semesterLoad
class SemesterLoadService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all faculties or filtered using options param
   */
  static async findAllSemesterLoads(options) {
    try {
      const results = await models.SemesterLoad.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `semesterLoad.service.js`,
        `findAllSemesterLoads`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single semesterLoad object basing on the options
   */
  static async findOneSemesterLoad(options) {
    try {
      const semesterLoad = await models.SemesterLoad.findOne({ ...options });

      return semesterLoad;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `semesterLoad.service.js`,
        `findOneSemesterLoad`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single semesterLoad object from data object
   *@
   */
  static async createSemesterLoad(data) {
    try {
      if (
        data.is_programme_based === true ||
        data.is_programme_based === 'true'
      ) {
        if (!data.programme_id) {
          throw new Error('Please Provide A Programme.');
        }

        const findProgramme = await models.Programme.findOne({
          where: {
            id: data.programme_id,
          },
          attributes: ['id', 'programme_study_level_id'],

          raw: true,
        });

        if (!findProgramme) {
          throw new Error('Unable To Find The Programme Record Selected.');
        }

        data.programme_study_level_id = findProgramme.programme_study_level_id;

        const newSemesterLoad = await models.SemesterLoad.findOrCreate({
          where: {
            programme_id: data.programme_id,
          },
          defaults: { ...data },
        });

        return newSemesterLoad;
      } else {
        if (!data.programme_study_level_id) {
          throw new Error('Please Provide A Study Level.');
        }

        const newSemesterLoad = await models.SemesterLoad.findOrCreate({
          where: {
            programme_study_level_id: data.programme_study_level_id,
          },
          defaults: { ...data },
        });

        return newSemesterLoad;
      }
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `semesterLoad.service.js`,
        `createSemesterLoad`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of semesterLoad object to be updated
   * @returns {Promise}
   * @description updates a single semesterLoad object
   *@
   */
  static async updateSemesterLoad(id, data) {
    try {
      const updated = await models.SemesterLoad.update(
        { ...data },
        { where: { id }, returning: true }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `semesterLoad.service.js`,
        `updateSemesterLoad`,
        `PUT`
      );
    }
  }

  /**
   * @param {string} id  id of semesterLoad object to be deleted
   * @returns {Promise}
   * @description deletes a single semesterLoad object
   *@
   */
  static async deleteSemesterLoad(id) {
    try {
      const deleted = await models.SemesterLoad.destroy({
        where: { id },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `semesterLoad.service.js`,
        `deleteSemesterLoad`,
        `DELETE`
      );
    }
  }
}

module.exports = SemesterLoadService;
