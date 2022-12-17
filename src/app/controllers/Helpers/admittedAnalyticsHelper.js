const {
  admissionSchemeReportsService,
  institutionStructureService,
} = require('@services/index');
const { isEmpty, sumBy, chain, map, toUpper } = require('lodash');

const admissionAnalyticsSummary = async function (payload) {
  if (
    !payload.academic_year_id ||
    !payload.intake_id ||
    !payload.admission_scheme_id ||
    !payload.degree_category_id
  ) {
    throw new Error('Invalid Context Provided');
  }

  const context = payload;

  const result = await admissionSchemeReportsService.admissionAnalyticsReport(
    context
  );

  const analytics = await calculateData(result);

  const report = chain(result)
    .groupBy('campus')
    .map((value, key) => ({
      campus: key,
      data: map(value, (r) => {
        return {
          gender: r.gender,
          sponsorship: r.sponsorship,
          programme_type: r.programme_type,
          residence_status: r.residence_status,
          billing_category: r.billing_category,
          students: r.students,
        };
      }),
    }))
    .value();

  const data = { analytics, report };

  return data;
};

// admissionAnalyticsAcademicUnits

const analyticsAcademicUnits = async function (payload) {
  if (
    !payload.academic_year_id ||
    !payload.intake_id ||
    !payload.admission_scheme_id ||
    !payload.degree_category_id
  ) {
    throw new Error('Invalid Context Provided');
  }

  const institutionStructure =
    await institutionStructureService.findInstitutionStructureRecords();

  const institutionStructureUpper = institutionStructure.academic_units.map(
    (e) => toUpper(e)
  );

  let result = [];

  if (
    institutionStructure &&
    institutionStructureUpper
      .map((element) => element.includes('COL'))
      .includes(true)
  ) {
    result = await admissionSchemeReportsService.admissionAnalyticsColleges(
      payload
    );
  } else if (
    institutionStructure &&
    (institutionStructureUpper
      .map((element) => element.includes('FAC'))
      .includes(true) ||
      institutionStructureUpper
        .map((element) => element.includes('SCH'))
        .includes(true))
  ) {
    result = await admissionSchemeReportsService.admissionAnalyticsFaculties(
      payload
    );
  } else {
    result = await admissionSchemeReportsService.admissionAnalyticsFaculties(
      payload
    );
  }

  const academicUnit = academicUnitCalculateData(result);

  const report = await campusGrouping(result);

  const data = { academicUnit, report };

  return data;
};

// academicYearCollegeReport, academicYearCollegeReport

const analyticsAcademicYear = async function (payload) {
  if (
    !payload.academic_year_id ||
    !payload.intake_id ||
    !payload.campus_id ||
    !payload.degree_category_id
  ) {
    throw new Error('Invalid Context Provided');
  }

  const institutionStructure =
    await institutionStructureService.findInstitutionStructureRecords();

  const institutionStructureUpper = institutionStructure.academic_units.map(
    (e) => toUpper(e)
  );

  let result = [];

  const campus = payload.campus_id;

  if (
    campus === 'all' &&
    institutionStructure &&
    institutionStructureUpper
      .map((element) => element.includes('COL'))
      .includes(true)
  ) {
    result = await admissionSchemeReportsService.academicYearCollegeReport(
      payload
    );
  } else if (
    campus !== 'all' &&
    institutionStructure &&
    institutionStructureUpper
      .map((element) => element.includes('COL'))
      .includes(true)
  ) {
    result = await admissionSchemeReportsService.academicYearCollegeCampus(
      payload
    );
  } else if (
    campus === 'all' &&
    institutionStructure &&
    (institutionStructureUpper
      .map((element) => element.includes('FAC'))
      .includes(true) ||
      institutionStructureUpper
        .map((element) => element.includes('SCH'))
        .includes(true))
  ) {
    result = await admissionSchemeReportsService.academicYearFacultyReport(
      payload
    );
  } else if (
    campus !== 'all' &&
    institutionStructure &&
    (institutionStructureUpper
      .map((element) => element.includes('FAC'))
      .includes(true) ||
      institutionStructureUpper
        .map((element) => element.includes('SCH'))
        .includes(true))
  ) {
    result = await admissionSchemeReportsService.academicYearFacultyCampus(
      payload
    );
  } else {
    result = await admissionSchemeReportsService.academicYearFacultyReport(
      payload
    );
  }

  const academicYear = academicYearCalculate(result);

  // const report = await campusGrouping(result);

  const data = { academicYear, result };

  return data;
};

// compute

const calculateData = function (data) {
  try {
    const admitted = data;

    let total = '';

    let campus = [];

    let sponsorship = [];

    let programmeType = [];

    let residenceStatus = [];

    let gender = [];

    let billingCategory = [];

    let male = '';

    let female = '';

    if (isEmpty(admitted)) {
      total = 0;
      male = 0;
      female = 0;
    } else {
      campus = [
        ...admitted
          .reduce((r, o) => {
            const key = o.campus;

            const item =
              r.get(key) ||
              Object.assign({}, o, {
                students: 0,
              });

            item.students += Number(o.students);

            return r.set(key, item);
          }, new Map())
          .values(),
      ];

      sponsorship = [
        ...admitted
          .reduce((r, o) => {
            const key = o.sponsorship;

            const item =
              r.get(key) ||
              Object.assign({}, o, {
                students: 0,
              });

            item.students += Number(o.students);

            return r.set(key, item);
          }, new Map())
          .values(),
      ];

      programmeType = [
        ...admitted
          .reduce((r, o) => {
            const key = o.programme_type;

            const item =
              r.get(key) ||
              Object.assign({}, o, {
                students: 0,
              });

            item.students += Number(o.students);

            return r.set(key, item);
          }, new Map())
          .values(),
      ];
      residenceStatus = [
        ...admitted
          .reduce((r, o) => {
            const key = o.residence_status;

            const item =
              r.get(key) ||
              Object.assign({}, o, {
                students: 0,
              });

            item.students += Number(o.students);

            return r.set(key, item);
          }, new Map())
          .values(),
      ];
      billingCategory = [
        ...admitted
          .reduce((r, o) => {
            const key = o.billing_category;

            const item =
              r.get(key) ||
              Object.assign({}, o, {
                students: 0,
              });

            item.students += Number(o.students);

            return r.set(key, item);
          }, new Map())
          .values(),
      ];
      gender = [
        ...admitted
          .reduce((r, o) => {
            const key = o.gender;

            const item =
              r.get(key) ||
              Object.assign({}, o, {
                students: 0,
              });

            item.students += Number(o.students);

            return r.set(key, item);
          }, new Map())
          .values(),
      ];

      total = sumBy(admitted, (item) => Number(item.students));

      male = gender.filter((element) => element.gender === 'MALE')[0].students;

      female = gender.filter((element) => element.gender === 'FEMALE')[0]
        .students;
    }

    return {
      total,
      female,
      male,
      campus: map(campus, (r) => {
        return {
          students: r.students,
          campus: r.campus,
        };
      }),
      sponsorship: map(sponsorship, (r) => {
        return {
          students: r.students,
          sponsorship: r.sponsorship,
        };
      }),
      programmeType: map(programmeType, (r) => {
        return {
          students: r.students,
          programme_type: r.programme_type,
        };
      }),
      residenceStatus: map(residenceStatus, (r) => {
        return {
          students: r.students,
          residence_status: r.residence_status,
        };
      }),
      billingCategory: map(billingCategory, (r) => {
        return {
          students: r.students,
          billing_category: r.billing_category,
        };
      }),
      gender: map(gender, (r) => {
        return {
          students: r.students,
          gender: r.gender,
        };
      }),
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

// academic unit report

const academicUnitCalculateData = function (data) {
  try {
    const admitted = data;

    let total = '';

    let academicUnitCode = [];

    if (isEmpty(admitted)) {
      total = 0;
    } else {
      academicUnitCode = [
        ...admitted
          .reduce((r, o) => {
            const key = o.academic_unit_code;

            const item =
              r.get(key) ||
              Object.assign({}, o, {
                students: 0,
                male: 0,
                female: 0,
              });

            item.students += Number(o.students);
            item.male += Number(o.male);
            item.female += Number(o.female);

            return r.set(key, item);
          }, new Map())
          .values(),
      ];

      total = sumBy(admitted, (item) => Number(item.students));
    }

    return {
      total,
      academicUnitCode: map(academicUnitCode, (r) => {
        return {
          academic_unit_code: r.academic_unit_code,
          students: r.students,
          male: r.male,
          female: r.female,
        };
      }),
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

const campusGrouping = function (payload) {
  const data = chain(payload)
    .groupBy('campus')
    .map((value, key) => ({
      campus: key,
      data: map(value, (r) => {
        return {
          academic_unit_code: r.academic_unit_code,
          academic_unit_title: r.academic_unit_title,
          programme_type: r.programme_type,
          sponsorship: r.sponsorship,
          male: r.male,
          female: r.female,
          students: r.students,
        };
      }),
    }))
    .value();

  return data;
};

// academicYearCalculate

const academicYearCalculate = function (data) {
  try {
    const admitted = data;

    let total = '';

    let female = '';

    let male = '';

    let academicUnitCode = [];

    let schemeName = [];

    let sponsorship = [];

    if (isEmpty(admitted)) {
      total = 0;
    } else {
      academicUnitCode = [
        ...admitted
          .reduce((r, o) => {
            const key = o.academic_unit_code;

            const item =
              r.get(key) ||
              Object.assign({}, o, {
                students: 0,
                male: 0,
                female: 0,
              });

            item.students += Number(o.students);
            item.male += Number(o.male);
            item.female += Number(o.female);

            return r.set(key, item);
          }, new Map())
          .values(),
      ];

      schemeName = [
        ...admitted
          .reduce((r, o) => {
            const key = o.scheme_name;

            const item =
              r.get(key) ||
              Object.assign({}, o, {
                students: 0,
                male: 0,
                female: 0,
              });

            item.students += Number(o.students);
            item.male += Number(o.male);
            item.female += Number(o.female);

            return r.set(key, item);
          }, new Map())
          .values(),
      ];

      sponsorship = [
        ...admitted
          .reduce((r, o) => {
            const key = o.sponsorship;

            const item =
              r.get(key) ||
              Object.assign({}, o, {
                students: 0,
                male: 0,
                female: 0,
              });

            item.students += Number(o.students);
            item.male += Number(o.male);
            item.female += Number(o.female);

            return r.set(key, item);
          }, new Map())
          .values(),
      ];
      total = sumBy(admitted, (item) => Number(item.students));
      male = sumBy(admitted, (item) => Number(item.male));
      female = sumBy(admitted, (item) => Number(item.female));
    }

    return {
      total,
      male,
      female,
      academicUnitCode: map(academicUnitCode, (r) => {
        return {
          academic_unit_code: r.academic_unit_code,
          students: r.students,
          male: r.male,
          female: r.female,
        };
      }),
      schemeName: map(schemeName, (r) => {
        return {
          scheme_name: r.scheme_name,
          students: r.students,
          male: r.male,
          female: r.female,
        };
      }),
      sponsorship: map(sponsorship, (r) => {
        return {
          sponsorship: r.sponsorship,
          students: r.students,
          male: r.male,
          female: r.female,
        };
      }),
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  admissionAnalyticsSummary,
  analyticsAcademicUnits,
  analyticsAcademicYear,
};
