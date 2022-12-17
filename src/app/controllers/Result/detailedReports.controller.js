const { HttpResponse } = require('@helpers');
const {
  reportsService,
  programmeService,
  institutionStructureService,
  metadataValueService,
} = require('@services/index');
const { orderBy, isEmpty, includes, join } = require('lodash');
const ExcelJS = require('exceljs');
const { uniqBy, flatten, groupBy, map, now, toUpper } = require('lodash');
const fs = require('fs');
const {
  getMetadataValueName,
} = require('@controllers/Helpers/programmeHelper');

const http = new HttpResponse();

class DetailedReportController {
  //  result report
  async detailedReportFunction(req, res) {
    try {
      const context = req.query;

      if (
        !context.campus_id ||
        !context.intake_id ||
        !context.programme_id ||
        !context.academic_year_id ||
        !context.study_year_id ||
        !context.semester_id
      ) {
        throw new Error('Invalid Context Provided');
      }
      const metadataValues = await metadataValueService.findAllMetadataValues({
        attributes: ['metadata_value', 'id'],
        include: 'metadata',
      });
      const semester = await getMetadataValueName(
        metadataValues,
        context.semester_id,
        'SEMESTERS',
        'SELECTED RESULT CONTEXT'
      );
      const studyYear = await getMetadataValueName(
        metadataValues,
        context.study_year_id,
        'STUDY YEARS',
        'SELECTED RESULT CONTEXT'
      );

      context.MetadataSemester = semester;
      context.MetadataStudyYear = studyYear;

      const { groupedData, courseUnits } = await getGroupedResults(context);

      const results = [];

      Object.keys(groupedData).forEach((resultCategory, index) => {
        let order = index;

        if (includes(toUpper(resultCategory), 'V')) order = 1;
        else if (includes(toUpper(resultCategory), 'D')) order = 2;
        else if (includes(toUpper(resultCategory), 'G')) order = 3;
        else order = 3 + ++index;

        results.push({
          category: resultCategory,
          order,
          students: groupedData[resultCategory].map((student) => {
            const studentScores = [];
            const courseScores = courseUnits.map((course) => {
              const findResult = student.results.find(
                (result) => result.course_unit_code === course.code
              );

              if (findResult) {
                studentScores.push({
                  ...course,
                  ...findResult,
                  cumulative_tws: parseFloat(findResult.cumulative_tws).toFixed(
                    2
                  ),
                  previous_ctws: parseFloat(findResult.previous_ctws).toFixed(
                    2
                  ),
                  final_mark: parseFloat(findResult.final_mark).toFixed(1),
                  grading_point: parseFloat(findResult.grading_point).toFixed(
                    1
                  ),
                });

                return {
                  [course.code]: {
                    ...course,
                    ...findResult,
                    cumulative_tws: parseFloat(
                      findResult.cumulative_tws
                    ).toFixed(2),
                    previous_ctws: parseFloat(findResult.previous_ctws).toFixed(
                      2
                    ),
                    final_mark: parseFloat(findResult.final_mark).toFixed(1),
                    grading_point: parseFloat(findResult.grading_point).toFixed(
                      1
                    ),
                  },
                };
              }

              return null;
            });

            student.courseScores = studentScores;

            delete student.results;

            return Object.assign({}, student, ...courseScores);
          }),
        });
      });

      http.setSuccess(200, 'Result Detailed Report fetched successfully', {
        data: { courseUnits, results: orderBy(results, ['order']) },
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Result Detailed Report', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  async downloadDetailedResults(req, res) {
    try {
      const context = req.query;
      const { user } = req;

      if (
        !context.campus_id ||
        !context.intake_id ||
        !context.programme_id ||
        !context.academic_year_id ||
        !context.study_year_id ||
        !context.semester_id
      ) {
        throw new Error('Invalid Context Provided');
      }

      const institutionStructure =
        await institutionStructureService.findInstitutionStructureRecords({
          attributes: ['institution_name', 'institution_logo'],
        });
      const findProgramme = await programmeService.findOneProgramme({
        where: { id: context.programme_id },
        raw: true,
      });
      const metadataValues = await metadataValueService.findAllMetadataValues({
        attributes: ['metadata_value', 'id'],
        include: 'metadata',
      });

      const campus = await getMetadataValueName(
        metadataValues,
        context.campus_id,
        'CAMPUSES',
        'SELECTED RESULT CONTEXT'
      );
      const intake = await getMetadataValueName(
        metadataValues,
        context.intake_id,
        'INTAKES',
        'SELECTED RESULT CONTEXT'
      );
      const semester = await getMetadataValueName(
        metadataValues,
        context.semester_id,
        'SEMESTERS',
        'SELECTED RESULT CONTEXT'
      );
      const studyYear = await getMetadataValueName(
        metadataValues,
        context.study_year_id,
        'STUDY YEARS',
        'SELECTED RESULT CONTEXT'
      );

      context.MetadataSemester = semester;
      context.MetadataStudyYear = studyYear;

      if (!findProgramme) throw new Error('Invalid Programme Selected');

      const { groupedData, courseUnits } = await getGroupedResults(context);
      const templateData = [];

      Object.keys(groupedData).forEach((resultCategory, index) => {
        let order = index;

        if (includes(toUpper(resultCategory), 'V')) order = 1;
        else if (includes(toUpper(resultCategory), 'D')) order = 2;
        else if (includes(toUpper(resultCategory), 'G')) order = 3;
        else order = 3 + ++index;

        templateData.push({
          order,
          data: [
            [resultCategory],
            ...groupedData[resultCategory].map((student) => {
              const courseScores = courseUnits.map((course) => {
                const findResult = student.results.find(
                  (result) => result.course_unit_code === course.code
                );

                if (findResult) {
                  return [
                    parseFloat(findResult.final_mark).toFixed(1),
                    parseFloat(findResult.grading_point).toFixed(1),
                  ];
                }

                return [null, null];
              });

              return [
                `${student.surname} ${student.other_names}`,
                student.student_number,
                student.registration_number,
                student.gender,
                student.programme_type,
                ...flatten(courseScores),
                student.current_tcu,
                student.current_tws,
                student.current_gpa,
                student.previous_ctcu,
                student.previous_ctws
                  ? parseFloat(student.previous_ctws).toFixed(2)
                  : null,
                student.previous_cgpa,
                student.cumulative_tcu,
                student.cumulative_tws
                  ? parseFloat(student.cumulative_tws).toFixed(2)
                  : null,
                student.cgpa,
                join(student.previous_cgpas, ', '),
                join(student.retake_courses, ', '),
                // student.semester_comment,
                student.comment,
              ];
            }),
            [],
            [],
          ],
        });
      });

      const { sheet1, sheet2 } = resultsReportTemplate(courseUnits);
      const workbook = await new ExcelJS.Workbook();
      const resultsWorkSheet = workbook.addWorksheet('RESULTS', {
        headerFooter: {
          firstHeader: 'STUDENT RESULTS',
          firstFooter: 'STUDENT RESULTS',
        },
      });
      const keyWorkSheet = workbook.addWorksheet('KEYS');
      // const summaryWorkSheet = workbook.addWorksheet('SUMMARY');

      let imagePath = '';

      if (
        fs.existsSync(
          `${process.cwd()}/src/assets/logo/${
            institutionStructure.institution_logo
          }`
        )
      ) {
        imagePath = `${process.cwd()}/src/assets/logo/${
          institutionStructure.institution_logo
        }`;
      } else if (
        fs.existsSync(`${process.cwd()}/src/assets/logo/default.png`)
      ) {
        imagePath = `${process.cwd()}/src/assets/logo/default.png`;
      } else {
        throw new Error('No Default Image was selected');
      }

      const logo = workbook.addImage({
        filename: imagePath,
        extension: imagePath.substring(imagePath.lastIndexOf('.') + 1),
      });

      resultsWorkSheet.addImage(logo, {
        ext: { width: 86, height: 86 },
        tl: { col: 3, row: 0 },
        editAs: 'absolute',
      });

      resultsWorkSheet.mergeCells('C1', 'O3');
      resultsWorkSheet.mergeCells('A1', 'B2');
      const titleCell = resultsWorkSheet.getCell('C1');

      resultsWorkSheet.getRow(1).height = 60;

      titleCell.value = `${
        institutionStructure.institution_name || 'TERP'
      } \n${campus}\n ${
        findProgramme.programme_title
      } \n${studyYear} - ${semester} \n${intake} - INTAKE`;
      titleCell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
      };
      titleCell.font = { bold: true, size: 10, name: 'Arial' };
      const headerRow = resultsWorkSheet.getRow(3);

      headerRow.values = map(sheet1, 'header');
      headerRow.font = { bold: true, size: 11, color: '#2c3e50' };
      resultsWorkSheet.columns = sheet1.map((column) => {
        delete column.header;

        return column;
      });
      resultsWorkSheet.getRow(3).height = 40;

      resultsWorkSheet.views = [
        {
          state: 'frozen',
          xSplit: 0,
          ySplit: 3,
          topLeftCell: 'G10',
          activeCell: 'A1',
        },
      ];

      const orderedData = orderBy(templateData, ['order']);
      const data = flatten(map(orderedData, 'data'));

      resultsWorkSheet.addRows(data);

      const formatCourses = courseUnits.map((course) => {
        return [course.code, course.title];
      });

      keyWorkSheet.columns = sheet2;
      keyWorkSheet.addRows([
        ...formatCourses,
        ['F.M', 'FINAL MARK'],
        ['CU', 'CREDIT UNIT'],
        ['TCU', 'TOTAL CREDIT UNIT'],
        ['CTCU', 'CUMULATIVE TOTAL CREDIT UNIT'],
        ['WS', 'WEIGHTING SCORE'],
        ['TWS', 'TOTAL WEIGHTING SCORE'],
        ['CTWS', 'CUMULATIVE TOTAL WEIGHTING SCORE'],
        ['GP', 'GRADING POINT'],
        ['GPA', 'GRADING POINT AVERAGE'],
        ['CGPA', 'CUMULATIVE GRADING POINT AVERAGE'],
        ['NP', 'NORMAL PROGRESS'],
        ['NP', 'PROBATIONARY PROGRESS'],
      ]);

      const uploadPath = `${process.cwd()}/src/assets/documents/templates`;

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true }, (err) => {
          throw new Error(err.message);
        });
      }

      const template = `${uploadPath}/download-result-template-${
        user.surname
      }-${user.other_names}-${user.id}-${now()}.xlsm`;

      await workbook.xlsx.writeFile(template);
      await res.download(template, 'STUDENT-RESULTS.xlsx', (error) => {
        if (error) {
          throw new Error(error.message);
        }
      });
    } catch (error) {
      http.setError(400, 'Unable Download Result Detailed Report', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

module.exports = DetailedReportController;

const studentResultLists = (resultObj, categoryObj) => {
  const result = resultObj.map((element) => {
    const studentClass = categoryObj.find(
      (row) => element.cgpa >= row.range_from && element.cgpa <= row.range_to
    );

    let resultListCategory = null;

    if (element.comment === 'PP') {
      resultListCategory = 'TO RETAKE COURSE(S)';
    } else {
      resultListCategory =
        (studentClass && studentClass.name) || 'NORMAL PROGRESS';
    }

    return {
      ...element,
      resultListCategory,
    };
  });

  return result;
};

const getGroupedResults = async (context) => {
  const contextData = await reportsService.programmeStudyLevel(context);
  const resultCategory = await reportsService.resultCategoryPolicy(contextData);

  if (isEmpty(resultCategory)) {
    throw new Error(
      'RESULT CATEGORY LIST POLICY NOT DEFINED, PLEASE CONTACT THE INSTITUTION POLICIES COORDINATOR'
    );
  }
  let semesterResults = [];

  if (context.subject_combination_id != null) {
    const filtered = await reportsService.detailedSubjectCombinationReport(
      context
    );

    semesterResults = orderBy(filtered, ['programme_study_year', 'semester']);
  } else {
    semesterResults = await reportsService.resultDetailedReport(context);
  }

  context.programme_version_id = semesterResults[0].programme_version_id;

  const numberSemesters = await reportsService.resultSemestersDetail(context);

  const idxValues = numberSemesters.map((e) => e.semester);

  let numberPrevSemesters = 0;

  const idxLength = idxValues.length;

  for (let i = 1; i < idxLength + 1; i++) {
    const element = idxValues[idxLength - i];

    if (element === context.MetadataSemester) {
      numberPrevSemesters = idxLength - i;
      break;
    }
  }

  semesterResults.forEach((e) => {
    // if (!(e.previous_cgpa === null && numberPrevSemesters === 0)) {
    // }

    if (e.previous_cgpa === null && numberPrevSemesters > 0) {
      e.comment = 'PP';
    } else if (e.previous_cgpa === null && numberPrevSemesters === 0) {
      e.comment = e.comment;
    } else if (e.previous_cgpas.length < numberPrevSemesters) {
      e.comment = 'PP';
    }

    // else if (e.previous_cgpas.length > numberPrevSemesters) {
    //   e.comment = 'RC';
    // }
  });

  const newData = studentResultLists(semesterResults, resultCategory);

  const courseUnits = uniqBy(
    flatten(map(newData, 'results')).map((result) => {
      return {
        code: result.course_unit_code,
        title: result.course_unit_name,
        cu: result.version_credit_units || result.credit_unit,
      };
    }),
    'code'
  );
  const groupedData = groupBy(newData, 'resultListCategory');

  return { groupedData, courseUnits };
};

const resultsReportTemplate = (courseUnits) => {
  const sheet1 = [
    {
      header: 'STUDENT NAME',
      key: 'studentName',
      width: 35,
    },
    {
      header: 'STUDENT NUMBER',
      key: 'studentNumber',
      width: 20,
    },
    {
      header: 'REG NUMBER',
      key: 'registrationNumber',
      width: 20,
    },
    {
      header: 'GENDER',
      key: 'gender',
      width: 15,
    },
    {
      header: 'STUDY TYPE',
      key: 'programmeType',
      width: 15,
    },
    ...flatten(
      courseUnits.map((course) => {
        return [
          {
            header: toUpper(`${course.code} (C.U-${course.cu})\n\nMARK`),
            key: toUpper(`${course.code}MARK`),
            width: 15,
          },
          {
            header: '\n\nGP',
            key: toUpper(`${course.code}GP`),
            width: 5,
          },
        ];
      })
    ),
    {
      header: 'TCU',
      key: 'TCU',
      width: 10,
    },
    {
      header: 'TWS',
      key: 'TWS',
      width: 10,
    },
    {
      header: 'GPA',
      key: 'GPA',
      width: 10,
    },
    {
      header: 'PREV CTCU',
      key: 'prevCTCU',
      width: 15,
    },
    {
      header: 'PREV CTWS',
      key: 'prevCTWS',
      width: 15,
    },
    {
      header: 'PREV CGPA',
      key: 'prevCGPA',
      width: 15,
    },
    {
      header: 'CTCU',
      key: 'CTCU',
      width: 15,
    },
    {
      header: 'CTWS',
      key: 'CTCU',
      width: 15,
    },
    {
      header: 'CGPA',
      key: 'CGPA',
      width: 15,
    },
    {
      header: 'PREVIOUS CGPAs',
      key: 'previousCGPA',
      width: 25,
    },
    {
      header: 'RETAKE COURSES',
      key: 'retakeCourses',
      width: 30,
    },
    {
      header: 'REMARK',
      key: 'REMARK',
      width: 100,
    },
  ];

  const sheet2 = [
    {
      header: 'KEY',
      key: 'key',
      width: 20,
    },
    {
      header: 'MEANING',
      key: 'meaning',
      width: 40,
    },
  ];

  return { sheet1, sheet2 };
};
