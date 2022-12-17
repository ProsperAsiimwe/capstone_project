const { HttpResponse } = require('@helpers');
const {
  applicantPermanentAddressService,
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

class ApplicantPermanentAddressController {
  /**
   * GET All applicantPermanentAddresses.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async index(req, res) {
    try {
      const applicantPermanentAddresses =
        await applicantPermanentAddressService.findAllApplicantPermanentAddresses(
          {
            ...getApplicantPermanentAddressAttributes(),
          }
        );

      http.setSuccess(
        200,
        'Applicant Permanent Addresses Fetched Successfully',
        {
          applicantPermanentAddresses,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Applicant Permanent Addresses', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * CREATE New ApplicantPermanentAddress Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async createApplicantPermanentAddress(req, res) {
    try {
      const data = req.body;
      const { id } = req.user;

      data.applicant_id = parseInt(id, 10);

      data.form_id =
        data.form_id && data.form_id.includes('APF')
          ? data.form_id
          : await generateAdmissionFormId(data.running_admission_id, id);

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
            await applicantPermanentAddressService.createApplicantPermanentAddress(
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

      http.setSuccess(201, 'Applicant Permanent Address created successfully', {
        data: response,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to create this Applicant Permanent Address.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * UPDATE Specific ApplicantPermanentAddress Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async updateApplicantPermanentAddress(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      const findForm =
        await applicantPermanentAddressService.findOneApplicantPermanentAddress(
          {
            where: {
              id,
            },
            raw: true,
          }
        );

      await checkRunningAdmissionExpiry(findForm.running_admission_id);

      const updateApplicantPermanentAddress =
        await applicantPermanentAddressService.updateApplicantPermanentAddress(
          id,
          data
        );
      const applicantPermanentAddress = updateApplicantPermanentAddress[1][0];

      http.setSuccess(200, 'Applicant Permanent Address Updated Successfully', {
        data: applicantPermanentAddress,
      });
      if (isEmpty(applicantPermanentAddress))
        http.setError(404, 'Applicant Permanent Address Data Not Found');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Update This Applicant Permanent Address', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Get Specific ApplicantPermanentAddress Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async fetchApplicantPermanentAddress(req, res) {
    try {
      const { formId } = req.params;
      const applicant = parseInt(req.user.id, 10);
      const data =
        await applicantPermanentAddressService.findOneApplicantPermanentAddress(
          {
            where: {
              form_id: formId,
              applicant_id: applicant,
            },
            ...getApplicantPermanentAddressAttributes(),
          }
        );

      http.setSuccess(200, 'Applicant Permanent Address fetch successful', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to get this Applicant Permanent Address', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

const getApplicantPermanentAddressAttributes = function () {
  return {
    include: [
      {
        association: 'applicant',
        attributes: [],
      },
    ],
  };
};

module.exports = ApplicantPermanentAddressController;
