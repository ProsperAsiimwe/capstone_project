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
    /**
     * seed schemes
     */

    await queryInterface.bulkInsert(
      { schema: 'admissions_mgt', tableName: 'admission_schemes' },
      [
        {
          scheme_name: 'DIRECT ENTRY SCHEME',
          scheme_description: 'DIRECT ENTRY SCHEME',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          scheme_name: 'MATURE AGE SCHEME',
          scheme_description: 'MATURE AGE SCHEME',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          scheme_name: 'MILITARY SCHEME',
          scheme_description: 'MILITARY SCHEME',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
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
      { schema: 'admissions_mgt', tableName: 'admission_schemes' },
      null,
      {}
    );
  },
};
