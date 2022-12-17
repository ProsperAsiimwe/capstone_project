const variables = require('./variables');

module.exports = {
  development: {
    username: variables.DB_USERNAME,
    password: variables.DB_PASSWORD,
    database: variables.DB_DATABASE_NAME,
    port: variables.DB_PORT,
    host: variables.DB_HOST,
    dialect: variables.DB_DIALECT,
    operatorsAliases: variables.DB_OPERATORSALIASES,
    timezone: 'Africa/Kampala',
    logQueryParameters: true,
  },
  production: {
    username: variables.DB_USERNAME,
    password: variables.DB_PASSWORD,
    database: variables.DB_DATABASE_NAME,
    host: variables.DB_HOST,
    port: variables.DB_PORT,
    dialect: variables.DB_DIALECT,
    dialectOptions: {
      ssl: {
        rejectUnauthorized: false,
      },
    },
    operatorsAliases: variables.DB_OPERATORSALIASES,
    timezone: 'Africa/Kampala',
  },
  test: {
    username: variables.TEST_DB_USERNAME,
    password: variables.TEST_DB_PASSWORD,
    database: variables.TEST_DB_DATABASE_NAME,
    port: variables.TEST_DB_PORT,
    host: variables.TEST_DB_HOST,
    dialect: variables.TEST_DB_DIALECT,
    operatorsAliases: variables.TEST_DB_OPERATORSALIASES,
    timezone: 'Africa/Kampala',
  },
};
