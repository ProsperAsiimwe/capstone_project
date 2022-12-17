const { appConfig } = require('@root/config');
const {
  graduationListService,
  programmeService,
  metadataValueService,
} = require('@services/index');
const { map, includes, flatten, isEmpty } = require('lodash');

/**
 *
 * @param {*} context
 * @returns
 */
const generateDraftList = async function (context) {
  //  maxProgrammeStudyYear
  const finalStudyYear = await graduationListService.maxProgrammeStudyYear(
    context
  );

  const contextData = {
    ...context,
    finalYearMetadata: finalStudyYear.programme_study_year_id,
    finalYearContext: finalStudyYear.context_id,
  };

  const result = await graduationListService.graduationDraftList(contextData);

  const list = await studentByEntryYear(result, contextData);

  return list;
};

// pushTOProvisional

const pushToProvisional = async function (context) {
  //  maxProgrammeStudyYear
  const finalStudyYear = await graduationListService.maxProgrammeStudyYear(
    context
  );

  const contextData = {
    ...context,
    finalYearMetadata: finalStudyYear.programme_study_year_id,
    finalYearContext: finalStudyYear.context_id,
  };

  const result = await graduationListService.fetchToProvisional(contextData);

  const list = await studentCoreGrouping(result, contextData);

  return list;
};

/**
 *
 * @param {*} context
 * @returns
 */
const generateFinalList = async function (context) {
  const result = await graduationListService.graduationList(context);

  return result;
};

/**
 *
 * @param {*} studentObj
 * @param {*} academicYearObj
 * @returns
 */
const studentByEntryYear = (studentObj, academicYearObj) => {
  const normalProgress = studentObj.filter((element) => {
    return academicYearObj.entry_academic_year === element.entry_academic_year;
  });

  const mopUpCases = studentObj.filter((element) => {
    return academicYearObj.entry_academic_year !== element.entry_academic_year;
  });

  const result = { normalProgress, mopUpCases };

  return { ...result };
};

// core grouping
const studentCoreGrouping = (studentObj) => {
  const meetCoreCourses = studentObj.filter((element) => {
    return Number(element.result_cores) >= Number(element.version_cores);
  });

  const doNotMeetCoreCourses = studentObj.filter((element) => {
    return Number(element.result_cores) < Number(element.version_cores);
  });

  const result = { meetCoreCourses, doNotMeetCoreCourses };

  return { ...result };
};

/**
 * ALLOW ALL COLLEGES AND SELECTED USERS TO UPDATE
 *
 * @param {*} programmeId
 */
const blockCollegesExcept = async (programmeId, userEmail, academicYearId) => {
  if (appConfig.TAX_HEAD_CODE === 'FMUK01') {
    const academicYear = await metadataValueService.findOneMetadataValue({
      where: {
        id: academicYearId,
      },
      attributes: ['metadata_value'],
      plain: true,
    });

    if (isEmpty(academicYear)) throw new Error('Invalid Academic Year');

    const allowedUsers = [
      'mike.barongo@mak.ac.ug',
      'denis.mbabazi@mak.ac.ug',
      'ruth.iteu@mak.ac.ug',
      'josephine.namubiru@mak.ac.ug',
      'support@terp.ac.ug',
    ];

    if (!academicYearId && !includes(allowedUsers, userEmail)) {
      throw new Error(
        'Sorry... We are unable to process Provisional Graduation list for your College.'
      );
    } else {
      if (
        academicYear.metadata_value === '2021/2022' &&
        !includes(allowedUsers, userEmail)
      ) {
        throw new Error(
          'Oops... your account is not permitted to process graduation in 2021/2022 Academic Year.'
        );
      } else if (
        academicYear.metadata_value === '2021/2022' &&
        includes(allowedUsers, userEmail)
      ) {
        const allowedColleges = ['CHUSS', 'CEES'];
        const colleges =
          await programmeService.admissionProgrammesByCollegeCode(
            `'${allowedColleges.join("','")}'`
          );

        let programmeIds = [];

        if (colleges) {
          const programmes = flatten(map(colleges, 'programmes'));

          programmeIds = map(programmes, 'id');
        }

        if (!includes(programmeIds, parseInt(programmeId, 10))) {
          throw new Error(
            `Sorry... You can only process Provisional Graduation list for Colleges: ${allowedColleges.join(
              ', '
            )} in 2021/2022 Academic Year.`
          );
        }
      } else if (academicYear.metadata_value !== '2022/2023')
        throw new Error(
          `Oops... We are not able to process graduation lists for ${academicYear.metadata_value} Academic Year.`
        );
    }
  }

  return true;
};

module.exports = {
  generateDraftList,
  generateFinalList,
  pushToProvisional,
  blockCollegesExcept,
};
