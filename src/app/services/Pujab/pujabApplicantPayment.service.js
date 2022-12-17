const models = require('@models');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for a institutionProgramme
class PujabApplicantPaymentService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all faculties or filtered using options param
   */
  static async findAll(options) {
    try {
      const results = await models.PujabApplicantPayment.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `pujabApplicantPayment.service.js`,
        `findAll`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single institutionProgramme object basing on the options
   */
  static async findOne(options) {
    try {
      const res = await models.PujabApplicantPayment.findOne({
        ...options,
      });

      return res;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `pujabApplicantPayment.service.js`,
        `findOne`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single institutionProgramme object from data object
   *@
   */
  static async findOrCreate(data, condition, transaction) {
    try {
      const record = await models.PujabApplicantPayment.findOrCreate({
        where: condition,
        defaults: {
          ...data,
        },
        transaction,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `pujabApplicantPayment.service.js`,
        `findOrCreate`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of institutionProgramme object to be updated
   * @returns {Promise}
   * @description updates a single institutionProgramme object
   *@
   */
  static async update(id, data) {
    try {
      const updated = await models.PujabApplicantPayment.update(
        { ...data },
        { where: { id }, returning: true }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `pujabApplicantPayment.service.js`,
        `update`,
        `PUT`
      );
    }
  }
}

module.exports = PujabApplicantPaymentService;
