const models = require('@models');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for a programmeVersionAdmissionCriteria
class ProgrammeVersionWeightingCriteriaService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all programmeVersionAdmissionCriterias or filtered using options param
   */
  static async findAllRecords(options) {
    try {
      const results = await models.ProgrammeVersionWeightingCriteria.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersionWeightingCriteria.service.js`,
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
      const results = await models.ProgrammeVersionWeightingCriteria.findOne({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersionWeightingCriteria.service.js`,
        `findOneRecord`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   */
  static async findOneWeightingCriteriaCategory(options) {
    try {
      const results = await models.WeightingCriteriaCategory.findOne({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersionWeightingCriteria.service.js`,
        `findOneWeightingCriteriaCategory`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   */
  static async findAllWeightingCriteriaCategory(options) {
    try {
      const results = await models.WeightingCriteriaCategory.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersionWeightingCriteria.service.js`,
        `findAllWeightingCriteriaCategory`,
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
        await models.ProgrammeVersionWeightingCriteria.findOrCreate({
          where: {
            programme_id: data.programme_id,
            programme_version_id: data.programme_version_id,
            weighting_criteria_code: data.weighting_criteria_code,
          },
          defaults: {
            ...data,
          },
          include: [
            {
              association: models.ProgrammeVersionWeightingCriteria.categories,
              include: [
                {
                  association: models.WeightingCriteriaCategory.unebSubjects,
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
        `programmeVersionWeightingCriteria.service.js`,
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
  static async createAddWeightingCriteriacategory(data, transaction) {
    try {
      const result = await models.WeightingCriteriaCategory.findOrCreate({
        where: {
          criteria_id: data.criteria_id,
          uneb_study_level_id: data.uneb_study_level_id,
          weighting_category_id: data.weighting_category_id,
          weighting_condition_id: data.weighting_condition_id,
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
        `programmeVersionWeightingCriteria.service.js`,
        `createAddWeightingCriteriacategory`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   *@
   */
  static async createWeightingCriteriaCategorySubject(data, transaction) {
    try {
      const result = await models.WeightingCriteriaCategorySubject.findOrCreate(
        {
          where: {
            criteria_category_id: data.criteria_category_id,
            uneb_subject_id: data.uneb_subject_id,
          },
          defaults: {
            ...data,
          },
          transaction,
        }
      );

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersionWeightingCriteria.service.js`,
        `createWeightingCriteriaCategorySubject`,
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
      const updated = await models.ProgrammeVersionWeightingCriteria.update(
        { ...data },
        { where: { id }, returning: true }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersionWeightingCriteria.service.js`,
        `updateRecord`,
        `PUT`
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
  static async updateWeightingCriteriaCategory(id, data, transaction) {
    try {
      const updated = await models.WeightingCriteriaCategory.update(
        { ...data },
        { where: { id }, transaction, returning: true }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersionWeightingCriteria.service.js`,
        `updateWeightingCriteriaCategory`,
        `PUT`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise}
   * @description
   */
  static async findAllCriteriaCategorySubjects(options) {
    try {
      const results = await models.WeightingCriteriaCategorySubject.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersionWeightingCriteria.service.js`,
        `findAllCriteriaCategorySubjects`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async bulkInsertCriteriaCategorySubjects(data, transaction) {
    try {
      const result = await models.WeightingCriteriaCategorySubject.bulkCreate(
        data,
        {
          transaction,
          returning: true,
        }
      );

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersionWeightingCriteria.service.js`,
        `bulkInsertCriteriaCategorySubjects`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   * @returns
   */
  static async bulkRemoveCriteriaCategorySubjects(data, transaction) {
    try {
      const deleted = await models.WeightingCriteriaCategorySubject.destroy({
        where: { id: data },
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersionWeightingCriteria.service.js`,
        `bulkRemoveCriteriaCategorySubjects`,
        `DELETE`
      );
    }
  }

  /**
   *
   * @param {*} id
   * @param {*} data
   * @param {*} transaction
   * @returns
   */
  static async updateCriteriaCategorySubjects(id, data, transaction) {
    try {
      const deleted = await models.WeightingCriteriaCategorySubject.update(
        { ...data },
        {
          where: { id },
          transaction,
          returning: true,
        }
      );

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersionWeightingCriteria.service.js`,
        `updateCriteriaCategorySubjects`,
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
      const deleted = await models.ProgrammeVersionWeightingCriteria.destroy({
        where: { id },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersionWeightingCriteria.service.js`,
        `deleteRecord`,
        `DELETE`
      );
    }
  }

  /**
   *
   * @param {*} id
   * @returns
   */
  static async deleteWeightingCriteriaCategory(id) {
    try {
      const deleted = await models.WeightingCriteriaCategory.destroy({
        where: { id },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersionWeightingCriteria.service.js`,
        `deleteWeightingCriteriaCategory`,
        `DELETE`
      );
    }
  }
}

module.exports = ProgrammeVersionWeightingCriteriaService;
