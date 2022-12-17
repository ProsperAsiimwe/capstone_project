/* eslint-disable indent */
const { HttpResponse } = require('@helpers');
const {
  programmeService,
  metadataService,
  metadataValueService,
  departmentService,
  specializationService,
  userService,
  institutionStructureService,
  programmeVersionService,
} = require('@services/index');
const { isEmpty, toUpper, now, map, toString, includes } = require('lodash');
const model = require('@models');
const XLSX = require('xlsx');
const excelJs = require('exceljs');
const { plural } = require('pluralize');
const formidable = require('formidable');
const moment = require('moment');
const fs = require('fs');
const { insertNewProgramme } = require('./programme.helper');
const { programmeTemplateColumns } = require('./templateColumns');
const {
  getDepartment,
  getMetadataValueId,
  getArrayMetadataValues,
  getMetadataValues,
  getSpecializations,
  fetchOtherDepartments,
} = require('../Helpers/programmeHelper');
const {
  validateSheetColumns,
} = require('@controllers/Helpers/uploadValidator');

const http = new HttpResponse();

class ProgrammeController {
  /**
   * GET All programmes.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async index(req, res) {
    try {
      const programmes = await programmeService.findAllProgrammes({
        include: [
          'department',
          'award',
          'programmeTypes',
          'createdBy',
          'headedBy',
          {
            association: model.Programme.versions,
            include: ['specializations', 'subjectCombCategories'],
            order: [['specialization_title', 'ASC']],
          },
        ],
        order: [['programme_title', 'ASC']],
      });

      http.setSuccess(200, 'programmes fetch successful', { programmes });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to fetch programmes', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * GET all programmes and study years
   * programme study types
   *
   *
   * @param {*} req
   * @param {*} res
   */
  async getProgrammeStudyYears(req, res) {
    try {
      const programmes = await programmeService.getProgrammesStudyYears();

      http.setSuccess(200, 'Programmes study Year and Types ', {
        programmes,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, ' Unable to fetch programmes study years and types', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * GET all programmes and study years
   * programme study types
   *
   *
   * @param {*} req
   * @param {*} res
   */
  async getProgrammeCampusStudyYears(req, res) {
    try {
      const context = req.params;
      const programmes = await programmeService.getProgrammesCampusStudyYears(
        context
      );

      http.setSuccess(200, 'Programmes study Year and Types ', {
        programmes,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, ' Unable to fetch programmes study years and types', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * GET All programmes.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async getCollegeProgrammes(req, res) {
    try {
      const programmes = await programmeService.findAllCollegeProgrammes();

      http.setSuccess(200, 'College Programmes', { programmes });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to fetch programmes', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  // download programmes

  async getProgrammesDownload(req, res) {
    try {
      const programmes = await programmeService.getProgrammesDownload();

      http.setSuccess(200, 'Programmes', { programmes });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to fetch programmes', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * getProgrammesWithCombinations
   * @param {*} req
   * @param {*} res
   */
  async getProgrammesWithCombinations(req, res) {
    try {
      const programmes =
        await programmeService.findAllProgrammesWithCategories();

      http.setSuccess(200, 'programmes with categories fetch successful', {
        programmes,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to fetch programmes with categories', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * CREATE New Programme Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async createProgramme(req, res) {
    try {
      const metadataValues = await metadataValueService.findAllMetadataValues({
        include: ['metadata'],
      });
      const programme = await insertNewProgramme(req, metadataValues);

      http.setSuccess(201, 'Programme created successfully', {
        programme,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to create this Programme.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *  createProgrammeVersionSubjectCombination
   * @param {*} req
   * @param {*} res
   */
  async createProgrammeVersionSubjectCombination(req, res) {
    try {
      const user = req.user.id;
      const { combinationCategoryId } = req.params;
      const data = req.body;

      data.created_by_id = user;
      data.combination_category_id = combinationCategoryId;

      const combinationSubjects = [];

      if (data.subjects) {
        data.subjects.forEach((subject) => {
          combinationSubjects.push({
            subject_id: subject,
            created_by_id: user,
          });
        });
      }

      data.subjects = combinationSubjects;

      const subjectCombination = await model.sequelize.transaction(
        async (transaction) => {
          const result =
            await programmeVersionService.createProgrammeVersionSubjectCombination(
              data,
              transaction
            );

          if (result[1] === false) {
            throw new Error(
              'A subject combination record already exists with the same context.'
            );
          } else {
            return result;
          }
        }
      );

      http.setSuccess(201, 'Subject Combination created successfully', {
        data: subjectCombination,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to create this Subject Combination.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * programmeVersionSubjectCombinationCategories
   * @param {*} req
   * @param {*} res
   */
  async fetchProgrammeVersionSubjectCombinationCategories(req, res) {
    try {
      const { programmeVersionId } = req.params;
      const result =
        await programmeVersionService.findAllProgrammeVersionSubjectCombinationCategories(
          {
            where: {
              programme_version_id: programmeVersionId,
            },
          }
        );

      http.setSuccess(
        200,
        'Programme Version Subject Combination Categories Fetched successfully.',
        { data: result }
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable To Fetch Programme Version Subject Combination Categories.',
        {
          error: { message: error.message },
        }
      );

      return http.send(res);
    }
  }

  /**
   * UPDATE Specific Programme Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async updateProgramme(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      const user = req.user.id;
      const studyTypes = [];
      const programmeStudyYears = [];
      const programmeDuration = parseInt(data.programme_duration, 10);
      const programmeDurationMeasure = data.duration_measure_id;

      data.last_updated_by_id = user;

      const metadataValues = await metadataValueService.findAllMetadataValues({
        include: ['metadata'],
      });

      if (programmeDuration && programmeDurationMeasure && metadataValues) {
        Array(programmeDuration)
          .fill()
          .forEach((duration, index) => {
            const findDurationMeasure = metadataValues.find(
              (metadataValue) =>
                parseInt(metadataValue.id, 10) ===
                parseInt(programmeDurationMeasure, 10)
            );

            if (findDurationMeasure) {
              const studyYear = `${findDurationMeasure.metadata_value} ${
                index + 1
              }`;

              const checkValue = metadataValues.find(
                (metadataValue) =>
                  toUpper(metadataValue.metadata_value).includes(studyYear) &&
                  toUpper(metadataValue.metadata.metadata_name).includes(
                    toUpper('STUDY YEARS')
                  )
              );

              if (checkValue) {
                programmeStudyYears.push({
                  programme_study_years: studyYear,
                  created_by_id: user,
                  programme_id: id,
                  programme_study_year_id: checkValue.id,
                });
              }
            }
          });
      }

      if (!isEmpty(data.programme_study_types)) {
        data.programme_study_types.forEach((studyType) => {
          studyTypes.push({
            programme_type_id: studyType,
            programme_id: id,
            created_by_id: user,
          });
        });
      }

      const programmeEntryYears = [];

      if (!isEmpty(data.programme_entry_years)) {
        data.programme_entry_years.forEach((entryYear) => {
          programmeEntryYears.push({
            entry_year_id: entryYear,
            programme_id: id,
            created_by_id: user,
          });
        });
      }

      const campuses = [];

      if (!isEmpty(data.programme_campuses)) {
        data.programme_campuses.forEach((campus) => {
          campuses.push({
            campus_id: campus,
            programme_id: id,
            created_by_id: user,
          });
        });
      }

      const modesOfDelivery = [];

      if (!isEmpty(data.mode_of_delivery)) {
        data.mode_of_delivery.forEach((mode) => {
          modesOfDelivery.push({
            mode_of_delivery_id: mode,
            programme_id: id,
            created_by_id: user,
          });
        });
      }

      const programmeDepartments = [];

      if (data.other_departments) {
        data.other_departments.forEach((dept) => {
          programmeDepartments.push({
            department_id: dept,
            programme_id: id,
            created_by_id: user,
          });
        });
      }

      const result = await model.sequelize.transaction(async (transaction) => {
        const program = await programmeService.updateProgramme(
          id,
          data,
          transaction
        );
        const response = program[1][0];

        await handleUpdatingPivots(
          id,
          studyTypes,
          programmeEntryYears,
          programmeStudyYears,
          campuses,
          modesOfDelivery,
          programmeDepartments,
          transaction
        );

        return response;
      });

      http.setSuccess(200, 'Programme updated successfully', { data: result });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to update this Programme.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Get Specific Programme Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async fetchProgramme(req, res) {
    try {
      const { id } = req.params;
      const programme = await programmeService.findOneProgramme({
        where: { id },
        ...programmeAttributes(),
      });

      http.setSuccess(200, 'Programme fetched successfully.', { programme });
      if (isEmpty(programme)) http.setError(404, 'Programme Data Not Found.');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to get this Programme.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Destroy Programme Data
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async deleteProgramme(req, res) {
    try {
      const { id } = req.params;

      await programmeService.deleteProgramme(id);
      http.setSuccess(200, 'Programme deleted successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to delete this Programme.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Destroy Programme Data
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  uploadProgramme(req, res) {
    const createProgrammePromise = new Promise((resolve, reject) => {
      parseForm(req).then(async (result) => {
        try {
          const { file } = result[1];
          const { id } = req.user;
          const workbook = XLSX.readFile(file.path, { cellDates: true });
          const createProgrammeSheet = workbook.SheetNames[0];
          const formattedProgrammes = XLSX.utils.sheet_to_json(
            workbook.Sheets[createProgrammeSheet]
          );

          if (isEmpty(formattedProgrammes[0])) {
            reject(
              new Error(
                'Cannot upload an empty Document, please populate the template with Programme Records'
              )
            );
          }

          const metadataValues =
            await metadataValueService.findAllMetadataValues({
              include: {
                association: 'metadata',
                attributes: ['id', 'metadata_name'],
              },
              attributes: ['id', 'metadata_value'],
            });

          const departments = await departmentService.findAllDepartments({
            raw: true,
          });

          const allSystemUsers = await userService.findAllUsers();

          const findUserId = (username) => {
            const names = username.split(' ');
            const user = allSystemUsers.find(
              (user) =>
                toUpper(user.surname).includes(toUpper(names[0])) &&
                toUpper(user.other_names).includes(toUpper(names[1]))
            );

            if (user) return user.id;
            else return reject(new Error(`Unable to Find User ${username}`));
          };

          const allSpecializations =
            await specializationService.findAllSpecializations();
          const programmes = [];

          for (const programme of formattedProgrammes) {
            try {
              const programmeTitle = programme['PROGRAMME TITLE'];

              validateSheetColumns(
                programme,
                [
                  'PROGRAMME TITLE',
                  'CODE',
                  'AWARD',
                  'CAMPUSES',
                  'DEPARTMENT',
                  'PROGRAMME TYPES',
                  'ENTRY YEARS',
                  'STUDY LEVEL',
                  'MODES OF DELIVERY',
                  'PROGRAMME DURATION',
                  'DURATION MEASURE',
                  'PROGRAMME VERSION',
                  'ENTRY YEAR GRADUATION LOADS',
                ],
                programmeTitle || 'Programme'
              );
              const graduationLoads = programme['PLAN GRADUATION LOADS'];
              const entryYearGradLoads =
                programme['ENTRY YEAR GRADUATION LOADS'];
              const isModular = programme['IS MODULAR?'];

              const versionPlans = getArrayMetadataValues(
                metadataValues,
                programme['VERSION PLANS'],
                'PROGRAMME VERSION PLANS',
                programmeTitle
              );

              const entryYears = getArrayMetadataValues(
                metadataValues,
                programme['ENTRY YEARS'],
                'STUDY YEARS',
                programmeTitle
              );
              const splittedGraduationLoad =
                toString(graduationLoads).split(',');

              const formattedPlans = versionPlans.map((plan, index) => ({
                programme_version_plan_id: plan,
                graduation_load: splittedGraduationLoad[index]
                  ? parseInt(splittedGraduationLoad[index], 10)
                  : 0,
                plan_study_year_id: getMetadataValueId(
                  metadataValues,
                  programme['PLAN YEAR'],
                  'STUDY YEARS',
                  programmeTitle
                ),
                plan_semester_id: getMetadataValueId(
                  metadataValues,
                  programme['PLAN SEMESTER'],
                  'SEMESTERS',
                  programmeTitle
                ),
              }));
              const splittedEntryGradLoads =
                toString(entryYearGradLoads).split(',');
              const versionEntryYears = [];
              const departmentID = programme.DEPARTMENT
                ? getDepartment(
                    departments,
                    programme.DEPARTMENT,
                    programmeTitle
                  )
                : null;
              const subjectCombCategories = getArrayMetadataValues(
                metadataValues,
                programme['SUBJECT COMBINATION CATEGORIES'],
                'SUBJECT COMBINATION CATEGORIES',
                programmeTitle
              );

              if (!isEmpty(splittedEntryGradLoads)) {
                splittedEntryGradLoads.forEach((load, index) => {
                  if (isNaN(load))
                    return reject(
                      new Error(
                        `Invalid Graduation load ${load}, Please enter a number`
                      )
                    );

                  if (entryYears[index]) {
                    versionEntryYears.push({
                      entry_year_id: entryYears[index],
                      graduation_load: load,
                    });
                  }
                });
              } else {
                entryYears.forEach((entryYearId) => {
                  versionEntryYears.push({
                    entry_year_id: entryYearId,
                    graduation_load: 0,
                  });
                });
              }

              req.body = {
                programme_title: programmeTitle,
                programme_code: toString(programme.CODE),
                award_id: getMetadataValueId(
                  metadataValues,
                  programme.AWARD,
                  'AWARDS',
                  programmeTitle
                ),
                department_id: departmentID,
                headed_by_id: programme['PROGRAMME HEAD']
                  ? findUserId(programme['PROGRAMME HEAD'])
                  : null,
                programme_study_level_id: getMetadataValueId(
                  metadataValues,
                  programme['STUDY LEVEL'],
                  'PROGRAMME STUDY LEVELS',
                  programmeTitle
                ),
                programme_description:
                  programme['PROGRAMME DESCRIPTION'] || null,
                programme_duration: programme['PROGRAMME DURATION'],
                duration_measure_id: getMetadataValueId(
                  metadataValues,
                  programme['PROGRAMME DURATION MEASURE'],
                  'DURATION MEASURES',
                  programmeTitle
                ),
                date_established: programme['DATE ESTABLISHED']
                  ? moment(programme['DATE ESTABLISHED']).format()
                  : null,
                created_by_id: id,
                programme_study_types: getArrayMetadataValues(
                  metadataValues,
                  programme['PROGRAMME TYPES'],
                  'PROGRAMME STUDY TYPES',
                  programmeTitle
                ),
                programme_entry_years: entryYears,
                mode_of_delivery: getArrayMetadataValues(
                  metadataValues,
                  programme['MODES OF DELIVERY'],
                  'MODES OF DELIVERY',
                  programmeTitle
                ),
                programme_campuses: getArrayMetadataValues(
                  metadataValues,
                  programme.CAMPUSES,
                  'CAMPUSES',
                  programmeTitle
                ),
                other_departments: fetchOtherDepartments(
                  departments,
                  programme['OTHER DEPARTMENTS (comma separated CODES)'],
                  programmeTitle
                ),
                version: programme['PROGRAMME VERSION'],
                has_version_plans: !isEmpty(programme['VERSION PLANS']),
                is_default: true,
                versionSpecializations: [],
                has_subject_combination_categories: !isEmpty(
                  programme['SUBJECT COMBINATION CATEGORIES']
                ),
                subject_combination_categories: subjectCombCategories,
                has_specializations: !isEmpty(programme.SPECIALIZATIONS),
                programme_specializations: getSpecializations(
                  allSpecializations,
                  programme.SPECIALIZATIONS,
                  programmeTitle
                ),
                version_entry_years: versionEntryYears,
                programme_version_plans: formattedPlans,
              };
              if (toUpper(isModular) === 'TRUE') {
                req.body.is_modular = true;
                const versionModules = getArrayMetadataValues(
                  metadataValues,
                  programme['PROGRAMME MODULES'],
                  'PROGRAMME MODULES',
                  programmeTitle
                );
                const modules = [];

                versionModules.forEach((versionModule) => {
                  modules.push({
                    module_id: versionModule,
                    has_module_options: false,
                    programme_version_module_options: [],
                  });
                });
                req.body.programme_version_modules = modules;
              }
              if (programme.SPECIALIZATIONS) {
                req.body.specialization_year_id = getMetadataValueId(
                  metadataValues,
                  programme['SPECIALIZATION YEAR'],
                  'STUDY YEARS',
                  programmeTitle
                );
                req.body.specialization_semester_id = getMetadataValueId(
                  metadataValues,
                  programme['SPECIALIZATION SEMESTER'],
                  'SEMESTERS',
                  programmeTitle
                );
              }
              if (programme['SUBJECT COMBINATION CATEGORIES']) {
                req.body.subject_combination_year_id = getMetadataValueId(
                  metadataValues,
                  programme['SUBJECT COMBINATION YEAR'],
                  'STUDY YEARS',
                  programmeTitle
                );
                req.body.subject_combination_semester_id = getMetadataValueId(
                  metadataValues,
                  programme['SUBJECT COMBINATION SEMESTER'],
                  'SEMESTERS',
                  programmeTitle
                );
              }
              if (programme['VERSION PLANS']) {
                delete req.body.version_entry_years;
              }

              const programmeData = await insertNewProgramme(
                req,
                metadataValues
              );

              programmes.push(programmeData);
            } catch (error) {
              return reject(new Error(`Error: ${error.message}`));
            }
          }

          return resolve(programmes);
        } catch (error) {
          return reject(new Error(`Error ${error.message}`));
        }
      });
    });

    createProgrammePromise
      .then((programmes) => {
        http.setError(201, 'Programmes uploaded successfully', { programmes });

        return http.send(res);
      })
      .catch((error) => {
        http.setError(400, error.message);

        return http.send(res);
      });
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async downloadProgrammeUploadTemplate(req, res) {
    try {
      const workbook = new excelJs.Workbook();
      const { user } = req;

      const createProgramme = workbook.addWorksheet('CREATE PROGRAMME');
      const awardSheet = workbook.addWorksheet('AWARDS');
      const campusSheet = workbook.addWorksheet('CAMPUSES');
      const departmentSheet = workbook.addWorksheet('DEPARTMENTS');
      const staffSheet = workbook.addWorksheet('PROGRAMME HEADS');
      const modesOfDeliverySheet = workbook.addWorksheet('MODES OF DELIVERY');
      const durationMeasureSheet = workbook.addWorksheet('DURATION MEASURES');
      const studyLevelSheet = workbook.addWorksheet('STUDY LEVELS');
      const programmeTypeSheet = workbook.addWorksheet('PROGRAMME TYPES');
      const entryYearSheet = workbook.addWorksheet('ENTRY YEARS');
      const specializationSheet = workbook.addWorksheet('SPECIALIZATIONS');
      const combinationCategorySheet = workbook.addWorksheet(
        'COMBINATION CATEGORIES'
      );
      const versionPlanSheet = workbook.addWorksheet('VERSION PLANS');
      const moduleSheet = workbook.addWorksheet('PROGRAMME MODULES');
      const semesterSheet = workbook.addWorksheet('SEMESTERS');
      const yearSheet = workbook.addWorksheet('STUDY YEARS');

      createProgramme.properties.defaultColWidth =
        programmeTemplateColumns.length;
      createProgramme.columns = programmeTemplateColumns;
      createProgramme.getRow(1).height = 30;
      createProgramme.getRow(1).protection = {
        locked: 'TRUE',
        lockText: 'TRUE',
      };
      awardSheet.state = 'veryHidden';
      campusSheet.state = 'veryHidden';
      departmentSheet.state = 'veryHidden';
      staffSheet.state = 'veryHidden';
      modesOfDeliverySheet.state = 'veryHidden';
      durationMeasureSheet.state = 'veryHidden';
      studyLevelSheet.state = 'veryHidden';
      programmeTypeSheet.state = 'veryHidden';
      entryYearSheet.state = 'veryHidden';
      specializationSheet.state = 'veryHidden';
      combinationCategorySheet.state = 'veryHidden';
      versionPlanSheet.state = 'veryHidden';
      moduleSheet.state = 'veryHidden';
      semesterSheet.state = 'veryHidden';
      yearSheet.state = 'veryHidden';

      // GET VALUES FROM DATABASE
      const metadata = await metadataService.findAllMetadata({
        attributes: ['metadata_name'],
        include: [
          { association: 'metadataValues', attributes: ['metadata_value'] },
        ],
        raw: true,
        nest: true,
      });
      const departments = await departmentService.findAllDepartments({
        raw: true,
        attributes: ['department_title'],
      });
      const users = await userService.findAllCustomUsers({
        raw: true,
        attributes: ['surname', 'other_names'],
      });

      const staffList = map(
        users,
        (user) => `${user.surname} ${user.other_names}`
      );

      const specializations =
        await specializationService.findAllSpecializations({
          raw: true,
          attributes: ['specialization_title'],
        });

      campusSheet.addRows(getMetadataValues(metadata, 'CAMPUSES', true));
      awardSheet.addRows(getMetadataValues(metadata, 'AWARDS'));
      departmentSheet.addRows(
        departments.map((department) => {
          return [department.department_title];
        })
      );
      staffSheet.addRows(staffList);
      studyLevelSheet.addRows(
        getMetadataValues(metadata, 'PROGRAMME STUDY LEVELS')
      );
      durationMeasureSheet.addRows(
        getMetadataValues(metadata, 'DURATION MEASURES')
      );
      modesOfDeliverySheet.addRows(
        getMetadataValues(metadata, 'MODES OF DELIVERY', true)
      );
      programmeTypeSheet.addRows(
        getMetadataValues(metadata, 'PROGRAMME STUDY TYPES', true)
      );
      entryYearSheet.addRows(getMetadataValues(metadata, 'STUDY YEARS', true));
      specializationSheet.addRows(
        map(specializations, (spec) => [spec.specialization_title])
      );
      combinationCategorySheet.addRows(
        getMetadataValues(metadata, 'SUBJECT COMBINATION CATEGORIES', true)
      );
      versionPlanSheet.addRows(
        getMetadataValues(metadata, 'PROGRAMME VERSION PLANS', true)
      );
      moduleSheet.addRows(
        getMetadataValues(metadata, 'PROGRAMME MODULES', true)
      );
      semesterSheet.addRows(getMetadataValues(metadata, 'SEMESTERS'));
      yearSheet.addRows(getMetadataValues(metadata, 'STUDY YEARS'));
      createProgramme.getColumn('Y').numFmt = '@';
      createProgramme.getColumn('Z').numFmt = '@';
      createProgramme.dataValidations.add('C2:C1000', {
        type: 'list',
        allowBlank: false,
        formulae: ['=AWARDS!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid AWARD from the list',
      });
      createProgramme.dataValidations.add('E2:E1000', {
        type: 'list',
        allowBlank: false,
        formulae: ['=CAMPUSES!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid CAMPUS Combination.',
      });
      createProgramme.dataValidations.add('G2:G1000', {
        type: 'list',
        allowBlank: false,
        formulae: ['=DEPARTMENTS!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid DEPARTMENT from the list',
      });
      createProgramme.dataValidations.add('H2:H1000', {
        type: 'list',
        allowBlank: true,
        formulae: ["='PROGRAMME HEADS'!$A$1:$A$1000"],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid STAFF NAME from the list',
      });
      createProgramme.dataValidations.add('I2:I1000', {
        type: 'list',
        allowBlank: true,
        formulae: ["='PROGRAMME TYPES'!$A$1:$A$1000"],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid PROGRAMME TYPES from the combination',
      });
      createProgramme.dataValidations.add('J2:J1000', {
        type: 'list',
        allowBlank: true,
        formulae: ["='ENTRY YEARS'!$A$1:$A$1000"],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid ENTRY YEARS from the combination',
      });
      createProgramme.dataValidations.add('K2:K1000', {
        type: 'list',
        allowBlank: false,
        formulae: ["='STUDY LEVELS'!$A$1:$A$1000"],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid PROGRAMME STUDY LEVEL from the list',
      });
      createProgramme.dataValidations.add('L2:L1000', {
        type: 'list',
        allowBlank: false,
        formulae: ["='MODES OF DELIVERY'!$A$1:$A$1000"],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid MODES OF DELIVERY Combination',
      });
      createProgramme.dataValidations.add('M2:M1000', {
        type: 'between',
        allowBlank: false,
        formulae: [1, 1000],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please Enter a valid Number between 0 and 1000 from',
      });
      createProgramme.dataValidations.add('N2:N1000', {
        type: 'list',
        allowBlank: false,
        formulae: ["='DURATION MEASURES'!$A$1:$A$1000"],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid PROGRAMME DURATION MEASURE from the list',
      });
      createProgramme.dataValidations.add('P2:P1000', {
        type: 'list',
        allowBlank: false,
        formulae: ["='SPECIALIZATIONS'!$A$1:$A$1000"],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid SPECIALIZATIONS',
      });
      createProgramme.dataValidations.add('Q2:Q1000', {
        type: 'list',
        allowBlank: false,
        formulae: ["='STUDY YEARS'!$A$1:$A$1000"],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid YEAR',
      });
      createProgramme.dataValidations.add('R2:R1000', {
        type: 'list',
        allowBlank: false,
        formulae: ["='SEMESTERS'!$A$1:$A$1000"],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid YEAR',
      });
      createProgramme.dataValidations.add('S2:S1000', {
        type: 'list',
        allowBlank: false,
        formulae: ["='COMBINATION CATEGORIES'!$A$1:$A$1000"],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid COMBINATION CATEGORIES',
      });
      createProgramme.dataValidations.add('T2:T1000', {
        type: 'list',
        allowBlank: false,
        formulae: ["='STUDY YEARS'!$A$1:$A$1000"],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid YEAR',
      });
      createProgramme.dataValidations.add('U2:U1000', {
        type: 'list',
        allowBlank: false,
        formulae: ["='SEMESTERS'!$A$1:$A$1000"],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid YEAR',
      });
      createProgramme.dataValidations.add('V2:V1000', {
        type: 'list',
        allowBlank: false,
        formulae: ["='VERSION PLANS'!$A$1:$A$1000"],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid VERSION PLAN Combination',
      });
      createProgramme.dataValidations.add('W2:W1000', {
        type: 'list',
        allowBlank: false,
        formulae: ["='STUDY YEARS'!$A$1:$A$1000"],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid YEAR',
      });
      createProgramme.dataValidations.add('X2:X1000', {
        type: 'list',
        allowBlank: false,
        formulae: ["='SEMESTERS'!$A$1:$A$1000"],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid YEAR',
      });

      const uploadPath = `${process.cwd()}/src/assets/documents/templates`;

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true }, (err) => {
          throw new Error(err.message);
        });
      }

      const programmeTemplate = `${uploadPath}/download-programme-template-${
        user.surname
      }-${user.other_names}-${user.id}-${now()}.xlsm`;

      await workbook.xlsx.writeFile(programmeTemplate);
      await res.download(
        programmeTemplate,
        'PROGRAMME-UPLOAD-TEMPLATE.xlsx',
        (error) => {
          if (error) {
            throw new Error(error.message);
          }
        }
      );
    } catch (error) {
      http.setError(400, 'Something went wrong.', { error: error.message });

      return http.send(res);
    }
  }

  /**
   *
   * Programme group by function
   * college
   * department
   * faculty
   */
  async programmeGroupByFunction(req, res) {
    try {
      let result = {};

      let structure = 'Departments';
      const institutionStructure =
        await institutionStructureService.findInstitutionStructureRecords();

      if (institutionStructure) {
        if (institutionStructure.academic_units.includes('Colleges')) {
          structure = 'Colleges';
          result = await programmeService.findAllCollegeProgrammes();
        } else if (
          institutionStructure.academic_units.includes('Faculties') ||
          institutionStructure.academic_units.includes('Schools')
        ) {
          structure = institutionStructure.academic_units.includes('Faculties')
            ? 'Faculties'
            : 'Schools';
          result = await programmeService.findAllFacultyProgrammes();
        } else {
          result = await programmeService.findAllDepartmentProgrammes();
        }
      } else {
        result = await programmeService.findAllDepartmentProgrammes();
      }
      http.setSuccess(200, 'grouped programmes fetch successful', {
        data: { groupedProgrammes: result, structure },
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to fetch grouped programmes', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  // institution structure
  async programmeGroupByHandler(req, res) {
    try {
      let result = {};

      let structure = 'Departments';
      const institutionStructure =
        await institutionStructureService.findInstitutionStructureRecords();

      if (institutionStructure) {
        const academicUnits = map(institutionStructure.academic_units, (e) =>
          plural(toUpper(e))
        );

        if (academicUnits.includes('COLLEGES')) {
          structure = 'Colleges';
          result = await programmeService.findAllCollegeFacultyDepartment();
        } else if (
          academicUnits.includes('FACULTIES') ||
          academicUnits.includes('SCHOOLS')
        ) {
          structure = academicUnits.includes('FACULTIES')
            ? 'Faculties'
            : 'Schools';
          result = await programmeService.findAllFacultyDepartment();
        } else {
          result = await programmeService.findAllDepartmentProgrammes();
        }
      } else {
        result = await programmeService.findAllDepartmentProgrammes();
      }
      http.setSuccess(200, 'grouped programmes fetch successful', {
        data: { groupedProgrammes: result, structure },
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to fetch grouped programmes', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * GET PROGRAMMES BY DEPARTMENT
   *
   * @param {*} req
   * @param {*} res
   */
  async getDepartmentProgrammes(req, res) {
    try {
      const result = await programmeService.findAllDepartmentProgrammes();

      http.setSuccess(200, 'Programmes fetch successful', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to fetch programmes by departments', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * SEARCH PROGRAMMES DETAILS BY CODE
   *
   * @param {*} req
   * @param {*} res
   */
  async searchProgrammesDetails(req, res) {
    try {
      const { progCode } = req.params;

      const programme = await programmeService.findOneProgramme({
        where: { programme_code: progCode },
        ...searchProgAttributes(),
      });

      http.setSuccess(200, 'Search Details Fetched Successfully.', {
        data: programme || [],
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to fetch programme details.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * GET PROGRAMMES BY ACADEMIC UNITS
   *
   * @param {*} req
   * @param {*} res
   */
  async getAcademicUnitProgrammes(req, res) {
    try {
      const institutionStructure =
        await institutionStructureService.findInstitutionStructureRecords();

      if (!institutionStructure)
        throw new Error('No Institution Structure has been described');

      let academicUnitProgrammes = [];

      const academicUnits = map(institutionStructure.academic_units, (unit) =>
        toUpper(unit)
      );

      if (includes(academicUnits, 'COLLEGES')) {
        academicUnitProgrammes =
          await programmeService.hierarchyCollegeProgrammes();
      } else if (
        includes(academicUnits, 'SCHOOLS') ||
        includes(academicUnits, 'FACULTIES')
      ) {
        academicUnitProgrammes =
          await programmeService.hierarchyFacultyProgrammes();
      } else {
        academicUnitProgrammes =
          await programmeService.hierarchyDepartmentProgrammes();
      }

      http.setSuccess(200, 'Programmes fetch successful', {
        data: academicUnitProgrammes,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to fetch programmes', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  // by faculty ..

  async getAdmissionProgrammes(req, res) {
    try {
      const result = await programmeService.allAdmissionProgrammes();

      http.setSuccess(200, 'Programmes fetch successful', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to fetch programmes by departments', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  // fetch programmes by department .. findAllProgrammeByDepartment
  async programmeByDepartment(req, res) {
    try {
      let result = {};
      const context = req.params;

      result = await programmeService.findAllProgrammeByDepartment(context);

      http.setSuccess(200, 'grouped programmes fetch successful', {
        data: { groupedProgrammes: result },
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to fetch grouped programmes', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

const parseForm = (req) => {
  const form = new formidable.IncomingForm();

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve([fields, files]);
    });
  });
};

const programmeAttributes = function () {
  return {
    attributes: {
      exclude: [
        'created_at',
        'updated_at',
        'deleted_at',
        'lastUpdatedById',
        'lastUpdateApprovedById',
        'deletedById',
        'deleteApprovedById',
        'deleteApprovedById',
      ],
    },
    include: [
      {
        association: 'department',
        ...excludeAttributes(),
      },
      {
        association: 'award',
        attributes: ['id', 'metadata_value'],
      },
      {
        association: 'admissionType',
        attributes: ['id', 'metadata_value'],
      },
      {
        association: 'programmeTypes',
        ...excludeAttributes(),
        through: {
          attributes: [],
        },
      },
      {
        association: 'programmeStudyYears',
        ...excludeAttributes(),
        attributes: [
          'id',
          'programme_id',
          'programme_study_year_id',
          'programme_study_years',
        ],
        include: [
          {
            association: 'studyYearMetadata',
            attributes: ['id', 'metadata_value'],
          },
        ],
      },
      {
        association: 'durationMeasure',
        ...excludeAttributes(),
        attributes: ['id', 'metadata_value'],
      },
      {
        association: 'modesOfDelivery',
        ...excludeAttributes(),
        through: {
          attributes: [],
        },
      },

      {
        association: 'campuses',
        ...excludeAttributes(),
        through: {
          attributes: [],
        },
      },
      {
        association: 'createdBy',
        ...excludeAttributes(),
        attributes: ['id', 'surname', 'other_names'],
      },
      {
        association: 'studyLevel',
        ...excludeAttributes(),
      },
      {
        association: 'headedBy',
        ...excludeAttributes(),
        attributes: ['id', 'surname', 'other_names'],
      },
      {
        association: model.Programme.aliases,
        ...excludeAttributes(),
        include: ['campus', 'programmeType'],
      },
      {
        association: 'entryYears',
        ...excludeAttributes(),
        through: {
          attributes: [],
        },
      },
      {
        association: 'versions',
        ...excludeAttributes(),
        include: [
          {
            association: 'versionPlans',
            separate: true,
            ...excludeAttributes(),
            include: [
              {
                association: 'planStudyYear',
                attributes: ['id', 'metadata_value'],
              },
              {
                association: 'planSemester',
                attributes: ['id', 'metadata_value'],
              },
              {
                association: 'plan',
                attributes: ['id', 'metadata_value'],
              },
            ],
          },
          {
            association: 'subjectCombYear',
            ...excludeAttributes(),
            attributes: ['metadata_value'],
          },
          {
            association: 'subjectCombSemester',
            ...excludeAttributes(),
            attributes: ['metadata_value'],
          },
          {
            association: 'subjectCombCategories',
            ...excludeAttributes(),
            through: {
              attributes: ['id'],
            },
          },
          {
            association: 'specializationYear',
            ...excludeAttributes(),
            attributes: ['metadata_value'],
          },
          {
            association: 'specializationSemester',
            ...excludeAttributes(),
            attributes: ['metadata_value'],
          },
          {
            association: 'specializations',
            ...excludeAttributes(),
            through: {
              attributes: ['id'],
            },
          },
          {
            association: 'entryYears',
            ...excludeAttributes(),
            through: {
              attributes: ['id', 'graduation_load'],
            },
          },
          {
            association: 'versionModules',
            ...excludeAttributes(),
            include: [
              {
                association: 'module',
                attributes: ['metadata_value'],
              },
              {
                association: 'moduleOptions',
                ...excludeAttributes(),

                include: [
                  {
                    association: 'option',
                    attributes: ['metadata_value'],
                  },
                ],
              },
            ],
          },
          {
            association: 'exemptRegs',
            attributes: ['id', 'study_year_id', 'semester_id'],
            include: [
              {
                association: 'studyYear',
                attributes: ['metadata_value'],
              },
              {
                association: 'semester',
                attributes: ['metadata_value'],
              },
            ],
          },
          // {
          //   association: 'createdBy',
          //   attributes: ['id', 'surname', 'other_names'],
          //   ...excludeAttributes(),
          // },
        ],
        order: [['specialization_title', 'ASC']],
      },
    ],
  };
};

const searchProgAttributes = function () {
  return {
    attributes: {
      exclude: [
        'admission_type_id',
        'headed_by_id',
        'admission_requirements',
        'date_established',
        'deleted_at',
        'create_approved_by_id',
        'create_approval_date',
        'last_update_approved_by_id',
        'last_update_approval_date',
        'deleted_by_id',
        'delete_approved_by_id',
        'delete_approval_date',
        'lastUpdateApprovedById',
        'headedById',
        'deletedById',
        'deleteApprovedById',
        'created_at',
        'updated_at',
        'delete_approval_status',
        'department_id',
        'last_update_approval_status',
        'programme_study_level_id',
        'programme_description',
        'create_approval_status',
      ],
    },
    include: [
      {
        association: 'department',
        attributes: ['id', 'department_code', 'department_title'],
        include: [
          {
            association: 'faculty',
            attributes: ['id', 'faculty_code', 'faculty_title'],
            include: [
              {
                association: 'college',
                attributes: ['id', 'college_code', 'college_title'],
              },
            ],
          },
        ],
      },
      {
        association: 'versions',
        ...excludeAttributes(),
      },
    ],
  };
};

const excludeAttributes = function () {
  return {
    attributes: {
      exclude: [
        'updated_at',
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
        'last_update_approval_status',
        'last_update_approval_date',
        'last_update_approved_by_id',
        'last_updated_by_id',
        'create_approval_status',
        'create_approval_date',
        'create_approved_by_id',
      ],
    },
  };
};

/**
 *
 * @param {*} programmeId
 * @param {*} studyTypes
 * @param {*} programmeEntryYears
 * @param {*} programmeStudyYears
 * @param {*} campuses
 * @param {*} modesOfDelivery
 * @param {*} programmeDepartments
 * @param {*} transaction
 */
const handleUpdatingPivots = async function (
  programmeId,
  studyTypes,
  programmeEntryYears,
  programmeStudyYears,
  campuses,
  modesOfDelivery,
  programmeDepartments,
  transaction
) {
  try {
    if (!isEmpty(programmeStudyYears)) {
      await deleteOrCreateElements(
        programmeStudyYears,
        'findAllProgrammeStudyYears',
        'bulkInsertProgrammeStudyYears',
        'deleteProgrammeStudyYears',
        'programme_study_year_id',
        programmeId,
        transaction
      );
    }

    if (!isEmpty(studyTypes)) {
      await deleteOrCreateElements(
        studyTypes,
        'findAllProgrammeTypes',
        'bulkCreateProgrammeStudyType',
        'deleteProgrammeStudyType',
        'programme_type_id',
        programmeId,
        transaction
      );
    }

    if (!isEmpty(programmeEntryYears)) {
      await deleteOrCreateElements(
        programmeEntryYears,
        'findAllProgrammeEntryYears',
        'bulkCreateProgrammeEntryYears',
        'bulkDeleteProgrammeEntryYears',
        'entry_year_id',
        programmeId,
        transaction
      );
    }

    if (!isEmpty(campuses)) {
      await deleteOrCreateElements(
        campuses,
        'findAllProgrammeCampuses',
        'bulkCreateProgrammeCampus',
        'bulkRemoveProgrammeCampus',
        'campus_id',
        programmeId,
        transaction
      );
    }

    if (!isEmpty(modesOfDelivery)) {
      await deleteOrCreateElements(
        modesOfDelivery,
        'findAllProgrammeModesOfDelivery',
        'bulkCreateProgrammeModesOfDelivery',
        'bulkRemoveProgrammeModesOfDelivery',
        'mode_of_delivery_id',
        programmeId,
        transaction
      );
    }

    if (!isEmpty(programmeDepartments)) {
      await deleteOrCreateElements(
        programmeDepartments,
        'findAllProgrammeDepartments',
        'bulkCreateProgrammeDepartment',
        'bulkRemoveProgrammeDepartment',
        'department_id',
        programmeId,
        transaction
      );
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

const deleteOrCreateElements = async (
  firstElements,
  findAllService,
  insertService,
  deleteService,
  firstField,
  programmeId,
  transaction
) => {
  const elementsToDelete = [];
  const elementsToInsert = [];

  const secondElements = await programmeService[findAllService]({
    where: {
      programme_id: programmeId,
    },
    attributes: ['id', 'programme_id', firstField],
    raw: true,
  });

  firstElements.forEach((firstElement) => {
    const myElement = secondElements.find(
      (secondElement) =>
        parseInt(firstElement[firstField], 10) ===
          parseInt(secondElement[firstField], 10) &&
        parseInt(firstElement.programme_id, 10) ===
          parseInt(secondElement.programme_id, 10)
    );

    if (!myElement) elementsToInsert.push(firstElement);
  });

  secondElements.forEach((secondElement) => {
    const myElement = firstElements.find(
      (firstElement) =>
        parseInt(firstElement[firstField], 10) ===
          parseInt(secondElement[firstField], 10) &&
        parseInt(firstElement.programme_id, 10) ===
          parseInt(secondElement.programme_id, 10)
    );

    if (!myElement) elementsToDelete.push(secondElement.id);
  });

  if (!isEmpty(elementsToInsert)) {
    await programmeService[insertService](elementsToInsert, transaction);
  }

  if (!isEmpty(elementsToDelete)) {
    await programmeService[deleteService](elementsToDelete, transaction);
  }

  return { elementsToDelete, elementsToInsert };
};

module.exports = ProgrammeController;
