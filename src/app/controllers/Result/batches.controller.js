const { trim, isEmpty, map, now } = require('lodash');
const UserAgent = require('user-agents');
// const { Op } = require('sequelize');
const model = require('@models');
const {
  generateGradesHandler,
  gradeSemesterResults,
} = require('../Helpers/academicGradesHelper');
const {
  // handleRemovingResultComputations,
  handleRecreatingResultComputations,
} = require('../Helpers/resultBatchesHelper');
// assignmentsByLecturerFunction
const { HttpResponse } = require('@helpers');
const moment = require('moment');
const excelJs = require('exceljs');
const fs = require('fs');
const {
  resultBatchesService,
  resultService,
  resultAllocationNodeService,
  graduationListService,
  gradingService,
  institutionStructureService,
  courseUnitService,
  twoFactorAuthService,
  userService,
  metadataValueService,
} = require('@services/index');
const { batchReportColumns } = require('./templateColumns');
const { evaluateStudentMarks } = require('@controllers/Helpers/resultHelper');
const { activityLog, findLocalIpAddress } = require('../Helpers/logsHelper');
const http = new HttpResponse();

const userAgent = new UserAgent();

const iPv4 = findLocalIpAddress();

class BatchController {
  // Batch function
  async BatchFunction(req, res) {
    const context = req.query;

    // uploaded_by_id

    try {
      if (!context.upload_year) {
        throw new Error('Invalid Context Provided');
      }

      const userId = req.user.id;

      let contextData = {};

      contextData = { ...context, userId };

      const data = await resultBatchesService.batchesByYear(contextData);

      http.setSuccess(200, `Result Upload Batches fetched successfully`, {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, `Unable To Fetch Result Upload Batches`, {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  // by date range
  async BatchRangeFunction(req, res) {
    const context = req.query;

    try {
      if (!context.date_from || !context.date_to) {
        throw new Error('Invalid Context Provided');
      }

      const userId = req.user.id;

      let contextData = {};

      contextData = { ...context, userId };

      const data = await resultBatchesService.batchesByRange(contextData);

      http.setSuccess(200, `Result Upload Batches fetched successfully`, {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, `Unable To Fetch Result Upload Batches`, {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  // searchUserResultBatch

  async searchUserResultBatch(req, res) {
    const context = req.query;

    try {
      if (
        !context.semester ||
        !context.academicYear ||
        !context.studyYear ||
        !context.campus ||
        !context.intake ||
        !context.course
      ) {
        throw new Error('Invalid Context Provided');
      }

      const userId = req.user.id;

      let contextData = {};

      contextData = { ...context, userId };

      const courseData = await courseUnitService.findOneCourseUnit({
        where: { course_unit_code: context.course },
      });

      if (!courseData) {
        throw new Error('Course Does not Exist');
      }

      const data = await resultBatchesService.searchUserResultBatch(
        contextData
      );

      http.setSuccess(200, `Result Upload Batches fetched successfully`, {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, `Unable To Fetch Result Upload Batches`, {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
  // resultBatchApproval

  async resultBatchApproval(req, res) {
    const context = req.query;

    try {
      if (!context.date_from || !context.date_to || !context.departmentId) {
        throw new Error('Invalid Context Provided');
      }

      const data = await resultBatchesService.resultBatchApproval(context);

      http.setSuccess(200, `Result Upload Batches fetched successfully`, {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, `Unable To Fetch Result Upload Batches`, {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
  // approvalPublishCourses

  async approvalPublishCourses(req, res) {
    const context = req.query;

    try {
      if (
        !context.campus_id ||
        !context.study_year_id ||
        !context.academic_year_id ||
        !context.semester_id ||
        !context.programme_id
      ) {
        throw new Error('Invalid Context Provided');
      }

      let data = [];

      const userId = req.user.id;

      context.userId = userId;

      if (context.category === 'SUBMIT') {
        data = await resultBatchesService.approvalPublishCoursesSubmit(context);
      } else {
        data = await resultBatchesService.approvalPublishCourses(context);
      }

      http.setSuccess(200, `Data fetched successfully`, {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, `Unable To Fetch Data`, {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  // approve results

  async approvalPublishResults(req, res) {
    const context = req.query;

    try {
      if (
        !context.campus_id ||
        !context.study_year_id ||
        !context.academic_year_id ||
        !context.semester_id ||
        !context.programme_id ||
        !context.course_id
      ) {
        throw new Error('Invalid Context Provided');
      }

      let data = [];

      const userId = req.user.id;

      context.userId = userId;

      if (context.category === 'APPROVE') {
        data = await resultBatchesService.approvalPublishResultsApprove(
          context
        );
      } else if (context.category === 'PUBLISH') {
        data = await resultBatchesService.approvalPublishResultsPublish(
          context
        );
      } else if (context.category === 'SUBMIT') {
        data = await resultBatchesService.approvalPublishResultsSubmit(context);
      } else {
        throw new Error(`Invalid Request`);
      }

      http.setSuccess(200, `Data fetched successfully`, {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, `Unable To Fetch Data`, {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  // Approve results data ....

  async approvalResultNotByBatch(req, res) {
    const data = req.body;

    const user = req.user.id;

    data.create_approved_by_id = user;
    data.create_approval_date = moment.now();
    data.create_approval_status = 'APPROVED';

    const approvedResults = [];

    try {
      await model.sequelize.transaction(async (transaction) => {
        for (const eachObject of data.requests) {
          const findStudentResult = await resultService
            .findOneResult({
              where: {
                id: eachObject,
                create_approval_status: 'PENDING',
                is_submitted: true,
              },
              include: [
                {
                  association: 'studentProgramme',
                  attributes: [
                    'id',
                    'registration_number',
                    'student_number',
                    'programme_id',
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

          if (!findStudentResult) {
            throw new Error(
              `One of the requests you are trying to approve is not valid or has already been approved.`
            );
          }
          const userBoundLevel = await userService.findUserRoleBoundLevel({
            user_id: user,
            role_id: req.body.role_id,
            bound_level: 'PROGRAMMES',
          });

          if (!userBoundLevel) {
            throw new Error(`Access Domain Not Defined`);
          } else if (userBoundLevel.has_access_to_all === false) {
            const userRoleProgramme = await userService.userRoleProgramme({
              user_id: user,
              role_id: req.body.role_id,
              programme_id: findStudentResult.studentProgramme.programme_id,
            });

            if (!userRoleProgramme) {
              throw new Error(
                `Access to Student Record Denied(PROGRAMME Permission Denied)`
              );
            }
          }

          await resultBatchesService.updateResultBatchesApproval(
            eachObject,
            {
              create_approved_by_id: user,
              create_approval_date: moment.now(),
              create_approval_status: 'APPROVED',
            },
            transaction
          );

          // const approvesResultData = {
          //   create_approved_by_id: user,
          //   create_approval_date: moment.now(),
          //   create_approval_status: 'APPROVED',
          // };

          const updateResult = await resultService.updateResult(
            findStudentResult.id,
            {
              create_approved_by_id: user,
              create_approval_date: moment.now(),
              create_approval_status: 'APPROVED',
            },
            transaction
          );

          const result = updateResult[1][0];

          approvedResults.push(result);
        }
      });

      http.setSuccess(200, `Batch Results Updated(APPROVED) successfully`, {
        approvedResults,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, `Unable To Approve Result Batches`, {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
  // publish results
  /**
   *
   *
   * publish results
   *
   */

  async publishResultNotByBatch(req, res) {
    const data = req.body;

    const user = req.user.id;

    data.published_by_id = user;
    data.publish_date = moment.now();
    data.is_published = true;

    const approvedResults = [];

    try {
      await model.sequelize.transaction(async (transaction) => {
        for (const eachObject of data.requests) {
          const findStudentResult = await resultService
            .findOneResult({
              where: {
                id: eachObject,
                create_approval_status: 'APPROVED',
                is_published: false,
              },
              include: [
                {
                  association: 'studentProgramme',
                  attributes: [
                    'id',
                    'registration_number',
                    'student_number',
                    'programme_id',
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

          if (!findStudentResult) {
            throw new Error(
              `One of the requests you are trying to publish is not valid or has already been approved.`
            );
          }

          const userBoundLevel = await userService.findUserRoleBoundLevel({
            user_id: user,
            role_id: req.body.role_id,
            bound_level: 'PROGRAMMES',
          });

          if (!userBoundLevel) {
            throw new Error(`Access Domain Not Defined`);
          } else if (userBoundLevel.has_access_to_all === false) {
            const userRoleProgramme = await userService.userRoleProgramme({
              user_id: user,
              role_id: req.body.role_id,
              programme_id: findStudentResult.studentProgramme.programme_id,
            });

            if (!userRoleProgramme) {
              throw new Error(
                `Access to Student Record Denied(PROGRAMME Permission Denied)`
              );
            }
          }

          await resultBatchesService.updateResultBatchesApproval(
            eachObject,
            {
              create_approved_by_id: user,
              publish_date: moment.now(),
              create_approval_status: 'APPROVED',
            },
            transaction
          );

          const updateResult = await resultService.updateResult(
            findStudentResult.id,
            {
              published_by_id: user,
              create_approval_date: moment.now(),
              is_published: true,
            },
            transaction
          );

          const result = updateResult[1][0];

          approvedResults.push(result);
        }
      });

      http.setSuccess(200, `Results Published successfully`, {
        approvedResults,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, `Unable To Approve Result Batches`, {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
  //  findAllBatchResults

  async approvalResultByBatch(req, res) {
    const data = req.body;

    const user = req.user.id;

    const approvedResults = [];

    if (!data.batchNumber) {
      throw new Error(`Invalid Data Request`);
    }

    try {
      const findByBatch = await resultBatchesService.findAllBatchResults({
        where: {
          batch_number: data.batchNumber,
          create_approval_status: 'PENDING',
        },
        raw: true,
      });

      if (isEmpty(findByBatch)) {
        throw new Error(
          `There are no Pending Results for  ${data.batchNumber} Batch Number`
        );
      }

      await model.sequelize.transaction(async (transaction) => {
        for (const eachObject of findByBatch) {
          const findStudentResult = await resultService
            .findOneResult({
              where: {
                id: eachObject.result_id,
                create_approval_status: 'PENDING',
                is_submitted: true,
              },
              include: [
                {
                  association: 'studentProgramme',
                  attributes: [
                    'id',
                    'registration_number',
                    'student_number',
                    'programme_id',
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

          if (!findStudentResult) {
            throw new Error(
              `RESULT For Student ${findStudentResult.studentProgramme.registration_number}and\n 
               ${findStudentResult.studentProgramme.student_number} Is Missing.`
            );
          }

          await resultBatchesService.updateResultBatchesApproval(
            eachObject.id,
            {
              create_approved_by_id: user,
              create_approval_date: moment.now(),
              create_approval_status: 'APPROVED',
            },
            transaction
          );

          // const approvesResultData = {
          //   create_approved_by_id: user,
          //   create_approval_date: moment.now(),
          //   create_approval_status: 'APPROVED',
          // };

          const updateResult = await resultService.updateResult(
            findStudentResult.id,
            {
              create_approved_by_id: user,
              create_approval_date: moment.now(),
              create_approval_status: 'APPROVED',
            },
            transaction
          );

          const result = updateResult[1][0];

          approvedResults.push(result);
        }
      });

      http.setSuccess(200, `Results Updated(APPROVED) successfully`, {
        approvedResults,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, `Unable To Approve Result Batches`, {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  // resultsByBatch
  async resultsByBatchFunction(req, res) {
    const context = req.query;

    try {
      if (!context.batch) {
        throw new Error('Invalid Context Provided');
      }

      let data = [];

      if (context.userId) {
        data = await resultBatchesService.resultsByBatch(context);
      } else {
        const userId = req.user.id;

        const contextData = { ...context, userId };

        data = await resultBatchesService.resultsByBatch(contextData);
      }

      http.setSuccess(200, `Batch Results fetched successfully`, {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, `Unable To Fetch Batch Results`, {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * DOWNLOAD BATCH RESULTS TO EXCEL
   *
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async downloadResultsByBatchFunction(req, res) {
    try {
      const { batchNumber } = req.params;
      const { id: userId, ...user } = req.user;

      const contextData = { batch: batchNumber, userId };

      const institutionStructure =
        await institutionStructureService.findInstitutionStructureRecords({
          attributes: [
            'id',
            'institution_name',
            'institution_address',
            'institution_slogan',
            'institution_website',
            'institution_logo',
            'institution_email',
            'telephone_1',
            'telephone_2',
            'academic_units',
          ],
          raw: true,
        });

      if (!institutionStructure) {
        throw new Error(`Unable To Get Institution Structure Records.`);
      }

      const batchResults = await resultBatchesService.resultsByBatch(
        contextData
      );

      if (isEmpty(batchResults))
        throw new Error('This Batch has no student Results');

      const workbook = new excelJs.Workbook();
      const rootSheet = workbook.addWorksheet('BATCH RESULTS');

      rootSheet.mergeCells('C1', 'O3');
      rootSheet.mergeCells('A1', 'B2');
      const titleCell = rootSheet.getCell('C1');

      rootSheet.getRow(1).height = 65;

      titleCell.value = `${
        institutionStructure.institution_name || 'TERP'
      } \n RESULTS FOR BATCH ${batchNumber}.`;

      titleCell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
      };

      titleCell.font = { bold: true, size: 10, name: 'Arial' };

      const headerRow = rootSheet.getRow(3);

      headerRow.values = map(batchReportColumns, 'header');
      headerRow.font = { bold: true, size: 11, color: '#2c3e50' };
      rootSheet.columns = batchReportColumns.map((column) => {
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

      const templateData = [];

      for (const batchResult of batchResults) {
        templateData.push([
          `${batchResult.surname} ${batchResult.other_names}`,
          batchResult.registration_number,
          batchResult.student_number,
          batchResult.programme_code,
          batchResult.course_unit_code,
          batchResult.campus,
          batchResult.academic_year,
          batchResult.semester,
          batchResult.programme_study_year,
          batchResult.course_work
            ? parseFloat(batchResult.course_work).toFixed(1)
            : null,
          batchResult.final_exam
            ? parseFloat(batchResult.final_exam).toFixed(1)
            : null,
          parseFloat(batchResult.final_mark).toFixed(1),
          batchResult.remark,
          batchResult.is_first_sitting ? 'YES' : 'NO',
          batchResult.retake_count,
          batchResult.is_audited_course ? 'YES' : 'NO',
          batchResult.is_submitted ? 'YES' : 'NO',
          batchResult.is_published ? 'YES' : 'NO',
          batchResult.is_approved ? 'YES' : 'NO',
          batchResult.created_at,
        ]);
      }

      rootSheet.addRows(templateData);

      const uploadPath = `${process.cwd()}/src/assets/documents/templates`;

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true }, (err) => {
          throw new Error(err.message);
        });
      }

      const template = `${uploadPath}/batch-results-${user.surname}-${
        user.other_names
      }-${user.id}-${now()}.xlsm`;

      await workbook.xlsx.writeFile(template);
      await res.download(template, `BATCH RESULT REPORT.xlsx`, (error) => {
        if (error) {
          throw new Error(error.message);
        }
      });
    } catch (error) {
      http.setError(400, `Unable To Fetch Batch Results`, {
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
  async computeBatch(req, res) {
    try {
      const { batchNumber } = req.params;
      const user = req.user.id;

      const findAllResults = await resultBatchesService.findAllBatchResults({
        where: {
          batch_number: trim(batchNumber),
        },
        include: [
          {
            association: 'uploader',
            attributes: ['id', 'surname', 'other_names'],
          },
        ],
        raw: true,
        nest: true,
      });

      if (isEmpty(findAllResults)) {
        throw new Error('Unable To Find Any Results In This Batch.');
      }

      if (
        parseInt(user, 10) !== parseInt(findAllResults[0].uploaded_by_id, 10)
      ) {
        throw new Error(
          `You do not have the right to compute this batch uploaded by ${findAllResults[0].uploader.surname} ${findAllResults[0].uploader.other_names}.`
        );
      }

      const computedRecords = [];

      const gradingSystem = await gradingService.findAllGrading({
        attributes: ['id'],
        include: [
          {
            association: 'values',
            attributes: [
              'id',
              'grading_id',
              'max_value',
              'min_value',
              'grading_point',
              'grading_letter',
              'interpretation',
            ],
          },
        ],
      });

      await model.sequelize.transaction(async (transaction) => {
        for (const item of findAllResults) {
          const findResult = await resultService.fetchResult({
            where: {
              id: item.result_id,
            },
          });

          const semesterResults =
            await resultAllocationNodeService.gpaSingleStudent(
              findResult.student_programme_id
            );

          const gradedSemesterResults = gradeSemesterResults(
            semesterResults,
            gradingSystem
          );

          const computedCGPAs = generateGradesHandler(gradedSemesterResults);

          for (const item of computedCGPAs) {
            const grades = await graduationListService.generateStudentGrades(
              item,
              transaction
            );

            computedRecords.push(grades);
          }
        }
      });

      http.setSuccess(200, 'Batch computed successfully', {
        data: computedRecords,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to compute this Batch.', {
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
  async updateBatch(req, res) {
    try {
      const { batchNumber } = req.params;
      const data = req.body;
      const user = req.user.id;

      const updatedRecords = [];

      if (data) {
        const findAllResultBatches = await resultBatchesFunction(
          batchNumber,
          user
        );

        await model.sequelize.transaction(async (transaction) => {
          for (const item of findAllResultBatches) {
            const response = await resultService.updateResult(
              item.result.id,
              data,
              transaction
            );

            const result = response[1][0];

            updatedRecords.push(result);
          }

          for (const item of findAllResultBatches) {
            await handleRecreatingResultComputations(
              parseInt(item.result.student_programme_id, 10),
              transaction
            );
          }
        });
      }

      http.setSuccess(200, 'Batch updated successfully', {
        data: updatedRecords,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to update this Batch.', {
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
  async updateBatchRecord(req, res) {
    try {
      const { batchResultContextId } = req.params;

      let data = req.body;
      const { id: user, remember_token: rememberToken } = req.user;

      // const date = moment.utc().format();
      // const local = moment.utc(date).local().format();
      // const rightNow = moment(local).utc(true);

      data.last_updated_by_id = user;

      let updatedRecord = {};

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
        const findOneResultBatch = await singleResultBatchesFunction(
          batchResultContextId,
          user
        );

        if (
          findOneResultBatch.result.studentProgramme.on_provisional_list ||
          findOneResultBatch.result.studentProgramme.on_graduation_list
        ) {
          throw new Error(
            `Cannot Edit Results for this student because they are on the ${
              findOneResultBatch.result.studentProgramme.on_provisional_list
                ? 'Provisional'
                : 'Final'
            } Graduation list.`
          );
        }

        const courseWorkMark = data.course_work;
        const examMark = data.final_exam;

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

        data.pass_mark = findOneResultBatch.result.pass_mark;
        data.is_first_sitting = data.is_first_sitting
          ? data.is_first_sitting
          : findOneResultBatch.result.is_first_sitting;

        data = await evaluateStudentMarks(
          data,
          metadataValues,
          data.is_conceded_pass,
          findOneResultBatch.result.versionCourseUnit.grading_id,
          courseWorkMark,
          examMark,
          findOneResultBatch.result.studentProgramme.registration_number
        );

        updatedRecord = await model.sequelize.transaction(
          async (transaction) => {
            const response = await resultService.updateResult(
              findOneResultBatch.result.id,
              data,
              transaction
            );

            await handleRecreatingResultComputations(
              parseInt(findOneResultBatch.result.student_programme_id, 10),
              transaction
            );

            const result = response[1][0];

            await activityLog(
              'createResultLog',
              user,
              'UPDATE',
              'CHANGE OF STUDENT MARKS FROM BATCH',
              `Updated Marks Of Student Number: ${
                findOneResultBatch.result.studentProgramme.student_number
              }, Registration Number: ${
                findOneResultBatch.result.studentProgramme.registration_number
              } Using OTP: ${find2FA.otp} With Values: Course Work: ${
                data.course_work ? data.course_work : 'NOT CHANGED'
              }, Final Exam: ${
                data.final_exam ? data.final_exam : 'NOT CHANGED'
              }, Final Mark: ${
                data.final_mark ? data.final_mark : 'NOT CHANGED'
              }`,
              `Course Work: ${findOneResultBatch.result.course_work}, Final Exam: ${findOneResultBatch.result.final_exam}, Final Mark: ${findOneResultBatch.result.final_mark}`,
              batchResultContextId,
              `resultBatch`,
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
          }
        );
      } else {
        throw new Error(
          `Please Provide A Valid TOKEN Sent To Your Phone/Email In order To Complete This Action.`
        );
      }

      http.setSuccess(200, 'Batch Result updated successfully', {
        data: updatedRecord,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to update this Batch Result.', {
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
  async deleteBatch(req, res) {
    try {
      const { batchNumber } = req.params;
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
        const findAllResultBatches = await resultBatchesFunction(
          batchNumber,
          user
        );

        const arrayOfStudentProgrammeIds = [];

        await model.sequelize.transaction(async (transaction) => {
          for (const item of findAllResultBatches) {
            arrayOfStudentProgrammeIds.push(item.result.student_programme_id);

            await resultBatchesService.deleteBatchResults(item.id, transaction);

            await resultService.deleteResult(item.result.id, transaction);
          }

          for (const item of arrayOfStudentProgrammeIds) {
            await handleRecreatingResultComputations(item, transaction);
          }

          await activityLog(
            'createResultLog',
            user,
            'DELETE',
            'DELETING OF AN ENTIRE BATCH',
            `Deleted Marks Of Students In Batch: ${batchNumber} Using OTP: ${find2FA.otp}`,
            `N/A`,
            null,
            null,
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
        });
      } else {
        throw new Error(
          `Please Provide A Valid TOKEN Sent To Your Phone/Email In order To Complete This Action.`
        );
      }

      http.setSuccess(200, 'Batch Deleted Successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to delete this Batch.', {
        error: error.message,
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
  async deleteBatchRecord(req, res) {
    try {
      const { batchResultContextId } = req.params;
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
        const findOneResultBatch = await singleResultBatchesFunction(
          batchResultContextId,
          user
        );

        if (
          findOneResultBatch.result.studentProgramme.on_provisional_list ||
          findOneResultBatch.result.studentProgramme.on_graduation_list
        ) {
          throw new Error(
            `Cannot Delete this Result because the student is already on the ${
              findOneResultBatch.result.studentProgramme.on_provisional_list
                ? 'Provisional'
                : 'Final'
            } Graduation list.`
          );
        }

        await model.sequelize.transaction(async (transaction) => {
          await resultBatchesService.deleteBatchResults(
            findOneResultBatch.id,
            transaction
          );

          await resultService.deleteResult(
            findOneResultBatch.result.id,
            transaction
          );

          await activityLog(
            'createResultLog',
            user,
            'DELETE',
            'DELETING OF STUDENT MARKS FROM BATCH',
            `Deleted Marks Of Student Number: ${findOneResultBatch.result.studentProgramme.student_number}, Registration Number: ${findOneResultBatch.result.studentProgramme.registration_number} Using OTP: ${find2FA.otp}`,
            `Course Work: ${findOneResultBatch.result.course_work}, Final Exam: ${findOneResultBatch.result.final_exam}, Final Mark: ${findOneResultBatch.result.final_mark}`,
            batchResultContextId,
            `resultBatch`,
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
        });

        await model.sequelize.transaction(async (transaction) => {
          await handleRecreatingResultComputations(
            findOneResultBatch.result.student_programme_id,
            transaction
          );
        });
      } else {
        throw new Error(
          `Please Provide A Valid TOKEN Sent To Your Phone/Email In order To Complete This Action.`
        );
      }

      http.setSuccess(200, 'Batch Result Deleted Successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to delete this Batch Result.', {
        error: error.message,
      });

      return http.send(res);
    }
  }
}

/**
 *
 * @param {*} batchNumber
 * @param {*} user
 */
const resultBatchesFunction = async function (batchNumber, user) {
  const findAllResultBatches = await resultBatchesService.findAllBatchResults({
    where: {
      batch_number: trim(batchNumber),
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
    raw: true,
    nest: true,
  });

  if (isEmpty(findAllResultBatches)) {
    throw new Error('Unable To Find Any Results In This Batch.');
  }

  if (
    parseInt(user, 10) !== parseInt(findAllResultBatches[0].uploaded_by_id, 10)
  ) {
    throw new Error(
      `You do not have the right to perform any action on this batch uploaded by ${findAllResultBatches[0].uploader.surname} ${findAllResultBatches[0].uploader.other_names}.`
    );
  }

  return findAllResultBatches;
};

/**
 *
 * @param {*} batchResultContextId
 * @param {*} user
 * @returns
 */
const singleResultBatchesFunction = async function (
  batchResultContextId,
  user
) {
  const findOneBatchResult = await resultBatchesService
    .findOneBatchResult({
      where: {
        id: batchResultContextId,
      },
      include: [
        {
          association: 'result',
          include: ['versionCourseUnit', 'studentProgramme'],
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

  if (!findOneBatchResult) {
    throw new Error('Unable To Find This Batch Result.');
  }

  if (parseInt(user, 10) !== parseInt(findOneBatchResult.uploaded_by_id, 10)) {
    throw new Error(
      `You do not have the right to perform any action on this batch result uploaded by ${findOneBatchResult.uploader.surname} ${findOneBatchResult.uploader.other_names}.`
    );
  }

  return findOneBatchResult;
};

module.exports = BatchController;
