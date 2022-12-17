const { HttpResponse } = require('@helpers');
const {
  electivePositionService,
  programmeService,
  institutionStructureService,
} = require('@services/index');
const model = require('@models');
const { isEmpty, map, filter, includes, toUpper, isArray } = require('lodash');
const moment = require('moment');

const http = new HttpResponse();

class ElectivePositionController {
  /**
   * GET ALL ELECTIVE POSITIONS
   *
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async findAll(req, res) {
    try {
      const data = await electivePositionService.findAll({
        include: [
          {
            association: 'semester',
            attributes: ['id', 'metadata_value'],
          },
          {
            association: 'academicYear',
            attributes: ['id', 'metadata_value'],
          },
        ],
        order: [['position_code', 'desc']],
      });

      http.setSuccess(200, 'Elective position fetched successfully ', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Elective positions', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * GET ALL ELECTIVE POSITIONS
   *
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async create(req, res) {
    try {
      const { id: userId } = req.user;
      const data = req.body;

      data.user_id = userId;

      const findMaxPositionCode = await electivePositionService.findMax(
        'position_code'
      );

      let positionCode = findMaxPositionCode;

      if (!positionCode)
        positionCode = `${moment().get('year')}${String(1).padStart(7, 0)}`;
      else positionCode = parseInt(positionCode, 10) + 1;

      data.position_code = positionCode;

      if (!isEmpty(data.programmes)) {
        data.votingProgrammes = map(data.programmes, (prog) => ({
          created_by_id: userId,
          programme_id: prog,
        }));
      }

      if (!isEmpty(data.colleges)) {
        data.votingColleges = map(data.colleges, (col) => ({
          created_by_id: userId,
          college_id: col,
        }));
      }

      if (!isEmpty(data.faculties)) {
        data.votingFaculties = map(data.faculties, (fac) => ({
          created_by_id: userId,
          faculty_id: fac,
        }));
      }

      if (!isEmpty(data.departments)) {
        data.votingDepartments = map(data.departments, (dep) => ({
          created_by_id: userId,
          department_id: dep,
        }));
      }

      const response = await model.sequelize.transaction(
        async (transaction) => {
          const result = await electivePositionService.create(
            data,
            transaction
          );

          return result;
        }
      );

      http.setSuccess(200, 'Elective position saved successfully ', {
        data: response,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To save Elective position', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * FIND ONE ELECTIVE POSITION
   *
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async findOne(req, res) {
    try {
      const { id } = req.params;

      const institutionStructure =
        await institutionStructureService.findInstitutionStructureRecords();

      if (!institutionStructure)
        throw new Error('No Institution Structure has been described');

      const data = await electivePositionService.findOne({
        where: {
          id,
        },
        include: [
          {
            association: 'semester',
            attributes: ['id', 'metadata_value'],
          },
          {
            association: 'academicYear',
            attributes: ['id', 'metadata_value'],
          },
          {
            association: 'votingColleges',
            attributes: ['id', 'college_id'],
            separate: true,
            include: [
              {
                association: 'college',
                attributes: ['college_code', 'college_title'],
              },
            ],
          },
          {
            association: 'votingFaculties',
            attributes: ['id', 'faculty_id'],
            separate: true,
            include: [
              {
                association: 'faculty',
                attributes: ['faculty_code', 'faculty_title'],
              },
            ],
          },
          {
            association: 'votingDepartments',
            attributes: ['id', 'department_id'],
            separate: true,
            include: [
              {
                association: 'department',
                attributes: ['department_code', 'department_title'],
              },
            ],
          },
          {
            association: 'votingProgrammes',
            attributes: ['id', 'programme_id'],
            separate: true,
            include: [
              {
                association: 'programme',
                attributes: ['programme_code', 'programme_title'],
              },
            ],
          },
        ],
        order: [['position_code', 'desc']],
      });

      if (isEmpty(data))
        throw new Error('Invalid Elective position Id provided');

      let collegeProgrammes = [];

      const academicUnits = map(institutionStructure.academic_units, (unit) =>
        toUpper(unit)
      );

      if (includes(academicUnits, 'COLLEGES')) {
        collegeProgrammes = await programmeService.hierarchyCollegeProgrammes();
      } else if (
        includes(academicUnits, 'SCHOOLS') ||
        includes(academicUnits, 'FACULTIES')
      ) {
        collegeProgrammes = await programmeService.hierarchyFacultyProgrammes();
      } else {
        collegeProgrammes =
          await programmeService.hierarchyDepartmentProgrammes();
      }

      if (!data.all_colleges) {
        const collegeIds = map(data.votingColleges, 'college_id');

        collegeProgrammes = filter(collegeProgrammes, (col) =>
          includes(collegeIds, col.id)
        );
      }
      if (!data.all_faculties) {
        const facultyIds = map(data.votingFaculties, 'faculty_id');

        collegeProgrammes = map(collegeProgrammes, (col) => {
          return {
            ...col,
            faculties: filter(col.faculties, (fac) =>
              includes(facultyIds, fac.id)
            ),
          };
        });
      }
      if (!data.all_departments) {
        const departmentIds = map(data.votingDepartments, 'department_id');

        collegeProgrammes = map(collegeProgrammes, (col) => {
          return {
            ...col,
            faculties: map(col.faculties, (fac) => ({
              ...fac,
              departments: filter(fac.departments, (dep) =>
                includes(departmentIds, dep.id)
              ),
            })),
          };
        });
      }

      if (!data.all_programmes) {
        const programmeIds = map(data.votingProgrammes, 'programme_id');

        collegeProgrammes = map(collegeProgrammes, (col) => {
          return {
            ...col,
            faculties: map(col.faculties, (fac) => ({
              ...fac,
              departments: map(fac.departments, (dep) => ({
                ...dep,
                programmes: filter(dep.programmes, (prog) =>
                  includes(programmeIds, prog.id)
                ),
              })),
            })),
          };
        });
      }

      const resObj = {
        academicUnits: institutionStructure.academic_units,
        academicUnitProgrammes: collegeProgrammes,
        electivePosition: data,
      };

      http.setSuccess(200, 'Elective position fetched successfully ', {
        data: resObj,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Elective positions', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * FIND ONE ELECTIVE POSITION
   *
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async getEligibleProgrammeStudents(req, res) {
    try {
      const { positionId, programmeId } = req.params;

      const data = await electivePositionService.findOne({
        where: {
          id: positionId,
        },
        include: [
          {
            association: 'semester',
            attributes: ['id', 'metadata_value'],
          },
          {
            association: 'academicYear',
            attributes: ['id', 'metadata_value'],
          },
          {
            association: 'votingColleges',
            attributes: ['id', 'college_id'],
            separate: true,
            include: [
              {
                association: 'college',
                attributes: ['college_code', 'college_title'],
              },
            ],
          },
          {
            association: 'votingFaculties',
            attributes: ['id', 'faculty_id'],
            separate: true,
            include: [
              {
                association: 'faculty',
                attributes: ['faculty_code', 'faculty_title'],
              },
            ],
          },
          {
            association: 'votingDepartments',
            attributes: ['id', 'department_id'],
            separate: true,
            include: [
              {
                association: 'department',
                attributes: ['department_code', 'department_title'],
              },
            ],
          },
          {
            association: 'votingProgrammes',
            attributes: ['id', 'programme_id'],
            separate: true,
            include: [
              {
                association: 'programme',
                attributes: ['programme_code', 'programme_title'],
              },
            ],
          },
        ],
        order: [['position_code', 'desc']],
      });

      if (isEmpty(data))
        throw new Error('Invalid Elective position Id provided');

      const whereClause = {
        programme_id: programmeId,
        entry_academic_year: data.voter_entry_years,
        intake: data.voter_intakes,
        current_study_year: data.voter_study_years,
        campus: data.voter_campuses,
      };

      if (!isEmpty(data.votingColleges)) {
        const collegeIds = map(data.votingColleges, 'college_id');

        whereClause.college_id = collegeIds;
      }
      if (!isEmpty(data.votingFaculties)) {
        const facultyIds = map(data.votingFaculties, 'faculty_id');

        whereClause.faculty_id = facultyIds;
      }
      if (!data.all_departments) {
        const departmentIds = map(data.votingDepartments, 'department_id');

        whereClause.department_id = departmentIds;
      }

      const programmeIds = map(data.votingProgrammes, 'programme_id');

      if (!includes(programmeIds, programmeId) && !data.all_programmes)
        throw new Error('This Programme is not eligible to vote');

      const programmeStudents =
        await electivePositionService.findAllVotingStudents({
          where: whereClause,
          order: [
            ['surname', 'asc'],
            ['current_study_year', 'desc'],
          ],
        });

      const resObj = {
        data: programmeStudents,
      };

      http.setSuccess(200, 'Elective position fetched successfully ', {
        data: resObj,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Elective positions', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * FIND ONE ELIGIBLE
   *
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async getVerifiedVotingStudents(req, res) {
    try {
      const { positionId, programmeId } = req.params;

      const data = await electivePositionService.findAllVerifiedStudents({
        where: {
          elective_position_id: positionId,
        },
        include: [
          {
            association: 'student',
            where: {
              programme_id: programmeId,
            },
            order: [['surname', 'asc']],
          },
          {
            association: 'createdBy',
            attributes: ['id', 'surname', 'other_names', 'email', 'phone'],
          },
        ],
      });

      const formattedRes = map(data, 'student');

      http.setSuccess(200, 'Elective position fetched successfully ', {
        data: formattedRes,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Elective positions', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * FIND ONE ELIGIBLE
   *
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async markStudentsVerified(req, res) {
    try {
      const { positionId } = req.params;
      const { studentsIds } = req.body;
      const { id } = req.user;

      if (isEmpty(studentsIds) || !isArray(studentsIds))
        throw new Error('Provide list of students to be marked verified');

      const data = await electivePositionService.bulkCreateVerifiedVoters(
        map(studentsIds, (studentId) => ({
          elective_position_id: positionId,
          student_programme_id: studentId,
          created_by_id: id,
        }))
      );

      http.setSuccess(200, 'Students marked verified successfully ', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To mark students verified', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

module.exports = ElectivePositionController;
