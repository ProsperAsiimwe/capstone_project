const { HttpResponse } = require('@helpers');
const {
  applicantEmploymentRecordService,
  runningAdmissionApplicantService,
} = require('@services/index');
const { isEmpty } = require('lodash');
const model = require('@models');

const {
  checkRunningAdmissionExpiry,
  // checkRunningAdmissionMaximumNumberOfFormsConstraint,
} = require('../Helpers/runningAdmissionApplicantHelper');

const { generateAdmissionFormId } = require('../Helpers/admissionsHelper');

const http = new HttpResponse();

class ApplicantEmploymentRecordController {
  /**
   * GET All applicantEmploymentRecords.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async index(req, res) {
    try {
      const applicantEmploymentRecords =
        await applicantEmploymentRecordService.findAllApplicantEmploymentRecords(
          {
            ...getApplicantEmploymentRecordAttributes(),
          }
        );

      http.setSuccess(
        200,
        'Applicant Employment Records Fetched Successfully',
        {
          applicantEmploymentRecords,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Applicant Employment Records', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * CREATE New ApplicantEmploymentRecord Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async createApplicantEmploymentRecord(req, res) {
    try {
      const data = req.body;
      const { id } = req.user;

      data.applicant_id = parseInt(id, 10);

      data.form_id =
        data.form_id && data.form_id.includes('APF')
          ? data.form_id
          : await generateAdmissionFormId(data.running_admission_id, id);

      const employerRecords = data;
      const runningAdmissionApplicantSection = {
        running_admission_id: data.running_admission_id,
        applicant_id: data.applicant_id,
        form_id: data.form_id,
        formSections: [
          {
            form_section_id: data.section_id,
          },
        ],
      };

      await checkRunningAdmissionExpiry(data.running_admission_id);

      // await checkRunningAdmissionMaximumNumberOfFormsConstraint(
      //   data.running_admission_id,
      //   data.applicant_id
      // );

      const response = await model.sequelize.transaction(
        async (transaction) => {
          const result =
            await applicantEmploymentRecordService.createApplicantEmploymentRecord(
              employerRecords,
              transaction
            );

          await runningAdmissionApplicantService.createRunningAdmissionApplicant(
            runningAdmissionApplicantSection,
            transaction
          );

          return result;
        }
      );

      http.setSuccess(201, 'Employment Record added', { data: response });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to add this Employment Record.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * UPDATE Specific ApplicantEmploymentRecord Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async updateApplicantEmploymentRecord(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      const findForm =
        await applicantEmploymentRecordService.findOneApplicantEmploymentRecord(
          {
            where: {
              id,
            },
            raw: true,
          }
        );

      await checkRunningAdmissionExpiry(findForm.running_admission_id);

      const updateResult =
        await applicantEmploymentRecordService.updateApplicantEmploymentRecord(
          id,
          data
        );

      http.setSuccess(200, 'Employment record updated', {
        data: updateResult,
      });
      if (isEmpty(updateResult))
        http.setError(404, 'Employment record not found');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to update this employment record', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * DELETE Specific ApplicantEmploymentRecord Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async deleteApplicantEmploymentRecord(req, res) {
    try {
      const { id } = req.params;
      const applicantId = req.user.id;
      const updateResult =
        await applicantEmploymentRecordService.deleteApplicantEmploymentRecord({
          id,
          applicant_id: applicantId,
        });

      http.setSuccess(200, 'Employment record deleted', {
        data: updateResult,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to delete this employment record', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Get Specific ApplicantEmploymentRecord Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async fetchApplicantEmploymentRecord(req, res) {
    try {
      const { formId } = req.params;
      const applicant = parseInt(req.user.id, 10);
      const data =
        await applicantEmploymentRecordService.findAllApplicantEmploymentRecords(
          {
            where: {
              form_id: formId,
              applicant_id: applicant,
            },
            ...getApplicantEmploymentRecordAttributes(),
          }
        );

      http.setSuccess(200, 'Applicant Employment Record fetch successful', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to get this Applicant Employment Record', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

const getApplicantEmploymentRecordAttributes = function () {
  return {
    include: [
      {
        association: 'applicant',
        attributes: [],
      },
    ],
  };
};

module.exports = ApplicantEmploymentRecordController;
