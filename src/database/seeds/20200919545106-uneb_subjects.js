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

    // super admin
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

    // O-LEVEL
    const ordinaryLevel = await queryInterface.sequelize
      .query(`select id from app_mgt.metadata_values
where metadata_value ='O LEVEL' LIMIT 1;`);
    const ordinaryLevelObject = ordinaryLevel[0];

    // A-LEVEL
    const advancedLevel = await queryInterface.sequelize
      .query(`select id from app_mgt.metadata_values
where metadata_value ='A LEVEL' LIMIT 1;`);
    const advancedLevelObject = advancedLevel[0];

    // science or arts
    const science = await queryInterface.sequelize
      .query(`select id from app_mgt.metadata_values
where metadata_value ='SCIENCES' LIMIT 1;`);
    const scienceObject = science[0];

    // subject category
    const mathematics = await queryInterface.sequelize
      .query(`select id from app_mgt.metadata_values
where metadata_value ='MATHEMATICS' LIMIT 1;`);
    const mathematicsObject = mathematics[0];
    //
    // subject category
    const scienceGeneral = await queryInterface.sequelize
      .query(`select id from app_mgt.metadata_values
where metadata_value ='SCIENCE SUBJECTS' LIMIT 1;
`);
    const scienceGeneralObject = scienceGeneral[0];
    /**
     * seeds
     *
     *
     */

    await queryInterface.bulkInsert(
      { schema: 'programme_mgt', tableName: 'uneb_subjects' },
      [
        {
          uneb_study_level_id: ordinaryLevelObject[0].id,
          general_subject_category_id: scienceObject[0].id,
          uneb_subject_category_id: mathematicsObject[0].id,
          uneb_subject_code: 'MAT203',
          uneb_subject_title: 'MATHEMATICS',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          uneb_study_level_id: ordinaryLevelObject[0].id,
          general_subject_category_id: scienceObject[0].id,
          uneb_subject_category_id: scienceGeneralObject[0].id,
          uneb_subject_code: '535',
          uneb_subject_title: 'PHYSICS',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          uneb_study_level_id: ordinaryLevelObject[0].id,
          general_subject_category_id: scienceObject[0].id,
          uneb_subject_category_id: scienceGeneralObject[0].id,
          uneb_subject_code: '554',
          uneb_subject_title: 'CHEMISTRY',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          uneb_study_level_id: ordinaryLevelObject[0].id,
          general_subject_category_id: scienceObject[0].id,
          uneb_subject_category_id: scienceGeneralObject[0].id,
          uneb_subject_code: '553',
          uneb_subject_title: 'BIOLOGY',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );

    await queryInterface.bulkInsert(
      {
        schema: 'programme_mgt',
        tableName: 'uneb_subjects',
      },
      [
        {
          uneb_study_level_id: advancedLevelObject[0].id,
          general_subject_category_id: scienceObject[0].id,
          uneb_subject_category_id: scienceGeneralObject[0].id,
          uneb_subject_code: 'A553',
          uneb_subject_title: 'BIOLOGY',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          uneb_study_level_id: advancedLevelObject[0].id,
          general_subject_category_id: scienceObject[0].id,
          uneb_subject_category_id: scienceGeneralObject[0].id,
          uneb_subject_code: 'A535',
          uneb_subject_title: 'PHYSICS',
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
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete(
      { schema: 'programme_mgt', tableName: 'uneb_subjects' },
      null,
      {}
    );
  },
};
