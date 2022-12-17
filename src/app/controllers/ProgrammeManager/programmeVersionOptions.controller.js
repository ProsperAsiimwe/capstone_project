const { HttpResponse } = require('@helpers');
const { programmeVersionService } = require('@services/index');
const { isEmpty } = require('lodash');

const http = new HttpResponse();

class ProgrammeVersionOptionsController {
  /**
   * version  options
   * @param {*} req
   * @param {*} res
   */
  async versionOptionsFunction(req, res) {
    try {
      const { versionId } = req.params;
      const programmeVersion =
        await programmeVersionService.findOneProgrammeVersion({
          where: { id: versionId },
        });
      const { versionOption } = req.query;
      const context = req.query;
      let data = {};

      if (isEmpty(programmeVersion)) {
        throw new Error('Programme Version Not Found.');
      }

      if (isEmpty(versionOption)) {
        throw new Error('No Version Option key word Provided');
      }

      if (versionOption === 'plans') {
        data = await programmeVersionService.versionPlanOptions(versionId);
      } else if (versionOption === 'specializations') {
        data = await programmeVersionService.versionSpecializationOptions(
          versionId
        );
      } else if (versionOption === 'modules') {
        data = await programmeVersionService.versionModuleOptions(versionId);
      } else if (versionOption === 'subjectCombinations') {
        data = await programmeVersionService.studentSubjectCombination(context);
      } else {
        throw new Error(`Invalid version option ${versionOption}`);
      }

      http.setSuccess(
        200,
        `Programme version ${versionOption} fetched successfully`,
        {
          data,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(400, error.message);

      return http.send(res);
    }
  }
}

module.exports = ProgrammeVersionOptionsController;
