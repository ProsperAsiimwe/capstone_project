const { toUpper, trim } = require('lodash');
const {
  programmeService,
  programmeVersionService,
  feesWaiverService,
  programmeVersionPlanService,
} = require('@services/index');
const {
  validateSheetColumns,
} = require('@controllers/Helpers/uploadValidator');
const { getMetadataValueId } = require('../Helpers/programmeHelper');
const {
  generateStandardStudentNumbers,
} = require('../Helpers/admissionsHelper');
const { appConfig } = require('@root/config');

/**
 *
 * @param {*} data
 * @param {*} student
 * @returns
 */
const checkEachStudentRow = async (data, student, metadataValues, user) => {
  const stdNoFormat = appConfig.DEFAULT_STUDENT_NUMBER_FORMAT;
  const code = appConfig.STUDENT_NUMBER_INSTITUTION_CODE;

  data.surname = student.SURNAME;
  data.other_names = student['OTHER NAMES'];

  const studentNameForErrorMsg =
    data.surname && data.other_names
      ? data.surname.concat(' ', data.other_names)
      : 'Student';

  validateSheetColumns(
    student,
    [
      'SURNAME',
      'OTHER NAMES',
      'PROGRAMME',
      'VERSION',
      'SPONSORSHIP',
      'PROGRAMME TYPE',
      'ENTRY ACADEMIC YEAR',
      'ENTRY STUDY YEAR',
      'CURRENT STUDY YEAR',
      'INTAKE',
      'CAMPUS',
      'BILLING CATEGORY',
      'RESIDENCE STATUS',
      'HALL OF ATTACHMENT',
      'ACADEMIC STATUS',
      'PHONE',
      'EMAIL',
      // 'STUDENT NUMBER',
      'REGISTRATION NUMBER',
      'GENDER',
      'DATE OF BIRTH (MM/DD/YYYY)',
      'NATIONALITY',
      'MARITAL STATUS',
    ],
    studentNameForErrorMsg
  );

  data.surname = student.SURNAME;
  data.other_names = student['OTHER NAMES'];

  data.programme_id = await getProgramme(
    student.PROGRAMME,
    studentNameForErrorMsg
  );

  const newProgrammeId = data.programme_id;
  const newProgrammeName = student.PROGRAMME;

  data.programme_version_id = await getProgrammeVersion(
    student.VERSION,
    newProgrammeId,
    newProgrammeName,
    studentNameForErrorMsg
  );

  const newProgrammeVersionId = data.programme_version_id;
  const newProgrammeVersionName = student.VERSION;

  data.sponsorship_id = getMetadataValueId(
    metadataValues,
    student.SPONSORSHIP,
    'SPONSORSHIPS',
    studentNameForErrorMsg
  );
  data.programme_type_id = await getProgrammeTypes(
    student['PROGRAMME TYPE'],
    newProgrammeId,
    newProgrammeName,
    studentNameForErrorMsg
  );
  data.entry_academic_year_id = getMetadataValueId(
    metadataValues,
    student['ENTRY ACADEMIC YEAR'],
    'ACADEMIC YEARS',
    studentNameForErrorMsg
  );
  data.entry_study_year_id = await getProgrammeStudyYears(
    student['ENTRY STUDY YEAR'],
    newProgrammeId,
    newProgrammeName,
    studentNameForErrorMsg
  );
  data.current_study_year_id = await getProgrammeStudyYears(
    student['CURRENT STUDY YEAR'],
    newProgrammeId,
    newProgrammeName,
    studentNameForErrorMsg
  );

  data.intake_id = getMetadataValueId(
    metadataValues,
    student.INTAKE,
    'INTAKES',
    studentNameForErrorMsg
  );

  data.campus_id = getMetadataValueId(
    metadataValues,
    student.CAMPUS,
    'CAMPUSES',
    studentNameForErrorMsg
  );

  if (student.PLAN) {
    data.programme_version_plan_id = await getPlans(
      student.PLAN,
      newProgrammeVersionId,
      newProgrammeVersionName,
      studentNameForErrorMsg
    );
  }

  if (student.SPECIALIZATION) {
    data.specialization_id = await getSpecializations(
      student.SPECIALIZATION,
      newProgrammeVersionId,
      newProgrammeVersionName,
      studentNameForErrorMsg
    );
  }

  if (student['SUBJECT COMBINATION']) {
    data.subject_combination_id = await getSubjectCombination(
      student['SUBJECT COMBINATION'],
      newProgrammeVersionId,
      newProgrammeVersionName,
      studentNameForErrorMsg
    );
  }

  if (student['FEES WAIVER']) {
    data.fees_waiver_id = await getFessWaivers(
      student['FEES WAIVER'],
      studentNameForErrorMsg
    );
  }

  data.billing_category_id = getMetadataValueId(
    metadataValues,
    student['BILLING CATEGORY'],
    'BILLING CATEGORIES',
    studentNameForErrorMsg
  );

  data.residence_status_id = getMetadataValueId(
    metadataValues,
    student['RESIDENCE STATUS'],
    'RESIDENCE STATUSES',
    studentNameForErrorMsg
  );

  data.hall_of_attachment_id = getMetadataValueId(
    metadataValues,
    student['HALL OF ATTACHMENT'],
    'HALLS',
    studentNameForErrorMsg
  );

  data.student_academic_status_id = getMetadataValueId(
    metadataValues,
    student['ACADEMIC STATUS'],
    'STUDENT ACADEMIC STATUSES',
    studentNameForErrorMsg
  );

  data.student_account_status_id = getMetadataValueId(
    metadataValues,
    'INACTIVE',
    'STUDENT ACCOUNT STATUSES',
    studentNameForErrorMsg
  );
  data.phone = student.PHONE.toString();
  data.email = student.EMAIL;
  data.registration_number = student['REGISTRATION NUMBER'].toString();

  if (toUpper(trim(student['REQUIRES NEW STUDENT NUMBER?'])) === 'TRUE') {
    if (stdNoFormat.includes('STANDARD')) {
      data.std_no_prefix = generateStandardStudentNumbers(
        trim(student['ENTRY ACADEMIC YEAR'])
      );
    } else {
      throw new Error(`Unknown Student Number Format.`);
    }

    const acmisStudentNumber = generateNewStudentNumbers(
      data.registration_number,
      data.std_no_prefix,
      code
    );

    data.old_student_number = acmisStudentNumber;
    data.student_number = acmisStudentNumber;
  } else {
    if (!student['STUDENT NUMBER']) {
      throw new Error(`${studentNameForErrorMsg} requires a STUDENT NUMBER.`);
    }

    data.old_student_number = student['STUDENT NUMBER'].toString();
    data.student_number = student['STUDENT NUMBER'].toString();
  }

  data.gender = student.GENDER;

  const dateOfBirth = student['DATE OF BIRTH (MM/DD/YYYY)'];

  data.date_of_birth = dateOfBirth;

  data.home_district = student['HOME DISTRICT']
    ? student['HOME DISTRICT']
    : 'NO RECORDS AVAILABLE';
  data.nationality = student.NATIONALITY;
  data.sponsor = student.SPONSOR ? student.SPONSOR : null;
  data.marital_status_id = getMetadataValueId(
    metadataValues,
    student['MARITAL STATUS'],
    'MARITAL STATUSES',
    studentNameForErrorMsg
  );

  data.is_current_programme = true;

  data.national_id_number = student['NATIONAL ID NUMBER']
    ? student['NATIONAL ID NUMBER']
    : null;

  data.passport_id_number = student['PASSPORT NUMBER']
    ? student['PASSPORT NUMBER']
    : null;

  data.religion = student.RELIGION ? student.RELIGION : 'RATHER NOT SAY';

  data.is_affiliated = student['IS AFFILIATED']
    ? student['IS AFFILIATED']
    : data.is_affiliated;

  data.affiliate_institute_name = student['AFFILIATE INSTITUTE']
    ? student['AFFILIATE INSTITUTE']
    : null;

  data.is_on_loan_scheme = student['IS ON LOAN SCHEME']
    ? student['IS ON LOAN SCHEME']
    : data.is_on_loan_scheme;

  data.has_completed = student['HAS COMPLETED']
    ? student['HAS COMPLETED']
    : data.has_completed;

  data.emis_number = student['EMIS NUMBER']
    ? student['EMIS NUMBER']
    : 'NO RECORDS AVAILABLE';

  data.guardian_name = student['GUARDIAN NAME']
    ? student['GUARDIAN NAME']
    : 'NO RECORDS AVAILABLE';

  data.guardian_email = student['GUARDIAN EMAIL']
    ? student['GUARDIAN EMAIL']
    : 'NO RECORDS AVAILABLE';

  data.guardian_phone = student['GUARDIAN PHONE']
    ? student['GUARDIAN PHONE']
    : 'NO RECORDS AVAILABLE';

  data.guardian_relationship = student['GUARDIAN RELATIONSHIP']
    ? student['GUARDIAN RELATIONSHIP']
    : 'NO RECORDS AVAILABLE';

  data.guardian_address = student['GUARDIAN ADDRESS']
    ? student['GUARDIAN ADDRESS']
    : 'NO RECORDS AVAILABLE';

  data.programmes = {
    programme_id: data.programme_id,
    programme_type_id: data.programme_type_id,
    programme_version_id: data.programme_version_id,
    programme_version_plan_id: data.programme_version_plan_id,
    specialization_id: data.specialization_id,
    subject_combination_id: data.subject_combination_id,
    fees_waiver_id: data.fees_waiver_id,
    entry_academic_year_id: data.entry_academic_year_id,
    entry_study_year_id: data.entry_study_year_id,
    current_study_year_id: data.current_study_year_id,
    intake_id: data.intake_id,
    campus_id: data.campus_id,
    sponsorship_id: data.sponsorship_id,
    billing_category_id: data.billing_category_id,
    residence_status_id: data.residence_status_id,
    hall_of_attachment_id: data.hall_of_attachment_id,
    hall_of_residence_id: data.hall_of_residence_id,
    student_academic_status_id: data.student_academic_status_id,
    marital_status_id: data.marital_status_id,
    old_student_number: data.old_student_number,
    registration_number: data.registration_number,
    student_number: data.student_number,
    is_current_programme: data.is_current_programme,
    is_on_loan_scheme: data.is_on_loan_scheme,
    has_completed: data.has_completed,
    is_affiliated: data.is_affiliated,
    affiliate_institute_name: data.affiliate_institute_name,
    sponsor: data.sponsor,
    created_by_id: user,
    approvals: data.approvals,
  };

  return data;
};

const getProgramme = async (value, student) => {
  try {
    const programmes = await programmeService.findAllProgrammes({
      raw: true,
    });

    const str = value.substring(0, value.indexOf(':')).slice(1, -1);

    const checkValue = programmes.find(
      (prog) => toUpper(trim(prog.programme_code)) === toUpper(trim(str))
    );

    if (checkValue) return parseInt(checkValue.id, 10);
    throw new Error(
      `Cannot find ${value} in the list of programmes for student ${student}`
    );
  } catch (error) {
    throw new Error(error.message);
  }
};

const getProgrammeVersion = async (value, programmeId, programme, student) => {
  try {
    const programmeVersions =
      await programmeVersionService.findAllProgrammeVersions({
        raw: true,
      });

    const checkValue = programmeVersions.find(
      (vers) =>
        toUpper(vers.version_title) === toUpper(value) &&
        parseInt(vers.programme_id, 10) === parseInt(programmeId, 10)
    );

    if (checkValue) return parseInt(checkValue.id, 10);
    throw new Error(
      `The version ${value} does not belong to the programme ${programme} for student ${student}`
    );
  } catch (error) {
    throw new Error(error.message);
  }
};

const getFessWaivers = async (value, student) => {
  try {
    const feesWaivers = await feesWaiverService.findAllFeesWaivers({
      raw: true,
    });

    const checkValue = feesWaivers.find(
      (waiver) => toUpper(waiver.fees_waiver_name) === toUpper(value)
    );

    if (checkValue) return parseInt(checkValue.id, 10);
    throw new Error(
      `Cannot find ${value} in the list of fees waivers for ${student}.`
    );
  } catch (error) {
    throw new Error(error.message);
  }
};

const getProgrammeStudyYears = async (
  value,
  programmeId,
  programme,
  student
) => {
  try {
    const returnValues = await studyYears(programmeId);

    const checkValue = returnValues.find(
      (studyYear) => toUpper(studyYear.programme_study_years) === toUpper(value)
    );

    if (checkValue) {
      return parseInt(checkValue.id, 10);
    } else {
      throw new Error(
        `Cannot find ${value} in the list of programme study years of ${programme} for student ${student}`
      );
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

const getPlans = async (value, versionId, versionName, student) => {
  try {
    const returnValues = await plans(versionId);

    const checkValue = returnValues.find(
      (pln) => toUpper(pln.plan.metadata_value) === toUpper(value)
    );

    if (checkValue) return parseInt(checkValue.id, 10);
    throw new Error(
      `Cannot find ${value} in the list of plans of programme version ${versionName} for the student ${student}`
    );
  } catch (error) {
    throw new Error(error.message);
  }
};

const getSpecializations = async (value, versionId, versionName, student) => {
  try {
    const returnValues = await specializations(versionId);

    const checkValue = returnValues.find(
      (specialization) =>
        toUpper(specialization.spec.specialization_title) ===
        toUpper(value.substring(value.indexOf(':') + 1))
    );

    if (checkValue) return parseInt(checkValue.id, 10);
    throw new Error(
      `Cannot find ${value} in the list of specializations of programme version ${versionName} for the student ${student}`
    );
  } catch (error) {
    throw new Error(error.message);
  }
};

const getSubjectCombination = async (
  value,
  versionId,
  versionName,
  student
) => {
  try {
    const returnValues = await categories(versionId);

    const checkValue = returnValues.find(
      (comb) => toUpper(comb.subject_combination_code) === toUpper(value)
    );

    if (checkValue) return parseInt(checkValue.id, 10);
    throw new Error(
      `Cannot find ${value} in the list of subjects for the programme version ${versionName} for the student ${student}`
    );
  } catch (error) {
    throw new Error(error.message);
  }
};

const getProgrammeTypes = async (value, programmeId, programme, student) => {
  try {
    const returnValues = await programmeTypes(programmeId);

    const checkValue = returnValues.find(
      (type) => toUpper(type.programmeType.metadata_value) === toUpper(value)
    );

    if (checkValue) return parseInt(checkValue.id, 10);
    throw new Error(
      `Cannot find ${value} in the list of programme types for ${programme} of student ${student}.`
    );
  } catch (error) {
    throw new Error(error.message);
  }
};

const programmeTypes = async (programmeId) => {
  try {
    const result = await programmeService.findAllProgrammeTypes({
      where: {
        programme_id: programmeId,
      },
      attributes: ['id', 'programme_type_id', 'programme_id'],
      include: [
        {
          association: 'programmeType',
          attributes: ['metadata_value'],
        },
      ],
      nest: true,
      raw: true,
    });

    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};

const plans = async (versionId) => {
  try {
    const result =
      await programmeVersionPlanService.findAllProgrammeVersionPlans({
        where: {
          programme_version_id: versionId,
        },
        include: [
          {
            association: 'plan',
            attributes: ['id', 'metadata_value'],
          },
        ],
        raw: true,
        nest: true,
      });

    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};

const specializations = async (versionId) => {
  try {
    const result =
      await programmeVersionService.findAllProgrammeVersionSpecializations({
        where: {
          programme_version_id: versionId,
        },
        include: [
          {
            association: 'spec',
            attributes: ['id', 'specialization_code', 'specialization_title'],
          },
        ],
        raw: true,
        nest: true,
      });

    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};

const categories = async (versionId) => {
  try {
    const subjectsCombinations = [];

    const result =
      await programmeVersionService.findAllProgrammeVersionSubjectCombinationCategories(
        {
          where: {
            programme_version_id: versionId,
          },
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
          raw: true,
          nest: true,
        }
      );

    result.forEach((category) => {
      subjectsCombinations.push(category.subjectCombinations);
    });

    return subjectsCombinations;
  } catch (error) {
    throw new Error(error.message);
  }
};

const studyYears = async (programmeId) => {
  try {
    const result = await programmeService.findAllProgrammeStudyYears({
      where: {
        programme_id: programmeId,
      },
      raw: true,
    });

    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} registrationNumber
 * @param {*} stdNoPrefix
 * @param {*} code
 * @returns
 */
const generateNewStudentNumbers = (registrationNumber, stdNoPrefix, code) => {
  try {
    const last5 = registrationNumber
      .split('/')[2]
      .slice(-5)
      .toString()
      .padStart(5, '0');

    return `${stdNoPrefix}${code}${last5}`;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = { checkEachStudentRow };
