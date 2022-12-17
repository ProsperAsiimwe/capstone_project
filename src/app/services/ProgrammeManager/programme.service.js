const models = require('@models');
const { QueryTypes } = require('sequelize');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for a programme
class ProgrammeService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all faculties or filtered using options param
   */
  static async findAllProgrammes(options) {
    try {
      const results = await models.Programme.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programme.service.js`,
        `findAllProgrammes`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} options
   */
  static async findAllProgrammeCampuses(options) {
    try {
      const results = await models.ProgrammeCampus.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programme.service.js`,
        `findAllProgrammeCampuses`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} options
   */
  static async findOneProgrammeCampus(options) {
    try {
      const results = await models.ProgrammeCampus.findOne({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programme.service.js`,
        `findOneProgrammeCampus`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} options
   */
  static async findAllProgrammeStudyYears(options) {
    try {
      const results = await models.ProgrammeStudyYear.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programme.service.js`,
        `findAllProgrammeStudyYears`,
        `GET`
      );
    }
  }

  /**
   * Bulk Insert Programme Study Years
   *
   * @param {*} options
   */
  static async bulkInsertProgrammeStudyYears(data, transaction) {
    try {
      const results = await models.ProgrammeStudyYear.bulkCreate(data, {
        transaction,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programme.service.js`,
        `bulkInsertProgrammeStudyYears`,
        `POST`
      );
    }
  }

  /**
   * Delete Programme Study Years
   *
   * @param {*} options
   */
  static async deleteProgrammeStudyYears(data, transaction) {
    try {
      const results = await models.ProgrammeStudyYear.destroy({
        where: { id: data },
        transaction,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programme.service.js`,
        `deleteProgrammeStudyYears`,
        `DELETE`
      );
    }
  }

  /**
   *
   * @param {*} options
   */
  static async findAllProgrammeTypes(options) {
    try {
      const results = await models.ProgrammeType.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programme.service.js`,
        `findAllProgrammeTypes`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} options
   */
  static async findOneProgrammeType(options) {
    try {
      const results = await models.ProgrammeType.findOne({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programme.service.js`,
        `findOneProgrammeType`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} options
   */
  static async findAllProgrammeEntryYears(options) {
    try {
      const results = await models.ProgrammeEntryYear.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programme.service.js`,
        `findAllProgrammeEntryYears`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} options
   */
  static async findAllProgrammeModesOfDelivery(options) {
    try {
      const results = await models.ProgrammeModeOfDelivery.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programme.service.js`,
        `findAllProgrammeModesOfDelivery`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} options
   */
  static async findAllProgrammeDepartments(options) {
    try {
      const results = await models.ProgrammeDepartment.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programme.service.js`,
        `findAllProgrammeDepartments`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single programme object basing on the options
   */
  static async findOneProgramme(options) {
    try {
      const programme = await models.Programme.findOne({ ...options });

      return programme;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programme.service.js`,
        `findOneProgramme`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single programme object from data object
   *@
   */
  static async createProgramme(data, transaction) {
    try {
      const programme = await models.Programme.create(data, {
        include: [
          {
            association: models.Programme.versions,
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
          },
          {
            association: models.Programme.programmeStudyTypes,
          },
          {
            association: models.Programme.programModesOfDelivery,
          },
          {
            association: models.Programme.programmeCampuses,
          },
          {
            association: models.Programme.programmeEntryYears,
          },
          {
            association: models.Programme.programmeStudyYears,
          },
          {
            association: models.Programme.otherDepartments,
          },
        ],
        transaction,
      });

      return programme;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programme.service.js`,
        `createProgramme`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of programme object to be updated
   * @returns {Promise}
   * @description updates a single programme object
   *@
   */
  static async updateProgramme(id, data, transaction) {
    try {
      const updated = await models.Programme.update(data, {
        where: { id },
        transaction,
        returning: true,
      });

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programme.service.js`,
        `updateProgramme`,
        `PUT`
      );
    }
  }

  /**
   * @param {string} id  id of programme object to be deleted
   * @returns {Promise}
   * @description deletes a single programme object
   *@
   */
  static async deleteProgramme(id) {
    try {
      const deleted = await models.Programme.destroy({
        where: { id },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programme.service.js`,
        `deleteProgramme`,
        `DELETE`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single programme study year
   */
  static async findOneProgrammeStudyYear(options) {
    try {
      const result = await models.ProgrammeStudyYear.findOne({ ...options });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programme.service.js`,
        `findOneProgrammeStudyYear`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single programmeVersion object basing on the options
   */
  static async findAllCollegeProgrammes() {
    try {
      const collegeProgrammes = await models.sequelize.query(
        `SELECT * FROM programme_mgt.programmes_by_colleges_view ORDER BY college_title`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return collegeProgrammes;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programme.service.js`,
        `findAllCollegeProgrammes`,
        `GET`
      );
    }
  }

  // group by faculty
  static async findAllFacultyProgrammes() {
    try {
      const facultyProgrammes = await models.sequelize.query(
        `SELECT * FROM programme_mgt.programmes_by_faculty_view ORDER BY faculty_title`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return facultyProgrammes;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programme.service.js`,
        `findAllFacultyProgrammes`,
        `GET`
      );
    }
  }

  // group by department --

  static async findAllDepartmentProgrammes() {
    try {
      const departmentProgrammes = await models.sequelize.query(
        `SELECT * FROM programme_mgt.programmes_by_department_view ORDER BY department_title`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return departmentProgrammes;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programme.service.js`,
        `findAllDepartmentProgrammes`,
        `GET`
      );
    }
  }

  // admission programmes department
  static async admissionProgrammesByDepartment() {
    try {
      const departmentProgrammes = await models.sequelize.query(
        `SELECT * FROM programme_mgt.admission_department_programmes ORDER BY academic_unit_title`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return departmentProgrammes;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programme.service.js`,
        `admissionProgrammesByDepartment`,
        `GET`
      );
    }
  }

  static async admissionProgrammesByFaculty() {
    try {
      const departmentProgrammes = await models.sequelize.query(
        `SELECT * FROM programme_mgt.admission_faculty_programmes ORDER BY academic_unit_title`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return departmentProgrammes;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programme.service.js`,
        `admissionProgrammesByFaculty`,
        `GET`
      );
    }
  }

  static async admissionProgrammesByCollege() {
    try {
      const departmentProgrammes = await models.sequelize.query(
        `SELECT * FROM programme_mgt.admission_college_programmes ORDER BY academic_unit_title`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return departmentProgrammes;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programme.service.js`,
        `admissionProgrammesByCollege`,
        `GET`
      );
    }
  }

  static async admissionProgrammesByCollegeCode(colleges) {
    try {
      const departmentProgrammes = await models.sequelize.query(
        `SELECT * FROM programme_mgt.admission_college_programmes where academic_unit_code IN (${colleges}) ORDER BY academic_unit_title`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return departmentProgrammes;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programme.service.js`,
        `admissionProgrammesByCollegeCode`,
        `GET`
      );
    }
  }

  /**
   *group programmes
   * institution
   *
   *
   *
   */
  static async findAllFacultyDepartment() {
    try {
      const facultyDepartment = await models.sequelize.query(
        `SELECT * FROM programme_mgt.faculty_department_view ORDER BY faculty_title`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return facultyDepartment;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programme.service.js`,
        `findAllFacultyDepartment`,
        `GET`
      );
    }
  }

  //
  static async findAllCollegeFacultyDepartment() {
    try {
      const CollegeFacultyDepartment = await models.sequelize.query(
        `SELECT * FROM programme_mgt.college_faculty_view ORDER BY college_title`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return CollegeFacultyDepartment;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programme.service.js`,
        `findAllCollegeFacultyDepartment`,
        `GET`
      );
    }
  }

  // programme_by_department_function
  static async findAllProgrammeByDepartment(data) {
    try {
      const departmentProgrammes = await models.sequelize.query(
        `SELECT * FROM programme_mgt.programme_by_department_function(${data.department_id})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return departmentProgrammes;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programme.service.js`,
        `findAllProgrammeByDepartment`,
        `GET`
      );
    }
  }

  // all programme categories

  static async findAllProgrammesWithCategories() {
    try {
      const programmesWithCategories = await models.sequelize.query(
        `select * from programme_mgt.programme_version_subject_category`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return programmesWithCategories;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programme.service.js`,
        `findAllProgrammesWithCategories`,
        `GET`
      );
    }
  }

  static async getProgrammesDownload() {
    try {
      const programmesToDownload = await models.sequelize.query(
        `SELECT * FROM programme_mgt.programmes_metadata_values_view`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return programmesToDownload;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programme.service.js`,
        `getProgrammesDownload`,
        `GET`
      );
    }
  }

  /**
   *
   * find all programmes with programme_study_years
   * and programme study types
   */

  static async getProgrammesStudyYears() {
    try {
      const result = await models.sequelize.query(
        `SELECT * FROM programme_mgt.programme_study_year_view order by programme_title asc`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programme.service.js`,
        `getProgrammesStudyYears`,
        `GET`
      );
    }
  }

  /**
   *
   * find all programmes campus programme_study_years
   * and programme study types
   */

  static async getProgrammesCampusStudyYears(data) {
    try {
      const result = await models.sequelize.query(
        `SELECT * FROM programme_mgt.programme_study_year_campus__view WHERE campus_id = ${data.campus_id}`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programme.service.js`,
        `getProgrammesCampusStudyYears`,
        `GET`
      );
    }
  }

  /**
   * createProgrammeStudyType
   * @param {*} data
   * @param {*} transaction
   */
  static async bulkCreateProgrammeStudyType(data, transaction) {
    try {
      const result = await models.ProgrammeType.bulkCreate(data, {
        transaction,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programme.service.js`,
        `bulkCreateProgrammeStudyType`,
        `POST`
      );
    }
  }

  /**
   * Delete Multiple Programme Study Types
   *
   * @param {*} options
   */
  static async deleteProgrammeStudyType(data, transaction) {
    try {
      const deleted = await models.ProgrammeType.destroy({
        where: { id: data },
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programme.service.js`,
        `deleteProgrammeStudyType`,
        `DELETE`
      );
    }
  }

  /**
   * createProgrammeEntryYears
   * @param {*} data
   * @param {*} transaction
   */
  static async bulkCreateProgrammeEntryYears(data, transaction) {
    try {
      const result = await models.ProgrammeEntryYear.bulkCreate(data, {
        transaction,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programme.service.js`,
        `bulkCreateProgrammeEntryYears`,
        `POST`
      );
    }
  }

  /**
   * Bulk Delete ProgrammeEntryYears
   * @param {*} options
   */
  static async bulkDeleteProgrammeEntryYears(data, transaction) {
    try {
      const deleted = await models.ProgrammeEntryYear.destroy({
        where: { id: data },
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programme.service.js`,
        `bulkDeleteProgrammeEntryYears`,
        `DELETE`
      );
    }
  }

  /**
   * Bulk Create Programme Campuses
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async bulkCreateProgrammeCampus(data, transaction) {
    try {
      const result = await models.ProgrammeCampus.bulkCreate(data, {
        transaction,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programme.service.js`,
        `bulkCreateProgrammeCampus`,
        `POST`
      );
    }
  }

  /**
   * Bulk Remove Programme Campuses
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async bulkRemoveProgrammeCampus(data, transaction) {
    try {
      const deleted = await models.ProgrammeCampus.destroy({
        where: { id: data },
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programme.service.js`,
        `bulkRemoveProgrammeCampus`,
        `DELETE`
      );
    }
  }

  /**
   * createProgrammeModesOfDelivery
   * @param {*} data
   * @param {*} transaction
   */
  static async bulkCreateProgrammeModesOfDelivery(data, transaction) {
    try {
      const result = await models.ProgrammeModeOfDelivery.bulkCreate(data, {
        transaction,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programme.service.js`,
        `bulkCreateProgrammeModesOfDelivery`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async bulkCreateProgrammeDepartment(data, transaction) {
    try {
      const result = await models.ProgrammeDepartment.bulkCreate(data, {
        transaction,
        returning: true,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programme.service.js`,
        `bulkCreateProgrammeDepartment`,
        `POST`
      );
    }
  }

  /**
   * ProgrammeModeOfDelivery
   * @param {*} options
   */
  static async bulkRemoveProgrammeModesOfDelivery(data, transaction) {
    try {
      const deleted = await models.ProgrammeModeOfDelivery.destroy({
        where: { id: data },
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programme.service.js`,
        `bulkRemoveProgrammeModesOfDelivery`,
        `DELETE`
      );
    }
  }

  /**
   *
   * @param {*} options
   */
  static async bulkRemoveProgrammeDepartment(data, transaction) {
    try {
      const deleted = await models.ProgrammeDepartment.destroy({
        where: { id: data },
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programme.service.js`,
        `bulkRemoveProgrammeDepartment`,
        `DELETE`
      );
    }
  }

  static async programmesForChangeOfProgramme() {
    try {
      const filtered = await models.sequelize.query(
        `select * from programme_mgt.change_programme_function order by programme_title`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programme.service.js`,
        `programmesForChangeOfProgramme`,
        `GET`
      );
    }
  }

  //   find programme academic units
  static async findProgrammeAcademicUnits(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from programme_mgt.programme_academic_units(${data.programme_id})`,
        {
          type: QueryTypes.SELECT,
          plain: true,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programme.service.js`,
        `findProgrammeAcademicUnits`,
        `GET`
      );
    }
  }

  /**
   * GET COLLEGE HIERARCHY PROGRAMMES
   *
   * @param {*} options
   */
  static async hierarchyCollegeProgrammes(options) {
    try {
      const res = await models.CollegeProgramme.findAll(options);

      return res;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programme.service.js`,
        `hierarchyCollegeProgrammes`,
        `GET`
      );
    }
  }

  /**
   * GET COLLEGE HIERARCHY PROGRAMMES
   *
   * @param {*} options
   */
  static async findOneCollegeProgrammes(options) {
    try {
      const res = await models.CollegeProgramme.findOne(options);

      return res;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programme.service.js`,
        `findOneCollegeProgrammes`,
        `GET`
      );
    }
  }

  /**
   * GET ALL FACULTY HIERARCHY PROGRAMMES
   *
   * @param {*} options
   */
  static async hierarchyFacultyProgrammes(options) {
    try {
      const res = await models.FacultyProgramme.findAll(options);

      return res;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programme.service.js`,
        `hierarchyFacultyProgrammes`,
        `GET`
      );
    }
  }

  /**
   * GET ONE FACULTY HIERARCHY PROGRAMMES
   *
   * @param {*} options
   */
  static async findOneFacultyProgrammes(options) {
    try {
      const res = await models.FacultyProgramme.findOne(options);

      return res;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programme.service.js`,
        `findOneFacultyProgrammes`,
        `GET`
      );
    }
  }

  /**
   * GET ALL DEPARTMENT HIERARCHY PROGRAMMES
   *
   * @param {*} options
   */
  static async hierarchyDepartmentProgrammes(options) {
    try {
      const res = await models.DepartmentProgramme.findAll(options);

      return res;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programme.service.js`,
        `hierarchyDepartmentProgrammes`,
        `GET`
      );
    }
  }

  /**
   * GET ONE DEPARTMENT HIERARCHY PROGRAMMES
   *
   * @param {*} options
   */
  static async findOneDepartmentProgrammes(options) {
    try {
      const res = await models.DepartmentProgramme.findOne(options);

      return res;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `programme.service.js`,
        `findOneDepartmentProgrammes`,
        `GET`
      );
    }
  }
}

module.exports = ProgrammeService;
