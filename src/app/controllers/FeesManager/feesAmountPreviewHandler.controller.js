/* eslint-disable camelcase */
const { HttpResponse } = require('@helpers');
const { feesAmountPreviewService } = require('@services/index');
const { isEmpty, merge } = require('lodash');

const http = new HttpResponse();

class FeesAmountPreviewHandler {
  /**
   * fees preview controller
   * @param {*} req
   * @param {*} res
   */
  async feesAmountPreviewByHandler(req, res) {
    try {
      if (isEmpty(req.body)) {
        throw new Error('Invalid context');
      }
      if (
        !req.body.academic_year_id ||
        !req.body.campus_id ||
        !req.body.billing_category_id ||
        !req.body.programme_study_year_id ||
        !req.body.programme_id ||
        !req.body.programme_type_id ||
        !req.body.study_level_id ||
        !req.body.metadata_programme_type_id ||
        !req.body.status
      ) {
        throw new Error('Invalid context');
      }

      if (req.body.status === '' || req.body.semester === '') {
        throw new Error('Status Context Empty');
      }

      const tuitionFees = await tuitionAmountPreviewByContext(req);
      const functionalFees = await functionalFeesPreviewByContext(req);

      const semesterGroup = merge(tuitionFees, functionalFees);

      const response = { ...semesterGroup };

      if (!isEmpty(req.body.other_fees)) {
        const otherFees = await otherFeesPreviewByContext(req);

        response.otherFees = otherFees;
      }

      if (req.body.fees_waiver_id) {
        const feesWaiver = await feesWaiverPreviewByContext(req);

        if (req.body.semester === 'SEMESTERI') {
          response.semesterOne.tuitionAmounts = calculateFeesAmountDiscount(
            response.semesterOne.tuitionAmounts,
            feesWaiver
          );
          response.semesterOne.functionalFeesAmounts =
            calculateFeesAmountDiscount(
              response.semesterOne.functionalFeesAmounts,
              feesWaiver
            );
        }

        if (req.body.semester === 'SEMESTERII') {
          response.semesterTwo.tuitionAmounts = calculateFeesAmountDiscount(
            response.semesterTwo.tuitionAmounts,
            feesWaiver
          );

          response.semesterTwo.functionalFeesAmounts =
            calculateFeesAmountDiscount(
              response.semesterTwo.functionalFeesAmounts,
              feesWaiver
            );
        }

        if (req.body.semester === 'all') {
          response.semesterOne.tuitionAmounts = calculateFeesAmountDiscount(
            response.semesterOne.tuitionAmounts,
            feesWaiver
          );
          response.semesterOne.functionalFeesAmounts =
            calculateFeesAmountDiscount(
              response.semesterOne.functionalFeesAmounts,
              feesWaiver
            );
          response.semesterTwo.tuitionAmounts = calculateFeesAmountDiscount(
            response.semesterTwo.tuitionAmounts,
            feesWaiver
          );

          response.semesterTwo.functionalFeesAmounts =
            calculateFeesAmountDiscount(
              response.semesterTwo.functionalFeesAmounts,
              feesWaiver
            );
        }

        if (!isEmpty(req.body.other_fees)) {
          response.otherFees = calculateFeesAmountDiscount(
            response.otherFees,
            feesWaiver
          );
        }
      }

      http.setSuccess(200, 'fees amount fetched successfully ', {
        response,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Fees Amounts', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

/**
 *
 * tuition fees
 * const tuitionAmountPreviewAllStudyYears = async (req) =>
 */
const tuitionAmountPreviewByContext = async (req) => {
  try {
    const { discount_class_id, other_fees_id, semester, ...context } = req.body;

    let result = {};

    // const { semester } = req.body;
    // tuition fees context
    const tuitionAmount =
      await feesAmountPreviewService.tuitionAmountPreviewContext(context);

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

    if (semester === 'SEMESTERI') {
      const filtered = tuitionAmount.filter(
        (row) =>
          row.paid_when === 'SemesterI' || row.paid_when === 'EverySemester'
      );
      const tuitionAmountTotal = filtered.sum('amount');

      result = {
        semesterOne: {
          tuitionAmounts: {
            elements: filtered,
            total: tuitionAmountTotal,
          },
        },
      };
    } else if (semester === 'SEMESTERII') {
      const filtered = tuitionAmount.filter(
        (row) =>
          row.paid_when === 'SemesterII' || row.paid_when === 'EverySemester'
      );
      const tuitionAmountTotal = filtered.sum('amount');

      result = {
        semesterTwo: {
          tuitionAmounts: {
            elements: filtered,
            total: tuitionAmountTotal,
          },
        },
      };
    } else if (semester === 'all') {
      const filteredOne = tuitionAmount.filter(
        (row) =>
          row.paid_when === 'SemesterI' || row.paid_when === 'EverySemester'
      );
      const tuitionAmountSemesterI = filteredOne.sum('amount');

      const filteredTwo = tuitionAmount.filter(
        (row) =>
          row.paid_when === 'SemesterII' || row.paid_when === 'EverySemester'
      );

      const tuitionAmountSemesterII = filteredTwo.sum('amount');

      result = {
        semesterOne: {
          tuitionAmounts: {
            elements: filteredOne,
            total: tuitionAmountSemesterI,
          },
        },

        semesterTwo: {
          tuitionAmounts: {
            elements: filteredTwo,
            total: tuitionAmountSemesterII,
          },
        },
      };
    } else {
      throw new Error('Invalid context provided');
    }

    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};
/**
 * functional fees
 */

const functionalFeesPreviewByContext = async (req) => {
  try {
    const { discount_class_id, other_fees_id, ...context } = req.body;

    let result = {};

    // const { status } = req.params;
    const { semester, status } = req.body;

    const functionalFeesAmount =
      await feesAmountPreviewService.functionalFeesPreviewContext(context);

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
      (status === 'FRESHER' && semester === 'SEMESTERI') ||
      (status === 'first' && semester === 'SEMESTERI')
    ) {
      const filtered = functionalFeesAmount.filter(
        (row) =>
          row.paid_when === 'EveryAcademicYear/SemesterI' ||
          row.paid_when === 'Fresher/EverySemester' ||
          row.paid_when === 'Fresher/SemesterI' ||
          row.paid_when === 'EveryAcademicYear/EverySemester'
      );
      const functionalFeesTotal = filtered.sum('amount');

      result = {
        semesterOne: {
          functionalFeesAmounts: {
            elements: filtered,
            total: functionalFeesTotal,
          },
        },
      };
    } else if (
      (status === 'first' && semester === 'SEMESTERII') ||
      (status === 'FRESHER' && semester === 'SEMESTERII')
    ) {
      const filtered = functionalFeesAmount.filter(
        (row) =>
          row.paid_when === 'EveryAcademicYear/SemesterII' ||
          row.paid_when === 'Fresher/EverySemester' ||
          row.paid_when === 'Fresher/SemesterII' ||
          row.paid_when === 'EveryAcademicYear/EverySemester'
      );

      const functionalFeesTotal = filtered.sum('amount');

      result = {
        semesterTwo: {
          functionalFeesAmounts: {
            elements: filtered,
            total: functionalFeesTotal,
          },
        },
      };
    } else if (
      (status === 'first' && semester === 'all') ||
      (status === 'FRESHER' && semester === 'all')
    ) {
      const filteredOne = functionalFeesAmount.filter(
        (row) =>
          row.paid_when === 'EveryAcademicYear/SemesterI' ||
          row.paid_when === 'Fresher/EverySemester' ||
          row.paid_when === 'EveryAcademicYear/EverySemester'
      );
      const functionalFeesSemesterOne = filteredOne.sum('amount');
      const filteredTwo = functionalFeesAmount.filter(
        (row) =>
          row.paid_when === 'EveryAcademicYear/SemesterII' ||
          row.paid_when === 'Fresher/EverySemester' ||
          row.paid_when === 'EveryAcademicYear/EverySemester'
      );
      const functionalFeesSemesterTwo = filteredTwo.sum('amount');

      result = {
        semesterOne: {
          functionalFeesAmounts: {
            elements: filteredOne,
            total: functionalFeesSemesterOne,
          },
        },

        semesterTwo: {
          functionalFeesAmounts: {
            elements: filteredTwo,
            total: functionalFeesSemesterTwo,
          },
        },
      };
    } else if (
      (status === 'continuing' && semester === 'SEMESTERI') ||
      (status === 'CONTINUINGSTUDENT' && semester === 'SEMESTERI')
    ) {
      const filtered = functionalFeesAmount.filter(
        (row) =>
          row.paid_when === 'EveryAcademicYear/SemesterI' ||
          row.paid_when === 'ContinuingStudent/EverySemester' ||
          row.paid_when === 'EveryAcademicYear/EverySemester' ||
          row.paid_when === 'ContinuingStudents/SemesterI'
      );

      const functionalFeesTotal = filtered.sum('amount');

      result = {
        semesterOne: {
          functionalFeesAmounts: {
            elements: filtered,
            total: functionalFeesTotal,
          },
        },
      };
    } else if (
      (status === 'continuing' && semester === 'SEMESTERII') ||
      (status === 'CONTINUINGSTUDENT' && semester === 'SEMESTERII')
    ) {
      const filtered = functionalFeesAmount.filter(
        (row) =>
          row.paid_when === 'EveryAcademicYear/SemesterII' ||
          row.paid_when === 'ContinuingStudent/EverySemester' ||
          row.paid_when === 'EveryAcademicYear/EverySemester' ||
          row.paid_when === 'ContinuingStudents/SemesterII'
      );
      const functionalFeesTotal = filtered.sum('amount');

      result = {
        semesterTwo: {
          functionalFeesAmounts: {
            elements: filtered,
            total: functionalFeesTotal,
          },
        },
      };
    } else if (
      (status === 'continuing' && semester === 'all') ||
      (status === 'CONTINUINGSTUDENT' && semester === 'all')
    ) {
      const filteredOne = functionalFeesAmount.filter(
        (row) =>
          row.paid_when === 'EveryAcademicYear/SemesterI' ||
          row.paid_when === 'ContinuingStudent/EverySemester' ||
          row.paid_when === 'EveryAcademicYear/EverySemester' ||
          row.paid_when === 'ContinuingStudents/SemesterI'
      );
      const functionalFeesSemesterOne = filteredOne.sum('amount');
      const filteredTwo = functionalFeesAmount.filter(
        (row) =>
          row.paid_when === 'EveryAcademicYear/SemesterII' ||
          row.paid_when === 'ContinuingStudent/EverySemester' ||
          row.paid_when === 'EveryAcademicYear/EverySemester' ||
          row.paid_when === 'ContinuingStudents/SemesterII'
      );
      const functionalFeesSemesterTwo = filteredTwo.sum('amount');

      result = {
        semesterOne: {
          functionalFeesAmounts: {
            elements: filteredOne,
            total: functionalFeesSemesterOne,
          },
        },

        semesterTwo: {
          functionalFeesAmounts: {
            elements: filteredTwo,
            total: functionalFeesSemesterTwo,
          },
        },
      };
    } else if (
      (status === 'final' && semester === 'SEMESTERI') ||
      (status === 'FINALIST' && semester === 'SEMESTERI')
    ) {
      const filtered = functionalFeesAmount.filter(
        (row) =>
          row.paid_when === 'EveryAcademicYear/SemesterI' ||
          row.paid_when === 'FinalYear/EverySemester' ||
          row.paid_when === 'EveryAcademicYear/EverySemester' ||
          row.paid_when === 'FinalYear/SemesterI'
      );
      const functionalFeesTotal = filtered.sum('amount');

      result = {
        semesterOne: {
          functionalFeesAmounts: {
            elements: filtered,
            total: functionalFeesTotal,
          },
        },
      };
    } else if (
      (status === 'final' && semester === 'SEMESTERII') ||
      (status === 'FINALIST' && semester === 'SEMESTERII')
    ) {
      const filtered = functionalFeesAmount.filter(
        (row) =>
          row.paid_when === 'EveryAcademicYear/SemesterII' ||
          row.paid_when === 'FinalYear/EverySemester' ||
          row.paid_when === 'EveryAcademicYear/EverySemester' ||
          row.paid_when === 'FinalYear/SemesterII'
      );
      const functionalFeesTotal = filtered.sum('amount');

      result = {
        semesterTwo: {
          functionalFeesAmounts: {
            elements: filtered,
            total: functionalFeesTotal,
          },
        },
      };
    } else if (
      (status === 'final' && semester === 'all') ||
      (status === 'FINALIST' && semester === 'all')
    ) {
      const filteredOne = functionalFeesAmount.filter(
        (row) =>
          row.paid_when === 'EveryAcademicYear/SemesterI' ||
          row.paid_when === 'FinalYear/EverySemester' ||
          row.paid_when === 'EveryAcademicYear/EverySemester' ||
          row.paid_when === 'FinalYear/SemesterI'
      );
      const functionalFeesSemesterOne = filteredOne.sum('amount');
      const filteredTwo = functionalFeesAmount.filter(
        (row) =>
          row.paid_when === 'EveryAcademicYear/SemesterII' ||
          row.paid_when === 'FinalYear/EverySemester' ||
          row.paid_when === 'EveryAcademicYear/EverySemester' ||
          row.paid_when === 'FinalYear/SemesterII'
      );
      const functionalFeesSemesterTwo = filteredTwo.sum('amount');

      result = {
        semesterOne: {
          functionalFeesAmounts: {
            elements: filteredOne,
            total: functionalFeesSemesterOne,
          },
        },

        semesterTwo: {
          functionalFeesAmounts: {
            elements: filteredTwo,
            total: functionalFeesSemesterTwo,
          },
        },
      };
    }

    return result;
  } catch (error) {}
};

/**
 * other fees
 * otherFeesPreviewContext
 */
const otherFeesPreviewByContext = async (req) => {
  try {
    const { fees_waiver_id, ...context } = req.body;

    const elements = await feesAmountPreviewService.otherFeesPreviewContext(
      context
    );

    const total = elements.sum('amount');
    const result = { elements, total };

    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * fees waiver
 * feesWaiverPreviewContext
 */
const feesWaiverPreviewByContext = async (req) => {
  try {
    const { other_fees, ...context } = req.body;

    const elements =
      await feesAmountPreviewService.feesWaiversPreviewContextFunction(context);
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

const calculateFeesAmountDiscount = (feesObject, feesWaiver) => {
  const newElementAmounts = feesObject.elements.map((element) => {
    const findWaiver = feesWaiver.elements.find(
      (waiver) => waiver.fees_element_id === element.fees_element_id
    );

    let discount_amount;

    let percentage_discount = 0;

    let new_amount = element.amount;

    if (findWaiver) {
      // eslint-disable-next-line prefer-destructuring
      percentage_discount = findWaiver.percentage_discount;
      discount_amount = ((percentage_discount / 100) * element.amount).toFixed(
        0
      );
      new_amount = element.amount - discount_amount;
    }

    return {
      ...element,
      new_amount,
      discount_amount,
      percentage_discount,
    };
  });

  const total = newElementAmounts.sum('new_amount');

  return { elements: newElementAmounts, total };
};

module.exports = FeesAmountPreviewHandler;
