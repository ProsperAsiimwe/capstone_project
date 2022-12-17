/* eslint-disable indent */
const { HttpResponse } = require('@helpers');
const {
  studentService,
  metadataValueService,
  metadataService,
} = require('@services');
const model = require('@models');
const formidable = require('formidable');
const XLSX = require('xlsx');
const excelJs = require('exceljs');
const fs = require('fs');
const moment = require('moment');
const UserAgent = require('user-agents');
const {
  getMetadataValueId,
  getMetadataValues,
} = require('@controllers/Helpers/programmeHelper');
const {
  validateSheetColumns,
} = require('@controllers/Helpers/uploadValidator');
const { isEmpty, toUpper, trim, now, sumBy } = require('lodash');
const {
  previousEnrollmentRecordsTemplateColumns,
} = require('../ProgrammeManager/templateColumns');
const {
  previousTransactionsService,
  academicYearService,
  feesElementService,
} = require('@services/');
const { studentProgrammeAttributes } = require('../Helpers/enrollmentRecord');
const { invoiceService } = require('@services/');
const { programmeService } = require('@services/');

const http = new HttpResponse();

class PreviousEnrollmentRecordsController {
  /**
   *
   * @param {*} req
   * @param {*} res
   */
  async downloadTemplate(req, res) {
    try {
      const { user } = req;
      const workbook = new excelJs.Workbook();
      const rootSheet = workbook.addWorksheet('PREVIOUS ENROLLMENT RECORDS');
      const academicYearSheet = workbook.addWorksheet('Sheet2');
      const studyYearSheet = workbook.addWorksheet('Sheet3');
      const semesterSheet = workbook.addWorksheet('Sheet4');

      rootSheet.properties.defaultColWidth =
        previousEnrollmentRecordsTemplateColumns.length;
      rootSheet.columns = previousEnrollmentRecordsTemplateColumns;
      academicYearSheet.state = 'veryHidden';
      studyYearSheet.state = 'veryHidden';
      semesterSheet.state = 'veryHidden';

      const metadata = await metadataService.findAllMetadata({
        attributes: ['metadata_name'],
        include: [
          { association: 'metadataValues', attributes: ['metadata_value'] },
        ],
        raw: true,
        nest: true,
      });

      academicYearSheet.addRows(getMetadataValues(metadata, 'ACADEMIC YEARS'));
      studyYearSheet.addRows(getMetadataValues(metadata, 'STUDY YEARS'));
      semesterSheet.addRows(getMetadataValues(metadata, 'SEMESTERS'));

      // Column Validations
      rootSheet.dataValidations.add('B2:B1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=Sheet2!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid value from the list',
      });

      rootSheet.dataValidations.add('C2:C1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=Sheet3!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid value from the list',
      });

      rootSheet.dataValidations.add('D2:D1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=Sheet4!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid value from the list',
      });

      rootSheet.dataValidations.add('F2:F1000', {
        type: 'list',
        allowBlank: false,
        formulae: ['"CONTINUING STUDENT, NEW STUDENT"'],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid value from the list',
      });

      rootSheet.dataValidations.add('I2:I1000', {
        type: 'list',
        allowBlank: false,
        formulae: ['"REGISTERED, NOT REGISTERED, PROVISIONALLY REGISTERED"'],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid value from the list',
      });

      rootSheet.dataValidations.add('K2:K1000', {
        type: 'list',
        allowBlank: false,
        formulae: ['"TRUE, FALSE"'],
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

      const template = `${uploadPath}/download-previous-enrollment-template-${
        user.surname
      }-${user.other_names}-${user.id}-${now()}.xlsm`;

      await workbook.xlsx.writeFile(template);
      await res.download(
        template,
        'PREVIOUS-ENROLLMENT-RECORDS-TEMPLATE.xlsx',
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
  uploadTemplate(req, res) {
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

        /**
         *
         * @param {*} invoiceNos
         * @param {*} amounts
         * @param {*} credits
         * @param {*} paid
         * @param {*} balancesDue
         * @param {*} narrations
         * @param {*} errName
         * @returns
         */
        const handleOtherFeesInvoices = (
          invoiceNos,
          amounts,
          credits,
          paid,
          balancesDue,
          narrations,
          errName
        ) => {
          try {
            const arrayOfOtherFeesInvoices = [];
            const invoiceNoArray = [];
            const amountsArray = [];
            const creditsArray = [];
            const paidArray = [];
            const balancesDueArray = [];
            const narrationsArray = [];

            if (isEmpty(invoiceNos)) {
              return [];
            } else {
              const splittedInvoices = !isEmpty(invoiceNos)
                ? invoiceNos.split(',')
                : [];

              const splittedAmounts = !isEmpty(amounts)
                ? amounts.split(',')
                : [];

              const splittedCredits = !isEmpty(credits)
                ? credits.split(',')
                : [];

              const splittedPayments = !isEmpty(paid) ? paid.split(',') : [];

              const splittedBalancesDue = !isEmpty(balancesDue)
                ? balancesDue.split(',')
                : [];

              const splittedNarrations = !isEmpty(narrations)
                ? narrations.split(',')
                : [];

              splittedInvoices.forEach((inv) => {
                invoiceNoArray.push(parseFloat(inv));
              });

              splittedAmounts.forEach((amount) => {
                amountsArray.push(parseFloat(amount));
              });

              splittedCredits.forEach((credit) => {
                creditsArray.push(parseFloat(credit));
              });

              splittedPayments.forEach((payment) => {
                paidArray.push(parseFloat(payment));
              });

              splittedBalancesDue.forEach((due) => {
                balancesDueArray.push(parseFloat(due));
              });

              splittedNarrations.forEach((narration) => {
                narrationsArray.push(narration);
              });

              const invoiceNumberLength = invoiceNoArray.length;

              if (invoiceNumberLength > 1) {
                if (amountsArray.length !== invoiceNumberLength) {
                  throw new Error(
                    `Please Assign A Corresponding OTHER FEES AMOUNT Matching The OTHER FEES INVOICE NUMBERS Provided for ${errName}.`
                  );
                }

                if (creditsArray.length !== invoiceNumberLength) {
                  throw new Error(
                    `Please Assign A Corresponding OTHER FEES CREDIT Matching The OTHER FEES INVOICE NUMBERS Provided for ${errName}.`
                  );
                }

                if (paidArray.length !== invoiceNumberLength) {
                  throw new Error(
                    `Please Assign A Corresponding OTHER FEES PAID Matching The OTHER FEES INVOICE NUMBERS Provided for ${errName}.`
                  );
                }

                if (balancesDueArray.length !== invoiceNumberLength) {
                  throw new Error(
                    `Please Assign A Corresponding OTHER FEES BALANCES DUE Matching The OTHER FEES INVOICE NUMBERS Provided for ${errName}.`
                  );
                }

                if (narrationsArray.length !== invoiceNumberLength) {
                  throw new Error(
                    `Please Assign A Corresponding OTHER FEES NARRATIONS Matching The OTHER FEES INVOICE NUMBERS Provided for ${errName}.`
                  );
                }

                invoiceNoArray.forEach((invoice) => {
                  const index = invoiceNoArray.indexOf(invoice);

                  arrayOfOtherFeesInvoices.push({
                    other_invoice_no: invoice.toString(),
                    other_amount: parseFloat(amountsArray[index]),
                    other_credit: parseFloat(creditsArray[index]),
                    other_paid: parseFloat(paidArray[index]),
                    other_balance_due: parseFloat(balancesDueArray[index]),
                    other_fees_narration: narrationsArray[index],
                  });
                });
              } else {
                if (amountsArray.length > 1) {
                  throw new Error(
                    `Please Assign A Corresponding OTHER FEES AMOUNT Matching The OTHER FEES INVOICE NUMBERS Provided for ${errName}.`
                  );
                }

                if (creditsArray.length > 1) {
                  throw new Error(
                    `Please Assign A Corresponding OTHER FEES CREDIT Matching The OTHER FEES INVOICE NUMBERS Provided for ${errName}.`
                  );
                }

                if (paidArray.length > 1) {
                  throw new Error(
                    `Please Assign A Corresponding OTHER FEES PAID Matching The OTHER FEES INVOICE NUMBERS Provided for ${errName}.`
                  );
                }

                if (balancesDueArray.length > 1) {
                  throw new Error(
                    `Please Assign A Corresponding OTHER FEES BALANCES DUE Matching The OTHER FEES INVOICE NUMBERS Provided for ${errName}.`
                  );
                }

                if (narrationsArray.length > 1) {
                  throw new Error(
                    `Please Assign A Corresponding OTHER FEES NARRATIONS Matching The OTHER FEES INVOICE NUMBERS Provided for ${errName}.`
                  );
                }

                arrayOfOtherFeesInvoices.push({
                  other_invoice_no: invoiceNos.toString(),
                  other_amount: amounts ? parseFloat(amounts) : 0,
                  other_credit: credits ? parseFloat(credits) : 0,
                  other_paid: paid ? parseFloat(paid) : 0,
                  other_balance_due: balancesDue ? parseFloat(balancesDue) : 0,
                  other_fees_narration: narrations,
                });
              }

              return arrayOfOtherFeesInvoices;
            }
          } catch (error) {
            throw new Error(error.message);
          }
        };

        try {
          await model.sequelize.transaction(async (transaction) => {
            // const bulk = [];

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
                [
                  'STUDENT NUMBER',
                  'ACADEMIC YEAR',
                  'STUDY YEAR',
                  'SEMESTER',
                  'TOTAL BILL',
                  'TOTAL CREDIT',
                  'TOTAL PAID',
                  'TOTAL DUE',
                  // 'TUITION INVOICE NUMBER',
                  'TUITION AMOUNT',
                  //  'TUITION CREDIT',
                  'TUITION PAID',
                  'TUITION BALANCE DUE',
                  // 'FUNCTIONAL INVOICE NUMBER',
                  'FUNCTIONAL AMOUNT',
                  // 'FUNCTIONAL CREDIT',
                  'FUNCTIONAL PAID',
                  'FUNCTIONAL BALANCE DUE',
                  // 'OTHER FEES AMOUNTS (COMMA SEPARATED eg. 5000,10000)',
                  // 'OTHER FEES PAID (COMMA SEPARATED eg. 5000,10000)',
                  // 'OTHER FEES BALANCES DUE (COMMA SEPARATED eg. 5000,10000)',
                ],
                errName
              );

              data.student_programme_id = await identifyStudent(
                record['STUDENT NUMBER'],
                errName
              );

              data.academic_year_id = getMetadataValueId(
                metadataValues,
                record['ACADEMIC YEAR'],
                'ACADEMIC YEARS',
                errName
              );

              data.study_year_id = getMetadataValueId(
                metadataValues,
                record['STUDY YEAR'],
                'STUDY YEARS',
                errName
              );

              data.semester_id = getMetadataValueId(
                metadataValues,
                record.SEMESTER,
                'SEMESTERS',
                errName
              );

              if (record['ENROLLMENT TOKEN']) {
                data.enrollment_token = trim(record['ENROLLMENT TOKEN']);
              }

              if (record['ENROLLMENT STATUS']) {
                data.enrollment_status = record['ENROLLMENT STATUS'];
              }

              if (record['ENROLLMENT DATE']) {
                data.enrollment_date = trim(record['ENROLLMENT DATE']);
              }

              if (record['REGISTRATION TOKEN']) {
                data.registration_token = trim(record['REGISTRATION TOKEN']);
              }
              if (record['REGISTRATION STATUS']) {
                data.registration_status = trim(record['REGISTRATION STATUS']);
              }
              if (record['REGISTRATION DATE']) {
                data.registration_date = trim(record['REGISTRATION DATE']);
              }

              if (record['IS CARD PRINTED ?']) {
                data.is_card_printed = record['IS CARD PRINTED ?'];
              }

              if (record['TUITION INVOICE NUMBER']) {
                data.tuition_invoice_no =
                  record['TUITION INVOICE NUMBER'].toString();
              }

              data.tuition_amount = parseFloat(trim(record['TUITION AMOUNT']));
              data.tuition_credit = record['TUITION CREDIT']
                ? parseFloat(trim(record['TUITION CREDIT']))
                : 0;
              data.tuition_paid = parseFloat(trim(record['TUITION PAID']));
              data.tuition_balance_due = parseFloat(
                trim(record['TUITION BALANCE DUE'])
              );

              if (record['FUNCTIONAL INVOICE NUMBER']) {
                data.functional_invoice_no =
                  record['FUNCTIONAL INVOICE NUMBER'].toString();
              }

              data.functional_amount = parseFloat(
                trim(record['FUNCTIONAL AMOUNT'])
              );
              data.functional_credit = record['FUNCTIONAL CREDIT']
                ? parseFloat(trim(record['FUNCTIONAL CREDIT']))
                : 0;
              data.functional_paid = parseFloat(
                trim(record['FUNCTIONAL PAID'])
              );
              data.functional_balance_due = parseFloat(
                trim(record['FUNCTIONAL BALANCE DUE'])
              );

              data.otherFees = handleOtherFeesInvoices(
                trim(
                  record[
                    'OTHER FEES INVOICE NUMBERS (COMMA SEPARATED eg. INV01,INV02)'
                  ]
                ),
                trim(
                  record['OTHER FEES AMOUNTS (COMMA SEPARATED eg. 5000,10000)']
                ),
                trim(
                  record['OTHER FEES CREDIT (COMMA SEPARATED eg. 5000,10000)']
                ),
                trim(
                  record['OTHER FEES PAID (COMMA SEPARATED eg. 5000,10000)']
                ),
                trim(
                  record[
                    'OTHER FEES BALANCES DUE (COMMA SEPARATED eg. 5000,10000)'
                  ]
                ),
                trim(
                  record[
                    'OTHER FEES NARRATIONS (COMMA SEPARATED eg. RETAKE FEE,MISSING PAPER)'
                  ]
                ),
                errName
              );

              if (!isEmpty(data.otherFees)) {
                data.other_balance_due = sumBy(
                  data.otherFees,
                  'other_balance_due'
                );
              } else {
                data.other_balance_due = 0;
              }

              data.total_bill = parseFloat(trim(record['TOTAL BILL']));
              data.total_credit = parseFloat(trim(record['TOTAL CREDIT']));
              data.total_paid = parseFloat(trim(record['TOTAL PAID']));
              data.total_due = parseFloat(trim(record['TOTAL DUE']));

              const totalMoneysDue =
                data.functional_balance_due +
                data.tuition_balance_due +
                data.other_balance_due;

              if (data.total_due !== totalMoneysDue) {
                throw new Error(
                  `The Total Balance Due provided (${data.total_due}) For Student Number: ${errName} Does not Add Up With The Sum Of Total Tuition Fees Due, Total Functional Fees Due And/Or Total Other Fees Due (${totalMoneysDue}).`
                );
              }

              data.otherFees = data.otherFees.map((values) => ({
                ...values,
                total_bill: data.total_bill,
                total_credit: data.total_credit,
                total_paid: data.total_paid,
                total_due: data.total_due,
              }));

              const upload =
                await previousTransactionsService.createPreviousEnrollmentRecord(
                  data,
                  transaction
                );

              uploads.push(upload);

              //  bulk.push(data);
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
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async billPreviousEnrollmentBalances(req, res) {
    try {
      const dt = req.body;
      const userAgent = new UserAgent();
      const random = Math.floor(Math.random() * moment().unix());
      const generatedBatchNumber = `BATCH${random}`;
      const result = [];

      const metadataValues = await metadataValueService.findAllMetadataValues({
        include: {
          association: 'metadata',
          attributes: ['id', 'metadata_name'],
        },
        attributes: ['id', 'metadata_value'],
      });

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

      const TuitionFeesCategoryId = getMetadataValueId(
        metadataValues,
        'TUITION FEES',
        'FEES CATEGORIES'
      );

      const allAcademicYears = await academicYearService
        .findAllAcademicYears({
          include: [
            {
              association: 'semesters',
            },
          ],
        })
        .then((res) => {
          if (res) {
            return res.map((item) => item.get({ plain: true }));
          }
        });

      const allTuitionFeesElements =
        await feesElementService.findAllFeesElements({
          where: {
            fees_category_id: TuitionFeesCategoryId,
          },
          raw: true,
        });

      const allProgrammeStudyYears =
        await programmeService.findAllProgrammeStudyYears({
          raw: true,
        });

      await model.sequelize.transaction(async (transaction) => {
        if (!isEmpty(dt.previous_enrollment_ids)) {
          for (const id of dt.previous_enrollment_ids) {
            const data = {};

            const random = Math.floor(Math.random() * moment().unix());
            const generatedInvoiceNumber = `M-INV${random}`;

            const findOnePreviousEnrollmentRecord =
              await previousTransactionsService
                .findOnePreviousEnrollmentRecord({
                  where: {
                    id,
                  },
                  include: [
                    {
                      association: 'studentProgramme',
                      ...studentProgrammeAttributes(),
                    },
                    {
                      association: 'otherFees',
                    },
                  ],
                  nest: true,
                })
                .then((res) => {
                  if (res) {
                    return res.toJSON();
                  }
                });

            if (!findOnePreviousEnrollmentRecord) {
              throw new Error(
                `One Of The Previous Enrollment Records Provided Does not Exist.`
              );
            }

            if (findOnePreviousEnrollmentRecord.is_billed === false) {
              // throw new Error(
              //   `The Previous Enrollment Record For ${findOnePreviousEnrollmentRecord.studentProgramme.student_number} Has Already Been Billed.`
              // );

              const totalDue = parseFloat(
                findOnePreviousEnrollmentRecord.total_due
              );

              const findAcademicYear = allAcademicYears.find(
                (yr) =>
                  parseInt(yr.academic_year_id, 10) ===
                  parseInt(findOnePreviousEnrollmentRecord.academic_year_id, 10)
              );

              if (!findAcademicYear) {
                throw new Error(
                  `The Academic Year Of Student Number ${findOnePreviousEnrollmentRecord.studentProgramme.student_number} Has Not Been Configured In The Events Module.`
                );
              }

              const findSemester = findAcademicYear.semesters.find(
                (sem) =>
                  parseInt(sem.semester_id, 10) ===
                  parseInt(findOnePreviousEnrollmentRecord.semester_id, 10)
              );

              if (!findSemester) {
                throw new Error(
                  `The Semester Of Student Number ${findOnePreviousEnrollmentRecord.studentProgramme.student_number} Has Not Been Assigned To The Academic Year In The Events Module.`
                );
              }

              const myProgrammesStudyYears = allProgrammeStudyYears.filter(
                (yrs) =>
                  parseInt(yrs.programme_id, 10) ===
                  parseInt(
                    findOnePreviousEnrollmentRecord.studentProgramme.programme
                      .id,
                    10
                  )
              );

              if (isEmpty(myProgrammesStudyYears)) {
                throw new Error(
                  `Unable to find any programme study years for ${findOnePreviousEnrollmentRecord.studentProgramme.student_number}'s programme `
                );
              }

              let findStudyYear = myProgrammesStudyYears.find(
                (yr) =>
                  parseInt(yr.programme_study_year_id, 10) ===
                  parseInt(findOnePreviousEnrollmentRecord.study_year_id, 10)
              );

              if (!findStudyYear) {
                const integerArrayOfStudyYears = [];

                myProgrammesStudyYears.forEach((item) => {
                  integerArrayOfStudyYears.push(
                    parseInt(
                      trim(
                        toUpper(item.programme_study_years).replace('YEAR', '')
                      ),
                      10
                    )
                  );
                });

                const highestStudyYear = sortHighestToSmallest(
                  integerArrayOfStudyYears
                );

                findStudyYear = myProgrammesStudyYears.find(
                  (yr) =>
                    toUpper(trim(yr.programme_study_years)) ===
                    `YEAR ${highestStudyYear}`
                );

                if (!findStudyYear) {
                  throw new Error(
                    `The Previous Enrollment Record For ${findOnePreviousEnrollmentRecord.studentProgramme.student_number} Has No Final Study Year.`
                  );
                }
              }

              const findTuitionFeesElement = allTuitionFeesElements.find(
                (elm) => elm.fees_element_name.includes('TUITION')
              );

              if (!findTuitionFeesElement) {
                throw new Error(`Unable To Find Any Tuition Fees Element.`);
              }

              data.academic_year_id = findAcademicYear.id;
              data.semester_id = findSemester.id;
              data.student_programme_id =
                findOnePreviousEnrollmentRecord.studentProgramme.id;
              data.student_id =
                findOnePreviousEnrollmentRecord.studentProgramme.student_id;
              data.invoice_number = generatedInvoiceNumber;
              data.invoice_status_id = findActiveInvoiceStatusId;
              data.invoice_type_id = findMandatoryInvoiceTypeId;
              data.ip_address = req.ip;
              data.user_agent = userAgent.data;
              data.currency = 'UGX';
              data.is_bulk_manual_invoice = true;
              data.bulk_manual_invoice_batch = generatedBatchNumber;
              data.study_year_id = findStudyYear.id;
              data.created_at = '2021-06-25 11:14:06';
              data.deleted_at = new Date();

              if (parseFloat(findOnePreviousEnrollmentRecord.total_bill) > 0) {
                data.amount_due = totalDue;
                data.amount_paid = findOnePreviousEnrollmentRecord.total_paid
                  ? findOnePreviousEnrollmentRecord.total_paid
                  : 0;
                data.invoice_amount = findOnePreviousEnrollmentRecord.total_bill
                  ? findOnePreviousEnrollmentRecord.total_bill
                  : totalDue;
                data.percentage_completion = percentageCompletion(
                  data.invoice_amount,
                  data.amount_paid
                );
                data.description =
                  'PREVIOUS TUITION AND FUNCTIONAL FEES ARREARS';
                data.created_at = '2021-06-25 11:14:06';
                data.deleted_at = new Date();

                data.elements = [
                  {
                    fees_element_id: findTuitionFeesElement.id,
                    fees_element_description: 'PREVIOUS ENROLLMENT BALANCES',
                    quantity: 1,
                    unit_amount: totalDue,
                    amount: totalDue,
                    created_at: '2021-06-25 11:14:06',
                    deleted_at: new Date(),
                    currency: 'UGX',
                  },
                ];

                const upload = await invoiceService.createManualInvoice(
                  data,
                  transaction
                );

                await previousTransactionsService.updatePreviousEnrollmentRecord(
                  findOnePreviousEnrollmentRecord.id,
                  {
                    is_billed: true,
                  },
                  transaction
                );

                if (!isEmpty(findOnePreviousEnrollmentRecord.otherFees)) {
                  for (const item of findOnePreviousEnrollmentRecord.otherFees) {
                    const OtherFeesUpload = await billOtherFees(
                      item,
                      data,
                      findTuitionFeesElement,
                      findOnePreviousEnrollmentRecord,
                      transaction
                    );

                    result.push(OtherFeesUpload);
                  }
                }

                result.push(upload.dataValues);
              } else {
                if (!isEmpty(findOnePreviousEnrollmentRecord.otherFees)) {
                  for (const item of findOnePreviousEnrollmentRecord.otherFees) {
                    const OtherFeesUpload = await billOtherFees(
                      item,
                      data,
                      findTuitionFeesElement,
                      findOnePreviousEnrollmentRecord,
                      transaction
                    );

                    result.push(OtherFeesUpload);
                  }
                } else {
                  throw new Error(
                    `Student Number ${findOnePreviousEnrollmentRecord.studentProgramme.student_number} Has No Amount Due.`
                  );
                }
              }
            }
          }
        }
      });

      http.setSuccess(
        200,
        'Previous Enrollment Balances Billed Successfully.',
        {
          data: result,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Bill Previous Enrollment Balances.', {
        error: error.message,
      });

      return http.send(res);
    }
  }

  /**
   *
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async migratePreviousOtherFeesInvoices(req, res) {
    try {
      await model.sequelize.transaction(async (transaction) => {
        await previousTransactionsService.migratePreviousOtherFeesInvoices(
          transaction
        );
      });

      http.setSuccess(200, 'Other Fees Values Migrated Successfully.');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Migrate Other Fees Values.', {
        error: error.message,
      });

      return http.send(res);
    }
  }

  /**
   *
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async fixUnbilledDuplicatesInPreviousPayments(req, res) {
    try {
      const result = await model.sequelize.transaction(async (transaction) => {
        const result =
          await previousTransactionsService.fixUnbilledDuplicatesInPreviousPayments(
            transaction
          );

        return result;
      });

      http.setSuccess(200, 'Fixed Successfully.', { data: result });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fix Successfully.', {
        error: error.message,
      });

      return http.send(res);
    }
  }

  /**
   *
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async fixBilledDuplicatesInPreviousPayments(req, res) {
    try {
      const result = await model.sequelize.transaction(async (transaction) => {
        const result =
          await previousTransactionsService.fixBilledDuplicatesInPreviousPayments(
            transaction
          );

        return result;
      });

      http.setSuccess(200, 'Fixed Successfully.', { data: result });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fix Successfully.', {
        error: error.message,
      });

      return http.send(res);
    }
  }
}

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
      attributes: [
        'id',
        'student_id',
        'campus_id',
        'registration_number',
        'student_number',
        'programme_id',
        'programme_version_id',
        'is_current_programme',
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
      `Student Number: ${studentNumber} Does not Exist In The System For Record: ${errorName}.`
    );
  } else {
    return studentProgramme.id;
  }
};

/**
 *
 * @param {*} item
 * @param {*} data
 * @param {*} findTuitionFeesElement
 * @param {*} findOnePreviousEnrollmentRecord
 * @param {*} transaction
 */
const billOtherFees = async (
  item,
  data,
  findTuitionFeesElement,
  findOnePreviousEnrollmentRecord,
  transaction
) => {
  try {
    if (item.is_billed === true) {
      throw new Error(
        `${item.other_invoice_no} for Student Number ${findOnePreviousEnrollmentRecord.studentProgramme.student_number} Has Already Been Billed.`
      );
    }

    data.amount_due = item.total_due ? item.total_due : 0;
    data.amount_paid = item.total_paid ? item.total_paid : 0;
    data.invoice_amount = item.total_bill ? item.total_bill : item.total_due;
    data.percentage_completion = percentageCompletion(
      data.invoice_amount,
      data.amount_paid
    );
    data.description = item.other_fees_narration
      ? item.other_fees_narration
      : 'PREVIOUS OTHER FEES ARREARS';
    data.created_at = '2021-06-25 11:14:06';
    data.deleted_at = new Date();

    data.elements = [
      {
        fees_element_id: findTuitionFeesElement.id,
        fees_element_description: 'PREVIOUS ENROLLMENT BALANCES (OTHER FEES)',
        quantity: 1,
        unit_amount: item.total_due,
        amount: item.total_due,
        created_at: '2021-06-25 11:14:06',
        deleted_at: new Date(),
        currency: 'UGX',
      },
    ];

    const upload = await invoiceService.createManualInvoice(data, transaction);

    await previousTransactionsService.updatePreviousEnrollmentRecord(
      findOnePreviousEnrollmentRecord.id,
      {
        is_billed: true,
      },
      transaction
    );

    await previousTransactionsService.updatePreviousEnrollmentRecordOtherFees(
      item.id,
      {
        is_billed: true,
      },
      transaction
    );

    return upload.dataValues;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} invoiceAmount
 * @param {*} totalPaid
 * @returns
 */
const percentageCompletion = (invoiceAmount, totalPaid) => {
  try {
    const result = Math.floor((totalPaid / invoiceAmount) * 100);

    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} array
 * @returns
 */
const sortHighestToSmallest = (array) => {
  try {
    const sorted = array.sort((a, b) => {
      return b - a;
    });

    return sorted[0];
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = PreviousEnrollmentRecordsController;
