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

    // institution policies mgt
    const policyManagerApplication = await queryInterface.sequelize
      .query(`select id from user_mgt.apps
where app_name = 'INSTITUTION POLICY MANAGEMENT'`);

    const policyManagerApplicationObject = policyManagerApplication[0];
    // institution policies

    await queryInterface.bulkInsert(
      { tableName: 'app_functions', schema: 'user_mgt' },
      [
        {
          app_id: policyManagerApplicationObject[0].id,
          action_group: 'MANAGE REGISTRATION AND FEES POLICIES',
          function_name: 'CAN VIEW TUITION AND FUNCTION FEES POLICIES',
          function_description: 'CAN VIEW TUITION AND FUNCTION FEES POLICIES',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: policyManagerApplicationObject[0].id,
          action_group: 'MANAGE REGISTRATION AND FEES POLICIES',
          function_name: 'CAN ADD NEW TUITION AND FUNCTION FEES POLICIES',
          function_description:
            'CAN ADD NEW TUITION AND FUNCTION FEES POLICIES',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: policyManagerApplicationObject[0].id,
          action_group: 'MANAGE REGISTRATION AND FEES POLICIES',
          function_name: 'CAN EDIT TUITION AND FUNCTION FEES POLICIES',
          function_description: 'CAN EDIT TUITION AND FUNCTION FEES POLICIES',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: policyManagerApplicationObject[0].id,
          action_group: 'MANAGE REGISTRATION AND FEES POLICIES',
          function_name: 'CAN DELETE TUITION AND FUNCTION FEES POLICIES',
          function_description: 'CAN DELETE TUITION AND FUNCTION FEES POLICIES',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: policyManagerApplicationObject[0].id,
          action_group: 'MANAGE REGISTRATION AND FEES POLICIES',
          function_name: 'CAN VIEW OTHER FEES POLICIES',
          function_description: 'CAN VIEW OTHER FEES POLICIES',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: policyManagerApplicationObject[0].id,
          action_group: 'MANAGE REGISTRATION AND FEES POLICIES',
          function_name: 'CAN ADD NEW OTHER FEES POLICIES',
          function_description: 'CAN ADD NEW OTHER FEES POLICIES',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: policyManagerApplicationObject[0].id,
          action_group: 'MANAGE REGISTRATION AND FEES POLICIES',
          function_name: 'CAN EDIT OTHER FEES POLICIES',
          function_description: 'CAN EDIT OTHER FEES POLICIES',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: policyManagerApplicationObject[0].id,
          action_group: 'MANAGE REGISTRATION AND FEES POLICIES',
          function_name: 'CAN DELETE OTHER FEES POLICIES',
          function_description: 'CAN DELETE OTHER FEES POLICIES',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: policyManagerApplicationObject[0].id,
          action_group: 'MANAGE REGISTRATION AND FEES POLICIES',
          function_name: 'CAN VIEW RETAKERS FEES POLICIES',
          function_description: 'CAN VIEW RETAKERS FEES POLICIES',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: policyManagerApplicationObject[0].id,
          action_group: 'MANAGE REGISTRATION AND FEES POLICIES',
          function_name: 'CAN ADD NEW RETAKERS FEES POLICIES',
          function_description: 'CAN ADD NEW RETAKERS FEES POLICIES',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: policyManagerApplicationObject[0].id,
          action_group: 'MANAGE REGISTRATION AND FEES POLICIES',
          function_name: 'CAN EDIT RETAKERS FEES POLICIES',
          function_description: 'CAN EDIT RETAKERS FEES POLICIES',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: policyManagerApplicationObject[0].id,
          action_group: 'MANAGE REGISTRATION AND FEES POLICIES',
          function_name: 'CAN DELETE RETAKERS FEES POLICIES',
          function_description: 'CAN DELETE RETAKERS FEES POLICIES',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: policyManagerApplicationObject[0].id,
          action_group: 'MANAGE REGISTRATION AND FEES POLICIES',
          function_name: 'CAN VIEW SURCHARGE POLICIES',
          function_description: 'CAN VIEW SURCHARGE POLICIES',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: policyManagerApplicationObject[0].id,
          action_group: 'MANAGE REGISTRATION AND FEES POLICIES',
          function_name: 'CAN ADD NEW SURCHARGE POLICIES',
          function_description: 'CAN ADD NEW SURCHARGE POLICIES',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: policyManagerApplicationObject[0].id,
          action_group: 'MANAGE REGISTRATION AND FEES POLICIES',
          function_name: 'CAN EDIT SURCHARGE FEES POLICIES',
          function_description: 'CAN EDIT SURCHARGE POLICIES',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: policyManagerApplicationObject[0].id,
          action_group: 'MANAGE REGISTRATION AND FEES POLICIES',
          function_name: 'CAN DELETE SURCHARGE POLICIES',
          function_description: 'CAN DELETE SURCHARGE POLICIES',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: policyManagerApplicationObject[0].id,
          action_group: 'MANAGE REGISTRATION AND FEES POLICIES',
          function_name: 'CAN ACTIVATE SURCHARGE POLICIES',
          function_description: 'CAN ACTIVATE SURCHARGE POLICIES',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: policyManagerApplicationObject[0].id,
          action_group: 'MANAGE REGISTRATION AND FEES POLICIES',
          function_name: 'CAN DEACTIVATE SURCHARGE POLICIES',
          function_description: 'CAN DEACTIVATE SURCHARGE POLICIES',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: policyManagerApplicationObject[0].id,
          action_group: 'MANAGE REGISTRATION AND FEES POLICIES',
          function_name: 'CAN APPROVE REGISTRATION AND FEES POLICY ACTIONS',
          function_description:
            'CAN APPROVE REGISTRATION AND FEES POLICY ACTIONS',
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
