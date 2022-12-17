const models = require('@models');
const { QueryTypes } = require('sequelize');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

class DetailedReportStudentsService {
  /**
   *students enrollment records by campus
   *
   *
   */
  static async enrolledStudentsByCampus(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.students_by_campus_programme_study_year(${data.campus_id},
            ${data.academic_year_id},${data.intake_id},${data.semester_id},${data.programme_id},${data.study_year_id})
            order by name asc`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `detailedReportStudents.service.js`,
        `enrolledStudentsByCampus`,
        `GET`
      );
    }
  }

  // by campus,by programme type

  static async enrolledStudentsByCampusProgrammeType(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.students_by_campus_programme_study_year(${data.campus_id},
            ${data.academic_year_id},${data.intake_id},${data.semester_id},${data.programme_id},${data.study_year_id})
            WHERE programme_type_id = ${data.programme_type_id}
            order by name asc`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `detailedReportStudents.service.js`,
        `enrolledStudentsByCampusProgrammeType`,
        `GET`
      );
    }
  }

  /**
   * all campus
   *
   */
  static async enrolledStudentsAllCampuses(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.students_by_programme_study_year(${data.academic_year_id},
          ${data.intake_id},${data.semester_id},${data.programme_id},${data.study_year_id})
          order by name asc`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `detailedReportStudents.service.js`,
        `enrolledStudentsAllCampuses`,
        `GET`
      );
    }
  }

  /**
   * all campus
   *
   * by programme type
   */
  static async enrolledStudentsAllCampusesProgrammeTypes(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.students_by_programme_study_year(${data.academic_year_id},
          ${data.intake_id},${data.semester_id},${data.programme_id},${data.study_year_id})
           WHERE programme_type_id = ${data.programme_type_id}
           order by name asc`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `detailedReportStudents.service.js`,
        `enrolledStudentsAllCampusesProgrammeTypes`,
        `GET`
      );
    }
  }

  // registration_exam_cards(registration int[])

  static async examCardRegistrationCourses(data) {
    try {
      const filtered = await models.sequelize.query(
        `select *
        from  enrollment_and_registration_mgt.registration_exam_cards(ARRAY [${data}])
        `,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `detailedReportStudents.service.js`,
        `examCardRegistrationCourses`,
        `GET`
      );
    }
  }
  // Download registered and zero balance

  static async registeredStudentsDownload(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.registered_student_download(
            ${data.academic_year_id},${data.intake_id},${data.semester_id},${data.campus_id})
            where tuition_amount_due <= 0 and functional_fees_amount_due <= 0 
            order by name,programme_title,programme_study_years asc`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `detailedReportStudents.service.js`,
        `registeredStudentsDownload`,
        `GET`
      );
    }
  }

  // unregistered_students_download
  static async unregisteredStudentsDownload(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.unregistered_students_download(
            ${data.academic_year_id},${data.intake_id},${data.semester_id},${data.campus_id})
            order by name,programme_title,programme_study_years asc`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `detailedReportStudents.service.js`,
        `unregisteredStudentsDownload`,
        `GET`
      );
    }
  }

  // student enrollments  by Programme types

  static async studentEnrollmentByFaculty(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.enrollment_download_by_faculty_(
            ${data.academic_year_id},${data.intake_id},${data.semester_id},${data.academic_unit_id})
            WHERE programme_type_id = ${data.programme_type_id} 
            order by name,programme_title,programme_study_years asc`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `detailedReportStudents.service.js`,
        `studentEnrollmentByFaculty`,
        `GET`
      );
    }
  }

  // By  programme types
  static async enrollmentByFacultyAllTypes(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.enrollment_download_by_faculty_(
            ${data.academic_year_id},${data.intake_id},${data.semester_id},${data.academic_unit_id})
            order by name,programme_title,programme_study_years  asc`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `detailedReportStudents.service.js`,
        `enrollmentByFacultyAllTypes`,
        `GET`
      );
    }
  }

  // by campus

  static async enrollmentByFacultyCampus(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.faculty_download_campus(
            ${data.academic_year_id},${data.intake_id},${data.semester_id},${data.academic_unit_id},${data.campus_id})
            order by name,programme_title,programme_study_years  asc`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `detailedReportStudents.service.js`,
        `enrollmentByFacultyCampus`,
        `GET`
      );
    }
  }

  // by campus by types

  static async enrollmentByFacultyCampusTypes(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.faculty_download_campus(
            ${data.academic_year_id},${data.intake_id},${data.semester_id},${data.academic_unit_id},${data.campus_id})
            WHERE programme_type_id = ${data.programme_type_id} 
            order by name,programme_title,programme_study_years  asc`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `detailedReportStudents.service.js`,
        `enrollmentByFacultyCampusTypes`,
        `GET`
      );
    }
  }
}

module.exports = DetailedReportStudentsService;
