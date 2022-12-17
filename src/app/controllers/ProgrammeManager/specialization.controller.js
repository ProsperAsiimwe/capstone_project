const { HttpResponse } = require('@helpers');
const { specializationService, courseUnitService } = require('@services/index');
const model = require('@models');
const { isEmpty } = require('lodash');

const http = new HttpResponse();

class SpecializationController {
  /**
   * GET All Specializations.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async index(req, res) {
    const specializations =
      await specializationService.findAllSpecializations();

    http.setSuccess(200, 'Specializations', { specializations });

    return http.send(res);
  }

  /**
   * CREATE New Specialization Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async createSpecialization(req, res) {
    try {
      const submittedSpecialization = req.body;
      const { id } = req.user;

      submittedSpecialization.created_by_id = parseInt(id, 10);
      const specialization = await specializationService.createSpecialization(
        submittedSpecialization
      );

      http.setSuccess(201, 'Specialization created successfully', {
        specialization,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to create this Specialization.', { error });

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
      const { programmeVersionSpecializationId } = req.params;
      const data = req.body;
      const user = req.user.id;

      data.created_by_id = user;
      const finalResult = [];

      const spec =
        await specializationService.findOneProgrammeVersionSpecialization({
          where: { id: programmeVersionSpecializationId },
          raw: true,
        });

      if (!spec) {
        throw new Error('The programme version specialization does not exist.');
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
                programme_version_id: spec.programme_version_id,
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
              programme_version_id: spec.programme_version_id,
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

            const specializationCourseUnitData = {
              programme_version_course_unit_id:
                versionCourseUnit[0].dataValues.id,
              version_specialization_id: programmeVersionSpecializationId,
              created_by_id: user,
            };

            const specCourseUnit =
              await courseUnitService.createProgrammeVersionSpecializationCourseUnit(
                specializationCourseUnitData,
                transaction
              );

            if (specCourseUnit[1] === true) {
              finalResult.push(specCourseUnit[0]);
            }
          } else {
            const specializationCourseUnitData = {
              programme_version_course_unit_id: versionCourseUnit.id,
              version_specialization_id: programmeVersionSpecializationId,
              created_by_id: user,
            };

            const specCourseUnit =
              await courseUnitService.createProgrammeVersionSpecializationCourseUnit(
                specializationCourseUnitData,
                transaction
              );

            if (specCourseUnit[1] === true) {
              finalResult.push(specCourseUnit[0]);
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
   * deleteSpecializationCourseUnit
   * @param {*} req
   * @param {*} res
   */
  async deleteSpecializationCourseUnit(req, res) {
    try {
      const { specializationCourseUnitId } = req.params;

      await courseUnitService
        .deleteSpecializationCourseUnit(specializationCourseUnitId)
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
   * UPDATE Specific Specialization Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async updateSpecialization(req, res) {
    try {
      const { id } = req.params;
      const updateSpecialization =
        await specializationService.updateSpecialization(id, req.body);
      const specialization = updateSpecialization[1][0];

      http.setSuccess(200, 'Specialization updated successfully', {
        specialization,
      });
      if (isEmpty(specialization))
        http.setError(404, 'Specialization Data Not Found.');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to update this Specialization.', { error });

      return http.send(res);
    }
  }

  /**
   * Get Specific Specialization Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async fetchSpecialization(req, res) {
    const { id } = req.params;
    const specialization = await specializationService.findOneSpecialization({
      where: { id },
    });

    http.setSuccess(200, 'Specialization fetch successful', {
      specialization,
    });
    if (isEmpty(specialization))
      http.setError(404, 'Specialization Data Not Found.');

    return http.send(res);
  }

  /**
   * Destroy Specialization Data
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async deleteSpecialization(req, res) {
    try {
      const { id } = req.params;

      await specializationService.deleteSpecialization(id);
      http.setSuccess(200, 'Specialization deleted successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to delete this Specialization.', { error });

      return http.send(res);
    }
  }
}

module.exports = SpecializationController;
