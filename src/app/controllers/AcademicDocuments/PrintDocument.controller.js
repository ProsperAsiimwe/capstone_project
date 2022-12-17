const HttpResponse = require('@helpers/http-response');
const PDFMerger = require('pdf-merger-js');
const QRCode = require('qrcode');
const {
  includes,
  orderBy,
  sumBy,
  chunk,
  replace,
  capitalize,
  words,
  map,
  find,
  flatten,
  trimStart,
  filter,
} = require('lodash');
const moment = require('moment');
const fs = require('fs');
const path = require('path');
const uuid = require('uuid');
const puppeteer = require('puppeteer');
const {
  isEmpty,
  groupBy,
  split,
  pick,
  gte,
  lte,
  toUpper,
  trim,
  isArray,
} = require('lodash');
const { appConfig } = require('@root/config');
const {
  resultsPolicyService,
  studentService,
  academicDocumentService,
  graduationListService,
  feesAmountPreviewService,
  documentSettingService,
} = require('@services/index');
const { default: axios } = require('axios');
const sequelize = require('sequelize');
const {
  getStudentSemesterResults,
} = require('@controllers/Helpers/semesterResultsHelper');
const {
  capitalizeWords,
} = require('@controllers/Helpers/academicDocumentHelper');

const http = new HttpResponse();

class PrintDocumentController {
  async generateCertificate(req, res) {
    try {
      const { studentNumbers } = req.body;
      const { user } = req;
      const {
        headers: { authorization },
      } = req;

      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox'],
        defaultViewport: null,
      });
      const page = await browser.newPage();

      await page.setViewport({
        width: 1920,
        height: 1080,
      });

      await page.setExtraHTTPHeaders({
        Authorization: authorization,
      });

      for (const studentNumber of studentNumbers) {
        const findStudent = await studentService.findByRegNoOrStudentNo(
          studentNumber,
          {
            attributes: [
              'registration_number',
              'id',
              'student_number',
              'programme_id',
            ],
            include: [
              {
                association: 'programme',
                attributes: ['programme_study_level_id', 'award_id'],
                include: {
                  association: 'award',
                  attributes: ['metadata_value'],
                },
              },
            ],
          }
        );

        if (!findStudent) {
          throw new Error(`Invalid Student Number provided - ${studentNumber}`);
        }

        const result = await getStudentSemesterResults(
          findStudent.registration_number
        );

        if (!result) {
          throw new Error(
            `This Student has no result records ${studentNumber}`
          );
        }

        const finalList =
          await graduationListService.fetchStudentFinalGraduation({
            student_programme_id: findStudent.id,
          });

        if (
          !finalList ||
          !finalList.graduation_congregation_number ||
          !finalList.completion_year ||
          !finalList.graduation_date
        ) {
          throw new Error(
            `This Student number: ${studentNumber} has not been graduated with Graduation dates`
          );
        }

        const degreeClasses =
          await resultsPolicyService.findOneStudyLevelDegreeClassPolicy({
            where: {
              programme_study_level_id:
                findStudent['programme.programme_study_level_id'],
            },
            attributes: ['id', 'programme_study_level_id'],
            include: [
              {
                association: 'allocations',
                attributes: ['name', 'range_from', 'range_to'],
              },
            ],
          });

        if (!degreeClasses)
          throw new Error(
            `No Degree class has been defined for student ${studentNumber}`
          );

        let finalCGPA = '0.0';

        if (result.semesters.length > 0) {
          finalCGPA = result.semesters[result.semesters.length - 1].cgpa;
        }

        let resultClass;

        degreeClasses.allocations.forEach((degreeClass) => {
          if (
            gte(finalCGPA, degreeClass.range_from) &&
            lte(finalCGPA, degreeClass.range_to)
          ) {
            resultClass = degreeClass.name;
          }
        });

        const fileName = `CRT-${studentNumber}.pdf`;
        const uuidCodes = split(uuid.v4().toUpperCase(), '-');
        const serialNumber = uuidCodes[4];
        const certificateID = `KYU-${uuidCodes[3]}${uuidCodes[2]}`;
        const verificationLink = `${appConfig.DOCUMENT_VERIFICATION_LINK}/verify_transcript?studentNumber=${studentNumber}&sn=${serialNumber}`;
        const qrCode = await QRCode.toDataURL(verificationLink, {
          type: 'image/png',
          margin: 0,
          width: 105,
        });

        const document = {
          programmeTitle: toUpper(result.programme_title),
          programmeCode: toUpper(result.programme_code),
          programmeCategory: toUpper(
            findStudent['programme.award.metadata_value']
          ),
          certificateID,
          congregation: finalList.graduation_congregation_number,
          serialNumber,
          studentNumber,
          qrCode,
          graduationDate: finalList.graduation_date,
          classObtained: resultClass,
          avatar: result.avatar,
          name: trim(toUpper(`${result.surname} ${result.other_names}`)),
        };

        await page.goto(
          `${appConfig.APP_URL}/api/v1/academic-documents/print/render/certificate?stdN=${studentNumber}&sn=${serialNumber}&cid=${certificateID}&prog=${document.programmeTitle}&code=${document.programmeCode}&award=${document.programmeCategory}&gradNo=${document.congregation}&gradDate=${document.graduationDate}&class=${document.classObtained}&name=${document.name}&pp=${document.avatar}`,
          {
            waitUntil: 'networkidle2',
          }
        );

        const certificatePath = path.join(
          appConfig.ASSETS_ROOT_DIRECTORY,
          `documents/certificates/${fileName}`
        );

        await page.pdf({
          format: 'A4',
          printBackground: true,
          path: certificatePath,
        });

        await page
          .$eval('body > div > div > div > h1', (el) => el.textContent)
          .catch(async () => {
            fs.access(certificatePath, fs.constants.F_OK, async (err) => {
              if (!err) {
                await fs.unlinkSync(certificatePath);
              }
            });

            const errorMsg = await page.$eval(
              'body > h3',
              (el) => el.textContent
            );

            throw new Error(
              `Unable to generate transcript for ${studentNumber} - ${errorMsg}`
            );
          });

        await academicDocumentService.updateOrCreate(
          {
            student_programme_id: findStudent.id,
            certificate_name: fileName,
            certificate_serial_number: serialNumber,
            certificate_id: certificateID,
            certificate_date_printed: moment.now(),
            graduation_date: finalList.graduation_date,
            certificate_created_by_id: user.id,
            graduation_congregation_number:
              finalList.graduation_congregation_number,
            graduation_year: finalList.graduation_year,
          },
          findStudent.id
        );
      }

      http.setSuccess(200, 'Certificate Generated successfully', {});

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to print this certificate', {
        error: error.message,
      });

      return http.send(res);
    }
  }

  async generateTranscript(req, res) {
    try {
      const { studentNumbers, entryType, remark } = req.body;
      const { user } = req;
      const {
        headers: { authorization },
      } = req;

      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox'],
        defaultViewport: null,
      });
      const page = await browser.newPage();

      await page.setViewport({
        width: 1920,
        height: 1080,
      });

      await page.setExtraHTTPHeaders({
        Authorization: authorization,
      });

      for (const studentNumber of studentNumbers) {
        const fileName = `TRA-${studentNumber}.pdf`;
        const uuidCodes = split(uuid.v4().toUpperCase(), '-');

        let serialNumber = uuidCodes[4];

        const findStudent = await studentService.findByRegNoOrStudentNo(
          studentNumber
        );

        if (appConfig.TAX_HEAD_CODE === 'FMUK01') {
          serialNumber = `${moment().format('YYYYDDMM')}${serialNumber}`;
        }

        const finalList =
          await graduationListService.fetchStudentFinalGraduation({
            student_programme_id: findStudent.id,
          });

        if (!finalList || !finalList.completion_year) {
          throw new Error(
            `This Student number: ${studentNumber} has has no completion year`
          );
        }

        await page.goto(
          `${appConfig.APP_URL}/api/v1/academic-documents/print/render?stdNo=${studentNumber}&sN=${serialNumber}&cY=${finalList.completion_year}&entry=${entryType}&remark=${remark}`,
          {
            waitUntil: 'networkidle2',
          }
        );

        const transcriptPath = path.join(
          appConfig.ASSETS_ROOT_DIRECTORY,
          `documents/transcripts/${fileName}`
        );

        const institution = appConfig.TAX_HEAD_CODE;

        let evaluate = 'body > div > div > h1';

        if (institution === 'FGUL06') evaluate = 'body > div > div > div > img';
        if (institution === 'FMUK01') evaluate = 'body > div > img';

        await page.pdf({
          format: 'A4',
          printBackground: true,
          path: transcriptPath,
          preferCSSPageSize: true,
        });

        await page
          .$eval(evaluate, (el) => el.textContent)
          .catch(async () => {
            await fs.unlinkSync(transcriptPath);
            const errorMsg = await page.$eval(
              'body > h3',
              (el) => el.textContent
            );

            throw new Error(
              `Unable to generate transcript for ${studentNumber} - ${errorMsg}`
            );
          });

        await academicDocumentService.updateOrCreate(
          {
            student_programme_id: findStudent.id,
            transcript_name: fileName,
            transcript_serial_number: serialNumber,
            transcript_date_printed: moment.now(),
            transcript_id: uuidCodes[0],
            completion_year: finalList.completion_year,
            transcript_created_by_id: user.id,
            entry_type: entryType,
          },
          findStudent.id
        );
      }
      await browser.close();

      http.setSuccess(200, 'Document Printed successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to print this transcript', {
        error: error.message,
      });

      return http.send(res);
    }
  }

  async renderTranscriptView(req, res) {
    try {
      const {
        stdNo: studentNumber,
        sN: serialNumber,
        cY: completionYear,
        entry: entryType,
        remark,
      } = req.query;
      const institutionCode = appConfig.TAX_HEAD_CODE;
      const verificationLink = `${appConfig.DOCUMENT_VERIFICATION_LINK}/verify_transcript?studentNumber=${studentNumber}&sn=${serialNumber}`;

      const qrCode = await QRCode.toDataURL(verificationLink, {
        type: 'image/png',
        margin: 0,
        width: 105,
      });

      if (
        isEmpty(studentNumber) ||
        isEmpty(serialNumber) ||
        (isEmpty(entryType) && isEmpty(completionYear))
      ) {
        throw new Error('Invalid Student Number or serialNumber Provided');
      }

      const findStudent = await studentService
        .findByRegNoOrStudentNo(studentNumber, {
          attributes: [
            'id',
            'registration_number',
            'programme_id',
            'programme_version_id',
            'entry_study_year_id',
          ],
          include: [
            {
              association: 'programme',
              attributes: ['programme_study_level_id', 'has_dissertation'],
              include: [
                {
                  association: 'studyLevel',
                  attributes: ['metadata_value'],
                },
              ],
            },
            {
              association: 'versionEntryYears',
              attributes: ['entry_year_id', 'graduation_load'],
            },
            {
              association: 'entryAcademicYear',
              attributes: ['metadata_value'],
            },
            {
              association: 'entryStudyYear',
              attributes: ['programme_study_year_id', 'programme_study_years'],
            },
            {
              association: 'student',
              attributes: ['nationality', 'gender'],
            },
          ],
          raw: false,
          plain: true,
        })
        .then((res) => (res ? res.toJSON() : null));

      if (!findStudent) throw new Error('Invalid Student Number entered');

      const finalList = await graduationListService.fetchStudentFinalGraduation(
        {
          student_programme_id: findStudent.id,
        }
      );

      let graduationLoad = 0;

      const findGradLoad = find(
        findStudent.versionEntryYears,
        (vEntryY) =>
          parseInt(vEntryY.entry_year_id, 10) ===
          parseInt(findStudent.entryStudyYear.programme_study_year_id, 10)
      );

      if (findGradLoad) {
        graduationLoad = findGradLoad.graduation_load;
      }

      if (
        !finalList ||
        !finalList.graduation_congregation_number ||
        !finalList.completion_year ||
        !finalList.graduation_date
      ) {
        throw new Error(
          `This Student number: ${studentNumber} has not been graduated with Graduation dates`
        );
      }

      const result = await getStudentSemesterResults(
        findStudent.registration_number
      );

      if (!result) throw new Error('No Results found for this student');

      const studentData = pick(result, [
        'student_number',
        'registration_number',
        'date_of_birth',
        'gender',
        'avatar',
        'department_title',
        'faculty_title',
        'college_code',
        'college_title',
        'programme_title',
        'faculty_code',
        'hall_of_attachment',
        'programme_code',
        'is_classified',
        'has_dissertation',
        'surname',
        'other_names',
        'dissertation_title',
        'dissertation_description',
      ]);

      let orderSemesterCourses = [];

      if (isArray(result.semesters)) {
        orderSemesterCourses = result.semesters.map((semester) => {
          let newSemesterResults = semester.results;

          if (institutionCode === 'FGUL06') {
            newSemesterResults = map(semester.results, (res) => ({
              ...res,
              course_unit_name: capitalizeWords(res.course_unit_name),
            }));
          }

          return {
            ...semester,
            results: orderBy(newSemesterResults, 'course_unit_code'),
          };
        });
      }

      const allResults = flatten(map(result.semesters, 'results'));

      const hasRetake =
        filter(allResults, (res) => res.retake_count >= 1).length > 0;

      const studyYears = groupBy(orderSemesterCourses, 'programme_study_year');
      const degreeClasses =
        await resultsPolicyService.findOneStudyLevelDegreeClassPolicy({
          where: {
            programme_study_level_id:
              findStudent.programme.programme_study_level_id,
          },
          attributes: ['id', 'programme_study_level_id'],
          include: [
            {
              association: 'allocations',
              attributes: ['name', 'range_from', 'range_to'],
            },
          ],
        });

      let finalCGPA = '0.0';

      if (result.semesters.length > 0) {
        finalCGPA = result.semesters[result.semesters.length - 1].cgpa;
      }

      if (isEmpty(degreeClasses)) throw new Error('No Degree classes defined');

      let resultClass;

      if (studentData.is_classified) {
        degreeClasses.allocations.forEach((degreeClass) => {
          if (
            gte(finalCGPA, degreeClass.range_from) &&
            lte(finalCGPA, degreeClass.range_to)
          ) {
            resultClass = degreeClass.name;
          }
        });

        if (isEmpty(resultClass)) throw new Error('Invalid classes defined');
      }

      let avatar = `${appConfig.APP_URL}/photos/student-photos/${studentData.avatar}`;

      let institutionPath = 'KYU';

      if (institutionCode === 'FGUL06') institutionPath = 'GUL';

      await axios.get(avatar).catch(() => {
        avatar = `${appConfig.APP_URL}/documents/templates/${institutionPath}/default.png`;
      });

      const transcriptData = {
        studentData: {
          name: trim(`${studentData.surname} ${studentData.other_names}`),
          qrCode,
          ...studentData,
          hasRetake,
          date_of_birth: toUpper(
            moment(studentData.date_of_birth).format('ddd DD-MMM-YYYY')
          ),
          avatar,
          studyYears,
          studyYearKeys: chunk(Object.keys(studyYears), 4),
          finalCGPA,
          resultClass,
          completionYear,
          completionDate: moment(finalList.graduation_date).format('MMMM YYYY'),
          entryType,
          graduation_load: graduationLoad,
          appURL: appConfig.APP_URL,
        },
        title: 'STUDENT TRANSCRIPT',
        verificationLink,
        serialNumber,
        moment,
      };

      if (appConfig.TAX_HEAD_CODE === 'FGUL06') {
        transcriptData.studentData = {
          ...transcriptData.studentData,
          date_of_birth: moment(studentData.date_of_birth).format(
            'Do MMMM, YYYY'
          ),
          name: `${toUpper(result.surname)} ${words(result.other_names)
            .map((n) => capitalize(n))
            .join(' ')}`,
          nationality: map(split(findStudent.student.nationality, ' '), (n) =>
            capitalize(n)
          ).join(' '),
          graduation_date: moment(finalList.graduation_date).format(
            'Do MMMM, YYYY'
          ),
          gender: capitalize(studentData.gender),
          first_registration: findStudent.entryAcademicYear.metadata_value,
          programme_title: capitalizeWords(studentData.programme_title),
          faculty_title: trimStart(
            capitalizeWords(studentData.faculty_title),
            'Faculty of'
          ),
          resultClass: capitalizeWords(resultClass),
          degreeCategory: ['POSTGRADUATE DIPLOMA', 'PHD', 'MASTERS'].includes(
            findStudent.programme.studyLevel.metadata_value
          )
            ? 'POSTGRADUATE'
            : 'UNDERGRADUATE',
        };
      } else if (appConfig.TAX_HEAD_CODE === 'FMUK01') {
        const [firstSemester] = orderSemesterCourses;

        let chunkValue = orderSemesterCourses.length / 2;

        if (orderSemesterCourses.length % 2 !== 0) {
          chunkValue++;
        }

        let chunkResults = chunk(orderSemesterCourses, chunkValue);

        const [firstResults, secondResults] = chunkResults;

        if (firstResults && secondResults) {
          const getFirstResults = flatten(map(firstResults, 'results'));
          const getSecondResults = flatten(map(secondResults, 'results'));

          if (getSecondResults.length - getFirstResults.length > 5) {
            chunkResults = chunk(orderSemesterCourses, chunkValue + 1);
          }
        }

        const findSignature = await documentSettingService.findOne({
          where: {
            document_type: 'TRANSCRIPT',
            is_active: true,
          },
          attributes: ['signature_name'],
        });

        if (!findSignature) throw new Error('No Signature uploaded');

        const lastElement = orderSemesterCourses.pop();

        transcriptData.studentData = {
          ...transcriptData.studentData,
          date_of_birth: moment(studentData.date_of_birth).format(
            'Do MMMM, YYYY'
          ),
          remark,
          signature: findSignature.signature_name,
          chunkResults,
          completionDate: finalList.completion_year,
          totalCumulativeCUs: lastElement.cumulative_tcu || 0,
          name: `${toUpper(result.surname)} ${words(result.other_names)
            .map((n) => capitalize(n))
            .join(' ')}`,
          surname: toUpper(trim(result.surname)),
          other_names: trim(transcriptData.other_names),
          printDate: moment().format('Do MMMM YYYY'),
          nationality: map(split(findStudent.student.nationality, ' '), (n) =>
            capitalize(n)
          ).join(' '),
          gender: capitalize(studentData.gender),
          first_registration: split(firstSemester.academic_year, '/')[0],
          programme_code: toUpper(studentData.programme_code),
          faculty_code: toUpper(studentData.faculty_code),
          resultClass: capitalizeWords(resultClass),
          faculty_title: trimStart(
            capitalizeWords(studentData.faculty_title),
            'School of'
          ),
          capitalizeWords,
          hall_of_attachment: capitalizeWords(studentData.hall_of_attachment),
          degreeCategory: ['POSTGRADUATE DIPLOMA', 'PHD', 'MASTERS'].includes(
            findStudent.programme.studyLevel.metadata_value
          )
            ? 'Postgraduate'
            : 'Undergraduate',
        };
      }

      switch (institutionCode) {
        case 'FKYU03':
          res.render('KYUTranscript', transcriptData);
          break;

        case 'FGUL06':
          res.render('GULTranscript', transcriptData);
          break;

        case 'FMUK01':
          res.render('MAKTranscript', transcriptData);
          break;

        default:
          throw new Error('Your Institution Template has not been set');
      }
    } catch (error) {
      res.render('error', {
        message: error.message,
        error: {
          stack: 'TRANSCRIPT PREVIEW',
          status: 400,
        },
        version: '1.0.0',
      });
    }
  }

  async renderCertificateView(req, res) {
    try {
      const {
        stdN: studentNumber,
        sn: serialNumber,
        cid: certificateID,
        gradNo,
        gradDate,
        name,
        prog,
        award,
        pp,
        class: degreeClass,
        code,
      } = req.query;
      const institutionCode = appConfig.TAX_HEAD_CODE;
      const graduationNo = moment
        .localeData()
        .ordinal(gradNo)
        .replace(/(\d)(st|nd|rd|th)/g, '$1<sup>$2</sup>');
      const graduationDate = moment(gradDate, 'YYYY-MM-DD')
        .format('Do MMMM, YYYY')
        .replace(/(\d)(st|nd|rd|th)/g, '$1<sup>$2</sup>');

      const verificationLink = `${appConfig.DOCUMENT_VERIFICATION_LINK}/verify_transcript?studentNumber=${studentNumber}&sn=${serialNumber}`;

      const qrCode = await QRCode.toDataURL(verificationLink, {
        type: 'image/png',
        margin: 0,
        width: 95,
      });

      if (
        isEmpty(studentNumber) ||
        !name ||
        !pp ||
        !prog ||
        !award ||
        !studentNumber ||
        !serialNumber ||
        !certificateID ||
        !gradNo ||
        !gradDate
      ) {
        throw new Error('Invalid context PROVIDED');
      }

      let avatar = `${appConfig.APP_URL}/photos/student-photos/${pp}`;

      let institutionPath = 'KYU';

      if (institutionCode === 'FGUL06') institutionPath = 'GUL';

      await axios.get(avatar).catch(() => {
        avatar = `${appConfig.APP_URL}/documents/templates/${institutionPath}/default.png`;
      });

      const templateData = {
        title: 'STUDENT CERTIFICATE',
        serialNumber,
        certificateID,
        qrCode,
        studentData: {
          name: toUpper(name),
          graduationNo,
          graduationDate,
          avatar,
          programmeTitle: prog,
          programmeCode: code,
          award: toUpper(award),
          degreeClass,
        },
      };

      switch (institutionCode) {
        case 'FKYU03': {
          let templateName = 'KYUCertificate';

          let programmeTitle = prog;

          let isHigherDiploma = false;

          if (toUpper(award) === 'DIPLOMA') {
            templateName = 'KYUDiplomaCertificate';
            programmeTitle = replace(toUpper(prog), 'DIPLOMA IN ', '');

            if (toUpper(prog).includes('HIGHER DIPLOMA IN')) {
              programmeTitle = replace(toUpper(prog), 'HIGHER DIPLOMA IN ', '');
              isHigherDiploma = true;
            }
          }

          if (toUpper(award) === 'CERTIFICATE') {
            templateName = 'KYUCertificateCertificate';
            programmeTitle = replace(toUpper(prog), 'CERTIFICATE IN ', '');
          }

          res.render(templateName, {
            ...templateData,
            studentData: {
              ...templateData.studentData,
              isHigherDiploma,
              programme_title: programmeTitle,
            },
          });
          break;
        }
        case 'FGUL06': {
          const newDegreeClass = capitalizeWords(degreeClass);

          const filterTextInBracket = newDegreeClass.match(/\(.+?\)/g);

          let bracketDegreeClass;

          if (filterTextInBracket) {
            bracketDegreeClass = filterTextInBracket.join('');

            templateData.studentData.degreeClass = newDegreeClass.replace(
              bracketDegreeClass,
              ''
            );

            templateData.studentData.bracketDegreeClass = bracketDegreeClass;
            templateData.studentData.graduationNo = gradNo;
            templateData.studentData.student_number = studentNumber;
          }
          res.render('GULCertificate', templateData);
          break;
        }

        default:
          throw new Error('Your Certificate Template has not been Designed');
      }
    } catch (error) {
      res.render('error', {
        message: error.message,
        error: {
          stack: 'CERTIFICATE PREVIEW',
          status: 400,
        },
        version: '1.0.0',
      });
    }
  }

  viewDocument(req, res) {
    try {
      const { category, name } = req.params;
      const documentPath = path.join(
        appConfig.ASSETS_ROOT_DIRECTORY,
        `documents/${
          category === 'admissions' ? 'admissions/letters' : category
        }/${name}`
      );

      fs.access(documentPath, fs.constants.F_OK, (err) => {
        if (err) throw new Error("Document Doesn't exist");
      });

      const pdf = fs.createReadStream(documentPath);

      res.contentType('application/pdf');
      // res.send(pdf);

      pdf.pipe(res);
    } catch (error) {
      http.setError(400, 'Unable to render this document', {
        error: error.message,
      });

      return http.send(res);
    }
  }

  async downloadDocuments(req, res) {
    try {
      const { studentNumbers } = req.body;
      const { category } = req.params;
      const { user } = req;

      let savedFiles = 0;

      if (!category || !includes(['certificate', 'transcript'], category)) {
        throw new Error('Invalid category');
      }
      if (!isArray(studentNumbers)) throw new Error('Invalid Student Numbers');

      const merger = new PDFMerger();

      for (const studentNumber of studentNumbers) {
        const findStudent = await studentService.findByRegNoOrStudentNo(
          studentNumber
        );

        if (findStudent) {
          const findStudentDocument = await academicDocumentService.findOne({
            where: { student_programme_id: findStudent.id },
          });

          let fieldName = 'certificate_name';

          if (category === 'transcript') fieldName = 'transcript_name';

          if (findStudentDocument && findStudentDocument[fieldName]) {
            const fileName = findStudentDocument[fieldName];

            let dataToUpdate = {
              certificate_last_printed_by_id: user.id,
              certificate_print_count: sequelize.literal(
                'certificate_print_count + 1'
              ),
              certificate_last_printed: moment.now(),
            };

            if (category === 'transcript') {
              dataToUpdate = {
                transcript_last_printed_by_id: user.id,
                transcript_print_count: sequelize.literal(
                  'transcript_print_count + 1'
                ),
                transcript_last_printed: moment.now(),
              };
            }

            const updatedDoc = await academicDocumentService.updateRecord(
              findStudentDocument.id,
              dataToUpdate
            );

            if (updatedDoc) {
              const studentDocumentPath = path.join(
                appConfig.ASSETS_ROOT_DIRECTORY,
                `documents/${category}s/${fileName}`
              );

              merger.add(studentDocumentPath);
              savedFiles += 1;
            }
          }
        }
      }

      if (savedFiles === 0) {
        throw new Error('No Files have been merged for printing');
      }

      const documentPath = path.join(
        appConfig.ASSETS_ROOT_DIRECTORY,
        `documents/prints/PRINT-U${user.id}-${toUpper(
          category
        )}-${moment().unix()}.pdf`
      );

      await merger.save(documentPath);

      res.download(documentPath);
    } catch (error) {
      http.setError(400, 'Unable to print student documents', {
        error: error.message,
      });

      return http.send(res);
    }
  }

  async renderAdmissionLetter(req, res) {
    try {
      const context = req.query;
      const institution = appConfig.TAX_HEAD_CODE;

      let viewToRender = '';

      switch (institution) {
        case 'FKYU03': {
          viewToRender = 'KYUAdmissionLetter';
          break;
        }

        case 'FGUL06': {
          const feesContext = {
            programme_id: context.progID,
            entry_academic_year_id: context.eAYID,
            campus_id: context.cID,
            billing_category_id: context.bcID,
            programme_type_id: context.pTID,
            intake_id: context.intID,
          };

          context.progFees = 0;

          const tuitionFees =
            await feesAmountPreviewService.feesStructureTuitionGulu(
              feesContext
            );

          if (tuitionFees) {
            context.progFees = parseInt(
              sumBy(tuitionFees, 'amount'),
              10
            ).toLocaleString();
          }

          viewToRender = 'GULAdmissionLetterPrivate';
          if (toUpper(context.s) === 'GOVERNMENT') {
            viewToRender = 'GULAdmissionLetter';
          }
          break;
        }

        default:
          throw new Error('INVALID INSTITUTION CODE');
      }

      res.render(viewToRender, {
        title: 'ADMISSION LETTER',

        appURL: appConfig.APP_URL,
        student: context,
      });
    } catch (error) {
      res.render('error', {
        message: error.message,
        error: {
          stack: 'TRANSCRIPT PREVIEW PREVIEW',
          status: 400,
        },
        version: '1.0.0',
      });
    }
  }
}

module.exports = PrintDocumentController;
