const {
  runningAdmissionService,
  applicantALevelDataService,
  applicantBioDataService,
  applicantOLevelDataService,
  applicantProgrammeChoiceService,
  applicantDiplomaQualificationService,
  applicantRelevantQualificationService,
  applicantOtherQualificationService,
  applicantRefereeDetailService,
  applicantEmploymentRecordService,
  applicantPermanentAddressService,
  applicantNextOfKinService,
  applicantAttachmentService,
  runningAdmissionApplicantService,
  applicantCertificateQualificationService,
  applicantBachelorsQualificationService,
  applicantMastersQualificationService,
  metadataValueService,
  runningAdmissionProgrammeService,
} = require('@services/index');
const { Op } = require('sequelize');
// const model = require('@models');
const moment = require('moment');
// const PDFDocument = require('pdfkit');
const PDFDocument = require('pdfkit-table');
const fs = require('fs');
const { appConfig } = require('../../../config');
const { isEmpty, orderBy, toUpper, sumBy, trim } = require('lodash');
const axios = require('axios');
const path = require('path');
const {
  getMetadataValueId,
  getMetadataValueIdWithoutError,
} = require('../Helpers/programmeHelper');

/**
 *
 * @param {*} sections
 * @param {*} formId
 * @param {*} applicant
 * @param {*} institutionName
 * @param {*} institutionSlogan
 * @param {*} institutionAddress
 * @param {*} institutionWebsite
 * @param {*} institutionEmail
 * @param {*} institutionTel1
 * @param {*} institutionTel2
 * @param {*} institutionLogoPath
 * @param {*} academicYear
 * @param {*} intake
 * @param {*} degreeCategory
 * @param {*} schemeName
 * @param {*} amount
 * @param {*} currency
 * @param {*} paymentStatus
 * @param {*} admissionDescription
 * @param {*} applicantData
 * @param {*} uraPrn
 * @returns
 */
const downloadApplicationFormPdf = async (
  sections,
  formId,
  applicant,
  institutionName,
  institutionSlogan,
  institutionAddress,
  institutionWebsite,
  institutionEmail,
  institutionTel1,
  institutionTel2,
  institutionLogoPath,
  academicYear,
  intake,
  degreeCategory,
  schemeName,
  amount,
  currency,
  paymentStatus,
  admissionDescription,
  applicantData,
  uraPrn
) => {
  try {
    // Create a document
    const doc = new PDFDocument({ margin: 30, size: 'A4' });

    // Pipe its output somewhere, like to a file or HTTP response
    const stream = doc.pipe(
      fs.createWriteStream(
        `${path.join(
          appConfig.ASSETS_ROOT_DIRECTORY,
          'admissions/application-forms'
        )}/${formId}.pdf`
      )
    );

    if (institutionLogoPath) {
      doc
        .image(`${institutionLogoPath}`, 260, 10, {
          width: 100,
          align: 'center',
        })
        .moveDown();
    }

    doc
      .font('Helvetica-Bold')
      .fontSize(13)
      .fillColor('black')
      .moveDown()
      .text(`${institutionName} `, 100, 100, {
        align: 'center',
      })
      .moveDown()
      .text('OFFICE OF THE ACADEMIC REGISTRAR', 100, 180, {
        align: 'center',
      })
      .moveDown()
      .fillColor('gray')
      .text(
        `${academicYear} - ${intake} - ${degreeCategory} -  ${schemeName}`,
        100,
        220,
        {
          align: 'center',
        }
      )
      .moveDown()
      .font('Helvetica-Bold')
      .fontSize(10)
      .fillColor('blue')
      .text(`Form Id: ${formId}`, 100, 300, { align: 'right' })
      .text(`Application Fee: ${amount} ${currency}`, 100, 320, {
        align: 'right',
      })
      .text(
        `Payment Reference Number: ${uraPrn !== null ? uraPrn : ''} `,
        100,
        340,
        {
          align: 'right',
        }
      )
      .text(`Payment Status: ${paymentStatus}`, 100, 360, { align: 'right' })
      .fillColor('black')
      .text(
        `Applicant: ${applicantData.surname} ${applicantData.other_names}`,
        100,
        600,
        {
          align: 'left',
        }
      )
      .text(`Email: ${applicantData.email}`, 100, 620, {
        align: 'left',
      })
      .text(`Phone Number: ${applicantData.phone}`, 100, 640, {
        align: 'left',
      })
      .moveDown();

    const checkBioData = sections.find((item) =>
      item.metadata_value.includes('BIO')
    );

    const checkALevelALevel = sections.find((item) =>
      item.metadata_value.includes('A LEVEL')
    );

    const checkOLevelALevel = sections.find((item) =>
      item.metadata_value.includes('O LEVEL')
    );

    const checkChoices = sections.find((item) =>
      item.metadata_value.includes('CHOICES')
    );

    const checkDiplomaQualification = sections.find((item) =>
      item.metadata_value.includes('DIPLOMA')
    );

    const checkRelevantQualification = sections.find((item) =>
      item.metadata_value.includes('RELEVANT')
    );

    const checkOtherQualification = sections.find((item) =>
      item.metadata_value.includes('OTHER')
    );

    const checkRefereeDetails = sections.find((item) =>
      item.metadata_value.includes('REFEREE')
    );

    const checkEmploymentDetails = sections.find((item) =>
      item.metadata_value.includes('EMPLOYMENT')
    );

    const checkPermanentAddress = sections.find((item) =>
      item.metadata_value.includes('PERMANENT')
    );

    const checkNextOfKin = sections.find((item) =>
      item.metadata_value.includes('NEXT')
    );

    if (checkBioData) {
      const findForm = await getBioInformation(formId, applicant);

      if (findForm) {
        doc
          .addPage()
          .font('Helvetica-Bold')
          .fontSize(20)
          .fillColor('red')
          .text(`BIO INFORMATION`, 100, 10, { align: 'center' })
          .fontSize(10)
          .fillColor('#444444')
          .text(`Salutation: ${findForm.salutation.metadata_value}`, 100, 50)
          .text(`Surname: ${findForm.surname}`, 100, 70)
          .text(`Other Names: ${findForm.other_names}`, 100, 90)
          .text(`Phone Number: ${findForm.phone}`, 100, 130)
          .text(`Email: ${findForm.email}`, 100, 150)
          .text(`Date Of Birth: ${findForm.date_of_birth}`, 100, 170)
          .text(
            `District Of Origin: ${
              findForm.district_of_origin !== null
                ? findForm.district_of_origin
                : ''
            }`,
            100,
            190
          )
          .text(`Gender: ${findForm.gender}`, 100, 210)
          .text(
            `Religion: ${findForm.religion !== null ? findForm.religion : ''}`,
            100,
            230
          )
          .text(
            `Marital Status: ${
              findForm.marital_status !== null ? findForm.marital_status : ''
            }`,
            100,
            250
          )
          .text(`Nationality: ${findForm.nationality}`, 100, 270)
          .text(
            `National Id Number: ${
              findForm.national_id_number !== null
                ? findForm.national_id_number
                : ''
            }`,
            100,
            290
          )
          .text(
            `Passport Id Number: ${
              findForm.passport_id_number !== null
                ? findForm.passport_id_number
                : ''
            }`,
            100,
            310
          )
          .text(
            `Emis Number: ${
              findForm.emis_id_number !== null ? findForm.emis_id_number : ''
            }`,
            100,
            330
          )
          .text(`Place Of Residence: ${findForm.place_of_residence}`, 100, 350)
          .text(`District Of Birth: ${findForm.district_of_birth}`, 100, 370)
          .text(
            `Disability Details: ${
              findForm.disability_details !== null
                ? findForm.disability_details
                : ''
            }`,
            100,
            390
          )
          .moveDown();

        if (checkPermanentAddress && checkNextOfKin) {
          const permanentForm = await getPermanentAddressDetails(
            formId,
            applicant
          );

          const nextOfKinForm = await getNextOfKinDetails(formId, applicant);

          doc
            .fillColor('red')
            .text(`NEXT OF KIN DETAILS`, 100, 410)
            .fillColor('black')
            .text(
              `Name: ${
                nextOfKinForm.next_of_kin_name !== null
                  ? nextOfKinForm.next_of_kin_name
                  : ''
              }`,
              100,
              430
            )
            .text(
              `Relationship: ${
                nextOfKinForm.next_of_kin_relationship !== null
                  ? nextOfKinForm.next_of_kin_relationship
                  : ''
              }`,
              100,
              450
            )
            .text(
              `Phone Number: ${
                nextOfKinForm.next_of_kin_phone !== null
                  ? nextOfKinForm.next_of_kin_phone
                  : ''
              }`,
              100,
              470
            )
            .text(
              `Email: ${
                nextOfKinForm.next_of_kin_email !== null
                  ? nextOfKinForm.next_of_kin_email
                  : ''
              }`,
              100,
              490
            )
            .text(
              `Address: ${
                nextOfKinForm.next_of_kin_address !== null
                  ? nextOfKinForm.next_of_kin_address
                  : ''
              }`,
              100,
              490
            );

          doc
            .fillColor('red')
            .text(`PERMANENT ADDRESS DETAILS`, 100, 510)
            .fillColor('black')
            .text(
              `Village: ${
                permanentForm.village !== null ? permanentForm.village : ''
              }`,
              100,
              530
            )
            .text(
              `Sub County: ${
                permanentForm.sub_county !== null
                  ? permanentForm.sub_county
                  : ''
              }`,
              100,
              550
            )
            .text(
              `District: ${
                permanentForm.district !== null ? permanentForm.district : ''
              }`,
              100,
              570
            );
        } else if (checkPermanentAddress && !checkNextOfKin) {
          const permanentForm = await getPermanentAddressDetails(
            formId,
            applicant
          );

          doc
            .fillColor('red')
            .text(`PERMANENT ADDRESS DETAILS`, 100, 410)
            .fillColor('black')
            .text(
              `Village: ${
                permanentForm.village !== null ? permanentForm.village : ''
              }`,
              100,
              430
            )
            .text(
              `Sub County: ${
                permanentForm.sub_county !== null
                  ? permanentForm.sub_county
                  : ''
              }`,
              100,
              450
            )
            .text(
              `District: ${
                permanentForm.district !== null ? permanentForm.district : ''
              }`,
              100,
              470
            );
        } else if (!checkPermanentAddress && checkNextOfKin) {
          const nextOfKinForm = await getNextOfKinDetails(formId, applicant);

          doc
            .fillColor('red')
            .text(`NEXT OF KIN DETAILS`, 100, 410)
            .fillColor('black')
            .text(
              `Name: ${
                nextOfKinForm.next_of_kin_name !== null
                  ? nextOfKinForm.next_of_kin_name
                  : ''
              }`,
              100,
              430
            )
            .text(
              `Relationship: ${
                nextOfKinForm.next_of_kin_relationship !== null
                  ? nextOfKinForm.next_of_kin_relationship
                  : ''
              }`,
              100,
              450
            )
            .text(
              `Phone Number: ${
                nextOfKinForm.next_of_kin_phone !== null
                  ? nextOfKinForm.next_of_kin_phone
                  : ''
              }`,
              100,
              470
            )
            .text(
              `Email: ${
                nextOfKinForm.next_of_kin_email !== null
                  ? nextOfKinForm.next_of_kin_email
                  : ''
              }`,
              100,
              490
            )
            .text(
              `Address: ${
                nextOfKinForm.next_of_kin_address !== null
                  ? nextOfKinForm.next_of_kin_address
                  : ''
              }`,
              100,
              490
            );
        }
      }
    }

    if (checkALevelALevel) {
      const findForm = await getALevelInformation(formId, applicant);

      if (findForm) {
        const pic = await axios({
          method: 'get',
          url: findForm.photo,
          responseType: 'arraybuffer',
        })
          .then(function (response) {
            // handle success
            return response;
          })
          .catch(function (error) {
            // handle error
            throw new Error(error);
          });

        doc
          .addPage()
          .font('Helvetica-Bold')
          .fontSize(20)
          .fillColor('red')
          .text(`A-LEVEL INFORMATION`, 100, 10, { align: 'center' })
          .moveDown();

        if (parseInt(pic.status, 10) === 200 && pic.data) {
          doc
            .image(pic.data, 100, 45, {
              width: 100,
            })
            .moveDown()
            .moveDown()
            .moveDown()
            .moveDown()
            .moveDown()
            .moveDown();
        }

        doc
          .fillColor('#444444')
          .fontSize(10)
          .text(`Student: ${findForm.name}`, 100, 50, {
            align: 'right',
          })
          .text(`Index Number: ${findForm.index_number}`, 100, 65, {
            align: 'right',
          })
          .text(`School Name: ${findForm.school_name}`, 100, 80, {
            align: 'right',
          })
          .text(`Center Number: ${findForm.center_no}`, 100, 95, {
            align: 'right',
          })
          .text(`Exam Year: ${findForm.exam_year}`, 100, 110, {
            align: 'right',
          })
          .text(
            `Aggregate: ${findForm.summary.aggregate}, Result Code: ${findForm.summary.result_code}`,
            100,
            125,
            {
              align: 'right',
            }
          )
          .moveDown()
          .moveDown()
          .moveDown()
          .moveDown()
          .moveDown()
          .moveDown();

        const aLevelSubjectsTable = {
          title: 'A-LEVEL SUBJECTS',
          headers: [
            {
              label: 'Code',
              property: 'code',
              width: 80,
              renderer: null,
            },
            {
              label: 'Subject Name',
              property: 'name',
              width: 100,
              renderer: null,
            },
            {
              label: 'Result',
              property: 'result',
              width: 80,
              renderer: null,
            },
            {
              label: 'Score',
              property: 'score',
              width: 60,
              renderer: null,
            },
          ],
          rows: [],
        };

        findForm.subjects.forEach((subject) => {
          aLevelSubjectsTable.rows.push([
            ` ${subject.code}`,
            subject.name,
            subject.result,
            subject.interpretation,
          ]);
        });

        // draw the table
        doc.table(aLevelSubjectsTable, {
          columnSpacing: 6,
          outerWidth: 800,
          prepareHeader: () => doc.font('Helvetica-Bold').fontSize(8),
          prepareRow: (row, indexColumn, indexRow, rectRow) => {
            doc.font('Helvetica').fontSize(8);
            indexColumn === 0 && doc.addBackground(rectRow, 'blue', 0.15);
          },
        });
      }
    }

    if (checkOLevelALevel) {
      const findForm = await getOLevelInformation(formId, applicant);

      if (findForm) {
        const pic = await axios({
          method: 'get',
          url: findForm.photo,
          responseType: 'arraybuffer',
        })
          .then(function (response) {
            // handle success
            return response;
          })
          .catch(function (error) {
            // handle error
            throw new Error(error);
          });

        doc
          .addPage()
          .font('Helvetica-Bold')
          .fontSize(20)
          .fillColor('red')
          .text(`O-LEVEL INFORMATION`, 100, 10, { align: 'center' })
          .moveDown();

        if (parseInt(pic.status, 10) === 200 && pic.data) {
          doc
            .image(pic.data, 100, 45, {
              width: 100,
            })
            .moveDown()
            .moveDown();
        }

        doc
          .fillColor('#444444')
          .fontSize(10)
          .text(`Student: ${findForm.name}`, 100, 50, {
            align: 'right',
          })
          .text(`Index Number: ${findForm.index_number}`, 100, 65, {
            align: 'right',
          })
          .text(`School Name: ${findForm.school_name}`, 100, 80, {
            align: 'right',
          })
          .text(`Center Number: ${findForm.center_no}`, 100, 95, {
            align: 'right',
          })
          .text(`Exam Year: ${findForm.exam_year}`, 100, 110, {
            align: 'right',
          })
          .text(
            `Aggregate: ${findForm.summary.aggregate}, Division: ${findForm.summary.division}`,
            100,
            125,
            {
              align: 'right',
            }
          )
          .text(`Distinctions: ${findForm.distinctions}`, 100, 140, {
            align: 'right',
          })
          .text(`Credits: ${findForm.credits}`, 100, 155, {
            align: 'right',
          })
          .text(`Passes: ${findForm.passes}`, 100, 170, {
            align: 'right',
          })
          .text(`Failures: ${findForm.failures}`, 100, 185, {
            align: 'right',
          })
          .moveDown()
          .moveDown();

        const oLevelSubjectsTable = {
          title: 'O-LEVEL SUBJECTS',
          headers: [
            {
              label: 'Code',
              property: 'code',
              width: 80,
              renderer: null,
            },
            {
              label: 'Subject Name',
              property: 'name',
              width: 100,
              renderer: null,
            },
            {
              label: 'Result',
              property: 'result',
              width: 80,
              renderer: null,
            },
            {
              label: 'Score',
              property: 'score',
              width: 60,
              renderer: null,
            },
          ],
          rows: [],
        };

        findForm.subjects.forEach((subject) => {
          oLevelSubjectsTable.rows.push([
            ` ${subject.code}`,
            subject.name,
            subject.result,
            subject.interpretation,
          ]);
        });

        // draw the table
        doc.table(oLevelSubjectsTable, {
          columnSpacing: 6,
          prepareHeader: () => doc.font('Helvetica-Bold').fontSize(8),
          prepareRow: (row, indexColumn, indexRow, rectRow) => {
            doc.font('Helvetica').fontSize(8);
            indexColumn === 0 && doc.addBackground(rectRow, 'blue', 0.15);
          },
        });
      }
    }

    if (checkChoices) {
      const findForm = await getChoicesInformation(formId, applicant);

      if (!isEmpty(findForm)) {
        doc
          .addPage({
            size: 'LEGAL',
            layout: 'landscape',
          })
          .font('Helvetica-Bold')
          .fontSize(20)
          .fillColor('red')
          .text(`PROGRAMME CHOICES`, 100, 10, { align: 'center' })
          .fillColor('#444444')
          .moveDown()
          .moveDown();

        const programmeChoicesTable = {
          title: 'PROGRAMME CHOICES',
          headers: [
            {
              label: 'Code',
              property: 'code',
              width: 100,
              renderer: null,
            },
            {
              label: 'Programme Title',
              property: 'programme',
              width: 100,
              renderer: null,
            },
            {
              label: 'Choice Number',
              property: 'number',
              width: 100,
              renderer: null,
            },
            {
              label: 'Campus',
              property: 'campus',
              width: 100,
              renderer: null,
            },
            {
              label: 'Study Time',
              property: 'programme_type',
              width: 100,
              renderer: null,
            },
            {
              label: 'Sponsorship',
              property: 'sponsorship',
              width: 100,
              renderer: null,
            },
            {
              label: 'Entry Year',
              property: 'entry_study_year',
              width: 100,
              renderer: null,
            },
          ],
          rows: [],
        };

        findForm.forEach((choice) => {
          programmeChoicesTable.rows.push([
            choice.programme_code,
            choice.programme_title,
            ` ${choice.choice_number}`,
            choice.campus,
            choice.programme_type,
            choice.sponsorship,
            choice.entry_study_year,
          ]);
        });

        // draw the table
        doc.table(programmeChoicesTable, {
          columnSpacing: 6,
          prepareHeader: () => doc.font('Helvetica-Bold').fontSize(8),
          prepareRow: (row, indexColumn, indexRow, rectRow) => {
            doc.font('Helvetica').fontSize(8);
            indexColumn === 0 && doc.addBackground(rectRow, 'blue', 0.15);
          },
        });
      }
    }

    if (checkDiplomaQualification) {
      const findForm = await getDiplomaQualification(formId, applicant);

      if (findForm) {
        doc
          .addPage({
            size: 'LEGAL',
            layout: 'landscape',
          })
          .font('Helvetica-Bold')
          .fontSize(20)
          .fillColor('red')
          .text(`DIPLOMA QUALIFICATIONS`, 100, 10, { align: 'center' })
          .fillColor('#444444')
          .moveDown()
          .moveDown();

        const diplomaTable = {
          title: 'DIPLOMA QUALIFICATIONS',
          headers: [
            {
              label: 'Institution',
              property: 'institution',
              width: 100,
              renderer: null,
            },
            {
              label: 'Award',
              property: 'award',
              width: 100,
              renderer: null,
            },
            {
              label: 'Awarding Body',
              property: 'body',
              width: 100,
              renderer: null,
            },
            {
              label: 'Grade',
              property: 'grade',
              width: 100,
              renderer: null,
            },
            {
              label: 'Award Classification',
              property: 'classification',
              width: 100,
              renderer: null,
            },
            {
              label: 'Award Type',
              property: 'type',
              width: 100,
              renderer: null,
            },
            {
              label: 'Award Duration',
              property: 'duration',
              width: 100,
              renderer: null,
            },
          ],
          rows: [],
        };

        findForm.forEach((qualification) => {
          diplomaTable.rows.push([
            qualification.institution_name !== null
              ? ` ${qualification.institution_name}`
              : '',
            qualification.award_obtained !== null
              ? qualification.award_obtained
              : '',
            qualification.awarding_body !== null
              ? qualification.awarding_body
              : '',
            qualification.grade_obtained !== null
              ? qualification.grade_obtained
              : '',
            qualification.award_classification !== null
              ? qualification.award_classification
              : null,
            qualification.award_type !== null ? qualification.award_type : '',
            qualification.award_duration !== null
              ? qualification.award_duration
              : '',
          ]);
        });

        // draw the table
        doc.table(diplomaTable, {
          columnSpacing: 6,
          prepareHeader: () => doc.font('Helvetica-Bold').fontSize(8),
          prepareRow: (row, indexColumn, indexRow, rectRow) => {
            doc.font('Helvetica').fontSize(8);
            indexColumn === 0 && doc.addBackground(rectRow, 'blue', 0.15);
          },
        });
      }
    }

    if (checkRelevantQualification) {
      const findForm = await getRelevantQualification(formId, applicant);

      if (findForm) {
        doc
          .addPage({
            size: 'LEGAL',
            layout: 'landscape',
          })
          .font('Helvetica-Bold')
          .fontSize(20)
          .fillColor('red')
          .text(`RELEVANT QUALIFICATIONS`, 100, 10, { align: 'center' })
          .fillColor('#444444')
          .moveDown()
          .moveDown();

        const relevantTable = {
          title: 'RELEVANT QUALIFICATIONS',
          headers: [
            {
              label: 'Institution',
              property: 'institution',
              width: 100,
              renderer: null,
            },
            {
              label: 'Award',
              property: 'award',
              width: 100,
              renderer: null,
            },
            {
              label: 'Awarding Body',
              property: 'body',
              width: 100,
              renderer: null,
            },
            {
              label: 'Grade',
              property: 'grade',
              width: 100,
              renderer: null,
            },
            {
              label: 'Award Classification',
              property: 'classification',
              width: 100,
              renderer: null,
            },
            {
              label: 'Award Type',
              property: 'type',
              width: 100,
              renderer: null,
            },
            {
              label: 'Award Duration',
              property: 'duration',
              width: 100,
              renderer: null,
            },
          ],
          rows: [],
        };

        findForm.forEach((qualification) => {
          relevantTable.rows.push([
            qualification.institution_name !== null
              ? ` ${qualification.institution_name}`
              : '',
            qualification.award_obtained !== null
              ? qualification.award_obtained
              : '',
            qualification.awarding_body !== null
              ? qualification.awarding_body
              : '',
            qualification.grade_obtained !== null
              ? qualification.grade_obtained
              : '',
            qualification.award_classification !== null
              ? qualification.award_classification
              : null,
            qualification.award_type !== null ? qualification.award_type : '',
            qualification.award_duration !== null
              ? qualification.award_duration
              : '',
          ]);
        });

        // draw the table
        doc.table(relevantTable, {
          columnSpacing: 6,
          prepareHeader: () => doc.font('Helvetica-Bold').fontSize(8),
          prepareRow: (row, indexColumn, indexRow, rectRow) => {
            doc.font('Helvetica').fontSize(8);
            indexColumn === 0 && doc.addBackground(rectRow, 'blue', 0.15);
          },
        });
      }
    }

    if (checkOtherQualification) {
      const findForm = await getOtherQualification(formId, applicant);

      if (findForm) {
        doc
          .addPage({
            size: 'LEGAL',
            layout: 'landscape',
          })
          .font('Helvetica-Bold')
          .fontSize(20)
          .fillColor('red')
          .text(`OTHER QUALIFICATIONS`, 100, 10, { align: 'center' })
          .fillColor('#444444')
          .moveDown()
          .moveDown();

        const otherTable = {
          title: 'OTHER QUALIFICATIONS',
          headers: [
            {
              label: 'Institution',
              property: 'institution',
              width: 100,
              renderer: null,
            },
            {
              label: 'Award',
              property: 'award',
              width: 100,
              renderer: null,
            },
            {
              label: 'Awarding Body',
              property: 'body',
              width: 100,
              renderer: null,
            },
            {
              label: 'Grade',
              property: 'grade',
              width: 100,
              renderer: null,
            },
            {
              label: 'Award Classification',
              property: 'classification',
              width: 100,
              renderer: null,
            },
            {
              label: 'Award Type',
              property: 'type',
              width: 100,
              renderer: null,
            },
            {
              label: 'Award Duration',
              property: 'duration',
              width: 100,
              renderer: null,
            },
          ],
          rows: [],
        };

        findForm.forEach((qualification) => {
          otherTable.rows.push([
            qualification.institution_name !== null
              ? ` ${qualification.institution_name}`
              : '',
            qualification.award_obtained !== null
              ? qualification.award_obtained
              : '',
            qualification.awarding_body !== null
              ? qualification.awarding_body
              : '',
            qualification.grade_obtained !== null
              ? qualification.grade_obtained
              : '',
            qualification.award_classification !== null
              ? qualification.award_classification
              : null,
            qualification.award_type !== null ? qualification.award_type : '',
            qualification.award_duration !== null
              ? qualification.award_duration
              : '',
          ]);
        });

        // draw the table
        doc.table(otherTable, {
          columnSpacing: 6,
          prepareHeader: () => doc.font('Helvetica-Bold').fontSize(8),
          prepareRow: (row, indexColumn, indexRow, rectRow) => {
            doc.font('Helvetica').fontSize(8);
            indexColumn === 0 && doc.addBackground(rectRow, 'blue', 0.15);
          },
        });
      }
    }

    if (checkRefereeDetails) {
      const findForm = await getRefereeDetails(formId, applicant);

      if (findForm) {
        doc
          .addPage()
          .font('Helvetica-Bold')
          .fontSize(20)
          .fillColor('red')
          .text(`REFEREE DETAILS`, 100, 10, { align: 'center' })
          .fillColor('#444444')
          .moveDown()
          .moveDown();

        const refereeTable = {
          title: 'REFEREE DETAILS',
          headers: [
            {
              label: 'Name',
              property: 'name',
              width: 100,
              renderer: null,
            },
            {
              label: 'Email',
              property: 'email',
              width: 100,
              renderer: null,
            },
            {
              label: 'Phone Number',
              property: 'phone',
              width: 100,
              renderer: null,
            },
            {
              label: 'Address',
              property: 'grade',
              width: 100,
              renderer: null,
            },
          ],
          rows: [],
        };

        findForm.forEach((qualification) => {
          refereeTable.rows.push([
            qualification.referee_name !== null
              ? ` ${qualification.referee_name}`
              : '',
            qualification.referee_email !== null
              ? qualification.referee_email
              : '',
            qualification.referee_phone !== null
              ? qualification.referee_phone
              : '',
            qualification.referee_address !== null
              ? qualification.referee_address
              : '',
          ]);
        });

        // draw the table
        doc.table(refereeTable, {
          columnSpacing: 6,
          prepareHeader: () => doc.font('Helvetica-Bold').fontSize(8),
          prepareRow: (row, indexColumn, indexRow, rectRow) => {
            doc.font('Helvetica').fontSize(8);
            indexColumn === 0 && doc.addBackground(rectRow, 'blue', 0.15);
          },
        });
      }
    }

    if (checkEmploymentDetails) {
      const findForm = await getEmploymentDetails(formId, applicant);

      if (findForm) {
        doc
          .addPage()
          .font('Helvetica-Bold')
          .fontSize(20)
          .fillColor('red')
          .text(`EMPLOYMENT DETAILS`, 100, 10, { align: 'center' })
          .fillColor('#444444')
          .moveDown()
          .moveDown();

        const employmentTable = {
          title: 'EMPLOYMENT DETAILS',
          headers: [
            {
              label: 'Employer',
              property: 'employer',
              width: 100,
              renderer: null,
            },
            {
              label: 'Post Held',
              property: 'post_held',
              width: 100,
              renderer: null,
            },
            {
              label: 'Start Date',
              property: 'employment_start_date',
              width: 100,
              renderer: null,
            },
            {
              label: 'End Date',
              property: 'employment_end_date',
              width: 100,
              renderer: null,
            },
          ],
          rows: [],
        };

        findForm.forEach((qualification) => {
          employmentTable.rows.push([
            qualification.employer !== null ? ` ${qualification.employer}` : '',
            qualification.post_held !== null ? qualification.post_held : '',
            qualification.employment_start_date !== null
              ? qualification.employment_start_date
              : '',
            qualification.employment_end_date !== null
              ? qualification.employment_end_date
              : '',
          ]);
        });

        // draw the table
        doc.table(employmentTable, {
          columnSpacing: 6,
          prepareHeader: () => doc.font('Helvetica-Bold').fontSize(8),
          prepareRow: (row, indexColumn, indexRow, rectRow) => {
            doc.font('Helvetica').fontSize(8);
            indexColumn === 0 && doc.addBackground(rectRow, 'blue', 0.15);
          },
        });
      }
    }

    // Finalize The PDF and End The Stream
    doc.end();

    return {
      stream: stream,
      docPath: `${path.join(
        appConfig.ASSETS_ROOT_DIRECTORY,
        'admissions/application-forms'
      )}/${formId}.pdf`,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} formId
 * @param {*} applicant
 * @returns
 */
const getBioInformation = async (formId, applicant) => {
  const result = await applicantBioDataService
    .findOneApplicantBioData({
      where: {
        form_id: formId,
        applicant_id: applicant,
      },
      ...getApplicantBioDataAttributes(),
      nest: true,
    })
    .then(function (res) {
      if (res) {
        const result = res.toJSON();

        return result;
      }
    });

  return result;
};

/**
 *
 * @param {*} formId
 * @param {*} applicant
 * @returns
 */
const getALevelInformation = async (formId, applicant) => {
  const result = await applicantALevelDataService
    .findOneApplicantALevelData({
      where: {
        form_id: formId,
        applicant_id: applicant,
      },
      ...getApplicantALevelDataAttributes(),
      nest: true,
    })
    .then(function (res) {
      if (res) {
        const result = res.toJSON();

        return result;
      }
    });

  return result;
};

/**
 *
 * @param {*} formId
 * @param {*} applicant
 * @returns
 */
const getOLevelInformation = async (formId, applicant) => {
  const result = await applicantOLevelDataService
    .findOneApplicantOLevelData({
      where: {
        form_id: formId,
        applicant_id: applicant,
      },
      ...getApplicantOLevelDataAttributes(),
      nest: true,
    })
    .then(function (res) {
      if (res) {
        const result = res.toJSON();

        return result;
      }
    });

  return result;
};

/**
 *
 * @param {*} formId
 * @param {*} applicant
 * @returns
 */
const getDiplomaQualification = async (formId, applicant) => {
  const result =
    await applicantDiplomaQualificationService.findAllApplicantDiplomaQualifications(
      {
        where: {
          form_id: formId,
          applicant_id: applicant,
        },
        raw: true,
      }
    );

  return result;
};

/**
 *
 * @param {*} formId
 * @param {*} applicant
 * @returns
 */
const getRelevantQualification = async (formId, applicant) => {
  const result =
    await applicantRelevantQualificationService.findAllApplicantRelevantQualifications(
      {
        where: {
          form_id: formId,
          applicant_id: applicant,
        },
        raw: true,
      }
    );

  return result;
};

/**
 *
 * @param {*} formId
 * @param {*} applicant
 * @returns
 */
const getCertificateQualification = async (formId, applicant) => {
  const result =
    await applicantCertificateQualificationService.findAllApplicantCertificateQualifications(
      {
        where: {
          form_id: formId,
          applicant_id: applicant,
        },
        raw: true,
      }
    );

  return result;
};

/**
 *
 * @param {*} formId
 * @param {*} applicant
 * @returns
 */
const getBachelorsQualification = async (formId, applicant) => {
  const result =
    await applicantBachelorsQualificationService.findAllApplicantBachelorsQualifications(
      {
        where: {
          form_id: formId,
          applicant_id: applicant,
        },
        raw: true,
      }
    );

  return result;
};

/**
 *
 * @param {*} formId
 * @param {*} applicant
 * @returns
 */
const getMastersQualification = async (formId, applicant) => {
  const result =
    await applicantMastersQualificationService.findAllApplicantMastersQualifications(
      {
        where: {
          form_id: formId,
          applicant_id: applicant,
        },
        raw: true,
      }
    );

  return result;
};

/**
 *
 * @param {*} formId
 * @param {*} applicant
 * @returns
 */
const getOtherQualification = async (formId, applicant) => {
  const result =
    await applicantOtherQualificationService.findAllApplicantOtherQualifications(
      {
        where: {
          form_id: formId,
          applicant_id: applicant,
        },
        raw: true,
      }
    );

  return result;
};

/**
 *
 * @param {*} formId
 * @param {*} applicant
 * @returns
 */
const getRefereeDetails = async (formId, applicant) => {
  const result =
    await applicantRefereeDetailService.findAllApplicantRefereeDetails({
      where: {
        form_id: formId,
        applicant_id: applicant,
      },
      raw: true,
    });

  return result;
};

/**
 *
 * @param {*} formId
 * @param {*} applicant
 * @returns
 */
const getEmploymentDetails = async (formId, applicant) => {
  const result =
    await applicantEmploymentRecordService.findAllApplicantEmploymentRecords({
      where: {
        form_id: formId,
        applicant_id: applicant,
      },
      raw: true,
    });

  return result;
};

/**
 *
 * @param {*} formId
 * @param {*} applicant
 * @returns
 */
const getPermanentAddressDetails = async (formId, applicant) => {
  const result =
    await applicantPermanentAddressService.findOneApplicantPermanentAddress({
      where: {
        form_id: formId,
        applicant_id: applicant,
      },
      raw: true,
    });

  return result;
};

/**
 *
 * @param {*} formId
 * @param {*} applicant
 * @returns
 */
const getNextOfKinDetails = async (formId, applicant) => {
  const result = await applicantNextOfKinService.findOneApplicantNextOfKin({
    where: {
      form_id: formId,
      applicant_id: applicant,
    },
    raw: true,
  });

  return result;
};

/**
 *
 * @param {*} formId
 * @param {*} applicant
 * @returns
 */
const getAttachmentDetails = async (formId, applicant) => {
  const result = await applicantAttachmentService.findAllApplicantAttachments({
    where: {
      form_id: formId,
      applicant_id: applicant,
    },
    raw: true,
  });

  return result;
};

/**
 *
 * @param {*} formId
 * @param {*} applicant
 * @returns
 */
const getChoicesInformation = async (formId, applicant) => {
  const context = { form_id: formId, applicant_id: applicant };

  const result = await applicantProgrammeChoiceService.applicantProgrammeChoice(
    context
  );

  return result;
};

const getApplicantALevelDataAttributes = function () {
  return {
    include: ['applicant', 'runningAdmission', 'subjects'],
  };
};

const getApplicantOLevelDataAttributes = function () {
  return {
    include: ['applicant', 'runningAdmission', 'subjects'],
  };
};

const getApplicantBioDataAttributes = function () {
  return {
    include: [
      {
        association: 'salutation',
        attributes: ['id', 'metadata_value'],
      },
    ],
  };
};

/**
 *
 * @param {*} runningAdmissionId
 */
const checkRunningAdmissionExpiry = async (runningAdmissionId) => {
  const runningAdmission = await runningAdmissionService
    .findOneRunningAdmission({
      where: {
        id: runningAdmissionId,
        admission_start_date: {
          [Op.lte]: moment.now(),
        },
        admission_end_date: {
          [Op.gte]: moment.now(),
        },
      },
    })
    .then(function (res) {
      if (res) {
        const result = res.toJSON();

        return result;
      }
    });

  if (!runningAdmission) {
    throw new Error(`Running Admission Is No Longer Active.`);
  }

  return runningAdmission;
};

/**
 *
 * @param {*} runningAdmissionId
 * @param {*} applicantId
 * @returns
 */
const checkRunningAdmissionMaximumNumberOfFormsConstraint = async (
  runningAdmissionId,
  applicantId
) => {
  try {
    const runningAdmission =
      await runningAdmissionService.findOneRunningAdmission({
        where: {
          id: runningAdmissionId,
        },
        attributes: ['id', 'number_of_choices', 'maximum_number_of_forms'],
        raw: true,
      });

    if (!runningAdmission) {
      throw new Error(`Running Admission Record Not Found.`);
    }

    const findRunningAdmissionApplicant =
      await runningAdmissionApplicantService.findAllRunningAdmissionApplicants({
        where: {
          running_admission_id: runningAdmissionId,
          applicant_id: applicantId,
        },
        attributes: ['id', 'form_id', 'application_status'],
        raw: true,
      });

    if (
      parseInt(findRunningAdmissionApplicant.length, 10) >=
      parseInt(runningAdmission.maximum_number_of_forms, 10)
    ) {
      throw new Error(
        `You Have Reached The Maximum Number Of Forms Allowed For This Running Admission.`
      );
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} runningAdmissionId
 * @param {*} applicantId
 * @returns
 */
const checkRunningAdmissionMaximumNumberOfChoicesConstraint = async (
  runningAdmissionId,
  applicantId
) => {
  try {
    const runningAdmission =
      await runningAdmissionService.findOneRunningAdmission({
        where: {
          id: runningAdmissionId,
        },
        attributes: ['id', 'number_of_choices', 'maximum_number_of_forms'],
        raw: true,
      });

    if (!runningAdmission) {
      throw new Error(`Running Admission Record Not Found.`);
    }

    const findApplicantProgrammeChoices =
      applicantProgrammeChoiceService.findAllApplicantProgrammeChoices({
        where: {
          running_admission_id: runningAdmissionId,
          applicant_id: applicantId,
        },
        attributes: ['id', 'form_id'],
        raw: true,
      });

    if (
      parseInt(findApplicantProgrammeChoices.length, 10) >
      parseInt(runningAdmission.number_of_choices, 10)
    ) {
      throw new Error(
        `You Have Reached The Maximum Number Of Programme Choices Allowed For This Running Admission.`
      );
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} formId
 * @param {*} applicant
 */
const checkFormInProgressStatus = async (formId, applicant) => {
  try {
    const runningAdmissionApplicant = await runningAdmissionApplicantService
      .findOneRunningAdmissionApplicant({
        where: {
          form_id: formId,
          applicant_id: applicant,
        },
        ...getRunningAdmissionApplicantAttributes(),
        nest: true,
      })
      .then(function (res) {
        if (res) {
          const result = res.toJSON();

          return result;
        }
      });

    if (!runningAdmissionApplicant) {
      throw new Error(`Unable To Find Record.`);
    }

    if (!runningAdmissionApplicant.application_status.includes('IN-PROGRESS')) {
      throw new Error(
        `You Cannot Alter Your Application After Final Submission.`
      );
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} formId
 * @param {*} applicant
 * @returns
 */
const displayApplicantFormSections = async (formId, applicant) => {
  let data = [];

  const runningAdmissionApplicant = await runningAdmissionApplicantService
    .findOneRunningAdmissionApplicant({
      where: {
        form_id: formId,
      },
      ...getRunningAdmissionApplicantAttributes(),
      nest: true,
    })
    .then(function (res) {
      if (res) {
        const result = res.toJSON();

        return result;
      }
    });

  if (!runningAdmissionApplicant) {
    throw new Error(`Unable To Find Record.`);
  }

  if (!applicant) {
    applicant = runningAdmissionApplicant.applicant_id;
  }

  const checkBioData = runningAdmissionApplicant.sections.find((item) =>
    item.metadata_value.includes('BIO')
  );

  const checkALevelALevel = runningAdmissionApplicant.sections.find((item) =>
    item.metadata_value.includes('A LEVEL')
  );

  const checkOLevelALevel = runningAdmissionApplicant.sections.find((item) =>
    item.metadata_value.includes('O LEVEL')
  );

  const checkChoices = runningAdmissionApplicant.sections.find((item) =>
    item.metadata_value.includes('CHOICES')
  );

  const checkDiplomaQualification = runningAdmissionApplicant.sections.find(
    (item) => item.metadata_value.includes('DIPLOMA')
  );

  const checkRelevantQualification = runningAdmissionApplicant.sections.find(
    (item) => item.metadata_value.includes('RELEVANT')
  );

  const checkCertificateQualification = runningAdmissionApplicant.sections.find(
    (item) => item.metadata_value.includes('CERTIFICATE')
  );

  const checkBachelorsQualification = runningAdmissionApplicant.sections.find(
    (item) => item.metadata_value.includes('BACHELOR')
  );

  const checkMastersQualification = runningAdmissionApplicant.sections.find(
    (item) => item.metadata_value.includes('MASTER')
  );

  const checkOtherQualification = runningAdmissionApplicant.sections.find(
    (item) => item.metadata_value.includes('OTHER')
  );

  const checkRefereeDetails = runningAdmissionApplicant.sections.find((item) =>
    item.metadata_value.includes('REFEREE')
  );

  const checkEmploymentDetails = runningAdmissionApplicant.sections.find(
    (item) => item.metadata_value.includes('EMPLOYMENT')
  );

  const checkPermanentAddress = runningAdmissionApplicant.sections.find(
    (item) => item.metadata_value.includes('PERMANENT')
  );

  const checkNextOfKin = runningAdmissionApplicant.sections.find((item) =>
    item.metadata_value.includes('NEXT')
  );

  const checkAttachments = runningAdmissionApplicant.sections.find((item) =>
    item.metadata_value.includes('ATTACHMENTS')
  );

  const expectedFormSection =
    runningAdmissionApplicant.runningAdmission.admissionForm.sections.map(
      (item) => {
        const compare =
          runningAdmissionApplicant.runningAdmission.admissionForm.formSections.find(
            (value) =>
              parseInt(value.form_section_id, 10) === parseInt(item.id, 10)
          );

        return {
          ...item,
          section_number: compare.section_number,
        };
      }
    );

  const checkExpectedBioData = expectedFormSection.find((item) =>
    item.metadata_value.includes('BIO')
  );
  const checkExpectedALevel = expectedFormSection.find((item) =>
    item.metadata_value.includes('A LEVEL')
  );
  const checkExpectedOLevel = expectedFormSection.find((item) =>
    item.metadata_value.includes('O LEVEL')
  );
  const checkExpectedProgrammeChoices = expectedFormSection.find((item) =>
    item.metadata_value.includes('CHOICES')
  );
  const checkExpectedDiplomaData = expectedFormSection.find((item) =>
    item.metadata_value.includes('DIPLOMA')
  );
  const checkExpectedRelevantData = expectedFormSection.find((item) =>
    item.metadata_value.includes('RELEVANT')
  );
  const checkExpectedCertificateData = expectedFormSection.find((item) =>
    item.metadata_value.includes('CERTIFICATE')
  );
  const checkExpectedBachelorsData = expectedFormSection.find((item) =>
    item.metadata_value.includes('BACHELOR')
  );
  const checkExpectedMastersData = expectedFormSection.find((item) =>
    item.metadata_value.includes('MASTER')
  );
  const checkExpectedOtherdata = expectedFormSection.find((item) =>
    item.metadata_value.includes('OTHER')
  );
  const checkExpectedRefereeDetails = expectedFormSection.find((item) =>
    item.metadata_value.includes('REFEREE')
  );
  const checkExpectedEmploymentRecords = expectedFormSection.find((item) =>
    item.metadata_value.includes('EMPLOYMENT')
  );
  const checkExpectedPermanentRecords = expectedFormSection.find((item) =>
    item.metadata_value.includes('PERMANENT')
  );
  const checkExpectedNextOfKinRecords = expectedFormSection.find((item) =>
    item.metadata_value.includes('NEXT')
  );
  const checkExpectedAttachmentRecords = expectedFormSection.find((item) =>
    item.metadata_value.includes('ATTACHMENTS')
  );

  if (checkExpectedBioData) {
    if (checkBioData) {
      const orderNumber = expectedFormSection.find(
        (item) => parseInt(item.id, 10) === parseInt(checkBioData.id, 10)
      );
      const findForm = await getBioInformation(formId, applicant);

      data.push({
        order_number: orderNumber ? orderNumber.section_number : 0,
        bio_information: findForm,
      });
    } else {
      data.push({
        order_number: checkExpectedBioData.section_number,
        bio_information: {},
      });
    }
  }

  if (checkExpectedALevel) {
    if (checkALevelALevel) {
      const orderNumber = expectedFormSection.find(
        (item) => parseInt(item.id, 10) === parseInt(checkALevelALevel.id, 10)
      );
      const findForm = await getALevelInformation(formId, applicant);

      data.push({
        order_number: orderNumber ? orderNumber.section_number : 0,
        a_level_information: findForm,
      });
    } else {
      data.push({
        order_number: checkExpectedALevel.section_number,
        a_level_information: {},
      });
    }
  }

  if (checkExpectedOLevel) {
    if (checkOLevelALevel) {
      const orderNumber = expectedFormSection.find(
        (item) => parseInt(item.id, 10) === parseInt(checkOLevelALevel.id, 10)
      );

      const findForm = await getOLevelInformation(formId, applicant);

      data.push({
        order_number: orderNumber ? orderNumber.section_number : 0,
        o_level_information: findForm,
      });
    } else {
      data.push({
        order_number: checkExpectedOLevel.section_number,
        o_level_information: {},
      });
    }
  }

  if (checkExpectedProgrammeChoices) {
    if (checkChoices) {
      const orderNumber = expectedFormSection.find(
        (item) => parseInt(item.id, 10) === parseInt(checkChoices.id, 10)
      );

      const findForm = await getChoicesInformation(formId, applicant);

      data.push({
        order_number: orderNumber ? orderNumber.section_number : 0,
        programme_choices: findForm,
      });
    } else {
      data.push({
        order_number: checkExpectedProgrammeChoices.section_number,
        programme_choices: [],
      });
    }
  }

  if (checkExpectedDiplomaData) {
    if (checkDiplomaQualification) {
      const orderNumber = expectedFormSection.find(
        (item) =>
          parseInt(item.id, 10) === parseInt(checkDiplomaQualification.id, 10)
      );

      const findForm = await getDiplomaQualification(formId, applicant);

      data.push({
        order_number: orderNumber ? orderNumber.section_number : 0,
        diploma_qualifications: findForm,
      });
    } else {
      data.push({
        order_number: checkExpectedDiplomaData.section_number,
        diploma_qualifications: [],
      });
    }
  }

  if (checkExpectedRelevantData) {
    if (checkRelevantQualification) {
      const orderNumber = expectedFormSection.find(
        (item) =>
          parseInt(item.id, 10) === parseInt(checkRelevantQualification.id, 10)
      );

      const findForm = await getRelevantQualification(formId, applicant);

      data.push({
        order_number: orderNumber ? orderNumber.section_number : 0,
        relevant_qualifications: findForm,
      });
    } else {
      data.push({
        order_number: checkExpectedRelevantData.section_number,
        relevant_qualifications: [],
      });
    }
  }

  if (checkExpectedCertificateData) {
    if (checkCertificateQualification) {
      const orderNumber = expectedFormSection.find(
        (item) =>
          parseInt(item.id, 10) ===
          parseInt(checkCertificateQualification.id, 10)
      );

      const findForm = await getCertificateQualification(formId, applicant);

      data.push({
        order_number: orderNumber ? orderNumber.section_number : 0,
        certificate_qualifications: findForm,
      });
    } else {
      data.push({
        order_number: checkExpectedCertificateData.section_number,
        certificate_qualifications: [],
      });
    }
  }

  if (checkExpectedBachelorsData) {
    if (checkBachelorsQualification) {
      const orderNumber = expectedFormSection.find(
        (item) =>
          parseInt(item.id, 10) === parseInt(checkBachelorsQualification.id, 10)
      );

      const findForm = await getBachelorsQualification(formId, applicant);

      data.push({
        order_number: orderNumber ? orderNumber.section_number : 0,
        bachelors_qualifications: findForm,
      });
    } else {
      data.push({
        order_number: checkExpectedBachelorsData.section_number,
        bachelors_qualifications: [],
      });
    }
  }

  if (checkExpectedMastersData) {
    if (checkMastersQualification) {
      const orderNumber = expectedFormSection.find(
        (item) =>
          parseInt(item.id, 10) === parseInt(checkMastersQualification.id, 10)
      );

      const findForm = await getMastersQualification(formId, applicant);

      data.push({
        order_number: orderNumber ? orderNumber.section_number : 0,
        masters_qualifications: findForm,
      });
    } else {
      data.push({
        order_number: checkExpectedMastersData.section_number,
        masters_qualifications: [],
      });
    }
  }

  if (checkExpectedOtherdata) {
    if (checkOtherQualification) {
      const orderNumber = expectedFormSection.find(
        (item) =>
          parseInt(item.id, 10) === parseInt(checkOtherQualification.id, 10)
      );

      const findForm = await getOtherQualification(formId, applicant);

      data.push({
        order_number: orderNumber ? orderNumber.section_number : 0,
        other_qualifications: findForm,
      });
    } else {
      data.push({
        order_number: checkExpectedOtherdata.section_number,
        other_qualifications: [],
      });
    }
  }

  if (checkExpectedRefereeDetails) {
    if (checkRefereeDetails) {
      const orderNumber = expectedFormSection.find(
        (item) => parseInt(item.id, 10) === parseInt(checkRefereeDetails.id, 10)
      );
      const findForm = await getRefereeDetails(formId, applicant);

      data.push({
        order_number: orderNumber ? orderNumber.section_number : 0,
        referee_details: findForm,
      });
    } else {
      data.push({
        order_number: checkExpectedRefereeDetails.section_number,
        referee_details: [],
      });
    }
  }

  if (checkExpectedEmploymentRecords) {
    if (checkEmploymentDetails) {
      const orderNumber = expectedFormSection.find(
        (item) =>
          parseInt(item.id, 10) === parseInt(checkEmploymentDetails.id, 10)
      );
      const findForm = await getEmploymentDetails(formId, applicant);

      data.push({
        order_number: orderNumber ? orderNumber.section_number : 0,
        employment_details: findForm,
      });
    } else {
      data.push({
        order_number: checkExpectedEmploymentRecords.section_number,
        employment_details: [],
      });
    }
  }

  if (checkExpectedPermanentRecords) {
    if (checkPermanentAddress) {
      const orderNumber = expectedFormSection.find(
        (item) =>
          parseInt(item.id, 10) === parseInt(checkPermanentAddress.id, 10)
      );

      const findForm = await getPermanentAddressDetails(formId, applicant);

      data.push({
        order_number: orderNumber ? orderNumber.section_number : 0,
        permanent_address: findForm,
      });
    } else {
      data.push({
        order_number: checkExpectedPermanentRecords.section_number,
        permanent_address: {},
      });
    }
  }

  if (checkExpectedNextOfKinRecords) {
    if (checkNextOfKin) {
      const orderNumber = expectedFormSection.find(
        (item) => parseInt(item.id, 10) === parseInt(checkNextOfKin.id, 10)
      );

      const findForm = await getNextOfKinDetails(formId, applicant);

      data.push({
        order_number: orderNumber ? orderNumber.section_number : 0,
        next_of_kin: findForm,
      });
    } else {
      data.push({
        order_number: checkExpectedNextOfKinRecords.section_number,
        next_of_kin: {},
      });
    }
  }

  if (checkExpectedAttachmentRecords) {
    if (checkAttachments) {
      const orderNumber = expectedFormSection.find(
        (item) => parseInt(item.id, 10) === parseInt(checkAttachments.id, 10)
      );
      const findForm = await getAttachmentDetails(formId, applicant);

      data.push({
        order_number: orderNumber ? orderNumber.section_number : 0,
        attachments: findForm,
      });
    } else {
      data.push({
        order_number: checkExpectedAttachmentRecords.section_number,
        attachments: [],
      });
    }
  }

  data = orderBy(data, ['order_number'], ['asc']);

  return data;
};

const getRunningAdmissionApplicantAttributes = function () {
  return {
    include: [
      {
        association: 'sections',
        attributes: ['id', 'metadata_value'],
        through: {
          attributes: [],
        },
      },
      {
        association: 'runningAdmission',
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
          {
            association: 'admissionForm',
            attributes: ['id', 'form_name', 'form_description'],
            include: [
              {
                association: 'sections',
                attributes: ['id', 'metadata_value'],
                through: {
                  attributes: [],
                },
              },
              {
                association: 'formSections',
                attributes: ['id', 'form_section_id', 'section_number'],
              },
            ],
          },
        ],
      },
      {
        association: 'applicant',
        attributes: ['id', 'surname', 'other_names', 'email', 'phone'],
      },
    ],
  };
};

/**
 *
 * @param {*} findRunningAdmissionApplicant
 * @param {*} formId
 */
const billApplicants = async (
  findRunningAdmissionApplicant,
  formId,
  applicant
) => {
  const data = {};

  const findRunningAdmission = await runningAdmissionService
    .findOneRunningAdmission({
      where: {
        id: findRunningAdmissionApplicant.running_admission_id,
      },
      include: [
        {
          association: 'applicationFees',
          include: [
            {
              association: 'amounts',
              attributes: [
                'id',
                'policy_id',
                'billing_category_id',
                'currency_id',
                'amount',
              ],
              include: [
                {
                  association: 'billingCategory',
                  attributes: ['metadata_value'],
                },
                {
                  association: 'currency',
                  attributes: ['metadata_value'],
                },
              ],
            },
          ],
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

  const findApplicantBioData =
    await applicantBioDataService.findOneApplicantBioData({
      where: {
        form_id: formId,
      },
      raw: true,
    });

  if (!findApplicantBioData) {
    throw new Error(
      `Unable To Find Applicant's Bio-Data Section With Form-Id ${formId}.`
    );
  }
  const metadataValues = await metadataValueService.findAllMetadataValues({
    include: {
      association: 'metadata',
      attributes: ['id', 'metadata_name'],
    },
    attributes: ['id', 'metadata_value'],
  });

  if (toUpper(findApplicantBioData.nationality).includes('UGANDA')) {
    const findBillingCategoryId = getMetadataValueId(
      metadataValues,
      'UGANDAN',
      'BILLING CATEGORIES'
    );

    const findApplicationFee =
      findRunningAdmission.applicationFees.amounts.find(
        (item) =>
          parseInt(item.billing_category_id, 10) ===
          parseInt(findBillingCategoryId, 10)
      );

    if (findApplicationFee) {
      data.amount = findApplicationFee.amount;
      data.currency = findApplicationFee.currency.metadata_value;
    } else {
      const findBillingCategoryId = getMetadataValueId(
        metadataValues,
        'EAST-AFRICAN',
        'BILLING CATEGORIES'
      );

      const findApplicationFee =
        findRunningAdmission.applicationFees.amounts.find(
          (item) =>
            parseInt(item.billing_category_id, 10) ===
            parseInt(findBillingCategoryId, 10)
        );

      if (findApplicationFee) {
        data.amount = findApplicationFee.amount;
        data.currency = findApplicationFee.currency.metadata_value;
      } else {
        throw new Error(
          `Unable To Find Application Fees Policy For Either Ugandan Or East African Students.`
        );
      }
    }
  } else if (
    toUpper(findApplicantBioData.nationality).includes('KENYA') ||
    toUpper(findApplicantBioData.nationality).includes('TANZANIA') ||
    toUpper(findApplicantBioData.nationality).includes('RWANDA') ||
    toUpper(findApplicantBioData.nationality).includes('SOUTH SUDAN') ||
    toUpper(findApplicantBioData.nationality).includes('BURUNDI')
  ) {
    const findBillingCategoryId = getMetadataValueId(
      metadataValues,
      'EAST-AFRICAN',
      'BILLING CATEGORIES'
    );

    const findApplicationFee =
      findRunningAdmission.applicationFees.amounts.find(
        (item) =>
          parseInt(item.billing_category_id, 10) ===
          parseInt(findBillingCategoryId, 10)
      );

    if (findApplicationFee) {
      data.amount = findApplicationFee.amount;
      data.currency = findApplicationFee.currency.metadata_value;
    } else {
      throw new Error(
        `Unable To Find Application Fees Policy For East African Students.`
      );
    }
  } else {
    const findNonEastAfricanBillingCategoryId = getMetadataValueIdWithoutError(
      metadataValues,
      'NON EAST-AFRICAN',
      'BILLING CATEGORIES'
    );

    const findInternationalsBillingCategoryId = getMetadataValueIdWithoutError(
      metadataValues,
      'INTERNATIONAL',
      'BILLING CATEGORIES'
    );

    const findApplicationFee =
      findRunningAdmission.applicationFees.amounts.find(
        (item) =>
          parseInt(item.billing_category_id, 10) ===
            parseInt(findNonEastAfricanBillingCategoryId, 10) ||
          parseInt(item.billing_category_id, 10) ===
            parseInt(findInternationalsBillingCategoryId, 10)
      );

    if (findApplicationFee) {
      data.amount = findApplicationFee.amount;
      data.currency = findApplicationFee.currency.metadata_value;
    } else {
      throw new Error(
        `Unable To Find Application Fees Policy For International Students.`
      );
    }
  }

  const getProgrammeChoices =
    await applicantProgrammeChoiceService.findAllApplicantProgrammeChoices({
      where: {
        form_id: formId,
        applicant_id: applicant.id,
      },
      attributes: ['id', 'programme_campus_id'],
      include: [
        {
          association: 'programmeCampus',
          attributes: ['id', 'running_admission_programme_id'],
          include: [
            {
              association: 'runningAdmissionProgramme',
              attributes: ['id', 'activate_special_fees'],
            },
          ],
        },
      ],
      raw: true,
      nest: true,
    });

  if (isEmpty(getProgrammeChoices)) {
    throw new Error(`Unable To Find Programme Choices`);
  }

  const choicesWithSpecialFees = [];

  for (const choice of getProgrammeChoices) {
    if (
      choice.programmeCampus.runningAdmissionProgramme.activate_special_fees ===
      true
    ) {
      const findSpecialFees = await runningAdmissionProgrammeService
        .findOneRunningAdmissionProgramme({
          where: {
            id: choice.programmeCampus.runningAdmissionProgramme.id,
          },
          attributes: ['id'],
          include: [
            {
              association: 'specialFees',
              attributes: ['id', 'account_id', 'special_fee_name'],
              include: [
                {
                  association: 'account',
                  attributes: ['id', 'account_code', 'account_name'],
                },
                {
                  association: 'amounts',
                  attributes: [
                    'id',
                    'billing_category_id',
                    'currency_id',
                    'amount',
                  ],
                  include: [
                    {
                      association: 'billingCategory',
                      attributes: ['id', 'metadata_value'],
                    },
                    {
                      association: 'currency',
                      attributes: ['id', 'metadata_value'],
                    },
                  ],
                },
              ],
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

      choicesWithSpecialFees.push(findSpecialFees);
    }
  }

  if (!isEmpty(choicesWithSpecialFees)) {
    const specialAmounts = [];

    choicesWithSpecialFees.forEach((choice) => {
      if (toUpper(findApplicantBioData.nationality).includes('UGANDA')) {
        const findBillingCategoryId = getMetadataValueId(
          metadataValues,
          'UGANDAN',
          'BILLING CATEGORIES'
        );

        choice.specialFees.forEach((specialFee) => {
          const findSpecialFeeAmount = specialFee.amounts.find(
            (item) =>
              parseInt(item.billing_category_id, 10) ===
              parseInt(findBillingCategoryId, 10)
          );

          if (findSpecialFeeAmount) {
            specialAmounts.push({
              special_amount: parseInt(findSpecialFeeAmount.amount, 10),
            });

            if (
              toUpper(trim(data.currency)) !==
              toUpper(trim(findSpecialFeeAmount.currency.metadata_value))
            ) {
              throw new Error(
                `Unable To Bill You Because Of ${specialFee.special_fee_name} Currency Conflicts. Please Contact An Administrator For Assistance.`
              );
            }
          } else {
            const findBillingCategoryId = getMetadataValueId(
              metadataValues,
              'EAST-AFRICAN',
              'BILLING CATEGORIES'
            );

            const findSpecialFeeAmount = specialFee.amounts.find(
              (item) =>
                parseInt(item.billing_category_id, 10) ===
                parseInt(findBillingCategoryId, 10)
            );

            if (findSpecialFeeAmount) {
              specialAmounts.push({
                special_amount: parseInt(findSpecialFeeAmount.amount, 10),
              });

              if (
                toUpper(trim(data.currency)) !==
                toUpper(trim(findSpecialFeeAmount.currency.metadata_value))
              ) {
                throw new Error(
                  `Unable To Bill You Because Of ${specialFee.special_fee_name} Currency Conflicts. Please Contact An Administrator For Assistance.`
                );
              }
            } else {
              throw new Error(
                `Unable To Find ${specialFee.special_fee_name} For Either Ugandan Or East African Students.`
              );
            }
          }
        });
      } else if (
        toUpper(findApplicantBioData.nationality).includes('KENYA') ||
        toUpper(findApplicantBioData.nationality).includes('TANZANIA') ||
        toUpper(findApplicantBioData.nationality).includes('RWANDA') ||
        toUpper(findApplicantBioData.nationality).includes('SOUTH SUDAN') ||
        toUpper(findApplicantBioData.nationality).includes('BURUNDI')
      ) {
        const findBillingCategoryId = getMetadataValueId(
          metadataValues,
          'EAST-AFRICAN',
          'BILLING CATEGORIES'
        );

        choice.specialFees.forEach((specialFee) => {
          const findSpecialFeeAmount = specialFee.amounts.find(
            (item) =>
              parseInt(item.billing_category_id, 10) ===
              parseInt(findBillingCategoryId, 10)
          );

          if (findSpecialFeeAmount) {
            specialAmounts.push({
              special_amount: parseInt(findSpecialFeeAmount.amount, 10),
            });

            if (
              toUpper(trim(data.currency)) !==
              toUpper(trim(findSpecialFeeAmount.currency.metadata_value))
            ) {
              throw new Error(
                `Unable To Bill You Because Of ${specialFee.special_fee_name} Currency Conflicts. Please Contact An Administrator For Assistance.`
              );
            }
          } else {
            throw new Error(
              `Unable To Find ${specialFee.special_fee_name} For East African Students.`
            );
          }
        });
      } else {
        const findNonEastAfricanBillingCategoryId =
          getMetadataValueIdWithoutError(
            metadataValues,
            'NON EAST-AFRICAN',
            'BILLING CATEGORIES'
          );

        const findInternationalsBillingCategoryId =
          getMetadataValueIdWithoutError(
            metadataValues,
            'INTERNATIONAL',
            'BILLING CATEGORIES'
          );

        choice.specialFees.forEach((specialFee) => {
          const findSpecialFeeAmount = specialFee.amounts.find(
            (item) =>
              parseInt(item.billing_category_id, 10) ===
                parseInt(findNonEastAfricanBillingCategoryId, 10) ||
              parseInt(item.billing_category_id, 10) ===
                parseInt(findInternationalsBillingCategoryId, 10)
          );

          if (findSpecialFeeAmount) {
            specialAmounts.push({
              special_amount: parseInt(findSpecialFeeAmount.amount, 10),
            });

            if (
              toUpper(trim(data.currency)) !==
              toUpper(trim(findSpecialFeeAmount.currency.metadata_value))
            ) {
              throw new Error(
                `Unable To Bill You Because Of ${specialFee.special_fee_name} Currency Conflicts. Please Contact An Administrator For Assistance.`
              );
            }
          } else {
            throw new Error(
              `Unable To Find ${specialFee.special_fee_name} For International Students.`
            );
          }
        });
      }
    });

    if (!isEmpty(specialAmounts)) {
      const totalSpecialFees = sumBy(specialAmounts, 'special_amount');

      data.amount = parseInt(data.amount, 10) + totalSpecialFees;
    }
  }

  return data;
};

module.exports = {
  checkRunningAdmissionExpiry,
  checkRunningAdmissionMaximumNumberOfFormsConstraint,
  checkRunningAdmissionMaximumNumberOfChoicesConstraint,
  downloadApplicationFormPdf,
  getBioInformation,
  getALevelInformation,
  getOLevelInformation,
  getDiplomaQualification,
  getRelevantQualification,
  getCertificateQualification,
  getBachelorsQualification,
  getMastersQualification,
  getOtherQualification,
  getRefereeDetails,
  getEmploymentDetails,
  getChoicesInformation,
  getPermanentAddressDetails,
  getNextOfKinDetails,
  getAttachmentDetails,
  checkFormInProgressStatus,
  displayApplicantFormSections,
  billApplicants,
};
