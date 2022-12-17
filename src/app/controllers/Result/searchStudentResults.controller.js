const {
  getStudentSemesterResults,
} = require('@controllers/Helpers/semesterResultsHelper');

const { HttpResponse } = require('@helpers');
const {
  resultAllocationNodeService,
  graduationListService,
  resultService,
} = require('@services/index');
const { flattenDeep, isEmpty } = require('lodash');
const { map, countBy } = require('lodash');

const http = new HttpResponse();

class searchStudentResultsController {
  // testimonial results  ...

  async testimonialResultView(req, res) {
    try {
      if (
        !req.query.student ||
        !req.query.programme_id ||
        !req.query.campus_id ||
        !req.query.intake_id
      ) {
        throw new Error('Invalid Context Provided');
      }

      const context = req.query;

      const studentData = await graduationListService.searchSingleStudent(
        context
      );

      if (!studentData) {
        throw new Error('Academic Record Does Not Exist.');
      }

      // student finale year ..
      const programmeData = { programme_id: studentData.programme_id };

      //  maxProgrammeStudyYear
      const finalStudyYear = await graduationListService.maxProgrammeStudyYear(
        programmeData
      );

      let comment = '';

      let studentEntryAcademicYear = '';

      let studentCourse = {};

      let studentResults = [];

      if (studentData.programme_id !== req.query.programme_id) {
        comment = `This Student Doesn't Belong To This Programme`;
      } else if (
        finalStudyYear.programme_study_year_id !==
        studentData.metadata_study_year_id
      ) {
        comment = `This Student Is not Eligible To Graduate.The Student Is Currently In ${studentData.current_study_year}`;
        // } else if (studentData.has_completed === true) {
        //   comment = `This Student Already Graduated.`; // academic_year
      } else if (
        studentData.on_provisional_list === true &&
        studentData.academic_year !== null
      ) {
        comment = `This Student  Has Already Been  added To The Provisional List, P.Academic Year ${studentData.academic_year}`;
      } else if (
        studentData.on_graduation_list === true &&
        studentData.academic_year !== null
      ) {
        comment = `This Student Has Already Been  added To The Graduation List, G.Academic Year ${studentData.academic_year}`;
      } else {
        const stdGrades = await resultService
          .findAllStudentGrades({
            where: { student_programme_id: studentData.student_programme_id },
            attributes: [
              'id',
              'cgpa',
              'remark',
              'retake_courses',
              'cumulative_tcu',
            ],
            raw: true,
          })
          .catch((e) => {
            if (e) throw new Error(e.message);
          });

        if (isEmpty(stdGrades)) {
          throw new Error('Student Results Not Computed.');
        }

        if (
          stdGrades
            .map((o) => o.remark === 'NP' || o.remark === 'CP')
            .some((e) => e === false)
        ) {
          throw new Error('This Student Is Not On Normal Progress.');
        }

        const coreCourses = await graduationListService.versionCoreCourse(
          studentData
        );

        const versionCoreCount = countBy(
          map(coreCourses, 'course_unit_category')
        );

        const results =
          await resultAllocationNodeService.studentResultsFunction(
            studentData.registration_number
          );

        const resultData = flattenDeep(map(results, 'results'));

        const resultCourseCount = countBy(
          map(resultData, 'course_unit_category')
        );

        const newResult = await getStudentSemesterResults(
          studentData.registration_number
        );

        if (!newResult) {
          throw new Error(
            'This Student Has No Results Uploaded To The System.'
          );
        }

        if (resultCourseCount.CORE < versionCoreCount.CORE) {
          throw new Error(
            `This Student Has  not Completed all the CORE courses RESULTS:  ${resultCourseCount.CORE} <   ${versionCoreCount.CORE} - Version Courses`
          );
        }

        const studentTotalCreditUnits =
          newResult.semesters[newResult.semesters.length - 1].cumulative_tcu;

        studentResults = newResult;

        studentCourse = {
          versionCoreCount,
          resultCourseCount,
          studentTotalCreditUnits,
        };
        comment = `STUDENT CLEARED`;
        studentEntryAcademicYear = studentData.entry_academic_year;
      }

      let graduationLoad = null;

      if (studentData.programme_version_plan_id === null) {
        const entryYearContext = {
          programme_version_id: studentData.programme_version_id,
          student_entry_year_id: studentData.student_entry_year_id,
        };

        graduationLoad = await graduationListService.entryYearGraduationLoad(
          entryYearContext
        );
      } else {
        const planContext = {
          programme_version_id: studentData.programme_version_id,
          programme_version_plan_id: studentData.programme_version_plan_id,
        };

        graduationLoad = await graduationListService.planGraduationLoad(
          planContext
        );
      }

      if (
        studentCourse.studentTotalCreditUnits < graduationLoad.graduation_load
      ) {
        throw new Error(
          `This Student Has  not Completed all courses STD Load:  ${studentCourse.studentTotalCreditUnits} <   ${graduationLoad.graduation_load} - Version Load`
        );
      }

      const data = {
        comment,
        studentCourse,
        studentResults,
        student_entry_academic_year: studentEntryAcademicYear,
        graduationLoad,
      };

      http.setSuccess(200, 'Student  Results fetched successfully ', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Student Results', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

module.exports = searchStudentResultsController;
