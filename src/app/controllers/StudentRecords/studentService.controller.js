const { HttpResponse } = require('@helpers');
const {
  studentServiceService,
  studentService,
  studentServicePolicyService,
  metadataValueService,
} = require('@services/index');
const moment = require('moment');
const model = require('@models');
const {
  getMetadataValueName,
  getMetadataValueIdWithoutError,
} = require('@controllers/Helpers/programmeHelper');
const {
  studentProgrammeAttributes,
} = require('@controllers/Helpers/enrollmentRecord');
const envConfig = require('../../../config/app');
const {
  generateSystemReference,
} = require('../Helpers/paymentReferenceHelper');
const { generatePRN } = require('@helpers');
const {
  prnTrackerRecord,
} = require('@controllers/Helpers/paymentReferenceRecord');
const { isArray, isEmpty, trim, chain, orderBy } = require('lodash');

const http = new HttpResponse();

class StudentServiceController {
  /**
   * GET All records.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async index(req, res) {
    try {
      const records = await studentServiceService
        .findAllStudentServices({
          ...studentServiceAttributes(),
        })
        .then((res) => {
          if (res) {
            return res.map((item) => item.get({ plain: true }));
          }
        });

      let grouped = [];

      const metadataValues = await metadataValueService.findAllMetadataValues({
        include: {
          association: 'metadata',
          attributes: ['id', 'metadata_name'],
        },
        attributes: ['id', 'metadata_value'],
      });

      if (!isEmpty(records)) {
        grouped = chain(records)
          .groupBy('student_service_type_id')
          .map((value, key) => ({
            student_service_type_id: key,
            value: getMetadataValueName(
              metadataValues,
              key,
              'CHANGE OF PROGRAMME TYPES'
            ),
            records: orderBy(value, ['id'], ['asc']),
          }))
          .value();
      }

      http.setSuccess(200, 'All Student Service Records Fetched Successfully', {
        data: grouped,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch All Student Service Records', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * CREATE New Record.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async createStudentService(req, res) {
    try {
      const data = req.body;
      const id = !isEmpty(req.params) ? req.params.studentId : req.user.id;
      const staff = isEmpty(req.params) ? req.user.id : null;

      data.created_by_id = staff;

      const findStudent = await studentService
        .findOneStudent({
          where: {
            id,
          },
          include: [
            {
              association: 'programmes',
              include: [
                {
                  association: 'programmeType',
                },
              ],
            },
          ],
          nest: true,
        })
        .then((res) => {
          if (res) {
            return res.toJSON();
          }
        });

      if (!findStudent) {
        throw new Error(`Unable To Find Your Student Record.`);
      }

      const findActiveProgramme = findStudent.programmes.find(
        (prog) => prog.is_current_programme === true
      );

      if (!findActiveProgramme) {
        throw new Error(`Unable To Find Your Current Active Programme.`);
      }

      data.student_id = findStudent.id;
      data.student_programme_id = findActiveProgramme.id;

      const findPolicy = await studentServicePolicyService
        .findOneRecord({
          where: {
            student_service_type_id: data.student_service_type_id,
          },
          include: [
            {
              association: 'account',
              attributes: ['account_code', 'account_name'],
            },
            {
              association: 'serviceType',
              attributes: ['id', 'metadata_value'],
            },
            {
              association: 'amounts',
              include: [
                {
                  association: 'billingCategory',
                  attributes: ['id', 'metadata_value'],
                },
                {
                  association: 'currency',
                  attributes: ['id', 'metadata_value'],
                },
              ],
            },
          ],
          nest: true,
        })
        .then((res) => {
          if (res) {
            return res.toJSON();
          }
        });

      if (findPolicy) {
        const findPolicyAmount = findPolicy.amounts.find(
          (policy) =>
            parseInt(policy.billing_category_id, 10) ===
            parseInt(findActiveProgramme.billing_category_id, 10)
        );

        if (findPolicyAmount) {
          data.requires_payment = true;
          data.amount = findPolicyAmount.amount;
          data.currency_id = findPolicyAmount.currency_id;
        }
      }

      const metadataValues = await metadataValueService.findAllMetadataValues({
        include: ['metadata'],
      });

      const changeOfProgrammeId = getMetadataValueIdWithoutError(
        metadataValues,
        'CHANGE OF PROGRAMME',
        'CHANGE OF PROGRAMME TYPES',
        'ERROR!'
      );

      const changeOfProgrammeTypeId = getMetadataValueIdWithoutError(
        metadataValues,
        'CHANGE OF PROGRAMME TYPE',
        'CHANGE OF PROGRAMME TYPES',
        'ERROR!'
      );

      const changeOfCampusId = getMetadataValueIdWithoutError(
        metadataValues,
        'CHANGE OF CAMPUS',
        'CHANGE OF PROGRAMME TYPES',
        'ERROR!'
      );

      const changeOfSubjectCombinationId = getMetadataValueIdWithoutError(
        metadataValues,
        'CHANGE OF SUBJECT COMBINATION',
        'CHANGE OF PROGRAMME TYPES',
        'ERROR!'
      );

      if (
        changeOfProgrammeId &&
        parseInt(changeOfProgrammeId, 10) ===
          parseInt(data.student_service_type_id, 10)
      ) {
        data.old_programme_id = findActiveProgramme.programme_id;
        data.old_programme_version_id =
          findActiveProgramme.programme_version_id;
      } else if (
        changeOfProgrammeTypeId &&
        parseInt(changeOfProgrammeTypeId, 10) ===
          parseInt(data.student_service_type_id, 10)
      ) {
        data.old_programme_type_id =
          findActiveProgramme.programmeType.programme_type_id;
      } else if (
        changeOfCampusId &&
        parseInt(changeOfCampusId, 10) ===
          parseInt(data.student_service_type_id, 10)
      ) {
        data.old_campus_id = findActiveProgramme.campus_id;
      } else if (
        changeOfSubjectCombinationId &&
        parseInt(changeOfSubjectCombinationId, 10) ===
          parseInt(data.student_service_type_id, 10)
      ) {
        data.old_subject_comb_id = findActiveProgramme.subject_combination_id
          ? findActiveProgramme.subject_combination_id
          : null;
      } else {
        throw new Error(`Unknown Student Service Type`);
      }

      const result = await model.sequelize.transaction(async (transaction) => {
        const result = await studentServiceService.createStudentService(
          data,
          transaction
        );

        return result;
      });

      http.setSuccess(200, 'Student Service Created Successfully.', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Create This Student Service.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async generateStudentServicePRN(req, res) {
    try {
      const { serviceId } = req.params;

      const payload = {};

      payload.tax_head = envConfig.TAX_HEAD_CODE;
      payload.system_prn = generateSystemReference();
      payload.payment_mode = 'CASH';
      payload.payment_bank_code = 'STN';

      const findStudentService = await studentServiceService
        .findOneStudentService({
          where: {
            id: serviceId,
            //  student_id: id,
          },
          include: [
            {
              association: 'student',
            },
          ],
          nest: true,
        })
        .then((res) => {
          if (res) {
            return res.toJSON();
          }
        });

      if (!findStudentService) {
        throw new Error(`unable To Find Your Requested Service.`);
      }

      if (!findStudentService.amount) {
        throw new Error(
          `You Cannot Generate A PRN For This Service Because It Is Not Billable.`
        );
      }

      if (
        findStudentService.payment_status === 'T' &&
        findStudentService.is_used === true
      ) {
        throw new Error(`Your Application Is already PaidFor`);
      }

      if (findStudentService.expiry_date) {
        if (moment(findStudentService.expiry_date) > moment.now()) {
          throw new Error(
            `Your Current Reference Number ${findStudentService.ura_prn} Has Not Yet Expired, Please Generate A New One After ${findStudentService.expiry_date}.`
          );
        }
      }

      payload.tax_payer_name = `${findStudentService.student.surname} ${findStudentService.student.other_names}`;

      const requestUraPrnData = {
        TaxHead: payload.tax_head,
        TaxPayerName: payload.tax_payer_name,
        TaxPayerBankCode: payload.payment_bank_code,
        PaymentBankCode: payload.payment_bank_code,
        ReferenceNo: payload.system_prn,
        ExpiryDays: envConfig.PAYMENT_REFERENCE_EXPIRES_IN,
        Amount: findStudentService.amount,
        PaymentMode: payload.payment_mode,
        MobileNo: findStudentService.student.phone,
        Email: findStudentService.student.email,
      };

      const genPRN = await generatePRN(requestUraPrnData);

      const updateData = {};

      updateData.ura_prn = genPRN.ura_prn;
      updateData.expiry_date = genPRN.expiry_date;
      updateData.search_code = genPRN.search_code;
      updateData.amount = findStudentService.amount;
      updateData.tax_payer_name = payload.tax_payer_name;
      updateData.payment_mode = payload.payment_mode;
      updateData.payment_bank_code = payload.payment_bank_code;
      updateData.tax_payer_bank_code = payload.tax_payer_bank_code;
      updateData.generated_by = payload.tax_payer_name;
      updateData.system_prn = payload.system_prn;
      updateData.is_used = false;
      updateData.payment_status = 'PENDING';

      const result = await model.sequelize.transaction(async (transaction) => {
        const result = await studentServiceService.updateStudentService(
          serviceId,
          updateData,
          transaction
        );

        const prnTrackerData = {
          student_id: findStudentService.student_id,
          category: 'STUDENT-SERVICE',
          system_prn: payload.system_prn,
          ura_prn: genPRN.ura_prn,
          search_code: genPRN.search_code,
          amount: findStudentService.amount,
          tax_payer_name: payload.tax_payer_name,
          payment_mode: payload.payment_mode,
          payment_bank_code: payload.payment_bank_code,
          tax_payer_bank_code: payload.tax_payer_bank_code,
          generated_by: payload.tax_payer_name,
          expiry_date: genPRN.expiry_date,
        };

        await prnTrackerRecord(prnTrackerData, transaction);

        return isArray(result) ? result[1][0] : result;
      });

      http.setSuccess(200, 'Student Service PRN Created Successfully.', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Create This Student Service PRN.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async approveStudentServiceRequest(req, res) {
    try {
      const { serviceId } = req.params;

      const { id } = req.user;
      const random = Math.floor(Math.random() * moment().unix());
      const generatedBatchNumber = `BATCH-${random}`;

      const payload = req.body;

      payload.request_approved_by_id = id;
      payload.request_status = 'APPROVED';
      payload.request_approval_date = moment.now();

      const findStudentService = await studentServiceService
        .findOneStudentService({
          where: {
            id: serviceId,
          },
          include: [
            {
              association: 'serviceType',
              attributes: ['id', 'metadata_value'],
            },
          ],
          nest: true,
        })
        .then((res) => {
          if (res) {
            return res.toJSON();
          }
        });

      if (!findStudentService) {
        throw new Error(`unable To Find The Requested Service.`);
      }

      if (
        findStudentService.requires_payment === true &&
        findStudentService.is_used === false
      ) {
        throw new Error(
          `The Student Has Not Completed Payment For The Requested Service.`
        );
      }

      const metadataValues = await metadataValueService.findAllMetadataValues({
        include: ['metadata'],
      });

      const changeOfProgrammeId = getMetadataValueIdWithoutError(
        metadataValues,
        'CHANGE OF PROGRAMME',
        'CHANGE OF PROGRAMME TYPES',
        'ERROR!'
      );

      const changeOfProgrammeTypeId = getMetadataValueIdWithoutError(
        metadataValues,
        'CHANGE OF PROGRAMME TYPE',
        'CHANGE OF PROGRAMME TYPES',
        'ERROR!'
      );

      const changeOfCampusId = getMetadataValueIdWithoutError(
        metadataValues,
        'CHANGE OF CAMPUS',
        'CHANGE OF PROGRAMME TYPES',
        'ERROR!'
      );

      const changeOfSubjectCombinationId = getMetadataValueIdWithoutError(
        metadataValues,
        'CHANGE OF SUBJECT COMBINATION',
        'CHANGE OF PROGRAMME TYPES',
        'ERROR!'
      );

      const findOldStudentProgramme = await studentService
        .findOneStudentProgramme({
          where: {
            id: findStudentService.student_programme_id,
          },
          ...studentProgrammeAttributes(),
          nest: true,
        })
        .then(function (res) {
          if (res) {
            const result = res.toJSON();

            return result;
          }
        });

      if (!findOldStudentProgramme) {
        throw new Error(`Unable To Find The Student's Old Programme.`);
      }

      const result = await model.sequelize.transaction(async (transaction) => {
        if (
          changeOfProgrammeId &&
          parseInt(changeOfProgrammeId, 10) ===
            parseInt(findStudentService.student_service_type_id, 10)
        ) {
          const findPreviousProgrammes =
            await studentService.findAllStudentProgrammes({
              where: {
                student_id: findStudentService.student_id,
              },
              raw: true,
            });

          if (!isEmpty(findPreviousProgrammes)) {
            for (const record of findPreviousProgrammes) {
              await studentService.updateStudentProgramme(
                record.id,
                { is_current_programme: false },
                transaction
              );
            }
          }

          if (!findStudentService.old_programme_id) {
            throw new Error(
              `The record of this requested service does not have an old programme.`
            );
          }

          if (!findStudentService.new_programme_id) {
            throw new Error(
              `The record of this requested service does not have a new programme.`
            );
          }

          if (!payload.approved_programme_type_id) {
            throw new Error(
              `Please Provide A New Programme Type To Give This Student.`
            );
          }

          if (!payload.approved_programme_version_id) {
            throw new Error(
              `Please Provide A New Programme Version To Give This Student.`
            );
          }

          if (!payload.approved_entry_study_year_id) {
            throw new Error(
              `Please Provide A New Programme Study Year To Give This Student.`
            );
          }

          if (!payload.approved_current_study_year_id) {
            throw new Error(
              `Please Provide A New Current Programme Study Year To Give This Student.`
            );
          }

          const studentProgrammeData = {
            student_id: findStudentService.student_id,
            applicant_id: findOldStudentProgramme.applicant_id,
            programme_id: findStudentService.new_programme_id,
            programme_type_id: payload.approved_programme_type_id,
            programme_version_id: payload.approved_programme_version_id,
            fees_waiver_id: findOldStudentProgramme.fees_waiver_id,
            entry_academic_year_id:
              findOldStudentProgramme.entry_academic_year_id,
            entry_study_year_id: payload.approved_entry_study_year_id,
            current_study_year_id: payload.approved_current_study_year_id,
            intake_id: findOldStudentProgramme.intake_id,
            campus_id: findOldStudentProgramme.campus_id,
            sponsorship_id: findOldStudentProgramme.sponsorship_id,
            billing_category_id: findOldStudentProgramme.billing_category_id,
            residence_status_id: findOldStudentProgramme.residence_status_id,
            hall_of_attachment_id:
              findOldStudentProgramme.hall_of_attachment_id,
            hall_of_residence_id: findOldStudentProgramme.hall_of_residence_id,
            student_academic_status_id:
              findOldStudentProgramme.student_academic_status_id,
            marital_status_id: findOldStudentProgramme.marital_status_id,
            registration_number: trim(
              findOldStudentProgramme.registration_number
            ),
            student_number: trim(findOldStudentProgramme.student_number),
            is_current_programme: true,
            sponsor: findOldStudentProgramme.sponsor
              ? findOldStudentProgramme.sponsor
              : '',
            created_by_id: id,
            approvals: {
              created_by_id: id,
              batch_number: generatedBatchNumber,
              upload_type: `${findStudentService.serviceType.metadata_value}`,
            },
          };
          const result =
            await studentService.createStudentProgrammeByChangeOfProgramme(
              studentProgrammeData,
              transaction
            );

          return result;
        } else if (
          changeOfProgrammeTypeId &&
          parseInt(changeOfProgrammeTypeId, 10) ===
            parseInt(findStudentService.student_service_type_id, 10)
        ) {
          if (!findStudentService.new_programme_type_id) {
            throw new Error(
              `The record of this requested service does not have a new programme type.`
            );
          }

          const findNewProgrammeTypeId =
            findOldStudentProgramme.programme.programmeStudyYears.find(
              (year) =>
                parseInt(year.programme_study_year_id, 10) ===
                parseInt(findStudentService.new_programme_type_id, 10)
            );

          if (!findNewProgrammeTypeId) {
            throw new Error(
              `The Requested Programme Type Is Not Available For This Student's Programme.`
            );
          }

          await studentService.updateStudentProgramme(
            findOldStudentProgramme.id,
            { programme_type_id: findNewProgrammeTypeId },
            transaction
          );
        } else if (
          changeOfCampusId &&
          parseInt(changeOfCampusId, 10) ===
            parseInt(findStudentService.student_service_type_id, 10)
        ) {
          if (!findStudentService.new_campus_id) {
            throw new Error(
              `The record of this requested service does not have a new campus.`
            );
          }

          await studentService.updateStudentProgramme(
            findOldStudentProgramme.id,
            { campus_id: findStudentService.new_campus_id },
            transaction
          );
        } else if (
          changeOfSubjectCombinationId &&
          parseInt(changeOfSubjectCombinationId, 10) ===
            parseInt(findStudentService.student_service_type_id, 10)
        ) {
          if (!findStudentService.new_subject_comb_id) {
            throw new Error(
              `The record of this requested service does not have a new subject combination.`
            );
          }

          await studentService.updateStudentProgramme(
            findOldStudentProgramme.id,
            { subject_combination_id: findStudentService.new_subject_comb_id },
            transaction
          );
        } else {
          throw new Error(`Unknown Student Service Type`);
        }
      });

      http.setSuccess(200, 'Student Service Approved Successfully.', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Approve This Student Service.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * UPDATE Specific Record.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async updateStudentService(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      const user = req.user.id;

      data.last_updated_by_id = user;
      data.updated_at = moment.now();

      const result = await model.sequelize.transaction(async (transaction) => {
        const update = await studentServiceService.updateStudentService(
          id,
          data,
          transaction
        );
        const result = update[1][0];

        return result;
      });

      http.setSuccess(200, 'Student Service Record Updated Successfully', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Update This Student Service Record', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Destroy Record Data
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async deleteStudentService(req, res) {
    try {
      const { id } = req.params;

      await studentServiceService.deleteStudentService(id);
      http.setSuccess(200, 'Student Service Record Deleted Successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Delete This Student Service Record', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

const studentServiceAttributes = function () {
  return {
    include: [
      {
        association: 'student',
      },
      {
        association: 'studentProgramme',
        include: [
          {
            association: 'currentStudyYear',
            attributes: ['programme_study_years', 'programme_study_year_id'],
          },
          {
            association: 'entryStudyYear',
            attributes: ['programme_study_years', 'programme_study_year_id'],
          },
          {
            association: 'programme',
            attributes: [
              'id',
              'programme_study_level_id',
              'is_modular',
              'programme_duration',
              'duration_measure_id',
              'programme_code',
              'programme_title',
            ],
            include: [
              {
                association: 'studyLevel',
                attributes: ['id', 'metadata_value'],
              },
              {
                association: 'durationMeasure',
                attributes: ['id', 'metadata_value'],
              },
              {
                association: 'programmeStudyYears',
                attributes: [
                  'id',
                  'programme_id',
                  'programme_study_year_id',
                  'programme_study_years',
                ],
              },
            ],
          },
          {
            association: 'programmeType',
            attributes: ['id'],
            include: {
              association: 'programmeType',
              attributes: ['id', 'metadata_value'],
            },
          },
          {
            association: 'programmeVersion',
            attributes: [
              'id',
              'version_title',
              'has_plan',
              'has_subject_combination_categories',
              'has_specializations',
              'specialization_semester_id',
              'specialization_year_id',
              'subject_combination_semester_id',
              'subject_combination_year_id',
              'is_current_version',
            ],
          },
          {
            association: 'subjectCombination',
            attributes: [
              'id',
              'combination_category_id',
              'subject_combination_code',
            ],
            include: [
              {
                association: 'subjects',
                attributes: ['id'],
              },
            ],
          },
        ],
      },
      {
        association: 'serviceType',
        attributes: ['id', 'metadata_value'],
      },
      {
        association: 'academicYear',
        attributes: ['id', 'metadata_value'],
      },
      {
        association: 'semester',
        attributes: ['id', 'metadata_value'],
      },
      {
        association: 'studyYear',
        attributes: ['id', 'metadata_value'],
      },
      {
        association: 'oldProgramme',
        attributes: [
          'id',
          'programme_duration',
          'programme_code',
          'programme_title',
        ],
      },
      {
        association: 'oldVersion',
        attributes: ['id', 'version_title', 'is_current_version'],
      },
      {
        association: 'newProgramme',
        attributes: [
          'id',
          'programme_duration',
          'programme_code',
          'programme_title',
        ],
      },
      {
        association: 'newVersion',
        attributes: ['id', 'version_title', 'is_current_version'],
      },
      {
        association: 'oldProgrammeType',
        attributes: ['id', 'metadata_value'],
      },
      {
        association: 'newProgrammeType',
        attributes: ['id', 'metadata_value'],
      },
      {
        association: 'oldCampus',
        attributes: ['id', 'metadata_value'],
      },
      {
        association: 'newCampus',
        attributes: ['id', 'metadata_value'],
      },
      {
        association: 'oldSubjectComb',
        attributes: [
          'id',
          'combination_category_id',
          'subject_combination_code',
        ],
      },
      {
        association: 'newSubjectComb',
        attributes: [
          'id',
          'combination_category_id',
          'subject_combination_code',
        ],
      },
      {
        association: 'approvedBy',
      },
    ],
  };
};

module.exports = StudentServiceController;
