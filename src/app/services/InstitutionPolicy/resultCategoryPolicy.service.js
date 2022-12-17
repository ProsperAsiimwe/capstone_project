const models = require('@models');
const { trim, toUpper } = require('lodash');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for this entity
class ResultCategoryPolicyService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all records or filtered using options param
   */
  static async findAllRecords(options) {
    try {
      const records = await models.StudyLevelResultCategory.findAll({
        ...options,
      });

      return records;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `resultCategoryPolicy.service.js`,
        `findAllRecords`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} options
   */
  static async findAllResultCategoryPolicies(options) {
    try {
      const records = await models.ResultCategoryPolicy.findAll({
        ...options,
      });

      return records;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `resultCategoryPolicy.service.js`,
        `findAllResultCategoryPolicies`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async bulkInsertResultCategoryPolicies(data, transaction) {
    try {
      const result = await models.ResultCategoryPolicy.bulkCreate(data, {
        transaction,
        returning: true,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `resultCategoryPolicy.service.js`,
        `bulkInsertResultCategoryPolicies`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} data
   */
  static async bulkRemoveResultCategoryPolicies(data, transaction) {
    try {
      const deleted = await models.ResultCategoryPolicy.destroy({
        where: { id: data },
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `resultCategoryPolicy.service.js`,
        `bulkRemoveResultCategoryPolicies`,
        `DELETE`
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
      const record = await models.StudyLevelResultCategory.findOne({
        ...options,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `resultCategoryPolicy.service.js`,
        `findOneRecord`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single record object from data object
   *@
   */
  static async createResultCategoryPolicyRecord(data, transaction) {
    try {
      const result = await models.StudyLevelResultCategory.findOrCreate({
        where: {
          programme_study_level_id: data.programme_study_level_id,
        },
        defaults: {
          ...data,
        },
        include: [
          {
            association: models.StudyLevelResultCategory.graduationLists,
          },
        ],
        transaction,
      });

      if (result[1] === false) {
        const additionalGradLists = [];

        data.graduationLists.forEach((gradList) => {
          additionalGradLists.push({
            study_level_result_category_id: result[0].dataValues.id,
            ...gradList,
          });
        });

        for (const item of additionalGradLists) {
          await models.ResultCategoryPolicy.findOrCreate({
            where: {
              name: toUpper(trim(item.name)),
            },
            defaults: {
              ...item,
            },
            transaction,
          });
        }
      }

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `resultCategoryPolicy.service.js`,
        `createResultCategoryPolicyRecord`,
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
  static async updateRecord(id, data, transaction) {
    try {
      const record = await models.StudyLevelResultCategory.update(
        {
          ...data,
        },
        {
          where: {
            id,
          },
          returning: true,
          transaction,
        }
      );

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `resultCategoryPolicy.service.js`,
        `updateRecord`,
        `PUT`
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
  static async updateResultCategoryPolicyItem(id, data) {
    try {
      const record = await models.ResultCategoryPolicy.update(
        {
          ...data,
        },
        {
          where: {
            id,
          },
          returning: true,
        }
      );

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `resultCategoryPolicy.service.js`,
        `updateResultCategoryPolicyItem`,
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
      const deleted = await models.StudyLevelResultCategory.destroy({
        where: { id },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `resultCategoryPolicy.service.js`,
        `deleteRecord`,
        `DELETE`
      );
    }
  }

  /**
   * @param {string} id  id of record object to be deleted
   * @returns {Promise}
   * @description deletes a single record object
   *@
   */
  static async deleteResultCategoryPolicyItem(id) {
    try {
      const deleted = await models.ResultCategoryPolicy.destroy({
        where: { id },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `resultCategoryPolicy.service.js`,
        `deleteResultCategoryPolicyItem`,
        `DELETE`
      );
    }
  }
}

module.exports = ResultCategoryPolicyService;
