const models = require('@models');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for a gradingValue
class GradingValueService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all faculties or filtered using options param
   */
  static async findAllGradingValues(options) {
    try {
      const results = await models.GradingValue.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `gradingValue.service.js`,
        `findAllGradingValues`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single gradingValue object basing on the options
   */
  static async findOneGradingValue(options) {
    try {
      const gradingValue = await models.GradingValue.findOne({ ...options });

      return gradingValue;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `gradingValue.service.js`,
        `findOneGradingValue`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single gradingValue object from data object
   *@
   */
  static async createGradingValue(data) {
    try {
      const newGradingValue = await models.GradingValue.create({
        ...data,
      });

      return newGradingValue;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `gradingValue.service.js`,
        `createGradingValue`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of gradingValue object to be updated
   * @returns {Promise}
   * @description updates a single gradingValue object
   *@
   */
  static async updateGradingValue(id, data, transaction) {
    try {
      const updated = await models.GradingValue.update(
        { ...data },
        { where: { id }, transaction, returning: true }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `gradingValue.service.js`,
        `updateGradingValue`,
        `PUT`
      );
    }
  }

  static async updateManyGradingValues(gradingId, data) {
    try {
      const updatedGrading = await models.Grading.update(
        {
          grading_description: data.gradingDescription,
        },
        {
          where: { id: gradingId },
          returning: true,
        }
      );

      const { gradingValues } = data;
      const updatedValues = gradingValues.forEach(async function (
        gradingValue
      ) {
        const result = await models.GradingValue.update(
          { ...gradingValue },
          {
            where: { id: gradingValue.id, grading_id: gradingId },
            returning: true,
          }
        );

        return result;
      });

      return { ...updatedGrading, ...updatedValues };
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `gradingValue.service.js`,
        `updateManyGradingValues`,
        `PUT`
      );
    }
  }

  /**
   * BULK INSERT GRADING VALUES
   *
   * @param {*} data
   * @param {*} transaction
   * @returns
   */
  static async bulkCreateValues(data, transaction) {
    try {
      const result = await models.GradingValue.bulkCreate(data, {
        transaction,
        returning: true,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `gradingValue.service.js`,
        `bulkCreateValues`,
        `POST`
      );
    }
  }

  /**
   *  DELETE SINGLE GRADING VALUE
   *
   * @param {string} id  id of gradingValue object to be deleted
   * @returns {Promise}
   * @description deletes a single gradingValue object
   *@
   */
  static async deleteGradingValue(option) {
    try {
      const deleted = await models.GradingValue.destroy(option);

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `gradingValue.service.js`,
        `deleteGradingValue`,
        `DELETE`
      );
    }
  }
}

module.exports = GradingValueService;
