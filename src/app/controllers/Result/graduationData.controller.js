const { HttpResponse } = require('@helpers');
const { graduationListService } = require('@services/index');

const http = new HttpResponse();

class GraduationDataController {
  // departmentsBySchool
  async departmentsBySchool(req, res) {
    try {
      if (!req.query.faculty_id) {
        throw new Error('Invalid Context Provided');
      }

      const context = req.query;

      const data = await graduationListService.departmentsBySchool(context);

      http.setSuccess(200, 'Departments fetched successfully', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Departments', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  // programmesByDepartment
  async programmesByDepartment(req, res) {
    try {
      if (!req.query.department_id) {
        throw new Error('Invalid Context Provided');
      }

      const context = req.query;

      const data = await graduationListService.programmesByDepartment(context);

      http.setSuccess(200, 'Programmes fetched successfully', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Programmes', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

module.exports = GraduationDataController;
