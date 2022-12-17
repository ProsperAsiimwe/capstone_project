const { HttpResponse } = require('@helpers');
const {
  enrollmentService,
  registrationService,
  eventService,
  studentService,
  metadataValueService,
} = require('@services/index');
const { isEmpty } = require('lodash');
const { enrollStudent } = require('../Helpers/enrollmentRecord');
const {
  registerThisStudent,
  getCourseUnits,
  studentProgrammeAttributes,
  handleUpdatingRegistredCourseUnits,
} = require('../Helpers/registrationHelper');
const {
  getMetadataValueId,
  getMetadataValueName,
} = require('@controllers/Helpers/programmeHelper');
const model = require('@models');
const http = new HttpResponse();

class StudentEventController {
  /**
   * GET All Student's Enrollment Event.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async getStudentEnrollmentEvent(req, res) {
    try {
      const student = req.user;

      const { studentProgrammeId } = req.params;

      const studentProgramme = await studentService
        .findOneStudentProgramme({
          where: {
            id: studentProgrammeId,
            student_id: student.id,
          },
          attributes: [
            'id',
            'student_id',
            'campus_id',
            'entry_academic_year_id',
            'current_study_year_id',
            'intake_id',
            'programme_id',
            'programme_type_id',
            'programme_version_id',
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
          nest: true,
        })
        .then(function (res) {
          if (res) {
            const result = res.toJSON();

            return result;
          }
        });

      if (!studentProgramme) {
        throw new Error(
          'The Academic Record Provided Does not Belong To This Student.'
        );
      }
      const studentId = student.id;

      const currentAcademicYear = await eventService.studentAcademicYear({
        campus_id: studentProgramme.campus_id,
        intake_id: studentProgramme.intake_id,
        entry_academic_year_id: studentProgramme.entry_academic_year_id,
      });

      if (!currentAcademicYear) {
        throw new Error(`You currently have no running Academic Year.`);
      }

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

      const response = {
        studentEnrollment: null,
        studentRegistration: null,
        enrollmentEvent: enrollmentEvent || null,
        registrationEvent: registrationEvent || null,
      };

      if (enrollmentEvent) {
        const studentEnrollment = await enrollmentService.findOneRecord({
          where: {
            event_id: enrollmentEvent.id,
            student_id: studentId,
            is_active: true,
            student_programme_id: studentProgrammeId,
          },
          ...getStudentEnrollmentAttributes(),
        });

        response.studentEnrollment = studentEnrollment || null;
      }

      if (registrationEvent) {
        const dataContext = {
          event_id: registrationEvent.id,
          studentProgrammeId: studentProgrammeId,
          programme_version_id: studentProgramme.programme_version_id,
        };

        const studentRegistration =
          await registrationService.currentStudentRegistration(dataContext);

        response.studentRegistration = studentRegistration || null;
      }

      http.setSuccess(
        200,
        'Enrollment And Registration Events Fetched Successfully.',
        {
          data: response,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable To Fetch Enrollment And Registration Events.',
        {
          error: { message: error.message },
        }
      );

      return http.send(res);
    }
  }

  /**
   * GET All Student's Registration Event.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async registrationEvent(req, res) {
    try {
      const records = await eventService.findOneEvent({
        where: {
          event_type: 'KEY EVENT',
          description: 'STUDENT REGISTRATION',
        },
      });

      http.setSuccess(200, 'Registration Event Fetched Successfully', {
        records,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Registration Event', {
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
  async getStudentEnrollmentRecords(req, res) {
    try {
      const { studentProgrammeId } = req.params;
      const studentId = req.user.id;
      const data = await enrollmentService.findAllRecords({
        where: {
          student_programme_id: studentProgrammeId,
          student_id: studentId,
          is_active: true,
        },
        include: [
          {
            association: 'event',
            include: [
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
              {
                association: 'academicYear',
                attributes: ['academic_year_id'],
                include: [
                  {
                    association: 'academicYear',
                    attributes: ['metadata_value'],
                  },
                ],
              },
            ],
            attributes: ['id', 'start_date', 'end_date'],
          },
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

          {
            association: 'registration',
            attributes: [
              'id',
              'event_id',
              'enrollment_id',
              'registration_type_id',
              'registered_by',
            ],
            ...getCourseUnitAttributes(),
          },
        ],
        attributes: ['id', 'enrolled_by', 'enrollment_token', 'created_at'],
      });

      http.setSuccess(200, 'Enrollment Records fetched successfully', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to get your Enrollment Records', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /** getStudentRegistrationRecords
   *
   * @param {*} req
   * @param {*} res
   */
  async getStudentRegistrationRecords(req, res) {
    try {
      const studentId = req.user.id;
      const data = await registrationService.findAllRecords({
        where: {
          student_id: studentId,
        },
        include: [
          {
            association: 'event',
            include: [
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
              {
                association: 'academicYear',
                attributes: ['academic_year_id'],
                include: [
                  {
                    association: 'academicYear',
                    attributes: ['metadata_value'],
                  },
                ],
              },
            ],
            attributes: ['id', 'start_date', 'end_date'],
          },
        ],
        ...getRegistrationHistoryAttributes(),
        attributes: ['id', 'registered_by', 'created_at'],
      });

      http.setSuccess(200, 'Registration Records fetched successfully', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to get your Registration Records', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   * registration history
   */
  async registrationCourseUnitsByStudent(req, res) {
    try {
      const { studentProgrammeId } = req.params;

      const registrationCourseUnits =
        await registrationService.registrationHistoryCourseUnitsByStudent(
          studentProgrammeId
        );

      http.setSuccess(200, 'Registration Records Fetched Successfully.', {
        data: registrationCourseUnits,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Registration Records.', {
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
      const student = req.user;

      const { studentProgrammeId } = req.params;

      const studentProgramme = await studentService
        .findOneStudentProgramme({
          where: {
            id: studentProgrammeId,
            student_id: student.id,
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
        throw new Error('Academic Record Does Not Exist For This Student.');
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

      let result = [];

      if (studentProgramme.programme.is_modular === true) {
        // Do something
      } else {
        result = await getCourseUnits(registrationEvent[0], studentProgramme);
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
   * Enroll Student
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async enrollmentByStudent(req, res) {
    try {
      const data = req.body;
      const studentId = req.user.id;

      data.student_id = studentId;
      data.enrolled_by = 'STUDENT';
      data.enrollment_condition = 'EARLY ENROLLMENT';

      const metadataValues = await metadataValueService.findAllMetadataValues({
        include: {
          association: 'metadata',
          attributes: ['id', 'metadata_name'],
        },
        attributes: ['id', 'metadata_value'],
      });

      const findAmnestyId = getMetadataValueId(
        metadataValues,
        'AMNESTY',
        'ENROLLMENT STATUSES'
      );

      const findStayPutId = getMetadataValueId(
        metadataValues,
        'STAY PUT',
        'ENROLLMENT STATUSES'
      );

      if (
        parseInt(data.enrollment_status_id, 10) ===
          parseInt(findAmnestyId, 10) ||
        parseInt(data.enrollment_status_id, 10) === parseInt(findStayPutId, 10)
      ) {
        throw new Error(
          `STAY PUT or AMNESTY students can only be enrolled by the staff. Please contact an administrator for assistance.`
        );
      }

      const enrollResponse = await enrollStudent(data);

      http.setSuccess(200, 'You have been enrolled Successfully', {
        data: enrollResponse,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, error.message);

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
      const studentId = req.user.id;

      const findRegistration = await registrationService
        .findOneRecord({
          where: {
            id: registrationId,
            student_id: studentId,
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
          null,
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
  async registrationByStudent(req, res) {
    try {
      const data = req.body;
      const studentId = req.user.id;

      data.student_id = studentId;
      data.registered_by = 'STUDENT';
      data.registration_condition = 'EARLY REGISTRATION';

      const metadataValues = await metadataValueService.findAllMetadataValues({
        include: {
          association: 'metadata',
          attributes: ['id', 'metadata_name'],
        },
        attributes: ['id', 'metadata_value'],
      });

      const findMissingPaperId = getMetadataValueId(
        metadataValues,
        'MISSING PAPER',
        'REGISTRATION STATUSES'
      );

      const findSupplementaryPaperId = getMetadataValueId(
        metadataValues,
        'SUPPLEMENTARY PAPER',
        'REGISTRATION STATUSES'
      );

      const findMissingPapers = data.course_units.filter(
        (course) =>
          parseInt(course.course_unit_status_id, 10) ===
          parseInt(findMissingPaperId, 10)
      );

      const findSupplementaryPapers = data.course_units.filter(
        (course) =>
          parseInt(course.course_unit_status_id, 10) ===
          parseInt(findSupplementaryPaperId, 10)
      );

      if (!isEmpty(findMissingPapers)) {
        throw new Error(
          `Students are not allowed to register a MISSING PAPER on their own. Please approach an administrator for help.`
        );
      }

      if (!isEmpty(findSupplementaryPapers)) {
        throw new Error(
          `Students are not allowed to register a SUPPLEMENTARY PAPER on their own. Please approach an administrator for help.`
        );
      }

      const registration = await registerThisStudent(data);

      http.setSuccess(200, 'You Have Been Registered successfully.', {
        data: registration,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, error.message);

      return http.send(res);
    }
  }
}

const getCourseUnitAttributes = function () {
  return {
    include: [
      {
        association: 'registrationType',
        attributes: ['metadata_value'],
      },
      {
        association: 'courseUnits',
        where: {
          deleted_at: null,
        },
        attributes: ['course_unit_id', 'course_unit_status_id'],
        include: [
          {
            association: 'courseUnitStatus',
            attributes: ['metadata_value'],
          },
          {
            association: 'courseUnit',
            attributes: [
              'id',
              'course_unit_code',
              'course_unit_name',
              'credit_unit',
            ],
          },
        ],
      },
    ],
  };
};

const getRegistrationHistoryAttributes = function () {
  return {
    include: [
      {
        association: 'registrationType',
        attributes: ['metadata_value'],
      },
      {
        association: 'courseUnits',
        where: {
          deleted_at: null,
        },
        attributes: ['course_unit_id', 'course_unit_status_id'],
        include: [
          {
            association: 'courseUnitStatus',
            attributes: ['metadata_value'],
          },
          {
            association: 'courseUnit',
            attributes: [
              'id',
              'course_unit_code',
              'course_unit_title',
              'credit_units',
            ],
            include: [
              {
                association: 'courseUnitLevel',
                attributes: ['metadata_value'],
              },
              {
                association: 'contributionAlgorithm',
                attributes: ['metadata_value'],
              },
              {
                association: 'courseUnitSemester',
                attributes: ['metadata_value'],
              },
              {
                association: 'courseUnitYear',
                attributes: ['metadata_value'],
              },
              {
                association: 'specializations',
                attributes: ['specialization_code', 'specialization_title'],
              },
            ],
          },
        ],
      },
      {
        association: 'enrollment',
        attributes: {
          exclude: [
            'created_at',
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
            association: 'enrollmentStatus',
            attributes: ['id', 'metadata_value'],
          },
        ],
      },
    ],
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
      {
        association: 'enrollmentStatus',
        attributes: ['metadata_value'],
      },
      {
        association: 'studyYear',
        attributes: ['programme_study_years'],
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

module.exports = StudentEventController;
