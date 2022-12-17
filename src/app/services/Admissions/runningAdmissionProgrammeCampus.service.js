const models = require('@models');
const { QueryTypes } = require('sequelize');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for a runningAdmissionProgrammeCampus
class RunningAdmissionProgrammeCampusService {
  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single object basing on the options
   */
  static async fetchRunningAdmissionProgrammeSpecialFees(options) {
    try {
      const result = await models.RunningAdmissionProgrammeSpecialFee.findAll({
        ...options,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `runningAdmissionProgrammeCampus.service.js`,
        `fetchRunningAdmissionProgrammeSpecialFees`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single object basing on the options
   */
  static async findOneRunningAdmissionProgrammeSpecialFees(options) {
    try {
      const result = await models.RunningAdmissionProgrammeSpecialFee.findOne({
        ...options,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `runningAdmissionProgrammeCampus.service.js`,
        `findOneRunningAdmissionProgrammeSpecialFees`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all runningAdmissionProgrammeCampuses or filtered using options param
   */
  static async findAllRunningAdmissionProgrammeCampuses(options) {
    try {
      const results = await models.RunningAdmissionProgrammeCampus.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `runningAdmissionProgrammeCampus.service.js`,
        `findAllRunningAdmissionProgrammeCampuses`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all
   */
  static async findAllRunningAdmissionProgrammeCampusesEntryYears(options) {
    try {
      const results =
        await models.RunningAdmissionProgrammeCampusEntryYear.findAll({
          ...options,
        });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `runningAdmissionProgrammeCampus.service.js`,
        `findAllRunningAdmissionProgrammeCampusesEntryYears`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async bulkInsertRunningAdmissionProgrammeCampusEntryYears(
    data,
    transaction
  ) {
    try {
      const result =
        await models.RunningAdmissionProgrammeCampusEntryYear.bulkCreate(data, {
          transaction,
          returning: true,
        });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `runningAdmissionProgrammeCampus.service.js`,
        `bulkInsertRunningAdmissionProgrammeCampusEntryYears`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} data
   */
  static async bulkRemoveRunningAdmissionProgrammeCampusEntryYears(
    data,
    transaction
  ) {
    try {
      const deleted =
        await models.RunningAdmissionProgrammeCampusEntryYear.destroy({
          where: { id: data },
          transaction,
        });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `runningAdmissionProgrammeCampus.service.js`,
        `bulkRemoveRunningAdmissionProgrammeCampusEntryYears`,
        `DELETE`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all
   */
  static async findAllRunningAdmissionProgrammeCampusesSponsorships(options) {
    try {
      const results =
        await models.RunningAdmissionProgrammeCampusSponsorship.findAll({
          ...options,
        });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `runningAdmissionProgrammeCampus.service.js`,
        `findAllRunningAdmissionProgrammeCampusesSponsorships`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async bulkInsertRunningAdmissionProgrammeCampusSponsorships(
    data,
    transaction
  ) {
    try {
      const result =
        await models.RunningAdmissionProgrammeCampusSponsorship.bulkCreate(
          data,
          {
            transaction,
            returning: true,
          }
        );

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `runningAdmissionProgrammeCampus.service.js`,
        `bulkInsertRunningAdmissionProgrammeCampusSponsorships`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} data
   */
  static async bulkRemoveRunningAdmissionProgrammeCampusSponsorships(
    data,
    transaction
  ) {
    try {
      const deleted =
        await models.RunningAdmissionProgrammeCampusSponsorship.destroy({
          where: { id: data },
          transaction,
        });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `runningAdmissionProgrammeCampus.service.js`,
        `bulkRemoveRunningAdmissionProgrammeCampusSponsorships`,
        `DELETE`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all
   */
  static async findAllRunningAdmissionProgrammeCampusesCombinations(options) {
    try {
      const results =
        await models.RunningAdmissionProgrammeCampusCombination.findAll({
          ...options,
        });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `runningAdmissionProgrammeCampus.service.js`,
        `findAllRunningAdmissionProgrammeCampusesCombinations`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async bulkInsertRunningAdmissionProgrammeCampusCombinations(
    data,
    transaction
  ) {
    try {
      const result =
        await models.RunningAdmissionProgrammeCampusCombination.bulkCreate(
          data,
          {
            transaction,
            returning: true,
          }
        );

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `runningAdmissionProgrammeCampus.service.js`,
        `bulkInsertRunningAdmissionProgrammeCampusCombinations`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} data
   */
  static async bulkRemoveRunningAdmissionProgrammeCampusCombinations(
    data,
    transaction
  ) {
    try {
      const deleted =
        await models.RunningAdmissionProgrammeCampusCombination.destroy({
          where: { id: data },
          transaction,
        });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `runningAdmissionProgrammeCampus.service.js`,
        `bulkRemoveRunningAdmissionProgrammeCampusCombinations`,
        `DELETE`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all
   */
  static async findAllRunningAdmissionProgrammeSpecialFeeAmounts(options) {
    try {
      const results = await models.SpecialFeeAmount.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `runningAdmissionProgrammeCampus.service.js`,
        `findAllRunningAdmissionProgrammeSpecialFeeAmounts`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async bulkInsertRunningAdmissionProgrammeSpecialFeeAmounts(
    data,
    transaction
  ) {
    try {
      const result = await models.SpecialFeeAmount.bulkCreate(data, {
        transaction,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `runningAdmissionProgrammeCampus.service.js`,
        `bulkInsertRunningAdmissionProgrammeSpecialFeeAmounts`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} data
   */
  static async bulkRemoveRunningAdmissionProgrammeSpecialFeeAmounts(
    data,
    transaction
  ) {
    try {
      const deleted = await models.SpecialFeeAmount.destroy({
        where: { id: data },
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `runningAdmissionProgrammeCampus.service.js`,
        `bulkRemoveRunningAdmissionProgrammeSpecialFeeAmounts`,
        `DELETE`
      );
    }
  }

  /**
   *
   * @param {*} id
   * @param {*} data
   * @param {*} transaction
   * @returns
   */
  static async updateRunningAdmissionProgrammeSpecialFeeAmount(
    id,
    data,
    transaction
  ) {
    try {
      const updated = await models.SpecialFeeAmount.update(
        { ...data },
        { where: { id }, transaction, returning: true }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `runningAdmissionProgrammeCampus.service.js`,
        `updateRunningAdmissionProgrammeSpecialFeeAmount`,
        `PUT`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single runningAdmissionProgrammeCampus object basing on the options
   */
  static async findOneRunningAdmissionProgrammeCampus(options) {
    try {
      const runningAdmissionProgrammeCampus =
        await models.RunningAdmissionProgrammeCampus.findOne({
          ...options,
        });

      return runningAdmissionProgrammeCampus;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `runningAdmissionProgrammeCampus.service.js`,
        `findOneRunningAdmissionProgrammeCampus`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single runningAdmissionProgrammeCampus object from data object
   *@
   */

  static async createRunningAdmissionProgrammeCampus(data, transaction) {
    try {
      const result = await models.RunningAdmissionProgrammeCampus.bulkCreate(
        data,
        {
          include: [
            {
              association:
                models.RunningAdmissionProgrammeCampus.entryStudyYears,
            },
            {
              association: models.RunningAdmissionProgrammeCampus.sponsorships,
            },
          ],
          transaction,
          returning: true,
        }
      );

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `runningAdmissionProgrammeCampus.service.js`,
        `createRunningAdmissionProgrammeCampus`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single
   *@
   */

  static async insertRunningAdmissionProgrammeCampus(data, transaction) {
    try {
      const result = await models.RunningAdmissionProgrammeCampus.findOrCreate({
        where: {
          running_admission_programme_id: data.running_admission_programme_id,
          campus_id: data.campus_id,
          programme_type_id: data.programme_type_id,
          programme_alias_id: data.programme_alias_id
            ? data.programme_alias_id
            : null,
          capacity: data.capacity,
        },
        defaults: {
          ...data,
        },
        include: [
          {
            association: models.RunningAdmissionProgrammeCampus.entryStudyYears,
          },
          {
            association: models.RunningAdmissionProgrammeCampus.sponsorships,
          },
          {
            association: models.RunningAdmissionProgrammeCampus.combinations,
          },
        ],
        transaction,
      });

      if (result[1] === false) {
        for (const obj of data.entryStudyYears) {
          await models.RunningAdmissionProgrammeCampusEntryYear.findOrCreate({
            where: {
              running_admission_programme_campus_id: result[0].dataValues.id,
              entry_study_year_id: obj.entry_study_year_id,
            },
            defaults: {
              ...obj,
            },
            transaction,
          });
        }

        for (const obj of data.sponsorships) {
          await models.RunningAdmissionProgrammeCampusSponsorship.findOrCreate({
            where: {
              running_admission_programme_campus_id: result[0].dataValues.id,
              sponsorship_id: obj.sponsorship_id,
            },
            defaults: {
              ...obj,
            },
            transaction,
          });
        }

        for (const obj of data.combinations) {
          await models.RunningAdmissionProgrammeCampusCombination.findOrCreate({
            where: {
              running_admission_programme_campus_id: result[0].dataValues.id,
              subject_combination_id: obj.subject_combination_id,
            },
            defaults: {
              ...obj,
            },
            transaction,
          });
        }
      }

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `runningAdmissionProgrammeCampus.service.js`,
        `insertRunningAdmissionProgrammeCampus`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single
   *@
   */

  static async insertNewSpecialFee(data, transaction) {
    try {
      const result =
        await models.RunningAdmissionProgrammeSpecialFee.findOrCreate({
          where: {
            running_admission_programme_id: data.running_admission_programme_id,
            special_fee_name: data.special_fee_name,
          },
          defaults: {
            ...data,
          },
          include: [
            {
              association: models.RunningAdmissionProgrammeSpecialFee.amounts,
            },
          ],
          transaction,
        });

      if (result[1] === false) {
        for (const obj of data.amounts) {
          await models.SpecialFeeAmount.findOrCreate({
            where: {
              programme_special_fees_id: result[0].dataValues.id,
              billing_category_id: obj.billing_category_id,
            },
            defaults: {
              ...obj,
            },
            transaction,
          });
        }
      }

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `runningAdmissionProgrammeCampus.service.js`,
        `insertNewSpecialFee`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of runningAdmissionProgrammeCampus object to be updated
   * @returns {Promise}
   * @description updates a single runningAdmissionProgrammeCampus object
   *@
   */
  static async updateRunningAdmissionProgrammeCampus(id, data, transaction) {
    try {
      const updated = await models.RunningAdmissionProgrammeCampus.update(
        { ...data },
        { where: { id }, transaction, returning: true }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `runningAdmissionProgrammeCampus.service.js`,
        `updateRunningAdmissionProgrammeCampus`,
        `PUT`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of runningAdmissionProgrammeCampus object to be updated
   * @returns {Promise}
   * @description updates a single runningAdmissionProgrammeCampus object
   *@
   */
  static async updateRunningAdmissionProgrammeSpecialFee(
    id,
    data,
    transaction
  ) {
    try {
      const updated = await models.RunningAdmissionProgrammeSpecialFee.update(
        { ...data },
        { where: { id }, transaction, returning: true }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `runningAdmissionProgrammeCampus.service.js`,
        `updateRunningAdmissionProgrammeSpecialFee`,
        `PUT`
      );
    }
  }

  /**
   *
   * @param {*} id
   * @returns
   */
  static async deleteRunningAdmissionProgrammeSpecialFee(id) {
    try {
      const deleted = await models.RunningAdmissionProgrammeSpecialFee.destroy({
        where: { id },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `runningAdmissionProgrammeCampus.service.js`,
        `deleteRunningAdmissionProgrammeSpecialFee`,
        `DELETE`
      );
    }
  }

  /**
   * @param {string} id  id of runningAdmissionProgrammeCampus object to be deleted permanently
   * @returns {Promise}
   * @description deletes a single runningAdmissionProgrammeCampus object permanently
   *@
   */
  static async hardDeleteRunningAdmissionProgrammeCampus(id, transaction) {
    try {
      const deleted = await models.RunningAdmissionProgrammeCampus.destroy({
        where: { id },
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `runningAdmissionProgrammeCampus.service.js`,
        `hardDeleteRunningAdmissionProgrammeCampus`,
        `DELETE`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of runningAdmissionProgrammeCampus object to be soft deleted
   * @returns {Promise}
   * @description soft deletes a single runningAdmissionProgrammeCampus object
   *@
   */
  static async softDeleteRunningAdmissionProgrammeCampus(id, data) {
    try {
      const deleted = await models.RunningAdmissionProgrammeCampus.update(
        { ...data },
        { where: { id }, returning: false }
      );

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `runningAdmissionProgrammeCampus.service.js`,
        `softDeleteRunningAdmissionProgrammeCampus`,
        `PUT`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of the object to be soft delete undone
   * @returns {Promise}
   * @description undoes soft delete on a single object
   *@
   */
  static async undoSoftDeleteRunningAdmissionProgrammeCampus(id, data) {
    try {
      const undo = await models.RunningAdmissionProgrammeCampus.update(
        { ...data },
        { where: { id }, returning: false }
      );

      return undo;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `runningAdmissionProgrammeCampus.service.js`,
        `undoSoftDeleteRunningAdmissionProgrammeCampus`,
        `PUT`
      );
    }
  }

  /**
   *
   * @param {running admission programme campus}
   */
  static async findRunningAmissionProgrammeCampusContext() {
    try {
      const records = await models.sequelize.query(
        `select *
        from admissions_mgt.running_admission_programme_campus_view`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return records;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `runningAdmissionProgrammeCampus.service.js`,
        `findRunningAmissionProgrammeCampusContext`,
        `GET`
      );
    }
  }
}

module.exports = RunningAdmissionProgrammeCampusService;
