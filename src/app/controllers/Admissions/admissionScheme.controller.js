const { HttpResponse } = require('@helpers');
const { admissionSchemeService } = require('@services/index');
const { createAdmissionLog } = require('../Helpers/logsHelper');
const model = require('@models');
const { isEmpty } = require('lodash');
const moment = require('moment');

const http = new HttpResponse();

class AdmissionSchemeController {
  /**
   * GET All admissionSchemes.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async index(req, res) {
    try {
      const admissionSchemes =
        await admissionSchemeService.findAllAdmissionSchemes({
          ...getAdmissionSchemeAttributes(),
        });

      http.setSuccess(200, 'Admission Schemes Fetched Successfully', {
        admissionSchemes,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Admission Schemes', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * CREATE New AdmissionScheme Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async createAdmissionScheme(req, res) {
    try {
      const data = req.body;
      const { id, remember_token: rememberToken } = req.user;

      data.created_by_id = parseInt(id, 10);
      data.scheme_name = data.scheme_name.toUpperCase();

      const admissionScheme = await model.sequelize.transaction(
        async (transaction) => {
          const result = await admissionSchemeService.createAdmissionScheme(
            data,
            transaction
          );

          await createAdmissionLog(
            {
              user_id: id,
              operation: `CREATE`,
              area_accessed: `ADMISSION SCHEMES`,
              current_data: `Name: ${data.scheme_name}, Decription: ${data.scheme_description}.`,
              ip_address: req.connection.remoteAddress,
              user_agent: req.get('user-agent'),
              token: rememberToken,
            },
            transaction
          );

          return result;
        }
      );

      http.setSuccess(201, 'Admission Scheme created successfully', {
        admissionScheme,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to create this Admission Scheme.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * UPDATE Specific AdmissionScheme Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async updateAdmissionScheme(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      const { id: user, remember_token: rememberToken } = req.user;

      const findAdmissionScheme =
        await admissionSchemeService.findOneAdmissionScheme({
          where: {
            id,
          },
          ...getAdmissionSchemeAttributes(),
          raw: true,
        });

      if (!findAdmissionScheme) {
        throw new Error('Unable To Find Admission Scheme');
      }

      data.last_updated_by_id = user;
      data.updated_at = moment.now();

      const admissionScheme = await model.sequelize.transaction(
        async (transaction) => {
          const updateAdmissionScheme =
            await admissionSchemeService.updateAdmissionScheme(
              id,
              data,
              transaction
            );

          await createAdmissionLog(
            {
              user_id: user,
              operation: `UPDATE`,
              area_accessed: `ADMISSION SCHEME`,
              current_data: `Name: ${data.scheme_name}, Decription: ${data.scheme_description}.`,
              previous_data: `id: ${findAdmissionScheme.id}, Name: ${findAdmissionScheme.scheme_name}, Decription: ${findAdmissionScheme.scheme_description}.`,
              ip_address: req.connection.remoteAddress,
              user_agent: req.get('user-agent'),
              token: rememberToken,
            },
            transaction
          );

          const result = updateAdmissionScheme[1][0];

          return result;
        }
      );

      http.setSuccess(200, 'Admission Scheme Updated Successfully', {
        admissionScheme,
      });
      if (isEmpty(admissionScheme))
        http.setError(404, 'Admission Scheme Data Not Found');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Update This Admission Scheme', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Get Specific AdmissionScheme Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async fetchAdmissionScheme(req, res) {
    try {
      const { id } = req.params;
      const admissionScheme =
        await admissionSchemeService.findOneAdmissionScheme({
          where: { id },
          ...getAdmissionSchemeAttributes(),
        });

      http.setSuccess(200, 'Admission Scheme fetch successful', {
        admissionScheme,
      });
      if (isEmpty(admissionScheme))
        http.setError(404, 'Admission Scheme Data Not Found');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to get this Admission Scheme', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Destroy AdmissionScheme Data
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async hardDeleteAdmissionScheme(req, res) {
    try {
      const { id } = req.params;
      const { id: user, remember_token: rememberToken } = req.user;

      const findAdmissionScheme =
        await admissionSchemeService.findOneAdmissionScheme({
          where: {
            id,
          },
          ...getAdmissionSchemeAttributes(),
          raw: true,
        });

      if (!findAdmissionScheme) {
        throw new Error('Unable To Find Admission Scheme');
      }

      await model.sequelize.transaction(async (transaction) => {
        await createAdmissionLog(
          {
            user_id: user,
            operation: `DELETE`,
            area_accessed: `ADMISSION SCHEMES`,
            previous_data: `id: ${findAdmissionScheme.id}, Name: ${findAdmissionScheme.scheme_name}, Decription: ${findAdmissionScheme.scheme_description}.`,
            ip_address: req.connection.remoteAddress,
            user_agent: req.get('user-agent'),
            token: rememberToken,
          },
          transaction
        );

        await admissionSchemeService.hardDeleteAdmissionScheme(id, transaction);
      });

      http.setSuccess(200, 'Admission Scheme Deleted Successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Delete This Admission Scheme', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * SOFT DELETE Specific AdmissionScheme Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async softDeleteAdmissionScheme(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      data.deleted_by_id = parseInt(req.user.id, 10);
      data.deleted_at = moment.now();
      const updateAdmissionScheme =
        await admissionSchemeService.softDeleteAdmissionScheme(id, data);
      const admissionScheme = updateAdmissionScheme[1][0];

      http.setSuccess(200, 'Admission Scheme Soft Deleted Successfully', {
        admissionScheme,
      });
      if (isEmpty(admissionScheme))
        http.setError(404, 'Admission Scheme Data Not Found');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Soft Delete This Admission Scheme', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * UNDO SOFT DELETE Specific AdmissionScheme Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async undoSoftDeleteAdmissionScheme(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      data.deleted_by_id = null;
      data.deleted_at = null;
      data.delete_approval_status = 'PENDING';
      const updateAdmissionScheme =
        await admissionSchemeService.undoSoftDeleteAdmissionScheme(id, data);
      const admissionScheme = updateAdmissionScheme[1][0];

      http.setSuccess(200, 'Admission Scheme Retrieved Successfully', {
        admissionScheme,
      });
      if (isEmpty(admissionScheme))
        http.setError(404, 'Admission Scheme Data Not Found');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Retrieve This Admission Scheme', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

const getAdmissionSchemeAttributes = function () {
  return {
    attributes: {
      exclude: [
        'created_at',
        'updated_at',
        'deleted_at',
        'createdById',
        'createApprovedById',
        'lastUpdatedById',
        'lastUpdateApprovedById',
        'deletedById',
        'deleteApprovedById',
        'deleteApprovedById',
      ],
    },
  };
};

module.exports = AdmissionSchemeController;
