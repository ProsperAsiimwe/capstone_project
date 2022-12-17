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

    const superAdminUser = await queryInterface.sequelize.query(
      `SELECT users.id as id, users.surname as surname
       From user_mgt.users as users
    WHERE users.other_names='SYSTEM ADMINISTRATOR' and users.surname ='SUPER'  LIMIT 1;`
    );
    const superAdminUserObject = superAdminUser[0];

    // add app
    const superUserRoleApp = await queryInterface.sequelize.query(`
    select rurga.id,rurga.role_group_app_id
from user_mgt.role_user_role_group_apps as rurga
inner join user_mgt.roles as r
on r.id = rurga.role_id
where r.role_title = 'SYSTEM ADMINISTRATOR ROLE' and r.role_code='SUPER_ADMIN' LIMIT 1;
    `);
    const superUserRoleAppObject = superUserRoleApp[0];
    // app function
    const roleFunctions = await queryInterface.sequelize.query(`
    select af.id 
from user_mgt.app_functions as af
inner join user_mgt.apps as a
on a.id = af.app_id 
inner join user_mgt.role_user_role_group_apps as rurga
on rurga.role_group_app_id = a.id
inner join user_mgt.roles as r
on r.id = rurga.role_id
where r.role_title = 'SYSTEM ADMINISTRATOR ROLE' and r.role_code='SUPER_ADMIN'

    `);
    const roleFunctionsObject = roleFunctions[0];

    await queryInterface.bulkInsert(
      {
        schema: 'user_mgt',
        tableName: 'role_app_functions',
      },
      [
        {
          app_function_id: roleFunctionsObject[0].id,
          role_user_role_group_app_id: superUserRoleAppObject[0].id,
          created_by_id: superAdminUserObject[0].id,
          create_approved_by_id: superAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_function_id: roleFunctionsObject[1].id,
          role_user_role_group_app_id: superUserRoleAppObject[0].id,
          created_by_id: superAdminUserObject[0].id,
          create_approved_by_id: superAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_function_id: roleFunctionsObject[2].id,
          role_user_role_group_app_id: superUserRoleAppObject[0].id,
          created_by_id: superAdminUserObject[0].id,
          create_approved_by_id: superAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_function_id: roleFunctionsObject[3].id,
          role_user_role_group_app_id: superUserRoleAppObject[0].id,
          created_by_id: superAdminUserObject[0].id,
          create_approved_by_id: superAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_function_id: roleFunctionsObject[4].id,
          role_user_role_group_app_id: superUserRoleAppObject[0].id,
          created_by_id: superAdminUserObject[0].id,
          create_approved_by_id: superAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_function_id: roleFunctionsObject[5].id,
          role_user_role_group_app_id: superUserRoleAppObject[0].id,
          created_by_id: superAdminUserObject[0].id,
          create_approved_by_id: superAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_function_id: roleFunctionsObject[6].id,
          role_user_role_group_app_id: superUserRoleAppObject[0].id,
          created_by_id: superAdminUserObject[0].id,
          create_approved_by_id: superAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_function_id: roleFunctionsObject[7].id,
          role_user_role_group_app_id: superUserRoleAppObject[0].id,
          created_by_id: superAdminUserObject[0].id,
          create_approved_by_id: superAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_function_id: roleFunctionsObject[8].id,
          role_user_role_group_app_id: superUserRoleAppObject[0].id,
          created_by_id: superAdminUserObject[0].id,
          create_approved_by_id: superAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_function_id: roleFunctionsObject[9].id,
          role_user_role_group_app_id: superUserRoleAppObject[0].id,
          created_by_id: superAdminUserObject[0].id,
          create_approved_by_id: superAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_function_id: roleFunctionsObject[10].id,
          role_user_role_group_app_id: superUserRoleAppObject[0].id,
          created_by_id: superAdminUserObject[0].id,
          create_approved_by_id: superAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_function_id: roleFunctionsObject[11].id,
          role_user_role_group_app_id: superUserRoleAppObject[0].id,
          created_by_id: superAdminUserObject[0].id,
          create_approved_by_id: superAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_function_id: roleFunctionsObject[12].id,
          role_user_role_group_app_id: superUserRoleAppObject[0].id,
          created_by_id: superAdminUserObject[0].id,
          create_approved_by_id: superAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_function_id: roleFunctionsObject[13].id,
          role_user_role_group_app_id: superUserRoleAppObject[0].id,
          created_by_id: superAdminUserObject[0].id,
          create_approved_by_id: superAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_function_id: roleFunctionsObject[14].id,
          role_user_role_group_app_id: superUserRoleAppObject[0].id,
          created_by_id: superAdminUserObject[0].id,
          create_approved_by_id: superAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_function_id: roleFunctionsObject[15].id,
          role_user_role_group_app_id: superUserRoleAppObject[0].id,
          created_by_id: superAdminUserObject[0].id,
          create_approved_by_id: superAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_function_id: roleFunctionsObject[16].id,
          role_user_role_group_app_id: superUserRoleAppObject[0].id,
          created_by_id: superAdminUserObject[0].id,
          create_approved_by_id: superAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_function_id: roleFunctionsObject[17].id,
          role_user_role_group_app_id: superUserRoleAppObject[0].id,
          created_by_id: superAdminUserObject[0].id,
          create_approved_by_id: superAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_function_id: roleFunctionsObject[18].id,
          role_user_role_group_app_id: superUserRoleAppObject[0].id,
          created_by_id: superAdminUserObject[0].id,
          create_approved_by_id: superAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_function_id: roleFunctionsObject[19].id,
          role_user_role_group_app_id: superUserRoleAppObject[0].id,
          created_by_id: superAdminUserObject[0].id,
          create_approved_by_id: superAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_function_id: roleFunctionsObject[20].id,
          role_user_role_group_app_id: superUserRoleAppObject[0].id,
          created_by_id: superAdminUserObject[0].id,
          create_approved_by_id: superAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_function_id: roleFunctionsObject[21].id,
          role_user_role_group_app_id: superUserRoleAppObject[0].id,
          created_by_id: superAdminUserObject[0].id,
          create_approved_by_id: superAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_function_id: roleFunctionsObject[22].id,
          role_user_role_group_app_id: superUserRoleAppObject[0].id,
          created_by_id: superAdminUserObject[0].id,
          create_approved_by_id: superAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_function_id: roleFunctionsObject[23].id,
          role_user_role_group_app_id: superUserRoleAppObject[0].id,
          created_by_id: superAdminUserObject[0].id,
          create_approved_by_id: superAdminUserObject[0].id,
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
      { schema: 'user_mgt', tableName: 'role_app_functions' },
      null,
      {}
    );
  },
};
