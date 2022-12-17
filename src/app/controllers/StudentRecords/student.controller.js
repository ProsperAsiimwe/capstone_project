/* eslint-disable no-console */
const { HttpResponse, createToken, sendMail, sendSms } = require('@helpers');
const {
  studentService,
  OTPCodeService,
  eventService,
  programmeService,
  programmeVersionService,
  admittedApplicantService,
  metadataValueService,
  feesWaiverService,
  metadataService,
  specializationService,
  subjectCombinationService,
  paymentTransactionService,
  runningAdmissionApplicantService,
  studentProgrammeService,
  sponsorService,
  institutionStructureService,
  admissionSchemeService,
  studentApprovalService,
  studentMgtActivityLogService,
} = require('@services/index');
const {
  isEmpty,
  entries,
  toUpper,
  now,
  trim,
  replace,
  map,
  find,
} = require('lodash');
const UserAgent = require('user-agents');
const bcrypt = require('bcrypt');
const moment = require('moment');
const { appConfig } = require('../../../config');
const model = require('@models');
const formidable = require('formidable');
const http = new HttpResponse();
const XLSX = require('xlsx');
const excelJs = require('exceljs');
const fs = require('fs');
const {
  studentTemplateColumns,
  bulkUpdateStudentTemplateColumns,
  verifyTopushToSICTemplateColumns,
} = require('../ProgrammeManager/templateColumns');
const { Op } = require('sequelize');
const EventEmitter = require('events');
const {
  getMetadataValueId,
  getMetadataValues,
  getMetadataValueName,
} = require('../Helpers/programmeHelper');
const {
  validateSheetColumns,
} = require('@controllers/Helpers/uploadValidator');
const { omit } = require('lodash');
const {
  formatEmail,
  formatPhoneNumber,
} = require('@helpers/SMSandEMAILHelper');

const { checkEachStudentRow } = require('../Helpers/studentUploadHelper');

const {
  uploadStudentAvatarMiddleware,
} = require('@helpers/imagesUploadHelper');

const multer = require('multer');
const path = require('path');
const userAgent = new UserAgent();

EventEmitter.captureRejections = true;

const eventEmitter = new EventEmitter();

class StudentController {
  /**
   * GET All Students.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async index(req, res) {
    try {
      const students = await studentService.findAllStudents();

      http.setSuccess(200, 'Students fetched successfully', { students });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Error fetching Students', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async findStudentAcademicRecords(req, res) {
    try {
      const studentId = req.user.id;
      const student = await studentService.findStudentAcademicRecords(
        studentId
      );

      http.setSuccess(200, 'Student Academic Records Fetched Successfully.', {
        data: student,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Error fetching Student Academic Records.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * CREATE New Student Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async createStudent(req, res) {
    try {
      const data = req.body;
      const user = req.user.id;
      const random = Math.floor(Math.random() * moment().unix());
      const generatedBatchNumber = `BATCH${random}`;

      data.created_by_id = user;
      data.is_current_programme = true;
      const metadataValues = await metadataValueService.findAllMetadataValues({
        include: ['metadata'],
      });

      const inactive = getMetadataValueId(
        metadataValues,
        'INACTIVE',
        'STUDENT ACCOUNT STATUSES'
      );

      data.student_account_status_id = inactive;
      data.approvals = {
        created_by_id: user,
        batch_number: generatedBatchNumber,
        upload_type: 'CREATED FROM INTERFACE',
      };

      data.programmes = {
        applicant_id: data.applicant_id,
        programme_id: data.programme_id,
        programme_type_id: data.programme_type_id,
        programme_version_id: data.programme_version_id,
        programme_version_plan_id: data.programme_version_plan_id,
        specialization_id: data.specialization_id,
        subject_combination_id: data.subject_combination_id,
        fees_waiver_id: data.fees_waiver_id,
        entry_academic_year_id: data.entry_academic_year_id,
        entry_study_year_id: data.entry_study_year_id,
        current_study_year_id: data.current_study_year_id,
        intake_id: data.intake_id,
        campus_id: data.campus_id,
        sponsorship_id: data.sponsorship_id,
        billing_category_id: data.billing_category_id,
        residence_status_id: data.residence_status_id,
        hall_of_attachment_id: data.hall_of_attachment_id,
        hall_of_residence_id: data.hall_of_residence_id,
        student_academic_status_id: data.student_academic_status_id,
        marital_status_id: data.marital_status_id,
        old_student_number: data.old_student_number,
        registration_number: data.registration_number,
        student_number: data.student_number,
        is_current_programme: data.is_current_programme,
        is_on_loan_scheme: data.is_on_loan_scheme,
        has_completed: data.has_completed,
        is_affiliated: data.is_affiliated,
        affiliate_institute_name: data.affiliate_institute_name,
        sponsor: data.sponsor,
        created_by_id: user,
        approvals: data.approvals,
      };

      const student = await model.sequelize.transaction(async (transaction) => {
        const result = await insertNewStudent(req, data, transaction);

        return result;
      });

      http.setSuccess(200, 'Student created successfully.', { student });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to create this Student.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   */
  async verifyStudentUploads(req, res) {
    try {
      const data = req.body;
      const user = req.user.id;

      const metadataValues = await metadataValueService.findAllMetadataValues({
        include: ['metadata'],
      });

      const form = new formidable.IncomingForm();
      const duplicates = [];

      data.created_by_id = user;
      form.parse(req, async (err, fields, files) => {
        if (err) {
          http.setError(400, 'Unable to verify students.', {
            error: { err },
          });

          return http.send(res);
        }

        const file = files[Object.keys(files)[0]];

        if (!file) {
          http.setError(400, 'Please Select A File To Upload.');

          return http.send(res);
        }
        const workbook = XLSX.readFile(file.filepath, { cellDates: true });
        const createStudent = workbook.SheetNames[0];
        const formattedStudents = XLSX.utils.sheet_to_json(
          workbook.Sheets[createStudent]
        );

        if (isEmpty(formattedStudents[0])) {
          http.setError(
            400,
            'Cannot upload an empty Document, please populate the template with Student Records'
          );

          return http.send(res);
        }

        try {
          for (const student of formattedStudents) {
            const checkValue = await checkEachStudentRow(
              data,
              student,
              metadataValues,
              user
            );

            const verify = await verifyDuplicatesStudent(checkValue);

            if (
              !isEmpty(verify.duplicate_email_or_phone) ||
              !isEmpty(verify.duplicate_student_no_or_registration_no)
            ) {
              duplicates.push(verify);
            }
          }

          if (!isEmpty(duplicates)) {
            http.setSuccess(400, 'Duplicate Records Identified.', {
              data: duplicates,
            });

            return http.send(res);
          } else {
            http.setSuccess(200, 'Students Verified Successfully.');

            return http.send(res);
          }
        } catch (error) {
          http.setError(400, 'Unable To Verify Students.', {
            error: { message: error.message },
          });

          return http.send(res);
        }
      });
    } catch (error) {
      http.setError(400, 'Unable to upload student records.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   */
  async uploadStudents(req, res) {
    try {
      const data = req.body;
      const user = req.user.id;

      const metadataValues = await metadataValueService.findAllMetadataValues({
        include: ['metadata'],
      });

      const form = new formidable.IncomingForm();
      const uploadedStudents = [];

      data.created_by_id = user;
      form.parse(req, async (err, fields, files) => {
        if (err) {
          http.setError(400, 'Unable to upload students.', {
            error: { err },
          });

          return http.send(res);
        }

        const file = files[Object.keys(files)[0]];

        if (!file) {
          http.setError(400, 'Please Select A File To Upload.');

          return http.send(res);
        }
        const workbook = XLSX.readFile(file.filepath, { cellDates: true });
        const createStudent = workbook.SheetNames[0];
        const formattedStudents = XLSX.utils.sheet_to_json(
          workbook.Sheets[createStudent]
        );

        if (isEmpty(formattedStudents[0])) {
          http.setError(
            400,
            'Cannot upload an empty Document, please populate the template with Student Records'
          );

          return http.send(res);
        }

        try {
          const random = Math.floor(Math.random() * moment().unix());
          const generatedBatchNumber = `BATCH${random}`;

          data.approvals = {
            created_by_id: user,
            batch_number: generatedBatchNumber,
            upload_type: 'UPLOADED FROM FILE',
          };

          await model.sequelize.transaction(async (transaction) => {
            for (const student of formattedStudents) {
              const checkValue = await checkEachStudentRow(
                data,
                student,
                metadataValues,
                user
              );

              const upload = await insertNewStudent(
                req,
                checkValue,
                transaction
              );

              uploadedStudents.push(upload);
            }
          });
          http.setSuccess(200, 'Students uploaded successfully.', {
            data: uploadedStudents,
          });

          return http.send(res);
        } catch (error) {
          http.setError(400, 'Unable to upload students.', {
            error: { message: error.message },
          });

          return http.send(res);
        }
      });
    } catch (error) {
      http.setError(400, 'Unable to upload student records.', {
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
  async uploadBulkUpdateStudents(req, res) {
    try {
      const user = req.user.id;

      const studentProgrammes = await studentService.findAllStudentProgrammes({
        include: [
          {
            association: 'programme',
            attributes: [
              'id',
              'programme_study_level_id',
              'is_modular',
              'programme_duration',
              'duration_measure_id',
            ],
          },
        ],
        nest: true,
        raw: true,
      });

      const metadataValues = await metadataValueService.findAllMetadataValues({
        include: ['metadata'],
      });

      const form = new formidable.IncomingForm();
      const uploadedStudents = [];

      form.parse(req, async (err, fields, files) => {
        if (err) {
          http.setError(400, 'Unable to upload students.', {
            error: { err },
          });

          return http.send(res);
        }

        const file = files[Object.keys(files)[0]];

        if (!file) {
          http.setError(400, 'Please Select A File To Upload.');

          return http.send(res);
        }

        const workbook = XLSX.readFile(file.filepath, { cellDates: true });
        const createStudent = workbook.SheetNames[0];
        const formattedStudents = XLSX.utils.sheet_to_json(
          workbook.Sheets[createStudent]
        );

        if (isEmpty(formattedStudents[0])) {
          http.setError(
            400,
            'Cannot upload an empty Document, please populate the template with Student Records'
          );

          return http.send(res);
        }

        const getStudentId = (value) => {
          try {
            const checkValue = studentProgrammes.find(
              (std) =>
                toUpper(trim(std.student_number)) === toUpper(trim(value))
            );

            if (checkValue) {
              if (checkValue.is_current_programme === false) {
                throw new Error(
                  `The programme for ${value} isn't thier currently active one.`
                );
              }

              return parseInt(checkValue.student_id, 10);
            }
            throw new Error(`Cannot find ${value} in the list of students.`);
          } catch (error) {
            throw new Error(error.message);
          }
        };

        const getStudentProgrammeId = (value) => {
          try {
            const checkValue = studentProgrammes.find(
              (std) =>
                toUpper(trim(std.student_number)) === toUpper(trim(value))
            );

            if (checkValue) {
              if (checkValue.is_current_programme === false) {
                throw new Error(
                  `The programme for ${value} isn't thier currently active one.`
                );
              }

              return parseInt(checkValue.id, 10);
            }
            throw new Error(`Cannot find ${value} in the list of students.`);
          } catch (error) {
            throw new Error(error.message);
          }
        };

        const getCurrentStudyYear = async (
          studentNumber,
          studyYear,
          studentNameForErrorMsg
        ) => {
          try {
            const checkValue = studentProgrammes.find(
              (std) =>
                toUpper(trim(std.student_number)) ===
                toUpper(trim(studentNumber))
            );

            if (checkValue) {
              if (checkValue.is_current_programme === false) {
                throw new Error(
                  `The programme for ${studentNameForErrorMsg} isn't thier currently active one.`
                );
              }

              const allStudyYears =
                await programmeService.findAllProgrammeStudyYears({
                  where: { programme_id: checkValue.programme.id },
                  attributes: [
                    'id',
                    'programme_id',
                    'programme_study_year_id',
                    'programme_study_years',
                  ],
                  raw: true,
                });

              const checkStudyYear = allStudyYears.find(
                (yr) =>
                  trim(toUpper(yr.programme_study_years)) ===
                  trim(toUpper(studyYear))
              );

              if (checkStudyYear) {
                return parseInt(checkStudyYear.id, 10);
              } else {
                throw new Error(
                  `The programme for student ${studentNameForErrorMsg} doesn't have ${studyYear} as one of it's study years.`
                );
              }
            }
            throw new Error(
              `Cannot find ${studentNameForErrorMsg} in the list of students.`
            );
          } catch (error) {
            throw new Error(error.message);
          }
        };

        try {
          await model.sequelize.transaction(async (transaction) => {
            for (const student of formattedStudents) {
              const data = {};
              const academicRecordsData = {};
              const academicStatusData = {};

              data.last_updated_by_id = user;

              const studentNameForErrorMsg = student['STUDENT NUMBER']
                ? student['STUDENT NUMBER']
                : 'Student';

              validateSheetColumns(
                student,
                ['STUDENT NUMBER', 'PHONE', 'EMAIL'],
                studentNameForErrorMsg
              );
              data.studentNameForErrorMsg = studentNameForErrorMsg;

              data.phone = student.PHONE;

              data.email = student.EMAIL;

              if (student['DATE OF BIRTH (MM/DD/YYYY)']) {
                data.date_of_birth = student['DATE OF BIRTH (MM/DD/YYYY)'];
              }

              if (student['STUDENT ACADEMIC STATUS']) {
                academicStatusData.student_academic_status_id =
                  getMetadataValueId(
                    metadataValues,
                    student['STUDENT ACADEMIC STATUS'],
                    'STUDENT ACADEMIC STATUSES',
                    studentNameForErrorMsg
                  );

                academicRecordsData.student_academic_status_id =
                  academicStatusData.student_academic_status_id;

                if (!student['STATUS ACADEMIC YEAR']) {
                  throw new Error(`Please provide the status academic year.`);
                }

                academicStatusData.academic_year_id = getMetadataValueId(
                  metadataValues,
                  student['STATUS ACADEMIC YEAR'],
                  'ACADEMIC YEARS',
                  studentNameForErrorMsg
                );

                if (student['ACADEMIC STATUS REASON']) {
                  academicStatusData.reason = student['ACADEMIC STATUS REASON'];
                }

                academicStatusData.student_programme_id = getStudentProgrammeId(
                  student['STUDENT NUMBER']
                );

                academicRecordsData.student_programme_id =
                  academicStatusData.student_programme_id;
              }

              if (student['CURRENT STUDY YEAR']) {
                academicRecordsData.current_study_year_id =
                  await getCurrentStudyYear(
                    student['STUDENT NUMBER'],
                    student['CURRENT STUDY YEAR'],
                    studentNameForErrorMsg
                  );
              }

              if (student['CURRENT SEMESTER']) {
                academicRecordsData.current_semester_id = getMetadataValueId(
                  metadataValues,
                  student['CURRENT SEMESTER'],
                  'SEMESTERS',
                  studentNameForErrorMsg
                );
              }

              data.student_id = getStudentId(student['STUDENT NUMBER']);

              const upload = await updateStudentWithTemplate(
                req,
                data,
                academicRecordsData,
                academicStatusData,
                transaction
              );

              uploadedStudents.push(upload);
            }
          });
          http.setSuccess(200, 'Students Updated Successfully.', {
            data: uploadedStudents,
          });

          return http.send(res);
        } catch (error) {
          http.setError(400, 'Unable To Update Students.', {
            error: { message: error.message },
          });

          return http.send(res);
        }
      });
    } catch (error) {
      http.setError(400, 'Unable to upload student records.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * downloadTemplate
   * @param {*} req
   * @param {*} res
   */
  async downloadTemplate(req, res) {
    try {
      const workbook = new excelJs.Workbook();
      const { user } = req;

      const createStudentsSheet = workbook.addWorksheet('CREATE STUDENT');
      const sponsorshipsSheet = workbook.addWorksheet('Sheet2');
      const programmeTypesSheet = workbook.addWorksheet('Sheet3');
      const academicYearsSheet = workbook.addWorksheet('Sheet4');
      const studyYearsSheet = workbook.addWorksheet('Sheet5');
      const intakesSheet = workbook.addWorksheet('Sheet6');
      const campusesSheet = workbook.addWorksheet('Sheet7');
      const plansSheet = workbook.addWorksheet('Sheet8');
      const specializationsSheet = workbook.addWorksheet('Sheet9');
      const subjectsCombinationsSheet = workbook.addWorksheet('Sheet10');
      const billingCategoriesSheet = workbook.addWorksheet('Sheet11');
      const feesWaiversSheet = workbook.addWorksheet('Sheet12');
      const residentStatusesSheet = workbook.addWorksheet('Sheet13');
      const hallsSheet = workbook.addWorksheet('Sheet14');
      const academicStatusesSheet = workbook.addWorksheet('Sheet15');
      const accountStatusesSheet = workbook.addWorksheet('Sheet16');
      const programmesSheet = workbook.addWorksheet('Sheet17');
      const versionsSheet = workbook.addWorksheet('Sheet18');
      const maritalStatusesSheet = workbook.addWorksheet('Sheet19');

      createStudentsSheet.properties.defaultColWidth =
        studentTemplateColumns.length;
      createStudentsSheet.columns = studentTemplateColumns;

      sponsorshipsSheet.state = 'veryHidden';
      programmeTypesSheet.state = 'veryHidden';
      academicYearsSheet.state = 'veryHidden';
      studyYearsSheet.state = 'veryHidden';
      intakesSheet.state = 'veryHidden';
      campusesSheet.state = 'veryHidden';
      plansSheet.state = 'veryHidden';
      specializationsSheet.state = 'veryHidden';
      subjectsCombinationsSheet.state = 'veryHidden';
      billingCategoriesSheet.state = 'veryHidden';
      feesWaiversSheet.state = 'veryHidden';
      residentStatusesSheet.state = 'veryHidden';
      hallsSheet.state = 'veryHidden';
      academicStatusesSheet.state = 'veryHidden';
      accountStatusesSheet.state = 'veryHidden';
      programmesSheet.state = 'veryHidden';
      versionsSheet.state = 'veryHidden';
      maritalStatusesSheet.state = 'veryHidden';

      const programmes = await programmeService.findAllProgrammes({
        attributes: ['id', 'programme_code', 'programme_title'],
        raw: true,
      });

      const programmeVersions =
        await programmeVersionService.findAllProgrammeVersions({
          attributes: ['id', 'version_title'],
          raw: true,
        });

      const specializations =
        await specializationService.findAllSpecializations({
          attributes: ['id', 'specialization_code', 'specialization_title'],
          raw: true,
        });

      const subjectCombinations =
        await subjectCombinationService.findAllSubjectCombinations({
          attributes: [
            'id',
            'subject_combination_code',
            'subject_combination_title',
          ],
          raw: true,
        });

      const feesWaivers = await feesWaiverService.findAllFeesWaivers({
        attributes: ['fees_waiver_name'],
        raw: true,
      });

      const metadata = await metadataService.findAllMetadata({
        attributes: ['metadata_name'],
        include: [
          { association: 'metadataValues', attributes: ['metadata_value'] },
        ],
        raw: true,
        nest: true,
      });

      sponsorshipsSheet.addRows(getMetadataValues(metadata, 'SPONSORSHIPS'));

      programmeTypesSheet.addRows(
        getMetadataValues(metadata, 'PROGRAMME STUDY TYPES')
      );

      studyYearsSheet.addRows(getMetadataValues(metadata, 'STUDY YEARS'));

      if (!isEmpty(programmes)) {
        const newProgrammes = [];

        programmes.forEach((programme) => {
          newProgrammes.push([
            `(${programme.programme_code}):${programme.programme_title}`,
          ]);
        });

        programmesSheet.addRows(newProgrammes);
      }
      if (!isEmpty(programmeVersions)) {
        const newVersions = [];

        programmeVersions.forEach((version) => {
          newVersions.push(version.version_title);
        });

        const removeDups = removeDuplicates(newVersions);

        const cleanArray = [];

        removeDups.forEach((version) => {
          cleanArray.push([version]);
        });

        versionsSheet.addRows(cleanArray);
      }

      intakesSheet.addRows(getMetadataValues(metadata, 'INTAKES'));
      campusesSheet.addRows(getMetadataValues(metadata, 'CAMPUSES'));
      plansSheet.addRows(
        getMetadataValues(metadata, 'PROGRAMME VERSION PLANS')
      );

      specializationsSheet.addRows(
        specializations.map((spec) => [
          `(${spec.specialization_code}):${spec.specialization_title}`,
        ])
      );
      subjectsCombinationsSheet.addRows(
        subjectCombinations.map((subjectComb) => [
          subjectComb.subject_combination_code,
        ])
      );

      billingCategoriesSheet.addRows(
        getMetadataValues(metadata, 'BILLING CATEGORIES')
      );
      feesWaiversSheet.addRows(
        feesWaivers.map((waiver) => [waiver.fees_waiver_name])
      );
      residentStatusesSheet.addRows(
        getMetadataValues(metadata, 'RESIDENCE STATUSES')
      );
      hallsSheet.addRows(getMetadataValues(metadata, 'HALLS'));
      academicStatusesSheet.addRows(
        getMetadataValues(metadata, 'STUDENT ACADEMIC STATUSES')
      );
      accountStatusesSheet.addRows(
        getMetadataValues(metadata, 'STUDENT ACCOUNT STATUSES')
      );
      academicYearsSheet.addRows(getMetadataValues(metadata, 'ACADEMIC YEARS'));
      maritalStatusesSheet.addRows(
        getMetadataValues(metadata, 'MARITAL STATUSES')
      );

      // Add some data validations
      createStudentsSheet.dataValidations.add('C2:C1000', {
        type: 'list',
        allowBlank: false,
        formulae: ['=Sheet2!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid value from the list',
      });

      createStudentsSheet.dataValidations.add('D2:D1000', {
        type: 'list',
        allowBlank: false,
        formulae: ['=Sheet17!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid value from the list',
      });

      createStudentsSheet.dataValidations.add('E2:E1000', {
        type: 'list',
        allowBlank: false,
        formulae: ['=Sheet18!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid value from the list',
      });

      createStudentsSheet.dataValidations.add('F2:F1000', {
        type: 'list',
        allowBlank: false,
        formulae: ['=Sheet3!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid value from the list',
      });

      createStudentsSheet.dataValidations.add('G2:G1000', {
        type: 'list',
        allowBlank: false,
        formulae: ['=Sheet4!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid value from the list',
      });

      createStudentsSheet.dataValidations.add('H2:H1000', {
        type: 'list',
        allowBlank: false,
        formulae: ['=Sheet5!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid value from the list',
      });

      createStudentsSheet.dataValidations.add('I2:I1000', {
        type: 'list',
        allowBlank: false,
        formulae: ['=Sheet5!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid value from the list',
      });

      createStudentsSheet.dataValidations.add('J2:J1000', {
        type: 'list',
        allowBlank: false,
        formulae: ['=Sheet6!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid value from the list',
      });

      createStudentsSheet.dataValidations.add('K2:K1000', {
        type: 'list',
        allowBlank: false,
        formulae: ['=Sheet7!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid value from the list',
      });

      createStudentsSheet.dataValidations.add('L2:L1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=Sheet8!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid value from the list',
      });

      createStudentsSheet.dataValidations.add('M2:M1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=Sheet9!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid value from the list',
      });

      createStudentsSheet.dataValidations.add('N2:N1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=Sheet10!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid value from the list',
      });

      createStudentsSheet.dataValidations.add('O2:O1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=Sheet12!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid value from the list',
      });

      createStudentsSheet.dataValidations.add('P2:P1000', {
        type: 'list',
        allowBlank: false,
        formulae: ['=Sheet11!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid value from the list',
      });

      createStudentsSheet.dataValidations.add('Q2:Q1000', {
        type: 'list',
        allowBlank: false,
        formulae: ['=Sheet13!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid value from the list',
      });

      createStudentsSheet.dataValidations.add('R2:R1000', {
        type: 'list',
        allowBlank: false,
        formulae: ['=Sheet14!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid value from the list',
      });

      createStudentsSheet.dataValidations.add('S2:S1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=Sheet14!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid value from the list',
      });

      createStudentsSheet.dataValidations.add('T2:T1000', {
        type: 'list',
        allowBlank: false,
        formulae: ['=Sheet15!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid value from the list',
      });

      createStudentsSheet.dataValidations.add('Y2:Y1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['"MALE, FEMALE"'],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid value from the list',
      });

      createStudentsSheet.dataValidations.add('AD2:AD1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=Sheet19!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid value from the list',
      });

      createStudentsSheet.dataValidations.add('AH2:AH1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['"true, false"'],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid value from the list',
      });

      createStudentsSheet.dataValidations.add('AJ2:AJ1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['"TRUE, FALSE"'],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid value from the list',
      });

      createStudentsSheet.dataValidations.add('AK2:AL1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['"TRUE, FALSE"'],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid value from the list',
      });

      createStudentsSheet.dataValidations.add('AR2:AR1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['"TRUE, FALSE"'],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid value from the list',
      });

      const uploadPath = `${process.cwd()}/src/assets/documents/templates`;

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true }, (err) => {
          throw new Error(err.message);
        });
      }

      const template = `${uploadPath}/download-student-upload-template-${
        user.surname
      }-${user.other_names}-${user.id}-${now()}.xlsm`;

      await workbook.xlsx.writeFile(template);
      await res.download(template, 'STUDENT-UPLOAD-TEMPLATE.xlsx', (error) => {
        if (error) {
          throw new Error(error.message);
        }
      });
    } catch (error) {
      http.setError(400, 'Unable to download this template.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   */
  async downloadBulkUpdateTemplate(req, res) {
    try {
      const workbook = new excelJs.Workbook();
      const { user } = req;

      const metadata = await metadataService.findAllMetadata({
        attributes: ['metadata_name'],
        include: [
          { association: 'metadataValues', attributes: ['metadata_value'] },
        ],
        raw: true,
        nest: true,
      });

      const rootSheet = workbook.addWorksheet('BULK UPDATE STUDENT');
      const academicStatusSheet = workbook.addWorksheet('AcademicStatusSheet');
      const academicYearSheet = workbook.addWorksheet('AcademicYearSheet');
      const studyYearSheet = workbook.addWorksheet('StudyYearSheet');
      const semesterSheet = workbook.addWorksheet('SemesterSheet');

      rootSheet.properties.defaultColWidth =
        bulkUpdateStudentTemplateColumns.length;
      rootSheet.columns = bulkUpdateStudentTemplateColumns;

      academicStatusSheet.state = 'veryHidden';
      academicYearSheet.state = 'veryHidden';
      studyYearSheet.state = 'veryHidden';
      semesterSheet.state = 'veryHidden';

      academicStatusSheet.addRows(
        getMetadataValues(metadata, 'STUDENT ACADEMIC STATUSES')
      );

      academicYearSheet.addRows(getMetadataValues(metadata, 'ACADEMIC YEARS'));

      studyYearSheet.addRows(getMetadataValues(metadata, 'STUDY YEARS'));

      semesterSheet.addRows(getMetadataValues(metadata, 'SEMESTERS'));

      rootSheet.dataValidations.add('E2:E1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=StudyYearSheet!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: 'Please select a valid value from the list',
      });

      rootSheet.dataValidations.add('F2:F1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=SemesterSheet!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: 'Please select a valid value from the list',
      });

      rootSheet.dataValidations.add('G2:G1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=AcademicStatusSheet!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: 'Please select a valid value from the list',
      });

      rootSheet.dataValidations.add('H2:H1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=AcademicYearSheet!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: 'Please select a valid value from the list',
      });

      const uploadPath = `${process.cwd()}/src/assets/documents/templates`;

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true }, (err) => {
          throw new Error(err.message);
        });
      }

      const template = `${uploadPath}/download-bulk-update-students-template-${
        user.surname
      }-${user.other_names}-${user.id}-${now()}.xlsm`;

      await workbook.xlsx.writeFile(template);
      await res.download(
        template,
        'BULK-UPDATE-STUDENTS-TEMPLATE.xlsx',
        (error) => {
          if (error) {
            throw new Error(error.message);
          }
        }
      );
    } catch (error) {
      http.setError(400, 'Unable to download this template.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   */
  uploadStudentAvatar(req, res) {
    const uploadPath = path.join(appConfig.STUDENTS_PHOTO_DIRECTORY);

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true }, (err) => {
        throw new Error(err.message);
      });
    }

    uploadStudentAvatarMiddleware(req, res, async (err) => {
      try {
        const { studentNumber } = req.params;

        const data = {};

        const user = req.user.id;

        data.last_updated_by_id = user;

        const studentProgramme = await studentService.findOneStudentProgramme({
          where: {
            student_number: trim(studentNumber),
          },
          attributes: [
            'id',
            'student_id',
            'student_number',
            'registration_number',
            'campus_id',
            'entry_academic_year_id',
            'current_study_year_id',
            'intake_id',
            'is_current_programme',
          ],
          raw: true,
        });

        if (!studentProgramme) {
          throw new Error('Academic Record Does Not Exist.');
        }
        const { filename } = req.file;

        data.avatar = filename;

        const updateStudent = await studentService.updateStudent(
          studentProgramme.student_id,
          data
        );

        const student = updateStudent[1][0];

        if (err instanceof multer.MulterError) {
          throw new Error(err);
        } else if (err) {
          throw new Error(err);
        }

        http.setSuccess(200, 'Student Avatar Uploaded Successfully.', {
          data: student,
        });

        return http.send(res);
      } catch (error) {
        http.setError(400, 'Student Avatar Upload Failed.', {
          error: { message: error.message },
        });

        return http.send(res);
      }
    });
  }

  /**
   * UPDATE Specific Student Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async updateStudentPersonalDetails(req, res) {
    try {
      const { studentId } = req.params;
      const { id: userId } = req.user;
      const data = req.body;

      const findStudent = await studentService.findOneStudent({
        where: { id: studentId },
        raw: true,
      });

      if (!findStudent) throw new Error('Invalid Student Selected');

      const student = await model.sequelize.transaction(async (transaction) => {
        const updateStudent = await studentService.updateStudentWithTransaction(
          studentId,
          data,
          transaction
        );

        const student = updateStudent[1][0];

        await studentMgtActivityLogService.create(
          {
            ip_address: req.ip,
            user_agent: userAgent.data,
            activity_name: 'UPDATE',
            activity_description: 'UPDATED STUDENT PERSONAL RECORD',
            table_name: 'students',
            old_properties: findStudent,
            new_properties: student,
            staff_id: userId,
            student_id: studentId,
          },
          transaction
        );

        return student;
      });

      http.setSuccess(200, 'Student Personal Details Updated Successfully', {
        data: student,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Update Student Personal Details.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * UPDATE Current Student Programme.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async updateCurrentStudentProgramme(req, res) {
    try {
      const { studentId, studentProgrammeId } = req.params;
      const { id: userId } = req.user;
      const data = {};

      data.last_updated_by_id = userId;

      const oldStudentProgrammes = await studentProgrammeService.findAll({
        where: {
          student_id: studentId,
        },
        raw: true,
      });

      if (
        !oldStudentProgrammes ||
        !oldStudentProgrammes
          .map((prog) => prog.id)
          .includes(studentProgrammeId)
      )
        throw new Error('Invalid Student Programme');

      const student = await model.sequelize.transaction(async (transaction) => {
        data.is_current_programme = true;
        const otherProgrammes = [];
        const currentProgramme = await studentService.updateStudentProgramme(
          studentProgrammeId,
          data,
          transaction
        );

        for (const id of oldStudentProgrammes
          .map((prog) => prog.id)
          .filter((item) => item !== studentProgrammeId)) {
          data.is_current_programme = false;
          const prog = await studentService.updateStudentProgramme(
            id,
            data,
            transaction
          );

          otherProgrammes.push(prog[1][0]);
        }

        const newStudentProgrammes = [
          currentProgramme[1][0],
          ...otherProgrammes,
        ];

        await studentMgtActivityLogService.create(
          {
            ip_address: req.ip,
            user_agent: userAgent.data,
            activity_name: 'UPDATE',
            activity_description: 'UPDATED STUDENT CURRENT PROGRAMME',
            table_name: 'student_programmes',
            old_properties: oldStudentProgrammes,
            new_properties: newStudentProgrammes,
            staff_id: userId,
            student_id: studentId,
          },
          transaction
        );

        return currentProgramme[1][0];
      });

      http.setSuccess(200, 'Current Student Programme Updated Successfully.', {
        data: student,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Update Current Student Programme.', {
        error: error.message,
      });

      return http.send(res);
    }
  }

  /**
   * UPDATE Specific Student Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async updateStudentAcademicRecords(req, res) {
    try {
      const { studentId, studentProgrammeId } = req.params;
      const { id: userId } = req.user;
      const data = req.body;

      entries(data).forEach(([key, value]) => {
        if (isEmpty(value)) return (data[key] = null);

        return (data[key] = value);
      });

      data.last_updated_by_id = userId;

      const findStudentProgramme = await studentProgrammeService.findOne({
        where: {
          id: studentProgrammeId,
          student_id: studentId,
          is_current_programme: true,
        },
        raw: true,
      });

      if (!findStudentProgramme) throw new Error('Invalid Student Programme');

      const findProgramme = await programmeService
        .findOneProgramme({
          where: {
            id: data.programme_id,
          },
          include: [
            {
              association: 'programmeStudyTypes',
              attributes: ['id', 'programme_id', 'programme_type_id'],
            },
            {
              association: 'versions',
              attributes: ['id', 'programme_id'],
            },
            {
              association: 'campuses',
              attributes: ['id'],
            },
          ],
          plain: true,
        })
        .then((res) => (res ? res.toJSON() : null));

      if (!findProgramme) {
        throw new Error(`Unable To Find Programme.`);
      }

      if (data.programme_type_id) {
        const findType = findProgramme.programmeStudyTypes.find(
          (type) =>
            parseInt(type.id, 10) === parseInt(data.programme_type_id, 10)
        );

        if (!findType) {
          throw new Error('Invalid Programme Type');
        }
      }

      if (data.campuses) {
        const findType = findProgramme.campuses.find(
          (type) => parseInt(type.id, 10) === parseInt(data.campus_id, 10)
        );

        if (!findType) {
          throw new Error('Invalid Programme Type');
        }
      }

      if (data.programme_version_id) {
        const findVersion = findProgramme.versions.find(
          (ver) =>
            parseInt(ver.id, 10) === parseInt(data.programme_version_id, 10)
        );

        if (!findVersion) {
          throw new Error('Invalid Programme Version');
        }
      }

      const student = await model.sequelize.transaction(async (transaction) => {
        const updateStudent = await studentService.updateStudentProgramme(
          studentProgrammeId,
          data,
          transaction
        );

        const student = updateStudent[1][0];

        await studentMgtActivityLogService.create(
          {
            ip_address: req.ip,
            user_agent: userAgent.data,
            activity_name: 'UPDATE',
            activity_description: 'UPDATED STUDENT ACADEMIC RECORD',
            table_name: 'student_programmes',
            old_properties: findStudentProgramme,
            new_properties: student,
            staff_id: userId,
            student_id: studentId,
          },
          transaction
        );

        return student;
      });

      http.setSuccess(200, 'Student Academic Records Updated Successfully.', {
        data: student,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Update Student Academic Records.', {
        error: error.message,
      });

      return http.send(res);
    }
  }

  /**
   * UPDATE Specific Student Sponsorship Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async updateStudentSponsorshipRecords(req, res) {
    try {
      const { studentId, studentProgrammeId } = req.params;
      const { id: userId } = req.user;
      const data = req.body;

      entries(data).forEach(([key, value]) => {
        if (isEmpty(value)) return (data[key] = null);

        return (data[key] = value);
      });

      data.last_updated_by_id = userId;

      const findStudentProgramme = await studentProgrammeService.findOne({
        where: {
          id: studentProgrammeId,
          student_id: studentId,
          is_current_programme: true,
        },
        raw: true,
      });

      if (!findStudentProgramme)
        throw new Error('This is not the current Programme of this Student');

      const payload = {
        billing_category_id: data.billing_category_id,
        fees_waiver_id: data.fees_waiver_id,
        sponsor: data.sponsor,
        sponsorship_id: data.sponsorship_id,
      };

      const student = await model.sequelize.transaction(async (transaction) => {
        const updateStudent = await studentService.updateStudentProgramme(
          studentProgrammeId,
          payload,
          transaction
        );

        const student = updateStudent[1][0];

        await studentMgtActivityLogService.create(
          {
            ip_address: req.ip,
            user_agent: userAgent.data,
            activity_name: 'UPDATE',
            activity_description: 'UPDATED STUDENT SPONSORSHIP RECORD',
            table_name: 'student_programmes',
            old_properties: findStudentProgramme,
            new_properties: student,
            staff_id: userId,
            student_id: studentId,
          },
          transaction
        );

        return student;
      });

      http.setSuccess(
        200,
        'Student Sponsorship Records Updated Successfully.',
        {
          data: student,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Update Student Sponsorship Records.', {
        error: error.message,
      });

      return http.send(res);
    }
  }

  /**
   * UPDATE Specific Student Document.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async updateStudentDocumentVerification(req, res) {
    const data = req.body;

    try {
      const { studentNumber, studentProgrammeId } = req.params;
      const { id: userId } = req.user;

      const findStudentProgramme = await studentProgrammeService.findOne({
        where: {
          id: studentProgrammeId,
          student_number: studentNumber,
          is_current_programme: true,
        },
        raw: true,
      });

      if (!findStudentProgramme) throw new Error('Invalid Student Programme');

      await model.sequelize.transaction(async (transaction) => {
        const updateStudent = await studentService.updateStudentProgramme(
          studentProgrammeId,
          {
            documents_verified: data.documents_verified,
            documents_verified_by_id: data.documents_verified ? userId : null,
            last_updated_by_id: data.last_updated_by_id,
          },
          transaction
        );

        const student = updateStudent[1][0];

        await studentMgtActivityLogService.create(
          {
            ip_address: req.ip,
            user_agent: userAgent.data,
            activity_name: 'UPDATE',
            activity_description: ` ${
              data.documents_verified ? 'VERIFIED' : 'UNVERIFIED'
            } STUDENT DOCUMENT`,
            table_name: 'student_programmes',
            old_properties: findStudentProgramme,
            new_properties: student,
            staff_id: userId,
            student_id: findStudentProgramme.student_id,
          },
          transaction
        );

        return student;
      });

      http.setSuccess(
        200,
        `Student Document ${
          data.documents_verified ? 'Verified' : 'Unverified'
        } Successfully.`
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        `Unable To ${
          data.documents_verified ? 'Verified' : 'Unverified'
        } Student Documents.`,
        {
          error: error.message,
        }
      );

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   */
  async pushStudentsToSIC(req, res) {
    try {
      const { applicants } = req.body;
      const { id: userId } = req.user;
      const random = Math.floor(Math.random() * moment().unix());
      const generatedBatchNumber = `APPLICANT-BATCH${random}`;
      const skippedRecords = [];

      if (isEmpty(applicants))
        throw new Error(`Please select students to push.`);

      const pushedStudents = [];

      const metadataValues = await metadataValueService.findAllMetadataValues({
        include: ['metadata'],
      });

      const inactive = getMetadataValueId(
        metadataValues,
        'INACTIVE',
        'STUDENT ACCOUNT STATUSES'
      );

      const academicStatus = getMetadataValueId(
        metadataValues,
        'NORMAL PROGRESS',
        'STUDENT ACADEMIC STATUSES'
      );

      const maritalStatus = getMetadataValueId(
        metadataValues,
        'SINGLE',
        'MARITAL STATUSES'
      );

      const allProgrammes = await programmeService
        .findAllProgrammes({
          include: [
            {
              association: 'programmeStudyTypes',
              separate: true,
              attributes: ['id', 'programme_type_id', 'programme_id'],
            },
          ],
        })
        .then((res) => {
          if (res) {
            return res.map((item) => item.get({ plain: true }));
          }
        });

      if (isEmpty(allProgrammes)) {
        throw new Error(`Unable To Find Any Programmes.`);
      }

      const allSponsors = await sponsorService.findAllRecords({
        raw: true,
      });

      await model.sequelize.transaction(async (transaction) => {
        for (const applicantId of applicants) {
          const findApplicant =
            await admittedApplicantService.findOneAdmittedApplicant({
              where: { id: applicantId },
              raw: true,
            });

          if (findApplicant) {
            findApplicant.gender = toUpper(trim(findApplicant.gender)).includes(
              'F'
            )
              ? 'FEMALE'
              : 'MALE';

            if (!findApplicant.student_number) {
              throw new Error(
                `${findApplicant.surname} ${findApplicant.other_names} Has No Student Number generated.`
              );
            }

            if (!findApplicant.registration_number) {
              throw new Error(
                `${findApplicant.surname} ${findApplicant.other_names} Has No Registration Number.`
              );
            }

            let runningAdmissionApplicantId = null;

            let homeDistrict = findApplicant.district_of_origin
              ? toUpper(trim(findApplicant.district_of_origin))
              : 'NO RECORD AVAILABLE';

            let applicantPhone =
              trim(findApplicant.phone) || `256${findApplicant.student_number}`;

            let applicantEmail = findApplicant.email
              ? trim(findApplicant.email)
              : `${findApplicant.student_number}${appConfig.INSTITUTION_EMAIL_EXTENSION}`;

            let dob = findApplicant.date_of_birth
              ? findApplicant.date_of_birth.toString()
              : moment().startOf('day').toString();

            let nin = 'NO RECORD AVAILABLE';

            let passport = 'NO RECORD AVAILABLE';

            let rlgn = 'NO RECORD AVAILABLE';

            if (findApplicant.running_admission_applicant_id) {
              const applicantRecord =
                await runningAdmissionApplicantService.findOneRunningAdmissionApplicant(
                  {
                    where: {
                      id: findApplicant.running_admission_applicant_id,
                    },
                    include: [
                      {
                        association: 'applicant',
                        include: [
                          {
                            association: 'bioData',
                            separate: true,
                          },
                        ],
                      },
                    ],
                  }
                );

              if (!applicantRecord) {
                throw new Error(
                  `Unable To Find The Running Admission Form For Applicant: ${findApplicant.surname} ${findApplicant.other_names}.`
                );
              }

              runningAdmissionApplicantId = applicantRecord.applicant_id;

              const findFormBioData = applicantRecord.applicant.bioData.find(
                (bio) =>
                  toUpper(trim(bio.form_id)) ===
                  toUpper(trim(applicantRecord.form_id))
              );

              const phone = trim(applicantRecord.applicant.phone);

              applicantPhone = phone || `256${findApplicant.student_number}`;

              applicantEmail = trim(applicantRecord.applicant.email);
              homeDistrict = findFormBioData
                ? findFormBioData.district_of_origin
                : 'NO RECORD AVAILABLE';

              dob = findFormBioData
                ? findFormBioData.date_of_birth.toString()
                : 'NO RECORD AVAILABLE';

              nin = findFormBioData
                ? toUpper(trim(findFormBioData.national_id_number))
                : 'NO RECORD AVAILABLE';

              passport = findFormBioData
                ? toUpper(trim(findFormBioData.passport_id_number))
                : 'NO RECORD AVAILABLE';

              rlgn = findFormBioData
                ? toUpper(trim(findFormBioData.religion))
                : 'NO RECORD AVAILABLE';
            }

            const findProgramme = allProgrammes.find(
              (prog) =>
                parseInt(prog.id, 10) ===
                parseInt(findApplicant.programme_id, 10)
            );

            if (!findProgramme) {
              throw new Error(
                `Unable To Find Programme For Applicant ${toUpper(
                  trim(findApplicant.surname)
                )} ${toUpper(trim(findApplicant.other_names))}.`
              );
            }

            const findProgrammeTypeId = findProgramme.programmeStudyTypes.find(
              (type) =>
                parseInt(type.programme_type_id, 10) ===
                parseInt(findApplicant.programme_type_id, 10)
            );

            if (!findProgrammeTypeId) {
              throw new Error(
                `Unable To Find Programme Type For Applicant ${toUpper(
                  trim(findApplicant.surname)
                )} ${toUpper(trim(findApplicant.other_names))}.`
              );
            }

            const sponsorData = {
              sponsor_id: findApplicant.sponsor_id,
              created_by_id: userId,
            };

            const findSponsor = allSponsors.find(
              (sponsor) =>
                parseInt(sponsor.id, 10) ===
                parseInt(findApplicant.sponsor_id, 10)
            );

            const findStudentMatch = await studentService.findOneStudent({
              where: { email: applicantEmail, phone: applicantPhone },
              raw: true,
            });

            if (!findStudentMatch) {
              const pushedStudentData = {
                surname: toUpper(trim(findApplicant.surname)),
                other_names: toUpper(trim(findApplicant.other_names)),
                student_account_status_id: inactive,
                phone: applicantPhone,
                email: applicantEmail,
                date_of_birth: dob,
                home_district: homeDistrict,
                nationality: toUpper(trim(findApplicant.nationality)),
                national_id_number: nin,
                passport_id_number: passport,
                religion: rlgn,
                student_number: trim(findApplicant.student_number),
                gender: toUpper(trim(findApplicant.gender)),
                created_by_id: userId,
                admittedApplicants: {
                  admitted_applicant_id: applicantId,
                  sponsorship_id: findApplicant.sponsorship_id,
                  running_admission_applicant_id:
                    findApplicant.running_admission_applicant_id
                      ? findApplicant.running_admission_applicant_id
                      : null,
                  applicant_id: runningAdmissionApplicantId,
                  created_by_id: userId,
                },
                programmes: {
                  applicant_id: runningAdmissionApplicantId,
                  programme_id: findApplicant.programme_id,
                  programme_type_id: findProgrammeTypeId.id,
                  programme_version_id: findApplicant.programme_version_id,
                  subject_combination_id: findApplicant.subject_combination_id
                    ? findApplicant.subject_combination_id
                    : null,
                  fees_waiver_id: findApplicant.fees_waiver_id,
                  entry_academic_year_id: findApplicant.entry_academic_year_id,
                  entry_study_year_id: findApplicant.entry_study_year_id,
                  current_study_year_id: findApplicant.entry_study_year_id,
                  intake_id: findApplicant.intake_id,
                  campus_id: findApplicant.campus_id,
                  sponsorship_id: findApplicant.sponsorship_id,
                  billing_category_id: findApplicant.billing_category_id,
                  residence_status_id: findApplicant.residence_status_id,
                  hall_of_attachment_id: findApplicant.hall_of_attachment_id,
                  hall_of_residence_id: findApplicant.hall_of_residence_id,
                  student_academic_status_id: academicStatus,
                  marital_status_id: maritalStatus,
                  registration_number: trim(findApplicant.registration_number),
                  student_number: trim(findApplicant.student_number),
                  is_current_programme: true,
                  sponsor: findSponsor ? findSponsor.sponsor_name : '',
                  created_by_id: userId,
                  approvals: {
                    created_by_id: userId,
                    batch_number: generatedBatchNumber,
                    upload_type: 'ADMITTED APPLICANT',
                  },
                  studentSponsor: findApplicant.sponsor_id ? sponsorData : null,
                },
              };

              const result = await insertNewStudent(
                req,
                pushedStudentData,
                transaction
              );

              pushedStudents.push(result);

              await admittedApplicantService.updateAdmittedApplicant(
                applicantId,
                { student_account_created: true },
                transaction
              );
            } else {
              skippedRecords.push(findStudentMatch.email);
              // throw new Error(
              //   `A student account already exists with emails ${
              //     findStudentMatch.email
              //   } or phone ${findStudentMatch.phone} with names ${
              //     findStudentMatch.surname
              //   } ${findStudentMatch.other_names} Blocking student ${toUpper(
              //     trim(findApplicant.surname)
              //   )} ${toUpper(trim(findApplicant.other_names))} email: ${
              //     findApplicant.email
              //   }, Phone: ${findApplicant.phone}.`
              // );
            }
          }
        }
      });

      http.setSuccess(
        200,
        `Applicants Pushed To SIC Successfully, Records Already In SRM Skipped Are: ${skippedRecords.length}`,
        {
          data: pushedStudents,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Push Applicants To SIC.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   */
  async pushApplicantsToSICAsPreviousStudents(req, res) {
    try {
      const data = req.body;
      const user = req.user.id;
      const random = Math.floor(Math.random() * moment().unix());
      const generatedBatchNumber = `APPLICANT-BATCH${random}`;

      data.created_by_id = user;

      const pushedStudents = [];

      const metadataValues = await metadataValueService.findAllMetadataValues({
        include: ['metadata'],
      });

      const inactive = getMetadataValueId(
        metadataValues,
        'INACTIVE',
        'STUDENT ACCOUNT STATUSES'
      );

      const academicStatus = getMetadataValueId(
        metadataValues,
        'NORMAL PROGRESS',
        'STUDENT ACADEMIC STATUSES'
      );

      const maritalStatus = getMetadataValueId(
        metadataValues,
        'SINGLE',
        'MARITAL STATUSES'
      );

      const allProgrammes = await programmeService
        .findAllProgrammes({
          include: [
            {
              association: 'programmeStudyTypes',
              attributes: ['id', 'programme_type_id', 'programme_id'],
            },
          ],
        })
        .then((res) => {
          if (res) {
            return res.map((item) => item.get({ plain: true }));
          }
        });

      if (isEmpty(allProgrammes)) {
        throw new Error(`Unable To Find Any Programmes.`);
      }

      const allAdmittedApplicants =
        await admittedApplicantService.findAllAdmittedApplicants({
          raw: true,
        });

      if (isEmpty(allAdmittedApplicants)) {
        throw new Error(`Unable To Find Any Admitted Applicant.`);
      }

      // const allrunningAdmissionApplicants =
      //   await runningAdmissionApplicantService
      //     .findAllRunningAdmissionApplicants({
      //       include: [
      //         {
      //           association: 'applicant',
      //           include: [
      //             {
      //               association: 'bioData',
      //             },
      //           ],
      //         },
      //       ],
      //     })
      //     .then((res) => {
      //       if (res) {
      //         return res.map((item) => item.get({ plain: true }));
      //       }
      //     });

      const allSponsors = await sponsorService.findAllRecords({
        raw: true,
      });

      await model.sequelize.transaction(async (transaction) => {
        if (!isEmpty(data.applicants)) {
          for (const id of data.applicants) {
            const findRecord = allAdmittedApplicants.find(
              (admitted) => parseInt(admitted.id, 10) === parseInt(id, 10)
            );

            if (!findRecord) {
              throw new Error(
                'Unable To Find One Of The Applicants Records Provided.'
              );
            }

            if (findRecord.student_account_created === true) {
              throw new Error(
                `The Student Account For ${findRecord.surname} ${findRecord.other_names} Has Already Been Created.`
              );
            }

            if (toUpper(trim(findRecord.gender)) === 'M') {
              findRecord.gender = 'MALE';
            } else if (toUpper(trim(findRecord.gender)) === 'F') {
              findRecord.gender = 'FEMALE';
            }

            if (!findRecord.student_number) {
              throw new Error(
                `${findRecord.surname} ${findRecord.other_names} Has No Student Number.`
              );
            }

            if (!findRecord.registration_number) {
              throw new Error(
                `${findRecord.surname} ${findRecord.other_names} Has No Registration Number.`
              );
            }

            let applicantId = null;

            let applicantPhone = findRecord.phone
              ? trim(findRecord.phone)
              : `256${findRecord.student_number}`;

            let applicantEmail = findRecord.email
              ? trim(findRecord.email)
              : `${findRecord.student_number}${appConfig.INSTITUTION_EMAIL_EXTENSION}`;

            if (findRecord.running_admission_applicant_id) {
              const findRunningAdmissionApplicant =
                await runningAdmissionApplicantService
                  .findOneRunningAdmissionApplicant({
                    where: {
                      id: findRecord.running_admission_applicant_id,
                    },
                    include: [
                      {
                        association: 'applicant',
                        include: [
                          {
                            association: 'bioData',
                          },
                        ],
                      },
                    ],
                    nest: true,
                  })
                  .then((res) => {
                    if (res) {
                      const result = res.toJSON();

                      return result;
                    }
                  });

              // allrunningAdmissionApplicants.find(
              //   (rapp) =>  // allrunningAdmissionApplicants.find(
              //   (rapp) =>
              //     parseInt(rapp.id, 10) ===
              //     parseInt(findRecord.running_admission_applicant_id, 10)
              // );

              if (!findRunningAdmissionApplicant) {
                throw new Error(
                  `Unable To Find The Running Admission Form For Applicant: ${findRecord.surname} ${findRecord.other_names}.`
                );
              }

              applicantId = findRunningAdmissionApplicant.applicant_id;

              applicantPhone = trim(
                findRunningAdmissionApplicant.applicant.phone
              );
              applicantEmail = trim(
                findRunningAdmissionApplicant.applicant.email
              );
            }

            const findProgramme = allProgrammes.find(
              (prog) =>
                parseInt(prog.id, 10) === parseInt(findRecord.programme_id, 10)
            );

            if (!findProgramme) {
              throw new Error(
                `Unable To Find Programme For Applicant ${toUpper(
                  trim(findRecord.surname)
                )} ${toUpper(trim(findRecord.other_names))}.`
              );
            }

            const findProgrammeTypeId = findProgramme.programmeStudyTypes.find(
              (type) =>
                parseInt(type.programme_type_id, 10) ===
                parseInt(findRecord.programme_type_id, 10)
            );

            if (!findProgrammeTypeId) {
              throw new Error(
                `Unable To Find Programme Type For Applicant ${toUpper(
                  trim(findRecord.surname)
                )} ${toUpper(trim(findRecord.other_names))}.`
              );
            }

            const sponsorData = {
              sponsor_id: findRecord.sponsor_id,
              created_by_id: user,
            };

            const findSponsor = allSponsors.find(
              (sponsor) =>
                parseInt(sponsor.id, 10) === parseInt(findRecord.sponsor_id, 10)
            );

            const findDuplicateStudent =
              await studentService.findDuplicateStudentRecord({
                email: applicantEmail,
                phone: applicantPhone,
              });

            if (findDuplicateStudent) {
              const studentProgrammeData = {
                student_id: findDuplicateStudent.id,
                applicant_id: applicantId,
                programme_id: findRecord.programme_id,
                programme_type_id: findProgrammeTypeId.id,
                programme_version_id: findRecord.programme_version_id,
                subject_combination_id: findRecord.subject_combination_id
                  ? findRecord.subject_combination_id
                  : null,
                fees_waiver_id: findRecord.fees_waiver_id,
                entry_academic_year_id: findRecord.entry_academic_year_id,
                entry_study_year_id: findRecord.entry_study_year_id,
                current_study_year_id: findRecord.entry_study_year_id,
                intake_id: findRecord.intake_id,
                campus_id: findRecord.campus_id,
                sponsorship_id: findRecord.sponsorship_id,
                billing_category_id: findRecord.billing_category_id,
                residence_status_id: findRecord.residence_status_id,
                hall_of_attachment_id: findRecord.hall_of_attachment_id,
                hall_of_residence_id: findRecord.hall_of_residence_id,
                student_academic_status_id: academicStatus,
                marital_status_id: maritalStatus,
                registration_number: trim(findRecord.registration_number),
                student_number: trim(findRecord.student_number),
                is_current_programme: true,
                sponsor: findSponsor ? findSponsor.sponsor_name : '',
                created_by_id: user,
                approvals: {
                  created_by_id: user,
                  batch_number: generatedBatchNumber,
                  upload_type: 'ADMITTED APPLICANT',
                },
                studentSponsor: findRecord.sponsor_id ? sponsorData : null,
              };

              const admittedApplicantData = {
                student_id: findDuplicateStudent.id,
                admitted_applicant_id: id,
                sponsorship_id: findRecord.sponsorship_id,
                running_admission_applicant_id:
                  findRecord.running_admission_applicant_id
                    ? findRecord.running_admission_applicant_id
                    : null,
                applicant_id: applicantId,
                created_by_id: user,
              };

              const findPreviousProgrammes =
                await studentService.findAllStudentProgrammes({
                  where: {
                    student_id: findDuplicateStudent.id,
                  },

                  raw: true,
                });

              if (!isEmpty(findPreviousProgrammes)) {
                for (const record of findPreviousProgrammes) {
                  await studentService.updateStudentProgramme(
                    record.id,
                    { is_current_programme: false },
                    transaction
                  );
                }
              }

              const result = await studentService.createStudentProgramme(
                studentProgrammeData,
                transaction
              );

              await studentService.createStudentApplication(
                admittedApplicantData,
                transaction
              );

              const pwd = await passwordHasher(trim(findRecord.student_number));

              await studentService.updateStudentWithTransaction(
                findDuplicateStudent.id,
                {
                  password: pwd,
                  email_verified: false,
                  student_account_status_id: inactive,
                },
                transaction
              );

              pushedStudents.push(result);

              await admittedApplicantService.updateAdmittedApplicant(
                id,
                { student_account_created: true },
                transaction
              );
            } else {
              throw new Error(
                `APPLICANT: ${trim(findRecord.surname)} ${trim(
                  findRecord.other_names
                )} IS NOT A PREVIOUS STUDENT.`
              );
            }
          }
        }
      });

      http.setSuccess(200, 'Previous Students Pushed To SIC Successfully.', {
        data: pushedStudents,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Push Previous Students To SIC.', {
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
  async downloadNotPushedToSICReport(req, res) {
    try {
      const { id: user, surname, other_names: otherNames } = req.user;

      const context = req.query;

      if (
        !context.academic_year_id ||
        !context.intake_id ||
        !context.admission_scheme_id ||
        !context.degree_category_id
      ) {
        throw new Error(`Invalid Context.`);
      }

      const institutionStructure =
        await institutionStructureService.findInstitutionStructureRecords({
          attributes: ['institution_name', 'institution_logo'],
        });

      if (!institutionStructure) {
        throw new Error('Unable To Find Institution Structure.');
      }

      const metadataValues = await metadataValueService.findAllMetadataValues({
        include: {
          association: 'metadata',
          attributes: ['id', 'metadata_name'],
        },
        attributes: ['id', 'metadata_value'],
      });

      const academicYear = getMetadataValueName(
        metadataValues,
        context.academic_year_id,
        'ACADEMIC YEARS'
      );

      const intake = getMetadataValueName(
        metadataValues,
        context.intake_id,
        'INTAKES'
      );

      const degreeCategory = getMetadataValueName(
        metadataValues,
        context.degree_category_id,
        'DEGREE CATEGORIES'
      );

      const findAdmissionScheme =
        await admissionSchemeService.findOneAdmissionScheme({
          where: {
            id: context.admission_scheme_id,
          },
          attributes: ['id', 'scheme_name'],
          raw: true,
        });

      if (!findAdmissionScheme) {
        throw new Error(`Unable To Find Admission Scheme Specified.`);
      }

      const workbook = new excelJs.Workbook();
      const rootSheet = workbook.addWorksheet('APPLICANTS');

      rootSheet.mergeCells('C1', 'O3');
      rootSheet.mergeCells('A1', 'B2');
      const titleCell = rootSheet.getCell('C1');

      rootSheet.getRow(1).height = 65;

      titleCell.value = `${
        institutionStructure.institution_name || 'TERP'
      } \n APPLICANTS NOT ABLE TO BE PUSHED REPORT FOR \n SCHEME: ${
        findAdmissionScheme.scheme_name
      }, ACADEMIC YEAR: ${academicYear}, INTAKE: ${intake}, DEGREE CATEGORY: ${degreeCategory}.`;

      titleCell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
      };

      titleCell.font = { bold: true, size: 10, name: 'Arial' };

      const headerRow = rootSheet.getRow(3);

      headerRow.values = map(verifyTopushToSICTemplateColumns, 'header');
      headerRow.font = { bold: true, size: 11, color: '#2c3e50' };
      rootSheet.columns = verifyTopushToSICTemplateColumns.map((column) => {
        delete column.header;

        return column;
      });
      rootSheet.getRow(3).height = 40;

      rootSheet.views = [
        {
          state: 'frozen',
          xSplit: 0,
          ySplit: 3,
          topLeftCell: 'G10',
          activeCell: 'A1',
        },
      ];

      const allProgrammes = await programmeService.findAllProgrammes({
        attributes: ['id', 'programme_code', 'programme_title'],
        raw: true,
      });

      const templateData = [];

      const findAdmittedApplicantsByContext = await admittedApplicantService
        .findAllAdmittedApplicants({
          where: {
            entry_academic_year_id: context.academic_year_id,
            intake_id: context.intake_id,
            admission_scheme_id: context.admission_scheme_id,
            degree_category_id: context.degree_category_id,
          },
          include: [
            {
              association: 'programme',
              attributes: ['id', 'programme_code'],
            },
          ],
        })
        .then((res) => {
          if (res) {
            return res.map((item) => item.get({ plain: true }));
          }
        });

      if (isEmpty(findAdmittedApplicantsByContext)) {
        throw new Error(
          `Unable to find any admitted applicants on Scheme: ${findAdmissionScheme.scheme_name}, Academic year: ${academicYear}, Intake: ${intake} and Degree category: ${degreeCategory}.`
        );
      }

      const recordsWithStudentAndRegNos =
        findAdmittedApplicantsByContext.filter(
          (applicant) =>
            applicant.registration_number &&
            applicant.student_number &&
            applicant.student_account_created === false
        );

      if (isEmpty(recordsWithStudentAndRegNos)) {
        throw new Error(
          `Unable to find any admitted applicants with registration and student numbers on Scheme: ${findAdmissionScheme.scheme_name}, Academic year: ${academicYear}, Intake: ${intake} and Degree category: ${degreeCategory}.`
        );
      }

      const allStudents = await studentService.findAllStudents({
        raw: true,
      });

      const allrunningAdmissionApplicants =
        await runningAdmissionApplicantService
          .findAllRunningAdmissionApplicants({
            include: [
              {
                association: 'applicant',
                include: [
                  {
                    association: 'bioData',
                  },
                ],
              },
            ],
          })
          .then((res) => {
            if (res) {
              return res.map((item) => item.get({ plain: true }));
            }
          });

      for (const findRecord of recordsWithStudentAndRegNos) {
        let applicantPhone = findRecord.phone
          ? trim(findRecord.phone)
          : `256${findRecord.student_number}`;

        let applicantEmail = findRecord.email
          ? trim(findRecord.email)
          : `${findRecord.student_number}${appConfig.INSTITUTION_EMAIL_EXTENSION}`;

        let findRunningAdmissionApplicant = null;

        if (findRecord.running_admission_applicant_id) {
          findRunningAdmissionApplicant = allrunningAdmissionApplicants.find(
            (rapp) =>
              parseInt(rapp.id, 10) ===
              parseInt(findRecord.running_admission_applicant_id, 10)
          );

          if (!findRunningAdmissionApplicant) {
            throw new Error(
              `Unable To Find The Running Admission Form For Applicant: ${findRecord.surname} ${findRecord.other_names}.`
            );
          }

          applicantPhone = trim(findRunningAdmissionApplicant.applicant.phone);
          applicantEmail = trim(findRunningAdmissionApplicant.applicant.email);
        }

        const findDuplicateStudent = allStudents.find(
          (std) =>
            trim(std.email) === trim(applicantEmail) ||
            trim(std.phone) === trim(applicantPhone)
        );

        if (findDuplicateStudent) {
          const findProgramme = allProgrammes.find(
            (prog) =>
              parseInt(prog.id, 10) === parseInt(findRecord.programme_id, 10)
          );

          templateData.push([
            toUpper(trim(findRecord.surname)),
            toUpper(trim(findRecord.other_names)),
            trim(applicantEmail),
            trim(applicantPhone),
            trim(findRecord.registration_number),
            trim(findRecord.student_number),
            findProgramme ? toUpper(trim(findProgramme.programme_code)) : '',
            findProgramme ? toUpper(trim(findProgramme.programme_title)) : '',
            findRunningAdmissionApplicant
              ? trim(findRunningAdmissionApplicant.form_id)
              : '',
            'EXISTING STUDENT',
            `FOUND AN EXISTING STUDENT RECORD WITH SIMILAR EMAIL (${findDuplicateStudent.email}) OR PHONE NUMBER (${findDuplicateStudent.phone}) BELONGING TO ${findDuplicateStudent.surname} ${findDuplicateStudent.other_names}`,
          ]);
        }
      }

      if (isEmpty(templateData)) {
        throw new Error(
          `Unable to find any applicant who cannot be pushed to students records on Scheme: ${findAdmissionScheme.scheme_name}, Academic year: ${academicYear}, Intake: ${intake} and Degree category: ${degreeCategory}.`
        );
      }

      rootSheet.addRows(templateData);

      const uploadPath = `${appConfig.APP_URL}/documents/templates`;

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true }, (err) => {
          throw new Error(err.message);
        });
      }

      const template = `${uploadPath}/not-pushed-applicants-${surname}-${otherNames}-${user}-${now()}.xlsm`;

      await workbook.xlsx.writeFile(template);
      await res.download(template, 'NOT-PUSHED-APPLICANTS.xlsx', (error) => {
        if (error) {
          throw new Error(error.message);
        }
      });
    } catch (error) {
      http.setError(400, 'Unable To Download Template.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /** createStudentAcademicStatus
   *
   * @param {*} req
   * @param {*} res
   */
  async createStudentAcademicStatus(req, res) {
    try {
      const data = req.body;
      const { studentId } = req.params;
      const user = req.user.id;

      data.created_by_id = user;
      data.student_id = studentId;

      const studentDataToUpdate = {
        student_academic_status_id: data.student_academic_status_id,
      };

      const createAcademicStatus = await model.sequelize.transaction(
        async (transaction) => {
          const status = await studentService.createAcademicStatus(
            data,
            transaction
          );

          await studentService.updateStudentWithTransaction(
            studentId,
            studentDataToUpdate,
            transaction
          );

          return status;
        }
      );

      http.setSuccess(201, 'Student Academic Status Updated Successfully', {
        data: createAcademicStatus,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Update This Student Academic Status.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   */
  async fetchStudentAcademicStatusRecords(req, res) {
    try {
      const { studentId } = req.params;
      const student = await studentService.findAllStudentAcademicStatusRecords({
        where: {
          student_id: studentId,
        },
        include: [
          {
            association: 'academicYear',
            attributes: ['id', 'academic_year_id'],
            include: {
              all: true,
            },
          },
          {
            association: 'academicStatus',
            attributes: ['metadata_value'],
          },
        ],
      });

      http.setSuccess(
        200,
        'Student academic status records fetched successfully.',
        {
          data: student,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch This Student Academic Status.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Get Specific Student Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async fetchStudent(req, res) {
    const { id } = req.params;
    const student = await studentService.findOneStudent({ where: { id } });

    http.setSuccess(200, 'Student fetch successful', { student });
    if (isEmpty(student)) http.setError(404, 'Student Data Not Found.');

    return http.send(res);
  }

  /**
   * Get Specific Student Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async fetchStudentByRegNoOrStudentNo(req, res) {
    try {
      const data = req.query;

      const student =
        await studentService.findStudentByRegistrationOrStudentNumber(
          data,
          req
        );

      http.setSuccess(200, 'Student fetched successfully', {
        data: student,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to fetch this student.', {
        error: error.message,
      });

      return http.send(res);
    }
  }

  /**
   * Get Student Enrollment and Registration Records.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async fetchStudentRegistrationAndEnrollmentRecords(req, res) {
    try {
      const { studentProgrammeId } = req.params;

      const studentProgramme = await studentService.findOneStudentProgramme({
        where: {
          id: studentProgrammeId,
        },
        attributes: [
          'id',
          'student_id',
          'campus_id',
          'entry_academic_year_id',
          'current_study_year_id',
          'intake_id',
          'is_current_programme',
        ],
        raw: true,
      });

      if (!studentProgramme) {
        throw new Error('Academic Record Does Not Exist.');
      }

      const studentCampusId = studentProgramme.campus_id;
      const studentEntryAcademicYearId =
        studentProgramme.entry_academic_year_id;
      const studentIntakeId = studentProgramme.intake_id;

      const enrollmentEvent = await eventService.findOneEventWithEventsView(
        studentCampusId,
        studentIntakeId,
        studentEntryAcademicYearId,
        "'ENROLLMENT'",
        "'KEY EVENT'"
      );

      const registrationEvent = await eventService.findOneEventWithEventsView(
        studentCampusId,
        studentIntakeId,
        studentEntryAcademicYearId,
        "'REGISTRATION'",
        "'KEY EVENT'"
      );

      let response = {};

      response = {
        enrollmentEvent: enrollmentEvent[0] || null,
        registrationEvent: registrationEvent[0] || null,
      };

      http.setSuccess(
        200,
        'Enrollment And Registration Records Fetched Successfully.',
        {
          data: response,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable To Fetch Enrollment And Registration Records.',
        {
          error: error.message,
        }
      );

      return http.send(res);
    }
  }

  /**
   * Get Student Enrollment and Registration Records.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async updateAcademicStatus(req, res) {
    try {
      const { studentProgrammeId, studentId } = req.params;
      const data = req.body;
      const { id: userId } = req.user;

      const studentProgramme = await studentService.findOneStudentProgramme({
        where: {
          id: studentProgrammeId,
          student_id: studentId,
        },
        attributes: [
          'id',
          'student_id',
          'campus_id',
          'entry_academic_year_id',
          'current_study_year_id',
          'intake_id',
          'is_current_programme',
        ],
        raw: true,
      });

      if (!studentProgramme) {
        throw new Error('This Academic Record Does Not Exist.');
      }

      let updatedRecord;

      await model.sequelize.transaction(async (transaction) => {
        updatedRecord = await studentProgrammeService.update(
          { id: studentProgrammeId },
          {
            student_academic_status_id: data.academic_status_id,
            academic_status_comment: data.comment,
            academic_status_academic_year_id: data.academic_year_id,
            academic_status_created_by_id: userId,
            academic_status_active_until: data.expiry_date
              ? moment(data.expiry_date).format()
              : null,
          }
        );

        for (const action of data.actions) {
          await studentProgrammeService.createAcademicStatus(
            {
              student_academic_status_id: data.academic_status_id,
              student_programme_id: studentProgrammeId,
            },
            {
              ...action,
              reason: data.comment,
              created_by_id: userId,
              academic_status_active_until: data.expiry_date
                ? moment(data.expiry_date).format()
                : null,
            }
          );
        }
      });

      http.setSuccess(
        200,
        'Student Academic Record has been updated successfully.',
        {
          data: updatedRecord,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable To Fetch Enrollment And Registration Records.',
        {
          error: error.message,
        }
      );

      return http.send(res);
    }
  }

  /**
   * Destroy Student Data
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async deleteStudent(req, res) {
    try {
      const { id } = req.params;

      await studentService.deleteStudent(id);
      http.setSuccess(200, 'Student deleted successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to delete this Student.', { error });

      return http.send(res);
    }
  }

  /**
   * Destroy Student Data
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async deleteStudentsFromSRM(req, res) {
    try {
      const { studentProgrammeIds } = req.body;
      const { id } = req.user;

      if (isEmpty(studentProgrammeIds)) {
        throw new Error('Provide list of students to delete');
      }

      await model.sequelize.transaction(async (transaction) => {
        for (const studentProgId of studentProgrammeIds) {
          const findStudentProgramme = await studentProgrammeService
            .findOne({
              where: { id: studentProgId },
              include: ['student', 'programme'],
              plain: true,
              transaction,
            })
            .then((res) => (res ? res.toJSON() : {}));

          if (isEmpty(findStudentProgramme))
            throw new Error('No Student programmes found');

          const findApproval =
            await studentApprovalService.findOneStudentApproval({
              where: { student_programme_id: findStudentProgramme.id },
              raw: true,
            });

          await studentApprovalService.deleteStudentApproval({
            where: { student_programme_id: findStudentProgramme.id },
            transaction,
          });

          await studentProgrammeService.destroy({
            where: { id: studentProgId },
            return: true,
            transaction,
          });

          const findApplication =
            await studentService.findOneStudentApplication({
              where: { student_id: findStudentProgramme.student_id },
              raw: true,
            });

          await studentService.destroyStudentApplication({
            where: { student_id: findStudentProgramme.student_id },
            transaction,
          });

          await studentService.destroy({
            where: { id: findStudentProgramme.student_id },
            transaction,
          });

          if (findStudentProgramme.applicant_id) {
            await admittedApplicantService.updateAdmittedApplicant(
              findStudentProgramme.applicant_id,
              {
                student_account_created: false,
              },
              transaction
            );
          }

          await studentService.createDeleteSRMStudentLog(
            {
              student_name: `${findStudentProgramme.student.surname} ${findStudentProgramme.student.other_names}`,
              programme_name: `${findStudentProgramme.programme.programme_title} - (${findStudentProgramme.programme.programme_code})`,
              deleted_student_programme_records: findStudentProgramme.programme,
              deleted_student_records: findStudentProgramme.student,
              ip_address: req.ip,
              user_agent: userAgent.data,
              deleted_student_applicant_records: findApplication,
              deleted_student_approval_records: findApproval,
              created_by_id: id,
            },
            {
              transaction,
            }
          );
        }
      });

      http.setSuccess(200, 'Student Records deleted successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to delete Students from SRM.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   * fetch students by context
   */
  async fetchStudentsByContext(req, res) {
    try {
      const context = req.body;
      const students = await studentService.findStudentsByContext(context);

      http.setSuccess(200, 'Students Fetched Successfully', {
        students,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Students', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   * fetch students by Programme and entry academic year
   */
  async findStudentsByProgAndAcadYear(req, res) {
    try {
      const context = req.body;
      const students = await studentService.findStudentsByProgAndAcadYear(
        context
      );

      http.setSuccess(200, 'Students Fetched Successfully', {
        students,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Students', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   * Update Students Prog Versions
   */
  async updateStudentProgrammeVersions(req, res) {
    try {
      const context = req.body;

      await studentService.updateStudentProgrammeVersions(context);

      http.setSuccess(200, 'Students Updated Successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Update Students Records', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   * Update Students Account Status
   */
  async updateStudentsAccountStatus(req, res) {
    try {
      const data = req.body;

      const result = [];

      await model.sequelize.transaction(async (transaction) => {
        for (const student of data.students) {
          student.created_by_id = req.user.id;

          const response = await studentService.updateStudentsAccountStatus(
            student.student_id,
            student,
            transaction
          );

          result.push(response[1][0]);
        }
      });

      http.setSuccess(200, 'Students Account Statuses Updated Successfully', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Update Students Account Statuses', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Login Student with Either registration Number or Student Number and Password
   *
   * @param {function} req Http Request Body
   * @param {function} res Http Response
   *
   * @return {JSON} Return Json Response
   */
  async login(req, res) {
    const { username, password } = req.body;

    console.log('========================LOGIN=======================');
    console.log('LOGIN ORIGIN', req.originalUrl);
    console.log('REQUEST PARAMETERS', req.body);
    console.log('USER AGENT', userAgent.data);
    console.log('HEADERS', req.headers);
    console.log('======================================================');

    try {
      const userByRegNoOrStudentNo =
        await studentService.findStudentByRegistrationOrStudentNumber(
          {
            student: username,
          },
          req
        );

      if (isEmpty(userByRegNoOrStudentNo)) {
        http.setError(400, 'Invalid Username Provided.');

        return http.send(res);
      }

      if (userByRegNoOrStudentNo.student_account_status !== 'ACTIVE') {
        throw new Error(
          'Your Account Is Not Active. Please contact an Administrator for Assistance.'
        );
      }

      if (userByRegNoOrStudentNo.is_default_password === true) {
        throw new Error('Please change your default password before login in.');
      }

      const comparePassword = await bcrypt.compare(
        password,
        userByRegNoOrStudentNo.password
      );

      if (comparePassword) {
        const token = await createToken({
          id: userByRegNoOrStudentNo.id,
          student_number: userByRegNoOrStudentNo.student_number,
          registration_number: userByRegNoOrStudentNo.registration_number,
        });
        const tokenResponse = {
          token_type: 'Bearer',
          token,
        };

        await studentService.updateStudentCredentials(
          userByRegNoOrStudentNo.id,
          {
            last_login: moment(new Date()).format(),
            remember_token: token,
          }
        );

        await studentService.findOneStudent({
          where: { id: userByRegNoOrStudentNo.id },
          attributes: { exclude: ['remember_token'] },
        });

        http.setSuccess(200, 'Login successful', {
          access_token: tokenResponse,
        });
      } else {
        http.setError(400, 'Wrong username or password.');
      }

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to authenticate you', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   * Get The Authenticated Student
   */
  getAuthStudentProfile(req, res) {
    try {
      const student = omit(req.user, ['password', 'remember_token']);

      const activeProgramme =
        find(student.academic_records, 'is_current_programme') || {};

      http.setSuccess(200, 'Profile Fetched Successfully.', {
        data: student,
        activeProgramme,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Get This Student.', {
        error: { error: error.message },
      });

      return http.send(res);
    }
  }

  async getAuthStudentBalance(req, res) {
    try {
      const student = req.user;
      const unallocatedAmount =
        await paymentTransactionService.studentUnallocatedAmount(student.id);

      http.setSuccess(200, 'Account Balance.', {
        accountBalance: unallocatedAmount
          ? unallocatedAmount.total_unallocated_amount
          : 0,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Get This Student account .', {
        error: { error: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * UPDATE Student's Password.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async updateStudentPassword(req, res) {
    console.log(
      '========================UPDATE PASSWORD======================='
    );
    console.log('LOGIN ORIGIN', req.originalUrl);
    console.log('REQUEST PARAMETERS', req.body);
    console.log('USER AGENT', userAgent.data);
    console.log('HEADERS', req.headers);
    console.log('======================================================');

    try {
      const { id } = req.user;
      const loggedInUserPassword = req.user.password;
      const {
        new_password: newPassword,
        old_password: oldPassword,
        confirm_new_password: confirmNewPassword,
      } = req.body;
      const saltRounds = parseInt(appConfig.PASSWORD_SALT_ROUNDS, 10);
      const salt = await bcrypt.genSalt(saltRounds);
      const hashedPassword = await bcrypt.hashSync(newPassword, salt);

      if (newPassword !== confirmNewPassword) {
        http.setError(
          400,
          'Your confirm password does not Match the new password'
        );

        return http.send(res);
      }

      const comparePassword = await bcrypt.compare(
        oldPassword,
        loggedInUserPassword
      );

      if (comparePassword) {
        await studentService.changePassword(id, { password: hashedPassword });
        http.setSuccess(200, 'Your password has been changed successfully');
      } else {
        throw new Error('Your old password does not match.');
      }

      return http.send(res);
    } catch (error) {
      http.setError(400, error.message);

      return http.send(res);
    }
  }

  /**
   * Forgot Password
   * @param {
   * } req
   * @param {*} res
   */

  async sendPasswordResetToken(req, res) {
    console.log('========================REQUEST TOKEN=======================');
    console.log('LOGIN ORIGIN', req.originalUrl);
    console.log('REQUEST PARAMETERS', req.body);
    console.log('USER AGENT', userAgent.data);
    console.log('HEADERS', req.headers);
    console.log('======================================================');

    try {
      const { username } = req.body;
      const requestOrigin = 'STUDENT-PORTAL';
      const purpose = 'FORGOT-PASSWORD';

      const passwordGen = await passwordGenerator(
        req,
        username,
        requestOrigin,
        purpose
      );

      const emailSubject = replace(
        `${requestOrigin} RESET PASSWORD.`,
        '-',
        ' '
      );
      const smsText = `Dear ${passwordGen.surname} ${passwordGen.other_names}, 
          Your Password Reset Token Is: ${passwordGen.random_password}`;

      eventEmitter.on('studentResetPasswordEmailEvent', async () => {
        await sendMail(passwordGen.email, emailSubject, {
          app: 'STUDENT PORTAL',
          token: passwordGen.random_password,
          email: passwordGen.email,
          url: appConfig.STAFF_PORTAL_URL,
          name: passwordGen.surname,
          validFor: `${appConfig.PASSWORD_EXPIRES_IN} Mins`,
        }).catch((err) => {
          throw new Error(err.message);
        });
      });

      eventEmitter.on('studentResetPasswordSMSEvent', async () => {
        await sendSms(passwordGen.phone, smsText).catch((err) => {
          throw new Error(err.message);
        });
      });

      eventEmitter.emit('studentResetPasswordEmailEvent');
      eventEmitter.emit('studentResetPasswordSMSEvent');

      eventEmitter.removeAllListeners();

      http.setSuccess(
        200,
        `Password reset code has been sent! Check your email ${formatEmail(
          passwordGen.email
        )} and phone ${formatPhoneNumber(passwordGen.phone)} for code`
      );

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Error while sending password reset code.', {
        error: error.message,
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {
   * } req
   * @param {*} res
   */

  async resetStudentPasswordByStaff(req, res) {
    console.log(
      '========================RESET PASSWORD======================='
    );
    console.log('ORIGIN', req.originalUrl);
    console.log('REQUEST PARAMETERS', req.body);
    console.log('USER AGENT', userAgent.data);
    console.log('HEADERS', req.headers);
    console.log('======================================================');
    try {
      const data = {};
      const { regOrStdNumber } = req.params;
      const { id } = req.user;

      data.updated_at = moment.now();
      data.last_updated_by_id = id;
      data.username = regOrStdNumber;

      const requestOrigin = 'STAFF-PORTAL';
      const purpose = 'RESET-PASSWORD-BY-STAFF';

      const passwordGen = await passwordGenerator(
        req,
        data.username,
        requestOrigin,
        purpose,
        id
      );

      passwordGen.valid_for = `${appConfig.PASSWORD_EXPIRES_IN} Mins`;
      delete passwordGen.academic_records;
      delete passwordGen.password;

      http.setSuccess(
        200,
        `Password reset code for student: ${passwordGen.surname} ${passwordGen.other_names} has been Generated.`,
        {
          data: passwordGen,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Error while sending password reset code.', {
        error: error.message,
      });

      return http.send(res);
    }
  }

  /**
   * Forgot Password
   * @param {
   * } req
   * @param {*} res
   */

  async resetStudentPassword(req, res) {
    console.log(
      '========================RESET PASSWORD 2======================='
    );
    console.log('LOGIN ORIGIN', req.originalUrl);
    console.log('REQUEST PARAMETERS', req.body);
    console.log('USER AGENT', userAgent.data);
    console.log('HEADERS', req.headers);
    console.log('======================================================');
    try {
      const {
        username,
        new_password: newPassword,
        confirm_password: confirmNewPassword,
        otp_code: passwordToken,
      } = req.body;

      if (newPassword !== confirmNewPassword) {
        throw new Error('Passwords Do not Match.');
      }

      const userByRegNoOrStudentNo =
        await studentService.findStudentByRegistrationOrStudentNumber(
          {
            student: username,
          },
          req
        );

      if (isEmpty(userByRegNoOrStudentNo)) {
        http.setError(400, 'Invalid username provided.');

        return http.send(res);
      }

      const findRequest = await OTPCodeService.getOTPCode({
        where: {
          username: username,
          otp_code: passwordToken,
          is_used: false,
          request_origin: {
            [Op.or]: ['STAFF-PORTAL', 'STUDENT-PORTAL'],
          },
          purpose: {
            [Op.or]: ['FORGOT-PASSWORD', 'RESET-PASSWORD-BY-STAFF'],
          },
          expires_at: {
            [Op.gte]: moment.now(),
          },
        },
        raw: true,
      });

      if (!findRequest) {
        throw new Error('Invalid OTP Provided!');
      }

      const saltRounds = parseInt(appConfig.PASSWORD_SALT_ROUNDS, 10);
      const salt = await bcrypt.genSalt(saltRounds);

      const hashedPassword = await bcrypt.hashSync(newPassword, salt);

      await studentService.changePassword(userByRegNoOrStudentNo.id, {
        password: hashedPassword,
        is_default_password: false,
        password_changed_at: moment.now(),
      });

      await OTPCodeService.updateOTPCode(username, {
        is_used: true,
        used_at: moment.now(),
      });

      http.setError(200, 'Your password has been changed successfully.');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Error while changing password.', {
        error: error.message,
      });

      return http.send(res);
    }
  }

  /**
   * Forgot Password
   * @param {
   * } req
   * @param {*} res
   */

  async editStudentContacts(req, res) {
    try {
      console.log(
        '========================EDIT STUDENT CONTACTS======================='
      );
      console.log('LOGIN ORIGIN', req.originalUrl);
      console.log('REQUEST PARAMETERS', req.body);
      console.log('USER AGENT', userAgent.data);
      console.log('HEADERS', req.headers);
      console.log('======================================================');

      const { id } = req.user;
      const data = req.body;
      const update = {};

      if (data.email) {
        update.email = trim(data.email);
      }

      if (data.phone) {
        update.phone = trim(data.phone);
      }

      update.updated_at = moment.now();

      await model.sequelize.transaction(async (transaction) => {
        await studentService.updateStudentWithTransaction(
          id,
          update,
          transaction
        );
      });

      http.setSuccess(200, 'Contact details updated successfully.');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Error while updating your contact details.', {
        error: error.message,
      });

      return http.send(res);
    }
  }

  /**
   * Destroy Student token
   *
   * @param {Object} req Http Request Body
   * @param {Object} res Http Response
   *
   * @returns {JSON} Return Json Response
   */
  async logout(req, res) {
    const student = req.user;

    try {
      await studentService.updateStudentCredentials(student.id, {
        remember_token: null,
      });
      http.setSuccess(200, 'You have been logged out');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to log you out.', { error: error.message });

      return http.send(res);
    }
  }
}

/**
 *
 * @param {*} data
 * @param {*} transaction
 * @returns
 */
const insertNewStudent = async function (req, data, transaction) {
  try {
    const saltRounds = parseInt(appConfig.PASSWORD_SALT_ROUNDS, 10);
    const salt = await bcrypt.genSalt(saltRounds);

    data.password = await bcrypt.hashSync(data.student_number, salt);

    const std = await studentService
      .createStudent(data, transaction)
      .then((res) => {
        return res;
      });

    if (std[1] === true) {
      const studentId = std[0].dataValues.id;

      data.programmes.student_id = studentId;

      const prog = await studentService.createStudentProgramme(
        data.programmes,
        transaction
      );

      if (prog[1] === false) {
        throw new Error(
          `Found Record With Similar student number ${data.student_number} or registration number ${data.registration_number} for student: ${data.surname} ${data.other_names}.`
        );
      }

      std[0].dataValues.studentProgramme = prog[0];
    } else {
      throw new Error(
        `Similar Record: ${std[0].dataValues.email}, ${std[0].dataValues.phone} is blocking Student: ${data.surname} ${data.other_names}: ${data.email} ${data.phone}`
      );
    }

    await studentMgtActivityLogService.create(
      {
        ip_address: req.ip,
        user_agent: userAgent.data,
        activity_name: 'CREATE',
        activity_description: 'CREATE NEW STUDENT RECORD',
        table_name: 'students',
        new_properties: std[0],
        staff_id: data.created_by_id,
        student_id: std[0].id,
      },
      transaction
    );

    return std[0];
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} data
 * @param {*} transaction
 * @returns
 */
const verifyDuplicatesStudent = async function (data) {
  try {
    const duplicateRecord = {
      student_record: `${data.surname} ${data.other_names}.`,
      duplicate_email_or_phone: null,
      duplicate_student_no_or_registration_no: null,
    };

    const findStudent = await studentService
      .findDuplicateStudentRecord(data)
      .then((res) => {
        return res;
      });

    const findStudentProgramme = await studentService
      .findDuplicateStudentProgrammeRecord(data)
      .then((res) => {
        return res;
      });

    if (findStudent) {
      duplicateRecord.duplicate_email_or_phone = `Email: ${findStudent.email} or Phone Number: ${findStudent.phone}.`;
    }

    if (findStudentProgramme) {
      duplicateRecord.duplicate_student_no_or_registration_no = `Student Number: ${data.student_number} or Registration Number: ${data.registration_number}.`;
    }

    return duplicateRecord;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} data
 * @param {*} transaction
 * @returns
 */
const updateStudentWithTemplate = async (
  req,
  data,
  academicRecordsData,
  academicStatusData,
  transaction
) => {
  try {
    const findStudent = await studentService
      .findDuplicateStudentRecord(data)
      .then((res) => {
        return res;
      });

    if (findStudent) {
      if (parseInt(findStudent.id, 10) !== parseInt(data.student_id, 10)) {
        throw new Error(
          `Found A Similar Email: ${findStudent.email} or Phone Number: ${findStudent.phone} belonging to ${findStudent.surname} ${findStudent.other_names} On Record ${data.studentNameForErrorMsg}`
        );
      }
    }

    if (!isEmpty(academicStatusData)) {
      await studentService.createAcademicStatus(
        academicStatusData,
        transaction
      );
    }

    if (!isEmpty(academicRecordsData)) {
      await studentService.updateStudentProgramme(
        academicRecordsData.student_programme_id,
        academicRecordsData,
        transaction
      );
    }

    const result = await studentService.updateStudentWithTransaction(
      data.student_id,
      data,
      transaction
    );

    const student = result[1][0];

    await studentMgtActivityLogService.create(
      {
        ip_address: req.ip,
        user_agent: userAgent.data,
        activity_name: 'UPDATE',
        activity_description: 'UPDATE STUDENT RECORD',
        table_name: 'students',
        new_properties: student,
        staff_id: data.last_updated_by_id,
        student_id: student.id,
      },
      transaction
    );

    return student;
  } catch (error) {
    throw new Error(error.message);
  }
};

const removeDuplicates = function (arrayOfItems) {
  const unique = {};

  arrayOfItems.forEach(function (i) {
    if (!unique[i]) {
      unique[i] = true;
    }
  });

  return Object.keys(unique);
};

/**
 *
 * @param {*} username
 * @param {*} requestOrigin
 * @param {*} purpose
 * @returns
 */
const passwordGenerator = async (
  req,
  username,
  requestOrigin,
  purpose,
  causerId
) => {
  try {
    const expiresAt = moment()
      .add(appConfig.PASSWORD_EXPIRES_IN, 'minutes')
      .utc(true);

    const userByRegNoOrStudentNo =
      await studentService.findStudentByRegistrationOrStudentNumber(
        {
          student: username,
        },
        req
      );

    if (isEmpty(userByRegNoOrStudentNo)) {
      throw new Error(`Invalid username provided.`);
    }

    const findValidOTP = await OTPCodeService.getOTPCode({
      where: {
        username: username,
        is_used: false,
        request_origin: requestOrigin,
        purpose,
        expires_at: {
          [Op.gte]: moment.now(),
        },
      },
      raw: true,
    });

    let randomPassword = Math.floor(100000 + Math.random() * 900000).toString();

    if (!findValidOTP) {
      await model.sequelize.transaction(async (transaction) => {
        // Save generated OTP to password reset codes table;
        const studentOTP = await OTPCodeService.createOTPCode(
          {
            username,
            otp_code: randomPassword,
            request_origin: requestOrigin,
            purpose,
            expires_at: expiresAt,
            is_used: false,
          },
          transaction
        );

        await studentMgtActivityLogService.create(
          {
            ip_address: req.ip,
            user_agent: userAgent.data,
            activity_name: 'CREATE',
            activity_description: 'GENERATED OTP FOR STUDENT',
            table_name: 'otp_codes',
            new_properties: studentOTP,
            origin: requestOrigin,
            staff_id: causerId,
          },
          transaction
        );
      });
    } else {
      randomPassword = findValidOTP.otp_code;
    }

    return { random_password: randomPassword, ...userByRegNoOrStudentNo };
  } catch (error) {
    throw new Error(error.message);
  }
};

const passwordHasher = async (key) => {
  try {
    const saltRounds = parseInt(appConfig.PASSWORD_SALT_ROUNDS, 10);
    const salt = await bcrypt.genSalt(saltRounds);

    const hashedPassword = await bcrypt.hashSync(key, salt);

    return hashedPassword;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = StudentController;
