/**
 *
 * @param {*} data
 */
const generateAllArrayCombinationsForTuition = function (data) {
  let payload = {};
  const newArray = [];

  for (const eachAcademicYear of data.academic_years) {
    const academicYear = eachAcademicYear.academic_year_id;

    payload = {
      programme_id: data.programme_id,
      academic_year_id: academicYear,
      created_by_id: data.created_by_id,
      tuitionAmountFeesElements: data.tuitionAmountFeesElements,
    };

    for (const eachCampus of data.campuses) {
      const campus = eachCampus.campus_id;

      payload = {
        programme_id: data.programme_id,
        academic_year_id: academicYear,
        campus_id: campus,
        created_by_id: data.created_by_id,
        tuitionAmountFeesElements: data.tuitionAmountFeesElements,
      };

      for (const eachIntake of data.intakes) {
        const intake = eachIntake.intake_id;

        payload = {
          programme_id: data.programme_id,
          academic_year_id: academicYear,
          campus_id: campus,
          intake_id: intake,
          created_by_id: data.created_by_id,
          tuitionAmountFeesElements: data.tuitionAmountFeesElements,
        };

        for (const eachBillingCategory of data.billing_categories) {
          const billingCategory = eachBillingCategory.billing_category_id;

          payload = {
            programme_id: data.programme_id,
            academic_year_id: academicYear,
            campus_id: campus,
            intake_id: intake,
            billing_category_id: billingCategory,
            created_by_id: data.created_by_id,
            tuitionAmountFeesElements: data.tuitionAmountFeesElements,
          };

          for (const eachProgrammeType of data.programme_types) {
            const programmeType = eachProgrammeType.programme_type_id;

            payload = {
              programme_id: data.programme_id,
              academic_year_id: academicYear,
              campus_id: campus,
              intake_id: intake,
              billing_category_id: billingCategory,
              programme_type_id: programmeType,
              created_by_id: data.created_by_id,
              tuitionAmountFeesElements: data.tuitionAmountFeesElements,
            };

            for (const eachStudyYear of data.study_years) {
              const studyYear = eachStudyYear.study_year_id;

              payload = {
                programme_id: data.programme_id,
                academic_year_id: academicYear,
                campus_id: campus,
                intake_id: intake,
                billing_category_id: billingCategory,
                programme_type_id: programmeType,
                study_year_id: studyYear,
                created_by_id: data.created_by_id,
                tuitionAmountFeesElements: data.tuitionAmountFeesElements,
              };

              newArray.push(payload);
            }
          }
        }
      }
    }
  }

  return newArray;
};

/**
 *
 * @param {*} data
 */
const generateAllArrayCombinationsForFunctional = function (data) {
  let payload = {};
  const newArray = [];

  for (const eachAcademicYear of data.academic_years) {
    const academicYear = eachAcademicYear.academic_year_id;

    payload = {
      programme_study_level_id: data.programme_study_level_id,
      academic_year_id: academicYear,
      created_by_id: data.created_by_id,
      functionalFeesAmountFeesElements: data.functionalFeesAmountFeesElements,
    };

    for (const eachCampus of data.campuses) {
      const campus = eachCampus.campus_id;

      payload = {
        programme_study_level_id: data.programme_study_level_id,
        academic_year_id: academicYear,
        campus_id: campus,
        created_by_id: data.created_by_id,
        functionalFeesAmountFeesElements: data.functionalFeesAmountFeesElements,
      };

      for (const eachIntake of data.intakes) {
        const intake = eachIntake.intake_id;

        payload = {
          programme_study_level_id: data.programme_study_level_id,
          academic_year_id: academicYear,
          campus_id: campus,
          intake_id: intake,
          created_by_id: data.created_by_id,
          functionalFeesAmountFeesElements:
            data.functionalFeesAmountFeesElements,
        };

        for (const eachBillingCategory of data.billing_categories) {
          const billingCategory = eachBillingCategory.billing_category_id;

          payload = {
            programme_study_level_id: data.programme_study_level_id,
            academic_year_id: academicYear,
            campus_id: campus,
            intake_id: intake,
            billing_category_id: billingCategory,
            created_by_id: data.created_by_id,
            functionalFeesAmountFeesElements:
              data.functionalFeesAmountFeesElements,
          };

          for (const eachProgrammeType of data.programme_types) {
            const programmeType = eachProgrammeType.programme_type_id;

            payload = {
              programme_study_level_id: data.programme_study_level_id,
              academic_year_id: academicYear,
              campus_id: campus,
              intake_id: intake,
              billing_category_id: billingCategory,
              programme_type_id: programmeType,
              created_by_id: data.created_by_id,
              functionalFeesAmountFeesElements:
                data.functionalFeesAmountFeesElements,
            };

            newArray.push(payload);
          }
        }
      }
    }
  }

  return newArray;
};

/**
 *
 * @param {*} data
 */
const generateAllArrayCombinationsForOtherFees = function (data) {
  let payload = {};
  const newArray = [];

  for (const eachAcademicYear of data.academic_years) {
    const academicYear = eachAcademicYear.academic_year_id;

    payload = {
      academic_year_id: academicYear,
      created_by_id: data.created_by_id,
      otherFeesAmountFeesElements: data.otherFeesAmountFeesElements,
    };

    for (const eachCampus of data.campuses) {
      const campus = eachCampus.campus_id;

      payload = {
        academic_year_id: academicYear,
        campus_id: campus,
        created_by_id: data.created_by_id,
        otherFeesAmountFeesElements: data.otherFeesAmountFeesElements,
      };

      for (const eachIntake of data.intakes) {
        const intake = eachIntake.intake_id;

        payload = {
          academic_year_id: academicYear,
          campus_id: campus,
          intake_id: intake,
          created_by_id: data.created_by_id,
          otherFeesAmountFeesElements: data.otherFeesAmountFeesElements,
        };

        for (const eachBillingCategory of data.billing_categories) {
          const billingCategory = eachBillingCategory.billing_category_id;

          payload = {
            academic_year_id: academicYear,
            campus_id: campus,
            intake_id: intake,
            billing_category_id: billingCategory,
            created_by_id: data.created_by_id,
            otherFeesAmountFeesElements: data.otherFeesAmountFeesElements,
          };

          newArray.push(payload);
        }
      }
    }
  }

  return newArray;
};

/**
 *
 * @param {*} data
 */
const generateAllArrayCombinationsForFeesWaiverDiscountElements = function (
  data
) {
  let payload = {};
  const newArray = [];

  for (const eachAcademicYear of data.academic_years) {
    const academicYear = eachAcademicYear.academic_year_id;

    payload = {
      fees_waiver_id: data.fees_waiver_id,
      academic_year_id: academicYear,
      created_by_id: data.created_by_id,
      discountedElements: data.discountedElements,
    };

    for (const eachCampus of data.campuses) {
      const campus = eachCampus.campus_id;

      payload = {
        fees_waiver_id: data.fees_waiver_id,
        academic_year_id: academicYear,
        campus_id: campus,
        created_by_id: data.created_by_id,
        discountedElements: data.discountedElements,
      };

      for (const eachIntake of data.intakes) {
        const intake = eachIntake.intake_id;

        payload = {
          fees_waiver_id: data.fees_waiver_id,
          academic_year_id: academicYear,
          campus_id: campus,
          intake_id: intake,
          created_by_id: data.created_by_id,
          discountedElements: data.discountedElements,
        };

        newArray.push(payload);
      }
    }
  }

  return newArray;
};

/**
 *
 * @param {*} data
 */
const generateAllArrayCombinationsForGraduationFees = function (data) {
  try {
    let payload = {};
    const newArray = [];

    for (const eachGradAcademicYear of data.grad_academic_years) {
      const gradAcademicYear = eachGradAcademicYear.grad_academic_year_id;

      payload = {
        grad_academic_year_id: gradAcademicYear,
        created_by_id: data.created_by_id,
        graduationFeesElements: data.graduationFeesElements,
      };

      for (const eachCampus of data.campuses) {
        const campus = eachCampus.campus_id;

        payload = {
          grad_academic_year_id: gradAcademicYear,
          campus_id: campus,
          created_by_id: data.created_by_id,
          graduationFeesElements: data.graduationFeesElements,
        };

        for (const eachBillingCategory of data.billing_categories) {
          const billingCategory = eachBillingCategory.billing_category_id;

          payload = {
            grad_academic_year_id: gradAcademicYear,
            campus_id: campus,
            billing_category_id: billingCategory,
            created_by_id: data.created_by_id,
            graduationFeesElements: data.graduationFeesElements,
          };

          for (const eachStudyLevel of data.study_levels) {
            const studyLevel = eachStudyLevel.programme_study_level_id;

            payload = {
              grad_academic_year_id: gradAcademicYear,
              campus_id: campus,
              billing_category_id: billingCategory,
              programme_study_level_id: studyLevel,
              created_by_id: data.created_by_id,
              graduationFeesElements: data.graduationFeesElements,
            };

            newArray.push(payload);
          }
        }
      }
    }

    return newArray;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  generateAllArrayCombinationsForTuition,
  generateAllArrayCombinationsForFunctional,
  generateAllArrayCombinationsForOtherFees,
  generateAllArrayCombinationsForFeesWaiverDiscountElements,
  generateAllArrayCombinationsForGraduationFees,
};
