const models = require('@models');
const { isEmpty } = require('lodash');
const moment = require('moment');
const { QueryTypes } = require('sequelize');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');
const { Op } = require('sequelize');

// This Class is responsible for handling all database interactions for this entity
class InvoiceService {
  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single record object from data object
   *@
   */
  static async generateTuitionInvoiceWithHelper(
    data,
    enrollment,
    extraData,
    student,
    transaction
  ) {
    try {
      const random = Math.floor(Math.random() * moment().unix());
      const generatedInvoiceNumber = `T-INV${random}`;

      let creator = null;

      if (extraData.created_by_id !== null) {
        creator = extraData.created_by_id;
      }

      if (!isEmpty(data.tuitionAmounts.elements)) {
        const tuitionAmountFeesElements = data.tuitionAmounts.elements;
        const tuitionAmountFeesElementTotal = data.tuitionAmounts.total;

        let arrayOfCurrencies = [];

        arrayOfCurrencies = tuitionAmountFeesElements.map(
          (currency) => currency.currency
        );

        tuitionAmountFeesElements.fees_element_id =
          tuitionAmountFeesElements.map(
            (feesElement) => feesElement.fees_element_id
          );

        const feesElements = [];

        tuitionAmountFeesElements.forEach((feesElement) => {
          feesElement.fees_element_id = parseInt(
            feesElement.fees_element_id,
            10
          );
          feesElements.push({
            ...feesElement,
            discounted_amount: feesElement.discount_amount,
          });
        });

        const newData = {
          enrollment_id: enrollment,
          student_id: student,
          student_programme_id: extraData.student_programme_id,
          invoice_type_id: extraData.invoice_type_id,
          invoice_status_id: extraData.invoice_status_id,
          due_date: extraData.due_date,
          invoice_number: generatedInvoiceNumber,
          invoice_amount: tuitionAmountFeesElementTotal,
          currency: arrayOfCurrencies[0],
          amount_due: tuitionAmountFeesElementTotal,
          tuitionInvoiceFeesElement: feesElements,
          created_by_id: creator,
          description: 'Tuition Fees',
        };

        const record = await models.EnrollmentTuitionInvoice.create(newData, {
          include: [
            {
              association:
                models.EnrollmentTuitionInvoice.tuitionInvoiceFeesElement,
            },
          ],
          transaction,
        });

        return record;
      }
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `invoice.service.js`,
        `generateTuitionInvoiceWithHelper`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async generateFunctionalFeesInvoiceWithHelper(
    data,
    enrollment,
    extraData,
    desc,
    student,
    transaction
  ) {
    try {
      const random = Math.floor(Math.random() * moment().unix());
      const generatedInvoiceNumber = `F-INV${random}`;

      let creator = null;

      if (extraData.created_by_id !== null) {
        creator = extraData.created_by_id;
      }

      if (
        data.functionalFeesAmounts &&
        !isEmpty(data.functionalFeesAmounts.elements)
      ) {
        const functionalFeesElements = data.functionalFeesAmounts.elements;
        const functionalFeesElementTotal = data.functionalFeesAmounts.total;

        let arrayOfCurrencies = [];

        arrayOfCurrencies = functionalFeesElements.map(
          (currency) => currency.currency
        );

        const feesElements = [];

        functionalFeesElements.forEach((feesElement) => {
          feesElement.fees_element_id = parseInt(
            feesElement.fees_element_id,
            10
          );
          feesElements.push({
            ...feesElement,
            discounted_amount: feesElement.discount_amount,
          });
        });

        const newData = {
          enrollment_id: enrollment,
          student_id: student,
          student_programme_id: extraData.student_programme_id,
          invoice_type_id: extraData.invoice_type_id,
          invoice_status_id: extraData.invoice_status_id,
          due_date: extraData.due_date,
          invoice_number: generatedInvoiceNumber,
          invoice_amount: functionalFeesElementTotal,
          currency: arrayOfCurrencies[0],
          amount_due: functionalFeesElementTotal,
          functionalElements: feesElements,
          created_by_id: creator,
          description: desc,
        };

        const record = await models.EnrollmentFunctionalFeesInvoice.create(
          newData,
          {
            include: [
              {
                association:
                  models.EnrollmentFunctionalFeesInvoice.functionalElements,
              },
            ],
            transaction,
          }
        );

        return record;
      }
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `invoice.service.js`,
        `generateFunctionalFeesInvoiceWithHelper`,
        `POST`
      );
    }
  }

  /**
   * generateOtherFeesInvoiceWithHelper
   * @param {*} data
   */
  static async generateOtherFeesInvoiceWithHelper(data, enrollment, staffId) {
    try {
      const random = Math.floor(Math.random() * moment().unix());
      const generatedInvoiceNumber = `O-INV${random}`;

      let creator = null;

      if (staffId !== null) {
        creator = staffId;
      }

      const otherFeesElements = data.otherFees.elements;
      const otherFeesElementTotal = data.otherFees.total;

      let arrayOfCurrencies = [];

      arrayOfCurrencies = otherFeesElements.map(
        (currency) => currency.currency
      );

      const feesElements = [];

      otherFeesElements.forEach((feesElement) => {
        feesElement.fees_element_id = parseInt(feesElement.fees_element_id, 10);
        feesElements.push({
          ...feesElement,
          discounted_amount: feesElement.discount_amount,
        });
      });

      const newData = {
        enrollment_id: enrollment,
        invoice_number: generatedInvoiceNumber,
        invoice_amount: otherFeesElementTotal,
        currency: arrayOfCurrencies[0],
        amount_due: otherFeesElementTotal,
        otherFeesInvoiceFeesElements: feesElements,
        created_by_id: creator,
        description: 'Other Fees',
      };

      const record = await models.EnrollmentOtherFeesInvoice.create(newData, {
        include: [
          {
            association:
              models.EnrollmentOtherFeesInvoice.otherFeesInvoiceFeesElements,
          },
        ],
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `invoice.service.js`,
        `generateOtherFeesInvoiceWithHelper`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single record object from data object
   *@
   */
  static async createRetakersAndStayPutersTuitionInvoiceBasedOnPolicy(
    data,
    transaction
  ) {
    try {
      const random = Math.floor(Math.random() * moment().unix());
      const generatedInvoiceNumber = `T-INV${random}`;

      data.invoice_number = generatedInvoiceNumber;

      const result = await models.EnrollmentTuitionInvoice.create(data, {
        transaction,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `invoice.service.js`,
        `createRetakersAndStayPutersTuitionInvoiceBasedOnPolicy`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single record object from data object
   *@
   */
  static async createGraduatePolicyTuitionInvoices(data, transaction) {
    try {
      const random = Math.floor(Math.random() * moment().unix());
      const generatedInvoiceNumber = `T-INV${random}`;

      data.invoice_number = generatedInvoiceNumber;

      const result = await models.EnrollmentTuitionInvoice.create(data, {
        include: [
          {
            association:
              models.EnrollmentTuitionInvoice.tuitionInvoiceFeesElement,
          },
        ],
        transaction,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `invoice.service.js`,
        `createGraduatePolicyTuitionInvoices`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} enrollment
   */
  static async createLateEnrollmentAndRegistrationOtherFeesInvoice(
    data,
    enrollment,
    studentId,
    studentProgrammeId,
    otherFeesCategory,
    description,
    findMandatoryInvoiceType,
    findActiveInvoiceStatus,
    transaction
  ) {
    try {
      const random = Math.floor(Math.random() * moment().unix());
      const generatedInvoiceNumber = `O-INV${random}`;

      if (!isEmpty(data.otherFees.elements)) {
        const otherFeesElements = data.otherFees.elements;
        const otherFeesElementTotal = data.otherFees.total;

        let arrayOfCurrencies = [];

        arrayOfCurrencies = otherFeesElements.map(
          (currency) => currency.currency
        );

        const feesElements = [];

        otherFeesElements.forEach((feesElement) => {
          feesElement.fees_element_id = parseInt(
            feesElement.fees_element_id,
            10
          );
          feesElements.push({
            ...feesElement,
            discounted_amount: feesElement.discount_amount,
          });
        });

        const newData = {
          enrollment_id: enrollment,
          student_id: studentId,
          student_programme_id: studentProgrammeId,
          other_fees_category_id: otherFeesCategory,
          invoice_type_id: findMandatoryInvoiceType,
          invoice_status_id: findActiveInvoiceStatus,
          invoice_number: generatedInvoiceNumber,
          invoice_amount: otherFeesElementTotal,
          currency: arrayOfCurrencies[0],
          amount_due: otherFeesElementTotal,
          description: description,
          otherFeesInvoiceFeesElements: feesElements,
        };

        const record = await models.EnrollmentOtherFeesInvoice.create(newData, {
          include: [
            {
              association:
                models.EnrollmentOtherFeesInvoice.otherFeesInvoiceFeesElements,
            },
          ],
          transaction,
        });

        return record;
      }
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `invoice.service.js`,
        `createLateEnrollmentAndRegistrationOtherFeesInvoice`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} enrollment
   */
  static async createOtherFeesInvoiceBasedOnPolicy(
    data,
    enrollment,
    studentId,
    studentProgrammeId,
    otherFeesCategory,
    description,
    findMandatoryInvoiceType,
    findActiveInvoiceStatus,
    registrationCourseUnitId,
    transaction
  ) {
    try {
      const random = Math.floor(Math.random() * moment().unix());
      const generatedInvoiceNumber = `O-INV${random}`;

      const otherFeesElements = data.otherFees.elements;
      const otherFeesElementTotal = data.otherFees.total;

      let arrayOfCurrencies = [];

      arrayOfCurrencies = otherFeesElements.map(
        (currency) => currency.currency
      );

      const feesElements = [];

      otherFeesElements.forEach((feesElement) => {
        feesElement.fees_element_id = parseInt(feesElement.fees_element_id, 10);
        feesElements.push({
          ...feesElement,
          discounted_amount: feesElement.discount_amount,
        });
      });

      const newData = {
        enrollment_id: enrollment,
        student_id: studentId,
        student_programme_id: studentProgrammeId,
        other_fees_category_id: otherFeesCategory,
        registration_course_unit_id: registrationCourseUnitId,
        invoice_type_id: findMandatoryInvoiceType,
        invoice_status_id: findActiveInvoiceStatus,
        invoice_number: generatedInvoiceNumber,
        invoice_amount: otherFeesElementTotal,
        currency: arrayOfCurrencies[0],
        amount_due: otherFeesElementTotal,
        description: description,
        otherFeesInvoiceFeesElements: feesElements,
      };

      const record = await models.EnrollmentOtherFeesInvoice.create(newData, {
        include: [
          {
            association:
              models.EnrollmentOtherFeesInvoice.otherFeesInvoiceFeesElements,
          },
        ],
        transaction,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `invoice.service.js`,
        `createOtherFeesInvoiceBasedOnPolicy`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} enrollment
   * @param {*} studentId
   * @param {*} studentProgrammeId
   * @param {*} otherFeesCategory
   * @param {*} description
   * @param {*} findMandatoryInvoiceType
   * @param {*} findActiveInvoiceStatus
   * @param {*} enrollmentCourseUnitId
   * @param {*} transaction
   * @returns
   */
  static async createEnrollmentRetakeOtherFeesInvoiceBasedOnPolicy(
    data,
    enrollment,
    studentId,
    studentProgrammeId,
    otherFeesCategory,
    description,
    findMandatoryInvoiceType,
    findActiveInvoiceStatus,
    enrollmentCourseUnitId,
    transaction
  ) {
    try {
      const random = Math.floor(Math.random() * moment().unix());
      const generatedInvoiceNumber = `O-INV${random}`;

      const otherFeesElements = data.otherFees.elements;
      const otherFeesElementTotal = data.otherFees.total;

      let arrayOfCurrencies = [];

      arrayOfCurrencies = otherFeesElements.map(
        (currency) => currency.currency
      );

      const feesElements = [];

      otherFeesElements.forEach((feesElement) => {
        feesElement.fees_element_id = parseInt(feesElement.fees_element_id, 10);
        feesElements.push({
          ...feesElement,
          discounted_amount: feesElement.discount_amount,
        });
      });

      const newData = {
        enrollment_id: enrollment,
        student_id: studentId,
        student_programme_id: studentProgrammeId,
        other_fees_category_id: otherFeesCategory,
        enrollment_course_unit_id: enrollmentCourseUnitId,
        invoice_type_id: findMandatoryInvoiceType,
        invoice_status_id: findActiveInvoiceStatus,
        invoice_number: generatedInvoiceNumber,
        invoice_amount: otherFeesElementTotal,
        currency: arrayOfCurrencies[0],
        amount_due: otherFeesElementTotal,
        description: description,
        otherFeesInvoiceFeesElements: feesElements,
      };

      const record = await models.EnrollmentOtherFeesInvoice.create(newData, {
        include: [
          {
            association:
              models.EnrollmentOtherFeesInvoice.otherFeesInvoiceFeesElements,
          },
        ],
        transaction,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `invoice.service.js`,
        `createEnrollmentRetakeOtherFeesInvoiceBasedOnPolicy`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} student
   */
  static async findAllOfTheStudentInvoices(student) {
    try {
      const filtered = await models.sequelize.query(
        `select * from  enrollment_and_registration_mgt.student_enrollment_history_function(${student})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `invoice.service.js`,
        `findAllOfTheStudentInvoices`,
        `GET`
      );
    }
  }

  /**
   * GET STUDENTS INVOICE CATEGORY BY DATE
   *
   * @param {*} dateFrom
   * @param {*} dateTo
   * @param {*} category
   * @returns
   */
  static async getStudentInvoicesByDate(queryData = {}) {
    try {
      let table;

      if (queryData.category === 'tuition')
        table = 'student_tuition_invoices_report_by_date_view';
      else if (queryData.category === 'functional')
        table = 'student_functional_invoices_report_by_date_view';
      else if (queryData.category === 'manual')
        table = 'student_manual_invoices_report_by_date_view';
      else if (queryData.category === 'other')
        table = 'student_other_fees_invoices_report_by_date_view';
      else throw new Error('Invalid Category of invoice provided');

      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.${table} where created_at >= '${queryData.start_date}' AND created_at <= '${queryData.end_date}' AND invoice_status_id = ${queryData.invoice_status_id}`,
        {
          type: QueryTypes.SELECT,
          raw: true,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `invoice.service.js`,
        `getStudentInvoicesByDate`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} student
   */
  static async findAllTuitionFunctionalAndOtherFeesInvoices(student) {
    try {
      const filtered = await models.sequelize.query(
        `select * from  enrollment_and_registration_mgt.enrollment_invoice_function(${student})
        where tuition_invoices::text <> '[]'::text or 
        functional_fees_invoices::text <> '[]'::text or 
        other_fees_invoices::text <> '[]'::text `,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `invoice.service.js`,
        `findAllTuitionFunctionalAndOtherFeesInvoices`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} student
   */
  static async findAllManualInvoices(student) {
    try {
      const filtered = await models.sequelize.query(
        `select * from  enrollment_and_registration_mgt.enrollment_manual_invoice_function(${student})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `invoice.service.js`,
        `findAllManualInvoices`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} student
   */
  static async findAllOfTheStudentTransactions(student) {
    try {
      const filtered = await models.sequelize.query(
        `select * from  enrollment_and_registration_mgt.student_transaction_function(${student})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `invoice.service.js`,
        `findAllOfTheStudentTransactions`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} student
   */
  static async findAllValidUnpaidInvoices(student) {
    try {
      const filtered = await models.sequelize.query(
        `select * from  enrollment_and_registration_mgt.student_invoices_amount_due_function(${student})`,
        {
          type: QueryTypes.SELECT,
          plain: true,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `invoice.service.js`,
        `findAllValidUnpaidInvoices`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} student
   */
  static async findAllUnpaidManualInvoices(student) {
    try {
      const result = await models.sequelize.query(
        `select * from  enrollment_and_registration_mgt.unpaid_manual_invoices_function(${student})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return { manual_invoices: isEmpty(result) ? [] : result };
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `invoice.service.js`,
        `findAllUnpaidManualInvoices`,
        `GET`
      );
    }
  }

  /** fetchRequestsToVoidOtherFeesInvoices
   *
   *
   */
  static async fetchRequestsToVoidOtherFeesInvoices() {
    try {
      const filtered = await models.sequelize.query(
        `select * from  enrollment_and_registration_mgt.voiding_other_fees_invoices_function()`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `invoice.service.js`,
        `fetchRequestsToVoidOtherFeesInvoices`,
        `GET`
      );
    }
  }

  /** fetchRequestsToVoidManualInvoices
   *
   *
   */
  static async fetchRequestsToVoidManualInvoices() {
    try {
      const filtered = await models.sequelize.query(
        `select * from  enrollment_and_registration_mgt.voiding_manual_invoices_function()`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `invoice.service.js`,
        `fetchRequestsToVoidManualInvoices`,
        `GET`
      );
    }
  }

  /** fetchAllVoidedTuitionFunctionalOtherFeesInvoices
   *
   * @param {*} student
   */
  static async fetchAllVoidedTuitionFunctionalOtherFeesInvoices(student) {
    try {
      const filtered = await models.sequelize.query(
        `select * from  enrollment_and_registration_mgt.voided_enrollment_invoice_function(${student})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `invoice.service.js`,
        `fetchAllVoidedTuitionFunctionalOtherFeesInvoices`,
        `GET`
      );
    }
  }

  /** fetchAllVoidedManualInvoices
   *
   * @param {*} student
   */
  static async fetchAllVoidedManualInvoices(student) {
    try {
      const filtered = await models.sequelize.query(
        `select * from  enrollment_and_registration_mgt.voided_manual_invoice_function(${student})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `invoice.service.js`,
        `fetchAllVoidedManualInvoices`,
        `GET`
      );
    }
  }

  /** fetchAllInvoiceExemptionRequestsForOneStudent
   *
   * @param {*} student
   */
  static async fetchAllInvoiceExemptionRequestsForOneStudent(student) {
    try {
      const filtered = await models.sequelize.query(
        `select * from  enrollment_and_registration_mgt.invoice_exemption_request_function(${student})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `invoice.service.js`,
        `fetchAllInvoiceExemptionRequestsForOneStudent`,
        `GET`
      );
    }
  }

  /** fetchAllInvoiceExemptionRequestsForAllStudents
   *
   * @param {*} student
   */
  static async fetchAllInvoiceExemptionRequestsForAllStudents() {
    try {
      const filtered = await models.sequelize.query(
        `select * from  enrollment_and_registration_mgt.invoice_exemption_requests_for_all_students_function()`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `invoice.service.js`,
        `fetchAllInvoiceExemptionRequestsForAllStudents`,
        `GET`
      );
    }
  }

  // find invoice fees elements
  static async findInvoiceElementsRecord(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from  enrollment_and_registration_mgt.invoice_fees_elements_function('${data.prn}')`,
        {
          type: QueryTypes.SELECT,
          plain: true,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `invoice.service.js`,
        `findInvoiceElementsRecord`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single record object basing on the options
   */
  static async findOneTuitionInvoiceRecord(options) {
    try {
      const record = await models.EnrollmentTuitionInvoice.findOne({
        ...options,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `invoice.service.js`,
        `findOneTuitionInvoiceRecord`,
        `GET`
      );
    }
  }

  static async findOneFunctionalInvoiceRecord(options) {
    try {
      const record = await models.EnrollmentFunctionalFeesInvoice.findOne({
        ...options,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `invoice.service.js`,
        `findOneFunctionalInvoiceRecord`,
        `GET`
      );
    }
  }

  static async findOneManualInvoiceRecord(options) {
    try {
      const record = await models.EnrollmentManualInvoice.findOne({
        ...options,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `invoice.service.js`,
        `findOneManualInvoiceRecord`,
        `GET`
      );
    }
  }

  static async findOneOtherFeesInvoiceRecords(options) {
    try {
      const record = await models.EnrollmentOtherFeesInvoice.findOne({
        ...options,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `invoice.service.js`,
        `findOneOtherFeesInvoiceRecords`,
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
  static async deleteOtherFeesInvoiceRecord(id) {
    try {
      const deleted = await models.EnrollmentOtherFeesInvoice.destroy({
        where: { id },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `invoice.service.js`,
        `deleteOtherFeesInvoiceRecord`,
        `DELETE`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async createManualInvoice(data, transaction) {
    try {
      const record = await models.EnrollmentManualInvoice.create(data, {
        include: [
          {
            association: models.EnrollmentManualInvoice.elements,
          },
        ],
        transaction,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `invoice.service.js`,
        `createManualInvoice`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async dropFunctionalInvoice(transaction) {
    try {
      const record = await models.EnrollmentManualInvoice.destroy({
        where: {
          id: {
            [Op.gte]: 46445,
          },
        },

        // transaction,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `invoice.service.js`,
        `dropFunctionalInvoice`,
        `POST`
      );
    }
  }

  /**
   * BULK CREATE INTERNSHIP BILLING FOR MUK
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async bulkCreateInternshipInvoice(data, transaction) {
    try {
      const record = await models.EnrollmentFunctionalFeesInvoice.bulkCreate(
        data,
        {
          include: [
            {
              association: models.EnrollmentFunctionalFeesInvoice.feesElements,
            },
          ],
          transaction,
        }
      );

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `invoice.service.js`,
        `bulkCreateInternshipInvoice`,
        `POST`
      );
    }
  }

  /**
   * Fetch All Invoices
   *
   *
   */
  static async findAllTuitionInvoices(options) {
    try {
      const records = await models.EnrollmentTuitionInvoice.findAll({
        ...options,
      });

      return records;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `invoice.service.js`,
        `findAllTuitionInvoices`,
        `GET`
      );
    }
  }

  static async findAllFunctionalFeesInvoices(options) {
    try {
      const records = await models.EnrollmentFunctionalFeesInvoice.findAll({
        ...options,
      });

      return records;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `invoice.service.js`,
        `findAllFunctionalFeesInvoices`,
        `GET`
      );
    }
  }

  static async findAllOtherFeesInvoices(options) {
    try {
      const records = await models.EnrollmentOtherFeesInvoice.findAll({
        ...options,
      });

      return records;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `invoice.service.js`,
        `findAllOtherFeesInvoices`,
        `GET`
      );
    }
  }

  static async findAllEnrollmentManualInvoices(options) {
    try {
      const record = await models.EnrollmentManualInvoice.findAll({
        ...options,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `invoice.service.js`,
        `findAllEnrollmentManualInvoices`,
        `GET`
      );
    }
  }

  /**
   * Fetch Fees Elements
   * @param {*} invoice_number
   * @param {*} data
   */

  static async findAllTuitionInvoiceElements(options) {
    try {
      const records = await models.TuitionInvoiceFeesElement.findAll({
        ...options,
      });

      return records;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `invoice.service.js`,
        `findAllTuitionInvoiceElements`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */

  static async createTuitionInvoiceElement(data, transaction) {
    try {
      const records = await models.TuitionInvoiceFeesElement.create(
        data,
        transaction
      );

      return records;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `invoice.service.js`,
        `createTuitionInvoiceElement`,
        `POST`
      );
    }
  }

  static async findAllFunctionalInvoiceElements(options) {
    try {
      const records = await models.FunctionalInvoiceFeesElement.findAll({
        ...options,
      });

      return records;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `invoice.service.js`,
        `findAllFunctionalInvoiceElements`,
        `GET`
      );
    }
  }

  static async findAllOtherFeesInvoiceElements(options) {
    try {
      const records = await models.OtherFeesInvoiceFeesElement.findAll({
        ...options,
      });

      return records;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `invoice.service.js`,
        `findAllOtherFeesInvoiceElements`,
        `GET`
      );
    }
  }

  static async findAllManualInvoiceElements(options) {
    try {
      const records = await models.ManualInvoiceFeesElement.findAll({
        ...options,
      });

      return records;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `invoice.service.js`,
        `findAllManualInvoiceElements`,
        `GET`
      );
    }
  }

  /** updateEnrollmentTuitionInvoice
   *
   * @param {*} id
   * @param {*} data
   */
  static async updateEnrollmentTuitionInvoice(id, data, transaction) {
    try {
      const updated = await models.EnrollmentTuitionInvoice.update(
        {
          ...data,
        },
        { where: { id }, transaction, returning: true }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `invoice.service.js`,
        `updateEnrollmentTuitionInvoice`,
        `PUT`
      );
    }
  }

  /**
   *
   * @param {*} id
   * @param {*} data
   */
  static async updateEnrollmentFunctionalInvoice(id, data, transaction) {
    try {
      const updated = await models.EnrollmentFunctionalFeesInvoice.update(
        { ...data },
        { where: { id }, transaction, returning: true }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `invoice.service.js`,
        `updateEnrollmentFunctionalInvoice`,
        `PUT`
      );
    }
  }

  /**
   *
   * @param {*} id
   * @param {*} data
   */
  static async updateEnrollmentOtherFeesInvoice(id, data, transaction) {
    try {
      const updated = await models.EnrollmentOtherFeesInvoice.update(
        { ...data },
        { where: { id }, transaction, returning: true }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `invoice.service.js`,
        `updateEnrollmentOtherFeesInvoice`,
        `PUT`
      );
    }
  }

  /** updateEnrollmentManualInvoice
   *
   * @param {*} id
   * @param {*} data
   */
  static async updateEnrollmentManualInvoice(id, data, transaction) {
    try {
      const updated = await models.EnrollmentManualInvoice.update(
        { ...data },
        { where: { id }, transaction, returning: true }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `invoice.service.js`,
        `updateEnrollmentManualInvoice`,
        `PUT`
      );
    }
  }

  /**
   *
   * @param {*} id
   * @param {*} data
   */
  static async deleteEnrollmentManualInvoice(id, transaction) {
    try {
      const updated = await models.EnrollmentManualInvoice.destroy({
        where: { id },
        transaction,
      });

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `invoice.service.js`,
        `deleteEnrollmentManualInvoice`,
        `PUT`
      );
    }
  }

  // INCREMENT INVOICES
  /** Increment Tuition Invoice
   *
   * @param {*} id
   * @param {*} data
   */
  static async incrementTuitionInvoice(
    field,
    by,
    id,
    creditNoteId,
    transaction
  ) {
    try {
      const incremented = await models.EnrollmentTuitionInvoice.increment(
        field,
        {
          by,
          where: { id },
          transaction,
          returning: true,
        }
      );

      const findOneCreditNote = await models.CreditNote.findOne({
        where: {
          id: creditNoteId,
        },
      });

      if (!findOneCreditNote) {
        throw new Error(`Unable to find the credit note.`);
      }

      const findOneInvoiceElement =
        await models.TuitionInvoiceFeesElement.findOne({
          where: {
            tuition_invoice_id: findOneCreditNote.dataValues.invoice_id,
            fees_element_id: findOneCreditNote.dataValues.fees_element_id,
          },
          raw: true,
        });

      if (!findOneInvoiceElement) {
        throw new Error(
          `Unable to find the invoice element related to the credit note.`
        );
      }

      const totalElementAmount = findOneInvoiceElement.new_amount
        ? parseInt(findOneInvoiceElement.new_amount, 10)
        : parseInt(findOneInvoiceElement.amount, 10);

      let hasCleard = false;

      if (findOneInvoiceElement.amount_paid) {
        const totalPaid =
          parseInt(findOneInvoiceElement.amount_paid, 10) +
          parseInt(findOneCreditNote.dataValues.amount, 10);

        if (totalElementAmount === totalPaid) {
          hasCleard = true;
        }

        await models.TuitionInvoiceFeesElement.update(
          {
            amount_paid: totalPaid,
            cleared: hasCleard,
          },
          {
            where: {
              id: findOneInvoiceElement.id,
            },
            transaction,
            returning: true,
          }
        );
      } else {
        const totalPaid = parseInt(findOneCreditNote.amount, 10);

        if (totalElementAmount === totalPaid) {
          hasCleard = true;
        }

        await models.TuitionInvoiceFeesElement.update(
          {
            amount_paid: totalPaid,
            cleared: hasCleard,
          },
          {
            where: {
              id: findOneInvoiceElement.id,
            },
            transaction,
            returning: true,
          }
        );
      }

      return incremented;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `invoice.service.js`,
        `incrementTuitionInvoice`,
        `POST`
      );
    }
  }

  /**
   *
   */
  static async updateTuitioninvoiceByNotes(id, by, action, transaction) {
    try {
      const findOneInvoice = await models.EnrollmentTuitionInvoice.findOne({
        where: { id },
        raw: true,
      });

      if (!findOneInvoice) {
        throw new Error(`Unable to find the invoice.`);
      }

      let newAmountPaid = 0;

      let newAmountDue = 0;

      let newPercentageCompletion = 0;

      if (action === 'credit') {
        newAmountPaid =
          parseInt(findOneInvoice.amount_paid, 10) + parseInt(by, 10);

        newAmountDue =
          parseInt(findOneInvoice.amount_due, 10) - parseInt(by, 10);

        newPercentageCompletion = Math.floor(
          (newAmountPaid / parseFloat(findOneInvoice.invoice_amount)) * 100
        );
      } else if (action === 'debit') {
        if (parseInt(findOneInvoice.amount_paid, 10) < parseInt(by, 10)) {
          throw new Error(
            `Amount To Debit Is Greater Than The Invoice Amount.`
          );
        }
        newAmountPaid =
          parseInt(findOneInvoice.amount_paid, 10) - parseInt(by, 10);

        newAmountDue =
          parseInt(findOneInvoice.amount_due, 10) + parseInt(by, 10);

        newPercentageCompletion = Math.floor(
          (newAmountPaid / parseFloat(findOneInvoice.invoice_amount)) * 100
        );
      }

      await models.EnrollmentTuitionInvoice.update(
        {
          amount_due: newAmountDue,
          amount_paid: newAmountPaid,
          percentage_completion: newPercentageCompletion,
        },
        {
          where: {
            id,
          },
          transaction,
          returning: true,
        }
      );
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `invoice.service.js`,
        `updateTuitioninvoiceByNotes`,
        `PUT`
      );
    }
  }

  /** Increment Functional Fees Invoice
   *
   * @param {*} id
   * @param {*} data
   */
  static async incrementFunctionalInvoice(
    field,
    by,
    id,
    creditNoteId,
    transaction
  ) {
    try {
      const incremented =
        await models.EnrollmentFunctionalFeesInvoice.increment(field, {
          by,
          where: { id },
          transaction,
          returning: true,
        });

      const findOneCreditNote = await models.CreditNote.findOne({
        where: {
          id: creditNoteId,
        },
      });

      if (!findOneCreditNote) {
        throw new Error(`Unable to find the credit note.`);
      }

      const findOneInvoiceElement =
        await models.FunctionalInvoiceFeesElement.findOne({
          where: {
            functional_invoice_id: findOneCreditNote.dataValues.invoice_id,
            fees_element_id: findOneCreditNote.dataValues.fees_element_id,
          },
          raw: true,
        });

      if (!findOneInvoiceElement) {
        throw new Error(
          `Unable to find the invoice element related to the credit note.`
        );
      }

      const totalElementAmount = findOneInvoiceElement.new_amount
        ? parseInt(findOneInvoiceElement.new_amount, 10)
        : parseInt(findOneInvoiceElement.amount, 10);

      let hasCleard = false;

      if (findOneInvoiceElement.amount_paid) {
        const totalPaid =
          parseInt(findOneInvoiceElement.amount_paid, 10) +
          parseInt(findOneCreditNote.dataValues.amount, 10);

        if (totalElementAmount === totalPaid) {
          hasCleard = true;
        }

        await models.FunctionalInvoiceFeesElement.update(
          {
            amount_paid: totalPaid,
            cleared: hasCleard,
          },
          {
            where: {
              id: findOneInvoiceElement.id,
            },
            transaction,
            returning: true,
          }
        );
      } else {
        const totalPaid = parseInt(findOneCreditNote.amount, 10);

        if (totalElementAmount === totalPaid) {
          hasCleard = true;
        }

        await models.FunctionalInvoiceFeesElement.update(
          {
            amount_paid: totalPaid,
            cleared: hasCleard,
          },
          {
            where: {
              id: findOneInvoiceElement.id,
            },
            transaction,
            returning: true,
          }
        );
      }

      return incremented;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `invoice.service.js`,
        `incrementFunctionalInvoice`,
        `POST`
      );
    }
  }

  /**
   *
   */
  static async updateFunctionalinvoiceByNotes(id, by, action, transaction) {
    try {
      const findOneInvoice =
        await models.EnrollmentFunctionalFeesInvoice.findOne({
          where: { id },
          raw: true,
        });

      if (!findOneInvoice) {
        throw new Error(`Unable to find the invoice.`);
      }

      let newAmountPaid = 0;

      let newAmountDue = 0;

      let newPercentageCompletion = 0;

      if (action === 'credit') {
        newAmountPaid =
          parseInt(findOneInvoice.amount_paid, 10) + parseInt(by, 10);

        newAmountDue =
          parseInt(findOneInvoice.amount_due, 10) - parseInt(by, 10);

        newPercentageCompletion = Math.floor(
          (newAmountPaid / parseFloat(findOneInvoice.invoice_amount)) * 100
        );
      } else if (action === 'debit') {
        if (parseInt(findOneInvoice.amount_paid, 10) < parseInt(by, 10)) {
          throw new Error(
            `Amount To Debit Is Greater Than The Invoice Amount.`
          );
        }
        newAmountPaid =
          parseInt(findOneInvoice.amount_paid, 10) - parseInt(by, 10);

        newAmountDue =
          parseInt(findOneInvoice.amount_due, 10) + parseInt(by, 10);

        newPercentageCompletion = Math.floor(
          (newAmountPaid / parseFloat(findOneInvoice.invoice_amount)) * 100
        );
      }

      await models.EnrollmentFunctionalFeesInvoice.update(
        {
          amount_due: newAmountDue,
          amount_paid: newAmountPaid,
          percentage_completion: newPercentageCompletion,
        },
        {
          where: {
            id,
          },
          transaction,
          returning: true,
        }
      );
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `invoice.service.js`,
        `updateFunctionalinvoiceByNotes`,
        `PUT`
      );
    }
  }

  /**
   * Increment Other Fees Invoice
   * @param {*} id
   * @param {*} data
   */
  static async incrementOtherFeesInvoice(
    field,
    by,
    id,
    creditNoteId,
    transaction
  ) {
    try {
      const incremented = await models.EnrollmentOtherFeesInvoice.increment(
        field,
        {
          by,
          where: { id },
          transaction,
          returning: true,
        }
      );

      const findOneCreditNote = await models.CreditNote.findOne({
        where: {
          id: creditNoteId,
        },
      });

      if (!findOneCreditNote) {
        throw new Error(`Unable to find the credit note.`);
      }

      const findOneInvoiceElement =
        await models.OtherFeesInvoiceFeesElement.findOne({
          where: {
            other_fees_invoice_id: findOneCreditNote.dataValues.invoice_id,
            fees_element_id: findOneCreditNote.dataValues.fees_element_id,
          },
          raw: true,
        });

      if (!findOneInvoiceElement) {
        throw new Error(
          `Unable to find the invoice element related to the credit note.`
        );
      }

      const totalElementAmount = findOneInvoiceElement.new_amount
        ? parseInt(findOneInvoiceElement.new_amount, 10)
        : parseInt(findOneInvoiceElement.amount, 10);

      let hasCleard = false;

      if (findOneInvoiceElement.amount_paid) {
        const totalPaid =
          parseInt(findOneInvoiceElement.amount_paid, 10) +
          parseInt(findOneCreditNote.dataValues.amount, 10);

        if (totalElementAmount === totalPaid) {
          hasCleard = true;
        }

        await models.OtherFeesInvoiceFeesElement.update(
          {
            amount_paid: totalPaid,
            cleared: hasCleard,
          },
          {
            where: {
              id: findOneInvoiceElement.id,
            },
            transaction,
            returning: true,
          }
        );
      } else {
        const totalPaid = parseInt(findOneCreditNote.amount, 10);

        if (totalElementAmount === totalPaid) {
          hasCleard = true;
        }

        await models.OtherFeesInvoiceFeesElement.update(
          {
            amount_paid: totalPaid,
            cleared: hasCleard,
          },
          {
            where: {
              id: findOneInvoiceElement.id,
            },
            transaction,
            returning: true,
          }
        );
      }

      return incremented;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `invoice.service.js`,
        `incrementOtherFeesInvoice`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} id
   * @param {*} by
   * @param {*} transaction
   */
  static async updateOtherFeesInvoiceByNotes(id, by, action, transaction) {
    try {
      const findOneInvoice = await models.EnrollmentOtherFeesInvoice.findOne({
        where: { id },
        raw: true,
      });

      if (!findOneInvoice) {
        throw new Error(`Unable to find the invoice.`);
      }

      let newAmountPaid = 0;

      let newAmountDue = 0;

      let newPercentageCompletion = 0;

      if (action === 'credit') {
        newAmountPaid =
          parseInt(findOneInvoice.amount_paid, 10) + parseInt(by, 10);

        newAmountDue =
          parseInt(findOneInvoice.amount_due, 10) - parseInt(by, 10);

        newPercentageCompletion = Math.floor(
          (newAmountPaid / parseFloat(findOneInvoice.invoice_amount)) * 100
        );
      } else if (action === 'debit') {
        if (parseInt(findOneInvoice.amount_paid, 10) < parseInt(by, 10)) {
          throw new Error(
            `Amount To Debit Is Greater Than The Invoice Amount.`
          );
        }
        newAmountPaid =
          parseInt(findOneInvoice.amount_paid, 10) - parseInt(by, 10);

        newAmountDue =
          parseInt(findOneInvoice.amount_due, 10) + parseInt(by, 10);

        newPercentageCompletion = Math.floor(
          (newAmountPaid / parseFloat(findOneInvoice.invoice_amount)) * 100
        );
      }

      await models.EnrollmentOtherFeesInvoice.update(
        {
          amount_due: newAmountDue,
          amount_paid: newAmountPaid,
          percentage_completion: newPercentageCompletion,
        },
        {
          where: {
            id,
          },
          transaction,
          returning: true,
        }
      );
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `invoice.service.js`,
        `updateOtherFeesInvoiceByNotes`,
        `PUT`
      );
    }
  }

  /**
   * Increment Manual Invoice
   *
   * @param {*} id
   * @param {*} data
   */
  static async incrementManualInvoice(
    field,
    by,
    id,
    creditNoteId,
    transaction
  ) {
    try {
      const incremented = await models.EnrollmentManualInvoice.increment(
        field,
        {
          by,
          where: { id },
          transaction,
          returning: true,
        }
      );

      const findOneCreditNote = await models.CreditNote.findOne({
        where: {
          id: creditNoteId,
        },
      });

      if (!findOneCreditNote) {
        throw new Error(`Unable to find the credit note.`);
      }

      const findOneInvoiceElement =
        await models.ManualInvoiceFeesElement.findOne({
          where: {
            manual_invoice_id: findOneCreditNote.dataValues.invoice_id,
            fees_element_id: findOneCreditNote.dataValues.fees_element_id,
          },
          raw: true,
        });

      if (!findOneInvoiceElement) {
        throw new Error(
          `Unable to find the invoice element related to the credit note.`
        );
      }

      const totalElementAmount = findOneInvoiceElement.new_amount
        ? parseInt(findOneInvoiceElement.new_amount, 10)
        : parseInt(findOneInvoiceElement.amount, 10);

      let hasCleard = false;

      if (findOneInvoiceElement.amount_paid) {
        const totalPaid =
          parseInt(findOneInvoiceElement.amount_paid, 10) +
          parseInt(findOneCreditNote.dataValues.amount, 10);

        if (totalElementAmount === totalPaid) {
          hasCleard = true;
        }

        await models.ManualInvoiceFeesElement.update(
          {
            amount_paid: totalPaid,
            cleared: hasCleard,
          },
          {
            where: {
              id: findOneInvoiceElement.id,
            },
            transaction,
            returning: true,
          }
        );
      } else {
        const totalPaid = parseInt(findOneCreditNote.amount, 10);

        if (totalElementAmount === totalPaid) {
          hasCleard = true;
        }

        await models.ManualInvoiceFeesElement.update(
          {
            amount_paid: totalPaid,
            cleared: hasCleard,
          },
          {
            where: {
              id: findOneInvoiceElement.id,
            },
            transaction,
            returning: true,
          }
        );
      }

      return incremented;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `invoice.service.js`,
        `incrementManualInvoice`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} id
   * @param {*} by
   * @param {*} transaction
   */
  static async updateManualInvoiceByNotes(id, by, action, transaction) {
    try {
      const findOneInvoice = await models.EnrollmentManualInvoice.findOne({
        where: { id },
        raw: true,
      });

      if (!findOneInvoice) {
        throw new Error(`Unable to find the invoice.`);
      }

      let newAmountPaid = 0;

      let newAmountDue = 0;

      let newPercentageCompletion = 0;

      if (action === 'credit') {
        newAmountPaid =
          parseInt(findOneInvoice.amount_paid, 10) + parseInt(by, 10);

        newAmountDue =
          parseInt(findOneInvoice.amount_due, 10) - parseInt(by, 10);

        newPercentageCompletion = Math.floor(
          (newAmountPaid / parseFloat(findOneInvoice.invoice_amount)) * 100
        );
      } else if (action === 'debit') {
        if (parseInt(findOneInvoice.amount_paid, 10) < parseInt(by, 10)) {
          throw new Error(
            `Amount To Debit Is Greater Than The Invoice Amount.`
          );
        }
        newAmountPaid =
          parseInt(findOneInvoice.amount_paid, 10) - parseInt(by, 10);

        newAmountDue =
          parseInt(findOneInvoice.amount_due, 10) + parseInt(by, 10);

        newPercentageCompletion = Math.floor(
          (newAmountPaid / parseFloat(findOneInvoice.invoice_amount)) * 100
        );
      }

      await models.EnrollmentManualInvoice.update(
        {
          amount_due: newAmountDue,
          amount_paid: newAmountPaid,
          percentage_completion: newPercentageCompletion,
        },
        {
          where: {
            id,
          },
          transaction,
          returning: true,
        }
      );
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `invoice.service.js`,
        `updateManualInvoiceByNotes`,
        `PUT`
      );
    }
  }

  // DECREMENT INVOICES
  /** Increment Tuition Invoice
   *
   * @param {*} id
   * @param {*} data
   */
  static async decrementTuitionInvoice(
    field,
    by,
    id,
    debitNoteId,
    transaction
  ) {
    try {
      const decremented = await models.EnrollmentTuitionInvoice.decrement(
        field,
        {
          by,
          where: { id },
          transaction,
          returning: true,
        }
      );

      const findOneDebitNote = await models.DebitNote.findOne({
        where: {
          id: debitNoteId,
        },
      });

      if (!findOneDebitNote) {
        throw new Error(`Unable to find the debit note.`);
      }

      const findOneInvoiceElement =
        await models.TuitionInvoiceFeesElement.findOne({
          where: {
            tuition_invoice_id: findOneDebitNote.dataValues.invoice_id,
            fees_element_id: findOneDebitNote.dataValues.fees_element_id,
          },
          include: [
            {
              association: 'feesElement',
              attributes: ['id', 'fees_element_name'],
            },
          ],
          nest: true,
        }).then((res) => {
          if (res) {
            return res.toJSON();
          }
        });

      if (!findOneInvoiceElement) {
        throw new Error(
          `Unable to find the invoice element related to the debit note.`
        );
      }

      const totalElementAmount = findOneInvoiceElement.new_amount
        ? parseInt(findOneInvoiceElement.new_amount, 10)
        : parseInt(findOneInvoiceElement.amount, 10);

      let hasCleard = false;

      if (findOneInvoiceElement.amount_paid) {
        const totalDeducted =
          parseInt(findOneInvoiceElement.amount_paid, 10) -
          parseInt(findOneDebitNote.dataValues.amount, 10);

        if (totalDeducted < 0) {
          throw new Error(
            `The Debit Note For Fees Element: ${findOneInvoiceElement.feesElement.fees_element_name} Has Already Been Fully Debited.`
          );
        }

        if (totalElementAmount > totalDeducted) {
          hasCleard = false;
        }

        await models.TuitionInvoiceFeesElement.update(
          {
            amount_paid: totalDeducted,
            cleared: hasCleard,
          },
          {
            where: {
              id: findOneInvoiceElement.id,
            },
            transaction,
            returning: true,
          }
        );
      } else {
        throw new Error(
          `The Debit Note For Fees Element: ${findOneInvoiceElement.feesElement.fees_element_name} Has Already Been Fully Debited.`
        );
      }

      return decremented;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `invoice.service.js`,
        `decrementTuitionInvoice`,
        `POST`
      );
    }
  }

  // DECREMENT INVOICES
  /** Decrement Functional Invoice
   *
   * @param {*} id
   * @param {*} data
   */
  static async decrementFunctionalInvoice(
    field,
    by,
    id,
    debitNoteId,
    transaction
  ) {
    try {
      const decremented =
        await models.EnrollmentFunctionalFeesInvoice.decrement(field, {
          by,
          where: { id },
          transaction,
          returning: true,
        });

      const findOneDebitNote = await models.DebitNote.findOne({
        where: {
          id: debitNoteId,
        },
      });

      if (!findOneDebitNote) {
        throw new Error(`Unable to find the debit note.`);
      }

      const findOneInvoiceElement =
        await models.FunctionalInvoiceFeesElement.findOne({
          where: {
            functional_invoice_id: findOneDebitNote.dataValues.invoice_id,
            fees_element_id: findOneDebitNote.dataValues.fees_element_id,
          },
          include: [
            {
              association: 'feesElement',
              attributes: ['id', 'fees_element_name'],
            },
          ],
          nest: true,
        }).then((res) => {
          if (res) {
            return res.toJSON();
          }
        });

      if (!findOneInvoiceElement) {
        throw new Error(
          `Unable to find the invoice element related to the debit note.`
        );
      }

      const totalElementAmount = findOneInvoiceElement.new_amount
        ? parseInt(findOneInvoiceElement.new_amount, 10)
        : parseInt(findOneInvoiceElement.amount, 10);

      let hasCleard = false;

      if (findOneInvoiceElement.amount_paid) {
        const totalDeducted =
          parseInt(findOneInvoiceElement.amount_paid, 10) -
          parseInt(findOneDebitNote.dataValues.amount, 10);

        if (totalDeducted < 0) {
          throw new Error(
            `The Debit Note For Fees Element: ${findOneInvoiceElement.feesElement.fees_element_name} Has Already Been Fully Debited.`
          );
        }

        if (totalElementAmount > totalDeducted) {
          hasCleard = false;
        }

        await models.FunctionalInvoiceFeesElement.update(
          {
            amount_paid: totalDeducted,
            cleared: hasCleard,
          },
          {
            where: {
              id: findOneInvoiceElement.id,
            },
            transaction,
            returning: true,
          }
        );
      } else {
        throw new Error(
          `The Debit Note For Fees Element: ${findOneInvoiceElement.feesElement.fees_element_name} Has Already Been Fully Debited.`
        );
      }

      return decremented;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `invoice.service.js`,
        `decrementFunctionalInvoice`,
        `POST`
      );
    }
  }

  // DECREMENT INVOICES
  /** Decrement Other Invoice
   *
   * @param {*} id
   * @param {*} data
   */
  static async decrementOtherFeesInvoice(
    field,
    by,
    id,
    debitNoteId,
    transaction
  ) {
    try {
      const decremented = await models.EnrollmentOtherFeesInvoice.decrement(
        field,
        {
          by,
          where: { id },
          transaction,
          returning: true,
        }
      );

      const findOneDebitNote = await models.DebitNote.findOne({
        where: {
          id: debitNoteId,
        },
      });

      if (!findOneDebitNote) {
        throw new Error(`Unable to find the debit note.`);
      }

      const findOneInvoiceElement =
        await models.OtherFeesInvoiceFeesElement.findOne({
          where: {
            other_fees_invoice_id: findOneDebitNote.dataValues.invoice_id,
            fees_element_id: findOneDebitNote.dataValues.fees_element_id,
          },
          include: [
            {
              association: 'feesElement',
              attributes: ['id', 'fees_element_name'],
            },
          ],
          nest: true,
        }).then((res) => {
          if (res) {
            return res.toJSON();
          }
        });

      if (!findOneInvoiceElement) {
        throw new Error(
          `Unable to find the invoice element related to the debit note.`
        );
      }

      const totalElementAmount = findOneInvoiceElement.new_amount
        ? parseInt(findOneInvoiceElement.new_amount, 10)
        : parseInt(findOneInvoiceElement.amount, 10);

      let hasCleard = false;

      if (findOneInvoiceElement.amount_paid) {
        const totalDeducted =
          parseInt(findOneInvoiceElement.amount_paid, 10) -
          parseInt(findOneDebitNote.dataValues.amount, 10);

        if (totalDeducted < 0) {
          throw new Error(
            `The Debit Note For Fees Element: ${findOneInvoiceElement.feesElement.fees_element_name} Has Already Been Fully Debited.`
          );
        }

        if (totalElementAmount > totalDeducted) {
          hasCleard = false;
        }

        await models.OtherFeesInvoiceFeesElement.update(
          {
            amount_paid: totalDeducted,
            cleared: hasCleard,
          },
          {
            where: {
              id: findOneInvoiceElement.id,
            },
            transaction,
            returning: true,
          }
        );
      } else {
        throw new Error(
          `The Debit Note For Fees Element: ${findOneInvoiceElement.feesElement.fees_element_name} Has Already Been Fully Debited.`
        );
      }

      return decremented;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `invoice.service.js`,
        `decrementOtherFeesInvoice`,
        `POST`
      );
    }
  }

  // DECREMENT INVOICES
  /** Decrement Manual Invoice
   *
   * @param {*} id
   * @param {*} data
   */
  static async decrementManualInvoice(field, by, id, debitNoteId, transaction) {
    try {
      const decremented = await models.EnrollmentManualInvoice.decrement(
        field,
        {
          by,
          where: { id },
          transaction,
          returning: true,
        }
      );

      const findOneDebitNote = await models.DebitNote.findOne({
        where: {
          id: debitNoteId,
        },
      });

      if (!findOneDebitNote) {
        throw new Error(`Unable to find the debit note.`);
      }

      const findOneInvoiceElement =
        await models.ManualInvoiceFeesElement.findOne({
          where: {
            manual_invoice_id: findOneDebitNote.dataValues.invoice_id,
            fees_element_id: findOneDebitNote.dataValues.fees_element_id,
          },
          include: [
            {
              association: 'feesElement',
              attributes: ['id', 'fees_element_name'],
            },
          ],
          nest: true,
        }).then((res) => {
          if (res) {
            return res.toJSON();
          }
        });

      if (!findOneInvoiceElement) {
        throw new Error(
          `Unable to find the invoice element related to the debit note.`
        );
      }

      const totalElementAmount = findOneInvoiceElement.new_amount
        ? parseInt(findOneInvoiceElement.new_amount, 10)
        : parseInt(findOneInvoiceElement.amount, 10);

      let hasCleard = false;

      if (findOneInvoiceElement.amount_paid) {
        const totalDeducted =
          parseInt(findOneInvoiceElement.amount_paid, 10) -
          parseInt(findOneDebitNote.dataValues.amount, 10);

        if (totalDeducted < 0) {
          throw new Error(
            `The Debit Note For Fees Element: ${findOneInvoiceElement.feesElement.fees_element_name} Has Already Been Fully Debited.`
          );
        }

        if (totalElementAmount > totalDeducted) {
          hasCleard = false;
        }

        await models.ManualInvoiceFeesElement.update(
          {
            amount_paid: totalDeducted,
            cleared: hasCleard,
          },
          {
            where: {
              id: findOneInvoiceElement.id,
            },
            transaction,
            returning: true,
          }
        );
      } else {
        throw new Error(
          `The Debit Note For Fees Element: ${findOneInvoiceElement.feesElement.fees_element_name} Has Already Been Fully Debited.`
        );
      }

      return decremented;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `invoice.service.js`,
        `decrementManualInvoice`,
        `POST`
      );
    }
  }

  /** createRequestToVoidOtherFeesInvoice
   *
   * @param {*} data
   */
  static async createRequestToVoidOtherFeesInvoice(data, transaction) {
    try {
      const record = await models.VoidingOtherFeesInvoice.findOrCreate({
        where: {
          other_fees_invoice_id: data.other_fees_invoice_id,
        },
        defaults: { ...data },
        transaction,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `invoice.service.js`,
        `createRequestToVoidOtherFeesInvoice`,
        `POST`
      );
    }
  }

  /** createRequestToVoidManualInvoice
   *
   * @param {*} data
   */
  static async createRequestToVoidManualInvoice(data, transaction) {
    try {
      const record = await models.VoidingManualInvoice.findOrCreate({
        where: {
          manual_invoice_id: data.manual_invoice_id,
        },
        defaults: { ...data },
        transaction,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `invoice.service.js`,
        `createRequestToVoidManualInvoice`,
        `POST`
      );
    }
  }

  /** findOneInvoiceExemptionRequest
   *
   * @param {*} data
   */
  static async findOneInvoiceExemptionRequest(options) {
    try {
      const record = await models.InvoiceExemptionRequest.findOne({
        ...options,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `invoice.service.js`,
        `findOneInvoiceExemptionRequest`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} data
   */
  static async createRequestToExemptInvoices(data, transaction) {
    try {
      const record = await models.InvoiceExemptionRequest.findOrCreate({
        where: {
          invoice_number: data.invoice_number,
        },
        defaults: {
          ...data,
        },
        transaction,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `invoice.service.js`,
        `createRequestToExemptInvoices`,
        `POST`
      );
    }
  }

  /** updateRequestToExemptInvoice
   *
   * @param {*} data
   */
  static async updateRequestToExemptInvoice(data, transaction) {
    try {
      const record = await models.InvoiceExemptionRequest.update(
        {
          create_approved_by_id: data.create_approved_by_id,
          create_approval_status: data.create_approval_status,
        },
        {
          where: {
            id: data.id,
          },
          transaction,
          returning: true,
        }
      );

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `invoice.service.js`,
        `updateRequestToExemptInvoice`,
        `PUT`
      );
    }
  }

  /** findOneRequestToVoidOtherFeesInvoice
   *
   * @param {*} options
   */
  static async findOneRequestToVoidOtherFeesInvoice(options) {
    try {
      const record = await models.VoidingOtherFeesInvoice.findOne({
        ...options,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `invoice.service.js`,
        `findOneRequestToVoidOtherFeesInvoice`,
        `GET`
      );
    }
  }

  /** findOneRequestToVoidOtherFeesInvoice
   *
   * @param {*} options
   */
  static async findOneRequestToVoidManualInvoice(options) {
    try {
      const record = await models.VoidingManualInvoice.findOne({
        ...options,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `invoice.service.js`,
        `findOneRequestToVoidManualInvoice`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} id
   * @param {*} data
   */
  static async updateVoidingManualInvoice(id, data, transaction) {
    try {
      const updated = await models.VoidingManualInvoice.update(
        {
          ...data,
        },
        {
          where: {
            id,
          },
          transaction,
          returning: true,
        }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `invoice.service.js`,
        `updateVoidingManualInvoice`,
        `PUT`
      );
    }
  }

  /** updateVoidingOtherFeesInvoice
   *
   * @param {*} id
   * @param {*} data
   */
  static async updateVoidingOtherFeesInvoice(id, data, transaction) {
    try {
      const updated = await models.VoidingOtherFeesInvoice.update(
        {
          ...data,
        },
        {
          where: {
            id,
          },
          transaction,
          returning: true,
        }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `invoice.service.js`,
        `updateVoidingOtherFeesInvoice`,
        `PUT`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single record object from data object
   *@
   */
  static async createPaymentTransactionAllocation(data, transaction) {
    try {
      const result = await models.PaymentTransactionAllocation.create(data, {
        transaction,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `invoice.service.js`,
        `createPaymentTransactionAllocation`,
        `POST`
      );
    }
  }
}

module.exports = InvoiceService;
