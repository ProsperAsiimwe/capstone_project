const { HttpResponse } = require('@helpers');
const { admissionBiReportService } = require('@services/index');

const { sumBy, orderBy } = require('lodash');

const http = new HttpResponse();

class AdmissionBiReportController {
  async admissionBiReport(req, res) {
    try {
      if (!req.query.academic_year_id) {
        throw new Error(`Invalid Request`);
      }
      const context = req.query.academic_year_id;

      const result = await admissionBiReportService.admissionReport(context);

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

  async admissionAgeReport(req, res) {
    try {
      if (!req.query.academic_year_id) {
        throw new Error(`Invalid Request`);
      }
      const context = req.query.academic_year_id;

      const resultData = await admissionBiReportService.admissionAgeReport(
        context
      );
      const result = await admissionBiReportService.admissionAgeGroupReport(
        context
      );

      const report = generateAgeReport(resultData);

      http.setSuccess(200, 'Report fetched successfully', {
        data: { result, report },
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Report', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  // admissionProgrammeReport
  async admissionProgrammeReport(req, res) {
    try {
      if (!req.query.academic_year_id) {
        throw new Error(`Invalid Request`);
      }
      const context = req.query.academic_year_id;

      const result = await admissionBiReportService.admissionProgrammeReport(
        context
      );

      const programmeTop10 = result.slice(0, 9);
      const programmeLeast5 = result
        .filter((x) => x.degree_category.includes('UNDERGRADUATE'))
        .slice(-5);

      const programmePostTop5 = result
        .filter((x) => x.degree_category.includes('POSTGRADUATE'))
        .slice(0, 5);

      const phd = result
        .filter((x) =>
          x.programme_study_level.includes('DOCTORATE', 'phd', 'PHD')
        )
        .map((e) => ({
          programme_code: e.programme_code,
          programme_title: e.programme_title,
          total_admitted: e.total_admitted,
          male: e.male,
          female: e.female,
          approved_students: e.approved_students,
          enrolled_students: e.enrolled_students,
        }))
        .slice(0, 10);

      const mastersTop5 = orderBy(
        result.filter((x) => x.programme_study_level.includes('MASTER'))
      )
        .slice(0, 5)
        .map((e) => ({
          programme_code: e.programme_code,
          programme_title: e.programme_title,
          total_admitted: e.total_admitted,
          male: e.male,
          female: e.female,
          approved_students: e.approved_students,
          enrolled_students: e.enrolled_students,
        }));

      const studyLevel = [
        ...result
          .reduce((r, o) => {
            const key = o.programme_study_level;

            const item =
              r.get(key) ||
              Object.assign({}, o, {
                total: 0,
                male: 0,
                female: 0,
                approvedStudents: 0,
                enrolled: 0,
              });

            item.total += Number(o.total_admitted);
            item.male += Number(o.male);
            item.female += Number(o.female);
            item.approvedStudents += Number(o.approved_students);
            item.enrolled += Number(o.enrolled_students);

            return r.set(key, item);
          }, new Map())
          .values(),
      ].map((e) => ({
        studyLevel: e.programme_study_level,
        totalAdmitted: e.total,
        male: e.male,
        female: e.female,
        approvedStudents: e.approvedStudents,
        enrolled: e.enrolled,
      }));

      http.setSuccess(200, 'Report fetched successfully', {
        data: {
          programmeTop10,
          programmePostTop5,
          programmeLeast5,
          studyLevel,
          mastersTop5,
          phd,
        },
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
    const admission = data;

    const total = sumBy(admission, (i) => Number(i.total_admitted));

    const totalMale = sumBy(admission, (i) => Number(i.male));

    const totalFemale = sumBy(admission, (i) => Number(i.female));

    const studentAccountsCreated = sumBy(admission, (i) =>
      Number(i.student_accounts_created)
    );
    const approvedStudents = sumBy(admission, (i) =>
      Number(i.approved_students)
    );
    const enrolledStudents = sumBy(admission, (i) =>
      Number(i.enrolled_students)
    );

    let degreeCategory = [];

    let academicUnit = [];

    const sponsorship = [
      ...admission
        .reduce((r, o) => {
          const key = o.sponsorship;

          const item =
            r.get(key) ||
            Object.assign({}, o, {
              total: 0,
              male: 0,
              female: 0,
              approvedStudents: 0,
              enrolled: 0,
            });

          item.total += Number(o.total_admitted);
          item.male += Number(o.male);
          item.female += Number(o.female);
          item.approvedStudents += Number(o.approved_students);
          item.enrolled += Number(o.enrolled_students);

          return r.set(key, item);
        }, new Map())
        .values(),
    ].map((e) => ({
      sponsorship: e.sponsorship,
      totalAdmitted: e.total,
      male: e.male,
      female: e.female,
      approvedStudents: e.approvedStudents,
      enrolled: e.enrolled,
    }));

    degreeCategory = [
      ...admission
        .reduce((r, o) => {
          const key = o.degree_category;

          const item =
            r.get(key) ||
            Object.assign({}, o, {
              total: 0,
              male: 0,
              female: 0,
              approvedStudents: 0,
              enrolled: 0,
            });

          item.total += Number(o.total_admitted);
          item.male += Number(o.male);
          item.female += Number(o.female);
          item.approvedStudents += Number(o.approved_students);
          item.enrolled += Number(o.enrolled_students);

          return r.set(key, item);
        }, new Map())
        .values(),
    ].map((e) => ({
      degreeCategory: e.degree_category,
      totalAdmitted: e.total,
      male: e.male,
      female: e.female,
      approvedStudents: e.approvedStudents,
      enrolled: e.enrolled,
    }));

    academicUnit = [
      ...admission
        .reduce((r, o) => {
          const key = o.academic_unit_code;

          const item =
            r.get(key) ||
            Object.assign({}, o, {
              total: 0,
              male: 0,
              female: 0,
              approvedStudents: 0,
              enrolled: 0,
            });

          item.total += Number(o.total_admitted);
          item.male += Number(o.male);
          item.female += Number(o.female);
          item.approvedStudents += Number(o.approved_students);
          item.enrolled += Number(o.enrolled_students);

          return r.set(key, item);
        }, new Map())
        .values(),
    ].map((e) => ({
      academicUnitCode: e.academic_unit_code,
      totalAdmitted: e.total,
      male: e.male,
      female: e.female,
      approvedStudents: e.approvedStudents,
      enrolled: e.enrolled,
    }));

    const schemeName = [
      ...admission
        .reduce((r, o) => {
          const key = o.scheme_name;

          const item =
            r.get(key) ||
            Object.assign({}, o, {
              total: 0,
              male: 0,
              female: 0,
              approvedStudents: 0,
              enrolled: 0,
            });

          item.total += Number(o.total_admitted);
          item.male += Number(o.male);
          item.female += Number(o.female);
          item.approvedStudents += Number(o.approved_students);
          item.enrolled += Number(o.enrolled_students);

          return r.set(key, item);
        }, new Map())
        .values(),
    ].map((e) => ({
      schemeName: e.scheme_name,
      totalAdmitted: e.total,
      male: e.male,
      female: e.female,
      approvedStudents: e.approvedStudents,
      enrolled: e.enrolled,
    }));

    const campus = [
      ...admission
        .reduce((r, o) => {
          const key = o.campus;

          const item =
            r.get(key) ||
            Object.assign({}, o, {
              total: 0,
              male: 0,
              female: 0,
              approvedStudents: 0,
              enrolled: 0,
            });

          item.total += Number(o.total_admitted);
          item.male += Number(o.male);
          item.female += Number(o.female);
          item.approvedStudents += Number(o.approved_students);
          item.enrolled += Number(o.enrolled_students);

          return r.set(key, item);
        }, new Map())
        .values(),
    ].map((e) => ({
      campus: e.campus,
      totalAdmitted: e.total,
      male: e.male,
      female: e.female,
      approvedStudents: e.approvedStudents,
      enrolled: e.enrolled,
    }));

    const reportByCampus = [
      ...admission
        .reduce((r, o) => {
          const key = o.academic_unit_code + '-' + o.campus;

          const item =
            r.get(key) ||
            Object.assign({}, o, {
              total: 0,
              male: 0,
              female: 0,
              approvedStudents: 0,
              enrolled: 0,
            });

          item.total += Number(o.total_admitted);
          item.male += Number(o.male);
          item.female += Number(o.female);
          item.approvedStudents += Number(o.approved_students);
          item.enrolled += Number(o.enrolled_students);

          return r.set(key, item);
        }, new Map())
        .values(),
    ].map((e) => ({
      campus: e.campus,
      academic_unit_code: e.academic_unit_code,
      totalAdmitted: e.total,
      male: e.male,
      female: e.female,
      approvedStudents: e.approvedStudents,
      enrolled: e.enrolled,
    }));

    return {
      summary: {
        total,
        totalMale,
        totalFemale,
        studentAccountsCreated,
        approvedStudents,
        enrolledStudents,
        degreeCategory,
        sponsorship,
      },
      academicUnit,
      schemeName,
      campus,
      reportByCampus,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

const generateAgeReport = function (data) {
  try {
    const admission = data;

    const ageSummary = [
      ...admission
        .reduce((r, o) => {
          const key = o.age;

          const item =
            r.get(key) ||
            Object.assign({}, o, {
              total: 0,
              male: 0,
              female: 0,
              approvedStudents: 0,
              enrolled: 0,
            });

          item.total += Number(o.total_admitted);
          item.male += Number(o.male);
          item.female += Number(o.female);
          item.approvedStudents += Number(o.approved_students);
          item.enrolled += Number(o.enrolled_students);

          return r.set(key, item);
        }, new Map())
        .values(),
    ].map((e) => ({
      age: e.age,
      totalAdmitted: e.total,
      male: e.male,
      female: e.female,
      approvedStudents: e.approvedStudents,
      enrolled: e.enrolled,
    }));

    return {
      summary: {
        ageSummary,
      },
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = AdmissionBiReportController;
