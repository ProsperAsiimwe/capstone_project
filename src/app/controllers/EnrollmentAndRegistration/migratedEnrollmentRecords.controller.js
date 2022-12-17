const { HttpResponse } = require('@helpers');
const {
  migratedEnrollmentRecordsService,
  studentService,
} = require('@services/index');

const { isEmpty, sumBy } = require('lodash');

const http = new HttpResponse();

class MigratedEnrollmentRecordsController {
  // migrated enrollment records
  async migratedEnrollments(req, res) {
    try {
      if (!req.query.student_number) {
        throw new Error('Invalid Context Provided');
      }

      const student = req.query.student_number;

      //

      const studentProgramme = await studentService
        .findOneStudentProgramme({
          where: {
            student_number: student,
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
          nest: true,
        })

        .then(function (res) {
          if (res) {
            const result = res.toJSON();

            return result;
          }
        });

      if (!studentProgramme) {
        throw new Error('Academic Record Does Not Exist.');
      }

      const context = studentProgramme;

      const data =
        await migratedEnrollmentRecordsService.migratedEnrollmentRecords(
          context
        );

      data.forEach((element) => {
        element.enrollments.forEach((i) => {
          let totalBill = i.total_bill;

          let totalCredit = i.total_credit;

          let totalPaid = i.total_paid;

          let totalDue = i.total_due;

          if (!isEmpty(i.other_fees)) {
            totalDue += sumBy(i.other_fees, 'total_due');
            totalPaid += sumBy(i.other_fees, 'total_paid');
            totalCredit += sumBy(i.other_fees, 'total_credit');
            totalBill += sumBy(i.other_fees, 'total_bill');
          }

          i.overAllTotalDue = totalDue;
          i.overAllTotalPaid = totalPaid;
          i.overAllTotalCredit = totalCredit;
          i.overAllTotalBilled = totalBill;
        });
      });

      http.setSuccess(
        200,
        'Student Migrated Enrollment Records  fetched successfully',
        {
          data,
        }
      );

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to  fetch Student Migrated Enrollment.', {
        error: { error: error.message },
      });

      return http.send(res);
    }
  }
  // student portal

  async studentMigratedEnrollments(req, res) {
    try {
      if (!req.params.studentProgrammeId) {
        throw new Error('Invalid Context Provided');
      }
      const id = req.params.studentProgrammeId;

      const studentProgramme = await studentService
        .findOneStudentProgramme({
          where: {
            id,
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
          nest: true,
        })

        .then(function (res) {
          if (res) {
            const result = res.toJSON();

            return result;
          }
        });

      if (!studentProgramme) {
        throw new Error('Academic Record Does Not Exist.');
      }

      const context = studentProgramme;

      const data =
        await migratedEnrollmentRecordsService.migratedEnrollmentRecords(
          context
        );

      data.forEach((element) => {
        element.enrollments.forEach((i) => {
          let totalBill = i.total_bill;

          let totalCredit = i.total_credit;

          let totalPaid = i.total_paid;

          let totalDue = i.total_due;

          if (!isEmpty(i.other_fees)) {
            totalDue += sumBy(i.other_fees, 'total_due');
            totalPaid += sumBy(i.other_fees, 'total_paid');
            totalCredit += sumBy(i.other_fees, 'total_credit');
            totalBill += sumBy(i.other_fees, 'total_bill');
          }

          i.overAllTotalDue = totalDue;
          i.overAllTotalPaid = totalPaid;
          i.overAllTotalCredit = totalCredit;
          i.overAllTotalBilled = totalBill;
        });
      });

      http.setSuccess(200, 'Enrollments fetched successfully', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to  fetch Enrollments.', {
        error: { error: error.message },
      });

      return http.send(res);
    }
  }

  // tuitionBalancesProgramme
  async tuitionBalancesProgramme(req, res) {
    try {
      if (!req.query.programme) {
        throw new Error('Invalid Context Provided');
      }

      const context = req.query;

      const data =
        await migratedEnrollmentRecordsService.tuitionBalancesProgramme(
          context
        );

      data.forEach((element) => {
        let total = element.total_due;

        let totalCredit = element.total_credit;

        let totalPaid = element.total_paid;

        let totalBilled = element.total_bill;

        if (!isEmpty(element.other_fees)) {
          total += sumBy(element.other_fees, 'total_due');
          totalBilled += sumBy(element.other_fees, 'total_bill');
          totalPaid += sumBy(element.other_fees, 'total_paid');
          totalCredit += sumBy(element.other_fees, 'total_credit');
        }

        element.overAllTotalDue = total;
        element.overAllTotalBilled = totalBilled;
        element.overAllTotalPaid = totalPaid;
        element.overAllTotalCredit = totalCredit;
      });

      http.setSuccess(200, 'Migrated Enrollments fetched successfully', {
        data,
      });

      return http.send(res);
    } catch (error) {
      http.setError(400, 'Unable to  fetch Migrated Enrollments.', {
        error: { error: error.message },
      });

      return http.send(res);
    }
  }
}

module.exports = MigratedEnrollmentRecordsController;
