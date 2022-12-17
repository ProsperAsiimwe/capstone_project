const PDFTableDocument = require('pdfkit-table');
const path = require('path');
const fs = require('fs');
const moment = require('moment');
const { appConfig } = require('@root/config');
const { toUpper, isEmpty, map, capitalize } = require('lodash');

class KYUDocumentHelper {
  /**
   * PRINT KYAMBOGO UNIVERSITY ADMISSION LETTER FOR A SINGLE STUDENT
   * Author: MANZEDE BENARD
   * DATE CREATED: 03-DEC-2021
   * @param {*} student
   * @returns string
   *
   */
  printKYUAdmissionLetter(student) {
    const admissionLetterName = `KYU-${student.studentNumber}.pdf`;
    const pdfDoc = new PDFTableDocument({
      size: 'A4',
      layout: 'portrait',
      margins: {
        top: 50,
        bottom: 50,
        left: 40,
        right: 40,
      },
      permissions: {
        copying: false,
        modifying: false,
      },
      info: {
        Author: 'MANZEDE BENARD <manzede@gmail.com>',
        Title: 'PROVISIONAL ADMISSION LETTER',
        Creator: 'KYAMBOGO UNIVERSITY',
        Keywords: 'ADMISSION LETTER, UNIVERSITY ADMISSION',
      },
    });

    const mukTemplatePath = path.join(
      appConfig.ASSETS_ROOT_DIRECTORY,
      `documents/templates/KYU`
    );

    const studentProgramme = `${student.programme_title} - (${
      student.alias_code || student.programme_code
    })`;

    const isDiplomaCertificate = toUpper(student.mode_of_entry).includes(
      'DIPLOMA / CERTIFICATE ENTRY'
    );

    let subjectComb = 'N/A';

    if (student.data && !isEmpty(student.data.subjects)) {
      subjectComb = map(
        student.data.subjects,
        (subject) => subject.subject_code
      ).join('/');
    }

    pdfDoc
      .moveDown(12)
      .fontSize(10)
      .font('Times-Bold')
      .fontSize(10)

      .moveDown(0.5)
      .font('Times-Roman')
      .text('PRINT DATE:')
      .moveUp()
      .font('Times-Bold')
      .text(student.printDate, {
        indent: 105,
      })
      .font('Times-Roman')
      .moveUp()
      .text('YEAR OF ENTRY:', {
        indent: 270,
      })
      .moveUp()
      .font('Times-Bold')
      .text(student.year_of_entry || '-------', {
        indent: 370,
      })

      .moveDown(0.5)
      .font('Times-Roman')
      .text('NAME:')
      .moveUp()
      .font('Times-Bold')
      .text(student.name, {
        indent: 105,
      })
      .moveUp()
      .font('Times-Roman')
      .text('TYPE OF ENTRY:', {
        indent: 270,
      })
      .moveUp()
      .font('Times-Bold')
      .text(student.mode_of_entry || '-------', {
        indent: 370,
      })

      .moveDown(0.5);

    if (!isDiplomaCertificate) {
      pdfDoc
        .font('Times-Roman')
        .text('A’LEVEL INDEX NO.:')
        .moveUp()
        .font('Times-Bold')
        .text(student.a_level_index || 'N/A', {
          indent: 105,
        });
    }

    pdfDoc
      .font('Times-Roman')
      .moveUp()
      .text('STUDENT NO.:', {
        indent: !isDiplomaCertificate ? 270 : 0,
      })
      .moveUp()
      .font('Times-Bold')
      .text(student.studentNumber || '-------', {
        indent: !isDiplomaCertificate ? 370 : 105,
      })

      .moveDown(0.5)
      .font('Times-Roman')
      .text('KYU ADMISSION NO.:')
      .moveUp()
      .font('Times-Bold')
      .text(student.registrationNumber || '-------', {
        indent: 105,
      })
      .font('Times-Roman')
      .moveUp()
      .text('NATIONALITY:', {
        indent: 270,
      })
      .moveUp()
      .font('Times-Bold')
      .text(student.nationality || '-------', {
        indent: 370,
      })

      .moveDown(0.5)
      .font('Times-Roman')
      .text('SPONSORSHIP:')
      .moveUp()
      .font('Times-Bold')
      .text(student.sponsorship || '-------', {
        indent: 105,
      })
      .font('Times-Roman')
      .moveUp()
      .text('RESIDENCE STATUS:', {
        indent: 270,
      })
      .moveUp()
      .font('Times-Bold')
      .text(student.hall_of_residence || 'NON-RESIDENT', {
        indent: 370,
      })

      .moveDown(0.5)
      .font('Times-Roman')
      .text('HALL:')
      .moveUp()
      .font('Times-Bold')
      .text(student.hall_of_attachment || '-------', {
        indent: 105,
      })
      .font('Times-Roman')
      .moveUp()
      .text('STUDY TIME:', {
        indent: 270,
      })
      .moveUp()
      .font('Times-Bold')
      .text(student.programme_type || '-------', {
        indent: 370,
      })

      .moveDown(0.5)
      .font('Times-Roman')
      .text('SUBJECT COMB:')
      .moveUp()
      .font('Times-Bold')
      .text(subjectComb, {
        indent: 105,
      })
      .font('Times-Roman')
      .moveUp()
      .text('STUDY CENTER:', {
        indent: 270,
      })
      .moveUp()
      .font('Times-Bold')
      .text(student.campus || '-------', {
        indent: 370,
      })

      .moveDown(0.5)
      .font('Times-Roman')
      .text('PROGRAMME:')
      .moveUp()
      .font('Times-Bold');

    if (studentProgramme.length <= 63) {
      pdfDoc.text(studentProgramme, {
        indent: 105,
      });
    } else {
      const programmeWords = studentProgramme.split(' ');

      let firstText = '';

      let breakIndex = 0;

      for (let index = 0; index <= programmeWords.length; index++) {
        const word = programmeWords[index];

        const newText = index === 0 ? word : `${firstText} ${word}`;

        if (newText.length <= 63) {
          firstText = newText;
        } else {
          breakIndex = index;
          break;
        }
      }

      const secondText = programmeWords.splice(breakIndex).join(' ');

      pdfDoc
        .text(firstText, {
          indent: 105,
        })
        .text(secondText, { indent: 105 });
    }

    let bulleting = 10;

    pdfDoc
      .moveDown(0.5)
      .font('Times-Roman')
      .text('FACULTY NAME:')
      .moveUp()
      .font('Times-Bold')
      .text(student.faculty_title, {
        indent: 105,
      })

      .moveDown()
      .fontSize(11)
      .text(`${student.academicYear} ACADEMIC YEAR ADMISSION`, {
        align: 'center',
      })
      .fontSize(10)
      .text('Dear Student,')
      .font('Times-Roman')

      .moveDown()
      .text(
        `I write to offer you a place on the above programme of study for the `,
        { continued: true }
      )
      .font('Times-Bold')
      .text(student.academicYear, { continued: true })
      .font('Times-Roman')
      .text(' Academic Year.')
      .moveDown()
      .text('This offer of Admission lapses automatically if not taken up ', {
        continued: true,
      })
      .font('Times-Bold')
      .text('within two weeks ', {
        continued: true,
      })
      .font('Times-Roman')
      .text(
        'from the beginning of the Academic Year.  Please note that the offer is provisional, subject to satisfactory registration by the office of the Academic Registrar at the time of verification of the qualifications stated in the application form you filled, and in line with regulations governing the programme to which you have been admitted.  For purpose of verification, you must bring with you the following:'
      )

      // (a)
      .moveDown()
      .text('(a)   ', { continued: true })
      .font('Times-Bold')
      .text('Original ', {
        continued: true,
      })
      .font('Times-Roman')
      .text('Uganda Certificate of Education ', {
        continued: true,
      })
      .font('Times-Bold')
      .text('Result slip', {
        continued: true,
        underline: true,
      })
      .font('Times-Roman')
      .text(' and ', {
        continued: true,
        underline: false,
      })
      .font('Times-Bold')
      .text('Certificate', {
        continued: true,
        underline: true,
      })
      .font('Times-Roman')
      .text(' (or equivalent) plus three (3) photo copies of each.', {
        underline: false,
        continued: false,
      })

      // (b)
      .moveDown(0.5)
      .text('(b)   ', { continued: true })
      .font('Times-Bold')
      .text('Original ', {
        continued: true,
      })
      .font('Times-Roman')
      .text('Uganda Advanced Certificate of Education ', {
        continued: true,
      })
      .font('Times-Bold')
      .text('Result slip', {
        continued: true,
        underline: true,
      })
      .font('Times-Roman')
      .text(' and ', {
        continued: true,
        underline: false,
      })
      .font('Times-Bold')
      .text('Certificate', {
        continued: true,
        underline: true,
      })
      .font('Times-Roman')
      .text(' (or equivalent) plus three (3) Photostat copies of each. ', {
        continued: false,
        underline: false,
      })

      // (c)
      .moveDown(0.5)
      .text('(c)   ', { continued: true })
      .font('Times-Bold')
      .text('Original ', {
        continued: true,
      })
      .font('Times-Roman')
      .text('Diploma ', {
        continued: true,
      })
      .font('Times-Bold')
      .text('Academic Transcript', {
        continued: true,
        underline: true,
      })
      .font('Times-Roman')
      .text(' and ', {
        continued: true,
        underline: false,
      })
      .font('Times-Bold')
      .text('Certificate', {
        continued: true,
        underline: true,
      })
      .font('Times-Roman')
      .text(
        ' plus three photo copies of each (for Certificate/Diploma/Degree entrants only). ',
        {
          continued: false,
          underline: false,
        }
      )

      // (d)
      .moveDown(0.5)
      .text('(d)   ', { continued: true })
      .font('Times-Bold')
      .text('Six (6)', {
        continued: true,
      })
      .font('Times-Roman')
      .text(
        ' Passport size photographs showing your current likeness (head and shoulders). ',
        {
          continued: false,
          underline: false,
        }
      )

      // (e)
      .moveDown(0.5)
      .text('(e)   An ', { continued: true })
      .font('Times-Bold')
      .text('Identity Card ', {
        continued: true,
      })
      .font('Times-Roman')
      .text(' from the previous School/College, ', {
        continued: true,
        underline: false,
      })
      .font('Times-Bold')
      .text('plus', {
        continued: true,
        underline: true,
      })
      .font('Times-Roman')
      .text(' a ', {
        continued: true,
        underline: false,
      })
      .font('Times-Bold')
      .text('passport ', {
        continued: true,
        underline: true,
      })
      .font('Times-Roman')
      .text(' for foreign students.', {
        continued: false,
        underline: false,
      })

      // (f)
      .moveDown(0.5)
      .text('(f)   ', { continued: true })
      .font('Times-Bold')
      .text('Original', { continued: true })
      .font('Times-Roman')
      .text(' Birth Certificate or ', { continued: true })
      .font('Times-Bold')
      .text('National Identity Card', { continued: true })
      .font('Times-Roman')
      .text(' and three (3) photo copies of it.')

      // (g)
      .moveDown(0.5)
      .text('(e)   ', { continued: true })
      .font('Times-Bold')
      .text(
        'Refugee students should in addition to the above, present proof of refugee status.'
      )
      .font('Times-Roman')

      // (h)
      .moveDown(0.5)
      .text('(h)   ', { continued: true })
      .font('Times-Bold')
      .text('Proof', { continued: true })
      .font('Times-Roman')
      .text(' of payment of Kyambogo University ', { continued: true })
      .font('Times-Bold')
      .text('Mandatory Fees.', { continued: false, underline: true })
      .font('Times-Roman')

      // (i)
      .moveDown(0.5)
      .text('(i)   ', { continued: true, underline: false })
      .font('Times-Bold')
      .text('Original', { continued: true })
      .font('Times-Roman')
      .text(
        ' National Council for Higher Education (NCHE) Fees Payment Deposit Slip plus three (3) photo copies of it. ',
        { continued: false }
      )

      // (j)
      .moveDown(0.5)
      .text('(j)   Internet enabled device that can facilitate e-learning ', {
        continued: true,
      })
      .font('Times-Bold')
      .text('e.g., Computer, Laptop, IPad/Tablet, Smart Phone etc.', {
        continued: false,
      })
      .font('Times-Roman')

      .moveDown()
      .text(
        'It is important that you acquaint yourself with the regulations governing your stay at the University and your entitlements as a '
      )
      .font('Times-Bold')
      .text(capitalize(student.sponsorship), { continued: true })
      .font('Times-Roman')
      .text(
        ' Sponsored student. In all correspondences, please quote the admission number appearing on your admission letter.  This shall also be your Registration Number to be used in all your academic work.  Overleaf are key points for you to note with more details contained in the Joining Instructions. Please download the Joining Instructions and any other academic related information from Kyambogo University website ',
        { continued: true }
      )
      .text('https://kyu.ac.ug.', {
        continued: false,
        link: 'https://kyu.ac.ug',
        underline: true,
      })
      .moveDown()
      .text('Page 1 of 2', { align: 'center' })

      .addPage()
      .font('Times-Bold')
      .fontSize(16)
      .text('IMPORTANT THINGS TO NOTE', {
        align: 'center',
      })
      .moveDown(0.5)
      .fontSize(10)
      .font('Times-Roman')
      .text(
        '1. All students should complete all registration formalities within eight (08) weeks from the starting date of the Academic Year or Semester. Only registered students are bonafide students of the University.  All fresh students who do not register within this time will be deemed to have turned down the offer of admission.'
      )
      .moveDown(0.5)
      .text(
        '2. For a candidate to qualify to be a recognized student of the University, he/she must be registered. Registration is an obligatory prerequisite of the University, which must be done by all students irrespective of sponsorship status within the first three (3) weeks from the beginning of the semester by every student. Registration will be held in designated areas as shall be communicated. Ensure that you complete all the required registration formalities within the prescribed time in order to avoid inconveniences later.'
      )
      .moveDown(0.5)
      .text(
        '3. Any student who intends to withdraw from the University shall do so in writing, and only after registration. Except on grounds of medical incapacitation, withdrawal shall be valid for a period of only one Academic Year. '
      )
      .moveDown(0.5)
      .text(
        '4. Students granted permission to withdraw, shall be required to resume studies as stated in the letters granting them permission to withdraw. '
      )
      .moveDown(0.5)
      .text(
        '5. Full contact addresses of students, parents/guardians must be provided on the Verification Forms.'
      )
      .moveDown(0.5)
      .text(
        '6. The University runs a seven-day week.  Lectures, tests, practicals and examinations shall therefore be conducted on any of the seven days of the week.'
      )
      .moveDown(0.5)
      .text(
        '7. Always obtain marked scripts of your coursework, tests, practicals and reports and keep them securely at all times until you complete your studies.'
      )
      .moveDown(0.5)
      .text(
        '8. Fees defaulters shall not be allowed to attend lectures, do coursework/tests or sit any examinations. It is an offence to sit examinations without completing payment of fees or obtaining authority from designated officer of the University.'
      )
      .moveDown(0.5)
      // TODO: To be dynamic from Users
      .text('9. You are invited to attend the ', {
        continued: true,
      })
      .font('Times-Bold')
      .text('22nd KyU Admissions Ceremony', {
        continued: true,
      })
      .font('Times-Roman')
      .text(
        ' scheduled on a date to be advised, while dressed in an Undergraduate students’ gown. The gown shall be issued by the office of the Dean of Students upon payment and presentation of your registration token.',
        {
          continued: false,
        }
      )
      .moveDown(0.5)
      .text(
        '10. Only verified and registered students will be invited to attend the Admissions Ceremony.'
      )
      .moveDown(0.5);

    if (toUpper(student.sponsorship) === 'GOVERNMENT') {
      pdfDoc
        .text(
          `${++bulleting}. All government-sponsored students should have mobile telephone numbers registered in his/her names and file this information with the Office of the Dean of Students immediately after registration.`
        )
        .moveDown(0.5)
        .text(
          `${++bulleting}. Government sponsored students should note that their sponsorship is only valid for the duration stated on this admission letter. Any extensions of your study shall not be financed by the Government of Uganda.`
        )
        .moveDown(0.5);
    }

    pdfDoc
      .text(
        `${++bulleting}. Breach of any University Rules and Regulations shall lead to dire consequences, including dismissal from the University. Acquaint yourself with these and any other University regulations from the outset.`
      )
      .moveDown(0.5)
      .text(
        `${++bulleting}. All admitted students are required to sign this letter in the space provided below and return a copy to the Admissions Office through the Faculty/School Administrator who issued the letter to him/her.`
      )
      .moveDown(0.5)
      .text(
        `${++bulleting}. I congratulate you upon your admission and wish you success in your studies as a student of Kyambogo University.`
      )
      .moveDown(0.5)
      .text(
        `${++bulleting}. You are required to enrol into the University using the online enrolling system accessed using internet services at`
      )
      .font('Times-Bold')
      .text('https://myportal.kyu.ac.ug.', {
        continued: true,
        underline: true,
        link: 'https://myportal.kyu.ac.ug',
      })
      .font('Times-Roman')
      .text(
        ' By enrolling you are informing the University that you have reported and shall be available for the semester.  Enrolling must be done every semester.',
        { underline: false }
      )
      .moveDown(0.5)
      .text(
        `${++bulleting}. Candidates are warned that cases of impersonation, falsification of documents or giving false/incomplete information whenever discovered either at registration or afterwards, will lead to automatic cancellation of admission, besides being referred to Police for Prosecution. `
      )
      .moveDown()
      .text('Yours faithfully,')
      .image(path.join(`${mukTemplatePath}/AR-sign-01.png`), {
        width: 200,
        height: 50,
      })
      .text('Annie Begumisa (Ph.D)')
      .moveDown(0.5)
      .font('Times-Bold')
      .text('ACADEMIC REGISTRAR')
      .text('COMMITMENT BY STUDENT', { align: 'center' })
      .moveDown()
      .font('Times-Roman')
      .text(
        'I, ...................................................................................................................................., having been duly admitted by the Kyambogo University Admissions Board, do accept the offer of admission and promise to abide by all the Regulations of the University governing my status as a student of Kyambogo University. '
      )
      .moveDown(0.5)
      .text(
        `SIGNED: ............................................................ THIS .......................... DAY OF ....................................${new Date().getFullYear()}.`
      )
      .moveDown(toUpper(student.sponsorship) === 'GOVERNMENT' ? 0.8 : 2)
      .text('Page 2 of 2', { align: 'center' });

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
   * PRINT KYAMBOGO UNIVERSITY ADMISSION LETTER FOR A SINGLE STUDENT
   * Author: MANZEDE BENARD
   * DATE CREATED: 03-DEC-2021
   * @param {*} student
   * @returns string
   *
   */
  printKYUGraduateAdmissionLetter(student) {
    const admissionLetterName = `KYU-${student.studentNumber}.pdf`;
    const pdfDoc = new PDFTableDocument({
      size: 'A4',
      layout: 'portrait',
      margins: {
        top: 50,
        bottom: 50,
        left: 40,
        right: 40,
      },
      permissions: {
        copying: false,
        modifying: false,
      },
      info: {
        Author: 'MANZEDE BENARD <manzede@gmail.com>',
        Title: 'PROVISIONAL ADMISSION LETTER',
        Creator: 'KYAMBOGO UNIVERSITY',
        Keywords: 'GRADUATE STUDENT ADMISSION LETTER, UNIVERSITY ADMISSION',
      },
    });

    const mukTemplatePath = path.join(
      appConfig.ASSETS_ROOT_DIRECTORY,
      `documents/templates/KYU`
    );

    const studentProgramme = `${student.programme_title} - (${
      student.alias_code || student.programme_code
    })`;

    pdfDoc
      .moveDown(13)
      .fontSize(10)
      .font('Times-Bold')
      .text('Print Date:')
      .moveUp()
      .font('Times-Roman')
      .text(student.printDate, {
        indent: 130,
      })

      .moveDown(0.5)
      .font('Times-Bold')
      .text('Name:')
      .moveUp()
      .font('Times-Roman')
      .text(student.name, {
        indent: 130,
      })
      .font('Times-Bold')
      .moveUp()
      .text('Nationality:', {
        indent: 270,
      })
      .moveUp()
      .font('Times-Roman')
      .text(capitalize(student.nationality) || '-------', {
        indent: 370,
      })

      .moveDown(0.5)
      .font('Times-Bold')
      .text('KyU Admission No.:')
      .moveUp()
      .font('Times-Roman')
      .text(student.registrationNumber, {
        indent: 130,
      })
      .font('Times-Bold')
      .moveUp()
      .text('Student No.:', {
        indent: 270,
      })
      .moveUp()
      .font('Times-Roman')
      .text(student.studentNumber, {
        indent: 370,
      })

      .moveDown(0.5)
      .font('Times-Bold')
      .text('Hall of Attachment:')
      .moveUp()
      .font('Times-Roman')
      .text(student.hall_of_attachment || '-------', {
        indent: 130,
      })
      .font('Times-Bold')
      .moveUp()
      .text('Residence Status:', {
        indent: 270,
      })
      .moveUp()
      .font('Times-Roman')
      .text(student.hall_of_residence || 'NON-RESIDENT', {
        indent: 370,
      })

      .moveDown(0.5)
      .font('Times-Bold')
      .text('Sponsorship:')
      .moveUp()
      .font('Times-Roman')
      .text(student.sponsorship || '-------', {
        indent: 130,
      })

      .moveDown(0.5)
      .font('Times-Bold')
      .text('Programme Name and Code:')
      .moveUp()
      .font('Times-Roman');

    if (studentProgramme.length <= 63) {
      pdfDoc.text(studentProgramme, {
        indent: 130,
      });
    } else {
      const programmeWords = studentProgramme.split(' ');

      let firstText = '';

      let breakIndex = 0;

      for (let index = 0; index <= programmeWords.length; index++) {
        const word = programmeWords[index];

        const newText = index === 0 ? word : `${firstText} ${word}`;

        if (newText.length <= 63) {
          firstText = newText;
        } else {
          breakIndex = index;
          break;
        }
      }

      const secondText = programmeWords.splice(breakIndex).join(' ');

      pdfDoc
        .text(firstText, {
          indent: 130,
        })
        .text(secondText, { indent: 130 });
    }

    pdfDoc
      .moveDown(0.5)
      .text('Dear Student,')
      .font('Times-Bold')
      .moveDown(0.5)
      .text(
        `GRADUATE ADMISSION LETTER FOR ${student.academicYear} ACADEMIC YEAR`,
        {
          align: 'center',
          underline: true,
        }
      )
      .moveDown(0.5)
      .font('Times-Roman')
      .text(
        `I write to offer you a place on the above programme of study for the Academic Year `,
        { continued: true }
      )
      .font('Times-Bold')
      .text(student.academicYear, { continued: true })
      .font('Times-Roman')
      .text(
        '. This is a provisional offer made on the basis of the qualification as presented on your Application Form.'
      )
      .moveDown()
      .text('You are expected to activate your ', {
        continued: true,
      })
      .font('Times-Bold')
      .text('STUDENT’S PORTAL', {
        continued: true,
      })
      .font('Times-Roman')
      .text(
        ' in order to access fees structure, make payments and register every semester through the link: ',
        {
          continued: true,
        }
      )
      .font('Times-Bold')
      .text('https://myportal.kyu.ac.ug.', {
        continued: true,
        underline: true,
        link: 'https://myportal.kyu.ac.ug',
      })
      .font('Times-Roman')
      .text(' For the very first time, your ', {
        continued: true,
        underline: false,
      })
      .font('Times-Bold')
      .text('User ID', {
        continued: true,
      })
      .font('Times-Roman')
      .text(' is your ', {
        continued: true,
      })
      .font('Times-Bold')
      .text('Student Number', {
        continued: true,
      })
      .font('Times-Roman')
      .text(' and your ', {
        continued: true,
      })
      .font('Times-Bold')
      .text('Password', {
        continued: true,
      })
      .font('Times-Roman')
      .text(' is also your ', {
        continued: true,
      })
      .font('Times-Bold')
      .text('Student Number', {
        continued: true,
      })
      .font('Times-Roman')
      .text(' found on your Admission Letter. ', {
        continued: false,
      })

      .moveDown()
      .text(
        'For purpose of verification, you must bring with you the following:'
      )

      // (a)
      .moveDown(0.5)
      .text('(a)   ', { continued: true })
      .font('Times-Bold')
      .text('Original ', {
        continued: true,
      })
      .font('Times-Roman')
      .text('Uganda Certificate of Education ', {
        continued: true,
      })
      .font('Times-Bold')
      .text('Result slip', {
        continued: true,
        underline: true,
      })
      .font('Times-Roman')
      .text(' and ', {
        continued: true,
        underline: false,
      })
      .font('Times-Bold')
      .text('Certificate', {
        continued: true,
        underline: true,
      })
      .font('Times-Roman')
      .text(' (or equivalent) plus three (3) photo copies of each.', {
        underline: false,
        continued: false,
      })

      // (b)
      .moveDown(0.5)
      .text('(b)   ', { continued: true })
      .font('Times-Bold')
      .text('Original ', {
        continued: true,
      })
      .font('Times-Roman')
      .text('Uganda Advanced Certificate of Education ', {
        continued: true,
      })
      .font('Times-Bold')
      .text('Result slip', {
        continued: true,
        underline: true,
      })
      .font('Times-Roman')
      .text(' and ', {
        continued: true,
        underline: false,
      })
      .font('Times-Bold')
      .text('Certificate', {
        continued: true,
        underline: true,
      })
      .font('Times-Roman')
      .text(' (or equivalent) plus three (3) Photostat', {
        continued: false,
        underline: false,
      })
      .text('copies of each.', {
        indent: 20,
      })

      // (c)
      .moveDown(0.5)
      .text('(c)   ', { continued: true })
      .font('Times-Bold')
      .text('Original ', {
        continued: true,
      })
      .font('Times-Roman')
      .text('Bachelors Degree ', {
        continued: true,
      })
      .font('Times-Bold')
      .text('Academic Transcript', {
        continued: true,
        underline: true,
      })
      .font('Times-Roman')
      .text(' and ', {
        continued: true,
        underline: false,
      })
      .font('Times-Bold')
      .text('Certificate', {
        continued: true,
        underline: true,
      })
      .font('Times-Roman')
      .text(' plus three photo copies of each (for Certificate/Diploma/', {
        continued: false,
        underline: false,
      })
      .text('Degree entrants only).', {
        indent: 20,
      })

      // (d)
      .moveDown(0.5)
      .text('(d)   ', { continued: true })
      .font('Times-Bold')
      .text('Six (6)', {
        continued: true,
      })
      .font('Times-Roman')
      .text(
        ' Passport size photographs showing your current likeness (head and shoulders). ',
        {
          continued: false,
          underline: false,
        }
      )

      // (e)
      .moveDown(0.5)
      .text('(e)   An ', { continued: true })
      .font('Times-Bold')
      .text('Identity Card ', {
        continued: true,
      })
      .font('Times-Roman')
      .text(' from the previous School/College, ', {
        continued: true,
        underline: false,
      })
      .font('Times-Bold')
      .text('plus', {
        continued: true,
        underline: true,
      })
      .font('Times-Roman')
      .text(' a ', {
        continued: true,
        underline: false,
      })
      .font('Times-Bold')
      .text('passport ', {
        continued: true,
        underline: true,
      })
      .font('Times-Roman')
      .text(' for foreign students.', {
        continued: false,
        underline: false,
      })

      // (f)
      .moveDown(0.5)
      .text('(f)   ', { continued: true })
      .font('Times-Bold')
      .text('Original', { continued: true })
      .font('Times-Roman')
      .text(' Birth Certificate or ', { continued: true })
      .font('Times-Bold')
      .text('National Identity Card', { continued: true })
      .font('Times-Roman')
      .text(' and three (3) photo copies of it.')

      // (g)
      .moveDown(0.5)
      .text('(e)   ', { continued: true })
      .font('Times-Bold')
      .text(
        'Refugee students should in addition to the above, present proof of refugee status.'
      )
      .font('Times-Roman')

      // (h)
      .moveDown(0.5)
      .text('(h)   ', { continued: true })
      .font('Times-Bold')
      .text('Proof', { continued: true })
      .font('Times-Roman')
      .text(' of payment of Kyambogo University Fees')

      // (i)
      .moveDown(0.5)
      .text('(i)   ', { continued: true, underline: false })
      .font('Times-Bold')
      .text('Original', { continued: true })
      .font('Times-Roman')
      .text(
        ' National Council for Higher Education (NCHE) Fees Payment Deposit Slip plus three (3) photo copies of it. ',
        { continued: false }
      )

      // (i)
      .moveDown(0.5)
      .text('(j)   Internet enabled device that can ', {
        continued: true,
        underline: false,
      })
      .font('Times-Bold')
      .text('facilitate e-learning.', {
        continued: false,
      })

      .moveDown(0.5)
      .font('Times-Bold')
      .text(
        'N.B The mode of instruction shall be blended i.e., face-to-face and on-line. You are required to have an internet enabled device preferably a laptop or tablet to access internet for on-line teaching.',
        {
          continued: false,
        }
      )
      .font('Times-Roman')

      .moveDown()
      .text('Yours faithfully,')
      .image(path.join(`${mukTemplatePath}/AR-sign-01.png`), {
        width: 200,
        height: 50,
      })
      .text('Annie Begumisa (Ph.D)')
      .moveDown(0.5)
      .font('Times-Bold')
      .text('ACADEMIC REGISTRAR');

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
   * GENERATE APPLICANTS ACCEPTANCE LETTER
   *
   * @param {*} student
   * @param {*} res
   * @returns
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
        Creator: 'KYAMBOGO UNIVERSITY',
        Keywords:
          'CHANGE OF PROGRAMME, ACCEPTANCE LETTER, UNIVERSITY ADMISSION',
      },
    });

    const templatePath = path.join(
      appConfig.ASSETS_ROOT_DIRECTORY,
      `documents/templates/KYU`
    );

    pdfDoc
      .image(path.join(`${templatePath}/bg-logo.png`), 100, 240, {
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
      .text('KYAMBOGO', {
        bold: true,
        align: 'left',
        indent: 70,
      })
      .image(path.join(`${templatePath}/KYU-LOGO.png`), 260, 30, {
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
        'P. O. Box 1 KYAMBOGO, Tel: 0414-286237/8/285037, Email: arkyu@kyu.ac.ug',
        {
          align: 'center',
        }
      )
      .moveDown(0.2)
      .text('Website:  http://www.kyu.ac.ug', {
        link: 'http://www.kyu.ac.ug',
        align: 'center',
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
      .image(path.join(`${templatePath}/AR-sign-01.png`), {
        width: 200,
        height: 50,
      })
      .text('Annie Begumisa (Ph.D),')
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
      .font('Times-Bold')
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
      .text('Cc  Dean/Head of Department of the Receiving Faculty/School.')
      .text('Dean/Head of Department of the Original Faculty/School.', {
        indent: 20,
      })
      .text('The Deputy Registrar Admissions Division.', {
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

module.exports = KYUDocumentHelper;
