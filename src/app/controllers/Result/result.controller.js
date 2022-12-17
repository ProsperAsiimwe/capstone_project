const { HttpResponse } = require('@helpers');
// const { Op } = require('sequelize');
const UserAgent = require('user-agents');
const {
  resultService,
  metadataService,
  metadataValueService,
  programmeService,
  // programmeVersionService,
  courseUnitService,
  programmeVersionCourseUnitService,
  resultAllocationNodeService,
  resultBatchesService,
  studentService,
  twoFactorAuthService,
  logService,
} = require('@services/index');
const {
  toUpper,
  trim,
  now,
  isEmpty,
  uniqBy,
  isArray,
  toString,
  split,
  map,
  includes,
  flatten,
  uniq,
} = require('lodash');
const model = require('@models');
const moment = require('moment');
const XLSX = require('xlsx');
const formidable = require('formidable');
const excelJs = require('exceljs');
const uuid = require('uuid');
const fs = require('fs');
const {
  bulkUploadTemplateColumns,
  studentAssessmentTemplateColumns,
  resultsViewTemplateColumns,
  dissertationTemplateColumns,
} = require('./templateColumns');
const { getMetadataValues } = require('@controllers/Helpers/programmeHelper');

const {
  handleDirectMarksUpload,
  handleAcademicAssessmentUpload,
  findGradingValueId,
  evaluateStudentMarks,
} = require('@controllers/Helpers/resultHelper');
const {
  validateSheetColumns,
  validateSheetColumns2,
} = require('@controllers/Helpers/uploadValidator');
const {
  handleRecreatingResultComputations,
} = require('../Helpers/resultBatchesHelper');

const { activityLog, findLocalIpAddress } = require('../Helpers/logsHelper');
const StudentProgrammeDissertationService = require('@services/StudentRecords/studentProgrammeDissertation.service');

const http = new HttpResponse();

const userAgent = new UserAgent();

const iPv4 = findLocalIpAddress();

class ResultController {
  /**
   * GET All Results.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async index(req, res) {
    try {
      const result = await resultService.findAllResults({
        ...getResultAttributes(),
      });

      http.setSuccess(200, 'Results Fetched Successfully.', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Results.', {
        error: error.message,
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
  async loggedInUserLogs(req, res) {
    try {
      const result = await logService
        .findAllResultLogs({
          where: {
            user_id: req.user.id,
          },
          order: [['created_at', 'DESC']],
          attributes: {
            exclude: ['user_agent', 'token'],
          },
          include: [
            {
              association: 'user',
              attributes: ['id', 'surname', 'other_names'],
            },
          ],
        })
        .then((res) => {
          if (res) {
            return res.map((item) => item.get({ plain: true }));
          }
        });

      http.setSuccess(200, 'My Logs Fetched Successfully.', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch My Logs.', {
        error: error.message,
      });

      return http.send(res);
    }
  }

  async uploadDissertationTemplate(req, res, next) {
    try {
      const { id: userId } = req.user;

      const form = new formidable.IncomingForm();
      const batchNumber = toUpper(
        `${split(uuid.v4().toUpperCase(), '-').join('')}`
      );

      await form.parse(req, async (err, fields, files) => {
        const dissertations = [];

        if (err) {
          http.setError(400, 'Unable To Upload Records.', {
            error: { err },
          });

          return http.send(res);
        }

        const file = files[Object.keys(files)[0]];

        const workbook = XLSX.readFile(file.filepath, {
          cellDates: true,
        });
        const dissertationSheet = workbook.SheetNames[0];

        const allTemplateRecords = XLSX.utils.sheet_to_json(
          workbook.Sheets[dissertationSheet]
        );

        for (const studentRecord of allTemplateRecords) {
          const studentIdentity = toString(
            studentRecord['REGISTRATION NUMBER'] ||
              studentRecord['STUDENT NUMBER']
          );

          const title = studentRecord['DISSERTATION TITLE'];
          const description = studentRecord['DISSERTATION REMARK'];

          if (!studentIdentity) {
            http.setError(400, 'Invalid token provided.', {
              error:
                'Provide a REGISTRATION NUMBER or STUDENT NUMBER for all the rows',
            });

            return http.send(res);
          }

          validateSheetColumns2(
            studentRecord,
            ['DISSERTATION TITLE', 'DISSERTATION REMARK'],
            http,
            res,
            studentIdentity
          );

          const findStudentProg = await studentService.findByRegNoOrStudentNo(
            studentIdentity,
            {
              attributes: ['id'],
              include: {
                association: 'programme',
                attributes: ['id', 'programme_title', 'has_dissertation'],
              },
            }
          );

          if (!findStudentProg) {
            http.setError(400, 'Invalid token provided.', {
              error: `INVALID STUDENT NUMBER OR REG. NUMBER ${studentIdentity}`,
            });

            return http.send(res);
          } else if (findStudentProg['programme.has_dissertation'] !== true) {
            http.setError(400, 'Invalid token provided.', {
              error: `THE PROGRAMME ${findStudentProg['programme.programme_title']} FOR ${studentIdentity} IS NOT DEFINED TO HAVE DISSERTATION IN THE CURRICULUM`,
            });

            return http.send(res);
          }

          dissertations.push({
            title,
            description,
            created_by_id: userId,
            student_programme_id: findStudentProg.id,
            batch_number: batchNumber,
          });
        }

        await StudentProgrammeDissertationService.bulkCreate(dissertations);

        http.setSuccess(200, 'Data uploaded.', {});

        return http.send(res);
      });
    } catch (error) {
      http.setError(400, 'Unable To Upload This Template.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  async roundOffResults(req, res, next) {
    try {
      const { id: userId } = req.user;
      const { programme_codes: programmeCodes } = req.body;

      if (!programmeCodes && !isArray(programmeCodes))
        throw new Error('Please provide valid Programme Codes');

      const updatedProgrammes = [];

      await model.sequelize.transaction(async (transaction) => {
        for (const programmeCode of programmeCodes) {
          const programmeResults = await resultService.getProgrammeResults(
            programmeCode
          );

          if (!isEmpty(programmeResults)) {
            updatedProgrammes.push(programmeCode);

            const roundedOffResults = map(programmeResults, (result) => {
              const courseWork = Math.round(result.course_work);
              const examMark = Math.round(result.final_exam);

              return {
                ...result,
                courseWork: courseWork,
                examMark: examMark,
                final_mark: courseWork + examMark,
              };
            });

            await resultService.bulkCreateResult(
              roundedOffResults,
              transaction
            );
          }
        }

        if (isEmpty(updatedProgrammes))
          throw new Error(
            'No (Un-rounded) results found for the programme codes provided'
          );

        await activityLog(
          'createResultLog',
          userId,
          'UPDATE',
          'STUDENT RESULTS',
          `ROUND OFF STUDENT RESULTS for ${updatedProgrammes.join(', ')}`,
          `N/A`,
          null,
          `result`,
          `iPv4-${iPv4}, hostIp-${req.ip}`,
          userAgent.data,
          null,
          transaction
        );
      });

      http.setSuccess(200, 'Results rounded-off successfully', {});

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To round off results', {
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
  async uploadDirectMarksUploadTemplate(req, res) {
    try {
      const { otp, operation } = req.params;

      const data = req.body;
      const { id: user, remember_token: rememberToken } = req.user;

      data.created_by_id = user;

      const form = new formidable.IncomingForm();

      // const date = moment.utc().format();
      // const local = moment.utc(date).local().format();
      // const rightNow = moment(local).utc(true);

      const response = [];

      const find2FA = await twoFactorAuthService.findOneTwoFactorAuth({
        where: {
          otp,
          user_id: user,
          remember_token: rememberToken,
          operation: trim(operation),
          // expiry_date: {
          //   [Op.gte]: moment.utc(rightNow).format('MMMM Do YYYY, h:mm:ss a'),
          // },
        },
        raw: true,
      });

      if (find2FA) {
        form.parse(req, async (err, fields, files) => {
          if (err) {
            http.setError(400, 'Unable To Upload Records.', {
              error: { err },
            });

            return http.send(res);
          }

          const file = files[Object.keys(files)[0]];

          if (!file) {
            http.setError(400, 'Please Select A File To Upload.');

            return http.send(res);
          }
          const workbook = XLSX.readFile(file.filepath, {
            cellDates: true,
          });
          const myTemplate = workbook.SheetNames[0];
          const allTemplateRecords = XLSX.utils.sheet_to_json(
            workbook.Sheets[myTemplate]
          );

          if (isEmpty(allTemplateRecords)) {
            http.setError(
              400,
              'Cannot upload an empty Template, please populate the template'
            );

            return http.send(res);
          }

          const codesToUpload = uniq(
            map(allTemplateRecords, (record) => trim(record['COURSE CODE']))
          );

          const metadataValues =
            await metadataValueService.findAllMetadataValues({
              include: {
                association: 'metadata',
                attributes: ['id', 'metadata_name', 'metadata_description'],
              },
            });

          const courseUnits = await courseUnitService.findAllCourseUnits({
            attributes: ['id', 'course_unit_code', 'course_unit_name'],
            raw: true,
            where: {
              course_unit_code: codesToUpload,
            },
          });

          if (isEmpty(courseUnits)) {
            http.setError(
              400,
              'Provide Valid Course CODES, None of your course codes exists in the curriculum.',
              {
                error: { err },
              }
            );

            return http.send(res);
          }

          const versionCourseUnits =
            await programmeVersionCourseUnitService.filterVersionCourseUnits(
              codesToUpload.join(`','`)
            );

          try {
            const random = Math.floor(Math.random() * moment().unix());
            const generatedBatchNumber = `BATCH${random}`;

            data.batch = {
              uploaded_by_id: user,
              batch_number: generatedBatchNumber,
            };

            let uploaded = 0;
            const notFoundStudents = [];

            await model.sequelize.transaction(async (transaction) => {
              for (const result of allTemplateRecords) {
                if (
                  !trim(result['REGISTRATION NUMBER']) &&
                  !trim(result['STUDENT NUMBER'])
                ) {
                  throw new Error(
                    `PROVIDE EITHER REGISTRATION NUMBER OR STUDENT NUMBER.`
                  );
                }

                const regOrStudentNo =
                  trim(result['REGISTRATION NUMBER']) ||
                  trim(result['STUDENT NUMBER']);

                validateSheetColumns(
                  result,
                  [
                    'REGISTRATION NUMBER|STUDENT NUMBER',
                    'COURSE CODE',
                    'FINAL MARK',
                    'ACADEMIC YEAR',
                    'SEMESTER',
                    'STUDY YEAR',
                    'IS FIRST SITTING ?',
                  ],
                  regOrStudentNo
                );

                const studentProgramme =
                  await studentService.getResultActiveStudentProgrammeDetails(
                    toUpper(regOrStudentNo)
                  );

                if (studentProgramme) {
                  const studentRegistrationNumber =
                    studentProgramme.registration_number;

                  if (
                    studentProgramme.on_provisional_list === true ||
                    studentProgramme.on_graduation_list === true
                  ) {
                    throw new Error(
                      `Please Student: ${studentRegistrationNumber} has already been added to the Provisional/Graduation List`
                    );
                  }

                  if (toUpper(trim(result['IS FIRST SITTING ?'])) === 'NO') {
                    if (!result['RETAKE COUNT']) {
                      throw new Error(
                        `Please provide a RETAKE COUNT for registration number: ${studentRegistrationNumber}`
                      );
                    }

                    data.retake_count = parseInt(result['RETAKE COUNT'], 10);

                    if (data.retake_count < 1) {
                      throw new Error(
                        `Please provide a RETAKE COUNT which has a value greater than 0 for registration number: ${studentRegistrationNumber}`
                      );
                    }
                  } else if (
                    toUpper(trim(result['IS FIRST SITTING ?'])) === 'YES'
                  ) {
                    if (result['RETAKE COUNT']) {
                      throw new Error(
                        `Please leave RETAKE COUNT column empty for registration number: ${studentRegistrationNumber}`
                      );
                    }

                    data.retake_count = null;
                  } else {
                    throw new Error(
                      `Please Select Yes Or No For column (IS FIRST SITTING ?) of student: ${studentRegistrationNumber}`
                    );
                  }

                  data.is_audited_course = false;

                  const isAudited = trim(result['IS AUDITED COURSE?']);

                  if (isAudited) {
                    data.is_audited_course = isAudited.toUpperCase() === 'YES';
                  }

                  data.is_first_sitting =
                    toUpper(trim(result['IS FIRST SITTING ?'])) === 'YES';
                  data.is_incomplete_result =
                    toUpper(trim(result['IS INCOMPLETE MARK?'])) === 'YES';

                  const helper = await handleDirectMarksUpload(
                    data,
                    result,
                    studentProgramme,
                    courseUnits,
                    versionCourseUnits,
                    metadataValues,
                    regOrStudentNo,
                    transaction
                  );

                  await activityLog(
                    'createResultLog',
                    user,
                    'UPLOAD',
                    'DIRECT MARKS UPLOAD TEMPLATE',
                    `Uploaded results of registration number: ${studentRegistrationNumber} with Course Work Mark: ${
                      result['COURSE WORK MARK']
                        ? result['COURSE WORK MARK']
                        : ''
                    }, Final Exam Mark: ${
                      result['FINAL EXAM MARK'] ? result['FINAL EXAM MARK'] : ''
                    } and Final Mark: ${
                      result['FINAL MARK'] ? result['FINAL MARK'] : ''
                    } on batch number: ${generatedBatchNumber}.`,
                    `N/A`,
                    helper.dataValues.id,
                    `result`,
                    `iPv4-${iPv4}, hostIp-${req.ip}`,
                    userAgent.data,
                    data.otp,
                    transaction
                  );

                  response.push(helper);
                  uploaded += 1;
                } else {
                  notFoundStudents.push(
                    result['REGISTRATION NUMBER'] || result['STUDENT NUMBER']
                  );
                }
              }

              // await twoFactorAuthService.updateTwoFactorAuth(
              //   find2FA.id,
              //   {
              //     is_used: true,
              //   },
              //   transaction
              // );
            });

            http.setSuccess(
              200,
              `Successfully UPLOADED: ${uploaded} Records and SKIPPED: ${
                notFoundStudents.length
              } NOT FOUND Records. [${notFoundStudents.join(', ')}]`,
              {
                data: response,
              }
            );

            return http.send(res);
          } catch (error) {
            http.setError(400, 'Unable to upload marks.', {
              error: { message: error.message },
            });

            return http.send(res);
          }
        });
      } else {
        throw new Error(
          `Please Provide A Valid TOKEN Sent To Your Phone/Email In order To Complete This Action.`
        );
      }
    } catch (error) {
      http.setError(400, 'Unable To Upload This Template.', {
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
  async uploadStudentAcademicAssessmentTemplate(req, res) {
    try {
      const { otp, operation } = req.params;
      const { id: user, remember_token: rememberToken } = req.user;

      const data = req.body;

      data.created_by_id = user;

      const form = new formidable.IncomingForm();

      const response = [];

      // const date = moment.utc().format();
      // const local = moment.utc(date).local().format();
      // const rightNow = moment(local).utc(true);

      const find2FA = await twoFactorAuthService.findOneTwoFactorAuth({
        where: {
          otp,
          user_id: user,
          remember_token: rememberToken,
          operation: trim(operation),
          // expiry_date: {
          //   [Op.gte]: moment.utc(rightNow).format('MMMM Do YYYY, h:mm:ss a'),
          // },
        },
        raw: true,
      });

      if (find2FA) {
        form.parse(req, async (err, fields, files) => {
          if (err) {
            http.setError(400, 'Unable To Upload Records.', {
              error: { err },
            });

            return http.send(res);
          }

          const file = files[Object.keys(files)[0]];

          if (!file) {
            http.setError(400, 'Please Select A File To Upload.');

            return http.send(res);
          }
          const workbook = XLSX.readFile(file.filepath, {
            cellDates: true,
          });
          const myTemplate = workbook.SheetNames[0];
          const allTemplateRecords = XLSX.utils.sheet_to_json(
            workbook.Sheets[myTemplate]
          );

          if (isEmpty(allTemplateRecords)) {
            http.setError(
              400,
              'Cannot upload an empty Template, please populate the template'
            );

            return http.send(res);
          }

          const metadataValues =
            await metadataValueService.findAllMetadataValues({
              include: ['metadata'],
            });

          try {
            await model.sequelize.transaction(async (transaction) => {
              for (const result of allTemplateRecords) {
                if (!result['REGISTRATION NUMBER']) {
                  throw new Error(
                    `One Of The Records Provided Has No REGISTRATION NUMBER.`
                  );
                }

                const student = trim(result['REGISTRATION NUMBER']);

                const studentProgramme =
                  await studentService.getResultActiveStudentProgrammeDetails(
                    toUpper(student)
                  );

                validateSheetColumns(
                  result,
                  [
                    'REGISTRATION NUMBER',
                    'PROGRAMME CODE',
                    'ACADEMIC YEAR',
                    'SEMESTER',
                    'STUDY YEAR',
                    'GPA',
                  ],
                  student
                );

                const helper = await handleAcademicAssessmentUpload(
                  data,
                  result,
                  metadataValues,
                  studentProgramme,
                  student,
                  transaction
                );

                await activityLog(
                  'createResultLog',
                  user,
                  'UPLOAD',
                  'ACADEMIC ASSESSMENT UPLOAD TEMPLATE',
                  `Uploaded Academic Assessment of registration number: ${student} for Programme Code: ${result['PROGRAMME CODE']} 
                  in Academic Year: ${result['ACADEMIC YEAR']}, Semester: ${result.SEMESTER}, Study Year: ${result['STUDY YEAR']}
                  With Values of GPA=${result.GPA}, CGPA=${result.CGPA}, TCU=${result.TCU}, CTCU=${result.CTCU}, TWS=${result.TWS}, CTWS=${result.CTWS}, PASS-MARK:${studentProgramme.pass_mark}`,
                  `N/A`,
                  helper.dataValues.id,
                  `semesterResult`,
                  `iPv4-${iPv4}, hostIp-${req.ip}`,
                  userAgent.data,
                  data.otp,
                  transaction
                );

                response.push(helper);
              }

              // await twoFactorAuthService.updateTwoFactorAuth(
              //   find2FA.id,
              //   {
              //     is_used: true,
              //   },
              //   transaction
              // );
            });
            http.setSuccess(
              200,
              'Student Academic Assessment Uploaded successfully.',
              {
                data: response,
              }
            );

            return http.send(res);
          } catch (error) {
            http.setError(
              400,
              'Unable To Upload Student Academic Assessment.',
              {
                error: { message: error.message },
              }
            );

            return http.send(res);
          }
        });
      } else {
        throw new Error(
          `Please Provide A Valid TOKEN Sent To Your Phone/Email In order To Complete This Action.`
        );
      }
    } catch (error) {
      http.setError(400, 'Unable To Upload This Template.', {
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
  async downloadDirectMarksUploadTemplate(req, res) {
    try {
      const { id, surname, other_names: otherNames } = req.user;

      const workbook = new excelJs.Workbook();

      const createMarksUploadSheet = workbook.addWorksheet('MARKS UPLOAD');
      const academicYearsSheet = workbook.addWorksheet('Sheet2');
      const studyYearsSheet = workbook.addWorksheet('Sheet3');
      const semestersSheet = workbook.addWorksheet('Sheet4');

      const metadata = await metadataService.findAllMetadata({
        attributes: ['metadata_name'],
        include: [
          { association: 'metadataValues', attributes: ['metadata_value'] },
        ],
        raw: true,
        nest: true,
      });

      const resultRemarks = getMetadataValues(metadata, 'RESULT REMARKS');

      const hasConcededPass = includes(flatten(resultRemarks), 'CP');

      if (hasConcededPass === true) {
        bulkUploadTemplateColumns.push({
          // N
          header: 'IS CONCEDED PASS?',
          key: 'conceded_pass',
          width: 25,
        });
      }

      createMarksUploadSheet.properties.defaultColWidth =
        bulkUploadTemplateColumns.length;
      createMarksUploadSheet.columns = bulkUploadTemplateColumns;

      academicYearsSheet.state = 'veryHidden';
      studyYearsSheet.state = 'veryHidden';
      semestersSheet.state = 'veryHidden';

      academicYearsSheet.addRows(getMetadataValues(metadata, 'ACADEMIC YEARS'));
      studyYearsSheet.addRows(getMetadataValues(metadata, 'STUDY YEARS'));
      semestersSheet.addRows(getMetadataValues(metadata, 'SEMESTERS'));

      // Column Validations
      createMarksUploadSheet.dataValidations.add('D2:D1000', {
        type: 'list',
        allowBlank: false,
        formulae: ['=Sheet2!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid value from the list',
      });

      createMarksUploadSheet.dataValidations.add('E2:E1000', {
        type: 'list',
        allowBlank: false,
        formulae: ['=Sheet3!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid value from the list',
      });

      createMarksUploadSheet.dataValidations.add('F2:F1000', {
        type: 'list',
        allowBlank: false,
        formulae: ['=Sheet4!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid value from the list',
      });

      createMarksUploadSheet.dataValidations.add('G2:G1000', {
        type: 'decimal',
        operator: 'between',
        formulae: [0, 100],
        allowBlank: true,
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: `The value must be a number between 0 and 100`,
        prompt: `The value must be a number between 0 and 100`,
      });

      createMarksUploadSheet.dataValidations.add('H2:H1000', {
        type: 'decimal',
        operator: 'between',
        formulae: [0, 100],
        allowBlank: true,
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: `The value must be a number between 0 and 100`,
        prompt: `The value must be a number between 0 and 100`,
      });

      createMarksUploadSheet.dataValidations.add('I2:I1000', {
        type: 'decimal',
        operator: 'between',
        formulae: [0, 100],
        allowBlank: true,
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: `The value must be a number between 0 and 100`,
        prompt: `The value must be a number between 0 and 100`,
      });

      createMarksUploadSheet.dataValidations.add('J2:J1000', {
        type: 'list',
        allowBlank: false,
        formulae: ['"YES, NO"'],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid value from the list',
      });

      createMarksUploadSheet.dataValidations.add('K2:K1000', {
        type: 'decimal',
        operator: 'between',
        formulae: [0, 100],
        allowBlank: true,
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: `The value must be a number between 0 and 100`,
        prompt: `The value must be a number between 0 and 100`,
      });

      createMarksUploadSheet.dataValidations.add('L2:M1000', {
        type: 'list',
        allowBlank: false,
        formulae: ['"YES, NO"'],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid value from the list',
      });

      if (hasConcededPass === true) {
        createMarksUploadSheet.dataValidations.add('M2:N1000', {
          type: 'list',
          allowBlank: false,
          formulae: ['"YES, NO"'],
          showErrorMessage: true,
          errorStyle: 'error',
          error: 'Please select a valid value from the list',
        });
      }

      const uploadPath = `${process.cwd()}/src/assets/documents/templates`;

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true }, (err) => {
          throw new Error(err.message);
        });
      }

      const template = `${uploadPath}/download-direct-marks-upload-template-${surname}-${otherNames}-${id}-${now()}.xlsm`;

      await workbook.xlsx.writeFile(template);
      await res.download(
        template,
        'DIRECT-MARKS-UPLOAD-TEMPLATE.xlsx',
        (error) => {
          if (error) {
            throw new Error(error.message);
          }
        }
      );
    } catch (error) {
      http.setError(400, 'Unable To Download This Template.', {
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
  async downloadStudentAssessmentTemplate(req, res) {
    try {
      const { user } = req;

      const workbook = new excelJs.Workbook();

      const createStudentAssessmentSheet = workbook.addWorksheet(
        'ACADEMIC ASSESSMENT'
      );
      const academicYearsSheet = workbook.addWorksheet('academicYearSheet');
      const studyYearsSheet = workbook.addWorksheet('studyYearSheet');
      const semestersSheet = workbook.addWorksheet('semesterSheet');

      createStudentAssessmentSheet.properties.defaultColWidth =
        studentAssessmentTemplateColumns.length;

      createStudentAssessmentSheet.columns = studentAssessmentTemplateColumns;

      academicYearsSheet.state = 'veryHidden';
      studyYearsSheet.state = 'veryHidden';
      semestersSheet.state = 'veryHidden';

      const metadata = await metadataService.findAllMetadata({
        attributes: ['metadata_name'],
        include: [
          { association: 'metadataValues', attributes: ['metadata_value'] },
        ],
        raw: true,
        nest: true,
      });

      academicYearsSheet.addRows(getMetadataValues(metadata, 'ACADEMIC YEARS'));
      studyYearsSheet.addRows(getMetadataValues(metadata, 'STUDY YEARS'));
      semestersSheet.addRows(getMetadataValues(metadata, 'SEMESTERS'));

      // Column Validations
      createStudentAssessmentSheet.dataValidations.add('C2:C1000', {
        type: 'list',
        allowBlank: false,
        formulae: ['=academicYearSheet!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid value from the list',
      });

      createStudentAssessmentSheet.dataValidations.add('D2:D1000', {
        type: 'list',
        allowBlank: false,
        formulae: ['=studyYearSheet!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid value from the list',
      });

      createStudentAssessmentSheet.dataValidations.add('E2:E1000', {
        type: 'list',
        allowBlank: false,
        formulae: ['=semesterSheet!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid value from the list',
      });

      createStudentAssessmentSheet.dataValidations.add('F2:F1000', {
        type: 'decimal',
        operator: 'between',
        formulae: [0, 100],
        allowBlank: true,
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: `The value must be a number between 0 and 100`,
        prompt: `The value must be a number between 0 and 100`,
      });

      createStudentAssessmentSheet.dataValidations.add('G2:G1000', {
        type: 'decimal',
        operator: 'between',
        formulae: [0, 100],
        allowBlank: true,
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: `The value must be a number between 0 and 100`,
        prompt: `The value must be a number between 0 and 100`,
      });

      createStudentAssessmentSheet.dataValidations.add('H2:H1000', {
        type: 'decimal',
        operator: 'between',
        formulae: [0, 100],
        allowBlank: true,
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: `The value must be a number between 0 and 100`,
        prompt: `The value must be a number between 0 and 100`,
      });

      createStudentAssessmentSheet.dataValidations.add('I2:I1000', {
        type: 'decimal',
        operator: 'between',
        formulae: [0, 100],
        allowBlank: true,
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: `The value must be a number between 0 and 100`,
        prompt: `The value must be a number between 0 and 100`,
      });

      createStudentAssessmentSheet.dataValidations.add('J2:J1000', {
        type: 'decimal',
        operator: 'between',
        formulae: [0, 100],
        allowBlank: true,
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: `The value must be a number between 0 and 100`,
        prompt: `The value must be a number between 0 and 100`,
      });

      createStudentAssessmentSheet.dataValidations.add('K2:K1000', {
        type: 'decimal',
        operator: 'between',
        formulae: [0, 100],
        allowBlank: true,
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: `The value must be a number between 0 and 100`,
        prompt: `The value must be a number between 0 and 100`,
      });

      const uploadPath = `${process.cwd()}/src/assets/documents/templates`;

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true }, (err) => {
          throw new Error(err.message);
        });
      }

      const template = `${uploadPath}/download-student-academic-assessment-template-${
        user.surname
      }-${user.other_names}-${user.id}-${now()}.xlsm`;

      await workbook.xlsx.writeFile(template);
      await res.download(
        template,
        'STUDENT-ACADEMIC-ASSESSMENT-TEMPLATE.xlsx',
        (error) => {
          if (error) {
            throw new Error(error.message);
          }
        }
      );
    } catch (error) {
      http.setError(400, 'Unable To Download This Template.', {
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
  async downloadResultsViewTemplate(req, res) {
    try {
      const { user } = req;

      if (
        !req.query.academic_year_id &&
        !req.query.campus_id &&
        !req.query.intake_id &&
        !req.query.study_year_id &&
        !req.query.semester_id &&
        !req.query.programme_id
      ) {
        throw new Error('Invalid Context Provided');
      }
      const context = req.query;

      const programme = await programmeService.findOneProgramme({
        where: {
          id: context.programme_id,
        },
        attributes: ['id', 'programme_code', 'programme_title'],
        raw: true,
      });

      if (!programme) {
        throw new Error(`Unable To Find Programme.`);
      }

      const workbook = new excelJs.Workbook();

      const createResultsViewSheet = workbook.addWorksheet('RESULTS VIEW');

      const students = await resultAllocationNodeService.resultViewFunction(
        context
      );

      if (isEmpty(students)) {
        throw new Error(`This Context Has No Students.`);
      }

      const allCourseResults = [];

      students.forEach((std) => {
        std.course_results.forEach((result) => {
          allCourseResults.push(result);
        });
      });

      const uniqueCourseResults = uniqBy(allCourseResults, 'id');

      uniqueCourseResults.forEach((result) => {
        const newColumns = [
          {
            header: `${result.course_unit_code} (CW)`,
            key: `cw-${result.course_unit_code}`,
            width: 20,
            style: { alignment: { horizontal: 'left' } },
          },
          {
            header: `${result.course_unit_code} (EX)`,
            key: `ex-${result.course_unit_code}`,
            width: 20,
            style: { alignment: { horizontal: 'left' } },
          },
          {
            header: `${result.course_unit_code} (FM)`,
            key: `fm-${result.course_unit_code}`,
            width: 20,
            style: { alignment: { horizontal: 'left' } },
          },
          {
            header: `${result.course_unit_code} - REMARK`,
            key: `remark-${result.course_unit_code}`,
            width: 20,
            style: { alignment: { horizontal: 'left' } },
          },
          {
            header: `${result.course_unit_code} - GRADE`,
            key: `grade-${result.course_unit_code}`,
            width: 20,
            style: { alignment: { horizontal: 'left' } },
          },
          {
            header: `*END-${result.course_unit_code}*`,
            key: `space-${result.course_unit_code}`,
            width: 10,
            style: { alignment: { horizontal: 'left' } },
          },
        ];

        resultsViewTemplateColumns.push(...newColumns);
      });

      createResultsViewSheet.properties.defaultColWidth =
        resultsViewTemplateColumns.length;

      createResultsViewSheet.columns = removeDuplicateObjects(
        resultsViewTemplateColumns,
        (item) => item.header
      );

      students.forEach((student) => {
        student.course_results.forEach((stdResult) => {
          const checkValue = allCourseResults.find(
            (result) => parseInt(result.id, 10) === parseInt(stdResult, 10)
          );

          if (checkValue) {
            // createResultsViewSheet.addRow({
            //   student: `${toUpper(student.surname)} ${toUpper(student.other_names)}`,
            //   registration_number: student.registration_number,
            //   student_number: student.student_number,
            //   prog: programme.programme_code,
            //   programme_type: student.programme_type,
            // });
          }
        });
      });

      const uploadPath = `${process.cwd()}/src/assets/documents/templates`;

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true }, (err) => {
          throw new Error(err.message);
        });
      }

      const template = `${uploadPath}/results-view-${user.surname}-${
        user.other_names
      }-${user.id}-${now()}.xlsm`;

      await workbook.xlsx.writeFile(template);
      await res.download(
        template,
        `${toUpper(programme.programme_code)}-RESULTS-VIEW.xlsx`,
        (error) => {
          if (error) {
            throw new Error(error.message);
          }
        }
      );
    } catch (error) {
      http.setError(400, 'Unable To Download Results View.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * DOWNLOAD DISSERTATION TEMPLATE
   *
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async downloadDissertationTemplate(req, res) {
    try {
      const { user } = req;
      const workbook = new excelJs.Workbook();
      const dissertationSheet = workbook.addWorksheet('DISSERTATION');

      dissertationSheet.properties.defaultColWidth =
        dissertationTemplateColumns.length;

      dissertationSheet.columns = removeDuplicateObjects(
        dissertationTemplateColumns,
        (item) => item.header
      );

      const uploadPath = `${process.cwd()}/src/assets/documents/templates`;

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true }, (err) => {
          throw new Error(err.message);
        });
      }

      const template = `${uploadPath}/dissertation-${user.surname}-${
        user.other_names
      }-${user.id}-${now()}.xlsm`;

      await workbook.xlsx.writeFile(template);
      await res.download(template, `DISSERTATION.xlsx`, (error) => {
        if (error) {
          throw new Error(error.message);
        }
      });
    } catch (error) {
      http.setError(400, 'Unable To Download Dissertation template', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Get Specific Result Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async fetchResult(req, res) {
    try {
      const { id } = req.params;
      const result = await resultService.fetchResult({
        where: { id },
      });

      http.setSuccess(200, 'Result Fetched successfully.', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to fetch Result.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * UPDATE RESULTS
   *
   * @param {*} req
   * @param {*} res
   */
  async updateResult(req, res) {
    try {
      const { id } = req.params;

      let data = req.body;
      const { id: user, remember_token: rememberToken } = req.user;

      data.last_updated_by_id = user;

      let update = {};

      // const date = moment.utc().format();
      // const local = moment.utc(date).local().format();
      // const rightNow = moment(local).utc(true);

      const find2FA = await twoFactorAuthService.findOneTwoFactorAuth({
        where: {
          otp: trim(data.otp),
          user_id: user,
          remember_token: rememberToken,
          operation: trim(data.operation),
          // expiry_date: {
          //   [Op.gte]: moment.utc(rightNow).format('MMMM Do YYYY, h:mm:ss a'),
          // },
        },
        raw: true,
      });

      if (find2FA) {
        const findResult = await resultService
          .fetchResult({
            where: { id },
            include: [
              {
                association: 'studentProgramme',
                attributes: ['id', 'student_number', 'registration_number'],
              },
              {
                association: 'createdBy',
                attributes: ['id', 'surname', 'other_names'],
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

        if (!findResult) {
          throw new Error('Unable To Find Result Record Specified.');
        }

        if (
          findResult.studentProgramme.on_provisional_list ||
          findResult.studentProgramme.on_graduation_list
        ) {
          throw new Error(
            `Cannot Edit Results for this student because they are on the ${
              findResult.on_provisional_list ? 'Provisional' : 'Final'
            } Graduation list.`
          );
        }

        const getStudent =
          await studentService.getResultActiveStudentProgrammeDetails(
            findResult.studentProgramme.registration_number
          );

        if (!getStudent) throw new Error('This Student Programme is inactive');
        else if (getStudent.pass_mark === null)
          throw new Error(
            'No Pass mark policy has been defined for this students study level'
          );

        const versionCourseUnit =
          await programmeVersionCourseUnitService.findOneCourseUnit({
            where: {
              id: findResult.programme_version_course_unit_id,
            },
            attributes: [
              'id',
              'programme_version_id',
              'course_unit_id',
              'grading_id',
              'course_unit_semester_id',
              'course_unit_year_id',
            ],
            raw: true,
          });

        if (!versionCourseUnit) {
          throw new Error(
            `Unable To Locate The Course Unit Being Updated On The Record`
          );
        }

        data.grading_value_id = await findGradingValueId(
          versionCourseUnit.grading_id,
          data.final_mark,
          `This Student`
        );

        data.pass_mark = getStudent.pass_mark;

        if (parseFloat(data.final_mark) < parseFloat(getStudent.pass_mark)) {
          data.has_passed = false;
        } else {
          data.has_passed = true;
        }

        const courseWorkMark = data.course_work;
        const examMark = data.final_exam;
        const finalMark = parseFloat(data.final_mark);

        if (courseWorkMark && examMark) {
          const sumCWandEx = parseFloat(examMark) + parseFloat(courseWorkMark);

          if (sumCWandEx.toFixed(1) !== finalMark.toFixed(1)) {
            throw new Error(
              `Course Work Mark ${courseWorkMark} and Exam Mark ${examMark} (${sumCWandEx.toFixed(
                1
              )}) does not equal to the final Mark (${parseFloat(
                finalMark.toFixed(1)
              )}) for this result.`
            );
          } else {
            data.course_work = parseFloat(courseWorkMark).toFixed(1);
            data.final_exam = parseFloat(examMark).toFixed(1);
          }
        }

        const metadataValues = await metadataValueService.findAllMetadataValues(
          {
            include: {
              association: 'metadata',
              attributes: ['id', 'metadata_name', 'metadata_description'],
              where: {
                metadata_name: 'RESULT REMARKS',
              },
            },
          }
        );

        data.pass_mark = findResult.pass_mark;
        data.is_first_sitting = data.is_first_sitting
          ? data.is_first_sitting
          : findResult.is_first_sitting;

        data = await evaluateStudentMarks(
          data,
          metadataValues,
          data.is_conceded_pass,
          versionCourseUnit.grading_id,
          courseWorkMark,
          examMark,
          findResult.studentProgramme.registration_number
        );

        const context = {};

        context.student = findResult.student_programme_id;

        update = await model.sequelize.transaction(async (transaction) => {
          const response = await resultService.updateResult(
            id,
            data,
            transaction
          );

          const result = response[1][0];

          await handleRecreatingResultComputations(
            parseInt(findResult.student_programme_id, 10),
            transaction
          );

          await activityLog(
            'createResultLog',
            user,
            'UPDATE',
            'CHANGE OF STUDENT MARKS',
            `Updated Marks Of Student Number: ${
              findResult.studentProgramme.student_number
            }, Registration Number: ${
              findResult.studentProgramme.registration_number
            } Using OTP: ${find2FA.otp} With Values: Course Work: ${
              data.course_work ? data.course_work : 'NOT CHANGED'
            }, Final Exam: ${
              data.final_exam ? data.final_exam : 'NOT CHANGED'
            }, Final Mark: ${
              data.final_mark ? data.final_mark : 'NOT CHANGED'
            }`,
            `Course Work: ${findResult.course_work}, Final Exam: ${findResult.final_exam}, Final Mark: ${findResult.final_mark}`,
            id,
            `result`,
            `iPv4-${iPv4}, hostIp-${req.ip}`,
            userAgent.data,
            data.otp,
            transaction
          );

          // await twoFactorAuthService.updateTwoFactorAuth(
          //   find2FA.id,
          //   {
          //     is_used: true,
          //   },
          //   transaction
          // );

          return result;
        });
      } else {
        throw new Error(
          `Please Provide A Valid TOKEN Sent To Your Phone/Email In order To Complete This Action.`
        );
      }

      http.setSuccess(200, 'Result updated successfully', {
        data: update,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to update this Result.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * UPDATE RESULT ACADEMIC YEARS
   *
   * @param {*} req
   * @param {*} res
   */
  async updateResultAcademicYear(req, res) {
    try {
      const data = req.body;
      const { userId } = req.user;

      const payload = {
        last_updated_by_id: userId,
        academic_year_id: data.academic_year_id,
      };

      if (!isArray(data.result_context_ids))
        throw new Error('Invalid data for Results');

      await model.sequelize.transaction(async (transaction) => {
        for (const resultId of data.result_context_ids) {
          const findResult = await resultService.findOneResult({
            where: {
              id: resultId,
              student_programme_id: data.student_programme_id,
            },

            raw: true,
          });

          if (!findResult)
            throw new Error(
              'One of the Results is invalid or does not belong to this student'
            );

          await resultService.updateResult(resultId, payload, transaction);
        }

        await handleRecreatingResultComputations(
          parseInt(data.student_programme_id, 10),
          transaction
        );
      });

      http.setSuccess(200, 'Result Academic Year updated successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to update this Academic Year Result.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Destroy Data
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async deleteResult(req, res) {
    try {
      const { id } = req.params;
      const { id: user, remember_token: rememberToken } = req.user;
      const data = req.body;

      // const date = moment.utc().format();
      // const local = moment.utc(date).local().format();
      // const rightNow = moment(local).utc(true);

      const find2FA = await twoFactorAuthService.findOneTwoFactorAuth({
        where: {
          otp: trim(data.otp),
          user_id: user,
          remember_token: rememberToken,
          operation: trim(data.operation),
          // expiry_date: {
          //   [Op.gte]: moment.utc(rightNow).format('MMMM Do YYYY, h:mm:ss a'),
          // },
        },
        raw: true,
      });

      if (find2FA) {
        const findResult = await resultService
          .fetchResult({
            where: { id },
            include: [
              {
                association: 'studentProgramme',
                // attributes: ['id', 'programme_id'],
              },
              {
                association: 'createdBy',
                attributes: ['id', 'surname', 'other_names'],
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

        if (!findResult) {
          throw new Error('Unable To Find Result Record Specified.');
        }

        if (parseInt(user, 10) !== parseInt(findResult.created_by_id, 10)) {
          throw new Error(
            `You do not have the right to delete this result uploaded by ${findResult.createdBy.surname} ${findResult.createdBy.other_names}. Please ask the uploader to delete the record.`
          );
        }

        const findOneBatchResult = await resultBatchesService
          .findOneBatchResult({
            where: {
              result_id: findResult.id,
            },
            include: [
              {
                association: 'result',
                attributes: ['id', 'student_programme_id'],
              },
              {
                association: 'uploader',
                attributes: ['id', 'surname', 'other_names'],
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

        const deletedStudentProgrammeId = {};

        deletedStudentProgrammeId.student_programme_id =
          findResult.student_programme_id;

        await model.sequelize.transaction(async (transaction) => {
          if (findOneBatchResult) {
            if (
              parseInt(user, 10) !==
              parseInt(findOneBatchResult.uploaded_by_id, 10)
            ) {
              throw new Error(
                `You do not have the right to delete the batch record uploaded by ${findOneBatchResult.uploader.surname} ${findOneBatchResult.uploader.other_names}. Please ask the uploader to delete the record.`
              );
            }

            await resultBatchesService.deleteBatchResults(
              findOneBatchResult.id,
              transaction
            );
          }

          await activityLog(
            'createResultLog',
            user,
            'DELETE',
            'DELETING OF STUDENT MARKS',
            `Deleted Marks Of Student Number: ${findResult.studentProgramme.student_number}, Registration Number: ${findResult.studentProgramme.registration_number} Using OTP: ${find2FA.otp}`,
            `Course Work: ${findResult.course_work}, Final Exam: ${findResult.final_exam}, Final Mark: ${findResult.final_mark}`,
            id,
            `result`,
            `iPv4-${iPv4}, hostIp-${req.ip}`,
            userAgent.data,
            data.otp,
            transaction
          );

          // await twoFactorAuthService.updateTwoFactorAuth(
          //   find2FA.id,
          //   {
          //     is_used: true,
          //   },
          //   transaction
          // );

          await resultService.deleteResult(id, transaction);

          await handleRecreatingResultComputations(
            parseInt(deletedStudentProgrammeId.student_programme_id, 10),
            transaction
          );
        });
      } else {
        throw new Error(
          `Please Provide A Valid TOKEN Sent To Your Phone/Email In order To Complete This Action.`
        );
      }

      http.setSuccess(200, 'Result Deleted Successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to delete this Result.', {
        error: error.message,
      });

      return http.send(res);
    }
  }
}

/**
 *
 * @param {*} arrayOfItems
 */
// const removeDuplicates = function (arrayOfItems) {
//   const unique = {};

//   arrayOfItems.forEach(function (i) {
//     if (!unique[i]) {
//       unique[i] = true;
//     }
//   });

//   return Object.keys(unique);
// };

/**
 *
 */
const getNodeAttributes = function () {
  return {
    attributes: {
      exclude: [
        'created_at',
        'updated_at',
        'deleted_at',
        'createdById',
        'createApprovedById',
        'lastUpdatedById',
        'lastUpdateApprovedById',
        'deletedById',
        'deleteApprovedById',
        'deleteApprovedById',
      ],
    },
    include: [
      {
        association: 'assignmentCourse',
        attributes: [
          'id',
          'assignment_id',
          'programme_version_course_unit_id',
          'is_split',
        ],
        include: [
          {
            association: 'context',
            attributes: [
              'id',
              'campus_id',
              'academic_year_id',
              'semester_id',
              'intake_id',
              'department_id',
              'programme_id',
              'programme_type_id',
              'programme_version_id',
            ],

            include: [
              {
                association: 'academicYear',
                attributes: [
                  'id',
                  'academic_year_id',
                  'start_date',
                  'end_date',
                ],
                include: [
                  {
                    association: 'academicYear',
                    attributes: ['id', 'metadata_value'],
                  },
                ],
              },
              {
                association: 'semester',
                attributes: ['id', 'semester_id', 'start_date', 'end_date'],
                include: [
                  {
                    association: 'semester',
                    attributes: ['id', 'metadata_value'],
                  },
                ],
              },
            ],
          },
          {
            association: 'courseUnit',
            attributes: [
              'id',
              'programme_version_id',
              'course_unit_id',
              'grading_id',
              'contribution_algorithm_id',
            ],
            include: [
              {
                association: 'courseUnit',
                attributes: ['course_unit_code', 'course_unit_name'],
              },
            ],
          },
        ],
      },
      {
        association: 'nodeLecturer',
        attributes: [
          'id',
          'assignment_course_id',
          'lecturer_id',
          'is_course_coordinator',
          'can_upload_marks',
        ],
        include: [
          {
            association: 'lecturer',
            attributes: ['id', 'surname', 'other_names', 'email', 'phone'],
          },
        ],
      },
      {
        association: 'grading',
        attributes: ['id', 'grading_code', 'grading_description'],
      },
      {
        association: 'algorithm',
        attributes: ['id', 'metadata_value'],
      },
    ],
  };
};

/**
 *
 * @param {*} arrayOfItems
 */
const removeDuplicateObjects = function (data, key) {
  return [...new Map(data.map((item) => [key(item), item])).values()];
};

const getResultAttributes = function () {
  return {
    attributes: {
      exclude: [
        'created_at',
        'updated_at',
        'deleted_at',
        'createdById',
        'createApprovedById',
        'lastUpdatedById',
        'lastUpdateApprovedById',
        'deletedById',
        'deleteApprovedById',
        'deleteApprovedById',
      ],
    },
    include: [
      {
        association: 'academicYear',
        attributes: ['id', 'metadata_value'],
      },
      {
        association: 'semester',
        attributes: ['id', 'metadata_value'],
      },
      {
        association: 'studyYear',
        attributes: ['id', 'programme_study_year_id', 'programme_study_years'],
      },
      {
        association: 'node',
        ...getNodeAttributes(),
      },
      {
        association: 'studentProgramme',
        attributes: [
          'id',
          'student_id',
          'campus_id',
          'entry_academic_year_id',
          'intake_id',
        ],
        include: [
          {
            association: 'campus',
            attributes: ['id', 'metadata_value'],
          },
          {
            association: 'intake',
            attributes: ['id', 'metadata_value'],
          },
          {
            association: 'entryAcademicYear',
            attributes: ['id', 'metadata_value'],
          },
          {
            association: 'student',
            attributes: ['surname', 'other_names'],
          },
        ],
      },
    ],
  };
};

module.exports = ResultController;
