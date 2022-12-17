const { HttpResponse } = require('@helpers/index');
const {
  programmeService,
  studentProgrammeService,
  changeOfProgrammeService,
} = require('@services/index');
const {
  studentServiceEvent,
  createChangeOfProgramme,
  changeOfProgrammeAttributes,
  generateChangeOfProgrammePRN,
  deleteChangeOfProgramme,
} = require('@controllers/Helpers/changeOfProgrammeHelper');
const { toUpper, split, map } = require('lodash');
const moment = require('moment');
const MUKDocumentHelper = require('@controllers/AcademicDocuments/MUKDocumentHelper');
const KYUDocumentHelper = require('@controllers/AcademicDocuments/KYUDocumentHelper');
const { appConfig } = require('@root/config');
const mukPdfHelper = new MUKDocumentHelper();
const kyuPdfHelper = new KYUDocumentHelper();

const http = new HttpResponse();

class ServiceController {
  async getProgrammes(req, res) {
    try {
      const programmes =
        await programmeService.programmesForChangeOfProgramme();

      http.setSuccess(200, 'Programmes', {
        data: programmes,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to load programmes.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  async getChangeOfProgrammeEvent(req, res) {
    try {
      const { id: studentId } = req.user;
      const { category } = req.query;

      if (!category) throw new Error('Provide a Service Type');

      const event = await studentServiceEvent(
        studentId,
        toUpper(split(category, '-').join(' '))
      );

      http.setSuccess(200, 'Change of Programme Event.', {
        data: { ...event, category },
      });

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable To Fetch Enrollment And Registration Events.',
        {
          error: { message: error.message },
        }
      );

      return http.send(res);
    }
  }

  async applyForChangeOfProgramme(req, res) {
    try {
      const data = req.body;
      const { id } = req.user;

      data.generated_by = 'STUDENT';

      const result = await createChangeOfProgramme(id, data);

      http.setSuccess(200, 'Application submitted Successfully', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to submit your application', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  async updateStudentChangeOfProgramme(req, res) {
    try {
      const data = req.body;
      const { id } = req.params;

      data.new_subject_comb_id = data.new_subject_comb_id || null;

      const findApplication = await changeOfProgrammeService.findOne({
        where: { id },
        raw: true,
      });

      if (!findApplication) throw new Error('Invalid Form Id');

      const response = await changeOfProgrammeService.update(id, data);

      http.setSuccess(200, 'Application updated Successfully', {
        data: response,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to update your application', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  async deleteStudentChangeOfProgramme(req, res) {
    try {
      const { id: serviceId } = req.params;
      const { id: studentId } = req.user;
      const { serviceType } = req.query;

      if (!serviceType)
        throw new Error('Provide a valid Service type to delete');

      const response = await deleteChangeOfProgramme(
        serviceId,
        studentId,
        split(serviceType, '-').join(' ').toUpperCase()
      );

      http.setSuccess(200, 'Application deleted Successfully', {
        data: response,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to delete your application', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  async getChangeOfProgrammeHistory(req, res) {
    try {
      const { id } = req.user;

      const data = await changeOfProgrammeService.findAll({
        where: {
          student_id: id,
        },
        include: changeOfProgrammeAttributes(),
      });

      http.setSuccess(200, 'Change of Programme History', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to get change of Programme History.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  async getPendingChangeOfProgramme(req, res) {
    try {
      const { id } = req.user;
      const { service } = req.query;

      if (!service) throw new Error('Provide Service type');

      const findStudentProgramme = await studentProgrammeService.findOne({
        where: {
          student_id: id,
          is_current_programme: true,
        },
        attributes: ['id'],
        raw: true,
      });

      if (!findStudentProgramme)
        throw new Error('You have no active programme');

      const category = split(service, '-').join(' ').toUpperCase();

      const data = await changeOfProgrammeService.findOne({
        where: {
          student_programme_id: findStudentProgramme.id,
          student_id: id,
          request_status: 'PENDING',
          service_type: category,
        },
        include: changeOfProgrammeAttributes(),
      });

      http.setSuccess(200, `Pending ${category}`, {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to fetch pending pending.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  async getAllPendingChangeOfProgrammes(req, res) {
    try {
      const { id } = req.user;

      const data = await changeOfProgrammeService.findAll({
        where: {
          student_id: id,
          request_status: 'PENDING',
        },
        include: changeOfProgrammeAttributes(),
      });

      http.setSuccess(200, 'All Pending Change of Programme', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to fetch all pending change of Programme.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * GENERATE PRN FOR A STUDENTS' APPLICATION
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async generateStudentServicePRN(req, res) {
    try {
      const { changeOfProgrammeId } = req.params;
      const { id: studentId } = req.user;

      await generateChangeOfProgrammePRN(changeOfProgrammeId, studentId);

      http.setSuccess(200, 'Student Service PRN Created Successfully.');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Create This Student Service PRN.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * GENERATE ACCEPTANCE LETTER FOR A STUDENTS' APPLICATION
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async generateAcceptanceLetter(req, res) {
    try {
      const { changeOfProgrammeId } = req.params;
      const { id: studentId, surname, other_names: otherNames } = req.user;

      const institution = appConfig.TAX_HEAD_CODE;

      const studentData = await changeOfProgrammeService
        .findOne({
          where: {
            id: changeOfProgrammeId,
            student_id: studentId,
          },
          include: [
            ...changeOfProgrammeAttributes(),
            {
              association: 'studentProgramme',
              attributes: [
                'id',
                'student_number',
                'registration_number',
                'subject_combination_id',
              ],
              include: [
                {
                  association: 'programme',
                  attributes: ['programme_code', 'programme_title'],
                },
                {
                  association: 'campus',
                  attributes: ['metadata_value'],
                },
                {
                  association: 'entryStudyYear',
                  attributes: ['programme_study_years'],
                },
                {
                  association: 'subjectCombination',
                  include: [
                    {
                      association: 'subjects',
                      attributes: ['id'],
                      include: [
                        {
                          association: 'subject',
                          attributes: ['subject_code'],
                        },
                      ],
                      separate: true,
                    },
                  ],
                },
              ],
            },
          ],
          plain: true,
        })
        .then((res) => (res ? res.toJSON() : null));

      let subjectComb = null;

      let newSubjectComb = null;

      if (!studentData)
        throw new Error('Unable to find your Change of Programme application');

      if (studentData.studentProgramme.subjectCombination) {
        const subjects = map(
          studentData.studentProgramme.subjectCombination.subjects,
          'subject'
        );

        subjectComb = map(subjects, 'subject_code').join('/');
      }

      if (studentData.newSubjectComb) {
        const subjects = map(studentData.newSubjectComb.subjects, 'subject');

        newSubjectComb = map(subjects, 'subject_code').join('/');
      }

      const toUpdatePayload = {
        acceptance_letter_downloaded_on: moment.now(),
        acceptance_letter_downloaded: true,
      };

      if (!studentData.student_accepted) {
        toUpdatePayload.student_accepted = true;
        toUpdatePayload.student_accepted_on = moment.now();
      }

      await changeOfProgrammeService.update(
        changeOfProgrammeId,
        toUpdatePayload
      );

      res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Access-Control-Allow-Origin': '*',
        'Content-Disposition': 'attachment; filename=out.pdf',
      });

      if (institution === 'FMUK01') {
        mukPdfHelper.printCOPAcceptanceLetter(
          { ...studentData, surname, otherNames, subjectComb, newSubjectComb },
          res
        );
      } else if (institution === 'FKYU03') {
        kyuPdfHelper.printCOPAcceptanceLetter(studentData, res);
      } else throw new Error('You Admission letter has not been added.');
    } catch (error) {
      http.setError(400, 'Unable To print your acceptance letter.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

module.exports = ServiceController;
