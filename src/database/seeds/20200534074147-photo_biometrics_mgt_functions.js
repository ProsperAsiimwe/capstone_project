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
    // photoBiometricManagerApplicationObject
    const photoBiometricManagerApplication = await queryInterface.sequelize
      .query(`select id from user_mgt.apps
where app_name = 'PHOTO AND BIOMETRICS CAPTURE'`);

    const photoBiometricManagerApplicationObject =
      photoBiometricManagerApplication[0];

    // photo and biometrics
    await queryInterface.bulkInsert(
      { tableName: 'app_functions', schema: 'user_mgt' },
      [
        {
          app_id: photoBiometricManagerApplicationObject[0].id,
          action_group: 'MANAGE PHOTOS AND BIOMETRICS',
          function_name: 'CAN VIEW STUDENTS RECORDS',
          function_description: 'CAN VIEW STUDENTS RECORDS',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: photoBiometricManagerApplicationObject[0].id,
          action_group: 'MANAGE PHOTOS AND BIOMETRICS',
          function_name: 'CAN UPLOAD PHOTO',
          function_description: 'CAN UPLOAD PHOTO',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: photoBiometricManagerApplicationObject[0].id,
          action_group: 'MANAGE PHOTOS AND BIOMETRICS',
          function_name: 'CAN CAPTURE SIGNATURE',
          function_description: 'CAN CAPTURE SIGNATURE',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: photoBiometricManagerApplicationObject[0].id,
          action_group: 'MANAGE PHOTOS AND BIOMETRICS',
          function_name: 'CAN CAPTURE FINGERPRINT',
          function_description: 'CAN CAPTURE FINGERPRINT',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: photoBiometricManagerApplicationObject[0].id,
          action_group: 'MANAGE PHOTOS AND BIOMETRICS',
          function_name: 'CAN CAPTURE EYE DETECTION',
          function_description: 'CAN CAPTURE EYE DETECTION',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: photoBiometricManagerApplicationObject[0].id,
          action_group: 'MANAGE STUDENT IDENTIFICATION',
          function_name: 'CAN VIEW STUDENT IDENTIFICATION RECORDS',
          function_description: 'CAN VIEW STUDENT IDENTIFICATION RECORDS',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_id: photoBiometricManagerApplicationObject[0].id,
          action_group: 'MANAGE IDENTITY CARDS',
          function_name: 'CAN PRINT IDENTITY CARDS',
          function_description: 'CAN PRINT IDENTITY CARDS',
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
