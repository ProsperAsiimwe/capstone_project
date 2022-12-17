const models = require('@models');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for this entity
class SponsorService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all records or filtered using options param
   */
  static async findAllRecords(options) {
    try {
      const records = await models.Sponsor.findAll({
        ...options,
      });

      return records;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `sponsor.service.js`,
        `findAllRecords`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all records or filtered using options param
   */
  static async findAllSponsoredStudents(options) {
    try {
      const records = await models.SponsorStudent.findAll({
        ...options,
      });

      return records;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `sponsor.service.js`,
        `findAllSponsoredStudents`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all records or filtered using options param
   */
  static async findOneSponsoredStudent(options) {
    try {
      const records = await models.SponsorStudent.findOne({
        ...options,
      });

      return records;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `sponsor.service.js`,
        `findOneSponsoredStudent`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all records or filtered using options param
   */
  static async findOneSponsorAllocation(options) {
    try {
      const records = await models.SponsorAllocation.findOne({
        ...options,
      });

      return records;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `sponsor.service.js`,
        `findOneSponsorAllocation`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all records or filtered using options param
   */
  static async findAllSponsorAllocations(options) {
    try {
      const records = await models.SponsorAllocation.findAll({
        ...options,
      });

      return records;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `sponsor.service.js`,
        `findAllSponsorAllocations`,
        `GET`
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
      const record = await models.Sponsor.findOne({
        ...options,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `sponsor.service.js`,
        `findOneRecord`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async createRecord(data, transaction) {
    try {
      const record = await models.Sponsor.create(data, {
        transaction,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `sponsor.service.js`,
        `createRecord`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async createSponsorInvoice(data, transaction) {
    try {
      const record = await models.SponsorInvoice.findOrCreate({
        where: {
          invoice_number: data.invoice_number,
        },
        defaults: {
          ...data,
        },
        include: [
          {
            association: models.SponsorInvoice.references,
          },
        ],
        transaction,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `sponsor.service.js`,
        `createSponsorInvoice`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async createSponsorPaymentTransaction(data, transaction) {
    try {
      const record = await models.SponsorTransaction.create(data, {
        transaction,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `sponsor.service.js`,
        `createSponsorPaymentTransaction`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async createSponsorAllocationRecord(data, transaction) {
    try {
      const record = await models.SponsorAllocation.create(data, {
        transaction,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `sponsor.service.js`,
        `createSponsorAllocationRecord`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async createSponsorPaymentReference(data, transaction) {
    try {
      const record = await models.SponsorPaymentReference.create(data, {
        transaction,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `sponsor.service.js`,
        `createSponsorPaymentReference`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single record object basing on the options
   */
  static async findOneSponsorPaymentReference(options) {
    try {
      const record = await models.SponsorPaymentReference.findOne({
        ...options,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `sponsor.service.js`,
        `findOneSponsorPaymentReference`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single record object basing on the options
   */
  static async findOneSponsorInvoice(options) {
    try {
      const record = await models.SponsorInvoice.findOne({
        ...options,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `sponsor.service.js`,
        `findOneSponsorInvoice`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single record object basing on the options
   */
  static async findAllSponsorInvoices(options) {
    try {
      const record = await models.SponsorInvoice.findAll({
        ...options,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `sponsor.service.js`,
        `findAllSponsorInvoices`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single record object basing on the options
   */
  static async findAllSponsorTransactions(options) {
    try {
      const record = await models.SponsorTransaction.findAll({
        ...options,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `sponsor.service.js`,
        `findAllSponsorTransactions`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single record object basing on the options
   */
  static async findOneSponsorTransaction(options) {
    try {
      const record = await models.SponsorTransaction.findOne({
        ...options,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `sponsor.service.js`,
        `findOneSponsorTransaction`,
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
  static async updateSponsorPaymentReference(id, data, transaction) {
    try {
      const record = await models.SponsorPaymentReference.update(
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

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `sponsor.service.js`,
        `updateSponsorPaymentReference`,
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
  static async updateSponsorAllocation(id, data, transaction) {
    try {
      const record = await models.SponsorAllocation.update(
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

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `sponsor.service.js`,
        `updateSponsorAllocation`,
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
  static async updateSponsorTransaction(id, data, transaction) {
    try {
      const record = await models.SponsorTransaction.update(
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

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `sponsor.service.js`,
        `updateSponsorTransaction`,
        `PUT`
      );
    }
  }

  /** Increment
   *
   * @param {*} id
   * @param {*} data
   */
  static async incrementSponsorTransaction(field, by, id, transaction) {
    try {
      const incremented = await models.SponsorTransaction.increment(field, {
        by,
        where: { id },
        transaction,
        returning: true,
      });

      return incremented;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `sponsor.service.js`,
        `incrementSponsorTransaction`,
        `POST`
      );
    }
  }

  /** decrement
   *
   * @param {*} id
   * @param {*} data
   */
  static async decrementSponsorTransaction(field, by, id, transaction) {
    try {
      const decremented = await models.SponsorTransaction.decrement(field, {
        by,
        where: { id },
        transaction,
        returning: true,
      });

      return decremented;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `sponsor.service.js`,
        `decrementSponsorTransaction`,
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
  static async updateSponsorInvoice(id, data, transaction) {
    try {
      const record = await models.SponsorInvoice.update(
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

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `sponsor.service.js`,
        `updateSponsorInvoice`,
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
  static async updateRecord(id, data, transaction) {
    try {
      const record = await models.Sponsor.update(
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

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `sponsor.service.js`,
        `updateRecord`,
        `PUT`
      );
    }
  }

  /**
   * @param {string} id  id of record object to be deleted
   * @returns {Promise}
   * @description deletes a single record object
   *@
   */
  static async deleteRecord(id) {
    try {
      const deleted = await models.Sponsor.destroy({
        where: { id },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `sponsor.service.js`,
        `deleteRecord`,
        `DELETE`
      );
    }
  }
}

module.exports = SponsorService;
