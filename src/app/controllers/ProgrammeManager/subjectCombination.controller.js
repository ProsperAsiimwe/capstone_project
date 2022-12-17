const { HttpResponse } = require('@helpers');
const {
  subjectCombinationService,
  courseUnitService,
} = require('@services/index');
const { isEmpty } = require('lodash');
const models = require('@models');
// const querystring = require("querystring")

const http = new HttpResponse();

class SubjectCombinationController {
  /**
   * GET All SubjectCombinations.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async index(req, res) {
    try {
      const subjectCombinations =
        await subjectCombinationService.findAllSubjectCombinations({
          include: ['subjects'],
        });

      if (req.query.version_id) {
        const { version_id } = req.query;
        const result =
          await subjectCombinationService.findSubjectCombinationsWithVersions(
            parseInt(version_id, 10)
          );

        http.setSuccess(200, 'Subject Combinations', {
          result,
        });
      } else {
        http.setSuccess(200, 'Subject Combinations', { subjectCombinations });
      }

      return http.send(res);
    } catch (error) {
      http.setError(400, error);

      return http.send(res);
    }
  }

  async getCombinationsWithProgram(req, res) {
    try {
      const subjectCombinationsProgrammes =
        await subjectCombinationService.findSubjectCombinationsWithVersions();

      http.setSuccess(200, 'Subject Combinations', {
        subjectCombinationsProgrammes,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, error.message);

      return http.send(res);
    }
  }

  // versionSubjectCombinations
  async versionSubjectCombinationFunction(req, res) {
    try {
      const context = req.query;

      if (!context.version_id) {
        throw new Error('Invalid context provided');
      }

      const result = await subjectCombinationService.versionSubjectCombinations(
        context
      );

      const merged = result.reduce(
        (
          groupedData,
          {
            id,
            programme_version_id,
            subject_combination_category_id,
            subject_combination_categories,
            created_at,
            updated_at,
            ...rest
          }
        ) => {
          const key = `${id}-${programme_version_id}-${subject_combination_category_id}-${subject_combination_categories}-${created_at}-${updated_at}`;
          groupedData[key] = groupedData[key] || {
            id,
            programme_version_id,
            subject_combination_category_id,
            subject_combination_categories,
            created_at,
            updated_at,
            subject_combinations: [],
          };

          if (rest.subject_combination_id) {
            groupedData[key]['subject_combinations'].push(rest);
          }
          return groupedData;
        },
        {}
      );

      const versionSubjectCombinations = Object.values(merged);

      http.setSuccess(200, ' Version Subject Combinations', {
        versionSubjectCombinations,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, error.message);

      return http.send(res);
    }
  }

  /**
   * CREATE New SubjectCombination Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async createSubjectCombination(req, res) {
    try {
      const data = req.body;
      const { id } = req.user;

      data.created_by_id = parseInt(id, 10);

      const subjects = [];

      if (!isEmpty(data.combination_subjects)) {
        data.combination_subjects.forEach((subjectId) => {
          subjects.push({
            subject_id: subjectId,
            created_by_id: id,
          });
        });
      }

      data.subjects = subjects;
      const subjectCombination = await models.sequelize.transaction(
        async (transaction) => {
          const result =
            await subjectCombinationService.createSubjectCombination(
              data,
              transaction
            );

          if (result[1] === false) {
            throw new Error(
              'A subject combination record already exists with the same context.'
            );
          } else {
            return result;
          }
        }
      );

      http.setSuccess(201, 'Subject Combination created successfully', {
        subjectCombination,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to create this SubjectCombination.', {
        error: { msg: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * ADD New CourseUnit Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async addCourseUnit(req, res) {
    try {
      const { subjectCombinationSubjectId } = req.params;
      const data = req.body;
      const user = req.user.id;

      data.created_by_id = user;
      const finalResult = [];

      const combinationSubject = await subjectCombinationService
        .findOneProgrammeVersionSubjectCombinationSubject({
          where: { id: subjectCombinationSubjectId },
          include: [
            {
              association: 'combination',
              attributes: ['id', 'combination_category_id'],
              include: [
                {
                  association: 'category',
                  attributes: ['id', 'programme_version_id'],
                },
              ],
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

      if (!combinationSubject) {
        throw new Error(
          'The programme version subject combination subject does not exist.'
        );
      }

      await models.sequelize.transaction(async (transaction) => {
        for (const eachObject of data.course_units) {
          const courseUnit = await courseUnitService.findOneCourseUnit({
            where: {
              id: eachObject.course_unit_id,
            },
            raw: true,
          });

          if (!courseUnit) {
            throw new Error('One of the course units chosen does not exist.');
          }

          const versionCourseUnit =
            await courseUnitService.findOneProgrammeVersionCourseUnit({
              where: {
                programme_version_id:
                  combinationSubject.combination.category.programme_version_id,
                course_unit_id: eachObject.course_unit_id,
              },
              raw: true,
            });

          if (!versionCourseUnit) {
            if (!eachObject.grading_id) {
              throw new Error(
                `${courseUnit.course_unit_name} Requires a grading.`
              );
            }
            if (!eachObject.contribution_algorithm_id) {
              throw new Error(
                `${courseUnit.course_unit_name} Requires a marks computation method.`
              );
            }
            if (!eachObject.course_unit_semester_id) {
              throw new Error(
                `${courseUnit.course_unit_name} Requires a course unit semester.`
              );
            }
            if (!eachObject.course_unit_year_id) {
              throw new Error(
                `${courseUnit.course_unit_name} Requires a course unit year.`
              );
            }
            if (!eachObject.course_unit_category_id) {
              throw new Error(
                `${courseUnit.course_unit_name} Requires a course unit category.`
              );
            }
            if (!eachObject.number_of_assessments) {
              throw new Error(
                `${courseUnit.course_unit_name} Requires a number of assessments.`
              );
            }

            const progVersionCourseUnitData = {
              programme_version_id:
                combinationSubject.combination.category.programme_version_id,
              course_unit_id: eachObject.course_unit_id,
              course_unit_semester_id: eachObject.course_unit_semester_id,
              course_unit_year_id: eachObject.course_unit_year_id,
              course_unit_category_id: eachObject.course_unit_category_id,
              course_unit_status: eachObject.course_unit_status
                ? eachObject.course_unit_status
                : null,
              number_of_assessments: eachObject.number_of_assessments,
              grading_id: eachObject.grading_id,
              contribution_algorithm_id: eachObject.contribution_algorithm_id,
              created_by_id: user,
            };

            const versionCourseUnit =
              await courseUnitService.createProgrammeVersionCourseUnit(
                progVersionCourseUnitData,
                transaction
              );

            const subjectCourseUnitData = {
              programme_version_course_unit_id:
                versionCourseUnit[0].dataValues.id,
              combination_subject_id: subjectCombinationSubjectId,
              created_by_id: user,
            };

            const subjectCourseUnit =
              await courseUnitService.createSubjectCombinationSubjectCourseUnit(
                subjectCourseUnitData,
                transaction
              );

            if (subjectCourseUnit[1] === true) {
              finalResult.push(subjectCourseUnit[0]);
            }
          } else {
            const subjectCourseUnitData = {
              programme_version_course_unit_id: versionCourseUnit.id,
              combination_subject_id: subjectCombinationSubjectId,
              created_by_id: user,
            };

            const subjectCourseUnit =
              await courseUnitService.createSubjectCombinationSubjectCourseUnit(
                subjectCourseUnitData,
                transaction
              );

            if (subjectCourseUnit[1] === true) {
              finalResult.push(subjectCourseUnit[0]);
            }
          }
        }

        http.setSuccess(200, 'Course unit created successfully.', {
          data: finalResult,
        });
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to create this Course unit.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * deleteSubjectCourseUnit
   * @param {*} req
   * @param {*} res
   */
  async deleteSubjectCourseUnit(req, res) {
    try {
      const { subjectCourseUnitId } = req.params;

      await courseUnitService
        .deleteSubjectCourseUnit(subjectCourseUnitId)
        .then((res) => {
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

  /**
   * UPDATE Specific SubjectCombination Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async updateSubjectCombination(req, res) {
    try {
      const { subjectCombinationId } = req.params;
      const data = req.body;
      const user = req.user.id;

      if (data.subject_combination_code) {
        data.subject_combination_code = data.subject_combination_code
          .trim()
          .toUpperCase();
      }

      const subjects = [];

      if (!isEmpty(data.subjects)) {
        data.subjects.forEach((subject) => {
          subjects.push({
            subject_id: subject,
            category_combination_id: subjectCombinationId,
            last_updated_by_id: user,
          });
        });
      }

      const result = await models.sequelize.transaction(async (transaction) => {
        const response =
          await subjectCombinationService.updateSubjectCombination(
            subjectCombinationId,
            data,
            transaction
          );

        const update = response[1][0];

        await handleUpdatingPivots(
          subjectCombinationId,
          subjects,
          user,
          transaction
        );

        return update;
      });

      http.setSuccess(200, 'Subject Combination updated successfully', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to update this SubjectCombination.', {
        error,
      });

      return http.send(res);
    }
  }

  /**
   * Get Specific SubjectCombination Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async fetchSubjectCombination(req, res) {
    try {
      const { id } = req.params;
      const subjectCombination =
        await subjectCombinationService.findOneSubjectCombination({
          where: { id },
        });

      http.setSuccess(200, 'Subject Combination fetch successful', {
        subjectCombination,
      });
    } catch (error) {
      http.setError(400, 'Unable fetch Subject Combinations.', {
        error: error.message,
      });

      return http.send(res);
    }
  }

  /**
   * Destroy SubjectCombination Data
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async deleteSubjectCombination(req, res) {
    try {
      const { subjectCombinationId } = req.params;

      await subjectCombinationService
        .deleteSubjectCombination(subjectCombinationId)
        .then((res) => {
          if (parseInt(res, 10) === 0) {
            throw new Error('Record not found!');
          }
        });

      http.setSuccess(200, 'Subject Combination deleted successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to delete this Subject Combination.', {
        error: error.message,
      });

      return http.send(res);
    }
  }
}

const handleUpdatingPivots = async function (
  subjectCombinationId,
  subjects,
  user,
  transaction
) {
  try {
    const deletedSubjects = [];
    const notDeletedSubjects = [];

    if (!isEmpty(subjects)) {
      const findAllCombinationSubjects =
        await subjectCombinationService.findAllCombinationSubjects({
          where: {
            category_combination_id: subjectCombinationId,
          },
          attributes: ['id', 'subject_id', 'category_combination_id'],
          raw: true,
        });

      findAllCombinationSubjects.forEach((item) => {
        if (
          subjects.some(
            (obj) =>
              parseInt(obj.subject_id, 10) === parseInt(item.subject_id, 10) &&
              parseInt(obj.category_combination_id, 10) ===
                parseInt(item.category_combination_id, 10)
          )
        ) {
          notDeletedSubjects.push(item);
        } else {
          deletedSubjects.push(item);
        }
      });

      for (const eachObject of subjects) {
        eachObject.created_by_id = user;

        await subjectCombinationService.createCombinationSubject(
          eachObject,
          transaction
        );
      }

      if (!isEmpty(deletedSubjects)) {
        for (const eachObject of deletedSubjects) {
          await subjectCombinationService.removeCombinationSubject(
            {
              where: {
                id: eachObject.id,
              },
            },
            transaction
          );
        }
      }
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = SubjectCombinationController;
