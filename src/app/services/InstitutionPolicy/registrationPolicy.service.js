const models = require('@models');
// const { QueryTypes } = require('sequelize');
// const { isEmpty } = require('lodash');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for this entity
class RegistrationPolicyService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all records or filtered using options param
   */
  static async findAllRecords(options) {
    try {
      const records = await models.RegistrationPolicy.findAll({
        ...options,
      });

      return records;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `registrationPolicy.service.js`,
        `findAllRecords`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single record object basing on the options
   */
  static async findOneRecord(options) {
    try {
      const record = await models.RegistrationPolicy.findOne({
        ...options,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `registrationPolicy.service.js`,
        `findOneRecord`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async addPolicyCampuses(data, transaction) {
    try {
      const record = await models.RegistrationPolicyCampus.findOrCreate({
        where: {
          registration_policy_id: data.registration_policy_id,
          campus_id: data.campus_id,
        },
        defaults: {
          ...data,
        },
        transaction,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `registrationPolicy.service.js`,
        `addPolicyCampuses`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} options
   * @returns
   */
  static async findAllRegistrationPolicyCampuses(options) {
    try {
      const records = await models.RegistrationPolicyCampus.findAll({
        ...options,
      });

      return records;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `registrationPolicy.service.js`,
        `findAllRegistrationPolicyCampuses`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} id
   * @returns
   */
  static async deleteRegistrationPolicyCampus(options, transaction) {
    try {
      const deleted = await models.RegistrationPolicyCampus.destroy({
        ...options,
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `registrationPolicy.service.js`,
        `deleteRegistrationPolicyCampus`,
        `DELETE`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async addPolicyIntakes(data, transaction) {
    try {
      const record = await models.RegistrationPolicyIntake.findOrCreate({
        where: {
          registration_policy_id: data.registration_policy_id,
          intake_id: data.intake_id,
        },
        defaults: {
          ...data,
        },
        transaction,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `registrationPolicy.service.js`,
        `addPolicyIntakes`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} options
   * @returns
   */
  static async findAllRegistrationPolicyIntakes(options) {
    try {
      const records = await models.RegistrationPolicyIntake.findAll({
        ...options,
      });

      return records;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `registrationPolicy.service.js`,
        `findAllRegistrationPolicyIntakes`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} id
   * @returns
   */
  static async deleteRegistrationPolicyIntake(options, transaction) {
    try {
      const deleted = await models.RegistrationPolicyIntake.destroy({
        ...options,
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `registrationPolicy.service.js`,
        `deleteRegistrationPolicyIntake`,
        `DELETE`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async addPolicySemesters(data, transaction) {
    try {
      const record = await models.RegistrationPolicySemester.findOrCreate({
        where: {
          registration_policy_id: data.registration_policy_id,
          semester_id: data.semester_id,
        },
        defaults: {
          ...data,
        },
        transaction,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `registrationPolicy.service.js`,
        `addPolicySemesters`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} options
   * @returns
   */
  static async findAllRegistrationPolicySemesters(options) {
    try {
      const records = await models.RegistrationPolicySemester.findAll({
        ...options,
      });

      return records;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `registrationPolicy.service.js`,
        `findAllRegistrationPolicySemesters`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} id
   * @returns
   */
  static async deleteRegistrationPolicySemester(options, transaction) {
    try {
      const deleted = await models.RegistrationPolicySemester.destroy({
        ...options,
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `registrationPolicy.service.js`,
        `deleteRegistrationPolicySemester`,
        `DELETE`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async addPolicyEntryAcademicYears(data, transaction) {
    try {
      const record = await models.RegPolicyEntryAcademicYear.findOrCreate({
        where: {
          registration_policy_id: data.registration_policy_id,
          entry_academic_year_id: data.entry_academic_year_id,
        },
        defaults: {
          ...data,
        },
        transaction,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `registrationPolicy.service.js`,
        `addPolicyEntryAcademicYears`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} options
   * @returns
   */
  static async findAllRegistrationPolicyEntryAcademicYears(options) {
    try {
      const records = await models.RegPolicyEntryAcademicYear.findAll({
        ...options,
      });

      return records;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `registrationPolicy.service.js`,
        `findAllRegistrationPolicyEntryAcademicYears`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} id
   * @returns
   */
  static async deleteRegistrationPolicyEntryAcademicYear(options, transaction) {
    try {
      const deleted = await models.RegPolicyEntryAcademicYear.destroy({
        ...options,
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `registrationPolicy.service.js`,
        `deleteRegistrationPolicyEntryAcademicYear`,
        `DELETE`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async addPolicyEnrollmentStatuses(data, transaction) {
    try {
      const record =
        await models.RegistrationPolicyEnrollmentStatus.findOrCreate({
          where: {
            registration_policy_id: data.registration_policy_id,
            enrollment_status_id: data.enrollment_status_id,
          },
          defaults: {
            ...data,
          },
          transaction,
        });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `registrationPolicy.service.js`,
        `addPolicyEnrollmentStatuses`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} options
   * @returns
   */
  static async findAllRegistrationPolicyEnrollmentStatuses(options) {
    try {
      const records = await models.RegistrationPolicyEnrollmentStatus.findAll({
        ...options,
      });

      return records;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `registrationPolicy.service.js`,
        `findAllRegistrationPolicyEnrollmentStatuses`,
        `GET`
      );
    }
  }

  /**
   *
   * @param {*} id
   * @returns
   */
  static async deleteRegistrationPolicyEnrollmentStatus(options, transaction) {
    try {
      const deleted = await models.RegistrationPolicyEnrollmentStatus.destroy({
        ...options,
        transaction,
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `registrationPolicy.service.js`,
        `deleteRegistrationPolicyEnrollmentStatus`,
        `DELETE`
      );
    }
  }

  /**
   *
   * @param {*} data
   */
  static async createRegistrationPolicy(data, transaction) {
    try {
      const record = await models.RegistrationPolicy.findOrCreate({
        where: {
          enrollment_status_id: data.enrollment_status_id,
          registration_type_id: data.registration_type_id,
        },
        defaults: {
          ...data,
        },
        transaction,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `registrationPolicy.service.js`,
        `createRegistrationPolicy`,
        `POST`
      );
    }
  }
  // /**
  //  *
  //  * @param {*} data
  //  */
  // static async createRegistrationPolicy(data, transaction) {
  //   try {
  //     const filtered = await models.sequelize
  //       .query(
  //         `select * from  enrollment_and_registration_mgt.registration_policy_function(
  //   ${data.academic_year_id},${data.registration_type_id}, ${data.entry_academic_year_id},
  //   ${data.semester_id}, ${data.intake_id}, ${data.enrollment_status_id}, ${data.campus_id})`,
  //         {
  //           type: QueryTypes.SELECT,
  //         }
  //       )
  //       .then((res) => {
  //         return res;
  //       });

  //     if (isEmpty(filtered)) {
  //       const payload = {
  //         academic_year_id: data.academic_year_id,
  //         registration_type_id: data.registration_type_id,
  //         is_combined: data.is_combined,
  //         tuition_fee_percentage: data.tuition_fee_percentage,
  //         functional_fee_percentage: data.functional_fee_percentage,
  //         combined_fee_percentage: data.combined_fee_percentage,
  //         created_by_id: data.created_by_id,
  //         campuses: [{ campus_id: data.campus_id }],
  //         intakes: [{ intake_id: data.intake_id }],
  //         semesters: [{ semester_id: data.semester_id }],
  //         entryAcadYrs: [
  //           { entry_academic_year_id: data.entry_academic_year_id },
  //         ],
  //         enrollmentStatuses: [
  //           { enrollment_status_id: data.enrollment_status_id },
  //         ],
  //       };

  //       const record = await models.RegistrationPolicy.create(payload, {
  //         include: [
  //           {
  //             association: models.RegistrationPolicy.campuses,
  //           },
  //           {
  //             association: models.RegistrationPolicy.intakes,
  //           },
  //           {
  //             association: models.RegistrationPolicy.semesters,
  //           },
  //           {
  //             association: models.RegistrationPolicy.entryAcadYrs,
  //           },
  //           {
  //             association: models.RegistrationPolicy.enrollmentStatuses,
  //           },
  //         ],
  //         transaction,
  //       });

  //       //  console.log('record', record.dataValues);

  //       filtered.push(record.dataValues);
  //     }

  //     return filtered;
  //   } catch (error) {
  //     throw new Error(error.message);
  //   }
  // }

  /**
   *
   * @param {*} data
   */
  // static async checkRegistrationPolicy(data) {
  //   try {
  //     const filtered = await models.sequelize
  //       .query(
  //         `select * from  enrollment_and_registration_mgt.registration_policy_function(
  //   ${data.academic_year_id},${data.registration_type_id}, ${data.entry_academic_year_id},
  //   ${data.semester_id}, ${data.intake_id}, ${data.enrollment_status_id}, ${data.campus_id})`,
  //         {
  //           type: QueryTypes.SELECT,
  //         }
  //       )
  //       .then((res) => {
  //         return res;
  //       });

  //     return filtered;
  //   } catch (error) {
  //     throw new Error(error.message);
  //   }
  // }

  /**
   * @param  {object} data
   * @param {string} id  id of record object to be updated
   * @returns {Promise}
   * @description updates a single record object
   *@
   */
  static async updateRegistrationPolicy(id, data) {
    try {
      const record = await models.RegistrationPolicy.update(
        { ...data },
        { where: { id }, returning: true }
      );

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `registrationPolicy.service.js`,
        `updateRegistrationPolicy`,
        `PUT`
      );
    }
  }

  /**
   * @param {string} id  id of record object to be deleted
   * @returns {Promise}
   * @description deletes a single record object
   *@
   */
  static async deleteRecord(id) {
    try {
      const deleted = await models.RegistrationPolicy.destroy({
        where: { id },
      });

      return deleted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `registrationPolicy.service.js`,
        `deleteRecord`,
        `DELETE`
      );
    }
  }
}

module.exports = RegistrationPolicyService;
