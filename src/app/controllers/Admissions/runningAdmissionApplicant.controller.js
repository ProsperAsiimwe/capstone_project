const { HttpResponse } = require('@helpers');
const UserAgent = require('user-agents');
const {
  runningAdmissionApplicantService,
  runningAdmissionViewsService,
  metadataValueService,
  institutionStructureService,
  admissionSchemeReportsService,
  runningAdmissionService,
  programmeVersionWeightingCriteriaService,
  applicantProgrammeChoiceService,
  runningAdmissionProgrammeService,
  applicantOLevelDataService,
  applicantALevelDataService,
  programmeService,
  admittedApplicantsViewsService,
  runningAdmissionProgrammeCampusService,
  applicantService,
  applicantBioDataService,
  admittedApplicantService,
  programmeVersionService,
  userService,
} = require('@services/index');
const {
  toUpper,
  isEmpty,
  map,
  now,
  flatten,
  trim,
  times,
  isArray,
  includes,
  chain,
  orderBy,
  find,
  parseInt,
  filter,
  replace,
} = require('lodash');
const model = require('@models');
const moment = require('moment');
const { appConfig } = require('../../../config');
const {
  getUNEBReportColumns,
  getMUBSUNEBReportColumns,
  weightedApplicantColumns,
  getKYUDiplomaReportColumns,
  graduateApplicantsColumns,
} = require('./templateColumns');
const excelJs = require('exceljs');
const {
  createPaymentReferenceForApplicants,
} = require('../Helpers/paymentReferenceRecord');
const {
  getMetadataValueId,
  getMetadataValueIdWithoutError,
} = require('../Helpers/programmeHelper');
const {
  downloadApplicationFormPdf,
  displayApplicantFormSections,
  checkRunningAdmissionExpiry,
  billApplicants,
} = require('../Helpers/runningAdmissionApplicantHelper');
const fs = require('fs');
const path = require('path');
const { createAdmissionLog } = require('../Helpers/logsHelper');
const DownloadEvent = require('@events/DownloadEvent');
const {
  admissionReportsFunctions,
} = require('@controllers/Helpers/admissionReportHelper');
const {
  selectionsBasedOnOLevelSubjects,
  weighApplicants,
} = require('@controllers/Helpers/weightingAndSelectionHelper');

const { activityLog, findLocalIpAddress } = require('../Helpers/logsHelper');

const userAgent = new UserAgent();

const iPv4 = findLocalIpAddress();

const http = new HttpResponse();

class RunningAdmissionApplicantController {
  /**
   * GET All runningAdmissionApplicants.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async index(req, res) {
    try {
      const runningAdmissionApplicants =
        await runningAdmissionApplicantService.findAllRunningAdmissionApplicants(
          {
            ...getRunningAdmissionApplicantAttributes(),
          }
        );

      http.setSuccess(
        200,
        'Running Admission Applicants Fetched Successfully',
        {
          runningAdmissionApplicants,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Running Admission Applicants', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async findRunningAdmissionProgrammeApplicantContext(req, res) {
    try {
      const { id } = req.params;
      const programmes =
        await runningAdmissionApplicantService.programmeCampuses(id);

      http.setSuccess(200, 'Programmes fetched successfully', {
        programmes,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to fetch programmes.', {
        error: { error: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * CREATE New RunningAdmissionApplicant Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async createRunningAdmissionApplicant(req, res) {
    try {
      const data = req.body;
      const { id } = req.user;

      data.applicant_id = parseInt(id, 10);

      const formSection = data.form_section_id;

      data.formSections = formSection;

      await checkRunningAdmissionExpiry(data.running_admission_id);

      // await checkRunningAdmissionMaximumNumberOfFormsConstraint(
      //   data.running_admission_id,
      //   data.applicant_id
      // );

      const runningAdmissionApplicant = await model.sequelize.transaction(
        async (transaction) => {
          const result =
            await runningAdmissionApplicantService.createRunningAdmissionApplicant(
              data,
              transaction
            );

          return result;
        }
      );

      http.setSuccess(201, 'Running Admission Applicant created successfully', {
        runningAdmissionApplicant,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to create this Running Admission Applicant.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * CREATE
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async administrativelyAdmitRunningAdmissionApplicant(req, res) {
    try {
      const data = req.body;
      const { id: user } = req.user;

      const metadataValues = await metadataValueService.findAllMetadataValues({
        include: {
          association: 'metadata',
          attributes: ['id', 'metadata_name'],
        },
        attributes: ['id', 'metadata_value'],
      });

      const allVersions =
        await programmeVersionService.findAllProgrammeVersions({
          raw: true,
        });

      const allEntryYears = await programmeService.findAllProgrammeEntryYears({
        raw: true,
      });

      const allProgrammes = await programmeService
        .findAllProgrammes({
          include: [
            {
              association: 'programmeStudyYears',
            },
          ],
        })
        .then((res) => {
          if (res) {
            return res.map((item) => item.get({ plain: true }));
          }
        });

      const findResidenceStatusId = getMetadataValueId(
        metadataValues,
        `RESIDENT`,
        'RESIDENCE STATUSES',
        `ERROR`
      );

      const reult = [];

      const random = Math.floor(Math.random() * moment().unix());
      const generatedBatchNumber = `BATCH${random}`;

      if (!isEmpty(data.applicant_programme_choices)) {
        await model.sequelize.transaction(async (transaction) => {
          for (const choiceId of data.applicant_programme_choices) {
            const admittedData = {};

            const findChoice = await applicantProgrammeChoiceService
              .findOneApplicantProgrammeChoice({
                where: {
                  id: choiceId,
                },
                include: [
                  {
                    association: 'programmeCampus',
                    include: [
                      {
                        association: 'runningAdmissionProgramme',
                        include: [
                          {
                            association: 'programme',
                            attributes: ['id'],
                          },
                        ],
                      },
                    ],
                  },
                ],
                nest: true,
              })
              .then((res) => {
                if (res) {
                  return res.toJSON();
                }
              });

            if (!findChoice) {
              throw new Error(
                `Unable To Find Applicant Programme Choice Record.`
              );
            }

            const findProgramme = allProgrammes.find(
              (prog) =>
                parseInt(prog.id, 10) ===
                parseInt(
                  findChoice.programmeCampus.runningAdmissionProgramme.programme
                    .id,
                  10
                )
            );

            const findCurrentVersion = allVersions.find(
              (version) =>
                version.is_current_version === true &&
                parseInt(version.programme_id, 10) ===
                  parseInt(
                    findChoice.programmeCampus.runningAdmissionProgramme
                      .programme.id,
                    10
                  )
            );

            if (!findCurrentVersion) {
              throw new Error(
                `Unable To Find A Current Programme Version For ${findProgramme.programme_code} ${findProgramme.programme_title}`
              );
            }

            const findRecord = await runningAdmissionApplicantService
              .findOneRunningAdmissionApplicant({
                where: {
                  form_id: trim(findChoice.form_id),
                },
                include: [
                  {
                    association: 'applicant',
                    attributes: [
                      'id',
                      'surname',
                      'other_names',
                      'email',
                      'phone',
                    ],
                  },
                  {
                    association: 'runningAdmission',
                    attributes: [
                      'id',
                      'academic_year_id',
                      'intake_id',
                      'admission_scheme_id',
                      'degree_category_id',
                    ],
                  },
                ],
                nest: true,
              })
              .then((res) => {
                if (res) {
                  return res.toJSON();
                }
              });

            if (!findRecord) {
              throw new Error(`Unable To Find One Of The Applicants Selected.`);
            }

            const findCurrentEntryStudyYear = allEntryYears.find(
              (year) =>
                parseInt(year.entry_year_id, 10) ===
                  parseInt(findChoice.entry_study_year_id, 10) &&
                parseInt(year.programme_id, 10) ===
                  parseInt(
                    findChoice.programmeCampus.runningAdmissionProgramme
                      .programme.id,
                    10
                  )
            );

            if (!findCurrentEntryStudyYear) {
              throw new Error(
                `Unable To Find A Matching Programme Entry Year For Applicant: ${findRecord.applicant.surname} ${findRecord.applicant.other_names} On Programme: ${findProgramme.programme_code} ${findProgramme.programme_title}`
              );
            }

            const findProgrammeStudyYear =
              findProgramme.programmeStudyYears.find(
                (year) =>
                  parseInt(year.programme_study_year_id, 10) ===
                  parseInt(findCurrentEntryStudyYear.entry_year_id, 10)
              );

            if (!findProgrammeStudyYear) {
              throw new Error(
                `Unable To Find A Matching Programme Study Year For Applicant: ${findRecord.applicant.surname} ${findRecord.applicant.other_names} On Programme: ${findProgramme.programme_code} ${findProgramme.programme_title}`
              );
            }

            const findApplicantBioData =
              await applicantBioDataService.findOneApplicantBioData({
                where: {
                  form_id: trim(findChoice.form_id),
                },
                raw: true,
              });

            if (!findApplicantBioData) {
              throw new Error(
                `Unable To Find Applicant's Bio-Data Section With Form-Id ${findChoice.form_id}.`
              );
            }

            const findApplicantALevelData =
              await applicantALevelDataService.findOneApplicantALevelData({
                where: {
                  form_id: trim(findChoice.form_id),
                },
                raw: true,
              });

            let findBillingCategoryId = null;

            if (toUpper(findApplicantBioData.nationality).includes('UGANDA')) {
              findBillingCategoryId = getMetadataValueId(
                metadataValues,
                'UGANDAN',
                'BILLING CATEGORIES'
              );
            } else if (
              toUpper(findApplicantBioData.nationality).includes('KENYA') ||
              toUpper(findApplicantBioData.nationality).includes('TANZANIA') ||
              toUpper(findApplicantBioData.nationality).includes('RWANDA') ||
              toUpper(findApplicantBioData.nationality).includes(
                'SOUTH SUDAN'
              ) ||
              toUpper(findApplicantBioData.nationality).includes('BURUNDI')
            ) {
              findBillingCategoryId = getMetadataValueId(
                metadataValues,
                'EAST-AFRICAN',
                'BILLING CATEGORIES'
              );
            } else {
              const findNonEastAfricanBillingCategoryId =
                getMetadataValueIdWithoutError(
                  metadataValues,
                  'NON EAST-AFRICAN',
                  'BILLING CATEGORIES'
                );

              const findInternationalsBillingCategoryId =
                getMetadataValueIdWithoutError(
                  metadataValues,
                  'INTERNATIONAL',
                  'BILLING CATEGORIES'
                );

              if (findNonEastAfricanBillingCategoryId) {
                findBillingCategoryId = findNonEastAfricanBillingCategoryId;
              } else if (findInternationalsBillingCategoryId) {
                findBillingCategoryId = findInternationalsBillingCategoryId;
              }
            }

            admittedData.running_admission_applicant_id = findRecord.id;
            admittedData.intake_id = findRecord.runningAdmission.intake_id;
            admittedData.entry_academic_year_id =
              findRecord.runningAdmission.academic_year_id;
            admittedData.degree_category_id =
              findRecord.runningAdmission.degree_category_id;
            admittedData.admission_scheme_id =
              findRecord.runningAdmission.admission_scheme_id;
            admittedData.sponsorship_id = findChoice.sponsorship_id;
            admittedData.subject_combination_id =
              findChoice.subject_combination_id;
            admittedData.billing_category_id = findBillingCategoryId;
            admittedData.surname = findRecord.applicant.surname;
            admittedData.other_names = findRecord.applicant.other_names;
            admittedData.gender = toUpper(findApplicantBioData.gender);
            admittedData.nationality = toUpper(
              findApplicantBioData.nationality
            );
            admittedData.phone = findRecord.applicant.phone;
            admittedData.email = findRecord.applicant.email;
            admittedData.date_of_birth = trim(
              findApplicantBioData.date_of_birth
            );
            admittedData.district_of_origin = toUpper(
              findApplicantBioData.district_of_origin
            );
            admittedData.is_administratively_admitted = true;
            admittedData.batch_number = generatedBatchNumber;
            admittedData.a_level_index = findApplicantALevelData
              ? findApplicantALevelData.index_number
              : '';
            admittedData.a_level_year = findApplicantALevelData
              ? findApplicantALevelData.exam_year
              : '';
            admittedData.programme_alias_id = findChoice.programmeCampus
              .programme_alias_id
              ? findChoice.programmeCampus.programme_alias_id
              : null;
            admittedData.campus_id = findChoice.programmeCampus.campus_id;
            admittedData.programme_type_id =
              findChoice.programmeCampus.programme_type_id;
            admittedData.programme_id =
              findChoice.programmeCampus.runningAdmissionProgramme.programme_id;
            admittedData.programme_version_id = findChoice.programmeCampus
              .runningAdmissionProgramme.version_id
              ? findChoice.programmeCampus.runningAdmissionProgramme.version_id
              : findCurrentVersion.id;
            admittedData.entry_study_year_id = findProgrammeStudyYear.id;
            admittedData.residence_status_id = findResidenceStatusId;
            admittedData.created_by_id = user;

            const create =
              await admittedApplicantService.administrativelyAdmitApplicant(
                admittedData,
                transaction
              );

            await activityLog(
              'createAdmissionLog',
              user,
              'MANAGE APPLICANTS',
              'ADMINISTRATIVELY ADMIT APPLICANTS',
              `Applicant: ${findRecord.applicant.surname} ${findRecord.applicant.other_names} On Programme: ${findProgramme.programme_code} ${findProgramme.programme_title}, in batch number: ${generatedBatchNumber}.`,
              `N/A`,
              create[0].dataValues.id,
              `admittedApplicant`,
              `iPv4-${iPv4}, hostIp-${req.ip}`,
              userAgent.data,
              null,
              transaction
            );

            reult.push(create);
          }
        });
      }

      http.setSuccess(
        201,
        'Applicants Administratively Admitted Successfully',
        {
          data: reult,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable tAdministratively Admit Applicants.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async generatePRN(req, res) {
    try {
      const data = req.body;
      const { id: applicantId } = req.user;
      const { formId } = req.params;

      data.applicant_id = applicantId;
      data.formId = formId;

      const prn = await createPaymentReferenceForApplicants(data);

      http.setSuccess(200, 'Payment Reference Number Generated Successfully.', {
        data: prn,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Generate Payment Reference Number.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async generatePRNByStaff(req, res) {
    try {
      const data = req.body;
      const { formId } = req.params;

      data.formId = formId;

      const prn = await createPaymentReferenceForApplicants(data);

      http.setSuccess(200, 'Payment Reference Number Generated Successfully.', {
        data: prn,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Generate Payment Reference Number.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * UPDATE Specific RunningAdmissionApplicant Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async submitApplication(req, res) {
    try {
      const { form_id: formId } = req.params;
      const applicant = req.user;
      const data = {};

      data.application_status = 'COMPLETED';

      data.application_completion_date = moment.now();

      const findRunningAdmissionApplicant =
        await runningAdmissionApplicantService.findOneRunningAdmissionApplicant(
          {
            where: {
              form_id: formId,
              applicant_id: applicant.id,
            },
            raw: true,
          }
        );

      if (!findRunningAdmissionApplicant) {
        throw new Error(
          `Unable To Find An Application Record For The Applicant With Form-Id ${formId}.`
        );
      }

      const billingData = await billApplicants(
        findRunningAdmissionApplicant,
        formId,
        applicant
      );

      data.amount = billingData.amount;
      data.currency = billingData.currency;

      const response = await model.sequelize.transaction(
        async (transaction) => {
          const result =
            await runningAdmissionApplicantService.submitRunningAdmissionApplicantForm(
              formId,
              applicant.id,
              data,
              transaction
            );

          const runningAdmissionApplicant = result[1][0];

          return runningAdmissionApplicant;
        }
      );

      http.setSuccess(200, 'Admission Form Submission Completed Successfully', {
        data: response,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Submit This Admission Form', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Get Specific RunningAdmissionApplicant Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async fetchRunningAdmissionApplicantByRunningAdmissionId(req, res) {
    try {
      const { running_admission_id: runningAdmissionId } = req.params;
      const applicant = parseInt(req.user.id, 10);
      const runningAdmissionApplicant =
        await runningAdmissionApplicantService.findAllRunningAdmissionApplicants(
          {
            where: {
              running_admission_id: runningAdmissionId,
              applicant_id: applicant,
            },
            ...getRunningAdmissionApplicantAttributes(),
          }
        );

      http.setSuccess(200, 'Running Admission Applicant fetch successful', {
        runningAdmissionApplicant,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to get this Running Admission Applicant', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async fetchRunningAdmissionApplicantByFormId(req, res) {
    try {
      const { form_id: formId } = req.params;
      const applicant = parseInt(req.user.id, 10);
      const runningAdmissionApplicant =
        await runningAdmissionApplicantService.findOneRunningAdmissionApplicant(
          {
            where: {
              form_id: formId,
              applicant_id: applicant,
            },
            ...getRunningAdmissionApplicantAttributes(),
          }
        );

      http.setSuccess(200, 'Running Admission Applicant fetch successful', {
        runningAdmissionApplicant,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to get this Running Admission Applicant', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async downloadFilledFormByApplicant(req, res) {
    try {
      const { formId } = req.params;
      const applicant = parseInt(req.user.id, 10);

      const uploadPath = path.join(
        appConfig.ASSETS_ROOT_DIRECTORY,
        'admissions/application-forms'
      );

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true }, (err) => {
          http.setError(400, err.message);

          return http.send(res);

          //  throw new Error(err.message);
        });
      }

      const runningAdmissionApplicant = await runningAdmissionApplicantService
        .findOneRunningAdmissionApplicant({
          where: {
            form_id: formId,
            applicant_id: applicant,
          },
          ...getRunningAdmissionApplicantAttributes(),
          nest: true,
        })
        .then(function (res) {
          if (res) {
            const result = res.toJSON();

            return result;
          }
        });

      if (!runningAdmissionApplicant) {
        throw new Error(`Unable To Find Record.`);
      }

      if (
        runningAdmissionApplicant.application_status.includes('IN-PROGRESS')
      ) {
        throw new Error(`Please Complete Filling Your Form.`);
      }

      const structure =
        await institutionStructureService.findInstitutionStructureRecords({
          attributes: [
            'id',
            'institution_name',
            'institution_address',
            'institution_slogan',
            'institution_website',
            'institution_logo',
            'institution_email',
            'telephone_1',
            'telephone_2',
            'academic_units',
          ],
          raw: true,
        });

      if (!structure) {
        throw new Error(`Unable To Get Institution Structure Records.`);
      }

      const logoDirectory = path.join(appConfig.ASSETS_ROOT_DIRECTORY, 'logo');

      let institutionLogo = `${logoDirectory}/${structure.institution_logo}`;

      if (!fs.existsSync(institutionLogo)) {
        institutionLogo = `${logoDirectory}/default.png`;
        if (!fs.existsSync(institutionLogo)) institutionLogo = null;
      }

      const response = await downloadApplicationFormPdf(
        runningAdmissionApplicant.sections,
        formId,
        applicant,
        structure.institution_name,
        structure.institution_slogan,
        structure.institution_address,
        structure.institution_website,
        structure.institution_email,
        structure.telephone_1,
        structure.telephone_2,
        institutionLogo,
        runningAdmissionApplicant.runningAdmission.academicYear.metadata_value,
        runningAdmissionApplicant.runningAdmission.intake.metadata_value,
        runningAdmissionApplicant.runningAdmission.degreeCategory
          .metadata_value,
        runningAdmissionApplicant.runningAdmission.admissionScheme.scheme_name,
        runningAdmissionApplicant.amount,
        runningAdmissionApplicant.currency,
        runningAdmissionApplicant.payment_status,
        runningAdmissionApplicant.runningAdmission.admission_description,
        runningAdmissionApplicant.applicant,
        runningAdmissionApplicant.ura_prn
      );

      response.stream.on('finish', function () {
        const file = response.docPath;

        res.download(file);
      });
    } catch (error) {
      http.setError(400, 'Unable Download Application Form.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async downloadFilledFormByStaff(req, res) {
    try {
      const { formId } = req.params;

      const uploadPath = path.join(
        appConfig.ASSETS_ROOT_DIRECTORY,
        'admissions/application-forms'
      );

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true }, (err) => {
          http.setError(400, err.message);

          return http.send(res);

          //  throw new Error(err.message);
        });
      }

      const runningAdmissionApplicant = await runningAdmissionApplicantService
        .findOneRunningAdmissionApplicant({
          where: {
            form_id: formId,
          },
          ...getRunningAdmissionApplicantAttributes(),
          nest: true,
        })
        .then(function (res) {
          if (res) {
            const result = res.toJSON();

            return result;
          }
        });

      if (!runningAdmissionApplicant) {
        throw new Error(`Unable To Find Record.`);
      }

      if (
        runningAdmissionApplicant.application_status.includes('IN-PROGRESS')
      ) {
        throw new Error(`Applicant Has Not Finished Filling In Their Form.`);
      }

      const structure =
        await institutionStructureService.findInstitutionStructureRecords({
          attributes: [
            'id',
            'institution_name',
            'institution_address',
            'institution_slogan',
            'institution_website',
            'institution_logo',
            'institution_email',
            'telephone_1',
            'telephone_2',
            'academic_units',
          ],
          raw: true,
        });

      if (!structure) {
        throw new Error(`Unable To Get Institution Structure Records.`);
      }

      const logoDirectory = path.join(appConfig.ASSETS_ROOT_DIRECTORY, 'logo');

      let institutionLogo = `${logoDirectory}/${structure.institution_logo}`;

      if (!fs.existsSync(institutionLogo)) {
        institutionLogo = `${logoDirectory}/default.png`;
        if (!fs.existsSync(institutionLogo)) institutionLogo = null;
      }

      const response = await downloadApplicationFormPdf(
        runningAdmissionApplicant.sections,
        formId,
        runningAdmissionApplicant.applicant_id,
        structure.institution_name,
        structure.institution_slogan,
        structure.institution_address,
        structure.institution_website,
        structure.institution_email,
        structure.telephone_1,
        structure.telephone_2,
        institutionLogo,
        runningAdmissionApplicant.runningAdmission.academicYear.metadata_value,
        runningAdmissionApplicant.runningAdmission.intake.metadata_value,
        runningAdmissionApplicant.runningAdmission.degreeCategory
          .metadata_value,
        runningAdmissionApplicant.runningAdmission.admissionScheme.scheme_name,
        runningAdmissionApplicant.amount,
        runningAdmissionApplicant.currency,
        runningAdmissionApplicant.payment_status,
        runningAdmissionApplicant.runningAdmission.admission_description,
        runningAdmissionApplicant.applicant,
        runningAdmissionApplicant.ura_prn
      );

      response.stream.on('finish', function () {
        const file = response.docPath;

        res.download(file);
      });
    } catch (error) {
      http.setError(400, 'Unable Download Application Form.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async fetchApplicantFormByStaff(req, res) {
    try {
      const { formId } = req.params;

      const data = await displayApplicantFormSections(formId, null);

      http.setSuccess(200, 'Applicant Form Data Fetched Successfully', {
        data: data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Applicant Form Data.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async fetchApplicantFormByApplicant(req, res) {
    try {
      const { formId } = req.params;
      const applicant = parseInt(req.user.id, 10);

      const data = await displayApplicantFormSections(formId, applicant);

      http.setSuccess(200, 'Applicant Form Data Fetched Successfully', {
        data: data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Applicant Form Data.', {
        error: { message: error.message },
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

      let { category } = req.query;

      let type = 'Original';

      if (category === 'original') {
        category = 'admission_letter';
      } else {
        category = 'provisional_admission_letter';
        type = 'Provisional';
      }

      const admissionLetterPath = path.join(
        appConfig.ASSETS_ROOT_DIRECTORY,
        'documents/admissions/letters'
      );
      const admissionPrintPath = `${admissionLetterPath}/prints`;

      if (!fs.existsSync(admissionPrintPath)) {
        fs.mkdirSync(admissionPrintPath);
      }

      const applicant = await applicantService.applicantAdmissionStatus({
        form_id: formId,
      });

      if (!isEmpty(applicant) && applicant[category]) {
        const documentPath = `${admissionLetterPath}/${applicant[category]}`;

        res.download(documentPath);
      } else {
        throw new Error(
          `Your ${type} Admission letter has not been printed, Please contact your Academic Registrar for help!`
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
   * Fetch all applicants by programme so that we can admit them
   *
   */
  async fetchAllApplicantsByProgramme(req, res) {
    try {
      const { programme_campus_id: programmeCampusId } = req.params;
      const data =
        await runningAdmissionApplicantService.fetchAllApplicantsByProgramme({
          where: {
            programme_campus_id: programmeCampusId,
          },
          ...getApplicantsByProgrammeAttributes(),
        });

      http.setSuccess(200, 'Applicants fetch successful', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to get these Applicants', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  // find running admission programme campus applicants
  async programmeCampusApplicants(req, res) {
    try {
      if (!req.params.programme_campus_id) {
        throw new Error('Invalid Context Provided');
      }
      const context = req.params;
      const data = await runningAdmissionViewsService.programmeCampusApplicants(
        context
      );

      http.setSuccess(200, 'Programme Campus Applicants fetched successfully', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to get fetch Programme Campus Applicants.', {
        error: { error: error.message },
      });

      return http.send(res);
    }
  }

  //

  /**
   * DOWNLOAD REPORT BASED ON PROGRAMME CAMPUS
   *
   * @param {*} req
   * @param {*} res
   * @returns
   */
  downloadCapacitySettingApplicants(req, res) {
    try {
      const { programmeCampusId } = req.params;

      req.body = { ...req.body, programme_campus_id: programmeCampusId };
      getUNEBReport(req, res, 'programme-campus');
    } catch (error) {
      http.setError(400, 'Unable To Download Applicants.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  // graduateProgrammeAdmissions
  async graduateProgrammeAdmissions(req, res) {
    try {
      if (!req.params.programmeCampusId) {
        throw new Error('Invalid Context Provided');
      }
      const { id: user, surname, other_names: otherNames } = req.user;

      const { programmeCampusId } = req.params;

      req.body = { ...req.body, programme_campus_id: programmeCampusId };

      const context = req.body;

      const institutionStructure =
        await institutionStructureService.findInstitutionStructureRecords({
          attributes: ['institution_name', 'institution_logo'],
        });

      if (!institutionStructure) {
        throw new Error('Unable To Find Institution Structure.');
      }

      const findRunningAdmission = await runningAdmissionService
        .findOneRunningAdmission({
          where: {
            academic_year_id: context.academic_year_id,
            intake_id: context.intake_id,
            admission_scheme_id: context.admission_scheme_id,
            degree_category_id: context.degree_category_id,
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
          ],
          nest: true,
        })
        .then(function (res) {
          if (res) {
            const result = res.toJSON();

            return result;
          }
        });

      if (!findRunningAdmission) {
        throw new Error(`Unable To Find Running Admission record.`);
      }

      const data =
        await admissionSchemeReportsService.graduateProgrammeAdmissions(
          context
        );

      if (isEmpty(data)) {
        throw new Error(`No applicant Records.`);
      }

      const academicUnit =
        await admissionSchemeReportsService.programmeByProgCampus(context);
      const workbook = new excelJs.Workbook();
      const admissionWorkSheet = workbook.addWorksheet('APPLICANTS');

      const titleCell = admissionWorkSheet.getCell('A1');
      const generatedAt = moment(moment.now()).format('Do MMM, YYYY');
      const headerRow = admissionWorkSheet.getRow(4);

      admissionWorkSheet.mergeCells('A1', 'L1');
      admissionWorkSheet.mergeCells('A2', 'B2');
      admissionWorkSheet.mergeCells('A3', 'D3');

      admissionWorkSheet.getRow(1).height = 100;

      titleCell.value = `${
        toUpper(institutionStructure.institution_name) || 'ACMIS'
      }\n OFFICE OF THE ACADEMIC REGISTRAR\n${academicUnit.faculty_title}(${
        academicUnit.faculty_code
      }) \n Applicants For POSTGRADUATE-AND-TAUGHT-PhDs\n ${
        findRunningAdmission.intake.metadata_value
      } INTAKE (${findRunningAdmission.academicYear.metadata_value})`;

      titleCell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
      };
      titleCell.font = { bold: true, size: 15, name: 'Arial' };

      admissionWorkSheet.getCell('A2').value = `DATE GENERATED: ${generatedAt}`;
      admissionWorkSheet.getCell('A2').font = {
        bold: false,
        size: 10,
        name: 'Arial',
      };

      admissionWorkSheet.getRow(3).height = 30;

      admissionWorkSheet.getCell(
        'A3'
      ).value = `${academicUnit.programme_title}(${academicUnit.programme_code})`;
      admissionWorkSheet.getCell('A3').font = {
        bold: true,
        size: 15,
        name: 'Arial',
      };

      // graduateApplicantsColumns
      admissionWorkSheet.getRow(4).height = 20;

      headerRow.values = map(graduateApplicantsColumns, 'header');
      headerRow.font = { bold: true, size: 11, color: '#2c3e50' };
      admissionWorkSheet.columns = graduateApplicantsColumns.map((column) => {
        delete column.header;

        return column;
      });

      admissionWorkSheet.views = [
        {
          state: 'frozen',
          xSplit: 0,
          ySplit: 4,
          topLeftCell: 'G10',
          activeCell: 'A1',
        },
      ];

      const templateData = [];

      for (const i of data) {
        let awardObtained = '';

        let awardClassification = '';

        let gradeObtained = '';

        let institutionName = '';

        let awardEndYear = '';

        if (!isEmpty(i.degree_qualifications)) {
          awardObtained = i.degree_qualifications[0].award_obtained;
          awardClassification = i.degree_qualifications[0].award_classification;
          gradeObtained = i.degree_qualifications[0].grade_obtained;
          institutionName = i.degree_qualifications[0].institution_name;
          awardEndYear = i.degree_qualifications[0].award_end_year;
        }

        templateData.push([
          i.form_id,
          toUpper(i.surname),
          toUpper(i.other_names),
          toUpper(i.gender),
          i.nationality,
          i.payment_status,
          awardObtained,
          awardClassification,
          gradeObtained,
          institutionName,
          awardEndYear,
          getFormattedOtherQualifications(i.other_qualifications),
        ]);
      }

      admissionWorkSheet.addRows(templateData);

      const uploadPath = `${process.cwd()}/src/assets/documents/templates`;

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true }, (err) => {
          throw new Error(err.message);
        });
      }

      const template = `${uploadPath}/graduate-applicants-${surname}-${otherNames}-${user}-${now()}.xlsm`;

      await workbook.xlsx.writeFile(template);
      await res.download(template, 'GRADUATE APPLICANTS.xlsx', (error) => {
        if (error) {
          throw new Error(error.message);
        }
      });
    } catch (error) {
      http.setError(400, 'Unable to get Download Report.', {
        error: { error: error.message },
      });

      return http.send(res);
    }
  }

  // applicantAdmissionProgrammes
  async applicantAdmissionProgrammes(req, res) {
    try {
      if (!req.query.running_admission_id) {
        throw new Error('Invalid Context Provided');
      }
      const context = req.query;
      const data =
        await runningAdmissionViewsService.applicantAdmissionProgrammes(
          context
        );

      http.setSuccess(200, 'Admission Programmes fetched successfully', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to get fetch  Admission Programmes.', {
        error: { error: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *1111
   *
   * running admission function fetch by context
   */
  async runningAdmissionSummaryFunction(req, res) {
    try {
      if (
        !req.query.academic_year_id ||
        !req.query.intake_id ||
        !req.query.admission_scheme_id
      ) {
        throw new Error('Invalid Context Provided');
      }

      const context = req.query;

      const runningAdmission =
        await runningAdmissionViewsService.runningAdmissionSummary(context);

      http.setSuccess(
        200,
        'Running Admission Applicant Summary fetched successfully',
        {
          runningAdmission,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable to fetch Running Admission  Applicants Summary.',
        {
          error: { error: error.message },
        }
      );

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async generateApplicantsWeights(req, res) {
    try {
      const { runningAdmissionProgrammeId } = req.params;

      const metadataValues = await metadataValueService.findAllMetadataValues({
        include: {
          association: 'metadata',
          attributes: ['id', 'metadata_name'],
        },
        attributes: ['id', 'metadata_value'],
      });

      const aLevelUnebStudyLevelId = getMetadataValueId(
        metadataValues,
        'A LEVEL',
        'UNEB STUDY LEVELS'
      );

      const oLevelUnebStudyLevelId = getMetadataValueId(
        metadataValues,
        'O LEVEL',
        'UNEB STUDY LEVELS'
      );

      const findRunningAdmissionProgramme =
        await runningAdmissionProgrammeService
          .findOneRunningAdmissionProgramme({
            where: {
              id: runningAdmissionProgrammeId,
            },
            include: [
              {
                association: 'capacities',
                attributes: [
                  'id',
                  'running_admission_programme_id',
                  'programme_alias_id',
                  'campus_id',
                  'programme_type_id',
                  'capacity',
                ],
              },
            ],
            nest: true,
          })
          .then((res) => {
            if (res) {
              return res.toJSON();
            }
          });

      if (!findRunningAdmissionProgramme) {
        throw new Error(
          `Unable To Find The Running Admission Programme Specified.`
        );
      }

      const findAllProgrammeChoices = await applicantProgrammeChoiceService
        .findAllApplicantProgrammeChoices({
          where: {
            running_admission_id:
              findRunningAdmissionProgramme.running_admission_id,
          },
          attributes: [
            'id',
            'running_admission_id',
            'applicant_id',
            'form_id',
            'programme_campus_id',
            'choice_number_name',
            'choice_number',
            'applicant_weights',
          ],
          include: [
            {
              association: 'applicant',
              attributes: ['id', 'gender'],
            },
          ],
        })
        .then((res) => {
          if (res) {
            return res.map((item) => item.get({ plain: true }));
          }
        });

      const validProgrammeChoices = [];

      // const result = [];
      let result = null;

      if (
        !isEmpty(findAllProgrammeChoices) &&
        !isEmpty(findRunningAdmissionProgramme.capacities)
      ) {
        findRunningAdmissionProgramme.capacities.forEach((capacitySetting) => {
          const validChoices = findAllProgrammeChoices.filter(
            (choice) =>
              parseInt(choice.programme_campus_id, 10) ===
              parseInt(capacitySetting.id, 10)
          );

          if (!isEmpty(validChoices)) {
            validProgrammeChoices.push(...validChoices);
          }
        });
      }

      const findWeightingCriteria =
        await programmeVersionWeightingCriteriaService
          .findOneRecord({
            where: {
              id: findRunningAdmissionProgramme.weighting_criteria_id,
            },
            include: [
              {
                association: 'categories',
                attributes: [
                  'id',
                  'criteria_id',
                  'uneb_study_level_id',
                  'weighting_category_id',
                  'weighting_condition_id',
                  'weight',
                ],
                include: [
                  {
                    association: 'unebStudyLevel',
                    attributes: ['id', 'metadata_value'],
                  },
                  {
                    association: 'weightingCategory',
                    attributes: ['id', 'metadata_value'],
                  },
                  {
                    association: 'weightingCondition',
                    attributes: ['id', 'metadata_value'],
                  },
                  {
                    association: 'unebSubjects',
                    include: [
                      {
                        association: 'unebSubject',
                      },
                    ],
                  },
                ],
              },
            ],
            nest: true,
          })
          .then((res) => {
            if (res) {
              return res.toJSON();
            }
          });

      if (!findWeightingCriteria) {
        throw new Error(
          `Unable To Find A Weighting criteria Matching The Running Admission Programme Specified.`
        );
      }

      const findALevelCategories = findWeightingCriteria.categories.filter(
        (category) =>
          parseInt(category.uneb_study_level_id, 10) ===
          parseInt(aLevelUnebStudyLevelId, 10)
      );

      const findOLevelCategories = findWeightingCriteria.categories.find(
        (category) =>
          parseInt(category.uneb_study_level_id, 10) ===
            parseInt(oLevelUnebStudyLevelId, 10) &&
          toUpper(trim(category.weightingCondition.metadata_value)).includes(
            'MANDATORY'
          )
      );

      if (findWeightingCriteria.weigh_a_level === true) {
        if (isEmpty(findALevelCategories)) {
          throw new Error(
            `Please include some A LEVEL Weighting Criteria Categories.`
          );
        }
      }

      if (!isEmpty(validProgrammeChoices)) {
        const allApplicantOLevelData = await applicantOLevelDataService
          .findAllApplicantOLevelData({
            where: {
              running_admission_id:
                findRunningAdmissionProgramme.running_admission_id,
            },
            include: [
              {
                association: 'subjects',
              },
            ],
          })
          .then((res) => {
            if (res) {
              return res.map((item) => item.get({ plain: true }));
            }
          });

        if (isEmpty(allApplicantOLevelData)) {
          throw new Error('No Applicant Has Provided Any O-level Data.');
        }

        const allApplicantALevelData = await applicantALevelDataService
          .findAllApplicantALevelData({
            where: {
              running_admission_id:
                findRunningAdmissionProgramme.running_admission_id,
            },
            include: [
              {
                association: 'subjects',
              },
            ],
          })
          .then((res) => {
            if (res) {
              return res.map((item) => item.get({ plain: true }));
            }
          });

        if (isEmpty(allApplicantALevelData)) {
          throw new Error('No Applicant Has Provided Any A-level Data.');
        }

        const newApplicantOLevelData = [];
        const newApplicantALevelData = [];

        allApplicantOLevelData.forEach((oLevel) => {
          if (!isEmpty(oLevel.subjects)) {
            const correspondingALevel = allApplicantALevelData.find(
              (aLevel) =>
                parseInt(aLevel.applicant_id, 10) ===
                parseInt(oLevel.applicant_id, 10)
            );

            if (correspondingALevel && !isEmpty(correspondingALevel.subjects)) {
              newApplicantOLevelData.push(oLevel);
              newApplicantALevelData.push(correspondingALevel);
            }
          }
        });

        await model.sequelize.transaction(async (transaction) => {
          result = await weighApplicants(
            findOLevelCategories,
            findALevelCategories,
            findWeightingCriteria,
            validProgrammeChoices,
            newApplicantOLevelData,
            newApplicantALevelData,
            transaction
          );

          await runningAdmissionProgrammeService.updateRunningAdmissionProgramme(
            runningAdmissionProgrammeId,
            { is_weighted: true },
            transaction
          );
        });
      }

      http.setSuccess(200, 'Applicant Weights Generated Successfully.', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Generate Applicant Weights.', {
        error: { error: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async generateMultipleApplicantsWeights(req, res) {
    try {
      const { runningAdmissionId } = req.params;

      const metadataValues = await metadataValueService.findAllMetadataValues({
        include: {
          association: 'metadata',
          attributes: ['id', 'metadata_name'],
        },
        attributes: ['id', 'metadata_value'],
      });

      const findRunningAdmission = await runningAdmissionService
        .findOneRunningAdmission({
          where: {
            id: runningAdmissionId,
          },
          include: [
            {
              association: 'programmes',
              include: [
                {
                  association: 'capacities',
                  attributes: [
                    'id',
                    'running_admission_programme_id',
                    'programme_alias_id',
                    'campus_id',
                    'programme_type_id',
                    'capacity',
                  ],
                  include: [
                    {
                      association: 'entryStudyYears',
                      attributes: [
                        'id',
                        'running_admission_programme_campus_id',
                        'entry_study_year_id',
                      ],
                    },
                  ],
                },
                {
                  association: 'weightingCriteria',
                  attributes: ['id'],
                  include: [
                    {
                      association: 'categories',
                      attributes: [
                        'id',
                        'criteria_id',
                        'uneb_study_level_id',
                        'weighting_category_id',
                        'weighting_condition_id',
                        'weight',
                      ],
                    },
                  ],
                },
                {
                  association: 'programme',
                  attributes: ['id', 'programme_code', 'programme_title'],
                },
              ],
            },
          ],

          nest: true,
        })
        .then((res) => {
          if (res) {
            return res.toJSON();
          }
        });

      if (!findRunningAdmission) {
        throw new Error(`Unable To Find The Running Admission Specified.`);
      }

      const aLevelUnebStudyLevelId = getMetadataValueId(
        metadataValues,
        'A LEVEL',
        'UNEB STUDY LEVELS'
      );

      const oLevelUnebStudyLevelId = getMetadataValueId(
        metadataValues,
        'O LEVEL',
        'UNEB STUDY LEVELS'
      );

      const findAllProgrammeChoices = await applicantProgrammeChoiceService
        .findAllApplicantProgrammeChoices({
          where: {
            running_admission_id: runningAdmissionId,
          },
          attributes: [
            'id',
            'running_admission_id',
            'applicant_id',
            'form_id',
            'programme_campus_id',
            'choice_number_name',
            'choice_number',
            'applicant_weights',
          ],
          include: [
            {
              association: 'applicant',
              attributes: ['id', 'gender'],
            },
          ],
        })
        .then((res) => {
          if (res) {
            return res.map((item) => item.get({ plain: true }));
          }
        });

      const allApplicantOLevelData = await applicantOLevelDataService
        .findAllApplicantOLevelData({
          where: {
            running_admission_id: runningAdmissionId,
          },
          include: [
            {
              association: 'subjects',
            },
          ],
        })
        .then((res) => {
          if (res) {
            return res.map((item) => item.get({ plain: true }));
          }
        });

      const allApplicantALevelData = await applicantALevelDataService
        .findAllApplicantALevelData({
          where: {
            running_admission_id: runningAdmissionId,
          },
          include: [
            {
              association: 'subjects',
            },
          ],
        })
        .then((res) => {
          if (res) {
            return res.map((item) => item.get({ plain: true }));
          }
        });

      const newApplicantOLevelData = [];
      const newApplicantALevelData = [];

      allApplicantOLevelData.forEach((oLevel) => {
        if (!isEmpty(oLevel.subjects)) {
          const correspondingALevel = allApplicantALevelData.find(
            (aLevel) =>
              parseInt(aLevel.applicant_id, 10) ===
              parseInt(oLevel.applicant_id, 10)
          );

          if (correspondingALevel && !isEmpty(correspondingALevel.subjects)) {
            newApplicantOLevelData.push(oLevel);
            newApplicantALevelData.push(correspondingALevel);
          }
        }
      });

      const result = [];

      await model.sequelize.transaction(async (transaction) => {
        if (!isEmpty(findRunningAdmission.programmes)) {
          for (const findRunningAdmissionProgramme of findRunningAdmission.programmes) {
            const validProgrammeChoices = [];

            if (
              !isEmpty(findAllProgrammeChoices) &&
              !isEmpty(findRunningAdmissionProgramme.capacities)
            ) {
              findRunningAdmissionProgramme.capacities.forEach(
                (capacitySetting) => {
                  const validChoices = findAllProgrammeChoices.filter(
                    (choice) =>
                      parseInt(choice.programme_campus_id, 10) ===
                      parseInt(capacitySetting.id, 10)
                  );

                  if (!isEmpty(validChoices)) {
                    validProgrammeChoices.push(...validChoices);
                  }
                }
              );
            }

            if (!isEmpty(validProgrammeChoices)) {
              const findWeightingCriteria =
                await programmeVersionWeightingCriteriaService
                  .findOneRecord({
                    where: {
                      id: findRunningAdmissionProgramme.weighting_criteria_id,
                    },
                    include: [
                      {
                        association: 'categories',
                        attributes: [
                          'id',
                          'criteria_id',
                          'uneb_study_level_id',
                          'weighting_category_id',
                          'weighting_condition_id',
                          'weight',
                        ],
                        include: [
                          {
                            association: 'unebStudyLevel',
                            attributes: ['id', 'metadata_value'],
                          },
                          {
                            association: 'weightingCategory',
                            attributes: ['id', 'metadata_value'],
                          },
                          {
                            association: 'weightingCondition',
                            attributes: ['id', 'metadata_value'],
                          },
                          {
                            association: 'unebSubjects',
                            include: [
                              {
                                association: 'unebSubject',
                              },
                            ],
                          },
                        ],
                      },
                    ],
                    nest: true,
                  })
                  .then((res) => {
                    if (res) {
                      return res.toJSON();
                    }
                  });

              if (!findWeightingCriteria) {
                throw new Error(
                  `Unable To Find A Weighting criteria Matching The Programme: ${findRunningAdmissionProgramme.programme.programme_code} ${findRunningAdmissionProgramme.programme.programme_title}.`
                );
              }

              const findALevelCategories =
                findWeightingCriteria.categories.filter(
                  (category) =>
                    parseInt(category.uneb_study_level_id, 10) ===
                    parseInt(aLevelUnebStudyLevelId, 10)
                );

              const findOLevelCategories =
                findWeightingCriteria.categories.find(
                  (category) =>
                    parseInt(category.uneb_study_level_id, 10) ===
                      parseInt(oLevelUnebStudyLevelId, 10) &&
                    toUpper(
                      trim(category.weightingCondition.metadata_value)
                    ).includes('MANDATORY')
                );

              if (findWeightingCriteria.weigh_a_level === true) {
                if (isEmpty(findALevelCategories)) {
                  throw new Error(
                    `Please include some A LEVEL Weighting Criteria Categories For Criteria: ${findWeightingCriteria.weighting_criteria_code}.`
                  );
                }
              }

              const newResult = await weighApplicants(
                findOLevelCategories,
                findALevelCategories,
                findWeightingCriteria,
                validProgrammeChoices,
                newApplicantOLevelData,
                newApplicantALevelData,
                transaction
              );

              result.push(...newResult);
            }

            await runningAdmissionProgrammeService.updateRunningAdmissionProgramme(
              findRunningAdmissionProgramme.id,
              { is_weighted: true },
              transaction
            );
          }
        }
      });

      http.setSuccess(200, 'Applicant Weights Generated Successfully.', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Generate Applicant Weights.', {
        error: { error: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async runApplicantSelections(req, res) {
    try {
      const { runningAdmissionId } = req.params;

      const metadataValues = await metadataValueService.findAllMetadataValues({
        include: {
          association: 'metadata',
          attributes: ['id', 'metadata_name'],
        },
        attributes: ['id', 'metadata_value'],
      });

      const oLevelId = getMetadataValueId(
        metadataValues,
        'O LEVEL',
        'UNEB STUDY LEVELS'
      );

      const findRunningAdmission = await runningAdmissionService
        .findOneRunningAdmission({
          where: {
            id: runningAdmissionId,
          },
          include: [
            {
              association: 'programmes',
              include: [
                {
                  association: 'capacities',
                  attributes: [
                    'id',
                    'running_admission_programme_id',
                    'programme_alias_id',
                    'campus_id',
                    'programme_type_id',
                    'capacity',
                  ],
                  include: [
                    {
                      association: 'entryStudyYears',
                      attributes: [
                        'id',
                        'running_admission_programme_campus_id',
                        'entry_study_year_id',
                      ],
                    },
                  ],
                },
                {
                  association: 'weightingCriteria',
                  attributes: ['id'],
                  include: [
                    {
                      association: 'categories',
                      attributes: [
                        'id',
                        'criteria_id',
                        'uneb_study_level_id',
                        'weighting_category_id',
                        'weighting_condition_id',
                        'weight',
                      ],
                    },
                  ],
                },
                {
                  association: 'programme',
                  attributes: ['id', 'programme_code', 'programme_title'],
                },
              ],
            },
          ],

          nest: true,
        })
        .then((res) => {
          if (res) {
            return res.toJSON();
          }
        });

      if (!findRunningAdmission) {
        throw new Error(`Unable To Find The Running Admission Specified.`);
      }

      const findAllApplicantProgrammeChoices =
        await applicantProgrammeChoiceService
          .findAllApplicantProgrammeChoices({
            where: {
              running_admission_id: runningAdmissionId,
            },
            attributes: [
              'id',
              'running_admission_id',
              'applicant_id',
              'entry_study_year_id',
              'form_id',
              'programme_campus_id',
              'choice_number_name',
              'choice_number',
              'applicant_weights',
              'applicant_selected',
            ],
            include: [
              {
                association: 'programmeCampus',
                attributes: ['id', 'programme_type_id'],
              },
            ],
          })
          .then((res) => {
            if (res) {
              return res.map((item) => item.get({ plain: true }));
            }
          });

      const findAllRunningAdmissionApplicants =
        await runningAdmissionApplicantService.findAllRunningAdmissionApplicants(
          {
            where: {
              running_admission_id: runningAdmissionId,
              application_status: 'COMPLETED',
              payment_status: 'T',
            },
            raw: true,
          }
        );

      const findAllOLevelData = await applicantOLevelDataService
        .findAllApplicantOLevelData({
          where: {
            running_admission_id: runningAdmissionId,
          },
          include: [
            {
              association: 'subjects',
              attributes: [
                'id',
                'uneb_subject_id',
                'applicant_o_level_data_id',
                'code',
                'result',
              ],
            },
          ],
        })
        .then((res) => {
          if (res) {
            return res.map((item) => item.get({ plain: true }));
          }
        });

      const findAllALevelData = await applicantALevelDataService
        .findAllApplicantALevelData({
          where: {
            running_admission_id: runningAdmissionId,
          },
          include: [
            {
              association: 'subjects',
            },
          ],
        })
        .then((res) => {
          if (res) {
            return res.map((item) => item.get({ plain: true }));
          }
        });

      await applicantProgrammeChoiceService.updateApplicantProgrammeChoiceWithoutTransaction(
        {
          running_admission_id: runningAdmissionId,
        },
        {
          applicant_selected: false,
          reason: null,
        }
      );

      const result = [];
      const validApplicantChoices = [];
      const bestDoneChoices = [];
      const selectedChoicesPerApplicant = [];

      await model.sequelize.transaction(async (transaction) => {
        if (!isEmpty(findRunningAdmission.programmes)) {
          for (const runningProgramme of findRunningAdmission.programmes) {
            const findOLevelCategories = [];

            if (!runningProgramme.weighting_criteria_id) {
              throw new Error(
                `${runningProgramme.programme.programme_code} ${runningProgramme.programme.programme_title} Requires A Weighting Criteria.`
              );
            }

            if (runningProgramme.is_weighted === false) {
              throw new Error(
                `${runningProgramme.programme.programme_code} ${runningProgramme.programme.programme_title} Has Not Yet Been Weighted.`
              );
            }

            if (!isEmpty(runningProgramme.weightingCriteria.categories)) {
              const filteredOLevelCategories =
                runningProgramme.weightingCriteria.categories.filter(
                  (category) =>
                    parseInt(category.uneb_study_level_id, 10) ===
                    parseInt(oLevelId, 10)
                );

              if (!isEmpty(filteredOLevelCategories)) {
                for (const item of filteredOLevelCategories) {
                  const findCategory =
                    await programmeVersionWeightingCriteriaService
                      .findOneWeightingCriteriaCategory({
                        where: {
                          id: item.id,
                        },
                        include: [
                          {
                            association: 'unebStudyLevel',
                            attributes: ['id', 'metadata_value'],
                          },
                          {
                            association: 'weightingCategory',
                            attributes: ['id', 'metadata_value'],
                          },
                          {
                            association: 'weightingCondition',
                            attributes: ['id', 'metadata_value'],
                          },
                          {
                            association: 'unebSubjects',
                            include: [
                              {
                                association: 'unebSubject',
                              },
                            ],
                          },
                        ],
                        nest: true,
                      })
                      .then((res) => {
                        if (res) {
                          return res.toJSON();
                        }
                      });

                  if (findCategory) {
                    findOLevelCategories.push(findCategory);
                  }
                }
              }
            }

            if (!isEmpty(runningProgramme.capacities)) {
              const filtered = [];

              runningProgramme.capacities.forEach((capacity) => {
                const filteredProgrammeChoices =
                  findAllApplicantProgrammeChoices.filter(
                    (choice) =>
                      parseInt(choice.programme_campus_id, 10) ===
                        parseInt(capacity.id, 10) && choice.applicant_weights
                  );

                if (!isEmpty(filteredProgrammeChoices)) {
                  filteredProgrammeChoices.forEach((choice) => {
                    choice.capacity = capacity.capacity;

                    filtered.push(choice);
                  });
                }
              });

              if (!isEmpty(filtered)) {
                for (const choice of filtered) {
                  const checkCompletion =
                    findAllRunningAdmissionApplicants.find(
                      (record) =>
                        parseInt(record.applicant_id, 10) ===
                          parseInt(choice.applicant_id, 10) &&
                        trim(record.form_id) === trim(choice.form_id)
                    );

                  if (checkCompletion) {
                    if (toUpper(trim(checkCompletion.payment_status)) === 'T') {
                      // CHECK MINIMUM O LEVEL SUBJECTS
                      const findOLevel = findAllOLevelData.find(
                        (oLevelData) =>
                          parseInt(oLevelData.applicant_id, 10) ===
                          parseInt(choice.applicant_id, 10)
                      );

                      // CHECK MINIMUM A LEVEL SUBJECTS
                      const findALevel = findAllALevelData.find(
                        (oLevelData) =>
                          parseInt(oLevelData.applicant_id, 10) ===
                          parseInt(choice.applicant_id, 10)
                      );

                      if (findOLevel && findALevel) {
                        if (
                          findOLevel.subjects.length >= 7 &&
                          findALevel.subjects.length >= 3
                        ) {
                          // CHECK MINIMUN A LEVEL PRINCIPAL PASSES

                          const totalFailures = [];

                          const findOs = findALevel.subjects.filter(
                            (sbj) => toUpper(trim(sbj.result)) === 'O'
                          );

                          const findFs = findALevel.subjects.filter(
                            (sbj) => toUpper(trim(sbj.result)) === 'F'
                          );

                          if (!isEmpty(findOs)) {
                            totalFailures.push(...findOs);
                          }
                          if (!isEmpty(findFs)) {
                            totalFailures.push(...findFs);
                          }

                          if (totalFailures.length <= 1) {
                            if (!isEmpty(findOLevelCategories)) {
                              const findOLevelData = findAllOLevelData.find(
                                (record) =>
                                  trim(record.form_id) === trim(choice.form_id)
                              );

                              if (findOLevelData) {
                                if (!isEmpty(findOLevelData.subjects)) {
                                  const checkSelectableByOLevel =
                                    selectionsBasedOnOLevelSubjects(
                                      findOLevelCategories,
                                      findOLevelData.subjects
                                    );

                                  const findEligibility =
                                    checkSelectableByOLevel.find((result) =>
                                      result.includes('NOT-ELIGIBLE')
                                    );

                                  if (!findEligibility) {
                                    validApplicantChoices.push(choice);
                                  }
                                }
                              }
                            } else {
                              validApplicantChoices.push(choice);
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }

            //
          }

          if (!isEmpty(validApplicantChoices)) {
            const orderByApplicants = chain(validApplicantChoices)
              .groupBy('applicant_id')
              .map((value, key) => ({
                applicant_id: key,
                selections: orderBy(
                  value,
                  ['applicant_weights', 'choice_number'],
                  ['desc', 'asc']
                ),
              }))
              .value();

            if (!isEmpty(orderByApplicants)) {
              orderByApplicants.forEach((applicant) => {
                if (!isEmpty(applicant.selections)) {
                  selectedChoicesPerApplicant.push(applicant.selections[0]);
                }
              });
            }

            const orderByCapacitySetting = chain(selectedChoicesPerApplicant)
              .groupBy('programme_campus_id')
              .map((value, key) => ({
                programme_campus_id: key,
                selections: orderBy(value, ['applicant_weights'], ['desc']),
              }))
              .value();

            if (!isEmpty(orderByCapacitySetting)) {
              orderByCapacitySetting.forEach((order) => {
                if (!isEmpty(order.selections)) {
                  const limit = parseInt(order.selections[0].capacity, 10);

                  const applicantsByCapacity = order.selections.slice(0, limit);

                  bestDoneChoices.push(...applicantsByCapacity);
                }
              });
            }

            if (!isEmpty(bestDoneChoices)) {
              for (const choice of bestDoneChoices) {
                const record =
                  await applicantProgrammeChoiceService.updateApplicantProgrammeChoice(
                    { id: choice.id },
                    {
                      applicant_selected: true,
                    },
                    transaction
                  );

                result.push(record[1][0]);
              }
            }
          }
        }
      });

      http.setSuccess(200, 'Applicants Selected Successfully.', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Select Applicants.', {
        error: { error: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async downloadWeightedApplicants(req, res) {
    try {
      const { id: user, surname, other_names: otherNames } = req.user;

      const context = req.query;

      if (!context.programmeCampusId) {
        throw new Error('Invalid Context Provided');
      }

      const data =
        await admittedApplicantsViewsService.applicantWeightingFunction(
          context
        );

      const institutionStructure =
        await institutionStructureService.findInstitutionStructureRecords({
          attributes: ['institution_name', 'institution_logo'],
        });

      if (!institutionStructure) {
        throw new Error('Unable To Find Institution Structure.');
      }

      const findCapacitySetting = await runningAdmissionProgrammeCampusService
        .findOneRunningAdmissionProgrammeCampus({
          where: {
            id: context.programmeCampusId,
          },
          include: [
            {
              association: 'runningAdmissionProgramme',
              include: [
                {
                  association: 'programme',
                  attributes: ['id', 'programme_code', 'programme_title'],
                },
              ],
            },
            {
              association: 'alias',
              attributes: ['id', 'alias_code'],
            },
            {
              association: 'campus',
              attributes: ['id', 'metadata_value'],
            },
            {
              association: 'programmeType',
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

      if (!findCapacitySetting) {
        throw new Error(`Unable To Find The Capacity Setting Specified.`);
      }

      const findRunningAdmission = await runningAdmissionService
        .findOneRunningAdmission({
          where: {
            id: findCapacitySetting.runningAdmissionProgramme
              .running_admission_id,
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
              attributes: ['id', 'scheme_name'],
            },
          ],
          nest: true,
        })
        .then((res) => {
          if (res) {
            return res.toJSON();
          }
        });

      if (!findRunningAdmission) {
        throw new Error(`Unable To Find The Running Admission Specified.`);
      }

      const workbook = new excelJs.Workbook();
      const rootSheet = workbook.addWorksheet('APPLICANTS');

      rootSheet.mergeCells('C1', 'O3');
      rootSheet.mergeCells('A1', 'B2');
      const titleCell = rootSheet.getCell('C1');

      rootSheet.getRow(1).height = 65;

      titleCell.value = `${
        institutionStructure.institution_name || 'ACMIS'
      } \n APPLICANTS WEIGHTED ON RUNNING ADMISSION FROM ${moment(
        findRunningAdmission.admission_start_date
      ).format('MMMM Do YYYY')} TO ${moment(
        findRunningAdmission.admission_end_date
      ).format('MMMM Do YYYY')} \n SCHEME: ${
        findRunningAdmission.admissionScheme.scheme_name
      }, ACADEMIC YEAR: ${
        findRunningAdmission.academicYear.metadata_value
      }, INTAKE: ${
        findRunningAdmission.intake.metadata_value
      }, DEGREE CATEGORY: ${
        findRunningAdmission.degreeCategory.metadata_value
      } \n PROGRAMME: (${
        findCapacitySetting.runningAdmissionProgramme.programme.programme_code
      }) ${
        findCapacitySetting.runningAdmissionProgramme.programme.programme_title
      }, ALIAS: ${
        findCapacitySetting.alias ? findCapacitySetting.alias.alias_code : ``
      }, CAMPUS: ${
        findCapacitySetting.campus.metadata_value
      }, PROGRAMME TYPE: ${
        findCapacitySetting.programmeType.metadata_value
      } , CAPACITY: ${findCapacitySetting.capacity}.`;

      titleCell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
      };

      titleCell.font = { bold: true, size: 10, name: 'Arial' };

      const headerRow = rootSheet.getRow(3);

      headerRow.values = map(weightedApplicantColumns, 'header');
      headerRow.font = { bold: true, size: 11, color: '#2c3e50' };
      rootSheet.columns = weightedApplicantColumns.map((column) => {
        delete column.header;

        return column;
      });
      rootSheet.getRow(3).height = 40;

      rootSheet.views = [
        {
          state: 'frozen',
          xSplit: 0,
          ySplit: 3,
          topLeftCell: 'G10',
          activeCell: 'A1',
        },
      ];

      const templateData = [];

      const ordered = orderBy(data, ['applicant_weights'], ['desc']);

      ordered.forEach((applicant) => {
        const index = applicant.choices.findIndex(
          (choice) =>
            parseInt(choice.choice_number, 10) ===
            parseInt(applicant.choice_number, 10)
        );

        if (index > -1) {
          applicant.choices.splice(index, 1);
        }

        const choiceCodes = [];
        const choiceAliases = [];
        const choiceNumbers = [];
        const choiceCampuses = [];
        const choiceTypes = [];
        const choiceEntryYears = [];
        const choiceWeights = [];

        applicant.choices.forEach((choice) => {
          choiceCodes.push(choice.programme_code);
        });

        applicant.choices.forEach((choice) => {
          choiceAliases.push(choice.code);
        });

        applicant.choices.forEach((choice) => {
          choiceNumbers.push(toUpper(choice.choice_number_name));
        });

        applicant.choices.forEach((choice) => {
          choiceCampuses.push(toUpper(choice.campus));
        });

        applicant.choices.forEach((choice) => {
          choiceTypes.push(toUpper(choice.programme_type));
        });

        applicant.choices.forEach((choice) => {
          choiceEntryYears.push(toUpper(choice.entry_study_year));
        });

        applicant.choices.forEach((choice) => {
          choiceWeights.push(toUpper(choice.applicant_weights));
        });

        templateData.push([
          toUpper(trim(applicant.form_id)),
          toUpper(trim(applicant.surname)),
          toUpper(trim(applicant.other_names)),
          trim(applicant.email),
          toUpper(trim(applicant.phone)),
          toUpper(trim(applicant.gender)),
          toUpper(
            trim(
              findCapacitySetting.runningAdmissionProgramme.programme
                .programme_code
            )
          ),
          toUpper(
            trim(
              findCapacitySetting.alias
                ? findCapacitySetting.alias.alias_code
                : ``
            )
          ),
          toUpper(trim(findCapacitySetting.campus.metadata_value)),
          toUpper(trim(findCapacitySetting.programmeType.metadata_value)),
          toUpper(trim(applicant.applicant_weights)),
          toUpper(trim(applicant.choice_number_name)),
          toUpper(trim(applicant.payment_status)) === 'T'
            ? 'PAID'
            : toUpper(trim(applicant.payment_status)),
          parseInt(applicant.amount).toLocaleString(),
          toUpper(trim(applicant.ura_prn)),
          choiceCodes.toString().replace(/["[]]/g, ''),
          choiceAliases.toString().replace(/["[]]/g, ''),
          choiceNumbers.toString().replace(/["[]]/g, ''),
          choiceCampuses.toString().replace(/["[]]/g, ''),
          choiceTypes.toString().replace(/["[]]/g, ''),
          choiceEntryYears.toString().replace(/["[]]/g, ''),
          choiceWeights.toString().replace(/["[]]/g, ''),
        ]);
      });

      rootSheet.addRows(templateData);

      const uploadPath = `${process.cwd()}/src/assets/documents/templates`;

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true }, (err) => {
          throw new Error(err.message);
        });
      }

      const template = `${uploadPath}/weighted-applicants-${surname}-${otherNames}-${user}-${now()}.xlsm`;

      await workbook.xlsx.writeFile(template);
      await res.download(template, 'WEIGHTED-APPLICANTS.xlsx', (error) => {
        if (error) {
          throw new Error(error.message);
        }
      });
    } catch (error) {
      http.setError(400, 'Unable To Download Template.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async downloadSelectedApplicants(req, res) {
    try {
      const { id: user, surname, other_names: otherNames } = req.user;

      const context = req.query;

      if (!context.programmeCampusId) {
        throw new Error('Invalid Context Provided');
      }

      const data =
        await admittedApplicantsViewsService.selectedApplicantsFunction(
          context
        );

      const institutionStructure =
        await institutionStructureService.findInstitutionStructureRecords({
          attributes: ['institution_name', 'institution_logo'],
        });

      if (!institutionStructure) {
        throw new Error('Unable To Find Institution Structure.');
      }

      const findCapacitySetting = await runningAdmissionProgrammeCampusService
        .findOneRunningAdmissionProgrammeCampus({
          where: {
            id: context.programmeCampusId,
          },
          include: [
            {
              association: 'runningAdmissionProgramme',
              include: [
                {
                  association: 'programme',
                  attributes: ['id', 'programme_code', 'programme_title'],
                },
              ],
            },
            {
              association: 'alias',
              attributes: ['id', 'alias_code'],
            },
            {
              association: 'campus',
              attributes: ['id', 'metadata_value'],
            },
            {
              association: 'programmeType',
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

      if (!findCapacitySetting) {
        throw new Error(`Unable To Find The Capacity Setting Specified.`);
      }

      const findRunningAdmission = await runningAdmissionService
        .findOneRunningAdmission({
          where: {
            id: findCapacitySetting.runningAdmissionProgramme
              .running_admission_id,
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
              attributes: ['id', 'scheme_name'],
            },
          ],
          nest: true,
        })
        .then((res) => {
          if (res) {
            return res.toJSON();
          }
        });

      if (!findRunningAdmission) {
        throw new Error(`Unable To Find The Running Admission Specified.`);
      }

      const workbook = new excelJs.Workbook();
      const rootSheet = workbook.addWorksheet('APPLICANTS');

      rootSheet.mergeCells('C1', 'O3');
      rootSheet.mergeCells('A1', 'B2');
      const titleCell = rootSheet.getCell('C1');

      rootSheet.getRow(1).height = 65;

      titleCell.value = `${
        institutionStructure.institution_name || 'ACMIS'
      } \n APPLICANTS SELECTED ON RUNNING ADMISSION FROM ${moment(
        findRunningAdmission.admission_start_date
      ).format('MMMM Do YYYY')} TO ${moment(
        findRunningAdmission.admission_end_date
      ).format('MMMM Do YYYY')} \n SCHEME: ${
        findRunningAdmission.admissionScheme.scheme_name
      }, ACADEMIC YEAR: ${
        findRunningAdmission.academicYear.metadata_value
      }, INTAKE: ${
        findRunningAdmission.intake.metadata_value
      }, DEGREE CATEGORY: ${
        findRunningAdmission.degreeCategory.metadata_value
      } \n PROGRAMME: (${
        findCapacitySetting.runningAdmissionProgramme.programme.programme_code
      }) ${
        findCapacitySetting.runningAdmissionProgramme.programme.programme_title
      }, ALIAS: ${
        findCapacitySetting.alias ? findCapacitySetting.alias.alias_code : ``
      }, CAMPUS: ${
        findCapacitySetting.campus.metadata_value
      }, PROGRAMME TYPE: ${
        findCapacitySetting.programmeType.metadata_value
      }, CAPACITY: ${findCapacitySetting.capacity}.`;

      titleCell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
      };

      titleCell.font = { bold: true, size: 10, name: 'Arial' };

      const headerRow = rootSheet.getRow(3);

      headerRow.values = map(weightedApplicantColumns, 'header');
      headerRow.font = { bold: true, size: 11, color: '#2c3e50' };
      rootSheet.columns = weightedApplicantColumns.map((column) => {
        delete column.header;

        return column;
      });
      rootSheet.getRow(3).height = 40;

      rootSheet.views = [
        {
          state: 'frozen',
          xSplit: 0,
          ySplit: 3,
          topLeftCell: 'G10',
          activeCell: 'A1',
        },
      ];

      const templateData = [];

      const ordered = orderBy(data, ['applicant_weights'], ['desc']);

      ordered.forEach((applicant) => {
        const index = applicant.choices.findIndex(
          (choice) =>
            parseInt(choice.choice_number, 10) ===
            parseInt(applicant.choice_number, 10)
        );

        if (index > -1) {
          applicant.choices.splice(index, 1);
        }

        const choiceCodes = [];
        const choiceAliases = [];
        const choiceNumbers = [];
        const choiceCampuses = [];
        const choiceTypes = [];
        const choiceEntryYears = [];
        const choiceWeights = [];

        applicant.choices.forEach((choice) => {
          choiceCodes.push(choice.programme_code);
        });

        applicant.choices.forEach((choice) => {
          choiceAliases.push(choice.code);
        });

        applicant.choices.forEach((choice) => {
          choiceNumbers.push(toUpper(choice.choice_number_name));
        });

        applicant.choices.forEach((choice) => {
          choiceCampuses.push(toUpper(choice.campus));
        });

        applicant.choices.forEach((choice) => {
          choiceTypes.push(toUpper(choice.programme_type));
        });

        applicant.choices.forEach((choice) => {
          choiceEntryYears.push(toUpper(choice.entry_study_year));
        });

        applicant.choices.forEach((choice) => {
          choiceWeights.push(toUpper(choice.applicant_weights));
        });

        templateData.push([
          toUpper(trim(applicant.form_id)),
          toUpper(trim(applicant.surname)),
          toUpper(trim(applicant.other_names)),
          trim(applicant.email),
          toUpper(trim(applicant.phone)),
          toUpper(trim(applicant.gender)),
          toUpper(
            trim(
              findCapacitySetting.runningAdmissionProgramme.programme
                .programme_code
            )
          ),
          toUpper(
            trim(
              findCapacitySetting.alias
                ? findCapacitySetting.alias.alias_code
                : ``
            )
          ),
          toUpper(trim(findCapacitySetting.campus.metadata_value)),
          toUpper(trim(findCapacitySetting.programmeType.metadata_value)),
          toUpper(trim(applicant.applicant_weights)),
          toUpper(trim(applicant.choice_number_name)),
          toUpper(trim(applicant.payment_status)) === 'T'
            ? 'PAID'
            : toUpper(trim(applicant.payment_status)),
          parseInt(applicant.amount).toLocaleString(),
          toUpper(trim(applicant.ura_prn)),
          choiceCodes.toString().replace(/["[]]/g, ''),
          choiceAliases.toString().replace(/["[]]/g, ''),
          choiceNumbers.toString().replace(/["[]]/g, ''),
          choiceCampuses.toString().replace(/["[]]/g, ''),
          choiceTypes.toString().replace(/["[]]/g, ''),
          choiceEntryYears.toString().replace(/["[]]/g, ''),
          choiceWeights.toString().replace(/["[]]/g, ''),
        ]);
      });

      rootSheet.addRows(templateData);

      const uploadPath = `${process.cwd()}/src/assets/documents/templates`;

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true }, (err) => {
          throw new Error(err.message);
        });
      }

      const template = `${uploadPath}/selected-applicants-${surname}-${otherNames}-${user}-${now()}.xlsm`;

      await workbook.xlsx.writeFile(template);
      await res.download(template, 'SELECTED-APPLICANTS.xlsx', (error) => {
        if (error) {
          throw new Error(error.message);
        }
      });
    } catch (error) {
      http.setError(400, 'Unable To Download Template.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async generateDiscardedApplicantReport(req, res) {
    try {
      const context = req.query;

      if (!context.programmeCampusId) {
        throw new Error('Invalid Context Provided');
      }

      const results = await getDiscardedApplicants(context.programmeCampusId);

      const updates = [];

      await model.sequelize.transaction(async (transaction) => {
        if (!isEmpty(results)) {
          for (const item of results) {
            const response =
              await applicantProgrammeChoiceService.updateApplicantProgrammeChoice(
                {
                  id: item.id,
                },
                {
                  reason: item.reason,
                },
                transaction
              );

            updates.push(response[1][0]);
          }
        }
      });

      http.setSuccess(200, 'Report Generated Successfully', {
        data: updates,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Generate Report.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async downloadNotSelectedApplicants(req, res) {
    try {
      const { id: user, surname, other_names: otherNames } = req.user;

      const context = req.query;

      if (!context.programmeCampusId) {
        throw new Error('Invalid Context Provided');
      }

      const data =
        await admittedApplicantsViewsService.notSelectedApplicantsFunction(
          context
        );

      const institutionStructure =
        await institutionStructureService.findInstitutionStructureRecords({
          attributes: ['institution_name', 'institution_logo'],
        });

      if (!institutionStructure) {
        throw new Error('Unable To Find Institution Structure.');
      }

      const findCapacitySetting = await runningAdmissionProgrammeCampusService
        .findOneRunningAdmissionProgrammeCampus({
          where: {
            id: context.programmeCampusId,
          },
          include: [
            {
              association: 'runningAdmissionProgramme',
              include: [
                {
                  association: 'programme',
                  attributes: ['id', 'programme_code', 'programme_title'],
                },
              ],
            },
            {
              association: 'alias',
              attributes: ['id', 'alias_code'],
            },
            {
              association: 'campus',
              attributes: ['id', 'metadata_value'],
            },
            {
              association: 'programmeType',
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

      if (!findCapacitySetting) {
        throw new Error(`Unable To Find The Capacity Setting Specified.`);
      }

      const findRunningAdmission = await runningAdmissionService
        .findOneRunningAdmission({
          where: {
            id: findCapacitySetting.runningAdmissionProgramme
              .running_admission_id,
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
              attributes: ['id', 'scheme_name'],
            },
          ],
          nest: true,
        })
        .then((res) => {
          if (res) {
            return res.toJSON();
          }
        });

      if (!findRunningAdmission) {
        throw new Error(`Unable To Find The Running Admission Specified.`);
      }

      const workbook = new excelJs.Workbook();
      const rootSheet = workbook.addWorksheet('APPLICANTS');

      rootSheet.mergeCells('C1', 'O3');
      rootSheet.mergeCells('A1', 'B2');
      const titleCell = rootSheet.getCell('C1');

      rootSheet.getRow(1).height = 65;

      titleCell.value = `${
        institutionStructure.institution_name || 'ACMIS'
      } \n APPLICANTS NOT SELECTED ON RUNNING ADMISSION FROM ${moment(
        findRunningAdmission.admission_start_date
      ).format('MMMM Do YYYY')} TO ${moment(
        findRunningAdmission.admission_end_date
      ).format('MMMM Do YYYY')} \n SCHEME: ${
        findRunningAdmission.admissionScheme.scheme_name
      }, ACADEMIC YEAR: ${
        findRunningAdmission.academicYear.metadata_value
      }, INTAKE: ${
        findRunningAdmission.intake.metadata_value
      }, DEGREE CATEGORY: ${
        findRunningAdmission.degreeCategory.metadata_value
      } \n PROGRAMME: (${
        findCapacitySetting.runningAdmissionProgramme.programme.programme_code
      }) ${
        findCapacitySetting.runningAdmissionProgramme.programme.programme_title
      }, ALIAS: ${
        findCapacitySetting.alias ? findCapacitySetting.alias.alias_code : ``
      }, CAMPUS: ${
        findCapacitySetting.campus.metadata_value
      }, PROGRAMME TYPE: ${
        findCapacitySetting.programmeType.metadata_value
      }, CAPACITY: ${findCapacitySetting.capacity}.`;

      titleCell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
      };

      titleCell.font = { bold: true, size: 10, name: 'Arial' };

      const headerRow = rootSheet.getRow(3);

      headerRow.values = map(weightedApplicantColumns, 'header');
      headerRow.font = { bold: true, size: 11, color: '#2c3e50' };
      rootSheet.columns = weightedApplicantColumns.map((column) => {
        delete column.header;

        return column;
      });
      rootSheet.getRow(3).height = 40;

      rootSheet.views = [
        {
          state: 'frozen',
          xSplit: 0,
          ySplit: 3,
          topLeftCell: 'G10',
          activeCell: 'A1',
        },
      ];

      const templateData = [];

      const ordered = orderBy(data, ['applicant_weights'], ['desc']);

      ordered.forEach((applicant) => {
        const index = applicant.choices.findIndex(
          (choice) =>
            parseInt(choice.choice_number, 10) ===
            parseInt(applicant.choice_number, 10)
        );

        if (index > -1) {
          applicant.choices.splice(index, 1);
        }

        const choiceCodes = [];
        const choiceAliases = [];
        const choiceNumbers = [];
        const choiceCampuses = [];
        const choiceTypes = [];
        const choiceEntryYears = [];
        const choiceWeights = [];

        applicant.choices.forEach((choice) => {
          choiceCodes.push(choice.programme_code);
        });

        applicant.choices.forEach((choice) => {
          choiceAliases.push(choice.code);
        });

        applicant.choices.forEach((choice) => {
          choiceNumbers.push(toUpper(choice.choice_number_name));
        });

        applicant.choices.forEach((choice) => {
          choiceCampuses.push(toUpper(choice.campus));
        });

        applicant.choices.forEach((choice) => {
          choiceTypes.push(toUpper(choice.programme_type));
        });

        applicant.choices.forEach((choice) => {
          choiceEntryYears.push(toUpper(choice.entry_study_year));
        });

        applicant.choices.forEach((choice) => {
          choiceWeights.push(toUpper(choice.applicant_weights));
        });

        templateData.push([
          toUpper(trim(applicant.form_id)),
          toUpper(trim(applicant.surname)),
          toUpper(trim(applicant.other_names)),
          trim(applicant.email),
          toUpper(trim(applicant.phone)),
          toUpper(trim(applicant.gender)),
          toUpper(
            trim(
              findCapacitySetting.runningAdmissionProgramme.programme
                .programme_code
            )
          ),
          toUpper(
            trim(
              findCapacitySetting.alias
                ? findCapacitySetting.alias.alias_code
                : ``
            )
          ),
          toUpper(trim(findCapacitySetting.campus.metadata_value)),
          toUpper(trim(findCapacitySetting.programmeType.metadata_value)),
          toUpper(trim(applicant.applicant_weights)),
          toUpper(trim(applicant.choice_number_name)),
          toUpper(trim(applicant.payment_status)) === 'T'
            ? 'PAID'
            : toUpper(trim(applicant.payment_status)),
          parseInt(applicant.amount).toLocaleString(),
          toUpper(trim(applicant.ura_prn)),
          choiceCodes.toString().replace(/["[]]/g, ''),
          choiceAliases.toString().replace(/["[]]/g, ''),
          choiceNumbers.toString().replace(/["[]]/g, ''),
          choiceCampuses.toString().replace(/["[]]/g, ''),
          choiceTypes.toString().replace(/["[]]/g, ''),
          choiceEntryYears.toString().replace(/["[]]/g, ''),
          choiceWeights.toString().replace(/["[]]/g, ''),
          applicant.reason ? applicant.reason : '',
        ]);
      });

      rootSheet.addRows(templateData);

      const uploadPath = `${process.cwd()}/src/assets/documents/templates`;

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true }, (err) => {
          throw new Error(err.message);
        });
      }

      const template = `${uploadPath}/not-selected-applicants-${surname}-${otherNames}-${user}-${now()}.xlsm`;

      await workbook.xlsx.writeFile(template);
      await res.download(template, 'NOT-SELECTED-APPLICANTS.xlsx', (error) => {
        if (error) {
          throw new Error(error.message);
        }
      });
    } catch (error) {
      http.setError(400, 'Unable To Download Template.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * GENERATE UNEB REPORT FROM APPLICANTS DATA
   *
   * @param {*} req
   * @param {*} res
   * @returns
   */
  generateUnebReport(req, res) {
    try {
      getUNEBReport(req, res, 'Full');
    } catch (error) {
      http.setError(400, 'Unable To Download Report.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  // recommend graduate applicants

  async recommendGraduateApplicants(req, res) {
    try {
      const data = req.body;

      const user = req.user.id;

      if (!data.requests) {
        throw new Error(`Invalid Request`);
      }

      data.recommended_by_id = user;
      data.recommended_at = moment.now();

      // const userBoundLevel = await userService.findUserRoleBoundLevel({
      //   user_id: user,
      //   role_id: req.body.role_id,
      //   bound_level: 'PROGRAMMES',
      // });

      // if (!userBoundLevel) {
      //   throw new Error(`Access Domain Not Defined`);
      // } else if (userBoundLevel.has_access_to_all === false) {
      //   const userRoleProgramme = await userService.userRoleProgramme({
      //     user_id: user,
      //     role_id: req.body.role_id,
      //     programme_id: findStudentResult.studentProgramme.programme_id,
      //   });

      //   if (!userRoleProgramme) {
      //     throw new Error(
      //       `Access to Student Record Denied(PROGRAMME Permission Denied)`
      //     );
      //   }
      // }

      const recommendApplicants = [];

      await model.sequelize.transaction(async (transaction) => {
        for (const eachObject of data.requests) {
          let options = {};

          if (!eachObject.recommendation_status) {
            throw new Error(`Invalid Request (add recommendation status)`);
          }

          if (
            eachObject.recommendation_status === 'NOT RECOMMENDED' &&
            !eachObject.recommendation_reason
          ) {
            throw new Error(`Please Provide Reason`);
          } else if (
            eachObject.recommendation_status === 'RECOMMENDED' ||
            (eachObject.recommendation_status === 'NOT RECOMMENDED' &&
              eachObject.recommendation_reason)
          ) {
            options = {
              id: eachObject.id,
              recommendation_status: 'PENDING',
            };
            eachObject.recommended_by_id = user;
          } else {
            throw new Error(`Invalid Status`);
          }

          const findCampusApplicant = await runningAdmissionApplicantService
            .findOneApplicantsByProgramme({
              where: { ...options },
              attributes: [
                'id',
                'form_id',
                'choice_number',
                'recommendation_status',
                'recommendation_reason',
                'recommended_by_id',
                'recommended_at',
              ],
              nest: true,
            })
            .then(function (res) {
              if (res) {
                const result = res.toJSON();

                return result;
              }
            });

          // userRoleProgramme

          if (!findCampusApplicant) {
            throw new Error(
              `One of the requests you are trying to Update is not valid.`
            );
          }

          const updateDAta = (({
            recommendation_status,
            recommendation_reason,
          }) => ({
            recommendation_status,
            recommendation_reason,
          }))(eachObject);

          const applicantResult = (({
            recommendation_status,
            recommendation_reason,
          }) => ({
            recommendation_status,
            recommendation_reason,
          }))(findCampusApplicant);

          let notMatched = 0;

          let currentDAta = {};

          let previousDAta = {};

          Object.keys(updateDAta).forEach((key) => {
            if (updateDAta[key]) {
              if (applicantResult[key] !== updateDAta[key]) {
                const previousKey = key;

                notMatched = notMatched + 1;
                previousDAta[previousKey] = applicantResult[key];
                currentDAta[previousKey] = updateDAta[key];
              } else {
                notMatched = notMatched + 0;
              }
            }
          });

          if (notMatched === 0) {
            throw new Error(`Invalid Update Request(No Data Changes)`);
          }

          const updateResult =
            await runningAdmissionApplicantService.updateApplicantProgrammeChoice(
              findCampusApplicant.id,
              {
                recommended_by_id: user,
                recommended_at: new Date(),
                ...updateDAta,
              },
              transaction
            );

          await activityLog(
            'createAdmissionLog',
            user,
            'UPDATE RECOMMENDATION',
            `UPDATE APPLICANT CHOICES (${eachObject.id}) FOR ${findCampusApplicant.form_id}`,
            currentDAta,
            previousDAta,
            null,
            null,
            `iPv4-${iPv4}, hostIp-${req.ip}`,
            userAgent.data,
            '00000',
            transaction
          );

          const result = updateResult[1][0];

          recommendApplicants.push(result);
        }
      });

      http.setSuccess(200, `Applicant(s) Recommended  Updated successfully`, {
        recommendApplicants,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, `Unable To Recommend Applicant(s)`, {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

const getUNEBReport = async (req, res, category) => {
  try {
    const {
      id: user,
      surname,
      other_names: otherNames,
      remember_token: rememberToken,
    } = req.user;
    const limitValue = appConfig.ADMISSION_DOWNLOAD_LIMIT;
    const context = req.body;
    const institutionStructure =
      await institutionStructureService.findInstitutionStructureRecords({
        attributes: ['institution_name', 'institution_logo'],
      });

    if (!institutionStructure) {
      throw new Error('Unable To Find Institution Structure.');
    }

    const findRunningAdmission = await runningAdmissionService
      .findOneRunningAdmission({
        where: {
          academic_year_id: context.academic_year_id,
          intake_id: context.intake_id,
          admission_scheme_id: context.admission_scheme_id,
          degree_category_id: context.degree_category_id,
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
        ],
        nest: true,
      })
      .then(function (res) {
        if (res) {
          const result = res.toJSON();

          return result;
        }
      });

    if (!findRunningAdmission) {
      throw new Error(`Unable To Find Running Admission record.`);
    }

    const contextResults =
      await admissionSchemeReportsService.admissionSchemeReport(context);
    const formattedApplicants = admissionReportsFunctions(contextResults);

    let totalApplicants = 0;

    let findProgramme;

    if (category === 'programme-campus') {
      findProgramme = await programmeService.findOneProgramme({
        where: { id: context.programme_id },
      });

      const programmeApplicants =
        await runningAdmissionViewsService.programmeCampusApplicants(context);

      if (context.key === 'all') {
        totalApplicants = programmeApplicants.length;
      } else {
        totalApplicants = filter(
          programmeApplicants,
          (app) => app.payment_status === 'T'
        ).length;
      }
    } else {
      totalApplicants = formattedApplicants.totalSubmittedApplications;

      if (context.category === 'paid') {
        totalApplicants = formattedApplicants.totalPaidSubmittedApplications;
      } else if (context.category === 'unpaid') {
        totalApplicants = formattedApplicants.unpaidApplications;
      }
    }

    const workbook = new excelJs.Workbook();
    const rootSheet = workbook.addWorksheet('APPLICANTS');

    rootSheet.mergeCells('C1', 'O3');
    rootSheet.mergeCells('A1', 'B2');
    const titleCell = rootSheet.getCell('C1');

    let applicationType = 'ALL COMPLETED, PAID AND UNPAID APPLICATIONS';

    if (context.category === 'unpaid') {
      applicationType = 'ALL COMPLETED AND UNPAID APPLICATIONS';
    } else if (context.category === 'paid') {
      applicationType = 'COMPLETED AND PAID APPLICATIONS';
    }

    rootSheet.getRow(1).height = 65;
    const titleText = `${
      institutionStructure.institution_name
        ? toUpper(institutionStructure.institution_name)
        : 'ACMIS'
    } \n UNEB ADMISSION REPORT FOR SCHEME: ${
      findRunningAdmission.admissionScheme.scheme_name
    } \n ACADEMIC YEAR: ${
      findRunningAdmission.academicYear.metadata_value
    }, INTAKE: ${
      findRunningAdmission.intake.metadata_value
    }, DEGREE CATEGORY: ${
      findRunningAdmission.degreeCategory.metadata_value
    } \n ${
      category === 'programme-campus'
        ? 'COMPLETED AND PAID APPLICANTS'
        : applicationType
    } (${parseInt(totalApplicants, 10).toLocaleString()})${
      category === 'programme-campus' && findProgramme
        ? `\n FOR PROGRAMME: ${findProgramme.programme_title}`
        : ''
    }`;

    titleCell.value = titleText;

    titleCell.alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true,
    };

    titleCell.font = { bold: true, size: 10, name: 'Arial' };

    const headerRow = rootSheet.getRow(3);
    const institutionCode = appConfig.TAX_HEAD_CODE;
    const hasDiploma = includes(
      findRunningAdmission.admissionScheme.scheme_name,
      'DIPLOMA'
    );

    let choiceColumns = [];

    let unebReportColumns = [];

    if (category === 'programme-campus') {
      choiceColumns = [
        {
          header: 'CODE/ALIAS',
          key: `prog_code`,
          width: 25,
        },
        {
          header: 'CHOICE NUMBER',
          key: `choice_number`,
          width: 25,
        },
      ];
      unebReportColumns = getUNEBReportColumns(flatten(choiceColumns));
    } else {
      choiceColumns = times(findRunningAdmission.number_of_choices).map(
        (choiceNumber) => {
          return [
            {
              header: toUpper(
                `${moment.localeData().ordinal(choiceNumber + 1)} CHOICE CODE`
              ),
              key: `choice_${choiceNumber + 1}`,
              width: 25,
            },
            {
              header: toUpper(
                `${moment.localeData().ordinal(choiceNumber + 1)} CHOICE CAMPUS`
              ),
              key: `campus_${choiceNumber + 1}`,
              width: 25,
            },
            {
              header: toUpper(
                `${moment
                  .localeData()
                  .ordinal(choiceNumber + 1)} CHOICE STUDY TIME`
              ),
              key: `study_time_${choiceNumber + 1}`,
              width: 25,
            },
            {
              header: toUpper(
                `${moment
                  .localeData()
                  .ordinal(choiceNumber + 1)} CHOICE ENTRY YEAR`
              ),
              key: `entry_year_${choiceNumber + 1}`,
              width: 25,
            },
          ];
        }
      );
    }

    if (institutionCode === 'FMUBS02' && category !== 'programme-campus') {
      choiceColumns = times(findRunningAdmission.number_of_choices).map(
        (choiceNumber) => {
          return [
            {
              header: toUpper(
                `${moment.localeData().ordinal(choiceNumber + 1)} CHOICE`
              ),
              key: `choice_${choiceNumber + 1}`,
              width: 25,
            },
          ];
        }
      );
    }

    if (institutionCode === 'FMUBS02') {
      unebReportColumns = getMUBSUNEBReportColumns(flatten(choiceColumns));
    } else if (institutionCode === 'FKYU03' && hasDiploma) {
      unebReportColumns = getKYUDiplomaReportColumns(flatten(choiceColumns));
    } else {
      unebReportColumns = getUNEBReportColumns(flatten(choiceColumns));
    }

    headerRow.values = map(unebReportColumns, 'header');
    headerRow.font = { bold: true, size: 11, color: '#2c3e50' };
    rootSheet.columns = unebReportColumns.map((column) => {
      delete column.header;

      return column;
    });
    rootSheet.getRow(3).height = 40;

    rootSheet.views = [
      {
        state: 'frozen',
        xSplit: 0,
        ySplit: 3,
        topLeftCell: 'G10',
        activeCell: 'A1',
      },
    ];

    context.offset_value = 0;
    context.limit_value = limitValue;

    if (totalApplicants <= limitValue) {
      let applicants = [];

      if (category === 'programme-campus') {
        applicants = await admissionSchemeReportsService
          .paidCompleteProgrammeReport(context)
          .catch((err) => {
            throw new Error(err.message);
          });
      } else if (institutionCode === 'FKYU03' && hasDiploma) {
        if (context.category === 'paid') {
          applicants = await admissionSchemeReportsService
            .diplomaAdmissionReport(context)
            .catch((err) => {
              throw new Error(err.message);
            });
        } else if (context.category === 'unpaid') {
          applicants = await admissionSchemeReportsService
            .unpaidlDiplomaApplicantReport(context)
            .catch((err) => {
              throw new Error(err.message);
            });
        } else if (context.category === 'all') {
          applicants = await admissionSchemeReportsService
            .AllDiplomaApplicantReport(context)
            .catch((err) => {
              throw new Error(err.message);
            });
        }
      } else {
        if (context.category === 'paid') {
          applicants = await admissionSchemeReportsService
            .unebAdmissionReport(context)
            .catch((err) => {
              throw new Error(err.message);
            });
        } else if (context.category === 'unpaid') {
          applicants = await admissionSchemeReportsService
            .unebUnpaidApplications(context)
            .catch((err) => {
              throw new Error(err.message);
            });
        } else if (context.category === 'all') {
          applicants = await admissionSchemeReportsService
            .unebAllApplications(context)
            .catch((err) => {
              throw new Error(err.message);
            });
        }
      }

      const templateData = getUNEBApplicants(
        applicants,
        findRunningAdmission.number_of_choices,
        category,
        {
          ...context,
          scheme_name: findRunningAdmission.admissionScheme.scheme_name,
        }
      );

      rootSheet.addRows(templateData);
    } else {
      const chunkRecords = Math.ceil(totalApplicants / limitValue);

      for (const chunkNumber of times(chunkRecords)) {
        const offsetValue =
          chunkNumber === 0 ? 1 : limitValue * chunkNumber + 1;

        context.offset_value = offsetValue;
        let applicants = [];

        if (category === 'programme-campus') {
          applicants = await admissionSchemeReportsService
            .paidCompleteProgrammeReport(context)
            .catch((err) => {
              throw new Error(err.message);
            });
        } else if (institutionCode === 'FKYU03' && hasDiploma) {
          if (context.category === 'paid') {
            applicants = await admissionSchemeReportsService
              .diplomaAdmissionReport(context)
              .catch((err) => {
                throw new Error(err.message);
              });
          } else if (context.category === 'unpaid') {
            applicants = await admissionSchemeReportsService
              .unpaidlDiplomaApplicantReport(context)
              .catch((err) => {
                throw new Error(err.message);
              });
          } else if (context.category === 'all') {
            applicants = await admissionSchemeReportsService
              .AllDiplomaApplicantReport(context)
              .catch((err) => {
                throw new Error(err.message);
              });
          }
        } else {
          if (context.category === 'paid') {
            applicants = await admissionSchemeReportsService
              .unebAdmissionReport(context)
              .catch((err) => {
                throw new Error(err.message);
              });
          } else if (context.category === 'unpaid') {
            applicants = await admissionSchemeReportsService
              .unebUnpaidApplications(context)
              .catch((err) => {
                throw new Error(err.message);
              });
          } else if (context.category === 'all') {
            applicants = await admissionSchemeReportsService
              .unebAllApplications(context)
              .catch((err) => {
                throw new Error(err.message);
              });
          }
        }

        const templateData = getUNEBApplicants(
          applicants,
          findRunningAdmission.number_of_choices,
          category,
          {
            ...context,
            scheme_name: findRunningAdmission.admissionScheme.scheme_name,
          }
        );

        rootSheet.addRows(templateData);
      }
    }

    const uploadPath = path.join(
      appConfig.ASSETS_ROOT_DIRECTORY,
      '/documents/admissions/uneb-reports'
    );

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true }, (err) => {
        throw new Error(err.message);
      });
    }

    const template = `${uploadPath}/uneb-report-${surname}-${otherNames}-${user}-${now()}.xlsm`;

    const str = findRunningAdmission.academicYear.metadata_value.replace(
      '/',
      '-'
    );

    await workbook.xlsx.writeFile(template);

    const downloadEvent = new DownloadEvent();

    downloadEvent.downloadUnebReport(res, template, str, findRunningAdmission);

    await model.sequelize.transaction(async (transaction) => {
      await createAdmissionLog(
        {
          user_id: user,
          operation: `DOWNLOAD TEMPLATE`,
          area_accessed: `MANAGE APPLICANTS`,
          current_data: replace(titleText, '\n', ''),
          ip_address: req.connection.remoteAddress,
          user_agent: req.get('user-agent'),
          token: rememberToken,
        },
        transaction
      );
    });
  } catch (error) {
    throw new Error(error.message);

    // throw Error(error);
  }
};

const getRunningAdmissionApplicantAttributes = function () {
  return {
    include: [
      {
        association: 'sections',
        attributes: ['id', 'metadata_value'],
        through: {
          attributes: [],
        },
      },
      {
        association: 'runningAdmission',
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
                  attributes: [],
                },
              },
              {
                association: 'formSections',
                attributes: ['id', 'form_section_id', 'section_number'],
              },
            ],
          },
        ],
      },
      {
        association: 'applicant',
        attributes: ['id', 'surname', 'other_names', 'email', 'phone'],
      },
    ],
  };
};

const getApplicantsByProgrammeAttributes = function () {
  return {
    attributes: ['form_id', 'choice_number'],
    include: [
      {
        association: 'applicant',
        attributes: {
          exclude: [
            'password',
            'is_default_password',
            'password_changed_at',
            'avatar',
            'email_verified',
            'remember_token',
            'last_login',
            'email_verified_at',
            'created_at',
            'updated_at',
            'deleted_at',
          ],
        },
      },
    ],
  };
};

const getUNEBApplicants = (
  contextResult,
  choiceNumber = 0,
  category,
  context
) => {
  const templateData = [];

  if (isArray(contextResult)) {
    for (const applicant of contextResult) {
      const choices = [];

      if (category === 'programme-campus') {
        const findProg = find(
          applicant.programme_choices,
          (prog) =>
            parseInt(prog.programme_id, 10) ===
            parseInt(context.programme_id, 10)
        );

        choices.push(
          findProg
            ? [findProg.code, toUpper(findProg.choice_number_name)]
            : [null, null]
        );
      } else {
        if (!isEmpty(applicant.programme_choices)) {
          times(choiceNumber).forEach((choiceNumber) => {
            const findChoice = applicant.programme_choices.find(
              (choice) =>
                parseInt(choice.choice_number, 10) === choiceNumber + 1
            );

            let progDetails = [null, null, null, null];

            if (findChoice && appConfig.TAX_HEAD_CODE !== 'FMUBS02') {
              progDetails = [
                findChoice.code,
                findChoice.campus,
                findChoice.programme_type,
                findChoice.entry_study_year,
              ];
            } else if (findChoice && appConfig.TAX_HEAD_CODE === 'FMUBS02') {
              progDetails = [findChoice.code];
            } else if (!findChoice && appConfig.TAX_HEAD_CODE === 'FMUBS02') {
              progDetails = [null];
            }
            choices.push(progDetails);
          });
        }
      }

      if (appConfig.TAX_HEAD_CODE === 'FMUBS02') {
        templateData.push([
          applicant.form_id,
          `${toUpper(applicant.surname)} ${applicant.other_names}`,
          toUpper(applicant.gender),
          applicant.country,
          applicant.nationality,
          applicant.district_of_origin,
          applicant.district_of_birth,
          applicant.payment_status,
          ...flatten(choices),
          applicant.olevel_index || '',
          applicant.olevel_year || '',
          applicant.alevel_index || '',
          applicant.alevel_year || '',
          `D=${applicant.distinctions || 0}, C=${applicant.credits || 0}, P=${
            applicant.passes || 0
          }`,
          getFormattedArray(applicant.results),
        ]);
      } else if (
        appConfig.TAX_HEAD_CODE === 'FKYU03' &&
        includes(context.scheme_name, 'DIPLOMA')
      ) {
        templateData.push([
          applicant.form_id,
          `${toUpper(applicant.surname)} ${applicant.other_names}`,
          toUpper(applicant.gender),
          ...flatten(choices),
          applicant.nationality,
          applicant.payment_status,
          getFormattedArray(applicant.olevel_results),
          applicant.olevel_year || '',
          getFormattedArray(applicant.results),
          applicant.alevel_year || '',
        ]);
      } else {
        templateData.push([
          applicant.form_id,
          `${toUpper(applicant.surname)} ${applicant.other_names}`,
          toUpper(applicant.gender),
          applicant.country,
          applicant.nationality,
          applicant.district_of_origin,
          applicant.district_of_birth,
          applicant.email,
          applicant.phone,
          applicant.payment_status,
          ...flatten(choices),
          applicant.olevel_index || '',
          applicant.olevel_year || '',
          applicant.distinctions || '',
          applicant.credits || '',
          applicant.passes || '',
          applicant.olevel_school || '',
          getFormattedArray(applicant.o_level_subjects),
          applicant.alevel_index || '',
          applicant.alevel_year || '',
          applicant.alevel_school || '',
          getFormattedArray(applicant.results),
          applicant.date_of_birth,
          getFormattedOtherQualifications(applicant.other_qualifications),
        ]);
      }
    }
  }

  return templateData;
};

const getFormattedArray = (dataToFormat) => {
  let formattedString = '';

  if (isArray(dataToFormat) && !isEmpty(dataToFormat)) {
    for (const result of dataToFormat) {
      if (result.name) {
        const splittedName = result.name
          .split(' ')
          .map((l) => toUpper(l.substring(0, 3)));

        formattedString += `${splittedName.join('-')}=${result.result},  `;
      }
    }
  }

  return formattedString;
};

const getFormattedOtherQualifications = (data) => {
  let formattedString = '';

  if (isArray(data) && !isEmpty(data)) {
    for (const result of data.slice(0, 2)) {
      if (
        result.award_obtained &&
        result.does_not_have_qualification === false
      ) {
        const splittedName = result.award_obtained
          .split(' ')
          .map((l) => toUpper(l.substring(0, 3)));

        formattedString += `${splittedName.join('-')}:=[${
          result.awarding_body
        },${result.award_classification} - GRADE: ${result.grade_obtained},${
          result.award_type
        },${result.award_end_year}],`;
      }
    }
  }

  return formattedString;
};

/**
 *
 * @param {*} programmeCampusId
 * @returns
 */
const getDiscardedApplicants = async (programmeCampusId) => {
  try {
    const discarded = [];

    const findCapacitySetting = await runningAdmissionProgrammeCampusService
      .findOneRunningAdmissionProgrammeCampus({
        where: {
          id: programmeCampusId,
        },
        include: [
          {
            association: 'runningAdmissionProgramme',
            include: [
              {
                association: 'capacities',
                attributes: [
                  'id',
                  'running_admission_programme_id',
                  'programme_alias_id',
                  'campus_id',
                  'programme_type_id',
                  'capacity',
                ],
                include: [
                  {
                    association: 'entryStudyYears',
                    attributes: [
                      'id',
                      'running_admission_programme_campus_id',
                      'entry_study_year_id',
                    ],
                  },
                ],
              },
              {
                association: 'weightingCriteria',
                attributes: ['id'],
              },
              {
                association: 'programme',
                attributes: ['id', 'programme_code', 'programme_title'],
              },
            ],
          },
        ],
        nest: true,
      })
      .then((res) => {
        if (res) {
          return res.toJSON();
        }
      });

    if (!findCapacitySetting) {
      throw new Error(`Unable To Find The Capacity Setting.`);
    }

    const findTheWeightingCriteria =
      await programmeVersionWeightingCriteriaService
        .findOneRecord({
          where: {
            id: findCapacitySetting.runningAdmissionProgramme.weightingCriteria
              .id,
          },
          include: [
            {
              association: 'categories',
              attributes: [
                'id',
                'criteria_id',
                'uneb_study_level_id',
                'weighting_category_id',
                'weighting_condition_id',
                'weight',
              ],
            },
          ],
          nest: true,
        })
        .then((res) => {
          if (res) {
            return res.toJSON();
          }
        });

    const metadataValues = await metadataValueService.findAllMetadataValues({
      include: {
        association: 'metadata',
        attributes: ['id', 'metadata_name'],
      },
      attributes: ['id', 'metadata_value'],
    });

    const oLevelId = getMetadataValueId(
      metadataValues,
      'O LEVEL',
      'UNEB STUDY LEVELS'
    );

    const findAllApplicantProgrammeChoices =
      await applicantProgrammeChoiceService
        .findAllApplicantProgrammeChoices({
          where: {
            running_admission_id:
              findCapacitySetting.runningAdmissionProgramme
                .running_admission_id,
            programme_campus_id: programmeCampusId,
          },
          attributes: [
            'id',
            'running_admission_id',
            'applicant_id',
            'entry_study_year_id',
            'form_id',
            'programme_campus_id',
            'choice_number_name',
            'choice_number',
            'applicant_weights',
            'applicant_selected',
          ],
          include: [
            {
              association: 'programmeCampus',
              attributes: ['id', 'programme_type_id'],
            },
            {
              association: 'applicant',
              attributes: [
                'id',
                'surname',
                'other_names',

                'email',
                'phone',
                'gender',
              ],
            },
          ],
        })
        .then((res) => {
          if (res) {
            return res.map((item) => item.get({ plain: true }));
          }
        });

    const findAllApplicantProgrammeChoicesByRunningAdmission =
      await applicantProgrammeChoiceService
        .findAllApplicantProgrammeChoices({
          where: {
            running_admission_id:
              findCapacitySetting.runningAdmissionProgramme
                .running_admission_id,
          },
          attributes: [
            'id',
            'running_admission_id',
            'applicant_id',
            'entry_study_year_id',
            'form_id',
            'programme_campus_id',
            'choice_number_name',
            'choice_number',
            'applicant_weights',
            'applicant_selected',
          ],
          include: [
            {
              association: 'programmeCampus',
              include: [
                {
                  association: 'campus',
                  attributes: ['id', 'metadata_value'],
                },
                {
                  association: 'programmeType',
                  attributes: ['id', 'metadata_value'],
                },
                {
                  association: 'runningAdmissionProgramme',
                  attributes: ['id'],
                  include: [
                    {
                      association: 'programme',
                      attributes: ['id', 'programme_code', 'programme_title'],
                    },
                  ],
                },
              ],
            },
          ],
        })
        .then((res) => {
          if (res) {
            return res.map((item) => item.get({ plain: true }));
          }
        });

    const findAllRunningAdmissionApplicants =
      await runningAdmissionApplicantService.findAllRunningAdmissionApplicants({
        where: {
          running_admission_id:
            findCapacitySetting.runningAdmissionProgramme.running_admission_id,
          application_status: 'COMPLETED',
          payment_status: 'T',
        },
        raw: true,
      });

    const findAllOLevelData = await applicantOLevelDataService
      .findAllApplicantOLevelData({
        where: {
          running_admission_id:
            findCapacitySetting.runningAdmissionProgramme.running_admission_id,
        },
        include: [
          {
            association: 'subjects',
            attributes: [
              'id',
              'uneb_subject_id',
              'applicant_o_level_data_id',
              'code',
              'result',
            ],
          },
        ],
      })
      .then((res) => {
        if (res) {
          return res.map((item) => item.get({ plain: true }));
        }
      });

    const findAllALevelData = await applicantALevelDataService
      .findAllApplicantALevelData({
        where: {
          running_admission_id:
            findCapacitySetting.runningAdmissionProgramme.running_admission_id,
        },
        include: [
          {
            association: 'subjects',
          },
        ],
      })
      .then((res) => {
        if (res) {
          return res.map((item) => item.get({ plain: true }));
        }
      });

    const findOLevelCategories = [];

    if (!findCapacitySetting.runningAdmissionProgramme.weighting_criteria_id) {
      throw new Error(
        `${findCapacitySetting.runningAdmissionProgramme.programme.programme_code} ${findCapacitySetting.runningAdmissionProgramme.programme.programme_title} Requires A Weighting Criteria.`
      );
    }

    if (findCapacitySetting.runningAdmissionProgramme.is_weighted === false) {
      throw new Error(
        `${findCapacitySetting.runningAdmissionProgramme.programme.programme_code} ${findCapacitySetting.runningAdmissionProgramme.programme.programme_title} Has Not Yet Been Weighted.`
      );
    }

    if (!isEmpty(findTheWeightingCriteria.categories)) {
      const filteredOLevelCategories =
        findTheWeightingCriteria.categories.filter(
          (category) =>
            parseInt(category.uneb_study_level_id, 10) ===
            parseInt(oLevelId, 10)
        );

      if (!isEmpty(filteredOLevelCategories)) {
        for (const item of filteredOLevelCategories) {
          const findCategory = await programmeVersionWeightingCriteriaService
            .findOneWeightingCriteriaCategory({
              where: {
                id: item.id,
              },
              include: [
                {
                  association: 'unebStudyLevel',
                  attributes: ['id', 'metadata_value'],
                },
                {
                  association: 'weightingCategory',
                  attributes: ['id', 'metadata_value'],
                },
                {
                  association: 'weightingCondition',
                  attributes: ['id', 'metadata_value'],
                },
                {
                  association: 'unebSubjects',
                  include: [
                    {
                      association: 'unebSubject',
                    },
                  ],
                },
              ],
              nest: true,
            })
            .then((res) => {
              if (res) {
                return res.toJSON();
              }
            });

          if (findCategory) {
            findOLevelCategories.push(findCategory);
          }
        }
      }
    }

    const filtered = [];
    const validApplicantChoices = [];

    const filteredProgrammeChoices = findAllApplicantProgrammeChoices.filter(
      (choice) => choice.applicant_weights
    );

    if (!isEmpty(filteredProgrammeChoices)) {
      filteredProgrammeChoices.forEach((choice) => {
        choice.capacity = findCapacitySetting.capacity;

        filtered.push(choice);
      });
    }

    if (!isEmpty(filtered)) {
      for (const choice of filtered) {
        const checkCompletion = findAllRunningAdmissionApplicants.find(
          (record) =>
            parseInt(record.applicant_id, 10) ===
              parseInt(choice.applicant_id, 10) &&
            trim(record.form_id) === trim(choice.form_id)
        );

        if (checkCompletion) {
          if (toUpper(trim(checkCompletion.payment_status)) === 'T') {
            // CHECK MINIMUM O LEVEL SUBJECTS
            const findOLevel = findAllOLevelData.find(
              (oLevelData) =>
                parseInt(oLevelData.applicant_id, 10) ===
                parseInt(choice.applicant_id, 10)
            );

            // CHECK MINIMUM A LEVEL SUBJECTS
            const findALevel = findAllALevelData.find(
              (oLevelData) =>
                parseInt(oLevelData.applicant_id, 10) ===
                parseInt(choice.applicant_id, 10)
            );

            if (findOLevel && findALevel) {
              if (
                findOLevel.subjects.length >= 7 &&
                findALevel.subjects.length >= 3
              ) {
                // CHECK MINIMUN A LEVEL PRINCIPAL PASSES

                const totalFailures = [];

                const findOs = findALevel.subjects.filter(
                  (sbj) => toUpper(trim(sbj.result)) === 'O'
                );

                const findFs = findALevel.subjects.filter(
                  (sbj) => toUpper(trim(sbj.result)) === 'F'
                );

                if (!isEmpty(findOs)) {
                  totalFailures.push(...findOs);
                }
                if (!isEmpty(findFs)) {
                  totalFailures.push(...findFs);
                }

                if (totalFailures.length <= 1) {
                  if (!isEmpty(findOLevelCategories)) {
                    const findOLevelData = findAllOLevelData.find(
                      (record) => trim(record.form_id) === trim(choice.form_id)
                    );

                    if (findOLevelData) {
                      if (!isEmpty(findOLevelData.subjects)) {
                        const checkSelectableByOLevel =
                          selectionsBasedOnOLevelSubjects(
                            findOLevelCategories,
                            findOLevelData.subjects
                          );

                        const findEligibility = checkSelectableByOLevel.find(
                          (result) => result.includes('NOT-ELIGIBLE')
                        );

                        if (findEligibility) {
                          discarded.push({
                            ...choice,
                            reason:
                              'APPLICANT HAS BEEN RULED OUT BECAUSE OF FAILURE TO MEET O-LEVEL WEIGHTING CRITERIA REQUIREMENTS FOR THIS PROGRAMME.',
                          });
                        } else {
                          validApplicantChoices.push(choice);
                        }
                      }
                    }
                  } else {
                    validApplicantChoices.push(choice);
                  }
                } else {
                  discarded.push({
                    ...choice,
                    reason:
                      'APPLICANT DOESNOT HAVE ATLEAST 2 PRINCIPAL PASSES AT A-LEVEL.',
                  });
                }
              } else {
                if (findOLevel.subjects.length < 7) {
                  discarded.push({
                    ...choice,
                    reason:
                      'APPLICANT SUBMITTED LESS THAN 7 SUBJECTS AT O-LEVEL.',
                  });
                }

                if (findALevel.subjects.length < 3) {
                  discarded.push({
                    ...choice,
                    reason:
                      'APPLICANT SUBMITTED LESS THAN 3 SUBJECTS AT A-LEVEL.',
                  });
                }
              }
            }
          } else {
            discarded.push({
              ...choice,
              reason: 'APPLICANT DID NOT COMPLETE PAYMENT OF APPLICATION FEES.',
            });
          }
        } else {
          discarded.push({
            ...choice,
            reason:
              'APPLICANT DID NOT COMPLETE SUBMISSION OF THEIR APPLICATION FORM.',
          });
        }
      }
    }

    const remnants = [];

    if (!isEmpty(validApplicantChoices)) {
      validApplicantChoices.forEach((validChoice) => {
        const findAlreadySelected =
          findAllApplicantProgrammeChoicesByRunningAdmission.find(
            (choice) =>
              trim(choice.form_id) === trim(validChoice.form_id) &&
              choice.applicant_selected === true
          );

        if (findAlreadySelected) {
          if (
            parseInt(findAlreadySelected.id, 10) !==
            parseInt(validChoice.id, 10)
          ) {
            discarded.push({
              ...validChoice,
              reason: `APPLICANT HAS ALREADY BEEN SELECTED FOR A DIFFERENT CAPACITY SETTING / PROGRAMME.`,
            });
          }
        } else {
          remnants.push(validChoice);
        }
      });

      if (!isEmpty(remnants)) {
        const notSelected = remnants.filter(
          (remnant) => remnant.applicant_selected === false
        );

        if (!isEmpty(notSelected)) {
          notSelected.forEach((selection) => {
            discarded.push({
              ...selection,
              reason:
                'APPLICANT EXCEEDED THE CAPACITY OF APPLICANTS NEEDED FOR THIS PROGRAMME CHOICE.',
            });
          });
        }
      }
    }

    return discarded;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = RunningAdmissionApplicantController;
