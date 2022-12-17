'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronously.

      Example:
      return queryInterface.bulkInsert('People', [{
        name: 'John Doe',
        isBetaMember: false
      }], {});
    */

    const systemAdminUser = await queryInterface.sequelize.query(
      `SELECT users.id
      From user_mgt.users as users
      INNER JOIN user_mgt.user_roles as roles 
      on roles.user_id =  users.id
      Inner join user_mgt.roles as r
      on roles.role_id = r.id
    WHERE r.role_code ='SUPER_ADMIN' and users.surname ='SUPER' LIMIT 1;`
    );

    const systemAdminUserObject = systemAdminUser[0];

    // BOUND LEVEL
    const boundLevels = await queryInterface.sequelize.query(
      `SELECT id From app_mgt.metadata
    WHERE metadata_name ='ACCESS DOMAINS';`
    );
    const boundLevelsObject = boundLevels[0];
    // UNEB STUDY LEVEL

    const unebStudyLevel = await queryInterface.sequelize.query(
      `SELECT id From app_mgt.metadata
    WHERE metadata_name ='UNEB STUDY LEVELS';`
    );
    const unebStudyLevelObject = unebStudyLevel[0];

    // campuses
    const campus = await queryInterface.sequelize.query(
      `SELECT id From app_mgt.metadata
    WHERE metadata_name ='CAMPUSES';`
    );
    const campusObject = campus[0];

    // GENERAL SUBJECT CATEGORIES
    const generalSubjectCategory = await queryInterface.sequelize.query(
      `SELECT id From app_mgt.metadata
    WHERE metadata_name ='GENERAL SUBJECT CATEGORIES';`
    );
    const generalSubjectCategoryObject = generalSubjectCategory[0];

    // ACCESS DOMAINS
    await queryInterface.bulkInsert(
      { schema: 'app_mgt', tableName: 'metadata_values' },
      [
        {
          metadata_id: boundLevelsObject[0].id,
          metadata_value: 'COLLEGES',
          metadata_value_description: 'COLLEGES',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: boundLevelsObject[0].id,
          metadata_value: 'FACULTIES',
          metadata_value_description: 'FACULTIES',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: boundLevelsObject[0].id,
          metadata_value: 'DEPARTMENTS',
          metadata_value_description: 'DEPARTMENTS',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: boundLevelsObject[0].id,
          metadata_value: 'CAMPUSES',
          metadata_value_description: 'CAMPUSES',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: boundLevelsObject[0].id,
          metadata_value: 'PROGRAMMES',
          metadata_value_description: 'PROGRAMMES',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );

    // uneb_study_level_data
    await queryInterface.bulkInsert(
      { schema: 'app_mgt', tableName: 'metadata_values' },
      [
        {
          metadata_id: unebStudyLevelObject[0].id,
          metadata_value: 'O LEVEL',
          metadata_value_description: 'O LEVEL',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: unebStudyLevelObject[0].id,
          metadata_value: 'A LEVEL',
          metadata_value_description: 'A LEVEL',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
    // CAMPUS
    await queryInterface.bulkInsert(
      { schema: 'app_mgt', tableName: 'metadata_values' },
      [
        {
          metadata_id: campusObject[0].id,
          metadata_value: 'MAIN CAMPUS',
          metadata_value_description: 'MAIN CAMPUS',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: campusObject[0].id,
          metadata_value: 'KABALE CAMPUS',
          metadata_value_description: 'KABALE CAMPUS',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: campusObject[0].id,
          metadata_value: 'JINJA CAMPUS',
          metadata_value_description: 'JINJA CAMPUS',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: campusObject[0].id,
          metadata_value: 'MUBS',
          metadata_value_description: 'MUBS',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
    // general subject category
    await queryInterface.bulkInsert(
      { schema: 'app_mgt', tableName: 'metadata_values' },
      [
        {
          metadata_id: generalSubjectCategoryObject[0].id,
          metadata_value: 'SCIENCES',
          metadata_value_description: 'SCIENCES',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: generalSubjectCategoryObject[0].id,
          metadata_value: 'ARTS',
          metadata_value_description: 'ARTS',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronously.

      Example:
      return queryInterface.bulkDelete('People', null, {});
    */
    await queryInterface.bulkDelete(
      { tableName: 'metadata_values', schema: 'app_mgt' },
      null,
      {}
    );
  },
};
