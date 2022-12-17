const models = require('@models');
const { QueryTypes } = require('sequelize');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for a feesWaiverDiscount
class FeesWaiverDiscountService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all faculties or filtered using options param
   */
  static async findAllFeesWaiverDiscounts(options) {
    try {
      const results = await models.FeesWaiverDiscount.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `feesWaiverDiscount.service.js`,
        `findAllFeesWaiverDiscounts`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single feesWaiverDiscount object basing on the options
   */
  static async findOneFeesWaiverDiscount(options) {
    try {
      const feesWaiverDiscount = await models.FeesWaiverDiscount.findOne({
        ...options,
      });

      return feesWaiverDiscount;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `feesWaiverDiscount.service.js`,
        `findOneFeesWaiverDiscount`,
        `GET`
      );
    }
  }

  /**
   * createFeesWaiverDiscount
   * @param {*} feesWaiverDiscountId
   * @param {*} data
   */
  static async createFeesWaiverDiscount(data, transaction) {
    try {
      const record = await models.FeesWaiverDiscount.findOrCreate({
        where: {
          campus_id: data.campus_id,
          academic_year_id: data.academic_year_id,
          intake_id: data.intake_id,
          fees_waiver_id: data.fees_waiver_id,
        },
        defaults: {
          ...data,
        },
        include: [
          {
            association: models.FeesWaiverDiscount.discountedElements,
            include: [
              {
                association: models.FeesWaiverDiscountFeesElement.approvals,
              },
            ],
          },
        ],
        transaction,
      });

      if (record[1] === false) {
        const feesWaiverDiscountId = record[0].dataValues.id;

        for (const eachAmountElement of data.discountedElements) {
          const elements =
            await models.FeesWaiverDiscountFeesElement.findOrCreate({
              where: {
                fees_element_id: eachAmountElement.fees_element_id,
                fees_waiver_discount_id: feesWaiverDiscountId,
              },
              defaults: {
                ...eachAmountElement,
              },
              include: [
                {
                  association: models.FeesWaiverDiscountFeesElement.approvals,
                },
              ],
              transaction,
            });

          if (elements[1] === false) {
            throw new Error(
              `Record of Academic Year: ${data.academicYearName}, Intake: ${data.intakeName} and Campus: ${data.campusName} With Element Of Discount ${eachAmountElement.percentage_discount} % Already Exists For It's Context.`
            );
          }
        }
      }

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `feesWaiverDiscount.service.js`,
        `createFeesWaiverDiscount`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async createDiscountFeesElement(data, transaction) {
    try {
      const result = await models.FeesWaiverDiscountFeesElement.findOrCreate({
        where: {
          fees_element_id: data.fees_element_id,
          fees_waiver_discount_id: data.fees_waiver_discount_id,
        },
        defaults: {
          ...data,
        },
        include: [
          {
            association: models.FeesWaiverDiscountFeesElement.approvals,
          },
        ],
        transaction,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `feesWaiverDiscount.service.js`,
        `createDiscountFeesElement`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of feesWaiverDiscount object to be updated
   * @returns {Promise}
   * @description updates a single feesWaiverDiscount object
   *@
   */
  static async updateFeesWaiverDiscount(id, data) {
    try {
      const updated = await models.FeesWaiverDiscount.update(
        { ...data },
        { where: { id }, returning: true }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `feesWaiverDiscount.service.js`,
        `updateFeesWaiverDiscount`,
        `PUT`
      );
    }
  }

  /**
   * findOneRequestForApproval
   * @param {*} id
   * @param {*} data
   */
  static async findOneRequestForApproval(options) {
    try {
      const result = await models.FeesWaiverAmountPermission.findOne({
        ...options,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `feesWaiverDiscount.service.js`,
        `findOneRequestForApproval`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async createAmountFeesElementApproval(data, transaction) {
    try {
      const result = await models.FeesWaiverAmountPermission.create(data, {
        transaction,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `feesWaiverDiscount.service.js`,
        `createAmountFeesElementApproval`,
        `POST`
      );
    }
  }

  /**
   * updateRequestForApproval
   * @param {*} id
   * @param {*} data
   */
  static async updateRequestForApproval(id, data, transaction) {
    try {
      const updated = await models.FeesWaiverAmountPermission.update(
        { ...data },
        { where: { id }, transaction, returning: true }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `feesWaiverDiscount.service.js`,
        `updateRequestForApproval`,
        `UPDATE`
      );
    }
  }

  /**
   *
   * @param {*} id
   */
  static async deleteAmountFeesElementApproval(id) {
    try {
      const deleted = await models.FeesWaiverAmountPermission.destroy({
        where: { id },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `feesWaiverDiscount.service.js`,
        `deleteAmountFeesElementApproval`,
        `DELETE`
      );
    }
  }

  /**
   * @param {string} id  id of feesWaiverDiscount object to be deleted
   * @returns {Promise}
   * @description deletes a single feesWaiverDiscount object
   *@
   */
  static async deleteFeesWaiverDiscount(id) {
    try {
      const deleted = await models.FeesWaiverDiscount.destroy({
        where: { id },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `feesWaiverDiscount.service.js`,
        `deleteFeesWaiverDiscount`,
        `DELETE`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description  Filters through FeesWaiverDiscount records to match those from req.query
   *@
   */
  static async filterFeesWaiverDiscountRecords(data) {
    try {
      const filtered = await models.sequelize.query(
        `select *
	from fees_mgt.fees_waiver_discount_view
	where (campus_id = ${data.campus_id} AND academic_year_id = ${data.academic_year_id} AND
		   intake_id = ${data.intake_id} AND fees_waiver_id =  ${data.fees_waiver_id})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `feesWaiverDiscount.service.js`,
        `filterFeesWaiverDiscountRecords`,
        `GET`
      );
    }
  }

  /**
   * @param {string} id  id of discountedFeesElement object to be deleted
   * @returns {Promise}
   * @description deletes a single discountedFeesElement object
   *@
   */
  static async deleteDiscountedFeesElement(id) {
    try {
      const deleted = await models.FeesWaiverDiscountFeesElement.destroy({
        where: { id },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `feesWaiverDiscount.service.js`,
        `deleteDiscountedFeesElement`,
        `DELETE`
      );
    }
  }

  /**
   * @param {string} id  id of discountedFeesElement object to be updated
   * @returns {Promise}
   * @description updates a single discountedFeesElement object
   *@
   */

  static async updateDiscountedFeesElement(id, data, transaction) {
    try {
      const updated = await models.FeesWaiverDiscountFeesElement.update(
        { ...data },
        { where: { id }, transaction, returning: true }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `feesWaiverDiscount.service.js`,
        `updateDiscountedFeesElement`,
        `PUT`
      );
    }
  }
}

module.exports = FeesWaiverDiscountService;
