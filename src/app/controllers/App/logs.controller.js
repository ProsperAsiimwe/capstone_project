const { HttpResponse } = require('@helpers');
const { logService } = require('@services/index');

const http = new HttpResponse();

class LogController {
  /**
   * GET All Logs.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async findAllAdmissionLogs(req, res) {
    try {
      const result = await logService.findAllAdmissionLogs({
        include: [
          {
            association: 'user',
            attributes: ['id', 'surname', 'other_names', 'email', 'phone'],
          },
        ],
      });

      http.setSuccess(200, 'Logs retrieved successfully.', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Logs', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async findAllResultLogs(req, res) {
    try {
      const result = await logService.findAllResultLogs({
        include: [
          {
            association: 'user',
            attributes: ['id', 'surname', 'other_names', 'email', 'phone'],
          },
        ],
      });

      http.setSuccess(200, 'Logs retrieved successfully.', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Logs', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async findAllStudentRecordLogs(req, res) {
    try {
      const result = await logService.findAllStudentRecordLogs({
        include: [
          {
            association: 'user',
            attributes: ['id', 'surname', 'other_names', 'email', 'phone'],
          },
        ],
      });

      http.setSuccess(200, 'Logs retrieved successfully.', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Logs', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async findAllUniversalPaymentLogs(req, res) {
    try {
      const result = await logService.findAllUniversalPaymentLogs({
        include: [
          {
            association: 'user',
            attributes: ['id', 'surname', 'other_names', 'email', 'phone'],
          },
        ],
      });

      http.setSuccess(200, 'Logs retrieved successfully.', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Logs', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async findAllEnrollmentAndRegistrationLogs(req, res) {
    try {
      const result = await logService.findAllEnrollmentAndRegistrationLogs({
        include: [
          {
            association: 'user',
            attributes: ['id', 'surname', 'other_names', 'email', 'phone'],
          },
        ],
      });

      http.setSuccess(200, 'Logs retrieved successfully.', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Logs', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async findAllInstitutionPolicyLogs(req, res) {
    try {
      const result = await logService.findAllInstitutionPolicyLogs({
        include: [
          {
            association: 'user',
            attributes: ['id', 'surname', 'other_names', 'email', 'phone'],
          },
        ],
      });

      http.setSuccess(200, 'Logs retrieved successfully.', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Logs', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async findAllProgrammeMgtLogs(req, res) {
    try {
      const result = await logService.findAllProgrammeMgtLogs({
        include: [
          {
            association: 'user',
            attributes: ['id', 'surname', 'other_names', 'email', 'phone'],
          },
        ],
      });

      http.setSuccess(200, 'Logs retrieved successfully.', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Logs', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async findAllFeesMgtLogs(req, res) {
    try {
      const result = await logService.findAllFeesMgtLogs({
        include: [
          {
            association: 'user',
            attributes: ['id', 'surname', 'other_names', 'email', 'phone'],
          },
        ],
      });

      http.setSuccess(200, 'Logs retrieved successfully.', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Logs', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async findAllUserAccessLogs(req, res) {
    try {
      const result = await logService.findAllUserAccessLogs({
        include: [
          {
            association: 'user',
            attributes: ['id', 'surname', 'other_names', 'email', 'phone'],
          },
        ],
      });

      http.setSuccess(200, 'Logs retrieved successfully.', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Logs', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async findAllUserAdmissionLogs(req, res) {
    try {
      const { id } = req.user;

      const result = await logService.findAllAdmissionLogs({
        where: {
          user_id: id,
        },
        include: [
          {
            association: 'user',
            attributes: ['id', 'surname', 'other_names', 'email', 'phone'],
          },
        ],
      });

      http.setSuccess(200, 'Logs retrieved successfully.', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Logs', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async findAllUserResultLogs(req, res) {
    try {
      const { id } = req.user;

      const result = await logService.findAllResultLogs({
        where: {
          user_id: id,
        },
        include: [
          {
            association: 'user',
            attributes: ['id', 'surname', 'other_names', 'email', 'phone'],
          },
        ],
      });

      http.setSuccess(200, 'Logs retrieved successfully.', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Logs', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async findAllUserStudentRecordLogs(req, res) {
    try {
      const { id } = req.user;

      const result = await logService.findAllStudentRecordLogs({
        where: {
          user_id: id,
        },
        include: [
          {
            association: 'user',
            attributes: ['id', 'surname', 'other_names', 'email', 'phone'],
          },
        ],
      });

      http.setSuccess(200, 'Logs retrieved successfully.', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Logs', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async findAllUserUniversalPaymentLogs(req, res) {
    try {
      const { id } = req.user;

      const result = await logService.findAllUniversalPaymentLogs({
        where: {
          user_id: id,
        },
        include: [
          {
            association: 'user',
            attributes: ['id', 'surname', 'other_names', 'email', 'phone'],
          },
        ],
      });

      http.setSuccess(200, 'Logs retrieved successfully.', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Logs', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async findAllUserEnrollmentAndRegistrationLogs(req, res) {
    try {
      const { id } = req.user;

      const result = await logService.findAllEnrollmentAndRegistrationLogs({
        where: {
          user_id: id,
        },
        include: [
          {
            association: 'user',
            attributes: ['id', 'surname', 'other_names', 'email', 'phone'],
          },
        ],
      });

      http.setSuccess(200, 'Logs retrieved successfully.', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Logs', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async findAllUserInstitutionPolicyLogs(req, res) {
    try {
      const { id } = req.user;

      const result = await logService.findAllInstitutionPolicyLogs({
        where: {
          user_id: id,
        },
        include: [
          {
            association: 'user',
            attributes: ['id', 'surname', 'other_names', 'email', 'phone'],
          },
        ],
      });

      http.setSuccess(200, 'Logs retrieved successfully.', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Logs', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async findAllUserProgrammeMgtLogs(req, res) {
    try {
      const { id } = req.user;

      const result = await logService.findAllProgrammeMgtLogs({
        where: {
          user_id: id,
        },
        include: [
          {
            association: 'user',
            attributes: ['id', 'surname', 'other_names', 'email', 'phone'],
          },
        ],
      });

      http.setSuccess(200, 'Logs retrieved successfully.', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Logs', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async findAllUserFeesMgtLogs(req, res) {
    try {
      const { id } = req.user;

      const result = await logService.findAllFeesMgtLogs({
        where: {
          user_id: id,
        },
        include: [
          {
            association: 'user',
            attributes: ['id', 'surname', 'other_names', 'email', 'phone'],
          },
        ],
      });

      http.setSuccess(200, 'Logs retrieved successfully.', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Logs', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async findAllUserUserAccessLogs(req, res) {
    try {
      const { id } = req.user;

      const result = await logService.findAllUserAccessLogs({
        where: {
          user_id: id,
        },
        include: [
          {
            association: 'user',
            attributes: ['id', 'surname', 'other_names', 'email', 'phone'],
          },
        ],
      });

      http.setSuccess(200, 'Logs retrieved successfully.', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Logs', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

module.exports = LogController;
