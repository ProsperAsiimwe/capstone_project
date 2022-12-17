const models = require('@models');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for a paymentReference
class PaymentReferenceService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all admission schemes or filtered using options param
   */
  static async findAllPaymentReferences(options) {
    try {
      const results = await models.PaymentReference.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentReference.service.js`,
        `findAllPaymentReferences`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single paymentReference object basing on the options
   */
  static async findOnePaymentReference(options) {
    try {
      const paymentReference = await models.PaymentReference.findOne({
        ...options,
      });

      return paymentReference;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentReference.service.js`,
        `findOnePaymentReference`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single paymentReference object from data object
   *@
   */
  static async createPaymentReference(data, transaction) {
    try {
      const paymentReference = await models.PaymentReference.create(data, {
        include: [
          {
            association: models.PaymentReference.otherFeesInvoices,
          },
          {
            association: models.PaymentReference.manualInvoices,
          },
          {
            association: models.PaymentReference.functionalFeesInvoice,
          },
          {
            association: models.PaymentReference.tuitionInvoice,
          },
          {
            association: models.PaymentReference.graduationInvoices,
          },
          {
            association: models.PaymentReference.elementAllocation,
          },
        ],
        transaction,
      });

      return paymentReference;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentReference.service.js`,
        `createPaymentReference`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single paymentReference object from data object
   *@
   */
  static async createPaymentReferenceForFuturePayments(data, transaction) {
    try {
      const paymentReference = await models.PaymentReference.create(data, {
        transaction,
      });

      return paymentReference;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentReference.service.js`,
        `createPaymentReferenceForFuturePayments`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of paymentReference object to be updated
   * @returns {Promise}
   * @description updates a single paymentReference object
   *@
   */
  static async updateIsUsedAndExpiry(referenceNumber, data) {
    try {
      const updated = await models.PaymentReference.update(
        { ...data },
        {
          where: {
            reference_number: referenceNumber,
          },
          returning: true,
          raw: true,
        }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentReference.service.js`,
        `updateIsUsedAndExpiry`,
        `PUT`
      );
    }
  }

  static async updatePaymentReference(id, data, transaction) {
    try {
      const updated = await models.PaymentReference.update(
        { ...data },
        { where: { id }, transaction, returning: true }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentReference.service.js`,
        `updatePaymentReference`,
        `PUT`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single record object basing on the options
   */
  static async findOneRecord(options) {
    try {
      const record = await models.PaymentReference.findOne({
        ...options,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentReference.service.js`,
        `findOneRecord`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise}
   * @description
   */
  static async referenceFunctionalFeesInvoice(options) {
    try {
      const results = await models.PaymentReferenceFunctionalInvoice.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentReference.service.js`,
        `referenceFunctionalFeesInvoice`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} options
   * @returns
   */
  static async referenceTuitionFeesInvoice(options) {
    try {
      const results = await models.PaymentReferenceTuitionInvoice.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentReference.service.js`,
        `referenceTuitionFeesInvoice`,
        `GET`
      );
    }
  }

  static async referenceOtherFeesInvoices(options) {
    try {
      const results = await models.PaymentReferenceOtherFeesInvoice.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentReference.service.js`,
        `referenceOtherFeesInvoices`,
        `GET`
      );
    }
  }

  static async referenceManualInvoices(options) {
    try {
      const results = await models.PaymentReferenceManualInvoice.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentReference.service.js`,
        `referenceManualInvoices`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} id
   * @param {*} data
   * @param {*} transaction
   * @returns
   */
  static async updateTuitionInvoiceFeesElement(id, data, transaction) {
    try {
      const updated = await models.TuitionInvoiceFeesElement.update(
        { ...data },
        { where: { id }, transaction, returning: true }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentReference.service.js`,
        `updateTuitionInvoiceFeesElement`,
        `PUT`
      );
    }
  }

  /**
   *
   * @param {*} id
   * @param {*} data
   * @param {*} transaction
   * @returns
   */
  static async updateFunctionalInvoiceFeesElement(id, data, transaction) {
    try {
      const updated = await models.FunctionalInvoiceFeesElement.update(
        { ...data },
        { where: { id }, transaction, returning: true }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentReference.service.js`,
        `updateFunctionalInvoiceFeesElement`,
        `PUT`
      );
    }
  }

  /**
   *
   * @param {*} id
   * @param {*} data
   * @param {*} transaction
   * @returns
   */
  static async updateOtherInvoiceFeesElement(id, data, transaction) {
    try {
      const updated = await models.OtherFeesInvoiceFeesElement.update(
        { ...data },
        { where: { id }, transaction, returning: true }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentReference.service.js`,
        `updateOtherInvoiceFeesElement`,
        `PUT`
      );
    }
  }

  /**
   *
   * @param {*} id
   * @param {*} data
   * @param {*} transaction
   * @returns
   */
  static async updateManualInvoiceFeesElement(id, data, transaction) {
    try {
      const updated = await models.ManualInvoiceFeesElement.update(
        { ...data },
        { where: { id }, transaction, returning: true }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentReference.service.js`,
        `updateManualInvoiceFeesElement`,
        `PUT`
      );
    }
  }

  /**
   *
   * @param {*} prn
   * @param {*} transaction
   * @returns
   */
  static async updateAllInvoiceElements(prn, paymentDate, transaction) {
    try {
      const updated = await models.FeesItemPayment.update(
        {
          is_paid: true,
          is_active: false,
          payment_date: paymentDate,
        },
        { where: { ura_prn: prn }, transaction, returning: true }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentReference.service.js`,
        `updateAllInvoiceElements`,
        `PUT`
      );
    }
  }

  /**
   *
   * @param {*} prn
   * @param {*} transaction
   * @returns
   */
  static async deactivateInvoiceElements(invoiceNumber, transaction) {
    try {
      const updated = await models.FeesItemPayment.update(
        {
          is_paid: false,
          is_active: false,
        },
        {
          where: {
            invoice_number: invoiceNumber,
          },
          transaction,
          returning: true,
        }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentReference.service.js`,
        `deactivateInvoiceElements`,
        `PUT`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async bulkCreateFeesItemPayment(data, transaction) {
    try {
      const result = await models.FeesItemPayment.bulkCreate(data, {
        transaction,
        returning: true,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentReference.service.js`,
        `bulkCreateFeesItemPayment`,
        `POST`
      );
    }
  }

  /** find one
   *
   * @param {*} options
   */
  static async paymentReferenceOtherFeesInvoice(options) {
    try {
      const results = await models.PaymentReferenceOtherFeesInvoice.findOne({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentReference.service.js`,
        `paymentReferenceOtherFeesInvoice`,
        `GET`
      );
    }
  }
}

module.exports = PaymentReferenceService;
