const { HttpResponse } = require('@helpers');
const {
  NTCStudentService,
  metadataService,
  metadataValueService,
  facultyService,
  NTCResultService,
  NTCAcademicDocumentService,
} = require('@services/index');
const {
  isEmpty,
  now,
  toUpper,
  trim,
  words,
  map,
  find,
  split,
  groupBy,
  capitalize,
  orderBy,
  replace,
} = require('lodash');
const XLSX = require('xlsx');
const formidable = require('formidable');
const excelJs = require('exceljs');
const fs = require('fs');
const uuid = require('uuid');
const path = require('path');
const puppeteer = require('puppeteer');
const model = require('@models');
const moment = require('moment');
const {
  validateSheetColumns,
} = require('@controllers/Helpers/uploadValidator');
const {
  getMetadataValueId,
  getMetadataValues,
} = require('@controllers/Helpers/programmeHelper');
const { NTCStudentTemplateColumns } = require('./templateColumns');
const { appConfig } = require('@root/config');
const {
  capitalizeWords,
} = require('@controllers/Helpers/academicDocumentHelper');

const http = new HttpResponse();

class NTCStudentController {
  /**
   * GET All NTCStudents.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async index(req, res) {
    try {
      const { current_study_year_id: studyYear } = req.query;

      if (!studyYear)
        throw new Error('Provide Student Year to pick NTC students');

      const students = await NTCStudentService.findAll({
        where: { current_study_year_id: studyYear },
        include: { all: true },
        order: ['name'],
      });

      http.setSuccess(200, 'NTCStudents Fetched Successfully.', { students });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch NTCStudents.', { error });

      return http.send(res);
    }
  }

  /**
   * CREATE New NTCStudent Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async createNTCStudent(req, res) {
    try {
      const data = req.body;
      const { id } = req.user;

      data.created_by_id = parseInt(id, 10);
      data.programme_code = data.programme_code.toUpperCase();
      data.programme_title = data.programme_title.toUpperCase();

      const student = await model.sequelize.transaction(async (transaction) => {
        const result = await insertNewNTCStudent(data, transaction);

        return result;
      });

      http.setSuccess(201, 'NTCStudent created successfully', { student });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to create this NTCStudent.', { error });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   */
  async downloadNTCStudentsTemplate(req, res) {
    try {
      const { user } = req;

      const metadata = await metadataService.findAllMetadata({
        attributes: ['metadata_name'],
        include: [
          {
            association: 'metadataValues',
            order: [['metadata_value', 'ASC']],
            attributes: ['metadata_value'],
          },
        ],
        raw: true,
        nest: true,
      });

      const faculties = await facultyService.findAllFaculties({
        attributes: ['faculty_title'],
        order: [['faculty_title', 'ASC']],
        raw: true,
      });

      const workbook = new excelJs.Workbook();
      const createNTCStudentsSheet = workbook.addWorksheet('NTC STUDENTS');
      const createFacultiesSheet = workbook.addWorksheet('SHEET2');
      const createTypeOfEntrySheet = workbook.addWorksheet('SHEET3');
      const createCurrentStudyYearSheet = workbook.addWorksheet('SHEET4');

      createTypeOfEntrySheet.state = 'veryHidden';
      createFacultiesSheet.state = 'veryHidden';
      createCurrentStudyYearSheet.state = 'veryHidden';

      createTypeOfEntrySheet.addRows(
        getMetadataValues(metadata, 'NTC ENTRY TYPES')
      );
      createCurrentStudyYearSheet.addRows(
        getMetadataValues(metadata, 'NTC STUDY YEARS')
      );
      createFacultiesSheet.addRows(map(faculties, (f) => [f.faculty_title]));

      createNTCStudentsSheet.dataValidations.add('C2:C2000', {
        type: 'list',
        allowBlank: true,
        formulae: ['"MALE,FEMALE"'],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: 'Please select a valid value from the list',
      });
      createNTCStudentsSheet.dataValidations.add('G2:G2000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=SHEET2!$A$1:$A$2000'],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: 'Please select a valid value from the list',
      });
      createNTCStudentsSheet.dataValidations.add('I2:I2000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=SHEET3!$A$1:$A$2000'],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: 'Please select a valid value from the list',
      });
      createNTCStudentsSheet.dataValidations.add('L2:L2000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=SHEET4!$A$1:$A$2000'],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: 'Please select a valid value from the list',
      });

      createNTCStudentsSheet.properties.defaultColWidth =
        NTCStudentTemplateColumns.length;

      createNTCStudentsSheet.columns = NTCStudentTemplateColumns;

      const uploadPath = `${process.cwd()}/src/assets/documents/templates`;

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true }, (err) => {
          throw new Error(err.message);
        });
      }

      const template = `${uploadPath}/download-NTCStudents-upload-template-${
        user.surname
      }-${user.other_names}-${user.id}-${now()}.xlsm`;

      await workbook.xlsx.writeFile(template);
      await res.download(
        template,
        'NTC-STUDENTS-UPLOAD-TEMPLATE.xlsx',
        (error) => {
          if (error) {
            throw new Error(error.message);
          }
        }
      );
    } catch (error) {
      http.setError(400, 'Unable To Download This Template.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   */
  async uploadNTCStudentsTemplate(req, res) {
    try {
      const user = req.user.id;
      const form = new formidable.IncomingForm();
      const results = [];

      const metadataValues = await metadataValueService.findAllMetadataValues({
        attributes: ['id', 'metadata_value'],
        include: [
          {
            association: 'metadata',
            attributes: ['id', 'metadata_name'],
          },
        ],
      });

      const faculties = await facultyService.findAllFaculties({
        attributes: ['id', 'faculty_title'],
        order: [['faculty_title', 'ASC']],
        raw: true,
      });

      form.parse(req, async (err, fields, files) => {
        if (err) {
          http.setError(400, 'Unable To Upload NTCStudents.', {
            error: { err },
          });

          return http.send(res);
        }

        const file = files[Object.keys(files)[0]];

        if (!file) {
          http.setError(400, 'Please Select A File To Upload.');

          return http.send(res);
        }
        const workbook = XLSX.readFile(file.filepath, { cellDates: true });
        const myTemplate = workbook.SheetNames[0];
        const templateData = XLSX.utils.sheet_to_json(
          workbook.Sheets[myTemplate]
        );

        if (isEmpty(templateData)) {
          http.setError(400, 'Cannot upload an empty template.');

          return http.send(res);
        }

        try {
          await model.sequelize.transaction(async (transaction) => {
            for (const NTCStudent of templateData) {
              validateSheetColumns(NTCStudent, [
                'FULL NAME',
                'REG NO',
                'SEX',
                'NATIONALITY',
                'PROGRAMME',
                'PROGRAMME CODE',
                'FACULTY',
                'TYPE OF ENTRY',
                'YEAR OF ENTRY',
                'YEAR OF COMPLETION',
                'CURRENT STUDY YEAR',
                'DATE OF BIRTH (MM/DD/YYYY)',
                'SUBJECTS (COMMA SEPARATED)',
              ]);

              const subjectNames = words(
                trim(NTCStudent['SUBJECTS (COMMA SEPARATED)'])
              ).map((e) => toUpper(e));

              const findFaculty = find(
                faculties,
                (e) => toUpper(e.faculty_title) === trim(NTCStudent.FACULTY)
              );

              if (!findFaculty)
                throw new Error(
                  `Faculty ${trim(NTCStudent.FACULTY)} for ${trim(
                    NTCStudent['REG NO']
                  )} does not Exist.`
                );

              const payload = {
                name: trim(NTCStudent['FULL NAME']).toUpperCase(),
                sex: trim(NTCStudent.SEX).toUpperCase(),
                nationality: trim(NTCStudent.NATIONALITY).toUpperCase(),
                faculty_id: findFaculty.id,
                programme_title: trim(NTCStudent.PROGRAMME).toUpperCase(),
                programme_code: trim(
                  NTCStudent['PROGRAMME CODE']
                ).toUpperCase(),
                registration_number: trim(NTCStudent['REG NO']).toUpperCase(),
                type_of_entry_id: getMetadataValueId(
                  metadataValues,
                  trim(NTCStudent['TYPE OF ENTRY']),
                  'NTC ENTRY TYPES',
                  trim(NTCStudent['REG NO'])
                ),
                year_of_entry: trim(NTCStudent['YEAR OF ENTRY']),
                date_of_birth: trim(NTCStudent['DATE OF BIRTH (MM/DD/YYYY)']),
                year_of_completion: trim(NTCStudent['YEAR OF COMPLETION']),
                email: trim(NTCStudent.EMAIL),
                phone: trim(NTCStudent.PHONE),
                current_study_year_id: getMetadataValueId(
                  metadataValues,
                  trim(NTCStudent['CURRENT STUDY YEAR']),
                  'NTC STUDY YEARS',
                  trim(NTCStudent['REG NO'])
                ),
                subjects: subjectNames,
                created_by_id: user,
              };

              const upload = await insertNewNTCStudent(payload, transaction);

              results.push(upload[0]);
            }
          });
          http.setSuccess(200, 'NTC Students Uploaded successfully.', {
            data: results,
          });

          return http.send(res);
        } catch (error) {
          http.setError(400, 'Cannot To Upload Template.', {
            error: { message: error.message },
          });

          return http.send(res);
        }
      });
    } catch (error) {
      http.setError(400, 'Unable To Upload This Template.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * UPDATE Specific NTCStudent Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async updateNTCStudent(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      data.programme_code = data.programme_code.toUpperCase();
      data.programme_title = data.programme_title.toUpperCase();
      const updateNTCStudent = await NTCStudentService.updateNTCStudent(
        id,
        data
      );
      const student = updateNTCStudent[1][0];

      http.setSuccess(200, 'NTCStudent updated successfully', { student });
      if (isEmpty(student)) http.setError(404, 'NTCStudent Data Not Found.');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to update this NTCStudent.', { error });

      return http.send(res);
    }
  }

  /**
   * Get Specific NTCStudent Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async fetchNTCStudent(req, res) {
    const { id } = req.params;
    const student = await NTCStudentService.findOneNTCStudent({
      where: { id },
      include: { all: true },
    });

    http.setSuccess(200, 'NTCStudent fetch successful', { student });
    if (isEmpty(student)) http.setError(404, 'NTCStudent Data Not Found.');

    return http.send(res);
  }

  /**
   * Get Specific NTCStudent Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async fetchNTCStudentsDocuments(req, res) {
    try {
      const context = req.query;

      if (
        !context ||
        !context.ntc_study_year_id ||
        !context.completion_year ||
        !context.programme
      ) {
        throw new Error();
      }
      const data = await NTCStudentService.findAll({
        where: {
          year_of_completion: context.completion_year,
          current_study_year_id: context.ntc_study_year_id,
          programme_title: context.programme,
        },
        attributes: [
          'id',
          'name',
          'registration_number',
          'sex',
          'subjects',
          'programme_code',
          'programme_title',
          'year_of_completion',
        ],
        include: [
          {
            association: 'academicDocument',
            include: [
              {
                association: 'transcriptGeneratedBy',
                attributes: ['surname', 'other_names'],
              },
              {
                association: 'certificateGeneratedBy',
                attributes: ['surname', 'other_names'],
              },
            ],
          },
          {
            association: 'currentStudyYear',
            attributes: ['metadata_value'],
          },
          {
            association: 'faculty',
            attributes: ['faculty_code', 'faculty_title'],
          },
          {
            association: 'typeOfEntry',
            attributes: ['metadata_value'],
          },
        ],
      });

      http.setSuccess(200, 'NTCStudent fetch successful', { data });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to get this Documents.', {
        error: error.message,
      });

      return http.send(res);
    }
  }

  /**
   * Destroy NTCStudent Data
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async deleteNTCStudent(req, res) {
    try {
      const { id } = req.params;

      await NTCStudentService.deleteNTCStudent(id);
      http.setSuccess(200, 'NTCStudent deleted successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to delete this NTCStudent.', { error });

      return http.send(res);
    }
  }

  async generateNTCAcademicDocuments(req, res) {
    try {
      const { studentIDs, graduation_date: gradDate } = req.body;
      const { user } = req;
      const { documentType } = req.params;
      const {
        headers: { authorization },
      } = req;

      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox'],
        defaultViewport: null,
      });
      const page = await browser.newPage();

      await page.setViewport({
        width: 1920,
        height: 1080,
      });

      await page.setExtraHTTPHeaders({
        Authorization: authorization,
      });

      for (const studentID of studentIDs) {
        const findStudent = await NTCStudentService.findOne({
          where: {
            id: studentID,
          },
          raw: true,
        });

        if (!findStudent) {
          throw new Error(
            `Invalid Student Number ${findStudent.registration_number}`
          );
        }

        const fileName = `NTC-${
          documentType === 'certificate' ? 'CRT' : 'TRA'
        }-${words(findStudent.registration_number).join('')}.pdf`;
        const uuidCodes = split(uuid.v4().toUpperCase(), '-');
        const serialNumber = uuidCodes[4];

        let defaultData = {
          transcript_name: fileName,
          transcript_serial_number: serialNumber,
          transcript_generated_on: now(),
          transcript_generated_by_id: user.id,
          transcript_id: `KYU-${uuidCodes[0]}`,
          transcript_created_by_id: user.id,
        };

        if (documentType === 'certificate') {
          defaultData = {
            certificate_name: fileName,
            certificate_serial_number: serialNumber,
            certificate_generated_on: now(),
            certificate_generated_by_id: user.id,
            certificate_id: `KYU-${uuidCodes[0]}`,
            certificate_created_by_id: user.id,
          };
        }

        const academicDocument =
          await NTCAcademicDocumentService.updateOrCreate(
            {
              ntc_student_id: studentID,
            },
            {
              ntc_student_id: studentID,
              graduation_date: gradDate,
              ...defaultData,
            }
          );

        if (!academicDocument && !academicDocument.dataValues)
          throw new Error('Unable to get academic Documents');

        await page.goto(
          `${appConfig.APP_URL}/api/v1/ntc-mgt/ntc-students/render/${documentType}?documentId=${academicDocument.dataValues.id}`,
          {
            waitUntil: 'networkidle2',
          }
        );

        const documentPath = path.join(
          appConfig.ASSETS_ROOT_DIRECTORY,
          `documents/ntc-${documentType}s`
        );

        const fullDocumentName = `${documentPath}/${fileName}`;

        if (!fs.existsSync(documentPath)) {
          fs.mkdirSync(documentPath, { recursive: true }, (err) => {
            throw new Error(err.message);
          });
        }

        let evaluate = 'body > div > div > h1';

        if (documentType === 'certificate') {
          evaluate = 'body > div > div > div > h1';
        }

        await page.pdf({
          format: 'A4',
          printBackground: true,
          path: fullDocumentName,
          preferCSSPageSize: true,
        });

        await page
          .$eval(evaluate, (el) => el.textContent)
          .catch(async () => {
            await fs.unlinkSync(fullDocumentName);
            const errorMsg = await page.$eval(
              'body > h3',
              (el) => el.textContent
            );

            throw new Error(
              `Unable to generate ${documentType} for ${findStudent.registration_number} - ${errorMsg}`
            );
          });
      }
      await browser.close();

      http.setSuccess(200, 'Document Printed successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to print this document', {
        error: error.message,
      });

      return http.send(res);
    }
  }

  async renderNTCCertificateView(req, res) {
    try {
      const { documentId } = req.query;
      const institutionCode = appConfig.TAX_HEAD_CODE;

      if (!documentId) {
        throw new Error('Invalid Document IDs');
      }

      const findNTCStudentDocument = await NTCAcademicDocumentService.findOne({
        where: {
          id: documentId,
        },
        include: { all: true },
        raw: false,
        plain: true,
      }).then((res) => (res ? res.toJSON() : null));

      if (!findNTCStudentDocument) throw new Error(`Invalid Document ID`);

      const graduationDate = moment(
        findNTCStudentDocument.graduation_date,
        'YYYY-MM-DD'
      )
        .format('Do MMMM, YYYY')
        .replace(/(\d)(st|nd|rd|th)/g, '$1<sup>$2</sup>');

      const templateData = {
        title: 'NTC STUDENT CERTIFICATE',
        serialNumber: findNTCStudentDocument.certificate_serial_number,
        certificateID: findNTCStudentDocument.certificate_id,
        studentData: {
          ...findNTCStudentDocument.student,
          programme_title: replace(
            toUpper(findNTCStudentDocument.student.programme_title),
            'DIPLOMA IN',
            ''
          ),
          graduationDate,
          degreeClass: 'CLASS II (CREDIT)',
        },
      };

      switch (institutionCode) {
        case 'FKYU03': {
          const templateName = 'KYUNTCCertificate';

          res.render(templateName, templateData);
          break;
        }

        default:
          throw new Error(
            'Your NTC Certificate Template has not been Designed'
          );
      }
    } catch (error) {
      res.render('error', {
        message: error.message,
        error: {
          stack: 'NTC CERTIFICATE PREVIEW',
          status: 400,
        },
        version: '1.0.0',
      });
    }
  }

  async renderNTCTranscriptView(req, res) {
    try {
      const { documentId } = req.query;
      const institutionCode = appConfig.TAX_HEAD_CODE;

      if (!documentId) {
        throw new Error('Invalid Document IDs');
      }

      const findNTCStudentDocument = await NTCAcademicDocumentService.findOne({
        where: {
          id: documentId,
        },
        include: [
          {
            association: 'student',
            attributes: [
              'id',
              'name',
              'registration_number',
              'sex',
              'nationality',
              'programme_code',
              'programme_title',
              'date_of_birth',
              'year_of_entry',
              'year_of_completion',
              'subjects',
            ],
            include: [
              {
                association: 'typeOfEntry',
                attributes: ['metadata_value'],
              },
              {
                association: 'faculty',
                attributes: ['faculty_title'],
              },
            ],
          },
        ],
        raw: false,
        plain: true,
      }).then((res) => (res ? res.toJSON() : null));

      if (!findNTCStudentDocument)
        throw new Error(`Invalid Document ID ${documentId}`);

      const studentResults = await NTCResultService.findAll({
        where: { ntc_student_id: findNTCStudentDocument.student.id },
        include: [
          {
            association: 'academicYear',
            attributes: ['metadata_value'],
          },
          {
            association: 'term',
            attributes: ['metadata_value'],
          },
          {
            association: 'studyYear',
            attributes: ['metadata_value'],
          },
          {
            association: 'gradingValue',
            attributes: [
              'max_value',
              'max_value',
              'grading_point',
              'grading_letter',
              'interpretation',
            ],
          },
          {
            association: 'subject',
            attributes: ['ntc_subject_code', 'ntc_subject_title'],
            include: [
              {
                association: 'subjectCategory',
                attributes: ['metadata_value'],
              },
            ],
          },
        ],
        order: [['created_at', 'DESC']],
        raw: true,
        nested: true,
      });

      if (isEmpty(studentResults))
        throw new Error('This student has no Results');

      const groupedResults = groupBy(
        studentResults,
        'studyYear.metadata_value'
      );

      const groupedSubjectCat = Object.keys(groupedResults).map((studyYear) => {
        const [firstResult] = groupedResults[studyYear];

        return {
          study_year: capitalizeWords(studyYear),
          exam_date: toUpper(moment(firstResult.exam_date).format('MMMM YYYY')),
          categories: groupBy(
            groupedResults[studyYear],
            'subject.subjectCategory.metadata_value'
          ),
        };
      });

      const names = words(findNTCStudentDocument.student.name);

      const [surname, ...otherNames] = names;

      const transcriptData = {
        studentData: {
          ...findNTCStudentDocument.student,
          name: `${toUpper(surname)} ${map(otherNames, (n) =>
            capitalize(n)
          ).join(' ')}`,
          date_of_birth: toUpper(
            moment(findNTCStudentDocument.student.date_of_birth).format(
              'ddd DD-MMM-YYYY'
            )
          ),
          studyYears: orderBy(groupedSubjectCat, 'study_year'),
          appURL: appConfig.APP_URL,
          className: 'Class II (Credit)',
        },
        title: 'NTC STUDENT TRANSCRIPT',
        serialNumber: findNTCStudentDocument.serialNumber,
      };

      switch (institutionCode) {
        case 'FKYU03':
          res.render('KYUNTCTranscript', transcriptData);
          break;

        default:
          throw new Error(
            'Your Institution NTC Transcript has not been designed'
          );
      }
    } catch (error) {
      res.render('error', {
        message: error.message,
        error: {
          stack: 'NTC TRANSCRIPT PREVIEW',
          status: 400,
        },
        version: '1.0.0',
      });
    }
  }
}

/**
 *
 * @param {*} data
 * @param {*} transaction
 */
const insertNewNTCStudent = async function (data, transaction) {
  const result = await NTCStudentService.create(data, transaction);

  return result;
};

module.exports = NTCStudentController;
