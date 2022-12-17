const { HttpResponse } = require('@helpers');
const {
  feesAmountPreviewService,
  studentProgrammeService,
} = require('@services/index');
const { feesStructureFunction } = require('../Helpers/feesStructureHelpers');

const http = new HttpResponse();

class FeesStructureController {
  async feesStructure(req, res) {
    try {
      const { studentProgrammeId } = req.params;

      const findStudentProgramme = await studentProgrammeService.findOne({
        where: { id: studentProgrammeId },
        raw: true,
        attributes: ['id', 'registration_number'],
      });

      if (!findStudentProgramme) {
        throw new Error('Academic Record Does Not Exist.');
      }

      const studentData = await feesAmountPreviewService.feesStructureStudent(
        findStudentProgramme.registration_number
      );

      const feesStructure = await feesStructureFunction(studentData);

      http.setSuccess(200, 'Student fees structure fetched successfully ', {
        ...feesStructure,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Student Fees Structure', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  // student portal
  async studentPortalFeesStructure(req, res) {
    try {
      const context = req.params;

      if (!context.studentProgrammeId) {
        throw new Error('Invalid Context Provided');
      }

      const studentData =
        await feesAmountPreviewService.feesStructureStudentPortal(context);

      if (!studentData) {
        throw new Error('Academic Record Does Not Exist.');
      }

      const feesStructure = await feesStructureFunction(studentData);

      http.setSuccess(200, 'Fees structure fetched successfully ', {
        ...feesStructure,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Fees Structure', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

module.exports = FeesStructureController;
