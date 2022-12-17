const { HttpResponse } = require('@helpers');
const {
  surchargePolicyService,
  otherFeesAmountService,
  enrollmentService,
  invoiceService,
  paymentReferenceService,
  paymentTransactionService,
  metadataValueService,
} = require('@services/index');
const moment = require('moment');
const model = require('@models');
const { Op } = require('sequelize');
const { isEmpty, sumBy, trim, toUpper } = require('lodash');
const {
  getMetadataValueName,
  getMetadataValueId,
} = require('@controllers/Helpers/programmeHelper');
const {
  findInvoiceDueDates,
  findRegistrationDueDate,
} = require('@controllers/Helpers/enrollmentRecord');

const http = new HttpResponse();

class SurchargePolicyController {
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
      const records = await surchargePolicyService.findAllRecords({
        include: [
          {
            association: 'surchargeType',
            attributes: ['metadata_value'],
          },
          {
            association: 'durationMeasure',
            attributes: ['metadata_value'],
          },
          {
            association: 'otherFeesElement',
            attributes: ['fees_element_code', 'fees_element_name'],
            include: {
              association: 'feesCategory',
              attributes: ['metadata_value'],
            },
          },
          {
            association: 'entryYears',
            include: [
              {
                association: 'entryAcademicYear',
                attributes: ['metadata_value'],
              },
            ],
          },
          {
            association: 'createdBy',
            attributes: ['surname', 'other_names'],
          },
          {
            association: 'createApprovedBy',
            attributes: ['surname', 'other_names'],
          },
        ],
      });

      http.setSuccess(
        200,
        'All Surcharge Policy Records Fetched Successfully',
        {
          data: records,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch All Surcharge Policy Records', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   */
  async viewRevokeSurchargeInvoiceRequests(req, res) {
    try {
      const records = await surchargePolicyService.findAllRecords({
        attributes: [
          'id',
          'enrollment_event_id',
          'surcharge_type_id',
          'student_id',
          'reason',
          'total_amount_revoked',
          'revoked_category',
          'approval_remarks',
          'created_at',
          'deleted_at',
          'created_by_id',
          'create_approved_by_id',
          'deleted_by_id',
          'delete_approved_by_id',
          'delete_approval_status',
        ],
        include: [
          {
            association: 'event',
            attributes: ['id', 'event_id', 'start_date', 'end_date'],
            include: [
              {
                association: 'event',
                attributes: ['metadata_value'],
              },
              {
                association: 'academicYear',
                attributes: [
                  'academic_year_id',
                  'academic_year_id',
                  'start_date',
                  'end_date',
                ],
                include: [
                  {
                    association: 'academicYear',
                    attributes: ['metadata_value'],
                  },
                ],
              },
              {
                association: 'semester',
                attributes: ['id', 'semester_id'],
                include: [
                  {
                    association: 'semester',
                    attributes: ['metadata_value'],
                  },
                ],
              },
            ],
          },
          {
            association: 'surchargeType',
            attributes: ['metadata_value'],
          },
          {
            association: 'student',
            attributes: [
              'surname',
              'other_names',

              'registration_number',
              'student_number',
            ],
            include: [
              {
                association: 'programme',
                attributes: ['programme_code', 'programme_title'],

                include: [
                  {
                    association: 'department',
                    attributes: ['department_title'],

                    include: [
                      {
                        association: 'faculty',
                        attributes: ['faculty_title'],

                        include: [
                          {
                            association: 'college',
                            attributes: ['college_title'],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            association: 'createdBy',
            attributes: ['surname', 'other_names'],
          },
          {
            association: 'createApprovedBy',
            attributes: ['surname', 'other_names'],
          },
          {
            association: 'deletedBy',
            attributes: ['surname', 'other_names'],
          },
          {
            association: 'deleteApprovedBy',
            attributes: ['surname', 'other_names'],
          },
        ],
      });

      http.setSuccess(
        200,
        'All Revoke Surcharge Invoice Requests Fetched Successfully',
        {
          data: records,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable To Fetch All Revoke Surcharge Invoice Requests',
        {
          error: { message: error.message },
        }
      );

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
  async createRecord(req, res) {
    try {
      const data = req.body;
      const { id } = req.user;

      data.created_by_id = id;

      const metadataValues = await metadataValueService.findAllMetadataValues({
        include: {
          association: 'metadata',
          attributes: ['id', 'metadata_name'],
        },
        attributes: ['id', 'metadata_value'],
      });

      const surchargeName = getMetadataValueName(
        metadataValues,
        data.surcharge_type_id,
        'SURCHARGE TYPES'
      );

      if (
        toUpper(trim(surchargeName)) !== 'LATE FEES PAYMENT' &&
        toUpper(trim(surchargeName)) !== 'LATE REGISTRATION'
      ) {
        if (
          data.apply_to_entry_years === true ||
          data.apply_to_entry_years === 'true'
        ) {
          throw new Error(
            'This Feature Only Currently Applies To LATE FEES PAYMENT AND LATE REGISTRATION.'
          );
        }
      }

      if (
        toUpper(trim(surchargeName)) === 'LATE FEES PAYMENT' ||
        toUpper(trim(surchargeName)) === 'LATE REGISTRATION'
      ) {
        data.bill_by_current_semester = true;
        data.is_time_bound = true;

        if (!data.duration_measure_id) {
          throw new Error('This process Requires A Duration Measure.');
        }

        if (
          data.apply_to_entry_years === true ||
          data.apply_to_entry_years === 'true'
        ) {
          if (!data.policy_entry_years) {
            throw new Error(
              'Please Provide The Entry Years To Which This Policy Applies.'
            );
          }

          data.entryYears = data.policy_entry_years;
        } else {
          if (!data.duration) {
            throw new Error('LATE FEES PAYMENT requires a duration.');
          }
        }
      }

      const checkIfOtherFeesElementIsAssigned =
        await otherFeesAmountService.findOneOtherFeesAmountFeesElementRecord({
          where: {
            fees_element_id: data.other_fees_element_id,
          },
          attributes: ['id', 'fees_element_id', 'amount'],
        });

      if (!checkIfOtherFeesElementIsAssigned) {
        throw new Error(
          'The Other Fees Element Chosen Has Not Been Assigned An Amount Yet.'
        );
      }

      const result = await model.sequelize.transaction(async (transaction) => {
        const result = await surchargePolicyService.createRecord(
          data,
          transaction
        );

        return result;
      });

      http.setSuccess(200, 'Surcharge Policy Created Successfully.', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Create This Surcharge Policy.', {
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
  async updateRecord(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      const entryAcademicYears = [];

      if (!isEmpty(data.policy_entry_years)) {
        data.policy_entry_years.forEach((year) => {
          entryAcademicYears.push({
            surcharge_policy_id: id,
            ...year,
          });
        });

        data.apply_to_entry_years = true;
      }

      const result = await model.sequelize.transaction(async (transaction) => {
        const updateRecord = await surchargePolicyService.updateRecord(
          id,
          data,
          transaction
        );
        const surchargePolicy = updateRecord[1][0];

        await handleUpdatingPivots(id, entryAcademicYears, transaction);

        return surchargePolicy;
      });

      http.setSuccess(200, 'Surcharge Policy Record Updated Successfully', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Update This Surcharge Policy Record', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * requestRevokeSurchargeInvoices
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async requestRevokeSurchargeInvoices(req, res) {
    try {
      const data = req.body;
      const userId = req.user.id;

      data.created_by_id = userId;

      if (!isEmpty(data.student_id)) {
        data.revoked_category = 'INDIVIDUAL STUDENT';
        const enrollments = await enrollmentService.findAllRecords({
          where: {
            event_id: data.enrollment_event_id,
            student_id: data.student_id,
          },
          attributes: ['id'],
        });

        if (isEmpty(enrollments)) {
          throw new Error(
            'This Student Has No Record Of Being Enrolled In this Enrollment Event.'
          );
        }

        const otherFeesInvoice =
          await invoiceService.findOneOtherFeesInvoiceRecords({
            where: {
              enrollment_id: enrollments.id,
              other_fees_category_id: data.surcharge_type_id,
            },
            attributes: [
              'id',
              'enrollment_id',
              'invoice_type_id',
              'other_fees_category_id',
              'invoice_amount',
              'amount_paid',
              'amount_due',
              'percentage_completion',
            ],
          });

        const paymentReferenceOtherFeesInvoice =
          await paymentReferenceService.paymentReferenceOtherFeesInvoice({
            where: {
              other_fees_invoice_id: otherFeesInvoice.id,
            },
            attributes: [
              'id',
              'payment_reference_id',
              'other_fees_invoice_id',
              'amount',
            ],
          });

        data.total_amount_revoked = paymentReferenceOtherFeesInvoice.amount;

        const result =
          await surchargePolicyService.createRevokeSurchargeRequest(data);

        http.setSuccess(
          201,
          'Surcharge Invoices Revoke Request Submitted Successfully.',
          {
            data: result,
          }
        );

        return http.send(res);
      } else {
        data.revoked_category = 'ALL STUDENTS';
        const enrollments = await enrollmentService.findAllRecords({
          where: {
            event_id: data.enrollment_event_id,
          },
          attributes: ['id'],
        });

        if (isEmpty(enrollments)) {
          throw new Error('No Student Has Been Enrolled To This Event Yet.');
        }

        const newPayload = [];

        for (const eachObject of enrollments) {
          const otherFeesInvoice =
            await invoiceService.findOneOtherFeesInvoiceRecords({
              where: {
                enrollment_id: eachObject.id,
                other_fees_category_id: data.surcharge_type_id,
              },
              attributes: [
                'id',
                'enrollment_id',
                'other_fees_category_id',
                'invoice_type_id',
                'invoice_amount',
                'amount_paid',
                'amount_due',
                'percentage_completion',
              ],
            });

          const paymentReferenceOtherFeesInvoice =
            await paymentReferenceService.paymentReferenceOtherFeesInvoice({
              where: {
                other_fees_invoice_id: otherFeesInvoice.id,
              },
              attributes: [
                'id',
                'payment_reference_id',
                'other_fees_invoice_id',
                'amount',
              ],
            });

          newPayload.push(paymentReferenceOtherFeesInvoice);
        }

        data.total_amount_revoked = sumBy(newPayload, 'amount');

        const result =
          await surchargePolicyService.createRevokeSurchargeRequest(data);

        http.setSuccess(
          201,
          'Surcharge Invoices Revoke Request Submitted Successfully.',
          {
            data: result,
          }
        );

        return http.send(res);
      }
    } catch (error) {
      http.setError(
        400,
        'Unable To Submit Your Request To Revoke Surcharge Invoices',
        {
          error: { message: error.message },
        }
      );

      return http.send(res);
    }
  }

  /**
   * revokeSurchargeInvoices
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async revokeSurchargeInvoices(req, res) {
    try {
      const { revoke_surcharge_id: revokeSurchargeId } = req.params;

      const data = await surchargePolicyService.findOneRevokeSurchargeRequest({
        where: {
          id: revokeSurchargeId,
        },
        attributes: ['id', 'enrollment_event_id', 'surcharge_type_id'],
      });

      if (isEmpty(data)) {
        throw new Error(
          'Unable To Find A Revoke Surcharge Invoice Request With This Identity.'
        );
      }

      const enrollments = await enrollmentService.findAllRecords({
        where: {
          event_id: data.enrollment_event_id,
        },
        attributes: ['id'],
      });

      if (isEmpty(enrollments)) {
        throw new Error('No Student Has Been Enrolled To This Event Yet.');
      }

      await model.sequelize.transaction(async (transaction) => {
        for (const eachObject of enrollments) {
          const otherFeesInvoice =
            await invoiceService.findOneOtherFeesInvoiceRecords({
              where: {
                enrollment_id: eachObject.id,
                other_fees_category_id: data.surcharge_type_id,
              },
              attributes: [
                'id',
                'enrollment_id',
                'other_fees_category_id',
                'invoice_type_id',
                'invoice_amount',
                'amount_paid',
                'amount_due',
                'percentage_completion',
              ],
            });
          const paymentReferenceOtherFeesInvoice =
            await paymentReferenceService.paymentReferenceOtherFeesInvoice({
              where: {
                other_fees_invoice_id: otherFeesInvoice.id,
              },
              attributes: [
                'id',
                'payment_reference_id',
                'other_fees_invoice_id',
                'amount',
              ],
            });
          const paymentReference =
            await paymentReferenceService.findOnePaymentReference({
              where: {
                id: paymentReferenceOtherFeesInvoice.payment_reference_id,
              },
              attributes: [
                'id',
                'student_id',
                'reference_number',
                'reference_origin',
                'generated_by',
                'amount',
              ],
            });
          const paymentTransaction =
            await paymentTransactionService.findOneRecord({
              where: {
                reference_number: paymentReference.reference_number,
              },
              attributes: [
                'id',
                'reference_number',
                'amount_paid',
                'unallocated_amount',
                'amount_paid',
              ],
            });

          const updatedAmountPaid =
            paymentTransaction.amount_paid -
            paymentReferenceOtherFeesInvoice.amount;

          const updatedUnallocatedAmount =
            paymentReferenceOtherFeesInvoice.amount;

          await paymentTransactionService.updateRecordAfterRevokingSurcharges(
            paymentTransaction.id,
            updatedAmountPaid,
            updatedUnallocatedAmount,
            transaction
          );

          const deleteInvoice = {
            deleted_at: moment.now(),
            deleted_by_id: req.user.id,
          };

          await invoiceService.updateEnrollmentOtherFeesInvoice(
            otherFeesInvoice.id,
            deleteInvoice,
            transaction
          );
        }

        const dataToUpdate = {
          deletedById: req.user.id,
          deletedApprovedById: req.user.id,
          deleteApprovalDate: moment.now(),
        };

        await surchargePolicyService.updateRevokeSurchargeRequest(
          revokeSurchargeId,
          dataToUpdate,
          transaction
        );
      });
      http.setSuccess(200, 'Surcharge Invoices Revoked Successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Revoke Surcharge Invoices', {
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
  async deleteRecord(req, res) {
    try {
      const { id } = req.params;

      const findAllPolicyEntryYears =
        await surchargePolicyService.findAllSurchargePolicyEntryYears({
          where: {
            surcharge_policy_id: id,
          },
          raw: true,
        });

      await model.sequelize.transaction(async (transaction) => {
        const idsToDelete = [];

        if (!isEmpty(findAllPolicyEntryYears)) {
          findAllPolicyEntryYears.forEach((record) => {
            idsToDelete.push(record.id);
          });

          await surchargePolicyService.bulkRemoveSurchargePolicyEntryYears(
            idsToDelete,
            transaction
          );
        }

        await surchargePolicyService.deleteRecord(id, transaction);
      });

      http.setSuccess(200, 'Surcharge Policy Record Deleted Successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Delete This Surcharge Policy Record', {
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
  async addTuitionInvoiceDueDates(req, res) {
    try {
      const data = {};
      const { id } = req.user;

      data.last_updated_by_id = id;

      const metadataValues = await metadataValueService.findAllMetadataValues({
        include: {
          association: 'metadata',
          attributes: ['id', 'metadata_name'],
        },
        attributes: ['id', 'metadata_value'],
      });

      const findActiveInvoiceStatusId = getMetadataValueId(
        metadataValues,
        'ACTIVE',
        'INVOICE STATUSES'
      );

      const findAllTuitionInvoices = await invoiceService
        .findAllTuitionInvoices({
          where: {
            invoice_status_id: findActiveInvoiceStatusId,
            due_date: {
              [Op.is]: null,
            },
            amount_due: {
              [Op.gt]: 0,
            },
          },
          include: [
            {
              association: 'enrollment',
              attributes: ['id', 'event_id'],
              include: [
                {
                  association: 'event',
                  attributes: ['id', 'semester_id'],
                  include: [
                    {
                      association: 'semester',
                      attributes: ['id', 'start_date'],
                    },
                  ],
                },
              ],
            },
            {
              association: 'programme',
              attributes: ['id', 'entry_academic_year_id'],
            },
          ],
        })
        .then((res) => {
          if (res) {
            return res.map((item) => item.get({ plain: true }));
          }
        });

      const results = [];

      await model.sequelize.transaction(async (transaction) => {
        if (!isEmpty(findAllTuitionInvoices)) {
          for (const invoice of findAllTuitionInvoices) {
            const findDueDate = await findInvoiceDueDates(
              metadataValues,
              invoice.enrollment.event.semester.start_date,
              invoice.programme.entry_academic_year_id
            );

            if (findDueDate) {
              data.due_date = findDueDate.due_date;

              const update =
                await invoiceService.updateEnrollmentTuitionInvoice(
                  invoice.id,
                  data,
                  transaction
                );

              results.push(update[1][0]);
            }
          }
        }
      });

      http.setSuccess(
        200,
        'All Tuition Invoice Due Dates Updated Successfully.',
        { data: results }
      );

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Update Tuition Invoice Due Dates.', {
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
  async addFunctionalInvoiceDueDates(req, res) {
    try {
      const data = {};
      const { id } = req.user;

      data.last_updated_by_id = id;

      const metadataValues = await metadataValueService.findAllMetadataValues({
        include: {
          association: 'metadata',
          attributes: ['id', 'metadata_name'],
        },
        attributes: ['id', 'metadata_value'],
      });

      const findActiveInvoiceStatusId = getMetadataValueId(
        metadataValues,
        'ACTIVE',
        'INVOICE STATUSES'
      );

      const findAllTuitionInvoices = await invoiceService
        .findAllFunctionalFeesInvoices({
          where: {
            invoice_status_id: findActiveInvoiceStatusId,
            due_date: {
              [Op.is]: null,
            },
            amount_due: {
              [Op.gt]: 0,
            },
          },
          include: [
            {
              association: 'enrollment',
              attributes: ['id', 'event_id'],
              include: [
                {
                  association: 'event',
                  attributes: ['id', 'semester_id'],
                  include: [
                    {
                      association: 'semester',
                      attributes: ['id', 'start_date'],
                    },
                  ],
                },
              ],
            },
            {
              association: 'programme',
              attributes: ['id', 'entry_academic_year_id'],
            },
          ],
        })
        .then((res) => {
          if (res) {
            return res.map((item) => item.get({ plain: true }));
          }
        });

      const results = [];

      await model.sequelize.transaction(async (transaction) => {
        if (!isEmpty(findAllTuitionInvoices)) {
          for (const invoice of findAllTuitionInvoices) {
            const findDueDate = await findInvoiceDueDates(
              metadataValues,
              invoice.enrollment.event.semester.start_date,
              invoice.programme.entry_academic_year_id
            );

            if (findDueDate) {
              data.due_date = findDueDate.due_date;

              const update =
                await invoiceService.updateEnrollmentFunctionalInvoice(
                  invoice.id,
                  data,
                  transaction
                );

              results.push(update[1][0]);
            }
          }
        }
      });

      http.setSuccess(
        200,
        'All Functional Invoice Due Dates Updated Successfully.',
        { data: results }
      );

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Update Functional Invoice Due Dates.', {
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
  async addEnrollmentRegistrationDueDates(req, res) {
    try {
      const data = {};
      const { id } = req.user;

      data.last_updated_by_id = id;

      const metadataValues = await metadataValueService.findAllMetadataValues({
        include: {
          association: 'metadata',
          attributes: ['id', 'metadata_name'],
        },
        attributes: ['id', 'metadata_value'],
      });

      const findAllEnrollments = await enrollmentService
        .findAllRecords({
          where: {
            is_active: true,
            reg_due_date: {
              [Op.is]: null,
            },
          },
          include: [
            {
              association: 'event',
              attributes: ['id', 'semester_id'],
              include: [
                {
                  association: 'semester',
                  attributes: ['id', 'start_date'],
                },
              ],
            },
            {
              association: 'programme',
              attributes: ['id', 'entry_academic_year_id'],
            },
          ],
        })
        .then((res) => {
          if (res) {
            return res.map((item) => item.get({ plain: true }));
          }
        });

      const results = [];

      await model.sequelize.transaction(async (transaction) => {
        if (!isEmpty(findAllEnrollments)) {
          for (const enrollment of findAllEnrollments) {
            const findDueDate = await findRegistrationDueDate(
              metadataValues,
              enrollment.event.semester.start_date,
              enrollment.programme.entry_academic_year_id
            );

            if (findDueDate) {
              data.reg_due_date = findDueDate.due_date;

              const update = await enrollmentService.updateRecord(
                enrollment.id,
                data,
                transaction
              );

              results.push(update[1][0]);
            }
          }
        }
      });

      http.setSuccess(200, 'All Enrollment Due Dates Updated Successfully.', {
        data: results,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Update Enrollment Due Dates.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

/**
 *
 * @param {*} surchargePolicyId
 * @param {*} entryAcademicYears
 * @param {*} transaction
 */
const handleUpdatingPivots = async function (
  surchargePolicyId,
  entryAcademicYears,
  transaction
) {
  try {
    if (!isEmpty(entryAcademicYears)) {
      await deleteOrCreateElements(
        entryAcademicYears,
        'findAllSurchargePolicyEntryYears',
        'bulkCreateSurchargePolicyEntryYears',
        'bulkRemoveSurchargePolicyEntryYears',
        'updateSurchargePolicyEntryYears',
        'entry_academic_year_id',
        surchargePolicyId,
        transaction
      );
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} firstElements
 * @param {*} findAllService
 * @param {*} insertService
 * @param {*} deleteService
 * @param {*} updateService
 * @param {*} firstField
 * @param {*} surchargePolicyId
 * @param {*} transaction
 * @returns
 */
const deleteOrCreateElements = async (
  firstElements,
  findAllService,
  insertService,
  deleteService,
  updateService,
  firstField,
  surchargePolicyId,
  transaction
) => {
  const elementsToDelete = [];
  const elementsToInsert = [];
  const elementsToUpdate = [];

  const secondElements = await surchargePolicyService[findAllService]({
    where: {
      surcharge_policy_id: surchargePolicyId,
    },
    attributes: ['id', 'surcharge_policy_id', firstField, 'duration'],
    raw: true,
  });

  firstElements.forEach((firstElement) => {
    const myElement = secondElements.find(
      (secondElement) =>
        parseInt(firstElement[firstField], 10) ===
          parseInt(secondElement[firstField], 10) &&
        parseInt(firstElement.surcharge_policy_id, 10) ===
          parseInt(secondElement.surcharge_policy_id, 10)
    );

    if (!myElement) {
      elementsToInsert.push(firstElement);
    } else {
      const locateContextId = secondElements.find(
        (value) =>
          parseInt(value.surcharge_policy_id, 10) ===
            parseInt(firstElement.surcharge_policy_id, 10) &&
          value[firstField] === firstElement[firstField]
      );

      elementsToUpdate.push({ id: locateContextId.id, ...firstElement });
    }
  });

  secondElements.forEach((secondElement) => {
    const myElement = firstElements.find(
      (firstElement) =>
        parseInt(firstElement[firstField], 10) ===
          parseInt(secondElement[firstField], 10) &&
        parseInt(firstElement.surcharge_policy_id, 10) ===
          parseInt(secondElement.surcharge_policy_id, 10)
    );

    if (!myElement) elementsToDelete.push(secondElement.id);
  });

  if (!isEmpty(elementsToInsert)) {
    await surchargePolicyService[insertService](elementsToInsert, transaction);
  }

  if (!isEmpty(elementsToDelete)) {
    await surchargePolicyService[deleteService](elementsToDelete, transaction);
  }

  if (!isEmpty(elementsToUpdate)) {
    for (const item of elementsToUpdate) {
      await surchargePolicyService[updateService](item.id, item, transaction);
    }
  }

  return { elementsToDelete, elementsToInsert };
};

module.exports = SurchargePolicyController;
