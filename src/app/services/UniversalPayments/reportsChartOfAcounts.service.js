const models = require('@models');
const { QueryTypes } = require('sequelize');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

class ReportsChartOfAccountsService {
  // universal payments
  static async universalPay(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from universal_payments_mgt.accounts_payment_report('${data.payments_from}',
        '${data.payments_to}',${data.account_id})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `reportsChartOfAcounts.service.js`,
        `universalPay`,
        `GET`
      );
    }
  }

  // studentItemDetails
  static async studentItemDetails(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from universal_payments_mgt.student_account_details('${data.payments_from}',
        '${data.payments_to}',${data.account_id})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `reportsChartOfAcounts.service.js`,
        `studentItemDetails`,
        `GET`
      );
    }
  }

  //  universal_payments_mgt.(from_date date,
  static async allUniversalPay(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from universal_payments_mgt.all_accounts_payment_report('${data.payments_from}',
        '${data.payments_to}')`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `reportsChartOfAcounts.service.js`,
        `allUniversalPay`,
        `GET`
      );
    }
  }

  static async allStudentItemPayment(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from universal_payments_mgt.all_student_account_details('${data.payments_from}',
        '${data.payments_to}')`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `reportsChartOfAcounts.service.js`,
        `allStudentItemPayment`,
        `GET`
      );
    }
  }

  // chart of accounts

  static async chartAccountReport(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from universal_payments_mgt.chart_of_accounts_report('${data.payments_from}',
        '${data.payments_to}')`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `reportsChartOfAcounts.service.js`,
        `chartAccountReport`,
        `GET`
      );
    }
  }

  // accounts_students_report

  static async studentsAccountReport(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from universal_payments_mgt.accounts_students_report('${data.payments_from}',
        '${data.payments_to}')`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `reportsChartOfAcounts.service.js`,
        `studentsAccountReport`,
        `GET`
      );
    }
  }
  // chart of account application

  static async chartAccountApplicationReport(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from universal_payments_mgt.application_accounts_report('${data.payments_from}',
        '${data.payments_to}')`,
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

  // quarterly report
  static async quarterlyReports(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from universal_payments_mgt.quarterly_report()`,
        {
          type: QueryTypes.SELECT,
          plain: true,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `reportsChartOfAcounts.service.js`,
        `quarterlyReports`,
        `GET`
      );
    }
  }
  // financial year

  static async quarterlyFinancialYearUpper(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from universal_payments_mgt.quarterly_financial_year()`,
        {
          type: QueryTypes.SELECT,
          plain: true,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `reportsChartOfAcounts.service.js`,
        `quarterlyFinancialYearUpper`,
        `GET`
      );
    }
  }

  static async quarterlyFinancialYearLower(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from universal_payments_mgt.quarterly_financial_report()`,
        {
          type: QueryTypes.SELECT,
          plain: true,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `reportsChartOfAcounts.service.js`,
        `quarterlyFinancialYearLower`,
        `GET`
      );
    }
  }
  //  annually

  static async annualReports(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from universal_payments_mgt.annual_report()`,
        {
          type: QueryTypes.SELECT,
          plain: true,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `reportsChartOfAcounts.service.js`,
        `annualReports`,
        `GET`
      );
    }
  }

  //  fn_annual_report

  static async fnAnnualReports(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from universal_payments_mgt.fn_annual_report()`,
        {
          type: QueryTypes.SELECT,
          plain: true,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `reportsChartOfAcounts.service.js`,
        `fnAnnualReports`,
        `GET`
      );
    }
  }

  // fees deposits

  static async feesDepositsAccount(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from universal_payments_mgt.fees_deposits_account('${data.payments_from}',
        '${data.payments_to}')`,
        {
          type: QueryTypes.SELECT,
          plain: true,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `reportsChartOfAcounts.service.js`,
        `feesDepositsAccount`,
        `GET`
      );
    }
  }

  //  universal_payments_mgt.sponsor_account_report

  static async sponsorAccountReport(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from universal_payments_mgt.sponsor_account_report('${data.payments_from}',
        '${data.payments_to}')`,
        {
          type: QueryTypes.SELECT,
          plain: true,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `reportsChartOfAcounts.service.js`,
        `feesDepositsAccount`,
        `GET`
      );
    }
  }

  // universal_payments_mgt.sponsor_annual_report

  static async sponsorAnnualReport(data) {
    try {
      let filtered = [];

      if (Object.keys(data).length > 0) {
        const numberYear = parseInt(Object.values(data)[0], 10);

        filtered = await models.sequelize.query(
          `select * from universal_payments_mgt.sponsor_annual_report(${numberYear})`,
          {
            type: QueryTypes.SELECT,
          }
        );
      } else {
        filtered = await models.sequelize.query(
          `select * from universal_payments_mgt.sponsor_annual_report()`,
          {
            type: QueryTypes.SELECT,
          }
        );
      }

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `reportsChartOfAcounts.service.js`,
        `feesDepositsAccount`,
        `GET`
      );
    }
  }
  // universal_payments_mgt.sponsor_allocation_report(sponsor_transaction bigint )
  static async sponsorAllocationsReport(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from universal_payments_mgt.sponsor_allocation_report(${data.sponsorTransaction})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `reportsChartOfAcounts.service.js`,
        `feesDepositsAccount`,
        `GET`
      );
    }
  }
}

module.exports = ReportsChartOfAccountsService;
