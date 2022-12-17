const models = require('@models');
const { QueryTypes } = require('sequelize');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// search  applicant
class SearchApplicantsService {
  // Applicants by name
  static async searchApplicantByName(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from admissions_mgt.search_applicant_by_name(${data.academic_year_id},${data.intake_id},${data.admission_scheme_id},
            '${data.name}')`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `searchApplicants.service.js`,
        `searchApplicantByName`,
        `GET`
      );
    }
  }

  // applicant by form

  static async searchApplicantByForm(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from admissions_mgt.search_applicant_by_form('${data.formId}')`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `searchApplicants.service.js`,
        `searchApplicantByForm`,
        `GET`
      );
    }
  }

  // applicant by contact

  static async searchApplicantByContact(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from admissions_mgt.search_applicant_by_contact(${data.academic_year_id},${data.intake_id},${data.admission_scheme_id},
            '${data.contact}')`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `searchApplicants.service.js`,
        `searchApplicantByContact`,
        `GET`
      );
    }
  }
}

module.exports = SearchApplicantsService;
