const { sumBy, map, flatten, uniq, sum } = require('lodash');

/**
 *
 * @param {*} context
 * @returns
 */
const senateAnalyticsFunction = function (senateData) {
  const data = senateData;

  const numberStudentsAssessed = sumBy(data, (item) =>
    Number(item.number_of_students)
  );

  // by gender

  const genderCount = map(data, 'students_by_gender');

  const uniqGender = uniq(
    flatten(
      map(data, 'students_by_gender').map((gender) => {
        return Object.keys(gender);
      })
    )
  );

  const genderValues = uniqGender.map((gender) => {
    const count = sum(map(genderCount, gender));

    return {
      gender,
      count,
    };
  });

  //  general_comment

  const generalCommentCount = map(data, 'general_comment');

  const uniqGeneralComment = uniq(
    flatten(
      map(data, 'general_comment').map((element) => {
        return Object.keys(element);
      })
    )
  );

  const generalCommentValues = uniqGeneralComment.map((element) => {
    const count = sum(map(generalCommentCount, element));

    return {
      element,
      count,
    };
  });

  // result_category

  const resultCategoryCount = map(data, 'result_category');

  const uniqResultCategory = uniq(
    flatten(
      map(data, 'result_category').map((element) => {
        return Object.keys(element);
      })
    )
  );

  const resultCategoryValues = uniqResultCategory.map((element) => {
    const count = sum(map(resultCategoryCount, element));

    return {
      element,
      count,
    };
  });

  const report = {
    numberStudentsAssessed,
    genderValues,
    generalCommentValues,
    resultCategoryValues,
    data,
  };

  return report;
};

module.exports = { senateAnalyticsFunction };
