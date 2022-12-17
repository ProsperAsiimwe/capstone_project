const { HttpResponse } = require('@helpers');
const {
  applicantBachelorsQualificationService,
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

class ApplicantBachelorsQualificationController {
  /**
   * GET All applicantBachelorsQualifications.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async index(req, res) {
    try {
      const result =
        await applicantBachelorsQualificationService.findAllApplicantBachelorsQualifications(
          {
            ...getApplicantBachelorsQualificationAttributes(),
          }
        );

      http.setSuccess(
        200,
        'Applicant Bachelors Qualifications Fetched Successfully',
        {
          data: result,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Applicant Bachelors Qualifications', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * CREATE New ApplicantBachelorsQualification Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async createApplicantBachelorsQualification(req, res) {
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
            await applicantBachelorsQualificationService.createApplicantBachelorsQualification(
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
        'Unable to create this Applicant Bachelors Qualification.'
      );

      return http.send(res);
    }
  }

  /**
   * UPDATE Specific ApplicantBachelorsQualification Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async updateApplicantBachelorsQualification(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      const findForm =
        await applicantBachelorsQualificationService.findOneApplicantBachelorsQualification(
          {
            where: {
              id,
            },
            raw: true,
          }
        );

      await checkRunningAdmissionExpiry(findForm.running_admission_id);

      const updateResponse =
        await applicantBachelorsQualificationService.updateApplicantBachelorsQualification(
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
   * DELETE Specific ApplicantBachelorsQualification Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async deleteApplicantBachelorsQualification(req, res) {
    try {
      const { id } = req.params;
      const applicantId = req.user.id;

      const deleteResponse =
        await applicantBachelorsQualificationService.deleteApplicantBachelorsQualification(
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
   * Get Specific ApplicantBachelorsQualification Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async fetchApplicantBachelorsQualification(req, res) {
    try {
      const { formId } = req.params;
      const applicant = parseInt(req.user.id, 10);

      const result =
        await applicantBachelorsQualificationService.findAllApplicantBachelorsQualifications(
          {
            where: {
              form_id: formId,
              applicant_id: applicant,
            },
            ...getApplicantBachelorsQualificationAttributes(),
          }
        );

      http.setSuccess(
        200,
        'Applicant Bachelors Qualification fetch successful',
        {
          data: result,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable to get this Applicant Bachelors Qualification',
        {
          error: { message: error.message },
        }
      );

      return http.send(res);
    }
  }
}

const getApplicantBachelorsQualificationAttributes = function () {
  return {
    //  include: ['applicant'],
  };
};

module.exports = ApplicantBachelorsQualificationController;
