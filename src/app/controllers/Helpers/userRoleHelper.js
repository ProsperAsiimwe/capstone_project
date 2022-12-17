const { metadataService } = require('@services/');
const { departmentService } = require('@services/');
const { collegeService } = require('@services/');
const { facultyService } = require('@services/');
const { userRoleGroupService } = require('@services/');
const { programmeService } = require('@services/');
const { isEmpty, map, trim, toUpper } = require('lodash');

const getUserRoleBoundValues = async (context) => {
  const data = await userRoleGroupService.userBoundValueFunctions(context);

  if (!isEmpty(data)) {
    for (const key in data) {
      if (Object.hasOwnProperty.call(data, key)) {
        const element = data[key];

        element.bound_level = trim(toUpper(element.bound_level));

        if (element.has_access_to_all === true) {
          if (trim(toUpper(element.bound_level)) === 'PROGRAMMES') {
            const programmes = await programmeService.findAllProgrammes({
              attributes: [
                ['id', 'programme_id'],
                'programme_code',
                'programme_title',
              ],
              raw: true,
            });

            element.programmes = programmes;
            delete element.colleges;
            delete element.campuses;
            delete element.faculties;
            delete element.departments;
          } else if (trim(toUpper(element.bound_level)) === 'CAMPUSES') {
            const campuses = await metadataService
              .findOneMetadata({
                where: {
                  metadata_name: 'CAMPUSES',
                },
                attributes: ['id', 'metadata_name'],
                include: {
                  association: 'metadataValues',
                  separate: true,
                  attributes: ['metadata_value', 'id'],
                },
              })
              .then((res) => {
                const responseData = res ? res.toJSON() : [];

                return map(responseData.metadataValues, (campus) => ({
                  campus: campus.metadata_value,
                  campus_id: campus.id,
                }));
              });

            element.campuses = campuses;
            delete element.colleges;
            delete element.programmes;
            delete element.faculties;
            delete element.departments;
          } else if (
            element.bound_level === 'FACULTIES' ||
            element.bound_level === 'SCHOOLS'
          ) {
            const faculties = await facultyService.findAllFaculties({
              attributes: [
                ['id', 'faculty_id'],
                'faculty_code',
                'faculty_title',
              ],
              raw: true,
            });

            element.faculties = faculties;
            delete element.colleges;
            delete element.campuses;
            delete element.programmes;
            delete element.departments;
          } else if (trim(toUpper(element.bound_level)) === 'DEPARTMENTS') {
            const departments = await departmentService.findAllDepartments({
              attributes: [
                ['id', 'department_id'],
                'department_code',
                'department_title',
              ],
              raw: true,
            });

            element.departments = departments;
            delete element.colleges;
            delete element.campuses;
            delete element.programmes;
            delete element.faculties;
          } else if (trim(toUpper(element.bound_level)) === 'COLLEGES') {
            const colleges = await collegeService.findAllColleges({
              attributes: [
                ['id', 'college_id'],
                'college_code',
                'college_title',
              ],
              raw: true,
            });

            element.colleges = colleges;
            delete element.programmes;
            delete element.campuses;
            delete element.faculties;
            delete element.departments;
          }
        } else {
          if (trim(toUpper(element.bound_level)) === 'PROGRAMMES') {
            delete element.colleges;
            delete element.campuses;
            delete element.faculties;
            delete element.departments;
          } else if (trim(toUpper(element.bound_level)) === 'CAMPUSES') {
            delete element.colleges;
            delete element.programmes;
            delete element.faculties;
            delete element.departments;
          } else if (
            element.bound_level === 'FACULTIES' ||
            element.bound_level === 'SCHOOLS'
          ) {
            delete element.colleges;
            delete element.campuses;
            delete element.programmes;
            delete element.departments;
          } else if (trim(toUpper(element.bound_level)) === 'DEPARTMENTS') {
            delete element.colleges;
            delete element.campuses;
            delete element.programmes;
            delete element.faculties;
          } else if (trim(toUpper(element.bound_level)) === 'COLLEGES') {
            delete element.programmes;
            delete element.campuses;
            delete element.faculties;
            delete element.departments;
          }
        }
      }
    }
  }

  return data;
};

module.exports = { getUserRoleBoundValues };
