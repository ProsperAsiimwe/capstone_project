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
    // STUDENTS' TRANSACTIONS MANAGEMENT
    const studentTransactionsManagerApplication = await queryInterface.sequelize
      .query(`select id from user_mgt.apps
where app_name = 'STUDENT TRANSACTIONS MANAGEMENT'`);

    const studentTransactionsManagerApplicationObject =
      studentTransactionsManagerApplication[0];

    // studentTransactionsManagerApplicationObject
    await queryInterface.bulkInsert(
      { tableName: 'app_functions', schema: 'user_mgt' },
      [
        {
          app_id: studentTransactionsManagerApplicationObject[0].id,
          action_group: 'MANAGE STUDENT TRANSACTIONS',
          function_name: 'CAN VIEW STUDENTS PROFILE',
          function_description: 'CAN VIEW STUDENTS PROFILE',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: studentTransactionsManagerApplicationObject[0].id,
          action_group: 'MANAGE STUDENT TRANSACTIONS',
          function_name: 'CAN VIEW STUDENTS INVOICE/PAYMENTS',
          function_description: 'CAN VIEW STUDENTS INVOICE/PAYMENTS',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: studentTransactionsManagerApplicationObject[0].id,
          action_group: 'MANAGE STUDENT TRANSACTIONS',
          function_name: 'CAN VIEW STUDENTS FEES STRUCTURE',
          function_description: 'CAN VIEW STUDENTS STRUCTURE',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: studentTransactionsManagerApplicationObject[0].id,
          action_group: 'MANAGE STUDENT TRANSACTIONS',
          function_name: 'CAN VIEW STUDENTS FINANCIAL TRANSACTIONS',
          function_description: 'CAN VIEW STUDENTS FINANCIAL TRANSACTIONS',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: studentTransactionsManagerApplicationObject[0].id,
          action_group: 'MANAGE STUDENT TRANSACTIONS',
          function_name: 'CAN VIEW STUDENTS PAYMENT REFERENCES',
          function_description: 'CAN VIEW STUDENTS PAYMENT REFERENCES',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: studentTransactionsManagerApplicationObject[0].id,
          action_group: 'MANAGE STUDENT TRANSACTIONS',
          function_name: 'CAN VIEW STUDENTS CREDIT NOTES',
          function_description: 'CAN VIEW STUDENTS CREDIT NOTES',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: studentTransactionsManagerApplicationObject[0].id,
          action_group: 'MANAGE STUDENT TRANSACTIONS',
          function_name: 'CAN VIEW STUDENTS DEBIT NOTES',
          function_description: 'CAN VIEW STUDENTS DEBIT NOTES',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: studentTransactionsManagerApplicationObject[0].id,
          action_group: 'MANAGE STUDENT TRANSACTIONS',
          function_name: 'CAN VIEW STUDENTS LEDGERS',
          function_description: 'CAN VIEW STUDENTS LEDGERS',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: studentTransactionsManagerApplicationObject[0].id,
          action_group: 'MANAGE STUDENT TRANSACTIONS',
          function_name: 'CAN VIEW STUDENTS ENROLLMENT HISTORY',
          function_description: 'CAN VIEW STUDENTS ENROLLMENT HISTORY',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: studentTransactionsManagerApplicationObject[0].id,
          action_group: 'MANAGE STUDENT TRANSACTIONS',
          function_name: 'CAN VIEW STUDENTS REGISTRATION HISTORY',
          function_description: 'CAN VIEW STUDENTS REGISTRATION HISTORY',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: studentTransactionsManagerApplicationObject[0].id,
          action_group: 'MANAGE STUDENT TRANSACTIONS',
          function_name: 'CAN VIEW STUDENTS REFUNDS',
          function_description: 'CAN VIEW STUDENTS REFUNDS',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: studentTransactionsManagerApplicationObject[0].id,
          action_group: 'MANAGE STUDENT TRANSACTIONS REPORTS',
          function_name: 'CAN VIEW SUMMARY REPORTS',
          function_description: 'CAN VIEW SUMMARY REPORTS',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: studentTransactionsManagerApplicationObject[0].id,
          action_group: 'MANAGE STUDENT TRANSACTIONS REPORTS',
          function_name: 'CAN VIEW DETAILED REPORTS',
          function_description: 'CAN VIEW DETAILED REPORTS',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: studentTransactionsManagerApplicationObject[0].id,
          action_group: 'MANAGE STUDENT TRANSACTIONS REPORTS',
          function_name: 'CAN VIEW CUSTOMIZED REPORTS',
          function_description: 'CAN VIEW CUSTOMIZED REPORTS',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: studentTransactionsManagerApplicationObject[0].id,
          action_group: 'MANAGE STUDENT TRANSACTIONS REPORTS',
          function_name: 'CAN DOWNLOAD DETAILED REPORTS',
          function_description: 'CAN DOWNLOAD DETAILED REPORTS',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: studentTransactionsManagerApplicationObject[0].id,
          action_group: 'MANAGE STUDENT TRANSACTIONS REPORTS',
          function_name: 'CAN PRINT DETAILED REPORTS',
          function_description: 'CAN PRINT DETAILED REPORTS',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: studentTransactionsManagerApplicationObject[0].id,
          action_group: 'MANAGE STUDENT TRANSACTIONS APPROVALS',
          function_name: 'CAN VIEW PENDING APPROVALS FOR DIRECT POSTS',
          function_description: 'CAN VIEW PENDING APPROVALS FOR DIRECT POSTS',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: studentTransactionsManagerApplicationObject[0].id,
          action_group: 'MANAGE STUDENT TRANSACTIONS APPROVALS',
          function_name: 'CAN APPROVE PENDING DIRECT POSTS',
          function_description: 'CAN APPROVE PENDING DIRECTS POSTS',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: studentTransactionsManagerApplicationObject[0].id,
          action_group: 'MANAGE STUDENT TRANSACTIONS APPROVALS',
          function_name: 'CAN VIEW PENDING APPROVALS FOR VOIDED INVOICES',
          function_description:
            'CAN VIEW PENDING APPROVALS FOR VOIDED INVOICES',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: studentTransactionsManagerApplicationObject[0].id,
          action_group: 'MANAGE STUDENT TRANSACTIONS APPROVALS',
          function_name: 'CAN APPROVE PENDING VOIDED INVOICES',
          function_description: 'CAN APPROVE PENDING VOIDED INVOICES',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: studentTransactionsManagerApplicationObject[0].id,
          action_group: 'MANAGE STUDENT TRANSACTIONS APPROVALS',
          function_name: 'CAN VIEW PENDING APPROVALS FOR EXEMPTED INVOICES',
          function_description:
            'CAN VIEW PENDING APPROVALS FOR EXEMPTED INVOICES',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: studentTransactionsManagerApplicationObject[0].id,
          action_group: 'MANAGE STUDENT TRANSACTIONS APPROVALS',
          function_name: 'CAN APPROVE PENDING EXEMPTED INVOICES',
          function_description: 'CAN APPROVE PENDING EXEMPTED INVOICES',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: studentTransactionsManagerApplicationObject[0].id,
          action_group: 'MANAGE STUDENT TRANSACTIONS APPROVALS',
          function_name: 'CAN VIEW PENDING APPROVALS FOR CREDIT NOTES',
          function_description: 'CAN VIEW PENDING APPROVALS FOR CREDIT NOTES',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: studentTransactionsManagerApplicationObject[0].id,
          action_group: 'MANAGE STUDENT TRANSACTIONS APPROVALS',
          function_name: 'CAN APPROVE PENDING CREDIT NOTES',
          function_description: 'CAN APPROVE PENDING CREDIT NOTES',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: studentTransactionsManagerApplicationObject[0].id,
          action_group: 'MANAGE STUDENT TRANSACTIONS APPROVALS',
          function_name: 'CAN VIEW PENDING APPROVALS FOR DEBIT NOTES',
          function_description: 'CAN VIEW PENDING APPROVALS FOR DEBIT NOTES',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: studentTransactionsManagerApplicationObject[0].id,
          action_group: 'MANAGE STUDENT TRANSACTIONS APPROVALS',
          function_name: 'CAN APPROVE PENDING DEBIT NOTES',
          function_description: 'CAN APPROVE PENDING DEBIT NOTES',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ]
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
