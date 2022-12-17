// itsFinancialStatement
const { HttpResponse } = require('@helpers');
const {
  searchTransactionsService,
  institutionStructureService,
} = require('@services/index');
const { isEmpty, sumBy, toUpper } = require('lodash');
const moment = require('moment');

const fs = require('fs');
const PDFDocument = require('pdfkit-table');
const { appConfig } = require('@root/config');

const http = new HttpResponse();

class ItsDataController {
  async itsFinancialStatement(req, res) {
    const context = req.query;

    try {
      if (!context.student) {
        throw new Error('Invalid Context Provided');
      }

      const result = await searchTransactionsService.itsFinancialStatement(
        context
      );

      if (isEmpty(result)) {
        throw new Error(`No records found for ${context.student}`);
      }

      const data = statementStatus(result);

      http.setSuccess(200, `Student Ledger fetched successfully`, {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, `Unable To Fetch Student Ledger`, {
        error: { message: error.message },
      });

      return http.send(res);
    }
  }

  // itsFinancialStatement

  async pdfItsFinancialStatement(req, res) {
    try {
      const context = req.query;

      if (!context.student) {
        throw new Error('Invalid Context Provided');
      }

      const filter = await searchTransactionsService.itsFinancialStatement(
        context
      );

      if (isEmpty(filter)) {
        throw new Error(`No records found for ${context.student}`);
      }

      const result = statementStatus(filter);

      const dataY = {
        std_no: '',
        alt_names: '',
        title: '',
        surn: '',
        names: '',
        date: '',
        ref_no: '',
        note: '*******    Fees    Accounts    *******',
        debits: '',
        credits: '',
      };
      const getData = result.data;

      getData.forEach((element) => {
        if (element.credits === 0) {
          element.credits = '';
        } else {
          element.credits = element.credits.toFixed(2);
        }

        element.debits = element.debits.toFixed(2);

        // if (element.debits === 0) {
        //   element.debits = '';
        // }
      });

      const getStudentData = result.data[0];

      getData.splice(0, 0, dataY);

      const institutionStructure =
        await institutionStructureService.findInstitutionStructureRecords({
          attributes: ['institution_name', 'institution_logo'],
        });

      if (!institutionStructure) {
        throw new Error('Unable To Find Institution Structure.');
      }

      /// here

      const theOutput = new PDFDocument({
        size: 'A4',
        layout: 'Portrait',
        margin: 40,
        permissions: {
          copying: false,
          modifying: false,
          fillingForms: false,
        },
      });
      const pathTemplate = `${appConfig.ASSETS_ROOT_DIRECTORY}/documents/templates/`;

      const fileName = `${pathTemplate}GraduateAdmissions.pdf`;
      const institutionName = toUpper(institutionStructure.institution_name);

      const generatedAtTime = moment(moment.now()).format('lll');
      const generatedAt = moment(moment.now()).format('ll');

      theOutput.pipe(fs.createWriteStream(fileName));

      const pathToLog = `${appConfig.ASSETS_ROOT_DIRECTORY}/logo`;

      theOutput.image(`${pathToLog}/default.png`, 380, 30, {
        align: 'center',
        fit: [70, 70],
        valign: 'center',
      });

      theOutput.moveDown();

      theOutput.moveDown(4.0).font('Courier-Bold').text(`${institutionName}`, {
        align: 'center',
        bold: true,
      });

      theOutput.font('Courier-Bold').text(`Office of the University Bursar`, {
        align: 'center',
        bold: true,
      });

      theOutput.font('Courier-Bold').text(`P.O. BOX 7062 KAMPALA`, {
        align: 'center',
        bold: true,
      });

      theOutput.font('Courier-Bold').text(`FINANCIAL STATEMENT`, {
        align: 'center',
        bold: true,
      });
      theOutput.moveDown();
      // theOutput.moveDown();

      theOutput.text(
        `${getStudentData.title}    ${getStudentData.surn} ${getStudentData.names}`,
        {
          align: 'left',
          fontSize: 8,
        }
      );
      // theOutput.text('P.O. BOX 7062 KAMPALA', {
      //   align: 'left',
      // });

      theOutput.text(
        `RE: STUDENT: ${getStudentData.title} ${getStudentData.surn} ${getStudentData.names}`,
        {
          align: 'center',
        }
      );
      theOutput.text(`STUDENT: ${getStudentData.std_no}`, {
        align: 'center',
      });
      theOutput.text(`DATE of Issue: ${generatedAt}`, {
        align: 'center',
      });

      theOutput.moveDown();

      // theOutput.moveDown();

      theOutput.moveDown();

      const table = {
        // title: `Statement`,
        headers: [
          {
            label: 'DATE',
            property: 'date',
            width: 100,
            renderer: null,
            bold: true,
            align: 'center',
          },
          {
            label: 'REFERENCE NO',
            property: 'ref_no',
            width: 100,
            renderer: null,
            bold: true,
            align: 'center',
          },
          {
            label: 'DESCRIPTION',
            property: 'note',
            width: 250,
            renderer: null,
            align: 'left',
          },
          {
            label: 'DEBIT',
            property: 'debits',
            width: 100,
            renderer: null,
            align: 'right',
          },
          {
            label: 'CREDIT',
            property: 'credits',
            width: 100,
            renderer: null,
            align: 'right',
          },
        ],
        datas: [...getData],
      };

      await theOutput.table(table, {
        // columnsSize: [50, 100, 100, 100, 100, 100, 100],
        prepareHeader: () =>
          theOutput.font('Courier-Bold').fontSize(10).moveDown(),
        prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
          theOutput.font('Courier').fontSize(10);
          indexColumn = 0;
        },
        align: 'center',
        columnSpacing: 3,
        width: 650,
      });

      theOutput.moveDown();
      const userDetails = req.user.dataValues;

      theOutput.text(`Transactions Included Up To: ${generatedAtTime}`, {
        align: 'left',
      });

      theOutput.text(`${result.comment}             ${result.bal}`, {
        align: 'center',
        fontSize: 50,
        indent: 300,
        bold: true,
      });

      theOutput.moveDown();

      theOutput.moveDown();
      theOutput.text(
        `Print By: ${userDetails.surname} ${userDetails.other_names}`,
        {
          align: 'left',
        }
      );
      theOutput.moveDown();

      theOutput.moveDown();
      theOutput.text(
        `Signature:.................................................................................`,
        {
          align: 'left',
        }
      );
      theOutput.moveDown();

      theOutput.end();

      const dataReport = res;

      return theOutput.pipe(dataReport);
    } catch (error) {
      http.setError(400, 'Unable to Download Financial Statement.', {
        error: { error: error.message },
      });

      return http.send(res);
    }
  }
}

module.exports = ItsDataController;

//
const statementStatus = function (data) {
  const totalCredit = sumBy(data, 'credits');
  const totalDebit = sumBy(data, 'debits');

  let statement = '';

  let bal = 0;

  let comment = '';

  /* if (totalCredit > totalDebit) {
    statement = `DUE TO YOU=>   ${totalCredit - totalDebit}`;
    comment = `DUE TO YOU       =>`;
    bal = totalCredit - totalDebit;
  } else if (totalCredit < totalDebit) {
    statement = `DUE TO US =>   ${totalDebit - totalCredit}`;
    comment = `DUE TO US        =>`;
    bal = totalDebit - totalCredit;
  } else if (totalCredit === totalDebit) {
    statement = `You`;
    bal = totalDebit - totalCredit;
    comment = `NET BALANCE         =>`;
  } */

  if (totalCredit > totalDebit) {
    statement = `DUE TO YOU=>   ${totalDebit - totalCredit}`;
    comment = `DUE TO YOU       =>`;
    bal = totalDebit - totalCredit;
  } else if (totalCredit < totalDebit) {
    statement = `DUE TO US =>   ${totalDebit - totalCredit}`;
    comment = `DUE TO US        =>`;
    bal = totalDebit - totalCredit;
  } else if (totalCredit === totalDebit) {
    statement = `You`;
    bal = totalDebit - totalCredit;
    comment = `NET BALANCE         =>`;
  }

  const filter = { totalDebit, totalCredit, bal, statement, comment, data };

  return filter;
};
