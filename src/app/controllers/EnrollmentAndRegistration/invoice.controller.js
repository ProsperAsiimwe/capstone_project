const { HttpResponse } = require('@helpers');
const {
  invoiceService,
  paymentTransactionService,
  feesElementService,
  studentService,
  metadataValueService,
  academicYearService,
  studentProgrammeService,
  metadataService,
  semesterService,
  enrollmentService,
  // feesAmountPreviewService,
} = require('@services/index');
const UserAgent = require('user-agents');
const uuid = require('uuid');
const moment = require('moment');
const {
  isEmpty,
  sumBy,
  trim,
  split,
  replace,
  now,
  toUpper,
  chunk,
  find,
  toString,
} = require('lodash');
const model = require('@models');
const {
  createOtherFeesInvoice,
  voidingAndDeAllocatingInvoicesFromVoidingApprovals,
} = require('../Helpers/enrollmentRecord');
const {
  allocateMoneyToAnInvoice,
  allocateMoneyToAnInvoicesByStudent,
  handleDeAllocatingAllInvoices,
  handleRequestsToExemptingAllInvoices,
  handleApprovingExemptionOfAllInvoices,
} = require('../Helpers/invoiceHelper');
const { bulkManualInvoiceColumns } = require('./templateColumns');
const XLSX = require('xlsx');
const formidable = require('formidable');
const excelJs = require('exceljs');
const fs = require('fs');

const {
  validateSheetColumns,
} = require('@controllers/Helpers/uploadValidator');

const {
  getMetadataValueId,
  getMetadataValues,
} = require('@controllers/Helpers/programmeHelper');

const http = new HttpResponse();

class InvoiceController {
  /**
   * CREATE MANUAL INVOICE BY STAFF
   * @param {*} req
   * @param {*} res
   */
  async createManualInvoiceByStaff(req, res) {
    try {
      const userId = req.user.id;
      const data = req.body;
      const userAgent = new UserAgent();

      data.created_by_id = userId;
      data.elements = [];
      const random = Math.floor(Math.random() * moment().unix());
      const generatedInvoiceNumber = `M-INV${random}`;

      const studentProgramme = await studentService
        .findOneStudentProgramme({
          where: {
            id: data.student_programme_id,
            student_id: data.student_id,
          },
          attributes: [
            'id',
            'student_id',
            'campus_id',
            'entry_academic_year_id',
            'entry_study_year_id',
            'current_study_year_id',
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
          'The Academic Record Provided Does not Belong To This Student.'
        );
      }

      if (studentProgramme.is_current_programme === false) {
        throw new Error(
          'The Academic Record Provided Is Not The Current Programme Of This Student.'
        );
      }

      if (!isEmpty(data.fees_elements)) {
        for (const eachObject of data.fees_elements) {
          const findFeesElement = await feesElementService.findOneFeesElement({
            where: {
              id: eachObject.fees_element_id,
            },
          });

          if (!findFeesElement) {
            throw new Error('One Of The Fees Elements Chosen Does not Exist.');
          }

          const totalAmount = eachObject.quantity * eachObject.unit_amount;

          data.elements.push({
            ...eachObject,
            currency: data.currency,
            amount: totalAmount,
          });
        }
      }

      const metadataValues = await metadataValueService.findAllMetadataValues({
        include: {
          association: 'metadata',
          attributes: ['id', 'metadata_name'],
        },
        attributes: ['id', 'metadata_value'],
      });

      const findActiveInvoiceStatusId = getMetadataValueId(
        metadataValues,
        'ACTIVE',
        'INVOICE STATUSES'
      );

      data.invoice_amount = sumBy(data.elements, 'amount');
      data.amount_due = data.invoice_amount;
      data.invoice_number = generatedInvoiceNumber;
      data.invoice_status_id = findActiveInvoiceStatusId;
      data.ip_address = req.ip;
      data.user_agent = userAgent.data;

      const manualInvoice = await model.sequelize.transaction(
        async (transaction) => {
          const result = await invoiceService.createManualInvoice(
            data,
            transaction
          );

          return result;
        }
      );

      http.setSuccess(200, 'Manual Invoice Created Successfully.', {
        data: manualInvoice,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Create Manual Invoice.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * CREATE BULK INVOICING TO STUDENTS BY SPONSORSHIPS
   * @param {*} req
   * @param {*} res
   */
  async createBulkManualInvoiceByStaff(req, res) {
    try {
      const { id: userId, surname, other_names: otherNames } = req.user;
      const data = req.body;

      const metadataValues = await metadataValueService.findAllMetadataValues({
        include: {
          association: 'metadata',
          attributes: ['id', 'metadata_name'],
        },
        attributes: ['id', 'metadata_value'],
      });

      const userAgent = new UserAgent();

      const academicYear = await academicYearService.findOneAcademicYear({
        where: { id: data.academic_year_id },
        attributes: ['academic_year_id'],
        include: [
          {
            association: 'semesters',
            where: { semester_id: data.semester_id },
            attributes: ['id', 'semester_id'],
            required: true,
          },
        ],
        raw: true,
      });

      if (!academicYear)
        throw new Error('This academic Year is not defined in events');

      const whereClause = {
        sponsorship_id: data.sponsorship_id,
        is_current_programme: true,
        campus_id: data.campus_id,
        entry_academic_year_id: academicYear.academic_year_id,
      };

      if (data.campus_id === 'all') delete whereClause.campus_id;

      const findStudents = await studentProgrammeService.findAll({
        where: whereClause,
        include: [
          {
            association: 'currentStudyYear',
            where: {
              programme_study_year_id: data.study_year_id,
            },
            attributes: ['id'],
          },
          {
            association: 'programmeType',
            attributes: ['programme_type_id'],
          },
          {
            association: 'programme',
            where: {
              programme_study_level_id: data.programme_study_level_id,
            },
            attributes: ['programme_study_level_id'],
          },
        ],

        attributes: [
          'id',
          'student_id',
          'student_number',
          'campus_id',
          'entry_academic_year_id',
          'entry_study_year_id',
          'current_study_year_id',
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
        ],
        raw: true,
      });

      const random = Math.floor(Math.random() * moment().unix());
      const generatedInvoiceNumber = `M-INV${random}`;

      if (isEmpty(findStudents))
        throw new Error('No Students exist in this context');

      const invoicesCreated = [];

      await model.sequelize.transaction(async (transaction) => {
        for (const studentProgramme of findStudents) {
          const payload = {
            ...data,
            semester_id: academicYear['semesters.id'],
            created_by_id: userId,
            elements: [],
          };

          if (!isEmpty(data.fees_elements)) {
            for (const eachObject of data.fees_elements) {
              const studentPayload = {
                campus: studentProgramme.campus_id,
                academic_year: studentProgramme.entry_academic_year_id,
                intake: studentProgramme.intake_id,
                billing_category: studentProgramme.billing_category_id,
                programme_study_year: studentProgramme.current_study_year_id,
                study_level:
                  studentProgramme['programme.programme_study_level_id'],
                programme: studentProgramme.programme_id,
                programme_type: studentProgramme.programme_type_id,
                metadata_programme_type:
                  studentProgramme['programmeType.programme_type_id'],
              };

              const feesElements =
                await feesElementService.getOneFeesElementsWithTheirAmounts(
                  studentPayload,
                  eachObject.fees_element_id
                );

              if (isEmpty(feesElements))
                throw new Error(
                  `No Fees Element amount has been defined for this student ${studentProgramme.student_number}`
                );

              const unitAmount = feesElements.amount;
              const totalAmount = eachObject.quantity * feesElements.amount;

              payload.elements.push({
                ...eachObject,
                currency: data.currency,
                amount: totalAmount,
                unit_amount: unitAmount,
              });
            }
          }

          const findActiveInvoiceStatusId = getMetadataValueId(
            metadataValues,
            'ACTIVE',
            'INVOICE STATUSES'
          );
          const uuidCodes = split(uuid.v4().toUpperCase(), '-');

          payload.invoice_amount = sumBy(payload.elements, 'amount');
          payload.amount_due = payload.invoice_amount;
          payload.invoice_number = generatedInvoiceNumber;
          payload.invoice_status_id = findActiveInvoiceStatusId;
          payload.student_id = studentProgramme.student_id;
          payload.study_year_id = studentProgramme['currentStudyYear.id'];
          payload.is_bulk_manual_invoice = true;
          payload.ip_address = req.ip;
          payload.student_programme_id = studentProgramme.id;
          payload.user_agent = userAgent.data;
          payload.bulk_manual_invoice_batch = `${
            uuidCodes[0]
          }-${surname}${replace(otherNames, ' ', '-')}-${moment().format(
            'YYYY-MM-DD'
          )}`;

          const result = await invoiceService.createManualInvoice(
            payload,
            transaction
          );

          invoicesCreated.push(result);
        }
      });

      http.setSuccess(
        200,
        `Bulk Manual Invoice has been generated for ${invoicesCreated.length} Students`,
        {
          invoicesCreated,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Create Manual Invoice.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * CREATE BULK INVOICING TO STUDENTS BY SPONSORSHIPS - ONLY FOR MUK
   *
   * @param {*} req
   * @param {*} res
   */
  async createBulkInternshipBillInvoiceByStaff(req, res) {
    try {
      const { id: userId } = req.user;

      const defaultData = {
        invoice_status_id: 180,
        invoice_type_id: 176,
        description: 'Functional Fees',
        currency: 'UGX',
        invoice_amount: 132250,
        amount_due: 132250,
        amount_paid: 0,
        credit_note: 0,
        debit_note: 0,
        percentage_completion: 0,
        exempted_amount: 0,
        created_at: '2022-01-28 00:00:00',
        updated_at: '2022-01-28 00:00:00',
        created_by_id: userId,
        feesElements: {
          fees_element_id: 23,
          amount: 132250,
          new_amount: 132250,
          amount_paid: 0,
          cleared: false,
          created_by_id: userId,
          fees_element_code: 253,
          fees_element_name: 'INTERNSHIP',
          fees_element_category: 'FUNCTIONAL FEES',
          paid_when: 'Fresher/EverySemester',
          currency: 'UGX',
        },
      };

      const internshipStudents =
        await enrollmentService.getMUKStudentsForInternshipBilling();

      const chunkedValues = chunk(internshipStudents, 200);
      const invoicesCreated = [];

      await model.sequelize.transaction(async (transaction) => {
        for (const chunkStudents of chunkedValues) {
          const invoicesToCreate = [];

          for (const enrollment of chunkStudents) {
            const findInternshipBilling = find(
              enrollment.fees_elements,
              (e) => toString(e.fees_element_id) === '23'
            );

            if (!findInternshipBilling) {
              const uuidCodes = split(uuid.v4().toUpperCase(), '-');
              const invoiceNumber = `F-INV${uuidCodes[0]}`;

              if (toString(enrollment.academic_year_id) === '7') {
                delete defaultData.created_at;
                delete defaultData.updated_at;
                delete defaultData.feesElements.created_at;
                delete defaultData.feesElements.updated_at;
              } else {
                defaultData.created_at = '2022-01-28 00:00:00';
                defaultData.updated_at = '2022-01-28 00:00:00';
                defaultData.feesElements.created_at = '2022-01-28 00:00:00';
                defaultData.feesElements.updated_at = '2022-01-28 00:00:00';
              }

              invoicesToCreate.push({
                invoice_number: invoiceNumber,
                ...defaultData,
                student_id: enrollment.student_id,
                student_programme_id: enrollment.student_programme_id,
                enrollment_id: enrollment.enrollment_id,
              });
            }
          }

          if (!isEmpty(invoicesToCreate)) {
            const result = await invoiceService.bulkCreateInternshipInvoice(
              invoicesToCreate,
              transaction
            );

            invoicesCreated.push(result);
          }
        }
      });

      http.setSuccess(
        200,
        `Bulk Internship Billing Invoice has been generated for ${invoicesCreated.length} Students`,
        {
          invoicesCreated,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Create Internship Fee Billing Invoice.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * By Student
   * @param {*} req
   * @param {*} res
   */
  async createOtherFeesInvoiceByStudent(req, res) {
    try {
      const data = req.body;
      const findStudentRecord = req.user;
      const studentId = req.user.id;

      data.student_id = studentId;
      const otherFeesInvoice = await createOtherFeesInvoice(
        data,
        findStudentRecord
      );

      http.setSuccess(201, 'Other Fees Invoice Created Successfully.', {
        data: otherFeesInvoice,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Create Other Fees Invoice.', {
        error: {
          message: error.message,
        },
      });

      return http.send(res);
    }
  }

  /**
   * Display invoice fees elements
   * @param {
   * } req
   * @param {*} res
   */

  async fetchTuitionInvoiceFeesElements(req, res) {
    try {
      const { tuition_invoice_id: tuitionInvoiceId } = req.params;
      const response = {
        invoice: null,
        elements: null,
      };
      const findInvoice = await invoiceService.findOneTuitionInvoiceRecord({
        where: {
          id: tuitionInvoiceId,
        },
        attributes: [
          'id',
          'invoice_amount',
          'amount_paid',
          'amount_due',
          'percentage_completion',
          'created_at',
        ],
      });

      if (isEmpty(findInvoice)) {
        throw new Error(`This invoice does not exist.`);
      }
      response.invoice = findInvoice || null;

      const data = await invoiceService.findAllTuitionInvoiceElements({
        where: {
          tuition_invoice_id: tuitionInvoiceId,
        },
        ...getTuitionFeesElementsAttributes(),
      });

      response.elements = data || null;

      http.setSuccess(200, 'Tuition Fees Elements Fetched Successfully.', {
        data: response,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Tuition Fees Elements', {
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
  async fetchFunctionalInvoiceFeesElements(req, res) {
    try {
      const { functional_invoice_id: functionalInvoiceId } = req.params;
      const response = {
        invoice: null,
        elements: null,
      };
      const findInvoice = await invoiceService.findOneFunctionalInvoiceRecord({
        where: {
          id: functionalInvoiceId,
        },
        attributes: [
          'id',
          'invoice_amount',
          'amount_paid',
          'amount_due',
          'percentage_completion',
          'created_at',
        ],
      });

      if (isEmpty(findInvoice)) {
        throw new Error(`This invoice does not exist.`);
      }
      response.invoice = findInvoice || null;

      const data = await invoiceService.findAllFunctionalInvoiceElements({
        where: {
          functional_invoice_id: functionalInvoiceId,
        },
        ...getFunctionalFeesElementsAttributes(),
      });

      response.elements = data || null;

      http.setSuccess(
        200,
        'Functional Fees Invoice Elements Fetched Successfully.',
        {
          data: response,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Functional Fees Elements', {
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
  async fetchOtherFeesInvoiceFeesElements(req, res) {
    try {
      const { other_fees_invoice_id: otherFeesInvoiceId } = req.params;
      const response = {
        invoice: null,
        elements: null,
      };
      const findInvoice = await invoiceService.findOneOtherFeesInvoiceRecords({
        where: {
          id: otherFeesInvoiceId,
        },
        attributes: [
          'id',
          'invoice_amount',
          'amount_paid',
          'amount_due',
          'percentage_completion',
          'created_at',
        ],
      });

      if (isEmpty(findInvoice)) {
        throw new Error(`This invoice does not exist.`);
      }
      response.invoice = findInvoice || null;

      const data = await invoiceService.findAllOtherFeesInvoiceElements({
        where: {
          other_fees_invoice_id: otherFeesInvoiceId,
        },
        ...getOtherFeesElementsAttributes(),
      });

      response.elements = data || null;

      http.setSuccess(
        200,
        'Other Fees Invoice Elements Fetched Successfully.',
        {
          data: response,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Other Fees Elements', {
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
  async fetchManualInvoiceFeesElements(req, res) {
    try {
      const { manual_invoice_id: manualInvoiceId } = req.params;

      const response = {
        invoice: null,
        elements: null,
      };
      const findInvoice = await invoiceService.findOneManualInvoiceRecord({
        where: {
          id: manualInvoiceId,
        },
        attributes: [
          'id',
          'invoice_amount',
          'amount_paid',
          'amount_due',
          'percentage_completion',
          'created_at',
        ],
      });

      if (isEmpty(findInvoice)) {
        throw new Error(`This invoice does not exist.`);
      }
      response.invoice = findInvoice || null;

      const data = await invoiceService.findAllManualInvoiceElements({
        where: {
          manual_invoice_id: manualInvoiceId,
        },
        ...getManualInvoiceElementsAttributes(),
      });

      response.elements = data || null;

      http.setSuccess(200, 'Manual Invoice Elements Fetched Successfully.', {
        data: response,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Manual Invoice Elements', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /** allocateMoneyToInvoice
   *
   * @param {*} req
   * @param {*} res
   */
  async allocateMoneyToInvoice(req, res) {
    try {
      const { invoice_id: invoiceId } = req.params;
      const data = req.body;

      const findStudent = await studentService.findOneStudent({
        where: { id: data.student_id },
        attributes: ['id'],
        raw: true,
      });

      if (!findStudent) {
        throw new Error('This Student does not exist.');
      }

      const response = await model.sequelize.transaction(
        async (transaction) => {
          const response = await allocateMoneyToAnInvoice(
            data,
            invoiceId,
            findStudent,
            transaction
          );

          return response;
        }
      );

      http.setSuccess(200, 'Money Allocated To Invoice Successfully.', {
        data: response,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Allocate Money To Invoice.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /** allocateMoneyToInvoice
   *
   * @param {*} req
   * @param {*} res
   */
  async allocateMoneyToInvoiceByStudent(req, res) {
    try {
      const { transactionId } = req.params;
      const data = req.body;
      const { id: user } = req.user;

      const findStudent = { id: user };

      const records = [];

      await model.sequelize.transaction(async (transaction) => {
        if (!isEmpty(data.invoices)) {
          const findPaymentTransaction =
            await paymentTransactionService.findOneRecord({
              where: { id: transactionId },
              raw: true,
            });

          if (!findPaymentTransaction) {
            throw new Error('Payment transaction doesnot exist.');
          }

          if (findPaymentTransaction.create_approval_status !== 'APPROVED') {
            throw new Error('Payment transaction has not yet been approved.');
          }

          const totalInvoiceAmount = sumBy(data.invoices, 'amount');

          if (
            parseFloat(findPaymentTransaction.unallocated_amount) <
            parseFloat(totalInvoiceAmount)
          ) {
            throw new Error('You have insufficient funds');
          }

          for (const invoice of data.invoices) {
            const response = await allocateMoneyToAnInvoicesByStudent(
              invoice,
              findPaymentTransaction,
              totalInvoiceAmount,
              findStudent,
              transaction
            );

            records.push(response);
          }
        }
      });

      http.setSuccess(200, 'Money Allocated To Invoices Successfully.', {
        data: records,
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
   *showAllUnpaidInvoices
   * @param {*} req
   * @param {*} res
   */
  async showAllUnpaidInvoices(req, res) {
    try {
      const { student_id: studentId } = req.params;

      let sumAllTuitionInvoiceAmountsDue = 0;

      let sumAllFunctionalInvoiceAmountsDue = 0;

      let sumAllOtherFeesInvoiceAmountsDue = 0;

      let sumAllManualInvoiceAmountsDue = 0;

      let unpaidBalance = 0;

      let newData = {};
      const arrayOfTuitionInvoices = [];
      const arrayOfFunctionalInvoices = [];
      const arrayOfOtherFeesInvoices = [];
      const arrayOfManualInvoices = [];

      const allUnpaidInvoices = await invoiceService.findAllValidUnpaidInvoices(
        studentId
      );

      const allUnpaidManualInvoices =
        await invoiceService.findAllUnpaidManualInvoices(studentId);

      allUnpaidInvoices.manual_invoices =
        allUnpaidManualInvoices.manual_invoices;

      if (allUnpaidInvoices) {
        if (!isEmpty(allUnpaidInvoices.tuition_invoices)) {
          arrayOfTuitionInvoices.push(...allUnpaidInvoices.tuition_invoices);
        }
        if (!isEmpty(allUnpaidInvoices.functional_fees_invoices)) {
          arrayOfFunctionalInvoices.push(
            ...allUnpaidInvoices.functional_fees_invoices
          );
        }
        if (!isEmpty(allUnpaidInvoices.other_fees_invoices)) {
          arrayOfOtherFeesInvoices.push(
            ...allUnpaidInvoices.other_fees_invoices
          );
        }
        if (!isEmpty(allUnpaidInvoices.manual_invoices)) {
          arrayOfManualInvoices.push(...allUnpaidInvoices.manual_invoices);
        }

        sumAllTuitionInvoiceAmountsDue = sumBy(
          arrayOfTuitionInvoices,
          'amount_due'
        );
        sumAllFunctionalInvoiceAmountsDue = sumBy(
          arrayOfFunctionalInvoices,
          'amount_due'
        );
        sumAllOtherFeesInvoiceAmountsDue = sumBy(
          arrayOfOtherFeesInvoices,
          'amount_due'
        );
        sumAllManualInvoiceAmountsDue = sumBy(
          arrayOfManualInvoices,
          'amount_due'
        );
      }
      unpaidBalance =
        sumAllTuitionInvoiceAmountsDue +
        sumAllFunctionalInvoiceAmountsDue +
        sumAllOtherFeesInvoiceAmountsDue +
        sumAllManualInvoiceAmountsDue;

      newData = {
        total_unpaid_invoices_balance: unpaidBalance,
        tuitionInvoices: arrayOfTuitionInvoices,
        functionalFeesInvoices: arrayOfFunctionalInvoices,
        otherFeesInvoices: arrayOfOtherFeesInvoices,
        manualInvoices: arrayOfManualInvoices,
      };
      http.setSuccess(200, 'All Unpaid Invoices Fetched Successfully.', {
        data: newData,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to get All Unpaid Invoices.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /** fetchAllInvoices with a function
   *
   * @param {*} req
   * @param {*} res
   */
  async fetchAllInvoices(req, res) {
    try {
      const student = req.user.id;

      const tuitionFunctionalOther =
        await invoiceService.findAllTuitionFunctionalAndOtherFeesInvoices(
          student
        );
      const manual = await invoiceService.findAllManualInvoices(student);

      const unmatchedManualContext = [];

      manual.forEach((manualInvoice) => {
        const findContextInAuto = tuitionFunctionalOther.find(
          (invoice) =>
            manualInvoice.semester_id === invoice.semester_id &&
            manualInvoice.academic_year_id === invoice.academic_year_id &&
            manualInvoice.study_year_id === invoice.study_year_id
        );

        if (!findContextInAuto) {
          unmatchedManualContext.push({
            ...manualInvoice,
            tuition_invoices: [],
            functional_fees_invoices: [],
            other_fees_invoices: [],
          });
        }
      });

      const newInvoice = tuitionFunctionalOther.map((invoice) => {
        const findManualInvoice = manual.find(
          (context) =>
            context.semester_id === invoice.semester_id &&
            context.academic_year_id === invoice.academic_year_id &&
            context.study_year_id === invoice.study_year_id
        );

        return {
          ...invoice,
          manual_invoices: findManualInvoice
            ? findManualInvoice.manual_invoices
            : [],
        };
      });

      http.setSuccess(200, 'All Invoices Fetched Successfully.', {
        data: newInvoice.concat(unmatchedManualContext),
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch All Invoices', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /** fetchAllInvoicesByStaff
   *
   * @param {*} req
   * @param {*} res
   */
  async fetchAllInvoicesByStaff(req, res) {
    try {
      const { student_id: studentId } = req.params;

      const tuitionFunctionalOther =
        await invoiceService.findAllTuitionFunctionalAndOtherFeesInvoices(
          studentId
        );
      const manual = await invoiceService.findAllManualInvoices(studentId);

      const unmatchedManualContext = [];

      manual.forEach((manualInvoice) => {
        const findContextInAuto = tuitionFunctionalOther.find(
          (invoice) =>
            manualInvoice.semester_id === invoice.semester_id &&
            manualInvoice.academic_year_id === invoice.academic_year_id &&
            manualInvoice.study_year_id === invoice.study_year_id
        );

        if (!findContextInAuto) {
          unmatchedManualContext.push({
            ...manualInvoice,
            tuition_invoices: [],
            functional_fees_invoices: [],
            other_fees_invoices: [],
          });
        }
      });

      const newInvoice = tuitionFunctionalOther.map((invoice) => {
        const findManualInvoice = manual.find(
          (context) =>
            context.semester_id === invoice.semester_id &&
            context.academic_year_id === invoice.academic_year_id &&
            context.study_year_id === invoice.study_year_id
        );

        return {
          ...invoice,
          manual_invoices: findManualInvoice
            ? findManualInvoice.manual_invoices
            : [],
        };
      });

      http.setSuccess(200, 'All Invoices Fetched Successfully.', {
        data: newInvoice.concat(unmatchedManualContext),
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch All Invoices', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /** fetchAllPaymentTransactions with a function
   *
   * @param {*} req
   * @param {*} res
   */
  async fetchAllPaymentTransactions(req, res) {
    try {
      const studentId = req.user.id;

      const data = await paymentTransactionService.findAllRecords({
        where: {
          student_id: studentId,
        },
      });

      http.setSuccess(200, 'All Payment Transactions Fetched Successfully.', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch All Payment Transactions', {
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
  async requestVoidInvoices(req, res) {
    try {
      const { student_id: studentId } = req.params;
      const data = req.body;
      const user = req.user.id;

      const metadataValues = await metadataValueService.findAllMetadataValues({
        include: ['metadata'],
      });

      const findActiveInvoiceStatusId = getMetadataValueId(
        metadataValues,
        'ACTIVE',
        'INVOICE STATUSES'
      );

      let arrayOfOtherFeesInvoices = [];

      let arrayOfManualInvoices = [];
      const otherFeesInvoiceResults = [];
      const manualInvoiceResults = [];

      if (!isEmpty(data.invoices)) {
        arrayOfOtherFeesInvoices = data.invoices.filter((item) =>
          item.invoice_number.includes('O-INV')
        );
        arrayOfManualInvoices = data.invoices.filter((item) =>
          item.invoice_number.includes('M-INV')
        );

        if (!isEmpty(arrayOfOtherFeesInvoices)) {
          await model.sequelize.transaction(async (transaction) => {
            for (const eachObject of arrayOfOtherFeesInvoices) {
              const findInvoice =
                await invoiceService.findOneOtherFeesInvoiceRecords({
                  where: {
                    id: eachObject.invoice_id,
                    student_id: studentId,
                    invoice_number: eachObject.invoice_number,
                    invoice_status_id: findActiveInvoiceStatusId,
                    // deleted_at: null,
                    deleted_by_id: null,
                  },
                  attributes: [
                    'id',
                    'enrollment_id',
                    'invoice_amount',
                    'amount_paid',
                    'amount_due',
                    'percentage_completion',
                    'currency',
                    'invoice_number',
                    'description',
                  ],
                });

              if (isEmpty(findInvoice)) {
                throw new Error(
                  `Invoice ${eachObject.invoice_number} Is Invalid Or Cannot Be Voided.`
                );
              }
              const payload = {
                other_fees_invoice_id: findInvoice.id,
                student_id: studentId,
                enrollment_id: findInvoice.enrollment_id,
                reason: eachObject.reason,
                created_by_id: user,
              };

              const result =
                await invoiceService.createRequestToVoidOtherFeesInvoice(
                  payload,
                  transaction
                );

              otherFeesInvoiceResults.push(result);
            }
          });
        }

        if (!isEmpty(arrayOfManualInvoices)) {
          await model.sequelize.transaction(async (transaction) => {
            for (const eachObject of arrayOfManualInvoices) {
              const findInvoice =
                await invoiceService.findOneManualInvoiceRecord({
                  where: {
                    id: eachObject.invoice_id,
                    student_id: studentId,
                    invoice_number: eachObject.invoice_number,
                    invoice_status_id: findActiveInvoiceStatusId,
                    // deleted_at: null,
                    deleted_by_id: null,
                  },
                  attributes: [
                    'id',
                    'academic_year_id',
                    'semester_id',
                    'study_year_id',
                    'invoice_amount',
                    'amount_paid',
                    'amount_due',
                    'percentage_completion',
                    'currency',
                    'invoice_number',
                    'description',
                  ],
                });

              if (isEmpty(findInvoice)) {
                throw new Error(
                  `Invoice ${eachObject.invoice_number} Is Invalid Or Cannot Be Voided.`
                );
              }

              const payload = {
                manual_invoice_id: findInvoice.id,
                student_id: studentId,
                academic_year_id: findInvoice.academic_year_id,
                semester_id: findInvoice.semester_id,
                study_year_id: findInvoice.study_year_id,
                reason: eachObject.reason,
                created_by_id: user,
              };

              const result =
                await invoiceService.createRequestToVoidManualInvoice(
                  payload,
                  transaction
                );

              manualInvoiceResults.push(result);
            }
          });
        }
      }

      const result = {
        other_fees_invoices: !isEmpty(otherFeesInvoiceResults)
          ? otherFeesInvoiceResults
          : null,
        manual_invoices: !isEmpty(manualInvoiceResults)
          ? manualInvoiceResults
          : null,
      };

      http.setSuccess(200, 'Request To Void Invoices Sent Successfully.', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Send Request To Void Invoice.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /** fetchRequestsToVoidInvoices with a view
   *
   * @param {*} req
   * @param {*} res
   */
  async fetchRequestsToVoidInvoices(req, res) {
    try {
      const otherFees =
        await invoiceService.fetchRequestsToVoidOtherFeesInvoices();
      const manual = await invoiceService.fetchRequestsToVoidManualInvoices();

      const unmatchedManualContext = [];

      manual.forEach((manualInvoice) => {
        const findContextInAuto = otherFees.find(
          (invoice) =>
            manualInvoice.semester_id === invoice.semester_id &&
            manualInvoice.academic_year_id === invoice.academic_year_id &&
            manualInvoice.study_year_id === invoice.study_year_id
        );

        if (!findContextInAuto) {
          unmatchedManualContext.push({
            ...manualInvoice,
            voiding_other_fees_invoices: [],
          });
        }
      });

      const newInvoice = otherFees.map((invoice) => {
        const findManualInvoice = manual.find(
          (context) =>
            context.semester_id === invoice.semester_id &&
            context.academic_year_id === invoice.academic_year_id &&
            context.study_year_id === invoice.study_year_id
        );

        return {
          ...invoice,
          voiding_manual_invoices: findManualInvoice
            ? findManualInvoice.voiding_manual_invoices
            : [],
        };
      });

      const merged = newInvoice.concat(unmatchedManualContext);

      http.setSuccess(200, 'Requests To Void Invoices Fetched Successfully.', {
        data: merged,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch All Requests To Void Invoices.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /** fetchAllVoidedInvoices with a view
   *
   * @param {*} req
   * @param {*} res
   */
  async fetchAllVoidedInvoices(req, res) {
    try {
      const { student_id: studentId } = req.params;
      const tuitionFunctionalOther =
        await invoiceService.fetchAllVoidedTuitionFunctionalOtherFeesInvoices(
          studentId
        );
      const manual = await invoiceService.fetchAllVoidedManualInvoices(
        studentId
      );

      const unmatchedManualContext = [];

      manual.forEach((manualInvoice) => {
        const findContextInAuto = tuitionFunctionalOther.find(
          (invoice) =>
            manualInvoice.semester_id === invoice.semester_id &&
            manualInvoice.academic_year_id === invoice.academic_year_id &&
            manualInvoice.study_year_id === invoice.study_year_id
        );

        if (!findContextInAuto) {
          unmatchedManualContext.push({
            ...manualInvoice,
            tuition_invoices: [],
            functional_fees_invoices: [],
            other_fees_invoices: [],
          });
        }
      });

      const newInvoice = tuitionFunctionalOther.map((invoice) => {
        const findManualInvoice = manual.find(
          (context) =>
            context.semester_id === invoice.semester_id &&
            context.academic_year_id === invoice.academic_year_id &&
            context.study_year_id === invoice.study_year_id
        );

        return {
          ...invoice,
          manual_invoices: findManualInvoice
            ? findManualInvoice.manual_invoices
            : [],
        };
      });

      const merged = newInvoice.concat(unmatchedManualContext);

      http.setSuccess(200, 'Voided Invoices Fetched Successfully.', {
        data: merged,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch All Voided Invoices.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /** fetchAllInvoiceExemptionRequestsForOneStudent with a view
   *
   * @param {*} req
   * @param {*} res
   */
  async fetchAllInvoiceExemptionRequestsForOneStudent(req, res) {
    try {
      const { student_id: studentId } = req.params;
      const requests =
        await invoiceService.fetchAllInvoiceExemptionRequestsForOneStudent(
          studentId
        );

      http.setSuccess(200, 'Invoice Exemption Requests Fetched Successfully.', {
        data: requests,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch All Invoice Exemption Requests.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /** fetchAllInvoiceExemptionRequestsForAllStudents with a view
   *
   * @param {*} req
   * @param {*} res
   */
  async fetchAllInvoiceExemptionRequestsForAllStudents(req, res) {
    try {
      const requests =
        await invoiceService.fetchAllInvoiceExemptionRequestsForAllStudents();

      http.setSuccess(200, 'Invoice Exemption Requests Fetched Successfully.', {
        data: requests,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch All Invoice Exemption Requests.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /** approveVoidInvoices
   *
   * @param {*} req
   * @param {*} res
   */
  async approveVoidInvoices(req, res) {
    try {
      const data = req.body;
      const user = req.user.id;

      const otherFeesInvoices = [];
      const manualInvoices = [];

      if (!isEmpty(data.invoices)) {
        const arrayOfOtherFeesApprovals = data.invoices.filter((item) =>
          item.invoice_number.includes('O-INV')
        );

        const arrayOfManualApprovals = data.invoices.filter((item) =>
          item.invoice_number.includes('M-INV')
        );

        await model.sequelize.transaction(async (transaction) => {
          if (!isEmpty(arrayOfOtherFeesApprovals)) {
            for (const request of arrayOfOtherFeesApprovals) {
              const findRequest =
                await invoiceService.findOneRequestToVoidOtherFeesInvoice({
                  where: {
                    id: request.void_request_id,
                  },
                  raw: true,
                });

              if (!findRequest) {
                throw new Error(
                  `Request For ${request.invoice_number} Does Not Exists.`
                );
              }

              if (findRequest.create_approval_status !== 'PENDING') {
                throw new Error(
                  `Request For ${request.invoice_number} Has Already Been Approved.`
                );
              }

              if (findRequest.delete_approval_status === 'APPROVED') {
                throw new Error(
                  `Request For ${request.invoice_number} Has Been Denied.`
                );
              }

              const findInvoice =
                await invoiceService.findOneOtherFeesInvoiceRecords({
                  where: {
                    invoice_number: trim(request.invoice_number),
                  },
                  raw: true,
                });

              if (findInvoice) {
                otherFeesInvoices.push({
                  id: findInvoice.id,
                  credit_paid_funds_to_account:
                    request.credit_paid_funds_to_account,
                });

                // update request
                await invoiceService.updateVoidingOtherFeesInvoice(
                  findRequest.id,
                  { create_approval_status: 'APPROVED' },
                  transaction
                );
              }
            }
          }

          if (!isEmpty(arrayOfManualApprovals)) {
            for (const request of arrayOfManualApprovals) {
              const findRequest =
                await invoiceService.findOneRequestToVoidManualInvoice({
                  where: {
                    id: request.void_request_id,
                  },
                  raw: true,
                });

              if (!findRequest) {
                throw new Error(
                  `Request For ${request.invoice_number} Does Not Exists.`
                );
              }

              if (findRequest.create_approval_status !== 'PENDING') {
                throw new Error(
                  `Request For ${request.invoice_number} Has Already Been Approved.`
                );
              }

              if (findRequest.delete_approval_status === 'APPROVED') {
                throw new Error(
                  `Request For ${request.invoice_number} Has Been Denied.`
                );
              }

              const findInvoice =
                await invoiceService.findOneManualInvoiceRecord({
                  where: {
                    invoice_number: trim(request.invoice_number),
                  },
                  raw: true,
                });

              if (findInvoice) {
                manualInvoices.push({
                  id: findInvoice.id,
                  credit_paid_funds_to_account:
                    request.credit_paid_funds_to_account,
                });

                // update request
                await invoiceService.updateVoidingManualInvoice(
                  findRequest.id,
                  { create_approval_status: 'APPROVED' },
                  transaction
                );
              }
            }
          }

          await voidingAndDeAllocatingInvoicesFromVoidingApprovals(
            manualInvoices,
            otherFeesInvoices,
            user,
            transaction
          );
        });
      }

      http.setSuccess(200, 'Invoices Voided Successfully.');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Void Invoices.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /** approveVoidInvoices
   *
   * @param {*} req
   * @param {*} res
   */
  async rejectVoidInvoices(req, res) {
    try {
      const data = req.body;
      const user = req.user.id;

      await model.sequelize.transaction(async (transaction) => {
        if (data.invoice_number.includes('O-INV')) {
          const findRequest =
            await invoiceService.findOneRequestToVoidOtherFeesInvoice({
              where: {
                id: data.void_request_id,
              },
              raw: true,
            });

          if (!findRequest) {
            throw new Error(
              `Request For ${data.invoice_number} Does Not Exists.`
            );
          }

          if (findRequest.create_approval_status !== 'PENDING') {
            throw new Error(
              `Request For ${data.invoice_number} Has Already Been Approved.`
            );
          }

          if (findRequest.delete_approval_status === 'APPROVED') {
            throw new Error(
              `Request For ${data.invoice_number} Has Already Been Rejected.`
            );
          }

          // update request
          await invoiceService.updateVoidingOtherFeesInvoice(
            findRequest.id,
            {
              delete_approval_status: 'APPROVED',
              delete_approval_date: moment.now(),
              delete_approved_by_id: user,
              approval_remarks: data.approval_remarks,
            },
            transaction
          );
        } else if (data.invoice_number.includes('M-INV')) {
          const findRequest =
            await invoiceService.findOneRequestToVoidManualInvoice({
              where: {
                id: data.void_request_id,
              },
              raw: true,
            });

          if (!findRequest) {
            throw new Error(
              `Request For ${data.invoice_number} Does Not Exists.`
            );
          }

          if (findRequest.create_approval_status !== 'PENDING') {
            throw new Error(
              `Request For ${data.invoice_number} Has Already Been Approved.`
            );
          }

          if (findRequest.delete_approval_status === 'APPROVED') {
            throw new Error(
              `Request For ${data.invoice_number} Has Already Been Rejected.`
            );
          }

          // update request
          await invoiceService.updateVoidingManualInvoice(
            findRequest.id,
            {
              delete_approval_status: 'APPROVED',
              delete_approval_date: moment.now(),
              delete_approved_by_id: user,
              approval_remarks: data.approval_remarks,
            },
            transaction
          );
        } else {
          throw new Error('Invalid invoice number provided.');
        }
      });

      http.setSuccess(200, 'Invoice Void Request Rejected Successfully.');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Reject Void Invoice Request.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /** deAllocateInvoices
   *
   * @param {*} req
   * @param {*} res
   */
  async deAllocateInvoices(req, res) {
    try {
      const { student_id: studentId } = req.params;
      const data = req.body;
      const user = req.user.id;

      let arrayOfTuitionInvoices = [];

      let arrayOfFunctionalFeesInvoices = [];

      let arrayOfOtherFeesInvoices = [];

      let arrayOfManualInvoices = [];

      let result = [];

      if (!isEmpty(data.invoices)) {
        arrayOfTuitionInvoices = data.invoices.filter((item) =>
          item.invoice_number.includes('T-INV')
        );
        arrayOfFunctionalFeesInvoices = data.invoices.filter((item) =>
          item.invoice_number.includes('F-INV')
        );
        arrayOfOtherFeesInvoices = data.invoices.filter((item) =>
          item.invoice_number.includes('O-INV')
        );
        arrayOfManualInvoices = data.invoices.filter((item) =>
          item.invoice_number.includes('M-INV')
        );

        const metadataValues = await metadataValueService.findAllMetadataValues(
          {
            include: ['metadata'],
          }
        );

        const findActiveInvoiceStatusId = getMetadataValueId(
          metadataValues,
          'ACTIVE',
          'INVOICE STATUSES'
        );

        result = await handleDeAllocatingAllInvoices(
          arrayOfTuitionInvoices,
          arrayOfFunctionalFeesInvoices,
          arrayOfOtherFeesInvoices,
          arrayOfManualInvoices,
          studentId,
          user,
          findActiveInvoiceStatusId
        );
      }

      http.setSuccess(200, 'Invoices De-Allocated Successfully.', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To De-Allocated Invoices.', {
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
  async requestToExemptInvoices(req, res) {
    try {
      const { student_id: studentId } = req.params;
      const data = req.body;
      const user = req.user.id;

      let arrayOfTuitionInvoices = [];

      let arrayOfFunctionalFeesInvoices = [];

      let arrayOfOtherFeesInvoices = [];

      let arrayOfManualInvoices = [];

      let result = [];

      if (!isEmpty(data.invoices)) {
        arrayOfTuitionInvoices = data.invoices.filter((item) =>
          item.invoice_number.includes('T-INV')
        );
        arrayOfFunctionalFeesInvoices = data.invoices.filter((item) =>
          item.invoice_number.includes('F-INV')
        );
        arrayOfOtherFeesInvoices = data.invoices.filter((item) =>
          item.invoice_number.includes('O-INV')
        );
        arrayOfManualInvoices = data.invoices.filter((item) =>
          item.invoice_number.includes('M-INV')
        );

        result = await handleRequestsToExemptingAllInvoices(
          arrayOfTuitionInvoices,
          arrayOfFunctionalFeesInvoices,
          arrayOfOtherFeesInvoices,
          arrayOfManualInvoices,
          studentId,
          user
        );
      }

      http.setSuccess(200, 'Requests To Exempt Invoices Sent Successfully.', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Send Requests To Exempt Invoices.', {
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
  async exemptInvoices(req, res) {
    try {
      const { student_id: studentId } = req.params;
      const data = req.body;
      const user = req.user.id;

      const arrayOfTuitionInvoices = [];
      const arrayOfFunctionalFeesInvoices = [];
      const arrayOfOtherFeesInvoices = [];
      const arrayOfManualInvoices = [];

      let result = [];

      const requests = [];

      if (!isEmpty(data.exemption_requests)) {
        for (const eachId of data.exemption_requests) {
          const exemptionRequest =
            await invoiceService.findOneInvoiceExemptionRequest({
              where: {
                id: eachId,
                student_id: studentId,
                create_approval_status: 'PENDING',
              },
              raw: true,
            });

          if (!exemptionRequest) {
            throw new Error(
              'One Of The Requests You Are Trying To Approve Is Not Valid.'
            );
          }
          requests.push(exemptionRequest);
        }

        const filterTuitionInvoices = requests.filter((item) =>
          item.invoice_number.includes('T-INV')
        );

        const filterFunctionalInvoices = requests.filter((item) =>
          item.invoice_number.includes('F-INV')
        );

        const filterOtherFeesInvoices = requests.filter((item) =>
          item.invoice_number.includes('O-INV')
        );

        const filterManualInvoices = requests.filter((item) =>
          item.invoice_number.includes('M-INV')
        );

        if (!isEmpty(filterTuitionInvoices)) {
          filterTuitionInvoices.forEach((request) => {
            arrayOfTuitionInvoices.push({
              exemption_request_id: request.id,
              invoice_id: request.tuition_invoice_id,
              invoice_number: request.invoice_number,
              exempted_amount: request.exempted_amount,
              exemption_comments: request.exemption_comments,
            });
          });
        }

        if (!isEmpty(filterFunctionalInvoices)) {
          filterFunctionalInvoices.forEach((request) => {
            arrayOfFunctionalFeesInvoices.push({
              exemption_request_id: request.id,
              invoice_id: request.functional_invoice_id,
              invoice_number: request.invoice_number,
              exempted_amount: request.exempted_amount,
              exemption_comments: request.exemption_comments,
            });
          });
        }

        if (!isEmpty(filterOtherFeesInvoices)) {
          filterOtherFeesInvoices.forEach((request) => {
            arrayOfOtherFeesInvoices.push({
              exemption_request_id: request.id,
              invoice_id: request.other_fees_invoice_id,
              invoice_number: request.invoice_number,
              exempted_amount: request.exempted_amount,
              exemption_comments: request.exemption_comments,
            });
          });
        }

        if (!isEmpty(filterManualInvoices)) {
          filterManualInvoices.forEach((request) => {
            arrayOfManualInvoices.push({
              exemption_request_id: request.id,
              invoice_id: request.manual_invoice_id,
              invoice_number: request.invoice_number,
              exempted_amount: request.exempted_amount,
              exemption_comments: request.exemption_comments,
            });
          });
        }

        result = await handleApprovingExemptionOfAllInvoices(
          arrayOfTuitionInvoices,
          arrayOfFunctionalFeesInvoices,
          arrayOfOtherFeesInvoices,
          arrayOfManualInvoices,
          studentId,
          user
        );
      }

      http.setSuccess(200, 'Invoices Exempted Successfully.', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Exempted Invoices.', {
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
  uploadBulkManualInvoiceTemplate(req, res) {
    try {
      const { id: user } = req.user;
      const userAgent = new UserAgent();
      const form = new formidable.IncomingForm();
      const uploads = [];
      const random = Math.floor(Math.random() * moment().unix());
      const generatedBatchNumber = `BATCH${random}`;

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

        const metadataValues = await metadataValueService.findAllMetadataValues(
          {
            include: ['metadata'],
          }
        );

        const feesElements = await feesElementService
          .findAllFeesElements({
            include: [
              {
                association: 'feesCategory',
                attributes: ['id', 'metadata_value'],
              },
              {
                association: 'chartOfAccount',
                attributes: ['id', 'account_name', 'account_code'],
              },
            ],
          })
          .then((res) => {
            if (res) {
              return res.map((item) => item.get({ plain: true }));
            }
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
                    is_current_programme: true,
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
                      {
                        association: 'studyLevel',
                        attributes: ['id', 'metadata_value'],
                      },
                    ],
                  },
                  {
                    association: 'programmeType',
                    attributes: ['id'],
                    include: {
                      association: 'programmeType',
                      attributes: ['id', 'metadata_value'],
                    },
                  },
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
                    association: 'billingCategory',
                    attributes: ['id', 'metadata_value'],
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
              return {
                student_programme_id: parseInt(checkValue.id, 10),
                student_id: parseInt(checkValue.student_id, 10),
                programme_study_years: checkValue.programme.programmeStudyYears,
                academic_record: checkValue,
              };
            }
            throw new Error(
              `Cannot find ${value} in the list of student numbers with an active programme on the system for record ${errName}`
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

        const identifyFeesElements = (value, desc, amount, curr, errName) => {
          try {
            const elements = [];
            const data = {};

            const str = value.substr(0, value.indexOf(':'));

            const checkValue = feesElements.find(
              (element) =>
                toUpper(trim(element.fees_element_code)) === toUpper(trim(str))
            );

            if (checkValue) {
              data.fees_element_id = parseInt(checkValue.id, 10);
              data.fees_element_description = toUpper(trim(desc));
              data.quantity = 1;
              data.currency = toUpper(trim(curr));
              data.unit_amount = parseFloat(amount) * data.quantity;
              data.amount = data.unit_amount * data.quantity;

              // if (
              //   toUpper(trim(checkValue.feesCategory.metadata_value)) ===
              //   'TUITION FEES'
              // ) {
              //   const findTuitionAmounts =
              //     await feesAmountPreviewService.tuitionAmountPreviewContext({
              //       campus_id: academicRecord.academic_record.campus_id,
              //       academic_year_id:
              //         academicRecord.academic_record.entry_academic_year_id,
              //       intake_id: academicRecord.academic_record.intake_id,
              //       billing_category_id:
              //         academicRecord.academic_record.billing_category_id,
              //       programme_study_year_id: studyYearId,
              //       programme_id: academicRecord.academic_record.programme_id,
              //       programme_type_id:
              //         academicRecord.academic_record.programme_type_id,
              //     });

              //   const findDefinedElement = findTuitionAmounts.find(
              //     (element) =>
              //       parseInt(element.fees_element_id, 10) ===
              //       data.fees_element_id
              //   );

              //   if (!findDefinedElement) {
              //     throw new Error(
              //       `You Are Trying To Assign A TUITION FEES Element To Student: ${errName} Who Doesn't Have A Tuition Context Defined For It In Campus: ${academicRecord.academic_record.campus.metadata_value}, Intake: ${academicRecord.academic_record.intake.metadata_value}, Entry Academic Year: ${academicRecord.academic_record.entryAcademicYear.metadata_value}, Billing Category: ${academicRecord.academic_record.billingCategory.metadata_value}, Study Year: ${studyYearValue}, Programme: ${academicRecord.academic_record.programme.programme_code}:${academicRecord.academic_record.programme.programme_title}, Programme Type: ${academicRecord.academic_record.programmeType.programmeType.metadata_value}.`
              //     );
              //   }

              //   data.unit_amount = parseFloat(findDefinedElement.amount);
              //   data.amount = data.unit_amount * data.quantity;
              // } else if (
              //   toUpper(trim(checkValue.feesCategory.metadata_value)) ===
              //   'FUNCTIONAL FEES'
              // ) {
              //   const findFunctionalAmounts =
              //     await feesAmountPreviewService.functionalFeesPreviewContext({
              //       campus_id: academicRecord.academic_record.campus_id,
              //       academic_year_id:
              //         academicRecord.academic_record.entry_academic_year_id,
              //       intake_id: academicRecord.academic_record.intake_id,
              //       billing_category_id:
              //         academicRecord.academic_record.billing_category_id,
              //       study_level_id:
              //         academicRecord.academic_record.programme
              //           .programme_study_level_id,
              //       metadata_programme_type_id:
              //         academicRecord.academic_record.programmeType.programmeType
              //           .id,
              //     });

              //   const findDefinedElement = findFunctionalAmounts.find(
              //     (element) =>
              //       parseInt(element.fees_element_id, 10) ===
              //       data.fees_element_id
              //   );

              //   if (!findDefinedElement) {
              //     throw new Error(
              //       `You Are Trying To Assign A FUNCTIONAL FEES Element To Student: ${errName} Who Doesn't Have A Functional Fees Context Defined For It In Campus: ${academicRecord.academic_record.campus.metadata_value}, Intake: ${academicRecord.academic_record.intake.metadata_value}, Entry Academic Year: ${academicRecord.academic_record.entryAcademicYear.metadata_value}, Billing Category: ${academicRecord.academic_record.billingCategory.metadata_value}, Study Level: ${academicRecord.academic_record.programme.studyLevel.metadata_value}, Programme Type: ${academicRecord.academic_record.programmeType.programmeType.metadata_value}.`
              //     );
              //   }

              //   data.unit_amount = parseFloat(findDefinedElement.amount);
              //   data.amount = data.unit_amount * data.quantity;
              // } else if (
              //   toUpper(trim(checkValue.feesCategory.metadata_value)) ===
              //   'OTHER FEES'
              // ) {
              //   const findOtherAmounts =
              //     await feesAmountPreviewService.otherFeesPreviewContext({
              //       campus_id: academicRecord.academic_record.campus_id,
              //       academic_year_id:
              //         academicRecord.academic_record.entry_academic_year_id,
              //       intake_id: academicRecord.academic_record.intake_id,
              //       billing_category_id:
              //         academicRecord.academic_record.billing_category_id,
              //       other_fees: [data.fees_element_id],
              //     });

              //   if (!findOtherAmounts) {
              //     throw new Error(
              //       `You Are Trying To Assign AN OTHER FEES Element To Student: ${errName} Who Doesn't Have An Other Fees Context Defined For It In Campus: ${academicRecord.academic_record.campus.metadata_value}, Intake: ${academicRecord.academic_record.intake.metadata_value}, Entry Academic Year: ${academicRecord.academic_record.entryAcademicYear.metadata_value}, Billing Category: ${academicRecord.academic_record.billingCategory.metadata_value}.`
              //     );
              //   }

              //   data.unit_amount = parseFloat(findOtherAmounts[0].amount);
              //   data.amount = data.unit_amount * data.quantity;
              // } else {
              //   throw new Error(
              //     `Unable To Find A Fees Category Of The Element Assigned To Student: ${errName}.`
              //   );
              // }

              elements.push(data);

              return elements;
            }
            throw new Error(
              `Cannot find ${value} in the list of fees elements for student ${errName}`
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

              data.elements = [];
              const random = Math.floor(Math.random() * moment().unix());
              const generatedInvoiceNumber = `M-INV${random}`;

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
                  'CURRENCY',
                  'FEES ELEMENTS',
                  'AMOUNT',
                  'NARRATION',
                ],
                errName
              );

              const academicRecord = await identifyAcademicRecord(
                record['STUDENT NUMBER'],
                errName
              );

              data.student_id = academicRecord.student_id;
              data.student_programme_id = academicRecord.student_programme_id;

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

              if (record['INVOICE TYPE']) {
                data.invoice_type_id = getMetadataValueId(
                  metadataValues,
                  record['INVOICE TYPE'],
                  'INVOICE TYPES',
                  errName
                );
              }

              data.invoice_status_id = getMetadataValueId(
                metadataValues,
                'ACTIVE',
                'INVOICE STATUSES',
                errName
              );

              data.currency = toUpper(trim(record.CURRENCY));

              data.description = toUpper(trim(record.NARRATION));

              if (record['DUE DATE (MM-DD-YYYY)']) {
                data.due_date = trim(record['DUE DATE (MM-DD-YYYY)']);
              }

              data.invoice_number = generatedInvoiceNumber;

              data.is_bulk_manual_invoice = true;

              data.bulk_manual_invoice_batch = generatedBatchNumber;

              data.elements = identifyFeesElements(
                trim(record['FEES ELEMENTS']),
                data.description,
                trim(record.AMOUNT),
                trim(record.CURRENCY),
                errName
              );

              data.invoice_amount = sumBy(data.elements, 'amount');
              data.amount_due = data.invoice_amount;
              data.ip_address = req.ip;
              data.user_agent = userAgent.data;

              const upload = await invoiceService.createManualInvoice(
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
   * @param {*} req
   * @param {*} res
   */
  async downloadBulkManualInvoiceTemplate(req, res) {
    try {
      const { user } = req;

      const workbook = new excelJs.Workbook();

      const bulkInvoiceSheet = workbook.addWorksheet('BULK MANUAL INVOICE');
      const academicYearsSheet = workbook.addWorksheet('Sheet2');
      const semestersSheet = workbook.addWorksheet('Sheet3');
      const studyYearsSheet = workbook.addWorksheet('Sheet4');
      const invoiceTypeSheet = workbook.addWorksheet('Sheet5');
      const currencySheet = workbook.addWorksheet('Sheet6');
      const feesElementSheet = workbook.addWorksheet('Sheet7');

      bulkInvoiceSheet.properties.defaultColWidth =
        bulkManualInvoiceColumns.length;
      bulkInvoiceSheet.columns = bulkManualInvoiceColumns;
      academicYearsSheet.state = 'veryHidden';
      semestersSheet.state = 'veryHidden';
      studyYearsSheet.state = 'veryHidden';
      currencySheet.state = 'veryHidden';
      invoiceTypeSheet.state = 'veryHidden';
      feesElementSheet.state = 'veryHidden';

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

      const feesElements = await feesElementService
        .findAllFeesElements({
          include: [
            {
              association: 'feesCategory',
              attributes: ['id', 'metadata_value'],
            },
            {
              association: 'chartOfAccount',
              attributes: ['id', 'account_name', 'account_code'],
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

      invoiceTypeSheet.addRows(getMetadataValues(metadata, 'INVOICE TYPES'));

      academicYearsSheet.addRows(
        academicYears.map((item) => [`${item.academicYear.metadata_value}`])
      );

      feesElementSheet.addRows(
        feesElements.map((item) => [
          `${item.fees_element_code}: ${item.fees_element_name} (${item.feesCategory.metadata_value})`,
        ])
      );

      // Column Validations
      bulkInvoiceSheet.dataValidations.add('B2:B1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=Sheet2!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid value from the list',
      });

      bulkInvoiceSheet.dataValidations.add('C2:C1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=Sheet3!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid value from the list',
      });

      bulkInvoiceSheet.dataValidations.add('D2:D1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=Sheet4!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid value from the list',
      });

      bulkInvoiceSheet.dataValidations.add('E2:E1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=Sheet5!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid value from the list',
      });

      bulkInvoiceSheet.dataValidations.add('F2:F1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=Sheet6!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid value from the list',
      });

      bulkInvoiceSheet.dataValidations.add('H2:H1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=Sheet7!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid value from the list',
      });

      bulkInvoiceSheet.dataValidations.add('I2:I1000', {
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

      const uploadPath = `${process.cwd()}/src/assets/documents/templates`;

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true }, (err) => {
          throw new Error(err.message);
        });
      }

      const template = `${uploadPath}/download-bulk-invoice-template-${
        user.surname
      }-${user.other_names}-${user.id}-${now()}.xlsm`;

      await workbook.xlsx.writeFile(template);
      await res.download(
        template,
        'BULK-MANUAL-INVOICE-UPLOAD-TEMPLATE.xlsx',
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
}

const getTuitionFeesElementsAttributes = function () {
  return {
    attributes: {
      exclude: ['created_at', 'updated_at'],
    },
  };
};

const getFunctionalFeesElementsAttributes = function () {
  return {
    attributes: {
      exclude: ['created_at', 'updated_at'],
    },
  };
};

const getOtherFeesElementsAttributes = function () {
  return {
    attributes: {
      exclude: ['created_at', 'updated_at'],
    },
  };
};

const getManualInvoiceElementsAttributes = function () {
  return {
    attributes: {
      exclude: ['created_at', 'updated_at'],
    },
    include: [
      {
        association: 'feesElement',
        attributes: ['fees_element_code', 'fees_element_name', 'description'],
      },
    ],
  };
};

module.exports = InvoiceController;
