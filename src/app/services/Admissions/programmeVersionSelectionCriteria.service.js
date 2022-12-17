const models = require('@models');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for a programmeVersionAdmissionCriteria
class ProgrammeVersionSelectionCriteriaService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all programmeVersionAdmissionCriterias or filtered using options param
   */
  static async findAllRecords(options) {
    try {
      const results = await models.ProgrammeVersionSelectionCriteria.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersionSelectionCriteria.service.js`,
        `findAllRecords`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single programmeVersionAdmissionCriteria object basing on the options
   */
  static async findOneRecord(options) {
    try {
      const results = await models.ProgrammeVersionSelectionCriteria.findOne({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersionSelectionCriteria.service.js`,
        `findOneRecord`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   */
  static async findOneSelectionCriteriaCategory(options) {
    try {
      const results = await models.SelectionCriteriaCategory.findOne({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersionSelectionCriteria.service.js`,
        `findOneSelectionCriteriaCategory`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single programmeVersionAdmissionCriteria object from data object
   *@
   */
  static async createRecord(data, transaction) {
    try {
      const result =
        await models.ProgrammeVersionSelectionCriteria.findOrCreate({
          where: {
            programme_id: data.programme_id,
            programme_version_id: data.programme_version_id,
            selection_criteria_code: data.selection_criteria_code,
          },
          defaults: {
            ...data,
          },
          include: [
            {
              association: models.ProgrammeVersionSelectionCriteria.studyTypes,
            },
          ],
          transaction,
        });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersionSelectionCriteria.service.js`,
        `createRecord`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single programmeVersionAdmissionCriteria object from data object
   *@
   */
  static async createAddSelectionCriteriaStudyType(data, transaction) {
    try {
      const result = await models.SelectionCriteriaStudyType.findOrCreate({
        where: {
          criteria_id: data.criteria_id,
          programme_study_type_id: data.programme_study_type_id,
          entry_year_id: data.entry_year_id,
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
        `programmeVersionSelectionCriteria.service.js`,
        `createAddSelectionCriteriaStudyType`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of programmeVersionAdmissionCriteria object to be updated
   * @returns {Promise}
   * @description updates a single programmeVersionAdmissionCriteria object
   *@
   */
  static async updateRecord(id, data) {
    try {
      const updated = await models.ProgrammeVersionSelectionCriteria.update(
        { ...data },
        { where: { id }, returning: true }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersionSelectionCriteria.service.js`,
        `updateRecord`,
        `PUT`
      );
    }
  }

  /**
   * @param {string} id  id of programmeVersionAdmissionCriteria object to be deleted permanently
   * @returns {Promise}
   * @description deletes a single programmeVersionAdmissionCriteria object permanently
   *@
   */
  static async deleteRecord(id) {
    try {
      const deleted = await models.ProgrammeVersionSelectionCriteria.destroy({
        where: { id },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersionSelectionCriteria.service.js`,
        `deleteRecord`,
        `DELETE`
      );
    }
  }
}

module.exports = ProgrammeVersionSelectionCriteriaService;
