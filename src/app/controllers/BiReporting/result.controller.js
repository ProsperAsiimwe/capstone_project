// resultSummary
const { HttpResponse } = require('@helpers');
const { resultBiReportService } = require('@services/index');
const { chain } = require('lodash');

const http = new HttpResponse();

class ResultBiReportController {
  async resultSummary(req, res) {
    try {
      if (!req.query.academic_year_id) {
        throw new Error(`Invalid Request`);
      }
      const context = req.query.academic_year_id;

      const result = await resultBiReportService.resultSummary(context);

      const report = generateReport(result);

      http.setSuccess(200, 'Report fetched successfully', {
        data: { report },
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Report', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

const generateReport = function (data) {
  try {
    const result = data;

    const remark = [
      ...result
        .reduce((r, o) => {
          const key = o.remark + '-' + o.semester;

          const item =
            r.get(key) ||
            Object.assign({}, o, {
              student_count: 0,
            });

          item.student_count += Number(o.student_count);

          return r.set(key, item);
        }, new Map())
        .values(),
    ].map((e) => ({
      remark: e.remark,
      semester: e.semester,
      studentCount: e.student_count,
    }));

    const remarkGender = [
      ...result
        .reduce((r, o) => {
          const key = o.remark + '-' + o.semester + '-' + o.gender;

          const item =
            r.get(key) ||
            Object.assign({}, o, {
              student_count: 0,
            });

          item.student_count += Number(o.student_count);

          return r.set(key, item);
        }, new Map())
        .values(),
    ].map((e) => ({
      remark: e.remark,
      semester: e.semester,
      gender: e.gender,
      studentCount: e.student_count,
    }));

    const academicUnit = [
      ...result
        .reduce((r, o) => {
          const key = o.remark + '-' + o.semester + '-' + o.academic_unit_code;

          const item =
            r.get(key) ||
            Object.assign({}, o, {
              student_count: 0,
            });

          item.student_count += Number(o.student_count);

          return r.set(key, item);
        }, new Map())
        .values(),
    ].map((e) => ({
      remark: e.remark,
      academic_unit_code: e.academic_unit_code,
      semester: e.semester,
      studentCount: e.student_count,
    }));

    const gender = [
      ...result
        .reduce((r, o) => {
          const key =
            o.remark + '-' + o.gender + '-' + o.semester + '-' + o.study_level;

          const item =
            r.get(key) ||
            Object.assign({}, o, {
              student_count: 0,
            });

          item.student_count += Number(o.student_count);

          return r.set(key, item);
        }, new Map())
        .values(),
    ].map((e) => ({
      remark: e.remark,
      gender: e.gender,
      study_level: e.study_level,
      semester: e.semester,
      studentCount: e.student_count,
    }));

    const studyYear = [
      ...result
        .reduce((r, o) => {
          const key =
            o.remark + '-' + o.gender + '-' + o.semester + '-' + o.study_year;

          const item =
            r.get(key) ||
            Object.assign({}, o, {
              student_count: 0,
            });

          item.student_count += Number(o.student_count);

          return r.set(key, item);
        }, new Map())
        .values(),
    ].map((e) => ({
      remark: e.remark,
      gender: e.gender,
      study_year: e.study_year,
      semester: e.semester,
      studentCount: e.student_count,
    }));

    const remarkGenderGroup = chain(remarkGender).groupBy('semester');
    const academicUnitReport = chain(academicUnit).groupBy('semester');
    const genderStudyLevelReport = groupByStudyLevel(gender);
    const genderReport = chain(genderStudyLevelReport).groupBy('semester');
    const remarkReport = chain(remark).groupBy('semester');
    const studyYearGrp = groupByStudyYear(studyYear);
    const studyYeaReport = chain(studyYearGrp).groupBy('semester');

    return {
      summary: {
        remarkReport,
        studyYeaReport,
        genderReport,
        // academicUnit,
        academicUnitReport,
      },
      remarkGenderGroup,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = ResultBiReportController;

const groupByStudyYear = (data) => {
  try {
    const merged = data.reduce(
      // eslint-disable-next-line camelcase
      (groupedData, { semester, study_year, ...rest }) => {
        // eslint-disable-next-line camelcase
        const key = `${semester}-${study_year}`;

        groupedData[key] = groupedData[key] || {
          semester,
          study_year,
          result: [],
        };

        if (rest.gender) {
          groupedData[key].result.push(rest);
        }

        return groupedData;
      },
      {}
    );

    return Object.values(merged);
  } catch (error) {}
};
const groupByStudyLevel = (data) => {
  try {
    const merged = data.reduce(
      // eslint-disable-next-line camelcase
      (groupedData, { semester, study_level, ...rest }) => {
        // eslint-disable-next-line camelcase
        const key = `${semester}-${study_level}`;

        groupedData[key] = groupedData[key] || {
          semester,
          study_level,
          result: [],
        };

        if (rest.gender) {
          groupedData[key].result.push(rest);
        }

        return groupedData;
      },
      {}
    );

    return Object.values(merged);
  } catch (error) {}
};
