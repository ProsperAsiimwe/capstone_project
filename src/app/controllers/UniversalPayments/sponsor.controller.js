const { HttpResponse } = require('@helpers');
const {
  sponsorService,
  studentService,
  sponsorStudentService,
  metadataValueService,
  paymentTransactionService,
} = require('@services/index');
const {
  isEmpty,
  now,
  toUpper,
  trim,
  sumBy,
  chain,
  orderBy,
} = require('lodash');
const model = require('@models');
const moment = require('moment');
const { bulkPaymentService } = require('@services/index');
const XLSX = require('xlsx');
const formidable = require('formidable');
const excelJs = require('exceljs');
const fs = require('fs');
const { appConfig } = require('@root/config');
const {
  sponsorStudentsColumns,
  sponsorAllocationsColumns,
} = require('./templateColumns');
const {
  validateSheetColumns,
} = require('@controllers/Helpers/uploadValidator');
const { getMetadataValueId } = require('@controllers/Helpers/programmeHelper');
const {
  generatePaymentReference,
  prnTrackerRecord,
} = require('../Helpers/paymentReferenceHelper');
const {
  generateSystemReference,
} = require('@controllers/Helpers/paymentReferenceHelper');
const {
  generatePaymentReferenceBySponsorBulkPayment,
} = require('../Helpers/paymentReferenceRecord');

const http = new HttpResponse();

class SponsorController {
  /**
   * GET All sponsors.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async index(req, res) {
    try {
      const data = await sponsorService.findAllRecords({
        include: [
          {
            association: 'createdBy',
            attributes: ['surname', 'other_names'],
          },
        ],
      });

      http.setSuccess(200, 'Sponsor Account Fetched Successfully', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Sponsor Account', {
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
  async fetchSponsoredStudents(req, res) {
    try {
      const { sponsorId } = req.params;

      const data = await sponsorService.findAllSponsoredStudents({
        where: {
          sponsor_id: sponsorId,
        },
        include: [
          {
            association: 'studentProgramme',
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
                'delete_approval_status',
                'delete_approval_date',
                'delete_approved_by_id',
                'deleted_by_id',
                'last_update_approval_status',
                'last_update_approval_date',
                'last_update_approved_by_id',
                'last_updated_by_id',
                'create_approval_status',
                'create_approval_date',
                'create_approved_by_id',
                'created_by_id',
              ],
            },
            include: [
              {
                association: 'currentSemester',
                attributes: ['id', 'metadata_value'],
              },
              {
                association: 'currentStudyYear',
              },
              {
                association: 'student',
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
                    'delete_approval_status',
                    'delete_approval_date',
                    'delete_approved_by_id',
                    'deleted_by_id',
                    'last_update_approval_status',
                    'last_update_approval_date',
                    'last_update_approved_by_id',
                    'last_updated_by_id',
                    'create_approval_status',
                    'create_approval_date',
                    'create_approved_by_id',
                    'created_by_id',
                  ],
                },
              },
              {
                association: 'programme',
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
                    'delete_approval_status',
                    'delete_approval_date',
                    'delete_approved_by_id',
                    'deleted_by_id',
                    'last_update_approval_status',
                    'last_update_approval_date',
                    'last_update_approved_by_id',
                    'last_updated_by_id',
                    'create_approval_status',
                    'create_approval_date',
                    'create_approved_by_id',
                    'created_by_id',
                  ],
                },
              },
            ],
          },
          {
            association: 'createdBy',
            attributes: ['surname', 'other_names'],
          },
        ],
      });

      http.setSuccess(200, 'Sponsored Students Fetched Successfully', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Sponsored Students', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * CREATE New Sponsor Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async create(req, res) {
    try {
      const data = req.body;
      const { id } = req.user;

      data.created_by_id = parseInt(id, 10);

      const response = await model.sequelize.transaction(
        async (transaction) => {
          const result = await sponsorService.createRecord(data, transaction);

          return result;
        }
      );

      http.setSuccess(200, 'Sponsor Account created successfully', {
        data: response,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to create this Sponsor Account.', {
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
  async createSponsorInvoice(req, res) {
    try {
      const data = req.body;
      const { id: user, surname, other_names: otherNames } = req.user;

      data.created_by_id = user;

      const random = Math.floor(Math.random() * moment().unix());
      const generatedInvoiceNumber = `S-INV${random}`;

      const metadataValues = await metadataValueService.findAllMetadataValues({
        include: ['metadata'],
      });

      const findActiveInvoiceStatusId = getMetadataValueId(
        metadataValues,
        'ACTIVE',
        'INVOICE STATUSES'
      );

      const findMandatoryInvoiceTypeId = getMetadataValueId(
        metadataValues,
        'MANDATORY',
        'INVOICE TYPES'
      );

      const sponsor = await sponsorService.findOneRecord({
        where: { id: data.sponsor_id },
        raw: true,
      });

      if (!sponsor) {
        throw new Error(`The sponsor doesnot exist.`);
      }

      data.invoice_type_id = findMandatoryInvoiceTypeId;
      data.invoice_status_id = findActiveInvoiceStatusId;
      data.invoice_number = generatedInvoiceNumber;
      data.amount_due = data.invoice_amount;

      data.payment_mode = 'CASH';
      data.payment_bank_code = 'STN';

      const referenceNumberGenerator = await generatePaymentReference(
        data.invoice_amount,
        sponsor.sponsor_name,
        data.payment_mode,
        data.payment_bank_code,
        data.payment_mobile_no
      );

      const staffName = `${surname} ${otherNames}`;

      data.references = {
        tax_payer_name: referenceNumberGenerator.tax_payer_name,
        ura_prn: referenceNumberGenerator.ura_prn,
        system_prn: referenceNumberGenerator.system_prn,
        search_code: referenceNumberGenerator.search_code,
        amount: referenceNumberGenerator.amount,
        expiry_date: referenceNumberGenerator.expiry_date,
        payment_mode: data.payment_mode,
        payment_bank_code: data.payment_bank_code,
        tax_payer_bank_code: data.tax_payer_bank_code,
        generated_by: staffName,
      };

      const result = await model.sequelize.transaction(async (transaction) => {
        const response = await sponsorService.createSponsorInvoice(
          data,
          transaction
        );

        if (response[1] === true) {
          const prnTrackerData = {
            sponsor_invoice_id: response[0].dataValues.id,
            category: 'SPONSOR-BULK-PAYMENT',
            system_prn: referenceNumberGenerator.system_prn,
            ura_prn: referenceNumberGenerator.ura_prn,
            search_code: referenceNumberGenerator.search_code,
            amount: referenceNumberGenerator.amount,
            tax_payer_name: referenceNumberGenerator.tax_payer_name,
            payment_mode: data.payment_mode,
            payment_bank_code: data.payment_bank_code,
            tax_payer_bank_code: data.tax_payer_bank_code,
            generated_by: data.references.generated_by,
            expiry_date: referenceNumberGenerator.expiry_date,
          };

          await prnTrackerRecord(prnTrackerData, transaction);
        }

        return response[0];
      });

      http.setSuccess(200, 'Sponsor Invoice Created Successfully.', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Create Sponsor Invoice.', {
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
  async generateNewSponsorInvoicePRN(req, res) {
    try {
      const { sponsorInvoiceId } = req.params;

      const { id: user, surname, other_names: otherNames } = req.user;

      const data = {};

      data.sponsor_invoice_id = sponsorInvoiceId;

      data.created_by_id = user;

      const metadataValues = await metadataValueService.findAllMetadataValues({
        include: ['metadata'],
      });

      const findActiveInvoiceStatusId = getMetadataValueId(
        metadataValues,
        'ACTIVE',
        'INVOICE STATUSES'
      );

      const findSponsorInvoice = await sponsorService
        .findOneSponsorInvoice({
          where: {
            id: sponsorInvoiceId,
            invoice_status_id: findActiveInvoiceStatusId,
          },
          include: [
            {
              association: 'sponsor',
              attributes: [
                'id',
                'sponsor_name',
                'sponsor_email',
                'sponsor_phone',
              ],
            },
            {
              association: 'references',
              attributes: [
                'id',
                'sponsor_invoice_id',
                'system_prn',
                'ura_prn',
                'search_code',
                'amount',
                'tax_payer_name',
                'expiry_date',
                'is_used',
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

      if (!findSponsorInvoice) {
        throw new Error(
          `Unable to find the active sponsor invoice record indicated.`
        );
      }

      data.payment_mode = 'CASH';
      data.payment_bank_code = 'STN';
      data.tax_payer_bank_code = 'STN';

      const referenceNumberGenerator = await generatePaymentReference(
        findSponsorInvoice.invoice_amount,
        findSponsorInvoice.sponsor.sponsor_name,
        data.payment_mode,
        data.payment_bank_code,
        data.payment_mobile_no
      );

      const staffName = `${surname} ${otherNames}`;

      data.tax_payer_name = referenceNumberGenerator.tax_payer_name;
      data.ura_prn = referenceNumberGenerator.ura_prn;
      data.system_prn = referenceNumberGenerator.system_prn;
      data.search_code = referenceNumberGenerator.search_code;
      data.amount = referenceNumberGenerator.amount;
      data.expiry_date = referenceNumberGenerator.expiry_date;
      data.generated_by = staffName;

      const findActivePRN = findSponsorInvoice.references.find(
        (ref) => moment(ref.expiry_date) > moment.now()
        //  &&
        // ref.is_used === false &&
        // ref.payment_status === 'A'
      );

      if (findActivePRN) {
        throw new Error(
          `This invoice still has an unexpired active PRN: ${findActivePRN.ura_prn} for ${findActivePRN.amount}`
        );
      }

      const result = await model.sequelize.transaction(async (transaction) => {
        const response = await sponsorService.createSponsorPaymentReference(
          data,
          transaction
        );

        const prnTrackerData = {
          sponsor_invoice_id: data.sponsor_invoice_id,
          category: 'SPONSOR-BULK-PAYMENT',
          system_prn: referenceNumberGenerator.system_prn,
          ura_prn: referenceNumberGenerator.ura_prn,
          search_code: referenceNumberGenerator.search_code,
          amount: referenceNumberGenerator.amount,
          tax_payer_name: referenceNumberGenerator.tax_payer_name,
          payment_mode: data.payment_mode,
          payment_bank_code: data.payment_bank_code,
          tax_payer_bank_code: data.tax_payer_bank_code,
          generated_by: data.generated_by,
          expiry_date: referenceNumberGenerator.expiry_date,
        };

        await prnTrackerRecord(prnTrackerData, transaction);

        return response;
      });

      http.setSuccess(200, 'New Sponsor Invoice PRN Created Successfully.', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Create New Sponsor Invoice PRN.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * GET All .
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async findAllSponsorInvoices(req, res) {
    try {
      const { sponsorId } = req.params;

      const data = await sponsorService.findAllSponsorInvoices({
        where: {
          sponsor_id: sponsorId,
        },
        include: [
          {
            association: 'sponsor',
            attributes: [
              'id',
              'sponsor_name',
              'sponsor_email',
              'sponsor_phone',
            ],
          },
          {
            association: 'currency',
            attributes: ['id', 'metadata_value'],
          },
          {
            association: 'references',
            attributes: [
              'id',
              'sponsor_invoice_id',
              'system_prn',
              'ura_prn',
              'search_code',
              'amount',
              'tax_payer_name',
              'expiry_date',
              'is_used',
            ],
          },
          {
            association: 'createdBy',
            attributes: ['surname', 'other_names'],
          },
        ],
      });

      http.setSuccess(200, 'Sponsor Invoices Fetched Successfully', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Sponsor Invoices', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * GET All .
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async getSponsorAccountbalance(req, res) {
    try {
      const { sponsorId } = req.params;

      const transactions = await sponsorService
        .findAllSponsorTransactions({
          include: [
            {
              association: 'sponsorInvoice',
              include: [
                {
                  association: 'sponsor',
                  attributes: [
                    'id',
                    'sponsor_name',
                    'sponsor_email',
                    'sponsor_phone',
                  ],
                },
                {
                  association: 'references',
                  attributes: [
                    'id',
                    'sponsor_invoice_id',
                    'system_prn',
                    'ura_prn',
                    'search_code',
                    'amount',
                    'tax_payer_name',
                    'expiry_date',
                    'is_used',
                  ],
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

      const sponsorTransactions = transactions.filter(
        (transaction) =>
          parseInt(transaction.sponsor_id, 10) === parseInt(sponsorId, 10)
      );

      let balance = 0;

      if (!isEmpty(sponsorTransactions)) {
        balance = sumBy(sponsorTransactions, 'unallocated_amount');
      }

      http.setSuccess(200, 'Sponsor Account Balance Fetched Successfully', {
        data: {
          account_balance: balance,
          transactions: sponsorTransactions,
        },
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Sponsor Account Balance', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * GET All .
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async getTransactionAllocations(req, res) {
    try {
      const { transactionId } = req.params;

      const records = [];

      const allStudentProgrammes = await studentService
        .findAllStudentProgrammes({
          attributes: [
            'id',
            'student_id',
            'student_number',
            'registration_number',
          ],
          include: [
            {
              association: 'student',
              attributes: ['id', 'surname', 'other_names'],
            },
          ],
        })
        .then((res) => {
          if (res) {
            return res.map((item) => item.get({ plain: true }));
          }
        });

      const findAllocations = await sponsorService
        .findAllSponsorAllocations({
          where: {
            sponsor_transaction_id: transactionId,
          },
          attributes: [
            'id',
            'sponsor_transaction_id',
            'sponsor_student_id',
            'amount',
            'created_by_id',
          ],
          include: [
            {
              association: 'sponsorStudent',
              attributes: ['id', 'sponsor_id', 'student_programme_id'],
              include: [
                {
                  association: 'sponsor',
                  attributes: ['id', 'sponsor_name'],
                },
              ],
            },
            {
              association: 'createdBy',
              attributes: ['id', 'surname', 'other_names'],
            },
          ],
        })
        .then((res) => {
          if (res) {
            return res.map((item) => item.get({ plain: true }));
          }
        });

      if (!isEmpty(findAllocations)) {
        findAllocations.forEach((allocation) => {
          const studentProgrammeRecord = allStudentProgrammes.find(
            (stdProg) =>
              parseInt(stdProg.id, 10) ===
              parseInt(allocation.sponsorStudent.student_programme_id, 10)
          );

          if (!studentProgrammeRecord) {
            throw new Error(
              `Unable To Find One Of The Student's Academic Record.`
            );
          }

          records.push({
            ...allocation,
            student_programme: { ...studentProgrammeRecord },
          });
        });
      }

      http.setSuccess(200, 'Transaction Allocations Fetched Successfully', {
        data: records,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Transaction Allocations.', {
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
  async allocateMoneyToSponsoredStudents(req, res) {
    try {
      const { sponsorPaymentTransactionId } = req.params;
      const data = req.body;
      const { id: user } = req.user;

      data.created_by_id = user;

      const findTransaction = await sponsorService
        .findOneSponsorTransaction({
          where: {
            id: sponsorPaymentTransactionId,
          },
          include: [
            {
              association: 'sponsorInvoice',
              include: [
                {
                  association: 'sponsor',
                  attributes: [
                    'id',
                    'sponsor_name',
                    'sponsor_email',
                    'sponsor_phone',
                  ],
                },
                {
                  association: 'references',
                  attributes: [
                    'id',
                    'sponsor_invoice_id',
                    'system_prn',
                    'ura_prn',
                    'search_code',
                    'amount',
                    'tax_payer_name',
                    'expiry_date',
                    'is_used',
                  ],
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

      if (!findTransaction) {
        throw new Error(
          'Unable to find sponsor payment transaction specified.'
        );
      }

      if (parseFloat(findTransaction.unallocated_amount) <= 0) {
        throw new Error(
          'You have insufficient funds to allocate from this transaction.'
        );
      }

      const sponsoredStudents = [];

      if (!isEmpty(data.sponsored_students)) {
        for (const item of data.sponsored_students) {
          const validateSponsoredStudent = await sponsorService
            .findOneSponsoredStudent({
              where: {
                sponsor_id: findTransaction.sponsor_id,
                student_programme_id: item.student_programme_id,
              },
              include: [
                {
                  association: 'studentProgramme',
                  include: [
                    {
                      association: 'student',
                      attributes: ['id', 'surname', 'other_names'],
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

          if (!validateSponsoredStudent) {
            throw new Error(
              `One of the students provided is not among this sponsor's students.`
            );
          }

          if (
            validateSponsoredStudent.studentProgramme.is_current_programme !==
            true
          ) {
            throw new Error(
              `The programme selected to sponsor for ${validateSponsoredStudent.studentProgramme.student.surname} ${validateSponsoredStudent.studentProgramme.student.other_names} is not their current one.`
            );
          }

          sponsoredStudents.push({
            ...item,
            student_id: validateSponsoredStudent.studentProgramme.student_id,
            student_programme_id: validateSponsoredStudent.studentProgramme.id,
            sponsor_student_id: validateSponsoredStudent.id,
            sponsor_transaction_id: findTransaction.id,
            bioData: {
              surname:
                validateSponsoredStudent.studentProgramme.student.surname,
              other_names:
                validateSponsoredStudent.studentProgramme.student.other_names,
            },
          });
        }
      }

      const records = [];

      let totalAmount = 0;

      await model.sequelize.transaction(async (transaction) => {
        if (!isEmpty(sponsoredStudents)) {
          totalAmount = sumBy(sponsoredStudents, 'amount_paid');

          if (
            parseFloat(totalAmount) >
            parseFloat(findTransaction.unallocated_amount)
          ) {
            throw new Error(
              `The total amount you wish to allocate to students (${totalAmount}) cannot be greater than the transaction amount (${findTransaction.unallocated_amount}).`
            );
          }

          for (const student of sponsoredStudents) {
            const result = await generateSponsorAllocationRecord(
              findTransaction,
              data,
              student,
              user,
              transaction
            );

            records.push(result);
          }

          await sponsorService.updateSponsorTransaction(
            findTransaction.id,
            {
              unallocated_amount:
                parseFloat(findTransaction.unallocated_amount) -
                parseFloat(totalAmount),
              allocated_amount:
                parseFloat(findTransaction.allocated_amount) +
                parseFloat(totalAmount),
            },
            transaction
          );
        }
      });

      http.setSuccess(200, 'Payments Allocated Successfully.', {
        data: records,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Allocate Payments.', {
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
  async reverseAllocationToSponsoredStudents(req, res) {
    try {
      const data = req.body;
      const { id: user } = req.user;

      data.created_by_id = user;

      const records = [];

      const deAllocatedMoney = [];

      const allStudentProgrammes =
        await studentService.findAllStudentProgrammes({
          attributes: [
            'id',
            'student_id',
            'student_number',
            'registration_number',
          ],
          raw: true,
        });

      await model.sequelize.transaction(async (transaction) => {
        if (!isEmpty(data.sponsor_allocations)) {
          for (const record of data.sponsor_allocations) {
            const findAllocation = await sponsorService
              .findOneSponsorAllocation({
                where: {
                  id: record,
                },
                include: [
                  {
                    association: 'sponsorStudent',
                    attributes: ['id', 'sponsor_id', 'student_programme_id'],
                    include: [
                      {
                        association: 'sponsor',
                        attributes: ['id', 'sponsor_name'],
                      },
                    ],
                  },
                  {
                    association: 'sponsorTransaction',
                    attributes: [
                      'id',
                      'allocated_amount',
                      'unallocated_amount',
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

            if (!findAllocation) {
              throw new Error(`Unable To Find One Of The Sponsor Allocations.`);
            }

            if (findAllocation.deleted_by_id) {
              throw new Error(
                `One Of The Sponsor Allocations Has Already Been De-Allocated.`
              );
            }

            const studentProgrammeRecord = allStudentProgrammes.find(
              (record) =>
                parseInt(record.id, 10) ===
                parseInt(findAllocation.sponsorStudent.student_programme_id, 10)
            );

            if (!studentProgrammeRecord) {
              throw new Error(`Unable To Find Student's Academic Record.`);
            }

            const findPaymentTransaction = await paymentTransactionService
              .findOneRecord({
                where: {
                  student_id: studentProgrammeRecord.student_id,
                  origin_id: findAllocation.id,
                  origin_type: 'sponsorTransaction',
                  deleted_by_id: null,
                },
              })
              .then((res) => {
                if (res) {
                  return res.toJSON();
                }
              });

            if (findPaymentTransaction) {
              if (parseFloat(findPaymentTransaction.allocated_amount) > 0) {
                throw new Error(
                  `Student With Student Number: ${
                    studentProgrammeRecord.student_number
                  }, Registration Number: ${
                    studentProgrammeRecord.registration_number
                  } Has Already Allocated ${parseFloat(
                    findPaymentTransaction.allocated_amount
                  )} To An Invoice.`
                );
              }

              deAllocatedMoney.push({
                sponsor_transaction_id: findAllocation.sponsorTransaction.id,
                money_to_add: parseFloat(findAllocation.amount),
              });

              await sponsorService.updateSponsorAllocation(
                findAllocation.id,
                {
                  amount: 0,
                  deleted_by_id: user,
                  deleted_at: moment.now(),
                  delete_approval_status: 'APPROVED',
                },
                transaction
              );

              const result = await paymentTransactionService.updateRecord(
                findPaymentTransaction.id,
                {
                  unallocated_amount: 0,
                  deleted_by_id: user,
                  deleted_at: moment.now(),
                  delete_approval_status: 'APPROVED',
                },
                transaction
              );

              records.push(result[1][0]);
            } else {
              const findPaymentTransaction = await paymentTransactionService
                .findOneRecord({
                  where: {
                    student_id: studentProgrammeRecord.student_id,
                    student_programme_id: studentProgrammeRecord.id,
                    amount: findAllocation.amount,
                    created_by_id: findAllocation.created_by_id,
                    deleted_by_id: null,
                    transaction_origin: `SPONSOR-BULK-PAYMENT: ${findAllocation.sponsorStudent.sponsor.sponsor_name}`,
                  },
                })
                .then((res) => {
                  if (res) {
                    return res.toJSON();
                  }
                });

              if (findPaymentTransaction) {
                if (parseFloat(findPaymentTransaction.allocated_amount) > 0) {
                  throw new Error(
                    `Student With Student Number: ${
                      studentProgrammeRecord.student_number
                    }, Registration Number: ${
                      studentProgrammeRecord.registration_number
                    } Has Already Allocated ${parseFloat(
                      findPaymentTransaction.allocated_amount
                    )} To An Invoice.`
                  );
                }

                deAllocatedMoney.push({
                  sponsor_transaction_id: findAllocation.sponsorTransaction.id,
                  money_to_add: parseFloat(findAllocation.amount),
                });

                await sponsorService.updateSponsorAllocation(
                  findAllocation.id,
                  {
                    amount: 0,
                    deleted_by_id: user,
                    deleted_at: moment.now(),
                    delete_approval_status: 'APPROVED',
                  },
                  transaction
                );

                const result = await paymentTransactionService.updateRecord(
                  findPaymentTransaction.id,
                  {
                    unallocated_amount: 0,
                    deleted_by_id: user,
                    deleted_at: moment.now(),
                    delete_approval_status: 'APPROVED',
                  },
                  transaction
                );

                records.push(result[1][0]);
              }
            }
          }

          const groupedRecords = chain(deAllocatedMoney)
            .groupBy('sponsor_transaction_id')
            .map((value, key) => ({
              sponsor_transaction_id: key,
              students: orderBy(value, 'money_to_add'),
            }))
            .value();

          if (!isEmpty(groupedRecords)) {
            for (const group of groupedRecords) {
              const totalAllocation = sumBy(group.students, 'money_to_add');

              await sponsorService.incrementSponsorTransaction(
                'unallocated_amount',
                totalAllocation,
                group.sponsor_transaction_id,
                transaction
              );

              await sponsorService.decrementSponsorTransaction(
                'allocated_amount',
                totalAllocation,
                group.sponsor_transaction_id,
                transaction
              );
            }
          }
        }
      });

      http.setSuccess(200, 'Payments DE-Allocated Successfully.', {
        data: records,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To DE-Allocate Payments.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * UPDATE Specific Sponsor Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      data.last_updated_by_id = parseInt(req.user.id, 10);
      data.updated_at = moment.now();

      const response = await model.sequelize.transaction(
        async (transaction) => {
          const result = await sponsorService.updateRecord(
            id,
            data,
            transaction
          );

          return result;
        }
      );

      http.setSuccess(200, 'Sponsor Account Updated Successfully', {
        data: response,
      });
      if (isEmpty(response))
        http.setError(404, 'Sponsor Account Data Not Found');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Update This Sponsor Account', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Get Specific Sponsor Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async findOne(req, res) {
    try {
      const { id } = req.params;
      const sponsor = await sponsorService.findOneRecord({
        where: { id },
        includes: ['createdBy'],
      });

      http.setSuccess(200, 'Sponsor Account fetch successful', {
        sponsor,
      });
      if (isEmpty(sponsor))
        http.setError(404, 'Sponsor Account Data Not Found');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to get this Sponsor Account', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Get Specific Sponsor Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async getBulkPayments(req, res) {
    try {
      const { id } = req.query;
      const data = await bulkPaymentService.findOneRecord({
        where: { sponsor_id: id, payment_status: 'T' },
      });

      http.setSuccess(200, 'Sponsor Bulk Payments', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to get this Sponsor Bulk Payments', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Destroy Sponsor Data
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async delete(req, res) {
    try {
      const { id } = req.params;

      await sponsorService.deleteRecord(id);
      http.setSuccess(200, 'Sponsor Account Deleted Successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Delete This Sponsor Account', {
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
  async downloadSponsorStudentsTemplate(req, res) {
    try {
      const { user } = req;
      const workbook = new excelJs.Workbook();
      const rootSheet = workbook.addWorksheet('CREATE SPONSOR STUDENTS');
      const sponsorsSheet = workbook.addWorksheet('Sheet2');

      rootSheet.properties.defaultColWidth = sponsorStudentsColumns.length;
      rootSheet.columns = sponsorStudentsColumns;

      sponsorsSheet.state = 'veryHidden';

      const sponsors = await sponsorService.findAllRecords({
        attributes: ['id', 'sponsor_name', 'sponsor_email', 'sponsor_phone'],
        raw: true,
      });

      sponsorsSheet.addRows(sponsors.map((sponsor) => [sponsor.sponsor_name]));

      // Column Validations
      rootSheet.dataValidations.add('A2:A1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=Sheet2!$A$1:$A$1000'],
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

      const template = `${uploadPath}/download-sponsored-students-upload-template-${
        user.surname
      }-${user.other_names}-${user.id}-${now()}.xlsm`;

      await workbook.xlsx.writeFile(template);
      await res.download(
        template,
        'SPONSORED-STUDENTS-UPLOAD-TEMPLATE.xlsx',
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
  async downloadSponsorAllocationsTemplate(req, res) {
    try {
      const { user } = req;
      const workbook = new excelJs.Workbook();
      const rootSheet = workbook.addWorksheet('SPONSOR ALLOCATIONS');
      const sponsorsSheet = workbook.addWorksheet('Sheet2');

      rootSheet.properties.defaultColWidth = sponsorAllocationsColumns.length;
      rootSheet.columns = sponsorAllocationsColumns;

      sponsorsSheet.state = 'veryHidden';

      const sponsors = await sponsorService.findAllRecords({
        attributes: ['id', 'sponsor_name', 'sponsor_email', 'sponsor_phone'],
        raw: true,
      });

      sponsorsSheet.addRows(sponsors.map((sponsor) => [sponsor.sponsor_name]));

      // Column Validations
      rootSheet.dataValidations.add('A2:A1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=Sheet2!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid value from the list',
      });

      const minNumber = 1;
      const maxNumber = 10000000000;

      rootSheet.dataValidations.add('C2:C1000', {
        type: 'whole',
        allowBlank: false,
        formulae: [minNumber, maxNumber],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: `The value must be a number between ${minNumber} and ${maxNumber}`,
        prompt: `The value must be a number between ${minNumber} and ${maxNumber}`,
      });

      const uploadPath = `${appConfig.APP_URL}/documents/templates`;

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true }, (err) => {
          throw new Error(err.message);
        });
      }

      const template = `${uploadPath}/download-sponsor-allocations-upload-template-${
        user.surname
      }-${user.other_names}-${user.id}-${now()}.xlsm`;

      await workbook.xlsx.writeFile(template);
      await res.download(
        template,
        'SPONSOR-ALLOCATIONS-UPLOAD-TEMPLATE.xlsx',
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
  uploadSponsorStudents(req, res) {
    try {
      const data = req.body;
      const user = req.user.id;
      const form = new formidable.IncomingForm();
      const uploadedRecords = [];

      data.created_by_id = user;

      form.parse(req, async (err, fields, files) => {
        if (err) {
          http.setError(400, 'Unable To Upload Sponsored Students.', {
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
        const myTemplate = workbook.SheetNames[0];
        const records = XLSX.utils.sheet_to_json(workbook.Sheets[myTemplate]);

        if (isEmpty(records)) {
          http.setError(400, 'Cannot upload an empty template.');

          return http.send(res);
        }

        const studentProgrammes = await studentService.findAllStudentProgrammes(
          {
            raw: true,
          }
        );

        const sponsors = await sponsorService.findAllRecords({
          attributes: ['id', 'sponsor_name', 'sponsor_email', 'sponsor_phone'],
          raw: true,
        });

        const getStudentProgrammeId = (value) => {
          try {
            const checkValue = studentProgrammes.find(
              (std) =>
                toUpper(trim(std.student_number)) === toUpper(trim(value)) &&
                std.is_current_programme === true
            );

            if (checkValue) return parseInt(checkValue.id, 10);
            throw new Error(
              `Cannot find ${value} in the list of student numbers with current programmes.`
            );
          } catch (error) {
            throw new Error(error.message);
          }
        };

        const getSponsorId = (value) => {
          try {
            const checkValue = sponsors.find(
              (sponsor) =>
                toUpper(trim(sponsor.sponsor_name)) === toUpper(trim(value))
            );

            if (checkValue) return parseInt(checkValue.id, 10);
            throw new Error(`Cannot find ${value} in the list of sponsors.`);
          } catch (error) {
            throw new Error(error.message);
          }
        };

        try {
          await model.sequelize.transaction(async (transaction) => {
            for (const record of records) {
              if (!record.SPONSOR) {
                throw new Error(`One Of Records Provided Has No Sponsor.`);
              }

              validateSheetColumns(
                record,
                ['SPONSOR', 'STUDENT NUMBER'],
                record.SPONSOR
              );

              data.sponsor_id = getSponsorId(record.SPONSOR);

              data.student_programme_id = getStudentProgrammeId(
                record['STUDENT NUMBER']
              );

              const upload = await insertNewSponsoredStudent(data, transaction);

              uploadedRecords.push(upload);
            }
          });
          http.setSuccess(200, 'Sponsored Students Uploaded successfully.', {
            data: uploadedRecords,
          });

          return http.send(res);
        } catch (error) {
          http.setError(400, 'Unable to upload Sponsored Students.', {
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
  uploadSponsorAllocationsTemplate(req, res) {
    try {
      const user = req.user.id;
      const form = new formidable.IncomingForm();
      const uploadedRecords = [];
      const unsortedRecords = [];

      form.parse(req, async (err, fields, files) => {
        if (err) {
          http.setError(400, 'Unable To Upload Sponsor Transactions.', {
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
        const myTemplate = workbook.SheetNames[0];
        const records = XLSX.utils.sheet_to_json(workbook.Sheets[myTemplate]);

        if (isEmpty(records)) {
          http.setError(400, 'Cannot upload an empty template.');

          return http.send(res);
        }

        const studentProgrammes = await studentService.findAllStudentProgrammes(
          {
            raw: true,
          }
        );

        const sponsors = await sponsorService.findAllRecords({
          attributes: ['id', 'sponsor_name', 'sponsor_email', 'sponsor_phone'],
          raw: true,
        });

        const sponsorStudents = await sponsorStudentService
          .findAllRecords({
            include: [
              {
                association: 'studentProgramme',
                include: [
                  {
                    association: 'student',
                    attributes: ['id', 'surname', 'other_names'],
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

        const sponsorTransactions = await sponsorService
          .findAllSponsorTransactions({
            include: [
              {
                association: 'sponsorInvoice',
                include: [
                  {
                    association: 'sponsor',
                    attributes: [
                      'id',
                      'sponsor_name',
                      'sponsor_email',
                      'sponsor_phone',
                    ],
                  },
                  {
                    association: 'references',
                    attributes: [
                      'id',
                      'sponsor_invoice_id',
                      'system_prn',
                      'ura_prn',
                      'search_code',
                      'amount',
                      'tax_payer_name',
                      'expiry_date',
                      'is_used',
                    ],
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

        const getStudentProgrammeId = (value) => {
          try {
            const checkValue = studentProgrammes.find(
              (std) =>
                toUpper(trim(std.student_number)) === toUpper(trim(value)) &&
                std.is_current_programme === true
            );

            if (checkValue) return parseInt(checkValue.id, 10);
            throw new Error(
              `Cannot find ${value} in the list of student numbers with current programmes.`
            );
          } catch (error) {
            throw new Error(error.message);
          }
        };

        const verifySponsorStudent = (
          studentNumber,
          sponsorId,
          errorName,
          sponsorErrorName
        ) => {
          try {
            const studentProgrammeId = getStudentProgrammeId(studentNumber);

            const checkValue = sponsorStudents.find(
              (std) =>
                parseInt(std.sponsor_id, 10) === parseInt(sponsorId, 10) &&
                parseInt(std.student_programme_id, 10) ===
                  parseInt(studentProgrammeId, 10)
            );

            if (checkValue) {
              return checkValue;
            } else {
              throw new Error(
                `Cannot find ${errorName} in the list of students for the sponsor: ${sponsorErrorName}.`
              );
            }
          } catch (error) {
            throw new Error(error.message);
          }
        };

        const getSponsorId = (value) => {
          try {
            const checkValue = sponsors.find(
              (sponsor) =>
                toUpper(trim(sponsor.sponsor_name)) === toUpper(trim(value))
            );

            if (checkValue) return parseInt(checkValue.id, 10);
            throw new Error(`Cannot find ${value} in the list of sponsors.`);
          } catch (error) {
            throw new Error(error.message);
          }
        };

        const verifySponsorTransaction = (
          prn,
          sponsorId,
          errorName,
          sponsorErrorName
        ) => {
          try {
            const checkValue = sponsorTransactions.find(
              (transaction) =>
                toUpper(trim(transaction.ura_prn)) === toUpper(trim(prn)) &&
                parseInt(transaction.sponsor_id, 10) === parseInt(sponsorId, 10)
            );

            if (checkValue) return parseInt(checkValue.id, 10);
            throw new Error(
              `Cannot find ${prn} in the list of transaction prns for sponsor: ${sponsorErrorName} on record: ${errorName}.`
            );
          } catch (error) {
            throw new Error(error.message);
          }
        };

        try {
          await model.sequelize.transaction(async (transaction) => {
            for (const record of records) {
              const data = {};

              data.created_by_id = user;

              if (!record['STUDENT NUMBER']) {
                throw new Error(
                  `One Of Records Provided Has No Stundent Number.`
                );
              }

              validateSheetColumns(
                record,
                ['SPONSOR', 'STUDENT NUMBER', 'AMOUNT', 'TRANSACTION PRN'],
                record['STUDENT NUMBER']
              );

              const sponsorId = getSponsorId(record.SPONSOR);

              data.sponsor_transaction_id = verifySponsorTransaction(
                record['TRANSACTION PRN'],
                sponsorId,
                record['STUDENT NUMBER'],
                record.SPONSOR
              );

              const validateSponsoredStudent = verifySponsorStudent(
                record['STUDENT NUMBER'],
                sponsorId,
                record['STUDENT NUMBER'],
                record.SPONSOR
              );

              data.sponsor_student_id = validateSponsoredStudent.id;
              data.student_id =
                validateSponsoredStudent.studentProgramme.student_id;
              data.student_programme_id =
                validateSponsoredStudent.studentProgramme.id;
              data.student_programme_id =
                validateSponsoredStudent.studentProgramme.id;
              data.bioData = {
                surname:
                  validateSponsoredStudent.studentProgramme.student.surname,
                other_names:
                  validateSponsoredStudent.studentProgramme.student.other_names,
              };

              data.amount_paid = parseFloat(record.AMOUNT);

              unsortedRecords.push(data);
            }

            if (!isEmpty(unsortedRecords)) {
              const groupedRecords = chain(unsortedRecords)
                .groupBy('sponsor_transaction_id')
                .map((value, key) => ({
                  sponsor_transaction_id: key,
                  students: orderBy(value, 'amount_paid'),
                }))
                .value();

              if (!isEmpty(groupedRecords)) {
                for (const group of groupedRecords) {
                  const sponsorTransaction = sponsorTransactions.find(
                    (transaction) =>
                      parseInt(transaction.id, 10) ===
                      parseInt(group.sponsor_transaction_id, 10)
                  );

                  if (!sponsorTransaction) {
                    throw new Error(
                      `One of the sponsor transactions is invalid.`
                    );
                  }

                  const totalAllocation = sumBy(group.students, 'amount_paid');

                  if (
                    parseFloat(sponsorTransaction.unallocated_amount) <
                    parseFloat(totalAllocation)
                  ) {
                    throw new Error(
                      `${
                        sponsorTransaction.ura_prn
                      } Only Has ${sponsorTransaction.unallocated_amount.toLocaleString()} But Is Being Offset By An Amount Of ${totalAllocation.toLocaleString()} For Students.`
                    );
                  }

                  if (!isEmpty(group.students)) {
                    for (const student of group.students) {
                      const result = await generateSponsorAllocationRecord(
                        sponsorTransaction,
                        {
                          created_by_id: user,
                        },
                        student,
                        user,
                        transaction
                      );

                      uploadedRecords.push(result);
                    }
                  }

                  await sponsorService.updateSponsorTransaction(
                    sponsorTransaction.id,
                    {
                      unallocated_amount:
                        parseFloat(sponsorTransaction.unallocated_amount) -
                        parseFloat(totalAllocation),
                      allocated_amount:
                        parseFloat(sponsorTransaction.allocated_amount) +
                        parseFloat(totalAllocation),
                    },
                    transaction
                  );
                }
              }
            }
          });
          http.setSuccess(200, 'Sponsor Transactions Allocated Successfully.', {
            data: uploadedRecords,
          });

          return http.send(res);
        } catch (error) {
          http.setError(400, 'Unable To Allocate Sponsor Transactions.', {
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
}

/**
 *
 * @param {*} findTransaction
 * @param {*} data
 * @param {*} student
 * @param {*} user
 * @param {*} transaction
 * @returns
 */
const generateSponsorAllocationRecord = async (
  findTransaction,
  data,
  student,
  user,
  transaction
) => {
  try {
    data.transaction_origin = `SPONSOR-BULK-PAYMENT: ${findTransaction.sponsorInvoice.sponsor.sponsor_name}`;
    data.system_prn = generateSystemReference('BLK');
    data.unallocated_amount = student.amount_paid;
    data.amount = student.amount_paid;
    data.student_id = student.student_id;
    data.student_programme_id = student.student_programme_id;
    data.create_approval_status = 'APPROVED';
    data.create_approval_date = moment.now();
    data.payment_date = moment.now();

    await generatePaymentReferenceBySponsorBulkPayment(
      {
        system_prn: data.system_prn,
        payment_mode: 'CASH',
        amount_paid: data.unallocated_amount,
        student_id: data.student_id,
      },
      student.bioData,
      user,
      transaction
    );

    await sponsorService.createSponsorAllocationRecord(
      {
        sponsor_transaction_id: student.sponsor_transaction_id,
        sponsor_student_id: student.sponsor_student_id,
        amount: data.unallocated_amount,
        created_by_id: user,
      },
      transaction
    );

    data.origin_id = student.sponsor_transaction_id;
    data.origin_type = 'sponsorTransaction';

    const result =
      await paymentTransactionService.createPaymentTransactionRecord(
        data,
        transaction
      );

    return result;
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
const insertNewSponsoredStudent = async (data, transaction) => {
  const result = await sponsorStudentService.createRecord(data, transaction);

  return result;
};

module.exports = SponsorController;
