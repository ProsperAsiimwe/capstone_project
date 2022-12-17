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
    const institutionManagerApplication = await queryInterface.sequelize
      .query(`select id from user_mgt.apps
where app_name = 'INSTITUTION SETUP'`);

    const institutionManagerApplicationObject =
      institutionManagerApplication[0];

    await queryInterface.bulkInsert(
      { schema: 'user_mgt', tableName: 'app_functions' },
      [
        {
          app_id: institutionManagerApplicationObject[0].id,
          action_group: 'MANAGE INSTITUTION STRUCTURE',
          function_name: 'CAN VIEW INSTITUTION STRUCTURE',
          function_description: 'CAN VIEW INSTITUTION STRUCTURE',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: institutionManagerApplicationObject[0].id,
          action_group: 'MANAGE INSTITUTION STRUCTURE',
          function_name: 'CAN UPDATE INSTITUTION STRUCTURE',
          function_description: 'CAN UPDATE INSTITUTION STRUCTURE',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: institutionManagerApplicationObject[0].id,
          action_group: 'MANAGE METADATA',
          function_name: 'CAN VIEW METADATA',
          function_description: 'CAN VIEW METADATA',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: institutionManagerApplicationObject[0].id,
          action_group: 'MANAGE METADATA',
          function_name: 'CAN CREATE NEW METADATA',
          function_description: 'CAN CREATE NEW METADATA',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: institutionManagerApplicationObject[0].id,
          action_group: 'MANAGE METADATA',
          function_name: 'CAN EDIT METADATA',
          function_description: 'CAN EDIT METADATA',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: institutionManagerApplicationObject[0].id,
          action_group: 'MANAGE METADATA VALUES',
          function_name: 'CAN VIEW METADATA VALUES',
          function_description: 'CAN VIEW METADATA VALUES',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: institutionManagerApplicationObject[0].id,
          action_group: 'MANAGE METADATA VALUES',
          function_name: 'CAN EDIT METADATA VALUES',
          function_description: 'CAN EDIT METADATA VALUES',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: institutionManagerApplicationObject[0].id,
          action_group: 'MANAGE METADATA VALUES',
          function_name: 'CAN CREATE NEW METADATA VALUES',
          function_description: 'CAN CREATE NEW METADATA VALUES',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: institutionManagerApplicationObject[0].id,
          action_group: 'MANAGE METADATA VALUES',
          function_name: 'CAN DELETE METADATA VALUES',
          function_description: 'CAN DELETE METADATA VALUES',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: institutionManagerApplicationObject[0].id,
          action_group: 'MANAGE ACADEMIC UNITS',
          function_name: 'CAN VIEW COLLEGES',
          function_description: 'CAN VIEW COLLEGES',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: institutionManagerApplicationObject[0].id,
          action_group: 'MANAGE ACADEMIC UNITS',
          function_name: 'CAN CREATE NEW COLLEGES',
          function_description: 'CAN CREATE NEW COLLEGES',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: institutionManagerApplicationObject[0].id,
          action_group: 'MANAGE ACADEMIC UNITS',
          function_name: 'CAN EDIT COLLEGES',
          function_description: 'CAN EDIT COLLEGES',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: institutionManagerApplicationObject[0].id,
          action_group: 'MANAGE ACADEMIC UNITS',
          function_name: 'CAN DELETE COLLEGES',
          function_description: 'CAN DELETE COLLEGES',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: institutionManagerApplicationObject[0].id,
          action_group: 'MANAGE ACADEMIC UNITS',
          function_name: 'CAN DOWNLOAD COLLEGES',
          function_description: 'CAN DOWNLOAD COLLEGES',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: institutionManagerApplicationObject[0].id,
          action_group: 'MANAGE ACADEMIC UNITS',
          function_name: 'CAN VIEW SCHOOLS/FACULTY',
          function_description: 'CAN VIEW SCHOOLS/FACULTY',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: institutionManagerApplicationObject[0].id,
          action_group: 'MANAGE ACADEMIC UNITS',
          function_name: 'CAN CREATE NEW SCHOOLS/FACULTY',
          function_description: 'CAN CREATE NEW SCHOOLS/FACULTY',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: institutionManagerApplicationObject[0].id,
          action_group: 'MANAGE ACADEMIC UNITS',
          function_name: 'CAN EDIT SCHOOLS/FACULTY',
          function_description: 'CAN EDIT SCHOOLS/FACULTY',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: institutionManagerApplicationObject[0].id,
          action_group: 'MANAGE ACADEMIC UNITS',
          function_name: 'CAN DELETE SCHOOLS/FACULTY',
          function_description: 'CAN DELETE SCHOOLS/FACULTY',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: institutionManagerApplicationObject[0].id,
          action_group: 'MANAGE ACADEMIC UNITS',
          function_name: 'CAN DOWNLOAD SCHOOLS/FACULTY',
          function_description: 'CAN DOWNLOAD SCHOOLS/FACULTY',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: institutionManagerApplicationObject[0].id,
          action_group: 'MANAGE ACADEMIC UNITS',
          function_name: 'CAN VIEW DEPARTMENTS',
          function_description: 'CAN VIEW DEPARTMENTS',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: institutionManagerApplicationObject[0].id,
          action_group: 'MANAGE ACADEMIC UNITS',
          function_name: 'CAN CREATE NEW DEPARTMENTS',
          function_description: 'CAN CREATE NEW DEPARTMENTS',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: institutionManagerApplicationObject[0].id,
          action_group: 'MANAGE ACADEMIC UNITS',
          function_name: 'CAN EDIT DEPARTMENTS',
          function_description: 'CAN EDIT DEPARTMENTS',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: institutionManagerApplicationObject[0].id,
          action_group: 'MANAGE ACADEMIC UNITS',
          function_name: 'CAN DELETE DEPARTMENTS',
          function_description: 'CAN DELETE DEPARTMENTS',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: institutionManagerApplicationObject[0].id,
          action_group: 'MANAGE ACADEMIC UNITS',
          function_name: 'CAN DOWNLOAD DEPARTMENTS',
          function_description: 'CAN DOWNLOAD DEPARTMENTS',
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
      { schema: 'user_mgt', tableName: 'app_functions' },
      null,
      {}
    );
  },
};
