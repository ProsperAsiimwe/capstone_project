const models = require('@models');
const { QueryTypes } = require('sequelize');

class AdmissionBiReportService {
  // AdmissionReportService

  static async admissionReport(data) {
    try {
      const filtered = await models.sequelize.query(
        `
        select *
         from  admissions_mgt.admission_bi_report(${data})
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

  // programme

  static async admissionProgrammeReport(data) {
    try {
      const filtered = await models.sequelize.query(
        `
        select *
         from  admissions_mgt.admission_programme_bi(${data})
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

  // admissions_mgt.admission_age_report(academic_year  bigint)

  static async admissionAgeReport(data) {
    try {
      const filtered = await models.sequelize.query(
        `
        select *
         from  admissions_mgt.admission_age_report(${data})
         order by age
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
  static async admissionAgeGroupReport(data) {
    try {
      const filtered = await models.sequelize.query(
        `
        select
         sum(total_admitted)filter(where age < 20)  as "age<20",
         sum(total_admitted)filter(where age >=20 and age <= 30)   as "20-30",
         sum(total_admitted)filter(where age >=31 and age <= 40)   as "31-40",
         sum(total_admitted)filter(where age >=41 and age <= 50)   as "41-50",
         sum(total_admitted)filter(where age >=51)   as "age>50",
         sum(total_admitted)filter(where age is null)   as "Not defined"
         from  admissions_mgt.admission_age_report(${data})
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

module.exports = AdmissionBiReportService;
