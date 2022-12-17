const {
  getStudentSemesterResults,
} = require('@controllers/Helpers/semesterResultsHelper');
const { HttpResponse } = require('@helpers');
const {
  studentService,
  departmentService,
  metadataService,
} = require('@services/index');
const { filter, includes, toUpper, map } = require('lodash');

const http = new HttpResponse();

class StudentResultsController {
  // testimonial results  ..

  async testimonialResultView(req, res) {
    try {
      if (!req.params.id) {
        throw new Error('Invalid Context Provided');
      }
      const { id } = req.params;

      const studentId = req.user.id;

      const studentProgramme = await studentService
        .findOneStudentProgramme({
          where: {
            id,
          },
          attributes: [
            'id',
            'student_id',
            'campus_id',
            'registration_number',
            'student_number',
            'programme_id',
            'programme_version_id',
            'is_current_programme',
          ],
          include: [
            {
              association: 'programme',
              attributes: ['department_id'],
            },
          ],
          nest: true,
        })
        .then((res) => {
          if (res) {
            const result = res.toJSON();

            return result;
          }
        });

      if (!studentProgramme) {
        throw new Error('Academic Record Does Not Exist.');
      }

      if (studentId !== studentProgramme.student_id) {
        throw new Error(`Invalid Request`);
      }

      const getDepartments = await departmentService.findAllDepartments({
        attributes: ['id', 'department_title'],
        raw: true,
      });

      const metadata = await metadataService.findAllMetadata({
        where: {
          metadata_name: 'BLOCK DEPARTMENT RESULTS',
        },
        attributes: ['id', 'metadata_name'],
        include: [
          {
            association: 'metadataValues',
            attributes: ['metadata_value'],
          },
        ],
        plain: true,
      });

      let data = {};

      const studentResult = await getStudentSemesterResults(
        studentProgramme.registration_number
      );

      if (metadata) {
        const departmentsToBlock = map(metadata.metadataValues, (e) =>
          toUpper(e.metadata_value)
        );

        const toBlockIds = map(
          filter(getDepartments, (e) =>
            includes(departmentsToBlock, toUpper(e.department_title))
          ),
          (e) => parseInt(e.id, 10)
        );

        if (
          includes(
            toBlockIds,
            parseInt(studentProgramme.programme.department_id, 10)
          )
        ) {
          data = {};
        } else data = studentResult;
      } else data = studentResult;

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

module.exports = StudentResultsController;
