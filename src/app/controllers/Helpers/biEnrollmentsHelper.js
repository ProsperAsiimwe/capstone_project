/* eslint-disable camelcase */
// enrollments
const { sumBy, isEmpty } = require('lodash');

const generateEnrollmentReport = (data) => {
  try {
    const registrationData = data;
    const enrollmentData = data;

    // console.log(enrollmentData.slice(0, 4));

    let enrolledStudents = 0;

    let fullRegistered = 0;

    let provisionallyRegistered = 0;

    let maleEnrolled = 0;

    let femaleEnrolled = 0;

    let studyYear = [];

    let sponsorship = [];

    if (isEmpty(registrationData)) {
      enrolledStudents = 0;

      fullRegistered = 0;

      maleEnrolled = 0;

      femaleEnrolled = 0;
    } else {
      studyYear = [
        ...registrationData
          .reduce((r, o) => {
            const key = o.study_year;

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
      ].map((e) => ({
        study_year: e.study_year,
        enrolled_students: e.enrolled_students,
        male_enrolled: e.male_enrolled,
        female_enrolled: e.female_enrolled,
        male_fully_registered: e.male_fully_registered,
        female_fully_registered: e.female_fully_registered,
        full_registered: e.full_registered,
        provisionally_registered: e.provisionally_registered,
      }));

      sponsorship = [
        ...registrationData
          .reduce((r, o) => {
            const key = o.sponsorship;

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
      ].map((e) => ({
        sponsorship: e.sponsorship,
        enrolled_students: e.enrolled_students,
        male_enrolled: e.male_enrolled,
        female_enrolled: e.female_enrolled,
        male_fully_registered: e.male_fully_registered,
        female_fully_registered: e.female_fully_registered,
        full_registered: e.full_registered,
        provisionally_registered: e.provisionally_registered,
      }));
    }

    enrolledStudents = sumBy(enrollmentData, (item) =>
      Number(item.enrolled_students)
    );
    fullRegistered = sumBy(enrollmentData, (item) =>
      Number(item.full_registered)
    );
    maleEnrolled = sumBy(enrollmentData, (item) => Number(item.male_enrolled));
    femaleEnrolled = sumBy(enrollmentData, (item) =>
      Number(item.female_enrolled)
    );
    provisionallyRegistered = sumBy(enrollmentData, (item) =>
      Number(item.provisionally_registered)
    );

    return {
      enrolledStudents,
      fullRegistered,
      maleEnrolled,
      femaleEnrolled,
      provisionallyRegistered,
      studyYear,
      sponsorship,
      data: groupByProgramme(enrollmentData),
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  generateEnrollmentReport,
};

const groupByProgramme = (data) => {
  try {
    const merged = data.reduce(
      (groupedData, { academic_unit_code, academic_unit_title, ...rest }) => {
        const key = `${academic_unit_code}-${academic_unit_title}`;

        groupedData[key] = groupedData[key] || {
          academic_unit_code,
          academic_unit_title,
          programmes: [],
        };

        if (rest.programme_code) {
          groupedData[key].programmes.push(rest);
        }

        return groupedData;
      },
      {}
    );

    return Object.values(merged);
  } catch (error) {}
};
