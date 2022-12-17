const { sumBy, isEmpty, orderBy } = require('lodash');

const generateReport = (data) => {
  try {
    const registrationData = data;

    let enrolledStudents = 0;

    let fullRegistered = 0;

    let provisionallyRegistered = 0;

    let maleEnrolled = 0;

    let femaleEnrolled = 0;

    let academicUnit = [];

    let summaryAcademicUnit = [];

    let entryAcademicYear = [];

    let summaryAcademicYear = [];

    if (isEmpty(registrationData)) {
      enrolledStudents = 0;

      fullRegistered = 0;

      maleEnrolled = 0;

      femaleEnrolled = 0;
    } else {
      academicUnit = [
        ...registrationData
          .reduce((r, o) => {
            const key = o.academic_unit_code + '-' + o.programme_code;

            const item =
              r.get(key) ||
              Object.assign({}, o, {
                enrolled_students: 0,
                male_enrolled: 0,
                female_enrolled: 0,
                male_fully_registered: 0,
                female_fully_registered: 0,
                full_registered: 0,
                provisionally_registered: 0,
              });

            item.enrolled_students += Number(o.enrolled_students);
            item.male_enrolled += Number(o.male_enrolled);
            item.female_enrolled += Number(o.female_enrolled);
            item.male_fully_registered += Number(o.male_fully_registered);
            item.female_fully_registered += Number(o.female_fully_registered);
            item.full_registered += Number(o.full_registered);
            item.provisionally_registered += Number(o.provisionally_registered);

            return r.set(key, item);
          }, new Map())
          .values(),
      ];

      summaryAcademicUnit = [
        ...registrationData
          .reduce((r, o) => {
            const key = o.academic_unit_code;

            const item =
              r.get(key) ||
              Object.assign({}, o, {
                enrolled_students: 0,
                male_enrolled: 0,
                female_enrolled: 0,
                male_fully_registered: 0,
                female_fully_registered: 0,
                full_registered: 0,
                provisionally_registered: 0,
              });

            item.enrolled_students += Number(o.enrolled_students);
            item.male_enrolled += Number(o.male_enrolled);
            item.female_enrolled += Number(o.female_enrolled);
            item.male_fully_registered += Number(o.male_fully_registered);
            item.female_fully_registered += Number(o.female_fully_registered);
            item.full_registered += Number(o.full_registered);
            item.provisionally_registered += Number(o.provisionally_registered);

            return r.set(key, item);
          }, new Map())
          .values(),
      ];

      // entryAcademicYear

      entryAcademicYear = [
        ...registrationData
          .reduce((r, o) => {
            const key = o.academic_unit_code + '-' + o.entry_academic_year;

            const item =
              r.get(key) ||
              Object.assign({}, o, {
                enrolled_students: 0,
                male_enrolled: 0,
                female_enrolled: 0,
                male_fully_registered: 0,
                female_fully_registered: 0,
                full_registered: 0,
                provisionally_registered: 0,
              });

            item.enrolled_students += Number(o.enrolled_students);
            item.male_enrolled += Number(o.male_enrolled);
            item.female_enrolled += Number(o.female_enrolled);
            item.male_fully_registered += Number(o.male_fully_registered);
            item.female_fully_registered += Number(o.female_fully_registered);
            item.full_registered += Number(o.full_registered);
            item.provisionally_registered += Number(o.provisionally_registered);

            return r.set(key, item);
          }, new Map())
          .values(),
      ];

      // entry academic year summary

      summaryAcademicYear = [
        ...registrationData
          .reduce((r, o) => {
            const key = o.entry_academic_year;

            const item =
              r.get(key) ||
              Object.assign({}, o, {
                enrolled_students: 0,
                male_enrolled: 0,
                female_enrolled: 0,
                male_fully_registered: 0,
                female_fully_registered: 0,
                full_registered: 0,
                provisionally_registered: 0,
              });

            item.enrolled_students += Number(o.enrolled_students);
            item.male_enrolled += Number(o.male_enrolled);
            item.female_enrolled += Number(o.female_enrolled);
            item.male_fully_registered += Number(o.male_fully_registered);
            item.female_fully_registered += Number(o.female_fully_registered);
            item.full_registered += Number(o.full_registered);
            item.provisionally_registered += Number(o.provisionally_registered);

            return r.set(key, item);
          }, new Map())
          .values(),
      ];
    }

    enrolledStudents = sumBy(registrationData, (item) =>
      Number(item.enrolled_students)
    );
    fullRegistered = sumBy(registrationData, (item) =>
      Number(item.full_registered)
    );
    maleEnrolled = sumBy(registrationData, (item) =>
      Number(item.male_enrolled)
    );
    femaleEnrolled = sumBy(registrationData, (item) =>
      Number(item.female_enrolled)
    );
    provisionallyRegistered = sumBy(registrationData, (item) =>
      Number(item.provisionally_registered)
    );

    const academicUnitProgramme = academicUnit.map((e) => ({
      academic_unit_code: e.academic_unit_code,
      academic_unit_title: e.academic_unit_title,
      programme_code: e.programme_code,
      programme_title: e.programme_title,
      enrolled_students: e.enrolled_students,
      male_enrolled: e.male_enrolled,
      female_enrolled: e.female_enrolled,
      male_fully_registered: e.male_fully_registered,
      female_fully_registered: e.female_fully_registered,
      full_registered: e.full_registered,
      provisionally_registered: e.provisionally_registered,
    }));

    const summaryEntryAcademicYear = summaryAcademicYear.map((e) => ({
      entry_academic_year: e.entry_academic_year,
      enrolled_students: e.enrolled_students,
      male_enrolled: e.male_enrolled,
      female_enrolled: e.female_enrolled,
      male_fully_registered: e.male_fully_registered,
      female_fully_registered: e.female_fully_registered,
      full_registered: e.full_registered,
      provisionally_registered: e.provisionally_registered,
    }));
    const academicUnitAcademicYear = entryAcademicYear.map((e) => ({
      academic_unit_code: e.academic_unit_code,
      academic_unit_title: e.academic_unit_title,
      entry_academic_year: e.entry_academic_year,
      enrolled_students: e.enrolled_students,
      male_enrolled: e.male_enrolled,
      female_enrolled: e.female_enrolled,
      male_fully_registered: e.male_fully_registered,
      female_fully_registered: e.female_fully_registered,
      full_registered: e.full_registered,
      provisionally_registered: e.provisionally_registered,
    }));

    const statisticsAcademicUnit = summaryAcademicUnit.map((e) => ({
      academic_unit_code: e.academic_unit_code,
      academic_unit_title: e.academic_unit_title,
      enrolled_students: e.enrolled_students,
      male_enrolled: e.male_enrolled,
      female_enrolled: e.female_enrolled,
      male_fully_registered: e.male_fully_registered,
      female_fully_registered: e.female_fully_registered,
      full_registered: e.full_registered,
      provisionally_registered: e.provisionally_registered,
    }));

    return {
      enrolledStudents,
      fullRegistered,
      maleEnrolled,
      femaleEnrolled,
      provisionallyRegistered,
      summaryEntryAcademicYear,
      statisticsAcademicUnit,
      academicUnitAcademicYear: orderBy(
        academicUnitAcademicYear,
        ['academic_unit_title', 'entry_academic_year'],
        ['asc', 'desc']
      ),

      academicUnitProgramme,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  generateReport,
};
