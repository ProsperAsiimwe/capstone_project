const { HttpResponse } = require('@helpers');
const {
  enrollmentReportService,
  institutionStructureService,
} = require('@services/index');
const { generateEnrollmentReport } = require('../Helpers/biEnrollmentsHelper');

const { toUpper, isEmpty, now, map, groupBy, flatten } = require('lodash');
const ExcelJS = require('exceljs');
const fs = require('fs');

const { enrollmentGenderColumns } = require('./templateColumns');

const http = new HttpResponse();

class EnrollmentStatController {
  async enrollmentStatistics(req, res) {
    try {
      if (
        !req.query.academic_year_id ||
        Number.isInteger(parseInt(req.query.academic_year_id, 10)) === false ||
        !req.query.semester_id
      ) {
        throw new Error(`Invalid Request`);
      }

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
        context.unit = 'bi_enrollment_statistics_college';

        data = await enrollmentReportService.enrollmentFunction(context);
      } else if (
        institutionStructure &&
        (institutionStructureUpper
          .map((element) => element.includes('FAC'))
          .includes(true) ||
          institutionStructureUpper
            .map((element) => element.includes('SCH'))
            .includes(true))
      ) {
        context.unit = 'bi_enrollment_statistics';

        data = await enrollmentReportService.enrollmentFunction(context);
      } else {
        throw new Error('Invalid Context Provided');
      }

      const result = generateEnrollmentReport(data);
      http.setSuccess(200, 'Report fetched successfully', {
        result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Report', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  async downloadEnrollmentStatistics(req, res) {
    try {
      if (
        !req.body.academic_year_id ||
        Number.isInteger(parseInt(req.body.academic_year_id, 10)) === false ||
        !req.body.semester_id
      ) {
        throw new Error(`Invalid Request`);
      }
      const context = req.body;
      const { user } = req;

      const institutionStructure =
        await institutionStructureService.findInstitutionStructureRecords();

      const institutionStructureUpper = institutionStructure.academic_units.map(
        (e) => toUpper(e)
      );

      const data = await getReportData(
        context,
        institutionStructure,
        institutionStructureUpper
      );

      if (isEmpty(data.data)) {
        throw new Error(`No data Enrollment on the Defined Context`);
      }

      const academicYear = await enrollmentReportService.eventAcademicYear(
        context
      );
      const semesterData = await enrollmentReportService.eventSemester(context);

      const workbook = await new ExcelJS.Workbook();
      const enrollmentWorkSheet = workbook.addWorksheet('ENROLLMENTS', {
        headerFooter: {
          firstHeader: 'STUDENT ENROLLMENTS',
          firstFooter: 'STUDENT ENROLLMENTS',
        },
      });
      enrollmentWorkSheet.mergeCells('A1', 'EA1');
      enrollmentWorkSheet.mergeCells('A2', 'A5');

      enrollmentWorkSheet.mergeCells('B2', 'Z2');
      enrollmentWorkSheet.mergeCells('AA2', 'AY2');
      enrollmentWorkSheet.mergeCells('AZ2', 'BX2');
      enrollmentWorkSheet.mergeCells('BY2', 'CW2');
      enrollmentWorkSheet.mergeCells('CX2', 'DV2');

      enrollmentWorkSheet.mergeCells('DW2', 'EA2');

      const titleCell = enrollmentWorkSheet.getCell('A1');

      enrollmentWorkSheet.getRow(1).height = 40;

      titleCell.value = `${
        toUpper(institutionStructure.institution_name) || 'TERP'
      }:- ENROLLMENT REPORT FOR :${
        semesterData.semester
      }-ALL CAMPUSES,ALL ACADEMIC UNITS ,All INTAKES(${
        academicYear.academic_year
      })`;
      titleCell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
      };
      titleCell.font = {
        bold: true,
        size: 20,
        name: 'Arial',
        color: { argb: '87CEEB' },
      };

      enrollmentWorkSheet.getRow(2).height = 30;

      const year1Cell = enrollmentWorkSheet.getCell('B2');
      year1Cell.value = `YEAR 1`;
      year1Cell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
      };
      year1Cell.font = { bold: true, size: 11, name: 'Arial' };

      const year2Cell = enrollmentWorkSheet.getCell('AA2');
      year2Cell.value = `YEAR 2`;
      year2Cell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
      };
      year2Cell.font = { bold: true, size: 11, name: 'Arial' };

      const year3Cell = enrollmentWorkSheet.getCell('AZ2');
      year3Cell.value = `YEAR 3`;
      year3Cell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
      };
      year3Cell.font = { bold: true, size: 11, name: 'Arial' };

      const year4Cell = enrollmentWorkSheet.getCell('BY2');
      year4Cell.value = `YEAR 4`;
      year4Cell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
      };
      year4Cell.font = { bold: true, size: 11, name: 'Arial' };

      const year5Cell = enrollmentWorkSheet.getCell('CX2');
      year5Cell.value = `YEAR 5`;
      year5Cell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
      };
      year5Cell.font = { bold: true, size: 11, name: 'Arial' };

      const grandCell = enrollmentWorkSheet.getCell('DW2');
      grandCell.value = `GRAND TOTAL`;
      grandCell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
      };
      grandCell.font = { bold: true, size: 11, name: 'Arial' };

      // code
      const programmeCell = enrollmentWorkSheet.getCell('A2');
      programmeCell.value = `CODE`;
      programmeCell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
      };
      programmeCell.font = { bold: true, size: 11, name: 'Arial' };

      enrollmentWorkSheet.mergeCells('B3', 'I3');
      enrollmentWorkSheet.getCell('B3').value = 'GOVT';
      enrollmentWorkSheet.mergeCells('J3', 'Q3');
      enrollmentWorkSheet.getCell('J3').value = 'PRIVATE';
      enrollmentWorkSheet.mergeCells('R3', 'Z3');
      enrollmentWorkSheet.getCell('R3').value = 'TOTAL';

      enrollmentWorkSheet.mergeCells('AA3', 'AH3');
      enrollmentWorkSheet.getCell('AA3').value = 'GOVT';
      enrollmentWorkSheet.mergeCells('AI3', 'AP3');
      enrollmentWorkSheet.getCell('AI3').value = 'PRIVATE';
      enrollmentWorkSheet.mergeCells('AQ3', 'AY3');
      enrollmentWorkSheet.getCell('AQ3').value = 'TOTAL';

      enrollmentWorkSheet.mergeCells('AZ3', 'BG3');
      enrollmentWorkSheet.getCell('AZ3').value = 'GOVT';
      enrollmentWorkSheet.mergeCells('BH3', 'BO3');
      enrollmentWorkSheet.getCell('BH3').value = 'PRIVATE';
      enrollmentWorkSheet.mergeCells('BP3', 'BX3');
      enrollmentWorkSheet.getCell('BP3').value = 'TOTAL';

      enrollmentWorkSheet.mergeCells('BY3', 'CF3');
      enrollmentWorkSheet.getCell('BY3').value = 'GOVT';
      enrollmentWorkSheet.mergeCells('CG3', 'CN3');
      enrollmentWorkSheet.getCell('CG3').value = 'PRIVATE';
      enrollmentWorkSheet.mergeCells('CO3', 'CW3');
      enrollmentWorkSheet.getCell('CO3').value = 'TOTAL';

      enrollmentWorkSheet.mergeCells('CX3', 'DE3');
      enrollmentWorkSheet.getCell('CX3').value = 'GOVT';
      enrollmentWorkSheet.mergeCells('DF3', 'DM3');
      enrollmentWorkSheet.getCell('DF3').value = 'PRIVATE';
      enrollmentWorkSheet.mergeCells('DN3', 'DV3');
      enrollmentWorkSheet.getCell('DN3').value = 'TOTAL';

      // enrollment - YEAR 1

      enrollmentWorkSheet.mergeCells('B4', 'C4');
      enrollmentWorkSheet.getCell('B4').value = 'ENROL';
      enrollmentWorkSheet.mergeCells('D4', 'E4');
      enrollmentWorkSheet.getCell('D4').value = 'PROV';
      enrollmentWorkSheet.mergeCells('F4', 'G4');
      enrollmentWorkSheet.getCell('F4').value = 'UNREG';
      enrollmentWorkSheet.mergeCells('H4', 'I4');
      enrollmentWorkSheet.getCell('H4').value = 'REG';

      enrollmentWorkSheet.mergeCells('J4', 'K4');
      enrollmentWorkSheet.getCell('J4').value = 'ENROL';
      enrollmentWorkSheet.mergeCells('L4', 'M4');
      enrollmentWorkSheet.getCell('L4').value = 'PROV';
      enrollmentWorkSheet.mergeCells('N4', 'O4');
      enrollmentWorkSheet.getCell('N4').value = 'UNREG';
      enrollmentWorkSheet.mergeCells('P4', 'Q4');
      enrollmentWorkSheet.getCell('P4').value = 'REG';

      enrollmentWorkSheet.mergeCells('R4', 'S4');
      enrollmentWorkSheet.getCell('R4').value = 'ENROL';
      enrollmentWorkSheet.mergeCells('T4', 'U4');
      enrollmentWorkSheet.getCell('T4').value = 'PROV';
      enrollmentWorkSheet.mergeCells('V4', 'W4');
      enrollmentWorkSheet.getCell('V4').value = 'UNREG';
      enrollmentWorkSheet.mergeCells('X4', 'Y4');
      enrollmentWorkSheet.getCell('X4').value = 'REG';
      enrollmentWorkSheet.getCell('Z4').value = 'TOT';

      //YEAR 2
      enrollmentWorkSheet.mergeCells('AA4', 'AB4');
      enrollmentWorkSheet.getCell('AA4').value = 'ENROL';
      enrollmentWorkSheet.mergeCells('AC4', 'AD4');
      enrollmentWorkSheet.getCell('AC4').value = 'PROV';
      enrollmentWorkSheet.mergeCells('AE4', 'AF4');
      enrollmentWorkSheet.getCell('AE4').value = 'UNREG';
      enrollmentWorkSheet.mergeCells('AG4', 'AH4');
      enrollmentWorkSheet.getCell('AG4').value = 'REG';

      enrollmentWorkSheet.mergeCells('AI4', 'AJ4');
      enrollmentWorkSheet.getCell('AI4').value = 'ENROL';
      enrollmentWorkSheet.mergeCells('AK4', 'AL4');
      enrollmentWorkSheet.getCell('AL4').value = 'PROV';
      enrollmentWorkSheet.mergeCells('AM4', 'AN4');
      enrollmentWorkSheet.getCell('AM4').value = 'UNREG';
      enrollmentWorkSheet.mergeCells('AO4', 'AP4');
      enrollmentWorkSheet.getCell('AO4').value = 'REG';

      enrollmentWorkSheet.mergeCells('AQ4', 'AR4');
      enrollmentWorkSheet.getCell('AQ4').value = 'ENROL';
      enrollmentWorkSheet.mergeCells('AS4', 'AT4');
      enrollmentWorkSheet.getCell('AS4').value = 'PROV';
      enrollmentWorkSheet.mergeCells('AU4', 'AV4');
      enrollmentWorkSheet.getCell('AU4').value = 'UNREG';
      enrollmentWorkSheet.mergeCells('AW4', 'AX4');
      enrollmentWorkSheet.getCell('AW4').value = 'REG';
      enrollmentWorkSheet.getCell('AY4').value = 'TOT';

      // YEAR 3

      enrollmentWorkSheet.mergeCells('AZ4', 'BA4');
      enrollmentWorkSheet.getCell('AZ4').value = 'ENROL';
      enrollmentWorkSheet.mergeCells('BB4', 'BC4');
      enrollmentWorkSheet.getCell('BB4').value = 'PROV';
      enrollmentWorkSheet.mergeCells('BD4', 'BE4');
      enrollmentWorkSheet.getCell('BD4').value = 'UNREG';
      enrollmentWorkSheet.mergeCells('BF4', 'BG4');
      enrollmentWorkSheet.getCell('BF4').value = 'REG';

      enrollmentWorkSheet.mergeCells('BH4', 'BI4');
      enrollmentWorkSheet.getCell('BH4').value = 'ENROL';
      enrollmentWorkSheet.mergeCells('BJ4', 'BK4');
      enrollmentWorkSheet.getCell('BJ4').value = 'PROV';
      enrollmentWorkSheet.mergeCells('BL4', 'BM4');
      enrollmentWorkSheet.getCell('BL4').value = 'UNREG';
      enrollmentWorkSheet.mergeCells('BN4', 'BO4');
      enrollmentWorkSheet.getCell('BN4').value = 'REG';

      enrollmentWorkSheet.mergeCells('BP4', 'BQ4');
      enrollmentWorkSheet.getCell('BP4').value = 'ENROL';
      enrollmentWorkSheet.mergeCells('BR4', 'BS4');
      enrollmentWorkSheet.getCell('BR4').value = 'PROV';
      enrollmentWorkSheet.mergeCells('BT4', 'BU4');
      enrollmentWorkSheet.getCell('BT4').value = 'UNREG';
      enrollmentWorkSheet.mergeCells('BV4', 'BW4');
      enrollmentWorkSheet.getCell('BV4').value = 'REG';
      enrollmentWorkSheet.getCell('BX4').value = 'TOT';

      // YEAR 4
      enrollmentWorkSheet.mergeCells('BY4', 'BZ4');
      enrollmentWorkSheet.getCell('BY4').value = 'ENROL';
      enrollmentWorkSheet.mergeCells('CA4', 'CB4');
      enrollmentWorkSheet.getCell('CA4').value = 'PROV';
      enrollmentWorkSheet.mergeCells('CC4', 'CD4');
      enrollmentWorkSheet.getCell('CC4').value = 'UNREG';
      enrollmentWorkSheet.mergeCells('CE4', 'CF4');
      enrollmentWorkSheet.getCell('CE4').value = 'REG';

      enrollmentWorkSheet.mergeCells('CG4', 'CH4');
      enrollmentWorkSheet.getCell('CG4').value = 'ENROL';
      enrollmentWorkSheet.mergeCells('CI4', 'CJ4');
      enrollmentWorkSheet.getCell('CI4').value = 'PROV';
      enrollmentWorkSheet.mergeCells('CK4', 'CL4');
      enrollmentWorkSheet.getCell('CK4').value = 'UNREG';
      enrollmentWorkSheet.mergeCells('CM4', 'CN4');
      enrollmentWorkSheet.getCell('CM4').value = 'REG';

      enrollmentWorkSheet.mergeCells('CO4', 'CP4');
      enrollmentWorkSheet.getCell('CO4').value = 'ENROL';
      enrollmentWorkSheet.mergeCells('CQ4', 'CR4');
      enrollmentWorkSheet.getCell('CQ4').value = 'PROV';
      enrollmentWorkSheet.mergeCells('CS4', 'CT4');
      enrollmentWorkSheet.getCell('CS4').value = 'UNREG';
      enrollmentWorkSheet.mergeCells('CU4', 'CV4');
      enrollmentWorkSheet.getCell('CU4').value = 'REG';
      enrollmentWorkSheet.getCell('CW4').value = 'TOT';

      // YEAR 5

      enrollmentWorkSheet.mergeCells('CX4', 'CY4');
      enrollmentWorkSheet.getCell('CX4').value = 'ENROL';
      enrollmentWorkSheet.mergeCells('CZ4', 'DA4');
      enrollmentWorkSheet.getCell('CZ4').value = 'PROV';
      enrollmentWorkSheet.mergeCells('DB4', 'DC4');
      enrollmentWorkSheet.getCell('DB4').value = 'UNREG';
      enrollmentWorkSheet.mergeCells('DD4', 'DE4');
      enrollmentWorkSheet.getCell('DD4').value = 'REG';

      enrollmentWorkSheet.mergeCells('DF4', 'DG4');
      enrollmentWorkSheet.getCell('DF4').value = 'ENROL';
      enrollmentWorkSheet.mergeCells('DH4', 'DI4');
      enrollmentWorkSheet.getCell('DH4').value = 'PROV';
      enrollmentWorkSheet.mergeCells('DJ4', 'DK4');
      enrollmentWorkSheet.getCell('DJ4').value = 'UNREG';
      enrollmentWorkSheet.mergeCells('DL4', 'DM4');
      enrollmentWorkSheet.getCell('DL4').value = 'REG';

      enrollmentWorkSheet.mergeCells('DN4', 'DO4');
      enrollmentWorkSheet.getCell('DN4').value = 'ENROL';
      enrollmentWorkSheet.mergeCells('DP4', 'DQ4');
      enrollmentWorkSheet.getCell('DP4').value = 'PROV';
      enrollmentWorkSheet.mergeCells('DR4', 'DS4');
      enrollmentWorkSheet.getCell('DR4').value = 'UNREG';
      enrollmentWorkSheet.mergeCells('DT4', 'DU4');
      enrollmentWorkSheet.getCell('DT4').value = 'REG';
      enrollmentWorkSheet.getCell('DV4').value = 'TOT';

      // borders

      const headerRow = enrollmentWorkSheet.getRow(6);

      headerRow.values = map(enrollmentGenderColumns, 'header');
      headerRow.font = { bold: true, size: 11, color: '#2c3e50' };
      enrollmentWorkSheet.columns = enrollmentGenderColumns.map((column) => {
        delete column.header;

        return column;
      });
      enrollmentWorkSheet.getRow(3).height = 40;

      enrollmentWorkSheet.views = [
        {
          state: 'frozen',
          xSplit: 0,
          ySplit: 6,
          topLeftCell: 'G10',
          activeCell: 'A1',
        },
      ];
      const templateData = [];

      let groupedData = [];
      // data.data
      groupedData = groupBy(data.data, 'academic_unit_title');

      Object.keys(groupedData).forEach((element) => {
        templateData.push({
          data: [
            [element],
            ...groupedData[element].map((element) => {
              return [
                element.programme_code,
                Number(element.male_year_1_enr_govt),
                Number(element.female_year_1_enr_govt),
                Number(element.male_prov_year_1_enr_govt),
                Number(element.female_prov_year_1_enr_govt),
                Number(element.male_unreg_year_1_govt),
                Number(element.female_unreg_year_1_govt),
                Number(element.male_year_1_reg_govt),
                Number(element.female_year_1_reg_govt),
                Number(element.male_year_1_enr_private),
                Number(element.female_year_1_enr_private),
                Number(element.male_prov_year_1_enr_private),
                Number(element.female_prov_year_1_enr_private),
                Number(element.male_unreg_year_1_private),
                Number(element.female_unreg_year_1_private),
                Number(element.male_year_1_reg_private),
                Number(element.female_year_1_reg_private),
                Number(element.male_year_1_enr),
                Number(element.female_year_1_enr),
                Number(element.male_prov_year_1_enr),
                Number(element.female_prov_year_1_enr),
                Number(element.male_unreg_year_1),
                Number(element.female_unreg_year_1),
                Number(element.male_year_1_reg),
                Number(element.female_year_1_reg),
                Number(element.total_year_1_enr),
                // year2
                Number(element.male_year_2_enr_govt),
                Number(element.female_year_2_enr_govt),
                Number(element.male_prov_year_2_enr_govt),
                Number(element.female_prov_year_2_enr_govt),
                Number(element.male_unreg_year_2_govt),
                Number(element.female_unreg_year_2_govt),
                Number(element.male_year_2_reg_govt),
                Number(element.female_year_2_reg_govt),
                Number(element.male_year_2_enr_private),
                Number(element.female_year_2_enr_private),
                Number(element.male_prov_year_2_enr_private),
                Number(element.female_prov_year_2_enr_private),
                Number(element.male_unreg_year_2_private),
                Number(element.female_unreg_year_2_private),
                Number(element.male_year_2_reg_private),
                Number(element.female_year_2_reg_private),
                Number(element.male_year_2_enr),
                Number(element.female_year_2_enr),
                Number(element.male_prov_year_2_enr),
                Number(element.female_prov_year_2_enr),
                Number(element.male_unreg_year_2),
                Number(element.female_unreg_year_2),
                Number(element.male_year_2_reg),
                Number(element.female_year_2_reg),
                Number(element.total_year_2_enr),
                // year 3
                Number(element.male_year_3_enr_govt),
                Number(element.female_year_3_enr_govt),
                Number(element.male_prov_year_3_enr_govt),
                Number(element.female_prov_year_3_enr_govt),
                Number(element.male_unreg_year_3_govt),
                Number(element.female_unreg_year_3_govt),
                Number(element.male_year_3_reg_govt),
                Number(element.female_year_3_reg_govt),
                Number(element.male_year_3_enr_private),
                Number(element.female_year_3_enr_private),
                Number(element.male_prov_year_3_enr_private),
                Number(element.female_prov_year_3_enr_private),
                Number(element.male_unreg_year_3_private),
                Number(element.female_unreg_year_3_private),
                Number(element.male_year_3_reg_private),
                Number(element.female_year_3_reg_private),
                Number(element.male_year_3_enr),
                Number(element.female_year_3_enr),
                Number(element.male_prov_year_3_enr),
                Number(element.female_prov_year_3_enr),
                Number(element.male_unreg_year_3),
                Number(element.female_unreg_year_3),
                Number(element.male_year_3_reg),
                Number(element.female_year_3_reg),
                Number(element.total_year_3_enr),
                // year 4
                Number(element.male_year_4_enr_govt),
                Number(element.female_year_4_enr_govt),
                Number(element.male_prov_year_4_enr_govt),
                Number(element.female_prov_year_4_enr_govt),
                Number(element.male_unreg_year_4_govt),
                Number(element.female_unreg_year_4_govt),
                Number(element.male_year_4_reg_govt),
                Number(element.female_year_4_reg_govt),
                Number(element.male_year_4_enr_private),
                Number(element.female_year_4_enr_private),
                Number(element.male_prov_year_4_enr_private),
                Number(element.female_prov_year_4_enr_private),
                Number(element.male_unreg_year_4_private),
                Number(element.female_unreg_year_4_private),
                Number(element.male_year_4_reg_private),
                Number(element.female_year_4_reg_private),
                Number(element.male_year_4_enr),
                Number(element.female_year_4_enr),
                Number(element.male_prov_year_4_enr),
                Number(element.female_prov_year_4_enr),
                Number(element.male_unreg_year_4),
                Number(element.female_unreg_year_4),
                Number(element.male_year_4_reg),
                Number(element.female_year_4_reg),
                Number(element.total_year_4_enr),
                // year 5
                Number(element.male_year_5_enr_govt),
                Number(element.female_year_5_enr_govt),
                Number(element.male_prov_year_5_enr_govt),
                Number(element.female_prov_year_5_enr_govt),
                Number(element.male_unreg_year_5_govt),
                Number(element.female_unreg_year_5_govt),
                Number(element.male_year_5_reg_govt),
                Number(element.female_year_5_reg_govt),
                Number(element.male_year_5_enr_private),
                Number(element.female_year_5_enr_private),
                Number(element.male_prov_year_5_enr_private),
                Number(element.female_prov_year_5_enr_private),
                Number(element.male_unreg_year_5_private),
                Number(element.female_unreg_year_5_private),
                Number(element.male_year_5_reg_private),
                Number(element.female_year_5_reg_private),
                Number(element.male_year_5_enr),
                Number(element.female_year_5_enr),
                Number(element.male_prov_year_5_enr),
                Number(element.female_prov_year_5_enr),
                Number(element.male_unreg_year_5),
                Number(element.female_unreg_year_5),
                Number(element.male_year_5_reg),
                Number(element.female_year_5_reg),
                Number(element.total_year_5_enr),
              ];
            }),
            [],
            [],
          ],
        });
      });

      const result = flatten(map(templateData, 'data'));

      enrollmentWorkSheet.addRows(result);

      const uploadPath = `${process.cwd()}/src/assets/documents/templates`;

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true }, (err) => {
          throw new Error(err.message);
        });
      }

      const template = `${uploadPath}/download-enrollment-template-${
        user.surname
      }-${user.other_names}-${user.id}-${now()}.xlsm`;

      await workbook.xlsx.writeFile(template);
      await res.download(template, 'DEMOGRAPHIC-ENROLLMENT.xlsx', (error) => {
        if (error) {
          throw new Error(error.message);
        }
      });
    } catch (error) {
      http.setError(400, 'Unable Download EnrollmentDetailed Report', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

module.exports = EnrollmentStatController;

const getReportData = async (
  context,
  institutionStructure,
  institutionStructureUpper
) => {
  let data = [];

  if (
    institutionStructure &&
    institutionStructureUpper
      .map((element) => element.includes('COL'))
      .includes(true)
  ) {
    context.unit = 'bi_enrollment_statistics_college';
    data = await enrollmentReportService.enrollmentFaculty(context);
  } else if (
    institutionStructure &&
    (institutionStructureUpper
      .map((element) => element.includes('FAC'))
      .includes(true) ||
      institutionStructureUpper
        .map((element) => element.includes('SCH'))
        .includes(true))
  ) {
    context.unit = 'bi_enrollment_statistics';

    data = await enrollmentReportService.enrollmentFaculty(context);
  } else {
    throw new Error('Invalid Context Provided');
  }

  const studyYear = [...new Set(data.map((e) => e.study_year))];

  const sponsorship = [...new Set(data.map((e) => e.sponsorship))];

  data.forEach((element) => {
    const male_unreg_year_1_govt =
      Number(element.male_year_1_enr_govt) -
      (Number(element.male_prov_year_1_enr_govt) +
        Number(element.male_year_1_reg_govt));
    const female_unreg_year_1_govt =
      Number(element.female_year_1_enr_govt) -
      (Number(element.female_prov_year_1_enr_govt) +
        Number(element.female_year_1_reg_govt));

    const male_unreg_year_1_private =
      Number(element.male_year_1_enr_private) -
      (Number(element.male_prov_year_1_enr_private) +
        Number(element.male_year_1_reg_private));

    const female_unreg_year_1_private =
      Number(element.female_year_1_enr_private) -
      (Number(element.female_prov_year_1_enr_private) +
        Number(element.female_year_1_reg_private));

    const male_unreg_year_1 =
      Number(element.male_year_1_enr) -
      (Number(element.male_prov_year_1_enr) + Number(element.male_year_1_reg));

    const female_unreg_year_1 =
      Number(element.female_year_1_enr) -
      (Number(element.female_prov_year_1_enr) +
        Number(element.female_year_1_reg));

    element.male_unreg_year_1_govt = male_unreg_year_1_govt;
    element.female_unreg_year_1_govt = female_unreg_year_1_govt;
    element.male_unreg_year_1_private = male_unreg_year_1_private;
    element.female_unreg_year_1_private = female_unreg_year_1_private;
    element.male_unreg_year_1 = male_unreg_year_1;
    element.female_unreg_year_1 = female_unreg_year_1;

    // year 2
    const male_unreg_year_2_govt =
      Number(element.male_year_2_enr_govt) -
      (Number(element.male_prov_year_2_enr_govt) +
        Number(element.male_year_2_reg_govt));
    const female_unreg_year_2_govt =
      Number(element.female_year_2_enr_govt) -
      (Number(element.female_prov_year_2_enr_govt) +
        Number(element.female_year_2_reg_govt));

    const male_unreg_year_2_private =
      Number(element.male_year_2_enr_private) -
      (Number(element.male_prov_year_2_enr_private) +
        Number(element.male_year_2_reg_private));

    const female_unreg_year_2_private =
      Number(element.female_year_2_enr_private) -
      (Number(element.female_prov_year_2_enr_private) +
        Number(element.female_year_2_reg_private));

    const male_unreg_year_2 =
      Number(element.male_year_2_enr) -
      (Number(element.male_prov_year_2_enr) + Number(element.male_year_2_reg));

    const female_unreg_year_2 =
      Number(element.female_year_2_enr) -
      (Number(element.female_prov_year_2_enr) +
        Number(element.female_year_2_reg));

    element.male_unreg_year_2_govt = male_unreg_year_2_govt;
    element.female_unreg_year_2_govt = female_unreg_year_2_govt;
    element.male_unreg_year_2_private = male_unreg_year_2_private;
    element.female_unreg_year_2_private = female_unreg_year_2_private;
    element.male_unreg_year_2 = male_unreg_year_2;
    element.female_unreg_year_2 = female_unreg_year_2;

    // year 3
    const male_unreg_year_3_govt =
      Number(element.male_year_3_enr_govt) -
      (Number(element.male_prov_year_3_enr_govt) +
        Number(element.male_year_3_reg_govt));
    const female_unreg_year_3_govt =
      Number(element.female_year_3_enr_govt) -
      (Number(element.female_prov_year_3_enr_govt) +
        Number(element.female_year_3_reg_govt));

    const male_unreg_year_3_private =
      Number(element.male_year_3_enr_private) -
      (Number(element.male_prov_year_3_enr_private) +
        Number(element.male_year_3_reg_private));

    const female_unreg_year_3_private =
      Number(element.female_year_3_enr_private) -
      (Number(element.female_prov_year_3_enr_private) +
        Number(element.female_year_3_reg_private));

    const male_unreg_year_3 =
      Number(element.male_year_3_enr) -
      (Number(element.male_prov_year_3_enr) + Number(element.male_year_3_reg));

    const female_unreg_year_3 =
      Number(element.female_year_3_enr) -
      (Number(element.female_prov_year_3_enr) +
        Number(element.female_year_3_reg));

    element.male_unreg_year_3_govt = male_unreg_year_3_govt;
    element.female_unreg_year_3_govt = female_unreg_year_3_govt;
    element.male_unreg_year_3_private = male_unreg_year_3_private;
    element.female_unreg_year_3_private = female_unreg_year_3_private;
    element.male_unreg_year_3 = male_unreg_year_3;
    element.female_unreg_year_3 = female_unreg_year_3;

    //year 4
    const male_unreg_year_4_govt =
      Number(element.male_year_4_enr_govt) -
      (Number(element.male_prov_year_4_enr_govt) +
        Number(element.male_year_4_reg_govt));
    const female_unreg_year_4_govt =
      Number(element.female_year_4_enr_govt) -
      (Number(element.female_prov_year_4_enr_govt) +
        Number(element.female_year_4_reg_govt));

    const male_unreg_year_4_private =
      Number(element.male_year_4_enr_private) -
      (Number(element.male_prov_year_4_enr_private) +
        Number(element.male_year_4_reg_private));

    const female_unreg_year_4_private =
      Number(element.female_year_4_enr_private) -
      (Number(element.female_prov_year_4_enr_private) +
        Number(element.female_year_4_reg_private));

    const male_unreg_year_4 =
      Number(element.male_year_4_enr) -
      (Number(element.male_prov_year_4_enr) + Number(element.male_year_4_reg));

    const female_unreg_year_4 =
      Number(element.female_year_4_enr) -
      (Number(element.female_prov_year_4_enr) +
        Number(element.female_year_4_reg));

    element.male_unreg_year_4_govt = male_unreg_year_4_govt;
    element.female_unreg_year_4_govt = female_unreg_year_4_govt;
    element.male_unreg_year_4_private = male_unreg_year_4_private;
    element.female_unreg_year_4_private = female_unreg_year_4_private;
    element.male_unreg_year_4 = male_unreg_year_4;
    element.female_unreg_year_4 = female_unreg_year_4;

    // year 5
    const male_unreg_year_5_govt =
      Number(element.male_year_5_enr_govt) -
      (Number(element.male_prov_year_5_enr_govt) +
        Number(element.male_year_5_reg_govt));
    const female_unreg_year_5_govt =
      Number(element.female_year_5_enr_govt) -
      (Number(element.female_prov_year_5_enr_govt) +
        Number(element.female_year_5_reg_govt));

    const male_unreg_year_5_private =
      Number(element.male_year_5_enr_private) -
      (Number(element.male_prov_year_5_enr_private) +
        Number(element.male_year_5_reg_private));

    const female_unreg_year_5_private =
      Number(element.female_year_5_enr_private) -
      (Number(element.female_prov_year_5_enr_private) +
        Number(element.female_year_5_reg_private));

    const male_unreg_year_5 =
      Number(element.male_year_5_enr) -
      (Number(element.male_prov_year_5_enr) + Number(element.male_year_5_reg));

    const female_unreg_year_5 =
      Number(element.female_year_5_enr) -
      (Number(element.female_prov_year_5_enr) +
        Number(element.female_year_5_reg));

    element.male_unreg_year_5_govt = male_unreg_year_5_govt;
    element.female_unreg_year_5_govt = female_unreg_year_5_govt;
    element.male_unreg_year_5_private = male_unreg_year_5_private;
    element.female_unreg_year_5_private = female_unreg_year_5_private;
    element.male_unreg_year_5 = male_unreg_year_5;
    element.female_unreg_year_5 = female_unreg_year_5;
  });

  const result = { data, sponsorship, studyYear };

  return result;
};
