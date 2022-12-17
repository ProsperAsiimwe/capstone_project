const Metadata = require('./metadata.model');
const MetadataValue = require('./metadataValue.model');
const OTPCode = require('./OTPCode.model');
const InstitutionStructure = require('./institutionStructure.model');
const documentSetting = require('./documentSetting.model');
const TwoFactorAuth = require('./twoFactorAuth.model');

module.exports = {
  Metadata,
  MetadataValue,
  OTPCode,
  InstitutionStructure,
  documentSetting,
  TwoFactorAuth,
};
