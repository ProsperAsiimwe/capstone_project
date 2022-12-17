const { HttpResponse } = require('@helpers');
const { feesCopyService, tuitionAmountService } = require('@services/index');
const { isEmpty } = require('lodash');
const model = require('@models');

const http = new HttpResponse();

class FeesCopyController {
  /**
   * fees preview controller
   * @param {*} req
   * @param {*} res
   */
  async feesCopyHandler(req, res) {
    try {
      const data = req.body;
      const user = req.user.id;

      const tuitionCopyResult = [];
      const functionalCopyResult = [];
      const otherFeesCopyResult = [];
      const waiverCopyResult = [];

      const checkValidations = await requestFeesCopy(data);

      await model.sequelize.transaction(async (transaction) => {
        //
        if (checkValidations.checkTuition === true) {
          const bulkTuition = [];
          const bulkTuitionAmountFeesElements = [];

          const allTuitionAmounts =
            await tuitionAmountService.findAllTuitionAmounts({
              where: {
                intake_id: data.to_intake_id,
                campus_id: data.to_campus_id,
                academic_year_id: data.to_academic_year_id,
              },
              attributes: [
                'id',
                'campus_id',
                'intake_id',
                'academic_year_id',
                'billing_category_id',
                'programme_id',
                'programme_type_id',
                'study_year_id',
              ],
              raw: true,
            });

          for (const eachObject of checkValidations.tuitionFees) {
            const checkExists = allTuitionAmounts.find(
              (amt) =>
                parseInt(amt.programme_id, 10) ===
                  parseInt(eachObject.programme_id, 10) &&
                parseInt(amt.programme_type_id, 10) ===
                  parseInt(eachObject.programme_type_id, 10) &&
                parseInt(amt.study_year_id, 10) ===
                  parseInt(eachObject.study_year_id, 10) &&
                parseInt(amt.billing_category_id, 10) ===
                  parseInt(eachObject.billing_category_id, 10)
            );

            if (!isEmpty(eachObject.tuition_amount_fees_elements)) {
              const payload = {};

              payload.programme_id = eachObject.programme_id;
              payload.programme_type_id = eachObject.programme_type_id;
              payload.study_year_id = eachObject.study_year_id;
              payload.billing_category_id = eachObject.billing_category_id;
              payload.academic_year_id = data.to_academic_year_id;
              payload.intake_id = data.to_intake_id;
              payload.campus_id = data.to_campus_id;
              payload.created_by_id = user;

              const amountElements = [];

              eachObject.tuition_amount_fees_elements.forEach(
                (amountElement) => {
                  if (
                    amountElement.create_approval_status.includes('PENDING')
                  ) {
                    amountElements.push({
                      fees_element_id: amountElement.fees_element_id,
                      currency_id: amountElement.currency_id,
                      paid_when_id: amountElement.paid_when_id,
                      amount: amountElement.amount,
                      created_by_id: user,
                      approvals: {
                        created_by_id: user,
                      },
                    });
                  } else {
                    amountElements.push({
                      fees_element_id: amountElement.fees_element_id,
                      currency_id: amountElement.currency_id,
                      paid_when_id: amountElement.paid_when_id,
                      amount: amountElement.amount,
                      created_by_id: user,
                      create_approval_status: 'APPROVED',
                    });
                  }
                }
              );

              payload.tuitionAmountFeesElements = amountElements;

              if (!checkExists) {
                bulkTuition.push(payload);
              } else {
                bulkTuitionAmountFeesElements.push({
                  tuition_amount_id: checkExists.id,
                  tuitionAmountFeesElements: payload.tuitionAmountFeesElements,
                });
              }

              // const result = await feesCopyService.createTuitionAmount(
              //   payload,
              //   transaction
              // );

              // if (result[1] === true) {
              //   tuitionCopyResult.push(result[0]);
              // }
            }
          }

          if (!isEmpty(bulkTuition)) {
            const result = await feesCopyService.bulkCreateTuitionAmount(
              bulkTuition,
              transaction
            );

            tuitionCopyResult.push(result);
          }

          if (!isEmpty(bulkTuitionAmountFeesElements)) {
            await feesCopyService.bulkCreateTuitionAmountFeesElements(
              bulkTuitionAmountFeesElements,
              transaction
            );

            // if (result[1] === true) {
            //   tuitionCopyResult.push(result[0]);
            // }
          }
        }

        if (checkValidations.checkFunctional === true) {
          for (const eachObject of checkValidations.functionalFees) {
            if (!isEmpty(eachObject.functional_fees_amount_fees_elements)) {
              const payload = {};

              payload.programme_study_level_id =
                eachObject.programme_study_level_id;
              payload.billing_category_id = eachObject.billing_category_id;
              payload.programme_type_id = eachObject.programme_type_id;
              payload.academic_year_id = data.to_academic_year_id;
              payload.intake_id = data.to_intake_id;
              payload.campus_id = data.to_campus_id;
              payload.created_by_id = user;

              const amountElements = [];

              eachObject.functional_fees_amount_fees_elements.forEach(
                (amountElement) => {
                  if (
                    amountElement.create_approval_status.includes('PENDING')
                  ) {
                    amountElements.push({
                      fees_element_id: amountElement.fees_element_id,
                      currency_id: amountElement.currency_id,
                      paid_when_id: amountElement.paid_when_id,
                      amount: amountElement.amount,
                      created_by_id: user,
                      approvals: {
                        created_by_id: user,
                      },
                    });
                  } else {
                    amountElements.push({
                      fees_element_id: amountElement.fees_element_id,
                      currency_id: amountElement.currency_id,
                      paid_when_id: amountElement.paid_when_id,
                      amount: amountElement.amount,
                      create_approval_status: 'APPROVED',
                      created_by_id: user,
                    });
                  }
                }
              );

              payload.functionalFeesAmountFeesElements = amountElements;

              const result = await feesCopyService.createFunctionalAmount(
                payload,
                transaction
              );

              if (result[1] === true) {
                functionalCopyResult.push(result[0]);
              }
            }
          }
        }

        if (checkValidations.checkOtherFees === true) {
          for (const eachObject of checkValidations.otherFees) {
            if (!isEmpty(eachObject.other_fees_amount_fees_elements)) {
              const payload = {};

              payload.billing_category_id = eachObject.billing_category_id;
              payload.academic_year_id = data.to_academic_year_id;
              payload.intake_id = data.to_intake_id;
              payload.campus_id = data.to_campus_id;
              payload.created_by_id = user;

              const amountElements = [];

              eachObject.other_fees_amount_fees_elements.forEach(
                (amountElement) => {
                  if (
                    amountElement.create_approval_status.includes('PENDING')
                  ) {
                    amountElements.push({
                      fees_element_id: amountElement.fees_element_id,
                      currency_id: amountElement.currency_id,
                      amount: amountElement.amount,
                      created_by_id: user,
                      approvals: {
                        created_by_id: user,
                      },
                    });
                  } else {
                    amountElements.push({
                      fees_element_id: amountElement.fees_element_id,
                      currency_id: amountElement.currency_id,
                      amount: amountElement.amount,
                      created_by_id: user,
                      create_approval_status: 'APPROVED',
                    });
                  }
                }
              );

              payload.otherFeesAmountFeesElements = amountElements;

              const result = await feesCopyService.createOtherFeesAmount(
                payload,
                transaction
              );

              if (result[1] === true) {
                otherFeesCopyResult.push(result[0]);
              }
            }
          }
        }

        if (checkValidations.checkFeesWaivers === true) {
          for (const eachObject of checkValidations.waiverFees) {
            if (!isEmpty(eachObject.discounted_elements)) {
              const payload = {};

              payload.fees_waiver_id = eachObject.fees_waiver_id;
              payload.academic_year_id = data.to_academic_year_id;
              payload.intake_id = data.to_intake_id;
              payload.campus_id = data.to_campus_id;
              payload.created_by_id = user;

              const discountElements = [];

              eachObject.discounted_elements.forEach((discountElement) => {
                if (
                  discountElement.create_approval_status.includes('PENDING')
                ) {
                  discountElements.push({
                    fees_element_id: discountElement.fees_element_id,
                    percentage_discount: discountElement.percentage_discount,
                    created_by_id: user,
                    approvals: {
                      created_by_id: user,
                    },
                  });
                } else {
                  discountElements.push({
                    fees_element_id: discountElement.fees_element_id,
                    percentage_discount: discountElement.percentage_discount,
                    created_by_id: user,
                    create_approval_status: 'APPROVED',
                  });
                }
              });

              payload.discountedElements = discountElements;

              const result = await feesCopyService.createWaiverDiscountAmount(
                payload,
                transaction
              );

              if (result[1] === true) {
                waiverCopyResult.push(result[0]);
              }
            }
          }
        }
      });

      http.setSuccess(200, 'Fees Copy Generated Successfully.', {
        data: tuitionCopyResult.concat(
          functionalCopyResult,
          otherFeesCopyResult,
          waiverCopyResult
        ),
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable Generate Fees Copy.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   * find users and their roles
   *
   *
   */
  async tuitionAmountFeesCopyFunction(req, res) {
    try {
      const context = req.body;
      const tuitionFeesCopy = await feesCopyService.findUserRoleAppFunctions(
        context
      );

      http.setSuccess(200, 'Tuition Fees Amount fetched successful', {
        tuitionFeesCopy,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to fetch tuition fees  amounts', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}
/**
 *
 * @param {functions to fetch fees amounts}
 */

/**
 *tuition fees copy
 */
const tuitionFeesCopyFunction = async (context) => {
  try {
    const result = await feesCopyService.tuitionFeesCopy(context);

    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *functional fees copy
 */
const functionalFeesCopyFunction = async (context) => {
  try {
    const result = await feesCopyService.functionalFeesCopy(context);

    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};
/**
 *tuition fees copy
 */
const otherFeesCopyFunction = async (context) => {
  try {
    const result = await feesCopyService.otherFeesCopy(context);

    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};
/**
 *tuition fees copy
 */
const waiverFeesCopyFunction = async (context) => {
  try {
    const result = await feesCopyService.waiverFeesCopy(context);

    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};

const requestFeesCopy = async function (data) {
  try {
    const response = {};

    const fromContext = {
      academic_year_id: data.from_academic_year_id,
      intake_id: data.from_intake_id,
      campus_id: data.from_campus_id,
    };

    const toContext = {
      academic_year_id: data.to_academic_year_id,
      intake_id: data.to_intake_id,
      campus_id: data.to_campus_id,
    };

    const checkTuition = data.fees_types.includes('TUITION FEES');
    const checkFunctional = data.fees_types.includes('FUNCTIONAL FEES');
    const checkOtherFees = data.fees_types.includes('OTHER FEES');
    const checkFeesWaivers = data.fees_types.includes('FEES WAIVERS');

    if (
      fromContext.academic_year_id === toContext.academic_year_id &&
      fromContext.intake_id === toContext.intake_id &&
      fromContext.campus_id === toContext.campus_id
    ) {
      throw new Error(`You Cannot Copy A Context To Itself.`);
    }

    if (checkTuition === true) {
      const tuitionFees = await tuitionFeesCopyFunction(fromContext);

      if (isEmpty(tuitionFees)) {
        throw new Error(
          `The Tuition Fees Context You Are Trying To Copy From Does not Have Any Matching Records.`
        );
      }

      response.tuitionFees = tuitionFees;
    }

    if (checkFunctional === true) {
      const functionalFees = await functionalFeesCopyFunction(fromContext);

      if (isEmpty(functionalFees)) {
        throw new Error(
          `The Functional Fees Context You Are Trying To Copy From Does not Have Any Matching Records.`
        );
      }

      response.functionalFees = functionalFees;
    }

    if (checkOtherFees === true) {
      const otherFees = await otherFeesCopyFunction(fromContext);

      if (isEmpty(otherFees)) {
        throw new Error(
          `The Other Fees Context You Are Trying To Copy From Does not Have Any Matching Records.`
        );
      }

      response.otherFees = otherFees;
    }

    if (checkFeesWaivers === true) {
      const waiverFees = await waiverFeesCopyFunction(fromContext);

      if (isEmpty(waiverFees)) {
        throw new Error(
          `The Fees Waiver Context You Are Trying To Copy From Does not Have Any Matching Records.`
        );
      }

      response.waiverFees = waiverFees;
    }

    response.checkTuition = checkTuition;
    response.checkFunctional = checkFunctional;
    response.checkOtherFees = checkOtherFees;
    response.checkFeesWaivers = checkFeesWaivers;

    return response;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = FeesCopyController;
