const { isEmpty, toUpper } = require('lodash');
const { Op } = require('sequelize');
const { applicantService } = require('@services/index');
const { HttpResponse } = require('@helpers');
const AdmittedApplicantService = require('@services/Admissions/admittedApplicant.service');
const fs = require('fs');
const path = require('path');
const { appConfig } = require('@root/config');
const http = new HttpResponse();

class ApplicantController {
  // index function to show applicants
  /**
   *
   * @param {*} req
   * @param {*} res
   */
  async getAllApplicants(req, res) {
    try {
      const applicants = await applicantService.findAllApplicants();

      http.setSuccess(200, 'Applicants fetch successful', {
        applicants,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to fetch applicants', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  async findOneApplicant(req, res) {
    try {
      const { id } = req.params;
      const applicant = await applicantService.findOneApplicant({
        where: { id },
      });

      http.setSuccess(200, 'Applicant fetch successful', { applicant });
      if (isEmpty(applicant)) http.setError(404, 'Applicant Data Not Found.');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to get this Applicant.', {
        error: { error: error.message },
      });

      return http.send(res);
    }
  }

  async getApplicantAdmissions(req, res) {
    try {
      const { user } = req;

      const findAdmissions =
        await AdmittedApplicantService.findAllAdmittedApplicants({
          where: {
            // surname: {
            //   [Op.or]: [
            //     toUpper(user.surname).trim(),
            //     toUpper(user.other_names).trim(),
            //   ],
            // },
            surname: {
              [Op.or]: [
                toUpper(user.other_names).trim(),
                toUpper(user.surname).trim(),
              ],
            },
            email: user.email,
            // phone: user.phone,
          },
          attributes: [
            'registration_number',
            'student_number',
            'provisional_admission_letter',
            'surname',
            'other_names',
            'is_administratively_admitted',
            'id',
            'campus_id',
          ],
          ...applicantAdmissionAttributes(),
        });

      http.setSuccess(200, 'Admission History', {
        data: findAdmissions,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, "Unable Fetch Applicant's Forms.", {
        error: { error: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * DOWNLOAD ADMISSION LETTER
   *
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async downloadApplicantAdmissionLetter(req, res) {
    try {
      const { formId } = req.params;

      const findAdmission =
        await AdmittedApplicantService.findOneAdmittedApplicant({
          where: { id: formId },
          plain: true,
        });

      const admissionLetterPath = path.join(
        appConfig.ASSETS_ROOT_DIRECTORY,
        'documents/admissions/letters'
      );
      const admissionPrintPath = `${admissionLetterPath}/prints`;

      if (!fs.existsSync(admissionPrintPath)) {
        fs.mkdirSync(admissionPrintPath);
      }

      if (
        !isEmpty(findAdmission) &&
        findAdmission.provisional_admission_letter
      ) {
        const documentPath = `${admissionLetterPath}/${findAdmission.provisional_admission_letter}`;

        if (!fs.existsSync(documentPath)) {
          throw new Error(
            `Your Provisional Admission letter is not found, Please contact your Academic Registrar for help!`
          );
        }

        res.download(documentPath);
      } else {
        throw new Error(
          `Your Provisional Admission letter has not been generated, Please contact your Academic Registrar for help!`
        );
      }
    } catch (error) {
      http.setError(400, 'Unable to print Admission letters', {
        error: error.message,
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   * Function to fetch all forms filled by an applicant
   */
  async fetchAllApplicantForms(req, res) {
    try {
      const { id } = req.user;

      const forms = await applicantService.fetchAllApplicantForms({
        where: {
          applicant_id: parseInt(id, 10),
        },
        order: [['created_at', 'desc']],
        ...getRunningAdmissionApplicantAttributes(),
      });

      const applicantForms = [];

      for (const applicantForm of forms) {
        const applicantData = applicantForm.dataValues;
        const admissionStatus = await applicantService.applicantAdmissionStatus(
          {
            form_id: applicantData.form_id,
          }
        );

        applicantForms.push({
          ...applicantData,
          is_admitted: !isEmpty(admissionStatus),
          admissionStatus,
        });
      }

      http.setSuccess(200, "Applicant's Forms Fetched Successfully", {
        data: applicantForms,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, "Unable Fetch Applicant's Forms.", {
        error: { error: error.message },
      });

      return http.send(res);
    }
  }
}

const getRunningAdmissionApplicantAttributes = () => ({
  include: [
    {
      association: 'sections',
      attributes: ['id', 'metadata_value'],
      through: {
        attributes: [],
      },
    },
    {
      association: 'paymentMethod',
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
          'delete_approval_status',
          'delete_approval_date',
          'delete_approved_by_id',
          'deleted_by_id',
          'last_update_approval_status',
          'last_update_approval_date',
          'last_update_approved_by_id',
          'last_updated_by_id',
          'create_approval_status',
          'create_approval_date',
          'create_approved_by_id',
          'created_by_id',
          'activate_admission_fees',
          'admission_scheme_id',
          'intake_id',
          'international_currency_id',
          'degree_category_id',
          'academic_year_id',
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
              separate: true,
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
              separate: true,
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
});

const applicantAdmissionAttributes = () => ({
  include: [
    {
      association: 'programme',
      attributes: ['programme_title', 'programme_code'],
    },
    {
      association: 'programmeAlias',
      attributes: ['alias_code'],
    },
    {
      association: 'degree',
      attributes: ['metadata_value'],
    },
    {
      association: 'admissionScheme',
      attributes: ['scheme_name'],
    },
    {
      association: 'intake',
      attributes: ['metadata_value'],
    },
    {
      association: 'sponsor',
    },
    {
      association: 'entryAcademicYear',
      attributes: ['metadata_value'],
    },
    {
      association: 'campus',
      attributes: ['metadata_value'],
    },
  ],
});

module.exports = ApplicantController;
