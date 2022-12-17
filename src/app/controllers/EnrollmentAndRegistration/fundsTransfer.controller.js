const { HttpResponse } = require('@helpers');
const {
  fundsTransferService,
  studentService,
  paymentTransactionService,
} = require('@services/index');
const model = require('@models');
const { trim, isEmpty } = require('lodash');
const moment = require('moment');
const {
  generateSystemReference,
} = require('../Helpers/paymentReferenceHelper');
const {
  generatePaymentReferenceRecord,
} = require('../Helpers/paymentReferenceRecord');
const { studentProgrammeAttributes } = require('../Helpers/enrollmentRecord');

const http = new HttpResponse();

class FundsTransferController {
  /**
   * GET All FundsTransfers.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async index(req, res) {
    try {
      const fundsTransfers = await fundsTransferService.findAllFundsTransfers({
        ...fundsTransferAttributes(),
        where: {
          create_approval_status: 'PENDING',
        },
      });

      http.setSuccess(200, 'Funds Transfer fetch successful', {
        data: fundsTransfers,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to fetch Funds Transfer', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * CREATE New FundsTransfer Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async createFundsTransfer(req, res) {
    try {
      const data = req.body;
      const { id } = req.user;

      const studentProgramme = await studentService
        .findOneStudentProgramme({
          where: {
            student_number: trim(data.recipient_student_number),
            is_current_programme: true,
          },
          ...studentProgrammeAttributes(),
          nest: true,
        })
        .then((res) => {
          if (res) {
            return res.toJSON();
          }
        });

      if (!studentProgramme) {
        throw new Error(
          `Unable To Find A Current Academic Record With That Student Number.`
        );
      }

      data.recipient_student_id = studentProgramme.student_id;
      data.student_programme_id = studentProgramme.id;
      data.created_by_id = id;

      const findStudyYear = studentProgramme.programme.programmeStudyYears.find(
        (stdYr) =>
          parseInt(stdYr.programme_study_year_id, 10) ===
          parseInt(data.study_year_id, 10)
      );

      if (!findStudyYear) {
        throw new Error(
          `Unable To Find The Programme Study Year Selected Associated With This Student's Programme.`
        );
      }

      data.study_year_id = findStudyYear.id;

      data.system_prn = generateSystemReference('FT');

      const response = await model.sequelize.transaction(
        async (transaction) => {
          const result = await fundsTransferService.createFundsTransfer(
            data,
            transaction
          );

          return result;
        }
      );

      http.setSuccess(200, 'Funds Transfer created successfully', {
        data: response,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to create this Funds Transfer.', {
        error: { message: error.message },
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
  async approveFundsTransfer(req, res) {
    try {
      const data = req.body;
      const { id } = req.params;

      const results = [];

      await model.sequelize.transaction(async (transaction) => {
        if (!isEmpty(data.funds_transfers)) {
          for (const transfer of data.funds_transfers) {
            const fundsTransferData = {
              create_approval_status: 'APPROVED',
              create_approved_by_id: id,
              updated_at: moment.now(),
            };

            const giverPaymentTransactionData = {
              last_updated_by_id: id,
              updated_at: moment.now(),
            };

            const fundsTransfer = await fundsTransferService
              .findOneFundsTransfer({
                where: {
                  id: transfer,
                },
                ...fundsTransferAttributes(),
                nest: true,
              })
              .then((res) => {
                if (res) {
                  return res.toJSON();
                }
              });

            if (!fundsTransfer) {
              throw new Error(
                `One Of The Funds Transfers You Are Trying To Approve Doesn't Exist.`
              );
            }

            if (fundsTransfer.create_approval_status === 'APPROVED') {
              throw new Error(
                `One Of The Funds Transfers You Are Trying To Approve Has Already Been Approved.`
              );
            }

            const findTransaction =
              await paymentTransactionService.findOneRecord({
                where: {
                  id: fundsTransfer.transaction_id,
                },
                raw: true,
              });

            if (!findTransaction) {
              throw new Error(
                `Unable To Find The Transaction From There The Funds Are To Be Transferred.`
              );
            }

            if (
              parseFloat(fundsTransfer.amount_to_transfer) >
              parseFloat(findTransaction.unallocated_amount)
            ) {
              throw new Error(
                `The Transaction From Which You Are Transferring Funds Of ${parseFloat(
                  fundsTransfer.amount_to_transfer
                )} Has Insufficient Balance.`
              );
            }

            const newAllocatedAmount =
              parseFloat(findTransaction.allocated_amount) +
              parseFloat(fundsTransfer.amount_to_transfer);

            const newUnallocated =
              parseFloat(findTransaction.unallocated_amount) -
              parseFloat(fundsTransfer.amount_to_transfer);

            const newAmountPaid =
              parseFloat(findTransaction.amount) -
              parseFloat(fundsTransfer.amount_to_transfer);

            giverPaymentTransactionData.allocated_amount = newAllocatedAmount;
            giverPaymentTransactionData.unallocated_amount = newUnallocated;
            giverPaymentTransactionData.amount = newAmountPaid;

            const recipientPaymentTransactionData = {
              student_id: fundsTransfer.recipient_student_id,
              student_programme_id: fundsTransfer.student_programme_id,
              academic_year_id: fundsTransfer.academic_year_id,
              semester_id: fundsTransfer.semester_id,
              study_year_id: fundsTransfer.study_year_id,
              bank: 'N/A',
              branch: 'N/A',
              created_by_id: id,
              transaction_origin: 'FUNDS TRANSFER',
              system_prn: fundsTransfer.system_prn,
              amount: fundsTransfer.amount_to_transfer,
              unallocated_amount: fundsTransfer.amount_to_transfer,
              payment_date: moment.now(),
              narration: `This Transaction Originates From The Transfer Of Funds From The Account Of ${fundsTransfer.paymentTransaction.student.surname} ${fundsTransfer.paymentTransaction.student.other_names} To This Student's Account`,
              create_approval_status: 'APPROVED',
            };

            await generatePaymentReferenceRecord(
              fundsTransfer.system_prn,
              'CASH',
              fundsTransfer.amount_to_transfer,
              fundsTransfer.recipient_student_id,
              `${fundsTransfer.recipient.surname} ${fundsTransfer.recipient.other_names}`,
              id,
              'FUNDS TRANSFER',
              'N/A',
              transaction
            );

            await paymentTransactionService.updateRecord(
              findTransaction.id,
              giverPaymentTransactionData,
              transaction
            );

            await fundsTransferService.updateFundsTransfer(
              fundsTransfer.id,
              fundsTransferData,
              transaction
            );

            const result =
              await paymentTransactionService.createPaymentTransactionRecord(
                recipientPaymentTransactionData,
                transaction
              );

            results.push(result);
          }
        }
      });

      http.setSuccess(200, 'Funds Transfer approved successfully', {
        data: results,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to approve Funds Transfer.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Get Specific FundsTransfer Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async fetchFundsTransfer(req, res) {
    const { id } = req.params;
    const fundsTransfer = await fundsTransferService.findOneFundsTransfer({
      where: { id },
      ...fundsTransferAttributes(),
    });

    http.setSuccess(200, 'Funds Transfer fetch successful', {
      data: fundsTransfer,
    });

    return http.send(res);
  }

  /**
   * Destroy FundsTransfer Data
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async deleteFundsTransfer(req, res) {
    try {
      const { id } = req.params;

      const fundsTransfer = await fundsTransferService.findOneFundsTransfer({
        where: {
          id,
        },
        ...fundsTransferAttributes(),
        raw: true,
      });

      if (!fundsTransfer) {
        throw new Error(
          `The Funds Transfers You Are Trying To Delete Doesn't Exist.`
        );
      }

      if (fundsTransfer.create_approval_status === 'APPROVED') {
        throw new Error(
          `You Cannot Delete The Funds Transfer Record That Has Already Been Approved.`
        );
      }

      await fundsTransferService.deleteFundsTransfer(id);
      http.setSuccess(200, 'Funds Transfer deleted successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to delete this Funds Transfer.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

const fundsTransferAttributes = function () {
  return {
    include: [
      {
        association: 'recipient',
        attributes: ['id', 'surname', 'other_names'],
      },
      {
        association: 'recipientStdProg',
        attributes: [
          'id',
          'student_id',
          'campus_id',
          'entry_academic_year_id',
          'entry_study_year_id',
          'current_study_year_id',
          'current_semester_id',
          'intake_id',
          'programme_id',
          'programme_version_id',
          'programme_version_plan_id',
          'specialization_id',
          'subject_combination_id',
          'major_subject_id',
          'minor_subject_id',
          'programme_type_id',
          'billing_category_id',
          'fees_waiver_id',
          'is_current_programme',
          'student_number',
          'registration_number',
        ],
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
            include: [
              {
                association: 'programmeStudyYears',
                attributes: [
                  'id',
                  'programme_id',
                  'programme_study_year_id',
                  'programme_study_years',
                ],
              },
            ],
          },
        ],
      },
      {
        association: 'academicYear',
        attributes: ['id', 'academic_year_id'],
        include: [
          {
            association: 'academicYear',
            attributes: ['id', 'metadata_value'],
          },
        ],
      },
      {
        association: 'semester',
        attributes: ['id', 'semester_id'],
        include: [
          {
            association: 'semester',
            attributes: ['id', 'metadata_value'],
          },
        ],
      },
      {
        association: 'paymentTransaction',
        include: [
          {
            association: 'academicYear',
            attributes: ['id', 'academic_year_id'],
            include: [
              {
                association: 'academicYear',
                attributes: ['id', 'metadata_value'],
              },
            ],
          },
          {
            association: 'semester',
            attributes: ['id', 'semester_id'],
            include: [
              {
                association: 'semester',
                attributes: ['id', 'metadata_value'],
              },
            ],
          },
          {
            association: 'student',
            attributes: ['id', 'surname', 'other_names'],
          },
        ],
      },
      {
        association: 'createdBy',
        attributes: ['id', 'surname', 'other_names'],
      },
      {
        association: 'createApprovedBy',
        attributes: ['id', 'surname', 'other_names'],
      },
    ],
  };
};

module.exports = FundsTransferController;
