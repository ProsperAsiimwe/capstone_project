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
      `SELECT users.id
      From user_mgt.users as users
      INNER JOIN user_mgt.user_roles as roles 
      on roles.user_id =  users.id
      Inner join user_mgt.roles as r
      on roles.role_id = r.id
    WHERE r.role_code ='SUPER_ADMIN' and users.surname ='SUPER' LIMIT 1;`
    );

    const systemAdminUserObject = systemAdminUser[0];

    // paid when
    /**
     * fees payment intervals
     */
    const paidWhenIntervals = await queryInterface.sequelize.query(
      `SELECT id From app_mgt.metadata
    WHERE metadata_name ='TUITION PAYMENT INTERVALS';`
    );
    const paidWhenIntervalsObject = paidWhenIntervals[0];

    // paid when interval
    const functionalPaidWhenInterval = await queryInterface.sequelize.query(
      `SELECT id From app_mgt.metadata
    WHERE metadata_name ='FUNCTIONAL FEES PAYMENT INTERVALS';`
    );
    const functionalPaidWhenIntervalObject = functionalPaidWhenInterval[0];
    /**
     * tuition fees
     */

    await queryInterface.bulkInsert(
      { schema: 'app_mgt', tableName: 'metadata_values' },
      [
        {
          metadata_id: paidWhenIntervalsObject[0].id,
          metadata_value: 'EverySemester',
          metadata_value_description: 'EverySemester(FOR TUITION ONLY)',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: paidWhenIntervalsObject[0].id,
          metadata_value: 'SemesterI',
          metadata_value_description: 'SemesterI(FOR TUITION ONLY)',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: paidWhenIntervalsObject[0].id,
          metadata_value: 'SemesterII',
          metadata_value_description: 'SemesterII(FOR TUITION ONLY)',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: paidWhenIntervalsObject[0].id,
          metadata_value: 'SemesterIII',
          metadata_value_description: 'SemesterIII(FOR TUITION ONLY)',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: paidWhenIntervalsObject[0].id,
          metadata_value: 'TermI',
          metadata_value_description: 'TermI(FOR TUITION ONLY)',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: paidWhenIntervalsObject[0].id,
          metadata_value: 'TermII',
          metadata_value_description: 'TermII(FOR TUITION ONLY)',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: paidWhenIntervalsObject[0].id,
          metadata_value: 'TermIII',
          metadata_value_description: 'TermIII(FOR TUITION ONLY)',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: paidWhenIntervalsObject[0].id,
          metadata_value: 'EveryTerm',
          metadata_value_description: 'EveryTerm(FOR TUITION ONLY)',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );

    // functional fees
    await queryInterface.bulkInsert(
      { schema: 'app_mgt', tableName: 'metadata_values' },
      [
        {
          metadata_id: functionalPaidWhenIntervalObject[0].id,
          metadata_value: 'Fresher/SemesterI',
          metadata_value_description: 'Fresher/SemesterI(for functional fees)',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: functionalPaidWhenIntervalObject[0].id,
          metadata_value: 'Fresher/SemesterII',
          metadata_value_description: 'Fresher/SemesterII(for function fees)',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: functionalPaidWhenIntervalObject[0].id,
          metadata_value: 'Fresher/EverySemester',
          metadata_value_description: 'Fresher/EverySemester',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: functionalPaidWhenIntervalObject[0].id,
          metadata_value: 'EveryAcademicYear/SemesterII',
          metadata_value_description: 'EveryAcademicYear/SemesterII',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: functionalPaidWhenIntervalObject[0].id,
          metadata_value: 'EveryAcademicYear/SemesterI',
          metadata_value_description: 'EveryAcademicYear/SemesterI',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: functionalPaidWhenIntervalObject[0].id,
          metadata_value: 'EveryAcademicYear/EverySemester',
          metadata_value_description: 'EveryAcademicYear/EverySemester',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: functionalPaidWhenIntervalObject[0].id,
          metadata_value: 'FinalYear/EverySemester',
          metadata_value_description: 'FinalYear/EverySemester',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: functionalPaidWhenIntervalObject[0].id,
          metadata_value: 'FinalYear/SemesterI',
          metadata_value_description: 'FinalYear/SemesterI',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: functionalPaidWhenIntervalObject[0].id,
          metadata_value: 'FinalYear/SemesterII',
          metadata_value_description: 'FinalYear/SemesterII',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: functionalPaidWhenIntervalObject[0].id,
          metadata_value: 'ContinuingStudent/EverySemester',
          metadata_value_description: 'ContinuingStudents/EverySemester',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: functionalPaidWhenIntervalObject[0].id,
          metadata_value: 'ContinuingStudents/SemesterI',
          metadata_value_description: 'ContinuingStudents/SemesterI',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: functionalPaidWhenIntervalObject[0].id,
          metadata_value: 'ContinuingStudents/SemesterII',
          metadata_value_description: 'ContinuingStudents/SemesterII',
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
      { tableName: 'metadata_values', schema: 'app_mgt' },
      null,
      {}
    );
  },
};
