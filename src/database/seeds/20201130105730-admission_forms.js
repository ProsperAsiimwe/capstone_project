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
     * seed forms
     */

    await queryInterface.bulkInsert(
      { schema: 'admissions_mgt', tableName: 'admission_forms' },
      [
        {
          form_name: 'UNDERGRADUATE FORM',
          form_description: 'UNDERGRADUATE FORM',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          form_name: 'POSTGRADUATE FORM',
          form_description: 'POSTGRADUATE FORM',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          form_name: 'MILITARY SCHEME FORM',
          form_description: 'MILITARY SCHEME FORM',
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
      { schema: 'admissions_mgt', tableName: 'admission_forms' },
      null,
      {}
    );
  },
};
