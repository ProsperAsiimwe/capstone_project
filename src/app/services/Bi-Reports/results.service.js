const models = require('@models');
const { QueryTypes } = require('sequelize');

class ResultBiReportService {
  static async graduateStatistics(data) {
    try {
      const filtered = await models.sequelize.query(
        `
        select ROW_NUMBER() OVER (ORDER BY academic_unit_title) AS no, *
         from results_mgt.graduates_report(${data.academic_year_id})
          order by ROW_NUMBER() OVER (ORDER BY programme_title) 
          `,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // detailed report

  static async detailedGraduateReport(data) {
    try {
      const filtered = await models.sequelize.query(
        `
        select ROW_NUMBER() OVER (ORDER BY academic_unit_title) AS no, *
         from results_mgt.graduate_list_function(${data.academic_year_id})
          order by ROW_NUMBER() OVER (ORDER BY programme_title) 
          `,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // graduation_statistics_report

  static async graduateStatisticsReport(data) {
    try {
      const filtered = await models.sequelize.query(
        `
        select *
         from results_mgt.graduation_statistics_report(${data.academic_year_id})
          `,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // enrollmentBiReport

  static async enrollmentBiReport(data) {
    try {
      const filtered = await models.sequelize.query(
        `
        select *
         from enrollment_and_registration_mgt.enrollment_bi_report(${data.academic_year_id})
          `,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // enrollment academic years

  static async enrollmentAcademicYears() {
    try {
      const filtered = await models.sequelize.query(
        `
          select  distinct
          ay.academic_year_id as academic_year_id,may.metadata_value as academic_year
         from enrollment_and_registration_mgt.enrollments as enr
         left join events_mgt.events as evt on evt.id = enr.event_id
         left join events_mgt.academic_years as ay on ay.id = evt.academic_year_id
         left join app_mgt.metadata_values  as may on may.id = ay.academic_year_id
         where enr.is_active = true and enr.enrollment_condition = 'EARLY ENROLLMENT'
         group by  may.metadata_value , ay.academic_year_id 
         having(count(enr.id) > 23) order by may.metadata_value  desc
         limit 5
          `,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  //  results_mgt.result_summary_bi(academic_year  bigint)

  static async resultSummary(data) {
    try {
      const filtered = await models.sequelize.query(
        `select *
         from  results_mgt.result_summary_bi(${data})
          `,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

module.exports = ResultBiReportService;
