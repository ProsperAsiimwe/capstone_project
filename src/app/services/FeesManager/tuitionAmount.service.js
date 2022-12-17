/* eslint-disable no-console */
const models = require('@models');
const { QueryTypes } = require('sequelize');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for a tuitionAmount
class TuitionAmountService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all faculties or filtered using options param
   */
  static async findAllTuitionAmounts(options) {
    try {
      const results = await models.TuitionAmount.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `tuitionAmount.service.js`,
        `findAllTuitionAmounts`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single tuitionAmount object basing on the options
   */
  static async findOneTuitionAmount(options) {
    try {
      const tuitionAmount = await models.TuitionAmount.findOne({
        ...options,
      });

      return tuitionAmount;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `tuitionAmount.service.js`,
        `findOneTuitionAmount`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single tuitionAmount object from data object
   *@
   */
  static async createTuitionAmount(data, transaction) {
    try {
      const record = await models.TuitionAmount.findOrCreate({
        where: {
          campus_id: data.campus_id,
          academic_year_id: data.academic_year_id,
          intake_id: data.intake_id,
          billing_category_id: data.billing_category_id,
          study_year_id: data.study_year_id,
          programme_id: data.programme_id,
          programme_type_id: data.programme_type_id,
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

      if (record[1] === false) {
        const tuitionAmountId = record[0].dataValues.id;

        for (const eachAmountElement of data.tuitionAmountFeesElements) {
          const elements = await models.TuitionAmountFeesElement.findOrCreate({
            where: {
              fees_element_id: eachAmountElement.fees_element_id,
              tuition_amount_id: tuitionAmountId,
            },
            defaults: {
              ...eachAmountElement,
            },
            include: [
              {
                association: models.TuitionAmountFeesElement.approvals,
              },
            ],
            transaction,
          });

          if (elements[1] === false) {
            throw new Error(
              `Record of Programme: ${eachAmountElement.programmeName} With Element: ${eachAmountElement.elementName} Of Amount: ${eachAmountElement.amount} for Academic Year: ${data.academicYearName}, Intake: ${data.intakeName}, Billing Category: ${data.billingCategoryName} and Campus: ${data.campusName} Already Exists For It's Context.`
            );
          }
        }
      }

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `tuitionAmount.service.js`,
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
  static async createTuitionAmountFeesElement(data, transaction) {
    try {
      const result = await models.TuitionAmountFeesElement.findOrCreate({
        where: {
          fees_element_id: data.fees_element_id,
          tuition_amount_id: data.tuition_amount_id,
        },
        defaults: {
          ...data,
        },
        include: [
          {
            association: models.TuitionAmountFeesElement.approvals,
          },
        ],
        transaction,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `tuitionAmount.service.js`,
        `createTuitionAmountFeesElement`,
        `POST`
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
      const result = await models.TuitionAmountPermission.create(data, {
        transaction,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `tuitionAmount.service.js`,
        `createAmountFeesElementApproval`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} id
   */
  static async deleteAmountFeesElementApproval(id) {
    try {
      const deleted = await models.TuitionAmountPermission.destroy({
        where: { id },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `tuitionAmount.service.js`,
        `deleteAmountFeesElementApproval`,
        `DELETE`
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
      const result = await models.TuitionAmountPermission.findOne({
        ...options,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `tuitionAmount.service.js`,
        `findOneRequestForApproval`,
        `GET`
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
      const updated = await models.TuitionAmountPermission.update(
        { ...data },
        { where: { id }, transaction, returning: true }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `tuitionAmount.service.js`,
        `updateRequestForApproval`,
        `PUT`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of tuitionAmount object to be updated
   * @returns {Promise}
   * @description updates a single tuitionAmount object
   *@
   */
  static async updateTuitionAmount(id, data) {
    try {
      const updated = await models.TuitionAmount.update(
        { ...data },
        { where: { id }, returning: true }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `tuitionAmount.service.js`,
        `updateTuitionAmount`,
        `PUT`
      );
    }
  }

  /**
   * @param {string} id  id of tuitionAmount object to be deleted
   * @returns {Promise}
   * @description deletes a single tuitionAmount object
   *@
   */
  static async deleteTuitionAmount(id) {
    try {
      const deleted = await models.TuitionAmount.destroy({
        where: { id },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `tuitionAmount.service.js`,
        `deleteTuitionAmount`,
        `DELETE`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description  Filters through TuitionAmount records to match those from req.query
   *@
   */
  // static async filterTuitionAmountRecords(data) {
  //   console.log(data);
  //   try {
  //     const filtered = await models.sequelize.query(
  //       `select *
  // from fees_mgt.tuition_fees_amounts_view
  // where (campus_id = ${data.selectedCampus} AND academic_year_id = ${data.selectedAcademicYear} AND
  //      intake_id = ${data.selectedIntake} AND programme_id=${data.selectedProgramme}
  //     )`,
  //       {
  //         type: QueryTypes.SELECT,
  //       }
  //     );
  //     return filtered;
  //   } catch (error) {
  //     throw new Error(error.message);
  //   }
  // }

  /**
   * @param {string} id  id of tuitionAmountFeesElement object to be deleted
   * @returns {Promise}
   * @description deletes a single tuitionAmountFeesElement object
   *@
   */
  static async deleteTuitionAmountFeesElement(id) {
    try {
      const deleted = await models.TuitionAmountFeesElement.destroy({
        where: { id },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `tuitionAmount.service.js`,
        `deleteTuitionAmountFeesElement`,
        `DELETE`
      );
    }
  }

  /**
   * @param {string} id  id of tuitionAmountFeesElement object to be updated
   * @returns {Promise}
   * @description updates a single tuitionAmountFeesElement object
   *@
   */

  static async updateTuitionAmountFeesElement(id, data, transaction) {
    try {
      const updated = await models.TuitionAmountFeesElement.update(
        { ...data },
        { where: { id }, transaction, returning: true }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `tuitionAmount.service.js`,
        `updateTuitionAmountFeesElement`,
        `PUT`
      );
    }
  }

  static async findTuitionByContext(data) {
    try {
      const filtered = await models.sequelize.query(
        `select *
        from fees_mgt.tuition_amounts_function(${data.campus_id},${data.academic_year_id},${data.intake_id},${data.programme_id})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `tuitionAmount.service.js`,
        `findTuitionByContext`,
        `GET`
      );
    }
  }
}

module.exports = TuitionAmountService;
