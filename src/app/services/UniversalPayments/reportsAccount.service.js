const models = require('@models');
const { QueryTypes } = require('sequelize');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

class ReportsAccountService {
  // tuitionPaymentReport
  static async tuitionPaymentReport(data) {
    try {
      const tuition = await models.sequelize.query(
        `select 
        fees_element_code,
        fees_element_name,
        sum(fees_element_amount_paid) as amount
         from universal_payments_mgt.fy_payment_report('${data.payments_from}',
        '${data.payments_to}')
        group by fees_element_code,fees_element_name`,
        {
          type: QueryTypes.SELECT,
        }
      );
      const functional = await models.sequelize.query(
        `select 
        fees_element_code,
        fees_element_name,
        sum(fees_element_amount_paid) as amount
         from universal_payments_mgt.fy_payment_functional_report('${data.payments_from}',
        '${data.payments_to}')
        group by fees_element_code,fees_element_name`,
        {
          type: QueryTypes.SELECT,
        }
      );
      const other = await models.sequelize.query(
        `select 
        fees_element_code,
        fees_element_name,
        sum(fees_element_amount_paid) as amount
         from universal_payments_mgt.fy_payment_other_report('${data.payments_from}',
        '${data.payments_to}')
        group by fees_element_code,fees_element_name`,
        {
          type: QueryTypes.SELECT,
        }
      );
      const manual = await models.sequelize.query(
        `select 
        fees_element_code,
        fees_element_name,
        sum(fees_element_amount_paid) as amount
         from universal_payments_mgt.fy_payment_manual_report('${data.payments_from}',
        '${data.payments_to}')
        group by fees_element_code,fees_element_name`,
        {
          type: QueryTypes.SELECT,
        }
      );
      const finalYearRetake = await models.sequelize.query(
        `select 
        fees_element_code,
        fees_element_name,
        sum(fees_element_amount_paid) as amount
         from universal_payments_mgt.fy_payment_retake('${data.payments_from}',
        '${data.payments_to}')
        group by fees_element_code,fees_element_name`,
        {
          type: QueryTypes.SELECT,
        }
      );

      let filtered = [
        ...tuition,
        ...functional,
        ...other,
        ...manual,
        ...finalYearRetake,
      ];

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `reportsAccount.service.js`,
        `universalPay`,
        `GET`
      );
    }
  }

  // fy_universal_account_report

  static async universalAccountReport(data) {
    try {
      const filtered = await models.sequelize.query(
        `select 
        account_code as fees_element_code,
        account_name as fees_element_name,
        sum(total_amount) as amount
         from universal_payments_mgt.fy_universal_account_report('${data.payments_from}',
        '${data.payments_to}')
        group by account_code,account_name`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `reportsAccount.service.js`,
        `universalPay`,
        `GET`
      );
    }
  }

  static async uniPayItemReport2(data) {
    try {
      const filtered = await models.sequelize.query(
        `select 
         account_code as fees_element_code,
         account_name as fees_element_name,
         sum(total_amount) as amount
         from universal_payments_mgt.item_uni_pay_report('${data.payments_from}',
        '${data.payments_to}')
        group by account_code,account_name`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `reportsAccount.service.js`,
        `universalPay`,
        `GET`
      );
    }
  }

  // student payments invoices

  static async studentInvoicePerItem(data) {
    try {
      const filtered = await models.sequelize.query(
        `select 
         account_code as fees_element_code,
         account_name as fees_element_name,
         sum(total_amount) as amount
         from universal_payments_mgt.students_item_report('${data.payments_from}','${data.payments_to}')
        group by account_code,account_name`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `reportsAccount.service.js`,
        `universalPay`,
        `GET`
      );
    }
  }

  //

  static async chartAccountApplicationReport(data) {
    try {
      const filtered = await models.sequelize.query(
        `select  account_code as fees_element_code,
        account_name as fees_element_name,
        sum(total_amount) as amount
         from universal_payments_mgt.application_accounts_report('${data.payments_from}',
        '${data.payments_to}')
        group by account_code,account_name`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `reportsChartOfAcounts.service.js`,
        `chartAccountApplicationReport`,
        `GET`
      );
    }
  }

  // change of programme

  static async chartAccountChangeProgramme(data) {
    try {
      const filtered = await models.sequelize.query(
        `
        select 
             -- cop.service_type,
              cha.account_code as fees_element_code,
              cha.account_name as fees_element_name,
              sum(cop.paid) as amount
              from admissions_mgt.change_of_programmes as cop
              left join app_mgt.metadata_values as mst 
              on mst.metadata_value = cop.service_type
              inner join institution_policy_mgt.student_services_policy as stsp 
              on mst.id = stsp.student_service_type_id
              left join universal_payments_mgt.chart_of_accounts as cha
              on cha.id = stsp.account_id
              where cop.amount > 0 and 
              cop.created_at >= '${data.payments_from}' and
              cop.created_at <= '${data.payments_to}'
              group by 
             -- cop.service_type,
              cha.account_code, cha.account_name
          `,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `reportsChartOfAcounts.service.js`,
        `chartAccountApplicationReport`,
        `GET`
      );
    }
  }

  // graduation
  static async chartAccountGraduationFees(data) {
    try {
      const filtered = await models.sequelize.query(
        `
        select 
       -- gfe.fees_element_id,
        ca.account_code as fees_element_code,
        fe.fees_element_name as fees_element_name,
        sum(gfe.amount) as amount
        from results_mgt.graduation_fee_invoices as gf
        left join  results_mgt.graduation_fee_invoice_elements  as gfe
        on gfe.graduation_fee_invoice_id = gf.id
        left join fees_mgt.fees_elements  as fe
        on gfe.fees_element_id = fe.id
        left join universal_payments_mgt.chart_of_accounts as ca
        on ca.id = fe.account_id
        where gf.amount_paid > 0 and gf.updated_at >='${data.payments_from}' and gf.updated_at <='${data.payments_to}'
        group by 
        ca.account_code,
        fe.fees_element_name
       -- gfe.fees_element_id
          `,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `reportsChartOfAcounts.service.js`,
        `chartAccountApplicationReport`,
        `GET`
      );
    }
  }

  // graduation_revenue_report
  static async graduationRevenueReport(data) {
    try {
      const filtered = await models.sequelize.query(
        `
        select *
        from  universal_payments_mgt.graduation_revenue_report('${data.payments_from}','${data.payments_to}')
          `,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `reportsChartOfAcounts.service.js`,
        `graduationRevenueReport`,
        `GET`
      );
    }
  }

  // graduation_campus_revenue_report
  static async graduationCampusRevenue(data) {
    try {
      const filtered = await models.sequelize.query(
        `
        select *
        from  universal_payments_mgt.graduation_campus_revenue_report('${data.payments_from}','${data.payments_to}')
          `,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `reportsChartOfAcounts.service.js`,
        `graduationRevenueReport`,
        `GET`
      );
    }
  }

  // graduation fees

  static async studentGraduationAllocation(data) {
    try {
      const filtered = await models.sequelize.query(
        `select 
count(distinct gfe.student_programme_id)as number_of_students,
count(gfe.student_programme_id) filter(
	where pt.unallocated_amount <100000) as students_less_100000,
count(distinct gfe.student_programme_id) filter(
	where pt.unallocated_amount >= 100000 and
	pt.unallocated_amount <=150000
) as students_100000_to_150000,
count(distinct gfe.student_programme_id) filter(
	where pt.unallocated_amount > 150000 and
	pt.unallocated_amount <=250000
) as students_greater_150000_to_250000,
count(distinct gfe.student_programme_id) filter(
	where pt.unallocated_amount > 250000
) as students_greater_250000,	
sum(pt.unallocated_amount) filter(
	where pt.unallocated_amount < 100000) as amount_less_100000,
sum(pt.unallocated_amount) filter
(where pt.unallocated_amount >= 100000 and 
pt.unallocated_amount <=150000) as amount_100000_to_15000,

sum(pt.unallocated_amount) filter
(where pt.unallocated_amount > 150000 and 
pt.unallocated_amount <=250000) as amount_greater_150000_to_250000,

sum(pt.unallocated_amount) filter
(where pt.unallocated_amount > 250000) as amount_greater_250000,
sum(pt.unallocated_amount) as total_amount
 
from results_mgt.graduation_fee_invoices  as gfe 
inner join enrollment_and_registration_mgt.payment_transactions as pt
on pt.student_programme_id = gfe.student_programme_id
and pt.amount > 0 
where pt.unallocated_amount > 0 and gfe.amount_due > 0 
and gfe.updated_at >= '${data.payments_from}'
and gfe.updated_at <= '${data.payments_to}'

          `,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `reportsChartOfAcounts.service.js`,
        `graduationRevenueReport`,
        `GET`
      );
    }
  }

  //  universal_payments_mgt.payment_revenue_report
  static async paymentRevenueReport(data) {
    try {
      const filtered = await models.sequelize.query(
        `
        select *
        from universal_payments_mgt.payment_revenue_report('${data.payments_from}','${data.payments_to}')       
          `,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `reportsChartOfAcounts.service.js`,
        `chartAccountApplicationReport`,
        `GET`
      );
    }
  }
}

module.exports = ReportsAccountService;
