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
    // system applications

    await queryInterface.bulkInsert(
      { schema: 'user_mgt', tableName: 'apps' },
      [
        {
          app_code: 'PROG_MGT',
          app_name: 'PROGRAMMES MANAGEMENT',
          app_description:
            'Create and Manage Colleges, Faculties, Departments, Programmes, and Courses.',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_code: 'FEES_MGT',
          app_name: 'FEES MANAGEMENT',
          app_description:
            'Create and Manage Fees Items and their amounts and Fees Waivers.',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_code: 'INST_MGT',
          app_name: 'INSTITUTION SETUP',
          app_description:
            'Create and Manage System-wide Metadata and Key Settings.',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_code: 'USER_MGT',
          app_name: 'ACCESS AND PRIVILEGES MANAGEMENT',
          app_description:
            'Create and Manage Users, Roles, Profiles amd Permissions.',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_code: 'ADM_MGT',
          app_name: 'ADMISSIONS MANAGEMENT',
          app_description: 'Create and Manage Admission schemes.',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_code: 'STD_MGT',
          app_name: 'STUDENTS RECORDS MANAGEMENT',
          app_description: "Manage Students' Records/Bio data.",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_code: 'ERM_MGT',
          app_name: 'ENROLLMENT & REGISTRATION MANAGEMENT',
          app_description: 'Manage Enrollments and Registration Records.',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_code: 'IDT_MGT',
          app_name: 'IDENTITY CARD MANAGEMENT',
          app_description: 'Manage Identity Card Processing.',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_code: 'STM_MGT',
          app_name: 'STUDENT TRANSACTIONS MANAGEMENT',
          app_description: "Manage Students' Transactions and Payments.",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_code: 'TP_MGT',
          app_name: 'UNIVERSAL PAYMENT',
          app_description:
            'View Payment records from Banks and Create other Payable Fees.',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_code: 'CA_MGT',
          app_name: 'COURSE ASSIGNMENT',
          app_description:
            'Assign Courses/Modules to Lecturers/Tutors and Manage Semester Loads.',
          created_at: new Date(),
          updated_at: new Date(),
        },

        {
          app_code: 'BI_MGT',
          app_name: 'BUSINESS INTELLIGENCE',
          app_description: "'View Business Intelligence Reports.",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_code: 'RM_MGT',
          app_name: 'RESULTS MANAGEMENT',
          app_description: 'Manage Results and View Reports.',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_code: 'EVT_MGT',
          app_name: 'EVENTS SCHEDULER AND TIME TABLE MANAGEMENT',
          app_description:
            'Create and Manage Key Events, Academic Calendar, Teaching and Examination Timetables.',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_code: 'DEAN_MGT',
          app_name: 'DEANS AND STUDENTS’ WELFARE MANAGEMENT',
          app_description: "Manage Students' Welfare.",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_code: 'HR_MGT',
          app_name: 'HUMAN RESOURCE MANAGEMENT',
          app_description: 'Manage Human Resource..',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_code: 'PB_MGT',
          app_name: 'PHOTO AND BIOMETRICS CAPTURE',
          app_description: 'Manage photos and Biometrics',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_code: 'POLICY_MGT',
          app_name: 'INSTITUTION POLICY MANAGEMENT',
          app_description: 'Manage Institution policies',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_code: 'POS_MGT',
          app_name: 'POINT OF SERVICE',
          app_description: 'Manage Services',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_code: 'OUTREACH_MGT',
          app_name: 'OUTREACH MANAGEMENT',
          app_description: 'Manage Outreach',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_code: 'MEDICAL_MGT',
          app_name: 'MEDICAL SERVICES',
          app_description: 'Manage Medical Services',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_code: 'E_VOTING_MGT',
          app_name: 'E-VOTING',
          app_description: 'Manage Voting processes',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_code: 'ESTATES_MGT',
          app_name: 'ESTATES MANAGEMENT',
          app_description: 'Estates Management',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_code: 'ACADEMICS_MGT',
          app_name: 'ACADEMIC DOCUMENTS PRODUCTION',
          app_description: 'Manage Academic Documents ',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_code: 'SCM_MGT',
          app_name: 'STUDENTS CLEARANCE MANAGEMENT',
          app_description: 'STUDENTS CLEARANCE MANAGEMENT',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          app_code: 'STD_QRY',
          app_name: 'STUDENT SUPPORT MANAGEMENT',
          app_description: 'STUDENT SUPPORT MANAGEMENT',
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
      { tableName: 'apps', schema: 'user_mgt' },
      null,
      {}
    );
  },
};
