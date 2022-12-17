const models = require('@models');
const { QueryTypes } = require('sequelize');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for a functionalFeesAmount
class FunctionalFeesAmountService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all faculties or filtered using options param
   */
  static async findAllFunctionalFeesAmounts(options) {
    try {
      const results = await models.FunctionalFeesAmount.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `functionalFeesAmount.service.js`,
        `findAllFunctionalFeesAmounts`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single functionalFeesAmount object basing on the options
   */
  static async findOneFunctionalFeesAmount(options) {
    try {
      const functionalFeesAmount = await models.FunctionalFeesAmount.findOne({
        ...options,
      });

      return functionalFeesAmount;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `functionalFeesAmount.service.js`,
        `findOneFunctionalFeesAmount`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single functionalFeesAmount object from data object
   *@
   */
  static async createFunctionalFeesAmount(data, transaction) {
    try {
      const record = await models.FunctionalFeesAmount.findOrCreate({
        where: {
          campus_id: data.campus_id,
          academic_year_id: data.academic_year_id,
          intake_id: data.intake_id,
          billing_category_id: data.billing_category_id,
          programme_study_level_id: data.programme_study_level_id,
          programme_type_id: data.programme_type_id,
        },
        defaults: {
          ...data,
        },
        include: [
          {
            association:
              models.FunctionalFeesAmount.functionalFeesAmountFeesElements,
            include: [
              {
                association: models.FunctionalFeesAmountFeesElement.approvals,
              },
            ],
          },
        ],
        transaction,
      });

      if (record[1] === false) {
        const functionalFeesAmountId = record[0].dataValues.id;

        for (const eachAmountElement of data.functionalFeesAmountFeesElements) {
          const elements =
            await models.FunctionalFeesAmountFeesElement.findOrCreate({
              where: {
                fees_element_id: eachAmountElement.fees_element_id,
                functional_fees_amount_id: functionalFeesAmountId,
              },
              defaults: {
                ...eachAmountElement,
              },
              include: [
                {
                  association: models.FunctionalFeesAmountFeesElement.approvals,
                },
              ],
              transaction,
            });

          if (elements[1] === false) {
            throw new Error(
              `Record of Study Level: ${eachAmountElement.studyLevelName} With Element: ${eachAmountElement.elementName} of Amount: ${eachAmountElement.amount} for Academic Year: ${data.academicYearName}, Intake: ${data.intakeName}, Billing Category: ${data.billingCategoryName} and Campus: ${data.campusName} Already Exists For It's Context.`
            );
          }
        }
      }

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `functionalFeesAmount.service.js`,
        `createFunctionalFeesAmount`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async createFunctionalFeesAmountFeesElement(data, transaction) {
    try {
      const result = await models.FunctionalFeesAmountFeesElement.findOrCreate({
        where: {
          fees_element_id: data.fees_element_id,
          functional_fees_amount_id: data.functional_fees_amount_id,
        },
        defaults: {
          ...data,
        },
        include: [
          {
            association: models.FunctionalFeesAmountFeesElement.approvals,
          },
        ],
        transaction,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `functionalFeesAmount.service.js`,
        `createFunctionalFeesAmountFeesElement`,
        `POST`
      );
    }
  }

  // unique fees elements

  static async createUniqFunctionalFeesAmount(data, transaction) {
    try {
      const record = await models.FunctionalFeesAmount.findOrCreate({
        where: {
          campus_id: data.campus_id,
          academic_year_id: data.academic_year_id,
          intake_id: data.intake_id,
          billing_category_id: data.billing_category_id,
          programme_study_level_id: data.programme_study_level_id,
          programme_type_id: data.programme_type_id,
        },
        defaults: {
          ...data,
        },
        include: [
          {
            association: models.FunctionalFeesAmount.uniqFunctionalFees,
          },
        ],
        transaction,
      });

      if (record[1] === false) {
        const functionalFeesAmountId = record[0].dataValues.id;

        const elements = await models.UniqFunctionalFees.findOrCreate({
          where: {
            functional_fees_amount_id: functionalFeesAmountId,
            fees_element_id: data.fees_element_id,
            semester_id: data.semester_id,
            study_year_id: data.study_year_id,
            amount: data.amount,
            currency_id: data.currency_id,
            sponsorship_id: data.sponsorship_id,
            all_programmes: data.all_programmes,
          },
          defaults: {
            ...data,
          },
          transaction,
        });

        if (elements[1] === false) {
          throw new Error(
            `One of the fees context has already been defined  OR Validation Error)`
          );
        }
      }

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `functionalFeesAmount.service.js`,
        `createFunctionalFeesAmount`,
        `POST`
      );
    }
  }

  // find one uniq fees billing

  static async findOneUniqFees(options) {
    try {
      const record = await models.UniqFunctionalFees.findOne({
        ...options,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `uniqFunctionalFees.service.js`,
        `findOneUniqFees`,
        `GET`
      );
    }
  }

  // update uniq fees billing

  static async updateUniqFees(id, data, transaction) {
    try {
      const record = await models.UniqFunctionalFees.update(
        { ...data },
        { where: { id }, transaction, returning: true }
      );

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `result.service.js`,
        `updateResult`,
        `PUT`
      );
    }
  }

  // find all unique fees elements

  static async fetchUniqFunctionalFeesAmount(data) {
    try {
      const filtered = await models.sequelize.query(
        `select 
        ub.id as id,
        ub.functional_fees_amount_id as functional_fees_amount_id,
        fa.campus_id as campus_id,
        mcc.metadata_value as campus,
        fa.intake_id as intake_id,
        mci.metadata_value as intake,
        fa.billing_category_id as billing_category_id,
        mcb.metadata_value as billing_category,
        fa.programme_type_id as programme_type_id,
        mpt.metadata_value as programme_type,
        fa.programme_study_level_id as programme_study_level_id,
        msl.metadata_value as programme_study_level,
        ub.fees_element_id as fees_element_id,
        fe.fees_element_code as fees_element_code,
        fe.fees_element_name as fees_element_name,
        ub.amount as amount,
        ub.sponsorship_id as sponsorship_id,
        mcs.metadata_value as sponsorship,
        ub.study_year_id as study_year_id,
        mcs.metadata_value as study_year,
        ub.all_programmes as all_programmes,
        ub.create_approval_status as create_approval_status

        from fees_mgt.uniq_func_fees_billing as ub
        left join fees_mgt.functional_fees_amounts as fa
        on fa.id = ub.functional_fees_amount_id
        LEFT join fees_mgt.fees_elements as fe 
        on fe.id = ub.fees_element_id
        left join app_mgt.metadata_values as mcc
        on fa.campus_id = mcc.id
        left join app_mgt.metadata_values as mci
        on fa.intake_id = mci.id
        left join app_mgt.metadata_values as mcb
        on fa.billing_category_id = mcb.id
        left join app_mgt.metadata_values as mcs
        on ub.study_year_id = mcs.id
        left join app_mgt.metadata_values as mss
        on ub.sponsorship_id = mss.id
        left join app_mgt.metadata_values as msl
        on fa.programme_study_level_id = msl.id

        left join app_mgt.metadata_values as mpt
        on fa.programme_type_id = mpt.id

        where ub.semester_id  = ${data.semester_id} and 
         fa.academic_year_id  = ${data.academic_year_id} and 
         fa.intake_id = ${data.intake_id} and
         fa.campus_id = ${data.campus_id}
          `,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `functionalFeesAmount.service.js`,
        `createFunctionalFeesAmount`,
        `POST`
      );
    }
  }

  static async fetchUniqFees(data) {
    try {
      const filtered = await models.sequelize.query(
        `select 
          ub.functional_fees_amount_id as functional_fees_amount_id,
          ub.amount as amount,
          ub.fees_element_id as fees_element_id,
          fe.fees_element_code as fees_element_code,
          fe.fees_element_name as fees_element_name,
          mc.metadata_value as fees_element_category,
          fe.description as description,
          ub.all_programmes as all_programmes,
          ugx.metadata_value as currency,
          'unique/context'::varchar as paid_when

        from fees_mgt.uniq_func_fees_billing as ub
        left join fees_mgt.functional_fees_amounts as fa
        on fa.id = ub.functional_fees_amount_id
        LEFT join fees_mgt.fees_elements as fe 
        on fe.id = ub.fees_element_id
        LEFT join app_mgt.metadata_values as ugx
        on ub.currency_id = ugx.id		
        LEFT join app_mgt.metadata_values as mc
        on fe.fees_category_id = mc.id

        where ub.semester_id  = ${data.semester_id} and 
         fa.academic_year_id  = ${data.academic_year_id} and
         fa.campus_id  = ${data.campus_id} and
         fa.intake_id  = ${data.intake_id} and
         fa.billing_category_id  = ${data.billing_category_id} and
         fa.programme_type_id  = ${data.metadata_programme_type_id} and
         fa.programme_study_level_id  = ${data.study_level_id} and
         ub.study_year_id  = ${data.study_year_id} and
         ub.sponsorship_id  = ${data.sponsorship_id} and 
         ub.all_programmes = true and
         ub.create_approval_status = 'APPROVED'


          `,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `functionalFeesAmount.service.js`,
        `createFunctionalFeesAmount`,
        `POST`
      );
    }
  }

  /**
   * findOneRequestForApproval
   * @param {*} id
   * @param {*} data
   */
  static async findOneRequestForApproval(options) {
    try {
      const result = await models.FunctionalAmountPermission.findOne({
        ...options,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `functionalFeesAmount.service.js`,
        `findOneRequestForApproval`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} id
   */
  static async deleteAmountFeesElementApproval(id) {
    try {
      const deleted = await models.FunctionalAmountPermission.destroy({
        where: { id },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `functionalFeesAmount.service.js`,
        `deleteAmountFeesElementApproval`,
        `DELETE`
      );
    }
  }

  /**
   * updateRequestForApproval
   * @param {*} id
   * @param {*} data
   */
  static async updateRequestForApproval(id, data, transaction) {
    try {
      const updated = await models.FunctionalAmountPermission.update(
        { ...data },
        { where: { id }, transaction, returning: true }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `functionalFeesAmount.service.js`,
        `updateRequestForApproval`,
        `PUT`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async createAmountFeesElementApproval(data, transaction) {
    try {
      const result = await models.FunctionalAmountPermission.create(data, {
        transaction,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `functionalFeesAmount.service.js`,
        `createAmountFeesElementApproval`,
        `POST`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of functionalFeesAmount object to be updated
   * @returns {Promise}
   * @description updates a single functionalFeesAmount object
   *@
   */
  static async updateFunctionalFeesAmount(id, data) {
    try {
      const updated = await models.FunctionalFeesAmount.update(
        { ...data },
        { where: { id }, returning: true }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `functionalFeesAmount.service.js`,
        `updateFunctionalFeesAmount`,
        `PUT`
      );
    }
  }

  /**
   * @param {string} id  id of functionalFeesAmount object to be deleted
   * @returns {Promise}
   * @description deletes a single functionalFeesAmount object
   *@
   */
  static async deleteFunctionalFeesAmount(id) {
    try {
      const deleted = await models.FunctionalFeesAmount.destroy({
        where: { id },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `functionalFeesAmount.service.js`,
        `deleteFunctionalFeesAmount`,
        `DELETE`
      );
    }
  }

  /**
   * @param  {object} data
   * @returns {Promise}
   * @description  Filters through FunctionalFeesAmount records to match those from req.query
   *@
   */
  static async filterFunctionalFeesAmountRecords(data) {
    try {
      const filtered = await models.sequelize.query(
        `select *
	from fees_mgt.other_fees_metadata_value_view
	where (campus_id = ${data.selectedCampus} AND academic_year_id = ${data.selectedAcademicYear} AND
       intake_id = ${data.selectedIntake} AND billing_category_id =  ${data.selectedBillingCategory} 
       AND programme_study_level_id = ${data.selectedStudyLevel} AND programme_type_id = ${data.selectedProgrammeType})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `functionalFeesAmount.service.js`,
        `filterFunctionalFeesAmountRecords`,
        `GET`
      );
    }
  }

  /**
   * @param {string} id  id of functionalFeesAmountFeesElement object to be deleted
   * @returns {Promise}
   * @description deletes a single functionalFeesAmountFeesElement object
   *@
   */
  static async deleteFunctionalFeesAmountFeesElement(id) {
    try {
      const deleted = await models.FunctionalFeesAmountFeesElement.destroy({
        where: { id },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `functionalFeesAmount.service.js`,
        `deleteFunctionalFeesAmountFeesElement`,
        `DELETE`
      );
    }
  }

  /**
   * @param {string} id  id of functionalFeesAmountFeesElement object to be updated
   * @returns {Promise}
   * @description updates a single functionalFeesAmountFeesElement object
   *@
   */

  static async updateFunctionalFeesAmountFeesElement(id, data, transaction) {
    try {
      const updated = await models.FunctionalFeesAmountFeesElement.update(
        { ...data },
        { where: { id }, transaction, returning: true }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `functionalFeesAmount.service.js`,
        `updateFunctionalFeesAmountFeesElement`,
        `PUT`
      );
    }
  }

  /**
   *
   * functional fees function
   */

  static async findFunctionFeesByContext(data) {
    try {
      const filtered = await models.sequelize.query(
        `select *
        from fees_mgt.functional_fees_amount_function(${data.campus_id},${data.academic_year_id},${data.intake_id})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `functionalFeesAmount.service.js`,
        `findFunctionFeesByContext`,
        `GET`
      );
    }
  }

  /**
   *
   * functional fees element by view f
   */

  static async fetchFunctionalFeesElementsByView() {
    try {
      const filtered = await models.sequelize.query(
        `select *
        from fees_mgt.functional_fees_view`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return filtered;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `functionalFeesAmount.service.js`,
        `fetchFunctionalFeesElementsByView`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single FunctionalFeesAmountFeesElement object basing on the options
   */
  static async findOneFunctionalFeesAmountFeesElementRecord(options) {
    try {
      const result = await models.FunctionalFeesAmountFeesElement.findOne({
        ...options,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `functionalFeesAmount.service.js`,
        `findOneFunctionalFeesAmountFeesElementRecord`,
        `GET`
      );
    }
  }
}

module.exports = FunctionalFeesAmountService;
