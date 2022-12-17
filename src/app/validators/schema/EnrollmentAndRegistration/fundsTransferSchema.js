const Joi = require('joi');

const createFundsTransferSchema = Joi.object({
  transaction_id: Joi.number().required(),
  recipient_student_number: Joi.string().required(),
  academic_year_id: Joi.number().required(),
  semester_id: Joi.number().required(),
  study_year_id: Joi.number().required(),
  amount_to_transfer: Joi.number().required(),
  narration: Joi.string().required(),
});

const approveFundsTransferSchema = Joi.object({
  funds_transfers: Joi.array().items(Joi.number()).required(),
});

module.exports = {
  createFundsTransferSchema,
  approveFundsTransferSchema,
};
