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
    const grading = await queryInterface.sequelize
      .query(`SELECT id From programme_mgt.gradings
    WHERE grading_code ='NCHE';`);

    const gradingObject = grading[0];

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

    await queryInterface.bulkInsert(
      { schema: 'programme_mgt', tableName: 'grading_values' },
      [
        {
          grading_id: gradingObject[0].id,
          max_value: 100,
          min_value: 90,
          grading_point: 5,
          grading_letter: 'A+',
          interpretation: 'EXCEPTIONAL',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          grading_id: gradingObject[0].id,
          max_value: 89,
          min_value: 80,
          grading_point: 5,
          grading_letter: 'A',
          interpretation: 'EXECELLENT',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          grading_id: gradingObject[0].id,
          max_value: 79,
          min_value: 75,
          grading_point: 4.5,
          grading_letter: 'B+',
          interpretation: 'VERY GOOD',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          grading_id: gradingObject[0].id,
          max_value: 74,
          min_value: 70,
          grading_point: 4,
          grading_letter: 'B',
          interpretation: 'GOOD',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          grading_id: gradingObject[0].id,
          max_value: 69,
          min_value: 65,
          grading_point: 3.5,
          grading_letter: 'C+',
          interpretation: 'FAIRLY GOOD',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          grading_id: gradingObject[0].id,
          max_value: 64,
          min_value: 60,
          grading_point: 3,
          grading_letter: 'C',
          interpretation: 'FAIR',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          grading_id: gradingObject[0].id,
          max_value: 59,
          min_value: 55,
          grading_point: 2.5,
          grading_letter: 'D+',
          interpretation: 'PASS',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          grading_id: gradingObject[0].id,
          max_value: 54,
          min_value: 50,
          grading_point: 2,
          grading_letter: 'D',
          interpretation: 'MARGINAL PASS',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          grading_id: gradingObject[0].id,
          max_value: 49,
          min_value: 45,
          grading_point: 1.5,
          grading_letter: 'E',
          interpretation: 'MARGINAL FAIL',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          grading_id: gradingObject[0].id,
          max_value: 45,
          min_value: 40,
          grading_point: 1,
          grading_letter: 'E-',
          interpretation: 'CLEAR FAIL',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          grading_id: gradingObject[0].id,
          max_value: 40,
          min_value: 0,
          grading_point: 0,
          grading_letter: 'F',
          interpretation: 'BAD FAIL',
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
      { schema: 'programme_mgt', tableName: 'grading_values' },
      null,
      {}
    );
  },
};
