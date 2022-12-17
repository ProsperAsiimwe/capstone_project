const { HttpResponse } = require('@helpers');
const {
  runningAdmissionProgrammeService,
  runningAdmissionProgrammeCampusService,
  runningAdmissionViewsService,
  metadataService,
  metadataValueService,
  runningAdmissionService,
  programmeService,
  programmeVersionWeightingCriteriaService,
  programmeVersionSelectionCriteriaService,
} = require('@services/index');
const { createAdmissionLog } = require('../Helpers/logsHelper');
const { isEmpty, orderBy, now, toUpper, trim } = require('lodash');
const moment = require('moment');
const model = require('@models');
const XLSX = require('xlsx');
const formidable = require('formidable');
const excelJs = require('exceljs');
const fs = require('fs');
const { manageRunningAdmissionsColumns } = require('./templateColumns');
const {
  getMetadataValueId,
  getMetadataValues,
} = require('@controllers/Helpers/programmeHelper');
const {
  validateSheetColumns,
} = require('@controllers/Helpers/uploadValidator');

const http = new HttpResponse();

class RunningAdmissionProgrammeController {
  /**
   * GET All runningAdmissionProgrammes.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async index(req, res) {
    try {
      const runningAdmissionProgrammes =
        await runningAdmissionProgrammeService.findAllRunningAdmissionProgrammes(
          {
            ...getRunningAdmissionProgrammeAttributes(),
          }
        );

      http.setSuccess(
        200,
        'Running Admission Programmes Fetched Successfully',
        {
          runningAdmissionProgrammes,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Running Admission Programmes', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  // running admission programme

  async runningAdmissionProgrammeByContext(req, res) {
    try {
      if (
        !req.query.academic_year_id ||
        !req.query.intake_id ||
        !req.query.degree_category_id ||
        !req.query.admission_scheme_id
      ) {
        throw new Error('Invalid Context Provided');
      }
      const context = req.query;
      const data =
        await runningAdmissionViewsService.runningAdmissionProgrammes(context);

      http.setSuccess(
        200,
        'Running Admission Programmes fetched successfully',
        {
          data,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to get fetch Running Admission Programmes.', {
        error: { error: error.message },
      });

      return http.send(res);
    }
  }

  // runningAdmissionProgrammeCampuses

  async programmeCampusesByContext(req, res) {
    try {
      if (!req.query.running_admission_programme_id) {
        throw new Error('Invalid Context Provided');
      }
      const context = req.query;
      const data =
        await runningAdmissionViewsService.runningAdmissionProgrammeCampuses(
          context
        );

      http.setSuccess(
        200,
        'Running Admission Programmes Context fetched successfully',
        {
          data,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable to get fetch Running Admission Programmes Context.',
        {
          error: { error: error.message },
        }
      );

      return http.send(res);
    }
  }

  /**
   * CREATE New RunningAdmissionProgramme Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async createRunningAdmissionProgramme(req, res) {
    try {
      const data = req.body;
      const { id: user, remember_token: rememberToken } = req.user;

      data.created_by_id = user;

      const fetchRunningAdmission =
        await runningAdmissionService.fetchRunningAdmissionById(
          data.running_admission_id
        );

      if (fetchRunningAdmission === null) {
        throw new Error(`Unable To Find Running Admission.`);
      }

      const selectedProgrammes = [];

      if (!isEmpty(data.programmes)) {
        for (const id of data.programmes) {
          const programme = await programmeService
            .findOneProgramme({
              where: { id },
              attributes: ['id', 'programme_title'],
              include: [
                {
                  association: 'versions',
                  attributes: ['id', 'is_current_version'],
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

          if (!programme) {
            throw new Error(`One Of The Programmes Selected Doesn't Exist.`);
          }

          const currentVersion = programme.versions.find(
            (version) => version.is_current_version === true
          );

          if (!currentVersion) {
            throw new Error(
              `${programme.programme_title} Has No Current Version.`
            );
          }

          selectedProgrammes.push({
            running_admission_id: data.running_admission_id,
            programme_id: id,
            programme_title: programme.programme_title,
            version_id: currentVersion.id,
            created_by_id: user,
          });
        }
      }

      const runningAdmissionProgramme = [];

      await model.sequelize.transaction(async (transaction) => {
        for (const eachProgramme of selectedProgrammes) {
          const result =
            await runningAdmissionProgrammeService.createRunningAdmissionProgramme(
              eachProgramme,
              transaction
            );

          if (result[1] === true) {
            runningAdmissionProgramme.push({
              ...result[0].dataValues,
              programme_title: eachProgramme.programme_title,
            });
          }
        }

        await createAdmissionLog(
          {
            user_id: user,
            operation: `CREATE`,
            area_accessed: `RUNNING ADMISSION PROGRAMMES`,
            current_data: `Added The Programmes: ${runningAdmissionProgramme.map(
              (prog) => prog.programme_title
            )} to Running Admission Where id:${
              fetchRunningAdmission.id
            }, Academic year: ${fetchRunningAdmission.academic_year}, Intake: ${
              fetchRunningAdmission.intake
            }, Degree category: ${
              fetchRunningAdmission.degree_category
            }, start date: ${
              fetchRunningAdmission.admission_start_date
            }, end date: ${fetchRunningAdmission.admission_end_date}`,
            ip_address: req.connection.remoteAddress,
            user_agent: req.get('user-agent'),
            token: rememberToken,
          },
          transaction
        );
      });

      http.setSuccess(
        200,
        'Running Admission Programmes created successfully',
        {
          runningAdmissionProgramme,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to create Running Admission Programmes.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * UPDATE Specific RunningAdmissionProgramme Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async updateRunningAdmissionProgramme(req, res) {
    try {
      const { id } = req.params;
      const { id: user } = req.user;
      const data = req.body;

      data.last_updated_by_id = user;
      data.updated_at = moment.now();

      const findRunningAdmissionProgramme =
        await runningAdmissionProgrammeService
          .findOneRunningAdmissionProgramme({
            where: { id },
            ...getRunningAdmissionProgrammeAttributes(),
            nest: true,
          })
          .then(function (res) {
            if (res) {
              const result = res.toJSON();

              return result;
            }
          });

      if (!findRunningAdmissionProgramme) {
        throw new Error(`Unable To Find Running Admission Programme.`);
      }

      const runningAdmissionProgramme = await model.sequelize.transaction(
        async (transaction) => {
          const updateRunningAdmissionProgramme =
            await runningAdmissionProgrammeService.updateRunningAdmissionProgramme(
              id,
              data,
              transaction
            );

          return updateRunningAdmissionProgramme[1][0];
        }
      );

      http.setSuccess(200, 'Running Admission Programme Updated Successfully', {
        runningAdmissionProgramme,
      });
      if (isEmpty(runningAdmissionProgramme))
        http.setError(404, 'Running Admission Programme Data Not Found');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Update This Running Admission Programme', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * activate Specific RunningAdmissionProgramme.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async activateProgramme(req, res) {
    try {
      const { runningAdmissionProgrammeId } = req.params;
      const { id: user, remember_token: rememberToken } = req.user;

      const data = {};

      data.last_updated_by_id = user;
      data.updated_at = moment.now();
      data.is_active = true;

      const findRunningAdmissionProgramme =
        await runningAdmissionProgrammeService
          .findOneRunningAdmissionProgramme({
            where: { id: runningAdmissionProgrammeId },
            ...getRunningAdmissionProgrammeAttributes(),
            nest: true,
          })
          .then(function (res) {
            if (res) {
              const result = res.toJSON();

              return result;
            }
          });

      if (!findRunningAdmissionProgramme) {
        throw new Error(`Unable To Find Running Admission Programme.`);
      }

      const runningAdmissionProgramme = await model.sequelize.transaction(
        async (transaction) => {
          const updateRunningAdmissionProgramme =
            await runningAdmissionProgrammeService.updateRunningAdmissionProgramme(
              runningAdmissionProgrammeId,
              data,
              transaction
            );

          await createAdmissionLog(
            {
              user_id: user,
              operation: `ACTIVATE`,
              area_accessed: `RUNNING ADMISSION PROGRAMMES`,
              current_data: `Activated running admission programme: id: ${findRunningAdmissionProgramme.id} (${findRunningAdmissionProgramme.programme.programme_code}) ${findRunningAdmissionProgramme.programme.programme_title} of Running Admission with id: ${findRunningAdmissionProgramme.runningAdmission.id}, start date: ${findRunningAdmissionProgramme.runningAdmission.admission_start_date}, end date: ${findRunningAdmissionProgramme.runningAdmission.admission_end_date}.`,
              ip_address: req.connection.remoteAddress,
              user_agent: req.get('user-agent'),
              token: rememberToken,
            },
            transaction
          );

          return updateRunningAdmissionProgramme[1][0];
        }
      );

      http.setSuccess(
        200,
        'Running Admission Programme Activated Successfully',
        {
          data: runningAdmissionProgramme,
        }
      );
      if (isEmpty(runningAdmissionProgramme))
        http.setError(404, 'Running Admission Programme Data Not Found');

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable To Activate This Running Admission Programme',
        {
          error: { message: error.message },
        }
      );

      return http.send(res);
    }
  }

  /**
   * deactivate Specific RunningAdmissionProgramme.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async deactivateProgramme(req, res) {
    try {
      const { runningAdmissionProgrammeId } = req.params;
      const { id: user, remember_token: rememberToken } = req.user;

      const data = {};

      data.last_updated_by_id = user;
      data.updated_at = moment.now();
      data.is_active = false;

      const findRunningAdmissionProgramme =
        await runningAdmissionProgrammeService
          .findOneRunningAdmissionProgramme({
            where: { id: runningAdmissionProgrammeId },
            ...getRunningAdmissionProgrammeAttributes(),
            nest: true,
          })
          .then(function (res) {
            if (res) {
              const result = res.toJSON();

              return result;
            }
          });

      if (!findRunningAdmissionProgramme) {
        throw new Error(`Unable To Find Running Admission Programme.`);
      }

      const runningAdmissionProgramme = await model.sequelize.transaction(
        async (transaction) => {
          const updateRunningAdmissionProgramme =
            await runningAdmissionProgrammeService.updateRunningAdmissionProgramme(
              runningAdmissionProgrammeId,
              data,
              transaction
            );

          await createAdmissionLog(
            {
              user_id: user,
              operation: `DE-ACTIVATE`,
              area_accessed: `RUNNING ADMISSION PROGRAMMES`,
              current_data: `De-Activated running admission programme: id: ${findRunningAdmissionProgramme.id} (${findRunningAdmissionProgramme.programme.programme_code}) ${findRunningAdmissionProgramme.programme.programme_title} of Running Admission with id: ${findRunningAdmissionProgramme.runningAdmission.id}, start date: ${findRunningAdmissionProgramme.runningAdmission.admission_start_date}, end date: ${findRunningAdmissionProgramme.runningAdmission.admission_end_date}.`,
              ip_address: req.connection.remoteAddress,
              user_agent: req.get('user-agent'),
              token: rememberToken,
            },
            transaction
          );

          return updateRunningAdmissionProgramme[1][0];
        }
      );

      http.setSuccess(
        200,
        'Running Admission Programme De-Activated Successfully',
        {
          data: runningAdmissionProgramme,
        }
      );
      if (isEmpty(runningAdmissionProgramme))
        http.setError(404, 'Running Admission Programme Data Not Found');

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable To De-Activated This Running Admission Programme',
        {
          error: { message: error.message },
        }
      );

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
  async addWeightingCriteria(req, res) {
    try {
      const { runningAdmissionProgrammeId, weightingCriteriaId } = req.params;

      const { id: user, remember_token: rememberToken } = req.user;

      const data = {};

      data.last_updated_by_id = user;
      data.updated_at = moment.now();
      data.weighting_criteria_id = weightingCriteriaId;

      const findRunningAdmissionProgramme =
        await runningAdmissionProgrammeService
          .findOneRunningAdmissionProgramme({
            where: { id: runningAdmissionProgrammeId },
            ...getRunningAdmissionProgrammeAttributes(),
            nest: true,
          })
          .then(function (res) {
            if (res) {
              const result = res.toJSON();

              return result;
            }
          });

      if (!findRunningAdmissionProgramme) {
        throw new Error(`Unable To Find Running Admission Programme.`);
      }

      const findWeightingCriteria =
        await programmeVersionWeightingCriteriaService.findOneRecord({
          where: {
            id: weightingCriteriaId,
          },
          raw: true,
        });

      if (!findWeightingCriteria) {
        throw new Error('Unable To Find The Weighting Criteria.');
      }

      if (
        parseInt(findWeightingCriteria.programme_id, 10) !==
        parseInt(findRunningAdmissionProgramme.programme_id, 10)
      ) {
        throw new Error(
          'The advertised programme and the weighting criteria have mismatching programmes.'
        );
      }

      const runningAdmissionProgramme = await model.sequelize.transaction(
        async (transaction) => {
          const updateRunningAdmissionProgramme =
            await runningAdmissionProgrammeService.updateRunningAdmissionProgramme(
              runningAdmissionProgrammeId,
              data,
              transaction
            );

          await createAdmissionLog(
            {
              user_id: user,
              operation: `ADD WEIGHTING CRITERIA`,
              area_accessed: `RUNNING ADMISSION PROGRAMMES`,
              current_data: `Added a weighting criteria for the running admission programme: id: ${findRunningAdmissionProgramme.id} (${findRunningAdmissionProgramme.programme.programme_code}) ${findRunningAdmissionProgramme.programme.programme_title} of Running Admission with id: ${findRunningAdmissionProgramme.runningAdmission.id}, start date: ${findRunningAdmissionProgramme.runningAdmission.admission_start_date}, end date: ${findRunningAdmissionProgramme.runningAdmission.admission_end_date}.`,
              ip_address: req.connection.remoteAddress,
              user_agent: req.get('user-agent'),
              token: rememberToken,
            },
            transaction
          );

          return updateRunningAdmissionProgramme[1][0];
        }
      );

      http.setSuccess(200, 'Weighting Criteria Added Successfully', {
        data: runningAdmissionProgramme,
      });

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable To Add Weighting Criteria To This Running Admission Programme',
        {
          error: { message: error.message },
        }
      );

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
  async addSelectionCriteria(req, res) {
    try {
      const { runningAdmissionProgrammeId, selectionCriteriaId } = req.params;

      const { id: user, remember_token: rememberToken } = req.user;

      const data = {};

      data.last_updated_by_id = user;
      data.updated_at = moment.now();
      data.selection_criteria_id = selectionCriteriaId;

      const findRunningAdmissionProgramme =
        await runningAdmissionProgrammeService
          .findOneRunningAdmissionProgramme({
            where: { id: runningAdmissionProgrammeId },
            ...getRunningAdmissionProgrammeAttributes(),
            nest: true,
          })
          .then(function (res) {
            if (res) {
              const result = res.toJSON();

              return result;
            }
          });

      if (!findRunningAdmissionProgramme) {
        throw new Error(`Unable To Find Running Admission Programme.`);
      }

      const findWeightingCriteria =
        await programmeVersionSelectionCriteriaService.findOneRecord({
          where: {
            id: selectionCriteriaId,
          },
          raw: true,
        });

      if (!findWeightingCriteria) {
        throw new Error('Unable To Find The Selection Criteria.');
      }

      if (
        parseInt(findWeightingCriteria.programme_id, 10) !==
        parseInt(findRunningAdmissionProgramme.programme_id, 10)
      ) {
        throw new Error(
          'The advertised programme and the selection criteria have mismatching programmes.'
        );
      }

      const runningAdmissionProgramme = await model.sequelize.transaction(
        async (transaction) => {
          const updateRunningAdmissionProgramme =
            await runningAdmissionProgrammeService.updateRunningAdmissionProgramme(
              runningAdmissionProgrammeId,
              data,
              transaction
            );

          await createAdmissionLog(
            {
              user_id: user,
              operation: `ADD SELECTION CRITERIA`,
              area_accessed: `RUNNING ADMISSION PROGRAMMES`,
              current_data: `Added a selection criteria for the running admission programme: id: ${findRunningAdmissionProgramme.id} (${findRunningAdmissionProgramme.programme.programme_code}) ${findRunningAdmissionProgramme.programme.programme_title} of Running Admission with id: ${findRunningAdmissionProgramme.runningAdmission.id}, start date: ${findRunningAdmissionProgramme.runningAdmission.admission_start_date}, end date: ${findRunningAdmissionProgramme.runningAdmission.admission_end_date}.`,
              ip_address: req.connection.remoteAddress,
              user_agent: req.get('user-agent'),
              token: rememberToken,
            },
            transaction
          );

          return updateRunningAdmissionProgramme[1][0];
        }
      );

      http.setSuccess(200, 'Selection Criteria Added Successfully', {
        data: runningAdmissionProgramme,
      });

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable To Add Selection Criteria To This Running Admission Programme',
        {
          error: { message: error.message },
        }
      );

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   */
  async downloadManageMultipleRunningAdmissionProgrammesTemplate(req, res) {
    try {
      const {
        id: user,
        remember_token: rememberToken,
        surname,
        other_names: otherNames,
      } = req.user;

      const { runningAdmissionId } = req.params;

      const workbook = new excelJs.Workbook();

      const programmes = [];

      const findRunningAdmission = await runningAdmissionService
        .findOneRunningAdmission({
          where: {
            id: runningAdmissionId,
          },
          include: [
            {
              association: 'programmes',
              attributes: [
                'id',
                'running_admission_id',
                'programme_id',
                'is_managed',
              ],
              include: [
                {
                  association: 'programme',
                  attributes: ['id', 'programme_code', 'programme_title'],
                },
              ],
            },
            {
              association: 'academicYear',
              attributes: ['id', 'metadata_value'],
            },
            {
              association: 'intake',
              attributes: ['id', 'metadata_value'],
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
        throw new Error(`Unable to Find Running Admission.`);
      }

      findRunningAdmission.programmes.forEach((prog) => {
        if (prog.is_managed === false) {
          programmes.push(prog.programme);
        }
      });

      const metadata = await metadataService.findAllMetadata({
        attributes: ['metadata_name'],
        include: [
          { association: 'metadataValues', attributes: ['metadata_value'] },
        ],
        raw: true,
        nest: true,
      });

      const rootSheet = workbook.addWorksheet(
        'MANAGE RUNNING ADMISSION PROGRAMMES'
      );
      const programmesSheet = workbook.addWorksheet('ProgrammesSheet');
      const studyTypesSheet = workbook.addWorksheet('StudyTypesSheet');
      const studyYearsSheet = workbook.addWorksheet('StudyYearsSheet');
      const campusesSheet = workbook.addWorksheet('CampusesSheet');
      const sponsorshipsSheet = workbook.addWorksheet('SponsorshipsSheet');

      rootSheet.properties.defaultColWidth =
        manageRunningAdmissionsColumns.length;
      rootSheet.columns = manageRunningAdmissionsColumns;

      programmesSheet.state = 'veryHidden';
      studyTypesSheet.state = 'veryHidden';
      studyYearsSheet.state = 'veryHidden';
      campusesSheet.state = 'veryHidden';
      sponsorshipsSheet.state = 'veryHidden';

      programmesSheet.addRows(
        programmes.map((prog) => [
          `(${prog.programme_code}):${prog.programme_title}`,
        ])
      );

      studyTypesSheet.addRows(
        getMetadataValues(metadata, 'PROGRAMME STUDY TYPES')
      );

      studyYearsSheet.addRows(
        arrayPermutations(getMetadataValues(metadata, 'STUDY YEARS'))
      );

      sponsorshipsSheet.addRows(
        arrayPermutations(getMetadataValues(metadata, 'SPONSORSHIPS'))
      );

      campusesSheet.addRows(getMetadataValues(metadata, 'CAMPUSES'));

      // Column Validations

      // programmes
      rootSheet.dataValidations.add('A2:A1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=ProgrammesSheet!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: 'Please select a valid value from the list',
      });

      // study types
      rootSheet.dataValidations.add('C2:C1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=StudyTypesSheet!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: 'Please select a valid value from the list',
      });

      // Entry Study years
      rootSheet.dataValidations.add('E2:E1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=StudyYearsSheet!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: 'Please select a valid value from the list',
      });

      // Sponsorships
      rootSheet.dataValidations.add('F2:F1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=SponsorshipsSheet!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: 'Please select a valid value from the list',
      });

      // Campuses
      rootSheet.dataValidations.add('B2:B1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=CampusesSheet!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: 'Please select a valid value from the list',
      });

      // capacity
      rootSheet.dataValidations.add('D2:D1000', {
        type: 'whole',
        operator: 'greaterThan',
        formulae: [0],
        allowBlank: true,
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: `The value must be a whole number`,
        prompt: `The value must be a whole number`,
      });

      const uploadPath = `${process.cwd()}/src/assets/documents/templates`;

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true }, (err) => {
          throw new Error(err.message);
        });
      }

      const template = `${uploadPath}/download-manage-running-admission-programme-template-${surname}-${otherNames}-${user}-${now()}.xlsm`;

      await workbook.xlsx.writeFile(template);
      await res.download(
        template,
        'MANAGE-RUNNING-ADMISSION-PROGRAMMES-TEMPLATE.xlsx',
        (error) => {
          if (error) {
            throw new Error(error.message);
          }
        }
      );

      await model.sequelize.transaction(async (transaction) => {
        await createAdmissionLog(
          {
            user_id: user,
            operation: `DOWNLOAD TEMPLATE`,
            area_accessed: `RUNNING ADMISSION PROGRAMMES`,
            current_data: `Downloaded template to manage programmes of running admission with id: ${findRunningAdmission.id}, Academic year: ${findRunningAdmission.academicYear.metadata_value}, Intake: ${findRunningAdmission.intake.metadata_value}, Start date: ${findRunningAdmission.admission_start_date}, End date: ${findRunningAdmission.admission_end_date}.`,
            ip_address: req.connection.remoteAddress,
            user_agent: req.get('user-agent'),
            token: rememberToken,
          },
          transaction
        );
      });
    } catch (error) {
      http.setError(400, 'Unable To Download This Template.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   */
  async uploadManageMultipleRunningAdmissionProgrammesTemplate(req, res) {
    try {
      const data = req.body;
      const { id: user, remember_token: rememberToken } = req.user;
      const { runningAdmissionId } = req.params;

      const form = new formidable.IncomingForm();
      const uploadedCapacitySettings = [];
      const capacitySettings = [];
      const managedProgrammes = [];

      data.created_by_id = user;

      const findRunningAdmission = await runningAdmissionService
        .findOneRunningAdmission({
          where: {
            id: runningAdmissionId,
          },
          include: [
            {
              association: 'programmes',
              attributes: [
                'id',
                'running_admission_id',
                'programme_id',
                'is_managed',
              ],
            },
            {
              association: 'academicYear',
              attributes: ['id', 'metadata_value'],
            },
            {
              association: 'intake',
              attributes: ['id', 'metadata_value'],
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
        throw new Error(`Unable to Find Running Admission.`);
      }

      const programmes = await programmeService.findAllProgrammes({
        raw: true,
      });

      form.parse(req, async (err, fields, files) => {
        if (err) {
          http.setError(400, 'Unable To Upload Running Admission Programmes.', {
            error: { err },
          });

          return http.send(res);
        }

        const file = files[Object.keys(files)[0]];

        if (!file) {
          http.setError(400, 'Please Select A File To Upload.');

          return http.send(res);
        }
        const workbook = XLSX.readFile(file.filepath, { cellDates: true });
        const myTemplate = workbook.SheetNames[0];
        const templateData = XLSX.utils.sheet_to_json(
          workbook.Sheets[myTemplate]
        );

        if (isEmpty(templateData)) {
          http.setError(400, 'Cannot upload an empty template.');

          return http.send(res);
        }

        const metadataValues = await metadataValueService.findAllMetadataValues(
          {
            include: ['metadata'],
          }
        );

        /**
         *
         * @param {*} programmeValue
         * @returns
         */
        const findProgramme = (programmeValue) => {
          try {
            const str = programmeValue
              .substring(0, programmeValue.indexOf(':'))
              .slice(1, -1);

            const checkValue = programmes.find(
              (prog) =>
                toUpper(trim(prog.programme_code)) === toUpper(trim(str))
            );

            if (checkValue) {
              return parseInt(checkValue.id, 10);
            } else {
              throw new Error(`Unknown Programme ${programmeValue}.`);
            }
          } catch (error) {
            throw new Error(error.message);
          }
        };

        const getRunningAdmissionProgrammeId = (value) => {
          try {
            const progId = findProgramme(value);

            const findRunningAdmissionProgrammeId =
              findRunningAdmission.programmes.find(
                (runningAdmProg) =>
                  parseInt(runningAdmProg.programme_id, 10) ===
                  parseInt(progId, 10)
              );

            if (findRunningAdmissionProgrammeId) {
              if (findRunningAdmissionProgrammeId.is_managed === true) {
                throw new Error(`${value} has already been managed.`);
              }

              return parseInt(findRunningAdmissionProgrammeId.id, 10);
            } else {
              throw new Error(
                `Unable To Find ${value} in the list of programmes advertised for this running Admission.`
              );
            }
          } catch (error) {
            throw new Error(error.message);
          }
        };

        const getCampusId = async (campusValue, programmeValue) => {
          try {
            const campusMetadataValueId = getMetadataValueId(
              metadataValues,
              campusValue,
              'CAMPUSES',
              programmeValue
            );

            const progId = findProgramme(programmeValue);

            const programmeCampuses =
              await programmeService.findAllProgrammeCampuses({
                where: {
                  programme_id: progId,
                },
                attributes: ['id', 'programme_id', 'campus_id'],
                raw: true,
              });

            const findProgrammeCampus = programmeCampuses.find(
              (progCampus) =>
                parseInt(progCampus.campus_id, 10) ===
                parseInt(campusMetadataValueId, 10)
            );

            if (findProgrammeCampus) {
              return parseInt(campusMetadataValueId, 10);
            } else {
              throw new Error(
                `The Curriculum Is Not Configured To Allow Programme ${programmeValue} To Be Taught In Campus ${campusValue}.`
              );
            }
          } catch (error) {
            throw new Error(error.message);
          }
        };

        const getProgrammeTypeId = async (
          programmeTypeValue,
          programmeValue
        ) => {
          try {
            const programmeTypeMetadataValueId = getMetadataValueId(
              metadataValues,
              programmeTypeValue,
              'PROGRAMME STUDY TYPES',
              programmeValue
            );

            const progId = findProgramme(programmeValue);

            const programmeTypes = await programmeService.findAllProgrammeTypes(
              {
                where: {
                  programme_id: progId,
                },
                attributes: ['id', 'programme_id', 'programme_type_id'],
                raw: true,
              }
            );

            const findProgrammeType = programmeTypes.find(
              (progType) =>
                parseInt(progType.programme_type_id, 10) ===
                parseInt(programmeTypeMetadataValueId, 10)
            );

            if (findProgrammeType) {
              return parseInt(programmeTypeMetadataValueId, 10);
            } else {
              throw new Error(
                `The Curriculum Is Not Configured To Allow Programme ${programmeValue} To Have Study Type: ${programmeTypeValue}.`
              );
            }
          } catch (error) {
            throw new Error(error.message);
          }
        };

        const getEntryStudyYears = async (value, programmeValue) => {
          const splittedText = !isEmpty(value) ? value.split(',') : [];
          const arrayOfEntryYearObjects = [];

          splittedText.forEach((text) =>
            arrayOfEntryYearObjects.push({
              name: text,
              studyYearMetadataValueId: getMetadataValueId(
                metadataValues,
                text.trim(),
                'STUDY YEARS',
                programmeValue
              ),
            })
          );

          const progId = findProgramme(programmeValue);

          const findProgrammeEntryYears =
            await programmeService.findAllProgrammeEntryYears({
              where: {
                programme_id: progId,
              },
              attributes: ['id', 'programme_id', 'entry_year_id'],
              raw: true,
            });

          const runningAdmissionProgrammeCampusEntryYears = [];

          arrayOfEntryYearObjects.forEach((obj) => {
            const checkValue = findProgrammeEntryYears.find(
              (progEntryYear) =>
                parseInt(progEntryYear.entry_year_id, 10) ===
                parseInt(obj.studyYearMetadataValueId, 10)
            );

            if (!isEmpty(checkValue)) {
              runningAdmissionProgrammeCampusEntryYears.push({
                entry_study_year_id: parseInt(checkValue.id, 10),
              });
            } else {
              throw new Error(
                `Cannot Find ${obj.name} in the list of Programme Entry Years Of ${programmeValue} In The Curriculum.`
              );
            }
          });

          return runningAdmissionProgrammeCampusEntryYears;
        };

        const getEntrySponsorships = (value, programmeValue) => {
          const splittedText = !isEmpty(value) ? value.split(',') : [];
          const sponsorships = [];

          splittedText.forEach((text) =>
            sponsorships.push({
              sponsorship_id: getMetadataValueId(
                metadataValues,
                text.trim(),
                'SPONSORSHIPS',
                programmeValue
              ),
            })
          );

          if (!isEmpty(sponsorships)) {
            return sponsorships;
          } else {
            throw new Error(
              `Please Provide Sponsorships For ${programmeValue}.`
            );
          }
        };

        try {
          await model.sequelize.transaction(async (transaction) => {
            for (const row of templateData) {
              if (!row.PROGRAMME) {
                throw new Error(
                  `One Of The Running Admission Programmes Provided Has No Programme Selected.`
                );
              }

              const errorName = row.PROGRAMME;

              validateSheetColumns(
                row,
                [
                  'PROGRAMME',
                  'CAMPUS',
                  'PROGRAMME TYPE',
                  'CAPACITY',
                  'ENTRY YEARS',
                  'SPONSORSHIPS',
                ],
                errorName
              );

              data.running_admission_programme_id =
                getRunningAdmissionProgrammeId(row.PROGRAMME);

              data.campus_id = await getCampusId(row.CAMPUS, row.PROGRAMME);

              data.programme_type_id = await getProgrammeTypeId(
                row['PROGRAMME TYPE'],
                row.PROGRAMME
              );

              data.capacity = row.CAPACITY;

              data.special_remarks_and_requirements = row[
                'SPECIAL REMARKS/REQUIREMENTS'
              ]
                ? row['SPECIAL REMARKS/REQUIREMENTS']
                : null;

              data.entryStudyYears = await getEntryStudyYears(
                row['ENTRY YEARS'],
                row.PROGRAMME
              );

              data.sponsorships = getEntrySponsorships(
                row.SPONSORSHIPS,
                row.PROGRAMME
              );

              capacitySettings.push(data);

              const upload = await insertNewCapacitySettings(data, transaction);

              await runningAdmissionProgrammeService.updateRunningAdmissionProgramme(
                data.running_admission_programme_id,
                {
                  is_managed: true,
                },
                transaction
              );

              if (upload[1] === true) {
                managedProgrammes.push(row.PROGRAMME);

                uploadedCapacitySettings.push(upload[0].dataValues);
              }
            }

            await createAdmissionLog(
              {
                user_id: user,
                operation: `UPLOAD TEMPLATE`,
                area_accessed: `RUNNING ADMISSION PROGRAMMES`,
                current_data: `Upload template to manage programmes: ${managedProgrammes.map(
                  (prog) => prog
                )} of running admission with id: ${
                  findRunningAdmission.id
                }, Academic year: ${
                  findRunningAdmission.academicYear.metadata_value
                }, Intake: ${
                  findRunningAdmission.intake.metadata_value
                }, Start date: ${
                  findRunningAdmission.admission_start_date
                }, End date: ${findRunningAdmission.admission_end_date}`,
                ip_address: req.connection.remoteAddress,
                user_agent: req.get('user-agent'),
                token: rememberToken,
              },
              transaction
            );
          });

          http.setSuccess(
            200,
            'Running Admission Programmes Managed successfully.',
            {
              data: uploadedCapacitySettings,
            }
          );

          return http.send(res);
        } catch (error) {
          http.setError(400, 'Unable To Manage Running Admission Programmes.', {
            error: { message: error.message },
          });

          return http.send(res);
        }
      });
    } catch (error) {
      http.setError(400, 'Unable To Upload This Template.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Get Specific RunningAdmissionProgramme Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async fetchRunningAdmissionProgramme(req, res) {
    try {
      const { id } = req.params;
      const runningAdmissionProgramme =
        await runningAdmissionProgrammeService.findOneRunningAdmissionProgramme(
          {
            where: { id },
            ...getRunningAdmissionProgrammeAttributes(),
          }
        );

      http.setSuccess(200, 'Running Admission Programme fetch successful', {
        runningAdmissionProgramme,
      });
      if (isEmpty(runningAdmissionProgramme))
        http.setError(404, 'Running Admission Programme Data Not Found');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to get this Running Admission Programme', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Destroy RunningAdmissionProgramme Data
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async hardDeleteRunningAdmissionProgramme(req, res) {
    try {
      const { id } = req.params;
      const { id: user, remember_token: rememberToken } = req.user;

      const findRunningAdmissionProgramme =
        await runningAdmissionProgrammeService
          .findOneRunningAdmissionProgramme({
            where: { id },
            ...getRunningAdmissionProgrammeAttributes(),
            nest: true,
          })
          .then(function (res) {
            if (res) {
              const result = res.toJSON();

              return result;
            }
          });

      if (!findRunningAdmissionProgramme) {
        throw new Error(`Unable To Find Running Admission Programme.`);
      }

      await model.sequelize.transaction(async (transaction) => {
        await createAdmissionLog(
          {
            user_id: user,
            operation: `DELETE`,
            area_accessed: `RUNNING ADMISSION PROGRAMMES`,
            previous_data: `id: ${findRunningAdmissionProgramme.id} (${findRunningAdmissionProgramme.programme.programme_code}) ${findRunningAdmissionProgramme.programme.programme_title} of Running Admission with id: ${findRunningAdmissionProgramme.runningAdmission.id}, start date: ${findRunningAdmissionProgramme.runningAdmission.admission_start_date}, end date: ${findRunningAdmissionProgramme.runningAdmission.admission_end_date}.`,
            ip_address: req.connection.remoteAddress,
            user_agent: req.get('user-agent'),
            token: rememberToken,
          },
          transaction
        );

        await runningAdmissionProgrammeService.hardDeleteRunningAdmissionProgramme(
          id
        );
      });

      http.setSuccess(200, 'Running Admission Programme Deleted Successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Delete This Running Admission Programme', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * SOFT DELETE Specific RunningAdmissionProgramme Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async softDeleteRunningAdmissionProgramme(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      data.deleted_by_id = parseInt(req.user.id, 10);
      data.deleted_at = moment.now();
      const updateRunningAdmissionProgramme =
        await runningAdmissionProgrammeService.softDeleteRunningAdmissionProgramme(
          id,
          data
        );
      const runningAdmissionProgramme = updateRunningAdmissionProgramme[1][0];

      http.setSuccess(
        200,
        'Running Admission Programme Soft Deleted Successfully',
        {
          runningAdmissionProgramme,
        }
      );
      if (isEmpty(runningAdmissionProgramme))
        http.setError(404, 'Running Admission Programme Data Not Found');

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable To Soft Delete This Running Admission Programme',
        {
          error: { message: error.message },
        }
      );

      return http.send(res);
    }
  }

  /**
   * UNDO SOFT DELETE Specific RunningAdmissionProgramme Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async undoSoftDeleteRunningAdmissionProgramme(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      data.deleted_by_id = null;
      data.deleted_at = null;
      data.delete_approval_status = 'PENDING';
      const updateRunningAdmissionProgramme =
        await runningAdmissionProgrammeService.undoSoftDeleteRunningAdmissionProgramme(
          id,
          data
        );
      const runningAdmissionProgramme = updateRunningAdmissionProgramme[1][0];

      http.setSuccess(
        200,
        'Running Admission Programme Retreaved Successfully',
        {
          runningAdmissionProgramme,
        }
      );
      if (isEmpty(runningAdmissionProgramme))
        http.setError(404, 'Running Admission Programme Data Not Found');

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable To Retrieve This Running Admission Programme',
        {
          error: { message: error.message },
        }
      );

      return http.send(res);
    }
  }
}

/**
 *
 * @param {*} data
 * @param {*} transaction
 */
const insertNewCapacitySettings = async (data, transaction) => {
  const result =
    await runningAdmissionProgrammeCampusService.insertRunningAdmissionProgrammeCampus(
      data,
      transaction
    );

  return result;
};

const getRunningAdmissionProgrammeAttributes = function () {
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
        association: 'programme',
        attributes: ['id', 'programme_code', 'programme_title'],
        include: [
          {
            association: 'campuses',
            attributes: ['id', 'metadata_value'],
            through: {
              attributes: [],
            },
          },
          {
            association: 'programmeTypes',
            attributes: ['id', 'metadata_value'],
            through: {
              attributes: [],
            },
          },
        ],
      },
      {
        association: 'runningAdmission',
        attributes: ['id', 'admission_start_date', 'admission_end_date'],
      },
    ],
  };
};

const arrayPermutations = (arrayList) => {
  const result = [];

  const f = (prefix, chars) => {
    for (let i = 0; i < chars.length; i++) {
      result.push(`${chars[i]}, ${prefix}`);
      f(`${chars[i]}, ${prefix}`, chars.slice(i + 1));
    }
  };

  f('', arrayList);

  return orderBy(result.map((list) => [list.replace(/, $/, '')]));
};

module.exports = RunningAdmissionProgrammeController;
