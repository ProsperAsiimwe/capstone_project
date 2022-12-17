const models = require('@models/index');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for this entity
class ConcededPassPolicyService {
  /**
   *
   * @param {*} options
   */
  static async findAll(options) {
    try {
      const records = await models.ConcededPassPolicy.findAll({
        attributes: [
          'id',
          'number_of_sittings',
          'lower_mark',
          'upper_mark',
          'grading_id',
          'maximum_number_of_cps',
          'created_at',
          'updated_at',
        ],
        ...options,
        nest: true,
      });

      return records;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `concededPassPolicy.service.js`,
        `findAll`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single record object basing on the options
   */
  static async findOne(options = {}) {
    try {
      const record = await models.ConcededPassPolicy.findOne({
        attributes: [
          'id',
          'number_of_sittings',
          'lower_mark',
          'upper_mark',
          'grading_id',
          'maximum_number_of_cps',
          'created_at',
          'updated_at',
        ],
        ...options,
        nest: true,
      }).then(function (res) {
        if (res) {
          const result = res.toJSON();

          return result;
        }
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `concededPassPolicy.service.js`,
        `findOne`,
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
  static async create(data, transaction) {
    try {
      const result = await models.ConcededPassPolicy.findOrCreate({
        where: {
          grading_id: data.grading_id,
          remark_id: data.remark_id,
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
        `concededPassPolicy.service.js`,
        `create`,
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
  static async update(id, data) {
    try {
      const record = await models.ConcededPassPolicy.update(
        {
          ...data,
        },
        {
          where: {
            id,
          },
          returning: true,
        }
      );

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `concededPassPolicy.service.js`,
        `update`,
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
  static async destroy(id) {
    try {
      const deleted = await models.ConcededPassPolicy.destroy({
        where: { id },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `concededPassPolicy.service.js`,
        `destroy`,
        `DELETE`
      );
    }
  }
}

module.exports = ConcededPassPolicyService;
