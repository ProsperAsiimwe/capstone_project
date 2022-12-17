const { HttpResponse } = require('@helpers');
const {
  NTCResultService,
  metadataService,
  metadataValueService,
  NTCStudentService,
  gradingService,
  NTCSubjectService,
} = require('@services/index');
const {
  isEmpty,
  now,
  trim,
  words,
  toUpper,
  find,
  map,
  uniqBy,
} = require('lodash');
const XLSX = require('xlsx');
const uuid = require('uuid');
const formidable = require('formidable');
const excelJs = require('exceljs');
const fs = require('fs');
const model = require('@models');
const {
  validateSheetColumns,
} = require('@controllers/Helpers/uploadValidator');
const {
  getMetadataValueId,
  getMetadataValues,
} = require('@controllers/Helpers/programmeHelper');
const { Op } = require('sequelize');
const { NTCResultTemplateColumns } = require('./templateColumns');

const http = new HttpResponse();

class NTCResultController {
  /**
   * GET All NTCResults.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async index(req, res) {
    try {
      const { study_year_id: studyYear, academic_year_id: academicYear } =
        req.query;

      if (!studyYear || !academicYear)
        throw new Error(
          'Provide Study Year and Academic Year to pick NTC Results'
        );

      const results = await NTCResultService.findAll({
        where: { study_year_id: studyYear, academic_year_id: academicYear },
        include: { all: true },
        group: [
          'NTCResult.id',
          'ntc_student_id',
          'academicYear.id',
          'gradingValue.id',
          'term.id',
          'subject.id',
          'studyYear.id',
          'student.id',
          'createdBy.id',
          'deletedBy.id',
        ],
        order: [['created_at', 'DESC']],
      });

      http.setSuccess(200, 'NTCResults Fetched Successfully.', { results });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch NTCResults.', {
        error: error.message,
      });

      return http.send(res);
    }
  }

  /**
   * CREATE New NTCResult Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async createNTCResult(req, res) {
    try {
      const data = req.body;
      const { id } = req.user;

      data.created_by_id = parseInt(id, 10);
      data.programme_code = data.programme_code.toUpperCase();
      data.programme_title = data.programme_title.toUpperCase();

      const student = await model.sequelize.transaction(async (transaction) => {
        const result = await insertNewNTCResult(data, transaction);

        return result;
      });

      http.setSuccess(201, 'NTCResult created successfully', { student });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to create this NTCResult.', { error });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   */
  async downloadNTCResultsTemplate(req, res) {
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

      const ntcSubjects = await NTCSubjectService.findAll({
        attributes: ['ntc_subject_code'],
        raw: true,
      });

      if (!ntcSubjects)
        throw new Error(
          'NTC Subjects have not been set, please contact system admin'
        );

      const workbook = new excelJs.Workbook();
      const createNTCResultsSheet = workbook.addWorksheet('NTC STUDENTS');
      const academicYearSheet = workbook.addWorksheet('SHEET2');
      const studyYearsSheet = workbook.addWorksheet('SHEET3');
      const termSheet = workbook.addWorksheet('SHEET4');
      const subjectSheet = workbook.addWorksheet('SHEET5');

      academicYearSheet.state = 'veryHidden';
      studyYearsSheet.state = 'veryHidden';
      termSheet.state = 'veryHidden';
      subjectSheet.state = 'veryHidden';

      academicYearSheet.addRows(getMetadataValues(metadata, 'ACADEMIC YEARS'));
      studyYearsSheet.addRows(getMetadataValues(metadata, 'NTC STUDY YEARS'));
      termSheet.addRows(getMetadataValues(metadata, 'NTC TERMS'));
      subjectSheet.addRows(map(ntcSubjects, (e) => [e.ntc_subject_code]));

      createNTCResultsSheet.dataValidations.add('B2:B2000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=SHEET2!$A$1:$A$2000'],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: 'Please select a valid value from the list',
      });
      createNTCResultsSheet.dataValidations.add('C2:C2000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=SHEET3!$A$1:$A$2000'],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: 'Please select a valid value from the list',
      });
      createNTCResultsSheet.dataValidations.add('D2:D2000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=SHEET4!$A$1:$A$2000'],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: 'Please select a valid value from the list',
      });
      createNTCResultsSheet.dataValidations.add('E2:E2000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=SHEET5!$A$1:$A$2000'],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: 'Please select a valid value from the list',
      });
      createNTCResultsSheet.dataValidations.add('J2:J2000', {
        type: 'list',
        allowBlank: true,
        formulae: [`"TRUE,FALSE"`],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: 'Please select a valid value from the list',
      });
      createNTCResultsSheet.dataValidations.add('K2:K2000', {
        type: 'list',
        allowBlank: true,
        formulae: [`"0,1,2,3"`],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: 'Please select a valid value from the list',
      });

      createNTCResultsSheet.properties.defaultColWidth =
        NTCResultTemplateColumns.length;

      createNTCResultsSheet.columns = NTCResultTemplateColumns;

      const uploadPath = `${process.cwd()}/src/assets/documents/templates`;

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true }, (err) => {
          throw new Error(err.message);
        });
      }

      const template = `${uploadPath}/download-NTCResults-upload-template-${
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
  async uploadNTCResultsTemplate(req, res) {
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

      const NTCGrade = await gradingService
        .findOneGrading({
          where: {
            grading_code: {
              [Op.iLike]: 'NTC',
            },
          },
          attributes: ['id', 'grading_code'],
          include: [
            {
              association: 'values',
              attributes: ['id', 'min_value', 'max_value'],
            },
          ],
          plain: true,
        })
        .then((res) => (res ? res.toJSON() : null));

      if (!NTCGrade) throw new Error('NTC Grading system has not been defined');

      const ntcSubjects = await NTCSubjectService.findAll();

      const uuidCodes = words(uuid.v4());
      const [serialNumber] = uuidCodes;
      const batchNumber = `BATCH-${toUpper(serialNumber)}`;

      form.parse(req, async (err, fields, files) => {
        if (err) {
          http.setError(400, 'Unable To Upload NTCResults.', {
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
            for (const NTCResult of templateData) {
              validateSheetColumns(NTCResult, [
                'REG NO',
                'ACADEMIC YEAR',
                'STUDY YEAR',
                'TERM',
                'SUBJECT',
                'TOTAL MARK',
                'FLAG',
                'EXAM DATE (MM/DD/YYYY)',
              ]);

              const regNo = trim(NTCResult['REG NO']).toUpperCase();

              const findStudent = await NTCStudentService.findOne({
                where: { registration_number: regNo },
                raw: true,
                attributes: ['id', 'name'],
              });

              if (!findStudent)
                throw new Error(`Cannot find a student with Reg No. ${regNo}`);

              const totalMark = parseFloat(trim(NTCResult['TOTAL MARK']));

              const cwMark = trim(NTCResult['CW MARK']);
              const exMark = trim(NTCResult['EX MARK']);

              if ((!cwMark && exMark) || (cwMark && !exMark))
                throw new Error(
                  `Provide both Course work and Exam Marks for ${regNo}`
                );

              if (parseFloat(cwMark) + parseFloat(exMark) > 100)
                throw new Error(
                  `Course work mark(${cwMark}) plus Exam mark(${exMark}) must not exceed 100% for ${regNo} - ${
                    cwMark + exMark
                  }`
                );

              if (
                cwMark &&
                exMark &&
                parseFloat(cwMark) + parseFloat(exMark) !==
                  parseFloat(totalMark)
              ) {
                throw new Error(
                  `Course work (${cwMark}) mark + Exam mark (${exMark}) does not equal to Total mark (${totalMark}) (${
                    cwMark + exMark
                  }) for ${regNo}`
                );
              }

              const findGradeValue = find(
                NTCGrade.values,
                (val) =>
                  parseFloat(totalMark) <= parseFloat(val.max_value) &&
                  parseFloat(totalMark) >= parseFloat(val.min_value)
              );

              const findSubject = find(
                ntcSubjects,
                (subject) =>
                  trim(subject.ntc_subject_code).toUpperCase() ===
                  trim(NTCResult.SUBJECT).toString().toUpperCase()
              );

              if (!findSubject)
                throw new Error(
                  `The Subject provided ${trim(
                    NTCResult.SUBJECT
                  )} does not exist in list of NTC Subjects`
                );

              const payload = {
                batch_no: batchNumber,
                ntc_student_id: findStudent.id,
                cw_mark: cwMark ? parseFloat(cwMark).toFixed(1) : null,
                ex_mark: exMark ? parseFloat(exMark).toFixed(1) : null,
                total_mark: totalMark.toFixed(1),
                academic_year_id: getMetadataValueId(
                  metadataValues,
                  trim(NTCResult['ACADEMIC YEAR']),
                  'ACADEMIC YEARS',
                  trim(NTCResult['REG NO'])
                ),
                term_id: getMetadataValueId(
                  metadataValues,
                  trim(NTCResult.TERM).toString(),
                  'NTC TERMS',
                  trim(NTCResult['REG NO'])
                ),
                study_year_id: getMetadataValueId(
                  metadataValues,
                  trim(NTCResult['STUDY YEAR']),
                  'NTC STUDY YEARS',
                  trim(NTCResult['REG NO'])
                ),
                exam_date: trim(NTCResult['EXAM DATE (MM/DD/YYYY)']),
                subject_id: findSubject.id,
                flag: trim(NTCResult.FLAG),
                grading_value_id: findGradeValue.id,
                created_by_id: user,
              };

              const upload = await insertNewNTCResult(payload, transaction);

              results.push(upload[0]);
            }
          });
          http.setSuccess(200, 'NTC Student Results Uploaded successfully.', {
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
   * UPDATE Specific NTCResult Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async updateNTCResult(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      data.programme_code = data.programme_code.toUpperCase();
      data.programme_title = data.programme_title.toUpperCase();
      const updateNTCResult = await NTCResultService.updateNTCResult(id, data);
      const result = updateNTCResult[1][0];

      http.setSuccess(200, 'NTCResult updated successfully', { result });
      if (isEmpty(result)) http.setError(404, 'NTCResult Data Not Found.');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to update this NTCResult.', { error });

      return http.send(res);
    }
  }

  /**
   * Get Specific NTCResult Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async findOneNTCResult(req, res) {
    try {
      const { id } = req.params;
      const student = await NTCResultService.findOne({
        where: { id },
        include: { all: true },
      });

      http.setSuccess(200, 'NTCResult', { student });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to get this NTCResult.', { error });

      return http.send(res);
    }
  }

  /**
   * Get UNIQUE NTC PROGRAMMES.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async fetchNTCProgrammes(req, res) {
    try {
      const context = req.query;

      if (!context.ntc_study_year_id)
        throw new Error('Invalid context provided');

      const programmes = await NTCStudentService.findAll({
        attributes: ['programme_title', 'programme_code'],
        where: {
          current_study_year_id: context.ntc_study_year_id,
        },
        raw: true,
      });

      http.setSuccess(200, 'NTCResult', {
        data: uniqBy(programmes, 'programme_code'),
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to NTC Programmes.', { error: error.message });

      return http.send(res);
    }
  }

  /**
   * Get UNIQUE NTC PROGRAMMES.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async fetchNTCTermlyResults(req, res) {
    try {
      const context = req.query;

      if (
        !context.ntc_study_year_id ||
        !context.ntc_term_id ||
        !context.academic_year_id ||
        !context.programme
      )
        throw new Error('Invalid context provided');

      const results = await NTCResultService.ntcResultFunction({
        academic_year_id: context.academic_year_id,
        programme: context.programme,
        study_year: context.ntc_study_year_id,
        term: context.ntc_term_id,
      });

      http.setSuccess(200, 'NTCResult', {
        data: results,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to get this NTCResult.', {
        error: error.message,
      });

      return http.send(res);
    }
  }

  /**
   * Destroy NTCResult Data
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async deleteNTCResult(req, res) {
    try {
      const { id } = req.params;

      await NTCResultService.deleteNTCResult(id);
      http.setSuccess(200, 'NTCResult deleted successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to delete this NTCResult.', { error });

      return http.send(res);
    }
  }
}

/**
 *
 * @param {*} data
 * @param {*} transaction
 */
const insertNewNTCResult = async function (data, transaction) {
  const result = await NTCResultService.create(data, transaction);

  return result;
};

module.exports = NTCResultController;
