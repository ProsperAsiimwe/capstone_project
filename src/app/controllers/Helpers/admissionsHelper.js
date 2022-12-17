const { isEmpty, trim, toUpper } = require('lodash');
const moment = require('moment');
const {
  runningAdmissionService,
  programmeAliasService,
} = require('@services/index');

/**
 *
 * @param {*} runningAdmissionId
 * @param {*} applicantId
 * @returns
 */
const generateAdmissionFormId = async function (
  runningAdmissionId,
  applicantId
) {
  const runningAdmission =
    await runningAdmissionService.fetchRunningAdmissionById(runningAdmissionId);

  if (isEmpty(runningAdmission)) {
    throw new Error('Running Admission Data Not Found');
  }

  const academicYear = trim(runningAdmission.academic_year)
    .split('/')[0]
    .slice(-2);

  const random = Math.floor(Math.random() * moment().unix()) + applicantId;

  const formId = `${academicYear}APF${random}`;

  return formId;
};

/**
 *
 * @param {*} academicYear
 * @param {*} programmeType
 * @param {*} sponsorship
 * @param {*} applicant
 * @returns
 */
const generateStandardregistrationNumbers = (
  academicYear,
  programmeType,
  sponsorship,
  applicant
) => {
  try {
    const data = {};

    data.reg_no_prefix = `${trim(academicYear).split('/')[0].slice(-2)}/${
      applicant.nationality.includes('UGANDA') ? `U/` : `X/`
    }`;

    if (sponsorship.includes('PRIVATE')) {
      if (programmeType.includes('DAY')) {
        data.reg_no_postfix = `/PS`;
      } else if (programmeType.includes('EVENING')) {
        data.reg_no_postfix = `/EVE`;
      } else if (programmeType.includes('AFTERNOON')) {
        data.reg_no_postfix = `/PSA`;
      } else if (programmeType.includes('WEEKEND')) {
        data.reg_no_postfix = `/PSW`;
      }
    } else {
      data.reg_no_postfix = ``;
    }

    return data;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} academicYear
 * @param {*} programmeType
 * @param {*} sponsorship
 * @param {*} applicant
 * @returns
 */
const generateCustomGuluRegistrationNumbers = (
  academicYear,
  programmeType,
  sponsorship,
  applicant
) => {
  try {
    const data = {};

    data.reg_no_prefix = `${trim(academicYear).split('/')[0].slice(-2)}/${
      applicant.nationality.includes('UGANDA') ? `U/` : `X/`
    }`;

    if (sponsorship.includes('PRIVATE')) {
      data.reg_no_postfix = `/${applicant.programme.programme_code}/PS`;
    } else {
      data.reg_no_postfix = `/${applicant.programme.programme_code}`;
    }

    return data;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} academicYear
 * @param {*} programmeType
 * @param {*} degreeCategory
 * @param {*} sponsorship
 * @param {*} applicant
 * @returns
 */
const generateCustomMakerereRegistrationNumbers = (
  academicYear,
  programmeType,
  degreeCategory,
  sponsorship,
  applicant
) => {
  try {
    const data = {};

    if (degreeCategory.includes('UNDERGRADUATE')) {
      if (applicant.nationality.includes('UGANDA')) {
        data.reg_no_prefix = `${trim(academicYear).split('/')[0].slice(-2)}/U/`;
      } else if (applicant.nationality.includes('KENYA')) {
        data.reg_no_prefix = `${trim(academicYear).split('/')[0].slice(-2)}/K/`;
      } else if (applicant.nationality.includes('TANZANIA')) {
        data.reg_no_prefix = `${trim(academicYear).split('/')[0].slice(-2)}/T/`;
      } else {
        data.reg_no_prefix = `${trim(academicYear).split('/')[0].slice(-2)}/X/`;
      }

      if (sponsorship.includes('PRIVATE')) {
        if (programmeType.includes('DAY')) {
          data.reg_no_postfix = `/PS`;
        } else if (programmeType.includes('EVENING')) {
          data.reg_no_postfix = `/EVE`;
        } else if (programmeType.includes('AFTERNOON')) {
          data.reg_no_postfix = `/PSA`;
        } else if (programmeType.includes('WEEKEND')) {
          data.reg_no_postfix = `/PSW`;
        } else if (programmeType.includes('EXTERNAL')) {
          data.reg_no_postfix = `/EXT`;
        } else if (programmeType.includes('EXECUTIVE')) {
          data.reg_no_postfix = `/EXE`;
        }
      } else {
        data.reg_no_postfix = ``;
      }
    } else if (degreeCategory.includes('POSTGRADUATE')) {
      let specialCode = 'XXXX';

      if (
        trim(
          applicant.programme.department.faculty.college.college_code
        ).includes('CAES')
      ) {
        specialCode = 'HD02';
      } else if (
        trim(
          applicant.programme.department.faculty.college.college_code
        ).includes('CHUSS')
      ) {
        specialCode = 'HD03';
      } else if (
        trim(
          applicant.programme.department.faculty.college.college_code
        ).includes('CEES')
      ) {
        specialCode = 'HD04';
      } else if (
        trim(
          applicant.programme.department.faculty.college.college_code
        ).includes('COCIS')
      ) {
        specialCode = 'HD05';
      } else if (
        trim(
          applicant.programme.department.faculty.college.college_code
        ).includes('COBAMS')
      ) {
        specialCode = 'HD06';
      } else if (
        trim(
          applicant.programme.department.faculty.college.college_code
        ).includes('CHS')
      ) {
        specialCode = 'HD07';
      } else if (
        trim(
          applicant.programme.department.faculty.college.college_code
        ).includes('CEDAT')
      ) {
        specialCode = 'HD08';
      } else if (
        trim(
          applicant.programme.department.faculty.college.college_code
        ).includes('LAW')
      ) {
        specialCode = 'HD09';
      } else if (
        trim(
          applicant.programme.department.faculty.college.college_code
        ).includes('MUBS')
      ) {
        specialCode = 'HD10';
      } else if (
        trim(
          applicant.programme.department.faculty.college.college_code
        ).includes('CONAS')
      ) {
        specialCode = 'HD13';
      } else if (
        trim(
          applicant.programme.department.faculty.college.college_code
        ).includes('COVAB')
      ) {
        specialCode = 'HD17';
      }

      data.reg_no_prefix = `${trim(academicYear)
        .split('/')[0]
        .slice(-4)}/${specialCode}/`;

      if (applicant.nationality.includes('UGANDA')) {
        data.reg_no_postfix = `U`;
      } else if (applicant.nationality.includes('KENYA')) {
        data.reg_no_postfix = `K`;
      } else if (applicant.nationality.includes('TANZANIA')) {
        data.reg_no_postfix = `T`;
      } else {
        data.reg_no_postfix = `X`;
      }
    }

    return data;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} academicYear
 * @param {*} programmeType
 * @param {*} sponsorship
 * @param {*} applicant
 * @returns
 */
const generateCustomKyambogoRegistrationNumbers = async (
  academicYear,
  programmeType,
  sponsorship,
  applicant
) => {
  try {
    const data = {};

    const findProgrammeAlias =
      await programmeAliasService.findOneProgrammeAlias({
        where: {
          programme_id: applicant.programme_id,
          campus_id: applicant.campus_id,
          programme_type_id: applicant.programme_type_id,
        },
        raw: true,
      });

    data.reg_no_prefix = `${trim(academicYear).split('/')[0].slice(-2)}/${
      applicant.nationality.includes('UGANDA') ? `U/` : `X/`
    }${
      findProgrammeAlias
        ? toUpper(trim(findProgrammeAlias.alias_code))
        : toUpper(trim(applicant.programme.programme_code))
    }/`;

    if (sponsorship.includes('PRIVATE')) {
      if (programmeType.includes('DAY')) {
        data.reg_no_postfix = `/PD`;
      } else if (programmeType.includes('EVENING')) {
        data.reg_no_postfix = `/PE`;
      } else if (programmeType.includes('AFTERNOON')) {
        data.reg_no_postfix = `/PA`;
      } else if (programmeType.includes('WEEKEND')) {
        data.reg_no_postfix = `/PW`;
      }
    } else {
      data.reg_no_postfix = `/GV`;
    }

    return data;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} academicYear
 * @returns
 */
const generateStandardStudentNumbers = (academicYear) => {
  try {
    return `${trim(academicYear).split('/')[0].slice(-2)}`;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  generateAdmissionFormId,
  generateStandardregistrationNumbers,
  generateCustomGuluRegistrationNumbers,
  generateCustomMakerereRegistrationNumbers,
  generateStandardStudentNumbers,
  generateCustomKyambogoRegistrationNumbers,
};
