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
    // point of service
    const pointServiceApplication = await queryInterface.sequelize
      .query(`select id from user_mgt.apps
where app_name = 'POINT OF SERVICE'`);

    const pointServiceApplicationObject = pointServiceApplication[0];
    // OUTREACH MANAGEMENT
    const outReachApplication = await queryInterface.sequelize
      .query(`select id from user_mgt.apps
where app_name = 'OUTREACH MANAGEMENT'`);

    const outReachApplicationObject = outReachApplication[0];
    //  medical services
    const medicalApplication = await queryInterface.sequelize
      .query(`select id from user_mgt.apps
where app_name = 'MEDICAL SERVICES'`);

    const medicalApplicationObject = medicalApplication[0];
    // e-voting services
    const eVotingApplication = await queryInterface.sequelize
      .query(`select id from user_mgt.apps
where app_name = 'E-VOTING'`);

    const eVotingApplicationObject = eVotingApplication[0];
    // ESTATES MANAGEMENT
    const estatesApplication = await queryInterface.sequelize
      .query(`select id from user_mgt.apps
where app_name = 'ESTATES MANAGEMENT'`);

    const estatesApplicationObject = estatesApplication[0];
    //
    const academicDocumentApplication = await queryInterface.sequelize
      .query(`select id from user_mgt.apps
where app_name = 'ACADEMIC DOCUMENTS PRODUCTION'`);

    const academicDocumentApplicationObject = academicDocumentApplication[0];
    // students clearance management
    const studentsClearanceApplication = await queryInterface.sequelize
      .query(`select id from user_mgt.apps
where app_name = 'STUDENTS CLEARANCE MANAGEMENT'`);
    const studentsClearanceApplicationObject = studentsClearanceApplication[0];

    // STD SUPPORT

    const studentSupport = await queryInterface.sequelize
      .query(`select id from user_mgt.apps
where app_name = 'STUDENT SUPPORT MANAGEMENT'`);
    const studentSupportObj = studentSupport[0];

    // point of services

    await queryInterface.bulkInsert(
      { tableName: 'app_functions', schema: 'user_mgt' },
      [
        {
          app_id: pointServiceApplicationObject[0].id,
          action_group: 'MANAGE SERVICE POINTS',
          function_name: 'VIEW STUDENT RECORDS',
          function_description: 'VIEW STUDENT RECORDS ',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
    // outReachApplicationObject
    await queryInterface.bulkInsert(
      { tableName: 'app_functions', schema: 'user_mgt' },
      [
        {
          app_id: outReachApplicationObject[0].id,
          action_group: 'MANAGE OUTREACH',
          function_name: 'VIEW STUDENT DATA',
          function_description: 'VIEW STUDENT DATA',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
    // medicalApplicationObject
    await queryInterface.bulkInsert(
      { tableName: 'app_functions', schema: 'user_mgt' },
      [
        {
          app_id: medicalApplicationObject[0].id,
          action_group: 'MANAGE MEDICAL SERVICES',
          function_name: 'VIEW STUDENT MEDICAL RECORDS',
          function_description: 'VIEW STUDENT MEDICAL RECORDS',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
    // eVotingApplicationObject
    await queryInterface.bulkInsert(
      { tableName: 'app_functions', schema: 'user_mgt' },
      [
        {
          app_id: eVotingApplicationObject[0].id,
          action_group: 'MANAGE E-VOTING SERVICES',
          function_name: 'VIEW STUDENT VOTING RECORDS',
          function_description: 'VIEW STUDENT VOTING RECORDS',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
    // estates management
    await queryInterface.bulkInsert(
      { tableName: 'app_functions', schema: 'user_mgt' },
      [
        {
          app_id: estatesApplicationObject[0].id,
          action_group: 'MANAGE ESTATES SERVICES',
          function_name: 'VIEW STUDENTS RESIDENCES',
          function_description: 'VIEW STUDENTS RESIDENCE',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
    // academicDocumentApplicationObject
    await queryInterface.bulkInsert(
      { tableName: 'app_functions', schema: 'user_mgt' },
      [
        {
          app_id: academicDocumentApplicationObject[0].id,
          action_group: 'MANAGE ACADEMIC DOCUMENTS',
          function_name: 'VIEW STUDENTS ACADEMIC RECORDS',
          function_description: 'VIEW STUDENTS ACADEMIC RECORDS',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
    // students clearance management
    await queryInterface.bulkInsert(
      { tableName: 'app_functions', schema: 'user_mgt' },
      [
        {
          app_id: studentsClearanceApplicationObject[0].id,
          action_group: 'MANAGE STUDENTS CLEARANCE',
          function_name: 'VIEW STUDENTS ACADEMIC RECORDS',
          function_description: 'VIEW STUDENTS ACADEMIC RECORDS',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );

    // student support

    await queryInterface.bulkInsert(
      { tableName: 'app_functions', schema: 'user_mgt' },
      [
        {
          app_id: studentSupportObj[0].id,
          action_group: 'MANAGE STUDENTS SUPPORT',
          function_name: 'CAN GENERATE STUDENT TOKENS',
          function_description: 'CAN GENERATE STUDENT TOKENS',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: studentSupportObj[0].id,
          action_group: 'MANAGE STUDENTS SUPPORT',
          function_name: 'CAN EDIT STUDENT CONTACT',
          function_description: 'CAN EDIT STUDENT CONTACT',
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
