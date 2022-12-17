const PDFTableDocument = require('pdfkit-table');
const path = require('path');
const fs = require('fs');
const moment = require('moment');
const { appConfig } = require('@root/config');
const {
  feesStructureFunction,
} = require('@controllers/Helpers/feesStructureHelpers');
const {
  flatten,
  sumBy,
  orderBy,
  isEmpty,
  isArray,
  toUpper,
  map,
  words,
} = require('lodash');

class MUKDocumentHelper {
  async printMAKAdmissionLetter(student) {
    const admissionLetterName = `MAK-${student.studentNumber}.pdf`;
    const studentFees = await getStudentFeesStructure(student);
    const pdfDoc = new PDFTableDocument({
      size: 'A4',
      layout: 'portrait',
      margin: 40,
      permissions: {
        copying: false,
        modifying: false,
        fillingForms: false,
      },
      info: {
        Author: 'MANZEDE BENARD <manzede@gmail.com>',
        Title: 'PROVISIONAL ADMISSION LETTER',
        Creator: 'MAKERERE UNIVERSITY',
        Keywords: 'UNDERGRADUATE ADMISSION LETTER, UNIVERSITY ADMISSION',
      },
    });

    const mukTemplatePath = path.join(
      appConfig.ASSETS_ROOT_DIRECTORY,
      `documents/templates/MAK`
    );

    pdfDoc
      .image(path.join(`${mukTemplatePath}/MAK-BG.png`), 100, 240, {
        align: 'center',
        fit: [400, 500],
        valign: 'center',
      })
      .opacity(0.1);

    pdfDoc
      .lineGap(1)
      .opacity(1)
      .font('Times-Bold')
      .fontSize(24)
      .moveDown(0.8)
      .text('MAKERERE', {
        bold: true,
        align: 'left',
        indent: 70,
      })
      .image(path.join(`${mukTemplatePath}/makerere.jpg`), 260, 30, {
        align: 'center',
        fit: [70, 70],
      })
      .moveUp()
      .text('UNIVERSITY', {
        bold: true,
        align: 'left',
        indent: 300,
      });

    pdfDoc
      .moveDown(0.1)
      .opacity(1)
      .fontSize(12)
      .text('OFFICE OF THE ACADEMIC REGISTRAR', {
        align: 'center',
      })
      .moveDown(0.2)
      .font('Times-Roman')
      .fontSize(11)
      .text(
        'P. O. Box 7062, Kampala­ Uganda,  Tel: +256 414 533332, Fax: +256 414 534125 ',
        {
          align: 'center',
        }
      )
      .moveDown(0.2)
      .text('E­mail: ar@acadreg.mak.ac.ug, Website: http://www.mak.ac.ug', {
        align: 'center',
        link: 'http://www.mak.ac.ug',
      });

    pdfDoc
      .moveDown(2)
      .fontSize(14)
      .font('Times-Bold')
      .text('PROVISIONAL ADMISSION LETTER', {
        align: 'center',
        underline: true,
      })
      .moveDown()
      .fontSize(12)
      .font('Times-Roman')
      .text('NAME:')
      .moveUp()
      .font('Times-Bold')
      .text(student.name, {
        indent: 50,
      })
      .moveDown()
      .font('Times-Roman')
      .text('REG. NO.:')
      .moveUp()
      .font('Times-Bold')
      .text(student.registrationNumber || 'N/A', {
        indent: 60,
      })
      .font('Times-Roman')
      .moveUp(0.8)
      .text('DATE:', {
        indent: 300,
      })
      .moveUp()
      .font('Times-Bold')
      .text(student.printDate, {
        indent: 340,
      })
      .moveDown()
      .font('Times-Roman')
      .text('STUDENT NO.: ')
      .moveUp()
      .font('Times-Bold')
      .text(student.studentNumber || 'N/A', {
        indent: 90,
      })
      .font('Times-Roman')
      .moveUp(0.8)
      .text('HALL:', {
        indent: 300,
      })
      .moveUp()
      .font('Times-Bold')
      .text(student.hall_of_attachment || 'N/A', {
        indent: 340,
      })
      .moveDown()
      .font('Times-Roman')
      .text('Dear Sir/Madam,')
      .moveDown()
      .font('Times-Bold')
      .fontSize(14)
      .text(
        `PROVISIONAL ADMISSION LETTER TO ACADEMIC YEAR ${student.academicYear}`,
        {
          align: 'center',
          underline: true,
        }
      )
      .fontSize(12)
      .font('Times-Roman')
      .moveDown()
      .text(
        'I am pleased to inform you that you have been offered a place on a programme of study leading to the following award:'
      )
      .moveDown()
      .font('Times-Bold')
      .fontSize(11)
      .text(
        `${student.programmeTitle} - (${
          student.alias_code || student.programmeCode
        })`,
        {
          align: 'center',
        }
      )
      .fontSize(12)
      .font('Times-Roman')
      .moveDown()
      .text(
        'This is a provisional offer subject to payment of 60% Tuition and all Functional Fees before issuance of Admission Letter from the Directorate of Research and Graduate Training. The new tuition policy states as follows:'
      )
      .moveDown()
      .text(
        'i. All privately sponsored students should pay 60% tuition at the beginning of every semester and full functional fees at beginning of the 1st Semester.'
      )
      .moveDown()
      .text(
        'ii. All privately sponsored first year students should pay 60% tuition and all functional fees before issuance of admission letters.'
      )
      .moveDown()
      .text(
        'iii. All students should have paid 100% tuition by the end of the 6th week of the semester.'
      )
      .moveDown()
      .text(
        'iv. Any student, who would not have paid 100% tuition by the 6th week, should have paid all functional fees and 60% of the tuition fees if they are to be allowed to do 60% of the course load.'
      )
      .moveDown()
      .text('See detailed Fees Structure on the next page.')
      .image(path.join(`${mukTemplatePath}/ARSignature.png`), {
        width: 200,
        height: 50,
      })
      .text('Alfred Masikye Namoah,')
      .moveDown()
      .font('Times-Bold')
      .text('ACADEMIC REGISTRAR');

    feesStructurePage(studentFees, pdfDoc);

    // write out file
    pdfDoc.end();
    pdfDoc.pipe(
      fs.createWriteStream(
        path.join(
          appConfig.ASSETS_ROOT_DIRECTORY,
          `documents/admissions/letters/${admissionLetterName}`
        )
      )
    );

    return admissionLetterName;
  }

  /**
   * PRINT MAKERERE UNIVERSITY UNDERGRADUATE PROVISIONAL ADMISSION LETTER FOR A SINGLE STUDENT
   * Author: MANZEDE BENARD
   * DATE CREATED: 03-DEC-2021
   * @param {*} student
   * @returns string
   *
   */
  printMAKOriginalGraduateAdmissionLetter(student) {
    const admissionLetterName = `MAKGRAD-${student.studentNumber}.pdf`;

    const pdfDoc = new PDFTableDocument({
      size: 'A4',
      layout: 'portrait',
      margin: 50,
      permissions: {
        copying: false,
        modifying: false,
        fillingForms: false,
      },
      info: {
        Author: 'MANZEDE BENARD <manzede@gmail.com>',
        Title: 'ORIGINAL GRADUATE ADMISSION LETTER',
        Creator: 'MAKERERE UNIVERSITY',
        Keywords: 'ORIGINAL GRADUATE ADMISSION LETTER, UNIVERSITY ADMISSION',
      },
    });

    const mukTemplatePath = path.join(
      appConfig.ASSETS_ROOT_DIRECTORY,
      `documents/templates/MAK`
    );

    const [startYear, endYear] = words(student.academicYear);

    pdfDoc
      .image(path.join(`${mukTemplatePath}/MAK-BG.png`), 100, 240, {
        align: 'center',
        fit: [400, 500],
        valign: 'center',
      })
      .opacity(0.1);

    pdfDoc
      .moveDown(9.5)
      .opacity(1)
      .fontSize(12)
      .font('Times-Roman')
      .text('NAME:')
      .moveUp()
      .font('Times-Bold')
      .text(student.name, {
        indent: 50,
      })
      .font('Times-Roman')
      .moveDown()
      .text('DATE:')
      .moveUp()
      .font('Times-Bold')
      .text(student.printDate, {
        indent: 50,
      })
      .moveDown()
      .font('Times-Roman')
      .text('REG. NO.:')
      .moveUp()
      .font('Times-Bold')
      .text(student.registrationNumber || 'N/A', {
        indent: 60,
      })
      .moveDown()
      .font('Times-Roman')
      .text('STUDENT NO.: ')
      .moveUp()
      .font('Times-Bold')
      .text(student.studentNumber || 'N/A', {
        indent: 90,
      })

      .moveDown()
      .font('Times-Roman')
      .text('Dear Sir/Madam,')
      .moveDown()
      .font('Times-Bold')
      .fontSize(14)
      .text(`ADMISSION TO A MASTER'S DEGREE PROGRAMME`, {
        align: 'center',
        underline: true,
      })
      .fontSize(11.5)
      .font('Times-Roman')
      .moveDown()
      .text(
        'I am pleased to inform you that you have been offered a place on a programme of study leading to the following award:'
      )
      .moveDown()
      .font('Times-Bold')
      .text(
        `${student.programmeTitle} - (${
          student.alias_code || student.programmeCode
        })`,
        {
          align: 'center',
        }
      )
      .moveUp(0.5)
      .font('Times-Roman')
      .text(
        '..........................................................................................................................................................................'
      )
      .moveDown()
      .text(
        'Your registration is by: .................................................................................................',
        {
          indent: 50,
        }
      )
      .moveUp(1.2)
      .font('Times-Bold')
      .text(student.admissionType, {
        indent: 200,
      })
      .font('Times-Roman')
      .moveDown()
      .text(
        'Effective from academic year ........................  and expires at the end of academic year ........................',
        {
          indent: 20,
        }
      )
      .moveUp(1.2)
      .font('Times-Bold')
      .text(`${startYear}/${endYear}`, {
        indent: 170,
      })
      .moveUp(1)
      .text(
        `${
          parseInt(startYear, 10) +
          (parseInt(student.programmeDuration, 10) - 1)
        }/${
          parseInt(endYear, 10) + (parseInt(student.programmeDuration, 10) - 1)
        }`,
        {
          indent: 430,
        }
      )
      .font('Times-Roman')
      .moveDown(2)
      .text(
        'You are required to register within one month with effect from .................................... Failure to do so will automatically lead to your place being forfeited to another candidate.'
      )
      .font('Times-Bold')
      .moveUp(2.2)
      .text(moment(student.reportDate).format('Do MMMM YYYY'), {
        indent: 300,
      })
      .moveDown(2)
      .text(
        'Please NOTE that your admission to this programme is provisional and subject to verification of your academic qualifications stated in the application form at the time of registration. ',
        {
          continued: true,
        }
      )
      .font('Times-Roman')
      .text(
        'It is important that you register, since your name will not appear on the list of Graduate students until you have finalized registration procedures. Registration will take place at your College/School.',
        {
          continued: false,
        }
      )
      .moveDown()
      .text(
        'Please bring two recent passport size photographs and two Photostat copies of the following documents where applicable:'
      )
      .moveDown()
      .text("1. 'O' Level Certificate", {
        indent: 20,
      })
      .text("2. 'A' Level Certificate", {
        indent: 20,
      })
      .text('3. Diploma Certificate(s) if any', {
        indent: 20,
      })
      .moveUp(3)
      .text("4. Bachelor's Certificate(s) and Transcript", {
        indent: 185,
      })
      .text("5. Master's Certificate(s) and Transcript", {
        indent: 185,
      })
      .text(
        '6. Identity Card of the former University/Institution or National ID',
        {
          indent: 185,
        }
      )
      .moveDown()
      .font('Times-Italic')
      .text(
        'The original documents will be required for verification purposes.'
      )
      .font('Times-Roman')
      .moveDown()
      .font('Times-Bold')
      .text(
        'Cases of impersonation, falsification of documents or giving false/incomplete information whenever discovered either at registration or afterwards, will lead to automatic cancellation of admission.'
      )
      .font('Times-Roman')
      .moveDown()
      .addPage()
      .text('You will however be required to renew your registration ', {
        continued: true,
      })
      .font('Times-Bold')
      .text('every Semester after a satisfactory progress report', {
        continued: true,
      })
      .font('Times-Roman')
      .text(
        ' is received from your College/School. You will also be required to apply for extension of your registration (at a fee as may be applicable), if you realize you cannot finalize your studies within the specified completion period indicated above. You are advised to study the content of the graduate joining instructions provided on this link: ',
        {
          continued: true,
        }
      )
      .fillColor('blue')
      .text(
        'https://rgt.mak.ac.ug/joining-instructions-fees-structure-20222023',
        {
          link: 'https://rgt.mak.ac.ug/joining-instructions-fees-structure-20222023',
          underline: true,
          continued: false,
        }
      )
      .fillColor('black')
      .moveDown()
      .text(
        'All fees are payable in full at the beginning of the Academic Year or in installments at the beginning of each Semester. '
      )
      .moveDown()
      .text(
        'The University council reserves the right to change fees with or without prior notice. Payment of fees can be made to any of the banks provided in the Graduate joining instructions.'
      )
      .moveDown()
      .text('You are advised to study the contents of the attached ', {
        continued: true,
      })
      .font('Times-Bold')
      .text('Joining Instructions', {
        continued: true,
      })
      .font('Times-Roman')
      .text(' carefully and comply with whatever Instructions therein', {
        continued: false,
      })
      .moveDown()
      .font('Times-Bold')
      .text('NOTE:', {
        continued: true,
      })
      .font('Times-Roman')
      .text(
        ' The running of programmes in Colleges/Schools will depend on the number of students who report for registration. Please note that there is a maximum period you can spend on the programme, beyond which you consider yourself de-registered.',
        {
          continued: false,
        }
      )
      .moveDown()
      .text(
        'I congratulate you upon your admission to Makerere University and on behalf of the University; I extend to you a Warm welcome and wish you success in your studies. '
      )
      .image(path.join(`${mukTemplatePath}/ARSignature.png`), {
        width: 200,
        height: 50,
      })
      .text('Alfred Masikye Namoah,')
      .moveDown()
      .font('Times-Bold')
      .text('ACADEMIC REGISTRAR')
      .moveDown()
      .text('C.C.', {
        continued: true,
      })
      .font('Times-Roman')
      .text(' The Principal/Dean, ', {
        continued: true,
      })
      .font('Times-Bold')
      .text(student.collegeTitle, { continued: false, underline: true });

    // write out file
    pdfDoc.end();
    pdfDoc.pipe(
      fs.createWriteStream(
        path.join(
          appConfig.ASSETS_ROOT_DIRECTORY,
          `documents/admissions/letters/${admissionLetterName}`
        )
      )
    );

    return admissionLetterName;
  }

  /**
   * PRINT MAKERERE UNIVERSITY UNDERGRADUATE PROVISIONAL ADMISSION LETTER FOR A SINGLE STUDENT
   * Author: MANZEDE BENARD
   * DATE CREATED: 03-DEC-2021
   * @param {*} student
   * @returns string
   *
   */
  async printMakUNDERGRADAdmissionLetter(student) {
    const admissionLetterName = `MAKPROV-${student.studentNumber}.pdf`;
    const studentFees = await getStudentFeesStructure(student);
    const pdfDoc = new PDFTableDocument({
      size: 'A4',
      layout: 'portrait',
      margin: 40,
      permissions: {
        copying: false,
        modifying: false,
        fillingForms: false,
      },
      info: {
        Author: 'MANZEDE BENARD <manzede@gmail.com>',
        Title: 'PROVISIONAL ADMISSION LETTER',
        Creator: 'MAKERERE UNIVERSITY',
        Keywords: 'UNDERGRADUATE ADMISSION LETTER, UNIVERSITY ADMISSION',
      },
    });

    const mukTemplatePath = path.join(
      appConfig.ASSETS_ROOT_DIRECTORY,
      `documents/templates/MAK`
    );

    let subjectComb = 'N/A';

    if (student.data && !isEmpty(student.data.subjects)) {
      subjectComb = map(
        student.data.subjects,
        (subject) => subject.subject_code
      ).join('/');
    }

    pdfDoc
      .image(path.join(`${mukTemplatePath}/MAK-BG.png`), 100, 240, {
        align: 'center',
        fit: [400, 500],
        valign: 'center',
      })
      .opacity(0.1);

    pdfDoc
      .lineGap(1)
      .opacity(1)
      .font('Times-Bold')
      .fontSize(24)
      .moveDown(0.8)
      .text('MAKERERE', {
        bold: true,
        align: 'left',
        indent: 70,
      })
      .image(path.join(`${mukTemplatePath}/makerere.jpg`), 260, 30, {
        align: 'center',
        fit: [70, 70],
      })
      .moveUp()
      .text('UNIVERSITY', {
        bold: true,
        align: 'left',
        indent: 300,
      });

    pdfDoc
      .moveDown(0.1)
      .opacity(1)
      .fontSize(12)
      .text('OFFICE OF THE ACADEMIC REGISTRAR', {
        align: 'center',
      })
      .moveDown(0.2)
      .font('Times-Roman')
      .fontSize(11)
      .text(
        'P. O. Box 7062, Kampala­ Uganda,  Tel: +256 414 533332, Fax: +256 414 534125 ',
        {
          align: 'center',
        }
      )
      .moveDown(0.2)
      .text('E­mail: ar@acadreg.mak.ac.ug, Website: http://www.mak.ac.ug', {
        align: 'center',
        link: 'http://www.mak.ac.ug',
      });

    pdfDoc
      .moveDown(0.5)
      .opacity(1)
      .fontSize(11)
      .font('Times-Roman')
      .text('Name: ')
      .moveUp()
      .font('Times-Bold')
      .text(student.name || 'N/A', {
        indent: 35,
      })
      .font('Times-Roman')
      .moveUp()
      .text('Date: ', {
        indent: 300,
      })
      .moveUp()
      .font('Times-Bold')
      .text(student.printDate, {
        indent: 340,
      })
      .moveDown(0.3)
      .font('Times-Roman')
      .text('Registration No.:')
      .moveUp()
      .font('Times-Bold')
      .text(student.registrationNumber || 'N/A', {
        indent: 80,
      })
      .font('Times-Roman')
      .moveUp()
      .text('Subject Combination: ', {
        indent: 300,
      })
      .moveUp()
      .font('Times-Bold')
      .text(subjectComb, {
        indent: 405,
      })
      .moveDown(0.3)
      .font('Times-Roman')
      .text('Student No.: ')
      .moveUp()
      .font('Times-Bold')
      .text(student.studentNumber || 'N/A', {
        indent: 60,
      })
      .font('Times-Roman')
      .moveUp()
      .text('Sponsorship: ', {
        indent: 300,
      })
      .moveUp()
      .font('Times-Bold')
      .text(student.sponsorship || 'N/A', {
        indent: 370,
      })
      .moveDown(0.3)
      .font('Times-Roman')
      .text('Gender: ')
      .moveUp()
      .font('Times-Bold')
      .text(student.gender || 'N/A', {
        indent: 45,
      })
      .font('Times-Roman')
      .moveUp()
      .text('Scheme: ', {
        indent: 300,
      })
      .moveUp()
      .font('Times-Bold')
      .text(student.mode_of_entry || 'N/A', {
        indent: 350,
      })
      .moveDown(0.3)
      .font('Times-Roman')
      .text('Hall: ')
      .moveUp()
      .font('Times-Bold')
      .text(student.hall_of_attachment || 'N/A', {
        indent: 35,
      })
      .font('Times-Roman')
      .moveUp()
      .text('Year of Study: ', {
        indent: 300,
      })
      .moveUp()
      .font('Times-Bold')
      .text(student.year_of_entry, {
        indent: 370,
      })

      .moveDown(0.3)
      .font('Times-Roman')
      .text('Dear Sir/Madam,')
      .moveDown(0.5)
      .font('Times-Bold')
      .text(
        `PROVISIONAL ADMISSION LETTER FOR ACADEMIC YEAR ${student.academicYear}`,
        {
          align: 'center',
          underline: true,
        }
      )
      .font('Times-Roman')
      .moveDown(0.5)
      .text(
        'I write to offer you a place at Makerere University for a Programme of study leading to the following award as a privately sponsored student:'
      )
      .moveDown(0.5)
      .font('Times-Bold')
      .text(`${student.programmeTitle} - (${student.programmeCode})`, {
        align: 'center',
      })
      .font('Times-Roman')
      .moveDown(0.5)
      .text(
        'This is a provisional offer made on the basis of the statement of your qualification as presented on you application form. The offer is subject to payment of 60% Tuition and all Functional Fees before issuance of Admission Letter from your respective College/School Registrar when the University officially opens.'
      )
      .moveDown()
      .text('The fees policy states as follows:')
      .moveDown()
      .text(
        'i. All privately sponsored first year students should pay 60% tuition and full functional fees before the beginning of the orientation week which will be communicated at a later date.'
      )
      .moveDown(0.5)
      .text(
        'ii. All privately sponsored first year students should pay 60% tuition and all functional fees before issuance of original admission letters.'
      )
      .moveDown(0.5)
      .text(
        'iii. All students should have paid 100% tuition by the 12th week of the Semester as stipulated in the fees policy, approved by the University Council.'
      )
      .moveDown(0.5)
      .text(
        'iv. All privately sponsored students should have paid full functional and accommodation fees before staying in the Hall of Residence.'
      )
      .moveDown(0.5)
      .text(
        'v. Registration is a mandatory requirement of the University which MUST be done within the first two (2) weeks of the semester.'
      )
      .moveDown(0.5)
      .text(
        'vi. Internship fee of UGX.132,250 /= (one hundred thirty two thousand two hundred fifty shillings only) shall be paid in the first and second semesters of year one to cater for the administration and supervision of the exercise.'
      )
      .moveDown()
      .text('See detailed Fees Structure on the next page.')
      .moveDown()
      .text('You ', { continued: true })
      .font('Times-Bold')
      .text('MUST', { continued: true })
      .font('Times-Roman')
      .text(
        ' have a laptop computer as one of the essential tools for study purposes for your programme.',
        {
          continued: false,
        }
      )
      .moveDown()
      .text(
        'Please note that the University outsources catering services for students in the Halls of Residence at the Main Campus.'
      )
      .image(path.join(`${mukTemplatePath}/ARSignature.png`), {
        width: 200,
        height: 50,
      })
      .text('Alfred Masikye Namoah,')
      .moveDown(0.2)
      .font('Times-Bold')
      .text('ACADEMIC REGISTRAR');

    feesStructurePage(studentFees, pdfDoc);

    // write out file
    pdfDoc.end();
    pdfDoc.pipe(
      fs.createWriteStream(
        path.join(
          appConfig.ASSETS_ROOT_DIRECTORY,
          `documents/admissions/letters/${admissionLetterName}`
        )
      )
    );

    return admissionLetterName;
  }

  /**
   * PRINT MAKERERE UNIVERSITY UNDERGRADUATE ORIGINAL ADMISSION LETTER FOR A SINGLE STUDENT
   * Author: MANZEDE BENARD
   * DATE CREATED: 19-JAN-2022
   * @param {*} student
   * @returns string
   *
   */
  printMakUnderGradOriginalAdmissionLetter(student) {
    const admissionLetterName = `MAKGOV-${student.studentNumber}.pdf`;
    const doc = new PDFTableDocument({
      size: 'A4',
      layout: 'portrait',
      margin: 50,
      permissions: {
        copying: false,
        modifying: false,
        fillingForms: false,
      },
      info: {
        Author: 'MANZEDE BENARD <manzede@gmail.com>',
        Title: 'ORIGINAL ADMISSION LETTER',
        Creator: 'MAKERERE UNIVERSITY',
        Keywords: 'PRIVATE ADMISSION LETTER, UNIVERSITY ADMISSION',
      },
    });

    const mukTemplatePath = path.join(
      appConfig.ASSETS_ROOT_DIRECTORY,
      `documents/templates/MAK`
    );

    let subjectComb = 'N/A';

    if (student.data && !isEmpty(student.data.subjects)) {
      subjectComb = map(
        student.data.subjects,
        (subject) => subject.subject_code
      ).join('/');
    }

    doc
      .image(path.join(`${mukTemplatePath}/MAK-BG.png`), 100, 240, {
        align: 'center',
        fit: [400, 500],
        valign: 'center',
      })
      .opacity(0.1);

    doc
      .moveDown(11)
      .opacity(1)
      .fontSize(11.5)
      .font('Times-Roman')
      .text('Name: ')
      .moveUp()
      .font('Times-Bold')
      .text(student.name || 'N/A', {
        indent: 35,
      })
      .font('Times-Roman')
      .moveUp()
      .text('Date: ', {
        indent: 300,
      })
      .moveUp()
      .font('Times-Bold')
      .text(student.printDate, {
        indent: 340,
      })
      .moveDown(0.3)
      .font('Times-Roman')
      .text('Registration No.:')
      .moveUp()
      .font('Times-Bold')
      .text(student.registrationNumber || 'N/A', {
        indent: 80,
      })
      .font('Times-Roman')
      .moveUp()
      .text('Subject Combination: ', {
        indent: 300,
      })
      .moveUp()
      .font('Times-Bold')
      .text(subjectComb, {
        indent: 405,
      })
      .moveDown(0.3)
      .font('Times-Roman')
      .text('Student No.: ')
      .moveUp()
      .font('Times-Bold')
      .text(student.studentNumber || 'N/A', {
        indent: 60,
      })
      .font('Times-Roman')
      .moveUp()
      .text('Sponsorship: ', {
        indent: 300,
      })
      .moveUp()
      .font('Times-Bold')
      .text(student.sponsorship || 'N/A', {
        indent: 370,
      })
      .moveDown(0.3)
      .font('Times-Roman')
      .text('Gender: ')
      .moveUp()
      .font('Times-Bold')
      .text(student.gender || 'N/A', {
        indent: 45,
      })
      .font('Times-Roman')
      .moveUp()
      .text('Scheme: ', {
        indent: 300,
      })
      .moveUp()
      .font('Times-Bold')
      .text(student.mode_of_entry || 'N/A', {
        indent: 350,
      })
      .moveDown(0.3)
      .font('Times-Roman')
      .text('Hall: ')
      .moveUp()
      .font('Times-Bold')
      .text(student.hall_of_attachment || 'N/A', {
        indent: 35,
      })
      .font('Times-Roman')
      .moveUp()
      .text('Year of Study: ', {
        indent: 300,
      })
      .moveUp()
      .font('Times-Bold')
      .text(student.year_of_entry, {
        indent: 370,
      })
      .moveDown()
      .font('Times-Roman')
      .text('Dear Sir/Madam,')
      .moveDown()
      .font('Times-Bold')
      .text(
        `PRIVATELY SPONSORED STUDENTS’ ADMISSIONS FOR ACADEMIC YEAR ${student.academicYear}`,
        {
          align: 'center',
          underline: true,
        }
      )
      .font('Times-Roman')
      .moveDown()
      .text(
        `I write to offer you a place at Makerere University, for the Academic Year ${student.academicYear} for a programme of study leading to the following award as a privately-sponsored student.`
      )
      .moveDown()
      .font('Times-Bold')
      .text(`${student.programmeTitle} - (${student.programmeCode})`, {
        align: 'center',
      })
      .font('Times-Roman')
      .moveDown();

    if (toUpper(student.campus) !== 'MAIN CAMPUS') {
      doc
        .text(
          'The programme is offered at the following Affiliated Institution, which should issue you with the Joining Instructions and its Fees Structure:'
        )
        .moveDown(0.5)
        .font('Times-Bold')
        .text(student.campus, {
          align: 'center',
        })
        .moveDown();
    }

    doc
      .font('Times-Roman')
      .text(
        'You should ensure that you register with the University within two weeks from the beginning of the academic year. Failure to do so will automatically lead to your place being forfeited to another candidate.'
      )
      .moveDown()
      .text(
        'This is a provisional offer made on the basis of the statement of your qualifications as presented on your application form. It is subject to the satisfactory verification of those qualifications by this Office at the time of registration. You must, therefore, present at the time of registration, original satisfactory documentary evidence of these qualifications.'
      )
      .moveDown()
      .font('Times-Bold')
      .text(
        'For the purpose of registration, you must bring with you the following;'
      )
      .moveDown()
      .text('a) ', { continued: true })
      .text('Original', { continued: true })
      .font('Times-Roman')
      .text(
        ' Uganda Certificate of Education (or its equivalent) plus three photostat copies of it.',
        {
          continued: false,
        }
      )
      .text('b) ', { continued: true })
      .font('Times-Bold')
      .text('Original', { continued: true })
      .font('Times-Roman')
      .text(
        ' Uganda Advanced Certificate of Education/Original Result slip (or its equivalent), plus three photostat copies of it.',
        {
          continued: false,
        }
      )
      .text('c) Where applicable, the relevant ', { continued: true })
      .font('Times-Bold')
      .text('original', { continued: true })
      .font('Times-Roman')
      .text(
        ' Degree/Diploma Certificates and Transcripts plus three photostat copies of them.',
        {
          continued: false,
        }
      )
      .text('d) ', { continued: true })
      .font('Times-Bold')
      .text(' Seven (7)', { continued: true })
      .font('Times-Roman')
      .text(
        ' passport size photographs showing your current likeness (head and shoulders).',
        {
          continued: false,
        }
      )
      .text('e) An ', { continued: true })
      .font('Times-Bold')
      .text('Identity Card', { continued: true })
      .font('Times-Roman')
      .text(' from the previous School/College.', {
        continued: false,
      })
      .text('f) An ', { continued: true })
      .font('Times-Bold')
      .text('Original', { continued: true })
      .font('Times-Roman')
      .text(' Birth Certificate.', {
        continued: false,
      })
      .text(
        'g) All international students shall be required to provide a comprehensive Life Assurance Cover before registration for the duration of their study in Makerere University.'
      )

      .addPage()
      .font('Times-Bold')
      .text('Please note that:')
      .moveDown()
      .font('Times-Roman')
      .text(
        '(i) Cases of impersonation, falsification of information/documents, fraudulent access or giving false/incomplete information whenever discovered, either at registration or afterwards, ',
        {
          continued: true,
        }
      )
      .font('Times-Bold')
      .text(
        'will lead to automatic cancellation of admission, revocation of award where applicable and prosecution in the Courts of Law.',
        { continued: false }
      )
      .font('Times-Roman')
      .moveDown()
      .text(
        '(ii) Each first year student admitted to any Makerere University programme MUST have a laptop computer as one of the essential study tools for their programme. ',
        {
          continued: true,
        }
      )
      .font('Times-Bold')
      .text('MUST', { continued: true })
      .font('Times-Roman')
      .text(
        ' have a laptop computer as one of the essential study tools for his/her programme.',
        { continued: false }
      )
      .moveDown()
      .font('Times-Bold')
      .text('FEES.', {
        continued: true,
      })
      .font('Times-Roman')
      .text(' The fees schedule is in the Fresher’s Joining Instructions', {
        continued: false,
      })
      .moveDown()
      .font('Times-Bold')
      .text('MANAGEMENT OF FIELD ATTACHMENT FEES')
      .font('Times-Roman')
      .moveDown()
      .text(
        'Internship fee of UGX 132,250 shs (One hundred thirty two thousand two hundred fifty shillings only) shall be paid in the first (1st) and second (2nd) Semester of the year only to cater for administration and supervision of field attachment. All students are therefore requested to manage their internship costs as they go for field attachments at the end of their second (2nd) year of study. The University will no longer receive internship fees and reimburse students as has been the case.'
      )
      .moveDown()
      .font('Times-Bold')
      .text('FEES PAYMENT')
      .font('Times-Roman')
      .moveDown()
      .text(
        '(i) All fees payable are due at the beginning of the Academic Year or in two installments at the beginning of each Semester.'
      )
      .moveDown()
      .text(
        '(ii) Every privately-sponsored student is obliged to pay all the Functional Fees and the Tuition Fees as specified in fees payment policy before he/she is issued with the University Identity Card.'
      )
      .moveDown()
      .text(
        '(iii) Makerere University Council reserves the right to vary fees chargeable anytime with or without prior notice.'
      )
      .moveDown()
      .text('You are ', { continued: true })
      .font('Times-Bold')
      .text('STRICTLY', { continued: true })
      .font('Times-Roman')
      .text(
        ' required to study the contents of the Freshers’ Joining Instructions ',
        {
          continued: true,
        }
      )
      .font('Times-Bold')
      .text('CAREFULLY', { continued: true })
      .font('Times-Roman')
      .text(' and comply with the rules/regulations therein.', {
        continued: false,
      })
      .moveDown()
      .text(
        'By accepting this offer and registering for this study program, you agree to comply with all National laws and the University’s Rules and Policies which are available at ',
        { continued: true }
      )
      .font('Times-Bold')
      .text(
        'https://www.mak.ac.ug/about-makerere/makerere-university-policies',
        {
          continued: true,
          link: 'https://www.mak.ac.ug/about-makerere/makerere-university-policies',
        }
      )
      .font('Times-Roman')
      .text(
        ' as may be amended from time to time. Breach thereof shall lead to disciplinary action being taken against you including suspension, expulsion and prosecution in Courts of law and other judicial and administrative tribunals.',
        {
          continued: false,
          link: null,
        }
      )
      .moveDown()
      .text(
        'Finally, I congratulate you on your admission and wish you success in your studies at this university.'
      )
      .moveDown()
      .text('Yours faithfully,')

      .image(path.join(`${mukTemplatePath}/ARSignature.png`), {
        width: 200,
        height: 50,
      })
      .text('Alfred Masikye Namoah,')
      .moveDown(0.2)
      .font('Times-Bold')
      .text('ACADEMIC REGISTRAR');

    // write out file
    doc.end();
    doc.pipe(
      fs.createWriteStream(
        path.join(
          appConfig.ASSETS_ROOT_DIRECTORY,
          `documents/admissions/letters/${admissionLetterName}`
        )
      )
    );

    return admissionLetterName;
  }

  /**
   * PRINT MAKERERE UNIVERSITY UNDERGRADUATE ADMISSION LETTER FOR A SINGLE STUDENT
   * Author: MANZEDE BENARD
   * DATE CREATED: 03-DEC-2021
   * @param {*} student
   * @returns string
   *
   */
  printMakGOVAdmissionLetter(student) {
    let subjectComb = 'N/A';

    if (student.data && !isEmpty(student.data.subjects)) {
      subjectComb = map(
        student.data.subjects,
        (subject) => subject.subject_code
      ).join('/');
    }

    const admissionLetterName = `MAK-${student.studentNumber}.pdf`;
    const doc = new PDFTableDocument({
      size: 'A4',
      layout: 'portrait',
      margin: 50,
      permissions: {
        copying: false,
        modifying: false,
        fillingForms: false,
      },
      info: {
        Author: 'MANZEDE BENARD <manzede@gmail.com>',
        Title: 'PROVISIONAL ADMISSION LETTER',
        Creator: 'MAKERERE UNIVERSITY',
        Keywords: 'GOVERNMENT ADMISSION LETTER, UNIVERSITY ADMISSION',
      },
    });

    const mukTemplatePath = path.join(
      appConfig.ASSETS_ROOT_DIRECTORY,
      `documents/templates/MAK`
    );

    doc
      .image(path.join(`${mukTemplatePath}/MAK-BG.png`), 100, 240, {
        align: 'center',
        fit: [400, 500],
        valign: 'center',
      })
      .opacity(0.1);

    doc
      .moveDown(9.5)
      .opacity(1)
      .fontSize(11.5)
      .font('Times-Roman')
      .text('Name: ')
      .moveUp()
      .font('Times-Bold')
      .text(student.name || 'N/A', {
        indent: 35,
      })
      .font('Times-Roman')
      .moveUp()
      .text('Date: ', {
        indent: 300,
      })
      .moveUp()
      .font('Times-Bold')
      .text(student.printDate, {
        indent: 340,
      })
      .moveDown(0.3)
      .font('Times-Roman')
      .text('Registration No.:')
      .moveUp()
      .font('Times-Bold')
      .text(student.registrationNumber || 'N/A', {
        indent: 80,
      })
      .font('Times-Roman')
      .moveUp()
      .text('Subject Combination: ', {
        indent: 300,
      })
      .moveUp()
      .font('Times-Bold')
      .text(subjectComb, {
        indent: 405,
      })
      .moveDown(0.3)
      .font('Times-Roman')
      .text('Student No.: ')
      .moveUp()
      .font('Times-Bold')
      .text(student.studentNumber || 'N/A', {
        indent: 60,
      })
      .font('Times-Roman')
      .moveUp()
      .text('Sponsorship: ', {
        indent: 300,
      })
      .moveUp()
      .font('Times-Bold')
      .text(student.sponsorship || 'N/A', {
        indent: 370,
      })
      .moveDown(0.3)
      .font('Times-Roman')
      .text('Gender: ')
      .moveUp()
      .font('Times-Bold')
      .text(student.gender || 'N/A', {
        indent: 45,
      })
      .font('Times-Roman')
      .moveUp()
      .text('Scheme: ', {
        indent: 300,
      })
      .moveUp()
      .font('Times-Bold')
      .text(student.mode_of_entry || 'N/A', {
        indent: 350,
      })
      .moveDown(0.3)
      .font('Times-Roman')
      .text('Hall: ')
      .moveUp()
      .font('Times-Bold')
      .text(student.hall_of_attachment || 'N/A', {
        indent: 35,
      })
      .font('Times-Roman')
      .moveUp()
      .text('Year of Study: ', {
        indent: 300,
      })
      .moveUp()
      .font('Times-Bold')
      .text(student.year_of_entry, {
        indent: 370,
      })
      .moveDown()
      .font('Times-Roman')
      .text('Dear Sir/Madam,')
      .moveDown()
      .font('Times-Bold')
      .text(
        `GOVERNMENT SPONSORED STUDENTS’ ADMISSIONS FOR ACADEMIC YEAR ${student.academicYear}`,
        {
          align: 'center',
          underline: true,
        }
      )
      .font('Times-Roman')
      .moveDown()
      .text(
        `I write to offer you a place at Makerere University, for the Academic Year ${student.academicYear} for a programme of study leading to the following award:`
      )
      .moveDown()
      .font('Times-Bold')
      .text(`${student.programmeTitle} - (${student.programmeCode})`, {
        align: 'center',
      })
      .font('Times-Roman')
      .moveDown();

    if (toUpper(student.campus) !== 'MAIN CAMPUS') {
      doc
        .text(
          'The programme is offered at the following Affiliated Institution, which should issue you with the Joining Instructions:'
        )
        .moveDown(0.5)
        .font('Times-Bold')
        .text(student.campus, {
          align: 'center',
        })
        .moveDown();
    }

    doc
      .font('Times-Roman')
      .text(
        'Should you accept this offer, confirm by registering with the University within two weeks from the beginning of the academic year. Failure to do so will automatically lead to your place being forfeited to another candidate.'
      )
      .moveDown()
      .text(
        'This offer is provisional, subject to satisfactory verification by this Office at the time of registration of the qualifications stated in the application form. For the purpose of registration, you must bring with you the following:'
      )
      .moveDown()
      .text('a) ', { continued: true })
      .font('Times-Bold')
      .text('Original', { continued: true })
      .font('Times-Roman')
      .text(
        ' Uganda Certificate of Education (or its equivalent) plus three photostat copies of it.',
        {
          continued: false,
        }
      )
      .moveDown()
      .text('b) ', { continued: true })
      .font('Times-Bold')
      .text('Original', { continued: true })
      .font('Times-Roman')
      .text(
        ' Uganda Advanced Certificate of Education/Original Result slip (or its equivalent), plus three photostat copies of it.',
        {
          continued: false,
        }
      )
      .moveDown()
      .text('c) Where applicable, the relevant ', { continued: true })
      .font('Times-Bold')
      .text('original', { continued: true })
      .font('Times-Roman')
      .text(
        ' Degree/Diploma Certificates and Transcripts plus three photostat copies of them.',
        {
          continued: false,
        }
      )
      .moveDown()
      .text('d) ', { continued: true })
      .font('Times-Bold')
      .text(' Seven (7)', { continued: true })
      .font('Times-Roman')
      .text(
        ' passport size photographs showing your current likeness (head and shoulders).',
        {
          continued: false,
        }
      )
      .moveDown()
      .text('e) An ', { continued: true })
      .font('Times-Bold')
      .text('Identity Card', { continued: true })
      .font('Times-Roman')
      .text(' from the previous School/College.', {
        continued: false,
      })
      .moveDown()
      .text('f) An ', { continued: true })
      .font('Times-Bold')
      .text('Original', { continued: true })
      .font('Times-Roman')
      .text(' Birth Certificate.', {
        continued: false,
      })
      .addPage()
      .font('Times-Bold')
      .text('Please note that:')
      .moveDown()
      .font('Times-Roman')
      .text(
        '(I) Cases of impersonation, falsification of information/documents, fraudulent access or giving false/incomplete information whenever discovered, either at registration or afterwards, ',
        {
          continued: true,
        }
      )
      .font('Times-Bold')
      .text(
        'will lead to automatic cancellation of admission, revocation of award where applicable and prosecution in the Courts of Law.',
        { continued: false }
      )
      .font('Times-Roman')
      .moveDown()
      .text(
        '(II) Holding more than one Ugandan Government Scholarship is illegal and may lead to cancellation of admission whenever discovered.'
      )
      .moveDown()
      .text(
        '(III) Your tuition is paid by Uganda Government; however, your institution will inform you on the functional fees you are expected to pay before registration. Uganda GovernmentSponsored students are informed that they are entitled to sponsorship for a specified period for a specified Academic Programme. Students who fail their examinations and have to retake (repeat) courses should meet the costs for the courses retaken. Government does not budget for such expenditures.'
      )
      .moveDown()
      .text(
        '(IV)  There will be no Special School/College Allowance given to students admitted to  Makerere University Programmes.'
      )
      .moveDown()
      .text(
        '(V) Each first year student admitted to any Makerere University programme ',
        {
          continued: true,
        }
      )
      .font('Times-Bold')
      .text('MUST', { continued: true })
      .font('Times-Roman')
      .text(
        ' have a laptop computer as one of the essential study tools for his/her programme.',
        { continued: false }
      )
      .moveDown()
      .text(
        'A candidate, who accepts a place at Makerere University and registers for an academic programme of study, shall not be eligible for admission to any other programme at the University on the basis of results obtained after re-sitting A-level examinations. That is, the use of results obtained from re-sitting A-Level while already registered on a University programme shall result in automatic cancellation of admission and dismissal from the University.'
      )
      .moveDown()
      .text('You are ', { continued: true })
      .font('Times-Bold')
      .text('STRICTLY', { continued: true })
      .font('Times-Roman')
      .text(
        ' required to study the contents of the Freshers’ Joining Instructions ',
        {
          continued: true,
        }
      )
      .font('Times-Bold')
      .text('CAREFULLY', { continued: true })
      .font('Times-Roman')
      .text(' and comply with the rules/regulations therein.', {
        continued: false,
      })
      .text(
        'Non-citizens are warned against acquiring admission under the sponsorship of the Government of Uganda dubiously. Such an act, when discovered, shall lead to automatic dismissal from the University and prosecution in the Courts of Law.'
      )
      .moveDown()
      .text(
        'By accepting this offer and registering for this study program, you agree to comply with all National laws and the University’s Rules and Policies which are available at ',
        { continued: true }
      )
      .font('Times-Bold')
      .text(
        'https://www.mak.ac.ug/about-makerere/makerere-university-policies',
        {
          continued: true,
          link: 'https://www.mak.ac.ug/about-makerere/makerere-university-policies',
        }
      )
      .font('Times-Roman')
      .text(
        ' as may be amended from time to time. Breach thereof shall lead to disciplinary action being taken against you including suspension, expulsion and prosecution in Courts of law and other judicial and administrative tribunals.',
        {
          continued: false,
          link: null,
        }
      )
      .moveDown()
      .text(
        'Finally, I congratulate you on your admission and wish you success in your studies at this university.'
      )
      .moveDown()
      .text('Yours faithfully,')

      .image(path.join(`${mukTemplatePath}/ARSignature.png`), {
        width: 200,
        height: 50,
      })
      .text('Alfred Masikye Namoah,')
      .moveDown(0.2)
      .font('Times-Bold')
      .text('ACADEMIC REGISTRAR');

    // write out file
    doc.end();
    doc.pipe(
      fs.createWriteStream(
        path.join(
          appConfig.ASSETS_ROOT_DIRECTORY,
          `documents/admissions/letters/${admissionLetterName}`
        )
      )
    );

    return admissionLetterName;
  }

  /**
   * GENERATE APPLICANTS' ACCEPTANCE LETTER
   *
   * @param {*} student
   * @param {*} res
   * @returns STREAM
   */
  printCOPAcceptanceLetter(student, res) {
    const pdfDoc = new PDFTableDocument({
      size: 'A4',
      layout: 'portrait',
      margin: 40,
      permissions: {
        copying: false,
        modifying: false,
        fillingForms: false,
      },
      info: {
        Author: 'MANZEDE BENARD <manzede@gmail.com>',
        Title: 'CHANGE OF PROGRAMME ACCEPTANCE LETTER',
        Creator: 'MAKERERE UNIVERSITY',
        Keywords:
          'CHANGE OF PROGRAMME, ACCEPTANCE LETTER, UNIVERSITY ADMISSION',
      },
    });

    const mukTemplatePath = path.join(
      appConfig.ASSETS_ROOT_DIRECTORY,
      `documents/templates/MAK`
    );

    pdfDoc
      .image(path.join(`${mukTemplatePath}/MAK-BG.png`), 100, 240, {
        align: 'center',
        fit: [400, 400],
        valign: 'center',
      })
      .opacity(0.1);

    pdfDoc
      .lineGap(1)
      .opacity(1)
      .font('Times-Bold')
      .fontSize(24)
      .moveDown(0.8)
      .text('MAKERERE', {
        bold: true,
        align: 'left',
        indent: 70,
      })
      .image(path.join(`${mukTemplatePath}/makerere.jpg`), 260, 30, {
        align: 'center',
        fit: [70, 70],
      })
      .moveUp()
      .text('UNIVERSITY', {
        bold: true,
        align: 'left',
        indent: 300,
      });

    pdfDoc
      .moveDown(0.1)
      .opacity(1)
      .fontSize(12)
      .text('OFFICE OF THE ACADEMIC REGISTRAR', {
        align: 'center',
      })
      .moveDown(0.2)
      .font('Times-Roman')
      .fontSize(11)
      .text(
        'P. O. Box 7062, Kampala-Uganda, Tel: +256 414 532634, Twitter: @MakerereAR ',
        {
          align: 'center',
        }
      )
      .moveDown(0.2)
      .font('Times-Bold')
      .text('Website: ', {
        continued: true,
        indent: 100,
      })
      .fillColor('blue')
      .font('Times-Roman')
      .text('http://www.mak.ac.ug', {
        link: 'http://www.mak.ac.ug',
      })
      .moveUp()
      .text('www.ar.mak.ac.ug', {
        indent: 310,
        link: 'www.ar.mak.ac.ug',
      });

    pdfDoc
      .fillColor('black')
      .moveDown()
      .fontSize(12)
      .font('Times-Roman')
      .text('Name: ', {
        continued: true,
      })
      .font('Times-Bold')
      .text(`${student.surname} ${student.otherNames}`, {
        continued: false,
      })
      .font('Times-Roman')
      .moveUp()
      .text('Date: ', {
        indent: 340,
        continued: true,
      })
      .font('Times-Bold')
      .text(moment(moment.now()).format('Do MMM, YYYY'), {
        continued: false,
      })
      .font('Times-Roman')
      .text('Registration Number: ', {
        continued: true,
      })
      .font('Times-Bold')
      .text(student.studentProgramme.registration_number, {
        continued: false,
      })
      .font('Times-Roman')
      .moveUp()
      .text('Entry Study Year: ', {
        indent: 340,
        continued: true,
      })
      .font('Times-Bold')
      .text(student.studentProgramme.entryStudyYear.programme_study_years, {
        continued: false,
      })
      .font('Times-Roman')
      .text('Student Number: ', {
        continued: true,
      })
      .font('Times-Bold')
      .text(student.studentProgramme.student_number, {
        continued: false,
      })
      .font('Times-Roman')
      .moveUp()
      .text('Subj Comb: ', {
        indent: 340,
        continued: true,
      })
      .font('Times-Bold')
      .text(student.subjectComb || 'N/A', {
        continued: false,
      })

      .moveDown()
      .font('Times-Bold')
      .text(
        `A           CHANGE OF PROGRAMME/SUBJECT COMBINATION FOR ${student.academicYear.metadata_value} A.Y`
      )
      .font('Times-Roman')
      .moveDown()
      .text(
        'This is to inform you that you have been granted permission to change programme/subject combinations from'
      )
      .moveDown(0.5)
      .font('Times-Bold')
      .text(
        `${student.studentProgramme.programme.programme_title} - (${student.studentProgramme.programme.programme_code}) - ${student.studentProgramme.campus.metadata_value}`,
        {
          align: 'center',
        }
      )
      .font('Times-Roman')
      .text('to', {
        align: 'center',
      })
      .font('Times-Bold')
      .text(
        `${student.newProgramme.programme_title} - (${student.newProgramme.programme_code}) - ${student.newCampus.metadata_value}`,
        {
          align: 'center',
        }
      )
      .font('Times-Bold')
      .moveDown()
      .text(
        'I wish you well in your new programme/subject combination/college/school'
      )
      .image(path.join(`${mukTemplatePath}/ARSignature.png`), {
        width: 200,
        height: 50,
      })
      .text('Alfred Masikye Namoah,')
      .text('ACADEMIC REGISTRAR')
      .moveDown()
      .font('Times-Bold')
      .text(`B          ACCEPTANCE FORM (TICK WHERE APPROPRIATE)`)
      .text('I do accept/do not accept', {
        continued: true,
        underline: true,
      })
      .font('Times-Roman')
      .text(' the new Programme/Subject Combination offered to me.', {
        continued: true,
        underline: false,
      })
      .font('Times-Bold')
      .text('(Tick the Appropriate)', {
        continued: false,
      })
      .moveDown(0.5)
      .font('Times-Roman')
      .text('Name: ', {
        continued: true,
      })
      .font('Times-Bold')
      .text(`${student.surname} ${student.otherNames}`, {
        continued: false,
      })
      .font('Times-Roman')
      .text('Student No: ', {
        continued: true,
      })
      .font('Times-Bold')
      .text(student.studentProgramme.student_number, {
        continued: false,
      })
      .font('Times-Roman')
      .text('Programme: ', {
        continued: true,
      })
      .font('Times-Bold')
      .text(
        ` ${student.newProgramme.programme_title} - (${student.newProgramme.programme_code})`,
        {
          continued: true,
        }
      )
      .font('Times-Roman')
      .text(', Campus: ', {
        continued: true,
      })
      .font('Times-Bold')
      .text(`${student.newCampus.metadata_value || 'N/A'}`, {
        continued: true,
      })
      .font('Times-Roman')
      .text(', Subj Comb: ', {
        continued: true,
      })
      .font('Times-Bold')
      .text(`${student.newSubjectComb || 'N/A'}.`, {
        continued: false,
      })
      .moveDown()
      .text(
        'On acceptance of this change of programme/subject combination appropriate changes like new registration number and a new fees structure will be applied'
      )
      .moveDown()
      .font('Times-Roman')
      .text(
        'GOVERNMENT:.............................PRIVATE: ................. (Tick the Appropriate)'
      )
      .moveDown()
      .text(
        'SIGNATURE: .................................. DATE .........................'
      )
      .moveDown()
      .text('C.c  The Principal/Dean of the Receiving College/School.')
      .text('The Principal/Dean of the Original College/School.', {
        indent: 20,
      })
      .text('The Deputy Registrar (ICT) Office No. 615, Senate Building.', {
        indent: 20,
      })
      .moveDown()
      .font('Times-Bold')
      .text(
        'NB: Students who have been permitted to change PROGRAMMES/SUBJECT COMBINATIONS MUST complete the FORM at B above and return a photocopy of the letter to the Academic Registrar (Admissions Office), Room 303 immediately'
      );

    // write out file
    pdfDoc.end();

    return pdfDoc.pipe(res);
  }
}

/**
 * PRINT FEES STRUCTURE PAGE
 *
 * @param {*} studentFees
 * @param {*} doc
 */
const feesStructurePage = (studentFees, doc) => {
  doc
    .addPage()
    .text('FEES STRUCTURE', { align: 'center', continued: false })
    .moveDown();

  if (!isEmpty(studentFees)) {
    const table = {
      headers: ['ITEM', 'ITEM CATEGORY', 'YR. - SEM', 'AMOUNT'],
      rows: studentFees,
      options: {
        prepareHeader: () => doc.font('Times-Bold').fontSize(8),
        prepareRow: (row, indexColumn, indexRow, rectRow) =>
          doc.font('Times-Roman').fontSize(8),
      },
    };

    doc.table(table);
  } else {
    doc
      .fontSize(10)
      .font('Times-Bold')
      .text('NO FEES STRUCTURE HAS BEEN DEFINED FOR YOUR PROGRAMME', {
        false: true,
        align: 'center',
      })
      .moveDown();
  }

  doc
    .fontSize(9)
    .font('Times-Roman')
    .text('You are expected to activate your ', {
      continued: true,
      indent: 50,
    })
    .font('Times-Bold')
    .text('STUDENT’S PORTAL', { continued: true })
    .font('Times-Roman')
    .text(' in order to make payments and register every semester.')
    .moveDown()
    .text('To do so access the students portal using the link;', {
      align: 'center',
    })
    .moveDown()
    .fillColor('blue')
    .text('https://myportal.mak.ac.ug', {
      link: 'https://myportal.mak.ac.ug',
      indent: 160,
      continued: true,
      underline: true,
    })
    .fillColor('black')
    .text(' or ', {
      indent: 230,
      underline: false,
      continued: true,
    })
    .fillColor('blue')
    .text('https://student.mak.ac.ug', {
      link: 'https://student.mak.ac.ug',
      indent: 240,
      continued: false,
      underline: true,
    })
    .fillColor('black')
    .moveDown(2)
    .fontSize(8)
    .fillColor('#5D5D9C')
    .text('For the very first time, your ', {
      continued: true,
      indent: 30,
    })
    .font('Times-Bold')
    .text('User ID', { continued: true })
    .font('Times-Roman')
    .text(' is your ', {
      continued: true,
    })
    .font('Times-Bold')
    .text(' Student Number ', { continued: true })
    .font('Times-Roman')
    .text(' and your ', { continued: true })
    .font('Times-Bold')
    .text('Password', { continued: true })
    .font('Times-Roman')
    .text(' is also your ', { continued: true })
    .font('Times-Bold')
    .text('Student Number', { continued: true })
    .font('Times-Roman')
    .text(' found on your admission letter  ')
    .text(
      'Follow instructions to create your own password, login again to activate your student’s portal to be able to make payments',
      {
        align: 'center',
      }
    );
};

/**
 * GET STUDENT FEES STRUCTURE
 *
 * @param {*} student
 * @returns array
 */
const getStudentFeesStructure = async (student) => {
  try {
    const tableRows = [];

    const feesContext = {
      programme_id: student.programme_id,
      entry_academic_year_id: student.entry_academic_year_id,
      campus_id: student.campus_id,
      billing_category_id: student.billing_category_id,
      programme_type_id: student.programme_type_id,
      intake_id: student.intake_id,
      student_entry_year: student.entry_study_year,
      study_level_id: student.programme_study_level,
    };

    const { feesStructure } = await feesStructureFunction(feesContext);

    if (isArray(feesStructure)) {
      const entryYearFees = feesStructure.find(
        (structure) =>
          structure.programme_study_year === student.entry_study_year
      );

      if (entryYearFees) {
        const { semesterOne, semesterTwo } = entryYearFees;

        const semesterOneFees = [
          ...semesterOne.tuitionFees,
          ...semesterOne.FunctionalFees,
        ];

        const semesterTwoFees = [
          ...semesterTwo.tuitionFees,
          ...semesterTwo.FunctionalFees,
        ];

        if (!isEmpty(semesterOneFees)) {
          tableRows.push([
            [`${student.entry_study_year} SEMESTER I`, '', '', ''],
            ...orderBy(semesterOneFees, ['amount'], 'desc').map(
              (feesElement) => {
                return [
                  feesElement.fees_element_name,
                  feesElement.fees_element_category,
                  `${student.entry_study_year} - SEM I`,
                  parseInt(feesElement.amount, 10).toLocaleString(),
                ];
              }
            ),
            [
              '',
              '',
              'Total',
              sumBy(semesterOneFees, 'amount').toLocaleString(),
            ],
          ]);
        }

        if (!isEmpty(semesterTwoFees)) {
          tableRows.push([
            [`${student.entry_study_year} SEMESTER II`, '', '', ''],
            ...orderBy(semesterTwoFees, ['amount'], 'desc').map(
              (feesElement) => {
                return [
                  feesElement.fees_element_name,
                  feesElement.fees_element_category,
                  `${student.entry_study_year} - SEM II`,
                  parseInt(feesElement.amount, 10).toLocaleString(),
                ];
              }
            ),
            [
              '',
              '',
              'Total',
              sumBy(semesterTwoFees, 'amount').toLocaleString(),
            ],
          ]);
        }
      }
    }

    return flatten(tableRows);
  } catch (error) {
    return [];
  }
};

module.exports = MUKDocumentHelper;
