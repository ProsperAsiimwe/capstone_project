const models = require('@models');
const { QueryTypes } = require('sequelize');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions
class ApplicantProgrammeChoiceService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all admission schemes or filtered using options param
   *
   *
   * ---
   */
  static async findAllApplicantProgrammeChoices(options) {
    try {
      const results = await models.ApplicantProgrammeChoice.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applicantProgrammeChoice.service.js`,
        `findAllApplicantProgrammeChoices`,
        `GET`
      );
    }
  }

  // applicant programme choices
  static async applicantProgrammeChoice(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from admissions_mgt.applicant_choices_function(${data.applicant_id},
          '${data.form_id}')`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applicantProgrammeChoice.service.js`,
        `applicantProgrammeChoice`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single object basing on the options
   */
  static async findOneApplicantProgrammeChoice(options) {
    try {
      const result = await models.ApplicantProgrammeChoice.findOne({
        ...options,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applicantProgrammeChoice.service.js`,
        `findOneApplicantProgrammeChoice`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single object from data object
   *@
   */
  static async createApplicantProgrammeChoice(data, transaction) {
    try {
      const result = await models.ApplicantProgrammeChoice.findOrCreate({
        where: {
          programme_campus_id: data.programme_campus_id,
          running_admission_id: data.running_admission_id,
          applicant_id: data.applicant_id,
          form_id: data.form_id,
        },
        defaults: { ...data },
        transaction,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applicantProgrammeChoice.service.js`,
        `createApplicantProgrammeChoice`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of  object to be updated
   * @returns {Promise}
   * @description updates a single  object
   *@
   */
  static async updateApplicantProgrammeChoice(constraints, data, transaction) {
    try {
      const updated = await models.ApplicantProgrammeChoice.update(
        { ...data },
        {
          where: constraints,
          transaction,
          returning: true,
        }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applicantProgrammeChoice.service.js`,
        `updateApplicantProgrammeChoice`,
        `PUT`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of  object to be updated
   * @returns {Promise}
   * @description updates a single  object
   *@
   */
  static async updateApplicantProgrammeChoiceWithoutTransaction(
    constraints,
    data
  ) {
    try {
      const updated = await models.ApplicantProgrammeChoice.update(
        { ...data },
        {
          where: constraints,
          returning: true,
        }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `applicantProgrammeChoice.service.js`,
        `updateApplicantProgrammeChoiceWithoutTransaction`,
        `PUT`
      );
    }
  }
}

module.exports = ApplicantProgrammeChoiceService;
