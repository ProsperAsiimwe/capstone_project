const models = require('@models');
const { QueryTypes } = require('sequelize');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling Fees copy
class FeesCopyService {
  /**
   * findAllRequests
   * @param {*} options
   */
  static async findAllRequests(options) {
    try {
      const results = await models.FeesCopyPermission.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `feesCopy.service.js`,
        `findAllRequests`,
        `GET`
      );
    }
  }

  /**
   * requestFeesCopy
   * @param {*} data
   */
  static async requestFeesCopy(data) {
    try {
      const result = await models.FeesCopyPermission.create({
        ...data,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `feesCopy.service.js`,
        `requestFeesCopy`,
        `POST`
      );
    }
  }

  /**
   * findOneRequestForFeesCopy
   * @param {*} options
   */
  static async findOneRequestForFeesCopy(options) {
    try {
      const record = await models.FeesCopyPermission.findOne({
        ...options,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `feesCopy.service.js`,
        `findOneRequestForFeesCopy`,
        `GET`
      );
    }
  }

  /** updateRequestForFeesCopy
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async updateRequestForFeesCopy(id, data, transaction) {
    try {
      const result = await models.FeesCopyPermission.update(
        {
          ...data,
        },
        { where: { id }, transaction, returning: true }
      );

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `feesCopy.service.js`,
        `updateRequestForFeesCopy`,
        `PUT`
      );
    }
  }

  // /**
  //  *
  //  * @param {*} data
  //  * @param {*} transaction
  //  */
  static async createTuitionAmount(data, transaction) {
    try {
      const result = await models.TuitionAmount.findOrCreate({
        where: {
          campus_id: data.campus_id,
          intake_id: data.intake_id,
          academic_year_id: data.academic_year_id,
          billing_category_id: data.billing_category_id,
          programme_id: data.programme_id,
          programme_type_id: data.programme_type_id,
          study_year_id: data.study_year_id,
        },
        defaults: {
          ...data,
        },
        include: [
          {
            association: models.TuitionAmount.tuitionAmountFeesElements,
            include: [
              {
                association: models.TuitionAmountFeesElement.approvals,
              },
            ],
          },
        ],
        transaction,
      });

      if (result[1] === false) {
        for (const item of data.tuitionAmountFeesElements) {
          item.tuition_amount_id = result[0].dataValues.id;

          await models.TuitionAmountFeesElement.findOrCreate({
            where: {
              tuition_amount_id: item.tuition_amount_id,
              fees_element_id: item.fees_element_id,
            },
            defaults: {
              ...item,
            },
            include: [
              {
                association: models.TuitionAmountFeesElement.approvals,
              },
            ],
            transaction,
          });
        }
      }

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `feesCopy.service.js`,
        `createTuitionAmount`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async bulkCreateTuitionAmount(data, transaction) {
    try {
      const result = await models.TuitionAmount.bulkCreate(data, {
        include: [
          {
            association: models.TuitionAmount.tuitionAmountFeesElements,
            include: [
              {
                association: models.TuitionAmountFeesElement.approvals,
              },
            ],
          },
        ],
        transaction,
        returning: true,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `feesCopy.service.js`,
        `bulkCreateTuitionAmount`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async bulkCreateTuitionAmountFeesElements(
    tuitionAmountFeesElementsArray,
    transaction
  ) {
    try {
      for (const obj of tuitionAmountFeesElementsArray) {
        for (const item of obj.tuitionAmountFeesElements) {
          await models.TuitionAmountFeesElement.findOrCreate({
            where: {
              tuition_amount_id: obj.tuition_amount_id,
              fees_element_id: item.fees_element_id,
            },
            defaults: {
              ...item,
            },
            include: [
              {
                association: models.TuitionAmountFeesElement.approvals,
              },
            ],
            transaction,
          });
        }
      }
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `feesCopy.service.js`,
        `bulkCreateTuitionAmountFeesElements`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async createFunctionalAmount(data, transaction) {
    try {
      const result = await models.FunctionalFeesAmount.findOrCreate({
        where: {
          intake_id: data.intake_id,
          campus_id: data.campus_id,
          academic_year_id: data.academic_year_id,
          billing_category_id: data.billing_category_id,
          programme_type_id: data.programme_type_id,
          programme_study_level_id: data.programme_study_level_id,
        },
        defaults: {
          ...data,
        },
        include: [
          {
            association:
              models.FunctionalFeesAmount.functionalFeesAmountFeesElements,
            include: [
              {
                association: models.FunctionalFeesAmountFeesElement.approvals,
              },
            ],
          },
        ],
        transaction,
      });

      if (result[1] === false) {
        for (const item of data.functionalFeesAmountFeesElements) {
          item.functional_fees_amount_id = result[0].dataValues.id;

          await models.FunctionalFeesAmountFeesElement.findOrCreate({
            where: {
              functional_fees_amount_id: item.functional_fees_amount_id,
              fees_element_id: item.fees_element_id,
            },
            defaults: {
              ...item,
            },
            include: [
              {
                association: models.FunctionalFeesAmountFeesElement.approvals,
              },
            ],
            transaction,
          });
        }
      }

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `feesCopy.service.js`,
        `createFunctionalAmount`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async createOtherFeesAmount(data, transaction) {
    try {
      const result = await models.OtherFeesAmount.findOrCreate({
        where: {
          intake_id: data.intake_id,
          campus_id: data.campus_id,
          billing_category_id: data.billing_category_id,
          academic_year_id: data.academic_year_id,
        },
        defaults: {
          ...data,
        },
        include: [
          {
            association: models.OtherFeesAmount.otherFeesAmountFeesElements,
            include: [
              {
                association: models.OtherFeesAmountFeesElement.approvals,
              },
            ],
          },
        ],
        transaction,
      });

      if (result[1] === false) {
        for (const item of data.otherFeesAmountFeesElements) {
          item.other_fees_amount_id = result[0].dataValues.id;

          await models.OtherFeesAmountFeesElement.findOrCreate({
            where: {
              other_fees_amount_id: item.other_fees_amount_id,
              fees_element_id: item.fees_element_id,
            },
            defaults: {
              ...item,
            },
            include: [
              {
                association: models.OtherFeesAmountFeesElement.approvals,
              },
            ],
            transaction,
          });
        }
      }

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `feesCopy.service.js`,
        `createOtherFeesAmount`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async createWaiverDiscountAmount(data, transaction) {
    try {
      const result = await models.FeesWaiverDiscount.findOrCreate({
        where: {
          intake_id: data.intake_id,
          campus_id: data.campus_id,
          fees_waiver_id: data.fees_waiver_id,
          academic_year_id: data.academic_year_id,
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

      if (result[1] === false) {
        for (const item of data.discountedElements) {
          item.fees_waiver_discount_id = result[0].dataValues.id;

          await models.FeesWaiverDiscountFeesElement.findOrCreate({
            where: {
              fees_waiver_discount_id: item.fees_waiver_discount_id,
              fees_element_id: item.fees_element_id,
            },
            defaults: {
              ...item,
            },
            include: [
              {
                association: models.FeesWaiverDiscountFeesElement.approvals,
              },
            ],
            transaction,
          });
        }
      }

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `feesCopy.service.js`,
        `createWaiverDiscountAmount`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description
   *
   * tuition fees copy function
   *@
   */

  static async tuitionFeesCopy(data) {
    try {
      const filtered = await models.sequelize.query(
        `select *
        from fees_mgt.tuition_fees_copy_function(${data.campus_id},${data.academic_year_id},${data.intake_id})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `feesCopy.service.js`,
        `tuitionFeesCopy`,
        `GET`
      );
    }
  }

  /**
   *
   * functional fees copy
   *
   */
  static async functionalFeesCopy(data) {
    try {
      const filtered = await models.sequelize.query(
        `select *
        from fees_mgt.function_fees_copy_function(${data.campus_id},${data.academic_year_id},${data.intake_id})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `feesCopy.service.js`,
        `functionalFeesCopy`,
        `GET`
      );
    }
  }

  /**
   *
   * other fees copy
   *
   */
  static async otherFeesCopy(data) {
    try {
      const filtered = await models.sequelize.query(
        `select *
        from fees_mgt.other_fees_copy_function(${data.campus_id},${data.academic_year_id},${data.intake_id})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `feesCopy.service.js`,
        `otherFeesCopy`,
        `GET`
      );
    }
  }

  /**
   *
   * waiver fees copy
   *
   */
  static async waiverFeesCopy(data) {
    try {
      const filtered = await models.sequelize.query(
        `select *
        from fees_mgt.waiver_fees_copy_function(${data.campus_id},${data.academic_year_id},${data.intake_id})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `feesCopy.service.js`,
        `waiverFeesCopy`,
        `GET`
      );
    }
  }
}

module.exports = FeesCopyService;
