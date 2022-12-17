'use strict';

require('dotenv').config();
const bcrypt = require('bcrypt');
const moment = require('moment');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Super admin User seeder.
     *
     * Phone Email, phone, Salt Rounds and password are picked from the env file.
     */
    const saltRounds = parseInt(process.env.PASSWORD_SALT_ROUNDS, 10);
    const salt = await bcrypt.genSalt(saltRounds);
    const password = await bcrypt.hashSync(
      process.env.SUPER_ADMIN_PASSWORD,
      salt
    );
    const now = moment().toDate();

    // system users

    await queryInterface.bulkInsert(
      { schema: 'user_mgt', tableName: 'users' },
      [
        {
          surname: 'SUPER',
          other_names: 'SYSTEM ADMINISTRATOR',
          phone: process.env.SUPER_ADMIN_PHONE_SUPER,
          email: process.env.SUPER_ADMIN_SYSADMIN,
          password: password,
          email_verified: true,
          email_verified_at: now,
          created_at: now,
          updated_at: now,
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Revert Super admin account.
     */
    await queryInterface.bulkDelete(
      { tableName: 'users', schema: 'user_mgt' },
      null,
      {}
    );
  },
};
