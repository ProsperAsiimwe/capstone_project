const { HttpResponse } = require('@helpers');
const {
  feesWaiverDiscountService,
  feesElementService,
  metadataValueService,
  academicYearService,
  feesWaiverService,
} = require('@services/index');
const { isEmpty, toUpper } = require('lodash');
const model = require('@models');
const moment = require('moment');
const XLSX = require('xlsx');
const formidable = require('formidable');
const {
  getMetadataValueId,
  getMetadataValueName,
} = require('@controllers/Helpers/programmeHelper');

const {
  generateAllArrayCombinationsForFeesWaiverDiscountElements,
} = require('./feesUploadTemplateHelper');

const http = new HttpResponse();

class FeesWaiverDiscountController {
  /**
   * GET All FeesWaiverDiscounts.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async index(req, res) {
    try {
      const feesWaiverDiscounts =
        await feesWaiverDiscountService.findAllFeesWaiverDiscounts({
          include: [
            {
              association: 'feesWaiver',
              attributes: ['id', 'fees_waiver_code', 'fees_waiver_name'],
            },
            {
              association: 'campus',
              attributes: ['id', 'metadata_value'],
            },
            {
              association: 'intake',
              attributes: ['id', 'metadata_value'],
            },
            {
              association: 'discountedElements',
              attributes: [
                'id',
                'fees_waiver_discount_id',
                'fees_element_id',
                'percentage_discount',
              ],
            },
          ],
        });

      http.setSuccess(200, 'Fees Waiver Discounts Fetched Successfully', {
        feesWaiverDiscounts,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Fees Waiver Discounts', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * CREATE New FeesWaiverDiscount Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async createFeesWaiverDiscount(req, res) {
    try {
      const data = req.body;
      const user = req.user.id;

      data.created_by_id = user;

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

      const discElements = [];

      if (!isEmpty(data.discountedElements)) {
        data.discountedElements.forEach((element) => {
          discElements.push({
            ...element,
            created_by_id: user,
            approvals: {
              created_by_id: user,
            },
          });
        });
      }

      data.academic_years = amountAcademicYears;
      data.campuses = amountCampuses;
      data.intakes = amountIntakes;
      data.discountedElements = discElements;

      const result = [];

      const metadataValues = await metadataValueService.findAllMetadataValues({
        include: {
          association: 'metadata',
          attributes: ['id', 'metadata_name'],
        },
        attributes: ['id', 'metadata_value'],
      });

      const discount = await model.sequelize.transaction(
        async (transaction) => {
          const combinations =
            await generateAllArrayCombinationsForFeesWaiverDiscountElements(
              data
            );

          for (const comb of combinations) {
            comb.academicYearName = getMetadataValueName(
              metadataValues,
              comb.academic_year_id,
              'ACADEMIC YEARS'
            );
            comb.intakeName = getMetadataValueName(
              metadataValues,
              comb.intake_id,
              'INTAKES'
            );
            comb.campusName = getMetadataValueName(
              metadataValues,
              comb.campus_id,
              'CAMPUSES'
            );

            const upload = await insertNewFeesWaiverDiscountFeesElement(
              comb,
              transaction
            );

            result.push(upload);
          }

          return result;
        }
      );

      http.setSuccess(200, 'Fees Waiver Discounts Submitted For Approval.', {
        data: discount,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Submit Fees Waiver Discount For Approval', {
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
  uploadFeesWaiverDiscountFeesElements(req, res) {
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

        const rows = XLSX.utils.sheet_to_json(workbook.Sheets[myTemplate]);

        const userInputs = rows.filter(
          (templateHeaders) => !isEmpty(templateHeaders['FEES ELEMENT'])
        );

        if (isEmpty(userInputs)) {
          http.setError(
            400,
            'Unable to upload this Document, You are missing some required fields in the template.'
          );

          return http.send(res);
        }

        const feesElements = await feesElementService.findAllFeesElements({
          attributes: ['id', 'fees_element_name'],
          raw: true,
        });

        const metadataValues = await metadataValueService.findAllMetadataValues(
          {
            include: ['metadata'],
          }
        );

        const academicYears = await academicYearService.findAllAcademicYears({
          attributes: ['id', 'academic_year_id'],
          raw: true,
        });

        const feesWaivers = await feesWaiverService.findAllFeesWaivers({
          attributes: ['id', 'fees_waiver_name'],
          raw: true,
        });

        const getFeesWaivers = (value) => {
          const checkValue = feesWaivers.find(
            (waiver) => toUpper(waiver.fees_waiver_name) === toUpper(value)
          );

          if (checkValue) {
            return parseInt(checkValue.id, 10);
          } else {
            throw new Error(
              `Cannot find ${value} in the list of fees waivers.`
            );
          }
        };

        const getAcademicYears = (value, waiver) => {
          const academicYearMetadataValueId = getMetadataValueId(
            metadataValues,
            value.trim(),
            'ACADEMIC YEARS',
            waiver
          );

          const amountAcademicYears = [];

          const checkValue = academicYears.find(
            (year) =>
              parseInt(year.academic_year_id, 10) ===
              parseInt(academicYearMetadataValueId, 10)
          );

          if (checkValue) {
            amountAcademicYears.push({
              academic_year_id: parseInt(checkValue.id, 10),
            });
          } else {
            throw new Error(
              `Cannot find ${value} in the list of Academic Years On Record With Fees Waiver ${waiver}.`
            );
          }

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

        const getIntakes = (value, waiver) => {
          const splittedText = !isEmpty(value) ? value.split(',') : [];
          const arrayOfIntakes = [];

          splittedText.forEach((text) =>
            arrayOfIntakes.push(
              getMetadataValueId(metadataValues, text.trim(), 'INTAKES', waiver)
            )
          );

          const amountIntakes = [];

          arrayOfIntakes.forEach((intake) => {
            amountIntakes.push({
              intake_id: parseInt(intake, 10),
            });
          });

          return amountIntakes;
        };

        const getFeesElement = (value) => {
          const checkValue = feesElements.find(
            (element) => toUpper(element.fees_element_name) === toUpper(value)
          );

          if (checkValue) return parseInt(checkValue.id, 10);
          throw new Error(`Cannot find ${value} in the list of fees elements.`);
        };

        try {
          const result = [];

          // Loop through Each Record
          await model.sequelize.transaction(async (transaction) => {
            for (const context of userInputs) {
              const amountElements = [];

              if (!context['FEES WAIVER']) {
                throw new Error(
                  `One Of The Records Provided Has No FEES WAIVER.`
                );
              }

              const feesWaiverId = getFeesWaivers(context['FEES WAIVER']);

              if (!context['ACADEMIC YEARS']) {
                throw new Error(
                  `Academic Years For ${context['FEES WAIVER']} Are Required.`
                );
              }
              const academicYears = getAcademicYears(
                context['ACADEMIC YEARS'],
                context['FEES WAIVER']
              );

              if (!context.CAMPUSES) {
                throw new Error(
                  `Campuses For ${context['FEES WAIVER']} Are Required`
                );
              }
              const campuses = getCampuses(
                context.CAMPUSES,
                context['FEES WAIVER']
              );

              if (!context.INTAKES) {
                throw new Error(
                  `Intakes For ${context['FEES WAIVER']} Are Required`
                );
              }
              const intakes = getIntakes(
                context.INTAKES,
                context['FEES WAIVER']
              );

              if (!context['FEES ELEMENT']) {
                throw new Error(
                  `Fees Element For ${context['FEES WAIVER']} Is Required.`
                );
              }
              const feesElement = context['FEES ELEMENT'];

              if (!context['PERCENTAGE DISCOUNT']) {
                throw new Error(
                  `Percentage Discount For Fees Element ${feesElement} Of Waiver ${context['FEES WAIVER']} Is Required.`
                );
              }
              const discount = context['PERCENTAGE DISCOUNT'];

              amountElements.push({
                fees_element_id: getFeesElement(feesElement),
                percentage_discount: discount,
                created_by_id: user,
                approvals: {
                  created_by_id: user,
                },
              });

              const payload = {};

              payload.fees_waiver_id = feesWaiverId;
              payload.academic_years = academicYears;
              payload.campuses = campuses;
              payload.intakes = intakes;
              payload.created_by_id = user;
              payload.discountedElements = amountElements;

              const combinations =
                await generateAllArrayCombinationsForFeesWaiverDiscountElements(
                  payload
                );

              for (const comb of combinations) {
                comb.academicYearName = context['ACADEMIC YEARS'];
                comb.intakeName = getMetadataValueName(
                  metadataValues,
                  comb.intake_id,
                  'INTAKES'
                );
                comb.campusName = context.CAMPUSES;

                const upload = await insertNewFeesWaiverDiscountFeesElement(
                  comb,
                  transaction
                );

                result.push(upload);
              }
            }
          });

          http.setSuccess(
            200,
            'Fees Waiver Discounts Submitted For Approval.',
            {
              data: result,
            }
          );

          return http.send(res);
        } catch (error) {
          http.setError(
            400,
            'Unable To Submit Fees Waiver Discount For Approval',
            {
              error: { message: error.message },
            }
          );

          return http.send(res);
        }
      });
    } catch (error) {
      http.setError(400, 'Unable To Submit Fees Waiver Discount For Approval', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * approveFeesWaiverDiscountFeesAmount
   * @param {*} req
   * @param {*} res
   */
  async approveFeesWaiverDiscountFeesAmount(req, res) {
    try {
      const data = req.body;
      const user = req.user.id;

      const finalResult = [];

      if (!isEmpty(data.requests)) {
        await model.sequelize.transaction(async (transaction) => {
          for (const eachRequestId of data.requests) {
            const request =
              await feesWaiverDiscountService.findOneRequestForApproval({
                where: { id: eachRequestId, create_approval_status: 'PENDING' },
                attributes: [
                  'discount_fees_element_id',
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
              await feesWaiverDiscountService.updateRequestForApproval(
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

            await feesWaiverDiscountService.updateDiscountedFeesElement(
              request.discount_fees_element_id,
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
  async addDiscountedElement(req, res) {
    try {
      const { feesWaiverId } = req.params;
      const user = req.user.id;

      const data = req.body;

      const discElements = [];

      if (!isEmpty(data.discountedElements)) {
        data.discountedElements.forEach((element) => {
          discElements.push({
            ...element,
            fees_waiver_discount_id: feesWaiverId,
            created_by_id: user,
            approvals: {
              created_by_id: user,
            },
          });
        });
      }
      const finalResult = [];

      await model.sequelize.transaction(async (transaction) => {
        for (const eachObject of discElements) {
          const response =
            await feesWaiverDiscountService.createDiscountFeesElement(
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
        'Discounted Elements Added And Submitted For Approval Successfully.',
        {
          data: finalResult,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable To Add Discounted Elements And Submit For Approval.',
        {
          error: { message: error.message },
        }
      );

      return http.send(res);
    }
  }

  /**
   * UPDATE Specific FeesWaiverDiscount Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async updateFeesWaiverDiscount(req, res) {
    try {
      const { id } = req.params;
      const updateFeesWaiverDiscount =
        await feesWaiverDiscountService.updateFeesWaiverDiscount(id, req.body);
      const feesWaiverDiscount = updateFeesWaiverDiscount[1][0];

      http.setSuccess(200, 'Fees Waiver Discount Updated Successfully', {
        feesWaiverDiscount,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Update This Fees Waiver Discount', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Get Specific FeesWaiverDiscount Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async fetchFeesWaiverDiscount(req, res) {
    const { id } = req.params;
    const feesWaiverDiscount =
      await feesWaiverDiscountService.findOneFeesWaiverDiscount({
        where: { id },
      });

    http.setSuccess(200, 'Fees Waiver Discount Fetch Successful', {
      feesWaiverDiscount,
    });
    if (isEmpty(feesWaiverDiscount))
      http.setError(404, 'Fees Waiver Discount Data Not Found');

    return http.send(res);
  }

  /**
   * Filter FeesWaiverDiscount Data.
   *
   * @param {*} req Request query
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async filterFeesWaiverDiscounts(req, res) {
    try {
      const data = req.query;
      const waiverDiscounts =
        await feesWaiverDiscountService.filterFeesWaiverDiscountRecords(data);

      http.setSuccess(200, 'Fees Waiver Discounts Fetched Successfully', {
        waiverDiscounts,
      });
    } catch (error) {
      http.setError(400, 'Cannot filter Fees Waiver Discounts', {
        error: { message: error.message },
      });
    }

    return http.send(res);
  }

  /**
   * Update FeesWaiverDiscountFeesElement Data
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async updateDiscountedFeesElement(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      const user = req.user.id;

      data.created_by_id = user;
      data.create_approval_status = 'PENDING';
      data.create_approved_by_id = null;

      const result = await model.sequelize.transaction(async (transaction) => {
        const update =
          await feesWaiverDiscountService.updateDiscountedFeesElement(
            id,
            data,
            transaction
          );
        const response = update[1][0];

        const approval =
          await feesWaiverDiscountService.findOneRequestForApproval({
            where: {
              discount_fees_element_id: id,
            },
            raw: true,
          });

        if (approval) {
          await feesWaiverDiscountService.updateRequestForApproval(
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
          await feesWaiverDiscountService.createAmountFeesElementApproval(
            {
              discount_fees_element_id: id,
              created_by_id: user,
            },
            transaction
          );
        }

        return response;
      });

      http.setSuccess(200, 'Discounted Fees Element Updated Successfully', {
        result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Update This Discounted Fees Element', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Destroy FeesWaiverDiscount Data
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async deleteFeesWaiverDiscount(req, res) {
    try {
      const { id } = req.params;

      await feesWaiverDiscountService.deleteFeesWaiverDiscount(id);
      http.setSuccess(200, 'Fees Waiver Discount Deleted Successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Delete This Fees Waiver Discount', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Destroy FeesWaiverDiscountFeesElement Data
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async deleteDiscountedFeesElement(req, res) {
    try {
      const { id } = req.params;

      const approval =
        await feesWaiverDiscountService.findOneRequestForApproval({
          where: {
            discount_fees_element_id: id,
          },
          raw: true,
        });

      if (approval) {
        await feesWaiverDiscountService.deleteAmountFeesElementApproval(
          approval.id
        );
      }

      await feesWaiverDiscountService.deleteDiscountedFeesElement(id);
      http.setSuccess(200, 'Discounted Fees Element Deleted Successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Delete This Discounted Fees Element', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

const insertNewFeesWaiverDiscountFeesElement = async function (
  data,
  transaction
) {
  try {
    const result = await feesWaiverDiscountService.createFeesWaiverDiscount(
      data,
      transaction
    );

    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = FeesWaiverDiscountController;
