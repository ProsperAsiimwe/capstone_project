const {
  resultService,
  gradingService,
  resultsPolicyService,
  metadataValueService,
  concededPassPolicyService,
} = require('@services/index');
const moment = require('moment');
const { isEmpty, toUpper, trim, includes } = require('lodash');
const {
  getMetadataValueId,
  getArrayMetadataValuesFromMetadata,
  getInstitutionRemark,
} = require('@controllers/Helpers/programmeHelper');
const { appConfig } = require('@root/config');

/**
 * VALIDATE CONCEDED PASS MARK
 *
 * @param {*} data
 * @param {*} result
 * @param {*} versionCourseUnit
 */
const validateConcededPass = async (data, result, versionCourseUnit) => {
  const cpMetadataValue = await metadataValueService.findOneMetadataValue({
    where: {
      metadata_value: 'CP',
    },
    attributes: ['id'],
    raw: true,
  });

  if (
    data.remark_id &&
    cpMetadataValue &&
    parseInt(cpMetadataValue.id, 10) === parseInt(data.remark_id, 10)
  ) {
    const concededPassPolicy = await concededPassPolicyService.findOne({
      where: {
        grading_id: versionCourseUnit.grading_id,
        remark_id: cpMetadataValue.id,
      },
    });

    if (isEmpty(concededPassPolicy)) {
      throw new Error(
        'No Conceded Pass Policy has been defined for this course units Grading System'
      );
    } else {
      const finalMark = parseFloat(data.final_mark);

      if (
        concededPassPolicy.number_of_sittings > 1 &&
        result.is_first_sitting === true
      ) {
        throw new Error(
          `Conceded Pass Policy Required CP to be set on ${moment
            .localeData()
            .ordinal(
              concededPassPolicy.number_of_sittings
            )} Sitting, This Result is First Sitting of the student`
        );
      }

      if (
        finalMark < parseFloat(concededPassPolicy.lower_mark) &&
        finalMark > parseFloat(concededPassPolicy.upper_mark)
      ) {
        throw new Error(
          `Conceded Pass Policy requires final mark to be between ${
            concededPassPolicy.lower_mark
          } and ${concededPassPolicy.upper_mark} - Found: ${finalMark.toFixed(
            1
          )}`
        );
      }
    }
  }
};

/**
 * HANDLE DIRECT RESULT UPLOAD
 *
 * @param {*} data
 * @param {*} result
 * @param {*} programmeId
 * @param {*} programmeVersionId
 * @param {*} courseUnits
 * @param {*} versionCourseUnits
 * @param {*} metadataValues
 * @param {*} student
 * @param {*} transaction
 * @returns
 */
const handleDirectMarksUpload = async function (
  data,
  result,
  studentProgramme,
  courseUnits,
  versionCourseUnits,
  metadataValues,
  student,
  transaction
) {
  try {
    const courseUnitId = getCourseUnit(
      result['COURSE CODE'],
      student,
      courseUnits
    );

    data.semester_id = getMetadataValueId(
      metadataValues,
      result.SEMESTER,
      'SEMESTERS',
      student
    );

    data.academic_year_id = getMetadataValueId(
      metadataValues,
      result['ACADEMIC YEAR'],
      'ACADEMIC YEARS',
      student
    );

    data.study_year_id = getMetadataValueId(
      metadataValues,
      result['STUDY YEAR'],
      'STUDY YEARS',
      student
    );

    const versionCourseUnitFunction = getVersionCourseUnit(
      studentProgramme.programme_version_id,
      courseUnitId,
      result.VERSION,
      result['COURSE CODE'],
      data.semester_id,
      data.study_year_id,
      student,
      versionCourseUnits
    );

    data.programme_version_course_unit_id = versionCourseUnitFunction.id;
    const finalMark = parseFloat(result['FINAL MARK']);

    data.final_mark = finalMark.toFixed(1);

    data.grading_value_id = await getGradingValue(
      versionCourseUnitFunction.grading,
      data.final_mark,
      student
    );

    if (studentProgramme.pass_mark === null)
      throw new Error(
        `Pass mark policy has not been defined for ${studentProgramme.study_level}`
      );

    const studentProgrammePassMark = studentProgramme.pass_mark;

    if (!studentProgrammePassMark)
      throw new Error(
        `This (${student}) student's study level pass mark policy has not been defined`
      );

    data.pass_mark = parseFloat(studentProgrammePassMark);

    data = await evaluateStudentMarks(
      data,
      metadataValues,
      result['IS CONCEDED PASS?'] === 'YES',
      versionCourseUnitFunction.grading,
      result['COURSE WORK MARK'],
      result['FINAL EXAM MARK'],
      student
    );

    data.student_programme_id = studentProgramme.id;
    data.campus_id = studentProgramme.campus_id;
    data.intake_id = studentProgramme.intake_id;

    data.student_registration_number = student;

    data.is_submitted = false;

    const findFirstSitting = await resultService.studentRetakesByCourse({
      student_programme_id: data.student_programme_id,
      course_id: courseUnitId,
    });

    if (data.retake_count) {
      if (!findFirstSitting) {
        throw new Error(
          `Unable To Find The First Sitting Of The Course ${result['COURSE CODE']} For Student ${result['REGISTRATION NUMBER']}`
        );
      }

      if (
        parseInt(data.academic_year_id, 10) !==
        parseInt(findFirstSitting.academic_year_id, 10)
      ) {
        throw new Error(
          `Please Select The Academic Year ${findFirstSitting.academic_year} For Student ${result['REGISTRATION NUMBER']} As The Academic Year The Course ${result['COURSE CODE']} Was First Sat.`
        );
      }

      if (
        parseInt(data.study_year_id, 10) !==
        parseInt(findFirstSitting.study_year_id, 10)
      ) {
        throw new Error(
          `Please Select The Study Year ${findFirstSitting.study_year} For Student ${result['REGISTRATION NUMBER']} As The Study Year The Course ${result['COURSE CODE']} Was First Sat.`
        );
      }

      await checkResittingPolicy(
        studentProgramme.programme_study_level_id,
        data.retake_count,
        findFirstSitting.number_resitting,
        result['REGISTRATION NUMBER']
      );

      const findResults = await resultService.findAllResults({
        where: {
          student_programme_id: data.student_programme_id,
          academic_year_id: data.academic_year_id,
          study_year_id: data.study_year_id,
          semester_id: data.semester_id,
          programme_version_course_unit_id:
            data.programme_version_course_unit_id,
        },
        attributes: ['id'],
        raw: true,
      });

      for (const item of findResults) {
        await resultService.updateResult(
          item.id,
          {
            is_retaken: true,
          },
          transaction
        );
      }
    } else {
      if (findFirstSitting) {
        throw new Error(
          `The System Has Found A First Sitting Of The Course ${result['COURSE CODE']} For Student ${result['REGISTRATION NUMBER']}. Please Indicate That It Is Not Their First Sitting.`
        );
      }
    }

    const upload = await insertResult(
      data,
      result['REGISTRATION NUMBER'],
      transaction
    );

    return upload;
  } catch (error) {
    throw new Error(error.message);
  }
};

const evaluateStudentMarks = async (
  data,
  metadataValues,
  isConcededPass,
  gradingId,
  courseWorkMark,
  examMark,
  studentIdentifier
) => {
  const institutionCode = appConfig.TAX_HEAD_CODE;
  const institutionRemarks = getArrayMetadataValuesFromMetadata(
    metadataValues,
    'RESULT REMARKS'
  );

  if (institutionCode === 'FMUK01') {
    if (parseFloat(data.final_mark) < data.pass_mark) {
      const CTRRemark = getInstitutionRemark(institutionRemarks, 'CTR');

      data.remark_id = CTRRemark.id;
      data.has_passed = false;
    } else {
      const NPRemark = getInstitutionRemark(institutionRemarks, 'NP');
      const RTRemark = getInstitutionRemark(institutionRemarks, 'RT');

      data.remark_id = data.is_first_sitting ? NPRemark.id : RTRemark.id;
      data.has_passed = true;
    }
  } else if (institutionCode === 'FGUL06') {
    if (parseFloat(data.final_mark) < data.pass_mark) {
      const PPRemark = getInstitutionRemark(institutionRemarks, 'PP');

      data.remark_id = PPRemark.id;
      data.has_passed = false;
    } else {
      const NPRemark = getInstitutionRemark(institutionRemarks, 'NP');
      const RTRemark = getInstitutionRemark(institutionRemarks, 'RT');

      data.remark_id = data.is_first_sitting ? NPRemark.id : RTRemark.id;
      data.has_passed = true;
    }
  } else if (institutionCode === 'FKYU03') {
    if (parseFloat(data.final_mark) < data.pass_mark) {
      const RTRemark = getInstitutionRemark(institutionRemarks, 'RT');

      data.remark_id = RTRemark.id;
      data.has_passed = false;
    } else {
      const NPRemark = getInstitutionRemark(institutionRemarks, 'NP');

      data.remark_id = NPRemark.id;
      data.has_passed = true;
    }
  } else
    throw new Error(
      'Your Institution Result Remark Policy has not been configured'
    );

  if (isConcededPass && includes(institutionRemarks, 'CP')) {
    await validateConcededPass(data, data, {
      grading_id: gradingId,
    });
    const CPRemark = getInstitutionRemark(institutionRemarks, 'CP');

    data.remark_id = CPRemark.id;
  }

  const finalMark = parseFloat(data.final_mark).toFixed(1);

  if (courseWorkMark && examMark) {
    const sumCWandEx = (
      parseFloat(examMark) + parseFloat(courseWorkMark)
    ).toFixed(1);

    if (sumCWandEx !== finalMark) {
      throw new Error(
        `Total of Course Work Mark ${courseWorkMark} and Exam Mark ${parseFloat(
          examMark
        ).toFixed(
          1
        )}: (${sumCWandEx}) does not equal to the Final Mark (${parseFloat(
          finalMark
        )}) for this ${studentIdentifier}.`
      );
    } else {
      data.course_work = parseFloat(courseWorkMark).toFixed(1);
      data.final_exam = parseFloat(examMark).toFixed(1);
    }
  }

  data.final_mark = finalMark;

  return data;
};

/**
 *
 * @param {*} programmeStudyLevelId
 * @param {*} retakeCount
 * @param {*} student
 * @returns
 */
const checkResittingPolicy = async function (
  programmeStudyLevelId,
  retakeCount,
  sittings,
  student
) {
  try {
    const policy = await resultsPolicyService.findOneCourseResittingPolicy({
      where: { programme_study_level_id: programmeStudyLevelId },
      raw: true,
    });

    if (!policy) {
      throw new Error(
        'Unable To Find A Course Resitting Policy Matching This Student.'
      );
    }

    if (retakeCount !== parseInt(sittings, 10) + 1) {
      throw new Error(
        `The Retake Count For Student : ${student} must be ${
          parseInt(sittings, 10) + 1
        }`
      );
    }

    // Plus one original sitting
    const totalNumberOfSittings = parseInt(sittings, 10) + 1;

    if (totalNumberOfSittings > parseInt(policy.max_number_of_sittings, 10)) {
      throw new Error(
        `Student: ${student} has reached the maximum number of allowed sittings for the course of ${totalNumberOfSittings}.`
      );
    }

    return parseInt(policy.max_number_of_sittings, 10);
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} versionId
 * @param {*} courseUnitId
 * @param {*} versionName
 * @param {*} courseUnitCode
 * @param {*} semester
 * @param {*} student
 * @returns
 */
const getVersionCourseUnit = function (
  versionId,
  courseUnitId,
  versionName,
  courseUnitCode,
  semester,
  studyYear,
  student,
  versionCourseUnits
) {
  try {
    const checkValue = versionCourseUnits.find(
      (versUnit) =>
        parseInt(versUnit.programme_version_id, 10) ===
          parseInt(versionId, 10) &&
        parseInt(versUnit.course_unit_id, 10) === parseInt(courseUnitId, 10)
    );

    if (checkValue) {
      if (
        parseInt(checkValue.programme_study_year_id, 10) !==
        parseInt(studyYear, 10)
      ) {
        throw new Error(
          `Your Curriculum Designated Course Unit ${courseUnitCode} To Be Assessed In ${checkValue.course_unit_year} For Student ${student}`
        );
      }

      if (
        parseInt(checkValue.course_unit_semester_id, 10) !==
        parseInt(semester, 10)
      ) {
        throw new Error(
          `Your Curriculum Designated Course Unit ${courseUnitCode} To Be Assessed In ${checkValue.course_unit_semester} For Student ${student}`
        );
      }

      const response = {
        id: parseInt(checkValue.id, 10),
        grading: parseInt(checkValue.grading_id, 10),
      };

      return response;
    } else {
      throw new Error(
        `The course unit ${courseUnitCode} is not assigned to the version ${versionName} for record of ${student}`
      );
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} value
 * @param {*} programmeId
 * @param {*} programmeName
 * @param {*} student
 * @returns
 */
// const getProgrammeVersion = function (
//   value,
//   programmeId,
//   programmeName,
//   student,
//   programmeVersions
// ) {
//   try {
//     const checkValue = programmeVersions.find(
//       (vers) =>
//         toUpper(trim(vers.version_title)) === toUpper(trim(value)) &&
//         parseInt(vers.programme_id, 10) === parseInt(programmeId, 10)
//     );

//     if (checkValue) return parseInt(checkValue.id, 10);
//     throw new Error(
//       `The version ${value} does not belong to the programme ${programmeName} for record of ${student}`
//     );
//   } catch (error) {
//     throw new Error(error.message);
//   }
// };

/**
 *
 * @param {*} code
 * @param {*} student
 * @returns
 */
const getCourseUnit = function (code, student, courseUnits) {
  try {
    const checkValue = courseUnits.find(
      (unit) => toUpper(trim(unit.course_unit_code)) === toUpper(trim(code))
    );

    if (checkValue) return parseInt(checkValue.id, 10);
    throw new Error(
      `Cannot find course unit with code: ${code} for record of ${student}`
    );
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} gradingId
 * @param {*} finalMark
 * @param {*} student
 * @returns
 */
const getGradingValue = async (gradingId, finalMark, student) => {
  const gradingValueId = await findGradingValueId(
    gradingId,
    finalMark,
    student
  );

  return gradingValueId;
};

/**
 *
 * @param {*} gradingId
 */
const findGradingValueId = async function (gradingId, finalMark, student) {
  const grading = await gradingService
    .findOneGrading({
      where: {
        id: gradingId,
      },
      attributes: ['id', 'grading_code'],
      include: [
        {
          association: 'values',
          attributes: [
            'id',
            'grading_letter',
            'grading_point',
            'max_value',
            'min_value',
            'interpretation',
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

  if (!grading) {
    throw new Error('Unable To Find The Grading Provided.');
  }

  const checkValue = grading.values.find(
    (val) =>
      parseFloat(finalMark) <= parseFloat(val.max_value) &&
      parseFloat(finalMark) >= parseFloat(val.min_value)
  );

  if (isEmpty(checkValue)) {
    throw new Error(
      `Unable Find The Grading Value To Award Student ${student}.`
    );
  }

  return parseInt(checkValue.id, 10);
};

/**
 *
 * @param {*} data
 * @param {*} transaction
 */
const insertResult = async function (data, student, transaction) {
  try {
    const result = await resultService.createResult(data, student, transaction);

    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} data
 * @param {*} result
 * @param {*} programmes
 * @param {*} metadataValues
 * @param {*} student
 * @param {*} transaction
 * @returns
 */
const handleAcademicAssessmentUpload = async function (
  data,
  result,
  metadataValues,
  studentProgramme,
  student,
  transaction
) {
  try {
    data.semester_id = getMetadataValueId(
      metadataValues,
      result.SEMESTER,
      'SEMESTERS',
      student
    );

    data.academic_year_id = getMetadataValueId(
      metadataValues,
      result['ACADEMIC YEAR'],
      'ACADEMIC YEARS',
      student
    );

    data.study_year_id = getMetadataValueId(
      metadataValues,
      result['STUDY YEAR'],
      'STUDY YEARS',
      student
    );

    data.student_programme_id = studentProgramme.id;

    if (studentProgramme.pass_mark === null)
      throw new Error(
        `Pass mark policy has not been defined for ${studentProgramme.study_level}`
      );

    data.pass_mark = studentProgramme.pass_mark;

    data.gpa = result.GPA;

    if (result.CGPA) {
      data.cgpa = result.CGPA;
    }

    if (result.TCU) {
      data.tcu = result.TCU;
    }

    if (result.CTCU) {
      data.ctcu = result.CTCU;
    }

    if (result.TWS) {
      data.tws = result.TWS;
    }

    if (result.CTWS) {
      data.ctws = result.CTWS;
    }

    const upload = await insertAcademicAssessment(
      data,
      result['REGISTRATION NUMBER'],
      transaction
    );

    return upload;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} data
 * @param {*} transaction
 */
const insertAcademicAssessment = async function (data, student, transaction) {
  try {
    const result = await resultService.createAcademicAssessment(
      data,
      student,
      transaction
    );

    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} data
 */
// const handleFirstSitting = async function (
//   data,
//   result,
//   programmes,
//   programmeVersions,
//   courseUnits,
//   versionCourseUnits,
//   metadataValues,
//   student,
//   transaction
// ) {
//   try {
//     const programmeId = getProgramme(
//       result['PROGRAMME CODE'],
//       student,
//       programmes
//     );

//     const versionId = getProgrammeVersion(
//       result.VERSION,
//       programmeId,
//       result.PROGRAMME,
//       student,
//       programmeVersions
//     );

//     const courseUnitId = getCourseUnit(
//       result['COURSE CODE'],
//       student,
//       courseUnits
//     );

//     data.semester_id = getMetadataValueId(
//       metadataValues,
//       result.SEMESTER,
//       'SEMESTERS',
//       student
//     );

//     const versionCourseUnitFunction = getVersionCourseUnit(
//       versionId,
//       courseUnitId,
//       result.VERSION,
//       result['COURSE CODE'],
//       data.semester_id,
//       student,
//       versionCourseUnits
//     );

//     data.programme_version_course_unit_id = versionCourseUnitFunction.id;

//     data.final_mark = parseFloat(result['FINAL MARK']);

//     data.grading_value_id = await getGradingValue(
//       versionCourseUnitFunction.grading,
//       data.final_mark,
//       student
//     );

//     data.academic_year_id = getMetadataValueId(
//       metadataValues,
//       result['ACADEMIC YEAR'],
//       'ACADEMIC YEARS',
//       student
//     );

//     data.study_year_id = getMetadataValueId(
//       metadataValues,
//       result['STUDY YEAR'],
//       'STUDY YEARS',
//       student
//     );

//     data.remark_id = getMetadataValueId(
//       metadataValues,
//       result.REMARKS,
//       'RESULT REMARKS',
//       student
//     );

//     if (result['COURSE WORK MARK']) {
//       data.course_work = parseFloat(result['COURSE WORK MARK']);
//     }

//     if (result['FINAL EXAM MARK']) {
//       data.final_exam = parseFloat(result['FINAL EXAM MARK']);
//     }

//     const studentProgramme = await getStudentProgramme(
//       result['REGISTRATION NUMBER'],
//       programmeId,
//       versionId,
//       student
//     );

//     data.student_programme_id = studentProgramme.id;
//     data.campus_id = studentProgramme.campus;
//     data.intake_id = studentProgramme.intake;

//     data.student_registration_number = student;

//     data.pass_mark = await getPassMarkFromPolicy(
//       studentProgramme.programme_study_level_id,
//       student
//     );

//     if (parseFloat(data.final_mark) < data.pass_mark) {
//       data.has_passed = false;
//     } else {
//       data.has_passed = true;
//     }

//     data.is_submitted = true;

//     // course unit id from repository
//     data.course_id = courseUnitId;

//     const findRecord = await findStudentResultByCourse(data);

//     if (isEmpty(findRecord)) {
//       const upload = await insertFirstSittingResult(data, transaction);

//       return upload;
//     } else {
//       throw new Error(
//         `This is NOT THE FIRST SITTING of the course: ${result['COURSE CODE']} for student: ${student}. Please change the value of IS FIRST SITTING ? column to NO`
//       );
//     }
//   } catch (error) {
//     throw new Error(error.message);
//   }
// };

// /**
//  *
//  * @param {*} data
//  * @returns
//  */
// const findStudentResultByCourse = async function (data) {
//   try {
//     const result = await resultService.studentResultByCourse(data);

//     return result;
//   } catch (error) {
//     throw new Error(error.message);
//   }
// };

/**
 *
 * @param {*} data
 * @returns
 */
// const handleMultipleSittings = async function (
//   data,
//   result,
//   programmes,
//   programmeVersions,
//   courseUnits,
//   versionCourseUnits,
//   metadataValues,
//   student,
//   transaction
// ) {
//   try {
//     const programmeId = getProgramme(
//       result['PROGRAMME CODE'],
//       student,
//       programmes
//     );

//     const versionId = getProgrammeVersion(
//       result.VERSION,
//       programmeId,
//       result.PROGRAMME,
//       student,
//       programmeVersions
//     );

//     const courseUnitId = getCourseUnit(
//       result['COURSE CODE'],
//       student,
//       courseUnits
//     );

//     data.semester_id = getMetadataValueId(
//       metadataValues,
//       result.SEMESTER,
//       'SEMESTERS',
//       student
//     );

//     const versionCourseUnitFunction = getVersionCourseUnit(
//       versionId,
//       courseUnitId,
//       result.VERSION,
//       result['COURSE CODE'],
//       data.semester_id,
//       student,
//       versionCourseUnits
//     );

//     data.programme_version_course_unit_id = versionCourseUnitFunction.id;

//     data.final_mark = parseFloat(result['FINAL MARK']);

//     data.grading_value_id = await getGradingValue(
//       versionCourseUnitFunction.grading,
//       data.final_mark,
//       student
//     );

//     data.academic_year_id = getMetadataValueId(
//       metadataValues,
//       result['ACADEMIC YEAR'],
//       'ACADEMIC YEARS',
//       student
//     );

//     data.study_year_id = getMetadataValueId(
//       metadataValues,
//       result['STUDY YEAR'],
//       'STUDY YEARS',
//       student
//     );

//     data.remark_id = getMetadataValueId(
//       metadataValues,
//       result.REMARKS,
//       'RESULT REMARKS',
//       student
//     );

//     if (result['COURSE WORK MARK']) {
//       data.course_work = parseFloat(result['COURSE WORK MARK']);
//     }

//     if (result['FINAL EXAM MARK']) {
//       data.final_exam = parseFloat(result['FINAL EXAM MARK']);
//     }

//     const studentProgramme = await getStudentProgramme(
//       result['REGISTRATION NUMBER'],
//       programmeId,
//       versionId,
//       student
//     );

//     data.student_programme_id = studentProgramme.id;
//     data.campus_id = studentProgramme.campus;
//     data.intake_id = studentProgramme.intake;

//     data.student_registration_number = student;

//     data.pass_mark = await getPassMarkFromPolicy(
//       studentProgramme.programme_study_level_id,
//       student
//     );

//     if (parseFloat(data.final_mark) < data.pass_mark) {
//       data.has_passed = false;
//     } else {
//       data.has_passed = true;
//     }

//     data.is_submitted = true;

//     // course unit id from repository
//     data.course_id = courseUnitId;

//     const findRecord = await resultService.studentRetakesByCourse(data);

//     if (findRecord) {
//       const policySittings = await checkResittingPolicy(
//         findRecord.programme_study_level_id
//       );

//       // Plus one original sitting
//       const numberTotalOfSittings =
//         parseInt(findRecord.number_resitting, 10) + 1;

//       if (numberTotalOfSittings < policySittings) {
//         data.retake_paper_id = findRecord.id;

//         const upload = await insertMultipleSittingResult(data, transaction);

//         return upload;
//       } else {
//         throw new Error(
//           `Student: ${student} has reached the maximum number of allowed sittings for the course.`
//         );
//       }
//     } else {
//       throw new Error(
//         `This IS THE FIRST SITTING of the course: ${result['COURSE CODE']} for student: ${student}. Please change the value of IS FIRST SITTING ? column to YES`
//       );
//     }
//   } catch (error) {
//     throw new Error(error.message);
//   }
// };

/**
 *
 * @param {*} data
 * @param {*} transaction
 */
// const insertFirstSittingResult = async function (data, transaction) {
//   try {
//     const result = await resultService.createFirstSittingResult(
//       data,
//       transaction
//     );

//     return result;
//   } catch (error) {
//     throw new Error(error.message);
//   }
// };

/**
 *
 * @param {*} data
 * @param {*} transaction
 */
// const insertMultipleSittingResult = async function (data, transaction) {
//   try {
//     const result = await resultService.createMultipleSittingResult(
//       data,
//       transaction
//     );

//     return result;
//   } catch (error) {
//     throw new Error(error.message);
//   }
// };

module.exports = {
  handleAcademicAssessmentUpload,
  handleDirectMarksUpload,
  findGradingValueId,
  validateConcededPass,
  evaluateStudentMarks,
};
