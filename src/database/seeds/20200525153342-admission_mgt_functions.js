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
    // admission function
    const admissionManagerApplication = await queryInterface.sequelize
      .query(`select id from user_mgt.apps
where app_name = 'ADMISSIONS MANAGEMENT'`);

    const admissionManagerApplicationObject = admissionManagerApplication[0];

    await queryInterface.bulkInsert(
      { tableName: 'app_functions', schema: 'user_mgt' },
      [
        {
          app_id: admissionManagerApplicationObject[0].id,
          action_group: 'MANAGE ADMISSION SCHEME',
          function_name: 'CAN VIEW ADMISSION SCHEMES',
          function_description: 'CAN VIEW ADMISSION SCHEMES',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: admissionManagerApplicationObject[0].id,
          action_group: 'MANAGE ADMISSION SCHEME',
          function_name: 'CAN CREATE NEW ADMISSION SCHEMES',
          function_description: 'CAN CREATE NEW ADMISSION SCHEMES',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: admissionManagerApplicationObject[0].id,
          action_group: 'MANAGE ADMISSION SCHEME',
          function_name: 'CAN EDIT ADMISSION SCHEMES',
          function_description: 'CAN EDIT ADMISSION SCHEMES',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: admissionManagerApplicationObject[0].id,
          action_group: 'MANAGE ADMISSION SCHEME',
          function_name: 'CAN DELETE ADMISSION SCHEMES',
          function_description: 'CAN DELETE ADMISSION SCHEMES',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: admissionManagerApplicationObject[0].id,
          action_group: 'MANAGE ADMISSION FORMS',
          function_name: 'CAN VIEW ADMISSION FORMS',
          function_description: 'CAN VIEW ADMISSION FORMS',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: admissionManagerApplicationObject[0].id,
          action_group: 'MANAGE ADMISSION FORMS',
          function_name: 'CAN CREATE NEW ADMISSION FORMS',
          function_description: 'CAN CREATE NEW ADMISSION FORMS',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: admissionManagerApplicationObject[0].id,
          action_group: 'MANAGE ADMISSION FORMS',
          function_name: 'CAN EDIT ADMISSION FORMS',
          function_description: 'CAN EDIT ADMISSION FORMS',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: admissionManagerApplicationObject[0].id,
          action_group: 'MANAGE ADMISSION FORMS',
          function_name: 'CAN DELETE ADMISSION FORMS',
          function_description: 'CAN DELETE ADMISSION FORMS',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: admissionManagerApplicationObject[0].id,
          action_group: 'MANAGE ADMISSIONS',
          function_name: 'CAN VIEW RUNNING ADMISSIONS',
          function_description: 'CAN VIEW RUNNING ADMISSIONS',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: admissionManagerApplicationObject[0].id,
          action_group: 'MANAGE ADMISSIONS',
          function_name: 'CAN OPEN NEW ADMISSIONS',
          function_description: 'CAN OPEN NEW ADMISSIONS',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: admissionManagerApplicationObject[0].id,
          action_group: 'MANAGE ADMISSIONS',
          function_name: 'CAN MANAGE ADMISSION PROGRAMMES',
          function_description: 'CAN MANAGE ADMISSION PROGRAMMES',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: admissionManagerApplicationObject[0].id,
          action_group: 'MANAGE ADMISSION',
          function_name: 'CAN EDIT RUNNING ADMISSIONS',
          function_description: 'CAN EDIT RUNNING ADMISSIONS',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: admissionManagerApplicationObject[0].id,
          action_group: 'MANAGE ADMISSION',
          function_name: 'CAN DELETE RUNNING ADMISSIONS',
          function_description: 'CAN DELETE RUNNING ADMISSIONS',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: admissionManagerApplicationObject[0].id,
          action_group: 'MANAGE ADMISSION',
          function_name: 'CAN START ADMISSIONS',
          function_description: 'CAN START ADMISSIONS',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: admissionManagerApplicationObject[0].id,
          action_group: 'MANAGE ADMISSION',
          function_name: 'CAN STOP ADMISSIONS',
          function_description: 'CAN STOP ADMISSIONS',
          created_at: new Date(),
          updated_at: new Date(),
        },
        /**
         *
         *APPLICANT DATA
         */
        {
          app_id: admissionManagerApplicationObject[0].id,
          action_group: 'MANAGE APPLICANTS',
          function_name: 'CAN VIEW APPLICANT RECORDS',
          function_description: 'CAN VIEW APPLICANT RECORDS',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: admissionManagerApplicationObject[0].id,
          action_group: 'MANAGE APPLICANTS',
          function_name: 'CAN EDIT APPLICANT RECORDS',
          function_description: 'CAN EDIT APPLICANT RECORDS ',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: admissionManagerApplicationObject[0].id,
          action_group: 'MANAGE APPLICANTS',
          function_name: 'CAN  DELETE APPLICANT RECORDS',
          function_description: 'CAN DELETE APPLICANT RECORDS ',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: admissionManagerApplicationObject[0].id,
          action_group: 'MANAGE APPLICANTS',
          function_name: 'CAN DOWNLOAD APPLICANTS',
          function_description: 'CAN DOWNLOAD APPLICANTS',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: admissionManagerApplicationObject[0].id,
          action_group: 'MANAGE APPLICANTS',
          function_name: 'CAN VIEW ADMISSION SUMMARY',
          function_description: 'CAN VIEW ADMISSION SUMMARY',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: admissionManagerApplicationObject[0].id,
          action_group: 'MANAGE APPLICANTS',
          function_name: 'CAN ADD APPLICANTS',
          function_description: 'CAN ADD APPLICANTS',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: admissionManagerApplicationObject[0].id,
          action_group: 'MANAGE APPLICANTS',
          function_name: 'CAN EDIT APPLICANTS',
          function_description: 'CAN EDIT APPLICANTS',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: admissionManagerApplicationObject[0].id,
          action_group: 'MANAGE APPLICANTS',
          function_name: 'CAN IMPORT APPLICANTS',
          function_description: 'CAN IMPORT APPLICANTS',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: admissionManagerApplicationObject[0].id,
          action_group: 'MANAGE APPLICANTS',
          function_name: 'CAN ADMINISTRATIVELY ADMIT APPLICANTS',
          function_description: 'CAN ADMINISTRATIVELY ADMIT APPLICANTS',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: admissionManagerApplicationObject[0].id,
          action_group: 'MANAGE APPLICANTS',
          function_name: 'CAN RESET PASSWORDS',
          function_description: 'CAN RESET PASSWORDS',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: admissionManagerApplicationObject[0].id,
          action_group: 'MANAGE APPLICANTS',
          function_name: 'CAN PRINT CURRENT',
          function_description: 'CAN PRINT CURRENT',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: admissionManagerApplicationObject[0].id,
          action_group: 'MANAGE APPLICANTS',
          function_name: 'CAN PRINT ALL',
          function_description: 'CAN PRINT ALL',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: admissionManagerApplicationObject[0].id,
          action_group: 'MANAGE APPLICANTS',
          function_name: 'CAN PRINT SELECTED FORMS',
          function_description: 'CAN PRINT SELECTED FORMS',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: admissionManagerApplicationObject[0].id,
          action_group: 'MANAGE APPLICANTS',
          function_name: 'CAN EXPORT',
          function_description: 'CAN EXPORT',
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
