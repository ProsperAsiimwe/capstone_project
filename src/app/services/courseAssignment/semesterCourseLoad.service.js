const models = require('@models');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for this entity
class SemesterCourseLoadContext {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all records or filtered using options param
   */
  static async findAllRecords(options) {
    try {
      const records = await models.SemesterCourseLoadContext.findAll({
        ...options,
      });

      return records;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `semesterCourseLoad.service.js`,
        `findAllRecords`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single record object basing on the options
   */
  static async findOneRecord(options) {
    try {
      const record = await models.SemesterCourseLoadContext.findOne({
        ...options,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `semesterCourseLoad.service.js`,
        `findOneRecord`,
        `GET`
      );
    }
  }

  /** createSemesterCourseLoadContextRecord
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async findOrCreate(data, transaction) {
    try {
      const record = await models.SemesterCourseLoadContext.findOrCreate({
        where: {
          academic_year_id: data.academic_year_id,
          programme_id: data.programme_id,
          semester_id: data.semester_id,
          programme_study_year_id: data.programme_study_year_id,
        },
        defaults: {
          ...data,
        },
        include: [
          {
            association: models.SemesterCourseLoadContext.semesterLoads,
          },
        ],
        transaction,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `semesterCourseLoad.service.js`,
        `findOrCreate`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single SemesterCourseLoad object from data object
   *@
   */
  static async updateOrCreateValues(data, condition, transaction) {
    try {
      const record = await models.SemesterCourseLoad.findOne({
        where: condition,
      }).then(function (obj) {
        // update
        if (obj) return obj.update(data, { transaction });

        // insert
        return models.SemesterCourseLoad.create(
          { ...data, created_by_id: data.last_updated_by_id },
          { transaction }
        );
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `semesterCourseLoad.service.js`,
        `updateOrCreateValues`,
        `POST/PUT`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of record object to be updated
   * @returns {Promise}
   * @description updates a single record object
   *@
   */
  static async updateSemesterCourseLoadContext(id, data) {
    try {
      const record = await models.SemesterCourseLoadContext.update(
        { ...data },
        { where: { id }, returning: true }
      );

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `semesterCourseLoad.service.js`,
        `updateSemesterCourseLoadContext`,
        `PUT`
      );
    }
  }

  /**
   * @param {string} id  id of record object to be deleted
   * @returns {Promise}
   * @description deletes a single record object
   *@
   */
  static async deleteSemesterCourseLoadContext(id) {
    try {
      const deleted = await models.SemesterCourseLoadContext.destroy({
        where: { id },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `semesterCourseLoad.service.js`,
        `deleteSemesterCourseLoadContext`,
        `DELETE`
      );
    }
  }
}

module.exports = SemesterCourseLoadContext;
