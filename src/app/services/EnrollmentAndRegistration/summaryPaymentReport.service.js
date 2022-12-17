const models = require('@models');
const { QueryTypes } = require('sequelize');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

class SummaryPaymentReportService {
  // Faculty , by campuses report

  static async facultyByCampus(data) {
    try {
      const filtered = await models.sequelize.query(
        `select *
         from enrollment_and_registration_mgt.faculty_payments_report(${data.academic_year_id},
          ${data.intake_id},${data.semester_id})
          where  campus_id = ${data.campus_id} 
          `,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `summaryPaymentReport.service.js`,
        `facultyByCampus`,
        `GET`
      );
    }
  }

  // allCampusFacultyByCampus

  static async allCampusFacultyByCampus(data) {
    try {
      const filtered = await models.sequelize.query(
        `select 
          academic_unit_code,
          academic_unit_title,
          sum(students_billed_tuition) as students_billed_tuition,
          sum(students_billed_functional) as students_billed_functional,
          sum(students_billed_other_fees) as students_billed_other_fees,
          sum(students_billed_manual_invoices) as students_billed_manual_invoices,

          sum(tuition_amount_paid) as tuition_amount_paid,
          sum(tuition_invoice_amount) as tuition_invoice_amount,
          sum(tuition_amount_due) as tuition_amount_due,

          sum(functional_fees_amount_paid) as functional_fees_amount_paid,
          sum(functional_fees_invoice_amount) as functional_fees_invoice_amount,
          sum(functional_fees_amount_due) as functional_fees_amount_due,

          sum(other_fees_invoice_amount) as other_fees_invoice_amount,
          sum(other_fees_amount_paid) as other_fees_amount_paid,
          sum(other_fees_amount_due) as other_fees_amount_due,

          sum( manual_invoices_amount_paid) as manual_invoices_amount_paid ,
				  sum(manual_invoice_amount) as manual_invoice_amount,
				  sum(manual_invoice_amount_due) as manual_invoice_amount_due

         from enrollment_and_registration_mgt.faculty_payments_report(${data.academic_year_id},
          ${data.intake_id},${data.semester_id})
          group by academic_unit_code,
          academic_unit_title
          `,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `summaryPaymentReport.service.js`,
        `allCampusFacultyByCampus`,
        `GET`
      );
    }
  }

  // College , by campuses report

  static async collegeByCampus(data) {
    try {
      const filtered = await models.sequelize.query(
        `select *
         from enrollment_and_registration_mgt.college_payments_report(${data.academic_year_id},
          ${data.intake_id},${data.semester_id})
          where  campus_id = ${data.campus_id} 
          `,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `summaryPaymentReport.service.js`,
        `collegeByCampus`,
        `GET`
      );
    }
  }

  static async allCampusCollegeByCampus(data) {
    try {
      const filtered = await models.sequelize.query(
        `select 

          academic_unit_code,
          academic_unit_title,
          sum(students_billed_tuition) as students_billed_tuition,
          sum(students_billed_functional) as students_billed_functional,
          sum(students_billed_other_fees) as students_billed_other_fees,
          sum(students_billed_manual_invoices) as students_billed_manual_invoices,


          sum(tuition_amount_paid) as tuition_amount_paid,
          sum(tuition_invoice_amount) as tuition_invoice_amount,
          sum(tuition_amount_due) as tuition_amount_due,

          sum(functional_fees_amount_paid) as functional_fees_amount_paid,
          sum(functional_fees_invoice_amount) as functional_fees_invoice_amount,
          sum(functional_fees_amount_due) as functional_fees_amount_due,

          sum(other_fees_invoice_amount) as other_fees_invoice_amount,
          sum(other_fees_amount_paid) as other_fees_amount_paid,
          sum(other_fees_amount_due) as other_fees_amount_due,

          sum( manual_invoices_amount_paid) as manual_invoices_amount_paid ,
				  sum(manual_invoice_amount) as manual_invoice_amount,
				  sum(manual_invoice_amount_due) as manual_invoice_amount_due

         from enrollment_and_registration_mgt.college_payments_report(${data.academic_year_id},
          ${data.intake_id},${data.semester_id})
          group by academic_unit_code,
          academic_unit_title
          `,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `summaryPaymentReport.service.js`,
        `allCampusCollegeByCampus`,
        `GET`
      );
    }
  }

  // campus programme analytics

  static async campusPaymentReportsFaculty(data) {
    try {
      const filtered = await models.sequelize.query(
        `select *
         from enrollment_and_registration_mgt.faculty_campus_payments(${data.academic_year_id},
          ${data.intake_id},${data.semester_id})
          order by academic_unit_code,academic_unit_title
          `,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `summaryPaymentReport.service.js`,
        `campusPaymentReportsFaculty`,
        `GET`
      );
    }
  }

  static async campusPaymentReportsCollege(data) {
    try {
      const filtered = await models.sequelize.query(
        `select *
         from enrollment_and_registration_mgt.college_campus_payments(${data.academic_year_id},
          ${data.intake_id},${data.semester_id})
          order by academic_unit_code,academic_unit_title
          `,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `summaryPaymentReport.service.js`,
        `campusPaymentReportsCollege`,
        `GET`
      );
    }
  }

  // Fees Deposits  report

  static async feesDepositsFacultyReport(data) {
    try {
      const filtered = await models.sequelize.query(
        `select ROW_NUMBER() OVER (ORDER BY academic_unit_title) AS no, *
         from enrollment_and_registration_mgt.faculty_allocation_report(${data.campus_id},
          ${data.intake_id},'${data.from_date}','${data.to_date}')
          order by academic_unit_code,academic_unit_title
          `,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `summaryPaymentReport.service.js`,
        `feesDepositsFacultyReport`,
        `GET`
      );
    }
  }

  // data programme fees deposits

  static async feesDepositsProgrammeReport(data) {
    try {
      const filtered = await models.sequelize.query(
        `select *
         from enrollment_and_registration_mgt.detailed_allocation_report(${data.campus_id},
          ${data.intake_id},${data.programme_id},'${data.from_date}','${data.to_date}')
          order by surname,other_names
          `,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `summaryPaymentReport.service.js`,
        `feesDepositsProgrammeReport`,
        `GET`
      );
    }
  }
}

module.exports = SummaryPaymentReportService;
