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
    const systemAdminUser = await queryInterface.sequelize.query(
      `SELECT users.id as id, users.surname as surname
       From user_mgt.users as users
    WHERE users.other_names='SYSTEM ADMINISTRATOR' and users.surname ='SUPER'  LIMIT 1;`
    );
    const systemAdminUserObject = systemAdminUser[0];

    // roles
    const superUserRole = await queryInterface.sequelize.query(
      `SELECT id FROM user_mgt.roles
      where role_code='SUPER_ADMIN' and role_title='SYSTEM ADMINISTRATOR ROLE' LIMIT 1;`
    );
    const superUserRoleObject = superUserRole[0];
    // seed user roles

    await queryInterface.bulkInsert(
      { schema: 'user_mgt', tableName: 'user_roles' },
      [
        {
          user_id: systemAdminUserObject[0].id,
          role_id: superUserRoleObject[0].id,
          is_main_role: true,
          role_accepted: true,
          role_accepted_at: new Date(),
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
      { schema: 'user_mgt', tableName: 'user_roles' },
      null,
      {}
    );
  },
};
