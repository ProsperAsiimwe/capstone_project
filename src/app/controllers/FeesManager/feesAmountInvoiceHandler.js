const {
  feesAmountPreviewService,
  retakersFeesPolicyService,
  graduateFeesPolicyService,
  functionalFeesAmountService,
} = require('@services/index');
const { isEmpty, toUpper } = require('lodash');

/**
 *
 * tuition fees
 */
const tuitionAmountPreviewByContext = async function (payLoad) {
  try {
    let result = {};

    // tuition fees context
    const tuitionAmount = await feesAmountPreviewService
      .tuitionAmountPreviewContext(payLoad)
      .then((res) => {
        if (isEmpty(res)) {
          if (payLoad.enrolled_by === 'STUDENT') {
            throw new Error(
              'Your Tuition Amount Context Has Not Yet Been Defined. Please Contact An Administrator For Assistance.'
            );
          } else {
            throw new Error(
              "This Student's Tuition Amount Context Has Not Yet Been Defined."
            );
          }
        }

        return res;
      });

    // Sum Object amount values
    // eslint-disable-next-line no-extend-native
    Array.prototype.sum = function (prop) {
      let total = 0;

      // eslint-disable-next-line no-underscore-dangle
      for (let i = 0, _len = this.length; i < _len; i++) {
        total += this[i][prop];
      }

      return total;
    };

    if (
      payLoad.semester === 'SEMESTERI' &&
      payLoad.enrollment_status !== 'DOINGRETAKESAFTERFINALYEAR' &&
      payLoad.enrollment_status !== 'STAYPUT'
    ) {
      const filtered = tuitionAmount.filter(
        (row) =>
          row.paid_when === 'SemesterI' || row.paid_when === 'EverySemester'
      );
      const tuitionAmountTotal = filtered.sum('amount');

      result = {
        tuitionAmounts: {
          elements: filtered,
          total: tuitionAmountTotal,
        },
      };
    } else if (
      payLoad.semester === 'SEMESTERII' &&
      payLoad.enrollment_status !== 'DOINGRETAKESAFTERFINALYEAR' &&
      payLoad.enrollment_status !== 'STAYPUT'
    ) {
      const filtered = tuitionAmount.filter(
        (row) =>
          row.paid_when === 'SemesterII' || row.paid_when === 'EverySemester'
      );
      const tuitionAmountTotal = filtered.sum('amount');

      result = {
        tuitionAmounts: {
          elements: filtered,
          total: tuitionAmountTotal,
        },
      };
    } else if (
      payLoad.enrollment_status === 'DOINGRETAKESAFTERFINALYEAR' ||
      payLoad.enrollment_status === 'STAYPUT'
    ) {
      result = {
        tuitionAmounts: {
          elements: [],
          total: 0,
        },
      };
    } else {
      throw new Error(
        'Unable To Bill Tuition Because The Enrollment Status Provided Has Not Been Assigned Yet.'
      );
    }

    if (payLoad.fees_waiver_id) {
      const feesWaiver = await feesWaiverPreviewByContext(payLoad);

      if (
        payLoad.semester === 'SEMESTERI' &&
        payLoad.enrollment_status !== 'DOINGRETAKESAFTERFINALYEAR' &&
        payLoad.enrollment_status !== 'STAYPUT'
      ) {
        result.tuitionAmounts = calculateFeesAmountDiscount(
          result.tuitionAmounts,
          feesWaiver
        );
      }
      if (
        payLoad.semester === 'SEMESTERII' &&
        payLoad.enrollment_status !== 'DOINGRETAKESAFTERFINALYEAR' &&
        payLoad.enrollment_status !== 'STAYPUT'
      ) {
        result.tuitionAmounts = calculateFeesAmountDiscount(
          result.tuitionAmounts,
          feesWaiver
        );
      }
    }

    if (isEmpty(result.tuitionAmounts.elements)) {
      throw new Error(
        `Unable To Match This Student's Enrollment Data To Any Tuition Fees Amount Element Context.`
      );
    }

    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * functional fees
 */
const functionalFeesPreviewByContext = async function (payLoad) {
  try {
    const result = {
      functionalFeesAmounts: {
        elements: [],
        total: null,
      },
    };

    const functionalFeesAmount = await feesAmountPreviewService
      .functionalFeesPreviewContext(payLoad)
      .then((res) => {
        if (isEmpty(res)) {
          if (
            payLoad.enrollment_status === 'DOINGRETAKESAFTERFINALYEAR' ||
            payLoad.enrollment_status === 'STAYPUT' ||
            payLoad.enrollment_status === 'EXTENSION' ||
            payLoad.enrollment_status === 'RE-INSTATEMENT'
          ) {
            if (payLoad.enrolled_by === 'STUDENT') {
              throw new Error(
                'Your Functional Amount Context Has Not Yet Been Defined. Please Contact An Administrator For Assistance.'
              );
            } else {
              throw new Error(
                "This Student's Functional Amount Context Has Not Yet Been Defined."
              );
            }
          }
        }

        return res;
      });

    const uniqFees = await functionalFeesAmountService.fetchUniqFees(payLoad);

    if (!isEmpty(functionalFeesAmount)) {
      // eslint-disable-next-line no-extend-native
      Array.prototype.sum = function (prop) {
        let total = 0;

        // eslint-disable-next-line no-underscore-dangle
        for (let i = 0, _len = this.length; i < _len; i++) {
          total += this[i][prop];
        }

        return total;
      };

      if (
        payLoad.enrollment_status === 'FRESHER' &&
        payLoad.semester === 'SEMESTERI'
      ) {
        const funcFees = functionalFeesAmount.filter(
          (row) =>
            row.paid_when === 'EveryAcademicYear/SemesterI' ||
            row.paid_when === 'Fresher/EverySemester' ||
            row.paid_when === 'EveryAcademicYear/EverySemester' ||
            row.paid_when === 'Fresher/SemesterI'
        );

        const filtered = [...funcFees, ...uniqFees];
        const functionalFeesTotal = filtered.sum('amount');

        // result = {
        //   functionalFeesAmounts: {
        //     elements: filtered,
        //     total: functionalFeesTotal,
        //   },
        // };

        result.functionalFeesAmounts.elements = filtered;
        result.functionalFeesAmounts.total = functionalFeesTotal;
      } else if (
        payLoad.enrollment_status === 'FRESHER' &&
        payLoad.semester === 'SEMESTERII'
      ) {
        const funcFees = functionalFeesAmount.filter(
          (row) =>
            row.paid_when === 'EveryAcademicYear/SemesterII' ||
            row.paid_when === 'Fresher/EverySemester' ||
            row.paid_when === 'EveryAcademicYear/EverySemester' ||
            row.paid_when === 'Fresher/SemesterII'
        );

        const filtered = [...funcFees, ...uniqFees];

        const functionalFeesTotal = filtered.sum('amount');

        // result = {
        //   functionalFeesAmounts: {
        //     elements: filtered,
        //     total: functionalFeesTotal,
        //   },
        // };

        result.functionalFeesAmounts.elements = filtered;
        result.functionalFeesAmounts.total = functionalFeesTotal;
      } else if (
        payLoad.enrollment_status === 'CONTINUINGSTUDENT' &&
        payLoad.semester === 'SEMESTERI'
      ) {
        const funcFees = functionalFeesAmount.filter(
          (row) =>
            row.paid_when === 'EveryAcademicYear/SemesterI' ||
            row.paid_when === 'ContinuingStudent/EverySemester' ||
            row.paid_when === 'EveryAcademicYear/EverySemester' ||
            row.paid_when === 'ContinuingStudents/SemesterI'
        );

        const filtered = [...funcFees, ...uniqFees];

        const functionalFeesTotal = filtered.sum('amount');

        // result = {
        //   functionalFeesAmounts: {
        //     elements: filtered,
        //     total: functionalFeesTotal,
        //   },
        // };

        result.functionalFeesAmounts.elements = filtered;
        result.functionalFeesAmounts.total = functionalFeesTotal;
      } else if (
        payLoad.enrollment_status === 'CONTINUINGSTUDENT' &&
        payLoad.semester === 'SEMESTERII'
      ) {
        const funcFees = functionalFeesAmount.filter(
          (row) =>
            row.paid_when === 'EveryAcademicYear/SemesterII' ||
            row.paid_when === 'ContinuingStudent/EverySemester' ||
            row.paid_when === 'EveryAcademicYear/EverySemester' ||
            row.paid_when === 'ContinuingStudents/SemesterII'
        );
        const filtered = [...funcFees, ...uniqFees];

        const functionalFeesTotal = filtered.sum('amount');

        // result = {
        //   functionalFeesAmounts: {
        //     elements: filtered,
        //     total: functionalFeesTotal,
        //   },
        // };

        result.functionalFeesAmounts.elements = filtered;
        result.functionalFeesAmounts.total = functionalFeesTotal;
      } else if (
        payLoad.enrollment_status === 'FINALIST' &&
        payLoad.semester === 'SEMESTERI'
      ) {
        const funcFees = functionalFeesAmount.filter(
          (row) =>
            row.paid_when === 'EveryAcademicYear/SemesterI' ||
            row.paid_when === 'FinalYear/EverySemester' ||
            row.paid_when === 'EveryAcademicYear/EverySemester' ||
            row.paid_when === 'FinalYear/SemesterI'
        );

        const filtered = [...funcFees, ...uniqFees];

        const functionalFeesTotal = filtered.sum('amount');

        // result = {
        //   functionalFeesAmounts: {
        //     elements: filtered,
        //     total: functionalFeesTotal,
        //   },
        // };

        result.functionalFeesAmounts.elements = filtered;
        result.functionalFeesAmounts.total = functionalFeesTotal;
      } else if (
        payLoad.enrollment_status === 'FINALIST' &&
        payLoad.semester === 'SEMESTERII'
      ) {
        const funcFees = functionalFeesAmount.filter(
          (row) =>
            row.paid_when === 'EveryAcademicYear/SemesterII' ||
            row.paid_when === 'FinalYear/EverySemester' ||
            row.paid_when === 'EveryAcademicYear/EverySemester' ||
            row.paid_when === 'FinalYear/SemesterII'
        );

        const filtered = [...funcFees, ...uniqFees];

        const functionalFeesTotal = filtered.sum('amount');

        // result = {
        //   functionalFeesAmounts: {
        //     elements: filtered,
        //     total: functionalFeesTotal,
        //   },
        // };

        result.functionalFeesAmounts.elements = filtered;
        result.functionalFeesAmounts.total = functionalFeesTotal;
      } else if (
        payLoad.enrollment_status === 'DOINGRETAKESAFTERFINALYEAR' ||
        payLoad.enrollment_status === 'STAYPUT'
      ) {
        const policy = await retakersFeesPolicyService
          .findOneRecord({
            where: {
              enrollment_status_id: payLoad.enrollment_status_id,
              study_level_id: payLoad.study_level_id,
            },
            include: [
              {
                association: 'studyLevel',
                attributed: ['metadata_value'],
              },
            ],
          })
          .then((res) => {
            if (isEmpty(res)) {
              throw new Error(
                'Retakers Fees Policy For This Enrollment Status has not been defined yet.'
              );
            }

            return res;
          });

        if (policy && policy.bill_functional_fees === true) {
          const policyFunctionalFeesElements =
            await retakersFeesPolicyService.findAllRetakersFeesPolicyFunctionalFeesElements(
              {
                where: {
                  retakers_fees_policy_id: policy.id,
                },
                attributes: ['functional_fees_element_id'],
                raw: true,
              }
            );

          const filtered = functionalFeesAmount.filter((elements) =>
            policyFunctionalFeesElements.find(
              ({ functional_fees_element_id: feesId }) =>
                elements.fees_element_id === feesId
            )
          );

          if (isEmpty(filtered)) {
            throw new Error(
              toUpper(
                `The Functional Fees Elements have not been defined for ${policy.studyLevel.metadata_value}.`
              )
            );
          }

          const functionalFeesTotal = filtered.sum('amount');

          result.functionalFeesAmounts.elements = filtered;
          result.functionalFeesAmounts.total = functionalFeesTotal;
        }
      } else if (
        payLoad.enrollment_status === 'EXTENSION' ||
        payLoad.enrollment_status === 'RE-INSTATEMENT'
      ) {
        const policy = await graduateFeesPolicyService
          .findOneRecord({
            where: {
              enrollment_status_id: payLoad.enrollment_status_id,
              study_level_id: payLoad.study_level_id,
            },
            include: [
              {
                association: 'studyLevel',
                attributed: ['metadata_value'],
              },
            ],
          })
          .then((res) => {
            if (isEmpty(res)) {
              throw new Error(
                'Graduate Fees Policy For This Enrollment Status has not been defined yet.'
              );
            }

            return res;
          });

        if (policy && policy.bill_functional_fees === true) {
          const policyFunctionalFeesElements =
            await graduateFeesPolicyService.findAllGraduateFeesPolicyFunctionalFeesElements(
              {
                where: {
                  graduate_fees_policy_id: policy.id,
                },
                attributes: ['functional_fees_element_id'],
                raw: true,
              }
            );

          const filtered = functionalFeesAmount.filter((elements) =>
            policyFunctionalFeesElements.find(
              ({ functional_fees_element_id: feesId }) =>
                elements.fees_element_id === feesId
            )
          );

          if (isEmpty(filtered)) {
            throw new Error(
              toUpper(
                `The Functional Fees Elements have not been defined for ${policy.studyLevel.metadata_value}.`
              )
            );
          }

          const functionalFeesTotal = filtered.sum('amount');

          result.functionalFeesAmounts.elements = filtered;
          result.functionalFeesAmounts.total = functionalFeesTotal;
        }
      } else {
        throw new Error(
          'Unable To Bill Functional Fees Because The Enrollment Status Provided Has Not Been Assigned Yet.'
        );
      }

      if (payLoad.fees_waiver_id) {
        const feesWaiver = await feesWaiverPreviewByContext(payLoad);

        if (payLoad.semester === 'SEMESTERI') {
          result.functionalFeesAmounts = calculateFeesAmountDiscount(
            result.functionalFeesAmounts,
            feesWaiver
          );
        }
        if (payLoad.semester === 'SEMESTERII') {
          result.functionalFeesAmounts = calculateFeesAmountDiscount(
            result.functionalFeesAmounts,
            feesWaiver
          );
        }
      }

      // if (isEmpty(result.functionalFeesAmounts.elements)) {
      //   throw new Error(
      //     `Unable To Match This Student's Enrollment Data To Any Functional Fees Amount Element Context.`
      //   );
      // }
    }

    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * other fees
 * otherFeesPreviewContext
 */
const otherFeesPreviewByContext = async function (payLoad) {
  try {
    let result = {};

    const elements = await feesAmountPreviewService
      .otherFeesPreviewContext(payLoad)
      .then((res) => {
        if (isEmpty(res)) {
          throw new Error(
            "This Student's Other Fees Amount Context Has Not Yet Been Defined."
          );
        }

        return res;
      });

    // eslint-disable-next-line no-extend-native
    Array.prototype.sum = function (prop) {
      let total = 0;

      // eslint-disable-next-line no-underscore-dangle
      for (let i = 0, _len = this.length; i < _len; i++) {
        total += this[i][prop];
      }

      return total;
    };

    const total = elements.sum('amount');

    result = {
      otherFees: {
        elements,
        total,
      },
    };

    if (payLoad.fees_waiver_id) {
      const feesWaiver = await feesWaiverPreviewByContext(payLoad);

      result.otherFees = calculateFeesAmountDiscount(
        result.otherFees,
        feesWaiver
      );
    }

    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * fees waiver
 * feesWaiverPreviewContext
 */
const feesWaiverPreviewByContext = async function (waiverPayLoad) {
  try {
    const elements =
      await feesAmountPreviewService.feesWaiversPreviewContextFunction(
        waiverPayLoad
      );
    const result = { elements };

    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} feesObject
 * @param {*} feesWaiver
 * fees  waiver ... calculate discounts
 */
const calculateFeesAmountDiscount = function (feesObject, feesWaiver) {
  const newElementAmounts = feesObject.elements.map((element) => {
    const findWaiver = feesWaiver.elements.find(
      (waiver) => waiver.fees_element_id === element.fees_element_id
    );

    let discountAmount;

    let percentageDiscount = 0;

    let newAmount = element.amount;

    if (findWaiver) {
      percentageDiscount = findWaiver.percentage_discount;
      discountAmount = (percentageDiscount / 100) * element.amount.toFixed(0);
      newAmount = element.amount - discountAmount;
    }

    return {
      ...element,
      new_amount: newAmount,
      discount_amount: discountAmount,
      percentage_discount: percentageDiscount,
    };
  });
  const total = newElementAmounts.sum('new_amount');

  return { elements: newElementAmounts, total };
};

/**
 *
 * @param {*} payLoad
 */
const annualTuitionByContext = async function (payLoad) {
  try {
    let resultSem1 = {};

    let resultSem2 = {};

    let annualTuition = 0;

    // tuition fees context
    const tuitionAmount = await feesAmountPreviewService
      .tuitionAmountPreviewContext(payLoad)
      .then((res) => {
        if (isEmpty(res)) {
          throw new Error(
            "This Student's Tuition Amount Context Has Not Yet Been Defined."
          );
        }

        return res;
      });

    // Sum Object amount values
    // eslint-disable-next-line no-extend-native
    Array.prototype.sum = function (prop) {
      let total = 0;

      // eslint-disable-next-line no-underscore-dangle
      for (let i = 0, _len = this.length; i < _len; i++) {
        total += this[i][prop];
      }

      return total;
    };

    const filteredSem1 = tuitionAmount.filter(
      (row) =>
        row.paid_when === 'SemesterI' || row.paid_when === 'EverySemester'
    );
    const tuitionAmountTotalSemester1 = filteredSem1.sum('amount');

    resultSem1 = {
      tuitionAmounts: {
        //  elements: filteredSem1,
        total: tuitionAmountTotalSemester1,
      },
    };

    const filteredSem2 = tuitionAmount.filter(
      (row) =>
        row.paid_when === 'SemesterII' || row.paid_when === 'EverySemester'
    );
    const tuitionAmountTotalSemester2 = filteredSem2.sum('amount');

    resultSem2 = {
      tuitionAmounts: {
        //   elements: filteredSem2,
        total: tuitionAmountTotalSemester2,
      },
    };

    annualTuition =
      resultSem1.tuitionAmounts.total + resultSem2.tuitionAmounts.total;

    return annualTuition;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  tuitionAmountPreviewByContext,
  functionalFeesPreviewByContext,
  otherFeesPreviewByContext,
  annualTuitionByContext,
};
