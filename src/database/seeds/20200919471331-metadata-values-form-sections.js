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

    // admission sections
    /**
     * admission sections
     */
    const admissionFormSections = await queryInterface.sequelize.query(
      `SELECT id From app_mgt.metadata
    WHERE metadata_name ='ADMISSION FORM SECTIONS';`
    );
    const admissionFormSectionsObject = admissionFormSections[0];

    // payment methods
    const paymentMethods = await queryInterface.sequelize.query(
      `SELECT id From app_mgt.metadata
    WHERE metadata_name ='PAYMENT METHODS';`
    );
    const paymentMethodsObject = paymentMethods[0];
    // ENROLLMENT STATUSES
    const enrollmentStatuses = await queryInterface.sequelize.query(
      `SELECT id From app_mgt.metadata
    WHERE metadata_name ='ENROLLMENT STATUSES';`
    );
    const enrollmentStatusesObject = enrollmentStatuses[0];

    // REGISTRATION TYPES
    const registrationType = await queryInterface.sequelize.query(
      `SELECT id From app_mgt.metadata
    WHERE metadata_name ='REGISTRATION TYPES';`
    );
    const registrationTypeObject = registrationType[0];

    // REGISTRATION STATUSES
    const registrationStatuses = await queryInterface.sequelize.query(
      `SELECT id From app_mgt.metadata
    WHERE metadata_name ='REGISTRATION STATUSES';`
    );
    const registrationStatusesObject = registrationStatuses[0];

    // INVOICE TYPES
    const invoiceTypes = await queryInterface.sequelize.query(
      `SELECT id From app_mgt.metadata
    WHERE metadata_name ='INVOICE TYPES';`
    );
    const invoiceTypesObject = invoiceTypes[0];

    //  INVOICE STATUSES
    const invoiceStatuses = await queryInterface.sequelize.query(
      `SELECT id From app_mgt.metadata
    WHERE metadata_name ='INVOICE STATUSES';`
    );
    const invoiceStatusesObject = invoiceStatuses[0];
    // PROVISIONAL REGISTRATION TYPES
    const provisionalRegistration = await queryInterface.sequelize.query(
      `SELECT id From app_mgt.metadata
    WHERE metadata_name ='PROVISIONAL REGISTRATION TYPES';`
    );
    const provisionalRegistrationObject = provisionalRegistration[0];
    // PROGRAMME MODULES
    const programmeModules = await queryInterface.sequelize.query(
      `SELECT id From app_mgt.metadata
    WHERE metadata_name ='PROGRAMME MODULES';`
    );
    const programmeModulesObject = programmeModules[0];

    //  MODULE OPTIONS
    const moduleOptions = await queryInterface.sequelize.query(
      `SELECT id From app_mgt.metadata
    WHERE metadata_name ='MODULE OPTIONS';`
    );
    const moduleOptionsObject = moduleOptions[0];

    // ROOM TAGS
    const roomTags = await queryInterface.sequelize.query(
      `SELECT id From app_mgt.metadata
    WHERE metadata_name ='ROOM TAGS';`
    );
    const roomTagsObject = roomTags[0];

    // MARITAL STATUSES

    const martialStatuses = await queryInterface.sequelize.query(
      `SELECT id From app_mgt.metadata
    WHERE metadata_name ='MARITAL STATUSES';`
    );
    const martialStatusesObject = martialStatuses[0];

    // CHART OF ACCOUNT STATUSES

    const chartAccountStatuses = await queryInterface.sequelize.query(
      `SELECT id From app_mgt.metadata
    WHERE metadata_name ='CHART OF ACCOUNT STATUSES';`
    );
    const chartAccountStatusesObject = chartAccountStatuses[0];

    // CHART OF ACCOUNT TYPES

    const chartAccountTypes = await queryInterface.sequelize.query(
      `SELECT id From app_mgt.metadata
    WHERE metadata_name ='CHART OF ACCOUNT TYPES';`
    );
    const chartAccountTypesObject = chartAccountTypes[0];

    // CHART OF ACCOUNT TAXES
    const chartAccountTaxes = await queryInterface.sequelize.query(
      `SELECT id From app_mgt.metadata
    WHERE metadata_name ='CHART OF ACCOUNT TAXES';`
    );
    const chartAccountTaxesObject = chartAccountTaxes[0];

    // RESULT REMARKS

    const resultRemarks = await queryInterface.sequelize.query(
      `SELECT id From app_mgt.metadata
    WHERE metadata_name ='RESULT REMARKS';`
    );
    const resultRemarksObject = resultRemarks[0];

    await queryInterface.bulkInsert(
      { schema: 'app_mgt', tableName: 'metadata_values' },
      [
        {
          metadata_id: admissionFormSectionsObject[0].id,
          metadata_value: 'BIO INFORMATION',
          metadata_value_description: 'BIO INFORMATION',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: admissionFormSectionsObject[0].id,
          metadata_value: 'PERMANENT ADDRESS',
          metadata_value_description: 'PERMANENT ADDRESS',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: admissionFormSectionsObject[0].id,
          metadata_value: 'NEXT OF KIN',
          metadata_value_description: 'NEXT OF KIN',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: admissionFormSectionsObject[0].id,
          metadata_value: 'O LEVEL INFORMATION',
          metadata_value_description: 'O LEVEL INFORMATION',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: admissionFormSectionsObject[0].id,
          metadata_value: 'A LEVEL INFORMATION',
          metadata_value_description: 'A LEVEL INFORMATION',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: admissionFormSectionsObject[0].id,
          metadata_value: 'OTHER QUALIFICATIONS',
          metadata_value_description: 'OTHER QUALIFICATIONS',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: admissionFormSectionsObject[0].id,
          metadata_value: 'ATTACHMENTS',
          metadata_value_description: 'ATTACHMENTS',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: admissionFormSectionsObject[0].id,
          metadata_value: 'PROGRAMME CHOICES',
          metadata_value_description: 'PROGRAMME CHOICES',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: admissionFormSectionsObject[0].id,
          metadata_value: 'REFEREE DETAILS',
          metadata_value_description: 'REFEREE DETAILS',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: admissionFormSectionsObject[0].id,
          metadata_value: 'EMPLOYMENT RECORDS',
          metadata_value_description: 'EMPLOYMENT RECORDS',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: paymentMethodsObject[0].id,
          metadata_value: 'BANK PAYMENTS',
          metadata_value_description: 'BANK PAYMENTS',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: paymentMethodsObject[0].id,
          metadata_value: 'MOBILE MONEY PAYMENTS',
          metadata_value_description: 'MOBILE MONEY PAYMENTS',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
    // enrollment
    await queryInterface.bulkInsert(
      { schema: 'app_mgt', tableName: 'metadata_values' },
      [
        {
          metadata_id: enrollmentStatusesObject[0].id,
          metadata_value: 'FRESHER',
          metadata_value_description: 'FRESHER',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: enrollmentStatusesObject[0].id,
          metadata_value: 'CONTINUING STUDENT',
          metadata_value_description: 'CONTINUING STUDENT',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: enrollmentStatusesObject[0].id,
          metadata_value: 'FINALIST',
          metadata_value_description: 'FINALIST',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: enrollmentStatusesObject[0].id,
          metadata_value: 'DOING RETAKES AFTER FINAL YEAR',
          metadata_value_description: 'DOING RETAKES AFTER FINAL YEAR',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: enrollmentStatusesObject[0].id,
          metadata_value: 'STAY PUT',
          metadata_value_description: 'STAY PUT',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: enrollmentStatusesObject[0].id,
          metadata_value: 'EXTENSION(FOR POSTGRADUATES ONLY)',
          metadata_value_description: 'EXTENSION(FOR POSTGRADUATES ONLY)',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: enrollmentStatusesObject[0].id,
          metadata_value: 'AMNESTY',
          metadata_value_description: 'AMNESTY',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
    // registration types
    await queryInterface.bulkInsert(
      { schema: 'app_mgt', tableName: 'metadata_values' },
      [
        {
          metadata_id: registrationTypeObject[0].id,
          metadata_value: 'FULL REGISTRATION',
          metadata_value_description: 'FULL REGISTRATION',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: registrationTypeObject[0].id,
          metadata_value: 'PROVISIONAL REGISTRATION',
          metadata_value_description: 'PROVISIONAL REGISTRATION',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
    // registrationStatusesObject
    await queryInterface.bulkInsert(
      { schema: 'app_mgt', tableName: 'metadata_values' },
      [
        {
          metadata_id: registrationStatusesObject[0].id,
          metadata_value: 'NORMAL PAPER',
          metadata_value_description: 'NORMAL PAPER',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: registrationStatusesObject[0].id,
          metadata_value: 'RETAKE PAPER',
          metadata_value_description: 'RETAKE PAPER',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: registrationStatusesObject[0].id,
          metadata_value: 'MISSING PAPER',
          metadata_value_description: 'MISSING PAPER',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: registrationStatusesObject[0].id,
          metadata_value: 'SUPPLEMENTARY PAPER',
          metadata_value_description: 'SUPPLEMENTARY PAPER',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );

    // INVOICE TYPES
    await queryInterface.bulkInsert(
      { schema: 'app_mgt', tableName: 'metadata_values' },
      [
        {
          metadata_id: invoiceTypesObject[0].id,
          metadata_value: 'MANDATORY',
          metadata_value_description: 'MANDATORY',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: invoiceTypesObject[0].id,
          metadata_value: 'OPTIONAL',
          metadata_value_description: 'OPTIONAL',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
    // INVOICE STATUSES
    await queryInterface.bulkInsert(
      { schema: 'app_mgt', tableName: 'metadata_values' },
      [
        {
          metadata_id: invoiceStatusesObject[0].id,
          metadata_value: 'VOIDED',
          metadata_value_description: 'VOIDED',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: invoiceStatusesObject[0].id,
          metadata_value: 'EXEMPTED',
          metadata_value_description: 'EXEMPTED',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: invoiceStatusesObject[0].id,
          metadata_value: 'ACTIVE',
          metadata_value_description: 'ACTIVE',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: invoiceStatusesObject[0].id,
          metadata_value: 'RECEIPTED',
          metadata_value_description: 'RECEIPTED',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );

    // provisional registration
    await queryInterface.bulkInsert(
      { schema: 'app_mgt', tableName: 'metadata_values' },
      [
        {
          metadata_id: provisionalRegistrationObject[0].id,
          metadata_value: 'ACADEMIC ISSUES',
          metadata_value_description: 'ACADEMIC ISSUES',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: provisionalRegistrationObject[0].id,
          metadata_value: 'FINANCIAL ISSUES',
          metadata_value_description: 'FINANCIAL ISSUES',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
    // PROGRAMME MODULES
    await queryInterface.bulkInsert(
      { schema: 'app_mgt', tableName: 'metadata_values' },
      [
        {
          metadata_id: programmeModulesObject[0].id,
          metadata_value: 'MODULE 1',
          metadata_value_description: 'MODULE 1',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: programmeModulesObject[0].id,
          metadata_value: 'MODULE 2',
          metadata_value_description: 'MODULE 2',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: programmeModulesObject[0].id,
          metadata_value: 'MODULE 3',
          metadata_value_description: 'MODULE 3',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );

    // moduleOptionsObject
    await queryInterface.bulkInsert(
      { schema: 'app_mgt', tableName: 'metadata_values' },
      [
        {
          metadata_id: moduleOptionsObject[0].id,
          metadata_value: 'OPTION A',
          metadata_value_description: 'OPTION A',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: moduleOptionsObject[0].id,
          metadata_value: 'OPTION B',
          metadata_value_description: 'OPTION B',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: moduleOptionsObject[0].id,
          metadata_value: 'OPTION C',
          metadata_value_description: 'OPTION C',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );

    // roomTagsObject

    await queryInterface.bulkInsert(
      { schema: 'app_mgt', tableName: 'metadata_values' },
      [
        {
          metadata_id: roomTagsObject[0].id,
          metadata_value: 'LAB',
          metadata_value_description: 'LAB',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: roomTagsObject[0].id,
          metadata_value: 'OFFICE',
          metadata_value_description: 'OFFICE',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: roomTagsObject[0].id,
          metadata_value: 'LECTURE ROOM',
          metadata_value_description: 'LECTURE ROOM',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );

    // MARITAL STATUSES
    await queryInterface.bulkInsert(
      { schema: 'app_mgt', tableName: 'metadata_values' },
      [
        {
          metadata_id: martialStatusesObject[0].id,
          metadata_value: 'SINGLE',
          metadata_value_description: 'SINGLE',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: martialStatusesObject[0].id,
          metadata_value: 'MARRIED',
          metadata_value_description: 'MARRIED',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );

    // CHART OF ACCOUNT STATUSES
    await queryInterface.bulkInsert(
      { schema: 'app_mgt', tableName: 'metadata_values' },
      [
        {
          metadata_id: chartAccountStatusesObject[0].id,
          metadata_value: 'ACTIVE',
          metadata_value_description: 'ACTIVE',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: chartAccountStatusesObject[0].id,
          metadata_value: 'INACTIVE',
          metadata_value_description: 'INACTIVE',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );

    // CHART OF ACCOUNT TAXES
    await queryInterface.bulkInsert(
      { schema: 'app_mgt', tableName: 'metadata_values' },
      [
        {
          metadata_id: chartAccountTaxesObject[0].id,
          metadata_value: 'TAX EXEMPT',
          metadata_value_description: 'TAX EXEMPT',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: chartAccountTaxesObject[0].id,
          metadata_value: 'TAX ON SALE',
          metadata_value_description: 'TAX ON SALE',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: chartAccountTaxesObject[0].id,
          metadata_value: 'TAX ON PURCHASES',
          metadata_value_description: 'TAX ON PURCHASES',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: chartAccountTaxesObject[0].id,
          metadata_value: 'VALUE ADDED TAX',
          metadata_value_description: 'VALUE ADDED TAX',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );

    // CHART OF ACCOUNT TYPES
    await queryInterface.bulkInsert(
      { schema: 'app_mgt', tableName: 'metadata_values' },
      [
        {
          metadata_id: chartAccountTypesObject[0].id,
          metadata_value: 'EQUITY',
          metadata_value_description: 'EQUITY',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: chartAccountTypesObject[0].id,
          metadata_value: 'REVENUE',
          metadata_value_description: 'REVENUE',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: chartAccountTypesObject[0].id,
          metadata_value: 'CURRENT ASSET',
          metadata_value_description: 'CURRENT ASSET',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: chartAccountTypesObject[0].id,
          metadata_value: 'OTHER INCOME',
          metadata_value_description: 'OTHER INCOME',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: chartAccountTypesObject[0].id,
          metadata_value: 'EXPENSE',
          metadata_value_description: 'EXPENSE',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: chartAccountTypesObject[0].id,
          metadata_value: 'DEPRECIATION',
          metadata_value_description: 'DEPRECIATION',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: chartAccountTypesObject[0].id,
          metadata_value: 'FIXED ASSET',
          metadata_value_description: 'FIXED ASSET',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: chartAccountTypesObject[0].id,
          metadata_value: 'BANK',
          metadata_value_description: 'BANK',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: chartAccountTypesObject[0].id,
          metadata_value: 'CURRENT LIABILITY',
          metadata_value_description: 'CURRENT LIABILITY',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: chartAccountTypesObject[0].id,
          metadata_value: 'INVENTORY',
          metadata_value_description: 'INVENTORY',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: chartAccountTypesObject[0].id,
          metadata_value: 'NON-CURRENT ASSET',
          metadata_value_description: 'NON-CURRENT ASSET',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );

    // resultRemarksObject
    await queryInterface.bulkInsert(
      { schema: 'app_mgt', tableName: 'metadata_values' },
      [
        {
          metadata_id: resultRemarksObject[0].id,
          metadata_value: 'NP',
          metadata_value_description: 'NORMAL PROGRESS',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: resultRemarksObject[0].id,
          metadata_value: 'RT',
          metadata_value_description: 'RETAKE PAPER',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: resultRemarksObject[0].id,
          metadata_value: 'CTR',
          metadata_value_description: 'PAPER WITH LESS THAN PASS SCORE',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: resultRemarksObject[0].id,
          metadata_value: 'MIS',
          metadata_value_description: 'MISSING PAPER',
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
