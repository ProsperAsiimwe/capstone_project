/* eslint-disable camelcase */
const { HttpResponse } = require('@helpers');
const {
  graduationListService,
  metadataValueService,
  studentService,
  reportsService,
  resultsPolicyService,
  institutionStructureService,
  programmeService,
  studentProgrammeService,
  graduationFeesService,
  universalInvoiceService,
  paymentReferenceService,
  metadataService,
  academicDocumentService,
} = require('@services/index');
const {
  graduationListColumns,
  finalGraduationListColumns,
  bulkGraduationListBillingColumns,
} = require('./templateColumns');
const excelJs = require('exceljs');
const fs = require('fs');
const formidable = require('formidable');
const XLSX = require('xlsx');
const { toUpper, now, isEmpty, chunk, map, find, trim } = require('lodash');
const model = require('@models');
const moment = require('moment');
const {
  getMetadataValueId,
  getMetadataValueName,
  getMetadataValues,
} = require('@controllers/Helpers/programmeHelper');
const {
  generateDraftList,
  generateFinalList,
  pushToProvisional,
  blockCollegesExcept,
} = require('@controllers/Helpers/graduationListsHelper');
const {
  generateProvisionList,
} = require('@controllers/Helpers/generateProvisionalListHelper');
const { studentProgrammeAttributes } = require('../Helpers/enrollmentRecord');
const envConfig = require('../../../config/app');
const {
  generateSystemReference,
} = require('@controllers/Helpers/paymentReferenceHelper');
const { feesItemAllocation } = require('../Helpers/paymentReferenceRecord');
const {
  validateSheetColumns,
} = require('@controllers/Helpers/uploadValidator');
const { generatePRN } = require('@helpers');
const {
  activityLog,
  findLocalIpAddress,
} = require('@controllers/Helpers/logsHelper');
const UserAgent = require('user-agents');

const iPv4 = findLocalIpAddress();
const userAgent = new UserAgent();
const http = new HttpResponse();

class GraduationListController {
  // graduation lists
  async graduationListFunction(req, res) {
    try {
      if (
        !req.query.campus_id ||
        !req.query.intake_id ||
        !req.query.programme_id
      ) {
        throw new Error('Invalid Context Provided');
      }

      const context = req.query;

      const data = await graduationListService.studentByGraduationLoad(context);

      http.setSuccess(200, 'Graduation List fetched successfully', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Student Graduation List ', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * GET Final Graduation List
   *
   * @param {*} req
   * @param {*} res
   * @returns array of students
   */
  async graduationDraftList(req, res) {
    try {
      const context = req.query;

      if (
        !req.query.campus_id ||
        !req.query.intake_id ||
        !req.query.programme_id ||
        !req.query.academic_year
      ) {
        throw new Error('Invalid Context Provided');
      }

      const data = await generateDraftList(context);

      http.setSuccess(200, 'Graduation DRAFT LIST fetched successfully', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Student Graduation DRAFT LIST ', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  // fetchToProvisional
  async fetchToProvisional(req, res) {
    try {
      const context = req.query;

      if (
        !req.query.campus_id ||
        !req.query.intake_id ||
        !req.query.programme_id ||
        !req.query.academic_year
      ) {
        throw new Error('Invalid Context Provided');
      }

      // fetchToProvisional

      const data = await pushToProvisional(context);

      http.setSuccess(200, 'Normal Progress Student successfully', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Normal Progress Student', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  // generate provisional grade list

  async generateProvisionalFunction(req, res) {
    try {
      const context = req.query;
      const { email } = req.user;

      if (
        !req.query.campus_id ||
        !req.query.intake_id ||
        !req.query.programme_id ||
        !req.query.academic_year
      ) {
        throw new Error('Invalid Context Provided');
      }

      await blockCollegesExcept(
        req.query.programme_id,
        email,
        req.query.academic_year
      );

      const data = await generateProvisionList(context);

      http.setSuccess(
        200,
        'Provisional Graduation List Generated successfully',
        {
          data,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable To Generate Student Provisional Graduation List',
        {
          error: { message: error.message },
        }
      );

      return http.send(res);
    }
  }

  // provisional list
  async provisionalGraduationList(req, res) {
    try {
      const context = req.query;

      if (
        !req.query.campus_id ||
        !req.query.intake_id ||
        !req.query.programme_id
        // !req.query.academic_year ||
        // !req.query.entry_academic_year
      ) {
        throw new Error('Invalid Context Provided');
      }

      //  maxProgrammeStudyYear
      const finalStudyYear = await graduationListService.maxProgrammeStudyYear(
        context
      );
      const id = req.query.academic_year;
      const entryId = req.query.entry_academic_year;

      const metadata = await metadataValueService.findOneMetadataValue({
        where: { id },
      });
      const entryMetadata = await metadataValueService.findOneMetadataValue({
        where: { id: entryId },
      });

      // findAllMetadataValues

      const academicYearData = metadata.dataValues;
      const entryYearData = entryMetadata.dataValues;

      const contextData = {
        ...context,
        finalYearMetadata: finalStudyYear.programme_study_year_id,
        finalYearContext: finalStudyYear.context_id,
        academicYearData: academicYearData,
        entryYearData: entryYearData,
      };

      const filterData = await graduationListService.graduationProvisionalList(
        contextData
      );

      const data = await studentByEntryYear(filterData, contextData);

      http.setSuccess(200, 'Provisional Graduation List fetched successfully', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable To Fetch Student Provisional Graduation List',
        {
          error: { message: error.message },
        }
      );

      return http.send(res);
    }
  }

  // searchStudentProvisionalList
  async searchStudentProvisionalList(req, res) {
    try {
      const context = req.query;

      if (!req.query.student) {
        throw new Error('Invalid Context Provided');
      }

      const studentData = await graduationListService.findStudentByRegNo(
        context
      );

      if (isEmpty(studentData)) {
        throw new Error(
          `Wrong Student Or Registration Number Provided(No Student Record Associated to ${req.query.student}`
        );
      }

      const data = await graduationListService.searchStudentProvisionalList(
        context
      );

      http.setSuccess(200, 'Graduate fetched successfully', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Graduate', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  // graduationList

  async graduationList(req, res) {
    try {
      const context = req.query;

      if (
        !req.query.campus_id ||
        !req.query.intake_id ||
        !req.query.programme_id ||
        !req.query.academic_year_id
      ) {
        throw new Error('Invalid Context Provided');
      }

      // data
      const data = await generateFinalList(context);

      http.setSuccess(200, 'Graduation List fetched successfully', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Student Graduation List ', {
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
  async provisionalGradList(req, res) {
    try {
      const context = req.query;
      const { graduation_academic_year_id } = req.body;
      const { email } = req.user;

      if (
        !context.campus_id ||
        !context.intake_id ||
        !context.programme_id ||
        !context.academic_year
      ) {
        throw new Error('Invalid Context Provided');
      }
      await blockCollegesExcept(
        context.programme_id,
        email,
        graduation_academic_year_id
      );

      const degreeClass = await degreeClassFunction(context);

      //  maxProgrammeStudyYear
      const finalStudyYear = await graduationListService.maxProgrammeStudyYear(
        context
      );

      const contextData = {
        ...context,
        finalYearMetadata: finalStudyYear.programme_study_year_id,
        finalYearContext: finalStudyYear.context_id,
      };

      const gradLoadStudents = await graduationListService.graduationDraftList(
        contextData
      );

      if (isEmpty(gradLoadStudents)) {
        throw new Error(
          `Unable To Find Students That Meet This Context's Graduation Load.`
        );
      }

      const user = req.user.id;

      const data = {};

      // const metadataValues = await metadataValueService.findAllMetadataValues({
      //   include: {
      //     association: 'metadata',
      //     attributes: ['id', 'metadata_name'],
      //   },
      //   attributes: ['id', 'metadata_value'],
      // });

      // const contextAcademicYear = getMetadataValueId(
      //   metadataValues,
      //   `${context.academic_year}`,
      //   'ACADEMIC YEARS'
      // );

      // if (
      //   parseInt(graduation_academic_year_id, 10) ===
      //   parseInt(context.academic_year, 10)
      // ) {
      //   throw new Error(
      //     'Please Specify The Graduation Academic Year For These Students.'
      //   );
      // }

      data.programme_id = context.programme_id;
      data.campus_id = context.campus_id;
      data.intake_id = context.intake_id;
      data.academic_year_id = graduation_academic_year_id;
      data.created_by_id = user;

      const insertion = [];

      const chunks = chunk(gradLoadStudents, 100);

      await model.sequelize.transaction(async (transaction) => {
        for (const chunk of chunks) {
          for (const student of chunk) {
            if (!student.cgpa) {
              throw new Error(
                `Student: ${student.surname} ${student.other_names} Has No CGPA.`
              );
            }

            const findDegreeClass = degreeClass.allocations.find(
              (allocation) =>
                parseFloat(allocation.range_from) <= parseFloat(student.cgpa) &&
                parseFloat(student.cgpa) <= parseFloat(allocation.range_to)
            );

            if (!findDegreeClass) {
              throw new Error(
                `Student: ${student.surname} ${student.other_names} Does not Have a Degree Class Matching A CGPA of ${student.cgpa}.`
              );
            }

            if (student.is_current_programme !== true) {
              throw new Error(
                `The Programme Of Student: ${student.surname} ${student.other_names} Is Not Their Current One.`
              );
            }

            const studentName = `${student.surname} ${student.other_names}`;

            data.degree_class_id = findDegreeClass.id;
            data.student_programme_id = student.student_programme_id;
            data.narration = `Meets The Required Programme Graduation Load.`;

            const response =
              await graduationListService.createProvisionalGraduationList(
                data,
                studentName,
                transaction
              );

            await studentService.updateStudentProgramme(
              data.student_programme_id,
              {
                on_provisional_list: true,
              },
              transaction
            );

            insertion.push(response);
          }
        }
      });

      http.setSuccess(
        200,
        'Students Pushed To Provisional Graduation List Successfully.',
        {
          data: insertion,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable To Push Students To Provisional Graduation List.',
        {
          error: error.message,
        }
      );

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   */
  async pushStudentsToGraduationList(req, res) {
    try {
      const data = req.body;
      const user = req.user.id;

      data.created_by_id = user;

      const insertion = [];

      await model.sequelize.transaction(async (transaction) => {
        if (!isEmpty(data.provisional_list_ids)) {
          for (const contextId of data.provisional_list_ids) {
            const graduationListRecord = await graduationListService
              .findOneProvisionalGraduationListRecord({
                where: {
                  id: contextId,
                },
                include: [
                  {
                    association: 'studentProgramme',
                    attributes: [
                      'id',
                      'student_id',
                      'campus_id',
                      'entry_academic_year_id',
                      'current_study_year_id',
                      'intake_id',
                      'is_current_programme',
                    ],
                    include: [
                      {
                        association: 'student',
                        attributes: ['id', 'surname', 'other_names'],
                      },
                    ],
                  },
                ],
                nest: true,
              })
              .then(function (res) {
                if (res) {
                  const result = res.toJSON();

                  return result;
                }
              });

            if (!graduationListRecord) {
              throw new Error(
                `One Of The Records You Have Provided Does not Exist.`
              );
            }

            const studentName = `${graduationListRecord.studentProgramme.student.surname} ${graduationListRecord.studentProgramme.student.other_names}`;

            if (graduationListRecord.is_graduated === true) {
              throw new Error(
                `Student: ${studentName} Has Already Been Moved To The Graduation List.`
              );
            }

            if (
              graduationListRecord.studentProgramme.is_current_programme !==
              true
            ) {
              throw new Error(
                `The Programme Of Student: ${studentName} Is Not Their Current One.`
              );
            }

            data.provisional_list_id = graduationListRecord.id;
            data.degree_class_id = graduationListRecord.degree_class_id;
            data.narration = graduationListRecord.narration;

            const response =
              await graduationListService.createFinalGraduationList(
                data,
                studentName,
                transaction
              );

            await graduationListService.updateProvisionalGraduationListRecord(
              contextId,
              {
                is_on_final_list: true,
              },
              transaction
            );

            await studentService.updateStudentProgramme(
              graduationListRecord.studentProgramme.id,
              {
                on_graduation_list: true,
              },
              transaction
            );

            insertion.push(response);
          }
        }
      });

      http.setSuccess(
        200,
        'Students Pushed To Final Graduation List Successfully.',
        {
          data: insertion,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Push Students To Final Graduation List.', {
        error: error.message,
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   */
  async billStudentsOnGraduationList(req, res) {
    try {
      const data = req.body;
      const user = req.user.id;

      data.created_by_id = user;

      const insertion = [];

      const metadataValues = await metadataValueService.findAllMetadataValues({
        include: {
          association: 'metadata',
          attributes: ['id', 'metadata_name'],
        },
        attributes: ['id', 'metadata_value'],
      });

      await model.sequelize.transaction(async (transaction) => {
        if (!isEmpty(data.graduation_list_ids)) {
          for (const contextId of data.graduation_list_ids) {
            const graduationListRecord = await graduationListService
              .fetchFinalGraduationList({
                where: {
                  id: contextId,
                },
                include: [
                  {
                    association: 'provisional',
                    include: [
                      {
                        association: 'studentProgramme',
                        ...studentProgrammeAttributes(),
                      },
                    ],
                  },
                ],
                nest: true,
              })
              .then(function (res) {
                if (res) {
                  const result = res.toJSON();

                  return result;
                }
              });

            if (!graduationListRecord) {
              throw new Error(
                `One Of The Records You Have Provided Does not Exist.`
              );
            }

            const gradInvoiceCheck =
              await graduationFeesService.findOneGraduationFeesInvoice({
                where: {
                  student_id:
                    graduationListRecord.provisional.studentProgramme
                      .student_id,
                  student_programme_id:
                    graduationListRecord.provisional.studentProgramme.id,
                },
                raw: true,
                nest: true,
              });

            if (!gradInvoiceCheck) {
              // throw new Error(
              //   `Student Graduation Invoice Already Exits For ${graduationListRecord.provisional.studentProgramme.registration_number} :-> Please check Invoices`
              // );

              const studentName = `Student With Registration Number: ${graduationListRecord.provisional.studentProgramme.registration_number} And Student Number: ${graduationListRecord.provisional.studentProgramme.student_number}`;

              // if (graduationListRecord.is_graduated === false) {
              //   throw new Error(
              //     `Student: ${studentName} Has Already Been Moved To The Graduation List.`
              //   );
              // }

              if (
                graduationListRecord.provisional.studentProgramme
                  .is_current_programme !== true
              ) {
                throw new Error(
                  `The Programme Of ${studentName} Is Not Their Current One.`
                );
              }

              const findGraduationFeeAmounts = await graduationFeesService
                .findOneGraduationFees({
                  where: {
                    grad_academic_year_id:
                      graduationListRecord.provisional.academic_year_id,
                    campus_id:
                      graduationListRecord.provisional.studentProgramme
                        .campus_id,
                    billing_category_id:
                      graduationListRecord.provisional.studentProgramme
                        .billing_category_id,
                    programme_study_level_id:
                      graduationListRecord.provisional.studentProgramme
                        .programme.programme_study_level_id,
                  },
                  include: [
                    {
                      association: 'graduationFeesElements',
                      include: [
                        {
                          association: 'currency',
                        },
                      ],
                    },
                  ],
                  nest: true,
                })
                .then(function (res) {
                  if (res) {
                    const result = res.toJSON();

                    return result;
                  }
                });

              if (!findGraduationFeeAmounts) {
                throw new Error(
                  `Unable To Find A Graduation Fees Context Matching ${studentName}.`
                );
              }

              const findMandatoryInvoiceTypeId = getMetadataValueId(
                metadataValues,
                'MANDATORY',
                'INVOICE TYPES'
              );

              const findActiveInvoiceStatusId = getMetadataValueId(
                metadataValues,
                'ACTIVE',
                'INVOICE STATUSES'
              );

              data.invoice_type_id = findMandatoryInvoiceTypeId;
              data.invoice_status_id = findActiveInvoiceStatusId;
              data.grad_list_id = contextId;
              data.student_id =
                graduationListRecord.provisional.studentProgramme.student_id;
              data.student_programme_id =
                graduationListRecord.provisional.studentProgramme.id;
              data.description = 'Graduation Fees';
              data.currency =
                findGraduationFeeAmounts.graduationFeesElements[0].currency.metadata_value;

              data.graduationInvoiceFeesElement = [];

              if (!isEmpty(findGraduationFeeAmounts.graduationFeesElements)) {
                findGraduationFeeAmounts.graduationFeesElements.forEach(
                  (element) => {
                    data.graduationInvoiceFeesElement.push({
                      fees_element_id: element.fees_element_id,
                      currency:
                        findGraduationFeeAmounts.graduationFeesElements[0]
                          .currency.metadata_value,
                      amount: element.amount,
                    });
                  }
                );
              }

              const response =
                await graduationFeesService.generateGraduationFeesInvoice(
                  data,
                  transaction
                );

              await graduationListService.updateFinalGraduationList(
                contextId,
                {
                  has_been_billed: true,
                },
                transaction
              );

              insertion.push(response);
            }
          }
        }
      });

      http.setSuccess(
        200,
        'Students Billed On Final Graduation List Successfully.',
        {
          data: insertion,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Bill Students On Final Graduation List.', {
        error: error.message,
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   */
  async downloadBulkBillingTemplate(req, res) {
    try {
      const { user } = req;
      const workbook = new excelJs.Workbook();
      const rootSheet = workbook.addWorksheet('BULK GRADUATION LIST BILLING');
      const academicYearSheet = workbook.addWorksheet('Sheet2');

      rootSheet.properties.defaultColWidth =
        bulkGraduationListBillingColumns.length;
      rootSheet.columns = bulkGraduationListBillingColumns;
      academicYearSheet.state = 'veryHidden';

      const metadata = await metadataService.findAllMetadata({
        attributes: ['metadata_name'],
        include: [
          { association: 'metadataValues', attributes: ['metadata_value'] },
        ],
        raw: true,
        nest: true,
      });

      academicYearSheet.addRows(getMetadataValues(metadata, 'ACADEMIC YEARS'));

      // Column Validations
      rootSheet.dataValidations.add('B2:B1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=Sheet2!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid value from the list',
      });

      const uploadPath = `${process.cwd()}/src/assets/documents/templates`;

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true }, (err) => {
          throw new Error(err.message);
        });
      }

      const template = `${uploadPath}/download-graduation-list-template-${
        user.surname
      }-${user.other_names}-${user.id}-${now()}.xlsm`;

      await workbook.xlsx.writeFile(template);
      await res.download(
        template,
        'BULK-GRADUATION-LIST-BILLING-TEMPLATE.xlsx',
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
  uploadBulkGraduationListBillingTemplate(req, res) {
    try {
      const data = req.body;
      const user = req.user.id;
      const form = new formidable.IncomingForm();
      const uploads = [];

      data.created_by_id = user;

      form.parse(req, async (err, fields, files) => {
        if (err) {
          http.setError(400, 'Unable To Upload Records.', {
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
        const uploadedRecords = XLSX.utils.sheet_to_json(
          workbook.Sheets[myTemplate]
        );

        if (isEmpty(uploadedRecords)) {
          http.setError(400, 'Cannot upload an empty template.');

          return http.send(res);
        }

        const metadataValues = await metadataValueService.findAllMetadataValues(
          {
            include: ['metadata'],
          }
        );

        try {
          await model.sequelize.transaction(async (transaction) => {
            for (const record of uploadedRecords) {
              if (!record['STUDENT NUMBER']) {
                throw new Error(
                  `One Of The Records Provided Has No Student Number.`
                );
              }
              const errName = toUpper(
                trim(record['STUDENT NUMBER'])
              ).toString();

              validateSheetColumns(
                record,
                ['STUDENT NUMBER', 'GRADUATION ACADEMIC YEAR'],
                errName
              );

              const studentProgramme = await identifyStudent(
                record['STUDENT NUMBER'],
                errName
              );

              data.student_programme_id = studentProgramme.id;

              data.academic_year_id = getMetadataValueId(
                metadataValues,
                record['GRADUATION ACADEMIC YEAR'],
                'ACADEMIC YEARS',
                errName
              );

              const response = await billGraduationInvoice(
                data.academic_year_id,
                studentProgramme,
                metadataValues,
                transaction,
                errName
              );

              uploads.push(response);
            }
          });
          http.setSuccess(200, 'All Records Uploaded Successfully.', {
            data: uploads,
          });

          return http.send(res);
        } catch (error) {
          http.setError(400, 'Unable To Upload Records.', {
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
   *
   * @param {*} req
   * @param {*} res
   */
  async generatePaymentReference(req, res) {
    try {
      const data = {};

      const { graduationInvoiceId } = req.params;

      const metadataValues = await metadataValueService.findAllMetadataValues({
        include: ['metadata'],
      });

      const findActiveInvoiceStatusId = getMetadataValueId(
        metadataValues,
        'ACTIVE',
        'INVOICE STATUSES'
      );

      const findInvoice = await graduationFeesService
        .findOneGraduationFeesInvoice({
          where: {
            id: graduationInvoiceId,
            invoice_status_id: findActiveInvoiceStatusId,
          },
          include: [
            {
              association: 'graduationInvoiceFeesElement',
            },
            {
              association: 'student',
              attributes: ['id', 'surname', 'other_names'],
            },
          ],
          nest: true,
        })
        .then((res) => {
          if (res) {
            return res.toJSON();
          }
        });

      if (!findInvoice) {
        throw new Error(`Unable To Find A Graduation Fees Invoice Provided.`);
      }

      const category = { category: 'graduation' };

      const graduationItemAmount = feesItemAllocation(
        category,
        findInvoice,
        findInvoice.amount_due
      );

      const feesElementAllocationData = [];

      if (graduationItemAmount) {
        graduationItemAmount.graduationInvoiceFeesElement.forEach((element) => {
          feesElementAllocationData.push({
            fees_element_id: element.fees_element_id,
            amount: element.item_amount,
            invoice_number: graduationItemAmount.invoice_number,
          });
        });
      }

      data.full_name = toUpper(
        `${findInvoice.student.surname} ${findInvoice.student.other_names}`
      );

      data.payment_mode = 'CASH';
      data.payment_bank_code = 'STN';

      const referenceNumberGenerator = await generatePaymentReference(
        findInvoice.amount_due,
        data.full_name,
        data.payment_mode,
        data.payment_bank_code,
        data.payment_mobile_no
      );

      data.reference = {
        tax_payer_name: referenceNumberGenerator.tax_payer_name,
        ura_prn: referenceNumberGenerator.ura_prn,
        system_prn: referenceNumberGenerator.system_prn,
        search_code: referenceNumberGenerator.search_code,
        amount: referenceNumberGenerator.amount,
        expiry_date: referenceNumberGenerator.expiry_date,
        payment_mode: data.payment_mode,
        payment_bank_code: data.payment_bank_code,
        tax_payer_bank_code: data.tax_payer_bank_code,
        generated_by: data.full_name,
        ip_address: req.connection.remoteAddress,
        user_agent: req.get('user-agent'),
      };

      const create = await model.sequelize.transaction(async (transaction) => {
        const payload = {
          system_prn: referenceNumberGenerator.system_prn,
          ura_prn: referenceNumberGenerator.ura_prn,
          search_code: referenceNumberGenerator.search_code,
          tax_payer_name: referenceNumberGenerator.tax_payer_name,
          payment_mode: data.payment_mode,
          reference_origin: `GRADUATION-FEES`,
          amount: referenceNumberGenerator.amount,
          student_id: findInvoice.student_id,
          student_programme_id: findInvoice.student_programme_id,
          expiry_date: referenceNumberGenerator.expiry_date,
          generated_by: data.full_name,
          graduationInvoices: [
            {
              graduation_fees_invoice_id: findInvoice.id,
              amount: referenceNumberGenerator.amount,
            },
          ],
        };

        if (!isEmpty(feesElementAllocationData)) {
          const mappedData = feesElementAllocationData.map((obj) => ({
            ...obj,
            ura_prn: referenceNumberGenerator.ura_prn,
            system_prn: referenceNumberGenerator.system_prn,
            student_id: findInvoice.student_id,
            student_programme_id: findInvoice.student_programme_id,
          }));

          payload.elementAllocation = mappedData;
        }

        const paymentReference =
          await paymentReferenceService.createPaymentReference(
            payload,
            transaction
          );

        const prnTrackerData = {
          ip_address: data.reference.ip_address,
          user_agent: data.reference.user_agent,
          category: 'GRADUATION-FEES',
          system_prn: referenceNumberGenerator.system_prn,
          ura_prn: referenceNumberGenerator.ura_prn,
          search_code: referenceNumberGenerator.search_code,
          amount: referenceNumberGenerator.amount,
          tax_payer_name: referenceNumberGenerator.tax_payer_name,
          payment_mode: data.payment_mode,
          payment_bank_code: data.payment_bank_code,
          tax_payer_bank_code: data.tax_payer_bank_code,
          generated_by: data.reference.generated_by,
          expiry_date: referenceNumberGenerator.expiry_date,
        };

        await prnTrackerRecord(prnTrackerData, transaction);

        return paymentReference;
      });

      http.setSuccess(
        200,
        'Graduation Invoice Payment Reference Created Successfully.',
        {
          data: create,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable To Create Graduation Invoice Payment Reference.',
        {
          error: { message: error.message },
        }
      );

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   */
  async graduateStudents(req, res) {
    try {
      const data = req.body;
      const user = req.user.id;

      data.created_by_id = user;

      const insertion = [];

      const random = Math.floor(Math.random() * moment().unix());
      const generatedBatchNumber = `BATCH-${random}`;

      const metadataValues = await metadataValueService.findAllMetadataValues({
        include: {
          association: 'metadata',
          attributes: ['id', 'metadata_name'],
        },
        attributes: ['id', 'metadata_value'],
      });

      const findCompletedGraduandAccountStatusId = getMetadataValueId(
        metadataValues,
        'COMPLETED-GRADUAND',
        'STUDENT ACADEMIC STATUSES'
      );

      await model.sequelize.transaction(async (transaction) => {
        if (!isEmpty(data.graduation_list_ids)) {
          for (const contextId of data.graduation_list_ids) {
            const graduationListRecord = await graduationListService
              .fetchFinalGraduationList({
                where: {
                  id: contextId,
                },
                include: [
                  {
                    association: 'provisional',
                    include: [
                      {
                        association: 'studentProgramme',
                        attributes: ['id', 'student_id'],
                        include: [
                          {
                            association: 'student',
                            attributes: ['id', 'surname', 'other_names'],
                          },
                        ],
                      },
                    ],
                  },
                ],
                nest: true,
              })
              .then(function (res) {
                if (res) {
                  const result = res.toJSON();

                  return result;
                }
              });

            if (!graduationListRecord) {
              throw new Error(
                `One Of The Records You Have Provided Does not Exist.`
              );
            }

            const studentName = `${graduationListRecord.provisional.studentProgramme.student.surname} ${graduationListRecord.provisional.studentProgramme.student.other_names}`;

            data.student_programme_id =
              graduationListRecord.provisional.student_programme_id;
            data.academic_year_id =
              graduationListRecord.provisional.academic_year_id;
            data.student_academic_status_id =
              findCompletedGraduandAccountStatusId;
            data.graduation_list_batch = generatedBatchNumber;
            data.reason = graduationListRecord.provisional.narration;

            const response =
              await graduationListService.createGraduationAcademicStatus(
                data,
                studentName,
                transaction
              );

            await graduationListService.updateFinalGraduationList(
              contextId,
              {
                graduation_date: data.graduation_date,
                graduation_congregation_number:
                  data.graduation_congregation_number,
                graduation_year: data.graduation_year,
                completion_year: data.completion_year,
                is_graduated: true,
              },
              transaction
            );

            await studentService.updateStudentProgramme(
              data.student_programme_id,
              {
                has_completed: true,
                on_graduation_list: true,
              },
              transaction
            );

            insertion.push(response);
          }
        }
      });

      http.setSuccess(200, 'Students Graduated Successfully.', {
        data: insertion,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Graduate Students.', {
        error: error.message,
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   */
  async administrativeProvisionalGradList(req, res) {
    try {
      const data = req.body;
      const { email, id: userId } = req.user;

      await blockCollegesExcept(
        data.programme_id,
        email,
        data.graduation_academic_year_id
      );

      data.created_by_id = userId;

      data.academic_year_id = data.graduation_academic_year_id;

      const insertion = [];

      const context = {
        programme_id: data.programme_id,
      };

      const metadataValues = await metadataValueService.findAllMetadataValues({
        attributes: ['metadata_value', 'id'],
        include: 'metadata',
      });

      const academicYear = await getMetadataValueName(
        metadataValues,
        data.academic_year_id,
        'ACADEMIC YEARS',
        'SELECTED ACADEMIC YEAR'
      );

      const degreeClass = await degreeClassFunction(context);

      await model.sequelize.transaction(async (transaction) => {
        if (!isEmpty(data.students)) {
          for (const student of data.students) {
            const studentProgramme = await studentService
              .findOneStudentProgramme({
                where: {
                  id: student.student_programme_id,
                },
                attributes: [
                  'id',
                  'student_id',
                  'campus_id',
                  'entry_academic_year_id',
                  'current_study_year_id',
                  'intake_id',
                  'is_current_programme',
                  'on_provisional_list',
                ],
                include: [
                  {
                    association: 'student',
                    attributes: ['id', 'surname', 'other_names'],
                  },
                ],
                nest: true,
              })
              .then(function (res) {
                if (res) {
                  const result = res.toJSON();

                  return result;
                }
              });

            if (!studentProgramme) {
              throw new Error(
                `One of the student Records You Have Provided Does not Exist.`
              );
            }

            const studentName = `${studentProgramme.student.surname} ${studentProgramme.student.other_names}`;

            if (!student.cgpa) {
              throw new Error(`Student: ${studentName} Has No CGPA.`);
            }

            const findDegreeClass = degreeClass.allocations.find(
              (allocation) =>
                parseFloat(allocation.range_from) <= parseFloat(student.cgpa) &&
                parseFloat(student.cgpa) <= parseFloat(allocation.range_to)
            );

            if (!findDegreeClass) {
              throw new Error(
                `Student: ${student.studentName} Does not Have a Degree Class Matching A CGPA of ${student.cgpa}.`
              );
            }

            if (studentProgramme.is_current_programme !== true) {
              throw new Error(
                `The Programme Of Student: ${studentName} Is Not Their Current One.`
              );
            }

            data.degree_class_id = findDegreeClass.id;
            data.student_programme_id = student.student_programme_id;
            data.is_administratively_added = true;

            const response =
              await graduationListService.createProvisionalGraduationList(
                data,
                studentName,
                transaction
              );

            if (response[1] === false) {
              throw new Error(
                `${studentName} has already been added to the provisional list under academic year: ${academicYear}.`
              );
            }

            insertion.push(response);
          }

          await studentService.updateStudentProgramme(
            data.student_programme_id,
            {
              on_provisional_list: true,
            },
            transaction
          );
        }
      });

      http.setSuccess(
        200,
        'Students Pushed To Provisional Graduation List Successfully.',
        {
          data: insertion,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable To Push Students To Provisional Graduation List.',
        {
          error: error.message,
        }
      );

      return http.send(res);
    }
  }

  /**
   * push to provisional
   *
   * @param {*} req
   * @param {*} res
   * @returns
   */

  async selectPushToProvisional(req, res) {
    try {
      const data = req.body;
      const { email, id: userId } = req.user;

      await blockCollegesExcept(
        data.programme_id,
        email,
        data.graduation_academic_year_id
      );

      data.created_by_id = userId;
      data.academic_year_id = data.graduation_academic_year_id;

      const resultCategories = await pushToProvisional({
        ...data,
        academic_year: data.academic_year_id,
      });

      if (resultCategories && isEmpty(resultCategories[data.category])) {
        throw new Error('There are no students in this Result Category');
      }

      const categoryResults = resultCategories[data.category];

      if (data.category === 'doNotMeetCoreCourses' && !data.narration) {
        throw new Error(
          `Please for category Result CoreS ' NOT EQUAL' Version Cores, Provide a CLEAR NARRATION`
        );
      }

      const context = {
        programme_id: data.programme_id,
      };
      const degreeClass = await degreeClassFunction(context);

      const provisionalLitAdded = await model.sequelize.transaction(
        async (transaction) => {
          const insertion = [];

          for (const studentId of data.students) {
            const findStudentResult = find(
              categoryResults,
              (result) => studentId === result.student_id
            );

            if (!findStudentResult) {
              throw new Error(
                `One of the student Records does not belong to this category.`
              );
            }

            const findDegreeClass = degreeClass.allocations.find(
              (allocation) =>
                parseFloat(allocation.range_from) <=
                  parseFloat(findStudentResult.cgpa) &&
                parseFloat(findStudentResult.cgpa) <=
                  parseFloat(allocation.range_to)
            );

            const studentName = `${findStudentResult.surname} ${findStudentResult.other_names}`;

            if (!findDegreeClass) {
              throw new Error(
                `Student: ${studentName} Does not Have a Degree Class Matching A CGPA of ${findStudentResult.cgpa}.`
              );
            }

            if (findStudentResult.is_current_programme !== true) {
              throw new Error(
                `The Programme Of Student: ${studentName} Is Not Their Current One.`
              );
            }

            data.degree_class_id = findDegreeClass.id;
            data.student_programme_id = findStudentResult.student_programme_id;

            const response =
              await graduationListService.createProvisionalGraduationList(
                {
                  programme_id: data.programme_id,
                  campus_id: data.campus_id,
                  intake_id: data.intake_id,
                  narration: data.narration,
                  created_by_id: data.created_by_id,
                  academic_year_id: data.academic_year_id,
                  degree_class_id: data.degree_class_id,
                  student_programme_id: data.student_programme_id,
                  is_administratively_added:
                    data.category === 'doNotMeetCoreCourses',
                },
                studentName,
                transaction
              );

            insertion.push(response);

            await studentService.updateStudentProgramme(
              data.student_programme_id,
              {
                on_provisional_list: true,
              },
              transaction
            );
          }

          return insertion;
        }
      );

      http.setSuccess(
        200,
        'Students Pushed To Provisional List Successfully.',
        {
          data: provisionalLitAdded,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(
        400,
        'Unable To Push Students To Provisional Graduation List.',
        {
          error: error.message,
        }
      );

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async downloadDraftGraduationListFunction(req, res) {
    try {
      const { user } = req;

      const context = req.query;

      if (
        !context.campus_id ||
        !context.intake_id ||
        !context.programme_id ||
        !context.academic_year
      ) {
        throw new Error('Invalid Context Provided');
      }

      const finalStudyYear = await graduationListService.maxProgrammeStudyYear(
        context
      );

      const id = req.query.academic_year;
      const entryId = req.query.entry_academic_year;

      const metadata = await metadataValueService.findOneMetadataValue({
        where: { id },
      });
      const entryMetadata = await metadataValueService.findOneMetadataValue({
        where: { id: entryId },
      });

      const academicYearData = metadata.dataValues;
      const entryYearData = entryMetadata.dataValues;

      const contextData = {
        ...context,
        finalYearMetadata: finalStudyYear.programme_study_year_id,
        finalYearContext: finalStudyYear.context_id,
        academicYearData: academicYearData,
        entryYearData: entryYearData,
      };

      const filterData = await graduationListService.graduationProvisionalList(
        contextData
      );

      const { normalProgress, mopUpCases } = await studentByEntryYear(
        filterData,
        contextData
      );

      const institutionStructure =
        await institutionStructureService.findInstitutionStructureRecords({
          attributes: ['institution_name', 'institution_logo'],
        });

      if (!institutionStructure)
        throw new Error('Unable To Find Institution Structure.');

      const findProgramme = await programmeService.findOneProgramme({
        where: { id: context.programme_id },
        raw: true,
      });

      if (!findProgramme) throw new Error('Invalid Programme Selected');

      const metadataValues = await metadataValueService.findAllMetadataValues({
        attributes: ['metadata_value', 'id'],
        include: 'metadata',
      });

      const campus = await getMetadataValueName(
        metadataValues,
        context.campus_id,
        'CAMPUSES',
        'SELECTED GRADUATION CONTEXT'
      );

      const intake = await getMetadataValueName(
        metadataValues,
        context.intake_id,
        'INTAKES',
        'SELECTED GRADUATION CONTEXT'
      );

      const academicYear = getMetadataValueName(
        metadataValues,
        context.academic_year,
        'ACADEMIC YEARS'
      );

      const templateData = [];

      if (!isEmpty(normalProgress)) {
        templateData.push(['NORMAL PROGRESS']);
        templateData.push([]);

        normalProgress.forEach((student) => {
          templateData.push([
            toUpper(student.registration_number),
            `${student.surname} ${student.other_names}`,
            toUpper(student.student_number),
            toUpper(student.gender),
            student.programme_type,
            student.programme_study_level,
            student.total_credit_units,
            student.graduation_load,
            student.cgpa ? parseFloat(student.cgpa).toFixed(2) : 'N/A',
            student.degree_class,
            student.entry_academic_year,
            student.current_study_year,
          ]);
        });
      }

      if (!isEmpty(mopUpCases)) {
        templateData.push([]);
        templateData.push(['MOP UP CASES']);
        templateData.push([]);

        mopUpCases.forEach((student) => {
          templateData.push([
            toUpper(student.registration_number),
            `${student.surname} ${student.other_names}`,
            toUpper(student.student_number),
            toUpper(student.gender),
            student.programme_type,
            student.programme_study_level,
            student.total_credit_units,
            student.graduation_load,
            student.cgpa ? parseFloat(student.cgpa).toFixed(2) : 'N/A',
            student.degree_class,
            student.entry_academic_year,
            student.current_study_year,
          ]);
        });
      }

      const workbook = new excelJs.Workbook();
      const createGraduationListSheet = workbook.addWorksheet(
        'GRADUATION LIST DRAFT'
      );

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

      createGraduationListSheet.addImage(logo, {
        ext: { width: 86, height: 86 },
        tl: { col: 3, row: 0 },
        editAs: 'absolute',
      });

      createGraduationListSheet.mergeCells('C1', 'O3');
      createGraduationListSheet.mergeCells('A1', 'B2');
      const titleCell = createGraduationListSheet.getCell('C1');

      createGraduationListSheet.getRow(1).height = 60;

      titleCell.value = `${
        institutionStructure.institution_name || 'TERP'
      } \n ${campus} \n ${findProgramme.programme_code}: ${
        findProgramme.programme_title
      } - GRADUATION LIST DRAFT \n ACADEMIC YEAR - ${academicYear} \n ${intake} - INTAKE`;

      titleCell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
      };

      titleCell.font = { bold: true, size: 10, name: 'Arial' };

      const headerRow = createGraduationListSheet.getRow(3);

      headerRow.values = map(graduationListColumns, 'header');
      headerRow.font = { bold: true, size: 11, color: '#2c3e50' };
      createGraduationListSheet.columns = graduationListColumns.map(
        (column) => {
          delete column.header;

          return column;
        }
      );
      createGraduationListSheet.getRow(3).height = 40;

      createGraduationListSheet.views = [
        {
          state: 'frozen',
          xSplit: 0,
          ySplit: 3,
          topLeftCell: 'G10',
          activeCell: 'A1',
        },
      ];

      createGraduationListSheet.addRows(templateData);

      const uploadPath = `${process.cwd()}/src/assets/documents/templates`;

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true }, (err) => {
          throw new Error(err.message);
        });
      }

      const template = `${uploadPath}/draft-graduation-list-${user.surname}-${
        user.other_names
      }-${user.id}-${now()}.xlsm`;

      await workbook.xlsx.writeFile(template);
      await res.download(template, 'DRAFT-GRADUATION-LIST.xlsx', (error) => {
        if (error) {
          throw new Error(error.message);
        }
      });
    } catch (error) {
      http.setError(400, 'Unable To Download Draft Graduation List ', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async downloadFinalGraduationListFunction(req, res) {
    try {
      const { user } = req;

      const context = req.query;

      if (
        !context.campus_id ||
        !context.intake_id ||
        !context.programme_id ||
        !context.academic_year_id
      ) {
        throw new Error('Invalid Context Provided');
      }

      const finalGraduationList = await generateFinalList(context);

      const institutionStructure =
        await institutionStructureService.findInstitutionStructureRecords({
          attributes: ['institution_name', 'institution_logo'],
        });

      if (!institutionStructure)
        throw new Error('Unable To Find Institution Structure.');

      const findProgramme = await programmeService.findOneProgramme({
        where: { id: context.programme_id },
        raw: true,
      });

      if (!findProgramme) throw new Error('Invalid Programme Selected');

      const metadataValues = await metadataValueService.findAllMetadataValues({
        attributes: ['metadata_value', 'id'],
        include: 'metadata',
      });

      const campus = await getMetadataValueName(
        metadataValues,
        context.campus_id,
        'CAMPUSES',
        'SELECTED GRADUATION CONTEXT'
      );

      const intake = await getMetadataValueName(
        metadataValues,
        context.intake_id,
        'INTAKES',
        'SELECTED GRADUATION CONTEXT'
      );

      const academicYear = await getMetadataValueName(
        metadataValues,
        context.academic_year_id,
        'ACADEMIC YEARS',
        'SELECTED GRADUATION CONTEXT'
      );

      const templateData = [];

      templateData.push([]);

      finalGraduationList.forEach((student) => {
        templateData.push([
          toUpper(student.registration_number),
          `${student.surname}  ${student.other_names}`,
          toUpper(student.gender),
          // student.programme_type,
          // student.programme_study_level,
          student.total_credit_units,
          student.cgpa ? parseFloat(student.cgpa).toFixed(2) : 'N/A',
          student.degree_class,
          student.entry_academic_year,
          student.graduation_academic_year,
        ]);
      });

      // if (!isEmpty(normalProgress)) {
      //   // const sortedNormalProgress = sortArrayAlphabetically(normalProgress);

      //   // templateData.push(['NORMAL PROGRESS']);
      //   templateData.push([]);

      //   sortedNormalProgress.forEach((student) => {
      //     templateData.push([
      //       toUpper(student.registration_number),
      //       `${student.surname} ${student.other_names}`,
      //       toUpper(student.student_number),
      //       toUpper(student.gender),
      //       student.programme_type,
      //       student.programme_study_level,
      //       student.total_credit_units,
      //       student.graduation_load,
      //       student.cgpa ? parseFloat(student.cgpa).toFixed(2) : 'N/A',
      //       student.degree_class,
      //       student.entry_academic_year,
      //       student.current_study_year,
      //     ]);
      //   });
      // }

      // if (!isEmpty(mopUpCases)) {
      //   const sortedMopUpCases = sortArrayAlphabetically(mopUpCases);

      //   templateData.push([]);
      //   templateData.push(['MOP UP CASES']);
      //   templateData.push([]);

      //   sortedMopUpCases.forEach((student) => {
      //     templateData.push([
      //       toUpper(student.registration_number),
      //       `${student.surname} ${student.other_names}`,
      //       toUpper(student.student_number),
      //       toUpper(student.gender),
      //       student.programme_type,
      //       student.programme_study_level,
      //       student.total_credit_units,
      //       student.graduation_load,
      //       student.cgpa ? parseFloat(student.cgpa).toFixed(2) : 'N/A',
      //       student.degree_class,
      //       student.entry_academic_year,
      //       student.current_study_year,
      //     ]);
      //   });
      // }

      const workbook = new excelJs.Workbook();
      const createGraduationListSheet = workbook.addWorksheet(
        'FINAL GRADUATION LIST'
      );

      // let imagePath = '';

      // if (
      //   fs.existsSync(
      //     `${process.cwd()}/src/assets/logo/${
      //       institutionStructure.institution_logo
      //     }`
      //   )
      // ) {
      //   imagePath = `${process.cwd()}/src/assets/logo/${
      //     institutionStructure.institution_logo
      //   }`;
      // } else if (
      //   fs.existsSync(`${process.cwd()}/src/assets/logo/default.png`)
      // ) {
      //   imagePath = `${process.cwd()}/src/assets/logo/default.png`;
      // }
      // } else {
      //   throw new Error('No Default Image was selected');
      // }

      // const logo = workbook.addImage({
      //   filename: imagePath,
      //   extension: imagePath.substring(imagePath.lastIndexOf('.') + 1),
      // });

      // createGraduationListSheet.addImage(logo, {
      //   ext: { width: 86, height: 86 },
      //   tl: { col: 3, row: 0 },
      //   editAs: 'absolute',
      // });

      createGraduationListSheet.mergeCells('C1', 'O3');
      createGraduationListSheet.mergeCells('A1', 'B2');
      const titleCell = createGraduationListSheet.getCell('C1');

      createGraduationListSheet.getRow(1).height = 60;

      titleCell.value = `${
        institutionStructure.institution_name || 'TERP'
      } \n ${campus} \n ${findProgramme.programme_code}: ${
        findProgramme.programme_title
      } - FINAL GRADUATION LIST  \n ACADEMIC YEAR - ${academicYear} \n ${intake} - INTAKE`;

      titleCell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
      };

      titleCell.font = { bold: true, size: 10, name: 'Arial' };

      const headerRow = createGraduationListSheet.getRow(3);

      headerRow.values = map(finalGraduationListColumns, 'header');
      headerRow.font = { bold: true, size: 11, color: '#2c3e50' };
      createGraduationListSheet.columns = finalGraduationListColumns.map(
        (column) => {
          delete column.header;

          return column;
        }
      );
      createGraduationListSheet.getRow(3).height = 40;

      createGraduationListSheet.views = [
        {
          state: 'frozen',
          xSplit: 0,
          ySplit: 3,
          topLeftCell: 'G10',
          activeCell: 'A1',
        },
      ];

      createGraduationListSheet.addRows(templateData);

      const uploadPath = `${process.cwd()}/src/assets/documents/templates`;

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true }, (err) => {
          throw new Error(err.message);
        });
      }

      const template = `${uploadPath}/final-graduation-list-${user.surname}-${
        user.other_names
      }-${user.id}-${now()}.xlsm`;

      await workbook.xlsx.writeFile(template);
      await res.download(template, 'FINAL-GRADUATION-LIST.xlsx', (error) => {
        if (error) {
          throw new Error(error.message);
        }
      });
    } catch (error) {
      http.setError(400, 'Unable To Download Final Graduation List ', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * UPDATE
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async updateGraduationListAcademicYear(req, res) {
    try {
      const { id: user } = req.user;
      const data = req.body;

      data.updated_at = moment.now();
      data.last_updated_by_id = user;

      const findAllProvisionalStudents =
        await graduationListService.findAllProvisionalGraduationListRecords({
          raw: true,
        });

      const metadataValues = await metadataValueService.findAllMetadataValues({
        include: {
          association: 'metadata',
          attributes: ['id', 'metadata_name'],
        },
        attributes: ['id', 'metadata_value'],
      });

      const findCompletedGraduandAccountStatusId = getMetadataValueId(
        metadataValues,
        'COMPLETED-GRADUAND',
        'STUDENT ACADEMIC STATUSES'
      );

      const academicYear = await getMetadataValueName(
        metadataValues,
        data.academic_year_id,
        'ACADEMIC YEARS',
        'SELECTED ACADEMIC YEAR'
      );

      const result = [];

      await model.sequelize.transaction(async (transaction) => {
        if (!isEmpty(data.provisional_graduation_list_ids)) {
          for (const id of data.provisional_graduation_list_ids) {
            const findRecord = findAllProvisionalStudents.find(
              (record) => parseInt(record.id, 10) === parseInt(id, 10)
            );

            if (!findRecord) {
              throw new Error(
                `Unable To Find One Of The Provisional List Records.`
              );
            }

            const record =
              await graduationListService.updateProvisionalGraduationListRecord(
                id,
                {
                  academic_year_id: data.academic_year_id,
                },
                transaction
              );

            await graduationListService.updateFinalGraduationListWithConstraints(
              {
                provisional_list_id: id,
              },
              {
                graduation_year: academicYear,
                academic_year_id: data.academic_year_id,
              },
              transaction
            );

            await graduationListService.updateStudentProgrammeAcademicStatus(
              {
                student_programme_id: findRecord.student_programme_id,
                student_academic_status_id:
                  findCompletedGraduandAccountStatusId,
              },
              {
                academic_year_id: data.academic_year_id,
              },
              transaction
            );

            result.push(record[1][0]);
          }
        }
      });

      http.setSuccess(
        200,
        'Students On Graduation List Updated Successfully.',
        {
          data: result,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Update Students On Graduation List.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * REMOVE STUDENTS FROM PROVISIONAL LIST
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async removeFromFinalList(req, res) {
    try {
      const {
        programme_id: programmeId,
        graduation_list_ids: graduationListIds,
      } = req.body;
      const { id: user } = req.user;

      const findAllGradStudents =
        await graduationListService.allFinalGraduationList({
          where: {
            id: graduationListIds,
          },
          include: [
            {
              association: 'provisional',
              attributes: ['id', 'student_programme_id', 'academic_year_id'],
              include: {
                association: 'studentProgramme',
                where: {
                  programme_id: programmeId,
                },
              },
            },
          ],
        });

      await model.sequelize.transaction(async (transaction) => {
        if (!isEmpty(findAllGradStudents)) {
          for (const contextId of graduationListIds) {
            const findRecord = find(
              findAllGradStudents,
              (record) => parseInt(record.id, 10) === parseInt(contextId, 10)
            );

            if (!findRecord) {
              throw new Error(
                `Unable To Find One Of The Provisional List Records.`
              );
            }

            await studentProgrammeService.update(
              {
                id: findRecord.provisional.student_programme_id,
                on_provisional_list: true,
                on_graduation_list: true,
              },
              {
                on_provisional_list: true,
                on_graduation_list: false,
                is_current_programme: true,
              },
              transaction
            );

            await graduationListService.updateProvisionalGraduationListRecord(
              findRecord.provisional_list_id,
              {
                is_on_final_list: false,
              },
              transaction
            );

            await graduationFeesService.destroyGraduationFeesInvoice({
              where: {
                grad_list_id: contextId,
                student_programme_id:
                  findRecord.provisional.student_programme_id,
              },
              transaction,
            });

            await graduationListService.destroyFinalGraduationList(
              {
                id: findRecord.id,
              },
              transaction
            );

            await academicDocumentService.deleteRecord(
              {
                student_programme_id:
                  findRecord.provisional.student_programme_id,
              },
              transaction
            );

            await activityLog(
              'createResultLog',
              user,
              'DELETE',
              'FINAL GRADUATION LIST',
              `Removed student: ${findRecord.provisional.studentProgramme.student_number}/${findRecord.provisional.studentProgramme.registration_number} from final graduation list`,
              findRecord,
              null,
              `FINAL GRADUATION LIST`,
              `iPv4-${iPv4}, hostIp-${req.ip}`,
              userAgent.data,
              null,
              transaction
            );
          }
        }
      });

      http.setSuccess(
        200,
        'Students Removed from Final Graduation List Successfully.'
      );

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Update Students On Graduation List.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * REMOVE STUDENTS FROM PROVISIONAL LIST
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async removeFromProvisionalList(req, res) {
    try {
      const { email } = req.user;

      const {
        academic_year_id: academicYearId,
        provisional_graduation_list_ids: provisionalListIds,
      } = req.body;

      const findAllProvisionalStudents =
        await graduationListService.findAllProvisionalGraduationListRecords({
          where: {
            id: provisionalListIds,
            academic_year_id: academicYearId,
          },
          attributes: ['id', 'student_programme_id'],
          raw: true,
        });

      await model.sequelize.transaction(async (transaction) => {
        if (!isEmpty(provisionalListIds)) {
          for (const contextId of provisionalListIds) {
            const findRecord = findAllProvisionalStudents.find(
              (record) => parseInt(record.id, 10) === parseInt(contextId, 10)
            );

            if (!findRecord) {
              throw new Error(
                `Unable To Find One Of The Provisional List Records.`
              );
            }

            const findStudentProgramme = await studentProgrammeService.findOne({
              where: {
                id: findRecord.student_programme_id,
                on_provisional_list: true,
                on_graduation_list: false,
                is_current_programme: true,
              },
              attributes: [
                'id',
                'student_id',
                'on_provisional_list',
                'on_graduation_list',
                'programme_id',
              ],
              raw: true,
            });

            await blockCollegesExcept(
              findStudentProgramme.programme_id,
              email,
              req.body.academic_year_id
            );

            if (!findStudentProgramme) {
              throw new Error(
                `Students who are on Final graduation list cannot be removed`
              );
            }

            await graduationListService.destroyProvisionalGraduationList(
              {
                id: contextId,
                academic_year_id: academicYearId,
                student_programme_id: findStudentProgramme.id,
              },
              transaction
            );

            await studentProgrammeService.update(
              {
                id: findStudentProgramme.id,
                on_provisional_list: true,
                on_graduation_list: false,
                is_current_programme: true,
              },
              {
                on_provisional_list: false,
                on_graduation_list: false,
              },
              transaction
            );
          }
        }
      });

      http.setSuccess(
        200,
        'Students Removed from Provisional List Successfully.'
      );

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Update Students On Graduation List.', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

module.exports = GraduationListController;

const studentByEntryYear = (studentObj, academicYearObj) => {
  const normalProgress = studentObj.filter(
    (element) =>
      academicYearObj.entryYearData.metadata_value ===
      element.entry_academic_year
  );

  const mopUpCases = studentObj.filter(
    (element) =>
      academicYearObj.entryYearData.metadata_value !==
      element.entry_academic_year
  );

  const result = { normalProgress, mopUpCases };

  return { ...result };
};

/**
 *
 * @param {*} objWithProgrammeId
 * @returns
 */
const degreeClassFunction = async function (objWithProgrammeId) {
  const getStudyLevel = await reportsService.programmeStudyLevel(
    objWithProgrammeId
  );

  const degreeClass = await resultsPolicyService
    .findOneStudyLevelDegreeClassPolicy({
      where: {
        programme_study_level_id: getStudyLevel.programme_study_level_id,
      },
      include: [
        {
          association: 'studyLevel',
          attributes: ['id', 'metadata_value'],
        },
        {
          association: 'allocations',
          attributes: [
            'id',
            'std_lev_degree_class_id',
            'name',
            'range_from',
            'range_to',
          ],
        },
      ],
      nest: true,
    })
    .then(function (res) {
      if (res) {
        const result = res.toJSON();

        return result;
      }
    });

  if (!degreeClass) {
    throw new Error(
      `Unable To Find A Degree Class Policy For This Programme's Study Level.`
    );
  }

  return degreeClass;
};

/**
 *
 * @param {*} amount
 * @param {*} taxPayerName
 * @param {*} paymentMode
 * @param {*} paymentBankCode
 * @param {*} paymentMobileNo
 * @returns
 */
const generatePaymentReference = async function (
  amount,
  taxPayerName,
  paymentMode,
  paymentBankCode,
  paymentMobileNo
) {
  try {
    const payload = {};

    payload.tax_head = envConfig.TAX_HEAD_CODE;
    payload.system_prn = generateSystemReference('GRAD');
    payload.tax_payer_name = taxPayerName;
    payload.amount = amount;

    const requestUraPrnData = {
      TaxHead: payload.tax_head,
      TaxPayerName: payload.tax_payer_name,
      TaxPayerBankCode: paymentBankCode,
      PaymentBankCode: paymentBankCode,
      MobileNo: paymentMobileNo,
      ReferenceNo: payload.system_prn,
      ExpiryDays: envConfig.PAYMENT_REFERENCE_EXPIRES_IN,
      Amount: payload.amount,
      PaymentMode: paymentMode,
    };

    const genPRN = await generatePRN(requestUraPrnData);

    payload.ura_prn = genPRN.ura_prn;
    payload.expiry_date = genPRN.expiry_date;
    payload.search_code = genPRN.search_code;

    return payload;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} payload
 * @param {*} transaction
 */
const prnTrackerRecord = async function (payload, transaction) {
  try {
    const response = await universalInvoiceService.createPrnTrackerRecord(
      payload,
      transaction
    );

    return response;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} studentNumber
 * @param {*} errorName
 * @returns
 */
const identifyStudent = async (studentNumber, errorName) => {
  const studentProgramme = await studentService
    .findOneStudentProgramme({
      where: {
        student_number: trim(studentNumber),
      },
      ...studentProgrammeAttributes(),
      nest: true,
    })
    .then(function (res) {
      if (res) {
        const result = res.toJSON();

        return result;
      }
    });

  if (!studentProgramme) {
    throw new Error(
      `Student Number: ${studentNumber} Does not Exist In The System For Record: ${errorName}.`
    );
  } else {
    return studentProgramme;
  }
};

/**
 *
 * @param {*} graduationAcademicYearId
 * @param {*} studentProgramme
 * @param {*} metadataValues
 * @param {*} transaction
 * @param {*} errorName
 * @returns
 */
const billGraduationInvoice = async (
  graduationAcademicYearId,
  studentProgramme,
  metadataValues,
  transaction,
  errorName
) => {
  try {
    const data = {};

    const findGraduationFeeAmounts = await graduationFeesService
      .findOneGraduationFees({
        where: {
          grad_academic_year_id: graduationAcademicYearId,
          campus_id: studentProgramme.campus_id,
          billing_category_id: studentProgramme.billing_category_id,
          programme_study_level_id:
            studentProgramme.programme.programme_study_level_id,
        },
        include: [
          {
            association: 'graduationFeesElements',
            include: [
              {
                association: 'currency',
              },
            ],
          },
        ],
        nest: true,
      })
      .then(function (res) {
        if (res) {
          const result = res.toJSON();

          return result;
        }
      });

    if (!findGraduationFeeAmounts) {
      throw new Error(
        `Unable To Find A Graduation Fees Context Matching ${errorName}.`
      );
    }

    const findMandatoryInvoiceTypeId = getMetadataValueId(
      metadataValues,
      'MANDATORY',
      'INVOICE TYPES'
    );

    const findActiveInvoiceStatusId = getMetadataValueId(
      metadataValues,
      'ACTIVE',
      'INVOICE STATUSES'
    );

    data.invoice_type_id = findMandatoryInvoiceTypeId;
    data.invoice_status_id = findActiveInvoiceStatusId;
    data.student_id = studentProgramme.student_id;
    data.student_programme_id = studentProgramme.id;
    data.description = 'Graduation Fees';
    data.currency =
      findGraduationFeeAmounts.graduationFeesElements[0].currency.metadata_value;

    data.graduationInvoiceFeesElement = [];

    if (!isEmpty(findGraduationFeeAmounts.graduationFeesElements)) {
      findGraduationFeeAmounts.graduationFeesElements.forEach((element) => {
        data.graduationInvoiceFeesElement.push({
          fees_element_id: element.fees_element_id,
          currency:
            findGraduationFeeAmounts.graduationFeesElements[0].currency
              .metadata_value,
          amount: element.amount,
        });
      });
    }

    const findOneGraduationFeesInvoice =
      await graduationFeesService.findOneGraduationFeesInvoice({
        where: {
          student_programme_id: studentProgramme.id,
        },
        raw: true,
      });

    if (findOneGraduationFeesInvoice) {
      throw new Error(
        `Unfortunately, ${errorName} Has Already Been Billed A Graduation Fees Invoice.`
      );
    }

    const response = await graduationFeesService.generateGraduationFeesInvoice(
      data,
      transaction
    );

    return response;
  } catch (error) {
    throw new Error(error.message);
  }
};
