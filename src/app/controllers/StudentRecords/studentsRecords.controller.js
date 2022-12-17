const { HttpResponse } = require('@helpers');
const { studentsRecordsService } = require('@services/index');

const http = new HttpResponse();

class StudentsRecordsController {
  // find student function
  /**
   *
   * @param {*} req
   * @param {*} res
   * @returns
   *
   * findStudentByStudentNumber
   * findStudentByName
   */
  async findStudentFunction(req, res) {
    try {
      const { searchBy, value } = req.query;

      let result = [];

      if (!searchBy || !value) {
        throw new Error('Invalid Context provided');
      }
      if (searchBy === 'registrationNumber') {
        result = await studentsRecordsService.findStudentByRegistrationNumber(
          value
        );
      } else if (searchBy === 'studentNumber') {
        result = await studentsRecordsService.findStudentByStudentNumber(value);
      } else if (searchBy === 'phone') {
        result = await studentsRecordsService.findStudentByPhone(value);
      } else if (searchBy === 'email') {
        result = await studentsRecordsService.findStudentByEmail(value);
      } else if (searchBy === 'fullName') {
        result = await studentsRecordsService.findStudentByFullName(value);
      } else if (searchBy === 'name') {
        result = await studentsRecordsService.findStudentByName(value);
      } else {
        throw new Error('Invalid search by Context provided');
      }
      http.setSuccess(200, 'Student Records fetched Successfully', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, error.message);

      return http.send(res);
    }
  }

  //  programmeDetailsFunction

  async programmeDetails(req, res) {
    try {
      if (!req.params.id) {
        throw new Error('Invalid Context Provided');
      }

      const context = req.params;

      const data = await studentsRecordsService.programmeDetailsFunction(
        context
      );

      const programmeEntryStudyYears = [];

      data.studyyears.forEach((stdYr) => {
        const checkValue = data.entryyears.find(
          (item) =>
            parseInt(item.entry_year_id, 10) ===
            parseInt(stdYr.programme_study_year_id, 10)
        );

        if (checkValue) {
          checkValue.programmeStudyYearContextId = stdYr.id;

          checkValue.programmeStudyYearContext = stdYr.study_year;

          programmeEntryStudyYears.push(checkValue);
        }
      });

      data.formattedProgrammeEntryYears = programmeEntryStudyYears;

      if (data === null) {
        http.setSuccess(200, 'Programme Details fetched successfully ', {
          data: {},
        });

        return http.send(res);
      } else {
        http.setSuccess(200, 'Programme Details fetched successfully ', {
          data,
        });

        return http.send(res);
      }
    } catch (error) {
      http.setError(400, 'Unable To Fetch Programme Details', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * GET STUDENT DISSERTATIONS
   *
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async getStudentDissertations(req, res) {
    try {
      const { programme_id: programmeId } = req.query;

      let whereClause = '';

      if (programmeId)
        whereClause = `where stp.programme_id = '${programmeId}'`;

      const data =
        await studentsRecordsService.getStudentProgrammeDissertations(
          whereClause
        );

      http.setSuccess(200, 'Programme Details fetched successfully ', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Programme Details', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

module.exports = StudentsRecordsController;
