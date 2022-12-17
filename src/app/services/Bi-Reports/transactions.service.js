const models = require('@models');
const { QueryTypes } = require('sequelize');

class TransactionsReportService {
  //
  static async transactionsReport(data) {
    try {
      const filtered = await models.sequelize.query(
        `
        select *
         from  universal_payments_mgt.academic_year_billing_report(${data.academic_year_id})
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

  // academic unit
  static async transactionsCollege(data) {
    try {
      const filtered = await models.sequelize.query(
        `
        select *
         from  universal_payments_mgt.ay_billing_unit_report(${data.academic_year_id})
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

  // faculty
  static async transactionsFaculty(data) {
    try {
      const filtered = await models.sequelize.query(
        `
        select *
         from  universal_payments_mgt.ay_billing_unit_report_faculty(${data.academic_year_id})
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

  // manual
  static async transactionsManualCollege(data) {
    try {
      const filtered = await models.sequelize.query(
        `
        select *
         from  universal_payments_mgt.ay_manual_billing_unit(${data.academic_year_id})
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

  static async transactionsManualFaculty(data) {
    try {
      const filtered = await models.sequelize.query(
        `
        select *
         from  universal_payments_mgt.ay_manual_billing_unit_faculty(${data.academic_year_id})
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

  // financial year report

  static async fyTuitionBilling(data) {
    try {
      const filtered = await models.sequelize.query(
        `
        select *
         from  universal_payments_mgt.fy_tuition_billing('${data.payments_from}','${data.payments_to}')
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

  // fy_student_payment_report

  static async fyStudentPaymentReport(data) {
    try {
      const filtered = await models.sequelize.query(
        `
        select *
         from  universal_payments_mgt.fy_student_payment_report('${data.payments_from}','${data.payments_to}')
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

  // fy_student_payment_report

  static async financialYearReport(data) {
    try {
      const filtered = await models.sequelize.query(
        `
        select *
         from  enrollment_and_registration_mgt.student_invoices_and_payments_function('${data.payments_from}','${data.payments_to}')
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

  static async previousFinancialYearReport(endData) {
    try {
      const filtered = await models.sequelize.query(
        `
        select *
         from  enrollment_and_registration_mgt.previous_student_invoices_and_payments_function('${endData}')
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

  static async progFinancialYearReport(data) {
    try {
      const filtered = await models.sequelize.query(
        `
        select *
         from  enrollment_and_registration_mgt.prog_student_invoices_and_payments_function('${data.payments_from}','${data.payments_to}',${data.programmeId})
          where programme_id = ${data.programmeId}`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async progPreviousFinancialYearReport(endData, programmeId) {
    try {
      const filtered = await models.sequelize.query(
        `
        select *
         from  enrollment_and_registration_mgt.prog_previous_student_invoices_and_payments_function('${endData}}', ${programmeId})
          where programme_id = ${programmeId}
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

  // fy_functional_billing

  static async fyFunctionalBilling(data) {
    try {
      const filtered = await models.sequelize.query(
        `
        select *
         from  universal_payments_mgt.fy_functional_billing('${data.payments_from}','${data.payments_to}')
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

  //  summary

  /**
   *
   *
   * summary reports
   */

  static async summaryTuitionBilling(data) {
    try {
      const filtered = await models.sequelize.query(
        `
        select 
        t.unit_id as unit_id, 
        t.academic_unit_code as academic_unit_code, 
        t.academic_unit_title as academic_unit_title, 
        t.invoice_amount as invoice_amount, 
        t.amount_paid as amount_paid, 
        t.amount_due as amount_due, 
        t.credit_note as credit_note, 
        t.exempted_amount as exempted_amount, 
        op.amount_due as tuition_opening_balance
         from  universal_payments_mgt.summary_tuition_billing('${data.payments_from}','${data.payments_to}') as t
         full outer join universal_payments_mgt.summary_tuition_billing('${data.openingBalDate}','${data.openingBalDateTo}') as op
         on t.academic_unit_code = op.academic_unit_code and 
         t.academic_unit_title = op.academic_unit_title
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

  static async summaryFunctionalBilling(data) {
    try {
      const filtered = await models.sequelize.query(
        `
        select 
         t.unit_id as unit_id, 
        t.academic_unit_code as academic_unit_code, 
        t.academic_unit_title as academic_unit_title, 
        t.invoice_amount as invoice_amount, 
        t.amount_paid as amount_paid, 
        t.amount_due as amount_due, 
        t.credit_note as credit_note, 
        t.exempted_amount as exempted_amount, 
        op.amount_due as functional_opening_balance

         from  universal_payments_mgt.summary_functional_billing('${data.payments_from}','${data.payments_to}') as t
        full outer join universal_payments_mgt.summary_functional_billing('${data.openingBalDate}','${data.openingBalDateTo}') as op
         on t.academic_unit_code = op.academic_unit_code and 
         t.academic_unit_title = op.academic_unit_title
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

  static async summaryOthersBilling(data) {
    try {
      const filtered = await models.sequelize.query(
        `
        select 
         t.unit_id as unit_id, 
        t.academic_unit_code as academic_unit_code, 
        t.academic_unit_title as academic_unit_title, 
        t.invoice_amount as invoice_amount, 
        t.amount_paid as amount_paid, 
        t.amount_due as amount_due, 
        t.credit_note as credit_note, 
        t.exempted_amount as exempted_amount, 
        op.amount_due as other_opening_balance

         from  universal_payments_mgt.summary_others_billing('${data.payments_from}','${data.payments_to}') as t
        full outer join universal_payments_mgt.summary_others_billing('${data.openingBalDate}','${data.openingBalDateTo}') as op
         on t.academic_unit_code = op.academic_unit_code and 
         t.academic_unit_title = op.academic_unit_title
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

  static async summaryManualBilling(data) {
    try {
      const filtered = await models.sequelize.query(
        `
        select 
        t.unit_id as unit_id, 
        t.academic_unit_code as academic_unit_code, 
        t.academic_unit_title as academic_unit_title, 
        t.invoice_amount as invoice_amount, 
        t.amount_paid as amount_paid, 
        t.amount_due as amount_due, 
        t.credit_note as credit_note, 
        t.exempted_amount as exempted_amount, 
        case when op.amount_due is null then 0::double precision else op.amount_due end as manual_opening_balance

        from  universal_payments_mgt.summary_manual_billing('${data.payments_from}','${data.payments_to}')as t
        full outer join universal_payments_mgt.summary_manual_billing('${data.openingBalDate}','${data.openingBalDateTo}') as op
         on t.academic_unit_code = op.academic_unit_code and 
         t.academic_unit_title = op.academic_unit_title
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

  // programme report

  static async programmeFyReport(data) {
    try {
      const filtered = await models.sequelize.query(
        `
        select 
        p.id as programme_id,
        p.programme_code as programme_code,
        p.programme_title as programme_title,
        coalesce(t.invoice_amount,0)as invoice_amount,
       coalesce( t.amount_paid,0)as amount_paid,
      coalesce ( t.amount_due,0) as amount_due,
       coalesce( t.credit_note,0) as credit_note,
      coalesce ( t.exempted_amount ,0)as exempted_amount,
      coalesce (tb.amount_due,0) as tuition_opening_balance,
        json_build_object(
            'invoice_amount',coalesce(f.invoice_amount,0),
            'amount_paid',coalesce(f.amount_paid,0),
            'amount_due',coalesce(f.amount_due,0),
            'credit_note',coalesce(f.credit_note,0),
            'exempted_amount',coalesce(f.exempted_amount,0),
            'functional_opening_balance',coalesce(fb.amount_due,0)
        ) as functional,

        json_build_object(
            'invoice_amount',coalesce(o.invoice_amount,0),
            'amount_paid',coalesce(o.amount_paid,0),
            'amount_due',coalesce(o.amount_due,0),
            'credit_note',coalesce(o.credit_note,0),
            'exempted_amount',coalesce(o.exempted_amount,0),
            'other_opening_balance',coalesce(ob.amount_due,0)
        ) as other_fees,

         json_build_object(
            'invoice_amount',coalesce(m.invoice_amount,0),
            'amount_paid',coalesce(m.amount_paid,0),
            'amount_due',coalesce(m.amount_due,0),
            'credit_note',coalesce(m.credit_note,0),
            'exempted_amount',coalesce(m.exempted_amount,0),
            'manual_opening_balance',coalesce(mb.amount_due,0)

        ) as manual_fees

         from programme_mgt.programmes as p
         left  join  universal_payments_mgt.fy_college_tuition_billing(${data.college_id},'${data.payments_from}','${data.payments_to}') as t
         on t.programme_code = p.programme_code
         and t.programme_title = p.programme_title
         left  join  universal_payments_mgt.fy_college_tuition_billing(${data.college_id},'${data.openingBalDate}','${data.openingBalDateTo}') as tb
         on tb.programme_code = p.programme_code
         and tb.programme_title = p.programme_title
         left join universal_payments_mgt.fy_college_function_billing(${data.college_id},'${data.payments_from}','${data.payments_to}') as f
         on p.programme_code = f.programme_code
         and p.programme_title = f.programme_title
         left join universal_payments_mgt.fy_college_function_billing(${data.college_id},'${data.openingBalDate}','${data.openingBalDateTo}') as fb
         on p.programme_code = fb.programme_code
         and p.programme_title = fb.programme_title
         left join universal_payments_mgt.fy_other_function_billing(${data.college_id},'${data.payments_from}','${data.payments_to}') as o
         on o.programme_code = p.programme_code
         and o.programme_title = p.programme_title
         left join universal_payments_mgt.fy_other_function_billing(${data.college_id},'${data.openingBalDate}','${data.openingBalDateTo}') as ob
         on ob.programme_code = p.programme_code
         and ob.programme_title = p.programme_title
         left join universal_payments_mgt.fy_manual_function_billing(${data.college_id},'${data.payments_from}','${data.payments_to}') as m
         on m.programme_code = p.programme_code
         and m.programme_title = p.programme_title
         left join universal_payments_mgt.fy_manual_function_billing(${data.college_id},'${data.openingBalDate}','${data.openingBalDateTo}') as mb
         on mb.programme_code = p.programme_code
         and mb.programme_title = p.programme_title
         
         left join programme_mgt.departments as pd
          on pd.id = p.department_id
          left join programme_mgt.faculties as pf
          on pf.id = pd.faculty_id
          where pf.college_id = ${data.college_id}

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

  // fy_summary_transactions

  static async fySummaryTransactions(data) {
    try {
      const filtered = await models.sequelize.query(
        `
        select *
         from universal_payments_mgt.fy_summary_transactions('${data.payments_from}','${data.payments_to}')

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

  // colleges

  static async universityColleges() {
    try {
      const filtered = await models.sequelize.query(
        `
        select id, college_code from programme_mgt.colleges

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

  static async universityFaculties() {
    try {
      const filtered = await models.sequelize.query(
        `
        select id, faculty_code from programme_mgt.faculties

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

  /// faculty

  static async programmeFyReportFaculty(data) {
    try {
      const filtered = await models.sequelize.query(
        `
        select 
        p.id as programme_id,
        p.programme_code as programme_code,
        p.programme_title as programme_title,
        coalesce(t.invoice_amount,0)as invoice_amount,
       coalesce( t.amount_paid,0)as amount_paid,
      coalesce ( t.amount_due,0) as amount_due,
       coalesce( t.credit_note,0) as credit_note,
      coalesce ( t.exempted_amount ,0)as exempted_amount,
        json_build_object(
            'invoice_amount',coalesce(f.invoice_amount,0),
            'amount_paid',coalesce(f.amount_paid,0),
            'amount_due',coalesce(f.amount_due,0),
            'credit_note',coalesce(f.credit_note,0),
            'exempted_amount',coalesce(f.exempted_amount,0)
        ) as functional,

        json_build_object(
            'invoice_amount',coalesce(o.invoice_amount,0),
            'amount_paid',coalesce(o.amount_paid,0),
            'amount_due',coalesce(o.amount_due,0),
            'credit_note',coalesce(o.credit_note,0),
            'exempted_amount',coalesce(o.exempted_amount,0)
        ) as other_fees,

         json_build_object(
            'invoice_amount',coalesce(m.invoice_amount,0),
            'amount_paid',coalesce(m.amount_paid,0),
            'amount_due',coalesce(m.amount_due,0),
            'credit_note',coalesce(m.credit_note,0),
            'exempted_amount',coalesce(m.exempted_amount,0)
        ) as manual_fees

         from programme_mgt.programmes as p
         left  join  universal_payments_mgt.fy_faculty_tuition_billing(${data.college_id},'${data.payments_from}','${data.payments_to}') as t
         on t.programme_code = p.programme_code
         and t.programme_title = p.programme_title
         left join universal_payments_mgt.fy_faculty_function_billing(${data.college_id},'${data.payments_from}','${data.payments_to}') as f
         on p.programme_code = f.programme_code
         and p.programme_title = f.programme_title
         left join universal_payments_mgt.fy_faculty_other_billing(${data.college_id},'${data.payments_from}','${data.payments_to}') as o
         on o.programme_code = p.programme_code
         and o.programme_title = p.programme_title
         left join universal_payments_mgt.fy_faculty_manual_billing(${data.college_id},'${data.payments_from}','${data.payments_to}') as m
         on m.programme_code = p.programme_code
         and m.programme_title = p.programme_title
         
         left join programme_mgt.departments as pd
          on pd.id = p.department_id
          left join programme_mgt.faculties as pf
          on pf.id = pd.faculty_id
          where pd.faculty_id = ${data.college_id}

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

  /**
   *
   *
   *
   *
   * student programme data
   *
   * financial year report
   *
   *
   *
   */

  static async programmeStudentFyReport(data) {
    try {
      const filtered = await models.sequelize.query(
        `
        select 
        p.student_number as student_number,
        p.registration_number as registration_number,
        std.surname as surname,
        std.other_names as other_names,
        std.gender as gender,
        std.email as email,
        std.nationality,
        mps.metadata_value as sponsorship,
        fw.fees_waiver_name as fees_waiver,
        sp.sponsor_name as sponsor_name,
        coalesce(t.invoice_amount,0)as invoice_amount,
       coalesce( t.amount_paid,0)as amount_paid,
      coalesce ( t.amount_due,0) as amount_due,
       coalesce( t.credit_note,0) as credit_note,
      coalesce ( t.exempted_amount ,0)as exempted_amount,
      coalesce (tb.amount_due,0) as tuition_opening_balance,
        json_build_object(
            'invoice_amount',coalesce(f.invoice_amount,0),
            'amount_paid',coalesce(f.amount_paid,0),
            'amount_due',coalesce(f.amount_due,0),
            'credit_note',coalesce(f.credit_note,0),
            'exempted_amount',coalesce(f.exempted_amount,0),
            'functional_opening_balance',coalesce(fb.amount_due,0)
        ) as functional,

        json_build_object(
            'invoice_amount',coalesce(o.invoice_amount,0),
            'amount_paid',coalesce(o.amount_paid,0),
            'amount_due',coalesce(o.amount_due,0),
            'credit_note',coalesce(o.credit_note,0),
            'exempted_amount',coalesce(o.exempted_amount,0),
            'other_opening_balance',coalesce(ob.amount_due,0)
        ) as other_fees,

         json_build_object(
            'invoice_amount',coalesce(m.invoice_amount,0),
            'amount_paid',coalesce(m.amount_paid,0),
            'amount_due',coalesce(m.amount_due,0),
            'credit_note',coalesce(m.credit_note,0),
            'exempted_amount',coalesce(m.exempted_amount,0),
            'manual_opening_balance',coalesce(mb.amount_due,0)

        ) as manual_fees

         from students_mgt.student_programmes  as p
         left join app_mgt.metadata_values as mps on p.sponsorship_id = mps.id
          left join fees_mgt.fees_waivers as fw  on fw.id = p.fees_waiver_id
          left join universal_payments_mgt.sponsor_students  as sps
          on sps.student_programme_id = p.id
          left join universal_payments_mgt.sponsors as sp
          on sp.id = sps.sponsor_id
          left join students_mgt.students as std
            on std.id = p.student_id


         left  join  universal_payments_mgt.std_tuition_billing_fn(${data.programme_id},'${data.payments_from}','${data.payments_to}') as t
         on t.student_number = p.student_number
         left  join  universal_payments_mgt.std_tuition_billing_fn(${data.programme_id},'${data.openingBalDate}','${data.openingBalDateTo}') as tb
         on tb.student_number = p.student_number
         left join universal_payments_mgt.std_functional_billing_fn(${data.programme_id},'${data.payments_from}','${data.payments_to}') as f
         on p.student_number = f.student_number
         left join universal_payments_mgt.std_functional_billing_fn(${data.programme_id},'${data.openingBalDate}','${data.openingBalDateTo}') as fb
         on p.student_number = fb.student_number
         left join universal_payments_mgt.std_other_billing_fn(${data.programme_id},'${data.payments_from}','${data.payments_to}') as o
         on o.student_number = p.student_number
         left join universal_payments_mgt.std_other_billing_fn(${data.programme_id},'${data.openingBalDate}','${data.openingBalDateTo}') as ob
         on ob.student_number = p.student_number
         left join universal_payments_mgt.std_manual_billing_fn(${data.programme_id},'${data.payments_from}','${data.payments_to}') as m
         on m.student_number = p.student_number
         left join universal_payments_mgt.std_manual_billing_fn(${data.programme_id},'${data.openingBalDate}','${data.openingBalDateTo}') as mb
         on mb.student_number = p.student_number
          where (p.programme_id =${data.programme_id} and t.invoice_amount > 0 ) OR
           (p.programme_id =${data.programme_id} and f.invoice_amount > 0  ) OR
            (p.programme_id =${data.programme_id} and o.invoice_amount > 0 ) OR
             (p.programme_id =${data.programme_id} and m.invoice_amount > 0 ) OR
             (p.programme_id =${data.programme_id} and tb.amount_due > 0 ) OR
             (p.programme_id =${data.programme_id} and fb.amount_due > 0 ) OR
             (p.programme_id =${data.programme_id} and ob.amount_due > 0 ) OR
             (p.programme_id =${data.programme_id} and mb.amount_due > 0 ) 
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

module.exports = TransactionsReportService;
