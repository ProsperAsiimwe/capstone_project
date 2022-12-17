const models = require('@models');
const { isEmpty } = require('lodash');
const moment = require('moment');
const { QueryTypes } = require('sequelize');
const { Op } = require('sequelize');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for a runningAdmission
class RunningAdmissionService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all runningAdmissions or filtered using options param
   */
  static async findAllRunningAdmissions(options) {
    try {
      const results = await models.RunningAdmission.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `runningAdmission.service.js`,
        `findAllRunningAdmissions`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all runningAdmissions or filtered using options param to be viewed by the applicant
   */
  static async findAllRunningAdmissionsForApplicants(options) {
    try {
      const results = await models.RunningAdmission.findAll({
        ...options,
        where: {
          activate_online_applications: true,
          admission_start_date: {
            [Op.lte]: moment.now(),
          },
          admission_end_date: {
            [Op.gte]: moment.now(),
          },
        },
        order: [['admission_end_date', 'ASC']],
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `runningAdmission.service.js`,
        `findAllRunningAdmissionsForApplicants`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single runningAdmission object basing on the options
   *
   */
  static async findOneRunningAdmission(options) {
    try {
      const runningAdmission = await models.RunningAdmission.findOne({
        ...options,
      });

      return runningAdmission;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `runningAdmission.service.js`,
        `findOneRunningAdmission`,
        `GET`
      );
    }
  }

  static async fetchRunningAdmissionById(id) {
    try {
      const records = await models.sequelize.query(
        `select *
        from admissions_mgt.running_admission_data(${id})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return !isEmpty(records) ? records[0] : null;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `runningAdmission.service.js`,
        `fetchRunningAdmissionById`,
        `GET`
      );
    }
  }

  // admissions_mgt.all_running_admissions

  static async fetchActiveRunningAdmission() {
    try {
      const records = await models.sequelize.query(
        `SELECT *
        from admissions_mgt.all_running_admissions`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return records;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `runningAdmission.service.js`,
        `fetchActiveRunningAdmission`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns all applicants that match the context in running admissions
   */

  static async findApplicantsByContext(context) {
    try {
      const runningAdmission = await models.RunningAdmission.findOne({
        where: {
          academic_year_id: context.academic_year_id,
          admission_scheme_id: context.admission_scheme_id,
          intake_id: context.intake_id,
        },
        attributes: [
          'id',
          'number_of_choices',
          'maximum_number_of_forms',
          'national_application_fees',
          'east_african_application_fees',
          'international_application_fees',
          'activate_online_applications',
          'activate_admission_fees',
          'national_admission_fees',
          'east_african_admission_fees',
          'international_admission_fees',
          'admission_start_date',
          'admission_end_date',
          'admission_description',
          'instructions',
        ],
        include: [
          {
            association: 'degreeCategory',
            attributes: ['id', 'metadata_value'],
          },
          {
            association: 'admissionScheme',
            attributes: ['id', 'scheme_name', 'scheme_description'],
          },
          {
            association: 'admissionForm',
            attributes: ['id', 'form_name', 'form_description'],
            include: [
              {
                association: 'sections',
                attributes: ['id', 'metadata_value'],
                through: {
                  attributes: ['section_number'],
                },
              },
            ],
          },
          {
            association: 'applicationFees',
            include: [
              {
                association: 'account',
                attributes: ['account_code', 'account_name'],
              },
              {
                association: 'amounts',
                include: [
                  {
                    association: 'billingCategory',
                    attributes: ['metadata_value'],
                  },
                  {
                    association: 'currency',
                    attributes: ['metadata_value'],
                  },
                ],
              },
            ],
          },
          {
            association: 'admissionFees',
            include: [
              {
                association: 'account',
                attributes: ['account_code', 'account_name'],
              },
              {
                association: 'amounts',
                include: [
                  {
                    association: 'billingCategory',
                    attributes: ['metadata_value'],
                  },
                  {
                    association: 'currency',
                    attributes: ['metadata_value'],
                  },
                ],
              },
            ],
          },
        ],
      });

      const applicants = await models.RunningAdmissionApplicant.findAll({
        where: {
          running_admission_id: runningAdmission.id,
        },
        attributes: {
          exclude: ['created_at', 'updated_at'],
        },
        include: [
          {
            association: models.RunningAdmissionApplicant.applicant,
            attributes: [
              'id',
              'surname',
              'other_names',

              'email',
              'phone',
              'gender',
            ],
          },
        ],
      });

      return {
        runningAdmission,
        applicants,
      };
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `runningAdmission.service.js`,
        `findApplicantsByContext`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single runningAdmission object from data object
   *@
   */
  static async createRunningAdmission(data, transaction) {
    try {
      const runningAdmission = await models.RunningAdmission.findOrCreate({
        where: {
          academic_year_id: data.academic_year_id,
          intake_id: data.intake_id,
          admission_scheme_id: data.admission_scheme_id,
          degree_category_id: data.degree_category_id,
          // admission_form_id: data.admission_form_id,
        },
        defaults: {
          ...data,
        },
        transaction,
      });

      return runningAdmission;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `runningAdmission.service.js`,
        `createRunningAdmission`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of runningAdmission object to be updated
   * @returns {Promise}
   * @description updates a single runningAdmission object
   *@
   */
  static async updateRunningAdmission(id, data, transaction) {
    try {
      const updated = await models.RunningAdmission.update(
        { ...data },
        { where: { id }, transaction, returning: true }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `runningAdmission.service.js`,
        `updateRunningAdmission`,
        `PUT`
      );
    }
  }

  /**
   * @param {string} id  id of runningAdmission object to be deleted permanently
   * @returns {Promise}
   * @description deletes a single runningAdmission object permanently
   *@
   */
  static async hardDeleteRunningAdmission(id, transaction) {
    try {
      const deleted = await models.RunningAdmission.destroy({
        where: { id },
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `runningAdmission.service.js`,
        `hardDeleteRunningAdmission`,
        `DELETE`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of runningAdmission object to be soft deleted
   * @returns {Promise}
   * @description soft deletes a single runningAdmission object
   *@
   */
  static async softDeleteRunningAdmission(id, data) {
    try {
      const deleted = await models.RunningAdmission.update(
        { ...data },
        { where: { id }, returning: false }
      );

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `runningAdmission.service.js`,
        `softDeleteRunningAdmission`,
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
  static async undoSoftDeleteRunningAdmission(id, data) {
    try {
      const undo = await models.RunningAdmission.update(
        { ...data },
        { where: { id }, returning: false }
      );

      return undo;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `runningAdmission.service.js`,
        `undoSoftDeleteRunningAdmission`,
        `PUT`
      );
    }
  }
}

module.exports = RunningAdmissionService;
