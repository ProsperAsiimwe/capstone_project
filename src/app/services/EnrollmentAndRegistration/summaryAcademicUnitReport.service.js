const models = require('@models');
const { QueryTypes } = require('sequelize');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

class SummaryAcademicUnitService {
  // Faculty , all campuses report

  static async facultyByCampus(data) {
    try {
      const filtered = await models.sequelize.query(
        `select 
         faculty_code,faculty_title,enrollment_type,
         programme_type,programme_study_years,
         sum(total_number_enrolled_students) as total_number_enrolled_students,
         sum(number_full_registration_students) as number_full_registration_students,
         sum(number_provisional_registration_students) as number_provisional_registration_students

         from enrollment_and_registration_mgt.faculty_enrollment_report(${data.academic_year_id},
          ${data.intake_id},${data.semester_id})
          where  campus_id = ${data.campus_id} 
          group by  faculty_code,faculty_title,enrollment_type,programme_type,programme_study_years
          `,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `summaryAcademicUnitReport.service.js`,
        `facultyByCampus`,
        `GET`
      );
    }
  }

  // college
  static async collegeByCampus(data) {
    try {
      const filtered = await models.sequelize.query(
        `select 
         college_code,college_title,enrollment_type,
         programme_type,programme_study_years,
         sum(total_number_enrolled_students) as total_number_enrolled_students,
         sum(number_full_registration_students) as number_full_registration_students,
         sum(number_provisional_registration_students) as number_provisional_registration_students

         from enrollment_and_registration_mgt.college_enrollment_report(${data.academic_year_id},
          ${data.intake_id},${data.semester_id})
          where  campus_id = ${data.campus_id} 
          group by  college_code,college_title,enrollment_type,programme_type,programme_study_years
          `,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `summaryAcademicUnitReport.service.js`,
        `collegeByCampus`,
        `GET`
      );
    }
  }

  // department
  static async departmentByCampus(data) {
    try {
      const filtered = await models.sequelize.query(
        `select 
         department_code,department_title,enrollment_type,
         programme_type,programme_study_years,
         sum(total_number_enrolled_students) as total_number_enrolled_students,
         sum(number_full_registration_students) as number_full_registration_students,
         sum(number_provisional_registration_students) as number_provisional_registration_students

         from enrollment_and_registration_mgt.department_enrollment_report(${data.academic_year_id},
          ${data.intake_id},${data.semester_id})
          where  campus_id = ${data.campus_id} 
          group by  department_code,department_title,enrollment_type,programme_type,programme_study_years
          `,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `summaryAcademicUnitReport.service.js`,
        `departmentByCampus`,
        `GET`
      );
    }
  }
}

module.exports = SummaryAcademicUnitService;
