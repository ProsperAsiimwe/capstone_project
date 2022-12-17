const {
  pujabApplicantService,
  pujabApplicationService,
  pujabRunningAdmissionService,
  institutionStructureService,
  metadataService,
  metadataValueService,
} = require('@services/index');
const { HttpResponse } = require('@helpers');
const {
  sumBy,
  groupBy,
  map,
  now,
  toUpper,
  capitalize,
  find,
  includes,
  forEach,
  toString,
} = require('lodash');
const {
  pujabProgrammeChoiceHelper,
} = require('@controllers/Helpers/pujabHelper');
const http = new HttpResponse();
const moment = require('moment');
const ExcelJS = require('exceljs');
const fs = require('fs');
const { pujabUNEBReport } = require('./pujabTemplateColumns');

class PujabApplicantController {
  // index function to show applicants
  /**
   *
   * @param {*} req
   * @param {*} res
   */
  async getAllPujabApplicants(req, res) {
    try {
      const applicants = await pujabApplicantService.findAllPujabApplicants({
        ...getAllApplicantAttributes(),
      });

      http.setSuccess(200, 'Applicants fetched successfully', {
        data: applicants,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to fetch applicants', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async findOnePujabApplicant(req, res) {
    try {
      const { id } = req.params;
      const applicant = await pujabApplicantService.findOnePujabApplicant({
        where: { id },
      });

      http.setSuccess(200, 'Applicant fetched successfully', { applicant });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to get this Applicant.', {
        error: { error: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * DOWNLOAD ADMISSION LETTER
   *
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async downloadAllPujabAApplications(req, res) {
    try {
      const applicants = await pujabApplicantService.findAllPujabApplicants({
        ...getAllApplicantAttributes(),
      });

      http.setSuccess(200, 'Applicants fetched successfully', {
        data: applicants,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to print Admission letters', {
        error: error.message,
      });

      return http.send(res);
    }
  }

  /**
   * GET ACADEMIC YEAR REPORT
   *
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async academicYearReport(req, res) {
    try {
      const { academicYear } = req.params;

      if (!academicYear) throw new Error('Provide an Academic Year');

      const runningAdmission =
        await pujabRunningAdmissionService.findOneAdmission({
          where: {
            academic_year_id: academicYear,
          },
          attributes: [
            'id',
            'academic_year_id',
            'admission_start_date',
            'admission_end_date',
            'application_fee',
            'currency',
            'instructions',
            'is_active',
            'service_fee',
          ],
          raw: true,
        });

      if (runningAdmission) {
        const applications = await pujabApplicationService.findAndCountAll({
          where: {
            pujab_running_admission_id: runningAdmission.id,
          },
          attributes: [
            'id',
            'amount_billed',
            'amount_paid',
            'balance',
            'application_status',
            'payment_status',
            'has_disability',
            'generated_by',
            'a_level_result',
            'o_level_result',
            'has_previous_admission',
            'prn',
          ],
        });

        const applicants = {
          totalNumber: 0,
          totalBilled: 0,
          totalPaid: 0,
          applicationStatus: {},
          paymentStatus: {},
          disability: {},
          previousAdmission: {},
          oLevel: {},
          aLevel: {},
        };

        if (applications) {
          applicants.totalNumber = applications.count;
          applicants.totalBilled = sumBy(applications.rows, 'amount_billed');
          applicants.totalPaid = sumBy(applications.rows, 'amount_paid');
          applicants.totalBalance = sumBy(applications.rows, 'balance');
          applicants.applicationStatus = groupBy(
            applications.rows,
            'application_status'
          );
          applicants.paymentStatus = groupBy(
            applications.rows,
            'payment_status'
          );
          applicants.disability = groupBy(applications.rows, 'has_disability');
          applicants.oLevel = groupBy(applications.rows, 'o_level_result');
          applicants.aLevel = groupBy(applications.rows, 'a_level_result');
          applicants.previousAdmission = groupBy(
            applications.rows,
            'has_previous_admission'
          );
        }

        runningAdmission.applicants = applicants;
      }

      http.setSuccess(200, 'Reports fetched successfully', {
        data: runningAdmission,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to Fetch Reports', {
        error: error.message,
      });

      return http.send(res);
    }
  }

  /**
   * DOWNLOAD ACADEMIC YEAR REPORT
   *
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async downloadAcademicYearReport(req, res) {
    try {
      const { academicYear } = req.params;
      const { category } = req.body;
      const { user } = req;

      if (!academicYear) throw new Error('Provide an Academic Year');
      if (!category) throw new Error('Category of Document to Update');

      const institutionStructure =
        await institutionStructureService.findInstitutionStructureRecords({
          attributes: ['institution_name', 'institution_logo'],
        });

      if (!institutionStructure) {
        throw new Error('Unable To Find Institution Structure.');
      }

      const pujabSections = await metadataService.findOneMetadata({
        where: {
          metadata_name: 'PUJAB SECTIONS',
        },
        include: [
          {
            association: 'metadataValues',
            attributes: ['id', 'metadata_value'],
          },
        ],
      });

      const metadataAcademicYear =
        await metadataValueService.findOneMetadataValue({
          where: {
            id: academicYear,
          },
          attributes: ['metadata_value'],
          raw: true,
        });

      if (!metadataAcademicYear)
        throw new Error('Invalid Academic Year selected');

      if (!pujabSections) {
        throw new Error('No PUJAB Sections have been defined in metadata');
      }

      let findPujabSection;

      if (category === 'UNEB-REPORTS') {
        findPujabSection = find(pujabSections.metadataValues, (section) =>
          includes(toUpper(section.metadata_value), 'NATIONAL')
        );
      } else if (category === 'DISTRICT-QUOTA') {
        findPujabSection = find(pujabSections.metadataValues, (section) =>
          includes(toUpper(section.metadata_value), 'DISTRICT')
        );
      } else if (category === 'TERTIARY-REPORTS') {
        findPujabSection = find(pujabSections.metadataValues, (section) =>
          includes(toUpper(section.metadata_value), 'TERTIARY')
        );
      } else
        throw new Error(
          'The Category you have selected has not been configured'
        );

      const runningAdmission =
        await pujabRunningAdmissionService.getApplicationsReport({
          where: {
            academic_year_id: academicYear,
          },
          include: [
            {
              association: 'programmeChoices',
              separate: true,
              where: {
                pujab_section_id: findPujabSection.id,
              },
            },
          ],
          // raw: true,
        });

      const workbook = new ExcelJS.Workbook();
      const rootSheet = workbook.addWorksheet('PUJAB APPLICANTS');

      rootSheet.mergeCells('C1', 'O3');
      rootSheet.mergeCells('A1', 'B2');
      const titleCell = rootSheet.getCell('C1');

      rootSheet.getRow(1).height = 65;

      titleCell.value = `${toUpper(
        institutionStructure.institution_name || 'TERP'
      )} \n PUJAB APPLICANTS 
      ACADEMIC YEAR: ${metadataAcademicYear.metadata_value}
      PUJAB SECTION: ${findPujabSection.metadata_value}
       DATE DOWNLOADED: ${moment().format('LLLL')}.`;

      titleCell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
      };

      titleCell.font = { bold: true, size: 8, name: 'Arial' };

      const headerRow = rootSheet.getRow(3);

      headerRow.values = map(pujabUNEBReport, 'header');
      headerRow.font = { bold: true, size: 11, color: '#2c3e50' };
      rootSheet.columns = pujabUNEBReport.map((column) => {
        delete column.header;

        return column;
      });
      rootSheet.getRow(3).height = 75;

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

      forEach(runningAdmission, (element) => {
        const progCodes = map(element.programmeChoices, 'programme_code');

        const { length } = progCodes;

        // const progCodes = map(
        //   choices,
        //   (prog) => `${prog.programme_code} - ${prog.institution_code}`
        // );

        templateData.push([
          element.form_id,
          toUpper(element.surname) + ' ' + capitalize(element.other_names),
          element.phone,
          element.a_level_result,
          element.a_index_number,
          element.a_exam_year,
          element.gender ? toUpper(element.gender).charAt(0) : null,
          element.citizenship ? toUpper(element.citizenship).charAt(0) : null,
          element.home_district,
          length > 0 ? progCodes[0] : null,
          length > 1 ? progCodes[1] : null,
          length > 2 ? progCodes[2] : null,
          length > 3 ? progCodes[3] : null,
          length > 4 ? progCodes[4] : null,
          length > 5 ? progCodes[5] : null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          element.o_level_result,
          element.o_index_number,
          element.o_exam_year,
          toString(element.o_distinctions).padStart(2, 0),
          toString(element.o_credits).padStart(2, 0),
          toString(element.o_passes).padStart(2, 0),
          element.a_school_name,
          element.o_school_name,
          element.application_status,
          element.payment_status,
          element.prn,
          element.payment_date,
          element.application_fee,
          element.amount_paid,
        ]);
      });

      rootSheet.addRows(templateData);

      const uploadPath = `${process.cwd()}/src/assets/documents/pujab`;

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true }, (err) => {
          throw new Error(err.message);
        });
      }

      const template = `${uploadPath}/applicants-${user.surname}-${
        user.other_names
      }-${user.id}-${now()}.xlsm`;

      await workbook.xlsx.writeFile(template);
      await res.download(template, `PUJAB-APPLICATIONS.xlsx`, (error) => {
        if (error) {
          throw new Error(error.message);
        }
      });
    } catch (error) {
      http.setError(400, 'Unable to Fetch Reports', {
        error: error.message,
      });

      return http.send(res);
    }
  }

  /**
   * GET ACADEMIC YEAR REPORT DETAILS
   *
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async academicYearReportDetails(req, res) {
    try {
      const { academicYear } = req.params;

      if (!academicYear) throw new Error('Provide an Academic Year');

      const report =
        await pujabRunningAdmissionService.getAcademicYearReportDetails({
          where: {
            academic_year_id: academicYear,
          },
          include: [
            'disability',
            'bioData',
            'fatherInfo',
            'motherInfo',
            'previousAdmission',
            {
              association: 'programmeChoices',
              separate: true,
              attributes: ['id', 'choice_number'],
            },
            {
              association: 'applicant',
              attributes: ['id', 'surname', 'other_names', 'email', 'phone'],
            },
          ],
          order: [['amount_paid', 'desc']],
        });

      http.setSuccess(200, 'Reports fetched successfully', {
        data: report,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to Fetch Reports', {
        error: error.message,
      });

      return http.send(res);
    }
  }

  /**
   * GET ACADEMIC YEAR REPORT DETAILS
   *
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async applicationProgrammeChoices(req, res) {
    try {
      const { applicationId } = req.params;

      const results = await pujabRunningAdmissionService.findOneApplicationView(
        {
          where: {
            id: applicationId,
          },
          include: [
            {
              association: 'ordinaryLevel',
              include: [
                {
                  association: 'subjects',
                  attributes: ['id', 'subject', 'grade'],
                },
              ],
              attributes: [
                'id',
                'school_name',
                'exam_year',
                'index_number',
                'distinctions',
                'credits',
                'passes',
                'failures',
              ],
            },
            {
              association: 'advancedLevel',
              include: [
                {
                  association: 'subjects',
                  attributes: ['id', 'subject', 'grade'],
                },
              ],
              attributes: ['id', 'school_name', 'exam_year', 'index_number'],
            },
          ],
          attributes: ['id'],
        }
      );

      const programmeChoices = await pujabProgrammeChoiceHelper(applicationId);

      http.setSuccess(200, 'Reports fetched successfully', {
        data: { programmeChoices, results },
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to Fetch Reports', {
        error: error.message,
      });

      return http.send(res);
    }
  }
}

const getAllApplicantAttributes = () => ({
  attributes: {
    exclude: ['remember_token', 'password'],
  },
  //   include: [
  //     {
  //       association: 'forms',
  //     },
  //   ],
});

module.exports = PujabApplicantController;
