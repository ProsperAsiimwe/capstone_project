// lecturerCourses
// assignmentsByLecturerFunction
const { HttpResponse } = require('@helpers');
const {
  lecturerCoursesService,
  assignmentService,
  courseUnitService,
} = require('@services/index');

const http = new HttpResponse();

class LecturerAppController {
  async LecturerCoursesFunction(req, res) {
    try {
      if (!req.query.academic_year_id) {
        throw new Error('Invalid Context Provided');
      }

      const { id } = req.user;

      const queryData = req.query;

      // 152

      const context = { ...queryData, user_id: id };

      const data = await lecturerCoursesService.lecturerCourses(context);

      http.setSuccess(200, 'Courses fetched successfully ', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Courses', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  // programmeEnrolledStudents
  async programmeEnrolledStudents(req, res) {
    try {
      if (!req.query.assignment_id || !req.query.course_unit_id) {
        throw new Error('Invalid Context Provided');
      }

      const assignment = await assignmentService.findOneRecord({
        where: { id: req.query.assignment_id },
        attributes: [
          'id',
          'campus_id',
          'academic_year_id',
          'semester_id',
          'intake_id',
          'programme_id',
          'programme_type_id',
          'programme_version_id',
        ],
      });

      const programmeVersionCourse =
        await courseUnitService.findOneProgrammeVersionCourseUnit({
          where: {
            id: req.query.programme_version_course_unit_id,
          },
          attributes: ['course_unit_year_id'],
        });

      const studyYearId = programmeVersionCourse.dataValues;

      const context = {
        ...assignment.dataValues,
        course_id: req.query.course_unit_id,
        studyYearId,
      };

      const data = await lecturerCoursesService.programmeEnrolledStudents(
        context
      );

      http.setSuccess(200, 'Students Data fetched successfully ', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Students', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

module.exports = LecturerAppController;
