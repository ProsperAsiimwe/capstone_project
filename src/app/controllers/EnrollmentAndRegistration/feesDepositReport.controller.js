/* eslint-disable camelcase */

const { HttpResponse } = require('@helpers');
const {
  summaryPaymentReportService,
  metadataValueService,
  programmeService,
  institutionStructureService,
} = require('@services/index');
const { sumBy, isEmpty, toUpper, map, upperCase, now } = require('lodash');

const excelJs = require('exceljs');
const fs = require('fs');
const { feesDepositsColumns } = require('./templateTransactions');

const http = new HttpResponse();

class FeesDepositsReportsController {
  //  feesDepositsReports
  async feesDepositsReports(req, res) {
    try {
      if (
        !req.query.campus_id ||
        !req.query.intake_id ||
        !req.query.from_date ||
        !req.query.to_date
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

      let data = {};

      if (
        institutionStructure &&
        institutionStructureUpper
          .map((element) => element.includes('COL'))
          .includes(true)
      ) {
        result = await summaryPaymentReportService.feesDepositsFacultyReport(
          context
        );

        const filtered = generateReport(result);

        const groupedData = groupByProgramme(result);

        data = { filtered, groupedData, result };
      } else if (
        institutionStructure &&
        (institutionStructureUpper
          .map((element) => element.includes('FAC'))
          .includes(true) ||
          institutionStructureUpper
            .map((element) => element.includes('SCH'))
            .includes(true))
      ) {
        result = await summaryPaymentReportService.feesDepositsFacultyReport(
          context
        );
      } else {
        throw new Error('Invalid Context Provided');
      }
      const filtered = generateReport(result);

      const groupedData = groupByProgramme(result);

      data = { filtered, groupedData };

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

  // feesDepositsProgrammeReport

  async feesDepositsProgrammeReport(req, res) {
    try {
      if (
        !req.query.campus_id ||
        !req.query.intake_id ||
        !req.query.programme_id ||
        !req.query.from_date ||
        !req.query.to_date
      ) {
        throw new Error('Invalid Context Provided');
      }

      const context = req.query;

      const result =
        await summaryPaymentReportService.feesDepositsProgrammeReport(context);

      const amountDeposited = sumBy(result, (item) => Number(item.amount));
      const allocatedAmount = sumBy(result, (item) =>
        Number(item.allocated_amount)
      );
      const unallocatedAmount = sumBy(result, (item) =>
        Number(item.unallocated_amount)
      );

      const data = {
        amountDeposited,
        allocatedAmount,
        unallocatedAmount,
        result,
      };

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

  //  Download Fees Deposits

  async downloadFeesDeposits(req, res) {
    try {
      if (
        !req.body.campus_id ||
        !req.body.intake_id ||
        !req.body.programme_id ||
        !req.body.from_date ||
        !req.body.to_date
      ) {
        throw new Error('Invalid Context Provided');
      }

      const { user } = req;

      const context = req.body;

      const data =
        await summaryPaymentReportService.feesDepositsProgrammeReport(context);
      //  data

      if (isEmpty(data)) {
        throw new Error('No Fees Deposits');
      }

      // find campus
      let campus = '';

      if (req.body.campus_id === 'all') {
        campus = 'ALL CAMPUSES';
      } else {
        const id = req.body.campus_id;

        const metadata = await metadataValueService.findOneMetadataValue({
          where: { id },
        });

        campus = metadata.dataValues.metadata_value;
      }

      let academicUnits = [];

      const institutionStructure =
        await institutionStructureService.findInstitutionStructureRecords({
          attributes: [
            'institution_name',
            'institution_logo',
            'academic_units',
          ],
        });

      if (!institutionStructure) {
        throw new Error('Unable To Find Institution Structure.');
      }

      if (institutionStructure) {
        academicUnits = map(institutionStructure.academic_units, (unit) =>
          toUpper(unit)
        );
      }

      let programmeData = {};

      let academicUnitData = {};

      let structure = '';

      if (
        academicUnits.includes('COLLEGES') ||
        academicUnits.map((element) => element.includes('COL')).includes(true)
      ) {
        structure = 'COLLEGE';
        programmeData = await programmeService.findProgrammeAcademicUnits(
          context
        );

        academicUnitData = programmeData.colleges;
      } else if (
        academicUnits
          .map((element) => element.includes('FAC'))
          .includes(true) ||
        academicUnits
          .map((element) => element.includes('SCHOOL'))
          .includes(true)
      ) {
        structure = academicUnits.includes('FACULT') ? 'FACULTY' : 'SCHOOL';

        programmeData = await programmeService.findProgrammeAcademicUnits(
          context
        );
        academicUnitData = programmeData.faculties;
      } else {
        structure = 'DEPARTMENT';
        programmeData = await programmeService.findProgrammeAcademicUnits(
          context
        );
        academicUnitData = programmeData.departments;
      }
      const programmeAcademicUnit = { academicUnitData, structure };
      const workbook = new excelJs.Workbook();
      const rootSheet = workbook.addWorksheet('REPORT');

      rootSheet.mergeCells('C1', 'O3');
      rootSheet.mergeCells('A1', 'B2');
      const titleCell = rootSheet.getCell('C1');

      rootSheet.getRow(1).height = 190;

      titleCell.value = `${
        upperCase(institutionStructure.institution_name) || 'TERP'
      }\nOFFICE OF THE BURSAR
      STUDENTS' FEES DEPOSITS REPORT \n
       ${programmeAcademicUnit.structure}: ${
        programmeAcademicUnit.academicUnitData.academic_unit_title
      }(${
        programmeAcademicUnit.academicUnitData.academic_unit_code
      }) \n PROGRAMME: ${data[0].programme_title}-(${data[0].programme_code}) \n
       From: ${context.from_date} TO: ${context.to_date}
      Campus: ${campus} / Intake: ${data[0].intake}

      `;

      titleCell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
      };

      titleCell.font = { bold: true, size: 15, name: 'Arial' };

      const headerRow = rootSheet.getRow(3);

      headerRow.values = map(feesDepositsColumns, 'header');

      headerRow.font = { bold: true, size: 12, color: '#2c3e50' };

      rootSheet.columns = feesDepositsColumns.map((column) => {
        delete column.header;

        return column;
      });
      rootSheet.getRow(3).height = 60;

      rootSheet.views = [
        {
          state: 'frozen',
          xSplit: 0,
          ySplit: 3,
          topLeftCell: 'G10',
          activeCell: 'A1',
        },
      ];

      const templateData = [];

      if (!isEmpty(data)) {
        data.forEach((element) => {
          templateData.push([
            element.surname,
            element.other_names,
            element.email,
            element.phone,
            element.entry_academic_year,
            element.gender,
            element.student_number,
            element.registration_number,
            element.programme_code,
            element.programme_title,
            element.programme_study_year,
            element.ura_prn,
            element.amount,
            element.allocated_amount,
            element.unallocated_amount,
            element.payment_date,
            element.sponsorship,
            element.fees_waiver,
            element.provisional_list,
            element.graduation_list,
            element.completion_year,
            element.has_completed,
            element.student_academic_status,
          ]);
        });
      }

      rootSheet.addRows(templateData);

      const uploadPath = `${process.cwd()}/src/assets/documents/templates`;

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true }, (err) => {
          throw new Error(err.message);
        });
      }

      const template = `${uploadPath}/download-prepayments-${user.surname}-${
        user.other_names
      }-${user.id}-${now()}.xlsm`;

      await workbook.xlsx.writeFile(template);
      await res.download(template, `PREPAYMENTS REPORT.xlsx`, (error) => {
        if (error) {
          throw new Error(error.message);
        }
      });
    } catch (error) {
      http.setError(400, 'Unable To Fetch Prepayments Report', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

const generateReport = function (data) {
  try {
    const feesDeposits = data;

    let amountDeposited = '';

    let allocatedAmount = '';

    let unallocatedAmount = '';

    let academicUnit = [];

    let sponsorship = [];

    if (isEmpty(feesDeposits)) {
      amountDeposited = 0;
      allocatedAmount = 0;
      unallocatedAmount = 0;
    } else {
      academicUnit = [
        ...feesDeposits
          .reduce((r, o) => {
            const key = o.academic_unit_code;

            const item =
              r.get(key) ||
              Object.assign({}, o, {
                amount: 0,
                allocated_amount: 0,
                unallocated_amount: 0,
              });

            item.amount += Number(o.amount);

            item.allocated_amount += Number(o.allocated_amount);

            item.unallocated_amount += Number(o.unallocated_amount);

            return r.set(key, item);
          }, new Map())
          .values(),
      ];

      //

      sponsorship = [
        ...feesDeposits
          .reduce((r, o) => {
            const key = o.sponsorship;

            const item =
              r.get(key) ||
              Object.assign({}, o, {
                amount: 0,
                allocated_amount: 0,
                unallocated_amount: 0,
              });

            item.amount += Number(o.amount);

            item.allocated_amount += Number(o.allocated_amount);

            item.unallocated_amount += Number(o.unallocated_amount);

            return r.set(key, item);
          }, new Map())
          .values(),
      ];
    }

    amountDeposited = sumBy(feesDeposits, (item) => Number(item.amount));
    allocatedAmount = sumBy(feesDeposits, (item) =>
      Number(item.allocated_amount)
    );
    unallocatedAmount = sumBy(feesDeposits, (item) =>
      Number(item.unallocated_amount)
    );

    return {
      amountDeposited,
      allocatedAmount,
      unallocatedAmount,
      academicUnit,
      sponsorship,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

//  grouping data by programme

const groupByProgramme = (data) => {
  try {
    const merged = data.reduce(
      (groupedData, { academic_unit_code, academic_unit_title, ...rest }) => {
        const key = `${academic_unit_code}-${academic_unit_title}`;

        groupedData[key] = groupedData[key] || {
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

module.exports = FeesDepositsReportsController;
