const models = require('@models');

const { Op } = require('sequelize');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for a pujabApplicant
class PujabApplicantService {
  /**
   * FIND All PujabApplicant Records;
   *
   * @param  {object} options
   * @returns {Promise}
   * @description returns all pujabApplicants or filtered using options param
   */
  static async findAllPujabApplicants(options) {
    try {
      const pujabApplicants = await models.PujabApplicant.findAll({
        ...options,
      });

      return pujabApplicants;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `pujabApplicant.service.js`,
        `findAllPujabApplicants`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all  or filtered using options param
   */
  static async fetchAllPujabApplicantForms(options) {
    try {
      const results = await models.RunningAdmissionPujabApplicant.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `pujabApplicant.service.js`,
        `fetchAllPujabApplicantForms`,
        `GET`
      );
    }
  }

  /**
   * FIND One PujabApplicant Object;clear
   *
   *
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single pujabApplicant object basing on the options
   */
  static async findOnePujabApplicant(options) {
    try {
      const pujabApplicant = await models.PujabApplicant.findOne({
        ...options,
      });

      return pujabApplicant;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `pujabApplicant.service.js`,
        `findOnePujabApplicant`,
        `GET`
      );
    }
  }

  /**
   * FIND PujabApplicant by Email or Phone;
   *
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single pujabApplicant object basing on the options
   */
  static async findByEmailOrPhone(data) {
    try {
      const pujabApplicant = await models.PujabApplicant.findOne({
        where: {
          [Op.or]: [{ email: data }, { phone: data }],
        },
        attributes: {
          include: ['password'],
        },
        raw: true,
        plain: true,
      });

      return pujabApplicant;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `pujabApplicant.service.js`,
        `findByEmailOrPhone`,
        `GET`
      );
    }
  }

  /**
   * CREATE New PujabApplicant Record;
   *
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single pujabApplicant object from data object
   *@
   */
  static async createPujabApplicant(data) {
    try {
      const newPujabApplicant = await models.PujabApplicant.create({
        ...data,
      });

      return newPujabApplicant;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `pujabApplicant.service.js`,
        `createPujabApplicant`,
        `POST`
      );
    }
  }

  /**
   * UPDATE PujabApplicants table;
   *
   * @param  {object} data id of pujabApplicant object to be updated
   * @returns {Promise}
   * @description updates a single pujabApplicant object
   *@
   */
  static async updatePujabApplicant(id, data, transaction) {
    try {
      const updated = await models.PujabApplicant.update(
        { ...data },
        {
          where: { id },
          returning: true,
          transaction,
          excludes: ['password', 'remember_token'],
          raw: true,
        }
      )
        .then((resp) => resp[1][0])
        .catch((err) => {
          throw new Error(err.message);
        });

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `pujabApplicant.service.js`,
        `updatePujabApplicant`,
        `PUT`
      );
    }
  }

  /**
   * DELETE PujabApplicant Record;
   *
   * @param {string} option pujabApplicant object to be deleted
   * @returns {Promise}
   * @description deletes a single pujabApplicant object
   *@
   */
  static async deletePujabApplicant(option) {
    try {
      const deleted = await models.PujabApplicant.destroy({
        where: { ...option },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `pujabApplicant.service.js`,
        `deletePujabApplicant`,
        `DELETE`
      );
    }
  }

  /** VALIDATE PujabApplicant by phone and Email;
   *
   * @param  {Request} req
   * @returns {String} a specific error as a response from operation.
   */
  static async invalidPhoneAndEmail(data) {
    try {
      const pujabApplicant = await this.findOnePujabApplicant({
        where: {
          [Op.or]: [{ email: data.email }, { phone: data.phone }],
        },
        raw: true,
        attributes: ['id', 'email', 'phone'],
      });

      return pujabApplicant;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `pujabApplicant.service.js`,
        `invalidPhoneAndEmail`,
        `GET`
      );
    }
  }

  //  change password
  static async changePassword(id, data) {
    try {
      const updated = await models.PujabApplicant.update(
        { ...data },
        {
          where: { id },
          returning: true,
          excludes: ['password'],
        }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `pujabApplicant.service.js`,
        `changePassword`,
        `PUT`
      );
    }
  }
}

module.exports = PujabApplicantService;
