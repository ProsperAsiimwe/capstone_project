const models = require('@models');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for a admittedApplicant
class AdmittedApplicantService {
  /**
   * FIND All AdmittedApplicant Records;
   *
   * @param  {object} options
   * @returns {Promise}
   * @description returns all admittedApplicants or filtered using options param
   */
  static async findAllAdmittedApplicants(options) {
    try {
      const result = await models.AdmittedApplicant.findAll({
        ...options,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `admittedApplicant.service.js`,
        `findAllAdmittedApplicants`,
        `GET`
      );
    }
  }

  /**
   * FIND One AdmittedApplicant Object;clear
   *
   *
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single admittedApplicant object basing on the options
   */
  static async findOneAdmittedApplicant(options) {
    try {
      const result = await models.AdmittedApplicant.findOne({
        ...options,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `admittedApplicant.service.js`,
        `findOneAdmittedApplicant`,
        `GET`
      );
    }
  }

  /**
   * CREATE New AdmittedApplicant Record;
   *
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single admittedApplicant object from data object
   *@
   */
  static async createAdmittedApplicant(data, transaction) {
    try {
      const result = await models.AdmittedApplicant.findOrCreate({
        where: {
          campus_id: data.campus_id,
          intake_id: data.intake_id,
          entry_academic_year_id: data.entry_academic_year_id,
          programme_id: data.programme_id,
          sponsorship_id: data.sponsorship_id,
          degree_category_id: data.degree_category_id,
          admission_scheme_id: data.admission_scheme_id,
          surname: data.surname,
          other_names: data.other_names,
          email: data.email,
          phone: data.phone,
        },
        defaults: {
          ...data,
        },
        transaction,
      });

      if (result[1] === false) {
        throw new Error(
          `Found a record similar to the one for entry: ${data.surname} ${data.other_names}.`
        );
      }

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `admittedApplicant.service.js`,
        `createAdmittedApplicant`,
        `POST`
      );
    }
  }

  /**
   * CREATE New AdmittedApplicant Record;
   *
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single admittedApplicant object from data object
   *@
   */
  static async administrativelyAdmitApplicant(data, transaction) {
    try {
      const result = await models.AdmittedApplicant.findOrCreate({
        where: {
          running_admission_applicant_id: data.running_admission_applicant_id,
        },
        defaults: {
          ...data,
        },
        transaction,
      });

      if (result[1] === false) {
        throw new Error(
          `Found a record similar to the one for entry: ${data.surname} ${data.other_names}.`
        );
      }

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `admittedApplicant.service.js`,
        `administrativelyAdmitApplicant`,
        `POST`
      );
    }
  }

  /**
   * CREATE
   *
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single admittedApplicant object from data object
   *@
   */
  static async createMigratedApplicant(data, transaction) {
    try {
      const result = await models.MigratedApplicant.findOrCreate({
        where: {
          migrated_form_id: data.migrated_form_id,
        },
        defaults: {
          ...data,
        },
        include: [
          {
            association: models.MigratedApplicant.choices,
          },
          {
            association: models.MigratedApplicant.highSchool,
          },
          {
            association: models.MigratedApplicant.employments,
          },
          {
            association: models.MigratedApplicant.qualifications,
          },
          {
            association: models.MigratedApplicant.referees,
          },
        ],
        transaction,
      });

      if (result[1] === false) {
        throw new Error(
          `Found a migrated form id similar to the one for record: ${data.surname} ${data.other_names}.`
        );
      }

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `admittedApplicant.service.js`,
        `createMigratedApplicant`,
        `POST`
      );
    }
  }

  /**
   * UPDATE AdmittedApplicants table;
   *
   * @param  {object} data id of admittedApplicant object to be updated
   * @returns {Promise}
   * @description updates a single admittedApplicant object
   *@
   */
  static async updateAdmittedApplicant(id, data, transaction) {
    try {
      const updated = await models.AdmittedApplicant.update(
        { ...data },
        {
          where: { id },
          returning: true,
          transaction,
          raw: true,
        }
      ).catch((err) => {
        throw new Error(err.message);
      });

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `admittedApplicant.service.js`,
        `updateAdmittedApplicant`,
        `PUT`
      );
    }
  }

  /**
   * UPDATE AdmittedApplicants table;
   *
   * @param  {object} data id of admittedApplicant object to be updated
   * @returns {Promise}
   * @description updates a single admittedApplicant object
   *@
   */
  static async updateAdmittedApplicantWithoutTransaction(id, data) {
    try {
      const updated = await models.AdmittedApplicant.update(
        { ...data },
        {
          where: { id },
          returning: true,
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
        `admittedApplicant.service.js`,
        `updateAdmittedApplicantWithoutTransaction`,
        `PUT`
      );
    }
  }

  /**
   * DELETE AdmittedApplicant Record;
   *
   * @param {string} option admittedApplicant object to be deleted
   * @returns {Promise}
   * @description deletes a single admittedApplicant object
   *@
   */
  static async deleteAdmittedApplicant(option) {
    try {
      const deleted = await models.AdmittedApplicant.destroy({
        where: { ...option },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `admittedApplicant.service.js`,
        `deleteAdmittedApplicant`,
        `DELETE`
      );
    }
  }

  static async deleteAdmittedApplicantRecord(option, transaction) {
    try {
      const deleted = await models.AdmittedApplicant.destroy(
        option,
        transaction
      );

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `admittedApplicant.service.js`,
        `deleteAdmittedApplicantRecord`,
        `DELETE`
      );
    }
  }
}

module.exports = AdmittedApplicantService;
