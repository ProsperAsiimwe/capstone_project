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
    WHERE users.other_names='SYSTEM ADMINISTRATOR' and users.surname ='SUPER' LIMIT 1;`
    );
    const systemAdminUserObject = systemAdminUser[0];

    // role_group
    const roleGroupAdmin = await queryInterface.sequelize.query(
      `SELECT id From user_mgt.user_role_groups
    WHERE role_group_title='SUPER ADMIN';`
    );
    const roleGroupAdminObject = roleGroupAdmin[0];

    // role_group
    const roleGroupAcademicRegistrar = await queryInterface.sequelize.query(
      `SELECT id From user_mgt.user_role_groups
    WHERE role_group_title='ACADEMIC REGISTRAR';`
    );
    const roleGroupAcademicRegistrarObject = roleGroupAcademicRegistrar[0];

    // security_profile
    const securityProfileAdmin = await queryInterface.sequelize.query(
      `SELECT id From user_mgt.security_profiles
    WHERE security_profile_name='SYSTEM ADMINISTRATOR';`
    );
    const securityProfileAdminObject = securityProfileAdmin[0];

    await queryInterface.bulkInsert(
      {
        schema: 'user_mgt',
        tableName: 'roles',
      },
      [
        {
          role_code: 'SUPER_ADMIN',
          role_title: 'SYSTEM ADMINISTRATOR ROLE',
          user_role_group_id: roleGroupAdminObject[0].id,
          security_profile_id: securityProfileAdminObject[0].id,
          role_description: 'SYSTEM ADMINISTRATOR ROLE',
          max_number_users: 20,
          is_active: true,
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          role_code: 'LECTURER',
          role_title: 'LECTURER',
          user_role_group_id: roleGroupAcademicRegistrarObject[0].id,
          security_profile_id: securityProfileAdminObject[0].id,
          role_description: 'LECTURER',
          max_number_users: 20,
          is_active: false,
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
      { schema: 'user_mgt', tableName: 'roles' },
      null,
      {}
    );
  },
};
