const { HttpResponse } = require('@helpers');
const {
  tuitionAmountService,
  metadataValueService,
  feesElementService,
  programmeService,
} = require('@services/index');
const { isEmpty, toUpper } = require('lodash');
const model = require('@models');
const moment = require('moment');
const XLSX = require('xlsx');
const formidable = require('formidable');
const {
  generateAllArrayCombinationsForTuition,
} = require('./feesUploadTemplateHelper');
const { getMetadataValueId } = require('@controllers/Helpers/programmeHelper');

const http = new HttpResponse();

/**
 * CREATE New TuitionAmount Data.
 *
 * @param {*} req Request body
 * @param {*} res Response
 *
 * @return {JSON} Return JSON Response
 */

class TuitionAmountController {
  /**
   * GET All TuitionAmounts.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async index(req, res) {
    try {
      const tuitionAmounts = await tuitionAmountService.findAllTuitionAmounts({
        include: ['tuitionAmountFeesElements'],
      });

      http.setSuccess(200, 'Tuition Amounts Fetched Successfully', {
        tuitionAmounts,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Tuition Amounts', {
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
  async findTuitionByContext(req, res) {
    try {
      const context = req.body;
      const tuitionAmounts = await tuitionAmountService.findTuitionByContext(
        context
      );

      http.setSuccess(200, 'Tuition Amounts Fetched Successfully', {
        tuitionAmounts,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Tuition Amounts', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * bulkCreateAmounts
   * @param {*} req
   * @param {*} res
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

      const amountStudyYears = [];

      if (!isEmpty(data.study_years)) {
        data.study_years.forEach((studyYear) => {
          amountStudyYears.push({
            study_year_id: studyYear,
          });
        });
      }

      const elements = [];

      if (!isEmpty(data.tuitionAmountFeesElements)) {
        data.tuitionAmountFeesElements.forEach((element) => {
          elements.push({
            ...element,
            created_by_id: user,
            elementName: 'ELEMENT',
            programmeName: 'PROGRAMME',
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
      data.study_years = amountStudyYears;
      data.tuitionAmountFeesElements = elements;

      const result = [];

      const amount = await model.sequelize.transaction(async (transaction) => {
        const combinations = await generateAllArrayCombinationsForTuition(data);

        for (const comb of combinations) {
          comb.academicYearName = 'ACADEMIC YEAR';
          comb.intakeName = 'INTAKE';
          comb.billingCategoryName = 'BILLING CATEGORY';
          comb.campusName = 'CAMPUS';

          const upload = await insertNewTuitionAmountFeesElement(
            comb,
            transaction
          );

          result.push(upload);
        }

        return result;
      });

      http.setSuccess(
        200,
        'Tuition Fees Context Created And Amounts Submitted For Approval.',
        {
          data: amount,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable To Create Tuition Fees Context and Submit Amounts For Approval.',
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
  uploadTuitionAmountFeesElements(req, res) {
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
          (templateHeaders) =>
            !isEmpty(templateHeaders['TUITION FEES ELEMENT']) &&
            !isEmpty(templateHeaders.PROGRAMME)
        );

        if (isEmpty(userInputs)) {
          http.setError(
            400,
            'Unable to upload this Document, You are missing some required fields in the template.'
          );

          return http.send(res);
        }

        const metadataValues = await metadataValueService.findAllMetadataValues(
          {
            include: ['metadata'],
          }
        );

        const programmes = await programmeService.findAllProgrammes({
          attributes: ['id', 'programme_title', 'programme_code'],
          raw: true,
        });

        const progStudyTypes = await programmeService.findAllProgrammeTypes({
          attributes: ['id', 'programme_type_id', 'programme_id'],
          raw: true,
        });

        const progStudyYears =
          await programmeService.findAllProgrammeStudyYears({
            attributes: ['id', 'programme_study_year_id', 'programme_id'],
            raw: true,
          });

        const findTuitionFeesCategoryId = getMetadataValueId(
          metadataValues,
          'TUITION FEES',
          'FEES CATEGORIES'
        );

        const feesElements = await feesElementService.findAllFeesElements({
          where: {
            fees_category_id: findTuitionFeesCategoryId,
          },
          attributes: ['id', 'fees_element_name'],
          raw: true,
        });

        const getFeesElement = (value) => {
          const checkValue = feesElements.find(
            (element) => toUpper(element.fees_element_name) === toUpper(value)
          );

          if (checkValue) {
            return parseInt(checkValue.id, 10);
          } else {
            throw new Error(
              `Cannot find ${value} in the list of fees elements of tuition category.`
            );
          }
        };

        const getProgramme = (value) => {
          const code = toUpper(
            value.substr(0, value.indexOf(':')).replace(/[()]/g, '').trim()
          );

          const checkValue = programmes.find(
            (prog) => toUpper(prog.programme_code) === code
          );

          if (checkValue) {
            return parseInt(checkValue.id, 10);
          } else {
            throw new Error(`Cannot find ${value} in the list of programmes.`);
          }
        };

        const getProgrammeStudyTypes = (value, programmeId, programme) => {
          const splittedText = !isEmpty(value) ? value.split(',') : [];
          const arrayOfProgTypeObjects = [];

          splittedText.forEach((text) =>
            arrayOfProgTypeObjects.push({
              typeName: text,
              typeMetadataValueId: getMetadataValueId(
                metadataValues,
                text.trim(),
                'PROGRAMME STUDY TYPES',
                programme
              ),
            })
          );

          const amountProgrammeTypes = [];

          arrayOfProgTypeObjects.forEach((obj) => {
            const checkProgrammeTypeValue = progStudyTypes.find(
              (progType) =>
                parseInt(progType.programme_type_id, 10) ===
                  parseInt(obj.typeMetadataValueId, 10) &&
                parseInt(progType.programme_id, 10) ===
                  parseInt(programmeId, 10)
            );

            if (checkProgrammeTypeValue) {
              amountProgrammeTypes.push({
                programme_type_id: parseInt(checkProgrammeTypeValue.id, 10),
              });
            } else {
              throw new Error(
                `Cannot find ${obj.typeName} in the list of Programme Types of ${programme}.`
              );
            }
          });

          return amountProgrammeTypes;
        };

        const getAcademicYears = (value, programme) => {
          const amountAcademicYears = [];

          const academicYearMetadataValueId = getMetadataValueId(
            metadataValues,
            value.trim(),
            'ACADEMIC YEARS',
            programme
          );

          amountAcademicYears.push({
            academic_year_id: parseInt(academicYearMetadataValueId, 10),
          });

          return amountAcademicYears;
        };

        const getStudyYears = (value, programmeId, programme) => {
          const splittedText = !isEmpty(value) ? value.split(',') : [];
          const arrayOfStudyYearObjects = [];

          splittedText.forEach((text) =>
            arrayOfStudyYearObjects.push({
              name: text,
              studyYearMetadataValueId: getMetadataValueId(
                metadataValues,
                text.trim(),
                'STUDY YEARS',
                programme
              ),
            })
          );

          const amountStudyYears = [];

          arrayOfStudyYearObjects.forEach((obj) => {
            const checkValue = progStudyYears.find(
              (progStudyYear) =>
                parseInt(progStudyYear.programme_study_year_id, 10) ===
                  parseInt(obj.studyYearMetadataValueId, 10) &&
                parseInt(progStudyYear.programme_id, 10) ===
                  parseInt(programmeId, 10)
            );

            if (!isEmpty(checkValue)) {
              amountStudyYears.push({
                study_year_id: parseInt(checkValue.id, 10),
              });
            } else {
              throw new Error(
                `Cannot find ${obj.name} in the list of Programme Study Years of ${programme}.`
              );
            }
          });

          return amountStudyYears;
        };

        const getIntakes = (value, programme) => {
          const amountIntakes = [];

          amountIntakes.push({
            intake_id: parseInt(
              getMetadataValueId(
                metadataValues,
                value.trim(),
                'INTAKES',
                programme
              ),
              10
            ),
          });

          return amountIntakes;
        };

        const getBillingCategories = (value, programme) => {
          const amountBillingCategories = [];

          amountBillingCategories.push({
            billing_category_id: parseInt(
              getMetadataValueId(
                metadataValues,
                value.trim(),
                'BILLING CATEGORIES',
                programme
              ),
              10
            ),
          });

          return amountBillingCategories;
        };

        const getCampuses = (value, programme) => {
          const amountCampuses = [];

          amountCampuses.push({
            campus_id: parseInt(
              getMetadataValueId(
                metadataValues,
                value.trim(),
                'CAMPUSES',
                programme
              ),
              10
            ),
          });

          return amountCampuses;
        };

        try {
          const result = [];

          // Loop through Each Record
          await model.sequelize.transaction(async (transaction) => {
            //  const programmeElements = [];

            for (const context of userInputs) {
              const amountElements = [];

              if (!context.PROGRAMME) {
                throw new Error(
                  `One Of The Records Provided Has No Programme Name.`
                );
              }
              const programmeId = getProgramme(context.PROGRAMME);

              if (!context['STUDY TYPES']) {
                throw new Error(
                  `Programme Types For ${context.PROGRAMME} Are Required`
                );
              }
              const programmeTypes = getProgrammeStudyTypes(
                context['STUDY TYPES'],
                programmeId,
                context.PROGRAMME
              );

              if (!context['ACADEMIC YEARS']) {
                throw new Error(
                  `Academic Years For ${context.PROGRAMME} Are Required`
                );
              }
              const academicYears = getAcademicYears(
                context['ACADEMIC YEARS'],
                context.PROGRAMME
              );

              if (!context['STUDY YEARS']) {
                throw new Error(
                  `Study Years For ${context.PROGRAMME} Are Required`
                );
              }
              const studyYears = getStudyYears(
                context['STUDY YEARS'],
                programmeId,
                context.PROGRAMME
              );

              if (!context.INTAKES) {
                throw new Error(
                  `Intakes For ${context.PROGRAMME} Are Required`
                );
              }
              const intakes = getIntakes(context.INTAKES, context.PROGRAMME);

              if (!context['BILLING CATEGORIES']) {
                throw new Error(
                  `Billing Categories For ${context.PROGRAMME} Are Required`
                );
              }
              const billingCategories = getBillingCategories(
                context['BILLING CATEGORIES'],
                context.PROGRAMME
              );

              if (!context.CAMPUSES) {
                throw new Error(
                  `Campuses For ${context.PROGRAMME} Are Required`
                );
              }
              const campuses = getCampuses(context.CAMPUSES, context.PROGRAMME);

              if (!context['TUITION FEES ELEMENT']) {
                throw new Error(
                  `Fees Element For ${context.PROGRAMME} Is Required.`
                );
              }
              const tuitionFeesElement = context['TUITION FEES ELEMENT'];

              if (!context['PAYMENT CYCLE']) {
                throw new Error(
                  `Payment Cycle For Fees Element ${tuitionFeesElement} Of Programme ${context.PROGRAMME} Is Required.`
                );
              }
              const paymentCycle = getMetadataValueId(
                metadataValues,
                context['PAYMENT CYCLE'],
                'TUITION PAYMENT INTERVALS',
                tuitionFeesElement
              );

              if (!context.AMOUNT) {
                throw new Error(
                  `Amount For Fees Element ${tuitionFeesElement} Of Programme ${context.PROGRAMME} Is Required.`
                );
              }
              const amount = parseFloat(
                context.AMOUNT.toString().replace(/,/g, '')
              );

              if (!context.CURRENCY) {
                throw new Error(
                  `Currency For Fees Element ${tuitionFeesElement} Of Programme ${context.PROGRAMME} Is Required.`
                );
              }
              const currency = getMetadataValueId(
                metadataValues,
                context.CURRENCY,
                'CURRENCIES',
                tuitionFeesElement
              );

              amountElements.push({
                fees_element_id: getFeesElement(tuitionFeesElement),
                paid_when_id: paymentCycle,
                amount: amount,
                currency_id: currency,
                created_by_id: user,
                elementName: tuitionFeesElement,
                programmeName: context.PROGRAMME,
                approvals: {
                  created_by_id: user,
                },
              });

              const payload = {};

              payload.programme_id = programmeId;
              payload.programme_types = programmeTypes;
              payload.academic_years = academicYears;
              payload.study_years = studyYears;
              payload.intakes = intakes;
              payload.billing_categories = billingCategories;
              payload.campuses = campuses;
              payload.created_by_id = user;
              payload.tuitionAmountFeesElements = amountElements;

              const combinations = await generateAllArrayCombinationsForTuition(
                payload
              );

              for (const comb of combinations) {
                comb.academicYearName = context['ACADEMIC YEARS'];
                comb.intakeName = context.INTAKES;
                comb.billingCategoryName = context['BILLING CATEGORIES'];
                comb.campusName = context.CAMPUSES;

                const upload = await insertNewTuitionAmountFeesElement(
                  comb,
                  transaction
                );

                result.push(upload);
              }
            }
          });

          http.setSuccess(
            200,
            'Tuition Fees Context Created And Amounts Submitted For Approval.',
            {
              data: result,
            }
          );

          return http.send(res);
        } catch (error) {
          http.setError(
            400,
            'Unable To Create Tuition Fees Context and Submit Amounts For Approval.',
            {
              error: { message: error.message },
            }
          );

          return http.send(res);
        }
      });
    } catch (error) {
      http.setError(400, 'Unable To Upload This Template.', {
        error: { message: error.message },
      });

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
              await tuitionAmountService.findOneRequestForApproval({
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
              await tuitionAmountService.updateRequestForApproval(
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

            await tuitionAmountService.updateTuitionAmountFeesElement(
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
   * UPDATE Specific TuitionAmount Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async updateTuitionAmount(req, res) {
    try {
      const { id } = req.params;
      const updateTuitionAmount =
        await tuitionAmountService.updateTuitionAmount(id, req.body);
      const tuitionAmount = updateTuitionAmount[1][0];

      http.setSuccess(200, 'Tuition Amount Updated Successfully', {
        tuitionAmount,
      });
      if (isEmpty(tuitionAmount))
        http.setError(404, 'Tuition Amount Data Not Found');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Update This Tuition Amount', {
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
  async addTuitionAmountFeesElement(req, res) {
    try {
      const { tuitionAmountId } = req.params;
      const user = req.user.id;

      const data = req.body;

      const elements = [];

      if (!isEmpty(data.tuitionAmountFeesElements)) {
        data.tuitionAmountFeesElements.forEach((element) => {
          elements.push({
            ...element,
            tuition_amount_id: tuitionAmountId,
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
            await tuitionAmountService.createTuitionAmountFeesElement(
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
        'Tuition Amount Elements Added And Submitted For Approval Successfully.',
        {
          data: finalResult,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable To Add Tuition Amount Elements And Submit For Approval.',
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
  async updateTuitionAmountFeesElement(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      const user = req.user.id;

      data.created_by_id = user;
      data.create_approval_status = 'PENDING';
      data.create_approved_by_id = null;

      const result = await model.sequelize.transaction(async (transaction) => {
        const update =
          await tuitionAmountService.updateTuitionAmountFeesElement(
            id,
            data,
            transaction
          );

        const approval = await tuitionAmountService.findOneRequestForApproval({
          where: {
            amount_fees_element_id: id,
          },
          raw: true,
        });

        if (approval) {
          await tuitionAmountService.updateRequestForApproval(
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
          await tuitionAmountService.createAmountFeesElementApproval(
            {
              amount_fees_element_id: id,
              created_by_id: user,
            },
            transaction
          );
        }

        const result = update[1][0];

        return result;
      });

      http.setSuccess(200, 'Tuition Amount Element Updated Successfully', {
        result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Update This Tuition Amount Element', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Get Specific TuitionAmount Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async fetchTuitionAmount(req, res) {
    const { id } = req.params;
    const tuitionAmount = await tuitionAmountService.findOneTuitionAmount({
      where: { id },
    });

    http.setSuccess(200, 'Tuition Amount Fetched Successfully', {
      tuitionAmount,
    });
    if (isEmpty(tuitionAmount))
      http.setError(404, 'Tuition Amount Data Not Found');

    return http.send(res);
  }

  /**
   * Destroy TuitionAmount Data
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async deleteTuitionAmount(req, res) {
    try {
      const { id } = req.params;

      await tuitionAmountService.deleteTuitionAmount(id);
      http.setSuccess(200, 'Tuition Amount Deleted Successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Delete This Tuition Amount', {
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
  async deleteTuitionAmountFeesElement(req, res) {
    try {
      const { id } = req.params;

      const approval = await tuitionAmountService.findOneRequestForApproval({
        where: {
          amount_fees_element_id: id,
        },
        raw: true,
      });

      if (approval) {
        await tuitionAmountService.deleteAmountFeesElementApproval(approval.id);
      }

      await tuitionAmountService.deleteTuitionAmountFeesElement(id);
      http.setSuccess(200, 'Tuition Amount Deleted Successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Delete This Tuition Amount', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

/**
 *
 * @param {*} data
 * @param {*} transaction
 * @returns
 */
const insertNewTuitionAmountFeesElement = async function (data, transaction) {
  try {
    const result = await tuitionAmountService.createTuitionAmount(
      data,
      transaction
    );

    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = TuitionAmountController;
