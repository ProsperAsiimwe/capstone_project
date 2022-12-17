const { toUpper, trim, sumBy, isEmpty } = require('lodash');

const applicantsCompletedByGender = (result) => {
  const response = {};

  const femaleCompleted = result.filter(
    (applicant) =>
      toUpper(trim(applicant.gender)) === 'FEMALE' &&
      applicant.application_status.includes('COMPLETED')
  );

  const maleCompleted = result.filter(
    (applicant) =>
      toUpper(trim(applicant.gender)) === 'MALE' &&
      applicant.application_status.includes('COMPLETED')
  );

  response.FEMALE = sumBy(femaleCompleted, (item) =>
    Number(item.number_of_applicants)
  );
  response.MALE = sumBy(maleCompleted, (item) =>
    Number(item.number_of_applicants)
  );

  return response;
};
// not paid
const completedPaidByGender = (result) => {
  const response = {};

  const femaleCompleted = result.filter(
    (applicant) =>
      toUpper(trim(applicant.gender)) === 'FEMALE' &&
      applicant.application_status.includes('COMPLETED') &&
      toUpper(trim(applicant.payment_status)) === 'T'
  );

  const maleCompleted = result.filter(
    (applicant) =>
      toUpper(trim(applicant.gender)) === 'MALE' &&
      applicant.application_status.includes('COMPLETED') &&
      toUpper(trim(applicant.payment_status)) === 'T'
  );

  response.FEMALE = sumBy(femaleCompleted, (item) =>
    Number(item.number_of_applicants)
  );
  response.MALE = sumBy(maleCompleted, (item) =>
    Number(item.number_of_applicants)
  );

  return response;
};

//
const completedPaidByNationality = (result) => {
  const response = {};

  const eastAfricansMinusUganda = [
    'KENYA',
    'TANZANIA',
    'RWANDA',
    'SOUTH SUDAN',
    'BURUNDI',
  ];

  const eastAfricansWithUganda = [
    'UGANDA',
    'KENYA',
    'TANZANIA',
    'RWANDA',
    'SOUTH SUDAN',
    'BURUNDI',
  ];

  const ugandansCompleted = result.filter(
    (applicant) =>
      applicant.nationality !== null &&
      applicant.nationality.includes('UGANDA') &&
      applicant.application_status.includes('COMPLETED') &&
      toUpper(trim(applicant.payment_status)) === 'T'
  );

  const eastAfricansCompleted = result.filter(
    (applicant) =>
      eastAfricansMinusUganda.find(
        (nationality) =>
          applicant.nationality !== null &&
          applicant.nationality.includes(nationality)
      ) &&
      applicant.application_status.includes('COMPLETED') &&
      toUpper(trim(applicant.payment_status)) === 'T'
  );

  const internationalsCompleted = [];

  result.forEach((applicant) => {
    const internationals = eastAfricansWithUganda.filter(
      (eastAfrican) =>
        applicant.nationality !== null &&
        applicant.nationality.includes(eastAfrican)
    );

    if (isEmpty(internationals)) {
      if (
        applicant.application_status.includes('COMPLETED') &&
        toUpper(trim(applicant.payment_status)) === 'T'
      ) {
        internationalsCompleted.push(applicant);
      }
    }
  });
  response.UGANDANS = sumBy(ugandansCompleted, (item) =>
    Number(item.number_of_applicants)
  );
  response.EAST_AFRICANS = sumBy(eastAfricansCompleted, (item) =>
    Number(item.number_of_applicants)
  );
  response.INTERNATIONALS = sumBy(internationalsCompleted, (item) =>
    Number(item.number_of_applicants)
  );

  return response;
};
// paid

const applicantsCompletedByNationality = (result) => {
  const response = {};

  const eastAfricansMinusUganda = [
    'KENYA',
    'TANZANIA',
    'RWANDA',
    'SOUTH SUDAN',
    'BURUNDI',
  ];

  const eastAfricansWithUganda = [
    'UGANDA',
    'KENYA',
    'TANZANIA',
    'RWANDA',
    'SOUTH SUDAN',
    'BURUNDI',
  ];

  const ugandansCompleted = result.filter(
    (applicant) =>
      applicant.nationality !== null &&
      applicant.nationality.includes('UGANDA') &&
      applicant.application_status.includes('COMPLETED')
  );

  const eastAfricansCompleted = result.filter(
    (applicant) =>
      eastAfricansMinusUganda.find(
        (nationality) =>
          applicant.nationality !== null &&
          applicant.nationality.includes(nationality)
      ) && applicant.application_status.includes('COMPLETED')
  );

  const internationalsCompleted = [];

  result.forEach((applicant) => {
    const internationals = eastAfricansWithUganda.filter(
      (eastAfrican) =>
        applicant.nationality !== null &&
        applicant.nationality.includes(eastAfrican)
    );

    if (isEmpty(internationals)) {
      if (applicant.application_status.includes('COMPLETED')) {
        internationalsCompleted.push(applicant);
      }
    }
  });
  response.UGANDANS = sumBy(ugandansCompleted, (item) =>
    Number(item.number_of_applicants)
  );
  response.EAST_AFRICANS = sumBy(eastAfricansCompleted, (item) =>
    Number(item.number_of_applicants)
  );
  response.INTERNATIONALS = sumBy(internationalsCompleted, (item) =>
    Number(item.number_of_applicants)
  );

  return response;
};

//
const applicationStatusData = (result) => {
  const response = {};

  const applicationCompleted = result.filter((applicant) =>
    applicant.application_status.includes('COMPLETED')
  );

  const applicationInProgress = result.filter(
    (applicant) =>
      applicant.application_status.includes('IN-PROGRESS') ||
      applicant.application_status.includes('PROGRESS')
  );

  response.COMPLETED = sumBy(applicationCompleted, (item) =>
    Number(item.number_of_applicants)
  );
  response.INPROGRESS = sumBy(applicationInProgress, (item) =>
    Number(item.number_of_applicants)
  );

  return response;
};

module.exports = {
  applicantsCompletedByGender,
  applicantsCompletedByNationality,
  applicationStatusData,
  completedPaidByGender,
  completedPaidByNationality,
};
