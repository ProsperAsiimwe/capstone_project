const models = require('@models');
const { QueryTypes } = require('sequelize');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for a otherFeesAmount
class OtherFeesAmountService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all faculties or filtered using options param
   */
  static async findAllOtherFeesAmounts(options) {
    try {
      const results = await models.OtherFeesAmount.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `otherFeesAmount.service.js`,
        `findAllOtherFeesAmounts`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single otherFeesAmount object basing on the options
   */
  static async findOneOtherFeesAmount(options) {
    try {
      const otherFeesAmount = await models.OtherFeesAmount.findOne({
        ...options,
      });

      return otherFeesAmount;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `otherFeesAmount.service.js`,
        `findOneOtherFeesAmount`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single otherFeesAmount object from data object
   *@
   */

  static async createOtherFeesAmount(data, transaction) {
    try {
      const record = await models.OtherFeesAmount.findOrCreate({
        where: {
          campus_id: data.campus_id,
          academic_year_id: data.academic_year_id,
          intake_id: data.intake_id,
          billing_category_id: data.billing_category_id,
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

      if (record[1] === false) {
        const otherFeesAmountId = record[0].dataValues.id;

        for (const eachAmountElement of data.otherFeesAmountFeesElements) {
          const elements = await models.OtherFeesAmountFeesElement.findOrCreate(
            {
              where: {
                fees_element_id: eachAmountElement.fees_element_id,
                other_fees_amount_id: otherFeesAmountId,
              },
              defaults: {
                ...eachAmountElement,
              },
              include: [
                {
                  association: models.OtherFeesAmountFeesElement.approvals,
                },
              ],
              transaction,
            }
          );

          if (elements[1] === false) {
            throw new Error(
              `Record of Academic Year: ${eachAmountElement.academicYearName} With Element: ${eachAmountElement.elementName} Of Amount: ${eachAmountElement.amount} for Intake: ${data.intakeName}, Campus: ${data.campusName} Already Exists For It's Context.`
            );
          }
        }
      }

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `otherFeesAmount.service.js`,
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
  static async createOtherFeesAmountFeesElement(data, transaction) {
    try {
      const result = await models.OtherFeesAmountFeesElement.findOrCreate({
        where: {
          fees_element_id: data.fees_element_id,
          other_fees_amount_id: data.other_fees_amount_id,
        },
        defaults: {
          ...data,
        },
        include: [
          {
            association: models.OtherFeesAmountFeesElement.approvals,
          },
        ],
        transaction,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `otherFeesAmount.service.js`,
        `createOtherFeesAmountFeesElement`,
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
      const result = await models.OtherFeesAmountPermission.create(data, {
        transaction,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `otherFeesAmount.service.js`,
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
      const deleted = await models.OtherFeesAmountPermission.destroy({
        where: { id },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `otherFeesAmount.service.js`,
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
      const result = await models.OtherFeesAmountPermission.findOne({
        ...options,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `otherFeesAmount.service.js`,
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
      const updated = await models.OtherFeesAmountPermission.update(
        { ...data },
        { where: { id }, transaction, returning: true }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `otherFeesAmount.service.js`,
        `updateRequestForApproval`,
        `PUT`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of otherFeesAmount object to be updated
   * @returns {Promise}
   * @description updates a single otherFeesAmount object
   *@
   */
  static async updateOtherFeesAmount(id, data) {
    try {
      const updated = await models.OtherFeesAmount.update(
        { ...data },
        { where: { id }, returning: true }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `otherFeesAmount.service.js`,
        `updateOtherFeesAmount`,
        `PUT`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description  Filters through otherFeesAmounts records to match those from req.query
   *@
   */

  static async filterOtherFeesAmountRecords(data) {
    try {
      const filtered = await models.sequelize.query(
        `select *
	from fees_mgt.other_fees_metadata_value_view
	where (campus_id = ${data.campus_id} AND academic_year_id = ${data.academic_year_id} AND
		   intake_id = ${data.intake_id} AND billing_category_id =  ${data.billing_category_id})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `otherFeesAmount.service.js`,
        `filterOtherFeesAmountRecords`,
        `GET`
      );
    }
  }

  /**
   * @param {string} id  id of otherFeesAmount object to be deleted
   * @returns {Promise}
   * @description deletes a single otherFeesAmount object
   *@
   */
  static async deleteOtherFeesAmount(id) {
    try {
      const deleted = await models.OtherFeesAmount.destroy({
        where: { id },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `otherFeesAmount.service.js`,
        `deleteOtherFeesAmount`,
        `DELETE`
      );
    }
  }

  /**
   * @param {string} id  id of otherFeesAmountFeesElement object to be deleted
   * @returns {Promise}
   * @description deletes a single otherFeesAmountElement object
   *@
   */
  static async deleteOtherFeesAmountFeesElement(id) {
    try {
      const deleted = await models.OtherFeesAmountFeesElement.destroy({
        where: { id },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `otherFeesAmount.service.js`,
        `deleteOtherFeesAmountFeesElement`,
        `DELETE`
      );
    }
  }

  /**
   * @param {string} id  id of otherFeesAmountFeesElement object to be updated
   * @returns {Promise}
   * @description updates a single otherFeesAmountElement object
   *@
   */

  static async updateOtherFeesAmountFeesElement(id, data, transaction) {
    try {
      const updated = await models.OtherFeesAmountFeesElement.update(
        { ...data },
        { where: { id }, transaction, returning: true }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `otherFeesAmount.service.js`,
        `updateOtherFeesAmountFeesElement`,
        `PUT`
      );
    }
  }

  /**
   *
   * other fees element by view f
   */

  static async fetchOtherFeesElementsByView() {
    try {
      const filtered = await models.sequelize.query(
        `select *
        from fees_mgt.other_fees_view`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `otherFeesAmount.service.js`,
        `fetchOtherFeesElementsByView`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single OtherFeesAmountFeesElement object basing on the options
   */
  static async findOneOtherFeesAmountFeesElementRecord(options) {
    try {
      const result = await models.OtherFeesAmountFeesElement.findOne({
        ...options,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `otherFeesAmount.service.js`,
        `findOneOtherFeesAmountFeesElementRecord`,
        `GET`
      );
    }
  }
}

module.exports = OtherFeesAmountService;
