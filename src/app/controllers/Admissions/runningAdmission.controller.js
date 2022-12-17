const { HttpResponse } = require('@helpers');
const {
  runningAdmissionService,
  runningAdmissionProgrammeService,
  metadataValueService,
  admissionSchemeService,
  institutionStructureService,
  applicantProgrammeChoiceService,
  programmeService,
} = require('@services/index');
const { isEmpty, now, map, trim, toUpper, chain, orderBy } = require('lodash');
const excelJs = require('exceljs');
const fs = require('fs');
const { selectedApplicantColumns } = require('./templateColumns');
const moment = require('moment');
const { createAdmissionLog } = require('../Helpers/logsHelper');
const model = require('@models');
const {
  getMetadataValueName,
  getMetadataValueIdWithoutError,
  getMetadataValueId,
} = require('@controllers/Helpers/programmeHelper');
const { appConfig } = require('@root/config');

const http = new HttpResponse();

class RunningAdmissionController {
  /**
   * GET All runningAdmissions.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async index(req, res) {
    try {
      const runningAdmissions =
        await runningAdmissionService.findAllRunningAdmissions({
          ...getRunningAdmissionWithoutProgrammesAttributes(),
        });

      http.setSuccess(200, 'Running Admissions Fetched Successfully', {
        runningAdmissions,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Running Admissions', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * GET All runningAdmissions For The Applicant.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async applicantIndex(req, res) {
    try {
      const runningAdmissions =
        await runningAdmissionService.fetchActiveRunningAdmission();

      http.setSuccess(200, 'Running Admissions Fetched Successfully', {
        runningAdmissions,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Running Admissions', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * CREATE New RunningAdmission Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async createRunningAdmission(req, res) {
    try {
      const data = req.body;
      const { id, remember_token: rememberToken } = req.user;

      data.created_by_id = parseInt(id, 10);

      if (
        data.activate_admission_fees === true &&
        !data.admission_fees_policy_id
      ) {
        throw new Error(`Please Select An Admission Fees Policy.`);
      }

      const metadataValues = await metadataValueService.findAllMetadataValues({
        include: {
          association: 'metadata',
          attributes: ['id', 'metadata_name'],
        },
        attributes: ['id', 'metadata_value'],
      });

      const academicYear = getMetadataValueName(
        metadataValues,
        data.academic_year_id,
        'ACADEMIC YEARS'
      );

      const intake = getMetadataValueName(
        metadataValues,
        data.intake_id,
        'INTAKES'
      );

      const degreeCategory = getMetadataValueName(
        metadataValues,
        data.degree_category_id,
        'DEGREE CATEGORIES'
      );

      const findAdmissionScheme =
        await admissionSchemeService.findOneAdmissionScheme({
          where: {
            id: data.admission_scheme_id,
          },
          attributes: ['id', 'scheme_name'],
          raw: true,
        });

      if (!findAdmissionScheme) {
        throw new Error(`Unable To Find Admission Scheme Specified.`);
      }

      const runningAdmission = await model.sequelize.transaction(
        async (transaction) => {
          const result = await runningAdmissionService.createRunningAdmission(
            data,
            transaction
          );

          if (result[1] === false) {
            throw new Error(`Running Admission context already exists.`);
          }

          await createAdmissionLog(
            {
              user_id: id,
              operation: `CREATE`,
              area_accessed: `RUNNING ADMISSIONS`,
              current_data: `Opened A Running Admission on Scheme: ${findAdmissionScheme.scheme_name}, Academic year: ${academicYear}, Intake: ${intake} and Degree category: ${degreeCategory} starting on ${data.admission_start_date} and ending on ${data.admission_end_date}.`,
              ip_address: req.connection.remoteAddress,
              user_agent: req.get('user-agent'),
              token: rememberToken,
            },
            transaction
          );

          return result;
        }
      );

      http.setSuccess(200, 'Running Admission created successfully', {
        runningAdmission,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to create this Running Admission.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * UPDATE Specific RunningAdmission Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async updateRunningAdmission(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      const { id: user, remember_token: rememberToken } = req.user;

      data.last_updated_by_id = user;
      data.updated_at = moment.now();

      const fetchRunningAdmission =
        await runningAdmissionService.fetchRunningAdmissionById(id);

      if (fetchRunningAdmission === null) {
        throw new Error(`Unable To Find Running Admission.`);
      }

      const metadataValues = await metadataValueService.findAllMetadataValues({
        include: {
          association: 'metadata',
          attributes: ['id', 'metadata_name'],
        },
        attributes: ['id', 'metadata_value'],
      });

      const runningAdmission = await model.sequelize.transaction(
        async (transaction) => {
          const result = await runningAdmissionService.updateRunningAdmission(
            id,
            data,
            transaction
          );

          await createAdmissionLog(
            {
              user_id: user,
              operation: `UPDATE`,
              area_accessed: `RUNNING ADMISSIONS`,
              current_data: `Academic year: ${
                data.academic_year_id
                  ? getMetadataValueName(
                      metadataValues,
                      data.academic_year_id,
                      'ACADEMIC YEARS'
                    )
                  : `...`
              }, Intake: ${
                data.intake_id
                  ? getMetadataValueName(
                      metadataValues,
                      data.intake_id,
                      'INTAKES'
                    )
                  : `...`
              }, Degree category: ${
                data.degree_category_id
                  ? getMetadataValueName(
                      metadataValues,
                      data.degree_category_id,
                      'DEGREE CATEGORIES'
                    )
                  : `...`
              }, start date: ${
                data.admission_start_date ? data.admission_start_date : ``
              }, end date: ${
                data.admission_end_date ? data.admission_end_date : ``
              }.`,
              previous_data: `id: ${fetchRunningAdmission.id}, Academic year: ${fetchRunningAdmission.academic_year}, Intake: ${fetchRunningAdmission.intake}, Degree category: ${fetchRunningAdmission.degree_category}, start date: ${fetchRunningAdmission.admission_start_date}, end date: ${fetchRunningAdmission.admission_end_date}.`,
              ip_address: req.connection.remoteAddress,
              user_agent: req.get('user-agent'),
              token: rememberToken,
            },
            transaction
          );

          const runningAdmission = result[1][0];

          return runningAdmission;
        }
      );

      http.setSuccess(200, 'Running Admission Updated Successfully', {
        runningAdmission,
      });
      if (isEmpty(runningAdmission))
        http.setError(404, 'Running Admission Data Not Found');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Update This Running Admission', {
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
      const { id: user, surname, otherNames } = req.user;

      const { runningAdmissionId } = req.params;

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
            id: runningAdmissionId,
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
        institutionStructure.institution_name || 'TERP'
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
      }.`;

      titleCell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
      };

      titleCell.font = { bold: true, size: 10, name: 'Arial' };

      const headerRow = rootSheet.getRow(3);

      headerRow.values = map(selectedApplicantColumns, 'header');
      headerRow.font = { bold: true, size: 11, color: '#2c3e50' };
      rootSheet.columns = selectedApplicantColumns.map((column) => {
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

      const findAllProgrammeChoices = await applicantProgrammeChoiceService
        .findAllApplicantProgrammeChoices({
          where: {
            applicant_selected: true,
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
                  association: 'alias',
                  attributes: ['id', 'alias_code'],
                },
                {
                  association: 'runningAdmissionProgramme',
                },
              ],
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
              association: 'subjectCombination',
              attributes: ['id', 'subject_combination_code'],
            },
            {
              association: 'applicant',
              attributes: ['id', 'surname', 'other_names', 'gender'],
              include: [
                {
                  association: 'applications',
                  attributes: [
                    'id',
                    'form_id',
                    'running_admission_id',
                    'applicant_id',
                  ],
                },
                {
                  association: 'bioData',
                  attributes: [
                    'id',
                    'form_id',
                    'running_admission_id',
                    'applicant_id',
                    'gender',
                    'nationality',
                  ],
                },
                {
                  association: 'aLevelData',
                  attributes: [
                    'id',
                    'form_id',
                    'running_admission_id',
                    'applicant_id',
                    'school_name',
                    'center_no',
                    'exam_year',
                    'index_number',
                    'is_manual',
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

      const metadataValues = await metadataValueService.findAllMetadataValues({
        include: {
          association: 'metadata',
          attributes: ['id', 'metadata_name'],
        },
        attributes: ['id', 'metadata_value'],
      });

      const allProgrammes = await programmeService.findAllProgrammes({
        attributes: ['id', 'programme_code', 'programme_title'],
        raw: true,
      });

      const templateData = [];

      const groupedRecords = chain(findAllProgrammeChoices)
        .groupBy('programme_campus_id')
        .map((value, key) => ({
          programme_campus_id: key,
          records: orderBy(
            value,
            ['choice_number', 'applicant_weights'],
            ['asc', 'desc']
          ),
        }))
        .value();

      groupedRecords.forEach((group) => {
        if (!isEmpty(group.records)) {
          group.records.forEach((choice) => {
            const findBioData = choice.applicant.bioData.find(
              (bio) =>
                toUpper(trim(bio.form_id)) === toUpper(trim(choice.form_id))
            );

            const findALevelData = choice.applicant.aLevelData.find(
              (bio) =>
                toUpper(trim(bio.form_id)) === toUpper(trim(choice.form_id))
            );

            const findProgramme = allProgrammes.find(
              (prog) =>
                parseInt(prog.id, 10) ===
                parseInt(
                  choice.programmeCampus.runningAdmissionProgramme.programme_id,
                  10
                )
            );

            templateData.push([
              toUpper(trim(choice.applicant.surname)),
              toUpper(trim(choice.applicant.other_names)),
              findBioData ? toUpper(trim(findBioData.gender)) : ``,
              toUpper(trim(choice.form_id)),
              findProgramme ? toUpper(trim(findProgramme.programme_code)) : '',
              findProgramme ? toUpper(trim(findProgramme.programme_title)) : '',
              toUpper(trim(choice.subjectCombination.subject_combination_code)),
              toUpper(
                trim(choice.programmeCampus.programmeType.metadata_value)
              ),
              toUpper(trim(choice.entryStudyYear.metadata_value)),
              toUpper(trim(choice.programmeCampus.campus.metadata_value)),
              toUpper(trim(choice.sponsorship.metadata_value)),
              toUpper(trim(findRunningAdmission.academicYear.metadata_value)),
              toUpper(trim(findRunningAdmission.intake.metadata_value)),
              toUpper(trim(findRunningAdmission.degreeCategory.metadata_value)),
              toUpper(trim(findRunningAdmission.admissionScheme.scheme_name)),
              findBioData ? toUpper(trim(findBioData.nationality)) : ``,
              findALevelData ? toUpper(trim(findALevelData.index_number)) : ``,
              findALevelData ? toUpper(trim(findALevelData.exam_year)) : ``,
              ``,
              findBillingCategory(findBioData.nationality, metadataValues),
              `FALSE`,
              choice.programmeCampus.alias
                ? toUpper(trim(choice.programmeCampus.alias.alias_code))
                : ``,
              choice.applicant_weights,
              toUpper(trim(choice.choice_number_name)),
            ]);
          });
        }
      });

      if (isEmpty(templateData)) {
        throw new Error(
          `Unable to find selected applicants on this running admission.`
        );
      }

      rootSheet.addRows(templateData);

      const uploadPath = `${appConfig.APP_URL}/documents/templates`;

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
   * ACTIVATE Specific RunningAdmission STATUS.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async activateOnlineApplications(req, res) {
    try {
      const { id } = req.params;
      const { id: user, remember_token: rememberToken } = req.user;
      const data = req.body;

      data.last_updated_by_id = user;
      data.updated_at = moment.now();
      data.activate_online_applications = true;

      const fetchRunningAdmission =
        await runningAdmissionService.fetchRunningAdmissionById(id);

      if (fetchRunningAdmission === null) {
        throw new Error(`Unable To Find Running Admission.`);
      }

      const runningAdmission = await model.sequelize.transaction(
        async (transaction) => {
          const updateRunningAdmission =
            await runningAdmissionService.updateRunningAdmission(
              id,
              data,
              transaction
            );

          await createAdmissionLog(
            {
              user_id: user,
              operation: `ACTIVATE`,
              area_accessed: `RUNNING ADMISSIONS`,
              current_data: `Activate Running Admission Where id:${fetchRunningAdmission.id}, Academic year: ${fetchRunningAdmission.academic_year}, Intake: ${fetchRunningAdmission.intake}, Degree category: ${fetchRunningAdmission.degree_category}, start date: ${fetchRunningAdmission.admission_start_date}, end date: ${fetchRunningAdmission.admission_end_date}.`,
              ip_address: req.connection.remoteAddress,
              user_agent: req.get('user-agent'),
              token: rememberToken,
            },
            transaction
          );

          const runningAdmission = updateRunningAdmission[1][0];

          return runningAdmission;
        }
      );

      http.setSuccess(200, 'Online Application started Successfully', {
        runningAdmission,
      });
      if (isEmpty(runningAdmission))
        http.setError(404, 'Online Application Data Not Found');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Start This Online Application', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * DEACTIVATE Specific RunningAdmission STATUS.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async deactivateOnlineApplications(req, res) {
    try {
      const { id } = req.params;
      const { id: user, remember_token: rememberToken } = req.user;
      const data = req.body;

      data.last_updated_by_id = parseInt(req.user.id, 10);
      data.updated_at = moment.now();
      data.activate_online_applications = false;

      const fetchRunningAdmission =
        await runningAdmissionService.fetchRunningAdmissionById(id);

      if (fetchRunningAdmission === null) {
        throw new Error(`Unable To Find Running Admission.`);
      }

      const runningAdmission = await model.sequelize.transaction(
        async (transaction) => {
          const updateRunningAdmission =
            await runningAdmissionService.updateRunningAdmission(
              id,
              data,
              transaction
            );

          await createAdmissionLog(
            {
              user_id: user,
              operation: `DE-ACTIVATE`,
              area_accessed: `RUNNING ADMISSIONS`,
              current_data: `De-Activate Running Admission Where id:${fetchRunningAdmission.id}, Academic year: ${fetchRunningAdmission.academic_year}, Intake: ${fetchRunningAdmission.intake}, Degree category: ${fetchRunningAdmission.degree_category}, start date: ${fetchRunningAdmission.admission_start_date}, end date: ${fetchRunningAdmission.admission_end_date}.`,
              ip_address: req.connection.remoteAddress,
              user_agent: req.get('user-agent'),
              token: rememberToken,
            },
            transaction
          );

          const runningAdmission = updateRunningAdmission[1][0];

          return runningAdmission;
        }
      );

      http.setSuccess(200, 'Online Application stopped Successfully', {
        runningAdmission,
      });
      if (isEmpty(runningAdmission))
        http.setError(404, 'Online Application Data Not Found');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Stop This Online Application', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Get Specific RunningAdmission Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async fetchRunningAdmission(req, res) {
    try {
      const { runningAdmissionId } = req.params;

      const runningAdmission =
        await runningAdmissionService.fetchRunningAdmissionById(
          runningAdmissionId
        );

      // if (isEmpty(runningAdmission))
      //   http.setError(404, 'Running Admission Data Not Found');

      if (runningAdmission === null) {
        http.setError(404, 'Running Admission Data Not Found');
      } else {
        const fetchProgrammes =
          await runningAdmissionProgrammeService.runningAdmissionProgrammes({
            running_admission_id: runningAdmissionId,
          });

        runningAdmission.programmes = fetchProgrammes;
        http.setSuccess(200, 'Running Admission fetch successful', {
          runningAdmission,
        });
      }

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to get this Running Admission', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
  //  admittedDirectUploadProgrammes

  /** 2
   * Get Specific RunningAdmission Data For The Applicant's side.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async fetchRunningAdmissionForApplicant(req, res) {
    try {
      const { id } = req.params;
      const runningAdmission =
        await runningAdmissionService.fetchRunningAdmissionById(id);

      http.setSuccess(200, 'Running Admission fetch successful', {
        runningAdmission,
      });
      if (isEmpty(runningAdmission)) http.setError(404, 'Running Admission');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to get this Running Admission', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Manage applicants by submitting a context to this controller which sends back a list of students that match the context
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async findApplicantsByContext(req, res) {
    try {
      const context = req.body;
      const data = await runningAdmissionService.findApplicantsByContext({
        ...context,
      });

      http.setSuccess(200, 'Applicants fetched by context successfully', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to get applicants by this context', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Destroy RunningAdmission Data
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async hardDeleteRunningAdmission(req, res) {
    try {
      const { id } = req.params;
      const { id: user, remember_token: rememberToken } = req.user;

      const fetchRunningAdmission =
        await runningAdmissionService.fetchRunningAdmissionById(id);

      if (fetchRunningAdmission === null) {
        throw new Error(`Unable To Find Running Admission.`);
      }

      await model.sequelize.transaction(async (transaction) => {
        await createAdmissionLog(
          {
            user_id: user,
            operation: `DELETE`,
            area_accessed: `RUNNING ADMISSIONS`,
            previous_data: `id: ${fetchRunningAdmission.id}, Academic year: ${fetchRunningAdmission.academic_year}, Intake: ${fetchRunningAdmission.intake}, Degree category: ${fetchRunningAdmission.degree_category}, start date: ${fetchRunningAdmission.admission_start_date}, end date: ${fetchRunningAdmission.admission_end_date}.`,
            ip_address: req.connection.remoteAddress,
            user_agent: req.get('user-agent'),
            token: rememberToken,
          },
          transaction
        );

        await runningAdmissionService.hardDeleteRunningAdmission(
          id,
          transaction
        );
      });

      http.setSuccess(200, 'Running Admission Deleted Successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Delete This Running Admission', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * SOFT DELETE Specific RunningAdmission Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async softDeleteRunningAdmission(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      data.deleted_by_id = parseInt(req.user.id, 10);
      data.deleted_at = moment.now();
      const updateRunningAdmission =
        await runningAdmissionService.softDeleteRunningAdmission(id, data);
      const runningAdmission = updateRunningAdmission[1][0];

      http.setSuccess(200, 'Running Admission Soft Deleted Successfully', {
        runningAdmission,
      });
      if (isEmpty(runningAdmission))
        http.setError(404, 'Running Admission Data Not Found');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Soft Delete This Running Admission', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * UNDO SOFT DELETE Specific RunningAdmission Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async undoSoftDeleteRunningAdmission(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      data.deleted_by_id = null;
      data.deleted_at = null;
      data.delete_approval_status = 'PENDING';
      const updateRunningAdmission =
        await runningAdmissionService.undoSoftDeleteRunningAdmission(id, data);
      const runningAdmission = updateRunningAdmission[1][0];

      http.setSuccess(200, 'Running Admission Retrieve Successfully', {
        runningAdmission,
      });
      if (isEmpty(runningAdmission))
        http.setError(404, 'Running Admission Data Not Found');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Retrieve This Running Admission', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

/**
 *
 * @param {*} nationality
 * @param {*} metadataValues
 * @returns
 */
const findBillingCategory = (nationality, metadataValues) => {
  try {
    if (toUpper(trim(nationality)).includes('UGANDA')) {
      const findUgandanBillingCategoryId = getMetadataValueId(
        metadataValues,
        'UGANDAN',
        'BILLING CATEGORIES'
      );

      if (findUgandanBillingCategoryId) {
        return 'UGANDAN';
      }
    } else if (
      toUpper(nationality).includes('KENYA') ||
      toUpper(nationality).includes('TANZANIA') ||
      toUpper(nationality).includes('RWANDA') ||
      toUpper(nationality).includes('SOUTH SUDAN') ||
      toUpper(nationality).includes('BURUNDI')
    ) {
      const findEasAfricanBillingCategoryId = getMetadataValueId(
        metadataValues,
        'EAST-AFRICAN',
        'BILLING CATEGORIES'
      );

      if (findEasAfricanBillingCategoryId) {
        return 'EAST-AFRICAN';
      }
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
        return 'NON EAST-AFRICAN';
      } else if (findInternationalsBillingCategoryId) {
        return 'INTERNATIONAL';
      }
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

const getRunningAdmissionWithoutProgrammesAttributes = function () {
  return {
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
  };
};

module.exports = RunningAdmissionController;
