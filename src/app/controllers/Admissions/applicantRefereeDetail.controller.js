const { HttpResponse } = require('@helpers');
const {
  applicantRefereeDetailService,
  runningAdmissionApplicantService,
} = require('@services/index');
const { isEmpty } = require('lodash');
const model = require('@models');

const {
  checkRunningAdmissionExpiry,
  //  checkRunningAdmissionMaximumNumberOfFormsConstraint,
} = require('../Helpers/runningAdmissionApplicantHelper');

const { generateAdmissionFormId } = require('../Helpers/admissionsHelper');

const http = new HttpResponse();

class ApplicantRefereeDetailController {
  /**
   * GET All applicantRefereeDetails.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async index(req, res) {
    try {
      const applicantRefereeDetails =
        await applicantRefereeDetailService.findAllApplicantRefereeDetails({
          ...getApplicantRefereeDetailAttributes(),
        });

      http.setSuccess(200, 'Applicant Referee Details Fetched Successfully', {
        applicantRefereeDetails,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Applicant Referee Details', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * CREATE New ApplicantRefereeDetail Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async createApplicantRefereeDetail(req, res) {
    try {
      const data = req.body;
      const { id } = req.user;

      data.applicant_id = parseInt(id, 10);

      data.form_id =
        data.form_id && data.form_id.includes('APF')
          ? data.form_id
          : await generateAdmissionFormId(data.running_admission_id, id);

      const refereeDetails = data;

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
            await applicantRefereeDetailService.createApplicantRefereeDetail(
              refereeDetails,
              transaction
            );

          await runningAdmissionApplicantService.createRunningAdmissionApplicant(
            runningAdmissionApplicantSection,
            transaction
          );

          return result;
        }
      );

      http.setSuccess(201, 'Referee Detail added', { data: response });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to add this Referee Detail.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * UPDATE Specific ApplicantRefereeDetail Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async updateApplicantRefereeDetail(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      const findForm =
        await applicantRefereeDetailService.findOneApplicantRefereeDetail({
          where: {
            id,
          },
          raw: true,
        });

      await checkRunningAdmissionExpiry(findForm.running_admission_id);

      const updateApplicantRefereeDetail =
        await applicantRefereeDetailService.updateApplicantRefereeDetail(
          id,
          data
        );
      const applicantRefereeDetail = updateApplicantRefereeDetail[1][0];

      http.setSuccess(200, 'Referee Detail Updated', {
        data: applicantRefereeDetail,
      });
      if (isEmpty(applicantRefereeDetail))
        http.setError(404, 'Referee Detail Not Found');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to update this referee detail', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * UPDATE Specific ApplicantRefereeDetail Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async deleteApplicantRefereeDetail(req, res) {
    try {
      const { id } = req.params;
      const applicantId = req.user.id;
      const deleteResponse =
        await applicantRefereeDetailService.deleteApplicantRefereeDetail({
          id,
          applicant_id: applicantId,
        });

      http.setSuccess(200, 'Referee Detail Deleted', {
        data: deleteResponse,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to delete this referee detail', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Get Specific ApplicantRefereeDetail Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async fetchApplicantRefereeDetail(req, res) {
    try {
      const { form_id: formId } = req.params;
      const applicant = parseInt(req.user.id, 10);
      const data =
        await applicantRefereeDetailService.findAllApplicantRefereeDetails({
          where: {
            form_id: formId,
            applicant_id: applicant,
          },
          ...getApplicantRefereeDetailAttributes(),
        });

      http.setSuccess(200, 'Applicant Referee Details fetched successfully', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to get this Applicant Referee Details', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

const getApplicantRefereeDetailAttributes = function () {
  return {
    include: [
      {
        association: 'applicant',
        attributes: [],
      },
    ],
  };
};

module.exports = ApplicantRefereeDetailController;
