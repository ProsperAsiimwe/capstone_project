const {
  filter,
  isEmpty,
  round,
  sumBy,
  map,
  flattenDeep,
  uniq,
  toUpper,
  find,
  forEach,
  isArray,
  orderBy,
} = require('lodash');
const { produce } = require('immer');

/**
 * Compute Students' CGPA
 *
 * @param {*} data
 */
const generateGradesHandler = function (semesters) {
  const finalResults = [];

  const semesterResults = reOrderResultSemester(semesters);

  forEach(semesterResults, (semester, index) => {
    const semesterUpdated = produce(semester, (draft) => {
      const { results } = draft;

      const unAuditedCourses = filter(
        results,
        (e) =>
          !toUpper(e.course_unit_category).includes('AUDITED') &&
          !e.is_audited_course &&
          !e.is_audited_result
      );

      const totalCreditUnit = sumBy(
        unAuditedCourses,
        (res) => res.version_credit_units || res.credit_unit
      );
      const totalWeightingScore = sumBy(unAuditedCourses, 'weighting_score');

      let semesterGPA = 0;

      if (totalWeightingScore && totalCreditUnit) {
        semesterGPA = parseFloat(
          round(totalWeightingScore / totalCreditUnit, 2)
        ).toFixed(2);
      }

      let CTCU = totalCreditUnit;

      let CTWS = totalWeightingScore;

      const previousCGPAs = map(finalResults, 'cgpa');
      const currentRetakes = map(
        filter(
          results,
          (rst) => rst.has_passed === false && rst.remark !== 'CP'
        ),
        'course_unit_code'
      );

      const prevRetakes = flattenDeep(map(finalResults, 'retake_courses'));

      const semesterRetakes = uniq(currentRetakes.concat(prevRetakes));
      const semesterRemarks = !isEmpty(semesterRetakes) ? 'PP' : 'NP';

      draft.retake_courses = semesterRetakes;
      draft.remark = semesterRemarks;
      draft.current_tcu = totalCreditUnit;
      draft.current_tws = totalWeightingScore;
      draft.current_gpa = semesterGPA;

      draft.previous_ctcu = null;
      draft.previous_ctws = null;
      draft.previous_cgpa = null;

      draft.cumulative_tcu = CTCU;
      draft.cumulative_tws = CTWS;
      draft.previous_cgpas = previousCGPAs;

      if (index !== 0) {
        const previousSemester = finalResults[index - 1];

        CTCU = CTCU + previousSemester.cumulative_tcu;
        CTWS = CTWS + previousSemester.cumulative_tws;

        draft.cumulative_tcu = CTCU;
        draft.cumulative_tws = CTWS;
        draft.previous_ctcu = previousSemester.cumulative_tcu;
        draft.previous_ctws = previousSemester.cumulative_tws;
        draft.previous_cgpa = previousSemester.cgpa;
      }

      const CGPA = parseFloat(round(CTWS / CTCU, 2)).toFixed(2);

      draft.cgpa = CGPA;
    });

    finalResults.push(semesterUpdated);
  });

  return finalResults;
};

const gradeSemesterResults = (semesters, grading) => {
  return map(semesters, (semester) => {
    const { results } = semester;

    const semesterResults = map(results, (result) => {
      if (result.grading_id) {
        const findGrading = find(
          grading,
          (g) => parseInt(g.id, 10) === parseInt(result.grading_id, 10)
        );

        if (findGrading) {
          const findValue = find(
            findGrading.values,
            (val) =>
              parseFloat(result.final_mark) <= parseFloat(val.max_value) &&
              parseFloat(result.final_mark) >= parseFloat(val.min_value)
          );

          if (findValue) {
            return produce(result, (resultDraft) => {
              resultDraft.grading_value_id = findValue.id;
              resultDraft.grading_point = parseFloat(
                findValue.grading_point
              ).toFixed(1);
              resultDraft.grading_letter = findValue.grading_letter;
              result.interpretation = findValue.interpretation;
              resultDraft.credit_unit =
                result.version_credit_units || result.credit_unit;
              resultDraft.weighting_score =
                findValue.grading_point *
                (result.version_credit_units || result.credit_unit);
              resultDraft.has_passed =
                resultDraft.final_mark >= resultDraft.pass_mark;
            });
          }
        }
      }

      return result;
    });

    return { ...semester, results: semesterResults };
  });
};

const reOrderResultSemester = (semesterResults) => {
  let results = semesterResults;

  if (isArray(semesterResults)) {
    const semesterOrders = map(semesterResults, (result, index) => {
      let semesterOrder = index;

      if (
        toUpper(result.semester).includes('SEMESTER III') ||
        toUpper(result.semester).includes('RECESS')
      )
        semesterOrder = 3;
      else if (toUpper(result.semester).includes('SEMESTER II'))
        semesterOrder = 2;
      else if (toUpper(result.semester).includes('SEMESTER I'))
        semesterOrder = 1;
      else ++semesterOrder;

      return {
        ...result,
        semester_order: semesterOrder,
      };
    });

    results = orderBy(semesterOrders, [
      'programme_study_year',
      'semester_order',
    ]);
  }

  return results;
};

module.exports = {
  generateGradesHandler,
  gradeSemesterResults,
  reOrderResultSemester,
};
