/* eslint-disable no-console */
const models = require('@models');
const moment = require('moment');
const { QueryTypes } = require('sequelize');
const { isEmpty, sumBy } = require('lodash');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for a graduationFees
class GraduationFeesService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all faculties or filtered using options param
   */
  static async findAllGraduationFees(options) {
    try {
      const results = await models.GraduationFees.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `graduationFees.service.js`,
        `findAllGraduationFees`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single graduationFees object basing on the options
   */
  static async findOneGraduationFees(options) {
    try {
      const graduationFees = await models.GraduationFees.findOne({
        ...options,
      });

      return graduationFees;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `graduationFees.service.js`,
        `findOneGraduationFees`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single graduationFees object basing on the options
   */
  static async findOneGraduationFeesInvoice(options) {
    try {
      const graduationFees = await models.GraduationFeesInvoice.findOne({
        ...options,
      });

      return graduationFees;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `graduationFees.service.js`,
        `findOneGraduationFeesInvoice`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description destroy destroyGraduationFeesInvoice
   */
  static async destroyGraduationFeesInvoice(options) {
    try {
      const graduationFees = await models.GraduationFeesInvoice.destroy({
        ...options,
      });

      return graduationFees;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `graduationFees.service.js`,
        `destroyGraduationFeesInvoice`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single graduationFees object from data object
   *@
   */
  static async createGraduationFees(data, transaction) {
    try {
      const record = await models.GraduationFees.findOrCreate({
        where: {
          campus_id: data.campus_id,
          grad_academic_year_id: data.grad_academic_year_id,
          billing_category_id: data.billing_category_id,
          programme_study_level_id: data.programme_study_level_id,
        },
        defaults: {
          ...data,
        },
        include: [
          {
            association: models.GraduationFees.graduationFeesElements,
          },
        ],
        transaction,
      });

      if (record[1] === false) {
        const graduationFeesId = record[0].dataValues.id;

        for (const eachAmountElement of data.graduationFeesElements) {
          await models.GraduationFeesAmount.findOrCreate({
            where: {
              fees_element_id: eachAmountElement.fees_element_id,
              graduation_fee_id: graduationFeesId,
            },
            defaults: {
              ...eachAmountElement,
            },
            transaction,
          });
        }
      }

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `graduationFees.service.js`,
        `createGraduationFees`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async createGraduationFeesAmount(data, transaction) {
    try {
      const result = await models.GraduationFeesAmount.findOrCreate({
        where: {
          fees_element_id: data.fees_element_id,
          graduation_fee_id: data.graduation_fee_id,
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
        `graduationFees.service.js`,
        `createGraduationFeesAmount`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single record object from data object
   *@
   */
  static async generateGraduationFeesInvoice(data, transaction) {
    try {
      const random = Math.floor(Math.random() * moment().unix());
      const generatedInvoiceNumber = `G-INV${random}`;

      if (!isEmpty(data.graduationInvoiceFeesElement)) {
        data.invoice_number = generatedInvoiceNumber;
        data.invoice_amount = sumBy(
          data.graduationInvoiceFeesElement,
          'amount'
        );
        data.amount_due = data.invoice_amount;

        const record = await models.GraduationFeesInvoice.create(data, {
          include: [
            {
              association:
                models.GraduationFeesInvoice.graduationInvoiceFeesElement,
            },
          ],
          transaction,
        });

        return record;
      }
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `graduationFees.service.js`,
        `generateGraduationFeesInvoice`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of graduationFees object to be updated
   * @returns {Promise}
   * @description updates a single graduationFees object
   *@
   */
  static async updateGraduationFees(id, data) {
    try {
      const updated = await models.GraduationFees.update(
        { ...data },
        { where: { id }, returning: true }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `graduationFees.service.js`,
        `updateGraduationFees`,
        `PUT`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of graduationFees object to be updated
   * @returns {Promise}
   * @description updates a single graduationFees object
   *@
   */
  static async updateGraduationFeesInvoice(id, data, transaction) {
    try {
      const updated = await models.GraduationFeesInvoice.update(
        { ...data },
        { where: { id }, transaction, returning: true }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `graduationFees.service.js`,
        `updateGraduationFeesInvoice`,
        `PUT`
      );
    }
  }

  /**
   * @param {string} id  id of graduationFees object to be deleted
   * @returns {Promise}
   * @description deletes a single graduationFees object
   *@
   */
  static async deleteGraduationFees(id) {
    try {
      const deleted = await models.GraduationFees.destroy({
        where: { id },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `graduationFees.service.js`,
        `deleteGraduationFees`,
        `DELETE`
      );
    }
  }

  /**
   * @param {string} id  id of graduationFeesElement object to be deleted
   * @returns {Promise}
   * @description deletes a single graduationFeesElement object
   *@
   */
  static async deleteGraduationFeesAmount(id) {
    try {
      const deleted = await models.GraduationFeesAmount.destroy({
        where: { id },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `graduationFees.service.js`,
        `deleteGraduationFeesAmount`,
        `DELETE`
      );
    }
  }

  /**
   * @param {string} id  id of graduationFeesElement object to be updated
   * @returns {Promise}
   * @description updates a single graduationFeesElement object
   *@
   */

  static async updateGraduationFeesAmount(id, data, transaction) {
    try {
      const updated = await models.GraduationFeesAmount.update(
        { ...data },
        { where: { id }, transaction, returning: true }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `graduationFees.service.js`,
        `updateGraduationFeesAmount`,
        `PUT`
      );
    }
  }

  // graduation fees context

  static async graduationFeesByContext(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from fees_mgt.graduation_fees_function(${data.campus_id},${data.academic_year_id},
          ${data.billing_category_id},${data.study_level_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `graduationFees.service.js`,
        `graduationFeesByContext`,
        `GET`
      );
    }
  }

  static async graduationInvoiceElement(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from fees_mgt.graduation_invoice_function(${data.studentProgrammeId})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `graduationFees.service.js`,
        `graduationFeesByContext`,
        `GET`
      );
    }
  }
}

module.exports = GraduationFeesService;
