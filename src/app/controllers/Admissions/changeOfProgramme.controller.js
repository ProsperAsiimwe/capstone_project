const {
  changeOfProgrammeService,
  studentService,
  programmeService,
  studentProgrammeService,
} = require('@services/index');
const { HttpResponse } = require('@helpers/index');
const moment = require('moment');
const model = require('@models');
const XLSX = require('xlsx');
const {
  isArray,
  split,
  toUpper,
  includes,
  trim,
  isEmpty,
  find,
} = require('lodash');
const formidable = require('formidable');
const {
  studentServiceEvent,
  createChangeOfProgramme,
  generateChangeOfProgrammePRN,
  changeOfProgrammeAttributes,
  deleteChangeOfProgramme,
} = require('@controllers/Helpers/changeOfProgrammeHelper');
const { Op } = require('sequelize');
const {
  validateSheetColumns,
} = require('@controllers/Helpers/uploadValidator');
const { sequelize } = require('@models/');
const http = new HttpResponse();

class ChangeOfProgrammeController {
  /**
   *  GET ALL CHANGE OF PROGRAMME REQUESTS
   *
   * @param {*} req HttpRequest
   * @param {*} res HttpResponse
   * @returns JSON
   */
  async index(req, res) {
    try {
      const { service, status, academicYear } = req.query;

      if (!service || !status || !academicYear)
        throw new Error('Provide a valid context');

      const whereClause = {
        service_type: toUpper(service).trim(),
      };

      if (academicYear) {
        whereClause.academic_year_id = academicYear;
      }

      if (status && status !== 'all') {
        if (status === 'paid') whereClause.payment_status = 'T';
        if (status === 'pending') whereClause.request_status = 'PENDING';
        if (status === 'accepted') whereClause.request_status = 'ACCEPTED';
        if (status === 'approved') whereClause.request_status = 'APPROVED';
        if (status === 'unpaid') whereClause.payment_status = 'PENDING';
      }

      const data = await changeOfProgrammeService.findAll({
        where: whereClause,
        order: [['created_at', 'DESC']],
        include: [
          ...changeOfProgrammeAttributes(),
          {
            association: 'student',
            attributes: [
              'id',
              'surname',
              'other_names',
              'phone',
              'email',
              'gender',
            ],
          },
          {
            association: 'studentProgramme',
            attributes: ['id', 'student_number', 'registration_number'],
            include: [
              {
                association: 'programme',
                attributes: ['programme_code', 'programme_title'],
              },
            ],
          },
        ],
      });

      http.setSuccess(200, 'Change of Programmes.', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch all applications.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *  GET PROGRAMMES FOR CHANGE OF PROGRAMME
   *
   * @param {*} req HttpRequest
   * @param {*} res HttpResponse
   * @returns JSON
   */
  async getProgrammes(req, res) {
    try {
      const programmes =
        await programmeService.programmesForChangeOfProgramme();

      http.setSuccess(200, 'Programmes', {
        data: programmes,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch all applications.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *  GET ALL PENDING CHANGE OF PROGRAMME REQUESTS FOR A STUDENT
   *
   * @param {*} req HttpRequest
   * @param {*} res HttpResponse
   * @returns JSON
   */
  async getAllPending(req, res) {
    try {
      const data = await changeOfProgrammeService.findAll({
        where: {
          request_status: 'PENDING',
        },
        include: [
          ...changeOfProgrammeAttributes(),
          {
            association: 'student',
            attributes: [
              'id',
              'surname',
              'other_names',

              'phone',
              'email',
              'gender',
            ],
          },
          {
            association: 'studentProgramme',
            attributes: ['id', 'student_number', 'registration_number'],
            include: [
              {
                association: 'programme',
                attributes: ['programme_code', 'programme_title'],
              },
            ],
          },
        ],
      });

      http.setSuccess(200, 'Change of Programme Event.', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch all pending applications.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *  GET CURRENT CHANGE OF PROGRAMME EVENT FOR A STUDENT
   *
   * @param {*} req HttpRequest
   * @param {*} res HttpResponse
   * @returns JSON
   */
  async getEvent(req, res) {
    try {
      const { studentId } = req.params;
      const { service } = req.query;

      if (!service) throw new Error('Provide a Service Type');

      const event = await studentServiceEvent(
        studentId,
        toUpper(split(service, '-').join(' '))
      );

      http.setSuccess(200, 'Change of Programme Event.', {
        data: event,
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

  /**
   * CREATE NEW STUDENT CHANGE OF PROGRAMME REQUEST
   *
   * @param {*} req HttpRequest
   * @param {*} res HttpResponse
   * @returns JSON
   */
  async create(req, res) {
    try {
      const { studentId } = req.params;
      const data = req.body;
      const { id } = req.user;

      data.generated_by = 'STAFF';
      data.staff_created_id = id;

      const result = await createChangeOfProgramme(studentId, data);

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

  /**
   * GENERATE STUDENT PAYMENT REFERENCE NUMBER FOR CHANGE OF PROGRAMME
   *
   * @param {*} req any
   * @param {*} res any
   * @returns json
   */
  async generatePRN(req, res) {
    try {
      const { changeOfProgrammeId } = req.params;

      await generateChangeOfProgrammePRN(changeOfProgrammeId);

      http.setSuccess(200, 'Reference Number submitted Successfully');

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable to generate Reference Number for this application',
        {
          error: { message: error.message },
        }
      );

      return http.send(res);
    }
  }

  /**
   * EDIT CHANGE OF PROGRAMME ACADEMIC YEAR
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async editAcademicYear(req, res) {
    const { changeOfProgrammeIds, academic_year_id: acadYear } = req.body;

    try {
      await model.sequelize.transaction(async (transaction) => {
        if (isArray(changeOfProgrammeIds)) {
          for (const changeOfProgrammeId of changeOfProgrammeIds) {
            const changeOfProg = await changeOfProgrammeService.findOne({
              where: {
                id: changeOfProgrammeId,
              },
              raw: true,
            });

            if (changeOfProg) {
              await changeOfProgrammeService.update(
                changeOfProg.id,
                { academic_year_id: acadYear },
                transaction
              );
            }
          }
        }
      });

      http.setSuccess(
        200,
        `Change Of Programme Academic Year Updated Successfully.`
      );

      return http.send(res);
    } catch (error) {
      http.setError(400, `Unable To Update Change Of Programme Academic Year`, {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * ACCEPT STUDENT CHANGE OF PROGRAMME
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async acceptOrDecline(req, res) {
    const { changeOfProgrammeIds, request_status: requestStatus } = req.body;

    try {
      const { id } = req.user;

      if (!includes(['DECLINED', 'ACCEPTED'], requestStatus))
        throw new Error('INVALID APPLICATION STATUS PROVIDED');

      const updateChangeOfProg = {
        staff_approval_by: id,
        request_status: requestStatus,
        staff_has_approved: true,
        staff_approved_on: moment.now(),
      };

      const result = await model.sequelize.transaction(async (transaction) => {
        if (isArray(changeOfProgrammeIds)) {
          for (const changeOfProgrammeId of changeOfProgrammeIds) {
            const changeOfProg = await changeOfProgrammeService.findOne({
              where: {
                id: changeOfProgrammeId,
              },
              raw: true,
            });

            if (changeOfProg) {
              const oldStudentProgramme =
                await studentService.findOneStudentProgramme({
                  where: {
                    id: changeOfProg.student_programme_id,
                    student_id: changeOfProg.student_id,
                  },
                  raw: true,
                });

              if (changeOfProg.request_status === 'APPROVED') {
                throw new Error(
                  `Change of Programme for: ${oldStudentProgramme.student_number} has been approved`
                );
              } else if (changeOfProg.request_status !== 'PENDING') {
                throw new Error(
                  `Only Pending applications can be ${requestStatus}: Record ${oldStudentProgramme.student_number} is ${changeOfProg.request_status}`
                );
              } else if (
                changeOfProg.requires_payment === true &&
                changeOfProg.paid !== changeOfProg.amount &&
                requestStatus === 'ACCEPTED'
              ) {
                throw new Error(
                  `Student: ${
                    oldStudentProgramme.student_number
                  } is required to pay ${parseInt(
                    changeOfProg.amount,
                    10
                  ).toLocaleString()} ${
                    changeOfProg.currency
                  } and has paid ${parseInt(
                    changeOfProg.paid,
                    10
                  ).toLocaleString()} ${changeOfProg.currency}`
                );
              }

              await changeOfProgrammeService.update(
                changeOfProg.id,
                updateChangeOfProg,
                transaction
              );
            }
          }
        }
      });

      http.setSuccess(
        200,
        `Student applications ${requestStatus} Successfully.`,
        {
          data: result,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(400, `Unable To ${requestStatus} Student applications.`, {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * APPROVE STUDENT CHANGE OF PROGRAMME
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async approve(req, res) {
    try {
      const { id } = req.user;
      const { changeOfProgrammeIds } = req.body;
      const random = Math.floor(Math.random() * moment().unix());
      const generatedBatchNumber = `BATCH-${random}`;

      const updateChangeOfProg = {
        request_approved_by_id: id,
        request_status: 'APPROVED',
        request_approval_date: moment.now(),
      };

      const result = await model.sequelize.transaction(async (transaction) => {
        if (isArray(changeOfProgrammeIds)) {
          for (const changeOfProgrammeId of changeOfProgrammeIds) {
            const changeOfProg = await changeOfProgrammeService.findOne({
              where: {
                id: changeOfProgrammeId,
              },
              raw: true,
            });

            if (changeOfProg) {
              const oldStudentProgramme =
                await studentService.findOneStudentProgramme({
                  where: {
                    id: changeOfProg.student_programme_id,
                    student_id: changeOfProg.student_id,
                  },
                  raw: true,
                });

              if (changeOfProg.request_status === 'APPROVED') {
                throw new Error(
                  `Change of Programme for: ${oldStudentProgramme.student_number} has been approved`
                );
              } else if (changeOfProg.request_status !== 'ACCEPTED') {
                throw new Error(
                  `You can only approve Accepted applications: ${oldStudentProgramme.student_number} is ${changeOfProg.request_status}`
                );
              } else if (
                changeOfProg.requires_payment === true &&
                changeOfProg.paid !== changeOfProg.amount
              ) {
                throw new Error(
                  `Student: ${
                    oldStudentProgramme.student_number
                  } is required to pay ${parseInt(
                    changeOfProg.amount,
                    10
                  ).toLocaleString()} ${
                    changeOfProg.currency
                  } and has paid ${parseInt(
                    changeOfProg.paid,
                    10
                  ).toLocaleString()} ${changeOfProg.currency}`
                );
              }

              if (
                toUpper(changeOfProg.service_type).includes(
                  'CHANGE OF PROGRAMME'
                ) ||
                oldStudentProgramme.id !== changeOfProg.id
              ) {
                delete oldStudentProgramme.id;

                // SET PREVIOUS PROGRAMMES TO NOT CURRENT
                await studentService.update(
                  { student_id: oldStudentProgramme.student_id },
                  { is_current_programme: false },
                  transaction
                );

                const studentProgrammeData = {
                  ...oldStudentProgramme,
                  programme_id: changeOfProg.new_programme_id,
                  programme_type_id: changeOfProg.new_programme_type_id,
                  programme_version_id: changeOfProg.new_programme_version_id,
                  subject_combination_id: changeOfProg.new_subject_comb_id,
                  entry_academic_year_id: changeOfProg.academic_year_id,
                  entry_study_year_id: changeOfProg.new_study_year_id,
                  current_study_year_id: changeOfProg.new_study_year_id,
                  campus_id: changeOfProg.new_campus_id,
                  is_current_programme: true,
                  created_by_id: id,
                  approvals: {
                    created_by_id: id,
                    batch_number: generatedBatchNumber,
                    upload_type: changeOfProg.service_type,
                  },
                };

                await studentService.createStudentProgrammeByChangeOfProgramme(
                  studentProgrammeData,
                  transaction
                );
              } else {
                let dataToUpdate = {
                  subject_combination_id: changeOfProg.new_subject_comb_id,
                  programme_type_id: changeOfProg.new_programme_type_id,
                  campus_id: changeOfProg.new_campus_id,
                };

                if (toUpper(changeOfProg.service_type).includes('STUDY TIME')) {
                  dataToUpdate = {
                    programme_type_id: changeOfProg.new_programme_type_id,
                  };
                }

                await studentService.updateStudentProgramme(
                  oldStudentProgramme.id,
                  dataToUpdate,
                  transaction
                );
              }

              await changeOfProgrammeService.update(
                changeOfProg.id,
                updateChangeOfProg,
                transaction
              );
            }
          }
        }
      });

      http.setSuccess(200, 'Student applications Approved Successfully.', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Approve This Student applications.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  async deleteStudentChangeOfProgrammeByStaff(req, res) {
    try {
      const { serviceId, studentId } = req.params;
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

  async updateApproveBy(req, res) {
    try {
      const findNotUpdatedRecords = await changeOfProgrammeService.findAll({
        where: {
          request_status: 'ACCEPTED',
          staff_accepted_on: null,
          staff_has_accepted: false,
          staff_accepted_by: null,
          staff_approved_on: {
            [Op.not]: null,
          },
        },
        attributes: [
          'id',
          'staff_approved_on',
          'staff_has_approved',
          'staff_approval_by',
        ],
      });

      if (findNotUpdatedRecords) {
        for (const record of findNotUpdatedRecords) {
          await changeOfProgrammeService.update(record.id, {
            staff_has_accepted: record.staff_has_approved,
            staff_accepted_by: record.staff_approval_by,
            staff_accepted_on: record.staff_approved_on,
          });
        }
      }

      http.setSuccess(200, 'Updated', {
        records: findNotUpdatedRecords,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to Update applications', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  async updateApprovedProgrammeVersions(req, res) {
    try {
      const findAllApprovedStudents = await changeOfProgrammeService.findAll({
        where: {
          student_programme_id: {
            [Op.ne]: sequelize.col('new_programme_id'),
          },
        },
        attributes: [
          'id',
          'new_programme_id',
          'new_programme_version_id',
          'student_id',
          'staff_has_approved',
          'staff_approval_by',
        ],
        include: {
          association: 'newProgramme',
          attributes: ['id'],
          include: [
            {
              association: 'versions',
              where: {
                is_current_version: true,
              },
              attributes: ['id'],
            },
          ],
        },
        raw: true,
        nested: true,
      });

      const updatedApplications = [];

      let updatedStudentProgrammes = [];

      if (findAllApprovedStudents) {
        updatedStudentProgrammes = await model.sequelize.transaction(
          async (transaction) => {
            const updated = [];

            for (const record of findAllApprovedStudents) {
              if (
                parseInt(record.new_programme_version_id, 10) !==
                parseInt(record['newProgramme.versions.id'], 10)
              ) {
                const updateApplication = await changeOfProgrammeService.update(
                  record.id,
                  {
                    new_programme_version_id:
                      record['newProgramme.versions.id'],
                  },
                  transaction
                );

                const updateRecord = await studentProgrammeService.update(
                  {
                    programme_id: record.new_programme_id,
                    student_id: record.student_id,
                    is_current_programme: true,
                  },
                  {
                    programme_version_id: record['newProgramme.versions.id'],
                  },
                  transaction
                );

                updated.push(updateRecord);
                updatedApplications.push(updateApplication);
              }
            }

            return updated;
          }
        );
      }

      http.setSuccess(200, 'Updated', {
        updatedApplications: updatedApplications.length,
        updatedStudentProgrammes,
        number: findAllApprovedStudents.length,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to Update applications', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  async updateActivateApprovedProgrammes(req, res) {
    try {
      const findAllApprovedStudents = await changeOfProgrammeService.findAll({
        where: {
          student_programme_id: {
            [Op.ne]: sequelize.col('new_programme_id'),
          },
          staff_has_approved: true,
        },
        attributes: [
          'id',
          'new_programme_id',
          'new_programme_version_id',
          'student_id',
          'staff_has_approved',
          'staff_approval_by',
        ],
        include: {
          association: 'newProgramme',
          attributes: ['id'],
          include: [
            {
              association: 'versions',
              where: {
                is_current_version: true,
              },
              attributes: ['id'],
            },
          ],
        },
        raw: true,
        nested: true,
      });

      let updatedStudentProgrammes = [];

      if (findAllApprovedStudents) {
        updatedStudentProgrammes = await model.sequelize.transaction(
          async (transaction) => {
            const updated = [];

            for (const record of findAllApprovedStudents) {
              if (
                parseInt(record.new_programme_version_id, 10) ===
                parseInt(record['newProgramme.versions.id'], 10)
              ) {
                const findRecord = await studentProgrammeService.findOne({
                  where: {
                    programme_id: record.new_programme_id,
                    student_id: record.student_id,
                    is_current_programme: false,
                  },
                });

                if (findRecord) {
                  const updateRecord = await studentProgrammeService.update(
                    {
                      programme_id: record.new_programme_id,
                      student_id: record.student_id,
                      is_current_programme: false,
                    },
                    {
                      is_current_programme: true,
                    },
                    transaction
                  );

                  await studentProgrammeService.update(
                    {
                      programme_id: {
                        [Op.ne]: record.new_programme_id,
                      },
                      student_id: record.student_id,
                      is_current_programme: true,
                    },
                    {
                      is_current_programme: false,
                    },
                    transaction
                  );

                  updated.push(updateRecord);
                }
              }
            }

            return updated;
          }
        );
      }

      http.setSuccess(200, 'Updated', {
        number: findAllApprovedStudents.length,
        updatedStudentProgrammes,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to Update applications', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  async bulkAcceptance(req, res) {
    try {
      const { id: userId } = req.user;

      const form = new formidable.IncomingForm();

      const programmes = await programmeService.findAllProgrammes({
        attributes: ['id', 'programme_code'],
        raw: true,
      });

      const updatedApplications = [];
      const unUpdatedApplications = [];
      const notPaidApplications = [];
      const notMatchingProgrammes = [];

      form.parse(req, async (err, fields, files) => {
        if (err) {
          http.setError(400, 'Unable to update Student names.', {
            error: { err },
          });

          return http.send(res);
        }

        const file = files[Object.keys(files)[0]];
        const workbook = XLSX.readFile(file.filepath, { cellDates: true });
        const subjectCombSheet = workbook.SheetNames[0];
        const acceptedApplications = XLSX.utils.sheet_to_json(
          workbook.Sheets[subjectCombSheet]
        );

        if (isEmpty(acceptedApplications)) {
          http.setError(400, 'Cannot upload an Empty template.');

          return http.send(res);
        }

        await model.sequelize.transaction(async (transaction) => {
          for (const application of acceptedApplications) {
            const studentNumber = trim(application['STUDENT NUMBER']);
            const regNumber = trim(application['REG NUMBER']);

            if (!studentNumber && !regNumber)
              throw new Error(`Enter student number or registration number`);

            validateSheetColumns(
              application,
              ['PROGRAMME CODE'],
              studentNumber || regNumber
            );

            const findStudent = await studentService.findByRegNoOrStudentNo(
              studentNumber || regNumber
            );

            if (!findStudent)
              throw new Error(`Invalid student number ${studentNumber}`);

            const programmeCode = trim(
              application['PROGRAMME CODE']
            ).toUpperCase();

            const findProgramme = find(
              programmes,
              (p) => toUpper(p.programme_code) === programmeCode
            );

            if (!findProgramme)
              throw new Error(`Programme code ${programmeCode} does not exist`);

            const findApplication = await changeOfProgrammeService.findOne({
              where: {
                student_id: findStudent.student_id,
                staff_approval_by: null,
                staff_has_approved: false,
                staff_accepted_by: null,
                staff_has_accepted: false,
                request_status: {
                  [Op.ne]: 'ACCEPTED',
                },
              },
              raw: true,
            });

            if (findApplication) {
              if (findApplication.balance > 0)
                notMatchingProgrammes.push(studentNumber || regNumber);
              else if (findApplication.new_programme_id !== findProgramme.id)
                notMatchingProgrammes.push(studentNumber || regNumber);
              else {
                let updateChangeOfProg = {
                  staff_accepted_by: userId,
                  request_status: 'ACCEPTED',
                  staff_has_accepted: true,
                  staff_accepted_on: moment.now(),
                };

                if (findApplication.request_status === 'APPROVED') {
                  updateChangeOfProg = {
                    staff_has_accepted: true,
                    staff_accepted_on: moment.now(),
                  };
                }

                const updatedApplication = await changeOfProgrammeService
                  .update(findApplication.id, updateChangeOfProg, transaction)
                  .catch((e) => {
                    if (e) throw new Error(e.message);
                  });

                updatedApplications.push(updatedApplication);
              }
            } else unUpdatedApplications.push(studentNumber || regNumber);
          }
        });

        http.setSuccess(200, 'Applicant Names updated successfully', {
          unAffectedRecords: unUpdatedApplications.length,
          notPaidApplicationsNo: notPaidApplications.length,
          notMatchingProgrammesNo: notMatchingProgrammes.length,
          affectedApplicationRecords: updatedApplications.length,
          unUpdatedApplications,
          notPaidApplications,
          notMatchingProgrammes,
          updatedApplications,
        });

        return http.send(res);
      });
    } catch (error) {
      http.setError(400, 'Unable to update Applicant Names', {
        error: error.message,
      });

      return http.send(res);
    }
  }
}

module.exports = ChangeOfProgrammeController;
