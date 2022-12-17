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
    const studentRecordsApplication = await queryInterface.sequelize
      .query(`select id from user_mgt.apps
where app_name = 'STUDENTS RECORDS MANAGEMENT'`);

    const studentRecordsApplicationObject = studentRecordsApplication[0];

    /*

    student record seed
    */
    await queryInterface.bulkInsert(
      { tableName: 'app_functions', schema: 'user_mgt' },
      [
        {
          app_id: studentRecordsApplicationObject[0].id,
          action_group: 'MANAGE STUDENT RECORDS',
          function_name: 'CAN VIEW STUDENT RECORDS',
          function_description: 'CAN VIEW STUDENT RECORDS',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: studentRecordsApplicationObject[0].id,
          action_group: 'MANAGE STUDENT RECORDS',
          function_name: 'CAN VIEW STUDENT BIO-DATA',
          function_description: 'CAN VIEW STUDENT BIO-DATA',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: studentRecordsApplicationObject[0].id,
          action_group: 'MANAGE STUDENTS RECORDS',
          function_name: 'CAN ADD STUDENTS',
          function_description: 'CAN ADD STUDENTS',
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
