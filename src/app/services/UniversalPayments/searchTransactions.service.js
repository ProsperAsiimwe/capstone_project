const models = require('@models');
const { QueryTypes } = require('sequelize');
const {
  sequelizeErrorHandler,
  generalSlackBot,
} = require('@helpers/technicalErrorHelper');
const { regexFunction } = require('../helper/regexHelper');

class SearchTransactionsService {
  static async searchApplicantTransactions(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from universal_payments_mgt.search_application_transactions('${data.search_transaction}')`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `searchTransactions.service.js`,
        `searchApplicantTransactions`,
        `GET`
      );
    }
  }

  // search_universal_transactions.

  static async searchUniversalTransactions(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from universal_payments_mgt.search_universal_transactions('${data.search_transaction}')`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `searchTransactions.service.js`,
        `searchUniversalTransactions`,
        `GET`
      );
    }
  }

  //  search_bulk_transactions

  static async searchBulkTransactions(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from universal_payments_mgt.search_bulk_transactions('${data.search_transaction}')`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `searchTransactions.service.js`,
        `searchBulkTransactions`,
        `GET`
      );
    }
  }

  //  search_student_transactions

  static async searchStudentTransactions(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from universal_payments_mgt.search_student_transactions('${data.search_transaction}')`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `searchTransactions.service.js`,
        `searchStudentTransactions`,
        `GET`
      );
    }
  }

  // student ledger

  static async studentTuitionLedger(data, req) {
    try {
      await regexFunction(data);

      const filtered = await models.sequelize.query(
        `select * from universal_payments_mgt.student_ledger_tuition('${data.student_number}')
        where tuition_invoices::text <> '[]'::text or
        functional_fees_invoices::text <> '[]'::text or
        other_fees_invoices::text <> '[]'::text
        order by academic_year,semester
        `,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await generalSlackBot(
        req,
        `ERROR: ${error.message} FROM: *searchTransactions.service.js* on Function *studentLedgerManual* Method: *GET*`
      );
    }
  }

  // student_ledger_manual
  static async studentLedgerManual(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from universal_payments_mgt.student_ledger_manual('${data.student_number}')`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `searchTransactions.service.js`,
        `studentLedgerManual`,
        `GET`
      );
    }
  }

  // migrated payments student ledger

  static async migratedPaymentLedger(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from universal_payments_mgt.migrated_transactions_ledger('${data.student_number}')
        order by payment_date

        `,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `searchTransactions.service.js`,
        `migratedPaymentLedger`,
        `GET`
      );
    }
  }

  // universal_payments_mgt.student_prepayment_approval(programme bigint)

  static async studentPrepaymentApproval(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from universal_payments_mgt.student_prepayment_approval('${data.programmeId}')`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `searchTransactions.service.js`,
        `studentPrepaymentApproval`,
        `GET`
      );
    }
  }

  // findStudent

  static async findStudent(data) {
    try {
      await regexFunction(data);

      const filtered = await models.sequelize.query(
        `select student_id,
        student_programme_id,
        student_number,
        registration_number 
        from fees_mgt.fees_structure_student('${data.student}')`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `searchTransactions.service.js`,
        `findStudent`,
        `GET`
      );
    }
  }

  //
  static async findStudentCollege(data) {
    try {
      await regexFunction(data);

      const filtered = await models.sequelize.query(
        `select stp.student_id,stp.id as student_programme_id,
        stp.student_number,stp.registration_number,
        pp.programme_code,pp.programme_title,
        dp.department_title,dp.department_code,
        df.faculty_title,df.faculty_code,
        dc.college_code,dc.college_title,
        std.gender,std.avatar, std.surname, std.other_names

        from students_mgt.student_programmes as stp
        left join students_mgt.students as std
        on std.id = stp.student_id
        left join programme_mgt.programmes as pp
        on pp.id = stp.programme_id
        left join programme_mgt.departments as dp
        on dp.id = pp.department_id
        left join programme_mgt.faculties as df
        on df.id = dp.faculty_id
        left join programme_mgt.colleges as dc
        on dc.id = df.college_id
        where 
        stp.registration_number ='${data.student}'
        or  stp.student_number = '${data.student}'
        `,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `searchTransactions.service.js`,
        `findStudent`,
        `GET`
      );
    }
  }

  // student financial statement

  static async studentFinancialStatement(data, req) {
    try {
      await regexFunction(data);

      const filtered = await models.sequelize.query(
        `select * from universal_payments_mgt.std_tuition_ledger('${data.student_number}')
        union all  select * from universal_payments_mgt.std_other_ledger('${data.student_number}')
        union all  select * from universal_payments_mgt.std_transaction_ledger('${data.student_number}')
        union all  select * from universal_payments_mgt.std_graduation_ledger('${data.student_number}')
        order by time_stamp
        `,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await generalSlackBot(
        req,
        `ERROR: ${error.message} FROM: *searchTransactions.service.js* on Function *studentFinancialStatement* Method: *GET*`
      );
    }
  }

  // opening balance
  static async studentOpeningBalance(data, req) {
    try {
      await regexFunction(data);

      const filtered = await models.sequelize.query(
        `select 
            mer.id,
            stp. student_number,
            mer.total_due as tuition_total_due, 
            mer.is_billed as tuition_is_billed,
            mof.total_due as other_total_due,
            mof.id as other_id,
            mof.is_billed as other_is_billed

            from students_data.migrated_enrollments_records as mer
            left join students_data.migrated_enrollment_record_other_fees as mof
            on mof.migrated_record_id = mer.id
            left join students_mgt.student_programmes as stp
            on stp.id = mer.student_programme_id
            where mer.id = 64207  and (mer.is_billed = false or mof.is_billed = false)
            and (mer.total_due > 0 or mof.total_due > 0 ) and
            ( stp.student_number = '${data.student_number} 'or 
                stp.registration_number = '${data.student_number} 'or mer.student_programme_id =${data.student_programme_id}) 
        `,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await generalSlackBot(
        req,
        `ERROR: ${error.message} FROM: *searchTransactions.service.js* on Function *studentFinancialStatement* Method: *GET*`
      );
    }
  }

  // its data

  static async itsFinancialStatement(data, req) {
    try {
      await regexFunction(data);

      const filtered = await models.sequelize.query(
        `select * from its_data.its_data_ledger('${data.student}');`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await generalSlackBot(
        req,
        `ERROR: ${error.message} FROM: *searchTransactions.service.js* on Function *itsFinancialStatement* Method: *GET*`
      );
    }
  }
}

module.exports = SearchTransactionsService;
