const { reportsService } = require('@services/index');
const { orderBy, toUpper, isEmpty, map, countBy } = require('lodash');

/**
 *
 * @param {*} context
 * @returns
 */
const fetchSenateReport = async function (context) {
  const programmeStudyLevelId = await reportsService.programmeStudyLevel(
    context
  );

  const resultCategoryPolicy = await reportsService.resultCategoryPolicy(
    programmeStudyLevelId
  );

  if (isEmpty(resultCategoryPolicy)) {
    throw new Error(
      `Unable To Find A Result Category Policy For This Programme's Study Level.`
    );
  }

  const filtered = await reportsService.resultCategoryReport(context);

  const orderByYearAndSemester = orderBy(filtered, [
    'programme_study_year',
    'semester',
  ]);

  const newData = studentResultLists(
    orderByYearAndSemester,
    resultCategoryPolicy
  );

  // total number of students
  const numberStudents = map(newData.result, 'student_programme_id').length;

  const arrayOfGender = map(newData.result, 'gender');

  const genderData = countBy(
    arrayOfGender.map((gender) => {
      if (toUpper(gender).includes('F')) return 'Female';
      else return 'Male';
    })
  );

  const resultCategoryData = countBy(map(newData.result, 'resultListCategory'));

  const semesterCommentData = countBy(map(newData.result, 'semester_comment'));

  const generalCommentData = countBy(map(newData.result, 'comment'));

  const semesterCommentPercent = [];

  Object.entries(semesterCommentData).forEach((entry) => {
    const [key, value] = entry;

    const percent = ((value * 100) / numberStudents).toFixed(2);

    const myData = {
      semesterComment: key,
      studentPercentage: parseFloat(percent),
    };

    semesterCommentPercent.push({
      ...myData,
    });
  });

  const generalCommentPercent = [];

  Object.entries(generalCommentData).forEach((entry) => {
    const [key, value] = entry;

    const percent = ((value * 100) / numberStudents).toFixed(2);

    const myData = {
      generalComment: key,
      studentPercentage: parseFloat(percent),
    };

    generalCommentPercent.push({
      ...myData,
    });
  });

  const resultCategoryPercent = [];

  Object.entries(resultCategoryData).forEach((entry) => {
    const [key, value] = entry;

    const percent = ((value * 100) / numberStudents).toFixed(2);

    const myData = {
      resultCategory: key,
      studentPercentage: parseFloat(percent),
    };

    resultCategoryPercent.push({
      ...myData,
    });
  });

  // const obj = Object.keys(semesterCommentData, numberStudents).forEach(
  //   function (key) {
  //     const cal = (
  //       (semesterCommentData[key] * 100) /
  //       numberStudents
  //     ).toFixed(2);

  //     const myobj = { ...semesterCommentData, cal };

  //     return { ...semesterCommentData, cal };
  //   }
  // );

  const data = {
    numberOfStudents: numberStudents,
    studentsByGender: genderData,
    studentsByCategory: resultCategoryData,
    resultCategoryPercent,
    semesterComment: semesterCommentData,
    semesterCommentPercent,
    generalComment: generalCommentData,
    generalCommentPercent,
  };

  return data;
};

/**
 *
 * @param {*} resultObj
 * @param {*} categoryObj
 * @returns
 */
const studentResultLists = (resultObj, categoryObj) => {
  const result = resultObj.map((element) => {
    const studentClass = categoryObj.find(
      (row) => element.cgpa >= row.range_from && element.cgpa <= row.range_to
    );

    let resultListCategory = null;

    if (element.comment === 'PP') {
      resultListCategory = 'TO RETAKE COURSE(S)';
    } else {
      resultListCategory =
        (studentClass && studentClass.name) || 'NORMAL PROGRESS';
    }

    return {
      ...element,
      resultListCategory,
    };
  });

  return { result };
};

module.exports = { fetchSenateReport };
