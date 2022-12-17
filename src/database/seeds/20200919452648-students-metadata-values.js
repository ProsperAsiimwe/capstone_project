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
     * halls of residence
     */
    const studentHalls = await queryInterface.sequelize.query(
      `SELECT id From app_mgt.metadata
    WHERE metadata_name ='HALLS';`
    );
    const studentHallsObject = studentHalls[0];

    // Sponsorship
    const studentSponsorship = await queryInterface.sequelize.query(
      `SELECT id From app_mgt.metadata
    WHERE metadata_name ='SPONSORSHIPS';`
    );
    const studentSponsorshipObject = studentSponsorship[0];

    // resident status
    const residenceStatus = await queryInterface.sequelize.query(
      `SELECT id From app_mgt.metadata
    WHERE metadata_name ='RESIDENCE STATUSES';`
    );
    const residenceStatusObject = residenceStatus[0];
    // STUDENT ACADEMIC STATUSES
    const studentAcademicStatus = await queryInterface.sequelize.query(
      `SELECT id From app_mgt.metadata
    WHERE metadata_name ='STUDENT ACADEMIC STATUSES';`
    );
    const studentAcademicStatusObject = studentAcademicStatus[0];

    // STUDENT ACCOUNT STATUSES
    const studentAccountStatus = await queryInterface.sequelize.query(
      `SELECT id From app_mgt.metadata
    WHERE metadata_name ='STUDENT ACCOUNT STATUSES';`
    );
    const studentAccountStatusObject = studentAccountStatus[0];
    // SURCHARGE TYPES
    const surchargeTypes = await queryInterface.sequelize.query(
      `SELECT id From app_mgt.metadata
    WHERE metadata_name ='SURCHARGE TYPES';`
    );
    const surchargeTypesObject = surchargeTypes[0];

    // BANKS
    const banks = await queryInterface.sequelize.query(
      `SELECT id From app_mgt.metadata
    WHERE metadata_name ='BANKS';`
    );
    const banksObject = banks[0];

    // PAYMENT MODES
    const paymentModes = await queryInterface.sequelize.query(
      `SELECT id From app_mgt.metadata
    WHERE metadata_name ='PAYMENT MODES';`
    );
    const paymentModesObject = paymentModes[0];
    // functional fees

    await queryInterface.bulkInsert(
      { schema: 'app_mgt', tableName: 'metadata_values' },
      [
        {
          metadata_id: studentHallsObject[0].id,
          metadata_value: 'LUMUMBA HALL',
          metadata_value_description: 'LUMUMBA HALL',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: studentHallsObject[0].id,
          metadata_value: 'UNIVERSITY HALL',
          metadata_value_description: 'UNIVERSITY HALL',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: studentHallsObject[0].id,
          metadata_value: 'LIVINGSTONE HALL',
          metadata_value_description: 'LIVINGSTONE HALL',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: studentHallsObject[0].id,
          metadata_value: 'NSIBIRWA HALL',
          metadata_value_description: 'NSIBIRWA HALL',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: studentHallsObject[0].id,
          metadata_value: 'MITCHELL HALL',
          metadata_value_description: 'MITCHELL HALL',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: studentHallsObject[0].id,
          metadata_value: 'COMPLEX HALL',
          metadata_value_description: 'COMPLEX HALL',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: studentHallsObject[0].id,
          metadata_value: 'AFRICA HALL',
          metadata_value_description: 'AFRICA HALL',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: studentHallsObject[0].id,
          metadata_value: 'NKRUMAH HALL',
          metadata_value_description: 'NKRUMAH HALL',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: studentHallsObject[0].id,
          metadata_value: 'MARYSTUART HALL',
          metadata_value_description: 'MARYSTUART HALL',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: studentHallsObject[0].id,
          metadata_value: 'JINJA HALL',
          metadata_value_description: 'JINJA HALL',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
    // sponsorship
    await queryInterface.bulkInsert(
      { schema: 'app_mgt', tableName: 'metadata_values' },
      [
        {
          metadata_id: studentSponsorshipObject[0].id,
          metadata_value: 'PRIVATE',
          metadata_value_description: 'PRIVATE',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: studentSponsorshipObject[0].id,
          metadata_value: 'GOVERNMENT',
          metadata_value_description: 'GOVERNMENT',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
    // RESIDENCE STATUS RESIDENCE STATUSES
    await queryInterface.bulkInsert(
      { schema: 'app_mgt', tableName: 'metadata_values' },
      [
        {
          metadata_id: residenceStatusObject[0].id,
          metadata_value: 'NON-RESIDENT',
          metadata_value_description: 'NON-RESIDENT',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: residenceStatusObject[0].id,
          metadata_value: 'RESIDENT',
          metadata_value_description: 'RESIDENT',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );

    // STUDENT ACADEMIC STATUSES
    await queryInterface.bulkInsert(
      { schema: 'app_mgt', tableName: 'metadata_values' },
      [
        {
          metadata_id: studentAcademicStatusObject[0].id,
          metadata_value: 'NORMAL PROGRESS',
          metadata_value_description: 'NORMAL PROGRESS',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: studentAcademicStatusObject[0].id,
          metadata_value: 'PROBATIONARY PROGRESS',
          metadata_value_description: 'PROBATIONARY PROGRESS',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: studentAcademicStatusObject[0].id,
          metadata_value: 'STAY PUT',
          metadata_value_description: 'STAY PUT',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: studentAcademicStatusObject[0].id,
          metadata_value: 'COMPLETED-GRADUAND',
          metadata_value_description: 'COMPLETED-GRADUAND',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: studentAcademicStatusObject[0].id,
          metadata_value: 'COMPLETED-GRADUATE',
          metadata_value_description: 'COMPLETED-GRADUATE',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: studentAcademicStatusObject[0].id,
          metadata_value: 'ACADEMIC SUSPENSION',
          metadata_value_description: 'ACADEMIC SUSPENSION',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: studentAcademicStatusObject[0].id,
          metadata_value: 'DISCIPLINARY SUSPENSION',
          metadata_value_description: 'DISCIPLINARY SUSPENSION',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: studentAcademicStatusObject[0].id,
          metadata_value: 'ADMINISTRATIVE SUSPENSION',
          metadata_value_description: 'ADMINISTRATIVE SUSPENSION',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: studentAcademicStatusObject[0].id,
          metadata_value: 'DISCONTINUED FROM PROGRAMME',
          metadata_value_description: 'DISCONTINUED FROM PROGRAMME',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: studentAcademicStatusObject[0].id,
          metadata_value: 'DISCONTINUED FROM INSTITUTION',
          metadata_value_description: 'DISCONTINUED FROM INSTITUTION',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: studentAcademicStatusObject[0].id,
          metadata_value: 'DEAD YEAR',
          metadata_value_description: 'DEAD YEAR',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: studentAcademicStatusObject[0].id,
          metadata_value: 'DEAD SEMESTER',
          metadata_value_description: 'DEAD SEMESTER',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );

    // STUDENT ACCOUNT STATUSES
    await queryInterface.bulkInsert(
      { schema: 'app_mgt', tableName: 'metadata_values' },
      [
        {
          metadata_id: studentAccountStatusObject[0].id,
          metadata_value: 'ACTIVE',
          metadata_value_description: 'ACTIVE',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: studentAccountStatusObject[0].id,
          metadata_value: 'INACTIVE',
          metadata_value_description: 'INACTIVE',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: studentAccountStatusObject[0].id,
          metadata_value: 'BLOCKED',
          metadata_value_description: 'BLOCKED',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );

    // Surcharge types
    await queryInterface.bulkInsert(
      { schema: 'app_mgt', tableName: 'metadata_values' },
      [
        {
          metadata_id: surchargeTypesObject[0].id,
          metadata_value: 'LATE REGISTRATION',
          metadata_value_description: 'LATE REGISTRATION',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: surchargeTypesObject[0].id,
          metadata_value: 'LATE ENROLLMENT',
          metadata_value_description: 'LATE ENROLLMENT',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );

    // Banks
    await queryInterface.bulkInsert(
      { schema: 'app_mgt', tableName: 'metadata_values' },
      [
        {
          metadata_id: banksObject[0].id,
          metadata_value: 'CENTENARY BANK',
          metadata_value_description: 'CENTENARY BANK',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: banksObject[0].id,
          metadata_value: 'DFCU BANK',
          metadata_value_description: 'DFCU BANK',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: banksObject[0].id,
          metadata_value: 'BANK OF AFRICA',
          metadata_value_description: 'BANK OF AFRICA(BOA)',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: banksObject[0].id,
          metadata_value: 'STANBIC BANK',
          metadata_value_description: 'STANBIC BANK',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: banksObject[0].id,
          metadata_value: 'ABSA BANK',
          metadata_value_description: 'ABSA BANK',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: banksObject[0].id,
          metadata_value: 'BANK OF INDIA',
          metadata_value_description: 'BANK OF INDIA',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );

    // payment modes
    await queryInterface.bulkInsert(
      { schema: 'app_mgt', tableName: 'metadata_values' },
      [
        {
          metadata_id: paymentModesObject[0].id,
          metadata_value: 'CASH',
          metadata_value_description: 'CASH',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: paymentModesObject[0].id,
          metadata_value: 'DIRECT DEBIT',
          metadata_value_description: 'DIRECT DEBIT',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: paymentModesObject[0].id,
          metadata_value: 'EFT',
          metadata_value_description: 'EFT',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: paymentModesObject[0].id,
          metadata_value: 'CHEQUE',
          metadata_value_description: 'CHEQUE',
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
