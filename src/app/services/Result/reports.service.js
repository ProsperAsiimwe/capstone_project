const models = require('@models');
const { QueryTypes } = require('sequelize');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for this entity
class ReportsService {
  static async studentResults(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from results_mgt.result_report(${data.academic_year_id},${data.campus_id},${data.intake_id},
          ${data.programme_id},${data.study_year_id},${data.semester_id}) order by cgpa desc
          `,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `reports.service.js`,
        `studentResults`,
        `GET`
      );
    }
  }

  // result by course
  static async resultsByCourse(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from results_mgt.result_summary(${data.academic_year_id},${data.campus_id},${data.intake_id},
          ${data.programme_id},${data.study_year_id},${data.semester_id}) 
          `,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `reports.service.js`,
        `resultsByCourse`,
        `GET`
      );
    }
  }

  // programmes_by_department
  static async programmesByDepartment(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from results_mgt.programmes_study_years(${data.department_id})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `reports.service.js`,
        `programmesByDepartment`,
        `GET`
      );
    }
  }

  /**
   * detailed report
   */
  static async resultDetailedReport(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from results_mgt.result_detail_report(${data.academic_year_id},${data.campus_id},${data.intake_id},
          ${data.programme_id},${data.study_year_id},${data.semester_id}) order by cgpa desc
          `,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `reports.service.js`,
        `resultDetailedReport`,
        `GET`
      );
    }
  }
  // subject  combination result report

  static async detailedSubjectCombinationReport(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from results_mgt.detail_report_subject_combination(${data.academic_year_id},${data.campus_id},${data.intake_id},
          ${data.programme_id},${data.study_year_id},${data.semester_id},${data.subject_combination_id})  order by cgpa desc
          `,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `reports.service.js`,
        `detailedSubjectCombinationReport`,
        `GET`
      );
    }
  }

  // previous cumulative gpa
  static async studentCumulativeGpa(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from results_mgt.student_previous_gpa(${data.academic_year_id},${data.campus_id},${data.intake_id},
          ${data.programme_id},'${data.studyYear}','${data.semester}') 
          `,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `reports.service.js`,
        `studentCumulativeGpa`,
        `GET`
      );
    }
  }

  // retake courses
  static async studentRetakeCourses(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from results_mgt.retake_courses(${data.academic_year_id},${data.campus_id},${data.intake_id},
          ${data.programme_id},${data.study_year_id},${data.semester_id}) 
          `,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `reports.service.js`,
        `studentRetakeCourses`,
        `GET`
      );
    }
  }

  // app_mgt.metadata_value_function(metadata bigint

  static async metadataValueById(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from app_mgt.metadata_value_function(${data}) 
          `,
        {
          type: QueryTypes.SELECT,
          plain: true,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `reports.service.js`,
        `metadataValueById`,
        `GET`
      );
    }
  }

  //  result_summary_report
  static async resultCategoryReport(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from results_mgt.result_summary_report(${data.academic_year_id},${data.campus_id},${data.intake_id},
          ${data.programme_id},${data.study_year_id},${data.semester_id}) 
          `,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `reports.service.js`,
        `resultCategoryReport`,
        `GET`
      );
    }
  }

  // result category policy
  static async resultCategoryPolicy(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from results_mgt.result_category_function(${data.programme_study_level_id})
          `,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `reports.service.js`,
        `resultCategoryPolicy`,
        `GET`
      );
    }
  }

  // Programme Study Level
  static async programmeStudyLevel(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from results_mgt.study_level_function(${data.programme_id})
          `,
        {
          type: QueryTypes.SELECT,
          plain: true,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `reports.service.js`,
        `programmeStudyLevel`,
        `GET`
      );
    }
  }

  //
  static async resultSemestersDetail(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from (
          select 
          pvc.programme_version_id,
          pv.has_specializations,
          pv.has_subject_combination_categories,
          case 
          when ps.metadata_value like '%REC%'
          then 'SEMESTER III' else  ps.metadata_value 
          end as semester,
          py.metadata_value as study_years
          from programme_mgt.programme_version_course_units as pvc
          left join programme_mgt.programme_versions as pv
          on pv.id = pvc.programme_version_id
          left join app_mgt.metadata_values as ps
          on ps.id = pvc.course_unit_semester_id
          left join  programme_mgt.programme_study_years as psy
          on psy.id = pvc.course_unit_year_id
          left join app_mgt.metadata_values as py
          on py.id = psy.programme_study_year_id 
          where pvc.programme_version_id = ${data.programme_version_id} and 
          py.metadata_value <= '${data.MetadataStudyYear}'
          group by pvc.programme_version_id,
          pvc.course_unit_semester_id,pvc.course_unit_year_id,ps.metadata_value,py.metadata_value,
          pv.has_specializations,pv.has_subject_combination_categories
          order by py.metadata_value,ps.metadata_value) as t
          where t.semester != 'SEMESTER III'
          order by t.study_years,t.semester
          `,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `reports.service.js`,
        `programmeStudyLevel`,
        `GET`
      );
    }
  }
}

module.exports = ReportsService;
