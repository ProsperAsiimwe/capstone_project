// assignmentsByLecturerFunction
const { HttpResponse } = require('@helpers');
const {
  reportsChartOfAccountService,
  reportsAccountService,
} = require('@services');

const http = new HttpResponse();
const { sumBy, isEmpty, map, uniq } = require('lodash');
const {
  summaryChartOfAccountReport,
  accountReportByBillingDate,
} = require('../Helpers/reportsHelper');

const { revenuePerItemReport } = require('../Helpers/reportsHelper2');
const { sponsorAnnualReport } = require('../Helpers/reportBiHelper');

class ReportsAccountController {
  async accountReportFunction(req, res) {
    const context = req.query;

    try {
      if (
        !context.payments_from ||
        !context.payments_to ||
        !context.account_id
      ) {
        throw new Error('Invalid Context Provided');
      }

      if (context.payments_from > context.payments_to) {
        throw new Error(
          `Invalid Context Provided, 'PAYMENT FROM DATE' SHOULD BE LESS OR EQUAL  TO 'PAYMENT TO DATE'`
        );
      }

      let data = {};

      const uniPay = await reportsChartOfAccountService.universalPay(context);

      const studentDetail =
        await reportsChartOfAccountService.studentItemDetails(context);

      const result = [...studentDetail, ...uniPay];

      if (isEmpty(result)) {
        data = { totalAmount: 0, payers: 0, result: [] };
      } else {
        const totalAmount = sumBy(result, 'receivable_amount');

        const payers = uniq(map(result, 'email')).length;

        data = { totalAmount, payers, result };
      }

      http.setSuccess(200, `Payment Transactions fetched successfully`, {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, `Unable To Fetch  Payment Transactions`, {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  //  chartAccountReport

  async chartAccountReportFunction(req, res) {
    try {
      const context = req.query;

      const data = await summaryChartOfAccountReport(context);

      http.setSuccess(200, `Payment Transactions fetched successfully`, {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, `Unable To Fetch  Payment Transactions`, {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  // accountReportByBillingDate
  async accountReportByBillingDate(req, res) {
    try {
      const context = req.query;

      const data = await accountReportByBillingDate(context);

      http.setSuccess(200, `Account Reports fetched successfully`, {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, `Unable To Fetch  Account Report`, {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  //  student payment tracker

  async studentAccountPayment(req, res) {
    try {
      const context = req.query;

      const data = await reportsChartOfAccountService.studentsAccountReport(
        context
      );

      http.setSuccess(200, `Payment Transactions fetched successfully`, {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, `Unable To Fetch  Payment Transactions`, {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  // quarterly and annually  report

  async quarterlyAndAnnuallyReport(req, res) {
    const context = req.query;

    try {
      if (!context.duration) {
        throw new Error('Invalid Context Provided');
      }
      let data = {};

      const date = new Date();

      const currentYear = date.getFullYear();

      if (context.duration === 'quarterly') {
        const result = await reportsChartOfAccountService.quarterlyReports(
          context
        );

        Object.keys(result).forEach(function (key) {
          if (result[key] === null) {
            result[key] = 0;
          }
        });

        const q1 =
          result.students_q1 +
          result.uni_pay_q1 +
          result.applicants_q1 +
          result.bulk_payments_q1;

        const q2 =
          result.students_q2 +
          result.uni_pay_q2 +
          result.applicants_q2 +
          result.bulk_payments_q2;

        const q3 =
          result.students_q3 +
          result.uni_pay_q3 +
          result.applicants_q3 +
          result.bulk_payments_q3;

        const q4 =
          result.students_q4 +
          result.uni_pay_q4 +
          result.applicants_q4 +
          result.bulk_payments_q4;

        const firstQ = {
          total: q1,
          students: result.students_q1,
          uniPay: result.uni_pay_q1,
          applicants: result.applicants_q1,
          bulkPayments: result.bulk_payments_q1,
        };

        const secondQ = {
          total: q2,
          students: result.students_q2,
          uniPay: result.uni_pay_q2,
          applicants: result.applicants_q2,
          bulkPayments: result.bulk_payments_q2,
        };

        const thirdQ = {
          total: q3,
          students: result.students_q3,
          uniPay: result.uni_pay_q3,
          applicants: result.applicants_q3,
          bulkPayments: result.bulk_payments_q4,
        };

        const forthQ = {
          total: q4,
          students: result.students_q4,
          uniPay: result.uni_pay_q4,
          applicants: result.applicants_q4,
          bulkPayments: result.bulk_payments_q4,
        };

        // data = {
        //   first_q1,
        //   second_q2,
        //   third_q3,
        //   forth_q4,
        // result,
        // q1,
        // q2,
        // q3,
        // q4,
        // };

        data = [
          {
            transactionYear: currentYear,
            quarter: 'First Quarter',
            from_month: '01-JANUARY',
            to_month: '31-MARCH',
            ...firstQ,
          },
          {
            transactionYear: currentYear,
            quarter: 'Second Quarter',
            from_month: '01-APRIL',
            to_month: '30-JUNE',
            ...secondQ,
          },
          {
            transactionYear: currentYear,
            quarter: 'Third Quarter',
            from_month: '01-JULY',
            to_month: '30-SEPTEMBER',
            ...thirdQ,
          },
          {
            transactionYear: currentYear,
            quarter: 'Fourth Quarter',
            from_month: '01-OCTOBER',
            to_month: '31-DECEMBER',
            ...forthQ,
          },
        ];
      } else if (context.duration === 'annual') {
        const result = await reportsChartOfAccountService.annualReports(
          context
        );

        Object.keys(result).forEach(function (key) {
          if (result[key] === null) {
            result[key] = 0;
          }
        });

        const total =
          result.student_transactions +
          result.universal_payments +
          result.applicants +
          result.bulk_payments;

        data = { ...result, total };
      } else if (context.duration === 'fn-annual') {
        const result = await reportsChartOfAccountService.fnAnnualReports(
          context
        );

        Object.keys(result).forEach(function (key) {
          if (result[key] === null) {
            result[key] = 0;
          }
        });

        const total =
          result.student_transactions +
          result.universal_payments +
          result.applicants +
          result.bulk_payments;

        data = { ...result, total };
      }

      http.setSuccess(
        200,
        `${context.duration} Payment Transaction REPORT PAYMENTS fetched successfully`,
        {
          data,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        `Unable To Fetch  ${context.duration} Payment Transaction REPORT`,
        {
          error: { message: error.message },
        }
      );

      return http.send(res);
    }
  }

  // financial year report

  async quarterlyFinancialReport(req, res) {
    const context = req.query;

    try {
      const date = new Date();

      const currentMonth = date.getMonth();

      let data = {};

      let result = [];

      if (currentMonth >= 6) {
        result = await reportsChartOfAccountService.quarterlyFinancialYearUpper(
          context
        );
      } else {
        result = await reportsChartOfAccountService.quarterlyFinancialYearLower(
          context
        );
      }

      Object.keys(result).forEach(function (key) {
        if (result[key] === null) {
          result[key] = 0;
        }
      });

      const q1 =
        result.students_q1 +
        result.uni_pay_q1 +
        result.applicants_q1 +
        result.bulk_payments_q1;

      const q2 =
        result.students_q2 +
        result.uni_pay_q2 +
        result.applicants_q2 +
        result.bulk_payments_q2;

      const q3 =
        result.students_q3 +
        result.uni_pay_q3 +
        result.applicants_q3 +
        result.bulk_payments_q3;

      const q4 =
        result.students_q4 +
        result.uni_pay_q4 +
        result.applicants_q4 +
        result.bulk_payments_q4;

      const firstQ = {
        total: q1,
        students: result.students_q1,
        uniPay: result.uni_pay_q1,
        applicants: result.applicants_q1,
        bulkPayments: result.bulk_payments_q1,
      };

      const secondQ = {
        total: q2,
        students: result.students_q2,
        uniPay: result.uni_pay_q2,
        applicants: result.applicants_q2,
        bulkPayments: result.bulk_payments_q2,
      };

      const thirdQ = {
        total: q3,
        students: result.students_q3,
        uniPay: result.uni_pay_q3,
        applicants: result.applicants_q3,
        bulkPayments: result.bulk_payments_q4,
      };

      const forthQ = {
        total: q4,
        students: result.students_q4,
        uniPay: result.uni_pay_q4,
        applicants: result.applicants_q4,
        bulkPayments: result.bulk_payments_q4,
      };

      data = [
        {
          quarter: 'First Quarter',
          from_month: '01-JULY',
          to_month: '30-SEPTEMBER',
          ...firstQ,
        },
        {
          quarter: 'Second Quarter',
          from_month: '01-OCTOBER',
          to_month: '31-DECEMBER',
          ...secondQ,
        },
        {
          quarter: 'Third Quarter',
          from_month: '01-JANUARY',
          to_month: '31-MARCH',
          ...thirdQ,
        },
        {
          quarter: 'Fourth Quarter',
          from_month: '01-APRIL',
          to_month: '30-JUNE',
          ...forthQ,
        },
      ];

      http.setSuccess(200, `Financial Year Report fetched successfully`, {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, `Unable To Fetch Financial Year Report `, {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  // sponsor annual report

  async sponsorAnnualReportFunction(req, res) {
    try {
      const context = req.query;

      const data = await sponsorAnnualReport(context);

      http.setSuccess(200, `Sponsor Payments fetched successfully`, {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, `Unable To Fetch  Payment Transactions`, {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  // sponsorAllocationsReport

  async sponsorAllocationsReport(req, res) {
    try {
      const context = req.query;

      if (!context.sponsorTransaction) {
        throw new Error('Invalid Request');
      }

      const data = await reportsChartOfAccountService.sponsorAllocationsReport(
        context
      );

      http.setSuccess(200, `Sponsor Payments fetched successfully`, {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, `Unable To Fetch  Payment Transactions`, {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  // revenuePerItemReport

  async revenuePerItemReport(req, res) {
    try {
      const context = req.query;

      const data = await revenuePerItemReport(context);

      http.setSuccess(200, `Report Generated successfully`, {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, `Unable To Generate Report`, {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  // graduationRevenueReport
  async globalPaymentRevenueReport(req, res) {
    try {
      const context = req.query;

      if (!context.payments_from || !context.payments_to) {
        throw new Error('Invalid Request');
      }

      const graduationInvoicePayments =
        await reportsAccountService.graduationRevenueReport(context);
      // const campusData = await reportsAccountService.graduationCampusRevenue(
      //   context
      // );
      const stdPayments =
        await reportsAccountService.studentGraduationAllocation(context);

      const uniPay = await reportsAccountService.uniPayItemReport2(context);

      const applications =
        await reportsAccountService.chartAccountApplicationReport(context);
      const changeProgramme =
        await reportsAccountService.chartAccountChangeProgramme(context);

      graduationInvoicePayments.forEach((e) => {
        e.amount = e.amount_paid;
      });

      const graduationItems = graduationInvoicePayments.map((e) => ({
        fees_element_code: e.fees_element_code,
        fees_element_name: e.fees_element_name,
        amount: e.amount,
      }));

      const combineReport = [
        ...uniPay,
        ...applications,
        ...changeProgramme,
        ...graduationItems,
      ];

      const result = {
        note: `Report Generated : APPLICATION/ADMISSION FEES, GRADUATION FEES,UNIVERSAL PAYMENTS and CHANGE OF PROGRAMME`,
        note2: `Enrollments invoices and manual invoices  fees items are not captured in this report. Kindly check the STUDENT REVENUE REPORT`,
        graduationUnallocated: stdPayments[0],
        graduationInvoicePayments,
        uniPay,
        applications,
        changeProgramme,
        combineReport,
      };

      http.setSuccess(200, `Report Generated successfully`, {
        result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, `Unable To Generate Report`, {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

module.exports = ReportsAccountController;
