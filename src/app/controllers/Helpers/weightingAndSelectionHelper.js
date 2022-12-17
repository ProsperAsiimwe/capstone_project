const { isEmpty, toUpper, trim } = require('lodash');
const {
  applicantProgrammeChoiceService,
  // runningAdmissionProgrammeService,
} = require('@services/index');

/**
 *
 * @param {*} applicantOLevelData
 * @returns
 */
const weighOLevel = (applicantOLevelData) => {
  try {
    let totalWeight = 0;

    const distinctions = applicantOLevelData.subjects.filter(
      (subject) =>
        toUpper(trim(subject.result)).includes('D1') ||
        toUpper(trim(subject.result)).includes('D2')
    );

    const distinctionWeights = distinctions.length * 0.3;

    const credits = applicantOLevelData.subjects.filter(
      (subject) =>
        toUpper(trim(subject.result)).includes('C3') ||
        toUpper(trim(subject.result)).includes('C4') ||
        toUpper(trim(subject.result)).includes('C5') ||
        toUpper(trim(subject.result)).includes('C6')
    );

    const creditWeights = credits.length * 0.2;

    const passes = applicantOLevelData.subjects.filter(
      (subject) =>
        toUpper(trim(subject.result)).includes('P7') ||
        toUpper(trim(subject.result)).includes('P8')
    );

    const passesWeights = passes.length * 0.1;

    totalWeight =
      parseFloat(distinctionWeights) +
      parseFloat(creditWeights) +
      parseFloat(passesWeights);

    return parseFloat(totalWeight);
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} applicantALevelData
 * @param {*} findALevelCategories
 */
const weighALevel = (applicantALevelData, findALevelCategories) => {
  try {
    const expectedConditions = findALevelCategories.length;

    const weighedConditions = [];

    let aLevelGrading = [
      {
        grade: 'A',
        weight: 6,
      },
      {
        grade: 'B',
        weight: 5,
      },
      {
        grade: 'C',
        weight: 4,
      },
      {
        grade: 'D',
        weight: 3,
      },
      {
        grade: 'E',
        weight: 2,
      },
      {
        grade: 'O',
        weight: 1,
      },
      {
        grade: 'F',
        weight: 0,
      },
    ];

    let aLevelSubsidiaryGrading = [
      {
        grade: 'D1',
        weight: 1,
      },
      {
        grade: 'D2',
        weight: 1,
      },
      {
        grade: 'C3',
        weight: 1,
      },
      {
        grade: 'C4',
        weight: 1,
      },
      {
        grade: 'C5',
        weight: 1,
      },
      {
        grade: 'C6',
        weight: 1,
      },
      {
        grade: 'P7',
        weight: 0.0,
      },
      {
        grade: 'P8',
        weight: 0.0,
      },
      {
        grade: 'F9',
        weight: 0.0,
      },
    ];

    let totalWeight = 0;

    findALevelCategories.forEach((category) => {
      if (
        toUpper(trim(category.weightingCondition.metadata_value)).includes(
          'MANDATORY'
        ) ||
        toUpper(trim(category.weightingCondition.metadata_value)).includes(
          'AND'
        )
      ) {
        if (!isEmpty(category.unebSubjects)) {
          category.unebSubjects.forEach((categorySubject) => {
            const findMinimumGradePosition = aLevelGrading.findIndex(
              (item) => trim(item.grade) === trim(categorySubject.minimum_grade)
            );

            if (findMinimumGradePosition >= 0) {
              aLevelGrading = aLevelGrading.splice(
                0,
                findMinimumGradePosition + 1
              );

              const findApplicantSubject = applicantALevelData.subjects.find(
                (sbj) =>
                  toUpper(trim(sbj.code)) ===
                  toUpper(trim(categorySubject.unebSubject.uneb_subject_code))
              );

              if (findApplicantSubject) {
                const findGradeWeight = aLevelGrading.find(
                  (gradeWeight) =>
                    toUpper(trim(gradeWeight.grade)) ===
                    toUpper(trim(findApplicantSubject.result))
                );

                if (findGradeWeight) {
                  const weightProduct =
                    parseFloat(findGradeWeight.weight) *
                    parseFloat(category.weight);

                  totalWeight = totalWeight + weightProduct;
                }
              }
            } else {
              const findSubsidiaryMinimumGradePosition =
                aLevelSubsidiaryGrading.findIndex(
                  (item) =>
                    trim(item.grade) === trim(categorySubject.minimum_grade)
                );

              if (findSubsidiaryMinimumGradePosition >= 0) {
                aLevelSubsidiaryGrading = aLevelSubsidiaryGrading.splice(
                  0,
                  findSubsidiaryMinimumGradePosition + 1
                );

                const findApplicantSubject = applicantALevelData.subjects.find(
                  (sbj) =>
                    toUpper(trim(sbj.code)) ===
                    toUpper(trim(categorySubject.unebSubject.uneb_subject_code))
                );

                if (findApplicantSubject) {
                  const findGradeWeight = aLevelSubsidiaryGrading.find(
                    (gradeWeight) =>
                      toUpper(trim(gradeWeight.grade)) ===
                      toUpper(trim(findApplicantSubject.result))
                  );

                  if (findGradeWeight) {
                    const weightProduct =
                      parseFloat(findGradeWeight.weight) *
                      parseFloat(category.weight);

                    totalWeight = totalWeight + weightProduct;
                  }
                }
              }
            }
          });
        }

        weighedConditions.push('MANDATORY');
      }

      if (
        toUpper(trim(category.weightingCondition.metadata_value)).includes(
          'ONE BEST'
        ) ||
        toUpper(trim(category.weightingCondition.metadata_value)).includes(
          'ONE BETTER'
        ) ||
        toUpper(trim(category.weightingCondition.metadata_value)) === 'OR'
      ) {
        const weightArray = [];

        if (!isEmpty(category.unebSubjects)) {
          category.unebSubjects.forEach((categorySubject) => {
            const findMinimumGradePosition = aLevelGrading.findIndex(
              (item) => trim(item.grade) === trim(categorySubject.minimum_grade)
            );

            if (findMinimumGradePosition >= 0) {
              aLevelGrading = aLevelGrading.splice(
                0,
                findMinimumGradePosition + 1
              );

              const findApplicantSubject = applicantALevelData.subjects.find(
                (sbj) =>
                  toUpper(trim(sbj.code)) ===
                  toUpper(trim(categorySubject.unebSubject.uneb_subject_code))
              );

              if (findApplicantSubject) {
                const findGradeWeight = aLevelGrading.find(
                  (gradeWeight) =>
                    toUpper(trim(gradeWeight.grade)) ===
                    toUpper(trim(findApplicantSubject.result))
                );

                if (findGradeWeight) {
                  const weightProduct =
                    parseFloat(findGradeWeight.weight) *
                    parseFloat(category.weight);

                  weightArray.push(weightProduct);
                }
              }
            } else {
              const findSubsidiaryMinimumGradePosition =
                aLevelSubsidiaryGrading.findIndex(
                  (item) =>
                    trim(item.grade) === trim(categorySubject.minimum_grade)
                );

              if (findSubsidiaryMinimumGradePosition >= 0) {
                aLevelSubsidiaryGrading = aLevelSubsidiaryGrading.splice(
                  0,
                  findSubsidiaryMinimumGradePosition + 1
                );

                const findApplicantSubject = applicantALevelData.subjects.find(
                  (sbj) =>
                    toUpper(trim(sbj.code)) ===
                    toUpper(trim(categorySubject.unebSubject.uneb_subject_code))
                );

                if (findApplicantSubject) {
                  const findGradeWeight = aLevelSubsidiaryGrading.find(
                    (gradeWeight) =>
                      toUpper(trim(gradeWeight.grade)) ===
                      toUpper(trim(findApplicantSubject.result))
                  );

                  if (findGradeWeight) {
                    const weightProduct =
                      parseFloat(findGradeWeight.weight) *
                      parseFloat(category.weight);

                    weightArray.push(weightProduct);
                  }
                }
              }
            }
          });
        }

        if (!isEmpty(weightArray)) {
          totalWeight =
            parseFloat(totalWeight) + parseFloat(Math.max(...weightArray));
        }

        weighedConditions.push('ONE BEST');
      }

      if (
        toUpper(trim(category.weightingCondition.metadata_value)).includes(
          'THIRD BEST'
        ) ||
        toUpper(trim(category.weightingCondition.metadata_value)).includes(
          'THIRD BETTER'
        )
      ) {
        const weightArray = [];

        if (!isEmpty(category.unebSubjects)) {
          category.unebSubjects.forEach((categorySubject) => {
            const findMinimumGradePosition = aLevelGrading.findIndex(
              (item) => trim(item.grade) === trim(categorySubject.minimum_grade)
            );

            if (findMinimumGradePosition >= 0) {
              aLevelGrading = aLevelGrading.splice(
                0,
                findMinimumGradePosition + 1
              );

              const findApplicantSubject = applicantALevelData.subjects.find(
                (sbj) =>
                  toUpper(trim(sbj.code)) ===
                  toUpper(trim(categorySubject.unebSubject.uneb_subject_code))
              );

              if (findApplicantSubject) {
                const findGradeWeight = aLevelGrading.find(
                  (gradeWeight) =>
                    toUpper(trim(gradeWeight.grade)) ===
                    toUpper(trim(findApplicantSubject.result))
                );

                if (findGradeWeight) {
                  const weightProduct =
                    parseFloat(findGradeWeight.weight) *
                    parseFloat(category.weight);

                  weightArray.push(weightProduct);
                }
              }
            } else {
              const findSubsidiaryMinimumGradePosition =
                aLevelSubsidiaryGrading.findIndex(
                  (item) =>
                    trim(item.grade) === trim(categorySubject.minimum_grade)
                );

              if (findSubsidiaryMinimumGradePosition >= 0) {
                aLevelSubsidiaryGrading = aLevelSubsidiaryGrading.splice(
                  0,
                  findSubsidiaryMinimumGradePosition + 1
                );

                const findApplicantSubject = applicantALevelData.subjects.find(
                  (sbj) =>
                    toUpper(trim(sbj.code)) ===
                    toUpper(trim(categorySubject.unebSubject.uneb_subject_code))
                );

                if (findApplicantSubject) {
                  const findGradeWeight = aLevelSubsidiaryGrading.find(
                    (gradeWeight) =>
                      toUpper(trim(gradeWeight.grade)) ===
                      toUpper(trim(findApplicantSubject.result))
                  );

                  if (findGradeWeight) {
                    const weightProduct =
                      parseFloat(findGradeWeight.weight) *
                      parseFloat(category.weight);

                    weightArray.push(weightProduct);
                  }
                }
              }
            }
          });
        }

        if (!isEmpty(weightArray)) {
          const sortDescending = sortHighestToSmallest(weightArray);

          const thridBestDone = sortDescending[2] ? sortDescending[2] : 0;

          totalWeight = parseFloat(totalWeight) + parseFloat(thridBestDone);
        }

        weighedConditions.push('THIRD BEST');
      }

      if (
        toUpper(trim(category.weightingCondition.metadata_value)).includes(
          'TWO BEST'
        ) ||
        toUpper(trim(category.weightingCondition.metadata_value)).includes(
          'TWO BETTER'
        )
      ) {
        const weightArray = [];

        if (!isEmpty(category.unebSubjects)) {
          category.unebSubjects.forEach((categorySubject) => {
            const findMinimumGradePosition = aLevelGrading.findIndex(
              (item) => trim(item.grade) === trim(categorySubject.minimum_grade)
            );

            if (findMinimumGradePosition >= 0) {
              aLevelGrading = aLevelGrading.splice(
                0,
                findMinimumGradePosition + 1
              );

              const findApplicantSubject = applicantALevelData.subjects.find(
                (sbj) =>
                  toUpper(trim(sbj.code)) ===
                  toUpper(trim(categorySubject.unebSubject.uneb_subject_code))
              );

              if (findApplicantSubject) {
                const findGradeWeight = aLevelGrading.find(
                  (gradeWeight) =>
                    toUpper(trim(gradeWeight.grade)) ===
                    toUpper(trim(findApplicantSubject.result))
                );

                if (findGradeWeight) {
                  const weightProduct =
                    parseFloat(findGradeWeight.weight) *
                    parseFloat(category.weight);

                  weightArray.push(weightProduct);
                }
              }
            } else {
              const findSubsidiaryMinimumGradePosition =
                aLevelSubsidiaryGrading.findIndex(
                  (item) =>
                    trim(item.grade) === trim(categorySubject.minimum_grade)
                );

              if (findSubsidiaryMinimumGradePosition >= 0) {
                aLevelSubsidiaryGrading = aLevelSubsidiaryGrading.splice(
                  0,
                  findSubsidiaryMinimumGradePosition + 1
                );

                const findApplicantSubject = applicantALevelData.subjects.find(
                  (sbj) =>
                    toUpper(trim(sbj.code)) ===
                    toUpper(trim(categorySubject.unebSubject.uneb_subject_code))
                );

                if (findApplicantSubject) {
                  const findGradeWeight = aLevelSubsidiaryGrading.find(
                    (gradeWeight) =>
                      toUpper(trim(gradeWeight.grade)) ===
                      toUpper(trim(findApplicantSubject.result))
                  );

                  if (findGradeWeight) {
                    const weightProduct =
                      parseFloat(findGradeWeight.weight) *
                      parseFloat(category.weight);

                    weightArray.push(weightProduct);
                  }
                }
              }
            }
          });
        }

        if (!isEmpty(weightArray)) {
          const sortDescending = sortHighestToSmallest(weightArray);

          const firstBestDone = sortDescending[0] ? sortDescending[0] : 0;
          const secondBestDone = sortDescending[1] ? sortDescending[1] : 0;

          totalWeight =
            parseFloat(totalWeight) +
            parseFloat(firstBestDone) +
            parseFloat(secondBestDone);
        }

        weighedConditions.push('TWO BEST');
      }

      if (
        toUpper(trim(category.weightingCondition.metadata_value)).includes(
          'THREE BEST'
        ) ||
        toUpper(trim(category.weightingCondition.metadata_value)).includes(
          'THREE BETTER'
        )
      ) {
        const weightArray = [];

        if (!isEmpty(category.unebSubjects)) {
          category.unebSubjects.forEach((categorySubject) => {
            const findMinimumGradePosition = aLevelGrading.findIndex(
              (item) => trim(item.grade) === trim(categorySubject.minimum_grade)
            );

            if (findMinimumGradePosition >= 0) {
              aLevelGrading = aLevelGrading.splice(
                0,
                findMinimumGradePosition + 1
              );

              const findApplicantSubject = applicantALevelData.subjects.find(
                (sbj) =>
                  toUpper(trim(sbj.code)) ===
                  toUpper(trim(categorySubject.unebSubject.uneb_subject_code))
              );

              if (findApplicantSubject) {
                const findGradeWeight = aLevelGrading.find(
                  (gradeWeight) =>
                    toUpper(trim(gradeWeight.grade)) ===
                    toUpper(trim(findApplicantSubject.result))
                );

                if (findGradeWeight) {
                  const weightProduct =
                    parseFloat(findGradeWeight.weight) *
                    parseFloat(category.weight);

                  weightArray.push(weightProduct);
                }
              }
            } else {
              const findSubsidiaryMinimumGradePosition =
                aLevelSubsidiaryGrading.findIndex(
                  (item) =>
                    trim(item.grade) === trim(categorySubject.minimum_grade)
                );

              if (findSubsidiaryMinimumGradePosition >= 0) {
                aLevelSubsidiaryGrading = aLevelSubsidiaryGrading.splice(
                  0,
                  findSubsidiaryMinimumGradePosition + 1
                );

                const findApplicantSubject = applicantALevelData.subjects.find(
                  (sbj) =>
                    toUpper(trim(sbj.code)) ===
                    toUpper(trim(categorySubject.unebSubject.uneb_subject_code))
                );

                if (findApplicantSubject) {
                  const findGradeWeight = aLevelSubsidiaryGrading.find(
                    (gradeWeight) =>
                      toUpper(trim(gradeWeight.grade)) ===
                      toUpper(trim(findApplicantSubject.result))
                  );

                  if (findGradeWeight) {
                    const weightProduct =
                      parseFloat(findGradeWeight.weight) *
                      parseFloat(category.weight);

                    weightArray.push(weightProduct);
                  }
                }
              }
            }
          });
        }

        if (!isEmpty(weightArray)) {
          const sortDescending = sortHighestToSmallest(weightArray);

          const firstBestDone = sortDescending[0] ? sortDescending[0] : 0;
          const secondBestDone = sortDescending[1] ? sortDescending[1] : 0;
          const thridBestDone = sortDescending[2] ? sortDescending[2] : 0;

          totalWeight =
            parseFloat(totalWeight) +
            parseFloat(firstBestDone) +
            parseFloat(secondBestDone) +
            parseFloat(thridBestDone);
        }

        weighedConditions.push('THREE BEST');
      }
    });

    if (weighedConditions.length !== expectedConditions) {
      throw new Error(
        `Expected conditions for fullfillment do not match the resulting ones.`
      );
    }

    return parseFloat(totalWeight);
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} array
 * @returns
 */
const sortHighestToSmallest = (array) => {
  try {
    const sorted = array.sort((a, b) => {
      return b - a;
    });

    return sorted;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} findOLevelCategories
 * @param {*} oLevelSubjects
 */
const selectionsBasedOnOLevelSubjects = (
  findOLevelCategories,
  oLevelSubjects
) => {
  try {
    const result = [];

    const expectedConditions = findOLevelCategories.length;

    let oLevelGrades = [
      {
        grade: 'D1',
      },
      {
        grade: 'D2',
      },
      {
        grade: 'C3',
      },
      {
        grade: 'C4',
      },
      {
        grade: 'C5',
      },
      {
        grade: 'C6',
      },
      {
        grade: 'P7',
      },
      {
        grade: 'P8',
      },
      {
        grade: 'F9',
      },
    ];

    findOLevelCategories.forEach((category) => {
      if (
        toUpper(trim(category.weightingCondition.metadata_value)).includes(
          'MANDATORY'
        ) ||
        toUpper(trim(category.weightingCondition.metadata_value)).includes(
          'AND'
        )
      ) {
        if (!isEmpty(category.unebSubjects)) {
          const conditionFullfillmentLength = category.unebSubjects.length;
          const conditionFullfillment = [];

          category.unebSubjects.forEach((categorySubject) => {
            const findApplicantSubject = oLevelSubjects.find(
              (sbj) =>
                toUpper(trim(sbj.code)) ===
                toUpper(trim(categorySubject.unebSubject.uneb_subject_code))
            );

            if (findApplicantSubject) {
              const findMinimumGradePosition = oLevelGrades.findIndex(
                (item) =>
                  trim(item.grade) === trim(categorySubject.minimum_grade)
              );

              if (findMinimumGradePosition >= 0) {
                oLevelGrades = oLevelGrades.splice(
                  0,
                  findMinimumGradePosition + 1
                );

                const findGradeWeight = oLevelGrades.find(
                  (gradeWeight) =>
                    toUpper(trim(gradeWeight.grade)) ===
                    toUpper(trim(findApplicantSubject.result))
                );

                if (findGradeWeight) {
                  conditionFullfillment.push(findApplicantSubject);
                }
              }
            }
          });

          if (conditionFullfillment.length === conditionFullfillmentLength) {
            result.push('ELIGIBLE');
          } else {
            result.push('NOT-ELIGIBLE');
          }
        }
      }

      if (
        toUpper(trim(category.weightingCondition.metadata_value)).includes(
          'ONE BEST'
        ) ||
        toUpper(trim(category.weightingCondition.metadata_value)).includes(
          'ONE BETTER'
        ) ||
        toUpper(trim(category.weightingCondition.metadata_value)) === 'OR'
      ) {
        if (!isEmpty(category.unebSubjects)) {
          const conditionFullfillmentLength = 1;
          const conditionFullfillment = [];

          category.unebSubjects.forEach((categorySubject) => {
            const findApplicantSubject = oLevelSubjects.find(
              (sbj) =>
                toUpper(trim(sbj.code)) ===
                toUpper(trim(categorySubject.unebSubject.uneb_subject_code))
            );

            if (findApplicantSubject) {
              const findMinimumGradePosition = oLevelGrades.findIndex(
                (item) =>
                  trim(item.grade) === trim(categorySubject.minimum_grade)
              );

              if (findMinimumGradePosition >= 0) {
                oLevelGrades = oLevelGrades.splice(
                  0,
                  findMinimumGradePosition + 1
                );

                const findGradeWeight = oLevelGrades.find(
                  (gradeWeight) =>
                    toUpper(trim(gradeWeight.grade)) ===
                    toUpper(trim(findApplicantSubject.result))
                );

                if (findGradeWeight) {
                  conditionFullfillment.push(findApplicantSubject);
                }
              }
            }
          });

          if (conditionFullfillment.length >= conditionFullfillmentLength) {
            result.push('ELIGIBLE');
          } else {
            result.push('NOT-ELIGIBLE');
          }
        }
      }

      if (
        toUpper(trim(category.weightingCondition.metadata_value)).includes(
          'TWO BEST'
        ) ||
        toUpper(trim(category.weightingCondition.metadata_value)).includes(
          'TWO BETTER'
        )
      ) {
        if (!isEmpty(category.unebSubjects)) {
          const conditionFullfillmentLength = 2;
          const conditionFullfillment = [];

          category.unebSubjects.forEach((categorySubject) => {
            const findApplicantSubject = oLevelSubjects.find(
              (sbj) =>
                toUpper(trim(sbj.code)) ===
                toUpper(trim(categorySubject.unebSubject.uneb_subject_code))
            );

            if (findApplicantSubject) {
              const findMinimumGradePosition = oLevelGrades.findIndex(
                (item) =>
                  trim(item.grade) === trim(categorySubject.minimum_grade)
              );

              if (findMinimumGradePosition >= 0) {
                oLevelGrades = oLevelGrades.splice(
                  0,
                  findMinimumGradePosition + 1
                );

                const findGradeWeight = oLevelGrades.find(
                  (gradeWeight) =>
                    toUpper(trim(gradeWeight.grade)) ===
                    toUpper(trim(findApplicantSubject.result))
                );

                if (findGradeWeight) {
                  conditionFullfillment.push(findApplicantSubject);
                }
              }
            }
          });

          if (conditionFullfillment.length >= conditionFullfillmentLength) {
            result.push('ELIGIBLE');
          } else {
            result.push('NOT-ELIGIBLE');
          }
        }
      }

      if (
        toUpper(trim(category.weightingCondition.metadata_value)).includes(
          'THREE BEST'
        ) ||
        toUpper(trim(category.weightingCondition.metadata_value)).includes(
          'THREE BETTER'
        )
      ) {
        if (!isEmpty(category.unebSubjects)) {
          const conditionFullfillmentLength = 3;
          const conditionFullfillment = [];

          category.unebSubjects.forEach((categorySubject) => {
            const findApplicantSubject = oLevelSubjects.find(
              (sbj) =>
                toUpper(trim(sbj.code)) ===
                toUpper(trim(categorySubject.unebSubject.uneb_subject_code))
            );

            if (findApplicantSubject) {
              const findMinimumGradePosition = oLevelGrades.findIndex(
                (item) =>
                  trim(item.grade) === trim(categorySubject.minimum_grade)
              );

              if (findMinimumGradePosition >= 0) {
                oLevelGrades = oLevelGrades.splice(
                  0,
                  findMinimumGradePosition + 1
                );

                const findGradeWeight = oLevelGrades.find(
                  (gradeWeight) =>
                    toUpper(trim(gradeWeight.grade)) ===
                    toUpper(trim(findApplicantSubject.result))
                );

                if (findGradeWeight) {
                  conditionFullfillment.push(findApplicantSubject);
                }
              }
            }
          });

          if (conditionFullfillment.length >= conditionFullfillmentLength) {
            result.push('ELIGIBLE');
          } else {
            result.push('NOT-ELIGIBLE');
          }
        }
      }
    });

    if (result.length !== expectedConditions) {
      throw new Error(
        `Expected conditions for fullfillment do not match the resulting ones.`
      );
    }

    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} findOLevelCategories
 * @param {*} findALevelCategories
 * @param {*} findWeightingCriteria
 * @param {*} validProgrammeChoices
 * @param {*} newApplicantOLevelData
 * @param {*} newApplicantALevelData
 * @param {*} transaction
 * @returns
 */
const weighApplicants = async (
  findOLevelCategories,
  findALevelCategories,
  findWeightingCriteria,
  validProgrammeChoices,
  newApplicantOLevelData,
  newApplicantALevelData,
  transaction
) => {
  try {
    const result = [];

    for (let choice of validProgrammeChoices) {
      let extraPoints = 0;

      let calculatedOLevelWeights = 0;

      let calculatedALevelWeights = 0;

      if (
        toUpper(trim(choice.applicant.gender)).includes('F') ||
        toUpper(trim(choice.applicant.gender)) === 'FEMALE'
      ) {
        extraPoints = parseFloat(findWeightingCriteria.extra_female_points);
      }

      const applicantOLevelData = newApplicantOLevelData.find(
        (record) =>
          trim(record.form_id) === trim(choice.form_id) &&
          parseInt(record.applicant_id, 10) ===
            parseInt(choice.applicant_id, 10) &&
          parseInt(record.running_admission_id, 10) ===
            parseInt(choice.running_admission_id, 10)
      );

      const applicantALevelData = newApplicantALevelData.find(
        (record) =>
          trim(record.form_id) === trim(choice.form_id) &&
          parseInt(record.applicant_id, 10) ===
            parseInt(choice.applicant_id, 10) &&
          parseInt(record.running_admission_id, 10) ===
            parseInt(choice.running_admission_id, 10)
      );

      if (applicantOLevelData) {
        if (!isEmpty(applicantOLevelData.subjects)) {
          calculatedOLevelWeights = weighOLevel(applicantOLevelData);
        }
      }

      // Check if a student has at least 5 principal passes in O-level

      if (calculatedOLevelWeights > 0.5) {
        // Check programme specific o-level requirements if applicable to the programme

        if (findOLevelCategories) {
          if (!isEmpty(findOLevelCategories.unebSubjects)) {
            let oLevelGrading = [
              {
                grade: 'D1',
              },
              {
                grade: 'D2',
              },
              {
                grade: 'C3',
              },
              {
                grade: 'C4',
              },
              {
                grade: 'C5',
              },
              {
                grade: 'C6',
              },
              {
                grade: 'P7',
              },
              {
                grade: 'P8',
              },
              {
                grade: 'F9',
              },
            ];

            const requiredOLevelLength =
              findOLevelCategories.unebSubjects.length;

            const requiredOLevelDone = [];

            findOLevelCategories.unebSubjects.forEach((categorySubject) => {
              const findApplicantSubject = applicantOLevelData.subjects.find(
                (sbj) =>
                  toUpper(trim(sbj.code)) ===
                  toUpper(trim(categorySubject.unebSubject.uneb_subject_code))
              );

              if (findApplicantSubject) {
                requiredOLevelDone.push(findApplicantSubject);
              }
            });

            if (requiredOLevelLength === requiredOLevelDone.length) {
              findOLevelCategories.unebSubjects.forEach((categorySubject) => {
                const findMinimumGradePosition = oLevelGrading.findIndex(
                  (item) =>
                    trim(item.grade) === trim(categorySubject.minimum_grade)
                );

                if (findMinimumGradePosition >= 0) {
                  oLevelGrading = oLevelGrading.splice(
                    0,
                    findMinimumGradePosition + 1
                  );

                  const findApplicantSubject =
                    applicantOLevelData.subjects.find(
                      (sbj) =>
                        toUpper(trim(sbj.code)) ===
                        toUpper(
                          trim(categorySubject.unebSubject.uneb_subject_code)
                        )
                    );

                  if (findApplicantSubject) {
                    const findGrade = oLevelGrading.find(
                      (gradeList) =>
                        toUpper(trim(gradeList.grade)) ===
                        toUpper(trim(findApplicantSubject.result))
                    );

                    if (!findGrade) {
                      // ignore applicant
                      choice = {};
                    }
                  }
                }
              });
            } else {
              // ignore applicant
              choice = {};
            }
          }
        }

        // Check if a student has at least 2 principal passes in A-level
        const aLevelGrading = [
          {
            grade: 'A',
          },
          {
            grade: 'B',
          },
          {
            grade: 'C',
          },
          {
            grade: 'D',
          },
          {
            grade: 'E',
          },
        ];

        if (!isEmpty(applicantALevelData.subjects)) {
          const aLevelPrinciplePasses = [];

          applicantALevelData.subjects.forEach((aLevelSubject) => {
            const checkPrinciplePass = aLevelGrading.find(
              (item) =>
                toUpper(trim(item.grade)) ===
                toUpper(trim(aLevelSubject.result))
            );

            if (checkPrinciplePass) {
              aLevelPrinciplePasses.push(aLevelSubject);
            }
          });

          if (aLevelPrinciplePasses.length < 2) {
            // ignore applicant
            choice = {};
          }
        }

        if (!isEmpty(choice)) {
          calculatedALevelWeights = weighALevel(
            applicantALevelData,
            findALevelCategories
          );

          const record =
            await applicantProgrammeChoiceService.updateApplicantProgrammeChoice(
              { id: choice.id },
              {
                applicant_weights:
                  parseFloat(calculatedOLevelWeights) +
                  parseFloat(calculatedALevelWeights) +
                  parseFloat(extraPoints),
                weighting_criteria_id: findWeightingCriteria.id,
              },
              transaction
            );

          result.push(record[1][0]);
        }
      }
    }

    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  weighOLevel,
  weighALevel,
  selectionsBasedOnOLevelSubjects,
  weighApplicants,
};
