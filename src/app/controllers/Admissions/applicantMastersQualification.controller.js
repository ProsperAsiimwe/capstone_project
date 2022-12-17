const { HttpResponse } = require('@helpers');
const {
  applicantMastersQualificationService,
  runningAdmissionApplicantService,
} = require('@services/index');
const { isEmpty } = require('lodash');
const model = require('@models');

const {
  checkRunningAdmissionExpiry,
  //  checkRunningAdmissionMaximumNumberOfFormsConstraint,
} = require('../Helpers/runningAdmissionApplicantHelper');

const { generateAdmissionFormId } = require('../Helpers/admissionsHelper');

const {
  handleGeneratingQualification,
} = require('../Helpers/qualificationsHelper');

const http = new HttpResponse();

class ApplicantMastersQualificationController {
  /**
   * GET All applicantMastersQualifications.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async index(req, res) {
    try {
      const result =
        await applicantMastersQualificationService.findAllApplicantMastersQualifications(
          {
            ...getApplicantMastersQualificationAttributes(),
          }
        );

      http.setSuccess(
        200,
        'Applicant Masters Qualifications Fetched Successfully',
        {
          data: result,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Applicant Masters Qualifications', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * CREATE New ApplicantMastersQualification Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async createApplicantMastersQualification(req, res) {
    try {
      const data = req.body;
      const { id } = req.user;

      data.applicant_id = parseInt(id, 10);

      data.form_id =
        data.form_id && data.form_id.includes('APF')
          ? data.form_id
          : await generateAdmissionFormId(data.running_admission_id, id);

      const qualification = {
        ...data,
        applicant_id: id,
      };

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
          const newData = handleGeneratingQualification(qualification);

          const result =
            await applicantMastersQualificationService.createApplicantMastersQualification(
              newData,
              transaction
            );

          await runningAdmissionApplicantService.createRunningAdmissionApplicant(
            runningAdmissionApplicantSection,
            transaction
          );

          return result;
        }
      );

      http.setSuccess(201, 'Relevant Qualification added', { data: response });

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable to create this Applicant Masters Qualification.'
      );

      return http.send(res);
    }
  }

  /**
   * UPDATE Specific ApplicantMastersQualification Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async updateApplicantMastersQualification(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      const findForm =
        await applicantMastersQualificationService.findOneApplicantMastersQualification(
          {
            where: {
              id,
            },
            raw: true,
          }
        );

      await checkRunningAdmissionExpiry(findForm.running_admission_id);

      const updateResponse =
        await applicantMastersQualificationService.updateApplicantMastersQualification(
          id,
          data
        );

      http.setSuccess(200, 'Qualification Updated Successfully.', {
        data: updateResponse,
      });
      if (isEmpty(updateResponse))
        http.setError(404, 'Qualification Data Not Found');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Update This Qualification');

      return http.send(res);
    }
  }

  /**
   * DELETE Specific ApplicantMastersQualification Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async deleteApplicantMastersQualification(req, res) {
    try {
      const { id } = req.params;
      const applicantId = req.user.id;

      const deleteResponse =
        await applicantMastersQualificationService.deleteApplicantMastersQualification(
          { id, applicant_id: applicantId }
        );

      http.setSuccess(200, 'Qualification deleted.', {
        data: deleteResponse,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To delete this Qualification');

      return http.send(res);
    }
  }

  /**
   * Get Specific ApplicantMastersQualification Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async fetchApplicantMastersQualification(req, res) {
    try {
      const { formId } = req.params;
      const applicant = parseInt(req.user.id, 10);

      const result =
        await applicantMastersQualificationService.findAllApplicantMastersQualifications(
          {
            where: {
              form_id: formId,
              applicant_id: applicant,
            },
            ...getApplicantMastersQualificationAttributes(),
          }
        );

      http.setSuccess(200, 'Applicant Masters Qualification fetch successful', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to get this Applicant Masters Qualification', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

const getApplicantMastersQualificationAttributes = function () {
  return {
    // include: ['applicant'],
  };
};

module.exports = ApplicantMastersQualificationController;
