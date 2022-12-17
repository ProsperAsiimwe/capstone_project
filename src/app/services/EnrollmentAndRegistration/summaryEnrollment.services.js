const models = require('@models');
const { QueryTypes } = require('sequelize');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

class SummaryEnrollmentStatusService {
  // by campus, by programme type
  static async campusAndProgrammeType(data) {
    try {
      const filtered = await models.sequelize.query(
        `select  
    enrollment_event,
    enrollment_type,
    programme_study_years,
   sum(total_number_enrolled_students) as total_number_enrolled_students,
sum(number_full_registration_students) as number_full_registration_students,
sum(number_provisional_registration_students) as number_provisional_registration_students

    from enrollment_and_registration_mgt.enrollment_status_report(${data.academic_year_id},
          ${data.intake_id},${data.semester_id})
          where campus_id = ${data.campus_id} and 
          programme_type_id = ${data.programme_type_id}
           group by enrollment_event,enrollment_type, programme_study_years

          `,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `summaryEnrollment.service.js`,
        `campusAndProgrammeType`,
        `GET`
      );
    }
  }

  // by campus

  static async campusAndEnrollment(data) {
    try {
      const filtered = await models.sequelize.query(
        `select  
    enrollment_event,
    enrollment_type,
    programme_study_years,
sum(total_number_enrolled_students) as total_number_enrolled_students,
sum(number_full_registration_students) as number_full_registration_students,
sum(number_provisional_registration_students) as number_provisional_registration_students

    
    from enrollment_and_registration_mgt.enrollment_status_report(${data.academic_year_id},
          ${data.intake_id},${data.semester_id})
          where campus_id = ${data.campus_id}
           group by enrollment_event,enrollment_type, programme_study_years 

          `,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `summaryEnrollment.service.js`,
        `campusAndEnrollment`,
        `GET`
      );
    }
  }
  // by programme type

  static async programmeTypeAndEnrollment(data) {
    try {
      const filtered = await models.sequelize.query(
        `select  
    enrollment_event,
    enrollment_type,
    programme_study_years,
  sum(total_number_enrolled_students) as total_number_enrolled_students,
sum(number_full_registration_students) as number_full_registration_students,
sum(number_provisional_registration_students) as number_provisional_registration_students

    
    from enrollment_and_registration_mgt.enrollment_status_report(${data.academic_year_id},
          ${data.intake_id},${data.semester_id})
          where  programme_type_id = ${data.programme_type_id}
          group by enrollment_event,enrollment_type, programme_study_years

          `,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `summaryEnrollment.service.js`,
        `programmeTypeAndEnrollment`,
        `GET`
      );
    }
  }

  // enrollment status
  static async enrollmentStatusFunction(data) {
    try {
      const filtered = await models.sequelize.query(
        `select  
    enrollment_event,
    enrollment_type,
    programme_study_years,
  sum(total_number_enrolled_students) as total_number_enrolled_students,
sum(number_full_registration_students) as number_full_registration_students,
sum(number_provisional_registration_students) as number_provisional_registration_students

    from enrollment_and_registration_mgt.enrollment_status_report(${data.academic_year_id},
          ${data.intake_id},${data.semester_id})
          group by enrollment_event,enrollment_type, programme_study_years`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `summaryEnrollment.service.js`,
        `enrollmentStatusFunction`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {academic units} data
   * @returns
   */
  // enrollment_status_academic_unit
  static async facultyCampusProgrammeType(data) {
    try {
      const filtered = await models.sequelize.query(
        `select  
    enrollment_event,
    enrollment_type,
    programme_study_years,
   sum(total_number_enrolled_students) as total_number_enrolled_students,
sum(number_full_registration_students) as number_full_registration_students,
sum(number_provisional_registration_students) as number_provisional_registration_students

    
    from enrollment_and_registration_mgt.enrollment_status_academic_unit(${data.academic_year_id},
          ${data.intake_id},${data.semester_id})
          where  faculty_id = ${data.academic_unit_id} and 
          campus_id = ${data.campus_id} and 
          programme_type_id = ${data.programme_type_id}
          group by enrollment_event,enrollment_type, programme_study_years
          `,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `summaryEnrollment.service.js`,
        `facultyCampusProgrammeType`,
        `GET`
      );
    }
  }

  // enrollment_status_academic_unit
  static async facultyCampusFunction(data) {
    try {
      const filtered = await models.sequelize.query(
        `select  
    enrollment_event,
    enrollment_type,
    programme_study_years,
sum(total_number_enrolled_students) as total_number_enrolled_students,
sum(number_full_registration_students) as number_full_registration_students,
sum(number_provisional_registration_students) as number_provisional_registration_students

    
    from enrollment_and_registration_mgt.enrollment_status_academic_unit(${data.academic_year_id},
          ${data.intake_id},${data.semester_id})
          where  faculty_id = ${data.academic_unit_id} and 
          campus_id = ${data.campus_id}
          group by enrollment_event,enrollment_type, programme_study_years
          `,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `summaryEnrollment.service.js`,
        `facultyCampusFunction`,
        `GET`
      );
    }
  }

  // enrollment_status_academic_unit
  static async facultyProgrammeTypeFunction(data) {
    try {
      const filtered = await models.sequelize.query(
        `select  
    enrollment_event,
    enrollment_type,
    programme_study_years,
   sum(total_number_enrolled_students) as total_number_enrolled_students,
sum(number_full_registration_students) as number_full_registration_students,
sum(number_provisional_registration_students) as number_provisional_registration_students

    
    from enrollment_and_registration_mgt.enrollment_status_academic_unit(${data.academic_year_id},
          ${data.intake_id},${data.semester_id})
          where  faculty_id = ${data.academic_unit_id} and 
          programme_type_id = ${data.programme_type_id}
          group by enrollment_event,enrollment_type, programme_study_years
          `,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `summaryEnrollment.service.js`,
        `facultyProgrammeTypeFunction`,
        `GET`
      );
    }
  }

  // data
  static async enrollmentStatusFaculty(data) {
    try {
      const filtered = await models.sequelize.query(
        `select  
    enrollment_event,
    enrollment_type,
    programme_study_years,
  sum(total_number_enrolled_students) as total_number_enrolled_students,
sum(number_full_registration_students) as number_full_registration_students,
sum(number_provisional_registration_students) as number_provisional_registration_students


    from enrollment_and_registration_mgt.enrollment_status_academic_unit(${data.academic_year_id},
          ${data.intake_id},${data.semester_id})
          where  faculty_id = ${data.academic_unit_id} 
          group by enrollment_event,enrollment_type, programme_study_years`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `summaryEnrollment.service.js`,
        `enrollmentStatusFaculty`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {academic units} data
   * @returns
   * college
   */
  // enrollment_status_academic_unit
  static async collegeCampusProgrammeType(data) {
    try {
      const filtered = await models.sequelize.query(
        `select  
    enrollment_event,
    enrollment_type,
    programme_study_years,
sum(total_number_enrolled_students) as total_number_enrolled_students,
sum(number_full_registration_students) as number_full_registration_students,
sum(number_provisional_registration_students) as number_provisional_registration_students

    from enrollment_and_registration_mgt.enrollment_status_academic_unit(${data.academic_year_id},
          ${data.intake_id},${data.semester_id})
          where  college_id = ${data.academic_unit_id} and 
          campus_id = ${data.campus_id} and 
          programme_type_id = ${data.programme_type_id}
          group by enrollment_event,enrollment_type, programme_study_years
          `,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `summaryEnrollment.service.js`,
        `collegeCampusProgrammeType`,
        `GET`
      );
    }
  }

  // enrollment_status_academic_unit
  static async collegeCampusFunction(data) {
    try {
      const filtered = await models.sequelize.query(
        `select  
    enrollment_event,
    enrollment_type,
    programme_study_years,
    sum(total_number_enrolled_students) as total_number_enrolled_students,
sum(number_full_registration_students) as number_full_registration_students,
sum(number_provisional_registration_students) as number_provisional_registration_students

    
    from enrollment_and_registration_mgt.enrollment_status_academic_unit(${data.academic_year_id},
          ${data.intake_id},${data.semester_id})
          where  college_id = ${data.academic_unit_id} and 
          campus_id = ${data.campus_id}
          group by enrollment_event,enrollment_type, programme_study_years
          `,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `summaryEnrollment.service.js`,
        `collegeCampusFunction`,
        `GET`
      );
    }
  }

  // enrollment_status_academic_unit
  static async collegeProgrammeTypeFunction(data) {
    try {
      const filtered = await models.sequelize.query(
        `select  
    enrollment_event,
    enrollment_type,
    programme_study_years,
sum(total_number_enrolled_students) as total_number_enrolled_students,
sum(number_full_registration_students) as number_full_registration_students,
sum(number_provisional_registration_students) as number_provisional_registration_students

    
    from enrollment_and_registration_mgt.enrollment_status_academic_unit(${data.academic_year_id},
          ${data.intake_id},${data.semester_id})
          where  college_id = ${data.academic_unit_id} and 
          programme_type_id = ${data.programme_type_id}
          group by enrollment_event,enrollment_type, programme_study_years
          `,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `summaryEnrollment.service.js`,
        `collegeProgrammeTypeFunction`,
        `GET`
      );
    }
  }

  // data
  static async enrollmentStatusCollege(data) {
    try {
      const filtered = await models.sequelize.query(
        `select  
    enrollment_event,
    enrollment_type,
    programme_study_years,
sum(total_number_enrolled_students) as total_number_enrolled_students,
sum(number_full_registration_students) as number_full_registration_students,
sum(number_provisional_registration_students) as number_provisional_registration_students

    from enrollment_and_registration_mgt.enrollment_status_academic_unit(${data.academic_year_id},
          ${data.intake_id},${data.semester_id})
          where  college_id = ${data.academic_unit_id}
          group by enrollment_event,enrollment_type, programme_study_years

           `,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `summaryEnrollment.service.js`,
        `enrollmentStatusCollege`,
        `GET`
      );
    }
  }
}

module.exports = SummaryEnrollmentStatusService;
