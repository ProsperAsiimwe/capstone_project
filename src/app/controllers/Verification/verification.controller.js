const HttpResponse = require('@helpers/http-response');
const { registrationService, invoiceService } = require('@services/index');
const { studentService } = require('@services/index');
const { find, pick, isEmpty, sumBy } = require('lodash');

const http = new HttpResponse();

class VerificationController {
  /**
   * App Index endpoint
   *
   * @param {*} req Request
   * @param {*} res Response
   */
  async verifyStudent(req, res) {
    try {
      const { studentNumber } = req.query;

      if (!studentNumber) throw new Error('Student Number is required');

      const student =
        await studentService.findStudentByRegistrationOrStudentNumber(
          {
            student: studentNumber,
          },
          req
        );

      if (!student)
        throw new Error(
          'Invalid Student Number or Registration number provided'
        );

      const studentProgramme = find(
        student.academic_records,
        'is_current_programme'
      );

      const data =
        await registrationService.registrationHistoryCourseUnitsByStudent(
          studentProgramme.id
        );

      const tuitionFunctionalOther =
        await invoiceService.findAllTuitionFunctionalAndOtherFeesInvoices(
          student.id
        );
      const manual = await invoiceService.findAllManualInvoices(student.id);

      const unmatchedManualContext = [];

      manual.forEach((manualInvoice) => {
        const findContextInAuto = tuitionFunctionalOther.find(
          (invoice) =>
            manualInvoice.semester_id === invoice.semester_id &&
            manualInvoice.academic_year_id === invoice.academic_year_id &&
            manualInvoice.study_year_id === invoice.study_year_id
        );

        if (!findContextInAuto) {
          unmatchedManualContext.push({
            ...manualInvoice,
            tuition_invoices: [],
            functional_fees_invoices: [],
            other_fees_invoices: [],
          });
        }
      });

      const newInvoice = tuitionFunctionalOther.map((invoice) => {
        const findManualInvoice = manual.find(
          (context) =>
            context.semester_id === invoice.semester_id &&
            context.academic_year_id === invoice.academic_year_id &&
            context.study_year_id === invoice.study_year_id
        );

        return {
          ...invoice,
          manual_invoices: findManualInvoice
            ? findManualInvoice.manual_invoices
            : [],
        };
      });

      const merged = newInvoice.concat(unmatchedManualContext);

      let sumAllTuitionInvoiceAmountsDue = 0;

      let sumAllFunctionalInvoiceAmountsDue = 0;

      let sumAllOtherFeesInvoiceAmountsDue = 0;

      let sumAllManualInvoiceAmountsDue = 0;

      const arrayOfTuitionInvoices = [];
      const arrayOfFunctionalInvoices = [];
      const arrayOfOtherFeesInvoices = [];
      const arrayOfManualInvoices = [];

      if (!isEmpty(merged)) {
        for (const eachObject of merged) {
          if (!isEmpty(eachObject.tuition_invoices)) {
            arrayOfTuitionInvoices.push(...eachObject.tuition_invoices);
          }
          if (!isEmpty(eachObject.functional_fees_invoices)) {
            arrayOfFunctionalInvoices.push(
              ...eachObject.functional_fees_invoices
            );
          }
          if (!isEmpty(eachObject.other_fees_invoices)) {
            arrayOfOtherFeesInvoices.push(...eachObject.other_fees_invoices);
          }
          if (!isEmpty(eachObject.manual_invoices)) {
            arrayOfManualInvoices.push(...eachObject.manual_invoices);
          }
        }

        if (!isEmpty(arrayOfTuitionInvoices)) {
          sumAllTuitionInvoiceAmountsDue = sumBy(
            arrayOfTuitionInvoices,
            'amount_due'
          );
        }

        if (!isEmpty(arrayOfFunctionalInvoices)) {
          sumAllFunctionalInvoiceAmountsDue = sumBy(
            arrayOfFunctionalInvoices,
            'amount_due'
          );
        }

        if (!isEmpty(arrayOfOtherFeesInvoices)) {
          sumAllOtherFeesInvoiceAmountsDue = sumBy(
            arrayOfOtherFeesInvoices,
            'amount_due'
          );
        }

        if (!isEmpty(arrayOfManualInvoices)) {
          sumAllManualInvoiceAmountsDue = sumBy(
            arrayOfManualInvoices,
            'amount_due'
          );
        }
      }

      const studentFeesBalance =
        sumAllTuitionInvoiceAmountsDue +
        sumAllFunctionalInvoiceAmountsDue +
        sumAllManualInvoiceAmountsDue +
        sumAllOtherFeesInvoiceAmountsDue;

      const response = {
        registrations: data,
        student: pick(student, ['avatar', 'surname', 'other_names']),
        currentProgramme: pick(studentProgramme, [
          'campus',
          'registration_number',
          'student_number',
          'student_account_status',
          'intake',
          'programme_code',
          'sponsorship',
          'student_academic_status',
          'version_title',
          'programme_type',
          'programme_title',
          'current_study_year',
          'gender',
        ]),
        studentFeesBalance,
      };

      http.setSuccess(
        200,
        'Enrollment And Registration Records Fetched Successfully.',
        {
          data: response,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable To Fetch App Functions', {
        error: {
          message: error.message,
        },
      });

      return http.send(res);
    }
  }
}

module.exports = VerificationController;
