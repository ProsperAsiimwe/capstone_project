/* eslint-disable camelcase */
//   summaryPaymentReportService,
const { HttpResponse } = require('@helpers');
const {
  summaryPaymentReportService,
  institutionStructureService,
} = require('@services/index');
const { sumBy, isEmpty, toUpper } = require('lodash');

const http = new HttpResponse();

class SummaryPaymentsCampusController {
  //  SummaryPaymentReport
  async paymentCampusReport(req, res) {
    try {
      if (
        !req.query.academic_year_id ||
        !req.query.intake_id ||
        !req.query.semester_id
      ) {
        throw new Error('Invalid Context Provided');
      }
      let result = [];

      const context = req.query;

      const institutionStructure =
        await institutionStructureService.findInstitutionStructureRecords();

      const institutionStructureUpper = institutionStructure.academic_units.map(
        (e) => toUpper(e)
      );

      if (
        institutionStructure &&
        institutionStructureUpper
          .map((element) => element.includes('COL'))
          .includes(true)
      ) {
        result = await summaryPaymentReportService.campusPaymentReportsCollege(
          context
        );

        result.forEach((element) => {
          const totalPaid =
            element.tuition_amount_paid +
            element.functional_fees_amount_paid +
            element.other_fees_amount_paid;
          const totalBilled =
            element.tuition_invoice_amount +
            element.functional_fees_invoice_amount +
            element.other_fees_invoice_amount;
          const totalDue =
            element.tuition_amount_due +
            element.functional_fees_amount_due +
            element.other_fees_amount_due;

          element.totalPaid = totalPaid;
          element.totalBilled = totalBilled;
          element.totalDue = totalDue;
        });
      } else if (
        institutionStructure &&
        (institutionStructureUpper
          .map((element) => element.includes('FAC'))
          .includes(true) ||
          institutionStructureUpper
            .map((element) => element.includes('SCH'))
            .includes(true))
      ) {
        result = await summaryPaymentReportService.campusPaymentReportsFaculty(
          context
        );

        result.forEach((element) => {
          const totalPaid =
            element.tuition_amount_paid +
            element.functional_fees_amount_paid +
            element.other_fees_amount_paid;
          const totalBilled =
            element.tuition_invoice_amount +
            element.functional_fees_invoice_amount +
            element.other_fees_invoice_amount;
          const totalDue =
            element.tuition_amount_due +
            element.functional_fees_amount_due +
            element.other_fees_amount_due;

          element.totalPaid = totalPaid;
          element.totalBilled = totalBilled;
          element.totalDue = totalDue;
        });
      } else {
        throw new Error('Invalid Context Provided');
      }
      const filtered = generateReport(result);

      const groupedData = groupByProgramme(result);

      const resultData = groupByCampus(groupedData);

      const data = { filtered, resultData };

      http.setSuccess(200, 'Report fetched successfully', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Report', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

const generateReport = function (data) {
  try {
    const payments = data;

    let totalPaid = '';

    let totalBilled = '';

    let totalDue = '';

    let campus = [];

    if (isEmpty(payments)) {
      totalPaid = 0;
      totalBilled = 0;
      totalDue = 0;
    } else {
      campus = [
        ...payments
          .reduce((r, o) => {
            const key = o.campus;

            const item =
              r.get(key) ||
              Object.assign({}, o, {
                tuition_amount_paid: 0,
                tuition_invoice_amount: 0,
                tuition_amount_due: 0,
              });

            item.tuition_amount_paid += Number(o.tuition_amount_paid);

            item.tuition_invoice_amount += Number(o.tuition_invoice_amount);

            item.tuition_amount_due += Number(o.tuition_amount_due);

            return r.set(key, item);
          }, new Map())
          .values(),
      ];
    }
    totalPaid = sumBy(payments, (item) => Number(item.totalPaid));
    totalBilled = sumBy(payments, (item) => Number(item.totalBilled));
    totalDue = sumBy(payments, (item) => Number(item.totalDue));

    return {
      totalPaid,
      totalBilled,
      totalDue,
      campus,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

//  grouping data by programme

const groupByProgramme = (data) => {
  try {
    const merged = data.reduce(
      (
        groupedData,
        { campus, academic_unit_code, academic_unit_title, ...rest }
      ) => {
        const key = `${campus}-${academic_unit_code}`;

        groupedData[key] = groupedData[key] || {
          campus,
          academic_unit_code,
          academic_unit_title,
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

// by campus grouping

const groupByCampus = (data) => {
  try {
    const merged = data.reduce((groupedData, { campus, ...rest }) => {
      const key = `${campus}`;

      groupedData[key] = groupedData[key] || {
        campus,
        unit: [],
      };

      if (rest.academic_unit_code) {
        groupedData[key].unit.push(rest);
      }

      return groupedData;
    }, {});

    return Object.values(merged);
  } catch (error) {}
};

module.exports = SummaryPaymentsCampusController;
