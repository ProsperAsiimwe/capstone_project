const models = require('@models');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for this entity
class SurchargePolicyService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all records or filtered using options param
   */
  static async findAllRecords(options) {
    try {
      const records = await models.SurchargePolicy.findAll({
        ...options,
      });

      return records;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `surchargePolicy.service.js`,
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
      const record = await models.SurchargePolicy.findOne({
        ...options,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `surchargePolicy.service.js`,
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
  static async createRecord(data, transaction) {
    try {
      const result = await models.SurchargePolicy.findOrCreate({
        where: {
          surcharge_type_id: data.surcharge_type_id,
        },
        include: [
          {
            association: models.SurchargePolicy.entryYears,
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
        `surchargePolicy.service.js`,
        `createRecord`,
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
      const record = await models.SurchargePolicy.update(
        { ...data },
        { where: { id }, transaction, returning: true }
      );

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `surchargePolicy.service.js`,
        `updateRecord`,
        `PUT`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all
   */
  static async findAllSurchargePolicyEntryYears(options) {
    try {
      const results = await models.SurchargePolicyEntryYear.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `surchargePolicy.service.js`,
        `findAllSurchargePolicyEntryYears`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async bulkCreateSurchargePolicyEntryYears(data, transaction) {
    try {
      const result = await models.SurchargePolicyEntryYear.bulkCreate(data, {
        transaction,
        returning: true,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `surchargePolicy.service.js`,
        `bulkCreateSurchargePolicyEntryYears`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} data
   */
  static async bulkRemoveSurchargePolicyEntryYears(data, transaction) {
    try {
      const deleted = await models.SurchargePolicyEntryYear.destroy({
        where: { id: data },
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `surchargePolicy.service.js`,
        `bulkRemoveSurchargePolicyEntryYears`,
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
  static async updateSurchargePolicyEntryYears(id, data, transaction) {
    try {
      const updated = await models.SurchargePolicyEntryYear.update(
        { ...data },
        { where: { id }, transaction, returning: true }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `surchargePolicy.service.js`,
        `updateSurchargePolicyEntryYears`,
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
  static async deleteRecord(id, transaction) {
    try {
      const deleted = await models.SurchargePolicy.destroy({
        where: { id },
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `surchargePolicy.service.js`,
        `deleteRecord`,
        `DELETE`
      );
    }
  }

  /** createRevokeSurchargeRequest
   *
   * @param {*} data
   */
  static async createRevokeSurchargeRequest(data) {
    try {
      const result = await models.RevokeSurcharge.create({
        ...data,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `surchargePolicy.service.js`,
        `createRevokeSurchargeRequest`,
        `POST`
      );
    }
  }

  /** findOneRevokeSurchargeRequest
   *
   * @param {*} options
   */

  static async findOneRevokeSurchargeRequest(options) {
    try {
      const record = await models.RevokeSurcharge.findOne({
        ...options,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `surchargePolicy.service.js`,
        `findOneRevokeSurchargeRequest`,
        `GET`
      );
    }
  }

  /** updateRevokeSurchargeRequest
   *
   * @param {*} id
   * @param {*} data
   */
  static async updateRevokeSurchargeRequest(id, data, transaction) {
    try {
      const record = await models.RevokeSurcharge.update(
        {
          deleted_by_id: data.deletedById,
          delete_approved_by_id: data.deletedApprovedById,
          delete_approval_data: data.deleteApprovalDate,
        },
        { where: { id }, transaction, returning: true }
      );

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `surchargePolicy.service.js`,
        `updateRevokeSurchargeRequest`,
        `PUT`
      );
    }
  }
}

module.exports = SurchargePolicyService;
