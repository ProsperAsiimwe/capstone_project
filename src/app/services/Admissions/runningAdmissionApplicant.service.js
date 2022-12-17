const models = require('@models');
const { QueryTypes } = require('sequelize');
const moment = require('moment');
const year = moment().format('YYYY');
const { sequelizeErrorHandler } = require('@helpers/technicalErrorHelper');

// This Class is responsible for handling all database interactions for a runningAdmissionApplicant
class RunningAdmissionApplicantService {
  /**
   * @param  {object} options
   * @returns {Promise}
   * @description returns all  or filtered using options param
   */
  static async findAllRunningAdmissionApplicants(options) {
    try {
      const results = await models.RunningAdmissionApplicant.findAll({
        ...options,
      });

      return results;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `runningAdmissionApplicant.service.js`,
        `findAllRunningAdmissionApplicants`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} options
   * @returns {Promise} any
   * @description returns a single runningAdmissionApplicant object basing on the options
   */
  static async findOneRunningAdmissionApplicant(options) {
    try {
      const runningAdmissionApplicant =
        await models.RunningAdmissionApplicant.findOne({
          ...options,
        });

      return runningAdmissionApplicant;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `runningAdmissionApplicant.service.js`,
        `findOneRunningAdmissionApplicant`,
        `GET`
      );
    }
  }

  /**
   * Fetch all applicants by programme
   * @param {*} data
   * @param {*} transaction
   */
  static async fetchAllApplicantsByProgramme(options) {
    try {
      const result = await models.ApplicantProgrammeChoice.findAll({
        ...options,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `runningAdmissionApplicant.service.js`,
        `fetchAllApplicantsByProgramme`,
        `GET`
      );
    }
  }
  // find one
  static async findOneApplicantsByProgramme(options) {
    try {
      const result = await models.ApplicantProgrammeChoice.findOne({
        ...options,
      });

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `runningAdmissionApplicant.service.js`,
        `fetchAllApplicantsByProgramme`,
        `GET`
      );
    }
  }

  // update

  static async updateApplicantProgrammeChoice(id, data, transaction) {
    console.log('update........');
    try {
      const record = await models.ApplicantProgrammeChoice.update(
        { ...data },
        { where: { id }, transaction, returning: true }
      );

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `ApplicantProgrammeChoice.service.js`,
        `updateApplicantProgrammeChoice`,
        `PUT`
      );
    }
  }
  /**
   * @param  {object} data
   * @returns {Promise}
   * @description creates a single runningAdmissionApplicant object from data object
   *@
   */
  static async createRunningAdmissionApplicant(data, transaction) {
    try {
      const result = await models.RunningAdmissionApplicant.findOrCreate({
        where: {
          applicant_id: data.applicant_id,
          running_admission_id: data.running_admission_id,
          form_id: data.form_id,
        },
        defaults: {
          ...data,
        },
        include: [
          {
            association: models.RunningAdmissionApplicant.formSections,
          },
        ],
        transaction,
      });

      if (result[1] === false) {
        for (const item of data.formSections) {
          await models.RunningAdmissionApplicantSection.findOrCreate({
            where: {
              running_admission_applicant_id: result[0].dataValues.id,
              form_section_id: item.form_section_id,
            },
            defaults: {
              ...item,
            },
            transaction,
          });
        }
      } else {
        const runningAdmission = await models.RunningAdmission.findOne({
          where: {
            id: data.running_admission_id,
          },
          attributes: ['id', 'number_of_choices', 'maximum_number_of_forms'],
          raw: true,
        });

        if (!runningAdmission) {
          throw new Error(`Running Admission Record Not Found.`);
        }

        const runningAdmissionApplicants =
          await models.RunningAdmissionApplicant.findAll({
            where: {
              running_admission_id: data.running_admission_id,
              applicant_id: data.applicant_id,
            },
            attributes: ['id', 'form_id', 'application_status'],
            raw: true,
          });

        if (
          parseInt(runningAdmissionApplicants.length, 10) >=
          parseInt(runningAdmission.maximum_number_of_forms, 10)
        ) {
          throw new Error(
            `You Have Reached The Maximum Number Of Forms Allowed For This Running Admission.`
          );
        }
      }

      return result;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `runningAdmissionApplicant.service.js`,
        `createRunningAdmissionApplicant`,
        `POST`
      );
    }
  }

  /**
   *
   * @param {*} data
   * @param {*} transaction
   */
  static async createApplicantPaymentTransaction(data, transaction) {
    try {
      const record = await models.ApplicantPaymentTransaction.create(data, {
        transaction,
      });

      return record;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `runningAdmissionApplicant.service.js`,
        `createApplicantPaymentTransaction`,
        `POST`
      );
    }
  }

  /**
   * Find APPLICANT PAYMENT TRANSACTION
   *
   * @param {*} options
   */
  static async findOneApplicantPaymentTransaction(options) {
    try {
      const transaction = await models.ApplicantPaymentTransaction.findOne({
        ...options,
      });

      return transaction;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `runningAdmissionApplicant.service.js`,
        `findOneApplicantPaymentTransaction`,
        `GET`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id  id of runningAdmissionApplicant object to be updated
   * @returns {Promise}
   * @description updates a single runningAdmissionApplicant object
   *@
   */
  static async updateRunningAdmissionApplicant(id, data, transaction) {
    try {
      const updated = await models.RunningAdmissionApplicant.update(
        {
          ...data,
        },
        {
          where: {
            id,
          },
          transaction,
          returning: true,
        }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `runningAdmissionApplicant.service.js`,
        `updateRunningAdmissionApplicant`,
        `PUT`
      );
    }
  }

  /**
   * @param  {object} data
   * @param {string} id
   * @returns {Promise}
   * @description updates a single runningAdmissionApplicant object
   *@
   */
  static async submitRunningAdmissionApplicantForm(
    formId,
    applicantId,
    data,
    transaction
  ) {
    try {
      const updated = await models.RunningAdmissionApplicant.update(
        {
          ...data,
        },
        {
          where: {
            form_id: formId,
            applicant_id: applicantId,
          },
          transaction,
          returning: true,
        }
      );

      return updated;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `runningAdmissionApplicant.service.js`,
        `submitRunningAdmissionApplicantForm`,
        `PUT`
      );
    }
  }

  // {
  //   application_status: 'COMPLETED',
  //   payment_reference_number: paymentReference,
  //   application_completion_date: moment.now(),
  //   payment_method_id: data.payment_method_id,
  // },
  // {
  //   where: {
  //     form_id: id,
  //     applicant_id: applicant,
  //     application_status: 'IN-PROGRESS',
  //   },

  /**
   * @param  {object} data
   * @param {string} id  id of runningAdmissionApplicant object to be updated
   * @returns {Promise}
   * @description updates a single runningAdmissionApplicant object
   *@
   */
  static async admitRunningAdmissionApplicant(id) {
    try {
      const admitted = await models.RunningAdmissionApplicant.update(
        {
          application_status: 'ADMITTED',
          application_admission_date: moment.now(),
        },
        {
          where: {
            form_id: id,
          },
          returning: true,
        }
      );

      const bioData = await models.ApplicantBioData.findOne({
        where: {
          form_id: admitted.form_id,
        },
      });

      // const permanentAddress = await models.ApplicantPermanentAddress.findOne({
      //   where: {
      //     form_id: admitted.form_id,
      //   },
      // });

      const nextOfKin = await models.ApplicantNextOfKin.findAll({
        where: {
          form_id: admitted.form_id,
        },
      });

      await models.Student.findOrCreate({
        where: {
          applicant_id: admitted.applicant_id,
        },
        defaults: {
          ...bioData,
          ...nextOfKin,
          surname: bioData.surname,
          other_names: bioData.other_names,
          registration_number: generateRegistrationNumber(),
          student_number: generateStudentNumber(),
          home_district: bioData.district_of_origin,
          guardian_name: nextOfKin.next_of_kin_name,
          guardian_phone: nextOfKin.next_of_kin_phone,
          guardian_email: nextOfKin.next_of_kin_email,
          guardian_relationship: nextOfKin.next_of_kin_relationship,
          guardian_address: nextOfKin.next_of_kin_address,
          applicant_id: admitted.applicant_id,
        },
      });

      return admitted;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `runningAdmissionApplicant.service.js`,
        `admitRunningAdmissionApplicant`,
        `PUT`
      );
    }
  }

  /**
   *
   * @param {running admission programme campus}
   *
   * admissions_mgt.programme_campuses(running_admission bigint)
   *
   */
  static async programmeCampuses(id) {
    try {
      const records = await models.sequelize.query(
        `select *
        from admissions_mgt.programme_campuses(${id})`,
        {
          type: QueryTypes.SELECT,
        }
      );

      return records;
    } catch (error) {
      await sequelizeErrorHandler(
        error,
        `runningAdmissionApplicant.service.js`,
        `programmeCampuses`,
        `GET`
      );
    }
  }
}

/**
 *
 * @param {*} str
 * @param {*} charPos
 * @returns
 */
const removeCharacter = function (str, charPos) {
  const part1 = str.substring(0, charPos);
  const part2 = str.substring(charPos + 1, str.length);

  return part1 + part2;
};

/**
 *
 * @returns
 */
const generateRegistrationNumber = function () {
  const random = Math.floor(Math.random() * moment().unix());
  const regNoYear = year.substring(2);
  const registrationNumber = `${regNoYear}/U/${random
    .toString()
    .substr(0, 4)}/PS`;

  return registrationNumber;
};

/**
 *
 * @returns
 */
const generateStudentNumber = function () {
  const random = Math.floor(Math.random() * moment().unix());
  const studentNoYear = removeCharacter(year, 1);
  const studentNumber = `${studentNoYear}${random.toString().substr(0, 6)}`;

  return studentNumber;
};

module.exports = RunningAdmissionApplicantService;
