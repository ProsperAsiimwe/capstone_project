const { HttpResponse } = require('@helpers');
const {
  applicantNextOfKinService,
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

class ApplicantNextOfKinController {
  /**
   * GET All applicantNextOfKins.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async index(req, res) {
    try {
      const applicantNextOfKins =
        await applicantNextOfKinService.findAllApplicantNextOfKins({
          ...getApplicantNextOfKinAttributes(),
        });

      http.setSuccess(200, 'Applicant Next Of Kins Fetched Successfully', {
        applicantNextOfKins,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Applicant Next Of Kins', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * CREATE New ApplicantNextOfKin Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async createApplicantNextOfKin(req, res) {
    try {
      const data = req.body;
      const { id } = req.user;

      data.applicant_id = parseInt(id, 10);
      data.form_id =
        data.form_id && data.form_id.includes('APF')
          ? data.form_id
          : await generateAdmissionFormId(data.running_admission_id, id);

      data.next_of_kin_name = data.next_of_kin_name.toUpperCase();
      data.next_of_kin_relationship =
        data.next_of_kin_relationship.toUpperCase();

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
            await applicantNextOfKinService.createApplicantNextOfKin(
              data,
              transaction
            );

          if (result[1] === true) {
            await runningAdmissionApplicantService.createRunningAdmissionApplicant(
              runningAdmissionApplicantSection,
              transaction
            );
          }

          return result[0];
        }
      );

      http.setSuccess(201, 'Applicant Next Of Kin created successfully', {
        data: response,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to create this Applicant Next Of Kin.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * UPDATE Specific ApplicantNextOfKin Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async updateApplicantNextOfKin(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      const findForm =
        await applicantNextOfKinService.findOneApplicantNextOfKin({
          where: {
            id,
          },
          raw: true,
        });

      await checkRunningAdmissionExpiry(findForm.running_admission_id);

      const updateApplicantNextOfKin =
        await applicantNextOfKinService.updateApplicantNextOfKin(id, data);
      const applicantNextOfKin = updateApplicantNextOfKin[1][0];

      http.setSuccess(200, 'Applicant Next Of Kin Updated Successfully', {
        data: applicantNextOfKin,
      });
      if (isEmpty(applicantNextOfKin))
        http.setError(404, 'Applicant Next Of Kin Data Not Found');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Update This Applicant Next Of Kin', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Get Specific ApplicantNextOfKin Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async fetchApplicantNextOfKin(req, res) {
    try {
      const { formId } = req.params;
      const applicant = parseInt(req.user.id, 10);
      const data = await applicantNextOfKinService.findOneApplicantNextOfKin({
        where: {
          form_id: formId,
          applicant_id: applicant,
        },
        ...getApplicantNextOfKinAttributes(),
      });

      http.setSuccess(200, 'Applicant Next Of Kin fetch successful', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to get this Applicant Next Of Kin', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

const getApplicantNextOfKinAttributes = function () {
  return {
    include: [
      {
        association: 'applicant',
        attributes: [],
      },
    ],
  };
};

module.exports = ApplicantNextOfKinController;
