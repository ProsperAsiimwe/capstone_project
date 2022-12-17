/**
 *
 * @param {*} data
 */
const generateAllArrayCombinations = function (data) {
  let payload = {};
  const newArray = [];

  for (const eachCampus of data.campuses) {
    const campus = eachCampus.campus_id;

    payload = {
      academic_year_id: data.academic_year_id,
      registration_type_id: data.registration_type_id,
      is_combined: data.is_combined,
      tuition_fee_percentage: data.tuition_fee_percentage,
      functional_fee_percentage: data.functional_fee_percentage,
      combined_fee_percentage: data.combined_fee_percentage,
      created_by_id: data.created_by_id,
      campus_id: campus,
    };

    for (const eachIntake of data.intakes) {
      const intake = eachIntake.intake_id;

      payload = {
        academic_year_id: data.academic_year_id,
        registration_type_id: data.registration_type_id,
        is_combined: data.is_combined,
        tuition_fee_percentage: data.tuition_fee_percentage,
        functional_fee_percentage: data.functional_fee_percentage,
        combined_fee_percentage: data.combined_fee_percentage,
        created_by_id: data.created_by_id,
        campus_id: campus,
        intake_id: intake,
      };

      for (const eachSemester of data.semesters) {
        const semester = eachSemester.semester_id;

        payload = {
          academic_year_id: data.academic_year_id,
          registration_type_id: data.registration_type_id,
          is_combined: data.is_combined,
          tuition_fee_percentage: data.tuition_fee_percentage,
          functional_fee_percentage: data.functional_fee_percentage,
          combined_fee_percentage: data.combined_fee_percentage,
          created_by_id: data.created_by_id,
          campus_id: campus,
          intake_id: intake,
          semester_id: semester,
        };

        for (const eachYear of data.entryAcadYrs) {
          const entryAcademicYear = eachYear.entry_academic_year_id;

          payload = {
            academic_year_id: data.academic_year_id,
            registration_type_id: data.registration_type_id,
            is_combined: data.is_combined,
            tuition_fee_percentage: data.tuition_fee_percentage,
            functional_fee_percentage: data.functional_fee_percentage,
            combined_fee_percentage: data.combined_fee_percentage,
            created_by_id: data.created_by_id,
            campus_id: campus,
            intake_id: intake,
            semester_id: semester,
            entry_academic_year_id: entryAcademicYear,
          };

          for (const eachEnrollmentStatus of data.enrollmentStatuses) {
            const enrollmentStatus = eachEnrollmentStatus.enrollment_status_id;

            payload = {
              academic_year_id: data.academic_year_id,
              registration_type_id: data.registration_type_id,
              is_combined: data.is_combined,
              tuition_fee_percentage: data.tuition_fee_percentage,
              functional_fee_percentage: data.functional_fee_percentage,
              combined_fee_percentage: data.combined_fee_percentage,
              created_by_id: data.created_by_id,
              campus_id: campus,
              intake_id: intake,
              semester_id: semester,
              entry_academic_year_id: entryAcademicYear,
              enrollment_status_id: enrollmentStatus,
            };

            newArray.push(payload);
          }
          // was here
        }
      }
    }
  }

  return newArray;
};

module.exports = {
  generateAllArrayCombinations,
};
