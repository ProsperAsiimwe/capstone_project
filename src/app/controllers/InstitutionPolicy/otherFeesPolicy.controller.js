const { HttpResponse } = require('@helpers');
const {
  otherFeesPolicyService,
  feesElementService,
  // otherFeesAmountService,
} = require('@services/index');
const { isEmpty } = require('lodash');

const http = new HttpResponse();

class OtherFeesPolicyController {
  /**
   * GET All records.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async index(req, res) {
    try {
      const records = await otherFeesPolicyService.findAllRecords({
        attributes: ['id', 'other_fees_element_id', 'course_unit_status_id'],
        include: [
          {
            association: 'courseUnitStatus',
            attributes: ['metadata_value'],
          },
          {
            association: 'otherFeesElement',
            attributes: ['fees_element_code', 'fees_element_name'],
            include: {
              association: 'feesCategory',
              attributes: ['metadata_value'],
            },
          },
        ],
      });

      http.setSuccess(
        200,
        'All Other Fees Policy Records Fetched Successfully',
        {
          data: records,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch All Other Fees Policy Records', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * CREATE New Record.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async createOtherFeesPolicy(req, res) {
    try {
      const data = req.body;
      const { id } = req.user;

      data.created_by_id = id;

      // const checkIfOtherFeesElementIsAssigned =
      //   await otherFeesAmountService.findOneOtherFeesAmountFeesElementRecord({
      //     where: {
      //       fees_element_id: data.other_fees_element_id,
      //     },
      //     attributes: ['id', 'fees_element_id', 'amount'],
      //   });

      // if (isEmpty(checkIfOtherFeesElementIsAssigned)) {
      //   throw new Error(
      //     'The Other Fees Element Chosen Has Not Been Assigned An Amount Yet In The Fees Management Application.'
      //   );
      // }

      const result = await otherFeesPolicyService.createOtherFeesPolicyRecord(
        data
      );

      http.setSuccess(201, 'Other Fees Policy Created Successfully.', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Create This Other Fees Policy.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * UPDATE Specific Record.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async updateOtherFeesPolicy(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      const updateRecord = await otherFeesPolicyService.updateRecord(id, data);
      const otherFeesPolicy = updateRecord[1][0];

      http.setSuccess(200, 'Other Fees Policy Record Updated Successfully', {
        data: otherFeesPolicy,
      });
      if (isEmpty(otherFeesPolicy))
        http.setError(404, 'Other Fees Policy Record Data Not Found');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Update This Other Fees Policy Record', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Get All Records By Student Id.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async fetchOtherFeesElements(req, res) {
    try {
      const data = await feesElementService.findAllFeesElements({
        where: {
          student_id,
        },
      });

      http.setSuccess(200, 'Other Fees Policy Record fetched successfully', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to get this Other Fees Policy Record', {
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
  async fetchAllRecordsByStudentId(req, res) {
    try {
      const { student_id: studentId } = req.params;
      const data = await otherFeesPolicyService.findAllRecords({
        where: {
          student_id: studentId,
        },
      });

      http.setSuccess(200, 'Other Fees Policy Record fetched successfully', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to get this Other Fees Policy Record', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Destroy Record Data
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async deleteOtherFeesPolicy(req, res) {
    try {
      const { id } = req.params;

      await otherFeesPolicyService.deleteRecord(id);
      http.setSuccess(200, 'Other Fees Policy Record Deleted Successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Delete This Other Fees Policy Record', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

module.exports = OtherFeesPolicyController;
