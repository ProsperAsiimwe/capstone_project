/**
 *
 * @param {*} data
 * @returns
 */
const handleGeneratingQualification = function (data) {
  if (
    data.does_not_have_qualification === false ||
    !data.does_not_have_qualification
  ) {
    if (
      !data.institution_name &&
      !data.award_obtained &&
      !data.award_start_date &&
      !data.award_end_date &&
      !data.awarding_body &&
      !data.award_type &&
      !data.award_duration &&
      !data.award_classification
    ) {
      throw new Error(
        `Please provide required fields of Institution Name, Award Obtained, Start Date, End date, Awarding Body, Award type, Duration and Classification.`
      );
    }
  } else {
    data.institution_name = 'N/A';
    data.award_obtained = 'N/A';
    data.awarding_body = 'N/A';
    data.award_type = 'N/A';
    data.award_duration = 'N/A';
    data.award_classification = 'N/A';
    data.award_start_date = null;
    data.award_end_date = null;
  }

  return data;
};

module.exports = {
  handleGeneratingQualification,
};
