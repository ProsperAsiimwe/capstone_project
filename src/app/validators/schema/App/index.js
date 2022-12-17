const metadataSchema = require('./metadataSchema');
const metadataValueSchema = require('./metadataValueSchema');
const resendVerificationSchema = require('./mailSchema');
const institutionStructureSchema = require('./institutionStructureSchema');
const twoFactorAuthSchema = require('./twoFactorAuthSchema');

module.exports = {
  metadataSchema,
  metadataValueSchema,
  resendVerificationSchema,
  institutionStructureSchema,
  twoFactorAuthSchema,
};
