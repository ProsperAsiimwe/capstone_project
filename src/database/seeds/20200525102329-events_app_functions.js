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
    const eventsManagerApplication = await queryInterface.sequelize
      .query(`select id from user_mgt.apps
where app_name = 'EVENTS SCHEDULER AND TIME TABLE MANAGEMENT'`);

    const eventsManagerApplicationObject = eventsManagerApplication[0];

    // events seeds
    await queryInterface.bulkInsert(
      { tableName: 'app_functions', schema: 'user_mgt' },
      [
        {
          app_id: eventsManagerApplicationObject[0].id,
          action_group: 'MANAGE ACADEMIC CALENDER',
          function_name: 'CAN CREATE ACADEMIC YEAR',
          function_description: 'CAN CREATE ACADEMIC YEAR',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: eventsManagerApplicationObject[0].id,
          action_group: 'MANAGE ACADEMIC CALENDER',
          function_name: 'CAN VIEW ACADEMIC CALENDER',
          function_description: 'CAN VIEW ACADEMIC CALENDER',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: eventsManagerApplicationObject[0].id,
          action_group: 'MANAGE ACADEMIC YEARS',
          function_name: 'CAN EDIT ACADEMIC YEAR',
          function_description: 'CAN EDIT ACADEMIC YEAR',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: eventsManagerApplicationObject[0].id,
          action_group: 'MANAGE ACADEMIC YEARS',
          function_name: 'CAN DELETE ACADEMIC YEAR',
          function_description: 'CAN DELETE ACADEMIC YEAR',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: eventsManagerApplicationObject[0].id,
          action_group: 'MANAGE ACADEMIC YEARS',
          function_name: 'CAN APPROVE ACADEMIC CALENDAR ACTIONS',
          function_description: 'CAN APPROVE ACADEMIC CALENDAR ACTIONS',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: eventsManagerApplicationObject[0].id,
          action_group: 'MANAGE EVENTS',
          function_name: 'CAN CREATE EVENTS',
          function_description: 'CAN CREATE EVENTS',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: eventsManagerApplicationObject[0].id,
          action_group: 'MANAGE EVENTS',
          function_name: 'CAN VIEW EVENTS',
          function_description: 'CAN VIEW EVENTS',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: eventsManagerApplicationObject[0].id,
          action_group: 'MANAGE EVENTS',
          function_name: 'CAN EDIT EVENTS',
          function_description: 'CAN EDIT EVENTS',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: eventsManagerApplicationObject[0].id,
          action_group: 'MANAGE EVENTS',
          function_name: 'CAN DELETE EVENTS',
          function_description: 'CAN DELETE EVENTS',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: eventsManagerApplicationObject[0].id,
          action_group: 'MANAGE EVENTS',
          function_name: 'CAN APPROVE EVENTS ACTIONS',
          function_description: 'CAN APPROVE EVENTS ACTIONS',
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
