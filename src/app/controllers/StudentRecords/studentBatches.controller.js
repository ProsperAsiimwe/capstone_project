const { HttpResponse } = require('@helpers');
const { studentApprovalService } = require('@services/index');

const http = new HttpResponse();

class StudentBatchesController {
  // by date
  async studentsBatchByDate(req, res) {
    try {
      const context = req.query;

      if (!context.date_from || !context.date_to) {
        throw new Error('Invalid Context Provided');
      }

      if (context.date_from > context.date_to) {
        throw new Error(
          `Invalid Context Provided, 'UPLOAD FROM DATE' SHOULD BE LESS OR EQUAL  TO 'UPLOAD TO DATE'`
        );
      }

      let data = [];
      //

      if (req.query.status === 'APPROVED') {
        data = await studentApprovalService.batchesByDateApproved(context);
      } else if (req.query.status === 'NOT APPROVED') {
        data = await studentApprovalService.batchesByDateNotApproved(context);
      } else {
        data = await studentApprovalService.studentsBatchByDate(context);
      }
      http.setSuccess(200, 'Students Batches Fetched Successfully', { data });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to fetch Student batches.', {
        error: error.message,
      });

      return http.send(res);
    }
  }

  //  by user

  async studentsBatchByUser(req, res) {
    try {
      const context = req.query;

      if (!context.date_from || !context.date_to) {
        throw new Error('Invalid Context Provided');
      }

      if (context.date_from > context.date_to) {
        throw new Error(
          `Invalid Context Provided, 'UPLOAD FROM DATE' SHOULD BE LESS OR EQUAL  TO 'UPLOAD TO DATE'`
        );
      }

      let data = [];
      //

      if (req.query.status === 'APPROVED' && req.query.userId) {
        data = await studentApprovalService.studentsBatchByUser(context);
      } else if (req.query.status === 'APPROVED' && !req.query.userId) {
        const userId = req.user.id;

        const newContext = { ...context, userId };

        data = await studentApprovalService.batchByUserApproved(newContext);
      } else if (req.query.status === 'NOT APPROVED' && !req.query.userId) {
        const userId = req.user.id;

        const newContext = { ...context, userId };

        data = await studentApprovalService.batchByUserNotApproved(newContext);
      } else if (req.query.status === 'NOT APPROVED' && req.query.userId) {
        data = await studentApprovalService.batchByUserNotApproved(context);
      } else if (!req.query.userId) {
        const userId = req.user.id;

        const newContext = { ...context, userId };

        data = await studentApprovalService.studentsBatchByUser(newContext);
      } else {
        data = await studentApprovalService.studentsBatchByUser(context);
      }

      http.setSuccess(200, 'Students Batches By  User Fetched Successfully', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to fetch Student batches.', {
        error: error.message,
      });

      return http.send(res);
    }
  }

  // uploadUsers

  async uploadUsers(req, res) {
    try {
      const data = await studentApprovalService.uploadUsers();

      http.setSuccess(200, 'Upload Users Fetched Successfully', { data });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to fetch Upload Users.', {
        error: error.message,
      });

      return http.send(res);
    }
  }

  // changeProgrammePending
  async changeProgrammePending(req, res) {
    try {
      if (!req.query.academic_year_id) {
        throw new Error('Invalid data request ');
      }
      const context = req.query;
      const data = await studentApprovalService.changeProgrammePending(context);

      http.setSuccess(
        200,
        'Pending, Change Programme Data Fetched Successfully',
        { data }
      );

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to fetch Pending, Change Programme.', {
        error: error.message,
      });

      return http.send(res);
    }
  }
}

module.exports = StudentBatchesController;
