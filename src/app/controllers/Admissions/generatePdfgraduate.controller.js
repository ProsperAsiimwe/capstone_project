const { HttpResponse } = require('@helpers');
const {
  institutionStructureService,
  admissionSchemeReportsService,
  admittedApplicantsViewsService,
  runningAdmissionService,
} = require('@services/index');
const { isEmpty, toUpper } = require('lodash');
const fs = require('fs');
const http = new HttpResponse();
const PDFDocument = require('pdfkit-table');
const moment = require('moment');
const { appConfig } = require('@root/config');

class GraduateProgrammeController {
  // graduateProgrammeAdmissions
  async pdfGraduateAdmissions(req, res) {
    try {
      if (!req.params.programmeCampusId) {
        throw new Error('Invalid Context Provided');
      }

      const { programmeCampusId } = req.params;

      req.body = { ...req.body, programme_campus_id: programmeCampusId };

      const institutionStructure =
        await institutionStructureService.findInstitutionStructureRecords({
          attributes: ['institution_name', 'institution_logo'],
        });

      if (!institutionStructure) {
        throw new Error('Unable To Find Institution Structure.');
      }

      const context = req.body;

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
        await admissionSchemeReportsService.graduateProgrammeAdmissions(
          context
        );

      if (isEmpty(data)) {
        throw new Error(`No applicant Records.`);
      }

      const academicUnit =
        await admissionSchemeReportsService.programmeByProgCampus(context);

      const theOutput = new PDFDocument({
        size: 'A3',
        layout: 'landscape',
        margin: 40,
        permissions: {
          copying: false,
          modifying: false,
          fillingForms: false,
        },
      });
      const pathTemplate = `${appConfig.ASSETS_ROOT_DIRECTORY}/documents/templates/`;

      const fileName = `${pathTemplate}GraduateAdmissions.pdf`;
      const institutionName = toUpper(institutionStructure.institution_name);

      const generatedAtTime = moment(moment.now()).format('Do MMM, YYYY');

      theOutput.pipe(fs.createWriteStream(fileName));

      const pathToLog = `${appConfig.ASSETS_ROOT_DIRECTORY}/logo`;

      // theOutput
      //   .image(`${pathToLog}/default.png`, 30, 50, {
      //     align: 'center',
      //     valign: 'center',
      //     fit: [50, 100],
      //   })
      //   .opacity(0.1)
      //   .lineGap(1);

      theOutput.image(`${pathToLog}/default.png`, 560, 30, {
        align: 'center',
        fit: [70, 70],
        valign: 'center',
      });

      theOutput.moveDown();

      theOutput.moveDown(4.0).font('Times-Bold').text(`${institutionName}`, {
        align: 'center',
        bold: true,
      });
      theOutput.font('Times-Bold').text(`OFFICE OF THE ACADEMIC REGISTRAR`, {
        align: 'center',
        bold: true,
      });
      theOutput
        .font('Times-Bold')
        .text(`${academicUnit.faculty_title}(${academicUnit.faculty_code})`, {
          align: 'center',
          bold: true,
        });

      theOutput.text('APPLICANTS FOR POSTGRADUATE-AND-TAUGHT-PhDs', {
        align: 'center',
      });

      theOutput.text(
        `${findRunningAdmission.intake.metadata_value} INTAKE (${findRunningAdmission.academicYear.metadata_value})`,
        {
          align: 'center',
        }
      );
      theOutput.text(`Date:${generatedAtTime}`, {
        align: 'center',
        fontSize: 8,
      });

      theOutput.moveDown();
      theOutput.moveDown();

      // using a table

      data.forEach((element) => {
        const name = element.surname + ' ' + element.other_names;

        element.name = name;
        let degreesAward = '';

        let points = '__';

        let gradYear = '';

        let award_end_date = '';

        let award_type = '';

        let institution_name = '';

        if (!isEmpty(element.degree_qualifications)) {
          const i = element.degree_qualifications[0];

          const institutionName =
            i.institution_name[0].toUpperCase() +
            i.institution_name.substring(1).toLocaleLowerCase();

          const firstDegree =
            i.award_obtained[0].toUpperCase() +
            i.award_obtained.substring(1).toLocaleLowerCase();

          degreesAward = `${firstDegree}(${i.award_type})`;
          points = i.grade_obtained || '__';
          gradYear = i.award_end_year;
          award_end_date = i.award_end_date;
          award_type = i.award_type;
          institution_name = institutionName;
        }

        let otherQualifications = '__';

        if (!isEmpty(element.other_qualifications)) {
          // otherQualifications = `${element.other_qualifications[0].award_obtained}(${element.other_qualifications[0].award_type})`;
          otherQualifications = `${element.other_qualifications[0].award_obtained}`;
        }
        element.otherQualifications = otherQualifications;
        element.degreesAward = degreesAward;
        element.points = points;
        element.gradYear = gradYear;
        element.award_end_date = award_end_date;
        element.award_type = award_type;
        element.institution_name = institution_name;
      });

      const applicantPdfData = data.map((e) => ({
        sn: e.sn,
        form_id: e.form_id,
        name: e.name,
        gender: e.gender.substring(0, 1),
        nationality:
          e.nationality[0].toUpperCase() +
          e.nationality.substring(1).toLocaleLowerCase(),
        degreesAward: e.degreesAward,
        points: e.points,
        institution_name: e.institution_name,
        award_end_date: e.award_end_date,
        otherQualifications: e.otherQualifications,
      }));

      const prog = academicUnit.programme_title.toLocaleLowerCase();

      const prog2 = prog[0].toUpperCase() + prog.substring(1);
      const generatedAt = moment(moment.now()).format('Do MMM, YYYY');

      const table = {
        title: `Programme: ${prog2}(${academicUnit.programme_code})`,
        headers: [
          {
            label: 'S/N',
            property: 'sn',
            width: 30,
            renderer: null,
            bold: true,
            align: 'center',
          },
          { label: 'FormID', property: 'form_id', width: 130, renderer: null },
          {
            label: 'NAME',
            property: 'name',
            width: 130,
            renderer: null,
          },
          {
            label: 'GENDER',
            property: 'gender',
            width: 70,
            renderer: null,
            align: 'center',
          },
          {
            label: 'NATIONALITY',
            property: 'nationality',
            width: 70,
            renderer: null,
            align: 'center',
          },
          {
            label: '1st DEGREE',
            property: 'degreesAward',
            width: 180,
            renderer: null,
          },
          {
            label: 'CLASS',
            property: 'points',
            width: 50,
            renderer: null,
            align: 'center',
          },
          {
            label: 'INSTITUTION',
            property: 'institution_name',
            width: 200,
            renderer: null,
          },
          {
            label: 'END DATE',
            property: 'award_end_date',
            width: 70,
            renderer: null,
            align: 'center',
          },
          {
            label: 'OTHER QUALIFICATIONS',
            property: 'otherQualifications',
            width: 200,
            renderer: null,
            align: 'center',
          },
        ],
        datas: [...applicantPdfData],
      };

      await theOutput.table(table, {
        // columnsSize: [200, 100, 100, 100, 100],
        prepareHeader: () =>
          theOutput.font('Helvetica-Bold').fontSize(10).moveDown(),
        prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
          theOutput.font('Helvetica').fontSize(10);
          indexColumn = 0;
        },
        align: 'center',
        columnSpacing: 10,

        width: 500,
      });

      theOutput.moveDown();

      theOutput.text(`Date: ${generatedAt}`, {
        align: 'left',
      });

      theOutput.end();

      const dataReport = res;

      return theOutput.pipe(dataReport);
    } catch (error) {
      http.setError(400, 'Unable to get Download Report.', {
        error: { error: error.message },
      });

      return http.send(res);
    }
  }

  // pdf

  async pdfAdmittedApplicants(req, res) {
    try {
      const { id: user } = req.user;

      const context = req.body;

      if (
        !context.academic_year_id ||
        !context.intake_id ||
        !context.degree_category_id ||
        !context.admission_scheme_id ||
        !context.programme_id
      ) {
        throw new Error('Invalid Context Provided');
      }

      const institutionStructure =
        await institutionStructureService.findInstitutionStructureRecords({
          attributes: ['institution_name', 'institution_logo'],
        });

      if (!institutionStructure) {
        throw new Error('Unable To Find Institution Structure.');
      }

      const data =
        await admittedApplicantsViewsService.admittedApplicantsDownload(
          context
        );

      if (isEmpty(data)) {
        throw new Error(`No admitted applicants Records.`);
      }

      const theOutput = new PDFDocument({
        size: 'A4',
        layout: 'portrait',
        margin: 40,
        permissions: {
          copying: false,
          modifying: false,
          fillingForms: false,
        },
      });
      const pathTemplate = `${appConfig.ASSETS_ROOT_DIRECTORY}/documents/templates/`;

      const fileName = `${pathTemplate}AdmittedApplicants.pdf`;
      const institutionName = toUpper(institutionStructure.institution_name);

      const generatedAtTime = moment(moment.now()).format('Do MMM, YYYY');

      theOutput.pipe(fs.createWriteStream(fileName));

      const pathToLog = `${appConfig.ASSETS_ROOT_DIRECTORY}/logo`;

      theOutput.image(`${pathToLog}/default.png`, 250, 30, {
        align: 'center',
        fit: [70, 70],
        valign: 'center',
      });

      theOutput.moveDown();

      theOutput.moveDown(4.0).font('Times-Bold').text(`${institutionName}`, {
        align: 'center',
        bold: true,
      });
      theOutput.font('Times-Bold').text(`OFFICE OF THE ACADEMIC REGISTRAR`, {
        align: 'center',
        bold: true,
      });

      theOutput.text('ADMITTED APPLICANTS', {
        align: 'center',
      });
      theOutput
        .font('Times-Bold')
        .text(`${data[0].programme_title}(${data[0].programme_code})`, {
          align: 'center',
          bold: true,
        });
      theOutput.text(`ACADEMIC YEAR (${data[0].entry_academic_year})`, {
        align: 'center',
      });
      theOutput.text(`Date:${generatedAtTime}`, {
        align: 'center',
        fontSize: 8,
      });

      theOutput.moveDown();
      theOutput.moveDown();
      theOutput.moveDown();

      let i = 1;
      data.forEach((element) => {
        const name = element.full_name;
        element.name = name;
        element.sn = i;
        i += 1;
      });

      const applicantPdfData = data.map((e) => ({
        sn: e.sn,
        name: e.name,
        student_number: e.student_number,
        registration_number: e.registration_number,
        gender: e.gender.substring(0, 1),
        nationality:
          e.nationality[0].toUpperCase() +
          e.nationality.substring(1).toLocaleLowerCase(),
        campus: e.campus,
      }));

      const prog = data[0].programme_title.toLocaleLowerCase();

      const prog2 = prog[0].toUpperCase() + prog.substring(1);
      const generatedAt = moment(moment.now()).format('Do MMM, YYYY');

      const table = {
        // title: `ADMITTED APPLICANTS`,
        headers: [
          {
            label: 'sn',
            property: 'sn',
            width: 30,
            renderer: null,
            bold: true,
            align: 'center',
          },
          {
            label: 'NAME',
            property: 'name',
            width: 80,
            renderer: null,
            align: 'left',
          },
          {
            label: 'STD NO.',
            property: 'student_number',
            width: 100,
            renderer: null,
            align: 'center',
          },
          {
            label: 'REG NO.',
            property: 'registration_number',
            width: 100,
            renderer: null,
            align: 'center',
          },
          {
            label: 'GDR',
            property: 'gender',
            width: 30,
            renderer: null,
            align: 'center',
          },
          {
            label: 'NATIONALITY',
            property: 'nationality',
            width: 80,
            renderer: null,
            align: 'center',
          },
          {
            label: 'CAMPUS',
            property: 'campus',
            width: 120,
            renderer: null,
            align: 'center',
          },
        ],
        datas: [...applicantPdfData],
      };

      await theOutput.table(table, {
        // columnsSize: [200, 100, 100, 100, 100],
        prepareHeader: () =>
          theOutput.font('Helvetica-Bold').fontSize(10).moveDown(),
        prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
          theOutput.font('Helvetica').fontSize(8);
          indexColumn === 0;
        },
        align: 'center',
        columnSpacing: 10,

        width: 200,
      });

      theOutput.moveDown();

      theOutput.text(`Date: ${generatedAt}`, {
        align: 'left',
      });

      theOutput.end();

      const dataReport = res;

      return theOutput.pipe(dataReport);
    } catch (error) {
      http.setError(400, 'Unable to get Download Report.', {
        error: { error: error.message },
      });

      return http.send(res);
    }
  }
}

module.exports = GraduateProgrammeController;
