const models = require('@models');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');
const { QueryTypes } = require('sequelize');

// This Class is responsible for handling all database interactions for a student
class ChangeOfProgrammeService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all faculties or filtered using options param
   */
  static async findAll(options) {
    try {
      const results = await models.ChangeOfProgramme.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `changeOfProgramme.service.js`,
        `findAll`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single student object basing on the options
   */
  static async findOne(options) {
    try {
      const student = await models.ChangeOfProgramme.findOne({ ...options });

      return student;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `changeOfProgramme.service.js`,
        `findOne`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single student object from data object
   *@
   */
  static async createChangeOfProgramme(data, transaction) {
    try {
      const newChangeOfProgramme = await models.ChangeOfProgramme.findOrCreate({
        where: {
          student_programme_id: data.student_programme_id,
          student_id: data.student_id,
          request_status: 'PENDING',
          service_type: data.service_type,
        },
        defaults: data,
        transaction,
      });

      return newChangeOfProgramme;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `changeOfProgramme.service.js`,
        `createChangeOfProgramme`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of student object to be updated
   * @returns {Promise}
   * @description updates a single student object
   *@
   */
  static async update(id, data, ...rest) {
    try {
      const updated = await models.ChangeOfProgramme.update(
        { ...data },
        { where: { id }, returning: true, ...rest }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `changeOfProgramme.service.js`,
        `update`,
        `PUT`
      );
    }
  }

  /**
   * @param {string} id  id of student object to be deleted
   * @returns {Promise}
   * @description deletes a single student object
   *@
   */
  static async delete(options) {
    try {
      const deleted = await models.ChangeOfProgramme.destroy(options);

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `changeOfProgramme.service.js`,
        `delete`,
        `DELETE`
      );
    }
  }

  /**
   * @param {string} id  id of student object to be deleted
   * @returns {Promise}
   * @description deletes a single student object
   *@
   */
  static async getChangeOfProgrammeReport(dateFrom, dateTo) {
    try {
      const report = await models.sequelize.query(
        `select 
          cop.service_type,
          ssp.account_id,
          json_agg(json_build_object(
            'id', cop.id,
            'amount_received', cop.paid,
            'amount_billed', cop.amount
          )) change_of_programmes
        from admissions_mgt.change_of_programmes as cop
        left join app_mgt.metadata_values as mv on mv.metadata_value = cop.service_type
        left join institution_policy_mgt.student_services_policy as ssp on mv.id = ssp.student_service_type_id
        where ssp.account_id is not null AND cop.amount > 0 AND cop.created_at >= '${dateFrom}'
        AND cop.created_at <= '${dateTo}'
        group by cop.service_type, ssp.account_id`,
        {
          type: QueryTypes.SELECT,
          raw: true,
        }
      );

      return report;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `changeOfProgramme.service.js`,
        `getChangeOfProgrammeReport`,
        `GET`
      );
    }
  }
}

module.exports = ChangeOfProgrammeService;
