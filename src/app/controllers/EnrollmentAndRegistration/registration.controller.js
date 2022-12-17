const {
  getMetadataValueId,
  getMetadataValueName,
} = require('@controllers/Helpers/programmeHelper');
const { HttpResponse } = require('@helpers');
const {
  registrationService,
  eventService,
  studentService,
  enrollmentService,
  metadataValueService,
  studentProgrammeService,
  // graduationListService,
} = require('@services/index');
const { isEmpty, toUpper, trim } = require('lodash');
const moment = require('moment');
const XLSX = require('xlsx');
const formidable = require('formidable');
const model = require('@models');
const {
  getCourseUnits,
  registerThisStudent,
  lateRegistration,
  studentProgrammeAttributes,
  handleUpdatingRegistredCourseUnits,
} = require('../Helpers/registrationHelper');

const {
  handleDeEnrollingPaidTuitionInvoices,
  handleDeEnrollingUnPaidTuitionInvoices,
  handleDeEnrollingPaidOtherFeesFeesInvoices,
  handleDeEnrollingUnPaidOtherFeesFeesInvoices,
} = require('../Helpers/enrollmentRecord');

const {
  examinationCardConstraints,
} = require('../Helpers/policyConstraintsHelper');
const {
  validateSheetColumns,
} = require('@controllers/Helpers/uploadValidator');

const http = new HttpResponse();

class RegistrationController {
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
      const records = await registrationService.findAllRecords({
        // ...getRegistrationAttributes(),
      });

      http.setSuccess(200, 'All Registration Records Fetched Successfully', {
        records,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch All Registration Records', {
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
  async createRegistrationByStaff(req, res) {
    try {
      const data = req.body;
      const staffId = req.user.id;

      data.registered_by = 'STAFF';
      data.created_by_id = staffId;
      data.registration_condition = 'EARLY REGISTRATION';

      const registration = await registerThisStudent(data);

      http.setSuccess(201, 'Student Registered successfully', {
        data: registration,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, error.message);

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   */
  async createLateRegistrationByStaff(req, res) {
    try {
      const { studentId } = req.params;
      const data = req.body;
      const staffId = req.user.id;

      data.student_id = studentId;
      data.registered_by = 'STAFF';
      data.created_by_id = staffId;
      data.registration_condition = 'LATE REGISTRATION';

      if (!data.comment) {
        throw new Error(
          'Please provide a comment to justify this late (past) registration.'
        );
      }

      const register = await lateRegistration(data);

      http.setSuccess(201, 'Student Registered successfully', {
        data: register,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, error.message);

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   */
  async deRegisterAStudent(req, res) {
    try {
      const user = req.user.id;
      const { studentId } = req.params;
      const data = req.body;

      const student = await studentService.findOneStudent({
        where: {
          id: studentId,
        },
        attributes: ['id', 'student_account_status_id'],
        raw: true,
      });

      if (!student) {
        throw new Error('Unable To Find This Student.');
      }

      const metadataValues = await metadataValueService.findAllMetadataValues({
        include: ['metadata'],
      });

      const activeAccountStatusId = getMetadataValueId(
        metadataValues,
        'ACTIVE',
        'STUDENT ACCOUNT STATUSES'
      );

      if (
        parseInt(student.student_account_status_id, 10) !==
        parseInt(activeAccountStatusId, 10)
      ) {
        throw new Error(
          'You Can Only De-Register A Student With An Active Account Status.'
        );
      }

      const registrationRecord = await registrationService
        .findOneRecord({
          where: {
            id: data.registration_id,
            student_id: student.id,
            student_programme_id: data.student_programme_id,
          },
          ...getStudentRegistrationAttributes(),
          nest: true,
        })
        .then((res) => {
          if (res) {
            return res.toJSON();
          }
        });

      if (!registrationRecord) {
        throw new Error(
          `Unable To Find The Registration Record Matching This Student's details.`
        );
      }

      if (registrationRecord.is_active === false) {
        throw new Error(
          'The student is already de-registered from the registration record provided.'
        );
      }

      const findActiveInvoiceStatusId = getMetadataValueId(
        metadataValues,
        'ACTIVE',
        'INVOICE STATUSES'
      );

      const findVoidedInvoiceStatusId = getMetadataValueId(
        metadataValues,
        'VOIDED',
        'INVOICE STATUSES'
      );

      const paymentTransactionData = {
        student_id: studentId,
        student_programme_id: registrationRecord.student_programme_id,
        academic_year_id: registrationRecord.event.academic_year_id,
        semester_id: registrationRecord.event.semester_id,
        study_year_id: registrationRecord.enrollment.study_year_id,
        system_prn: null,
        amount_paid: null,
        unallocated_amount: null,
        transaction_origin: null,
        currency: null,
        narration: null,
        payment_date: null,
        created_by_id: user,
        create_approval_status: 'APPROVED',
      };

      const voidedInvoiceData = {
        invoice_status_id: findVoidedInvoiceStatusId,
        amount_paid: 0,
        amount_due: 0,
        percentage_completion: 0,
        deleted_at: moment.now(),
        deleted_by_id: user,
      };

      const voidedRegistrationData = {
        deleted_at: moment.now(),
        deleted_by_id: user,
        is_active: false,
        comment: data.comment,
      };

      const tuitionInvoiceRetakes = [];
      const otherInvoiceRetakes = [];

      registrationRecord.courseUnits.forEach((course) => {
        const tuitionInvoices =
          registrationRecord.enrollment.tuitionInvoice.filter(
            (invoice) =>
              toUpper(trim(invoice.description)).includes(
                toUpper(trim(course.courseUnit.course_unit_code))
              ) &&
              parseInt(invoice.invoice_status_id, 10) ===
                parseInt(findActiveInvoiceStatusId, 10)
          );

        const otherInvoices =
          registrationRecord.enrollment.otherFeesInvoice.filter(
            (invoice) =>
              toUpper(trim(invoice.description)).includes(
                toUpper(trim(course.courseUnit.course_unit_code))
              ) &&
              parseInt(invoice.invoice_status_id, 10) ===
                parseInt(findActiveInvoiceStatusId, 10)
          );

        if (!isEmpty(tuitionInvoices)) {
          tuitionInvoiceRetakes.push(...tuitionInvoices);
        }

        if (!isEmpty(otherInvoices)) {
          otherInvoiceRetakes.push(...otherInvoices);
        }
      });

      const studentProgramme = await studentService.findOneStudentProgramme({
        where: {
          id: data.student_programme_id,
          student_id: studentId,
        },
        attributes: ['id', 'student_id', 'is_current_programme'],

        raw: true,
      });

      if (studentProgramme.is_current_programme === false) {
        throw new Error(
          'You Can Only De-Register A Student From Their Current Programme.'
        );
      }

      // const findGradListRecord =
      //   await graduationListService.findOneProvisionalGraduationListRecord({
      //     where: {
      //       student_programme_id: studentProgramme.id,
      //     },
      //     raw: true,
      //   });

      // if (findGradListRecord) {
      //   throw new Error(
      //     `This Action Cannot Be Performed On A Student With A Record In The Graduation Lists.`
      //   );
      // }

      const updateRecord = await model.sequelize.transaction(
        async (transaction) => {
          const updateRecord = await registrationService.updateRecord(
            registrationRecord.id,
            voidedRegistrationData,
            transaction
          );

          if (!isEmpty(tuitionInvoiceRetakes)) {
            const paidInvoices = tuitionInvoiceRetakes.filter(
              (invoice) => parseInt(invoice.amount_paid, 10) > 0
            );

            const unpaidInvoices = tuitionInvoiceRetakes.filter(
              (invoice) => parseInt(invoice.amount_paid, 10) <= 0
            );

            if (!isEmpty(paidInvoices)) {
              await handleDeEnrollingPaidTuitionInvoices(
                paidInvoices,
                paymentTransactionData,
                voidedInvoiceData,
                studentId,
                registrationRecord.student_programme_id,
                user,
                transaction
              );
            }

            if (!isEmpty(unpaidInvoices)) {
              await handleDeEnrollingUnPaidTuitionInvoices(
                unpaidInvoices,
                voidedInvoiceData,
                transaction
              );
            }
          }

          if (!isEmpty(otherInvoiceRetakes)) {
            const paidInvoices = otherInvoiceRetakes.filter(
              (invoice) => parseInt(invoice.amount_paid, 10) > 0
            );

            const unpaidInvoices = otherInvoiceRetakes.filter(
              (invoice) => parseInt(invoice.amount_paid, 10) <= 0
            );

            if (!isEmpty(paidInvoices)) {
              await handleDeEnrollingPaidOtherFeesFeesInvoices(
                paidInvoices,
                paymentTransactionData,
                voidedInvoiceData,
                studentId,
                registrationRecord.student_programme_id,
                user,
                transaction
              );
            }

            if (!isEmpty(unpaidInvoices)) {
              await handleDeEnrollingUnPaidOtherFeesFeesInvoices(
                unpaidInvoices,
                voidedInvoiceData,
                transaction
              );
            }
          }

          return updateRecord[1][0];
        }
      );

      http.setSuccess(200, 'Student De-Registered Successfully.', {
        data: updateRecord,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To De-Register this Student.', {
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
  async deRegisterBatchStudentsFromTemplate(req, res) {
    try {
      const { id: userId } = req.user;

      const metadataValues = await metadataValueService.findAllMetadataValues({
        include: ['metadata'],
      });

      const form = new formidable.IncomingForm();

      form.parse(req, async (err, fields, files) => {
        if (err) {
          http.setError(400, 'Unable to upload Subject Combinations.', {
            error: { err },
          });

          return http.send(res);
        }

        const file = files[Object.keys(files)[0]];

        const workbook = XLSX.readFile(file.filepath, { cellDates: true });
        const subjectCombSheet = workbook.SheetNames[0];
        const studentsToDeRegister = XLSX.utils.sheet_to_json(
          workbook.Sheets[subjectCombSheet]
        );

        if (isEmpty(studentsToDeRegister)) {
          http.setError(400, 'Cannot upload an Empty template.');

          return http.send(res);
        }

        const deRegisteredRecords = [];

        await model.sequelize.transaction(async (transaction) => {
          for (const studentSheet of studentsToDeRegister) {
            validateSheetColumns(
              studentSheet,
              ['student_number'],
              'STUDENT RECORD'
            );

            const studentNumber = studentSheet.student_number.toString();

            const studentProgramme = await studentProgrammeService.findOne({
              where: {
                student_number: studentNumber,
              },
              attributes: ['id', 'student_id', 'is_current_programme'],
              raw: true,
            });

            if (!studentProgramme) {
              throw new Error(
                `Unable To Find This Student Number: ${studentNumber}.`
              );
            }

            const registrationRecord = await registrationService
              .findOneRecord({
                where: {
                  event_id: 24,
                  student_id: studentProgramme.student_id,
                  student_programme_id: studentProgramme.id,
                  is_active: true,
                },
                ...getStudentRegistrationAttributes(),
                nest: true,
              })
              .then((res) => {
                if (res) {
                  return res.toJSON();
                }
              });

            if (registrationRecord) {
              const findActiveInvoiceStatusId = getMetadataValueId(
                metadataValues,
                'ACTIVE',
                'INVOICE STATUSES'
              );

              const findVoidedInvoiceStatusId = getMetadataValueId(
                metadataValues,
                'VOIDED',
                'INVOICE STATUSES'
              );

              const paymentTransactionData = {
                student_id: studentProgramme.student_id,
                student_programme_id: registrationRecord.student_programme_id,
                academic_year_id: registrationRecord.event.academic_year_id,
                semester_id: registrationRecord.event.semester_id,
                study_year_id: registrationRecord.enrollment.study_year_id,
                system_prn: null,
                amount_paid: null,
                unallocated_amount: null,
                transaction_origin: null,
                currency: null,
                narration: null,
                payment_date: null,
                created_by_id: userId,
                create_approval_status: 'APPROVED',
              };

              const voidedInvoiceData = {
                invoice_status_id: findVoidedInvoiceStatusId,
                amount_paid: 0,
                amount_due: 0,
                percentage_completion: 0,
                deleted_at: moment.now(),
                deleted_by_id: userId,
              };

              const voidedRegistrationData = {
                deleted_at: moment.now(),
                deleted_by_id: userId,
                is_active: false,
                comment: 'CLEARING ALL INFINITY INVOICES',
              };

              const tuitionInvoiceRetakes = [];
              const otherInvoiceRetakes = [];

              registrationRecord.courseUnits.forEach((course) => {
                const tuitionInvoices =
                  registrationRecord.enrollment.tuitionInvoice.filter(
                    (invoice) =>
                      toUpper(trim(invoice.description)).includes(
                        toUpper(trim(course.courseUnit.course_unit_code))
                      ) &&
                      parseInt(invoice.invoice_status_id, 10) ===
                        parseInt(findActiveInvoiceStatusId, 10)
                  );

                const otherInvoices =
                  registrationRecord.enrollment.otherFeesInvoice.filter(
                    (invoice) =>
                      toUpper(trim(invoice.description)).includes(
                        toUpper(trim(course.courseUnit.course_unit_code))
                      ) &&
                      parseInt(invoice.invoice_status_id, 10) ===
                        parseInt(findActiveInvoiceStatusId, 10)
                  );

                if (!isEmpty(tuitionInvoices)) {
                  tuitionInvoiceRetakes.push(...tuitionInvoices);
                }

                if (!isEmpty(otherInvoices)) {
                  otherInvoiceRetakes.push(...otherInvoices);
                }
              });

              if (studentProgramme.is_current_programme === false) {
                throw new Error(
                  'You Can Only De-Register A Student From Their Current Programme.'
                );
              }

              const updateRecord = await registrationService.updateRecord(
                registrationRecord.id,
                voidedRegistrationData,
                transaction
              );

              if (!isEmpty(tuitionInvoiceRetakes)) {
                const paidInvoices = tuitionInvoiceRetakes.filter(
                  (invoice) => parseInt(invoice.amount_paid, 10) > 0
                );

                const unpaidInvoices = tuitionInvoiceRetakes.filter(
                  (invoice) => parseInt(invoice.amount_paid, 10) <= 0
                );

                if (!isEmpty(paidInvoices)) {
                  await handleDeEnrollingPaidTuitionInvoices(
                    paidInvoices,
                    paymentTransactionData,
                    voidedInvoiceData,
                    studentProgramme.student_id,
                    registrationRecord.student_programme_id,
                    userId,
                    transaction
                  );
                }

                if (!isEmpty(unpaidInvoices)) {
                  await handleDeEnrollingUnPaidTuitionInvoices(
                    unpaidInvoices,
                    voidedInvoiceData,
                    transaction
                  );
                }
              }

              if (!isEmpty(otherInvoiceRetakes)) {
                const paidInvoices = otherInvoiceRetakes.filter(
                  (invoice) => parseInt(invoice.amount_paid, 10) > 0
                );

                const unpaidInvoices = otherInvoiceRetakes.filter(
                  (invoice) => parseInt(invoice.amount_paid, 10) <= 0
                );

                if (!isEmpty(paidInvoices)) {
                  await handleDeEnrollingPaidOtherFeesFeesInvoices(
                    paidInvoices,
                    paymentTransactionData,
                    voidedInvoiceData,
                    studentProgramme.student_id,
                    registrationRecord.student_programme_id,
                    userId,
                    transaction
                  );
                }

                if (!isEmpty(unpaidInvoices)) {
                  await handleDeEnrollingUnPaidOtherFeesFeesInvoices(
                    unpaidInvoices,
                    voidedInvoiceData,
                    transaction
                  );
                }
              }

              deRegisteredRecords.push(updateRecord[1][0]);
            }
          }
        });

        http.setSuccess(200, 'Students De-Registered Successfully.', {
          data: deRegisteredRecords,
          affected: deRegisteredRecords.length,
        });

        return http.send(res);
      });
    } catch (error) {
      http.setError(400, 'Unable To De-Register this Student.', {
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

      data.applicant_id = parseInt(req.user.id, 10);
      const updateRecord = await model.sequelize.transaction(
        async (transaction) => {
          const updateRecord = await registrationService.updateRecord(
            id,
            data,
            transaction
          );

          return updateRecord[1][0];
        }
      );

      http.setSuccess(200, 'Registration Record Updated Successfully', {
        data: updateRecord,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Update This Registration Record', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Get All Records By Student Id.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async fetchAllRegistrationRecordsByStudentId(req, res) {
    try {
      const { studentProgrammeId } = req.params;
      const data =
        await registrationService.registrationHistoryCourseUnitsByStudent(
          studentProgrammeId
        );

      http.setSuccess(200, 'Registration Records Fetched Successfully', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, "Unable to get this Student's Registration Records", {
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
  async getRegistrationEventCourseUnits(req, res) {
    try {
      const { studentProgrammeId } = req.params;

      const studentProgramme = await studentService
        .findOneStudentProgramme({
          where: {
            id: studentProgrammeId,
          },
          attributes: [
            'id',
            'student_id',
            'campus_id',
            'entry_academic_year_id',
            'entry_study_year_id',
            'current_study_year_id',
            'intake_id',
            'programme_id',
            'programme_version_id',
            'programme_version_plan_id',
            'specialization_id',
            'subject_combination_id',
            'major_subject_id',
            'minor_subject_id',
            'programme_type_id',
            'billing_category_id',
            'fees_waiver_id',
            'is_current_programme',
          ],
          include: [
            {
              association: 'currentStudyYear',
              attributes: ['programme_study_years'],
            },
            {
              association: 'programme',
              attributes: [
                'id',
                'programme_study_level_id',
                'is_modular',
                'programme_duration',
                'duration_measure_id',
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
                'has_plan',
                'has_subject_combination_categories',
                'has_specializations',
                'specialization_semester_id',
                'specialization_year_id',
                'subject_combination_semester_id',
                'subject_combination_year_id',
                'is_current_version',
              ],
              include: [
                {
                  association: 'versionEntryYears',
                  separate: true,
                  attributes: ['id', 'entry_year_id', 'graduation_load'],
                },
                {
                  association: 'versionPlans',
                  separate: true,
                  attributes: [
                    'id',
                    'graduation_load',
                    'plan_semester_id',
                    'plan_study_year_id',
                  ],
                },
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
          nest: true,
        })
        .then(function (res) {
          if (res) {
            const result = res.toJSON();

            return result;
          }
        });

      if (!studentProgramme) {
        throw new Error('Academic Record Does Not Exist.');
      }

      const studentCampusId = studentProgramme.campus_id;
      const studentEntryAcademicYearId =
        studentProgramme.entry_academic_year_id;
      const studentIntakeId = studentProgramme.intake_id;

      const registrationEvent = await eventService
        .findOneEventWithEventsView(
          studentCampusId,
          studentIntakeId,
          studentEntryAcademicYearId,
          "'REGISTRATION'",
          "'KEY EVENT'"
        )
        .then((res) => {
          if (isEmpty(res)) {
            throw new Error(
              'There Is Currently No Registration Event Running At This Time.'
            );
          }

          return res;
        });

      const enrollmentEvent = await eventService
        .findOneEventWithEventsView(
          studentCampusId,
          studentIntakeId,
          studentEntryAcademicYearId,
          "'ENROLLMENT'",
          "'KEY EVENT'"
        )
        .then((res) => {
          if (isEmpty(res)) {
            throw new Error(
              'There Is Currently No Enrollment Event Running At This Time.'
            );
          }

          return res[0];
        });

      const enrollmentRecord = await enrollmentService
        .findOneRecord({
          where: {
            event_id: enrollmentEvent.id,
            student_programme_id: studentProgramme.id,
            is_active: true,
          },
          ...getStudentEnrollmentAttributes(),
          nest: true,
        })
        .then(function (res) {
          if (res) {
            const result = res.toJSON();

            return result;
          }
        });

      let result = [];

      // if (studentProgramme.programme.is_modular === true) {
      //   // Do something
      // } else {
      //   result = await getCourseUnits(registrationEvent[0], studentProgramme);
      // }

      result = await getCourseUnits(registrationEvent[0], studentProgramme);

      if (enrollmentRecord) {
        if (!isEmpty(enrollmentRecord.retakes)) {
          result.invoiced_course_units = enrollmentRecord.retakes;
        }
      }

      http.setSuccess(200, 'Course Units fetched successfully.', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Get Your Course Units.', {
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
  async getLateRegistrationCourseUnits(req, res) {
    try {
      const { studentProgrammeId, semesterId } = req.params;

      const studentProgramme = await studentService
        .findOneStudentProgramme({
          where: {
            id: studentProgrammeId,
          },
          attributes: [
            'id',
            'student_id',
            'campus_id',
            'entry_academic_year_id',
            'entry_study_year_id',
            'current_study_year_id',
            'intake_id',
            'programme_id',
            'programme_version_id',
            'programme_version_plan_id',
            'specialization_id',
            'subject_combination_id',
            'major_subject_id',
            'minor_subject_id',
            'programme_type_id',
            'billing_category_id',
            'fees_waiver_id',
            'is_current_programme',
          ],
          include: [
            {
              association: 'currentStudyYear',
              attributes: ['programme_study_years'],
            },
            {
              association: 'programme',
              attributes: [
                'id',
                'programme_study_level_id',
                'is_modular',
                'programme_duration',
                'duration_measure_id',
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
                'has_plan',
                'has_subject_combination_categories',
                'has_specializations',
                'specialization_semester_id',
                'specialization_year_id',
                'subject_combination_semester_id',
                'subject_combination_year_id',
                'is_current_version',
              ],
              include: [
                {
                  association: 'versionEntryYears',
                  separate: true,
                  attributes: ['id', 'entry_year_id', 'graduation_load'],
                },
                {
                  association: 'versionPlans',
                  separate: true,
                  attributes: [
                    'id',
                    'graduation_load',
                    'plan_semester_id',
                    'plan_study_year_id',
                  ],
                },
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
          nest: true,
        })
        .then(function (res) {
          if (res) {
            const result = res.toJSON();

            return result;
          }
        });

      if (!studentProgramme) {
        throw new Error('Academic Record Does Not Exist.');
      }

      const enrollmentRecord = await enrollmentService
        .findOneRecord({
          where: {
            student_programme_id: studentProgramme.id,
            is_active: true,
          },
          ...getStudentEnrollmentAttributes(),
          nest: true,
        })
        .then(function (res) {
          if (res) {
            const result = res.toJSON();

            return result;
          }
        });

      let result = [];

      // if (studentProgramme.programme.is_modular === true) {
      //   // Do something
      // } else {
      //   result = await getCourseUnits(
      //     { semester_id: semesterId },
      //     studentProgramme
      //   );
      // }

      result = await getCourseUnits(
        { semester_id: semesterId },
        studentProgramme
      );

      if (enrollmentRecord) {
        if (!isEmpty(enrollmentRecord.retakes)) {
          result.invoiced_course_units = enrollmentRecord.retakes;
        }
      }

      http.setSuccess(200, 'Course Units fetched successfully.', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Get Your Course Units.', {
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
  async fetchAllRegistrationEventsForLateRegistration(req, res) {
    try {
      const { student_id: studentId } = req.params;

      const findStudent = await studentService
        .findOneStudent({
          where: { id: studentId },
          include: [
            {
              association: 'programmes',
              include: [
                {
                  association: 'programme',
                  attributes: ['id', 'programme_study_level_id'],
                  include: [
                    {
                      association: 'studyLevel',
                      attributes: ['id', 'metadata_value'],
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
              ],
            },
          ],
          nest: true,
        })
        .then(function (res) {
          if (res) {
            const result = res.toJSON();

            return result;
          }
        });

      if (!findStudent) {
        throw new Error('This Student does not exist.');
      }

      if (isEmpty(findStudent.programmes)) {
        throw new Error('This Student Has No Programmes');
      }

      const checkCurrentProg = findStudent.programmes.find(
        (prog) => prog.is_current_programme === true
      );

      if (isEmpty(checkCurrentProg)) {
        throw new Error('This Student Has No Current Programme.');
      }

      const studentCampusId = checkCurrentProg.campus_id;
      const studentEntryAcademicYearId =
        checkCurrentProg.entry_academic_year_id;
      const studentIntakeId = checkCurrentProg.intake_id;

      const registrationEvent = await eventService
        .findAllEventsWithEventsFunction(
          studentCampusId,
          studentIntakeId,
          studentEntryAcademicYearId,
          "'REGISTRATION'",
          "'KEY EVENT'"
        )
        .then((res) => {
          if (isEmpty(res)) {
            throw new Error(
              "There Are No Registration Events Matching This Student's Details."
            );
          }

          return res;
        });

      http.setSuccess(
        200,
        "Registration Events Matching This Student's Details Fetched Successfully.",
        {
          data: registrationEvent,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        "Unable To Get Registration Events Matching This Student's Details.",
        {
          error: { message: error.message },
        }
      );

      return http.send(res);
    }
  }

  /**
   *
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async updateCourseUnits(req, res) {
    try {
      const { registrationId } = req.params;
      const data = req.body;
      const user = req.user.id;

      const findRegistration = await registrationService
        .findOneRecord({
          where: {
            id: registrationId,
            is_active: true,
          },
          include: [
            {
              association: 'programme',
              ...studentProgrammeAttributes(),
            },
            {
              association: 'enrollment',
              ...getStudentEnrollmentAttributes(),
            },
          ],
          nest: true,
        })
        .then((res) => {
          if (res) {
            return res.toJSON();
          }
        });

      if (!findRegistration) {
        throw new Error(
          'The registration record provided has either been de-registered or does not exist.'
        );
      }

      const registrationEvent = await eventService.findOneEvent({
        where: {
          id: findRegistration.event_id,
        },
        include: {
          association: 'semester',
          attributes: ['id', 'start_date', 'end_date'],
          include: [
            {
              association: 'semester',
              attributes: ['metadata_value'],
            },
          ],
        },
        raw: true,
      });

      if (!registrationEvent) {
        throw new Error(
          `Unable To Find The Registration Event Of The Registration Record Provided.`
        );
      }

      const courseUnits = [];

      if (!isEmpty(data.course_units)) {
        data.course_units.forEach((course) => {
          courseUnits.push({
            ...course,
            registration_id: registrationId,
          });
        });
      }

      const metadataValues = await metadataValueService.findAllMetadataValues({
        include: {
          association: 'metadata',
          attributes: ['id', 'metadata_name'],
        },
        attributes: ['id', 'metadata_value'],
      });

      const enrollmentStatusValue = getMetadataValueName(
        metadataValues,
        findRegistration.enrollment.enrollment_status_id,
        'ENROLLMENT STATUSES'
      );

      await model.sequelize.transaction(async (transaction) => {
        await handleUpdatingRegistredCourseUnits(
          registrationId,
          courseUnits,
          findRegistration.enrollment.retakes,
          findRegistration.enrollment,
          findRegistration.student_id,
          findRegistration.programme,
          registrationEvent,
          user,
          enrollmentStatusValue,
          transaction
        );
      });

      http.setSuccess(200, 'Course Units Updated Successfully.');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Update Course Units.', {
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
  async getExamCardConstraints(req, res) {
    try {
      const { registrationId } = req.params;

      const findRegistrationRecord = await registrationService
        .findOneRecord({
          where: {
            id: registrationId,
          },
          include: [
            {
              association: 'student',
            },
            {
              association: 'programme',
            },
            {
              association: 'enrollment',
              ...getStudentEnrollmentAttributes(),
            },
          ],
          nest: true,
        })
        .then(function (res) {
          if (res) {
            const result = res.toJSON();

            return result;
          }
        });

      if (!findRegistrationRecord) {
        throw new Error(`The registration record provided doesnot exist.`);
      }

      if (findRegistrationRecord.is_active === false) {
        throw new Error(`This student's registration record is not active.`);
      }

      await examinationCardConstraints(findRegistrationRecord.enrollment);

      http.setSuccess(200, 'Examination Card Constraints Passed Successfully.');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable Pass Examination Card Constraints.', {
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

      await registrationService.deleteRecord(id);
      http.setSuccess(200, 'Registration Record Deleted Successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Delete This Registration Record', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

const getStudentEnrollmentAttributes = function () {
  return {
    attributes: {
      exclude: [
        'updated_at',
        'createdById',
        'createApprovedById',
        'lastUpdatedById',
        'lastUpdateApprovedById',
        'deletedById',
        'deleteApprovedById',
        'deleteApprovedById',
        'delete_approval_status',
        'delete_approval_date',
        'delete_approved_by_id',
        'last_update_approval_status',
        'last_update_approval_date',
        'last_update_approved_by_id',
        'last_updated_by_id',
        'create_approval_status',
        'create_approval_date',
        'create_approved_by_id',
      ],
    },
    include: [
      {
        association: 'enrollmentStatus',
        attributes: ['metadata_value'],
      },
      {
        association: 'studyYear',
        attributes: ['programme_study_year_id', 'programme_study_years'],
      },
      {
        association: 'event',
        attributes: ['id', 'event_id', 'academic_year_id', 'semester_id'],
        include: [
          {
            association: 'academicYear',
            attributes: ['id'],
          },
          {
            association: 'semester',
            attributes: ['id'],
          },
        ],
      },
      {
        association: 'retakes',
        include: [
          {
            association: 'courseUnit',
            attributes: ['id', 'course_unit_code', 'course_unit_name'],
          },
          {
            association: 'courseUnitStatus',
            attributes: ['id', 'metadata_value'],
          },
          {
            association: 'tuitionInvoice',
          },
          {
            association: 'otherFeesInvoice',
          },
        ],
      },
    ],
  };
};

const getStudentRegistrationAttributes = function () {
  return {
    attributes: {
      exclude: [
        'updated_at',
        'createdById',
        'createApprovedById',
        'lastUpdatedById',
        'lastUpdateApprovedById',
        'deletedById',
        'deleteApprovedById',
        'deleteApprovedById',
        'delete_approval_status',
        'delete_approval_date',
        'delete_approved_by_id',
        'last_update_approval_status',
        'last_update_approval_date',
        'last_update_approved_by_id',
        'last_updated_by_id',
        'create_approval_status',
        'create_approval_date',
        'create_approved_by_id',
      ],
    },
    include: [
      {
        association: 'event',
        attributes: ['id', 'event_id', 'academic_year_id', 'semester_id'],
        include: [
          {
            association: 'event',
            attributes: ['metadata_value'],
          },
          {
            association: 'academicYear',
            attributes: ['id', 'academic_year_id'],

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
        association: 'registrationType',
        attributes: ['metadata_value'],
      },
      {
        association: 'provisionalType',
        attributes: ['metadata_value'],
      },
      {
        association: 'courseUnits',
        attributes: [
          'id',
          'registration_id',
          'course_unit_id',
          'course_unit_status_id',
        ],
        include: [
          {
            association: 'courseUnit',
            attributes: ['id', 'course_unit_code', 'course_unit_name'],
          },
        ],
      },
      {
        association: 'enrollment',
        attributes: ['id', 'study_year_id'],
        include: [
          {
            association: 'tuitionInvoice',
          },
          {
            association: 'otherFeesInvoice',
          },
        ],
      },
    ],
  };
};

module.exports = RegistrationController;
