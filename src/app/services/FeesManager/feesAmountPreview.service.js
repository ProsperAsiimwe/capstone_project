const models = require('@models');
const { QueryTypes } = require('sequelize');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

class FeesAmountPreviewService {
  /**
   * tuition amount function
   */
  static async tuitionAmountPreviewContext(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from fees_mgt.tuition_amount_function(${data.campus_id},${data.academic_year_id},${data.intake_id},
          ${data.billing_category_id},${data.programme_study_year_id}
          ,${data.programme_id},${data.programme_type_id})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `feesAmountPreview.service.js`,
        `tuitionAmountPreviewContext`,
        `GET`
      );
    }
  }

  static async functionalFeesPreviewContext(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from fees_mgt.functional_fees_amount_function(${data.campus_id},${data.academic_year_id},${data.intake_id},
          ${data.billing_category_id},${data.study_level_id},${data.metadata_programme_type_id})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `feesAmountPreview.service.js`,
        `functionalFeesPreviewContext`,
        `GET`
      );
    }
  }

  //  other fees function

  static async otherFeesPreviewContextFunction(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from fees_mgt.fees_preview_other_fees_function(${data.campus_id},${data.academic_year_id},${data.intake_id},${data.billing_category_id},${data.other_fees})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `feesAmountPreview.service.js`,
        `otherFeesPreviewContextFunction`,
        `GET`
      );
    }
  }

  // other fees function

  static async otherFeesPreviewContext(data) {
    try {
      const filtered = await models.sequelize.query(
        `select fees_element_id,fees_element_code,
        fees_element_name,fees_element_category,
        amount,currency 
        from fees_mgt.fees_preview_other_fees_view  
        WHERE campus_id = ${data.campus_id}
         and academic_year_id =${data.academic_year_id} 
         and intake_id =${data.intake_id}
         and billing_category_id = ${data.billing_category_id}
         and  fees_element_id IN (${data.other_fees})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `feesAmountPreview.service.js`,
        `otherFeesPreviewContext`,
        `GET`
      );
    }
  }

  /**
   *
   *
   * fees waivers
   */
  static async feesWaiversPreviewContextFunction(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from fees_mgt.fees_waivers_preview_function(${data.campus_id},${data.academic_year_id},${data.intake_id},${data.fees_waiver_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `feesAmountPreview.service.js`,
        `feesWaiversPreviewContextFunction`,
        `GET`
      );
    }
  }

  // feesWaiversAdmissionLetter

  static async feesWaiversAdmissionLetter(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from fees_mgt.fees_waivers_preview_function(${data.campus_id},${data.entry_academic_year_id},${data.intake_id},${data.fees_waiver_id})`,

        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `feesAmountPreview.service.js`,
        `feesWaiversAdmissionLetter`,
        `GET`
      );
    }
  }

  /**
   * fees structure
   *
   * @param {*} student
   * @returns
   */
  // student data

  static async feesStructureStudent(student) {
    try {
      const filtered = await models.sequelize.query(
        `select * from fees_mgt.fees_structure_student('${student}')`,
        {
          type: QueryTypes.SELECT,
          plain: true,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `feesAmountPreview.service.js`,
        `feesStructureStudent`,
        `GET`
      );
    }
  }

  // student programme id
  static async feesStructureStudentPortal(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from fees_mgt.fees_structure_std_function(${data.studentProgrammeId})`,
        {
          type: QueryTypes.SELECT,
          plain: true,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `feesAmountPreview.service.js`,
        `feesStructureStudentPortal`,
        `GET`
      );
    }
  }

  // study years

  static async feesProgrammeStudyYears(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from fees_mgt.fees_programme_years(${data.programme_id})  
        where programme_study_year >= '${data.student_entry_year}'
        order by programme_study_year asc `,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `feesAmountPreview.service.js`,
        `feesProgrammeStudyYears`,
        `GET`
      );
    }
  }
  //  tuition fees

  static async feesStructureTuition(data) {
    try {
      const filtered = await models.sequelize.query(
        `select distinct
        fees_element_id,
        programme_study_year,
        fees_element_code,
        fees_element_name,
        fees_element_category,
        amount,
        paid_when,
        currency
        from fees_mgt.tuition_fees_structure(${data.campus_id},${data.entry_academic_year_id},${data.intake_id},
          ${data.billing_category_id},${data.programme_id},${data.programme_type_id}) order by amount DESC`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `feesAmountPreview.service.js`,
        `feesStructureTuition`,
        `GET`
      );
    }
  }

  // gulu tuition

  static async feesStructureTuitionGulu(data) {
    try {
      const filtered = await models.sequelize.query(
        `select distinct
        fees_element_id,
        fees_element_code,
        fees_element_name,
        fees_element_category,
        amount,
        currency
        from fees_mgt.tuition_fees_structure(${data.campus_id},${data.entry_academic_year_id},${data.intake_id},
          ${data.billing_category_id},${data.programme_id},${data.programme_type_id})
          where fees_element_name like '%TUITION%'
          `,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `feesAmountPreview.service.js`,
        `feesStructureTuitionGulu`,
        `GET`
      );
    }
  }

  // functional

  static async feesStructureFunctional(data) {
    try {
      const filtered = await models.sequelize.query(
        `select distinct
        fees_element_id,
        fees_element_code,
        fees_element_name,
        fees_element_category,
        amount,
        paid_when,
        currency
        from fees_mgt.functional_fees_structure(${data.campus_id},${data.entry_academic_year_id},${data.intake_id},
          ${data.billing_category_id},${data.study_level_id},${data.programme_type_id}) order by amount DESC`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `feesAmountPreview.service.js`,
        `feesStructureFunctional`,
        `GET`
      );
    }
  }

  // tuition all study years
  static async tuitionAllStudyYears(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from fees_mgt.fees_preview_tuition_all_years(${data.campus_id},${data.academic_year_id},${data.intake_id},
          ${data.billing_category_id},${data.programme_id},${data.programme_type_id})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `feesAmountPreview.service.js`,
        `tuitionAllStudyYears`,
        `GET`
      );
    }
  }

  static async tuitionAmountAllStudyYears(data) {
    try {
      const filtered = await models.sequelize.query(
        `select * from fees_mgt.tuition_amounts_function(${data.campus_id},${data.academic_year_id},${data.intake_id},
          ${data.billing_category_id},${data.programme_id},${data.programme_type_id})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `feesAmountPreview.service.js`,
        `tuitionAmountAllStudyYears`,
        `GET`
      );
    }
  }
}

module.exports = FeesAmountPreviewService;
