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
    // course assignment
    const courseAssignmentManagerApplication = await queryInterface.sequelize
      .query(`select id from user_mgt.apps
where app_name = 'COURSE ASSIGNMENT'`);

    const courseAssignmentManagerApplicationobject =
      courseAssignmentManagerApplication[0];

    // RESULTS MANAGEMENT
    const resultManagerApplication = await queryInterface.sequelize
      .query(`select id from user_mgt.apps
where app_name = 'RESULTS MANAGEMENT'`);

    const resultManagerApplicationObject = resultManagerApplication[0];
    // Humane Resource Management

    const humanResourceManagerApplication = await queryInterface.sequelize
      .query(`select id from user_mgt.apps
where app_name = 'HUMAN RESOURCE MANAGEMENT'`);

    const humanResourceManagerApplicationObject =
      humanResourceManagerApplication[0];

    // Business Intelligence
    const businessIntelligenceManagerApplication = await queryInterface
      .sequelize.query(`select id from user_mgt.apps
where app_name = 'BUSINESS INTELLIGENCE'`);

    const businessIntelligenceManagerApplicationObject =
      businessIntelligenceManagerApplication[0];
    // Dean's App
    const deanManagerApplication = await queryInterface.sequelize
      .query(`select id from user_mgt.apps
where app_name = 'DEANS AND STUDENTS’ WELFARE MANAGEMENT'`);

    const deanManagerApplicationObject = deanManagerApplication[0];
    // Identity card
    const identityCardManagerApplication = await queryInterface.sequelize
      .query(`select id from user_mgt.apps
where app_name = 'IDENTITY CARD MANAGEMENT'`);

    const identityCardManagerApplicationObject =
      identityCardManagerApplication[0];

    // UNIVERSAL PAYMENT
    const universalPaymentApplication = await queryInterface.sequelize
      .query(`select id from user_mgt.apps
where app_name = 'UNIVERSAL PAYMENT'`);

    const universalPaymentApplicationObject = universalPaymentApplication[0];

    // course assignment
    await queryInterface.bulkInsert(
      { tableName: 'app_functions', schema: 'user_mgt' },
      [
        {
          app_id: courseAssignmentManagerApplicationobject[0].id,
          action_group: 'MANAGE COURSE ASSIGNMENT',
          function_name: 'VIEW COURSES',
          function_description: 'VIEW COURSES',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );

    // manage results
    await queryInterface.bulkInsert(
      { tableName: 'app_functions', schema: 'user_mgt' },
      [
        {
          app_id: resultManagerApplicationObject[0].id,
          action_group: 'MANAGE RESULTS',
          function_name: 'VIEW RESULTS',
          function_description: 'VIEW RESULTS',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );

    // Human Resource management
    await queryInterface.bulkInsert(
      { tableName: 'app_functions', schema: 'user_mgt' },
      [
        {
          app_id: humanResourceManagerApplicationObject[0].id,
          action_group: 'HUMAN RESOURCE DATA',
          function_name: 'MANAGE EMPLOYEE BIO DATA',
          function_description: 'MANAGE EMPLOYEE BIO DATA',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );

    // Business Intelligence
    await queryInterface.bulkInsert(
      { tableName: 'app_functions', schema: 'user_mgt' },
      [
        {
          app_id: businessIntelligenceManagerApplicationObject[0].id,
          action_group: 'VIEW ANALYTICS REPORTS',
          function_name: 'MANAGE ANALYTICS DASHBOARDS',
          function_description: 'MANAGE ANALYTICS DASHBOARDS',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );

    // DEAN'S APP
    await queryInterface.bulkInsert(
      { tableName: 'app_functions', schema: 'user_mgt' },
      [
        {
          app_id: deanManagerApplicationObject[0].id,
          action_group: 'MANAGE HALLS',
          function_name: 'MANAGE HALLS OF RESIDENCE',
          function_description: 'MANAGE HALLS OF RESIDENCE',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
    // IDENTITY CARD
    await queryInterface.bulkInsert(
      { tableName: 'app_functions', schema: 'user_mgt' },
      [
        {
          app_id: identityCardManagerApplicationObject[0].id,
          action_group: 'MANAGE PRINT CARDS',
          function_name: 'MANAGE PRINTING OF ID CARDS',
          function_description: 'MANAGE PRINTING OF ID CARDS',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );

    // UNIVERSAL PAYMENT
    await queryInterface.bulkInsert(
      { tableName: 'app_functions', schema: 'user_mgt' },
      [
        {
          app_id: universalPaymentApplicationObject[0].id,
          action_group: 'MANAGE PAYMENTS',
          function_name: 'MANAGE VIEW PAYMENTS',
          function_description: 'MANAGE VIEW PAYMENTS',
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
  },
};
