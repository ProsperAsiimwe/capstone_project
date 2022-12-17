const { HttpResponse } = require('@helpers');
const { academicYearFeesPolicyService } = require('@services/index');

const http = new HttpResponse();

class AcademicYearFeesPolicyController {
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
      const records = await academicYearFeesPolicyService.findAllRecords({
        attributes: [
          'id',
          'fees_category_id',
          'enrollment_status_id',
          'bill_by_entry_academic_year',
        ],
        include: [
          {
            association: 'feesCategory',
            attributes: ['metadata_value'],
          },
          {
            association: 'enrollmentStatus',
            attributes: ['metadata_value'],
          },
        ],
      });

      http.setSuccess(
        200,
        'All Academic Year Fees Policy Records Fetched Successfully',
        {
          data: records,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable To Fetch All Academic Year Fees Policy Records',
        {
          error: { message: error.message },
        }
      );

      return http.send(res);
    }
  }

  // fecth all records
  async fectchAllFuction(req, res) {
    try {
      const records = await academicYearFeesPolicyService.fectchAllRecords();

      http.setSuccess(
        200,
        'All Academic Year Fees Policy Records Fetched Successfully',
        {
          data: records,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable To Fetch All Academic Year Fees Policy Records',
        {
          error: { message: error.message },
        }
      );

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
  async createAcademicYearFeesPolicy(req, res) {
    try {
      const data = req.body;
      const { id } = req.user;

      data.created_by_id = id;

      const result =
        await academicYearFeesPolicyService.createAcademicYearFeesPolicyRecord(
          data
        );

      http.setSuccess(201, 'Academic Year Fees Policy Created Successfully.', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Create This Academic Year Fees Policy.', {
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
  async updateAcademicYearFeesPolicy(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      const updateRecord = await academicYearFeesPolicyService.updateRecord(
        id,
        data
      );
      const academicYearFeesPolicy = updateRecord[1][0];

      http.setSuccess(
        200,
        'Academic Year Fees Policy Record Updated Successfully',
        {
          data: academicYearFeesPolicy,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable To Update This Academic Year Fees Policy Record',
        {
          error: { message: error.message },
        }
      );

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
  async deleteAcademicYearFeesPolicy(req, res) {
    try {
      const { id } = req.params;

      await academicYearFeesPolicyService.deleteRecord(id);
      http.setSuccess(
        200,
        'Academic Year Fees Policy Record Deleted Successfully'
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable To Delete This Academic Year Fees Policy Record',
        {
          error: { message: error.message },
        }
      );

      return http.send(res);
    }
  }
}

module.exports = AcademicYearFeesPolicyController;
