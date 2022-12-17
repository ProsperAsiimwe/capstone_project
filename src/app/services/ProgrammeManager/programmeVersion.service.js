const models = require('@models');
const { QueryTypes } = require('sequelize');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for a programmeVersion
class ProgrammeVersionService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all programmeVersions or filtered using options param
   */
  static async findAllProgrammeVersions(options) {
    try {
      const results = await models.ProgrammeVersion.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersion.service.js`,
        `findAllProgrammeVersions`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise}
   * @description
   */
  static async findOneProgrammeVersionPlan(options) {
    try {
      const results = await models.ProgrammeVersionPlan.findOne({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersion.service.js`,
        `findOneProgrammeVersionPlan`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise}
   * @description
   */
  static async findAllModuleOptions(options) {
    try {
      const results = await models.ProgrammeVersionModuleOption.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersion.service.js`,
        `findAllModuleOptions`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single programmeVersion object basing on the options
   */
  static async findOneProgrammeVersion(options) {
    try {
      const programmeVersion = await models.ProgrammeVersion.findOne({
        ...options,
      });

      return programmeVersion;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersion.service.js`,
        `findOneProgrammeVersion`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single object basing on the options
   */
  static async findOneProgrammeVersionModule(options) {
    try {
      const result = await models.ProgrammeVersionModule.findOne({
        ...options,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersion.service.js`,
        `findOneProgrammeVersionModule`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single object basing on the options
   */
  static async findOneProgrammeVersionModuleOption(options) {
    try {
      const result = await models.ProgrammeVersionModuleOption.findOne({
        ...options,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersion.service.js`,
        `findOneProgrammeVersionModuleOption`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single programmeVersion object basing on the options
   *
   *
   * query without plan specializations
   * SELECT * FROM programme_mgt.course_unit_semester WHERE programme_version_id=${id} ORDER BY study_year
   */
  static async findOneProgrammeVersionCourseUnits(id) {
    try {
      const courseUnits = await models.sequelize.query(
        `SELECT * FROM programme_mgt.course_unit_version_function(${id}) ORDER BY study_year`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return courseUnits;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersion.service.js`,
        `findOneProgrammeVersionCourseUnits`,
        `GET`
      );
    }
  }

  // modular programme course units
  static async findOneModularProgrammeCourseUnits(id) {
    try {
      const courseUnits = await models.sequelize.query(
        `SELECT * FROM programme_mgt.course_unit_module_version_function(${id}) ORDER BY programme_module`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return courseUnits;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersion.service.js`,
        `findOneModularProgrammeCourseUnits`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single programmeVersion object from data object
   *@
   */
  static async createProgrammeVersion(data, transaction) {
    try {
      const result = await models.ProgrammeVersion.findOrCreate({
        where: {
          programme_id: data.programme_id,
          version_title: data.version_title,
        },
        defaults: {
          ...data,
        },
        include: [
          {
            association: models.ProgrammeVersion.versionSpecializations,
          },
          {
            association: models.ProgrammeVersion.versionSubjCombCat,
          },
          {
            association: models.ProgrammeVersion.versionPlans,
          },
          {
            association: models.ProgrammeVersion.exemptRegs,
          },
          {
            association: models.ProgrammeVersion.versionModules,
            include: [
              {
                association: models.ProgrammeVersionModule.moduleOptions,
              },
            ],
          },
          {
            association: models.ProgrammeVersion.versionEntryYears,
          },
        ],
        transaction,
      });

      return result[0];
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersion.service.js`,
        `createProgrammeVersion`,
        `POST`
      );
    }
  }

  /**
   * createProgrammeVersionSubjectCombination
   * @param {*} data
   * @param {*} transaction
   */
  static async createProgrammeVersionSubjectCombination(data, transaction) {
    try {
      const result = await models.SubjectCombination.findOrCreate({
        where: {
          combination_category_id: data.combination_category_id,
          subject_combination_code: data.subject_combination_code,
        },
        defaults: {
          ...data,
        },
        include: [
          {
            association: models.SubjectCombination.subjects,
          },
        ],
        transaction,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersion.service.js`,
        `createProgrammeVersionSubjectCombination`,
        `POST`
      );
    }
  }

  /**
   * createSpecializations
   * @param {*} data
   * @param {*} transaction
   */
  static async createSpecializations(data, transaction) {
    try {
      const result = await models.ProgrammeVersionSpecialization.findOrCreate({
        where: {
          programme_version_id: data.programme_version_id,
          specialization_id: data.specialization_id,
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
        `programmeVersion.service.js`,
        `createSpecializations`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all
   */
  static async findAllProgrammeVersionSpecializations(options) {
    try {
      const results = await models.ProgrammeVersionSpecialization.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersion.service.js`,
        `findAllProgrammeVersionSpecializations`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async bulkInsertProgrammeVersionSpecializations(data, transaction) {
    try {
      const result = await models.ProgrammeVersionSpecialization.bulkCreate(
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
        `programmeVersion.service.js`,
        `bulkInsertProgrammeVersionSpecializations`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   * @returns
   */
  static async bulkRemoveProgrammeVersionSpecializations(data, transaction) {
    try {
      const deleted = await models.ProgrammeVersionSpecialization.destroy({
        where: { id: data },
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersion.service.js`,
        `bulkRemoveProgrammeVersionSpecializations`,
        `DELETE`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise}
   * @description
   */
  static async findAllProgrammeVersionPlans(options) {
    try {
      const results = await models.ProgrammeVersionPlan.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersion.service.js`,
        `findAllProgrammeVersionPlans`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async bulkInsertProgrammeVersionPlans(data, transaction) {
    try {
      const result = await models.ProgrammeVersionPlan.bulkCreate(data, {
        transaction,
        returning: true,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersion.service.js`,
        `bulkInsertProgrammeVersionPlans`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   * @returns
   */
  static async bulkRemoveProgrammeVersionPlans(data, transaction) {
    try {
      const deleted = await models.ProgrammeVersionPlan.destroy({
        where: { id: data },
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersion.service.js`,
        `bulkRemoveProgrammeVersionPlans`,
        `DELETE`
      );
    }
  }

  /**
   *
   * @param {*} options
   */
  static async findAllProgrammeVersionSubjectCombinationCategories(options) {
    try {
      const results = await models.SubjectCombinationCategory.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersion.service.js`,
        `findAllProgrammeVersionSubjectCombinationCategories`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async bulkInsertProgrammeVersionSubjectCombinationCategories(
    data,
    transaction
  ) {
    try {
      const result = await models.SubjectCombinationCategory.bulkCreate(data, {
        transaction,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersion.service.js`,
        `bulkInsertProgrammeVersionSubjectCombinationCategories`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   * @returns
   */
  static async bulkRemoveProgrammeVersionSubjectCombinationCategories(
    data,
    transaction
  ) {
    try {
      const deleted = await models.SubjectCombinationCategory.destroy({
        where: { id: data },
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersion.service.js`,
        `bulkRemoveProgrammeVersionSubjectCombinationCategories`,
        `DELETE`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   * @returns
   */
  static async bulkRemoveProgrammeVersionSubjectCombinationCategoriesByVersion(
    data,
    transaction
  ) {
    try {
      const deleted = await models.SubjectCombinationCategory.destroy({
        where: { programme_version_id: data },
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersion.service.js`,
        `bulkRemoveProgrammeVersionSubjectCombinationCategoriesByVersion;`,
        `DELETE`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise}
   * @description
   */
  static async findAllProgrammeVersionEntryYears(options) {
    try {
      const results = await models.ProgrammeVersionEntryYear.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersion.service.js`,
        `findAllProgrammeVersionEntryYears`,
        `GET`
      );
    }
  }

  /**
   * UPDATE PROGRAMME VERSION ENTRY YEARS
   *
   * @param  {object} options
   * @returns {Promise}
   * @description
   */
  static async updateOrCreateProgrammeVersionEntryYears(
    data,
    condition,
    transaction
  ) {
    try {
      const results = await models.ProgrammeVersionEntryYear.findOne({
        where: condition,
      }).then(function (obj) {
        // update
        if (obj) return obj.update(data);

        // insert
        return models.ProgrammeVersionEntryYear.create(data);
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersion.service.js`,
        `updateOrCreateProgrammeVersionEntryYears`,
        `PUT/POST`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async bulkInsertProgrammeVersionEntryYears(data, transaction) {
    try {
      const result = await models.ProgrammeVersionEntryYear.bulkCreate(data, {
        transaction,
        returning: true,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersion.service.js`,
        `bulkInsertProgrammeVersionEntryYears`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   * @returns
   */
  static async bulkRemoveProgrammeVersionEntryYears(data, transaction) {
    try {
      const deleted = await models.ProgrammeVersionEntryYear.destroy({
        where: { id: data },
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersion.service.js`,
        `bulkRemoveProgrammeVersionEntryYears`,
        `DELETE`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise}
   * @description
   */
  static async findAllProgrammeVersionModules(options) {
    try {
      const results = await models.ProgrammeVersionModule.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersion.service.js`,
        `findAllProgrammeVersionModules`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async bulkInsertProgrammeVersionModules(data, transaction) {
    try {
      const result = await models.ProgrammeVersionModule.bulkCreate(data, {
        transaction,
        returning: true,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersion.service.js`,
        `bulkInsertProgrammeVersionModules`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   * @returns
   */
  static async bulkRemoveProgrammeVersionModules(data, transaction) {
    try {
      const deleted = await models.ProgrammeVersionModule.destroy({
        where: { id: data },
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersion.service.js`,
        `bulkRemoveProgrammeVersionModules`,
        `DELETE`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise}
   * @description
   */
  static async findAllVersionExemptedRegistrations(options) {
    try {
      const results = await models.ProgrammeExemptReg.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersion.service.js`,
        `findAllVersionExemptedRegistrations`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async bulkInsertVersionExemptedRegistrations(data, transaction) {
    try {
      const result = await models.ProgrammeExemptReg.bulkCreate(data, {
        transaction,
        returning: true,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersion.service.js`,
        `bulkInsertVersionExemptedRegistrations`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   * @returns
   */
  static async bulkRemoveVersionExemptedRegistrations(data, transaction) {
    try {
      const deleted = await models.ProgrammeExemptReg.destroy({
        where: { id: data },
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersion.service.js`,
        `bulkRemoveVersionExemptedRegistrations`,
        `DELETE`
      );
    }
  }

  /**
   * createSpecializations
   * @param {*} data
   * @param {*} transaction
   */
  static async createPlans(data, transaction) {
    try {
      const result = await models.ProgrammeVersionPlan.findOrCreate({
        where: {
          programme_version_id: data.programme_version_id,
          programme_version_plan_id: data.programme_version_plan_id,
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
        `programmeVersion.service.js`,
        `createPlans`,
        `POST`
      );
    }
  }

  /**
   * createSubjectCombinationCategory
   * @param {*} data
   * @param {*} transaction
   */
  static async createSubjectCombinationCategory(data, transaction) {
    try {
      const result = await models.SubjectCombinationCategory.findOrCreate({
        where: {
          programme_version_id: data.programme_version_id,
          subject_combination_category_id: data.subject_combination_category_id,
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
        `programmeVersion.service.js`,
        `createSubjectCombinationCategory`,
        `POST`
      );
    }
  }

  /**
   * createProgrammeVersionEntryYear
   * @param {*} data
   * @param {*} transaction
   */
  static async createProgrammeVersionEntryYear(data, transaction) {
    try {
      const result = await models.ProgrammeVersionEntryYear.findOrCreate({
        where: {
          programme_version_id: data.programme_version_id,
          entry_year_id: data.entry_year_id,
          graduation_load: data.graduation_load,
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
        `programmeVersion.service.js`,
        `createProgrammeVersionEntryYear`,
        `POST`
      );
    }
  }

  /**
   * createProgrammeVersionModule
   * @param {*} data
   * @param {*} transaction
   */
  static async createProgrammeVersionModule(data, transaction) {
    try {
      const result = await models.ProgrammeVersionModule.findOrCreate({
        where: {
          programme_version_id: data.programme_version_id,
          module_id: data.module_id,
        },
        defaults: {
          ...data,
        },
        include: [
          {
            association: models.ProgrammeVersionModule.moduleOptions,
          },
        ],
        transaction,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersion.service.js`,
        `createProgrammeVersionModule`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data Data to update.
   * @param {string} id  id of programmeVersion object to be updated
   * @returns {Promise}
   * @description updates a single programmeVersion object
   *@
   */
  static async updateProgrammeVersion(id, data, transaction) {
    try {
      const updated = await models.ProgrammeVersion.update(data, {
        where: { id },
        transaction,
        returning: true,
      });

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersion.service.js`,
        `updateProgrammeVersion`,
        `PUT`
      );
    }
  }

  /**
   * @param {string} id  id of programmeVersion object to be deleted
   * @returns {Promise}
   * @description deletes a single programmeVersion object
   *@
   */
  static async deleteProgrammeVersion(id) {
    try {
      const deleted = await models.ProgrammeVersion.destroy({
        where: { id },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersion.service.js`,
        `deleteProgrammeVersion`,
        `DELETE`
      );
    }
  }

  /**
   * @param  {object} data Data to update.
   * @param {string} username  username of updateIsCurrentVersionForPreviousRecord object to be updated
   * @returns {Promise}
   * @description updates a single updateIsCurrentVersionForPreviousRecord object
   *@
   */
  static async updateIsCurrentVersionForPreviousRecord(
    condition,
    data,
    transaction
  ) {
    try {
      const updated = await models.ProgrammeVersion.update(data, {
        where: condition,
        transaction,
        returning: true,
      });

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersion.service.js`,
        `updateIsCurrentVersionForPreviousRecord`,
        `PUT`
      );
    }
  }

  /**
   * removeSpecializations
   * @param {*} options
   */
  static async removeSpecializations(options, transaction) {
    try {
      const deleted = await models.ProgrammeVersionSpecialization.destroy({
        ...options,
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersion.service.js`,
        `removeSpecializations`,
        `DELETE`
      );
    }
  }

  /**
   * removePlans
   * @param {*} options
   */
  static async removePlans(options, transaction) {
    try {
      const deleted = await models.ProgrammeVersionPlan.destroy({
        ...options,
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersion.service.js`,
        `removePlans`,
        `DELETE`
      );
    }
  }

  /**
   * removeSubjectCombinationCategories
   * @param {*} options
   */
  static async removeSubjectCombinationCategories(options, transaction) {
    try {
      const deleted = await models.SubjectCombinationCategory.destroy({
        ...options,
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersion.service.js`,
        `removeSubjectCombinationCategories`,
        `DELETE`
      );
    }
  }

  /**
   * removeProgrammeVersionEntryYear
   * @param {*} options
   */
  static async removeProgrammeVersionEntryYear(options, transaction) {
    try {
      const deleted = await models.ProgrammeVersionEntryYear.destroy({
        ...options,
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersion.service.js`,
        `removeProgrammeVersionEntryYear`,
        `DELETE`
      );
    }
  }

  /**
   * removeProgrammeVersionModuleOption
   * @param {*} options
   */
  static async removeProgrammeVersionModuleOption(options, transaction) {
    try {
      const deleted = await models.ProgrammeVersionModuleOption.destroy({
        ...options,
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersion.service.js`,
        `removeProgrammeVersionModuleOption`,
        `DELETE`
      );
    }
  }

  /**
   * removeProgrammeVersionModule
   * @param {*} options
   */
  static async removeProgrammeVersionModule(options, transaction) {
    try {
      const deleted = await models.ProgrammeVersionModule.destroy({
        ...options,
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersion.service.js`,
        `removeProgrammeVersionModule`,
        `DELETE`
      );
    }
  }

  /**
   *
   * @returns version options
   */
  static async versionPlanOptions(versionId) {
    try {
      const filtered = await models.sequelize.query(
        `SELECT * FROM programme_mgt.programme_version_plans_function(${versionId})`,
        {
          type: QueryTypes.SELECT,
          plain: true,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersion.service.js`,
        `versionPlanOptions`,
        `GET`
      );
    }
  }

  // specializations
  static async versionSpecializationOptions(versionId) {
    try {
      const filtered = await models.sequelize.query(
        `SELECT * FROM programme_mgt.programme_version_specializations_function(${versionId})`,
        {
          type: QueryTypes.SELECT,
          plain: true,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersion.service.js`,
        `versionSpecializationOptions`,
        `GET`
      );
    }
  }

  // module
  static async versionModuleOptions(versionId) {
    try {
      const filtered = await models.sequelize.query(
        `SELECT * FROM programme_mgt.programme_version_modules_function(${versionId})`,
        {
          type: QueryTypes.SELECT,
          plain: true,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersion.service.js`,
        `versionModuleOptions`,
        `GET`
      );
    }
  }

  // student subject combination
  static async studentSubjectCombination(data) {
    try {
      const filtered = await models.sequelize.query(
        `SELECT * FROM programme_mgt.student_subject_combination_function(${data.studentId},${data.subjectCombinationId})`,
        {
          type: QueryTypes.SELECT,
          plain: true,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programmeVersion.service.js`,
        `studentSubjectCombination`,
        `GET`
      );
    }
  }
}

module.exports = ProgrammeVersionService;
