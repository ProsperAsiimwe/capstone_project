const { HttpResponse } = require('@helpers');
const {
  feesElementService,
  feesWaiverService,
  studentService,
  academicYearService,
  metadataService,
  metadataValueService,
  programmeService,
  chartOfAccountService,
} = require('@services/index');
// const { Op } = require('sequelize');
const { isEmpty, now, toUpper, orderBy, trim } = require('lodash');
// const moment = require('moment');
const model = require('@models');
const XLSX = require('xlsx');
const formidable = require('formidable');
const excelJs = require('exceljs');
const fs = require('fs');
const {
  feesElementColumns,
  tuitionAmountFeesElementColumns,
  functionalAmountFeesElementColumns,
  otherFeesAmountFeesElementColumns,
  feesWaiverDiscountFeesElementColumns,
} = require('./templateColumns');
const {
  getMetadataValueId,
  getMetadataValues,
} = require('@controllers/Helpers/programmeHelper');
const {
  validateSheetColumns,
} = require('@controllers/Helpers/uploadValidator');

const http = new HttpResponse();

class FeesElementController {
  /**
   * GET All FeesElements.
   *
   * @param {*} req Request
   * @param {*} res Response
   *
   * @returns {JSON} Http Response
   */
  async index(req, res) {
    try {
      const feesElements = await feesElementService.findAllFeesElements({
        include: [
          { association: 'feesCategory', attributes: ['id', 'metadata_value'] },
          {
            association: 'chartOfAccount',
            attributes: ['id', 'account_name', 'account_code'],
          },
        ],
      });

      http.setSuccess(200, 'Fees Elements Fetched Successfully', {
        feesElements,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Fees Elements', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * CREATE New FeesElement Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async createFeesElement(req, res) {
    try {
      const data = req.body;
      const { id } = req.user;

      data.created_by_id = parseInt(id, 10);
      data.fees_element_code = data.fees_element_code.toUpperCase().trim();
      data.fees_element_name = data.fees_element_name.toUpperCase().trim();

      const feesElement = await model.sequelize.transaction(
        async (transaction) => {
          const upload = await insertNewFeesElement(data, transaction);

          return upload[0];
        }
      );

      http.setSuccess(200, 'Fees Element Created Successfully', {
        feesElement,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Create This Fees Element', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * UPDATE Specific FeesElement Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async updateFeesElement(req, res) {
    try {
      const data = req.body;
      const { id } = req.params;

      data.fees_element_code = data.fees_element_code.toUpperCase().trim();
      data.fees_element_name = data.fees_element_name.toUpperCase().trim();

      const updateFeesElement = await feesElementService.updateFeesElement(
        id,
        data
      );
      const feesElement = updateFeesElement[1][0];

      http.setSuccess(200, 'Fees Element Updated Successfully', {
        feesElement,
      });
      if (isEmpty(feesElement))
        http.setError(404, 'Fees Element Data Not Found');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Update This Fees Element', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Get Specific FeesElement Data.
   *
   * @param {*} req Request body
   * @param {*} res Response
   *
   * @return {JSON} Return JSON Response
   */
  async fetchFeesElement(req, res) {
    const { id } = req.params;
    const feesElement = await feesElementService.findOneFeesElement({
      where: { id },
    });

    http.setSuccess(200, 'Fees Element Fetch Successful', {
      feesElement,
    });
    if (isEmpty(feesElement)) http.setError(404, 'Fees Element Data Not Found');

    return http.send(res);
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   */
  async downloadFeesElementTemplate(req, res) {
    try {
      const { user } = req;
      const workbook = new excelJs.Workbook();
      const createFeesElementSheet = workbook.addWorksheet(
        'CREATE FEES ELEMENT'
      );
      const feesCategoriesSheet = workbook.addWorksheet('Sheet2');
      const chartOfAccountsSheet = workbook.addWorksheet('Sheet3');

      createFeesElementSheet.properties.defaultColWidth =
        feesElementColumns.length;
      createFeesElementSheet.columns = feesElementColumns;
      feesCategoriesSheet.state = 'veryHidden';
      chartOfAccountsSheet.state = 'veryHidden';

      const chartOfAccounts =
        await chartOfAccountService.findAllChartsOfAccount({
          attributes: [
            'id',
            'account_status_id',
            'account_type_id',
            'tax_id',
            'account_code',
            'account_name',
          ],
          raw: true,
        });
      const metadata = await metadataService.findAllMetadata({
        attributes: ['metadata_name'],
        include: [
          { association: 'metadataValues', attributes: ['metadata_value'] },
        ],
        raw: true,
        nest: true,
      });

      feesCategoriesSheet.addRows(
        getMetadataValues(metadata, 'FEES CATEGORIES')
      );

      chartOfAccountsSheet.addRows(
        chartOfAccounts.map((account) => [
          `(${account.account_name}):${account.account_code}`,
        ])
      );

      // Column Validations
      createFeesElementSheet.dataValidations.add('D2:D1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=Sheet2!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        error: 'Please select a valid value from the list',
      });

      createFeesElementSheet.dataValidations.add('C2:C1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=Sheet3!$A$1:$A$1000'],
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

      const template = `${uploadPath}/download-fees-element-upload-template-${
        user.surname
      }-${user.other_names}-${user.id}-${now()}.xlsm`;

      await workbook.xlsx.writeFile(template);
      await res.download(
        template,
        'FEES-ELEMENTS-UPLOAD-TEMPLATE.xlsx',
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
  async downloadTuitionAmountFeesElementTemplate(req, res) {
    try {
      const { user } = req;
      const workbook = new excelJs.Workbook();
      const metadataValues = await metadataValueService.findAllMetadataValues({
        include: {
          association: 'metadata',
          attributes: ['id', 'metadata_name'],
        },
        attributes: ['id', 'metadata_value'],
      });

      const findTuitionFeesCategoryId = getMetadataValueId(
        metadataValues,
        'TUITION FEES',
        'FEES CATEGORIES'
      );

      const feesElements = await feesElementService.findAllFeesElements({
        where: {
          fees_category_id: findTuitionFeesCategoryId,
        },
        attributes: ['fees_element_name'],
        raw: true,
      });

      const programmes = await programmeService.findAllProgrammes({
        attributes: ['id', 'programme_title', 'programme_code'],
        raw: true,
      });

      const metadata = await metadataService.findAllMetadata({
        attributes: ['metadata_name'],
        include: [
          { association: 'metadataValues', attributes: ['metadata_value'] },
        ],
        raw: true,
        nest: true,
      });

      const createTuitionAmountFeesElementSheet = workbook.addWorksheet(
        'CREATE TUITION AMOUNT FEES ELEMENT'
      );
      const feesElementsSheet = workbook.addWorksheet('Sheet2');
      const paymentCycleSheet = workbook.addWorksheet('Sheet3');
      const programmesSheet = workbook.addWorksheet('Sheet4');
      const studyTypesSheet = workbook.addWorksheet('Sheet5');
      const academicYearsSheet = workbook.addWorksheet('Sheet6');
      const studyYearsSheet = workbook.addWorksheet('Sheet7');
      const intakesSheet = workbook.addWorksheet('Sheet8');
      const billingCategoriesSheet = workbook.addWorksheet('Sheet9');
      const currencySheet = workbook.addWorksheet('Sheet10');
      const campusesSheet = workbook.addWorksheet('Sheet11');

      createTuitionAmountFeesElementSheet.properties.defaultColWidth =
        tuitionAmountFeesElementColumns.length;
      createTuitionAmountFeesElementSheet.columns =
        tuitionAmountFeesElementColumns;
      paymentCycleSheet.state = 'veryHidden';
      feesElementsSheet.state = 'veryHidden';
      programmesSheet.state = 'veryHidden';
      studyTypesSheet.state = 'veryHidden';
      academicYearsSheet.state = 'veryHidden';
      studyYearsSheet.state = 'veryHidden';
      intakesSheet.state = 'veryHidden';
      billingCategoriesSheet.state = 'veryHidden';
      currencySheet.state = 'veryHidden';
      campusesSheet.state = 'veryHidden';

      paymentCycleSheet.addRows(
        getMetadataValues(metadata, 'TUITION PAYMENT INTERVALS')
      );

      feesElementsSheet.addRows(
        feesElements.map((element) => [element.fees_element_name])
      );

      programmesSheet.addRows(
        programmes.map((prog) => [
          `(${prog.programme_code}):${prog.programme_title}`,
        ])
      );

      studyTypesSheet.addRows(
        arrayPermutations(getMetadataValues(metadata, 'PROGRAMME STUDY TYPES'))
      );

      academicYearsSheet.addRows(getMetadataValues(metadata, 'ACADEMIC YEARS'));

      studyYearsSheet.addRows(
        arrayPermutations(getMetadataValues(metadata, 'STUDY YEARS'))
      );

      intakesSheet.addRows(getMetadataValues(metadata, 'INTAKES'));

      billingCategoriesSheet.addRows(
        getMetadataValues(metadata, 'BILLING CATEGORIES')
      );

      currencySheet.addRows(getMetadataValues(metadata, 'CURRENCIES'));

      campusesSheet.addRows(getMetadataValues(metadata, 'CAMPUSES'));

      // Column Validations

      // programmes
      createTuitionAmountFeesElementSheet.dataValidations.add('A2:A1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=Sheet4!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: 'Please select a valid value from the list',
      });

      // study types
      createTuitionAmountFeesElementSheet.dataValidations.add('B2:B1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=Sheet5!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: 'Please select a valid value from the list',
      });

      // Academic years
      createTuitionAmountFeesElementSheet.dataValidations.add('C2:C1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=Sheet6!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: 'Please select a valid value from the list',
      });

      // Study years
      createTuitionAmountFeesElementSheet.dataValidations.add('D2:D1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=Sheet7!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: 'Please select a valid value from the list',
      });

      // Intakes
      createTuitionAmountFeesElementSheet.dataValidations.add('E2:E1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=Sheet8!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: 'Please select a valid value from the list',
      });

      // Billing Categories
      createTuitionAmountFeesElementSheet.dataValidations.add('F2:F1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=Sheet9!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: 'Please select a valid value from the list',
      });

      // Campuses
      createTuitionAmountFeesElementSheet.dataValidations.add('G2:G1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=Sheet11!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: 'Please select a valid value from the list',
      });

      // Fees Elements
      createTuitionAmountFeesElementSheet.dataValidations.add('H2:H1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=Sheet2!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: 'Please select a valid value from the list',
      });

      // Payment Cycle
      createTuitionAmountFeesElementSheet.dataValidations.add('I2:I1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=Sheet3!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: 'Please select a valid value from the list',
      });

      // amount
      createTuitionAmountFeesElementSheet.dataValidations.add('J2:J1000', {
        type: 'whole',
        operator: 'greaterThan',
        formulae: [0],
        allowBlank: true,
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: `The value must be a whole number`,
        prompt: `The value must be a whole number`,
      });

      // currency
      createTuitionAmountFeesElementSheet.dataValidations.add('K2:K1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=Sheet10!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: 'Please select a valid value from the list',
      });

      const uploadPath = `${process.cwd()}/src/assets/documents/templates`;

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true }, (err) => {
          throw new Error(err.message);
        });
      }

      const template = `${uploadPath}/download-tuition-amount-fees-element-upload-template-${
        user.surname
      }-${user.other_names}-${user.id}-${now()}.xlsm`;

      await workbook.xlsx.writeFile(template);
      await res.download(
        template,
        'TUITION-AMOUNT-FEES-ELEMENTS-UPLOAD-TEMPLATE.xlsx',
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
  async downloadFunctionalAmountFeesElementTemplate(req, res) {
    try {
      const { user } = req;
      const workbook = new excelJs.Workbook();
      const metadataValues = await metadataValueService.findAllMetadataValues({
        include: {
          association: 'metadata',
          attributes: ['id', 'metadata_name'],
        },
        attributes: ['id', 'metadata_value'],
      });

      const findFunctionalFeesCategoryId = getMetadataValueId(
        metadataValues,
        'FUNCTIONAL FEES',
        'FEES CATEGORIES'
      );

      const feesElements = await feesElementService.findAllFeesElements({
        where: {
          fees_category_id: findFunctionalFeesCategoryId,
        },
        attributes: ['fees_element_name'],
        raw: true,
      });

      const createFunctionalAmountFeesElementSheet = workbook.addWorksheet(
        'CREATE FUNCTIONAL AMOUNT FEES ELEMENT'
      );
      const metadata = await metadataService.findAllMetadata({
        attributes: ['metadata_name'],
        include: [
          { association: 'metadataValues', attributes: ['metadata_value'] },
        ],
        raw: true,
        nest: true,
      });

      const programmeStudyLevelsSheet = workbook.addWorksheet('Sheet2');
      const academicYearsSheet = workbook.addWorksheet('Sheet3');
      const campusesSheet = workbook.addWorksheet('Sheet4');
      const intakesSheet = workbook.addWorksheet('Sheet5');
      const billingCategoriesSheet = workbook.addWorksheet('Sheet6');
      const studyTypesSheet = workbook.addWorksheet('Sheet7');
      const feesElementsSheet = workbook.addWorksheet('Sheet8');
      const paymentCycleSheet = workbook.addWorksheet('Sheet9');
      const currenciesSheet = workbook.addWorksheet('Sheet10');

      createFunctionalAmountFeesElementSheet.properties.defaultColWidth =
        functionalAmountFeesElementColumns.length;
      createFunctionalAmountFeesElementSheet.columns =
        functionalAmountFeesElementColumns;
      programmeStudyLevelsSheet.state = 'veryHidden';
      academicYearsSheet.state = 'veryHidden';
      campusesSheet.state = 'veryHidden';
      intakesSheet.state = 'veryHidden';
      billingCategoriesSheet.state = 'veryHidden';
      studyTypesSheet.state = 'veryHidden';
      feesElementsSheet.state = 'veryHidden';
      paymentCycleSheet.state = 'veryHidden';
      currenciesSheet.state = 'veryHidden';

      programmeStudyLevelsSheet.addRows(
        getMetadataValues(metadata, 'PROGRAMME STUDY LEVELS')
      );

      academicYearsSheet.addRows(getMetadataValues(metadata, 'ACADEMIC YEARS'));

      campusesSheet.addRows(getMetadataValues(metadata, 'CAMPUSES'));

      intakesSheet.addRows(getMetadataValues(metadata, 'INTAKES'));

      billingCategoriesSheet.addRows(
        getMetadataValues(metadata, 'BILLING CATEGORIES')
      );

      studyTypesSheet.addRows(
        arrayPermutations(getMetadataValues(metadata, 'PROGRAMME STUDY TYPES'))
      );

      feesElementsSheet.addRows(
        feesElements.map((element) => [element.fees_element_name])
      );

      paymentCycleSheet.addRows(
        getMetadataValues(metadata, 'FUNCTIONAL FEES PAYMENT INTERVALS')
      );

      currenciesSheet.addRows(getMetadataValues(metadata, 'CURRENCIES'));

      // Column Validations

      // Programme Study Level
      createFunctionalAmountFeesElementSheet.dataValidations.add('A2:A1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=Sheet2!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: 'Please select a valid value from the list',
      });

      // Academic Years
      createFunctionalAmountFeesElementSheet.dataValidations.add('B2:B1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=Sheet3!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: 'Please select a valid value from the list',
      });

      // Campuses
      createFunctionalAmountFeesElementSheet.dataValidations.add('C2:C1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=Sheet4!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: 'Please select a valid value from the list',
      });

      // Intakes
      createFunctionalAmountFeesElementSheet.dataValidations.add('D2:D1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=Sheet5!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: 'Please select a valid value from the list',
      });

      // Billing Categories
      createFunctionalAmountFeesElementSheet.dataValidations.add('E2:E1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=Sheet6!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: 'Please select a valid value from the list',
      });

      // Study Types
      createFunctionalAmountFeesElementSheet.dataValidations.add('F2:F1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=Sheet7!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: 'Please select a valid value from the list',
      });

      // Fees Element
      createFunctionalAmountFeesElementSheet.dataValidations.add('G2:G1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=Sheet8!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: 'Please select a valid value from the list',
      });

      // Payment Cycle
      createFunctionalAmountFeesElementSheet.dataValidations.add('H2:H1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=Sheet9!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: 'Please select a valid value from the list',
      });

      // Amount
      createFunctionalAmountFeesElementSheet.dataValidations.add('I2:I1000', {
        type: 'whole',
        operator: 'greaterThan',
        formulae: [0],
        allowBlank: true,
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: `The value must be a whole number`,
        prompt: `The value must be a whole number`,
      });

      // Currency
      createFunctionalAmountFeesElementSheet.dataValidations.add('J2:J1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=Sheet10!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: 'Please select a valid value from the list',
      });

      const uploadPath = `${process.cwd()}/src/assets/documents/templates`;

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true }, (err) => {
          throw new Error(err.message);
        });
      }

      const template = `${uploadPath}/download-functional-amount-fees-element-upload-template-${
        user.surname
      }-${user.other_names}-${user.id}-${now()}.xlsm`;

      await workbook.xlsx.writeFile(template);
      await res.download(
        template,
        'FUNCTIONAL-AMOUNT-FEES-ELEMENTS-UPLOAD-TEMPLATE.xlsx',
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
  async downloadOtherFeesAmountFeesElementTemplate(req, res) {
    try {
      const { user } = req;
      const workbook = new excelJs.Workbook();
      const metadataValues = await metadataValueService.findAllMetadataValues({
        include: {
          association: 'metadata',
          attributes: ['id', 'metadata_name'],
        },
        attributes: ['id', 'metadata_value'],
      });

      const findOtherFeesCategoryId = getMetadataValueId(
        metadataValues,
        'OTHER FEES',
        'FEES CATEGORIES'
      );

      const feesElements = await feesElementService.findAllFeesElements({
        where: {
          fees_category_id: findOtherFeesCategoryId,
        },
        attributes: ['fees_element_name'],
        raw: true,
      });

      const createOtherFeesAmountFeesElementSheet = workbook.addWorksheet(
        'CREATE OTHER FEES AMOUNT FEES ELEMENT'
      );
      const academicYearsSheet = workbook.addWorksheet('Sheet2');
      const campusesSheet = workbook.addWorksheet('Sheet3');
      const intakesSheet = workbook.addWorksheet('Sheet4');
      const billingCategoriesSheet = workbook.addWorksheet('Sheet5');
      const feesElementsSheet = workbook.addWorksheet('Sheet6');
      const currenciesSheet = workbook.addWorksheet('Sheet7');
      const metadata = await metadataService.findAllMetadata({
        attributes: ['metadata_name'],
        include: [
          { association: 'metadataValues', attributes: ['metadata_value'] },
        ],
        raw: true,
        nest: true,
      });

      createOtherFeesAmountFeesElementSheet.properties.defaultColWidth =
        otherFeesAmountFeesElementColumns.length;
      createOtherFeesAmountFeesElementSheet.columns =
        otherFeesAmountFeesElementColumns;
      academicYearsSheet.state = 'veryHidden';
      campusesSheet.state = 'veryHidden';
      intakesSheet.state = 'veryHidden';
      billingCategoriesSheet.state = 'veryHidden';
      feesElementsSheet.state = 'veryHidden';
      currenciesSheet.state = 'veryHidden';

      academicYearsSheet.addRows(getMetadataValues(metadata, 'ACADEMIC YEARS'));

      campusesSheet.addRows(getMetadataValues(metadata, 'CAMPUSES'));

      intakesSheet.addRows(getMetadataValues(metadata, 'INTAKES'));

      billingCategoriesSheet.addRows(
        arrayPermutations(getMetadataValues(metadata, 'BILLING CATEGORIES'))
      );

      feesElementsSheet.addRows(
        feesElements.map((element) => [element.fees_element_name])
      );

      currenciesSheet.addRows(getMetadataValues(metadata, 'CURRENCIES'));

      // Column Validations

      // Academic Years
      createOtherFeesAmountFeesElementSheet.dataValidations.add('A2:A1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=Sheet2!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: 'Please select a valid value from the list',
      });

      // Campuses
      createOtherFeesAmountFeesElementSheet.dataValidations.add('B2:B1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=Sheet3!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: 'Please select a valid value from the list',
      });

      // intakes
      createOtherFeesAmountFeesElementSheet.dataValidations.add('C2:C1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=Sheet4!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: 'Please select a valid value from the list',
      });

      // Billing Categories
      createOtherFeesAmountFeesElementSheet.dataValidations.add('D2:D1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=Sheet5!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: 'Please select a valid value from the list',
      });

      // Fees Element
      createOtherFeesAmountFeesElementSheet.dataValidations.add('E2:E1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=Sheet6!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: 'Please select a valid value from the list',
      });

      // Amount
      createOtherFeesAmountFeesElementSheet.dataValidations.add('F2:F1000', {
        type: 'whole',
        operator: 'greaterThan',
        formulae: [0],
        allowBlank: true,
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: `The value must be a whole number`,
        prompt: `The value must be a whole number`,
      });

      // Currency
      createOtherFeesAmountFeesElementSheet.dataValidations.add('G2:G1000', {
        type: 'list',
        allowBlank: true,
        formulae: ['=Sheet7!$A$1:$A$1000'],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid input!',
        error: 'Please select a valid value from the list',
      });

      const uploadPath = `${process.cwd()}/src/assets/documents/templates`;

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true }, (err) => {
          throw new Error(err.message);
        });
      }

      const template = `${uploadPath}/download-other-fees-amount-fees-element-upload-template-${
        user.surname
      }-${user.other_names}-${user.id}-${now()}.xlsm`;

      await workbook.xlsx.writeFile(template);
      await res.download(
        template,
        'OTHER-FEES-AMOUNT-FEES-ELEMENTS-UPLOAD-TEMPLATE.xlsx',
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
  async downloadFeesWaiverDiscountFeesElementTemplate(req, res) {
    try {
      const { user } = req;

      const workbook = new excelJs.Workbook();

      const feesWaivers = await feesWaiverService.findAllFeesWaivers({
        attributes: ['fees_waiver_name'],
        raw: true,
      });

      const feesElements = await feesElementService.findAllFeesElements({
        attributes: ['fees_element_name'],
        raw: true,
      });

      const academicYears = await academicYearService.findAllAcademicYears({
        attributes: ['id', 'academic_year_id', 'start_date', 'end_date'],
        include: [
          {
            association: 'academicYear',
            attributes: ['id', 'metadata_value'],
          },
        ],
        raw: true,
        nest: true,
      });

      const createFeesWaiverDiscountAmountFeesElementSheet =
        workbook.addWorksheet(
          'CREATE FEES WAIVER DISCOUNT AMOUNT FEES ELEMENT'
        );
      const feesWaiversSheet = workbook.addWorksheet('Sheet2');
      const academicYearsSheet = workbook.addWorksheet('Sheet3');
      const campusesSheet = workbook.addWorksheet('Sheet4');
      const intakesSheet = workbook.addWorksheet('Sheet5');
      const feesElementsSheet = workbook.addWorksheet('Sheet6');
      const metadata = await metadataService.findAllMetadata({
        attributes: ['metadata_name'],
        include: [
          { association: 'metadataValues', attributes: ['metadata_value'] },
        ],
        raw: true,
        nest: true,
      });

      createFeesWaiverDiscountAmountFeesElementSheet.properties.defaultColWidth =
        feesWaiverDiscountFeesElementColumns.length;
      createFeesWaiverDiscountAmountFeesElementSheet.columns =
        feesWaiverDiscountFeesElementColumns;
      feesWaiversSheet.state = 'veryHidden';
      academicYearsSheet.state = 'veryHidden';
      campusesSheet.state = 'veryHidden';
      intakesSheet.state = 'veryHidden';
      feesElementsSheet.state = 'veryHidden';

      feesWaiversSheet.addRows(
        feesWaivers.map((waiver) => [waiver.fees_waiver_name])
      );

      academicYearsSheet.addRows(
        academicYears.map((acYear) => [acYear.academicYear.metadata_value])
      );

      campusesSheet.addRows(getMetadataValues(metadata, 'CAMPUSES'));

      intakesSheet.addRows(
        arrayPermutations(getMetadataValues(metadata, 'INTAKES'))
      );

      feesElementsSheet.addRows(
        feesElements.map((element) => [element.fees_element_name])
      );

      // Column Validations

      // Fees Waiver
      createFeesWaiverDiscountAmountFeesElementSheet.dataValidations.add(
        'A2:A1000',
        {
          type: 'list',
          allowBlank: true,
          formulae: ['=Sheet2!$A$1:$A$1000'],
          showErrorMessage: true,
          errorStyle: 'error',
          errorTitle: 'Invalid input!',
          error: 'Please select a valid value from the list',
        }
      );

      // Academic Years
      createFeesWaiverDiscountAmountFeesElementSheet.dataValidations.add(
        'B2:B1000',
        {
          type: 'list',
          allowBlank: true,
          formulae: ['=Sheet3!$A$1:$A$1000'],
          showErrorMessage: true,
          errorStyle: 'error',
          errorTitle: 'Invalid input!',
          error: 'Please select a valid value from the list',
        }
      );

      // Campuses
      createFeesWaiverDiscountAmountFeesElementSheet.dataValidations.add(
        'C2:C1000',
        {
          type: 'list',
          allowBlank: true,
          formulae: ['=Sheet4!$A$1:$A$1000'],
          showErrorMessage: true,
          errorStyle: 'error',
          errorTitle: 'Invalid input!',
          error: 'Please select a valid value from the list',
        }
      );

      // Intakes
      createFeesWaiverDiscountAmountFeesElementSheet.dataValidations.add(
        'D2:D1000',
        {
          type: 'list',
          allowBlank: true,
          formulae: ['=Sheet5!$A$1:$A$1000'],
          showErrorMessage: true,
          errorStyle: 'error',
          errorTitle: 'Invalid input!',
          error: 'Please select a valid value from the list',
        }
      );

      // Fees Element
      createFeesWaiverDiscountAmountFeesElementSheet.dataValidations.add(
        'E2:E1000',
        {
          type: 'list',
          allowBlank: true,
          formulae: ['=Sheet6!$A$1:$A$1000'],
          showErrorMessage: true,
          errorStyle: 'error',
          errorTitle: 'Invalid input!',
          error: 'Please select a valid value from the list',
        }
      );

      // Percentage
      createFeesWaiverDiscountAmountFeesElementSheet.dataValidations.add(
        'F2:F1000',
        {
          type: 'decimal',
          operator: 'between',
          formulae: [0, 100],
          allowBlank: true,
          showErrorMessage: true,
          errorStyle: 'error',
          errorTitle: 'Invalid input!',
          error: `The value must be a whole or decimal number between 0 and 100`,
          prompt: `The value must be a whole or decimal number between 0 and 100`,
        }
      );

      const uploadPath = `${process.cwd()}/src/assets/documents/templates`;

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true }, (err) => {
          throw new Error(err.message);
        });
      }

      const template = `${uploadPath}/download-fees-waiver-amount-discount-element-upload-template-${
        user.surname
      }-${user.other_names}-${user.id}-${now()}.xlsm`;

      await workbook.xlsx.writeFile(template);
      await res.download(
        template,
        'FEES-WAIVER-AMOUNT-FEES-ELEMENTS-UPLOAD-TEMPLATE.xlsx',
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
  uploadFeesElements(req, res) {
    try {
      const data = req.body;
      const user = req.user.id;
      const form = new formidable.IncomingForm();
      const uploadedFeesElements = [];

      data.created_by_id = user;

      form.parse(req, async (err, fields, files) => {
        if (err) {
          http.setError(400, 'Unable To Upload Fees Elements.', {
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
        const formattedFeesElements = XLSX.utils.sheet_to_json(
          workbook.Sheets[myTemplate]
        );

        if (isEmpty(formattedFeesElements)) {
          http.setError(400, 'Cannot upload an empty template.');

          return http.send(res);
        }

        const metadataValues = await metadataValueService.findAllMetadataValues(
          {
            include: ['metadata'],
          }
        );

        const chartOfAccounts =
          await chartOfAccountService.findAllChartsOfAccount({
            attributes: [
              'id',
              'account_status_id',
              'account_type_id',
              'tax_id',
              'account_code',
              'account_name',
            ],
            raw: true,
          });

        const getAccount = (value, element) => {
          try {
            const checkValue = chartOfAccounts.find(
              (account) =>
                toUpper(account.account_code) ===
                toUpper(value.substring(value.indexOf(':') + 1))
            );

            if (checkValue) return parseInt(checkValue.id, 10);
            throw new Error(
              `Cannot find ${value} in the list of accounts on record with element: ${element}`
            );
          } catch (error) {
            throw new Error(error.message);
          }
        };

        try {
          await model.sequelize.transaction(async (transaction) => {
            for (const element of formattedFeesElements) {
              if (!element['FEES ELEMENT NAME']) {
                throw new Error(
                  `One Of The Fees Elements Provided Has No Name.`
                );
              }
              data.fees_element_name = toUpper(
                trim(element['FEES ELEMENT NAME'])
              ).toString();

              validateSheetColumns(
                element,
                [
                  'FEES ELEMENT NAME',
                  'FEES ELEMENT CODE',
                  'ACCOUNT CODE',
                  'FEES CATEGORY',
                  'DESCRIPTION',
                ],
                data.fees_element_name
              );

              data.fees_element_code = toUpper(
                trim(element['FEES ELEMENT CODE'])
              ).toString();

              data.account_id = getAccount(
                element['ACCOUNT CODE'],
                data.fees_element_name
              );
              data.fees_category_id = getMetadataValueId(
                metadataValues,
                element['FEES CATEGORY'],
                'FEES CATEGORIES',
                data.fees_element_name
              );

              if (element.DESCRIPTION) {
                data.description = element.DESCRIPTION;
              }

              const upload = await insertNewFeesElement(data, transaction);

              uploadedFeesElements.push(upload);
            }
          });
          http.setSuccess(200, 'Fees Elements Uploaded successfully.', {
            data: uploadedFeesElements,
          });

          return http.send(res);
        } catch (error) {
          http.setError(400, 'Unable to upload fees elements.', {
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
   * fetchAllFeesElementsWithTheirAmounts
   * @param {*} req
   * @param {*} res
   */
  async fetchAllFeesElementsWithTheirAmounts(req, res) {
    try {
      const { student_id: studentId } = req.params;

      const findStudent = await studentService
        .findOneStudent({
          where: { id: studentId },
          include: [
            {
              association: 'programmes',
              include: [
                {
                  association: 'programme',
                  attributes: ['id', 'programme_study_level_id'],
                  include: [
                    {
                      association: 'studyLevel',
                      attributes: ['id', 'metadata_value'],
                    },
                  ],
                },
                {
                  association: 'programmeType',
                  attributes: ['id'],
                  include: {
                    association: 'programmeType',
                    attributes: ['id', 'metadata_value'],
                  },
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

      if (!findStudent) {
        throw new Error('This Student does not exist.');
      }

      if (isEmpty(findStudent.programmes)) {
        throw new Error('This Student Has No Programme.');
      }

      const checkCurrentProg = findStudent.programmes.find(
        (prog) => prog.is_current_programme === true
      );

      if (isEmpty(checkCurrentProg)) {
        throw new Error('This Student Has No Current Programme.');
      }

      const payload = {
        campus: checkCurrentProg.campus_id,
        academic_year: checkCurrentProg.entry_academic_year_id,
        intake: checkCurrentProg.intake_id,
        billing_category: checkCurrentProg.billing_category_id,
        programme_study_year: checkCurrentProg.current_study_year_id,
        study_level: checkCurrentProg.programme.programme_study_level_id,
        programme: checkCurrentProg.programme_id,
        programme_type: checkCurrentProg.programme_type_id,
        metadata_programme_type:
          checkCurrentProg.programmeType.programmeType.id,
      };

      const feesElements =
        await feesElementService.fetchAllFeesElementsWithTheirAmounts(payload);

      http.setSuccess(200, 'Fees Elements Fetched Successfully', {
        data: feesElements,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch Fees Elements', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  /**
   * Destroy FeesElement Data
   *
   * @param {*} req
   * @param {*} res
   *
   * @return {JSON}
   */
  async deleteFeesElement(req, res) {
    try {
      const { id } = req.params;

      await feesElementService.deleteFeesElement(id);
      http.setSuccess(200, 'Fees Element Deleted Successfully');

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Delete This Fees Element', {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }
}

const insertNewFeesElement = async function (data, transaction) {
  try {
    const result = await feesElementService.createFeesElement(
      data,
      transaction
    );

    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = FeesElementController;

const arrayPermutations = (arrayList) => {
  const result = [];

  const f = (prefix, chars) => {
    for (let i = 0; i < chars.length; i++) {
      result.push(`${chars[i]}, ${prefix}`);
      f(`${chars[i]}, ${prefix}`, chars.slice(i + 1));
    }
  };

  f('', arrayList);

  return orderBy(result.map((list) => [list.replace(/, $/, '')]));
};
