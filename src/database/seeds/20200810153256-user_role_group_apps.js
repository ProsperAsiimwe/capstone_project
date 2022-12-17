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

    // system application
    const userAccessApplication = await queryInterface.sequelize.query(
      `
      SELECT id
       From user_mgt.apps
	    WHERE app_name='ACCESS AND PRIVILEGES MANAGEMENT' and app_code='USER_MGT' LIMIT 1;
      `
    );
    const userAccessApplicationObject = userAccessApplication[0];

    // role group
    const userRoleGroup = await queryInterface.sequelize.query(
      `SELECT id
       From user_mgt.user_role_groups
    WHERE role_group_title='SUPER ADMIN' LIMIT 1;`
    );
    const userRoleGroupObject = userRoleGroup[0];

    // seed user role group apps
    await queryInterface.bulkInsert(
      { schema: 'user_mgt', tableName: 'user_role_group_apps' },
      [
        {
          user_role_group_id: userRoleGroupObject[0].id,
          app_id: userAccessApplicationObject[0].id,
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
      { schema: 'user_mgt', tableName: 'user_role_group_apps' },
      null,
      {}
    );
  },
};
