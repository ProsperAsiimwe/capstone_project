const metadata = require('./metadata');
const mail = require('./mail');
const institutionStructureValidator = require('./institutionStructureValidator');
const twoFactorAuthValidator = require('./twoFactorAuthValidator');

module.exports = {
  metadata,
  mail,
  institutionStructureValidator,
  twoFactorAuthValidator,
};
