const { HttpResponse } = require('@helpers');
const { securityProfileService } = require('@services/index');
const { isEmpty } = require('lodash');
const { roleProfileService } = require('../../services');

const http = new HttpResponse();

class RoleProfileController {
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
      const roleProfiles = await roleProfileService.findAllRoleWithProfiles();

      http.setSuccess(200, 'role profiles  fetch successful', {
        roleProfiles,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to fetch role and their Profiles', {
        error: error.message,
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

      http.setSuccess(200, 'Security Profile updated successfully', {
        securityProfile,
      });
      if (isEmpty(securityProfile))
        http.setError(200, 'Security Profile Data Not Found.');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to update this Security Profile.', {
        error: error.message,
      });

      return http.send(res);
    }
  }
}

module.exports = RoleProfileController;
