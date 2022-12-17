const { HttpResponse } = require('@helpers');
const {
  assignmentService,
  programmeVersionCourseUnitService,
} = require('@services/index');
const { isEmpty } = require('lodash');
const model = require('@models');

const http = new HttpResponse();

class AssignmentController {
  /**
   * GET All records.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async index(req, res) {
    try {
      const records = await assignmentService.findAllRecords({
        where: {
          deleted_at: null,
          deleted_by_id: null,
        },
      });

      http.setSuccess(
        200,
        'All Course Assignment Records Fetched Successfully',
        {
          data: records,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch All Course Assignment Records', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * CREATE New Record.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async createRecord(req, res) {
    try {
      const data = req.body;
      const user = req.user.id;

      const finalResult = [];

      if (!isEmpty(data.programme_types)) {
        await model.sequelize.transaction(async (transaction) => {
          for (const eachTypeId of data.programme_types) {
            const payload = {
              campus_id: data.campus_id,
              academic_year_id: data.academic_year_id,
              semester_id: data.semester_id,
              intake_id: data.intake_id,
              department_id: data.department_id,
              programme_id: data.programme_id,
              programme_type_id: eachTypeId,
              programme_version_id: data.programme_version_id,
              course_unit: data.course_unit,
              created_by_id: user,
            };

            const courseUnitLecturers = [];

            // handle lecturers
            if (!isEmpty(payload.course_unit.lecturers)) {
              payload.course_unit.lecturers.forEach((lecturer) => {
                const courseUnitGroups = [];

                // handle groups
                if (!isEmpty(lecturer.groups)) {
                  if (payload.course_unit.is_split === false) {
                    payload.course_unit.is_split = true;
                  }
                  lecturer.groups.forEach((group) => {
                    courseUnitGroups.push({
                      ...group,
                      created_by_id: user,
                    });
                  });
                }

                courseUnitLecturers.push({
                  ...lecturer,
                  groups: courseUnitGroups,
                  created_by_id: user,
                });
              });
            }

            const findCoordinator = courseUnitLecturers.filter(
              (lecturer) => lecturer.is_course_coordinator === true
            );

            const findUploader = courseUnitLecturers.filter(
              (lecturer) => lecturer.can_upload_marks === true
            );

            if (isEmpty(findCoordinator)) {
              throw new Error(
                'You need to define at least one course coordinator per course unit.'
              );
            }

            if (isEmpty(findUploader)) {
              throw new Error(
                'You need to define at least one lecturer who can upload marks per course unit.'
              );
            }

            if (findCoordinator.length > 1) {
              throw new Error(
                'There can only be one course coordinator assigned per course unit.'
              );
            }

            payload.course_unit.lecturers = courseUnitLecturers;

            const findCourseUnit =
              await programmeVersionCourseUnitService.findOneCourseUnit({
                where: {
                  id: payload.course_unit.programme_version_course_unit_id,
                },
                attributes: ['id', 'contribution_algorithm_id', 'grading_id'],
                raw: true,
              });

            if (!findCourseUnit.contribution_algorithm_id) {
              throw new Error(
                'The course unit you are trying to assign must have a marks computation method set for it in the curriculum.'
              );
            }

            if (!findCourseUnit.grading_id) {
              throw new Error(
                'The course unit you are trying to assign must have a grading system set for it in the curriculum.'
              );
            }

            // Handle Default Node
            const nodesPayload = {
              node_code: 'FM',
              node_name: 'FINAL MARK',
              percentage_contribution: 100,
              pass_mark: 50,
              marks_computation_method_id:
                findCourseUnit.contribution_algorithm_id,
              grading_id: findCourseUnit.grading_id,
              created_by_id: user,
            };

            const childNodesPayload = [
              {
                node_code: 'CW',
                node_name: 'COURSE WORK',
                percentage_contribution: 30,
                marks_computation_method_id:
                  findCourseUnit.contribution_algorithm_id,
                grading_id: findCourseUnit.grading_id,
                created_by_id: user,
              },
              {
                node_code: 'EX',
                node_name: 'FINAL EXAM',
                percentage_contribution: 70,
                marks_computation_method_id:
                  findCourseUnit.contribution_algorithm_id,
                grading_id: findCourseUnit.grading_id,
                created_by_id: user,
              },
            ];

            payload.course_unit.nodes = nodesPayload;

            if (payload.course_unit.has_course_work_and_final_mark === true) {
              payload.course_unit.nodes.childNodes = childNodesPayload;
            }

            const result = await assignmentService.createRecord(
              payload,
              transaction
            );

            if (result[1] === false) {
              payload.course_unit.assignment_id = result[0].dataValues.id;

              const insertIfContextExists =
                await assignmentService.createCourseUnitIfPayloadExists(
                  payload.course_unit,
                  transaction
                );

              if (insertIfContextExists[1] === true) {
                finalResult.push(insertIfContextExists);
              }
            } else {
              finalResult.push(result);
            }
          }
        });
      }

      http.setSuccess(200, 'Course Assignment Records Created successfully.', {
        data: finalResult,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, error.message);

      return http.send(res);
    }
  }

  /**
   * addCourseUnits
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async addCourseUnits(req, res) {
    try {
      const { assignmentId } = req.params;
      const data = req.body;
      const user = req.user.id;

      data.assignment_id = assignmentId;

      const courseUnitLecturers = [];

      // handle lecturers
      if (!isEmpty(data.course_unit.lecturers)) {
        data.course_unit.lecturers.forEach((lecturer) => {
          const courseUnitGroups = [];

          // handle groups
          if (!isEmpty(lecturer.groups)) {
            if (data.course_unit.is_split === false) {
              data.course_unit.is_split = true;
            }
            lecturer.groups.forEach((group) => {
              courseUnitGroups.push({
                ...group,
                created_by_id: user,
              });
            });
          }

          courseUnitLecturers.push({
            ...lecturer,
            groups: courseUnitGroups,
            created_by_id: user,
          });
        });
      }

      const findCoordinator = courseUnitLecturers.filter(
        (lecturer) => lecturer.is_course_coordinator === true
      );

      const findUploader = courseUnitLecturers.filter(
        (lecturer) => lecturer.can_upload_marks === true
      );

      if (isEmpty(findCoordinator)) {
        throw new Error(
          'You need to define at least one course coordinator per course unit.'
        );
      }

      if (isEmpty(findUploader)) {
        throw new Error(
          'You need to define at least one lecturer who can upload marks per course unit.'
        );
      }

      if (findCoordinator.length > 1) {
        throw new Error(
          'There can only be one course coordinator assigned per course unit.'
        );
      }

      data.course_unit.lecturers = courseUnitLecturers;

      const finalResult = await model.sequelize.transaction(
        async (transaction) => {
          const result = await assignmentService.addCourseUnits(
            data,
            transaction
          );

          return result;
        }
      );

      http.setSuccess(
        200,
        'Course Unit Added To Course Assignment Record Successfully.',
        {
          data: finalResult,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable To Add Course Unit To This Course Assignment Record.',
        {
          error: { message: error.message },
        }
      );

      return http.send(res);
    }
  }

  /**
   * addCourseUnitGroups
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async addCourseUnitGroups(req, res) {
    try {
      const { assignmentCourseId } = req.params;
      const data = req.body;
      const user = req.user.id;

      const groups = [];

      if (!isEmpty(data.course_unit_groups)) {
        data.course_unit_groups.forEach((group) => {
          groups.push({
            assignment_course_id: assignmentCourseId,
            ...group,
            created_by_id: user,
          });
        });
      }

      const finalResult = [];

      await model.sequelize.transaction(async (transaction) => {
        for (const eachObject of groups) {
          const result = await assignmentService.addCourseUnitGroups(
            eachObject,
            transaction
          );

          if (result[1] === true) {
            finalResult.push(result[0]);
          }
        }
      });

      if (isEmpty(finalResult)) {
        throw new Error('Course unit group records already exist.');
      }

      http.setSuccess(
        200,
        'Course Unit Groups Added To Course Unit Record Successfully.',
        {
          data: finalResult,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable To Add Course Unit Groups To This Course Unit Record.',
        {
          error: { message: error.message },
        }
      );

      return http.send(res);
    }
  }

  /**
   * addCourseUnitLecturers
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async addCourseUnitLecturers(req, res) {
    try {
      const { assignmentCourseId } = req.params;
      const data = req.body;
      const user = req.user.id;

      const lecturers = [];

      if (!isEmpty(data.course_unit_lecturers)) {
        data.course_unit_lecturers.forEach((lecturer) => {
          lecturers.push({
            assignment_course_id: assignmentCourseId,
            ...lecturer,
            created_by_id: user,
          });
        });

        const findAllLecturers =
          await assignmentService.findAllCourseUnitLecturers({
            where: {
              assignment_course_id: assignmentCourseId,
            },
            raw: true,
          });

        const courseUnitLecturers = findAllLecturers.concat(lecturers);

        const findCoordinator = courseUnitLecturers.filter(
          (lecturer) => lecturer.is_course_coordinator === true
        );

        const findUploader = courseUnitLecturers.filter(
          (lecturer) => lecturer.can_upload_marks === true
        );

        if (isEmpty(findCoordinator)) {
          throw new Error(
            'You need to define at least one course coordinator per course unit.'
          );
        }

        if (isEmpty(findUploader)) {
          throw new Error(
            'You need to define at least one lecturer who can upload marks per course unit.'
          );
        }

        if (findCoordinator.length > 1) {
          throw new Error(
            'There can only be one course coordinator assigned per course unit.'
          );
        }
      }

      const finalResult = [];

      await model.sequelize.transaction(async (transaction) => {
        for (const eachObject of lecturers) {
          const result = await assignmentService.addCourseUnitLecturers(
            eachObject,
            transaction
          );

          if (result[1] === true) {
            finalResult.push(result[0]);
          }
        }
      });

      if (isEmpty(finalResult)) {
        throw new Error('Lecturer records already exist.');
      }

      http.setSuccess(
        200,
        'Course Unit Lecturers Added To Course Unit Record Successfully.',
        {
          data: finalResult,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable To Add Course Unit Lecturers To This Course Unit Record.',
        {
          error: { message: error.message },
        }
      );

      return http.send(res);
    }
  }

  /**
   * UPDATE Specific Record.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async updateRecord(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      const updateRecord = await assignmentService.updateRecord(id, data);
      const assignment = updateRecord[1][0];

      http.setSuccess(200, 'Course Assignment Record Updated Successfully', {
        data: assignment,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Update This Course Assignment Record', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * UPDATE Specific Record.
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

      const updateRecord = await assignmentService.updateCourseUnit(id, data);
      const result = updateRecord[1][0];

      http.setSuccess(200, 'Course Unit Record Updated Successfully', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Update This Course Unit Record', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * UPDATE Specific Record.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async updateCourseUnitGroup(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      const updateRecord = await assignmentService.updateCourseUnitGroup(
        id,
        data
      );
      const result = updateRecord[1][0];

      http.setSuccess(200, 'Course Unit Group Record Updated Successfully', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Update This Course Unit Group Record', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * UPDATE Specific Record.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async updateCourseUnitLecturer(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      const lecturer = await assignmentService.findOneCourseUnitLecturer({
        where: {
          id,
        },
        raw: true,
      });

      let result = {};

      await model.sequelize.transaction(async (transaction) => {
        if (data.is_course_coordinator === true) {
          const findAllLecturers =
            await assignmentService.findAllCourseUnitLecturers({
              where: {
                assignment_course_id: lecturer.assignment_course_id,
              },
              raw: true,
            });

          const findCoordinator = findAllLecturers.filter(
            (lecturer) => lecturer.is_course_coordinator === true
          );

          if (!isEmpty(findCoordinator)) {
            for (const eachObject of findCoordinator) {
              await assignmentService.updateCourseUnitLecturer(
                eachObject.id,
                {
                  is_course_coordinator: false,
                },
                transaction
              );
            }
          }
        }
        const updateRecord = await assignmentService.updateCourseUnitLecturer(
          id,
          data,
          transaction
        );

        result = updateRecord[1][0];
      });

      http.setSuccess(200, 'Course Unit Lecturer Record Updated Successfully', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Update This Course Unit Lecturer Record', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Destroy Record Data
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async deleteRecord(req, res) {
    try {
      const { id } = req.params;

      await assignmentService.deleteRecord(id);
      http.setSuccess(200, 'Course Assignment Record Deleted Successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Cannot delete this Course Assignment.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Destroy Record Data
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async deleteCourseUnits(req, res) {
    try {
      const { id } = req.params;

      await assignmentService.deleteCourseUnits(id);
      http.setSuccess(200, 'Course Unit Record Deleted Successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Cannot delete this Course Unit.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Destroy Record Data
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async deleteCourseUnitGroups(req, res) {
    try {
      const { id } = req.params;

      await assignmentService.deleteCourseUnitGroups(id);
      http.setSuccess(200, 'Course Unit Group Record Deleted Successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Cannot delete this Course Unit Group.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Destroy Record Data
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async deleteCourseUnitLecturer(req, res) {
    try {
      const { id } = req.params;

      await assignmentService.deleteCourseUnitLecturer(id);
      http.setSuccess(200, 'Course Unit Lecturer Record Deleted Successfully.');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Cannot delete this Course Unit Lecturer.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

module.exports = AssignmentController;
