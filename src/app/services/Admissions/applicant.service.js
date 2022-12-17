const models = require('@models');

const { Op } = require('sequelize');
const { QueryTypes } = require('sequelize');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for a applicant
class ApplicantService {
  /**
   * FIND All Applicant Records;
   *
   * @param  {object} options
   * @returns {Promise}
   * @description returns all applicants or filtered using options param
   */
  static async findAllApplicants(options) {
    try {
      const applicants = await models.Applicant.findAll({
        ...options,
      });

      return applicants;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applicant.service.js`,
        `findAllApplicants`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all  or filtered using options param
   */
  static async fetchAllApplicantForms(options) {
    try {
      const results = await models.RunningAdmissionApplicant.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applicant.service.js`,
        `fetchAllApplicantForms`,
        `GET`
      );
    }
  }

  /**
   * FIND One Applicant Object;clear
   *
   *
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single applicant object basing on the options
   */
  static async findOneApplicant(options) {
    try {
      const applicant = await models.Applicant.findOne({
        ...options,
      });

      return applicant;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applicant.service.js`,
        `findOneApplicant`,
        `GET`
      );
    }
  }

  /**
   * FIND Applicant by Email or Phone;
   *
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single applicant object basing on the options
   */
  static async findByEmailOrPhone(data) {
    try {
      const applicant = await models.Applicant.findOne({
        where: {
          [Op.or]: [{ email: data }, { phone: data }],
        },
        attributes: {
          include: ['password'],
        },
        raw: true,
        plain: true,
      });

      return applicant;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applicant.service.js`,
        `findByEmailOrPhone`,
        `GET`
      );
    }
  }

  /**
   * CREATE New Applicant Record;
   *
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single applicant object from data object
   *@
   */
  static async createApplicant(data) {
    try {
      const newApplicant = await models.Applicant.create({
        ...data,
      });

      return newApplicant;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applicant.service.js`,
        `createApplicant`,
        `POST`
      );
    }
  }

  /**
   * UPDATE Applicants table;
   *
   * @param  {object} data id of applicant object to be updated
   * @returns {Promise}
   * @description updates a single applicant object
   *@
   */
  static async updateApplicant(id, data, transaction) {
    try {
      const updated = await models.Applicant.update(
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
        `applicant.service.js`,
        `updateApplicant`,
        `PUT`
      );
    }
  }

  /**
   * DELETE Applicant Record;
   *
   * @param {string} option applicant object to be deleted
   * @returns {Promise}
   * @description deletes a single applicant object
   *@
   */
  static async deleteApplicant(option) {
    try {
      const deleted = await models.Applicant.destroy({
        where: { ...option },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applicant.service.js`,
        `deleteApplicant`,
        `DELETE`
      );
    }
  }

  /** VALIDATE Applicant by phone and Email;
   *
   * @param  {Request} req
   * @returns {String} a specific error as a response from operation.
   */
  static async invalidPhoneAndEmail(data) {
    try {
      const applicant = await this.findOneApplicant({
        where: {
          [Op.or]: [{ email: data.email }, { phone: data.phone }],
        },
        raw: true,
        attributes: ['id', 'email', 'phone'],
      });

      return applicant;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applicant.service.js`,
        `invalidPhoneAndEmail`,
        `GET`
      );
    }
  }

  //  change password
  static async changePassword(id, data) {
    try {
      const updated = await models.Applicant.update(
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
        `applicant.service.js`,
        `changePassword`,
        `PUT`
      );
    }
  }

  //  check applicant admission status
  static async applicantAdmissionStatus(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from admissions_mgt.applicant_admission_status_function('${data.form_id}')
          `,
        {
          type: QueryTypes.SELECT,
          plain: true,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applicant.service.js`,
        `applicantAdmissionStatus`,
        `GET`
      );
    }
  }
}

module.exports = ApplicantService;
