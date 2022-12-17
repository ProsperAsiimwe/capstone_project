const models = require('@models');
const { trim } = require('lodash');
const { QueryTypes } = require('sequelize');
const { Op } = require('sequelize');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for a feesElement
class FeesElementService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all faculties or filtered using options param
   */
  static async findAllFeesElements(options) {
    try {
      const results = await models.FeesElement.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `feesElement.service.js`,
        `findAllFeesElements`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single feesElement object basing on the options
   */
  static async findOneFeesElement(options) {
    try {
      const feesElement = await models.FeesElement.findOne({
        ...options,
      });

      return feesElement;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `feesElement.service.js`,
        `findOneFeesElement`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single feesElement object from data object
   *@
   */
  static async createFeesElement(data, transaction) {
    try {
      const result = await models.FeesElement.findOrCreate({
        where: {
          [Op.or]: [
            { fees_element_code: trim(data.fees_element_code) },
            { fees_element_name: trim(data.fees_element_name) },
          ],
        },
        defaults: {
          ...data,
        },
        transaction,
      });

      if (result[1] === false) {
        const updated = await models.FeesElement.update(
          { ...data },
          {
            where: { id: result[0].dataValues.id },
            transaction,
            returning: true,
          }
        );

        return updated[1][0];
      } else {
        return result;
      }
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `feesElement.service.js`,
        `createFeesElement`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of feesElement object to be updated
   * @returns {Promise}
   * @description updates a single feesElement object
   *@
   */
  static async updateFeesElement(id, data) {
    try {
      const updated = await models.FeesElement.update(
        { ...data },
        { where: { id }, returning: true }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `feesElement.service.js`,
        `updateFeesElement`,
        `PUT`
      );
    }
  }

  /**
   * @param {string} id  id of feesElement object to be deleted
   * @returns {Promise}
   * @description deletes a single feesElement object
   *@
   */
  static async deleteFeesElement(id) {
    try {
      const deleted = await models.FeesElement.destroy({
        where: { id },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `feesElement.service.js`,
        `deleteFeesElement`,
        `DELETE`
      );
    }
  }

  /** fetchAllFeesElementsWithTheirAmounts
   *
   * @param {*} data
   */
  static async fetchAllFeesElementsWithTheirAmounts(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from  fees_mgt.fees_elements_amounts_function(${data.campus}, ${data.academic_year}, ${data.intake}, 
          ${data.billing_category}, ${data.programme_study_year}, ${data.study_level}, ${data.programme}, ${data.programme_type},
          ${data.metadata_programme_type})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `feesElement.service.js`,
        `fetchAllFeesElementsWithTheirAmounts`,
        `GET`
      );
    }
  }

  /** fetchAllFeesElementsWithTheirAmounts
   *
   * @param {*} data
   */
  static async getOneFeesElementsWithTheirAmounts(data, feesElementId) {
    try {
      const filtered = await models.sequelize.query(
        `select * from  fees_mgt.bulk_invoice_fee_elements(${data.campus}, ${data.academic_year}, ${data.intake}, 
          ${data.billing_category}, ${data.programme_study_year}, ${data.study_level}, ${data.programme}, ${data.programme_type},
          ${data.metadata_programme_type}, ${feesElementId})`,
        {
          type: QueryTypes.SELECT,
          plain: true,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `feesElement.service.js`,
        `getOneFeesElementsWithTheirAmounts`,
        `GET`
      );
    }
  }
}

module.exports = FeesElementService;
