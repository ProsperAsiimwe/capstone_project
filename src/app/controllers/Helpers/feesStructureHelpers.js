const { feesAmountPreviewService } = require('@services/index');
const { isEmpty } = require('lodash');
const { feesStructureFunctional } = require('./feesStructureFunctionalHelper');

/**
 * fees structure
 */
const feesStructureFunction = async function (context) {
  if (
    !context.programme_id ||
    !context.entry_academic_year_id ||
    !context.campus_id ||
    !context.intake_id ||
    !context.billing_category_id ||
    !context.student_entry_year ||
    !context.programme_type_id ||
    !context.study_level_id
  ) {
    throw new Error('Invalid Context Provided');
  }

  const studyYears = await feesAmountPreviewService.feesProgrammeStudyYears(
    context
  );

  if (isEmpty(studyYears)) {
    throw new Error('No study years defined for this programme');
  }

  let tuitionFeesResult = [];

  if (context.fees_waiver_id) {
    const feesWaiver = await feesWaiverPreviewByContext(context);

    const tuitionFeesResultData =
      await feesAmountPreviewService.feesStructureTuition(context);

    const waivedTuitionFees = calculateFeesAmountDiscount(
      tuitionFeesResultData,
      feesWaiver
    );

    tuitionFeesResult = waivedTuitionFees.elements;
  } else {
    tuitionFeesResult = await feesAmountPreviewService.feesStructureTuition(
      context
    );
  }

  const functionalFees = await feesStructureFunctional(context);

  const programmeStudyYear = [];

  studyYears.forEach((element) => {
    const semesterOne = {};
    const semesterTwo = {};

    programmeStudyYear.push({
      programme_study_year_id: element.programme_study_year_id,
      programme_study_year: element.programme_study_year,
      semesterOne: semesterOne,
      semesterTwo: semesterTwo,
    });
  });

  const arrayLength = programmeStudyYear.length;

  const finalIndex = arrayLength - 1;

  programmeStudyYear.map((element, index) => {
    if (index === 0) {
      element.semesterOne = {
        // FunctionalFees: {
        //   ...functionalFees.freshSemesterOne,
        // },
        FunctionalFees: functionalFees.freshSemesterOne.freshSemesterOne,
      };

      element.semesterTwo = {
        FunctionalFees: functionalFees.freshSemesterTwo.freshSemesterTwo,
      };
    } else if (index === finalIndex) {
      element.semesterOne = {
        FunctionalFees:
          functionalFees.finalFeesSemesterOne.finalFeesSemesterOne,
      };
      element.semesterTwo = {
        FunctionalFees:
          functionalFees.finalFeesSemesterTwo.finalFeesSemesterTwo,
      };
    } else {
      element.semesterOne = {
        FunctionalFees:
          functionalFees.continuingSemesterOne.continuingSemesterOne,
      };
      element.semesterTwo = {
        FunctionalFees:
          functionalFees.continuingSemesterTwo.continuingSemesterTwo,
      };
    }

    return programmeStudyYear;
  });

  const feesStructure = programmeStudyYear;

  feesStructure.map((element) => {
    const tuitionSemesterOne = tuitionFeesResult.filter((row) => {
      return (
        (row.paid_when === 'SemesterI' &&
          row.programme_study_year === element.programme_study_year) ||
        (row.paid_when === 'EverySemester' &&
          row.programme_study_year === element.programme_study_year)
      );
    });

    const tuitionSemesterTwo = tuitionFeesResult.filter((row) => {
      return (
        (row.paid_when === 'SemesterII' &&
          row.programme_study_year === element.programme_study_year) ||
        (row.paid_when === 'EverySemester' &&
          row.programme_study_year === element.programme_study_year)
      );
    });

    element.semesterOne.tuitionFees = tuitionSemesterOne;
    element.semesterTwo.tuitionFees = tuitionSemesterTwo;

    return feesStructure;
  });

  // const data = { feesStructure };

  return { feesStructure };
};

//  feesWaiverPreviewByContext

const feesWaiverPreviewByContext = async (data) => {
  try {
    const elements = await feesAmountPreviewService.feesWaiversAdmissionLetter(
      data
    );
    const result = { elements };

    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};

// calculate
const calculateFeesAmountDiscount = (feesObject, feesWaiver) => {
  const newElementAmounts = feesObject.map((element) => {
    const findWaiver = feesWaiver.elements.find(
      (waiver) => waiver.fees_element_id === element.fees_element_id
    );

    let discountAmount;

    let percentageDiscount = 0;

    let newAmount = element.amount;

    if (findWaiver) {
      // eslint-disable-next-line prefer-destructuring
      percentageDiscount = findWaiver.percentage_discount;
      discountAmount = ((percentageDiscount / 100) * element.amount).toFixed(0);
      newAmount = element.amount - discountAmount;
    }

    return {
      fees_element_id: element.fees_element_id,
      programme_study_year: element.programme_study_year,
      fees_element_code: element.fees_element_code,
      fees_element_name: element.fees_element_name,
      fees_element_category: element.fees_element_category,
      paid_when: element.paid_when,
      oldAmount: element.amount,
      currency: element.currency,
      amount: newAmount,
      discountAmount,
      percentageDiscount,
    };
  });

  return { elements: newElementAmounts };
};

module.exports = { feesStructureFunction };
