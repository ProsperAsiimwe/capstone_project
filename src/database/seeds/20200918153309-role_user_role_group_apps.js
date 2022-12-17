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
    // system super user
    const systemAdminUser = await queryInterface.sequelize.query(
      `SELECT users.id as id, users.surname as surname
       From user_mgt.users as users
    WHERE users.other_names='SYSTEM ADMINISTRATOR' and users.surname ='SUPER' LIMIT 1;`
    );
    const systemAdminUserObject = systemAdminUser[0];

    // role
    // roles
    const userRole = await queryInterface.sequelize.query(
      `SELECT id FROM user_mgt.roles
      where role_code='SUPER_ADMIN' and role_title='SYSTEM ADMINISTRATOR ROLE' LIMIT 1;`
    );
    const userRoleObject = userRole[0];
    // system application

    const userRoleGroupApp = await queryInterface.sequelize.query(
      `
      SELECT
      urga.app_id as app_id
       From user_mgt.user_role_group_apps as urga
       inner join user_mgt.user_role_groups as urg
       on urga. user_role_group_id= urg.id
	    WHERE role_group_title='SUPER ADMIN' and role_group_description='SUPER ADMIN' LIMIT 1;

      `
    );
    const userRoleGroupAppObject = userRoleGroupApp[0];

    // seed
    await queryInterface.bulkInsert(
      { schema: 'user_mgt', tableName: 'role_user_role_group_apps' },
      [
        {
          role_group_app_id: userRoleGroupAppObject[0].app_id,
          role_id: userRoleObject[0].id,
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
      { schema: 'user_mgt', tableName: 'role_user_role_group_apps' },
      null,
      {}
    );
  },
};
