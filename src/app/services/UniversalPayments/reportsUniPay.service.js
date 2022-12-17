const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

/* universal_payments_mgt.date_report(from_date date,
        to_date date
        */
const models = require('@models');
const { QueryTypes } = require('sequelize');

class ReportsUniPayService {
  //  daily
  static async dailyReport(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from universal_payments_mgt.daily_report()`,
        {
          type: QueryTypes.SELECT,
          plain: true,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `reportsUniPay.service.js`,
        `dailyReport`,
        `GET`
      );
    }
  }

  // weekly
  static async weeklyReport(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from universal_payments_mgt.weekly_report()`,
        {
          type: QueryTypes.SELECT,
          plain: true,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `reportsUniPay.service.js`,
        `weeklyReport`,
        `GET`
      );
    }
  }

  // monthly
  static async monthlyReports(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from universal_payments_mgt.monthly_report()`,
        {
          type: QueryTypes.SELECT,
          plain: true,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `reportsUniPay.service.js`,
        `monthlyReports`,
        `GET`
      );
    }
  }

  // summary_bulky_payments
  static async universalPaymentSummary(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from universal_payments_mgt.summary_bulky_payments('${data.payments_from}','${data.payments_to}')`,
        {
          type: QueryTypes.SELECT,
          plain: true,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `reportsUniPay.service.js`,
        `universalPaymentSummary`,
        `GET`
      );
    }
  }

  static async universalPaymentsDetailed(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from universal_payments_mgt.date_report('${data.payments_from}','${data.payments_to}')`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `reportsUniPay.service.js`,
        `universalPaymentsDetailed`,
        `GET`
      );
    }
  }

  // applicant payments detailed

  static async applicantPaymentsReport(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from universal_payments_mgt.date_report_applicants('${data.payments_from}','${data.payments_to}')`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `reportsUniPay.service.js`,
        `applicantPaymentsReport`,
        `GET`
      );
    }
  }

  // summary applicant

  static async applicantPaymentsSummary(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from universal_payments_mgt.summary_applicants_payments('${data.payments_from}','${data.payments_to}')`,
        {
          type: QueryTypes.SELECT,
          plain: true,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `reportsUniPay.service.js`,
        `applicantPaymentsSummary`,
        `GET`
      );
    }
  }

  // bulk payments

  static async bulkPaymentsReport(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from universal_payments_mgt.date_report_bulk('${data.payments_from}','${data.payments_to}')`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `reportsUniPay.service.js`,
        `bulkPaymentsReport`,
        `GET`
      );
    }
  }

  //  bulky payment

  static async bulkPaymentsSummary(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from universal_payments_mgt.summary_bulk_payments('${data.payments_from}','${data.payments_to}')`,
        {
          type: QueryTypes.SELECT,
          plain: true,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `reportsUniPay.service.js`,
        `bulkPaymentsSummary`,
        `GET`
      );
    }
  }

  // students transactions

  static async studentsPaymentsReport(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from universal_payments_mgt.date_report_students('${data.payments_from}','${data.payments_to}')`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `reportsUniPay.service.js`,
        `studentsPaymentsReport`,
        `GET`
      );
    }
  }

  //

  static async studentsPaymentsSummary(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from universal_payments_mgt.summary_students_payments('${data.payments_from}','${data.payments_to}')`,
        {
          type: QueryTypes.SELECT,
          plain: true,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `reportsUniPay.service.js`,
        `studentsPaymentsSummary`,
        `GET`
      );
    }
  }

  // payments by bank
  static async bankStudentPaymentsReport(data) {
    try {
      const filtered = await models.sequelize.query(
        `select
        bank,
        sum(students)::double precision as students,
        sum(total_amount)::double precision as total_amount
        from universal_payments_mgt.bank_payments_report('${data.payments_from}','${data.payments_to}')
        group by bank`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `reportsUniPay.service.js`,
        `bankStudentPaymentsReport`,
        `GET`
      );
    }
  }

  // bank
  static async bankUniversalPaymentsReport(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from universal_payments_mgt.bank_universal_payments_report('${data.payments_from}','${data.payments_to}')`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `reportsUniPay.service.js`,
        `bankUniversalPaymentsReport`,
        `GET`
      );
    }
  }

  // bank_application_payments
  static async bankApplicantPaymentsReport(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from universal_payments_mgt.bank_application_payments('${data.payments_from}','${data.payments_to}')`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `reportsUniPay.service.js`,
        `bankApplicantPaymentsReport`,
        `GET`
      );
    }
  }

  // bank_bulky_payments
  static async bankBulkyPaymentsReport(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from universal_payments_mgt.bank_bulky_payments('${data.payments_from}','${data.payments_to}')`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `reportsUniPay.service.js`,
        `bankBulkyPaymentsReport`,
        `GET`
      );
    }
  }

  //   universal_payments_mgt.faculty_date_report
  static async facultyDatePaymentsReport(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from universal_payments_mgt.faculty_date_report('${data.payments_from}','${data.payments_to}')`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `reportsUniPay.service.js`,
        `facultyDatePaymentsReport`,
        `GET`
      );
    }
  }

  static async collegeDatePaymentsReport(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from universal_payments_mgt.college_date_report('${data.payments_from}','${data.payments_to}')`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `reportsUniPay.service.js`,
        `collegeDatePaymentsReport`,
        `GET`
      );
    }
  }

  // faculty_functional_date_report
  static async facultyFunctionalPayments(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from universal_payments_mgt.faculty_functional_date_report('${data.payments_from}','${data.payments_to}')`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `reportsUniPay.service.js`,
        `facultyFunctionalPayments`,
        `GET`
      );
    }
  }

  static async collegeFunctionalPayments(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from universal_payments_mgt.college_functional_date_report('${data.payments_from}','${data.payments_to}')`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `reportsUniPay.service.js`,
        `collegeFunctionalPayments`,
        `GET`
      );
    }
  }

  // college_other_date_report

  static async collegeOtherPayments(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from universal_payments_mgt.college_other_date_report('${data.payments_from}','${data.payments_to}')`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `reportsUniPay.service.js`,
        `collegeOtherPayments`,
        `GET`
      );
    }
  }

  static async facultyOtherPayments(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from universal_payments_mgt.faculty_other_date_report('${data.payments_from}','${data.payments_to}')`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `reportsUniPay.service.js`,
        `facultyOtherPayments`,
        `GET`
      );
    }
  }

  // college_manual_date_report

  static async collegeManualPayments(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from universal_payments_mgt.college_manual_date_report('${data.payments_from}','${data.payments_to}')`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `reportsUniPay.service.js`,
        `collegeManualPayments`,
        `GET`
      );
    }
  }

  static async facultyManualPayments(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from universal_payments_mgt.faculty_manual_date_report('${data.payments_from}','${data.payments_to}')`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `reportsUniPay.service.js`,
        `facultyManualPayments`,
        `GET`
      );
    }
  }
}

module.exports = ReportsUniPayService;
