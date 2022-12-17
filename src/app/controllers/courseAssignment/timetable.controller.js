const { HttpResponse } = require('@helpers');
const { timetableService } = require('@services/index');
const { isEmpty } = require('lodash');
const moment = require('moment');

const http = new HttpResponse();

class TimetableController {
  /**
   * GET All records.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async getTeachingTimetable(req, res) {
    try {
      const records = await timetableService.findAllTeachingTimetables({
        ...getTimetableAttributes(),
        raw: true,
      });

      http.setSuccess(200, 'All Timetable Records Fetched Successfully.', {
        data: records,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch All Timetable Records.', {
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
  async createTeachingTimetable(req, res) {
    try {
      const { assignmentCourseId } = req.params;
      const data = req.body;
      const user = req.user.id;

      data.created_by_id = user;

      data.assignment_course_id = assignmentCourseId;
      data.start_time = `${data.start_time_hours}:${data.start_time_minutes} ${data.start_time_period}`;
      data.end_time = `${data.end_time_hours}:${data.end_time_minutes} ${data.end_time_period}`;

      const result = await createTeachingTimetableFunction(data);

      http.setSuccess(200, 'Timetable Created For Courses Successfully.', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable Create A Timetable For Courses.', {
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
  async updateTeachingTimetable(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      const result = await timetableService.updateTeachingTimetable(id, data);
      const response = result[1][0];

      http.setSuccess(200, 'Timetable Record Updated Successfully.', {
        data: response,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Update This Timetable Record.', {
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
  async deleteTeachingTimetable(req, res) {
    try {
      const { id } = req.params;

      await timetableService.deleteTeachingTimetable(id);
      http.setSuccess(200, 'Timetable Record Deleted Successfully.');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Cannot delete this Timetable.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

const createTeachingTimetableFunction = async function (data) {
  try {
    const start = moment(data.start_time, 'HH:mm a');
    const end = moment(data.end_time, 'HH:mm a');

    if (end <= start) {
      throw new Error('End Time must be greater than Start Time.');
    }

    const response = await timetableService.createTeachingTimetable(data);

    if (response[1] === false) {
      throw new Error('A record already exists with a similar context.');
    } else {
      return response[0];
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

const getTimetableAttributes = function () {
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
    include: [],
  };
};

module.exports = TimetableController;
