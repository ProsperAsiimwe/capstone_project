const models = require('@models');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

class PujabApplicantUnebSelectionService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description
   */
  static async findAllApplicantsByFirstChoice(options) {
    try {
      const results = await models.ApplicantsByFirstChoice.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `pujabApplicantUnebSelection.service.js`,
        `findAllApplicantsByFirstChoice`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise}
   * @description
   */
  static async findoneApplicantByFirstChoice(options) {
    try {
      const result = await models.ApplicantsByFirstChoice.fineOne({
        ...options,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `pujabApplicantUnebSelection.service.js`,
        `findoneApplicantByFirstChoice`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise}
   * @description
   */
  static async findAllProposedMeritAdmissions(options) {
    try {
      const results = await models.ProposedMeritAdmission.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `pujabApplicantUnebSelection.service.js`,
        `findAllProposedMeritAdmissions`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise}
   * @description
   */
  static async findOneProposedMeritAdmission(options) {
    try {
      const result = await models.ProposedMeritAdmission.fineOne({
        ...options,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `pujabApplicantUnebSelection.service.js`,
        `findOneProposedMeritAdmission`,
        `GET`
      );
    }
  }

  /**
   *
   *
   * @param  {object} options
   * @returns {Promise}
   * @description returns all
   */
  static async uploadApplicantsByFirstChoice(data, transaction) {
    try {
      const results = await models.ApplicantsByFirstChoice.create(data, {
        include: [
          {
            association: models.ApplicantsByFirstChoice.uaceGrades,
          },
          {
            association: models.ApplicantsByFirstChoice.choices,
          },
        ],
        transaction,
      });

      // const results = await models.ApplicantsByFirstChoice.bulkCreate(data, {
      //   include: [
      //     {
      //       association: models.ApplicantsByFirstChoice.uaceGrades,
      //     },
      //     {
      //       association: models.ApplicantsByFirstChoice.choices,
      //     },
      //   ],
      //   transaction,
      //   returning: true,
      // });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `pujabApplicantUnebSelection.service.js`,
        `uploadApplicantsByFirstChoice`,
        `POST`
      );
    }
  }

  /**
   *
   *
   * @param  {object} options
   * @returns {Promise}
   * @description returns all
   */
  static async uploadProposedMeritAdmission(data, transaction) {
    try {
      const results = await models.ProposedMeritAdmission.create(data, {
        include: [
          {
            association: models.ProposedMeritAdmission.uaceGrades,
          },
          {
            association: models.ProposedMeritAdmission.choices,
          },
        ],
        transaction,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `pujabApplicantUnebSelection.service.js`,
        `uploadProposedMeritAdmission`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of
   * @returns {Promise}
   * @description updates a single admission object
   *@
   */
  static async updateApplicantsByFirstChoice(id, data, transaction) {
    try {
      const updated = await models.ApplicantsByFirstChoice.update(data, {
        where: { id },
        transaction,
        returning: true,
      });

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `pujabApplicantUnebSelection.service.js`,
        `updateApplicantsByFirstChoice`,
        `PUT`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of
   * @returns {Promise}
   * @description updates a single admission object
   *@
   */
  static async updateProposedMeritAdmission(id, data, transaction) {
    try {
      const updated = await models.ProposedMeritAdmission.update(data, {
        where: { id },
        transaction,
        returning: true,
      });

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `pujabApplicantUnebSelection.service.js`,
        `updateProposedMeritAdmission`,
        `PUT`
      );
    }
  }
}

module.exports = PujabApplicantUnebSelectionService;
