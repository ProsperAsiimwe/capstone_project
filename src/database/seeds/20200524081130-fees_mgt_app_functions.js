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
    // fees mgt

    const feesManagerApplication = await queryInterface.sequelize
      .query(`select id from user_mgt.apps
where app_name = 'FEES MANAGEMENT'`);

    const feesManagerApplicationObject = feesManagerApplication[0];

    await queryInterface.bulkInsert(
      {
        schema: 'user_mgt',
        tableName: 'app_functions',
      },
      [
        {
          app_id: feesManagerApplicationObject[0].id,
          action_group: 'MANAGE FEES ELEMENTS',
          function_name: 'CAN VIEW FEES ELEMENTS',
          function_description: 'CAN VIEW FEES ELEMENTS',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: feesManagerApplicationObject[0].id,
          action_group: 'MANAGE FEES ELEMENTS',
          function_name: 'CAN CREATE NEW FEES ELEMENTS',
          function_description: 'CAN CREATE NEW FEES ELEMENTS',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: feesManagerApplicationObject[0].id,
          action_group: 'MANAGE FEES ELEMENTS',
          function_name: 'CAN EDIT FEES ELEMENTS',
          function_description: 'CAN EDIT FEES ELEMENTS',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: feesManagerApplicationObject[0].id,
          action_group: 'MANAGE FEES ELEMENTS',
          function_name: 'CAN DELETE FEES ELEMENTS',
          function_description: 'CAN DELETE FEES ELEMENTS',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: feesManagerApplicationObject[0].id,
          action_group: 'MANAGE FEES ELEMENTS',
          function_name: 'CAN APPROVE FEES ELEMENTS ACTIONS',
          function_description: 'CAN APPROVE FEES ELEMENTS ACTIONS',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: feesManagerApplicationObject[0].id,
          action_group: ' MANAGE TUITION FEES AMOUNTS',
          function_name: 'CAN VIEW TUITION FEES AMOUNTS',
          function_description: 'CAN VIEW TUITION FEES AMOUNTS',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: feesManagerApplicationObject[0].id,
          action_group: ' MANAGE TUITION FEES AMOUNTS',
          function_name: 'CAN DEFINE NEW TUITION FEES AMOUNTS',
          function_description: 'CAN DEFINE TUITION FEES AMOUNTS',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: feesManagerApplicationObject[0].id,
          action_group: ' MANAGE TUITION FEES AMOUNTS',
          function_name: 'CAN EDIT TUITION FEES AMOUNTS',
          function_description: 'CAN EDIT TUITION FEES AMOUNTS',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: feesManagerApplicationObject[0].id,
          action_group: ' MANAGE TUITION FEES AMOUNTS',
          function_name: 'CAN DELETE TUITION FEES AMOUNTS',
          function_description: 'CAN DELETE TUITION FEES AMOUNTS',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: feesManagerApplicationObject[0].id,
          action_group: ' MANAGE TUITION FEES AMOUNTS',
          function_name: 'CAN APPROVE TUITION FEES AMOUNTS ACTIONS',
          function_description: 'CAN APPROVE TUITION FEES AMOUNTS ACTIONS',
          created_at: new Date(),
          updated_at: new Date(),
        },
        //
        {
          app_id: feesManagerApplicationObject[0].id,
          action_group: ' MANAGE FUNCTIONAL FEES AMOUNTS',
          function_name: 'CAN VIEW FUNCTIONAL FEES AMOUNTS',
          function_description: 'CAN VIEW FUNCTIONAL FEES AMOUNTS',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: feesManagerApplicationObject[0].id,
          action_group: ' MANAGE FUNCTIONAL FEES AMOUNTS',
          function_name: 'CAN CREATE DEFINE NEW FEES AMOUNTS',
          function_description: 'CAN DEFINE NEW FUNCTIONAL FEES AMOUNTS',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: feesManagerApplicationObject[0].id,
          action_group: ' MANAGE FUNCTIONAL FEES AMOUNTS',
          function_name: 'CAN EDIT FUNCTIONAL FEES AMOUNTS',
          function_description: 'CAN EDIT FUNCTIONAL FEES AMOUNTS',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: feesManagerApplicationObject[0].id,
          action_group: ' MANAGE FUNCTIONAL FEES AMOUNTS',
          function_name: 'CAN DELETE FUNCTIONAL FEES AMOUNTS',
          function_description: 'CAN DELETE FUNCTIONAL FEES AMOUNTS',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: feesManagerApplicationObject[0].id,
          action_group: ' MANAGE FUNCTIONAL FEES AMOUNTS',
          function_name: 'CAN APPROVE FUNCTIONAL FEES AMOUNTS ACTIONS',
          function_description: 'CAN APPROVE FUNCTIONAL FEES AMOUNTS ACTIONS',
          created_at: new Date(),
          updated_at: new Date(),
        },
        //
        {
          app_id: feesManagerApplicationObject[0].id,
          action_group: ' MANAGE OTHER FEES AMOUNTS',
          function_name: 'CAN VIEW OTHER FEES AMOUNTS',
          function_description: 'CAN VIEW OTHER FEES AMOUNTS',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: feesManagerApplicationObject[0].id,
          action_group: ' MANAGE OTHER FEES AMOUNTS',
          function_name: 'CAN DEFINE NEW OTHER FEES AMOUNTS',
          function_description: 'CAN DEFINE NEW OTHER FEES AMOUNTS',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: feesManagerApplicationObject[0].id,
          action_group: ' MANAGE OTHER FEES AMOUNTS',
          function_name: 'CAN EDIT OTHER FEES AMOUNTS',
          function_description: 'CAN EDIT OTHER FEES AMOUNTS',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: feesManagerApplicationObject[0].id,
          action_group: ' MANAGE OTHER FEES AMOUNTS',
          function_name: 'CAN DELETE OTHER FEES AMOUNTS',
          function_description: 'CAN DELETE OTHER FEES AMOUNTS',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: feesManagerApplicationObject[0].id,
          action_group: ' MANAGE OTHER FEES AMOUNTS',
          function_name: 'CAN APPROVE OTHER FEES AMOUNTS ACTIONS',
          function_description: 'CAN APPROVE OTHER FEES AMOUNTS ACTIONS',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: feesManagerApplicationObject[0].id,
          action_group: 'MANAGE FEES WAIVER SCHEMES',
          function_name: 'CAN VIEW FEES WAIVER SCHEMES',
          function_description: 'CAN VIEW FEES WAIVER SCHEMES',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: feesManagerApplicationObject[0].id,
          action_group: 'MANAGE FEES WAIVER SCHEMES',
          function_name: 'CAN CREATE NEW FEES WAIVER SCHEME',
          function_description: 'CAN CREATE NEW FEES WAIVER SCHEME',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: feesManagerApplicationObject[0].id,
          action_group: 'MANAGE FEES WAIVER SCHEMES',
          function_name: 'CAN EDIT FEES WAIVER SCHEME',
          function_description: 'CAN EDIT FEES WAIVER SCHEME',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: feesManagerApplicationObject[0].id,
          action_group: 'MANAGE FEES WAIVER SCHEMES',
          function_name: 'CAN DELETE FEES WAIVER SCHEME',
          function_description: 'CAN DELETE FEES WAIVER SCHEME',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: feesManagerApplicationObject[0].id,
          action_group: 'MANAGE FEES WAIVERS',
          function_name: 'CAN VIEW FEES WAIVERS DISCOUNTS',
          function_description: 'CAN VIEW FEES WAIVER DISCOUNTS',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: feesManagerApplicationObject[0].id,
          action_group: 'MANAGE FEES WAIVERS',
          function_name: 'CAN DEFINE FEES WAIVERS DISCOUNTS',
          function_description: 'CAN DEFINE FEES WAIVERS DISCOUNTS',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: feesManagerApplicationObject[0].id,
          action_group: 'MANAGE FEES WAIVER SCHEMES',
          function_name: 'CAN APPROVE FEES WAIVER SCHEME ACTIONS',
          function_description: 'CAN APPROVE FEES WAIVER SCHEME ACTIONS',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: feesManagerApplicationObject[0].id,
          action_group: 'MANAGE FEES PREVIEW',
          function_name: 'CAN PREVIEW FEES',
          function_description: 'CAN PREVIEW FEES',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: feesManagerApplicationObject[0].id,
          action_group: 'MANAGE FEES COPY',
          function_name: 'CAN DO FEES COPY',
          function_description: 'CAN DO FEES COPY',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: feesManagerApplicationObject[0].id,
          action_group: 'MANAGE FEES COPY',
          function_name: 'CAN APPROVE FEES COPY',
          function_description: 'CAN APPROVE FEES COPY',
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
