const { HttpResponse } = require('@helpers');
const UserAgent = require('user-agents');
const {
  previousTransactionsService,
  studentService,
  paymentTransactionService,
} = require('@services/index');
const { isEmpty, now, toUpper, trim } = require('lodash');
const model = require('@models');
const XLSX = require('xlsx');
const formidable = require('formidable');
const excelJs = require('exceljs');
const fs = require('fs');
const { previousTransactionColumns } = require('./templateColumns');
const {
  validateSheetColumns,
} = require('@controllers/Helpers/uploadValidator');
const { Op } = require('sequelize');
const {
  generateSystemReference,
} = require('@controllers/Helpers/paymentReferenceHelper');
const { activityLog, findLocalIpAddress } = require('../Helpers/logsHelper');

const moment = require('moment');

const http = new HttpResponse();

const userAgent = new UserAgent();

const iPv4 = findLocalIpAddress();

class PreviousTransactionsController {
  /**
   *
   * @param {*} req
   * @param {*} res
   */
  async downloadPreviousTransactionsTemplate(req, res) {
    try {
      const { user } = req;

      const workbook = new excelJs.Workbook();

      const rootSheet = workbook.addWorksheet('PREVIOUS TRANSACTIONS');

      rootSheet.properties.defaultColWidth = previousTransactionColumns.length;
      rootSheet.columns = previousTransactionColumns;

      // Column Validations

      // Amount
      rootSheet.dataValidations.add('G2:G1000', {
        type: 'whole',
        operator: 'greaterThan',
        formulae: [0],
        allowBlank: true,
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: `The value must be a whole number`,
        prompt: `The value must be a whole number`,
      });

      rootSheet.dataValidations.add('A2:A1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['"TUITION PAYMENT, PREPAYMENT, UNIVERSAL PAYMENT"'],
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

      const template = `${uploadPath}/download-previous-transactions-template-${
        user.surname
      }-${user.other_names}-${user.id}-${now()}.xlsm`;

      await workbook.xlsx.writeFile(template);
      await res.download(
        template,
        'PREVIOUS-TRANSACTIONS-TEMPLATE.xlsx',
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
  uploadPreviousTransactions(req, res) {
    try {
      const tuitionPaymentsData = [];
      const prePaymentsData = [];
      const universalPaymentsData = [];

      const user = req.user.id;

      const form = new formidable.IncomingForm();

      form.parse(req, async (err, fields, files) => {
        if (err) throw new Error('Unable To Upload Previous Transactions.');

        const file = files[Object.keys(files)[0]];

        if (!file) throw new Error('Please Select A File To Upload.');

        const workbook = XLSX.readFile(file.filepath, { cellDates: true });
        const myTemplate = workbook.SheetNames[0];
        const templateData = XLSX.utils.sheet_to_json(
          workbook.Sheets[myTemplate]
        );

        if (isEmpty(templateData))
          throw new Error('Cannot upload an empty template.');

        let savedRecords = 0;

        const skippedTuitionPayments = [];
        const skippedPrePayments = [];
        const skippedUniversalPayments = [];

        try {
          await model.sequelize.transaction(async (transaction) => {
            for (const row of templateData) {
              if (!row['FULL NAME']) {
                throw new Error(`One Of Your Records Is Missing A Full Name`);
              }

              const errorName = trim(row['FULL NAME']);

              validateSheetColumns(
                row,
                [
                  'TRANSACTION ORIGIN',
                  'FULL NAME',
                  'PAYMENT REFERENCE',
                  'AMOUNT',
                  'BANK',
                  'BRANCH',
                  'TRANSACTION DATE',
                ],
                errorName
              );

              if (
                toUpper(trim(row['TRANSACTION ORIGIN'])) ===
                toUpper(trim('TUITION PAYMENT'))
              ) {
                await handlePreviousTuitionRecords(row, errorName, user)
                  .then((res) => tuitionPaymentsData.push(res))
                  .catch((err) => skippedTuitionPayments.push(err.message));
              } else if (
                toUpper(trim(row['TRANSACTION ORIGIN'])) ===
                toUpper(trim('PREPAYMENT'))
              ) {
                await handlePreviousPrepaymentRecords(row, errorName, user)
                  .then((res) => prePaymentsData.push(res))
                  .catch((err) => skippedPrePayments.push(err.message));
              } else if (
                toUpper(trim(row['TRANSACTION ORIGIN'])) ===
                toUpper(trim('UNIVERSAL PAYMENT'))
              ) {
                await handleUniversalPrepaymentRecords(row, errorName, user)
                  .then((res) => universalPaymentsData.push(res))
                  .catch((err) => skippedUniversalPayments.push(err.message));
              } else {
                throw new Error(
                  `Please Select Transaction Origin as TUITION PAYMENT or PREPAYMENT or UNIVERSAL PAYMENT for ${errorName}`
                );
              }
            }

            if (!isEmpty(tuitionPaymentsData)) {
              savedRecords++;
              for (const item of tuitionPaymentsData) {
                await previousTransactionsService.createPreviousTuitionRecords(
                  item,
                  transaction
                );
              }
            } else if (!isEmpty(prePaymentsData)) {
              savedRecords++;
              for (const item of prePaymentsData) {
                await previousTransactionsService.createPreviousPrepaymentRecords(
                  item,
                  transaction
                );
              }
            } else if (!isEmpty(universalPaymentsData)) {
              savedRecords++;
              for (const item of universalPaymentsData) {
                await previousTransactionsService.createPreviousUniversalPaymentRecords(
                  item,
                  transaction
                );
              }
            }
          });

          http.setSuccess(
            200,
            `Successfully Uploaded: ${savedRecords} Transactions, Rejected Tuition Payments: ${skippedTuitionPayments.length}, Universal Payments: ${skippedUniversalPayments.length}, PrePayments: ${skippedPrePayments.length}`,
            {
              skippedPrePayments,
              skippedUniversalPayments,
              skippedTuitionPayments,
            }
          );

          return http.send(res);
        } catch (error) {
          http.setError(400, 'Unable To Upload Previous Transactions.', {
            error: { message: error.message },
          });

          return http.send(res);
        }
      });
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
  async deletePreviousTuition(req, res) {
    try {
      const data = req.body;

      if (isEmpty(data.data_to_delete))
        throw new Error(
          `Select atleast One Previous Tuition Record to Delete.`
        );

      await model.sequelize.transaction(async (transaction) => {
        for (const id of data.data_to_delete) {
          const [findRecord] =
            await previousTransactionsService.findOnePreviousTuitionPayment(id);

          if (!findRecord) {
            throw new Error(
              `Unable To Find One Of the Previous Deposit Records.`
            );
          }

          if (findRecord.is_pushed_to_deposit) {
            throw new Error(
              `One Of The Student Deposits Has Already Been Pushed To Student's Account.`
            );
          }

          await previousTransactionsService.deleteMigratedTuitionPayment(
            id,
            transaction
          );
        }
      });

      http.setSuccess(
        200,
        'Migrated Previous Tuition Deposit(s) Deleted Successfully.'
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable To Delete Migrated Previous Tuition Deposits.',
        {
          error: { message: error.message },
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
  async deletePreviousPrePayments(req, res) {
    try {
      const data = req.body;

      if (isEmpty(data.data_to_delete))
        throw new Error(
          `Select atleast One Previous Tuition Record to Delete.`
        );

      await model.sequelize.transaction(async (transaction) => {
        for (const id of data.data_to_delete) {
          const [findRecord] =
            await previousTransactionsService.findOnePreviousPrePayment(id);

          if (!findRecord) {
            throw new Error(
              `Unable To Find One Of the Previous Pre-Payment Records.`
            );
          }

          if (findRecord.is_pushed_to_account) {
            throw new Error(
              `One Of The Student Pre-Payment Has Already Been Pushed To Student's Account.`
            );
          }

          await previousTransactionsService.deleteMigratedPrePayment(
            id,
            transaction
          );
        }
      });

      http.setSuccess(
        200,
        'Migrated Previous Pre-Payment Deposit(s) Deleted Successfully.'
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable To Delete Migrated Previous Pre-Payment Deposits.',
        {
          error: { message: error.message },
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
  async pushSinglePreviousStudentAccount(req, res) {
    try {
      const data = {};
      const {
        requests: [{ amount, deposit_id: id }],
      } = req.body;
      const { id: user } = req.user;

      data.created_by_id = user;
      data.transaction_origin = 'PREVIOUS STUDENT DEPOSIT';

      let result = {};

      await model.sequelize.transaction(async (transaction) => {
        const findRecord = await previousTransactionsService
          .findOnePreviousStudentDeposit({
            where: {
              id,
            },
            include: [
              {
                association: 'studentProgramme',
                include: [
                  {
                    association: 'student',
                  },
                ],
              },
            ],
            nest: true,
          })
          .then((res) => {
            if (res) {
              return res.toJSON();
            }
          });

        if (!findRecord) {
          throw new Error(`Unable To Find the Prepayment Records.`);
        }

        if (!findRecord.studentProgramme) {
          throw new Error(
            `Unable To Find An Academic Record For The Student Deposits.`
          );
        }

        if (findRecord.is_pushed_to_account === true) {
          throw new Error(
            `The Student Deposit Has Already Been Pushed To Student's Account.`
          );
        }

        data.ura_prn = findRecord.transaction_reference
          ? findRecord.transaction_reference
          : '';
        data.system_prn = generateSystemReference('PSD');
        data.unallocated_amount = amount;
        data.amount = amount;
        data.currency = 'UGX';
        data.create_approval_status = 'APPROVED';
        data.bank = findRecord.bank ? findRecord.bank : 'N/A';
        data.branch = findRecord.branch ? findRecord.branch : 'N/A';
        data.student_id = findRecord.studentProgramme.student_id;
        data.student_programme_id = findRecord.studentProgramme.id;
        data.payment_date = findRecord.payment_date
          ? findRecord.payment_date
          : 'N/A';
        data.narration = `Previous Transaction Record Paid By ${findRecord.entity_name}`;

        result = await paymentTransactionService.createPaymentTransactionRecord(
          data,
          transaction
        );

        await activityLog(
          'createEnrollmentAndRegistrationLog',
          user,
          'MIGRATED PAYMENTS',
          'APPROVE PREVIOUS STUDENT DEPOSITS',
          `Deposit For Student: ${
            findRecord.studentProgramme.student.surname
          } ${
            findRecord.studentProgramme.student.other_names
          } Of Amount: ${parseFloat(findRecord.amount).toLocaleString()}.`,
          `N/A`,
          result.dataValues.id,
          `paymentTransaction`,
          `iPv4-${iPv4}, hostIp-${req.ip}`,
          userAgent.data,
          null,
          transaction
        );

        await previousTransactionsService.updatePreviousStudentDeposit(
          id,
          {
            last_updated_by_id: user,
            is_pushed_to_account: true,
            amount_transferred: amount,
            create_approval_status: 'APPROVED',
          },
          transaction
        );
      });

      http.setSuccess(
        200,
        'Prepayment Deposit Pushed To Students Account Successfully.',
        {
          data: result,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable To Push Previous Deposits To Students Account.',
        {
          error: { message: error.message },
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
  async pushPreviousStudentDepositsAccount(req, res) {
    try {
      const data = req.body;
      const { id: user } = req.user;

      data.created_by_id = user;
      data.transaction_origin = 'PREVIOUS STUDENT DEPOSIT';

      const pushedTransactions = [];

      if (!isEmpty(data.previous_deposits)) {
        await model.sequelize.transaction(async (transaction) => {
          for (const id of data.previous_deposits) {
            const findRecord = await previousTransactionsService
              .findOnePreviousStudentDeposit({
                where: {
                  id,
                },
                include: [
                  {
                    association: 'studentProgramme',
                    include: [
                      {
                        association: 'student',
                      },
                    ],
                  },
                ],
                nest: true,
              })
              .then((res) => {
                if (res) {
                  return res.toJSON();
                }
              });

            if (!findRecord) {
              throw new Error(
                `Unable To Find One Of the Previous Deposit Records.`
              );
            }

            if (!findRecord.studentProgramme) {
              throw new Error(
                `Unable To Find An Academic Record For One Of The Student Deposits.`
              );
            }

            if (findRecord.is_pushed_to_account === true) {
              throw new Error(
                `One Of The Student Deposits Has Already Been Pushed To Student's Account.`
              );
            }

            data.ura_prn = findRecord.transaction_reference
              ? findRecord.transaction_reference
              : '';
            data.system_prn = generateSystemReference('PSD');
            data.unallocated_amount = findRecord.amount;
            data.amount = findRecord.amount;
            data.currency = 'UGX';
            data.create_approval_status = 'APPROVED';
            data.bank = findRecord.bank ? findRecord.bank : 'N/A';
            data.branch = findRecord.branch ? findRecord.branch : 'N/A';
            data.student_id = findRecord.studentProgramme.student_id;
            data.student_programme_id = findRecord.studentProgramme.id;
            data.payment_date = findRecord.payment_date
              ? findRecord.payment_date
              : 'N/A';
            data.narration = `Previous Transaction Record Paid By ${findRecord.entity_name}`;

            const result =
              await paymentTransactionService.createPaymentTransactionRecord(
                data,
                transaction
              );

            await activityLog(
              'createEnrollmentAndRegistrationLog',
              user,
              'MIGRATED PAYMENTS',
              'APPROVE PREVIOUS STUDENT DEPOSITS',
              `Deposit For Student: ${
                findRecord.studentProgramme.student.surname
              } ${
                findRecord.studentProgramme.student.other_names
              } Of Amount: ${parseFloat(findRecord.amount).toLocaleString()}.`,
              `N/A`,
              result.dataValues.id,
              `paymentTransaction`,
              `iPv4-${iPv4}, hostIp-${req.ip}`,
              userAgent.data,
              transaction
            );

            await previousTransactionsService.updatePreviousStudentDeposit(
              id,
              {
                is_pushed_to_account: true,
                create_approval_status: 'APPROVED',
              },
              transaction
            );

            pushedTransactions.push(result);
          }
        });
      }

      http.setSuccess(
        200,
        'Previous Deposits Pushed To Students Account Successfully.',
        {
          data: pushedTransactions,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable To Push Previous Deposits To Students Account.',
        {
          error: { message: error.message },
        }
      );

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async studentPreviousDeposits(req, res) {
    try {
      if (!req.query.student_number) {
        throw new Error('Invalid Context Provided');
      }

      const student = req.query.student_number;

      const studentProgramme = await studentService
        .findOneStudentProgramme({
          where: {
            [Op.or]: [
              { student_number: student },
              { registration_number: student },
            ],
          },
          attributes: [
            'id',
            'student_id',
            'campus_id',
            'registration_number',
            'student_number',
            'programme_id',
            'programme_version_id',
            'is_current_programme',
          ],
          nest: true,
        })

        .then(function (res) {
          if (res) {
            const result = res.toJSON();

            return result;
          }
        });

      if (!studentProgramme) {
        throw new Error('Academic Record Does Not Exist.');
      }

      const context = studentProgramme;

      const data = await previousTransactionsService.previousStudentDeposits(
        context
      );

      http.setSuccess(200, 'Student Migrated Payments fetched successfully', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to  fetch Student Migrated Payments.', {
        error: { error: error.message },
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
  async previousStudentTransactions(req, res) {
    try {
      if (!req.query.student_number) {
        throw new Error('Invalid Context Provided');
      }
      const context = req.query;

      const data =
        await previousTransactionsService.previousStudentTransactions(context);

      http.setSuccess(200, 'Student Migrated Payments fetched successfully', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to  fetch Student  Migrated Payments.', {
        error: { error: error.message },
      });

      return http.send(res);
    }
  }
  //  previousUniPayments

  async previousUniPayments(req, res) {
    try {
      if (!req.query.from_date || !req.query.to_date) {
        throw new Error('Invalid Context Provided');
      }
      const context = req.query;

      const data = await previousTransactionsService.previousUniPayments(
        context
      );

      http.setSuccess(
        200,
        'Universal Migrated Transactions fetched successfully',
        {
          data,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to fetch Universal Migrated Transactions.', {
        error: { error: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   * @returns
   *
   */
  async previousTransactions(req, res) {
    try {
      if (!req.params.id) {
        throw new Error('Invalid Context Provided');
      }
      const { id } = req.params;

      const studentProgramme = await studentService
        .findOneStudentProgramme({
          where: {
            id,
          },
          attributes: [
            'id',
            'student_id',
            'campus_id',
            'registration_number',
            'student_number',
            'programme_id',
            'programme_version_id',
            'is_current_programme',
          ],
          nest: true,
        })

        .then(function (res) {
          if (res) {
            const result = res.toJSON();

            return result;
          }
        });

      if (!studentProgramme) {
        throw new Error('Academic Record Does Not Exist.');
      }

      const context = studentProgramme;

      const data =
        await previousTransactionsService.previousStudentTransactions(context);

      http.setSuccess(200, 'Student Migrated Payments fetched successfully', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to  fetch Student Migrated Payments.', {
        error: { error: error.message },
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
  async previousDeposits(req, res) {
    try {
      if (!req.params.id) {
        throw new Error('Invalid Context Provided');
      }
      const { id } = req.params;

      const studentProgramme = await studentService
        .findOneStudentProgramme({
          where: {
            id,
          },
          attributes: [
            'id',
            'student_id',
            'campus_id',
            'registration_number',
            'student_number',
            'programme_id',
            'programme_version_id',
            'is_current_programme',
          ],
          nest: true,
        })

        .then(function (res) {
          if (res) {
            const result = res.toJSON();

            return result;
          }
        });

      if (!studentProgramme) {
        throw new Error('Academic Record Does Not Exist.');
      }

      const context = studentProgramme;

      const data = await previousTransactionsService.previousStudentDeposits(
        context
      );

      http.setSuccess(
        200,
        'Student Migrated fees Deposits fetched successfully',
        {
          data,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to  fetch Student Migrated Fees Deposits.', {
        error: { error: error.message },
      });

      return http.send(res);
    }
  }

  // Single Tuition Deposits Transfer
  async transferSingleTuitionToDeposit(req, res) {
    try {
      if (!req.body.requests || !req.body.studentNumber) {
        throw new Error('Invalid Context Provided');
      }
      const { id } = req.user;

      const {
        requests: [{ amount, deposit_id: depositId }],
      } = req.body;

      let insertedRecord = {};

      await model.sequelize.transaction(async (transaction) => {
        const previousTuition = await previousTransactionsService
          .findOnePreviousStudentTuition({
            where: {
              id: depositId,
              student_number: req.body.studentNumber,
              is_pushed_to_deposit: false,
            },
            nest: true,
          })
          .then(function (res) {
            if (res) {
              const result = res.toJSON();

              return result;
            }
          });

        if (!previousTuition) {
          throw new Error(
            'On of the Records Does Not Exist Or Has Already been Pushed.'
          );
        }
        const insertData = {
          payment_date: previousTuition.payment_date,
          student_number: previousTuition.student_number,
          student_programme_id: previousTuition.student_programme_id,
          transaction_reference: previousTuition.transaction_reference,
          entity_name: previousTuition.entity_name,
          amount: parseInt(amount, 10),
          bank: previousTuition.bank,
          branch: previousTuition.branch,
          created_by_id: parseInt(id, 10),
        };

        const response = await model.sequelize.transaction(
          async (transaction) => {
            const result =
              await previousTransactionsService.createPreviousStudentDeposit(
                insertData,
                transaction
              );

            return result;
          }
        );

        // Update Tuition
        const updateTuitionData = await model.sequelize.transaction(
          async (transaction) => {
            const updateTuition =
              await previousTransactionsService.updatePreviousTuitionRecord(
                previousTuition.id,
                {
                  last_updated_by_id: parseInt(id, 10),
                  update_at: moment.now(),
                  amount_transferred: amount,
                  is_pushed_to_deposit: true,
                },
                transaction
              );

            return updateTuition;
          }
        );

        insertedRecord = { updateTuitionData, response };
      });

      http.setSuccess(200, 'Previous Tuition Transferred  successfully', {
        insertedRecord,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to Transfer Student Payment.', {
        error: { error: error.message },
      });

      return http.send(res);
    }
  }

  // previous fees deposits transfer

  async transferTuitionToDeposit(req, res) {
    try {
      if (!req.body.requests || !req.body.studentNumber) {
        throw new Error('Invalid Context Provided');
      }
      const { id } = req.user;

      const data = req.body;

      let insertedRecord = {};
      // previous_student_payments

      //  requests

      await model.sequelize.transaction(async (transaction) => {
        for (const eachObject of data.requests) {
          const previousTuition = await previousTransactionsService
            .findOnePreviousStudentTuition({
              where: {
                id: eachObject,
                student_number: req.body.studentNumber,
                is_pushed_to_deposit: false,
              },

              nest: true,
            })

            .then(function (res) {
              if (res) {
                const result = res.toJSON();

                return result;
              }
            });

          if (!previousTuition) {
            throw new Error(
              'On of the Records Does Not Exist Or Has Already been Pushed.'
            );
          }
          const insertData = {
            payment_date: previousTuition.payment_date,
            student_number: previousTuition.student_number,
            student_programme_id: previousTuition.student_programme_id,
            transaction_reference: previousTuition.transaction_reference,
            entity_name: previousTuition.entity_name,
            amount: previousTuition.amount,
            bank: previousTuition.bank,
            branch: previousTuition.branch,
            created_by_id: parseInt(id, 10),
          };

          const response = await model.sequelize.transaction(
            async (transaction) => {
              const result =
                await previousTransactionsService.createPreviousStudentDeposit(
                  insertData,
                  transaction
                );

              return result;
            }
          );
          const updateTuitionData = await model.sequelize.transaction(
            async (transaction) => {
              const updateTuition =
                await previousTransactionsService.updatePreviousTuitionRecord(
                  previousTuition.id,
                  {
                    last_updated_by_id: parseInt(id, 10),
                    update_at: moment.now(),
                    is_pushed_to_deposit: true,
                  },
                  transaction
                );

              return updateTuition;
            }
          );

          insertedRecord = { updateTuitionData, response };
        }
      });

      http.setSuccess(200, 'Previous Tuition Transferred  successfully', {
        insertedRecord,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to Transfer Student Payment.', {
        error: { error: error.message },
      });

      return http.send(res);
    }
  }
}

/**
 *
 * @param {*} row
 * @param {*} errorName
 * @param {*} user
 */
const handlePreviousTuitionRecords = async (row, errorName, user) => {
  const data = {};

  data.created_by_id = user;

  if (!row['STUDENT NUMBER']) {
    throw new Error(`Provide Student Number For ${errorName}`);
  }

  const student = await identifyStudent(
    row['STUDENT NUMBER'],
    row['FULL NAME'],
    errorName
  );

  data.student_programme_id = student.student_programme_id;
  data.payment_date = trim(row['TRANSACTION DATE']);
  data.student_number = trim(row['STUDENT NUMBER']);
  data.transaction_reference = trim(row['PAYMENT REFERENCE']);
  data.entity_name = trim(row['FULL NAME']);
  data.amount = trim(row.AMOUNT);
  data.bank = toUpper(trim(row.BANK));
  data.branch = toUpper(trim(row.BRANCH));

  return data;
};

/**
 *
 * @param {*} row
 * @param {*} errorName
 * @param {*} user
 */
const handlePreviousPrepaymentRecords = async (row, errorName, user) => {
  const data = {};

  data.created_by_id = user;

  if (!row['STUDENT NUMBER']) {
    throw new Error(`Provide Student Number For ${errorName}`);
  }

  const student = await identifyStudent(
    row['STUDENT NUMBER'],
    row['FULL NAME'],
    errorName
  );

  data.student_programme_id = student.student_programme_id;
  data.payment_date = trim(row['TRANSACTION DATE']);
  data.student_number = trim(row['STUDENT NUMBER']);
  data.transaction_reference = trim(row['PAYMENT REFERENCE']);
  data.entity_name = trim(row['FULL NAME']);
  data.amount = trim(row.AMOUNT);
  data.bank = toUpper(trim(row.BANK));
  data.branch = toUpper(trim(row.BRANCH));

  return data;
};

/**
 *
 * @param {*} row
 * @param {*} errorName
 * @param {*} user
 */
const handleUniversalPrepaymentRecords = (row, errorName, user) => {
  const data = {};

  data.created_by_id = user;

  if (!row.PHONE || !row.EMAIL) {
    throw new Error(`Provide A Phone Number Or Email For ${errorName}.`);
  }

  data.payment_date = trim(row['TRANSACTION DATE']);
  data.phone = trim(row.PHONE);
  data.email = trim(row.EMAIL);
  data.entity_name = trim(row['FULL NAME']);
  data.transaction_reference = trim(row['PAYMENT REFERENCE']);
  data.amount = trim(row.AMOUNT);
  data.bank = toUpper(trim(row.BANK));
  data.branch = toUpper(trim(row.BRANCH));

  return data;
};

/**
 *
 * @param {*} studentNumber
 */
const identifyStudent = async (studentNumber, fullName, errorName) => {
  const studentProgramme = await studentService
    .findOneStudentProgramme({
      where: {
        student_number: trim(studentNumber),
      },
      attributes: [
        'id',
        'student_id',
        'campus_id',
        'registration_number',
        'student_number',
        'programme_id',
        'programme_version_id',
        'is_current_programme',
      ],
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

  if (!studentProgramme) {
    throw new Error(
      `Invalid Student Number: ${studentNumber} for: ${errorName}.`
    );
  }

  const compareSurname = toUpper(trim(fullName)).includes(
    toUpper(trim(studentProgramme.student.surname))
  );
  const compareOtherNames = toUpper(trim(fullName)).includes(
    toUpper(trim(studentProgramme.student.other_names))
  );

  if (compareSurname === true || compareOtherNames === true) {
    return {
      student_programme_id: studentProgramme.id,
      fullName: toUpper(
        `${studentProgramme.student.surname} ${studentProgramme.student.other_names}`
      ),
    };
  } else {
    throw new Error(
      `Mismatching Names Found On Record ${errorName}. The System Found Student Number: ${studentNumber} Belonging To ${studentProgramme.student.surname} ${studentProgramme.student.other_names}`
    );
  }
};

module.exports = PreviousTransactionsController;
