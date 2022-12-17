const {
  eventService,
  studentService,
  registrationPolicyService,
  retakersFeesPolicyService,
  registrationService,
  metadataValueService,
  courseUnitService,
  invoiceService,
  paymentTransactionService,
  metadataService,
  paymentReferenceService,
  enrollmentService,
  surchargePolicyService,
  academicYearFeesPolicyService,
  academicYearService,
  semesterService,
  enrollmentAndRegistrationHistoryPolicyService,
  graduationListService,
} = require('@services/index');
const {
  checkRegistrationPolicyConstraint,
  retakersRegistrationPolicyConstraint,
  continuingAndFinalistSemesterLoadsConstraint,
  retakersFeesPolicyConstraint,
  freshersSemesterLoadsConstraint,
  retakersSemesterLoadsConstraint,
  updateRegisteredCourseUnitsForContinuingAndFinalists,
  lateEnrollmentAndRegistrationSurchargeConstraint,
  checkDocumentVerificationPolicy,
  checkPreviousRegistrationRecords,
  continuingAndFinalistSemesterLoadsWithoutInsertion,
  billRetakesAndMissingPapersOnRegCourseUnitUpdate,
} = require('./policyConstraintsHelper');
const { isEmpty, filter, toUpper, find } = require('lodash');
const { Op } = require('sequelize');
const moment = require('moment');
const model = require('@models');
const {
  getMetadataValueId,
  getMetadataValueIdWithoutError,
  getMetadataValueName,
} = require('@controllers/Helpers/programmeHelper');
const { generateSystemReference } = require('./paymentReferenceHelper');
const {
  voidingAndDeAllocatingInvoicesFromUpdatingRegisteredCourseUnits,
} = require('../Helpers/enrollmentRecord');

/**
 *
 * @param {*} payload
 */
const getCourseUnits = async function (registrationEvent, studentProgramme) {
  try {
    const courseUnits = await registrationService
      .groupCourseUnitsWithFunction(
        studentProgramme.programme_version_id,
        registrationEvent.semester_id
      )
      .then((res) => {
        return res;
      });

    return courseUnits;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} payload
 */
const registerThisStudent = async function (payload) {
  try {
    const student = await studentService.findOneStudent({
      where: {
        id: payload.student_id,
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

    if (
      parseInt(student.student_account_status_id, 10) !==
      parseInt(activeAccountStatusId, 10)
    ) {
      throw new Error(
        'You Can Only Register A Student With An Active Account Status.'
      );
    }

    const enrollmentRecord = await enrollmentService
      .findOneRecord({
        where: {
          id: payload.enrollment_id,
          student_id: student.id,
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

    payload.student_programme_id = enrollmentRecord.student_programme_id;

    const studentProgramme = await studentService
      .findOneStudentProgramme({
        where: {
          id: enrollmentRecord.student_programme_id,
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

    if (!studentProgramme) {
      throw new Error(
        'Unable To Find The Programme Enrolled To By This Student.'
      );
    }

    if (studentProgramme.is_current_programme === false) {
      throw new Error(
        'The Programme Enrolled To Is Not The Current Programme Of This Student.'
      );
    }

    const findGradListRecord =
      await graduationListService.findOneProvisionalGraduationListRecord({
        where: {
          student_programme_id: studentProgramme.id,
        },
        raw: true,
      });

    if (findGradListRecord) {
      throw new Error(
        `This Action Cannot Be Performed On A Student With A Record In The Graduation Lists.`
      );
    }

    await checkDocumentVerificationPolicy(
      enrollmentRecord.enrollment_status_id,
      enrollmentRecord.student_programme_id
    );

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

    const regEvent = await eventService.currentSemesterEvents({
      campus_id: studentProgramme.campus_id,
      intake_id: studentProgramme.intake_id,
      entry_academic_year_id: studentProgramme.entry_academic_year_id,
      event: "'REGISTRATION'",
      event_type: "'KEY EVENT'",
      academic_year_id: currentAcademicYear.id,
      semester_id: currentAcademicYear.semester_context_id,
    });

    if (!regEvent) {
      throw new Error(
        `Unable To Find A Registration Event For The Student's Context.`
      );
    }

    const findEnrollmentAndRegHistoryPolicy =
      await enrollmentAndRegistrationHistoryPolicyService
        .findOneRecord({
          where: {
            enrollment_status_id: enrollmentRecord.enrollment_status_id,
            is_active: true,
          },
          include: [
            {
              association: 'enrollmentStatus',
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

    if (findEnrollmentAndRegHistoryPolicy) {
      await checkPreviousRegistrationRecords(
        studentProgramme,
        currentAcademicYear.academic_year,
        currentAcademicYear.academic_year_id,
        currentAcademicYear.semester,
        currentAcademicYear.semester_metadata_id,
        enrollmentRecord.study_year_id,
        enrollmentRecord.enrollmentStatus.metadata_value
      );
    }

    const statusWithoutSpaces = toUpper(
      enrollmentRecord.enrollmentStatus.metadata_value.replace(/\s/g, '')
    );

    const response = await model.sequelize.transaction(async (transaction) => {
      await generateLateRegistrationInvoice(
        enrollmentRecord.id,
        enrollmentRecord.enrollment_status_id,
        studentProgramme,
        transaction
      );

      const result = await registrationFunction(
        payload,
        enrollmentRecord,
        studentProgramme,
        regEvent,
        statusWithoutSpaces,
        metadataValues,
        studentProgramme.programme.programme_study_level_id,
        transaction
      );

      return result;
    });

    return response;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} payload
 */
const lateRegistration = async function (payload) {
  const metadataValues = await metadataValueService.findAllMetadataValues({
    include: {
      association: 'metadata',
      attributes: ['id', 'metadata_name'],
    },
    attributes: ['id', 'metadata_value'],
  });

  const findActiveAccountStatusId = getMetadataValueId(
    metadataValues,
    'ACTIVE',
    'STUDENT ACCOUNT STATUSES'
  );

  const student = await studentService.findOneStudent({
    where: {
      id: payload.student_id,
    },
    attributes: ['id', 'student_account_status_id'],
    raw: true,
  });

  if (!student) {
    throw new Error('Unable To Find This Student.');
  }

  if (
    parseInt(student.student_account_status_id, 10) !==
    parseInt(findActiveAccountStatusId, 10)
  ) {
    throw new Error(
      'You Cannot Register A Student With An Inactive Account Status.'
    );
  }

  const studentProgramme = await studentService
    .findOneStudentProgramme({
      where: {
        id: payload.student_programme_id,
        student_id: payload.student_id,
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

  if (!studentProgramme) {
    throw new Error(
      'The Academic Record Provided Does not Belong To This Student.'
    );
  }

  if (studentProgramme.is_current_programme === false) {
    throw new Error(
      'The Academic Record Provided Is Not The Current Programme Of This Student.'
    );
  }

  const studentCampusId = studentProgramme.campus_id;
  const studentEntryAcademicYearId = studentProgramme.entry_academic_year_id;
  const studentIntakeId = studentProgramme.intake_id;

  const enrollmentEvent =
    await eventService.findLateEnrollmentAndRegistrationEventsFunction(
      studentCampusId,
      studentIntakeId,
      studentEntryAcademicYearId,
      "'ENROLLMENT'",
      "'KEY EVENT'",
      payload.academic_year_id,
      payload.semester_id
    );

  if (!enrollmentEvent) {
    throw new Error(
      "There is no enrollment event that applies to this student's context which matches the academic year and semester provided."
    );
  }

  let registrationEvent =
    await eventService.findLateEnrollmentAndRegistrationEventsFunction(
      studentCampusId,
      studentIntakeId,
      studentEntryAcademicYearId,
      "'REGISTRATION'",
      "'KEY EVENT'",
      payload.academic_year_id,
      payload.semester_id
    );

  if (!registrationEvent) {
    const registrationEventId = getMetadataValueId(
      metadataValues,
      'REGISTRATION',
      'KEY EVENTS'
    );

    const allRegistrationEvents = await eventService
      .findAllEvents({
        where: {
          semester_id: payload.semester_id,
          academic_year_id: payload.academic_year_id,
          event_type: 'KEY EVENT',
          event_id: registrationEventId,
        },
        include: [
          {
            association: 'eventIntakes',
          },
          {
            association: 'eventCampuses',
          },
          {
            association: 'eventEntryAcademicYears',
          },
        ],
      })
      .then((res) => {
        if (res) {
          return res.map((item) => item.get({ plain: true }));
        }
      });

    if (!isEmpty(allRegistrationEvents)) {
      allRegistrationEvents.forEach((event) => {
        const findIntake = event.eventIntakes.find(
          (intake) =>
            parseInt(intake.intake_id, 10) ===
            parseInt(studentProgramme.intake_id, 10)
        );

        const findCampus = event.eventCampuses.find(
          (campus) =>
            parseInt(campus.campus_id, 10) ===
            parseInt(studentProgramme.campus_id, 10)
        );

        if (findIntake && findCampus) {
          registrationEvent = event;
        }
      });
    }

    if (!registrationEvent) {
      throw new Error(
        `There is no registration event that matches this academic year and semester.`
      );
    }
  }

  payload.event_id = registrationEvent.id;

  const enrollmentRecord = await enrollmentService
    .findOneRecord({
      where: {
        student_id: payload.student_id,
        study_year_id: payload.study_year_id,
        event_id: enrollmentEvent.id,
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

  if (!enrollmentRecord) {
    throw new Error(
      'This student has not yet been enrolled in the enrollment event for the academic year and semester provided.'
    );
  }

  await checkDocumentVerificationPolicy(
    enrollmentRecord.enrollment_status_id,
    enrollmentRecord.student_programme_id
  );

  const findAcademicYear = await academicYearService.findOneAcademicYear({
    where: {
      id: payload.academic_year_id,
    },
    raw: true,
  });

  if (!findAcademicYear) {
    throw new Error(`Unable To Find Academic Year.`);
  }

  const findSemester = await semesterService.findOneSemester({
    where: {
      id: payload.semester_id,
    },
    raw: true,
  });

  if (!findSemester) {
    throw new Error(`Unable To Find Semester.`);
  }

  const findEnrollmentAndRegHistoryPolicy =
    await enrollmentAndRegistrationHistoryPolicyService
      .findOneRecord({
        where: {
          enrollment_status_id: enrollmentRecord.enrollment_status_id,
          is_active: true,
        },
        include: [
          {
            association: 'enrollmentStatus',
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

  if (findEnrollmentAndRegHistoryPolicy) {
    await checkPreviousRegistrationRecords(
      studentProgramme,
      registrationEvent.academic_year,
      findAcademicYear.academic_year_id,
      registrationEvent.semester,
      findSemester.semester_id,
      enrollmentRecord.study_year_id,
      enrollmentRecord.enrollmentStatus.metadata_value
    );
  }

  payload.enrollment_id = enrollmentRecord.id;

  const statusWithoutSpaces = toUpper(
    enrollmentRecord.enrollmentStatus.metadata_value.replace(/\s/g, '')
  );

  const lateRegistrationSurchargeId = getMetadataValueId(
    metadataValues,
    'LATE REGISTRATION',
    'SURCHARGE TYPES'
  );

  const findLateRegistrationSurchargeRecord =
    await surchargePolicyService.findOneRecord({
      where: {
        surcharge_type_id: lateRegistrationSurchargeId,
      },
      attributes: [
        'id',
        'surcharge_type_id',
        'other_fees_element_id',
        'is_active',
      ],
      raw: true,
    });

  const response = await model.sequelize.transaction(async (transaction) => {
    if (
      payload.add_late_registration_surcharge === true ||
      payload.add_late_registration_surcharge === 'true'
    ) {
      if (isEmpty(findLateRegistrationSurchargeRecord)) {
        throw new Error('Please define a LATE REGISTRATION surcharge policy.');
      }

      if (findLateRegistrationSurchargeRecord.is_active !== true) {
        throw new Error('Please activate the LATE REGISTRATION surcharge.');
      }

      const result = await registrationFunction(
        payload,
        enrollmentRecord,
        studentProgramme,
        registrationEvent,
        statusWithoutSpaces,
        metadataValues,
        studentProgramme.programme.programme_study_level_id,
        transaction
      );

      // charge late registration surcharge
      const description = `SURCHARGE: LATE REGISTRATION.`;

      const academicYearFeesPolicies =
        await academicYearFeesPolicyService.findAllRecords({
          attributes: [
            'id',
            'fees_category_id',
            'enrollment_status_id',
            'bill_by_entry_academic_year',
          ],
          raw: true,
        });

      if (isEmpty(academicYearFeesPolicies)) {
        throw new Error(
          'Unable To Find Any Academic Year Fees Policies For Your Institution.'
        );
      }

      await lateEnrollmentAndRegistrationSurchargeConstraint(
        findLateRegistrationSurchargeRecord.other_fees_element_id,
        enrollmentRecord.id,
        enrollmentRecord.enrollment_status_id,
        enrollmentRecord.enrollmentStatus.metadata_value,
        academicYearFeesPolicies,
        findLateRegistrationSurchargeRecord.surcharge_type_id,
        description,
        studentProgramme,
        registrationEvent,
        transaction
      );

      return result;
    } else {
      const result = await registrationFunction(
        payload,
        enrollmentRecord,
        studentProgramme,
        registrationEvent,
        statusWithoutSpaces,
        metadataValues,
        studentProgramme.programme.programme_study_level_id,
        transaction
      );

      return result;
    }
  });

  return response;
};

/**
 *
 * @param {*} payload
 * @param {*} enrollmentRecord
 * @param {*} studentProgramme
 * @param {*} registrationEvent
 * @param {*} statusWithoutSpaces
 * @param {*} metadataValues
 */
const registrationFunction = async function (
  payload,
  enrollmentRecord,
  studentProgramme,
  registrationEvent,
  statusWithoutSpaces,
  metadataValues,
  programmeStudyLevelId,
  transaction
) {
  try {
    const fullRegistrationTypeId = getMetadataValueId(
      metadataValues,
      'FULL REGISTRATION',
      'REGISTRATION TYPES'
    );

    const provisionalRegistrationTypeId = getMetadataValueId(
      metadataValues,
      'PROVISIONAL REGISTRATION',
      'REGISTRATION TYPES'
    );

    // Only allow full and provisional registration types
    if (
      parseInt(payload.registration_type_id, 10) ===
        parseInt(fullRegistrationTypeId, 10) ||
      parseInt(payload.registration_type_id, 10) ===
        parseInt(provisionalRegistrationTypeId, 10)
    ) {
      // Incase Of Full Registration, Check That What Is Needed Has Been Provided
      if (
        parseInt(payload.registration_type_id, 10) ===
        parseInt(provisionalRegistrationTypeId, 10)
      ) {
        if (!payload.provisional_registration_type_id) {
          throw new Error(
            'Please Specify The Type Of Provisional Registration.'
          );
        }
        if (!payload.provisional_registration_comment) {
          throw new Error(
            'Please Provide A Comment For This Provisional Registration.'
          );
        }
      }

      if (!isEmpty(enrollmentRecord.retakes)) {
        enrollmentRecord.retakes.forEach((retake) => {
          const index = payload.course_units.findIndex(
            (unit) =>
              parseInt(unit.course_unit_id, 10) ===
              parseInt(retake.course_unit_id, 10)
          );

          if (index > -1) {
            payload.course_units.splice(index, 1);

            payload.course_units.push({
              course_unit_id: parseInt(retake.course_unit_id, 10),
              course_unit_status_id: parseInt(retake.course_unit_status_id, 10),
              already_billed: true,
            });
          } else {
            payload.course_units.push({
              course_unit_id: parseInt(retake.course_unit_id, 10),
              course_unit_status_id: parseInt(retake.course_unit_status_id, 10),
              already_billed: true,
            });
          }
        });
      }

      // Check Registration Policy For Continuing students, Freshers and Finalists
      if (
        statusWithoutSpaces === 'CONTINUINGSTUDENT' ||
        statusWithoutSpaces === 'FINALIST' ||
        statusWithoutSpaces === 'FRESHER' ||
        statusWithoutSpaces === 'RE-INSTATEMENT' ||
        statusWithoutSpaces === 'EXTENSION'
      ) {
        await normalStudentRegistrationPolicy(
          payload.registration_type_id,
          enrollmentRecord
        );
      }

      const handleCourseUnits = await handleSemesterCourseUnits(
        payload,
        studentProgramme,
        registrationEvent,
        enrollmentRecord,
        transaction
      );

      if (
        statusWithoutSpaces === 'CONTINUINGSTUDENT' ||
        statusWithoutSpaces === 'FINALIST'
      ) {
        const registration = await continuingAndFinalistSemesterLoadsConstraint(
          handleCourseUnits,
          studentProgramme,
          enrollmentRecord,
          registrationEvent,
          payload,
          transaction
        );

        return registration;
      } else if (
        statusWithoutSpaces === 'DOINGRETAKESAFTERFINALYEAR' ||
        statusWithoutSpaces === 'STAYPUT'
      ) {
        await retakersStudentRegistrationPolicy(
          payload.registration_type_id,
          enrollmentRecord
        );

        const checkRetakersFeesPolicy = await retakersFeesPolicyService
          .findOneRecord({
            where: {
              enrollment_status_id: enrollmentRecord.enrollment_status_id,
              study_level_id: programmeStudyLevelId,
            },
            attributes: [
              'id',
              'enrollment_status_id',
              'study_level_id',
              'use_default_amount',
              'amount',
            ],
            include: [
              {
                association: 'status',
                attributes: ['metadata_value'],
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

        if (!checkRetakersFeesPolicy) {
          throw new Error(
            `Retakers Fees Policy For This Student's Context Has Not Yet Been Defined.`
          );
        }

        const checkedCourseUnits = await retakersSemesterLoadsConstraint(
          handleCourseUnits,
          studentProgramme
        );

        const result = await registrationService
          .createRegistrationRecord(payload, transaction)
          .then((res) => {
            if (res[1] === false) {
              throw new Error(
                'This student is already registered in this registration event!'
              );
            }

            return res[0].dataValues;
          });

        await retakersFeesPolicyConstraint(
          result,
          checkedCourseUnits,
          studentProgramme,
          enrollmentRecord,
          checkRetakersFeesPolicy,
          registrationEvent,
          transaction
        );

        return result;
      } else if (
        statusWithoutSpaces === 'RE-INSTATEMENT' ||
        statusWithoutSpaces === 'EXTENSION'
      ) {
        payload.courseUnits = handleCourseUnits;

        await registrationService
          .createRegistrationRecord(payload, transaction)
          .then((res) => {
            if (res[1] === false) {
              throw new Error(
                'This student is already registered in this registration event!'
              );
            }

            return res[0].dataValues;
          });
      } else if (statusWithoutSpaces === 'FRESHER') {
        let checkedCourseUnits = [];

        if (
          studentProgramme.programmeVersion.has_exempt_registration === true
        ) {
          if (!isEmpty(studentProgramme.programmeVersion.exemptRegs)) {
            const findExemptedRecord =
              studentProgramme.programmeVersion.exemptRegs.find(
                (exemption) =>
                  parseInt(exemption.study_year_id, 10) ===
                    parseInt(
                      enrollmentRecord.studyYear.programme_study_year_id,
                      10
                    ) &&
                  parseInt(exemption.semester_id, 10) ===
                    parseInt(enrollmentRecord.event.semester.semester_id, 10)
              );

            if (findExemptedRecord) {
              checkedCourseUnits = handleCourseUnits;
            } else {
              checkedCourseUnits = await freshersSemesterLoadsConstraint(
                handleCourseUnits,
                studentProgramme
              );
            }
          }
        } else {
          checkedCourseUnits = await freshersSemesterLoadsConstraint(
            handleCourseUnits,
            studentProgramme
          );
        }

        payload.courseUnits = checkedCourseUnits;

        const result = await registrationService
          .createRegistrationRecord(payload, transaction)
          .then((res) => {
            if (res[1] === false) {
              throw new Error(
                'This student is already registered in this registration event!'
              );
            }

            return res[0].dataValues;
          });

        return result;
      } else {
        throw new Error(
          'This student does not match any criteria for registration on this version of the system.'
        );
      }
    } else {
      throw new Error(
        'You need to register with either FULL or PROVISIONAL REGISTRATION TYPES'
      );
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} payload
 */
const updateCourseUnitsOfRegistrationRecord = async function (
  payload,
  studentProgramme,
  findEvent,
  findEnrollmentRecord,
  findRegistration,
  deletedCourseUnits,
  enrollmentEvent,
  user
) {
  const statusWithoutSpaces =
    findEnrollmentRecord.dataValues.enrollmentStatus.metadata_value.replace(
      /\s/g,
      ''
    );

  const semesterCourseUnits = [];

  if (!isEmpty(payload.course_units)) {
    payload.course_units.forEach((courseUnit) => {
      semesterCourseUnits.push({
        course_unit_id: parseInt(courseUnit.course_unit_id, 10),
        course_unit_status_id: parseInt(courseUnit.course_unit_status_id, 10),
      });
    });
  }

  const newPayload = [];

  for (const eachObject of semesterCourseUnits) {
    const units = await courseUnitService.findOneCourseUnit({
      where: {
        id: eachObject.course_unit_id,
      },
      attributes: [
        'id',
        'credit_units',
        'course_unit_code',
        'course_unit_title',
      ],
      raw: true,
    });

    units.course_unit_status_id = eachObject.course_unit_status_id;
    const payload = {
      course_unit_id: units.id,
      credit_unit: units.credit_units,
      course_unit_code: units.course_unit_code,
      course_unit_title: units.course_unit_title,
      course_unit_status_id: units.course_unit_status_id,
    };

    newPayload.push(payload);
  }

  const checkRetakersFeesPolicy = await retakersFeesPolicyService.findOneRecord(
    {
      where: {
        enrollment_status_id: findEnrollmentRecord.enrollment_status_id,
        study_level_id: studentProgramme.programme.programme_study_level_id,
      },
      attributes: [
        'id',
        'enrollment_status_id',
        'study_level_id',
        'use_default_amount',
        'amount',
      ],
      include: [
        {
          association: 'status',
          attributes: ['metadata_value'],
        },
      ],
    }
  );

  if (
    statusWithoutSpaces === 'CONTINUINGSTUDENT' ||
    statusWithoutSpaces === 'FINALIST'
  ) {
    await model.sequelize.transaction(async (transaction) => {
      const registration =
        await updateRegisteredCourseUnitsForContinuingAndFinalists(
          newPayload,
          findRegistration,
          studentProgramme,
          findEnrollmentRecord,
          findEvent,
          transaction
        );

      if (!isEmpty(deletedCourseUnits)) {
        await removeCourseUnits(
          deletedCourseUnits,
          findRegistration,
          findEnrollmentRecord,
          enrollmentEvent,
          statusWithoutSpaces,
          user,
          studentProgramme,
          transaction
        );
      }

      return registration;
    });
  } else if (
    statusWithoutSpaces === 'DOINGRETAKESAFTERFINALYEAR' ||
    statusWithoutSpaces === 'STAYPUT'
  ) {
    if (isEmpty(checkRetakersFeesPolicy)) {
      throw new Error('Retakers Fees Policy Has Not Yet Been Defined.');
    }

    await retakersSemesterLoadsConstraint(newPayload, studentProgramme);

    await model.sequelize.transaction(async (transaction) => {
      const calculateTuition = await retakersFeesPolicyConstraint(
        findRegistration,
        newPayload,
        studentProgramme,
        findEnrollmentRecord,
        checkRetakersFeesPolicy,
        findEvent,
        transaction
      );

      if (!isEmpty(deletedCourseUnits)) {
        await removeCourseUnits(
          deletedCourseUnits,
          findRegistration,
          findEnrollmentRecord,
          enrollmentEvent,
          statusWithoutSpaces,
          user,
          studentProgramme,
          transaction
        );
      }

      return calculateTuition;
    });
  } else if (statusWithoutSpaces === 'FRESHER') {
    await freshersSemesterLoadsConstraint(
      newPayload,
      studentProgramme,
      findEnrollmentRecord
    );

    const courseUnitsCreated = [];

    for (const eachObject of newPayload) {
      const registrationCourseUnit = {
        registration_id: payload.registration_id,
        course_unit_id: eachObject.course_unit_id,
        course_unit_status_id: eachObject.course_unit_status_id,
      };

      await model.sequelize.transaction(async (transaction) => {
        const result = await registrationService.createCourseUnitsRecords(
          registrationCourseUnit,
          transaction
        );

        if (!isEmpty(deletedCourseUnits)) {
          await removeCourseUnits(
            deletedCourseUnits,
            findRegistration,
            findEnrollmentRecord,
            enrollmentEvent,
            statusWithoutSpaces,
            user,
            studentProgramme,
            transaction
          );
        }

        if (result[1] === true) {
          courseUnitsCreated.push(result);
        }
      });
    }

    return courseUnitsCreated;
  } else {
    throw new Error(
      'This student does not match any criteria for registration on this version of the system.'
    );
  }
};

/**
 *
 * @param {*} deletedCourseUnits
 * @param {*} findRegistration
 * @param {*} findEnrollmentRecord
 * @param {*} enrollmentEvent
 * @param {*} statusWithoutSpaces
 * @param {*} user
 * @param {*} transaction
 */
const removeCourseUnits = async function (
  deletedCourseUnits,
  findRegistration,
  findEnrollmentRecord,
  enrollmentEvent,
  statusWithoutSpaces,
  user,
  studentProgramme,
  transaction
) {
  const removedCourseUnits = [];

  const deletedRecordData = {
    deleted_at: moment.now(),
    deleted_by_id: user,
  };

  const queryAllMetadata = await metadataService.findAllMetadata({
    attributes: ['id', 'metadata_name'],
    raw: true,
  });

  const queryAllMetadataValues =
    await metadataValueService.findAllMetadataValues({
      attributes: ['id', 'metadata_id', 'metadata_value'],
      raw: true,
    });

  const invoiceStatusMetadataName = filter(queryAllMetadata, {
    metadata_name: 'INVOICE STATUSES',
  });

  const findActiveInvoiceStatus = filter(queryAllMetadataValues, {
    metadata_value: 'ACTIVE',
    metadata_id: invoiceStatusMetadataName[0].id,
  });

  const findVoidedInvoiceStatus = filter(queryAllMetadataValues, {
    metadata_value: 'VOIDED',
    metadata_id: invoiceStatusMetadataName[0].id,
  });

  const findRetakePaperId = filter(queryAllMetadataValues, {
    metadata_value: 'RETAKE PAPER',
  });

  const findMissingPaperId = filter(queryAllMetadataValues, {
    metadata_value: 'MISSING PAPER',
  });

  if (
    statusWithoutSpaces === 'CONTINUINGSTUDENT' ||
    statusWithoutSpaces === 'FINALIST'
  ) {
    for (const eachObject of deletedCourseUnits) {
      const findCourseUnit =
        await registrationService.findOneRegisteredCourseUnit({
          where: {
            registration_id: findRegistration.id,
            course_unit_id: eachObject.course_unit_id,
            course_unit_status_id: eachObject.course_unit_status_id,
          },
          attributes: ['id', 'course_unit_id', 'course_unit_status_id'],
          raw: true,
        });

      if (
        parseInt(eachObject.course_unit_status_id, 10) ===
          parseInt(findRetakePaperId[0].id, 10) ||
        parseInt(eachObject.course_unit_status_id, 10) ===
          parseInt(findMissingPaperId[0].id, 10)
      ) {
        const findOtherFeesInvoice =
          await invoiceService.findOneOtherFeesInvoiceRecords({
            where: {
              registration_course_unit_id: findCourseUnit.id,
              invoice_status_id: findActiveInvoiceStatus[0].id,
            },
            attributes: [
              'id',
              'invoice_amount',
              'amount_paid',
              'amount_due',
              'percentage_completion',
              'invoice_status_id',
              'currency',
              'description',
              'invoice_number',
            ],
          });

        const voidedInvoiceData = {
          invoice_status_id: findVoidedInvoiceStatus[0].id,
          amount_paid: 0,
          amount_due: 0,
          percentage_completion: 0,
          deleted_at: moment.now(),
          deleted_by_id: user,
        };

        if (findOtherFeesInvoice && findOtherFeesInvoice.amount_paid > 0) {
          await deAllocateAndVoidPaidOtherFeesInvoiceForContinuingAndFinalists(
            voidedInvoiceData,
            findEnrollmentRecord,
            enrollmentEvent,
            findOtherFeesInvoice,
            user,
            studentProgramme,
            transaction
          );

          const remove = await registrationService.deleteCourseUnits(
            {
              where: {
                registration_id: findRegistration.id,
                course_unit_id: eachObject.course_unit_id,
                course_unit_status_id: eachObject.course_unit_status_id,
              },
            },
            deletedRecordData
          );

          removedCourseUnits.push(remove);
        } else if (
          findOtherFeesInvoice &&
          findOtherFeesInvoice.amount_paid === 0
        ) {
          await invoiceService.updateEnrollmentOtherFeesInvoice(
            findOtherFeesInvoice.id,
            voidedInvoiceData,
            transaction
          );

          const remove = await registrationService.deleteCourseUnits(
            {
              where: {
                registration_id: findRegistration.id,
                course_unit_id: eachObject.course_unit_id,
                course_unit_status_id: eachObject.course_unit_status_id,
              },
            },
            deletedRecordData
          );

          removedCourseUnits.push(remove);
        }
      } else {
        const remove = await registrationService.deleteCourseUnits(
          {
            where: {
              registration_id: findRegistration.id,
              course_unit_id: eachObject.course_unit_id,
              course_unit_status_id: eachObject.course_unit_status_id,
            },
          },
          deletedRecordData
        );

        removedCourseUnits.push(remove);
      }
    }

    return removedCourseUnits;
  } else if (
    statusWithoutSpaces === 'DOINGRETAKESAFTERFINALYEAR' ||
    statusWithoutSpaces === 'STAYPUT'
  ) {
    for (const eachObject of deletedCourseUnits) {
      const findCourseUnit =
        await registrationService.findOneRegisteredCourseUnit({
          where: {
            registration_id: findRegistration.id,
            course_unit_id: eachObject.course_unit_id,
            course_unit_status_id: eachObject.course_unit_status_id,
          },
          attributes: ['id', 'course_unit_id', 'course_unit_status_id'],
          raw: true,
        });

      const findTuitionInvoice =
        await invoiceService.findOneTuitionInvoiceRecord({
          where: {
            registration_course_unit_id: findCourseUnit.id,
            invoice_status_id: findActiveInvoiceStatus[0].id,
          },
          attributes: [
            'id',
            'invoice_amount',
            'amount_paid',
            'amount_due',
            'percentage_completion',
            'invoice_status_id',
            'currency',
            'description',
            'invoice_number',
          ],
        });

      const voidedInvoiceData = {
        invoice_status_id: findVoidedInvoiceStatus[0].id,
        amount_paid: 0,
        amount_due: 0,
        percentage_completion: 0,
        deleted_at: moment.now(),
        deleted_by_id: user,
      };

      if (findTuitionInvoice && findTuitionInvoice.amount_paid > 0) {
        await deAllocateAndVoidPaidTuitionInvoiceForRetakersAndStayPuters(
          voidedInvoiceData,
          findEnrollmentRecord,
          enrollmentEvent,
          findTuitionInvoice,
          user,
          studentProgramme,
          transaction
        );

        const remove = await registrationService.deleteCourseUnits(
          {
            where: {
              registration_id: findRegistration.id,
              course_unit_id: eachObject.course_unit_id,
              course_unit_status_id: eachObject.course_unit_status_id,
            },
          },
          deletedRecordData
        );

        removedCourseUnits.push(remove);
      } else if (findTuitionInvoice && findTuitionInvoice.amount_paid === 0) {
        await invoiceService.updateEnrollmentTuitionInvoice(
          findTuitionInvoice.id,
          voidedInvoiceData,
          transaction
        );

        const remove = await registrationService.deleteCourseUnits(
          {
            where: {
              registration_id: findRegistration.id,
              course_unit_id: eachObject.course_unit_id,
              course_unit_status_id: eachObject.course_unit_status_id,
            },
          },
          deletedRecordData
        );

        removedCourseUnits.push(remove);
      }
    }

    return removedCourseUnits;
  } else if (statusWithoutSpaces === 'FRESHER') {
    for (const eachObject of deletedCourseUnits) {
      const remove = await registrationService.deleteCourseUnits(
        {
          where: {
            registration_id: findRegistration.id,
            course_unit_id: eachObject.course_unit_id,
            course_unit_status_id: eachObject.course_unit_status_id,
          },
        },
        deletedRecordData
      );

      removedCourseUnits.push(remove);
    }

    return removedCourseUnits;
  }
};

/** removeCourseUnitsFromRegistrationRecord
 *
 * @param {*} payload
 */
// const removeCourseUnitsFromRegistrationRecord = async function (
//   payload,
//   findStudent,
//   findEvent,
//   findEnrollmentRecord,
//   findRegistration,
//   user,
//   enrollmentEvent
// ) {
//   const deletedRecordData = {
//     deleted_at: moment.now(),
//     deleted_by_id: user,
//   };
//   const statusWithoutSpaces = findEnrollmentRecord.dataValues.enrollmentStatus.metadata_value.replace(
//     /\s/g,
//     ''
//   );

//   const semesterCourseUnits = [];

//   if (!isEmpty(payload.course_units_remaining)) {
//     payload.course_units_remaining.forEach((courseUnit) => {
//       semesterCourseUnits.push({
//         course_unit_id: parseInt(courseUnit.course_unit_id, 10),
//         course_unit_status_id: parseInt(courseUnit.course_unit_status_id, 10),
//       });
//     });
//   }

//   const newPayload = [];

//   for (const eachObject of semesterCourseUnits) {
//     const units = await courseUnitService.findOneCourseUnit({
//       where: {
//         id: eachObject.course_unit_id,
//       },
//       attributes: [
//         'id',
//         'credit_units',
//         'course_unit_code',
//         'course_unit_title',
//       ],
//       raw: true,
//     });

//     units.course_unit_status_id = eachObject.course_unit_status_id;
//     const payload = {
//       course_unit_id: units.id,
//       credit_unit: units.credit_units,
//       course_unit_code: units.course_unit_code,
//       course_unit_title: units.course_unit_title,
//       course_unit_status_id: units.course_unit_status_id,
//     };

//     newPayload.push(payload);
//   }

//   const queryAllMetadata = await metadataService.findAllMetadata({
//     attributes: ['id', 'metadata_name'],
//     raw: true,
//   });

//   const queryAllMetadataValues = await metadataValueService.findAllMetadataValues(
//     {
//       attributes: ['id', 'metadata_id', 'metadata_value'],
//       raw: true,
//     }
//   );

//   const invoiceStatusMetadataName = filter(queryAllMetadata, {
//     metadata_name: 'INVOICE STATUSES',
//   });

//   const findActiveInvoiceStatus = filter(queryAllMetadataValues, {
//     metadata_value: 'ACTIVE',
//     metadata_id: invoiceStatusMetadataName[0].id,
//   });

//   const findVoidedInvoiceStatus = filter(queryAllMetadataValues, {
//     metadata_value: 'VOIDED',
//     metadata_id: invoiceStatusMetadataName[0].id,
//   });

//   const findRetakePaperId = filter(queryAllMetadataValues, {
//     metadata_value: 'RETAKE PAPER',
//   });

//   const findMissingPaperId = filter(queryAllMetadataValues, {
//     metadata_value: 'MISSING PAPER',
//   });

//   const checkRetakersFeesPolicy = await retakersFeesPolicyService.findOneRecord(
//     {
//       where: {
//         enrollment_status_id: findEnrollmentRecord.enrollment_status_id,
//       },
//       attributes: [
//         'id',
//         'enrollment_status_id',
//         'use_default_amount',
//         'amount',
//       ],
//       include: [
//         {
//           association: 'status',
//           attributes: ['metadata_value'],
//         },
//       ],
//     }
//   );

//   if (
//     statusWithoutSpaces === 'CONTINUINGSTUDENT' ||
//     statusWithoutSpaces === 'FINALIST'
//   ) {
//     await continuingAndFinalistSemesterLoadsConstraint(
//       newPayload,
//       findStudent,
//       findEnrollmentRecord,
//       findEvent
//     );

//     const removedCourseUnits = [];

//     await model.sequelize.transaction(async (transaction) => {
//       for (const eachObject of payload.course_units_to_remove) {
//         const findCourseUnit = await registrationService.findOneRegisteredCourseUnit(
//           {
//             where: {
//               registration_id: findRegistration.id,
//               course_unit_id: eachObject.course_unit_id,
//               course_unit_status_id: eachObject.course_unit_status_id,
//             },
//             attributes: ['id', 'course_unit_id', 'course_unit_status_id'],
//             raw: true,
//           }
//         );

//         if (isEmpty(findCourseUnit)) {
//           throw new Error(
//             `One Of The course Units You Want To Delete Has No Record Of Existing On The Record.`
//           );
//         }

//         if (
//           parseInt(eachObject.course_unit_status_id, 10) ===
//             parseInt(findRetakePaperId[0].id, 10) ||
//           parseInt(eachObject.course_unit_status_id, 10) ===
//             parseInt(findMissingPaperId[0].id, 10)
//         ) {
//           const findOtherFeesInvoice = await invoiceService.findOneOtherFeesInvoiceRecords(
//             {
//               where: {
//                 registration_course_unit_id: findCourseUnit.id,
//                 invoice_status_id: findActiveInvoiceStatus[0].id,
//               },
//               attributes: [
//                 'id',
//                 'invoice_amount',
//                 'amount_paid',
//                 'amount_due',
//                 'percentage_completion',
//                 'invoice_status_id',
//                 'currency',
//                 'description',
//                 'invoice_number',
//               ],
//             }
//           );

//           const voidedInvoiceData = {
//             invoice_status_id: findVoidedInvoiceStatus[0].id,
//             amount_paid: 0,
//             amount_due: 0,
//             percentage_completion: 0,
//             deleted_at: moment.now(),
//             deleted_by_id: user,
//           };

//           if (findOtherFeesInvoice && findOtherFeesInvoice.amount_paid > 0) {
//             await deAllocateAndVoidPaidOtherFeesInvoiceForContinuingAndFinalists(
//               voidedInvoiceData,
//               findEnrollmentRecord,
//               enrollmentEvent,
//               findOtherFeesInvoice,
//               user,
//               transaction
//             );

//             const remove = await registrationService.deleteCourseUnits(
//               {
//                 where: {
//                   registration_id: findRegistration.id,
//                   course_unit_id: eachObject.course_unit_id,
//                   course_unit_status_id: eachObject.course_unit_status_id,
//                 },
//               },
//               deletedRecordData
//             );

//             removedCourseUnits.push(remove);
//           } else if (
//             findOtherFeesInvoice &&
//             findOtherFeesInvoice.amount_paid === 0
//           ) {
//             await invoiceService.updateEnrollmentOtherFeesInvoice(
//               findOtherFeesInvoice.id,
//               voidedInvoiceData,
//               transaction
//             );

//             const remove = await registrationService.deleteCourseUnits(
//               {
//                 where: {
//                   registration_id: findRegistration.id,
//                   course_unit_id: eachObject.course_unit_id,
//                   course_unit_status_id: eachObject.course_unit_status_id,
//                 },
//               },
//               deletedRecordData
//             );

//             removedCourseUnits.push(remove);
//           }
//         } else {
//           const remove = await registrationService.deleteCourseUnits(
//             {
//               where: {
//                 registration_id: findRegistration.id,
//                 course_unit_id: eachObject.course_unit_id,
//                 course_unit_status_id: eachObject.course_unit_status_id,
//               },
//             },
//             deletedRecordData
//           );

//           removedCourseUnits.push(remove);
//         }
//       }
//     });

//     return removedCourseUnits;
//   } else if (
//     statusWithoutSpaces === 'DOINGRETAKESAFTERFINALYEAR' ||
//     statusWithoutSpaces === 'STAYPUT'
//   ) {
//     if (isEmpty(checkRetakersFeesPolicy)) {
//       throw new Error('Retakers Fees Policy Has Not Yet Been Defined.');
//     }

//     await retakersSemesterLoadsConstraint(newPayload, findStudent);

//     const removedCourseUnits = [];

//     await model.sequelize.transaction(async (transaction) => {
//       for (const eachObject of payload.course_units_to_remove) {
//         const findCourseUnit = await registrationService.findOneRegisteredCourseUnit(
//           {
//             where: {
//               registration_id: findRegistration.id,
//               course_unit_id: eachObject.course_unit_id,
//               course_unit_status_id: eachObject.course_unit_status_id,
//             },
//             attributes: ['id', 'course_unit_id', 'course_unit_status_id'],
//             raw: true,
//           }
//         );

//         if (isEmpty(findCourseUnit)) {
//           throw new Error(
//             `One Of The course Units You Want To Delete Has No Record Of Existing On The Record.`
//           );
//         }

//         const findTuitionInvoice = await invoiceService.findOneTuitionInvoiceRecord(
//           {
//             where: {
//               registration_course_unit_id: findCourseUnit.id,
//               invoice_status_id: findActiveInvoiceStatus[0].id,
//             },
//             attributes: [
//               'id',
//               'invoice_amount',
//               'amount_paid',
//               'amount_due',
//               'percentage_completion',
//               'invoice_status_id',
//               'currency',
//               'description',
//               'invoice_number',
//             ],
//           }
//         );

//         const voidedInvoiceData = {
//           invoice_status_id: findVoidedInvoiceStatus[0].id,
//           amount_paid: 0,
//           amount_due: 0,
//           percentage_completion: 0,
//           deleted_at: moment.now(),
//           deleted_by_id: user,
//         };

//         if (findTuitionInvoice && findTuitionInvoice.amount_paid > 0) {
//           await deAllocateAndVoidPaidTuitionInvoiceForRetakersAndStayPuters(
//             voidedInvoiceData,
//             findEnrollmentRecord,
//             enrollmentEvent,
//             findTuitionInvoice,
//             user
//           );

//           const remove = await registrationService.deleteCourseUnits(
//             {
//               where: {
//                 registration_id: findRegistration.id,
//                 course_unit_id: eachObject.course_unit_id,
//                 course_unit_status_id: eachObject.course_unit_status_id,
//               },
//             },
//             deletedRecordData
//           );

//           removedCourseUnits.push(remove);
//         } else if (findTuitionInvoice && findTuitionInvoice.amount_paid === 0) {
//           await invoiceService.updateEnrollmentTuitionInvoice(
//             findTuitionInvoice.id,
//             voidedInvoiceData,
//             transaction
//           );

//           const remove = await registrationService.deleteCourseUnits(
//             {
//               where: {
//                 registration_id: findRegistration.id,
//                 course_unit_id: eachObject.course_unit_id,
//                 course_unit_status_id: eachObject.course_unit_status_id,
//               },
//             },
//             deletedRecordData
//           );

//           removedCourseUnits.push(remove);
//         }
//       }
//     });

//     return removedCourseUnits;
//   } else if (statusWithoutSpaces === 'FRESHER') {
//     await freshersSemesterLoadsConstraint(
//       newPayload,
//       findStudent,
//       findEnrollmentRecord
//     );

//     const removedCourseUnits = [];

//     for (const eachObject of payload.course_units_to_remove) {
//       const remove = await registrationService.deleteCourseUnits(
//         {
//           where: {
//             registration_id: findRegistration.id,
//             course_unit_id: eachObject.course_unit_id,
//             course_unit_status_id: eachObject.course_unit_status_id,
//           },
//         },
//         deletedRecordData
//       );

//       removedCourseUnits.push(remove);
//     }

//     return removedCourseUnits;
//   } else {
//     throw new Error(
//       'This student does not match any criteria for registration on this version of the system.'
//     );
//   }
// };

/**
 *
 * @param {*} voidedInvoiceData
 * @param {*} studentEnrollment
 * @param {*} enrollmentEvent
 * @param {*} findInvoice
 * @param {*} user
 */
const deAllocateAndVoidPaidTuitionInvoiceForRetakersAndStayPuters =
  async function (
    voidedInvoiceData,
    studentEnrollment,
    enrollmentEvent,
    findInvoice,
    user,
    studentProgramme,
    transaction
  ) {
    const generatedReferenceNumber = generateSystemReference('DA');

    const paymentTransactionData = {
      student_id: studentEnrollment.student_id,
      student_programme_id: studentProgramme.id,
      academic_year_id: enrollmentEvent.academic_year_id,
      semester_id: enrollmentEvent.semester_id,
      study_year_id: studentEnrollment.study_year_id,
      reference_number: null,
      amount_paid: null,
      unallocated_amount: null,
      transaction_origin: `DE-ALLOCATED INVOICE: ${findInvoice.description}`,
      currency: null,
      narration: null,
      payment_date: null,
      created_by_id: user,
      create_approval_status: 'APPROVED',
    };

    paymentTransactionData.reference_number = generatedReferenceNumber;
    paymentTransactionData.amount_paid = findInvoice.amount_paid;
    paymentTransactionData.unallocated_amount = findInvoice.amount_paid;
    paymentTransactionData.currency = findInvoice.currency;
    paymentTransactionData.narration = `Invoice Number: ${findInvoice.invoice_number}, ${findInvoice.description}`;
    paymentTransactionData.payment_date = moment.now();

    await generatePaymentReferenceByDeAllocatedInvoice(
      findInvoice,
      studentEnrollment.student_id,
      generatedReferenceNumber,
      user,
      transaction
    );
    await paymentTransactionService.createPaymentTransactionRecord(
      paymentTransactionData,
      transaction
    );

    const update = await invoiceService.updateEnrollmentTuitionInvoice(
      findInvoice.id,
      voidedInvoiceData,
      transaction
    );

    const invoice = update[1][0];

    return invoice;
  };

/**
 *
 * @param {*} voidedInvoiceData
 * @param {*} studentEnrollment
 * @param {*} enrollmentEvent
 * @param {*} findInvoice
 * @param {*} user
 */
const deAllocateAndVoidPaidOtherFeesInvoiceForContinuingAndFinalists =
  async function (
    voidedInvoiceData,
    studentEnrollment,
    enrollmentEvent,
    findInvoice,
    user,
    studentProgramme,
    transaction
  ) {
    const generatedReferenceNumber = generateSystemReference('DA');

    const paymentTransactionData = {
      student_id: studentEnrollment.student_id,
      student_programme_id: studentProgramme.id,
      academic_year_id: enrollmentEvent.academic_year_id,
      semester_id: enrollmentEvent.semester_id,
      study_year_id: studentEnrollment.study_year_id,
      reference_number: null,
      amount_paid: null,
      unallocated_amount: null,
      transaction_origin: `DE-ALLOCATED INVOICE: ${findInvoice.description}`,
      currency: null,
      narration: null,
      payment_date: null,
      created_by_id: user,
      create_approval_status: 'APPROVED',
    };

    paymentTransactionData.reference_number = generatedReferenceNumber;
    paymentTransactionData.amount_paid = findInvoice.amount_paid;
    paymentTransactionData.unallocated_amount = findInvoice.amount_paid;
    paymentTransactionData.currency = findInvoice.currency;
    paymentTransactionData.narration = `Invoice Number: ${findInvoice.invoice_number}, ${findInvoice.description}`;
    paymentTransactionData.payment_date = moment.now();

    await generatePaymentReferenceByDeAllocatedInvoice(
      findInvoice,
      studentEnrollment.student_id,
      generatedReferenceNumber,
      user,
      transaction
    );
    await paymentTransactionService.createPaymentTransactionRecord(
      paymentTransactionData,
      transaction
    );

    const update = await invoiceService.updateEnrollmentTuitionInvoice(
      findInvoice.id,
      voidedInvoiceData,
      transaction
    );

    const invoice = update[1][0];

    return invoice;
  };

/**
 *
 * @param {*} findInvoice
 * @param {*} student
 * @param {*} referenceNumber
 * @param {*} staffId
 * @param {*} transaction
 */
const generatePaymentReferenceByDeAllocatedInvoice = async function (
  findInvoice,
  student,
  referenceNumber,
  staffId,
  transaction
) {
  const generatedBy = 'STAFF';
  const referenceOrigin = `DE-ALLOCATED INVOICE: ${findInvoice.description}`;
  const expiryDate = moment.now();

  const payload = {
    reference_number: referenceNumber,
    reference_origin: referenceOrigin,
    amount: findInvoice.amount_paid,
    student_id: student,
    expiry_date: expiryDate,
    generated_by: generatedBy,
    is_used: true,
    created_by_id: staffId,
  };

  const paymentReference = await paymentReferenceService.createPaymentReference(
    payload,
    transaction
  );

  return paymentReference;
};

/**
 *
 * @param {*} registrationTypeId
 * @param {*} studentProgramme
 * @param {*} registrationEvent
 * @param {*} enrollmentRecord
 */
const normalStudentRegistrationPolicy = async function (
  registrationTypeId,
  enrollmentRecord
) {
  try {
    const registrationPolicy = await registrationPolicyService.findOneRecord({
      where: {
        enrollment_status_id: enrollmentRecord.enrollment_status_id,
        registration_type_id: registrationTypeId,
      },
      raw: true,
    });

    if (!registrationPolicy) {
      throw new Error(
        "A Registration Policy Matching The Student's Enrollment Status And Registration Type Has Not Been Defined Yet."
      );
    }

    await checkRegistrationPolicyConstraint(
      registrationPolicy,
      enrollmentRecord
    );
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} registrationTypeId
 * @param {*} enrollmentRecord
 */
const retakersStudentRegistrationPolicy = async function (
  registrationTypeId,
  enrollmentRecord
) {
  try {
    const registrationPolicy = await registrationPolicyService.findOneRecord({
      where: {
        enrollment_status_id: enrollmentRecord.enrollment_status_id,
        registration_type_id: registrationTypeId,
      },
      raw: true,
    });

    if (!registrationPolicy) {
      throw new Error(
        "A Registration Policy Matching The Student's Enrollment Status And Registration Type Has Not Been Defined Yet."
      );
    }

    await retakersRegistrationPolicyConstraint(
      registrationPolicy,
      enrollmentRecord
    );
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} payload
 * @param {*} studentProgramme
 * @param {*} registrationEvent
 * @param {*} enrollmentRecord
 * @param {*} transaction
 * @returns
 */
const handleSemesterCourseUnits = async function (
  payload,
  studentProgramme,
  registrationEvent,
  enrollmentRecord,
  transaction
) {
  const newPayload = [];

  if (studentProgramme.programmeVersion.has_plan === true) {
    const findPlanStudyYear = find(
      studentProgramme.programmeVersion.versionPlans,
      (e) =>
        parseInt(e.plan_study_year_id, 10) ===
        parseInt(enrollmentRecord.studyYear.programme_study_year_id, 10)
    );

    const findPlanSemester = find(
      studentProgramme.programmeVersion.versionPlans,
      (e) =>
        parseInt(e.plan_semester_id, 10) ===
        parseInt(registrationEvent.semester.semester_id, 10)
    );

    if (findPlanStudyYear && findPlanSemester) {
      if (!enrollmentRecord.programme_version_plan_id) {
        throw new Error(
          'There Is No Record Of A Plan Being Selected During Enrollment For This Year And Semester.'
        );
      }

      const planContextId = enrollmentRecord.programme_version_plan_id;

      if (!isEmpty(payload.course_units)) {
        for (const eachObject of payload.course_units) {
          const planCourseUnit = await courseUnitService
            .findOneProgrammeVersionPlanCourseUnit({
              where: {
                id: eachObject.course_unit_id,
                programme_version_plan_id: planContextId,
              },
              attributes: [
                'id',
                'programme_version_plan_id',
                'programme_version_course_unit_id',
              ],
              include: [
                {
                  association: 'programmeVersionCourseUnit',
                  attributes: ['id', 'course_unit_id'],
                  include: [
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
              nest: true,
            })
            .then(function (res) {
              if (res) {
                const result = res.toJSON();

                return result;
              }
            });

          if (!planCourseUnit) {
            throw new Error(
              'One Of The Course Units You Have Chosen Does not Belong To The Plan.'
            );
          }

          planCourseUnit.course_unit_status_id =
            eachObject.course_unit_status_id;

          const payload = {
            course_unit_id:
              planCourseUnit.programmeVersionCourseUnit.courseUnit.id,
            credit_unit:
              planCourseUnit.programmeVersionCourseUnit.courseUnit.credit_unit,
            course_unit_code:
              planCourseUnit.programmeVersionCourseUnit.courseUnit
                .course_unit_code,
            course_unit_name:
              planCourseUnit.programmeVersionCourseUnit.courseUnit
                .course_unit_name,
            course_unit_status_id: planCourseUnit.course_unit_status_id,
            already_billed: eachObject.already_billed,
          };

          newPayload.push(payload);
        }
      }

      await studentService.updateStudentProgramme(
        studentProgramme.id,
        {
          programme_version_plan_id: planContextId,
        },
        transaction
      );
    } else {
      if (!isEmpty(payload.course_units)) {
        for (const eachObject of payload.course_units) {
          const versionCourseUnit = await courseUnitService
            .findOneProgrammeVersionCourseUnit({
              where: {
                course_unit_id: eachObject.course_unit_id,
                programme_version_id: studentProgramme.programme_version_id,
              },
              attributes: [
                'id',
                'programme_version_id',
                'course_unit_id',
                'course_unit_semester_id',
                'course_unit_year_id',
                'course_unit_category_id',
              ],
              include: [
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
              nest: true,
            })
            .then(function (res) {
              if (res) {
                const result = res.toJSON();

                return result;
              }
            });

          if (!versionCourseUnit) {
            throw new Error(
              'One Of The Course Units You Have Chosen Does not Belong To The Programme Version.'
            );
          }

          versionCourseUnit.course_unit_status_id =
            eachObject.course_unit_status_id;

          const payload = {
            course_unit_id: versionCourseUnit.courseUnit.id,
            credit_unit: versionCourseUnit.courseUnit.credit_unit,
            course_unit_code: versionCourseUnit.courseUnit.course_unit_code,
            course_unit_name: versionCourseUnit.courseUnit.course_unit_name,
            course_unit_status_id: versionCourseUnit.course_unit_status_id,
            already_billed: eachObject.already_billed,
          };

          newPayload.push(payload);
        }
      }
    }
  } else if (studentProgramme.programmeVersion.has_specializations === true) {
    if (
      parseInt(studentProgramme.programmeVersion.specialization_year_id, 10) ===
        parseInt(enrollmentRecord.studyYear.programme_study_year_id, 10) &&
      parseInt(
        studentProgramme.programmeVersion.specialization_semester_id,
        10
      ) === parseInt(registrationEvent.semester.semester_id, 10)
    ) {
      if (!enrollmentRecord.specialization_id) {
        throw new Error(
          'There Is No Record Of A Specialization Being Selected During Enrollment For This Year And Semester.'
        );
      }

      const VersionSpecializationContextId = enrollmentRecord.specialization_id;

      if (!isEmpty(payload.course_units)) {
        for (const eachObject of payload.course_units) {
          const specializationCourseUnit = await courseUnitService
            .findOneProgrammeVersionSpecializationCourseUnit({
              where: {
                id: eachObject.course_unit_id,
                version_specialization_id: VersionSpecializationContextId,
              },
              attributes: [
                'id',
                'version_specialization_id',
                'programme_version_course_unit_id',
              ],
              include: [
                {
                  association: 'programmeVersionCourseUnit',
                  attributes: ['id', 'course_unit_id'],
                  include: [
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
              nest: true,
            })
            .then(function (res) {
              if (res) {
                const result = res.toJSON();

                return result;
              }
            });

          if (!specializationCourseUnit) {
            throw new Error(
              'One Of The Course Units You Have Chosen Does not Belong To The Specialization.'
            );
          }

          specializationCourseUnit.course_unit_status_id =
            eachObject.course_unit_status_id;

          const payload = {
            course_unit_id:
              specializationCourseUnit.programmeVersionCourseUnit.courseUnit.id,
            credit_unit:
              specializationCourseUnit.programmeVersionCourseUnit.courseUnit
                .credit_unit,
            course_unit_code:
              specializationCourseUnit.programmeVersionCourseUnit.courseUnit
                .course_unit_code,
            course_unit_name:
              specializationCourseUnit.programmeVersionCourseUnit.courseUnit
                .course_unit_name,
            course_unit_status_id:
              specializationCourseUnit.course_unit_status_id,
            already_billed: eachObject.already_billed,
          };

          newPayload.push(payload);
        }
      }

      await studentService.updateStudentProgramme(
        studentProgramme.id,
        {
          specialization_id: VersionSpecializationContextId,
        },
        transaction
      );
    } else {
      if (!isEmpty(payload.course_units)) {
        for (const eachObject of payload.course_units) {
          const versionCourseUnit = await courseUnitService
            .findOneProgrammeVersionCourseUnit({
              where: {
                course_unit_id: eachObject.course_unit_id,
                programme_version_id: studentProgramme.programme_version_id,
              },
              attributes: [
                'id',
                'programme_version_id',
                'course_unit_id',
                'course_unit_semester_id',
                'course_unit_year_id',
                'course_unit_category_id',
              ],
              include: [
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
              nest: true,
            })
            .then(function (res) {
              if (res) {
                const result = res.toJSON();

                return result;
              }
            });

          if (!versionCourseUnit) {
            throw new Error(
              'One Of The Course Units You Have Chosen Does not Belong To The Programme Version.'
            );
          }

          versionCourseUnit.course_unit_status_id =
            eachObject.course_unit_status_id;

          const payload = {
            course_unit_id: versionCourseUnit.courseUnit.id,
            credit_unit: versionCourseUnit.courseUnit.credit_unit,
            course_unit_code: versionCourseUnit.courseUnit.course_unit_code,
            course_unit_name: versionCourseUnit.courseUnit.course_unit_name,
            course_unit_status_id: versionCourseUnit.course_unit_status_id,
            already_billed: eachObject.already_billed,
          };

          newPayload.push(payload);
        }
      }
    }
  } else if (
    studentProgramme.programmeVersion.has_subject_combination_categories ===
    true
  ) {
    if (
      parseInt(
        studentProgramme.programmeVersion.subject_combination_year_id,
        10
      ) === parseInt(enrollmentRecord.studyYear.programme_study_year_id, 10) &&
      parseInt(
        studentProgramme.programmeVersion.subject_combination_semester_id,
        10
      ) === parseInt(registrationEvent.semester.semester_id, 10)
    ) {
      if (!studentProgramme.subject_combination_id) {
        throw new Error(
          'The Subject Combination That You Were Admitted To Is Not Defined On Your Programme Record.'
        );
      }

      if (!enrollmentRecord.major_subject_id) {
        throw new Error(
          'There Is No Record Of A Major Subject Area Being Selected During Enrollment For This Year And Semester.'
        );
      }

      if (!payload.minor_subject_id) {
        throw new Error(
          'There Is No Record Of A Minor Subject Area Being Selected During Enrollment For This Year And Semester.'
        );
      }

      const subjectCombSubjects = [];

      studentProgramme.subjectCombination.subjects.forEach((subject) => {
        subjectCombSubjects.push({ id: parseInt(subject.id, 10) });
      });

      const verifyMajor = filter(subjectCombSubjects, {
        id: parseInt(payload.major_subject_id, 10),
      });

      if (isEmpty(verifyMajor)) {
        throw new Error(
          'The Major Subject Area You Have Chosen Does Not Belong To Your Subject Combination.'
        );
      }

      const verifyMinor = filter(subjectCombSubjects, {
        id: parseInt(payload.minor_subject_id, 10),
      });

      if (isEmpty(verifyMinor)) {
        throw new Error(
          'The Minor Subject Area You Have Chosen Does Not Belong To Your Subject Combination.'
        );
      }

      if (!isEmpty(payload.course_units)) {
        for (const eachObject of payload.course_units) {
          const subjectCourseUnit = await courseUnitService
            .findOneSubjectCourseUnit({
              where: {
                id: eachObject.course_unit_id,
                [Op.or]: [
                  { combination_subject_id: verifyMinor[0].id },
                  { combination_subject_id: verifyMajor[0].id },
                ],
              },
              attributes: [
                'id',
                'combination_subject_id',
                'programme_version_course_unit_id',
              ],
              include: [
                {
                  association: 'courseUnit',
                  attributes: ['id', 'course_unit_id'],
                  include: [
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
              nest: true,
            })
            .then(function (res) {
              if (res) {
                const result = res.toJSON();

                return result;
              }
            });

          if (!subjectCourseUnit) {
            throw new Error(
              'One Of The Course Units You Have Chosen Does not Belong To The Either The Major Or Minor Subject Areas.'
            );
          }

          subjectCourseUnit.course_unit_status_id =
            eachObject.course_unit_status_id;

          const payload = {
            course_unit_id: subjectCourseUnit.courseUnit.courseUnit.id,
            credit_unit: subjectCourseUnit.courseUnit.courseUnit.credit_unit,
            course_unit_code:
              subjectCourseUnit.courseUnit.courseUnit.course_unit_code,
            course_unit_name:
              subjectCourseUnit.courseUnit.courseUnit.course_unit_name,
            course_unit_status_id: subjectCourseUnit.course_unit_status_id,
            already_billed: eachObject.already_billed,
          };

          newPayload.push(payload);
        }
      }

      await studentService.updateStudentProgramme(
        studentProgramme.id,
        {
          major_subject_id: verifyMajor[0].id,
        },
        transaction
      );

      await studentService.updateStudentProgramme(
        studentProgramme.id,
        {
          minor_subject_id: verifyMinor[0].id,
        },
        transaction
      );
    } else {
      if (!isEmpty(payload.course_units)) {
        for (const eachObject of payload.course_units) {
          const versionCourseUnit = await courseUnitService
            .findOneProgrammeVersionCourseUnit({
              where: {
                course_unit_id: eachObject.course_unit_id,
                programme_version_id: studentProgramme.programme_version_id,
              },
              attributes: [
                'id',
                'programme_version_id',
                'course_unit_id',
                'course_unit_semester_id',
                'course_unit_year_id',
                'course_unit_category_id',
              ],
              include: [
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
              nest: true,
            })
            .then(function (res) {
              if (res) {
                const result = res.toJSON();

                return result;
              }
            });

          if (!versionCourseUnit) {
            throw new Error(
              'One Of The Course Units You Have Chosen Does not Belong To The Programme Version.'
            );
          }

          versionCourseUnit.course_unit_status_id =
            eachObject.course_unit_status_id;

          const payload = {
            course_unit_id: versionCourseUnit.courseUnit.id,
            credit_unit: versionCourseUnit.courseUnit.credit_unit,
            course_unit_code: versionCourseUnit.courseUnit.course_unit_code,
            course_unit_name: versionCourseUnit.courseUnit.course_unit_name,
            course_unit_status_id: versionCourseUnit.course_unit_status_id,
            already_billed: eachObject.already_billed,
          };

          newPayload.push(payload);
        }
      }
    }
  }
  // else if (studentProgramme.programme.is_modular === true) {
  //   if (!payload.module_context_id) {
  //     throw new Error('You Are Required To Choose A Module.');
  //   }

  //   const findModule = programmeVersionService
  //     .findOneProgrammeVersionModule({
  //       where: {
  //         id: payload.module_context_id,
  //         programme_version_id: studentProgramme.programmeVersion.id,
  //       },
  //       attributes: [
  //         'id',
  //         'programme_version_id',
  //         'module_id',
  //         'has_module_options',
  //       ],
  //       include: [
  //         {
  //           association: 'moduleOptions',
  //           attributes: ['id', 'version_module_id', 'option_id'],
  //         },
  //       ],
  //       nest: true,
  //     })
  //     .then(function (res) {
  //       if (res) {
  //         const result = res.toJSON();

  //         return result;
  //       }
  //     });

  //   if (!findModule) {
  //     throw new Error(
  //       'The Module You Have Chosen Does not Match With Your Programme Version.'
  //     );
  //   }

  //   if (findModule.has_module_options === true) {
  //     if (!payload.option_context_id) {
  //       throw new Error(
  //         'You Are Required To Choose An Option For This Module.'
  //       );
  //     }

  //     const options = [];

  //     findModule.moduleOptions.forEach((option) => {
  //       options.push({
  //         id: parseInt(option.id, 10),
  //         version_module_id: parseInt(option.version_module_id, 10),
  //         option_id: parseInt(option.option_id, 10),
  //       });
  //     });

  //     const checkOptions = filter(options, {
  //       id: parseInt(payload.option_context_id, 10),
  //     });

  //     if (isEmpty(checkOptions)) {
  //       throw new Error(
  //         'The Option You Have Chosen Does not Match The Module Chosen.'
  //       );
  //     }
  //     if (!isEmpty(payload.course_units)) {
  //       for (const eachObject of payload.course_units) {
  //         const optionCourseUnit = await courseUnitService
  //           .findOneOptionCourseUnit({
  //             where: {
  //               id: eachObject.course_unit_id,
  //               module_option_id: checkOptions[0].id,
  //             },
  //             attributes: ['id', 'module_option_id', 'module_course_unit_id'],
  //             include: [
  //               {
  //                 association: 'courseUnit',
  //                 attributes: ['id', 'course_unit_id'],
  //                 include: [
  //                   {
  //                     association: 'courseUnit',
  //                     attributes: [
  //                       'id',
  //                       'course_unit_code',
  //                       'course_unit_name',
  //                       'credit_unit',
  //                     ],
  //                   },
  //                 ],
  //               },
  //             ],
  //             nest: true,
  //           })
  //           .then(function (res) {
  //             if (res) {
  //               const result = res.toJSON();

  //               return result;
  //             }
  //           });

  //         if (!optionCourseUnit) {
  //           throw new Error(
  //             'One Of The Course Units You Have Chosen Does not Belong To This Option.'
  //           );
  //         }

  //         optionCourseUnit.course_unit_status_id =
  //           eachObject.course_unit_status_id;

  //         const payload = {
  //           course_unit_id: optionCourseUnit.courseUnit.courseUnit.id,
  //           credit_unit: optionCourseUnit.courseUnit.courseUnit.credit_unit,
  //           course_unit_code:
  //             optionCourseUnit.courseUnit.courseUnit.course_unit_code,
  //           course_unit_name:
  //             optionCourseUnit.courseUnit.courseUnit.course_unit_name,
  //           course_unit_status_id: optionCourseUnit.course_unit_status_id,
  //           already_billed: eachObject.already_billed,
  //         };

  //         newPayload.push(payload);
  //       }
  //     }
  //   } else {
  //     if (!isEmpty(payload.course_units)) {
  //       for (const eachObject of payload.course_units) {
  //         const moduleCourseUnit = await courseUnitService
  //           .findOneModuleCourseUnit({
  //             where: {
  //               id: eachObject.course_unit_id,
  //               version_module_id: findModule.id,
  //             },
  //             attributes: [
  //               'id',
  //               'version_module_id',
  //               'course_unit_id',
  //               'course_unit_year_id',
  //               'course_unit_category_id',
  //             ],
  //             include: [
  //               {
  //                 association: 'courseUnit',
  //                 attributes: [
  //                   'id',
  //                   'course_unit_code',
  //                   'course_unit_name',
  //                   'credit_unit',
  //                 ],
  //               },
  //             ],
  //             nest: true,
  //           })
  //           .then(function (res) {
  //             if (res) {
  //               const result = res.toJSON();

  //               return result;
  //             }
  //           });

  //         if (!moduleCourseUnit) {
  //           throw new Error(
  //             'One Of The Course Units You Have Chosen Does not Belong To This Module.'
  //           );
  //         }

  //         moduleCourseUnit.course_unit_status_id =
  //           eachObject.course_unit_status_id;

  //         const payload = {
  //           course_unit_id: moduleCourseUnit.courseUnit.id,
  //           credit_unit: moduleCourseUnit.courseUnit.credit_unit,
  //           course_unit_code: moduleCourseUnit.courseUnit.course_unit_code,
  //           course_unit_name: moduleCourseUnit.courseUnit.course_unit_name,
  //           course_unit_status_id: moduleCourseUnit.course_unit_status_id,
  //           already_billed: eachObject.already_billed,
  //         };

  //         newPayload.push(payload);
  //       }
  //     }
  //   }
  // }
  else {
    if (!isEmpty(payload.course_units)) {
      for (const eachObject of payload.course_units) {
        const versionCourseUnit = await courseUnitService
          .findOneProgrammeVersionCourseUnit({
            where: {
              course_unit_id: eachObject.course_unit_id,
              programme_version_id: studentProgramme.programme_version_id,
            },
            attributes: [
              'id',
              'programme_version_id',
              'course_unit_id',
              'course_unit_semester_id',
              'course_unit_year_id',
              'course_unit_category_id',
            ],
            include: [
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
            nest: true,
          })
          .then(function (res) {
            if (res) {
              const result = res.toJSON();

              return result;
            }
          });

        if (!versionCourseUnit) {
          throw new Error(
            'One Of The Course Units You Have Chosen Does not Belong To The Programme Version.'
          );
        }

        versionCourseUnit.course_unit_status_id =
          eachObject.course_unit_status_id;

        const payload = {
          course_unit_id: versionCourseUnit.courseUnit.id,
          credit_unit: versionCourseUnit.courseUnit.credit_unit,
          course_unit_code: versionCourseUnit.courseUnit.course_unit_code,
          course_unit_name: versionCourseUnit.courseUnit.course_unit_name,
          course_unit_status_id: versionCourseUnit.course_unit_status_id,
          already_billed: eachObject.already_billed,
        };

        newPayload.push(payload);
      }
    }
  }

  return newPayload;
};

/**
 *
 * @param {*} registrationId
 * @param {*} courseUnits
 * @param {*} enrollmentRetakeCourseUnits
 * @param {*} enrollmentRecord
 * @param {*} studentId
 * @param {*} studentProgramme
 * @param {*} registrationEvent
 * @param {*} user
 * @param {*} enrollmentStatusValue
 * @param {*} transaction
 */
const handleUpdatingRegistredCourseUnits = async function (
  registrationId,
  courseUnits,
  enrollmentRetakeCourseUnits,
  enrollmentRecord,
  studentId,
  studentProgramme,
  registrationEvent,
  user,
  enrollmentStatusValue,
  transaction
) {
  try {
    if (!isEmpty(courseUnits)) {
      await deleteOrCreateElements(
        courseUnits,
        'findAllCourseUnitsOfRegistrationRecord',
        'bulkInsertCourseUnitsOfRegistrationRecord',
        'bulkRemoveCourseUnitsOfRegistrationRecord',
        'updateCourseUnitsOfRegistrationRecord',
        'course_unit_id',
        'course_unit_status_id',
        registrationId,
        enrollmentRetakeCourseUnits,
        enrollmentRecord,
        studentId,
        studentProgramme,
        registrationEvent,
        user,
        enrollmentStatusValue,
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
 * @param {*} secondField
 * @param {*} registrationId
 * @param {*} enrollmentRetakeCourseUnits
 * @param {*} enrollmentRecord
 * @param {*} studentId
 * @param {*} studentProgramme
 * @param {*} registrationEvent
 * @param {*} user
 * @param {*} enrollmentStatusValue
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
  secondField,
  registrationId,
  enrollmentRetakeCourseUnits,
  enrollmentRecord,
  studentId,
  studentProgramme,
  registrationEvent,
  user,
  enrollmentStatusValue,
  transaction
) => {
  const elementsToDelete = [];
  const elementsToInsert = [];
  const elementsToUpdate = [];

  const findAllCourseUnits = await courseUnitService.findAllCourseUnits({
    raw: true,
  });

  const allRegistrationCourseUnits =
    await registrationService.findAllCourseUnitsOfRegistrationRecord({
      where: {
        registration_id: registrationId,
      },
      attributes: ['id', 'course_unit_id', 'course_unit_status_id'],
      raw: true,
    });

  const secondElements = await registrationService[findAllService]({
    where: {
      registration_id: registrationId,
    },
    attributes: ['id', 'registration_id', firstField, secondField],
    raw: true,
  });

  firstElements.forEach((firstElement) => {
    const myElement = secondElements.find(
      (secondElement) =>
        parseInt(firstElement[firstField], 10) ===
          parseInt(secondElement[firstField], 10) &&
        parseInt(firstElement.registration_id, 10) ===
          parseInt(secondElement.registration_id, 10)
    );

    if (!myElement) {
      elementsToInsert.push(firstElement);
    } else {
      const locateContextId = secondElements.find(
        (value) =>
          parseInt(value.registration_id, 10) ===
            parseInt(firstElement.registration_id, 10) &&
          parseInt(value.course_unit_id, 10) ===
            parseInt(firstElement.course_unit_id, 10)
      );

      if (
        parseInt(locateContextId.course_unit_status_id, 10) !==
        parseInt(firstElement.course_unit_status_id, 10)
      ) {
        elementsToUpdate.push({ id: locateContextId.id, ...firstElement });
      }
    }
  });

  secondElements.forEach((secondElement) => {
    const myElement = firstElements.find(
      (firstElement) =>
        parseInt(firstElement[firstField], 10) ===
          parseInt(secondElement[firstField], 10) &&
        parseInt(firstElement.registration_id, 10) ===
          parseInt(secondElement.registration_id, 10)
    );

    if (!myElement) elementsToDelete.push(secondElement);
  });

  if (!isEmpty(elementsToInsert)) {
    const courseUnitsWithCreditUnits = [];

    if (!isEmpty(elementsToDelete)) {
      elementsToDelete.forEach((toDelete) => {
        const index = allRegistrationCourseUnits.findIndex(
          (unit) =>
            parseInt(unit.course_unit_id, 10) ===
            parseInt(toDelete.course_unit_id, 10)
        );

        if (index > -1) {
          allRegistrationCourseUnits.splice(index, 1);
        }
      });
    }

    elementsToInsert.forEach((unit) => {
      allRegistrationCourseUnits.push(unit);
    });

    allRegistrationCourseUnits.forEach((course) => {
      const findUnit = findAllCourseUnits.find(
        (unit) => parseInt(unit.id, 10) === parseInt(course.course_unit_id, 10)
      );

      if (!findUnit) {
        throw new Error(
          'Unable to find one of the course units for validation on insertion.'
        );
      }

      courseUnitsWithCreditUnits.push({
        ...course,
        credit_unit: findUnit.credit_unit,
        course_unit_code: findUnit.course_unit_code,
        course_unit_name: findUnit.course_unit_name,
      });
    });

    await validateSemesterLoads(
      enrollmentStatusValue,
      courseUnitsWithCreditUnits,
      studentProgramme
    );

    for (const item of elementsToInsert) {
      const findUnit = findAllCourseUnits.find(
        (unit) => parseInt(unit.id, 10) === parseInt(item.course_unit_id, 10)
      );

      if (!findUnit) {
        throw new Error('Unable to find one of the course units to add.');
      }

      const result = await registrationService.createCourseUnitsRecords(
        {
          registration_id: registrationId,
          ...item,
        },
        transaction
      );

      if (result[1] === true) {
        await billRetakesAndMissingPapersOnRegCourseUnitUpdate(
          [
            {
              ...item,
              credit_unit: findUnit.credit_unit,
              course_unit_code: findUnit.course_unit_code,
              course_unit_name: findUnit.course_unit_name,
            },
          ],
          result[0].dataValues.id,
          enrollmentRecord.id,
          enrollmentRecord.enrollment_status_id,
          registrationEvent.academic_year_id,
          studentProgramme,
          enrollmentStatusValue,
          studentProgramme.programme.programme_study_level_id,
          enrollmentRecord.study_year_id,
          transaction
        );
      }
    }
  }

  if (!isEmpty(elementsToDelete)) {
    const bulkDeleteIds = [];

    const courseUnitsWithCreditUnits = [];

    for (const toDelete of elementsToDelete) {
      const regCourseUnitTuitionInvoice =
        await invoiceService.findOneTuitionInvoiceRecord({
          where: {
            registration_course_unit_id: toDelete.id,
          },
          raw: true,
        });

      const regCourseUnitOtherFeesInvoice =
        await invoiceService.findOneOtherFeesInvoiceRecords({
          where: {
            registration_course_unit_id: toDelete.id,
          },
          raw: true,
        });

      if (
        regCourseUnitOtherFeesInvoice ||
        regCourseUnitTuitionInvoice ||
        !isEmpty(enrollmentRetakeCourseUnits)
      ) {
        if (regCourseUnitOtherFeesInvoice || regCourseUnitTuitionInvoice) {
          await voidingAndDeAllocatingInvoicesFromUpdatingRegisteredCourseUnits(
            studentId,
            studentProgramme.id,
            regCourseUnitTuitionInvoice ? regCourseUnitTuitionInvoice.id : null,
            regCourseUnitOtherFeesInvoice
              ? regCourseUnitOtherFeesInvoice.id
              : null,
            registrationEvent,
            enrollmentRecord,
            user,
            transaction
          );

          await registrationService.updateCourseUnitsOfRegistrationRecord(
            toDelete.id,
            {
              deleted_at: moment.now(),
            },
            transaction
          );
        } else if (!isEmpty(enrollmentRetakeCourseUnits)) {
          const enrollmentCourseUnit = enrollmentRetakeCourseUnits.find(
            (course) =>
              parseInt(course.course_unit_id, 10) ===
                parseInt(toDelete.course_unit_id, 10) && !course.deleted_at
          );

          if (enrollmentCourseUnit) {
            await voidingAndDeAllocatingInvoicesFromUpdatingRegisteredCourseUnits(
              studentId,
              studentProgramme.id,
              enrollmentCourseUnit.tuitionInvoice
                ? enrollmentCourseUnit.tuitionInvoice.id
                : null,
              enrollmentCourseUnit.otherFeesInvoice
                ? enrollmentCourseUnit.otherFeesInvoice.id
                : null,
              registrationEvent,
              enrollmentRecord,
              user,
              transaction
            );

            await enrollmentService.updateEnrollmentCourseUnit(
              enrollmentCourseUnit.id,
              {
                deleted_at: moment.now(),
              },
              transaction
            );
          }
        }
      } else {
        bulkDeleteIds.push(toDelete.id);
      }

      const index = allRegistrationCourseUnits.findIndex(
        (unit) =>
          parseInt(unit.course_unit_id, 10) ===
          parseInt(toDelete.course_unit_id, 10)
      );

      if (index > -1) {
        allRegistrationCourseUnits.splice(index, 1);
      }
    }

    if (!isEmpty(elementsToInsert)) {
      elementsToInsert.forEach((element) => {
        const findElement = allRegistrationCourseUnits.find(
          (course) =>
            parseInt(course.course_unit_id, 10) ===
            parseInt(element.course_unit_id, 10)
        );

        if (!findElement) {
          allRegistrationCourseUnits.push(findElement);
        }
      });
    }

    allRegistrationCourseUnits.forEach((course) => {
      const findUnit = findAllCourseUnits.find(
        (unit) => parseInt(unit.id, 10) === parseInt(course.course_unit_id, 10)
      );

      if (!findUnit) {
        throw new Error(
          'Unable to find one of the course units for validation on deletion.'
        );
      }

      courseUnitsWithCreditUnits.push({
        ...course,
        credit_unit: findUnit.credit_unit,
        course_unit_code: findUnit.course_unit_code,
        course_unit_name: findUnit.course_unit_name,
      });
    });

    await validateSemesterLoads(
      enrollmentStatusValue,
      courseUnitsWithCreditUnits,
      studentProgramme
    );

    await registrationService[deleteService](bulkDeleteIds, transaction);
  }

  if (!isEmpty(elementsToUpdate)) {
    const courseUnitsWithCreditUnits = [];

    for (const item of elementsToUpdate) {
      const index = allRegistrationCourseUnits.findIndex(
        (unit) =>
          parseInt(unit.course_unit_id, 10) ===
          parseInt(item.course_unit_id, 10)
      );

      if (index > -1) {
        allRegistrationCourseUnits.splice(index, 1);

        allRegistrationCourseUnits.push(item);
      }

      allRegistrationCourseUnits.forEach((course) => {
        const findUnit = findAllCourseUnits.find(
          (unit) =>
            parseInt(unit.id, 10) === parseInt(course.course_unit_id, 10)
        );

        if (!findUnit) {
          throw new Error(
            'Unable to find one of the course units for validation on updating.'
          );
        }

        courseUnitsWithCreditUnits.push({
          ...course,
          credit_unit: findUnit.credit_unit,
          course_unit_code: findUnit.course_unit_code,
          course_unit_name: findUnit.course_unit_name,
        });
      });

      await validateSemesterLoads(
        enrollmentStatusValue,
        courseUnitsWithCreditUnits,
        studentProgramme
      );

      const enrollmentCourseUnit = enrollmentRetakeCourseUnits.find(
        (course) =>
          parseInt(course.course_unit_id, 10) ===
            parseInt(item.course_unit_id, 10) && !course.deleted_at
      );

      if (enrollmentCourseUnit) {
        throw new Error(
          `${enrollmentCourseUnit.courseUnit.course_unit_code}: ${
            enrollmentCourseUnit.courseUnit.course_unit_name
          } Has Already Been Billed As ${
            enrollmentCourseUnit.tuitionInvoice
              ? enrollmentCourseUnit.tuitionInvoice.description
              : ``
          } ${
            enrollmentCourseUnit.otherFeesInvoice
              ? enrollmentCourseUnit.otherFeesInvoice.description
              : ``
          } During Enrollment. Updating It's Status Requires A De-enrollment Action.`
        );
      } else {
        const regCourseUnitTuitionInvoice =
          await invoiceService.findOneTuitionInvoiceRecord({
            where: {
              registration_course_unit_id: item.id,
            },
            raw: true,
          });

        if (regCourseUnitTuitionInvoice) {
          throw new Error(
            `A Tuition Invoice Record For ${regCourseUnitTuitionInvoice.description} Billed During Registration Has Been Found. Updating It's Status Requires A De-registration Action. `
          );
        }

        const regCourseUnitOtherFeesInvoice =
          await invoiceService.findOneOtherFeesInvoiceRecords({
            where: {
              registration_course_unit_id: item.id,
            },
            raw: true,
          });

        if (regCourseUnitOtherFeesInvoice) {
          throw new Error(
            `An Other Fees Invoice Record For ${regCourseUnitOtherFeesInvoice.description} Billed During Registration Has Been Found. Updating It's Status Requires A De-registration Action. `
          );
        }

        const findUnit = findAllCourseUnits.find(
          (unit) => parseInt(unit.id, 10) === parseInt(item.course_unit_id, 10)
        );

        if (!findUnit) {
          throw new Error('Unable to find one of the course units to update.');
        }

        await billRetakesAndMissingPapersOnRegCourseUnitUpdate(
          [
            {
              ...item,
              credit_unit: findUnit.credit_unit,
              course_unit_code: findUnit.course_unit_code,
              course_unit_name: findUnit.course_unit_name,
            },
          ],
          item.id,
          enrollmentRecord.id,
          enrollmentRecord.enrollment_status_id,
          registrationEvent.academic_year_id,
          studentProgramme,
          enrollmentStatusValue,
          studentProgramme.programme.programme_study_level_id,
          enrollmentRecord.study_year_id,
          transaction
        );

        await registrationService[updateService](item.id, item, transaction);
      }
    }
  }

  return { elementsToDelete, elementsToInsert };
};

/**
 *
 * @param {*} enrollmentStatusValue
 * @param {*} currentCourseUnits
 * @param {*} studentProgramme
 */
const validateSemesterLoads = async (
  enrollmentStatusValue,
  currentCourseUnits,
  studentProgramme
) => {
  try {
    if (
      enrollmentStatusValue.includes('DOING RETAKES') ||
      enrollmentStatusValue.includes('STAY PUT') ||
      enrollmentStatusValue.includes('AMNESTY')
    ) {
      await retakersSemesterLoadsConstraint(
        currentCourseUnits,
        studentProgramme
      );
    } else if (
      enrollmentStatusValue.includes('CONTINUING') ||
      enrollmentStatusValue.includes('FINALIST')
    ) {
      await continuingAndFinalistSemesterLoadsWithoutInsertion(
        currentCourseUnits,
        studentProgramme
      );
    } else if (enrollmentStatusValue.includes('FRESHER')) {
      await freshersSemesterLoadsConstraint(
        currentCourseUnits,
        studentProgramme
      );
    } else {
      throw new Error(`Invalid Enrollment Status: ${enrollmentStatusValue}.`);
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} enrollmentId
 * @param {*} enrollmentStatusId
 * @param {*} studentProgramme
 * @param {*} transaction
 */
const generateLateRegistrationInvoice = async (
  enrollmentId,
  enrollmentStatusId,
  studentProgramme,
  transaction
) => {
  try {
    const metadataValues = await metadataValueService.findAllMetadataValues({
      include: {
        association: 'metadata',
        attributes: ['id', 'metadata_name'],
      },
      attributes: ['id', 'metadata_value'],
    });

    const findEnrollmentRecord = await enrollmentService
      .findOneRecord({
        where: {
          id: enrollmentId,
        },
        include: [
          {
            association: 'otherFeesInvoice',
          },
        ],
        nest: true,
      })
      .then((res) => {
        if (res) {
          return res.toJSON();
        }
      });

    if (!findEnrollmentRecord) {
      throw new Error(
        `Unable To Find The Enrollment Record While Billing LATE REGISTRATION SURCHARGE.`
      );
    }

    if (findEnrollmentRecord.reg_due_date) {
      if (moment.now() > moment(findEnrollmentRecord.reg_due_date)) {
        const findAlreadyBilledSurcharge =
          findEnrollmentRecord.otherFeesInvoice.find((invoice) =>
            invoice.description.includes('LATE REGISTRATION')
          );

        if (!findAlreadyBilledSurcharge) {
          const description = `SURCHARGE: LATE REGISTRATION.`;

          const academicYearFeesPolicies =
            await academicYearFeesPolicyService.findAllRecords({
              attributes: [
                'id',
                'fees_category_id',
                'enrollment_status_id',
                'bill_by_entry_academic_year',
              ],
              raw: true,
            });

          if (isEmpty(academicYearFeesPolicies)) {
            throw new Error(
              'Unable To Find Any Academic Year Fees Policies For Your Institution.'
            );
          }

          const findLateSurchargeId = getMetadataValueIdWithoutError(
            metadataValues,
            'LATE REGISTRATION',
            'SURCHARGE TYPES'
          );

          if (findLateSurchargeId) {
            const findLateFeesPaymentRecord =
              await surchargePolicyService.findOneRecord({
                where: {
                  surcharge_type_id: findLateSurchargeId,
                },
                attributes: [
                  'id',
                  'surcharge_type_id',
                  'other_fees_element_id',
                  'is_active',
                  'duration_measure_id',
                  'duration',
                ],
                raw: true,
              });

            if (
              findLateFeesPaymentRecord &&
              findLateFeesPaymentRecord.is_active === true
            ) {
              const enrollmentStatusValue = getMetadataValueName(
                metadataValues,
                enrollmentStatusId,
                'ENROLLMENT STATUSES'
              );

              const findEnrollmentEvent = await eventService
                .findOneEvent({
                  where: {
                    id: findEnrollmentRecord.event_id,
                  },
                  include: [
                    {
                      association: 'academicYear',
                      attributes: ['id', 'academic_year_id'],
                    },
                  ],
                  nest: true,
                })
                .then((res) => {
                  if (res) {
                    return res.toJSON();
                  }
                });

              if (!findEnrollmentEvent) {
                throw new Error(
                  `Unable To Find The Enrollment Event While Billing LATE REGISTRATION`
                );
              }

              const result =
                await lateEnrollmentAndRegistrationSurchargeConstraint(
                  findLateFeesPaymentRecord.other_fees_element_id,
                  enrollmentId,
                  enrollmentStatusId,
                  enrollmentStatusValue,
                  academicYearFeesPolicies,
                  findLateFeesPaymentRecord.surcharge_type_id,
                  description,
                  studentProgramme,
                  {
                    academic_year_id:
                      findEnrollmentEvent.academicYear.academic_year_id,
                  },
                  transaction
                );

              return result;
            }
          }
        }
      }
    }
  } catch (error) {
    throw new Error(error.message);
  }
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
            attributes: ['id', 'semester_id'],
          },
        ],
      },
      {
        association: 'retakes',
      },
      {
        association: 'programme',
      },
    ],
  };
};

const studentProgrammeAttributes = function () {
  return {
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
          'programme_title',
          'programme_code',
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
          'has_plan',
          'has_subject_combination_categories',
          'has_specializations',
          'specialization_semester_id',
          'specialization_year_id',
          'subject_combination_semester_id',
          'subject_combination_year_id',
          'is_current_version',
          'has_exempt_registration',
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
          {
            association: 'exemptRegs',
            separate: true,
            attributes: ['id', 'study_year_id', 'semester_id'],
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
  };
};

module.exports = {
  getCourseUnits,
  registerThisStudent,
  updateCourseUnitsOfRegistrationRecord,
  lateRegistration,
  normalStudentRegistrationPolicy,
  studentProgrammeAttributes,
  handleUpdatingRegistredCourseUnits,
};
