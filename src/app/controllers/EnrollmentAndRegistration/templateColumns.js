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
    header: 'REG No',
    key: 'registration_number',
    width: 45,
  },
  {
    header: 'DATE OF BIRTH',
    key: 'date_of_birth',
    width: 45,
  },
  {
    header: 'DISTRICT',
    key: 'district',
    width: 45,
  },
  {
    header: 'NATIONALITY',
    key: 'nationality',
    width: 45,
  },
  {
    header: 'CAMPUS',
    key: 'campus',
    width: 45,
  },
  {
    header: 'PROGRAMME TYPE',
    key: 'programme_type',
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

const directPostColumns = [
  {
    header: 'STUDENT NUMBER',
    key: 'student_number',
    width: 25,
    style: { numFmt: '@' },
  },
  {
    header: 'ACADEMIC YEAR',
    key: 'academic_year',
    width: 25,
  },
  {
    header: 'SEMESTER',
    key: 'semester',
    width: 25,
  },
  {
    header: 'STUDY YEAR',
    key: 'study_year',
    width: 25,
  },
  {
    header: 'PAYMENT MODE',
    key: 'payment_mode',
    width: 25,
  },
  {
    header: 'AMOUNT PAID',
    key: 'amount_paid',
    width: 25,
  },
  {
    header: 'CURRENCY',
    key: 'currency',
    width: 25,
  },
  {
    header: 'BANK NAME',
    key: 'bank_name',
    width: 30,
  },
  {
    header: 'BRANCH',
    key: 'branch',
    width: 30,
  },
  {
    header: 'MODE REFERENCE',
    key: 'mode_reference',
    width: 25,
    style: { numFmt: '@' },
  },
  {
    header: 'NARRATION',
    key: 'narration',
    width: 35,
  },
  {
    header: 'PAYMENT DATE (MM-DD-YYYY)',
    key: 'payment_date',
    width: 25,
    style: { numFmt: '@' },
  },
];

const bulkManualInvoiceColumns = [
  // A
  {
    header: 'STUDENT NUMBER',
    key: 'student_number',
    width: 25,
    style: { numFmt: '@' },
  },
  // B
  {
    header: 'ACADEMIC YEAR',
    key: 'academic_year',
    width: 25,
  },
  // C
  {
    header: 'SEMESTER',
    key: 'semester',
    width: 25,
  },
  // D
  {
    header: 'STUDY YEAR',
    key: 'study_year',
    width: 25,
  },
  // E
  {
    header: 'INVOICE TYPE',
    key: 'invoice_type',
    width: 25,
  },
  // F
  {
    header: 'CURRENCY',
    key: 'currency',
    width: 25,
  },
  // G
  {
    header: 'DUE DATE (MM-DD-YYYY)',
    key: 'due_date',
    width: 25,
    style: { numFmt: '@' },
  },
  // H
  {
    header: 'FEES ELEMENTS',
    key: 'fees_element',
    width: 50,
  },
  // I
  {
    header: 'AMOUNT',
    key: 'amount',
    width: 35,
  },
  // J
  {
    header: 'NARRATION',
    key: 'narration',
    width: 50,
  },
];

module.exports = {
  enrollmentReportColumns,
  directPostColumns,
  bulkManualInvoiceColumns,
};
