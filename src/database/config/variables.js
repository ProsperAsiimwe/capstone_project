require('dotenv').config();

// Prevent Environment Variables from being changed
module.exports = Object.freeze({
  // Development or Production Database Connections
  DB_DATABASE_NAME: process.env.DB_DATABASE_NAME,
  DB_PORT: process.env.DB_PORT,
  DB_USERNAME: process.env.DB_USERNAME,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_HOST: process.env.DB_HOST,
  DB_DIALECT: process.env.DB_DIALECT,
  DB_OPERATORSALIASES: process.env.DB_OPERATORSALIASES,

  // Test Database Configurations
  TEST_DB_DATABASE_NAME: process.env.TEST_DB_DATABASE_NAME,
  TEST_DB_PORT: process.env.TEST_DB_PORT,
  TEST_DB_USERNAME: process.env.TEST_DB_USERNAME,
  TEST_DB_PASSWORD: process.env.TEST_DB_PASSWORD,
  TEST_DB_HOST: process.env.TEST_DB_HOST,
  TEST_DB_DIALECT: process.env.TEST_DB_DIALECT,
  TEST_DB_OPERATORSALIASES: process.env.TEST_DB_OPERATORSALIASES,
});
