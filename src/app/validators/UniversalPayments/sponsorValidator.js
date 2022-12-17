const { JoiValidator } = require('@middleware');
const { sponsorSchema } = require('../schema/UniversalPayments');

const validateCreateSponsor = async (req, res, next) => {
  return await JoiValidator(req, res, next, sponsorSchema.createSponsorSchema);
};

const validateCreateSponsorInvoice = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    sponsorSchema.createSponsorInvoiceSchema
  );
};

const validateCreateSponsorTransactions = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    sponsorSchema.createSponsorTransactionsSchema
  );
};

const validateAllocateToSponsoredStudents = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    sponsorSchema.allocateToSponsoredStudents
  );
};

const validateDeAllocateFromSponsoredStudents = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    sponsorSchema.deAllocateFromSponsoredStudents
  );
};

const validateCreateInvoice = async (req, res, next) => {
  return await JoiValidator(
    req,
    res,
    next,
    sponsorSchema.createSponsorInvoiceSchema
  );
};

module.exports = {
  validateCreateSponsor,
  validateCreateSponsorInvoice,
  validateCreateSponsorTransactions,
  validateAllocateToSponsoredStudents,
  validateDeAllocateFromSponsoredStudents,
  validateCreateInvoice,
};
