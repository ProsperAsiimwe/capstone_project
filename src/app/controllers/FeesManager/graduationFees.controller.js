const { HttpResponse } = require('@helpers');
const { graduationFeesService, studentService } = require('@services/index');
const { isEmpty } = require('lodash');
const model = require('@models');
const moment = require('moment');

const {
  generateAllArrayCombinationsForGraduationFees,
} = require('./feesUploadTemplateHelper');

const http = new HttpResponse();

/**
 * CREATE New GraduationFees Data.
 *
 * @param {*} req Request body
 * @param {*} res Response
 *
 * @return {JSON} Return JSON Response
 */

class GraduationFeesController {
  /**
   * GET All GraduationFees.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async index(req, res) {
    try {
      const graduationFees = await graduationFeesService.findAllGraduationFees({
        include: ['graduationFeesElements'],
      });

      http.setSuccess(200, 'Graduation Fees Fetched Successfully', {
        graduationFees,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Graduation Fees', {
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

      const graduationAcademicYears = [];

      if (!isEmpty(data.grad_academic_years)) {
        data.grad_academic_years.forEach((academicYear) => {
          graduationAcademicYears.push({
            grad_academic_year_id: academicYear,
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

      const amountBillingCategories = [];

      if (!isEmpty(data.billing_categories)) {
        data.billing_categories.forEach((billingCategory) => {
          amountBillingCategories.push({
            billing_category_id: billingCategory,
          });
        });
      }

      const amountStudyLevels = [];

      if (!isEmpty(data.study_levels)) {
        data.study_levels.forEach((studyLevel) => {
          amountStudyLevels.push({
            programme_study_level_id: studyLevel,
          });
        });
      }

      const elements = [];

      if (!isEmpty(data.graduationFeesAmountElements)) {
        data.graduationFeesAmountElements.forEach((element) => {
          elements.push({
            ...element,
            created_by_id: user,
          });
        });
      }

      data.grad_academic_years = graduationAcademicYears;
      data.campuses = amountCampuses;
      data.billing_categories = amountBillingCategories;
      data.study_levels = amountStudyLevels;
      data.graduationFeesElements = elements;

      const result = [];

      const amount = await model.sequelize.transaction(async (transaction) => {
        const combinations =
          await generateAllArrayCombinationsForGraduationFees(data);

        for (const comb of combinations) {
          const upload = await insertNewGraduationFeesElement(
            comb,
            transaction
          );

          result.push(upload);
        }

        return result;
      });

      http.setSuccess(200, 'Graduation Fees Context Created.', {
        data: amount,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Create Graduation Fees Context.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * UPDATE Specific GraduationFees Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async updateGraduationFees(req, res) {
    try {
      const { id } = req.params;
      const updateGraduationFees =
        await graduationFeesService.updateGraduationFees(id, req.body);
      const graduationFees = updateGraduationFees[1][0];

      http.setSuccess(200, 'Graduation Fees Updated Successfully', {
        graduationFees,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Update This Graduation Fees', {
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
  async addGraduationFeesElement(req, res) {
    try {
      const { graduationFeesId } = req.params;
      const user = req.user.id;

      const data = req.body;

      const elements = [];

      if (!isEmpty(data.graduationFeesElements)) {
        data.graduationFeesElements.forEach((element) => {
          elements.push({
            ...element,
            graduation_fee_id: graduationFeesId,
            created_by_id: user,
          });
        });
      }

      const finalResult = [];

      await model.sequelize.transaction(async (transaction) => {
        for (const eachObject of elements) {
          const response =
            await graduationFeesService.createGraduationFeesElement(
              eachObject,
              transaction
            );

          if (response[1] === true) {
            finalResult.push(response);
          }
        }
      });

      http.setSuccess(200, 'Graduation Fees Elements Added Successfully.', {
        data: finalResult,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Add Graduation Fees Elements.', {
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
  async updateGraduationFeesElement(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      const user = req.user.id;

      data.created_by_id = user;
      data.create_approval_status = 'PENDING';
      data.create_approved_by_id = null;
      data.updated_at = moment.now();

      const result = await model.sequelize.transaction(async (transaction) => {
        const update = await graduationFeesService.updateGraduationFeesAmount(
          id,
          data,
          transaction
        );

        const result = update[1][0];

        return result;
      });

      http.setSuccess(200, 'Graduation Fees Element Updated Successfully', {
        result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Update This Graduation Fees Element', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Get Specific GraduationFees Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async fetchGraduationFees(req, res) {
    const { id } = req.params;
    const graduationFees = await graduationFeesService.findOneGraduationFees({
      where: { id },
    });

    http.setSuccess(200, 'Graduation Fees Fetched Successfully', {
      graduationFees,
    });
    if (isEmpty(graduationFees))
      http.setError(404, 'Graduation Fees Data Not Found');

    return http.send(res);
  }

  // graduationFeesByContext

  async graduationFeesByContext(req, res) {
    try {
      const context = req.query;

      if (
        !context.academic_year_id ||
        !context.campus_id ||
        !context.billing_category_id ||
        !context.study_level_id
      ) {
        throw new Error('Invalid Data Request');
      }
      const element = await graduationFeesService.graduationFeesByContext(
        context
      );

      http.setSuccess(200, 'Graduation Fees Fetched Successfully', {
        element,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Graduation Fees', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  async graduationInvoiceStaff(req, res) {
    try {
      const context = req.params;

      if (!context.studentProgrammeId) {
        throw new Error('Invalid Data Request');
      }
      const element = await graduationFeesService.graduationInvoiceElement(
        context
      );

      http.setSuccess(200, 'Graduation Invoice Fetched Successfully', {
        element,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Graduation Invoice', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  async graduationInvoiceStudent(req, res) {
    try {
      const studentId = req.user.id;
      // const studentId = 90756;

      const student = await studentService.findOneStudentProgramme({
        where: {
          student_id: studentId,
        },
        attributes: ['id', 'student_id'],
        raw: true,
      });

      if (!student) {
        throw new Error('Unable To Find This Student.');
      }
      const context = { studentProgrammeId: student.id };

      const element = await graduationFeesService.graduationInvoiceElement(
        context
      );

      http.setSuccess(200, 'Graduation Invoice Fetched Successfully', {
        element,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Graduation Invoice', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Destroy GraduationFees Data
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async deleteGraduationFees(req, res) {
    try {
      const { id } = req.params;

      await graduationFeesService.deleteGraduationFees(id);
      http.setSuccess(200, 'Graduation Fees Deleted Successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Delete This Graduation Fees', {
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
  async deleteGraduationFeesElement(req, res) {
    try {
      const { id } = req.params;

      await graduationFeesService.deleteGraduationFeesAmount(id);
      http.setSuccess(200, 'Graduation Fees Element Deleted Successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Delete This Graduation Fees Element', {
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
const insertNewGraduationFeesElement = async function (data, transaction) {
  try {
    const result = await graduationFeesService.createGraduationFees(
      data,
      transaction
    );

    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = GraduationFeesController;
