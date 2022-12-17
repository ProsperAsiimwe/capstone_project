const { HttpResponse } = require('@helpers');
const {
  enrollmentService,
  registrationService,
  eventService,
  studentService,
  paymentTransactionService,
  invoiceService,
  metadataValueService,
} = require('@services/index');
const { isEmpty, sumBy } = require('lodash');
const {
  enrollStudent,
  lateEnrollment,
  voidingAndDeAllocatingInvoices,
} = require('../Helpers/enrollmentRecord');
const model = require('@models');
const { getMetadataValueId } = require('../Helpers/programmeHelper');

const http = new HttpResponse();

class EnrollmentController {
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
      const records = await enrollmentService.findAllRecords({
        // ...getEnrollmentAttributes(),
      });

      http.setSuccess(200, 'All Enrollment Records Fetched Successfully', {
        records,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch All Enrollment Records', {
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
  async createEnrollmentByStaff(req, res) {
    try {
      const { studentId } = req.params;
      const data = req.body;
      const staffId = req.user.id;

      data.student_id = studentId;
      data.enrolled_by = 'STAFF';
      data.created_by_id = staffId;
      data.enrollment_condition = 'EARLY ENROLLMENT';

      const enrollment = await enrollStudent(data);

      http.setSuccess(200, 'Student Enrolled successfully', {
        data: enrollment,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Enroll This Student.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /** LateEnrollment
   *
   * @param {*} req
   * @param {*} res
   */
  async createLateEnrollmentByStaff(req, res) {
    try {
      const { studentId } = req.params;
      const data = req.body;
      const staffId = req.user.id;

      data.student_id = studentId;
      data.enrolled_by = 'STAFF';
      data.created_by_id = staffId;
      data.enrollment_condition = 'LATE ENROLLMENT';

      if (!data.comment) {
        throw new Error(
          'Please Provide A Comment To Justify This Late (Past) Enrollment.'
        );
      }

      const enrollment = await lateEnrollment(data);

      http.setSuccess(200, 'Student Enrolled successfully', {
        data: enrollment,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Enroll This Student.', {
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
      const updateRecord = await enrollmentService.updateRecord(id, data);
      const enrollment = updateRecord[1][0];

      http.setSuccess(200, 'Enrollment Record Updated Successfully', {
        data: enrollment,
      });
      if (isEmpty(enrollment))
        http.setError(404, 'Enrollment Record Data Not Found');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Update This Enrollment Record', {
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
  async fetchAllEnrollmentRecords(req, res) {
    try {
      const { studentProgrammeId } = req.params;
      const data = await enrollmentService.findAllRecords({
        where: {
          student_programme_id: studentProgrammeId,
          is_active: true,
        },
        order: [['created_at', 'DESC']],
        ...getEnrollmentAttributes(),
      });

      http.setSuccess(200, 'Enrollment Record Fetched Successfully', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to get this Enrollment Record', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Get All current semester.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async fetchCurrentSemester(req, res) {
    try {
      //  const { studentProgrammeId } = req.params;

      const user = req.user.id;

      const studentProgramme = await studentService
        .findOneStudentProgramme({
          where: {
            student_id: user,
            is_current_programme: true,
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
                  attributes: ['id', 'entry_year_id', 'graduation_load'],
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
        throw new Error('You Have No Current Academic Record.');
      }

      const currentAcademicYear = await eventService.studentAcademicYear({
        campus_id: studentProgramme.campus_id,
        intake_id: studentProgramme.intake_id,
        entry_academic_year_id: studentProgramme.entry_academic_year_id,
      });

      if (!currentAcademicYear) {
        throw new Error(
          `Unable To Find An Academic Year Running For Your Context.`
        );
      }

      // const metadataValues = await metadataValueService.findAllMetadataValues({
      //   include: {
      //     association: 'metadata',
      //     attributes: ['id', 'metadata_name'],
      //   },
      //   attributes: ['id', 'metadata_value'],
      // });

      // const enrollmentEventId = getMetadataValueId(
      //   metadataValues,
      //   'ENROLLMENT',
      //   'KEY EVENTS'
      // );

      // const registrationEventId = getMetadataValueId(
      //   metadataValues,
      //   'REGISTRATION',
      //   'KEY EVENTS'
      // );

      // const enrollmetEvent = await eventService.findOneEvent({
      //   where: {
      //     academic_year_id: currentAcademicYear.id,
      //     semester_id: currentAcademicYear.semester_context_id,
      //     event_id: enrollmentEventId,
      //   },
      //   attributes: ['id'],
      //   raw: true,
      // });

      const enrollmentEvent =
        await eventService.findLateEnrollmentAndRegistrationEventsFunction(
          studentProgramme.campus_id,
          studentProgramme.intake_id,
          studentProgramme.entry_academic_year_id,
          "'ENROLLMENT'",
          "'KEY EVENT'",
          currentAcademicYear.id,
          currentAcademicYear.semester_context_id
        );

      // if (!enrollmentEvent) {
      //   throw new Error(
      //     `Unable to find an enrollment event for the current academic year: ${currentAcademicYear.academic_year} and semester: ${currentAcademicYear.semester}.`
      //   );
      // }

      // const registrationEvent = await eventService.findOneEvent({
      //   where: {
      //     academic_year_id: currentAcademicYear.id,
      //     semester_id: currentAcademicYear.semester_context_id,
      //     event_id: registrationEventId,
      //   },
      //   attributes: ['id'],
      //   raw: true,
      // });

      const registrationEvent =
        await eventService.findLateEnrollmentAndRegistrationEventsFunction(
          studentProgramme.campus_id,
          studentProgramme.intake_id,
          studentProgramme.entry_academic_year_id,
          "'REGISTRATION'",
          "'KEY EVENT'",
          currentAcademicYear.id,
          currentAcademicYear.semester_context_id
        );

      // if (!registrationEvent) {
      //   throw new Error(
      //     `Unable to find a registration event for the current academic year: ${currentAcademicYear.academic_year} and semester: ${currentAcademicYear.semester}.`
      //   );
      // }

      let checkEnrollmentStatus = null;

      let checkRegistrationStatus = null;

      if (enrollmentEvent) {
        checkEnrollmentStatus = await enrollmentService.findOneRecord({
          where: {
            student_programme_id: studentProgramme.id,
            event_id: enrollmentEvent.id,
            is_active: true,
          },
          attributes: ['id'],
          raw: true,
        });
      }

      if (registrationEvent) {
        checkRegistrationStatus = await registrationService.findOneRecord({
          where: {
            student_programme_id: studentProgramme.id,
            event_id: registrationEvent.id,
            is_active: true,
          },
          attributes: ['id'],
          raw: true,
        });
      }

      if (checkEnrollmentStatus) {
        currentAcademicYear.is_enrolled = true;
      } else {
        currentAcademicYear.is_enrolled = false;
      }

      if (checkRegistrationStatus) {
        currentAcademicYear.is_registered = true;
      } else {
        currentAcademicYear.is_registered = false;
      }

      http.setSuccess(200, 'Current Semester Fetched Successfully', {
        data: currentAcademicYear,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Get Current Semester', {
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
  async deEnrollAStudent(req, res) {
    try {
      const user = req.user.id;
      const data = req.body;
      const { studentId } = req.params;

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
        include: {
          association: 'metadata',
          attributes: ['id', 'metadata_name'],
        },
        attributes: ['id', 'metadata_value'],
      });

      const activeAccountStatusId = getMetadataValueId(
        metadataValues,
        'ACTIVE',
        'STUDENT ACCOUNT STATUSES'
      );

      const fresherStatusId = getMetadataValueId(
        metadataValues,
        'FRESHER',
        'ENROLLMENT STATUSES'
      );

      if (
        parseInt(student.student_account_status_id, 10) !==
        parseInt(activeAccountStatusId, 10)
      ) {
        throw new Error(
          'You Can Only De-Enroll A Student With An Active Account Status.'
        );
      }

      const enrollmentRecord = await enrollmentService.findOneRecord({
        where: {
          id: data.enrollment_id,
          student_id: student.id,
          student_programme_id: data.student_programme_id,
        },
        ...getStudentEnrollmentAttributes(),
        raw: true,
      });

      if (!enrollmentRecord) {
        throw new Error(
          `Unable To Find The Enrollment Record Matching This Student's details.`
        );
      }

      if (enrollmentRecord.is_active === false) {
        throw new Error(
          'The student is already de-enrolled from the enrollment record provided.'
        );
      }

      const studentProgramme = await studentService.findOneStudentProgramme({
        where: {
          id: data.student_programme_id,
          student_id: studentId,
        },
        attributes: [
          'id',
          'student_id',
          'is_current_programme',
          'current_study_year_id',
          'current_semester_id',
          'programme_version_plan_id',
          'specialization_id',
          'major_subject_id',
          'minor_subject_id',
        ],

        raw: true,
      });

      if (
        parseInt(enrollmentRecord.enrollment_status_id, 10) !==
        parseInt(fresherStatusId, 10)
      ) {
        if (studentProgramme.is_current_programme === false) {
          throw new Error(
            'You Can Only De-Enroll A Student From Their Current Programme.'
          );
        }
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

      const studentRegistration = await registrationService.findOneRecord({
        where: {
          enrollment_id: data.enrollment_id,
          is_active: true,
        },
        ...getStudentRegistrationAttributes(),
      });

      if (studentRegistration) {
        throw new Error(
          'The Enrollment Record You Are Trying To De-Enroll Already Has An Active Registration On It.'
        );
      }

      const enrollmentEvent = await eventService.findOneEvent({
        where: {
          id: enrollmentRecord.event_id,
        },
        attributes: ['id', 'academic_year_id', 'semester_id'],
        raw: true,
      });

      const result = await model.sequelize.transaction(async (transaction) => {
        const response = await voidingAndDeAllocatingInvoices(
          student.id,
          data.student_programme_id,
          enrollmentRecord,
          enrollmentEvent,
          user,
          data,
          transaction
        );

        if (
          enrollmentRecord.old_study_year_id ===
          studentProgramme.current_study_year_id
        ) {
          await studentService.updateStudentProgramme(
            studentProgramme.id,
            {
              current_study_year_id: enrollmentRecord.old_study_year_id,
            },
            transaction
          );
        }

        if (
          enrollmentRecord.programme_version_plan_id &&
          enrollmentRecord.programme_version_plan_id ===
            studentProgramme.programme_version_plan_id
        ) {
          await studentService.updateStudentProgramme(
            studentProgramme.id,
            {
              programme_version_plan_id: null,
            },
            transaction
          );
        }

        if (
          enrollmentRecord.specialization_id &&
          enrollmentRecord.specialization_id ===
            studentProgramme.specialization_id
        ) {
          await studentService.updateStudentProgramme(
            studentProgramme.id,
            {
              specialization_id: null,
            },
            transaction
          );
        }

        if (
          enrollmentRecord.major_subject_id &&
          enrollmentRecord.major_subject_id ===
            studentProgramme.major_subject_id
        ) {
          await studentService.updateStudentProgramme(
            studentProgramme.id,
            {
              major_subject_id: null,
            },
            transaction
          );
        }

        if (
          enrollmentRecord.minor_subject_id &&
          enrollmentRecord.minor_subject_id ===
            studentProgramme.minor_subject_id
        ) {
          await studentService.updateStudentProgramme(
            studentProgramme.id,
            {
              minor_subject_id: null,
            },
            transaction
          );
        }

        return response;
      });

      http.setSuccess(200, 'Student De-Enrolled Successfully.', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To De-Enroll This Student.', {
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
  async fetchAllSemesterBoundEvents(req, res) {
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
            'current_study_year_id',
            'intake_id',
            'is_current_programme',
          ],
          include: [
            {
              association: 'currentStudyYear',
              attributes: ['programme_study_years'],
            },
          ],
          nest: true,
        })
        .then((res) => res.toJSON());

      if (!studentProgramme) {
        throw new Error('Academic Record Does Not Exist.');
      }

      const currentAcademicYear = await eventService.studentAcademicYear({
        campus_id: studentProgramme.campus_id,
        intake_id: studentProgramme.intake_id,
        entry_academic_year_id: studentProgramme.entry_academic_year_id,
      });

      if (!currentAcademicYear) {
        throw new Error(
          `Unable To Find An Academic Year Running For The Student's Context.`
        );
      }

      const enrollmentEvent = await eventService.currentSemesterEvents({
        campus_id: studentProgramme.campus_id,
        intake_id: studentProgramme.intake_id,
        entry_academic_year_id: studentProgramme.entry_academic_year_id,
        event: "'ENROLLMENT'",
        event_type: "'KEY EVENT'",
        academic_year_id: currentAcademicYear.id,
        semester_id: currentAcademicYear.semester_context_id,
      });

      const registrationEvent = await eventService.currentSemesterEvents({
        campus_id: studentProgramme.campus_id,
        intake_id: studentProgramme.intake_id,
        entry_academic_year_id: studentProgramme.entry_academic_year_id,
        event: "'REGISTRATION'",
        event_type: "'KEY EVENT'",
        academic_year_id: currentAcademicYear.id,
        semester_id: currentAcademicYear.semester_context_id,
      });

      // total unallocatedAmount

      const unallocatedAmount =
        await paymentTransactionService.studentUnallocatedAmount(
          studentProgramme.student_id
        );

      const tuitionFunctionalOther =
        await invoiceService.findAllTuitionFunctionalAndOtherFeesInvoices(
          studentProgramme.student_id
        );
      const manual = await invoiceService.findAllManualInvoices(
        studentProgramme.student_id
      );

      const unmatchedManualContext = [];

      manual.forEach((manualInvoice) => {
        const findContextInAuto = tuitionFunctionalOther.find(
          (invoice) =>
            manualInvoice.semester_id === invoice.semester_id &&
            manualInvoice.academic_year_id === invoice.academic_year_id &&
            manualInvoice.study_year_id === invoice.study_year_id
        );

        if (!findContextInAuto) {
          unmatchedManualContext.push({
            ...manualInvoice,
            tuition_invoices: [],
            functional_fees_invoices: [],
            other_fees_invoices: [],
          });
        }
      });

      const newInvoice = tuitionFunctionalOther.map((invoice) => {
        const findManualInvoice = manual.find(
          (context) =>
            context.semester_id === invoice.semester_id &&
            context.academic_year_id === invoice.academic_year_id &&
            context.study_year_id === invoice.study_year_id
        );

        return {
          ...invoice,
          manual_invoices: findManualInvoice
            ? findManualInvoice.manual_invoices
            : [],
        };
      });

      const merged = newInvoice.concat(unmatchedManualContext);

      let sumAllTuitionInvoiceAmountsDue = 0;

      let sumAllFunctionalInvoiceAmountsDue = 0;

      let sumAllOtherFeesInvoiceAmountsDue = 0;

      let sumAllManualInvoiceAmountsDue = 0;

      const arrayOfTuitionInvoices = [];
      const arrayOfFunctionalInvoices = [];
      const arrayOfOtherFeesInvoices = [];
      const arrayOfManualInvoices = [];

      if (!isEmpty(merged)) {
        for (const eachObject of merged) {
          if (!isEmpty(eachObject.tuition_invoices)) {
            arrayOfTuitionInvoices.push(...eachObject.tuition_invoices);
          }
          if (!isEmpty(eachObject.functional_fees_invoices)) {
            arrayOfFunctionalInvoices.push(
              ...eachObject.functional_fees_invoices
            );
          }
          if (!isEmpty(eachObject.other_fees_invoices)) {
            arrayOfOtherFeesInvoices.push(...eachObject.other_fees_invoices);
          }
          if (!isEmpty(eachObject.manual_invoices)) {
            arrayOfManualInvoices.push(...eachObject.manual_invoices);
          }
        }

        if (!isEmpty(arrayOfTuitionInvoices)) {
          sumAllTuitionInvoiceAmountsDue = sumBy(
            arrayOfTuitionInvoices,
            'amount_due'
          );
        }

        if (!isEmpty(arrayOfFunctionalInvoices)) {
          sumAllFunctionalInvoiceAmountsDue = sumBy(
            arrayOfFunctionalInvoices,
            'amount_due'
          );
        }

        if (!isEmpty(arrayOfOtherFeesInvoices)) {
          sumAllOtherFeesInvoiceAmountsDue = sumBy(
            arrayOfOtherFeesInvoices,
            'amount_due'
          );
        }

        if (!isEmpty(arrayOfManualInvoices)) {
          sumAllManualInvoiceAmountsDue = sumBy(
            arrayOfManualInvoices,
            'amount_due'
          );
        }
      }

      const studentFeesBalance =
        sumAllTuitionInvoiceAmountsDue +
        sumAllFunctionalInvoiceAmountsDue +
        sumAllManualInvoiceAmountsDue +
        sumAllOtherFeesInvoiceAmountsDue;

      const currentStudyYearDetails = {
        current_study_year_id: null,
        currentStudyYear: null,
      };

      if (studentProgramme.is_current_programme === true) {
        currentStudyYearDetails.current_study_year_id =
          studentProgramme.current_study_year_id;
        currentStudyYearDetails.currentStudyYear =
          studentProgramme.currentStudyYear.programme_study_years;
      } else {
        const currentStudentProgramme = await studentService
          .findOneStudentProgramme({
            where: {
              student_id: studentProgramme.student_id,
              is_current_programme: true,
            },
            attributes: [
              'id',
              'student_id',
              'campus_id',
              'entry_academic_year_id',
              'current_study_year_id',
              'intake_id',
              'is_current_programme',
            ],
            include: [
              {
                association: 'currentStudyYear',
                attributes: ['programme_study_years'],
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

        if (currentStudentProgramme) {
          currentStudyYearDetails.current_study_year_id =
            currentStudentProgramme.current_study_year_id;
          currentStudyYearDetails.currentStudyYear =
            currentStudentProgramme.currentStudyYear.programme_study_years;
        }
      }

      const response = {
        enrollmentEvent: enrollmentEvent || null,
        registrationEvent: registrationEvent || null,
        studentStudyYear: currentStudyYearDetails,
        accountBalance: unallocatedAmount
          ? unallocatedAmount.total_unallocated_amount
          : 0,
        feesBalance: studentFeesBalance,
        studentEnrollment: null,
        studentRegistration: null,
      };

      if (enrollmentEvent) {
        const studentEnrollment = await enrollmentService.findOneRecord({
          where: {
            event_id: enrollmentEvent.id,
            student_id: studentProgramme.student_id,
            student_programme_id: studentProgramme.id,
            is_active: true,
          },
          ...getStudentEnrollmentAttributes(),
        });

        response.studentEnrollment = studentEnrollment || null;
      }

      if (registrationEvent) {
        const studentRegistration = await registrationService.findOneRecord({
          where: {
            event_id: registrationEvent.id,
            student_id: studentProgramme.student_id,
            student_programme_id: studentProgramme.id,
            is_active: true,
          },
          ...getStudentRegistrationAttributes(),
        });

        response.studentRegistration = studentRegistration || null;
      }

      http.setSuccess(
        200,
        'Enrollment And Registration Events For This Semester Fetched Successfully.',
        {
          data: response,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable To Get Enrollment And Registration Events For This Semester.',
        {
          error: { message: error.message },
        }
      );

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

      await enrollmentService.deleteRecord(id);
      http.setSuccess(200, 'Enrollment Record Deleted Successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Delete This Enrollment Record', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

const getEnrollmentAttributes = function () {
  return {
    attributes: {
      exclude: [
        'updated_at',
        'deleted_at',
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
        'deleted_by_id',
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
        attributes: ['id'],
        include: [
          {
            association: 'semester',
            attributes: ['id', 'start_date', 'end_date'],
            include: {
              association: 'semester',
              attributes: ['id', 'metadata_value'],
            },
          },
          {
            association: 'academicYear',
            attributes: ['id'],
            include: {
              association: 'academicYear',
              attributes: ['id', 'metadata_value'],
            },
          },
        ],
      },
      {
        association: 'studyYear',
        attributes: ['id', 'programme_study_years'],
      },
      {
        association: 'enrollmentStatus',
        attributes: ['id', 'metadata_value'],
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
        association: 'functionalInvoice',
        attributes: [
          'id',
          'invoice_number',
          'invoice_amount',
          'amount_paid',
          'amount_due',
          'percentage_completion',
          'description',
          'due_date',
          'currency',
        ],
        include: [
          {
            association: 'invoiceType',
            attributes: ['metadata_value'],
          },
          {
            association: 'functionalElements',
            attributes: {
              exclude: ['created_at', 'updated_at'],
            },
          },
        ],
      },
      {
        association: 'tuitionInvoice',
        attributes: [
          'id',
          'invoice_number',
          'invoice_amount',
          'amount_paid',
          'amount_due',
          'percentage_completion',
          'description',
          'due_date',
          'currency',
        ],
        include: [
          {
            association: 'invoiceType',
            attributes: ['metadata_value'],
          },
          {
            association: 'tuitionInvoiceFeesElement',
            attributes: {
              exclude: ['created_at', 'updated_at'],
            },
          },
        ],
      },
      {
        association: 'otherFeesInvoice',
        attributes: [
          'id',
          'invoice_number',
          'invoice_amount',
          'amount_paid',
          'amount_due',
          'percentage_completion',
          'description',
          'due_date',
          'currency',
        ],
        include: [
          {
            association: 'invoiceType',
            attributes: ['metadata_value'],
          },
          {
            association: 'otherFeesInvoiceFeesElements',
            attributes: {
              exclude: ['created_at', 'updated_at'],
            },
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
  };
};

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
      { association: 'enrollmentStatus', attributes: ['metadata_value'] },
      { association: 'studyYear', attributes: ['programme_study_years'] },
      {
        association: 'functionalInvoice',
        attributes: [
          'id',
          'invoice_number',
          'invoice_amount',
          'amount_paid',
          'amount_due',
          'percentage_completion',
        ],
      },
      {
        association: 'otherFeesInvoice',
        attributes: [
          'id',
          'invoice_number',
          'invoice_amount',
          'amount_paid',
          'amount_due',
          'percentage_completion',
        ],
      },
      {
        association: 'tuitionInvoice',
        attributes: [
          'id',
          'invoice_number',
          'invoice_amount',
          'amount_paid',
          'amount_due',
          'percentage_completion',
        ],
      },
    ],
  };
};

module.exports = EnrollmentController;
