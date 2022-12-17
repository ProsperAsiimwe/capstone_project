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

    // form
    const admissionForm = await queryInterface.sequelize.query(`select 
    id
    from admissions_mgt.admission_forms`);

    const admissionFormObject = admissionForm[0];

    // form sections

    const admissionFormSections = await queryInterface.sequelize.query(`select 
    mv.id as id
    from app_mgt.metadata_values  as mv
    inner join app_mgt.metadata as md
    on md.id = mv.metadata_id
    Where md.metadata_name = 'ADMISSION FORM SECTIONS'`);

    const admissionFormSectionsObject = admissionFormSections[0];
    /**
     * seed forms
     */

    await queryInterface.bulkInsert(
      { schema: 'admissions_mgt', tableName: 'admission_form_sections' },
      [
        {
          admission_form_id: admissionFormObject[0].id,
          form_section_id: admissionFormSectionsObject[0].id,
          section_number: 1,
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          admission_form_id: admissionFormObject[0].id,
          form_section_id: admissionFormSectionsObject[1].id,
          section_number: 2,
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          admission_form_id: admissionFormObject[0].id,
          form_section_id: admissionFormSectionsObject[2].id,
          section_number: 3,
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          admission_form_id: admissionFormObject[0].id,
          form_section_id: admissionFormSectionsObject[3].id,
          section_number: 4,
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          admission_form_id: admissionFormObject[0].id,
          form_section_id: admissionFormSectionsObject[4].id,
          section_number: 5,
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          admission_form_id: admissionFormObject[0].id,
          form_section_id: admissionFormSectionsObject[5].id,
          section_number: 6,
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
    // postgraduate
    await queryInterface.bulkInsert(
      { schema: 'admissions_mgt', tableName: 'admission_form_sections' },
      [
        {
          admission_form_id: admissionFormObject[1].id,
          form_section_id: admissionFormSectionsObject[0].id,
          section_number: 1,
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          admission_form_id: admissionFormObject[1].id,
          form_section_id: admissionFormSectionsObject[1].id,
          section_number: 2,
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          admission_form_id: admissionFormObject[1].id,
          form_section_id: admissionFormSectionsObject[2].id,
          section_number: 3,
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          admission_form_id: admissionFormObject[1].id,
          form_section_id: admissionFormSectionsObject[3].id,
          section_number: 4,
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          admission_form_id: admissionFormObject[1].id,
          form_section_id: admissionFormSectionsObject[4].id,
          section_number: 5,
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          admission_form_id: admissionFormObject[1].id,
          form_section_id: admissionFormSectionsObject[5].id,
          section_number: 6,
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          admission_form_id: admissionFormObject[1].id,
          form_section_id: admissionFormSectionsObject[6].id,
          section_number: 7,
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
      { schema: 'admissions_mgt', tableName: 'admission_form_sections' },
      null,
      {}
    );
  },
};
