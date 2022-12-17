const models = require('@models');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for this entity
class GraduateFeesPolicyService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all records or filtered using options param
   */
  static async findAllRecords(options) {
    try {
      const records = await models.GraduateFeesPolicy.findAll({
        ...options,
      });

      return records;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `graduateFeesPolicy.service.js`,
        `findAllRecords`,
        `GET`
      );
    }
  }

  /** findGraduateFeesPolicyFunctionalFeesElements
   *
   * @param {*} options
   */
  static async findAllGraduateFeesPolicyFunctionalFeesElements(options) {
    try {
      const records =
        await models.GraduateFeesPolicyFunctionalFeesElement.findAll({
          ...options,
        });

      return records;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `graduateFeesPolicy.service.js`,
        `findAllGraduateFeesPolicyFunctionalFeesElements`,
        `GET`
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
      const record = await models.GraduateFeesPolicy.findOne({
        ...options,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `graduateFeesPolicy.service.js`,
        `findOneRecord`,
        `GET`
      );
    }
  }

  /** createGraduateFeesPolicyRecord
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async createRecord(data, transaction) {
    try {
      const record = await models.GraduateFeesPolicy.findOrCreate({
        where: {
          enrollment_status_id: data.enrollment_status_id,
          study_level_id: data.study_level_id,
        },
        defaults: {
          ...data,
        },
        include: [
          {
            association: models.GraduateFeesPolicy.functionalElements,
          },
        ],
        transaction,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `graduateFeesPolicy.service.js`,
        `createRecord`,
        `POST`
      );
    }
  }

  /**
   *
   *
   * @param {*} data
   */
  static async findPolicyElements(options) {
    try {
      const result =
        await models.GraduateFeesPolicyFunctionalFeesElement.findAll(options);

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `graduateFeesPolicy.service.js`,
        `findPolicyElements`,
        `GET`
      );
    }
  }

  /**
   * DELETE GRADUATE POLICY ELEMENTS
   *
   * @param {*} data
   */
  static async destroyElements(constraint, transaction) {
    try {
      const result =
        await models.GraduateFeesPolicyFunctionalFeesElement.destroy({
          where: constraint,
          transaction,
        });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `graduateFeesPolicy.service.js`,
        `destroyElements`,
        `DELETE`
      );
    }
  }

  /**
   *
   * @param {*} data
   */
  static async addElements(data, transaction) {
    try {
      const result =
        await models.GraduateFeesPolicyFunctionalFeesElement.findOrCreate({
          where: {
            graduate_fees_policy_id: data.graduateFeesPolicyId,
            functional_fees_element_id: data.functionalFeesElementId,
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
        `graduateFeesPolicy.service.js`,
        `addElements`,
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
      const record = await models.GraduateFeesPolicy.update(
        { ...data },
        { where: { id }, transaction, returning: true }
      );

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `graduateFeesPolicy.service.js`,
        `updateRecord`,
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
      const deleted = await models.GraduateFeesPolicy.destroy({
        where: { id },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `graduateFeesPolicy.service.js`,
        `deleteRecord`,
        `DELETE`
      );
    }
  }

  static async deleteMultipleFunctionalFeesElements(policyId, elementId) {
    try {
      const deleted =
        await models.GraduateFeesPolicyFunctionalFeesElement.destroy({
          where: {
            graduate_fees_policy_id: policyId,
            functional_fees_element_id: elementId,
          },
        });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `graduateFeesPolicy.service.js`,
        `deleteMultipleFunctionalFeesElements`,
        `DELETE`
      );
    }
  }
}

module.exports = GraduateFeesPolicyService;
