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
    // Course or Module category
    const courseUnitCategory = await queryInterface.sequelize.query(
      `SELECT id From app_mgt.metadata
    WHERE metadata_name ='COURSE CATEGORIES';`
    );
    const courseUnitCategoryObject = courseUnitCategory[0];
    // Algorithms
    const programmeAlgorithm = await queryInterface.sequelize.query(
      `SELECT id From app_mgt.metadata
    WHERE metadata_name ='MARKS COMPUTATION METHODS';`
    );
    const programmeAlgorithmObject = programmeAlgorithm[0];

    // study years
    const studyYears = await queryInterface.sequelize.query(
      `SELECT id From app_mgt.metadata
    WHERE metadata_name ='STUDY YEARS';`
    );
    const studyYearsObject = studyYears[0];
    // Semesters
    const semesters = await queryInterface.sequelize.query(
      `SELECT id From app_mgt.metadata
    WHERE metadata_name ='SEMESTERS';`
    );
    const semestersObject = semesters[0];

    // award
    const awards = await queryInterface.sequelize.query(
      `SELECT id From app_mgt.metadata
    WHERE metadata_name ='AWARDS';`
    );
    const award = awards[0][0];

    // study level
    const studyLevel = await queryInterface.sequelize.query(
      `SELECT id From app_mgt.metadata
    WHERE metadata_name ='PROGRAMME STUDY LEVELS';`
    );
    const studyLevelObject = studyLevel[0];

    // study time
    const studyTimes = await queryInterface.sequelize.query(
      `SELECT id From app_mgt.metadata
    WHERE metadata_name ='PROGRAMME STUDY TYPES';`
    );
    const studyTimesObject = studyTimes[0];

    // duration measure

    const durationMeasure = await queryInterface.sequelize.query(
      `SELECT id From app_mgt.metadata
    WHERE metadata_name ='DURATION MEASURES';`
    );
    const durationMeasureObject = durationMeasure[0];
    // subject combination categories
    const subjectCombinationCategories = await queryInterface.sequelize.query(
      `SELECT id From app_mgt.metadata
    WHERE metadata_name ='SUBJECT COMBINATION CATEGORIES';`
    );
    const subjectCombinationCategoriesObject = subjectCombinationCategories[0];
    // programme version plan
    const versionPlan = await queryInterface.sequelize.query(
      `SELECT id From app_mgt.metadata
    WHERE metadata_name ='PROGRAMME VERSION PLANS';`
    );
    const versionPlanObject = versionPlan[0];
    // mode of delivery
    const deliveryMode = await queryInterface.sequelize.query(
      `SELECT id From app_mgt.metadata
    WHERE metadata_name ='MODES OF DELIVERY';`
    );
    const deliveryModeObject = deliveryMode[0];

    // UNEB SUBJECT CATEGORIES
    const unebSubjects = await queryInterface.sequelize.query(
      `SELECT id From app_mgt.metadata
    WHERE metadata_name ='UNEB CATEGORIES';`
    );
    const unebSubjectsObject = unebSubjects[0];
    // SALUTATIONS
    const salutation = await queryInterface.sequelize.query(
      `SELECT id From app_mgt.metadata
    WHERE metadata_name ='SALUTATIONS';`
    );
    const salutationObject = salutation[0];
    // INTAKES
    const intake = await queryInterface.sequelize.query(
      `SELECT id From app_mgt.metadata
    WHERE metadata_name ='INTAKES';`
    );
    const intakeObject = intake[0];
    // DEGREE CATEGORIES
    const degreeCategory = await queryInterface.sequelize.query(
      `SELECT id From app_mgt.metadata
    WHERE metadata_name ='DEGREE CATEGORIES';`
    );
    const degreeCategoryObject = degreeCategory[0];

    // semesters
    await queryInterface.bulkInsert(
      { schema: 'app_mgt', tableName: 'metadata_values' },
      [
        {
          metadata_id: semestersObject[0].id,
          metadata_value: 'SEMESTER I',
          metadata_value_description: 'SEMESTER I',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: semestersObject[0].id,
          metadata_value: 'SEMESTER II',
          metadata_value_description: 'SEMESTER II',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );

    // study years
    await queryInterface.bulkInsert(
      { schema: 'app_mgt', tableName: 'metadata_values' },
      [
        {
          metadata_id: studyYearsObject[0].id,
          metadata_value: 'YEAR 1',
          metadata_value_description: 'YEAR 1',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: studyYearsObject[0].id,
          metadata_value: 'YEAR 2',
          metadata_value_description: 'YEAR 2',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: studyYearsObject[0].id,
          metadata_value: 'YEAR 3',
          metadata_value_description: 'YEAR 3',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: studyYearsObject[0].id,
          metadata_value: 'YEAR 4',
          metadata_value_description: 'YEAR 4',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: studyYearsObject[0].id,
          metadata_value: 'YEAR 5',
          metadata_value_description: 'YEAR 5',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: studyYearsObject[0].id,
          metadata_value: 'YEAR 6',
          metadata_value_description: 'YEAR 6',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: studyYearsObject[0].id,
          metadata_value: 'YEAR 7',
          metadata_value_description: 'YEAR 7',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );

    // STUDY LEVEL  static parameter values

    await queryInterface.bulkInsert(
      { schema: 'app_mgt', tableName: 'metadata_values' },
      [
        {
          metadata_id: studyLevelObject[0].id,
          metadata_value: 'BACHELORS',
          metadata_value_description: 'BACHELORS',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: studyLevelObject[0].id,
          metadata_value: 'MASTERS',
          metadata_value_description: 'MASTERS',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: studyLevelObject[0].id,
          metadata_value: 'PHD',
          metadata_value_description: 'PHD',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: studyLevelObject[0].id,
          metadata_value: 'ADVANCED DIPLOMA',
          metadata_value_description: 'ADVANCED DIPLOMA',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: studyLevelObject[0].id,
          metadata_value: 'CERTIFICATE',
          metadata_value_description: 'CERTIFICATE',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: studyLevelObject[0].id,
          metadata_value: 'DIPLOMA',
          metadata_value_description: 'DIPLOMA',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: studyLevelObject[0].id,
          metadata_value: 'ADVANCED CERTIFICATE',
          metadata_value_description: 'ADVANCED CERTIFICATE',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: studyLevelObject[0].id,
          metadata_value: 'POSTGRADUATE DIPLOMA',
          metadata_value_description: 'POSTGRADUATE DIPLOMA',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
    // award static parameter values

    await queryInterface.bulkInsert(
      { schema: 'app_mgt', tableName: 'metadata_values' },
      [
        {
          metadata_id: award.id,
          metadata_value: 'DEGREE',
          metadata_value_description: 'DEGREE',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: award.id,
          metadata_value: 'DIPLOMA',
          metadata_value_description: 'DIPLOMA',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: award.id,
          metadata_value: 'MASTERS DEGREE',
          metadata_value_description: 'MASTERS DEGREE',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: award.id,
          metadata_value: 'DOCTOR',
          metadata_value_description: 'DOCTOR',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: award.id,
          metadata_value: 'CERTIFICATE',
          metadata_value_description: 'CERTIFICATE',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );

    // study times static parameter values

    await queryInterface.bulkInsert(
      { schema: 'app_mgt', tableName: 'metadata_values' },
      [
        {
          metadata_id: studyTimesObject[0].id,
          metadata_value: 'DAY',
          metadata_value_description: 'DAY',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: studyTimesObject[0].id,
          metadata_value: 'AFTERNOON',
          metadata_value_description: 'AFTERNOON',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: studyTimesObject[0].id,
          metadata_value: 'EVENING',
          metadata_value_description: 'EVENING',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: studyTimesObject[0].id,
          metadata_value: 'WEEKEND',
          metadata_value_description: 'WEEKEND',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );

    // DURATION measures

    await queryInterface.bulkInsert(
      { schema: 'app_mgt', tableName: 'metadata_values' },
      [
        {
          metadata_id: durationMeasureObject[0].id,
          metadata_value: 'YEAR',
          metadata_value_description: 'YEAR',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: durationMeasureObject[0].id,
          metadata_value: 'MONTH',
          metadata_value_description: 'MONTH',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: durationMeasureObject[0].id,
          metadata_value: 'WEEK',
          metadata_value_description: 'WEEK',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
    // contribution Algorithms
    await queryInterface.bulkInsert(
      { schema: 'app_mgt', tableName: 'metadata_values' },
      [
        {
          metadata_id: programmeAlgorithmObject[0].id,
          metadata_value: 'SUMMATION',
          metadata_value_description: 'SUMMATION',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: programmeAlgorithmObject[0].id,
          metadata_value: 'AVERAGE',
          metadata_value_description: 'AVERAGE ',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: programmeAlgorithmObject[0].id,
          metadata_value: 'PERCENTAGE',
          metadata_value_description: 'PERCENTAGE',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );

    // course unit category
    await queryInterface.bulkInsert(
      { schema: 'app_mgt', tableName: 'metadata_values' },
      [
        {
          metadata_id: courseUnitCategoryObject[0].id,
          metadata_value: 'CORE',
          metadata_value_description: 'CORE',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: courseUnitCategoryObject[0].id,
          metadata_value: 'ELECTIVE',
          metadata_value_description: 'ELECTIVE',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );

    // subject combination category
    await queryInterface.bulkInsert(
      { schema: 'app_mgt', tableName: 'metadata_values' },
      [
        {
          metadata_id: subjectCombinationCategoriesObject[0].id,
          metadata_value: 'BIOLOGICAL',
          metadata_value_description: 'BIOLOGICAL',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: subjectCombinationCategoriesObject[0].id,
          metadata_value: 'PHYSICAL',
          metadata_value_description: 'PHYSICAL',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );

    // PROGRAMME VERSION PLANS
    await queryInterface.bulkInsert(
      { schema: 'app_mgt', tableName: 'metadata_values' },
      [
        {
          metadata_id: versionPlanObject[0].id,
          metadata_value: 'PLAN A',
          metadata_value_description: 'PLAN B',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: versionPlanObject[0].id,
          metadata_value: 'PLAN B',
          metadata_value_description: 'PLAN B',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
    // MODE OF DELIVERY
    await queryInterface.bulkInsert(
      { schema: 'app_mgt', tableName: 'metadata_values' },
      [
        {
          metadata_id: deliveryModeObject[0].id,
          metadata_value: 'ONLINE',
          metadata_value_description: 'ONLINE',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: deliveryModeObject[0].id,
          metadata_value: 'ON-CAMPUS',
          metadata_value_description: 'ON-CAMPUS',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
    /**
     * intake
     */
    // intake

    await queryInterface.bulkInsert(
      { schema: 'app_mgt', tableName: 'metadata_values' },
      [
        {
          metadata_id: intakeObject[0].id,
          metadata_value: 'AUGUST',
          metadata_value_description: 'AUGUST',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: intakeObject[0].id,
          metadata_value: 'JANUARY',
          metadata_value_description: 'JANUARY',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: intakeObject[0].id,
          metadata_value: 'MAY',
          metadata_value_description: 'MAY',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: intakeObject[0].id,
          metadata_value: 'MARCH',
          metadata_value_description: 'MARCH',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: intakeObject[0].id,
          metadata_value: 'FEBRUARY',
          metadata_value_description: 'FEBRUARY',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
    /**
     * degree category
     */
    // degree category

    await queryInterface.bulkInsert(
      { schema: 'app_mgt', tableName: 'metadata_values' },
      [
        {
          metadata_id: degreeCategoryObject[0].id,
          metadata_value: 'UNDERGRADUATE',
          metadata_value_description: 'UNDERGRADUATE',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: degreeCategoryObject[0].id,
          metadata_value: 'POSTGRADUATE',
          metadata_value_description: 'POSTGRADUATE',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
    // uneb categories
    await queryInterface.bulkInsert(
      { schema: 'app_mgt', tableName: 'metadata_values' },
      [
        {
          metadata_id: unebSubjectsObject[0].id,
          metadata_value: 'ENGLISH LANGUAGES',
          metadata_value_description: 'ENGLISH LANGUAGES',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: unebSubjectsObject[0].id,
          metadata_value: 'HUMANITIES',
          metadata_value_description: 'HUMANITIES',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: unebSubjectsObject[0].id,
          metadata_value: 'LANGUAGES',
          metadata_value_description: 'LANGUAGES',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: unebSubjectsObject[0].id,
          metadata_value: 'MATHEMATICS',
          metadata_value_description: 'MATHEMATICS',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: unebSubjectsObject[0].id,
          metadata_value: 'SCIENCE SUBJECTS',
          metadata_value_description: 'SCIENCE SUBJECTS',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: unebSubjectsObject[0].id,
          metadata_value: 'CULTURAL SUBJECTS AND OTHERS',
          metadata_value_description: 'CULTURAL SUBJECTS AND OTHERS',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: unebSubjectsObject[0].id,
          metadata_value: 'TECHNICAL SUBJECTS',
          metadata_value_description: 'TECHNICAL SUBJECTS',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: unebSubjectsObject[0].id,
          metadata_value: 'BUSINESS STUDIES',
          metadata_value_description: 'BUSINESS STUDIES',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
    // salutations
    await queryInterface.bulkInsert(
      { schema: 'app_mgt', tableName: 'metadata_values' },
      [
        {
          metadata_id: salutationObject[0].id,
          metadata_value: 'MR.',
          metadata_value_description: 'MR.',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: salutationObject[0].id,
          metadata_value: 'Prof.',
          metadata_value_description: 'PROFESSOR',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: salutationObject[0].id,
          metadata_value: 'Assoc.prof',
          metadata_value_description: 'ASSOCIATE PROFESSOR',
          created_by_id: systemAdminUserObject[0].id,
          create_approved_by_id: systemAdminUserObject[0].id,
          create_approval_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          metadata_id: salutationObject[0].id,
          metadata_value: 'DR.',
          metadata_value_description: 'DOCTOR',
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
