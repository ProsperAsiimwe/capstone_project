const Joi = require('joi');

const createSponsorSchema = Joi.object({
  sponsor_name: Joi.string().required(),
  sponsor_email: Joi.string().email().required(),
  description: Joi.string(),
  sponsor_phone: Joi.string(),
  contact_person_name: Joi.string().required(),
  contact_person_email: Joi.string().required(),
  contact_person_phone: Joi.string().required(),
});

const createSponsorInvoiceSchema = Joi.object({
  sponsor_id: Joi.number().required(),
  currency_id: Joi.number().required(),
  payment_mode: Joi.string(),
  description: Joi.string(),
  invoice_amount: Joi.number().required(),
  payment_date: Joi.date(),
});

const createSponsorTransactionsSchema = Joi.object({
  ura_prn: Joi.string().required(),
  bank: Joi.string(),
  branch: Joi.string(),
  banktxnid: Joi.string(),
  payment_date: Joi.date().required(),
  amount: Joi.number().required(),
  signature: Joi.string(),
  payment_mode: Joi.string(),
  currency: Joi.string(),
  narration: Joi.string(),
});

const students = Joi.object().keys({
  student_programme_id: Joi.number().required(),
  amount_paid: Joi.number().required(),
});

const allocateToSponsoredStudents = Joi.object({
  sponsored_students: Joi.array().items(students).required(),
});

const deAllocateFromSponsoredStudents = Joi.object({
  sponsor_allocations: Joi.array().items(Joi.number()).required(),
});

module.exports = {
  createSponsorSchema,
  createSponsorInvoiceSchema,
  createSponsorTransactionsSchema,
  allocateToSponsoredStudents,
  deAllocateFromSponsoredStudents,
};
