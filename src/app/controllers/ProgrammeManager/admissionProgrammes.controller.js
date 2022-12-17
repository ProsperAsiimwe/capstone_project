/* eslint-disable indent */
const { HttpResponse } = require('@helpers');
const {
  programmeService,
  institutionStructureService,
} = require('@services/index');

const http = new HttpResponse();

class AdmissionProgrammesController {
  async admissionProgrammesFunction(req, res) {
    try {
      let data = [];

      const institutionStructure =
        await institutionStructureService.findInstitutionStructureRecords();

      if (institutionStructure) {
        if (institutionStructure.academic_units.includes('Colleges')) {
          data = await programmeService.admissionProgrammesByCollege();
        } else if (
          institutionStructure.academic_units.includes('Faculties') ||
          institutionStructure.academic_units.includes('Schools')
        ) {
          data = await programmeService.admissionProgrammesByFaculty();
        } else {
          data = await programmeService.admissionProgrammesByDepartment();
        }
      } else {
        data = await programmeService.admissionProgrammesByDepartment();
      }
      http.setSuccess(200, 'grouped programmes fetch successful', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to fetch grouped programmes', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  // by faculty ..

  async getAdmissionProgrammes(req, res) {
    try {
      const result = await programmeService.admissionProgrammesByDepartment();

      http.setSuccess(200, 'Programmes fetch successful', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to fetch programmes by departments', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

module.exports = AdmissionProgrammesController;
