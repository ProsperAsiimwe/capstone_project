const { HttpResponse } = require('@helpers');
const {
  functionalFeesAmountService,
  metadataValueService,
  feesElementService,
} = require('@services/index');
const { isEmpty, toUpper } = require('lodash');
const model = require('@models');
const moment = require('moment');
const XLSX = require('xlsx');
const formidable = require('formidable');
const {
  generateAllArrayCombinationsForFunctional,
} = require('./feesUploadTemplateHelper');
const { getMetadataValueId } = require('@controllers/Helpers/programmeHelper');
const {
  validateSheetColumns,
} = require('@controllers/Helpers/uploadValidator');

const http = new HttpResponse();

class FunctionalFeesAmountController {
  /**
   * GET All FunctionalFeesAmounts.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async index(req, res) {
    try {
      const functionalFeesAmounts =
        await functionalFeesAmountService.findAllFunctionalFeesAmounts({
          include: ['functionalFeesAmountFeesElements'],
        });

      http.setSuccess(200, 'Functional Fees Amounts Fetched Successfully', {
        functionalFeesAmounts,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to fetch Functional Fees Amounts', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * find functional fees by a context
   * @param {find functional fees by context} req
   * @param {*} res
   */
  async findFunctionalFeesByContext(req, res) {
    try {
      const context = req.body;
      const functionalFeesAmounts =
        await functionalFeesAmountService.findFunctionFeesByContext(context);

      http.setSuccess(200, 'Functional Fees Amounts Fetched Successfully', {
        functionalFeesAmounts,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Functional Fees Amounts', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * CREATE New FunctionalFeesAmount Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */

  async bulkCreateAmounts(req, res) {
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

      const amountProgrammeTypes = [];

      if (!isEmpty(data.programme_types)) {
        data.programme_types.forEach((programmeType) => {
          amountProgrammeTypes.push({
            programme_type_id: programmeType,
          });
        });
      }

      const elements = [];

      if (!isEmpty(data.functionalFeesAmountFeesElements)) {
        data.functionalFeesAmountFeesElements.forEach((element) => {
          elements.push({
            ...element,
            created_by_id: user,
            elementName: 'ELEMENT',
            studyLevelName: 'PROGRAMME STUDY LEVEL',
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
      data.programme_types = amountProgrammeTypes;
      data.functionalFeesAmountFeesElements = elements;

      const result = [];

      const amount = await model.sequelize.transaction(async (transaction) => {
        const combinations = await generateAllArrayCombinationsForFunctional(
          data
        );

        for (const comb of combinations) {
          comb.academicYearName = 'ACADEMIC YEAR';
          comb.intakeName = 'INTAKE';
          comb.billingCategoryName = 'BILLING CATEGORY';
          comb.campusName = 'CAMPUS';

          const upload = await insertNewFunctionalAmountFeesElement(
            comb,
            transaction
          );

          result.push(upload);
        }

        return result;
      });

      http.setSuccess(
        200,
        'Functional Fees Context Created And Amounts Submitted For Approval.',
        {
          data: amount,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable To Create Functional Fees Context and Submit Amounts For Approval.',
        {
          error: { message: error.message },
        }
      );

      return http.send(res);
    }
  }
  // create unique functional fees

  async createUniqueFeesAmounts(req, res) {
    try {
      const data = req.body;
      const user = req.user.id;

      let result = [];

      for (const eachObject of data.requests) {
        const dataContext = {
          ...eachObject,
          created_at: moment.now(),
          created_by_id: user,
        };

        const updateData =
          await functionalFeesAmountService.createUniqFunctionalFeesAmount(
            dataContext
          );

        result.push(updateData);
      }

      http.setSuccess(
        200,
        'Functional Fees Context Created And Amounts Submitted For Approval.',
        {
          data: result,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable To Create Functional Fees Context and Submit Amounts For Approval.',
        {
          error: { message: error.message },
        }
      );

      return http.send(res);
    }
  }

  // fetchUniqFunctionalFeesAmount

  async fetchUniqFunctionalFeesAmount(req, res) {
    try {
      const data = req.body;

      if (
        !data.campus_id ||
        !data.intake_id ||
        !data.semester_id ||
        !data.academic_year_id
      ) {
        throw new Error(`Invalid data request`);
      }

      const filtered =
        await functionalFeesAmountService.fetchUniqFunctionalFeesAmount(data);

      http.setSuccess(200, 'Functional Fees Submitted For Approval.', {
        data: filtered,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Create Functional Fees.', {
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
  uploadFunctionalAmountFeesElements(req, res) {
    try {
      const user = req.user.id;

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

        const findFunctionalFeesCategoryId = getMetadataValueId(
          metadataValues,
          'FUNCTIONAL FEES',
          'FEES CATEGORIES'
        );

        const feesElements = await feesElementService.findAllFeesElements({
          where: {
            fees_category_id: findFunctionalFeesCategoryId,
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
            `Cannot find ${value} in the list of fees elements of functional fees category.`
          );
        };

        const getAcademicYears = (value, studyLevel) => {
          const amountAcademicYears = [];

          const academicYearMetadataValueId = getMetadataValueId(
            metadataValues,
            value.trim(),
            'ACADEMIC YEARS',
            studyLevel
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

        const getBillingCategories = (value, studyLevel) => {
          const amountBillingCategories = [];

          amountBillingCategories.push({
            billing_category_id: parseInt(
              getMetadataValueId(
                metadataValues,
                value.trim(),
                'BILLING CATEGORIES',
                studyLevel
              ),
              10
            ),
          });

          return amountBillingCategories;
        };

        const getProgrammeStudyTypes = (value, studyLevel) => {
          const splittedText = !isEmpty(value) ? value.split(',') : [];
          const arrayOfProgrammeTypes = [];

          splittedText.forEach((text) =>
            arrayOfProgrammeTypes.push(
              getMetadataValueId(
                metadataValues,
                text.trim(),
                'PROGRAMME STUDY TYPES',
                studyLevel
              )
            )
          );

          const amountProgrammeTypes = [];

          arrayOfProgrammeTypes.forEach((programmeType) => {
            amountProgrammeTypes.push({
              programme_type_id: parseInt(programmeType, 10),
            });
          });

          return amountProgrammeTypes;
        };

        try {
          const result = [];

          // Loop through Each Record
          await model.sequelize.transaction(async (transaction) => {
            for (const context of userInputs) {
              const amountElements = [];

              if (!context['PROGRAMME STUDY LEVEL']) {
                throw new Error(
                  `One Of The Records Provided Has No STUDY LEVEL.`
                );
              }
              const programmeStudyLevelId = getMetadataValueId(
                metadataValues,
                context['PROGRAMME STUDY LEVEL'],
                'PROGRAMME STUDY LEVELS',
                context['PROGRAMME STUDY LEVEL']
              );

              validateSheetColumns(
                context,
                [
                  'ACADEMIC YEARS',
                  'CAMPUSES',
                  'INTAKES',
                  'BILLING CATEGORIES',
                  'STUDY TYPES',
                  'FUNCTIONAL FEES ELEMENT',
                  'PAYMENT CYCLE',
                  'AMOUNT',
                  'CURRENCY',
                ],
                context['PROGRAMME STUDY LEVEL']
              );

              const academicYears = getAcademicYears(
                context['ACADEMIC YEARS'],
                context['PROGRAMME STUDY LEVEL']
              );
              const campuses = getCampuses(
                context.CAMPUSES,
                context['PROGRAMME STUDY LEVEL']
              );
              const intakes = getIntakes(
                context.INTAKES,
                context['PROGRAMME STUDY LEVEL']
              );
              const billingCategories = getBillingCategories(
                context['BILLING CATEGORIES'],
                context['PROGRAMME STUDY LEVEL']
              );
              const programmeTypes = getProgrammeStudyTypes(
                context['STUDY TYPES'],
                context['PROGRAMME STUDY LEVEL']
              );
              const functionalFeesElement = context['FUNCTIONAL FEES ELEMENT'];
              const paymentCycle = getMetadataValueId(
                metadataValues,
                context['PAYMENT CYCLE'],
                'FUNCTIONAL FEES PAYMENT INTERVALS',
                functionalFeesElement
              );

              const amount = parseFloat(
                context.AMOUNT.toString().replace(/,/g, '')
              );
              const currency = getMetadataValueId(
                metadataValues,
                context.CURRENCY,
                'CURRENCIES',
                functionalFeesElement
              );

              amountElements.push({
                fees_element_id: getFeesElement(functionalFeesElement),
                paid_when_id: paymentCycle,
                amount: amount,
                currency_id: currency,
                created_by_id: user,
                elementName: functionalFeesElement,
                studyLevelName: context['PROGRAMME STUDY LEVEL'],
                approvals: {
                  created_by_id: user,
                },
              });

              const payload = {};

              payload.programme_study_level_id = programmeStudyLevelId;
              payload.programme_types = programmeTypes;
              payload.academic_years = academicYears;
              payload.intakes = intakes;
              payload.billing_categories = billingCategories;
              payload.campuses = campuses;
              payload.created_by_id = user;
              payload.functionalFeesAmountFeesElements = amountElements;

              const combinations =
                await generateAllArrayCombinationsForFunctional(payload);

              for (const comb of combinations) {
                comb.academicYearName = context['ACADEMIC YEARS'];
                comb.intakeName = context.INTAKES;
                comb.billingCategoryName = context['BILLING CATEGORIES'];
                comb.campusName = context.CAMPUSES;

                const upload = await insertNewFunctionalAmountFeesElement(
                  comb,
                  transaction
                );

                result.push(upload);
              }
            }
          });

          http.setSuccess(
            200,
            'Functional Fees Context Created And Amounts Submitted For Approval.'
          );

          return http.send(res);
        } catch (error) {
          http.setError(
            400,
            'Unable To Create Functional Fees Context and Submit Amounts For Approval.',
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
        'Unable To Create Functional Fees Context and Submit Amounts For Approval.',
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
              await functionalFeesAmountService.findOneRequestForApproval({
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
              await functionalFeesAmountService.updateRequestForApproval(
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

            await functionalFeesAmountService.updateFunctionalFeesAmountFeesElement(
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
  async addFunctionalAmountFeesElement(req, res) {
    try {
      const { functionalFeesAmountId } = req.params;
      const user = req.user.id;

      const data = req.body;

      const elements = [];

      if (!isEmpty(data.functionalFeesAmountFeesElements)) {
        data.functionalFeesAmountFeesElements.forEach((element) => {
          elements.push({
            ...element,
            functional_fees_amount_id: functionalFeesAmountId,
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
            await functionalFeesAmountService.createFunctionalFeesAmountFeesElement(
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
        'Functional Fees Amount Elements Added And Submitted For Approval Successfully.',
        {
          data: finalResult,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable To Add Functional Fees Amount Elements And Submit For Approval.',
        {
          error: { message: error.message },
        }
      );

      return http.send(res);
    }
  }

  /**
   * UPDATE Specific FunctionalFeesAmount Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async updateFunctionalFeesAmount(req, res) {
    try {
      const { id } = req.params;
      const updateFunctionalFeesAmount =
        await functionalFeesAmountService.updateFunctionalFeesAmount(
          id,
          req.body
        );
      const functionalFeesAmount = updateFunctionalFeesAmount[1][0];

      http.setSuccess(200, 'Functional Fees Amount Updated Successfully', {
        functionalFeesAmount,
      });
      if (isEmpty(functionalFeesAmount))
        http.setError(404, 'Functional Fees Amount Data Not Found');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Update This Functional Fees Amount', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  async updateFunctionalFeesAmountFeesElement(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      const user = req.user.id;

      data.last_updated_by_id = user;

      const result = await model.sequelize.transaction(async (transaction) => {
        const update =
          await functionalFeesAmountService.updateFunctionalFeesAmountFeesElement(
            id,
            data,
            transaction
          );
        const response = update[1][0];

        const approval =
          await functionalFeesAmountService.findOneRequestForApproval({
            where: {
              amount_fees_element_id: id,
            },
            raw: true,
          });

        if (approval) {
          if (approval.create_approval_status !== 'APPROVED') {
            await functionalFeesAmountService.updateRequestForApproval(
              approval.id,
              {
                created_by_id: user,
                created_at: moment.now(),
              },
              transaction
            );
          }
        } else {
          await functionalFeesAmountService.createAmountFeesElementApproval(
            {
              amount_fees_element_id: id,
              created_by_id: user,
            },
            transaction
          );
        }

        return response;
      });

      http.setSuccess(
        200,
        'Functional Fees Amount Element Updated Successfully',
        {
          result,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable To Update This Functional Fees Amount Element',
        {
          error: { message: error.message },
        }
      );

      return http.send(res);
    }
  }

  /**
   * Get Specific FunctionalFeesAmount Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async fetchFunctionalFeesAmount(req, res) {
    const { id } = req.params;
    const functionalFeesAmount =
      await functionalFeesAmountService.findOneFunctionalFeesAmount({
        where: { id },
      });

    http.setSuccess(200, 'Functional Fees Amount Fetch Successful', {
      functionalFeesAmount,
    });
    if (isEmpty(functionalFeesAmount))
      http.setError(404, 'Functional Fees Amount Data Not Found');

    return http.send(res);
  }

  /**
   * Destroy FunctionalFeesAmount Data
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async deleteFunctionalFeesAmount(req, res) {
    try {
      const { id } = req.params;

      await functionalFeesAmountService.deleteFunctionalFeesAmount(id);
      http.setSuccess(200, 'Functional Fees Amount Deleted Successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Delete This Functional Fees Amount', {
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
  async deleteFunctionalFeesAmountFeesElement(req, res) {
    try {
      const { id } = req.params;

      const approval =
        await functionalFeesAmountService.findOneRequestForApproval({
          where: {
            amount_fees_element_id: id,
          },
          raw: true,
        });

      if (approval) {
        await functionalFeesAmountService.deleteAmountFeesElementApproval(
          approval.id
        );
      }

      await functionalFeesAmountService.deleteFunctionalFeesAmountFeesElement(
        id
      );
      http.setSuccess(
        200,
        'Functional Fees Amount Element Deleted Successfully'
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable To Delete This Functional Fees Amount Element',
        {
          error: { message: error.message },
        }
      );

      return http.send(res);
    }
  }

  /**
   * functional fees elements by view
   * @param {other} req
   * @param {*} res
   */
  async findFunctionalFeesElementsByView(req, res) {
    try {
      const functionalFeesElements =
        await functionalFeesAmountService.fetchFunctionalFeesElementsByView();

      http.setSuccess(200, 'Functional Fees Elements Fetched Successfully', {
        functionalFeesElements,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Functional Fees Elements', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  //  approve custom / uniq fees  billing

  async approveUniqFunctionalFees(req, res) {
    try {
      const data = req.body;

      const user = req.user.id;

      if (!data.requests) {
        throw new Error(`Invalid Request`);
      }

      data.create_approved_by_id = user;
      data.create_approval_date = moment.now();
      data.create_approval_status = 'APPROVED';

      const approvedData = [];

      await model.sequelize.transaction(async (transaction) => {
        for (const eachObject of data.requests) {
          const uniqFuncFees = await functionalFeesAmountService
            .findOneUniqFees({
              where: {
                id: eachObject,
                create_approval_status: 'PENDING',
              },
              nest: true,
            })
            .then(function (res) {
              if (res) {
                const result = res.toJSON();

                return result;
              }
            });

          // userRoleProgramme

          if (!uniqFuncFees) {
            throw new Error(
              `One of the requests you are trying to Update is not valid.`
            );
          }

          // if (uniqFuncFees.created_by_id === user) {
          //   throw new Error(`You can not approved Fees This Fees,( By You)`);
          // }

          const updateData = {
            create_approved_by_id: data.create_approved_by_id,
            create_approval_status: data.create_approval_status,
            create_approval_date: data.create_approval_date,
          };

          const updateResult = await functionalFeesAmountService.updateUniqFees(
            uniqFuncFees.id,
            {
              lastUpdatedById: user,
              ...updateData,
            },
            transaction
          );

          const result = updateResult[1][0];

          approvedData.push(result);
        }
      });

      http.setSuccess(200, `Fees Approved successfully`, {
        approvedData,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, `Unable To Approve`, {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

const insertNewFunctionalAmountFeesElement = async function (
  data,
  transaction
) {
  try {
    const result = await functionalFeesAmountService.createFunctionalFeesAmount(
      data,
      transaction
    );

    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = FunctionalFeesAmountController;
