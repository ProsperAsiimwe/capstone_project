'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronously.

      Example:
      return queryInterface.bulkInsert('People', [{
        name: 'John Doe',
        isBetaMember: false
      }], {});
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

    // fees category
    const feesCategories = await queryInterface.sequelize.query(
      `SELECT id From app_mgt.metadata
    WHERE metadata_name ='FEES CATEGORIES';`
    );
    const feesCategoriesObject = feesCategories[0];
    // Billing category
    const billingCategories = await queryInterface.sequelize.query(
      `SELECT id From app_mgt.metadata
    WHERE metadata_name ='BILLING CATEGORIES';`
    );
    const billingCategoriesObject = billingCategories[0];

    // ACADEMIC YEARS
    const academicYears = await queryInterface.sequelize.query(
      `SELECT id From app_mgt.metadata
    WHERE metadata_name ='ACADEMIC YEARS';`
    );
    const academicYearsObject = academicYears[0];

    // KEY EVENTS

    const keyEvents = await queryInterface.sequelize.query(
      `SELECT id From app_mgt.metadata
    WHERE metadata_name ='KEY EVENTS';`
    );
    const keyEventsObject = keyEvents[0];

    // OTHER EVENTS
    const otherEvents = await queryInterface.sequelize.query(
      `SELECT id From app_mgt.metadata
    WHERE metadata_name ='OTHER EVENTS';`
    );
    const otherEventsObject = otherEvents[0];

    // CURRENCY
    // OTHER EVENTS
    const currencies = await queryInterface.sequelize.query(
      `SELECT id From app_mgt.metadata
    WHERE metadata_name ='CURRENCIES';`
    );
    const currenciesObject = currencies[0];

    //  fees category
    await queryInterface.bulkInsert(
      { schema: 'app_mgt', tableName: 'metadata_values' },
      [
        {
          metadata_id: feesCategoriesObject[0].id,
          metadata_value: 'TUITION FEES',
          metadata_value_description: 'TUITION FEES',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: feesCategoriesObject[0].id,
          metadata_value: 'FUNCTIONAL FEES',
          metadata_value_description: 'FUNCTION FEES',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: feesCategoriesObject[0].id,
          metadata_value: 'OTHER FEES',
          metadata_value_description: 'OTHER FEES',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: billingCategoriesObject[0].id,
          metadata_value: 'UGANDAN',
          metadata_value_description: 'UGANDA',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: billingCategoriesObject[0].id,
          metadata_value: 'EAST-AFRICAN',
          metadata_value_description: 'EAST-AFRICAN',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: billingCategoriesObject[0].id,
          metadata_value: 'NON EAST-AFRICAN',
          metadata_value_description: 'NON EAST-AFRICAN',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );

    // ACADEMIC YEARS
    await queryInterface.bulkInsert(
      { schema: 'app_mgt', tableName: 'metadata_values' },
      [
        {
          metadata_id: academicYearsObject[0].id,
          metadata_value: '2020/2021',
          metadata_value_description: '2020/2021',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: academicYearsObject[0].id,
          metadata_value: '2019/2020',
          metadata_value_description: '2019/2020',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: academicYearsObject[0].id,
          metadata_value: '2021/2022',
          metadata_value_description: '2021/2022',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: academicYearsObject[0].id,
          metadata_value: '2018/2019',
          metadata_value_description: '2018/2019',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );

    //
    // KEY EVENT
    await queryInterface.bulkInsert(
      { schema: 'app_mgt', tableName: 'metadata_values' },
      [
        {
          metadata_id: keyEventsObject[0].id,
          metadata_value: 'ADMISSION',
          metadata_value_description: 'ADMISSION',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: keyEventsObject[0].id,
          metadata_value: 'ENROLLMENT',
          metadata_value_description: 'ENROLLMENT',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: keyEventsObject[0].id,
          metadata_value: 'REGISTRATION',
          metadata_value_description: 'REGISTRATION',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: otherEventsObject[0].id,
          metadata_value: 'GRADUATION',
          metadata_value_description: 'GRADUATION',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: otherEventsObject[0].id,
          metadata_value: 'SPORTS EVENTS',
          metadata_value_description: 'SPORTS EVENTS',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );

    // currency
    // KEY EVENT
    await queryInterface.bulkInsert(
      { schema: 'app_mgt', tableName: 'metadata_values' },
      [
        {
          metadata_id: currenciesObject[0].id,
          metadata_value: 'UGX',
          metadata_value_description: 'UGANDAN SHILLINGS',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: currenciesObject[0].id,
          metadata_value: 'USD',
          metadata_value_description: 'US DOLLARS',
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
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronously.

      Example:
      return queryInterface.bulkDelete('People', null, {});
    */
    await queryInterface.bulkDelete(
      { tableName: 'metadata_values', schema: 'app_mgt' },
      null,
      {}
    );
  },
};
