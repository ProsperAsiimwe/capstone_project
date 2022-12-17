const { HttpResponse } = require('@helpers');
const {
  applicantBioDataService,
  runningAdmissionApplicantService,
  applicantService,
} = require('@services/index');
const { isEmpty, toUpper } = require('lodash');
const model = require('@models');
const {
  checkRunningAdmissionExpiry,
  // checkRunningAdmissionMaximumNumberOfFormsConstraint,
} = require('../Helpers/runningAdmissionApplicantHelper');
const { generateAdmissionFormId } = require('../Helpers/admissionsHelper');
const { createAdmissionLog } = require('../Helpers/logsHelper');

const http = new HttpResponse();

class ApplicantBioDataController {
  /**
   * GET All applicantBioData.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async index(req, res) {
    try {
      const applicantBioData =
        await applicantBioDataService.findAllApplicantBioData({
          ...getApplicantBioDataAttributes(),
        });

      http.setSuccess(200, 'Applicant Bio Data Fetched Successfully', {
        applicantBioData,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Applicant Bio Data', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * CREATE New ApplicantBioData Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async createApplicantBioData(req, res) {
    try {
      const data = req.body;
      const { id, surname, other_names: otherNames } = req.user;

      data.applicant_id = parseInt(id, 10);

      const formId =
        data.form_id && data.form_id.includes('APF')
          ? data.form_id
          : await generateAdmissionFormId(data.running_admission_id, id);

      data.form_id = formId;

      data.surname = toUpper(surname);
      data.other_names = toUpper(otherNames);
      data.district_of_origin = data.district_of_origin.toUpperCase();
      data.gender = data.gender.toUpperCase();
      data.religion = data.religion.toUpperCase();
      data.marital_status = data.marital_status.toUpperCase();
      data.nationality = data.nationality.toUpperCase();
      data.place_of_residence = data.place_of_residence.toUpperCase();
      data.district_of_birth = data.district_of_birth.toUpperCase();

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
          const result = await applicantBioDataService.createApplicantBioData(
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

      http.setSuccess(201, 'Your Bio Data has been saved successfully', {
        data: response,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to create this Applicant Bio Data.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * UPDATE Specific ApplicantBioData Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async updateApplicantBioData(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      const { id: applicantId, surname, other_names: otherNames } = req.user;

      data.surname = toUpper(surname);
      data.other_names = toUpper(otherNames);

      const findForm = await applicantBioDataService.findOneApplicantBioData({
        where: {
          id,
          applicant_id: applicantId,
        },
        raw: true,
      });

      await checkRunningAdmissionExpiry(findForm.running_admission_id);

      const applicantBioData = await model.sequelize.transaction(
        async (transaction) => {
          const updateApplicantBioData =
            await applicantBioDataService.updateApplicantBioData(
              id,
              data,
              transaction
            );
          const applicantBioData = updateApplicantBioData[1][0];

          return applicantBioData;
        }
      );

      http.setSuccess(200, 'Applicant Bio Data Updated Successfully', {
        data: applicantBioData,
      });
      if (isEmpty(applicantBioData))
        http.setError(404, 'Applicant Bio Data Data Not Found');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Update This Applicant Bio Data', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * UPDATE Specific ApplicantBioData Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async updateApplicantBioDataByStaff(req, res) {
    try {
      const { applicantId } = req.params;
      const { id: user, remember_token: rememberToken } = req.user;
      const data = req.body;

      data.surname = toUpper(data.surname);
      data.surname = toUpper(data.surname);
      data.other_names = toUpper(data.other_names);
      data.other_names = toUpper(data.other_names);

      const applicant = await model.sequelize.transaction(
        async (transaction) => {
          const updateApplicant = await applicantService.updateApplicant(
            applicantId,
            data,
            transaction
          );

          const allBioData =
            await applicantBioDataService.findAllApplicantBioData({
              where: {
                applicant_id: applicantId,
              },
              raw: true,
            });

          if (!isEmpty(allBioData)) {
            for (const item of allBioData) {
              await applicantBioDataService.updateApplicantBioData(
                item.id,
                data,
                transaction
              );
            }
          }

          await createAdmissionLog(
            {
              user_id: user,
              operation: `UPDATE`,
              area_accessed: `MANAGE APPLICANT BOI DATA`,
              current_data: `Updated Applicant's Bio Data Records for the applicant of id: ${applicantId}) To First name: ${
                data.surname
              }, Other Names: ${data.other_names}, Phone: ${
                data.phone
              }, Email: ${data.email}, ${
                data.gender ? `Gender: ${data.gender}` : ``
              }.`,
              ip_address: req.connection.remoteAddress,
              user_agent: req.get('user-agent'),
              token: rememberToken,
            },
            transaction
          );

          return updateApplicant;
        }
      );

      http.setSuccess(200, 'Applicant Bio Data Updated Successfully', {
        data: applicant,
      });
      if (isEmpty(applicant))
        http.setError(404, 'Applicant Bio Data Data Not Found');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Update This Applicant Bio Data', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Get Specific ApplicantBioData Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async fetchApplicantBioData(req, res) {
    try {
      const { formId } = req.params;
      const applicant = parseInt(req.user.id, 10);
      const data = await applicantBioDataService.findOneApplicantBioData({
        where: {
          form_id: formId,
          applicant_id: applicant,
        },
        ...getApplicantBioDataAttributes(),
      });

      http.setSuccess(200, 'Applicant Bio Data fetch successful', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to get this Applicant Bio Data', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

const getApplicantBioDataAttributes = function () {
  return {
    include: [
      {
        association: 'applicant',
        attributes: [],
      },
      {
        association: 'salutation',
        attributes: ['id', 'metadata_value'],
      },
    ],
  };
};

module.exports = ApplicantBioDataController;
