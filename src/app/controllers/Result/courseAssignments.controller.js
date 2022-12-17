// assignmentsByLecturerFunction
const { HttpResponse } = require('@helpers');
const {
  courseAssignmentService,
  resultAllocationNodeService,
} = require('@services/index');

const http = new HttpResponse();

class CourseAssignmentController {
  async courseAssignmentFunction(req, res) {
    try {
      if (!req.query.campus_id || !req.query.academic_year_id) {
        throw new Error('Invalid Context Provided');
      }

      const { id } = req.user;

      const queryData = req.query;

      const context = { ...queryData, user_id: id };

      const data = await courseAssignmentService.assignmentsByLecturerFunction(
        context
      );

      http.setSuccess(200, 'Course Assignments fetched successfully ', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Course Assignments', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  // node allocations
  async courseNodeAssignment(req, res) {
    try {
      if (!req.query.course_assignment_id) {
        throw new Error('Invalid Context Provided');
      }

      const context = req.query;

      const data = await resultAllocationNodeService.courseNodesFunction(
        context
      );

      if (data === null) {
        http.setSuccess(200, 'Course Nodes fetched successfully ', {
          data: {},
        });

        return http.send(res);
      } else {
        http.setSuccess(200, 'Course Nodes fetched successfully ', {
          ...data,
        });

        return http.send(res);
      }
    } catch (error) {
      http.setError(400, 'Unable To Fetch Course Nodes', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  // course nodes for result view -- not nested

  async courseNodes(req, res) {
    try {
      if (!req.query.course_assignment_id) {
        throw new Error('Invalid Context Provided');
      }

      const context = req.query;

      const data = await resultAllocationNodeService.courseNodesDataFunction(
        context
      );

      http.setSuccess(200, 'Assessment Nodes fetched successfully ', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Assessment Nodes', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  // marksUploadLecturerFunction
  async marksUploadLecturer(req, res) {
    try {
      if (!req.query.course_assignment_id) {
        throw new Error('Invalid Context Provided');
      }

      const context = req.query;
      const data =
        await resultAllocationNodeService.marksUploadLecturerFunction(context);

      http.setSuccess(200, 'Mark upload Lecturer fetched successfully ', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Marks Upload Lecturer', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  // studentNode marks
  async studentNodeMarks(req, res) {
    try {
      if (!req.query.node_id) {
        throw new Error('Invalid Context Provided');
      }

      const context = req.query;
      const data = await resultAllocationNodeService.studentsNodeMarks(context);

      http.setSuccess(200, 'Student Node Marks fetched successfully ', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Student Node Marks', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  //  result views

  async resultView(req, res) {
    try {
      if (
        !req.query.academic_year_id &&
        !req.query.campus_id &&
        !req.query.intake_id &&
        !req.query.study_year_id &&
        !req.query.semester_id &&
        !req.query.programme_id
      ) {
        throw new Error('Invalid Context Provided');
      }
      const context = req.query;

      let students = [];

      let courses = [];

      students = await resultAllocationNodeService.resultViewFunction(context);

      courses = await resultAllocationNodeService.resultCoursesFunction(
        context
      );

      const data = { students: students, courses: courses };

      http.setSuccess(200, 'Student Results fetched successfully ', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Student Results', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  // departmentMarkApproval

  async departmentMarkApproval(req, res) {
    try {
      if (
        !req.query.campus_id ||
        !req.query.intake_id ||
        !req.query.programme_id ||
        !req.query.academic_year_id ||
        !req.query.semester_id ||
        !req.query.programme_type_id ||
        !req.query.version_course_unit_id
      ) {
        throw new Error('Invalid Context Provided');
      }

      const context = req.query;

      const data = await resultAllocationNodeService.departmentMarkApproval(
        context
      );

      http.setSuccess(
        200,
        'Student Testimonial Results fetched successfully ',
        {
          data,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Student Testimonial Results', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

module.exports = CourseAssignmentController;
