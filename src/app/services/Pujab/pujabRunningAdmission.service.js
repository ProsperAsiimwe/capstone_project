const models = require('@models');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for a admission
class PujabRunningAdmissionService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all faculties or filtered using options param
   */
  static async findAllApplicants(options) {
    try {
      const results = await models.PujabRunningAdmission.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `pujabRunningAdmission.service.js`,
        `findAllApplicants`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all faculties or filtered using options param
   */
  static async getApplicationsReport(options) {
    try {
      const results = await models.PujabApplicationReportView.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `pujabRunningAdmission.service.js`,
        `getApplicationsReport`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all
   */
  static async findAllAdmissionInstitutions(options) {
    try {
      const results = await models.PujabAdmissionInstitution.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `pujabRunningAdmission.service.js`,
        `findAllAdmissionInstitutions`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single admission object basing on the options
   */
  static async findOneAdmission(options) {
    try {
      const admission = await models.PujabRunningAdmission.findOne({
        ...options,
      });

      return admission;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `pujabRunningAdmission.service.js`,
        `findOneAdmission`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single admission object basing on the options
   */
  static async getAcademicYearReportDetails(options) {
    try {
      const filtered = await models.PujabApplicationView.findAll(options);

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `pujabRunningAdmission.service.js`,
        `getAcademicYearReportDetails`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single admission object basing on the options
   */
  static async findOneApplicationView(options) {
    try {
      const filtered = await models.PujabApplicationView.findOne(options);

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `pujabRunningAdmission.service.js`,
        `getAcademicYearReportDetails`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single admission object basing on the options
   */
  static async findOnePujabAdmissionInstitution(options) {
    try {
      const admission = await models.PujabAdmissionInstitution.findOne({
        ...options,
      });

      return admission;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `pujabRunningAdmission.service.js`,
        `findOnePujabAdmissionInstitution`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single admission object from data object
   *@
   */
  static async createAdmission(data, transaction) {
    try {
      const record = await models.PujabRunningAdmission.findOrCreate({
        where: {
          academic_year_id: data.academic_year_id,
        },
        defaults: {
          ...data,
        },
        include: [
          {
            association: models.PujabRunningAdmission.institutions,
          },
        ],
        transaction,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `pujabRunningAdmission.service.js`,
        `createAdmission`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async bulkInsertAdmissionInstitutions(data, transaction) {
    try {
      const result = await models.PujabAdmissionInstitution.bulkCreate(data, {
        transaction,
        returning: true,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `pujabRunningAdmission.service.js`,
        `bulkInsertAdmissionInstitutions`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async createAdmissionInstitutionProgramme(data, transaction) {
    try {
      const result = await models.PujabAdmissionInstitutionProgramme.bulkCreate(
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
        `pujabRunningAdmission.service.js`,
        `createAdmissionInstitutionProgramme`,
        `POST`
      );
    }
  }

  /**
   * GET ADMISSION INSTITUTION PROGRAMMES
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async getAdmissionInstitutionProgrammes(options) {
    try {
      const result = await models.PujabAdmissionInstitutionProgramme.findAll(
        options
      );

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `pujabRunningAdmission.service.js`,
        `getAdmissionInstitutionProgrammes`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} data
   */
  static async bulkRemoveAdmissionInstitutions(data, transaction) {
    try {
      const deleted = await models.PujabAdmissionInstitution.destroy({
        where: { id: data },
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `pujabRunningAdmission.service.js`,
        `bulkRemoveAdmissionInstitutions`,
        `DELETE`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of admission object to be updated
   * @returns {Promise}
   * @description updates a single admission object
   *@
   */
  static async updateAdmission(id, data) {
    try {
      const updated = await models.PujabRunningAdmission.update(data, {
        where: { id },
        returning: true,
      });

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `pujabRunningAdmission.service.js`,
        `updateAdmission`,
        `PUT`
      );
    }
  }

  /**
   * @param {string} id  id of admission object to be deleted
   * @returns {Promise}
   * @description deletes a single admission object
   *@
   */
  static async deleteAdmission(id, transaction) {
    try {
      const deleted = await models.PujabRunningAdmission.destroy({
        where: { id },
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `pujabRunningAdmission.service.js`,
        `deleteAdmission`,
        `DELETE`
      );
    }
  }

  /**
   * CREATE BIO-DATA
   *
   * @param {string} id  id of admission object to be deleted
   * @returns {Promise}
   * @description deletes a single admission object
   *@
   */
  static async createBioData(data, transaction) {
    try {
      const result = await models.PujabBioData.create(data, {
        transaction,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `pujabRunningAdmission.service.js`,
        `createBioData`,
        `PujabAdmissionInstitution`,
        `DELETE`
      );
    }
  }

  /**
   *
   * @param {*} id
   * @param {*} transaction
   * @returns
   */
  static async deleteAdmissionInstitutions(id, transaction) {
    try {
      const deleted = await models.PujabAdmissionInstitution.destroy({
        where: { id },
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `pujabRunningAdmission.service.js`,
        `deleteAdmissionInstitutions`,
        `DELETE`
      );
    }
  }

  /**
   *
   * @param {*} id
   * @param {*} transaction
   * @returns
   */
  static async deletePujabAdmissionInstitutionProgrammes(data, transaction) {
    try {
      const deleted = await models.PujabAdmissionInstitutionProgramme.destroy({
        where: { id: data },
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `pujabRunningAdmission.service.js`,
        `deletePujabAdmissionInstitutionProgrammes`,
        `DELETE`
      );
    }
  }
}

module.exports = PujabRunningAdmissionService;
