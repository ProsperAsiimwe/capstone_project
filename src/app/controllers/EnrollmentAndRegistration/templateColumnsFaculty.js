const enrollmentFacultyColumns = [
  {
    header: 'NAME',
    key: 'name',
    width: 45,
  },
  {
    header: 'GENDER',
    key: 'gender',
    width: 30,
  },
  {
    header: 'STUDENT NUMBER',
    key: 'student_number',
    width: 45,
  },
  {
    header: 'CAMPUS',
    key: 'campus',
    width: 45,
  },
  {
    header: 'PROGRAMME CODE',
    key: 'programme_code',
    width: 45,
  },
  {
    header: 'PROGRAMME TYPE',
    key: 'programme_type',
    width: 30,
  },
  {
    header: 'PROGRAMME STUDY YEAR',
    key: 'programme_study_years',
    width: 30,
  },
  {
    header: 'IS ENROLLED',
    key: 'is_enrolled',
    width: 30,
  },
  {
    header: 'ENROLLMENT TOKEN',
    key: 'enrollment_token',
    width: 30,
  },
  {
    header: 'ENROLLMENT CONDITION',
    key: 'enrollment_condition',
    width: 30,
  },
  {
    header: 'REGISTRATION TYPE',
    key: 'registration_type',
    width: 30,
  },
  {
    header: 'REGISTRATION STATUS',
    key: 'registration_status',
    width: 30,
  },
  {
    header: 'IS REGISTERED',
    key: 'is_registered',
    width: 30,
  },
  {
    header: 'PROVISIONAL REGISTRATION TYPE',
    key: 'provisional_registration_type',
    width: 45,
  },
  {
    header: 'REGISTRATION CONDITION',
    key: 'registration_condition',
    width: 45,
  },
  {
    header: 'TUITION INVOICE AMOUNT',
    key: 'tuition_invoice_amount',
    width: 30,
  },

  {
    header: 'TUITION AMOUNT PAID',
    key: 'tuition_amount_paid',
    width: 30,
  },

  {
    header: 'TUITION AMOUNT DUE',
    key: 'tuition_amount_due',
    width: 30,
  },

  {
    header: 'FUNCTIONAL FEES INVOICE AMOUNT',
    key: 'functional_fees_invoice_amount',
    width: 30,
  },

  {
    header: 'FUNCTIONAL FEES AMOUNT PAID',
    key: 'functional_fees_amount_paid',
    width: 30,
  },

  {
    header: 'FUNCTIONAL FEES AMOUNT DUE',
    key: 'functional_fees_amount_due',
    width: 30,
  },

  {
    header: 'OTHER FEES INVOICE AMOUNT',
    key: 'other_fees_invoice_amount',
    width: 30,
  },

  {
    header: 'OTHER FEES AMOUNT PAID',
    key: 'other_fees_amount_paid',
    width: 30,
  },

  {
    header: 'OTHER FEES AMOUNT DUE',
    key: 'other_fees_amount_due',
    width: 30,
  },
  {
    header: 'TOTAL AMOUNT INVOICED',
    key: 'totalAmountInvoiced',
    width: 30,
  },
  {
    header: 'TOTAL AMOUNT PAID',
    key: 'totalAmountPaid',
    width: 30,
  },
  {
    header: 'TOTAL AMOUNT DUE',
    key: 'totalAmountDue',
    width: 30,
  },
  {
    header: 'PERCENTAGE FEES COMPLETION',
    key: 'percentCompletion',
    width: 30,
  },
];
const enrollmentReportColumns = [
  {
    header: 'NAME',
    key: 'name',
    width: 45,
  },
  {
    header: 'GENDER',
    key: 'gender',
    width: 30,
  },
  {
    header: 'STUDENT NUMBER',
    key: 'student_number',
    width: 45,
  },
  {
    header: 'REG NUMBER',
    key: 'registration_number',
    width: 60,
  },
  {
    header: 'SPONSORSHIP',
    key: 'sponsorship',
    width: 50,
  },
  {
    header: 'CAMPUS',
    key: 'campus',
    width: 45,
  },
  {
    header: 'PROGRAMME CODE',
    key: 'programme_code',
    width: 45,
  },
  {
    header: 'PROGRAMME TYPE',
    key: 'programme_type',
    width: 30,
  },
  {
    header: 'PROGRAMME STUDY YEAR',
    key: 'programme_study_years',
    width: 30,
  },
  {
    header: 'IS ENROLLED',
    key: 'is_enrolled',
    width: 30,
  },
  {
    header: 'ENROLLMENT TOKEN',
    key: 'enrollment_token',
    width: 30,
  },
  {
    header: 'ENROLLMENT CONDITION',
    key: 'enrollment_condition',
    width: 30,
  },
  {
    header: 'REGISTRATION TYPE',
    key: 'registration_type',
    width: 30,
  },
  {
    header: 'REGISTRATION STATUS',
    key: 'registration_status',
    width: 30,
  },
  {
    header: 'IS REGISTERED',
    key: 'is_registered',
    width: 30,
  },
  {
    header: 'PROVISIONAL REGISTRATION TYPE',
    key: 'provisional_registration_type',
    width: 45,
  },
  {
    header: 'REGISTRATION CONDITION',
    key: 'registration_condition',
    width: 45,
  },
  {
    header: 'TUITION INVOICE AMOUNT',
    key: 'tuition_invoice_amount',
    width: 30,
  },

  {
    header: 'TUITION AMOUNT PAID',
    key: 'tuition_amount_paid',
    width: 30,
  },

  {
    header: 'TUITION AMOUNT DUE',
    key: 'tuition_amount_due',
    width: 30,
  },

  {
    header: 'FUNCTIONAL FEES INVOICE AMOUNT',
    key: 'functional_fees_invoice_amount',
    width: 30,
  },

  {
    header: 'FUNCTIONAL FEES AMOUNT PAID',
    key: 'functional_fees_amount_paid',
    width: 30,
  },

  {
    header: 'FUNCTIONAL FEES AMOUNT DUE',
    key: 'functional_fees_amount_due',
    width: 30,
  },

  {
    header: 'OTHER FEES INVOICE AMOUNT',
    key: 'other_fees_invoice_amount',
    width: 30,
  },

  {
    header: 'OTHER FEES AMOUNT PAID',
    key: 'other_fees_amount_paid',
    width: 30,
  },

  {
    header: 'OTHER FEES AMOUNT DUE',
    key: 'other_fees_amount_due',
    width: 30,
  },
  {
    header: 'TOTAL AMOUNT INVOICED',
    key: 'totalAmountInvoiced',
    width: 30,
  },
  {
    header: 'TOTAL AMOUNT PAID',
    key: 'totalAmountPaid',
    width: 30,
  },
  {
    header: 'TOTAL AMOUNT DUE',
    key: 'totalAmountDue',
    width: 30,
  },
  {
    header: 'PERCENTAGE FEES COMPLETION',
    key: 'percentCompletion',
    width: 30,
  },
  //

  {
    header: 'FEES WAIVER',
    key: 'fees_waiver',
    width: 40,
  },
  {
    header: 'SPONSOR NAME',
    key: 'sponsor_name',
    width: 60,
  },
];

module.exports = {
  enrollmentFacultyColumns,
  enrollmentReportColumns,
};
