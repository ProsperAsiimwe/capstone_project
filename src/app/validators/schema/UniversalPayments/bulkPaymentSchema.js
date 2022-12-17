const Joi = require('joi');

const createBulkPaymentSchema = Joi.object({
  uuid: Joi.string().required(),
  amount_paid: Joi.string().required(),
  payment_date: Joi.string().required(),
  narration: Joi.string().required(),
  transaction_code: Joi.string().required(),
  currency: Joi.string().required(),
  payment_forwarded: Joi.boolean(),
  forwarded_on: Joi.string(),
  email_sent: Joi.boolean(),
  email_sent_on: Joi.string(),
  payment_acknowledged: Joi.boolean().required(),
  sponsor: Joi.object({
    id: Joi.number(),
    name: Joi.string().required(),
  }).required(),
  payment_bank: Joi.object({
    id: Joi.number(),
    code: Joi.string().required(),
    name: Joi.string().required(),
  }).required(),
  payment_mode: Joi.object({
    id: Joi.number(),
    code: Joi.string().required(),
    name: Joi.string().required(),
  }).required(),
});

module.exports = {
  createBulkPaymentSchema,
};
