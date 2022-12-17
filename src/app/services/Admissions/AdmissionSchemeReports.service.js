const models = require('@models');
const { QueryTypes } = require('sequelize');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// REPORTS
class AdmissionSchemeReportsService {
  // Admission scheme report
  static async admissionSchemeReport(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from admissions_mgt.running_scheme_report(${data.academic_year_id},${data.intake_id},
          ${data.degree_category_id},${data.admission_scheme_id})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `AdmissionSchemeReports.service.js`,
        `admissionSchemeReport`,
        `GET`
      );
    }
  }

  // uneb reports

  static async unebAdmissionReport(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from admissions_mgt.admission_uneb_report(${data.academic_year_id},${data.intake_id},
          ${data.admission_scheme_id}, ${data.degree_category_id},${data.offset_value},${data.limit_value})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `AdmissionSchemeReports.service.js`,
        `unebAdmissionReport`,
        `GET`
      );
    }
  }

  // unpaid applications

  static async unebUnpaidApplications(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from admissions_mgt.unpaid_admission_uneb_report(${data.academic_year_id},${data.intake_id},
          ${data.admission_scheme_id}, ${data.degree_category_id},${data.offset_value},${data.limit_value})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `AdmissionSchemeReports.service.js`,
        `unebUnpaidApplications`,
        `GET`
      );
    }
  }

  // all applications
  // unpaid applications

  static async unebAllApplications(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from admissions_mgt.all_admission_uneb_report(${data.academic_year_id},${data.intake_id},
          ${data.admission_scheme_id}, ${data.degree_category_id},${data.offset_value},${data.limit_value})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `AdmissionSchemeReports.service.js`,
        `unebAllApplications`,
        `GET`
      );
    }
  }

  //  diploma_report_function

  static async diplomaAdmissionReport(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from admissions_mgt.diploma_report_function(${data.academic_year_id},${data.intake_id},
          ${data.admission_scheme_id}, ${data.degree_category_id},${data.offset_value},${data.limit_value})
          order by surname,other_names asc`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `AdmissionSchemeReports.service.js`,
        `diplomaAdmissionReport`,
        `GET`
      );
    }
  }

  //  programme_admission_report_function

  static async paidCompleteProgrammeReport(data) {
    try {
      let functionName = '';
      if (data.key === 'all') {
        functionName = 'programme_admission_report_2';
      } else {
        functionName = 'programme_admission_report_function';
      }
      const filtered = await models.sequelize.query(
        `select * from admissions_mgt.${functionName}(${data.academic_year_id},${data.intake_id},
          ${data.admission_scheme_id}, ${data.degree_category_id},
          ${data.offset_value},${data.limit_value},${data.programme_campus_id})
          order by surname,other_names asc`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `AdmissionSchemeReports.service.js`,
        `paidCompleteProgrammeReport`,
        `GET`
      );
    }
  }

  // diploma_admission_report_2

  static async diplomaAdmissionReportKyu(data) {
    try {
      let filtered = [];

      if (data.category === 'all') {
        data.off_set_value = 0;
        data.limit_value = 500;
        const totalApplicants = await models.sequelize.query(
          `
          select 
count(abo.form_id) as number_of_applicants
from admissions_mgt.running_admissions  as ra
left join admissions_mgt.applicant_bio_data as abo
on abo.running_admission_id = ra.id
inner join admissions_mgt.applicants as apt
on abo.applicant_id = apt.id
left join admissions_mgt.running_admission_applicants as rad
on rad.running_admission_id = ra.id 
and rad.applicant_id = abo.applicant_id
and rad.form_id = abo.form_id

where 
ra.academic_year_id = ${data.academic_year_id} and
ra.intake_id = ${data.intake_id} and
ra.admission_scheme_id = ${data.admission_scheme_id}  and
ra.degree_category_id = ${data.degree_category_id} and
rad.application_status = 'COMPLETED'
          `,
          {
            type: QueryTypes.SELECT,
            plain: true,
          }
        );

        const length = totalApplicants.number_of_applicants;
        let result = [];
        let limitValue = 1000;

        for (let offset = 0; offset <= length; offset + 1000) {
          result = await models.sequelize.query(
            `select * from admissions_mgt.all_diploma_admission_report(${data.academic_year_id},${data.intake_id},
          ${data.admission_scheme_id}, ${data.degree_category_id},${offset},${limitValue})
          order by surname,other_names asc`,
            {
              type: QueryTypes.SELECT,
            }
          );
          filtered.push(...result);
          offset = limitValue;
          limitValue = limitValue + 1000;
        }
      } else {
        filtered = await models.sequelize.query(
          `select * from admissions_mgt.diploma_admission_report_2(${data.academic_year_id},${data.intake_id},
          ${data.admission_scheme_id}, ${data.degree_category_id},${data.programme_campus_id})
          order by surname,other_names asc`,
          {
            type: QueryTypes.SELECT,
          }
        );
      }

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `AdmissionSchemeReports.service.js`,
        `diplomaAdmissionReportKyu`,
        `GET`
      );
    }
  }

  // download subject combination dat

  static async applicantSubjectCombinations(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from admissions_mgt.applicant_subject_combinations_function(${data.academic_year_id},${data.intake_id},
          ${data.admission_scheme_id}, ${data.degree_category_id})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `AdmissionSchemeReports.service.js`,
        `applicantSubjectCombinations`,
        `GET`
      );
    }
  }

  // by programme

  static async applicantCombinationsByProgramme(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from admissions_mgt.applicant_subject_combinations_function(${data.academic_year_id},${data.intake_id},
          ${data.admission_scheme_id}, ${data.degree_category_id})
          where programme_id = ${data.programme_id} `,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `AdmissionSchemeReports.service.js`,
        `applicantCombinationsByProgramme`,
        `GET`
      );
    }
  }

  //  change of programme students.

  static async changeProgrammeStudents(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from admissions_mgt.change_programme_students(${data.academic_year_id},'${data.service_type}') `,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `AdmissionSchemeReports.service.js`,
        `changeProgrammeStudents`,
        `GET`
      );
    }
  }

  static async modeEntryStudentsReport(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from admissions_mgt.change_programme_students(${data.academic_year_id},'${data.service_type}')
        where mode_of_entry = '${data.mode_of_entry}' `,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `AdmissionSchemeReports.service.js`,
        `modeEntryStudentsReport`,
        `GET`
      );
    }
  }

  // for paid
  static async changeProgrammeStudentsPaid(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from admissions_mgt.change_programme_students(${data.academic_year_id},'${data.service_type}') 
        where payment_status ='PAID' `,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `AdmissionSchemeReports.service.js`,
        `changeProgrammeStudentsPaid`,
        `GET`
      );
    }
  }

  static async modeEntryStudentsPaid(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from admissions_mgt.change_programme_students(${data.academic_year_id},'${data.service_type}') 
        where payment_status ='PAID' and mode_of_entry = '${data.mode_of_entry}' `,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `AdmissionSchemeReports.service.js`,
        `modeEntryStudentsPaid`,
        `GET`
      );
    }
  }

  // un paid
  static async changeProgrammeStudentsUnpaid(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from admissions_mgt.change_programme_students(${data.academic_year_id},'${data.service_type}') 
        where payment_status ='PENDING' `,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `AdmissionSchemeReports.service.js`,
        `changeProgrammeStudentsUnpaid`,
        `GET`
      );
    }
  }

  static async modeEntryStudentsUnpaid(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from admissions_mgt.change_programme_students(${data.academic_year_id},'${data.service_type}') 
        where payment_status ='PENDING' and  mode_of_entry = '${data.mode_of_entry} `,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `AdmissionSchemeReports.service.js`,
        `modeEntryStudentsUnpaid`,
        `GET`
      );
    }
  }

  //  APPROVED
  static async changeProgrammeStudentsApproved(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from admissions_mgt.change_programme_students(${data.academic_year_id},'${data.service_type}') 
        where request_status ='APPROVED' `,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `AdmissionSchemeReports.service.js`,
        `changeProgrammeStudentsApproved`,
        `GET`
      );
    }
  }

  static async modeEntryStudentsApproved(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from admissions_mgt.change_programme_students(${data.academic_year_id},'${data.service_type}') 
        where request_status ='APPROVED'  and mode_of_entry = '${data.mode_of_entry}`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `AdmissionSchemeReports.service.js`,
        `modeEntryStudentsApproved`,
        `GET`
      );
    }
  }

  //
  static async changeProgrammeStudentsPending(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from admissions_mgt.change_programme_students(${data.academic_year_id},'${data.service_type}') 
        where request_status ='PENDING' `,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `AdmissionSchemeReports.service.js`,
        `changeProgrammeStudentsPending`,
        `GET`
      );
    }
  }

  static async modeEntryStudentsPending(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from admissions_mgt.change_programme_students(${data.academic_year_id},'${data.service_type}') 
        where request_status ='PENDING' and mode_of_entry = '${data.mode_of_entry}`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `AdmissionSchemeReports.service.js`,
        `modeEntryStudentsPending`,
        `GET`
      );
    }
  }

  // diploma uneb report

  static async diplomaResultApplicantReport(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from admissions_mgt.admission_diploma_uneb_report(${data.academic_year_id},${data.intake_id},
          ${data.admission_scheme_id}, ${data.degree_category_id},${data.offset_value},${data.limit_value})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `AdmissionSchemeReports.service.js`,
        `diplomaResultApplicantReport`,
        `GET`
      );
    }
  }

  // all_admission_diploma_report_php
  static async AllDiplomaApplicantReport(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from admissions_mgt.all_admission_diploma_report_php(${data.academic_year_id},${data.intake_id},
          ${data.admission_scheme_id}, ${data.degree_category_id},${data.offset_value},${data.limit_value})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `AdmissionSchemeReports.service.js`,
        `AllDiplomaApplicantReport`,
        `GET`
      );
    }
  }

  // unpaid_admission_diploma_report_php
  static async unpaidlDiplomaApplicantReport(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from admissions_mgt.unpaid_admission_diploma_report_php(${data.academic_year_id},${data.intake_id},
          ${data.admission_scheme_id}, ${data.degree_category_id},${data.offset_value},${data.limit_value})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `AdmissionSchemeReports.service.js`,
        `unpaidlDiplomaApplicantReport`,
        `GET`
      );
    }
  }

  // admissionAnalyticsReport

  static async admissionAnalyticsReport(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from admissions_mgt.admission_analytics_report_1(${data.academic_year_id},${data.intake_id},
          ${data.admission_scheme_id}, ${data.degree_category_id})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `AdmissionSchemeReports.service.js`,
        `admissionAnalyticsReport`,
        `GET`
      );
    }
  }

  static async admissionAnalyticsColleges(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from admissions_mgt.admission_analytics_report_2(${data.academic_year_id},${data.intake_id},
          ${data.admission_scheme_id}, ${data.degree_category_id})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `AdmissionSchemeReports.service.js`,
        `admissionAnalyticsColleges`,
        `GET`
      );
    }
  }

  static async admissionAnalyticsFaculties(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from admissions_mgt.faculty_admission_analytics_2(${data.academic_year_id},${data.intake_id},
          ${data.admission_scheme_id}, ${data.degree_category_id})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `AdmissionSchemeReports.service.js`,
        `admissionAnalyticsFaculties`,
        `GET`
      );
    }
  }

  // college admissions academic year
  static async academicYearCollegeReport(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from admissions_mgt.academic_year_admission_1(${data.academic_year_id},${data.intake_id})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `AdmissionSchemeReports.service.js`,
        `academicYearCollegeReport`,
        `GET`
      );
    }
  }

  static async academicYearCollegeCampus(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from admissions_mgt.academic_year_admission_1(${data.academic_year_id},${data.intake_id})
        where campus_id = ${data.campus_id}`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `AdmissionSchemeReports.service.js`,
        `academicYearCollegeCampus`,
        `GET`
      );
    }
  }

  // faculty admissions academic year
  static async academicYearFacultyReport(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from admissions_mgt.academic_year_admission_2(${data.academic_year_id},${data.intake_id})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `AdmissionSchemeReports.service.js`,
        `academicYearFacultyReport`,
        `GET`
      );
    }
  }

  static async academicYearFacultyCampus(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from admissions_mgt.academic_year_admission_2(${data.academic_year_id},${data.intake_id})
        where campus_id = ${data.campus_id}`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `AdmissionSchemeReports.service.js`,
        `academicYearFacultyCampus`,
        `GET`
      );
    }
  }

  // graduate school report

  static async graduateProgrammeAdmissions(data) {
    try {
      const filtered = await models.sequelize.query(
        `select row_number() over(order by surname) as sn, * from admissions_mgt.graduate_admission_report(${data.academic_year_id},${data.intake_id},
          ${data.admission_scheme_id}, ${data.degree_category_id},${data.programme_campus_id})
          `,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `AdmissionSchemeReports.service.js`,
        `graduateProgrammeAdmissions`,
        `GET`
      );
    }
  }
  static async programmeByProgCampus(data) {
    try {
      const filtered = await models.sequelize.query(
        `select apc.programme_campus_id,rapc.running_admission_programme_id,pp.programme_code as programme_code,
        pp.programme_title as programme_title,pf.faculty_title as faculty_title,pf.faculty_code as faculty_code 
        from admissions_mgt.applicant_programme_choices as apc 
        left join admissions_mgt.running_admission_programme_campuses as rapc
        on apc.programme_campus_id = rapc.id
        left join admissions_mgt.running_admission_programmes as rap
        on rap.id = rapc.running_admission_programme_id
        left join programme_mgt.programmes as pp
        on pp.id = rap.programme_id
        left join programme_mgt.departments as dpt
        on dpt.id = pp.department_id
        left join programme_mgt.faculties as pf
        on pf.id = dpt.faculty_id 
        where apc.programme_campus_id = ${data.programme_campus_id}`,
        {
          type: QueryTypes.SELECT,
          plain: true,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `AdmissionSchemeReports.service.js`,
        `graduateProgrammeAdmissions`,
        `GET`
      );
    }
  }
}

module.exports = AdmissionSchemeReportsService;
