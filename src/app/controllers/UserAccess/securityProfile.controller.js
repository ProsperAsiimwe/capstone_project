const { HttpResponse } = require('@helpers');
const { securityProfileService } = require('@services/index');
const { isEmpty } = require('lodash');

const http = new HttpResponse();

class SecurityProfileController {
  /**
   * GET All SecurityProfiles.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async index(req, res) {
    try {
      const securityProfiles =
        await securityProfileService.findAllSecurityProfiles();

      http.setSuccess(200, 'Security Profile Fetched Successfully', {
        securityProfiles,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Security Profiles', {
        error: {
          message: error.message,
        },
      });

      return http.send(res);
    }
  }

  /**
   * CREATE New SecurityProfile Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async createSecurityProfile(req, res) {
    try {
      const authUser = req.user.id;
      const data = req.body;

      data.created_by_id = authUser;
      const securityProfile =
        await securityProfileService.createSecurityProfile(data);

      http.setSuccess(201, 'Security Profile Created Successfully', {
        securityProfile,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Create This Security Profile', {
        error: {
          message: error.message,
        },
      });

      return http.send(res);
    }
  }

  /**
   * UPDATE Specific SecurityProfile Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async updateSecurityProfile(req, res) {
    try {
      const { id } = req.params;
      const updateSecurityProfile =
        await securityProfileService.updateSecurityProfile(id, req.body);
      const securityProfile = updateSecurityProfile[1][0];

      http.setSuccess(200, 'Security Profile Updated Successfully', {
        securityProfile,
      });
      if (isEmpty(securityProfile))
        http.setError(404, 'Security Profile Data Not Found');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to Update This Security Profile', {
        error: {
          message: error.message,
        },
      });

      return http.send(res);
    }
  }

  /**
   * Get Specific SecurityProfile Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async fetchSecurityProfile(req, res) {
    try {
      const { id } = req.params;
      const securityProfile =
        await securityProfileService.findOneSecurityProfile({ where: { id } });

      http.setSuccess(200, 'Security Profile Fetch successful', {
        securityProfile,
      });
      if (isEmpty(securityProfile))
        http.setError(404, 'Security Profile Data Not Found');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch This Security Profile', {
        error: {
          message: error.message,
        },
      });

      return http.send(res);
    }
  }

  /**
   * Destroy SecurityProfile Data
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async deleteSecurityProfile(req, res) {
    try {
      const { id } = req.params;

      await securityProfileService.deleteSecurityProfile(id);
      http.setSuccess(200, 'Security Profile Deleted Successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Delete This Security Profile.', {
        error: {
          message: error.message,
        },
      });

      return http.send(res);
    }
  }
}

module.exports = SecurityProfileController;
