const { HttpResponse } = require('@helpers');
const {
  runningAdmissionProgrammeCampusService,
  runningAdmissionProgrammeService,
  applicantProgrammeChoiceService,
  runningAdmissionApplicantService,
  programmeAliasService,
  metadataValueService,
} = require('@services/index');
const { isEmpty, trim, toUpper } = require('lodash');
const moment = require('moment');
const model = require('@models');
const { createAdmissionLog } = require('../Helpers/logsHelper');
const {
  getMetadataValueName,
} = require('@controllers/Helpers/programmeHelper');

const http = new HttpResponse();

class RunningAdmissionProgrammeCampusController {
  /**
   * GET All runningAdmissionProgrammeCampuses.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async index(req, res) {
    try {
      const { runningAdmissionProgrammeId } = req.params;

      const result =
        await runningAdmissionProgrammeCampusService.findAllRunningAdmissionProgrammeCampuses(
          {
            where: {
              running_admission_programme_id: runningAdmissionProgrammeId,
            },
            ...getRunningAdmissionProgrammeCampusAttributes(),
          }
        );

      http.setSuccess(
        200,
        'Running Admission Programme Capacity Settings Fetched Successfully',
        {
          data: result,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable To Fetch Running Admission Programme Capacity Settings',
        {
          error: { message: error.message },
        }
      );

      return http.send(res);
    }
  }

  /**
   * CREATE New RunningAdmissionProgrammeCampus Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async createRunningAdmissionProgrammeCampus(req, res) {
    try {
      const data = req.body;
      const { id, remember_token: rememberToken } = req.user;

      data.created_by_id = id;

      const campusProgrammeTypes = [];

      const findRunningAdmissionProgramme =
        await runningAdmissionProgrammeService
          .findOneRunningAdmissionProgramme({
            where: { id: data.running_admission_programme_id },
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

      const metadataValues = await metadataValueService.findAllMetadataValues({
        include: {
          association: 'metadata',
          attributes: ['id', 'metadata_name'],
        },
        attributes: ['id', 'metadata_value'],
      });

      if (!isEmpty(data.programmeCampusContext)) {
        for (const programmeCampusContext of data.programmeCampusContext) {
          if (programmeCampusContext.programme_alias_id) {
            const programmeAlias =
              await programmeAliasService.findOneProgrammeAlias({
                where: {
                  id: programmeCampusContext.programme_alias_id,
                },
                attributes: [
                  'id',
                  'campus_id',
                  'programme_type_id',
                  'alias_code',
                ],
                raw: true,
              });

            if (!programmeAlias) {
              throw new Error(
                `Unable To Find Admission Code For Record With Capacity ${programmeCampusContext.capacity}`
              );
            }

            if (
              parseInt(programmeCampusContext.campus_id, 10) !==
                parseInt(programmeAlias.campus_id, 10) ||
              parseInt(programmeCampusContext.programme_type_id, 10) !==
                parseInt(programmeAlias.programme_type_id, 10)
            ) {
              throw new Error(
                `Campus Or Programme Type Mismatch For Record With Admission Code ${programmeAlias.alias_code}.`
              );
            }
          }

          const entryStudyYears = [];
          const sponsorshipsArray = [];
          const subjectCombinationsArray = [];

          if (!isEmpty(programmeCampusContext.entry_study_years)) {
            programmeCampusContext.entry_study_years.forEach((studyYear) => {
              entryStudyYears.push({
                entry_study_year_id: studyYear,
                created_by_id: id,
              });
            });
          }

          if (!isEmpty(programmeCampusContext.sponsorships)) {
            programmeCampusContext.sponsorships.forEach((sponsorship) => {
              sponsorshipsArray.push({
                sponsorship_id: sponsorship,
                created_by_id: id,
              });
            });
          }

          if (!isEmpty(programmeCampusContext.subject_combinations)) {
            programmeCampusContext.subject_combinations.forEach(
              (combination) => {
                subjectCombinationsArray.push({
                  subject_combination_id: combination,
                  created_by_id: id,
                });
              }
            );
          }

          campusProgrammeTypes.push({
            ...programmeCampusContext,
            entryStudyYears: entryStudyYears,
            sponsorships: sponsorshipsArray,
            combinations: subjectCombinationsArray,
            created_by_id: id,
          });
        }
      }

      const specialFeesArray = [];

      if (!isEmpty(data.special_fees)) {
        data.special_fees.forEach((specialFee) => {
          specialFeesArray.push({
            running_admission_programme_id: data.running_admission_programme_id,
            account_id: specialFee.account_id,
            special_fee_name: toUpper(trim(specialFee.special_fee_name)),
            amounts: specialFee.amounts,
            created_by_id: id,
          });
        });
      }

      const uploadedCapacitySettings = [];

      await model.sequelize.transaction(async (transaction) => {
        if (data.special_remarks_and_requirements) {
          await runningAdmissionProgrammeService.updateRunningAdmissionProgramme(
            data.running_admission_programme_id,
            {
              special_remarks_and_requirements:
                data.special_remarks_and_requirements,
            },
            transaction
          );

          await createAdmissionLog(
            {
              user_id: id,
              operation: `UPDATE`,
              area_accessed: `RUNNING ADMISSION PROGRAMMES`,
              current_data: `Added special remarks and requirements: ${data.special_remarks_and_requirements} for running admission programme of id: ${findRunningAdmissionProgramme.id}, (${findRunningAdmissionProgramme.programme.programme_code}) ${findRunningAdmissionProgramme.programme.programme_title} of Running Admission with id: ${findRunningAdmissionProgramme.runningAdmission.id}, start date: ${findRunningAdmissionProgramme.runningAdmission.admission_start_date}, end date: ${findRunningAdmissionProgramme.runningAdmission.admission_end_date}.`,
              ip_address: req.connection.remoteAddress,
              user_agent: req.get('user-agent'),
              token: rememberToken,
            },
            transaction
          );
        }

        const uploadedSpecialFees = [];

        if (!isEmpty(specialFeesArray)) {
          for (const item of specialFeesArray) {
            const result =
              await runningAdmissionProgrammeCampusService.insertNewSpecialFee(
                item,
                transaction
              );

            if (result[1] === true) {
              uploadedSpecialFees.push(result[0].dataValues);
            }
          }

          await runningAdmissionProgrammeService.updateRunningAdmissionProgramme(
            data.running_admission_programme_id,
            {
              activate_special_fees: true,
            },
            transaction
          );

          if (!isEmpty(uploadedSpecialFees)) {
            await createAdmissionLog(
              {
                user_id: id,
                operation: `UPDATE`,
                area_accessed: `RUNNING ADMISSION PROGRAMMES`,
                current_data: `Added special fees: ${uploadedSpecialFees.map(
                  (record) => record.special_fee_name
                )} for running admission programme of id: ${
                  findRunningAdmissionProgramme.id
                }, (${
                  findRunningAdmissionProgramme.programme.programme_code
                }) ${
                  findRunningAdmissionProgramme.programme.programme_title
                } of Running Admission with id: ${
                  findRunningAdmissionProgramme.runningAdmission.id
                }, start date: ${
                  findRunningAdmissionProgramme.runningAdmission
                    .admission_start_date
                }, end date: ${
                  findRunningAdmissionProgramme.runningAdmission
                    .admission_end_date
                }.`,
                ip_address: req.connection.remoteAddress,
                user_agent: req.get('user-agent'),
                token: rememberToken,
              },
              transaction
            );
          }
        }

        for (const obj of campusProgrammeTypes) {
          const result = await insertNewCapacitySettings(obj, transaction);

          if (result[1] === true) {
            const campus = getMetadataValueName(
              metadataValues,
              result[0].dataValues.campus_id,
              'CAMPUSES'
            );

            const programmeType = getMetadataValueName(
              metadataValues,
              result[0].dataValues.programme_type_id,
              'PROGRAMME STUDY TYPES'
            );

            uploadedCapacitySettings.push({
              ...result[0].dataValues,
              campus: campus,
              programmeType: programmeType,
            });
          }

          await runningAdmissionProgrammeService.updateRunningAdmissionProgramme(
            obj.running_admission_programme_id,
            {
              is_managed: true,
            },
            transaction
          );
        }

        if (!isEmpty(uploadedCapacitySettings)) {
          await createAdmissionLog(
            {
              user_id: id,
              operation: `CREATE`,
              area_accessed: `CAPACITY SETTINGS`,
              current_data: `Created capacity setting records: ${uploadedCapacitySettings.map(
                (record) =>
                  `Campus: ${record.campus} - Programme type: ${record.programmeType} - Capacity: ${record.capacity}`
              )} for running admission programme of id: ${
                findRunningAdmissionProgramme.id
              }, (${findRunningAdmissionProgramme.programme.programme_code}) ${
                findRunningAdmissionProgramme.programme.programme_title
              } of Running Admission with id: ${
                findRunningAdmissionProgramme.runningAdmission.id
              }, start date: ${
                findRunningAdmissionProgramme.runningAdmission
                  .admission_start_date
              }, end date: ${
                findRunningAdmissionProgramme.runningAdmission
                  .admission_end_date
              }.`,
              ip_address: req.connection.remoteAddress,
              user_agent: req.get('user-agent'),
              token: rememberToken,
            },
            transaction
          );
        }
      });

      http.setSuccess(
        200,
        'Running Admission Programme Capacity Setting created successfully',
        {
          data: uploadedCapacitySettings,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable to create this Running Admission Programme Capacity Setting.',
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
   * @returns
   */
  async createCapacitySetting(req, res) {
    try {
      const data = req.body;
      const { id: user, remember_token: rememberToken } = req.user;

      const findRunningAdmissionProgramme =
        await runningAdmissionProgrammeService
          .findOneRunningAdmissionProgramme({
            where: { id: data.running_admission_programme_id },
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

      const metadataValues = await metadataValueService.findAllMetadataValues({
        include: {
          association: 'metadata',
          attributes: ['id', 'metadata_name'],
        },
        attributes: ['id', 'metadata_value'],
      });

      const campus = getMetadataValueName(
        metadataValues,
        data.campus_id,
        'CAMPUSES'
      );

      const programmeType = getMetadataValueName(
        metadataValues,
        data.programme_type_id,
        'PROGRAMME STUDY TYPES'
      );

      data.created_by_id = user;

      if (data.programme_alias_id) {
        const programmeAlias =
          await programmeAliasService.findOneProgrammeAlias({
            where: {
              id: data.programme_alias_id,
            },
            attributes: ['id', 'campus_id', 'programme_type_id', 'alias_code'],
            raw: true,
          });

        if (!programmeAlias) {
          throw new Error(`Unable To Find Admission Code For Record.`);
        }

        if (
          parseInt(data.campus_id, 10) !==
            parseInt(programmeAlias.campus_id, 10) ||
          parseInt(data.programme_type_id, 10) !==
            parseInt(programmeAlias.programme_type_id, 10)
        ) {
          throw new Error(
            `Campus Or Programme Type Mismatch For Record's Alias.`
          );
        }
      }

      const entryStudyYears = [];
      const sponsorshipsArray = [];
      const subjectCombinationsArray = [];

      if (!isEmpty(data.entry_study_years)) {
        data.entry_study_years.forEach((studyYear) => {
          entryStudyYears.push({
            entry_study_year_id: studyYear,
            created_by_id: user,
          });
        });
      }

      if (!isEmpty(data.sponsorships)) {
        data.sponsorships.forEach((sponsorship) => {
          sponsorshipsArray.push({
            sponsorship_id: sponsorship,
            created_by_id: user,
          });
        });
      }

      if (!isEmpty(data.subject_combinations)) {
        data.subject_combinations.forEach((combination) => {
          subjectCombinationsArray.push({
            subject_combination_id: combination,
            created_by_id: user,
          });
        });
      }

      data.entryStudyYears = entryStudyYears;
      data.sponsorships = sponsorshipsArray;
      data.combinations = subjectCombinationsArray;
      data.created_by_id = user;

      const result = await model.sequelize.transaction(async (transaction) => {
        const result = await insertNewCapacitySettings(data, transaction);

        await runningAdmissionProgrammeService.updateRunningAdmissionProgramme(
          data.running_admission_programme_id,
          {
            is_managed: true,
          },
          transaction
        );

        if (result[1] === true) {
          await createAdmissionLog(
            {
              user_id: user,
              operation: `CREATE`,
              area_accessed: `CAPACITY SETTINGS`,
              current_data: `Created capacity setting record with campus: ${campus} programme type: ${programmeType} and capacity: ${data.capacity} for running admission programme of id: ${findRunningAdmissionProgramme.id}, (${findRunningAdmissionProgramme.programme.programme_code}) ${findRunningAdmissionProgramme.programme.programme_title} of Running Admission with id: ${findRunningAdmissionProgramme.runningAdmission.id}, start date: ${findRunningAdmissionProgramme.runningAdmission.admission_start_date}, end date: ${findRunningAdmissionProgramme.runningAdmission.admission_end_date}.`,
              ip_address: req.connection.remoteAddress,
              user_agent: req.get('user-agent'),
              token: rememberToken,
            },
            transaction
          );

          return result[0];
        }
      });

      http.setSuccess(200, 'Capacity Setting created successfully', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to create this Capacity Setting.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * CREATE New RunningAdmissionProgrammeCampus Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async createRunningAdmissionProgrammeSpecialFees(req, res) {
    try {
      const data = req.body;
      const { id: user, remember_token: rememberToken } = req.user;

      data.special_fee_name = toUpper(trim(data.special_fee_name));
      data.created_by_id = user;

      const findRunningAdmissionProgramme =
        await runningAdmissionProgrammeService
          .findOneRunningAdmissionProgramme({
            where: { id: data.running_admission_programme_id },
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

      const result = await model.sequelize.transaction(async (transaction) => {
        const result =
          await runningAdmissionProgrammeCampusService.insertNewSpecialFee(
            data,
            transaction
          );

        await createAdmissionLog(
          {
            user_id: user,
            operation: `UPDATE`,
            area_accessed: `RUNNING ADMISSION PROGRAMMES`,
            current_data: `Added special fees: ${data.special_fee_name} for running admission programme of id: ${findRunningAdmissionProgramme.id}, (${findRunningAdmissionProgramme.programme.programme_code}) ${findRunningAdmissionProgramme.programme.programme_title} of Running Admission with id: ${findRunningAdmissionProgramme.runningAdmission.id}, start date: ${findRunningAdmissionProgramme.runningAdmission.admission_start_date}, end date: ${findRunningAdmissionProgramme.runningAdmission.admission_end_date}.`,
            ip_address: req.connection.remoteAddress,
            user_agent: req.get('user-agent'),
            token: rememberToken,
          },
          transaction
        );

        await runningAdmissionProgrammeService.updateRunningAdmissionProgramme(
          data.running_admission_programme_id,
          {
            activate_special_fees: true,
          },
          transaction
        );

        return result;
      });

      http.setSuccess(
        200,
        'Running Admission Programme Special Fees Created Successfully',
        {
          data: result,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable to create this Running Admission Programme Special Fees.',
        {
          error: { message: error.message },
        }
      );

      return http.send(res);
    }
  }

  /**
   * UPDATE Specific RunningAdmissionProgrammeCampus Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async updateRunningAdmissionProgrammeCampus(req, res) {
    try {
      const { runningAdmissionProgrammeCampusId } = req.params;
      const { id: user, remember_token: rememberToken } = req.user;
      const data = req.body;

      data.updated_at = moment.now();
      data.last_updated_by_id = user;

      const findcapacitySetting = await runningAdmissionProgrammeCampusService
        .findOneRunningAdmissionProgrammeCampus({
          where: { id: runningAdmissionProgrammeCampusId },
          ...getRunningAdmissionProgrammeCampusAttributes(),
          nest: true,
        })
        .then(function (res) {
          if (res) {
            const result = res.toJSON();

            return result;
          }
        });

      if (!findcapacitySetting) {
        throw new Error(`Unable To Find Capacity Setting Record.`);
      }

      const metadataValues = await metadataValueService.findAllMetadataValues({
        include: {
          association: 'metadata',
          attributes: ['id', 'metadata_name'],
        },
        attributes: ['id', 'metadata_value'],
      });

      const campus = getMetadataValueName(
        metadataValues,
        data.campus_id,
        'CAMPUSES'
      );

      const programmeType = getMetadataValueName(
        metadataValues,
        data.programme_type_id,
        'PROGRAMME STUDY TYPES'
      );

      if (data.programme_alias_id) {
        const programmeAlias =
          await programmeAliasService.findOneProgrammeAlias({
            where: {
              id: data.programme_alias_id,
            },
            attributes: ['id', 'campus_id', 'programme_type_id', 'alias_code'],
            raw: true,
          });

        if (!programmeAlias) {
          throw new Error(
            `Unable To Find Admission Code For Record With Capacity ${data.capacity}`
          );
        }

        if (
          parseInt(data.campus_id, 10) !==
            parseInt(programmeAlias.campus_id, 10) ||
          parseInt(data.programme_type_id, 10) !==
            parseInt(programmeAlias.programme_type_id, 10)
        ) {
          throw new Error(
            `Campus Or Programme Type Mismatch For Record With Admission Code ${programmeAlias.alias_code}.`
          );
        }
      }

      const entryStudyYears = [];
      const sponsorships = [];
      const combinations = [];

      if (!isEmpty(data.entry_study_years)) {
        data.entry_study_years.forEach((entryStudyYearId) => {
          entryStudyYears.push({
            running_admission_programme_campus_id:
              runningAdmissionProgrammeCampusId,
            entry_study_year_id: entryStudyYearId,
          });
        });
      }

      if (!isEmpty(data.sponsorships)) {
        data.sponsorships.forEach((sponsorshipId) => {
          sponsorships.push({
            running_admission_programme_campus_id:
              runningAdmissionProgrammeCampusId,
            sponsorship_id: sponsorshipId,
          });
        });
      }

      if (!isEmpty(data.subject_combinations)) {
        data.subject_combinations.forEach((combinationId) => {
          combinations.push({
            running_admission_programme_campus_id:
              runningAdmissionProgrammeCampusId,
            subject_combination_id: combinationId,
          });
        });
      }

      const result = await model.sequelize.transaction(async (transaction) => {
        const update =
          await runningAdmissionProgrammeCampusService.updateRunningAdmissionProgrammeCampus(
            runningAdmissionProgrammeCampusId,
            data,
            transaction
          );

        await createAdmissionLog(
          {
            user_id: user,
            operation: `UPDATE`,
            area_accessed: `CAPACITY SETTINGS`,
            current_data: `Campus: ${campus}, Programme type: ${programmeType}, Capacity: ${data.capacity}.`,
            previous_data: `id: ${findcapacitySetting.id} of campus: ${findcapacitySetting.campus.metadata_value}, programme type: ${findcapacitySetting.programmeType.metadata_value}, capacity: ${findcapacitySetting.capacity} for the running admission programme: ${findcapacitySetting.runningAdmissionProgramme.programme.programme_title}.`,
            ip_address: req.connection.remoteAddress,
            user_agent: req.get('user-agent'),
            token: rememberToken,
          },
          transaction
        );

        const result = update[1][0];

        await handleUpdatingPivots(
          runningAdmissionProgrammeCampusId,
          entryStudyYears,
          sponsorships,
          combinations,
          transaction
        );

        return result;
      });

      http.setSuccess(200, 'Running Admission Programme Updated Successfully', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Update This Running Admission Programme', {
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
  async createRunningAdmissionProgrammeSpecialRemarks(req, res) {
    try {
      const data = req.body;

      const user = parseInt(req.user.id, 10);

      data.updated_at = moment.now();
      data.last_updated_by_id = user;

      const result = await model.sequelize.transaction(async (transaction) => {
        const update =
          await runningAdmissionProgrammeService.updateRunningAdmissionProgramme(
            data.running_admission_programme_id,
            {
              special_remarks_and_requirements:
                data.special_remarks_and_requirements,
            },
            transaction
          );

        return update[1][0];
      });

      http.setSuccess(
        200,
        'Running Admission Programme Special Remark Updated Successfully',
        {
          data: result,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable To Update This Running Admission Programme Special Remark',
        {
          error: { message: error.message },
        }
      );

      return http.send(res);
    }
  }

  /**
   * UPDATE
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async updateRunningAdmissionProgrammeSpecialRemarks(req, res) {
    try {
      const { runningAdmissionProgrammeId } = req.params;
      const data = req.body;

      const { id: user, remember_token: rememberToken } = req.user;

      data.updated_at = moment.now();
      data.last_updated_by_id = user;

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

      const update = await model.sequelize.transaction(async (transaction) => {
        const update =
          await runningAdmissionProgrammeService.updateRunningAdmissionProgramme(
            runningAdmissionProgrammeId,
            data,
            transaction
          );

        await createAdmissionLog(
          {
            user_id: user,
            operation: `UPDATE`,
            area_accessed: `RUNNING ADMISSION PROGRAMMES`,
            current_data: `Special Remark: ${data.special_remarks_and_requirements} for running admission programme of id: ${findRunningAdmissionProgramme.id}, (${findRunningAdmissionProgramme.programme.programme_code}) ${findRunningAdmissionProgramme.programme.programme_title} of Running Admission with id: ${findRunningAdmissionProgramme.runningAdmission.id}, start date: ${findRunningAdmissionProgramme.runningAdmission.admission_start_date}, end date: ${findRunningAdmissionProgramme.runningAdmission.admission_end_date}.`,
            ip_address: req.connection.remoteAddress,
            user_agent: req.get('user-agent'),
            token: rememberToken,
          },
          transaction
        );

        return update[1][0];
      });

      http.setSuccess(200, 'Special Remarks Updated Successfully', {
        data: update,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Update Special Remarks', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * UPDATE
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async updateRunningAdmissionProgrammeSpecialFees(req, res) {
    try {
      const { runningAdmissionProgrammeSpecialFeeId } = req.params;
      const data = req.body;
      const { id: user, remember_token: rememberToken } = req.user;

      data.updated_at = moment.now();
      data.last_updated_by_id = user;

      const findRunningAdmissionProgrammeSpecialFee =
        await runningAdmissionProgrammeCampusService
          .findOneRunningAdmissionProgrammeSpecialFees({
            where: {
              id: runningAdmissionProgrammeSpecialFeeId,
            },
            attributes: [
              'id',
              'running_admission_programme_id',
              'account_id',
              'special_fee_name',
            ],
            include: [
              {
                association: 'account',
                attributes: ['id', 'account_code', 'account_name'],
              },
              {
                association: 'runningAdmissionProg',
                ...getRunningAdmissionProgrammeAttributes(),
              },
              {
                association: 'amounts',
                attributes: [
                  'id',
                  'billing_category_id',
                  'currency_id',
                  'amount',
                ],
                include: [
                  {
                    association: 'billingCategory',
                    attributes: ['id', 'metadata_value'],
                  },
                  {
                    association: 'currency',
                    attributes: ['id', 'metadata_value'],
                  },
                ],
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

      if (!findRunningAdmissionProgrammeSpecialFee) {
        throw new Error(
          `Unable To Find Running Admission Programme Special Fee.`
        );
      }

      const specialFeeAmounts = [];

      if (data.special_fee_name) {
        data.special_fee_name = toUpper(trim(data.special_fee_name));
      }

      if (!isEmpty(data.amounts)) {
        data.amounts.forEach((specialFee) => {
          specialFeeAmounts.push({
            programme_special_fees_id: runningAdmissionProgrammeSpecialFeeId,
            ...specialFee,
          });
        });
      }

      const result = await model.sequelize.transaction(async (transaction) => {
        const update =
          await runningAdmissionProgrammeCampusService.updateRunningAdmissionProgrammeSpecialFee(
            runningAdmissionProgrammeSpecialFeeId,
            data,
            transaction
          );

        await createAdmissionLog(
          {
            user_id: user,
            operation: `UPDATE`,
            area_accessed: `RUNNING ADMISSION PROGRAMMES`,
            current_data: `Special Fee of id: ${runningAdmissionProgrammeSpecialFeeId}, Name: ${data.special_fee_name} for running admission programme of id: ${findRunningAdmissionProgrammeSpecialFee.runningAdmissionProg.id}, (${findRunningAdmissionProgrammeSpecialFee.runningAdmissionProg.programme.programme_code}) ${findRunningAdmissionProgrammeSpecialFee.runningAdmissionProg.programme.programme_title} of Running Admission with id: ${findRunningAdmissionProgrammeSpecialFee.runningAdmissionProg.runningAdmission.id}, start date: ${findRunningAdmissionProgrammeSpecialFee.runningAdmissionProg.runningAdmission.admission_start_date}, end date: ${findRunningAdmissionProgrammeSpecialFee.runningAdmissionProg.runningAdmission.admission_end_date}.`,
            ip_address: req.connection.remoteAddress,
            user_agent: req.get('user-agent'),
            token: rememberToken,
          },
          transaction
        );

        await handleUpdatingCapacitySettingSpecialFeeAmounts(
          runningAdmissionProgrammeSpecialFeeId,
          specialFeeAmounts,
          transaction
        );

        return update[1][0];
      });

      http.setSuccess(
        200,
        'Capacity Setting Special Fee Updated Successfully',
        {
          data: result,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable To Update This Capacity Setting Special Fee.',
        {
          error: { message: error.message },
        }
      );

      return http.send(res);
    }
  }

  /**
   * Get Specific RunningAdmissionProgrammeCampus Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async fetchRunningAdmissionProgrammeCampus(req, res) {
    try {
      const { id } = req.params;
      const result =
        await runningAdmissionProgrammeCampusService.findOneRunningAdmissionProgrammeCampus(
          {
            where: { id },
            ...getRunningAdmissionProgrammeCampusAttributes(),
          }
        );

      http.setSuccess(
        200,
        'Running Admission Programme Capacity Settings Fetched Successfully',
        {
          data: result,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable to get this Running Admission Programme Capacity Setting',
        {
          error: { message: error.message },
        }
      );

      return http.send(res);
    }
  }

  /**
   *
   */
  // find running admission programme campus
  async findRunningAdmissionProgrammeCampusContext(req, res) {
    try {
      const runningAdmissionProgrammeCampus =
        await runningAdmissionProgrammeCampusService.findRunningAmissionProgrammeCampusContext();

      http.setSuccess(200, 'RunningAdmissionProgrammeCampus', {
        runningAdmissionProgrammeCampus,
      });

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable to get fetch runningAdmissionProgrammeCampus.',
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
  async fetchRunningAdmissionProgrammeSpecialFees(req, res) {
    try {
      const { runningAdmissionProgrammeId } = req.params;

      const result =
        await runningAdmissionProgrammeCampusService.fetchRunningAdmissionProgrammeSpecialFees(
          {
            where: {
              running_admission_programme_id: runningAdmissionProgrammeId,
            },
            attributes: ['id', 'account_id', 'special_fee_name'],
            include: [
              {
                association: 'account',
                attributes: ['id', 'account_code', 'account_name'],
              },
              {
                association: 'amounts',
                attributes: [
                  'id',
                  'billing_category_id',
                  'currency_id',
                  'amount',
                ],
                include: [
                  {
                    association: 'billingCategory',
                    attributes: ['id', 'metadata_value'],
                  },
                  {
                    association: 'currency',
                    attributes: ['id', 'metadata_value'],
                  },
                ],
              },
            ],
          }
        );

      http.setSuccess(
        200,
        'Running Admission Programme Special Fees Fetched Successfully.',
        {
          data: result,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable To Fetch Running Admission Programme Special Fees.',
        {
          error: { error: error.message },
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
  async deleteRunningAdmissionProgrammeSpecialFees(req, res) {
    try {
      const { specialFeeId } = req.params;

      const findSpecialFee = await runningAdmissionProgrammeCampusService
        .findOneRunningAdmissionProgrammeSpecialFees({
          where: {
            id: specialFeeId,
          },
          attributes: [
            'id',
            'account_id',
            'special_fee_name',
            'running_admission_programme_id',
          ],
          include: [
            {
              association: 'runningAdmissionProg',
              attributes: ['id'],
              include: [
                {
                  association: 'capacities',
                  attributes: ['id'],
                },
              ],
            },
            {
              association: 'amounts',
              attributes: [
                'id',
                'billing_category_id',
                'currency_id',
                'amount',
              ],
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

      const choicesWithSpecialFees = [];

      if (!isEmpty(findSpecialFee.runningAdmissionProg.capacities)) {
        for (const item of findSpecialFee.runningAdmissionProg.capacities) {
          const getProgrammeChoices =
            await applicantProgrammeChoiceService.findAllApplicantProgrammeChoices(
              {
                where: {
                  programme_campus_id: item.id,
                },
                attributes: [
                  'id',
                  'programme_campus_id',
                  'form_id',
                  'applicant_id',
                ],
                raw: true,
              }
            );

          if (!isEmpty(getProgrammeChoices)) {
            for (const choice of getProgrammeChoices) {
              const findRunningAdmissionApplicant =
                await runningAdmissionApplicantService.findOneRunningAdmissionApplicant(
                  {
                    where: {
                      form_id: choice.form_id,
                      applicant_id: choice.applicant_id,
                      application_status: 'COMPLETED',
                    },
                    raw: true,
                  }
                );

              if (findRunningAdmissionApplicant) {
                choicesWithSpecialFees.push(findRunningAdmissionApplicant);
              }
            }
          }
        }
      }

      if (!isEmpty(choicesWithSpecialFees)) {
        throw new Error(
          `This Special Fee Has Already Been Billed To Applicants.`
        );
      } else {
        await runningAdmissionProgrammeCampusService.deleteRunningAdmissionProgrammeSpecialFee(
          specialFeeId
        );
      }

      http.setSuccess(200, 'Special Fee Deleted Successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Delete This Special Fee', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Destroy RunningAdmissionProgrammeCampus Data
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async hardDeleteRunningAdmissionProgrammeCampus(req, res) {
    try {
      const { id } = req.params;
      const { id: user, remember_token: rememberToken } = req.user;

      const findcapacitySetting = await runningAdmissionProgrammeCampusService
        .findOneRunningAdmissionProgrammeCampus({
          where: {
            id,
          },
          ...getRunningAdmissionProgrammeCampusAttributes(),
          nest: true,
        })
        .then(function (res) {
          if (res) {
            const result = res.toJSON();

            return result;
          }
        });

      if (!findcapacitySetting) {
        throw new Error(
          'Running Admission Programme Capacity Setting Does not Exist.'
        );
      }

      const findRunningAdmissionProgramme =
        await runningAdmissionProgrammeService
          .findOneRunningAdmissionProgramme({
            where: {
              id: findcapacitySetting.running_admission_programme_id,
            },
            include: [
              {
                association: 'capacities',
                attributes: [
                  'id',
                  'running_admission_programme_id',
                  'campus_id',
                  'programme_type_id',
                  'capacity',
                ],
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

      await model.sequelize.transaction(async (transaction) => {
        await runningAdmissionProgrammeCampusService.hardDeleteRunningAdmissionProgrammeCampus(
          id,
          transaction
        );

        if (isEmpty(findRunningAdmissionProgramme.capacities)) {
          await runningAdmissionProgrammeService.updateRunningAdmissionProgramme(
            findRunningAdmissionProgramme.id,
            {
              is_managed: false,
            },
            transaction
          );
        }

        await createAdmissionLog(
          {
            user_id: user,
            operation: `DELETE`,
            area_accessed: `CAPACITY SETTINGS`,
            previous_data: `id: ${findcapacitySetting.id} of campus: ${findcapacitySetting.campus.metadata_value}, programme type: ${findcapacitySetting.programmeType.metadata_value}, capacity: ${findcapacitySetting.capacity} for the running admission programme: ${findcapacitySetting.runningAdmissionProgramme.programme.programme_title}.`,
            ip_address: req.connection.remoteAddress,
            user_agent: req.get('user-agent'),
            token: rememberToken,
          },
          transaction
        );
      });

      http.setSuccess(
        200,
        'Running Admission Programme Capacity Setting Deleted Successfully'
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable To Delete This Running Admission Programme Capacity Setting',
        {
          error: { message: error.message },
        }
      );

      return http.send(res);
    }
  }

  /**
   * SOFT DELETE Specific RunningAdmissionProgrammeCampus Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async softDeleteRunningAdmissionProgrammeCampus(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      data.deleted_by_id = parseInt(req.user.id, 10);
      data.deleted_at = moment.now();
      const updateRunningAdmissionProgrammeCampus =
        await runningAdmissionProgrammeCampusService.softDeleteRunningAdmissionProgrammeCampus(
          id,
          data
        );
      const runningAdmissionProgrammeCampus =
        updateRunningAdmissionProgrammeCampus[1][0];

      http.setSuccess(
        200,
        'Running Admission Programme Capacity Setting Soft Deleted Successfully',
        {
          runningAdmissionProgrammeCampus,
        }
      );
      if (isEmpty(runningAdmissionProgrammeCampus))
        http.setError(
          404,
          'Running Admission Programme Capacity Setting Data Not Found'
        );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable To Soft Delete This Running Admission Programme Capacity Setting',
        {
          error: { message: error.message },
        }
      );

      return http.send(res);
    }
  }

  /**
   * UNDO SOFT DELETE Specific RunningAdmissionProgrammeCampus Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async undoSoftDeleteRunningAdmissionProgrammeCampus(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      data.deleted_by_id = null;
      data.deleted_at = null;
      data.delete_approval_status = 'PENDING';
      const updateRunningAdmissionProgrammeCampus =
        await runningAdmissionProgrammeCampusService.undoSoftDeleteRunningAdmissionProgrammeCampus(
          id,
          data
        );
      const runningAdmissionProgrammeCampus =
        updateRunningAdmissionProgrammeCampus[1][0];

      http.setSuccess(
        200,
        'Running Admission Programme Capacity Setting Retrieved Successfully',
        {
          runningAdmissionProgrammeCampus,
        }
      );
      if (isEmpty(runningAdmissionProgrammeCampus))
        http.setError(
          404,
          'Running Admission Programme Capacity Setting Data Not Found'
        );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable To Retrieve This Running Admission Programme Capacity Setting',
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
 * @param {*} runningAdmissionProgrammeCampusId
 * @param {*} entryStudyYears
 * @param {*} sponsorships
 * @param {*} combinations
 * @param {*} transaction
 */
const handleUpdatingPivots = async function (
  runningAdmissionProgrammeCampusId,
  entryStudyYears,
  sponsorships,
  combinations,
  transaction
) {
  try {
    if (!isEmpty(entryStudyYears)) {
      await deleteOrCreateElements(
        entryStudyYears,
        'findAllRunningAdmissionProgrammeCampusesEntryYears',
        'bulkInsertRunningAdmissionProgrammeCampusEntryYears',
        'bulkRemoveRunningAdmissionProgrammeCampusEntryYears',
        'entry_study_year_id',
        runningAdmissionProgrammeCampusId,
        transaction
      );
    }

    if (!isEmpty(sponsorships)) {
      await deleteOrCreateElements(
        sponsorships,
        'findAllRunningAdmissionProgrammeCampusesSponsorships',
        'bulkInsertRunningAdmissionProgrammeCampusSponsorships',
        'bulkRemoveRunningAdmissionProgrammeCampusSponsorships',
        'sponsorship_id',
        runningAdmissionProgrammeCampusId,
        transaction
      );
    }

    if (!isEmpty(combinations)) {
      await deleteOrCreateElements(
        combinations,
        'findAllRunningAdmissionProgrammeCampusesCombinations',
        'bulkInsertRunningAdmissionProgrammeCampusCombinations',
        'bulkRemoveRunningAdmissionProgrammeCampusCombinations',
        'subject_combination_id',
        runningAdmissionProgrammeCampusId,
        transaction
      );
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} runningAdmissionProgrammeSpecialFeeId
 * @param {*} specialFeeAmounts
 * @param {*} transaction
 */
const handleUpdatingCapacitySettingSpecialFeeAmounts = async function (
  runningAdmissionProgrammeSpecialFeeId,
  specialFeeAmounts,
  transaction
) {
  try {
    if (!isEmpty(specialFeeAmounts)) {
      await deleteOrCreateSpecialElements(
        specialFeeAmounts,
        'findAllRunningAdmissionProgrammeSpecialFeeAmounts',
        'bulkInsertRunningAdmissionProgrammeSpecialFeeAmounts',
        'bulkRemoveRunningAdmissionProgrammeSpecialFeeAmounts',
        'updateRunningAdmissionProgrammeSpecialFeeAmount',
        'billing_category_id',
        runningAdmissionProgrammeSpecialFeeId,
        transaction
      );
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} firstElements
 * @param {*} findAllService
 * @param {*} insertService
 * @param {*} deleteService
 * @param {*} firstField
 * @param {*} runningAdmissionProgrammeCampusId
 * @param {*} transaction
 * @returns
 */
const deleteOrCreateElements = async (
  firstElements,
  findAllService,
  insertService,
  deleteService,
  firstField,
  runningAdmissionProgrammeCampusId,
  transaction
) => {
  const elementsToDelete = [];
  const elementsToInsert = [];

  const secondElements = await runningAdmissionProgrammeCampusService[
    findAllService
  ]({
    where: {
      running_admission_programme_campus_id: runningAdmissionProgrammeCampusId,
    },
    attributes: ['id', 'running_admission_programme_campus_id', firstField],
    raw: true,
  });

  firstElements.forEach((firstElement) => {
    const myElement = secondElements.find(
      (secondElement) =>
        parseInt(firstElement[firstField], 10) ===
          parseInt(secondElement[firstField], 10) &&
        parseInt(firstElement.running_admission_programme_campus_id, 10) ===
          parseInt(secondElement.running_admission_programme_campus_id, 10)
    );

    if (!myElement) elementsToInsert.push(firstElement);
  });

  secondElements.forEach((secondElement) => {
    const myElement = firstElements.find(
      (firstElement) =>
        parseInt(firstElement[firstField], 10) ===
          parseInt(secondElement[firstField], 10) &&
        parseInt(firstElement.running_admission_programme_campus_id, 10) ===
          parseInt(secondElement.running_admission_programme_campus_id, 10)
    );

    if (!myElement) elementsToDelete.push(secondElement.id);
  });

  if (!isEmpty(elementsToInsert)) {
    await runningAdmissionProgrammeCampusService[insertService](
      elementsToInsert,
      transaction
    );
  }

  if (!isEmpty(elementsToDelete)) {
    await runningAdmissionProgrammeCampusService[deleteService](
      elementsToDelete,
      transaction
    );
  }

  return { elementsToDelete, elementsToInsert };
};

/**
 *
 * @param {*} firstElements
 * @param {*} findAllService
 * @param {*} insertService
 * @param {*} deleteService
 * @param {*} updateService
 * @param {*} firstField
 * @param {*} runningAdmissionProgrammeSpecialFeeId
 * @param {*} transaction
 * @returns
 */
const deleteOrCreateSpecialElements = async (
  firstElements,
  findAllService,
  insertService,
  deleteService,
  updateService,
  firstField,
  runningAdmissionProgrammeSpecialFeeId,
  transaction
) => {
  const elementsToDelete = [];
  const elementsToInsert = [];
  const elementsToUpdate = [];

  const secondElements = await runningAdmissionProgrammeCampusService[
    findAllService
  ]({
    where: {
      programme_special_fees_id: runningAdmissionProgrammeSpecialFeeId,
    },
    attributes: [
      'id',
      'programme_special_fees_id',
      firstField,
      'currency_id',
      'amount',
    ],
    raw: true,
  });

  firstElements.forEach((firstElement) => {
    const myElement = secondElements.find(
      (secondElement) =>
        parseInt(firstElement[firstField], 10) ===
          parseInt(secondElement[firstField], 10) &&
        parseInt(firstElement.programme_special_fees_id, 10) ===
          parseInt(secondElement.programme_special_fees_id, 10)
    );

    if (!myElement) {
      elementsToInsert.push(firstElement);
    } else {
      const locateContextId = secondElements.find(
        (value) =>
          parseInt(value.programme_special_fees_id, 10) ===
            parseInt(firstElement.programme_special_fees_id, 10) &&
          parseInt(value.billing_category_id, 10) ===
            parseInt(firstElement.billing_category_id, 10)
      );

      elementsToUpdate.push({ id: locateContextId.id, ...firstElement });
    }
  });

  secondElements.forEach((secondElement) => {
    const myElement = firstElements.find(
      (firstElement) =>
        parseInt(firstElement[firstField], 10) ===
          parseInt(secondElement[firstField], 10) &&
        parseInt(firstElement.programme_special_fees_id, 10) ===
          parseInt(secondElement.programme_special_fees_id, 10)
    );

    if (!myElement) elementsToDelete.push(secondElement.id);
  });

  if (!isEmpty(elementsToInsert)) {
    await runningAdmissionProgrammeCampusService[insertService](
      elementsToInsert,
      transaction
    );
  }

  if (!isEmpty(elementsToDelete)) {
    await runningAdmissionProgrammeCampusService[deleteService](
      elementsToDelete,
      transaction
    );
  }

  if (!isEmpty(elementsToUpdate)) {
    for (const item of elementsToUpdate) {
      await runningAdmissionProgrammeCampusService[updateService](
        item.id,
        item,
        transaction
      );
    }
  }

  return { elementsToDelete, elementsToInsert };
};

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

const getRunningAdmissionProgrammeCampusAttributes = function () {
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
        association: 'entryStudyYears',
        attributes: [
          'id',
          'running_admission_programme_campus_id',
          'entry_study_year_id',
        ],
        include: [
          {
            association: 'entryStudyYear',
            attributes: ['id', 'metadata_value'],
          },
        ],
      },
      {
        association: 'sponsorships',
        attributes: [
          'id',
          'running_admission_programme_campus_id',
          'sponsorship_id',
        ],
        include: [
          {
            association: 'sponsorship',
            attributes: ['id', 'metadata_value'],
          },
        ],
      },
      {
        association: 'combinations',
        attributes: [
          'id',
          'running_admission_programme_campus_id',
          'subject_combination_id',
        ],
        include: [
          {
            association: 'subjectCombination',
          },
        ],
      },
      {
        association: 'runningAdmissionProgramme',
        attributes: ['running_admission_id', 'programme_id'],
        include: [
          {
            association: 'programme',
            attributes: ['programme_code', 'programme_title'],
          },
        ],
      },
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
    ],
  };
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

module.exports = RunningAdmissionProgrammeCampusController;
