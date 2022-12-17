const { HttpResponse } = require('@helpers');
const { feesApprovalService } = require('@services/index');

const http = new HttpResponse();

class FeesCopyController {
  /**
   * fees preview controller
   * @param {*} req
   * @param {*} res
   */

  async feesApprovalFunction(req, res) {
    try {
      let response = [];
      const data = req.query;

      if (!data.fees_category) {
        throw new Error('Invalid Context Provided');
      }

      if (
        data.fees_category === 'tuitionFees' &&
        data.academic_year_id &&
        data.campus_id &&
        data.intake_id &&
        data.programme_id
      ) {
        response = await feesApprovalService.tuitionFeesPendingApproval(data);
      } else if (
        data.fees_category === 'functionalFees' &&
        data.academic_year_id &&
        data.campus_id &&
        data.intake_id
      ) {
        response = await feesApprovalService.functionalFeesPendingApproval(
          data
        );
      } else if (
        data.fees_category === 'otherFees' &&
        data.academic_year_id &&
        data.campus_id &&
        data.intake_id
      ) {
        response = await feesApprovalService.otherFeesPendingApproval(data);
      } else if (
        data.fees_category === 'feesWaivers' &&
        data.academic_year_id &&
        data.campus_id &&
        data.intake_id
      ) {
        response = await feesApprovalService.feesWaiversPendingApproval(data);
      } else if (
        data.fees_category === 'feesCopy' &&
        data.academic_year_id &&
        data.campus_id
      ) {
        response = await feesApprovalService.feesCopyPendingApproval(data);
      } else {
        throw new Error('Invalid Context Provided');
      }

      http.setSuccess(
        200,
        `${data.fees_category} Pending Approval Fetched Successfully`,
        {
          pendingFees: response,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        `Unable To Fetch ${data.fees_category}  Pending Approval`,
        {
          error: { message: error.message },
        }
      );

      return http.send(res);
    }
  }
}

module.exports = FeesCopyController;
