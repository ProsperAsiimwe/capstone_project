// assignmentsByLecturerFunction
const { HttpResponse } = require('@helpers');
const { uniPaymentReportService } = require('@services/index');
const http = new HttpResponse();

class UniPayReportsController {
  async reportsFunction(req, res) {
    try {
      let data = {};

      const uniPaySummaryReport =
        await uniPaymentReportService.reportsFunction();
      const universalPayReport =
        await uniPaymentReportService.DetailedReportsFunction();
      const uniPayReport = await uniPaymentReportService.uniPayReportFunction();
      const studentTransactionReport =
        await uniPaymentReportService.studentReportFunction();
      // applicantsReportFunction
      const applicantsTransactionReport =
        await uniPaymentReportService.applicantsReportFunction();

      // bulk_payment_report
      const bulkPaymentsReport =
        await uniPaymentReportService.bulkPaymentsReport();

      const studentTransactions = await groupByProgramme(
        studentTransactionReport
      );

      const studentReport = await groupByCampus(studentTransactions);

      const applicantsTransactions = await groupByAdmissionScheme(
        applicantsTransactionReport
      );

      const merged = uniPayReport.reduce(
        (groupedData, { billing_year, billing_month, ...rest }) => {
          const key = `${billing_year}-${billing_month}`;

          groupedData[key] = groupedData[key] || {
            billing_year,
            billing_month,
            data: [],
          };

          if (rest.full_name) {
            groupedData[key].data.push(rest);
          }

          return groupedData;
        },
        {}
      );

      const uniPayDetailedReport = Object.values(merged);

      if (uniPaySummaryReport === null) {
        data = {
          uniPaySummaryReport: {},
          universalPayments: uniPayDetailedReport,
          studentsTransactions: studentReport,
          applicantsTransactions: applicantsTransactions,
          bulkPayments: bulkPaymentsReport,
        };
      } else {
        data = {
          uniPaySummaryReport,
          universalPayments: uniPayDetailedReport,
          studentsTransactions: studentReport,
          applicantsTransactions: applicantsTransactions,
          bulkPayments: bulkPaymentsReport,
        };
      }

      http.setSuccess(200, 'Universal Payment Reports  fetched successfully', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Universal Payment Reports', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

// group by programme

const groupByProgramme = (data) => {
  try {
    const merged = data.reduce(
      (
        groupedData,
        {
          academic_year,
          semester,
          campus,
          programme_title,
          programme_code,
          ...rest
        }
      ) => {
        const key = `${academic_year}-${semester}-${programme_code}`;

        groupedData[key] = groupedData[key] || {
          academic_year,
          semester,
          campus,
          programme_title,
          programme_code,
          students: [],
        };

        if (rest.student_number) {
          groupedData[key].students.push(rest);
        }

        return groupedData;
      },
      {}
    );

    return Object.values(merged);
  } catch (error) {}
};

// group by campus
const groupByCampus = (data) => {
  try {
    const merged = data.reduce(
      (groupedData, { academic_year, semester, campus, ...rest }) => {
        const key = `${academic_year}-${semester}`;

        groupedData[key] = groupedData[key] || {
          academic_year,
          semester,
          campus,
          programmes: [],
        };

        if (rest.programme_code) {
          groupedData[key].programmes.push(rest);
        }

        return groupedData;
      },
      {}
    );

    return Object.values(merged);
  } catch (error) {}
};

// group by admission scheme
const groupByAdmissionScheme = (data) => {
  try {
    const merged = data.reduce(
      (groupedData, { admission_scheme_id, scheme_name, ...rest }) => {
        const key = `${admission_scheme_id}-${scheme_name}`;

        groupedData[key] = groupedData[key] || {
          scheme_name,
          applicants: [],
        };

        if (rest.applicant_id) {
          groupedData[key].applicants.push(rest);
        }

        return groupedData;
      },
      {}
    );

    return Object.values(merged);
  } catch (error) {}
};

module.exports = UniPayReportsController;
