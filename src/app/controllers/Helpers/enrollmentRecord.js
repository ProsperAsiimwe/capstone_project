const {
  enrollmentService,
  eventService,
  studentService,
  invoiceService,
  metadataValueService,
  paymentReferenceService,
  paymentTransactionService,
  surchargePolicyService,
  programmeService,
  academicYearFeesPolicyService,
  academicYearService,
  semesterService,
  enrollmentAndRegistrationHistoryPolicyService,
  courseUnitService,
  exemptedTuitionCampusService,
  graduationListService,
} = require('@services/index');
const {
  lateEnrollmentAndRegistrationSurchargeConstraint,
  checkPreviousEnrollmentRecords,
  checkEnrollmentStudyYear,
  billEnrollmentRetakesAndMissingPaperOtherFees,
  graduateFeesPolicyConstraint,
} = require('./policyConstraintsHelper');
const { isEmpty, toUpper, trim, find } = require('lodash');
const model = require('@models');
const moment = require('moment');
const {
  tuitionAmountPreviewByContext,
  functionalFeesPreviewByContext,
  otherFeesPreviewByContext,
} = require('../FeesManager/feesAmountInvoiceHandler');
const {
  getMetadataValueId,
  getMetadataValueName,
  getMetadataValueIdWithoutError,
} = require('@controllers/Helpers/programmeHelper');
const { generateSystemReference } = require('./paymentReferenceHelper');

/**  Enroll a student
 *
 * @param {*} payload
 * @returns
 */
const enrollStudent = async function (payload) {
  try {
    const random = Math.floor(Math.random() * moment().unix());
    const generatedToken = `ENR${random}`;

    payload.enrollment_token = generatedToken;

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
      if (payload.enrolled_by === 'STUDENT') {
        throw new Error('Your Account Status Is Inactive.');
      } else {
        throw new Error(
          'You Cannot Enroll A Student With An Inactive Account Status.'
        );
      }
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

    const findMandatoryInvoiceTypeId = getMetadataValueId(
      metadataValues,
      'MANDATORY',
      'INVOICE TYPES'
    );

    const findActiveInvoiceStatusId = getMetadataValueId(
      metadataValues,
      'ACTIVE',
      'INVOICE STATUSES'
    );

    const currentAcademicYear = await eventService.studentAcademicYear({
      campus_id: studentProgramme.campus_id,
      intake_id: studentProgramme.intake_id,
      entry_academic_year_id: studentProgramme.entry_academic_year_id,
    });

    const metaStudyYear = studentProgramme.programme.programmeStudyYears.find(
      ({ id }) => id === payload.study_year_id
    );

    if (!metaStudyYear) {
      throw new Error(`Invalid request, check enrollment study year`);
    }

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

    if (!enrollmentEvent) {
      throw new Error(
        `Unable To Find An Enrollment Event For The Student's Context.`
      );
    }

    const enrollmentStatusValue = getMetadataValueName(
      metadataValues,
      payload.enrollment_status_id,
      'ENROLLMENT STATUSES'
    );

    const findEnrollmentAndRegHistoryPolicy =
      await enrollmentAndRegistrationHistoryPolicyService
        .findOneRecord({
          where: {
            enrollment_status_id: payload.enrollment_status_id,
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

    const TuitionFeesCategoryId = getMetadataValueId(
      metadataValues,
      'TUITION FEES',
      'FEES CATEGORIES'
    );

    const FunctionalFeesCategoryId = getMetadataValueId(
      metadataValues,
      'FUNCTIONAL FEES',
      'FEES CATEGORIES'
    );

    const tuitionAcademicYearFeesPolicy = academicYearFeesPolicies.find(
      (policy) =>
        parseInt(policy.enrollment_status_id, 10) ===
          parseInt(payload.enrollment_status_id, 10) &&
        parseInt(policy.fees_category_id, 10) ===
          parseInt(TuitionFeesCategoryId, 10)
    );

    const functionalAcademicYearFeesPolicy = academicYearFeesPolicies.find(
      (policy) =>
        parseInt(policy.enrollment_status_id, 10) ===
          parseInt(payload.enrollment_status_id, 10) &&
        parseInt(policy.fees_category_id, 10) ===
          parseInt(FunctionalFeesCategoryId, 10)
    );

    if (!tuitionAcademicYearFeesPolicy) {
      throw new Error(
        `Unable To Find A Tuition Fees Academic Year Fees Policy For The Enrollment Status: ${enrollmentStatusValue}`
      );
    }

    if (!functionalAcademicYearFeesPolicy) {
      throw new Error(
        `Unable To Find A Functional Fees Academic Year Fees Policy For The Enrollment Status: ${enrollmentStatusValue}`
      );
    }

    const semesterValue = enrollmentEvent.semester;
    const semesterWithoutSpaces = toUpper(semesterValue.replace(/\s/g, ''));

    checkEnrollmentStudyYear(
      studentProgramme,
      payload.study_year_id,
      enrollmentStatusValue,
      semesterValue
    );

    if (findEnrollmentAndRegHistoryPolicy) {
      await checkPreviousEnrollmentRecords(
        studentProgramme,
        currentAcademicYear.academic_year,
        currentAcademicYear.academic_year_id,
        currentAcademicYear.semester,
        currentAcademicYear.semester_metadata_id,
        payload.study_year_id,
        enrollmentStatusValue
      );
    }

    payload.old_study_year_id = studentProgramme.current_study_year_id;
    payload.old_semester_id = studentProgramme.current_semester_id;

    await handleSpecialProgrammes(payload, studentProgramme);

    const registrationDueDate = await findRegistrationDueDate(
      metadataValues,
      currentAcademicYear.semester_start_date,
      studentProgramme.entry_academic_year_id
    );

    if (registrationDueDate) {
      payload.reg_due_date = registrationDueDate.due_date;
    }

    const enrollment = await model.sequelize.transaction(
      async (transaction) => {
        const result = await enrollmentService
          .createEnrollmentRecord(payload, transaction)
          .then((res) => {
            if (res[1] === false) {
              throw new Error(
                'This Student Already Has An Active Enrollment Record Of A Similar Context.'
              );
            }

            return res[0].dataValues;
          });

        const enrollmentId = parseInt(result.id, 10);

        const tuitionInvoice = {
          academic_year_id:
            tuitionAcademicYearFeesPolicy.bill_by_entry_academic_year === true
              ? studentProgramme.entry_academic_year_id
              : enrollmentEvent.academic_year_id,
          intake_id: studentProgramme.intake_id,
          billing_category_id: studentProgramme.billing_category_id,
          programme_id: studentProgramme.programme_id,
          programme_type_id: studentProgramme.programme_type_id,
          programme_study_year_id: payload.study_year_id,
          campus_id: studentProgramme.campus_id,
          semester: semesterWithoutSpaces,
          fees_waiver_id: studentProgramme.fees_waiver_id,
          enrollment_status: enrollmentStatusValue.replace(/\s/g, ''),
          enrollment_status_id: payload.enrollment_status_id,
          enrolled_by: payload.enrolled_by,
        };

        const functionalFeesInvoice = {
          academic_year_id:
            functionalAcademicYearFeesPolicy.bill_by_entry_academic_year ===
            true
              ? studentProgramme.entry_academic_year_id
              : enrollmentEvent.academic_year_id,
          campus_id: studentProgramme.campus_id,
          intake_id: studentProgramme.intake_id,
          billing_category_id: studentProgramme.billing_category_id,
          metadata_programme_type_id:
            studentProgramme.programmeType.programmeType.id,
          study_level_id: studentProgramme.programme.programme_study_level_id,
          semester: semesterWithoutSpaces,
          fees_waiver_id: studentProgramme.fees_waiver_id,
          enrollment_status: enrollmentStatusValue.replace(/\s/g, ''),
          enrollment_status_id: payload.enrollment_status_id,
          enrolled_by: payload.enrolled_by,
          sponsorship_id: studentProgramme.sponsorship_id,
          study_year_id: metaStudyYear.programme_study_year_id,
          semester_id: currentAcademicYear.semester_metadata_id,
        };

        let tuitionAmountInvoiceHandler = {};

        const retakesAfterFinalYearId = getMetadataValueId(
          metadataValues,
          'DOING RETAKES AFTER FINAL YEAR',
          'ENROLLMENT STATUSES'
        );

        const stayPutId = getMetadataValueId(
          metadataValues,
          'STAY PUT',
          'ENROLLMENT STATUSES'
        );

        const extensionId = getMetadataValueId(
          metadataValues,
          'EXTENSION',
          'ENROLLMENT STATUSES'
        );

        const reinstatementId = getMetadataValueId(
          metadataValues,
          'RE-INSTATEMENT',
          'ENROLLMENT STATUSES'
        );

        const exemptedTuitionCampuses = await exemptedTuitionCampusService
          .findAllExemptedTuitionCampuses({
            include: [
              {
                association: 'campus',
                attributes: ['id', 'metadata_value'],
              },
              {
                association: 'createdBy',
                attributes: ['id', 'surname', 'other_names'],
              },
            ],
          })
          .then((res) => {
            if (res) {
              return res.map((item) => item.get({ plain: true }));
            }
          });

        const findIfCampusIsExempted = exemptedTuitionCampuses.find(
          (exemption) =>
            parseInt(exemption.campus_id, 10) ===
            parseInt(studentProgramme.campus_id, 10)
        );
        const x = parseInt(retakesAfterFinalYearId, 10);
        const y = parseInt(payload.enrollment_status_id, 10);

        if (
          x !== y &&
          parseInt(stayPutId, 10) !==
            parseInt(payload.enrollment_status_id, 10) &&
          parseInt(extensionId, 10) !==
            parseInt(payload.enrollment_status_id, 10) &&
          parseInt(reinstatementId, 10) !==
            parseInt(payload.enrollment_status_id, 10)
        ) {
          if (!findIfCampusIsExempted) {
            tuitionAmountInvoiceHandler = await tuitionAmountPreviewByContext(
              tuitionInvoice
            );
          }
        }

        const functionalAmountInvoiceHandler =
          await functionalFeesPreviewByContext(functionalFeesInvoice);

        const findDueDate = await findInvoiceDueDates(
          metadataValues,
          currentAcademicYear.semester_start_date,
          studentProgramme.entry_academic_year_id
        );

        const extraData = {
          student_programme_id: payload.student_programme_id,
          created_by_id: payload.created_by_id,
          invoice_type_id: findMandatoryInvoiceTypeId,
          invoice_status_id: findActiveInvoiceStatusId,
        };

        if (findDueDate) {
          extraData.due_date = findDueDate.due_date;
        }

        let functionalFeesDescription = 'Functional Fees';

        if (
          parseInt(extensionId, 10) ===
            parseInt(payload.enrollment_status_id, 10) ||
          parseInt(reinstatementId, 10) ===
            parseInt(payload.enrollment_status_id, 10)
        ) {
          functionalFeesDescription = `${enrollmentStatusValue} Functional Fees.`;

          await graduateFeesPolicyConstraint(
            tuitionInvoice,
            metadataValues,
            findDueDate,
            payload.enrollment_status_id,
            enrollmentId,
            studentProgramme,
            enrollmentStatusValue,
            payload.created_by_id,
            transaction
          );
        }

        if (
          Object.keys(tuitionAmountInvoiceHandler).length !== 0 &&
          tuitionAmountInvoiceHandler.constructor === Object
        ) {
          await invoiceService.generateTuitionInvoiceWithHelper(
            tuitionAmountInvoiceHandler,
            enrollmentId,
            extraData,
            payload.student_id,
            transaction
          );
        }

        await invoiceService.generateFunctionalFeesInvoiceWithHelper(
          functionalAmountInvoiceHandler,
          enrollmentId,
          extraData,
          functionalFeesDescription,
          payload.student_id,
          transaction
        );

        if (!isEmpty(payload.retakes)) {
          const enrollmentCourseUnits = [];

          const findAllCourseUnits = await courseUnitService.findAllCourseUnits(
            {
              raw: true,
            }
          );

          const findRetakePaperId = getMetadataValueId(
            metadataValues,
            'RETAKE PAPER',
            'REGISTRATION STATUSES'
          );

          const findMissingPaperId = getMetadataValueId(
            metadataValues,
            'MISSING PAPER',
            'REGISTRATION STATUSES'
          );

          payload.retakes.forEach((retake) => {
            if (
              parseInt(retake.course_unit_status_id, 10) !==
                parseInt(findRetakePaperId, 10) &&
              parseInt(retake.course_unit_status_id, 10) !==
                parseInt(findMissingPaperId, 10)
            ) {
              throw new Error(
                `You can only select retakes or missing papers for billing at this point.`
              );
            }

            const findUnit = findAllCourseUnits.find(
              (unit) =>
                parseInt(unit.id, 10) === parseInt(retake.course_unit_id, 10)
            );

            if (!findUnit) {
              throw new Error(
                'Unable to find one of the course units selected.'
              );
            }

            enrollmentCourseUnits.push({
              ...retake,
              credit_unit:
                findUnit.version_credit_units || findUnit.credit_unit,
              course_unit_code: findUnit.course_unit_code,
              course_unit_name: findUnit.course_unit_name,
            });
          });

          await billEnrollmentRetakesAndMissingPaperOtherFees(
            enrollmentCourseUnits,
            enrollmentId,
            payload.enrollment_status_id,
            enrollmentEvent.academic_year_id,
            studentProgramme,
            enrollmentStatusValue,
            studentProgramme.programme.programme_study_level_id,
            payload.study_year_id,
            transaction
          );
        }

        await studentService.updateStudentProgramme(
          payload.student_programme_id,
          {
            current_study_year_id: payload.study_year_id,
            current_semester_id: currentAcademicYear.semester_metadata_id,
          },
          transaction
        );

        return result;
      }
    );

    return enrollment;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} payload
 */
const lateEnrollment = async function (payload) {
  const random = Math.floor(Math.random() * moment().unix());
  const generatedToken = `ENR${random}`;

  payload.enrollment_token = generatedToken;

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
      'You Cannot Enroll A Student With An Inactive Account Status.'
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

  const studentCampusId = studentProgramme.campus_id;
  const studentEntryAcademicYearId = studentProgramme.entry_academic_year_id;
  const studentIntakeId = studentProgramme.intake_id;

  const findEnrollmentEvent =
    await eventService.findLateEnrollmentAndRegistrationEventsFunction(
      studentCampusId,
      studentIntakeId,
      studentEntryAcademicYearId,
      "'ENROLLMENT'",
      "'KEY EVENT'",
      payload.academic_year_id,
      payload.semester_id
    );

  if (!findEnrollmentEvent) {
    throw new Error(
      "There is no enrollment event that applies to this student's context which matches the academic year and semester provided."
    );
  }

  const enrollmentStatusValue = getMetadataValueName(
    metadataValues,
    payload.enrollment_status_id,
    'ENROLLMENT STATUSES'
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

  const metaStudyYear = studentProgramme.programme.programmeStudyYears.find(
    ({ id }) => id === payload.study_year_id
  );

  if (!metaStudyYear) {
    throw new Error(`Invalid request, check enrollment study year`);
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
          enrollment_status_id: payload.enrollment_status_id,
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

  const TuitionFeesCategoryId = getMetadataValueId(
    metadataValues,
    'TUITION FEES',
    'FEES CATEGORIES'
  );

  const FunctionalFeesCategoryId = getMetadataValueId(
    metadataValues,
    'FUNCTIONAL FEES',
    'FEES CATEGORIES'
  );

  const tuitionAcademicYearFeesPolicy = academicYearFeesPolicies.find(
    (policy) =>
      parseInt(policy.enrollment_status_id, 10) ===
        parseInt(payload.enrollment_status_id, 10) &&
      parseInt(policy.fees_category_id, 10) ===
        parseInt(TuitionFeesCategoryId, 10)
  );

  const functionalAcademicYearFeesPolicy = academicYearFeesPolicies.find(
    (policy) =>
      parseInt(policy.enrollment_status_id, 10) ===
        parseInt(payload.enrollment_status_id, 10) &&
      parseInt(policy.fees_category_id, 10) ===
        parseInt(FunctionalFeesCategoryId, 10)
  );

  if (!tuitionAcademicYearFeesPolicy) {
    throw new Error(
      `Unable To Find A Tuition Fees Academic Year Fees Policy For The Enrollment Status: ${enrollmentStatusValue}`
    );
  }

  if (!functionalAcademicYearFeesPolicy) {
    throw new Error(
      `Unable To Find A Functional Fees Academic Year Fees Policy For The Enrollment Status: ${enrollmentStatusValue}`
    );
  }

  const findMandatoryInvoiceTypeId = getMetadataValueId(
    metadataValues,
    'MANDATORY',
    'INVOICE TYPES'
  );

  const findActiveInvoiceStatusId = getMetadataValueId(
    metadataValues,
    'ACTIVE',
    'INVOICE STATUSES'
  );

  const semesterValue = findEnrollmentEvent.semester;
  const semesterWithoutSpaces = toUpper(semesterValue.replace(/\s/g, ''));

  checkEnrollmentStudyYear(
    studentProgramme,
    payload.study_year_id,
    enrollmentStatusValue,
    semesterValue
  );

  if (findEnrollmentAndRegHistoryPolicy) {
    await checkPreviousEnrollmentRecords(
      studentProgramme,
      findEnrollmentEvent.academic_year,
      findAcademicYear.academic_year_id,
      findEnrollmentEvent.semester,
      findSemester.semester_id,
      payload.study_year_id,
      enrollmentStatusValue
    );
  }

  payload.event_id = findEnrollmentEvent.id;

  payload.old_study_year_id = studentProgramme.current_study_year_id;
  payload.old_semester_id = studentProgramme.current_semester_id;

  await handleSpecialProgrammes(payload, studentProgramme);

  const enrollment = await model.sequelize.transaction(async (transaction) => {
    const result = await enrollmentService
      .createEnrollmentRecord(payload, transaction)
      .then((res) => {
        if (res[1] === false) {
          throw new Error(
            'This Student Already Has An Active Enrollment Record Of A Similar Context.'
          );
        }

        return res[0].dataValues;
      });

    const enrollmentId = parseInt(result.id, 10);

    if (payload.add_invoices === true || payload.add_invoices === 'true') {
      const tuitionInvoice = {
        academic_year_id:
          tuitionAcademicYearFeesPolicy.bill_by_entry_academic_year === true
            ? studentProgramme.entry_academic_year_id
            : findEnrollmentEvent.academic_year_id,
        intake_id: studentProgramme.intake_id,
        billing_category_id: studentProgramme.billing_category_id,
        programme_id: studentProgramme.programme_id,
        programme_type_id: studentProgramme.programme_type_id,
        programme_study_year_id: payload.study_year_id,
        campus_id: studentProgramme.campus_id,
        semester: semesterWithoutSpaces,
        fees_waiver_id: studentProgramme.fees_waiver_id,
        enrollment_status: enrollmentStatusValue.replace(/\s/g, ''),
        enrollment_status_id: payload.enrollment_status_id,
      };

      const functionalFeesInvoice = {
        academic_year_id:
          functionalAcademicYearFeesPolicy.bill_by_entry_academic_year === true
            ? studentProgramme.entry_academic_year_id
            : findEnrollmentEvent.academic_year_id,
        campus_id: studentProgramme.campus_id,
        intake_id: studentProgramme.intake_id,
        billing_category_id: studentProgramme.billing_category_id,
        metadata_programme_type_id:
          studentProgramme.programmeType.programmeType.id,
        study_level_id: studentProgramme.programme.programme_study_level_id,
        semester: semesterWithoutSpaces,
        fees_waiver_id: studentProgramme.fees_waiver_id,
        enrollment_status: enrollmentStatusValue.replace(/\s/g, ''),
        enrollment_status_id: payload.enrollment_status_id,
        sponsorship_id: studentProgramme.sponsorship_id,
        study_year_id: metaStudyYear.programme_study_year_id,
        semester_id: findSemester.semester_id,
      };

      let tuitionAmountInvoiceHandler = null;

      const retakesAfterFinalYearId = getMetadataValueId(
        metadataValues,
        'DOING RETAKES AFTER FINAL YEAR',
        'ENROLLMENT STATUSES'
      );

      const stayPutId = getMetadataValueId(
        metadataValues,
        'STAY PUT',
        'ENROLLMENT STATUSES'
      );

      const extensionId = getMetadataValueId(
        metadataValues,
        'EXTENSION',
        'ENROLLMENT STATUSES'
      );

      const reinstatementId = getMetadataValueId(
        metadataValues,
        'RE-INSTATEMENT',
        'ENROLLMENT STATUSES'
      );

      const exemptedTuitionCampuses = await exemptedTuitionCampusService
        .findAllExemptedTuitionCampuses({
          include: [
            {
              association: 'campus',
              attributes: ['id', 'metadata_value'],
            },
            {
              association: 'createdBy',
              attributes: ['id', 'surname', 'other_names'],
            },
          ],
        })
        .then((res) => {
          if (res) {
            return res.map((item) => item.get({ plain: true }));
          }
        });

      const findIfCampusIsExempted = exemptedTuitionCampuses.find(
        (exemption) =>
          parseInt(exemption.campus_id, 10) ===
          parseInt(studentProgramme.campus_id, 10)
      );

      if (
        parseInt(retakesAfterFinalYearId, 10) !==
          parseInt(payload.enrollment_status_id, 10) &&
        parseInt(stayPutId, 10) !==
          parseInt(payload.enrollment_status_id, 10) &&
        parseInt(extensionId, 10) !==
          parseInt(payload.enrollment_status_id, 10) &&
        parseInt(reinstatementId, 10) !==
          parseInt(payload.enrollment_status_id, 10)
      ) {
        if (!findIfCampusIsExempted) {
          tuitionAmountInvoiceHandler = await tuitionAmountPreviewByContext(
            tuitionInvoice
          );
        }
      }

      const functionalAmountInvoiceHandler =
        await functionalFeesPreviewByContext(functionalFeesInvoice);

      const findDueDate = await findInvoiceDueDates(
        metadataValues,
        findSemester.start_date,
        studentProgramme.entry_academic_year_id
      );

      const extraData = {
        student_programme_id: payload.student_programme_id,
        created_by_id: payload.created_by_id,
        invoice_type_id: findMandatoryInvoiceTypeId,
        invoice_status_id: findActiveInvoiceStatusId,
      };

      if (findDueDate) {
        extraData.due_date = findDueDate.due_date;
      }

      let functionalFeesDescription = 'Functional Fees';

      if (
        parseInt(extensionId, 10) ===
          parseInt(payload.enrollment_status_id, 10) &&
        parseInt(reinstatementId, 10) ===
          parseInt(payload.enrollment_status_id, 10)
      ) {
        functionalFeesDescription = `${enrollmentStatusValue} Functional Fees.`;

        await graduateFeesPolicyConstraint(
          tuitionInvoice,
          metadataValues,
          findDueDate,
          payload.enrollment_status_id,
          enrollmentId,
          studentProgramme,
          enrollmentStatusValue,
          payload.created_by_id,
          transaction
        );
      }

      if (tuitionAmountInvoiceHandler) {
        await invoiceService.generateTuitionInvoiceWithHelper(
          tuitionAmountInvoiceHandler,
          enrollmentId,
          extraData,
          payload.student_id,
          transaction
        );
      }

      await invoiceService.generateFunctionalFeesInvoiceWithHelper(
        functionalAmountInvoiceHandler,
        enrollmentId,
        extraData,
        functionalFeesDescription,
        payload.student_id,
        transaction
      );
    }

    if (
      payload.add_late_enrollment_surcharge === true ||
      payload.add_late_enrollment_surcharge === 'true'
    ) {
      const findLateEnrollmentId = getMetadataValueId(
        metadataValues,
        'LATE ENROLLMENT',
        'SURCHARGE TYPES'
      );

      const findLateEnrollmentSurchargeRecord =
        await surchargePolicyService.findOneRecord({
          where: {
            surcharge_type_id: findLateEnrollmentId,
          },
          attributes: [
            'id',
            'surcharge_type_id',
            'other_fees_element_id',
            'is_active',
          ],
          raw: true,
        });

      if (!findLateEnrollmentSurchargeRecord) {
        throw new Error(
          `This Institution's LATE ENROLLMENT Surcharge Policy Has Not Yet Been Defined.`
        );
      }

      if (findLateEnrollmentSurchargeRecord.is_active === false) {
        throw new Error(
          `This Institution's LATE ENROLLMENT Surcharge Policy Must Be Given An Active Status.`
        );
      }

      // charge late enrollment surcharge
      const description = `SURCHARGE: LATE ENROLLMENT.`;

      await lateEnrollmentAndRegistrationSurchargeConstraint(
        findLateEnrollmentSurchargeRecord.other_fees_element_id,
        enrollmentId,
        payload.enrollment_status_id,
        enrollmentStatusValue,
        academicYearFeesPolicies,
        findLateEnrollmentSurchargeRecord.surcharge_type_id,
        description,
        studentProgramme,
        findEnrollmentEvent,
        transaction
      );
    }

    await studentService.updateStudentProgramme(
      payload.student_programme_id,
      {
        current_study_year_id: payload.study_year_id,
        current_semester_id: findSemester.semester_id,
      },
      transaction
    );

    return result;
  });

  return enrollment;
};

/**
 *
 * @param {*} payload
 */
const createOtherFeesInvoice = async function (
  payload,
  findStudent,
  findEnrollmentEvent
) {
  const enrollmentId = parseInt(findEnrollmentEvent.id, 10);

  const otherFeesInvoice = {
    // academic_year_id: findEnrollmentEvent.academic_year_id,
    academic_year_id: findStudent.entry_academic_year_id,
    campus_id: findStudent.campus_id,
    intake_id: findStudent.intake_id,
    billing_category_id: findStudent.billing_category_id,
    fees_waiver_id: findStudent.fees_waiver_id,
    other_fees: payload.fees_elements,
  };

  const otherFeesInvoiceHandler = await otherFeesPreviewByContext(
    otherFeesInvoice
  );

  const result = await invoiceService.generateOtherFeesInvoiceWithHelper(
    otherFeesInvoiceHandler,
    enrollmentId,
    findEnrollmentEvent.created_by_id
  );

  return result;
};

/**
 *
 * @param {*} studentId
 * @param {*} studentProgrammeId
 * @param {*} enrollmentRecord
 * @param {*} enrollmentEvent
 * @param {*} user
 * @param {*} data
 */
const voidingAndDeAllocatingInvoices = async function (
  studentId,
  studentProgrammeId,
  enrollmentRecord,
  enrollmentEvent,
  user,
  data,
  transaction
) {
  try {
    let arrayOfPaidTuitionInvoices = [];

    let arrayOfUnPaidTuitionInvoices = [];

    let arrayOfPaidFunctionalInvoices = [];

    let arrayOfUnPaidFunctionalInvoices = [];

    let arrayOfPaidOtherFeesInvoices = [];

    let arrayOfUnPaidOtherFeesInvoices = [];

    let arrayOfPaidManualInvoices = [];

    let arrayOfUnPaidManualInvoices = [];

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

    const findVoidedInvoiceStatusId = getMetadataValueId(
      metadataValues,
      'VOIDED',
      'INVOICE STATUSES'
    );

    const findTuitionInvoices = await invoiceService.findAllTuitionInvoices({
      where: {
        student_id: studentId,
        student_programme_id: studentProgrammeId,
        enrollment_id: enrollmentRecord.id,
        invoice_status_id: findActiveInvoiceStatusId,
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
      raw: true,
    });

    const findFunctionalInvoices =
      await invoiceService.findAllFunctionalFeesInvoices({
        where: {
          student_id: studentId,
          student_programme_id: studentProgrammeId,
          enrollment_id: enrollmentRecord.id,
          invoice_status_id: findActiveInvoiceStatusId,
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
        raw: true,
      });

    const findOtherFeesInvoices = await invoiceService.findAllOtherFeesInvoices(
      {
        where: {
          student_id: studentId,
          student_programme_id: studentProgrammeId,
          enrollment_id: enrollmentRecord.id,
          invoice_status_id: findActiveInvoiceStatusId,
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
        raw: true,
      }
    );

    const findManualInvoices =
      await invoiceService.findAllEnrollmentManualInvoices({
        where: {
          student_id: studentId,
          student_programme_id: studentProgrammeId,
          academic_year_id: enrollmentEvent.academic_year_id,
          semester_id: enrollmentEvent.semester_id,
          study_year_id: enrollmentRecord.study_year_id,
          invoice_status_id: findActiveInvoiceStatusId,
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
        raw: true,
      });

    const paymentTransactionData = {
      student_id: studentId,
      student_programme_id: studentProgrammeId,
      academic_year_id: enrollmentEvent.academic_year_id,
      semester_id: enrollmentEvent.semester_id,
      study_year_id: enrollmentRecord.study_year_id,
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

    const voidedEnrollmentData = {
      deleted_at: moment.now(),
      deleted_by_id: user,
      is_active: false,
      comment: data.comment,
    };

    if (!isEmpty(findTuitionInvoices)) {
      arrayOfPaidTuitionInvoices = findTuitionInvoices.filter(
        (item) => item.amount_paid > 0
      );
      arrayOfUnPaidTuitionInvoices = findTuitionInvoices.filter(
        (item) => item.amount_paid <= 0
      );
    }

    if (!isEmpty(findFunctionalInvoices)) {
      arrayOfPaidFunctionalInvoices = findFunctionalInvoices.filter(
        (item) => item.amount_paid > 0
      );
      arrayOfUnPaidFunctionalInvoices = findFunctionalInvoices.filter(
        (item) => item.amount_paid <= 0
      );
    }

    if (!isEmpty(findOtherFeesInvoices)) {
      arrayOfPaidOtherFeesInvoices = findOtherFeesInvoices.filter(
        (item) => item.amount_paid > 0
      );
      arrayOfUnPaidOtherFeesInvoices = findOtherFeesInvoices.filter(
        (item) => item.amount_paid <= 0
      );
    }

    if (!isEmpty(findManualInvoices)) {
      arrayOfPaidManualInvoices = findManualInvoices.filter(
        (item) => item.amount_paid > 0
      );
      arrayOfUnPaidManualInvoices = findManualInvoices.filter(
        (item) => item.amount_paid <= 0
      );
    }

    if (!isEmpty(arrayOfPaidTuitionInvoices)) {
      await handleDeEnrollingPaidTuitionInvoices(
        arrayOfPaidTuitionInvoices,
        paymentTransactionData,
        voidedInvoiceData,
        studentId,
        studentProgrammeId,
        user,
        transaction
      );
    }

    if (!isEmpty(arrayOfUnPaidTuitionInvoices)) {
      await handleDeEnrollingUnPaidTuitionInvoices(
        arrayOfUnPaidTuitionInvoices,
        voidedInvoiceData,
        transaction
      );
    }

    if (!isEmpty(arrayOfPaidFunctionalInvoices)) {
      await handleDeEnrollingPaidFunctionalFeesInvoices(
        arrayOfPaidFunctionalInvoices,
        paymentTransactionData,
        voidedInvoiceData,
        studentId,
        studentProgrammeId,
        user,
        transaction
      );
    }

    if (!isEmpty(arrayOfUnPaidFunctionalInvoices)) {
      await handleDeEnrollingUnPaidFunctionalFeesInvoices(
        arrayOfUnPaidFunctionalInvoices,
        voidedInvoiceData,
        transaction
      );
    }

    if (!isEmpty(arrayOfPaidOtherFeesInvoices)) {
      await handleDeEnrollingPaidOtherFeesFeesInvoices(
        arrayOfPaidOtherFeesInvoices,
        paymentTransactionData,
        voidedInvoiceData,
        studentId,
        studentProgrammeId,
        user,
        transaction
      );
    }

    if (!isEmpty(arrayOfUnPaidOtherFeesInvoices)) {
      await handleDeEnrollingUnPaidOtherFeesFeesInvoices(
        arrayOfUnPaidOtherFeesInvoices,
        voidedInvoiceData,
        transaction
      );
    }

    if (!isEmpty(arrayOfPaidManualInvoices)) {
      await handleDeEnrollingPaidManualInvoices(
        arrayOfPaidManualInvoices,
        paymentTransactionData,
        voidedInvoiceData,
        studentId,
        studentProgrammeId,
        user,
        transaction
      );
    }

    if (!isEmpty(arrayOfUnPaidManualInvoices)) {
      await handleDeEnrollingUnPaidManualInvoices(
        arrayOfUnPaidManualInvoices,
        voidedInvoiceData,
        transaction
      );
    }

    const updatedEnrollmentRecord = await enrollmentService.updateRecord(
      enrollmentRecord.id,
      voidedEnrollmentData,
      transaction
    );

    const response = updatedEnrollmentRecord[1][0];

    return response;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} studentId
 * @param {*} studentProgrammeId
 * @param {*} tuitionInvoiceId
 * @param {*} otherFeesInvoiceId
 * @param {*} registrationEvent
 * @param {*} enrollmentRecord
 * @param {*} user
 * @param {*} transaction
 */
const voidingAndDeAllocatingInvoicesFromUpdatingRegisteredCourseUnits =
  async function (
    studentId,
    studentProgrammeId,
    tuitionInvoiceId,
    otherFeesInvoiceId,
    registrationEvent,
    enrollmentRecord,
    user,
    transaction
  ) {
    try {
      let arrayOfPaidTuitionInvoices = [];

      let arrayOfUnPaidTuitionInvoices = [];

      let arrayOfPaidOtherFeesInvoices = [];

      let arrayOfUnPaidOtherFeesInvoices = [];

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

      const findVoidedInvoiceStatusId = getMetadataValueId(
        metadataValues,
        'VOIDED',
        'INVOICE STATUSES'
      );

      const findTuitionInvoices = await invoiceService.findAllTuitionInvoices({
        where: {
          id: tuitionInvoiceId,
          invoice_status_id: findActiveInvoiceStatusId,
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
        raw: true,
      });

      const findOtherFeesInvoices =
        await invoiceService.findAllOtherFeesInvoices({
          where: {
            id: otherFeesInvoiceId,
            invoice_status_id: findActiveInvoiceStatusId,
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
          raw: true,
        });

      const paymentTransactionData = {
        student_id: studentId,
        student_programme_id: studentProgrammeId,
        academic_year_id: registrationEvent.academic_year_id,
        semester_id: registrationEvent.semester_id,
        study_year_id: enrollmentRecord.study_year_id,
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

      if (!isEmpty(findTuitionInvoices)) {
        arrayOfPaidTuitionInvoices = findTuitionInvoices.filter(
          (item) => item.amount_paid > 0
        );
        arrayOfUnPaidTuitionInvoices = findTuitionInvoices.filter(
          (item) => item.amount_paid <= 0
        );
      }

      if (!isEmpty(findOtherFeesInvoices)) {
        arrayOfPaidOtherFeesInvoices = findOtherFeesInvoices.filter(
          (item) => item.amount_paid > 0
        );
        arrayOfUnPaidOtherFeesInvoices = findOtherFeesInvoices.filter(
          (item) => item.amount_paid <= 0
        );
      }

      if (!isEmpty(arrayOfPaidTuitionInvoices)) {
        await handleDeEnrollingPaidTuitionInvoices(
          arrayOfPaidTuitionInvoices,
          paymentTransactionData,
          voidedInvoiceData,
          studentId,
          studentProgrammeId,
          user,
          transaction
        );
      }

      if (!isEmpty(arrayOfUnPaidTuitionInvoices)) {
        await handleDeEnrollingUnPaidTuitionInvoices(
          arrayOfUnPaidTuitionInvoices,
          voidedInvoiceData,
          transaction
        );
      }

      if (!isEmpty(arrayOfPaidOtherFeesInvoices)) {
        await handleDeEnrollingPaidOtherFeesFeesInvoices(
          arrayOfPaidOtherFeesInvoices,
          paymentTransactionData,
          voidedInvoiceData,
          studentId,
          studentProgrammeId,
          user,
          transaction
        );
      }

      if (!isEmpty(arrayOfUnPaidOtherFeesInvoices)) {
        await handleDeEnrollingUnPaidOtherFeesFeesInvoices(
          arrayOfUnPaidOtherFeesInvoices,
          voidedInvoiceData,
          transaction
        );
      }
    } catch (error) {
      throw new Error(error.message);
    }
  };

/**
 *
 * @param {*} manualInvoicesToVoid
 * @param {*} otherFeesInvoicesToVoid
 * @param {*} user
 * @param {*} transaction
 */
const voidingAndDeAllocatingInvoicesFromVoidingApprovals = async function (
  manualInvoicesToVoid,
  otherFeesInvoicesToVoid,
  user,
  transaction
) {
  try {
    let arrayOfPaidManualInvoices = [];

    let arrayOfUnPaidManualInvoices = [];

    let arrayOfPaidOtherFeesInvoices = [];

    let arrayOfUnPaidOtherFeesInvoices = [];

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

    const findVoidedInvoiceStatusId = getMetadataValueId(
      metadataValues,
      'VOIDED',
      'INVOICE STATUSES'
    );

    const manualInvoices = [];

    if (!isEmpty(manualInvoicesToVoid)) {
      for (const invoiceObj of manualInvoicesToVoid) {
        const manualInvoice = await invoiceService.findOneManualInvoiceRecord({
          where: {
            id: invoiceObj.id,
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
            'student_id',
            'student_programme_id',
            'academic_year_id',
            'semester_id',
            'study_year_id',
          ],
          raw: true,
        });

        if (!manualInvoice) {
          throw new Error(
            `Unable To Find One Of The Manual Invoices Provided.`
          );
        }

        if (
          parseInt(manualInvoice.invoice_status_id, 10) !==
          parseInt(findActiveInvoiceStatusId, 10)
        ) {
          throw new Error(
            `The Manual Invoice ${manualInvoice.invoice_number} Is Not Active.`
          );
        }

        manualInvoices.push({
          ...manualInvoice,
          credit_paid_funds_to_account: invoiceObj.credit_paid_funds_to_account,
        });
      }
    }

    const findOtherFeesInvoices = [];

    if (!isEmpty(otherFeesInvoicesToVoid)) {
      for (const invoiceObj of otherFeesInvoicesToVoid) {
        const otherFeesInvoice = await invoiceService
          .findOneOtherFeesInvoiceRecords({
            where: {
              id: invoiceObj.id,
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
              'student_id',
              'student_programme_id',
              'enrollment_id',
            ],
            include: [
              {
                association: 'enrollment',
                include: [
                  {
                    association: 'event',
                    attributes: ['id', 'academic_year_id', 'semester_id'],
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

        if (!otherFeesInvoice) {
          throw new Error(
            `Unable To Find One Of The Other Fees Invoices Provided.`
          );
        }

        if (
          parseInt(otherFeesInvoice.invoice_status_id, 10) !==
          parseInt(findActiveInvoiceStatusId, 10)
        ) {
          throw new Error(
            `The Other Fees Invoice ${otherFeesInvoice.invoice_number} Is Not Active.`
          );
        }

        findOtherFeesInvoices.push({
          ...otherFeesInvoice,
          credit_paid_funds_to_account: invoiceObj.credit_paid_funds_to_account,
        });
      }
    }

    const voidedInvoiceData = {
      invoice_status_id: findVoidedInvoiceStatusId,
      amount_paid: 0,
      amount_due: 0,
      percentage_completion: 0,
      deleted_at: moment.now(),
      deleted_by_id: user,
    };

    if (!isEmpty(manualInvoices)) {
      arrayOfPaidManualInvoices = manualInvoices.filter(
        (item) => item.amount_paid > 0
      );
      arrayOfUnPaidManualInvoices = manualInvoices.filter(
        (item) => item.amount_paid <= 0
      );
    }

    if (!isEmpty(findOtherFeesInvoices)) {
      arrayOfPaidOtherFeesInvoices = findOtherFeesInvoices.filter(
        (item) => item.amount_paid > 0
      );
      arrayOfUnPaidOtherFeesInvoices = findOtherFeesInvoices.filter(
        (item) => item.amount_paid <= 0
      );
    }

    if (!isEmpty(arrayOfPaidManualInvoices)) {
      for (const invoice of arrayOfPaidManualInvoices) {
        await handleDeEnrollingPaidManualInvoices(
          [invoice],
          {
            student_id: invoice.student_id,
            student_programme_id: invoice.student_programme_id,
            academic_year_id: invoice.academic_year_id,
            semester_id: invoice.semester_id,
            study_year_id: invoice.study_year_id,
            system_prn: null,
            amount_paid: null,
            unallocated_amount: null,
            transaction_origin: null,
            currency: null,
            narration: null,
            payment_date: null,
            created_by_id: user,
            create_approval_status: 'APPROVED',
          },
          voidedInvoiceData,
          invoice.student_id,
          invoice.student_programme_id,
          user,
          transaction
        );
      }
    }

    if (!isEmpty(arrayOfUnPaidManualInvoices)) {
      await handleDeEnrollingUnPaidManualInvoices(
        arrayOfUnPaidManualInvoices,
        voidedInvoiceData,
        transaction
      );
    }

    if (!isEmpty(arrayOfPaidOtherFeesInvoices)) {
      for (const invoice of arrayOfPaidOtherFeesInvoices) {
        await handleDeEnrollingPaidOtherFeesFeesInvoices(
          [invoice],
          {
            student_id: invoice.student_id,
            student_programme_id: invoice.student_programme_id,
            academic_year_id: invoice.enrollment.event.academic_year_id,
            semester_id: invoice.enrollment.event.semester_id,
            study_year_id: invoice.enrollment.study_year_id,
            system_prn: null,
            amount_paid: null,
            unallocated_amount: null,
            transaction_origin: null,
            currency: null,
            narration: null,
            payment_date: null,
            created_by_id: user,
            create_approval_status: 'APPROVED',
          },
          voidedInvoiceData,
          invoice.student_id,
          invoice.student_programme_id,
          user,
          transaction
        );
      }
    }

    if (!isEmpty(arrayOfUnPaidOtherFeesInvoices)) {
      await handleDeEnrollingUnPaidOtherFeesFeesInvoices(
        arrayOfUnPaidOtherFeesInvoices,
        voidedInvoiceData,
        transaction
      );
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} arrayOfPaidTuitionInvoices
 * @param {*} paymentTransactionData
 * @param {*} voidedInvoiceData
 * @param {*} studentId
 * @param {*} studentProgrammeId
 * @param {*} user
 */
const handleDeEnrollingPaidTuitionInvoices = async function (
  arrayOfPaidTuitionInvoices,
  paymentTransactionData,
  voidedInvoiceData,
  studentId,
  studentProgrammeId,
  user,
  transaction
) {
  try {
    const updatedInvoices = [];

    for (const eachObject of arrayOfPaidTuitionInvoices) {
      const generatedReferenceNumber = generateSystemReference('DA');

      paymentTransactionData.system_prn = generatedReferenceNumber;
      paymentTransactionData.amount = eachObject.amount_paid;
      paymentTransactionData.unallocated_amount = eachObject.amount_paid;
      paymentTransactionData.currency = eachObject.currency;
      paymentTransactionData.student_programme_id = studentProgrammeId;
      paymentTransactionData.narration = `Invoice Number: ${eachObject.invoice_number}, ${eachObject.description}`;
      paymentTransactionData.transaction_origin = `DE-ALLOCATED INVOICE: ${eachObject.description}`;
      paymentTransactionData.payment_date = moment.now();

      await generatePaymentReferenceByDeAllocatedInvoice(
        eachObject.amount_paid,
        eachObject.description,
        studentId,
        studentProgrammeId,
        generatedReferenceNumber,
        user,
        transaction
      );

      await paymentTransactionService.createPaymentTransactionRecord(
        paymentTransactionData,
        transaction
      );

      const result = await invoiceService.updateEnrollmentTuitionInvoice(
        eachObject.id,
        voidedInvoiceData,
        transaction
      );

      updatedInvoices.push(result);
    }

    return updatedInvoices;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} arrayOfUnPaidTuitionInvoices
 * @param {*} voidedInvoiceData
 */

const handleDeEnrollingUnPaidTuitionInvoices = async function (
  arrayOfUnPaidTuitionInvoices,
  voidedInvoiceData,
  transaction
) {
  try {
    const updatedInvoices = [];

    for (const eachObject of arrayOfUnPaidTuitionInvoices) {
      const result = await invoiceService.updateEnrollmentTuitionInvoice(
        eachObject.id,
        voidedInvoiceData,
        transaction
      );

      updatedInvoices.push(result);
    }

    return updatedInvoices;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} arrayOfPaidFunctionalInvoices
 * @param {*} paymentTransactionData
 * @param {*} voidedInvoiceData
 * @param {*} studentId
 * @param {*} studentProgrammeId
 * @param {*} user
 */
const handleDeEnrollingPaidFunctionalFeesInvoices = async function (
  arrayOfPaidFunctionalInvoices,
  paymentTransactionData,
  voidedInvoiceData,
  studentId,
  studentProgrammeId,
  user,
  transaction
) {
  try {
    const updatedInvoices = [];

    for (const eachObject of arrayOfPaidFunctionalInvoices) {
      const generatedReferenceNumber = generateSystemReference('DA');

      paymentTransactionData.system_prn = generatedReferenceNumber;
      paymentTransactionData.amount = eachObject.amount_paid;
      paymentTransactionData.unallocated_amount = eachObject.amount_paid;
      paymentTransactionData.currency = eachObject.currency;
      paymentTransactionData.student_programme_id = studentProgrammeId;
      paymentTransactionData.narration = `Invoice Number: ${eachObject.invoice_number}, ${eachObject.description}`;
      paymentTransactionData.transaction_origin = `DE-ALLOCATED INVOICE: ${eachObject.description}`;
      paymentTransactionData.payment_date = moment.now();

      await generatePaymentReferenceByDeAllocatedInvoice(
        eachObject.amount_paid,
        eachObject.description,
        studentId,
        studentProgrammeId,
        generatedReferenceNumber,
        user,
        transaction
      );

      await paymentTransactionService.createPaymentTransactionRecord(
        paymentTransactionData,
        transaction
      );

      const result = await invoiceService.updateEnrollmentFunctionalInvoice(
        eachObject.id,
        voidedInvoiceData,
        transaction
      );

      updatedInvoices.push(result);
    }

    return updatedInvoices;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * @param {*} arrayOfUnPaidFunctionalInvoices
 * @param {*} voidedInvoiceData
 */

const handleDeEnrollingUnPaidFunctionalFeesInvoices = async function (
  arrayOfUnPaidFunctionalInvoices,
  voidedInvoiceData,
  transaction
) {
  try {
    const updatedInvoices = [];

    for (const eachObject of arrayOfUnPaidFunctionalInvoices) {
      const result = await invoiceService.updateEnrollmentFunctionalInvoice(
        eachObject.id,
        voidedInvoiceData,
        transaction
      );

      updatedInvoices.push(result);
    }

    return updatedInvoices;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} arrayOfPaidOtherFeesInvoices
 * @param {*} paymentTransactionData
 * @param {*} voidedInvoiceData
 * @param {*} studentId
 * @param {*} studentProgrammeId
 * @param {*} user
 */
const handleDeEnrollingPaidOtherFeesFeesInvoices = async function (
  arrayOfPaidOtherFeesInvoices,
  paymentTransactionData,
  voidedInvoiceData,
  studentId,
  studentProgrammeId,
  user,
  transaction
) {
  try {
    const updatedInvoices = [];

    for (const eachObject of arrayOfPaidOtherFeesInvoices) {
      eachObject.credit_paid_funds_to_account =
        eachObject.credit_paid_funds_to_account !== undefined
          ? eachObject.credit_paid_funds_to_account
          : true;

      if (eachObject.credit_paid_funds_to_account === true) {
        const generatedReferenceNumber = generateSystemReference('DA');

        paymentTransactionData.system_prn = generatedReferenceNumber;
        paymentTransactionData.amount = eachObject.amount_paid;
        paymentTransactionData.unallocated_amount = eachObject.amount_paid;
        paymentTransactionData.currency = eachObject.currency;
        paymentTransactionData.student_programme_id = studentProgrammeId;
        paymentTransactionData.narration = `Invoice Number: ${eachObject.invoice_number}, ${eachObject.description}`;
        paymentTransactionData.transaction_origin = `DE-ALLOCATED INVOICE: ${eachObject.description}`;
        paymentTransactionData.payment_date = moment.now();

        await generatePaymentReferenceByDeAllocatedInvoice(
          eachObject.amount_paid,
          eachObject.description,
          studentId,
          studentProgrammeId,
          generatedReferenceNumber,
          user,
          transaction
        );

        await paymentTransactionService.createPaymentTransactionRecord(
          paymentTransactionData,
          transaction
        );
      }

      const result = await invoiceService.updateEnrollmentOtherFeesInvoice(
        eachObject.id,
        voidedInvoiceData,
        transaction
      );

      updatedInvoices.push(result);
    }

    return updatedInvoices;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} arrayOfUnPaidOtherFeesInvoices
 * @param {*} voidedInvoiceData
 */
const handleDeEnrollingUnPaidOtherFeesFeesInvoices = async function (
  arrayOfUnPaidOtherFeesInvoices,
  voidedInvoiceData,
  transaction
) {
  try {
    const updatedInvoices = [];

    for (const eachObject of arrayOfUnPaidOtherFeesInvoices) {
      const result = await invoiceService.updateEnrollmentOtherFeesInvoice(
        eachObject.id,
        voidedInvoiceData,
        transaction
      );

      updatedInvoices.push(result);
    }

    return updatedInvoices;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} arrayOfPaidManualInvoices
 * @param {*} paymentTransactionData
 * @param {*} voidedInvoiceData
 * @param {*} studentId
 * @param {*} studentProgrammeId
 * @param {*} user
 * @param {*} transaction
 */
const handleDeEnrollingPaidManualInvoices = async function (
  arrayOfPaidManualInvoices,
  paymentTransactionData,
  voidedInvoiceData,
  studentId,
  studentProgrammeId,
  user,
  transaction
) {
  try {
    const updatedInvoices = [];

    for (const eachObject of arrayOfPaidManualInvoices) {
      eachObject.credit_paid_funds_to_account =
        eachObject.credit_paid_funds_to_account !== undefined
          ? eachObject.credit_paid_funds_to_account
          : true;

      if (eachObject.credit_paid_funds_to_account === true) {
        const generatedReferenceNumber = generateSystemReference('DA');

        paymentTransactionData.system_prn = generatedReferenceNumber;
        paymentTransactionData.amount = eachObject.amount_paid;
        paymentTransactionData.unallocated_amount = eachObject.amount_paid;
        paymentTransactionData.currency = eachObject.currency;
        paymentTransactionData.student_programme_id = studentProgrammeId;
        paymentTransactionData.narration = `Invoice Number: ${eachObject.invoice_number}, ${eachObject.description}`;
        paymentTransactionData.transaction_origin = `DE-ALLOCATED INVOICE: ${eachObject.description}`;
        paymentTransactionData.payment_date = moment.now();

        await generatePaymentReferenceByDeAllocatedInvoice(
          eachObject.amount_paid,
          eachObject.description,
          studentId,
          studentProgrammeId,
          generatedReferenceNumber,
          user,
          transaction
        );

        await paymentTransactionService.createPaymentTransactionRecord(
          paymentTransactionData,
          transaction
        );
      }

      const result = await invoiceService.updateEnrollmentManualInvoice(
        eachObject.id,
        voidedInvoiceData,
        transaction
      );

      updatedInvoices.push(result);
    }

    return updatedInvoices;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} arrayOfUnPaidManualInvoices
 * @param {*} voidedInvoiceData
 * @param {*} transaction
 */
const handleDeEnrollingUnPaidManualInvoices = async function (
  arrayOfUnPaidManualInvoices,
  voidedInvoiceData,
  transaction
) {
  try {
    const updatedInvoices = [];

    for (const eachObject of arrayOfUnPaidManualInvoices) {
      const result = await invoiceService.updateEnrollmentManualInvoice(
        eachObject.id,
        voidedInvoiceData,
        transaction
      );

      updatedInvoices.push(result);
    }

    return updatedInvoices;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * Generate payment Reference By De-allocated Invoice
 */
const generatePaymentReferenceByDeAllocatedInvoice = async function (
  amount,
  description,
  studentId,
  studentProgrammeId,
  referenceNumber,
  staffId,
  transaction
) {
  try {
    const generatedBy = 'STAFF';
    const referenceOrigin = `DE-ALLOCATED INVOICE: ${description}`;
    const expiryDate = moment.now();

    const payload = {
      system_prn: referenceNumber,
      ura_prn: referenceNumber,
      search_code: 'VOID',
      tax_payer_name: 'VOID',
      payment_mode: 'VOID',
      reference_origin: referenceOrigin,
      amount: amount,
      student_id: studentId,
      student_programme_id: studentProgrammeId,
      expiry_date: expiryDate,
      generated_by: generatedBy,
      is_used: true,
      created_by_id: staffId,
    };

    const paymentReference =
      await paymentReferenceService.createPaymentReference(
        payload,
        transaction
      );

    return paymentReference;
  } catch (error) {
    throw new Error(error.message);
  }
};

const handleSpecialProgrammes = async function (payload, studentProgramme) {
  try {
    const findStudyYear = await programmeService.findOneProgrammeStudyYear({
      where: {
        id: payload.study_year_id,
      },
      attributes: ['id', 'programme_study_year_id'],
      raw: true,
    });

    if (!findStudyYear) {
      throw new Error('Invalid Study Year Provided.');
    }

    if (studentProgramme.programmeVersion.has_plan === true) {
      const findPlanStudyYear = find(
        studentProgramme.programmeVersion.versionPlans,
        (e) =>
          parseInt(e.plan_study_year_id, 10) ===
          parseInt(findStudyYear.programme_study_year_id, 10)
      );

      const findPlanSemester = find(
        studentProgramme.programmeVersion.versionPlans,
        (e) =>
          parseInt(e.plan_semester_id, 10) === parseInt(payload.semester_id, 10)
      );

      if (findPlanStudyYear && findPlanSemester && !payload.plan_id) {
        throw new Error(
          'You Are Required To Choose A Plan In This Year And Semester.'
        );
      }
    } else if (studentProgramme.programmeVersion.has_specializations === true) {
      if (
        parseInt(
          studentProgramme.programmeVersion.specialization_year_id,
          10
        ) === parseInt(findStudyYear.programme_study_year_id, 10) &&
        parseInt(
          studentProgramme.programmeVersion.specialization_semester_id,
          10
        ) === parseInt(payload.semester_id, 10)
      ) {
        if (!payload.specialization_id) {
          throw new Error(
            'You Are Required To Choose A Specialization In This Year And Semester.'
          );
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
        ) === parseInt(findStudyYear.programme_study_year_id, 10) &&
        parseInt(
          studentProgramme.programmeVersion.subject_combination_semester_id,
          10
        ) === parseInt(payload.semester_id, 10)
      ) {
        if (!studentProgramme.subject_combination_id) {
          throw new Error(
            'The Subject Combination That You Were Admitted To Is Not Defined On Your Programme Record.'
          );
        }

        if (!payload.major_subject_id) {
          throw new Error('You Are Required To Choose A Major Subject Area.');
        }

        if (!payload.minor_subject_id) {
          throw new Error('You Are Required To Choose A Minor Subject Area.');
        }
      }
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} metadataValues
 * @param {*} semesterStartDate
 * @param {*} entryAcademicYearId
 * @returns
 */
const findInvoiceDueDates = async (
  metadataValues,
  semesterStartDate,
  entryAcademicYearId
) => {
  try {
    const data = {};

    const findLateSurchargeId = getMetadataValueIdWithoutError(
      metadataValues,
      'LATE FEES PAYMENT',
      'SURCHARGE TYPES'
    );

    if (findLateSurchargeId) {
      const findLateFeesPaymentRecord = await surchargePolicyService
        .findOneRecord({
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
          include: [
            {
              association: 'entryYears',
            },
          ],
          nest: true,
        })
        .then((res) => {
          if (res) {
            return res.toJSON();
          }
        });

      if (
        findLateFeesPaymentRecord &&
        findLateFeesPaymentRecord.is_active === true
      ) {
        const durationMeasureName = getMetadataValueName(
          metadataValues,
          findLateFeesPaymentRecord.duration_measure_id,
          'DURATION MEASURES'
        );

        let newDuration = null;

        if (!isEmpty(findLateFeesPaymentRecord.entryYears)) {
          const findStudentPolicy = findLateFeesPaymentRecord.entryYears.find(
            (policy) =>
              parseInt(policy.entry_academic_year_id, 10) ===
              parseInt(entryAcademicYearId, 10)
          );

          if (findStudentPolicy) {
            newDuration = findStudentPolicy.duration;
          }
        } else {
          newDuration = findLateFeesPaymentRecord.duration;
        }

        if (newDuration) {
          if (toUpper(trim(durationMeasureName)) === 'DAY') {
            const duration = moment.duration({
              days: newDuration,
            });

            data.due_date = moment(semesterStartDate).add(duration);
          } else if (toUpper(trim(durationMeasureName)) === 'WEEK') {
            const duration = moment.duration({
              weeks: newDuration,
            });

            data.due_date = moment(semesterStartDate).add(duration);
          } else if (toUpper(trim(durationMeasureName)) === 'MONTH') {
            const duration = moment.duration({
              months: newDuration,
            });

            data.due_date = moment(semesterStartDate).add(duration);
          } else if (toUpper(trim(durationMeasureName)) === 'YEAR') {
            const duration = moment.duration({
              years: newDuration,
            });

            data.due_date = moment(semesterStartDate).add(duration);
          }

          return data;
        }
      }
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} metadataValues
 * @param {*} semesterStartDate
 * @param {*} entryAcademicYearId
 * @returns
 */
const findRegistrationDueDate = async (
  metadataValues,
  semesterStartDate,
  entryAcademicYearId
) => {
  try {
    const data = {};

    const findLateSurchargeId = getMetadataValueIdWithoutError(
      metadataValues,
      'LATE REGISTRATION',
      'SURCHARGE TYPES'
    );

    if (findLateSurchargeId) {
      const findLateRegistrationRecord = await surchargePolicyService
        .findOneRecord({
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
          include: [
            {
              association: 'entryYears',
            },
          ],
          nest: true,
        })
        .then((res) => {
          if (res) {
            return res.toJSON();
          }
        });

      if (
        findLateRegistrationRecord &&
        findLateRegistrationRecord.is_active === true &&
        findLateRegistrationRecord.duration_measure_id
      ) {
        const durationMeasureName = getMetadataValueName(
          metadataValues,
          findLateRegistrationRecord.duration_measure_id,
          'DURATION MEASURES'
        );

        let newDuration = null;

        if (!isEmpty(findLateRegistrationRecord.entryYears)) {
          const findStudentPolicy = findLateRegistrationRecord.entryYears.find(
            (policy) =>
              parseInt(policy.entry_academic_year_id, 10) ===
              parseInt(entryAcademicYearId, 10)
          );

          if (findStudentPolicy) {
            newDuration = findStudentPolicy.duration;
          }
        } else {
          newDuration = findLateRegistrationRecord.duration;
        }

        if (newDuration) {
          if (toUpper(trim(durationMeasureName)) === 'DAY') {
            const duration = moment.duration({
              days: newDuration,
            });

            data.due_date = moment(semesterStartDate).add(duration);
          } else if (toUpper(trim(durationMeasureName)) === 'WEEK') {
            const duration = moment.duration({
              weeks: newDuration,
            });

            data.due_date = moment(semesterStartDate).add(duration);
          } else if (toUpper(trim(durationMeasureName)) === 'MONTH') {
            const duration = moment.duration({
              months: newDuration,
            });

            data.due_date = moment(semesterStartDate).add(duration);
          } else if (toUpper(trim(durationMeasureName)) === 'YEAR') {
            const duration = moment.duration({
              years: newDuration,
            });

            data.due_date = moment(semesterStartDate).add(duration);
          }

          return data;
        }
      }
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
const generateLateFeePaymentInvoice = async (
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
            association: 'tuitionInvoice',
          },
          {
            association: 'functionalInvoice',
          },
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
        `Unable To Find The Enrollment Record While Billing LATE FEES PAYMENT.`
      );
    }

    let findPastDueTuitionInvoice = null;

    if (!isEmpty(findEnrollmentRecord.tuitionInvoice)) {
      findPastDueTuitionInvoice = findEnrollmentRecord.tuitionInvoice.find(
        (invoice) =>
          moment.now() > moment(invoice.due_date) &&
          parseFloat(invoice.amount_due) > 0
      );
    }

    const findPastDueFunctionalInvoice = checkFunctionalInvoicePastDue(
      findEnrollmentRecord.functionalInvoice
    );

    if (findPastDueTuitionInvoice || findPastDueFunctionalInvoice === true) {
      const findAlreadyBilledSurcharge =
        findEnrollmentRecord.otherFeesInvoice.find((invoice) =>
          invoice.description.includes('LATE FEES PAYMENT')
        );

      if (!findAlreadyBilledSurcharge) {
        const description = `SURCHARGE: LATE FEES PAYMENT.`;

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
          'LATE FEES PAYMENT',
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
                `Unable To Find The Enrollment Event While Billing LATE FEES PAYMENT.`
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
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} invoice
 * @returns
 */
const checkFunctionalInvoicePastDue = (invoice) => {
  try {
    if (invoice) {
      if (
        moment.now() > moment(invoice.due_date) &&
        parseFloat(invoice.amount_due) > 0
      ) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  } catch (error) {
    throw new Error(error.message);
  }
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
      'current_semester_id',
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
      'student_number',
      'registration_number',
      'sponsorship_id',
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
  };
};

module.exports = {
  enrollStudent,
  createOtherFeesInvoice,
  lateEnrollment,
  voidingAndDeAllocatingInvoices,
  handleDeEnrollingPaidTuitionInvoices,
  handleDeEnrollingUnPaidTuitionInvoices,
  handleDeEnrollingPaidOtherFeesFeesInvoices,
  handleDeEnrollingUnPaidOtherFeesFeesInvoices,
  voidingAndDeAllocatingInvoicesFromUpdatingRegisteredCourseUnits,
  voidingAndDeAllocatingInvoicesFromVoidingApprovals,
  studentProgrammeAttributes,
  generateLateFeePaymentInvoice,
  findInvoiceDueDates,
  findRegistrationDueDate,
};
