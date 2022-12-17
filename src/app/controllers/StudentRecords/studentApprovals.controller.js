const { HttpResponse } = require('@helpers');
const {
  studentApprovalService,
  studentService,
  metadataValueService,
} = require('@services/index');
const moment = require('moment');
const model = require('@models');
const { isEmpty } = require('lodash');
const { getMetadataValueId } = require('@controllers/Helpers/programmeHelper');

const http = new HttpResponse();

class StudentApprovalController {
  /**
   * GET All StudentApprovals.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async index(req, res) {
    try {
      const result = await studentApprovalService.findAllStudentApprovals({
        where: { create_approval_status: 'PENDING' },
        include: [
          {
            association: 'student',
            attributes: [
              'id',
              'surname',
              'other_names',

              'registration_number',
              'student_number',
              'phone',
              'email',
              'gender',
            ],
          },
          {
            association: 'createdBy',
            attributes: ['id', 'surname', 'other_names'],
          },
        ],
      });

      http.setSuccess(200, 'Student Creation Approvals Fetched Successfully.', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Student Creation Approvals.', {
        error: error.message,
      });

      return http.send(res);
    }
  }

  /**
   *
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async approveStudents(req, res) {
    try {
      const data = req.body;
      const user = req.user.id;

      data.create_approved_by_id = user;
      data.create_approval_date = moment.now();
      data.create_approval_status = 'APPROVED';

      const approvedStudents = [];
      const metadataValues = await metadataValueService.findAllMetadataValues({
        include: ['metadata'],
      });

      await model.sequelize.transaction(async (transaction) => {
        for (const requestId of data.requests) {
          const findRequest =
            await studentApprovalService.findOneStudentApproval({
              where: {
                id: requestId,
                create_approval_status: 'PENDING',
              },
              raw: true,
            });

          if (!findRequest) {
            throw new Error(
              'One of the requests you are trying to approve is not valid or has already been approved.'
            );
          }

          const findStudentProgramme = await studentService
            .findOneStudentProgramme({
              where: {
                id: findRequest.student_programme_id,
                is_current_programme: true,
              },
              include: [
                {
                  association: 'student',
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

          if (!findStudentProgramme) {
            throw new Error(
              `A Current Programme For Student ${findStudentProgramme.student.surname} ${findStudentProgramme.student.other_names} Is Missing.`
            );
          }

          await studentApprovalService.updateStudentApproval(
            requestId,
            data,
            transaction
          );

          const accountStatusId = await getMetadataValueId(
            metadataValues,
            'ACTIVE',
            'STUDENT ACCOUNT STATUSES'
          );

          const approvedStudentData = {
            create_approved_by_id: user,
            create_approval_date: moment.now(),
            create_approval_status: 'APPROVED',
            student_account_status_id: accountStatusId,
          };

          const updateStudent = await studentApprovalService.updateStudent(
            findStudentProgramme.student.id,
            approvedStudentData,
            transaction
          );

          await studentApprovalService.updateStudentProgramme(
            findStudentProgramme.id,
            {
              create_approved_by_id: user,
              create_approval_date: moment.now(),
              create_approval_status: 'APPROVED',
            },
            transaction
          );

          const result = updateStudent[1][0];

          approvedStudents.push(result);
        }
      });

      http.setSuccess(200, 'Students Approved Successfully.', {
        approvedStudents,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to Approve Students.', {
        error: error.message,
      });

      return http.send(res);
    }
  }

  /**
   *
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async approveStudentsByBatch(req, res) {
    try {
      const data = req.query;

      const user = req.user.id;

      const approvedStudents = [];

      const findRequests = await studentApprovalService.findAllStudentApprovals(
        {
          where: {
            batch_number: data.batchNumber,
            create_approval_status: 'PENDING',
          },
          raw: true,
        }
      );

      if (isEmpty(findRequests)) {
        throw new Error(
          'There Are No Pending Approvals Matching This Batch Number.'
        );
      }

      await model.sequelize.transaction(async (transaction) => {
        for (const eachObject of findRequests) {
          const findStudentProgramme = await studentService
            .findOneStudentProgramme({
              where: {
                id: eachObject.student_programme_id,
                is_current_programme: true,
              },
              include: [
                {
                  association: 'student',
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

          if (!findStudentProgramme) {
            throw new Error(
              `A Current Programme For Student ${findStudentProgramme.student.surname} ${findStudentProgramme.student.other_names} Is Missing.`
            );
          }

          await studentApprovalService.updateStudentApproval(
            eachObject.id,
            {
              create_approved_by_id: user,
              create_approval_date: moment.now(),
              create_approval_status: 'APPROVED',
            },
            transaction
          );
          const metadataValues =
            await metadataValueService.findAllMetadataValues({
              include: ['metadata'],
            });

          const accountStatusId = await getMetadataValueId(
            metadataValues,
            'ACTIVE',
            'STUDENT ACCOUNT STATUSES'
          );

          const approvedStudentData = {
            create_approved_by_id: user,
            create_approval_date: moment.now(),
            create_approval_status: 'APPROVED',
            student_account_status_id: accountStatusId,
          };

          const updateStudent = await studentApprovalService.updateStudent(
            findStudentProgramme.student.id,
            approvedStudentData,
            transaction
          );

          await studentApprovalService.updateStudentProgramme(
            findStudentProgramme.id,
            {
              create_approved_by_id: user,
              create_approval_date: moment.now(),
              create_approval_status: 'APPROVED',
            },
            transaction
          );

          const result = updateStudent[1][0];

          approvedStudents.push(result);
        }
      });

      http.setSuccess(200, 'Batch Of Students Approved Successfully.', {
        approvedStudents,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to Approve Batch Of Students.', {
        error: error.message,
      });

      return http.send(res);
    }
  }

  /**
   * Get Specific StudentApproval Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async fetchStudentApproval(req, res) {
    try {
      const { id } = req.params;
      const semester = await studentApprovalService.findOneStudentApproval({
        where: { id },
      });

      http.setSuccess(200, 'Student Approval Fetched successfully.', {
        semester,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to fetch student approvals.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Destroy StudentApproval Data
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async deleteStudentApproval(req, res) {
    try {
      const { id } = req.params;

      await studentApprovalService.deleteStudentApproval({ where: { id } });
      http.setSuccess(200, 'Student Approval Deleted Successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to delete this Student Approval.', {
        error: error.message,
      });

      return http.send(res);
    }
  }

  /**
   * uploadedStudentsByBatchNumber
   */
  async uploadedStudentsApprovalFunction(req, res) {
    try {
      const data = await studentApprovalService.uploadedStudentsApproval();

      http.setSuccess(200, 'Uploaded Students Fetched Successfully', { data });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to fetch uploaded Students for approval.', {
        error: error.message,
      });

      return http.send(res);
    }
  }

  //  uploadedStudentsApproval

  async uploadedStudentsByBatchNumberFunction(req, res) {
    try {
      const context = req.query;

      if (!context.batchNumber) {
        throw new Error('Invalid context');
      }

      const data = await studentApprovalService.uploadedStudentsByBatchNumber(
        context
      );

      http.setSuccess(200, 'Uploaded Students Fetched Successfully', { data });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to fetch uploaded Students for approval.', {
        error: error.message,
      });

      return http.send(res);
    }
  }
}

module.exports = StudentApprovalController;
