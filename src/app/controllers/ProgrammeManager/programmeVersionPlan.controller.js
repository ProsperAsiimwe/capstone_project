const { HttpResponse } = require('@helpers');
const {
  programmeVersionPlanService,
  courseUnitService,
} = require('@services/index');
const model = require('@models');
const { isEmpty } = require('lodash');

const http = new HttpResponse();

class ProgrammeVersionPlanController {
  /**
   * GET All Programme VersionPlans.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async index(req, res) {
    try {
      const programmeVersionPlans =
        await programmeVersionPlanService.findAllProgrammeVersionPlans();

      http.setSuccess(200, 'Programme Version Plans', {
        programmeVersionPlans,
      });

      return http.send(res);
    } catch (error) {
      http.setSuccess(400, 'Unable to get program version plans.', {
        error: error.message,
      });

      return http.send(res);
    }
  }

  /**
   * CREATE New Programme VersionPlan Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async createProgrammeVersionPlan(req, res) {
    try {
      const submittedProgrammeVersionPlan = req.body;
      const { id } = req.user;

      submittedProgrammeVersionPlan.created_by_id = parseInt(id, 10);
      const programmeVersionPlan =
        await programmeVersionPlanService.createProgrammeVersionPlan(
          submittedProgrammeVersionPlan
        );

      http.setSuccess(201, 'Programme VersionPlan created successfully', {
        programmeVersionPlan,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to create this Programme Version Plan.', {
        error,
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
      const { programmeVersionPlanId } = req.params;
      const data = req.body;
      const user = req.user.id;

      data.created_by_id = user;
      const finalResult = [];

      const plan =
        await programmeVersionPlanService.findOneProgrammeVersionPlan({
          where: { id: programmeVersionPlanId },
          raw: true,
        });

      if (!plan) {
        throw new Error('The programme version plan does not exist.');
      }

      await model.sequelize.transaction(async (transaction) => {
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
                programme_version_id: plan.programme_version_id,
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
              programme_version_id: plan.programme_version_id,
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

            const planCourseUnitData = {
              programme_version_course_unit_id:
                versionCourseUnit[0].dataValues.id,
              programme_version_plan_id: programmeVersionPlanId,
              created_by_id: user,
            };

            const planCourseUnit =
              await courseUnitService.createProgrammeVersionPlanCourseUnit(
                planCourseUnitData,
                transaction
              );

            if (planCourseUnit[1] === true) {
              finalResult.push(planCourseUnit[0]);
            }
          } else {
            const planCourseUnitData = {
              programme_version_course_unit_id: versionCourseUnit.id,
              programme_version_plan_id: programmeVersionPlanId,
              created_by_id: user,
            };

            const planCourseUnit =
              await courseUnitService.createProgrammeVersionPlanCourseUnit(
                planCourseUnitData,
                transaction
              );

            if (planCourseUnit[1] === true) {
              finalResult.push(planCourseUnit[0]);
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
   * deletePlanCourseUnit
   * @param {*} req
   * @param {*} res
   */
  async deletePlanCourseUnit(req, res) {
    try {
      const { planCourseUnitId } = req.params;

      await courseUnitService
        .deletePlanCourseUnit(planCourseUnitId)
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
   * UPDATE Specific Programme VersionPlan Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async updateProgrammeVersionPlan(req, res) {
    try {
      const { id } = req.params;
      const updateProgrammeVersionPlan =
        await programmeVersionPlanService.updateProgrammeVersionPlan(
          id,
          req.body
        );
      const programmeVersionPlan = updateProgrammeVersionPlan[1][0];

      http.setSuccess(200, 'Programme Version Plan updated successfully', {
        programmeVersionPlan,
      });
      if (isEmpty(programmeVersionPlan))
        http.setError(404, 'Programme Version Plan Data Not Found.');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to update this Programme Version Plan.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Get Specific Programme VersionPlan Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async fetchProgrammeVersionPlan(req, res) {
    const { id } = req.params;
    const programmeVersionPlan =
      await programmeVersionPlanService.findOneProgrammeVersionPlan({
        where: { id },
      });

    http.setSuccess(200, 'Programme Version Plan fetch successful', {
      programmeVersionPlan,
    });
    if (isEmpty(programmeVersionPlan))
      http.setError(404, 'Programme Version Plan Not Found.');

    return http.send(res);
  }

  /**
   * Destroy ProgrammeVersionPlan Data
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async deleteProgrammeVersionPlan(req, res) {
    try {
      const { id } = req.params;

      await programmeVersionPlanService.deleteProgrammeVersionPlan(id);
      http.setSuccess(200, 'Programme Version Plan deleted successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to delete this ProgrammeVersionPlan.', {
        error,
      });

      return http.send(res);
    }
  }
}

module.exports = ProgrammeVersionPlanController;
