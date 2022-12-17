/* eslint-disable camelcase */

const collegeReportGrouping = async (enrollmentData) => {
  const results = await enrollmentData;

  const merged = results.reduce(
    (
      groupedData,
      {
        event_id,
        enrollment_event,
        academic_year_id,
        academic_year,
        campus_id,
        campus,
        intake_id,
        intake,
        semester_id,
        semester,
        college_id,
        college_code,
        college_title,
        ...rest
      }
    ) => {
      const key = `${college_id}-${college_code}`;

      groupedData[key] = groupedData[key] || {
        event_id,
        enrollment_event,
        academic_year_id,
        academic_year,
        campus_id,
        campus,
        intake_id,
        intake,
        semester_id,
        semester,
        college_id,
        college_code,
        college_title,
        programmes: [],
      };

      if (rest.programme_id) {
        groupedData[key].programmes.push(rest);
      }

      return groupedData;
    },
    {}
  );

  const dataProgramme = Object.values(merged);

  const data = dataProgramme;

  return data;
};

// college

// faculty

const facultyReportGrouping = async (enrollmentData) => {
  const results = await enrollmentData;

  const merged = results.reduce(
    (
      groupedData,
      {
        event_id,
        enrollment_event,
        academic_year_id,
        academic_year,
        campus_id,
        campus,
        intake_id,
        intake,
        semester_id,
        semester,
        faculty_id,
        faculty_code,
        faculty_title,
        ...rest
      }
    ) => {
      const key = `${faculty_id}-${faculty_code}`;

      groupedData[key] = groupedData[key] || {
        event_id,
        enrollment_event,
        academic_year_id,
        academic_year,
        campus_id,
        campus,
        intake_id,
        intake,
        semester_id,
        semester,
        faculty_id,
        faculty_code,
        faculty_title,
        programmes: [],
      };

      if (rest.programme_id) {
        groupedData[key].programmes.push(rest);
      }

      return groupedData;
    },
    {}
  );

  const dataProgramme = Object.values(merged);

  const data = dataProgramme;

  return data;
};

// departments

const departmentReportGrouping = async (enrollmentData) => {
  const results = await enrollmentData;

  const merged = results.reduce(
    (
      groupedData,
      {
        event_id,
        enrollment_event,
        academic_year_id,
        academic_year,
        campus_id,
        campus,
        intake_id,
        intake,
        semester_id,
        semester,
        faculty_id,
        faculty_code,
        faculty_title,
        department_id,
        department_code,
        department_title,
        ...rest
      }
    ) => {
      const key = `${faculty_id}-${faculty_code}`;

      groupedData[key] = groupedData[key] || {
        event_id,
        enrollment_event,
        academic_year_id,
        academic_year,
        campus_id,
        campus,
        intake_id,
        intake,
        semester_id,
        semester,
        faculty_id,
        faculty_code,
        faculty_title,
        department_id,
        department_code,
        department_title,
        programmes: [],
      };

      if (rest.programme_id) {
        groupedData[key].programmes.push(rest);
      }

      return groupedData;
    },
    {}
  );

  const dataProgramme = Object.values(merged);

  const data = dataProgramme;

  return data;
};

// payment report

const facultyPaymentReport = async (paymentData) => {
  const results = await paymentData;

  const merged = results.reduce(
    (
      groupedData,
      {
        academic_year_id,
        academic_year,
        campus_id,
        campus,
        intake_id,
        intake,
        semester_id,
        semester,
        faculty_id,
        faculty_code,
        faculty_title,
        ...rest
      }
    ) => {
      const key = `${faculty_id}-${faculty_code}`;

      groupedData[key] = groupedData[key] || {
        academic_year_id,
        academic_year,
        campus_id,
        campus,
        intake_id,
        intake,
        semester_id,
        semester,
        faculty_id,
        faculty_code,
        faculty_title,
        programmes: [],
      };

      if (rest.programme_id) {
        groupedData[key].programmes.push(rest);
      }

      return groupedData;
    },
    {}
  );

  const dataProgramme = Object.values(merged);

  const data = dataProgramme;

  return data;
};

// college

const collegePaymentReport = async (paymentData) => {
  const results = await paymentData;

  const merged = results.reduce(
    (
      groupedData,
      {
        academic_year_id,
        academic_year,
        campus_id,
        campus,
        intake_id,
        intake,
        semester_id,
        semester,
        college_id,
        college_code,
        college_title,
        ...rest
      }
    ) => {
      const key = `${college_id}-${college_code}`;

      groupedData[key] = groupedData[key] || {
        academic_year_id,
        academic_year,
        campus_id,
        campus,
        intake_id,
        intake,
        semester_id,
        semester,
        college_id,
        college_code,
        college_title,
        programmes: [],
      };

      if (rest.programme_id) {
        groupedData[key].programmes.push(rest);
      }

      return groupedData;
    },
    {}
  );

  const dataProgramme = Object.values(merged);

  const data = dataProgramme;

  return data;
};

// department

const departmentPaymentReport = async (paymentData) => {
  const results = await paymentData;

  const merged = results.reduce(
    (
      groupedData,
      {
        academic_year_id,
        academic_year,
        campus_id,
        campus,
        intake_id,
        intake,
        semester_id,
        semester,
        department_id,
        department_code,
        department_title,
        ...rest
      }
    ) => {
      const key = `${department_id}-${department_code}`;

      groupedData[key] = groupedData[key] || {
        academic_year_id,
        academic_year,
        campus_id,
        campus,
        intake_id,
        intake,
        semester_id,
        semester,
        department_id,
        department_code,
        department_title,
        programmes: [],
      };

      if (rest.programme_id) {
        groupedData[key].programmes.push(rest);
      }

      return groupedData;
    },
    {}
  );

  const dataProgramme = Object.values(merged);

  const data = dataProgramme;

  return data;
};

module.exports = {
  facultyReportGrouping,
  departmentReportGrouping,
  collegeReportGrouping,
  facultyPaymentReport,
  collegePaymentReport,
  departmentPaymentReport,
};
