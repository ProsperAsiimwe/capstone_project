const models = require('@models');
const { QueryTypes } = require('sequelize');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

class PaymentReportsStudentsService {
  /**
   * payment reports
   * by campus
   *
   */
  static async studentsByCampus(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.students_payments_by_campus(${data.campus_id},
            ${data.academic_year_id},${data.intake_id},${data.semester_id},${data.programme_id},${data.study_year_id})
            where tuition_invoice_amount > 0 or functional_fees_invoice_amount > 0
            or other_fees_invoice_amount > 0
             order by surname`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentReportsStudents.service.js`,
        `studentsByCampus`,
        `GET`
      );
    }
  }

  // by programme type

  static async studentsByCampusProgrammeType(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.students_payments_by_campus(${data.campus_id},
            ${data.academic_year_id},${data.intake_id},${data.semester_id},${data.programme_id},${data.study_year_id})
            WHERE programme_type_id = ${data.programme_type_id} and (   tuition_invoice_amount > 0
               or functional_fees_invoice_amount > 0
            or other_fees_invoice_amount > 0)
             order by surname `,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentReportsStudents.service.js`,
        `studentsByCampusProgrammeType`,
        `GET`
      );
    }
  }

  // all campus

  static async studentsAllCampuses(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.students_payment_all_campus(${data.academic_year_id},
          ${data.intake_id},${data.semester_id},${data.programme_id},${data.study_year_id})
            where tuition_invoice_amount > 0 or functional_fees_invoice_amount > 0
            or other_fees_invoice_amount > 0
            order by surname `,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentReportsStudents.service.js`,
        `studentsAllCampuses`,
        `GET`
      );
    }
  }

  // all campus by programme type

  static async studentsAllCampusesProgrammeTypes(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.students_payment_all_campus(${data.academic_year_id},
          ${data.intake_id},${data.semester_id},${data.programme_id},${data.study_year_id})
           WHERE programme_type_id = ${data.programme_type_id} and
           ( tuition_invoice_amount > 0 or functional_fees_invoice_amount > 0
            or other_fees_invoice_amount > 0)
            order by surname `,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentReportsStudents.service.js`,
        `studentsAllCampusesProgrammeTypes`,
        `GET`
      );
    }
  }

  // manual invoices by campus
  static async studentsManualByCampuses(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.manual_invoice_payments_by_campus(${data.campus_id},${data.academic_year_id},
          ${data.intake_id},${data.semester_id},${data.programme_id},${data.study_year_id})
          order by surname `,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentReportsStudents.service.js`,
        `studentsManualByCampuses`,
        `GET`
      );
    }
  }
  // by campus by programme typegitl

  static async studentsManualByCampusesProgrammeTypes(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.manual_invoice_payments_by_campus(${data.campus_id},${data.academic_year_id},
          ${data.intake_id},${data.semester_id},${data.programme_id},${data.study_year_id})
           WHERE programme_type_id = ${data.programme_type_id}
           order by surname `,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentReportsStudents.service.js`,
        `studentsManualByCampusesProgrammeTypes`,
        `GET`
      );
    }
  }

  // manual invoices  payment transactions all campus

  static async studentsManualAllCampuses(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.manual_invoice_payments_all_campus(${data.academic_year_id},
          ${data.intake_id},${data.semester_id},${data.programme_id},${data.study_year_id})
          order by surname `,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentReportsStudents.service.js`,
        `studentsManualAllCampuses`,
        `GET`
      );
    }
  }

  // all campuses by programme type

  static async studentsManualAllCampusesProgrammeTypes(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.manual_invoice_payments_all_campus(${data.academic_year_id},
          ${data.intake_id},${data.semester_id},${data.programme_id},${data.study_year_id})
           WHERE programme_type_id = ${data.programme_type_id}
           order by surname `,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentReportsStudents.service.js`,
        `studentsManualAllCampusesProgrammeTypes`,
        `GET`
      );
    }
  }

  /**
   *
   * reports download
   *
   *
   * download all student
   */

  static async downloadStudentsByCampus(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.student_payments_function2(${data.campus_id},
            ${data.academic_year_id},${data.intake_id},${data.semester_id})
            where tuition_invoice_amount > 0 or functional_fees_invoice_amount > 0
            or other_fees_invoice_amount > 0 or  arrears_invoice_amount > 0
            order by programme_code,surname
            `,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentReportsStudents.service.js`,
        `downloadStudentsByCampus`,
        `GET`
      );
    }
  }

  // by programme type

  static async downloadByCampusProgrammeType(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.student_payments_function2(${data.campus_id},
            ${data.academic_year_id},${data.intake_id},${data.semester_id})
            WHERE programme_type_id = ${data.programme_type_id} and (   tuition_invoice_amount > 0
               or functional_fees_invoice_amount > 0
            or other_fees_invoice_amount > 0 or arrears_invoice_amount > 0)
            order by programme_code,surname
            `,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentReportsStudents.service.js`,
        `downloadByCampusProgrammeType`,
        `GET`
      );
    }
  }

  // manual invoices by campus
  static async downloadManualByCampuses(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.manual_student_payments2(${data.campus_id},${data.academic_year_id},
          ${data.intake_id},${data.semester_id})
          order by programme_code,surname
          `,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentReportsStudents.service.js`,
        `downloadManualByCampuses`,
        `GET`
      );
    }
  }
  // by campus by programme typegitl

  static async downloadManualByCampusesProgrammeTypes(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.manual_student_payments2(${data.campus_id},${data.academic_year_id},
          ${data.intake_id},${data.semester_id})
           WHERE programme_type_id = ${data.programme_type_id}
           order by programme_code,surname
           `,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentReportsStudents.service.js`,
        `downloadManualByCampusesProgrammeTypes`,
        `GET`
      );
    }
  }

  // download all student Payments
  /**
   *
   * @param {*} data
   * @returns
   *
   * all campuses
   */

  static async studentPaymentsAllCampus(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.std_payments_all_campuses(
            ${data.academic_year_id},${data.intake_id},${data.semester_id})
            where tuition_invoice_amount > 0 or functional_fees_invoice_amount > 0
            or other_fees_invoice_amount > 0 or  arrears_invoice_amount > 0
            order by programme_code,surname
            `,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentReportsStudents.service.js`,
        `downloadStudentsByCampus`,
        `GET`
      );
    }
  }

  static async studentManualPaymentsAllCampus(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from enrollment_and_registration_mgt.std_manual_payments_all_campuses(${data.academic_year_id},
          ${data.intake_id},${data.semester_id})
           order by programme_code,surname
           `,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `paymentReportsStudents.service.js`,
        `downloadManualByCampusesProgrammeTypes`,
        `GET`
      );
    }
  }
}

module.exports = PaymentReportsStudentsService;
