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
    // system administrator
    const systemAdminUser = await queryInterface.sequelize.query(
      `SELECT users.id as id, users.surname as surname
       From user_mgt.users as users
    WHERE users.other_names='SYSTEM ADMINISTRATOR' and users.surname ='SUPER'  LIMIT 1;`
    );
    const systemAdminUserObject = systemAdminUser[0];

    // user role group
    const superAdminRoleGroup = await queryInterface.sequelize.query(
      `select id
      from user_mgt.user_role_groups
      where role_group_title = 'SUPER ADMIN' and role_group_description = 'SUPER ADMIN' lIMIT 1;`
    );
    const superAdminRoleGroupObject = superAdminRoleGroup[0];
    // GROUP ADMIN

    await queryInterface.bulkInsert(
      { schema: 'user_mgt', tableName: 'role_group_admin' },
      [
        {
          user_id: systemAdminUserObject[0].id,
          user_role_group_id: superAdminRoleGroupObject[0].id,
          admin_type: 'MAIN ADMIN',
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
      { schema: 'user_mgt', tableName: 'role_group_admin' },
      null,
      {}
    );
  },
};
