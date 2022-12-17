const { isEmpty } = require('lodash');
const model = require('@models');
const { HttpResponse } = require('@helpers');
const moment = require('moment');
const { resultBatchesService, resultService } = require('@services/index');
const http = new HttpResponse();

class ResultApprovalController {
  //  submit results
  async submitSelectedResults(req, res) {
    const data = req.body;

    const user = req.user.id;

    data.submitted_by_id = user;
    data.submit_date = moment.now();
    data.is_submitted = 'true';

    const approvedResults = [];

    try {
      await model.sequelize.transaction(async (transaction) => {
        for (const eachObject of data.requests) {
          const findStudentResult = await resultService
            .findOneResult({
              where: {
                id: eachObject,
                create_approval_status: 'PENDING',
                is_submitted: false,
                created_by_id: user,
              },
              include: [
                {
                  association: 'studentProgramme',
                  attributes: ['id', 'registration_number', 'student_number'],
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
              `Invalid Request, Result: Already submitted OR Not Uploaded By This User`
            );
          }

          await resultBatchesService.updateResultBatchesApproval(
            eachObject,
            {
              submitted_by_id: user,
              submit_date: moment.now(),
              is_submitted: true,
            },
            transaction
          );

          const updateResult = await resultService.updateResult(
            findStudentResult.id,
            {
              submitted_by_id: user,
              submit_date: moment.now(),
              is_submitted: true,
            },
            transaction
          );

          const result = updateResult[1][0];

          approvedResults.push(result);
        }
      });

      http.setSuccess(200, `Batch Results Updated(SUBMITTED) successfully`, {
        approvedResults,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, `Unable To SUBMIT Result Batches`, {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
  //  findAllBatchResults

  async submitResultByBatch(req, res) {
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
          uploaded_by_id: user,
          //  create_approval_status: 'PENDING',
        },
        raw: true,
      });

      if (isEmpty(findByBatch)) {
        throw new Error(
          `Invalid Data Request  for ${data.batchNumber} Batch Number`
        );
      }

      await model.sequelize.transaction(async (transaction) => {
        for (const eachObject of findByBatch) {
          const findStudentResult = await resultService
            .findOneResult({
              where: {
                id: eachObject.result_id,
                is_submitted: false,
                created_by_id: user,
              },
              include: [
                {
                  association: 'studentProgramme',
                  attributes: ['id', 'registration_number', 'student_number'],
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

          if (isEmpty(findStudentResult)) {
            throw new Error(`Results Not Found Or Already Submitted`);
          }

          if (!findStudentResult) {
            throw new Error(
              `RESULT For Student ${findStudentResult.studentProgramme.registration_number}and\n 
               ${findStudentResult.studentProgramme.student_number} Is Missing.`
            );
          }

          await resultBatchesService.updateResultBatchesApproval(
            eachObject,
            {
              submitted_by_id: user,
              submit_date: moment.now(),
              is_submitted: true,
            },
            transaction
          );

          const updateResult = await resultService.updateResult(
            findStudentResult.id,
            {
              submitted_by_id: user,
              submit_date: moment.now(),
              is_submitted: true,
            },
            transaction
          );

          const result = updateResult[1][0];

          approvedResults.push(result);
        }
      });

      http.setSuccess(200, `Results Updated(SUBMITTED) successfully`, {
        approvedResults,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, `Unable To Submit Result Batches`, {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

module.exports = ResultApprovalController;
