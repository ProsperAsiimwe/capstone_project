const { HttpResponse } = require('@helpers');
const {
  institutionStructureService,
  admissionSchemeReportsService,
  runningAdmissionService,
} = require('@services/index');
const {
  toUpper,
  isEmpty,
  map,
  now,
  flatten,
  times,
  isArray,
} = require('lodash');
const model = require('@models');
const moment = require('moment');
const { getKYUDiplomaColumns } = require('./templateColumns');
const excelJs = require('exceljs');
const fs = require('fs');
const path = require('path');
const { createAdmissionLog } = require('../Helpers/logsHelper');
const DownloadEvent = require('@events/DownloadEvent');

const { activityLog } = require('../Helpers/logsHelper');

const http = new HttpResponse();

class DiplomaAdmissionKyuController {
  // diplomaAdmissionReportKyu
  async diplomaAdmissionReportKyu(req, res) {
    try {
      if (!req.params.programmeCampusId) {
        throw new Error('Invalid Context Provided');
      }
      const { id: user, surname, other_names: otherNames } = req.user;

      const { programmeCampusId } = req.params;

      req.body = { ...req.body, programme_campus_id: programmeCampusId };

      const context = req.body;

      const institutionStructure =
        await institutionStructureService.findInstitutionStructureRecords({
          attributes: ['institution_name', 'institution_logo'],
        });

      if (!institutionStructure) {
        throw new Error('Unable To Find Institution Structure.');
      }

      const findRunningAdmission = await runningAdmissionService
        .findOneRunningAdmission({
          where: {
            academic_year_id: context.academic_year_id,
            intake_id: context.intake_id,
            admission_scheme_id: context.admission_scheme_id,
            degree_category_id: context.degree_category_id,
          },
          include: [
            {
              association: 'academicYear',
              attributes: ['id', 'metadata_value'],
            },
            {
              association: 'intake',
              attributes: ['id', 'metadata_value'],
            },
            {
              association: 'degreeCategory',
              attributes: ['id', 'metadata_value'],
            },
            {
              association: 'admissionScheme',
              attributes: ['id', 'scheme_name', 'scheme_description'],
            },
          ],
          nest: true,
        })
        .then(function (res) {
          if (res) {
            const result = res.toJSON();

            return result;
          }
        });

      if (!findRunningAdmission) {
        throw new Error(`Unable To Find Running Admission record.`);
      }

      const data =
        await admissionSchemeReportsService.diplomaAdmissionReportKyu(context);

      if (isEmpty(data)) {
        throw new Error(`No applicant Records.`);
      }

      const numberOFfrom = data.length;

      const applicantData = data.filter((value, index, self) => {
        return self.findIndex((v) => v.email === value.email) === index;
      });

      const numberApplicants = applicantData.length;

      const maleApplicants = applicantData.filter(
        (e) => toUpper(e.gender) === 'MALE'
      ).length;

      const femaleApplicants = applicantData.filter(
        (e) => toUpper(e.gender) === 'FEMALE'
      ).length;

      const summary = {
        numberOFfrom,
        numberApplicants,
        femaleApplicants,
        maleApplicants,
      };

      let academicUnit = {};

      if (context.category === 'all') {
        academicUnit = {
          faculty_title: 'ALL ACADEMIC UNITS',
          faculty_code: 'ALL FACULTIES',
          programme_title: 'ALL RUNNING SCHEME PROGRAMMES',
          programme_code: 'ALL PROGRAMMES',
        };
      } else {
        academicUnit =
          await admissionSchemeReportsService.programmeByProgCampus(context);
      }

      const workbook = new excelJs.Workbook();
      const admissionWorkSheet = workbook.addWorksheet('APPLICANTS');

      admissionWorkSheet.mergeCells('A1', 'W1');
      admissionWorkSheet.mergeCells('A2', 'D2');
      admissionWorkSheet.mergeCells('A3', 'D3');

      admissionWorkSheet.getRow(1).height = 100;
      const titleCell = admissionWorkSheet.getCell('A1');
      titleCell.value = `${
        toUpper(institutionStructure.institution_name) || 'ACMIS'
      }\n OFFICE OF THE ACADEMIC REGISTRAR\n${academicUnit.faculty_title}(${
        academicUnit.faculty_code
      }) \n ${findRunningAdmission.admissionScheme.scheme_name}\n ${
        findRunningAdmission.intake.metadata_value
      } INTAKE (${findRunningAdmission.academicYear.metadata_value})`;

      titleCell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
      };
      titleCell.font = { bold: true, size: 15, name: 'Arial' };

      const generatedAt = moment(moment.now()).format('Do MMM, YYYY');
      admissionWorkSheet.getCell('A2').value = `DATE GENERATED: ${generatedAt}`;
      admissionWorkSheet.getCell('A2').font = {
        bold: false,
        size: 10,
        name: 'Arial',
      };

      admissionWorkSheet.getCell(
        'E2'
      ).value = `No.FORMS FILLED: ${summary.numberOFfrom}`;

      admissionWorkSheet.getCell(
        'F2'
      ).value = `No.APPLICANTS: ${summary.numberApplicants}`;
      admissionWorkSheet.getCell(
        'G2'
      ).value = `MALE APPLICANTS: ${summary.maleApplicants}`;
      admissionWorkSheet.getCell(
        'H2'
      ).value = `FEMALE APPLICANTS: ${summary.femaleApplicants}`;

      admissionWorkSheet.getRow(3).height = 30;

      if (context.category === 'all') {
        admissionWorkSheet.getCell('A3').value = `ALL PROGRAMMES ON SCHEME`;
        admissionWorkSheet.getCell('A3').font = {
          bold: true,
          size: 15,
          name: 'Arial',
        };
      } else {
        admissionWorkSheet.getCell(
          'A3'
        ).value = `${academicUnit.programme_title}(${academicUnit.programme_code})`;
        admissionWorkSheet.getCell('A3').font = {
          bold: true,
          size: 15,
          name: 'Arial',
        };
      }

      // getKYUDiplomaColumns
      admissionWorkSheet.getRow(4).height = 20;

      let choiceColumns = [];

      let diplomaColumns = [];

      const category = 'programme-campus';

      if (category === 'programme-campus') {
        choiceColumns = [
          {
            header: 'CODE/ALIAS',
            key: `prog_code`,
            width: 25,
          },
          {
            header: 'CHOICE NUMBER',
            key: `choice_number`,
            width: 25,
          },
        ];
        diplomaColumns = getKYUDiplomaColumns(flatten(choiceColumns));
      } else {
        choiceColumns = times(findRunningAdmission.number_of_choices).map(
          (choiceNumber) => {
            return [
              {
                header: toUpper(
                  `${moment.localeData().ordinal(choiceNumber + 1)} CHOICE CODE`
                ),
                key: `choice_${choiceNumber + 1}`,
                width: 20,
              },
              {
                header: toUpper(
                  `${moment
                    .localeData()
                    .ordinal(choiceNumber + 1)} CHOICE CAMPUS`
                ),
                key: `campus_${choiceNumber + 1}`,
                width: 25,
              },
              {
                header: toUpper(
                  `${moment
                    .localeData()
                    .ordinal(choiceNumber + 1)} CHOICE STUDY TIME`
                ),
                key: `study_time_${choiceNumber + 1}`,
                width: 25,
              },
              {
                header: toUpper(
                  `${moment
                    .localeData()
                    .ordinal(choiceNumber + 1)} CHOICE ENTRY YEAR`
                ),
                key: `entry_year_${choiceNumber + 1}`,
                width: 25,
              },
            ];
          }
        );

        diplomaColumns = getKYUDiplomaColumns(flatten(choiceColumns));
      }

      const headerRow = admissionWorkSheet.getRow(4);
      headerRow.values = map(diplomaColumns, 'header');
      headerRow.font = { bold: true, size: 11, color: '#2c3e50' };

      admissionWorkSheet.columns = diplomaColumns.map((column) => {
        delete column.header;

        return column;
      });

      admissionWorkSheet.views = [
        {
          state: 'frozen',
          xSplit: 0,
          ySplit: 4,
          topLeftCell: 'G10',
          activeCell: 'A1',
        },
      ];

      let templateData = [];

      for (const applicant of data) {
        const firstChoice = applicant.programme_choices.filter(
          (e) => Number(e.choice_number) === 1
        );
        templateData.push([
          applicant.form_id,
          `${toUpper(applicant.surname)} ${applicant.other_names}`,
          toUpper(applicant.gender),
          firstChoice[0].programme_code,
          firstChoice[0].alias_code,
          firstChoice[0].campus,
          firstChoice[0].programme_type,
          firstChoice[0].entry_study_year,
          firstChoice[0].choice_number_name,

          applicant.country,
          applicant.nationality,
          applicant.district_of_origin,
          applicant.district_of_birth,
          applicant.email,
          applicant.phone,
          applicant.payment_status,
          applicant.olevel_index || '',
          applicant.olevel_year || '',
          applicant.distinctions || '',
          applicant.credits || '',
          applicant.passes || '',
          applicant.olevel_school || '',
          getFormattedArray(applicant.o_level_subjects),
          applicant.alevel_index || '',
          applicant.alevel_year || '',
          applicant.alevel_school || '',
          getFormattedArray(applicant.results),
          applicant.date_of_birth,
          getFormattedOtherQualifications(applicant.diploma_qualifications),
          getFormattedOtherQualifications(applicant.other_qualifications),
          ...flatten(applicant.programme_choices),
        ]);
      }

      admissionWorkSheet.addRows(templateData);

      const uploadPath = `${process.cwd()}/src/assets/documents/templates`;

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true }, (err) => {
          throw new Error(err.message);
        });
      }

      const template = `${uploadPath}/diploma-applicants-${surname}-${otherNames}-${user}-${now()}.xlsm`;

      await workbook.xlsx.writeFile(template);

      await res.download(template, 'DIPLOMA APPLICANTS.xlsx', (error) => {
        if (error) {
          throw new Error(error.message);
        }
      });

      //   await model.sequelize.transaction(async (transaction) => {
      //     await createAdmissionLog(
      //       {
      //         user_id: user,
      //         operation: `DOWNLOAD TEMPLATE`,
      //         area_accessed: `MANAGE APPLICANTS`,
      //         current_data: replace(titleText, '\n', ''),
      //         ip_address: req.connection.remoteAddress,
      //         user_agent: req.get('user-agent'),
      //         token: rememberToken,
      //       },
      //       transaction
      //     );
      //   });
    } catch (error) {
      http.setError(400, 'Unable to get Download Report.', {
        error: { error: error.message },
      });

      return http.send(res);
    }
  }
}

const getFormattedArray = (dataToFormat) => {
  let formattedString = '';

  if (isArray(dataToFormat) && !isEmpty(dataToFormat)) {
    for (const result of dataToFormat) {
      if (result.name) {
        const splittedName = result.name
          .split(' ')
          .map((l) => toUpper(l.substring(0, 3)));

        formattedString += `${splittedName.join('-')}=${result.result},  `;
      }
    }
  }

  return formattedString;
};

const getFormattedOtherQualifications = (data) => {
  let formattedString = '';

  if (isArray(data) && !isEmpty(data)) {
    for (const result of data.slice(0, 2)) {
      if (
        result.award_obtained &&
        result.does_not_have_qualification === false
      ) {
        const splittedName = result.award_obtained
          .split(' ')
          .map((l) => toUpper(l.substring(0, 3)));

        formattedString += `${splittedName.join('-')}:=[${
          result.awarding_body
        },${result.award_classification} - GRADE: ${result.grade_obtained},${
          result.award_type
        },${result.award_end_year}],`;
      }
    }
  }

  return formattedString;
};

module.exports = DiplomaAdmissionKyuController;
