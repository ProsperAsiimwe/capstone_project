const { sumBy } = require('lodash');
const {
  applicantsCompletedByGender,
  applicantsCompletedByNationality,
  applicationStatusData,
  completedPaidByGender,
  completedPaidByNationality,
} = require('@controllers/Helpers/admissionReportsHelper');

/**
 *
 * @param {*} context
 * @returns
 */
const admissionReportsFunctions = (result) => {
  let data = {};

  if (result[0].number_of_applicants === '0') {
    data = {
      genderApplicantData: {},
      totalApplicants: 0,
      paymentStatus: {},
      applicationStatus: {},
      nationalityData: {},
      applicantPaidByGender: {},
      applicantPaidByNationality: {},
      totalPaidSubmittedApplications: 0,
      totalSubmittedApplications: 0,
      unpaidApplications: 0,
      number_of_programmes: result[0].number_of_programmes,
    };
  } else {
    const genderApplicantData = applicantsCompletedByGender(result);

    const nationalityData = applicantsCompletedByNationality(result);
    const applicantPaidByGender = completedPaidByGender(result);

    const applicantPaidByNationality = completedPaidByNationality(result);

    const totalApplicants = sumBy(result, (item) =>
      Number(item.number_of_applicants)
    );

    const applicationStatus = applicationStatusData(result);

    const totalPaidSubmittedApplications =
      applicantPaidByGender.FEMALE + applicantPaidByGender.MALE;

    const totalSubmittedApplications =
      genderApplicantData.FEMALE + genderApplicantData.MALE;

    const unpaidApplications =
      totalSubmittedApplications - totalPaidSubmittedApplications;

    data = {
      totalApplicants,
      applicationStatus,
      nationalityData,
      genderApplicantData,
      applicantPaidByGender,
      applicantPaidByNationality,
      totalPaidSubmittedApplications,
      totalSubmittedApplications,
      unpaidApplications,
      number_of_programmes: result[0].number_of_programmes,
      result,
    };
  }

  return data;
};

module.exports = { admissionReportsFunctions };
