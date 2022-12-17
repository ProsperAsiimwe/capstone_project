const models = require('@models');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for a result
class ElectivePositionService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all faculties or filtered using options param
   */
  static async findAll(options) {
    try {
      const result = await models.EVotingElectivePosition.findAll({
        ...options,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `electivePosition.service.js`,
        `findAll`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single object basing on the options
   */
  static async findOne(options) {
    try {
      const result = await models.EVotingElectivePosition.findOne({
        ...options,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `electivePosition.service.js`,
        `findOne`,
        `GET`
      );
    }
  }

  /**
   * Find Max
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single object basing on the options
   */
  static async findMax(column, options) {
    try {
      const result = await models.EVotingElectivePosition.max(column, {
        ...options,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `electivePosition.service.js`,
        `findMax`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single result object from data object
   *@
   */
  static async create(data, transaction) {
    try {
      const result = await models.EVotingElectivePosition.create(data, {
        include: [
          'votingColleges',
          'votingFaculties',
          'votingDepartments',
          'votingProgrammes',
        ],
        transaction,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `electivePosition.service.js`,
        `create`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of result object to be updated
   * @returns {Promise}
   * @description updates a single result object
   *@
   */
  static async update(id, data) {
    try {
      const updated = await models.EVotingElectivePosition.update(
        { ...data },
        { where: { id }, returning: true }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `electivePosition.service.js`,
        `update`,
        `PUT`
      );
    }
  }

  /**
   * @param {string} id  id of result object to be deleted
   * @returns {Promise}
   * @description deletes a single result object
   *@
   */
  static async destroy({ option }) {
    try {
      const deleted = await models.EVotingElectivePosition.destroy(option);

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `electivePosition.service.js`,
        `destroy`,
        `DELETE`
      );
    }
  }

  /**
   * FInd ALL Voting Programme Students
   *
   * @param  {object} options
   * @returns {Promise}
   * @description returns all faculties or filtered using options param
   */
  static async findAllVotingStudents(options) {
    try {
      const result = await models.EVotingStudent.findAll({
        ...options,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `electivePosition.service.js`,
        `findAll`,
        `GET`
      );
    }
  }

  /**
   * FInd ALL VERIFIED Students
   *
   * @param  {object} options
   * @returns {Promise}
   * @description returns all faculties or filtered using options param
   */
  static async findAllVerifiedStudents(options) {
    try {
      const result = await models.EligibleStudent.findAll({
        ...options,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `electivePosition.service.js`,
        `findAllEligibleStudents`,
        `GET`
      );
    }
  }

  /**
   * FInd ALL VERIFIED Students
   *
   * @param  {object} options
   * @returns {Promise}
   * @description returns all faculties or filtered using options param
   */
  static async bulkCreateVerifiedVoters(data, transaction) {
    try {
      const result = await models.EligibleStudent.bulkCreate(data, {
        ignoreDuplicates: true,
        transaction,
        returning: false,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `studentInvoiceSummary.service.js`,
        `bulkCreate`,
        `POST`
      );
    }
  }
}

module.exports = ElectivePositionService;
