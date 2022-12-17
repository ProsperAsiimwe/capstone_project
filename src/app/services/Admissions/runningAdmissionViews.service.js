const models = require('@models');
const { QueryTypes } = require('sequelize');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for a runningAdmissionApplicant
class RunningAdmissionViewsService {
  // admission summary
  static async runningAdmissionSummary(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from admissions_mgt.admission_summary(${data.academic_year_id},
          ${data.intake_id},
          ${data.admission_scheme_id})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `runningAdmissionViews.service.js`,
        `runningAdmissionSummary`,
        `GET`
      );
    }
  }

  // running admission applicants
  static async programmeCampusApplicantsSections(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from admissions_mgt.applicants(${data.programme_campus_id})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `runningAdmissionViews.service.js`,
        `programmeCampusApplicantsSections`,
        `GET`
      );
    }
  }

  // running admission programmes
  static async runningAdmissionProgrammes(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from admissions_mgt.running_admission_programmes_function(${data.academic_year_id},
          ${data.intake_id},
          ${data.degree_category_id},
          ${data.admission_scheme_id})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `runningAdmissionViews.service.js`,
        `runningAdmissionProgrammes`,
        `GET`
      );
    }
  }

  //  admitted_direct_uploads

  static async admittedDirectUploadProgrammes(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from admissions_mgt.admitted_direct_uploads(${data.academic_year_id},
          ${data.intake_id},
          ${data.degree_category_id},
          ${data.admission_scheme_id})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `runningAdmissionViews.service.js`,
        `admittedDirectUploadProgrammes`,
        `GET`
      );
    }
  }
  // running admission programme campuses

  static async runningAdmissionProgrammeCampuses(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from admissions_mgt.admission_programme_campuses_function(${data.running_admission_programme_id})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `runningAdmissionViews.service.js`,
        `runningAdmissionProgrammeCampuses`,
        `GET`
      );
    }
  }

  //  admissions_mgt.programme_campus_applicants(programme_campus bigint)

  static async programmeCampusApplicants(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from admissions_mgt.programme_campus_applicants(${data.programme_campus_id})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `runningAdmissionViews.service.js`,
        `programmeCampusApplicants`,
        `GET`
      );
    }
  }

  //  applicant running admission programmes

  static async applicantAdmissionProgrammes(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from admissions_mgt.advertised_admission_programmes(${data.running_admission_id})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `runningAdmissionViews.service.js`,
        `applicantAdmissionProgrammes`,
        `GET`
      );
    }
  }
}

module.exports = RunningAdmissionViewsService;
