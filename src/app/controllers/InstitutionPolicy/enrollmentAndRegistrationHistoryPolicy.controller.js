const { HttpResponse } = require('@helpers');
const {
  enrollmentAndRegistrationHistoryPolicyService,
  metadataValueService,
} = require('@services/index');
const { createInstitutionPolicyLog } = require('../Helpers/logsHelper');
const {
  getMetadataValueName,
} = require('@controllers/Helpers/programmeHelper');
const moment = require('moment');
const model = require('@models');

const http = new HttpResponse();

class EnrollmentAndRegistrationHistoryPolicyController {
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
      const records =
        await enrollmentAndRegistrationHistoryPolicyService.findAllRecords({
          attributes: ['id', 'enrollment_status_id', 'is_active'],
          include: [
            {
              association: 'enrollmentStatus',
              attributes: ['id', 'metadata_value'],
            },
          ],
        });

      http.setSuccess(
        200,
        'All Enrollment And Registration History Policy Records Fetched Successfully',
        {
          data: records,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable To Fetch All Enrollment And Registration History Policy Records',
        {
          error: { message: error.message },
        }
      );

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
  async createRecord(req, res) {
    try {
      const data = req.body;
      const { id: user, remember_token: rememberToken } = req.user;

      data.created_by_id = user;

      const metadataValues = await metadataValueService.findAllMetadataValues({
        include: {
          association: 'metadata',
          attributes: ['id', 'metadata_name'],
        },
        attributes: ['id', 'metadata_value'],
      });

      const enrollmentStatusValue = getMetadataValueName(
        metadataValues,
        data.enrollment_status_id,
        'ENROLLMENT STATUSES'
      );

      const result = await model.sequelize.transaction(async (transaction) => {
        const result =
          await enrollmentAndRegistrationHistoryPolicyService.createRecord(
            data,
            transaction
          );

        if (result[1] === true) {
          await createInstitutionPolicyLog(
            {
              user_id: user,
              operation: `CREATE`,
              area_accessed: `ENROLLMENT AND REGISTRATION HISTORY POLICIES`,
              current_data: `Activated a enrollment and registration history policy for enrollment status: ${enrollmentStatusValue}.`,
              ip_address: req.connection.remoteAddress,
              user_agent: req.get('user-agent'),
              token: rememberToken,
            },
            transaction
          );
        }

        return result[0];
      });

      http.setSuccess(
        200,
        'Enrollment And Registration History Policy Created successfully',
        {
          data: result,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable Create This Enrollment And Registration History Policy Record',
        {
          error: { message: error.message },
        }
      );

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
  async updateRecord(req, res) {
    try {
      const { id } = req.params;
      const { id: user, remember_token: rememberToken } = req.user;
      const data = req.body;

      data.last_updated_by_id = user;
      data.updated_at = moment.now();

      let enrollmentStatusValue = null;

      const findPolicy = await enrollmentAndRegistrationHistoryPolicyService
        .findOneRecord({
          where: { id },
          include: [
            {
              association: 'enrollmentStatus',
              attributes: ['id', 'metadata_value'],
            },
          ],
          nest: true,
        })
        .then((res) => {
          if (res) {
            return res.toJSON();
          }
        });

      if (!findPolicy) {
        throw new Error(`Unable To Find Policy.`);
      }

      if (data.enrollment_status_id) {
        const metadataValues = await metadataValueService.findAllMetadataValues(
          {
            include: {
              association: 'metadata',
              attributes: ['id', 'metadata_name'],
            },
            attributes: ['id', 'metadata_value'],
          }
        );

        enrollmentStatusValue = getMetadataValueName(
          metadataValues,
          data.enrollment_status_id,
          'ENROLLMENT STATUSES'
        );
      }

      const result = await model.sequelize.transaction(async (transaction) => {
        const updateRecord =
          await enrollmentAndRegistrationHistoryPolicyService.updateRecord(
            id,
            data,
            transaction
          );

        await createInstitutionPolicyLog(
          {
            user_id: user,
            operation: `UPDATE`,
            area_accessed: `ENROLLMENT AND REGISTRATION HISTORY POLICIES`,
            current_data: `Updated the enrollment and registration history policy record of id: ${
              findPolicy.id
            } with data:- ${
              data.enrollment_status_id
                ? `Enrollment status: ${enrollmentStatusValue}`
                : ``
            }, Is Active?: ${data.is_active}`,
            previous_data: `id: ${findPolicy.id}, Enrollment Status: ${findPolicy.enrollmentStatus.metadata_value}, Is Active?: ${findPolicy.is_active}`,
            ip_address: req.connection.remoteAddress,
            user_agent: req.get('user-agent'),
            token: rememberToken,
          },
          transaction
        );

        return updateRecord[1][0];
      });

      http.setSuccess(
        200,
        'Enrollment And Registration History Policy Record Updated Successfully',
        {
          data: result,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable To Update This Enrollment And Registration History Policy Record',
        {
          error: { message: error.message },
        }
      );

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
  async deleteRecord(req, res) {
    try {
      const { id } = req.params;
      const { id: user, remember_token: rememberToken } = req.user;

      const findPolicy = await enrollmentAndRegistrationHistoryPolicyService
        .findOneRecord({
          where: { id },
          include: [
            {
              association: 'enrollmentStatus',
              attributes: ['id', 'metadata_value'],
            },
          ],
          nest: true,
        })
        .then((res) => {
          if (res) {
            return res.toJSON();
          }
        });

      if (!findPolicy) {
        throw new Error(`Unable To Find Policy.`);
      }

      await model.sequelize.transaction(async (transaction) => {
        await createInstitutionPolicyLog(
          {
            user_id: user,
            operation: `DELETE`,
            area_accessed: `ENROLLMENT AND REGISTRATION HISTORY POLICIES`,
            current_data: `Deleted the enrollment and registration history policy record of id: ${findPolicy.id}.`,
            previous_data: `id: ${findPolicy.id}, Enrollment Status: ${findPolicy.enrollmentStatus.metadata_value}, Is Active?: ${findPolicy.is_active}`,
            ip_address: req.connection.remoteAddress,
            user_agent: req.get('user-agent'),
            token: rememberToken,
          },
          transaction
        );

        await enrollmentAndRegistrationHistoryPolicyService.deleteRecord(
          id,
          transaction
        );
      });

      http.setSuccess(
        200,
        'Enrollment And Registration History Policy Record Deleted Successfully'
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Cannot delete this Enrollment And Registration History Policy.',
        {
          error: { message: error.message },
        }
      );

      return http.send(res);
    }
  }
}

module.exports = EnrollmentAndRegistrationHistoryPolicyController;
