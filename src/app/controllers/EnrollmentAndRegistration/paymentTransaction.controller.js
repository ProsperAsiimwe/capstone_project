const { HttpResponse } = require('@helpers');
const {
  paymentTransactionService,
  paymentReferenceService,
  studentService,
  metadataService,
  academicYearService,
  // metadataValueService,
  semesterService,
} = require('@services/index');
const { Op } = require('sequelize');
const {
  getCurrentSemesterEnrollmentEvent,
  offsetAllInvoicesByBankTransaction,
  allocateMoneyToAnInvoice,
} = require('../Helpers/paymentTransactionHelper');
const {
  generatePaymentReferenceByDirectPost,
} = require('../Helpers/paymentReferenceRecord');

const { isEmpty, sumBy, trim, now, toUpper } = require('lodash');
const moment = require('moment');
const model = require('@models');
const {
  generateSystemReference,
} = require('@controllers/Helpers/paymentReferenceHelper');
const { directPostColumns } = require('./templateColumns');
const XLSX = require('xlsx');
const formidable = require('formidable');
const excelJs = require('exceljs');
const fs = require('fs');
const {
  getMetadataValues,
  // getMetadataValueId,
} = require('@controllers/Helpers/programmeHelper');

const {
  validateSheetColumns,
} = require('@controllers/Helpers/uploadValidator');

const http = new HttpResponse();

class PaymentTransactionController {
  /**
   * GET All records.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async fetchAllPaymentTransactions(req, res) {
    try {
      const { student_id: studentId } = req.params;
      const records = await paymentTransactionService.findAllRecords(studentId);
      const result = await paymentTransactionService.depositedTransactions(
        studentId
      );

      http.setSuccess(
        200,
        'All Payment Transaction Records Fetched Successfully',
        {
          data: records,
          deposits: result,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch All Payment Transaction Records', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * GET All records.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async fetchAllPaymentTransactionsByStudent(req, res) {
    try {
      const studentId = req.user.id;
      const records = await paymentTransactionService.findAllRecords(studentId);
      const result = await paymentTransactionService.depositedTransactions(
        studentId
      );

      http.setSuccess(
        200,
        'All Payment Transaction Records Fetched Successfully',
        {
          data: records,
          deposits: result,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch All Payment Transaction Records', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * GET All records.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async fetchAllPendingPaymentTransactions(req, res) {
    try {
      const records =
        await paymentTransactionService.findAllPendingDirectPostRecords(
          "'DIRECT POST'"
        );

      http.setSuccess(
        200,
        'All Pending Payment Transaction Records Fetched Successfully',
        {
          data: records,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable To Fetch All Pending Payment Transaction Records',
        {
          error: { message: error.message },
        }
      );

      return http.send(res);
    }
  }

  /**
   * UPDATE Specific Record.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async approvePaymentTransactions(req, res) {
    try {
      const studentId = req.user.id;
      const data = req.body;

      const newResult = [];

      if (!isEmpty(data.payment_transactions)) {
        for (const id of data.payment_transactions) {
          const queryData = {
            create_approved_by_id: studentId,
            create_approval_date: moment.now(),
            create_approval_status: 'APPROVED',
          };

          const approve = await paymentTransactionService.updateRecord(
            id,
            queryData
          );

          newResult.push(approve);
        }
      }

      http.setSuccess(
        200,
        'Payment Transaction Records Approved Successfully',
        {
          data: newResult,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Approve These Payment Transaction Record', {
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
  async deletePaymentTransactions(req, res) {
    try {
      const data = req.body;

      if (isEmpty(data.payment_transactions))
        throw new Error(`Select at least One Direct Post Record to Delete.`);

      await model.sequelize.transaction(async (transaction) => {
        for (const id of data.payment_transactions) {
          const findRecord = await paymentTransactionService.findOneRecord({
            where: {
              id,
              transaction_origin: 'DIRECT POST',
            },
            raw: true,
          });

          if (!findRecord) {
            throw new Error(`Unable To Find One Of the Direct Post Records.`);
          }

          if (findRecord.create_approval_status !== 'PENDING') {
            throw new Error(
              `One Of The Direct Post Has Already Been Approved.`
            );
          }

          await paymentTransactionService.deleteDirectDepositPayment(
            id,
            transaction
          );
        }
      });

      http.setSuccess(200, 'Direct Post(s) Deleted Successfully.');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Delete the Direct Post Records.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /** allocateMoneyToInvoices
   *
   * @param {*} req
   * @param {*} res
   */
  async allocateMoneyToInvoices(req, res) {
    try {
      const { payment_transaction_id: paymentTransactionId } = req.params;
      const data = req.body;

      const findStudent = await studentService.findOneStudent({
        where: { id: data.student_id },
        attributes: ['id'],
      });

      if (isEmpty(findStudent)) {
        throw new Error('This Student does not exist.');
      }

      const findPaymentTransaction =
        await paymentTransactionService.findOneRecord({
          where: {
            id: paymentTransactionId,
            student_id: findStudent.id,
          },
          attributes: [
            'id',
            'amount',
            'allocated_amount',
            'unallocated_amount',
            'create_approval_status',
            'ura_prn',
            'system_prn',
            'payment_date',
            'created_at',
          ],
          raw: true,
        });

      if (!findPaymentTransaction) {
        throw new Error(
          'Payment Transaction Record Does not Exist For This Student.'
        );
      }

      if (findPaymentTransaction.create_approval_status !== 'APPROVED') {
        throw new Error(
          'The Payment Transaction Record You Are Trying To Offset Invoices With Has Not Been Approved Yet.'
        );
      }

      const totalAllocationAmount = sumBy(data.invoices, 'allocated_amount');

      if (totalAllocationAmount > findPaymentTransaction.unallocated_amount) {
        throw new Error(
          'You do not have sufficient funds to allocate to the invoices.'
        );
      }

      const newUnallocated =
        parseFloat(findPaymentTransaction.unallocated_amount) -
        parseFloat(totalAllocationAmount);

      const newAllocated =
        parseFloat(findPaymentTransaction.allocated_amount) +
        parseFloat(totalAllocationAmount);

      const newTransactionData = {
        unallocated_amount: newUnallocated,
        allocated_amount: newAllocated,
      };

      const updateRecord = await model.sequelize.transaction(
        async (transaction) => {
          await allocateMoneyToAnInvoice(
            data,
            findStudent.id,
            findPaymentTransaction,
            totalAllocationAmount,
            transaction
          );

          const result = await paymentTransactionService.updateRecord(
            paymentTransactionId,
            newTransactionData,
            transaction
          );

          return result;
        }
      );

      const paymentTransaction = updateRecord[1][0];

      http.setSuccess(200, 'Money Allocated To Invoices Successfully.', {
        data: paymentTransaction,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Allocate Money To Invoices.', {
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
  async downloadDirectPostTemplate(req, res) {
    try {
      const { user } = req;

      const workbook = new excelJs.Workbook();

      const directPostSheet = workbook.addWorksheet('DIRECT POST');
      const academicYearsSheet = workbook.addWorksheet('Sheet2');
      const semestersSheet = workbook.addWorksheet('Sheet3');
      const studyYearsSheet = workbook.addWorksheet('Sheet4');
      const currencySheet = workbook.addWorksheet('Sheet5');
      const paymentModeSheet = workbook.addWorksheet('Sheet6');
      const banksSheet = workbook.addWorksheet('Sheet7');

      directPostSheet.properties.defaultColWidth = directPostColumns.length;
      directPostSheet.columns = directPostColumns;
      academicYearsSheet.state = 'veryHidden';
      semestersSheet.state = 'veryHidden';
      studyYearsSheet.state = 'veryHidden';
      currencySheet.state = 'veryHidden';
      paymentModeSheet.state = 'veryHidden';
      banksSheet.state = 'veryHidden';

      const metadata = await metadataService.findAllMetadata({
        attributes: ['metadata_name'],
        include: [
          { association: 'metadataValues', attributes: ['metadata_value'] },
        ],
        raw: true,
        nest: true,
      });

      const academicYears = await academicYearService
        .findAllAcademicYears({
          include: [
            {
              association: 'academicYear',
              attributes: ['id', 'metadata_value'],
            },
          ],
        })
        .then((res) => {
          if (res) {
            return res.map((item) => item.get({ plain: true }));
          }
        });

      studyYearsSheet.addRows(getMetadataValues(metadata, 'STUDY YEARS'));

      semestersSheet.addRows(getMetadataValues(metadata, 'SEMESTERS'));

      currencySheet.addRows(getMetadataValues(metadata, 'CURRENCIES'));

      paymentModeSheet.addRows(getMetadataValues(metadata, 'PAYMENT MODES'));

      banksSheet.addRows(getMetadataValues(metadata, 'BANKS'));

      academicYearsSheet.addRows(
        academicYears.map((item) => [`${item.academicYear.metadata_value}`])
      );

      // Column Validations
      directPostSheet.dataValidations.add('B2:B1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=Sheet2!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid value from the list',
      });

      directPostSheet.dataValidations.add('C2:C1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=Sheet3!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid value from the list',
      });

      directPostSheet.dataValidations.add('D2:D1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=Sheet4!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid value from the list',
      });

      directPostSheet.dataValidations.add('G2:G1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=Sheet5!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid value from the list',
      });

      directPostSheet.dataValidations.add('E2:E1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=Sheet6!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid value from the list',
      });

      directPostSheet.dataValidations.add('H2:H1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=Sheet7!$A$1:$A$1000'],
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

      const template = `${uploadPath}/download-direct-post-template-${
        user.surname
      }-${user.other_names}-${user.id}-${now()}.xlsm`;

      await workbook.xlsx.writeFile(template);
      await res.download(
        template,
        'DIRECT-POST-UPLOAD-TEMPLATE.xlsx',
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
  uploadDirectPostTemplate(req, res) {
    try {
      const { id: user } = req.user;

      const form = new formidable.IncomingForm();
      const uploads = [];

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

        const workbook = await XLSX.readFile(file.filepath, {
          cellDates: true,
        });

        const myTemplate = workbook.SheetNames[0];
        const uploadedRecords = XLSX.utils.sheet_to_json(
          workbook.Sheets[myTemplate]
        );

        if (isEmpty(uploadedRecords)) {
          http.setError(400, 'Cannot upload an empty template.');

          return http.send(res);
        }

        // const metadataValues = await metadataValueService.findAllMetadataValues(
        //   {
        //     include: ['metadata'],
        //   }
        // );

        const academicYears = await academicYearService
          .findAllAcademicYears({
            include: [
              {
                association: 'academicYear',
                attributes: ['id', 'metadata_value'],
              },
            ],
          })
          .then((res) => {
            if (res) {
              return res.map((item) => item.get({ plain: true }));
            }
          });

        const semesters = await semesterService
          .findAllSemesters({
            include: [
              {
                association: 'semester',
                attributes: ['id', 'metadata_value'],
              },
            ],
          })
          .then((res) => {
            if (res) {
              return res.map((item) => item.get({ plain: true }));
            }
          });

        const identifyAcademicRecord = async (value, errName) => {
          try {
            const checkValue = await studentService
              .findOneStudentProgramme({
                where: [
                  {
                    student_number: toUpper(trim(value)),
                  },
                ],
                include: [
                  {
                    association: 'programme',
                    include: [
                      {
                        association: 'programmeStudyYears',
                        attributes: [
                          'id',
                          'programme_id',
                          'programme_study_years',
                          'programme_study_year_id',
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

            if (checkValue) {
              if (checkValue.is_current_programme === true) {
                return {
                  student_programme_id: parseInt(checkValue.id, 10),
                  student_id: parseInt(checkValue.student_id, 10),
                  programme_study_years:
                    checkValue.programme.programmeStudyYears,
                };
              }
            }
            throw new Error(
              `Cannot find ${value} in the list of student numbers on the system for record ${errName}`
            );
          } catch (error) {
            throw new Error(error.message);
          }
        };

        const identifyAcademicYear = (value, errName) => {
          try {
            const checkValue = academicYears.find(
              (record) =>
                toUpper(trim(record.academicYear.metadata_value)) ===
                toUpper(trim(value))
            );

            if (checkValue) {
              return parseInt(checkValue.id, 10);
            }
            throw new Error(
              `Cannot find ${value} in the list of Academic Years on the system for record ${errName}`
            );
          } catch (error) {
            throw new Error(error.message);
          }
        };

        const identifySemester = (value, academicYearId, errName) => {
          try {
            const checkValue = semesters.find(
              (record) =>
                toUpper(trim(record.semester.metadata_value)) ===
                  toUpper(trim(value)) &&
                parseInt(record.academic_year_id, 10) ===
                  parseInt(academicYearId, 10)
            );

            if (checkValue) {
              return parseInt(checkValue.id, 10);
            }
            throw new Error(
              `Cannot find ${value} in the list of Semesters For The Academic Year Specified on the system for record ${errName}`
            );
          } catch (error) {
            throw new Error(error.message);
          }
        };

        try {
          await model.sequelize.transaction(async (transaction) => {
            for (const record of uploadedRecords) {
              const data = {
                created_by_id: user,
              };

              if (!record['STUDENT NUMBER']) {
                throw new Error(
                  `One Of The Records Provided Has No Student Number.`
                );
              }

              const errName = `${record['STUDENT NUMBER']}`;

              validateSheetColumns(
                record,
                [
                  'STUDENT NUMBER',
                  'ACADEMIC YEAR',
                  'SEMESTER',
                  'STUDY YEAR',
                  'PAYMENT MODE',
                  'AMOUNT PAID',
                  'CURRENCY',
                  'BANK NAME',
                  'BRANCH',
                  'MODE REFERENCE',
                  'NARRATION',
                  'PAYMENT DATE (MM-DD-YYYY)',
                ],
                errName
              );

              const academicRecord = await identifyAcademicRecord(
                record['STUDENT NUMBER'],
                errName
              );

              data.student_id = academicRecord.student_id;
              data.student_programme_id = academicRecord.id;

              data.academic_year_id = identifyAcademicYear(
                record['ACADEMIC YEAR'],
                errName
              );

              data.semester_id = identifySemester(
                record.SEMESTER,
                data.academic_year_id,
                errName
              );

              const findStudyYear = academicRecord.programme_study_years.find(
                (item) =>
                  toUpper(trim(item.programme_study_years)) ===
                  toUpper(trim(record['STUDY YEAR']))
              );

              if (!findStudyYear) {
                throw new Error(
                  `Cannot Find The Programme Study Year ${record['STUDY YEAR']} In The List For Student ${errName}`
                );
              }

              data.study_year_id = findStudyYear.id;

              data.system_prn = generateSystemReference('DP');

              data.bank = toUpper(trim(record['BANK NAME']));

              data.branch = toUpper(trim(record.BRANCH));

              data.payment_date = moment(
                trim(record['PAYMENT DATE (MM-DD-YYYY)'])
              ).format('YYYY-MM-DD');

              data.amount = parseFloat(record['AMOUNT PAID']);

              data.unallocated_amount = data.amount;

              data.transaction_origin = 'DIRECT POST';

              data.payment_mode = toUpper(trim(record['PAYMENT MODE']));

              data.currency = toUpper(trim(record.CURRENCY));

              data.mode_reference = toUpper(trim(record['MODE REFERENCE']));

              data.narration = toUpper(trim(record.NARRATION));

              const upload =
                await paymentTransactionService.createPaymentTransactionRecord(
                  data,
                  transaction
                );

              uploads.push(upload.dataValues);
            }
          });
          http.setSuccess(200, 'All Records Uploaded Successfully.', {
            data: uploads,
          });

          return http.send(res);
        } catch (error) {
          http.setError(400, 'Unable To Upload Records.', {
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
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async createBankPaymentTransaction(req, res) {
    try {
      const data = req.body;

      data.transaction_origin = 'BANK TRANSACTION';
      data.create_approval_status = 'APPROVED';

      const paymentReference =
        await paymentReferenceService.findOnePaymentReference({
          where: {
            reference_number: data.reference_number.trim(),
          },
          attributes: [
            'id',
            'student_id',
            'reference_number',
            'reference_origin',
            'generated_by',
            'amount',
          ],
          raw: true,
        });

      if (!paymentReference) {
        throw new Error('Payment Reference Provided Does not Exist.');
      }

      if (data.amount_paid !== paymentReference.amount) {
        throw new Error(
          `Amount Paid Must be equal to Amount Generated For This Reference Number, ${paymentReference.amount}.`
        );
      }

      data.student_id = paymentReference.student_id;

      const findStudent = await studentService.findOneStudent({
        where: { id: paymentReference.student_id },
        include: [
          {
            association: 'programme',
            attributes: ['programme_study_level_id'],
          },
        ],
        attributes: [
          'id',
          'current_study_year_id',
          'entry_academic_year_id',
          'programme_type_id',
          'campus_id',
          'programme_id',
          'billing_category_id',
          'intake_id',
        ],
        raw: true,
      });

      if (!findStudent) {
        throw new Error('This Student does not exist.');
      }

      data.study_year_id = findStudent.current_study_year_id;

      const currentEnrollmentEvent = await getCurrentSemesterEnrollmentEvent(
        findStudent
      );

      data.academic_year_id = currentEnrollmentEvent.academic_year_id;
      data.semester_id = currentEnrollmentEvent.semester_id;

      const paymentTransaction = await model.sequelize.transaction(
        async (transaction) => {
          const result =
            await paymentTransactionService.createPaymentTransactionRecord(
              data,
              transaction
            );

          await paymentReferenceService.updateIsUsedAndExpiry(
            result.reference_number,
            {
              is_used: true,
              expiry_date: moment.now(),
            }
          );

          await offsetAllInvoicesByBankTransaction(paymentReference);

          return result;
        }
      );

      http.setSuccess(201, 'Payment Transaction Created Successfully.', {
        data: paymentTransaction,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Create This Payment Transaction.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * createDirectPostTransaction
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async createDirectPostTransaction(req, res) {
    try {
      const userId = req.user.id;
      const data = req.body;

      data.created_by_id = userId;
      data.transaction_origin = 'DIRECT POST';
      data.system_prn = generateSystemReference('DP');
      data.unallocated_amount = data.amount_paid;
      data.bank = data.bank_name;
      data.branch = data.bank_branch;

      const student = await studentService.findOneStudent({
        where: {
          id: data.student_id,
        },
        include: {
          association: 'programmes',
          where: {
            is_current_programme: true,
          },
          attributes: ['id', 'is_current_programme'],
        },
        attributes: ['id', 'surname', 'other_names'],
      });

      if (!student) {
        throw new Error('Unable To Find Student.');
      }

      if (isEmpty(student.programmes)) {
        throw new Error('Unable To Find Active Student programme.');
      }

      data.student_programme_id = student.programmes[0].id;

      const paymentTransaction = await model.sequelize.transaction(
        async (transaction) => {
          await generatePaymentReferenceByDirectPost(
            data,
            student,
            userId,
            transaction
          );

          data.amount = data.amount_paid;

          const result =
            await paymentTransactionService.createPaymentTransactionRecord(
              data,
              transaction
            );

          return result;
        }
      );

      http.setSuccess(200, 'Payment Transaction Created Successfully.', {
        data: paymentTransaction,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Create This Payment Transaction.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * refundRequest
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async refundRequest(req, res) {
    try {
      const { student_id: studentId } = req.params;
      const userId = req.user.id;
      const data = req.body;

      let studentAccountBalance = 0;
      const arrayOfPaymentTransactions = [];

      data.student_id = studentId;
      if (data.requested_by === 'STAFF') {
        data.created_by_id = userId;
      } else if (data.requested_by === 'STUDENT') {
        data.created_by_id = null;
      } else {
        throw new Error(
          `${data.requested_by} must either be STAFF or STUDENT.`
        );
      }

      const transactions =
        await paymentTransactionService.findAllApprovedTransactionsWithUnallocatedMoney(
          studentId
        );

      if (transactions) {
        for (const eachObject of transactions) {
          arrayOfPaymentTransactions.push(...eachObject.payment_transactions);
        }
        studentAccountBalance = sumBy(
          arrayOfPaymentTransactions,
          'unallocated_amount'
        );
      } else {
        throw new Error(`This student does not have any balance.`);
      }

      data.refund_amount = studentAccountBalance;

      const arrayOfTransactions = [];

      arrayOfPaymentTransactions.forEach((transaction) => {
        arrayOfTransactions.push({
          payment_transaction_id: transaction.id,
        });
      });

      data.paymentTransactions = arrayOfTransactions;

      const requestRefund = await model.sequelize.transaction(
        async (transaction) => {
          const result = await paymentTransactionService.createRefundRequest(
            data,
            transaction
          );

          return result;
        }
      );

      http.setSuccess(201, 'Request To Refund Balance Sent Successfully.', {
        data: requestRefund,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Create Request To Refund Balance.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * approveRefundRequest
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async approveRefundRequest(req, res) {
    try {
      const { request_id: requestId } = req.params;
      const userId = req.user.id;
      const data = req.body;
      const newData = {
        approval_remarks: data.comment,
        create_approved_by_id: userId,
        create_approval_date: moment.now(),
        refund_status: 'APPROVED',
      };

      const findRequest =
        await paymentTransactionService.findOneRequestToRefund({
          where: {
            id: requestId,
            student_id: data.student_id,
            refund_status: 'PENDING',
          },
        });

      if (isEmpty(findRequest)) {
        throw new Error(
          'The Request Does not Exist For This Student Or Has Already Been APPROVED.'
        );
      }

      const requestRefund = await model.sequelize.transaction(
        async (transaction) => {
          const result = await paymentTransactionService.updateRefundRequest(
            requestId,
            newData,
            transaction
          );

          return result;
        }
      );
      const record = requestRefund[1][0];

      http.setSuccess(201, 'Request To Refund Balance Approved Successfully.', {
        data: record,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Approved Request To Refund Balance.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * refund
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async refund(req, res) {
    try {
      const { request_id: requestId } = req.params;
      const userId = req.user.id;
      const data = req.body;
      const newData = {
        payment_remarks: data.comment,
        payment_by_id: userId,
        payment_date: moment.now(),
        refund_status: 'REFUNDED',
      };

      const findRequest =
        await paymentTransactionService.findOneRequestToRefund({
          where: {
            id: requestId,
            student_id: data.student_id,
            refund_status: 'APPROVED',
          },
        });

      if (isEmpty(findRequest)) {
        throw new Error(
          'The Request Does not Exist For This Student Or Has Not Been APPROVED.'
        );
      }

      const findRefundRequestPaymentTransactions =
        await paymentTransactionService.findAllRefundRequestPaymentTransactions(
          {
            where: {
              refund_request_id: requestId,
            },
            raw: true,
          }
        );

      const finalResult = [];

      if (!isEmpty(findRefundRequestPaymentTransactions)) {
        await model.sequelize.transaction(async (transaction) => {
          for (const eachObject of findRefundRequestPaymentTransactions) {
            const findTransaction =
              await paymentTransactionService.findOneRecord({
                where: {
                  id: eachObject.payment_transaction_id,
                },
                raw: true,
              });

            const newData = {
              allocated_amount:
                findTransaction.allocated_amount +
                findTransaction.unallocated_amount,
              unallocated_amount: 0,
            };

            const result = await paymentTransactionService.updateRecord(
              findTransaction.id,
              newData,
              transaction
            );
            const record = result[1][0];

            finalResult.push(record);
          }
          const updatedRequest =
            await paymentTransactionService.updateRefundRequest(
              requestId,
              newData,
              transaction
            );

          http.setSuccess(201, 'Money Refunded Successfully.', {
            data: updatedRequest,
          });
        });
      }

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Refund Money.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * UPDATE Specific Record.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async updateRecord(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      const updateRecord = await paymentTransactionService.updateRecord(
        id,
        data
      );
      const paymentTransaction = updateRecord[1][0];

      http.setSuccess(200, 'Payment Transaction Record Updated Successfully', {
        data: paymentTransaction,
      });
      if (isEmpty(paymentTransaction))
        http.setError(404, 'Payment Transaction Record Data Not Found');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Update This Payment Transaction Record', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /** fetchStudentAccountBalanceByStaff
   *
   * @param {*} req
   * @param {*} res
   */
  async fetchStudentAccountBalanceByStaff(req, res) {
    try {
      const { student_id: studentId } = req.params;

      const data = await paymentTransactionService.findAllRecords({
        where: {
          studentId,
        },
        attributes: ['id', 'unallocated_amount'],
      });

      const accountBalance = sumBy(data, 'unallocated_amount');

      http.setSuccess(200, 'Account Balance Fetched Successfully', {
        accountBalance,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Account Balance', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /** getAllTransactionsWithUnallocatedMoney
   *
   * @param {*} req
   * @param {*} res
   */
  async getAllTransactionsWithUnallocatedMoney(req, res) {
    try {
      const { student_id: studentId } = req.params;

      // let totalUnallocated = 0;
      const paymentTransactions = [];

      // const transactions =
      //   await paymentTransactionService.findAllApprovedTransactionsWithUnallocatedMoney(
      //     studentId
      //   );

      // studentUnallocatedAmount

      const unallocatedAmount =
        await paymentTransactionService.studentUnallocatedAmount(studentId);

      // if (transactions) {
      //   for (const eachObject of transactions) {
      //     paymentTransactions.push(...eachObject.payment_transactions);
      //   }
      //   totalUnallocated = sumBy(paymentTransactions, 'unallocated_amount');
      // }

      const newData = {
        total_unallocated_amount: unallocatedAmount.total_unallocated,
        payment_transactions: paymentTransactions,
      };

      http.setSuccess(200, 'Payment Transactions Fetched Successfully', {
        data: newData,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Account Payment transactions', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /** fetchStudentAccountBalanceByStudent
   *
   * @param {*} req
   * @param {*} res
   */
  async fetchStudentAccountBalanceByStudent(req, res) {
    try {
      const studentId = req.user.id;

      const data = await paymentTransactionService.findAllRecords({
        where: {
          student_id: studentId,
        },
        attributes: ['id', 'unallocated_amount'],
      });

      const accountBalance = sumBy(data, 'unallocated_amount');

      http.setSuccess(200, 'Account Balance Fetched Successfully', {
        accountBalance,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Account Balance', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Destroy Record Data
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async deleteRecord(req, res) {
    try {
      const { id } = req.params;

      await paymentTransactionService.deleteRecord(id);
      http.setSuccess(200, 'Payment Transaction Record Deleted Successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Delete This Payment Transaction Record', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * FIX URA UN-UPDATED PAYMENT TRANSACTIONS
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async fixUraUnpingedTransactions(req, res) {
    try {
      const findAllUsedPaymentReferences = await paymentReferenceService
        .findAllPaymentReferences({
          where: {
            is_used: true,
          },
          attributes: [
            'id',
            'student_id',
            'is_used',
            'ura_prn',
            'system_prn',
            'amount',
          ],
          include: [
            {
              association: 'tuitionInvoice',
              attributes: [
                'id',
                'payment_reference_id',
                'tuition_invoice_id',
                'amount',
              ],
            },
            {
              association: 'functionalFeesInvoice',
              attributes: [
                'id',
                'payment_reference_id',
                'functional_fees_invoice_id',
                'amount',
              ],
            },
            {
              association: 'otherFeesInvoices',
              attributes: [
                'id',
                'payment_reference_id',
                'other_fees_invoice_id',
                'amount',
              ],
            },
            {
              association: 'manualInvoices',
              attributes: [
                'id',
                'payment_reference_id',
                'manual_invoice_id',
                'amount',
              ],
            },
          ],
        })
        .then((res) => {
          if (res) {
            return res.map((item) => item.get({ plain: true }));
          }
        });

      const prnsWithInvoices = findAllUsedPaymentReferences.filter(
        (prn) =>
          !isEmpty(prn.tuitionInvoice) ||
          !isEmpty(prn.functionalFeesInvoice) ||
          !isEmpty(prn.otherFeesInvoices) ||
          !isEmpty(prn.manualInvoices)
      );

      const transactionsToPing = [];

      if (!isEmpty(prnsWithInvoices)) {
        for (const item of prnsWithInvoices) {
          const findUnPingedTransaction =
            await paymentTransactionService.findOneRecord({
              where: {
                ura_prn: trim(item.ura_prn),
                unallocated_amount: {
                  [Op.gt]: 0,
                },
              },
              attributes: [
                'id',
                'student_id',
                'ura_prn',
                'amount',
                'allocated_amount',
                'unallocated_amount',
                'transaction_origin',
              ],
              raw: true,
            });

          if (findUnPingedTransaction) {
            transactionsToPing.push(findUnPingedTransaction);
          }
        }
      }

      await model.sequelize.transaction(async (transaction) => {
        if (!isEmpty(transactionsToPing)) {
          for (const item of transactionsToPing) {
            await paymentTransactionService.incrementTransaction(
              'allocated_amount',
              item.unallocated_amount,
              item.id,
              transaction
            );

            await paymentTransactionService.decrementTransaction(
              'unallocated_amount',
              item.unallocated_amount,
              item.id,
              transaction
            );
          }
        }
      });

      http.setSuccess(200, 'All Payment Transactions Pinged Successfully.');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Ping Payment Transactions.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

module.exports = PaymentTransactionController;
