const { HttpResponse } = require('@helpers');
const {
  courseUnitService,
  metadataValueService,
  programmeVersionService,
  gradingService,
  departmentService,
  programmeVersionPlanService,
  programmeService,
  metadataService,
} = require('@services/index');
const { isEmpty, toUpper, now, orderBy, trim } = require('lodash');
const moment = require('moment');
const model = require('@models');
const XLSX = require('xlsx');
const formidable = require('formidable');
const excelJs = require('exceljs');
const fs = require('fs');
const {
  courseTemplateColumns,
  modularProgrammeCourseTemplateColumns,
} = require('./templateColumns');
const {
  getMetadataValueId,
  getMetadataValues,
} = require('@controllers/Helpers/programmeHelper');
const {
  uploadModularProgrammeCourseUnits,
  uploadNormalProgrammeCourseUnits,
} = require('@controllers/Helpers/courseUnitHelper');
const {
  validateSheetColumns,
} = require('@controllers/Helpers/uploadValidator');

const http = new HttpResponse();

class CourseUnitController {
  /**
   * GET All CourseUnits.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async index(req, res) {
    try {
      const courseUnits = await courseUnitService.findAllCourseUnits({
        order: ['course_unit_name'],
        ...courseUnitAttributes(),
      });

      http.setSuccess(200, 'Course units Fetched Successfully.', {
        data: courseUnits,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to fetch course units.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * GET CourseUnit Details.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async searchCourseUnit(req, res) {
    try {
      const { courseUnitCode } = req.params;

      const courseUnits = await courseUnitService.findOneCourseUnit({
        where: { course_unit_code: courseUnitCode },
        ...searchCUAttributes(),
      });

      http.setSuccess(200, 'Course Unit Details Fetched Successfully.', {
        data: courseUnits,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to fetch course units.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * CREATE New Course Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async createCourseUnit(req, res) {
    try {
      const data = req.body;
      const user = req.user.id;

      data.created_by_id = user;
      data.course_unit_code = toUpper(trim(data.course_unit_code));
      data.course_unit_name = toUpper(trim(data.course_unit_name));

      const prerequisites = [];

      const programme = await programmeService.findOneProgramme({
        where: { id: data.programme_id },
        raw: true,
      });

      if (!programme) {
        throw new Error('The programme does not exist.');
      }

      const findProgrammeVersion =
        await programmeVersionService.findOneProgrammeVersion({
          where: {
            id: data.programme_version_id,
            programme_id: programme.id,
          },
        });

      if (!findProgrammeVersion) {
        throw new Error('The version does not belong to the programme.');
      }

      if (data.has_prerequisite === true) {
        if (isEmpty(data.prerequisite_courses)) {
          throw new Error(`Please Provide Valid Prerequisite Courses.`);
        }

        data.prerequisite_courses.forEach((prerequisite) => {
          prerequisites.push({
            prerequisite_course_id: prerequisite,
            created_by_id: user,
          });
        });

        data.prerequisiteCourses = prerequisites;
      }

      const response = await model.sequelize.transaction(
        async (transaction) => {
          const courseUnit = await insertNewCourseUnit(data, transaction);

          if (programme.is_modular === true) {
            if (!data.module_id) {
              throw new Error(`Please specify a MODULE for the course unit.`);
            }

            if (data.module_option_id && !data.module_id) {
              throw new Error(
                `Please accompany a MODULE OPTION with its corresponding MODULE.`
              );
            }

            const findVersionModule =
              await programmeVersionService.findOneProgrammeVersionModule({
                where: {
                  programme_version_id: data.programme_version_id,
                  module_id: data.module_id,
                },
                attributes: [
                  'id',
                  'programme_version_id',
                  'module_id',
                  'has_module_options',
                ],
                raw: true,
              });

            if (!findVersionModule) {
              throw new Error(
                `The Module chosen is not a module of the programme version specified.`
              );
            }

            if (data.module_option_id) {
              const findModuleOption =
                await programmeVersionService.findOneProgrammeVersionModuleOption(
                  {
                    where: {
                      version_module_id: findVersionModule.id,
                      option_id: data.module_option_id,
                    },
                    attributes: ['id', 'version_module_id', 'option_id'],
                    raw: true,
                  }
                );

              if (!findModuleOption) {
                throw new Error(
                  `The Option chosen is not an OPTION of Module specified.`
                );
              }

              data.module_option_id = findModuleOption.id;
            }

            data.version_module_id = findVersionModule.id;

            await uploadModularProgrammeCourseUnits(
              data,
              courseUnit,
              user,
              transaction
            );
          } else {
            await uploadNormalProgrammeCourseUnits(
              data,
              courseUnit,
              data.programme_version_id,
              user,
              transaction
            );
          }

          return courseUnit[0];
        }
      );

      http.setSuccess(200, 'Course Unit Created Successfully.', {
        data: response,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Create This Course Unit.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /** uploadCourseUnits
   *
   */
  async uploadCourseUnits(req, res) {
    try {
      const data = req.body;
      const { programmeId } = req.params;
      const { versionId } = req.params;
      const user = req.user.id;

      data.created_by_id = user;

      const programme = await programmeService.findOneProgramme({
        where: { id: programmeId },
        raw: true,
      });

      if (!programme) {
        throw new Error('The programme does not exist.');
      }

      const courseUnits = await courseUnitService.findAllCourseUnits({
        attributes: ['id', 'course_unit_code', 'course_unit_name'],
        raw: true,
      });

      const findProgrammeVersion =
        await programmeVersionService.findOneProgrammeVersion({
          where: {
            id: versionId,
            programme_id: programme.id,
          },
        });

      if (!findProgrammeVersion) {
        throw new Error('The version does not belong to the programme.');
      }

      const form = new formidable.IncomingForm();

      const uploadedCourseUnits = [];

      form.parse(req, async (err, fields, files) => {
        if (err) {
          http.setError(400, 'Unable to upload course units.', {
            error: { err },
          });

          return http.send(res);
        }

        const file = files[Object.keys(files)[0]];

        if (!file) {
          http.setError(400, 'Please Select A File To Upload.');

          return http.send(res);
        }
        const workbook = XLSX.readFile(file.filepath, { cellDates: true });
        const createCourseUnit = workbook.SheetNames[0];
        const formattedCourseUnits = XLSX.utils.sheet_to_json(
          workbook.Sheets[createCourseUnit]
        );

        if (isEmpty(formattedCourseUnits)) {
          http.setError(400, 'Cannot upload an Empty template.');

          return http.send(res);
        }
        const metadataValues = await metadataValueService.findAllMetadataValues(
          {
            include: ['metadata'],
          }
        );
        const studyYears = await programmeService.findAllProgrammeStudyYears({
          where: {
            programme_id: programmeId,
          },
          raw: true,
        });
        const grading = await gradingService.findAllGrading({
          ...getGradingAttributes(),
          raw: true,
        });
        const departments = await departmentService.findAllDepartments({
          raw: true,
        });

        const plans =
          await programmeVersionPlanService.findAllProgrammeVersionPlans({
            where: {
              programme_version_id: versionId,
            },
            include: [
              {
                association: 'plan',
                attributes: ['id', 'metadata_value'],
              },
            ],
            raw: true,
            nest: true,
          });

        const formattedSpecializations = [];

        const specializations =
          await programmeVersionService.findAllProgrammeVersionSpecializations({
            where: {
              programme_version_id: versionId,
            },
            include: [
              {
                association: 'spec',
                attributes: [
                  'id',
                  'specialization_code',
                  'specialization_title',
                ],
              },
            ],
            raw: true,
            nest: true,
          });

        specializations.forEach((specialization) => {
          formattedSpecializations.push({
            programme_version_specialization_id: specialization.id,
            ...specialization.spec,
          });
        });

        const subjects = [];
        const categories =
          await programmeVersionService.findAllProgrammeVersionSubjectCombinationCategories(
            {
              where: {
                programme_version_id: versionId,
              },
              include: [
                {
                  association: 'subjectCombinations',
                  include: [
                    {
                      association: 'subjects',
                      attributes: ['id', 'subject_id'],

                      include: [
                        {
                          association: 'subject',
                          attributes: ['id', 'subject_name', 'subject_code'],
                        },
                      ],
                    },
                  ],
                },
              ],
              raw: true,
              nest: true,
            }
          );

        categories.forEach((category) => {
          subjects.push({
            ...category.subjectCombinations.subjects.subject,
            combination_subject_id: category.subjectCombinations.subjects.id,
          });
        });

        const getProgrammeStudyYears = (value, course) => {
          const checkValue = studyYears.find(
            (studyYear) =>
              toUpper(studyYear.programme_study_years) === toUpper(value)
          );

          if (checkValue) return parseInt(checkValue.id, 10);
          throw new Error(
            `Cannot find ${value} in the list of programme study years of ${programme.programme_title} for the module ${course}`
          );
        };

        const getGrading = (value, course) => {
          const checkValue = grading.find(
            (grade) => toUpper(grade.grading_code) === toUpper(value)
          );

          if (checkValue) return parseInt(checkValue.id, 10);
          throw new Error(
            `Cannot find ${value} in the list of grading codes for the module ${course}`
          );
        };

        const getDepartments = (value, course) => {
          const checkValue = departments.find(
            (department) =>
              toUpper(department.department_title) === toUpper(value)
          );

          if (checkValue) return parseInt(checkValue.id, 10);
          throw new Error(
            `Cannot find ${value} in the list of departments for the module ${course}`
          );
        };

        const getPlans = (value, course) => {
          const checkValue = plans.find(
            (pln) => toUpper(pln.plan.metadata_value) === toUpper(value)
          );

          if (checkValue) return parseInt(checkValue.id, 10);
          throw new Error(
            `Cannot find ${value} in the list of plans of ${programme.programme_title} for the module ${course}`
          );
        };

        const getArrayOfPlans = (value, course) => {
          const splittedText = !isEmpty(value) ? value.split(',') : [];
          const arrayValues = [];

          splittedText.forEach((text) =>
            arrayValues.push(getPlans(text.trim(), course))
          );

          return arrayValues;
        };

        const getSpecializations = (value, course) => {
          const checkValue = formattedSpecializations.find(
            (specialization) =>
              toUpper(specialization.specialization_title) === toUpper(value)
          );

          if (checkValue)
            return parseInt(checkValue.programme_version_specialization_id, 10);
          throw new Error(
            `Cannot find ${value} in the list of specializations of ${programme.programme_title} for the module ${course}`
          );
        };

        const getArrayOfSpecializations = (value, course) => {
          const splittedText = !isEmpty(value) ? value.split(',') : [];
          const arrayValues = [];

          splittedText.forEach((text) =>
            arrayValues.push(getSpecializations(text.trim(), course))
          );

          return arrayValues;
        };

        /**
         *
         * @param {*} value
         * @param {*} course
         * @returns
         */
        const handleCoursePrerequisites = (value, course) => {
          const splittedText = !isEmpty(value) ? value.split(',') : [];
          const arrayValues = [];

          splittedText.forEach((text) => {
            const checkValue = courseUnits.find(
              (course) =>
                toUpper(course.course_unit_code) === toUpper(text.trim())
            );

            if (!checkValue) {
              throw new Error(
                `Unable To Find A Prerequisite Course With Code ${text.trim()} For Course ${course}.`
              );
            }

            arrayValues.push({
              prerequisite_course_id: checkValue.id,
              created_by_id: user,
            });
          });

          return arrayValues;
        };

        const getSubjectCombinationSubject = (value, course) => {
          const checkValue = subjects.find(
            (subject) => toUpper(subject.subject_name) === toUpper(value)
          );

          if (checkValue)
            return parseInt(checkValue.combination_subject_id, 10);
          throw new Error(
            `Cannot find ${value} in the list of subjects for the version of ${programme.programme_title} for the module ${course}`
          );
        };

        const getArrayOfSubjects = (value, course) => {
          const splittedText = !isEmpty(value) ? value.split(',') : [];
          const arrayValues = [];

          splittedText.forEach((text) =>
            arrayValues.push(getSubjectCombinationSubject(text.trim(), course))
          );

          return arrayValues;
        };

        try {
          await model.sequelize.transaction(async (transaction) => {
            for (const courseUnit of formattedCourseUnits) {
              const courseUnitNameForErrorMsg =
                courseUnit['COURSE/MODULE NAME'] || 'Course Unit';

              validateSheetColumns(
                courseUnit,
                [
                  'COURSE/MODULE NAME',
                  'CODE',
                  'CREDIT UNITS',
                  'CATEGORY',
                  'SEMESTER',
                  'STUDY YEAR',
                  'GRADING',
                  'MARKS COMPUTATION METHODS',
                ],
                courseUnitNameForErrorMsg
              );
              data.course_unit_code = toUpper(trim(courseUnit.CODE));

              data.course_unit_name = toUpper(
                trim(courseUnit['COURSE/MODULE NAME'])
              );

              data.credit_unit = parseInt(courseUnit['CREDIT UNITS'], 10);

              data.lecture_hours = courseUnit['LECTURE HRS']
                ? parseInt(courseUnit['LECTURE HRS'], 10)
                : null;
              data.practical_hours = courseUnit['PRACTICAL HRS']
                ? parseInt(courseUnit['PRACTICAL HRS'], 10)
                : null;
              data.contact_hours = courseUnit['CONTACT HRS']
                ? parseInt(courseUnit['CONTACT HRS'], 10)
                : null;
              data.clinical_hours = courseUnit['CLINICAL HRS']
                ? parseInt(courseUnit['CLINICAL HRS'], 10)
                : null;
              data.field_work_hours = courseUnit['FIELD WORK HRS']
                ? parseInt(courseUnit['FIELD WORK HRS'], 10)
                : null;
              data.tutorial_hours = courseUnit['TUTORIAL HRS']
                ? parseInt(courseUnit['TUTORIAL HRS'], 10)
                : null;
              data.notional_hours = courseUnit['NOTIONAL HRS']
                ? parseInt(courseUnit['NOTIONAL HRS'], 10)
                : null;
              data.number_of_assessments = courseUnit['NUMBER OF ASSESSMENTS']
                ? parseInt(courseUnit['NUMBER OF ASSESSMENTS'], 10)
                : null;
              data.course_unit_status = courseUnit.STATUS;
              if (!courseUnit.CATEGORY) {
                throw new Error(
                  `Course Unit Category For ${courseUnitNameForErrorMsg} is required.`
                );
              }
              data.course_unit_category_id = getMetadataValueId(
                metadataValues,
                courseUnit.CATEGORY,
                'COURSE CATEGORIES',
                courseUnitNameForErrorMsg
              );

              data.course_unit_semester_id = getMetadataValueId(
                metadataValues,
                courseUnit.SEMESTER,
                'SEMESTERS',
                courseUnitNameForErrorMsg
              );

              data.course_unit_year_id = getProgrammeStudyYears(
                courseUnit['STUDY YEAR'],
                courseUnitNameForErrorMsg
              );

              data.grading_id = getGrading(
                courseUnit.GRADING,
                courseUnitNameForErrorMsg
              );

              if (courseUnit.DEPARTMENT) {
                data.department_id = getDepartments(
                  courseUnit.DEPARTMENT,
                  courseUnitNameForErrorMsg
                );
              }

              data.is_audited_course = courseUnit['IS AUDITED COURSE?'];

              if (courseUnit.PLAN) {
                data.plans = getArrayOfPlans(
                  courseUnit.PLAN,
                  courseUnitNameForErrorMsg
                );
              }

              if (courseUnit.SPECIALIZATION) {
                data.specializations = getArrayOfSpecializations(
                  courseUnit.SPECIALIZATION,
                  courseUnitNameForErrorMsg
                );
              }

              if (courseUnit.SUBJECT) {
                data.subjects = getArrayOfSubjects(
                  courseUnit.SUBJECT,
                  courseUnitNameForErrorMsg
                );
              }

              data.contribution_algorithm_id = getMetadataValueId(
                metadataValues,
                courseUnit['MARKS COMPUTATION METHODS'],
                'MARKS COMPUTATION METHODS',
                courseUnitNameForErrorMsg
              );

              if (courseUnit['HAS PREREQUISITE COURSES']) {
                if (
                  toUpper(trim(courseUnit['HAS PREREQUISITE COURSES'])) ===
                  'YES'
                ) {
                  if (
                    !courseUnit['PREREQUISITE COURSE CODES (comma separated)']
                  ) {
                    throw new Error(
                      `Please Provide Prerequisite Courses For ${courseUnitNameForErrorMsg}.`
                    );
                  }

                  data.has_prerequisite = true;

                  data.prerequisiteCourses = handleCoursePrerequisites(
                    courseUnit['PREREQUISITE COURSE CODES (comma separated)'],
                    courseUnitNameForErrorMsg
                  );
                }
              }

              const upload = await insertNewCourseUnit(data, transaction);

              uploadedCourseUnits.push(upload[0]);

              // handle modular and normal programmes
              if (programme.is_modular === true) {
                if (!courseUnit.MODULE) {
                  throw new Error(
                    `Please specify a MODULE for ${courseUnitNameForErrorMsg}.`
                  );
                }

                if (courseUnit['MODULE OPTION'] && !courseUnit.MODULE) {
                  throw new Error(
                    `Please accompany a MODULE OPTION with its corresponding MODULE for ${courseUnitNameForErrorMsg}.`
                  );
                }

                const module = getMetadataValueId(
                  metadataValues,
                  courseUnit.MODULE,
                  'PROGRAMME MODULES',
                  courseUnitNameForErrorMsg
                );

                const findVersionModule =
                  await programmeVersionService.findOneProgrammeVersionModule({
                    where: {
                      programme_version_id: versionId,
                      module_id: module,
                    },
                    attributes: [
                      'id',
                      'programme_version_id',
                      'module_id',
                      'has_module_options',
                    ],
                    raw: true,
                  });

                if (!findVersionModule) {
                  throw new Error(
                    `${courseUnit.MODULE} is not a module of the programme version specified for course ${courseUnitNameForErrorMsg}.`
                  );
                }

                data.version_module_id = findVersionModule.id;

                if (courseUnit['MODULE OPTION']) {
                  const option = getMetadataValueId(
                    metadataValues,
                    courseUnit['MODULE OPTION'],
                    'MODULE OPTIONS',
                    courseUnitNameForErrorMsg
                  );

                  const findModuleOption =
                    await programmeVersionService.findOneProgrammeVersionModuleOption(
                      {
                        where: {
                          version_module_id: data.version_module_id,
                          option_id: option,
                        },
                        attributes: ['id', 'version_module_id', 'option_id'],
                        raw: true,
                      }
                    );

                  if (!findModuleOption) {
                    throw new Error(
                      `${courseUnit['MODULE OPTION']} is not an OPTION of ${courseUnit.MODULE} for course ${courseUnitNameForErrorMsg}.`
                    );
                  }

                  data.module_option_id = findModuleOption.id;
                }

                await uploadModularProgrammeCourseUnits(
                  data,
                  upload,
                  user,
                  transaction
                );
              } else {
                await uploadNormalProgrammeCourseUnits(
                  data,
                  upload,
                  versionId,
                  user,
                  transaction
                );
              }
            }
          });
          http.setSuccess(200, 'Course units uploaded successfully.', {
            data: uploadedCourseUnits,
          });

          return http.send(res);
        } catch (error) {
          http.setError(400, 'Unable to upload course units.', {
            error: { message: error.message },
          });

          return http.send(res);
        }
      });
    } catch (error) {
      http.setError(400, 'Unable to upload course units.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * downloadCourseUnitsTemplate
   * @param {*} req
   * @param {*} res
   */
  async downloadCourseUnitsTemplate(req, res) {
    try {
      const { programmeId } = req.params;
      const { versionId } = req.params;
      const { user } = req;

      const programme = await programmeService
        .findOneProgramme({
          where: {
            id: programmeId,
          },
          attributes: {
            exclude: [
              'created_at',
              'updated_at',
              'deleted_at',
              'lastUpdatedById',
              'lastUpdateApprovedById',
              'deletedById',
              'deleteApprovedById',
              'deleteApprovedById',
            ],
          },
          include: [
            {
              association: 'studyYears',
              attributes: ['metadata_value'],
            },
          ],
          nest: true,
        })
        .then(function (res) {
          if (res) {
            const result = res.toJSON();

            return result;
          }
        });

      if (!programme) {
        throw new Error('The programme does not exist.');
      }

      const findProgrammeVersion =
        await programmeVersionService.findOneProgrammeVersion({
          where: {
            id: versionId,
            programme_id: programme.id,
          },
          raw: true,
        });

      if (!findProgrammeVersion) {
        throw new Error('The version does not belong to the programme.');
      }

      const workbook = new excelJs.Workbook();

      const departments = await departmentService.findAllDepartments({
        attributes: ['department_title'],
        raw: true,
      });

      const grading = await gradingService.findAllGrading({
        attributes: ['grading_code'],
        raw: true,
      });

      const formattedPlans = [];

      if (findProgrammeVersion.has_plan === true) {
        const plans =
          await programmeVersionPlanService.findAllProgrammeVersionPlans({
            where: {
              programme_version_id: versionId,
            },
            include: [
              {
                association: 'plan',
                attributes: ['metadata_value'],
              },
            ],
            raw: true,
            nest: true,
          });

        plans.forEach((pln) => {
          formattedPlans.push({ ...pln.plan });
        });
      }

      const formattedSpecializations = [];

      if (findProgrammeVersion.has_specializations === true) {
        const specializations =
          await programmeVersionService.findAllProgrammeVersionSpecializations({
            where: {
              programme_version_id: versionId,
            },
            include: [
              {
                association: 'spec',
                attributes: ['specialization_code', 'specialization_title'],
              },
            ],
            raw: true,
            nest: true,
          });

        specializations.forEach((specialization) => {
          formattedSpecializations.push({ ...specialization.spec });
        });
      }

      const formattedSubjects = [];

      if (findProgrammeVersion.has_subject_combination_categories === true) {
        const categories =
          await programmeVersionService.findAllProgrammeVersionSubjectCombinationCategories(
            {
              where: {
                programme_version_id: versionId,
              },
              include: [
                {
                  association: 'subjectCombinations',
                  include: [
                    {
                      association: 'subjects',
                      attributes: ['id', 'subject_id'],
                      include: [
                        {
                          association: 'subject',
                          attributes: ['subject_code', 'subject_name'],
                        },
                      ],
                    },
                  ],
                },
              ],
              raw: true,
              nest: true,
            }
          );

        categories.forEach((category) => {
          if (
            category.subjectCombinations.subjects.subject.subject_name != null
          ) {
            formattedSubjects.push({
              ...category.subjectCombinations.subjects.subject,
            });
          }
        });
      }

      const data = {
        departments: departments,
        grading: grading,
        formattedPlans: formattedPlans,
        formattedSpecializations: formattedSpecializations,
        formattedSubjects: formattedSubjects,
      };

      if (programme.is_modular === true) {
        await handleDownloadingModularProgCourseTemplate(
          programme,
          data,
          workbook,
          user,
          res
        );
      } else {
        await handleDownloadingNormalProgCourseTemplate(
          programme,
          data,
          workbook,
          user,
          res
        );
      }
    } catch (error) {
      http.setError(400, 'Unable to download this template.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * UPDATE Specific Course Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async updateCourseUnit(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      const user = req.user.id;

      data.last_updated_by_id = user;
      data.updated_at = moment.now();
      data.course_unit_code = toUpper(trim(data.course_unit_code));
      data.course_unit_title = toUpper(trim(data.course_unit_title));

      const prerequisites = [];

      if (data.has_prerequisite === true) {
        if (isEmpty(data.prerequisite_courses)) {
          throw new Error(`Please Provide Valid Prerequisite Courses.`);
        }

        data.prerequisite_courses.forEach((prerequisite) => {
          prerequisites.push({
            prerequisite_course_id: prerequisite,
            course_unit_id: id,
            last_updated_by_id: user,
          });
        });
      }

      const result = await model.sequelize.transaction(async (transaction) => {
        const updateCourseUnit = await courseUnitService.updateCourseUnit(
          id,
          data,
          transaction
        );

        await handleUpdatingPivots(id, prerequisites, transaction);

        return updateCourseUnit;
      });

      http.setSuccess(200, 'Course updated successfully', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to update this Course.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * UPDATE Specific Course Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async assignDepartment(req, res) {
    try {
      const { id } = req.params;
      const { departmentId } = req.params;

      const findCourseUnit = await courseUnitService.findOneCourseUnit({
        where: { id },
      });

      if (!findCourseUnit) throw new Error('This Course is invalid');

      const updateCourseUnit = await courseUnitService.updateCourseUnit(id, {
        department_id: departmentId,
      });

      http.setSuccess(200, 'Course Department assigned successfully', {
        updateCourseUnit,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to assign department to this Course.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Get Specific Course Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async fetchCourseUnit(req, res) {
    try {
      const { id } = req.params;
      const courseUnit = await courseUnitService.findOneCourseUnit({
        where: { id },
      });

      http.setSuccess(200, 'Course Unit fetch successful', { courseUnit });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to fetch Course Unit.', {
        error: { message: error.message },
      });

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
      const { courseUnitId } = req.params;

      await courseUnitService.deleteCourseUnit(courseUnitId).then((res) => {
        if (parseInt(res, 10) === 0) {
          throw new Error('Record not found!');
        }
      });

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
 * @param {*} data
 * @param {*} transaction
 * @returns
 */
const insertNewCourseUnit = async function (data, transaction) {
  try {
    const result = await courseUnitService.createCourseUnit(data, transaction);

    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};

const searchCUAttributes = function () {
  return {
    attributes: {
      exclude: [
        'subject_id',
        'deleted_by_id',
        'deleted_at',
        'field_work_hours',
        'notional_hours',
        'tutorial_hours',
        'contact_hours',
        'practical_hours',
        'clinical_hours',
        'lecture_hours',
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
        association: 'department',
        attributes: ['id', 'department_code', 'department_title'],
      },
      {
        association: 'pvCourseUnits',
        attributes: ['id'],
        include: [
          {
            association: 'programmeVersion',
            attributes: ['id', 'version_title'],
            include: [
              {
                association: 'programme',
                attributes: ['id', 'programme_code', 'programme_title'],
              },
            ],
          },
        ],
      },
    ],
  };
};

const courseUnitAttributes = function () {
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
        association: 'department',
        attributes: ['id', 'department_code', 'department_title'],
      },
      {
        association: 'prerequisiteCourses',
        separate: true,
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
      },
    ],
  };
};

const getGradingAttributes = function () {
  return {
    attributes: {
      exclude: [
        'created_at',
        'updated_at',
        'deleted_at',
        'createdById',
        'createApprovedById',
        'lastUpdatedById',
        'lastUpdateApprovedById',
        'deletedById',
        'deleteApprovedById',
        'deleteApprovedById',
      ],
    },
    include: [
      {
        association: 'values',
      },
    ],
  };
};

const arrayPermutations = (arrayList) => {
  const result = [];

  const f = (prefix, chars) => {
    for (let i = 0; i < chars.length; i++) {
      result.push(`${chars[i]}, ${prefix}`);
      f(`${chars[i]}, ${prefix}`, chars.slice(i + 1));
    }
  };

  f('', arrayList);

  return orderBy(result.map((list) => [list.replace(/, $/, '')]));
};

const handleDownloadingModularProgCourseTemplate = async function (
  programme,
  data,
  workbook,
  user,
  res
) {
  try {
    const createCourseUnitsSheet = workbook.addWorksheet('CREATE COURSES');
    const departmentsSheet = workbook.addWorksheet('Sheet2');
    const courseCategoriesSheet = workbook.addWorksheet('Sheet3');
    const semestersSheet = workbook.addWorksheet('Sheet4');
    const studyYearsSheet = workbook.addWorksheet('Sheet5');
    const gradingSheet = workbook.addWorksheet('Sheet6');
    const marksComputationSheet = workbook.addWorksheet('Sheet7');
    const programmeModuleSheet = workbook.addWorksheet('Sheet8');
    const moduleOptionSheet = workbook.addWorksheet('Sheet9');
    const metadata = await metadataService.findAllMetadata({
      attributes: ['metadata_name'],
      include: [
        { association: 'metadataValues', attributes: ['metadata_value'] },
      ],
      raw: true,
      nest: true,
    });

    createCourseUnitsSheet.properties.defaultColWidth =
      modularProgrammeCourseTemplateColumns.length;
    createCourseUnitsSheet.columns = modularProgrammeCourseTemplateColumns;
    departmentsSheet.state = 'veryHidden';
    courseCategoriesSheet.state = 'veryHidden';
    semestersSheet.state = 'veryHidden';
    studyYearsSheet.state = 'veryHidden';
    gradingSheet.state = 'veryHidden';
    marksComputationSheet.state = 'veryHidden';
    programmeModuleSheet.state = 'veryHidden';
    moduleOptionSheet.state = 'veryHidden';

    departmentsSheet.addRows(
      data.departments.map((dept) => [dept.department_title])
    );

    studyYearsSheet.addRows(
      programme.studyYears.map((year) => [year.metadata_value])
    );
    gradingSheet.addRows(data.grading.map((grade) => [grade.grading_code]));
    courseCategoriesSheet.addRows(
      getMetadataValues(metadata, 'COURSE CATEGORIES')
    );
    semestersSheet.addRows(getMetadataValues(metadata, 'SEMESTERS'));
    marksComputationSheet.addRows(
      getMetadataValues(metadata, 'MARKS COMPUTATION METHODS')
    );
    programmeModuleSheet.addRows(
      getMetadataValues(metadata, 'PROGRAMME MODULES')
    );
    moduleOptionSheet.addRows(getMetadataValues(metadata, 'MODULE OPTIONS'));

    // Add some modular programme course data validations
    createCourseUnitsSheet.dataValidations.add('Q2:Q1000', {
      type: 'list',
      allowBlank: true,
      formulae: ['=Sheet2!$A$1:$A$1000'],
      showErrorMessage: true,
      errorStyle: 'error',
      error: 'Please select a valid value from the list',
    });

    createCourseUnitsSheet.dataValidations.add('L2:L1000', {
      type: 'list',
      allowBlank: false,
      formulae: ['=Sheet3!$A$1:$A$1000'],
      showErrorMessage: true,
      errorStyle: 'error',
      error: 'Please select a valid value from the list',
    });

    createCourseUnitsSheet.dataValidations.add('M2:M1000', {
      type: 'list',
      allowBlank: false,
      formulae: ['=Sheet4!$A$1:$A$1000'],
      showErrorMessage: true,
      errorStyle: 'error',
      error: 'Please select a valid value from the list',
    });

    createCourseUnitsSheet.dataValidations.add('N2:N1000', {
      type: 'list',
      allowBlank: false,
      formulae: ['=Sheet5!$A$1:$A$1000'],
      showErrorMessage: true,
      errorStyle: 'error',
      error: 'Please select a valid value from the list',
    });

    createCourseUnitsSheet.dataValidations.add('P2:P1000', {
      type: 'list',
      allowBlank: false,
      formulae: ['=Sheet6!$A$1:$A$1000'],
      showErrorMessage: true,
      errorStyle: 'error',
      error: 'Please select a valid value from the list',
    });

    createCourseUnitsSheet.dataValidations.add('R2:R1000', {
      type: 'list',
      allowBlank: false,
      formulae: ['=Sheet7!$A$1:$A$1000'],
      showErrorMessage: true,
      errorStyle: 'error',
      error: 'Please select a valid value from the list',
    });

    createCourseUnitsSheet.dataValidations.add('S2:S1000', {
      type: 'list',
      allowBlank: false,
      formulae: ['=Sheet8!$A$1:$A$1000'],
      showErrorMessage: true,
      errorStyle: 'error',
      error: 'Please select a valid value from the list',
    });

    createCourseUnitsSheet.dataValidations.add('T2:T1000', {
      type: 'list',
      allowBlank: false,
      formulae: ['=Sheet9!$A$1:$A$1000'],
      showErrorMessage: true,
      errorStyle: 'error',
      error: 'Please select a valid value from the list',
    });

    const minNumber = 1;
    const maxNumber = 1000;

    createCourseUnitsSheet.dataValidations.add('C2:C1000', {
      type: 'whole',
      allowBlank: true,
      formulae: [minNumber, maxNumber],
      showErrorMessage: true,
      errorStyle: 'error',
      errorTitle: 'Invalid input!',
      error: `The value must be a number between ${minNumber} and ${maxNumber}`,
      prompt: `The value must be a number between ${minNumber} and ${maxNumber}`,
    });

    createCourseUnitsSheet.dataValidations.add('D2:D1000', {
      type: 'whole',
      allowBlank: true,
      formulae: [minNumber, maxNumber],
      showErrorMessage: true,
      errorStyle: 'error',
      errorTitle: 'Invalid input!',
      error: `The value must be a number between ${minNumber} and ${maxNumber}`,
      prompt: `The value must be a number between ${minNumber} and ${maxNumber}`,
    });

    createCourseUnitsSheet.dataValidations.add('E2:E1000', {
      type: 'whole',
      allowBlank: true,
      formulae: [minNumber, maxNumber],
      showErrorMessage: true,
      errorStyle: 'error',
      errorTitle: 'Invalid input!',
      error: `The value must be a number between ${minNumber} and ${maxNumber}`,
      prompt: `The value must be a number between ${minNumber} and ${maxNumber}`,
    });

    createCourseUnitsSheet.dataValidations.add('F2:F1000', {
      type: 'whole',
      allowBlank: true,
      formulae: [minNumber, maxNumber],
      showErrorMessage: true,
      errorStyle: 'error',
      errorTitle: 'Invalid input!',
      error: `The value must be a number between ${minNumber} and ${maxNumber}`,
      prompt: `The value must be a number between ${minNumber} and ${maxNumber}`,
    });

    createCourseUnitsSheet.dataValidations.add('G2:G1000', {
      type: 'whole',
      allowBlank: true,
      formulae: [minNumber, maxNumber],
      showErrorMessage: true,
      errorStyle: 'error',
      errorTitle: 'Invalid input!',
      error: `The value must be a number between ${minNumber} and ${maxNumber}`,
      prompt: `The value must be a number between ${minNumber} and ${maxNumber}`,
    });

    createCourseUnitsSheet.dataValidations.add('H2:H1000', {
      type: 'whole',
      allowBlank: true,
      formulae: [minNumber, maxNumber],
      showErrorMessage: true,
      errorStyle: 'error',
      errorTitle: 'Invalid input!',
      error: `The value must be a number between ${minNumber} and ${maxNumber}`,
      prompt: `The value must be a number between ${minNumber} and ${maxNumber}`,
    });

    createCourseUnitsSheet.dataValidations.add('I2:I1000', {
      type: 'whole',
      allowBlank: true,
      formulae: [minNumber, maxNumber],
      showErrorMessage: true,
      errorStyle: 'error',
      errorTitle: 'Invalid input!',
      error: `The value must be a number between ${minNumber} and ${maxNumber}`,
      prompt: `The value must be a number between ${minNumber} and ${maxNumber}`,
    });

    createCourseUnitsSheet.dataValidations.add('J2:J1000', {
      type: 'whole',
      allowBlank: true,
      formulae: [minNumber, maxNumber],
      showErrorMessage: true,
      errorStyle: 'error',
      errorTitle: 'Invalid input!',
      error: `The value must be a number between ${minNumber} and ${maxNumber}`,
      prompt: `The value must be a number between ${minNumber} and ${maxNumber}`,
    });

    createCourseUnitsSheet.dataValidations.add('O2:O1000', {
      type: 'whole',
      allowBlank: true,
      formulae: [minNumber, maxNumber],
      showErrorMessage: true,
      errorStyle: 'error',
      errorTitle: 'Invalid input!',
      error: `The value must be a number between ${minNumber} and ${maxNumber}`,
      prompt: `The value must be a number between ${minNumber} and ${maxNumber}`,
    });

    createCourseUnitsSheet.dataValidations.add('U2:U1000', {
      type: 'list',
      allowBlank: false,
      formulae: ['"YES, NO"'],
      showErrorMessage: true,
      errorStyle: 'error',
      error: 'Please select a valid value from the list',
    });

    const uploadPath = `${process.cwd()}/src/assets/documents/templates`;

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true }, (err) => {
        throw new Error(err.message);
      });
    }

    const template = `${uploadPath}/download-course-upload-template-${
      user.surname
    }-${user.other_names}-${user.id}-${now()}.xlsm`;

    await workbook.xlsx.writeFile(template);
    await res.download(
      template,
      'COURSE-UPLOAD-FOR-MODULAR-PROGRAMME-TEMPLATE.xlsx',
      (error) => {
        if (error) {
          throw new Error(error.message);
        }
      }
    );
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} programme
 * @param {*} data
 * @param {*} workbook
 * @param {*} user
 * @param {*} res
 */
const handleDownloadingNormalProgCourseTemplate = async function (
  programme,
  data,
  workbook,
  user,
  res
) {
  try {
    const createCourseUnitsSheet = workbook.addWorksheet('CREATE COURSES');
    const departmentsSheet = workbook.addWorksheet('Sheet2');
    const plansSheet = workbook.addWorksheet('Sheet3');
    const specializationsSheet = workbook.addWorksheet('Sheet4');
    const subjectsSheet = workbook.addWorksheet('Sheet5');
    const courseCategoriesSheet = workbook.addWorksheet('Sheet6');
    const semestersSheet = workbook.addWorksheet('Sheet7');
    const studyYearsSheet = workbook.addWorksheet('Sheet8');
    const gradingSheet = workbook.addWorksheet('Sheet9');
    const marksComputationSheet = workbook.addWorksheet('Sheet10');
    const metadata = await metadataService.findAllMetadata({
      attributes: ['metadata_name'],
      include: [
        { association: 'metadataValues', attributes: ['metadata_value'] },
      ],
      raw: true,
      nest: true,
    });

    createCourseUnitsSheet.properties.defaultColWidth =
      courseTemplateColumns.length;
    createCourseUnitsSheet.columns = courseTemplateColumns;
    departmentsSheet.state = 'veryHidden';
    plansSheet.state = 'veryHidden';
    specializationsSheet.state = 'veryHidden';
    subjectsSheet.state = 'veryHidden';
    courseCategoriesSheet.state = 'veryHidden';
    semestersSheet.state = 'veryHidden';
    studyYearsSheet.state = 'veryHidden';
    gradingSheet.state = 'veryHidden';
    marksComputationSheet.state = 'veryHidden';

    departmentsSheet.addRows(
      data.departments.map((dept) => [dept.department_title])
    );
    plansSheet.addRows(
      arrayPermutations(data.formattedPlans.map((plan) => plan.metadata_value))
    );
    specializationsSheet.addRows(
      arrayPermutations(
        data.formattedSpecializations.map(
          (specialization) => specialization.specialization_title
        )
      )
    );
    subjectsSheet.addRows(
      arrayPermutations(
        data.formattedSubjects.map((subject) => subject.subject_name)
      )
    );
    studyYearsSheet.addRows(
      programme.studyYears.map((year) => [year.metadata_value])
    );
    gradingSheet.addRows(data.grading.map((grade) => [grade.grading_code]));
    courseCategoriesSheet.addRows(
      getMetadataValues(metadata, 'COURSE CATEGORIES')
    );
    semestersSheet.addRows(getMetadataValues(metadata, 'SEMESTERS'));
    marksComputationSheet.addRows(
      getMetadataValues(metadata, 'MARKS COMPUTATION METHODS')
    );

    // Add some normal course unit data validations
    createCourseUnitsSheet.dataValidations.add('Q2:Q1000', {
      type: 'list',
      allowBlank: true,
      formulae: ['=Sheet2!$A$1:$A$1000'],
      showErrorMessage: true,
      errorStyle: 'error',
      error: 'Please select a valid value from the list',
    });

    createCourseUnitsSheet.dataValidations.add('R2:R1000', {
      type: 'list',
      allowBlank: true,
      formulae: ['=Sheet3!$A$1:$A$1000'],
      showErrorMessage: true,
      errorStyle: 'error',
      error: 'Please select a valid value from the list',
    });

    createCourseUnitsSheet.dataValidations.add('S2:S1000', {
      type: 'list',
      allowBlank: true,
      formulae: ['=Sheet4!$A$1:$A$1000'],
      showErrorMessage: true,
      errorStyle: 'error',
      error: 'Please select a valid value from the list',
    });

    createCourseUnitsSheet.dataValidations.add('T2:T1000', {
      type: 'list',
      allowBlank: true,
      formulae: ['=Sheet5!$A$1:$A$1000'],
      showErrorMessage: true,
      errorStyle: 'error',
      error: 'Please select a valid value from the list',
    });

    createCourseUnitsSheet.dataValidations.add('L2:L1000', {
      type: 'list',
      allowBlank: false,
      formulae: ['=Sheet6!$A$1:$A$1000'],
      showErrorMessage: true,
      errorStyle: 'error',
      error: 'Please select a valid value from the list',
    });

    createCourseUnitsSheet.dataValidations.add('M2:M1000', {
      type: 'list',
      allowBlank: false,
      formulae: ['=Sheet7!$A$1:$A$1000'],
      showErrorMessage: true,
      errorStyle: 'error',
      error: 'Please select a valid value from the list',
    });

    createCourseUnitsSheet.dataValidations.add('N2:N1000', {
      type: 'list',
      allowBlank: false,
      formulae: ['=Sheet8!$A$1:$A$1000'],
      showErrorMessage: true,
      errorStyle: 'error',
      error: 'Please select a valid value from the list',
    });

    createCourseUnitsSheet.dataValidations.add('P2:P1000', {
      type: 'list',
      allowBlank: false,
      formulae: ['=Sheet9!$A$1:$A$1000'],
      showErrorMessage: true,
      errorStyle: 'error',
      error: 'Please select a valid value from the list',
    });

    createCourseUnitsSheet.dataValidations.add('U2:U1000', {
      type: 'list',
      allowBlank: false,
      formulae: ['=Sheet10!$A$1:$A$1000'],
      showErrorMessage: true,
      errorStyle: 'error',
      error: 'Please select a valid value from the list',
    });

    const minNumber = 1;
    const maxNumber = 1000;

    createCourseUnitsSheet.dataValidations.add('C2:C1000', {
      type: 'whole',
      allowBlank: true,
      formulae: [minNumber, maxNumber],
      showErrorMessage: true,
      errorStyle: 'error',
      errorTitle: 'Invalid input!',
      error: `The value must be a number between ${minNumber} and ${maxNumber}`,
      prompt: `The value must be a number between ${minNumber} and ${maxNumber}`,
    });

    createCourseUnitsSheet.dataValidations.add('D2:D1000', {
      type: 'whole',
      allowBlank: true,
      formulae: [minNumber, maxNumber],
      showErrorMessage: true,
      errorStyle: 'error',
      errorTitle: 'Invalid input!',
      error: `The value must be a number between ${minNumber} and ${maxNumber}`,
      prompt: `The value must be a number between ${minNumber} and ${maxNumber}`,
    });

    createCourseUnitsSheet.dataValidations.add('E2:E1000', {
      type: 'whole',
      allowBlank: true,
      formulae: [minNumber, maxNumber],
      showErrorMessage: true,
      errorStyle: 'error',
      errorTitle: 'Invalid input!',
      error: `The value must be a number between ${minNumber} and ${maxNumber}`,
      prompt: `The value must be a number between ${minNumber} and ${maxNumber}`,
    });

    createCourseUnitsSheet.dataValidations.add('F2:F1000', {
      type: 'whole',
      allowBlank: true,
      formulae: [minNumber, maxNumber],
      showErrorMessage: true,
      errorStyle: 'error',
      errorTitle: 'Invalid input!',
      error: `The value must be a number between ${minNumber} and ${maxNumber}`,
      prompt: `The value must be a number between ${minNumber} and ${maxNumber}`,
    });

    createCourseUnitsSheet.dataValidations.add('G2:G1000', {
      type: 'whole',
      allowBlank: true,
      formulae: [minNumber, maxNumber],
      showErrorMessage: true,
      errorStyle: 'error',
      errorTitle: 'Invalid input!',
      error: `The value must be a number between ${minNumber} and ${maxNumber}`,
      prompt: `The value must be a number between ${minNumber} and ${maxNumber}`,
    });

    createCourseUnitsSheet.dataValidations.add('H2:H1000', {
      type: 'whole',
      allowBlank: true,
      formulae: [minNumber, maxNumber],
      showErrorMessage: true,
      errorStyle: 'error',
      errorTitle: 'Invalid input!',
      error: `The value must be a number between ${minNumber} and ${maxNumber}`,
      prompt: `The value must be a number between ${minNumber} and ${maxNumber}`,
    });

    createCourseUnitsSheet.dataValidations.add('I2:I1000', {
      type: 'whole',
      allowBlank: true,
      formulae: [minNumber, maxNumber],
      showErrorMessage: true,
      errorStyle: 'error',
      errorTitle: 'Invalid input!',
      error: `The value must be a number between ${minNumber} and ${maxNumber}`,
      prompt: `The value must be a number between ${minNumber} and ${maxNumber}`,
    });

    createCourseUnitsSheet.dataValidations.add('J2:J1000', {
      type: 'whole',
      allowBlank: true,
      formulae: [minNumber, maxNumber],
      showErrorMessage: true,
      errorStyle: 'error',
      errorTitle: 'Invalid input!',
      error: `The value must be a number between ${minNumber} and ${maxNumber}`,
      prompt: `The value must be a number between ${minNumber} and ${maxNumber}`,
    });

    createCourseUnitsSheet.dataValidations.add('O2:O1000', {
      type: 'whole',
      allowBlank: true,
      formulae: [minNumber, maxNumber],
      showErrorMessage: true,
      errorStyle: 'error',
      errorTitle: 'Invalid input!',
      error: `The value must be a number between ${minNumber} and ${maxNumber}`,
      prompt: `The value must be a number between ${minNumber} and ${maxNumber}`,
    });

    createCourseUnitsSheet.dataValidations.add('V2:V1000', {
      type: 'list',
      allowBlank: false,
      formulae: ['"YES, NO"'],
      showErrorMessage: true,
      errorStyle: 'error',
      error: 'Please select a valid value from the list',
    });

    createCourseUnitsSheet.dataValidations.add('X2:X1000', {
      type: 'list',
      allowBlank: false,
      formulae: ['"YES, NO"'],
      showErrorMessage: true,
      errorStyle: 'error',
      error: 'Please select a valid value from the list',
    });

    const uploadPath = `${process.cwd()}/src/assets/documents/templates`;

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true }, (err) => {
        throw new Error(err.message);
      });
    }

    const template = `${uploadPath}/download-course-upload-template-${
      user.surname
    }-${user.other_names}-${user.id}-${now()}.xlsm`;

    await workbook.xlsx.writeFile(template);
    await res.download(template, 'COURSE-UPLOAD-TEMPLATE.xlsx', (error) => {
      if (error) {
        throw new Error(error.message);
      }
    });
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} courseUnitId
 * @param {*} prerequisites
 * @param {*} transaction
 */
const handleUpdatingPivots = async function (
  courseUnitId,
  prerequisites,
  transaction
) {
  try {
    if (!isEmpty(prerequisites)) {
      await deleteOrCreateElements(
        prerequisites,
        'findAllPrerequisiteCourseUnits',
        'bulkInsertPrerequisiteCourseUnits',
        'bulkRemovePrerequisiteCourseUnit',
        'prerequisite_course_id',
        courseUnitId,
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
 * @param {*} courseUnitId
 * @param {*} transaction
 * @returns
 */
const deleteOrCreateElements = async (
  firstElements,
  findAllService,
  insertService,
  deleteService,
  firstField,
  courseUnitId,
  transaction
) => {
  const elementsToDelete = [];
  const elementsToInsert = [];

  const secondElements = await courseUnitService[findAllService]({
    where: {
      course_unit_id: courseUnitId,
    },
    attributes: ['id', 'course_unit_id', firstField],
    raw: true,
  });

  firstElements.forEach((firstElement) => {
    const myElement = secondElements.find(
      (secondElement) =>
        parseInt(firstElement[firstField], 10) ===
          parseInt(secondElement[firstField], 10) &&
        parseInt(firstElement.course_unit_id, 10) ===
          parseInt(secondElement.course_unit_id, 10)
    );

    if (!myElement) elementsToInsert.push(firstElement);
  });

  secondElements.forEach((secondElement) => {
    const myElement = firstElements.find(
      (firstElement) =>
        parseInt(firstElement[firstField], 10) ===
          parseInt(secondElement[firstField], 10) &&
        parseInt(firstElement.course_unit_id, 10) ===
          parseInt(secondElement.course_unit_id, 10)
    );

    if (!myElement) elementsToDelete.push(secondElement.id);
  });

  if (!isEmpty(elementsToInsert)) {
    await courseUnitService[insertService](elementsToInsert, transaction);
  }

  if (!isEmpty(elementsToDelete)) {
    await courseUnitService[deleteService](elementsToDelete, transaction);
  }

  return { elementsToDelete, elementsToInsert };
};

module.exports = CourseUnitController;
