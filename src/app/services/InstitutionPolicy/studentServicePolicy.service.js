const models = require('@models');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for this entity
class StudentServicePolicyService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all records or filtered using options param
   */
  static async findAllRecords(options) {
    try {
      const records = await models.StudentServicePolicy.findAll({
        ...options,
      });

      return records;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `studentServicePolicy.service.js`,
        `findAllRecords`,
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
      const record = await models.StudentServicePolicy.findOne({
        ...options,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `studentServicePolicy.service.js`,
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
  static async createStudentServicePolicyRecord(data, transaction) {
    try {
      const result = await models.StudentServicePolicy.findOrCreate({
        where: {
          student_service_type_id: data.student_service_type_id,
        },
        include: [
          {
            association: models.StudentServicePolicy.amounts,
          },
        ],
        defaults: {
          ...data,
        },
        transaction,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `studentServicePolicy.service.js`,
        `createStudentServicePolicyRecord`,
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
      const record = await models.StudentServicePolicy.update(
        {
          ...data,
        },
        {
          where: {
            id,
          },
          transaction,
          returning: true,
        }
      );

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `studentServicePolicy.service.js`,
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
      const deleted = await models.StudentServicePolicy.destroy({
        where: { id },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `studentServicePolicy.service.js`,
        `deleteRecord`,
        `DELETE`
      );
    }
  }

  /**
   *
   * @param {*} options
   * @returns
   */
  static async findAllPolicyAmounts(options) {
    try {
      const records = await models.StudentServicePolicyAmount.findAll({
        ...options,
      });

      return records;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `studentServicePolicy.service.js`,
        `findAllPolicyAmounts`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async bulkInsertPolicyAmounts(data, transaction) {
    try {
      const result = await models.StudentServicePolicyAmount.bulkCreate(data, {
        transaction,
        returning: true,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `studentServicePolicy.service.js`,
        `bulkInsertPolicyAmounts`,
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
  static async bulkRemovePolicyAmounts(data, transaction) {
    try {
      const deleted = await models.StudentServicePolicyAmount.destroy({
        where: { id: data },
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `studentServicePolicy.service.js`,
        `bulkRemovePolicyAmounts`,
        `DELETE`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @returns
   */
  static async addPolicyAmounts(data, transaction) {
    try {
      const records = await models.StudentServicePolicyAmount.findOrCreate({
        where: {
          policy_id: data.policy_id,
          billing_category_id: data.billing_category_id,
        },
        defaults: {
          ...data,
        },
        transaction,
      });

      return records;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `studentServicePolicy.service.js`,
        `addPolicyAmounts`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} id
   * @param {*} data
   * @returns
   */
  static async updatePolicyAmounts(id, data, transaction) {
    try {
      const record = await models.StudentServicePolicyAmount.update(
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
        `studentServicePolicy.service.js`,
        `updatePolicyAmounts`,
        `PUT`
      );
    }
  }

  /**
   *
   * @param {*} id
   * @returns
   */
  static async deletePolicyAmounts(options, transaction) {
    try {
      const deleted = await models.StudentServicePolicyAmount.destroy({
        ...options,
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `studentServicePolicy.service.js`,
        `deletePolicyAmounts`,
        `DELETE`
      );
    }
  }
}

module.exports = StudentServicePolicyService;
