const models = require('@models');
const { QueryTypes } = require('sequelize');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');
const { isEmpty } = require('lodash');
const { Op } = require('sequelize');

// This Class is responsible for handling all database interactions for a runningAdmissionApplicant
class PreviousTransactionsService {
  /**
   *
   * @param {*} options
   * @returns
   */
  static async findAllPreviousEnrollmentRecord(options) {
    try {
      const result = await models.PreviousEnrollmentRecord.findAll({
        ...options,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `previousTransactions.service.js`,
        `findAllPreviousEnrollmentRecord`,
        `GET`
      );
    }
  }

  /**
   * @param {string} id  id of record object to be fetched
   * @returns {Promise}
   * @description fetches a single record object
   *@
   */
  static async findOnePreviousTuitionPayment(value) {
    try {
      const filtered = await models.sequelize.query(
        `SELECT * FROM universal_payments_mgt.previous_student_payments where id ='${value}'`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `previousTransactions.service.js`,
        `findOnePreviousTuitionPayment`,
        `GET`
      );
    }
  }

  /**
   * @param {string} id  id of record object to be deleted
   * @returns {Promise}
   * @description deletes a single record object
   *@
   */
  static async deleteMigratedTuitionPayment(id, transaction) {
    try {
      await models.PreviousStudentPayment.destroy({
        where: { id },
        transaction,
      });
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `previousTransactions.service.js`,
        `deleteMigratedTuitionPayment`,
        `DELETE`
      );
    }
  }

  /**
   * @param {string} id  id of record object to be fetched
   * @returns {Promise}
   * @description fetches a single record object
   *@
   */
  static async findOnePreviousPrePayment(value) {
    try {
      const filtered = await models.sequelize.query(
        `SELECT * FROM universal_payments_mgt.previous_student_deposits where id ='${value}'`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `previousTransactions.service.js`,
        `findOnePreviousPrePayment`,
        `GET`
      );
    }
  }

  /**
   * @param {string} id  id of record object to be deleted
   * @returns {Promise}
   * @description deletes a single record object
   *@
   */
  static async deleteMigratedPrePayment(id, transaction) {
    try {
      await models.PreviousStudentDeposit.destroy({
        where: { id },
        transaction,
      });
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `previousTransactions.service.js`,
        `deleteMigratedPrePayment`,
        `DELETE`
      );
    }
  }

  /**
   *
   * @param {*} options
   * @returns
   */
  static async findOnePreviousEnrollmentRecord(options) {
    try {
      const result = await models.PreviousEnrollmentRecord.findOne({
        ...options,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `previousTransactions.service.js`,
        `findOnePreviousEnrollmentRecord`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} options
   * @returns
   */
  static async findOnePreviousStudentDeposit(options) {
    try {
      const result = await models.PreviousStudentDeposit.findOne({
        ...options,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `previousTransactions.service.js`,
        `findOnePreviousStudentDeposit`,
        `GET`
      );
    }
  }

  // findOnePreviousStudentTuition
  static async findOnePreviousStudentTuition(options) {
    try {
      const result = await models.PreviousStudentPayment.findOne({
        ...options,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `previousTransactions.service.js`,
        `findOnePreviousStudentTuition`,
        `GET`
      );
    }
  }

  // Create Prepayment
  static async createPreviousStudentDeposit(data, transaction) {
    try {
      const record = await models.PreviousStudentDeposit.create(data, {
        transaction,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `previousTransactions.service.js`,
        `createPreviousStudentDeposit`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of record object to be updated
   * @returns {Promise}
   * @description updates a single record object
   *@
   */
  static async updatePreviousStudentDeposit(id, data, transaction) {
    try {
      // const record = await models.PreviousStudentDeposit.update(
      //   { ...data },
      //   { where: { id }, transaction, returning: true }
      // );

      const record = await models.sequelize.query(
        `update
        universal_payments_mgt.previous_student_deposits
        set 
        last_updated_by_id = ${data.last_updated_by_id},
        amount_transferred = ${data.amount_transferred},
        create_approval_status = 'APPROVED',
        is_pushed_to_account = true
        where id = ${id}
         `,
        {
          type: QueryTypes.SELECT,
          transaction,
          raw: true,
        }
      );

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `previousTransactions.service.js`,
        `updatePreviousStudentDeposit`,
        `GET`
      );
    }
  }

  // update tuition
  static async updatePreviousTuitionRecord(id, data, transaction) {
    try {
      // const filtered = await models.PreviousStudentPayment.update(
      //   { ...data },
      //   { where: { id }, transaction, returning: true }
      // );

      const filtered = await models.sequelize.query(
        `update
        universal_payments_mgt.previous_student_payments
        set
        last_updated_by_id = ${data.last_updated_by_id},
        amount_transferred = ${data.amount_transferred},
        is_pushed_to_deposit = true
        where id = ${id}
         `,
        {
          type: QueryTypes.SELECT,
          transaction,
          raw: true,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `previousTransactions.service.js`,
        `updatePreviousTuitionRecord`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description
   *@
   */
  static async createPreviousEnrollmentRecord(data, transaction) {
    try {
      const result = await models.PreviousEnrollmentRecord.findOrCreate({
        where: {
          student_programme_id: data.student_programme_id,
          academic_year_id: data.academic_year_id,
          study_year_id: data.study_year_id,
          semester_id: data.semester_id,
        },
        defaults: {
          ...data,
        },
        include: [
          {
            association: models.PreviousEnrollmentRecord.otherFees,
          },
        ],
        transaction,
      });

      if (result[1] === false && !isEmpty(data.otherFees)) {
        for (const item of data.otherFees) {
          item.migrated_record_id = result[0].dataValues.id;

          await models.PreviousEnrollmentRecordOtherFees.findOrCreate({
            where: {
              other_invoice_no: item.other_invoice_no,
            },
            defaults: {
              ...item,
            },
            transaction,
          });

          // if (prevOther[1] === false) {
          //   throw new Error(
          //     `You already Have A Previous Other Fees Record With Invoice Number: ${prevOther[0].other_invoice_no}`
          //   );
          // }
        }
      }

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `previousTransactions.service.js`,
        `createPreviousEnrollmentRecord`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description
   *@
   */
  static async migratePreviousOtherFeesInvoices(transaction) {
    try {
      const result = await models.PreviousEnrollmentRecord.findAll({
        where: {
          is_billed: false,
          other_invoice_no: {
            [Op.ne]: null,
          },
        },
        raw: true,
      });

      const size = 500;

      const items = result.slice(0, size);

      if (!isEmpty(items)) {
        for (const item of items) {
          const prevOther =
            await models.PreviousEnrollmentRecordOtherFees.findOrCreate({
              where: {
                other_invoice_no: item.other_invoice_no,
              },
              defaults: {
                migrated_record_id: item.id,
                other_invoice_no: item.other_invoice_no,
                other_amount: item.other_amount,
                other_credit: item.other_credit ? item.other_credit : 0,
                other_paid: item.other_paid,
                other_balance_due: item.other_balance_due,
                other_fees_narration: item.other_fees_narration,
                total_bill: item.other_amount,
                total_credit: item.other_credit ? item.other_credit : 0,
                total_paid: item.other_paid,
                total_due: item.other_balance_due,
              },
              transaction,
            });

          if (prevOther[1] === false) {
            throw new Error(
              `You already Have A Previous Other Fees Record With Invoice Number: ${prevOther[0].other_invoice_no}`
            );
          }

          const newTotalBill =
            parseFloat(item.total_bill) - parseFloat(item.other_amount);

          const newTotalCredit =
            parseFloat(item.total_credit) > 0
              ? parseFloat(item.total_credit) - parseFloat(item.other_credit)
              : 0;

          const newTotalPaid =
            parseFloat(item.total_paid) - parseFloat(item.other_paid);

          const newTotalDue =
            parseFloat(item.total_due) - parseFloat(item.other_balance_due);

          await models.PreviousEnrollmentRecord.update(
            {
              other_invoice_no: null,
              other_amount: null,
              other_paid: null,
              other_credit: null,
              other_balance_due: null,
              other_fees_narration: null,
              total_bill: newTotalBill,
              total_credit: newTotalCredit,
              total_paid: newTotalPaid,
              total_due: newTotalDue,
            },
            { where: { id: item.id }, transaction, returning: true }
          );
        }
      } else {
        throw new Error(`There are no more records to migrate`);
      }
    } catch (error) {
      throw new Error(error.message);
    }
  }

  /**
   * @param {string} id  id of record object to be fetched
   * @returns {Promise}
   * @description fetches a single record object
   *@
   */
  static async fixUnbilledDuplicatesInPreviousPayments(transaction) {
    try {
      const filtered = await models.sequelize.query(
        `
        SELECT
student_programme_id, academic_year_id, study_year_id, semester_id, tuition_invoice_no, functional_invoice_no, COUNT(*)
FROM 
students_data.migrated_enrollments_records 
GROUP BY student_programme_id, academic_year_id, study_year_id, semester_id, tuition_invoice_no, functional_invoice_no
HAVING COUNT(*) > 1
        `,
        {
          type: QueryTypes.SELECT,
        }
      );

      const bulkDelete = [];

      if (!isEmpty(filtered)) {
        for (const item of filtered) {
          const results = await models.PreviousEnrollmentRecord.findAll({
            where: {
              student_programme_id: item.student_programme_id,
              academic_year_id: item.academic_year_id,
              study_year_id: item.study_year_id,
              semester_id: item.semester_id,
              is_billed: false,
            },
            include: [
              {
                association: 'otherFees',
              },
              {
                association: 'studentProgramme',
                attributes: ['id', 'student_number'],
              },
            ],
          }).then((res) => {
            if (res) {
              return res.map((item) => item.get({ plain: true }));
            }
          });

          if (!isEmpty(results)) {
            const findRecordsWithOtherFees = results.filter(
              (result) => !isEmpty(result.otherFees)
            );

            if (!isEmpty(findRecordsWithOtherFees)) {
              if (findRecordsWithOtherFees.length <= 1) {
                const index = results.indexOf(findRecordsWithOtherFees[0]);

                if (index > -1) {
                  results.splice(index, 1);
                }

                if (!isEmpty(results)) {
                  results.forEach((result) => {
                    bulkDelete.push(result.id);
                  });
                }
              } else {
                // Has multiple Other Fees
                const otherFeesIndex = findRecordsWithOtherFees.indexOf(
                  findRecordsWithOtherFees[0]
                );

                const migratedRecordId = findRecordsWithOtherFees[0].id;

                if (otherFeesIndex > -1) {
                  findRecordsWithOtherFees.splice(otherFeesIndex, 1);
                }
                for (const record of findRecordsWithOtherFees) {
                  for (const item of record.otherFees) {
                    await models.PreviousEnrollmentRecordOtherFees.update(
                      { migrated_record_id: migratedRecordId },
                      { where: { id: item.id }, transaction, returning: true }
                    );
                  }
                }

                findRecordsWithOtherFees.forEach((result) => {
                  bulkDelete.push(result.id);
                });
              }
            } else {
              const index = results.indexOf(results[0]);

              if (index > -1) {
                results.splice(index, 1);
              }

              if (!isEmpty(results)) {
                results.forEach((result) => {
                  bulkDelete.push(result.id);
                });
              }
            }
          }
        }
      }

      await models.PreviousEnrollmentRecord.destroy({
        where: { id: bulkDelete },
        transaction,
      });

      return bulkDelete;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `previousTransactions.service.js`,
        `fixUnbilledDuplicatesInPreviousPayments`,
        `GET`
      );
    }
  }

  /**
   * @param {string} id  id of record object to be fetched
   * @returns {Promise}
   * @description fetches a single record object
   *@
   */
  static async fixBilledDuplicatesInPreviousPayments(transaction) {
    try {
      const filtered = await models.sequelize.query(
        `
        SELECT
student_programme_id, academic_year_id, study_year_id, semester_id, tuition_invoice_no, functional_invoice_no, COUNT(*)
FROM 
students_data.migrated_enrollments_records 
GROUP BY student_programme_id, academic_year_id, study_year_id, semester_id, tuition_invoice_no, functional_invoice_no
HAVING COUNT(*) > 1
        `,
        {
          type: QueryTypes.SELECT,
        }
      );

      const allDuplicateBilledInvoices = await models.sequelize.query(
        `
        SELECT
student_programme_id, academic_year_id, study_year_id, semester_id, description, COUNT(*)
FROM 
enrollment_and_registration_mgt.enrollment_manual_invoices 
GROUP BY student_programme_id, academic_year_id, study_year_id, semester_id, description
HAVING COUNT(*) > 1
        `,
        {
          type: QueryTypes.SELECT,
        }
      );

      const bulkDelete = [];

      if (!isEmpty(filtered)) {
        for (const item of filtered) {
          const results = await models.PreviousEnrollmentRecord.findAll({
            where: {
              student_programme_id: item.student_programme_id,
              academic_year_id: item.academic_year_id,
              study_year_id: item.study_year_id,
              semester_id: item.semester_id,
              is_billed: true,
            },
            include: [
              {
                association: 'otherFees',
              },
              {
                association: 'studentProgramme',
                attributes: ['id', 'student_number'],
              },
            ],
          }).then((res) => {
            if (res) {
              return res.map((item) => item.get({ plain: true }));
            }
          });

          if (!isEmpty(results)) {
            if (results.length > 1) {
              const findRecordsWithOtherFees = results.filter(
                (result) => !isEmpty(result.otherFees)
              );

              if (!isEmpty(findRecordsWithOtherFees)) {
                if (findRecordsWithOtherFees.length <= 1) {
                  const index = results.indexOf(findRecordsWithOtherFees[0]);

                  if (index > -1) {
                    results.splice(index, 1);
                  }

                  if (!isEmpty(results)) {
                    results.forEach((result) => {
                      bulkDelete.push(result.id);
                    });
                  }
                } else {
                  // Has multiple Other Fees
                  const otherFeesIndex = findRecordsWithOtherFees.indexOf(
                    findRecordsWithOtherFees[0]
                  );

                  const migratedRecordId = findRecordsWithOtherFees[0].id;

                  if (otherFeesIndex > -1) {
                    findRecordsWithOtherFees.splice(otherFeesIndex, 1);
                  }
                  for (const record of findRecordsWithOtherFees) {
                    for (const item of record.otherFees) {
                      await models.PreviousEnrollmentRecordOtherFees.update(
                        { migrated_record_id: migratedRecordId },
                        {
                          where: { id: item.id },
                          transaction,
                          returning: true,
                        }
                      );
                    }
                  }

                  findRecordsWithOtherFees.forEach((result) => {
                    bulkDelete.push(result.id);
                  });
                }
              } else {
                const index = results.indexOf(results[0]);

                if (index > -1) {
                  results.splice(index, 1);
                }

                if (!isEmpty(results)) {
                  results.forEach((result) => {
                    bulkDelete.push(result.id);
                  });
                }
              }

              if (!isEmpty(allDuplicateBilledInvoices)) {
                const duplicatesByStudent = allDuplicateBilledInvoices.filter(
                  (dup) =>
                    parseInt(dup.student_programme_id, 10) ===
                    parseInt(item.student_programme_id, 10)
                );

                if (!isEmpty(duplicatesByStudent)) {
                  const duplicateInvoicesToDelete = [];

                  for (const record of duplicatesByStudent) {
                    const findAllInvoices =
                      await models.EnrollmentManualInvoice.findAll({
                        where: {
                          student_programme_id: record.student_programme_id,
                          academic_year_id: record.academic_year_id,
                          study_year_id: record.study_year_id,
                          semester_id: record.semester_id,
                          description: record.description,
                        },
                        raw: true,
                      });

                    const invoiceIndex = findAllInvoices.indexOf(
                      findAllInvoices[0]
                    );

                    if (invoiceIndex > -1) {
                      findAllInvoices.splice(invoiceIndex, 1);
                    }

                    if (!isEmpty(findAllInvoices)) {
                      findAllInvoices.forEach((invoice) => {
                        duplicateInvoicesToDelete.push(invoice.id);
                      });
                    }
                  }

                  await models.EnrollmentManualInvoice.destroy({
                    where: { id: duplicateInvoicesToDelete },
                    transaction,
                  });
                }
              }
            } else {
              for (const item of results) {
                const findUnBilledDoubles =
                  await models.PreviousEnrollmentRecord.findAll({
                    where: {
                      student_programme_id: item.student_programme_id,
                      academic_year_id: item.academic_year_id,
                      study_year_id: item.study_year_id,
                      semester_id: item.semester_id,
                      is_billed: false,
                    },
                    include: [
                      {
                        association: 'otherFees',
                      },
                      {
                        association: 'studentProgramme',
                        attributes: ['id', 'student_number'],
                      },
                    ],
                  }).then((res) => {
                    if (res) {
                      return res.map((item) => item.get({ plain: true }));
                    }
                  });

                findUnBilledDoubles.forEach((double) => {
                  bulkDelete.push(double.id);
                });
              }
            }
          }
        }
      }

      await models.PreviousEnrollmentRecord.destroy({
        where: { id: bulkDelete },
        transaction,
      });

      return bulkDelete;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `previousTransactions.service.js`,
        `fixBilledDuplicatesInPreviousPayments`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of record object to be updated
   * @returns {Promise}
   * @description updates a single record object
   *@
   */
  static async updatePreviousEnrollmentRecord(id, data, transaction) {
    try {
      const record = await models.PreviousEnrollmentRecord.update(
        { ...data },
        { where: { id }, transaction, returning: true }
      );

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `previousTransactions.service.js`,
        `updatePreviousEnrollmentRecord`,
        `PUT`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of record object to be updated
   * @returns {Promise}
   * @description updates a single record object
   *@
   */
  static async updatePreviousEnrollmentRecordOtherFees(id, data, transaction) {
    try {
      const record = await models.PreviousEnrollmentRecordOtherFees.update(
        { ...data },
        { where: { id }, transaction, returning: true }
      );

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `previousTransactions.service.js`,
        `updatePreviousEnrollmentRecordOtherFees`,
        `PUT`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description
   *@
   */
  static async bulkCreatePreviousTuitionRecords(data, transaction) {
    try {
      const result = await models.PreviousStudentPayment.bulkCreate(data, {
        transaction,
        returning: true,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `previousTransactions.service.js`,
        `bulkCreatePreviousTuitionRecords`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description
   *@
   */
  static async createPreviousTuitionRecords(data, transaction) {
    try {
      const result = await models.PreviousStudentPayment.findOrCreate({
        where: {
          transaction_reference: data.transaction_reference,
        },
        defaults: {
          ...data,
        },
        transaction,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `previousTransactions.service.js`,
        `createPreviousTuitionRecords`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description
   *@
   */
  static async bulkCreatePreviousPrepaymentRecords(data, transaction) {
    try {
      const result = await models.PreviousStudentDeposit.bulkCreate(data, {
        transaction,
        returning: true,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `previousTransactions.service.js`,
        `bulkCreatePreviousPrepaymentRecords`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description
   *@
   */
  static async createPreviousPrepaymentRecords(data, transaction) {
    try {
      const result = await models.PreviousStudentDeposit.findOrCreate({
        where: {
          transaction_reference: data.transaction_reference,
        },
        defaults: {
          ...data,
        },
        transaction,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `previousTransactions.service.js`,
        `createPreviousPrepaymentRecords`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description
   *@
   */
  static async bulkCreatePreviousUniversalPymentRecords(data, transaction) {
    try {
      const result = await models.PreviousUniversalPayment.bulkCreate(data, {
        transaction,
        returning: true,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `previousTransactions.service.js`,
        `bulkCreatePreviousUniversalPymentRecords`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description
   *@
   */
  static async createPreviousUniversalPaymentRecords(data, transaction) {
    try {
      const result = await models.PreviousUniversalPayment.findOrCreate({
        where: {
          transaction_reference: data.transaction_reference,
        },
        defaults: {
          ...data,
        },
        transaction,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `previousTransactions.service.js`,
        `createPreviousUniversalPaymentRecords`,
        `POST`
      );
    }
  }

  // students deposited fees

  static async previousStudentDeposits(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from universal_payments_mgt.student_previous_deposits('${data.student_number}')`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `previousTransactions.service.js`,
        `previousStudentDeposits`,
        `GET`
      );
    }
  }

  // students fees transactions

  static async previousStudentTransactions(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from universal_payments_mgt.previous_fees_payments('${data.student_number}')`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `previousTransactions.service.js`,
        `previousStudentTransactions`,
        `GET`
      );
    }
  }

  //  previous uni payments
  static async previousUniPayments(data) {
    try {
      const filtered = await models.sequelize.query(
        `select *
         from universal_payments_mgt.previous_uni_payments_function('${data.from_date}',
         '${data.to_date}')`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `previousTransactions.service.js`,
        `previousUniPayments`,
        `GET`
      );
    }
  }
}

module.exports = PreviousTransactionsService;
