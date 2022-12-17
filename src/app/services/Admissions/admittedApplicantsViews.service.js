const models = require('@models');
const { QueryTypes } = require('sequelize');
// const errorFunction = require('../helper/errorHelper');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// admitted applicants
class AdmittedApplicantsViewsService {
  // applicant by contact

  static async admittedApplicants(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from admissions_mgt.admitted_applicants_function(${data.academic_year_id},${data.intake_id},
            ${data.degree_category_id},${data.admission_scheme_id},${data.programme_id})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      //  const err = errorFunction.errorFunction(error);

      await sequelizeErrorHandler(
        error,
        `admittedApplicantsViews.service.js`,
        `admittedApplicants`,
        `GET`
      );
    }
  }

  // singleAdmittedApplicant
  static async singleAdmittedApplicant(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from admissions_mgt.single_admitted_student(${data.admittedApplicantId})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `admittedApplicantsViews.service.js`,
        `singleAdmittedApplicant`,
        `GET`
      );
    }
  }

  // ApplicantWeightingFunction
  static async applicantWeightingFunction(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from admissions_mgt.applicant_weighting_function(${data.programmeCampusId})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `admittedApplicantsViews.service.js`,
        `applicantWeightingFunction`,
        `GET`
      );
    }
  }

  //
  static async selectedApplicantsFunction(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from admissions_mgt.selected_applicant_function(${data.programmeCampusId})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `admittedApplicantsViews.service.js`,
        `selectedApplicantsFunction`,
        `GET`
      );
    }
  }

  //
  static async notSelectedApplicantsFunction(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from admissions_mgt.not_selected_applicant_function(${data.programmeCampusId})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `admittedApplicantsViews.service.js`,
        `notSelectedApplicantsFunction`,
        `GET`
      );
    }
  }

  // admitted applicants download

  static async admittedApplicantsDownload(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from admissions_mgt.admitted_students_download_function(${data.academic_year_id},${data.intake_id},
          ${data.degree_category_id},${data.admission_scheme_id},${data.programme_id}
          )`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `admittedApplicantsViews.service.js`,
        `admittedApplicantsDownload`,
        `GET`
      );
    }
  }

  // admitted_student_download_on_scheme

  static async admittedApplicantsSchemeDownload(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from admissions_mgt.admitted_student_download_on_scheme(${data.academic_year_id},${data.intake_id},
          ${data.degree_category_id},${data.admission_scheme_id}
          )`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `admittedApplicantsViews.service.js`,
        `admittedApplicantsSchemeDownload`,
        `GET`
      );
    }
  }

  // search admitted applicants ...
  static async searchAdmittedApplicant(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from admissions_mgt.search_admitted_applicant('${data.searchParam}')`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `admittedApplicantsViews.service.js`,
        `searchAdmittedApplicant`,
        `GET`
      );
    }
  }

  // by name

  static async searchAdmittedApplicantName(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from admissions_mgt.search_admitted_applicant_name('${data.searchParam}')`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `admittedApplicantsViews.service.js`,
        `searchAdmittedApplicantName`,
        `GET`
      );
    }
  }
}

module.exports = AdmittedApplicantsViewsService;
