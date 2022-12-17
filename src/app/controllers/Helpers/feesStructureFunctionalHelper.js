const { feesAmountPreviewService } = require('@services/index');
const { sumBy, uniqBy } = require('lodash');

/**
 * fees structure
 */
const feesStructureFunctional = async function (context) {
  if (
    !context.programme_id ||
    !context.entry_academic_year_id ||
    !context.campus_id ||
    !context.intake_id ||
    !context.billing_category_id
  ) {
    throw new Error('Invalid Context Provided');
  }

  let functionalFees = [];

  if (context.fees_waiver_id) {
    const feesWaiver = await feesWaiverPreviewByContext(context);

    const functionalFeesData =
      await feesAmountPreviewService.feesStructureFunctional(context);
    const waivedFunctionalFees = calculateFeesAmountDiscount(
      functionalFeesData,
      feesWaiver
    );

    functionalFees = waivedFunctionalFees.elements;
  } else {
    functionalFees = await feesAmountPreviewService.feesStructureFunctional(
      context
    );
  }

  const freshSemesterOne = uniqBy(
    functionalFees.filter(
      (row) =>
        row.paid_when === 'EveryAcademicYear/SemesterI' ||
        row.paid_when === 'Fresher/EverySemester' ||
        row.paid_when === 'EveryAcademicYear/EverySemester' ||
        row.paid_when === 'Fresher/SemesterI'
    ),
    'fees_element_name'
  );

  const freshSemesterOneTotal = sumBy(freshSemesterOne, 'amount');

  const freshSemesterTwo = uniqBy(
    functionalFees.filter(
      (row) =>
        row.paid_when === 'EveryAcademicYear/SemesterII' ||
        row.paid_when === 'Fresher/EverySemester' ||
        row.paid_when === 'EveryAcademicYear/EverySemester' ||
        row.paid_when === 'Fresher/SemesterII'
    ),
    'fees_element_name'
  );
  const freshSemesterTwoTotal = sumBy(freshSemesterTwo, 'amount');

  // continuing student

  const continuingSemesterOne = uniqBy(
    functionalFees.filter(
      (row) =>
        row.paid_when === 'EveryAcademicYear/SemesterI' ||
        row.paid_when === 'ContinuingStudent/EverySemester' ||
        row.paid_when === 'EveryAcademicYear/EverySemester' ||
        row.paid_when === 'ContinuingStudents/SemesterI'
    ),
    'fees_element_name'
  );
  const continuingSemesterOneTotal = sumBy(continuingSemesterOne, 'amount');

  const continuingSemesterTwo = uniqBy(
    functionalFees.filter(
      (row) =>
        row.paid_when === 'EveryAcademicYear/SemesterII' ||
        row.paid_when === 'ContinuingStudent/EverySemester' ||
        row.paid_when === 'EveryAcademicYear/EverySemester' ||
        row.paid_when === 'ContinuingStudents/SemesterII'
    ),
    'fees_element_name'
  );
  const continuingSemesterTwoTotal = sumBy(continuingSemesterTwo, 'amount');

  // finial student

  const finalFeesSemesterOne = uniqBy(
    functionalFees.filter(
      (row) =>
        row.paid_when === 'EveryAcademicYear/SemesterI' ||
        row.paid_when === 'FinalYear/EverySemester' ||
        row.paid_when === 'EveryAcademicYear/EverySemester' ||
        row.paid_when === 'FinalYear/SemesterI'
    ),
    'fees_element_name'
  );
  const finalSemesterOneTotal = sumBy(finalFeesSemesterOne, 'amount');

  const finalFeesSemesterTwo = uniqBy(
    functionalFees.filter(
      (row) =>
        row.paid_when === 'EveryAcademicYear/SemesterII' ||
        row.paid_when === 'FinalYear/EverySemester' ||
        row.paid_when === 'EveryAcademicYear/EverySemester' ||
        row.paid_when === 'FinalYear/SemesterII'
    ),
    'fees_element_name'
  );
  const finalSemesterTwoTotal = sumBy(finalFeesSemesterTwo, 'amount');

  const studentFunctionalFees = {
    freshSemesterOne: { freshSemesterOne, freshSemesterOneTotal },
    freshSemesterTwo: { freshSemesterTwo, freshSemesterTwoTotal },
    continuingSemesterOne: {
      continuingSemesterOne,
      continuingSemesterOneTotal,
    },
    continuingSemesterTwo: {
      continuingSemesterTwo,
      continuingSemesterTwoTotal,
    },
    finalFeesSemesterOne: { finalFeesSemesterOne, finalSemesterOneTotal },
    finalFeesSemesterTwo: { finalFeesSemesterTwo, finalSemesterTwoTotal },
  };

  return studentFunctionalFees;
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
      discountAmount =
        ((percentageDiscount / 100) * element.amount).toFixed(0) || 0;
      newAmount = element.amount - discountAmount;
    }

    return {
      fees_element_id: element.fees_element_id,
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

module.exports = { feesStructureFunctional };
