const { HttpResponse } = require('@helpers');
const {
  applicantProgrammeChoiceService,
  runningAdmissionApplicantService,
} = require('@services/index');
const { isEmpty } = require('lodash');
const model = require('@models');
const {
  checkRunningAdmissionExpiry,
  checkRunningAdmissionMaximumNumberOfChoicesConstraint,
  // checkRunningAdmissionMaximumNumberOfFormsConstraint,
} = require('../Helpers/runningAdmissionApplicantHelper');
const { createAdmissionLog } = require('../Helpers/logsHelper');

const { generateAdmissionFormId } = require('../Helpers/admissionsHelper');

const http = new HttpResponse();

class ApplicantProgrammeChoiceController {
  /**
   * GET All applicantProgrammeChoices.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async index(req, res) {
    try {
      const applicantProgrammeChoices =
        await applicantProgrammeChoiceService.findAllApplicantProgrammeChoices({
          ...getApplicantProgrammeChoiceAttributes(),
        });

      http.setSuccess(200, 'Applicant Programme Choices Fetched Successfully', {
        applicantProgrammeChoices,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Applicant Programme Choices', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * CREATE New ApplicantProgrammeChoice Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async createApplicantProgrammeChoice(req, res) {
    try {
      const data = req.body;
      const { id } = req.user;

      data.applicant_id = parseInt(id, 10);

      data.form_id =
        data.form_id && data.form_id.includes('APF')
          ? data.form_id
          : await generateAdmissionFormId(data.running_admission_id, id);

      const programmeChoice = { ...data, applicant_id: id };
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

      await checkRunningAdmissionMaximumNumberOfChoicesConstraint(
        data.running_admission_id,
        data.applicant_id
      );

      const response = await model.sequelize.transaction(
        async (transaction) => {
          const result =
            await applicantProgrammeChoiceService.createApplicantProgrammeChoice(
              programmeChoice,
              transaction
            );

          await runningAdmissionApplicantService.createRunningAdmissionApplicant(
            runningAdmissionApplicantSection,
            transaction
          );

          return result;
        }
      );

      http.setSuccess(201, 'Programme Choice saved', { data: response });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to save this Programme Choice.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * UPDATE Specific ApplicantProgrammeChoice Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async updateApplicantProgrammeChoice(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      const programmeChoiceRecord =
        await applicantProgrammeChoiceService.findOneApplicantProgrammeChoice({
          where: {
            id,
          },
          raw: true,
        });

      if (!programmeChoiceRecord) {
        throw new Error(`Unable To Find Programme Choice Record Specified.`);
      }

      if (
        data.running_admission_id &&
        parseInt(data.running_admission_id, 10) !==
          parseInt(programmeChoiceRecord.running_admission_id, 10)
      ) {
        throw new Error(
          `The Running Admission Specified Does not Match The One Of Your Programme Choice Record.`
        );
      }

      await checkRunningAdmissionExpiry(
        programmeChoiceRecord.running_admission_id
      );

      const updateResponse = await model.sequelize.transaction(
        async (transaction) => {
          const record =
            await applicantProgrammeChoiceService.updateApplicantProgrammeChoice(
              { id, applicant_id: req.user.id, form_id: data.form_id },
              data,
              transaction
            );

          return record[1][0];
        }
      );

      http.setSuccess(200, 'Programme Choice updated', {
        data: updateResponse,
      });
      if (isEmpty(updateResponse))
        http.setError(404, 'Invalid Programme Choice selected');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To update this Programme Choice', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * UPDATE Specific ApplicantProgrammeChoice Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async updateApplicantProgrammeChoiceByStaff(req, res) {
    try {
      const { programmeChoiceId } = req.params;
      const { id: user, remember_token: rememberToken } = req.user;
      const data = req.body;

      const programmeChoiceRecord = await applicantProgrammeChoiceService
        .findOneApplicantProgrammeChoice({
          where: {
            id: programmeChoiceId,
          },
          ...getApplicantProgrammeChoiceAttributes(),
          nest: true,
        })
        .then(function (res) {
          if (res) {
            const result = res.toJSON();

            return result;
          }
        });

      if (!programmeChoiceRecord) {
        throw new Error(`Unable To Find Programme Choice Record Specified.`);
      }

      if (
        data.running_admission_id &&
        parseInt(data.running_admission_id, 10) !==
          parseInt(programmeChoiceRecord.running_admission_id, 10)
      ) {
        throw new Error(
          `The Running Admission Specified Does not Match The One Of Your Programme Choice Record.`
        );
      }

      const updateResponse = await model.sequelize.transaction(
        async (transaction) => {
          const updateResponse =
            await applicantProgrammeChoiceService.updateApplicantProgrammeChoice(
              {
                id: programmeChoiceId,
                form_id: data.form_id,
              },
              data,
              transaction
            );

          await createAdmissionLog(
            {
              user_id: user,
              operation: `UPDATE`,
              area_accessed: `MANAGE APPLICANT PROGRAMME CHOICES`,
              current_data: `Updated Applicant's Programme Choice record of id: ${programmeChoiceId} for the applicant: id - ${programmeChoiceRecord.applicant.id}, Name - ${programmeChoiceRecord.applicant.surname} ${programmeChoiceRecord.applicant.other_names}.`,
              ip_address: req.connection.remoteAddress,
              user_agent: req.get('user-agent'),
              token: rememberToken,
            },
            transaction
          );

          return updateResponse[1][0];
        }
      );

      http.setSuccess(200, 'Programme Choice updated', {
        data: updateResponse,
      });
      if (isEmpty(updateResponse))
        http.setError(404, 'Invalid Programme Choice selected');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To update this Programme Choice', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Get Specific ApplicantProgrammeChoice Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   *
   */
  async fetchApplicantProgrammeChoice(req, res) {
    try {
      const { formId } = req.params;
      const applicantId = parseInt(req.user.id, 10);

      const context = { form_id: formId, applicant_id: applicantId };

      const data =
        await applicantProgrammeChoiceService.applicantProgrammeChoice(context);

      // const data = await applicantProgrammeChoiceService.applicantProgrammeChoice(
      //   {
      //     where: {
      //       form_id: formId,
      //       applicant_id: 1,
      //     },
      //     ...getApplicantProgrammeChoiceAttributes(),
      //   }
      // );

      http.setSuccess(200, 'Applicant Programme Choice fetch successful', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to get this Applicant Programme Choice', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

const getApplicantProgrammeChoiceAttributes = function () {
  return {
    include: [
      {
        association: 'applicant',
        attributes: ['id', 'surname', 'other_names'],
      },
      {
        association: 'entryStudyYear',
        attributes: ['id', 'metadata_value'],
      },
      {
        association: 'sponsorship',
        attributes: ['id', 'metadata_value'],
      },
      {
        association: 'runningAdmission',
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
        include: [
          {
            association: 'academicYear',
            attributes: ['id', 'metadata_value'],
          },
          {
            association: 'intake',
            attributes: ['id', 'metadata_value'],
          },
          {
            association: 'degreeCategory',
            attributes: ['id', 'metadata_value'],
          },
          {
            association: 'admissionScheme',
            attributes: ['id', 'scheme_name', 'scheme_description'],
          },
          {
            association: 'admissionForm',
            attributes: ['id', 'form_name', 'form_description'],
            include: [
              {
                association: 'sections',
                attributes: ['id', 'metadata_value'],
                through: {
                  attributes: ['section_number'],
                },
              },
            ],
          },
          {
            association: 'applicationFees',
            include: [
              {
                association: 'account',
                attributes: ['account_code', 'account_name'],
              },
              {
                association: 'amounts',
                include: [
                  {
                    association: 'billingCategory',
                    attributes: ['metadata_value'],
                  },
                  {
                    association: 'currency',
                    attributes: ['metadata_value'],
                  },
                ],
              },
            ],
          },
          {
            association: 'admissionFees',
            include: [
              {
                association: 'account',
                attributes: ['account_code', 'account_name'],
              },
              {
                association: 'amounts',
                include: [
                  {
                    association: 'billingCategory',
                    attributes: ['metadata_value'],
                  },
                  {
                    association: 'currency',
                    attributes: ['metadata_value'],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };
};

module.exports = ApplicantProgrammeChoiceController;
