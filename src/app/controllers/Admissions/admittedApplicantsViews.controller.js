const { HttpResponse } = require('@helpers');
const {
  admittedApplicantsViewsService,
  runningAdmissionViewsService,
  admittedApplicantService,
  metadataValueService,
  deletedAdmittedApplicantService,
  studentService,
  studentProgrammeService,
  subjectCombinationService,
  programmeService,
  facultyService,
} = require('@services/index');
const model = require('@models');
const XLSX = require('xlsx');
const formidable = require('formidable');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const {
  flatten,
  isArray,
  now,
  split,
  toUpper,
  isEmpty,
  capitalize,
  orderBy,
  map,
  trim,
  find,
  difference,
  toString,
  words,
} = require('lodash');
const uuid = require('uuid');
const { appConfig } = require('@root/config');
const http = new HttpResponse();
const moment = require('moment');
const MUKDocumentHelper = require('../AcademicDocuments/MUKDocumentHelper');
const KYUDocumentHelper = require('../AcademicDocuments/KYUDocumentHelper');
const PDFMerger = require('pdf-merger-js');
const {
  getMetadataValueName,
} = require('@controllers/Helpers/programmeHelper');
const {
  validateSheetColumns,
} = require('@controllers/Helpers/uploadValidator');
const mukPdfHelper = new MUKDocumentHelper();
const kyuPdfHelper = new KYUDocumentHelper();

class AdmittedApplicantsViewsController {
  //  admitted applicants

  async admittedApplicants(req, res) {
    try {
      const context = req.query;

      if (
        !context.academic_year_id ||
        !context.intake_id ||
        !context.degree_category_id ||
        !context.admission_scheme_id ||
        !context.programme_id
      ) {
        throw new Error('Invalid Context Provided');
      }

      const applicants =
        await admittedApplicantsViewsService.admittedApplicants(context);

      let mergedStudents = [];

      if (isArray(applicants)) {
        mergedStudents = flatten(
          applicants.map((applicant) => {
            return applicant.admitted_applicants.map((admittedApplicant) => {
              return {
                ...admittedApplicant,
                batch_number: applicant.batch_number,
                programme_code: applicant.programme_code,
                programme_title: applicant.programme_title,
              };
            });
          })
        );
      }

      http.setSuccess(200, 'Admitted Applicant Fetched Successfully', {
        data: orderBy(mergedStudents, ['surname']),
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to fetch Admitted Applicants.', {
        error: error.message,
      });

      return http.send(res);
    }
  }

  //  Admission Programmes
  async admissionProgrammes(req, res) {
    try {
      const context = req.query;

      if (
        !context.academic_year_id ||
        !context.intake_id ||
        !context.degree_category_id ||
        !context.admission_scheme_id ||
        !context.category
      ) {
        throw new Error('Invalid Context Provided');
      }

      let data = [];

      if (context.category === 'DIRECT-UPLOAD') {
        data =
          await runningAdmissionViewsService.admittedDirectUploadProgrammes(
            context
          );
      } else if (context.category === 'SYSTEM-SELECTION') {
        data = await runningAdmissionViewsService.runningAdmissionProgrammes(
          context
        );
      } else {
        throw new Error('Invalid Context Provided');
      }

      http.setSuccess(200, 'Admission Programmes Fetched Successfully', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to fetch Admission Programmes.', {
        error: error.message,
      });

      return http.send(res);
    }
  }

  async applicantWeightingFunction(req, res) {
    try {
      const context = req.query;

      if (!context.programmeCampusId) {
        throw new Error('Invalid Context Provided');
      }

      const data =
        await admittedApplicantsViewsService.applicantWeightingFunction(
          context
        );

      http.setSuccess(200, 'Applicants Fetched Successfully', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to fetch Applicants.', {
        error: error.message,
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
  async selectedApplicants(req, res) {
    try {
      const context = req.query;

      if (!context.programmeCampusId) {
        throw new Error('Invalid Context Provided');
      }

      const data =
        await admittedApplicantsViewsService.selectedApplicantsFunction(
          context
        );

      http.setSuccess(200, 'Applicants Fetched Successfully', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to fetch Applicants.', {
        error: error.message,
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
  async notSelectedApplicants(req, res) {
    try {
      const context = req.query;

      if (!context.programmeCampusId) {
        throw new Error('Invalid Context Provided');
      }

      const data =
        await admittedApplicantsViewsService.notSelectedApplicantsFunction(
          context
        );

      http.setSuccess(200, 'Applicants Fetched Successfully', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to fetch Applicants.', {
        error: error.message,
      });

      return http.send(res);
    }
  }

  // singleAdmittedApplicant

  async singleAdmittedApplicant(req, res) {
    try {
      const context = req.params;

      if (!context.admittedApplicantId) {
        throw new Error('Invalid Context Provided');
      }

      const data = await admittedApplicantsViewsService.singleAdmittedApplicant(
        context
      );

      http.setSuccess(200, 'Admitted Applicant Fetched Successfully', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to fetch Admitted Applicant.', {
        error: error.message,
      });

      return http.send(res);
    }
  }

  async deleteAdmittedApplicants(req, res) {
    try {
      const { applicants } = req.body;
      const { id: userId } = req.user;

      if (isEmpty(applicants)) {
        throw new Error('Please select some students to remove');
      }

      if (isArray(applicants)) {
        for (const applicantId of applicants) {
          const findApplicant =
            await admittedApplicantService.findOneAdmittedApplicant({
              where: { id: applicantId },
              raw: true,
            });

          if (findApplicant) {
            if (findApplicant.student_account_created === true) {
              throw new Error(
                `This student ${findApplicant.surname} ${findApplicant.other_names} has already been pushed to students records and cannot be removed`
              );
            } else {
              await model.sequelize.transaction(async (transaction) => {
                await admittedApplicantService.deleteAdmittedApplicantRecord({
                  where: { id: applicantId },
                  transaction,
                });

                await deletedAdmittedApplicantService.create(
                  {
                    ...findApplicant,
                    deleted_by_id: userId,
                    deleted_at: moment.now(),
                  },
                  transaction
                );
              });
            }
          } else throw new Error('Cannot find applicant record');
        }
      }

      http.setSuccess(200, 'Selected Students Deleted Successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to Delete these selected records.', {
        error: error.message,
      });

      return http.send(res);
    }
  }

  async deleteAdmittedApplicantStudentRecords(req, res) {
    try {
      const { applicants } = req.body;

      if (isEmpty(applicants)) {
        throw new Error('Please select some students to remove');
      }

      await model.sequelize.transaction(async (transaction) => {
        if (isArray(applicants)) {
          for (const applicantId of applicants) {
            const findApplicant =
              await admittedApplicantService.findOneAdmittedApplicant({
                where: { id: applicantId },
                raw: true,
              });

            if (findApplicant) {
              const findStudent = await studentService.findOneStudent({
                where: {
                  email: findApplicant.email,
                  phone: findApplicant.phone,
                  surname: {
                    [Op.or]: [findApplicant.surname, findApplicant.other_names],
                  },
                  other_names: {
                    [Op.or]: [findApplicant.surname, findApplicant.other_names],
                  },
                },
                raw: true,
              });

              if (!findStudent) {
                throw new Error(
                  `No Student record found for: ${findApplicant.surname} ${findApplicant.other_names} in SRM`
                );
              } else {
                await studentProgrammeService.destroy({
                  where: { student_id: findStudent.id },
                  transaction,
                });

                await studentService.destroyStudentApplication({
                  where: { student_id: findStudent.id },
                  transaction,
                });

                await studentService.destroy({
                  where: { id: findStudent.id },
                  transaction,
                });

                await admittedApplicantService.updateAdmittedApplicant(
                  applicantId,
                  {
                    student_account_created: false,
                  },
                  transaction
                );
              }
            } else throw new Error('Cannot find applicant record');
          }
        }
      });

      http.setSuccess(
        200,
        'Selected Student record in SRM Deleted Successfully'
      );

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to Delete similar records in SRM.', {
        error: error.message,
      });

      return http.send(res);
    }
  }

  async printAdmissionLetters(req, res) {
    try {
      const context = req.body;
      const { user } = req;

      const admissionLetterPath = path.join(
        appConfig.ASSETS_ROOT_DIRECTORY,
        'documents/admissions/letters'
      );

      if (!fs.existsSync(admissionLetterPath)) {
        fs.mkdirSync(admissionLetterPath);
      }

      const applicants =
        await admittedApplicantsViewsService.admittedApplicants(context);

      let mergedStudents = [];

      if (isArray(applicants)) {
        mergedStudents = flatten(
          applicants.map((applicant) => {
            return applicant.admitted_applicants.map((admittedApplicant) => {
              return {
                ...admittedApplicant,
                batch_number: applicant.batch_number,
                programme_code: applicant.programme_code,
                programme_title: applicant.programme_title,
              };
            });
          })
        );
      }

      const institution = appConfig.TAX_HEAD_CODE;
      const documentCategory = context.documentType;

      if (isArray(context.applicants) && !isEmpty(context.applicants)) {
        mergedStudents = getSelectedApplicants(
          context.applicants,
          mergedStudents
        );
      }

      const metadataValues = await metadataValueService.findAllMetadataValues({
        include: {
          association: 'metadata',
          attributes: ['id', 'metadata_name'],
        },
        attributes: ['id', 'metadata_value'],
      });

      const degreeCategory = getMetadataValueName(
        metadataValues,
        context.degree_category_id,
        'DEGREE CATEGORIES'
      );

      const academicYear = getMetadataValueName(
        metadataValues,
        context.academic_year_id,
        'ACADEMIC YEARS'
      );

      if (!academicYear)
        throw new Error(
          `No Academic Year event has been defined for ${academicYear}`
        );

      let admissionType = {};

      let facultyDetail = {};

      if (
        institution === 'FMUK01' &&
        degreeCategory === 'POSTGRADUATE' &&
        documentCategory === 'original'
      ) {
        if (!context.reportDate)
          throw new Error('Enter Registration start Date');

        admissionType = await programmeService.findOneProgramme({
          where: { id: context.programme_id },
          include: [
            {
              association: 'admissionType',
              attributes: ['metadata_value'],
            },
          ],
          attributes: ['id', 'programme_duration'],
          raw: true,
        });

        if (admissionType && !admissionType['admissionType.metadata_value'])
          throw new Error(
            `No Admission Type has been defined for this programme in the Curriculum`
          );

        if (!isEmpty(mergedStudents)) {
          const [firstRecord] = mergedStudents;

          facultyDetail = await facultyService.findOneFaculty({
            where: { faculty_code: firstRecord.faculty_code },
            attributes: ['id'],
            include: [
              {
                association: 'college',
                attributes: ['college_title'],
              },
            ],
            raw: true,
          });
        }
      }

      await model.sequelize.transaction(async (transaction) => {
        if (institution === 'FMUK01' || institution === 'FKYU03') {
          for (const applicant of mergedStudents) {
            const student = {
              ...applicant,
              studentNumber: applicant.student_number,
              registrationNumber: applicant.registration_number,
              programmeTitle: applicant.programme_title,
              programmeCode: applicant.programme_code,
              academicYear: applicant.entry_academic_year,
              printDate: moment(moment.now()).format('Do MMM, YYYY'),
              name: `${toUpper(applicant.surname)} ${applicant.other_names
                .split(' ')
                .map((name) => capitalize(name))
                .join(' ')}`,
            };

            let docName = '';

            let originalDocName = null;

            if (institution === 'FMUK01') {
              if (degreeCategory === 'UNDERGRADUATE') {
                if (student.sponsorship === 'GOVERNMENT') {
                  docName = await mukPdfHelper.printMakGOVAdmissionLetter(
                    student
                  );
                  originalDocName = docName;
                } else if (documentCategory === 'original') {
                  originalDocName =
                    await mukPdfHelper.printMakUnderGradOriginalAdmissionLetter(
                      student
                    );
                } else if (documentCategory === 'all') {
                  originalDocName =
                    await mukPdfHelper.printMakUnderGradOriginalAdmissionLetter(
                      student
                    );
                  docName = await mukPdfHelper.printMakUNDERGRADAdmissionLetter(
                    student
                  );
                } else {
                  docName = await mukPdfHelper.printMakUNDERGRADAdmissionLetter(
                    student
                  );
                }
              } else if (
                degreeCategory === 'POSTGRADUATE' &&
                documentCategory === 'original'
              ) {
                originalDocName =
                  mukPdfHelper.printMAKOriginalGraduateAdmissionLetter({
                    ...student,
                    reportDate: context.reportDate,
                    collegeTitle: facultyDetail['college.college_title'],
                    programmeDuration: admissionType.programme_duration,
                    admissionType:
                      admissionType['admissionType.metadata_value'],
                  });
              } else {
                docName = await mukPdfHelper.printMAKAdmissionLetter(student);
              }
            } else if (institution === 'FKYU03') {
              const degreeCategory = getMetadataValueName(
                metadataValues,
                context.degree_category_id,
                'DEGREE CATEGORIES'
              );

              if (degreeCategory === 'POSTGRADUATE') {
                docName = kyuPdfHelper.printKYUGraduateAdmissionLetter(student);
              } else docName = kyuPdfHelper.printKYUAdmissionLetter(student);
              originalDocName = docName;
            }
            const uuidCodes = split(uuid.v4().toUpperCase(), '-');
            const documentID = uuidCodes[4];

            const uuidCodesOriginal = split(uuid.v4().toUpperCase(), '-');
            const documentIDOriginal = uuidCodesOriginal[4];

            const provisionalToUpdate = {
              provisional_admission_letter: docName,
              provisional_admission_id: documentID,
              provisional_letter_printed_by: user.id,
              print_provisional_letter_date: now(),
              provisional_letter_sent: false,
            };

            const originalToUpdate = {
              admission_letter: originalDocName,
              admission_id: documentIDOriginal,
              admission_letter_printed_by: user.id,
              print_admission_date: now(),
              admission_letter_sent: false,
            };

            let dataToUpdate = {};

            if (documentCategory === 'original') {
              dataToUpdate = originalToUpdate;
            } else if (documentCategory === 'all') {
              dataToUpdate = { ...provisionalToUpdate, ...originalToUpdate };
            } else {
              dataToUpdate = provisionalToUpdate;
            }

            await admittedApplicantService.updateAdmittedApplicant(
              applicant.id,
              dataToUpdate,
              transaction
            );
          }
        } else {
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

          for (const applicant of mergedStudents) {
            const admittedApplicant = {
              ...applicant,
              name: `${applicant.surname} ${applicant.other_names}`,
              academicYear: applicant.entry_academic_year,
              programmeType: applicant.programme_type,
              programme: applicant.programme_title,
              registrationNumber: applicant.registration_number,
              studentNumber: applicant.student_number,
              nationality: applicant.nationality,
              gender: applicant.gender,
              campus: applicant.campus,
              entryYear: applicant.year_of_entry,
              mode: applicant.mode_of_entry,
            };
            const fileName = `ADL-${admittedApplicant.studentNumber}.pdf`;

            let subjectComb = 'N/A';

            if (
              admittedApplicant.data &&
              !isEmpty(admittedApplicant.data.subjects)
            ) {
              subjectComb = map(
                admittedApplicant.data.subjects,
                (subject) => subject.subject_code
              ).join('/');
            }

            await page.goto(
              `${
                appConfig.APP_URL
              }/api/v1/academic-documents/print/render/admission-letter?stdN=${
                admittedApplicant.studentNumber
              }&g=${admittedApplicant.gender}&c=${
                admittedApplicant.campus
              }&prog=${admittedApplicant.programme}&n=${
                admittedApplicant.nationality
              }&aY=${admittedApplicant.academicYear}&regN=${
                admittedApplicant.registrationNumber
              }&name=${admittedApplicant.name}&pT=${
                admittedApplicant.programmeType
              }&s=${applicant.sponsorship}&hR=${
                applicant.hall_of_residence
              }&hA=${applicant.hall_of_attachment || 'NONE RESIDENT'}&code=${
                applicant.programme_code
              }&fT=${applicant.faculty_title}&yE=${
                applicant.year_of_entry || ''
              }&pD=${moment(moment.now()).format('Do MMM, YYYY')}&pDu=${
                applicant.programme_duration || ''
              }&rD=${formatDate(context.reportDate) || '------------'}&rDl=${
                formatDate(context.regDeadline) || '------------'
              }&mE=${applicant.mode_of_entry || ''}&sC=${subjectComb}&yA=${
                applicant.a_level_year
              }&aI=${applicant.a_level_index}&progID=${
                applicant.programme_id
              }&eAYID=${applicant.entry_academic_year_id}&cID=${
                applicant.campus_id
              }&bcID=${applicant.billing_category_id}&intID=${
                applicant.intake_id
              }&pTID=${applicant.programme_type_id}`,
              {
                waitUntil: 'networkidle2',
              }
            );

            const filePath = `${admissionLetterPath}/${fileName}`;

            await page.pdf({
              format: 'A4',
              printBackground: true,
              path: filePath,
              displayHeaderFooter: true,
              margin: '72px',
            });

            await page
              .$eval('body > div', (el) => el.textContent)
              .catch(async () => {
                fs.access(filePath, fs.constants.F_OK, async (err) => {
                  if (!err) {
                    await fs.unlinkSync(filePath);
                  }
                });

                const errorMsg = await page.$eval(
                  'body > h3',
                  (el) => el.textContent
                );

                throw new Error(
                  `Unable to generate Admission Letter for ${admittedApplicant.studentNumber} - ${errorMsg}`
                );
              });

            const uuidCodes = split(uuid.v4().toUpperCase(), '-');
            const documentID = uuidCodes[4];

            let dataToUpdate = {
              provisional_admission_letter: fileName,
              provisional_admission_id: documentID,
              provisional_letter_printed_by: user.id,
              print_provisional_letter_date: now(),
              provisional_letter_sent: false,
            };

            if (documentCategory === 'original') {
              dataToUpdate = {
                admission_letter: fileName,
                admission_id: documentID,
                admission_letter_printed_by: user.id,
                print_admission_date: now(),
                admission_letter_sent: false,
              };
            } else if (documentCategory === 'all') {
              dataToUpdate = {
                ...dataToUpdate,
                admission_letter: fileName,
                admission_id: documentID,
                admission_letter_printed_by: user.id,
                print_admission_date: now(),
                admission_letter_sent: false,
              };
            }
            await admittedApplicantService.updateAdmittedApplicant(
              applicant.id,
              dataToUpdate,
              transaction
            );
          }
        }
      });

      http.setSuccess(200, 'Admission Letters Generated successfully', {});

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to print this Admission Letter', {
        error: error.message,
      });

      return http.send(res);
    }
  }

  async downloadAdmissionLetters(req, res) {
    try {
      const context = req.body;
      const { user } = req;

      const admissionLetterPath = path.join(
        appConfig.ASSETS_ROOT_DIRECTORY,
        'documents/admissions/letters'
      );
      const admissionPrintPath = `${admissionLetterPath}/prints`;

      if (!fs.existsSync(admissionPrintPath)) {
        fs.mkdirSync(admissionPrintPath);
      }

      const applicants =
        await admittedApplicantsViewsService.admittedApplicants(context);

      let savedFiles = 0;

      let mergedStudents = [];

      if (isArray(applicants)) {
        mergedStudents = flatten(
          applicants.map((applicant) => {
            return applicant.admitted_applicants.map((admittedApplicant) => {
              return {
                ...admittedApplicant,
                batch_number: applicant.batch_number,
                programme_code: applicant.programme_code,
                programme_title: applicant.programme_title,
              };
            });
          })
        );
      }

      const merger = new PDFMerger();

      if (isArray(context.applicants) && !isEmpty(context.applicants)) {
        mergedStudents = getSelectedApplicants(
          context.applicants,
          mergedStudents
        );
      }

      for (const applicant of mergedStudents) {
        if (context.documentType === 'all') {
          if (applicant.provisional_admission_letter) {
            merger.add(
              `${admissionLetterPath}/${applicant.provisional_admission_letter}`
            );
            savedFiles += 1;
          }
          if (applicant.admission_letter) {
            merger.add(`${admissionLetterPath}/${applicant.admission_letter}`);
            savedFiles += 1;
          }
        } else if (
          context.documentType === 'provisional' &&
          applicant.provisional_admission_letter
        ) {
          merger.add(
            `${admissionLetterPath}/${applicant.provisional_admission_letter}`
          );
          savedFiles += 1;
        } else if (
          context.documentType === 'original' &&
          applicant.admission_letter
        ) {
          merger.add(`${admissionLetterPath}/${applicant.admission_letter}`);
          savedFiles += 1;
        }
      }

      if (savedFiles === 0) {
        throw new Error('No Files have been merged for printing');
      }

      const documentPath = `${admissionPrintPath}/PRINT-U${user.id}-${toUpper(
        context.documentType
      )}-${moment().unix()}.pdf`;

      await merger.save(documentPath);

      res.download(documentPath);
    } catch (error) {
      http.setError(400, 'Unable to print Admission letters', {
        error: error.message,
      });

      return http.send(res);
    }
  }

  async updateSubjectCombinations(req, res) {
    try {
      const getSubjectCombinations = await subjectCombinationService
        .findAllSubjectCombinations({
          attributes: ['id', 'subject_combination_code'],
          include: [
            {
              association: 'subjects',
              attributes: ['id'],
              separate: true,
              include: [
                {
                  association: 'subject',
                  attributes: ['id', 'subject_code'],
                },
              ],
            },
          ],
        })
        .then((rows) => {
          return rows.map((r) => {
            return r.dataValues;
          });
        });

      if (!getSubjectCombinations)
        throw new Error('No Subject combinations have been set');

      const subjectCombinations = map(getSubjectCombinations, (e) => ({
        ...e,
        subjects: map(e.subjects, 'subject.subject_code'),
      }));

      const form = new formidable.IncomingForm();
      const matchedRecords = [];
      const unMatchedRecords = [];

      form.parse(req, async (err, fields, files) => {
        if (err) {
          http.setError(400, 'Unable to upload Subject Combinations.', {
            error: { err },
          });

          return http.send(res);
        }

        const file = files[Object.keys(files)[0]];

        const workbook = XLSX.readFile(file.filepath, { cellDates: true });
        const subjectCombSheet = workbook.SheetNames[0];
        const admittedApplicants = XLSX.utils.sheet_to_json(
          workbook.Sheets[subjectCombSheet]
        );

        if (isEmpty(admittedApplicants)) {
          http.setError(400, 'Cannot upload an Empty template.');

          return http.send(res);
        }

        await model.sequelize.transaction(async (transaction) => {
          for (const applicant of admittedApplicants) {
            const indexNumber = trim(applicant.INDEX_NO);
            const aLevelYear = trim(applicant.UACE_YR);
            const combinationCode = trim(applicant.CODE_1);
            const combinationNarration = trim(applicant.Narration);

            const findApplicant =
              await admittedApplicantService.findOneAdmittedApplicant({
                where: {
                  a_level_index: indexNumber,
                  a_level_year: aLevelYear,
                },
                attributes: ['id', 'student_number'],
                raw: true,
              });

            if (findApplicant) {
              if (combinationCode || combinationNarration) {
                let findCombination = null;

                if (combinationCode) {
                  findCombination = find(
                    subjectCombinations,
                    (sc) =>
                      toString(sc.subject_combination_code) ===
                      toString(combinationCode)
                  );

                  if (findCombination) {
                    matchedRecords.push({
                      ...findApplicant,
                      match_by: 'code',
                      findCombination,
                    });
                  }
                } else if (combinationNarration) {
                  findCombination = find(
                    subjectCombinations,
                    (sc) =>
                      difference(sc.subjects, combinationNarration.split(','))
                        .length === 0
                  );

                  if (findCombination) {
                    matchedRecords.push({
                      ...findApplicant,
                      match_by: 'subjects',
                      findCombination,
                    });
                  }
                }

                if (findCombination) {
                  await admittedApplicantService.updateAdmittedApplicant(
                    findApplicant.id,
                    {
                      subject_combination_id: findCombination.id,
                    },
                    transaction
                  );

                  await studentProgrammeService.update(
                    {
                      [Op.or]: [
                        { applicant_id: findApplicant.id },
                        { student_number: findApplicant.student_number },
                      ],
                    },
                    {
                      subject_combination_id: findCombination.id,
                      applicant_id: findApplicant.id,
                    },
                    transaction
                  );
                } else {
                  unMatchedRecords.push({
                    ...findApplicant,
                    match_by: 'subjects',
                    applicant,
                  });
                }
              }
            }
          }
        });

        http.setSuccess(200, 'Subject Combinations updated successfully', {
          matchedRecords,
          unMatchedRecords,
          affectedRecords: matchedRecords.length,
        });

        return http.send(res);
      });
    } catch (error) {
      http.setError(400, 'Unable to update Subject Combinations', {
        error: error.message,
      });

      return http.send(res);
    }
  }

  updateStudentNumbers(req, res) {
    try {
      const form = new formidable.IncomingForm();

      const updated = [];

      form.parse(req, async (err, fields, files) => {
        if (err) {
          http.setError(400, 'Unable to upload New Student numbers.', {
            error: { err },
          });

          return http.send(res);
        }

        const file = files[Object.keys(files)[0]];
        const workbook = XLSX.readFile(file.filepath, { cellDates: true });
        const subjectCombSheet = workbook.SheetNames[0];
        const admittedApplicants = XLSX.utils.sheet_to_json(
          workbook.Sheets[subjectCombSheet]
        );

        if (isEmpty(admittedApplicants)) {
          http.setError(400, 'Cannot upload an Empty template.');

          return http.send(res);
        }

        await model.sequelize.transaction(async (transaction) => {
          for (const applicant of admittedApplicants) {
            const studentNumber = trim(applicant['STUDENT NUMBER']);
            const registrationNumber = trim(applicant['REG NUMBER']);
            const newStudentNumber = trim(applicant['NEW STUDENT NUMBER']);

            if (
              isEmpty(studentNumber) ||
              isEmpty(registrationNumber) ||
              isEmpty(newStudentNumber)
            )
              throw new Error(
                'PROVIDE STUDENT NUMBER, REGISTRATION NUMBER AND NEW STUDENT NUMBERS FOR ALL RECORDS'
              );

            const findApplicant = await admittedApplicantService
              .findOneAdmittedApplicant({
                where: {
                  student_number: studentNumber,
                  registration_number: registrationNumber,
                },
                attributes: ['id'],
                raw: true,
              })
              .catch((e) => {
                if (e) throw new Error(e.message);
              });

            if (findApplicant) {
              const updatedApplicant = await admittedApplicantService
                .updateAdmittedApplicant(
                  findApplicant.id,
                  {
                    student_number: newStudentNumber,
                  },
                  transaction
                )
                .catch((e) => {
                  if (e) throw new Error(e.message);
                });

              await studentProgrammeService
                .update(
                  {
                    registration_number: registrationNumber,
                  },
                  {
                    student_number: newStudentNumber,
                  },
                  transaction
                )
                .catch((e) => {
                  if (e) throw new Error(e.message);
                });

              updated.push(updatedApplicant);
            }
          }
        });

        http.setSuccess(200, 'New Student Numbers updated successfully', {
          updated,
          affectedRecords: updated.length,
        });

        return http.send(res);
      });
    } catch (error) {
      http.setError(400, 'Unable to update New Student Numbers', {
        error: error.message,
      });

      return http.send(res);
    }
  }

  updateStudentNames(req, res) {
    try {
      const form = new formidable.IncomingForm();

      const updatedApplicantAccounts = [];
      const updatedStudentAccounts = [];

      form.parse(req, async (err, fields, files) => {
        if (err) {
          http.setError(400, 'Unable to update Student names.', {
            error: { err },
          });

          return http.send(res);
        }

        const file = files[Object.keys(files)[0]];
        const workbook = XLSX.readFile(file.filepath, { cellDates: true });
        const subjectCombSheet = workbook.SheetNames[0];
        const admittedApplicants = XLSX.utils.sheet_to_json(
          workbook.Sheets[subjectCombSheet]
        );

        if (isEmpty(admittedApplicants)) {
          http.setError(400, 'Cannot upload an Empty template.');

          return http.send(res);
        }

        await model.sequelize.transaction(async (transaction) => {
          for (const applicant of admittedApplicants) {
            const indexNo = trim(applicant.INDEX_NO);
            const fullName = trim(applicant['FULL NAME']);
            const yearOfSitting = trim(applicant['UACE YEAR']);

            validateSheetColumns(
              applicant,
              ['INDEX_NO', 'FULL NAME', 'UACE YEAR'],
              'applicant'
            );

            const names = fullName.split(' ');

            const findApplicant = await admittedApplicantService
              .findOneAdmittedApplicant({
                where: {
                  a_level_index: indexNo,
                  a_level_year: yearOfSitting,
                },
                attributes: [
                  'id',
                  'surname',
                  'other_names',
                  'registration_number',
                ],
                raw: true,
              })
              .catch((e) => {
                if (e) throw new Error(e.message);
              });

            if (findApplicant && isArray(names) && names.length > 0) {
              const [surname] = names;
              const otherNames = names.splice(1).join(' ');

              const updatedApplicant = await admittedApplicantService
                .updateAdmittedApplicant(
                  findApplicant.id,
                  {
                    surname,
                    other_names: otherNames,
                  },
                  transaction
                )
                .catch((e) => {
                  if (e) throw new Error(e.message);
                });

              if (!isEmpty(findApplicant.registration_number)) {
                const findStudentProgramme =
                  await studentProgrammeService.findOne({
                    where: {
                      registration_number: findApplicant.registration_number,
                      is_current_programme: true,
                    },
                    attributes: ['id', 'student_id'],
                    raw: true,
                  });

                if (findStudentProgramme && findStudentProgramme.student_id) {
                  const updateStudentNames = await studentService
                    .updateStudent(
                      findStudentProgramme.student_id,
                      {
                        surname,
                        other_names: otherNames,
                      },
                      transaction
                    )
                    .catch((e) => {
                      if (e) throw new Error(e.message);
                    });

                  updatedStudentAccounts.push(updateStudentNames);
                }
              }

              updatedApplicantAccounts.push(updatedApplicant);
            }
          }
        });

        http.setSuccess(200, 'Applicant Names updated successfully', {
          affectedStudentsRecords: updatedStudentAccounts.length,
          affectedApplicantRecords: updatedApplicantAccounts.length,
          updatedApplicantAccounts,
          updatedStudentAccounts,
        });

        return http.send(res);
      });
    } catch (error) {
      http.setError(400, 'Unable to update Applicant Names', {
        error: error.message,
      });

      return http.send(res);
    }
  }

  updateStudentNamesFormSRM(req, res) {
    try {
      const form = new formidable.IncomingForm();

      const unUpdatedStudents = [];
      const updatedStudentAccounts = [];

      form.parse(req, async (err, fields, files) => {
        if (err) {
          http.setError(400, 'Unable to update Student names.', {
            error: { err },
          });

          return http.send(res);
        }

        const file = files[Object.keys(files)[0]];
        const workbook = XLSX.readFile(file.filepath, { cellDates: true });
        const subjectCombSheet = workbook.SheetNames[0];
        const templateStudents = XLSX.utils.sheet_to_json(
          workbook.Sheets[subjectCombSheet]
        );

        if (isEmpty(templateStudents)) {
          http.setError(400, 'Cannot upload an Empty template.');

          return http.send(res);
        }

        await model.sequelize.transaction(async (transaction) => {
          for (const student of templateStudents) {
            const oldName = trim(student['OLD NAME']);
            const newName = trim(student['NEW NAME']);
            const studentNumber = trim(student['STUDENT NUMBER']);

            validateSheetColumns(
              student,
              ['NEW NAME', 'OLD NAME', 'STUDENT NUMBER'],
              'student'
            );

            const splitNewNames = words(newName);
            const splitOldNames = words(oldName);

            const [newSurname, ...otherNewNames] = splitNewNames;
            const [oldSurname, ...otherOldNames] = splitOldNames;

            const findStudent = await studentService.findOneStudent({
              where: {
                surname: oldSurname,
                other_names: otherOldNames.join(' '),
              },
              include: [
                {
                  association: 'programmes',
                  where: {
                    student_number: studentNumber,
                  },
                },
              ],
              attributes: ['id'],
              raw: true,
              nested: true,
            });

            if (findStudent && findStudent.id) {
              const updateStudentNames = await studentService
                .updateStudent(
                  findStudent.id,
                  {
                    surname: newSurname,
                    other_names: otherNewNames.join(' '),
                  },
                  transaction
                )
                .catch((e) => {
                  if (e) throw new Error(e.message);
                });

              updatedStudentAccounts.push(updateStudentNames);
            } else unUpdatedStudents.push(studentNumber);
          }
        });

        http.setSuccess(200, 'Applicant Names updated successfully', {
          affectedStudentsRecords: updatedStudentAccounts.length,
          unAffectedRecords: unUpdatedStudents.length,
          updatedStudentAccounts,
          unUpdatedStudents,
        });

        return http.send(res);
      });
    } catch (error) {
      http.setError(400, 'Unable to update Applicant Names', {
        error: error.message,
      });

      return http.send(res);
    }
  }
}

const getSelectedApplicants = (applicantIDs, applicants) => {
  const selectedApplicants = [];

  if (isArray(applicants) && !isEmpty(applicantIDs)) {
    for (const applicantID of applicantIDs) {
      const findApplicant = applicants.find(
        (applicant) => applicant.id === applicantID
      );

      if (findApplicant) selectedApplicants.push(findApplicant);
    }
  }

  return selectedApplicants;
};

const formatDate = (input) => {
  const datePart = input.match(/\d+/g);
  // get only two digits
  const year = datePart[0];
  const month = datePart[1];
  const day = datePart[2];

  return day + '/' + month + '/' + year;
};

module.exports = AdmittedApplicantsViewsController;
