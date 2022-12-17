'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    // system super user

    const systemAdminUser = await queryInterface.sequelize.query(
      `SELECT users.id as id, users.surname as surname
       From user_mgt.users as users
    WHERE users.other_names='SYSTEM ADMINISTRATOR' and users.surname ='SUPER' LIMIT 1;`
    );
    const systemAdminUserObject = systemAdminUser[0];

    await queryInterface.bulkInsert(
      {
        schema: 'user_mgt',
        tableName: 'security_profiles',
      },
      [
        {
          security_profile_name: 'SYSTEM ADMINISTRATOR',
          password_change_frequency_days: 240,
          min_password_length: 8,
          session_timeout_mins: 1000,
          min_no_password_digits: 2,
          min_no_special_characters: 5,
          min_no_uppercase_characters: 1,
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          security_profile_name: 'TEST SECURITY PROFILE',
          password_change_frequency_days: 240,
          min_password_length: 8,
          session_timeout_mins: 1000,
          min_no_password_digits: 2,
          min_no_special_characters: 5,
          min_no_uppercase_characters: 1,
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete(
      { schema: 'user_mgt', tableName: 'security_profiles' },
      null,
      {}
    );
  },
};
