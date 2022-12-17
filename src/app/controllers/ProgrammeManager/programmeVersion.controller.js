const { HttpResponse } = require('@helpers');
const {
  programmeVersionService,
  courseUnitService,
  programmeService,
} = require('@services/index');
const {
  isEmpty,
  toUpper,
  isArray,
  // map,
  // difference,
  //  find
} = require('lodash');
const model = require('@models');

const http = new HttpResponse();

class ProgrammeVersionController {
  /**
   * Programme Version Index api method.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async index(req, res) {
    const programmeVersions =
      await programmeVersionService.findAllProgrammeVersions();

    http.setSuccess(200, 'Programme Versions retrieved successfully', {
      programmeVersions,
    });

    return http.send(res);
  }

  /**
   * Store New Programme Version data.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async store(req, res) {
    try {
      const data = req.body;
      const user = req.user.id;

      const findProgramme = await programmeService.findOneProgramme({
        where: {
          id: data.programme_id,
        },
        raw: true,
      });

      const modules = [];
      const programmeVersionEntryYears = [];
      const specializations = [];
      const subjectCombinationCategories = [];
      const versionPlans = [];

      if (!isEmpty(data.version_entry_years)) {
        data.version_entry_years.forEach((entryYear) => {
          programmeVersionEntryYears.push({
            ...entryYear,
            created_by_id: user,
          });
        });
      }

      data.version_title = toUpper(data.version_title);

      if (findProgramme.is_modular === true) {
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

        data.versionModules = modules;
      } else {
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

        if (data.has_subject_combination_categories === true) {
          if (isEmpty(data.subject_combination_categories)) {
            throw new Error(
              'Please provide the subject combination categories.'
            );
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

        data.has_plan = false;

        if (data.has_version_plans === true) {
          data.has_plan = true;

          if (isEmpty(data.programme_version_plans)) {
            throw new Error(
              'Please provide the plans for this programme version.'
            );
          }

          data.programme_version_plans.forEach((plan) => {
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
          if (!isEmpty(data.programme_version_plans)) {
            throw new Error('Please indicate has version plans ? as true.');
          }
        }

        data.created_by_id = user;
        data.versionSpecializations = specializations;
        data.versionSubjCombCat = subjectCombinationCategories;
        data.versionPlans = versionPlans;
        data.versionEntryYears = programmeVersionEntryYears;
      }

      const programmeVersion = await model.sequelize.transaction(
        async (transaction) => {
          if (data.is_current_version === true) {
            await programmeVersionService.updateIsCurrentVersionForPreviousRecord(
              { where: { programme_id: data.programme_id } },
              {
                is_current_version: false,
              },
              transaction
            );
          }

          const result = await programmeVersionService.createProgrammeVersion(
            data,
            transaction
          );

          return result;
        }
      );

      http.setSuccess(201, 'Programme Version created successfully.', {
        programmeVersion,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to create this Programme Version.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Programme Version Index api method.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async show(req, res) {
    const { id } = req.params;

    try {
      const programmeVersion =
        await programmeVersionService.findOneProgrammeVersion({
          where: { id },
          ...getVersionAttributes(),
        });

      http.setSuccess(200, 'Programme Version retrieved successfully.', {
        programmeVersion,
      });
      if (isEmpty(programmeVersion))
        http.setError(404, 'Programme Version Not Found.');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to get Programme Version data', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Programme Version with Course Units api method.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async versionWithCourseUnits(req, res) {
    try {
      const { versionId } = req.params;

      const findVersion = await programmeVersionService.findOneProgrammeVersion(
        {
          where: { id: versionId },
          include: { association: 'programme', attributes: ['is_modular'] },
          raw: true,
        }
      );

      if (!findVersion) {
        throw new Error('The version provided does not Exist.');
      }

      let courseUnits = [];

      if (findVersion['programme.is_modular'] === true) {
        courseUnits =
          await programmeVersionService.findOneModularProgrammeCourseUnits(
            versionId
          );
      } else {
        courseUnits =
          await programmeVersionService.findOneProgrammeVersionCourseUnits(
            versionId
          );
      }

      const programmeVersion = {
        ...findVersion,
        courseUnits,
      };

      http.setSuccess(200, 'Programme Version retrieved successfully.', {
        programmeVersion,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to get Programme Version data', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * UPDATE Specific Programme Version Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      const user = req.user.id;

      const findVersion = await programmeVersionService
        .findOneProgrammeVersion({
          where: {
            id,
          },
          attributes: ['id', 'programme_id'],
          include: ['versionPlans'],
          plain: true,
        })
        .then((res) => (res ? res.toJSON() : null));

      if (!findVersion) {
        throw new Error('The version you are trying to update does not exist.');
      }

      const findProgramme = await programmeService.findOneProgramme({
        where: {
          id: findVersion.programme_id,
        },
        raw: true,
      });

      data.version_title = toUpper(data.version_title);

      const modules = [];
      const programmeVersionEntryYears = [];
      const specializations = [];
      const subjectCombinationCategories = [];
      const versionPlans = [];
      const exemptedRegistrations = [];

      await model.sequelize.transaction(async (transaction) => {
        if (!isEmpty(data.version_entry_years)) {
          data.version_entry_years.forEach((entryYear) => {
            programmeVersionEntryYears.push({
              programme_version_id: id,
              ...entryYear,
              created_by_id: user,
            });
          });
        }

        if (!isEmpty(data.exempted_registrations)) {
          data.exempted_registrations.forEach((exemption) => {
            exemptedRegistrations.push({
              programme_version_id: id,
              ...exemption,
              created_by_id: user,
            });
          });
        }

        if (findProgramme.is_modular === true) {
          if (!isEmpty(data.programme_version_modules)) {
            data.programme_version_modules.forEach((module) => {
              if (
                module.has_module_options === true &&
                isEmpty(module.programme_version_module_options)
              ) {
                throw new Error('Please provide the version module options .');
              } else if (
                module.has_module_options !== true &&
                !isEmpty(module.programme_version_module_options)
              ) {
                throw new Error(
                  'Please indicate has module options ? as true.'
                );
              }
              modules.push({
                programme_version_id: id,
                ...module,
                created_by_id: user,
              });
            });
          }
        } else {
          if (data.has_specializations === true) {
            if (isEmpty(data.programme_specializations)) {
              throw new Error(
                'Please provide the specializations for this programme version.'
              );
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
                programme_version_id: id,
                specialization_id: specialization,
                created_by_id: user,
              });
            });
          }

          if (data.has_subject_combination_categories === true) {
            if (isEmpty(data.subject_combination_categories)) {
              throw new Error(
                'Please provide the subject combination categories.'
              );
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
                  programme_version_id: id,
                  subject_combination_category_id: subjectCombinationCategory,
                  created_by_id: user,
                });
              }
            );
          } else if (data.has_subject_combination_categories === false) {
            data.subject_combination_semester_id = null;
            data.subject_combination_year_id = null;

            programmeVersionService.bulkRemoveProgrammeVersionSubjectCombinationCategoriesByVersion(
              id,
              transaction
            );
          }

          data.has_plan = false;

          if (data.has_version_plans === true) {
            data.has_plan = true;

            if (isEmpty(data.programme_version_plans)) {
              throw new Error(
                'Please provide the plans for this programme version.'
              );
            }

            data.programme_version_plans.forEach((plan) => {
              versionPlans.push({
                programme_version_id: id,
                ...plan,
                created_by_id: user,
              });
            });
          }
        }

        data.last_updated_by_id = user;

        if (
          data.is_current_version === true &&
          !isEmpty(findVersion.versionPlans)
        ) {
          await programmeVersionService.updateIsCurrentVersionForPreviousRecord(
            { id },
            {
              is_current_version: false,
            },
            transaction
          );
        }
        if (
          data.is_default_version === true &&
          !isEmpty(findVersion.versionPlans)
        ) {
          await programmeVersionService.updateIsCurrentVersionForPreviousRecord(
            { id },
            {
              is_default_version: false,
            },
            transaction
          );
        }

        const updateProgrammeVersion =
          await programmeVersionService.updateProgrammeVersion(
            id,
            data,
            transaction
          );
        const result = updateProgrammeVersion[1][0];

        await handleUpdatingPivots(
          id,
          specializations,
          versionPlans,
          subjectCombinationCategories,
          programmeVersionEntryYears,
          modules,
          exemptedRegistrations,
          transaction
        );

        http.setSuccess(200, 'Programme Version updated successfully.', {
          data: result,
        });

        return http.send(res);
      });
    } catch (error) {
      http.setError(400, 'Unable to update this Programme Version.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Destroy Programme Version Data
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async delete(req, res) {
    try {
      const { id } = req.params;

      await programmeVersionService.deleteProgrammeVersion(id);
      http.setSuccess(200, 'Programme Version deleted successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to delete this Programme Version.', { error });

      return http.send(res);
    }
  }

  /**
   * Destroy Course Data
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async deleteCourseUnit(req, res) {
    try {
      const { programmeVersionCourseUnitId } = req.params;

      await courseUnitService.deleteVersionCourseUnit(
        programmeVersionCourseUnitId
      );
      http.setSuccess(200, 'Course deleted successfully.');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to delete this Course.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

/**
 *
 * @param {*} eventId
 * @param {*} campuses
 * @param {*} intakes
 * @param {*} entryAcademicYears
 * @param {*} transaction
 */
const handleUpdatingPivots = async function (
  programmeVersionId,
  specializations,
  plans,
  subjectCombinationCategories,
  programmeVersionEntryYears,
  modules,
  exemptedRegistrations,
  transaction
) {
  try {
    if (!isEmpty(specializations)) {
      await deleteOrCreateElements(
        specializations,
        'findAllProgrammeVersionSpecializations',
        'bulkInsertProgrammeVersionSpecializations',
        'bulkRemoveProgrammeVersionSpecializations',
        'specialization_id',
        programmeVersionId,
        transaction
      );
    }

    if (!isEmpty(plans)) {
      await deleteOrCreateElements(
        plans,
        'findAllProgrammeVersionPlans',
        'bulkInsertProgrammeVersionPlans',
        'bulkRemoveProgrammeVersionPlans',
        'programme_version_plan_id',
        programmeVersionId,
        transaction
      );
    }

    if (!isEmpty(subjectCombinationCategories)) {
      await deleteOrCreateElements(
        subjectCombinationCategories,
        'findAllProgrammeVersionSubjectCombinationCategories',
        'bulkInsertProgrammeVersionSubjectCombinationCategories',
        'bulkRemoveProgrammeVersionSubjectCombinationCategories',
        'subject_combination_category_id',
        programmeVersionId,
        transaction
      );
    }

    if (isArray(programmeVersionEntryYears)) {
      for (const entryYear of programmeVersionEntryYears) {
        await programmeVersionService.updateOrCreateProgrammeVersionEntryYears(
          entryYear,
          {
            entry_year_id: entryYear.entry_year_id,
            programme_version_id: entryYear.programme_version_id,
          },
          transaction
        );
      }
    }

    if (!isEmpty(modules)) {
      await deleteOrCreateElements(
        modules,
        'findAllProgrammeVersionModules',
        'bulkInsertProgrammeVersionModules',
        'bulkRemoveProgrammeVersionModules',
        'module_id',
        programmeVersionId,
        transaction
      );
    }

    if (!isEmpty(exemptedRegistrations)) {
      await customDeleteOrCreateElements(
        exemptedRegistrations,
        'findAllVersionExemptedRegistrations',
        'bulkInsertVersionExemptedRegistrations',
        'bulkRemoveVersionExemptedRegistrations',
        'study_year_id',
        'semester_id',
        programmeVersionId,
        transaction
      );
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} firstElements
 * @param {*} findAllService
 * @param {*} insertService
 * @param {*} deleteService
 * @param {*} firstField
 * @param {*} programmeVersionId
 * @param {*} transaction
 * @returns
 */
const deleteOrCreateElements = async (
  firstElements,
  findAllService,
  insertService,
  deleteService,
  firstField,
  programmeVersionId,
  transaction
) => {
  try {
    const elementsToDelete = [];
    const elementsToInsert = [];

    const secondElements = await programmeVersionService[findAllService]({
      where: {
        programme_version_id: programmeVersionId,
      },
      attributes: ['id', 'programme_version_id', firstField],
      raw: true,
    });

    firstElements.forEach((firstElement) => {
      const myElement = secondElements.find(
        (secondElement) =>
          parseInt(firstElement[firstField], 10) ===
            parseInt(secondElement[firstField], 10) &&
          parseInt(firstElement.programme_version_id, 10) ===
            parseInt(secondElement.programme_version_id, 10)
      );

      if (!myElement) elementsToInsert.push(firstElement);
    });

    secondElements.forEach((secondElement) => {
      const myElement = firstElements.find(
        (firstElement) =>
          parseInt(firstElement[firstField], 10) ===
            parseInt(secondElement[firstField], 10) &&
          parseInt(firstElement.programme_version_id, 10) ===
            parseInt(secondElement.programme_version_id, 10)
      );

      if (!myElement) elementsToDelete.push(secondElement.id);
    });

    if (!isEmpty(elementsToInsert)) {
      await programmeVersionService[insertService](
        elementsToInsert,
        transaction
      );
    }

    if (!isEmpty(elementsToDelete)) {
      await programmeVersionService[deleteService](
        elementsToDelete,
        transaction
      );
    }

    return { elementsToDelete, elementsToInsert };
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} firstElements
 * @param {*} findAllService
 * @param {*} insertService
 * @param {*} deleteService
 * @param {*} firstField
 * @param {*} secondField
 * @param {*} programmeVersionId
 * @param {*} transaction
 * @returns
 */
const customDeleteOrCreateElements = async (
  firstElements,
  findAllService,
  insertService,
  deleteService,
  firstField,
  secondField,
  programmeVersionId,
  transaction
) => {
  try {
    const elementsToDelete = [];
    const elementsToInsert = [];

    const secondElements = await programmeVersionService[findAllService]({
      where: {
        programme_version_id: programmeVersionId,
      },
      attributes: ['id', 'programme_version_id', firstField, secondField],
      raw: true,
    });

    firstElements.forEach((firstElement) => {
      const myElement = secondElements.find(
        (secondElement) =>
          parseInt(firstElement[firstField], 10) ===
            parseInt(secondElement[firstField], 10) &&
          parseInt(firstElement[secondField], 10) ===
            parseInt(secondElement[secondField], 10) &&
          parseInt(firstElement.programme_version_id, 10) ===
            parseInt(secondElement.programme_version_id, 10)
      );

      if (!myElement) elementsToInsert.push(firstElement);
    });

    secondElements.forEach((secondElement) => {
      const myElement = firstElements.find(
        (firstElement) =>
          parseInt(firstElement[firstField], 10) ===
            parseInt(secondElement[firstField], 10) &&
          parseInt(firstElement[secondField], 10) ===
            parseInt(secondElement[secondField], 10) &&
          parseInt(firstElement.programme_version_id, 10) ===
            parseInt(secondElement.programme_version_id, 10)
      );

      if (!myElement) elementsToDelete.push(secondElement.id);
    });

    if (!isEmpty(elementsToInsert)) {
      await programmeVersionService[insertService](
        elementsToInsert,
        transaction
      );
    }

    if (!isEmpty(elementsToDelete)) {
      await programmeVersionService[deleteService](
        elementsToDelete,
        transaction
      );
    }

    return { elementsToDelete, elementsToInsert };
  } catch (error) {
    throw new Error(error.message);
  }
};

// const handleUpdatingPivots =
//   async function (
//     programmeVersionId,
//     specializations,
//     plans,
//     subjectCombinationCategories,
//     programmeVersionEntryYears,
//     modules,
//     user,
//     transaction
//   ) {
//     try {
//   const deletedSpecializations = [];
//   const deletedSubjectCombinationCategories = [];
//  const deletedEntryYears = [];
// const deletedModules = [];
//  const notDeletedSpecializations = [];
//  const notDeletedSubjectCombinationCategories = [];
//  const notDeletedEntryYears = [];
// const notDeletedModules = [];
// if (!isEmpty(specializations)) {
//   const findSpecializations =
//     await programmeVersionService.findAllProgrammeVersionSpecializations({
//       where: {
//         programme_version_id: programmeVersionId,
//       },
//       attributes: ['id', 'programme_version_id', 'specialization_id'],
//       raw: true,
//     });
//   findSpecializations.forEach((item) => {
//     if (
//       specializations.some(
//         (obj) =>
//           parseInt(obj.programme_version_id, 10) ===
//             parseInt(item.programme_version_id, 10) &&
//           parseInt(obj.specialization_id, 10) ===
//             parseInt(item.specialization_id, 10)
//       )
//     ) {
//       notDeletedSpecializations.push(item);
//     } else {
//       deletedSpecializations.push(item);
//     }
//   });
//   for (const eachObject of specializations) {
//     eachObject.created_by_id = user;
//     await programmeVersionService.createSpecializations(
//       eachObject,
//       transaction
//     );
//   }
//   if (!isEmpty(deletedSpecializations)) {
//     for (const eachObject of deletedSpecializations) {
//       await programmeVersionService.removeSpecializations(
//         {
//           where: {
//             id: eachObject.id,
//           },
//         },
//         transaction
//       );
//     }
//   }
// }
// if (!isEmpty(plans)) {
//   const findPlans =
//     await programmeVersionService.findAllProgrammeVersionPlans({
//       where: {
//         programme_version_id: programmeVersionId,
//       },
//       attributes: [
//         'id',
//         'programme_version_id',
//         'programme_version_plan_id',
//       ],
//       raw: true,
//     });
//   const oldVersionPlanIds = map(findPlans, 'programme_version_plan_id');
//   const newVersionPlanIds = map(plans, 'programme_version_plan_id');
//   const plansToDelete = difference(oldVersionPlanIds, newVersionPlanIds);
//   for (const eachObject of plans) {
//     eachObject.created_by_id = user;
//     await programmeVersionService.createPlans(eachObject, transaction);
//   }
//   if (!isEmpty(plansToDelete)) {
//     const plansToDeleteIds = plansToDelete.map((vpId) => {
//       const findVP = find(
//         findPlans,
//         (e) => e.programme_version_plan_id === vpId
//       );
//       return findVP.id;
//     });
//     await programmeVersionService.removePlans(
//       {
//         where: {
//           id: plansToDeleteIds,
//         },
//       },
//       transaction
//     );
//   }
// }
// if (!isEmpty(subjectCombinationCategories)) {
//   const findCategories =
//     await programmeVersionService.findAllProgrammeVersionSubjectCombinationCategories(
//       {
//         where: {
//           programme_version_id: programmeVersionId,
//         },
//         attributes: [
//           'id',
//           'programme_version_id',
//           'subject_combination_category_id',
//         ],
//         raw: true,
//       }
//     );
//   findCategories.forEach((item) => {
//     if (
//       subjectCombinationCategories.some(
//         (obj) =>
//           parseInt(obj.programme_version_id, 10) ===
//             parseInt(item.programme_version_id, 10) &&
//           parseInt(obj.subject_combination_category_id, 10) ===
//             parseInt(item.subject_combination_category_id, 10)
//       )
//     ) {
//       notDeletedSubjectCombinationCategories.push(item);
//     } else {
//       deletedSubjectCombinationCategories.push(item);
//     }
//   });
//   for (const eachObject of subjectCombinationCategories) {
//     eachObject.created_by_id = user;
//     await programmeVersionService.createSubjectCombinationCategory(
//       eachObject,
//       transaction
//     );
//   }
//   if (!isEmpty(deletedSubjectCombinationCategories)) {
//     for (const eachObject of deletedSubjectCombinationCategories) {
//       await programmeVersionService.removeSubjectCombinationCategories(
//         {
//           where: {
//             id: eachObject.id,
//           },
//         },
//         transaction
//       );
//     }
//   }
// }
// if (!isEmpty(programmeVersionEntryYears)) {
//   const findVersionEntryYears =
//     await programmeVersionService.findAllProgrammeVersionEntryYears({
//       where: {
//         programme_version_id: programmeVersionId,
//       },
//       attributes: [
//         'id',
//         'programme_version_id',
//         'entry_year_id',
//         'graduation_load',
//       ],
//       raw: true,
//     });
//   findVersionEntryYears.forEach((item) => {
//     if (
//       programmeVersionEntryYears.some(
//         (obj) =>
//           parseInt(obj.programme_version_id, 10) ===
//             parseInt(item.programme_version_id, 10) &&
//           parseInt(obj.entry_year_id, 10) ===
//             parseInt(item.entry_year_id, 10) &&
//           parseInt(obj.graduation_load, 10) ===
//             parseInt(item.graduation_load, 10)
//       )
//     ) {
//       notDeletedEntryYears.push(item);
//     } else {
//       deletedEntryYears.push(item);
//     }
//   });
//   for (const eachObject of programmeVersionEntryYears) {
//     eachObject.created_by_id = user;
//     await programmeVersionService.createProgrammeVersionEntryYear(
//       eachObject,
//       transaction
//     );
//   }
//   if (!isEmpty(deletedEntryYears)) {
//     for (const eachObject of deletedEntryYears) {
//       await programmeVersionService.removeProgrammeVersionEntryYear(
//         {
//           where: {
//             id: eachObject.id,
//           },
//         },
//         transaction
//       );
//     }
//   }
// }
// if (!isEmpty(modules)) {
//   const findVersionModule =
//     await programmeVersionService.findAllProgrammeVersionModules({
//       where: {
//         programme_version_id: programmeVersionId,
//       },
//       attributes: ['id', 'programme_version_id', 'module_id'],
//       raw: true,
//     });
//   findVersionModule.forEach((item) => {
//     if (
//       modules.some(
//         (obj) =>
//           parseInt(obj.programme_version_id, 10) ===
//             parseInt(item.programme_version_id, 10) &&
//           parseInt(obj.module_id, 10) === parseInt(item.module_id, 10)
//       )
//     ) {
//       notDeletedModules.push(item);
//     } else {
//       deletedModules.push(item);
//     }
//   });
//   for (const eachObject of modules) {
//     if (
//       eachObject.has_module_options === true &&
//       isEmpty(eachObject.programme_version_module_options)
//     ) {
//       throw new Error('Please provide the version module options .');
//     } else if (
//       eachObject.has_module_options !== true &&
//       !isEmpty(eachObject.programme_version_module_options)
//     ) {
//       throw new Error('Please indicate has module options ? as true.');
//     }
//     const options = [];
//     if (!isEmpty(eachObject.programme_version_module_options)) {
//       eachObject.programme_version_module_options.forEach((option) => {
//         options.push({
//           option_id: option,
//           created_by_id: user,
//         });
//       });
//     }
//     eachObject.moduleOptions = options;
//     eachObject.created_by_id = user;
//     await programmeVersionService.createProgrammeVersionModule(
//       eachObject,
//       transaction
//     );
//   }
//   if (!isEmpty(deletedModules)) {
//     for (const eachObject of deletedModules) {
//       const findModuleOptions =
//         await programmeVersionService.findAllModuleOptions({
//           where: {
//             version_module_id: eachObject.id,
//           },
//           attributes: ['id'],
//           raw: true,
//         });
//       if (!isEmpty(findModuleOptions)) {
//         for (const eachOption of findModuleOptions) {
//           await programmeVersionService.removeProgrammeVersionModuleOption(
//             {
//               where: {
//                 id: eachOption.id,
//               },
//             },
//             transaction
//           );
//         }
//       }
//       await programmeVersionService.removeProgrammeVersionModule(
//         {
//           where: {
//             id: eachObject.id,
//           },
//         },
//         transaction
//       );
//     }
//   }
// }
//   } catch (error) {
//     throw new Error(error.message);
//   }
// };

const getVersionAttributes = function () {
  return {
    attributes: {
      exclude: [
        'updated_at',
        'createdById',
        'createApprovedById',
        'lastUpdatedById',
        'lastUpdateApprovedById',
        'deletedById',
        'deleteApprovedById',
        'deleteApprovedById',
        'delete_approval_status',
        'delete_approval_date',
        'delete_approved_by_id',
        'last_update_approval_status',
        'last_update_approval_date',
        'last_update_approved_by_id',
        'last_updated_by_id',
        'create_approval_status',
        'create_approval_date',
        'create_approved_by_id',
      ],
    },
    include: [
      {
        association: 'versionPlans',
        separate: true,
        ...excludeAttributes(),
        include: [
          {
            association: 'planStudyYear',
            attributes: ['id', 'metadata_value'],
          },
          {
            association: 'planSemester',
            attributes: ['id', 'metadata_value'],
          },
          {
            association: 'plan',
            attributes: ['id', 'metadata_value'],
          },
        ],
      },
      {
        association: 'subjectCombYear',
        ...excludeAttributes(),
        attributes: ['metadata_value'],
      },
      {
        association: 'subjectCombSemester',
        ...excludeAttributes(),
        attributes: ['metadata_value'],
      },
      {
        association: 'versionSubjCombCat',
        ...excludeAttributes(),
        include: [
          {
            association: 'category',
            attributes: ['metadata_value'],
          },
          {
            association: 'subjectCombinations',
            ...excludeAttributes(),
            include: [
              {
                association: 'subject',
                ...excludeAttributes(),
              },
            ],
          },
        ],
      },
      {
        association: 'specializationYear',
        ...excludeAttributes(),
        attributes: ['metadata_value'],
      },
      {
        association: 'specializationSemester',
        ...excludeAttributes(),
        attributes: ['metadata_value'],
      },
      {
        association: 'specializations',
        ...excludeAttributes(),
        through: {
          attributes: ['id'],
        },
      },
      {
        association: 'entryYears',
        ...excludeAttributes(),
        through: {
          attributes: ['id', 'graduation_load'],
        },
      },
      {
        association: 'versionModules',
        ...excludeAttributes(),
        include: [
          {
            association: 'module',
            attributes: ['metadata_value'],
          },
          {
            association: 'moduleOptions',
            ...excludeAttributes(),

            include: [
              {
                association: 'option',
                attributes: ['metadata_value'],
              },
            ],
          },
        ],
      },
      {
        association: 'exemptRegs',
        attributes: ['id', 'study_year_id', 'semester_id'],
        include: [
          {
            association: 'studyYear',
            attributes: ['metadata_value'],
          },
          {
            association: 'semester',
            attributes: ['metadata_value'],
          },
        ],
      },
    ],
  };
};

const excludeAttributes = function () {
  return {
    attributes: {
      exclude: [
        'updated_at',
        'createdById',
        'createApprovedById',
        'lastUpdatedById',
        'lastUpdateApprovedById',
        'deletedById',
        'deleteApprovedById',
        'deleteApprovedById',
        'delete_approval_status',
        'delete_approval_date',
        'delete_approved_by_id',
        'last_update_approval_status',
        'last_update_approval_date',
        'last_update_approved_by_id',
        'last_updated_by_id',
        'create_approval_status',
        'create_approval_date',
        'create_approved_by_id',
      ],
    },
  };
};

module.exports = ProgrammeVersionController;
