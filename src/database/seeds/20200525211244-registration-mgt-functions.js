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
    const enrollmentRegistrationManagerApplication = await queryInterface
      .sequelize.query(`select id from user_mgt.apps
where app_name = 'ENROLLMENT & REGISTRATION MANAGEMENT'`);

    const enrollmentRegistrationManagerApplicationObject =
      enrollmentRegistrationManagerApplication[0];

    // seeds
    await queryInterface.bulkInsert(
      { tableName: 'app_functions', schema: 'user_mgt' },
      [
        {
          app_id: enrollmentRegistrationManagerApplicationObject[0].id,
          action_group: 'MANAGE STUDENTS REGISTRATION',
          function_name: 'CAN VIEW STUDENTS ENROLLMENT HISTORY',
          function_description: 'CAN VIEW STUDENTS ENROLLMENT HISTORY',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: enrollmentRegistrationManagerApplicationObject[0].id,
          action_group: 'MANAGE STUDENTS REGISTRATION',
          function_name: 'CAN VIEW STUDENTS REGISTRATION HISTORY',
          function_description: 'CAN VIEW STUDENTS REGISTRATION HISTORY',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: enrollmentRegistrationManagerApplicationObject[0].id,
          action_group: 'MANAGE STUDENTS REGISTRATION',
          function_name: 'CAN VIEW STUDENTS INVOICE/PAYMENTS',
          function_description: 'CAN VIEW STUDENTS INVOICE/PAYMENTS',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: enrollmentRegistrationManagerApplicationObject[0].id,
          action_group: 'MANAGE STUDENTS REGISTRATION',
          function_name: 'CAN VIEW STUDENTS FEES STRUCTURE',
          function_description: 'CAN VIEW STUDENTS FEES STRUCTURE',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: enrollmentRegistrationManagerApplicationObject[0].id,
          action_group: 'MANAGE STUDENTS REGISTRATION',
          function_name: 'CAN VIEW STUDENTS FINANCIAL TRANSACTIONS',
          function_description: 'CAN VIEW STUDENTS FINANCIAL TRANSACTIONS',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: enrollmentRegistrationManagerApplicationObject[0].id,
          action_group: 'MANAGE STUDENTS REGISTRATION',
          function_name: 'CAN VIEW STUDENTS PAYMENT REFERENCES',
          function_description: 'CAN VIEW STUDENTS PAYMENT REFERENCES',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: enrollmentRegistrationManagerApplicationObject[0].id,
          action_group: 'MANAGE STUDENTS REGISTRATION',
          function_name: 'CAN VIEW STUDENTS CREDIT NOTES',
          function_description: 'CAN VIEW STUDENTS CREDIT NOTES',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: enrollmentRegistrationManagerApplicationObject[0].id,
          action_group: 'MANAGE STUDENTS REGISTRATION',
          function_name: 'CAN VIEW STUDENTS DEBIT NOTES',
          function_description: 'CAN VIEW STUDENTS DEBIT NOTES',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: enrollmentRegistrationManagerApplicationObject[0].id,
          action_group: 'MANAGE STUDENTS REGISTRATION',
          function_name: 'CAN VIEW STUDENTS LEDGERS',
          function_description: 'CAN VIEW STUDENTS LEDGERS',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: enrollmentRegistrationManagerApplicationObject[0].id,
          action_group: 'MANAGE STUDENTS REGISTRATION',
          function_name: 'CAN VIEW STUDENTS REFUNDS',
          function_description: 'CAN VIEW STUDENTS REFUNDS',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: enrollmentRegistrationManagerApplicationObject[0].id,
          action_group: 'MANAGE STUDENTS REGISTRATION',
          function_name: 'CAN ENROLL STUDENTS',
          function_description: 'CAN ENROLL STUDENTS',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: enrollmentRegistrationManagerApplicationObject[0].id,
          action_group: 'MANAGE STUDENTS REGISTRATION',
          function_name: 'CAN VIEW STUDENTS PROFILE',
          function_description: 'CAN VIEW STUDENTS PROFILE',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: enrollmentRegistrationManagerApplicationObject[0].id,
          action_group: 'MANAGE STUDENTS REGISTRATION',
          function_name: 'CAN SET STUDENTS ACADEMIC STATUS',
          function_description: 'CAN SET STUDENT ACADEMIC STATUS',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: enrollmentRegistrationManagerApplicationObject[0].id,
          action_group: 'MANAGE STUDENTS REGISTRATION',
          function_name: 'CAN SET STUDENTS ACCOUNT STATUS',
          function_description: 'CAN SET STUDENT ACCOUNT STATUS',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: enrollmentRegistrationManagerApplicationObject[0].id,
          action_group: 'MANAGE STUDENTS REGISTRATION REPORTS',
          function_name: 'CAN VIEW ENROLLMENT AND REGISTRATION SUMMARY REPORTS',
          function_description:
            'CAN VIEW ENROLLMENT AND REGISTRATION SUMMARY REPORTS',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: enrollmentRegistrationManagerApplicationObject[0].id,
          action_group: 'MANAGE STUDENTS REGISTRATION REPORTS',
          function_name:
            'CAN VIEW ENROLLMENT AND REGISTRATION DETAILED REPORTS',
          function_description:
            'CAN VIEW ENROLLMENT AND REGISTRATION DETAILED REPORTS',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: enrollmentRegistrationManagerApplicationObject[0].id,
          action_group: 'MANAGE STUDENTS REGISTRATION REPORTS',
          function_name:
            'CAN VIEW ENROLLMENT AND REGISTRATION CUSTOMIZED REPORTS',
          function_description:
            'CAN VIEW ENROLLMENT AND REGISTRATION CUSTOMIZED REPORTS',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: enrollmentRegistrationManagerApplicationObject[0].id,
          action_group: 'MANAGE STUDENTS REGISTRATION REPORTS',
          function_name: 'CAN DOWNLOAD ENROLLED STUDENTS',
          function_description: 'CAN DOWNLOAD ENROLLED STUDENTS',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: enrollmentRegistrationManagerApplicationObject[0].id,
          action_group: 'MANAGE STUDENTS REGISTRATION REPORTS',
          function_name: 'CAN PRINT ENROLLED STUDENTS',
          function_description: 'CAN PRINT ENROLLED STUDENTS',
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
      { tableName: 'app_functions', schema: 'user_mgt' },
      null,
      {}
    );
  },
};
