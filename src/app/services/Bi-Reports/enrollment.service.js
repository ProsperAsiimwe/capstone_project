const models = require('@models');
const { QueryTypes } = require('sequelize');

class EnrollmentReportService {
  //academic year event
  static async eventAcademicYear(data) {
    try {
      const filtered = await models.sequelize.query(
        `
        SELECT 
        evt.academic_year_id as academic_year_id,
        ay.academic_year_id as metadata_academic_year_id,
        me.metadata_value as academic_year
        from events_mgt.events as evt 
        inner join events_mgt.academic_years as ay
        on ay.id = evt.academic_year_id
        left join app_mgt.metadata_values as me
        on me.id = ay.academic_year_id
        where evt.academic_year_id = ${data.academic_year_id}
        limit 1
          `,

        {
          type: QueryTypes.SELECT,
          plain: true,
        }
      );

      return filtered;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // 2
  static async eventSemester(data) {
    try {
      const filtered = await models.sequelize.query(
        `
        select 
        sem.semester_id as semester_id,
        upper(ms.metadata_value) as semester
        from events_mgt.semesters as sem
        left join app_mgt.metadata_values as ms
        on ms.id = sem.semester_id
        where sem.semester_id = ${data.semester_id}
        limit 1
          `,

        {
          type: QueryTypes.SELECT,
          plain: true,
        }
      );

      return filtered;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // faculty
  static async enrollmentFaculty(data) {
    try {
      const filtered = await models.sequelize.query(
        `
       select 
       
       academic_unit_code,academic_unit_title,programme_code,programme_title,
       coalesce(sum(male_enrolled) filter (where sponsorship = 'GOVERNMENT' and study_year ='YEAR 1'), 0 )as male_year_1_enr_govt,
       coalesce(sum(female_enrolled) filter (where sponsorship = 'GOVERNMENT' and study_year ='YEAR 1'), 0 )as female_year_1_enr_govt,
       coalesce(sum(male_provisionally_registered) filter (where sponsorship = 'GOVERNMENT' and study_year ='YEAR 1'), 0 )as male_prov_year_1_enr_govt,
       coalesce(sum(female_provisionally_registered) filter (where sponsorship = 'GOVERNMENT' and study_year ='YEAR 1'), 0 )as female_prov_year_1_enr_govt,
       coalesce(sum(male_fully_registered) filter (where sponsorship = 'GOVERNMENT' and study_year ='YEAR 1'), 0 )as male_year_1_reg_govt,
       coalesce(sum(female_fully_registered) filter (where sponsorship = 'GOVERNMENT' and study_year ='YEAR 1'), 0 )as female_year_1_reg_govt,
       coalesce(sum(male_enrolled) filter (where sponsorship = 'PRIVATE' and study_year ='YEAR 1'), 0 )as male_year_1_enr_private,
       coalesce(sum(female_enrolled) filter (where sponsorship = 'PRIVATE' and study_year ='YEAR 1'), 0 )as female_year_1_enr_private,
       coalesce(sum(male_provisionally_registered) filter (where sponsorship = 'PRIVATE' and study_year ='YEAR 1'), 0 )as male_prov_year_1_enr_private,
       coalesce(sum(female_provisionally_registered) filter (where sponsorship = 'PRIVATE' and study_year ='YEAR 1'), 0 )as female_prov_year_1_enr_private,
       coalesce(sum(male_fully_registered) filter (where sponsorship = 'PRIVATE' and study_year ='YEAR 1'), 0 )as male_year_1_reg_private,
       coalesce(sum(female_fully_registered) filter (where sponsorship = 'PRIVATE' and study_year ='YEAR 1'), 0 )as female_year_1_reg_private,
       
       coalesce(sum(male_enrolled) filter (where study_year ='YEAR 1'), 0 )as male_year_1_enr,
       coalesce(sum(female_enrolled) filter (where study_year ='YEAR 1'), 0 )as female_year_1_enr,
       coalesce(sum(male_provisionally_registered) filter (where study_year ='YEAR 1'), 0 )as male_prov_year_1_enr,
       coalesce(sum(female_provisionally_registered) filter (where study_year ='YEAR 1'), 0 )as female_prov_year_1_enr,
       coalesce(sum(male_fully_registered) filter (where  study_year ='YEAR 1'), 0 )as male_year_1_reg,
       coalesce(sum(female_fully_registered) filter (where study_year ='YEAR 1'), 0 )as female_year_1_reg,
        coalesce(sum(enrolled_students) filter (where study_year ='YEAR 1'), 0 )as total_year_1_enr,


       -- year 2 
       coalesce(sum(male_enrolled) filter (where sponsorship = 'GOVERNMENT' and study_year ='YEAR 2'), 0 )as male_year_2_enr_govt,
       coalesce(sum(female_enrolled) filter (where sponsorship = 'GOVERNMENT' and study_year ='YEAR 2'), 0 )as female_year_2_enr_govt,
       coalesce(sum(male_provisionally_registered) filter (where sponsorship = 'GOVERNMENT' and study_year ='YEAR 2'), 0 )as male_prov_year_2_enr_govt,
       coalesce(sum(female_provisionally_registered) filter (where sponsorship = 'GOVERNMENT' and study_year ='YEAR 2'), 0 )as female_prov_year_2_enr_govt,
       coalesce(sum(male_fully_registered) filter (where sponsorship = 'GOVERNMENT' and study_year ='YEAR 2'), 0 )as male_year_2_reg_govt,
       coalesce(sum(female_fully_registered) filter (where sponsorship = 'GOVERNMENT' and study_year ='YEAR 2'), 0 )as female_year_2_reg_govt,
       coalesce(sum(male_enrolled) filter (where sponsorship = 'PRIVATE' and study_year ='YEAR 2'), 0 )as male_year_2_enr_private,
       coalesce(sum(female_enrolled) filter (where sponsorship = 'PRIVATE' and study_year ='YEAR 2'), 0 )as female_year_2_enr_private,
       coalesce(sum(male_provisionally_registered) filter (where sponsorship = 'PRIVATE' and study_year ='YEAR 2'), 0 )as male_prov_year_2_enr_private,
       coalesce(sum(female_provisionally_registered) filter (where sponsorship = 'PRIVATE' and study_year ='YEAR 2'), 0 )as female_prov_year_2_enr_private,
       coalesce(sum(male_fully_registered) filter (where sponsorship = 'PRIVATE' and study_year ='YEAR 2'), 0 )as male_year_2_reg_private,
       coalesce(sum(female_fully_registered) filter (where sponsorship = 'PRIVATE' and study_year ='YEAR 2'), 0 )as female_year_2_reg_private,

       coalesce(sum(male_enrolled) filter (where study_year ='YEAR 2'), 0 )as male_year_2_enr,
       coalesce(sum(female_enrolled) filter (where study_year ='YEAR 2'), 0 )as female_year_2_enr,
       coalesce(sum(male_provisionally_registered) filter (where study_year ='YEAR 2'), 0 )as male_prov_year_2_enr,
       coalesce(sum(female_provisionally_registered) filter (where study_year ='YEAR 2'), 0 )as female_prov_year_2_enr,
       coalesce(sum(male_fully_registered) filter (where study_year ='YEAR 2'), 0 )as male_year_2_reg,
       coalesce(sum(female_fully_registered) filter (where study_year ='YEAR 2'), 0 )as female_year_2_reg,
        coalesce(sum(enrolled_students) filter (where study_year ='YEAR 2'), 0 )as total_year_2_enr,


       -- year 3
        coalesce(sum(male_enrolled) filter (where sponsorship = 'GOVERNMENT' and study_year ='YEAR 3'), 0 )as male_year_3_enr_govt,
       coalesce(sum(female_enrolled) filter (where sponsorship = 'GOVERNMENT' and study_year ='YEAR 3'), 0 )as female_year_3_enr_govt,
       coalesce(sum(male_provisionally_registered) filter (where sponsorship = 'GOVERNMENT' and study_year ='YEAR 3'), 0 )as male_prov_year_3_enr_govt,
       coalesce(sum(female_provisionally_registered) filter (where sponsorship = 'GOVERNMENT' and study_year ='YEAR 3'), 0 )as female_prov_year_3_enr_govt,
       coalesce(sum(male_fully_registered) filter (where sponsorship = 'GOVERNMENT' and study_year ='YEAR 3'), 0 )as male_year_3_reg_govt,
       coalesce(sum(female_fully_registered) filter (where sponsorship = 'GOVERNMENT' and study_year ='YEAR 3'), 0 )as female_year_3_reg_govt,
        coalesce(sum(male_enrolled) filter (where sponsorship = 'PRIVATE' and study_year ='YEAR 3'), 0 )as male_year_3_enr_private,
       coalesce(sum(female_enrolled) filter (where sponsorship = 'PRIVATE' and study_year ='YEAR 3'), 0 )as female_year_3_enr_private,
       coalesce(sum(male_provisionally_registered) filter (where sponsorship = 'PRIVATE' and study_year ='YEAR 3'), 0 )as male_prov_year_3_enr_private,
       coalesce(sum(female_provisionally_registered) filter (where sponsorship = 'PRIVATE' and study_year ='YEAR 3'), 0 )as female_prov_year_3_enr_private,
       coalesce(sum(male_fully_registered) filter (where sponsorship = 'PRIVATE' and study_year ='YEAR 3'), 0 )as male_year_3_reg_private,
       coalesce(sum(female_fully_registered) filter (where sponsorship = 'PRIVATE' and study_year ='YEAR 3'), 0 )as female_year_3_reg_private,

       coalesce(sum(male_enrolled) filter (where study_year ='YEAR 3'), 0 ) as male_year_3_enr,
       coalesce(sum(female_enrolled) filter (where study_year ='YEAR 3'), 0 ) as female_year_3_enr,
       coalesce(sum(male_provisionally_registered) filter (where study_year ='YEAR 3'), 0 ) as male_prov_year_3_enr,
       coalesce(sum(female_provisionally_registered) filter (where study_year ='YEAR 3'), 0 ) as female_prov_year_3_enr,
       coalesce(sum(male_fully_registered) filter (where study_year ='YEAR 3'), 0 ) as male_year_3_reg,
       coalesce(sum(female_fully_registered) filter (where  study_year ='YEAR 3'), 0 ) as female_year_3_reg,
       coalesce(sum(enrolled_students) filter (where study_year ='YEAR 3'), 0 )as total_year_3_enr,


       -- Year 4
       coalesce(sum(male_enrolled) filter (where sponsorship = 'GOVERNMENT' and study_year ='YEAR 4'), 0 )as male_year_4_enr_govt,
       coalesce(sum(female_enrolled) filter (where sponsorship = 'GOVERNMENT' and study_year ='YEAR 4'), 0 )as female_year_4_enr_govt,
       coalesce(sum(male_provisionally_registered) filter (where sponsorship = 'GOVERNMENT' and study_year ='YEAR 4'), 0 )as male_prov_year_4_enr_govt,
       coalesce(sum(female_provisionally_registered) filter (where sponsorship = 'GOVERNMENT' and study_year ='YEAR 4'), 0 )as female_prov_year_4_enr_govt,
       coalesce(sum(male_fully_registered) filter (where sponsorship = 'GOVERNMENT' and study_year ='YEAR 4'), 0 )as male_year_4_reg_govt,
       coalesce(sum(female_fully_registered) filter (where sponsorship = 'GOVERNMENT' and study_year ='YEAR 4'), 0 )as female_year_4_reg_govt,
       coalesce(sum(male_enrolled) filter (where sponsorship = 'PRIVATE' and study_year ='YEAR 4'), 0 )as male_year_4_enr_private,
       coalesce(sum(female_enrolled) filter (where sponsorship = 'PRIVATE' and study_year ='YEAR 4'), 0 )as female_year_4_enr_private,
       coalesce(sum(male_provisionally_registered) filter (where sponsorship = 'PRIVATE' and study_year ='YEAR 4'), 0 )as male_prov_year_4_enr_private,
       coalesce(sum(female_provisionally_registered) filter (where sponsorship = 'PRIVATE' and study_year ='YEAR 4'), 0 )as female_prov_year_4_enr_private,
       coalesce(sum(male_fully_registered) filter (where sponsorship = 'PRIVATE' and study_year ='YEAR 4'), 0 )as male_year_4_reg_private,
       coalesce(sum(female_fully_registered) filter (where sponsorship = 'PRIVATE' and study_year ='YEAR 4'), 0 )as female_year_4_reg_private,

       coalesce(sum(male_enrolled) filter (where  study_year ='YEAR 4'), 0 )as male_year_4_enr,
       coalesce(sum(female_enrolled) filter (where study_year ='YEAR 4'), 0 )as female_year_4_enr,
       coalesce(sum(male_provisionally_registered) filter (where study_year ='YEAR 4'), 0 )as male_prov_year_4_enr,
       coalesce(sum(female_provisionally_registered) filter (where study_year ='YEAR 4'), 0 )as female_prov_year_4_enr,
       coalesce(sum(male_fully_registered) filter (where study_year ='YEAR 4'), 0 )as male_year_4_reg,
       coalesce(sum(female_fully_registered) filter (where study_year ='YEAR 4'), 0 )as female_year_4_reg,
        coalesce(sum(enrolled_students) filter (where study_year ='YEAR 4'), 0 )as total_year_4_enr,

       -- year 5
              
       coalesce(sum(male_enrolled) filter (where sponsorship = 'GOVERNMENT' and study_year ='YEAR 5'), 0 )as male_year_5_enr_govt,
       coalesce(sum(female_enrolled) filter (where sponsorship = 'GOVERNMENT' and study_year ='YEAR 5'), 0 )as female_year_5_enr_govt,
       coalesce(sum(male_provisionally_registered) filter (where sponsorship = 'GOVERNMENT' and study_year ='YEAR 5'), 0 )as male_prov_year_5_enr_govt,
       coalesce(sum(female_provisionally_registered) filter (where sponsorship = 'GOVERNMENT' and study_year ='YEAR 5'), 0 )as female_prov_year_5_enr_govt,
       coalesce(sum(male_fully_registered) filter (where sponsorship = 'GOVERNMENT' and study_year ='YEAR 5'), 0 )as male_year_5_reg_govt,
       coalesce(sum(female_fully_registered) filter (where sponsorship = 'GOVERNMENT' and study_year ='YEAR 5'), 0 )as female_year_5_reg_govt,
        coalesce(sum(male_enrolled) filter (where sponsorship = 'PRIVATE' and study_year ='YEAR 5'), 0 )as male_year_5_enr_private,
       coalesce(sum(female_enrolled) filter (where sponsorship = 'PRIVATE' and study_year ='YEAR 5'), 0 )as female_year_5_enr_private,
       coalesce(sum(male_provisionally_registered) filter (where sponsorship = 'PRIVATE' and study_year ='YEAR 5'), 0 )as male_prov_year_5_enr_private,
       coalesce(sum(female_provisionally_registered) filter (where sponsorship = 'PRIVATE' and study_year ='YEAR 5'), 0 )as female_prov_year_5_enr_private,
       coalesce(sum(male_fully_registered) filter (where sponsorship = 'PRIVATE' and study_year ='YEAR 5'), 0 )as male_year_5_reg_private,
       coalesce(sum(female_fully_registered) filter (where sponsorship = 'PRIVATE' and study_year ='YEAR 5'), 0 )as female_year_5_reg_private,

       coalesce(sum(male_enrolled) filter (where study_year ='YEAR 5'), 0 )as male_year_5_enr,
       coalesce(sum(female_enrolled) filter (where study_year ='YEAR 5'), 0 )as female_year_5_enr,
       coalesce(sum(male_provisionally_registered) filter (where study_year ='YEAR 5'), 0 )as male_prov_year_5_enr,
       coalesce(sum(female_provisionally_registered) filter (where study_year ='YEAR 5'), 0 )as female_prov_year_5_enr,
       coalesce(sum(male_fully_registered) filter (where  study_year ='YEAR 5'), 0 )as male_year_5_reg,
       coalesce(sum(female_fully_registered) filter (where  study_year ='YEAR 5'), 0 )as female_year_5_reg,
       coalesce(sum(enrolled_students) filter (where study_year ='YEAR 5'), 0 )as total_year_5_enr


        from enrollment_and_registration_mgt.${data.unit}(${data.academic_year_id},${data.semester_id})
        group by academic_unit_code,academic_unit_title,programme_code,programme_title
        order by academic_unit_title, programme_code
          `,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // no grouping

  static async enrollmentFacultyRaw(data) {
    try {
      const filtered = await models.sequelize.query(
        `
       select *
        from enrollment_and_registration_mgt.bi_enrollment_statistics(${data.academic_year_id},${data.semester_id})
        order by academic_unit_title, programme_code
        limit 5
          `,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  //
  static async enrollmentFunction(data) {
    try {
      const filtered = await models.sequelize.query(
        `
       select *

        from enrollment_and_registration_mgt.${data.unit}(${data.academic_year_id},${data.semester_id})
       -- group by academic_unit_code,academic_unit_title,programme_code,programme_title
        order by academic_unit_title, programme_code
          `,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

module.exports = EnrollmentReportService;
