const { HttpResponse } = require('@helpers');
const {
  otherFeesAmountService,
  metadataValueService,
  feesElementService,
} = require('@services/index');
const { isEmpty, toUpper } = require('lodash');
const model = require('@models');
const moment = require('moment');
const XLSX = require('xlsx');
const formidable = require('formidable');

const {
  generateAllArrayCombinationsForOtherFees,
} = require('./feesUploadTemplateHelper');
const { getMetadataValueId } = require('@controllers/Helpers/programmeHelper');
const {
  validateSheetColumns,
} = require('@controllers/Helpers/uploadValidator');

const http = new HttpResponse();

class OtherFeesAmountController {
  /**
   * GET All OtherFeesAmounts.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async index(req, res) {
    try {
      const otherFeesAmounts =
        await otherFeesAmountService.findAllOtherFeesAmounts({
          include: ['otherFeesAmountFeesElements'],
        });

      http.setSuccess(200, 'Other Fees Amounts Fetched Successfully', {
        otherFeesAmounts,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Other Fees Amounts', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * CREATE New OtherFeesAmount Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async createOtherFeesAmount(req, res) {
    try {
      const data = req.body;
      const user = req.user.id;

      const amountAcademicYears = [];

      if (!isEmpty(data.academic_years)) {
        data.academic_years.forEach((academicYear) => {
          amountAcademicYears.push({
            academic_year_id: academicYear,
          });
        });
      }

      const amountCampuses = [];

      if (!isEmpty(data.campuses)) {
        data.campuses.forEach((campus) => {
          amountCampuses.push({
            campus_id: campus,
          });
        });
      }

      const amountIntakes = [];

      if (!isEmpty(data.intakes)) {
        data.intakes.forEach((intake) => {
          amountIntakes.push({
            intake_id: intake,
          });
        });
      }

      const amountBillingCategories = [];

      if (!isEmpty(data.billing_categories)) {
        data.billing_categories.forEach((billingCategory) => {
          amountBillingCategories.push({
            billing_category_id: billingCategory,
          });
        });
      }

      const elements = [];

      if (!isEmpty(data.otherFeesAmountFeesElements)) {
        data.otherFeesAmountFeesElements.forEach((element) => {
          elements.push({
            ...element,
            created_by_id: user,
            elementName: 'ELEMENT',
            academicYearName: 'ACADEMIC YEAR',
            approvals: {
              created_by_id: user,
            },
          });
        });
      }

      data.academic_years = amountAcademicYears;
      data.campuses = amountCampuses;
      data.intakes = amountIntakes;
      data.billing_categories = amountBillingCategories;
      data.otherFeesAmountFeesElements = elements;

      const result = [];

      const amount = await model.sequelize.transaction(async (transaction) => {
        const combinations = await generateAllArrayCombinationsForOtherFees(
          data
        );

        for (const comb of combinations) {
          comb.intakeName = 'INTAKE';
          comb.campusName = 'CAMPUS';

          const upload = await insertNewOtherFeesAmountFeesElement(
            comb,
            transaction
          );

          result.push(upload);
        }

        return result;
      });

      http.setSuccess(
        200,
        'Other Fees Context Created And Amounts Submitted For Approval.',
        {
          data: amount,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable To Create Other Fees Context and Submit Amounts For Approval.',
        {
          error: { message: error.message },
        }
      );

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   */
  uploadOtherFeesAmountFeesElements(req, res) {
    try {
      const user = req.user.id;

      // const amountAcademicYears = [];

      // if (!isEmpty(formattedAcademicYears)) {
      //   formattedAcademicYears.forEach((academicYear) => {
      //     amountAcademicYears.push({
      //       academic_year_id: academicYear,
      //     });
      //   });
      // }

      // const amountCampuses = [];

      // if (!isEmpty(formattedCampuses)) {
      //   formattedCampuses.forEach((campus) => {
      //     amountCampuses.push({
      //       campus_id: campus,
      //     });
      //   });
      // }

      // const amountIntakes = [];

      // if (!isEmpty(formattedIntakes)) {
      //   formattedIntakes.forEach((intake) => {
      //     amountIntakes.push({
      //       intake_id: intake,
      //     });
      //   });
      // }

      // const amountBillingCategories = [];

      // if (!isEmpty(formattedBillingCategories)) {
      //   formattedBillingCategories.forEach((billingCategory) => {
      //     amountBillingCategories.push({
      //       billing_category_id: billingCategory,
      //     });
      //   });
      // }

      const form = new formidable.IncomingForm();

      form.parse(req, async (err, fields, files) => {
        if (err) {
          http.setError(400, 'Unable To Upload File.', {
            error: { err },
          });

          return http.send(res);
        }

        const file = files[Object.keys(files)[0]];

        if (!file) {
          http.setError(400, 'Please Select A File To Upload.');

          return http.send(res);
        }

        const workbook = XLSX.readFile(file.filepath, { cellDates: true });
        const myTemplate = workbook.SheetNames[0];
        const userInputs = XLSX.utils.sheet_to_json(
          workbook.Sheets[myTemplate]
        );

        if (isEmpty(userInputs)) {
          http.setError(400, 'Cannot upload an Empty template.');

          return http.send(res);
        }

        const metadataValues = await metadataValueService.findAllMetadataValues(
          {
            include: ['metadata'],
          }
        );

        const findOtherFeesCategoryId = getMetadataValueId(
          metadataValues,
          'OTHER FEES',
          'FEES CATEGORIES'
        );

        const feesElements = await feesElementService.findAllFeesElements({
          where: {
            fees_category_id: findOtherFeesCategoryId,
          },
          attributes: ['id', 'fees_element_name'],
          raw: true,
        });

        const getFeesElement = (value) => {
          const checkValue = feesElements.find(
            (element) => toUpper(element.fees_element_name) === toUpper(value)
          );

          if (checkValue) return parseInt(checkValue.id, 10);
          throw new Error(
            `Cannot find ${value} in the list of fees elements of Other fees category.`
          );
        };

        const getAcademicYears = (value, year) => {
          const amountAcademicYears = [];

          const academicYearMetadataValueId = getMetadataValueId(
            metadataValues,
            value.trim(),
            'ACADEMIC YEARS',
            year
          );

          amountAcademicYears.push({
            academic_year_id: parseInt(academicYearMetadataValueId, 10),
          });

          return amountAcademicYears;
        };

        const getCampuses = (value, studyLevel) => {
          const amountCampuses = [];

          amountCampuses.push({
            campus_id: parseInt(
              getMetadataValueId(
                metadataValues,
                value.trim(),
                'CAMPUSES',
                studyLevel
              ),
              10
            ),
          });

          return amountCampuses;
        };

        const getIntakes = (value, studyLevel) => {
          const amountIntakes = [];

          amountIntakes.push({
            intake_id: parseInt(
              getMetadataValueId(
                metadataValues,
                value.trim(),
                'INTAKES',
                studyLevel
              ),
              10
            ),
          });

          return amountIntakes;
        };

        const getBillingCategories = (value, programme) => {
          const splittedText = !isEmpty(value) ? value.split(',') : [];
          const arrayOfBillingCategories = [];

          splittedText.forEach((text) =>
            arrayOfBillingCategories.push(
              getMetadataValueId(
                metadataValues,
                text.trim(),
                'BILLING CATEGORIES',
                programme
              )
            )
          );

          const amountBillingCategories = [];

          arrayOfBillingCategories.forEach((billingCategory) => {
            amountBillingCategories.push({
              billing_category_id: parseInt(billingCategory, 10),
            });
          });

          return amountBillingCategories;
        };

        try {
          const result = [];

          // Loop through Each Record
          await model.sequelize.transaction(async (transaction) => {
            for (const context of userInputs) {
              const amountElements = [];

              if (!context['ACADEMIC YEARS']) {
                throw new Error(
                  `One Of The Records Provided Has No ACADEMIC YEAR.`
                );
              }
              const academicYears = getAcademicYears(
                context['ACADEMIC YEARS'],
                context['ACADEMIC YEARS']
              );

              validateSheetColumns(
                context,
                [
                  'CAMPUSES',
                  'INTAKES',
                  'BILLING CATEGORIES',
                  'OTHER FEES ELEMENT',
                  'AMOUNT',
                  'CURRENCY',
                ],
                context['ACADEMIC YEARS']
              );

              const campuses = getCampuses(
                context.CAMPUSES,
                context['ACADEMIC YEARS']
              );
              const intakes = getIntakes(
                context.INTAKES,
                context['ACADEMIC YEARS']
              );
              const billingCategories = getBillingCategories(
                context['BILLING CATEGORIES'],
                context['ACADEMIC YEARS']
              );
              const otherFeesElement = context['OTHER FEES ELEMENT'];
              const amount = parseFloat(
                context.AMOUNT.toString().replace(/,/g, '')
              );
              const currency = getMetadataValueId(
                metadataValues,
                context.CURRENCY,
                'CURRENCIES',
                otherFeesElement
              );

              amountElements.push({
                fees_element_id: getFeesElement(otherFeesElement),
                amount: amount,
                currency_id: currency,
                created_by_id: user,
                elementName: otherFeesElement,
                academicYearName: context['ACADEMIC YEARS'],
                approvals: {
                  created_by_id: user,
                },
              });

              const payload = {};

              payload.academic_years = academicYears;
              payload.campuses = campuses;
              payload.intakes = intakes;
              payload.billing_categories = billingCategories;
              payload.created_by_id = user;
              payload.otherFeesAmountFeesElements = amountElements;

              const combinations =
                await generateAllArrayCombinationsForOtherFees(payload);

              for (const comb of combinations) {
                comb.intakeName = context.INTAKES;
                comb.campusName = context.CAMPUSES;

                const upload = await insertNewOtherFeesAmountFeesElement(
                  comb,
                  transaction
                );

                result.push(upload);
              }
            }
          });

          http.setSuccess(
            200,
            'Other Fees Context Created And Amounts Submitted For Approval.',
            {
              data: result,
            }
          );

          return http.send(res);
        } catch (error) {
          http.setError(
            400,
            'Unable To Create Other Fees Context and Submit Amounts For Approval.',
            {
              error: { message: error.message },
            }
          );

          return http.send(res);
        }
      });
    } catch (error) {
      http.setError(
        400,
        'Unable To Create Other Fees Context and Submit Amounts For Approval.',
        {
          error: { message: error.message },
        }
      );

      return http.send(res);
    }
  }

  /**
   * approveAmounts
   * @param {*} req
   * @param {*} res
   */
  async approveAmounts(req, res) {
    try {
      const data = req.body;
      const user = req.user.id;

      const finalResult = [];

      if (!isEmpty(data.requests)) {
        await model.sequelize.transaction(async (transaction) => {
          for (const eachRequestId of data.requests) {
            const request =
              await otherFeesAmountService.findOneRequestForApproval({
                where: { id: eachRequestId, create_approval_status: 'PENDING' },
                attributes: [
                  'amount_fees_element_id',
                  'approval_comments',
                  'create_approval_status',
                ],
                raw: true,
              });

            if (isEmpty(request)) {
              throw new Error(
                'One Of The Requests You Are Trying To Approve Is Not Valid Or Has Already Been Approved.'
              );
            }

            const response =
              await otherFeesAmountService.updateRequestForApproval(
                eachRequestId,
                {
                  create_approval_status: 'APPROVED',
                  create_approved_by_id: user,
                  create_approval_date: moment.now(),
                  approval_comments: data.approval_comments
                    ? data.approval_comments
                    : null,
                },
                transaction
              );

            await otherFeesAmountService.updateOtherFeesAmountFeesElement(
              request.amount_fees_element_id,
              {
                create_approval_status: 'APPROVED',
                create_approved_by_id: user,
                create_approval_date: moment.now(),
              },
              transaction
            );

            const update = response[1][0];

            finalResult.push(update);
          }
        });
      }

      http.setSuccess(200, 'Amounts Approved Successfully.', {
        data: finalResult,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Approve Amounts.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   */
  async addOtherFeesAmountFeesElement(req, res) {
    try {
      const { otherFeesAmountId } = req.params;
      const user = req.user.id;

      const data = req.body;

      const elements = [];

      if (!isEmpty(data.otherFeesAmountFeesElements)) {
        data.otherFeesAmountFeesElements.forEach((element) => {
          elements.push({
            ...element,
            other_fees_amount_id: otherFeesAmountId,
            created_by_id: user,
            approvals: {
              created_by_id: user,
            },
          });
        });
      }

      const finalResult = [];

      await model.sequelize.transaction(async (transaction) => {
        for (const eachObject of elements) {
          const response =
            await otherFeesAmountService.createOtherFeesAmountFeesElement(
              eachObject,
              transaction
            );

          if (response[1] === true) {
            finalResult.push(response);
          }
        }
      });

      http.setSuccess(
        200,
        'Other Fees Amount Elements Added And Submitted For Approval Successfully.',
        {
          data: finalResult,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable To Add Other Fees Amount Elements And Submit For Approval.',
        {
          error: { message: error.message },
        }
      );

      return http.send(res);
    }
  }

  /**
   * UPDATE Specific OtherFeesAmount Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async updateOtherFeesAmount(req, res) {
    try {
      const { id } = req.params;
      const updateOtherFeesAmount =
        await otherFeesAmountService.updateOtherFeesAmount(id, req.body);
      const otherFeesAmount = updateOtherFeesAmount[1][0];

      http.setSuccess(200, 'Other Fees Amount Updated Successfully', {
        otherFeesAmount,
      });
      if (isEmpty(otherFeesAmount))
        http.setError(404, 'Other Fees Amount Data Not Found');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Update This Other Fees Amount', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Get Specific OtherFeesAmount Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async fetchOtherFeesAmount(req, res) {
    const { id } = req.params;
    const otherFeesAmount = await otherFeesAmountService.findOneOtherFeesAmount(
      {
        where: { id },
      }
    );

    http.setSuccess(200, 'Other Fees Amount Fetched Successfully', {
      otherFeesAmount,
    });
    if (isEmpty(otherFeesAmount))
      http.setError(404, 'Other Fees Amount Data Not Found');

    return http.send(res);
  }

  /**
   * Filter OtherFeesAmount Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async filterOtherFeesAmounts(req, res) {
    try {
      const data = req.query;

      const otherFeesAmounts =
        await otherFeesAmountService.filterOtherFeesAmountRecords(data);

      http.setSuccess(200, 'Other Fees Amounts Fetched Successfully', {
        otherFeesAmounts,
      });
    } catch (error) {
      http.setError(400, 'Cannot filter other fees', {
        error: { message: error.message },
      });
    }

    return http.send(res);
  }

  /**
   * Destroy OtherFeesAmount Data
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async deleteOtherFeesAmount(req, res) {
    try {
      const { id } = req.params;

      await otherFeesAmountService.deleteOtherFeesAmount(id);
      http.setSuccess(200, 'Other Fees Amount Deleted Successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Delete This Other Fees Amount', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Destroy OtherFeesAmountFeesElement Data
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async deleteOtherFeesAmountFeesElement(req, res) {
    try {
      const { id } = req.params;

      const approval = await otherFeesAmountService.findOneRequestForApproval({
        where: {
          amount_fees_element_id: id,
        },
        raw: true,
      });

      if (approval) {
        await otherFeesAmountService.deleteAmountFeesElementApproval(
          approval.id
        );
      }

      await otherFeesAmountService.deleteOtherFeesAmountFeesElement(id);
      http.setSuccess(
        200,
        'Other Fees Amount Fees Element Deleted Successfully'
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable To Delete This Other Fees Amount Fees Element',
        {
          error: { message: error.message },
        }
      );

      return http.send(res);
    }
  }

  /**
   * Update OtherFeesAmountFeesElement Data
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async updateOtherFeesAmountFeesElement(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      const user = req.user.id;

      data.created_by_id = user;
      data.create_approval_status = 'PENDING';
      data.create_approved_by_id = null;

      const result = await model.sequelize.transaction(async (transaction) => {
        const update =
          await otherFeesAmountService.updateOtherFeesAmountFeesElement(
            id,
            data,
            transaction
          );
        const response = update[1][0];

        const approval = await otherFeesAmountService.findOneRequestForApproval(
          {
            where: {
              amount_fees_element_id: id,
            },
            raw: true,
          }
        );

        if (approval) {
          await otherFeesAmountService.updateRequestForApproval(
            approval.id,
            {
              created_by_id: user,
              create_approval_status: 'PENDING',
              create_approved_by_id: null,
              approval_comments: null,
              created_at: moment.now(),
            },
            transaction
          );
        } else {
          await otherFeesAmountService.createAmountFeesElementApproval(
            {
              amount_fees_element_id: id,
              created_by_id: user,
            },
            transaction
          );
        }

        return response;
      });

      http.setSuccess(200, 'Other Fees Amount Element Updated Successfully', {
        result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Update This Other Fees Amount Element', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * other fees elements by view
   * @param {other} req
   * @param {*} res
   */
  async findOtherFeesElementsByView(req, res) {
    try {
      const otherFeesElements =
        await otherFeesAmountService.fetchOtherFeesElementsByView();

      http.setSuccess(200, 'Other Fees Elements Fetched Successfully', {
        otherFeesElements,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Other Fees Elements', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

const insertNewOtherFeesAmountFeesElement = async function (data, transaction) {
  try {
    const result = await otherFeesAmountService.createOtherFeesAmount(
      data,
      transaction
    );

    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = OtherFeesAmountController;
