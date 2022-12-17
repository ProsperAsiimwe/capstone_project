/* eslint-disable indent */
const { HttpResponse } = require('@helpers');
const moment = require('moment');
const {
  admittedApplicantService,
  metadataService,
  metadataValueService,
  programmeService,
  admissionSchemeService,
  feesWaiverService,
  programmeVersionService,
  runningAdmissionApplicantService,
  hallAllocationPolicyService,
  programmeAliasService,
  sponsorService,
} = require('@services/index');
const {
  isEmpty,
  now,
  toUpper,
  trim,
  orderBy,
  chunk,
  chain,
  includes,
} = require('lodash');
const model = require('@models');
const XLSX = require('xlsx');
const formidable = require('formidable');
const excelJs = require('exceljs');
const fs = require('fs');
const { appConfig } = require('@root/config');
const {
  migratedApplicantsColumns,
  admitApplicantsColumns,
} = require('./templateColumns');
const {
  getMetadataValueId,
  getMetadataValues,
  getMetadataValueName,
} = require('@controllers/Helpers/programmeHelper');
const {
  validateSheetColumns,
} = require('@controllers/Helpers/uploadValidator');
const { createAdmissionLog } = require('../Helpers/logsHelper');
const {
  generateCustomGuluRegistrationNumbers,
  generateCustomMakerereRegistrationNumbers,
  generateCustomKyambogoRegistrationNumbers,
  generateStandardStudentNumbers,
} = require('../Helpers/admissionsHelper');

const http = new HttpResponse();

class MigratedApplicantController {
  /**
   *
   * @param {*} req
   * @param {*} res
   */
  uploadMigrateApplicantsTemplate(req, res) {
    try {
      const { id: user, remember_token: rememberToken } = req.user;

      const form = new formidable.IncomingForm();
      const uploads = [];

      form.parse(req, async (err, fields, files) => {
        if (err) {
          http.setError(400, 'Unable To Upload Records.', {
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
        const uploadedRecords = XLSX.utils.sheet_to_json(
          workbook.Sheets[myTemplate]
        );

        if (isEmpty(uploadedRecords)) {
          http.setError(400, 'Cannot upload an empty template.');

          return http.send(res);
        }

        const metadataValues = await metadataValueService.findAllMetadataValues(
          {
            include: ['metadata'],
          }
        );

        const programmes = await programmeService
          .findAllProgrammes({
            include: [
              {
                association: 'versions',
                attributes: ['id', 'programme_id', 'is_current_version'],
              },
              {
                association: 'programmeStudyTypes',
                attributes: ['id', 'programme_id', 'programme_type_id'],
              },
              {
                association: 'programmeEntryYears',
                attributes: ['id', 'programme_id', 'entry_year_id'],
              },
              {
                association: 'programmeStudyYears',
                attributes: ['id', 'programme_id', 'programme_study_year_id'],
              },
            ],
          })
          .then((res) => {
            if (res) {
              return res.map((item) => item.get({ plain: true }));
            }
          });

        const findProgrammeAliases =
          await programmeAliasService.findAllProgrammeAliases({
            raw: true,
          });

        const admissionSchemes =
          await admissionSchemeService.findAllAdmissionSchemes({
            attributes: ['id', 'scheme_name'],
            raw: true,
          });

        const getProgrammeChoices = (
          programmeCodes,
          choiceOrder,
          aliasCodes,
          choiceStudyTypes,
          choiceEntryYears,
          choiceCampuses,
          intake,
          entryAcademicYear,
          sponsorship,
          admissionScheme,
          degreeCategory,
          errName
        ) => {
          try {
            const programmeChoices = [];

            const findIntakeId = getMetadataValueId(
              metadataValues,
              intake,
              'INTAKES',
              errName
            );

            const findEntryAcademicYearId = getMetadataValueId(
              metadataValues,
              entryAcademicYear,
              'ACADEMIC YEARS',
              errName
            );

            const findSponsorshipId = getMetadataValueId(
              metadataValues,
              sponsorship,
              'SPONSORSHIPS',
              errName
            );

            const findDegreeCategoryId = getMetadataValueId(
              metadataValues,
              degreeCategory,
              'DEGREE CATEGORIES',
              errName
            );

            const findAdmissionSchemeId = identifyAdmissionSchemeId(
              admissionScheme,
              errName
            );

            if (!isEmpty(programmeCodes)) {
              programmeCodes.forEach((progCode, index) => {
                const identifyProgramme = programmes.find(
                  (prog) =>
                    toUpper(trim(prog.programme_code)) ===
                    toUpper(trim(progCode))
                );

                if (identifyProgramme) {
                  const findVersionId = identifyCurrentProgrammeVersionId(
                    identifyProgramme.id,
                    errName
                  );

                  let findAliasId = null;

                  if (!isEmpty(aliasCodes)) {
                    if (aliasCodes[index]) {
                      findAliasId = identifyProgrammeAliasId(
                        aliasCodes[index],
                        identifyProgramme.id,
                        errName
                      );
                    }
                  }

                  if (!choiceStudyTypes[index]) {
                    throw new Error(
                      `Please provide the study type for programme: ${progCode} on record: ${errName}`
                    );
                  }

                  if (!choiceEntryYears[index]) {
                    throw new Error(
                      `Please provide the entry year for programme: ${progCode} on record: ${errName}`
                    );
                  }

                  if (!choiceCampuses[index]) {
                    throw new Error(
                      `Please provide the campus for programme: ${progCode} on record: ${errName}`
                    );
                  }

                  if (!choiceOrder[index]) {
                    throw new Error(
                      `Please provide the order of choice for programme: ${progCode} on record: ${errName}`
                    );
                  }

                  const findProgrammeTypeId = identifyProgrammeTypeId(
                    choiceStudyTypes[index],
                    identifyProgramme.id,
                    errName
                  );

                  const findEntryStudyYearId = identifyEntryStudyYearId(
                    choiceEntryYears[index],
                    identifyProgramme.id,
                    errName
                  );

                  const findCampusId = getMetadataValueId(
                    metadataValues,
                    choiceCampuses[index],
                    'CAMPUSES',
                    errName
                  );

                  let numberName = 'UNKNOWN';

                  if (parseInt(choiceOrder[index], 10) === 1) {
                    numberName = 'FIRST';
                  } else if (parseInt(choiceOrder[index], 10) === 2) {
                    numberName = 'SECOND';
                  } else if (parseInt(choiceOrder[index], 10) === 3) {
                    numberName = 'THIRD';
                  } else if (parseInt(choiceOrder[index], 10) === 4) {
                    numberName = 'FOURTH';
                  } else if (parseInt(choiceOrder[index], 10) === 5) {
                    numberName = 'FIFTH';
                  } else if (parseInt(choiceOrder[index], 10) === 6) {
                    numberName = 'SIXTH';
                  } else if (parseInt(choiceOrder[index], 10) === 7) {
                    numberName = 'SEVENTH';
                  } else if (parseInt(choiceOrder[index], 10) === 8) {
                    numberName = 'EIGHTH';
                  } else if (parseInt(choiceOrder[index], 10) === 9) {
                    numberName = 'NINETH';
                  } else if (parseInt(choiceOrder[index], 10) === 10) {
                    numberName = 'TENTH';
                  }

                  programmeChoices.push({
                    programme_id: identifyProgramme.id,
                    programme_version_id: findVersionId,
                    programme_alias_id: findAliasId,
                    programme_type_id: findProgrammeTypeId,
                    entry_study_year_id: findEntryStudyYearId,
                    campus_id: findCampusId,
                    intake_id: findIntakeId,
                    entry_academic_year_id: findEntryAcademicYearId,
                    sponsorship_id: findSponsorshipId,
                    degree_category_id: findDegreeCategoryId,
                    admission_scheme_id: findAdmissionSchemeId,
                    choice_number: parseInt(choiceOrder[index], 10),
                    choice_number_name: numberName,
                  });
                } else {
                  throw new Error(
                    `Cannot find ${progCode} in the list of programmes on the system for record ${errName}`
                  );
                }
              });

              return programmeChoices;
            }
          } catch (error) {
            throw new Error(error.message);
          }
        };

        const identifyCurrentProgrammeVersionId = (programmeId, errName) => {
          try {
            const findProgramme = programmes.find(
              (prog) => parseInt(prog.id, 10) === parseInt(programmeId, 10)
            );

            if (findProgramme) {
              const checkValue = findProgramme.versions.find(
                (version) =>
                  parseInt(version.programme_id, 10) ===
                    parseInt(programmeId, 10) &&
                  version.is_current_version === true
              );

              if (checkValue) return parseInt(checkValue.id, 10);
              throw new Error(
                `Cannot find the current version for the programme of record ${errName}`
              );
            } else {
              throw new Error(`Cannot find the programme of record ${errName}`);
            }
          } catch (error) {
            throw new Error(error.message);
          }
        };

        const identifyProgrammeTypeId = (value, programmeId, errName) => {
          try {
            const programmeTypeMetadataValueId = getMetadataValueId(
              metadataValues,
              value,
              'PROGRAMME STUDY TYPES',
              errName
            );

            const findProgramme = programmes.find(
              (prog) => parseInt(prog.id, 10) === parseInt(programmeId, 10)
            );

            if (findProgramme) {
              const checkValue = findProgramme.programmeStudyTypes.find(
                (type) =>
                  parseInt(type.programme_id, 10) ===
                    parseInt(programmeId, 10) &&
                  parseInt(type.programme_type_id, 10) ===
                    parseInt(programmeTypeMetadataValueId, 10)
              );

              if (checkValue) return parseInt(checkValue.programme_type_id, 10);
              throw new Error(
                `${value} is not a programme type for the programme of record ${errName}`
              );
            } else {
              throw new Error(`Cannot find the programme of record ${errName}`);
            }
          } catch (error) {
            throw new Error(error.message);
          }
        };

        const identifyAdmissionSchemeId = (value, errName) => {
          try {
            const checkValue = admissionSchemes.find(
              (scheme) =>
                toUpper(trim(scheme.scheme_name)) === toUpper(trim(value))
            );

            if (checkValue) return parseInt(checkValue.id, 10);
            throw new Error(
              `${value} is a not recognized as a scheme on the system for record ${errName}`
            );
          } catch (error) {
            throw new Error(error.message);
          }
        };

        const identifyProgrammeAliasId = (value, programmeId, errName) => {
          try {
            const checkValue = findProgrammeAliases.find(
              (alias) =>
                parseInt(alias.programme_id, 10) ===
                  parseInt(programmeId, 10) &&
                toUpper(trim(alias.alias_code)) === toUpper(trim(value))
            );

            if (checkValue) {
              return parseInt(checkValue.id, 10);
            } else {
              throw new Error(
                `The alias you have provided for recod: ${errName} doesnot match the programme.`
              );
            }
          } catch (error) {
            throw new Error(error.message);
          }
        };

        const identifyEntryStudyYearId = (value, programmeId, errName) => {
          try {
            const entryYearMetadataValueId = getMetadataValueId(
              metadataValues,
              value,
              'STUDY YEARS',
              errName
            );

            const findProgramme = programmes.find(
              (prog) => parseInt(prog.id, 10) === parseInt(programmeId, 10)
            );

            if (findProgramme) {
              const checkValue = findProgramme.programmeEntryYears.find(
                (year) =>
                  parseInt(year.programme_id, 10) ===
                    parseInt(programmeId, 10) &&
                  parseInt(year.entry_year_id, 10) ===
                    parseInt(entryYearMetadataValueId, 10)
              );

              if (checkValue) {
                return parseInt(checkValue.entry_year_id, 10);
              } else {
                throw new Error(
                  `${value} is not a an entry year for the programme of record ${errName}`
                );
              }
            } else {
              throw new Error(`Cannot find the programme of record ${errName}`);
            }
          } catch (error) {
            throw new Error(error.message);
          }
        };

        const getEmploymentRecords = (
          employers,
          posts,
          startDates,
          endDates,
          errName
        ) => {
          try {
            const employmentRecords = [];

            if (!isEmpty(employers)) {
              employers.forEach((employer, index) => {
                if (!posts[index]) {
                  throw new Error(
                    `Please include the post held at ${employer} for record: ${errName}`
                  );
                }

                if (!startDates[index]) {
                  throw new Error(
                    `Please include the start date at ${employer} for record: ${errName}`
                  );
                }

                employmentRecords.push({
                  employer: employer,
                  post_held: posts[index],
                  employment_start_date: startDates[index],
                  employment_end_date: endDates[index]
                    ? trim(endDates[index])
                    : null,
                });
              });

              return employmentRecords;
            }
          } catch (error) {
            throw new Error(error.message);
          }
        };

        const getRefereeDetails = (
          referees,
          emails,
          phones,
          addresses,
          errName
        ) => {
          try {
            const refereeRecords = [];

            if (!isEmpty(referees)) {
              referees.forEach((referee, index) => {
                if (!emails[index]) {
                  throw new Error(
                    `Please include the email for referee ${referee} for record: ${errName}`
                  );
                }

                if (!phones[index]) {
                  throw new Error(
                    `Please include the phone number for referee ${referee} for record: ${errName}`
                  );
                }

                refereeRecords.push({
                  referee_name: referee,
                  referee_email: emails[index],
                  referee_phone: phones[index],
                  referee_address: addresses[index]
                    ? trim(addresses[index])
                    : null,
                });
              });

              return refereeRecords;
            }
          } catch (error) {
            throw new Error(error.message);
          }
        };

        const getOtherQualifications = (
          qualifications,
          institutions,
          bodies,
          awardTypes,
          awardDurations,
          awardStartDates,
          awardEndDates,
          awardClassifications,
          gradesObtained,
          errName
        ) => {
          try {
            const otherQualificationRecords = [];

            if (!isEmpty(qualifications)) {
              qualifications.forEach((qualification, index) => {
                if (!institutions[index]) {
                  throw new Error(
                    `Please include the AWARDING INSTITUTION for qualification: ${qualification} for record: ${errName}`
                  );
                }

                if (!bodies[index]) {
                  throw new Error(
                    `Please include the AWARDING BODY for qualification: ${qualification} for record: ${errName}`
                  );
                }

                if (!awardTypes[index]) {
                  throw new Error(
                    `Please include the AWARD TYPE for qualification: ${qualification} for record: ${errName}`
                  );
                }

                if (!awardDurations[index]) {
                  throw new Error(
                    `Please include the AWARD DURATION for qualification: ${qualification} for record: ${errName}`
                  );
                }

                if (!awardClassifications[index]) {
                  throw new Error(
                    `Please include the AWARD CLASSIFICATION for qualification: ${qualification} for record: ${errName}`
                  );
                }

                otherQualificationRecords.push({
                  institution_name: toUpper(trim(institutions[index])),
                  award_obtained: toUpper(trim(qualification)),
                  award_start_date: awardStartDates[index]
                    ? trim(awardStartDates[index])
                    : null,
                  award_end_date: awardEndDates[index]
                    ? trim(awardEndDates[index])
                    : null,
                  awarding_body: toUpper(trim(bodies[index])),
                  award_type: toUpper(trim(awardTypes[index])),
                  award_duration: toUpper(trim(awardDurations[index])),
                  award_classification: toUpper(
                    trim(awardClassifications[index])
                  ),
                  grade_obtained: gradesObtained[index]
                    ? toUpper(trim(gradesObtained[index]))
                    : 'N/A',
                });
              });

              return otherQualificationRecords;
            }
          } catch (error) {
            throw new Error(error.message);
          }
        };

        try {
          await model.sequelize.transaction(async (transaction) => {
            for (const record of uploadedRecords) {
              const bioData = {
                created_by_id: user,
                highSchool: {},
              };

              if (!record.SURNAME && !record['OTHER NAMES']) {
                throw new Error(
                  `One Of The Records Provided Has No Surname And Other Names.`
                );
              }
              const errName = `${record.SURNAME} ${record['OTHER NAMES']}`;

              validateSheetColumns(
                record,
                [
                  'SURNAME',
                  'OTHER NAMES',
                  'PHONE NUMBER (256...)',
                  'EMAIL',
                  'DATE OF BIRTH (MM/DD/YYYY)',
                  'GENDER',
                  'NATIONALITY',
                  'PLACE OF RESIDENCE',
                  'PROGRAMME CHOICE CODES (comma separated)',
                  'CHOICE ORDER (comma separated)',
                  'CHOICE STUDY TYPES (comma separated)',
                  'CHOICE ENTRY STUDY YEARS (comma separated)',
                  'CHOICE CAMPUSES (comma separated)',
                  'INTAKE',
                  'ENTRY ACADEMIC YEAR',
                  'SPONSORSHIP',
                  'ADMISSION SCHEME',
                  'DEGREE CATEGORY',
                  'APPLICATION FEE',
                  'SAT O-LEVEL?',
                  'SAT A-LEVEL?',
                  'MIGRATED FORM ID',
                ],
                errName
              );

              if (record.SALUTATION) {
                bioData.salutation_id = getMetadataValueId(
                  metadataValues,
                  record.SALUTATION,
                  'SALUTATIONS',
                  errName
                );
              }

              if (record['MARITAL STATUS']) {
                bioData.marital_status_id = getMetadataValueId(
                  metadataValues,
                  record['MARITAL STATUS'],
                  'MARITAL STATUSES',
                  errName
                );
              }

              bioData.migrated_form_id = toUpper(
                trim(record['MIGRATED FORM ID'])
              );

              bioData.surname = toUpper(trim(record.SURNAME));

              bioData.other_names = toUpper(trim(record['OTHER NAMES']));

              bioData.phone = trim(record['PHONE NUMBER (256...)']);

              bioData.email = trim(record.EMAIL);

              bioData.date_of_birth = trim(
                record['DATE OF BIRTH (MM/DD/YYYY)']
              );

              if (record['DISTRICT OF ORIGIN']) {
                bioData.district_of_origin = toUpper(
                  trim(record['DISTRICT OF ORIGIN'])
                );
              }

              bioData.gender = toUpper(trim(record.GENDER));

              if (record.RELIGION) {
                bioData.religion = toUpper(trim(record.RELIGION));
              }

              bioData.nationality = toUpper(trim(record.NATIONALITY));

              if (record['NATIONAL ID NUMBER']) {
                bioData.national_id_number = trim(record['NATIONAL ID NUMBER']);
              }
              if (record['PASSPORT ID NUMBER']) {
                bioData.passport_id_number = trim(record['PASSPORT ID NUMBER']);
              }
              if (record['EMIS NUMBER']) {
                bioData.emis_id_number = trim(record['EMIS NUMBER']);
              }

              bioData.place_of_residence = toUpper(
                trim(record['PLACE OF RESIDENCE'])
              );

              if (record['DISTRICT OF BIRTH']) {
                bioData.district_of_birth = toUpper(
                  trim(record['DISTRICT OF BIRTH'])
                );
              }

              if (record['DISABILITY DETAILS']) {
                bioData.disability_details = toUpper(
                  trim(record['DISABILITY DETAILS'])
                );
              }

              if (record['MIGRATED PRN']) {
                bioData.migrated_prn = trim(record['MIGRATED PRN']);
              }

              if (isNaN(record['APPLICATION FEE'])) {
                throw new Error(
                  `Invalid APPLICATION FEE ${record['APPLICATION FEE']}, Please enter a number`
                );
              }

              bioData.application_fee = parseFloat(
                trim(record['APPLICATION FEE'])
              );

              if (record['AMOUNT PAID']) {
                if (isNaN(record['AMOUNT PAID'])) {
                  throw new Error(
                    `Invalid AMOUNT PAID ${record['AMOUNT PAID']}, Please enter a number`
                  );
                }

                bioData.amount_paid = parseFloat(trim(record['AMOUNT PAID']));

                if (bioData.amount_paid >= bioData.application_fee) {
                  bioData.fee_paid = true;
                }
              }

              if (record['FEE PAYMENT BANK']) {
                bioData.fee_payment_bank = toUpper(
                  trim(record['FEE PAYMENT BANK'])
                );
              }

              if (record['FEE PAYMENT BANK BRANCH']) {
                bioData.fee_payment_branch = toUpper(
                  trim(record['FEE PAYMENT BANK BRANCH'])
                );
              }

              bioData.choices = getProgrammeChoices(
                record['PROGRAMME CHOICE CODES (comma separated)']
                  .toString()
                  .split(','),
                record['CHOICE ORDER (comma separated)'].toString().split(','),
                record['CHOICE ALIAS CODES (comma separated)']
                  ? record['CHOICE ALIAS CODES (comma separated)']
                      .toString()
                      .split(',')
                  : [],
                record['CHOICE STUDY TYPES (comma separated)']
                  .toString()
                  .split(','),
                record['CHOICE ENTRY STUDY YEARS (comma separated)']
                  .toString()
                  .split(','),
                record['CHOICE CAMPUSES (comma separated)']
                  .toString()
                  .split(','),
                record.INTAKE,
                record['ENTRY ACADEMIC YEAR'],
                record.SPONSORSHIP,
                record['ADMISSION SCHEME'],
                record['DEGREE CATEGORY'],
                errName
              );

              if (toUpper(trim(record['SAT O-LEVEL?'])) === 'TRUE') {
                if (!record['O-LEVEL INDEX NUMBER']) {
                  throw new Error(
                    `Please provide the O-LEVEL INDEX NUMBER for record ${errName}`
                  );
                }

                if (!record['O-LEVEL YEAR']) {
                  throw new Error(
                    `Please provide the O-LEVEL YEAR for record ${errName}`
                  );
                }

                if (!record['O-LEVEL SCHOOL']) {
                  throw new Error(
                    `Please provide the O-LEVEL SCHOOL for record ${errName}`
                  );
                }

                bioData.highSchool.sat_o_level_exams = true;
                bioData.highSchool.o_level_index_number = trim(
                  record['O-LEVEL INDEX NUMBER']
                );
                bioData.highSchool.o_level_year_of_sitting = trim(
                  record['O-LEVEL YEAR']
                );
                bioData.highSchool.o_level_school = trim(
                  record['O-LEVEL SCHOOL']
                );
              }

              if (toUpper(trim(record['SAT A-LEVEL?'])) === 'TRUE') {
                if (!record['A-LEVEL INDEX NUMBER']) {
                  throw new Error(
                    `Please provide the A-LEVEL INDEX NUMBER for record ${errName}`
                  );
                }

                if (!record['A-LEVEL YEAR']) {
                  throw new Error(
                    `Please provide the A-LEVEL YEAR for record ${errName}`
                  );
                }

                if (!record['A-LEVEL SCHOOL']) {
                  throw new Error(
                    `Please provide the A-LEVEL SCHOOL for record ${errName}`
                  );
                }

                bioData.highSchool.sat_a_level_exams = true;
                bioData.highSchool.a_level_index_number = trim(
                  record['A-LEVEL INDEX NUMBER']
                );
                bioData.highSchool.a_level_year_of_sitting = trim(
                  record['A-LEVEL YEAR']
                );
                bioData.highSchool.a_level_school = trim(
                  record['A-LEVEL SCHOOL']
                );
              }

              bioData.employments = getEmploymentRecords(
                record['APPLICANT EMPLOYERS (comma separated)']
                  .toString()
                  .split(','),
                record['EMPLOYMENT POSTS HELD (comma separated)']
                  .toString()
                  .split(','),
                record['EMPLOYMENT START DATES (comma separated MM/DD/YYYY)']
                  .toString()
                  .split(','),
                record['EMPLOYMENT END DATES (comma separated MM/DD/YYYY)']
                  .toString()
                  .split(','),
                errName
              );

              bioData.referees = getRefereeDetails(
                record['APPLICANT REFEREE NAMES (comma separated)']
                  ? record['APPLICANT REFEREE NAMES (comma separated)']
                      .toString()
                      .split(',')
                  : [],
                record['REFEREE EMAILS (comma separated)']
                  ? record['REFEREE EMAILS (comma separated)']
                      .toString()
                      .split(',')
                  : [],
                record['REFEREE PHONES (comma separated)']
                  ? record['REFEREE PHONES (comma separated)']
                      .toString()
                      .split(',')
                  : [],
                record['REFEREE ADDRESSES (comma separated)']
                  ? record['REFEREE ADDRESSES (comma separated)']
                      .toString()
                      .split(',')
                  : [],
                errName
              );

              bioData.qualifications = getOtherQualifications(
                record['APPLICANT OTHER QUALIFICATIONS (comma separated)']
                  ? record['APPLICANT OTHER QUALIFICATIONS (comma separated)']
                      .toString()
                      .split(',')
                  : [],
                record['AWARDING INSTITUTIONS (comma separated)']
                  ? record['AWARDING INSTITUTIONS (comma separated)']
                      .toString()
                      .split(',')
                  : [],
                record['AWARDING BODIES (comma separated)']
                  ? record['AWARDING BODIES (comma separated)']
                      .toString()
                      .split(',')
                  : [],
                record['AWARD TYPES (comma separated)']
                  ? record['AWARD TYPES (comma separated)']
                      .toString()
                      .split(',')
                  : [],
                record['AWARD DURATIONS (comma separated)']
                  ? record['AWARD DURATIONS (comma separated)']
                      .toString()
                      .split(',')
                  : [],
                record['AWARD START DATES (comma separated MM/DD/YYYY)']
                  ? record[
                      'AWARD START DATES (comma separated MM/DD/YYYY)'
                    ].split(',')
                  : [],
                record['AWARD END DATES (comma separated MM/DD/YYYY)']
                  ? record[
                      'AWARD END DATES (comma separated MM/DD/YYYY)'
                    ].split(',')
                  : [],
                record['AWARD CLASSIFICATIONS (comma separated)']
                  ? record['AWARD CLASSIFICATIONS (comma separated)']
                      .toString()
                      .split(',')
                  : [],
                record['GRADES OBTAINED (comma separated)']
                  ? record['GRADES OBTAINED (comma separated)']
                      .toString()
                      .split(',')
                  : [],
                errName
              );

              const upload =
                await admittedApplicantService.createMigratedApplicant(
                  bioData,
                  transaction
                );

              uploads.push(upload[0]);
            }

            await createAdmissionLog(
              {
                user_id: user,
                operation: `CREATE`,
                area_accessed: `MIGTRATED APPLICANTS`,
                current_data: `Uploaded ${uploads.length} migrated applicants.`,
                ip_address: req.connection.remoteAddress,
                user_agent: req.get('user-agent'),
                token: rememberToken,
              },
              transaction
            );
          });
          http.setSuccess(200, 'All Records Uploaded Successfully.', {
            data: uploads,
          });

          return http.send(res);
        } catch (error) {
          http.setError(400, 'Unable To Upload Records.', {
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
   *
   * @param {*} req
   * @param {*} res
   */
  uploadAdministrativelyAdmittedApplicantsTemplate(req, res) {
    try {
      const { id: user, remember_token: rememberToken } = req.user;
      const random = Math.floor(Math.random() * moment().unix());
      const generatedBatchNumber = `BATCH-${random}`;

      const form = new formidable.IncomingForm();
      const uploads = [];

      form.parse(req, async (err, fields, files) => {
        if (err) {
          http.setError(400, 'Unable To Upload Records.', {
            error: { err },
          });

          return http.send(res);
        }

        const file = files[Object.keys(files)[0]];

        if (!file) {
          http.setError(400, 'Please Select A File To Upload.');

          return http.send(res);
        }

        const workbook = await XLSX.readFile(file.filepath, {
          cellDates: true,
        });

        const myTemplate = workbook.SheetNames[0];
        const uploadedRecords = XLSX.utils.sheet_to_json(
          workbook.Sheets[myTemplate]
        );

        if (isEmpty(uploadedRecords)) {
          http.setError(400, 'Cannot upload an empty template.');

          return http.send(res);
        }

        const metadataValues = await metadataValueService.findAllMetadataValues(
          {
            include: ['metadata'],
          }
        );

        const sponsors = await sponsorService.findAllRecords({
          attributes: ['id', 'sponsor_name', 'sponsor_email', 'sponsor_phone'],
          raw: true,
        });

        const programmes = await programmeService
          .findAllProgrammes({
            include: [
              {
                association: 'versions',
                attributes: ['id', 'programme_id', 'is_current_version'],
              },
              {
                association: 'programmeStudyTypes',
                attributes: ['id', 'programme_id', 'programme_type_id'],
              },
              {
                association: 'programmeEntryYears',
                attributes: ['id', 'programme_id', 'entry_year_id'],
              },
              {
                association: 'programmeStudyYears',
                attributes: ['id', 'programme_id', 'programme_study_year_id'],
              },
            ],
          })
          .then((res) => {
            if (res) {
              return res.map((item) => item.get({ plain: true }));
            }
          });

        const combinationCategories = await programmeVersionService
          .findAllProgrammeVersionSubjectCombinationCategories({
            include: [
              {
                association: 'subjectCombinations',
                attributes: [
                  'id',
                  'subject_combination_code',
                  'subject_combination_title',
                ],
              },
            ],
          })
          .then((res) => {
            if (res) {
              return res.map((item) => item.get({ plain: true }));
            }
          });

        const findProgrammeAliases =
          await programmeAliasService.findAllProgrammeAliases({
            raw: true,
          });

        const admissionSchemes =
          await admissionSchemeService.findAllAdmissionSchemes({
            attributes: ['id', 'scheme_name'],
            raw: true,
          });

        const feesWaivers = await feesWaiverService.findAllFeesWaivers({
          attributes: ['id', 'fees_waiver_name'],
          raw: true,
        });

        const identifyProgramme = (value, errName) => {
          try {
            const checkValue = programmes.find(
              (prog) =>
                toUpper(trim(prog.programme_code)) === toUpper(trim(value))
            );

            if (checkValue) return parseInt(checkValue.id, 10);
            throw new Error(
              `Cannot find ${value} in the list of programmes on the system for record ${errName}`
            );
          } catch (error) {
            throw new Error(error.message);
          }
        };

        const identifyProgrammeVersion = (programmeId, errName) => {
          try {
            const findProgramme = programmes.find(
              (prog) => parseInt(prog.id, 10) === parseInt(programmeId, 10)
            );

            if (findProgramme) {
              const checkValue = findProgramme.versions.find(
                (version) =>
                  parseInt(version.programme_id, 10) ===
                    parseInt(programmeId, 10) &&
                  version.is_current_version === true
              );

              if (checkValue) return parseInt(checkValue.id, 10);
              throw new Error(
                `Cannot find the current version for the programme of record ${errName}`
              );
            } else {
              throw new Error(`Cannot find the programme of record ${errName}`);
            }
          } catch (error) {
            throw new Error(error.message);
          }
        };

        const identifyProgrammeType = (value, programmeId, errName) => {
          try {
            const programmeTypeMetadataValueId = getMetadataValueId(
              metadataValues,
              value,
              'PROGRAMME STUDY TYPES',
              errName
            );

            const findProgramme = programmes.find(
              (prog) => parseInt(prog.id, 10) === parseInt(programmeId, 10)
            );

            if (findProgramme) {
              const checkValue = findProgramme.programmeStudyTypes.find(
                (type) =>
                  parseInt(type.programme_id, 10) ===
                    parseInt(programmeId, 10) &&
                  parseInt(type.programme_type_id, 10) ===
                    parseInt(programmeTypeMetadataValueId, 10)
              );

              if (checkValue) return parseInt(checkValue.programme_type_id, 10);
              throw new Error(
                `${value} is not a programme type for the programme of record ${errName}`
              );
            } else {
              throw new Error(`Cannot find the programme of record ${errName}`);
            }
          } catch (error) {
            throw new Error(error.message);
          }
        };

        const identifyAdmissionScheme = (value, errName) => {
          try {
            const checkValue = admissionSchemes.find(
              (scheme) =>
                toUpper(trim(scheme.scheme_name)) === toUpper(trim(value))
            );

            if (checkValue) return parseInt(checkValue.id, 10);
            throw new Error(
              `${value} is a not recognized as a scheme on the system for record ${errName}`
            );
          } catch (error) {
            throw new Error(error.message);
          }
        };

        const identifyFeesWaiver = (value, errName) => {
          try {
            const checkValue = feesWaivers.find(
              (waiver) =>
                toUpper(trim(waiver.fees_waiver_name)) === toUpper(trim(value))
            );

            if (checkValue) return parseInt(checkValue.id, 10);
            throw new Error(
              `${value} is a not recognized as a fees waiver on the system for record ${errName}`
            );
          } catch (error) {
            throw new Error(error.message);
          }
        };

        const identifySubjectCombination = (
          value,
          programmeVersionId,
          errName
        ) => {
          try {
            const checkValue = combinationCategories.find(
              (category) =>
                parseInt(category.programme_version_id, 10) ===
                parseInt(programmeVersionId, 10)
            );

            if (checkValue) {
              const findCombinationCode = checkValue.subjectCombinations.find(
                (combination) =>
                  toUpper(trim(combination.subject_combination_code)) ===
                  toUpper(trim(value))
              );

              if (findCombinationCode) {
                return parseInt(findCombinationCode.id, 10);
              } else {
                throw new Error(
                  `${value} is a not recognized as a subject combination code of the programme on the system for record ${errName}`
                );
              }
            } else {
              throw new Error(
                `There are no subject combinations defined for the programme's current version on record ${errName}`
              );
            }
          } catch (error) {
            throw new Error(error.message);
          }
        };

        const identifyAlias = (value, programmeId, errName) => {
          try {
            const checkValue = findProgrammeAliases.find(
              (alias) =>
                parseInt(alias.programme_id, 10) ===
                  parseInt(programmeId, 10) &&
                toUpper(trim(alias.alias_code)) === toUpper(trim(value))
            );

            if (checkValue) {
              return parseInt(checkValue.id, 10);
            } else {
              throw new Error(
                `The alias you have provided for recod: ${errName} doesnot match the programme.`
              );
            }
          } catch (error) {
            throw new Error(error.message);
          }
        };

        const identifyEntryStudyYear = (value, programmeId, errName) => {
          try {
            const entryYearMetadataValueId = getMetadataValueId(
              metadataValues,
              value,
              'STUDY YEARS',
              errName
            );

            const findProgramme = programmes.find(
              (prog) => parseInt(prog.id, 10) === parseInt(programmeId, 10)
            );

            if (findProgramme) {
              const checkValue = findProgramme.programmeEntryYears.find(
                (year) =>
                  parseInt(year.programme_id, 10) ===
                    parseInt(programmeId, 10) &&
                  parseInt(year.entry_year_id, 10) ===
                    parseInt(entryYearMetadataValueId, 10)
              );

              if (checkValue) {
                const findProgrammeStudyYear =
                  findProgramme.programmeStudyYears.find(
                    (year) =>
                      parseInt(year.programme_id, 10) ===
                        parseInt(programmeId, 10) &&
                      parseInt(year.programme_study_year_id, 10) ===
                        parseInt(checkValue.entry_year_id, 10)
                  );

                if (findProgrammeStudyYear) {
                  return parseInt(findProgrammeStudyYear.id, 10);
                } else {
                  throw new Error(
                    `${value} is not a study year for the programme of record ${errName}`
                  );
                }
              } else {
                throw new Error(
                  `${value} is not a an entry year for the programme of record ${errName}`
                );
              }
            } else {
              throw new Error(`Cannot find the programme of record ${errName}`);
            }
          } catch (error) {
            throw new Error(error.message);
          }
        };

        const identifyRunningAdmissionApplicant = async (
          value,
          academicYearId,
          admissionSchemeId,
          degreeCategoryId,
          intakeId,
          surname,
          otherNames,
          errName
        ) => {
          try {
            const runningAdmissionApplicant =
              await runningAdmissionApplicantService
                .findOneRunningAdmissionApplicant({
                  where: {
                    form_id: trim(value),
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
                          attributes: [
                            'id',
                            'scheme_name',
                            'scheme_description',
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

            if (runningAdmissionApplicant) {
              if (
                toUpper(trim(runningAdmissionApplicant.application_status)) ===
                'ADMITTED'
              ) {
                throw new Error(
                  `${value} belongs to an applicant that has already been admitted on record ${errName}.`
                );
              }

              const checkDuplicateAdmitting =
                await admittedApplicantService.findOneAdmittedApplicant({
                  where: {
                    running_admission_applicant_id:
                      runningAdmissionApplicant.id,
                    entry_academic_year_id: academicYearId,
                  },
                  raw: true,
                });

              if (checkDuplicateAdmitting) {
                throw new Error(
                  `${value} belongs to an applicant that has already been admitted in the same academic year on record ${errName}.`
                );
              }

              if (
                parseInt(
                  runningAdmissionApplicant.runningAdmission.academic_year_id,
                  10
                ) === parseInt(academicYearId, 10) &&
                parseInt(
                  runningAdmissionApplicant.runningAdmission
                    .admission_scheme_id,
                  10
                ) === parseInt(admissionSchemeId, 10) &&
                parseInt(
                  runningAdmissionApplicant.runningAdmission.degree_category_id,
                  10
                ) === parseInt(degreeCategoryId, 10) &&
                parseInt(
                  runningAdmissionApplicant.runningAdmission.intake_id,
                  10
                ) === parseInt(intakeId, 10)
              ) {
                const applicantNames = [
                  toUpper(trim(runningAdmissionApplicant.applicant.surname)),
                  toUpper(
                    trim(runningAdmissionApplicant.applicant.other_names)
                  ),
                ];

                if (
                  includes(applicantNames, toUpper(surname)) ||
                  includes(applicantNames, toUpper(otherNames))
                ) {
                  return parseInt(runningAdmissionApplicant.id, 10);
                } else {
                  throw new Error(
                    `A name you have entered is not matching with applicant's account details SURNAME: ${toUpper(
                      trim(runningAdmissionApplicant.applicant.surname)
                    )} or OTHER NAMES: ${toUpper(
                      trim(runningAdmissionApplicant.applicant.other_names)
                    )} for record ${errName}.`
                  );
                }
              } else {
                throw new Error(
                  `${value} belongs to a form that was filled for running admission of Scheme: ${runningAdmissionApplicant.runningAdmission.admissionScheme.scheme_name}, Academic year: ${runningAdmissionApplicant.runningAdmission.academicYear.metadata_value}, Intake: ${runningAdmissionApplicant.runningAdmission.intake.metadata_value}, Degree category: ${runningAdmissionApplicant.runningAdmission.degreeCategory.metadata_value} for record ${errName}`
                );
              }
            } else {
              throw new Error(
                `${value} is a valid form id for record ${errName}`
              );
            }
          } catch (error) {
            throw new Error(error.message);
          }
        };

        const getSponsorId = (value) => {
          try {
            const checkValue = sponsors.find(
              (sponsor) =>
                toUpper(trim(sponsor.sponsor_name)) === toUpper(trim(value))
            );

            if (checkValue) return parseInt(checkValue.id, 10);
            throw new Error(`Cannot find ${value} in the list of sponsors.`);
          } catch (error) {
            throw new Error(error.message);
          }
        };

        try {
          await model.sequelize.transaction(async (transaction) => {
            for (const record of uploadedRecords) {
              const data = {
                created_by_id: user,
              };

              if (!record.SURNAME && !record['OTHER NAMES']) {
                throw new Error(
                  `One Of The Records Provided Has No Surname And Other Names.`
                );
              }
              const errName = `${record.SURNAME} ${record['OTHER NAMES']}`;

              validateSheetColumns(
                record,
                [
                  'SURNAME',
                  'OTHER NAMES',
                  'GENDER',
                  'PROGRAMME CODE',
                  'PROGRAMME TYPE/STUDY TIME',
                  'ENTRY STUDY YEAR',
                  'CAMPUS',
                  'SPONSORSHIP',
                  'ACADEMIC YEAR',
                  'INTAKE',
                  'DEGREE CATEGORY',
                  'ADMISSION SCHEME',
                  'NATIONALITY',
                  'BILLING CATEGORY',
                  'IS ADMINISTRATIVELY ADMITTED ?',
                  'RESIDENCE STATUS',
                ],
                errName
              );

              data.batch_number = generatedBatchNumber;
              data.surname = toUpper(trim(record.SURNAME));
              data.other_names = toUpper(trim(record['OTHER NAMES']));
              data.gender = toUpper(trim(record.GENDER));
              data.nationality = toUpper(trim(record.NATIONALITY));

              if (record['A-LEVEL INDEX']) {
                data.a_level_index = toUpper(trim(record['A-LEVEL INDEX']));
              }

              if (record['A-LEVEL YEAR']) {
                data.a_level_year = toUpper(trim(record['A-LEVEL YEAR']));
              }

              data.programme_id = identifyProgramme(
                record['PROGRAMME CODE'],
                errName
              );

              data.programme_version_id = identifyProgrammeVersion(
                data.programme_id,
                errName
              );

              data.programme_type_id = identifyProgrammeType(
                record['PROGRAMME TYPE/STUDY TIME'],
                data.programme_id,
                errName
              );

              data.campus_id = getMetadataValueId(
                metadataValues,
                record.CAMPUS,
                'CAMPUSES',
                errName
              );

              data.intake_id = getMetadataValueId(
                metadataValues,
                record.INTAKE,
                'INTAKES',
                errName
              );

              data.sponsorship_id = getMetadataValueId(
                metadataValues,
                record.SPONSORSHIP,
                'SPONSORSHIPS',
                errName
              );

              data.degree_category_id = getMetadataValueId(
                metadataValues,
                record['DEGREE CATEGORY'],
                'DEGREE CATEGORIES',
                errName
              );

              data.entry_academic_year_id = getMetadataValueId(
                metadataValues,
                record['ACADEMIC YEAR'],
                'ACADEMIC YEARS',
                errName
              );

              data.entry_study_year_id = identifyEntryStudyYear(
                record['ENTRY STUDY YEAR'],
                data.programme_id,
                errName
              );

              data.admission_scheme_id = identifyAdmissionScheme(
                record['ADMISSION SCHEME'],
                errName
              );

              if (record['FEES WAIVER']) {
                data.fees_waiver_id = identifyFeesWaiver(
                  record['FEES WAIVER'],
                  errName
                );
              }

              data.billing_category_id = getMetadataValueId(
                metadataValues,
                record['BILLING CATEGORY'],
                'BILLING CATEGORIES',
                errName
              );

              data.residence_status_id = getMetadataValueId(
                metadataValues,
                record['RESIDENCE STATUS'],
                'RESIDENCE STATUSES',
                errName
              );

              if (record['SUBJECT COMBINATION CODE']) {
                data.subject_combination_id = identifySubjectCombination(
                  record['SUBJECT COMBINATION CODE'],
                  data.programme_version_id,
                  errName
                );
              }

              if (record['PROGRAMME ALIAS CODE']) {
                data.programme_alias_id = identifyAlias(
                  record['PROGRAMME ALIAS CODE'],
                  data.programme_id,
                  errName
                );
              }

              if (record['HALL OF ATTACHMENT']) {
                data.hall_of_attachment_id = getMetadataValueId(
                  metadataValues,
                  record['HALL OF ATTACHMENT'],
                  'HALLS',
                  errName
                );
              }

              if (record['HALL OF RESIDENCE']) {
                data.hall_of_residence_id = getMetadataValueId(
                  metadataValues,
                  record['HALL OF RESIDENCE'],
                  'HALLS',
                  errName
                );
              }

              if (record['MODE OF ENTRY']) {
                data.mode_of_entry_id = getMetadataValueId(
                  metadataValues,
                  record['MODE OF ENTRY'],
                  'MODE OF ENTRIES',
                  errName
                );
              }

              if (record.SPONSOR) {
                data.sponsor_id = getSponsorId(record.SPONSOR);
              }

              if (record.PHONE) {
                data.phone = trim(record.PHONE);
              }

              if (record.EMAIL) {
                data.email = trim(record.EMAIL);
              }

              if (record['DATE OF BIRTH (MM/DD/YYYY)']) {
                data.date_of_birth = trim(record['DATE OF BIRTH (MM/DD/YYYY)']);
              }

              if (record['DISTRICT OF ORIGIN']) {
                data.district_of_origin = trim(record['DISTRICT OF ORIGIN']);
              }

              if (
                toUpper(trim(record['IS ADMINISTRATIVELY ADMITTED ?'])) ===
                'FALSE'
              ) {
                data.is_administratively_admitted = false;

                if (!record['FORM ID (ACMIS APPLICANTS ONLY)']) {
                  throw new Error(
                    `Please provide the id of the form which the applicant: ${errName} filled while applying.`
                  );
                } else {
                  data.running_admission_applicant_id =
                    await identifyRunningAdmissionApplicant(
                      record['FORM ID (ACMIS APPLICANTS ONLY)'],
                      data.entry_academic_year_id,
                      data.admission_scheme_id,
                      data.degree_category_id,
                      data.intake_id,
                      data.surname,
                      data.other_names,
                      errName
                    );

                  await runningAdmissionApplicantService.updateRunningAdmissionApplicant(
                    data.running_admission_applicant_id,
                    {
                      application_status: 'ADMITTED',
                      application_admission_date: moment.now(),
                    },
                    transaction
                  );
                }
              } else {
                data.is_administratively_admitted = true;
              }

              const upload =
                await admittedApplicantService.createAdmittedApplicant(
                  data,
                  transaction
                );

              uploads.push(upload[0]);
            }

            await createAdmissionLog(
              {
                user_id: user,
                operation: `CREATE`,
                area_accessed: `ADMIT APPLICANTS`,
                current_data: `Administratively admitted ${uploads.length} applicants of batch number: ${generatedBatchNumber}.`,
                ip_address: req.connection.remoteAddress,
                user_agent: req.get('user-agent'),
                token: rememberToken,
              },
              transaction
            );
          });
          http.setSuccess(200, 'All Records Uploaded Successfully.', {
            data: uploads,
          });

          return http.send(res);
        } catch (error) {
          http.setError(400, 'Unable To Upload Records.', {
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
   *
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async generateRegistrationNumbers(req, res) {
    try {
      const context = req.query;
      const data = {};
      const { id: user } = req.user;
      const format = appConfig.DEFAULT_REGISTRATION_NUMBER_FORMAT;

      data.last_updated_by_id = user;
      data.updated_at = moment.now();

      if (
        !context.academic_year_id ||
        !context.intake_id ||
        !context.admission_scheme_id ||
        !context.degree_category_id
      ) {
        throw new Error(`Invalid Context.`);
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
        context.academic_year_id,
        'ACADEMIC YEARS'
      );

      const intake = getMetadataValueName(
        metadataValues,
        context.intake_id,
        'INTAKES'
      );

      const degreeCategory = getMetadataValueName(
        metadataValues,
        context.degree_category_id,
        'DEGREE CATEGORIES'
      );

      const findAdmissionScheme =
        await admissionSchemeService.findOneAdmissionScheme({
          where: {
            id: context.admission_scheme_id,
          },
          attributes: ['id', 'scheme_name'],
          raw: true,
        });

      if (!findAdmissionScheme) {
        throw new Error(`Unable To Find Admission Scheme Specified.`);
      }

      const findAdmittedApplicantsByContext = await admittedApplicantService
        .findAllAdmittedApplicants({
          where: {
            entry_academic_year_id: context.academic_year_id,
            intake_id: context.intake_id,
            admission_scheme_id: context.admission_scheme_id,
            degree_category_id: context.degree_category_id,
          },
          include: [
            {
              association: 'sponsorship',
              attributes: ['id', 'metadata_value'],
            },
            {
              association: 'programme',
              attributes: ['id', 'programme_code'],
              include: [
                {
                  association: 'department',
                  attributes: ['id'],
                  include: [
                    {
                      association: 'faculty',
                      attributes: ['id'],
                      include: [
                        {
                          association: 'college',
                          attributes: ['id', 'college_code'],
                        },
                      ],
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

      if (isEmpty(findAdmittedApplicantsByContext)) {
        throw new Error(
          `Unable to find any admitted applicants on Scheme: ${findAdmissionScheme.scheme_name}, Academic year: ${academicYear}, Intake: ${intake} and Degree category: ${degreeCategory}.`
        );
      }

      const withoutRegNumbers = findAdmittedApplicantsByContext.filter(
        (applicant) => !applicant.registration_number
      );

      if (isEmpty(withoutRegNumbers)) {
        throw new Error(
          `All applicants for this context already have registration numbers.`
        );
      }

      const orderedAlphabetically = orderBy(
        withoutRegNumbers,
        ['surname'],
        ['asc']
      );

      // fresh start riddim

      const admittedApplicantsByAcademicYear =
        await admittedApplicantService.findAllAdmittedApplicants({
          where: {
            entry_academic_year_id: context.academic_year_id,
          },
          raw: true,
        });

      if (isEmpty(admittedApplicantsByAcademicYear)) {
        throw new Error(
          `Unable to find any applicants admitted in academic year: ${academicYear}.`
        );
      }

      const usedCounters = [];

      let counter = 1;

      admittedApplicantsByAcademicYear.forEach((admitted) => {
        if (admitted.reg_no_counter) {
          usedCounters.push(parseInt(admitted.reg_no_counter, 10));
        }
      });

      if (!isEmpty(usedCounters)) {
        const sortAscending = usedCounters.sort((a, b) => {
          return a - b;
        });

        const largest = sortAscending[sortAscending.length - 1];

        counter = parseInt(largest, 10) + 1;
      }

      const totalNumberOfAdmittedApplicants =
        admittedApplicantsByAcademicYear.length;

      let paddingCounter = totalNumberOfAdmittedApplicants.toString().length;

      await model.sequelize.transaction(async (transaction) => {
        for (const applicant of orderedAlphabetically) {
          const programmeType = getMetadataValueName(
            metadataValues,
            applicant.programme_type_id,
            'PROGRAMME STUDY TYPES'
          );
          const sponsorship = getMetadataValueName(
            metadataValues,
            applicant.sponsorship_id,
            'SPONSORSHIPS'
          );

          if (format.includes('CUSTOM_GULU')) {
            paddingCounter = totalNumberOfAdmittedApplicants
              .toString()
              .padStart(4, '0').length;

            const getRegNumbers = generateCustomGuluRegistrationNumbers(
              academicYear,
              programmeType,
              sponsorship,
              applicant
            );

            data.reg_no_prefix = getRegNumbers.reg_no_prefix;
            data.reg_no_postfix = getRegNumbers.reg_no_postfix;
          } else if (format.includes('CUSTOM_MAKERERE')) {
            if (paddingCounter < 3) {
              paddingCounter = totalNumberOfAdmittedApplicants
                .toString()
                .padStart(3, '0').length;
            }

            const getRegNumbers = generateCustomMakerereRegistrationNumbers(
              academicYear,
              programmeType,
              degreeCategory,
              sponsorship,
              applicant
            );

            data.reg_no_prefix = getRegNumbers.reg_no_prefix;
            data.reg_no_postfix = getRegNumbers.reg_no_postfix;
          } else if (format.includes('CUSTOM_KYAMBOGO')) {
            if (paddingCounter < 3) {
              paddingCounter = totalNumberOfAdmittedApplicants
                .toString()
                .padStart(3, '0').length;
            }

            const getRegNumbers =
              await generateCustomKyambogoRegistrationNumbers(
                academicYear,
                programmeType,
                sponsorship,
                applicant
              );

            data.reg_no_prefix = getRegNumbers.reg_no_prefix;
            data.reg_no_postfix = getRegNumbers.reg_no_postfix;
          }

          const checkApplicant =
            await admittedApplicantService.findOneAdmittedApplicant({
              where: {
                id: applicant.id,
              },
              raw: true,
            });

          if (!checkApplicant) {
            throw new Error(`Invalid applicant record provided.`);
          }

          const finalRegNumber = trim(
            `${data.reg_no_prefix}${counter
              .toString()
              .padStart(paddingCounter, '0')}${data.reg_no_postfix}`
          );

          data.registration_number = finalRegNumber;
          data.reg_no_counter = counter;

          const findIfExists = admittedApplicantsByAcademicYear.find(
            (applicant) =>
              parseInt(applicant.reg_no_counter, 10) ===
              parseInt(data.reg_no_counter, 10)
          );

          if (!findIfExists) {
            await admittedApplicantService.updateAdmittedApplicant(
              applicant.id,
              data,
              transaction
            );

            counter = counter + 1;
          }
        }
      });

      http.setSuccess(200, 'Registration Numbers Generated Successfully.');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Generate Registration Numbers.', {
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

  async fixDuplicateRegistrationNumbers(req, res) {
    try {
      const code = appConfig.STUDENT_NUMBER_INSTITUTION_CODE;
      const format = appConfig.DEFAULT_REGISTRATION_NUMBER_FORMAT;

      const findAdmittedApplicants =
        await admittedApplicantService.findAllAdmittedApplicants({
          raw: true,
        });

      const newAllocations = [];

      await model.sequelize.transaction(async (transaction) => {
        if (!isEmpty(findAdmittedApplicants)) {
          const groupedRecords = chain(findAdmittedApplicants)
            .groupBy('entry_academic_year_id')
            .map((value, key) => ({
              entry_academic_year_id: key,
              records: orderBy(value, ['id'], ['asc']),
            }))
            .value();

          if (!isEmpty(groupedRecords)) {
            for (const group of groupedRecords) {
              const duplicates = [];
              const takenCounters = [];
              const availableCounters = [];

              const applicantsWithRegNumbers = group.records.filter(
                (applicant) => applicant.reg_no_counter
              );

              const totalApplicantsByAcademicYear = group.records.length;

              let paddingCounter =
                totalApplicantsByAcademicYear.toString().length;

              group.records.forEach((record) => {
                takenCounters.push(parseInt(record.reg_no_counter, 10));
              });

              if (!isEmpty(takenCounters)) {
                const list = [];

                for (let i = 1; i <= totalApplicantsByAcademicYear; i++) {
                  list.push(i);
                }

                if (!isEmpty(list)) {
                  const array2NotInArray1 = list.filter(
                    (x) => !takenCounters.includes(x)
                  );

                  availableCounters.push(...array2NotInArray1);
                }
              }

              const lookup = applicantsWithRegNumbers.reduce((a, e) => {
                a[e.reg_no_counter] = ++a[e.reg_no_counter] || 0;

                return a;
              }, {});

              const allDuplicates = applicantsWithRegNumbers.filter(
                (e) => lookup[e.reg_no_counter]
              );

              if (!isEmpty(allDuplicates)) {
                const alreadyPushed = allDuplicates.filter(
                  (item) => item.student_account_created === true
                );

                if (!isEmpty(alreadyPushed)) {
                  alreadyPushed.forEach((pushed) => {
                    const alreadyPushedIndex = allDuplicates.findIndex(
                      (dup) => parseInt(dup.id, 10) === parseInt(pushed.id, 10)
                    );

                    allDuplicates.splice(alreadyPushedIndex, 1);
                  });
                }

                const grouped = chain(allDuplicates)
                  .groupBy('reg_no_counter')
                  .map((value, key) => ({
                    reg_no_counter: key,
                    records: orderBy(value, ['id'], ['asc']),
                  }))
                  .value();

                grouped.forEach((group) => {
                  if (group.records.length > 1) {
                    group.records.splice(0, 1);
                  }
                });

                grouped.forEach((group) => {
                  duplicates.push(...group.records);
                });
              }

              if (format.includes('CUSTOM_GULU')) {
                paddingCounter = totalApplicantsByAcademicYear
                  .toString()
                  .padStart(4, '0').length;
              } else {
                if (paddingCounter < 3) {
                  paddingCounter = totalApplicantsByAcademicYear
                    .toString()
                    .padStart(3, '0').length;
                }
              }

              if (!isEmpty(duplicates)) {
                let counterIndex = 0;

                for (const dup of duplicates) {
                  if (!isEmpty(availableCounters)) {
                    const longCounter = availableCounters[counterIndex]
                      .toString()
                      .padStart(paddingCounter, '0');

                    const newRegNumber = dup.reg_no_prefix.concat(
                      longCounter,
                      dup.reg_no_postfix
                    );

                    const last5 = availableCounters[counterIndex]
                      .toString()
                      .padStart(5, '0');

                    const newStudentNumber = dup.std_no_prefix.concat(
                      code,
                      last5
                    );

                    const findIfExists = group.records.find(
                      (applicant) =>
                        parseInt(applicant.reg_no_counter, 10) ===
                        parseInt(availableCounters[counterIndex], 10)
                    );

                    if (!findIfExists) {
                      newAllocations.push({
                        id: dup.id,
                        reg_no_counter: availableCounters[counterIndex],
                        std_no_counter: availableCounters[counterIndex],
                      });

                      await admittedApplicantService.updateAdmittedApplicant(
                        dup.id,
                        {
                          reg_no_counter: availableCounters[counterIndex],
                          std_no_counter: availableCounters[counterIndex],
                          registration_number: newRegNumber,
                          student_number: newStudentNumber,
                          admission_letter: null,
                          print_admission_date: null,
                          admission_id: null,
                          admission_letter_printed_by: null,
                          provisional_admission_letter: null,
                          provisional_admission_id: null,
                          print_provisional_letter_date: null,
                          provisional_letter_printed_by: null,
                          provisional_letter_sent: false,
                          admission_letter_sent: false,
                        },
                        transaction
                      );
                    }
                  }

                  counterIndex = counterIndex + 1;
                }
              }
            }
          }
        }
      });

      http.setSuccess(200, 'Duplicates Fixed Successfully.', {
        data: newAllocations,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fix Duplicates.', {
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
  async generateStudentNumbers(req, res) {
    try {
      const context = req.query;
      const data = {};
      const { id: user } = req.user;
      const format = appConfig.DEFAULT_STUDENT_NUMBER_FORMAT;
      const code = appConfig.STUDENT_NUMBER_INSTITUTION_CODE;

      data.last_updated_by_id = user;
      data.updated_at = moment.now();

      if (
        !context.academic_year_id ||
        !context.intake_id ||
        !context.admission_scheme_id ||
        !context.degree_category_id
      ) {
        throw new Error(`Invalid Context.`);
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
        context.academic_year_id,
        'ACADEMIC YEARS'
      );

      const intake = getMetadataValueName(
        metadataValues,
        context.intake_id,
        'INTAKES'
      );

      const degreeCategory = getMetadataValueName(
        metadataValues,
        context.degree_category_id,
        'DEGREE CATEGORIES'
      );

      const findAdmissionScheme =
        await admissionSchemeService.findOneAdmissionScheme({
          where: {
            id: context.admission_scheme_id,
          },
          attributes: ['id', 'scheme_name'],
          raw: true,
        });

      if (!findAdmissionScheme) {
        throw new Error(`Unable To Find Admission Scheme Specified.`);
      }

      const findAdmittedApplicantsByContext =
        await admittedApplicantService.findAllAdmittedApplicants({
          where: {
            entry_academic_year_id: context.academic_year_id,
            intake_id: context.intake_id,
            admission_scheme_id: context.admission_scheme_id,
            degree_category_id: context.degree_category_id,
          },
          raw: true,
        });

      if (isEmpty(findAdmittedApplicantsByContext)) {
        throw new Error(
          `Unable to find any admitted applicants on Scheme: ${findAdmissionScheme.scheme_name}, Academic year: ${academicYear}, Intake: ${intake} and Degree category: ${degreeCategory}.`
        );
      }

      let admittedApplicantsByProgrammeTypeWithoutStdNumbers = [];

      admittedApplicantsByProgrammeTypeWithoutStdNumbers =
        findAdmittedApplicantsByContext.filter(
          (applicant) => !applicant.student_number
        );

      if (isEmpty(admittedApplicantsByProgrammeTypeWithoutStdNumbers)) {
        throw new Error(
          `All applicants for this context already have student numbers.`
        );
      }

      admittedApplicantsByProgrammeTypeWithoutStdNumbers = orderBy(
        admittedApplicantsByProgrammeTypeWithoutStdNumbers,
        ['surname'],
        ['asc']
      );

      const admittedApplicantsByAcademicYear =
        await admittedApplicantService.findAllAdmittedApplicants({
          where: {
            entry_academic_year_id: context.academic_year_id,
          },
          raw: true,
        });

      if (isEmpty(admittedApplicantsByAcademicYear)) {
        throw new Error(
          `Unable to find any applicants admitted in academic year: ${academicYear}.`
        );
      }

      const admittedApplicantsByAcademicYearWithStdNumbers =
        admittedApplicantsByAcademicYear.filter(
          (applicant) => applicant.student_number
        );

      let counter = 0;

      if (!isEmpty(admittedApplicantsByAcademicYearWithStdNumbers)) {
        const ordered = orderBy(
          admittedApplicantsByAcademicYearWithStdNumbers,
          ['std_no_counter'],
          ['asc']
        );

        const lastObjectInArray = ordered[ordered.length - 1];

        counter = lastObjectInArray.std_no_counter
          ? parseInt(lastObjectInArray.std_no_counter, 10) + 1
          : parseInt(lastObjectInArray.reg_no_counter, 10) + 1;
      } else {
        counter = counter + 1;
      }

      if (format.includes('STANDARD')) {
        data.std_no_prefix = generateStandardStudentNumbers(academicYear);
      }

      await model.sequelize.transaction(async (transaction) => {
        for (const applicant of admittedApplicantsByProgrammeTypeWithoutStdNumbers) {
          const checkApplicant =
            await admittedApplicantService.findOneAdmittedApplicant({
              where: {
                id: applicant.id,
              },
              raw: true,
            });

          if (!checkApplicant) {
            throw new Error(`Invalid applicant record provided.`);
          }

          if (!checkApplicant.reg_no_counter) {
            throw new Error(
              `Applicant: ${checkApplicant.surname} ${checkApplicant.other_names} needs a registration number to be generated before the student number.`
            );
          }

          const last5 = checkApplicant.reg_no_counter
            .toString()
            .padStart(5, '0');

          const finalStdNumber = `${data.std_no_prefix}${code}${last5}`;

          data.student_number = finalStdNumber;
          data.std_no_counter = counter;

          await admittedApplicantService.updateAdmittedApplicant(
            applicant.id,
            data,
            transaction
          );

          counter = counter + 1;
        }
      });

      http.setSuccess(200, 'Student Numbers Generated Successfully.');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Generate Student Numbers.', {
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
  async generateHalls(req, res) {
    try {
      const context = req.query;
      const data = {};
      const { id: user, remember_token: rememberToken } = req.user;

      data.last_updated_by_id = user;
      data.updated_at = moment.now();

      if (
        !context.academic_year_id ||
        !context.intake_id ||
        !context.admission_scheme_id ||
        !context.degree_category_id
      ) {
        throw new Error(`Invalid Context.`);
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
        context.academic_year_id,
        'ACADEMIC YEARS'
      );

      const intake = getMetadataValueName(
        metadataValues,
        context.intake_id,
        'INTAKES'
      );

      const degreeCategory = getMetadataValueName(
        metadataValues,
        context.degree_category_id,
        'DEGREE CATEGORIES'
      );

      const findAdmissionScheme =
        await admissionSchemeService.findOneAdmissionScheme({
          where: {
            id: context.admission_scheme_id,
          },
          attributes: ['id', 'scheme_name'],
          raw: true,
        });

      if (!findAdmissionScheme) {
        throw new Error(`Unable To Find Admission Scheme Specified.`);
      }

      const findAdmittedApplicantsByContext =
        await admittedApplicantService.findAllAdmittedApplicants({
          where: {
            entry_academic_year_id: context.academic_year_id,
            intake_id: context.intake_id,
            admission_scheme_id: context.admission_scheme_id,
            degree_category_id: context.degree_category_id,
          },
          raw: true,
        });

      if (isEmpty(findAdmittedApplicantsByContext)) {
        throw new Error(
          `Unable to find any admitted applicants on Scheme: ${findAdmissionScheme.scheme_name}, Academic year: ${academicYear}, Intake: ${intake} and Degree category: ${degreeCategory}.`
        );
      }

      const findHallAllocationPolicies =
        await hallAllocationPolicyService.findAllRecords({
          attributes: [
            'id',
            'hall_id',
            'degree_category_id',
            'is_for_male_students',
            'is_for_female_students',
          ],
          raw: true,
        });

      if (isEmpty(findHallAllocationPolicies)) {
        throw new Error(`Unable To Find Any Hall Allocation Policy Records.`);
      }

      const maleHalls = findHallAllocationPolicies.filter(
        (policy) =>
          parseInt(policy.degree_category_id, 10) ===
            parseInt(context.degree_category_id, 10) &&
          policy.is_for_male_students === true
      );

      const femaleHalls = findHallAllocationPolicies.filter(
        (policy) =>
          parseInt(policy.degree_category_id, 10) ===
            parseInt(context.degree_category_id, 10) &&
          policy.is_for_female_students === true
      );

      const maleAdmittedApplicantsByContextWithoutHalls =
        findAdmittedApplicantsByContext.filter(
          (applicant) =>
            toUpper(trim(applicant.gender)) === 'MALE' &&
            !applicant.hall_of_attachment_id
        );

      const femaleAdmittedApplicantsByContextWithoutHalls =
        findAdmittedApplicantsByContext.filter(
          (applicant) =>
            toUpper(trim(applicant.gender)) === 'FEMALE' &&
            !applicant.hall_of_attachment_id
        );

      await model.sequelize.transaction(async (transaction) => {
        if (
          !isEmpty(maleHalls) &&
          !isEmpty(maleAdmittedApplicantsByContextWithoutHalls)
        ) {
          const chunks = chunk(maleAdmittedApplicantsByContextWithoutHalls, 20);

          let counter = 0;

          const numberOfHalls = maleHalls.length;

          for (const chunk of chunks) {
            if (counter <= parseInt(numberOfHalls, 10)) {
              for (const applicant of chunk) {
                data.hall_of_attachment_id = maleHalls[counter].hall_id;
                data.hall_of_residence_id = maleHalls[counter].hall_id;

                await admittedApplicantService.updateAdmittedApplicant(
                  applicant.id,
                  data,
                  transaction
                );
              }
            }

            counter = counter + 1;

            if (counter > parseInt(numberOfHalls, 10)) {
              counter = 0;
            }
          }
        }

        if (
          !isEmpty(femaleHalls) &&
          !isEmpty(femaleAdmittedApplicantsByContextWithoutHalls)
        ) {
          const chunks = chunk(
            femaleAdmittedApplicantsByContextWithoutHalls,
            20
          );

          let counter = 0;

          const numberOfHalls = femaleHalls.length;

          for (const chunk of chunks) {
            if (counter <= parseInt(numberOfHalls, 10)) {
              for (const applicant of chunk) {
                data.hall_of_attachment_id = femaleHalls[counter].hall_id;
                data.hall_of_residence_id = femaleHalls[counter].hall_id;

                await admittedApplicantService.updateAdmittedApplicant(
                  applicant.id,
                  data,
                  transaction
                );
              }
            }

            counter = counter + 1;

            if (counter > parseInt(numberOfHalls, 10)) {
              counter = 0;
            }
          }
        }

        await createAdmissionLog(
          {
            user_id: user,
            operation: `CREATE`,
            area_accessed: `ASSIGN HALLS OF ATTACHMENT/RESIDENCE FOR ADMITTED APPLICANTS`,
            current_data: `Assigned Halls of Attachment/Residence For Admitted Applicants on Scheme: ${findAdmissionScheme.scheme_name}, Academic year: ${academicYear}, Intake: ${intake} and Degree category: ${degreeCategory}.`,
            ip_address: req.connection.remoteAddress,
            user_agent: req.get('user-agent'),
            token: rememberToken,
          },
          transaction
        );
      });

      http.setSuccess(200, 'Halls Assigned Successfully.');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Assign Halls.', {
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
  async downloadMigrateApplicantsTemplate(req, res) {
    try {
      const { user } = req;

      const workbook = new excelJs.Workbook();

      const metadata = await metadataService.findAllMetadata({
        attributes: ['metadata_name'],
        include: [
          { association: 'metadataValues', attributes: ['metadata_value'] },
        ],
        raw: true,
        nest: true,
      });

      const admissionSchemes =
        await admissionSchemeService.findAllAdmissionSchemes({
          attributes: ['id', 'scheme_name'],
          raw: true,
        });

      const rootSheet = workbook.addWorksheet('MIGRATED APPLICANTS');
      const salutationsSheet = workbook.addWorksheet('SalutationsSheet');
      const maritalStatusSheet = workbook.addWorksheet('MaritalStatusSheet');
      const intakesSheet = workbook.addWorksheet('IntakesSheet');
      const academicYearsSheet = workbook.addWorksheet('AcademicYearsSheet');
      const sponsorshipsSheet = workbook.addWorksheet('SponsorshipsSheet');
      const admissionSchemesSheet = workbook.addWorksheet(
        'AdmissionSchemesSheet'
      );
      const degreeCategoriesSheet = workbook.addWorksheet(
        'DegreeCategorySheet'
      );

      rootSheet.properties.defaultColWidth = migratedApplicantsColumns.length;
      rootSheet.columns = migratedApplicantsColumns;

      salutationsSheet.state = 'veryHidden';
      maritalStatusSheet.state = 'veryHidden';
      intakesSheet.state = 'veryHidden';
      academicYearsSheet.state = 'veryHidden';
      sponsorshipsSheet.state = 'veryHidden';
      admissionSchemesSheet.state = 'veryHidden';
      degreeCategoriesSheet.state = 'veryHidden';

      salutationsSheet.addRows(getMetadataValues(metadata, 'SALUTATIONS'));
      maritalStatusSheet.addRows(
        getMetadataValues(metadata, 'MARITAL STATUSES')
      );
      intakesSheet.addRows(getMetadataValues(metadata, 'INTAKES'));
      academicYearsSheet.addRows(getMetadataValues(metadata, 'ACADEMIC YEARS'));
      sponsorshipsSheet.addRows(getMetadataValues(metadata, 'SPONSORSHIPS'));
      admissionSchemesSheet.addRows(
        admissionSchemes.map((scheme) => [`${scheme.scheme_name}`])
      );
      degreeCategoriesSheet.addRows(
        getMetadataValues(metadata, 'DEGREE CATEGORIES')
      );

      // Column Validations

      rootSheet.dataValidations.add('A2:A1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=SalutationsSheet!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: 'Please select a valid value from the list',
      });

      rootSheet.dataValidations.add('H2:H1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['"MALE, FEMALE"'],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid value from the list',
      });

      rootSheet.dataValidations.add('J2:J1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=MaritalStatusSheet!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: 'Please select a valid value from the list',
      });

      rootSheet.dataValidations.add('X2:X1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=IntakesSheet!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: 'Please select a valid value from the list',
      });

      rootSheet.dataValidations.add('Y2:Y1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=AcademicYearsSheet!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: 'Please select a valid value from the list',
      });

      rootSheet.dataValidations.add('Z2:Z1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=SponsorshipsSheet!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: 'Please select a valid value from the list',
      });

      rootSheet.dataValidations.add('AA2:AA1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=AdmissionSchemesSheet!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: 'Please select a valid value from the list',
      });

      rootSheet.dataValidations.add('AB2:AB1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=DegreeCategorySheet!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: 'Please select a valid value from the list',
      });

      rootSheet.dataValidations.add('AH2:AH1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['"TRUE, FALSE"'],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid value from the list',
      });

      rootSheet.dataValidations.add('AL2:AL1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['"TRUE, FALSE"'],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid value from the list',
      });

      const uploadPath = `${process.cwd()}/src/assets/documents/templates`;

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true }, (err) => {
          throw new Error(err.message);
        });
      }

      const template = `${uploadPath}/migrated-applicants-template-${
        user.surname
      }-${user.other_names}-${user.id}-${now()}.xlsm`;

      await workbook.xlsx.writeFile(template);
      await res.download(
        template,
        'MIGRATED-APPLICANTS-TEMPLATE.xlsx',
        (error) => {
          if (error) {
            throw new Error(error.message);
          }
        }
      );
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
  async downloadAdministrativelyAdmittedApplicantsTemplate(req, res) {
    try {
      const { user } = req;

      const workbook = new excelJs.Workbook();

      const metadata = await metadataService.findAllMetadata({
        attributes: ['metadata_name'],
        include: [
          { association: 'metadataValues', attributes: ['metadata_value'] },
        ],
        raw: true,
        nest: true,
      });

      const admissionSchemes =
        await admissionSchemeService.findAllAdmissionSchemes({
          attributes: ['id', 'scheme_name'],
          raw: true,
        });

      const feesWaivers = await feesWaiverService.findAllFeesWaivers({
        attributes: ['id', 'fees_waiver_name'],
        raw: true,
      });

      const sponsors = await sponsorService.findAllRecords({
        attributes: ['id', 'sponsor_name'],
      });

      const rootSheet = workbook.addWorksheet('ADMIT APPLICANTS');
      const intakesSheet = workbook.addWorksheet('IntakesSheet');
      const campusSheet = workbook.addWorksheet('CampusSheet');
      const academicYearsSheet = workbook.addWorksheet('AcademicYearsSheet');
      const sponsorshipsSheet = workbook.addWorksheet('SponsorshipsSheet');
      const degreeCategoriesSheet = workbook.addWorksheet(
        'DegreeCategorySheet'
      );
      const admissionSchemesSheet = workbook.addWorksheet(
        'AdmissionSchemesSheet'
      );
      const programmeTypeSheet = workbook.addWorksheet('ProgrammeTypeSheet');
      const studyYearsSheet = workbook.addWorksheet('StudyYearSheet');
      const feesWaiversSheet = workbook.addWorksheet('FeesWaiversSheet');
      const billingCategoriesSheet = workbook.addWorksheet(
        'BillingCategoriesSheet'
      );
      const hallsSheet = workbook.addWorksheet('HallsSheet');
      const sponsorSheet = workbook.addWorksheet('SponsorSheet');
      const residenceStatusSheet = workbook.addWorksheet(
        'ResidenceStatusSheet'
      );
      const modeOfEntrySheet = workbook.addWorksheet('ModeOfEntrySheet');

      rootSheet.properties.defaultColWidth = admitApplicantsColumns.length;
      rootSheet.columns = admitApplicantsColumns;

      degreeCategoriesSheet.state = 'veryHidden';
      admissionSchemesSheet.state = 'veryHidden';
      intakesSheet.state = 'veryHidden';
      academicYearsSheet.state = 'veryHidden';
      sponsorshipsSheet.state = 'veryHidden';
      campusSheet.state = 'veryHidden';
      studyYearsSheet.state = 'veryHidden';
      programmeTypeSheet.state = 'veryHidden';
      feesWaiversSheet.state = 'veryHidden';
      billingCategoriesSheet.state = 'veryHidden';
      hallsSheet.state = 'veryHidden';
      sponsorSheet.state = 'veryHidden';
      residenceStatusSheet.state = 'veryHidden';
      modeOfEntrySheet.state = 'veryHidden';

      degreeCategoriesSheet.addRows(
        getMetadataValues(metadata, 'DEGREE CATEGORIES')
      );
      studyYearsSheet.addRows(getMetadataValues(metadata, 'STUDY YEARS'));
      programmeTypeSheet.addRows(
        getMetadataValues(metadata, 'PROGRAMME STUDY TYPES')
      );
      campusSheet.addRows(getMetadataValues(metadata, 'CAMPUSES'));
      intakesSheet.addRows(getMetadataValues(metadata, 'INTAKES'));
      academicYearsSheet.addRows(getMetadataValues(metadata, 'ACADEMIC YEARS'));
      sponsorshipsSheet.addRows(getMetadataValues(metadata, 'SPONSORSHIPS'));
      billingCategoriesSheet.addRows(
        getMetadataValues(metadata, 'BILLING CATEGORIES')
      );
      hallsSheet.addRows(getMetadataValues(metadata, 'HALLS'));
      admissionSchemesSheet.addRows(
        admissionSchemes.map((scheme) => [`${scheme.scheme_name}`])
      );
      feesWaiversSheet.addRows(
        feesWaivers.map((waiver) => [waiver.fees_waiver_name])
      );
      sponsorSheet.addRows(sponsors.map((sponsor) => [sponsor.sponsor_name]));
      residenceStatusSheet.addRows(
        getMetadataValues(metadata, 'RESIDENCE STATUSES')
      );
      modeOfEntrySheet.addRows(getMetadataValues(metadata, 'MODE OF ENTRIES'));

      // Column Validations

      rootSheet.dataValidations.add('C2:C1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['"MALE, FEMALE"'],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid value from the list',
      });

      rootSheet.dataValidations.add('G2:G1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=ProgrammeTypeSheet!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: 'Please select a valid value from the list',
      });

      rootSheet.dataValidations.add('H2:H1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=StudyYearSheet!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: 'Please select a valid value from the list',
      });

      rootSheet.dataValidations.add('I2:I1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=CampusSheet!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: 'Please select a valid value from the list',
      });

      rootSheet.dataValidations.add('J2:J1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=SponsorshipsSheet!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: 'Please select a valid value from the list',
      });

      rootSheet.dataValidations.add('K2:K1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=AcademicYearsSheet!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: 'Please select a valid value from the list',
      });

      rootSheet.dataValidations.add('L2:L1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=IntakesSheet!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: 'Please select a valid value from the list',
      });

      rootSheet.dataValidations.add('M2:M1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=DegreeCategorySheet!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: 'Please select a valid value from the list',
      });

      rootSheet.dataValidations.add('N2:N1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=AdmissionSchemesSheet!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: 'Please select a valid value from the list',
      });

      rootSheet.dataValidations.add('R2:R1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=FeesWaiversSheet!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: 'Please select a valid value from the list',
      });

      rootSheet.dataValidations.add('S2:S1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=BillingCategoriesSheet!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: 'Please select a valid value from the list',
      });

      rootSheet.dataValidations.add('T2:T1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['"FALSE, TRUE"'],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid value from the list',
      });

      rootSheet.dataValidations.add('V2:V1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=ResidenceStatusSheet!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: 'Please select a valid value from the list',
      });

      rootSheet.dataValidations.add('W2:W1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=HallsSheet!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: 'Please select a valid value from the list',
      });

      rootSheet.dataValidations.add('Y2:Y1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=HallsSheet!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: 'Please select a valid value from the list',
      });

      rootSheet.dataValidations.add('Y2:Y1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=SponsorSheet!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: 'Please select a valid value from the list',
      });

      rootSheet.dataValidations.add('AD2:AD1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=ModeOfEntrySheet!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: 'Please select a valid value from the list',
      });

      const uploadPath = `${process.cwd()}/src/assets/documents/templates`;

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true }, (err) => {
          throw new Error(err.message);
        });
      }

      const template = `${uploadPath}/admit-applicants-template-${
        user.surname
      }-${user.other_names}-${user.id}-${now()}.xlsm`;

      await workbook.xlsx.writeFile(template);
      await res.download(
        template,
        'ADMIT-APPLICANTS-TEMPLATE.xlsx',
        (error) => {
          if (error) {
            throw new Error(error.message);
          }
        }
      );
    } catch (error) {
      http.setError(400, 'Unable To Download This Template.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * UPDATE Specific
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async updateAdmittedApplicant(req, res) {
    try {
      const { applicantId } = req.params;
      const { id: user, remember_token: rememberToken } = req.user;
      const data = req.body;

      const admittedApplicant =
        await admittedApplicantService.findOneAdmittedApplicant({
          where: {
            id: applicantId,
          },
          raw: true,
        });

      if (!admittedApplicant) {
        throw new Error(`Unable to find admitted applicant.`);
      }

      if (data.surname) {
        data.surname = toUpper(data.surname);
      }

      if (data.other_names) {
        data.other_names = toUpper(data.other_names);
      }

      const applicant = await model.sequelize.transaction(
        async (transaction) => {
          const updateApplicant =
            await admittedApplicantService.updateAdmittedApplicant(
              applicantId,
              data,
              transaction
            );

          await createAdmissionLog(
            {
              user_id: user,
              operation: `UPDATE`,
              area_accessed: `ADMITTED APPLICANTS`,
              current_data: `Updated ADMITTED Applicant's Record for the record of id: ${applicantId}) To ${data}.`,
              previous_data: `${admittedApplicant}`,
              ip_address: req.connection.remoteAddress,
              user_agent: req.get('user-agent'),
              token: rememberToken,
            },
            transaction
          );

          return updateApplicant;
        }
      );

      http.setSuccess(200, 'Admitted Applicant Record Updated Successfully', {
        data: applicant,
      });
      if (isEmpty(applicant))
        http.setError(404, 'Admitted Applicant record Not Found');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Update This Admitted Applicant Record', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

module.exports = MigratedApplicantController;
