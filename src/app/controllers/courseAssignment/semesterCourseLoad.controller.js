const HttpResponse = require('@helpers/http-response');
const { semesterCourseLoadService } = require('@services/index');
const { map, forEach } = require('lodash');
const models = require('@models');

const http = new HttpResponse();

class SemesterCourseLoadController {
  async getContextLoads(req, res) {
    try {
      const {
        academic_year_id: academicYear,
        semester_id: semester,
        programme_id: programme,
        programme_study_year_id: studyYear,
      } = req.query;

      const data = await semesterCourseLoadService.findOneRecord({
        where: {
          programme_id: programme,
          academic_year_id: academicYear,
          programme_study_year_id: studyYear,
          semester_id: semester,
        },
        // include: { all: true },
        include: [
          {
            association: 'semesterLoads',
            separate: true,
            attributes: ['id', 'maximum_courses', 'minimum_courses'],
            include: [
              {
                association: 'courseCategory',
                attributes: ['id', 'metadata_value'],
              },
            ],
          },
          {
            association: 'semester',
            attributes: ['metadata_value'],
          },
          {
            association: 'academicYear',
            attributes: ['metadata_value'],
          },
          {
            association: 'studyYear',
            attributes: ['programme_study_years'],
          },
          {
            association: 'programme',
            attributes: ['id', 'programme_code', 'programme_title'],
          },
          {
            association: 'createdBy',
            attributes: ['id', 'surname', 'other_names'],
          },
        ],
      });

      http.setSuccess(200, 'Semester course Loads', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To get semester course loads', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  async createSemesterLoads(req, res) {
    try {
      const { id: userId } = req.user;
      const data = req.body;

      const semesterLoads = map(data.semesterLoads, (sl) => ({
        ...sl,
        created_by_id: userId,
      }));

      const academicYears = map(data.academic_years, (aYid) => ({
        academic_year_id: aYid,
        created_by_id: userId,
        programme_id: data.programme_id,
      }));

      const studyYearAcademicYears = [];

      forEach(data.programme_study_years, (element) => {
        forEach(academicYears, (acY) => {
          studyYearAcademicYears.push({
            ...acY,
            programme_study_year_id: element,
          });
        });
      });

      const allSemesterContexts = [];

      forEach(data.semesters, (semester) => {
        forEach(studyYearAcademicYears, (acY) => {
          allSemesterContexts.push({
            ...acY,
            semester_id: semester,
            semesterLoads,
          });
        });
      });

      const result = await models.sequelize.transaction(async (transaction) => {
        const created = [];

        for (const semesterContext of allSemesterContexts) {
          const res = await semesterCourseLoadService.findOrCreate(
            semesterContext,
            transaction
          );

          created.push(res);
        }

        return created;
      });

      http.setSuccess(200, 'Semester course Loads created successfully', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Create this semester course loads', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  async updateContextValues(req, res) {
    try {
      const { id: userId } = req.user;
      const { contextId } = req.params;
      const data = req.body;

      const payloads = map(data.semesterLoads, (load) => ({
        ...load,
        last_updated_by_id: userId,
        semester_course_load_context_id: contextId,
      }));

      const result = await models.sequelize.transaction(async (transaction) => {
        const updated = [];

        for (const payload of payloads) {
          const update = await semesterCourseLoadService.updateOrCreateValues(
            payload,
            {
              semester_course_load_context_id:
                payload.semester_course_load_context_id,
              course_category_id: payload.course_category_id,
            },
            transaction
          );

          updated.push(update);
        }

        return updated;
      });

      http.setSuccess(200, 'Semester course Loads updated successfully', {
        data: result,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Update this semester course loads', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

module.exports = SemesterCourseLoadController;
