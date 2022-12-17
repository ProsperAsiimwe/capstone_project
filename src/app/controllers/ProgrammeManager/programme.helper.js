const { isEmpty, toUpper } = require('lodash');
const model = require('@models');
const { programmeService } = require('@services/index');

const insertNewProgramme = function (req, metadataValues) {
  const data = req.body;
  const user = req.user.id;
  const studyTypes = [];
  const programmeDuration = parseInt(data.programme_duration, 10);
  const programmeDurationMeasure = data.duration_measure_id;

  data.created_by_id = user;

  if (programmeDuration && programmeDurationMeasure && metadataValues) {
    const studyYears = [];

    Array(programmeDuration)
      .fill()
      .forEach((duration, index) => {
        const findDurationMeasure = metadataValues.find(
          (metadataValue) =>
            parseInt(metadataValue.id, 10) ===
            parseInt(programmeDurationMeasure, 10)
        );

        if (findDurationMeasure) {
          const studyYear = `${findDurationMeasure.metadata_value} ${
            index + 1
          }`;

          const checkValue = metadataValues.find(
            (metadataValue) =>
              toUpper(metadataValue.metadata_value).includes(studyYear) &&
              toUpper(metadataValue.metadata.metadata_name).includes(
                toUpper('STUDY YEARS')
              )
          );

          if (checkValue) {
            studyYears.push({
              programme_study_years: studyYear,
              created_by_id: user,
              programme_study_year_id: checkValue.id,
            });
          }
        }
      });
    data.programmeStudyYears = studyYears;
  }

  if (data.programme_study_types) {
    data.programme_study_types.forEach((studyType) => {
      studyTypes.push({
        programme_type_id: studyType,
        created_by_id: user,
      });
    });
  }

  const programmeEntryYears = [];

  if (data.programme_entry_years) {
    data.programme_entry_years.forEach((entryYear) => {
      programmeEntryYears.push({
        entry_year_id: entryYear,
        created_by_id: user,
      });
    });
  }

  const programmeDepartments = [];

  if (data.other_departments) {
    data.other_departments.forEach((dept) => {
      programmeDepartments.push({
        department_id: dept,
        created_by_id: user,
      });
    });
  }

  const programmeVersionEntryYears = [];

  if (data.version_entry_years) {
    data.version_entry_years.forEach((entryYear) => {
      programmeVersionEntryYears.push({
        ...entryYear,
        created_by_id: user,
      });
    });
  }

  const campuses = [];

  if (data.programme_campuses) {
    data.programme_campuses.forEach((campus) => {
      campuses.push({
        campus_id: campus,
        created_by_id: user,
      });
    });
  }

  const modules = [];

  if (data.is_modular === true) {
    if (isEmpty(data.programme_version_modules)) {
      throw new Error('Please provide the modules for this programme.');
    }

    if (
      data.has_specializations === true ||
      data.has_subject_combination_categories === true ||
      // data.has_version_plans === true ||
      data.specialization_semester_id ||
      data.specialization_year_id ||
      data.subject_combination_semester_id ||
      data.subject_combination_year_id ||
      !isEmpty(data.programme_specializations) ||
      !isEmpty(data.subject_combination_categories)
      // !isEmpty(data.programme_version_plans)
    ) {
      throw new Error(
        'Specializations and Subject Combinations Not Applicable For Modular Programmes.'
      );
    }

    data.programme_version_modules.forEach((versionModule) => {
      const moduleHasOptions = versionModule.has_module_options;
      const options = [];

      if (
        moduleHasOptions === true &&
        isEmpty(versionModule.programme_version_module_options)
      ) {
        throw new Error('Please provide the version module options .');
      }

      if (!isEmpty(versionModule.programme_version_module_options)) {
        versionModule.programme_version_module_options.forEach((option) => {
          options.push({
            option_id: option,
            created_by_id: user,
          });
        });
      }

      modules.push({
        ...versionModule,
        moduleOptions: options,
        has_module_options: moduleHasOptions,
        created_by_id: user,
      });
    });
  }

  const specializations = [];

  if (data.has_specializations === true) {
    if (isEmpty(data.programme_specializations)) {
      throw new Error('Please provide the specializations.');
    }

    if (!data.specialization_year_id) {
      throw new Error(
        'Please specify the study year in which students must select a specialization.'
      );
    }
    if (!data.specialization_semester_id) {
      throw new Error(
        'Please specify the semester in which students must select a specialization.'
      );
    }

    data.programme_specializations.forEach((specialization) => {
      specializations.push({
        specialization_id: specialization,
        created_by_id: user,
      });
    });
  } else {
    if (!isEmpty(data.programme_specializations)) {
      throw new Error('Please indicate has specializations ? as true.');
    }
  }

  const subjectCombinationCategories = [];

  if (data.has_subject_combination_categories === true) {
    if (isEmpty(data.subject_combination_categories)) {
      throw new Error('Please provide the subject combination categories.');
    }

    if (!data.subject_combination_year_id) {
      throw new Error(
        'Please specify the study year in which students must select a subject combination.'
      );
    }
    if (!data.subject_combination_semester_id) {
      throw new Error(
        'Please specify the semester in which students must select a subject combination.'
      );
    }

    data.subject_combination_categories.forEach(
      (subjectCombinationCategory) => {
        subjectCombinationCategories.push({
          subject_combination_category_id: subjectCombinationCategory,
          created_by_id: user,
        });
      }
    );
  } else {
    if (!isEmpty(data.subject_combination_categories)) {
      throw new Error(
        'Please indicate has subject combination categories ? as true.'
      );
    }
  }

  const versionPlans = [];

  if (data.has_version_plans === true) {
    if (isEmpty(data.programme_version_plans)) {
      throw new Error('Please provide the plans.');
    }

    data.programme_version_plans.forEach((plan, index) => {
      versionPlans.push({
        ...plan,
        created_by_id: user,
      });
    });
  } else {
    if (isEmpty(data.version_entry_years)) {
      throw new Error(
        'Please Provide Version Entry Years With Graduation Loads.'
      );
    }
  }

  data.versions = [
    {
      version_title: toUpper(data.version),
      has_plan: !isEmpty(data.programme_version_plans),
      is_default: true,
      is_current_version: true,
      created_by_id: user,
      specialization_year_id: data.specialization_year_id
        ? data.specialization_year_id
        : null,
      specialization_semester_id: data.specialization_semester_id
        ? data.specialization_semester_id
        : null,
      subject_combination_year_id: data.subject_combination_year_id
        ? data.subject_combination_year_id
        : null,
      subject_combination_semester_id: data.subject_combination_semester_id
        ? data.subject_combination_semester_id
        : null,
      versionSpecializations: specializations,
      versionEntryYears: programmeVersionEntryYears,
      versionSubjCombCat: subjectCombinationCategories,
      versionModules: modules,
      has_specializations: data.has_specializations,
      has_subject_combination_categories:
        data.has_subject_combination_categories,
      versionPlans,
    },
  ];

  const modeOfDeliveries = [];

  if (data.mode_of_delivery) {
    data.mode_of_delivery.forEach((mode) => {
      modeOfDeliveries.push({
        mode_of_delivery_id: mode,
        created_by_id: user,
      });
    });
  }

  data.programmeStudyTypes = studyTypes;
  data.programModesOfDelivery = modeOfDeliveries;
  data.programmeCampuses = campuses;
  data.programmeEntryYears = programmeEntryYears;
  data.otherDepartments = programmeDepartments;

  try {
    const programme = model.sequelize.transaction((transaction) => {
      const result = programmeService.createProgramme(data, transaction);

      return result;
    });

    return programme;
  } catch (error) {
    return error;
  }
};

module.exports = {
  insertNewProgramme,
};
