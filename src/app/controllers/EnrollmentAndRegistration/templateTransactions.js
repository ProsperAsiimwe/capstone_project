const paymentTransactionsColumns = [
  {
    header: 'FULL NAME',
    key: 'surname',
    width: 60,
    style: { numFmt: '@' },
  },
  {
    header: 'NATIONALITY',
    key: 'nationality',
    width: 30,
    style: { numFmt: '@' },
  },
  {
    header: 'SEX',
    key: 'gender',
    width: 10,
    style: { numFmt: '@' },
  },
  {
    header: 'PROG-CODE',
    key: 'programme_code',
    width: 20,
    style: { numFmt: '@' },
  },
  {
    header: 'PROG NAME',
    key: 'programme_title',
    width: 60,
    style: { numFmt: '@' },
  },
  {
    header: 'ACADEMIC UNIT',
    key: 'academic_unit_title',
    width: 60,
    style: { numFmt: '@' },
  },
  {
    header: 'ENROLLMENT STATUS',
    key: 'enrollment_status',
    width: 50,
    style: { numFmt: '@' },
  },
  {
    header: 'STUDENT NUMBER',
    key: 'student_number',
    width: 30,
    style: { numFmt: '@' },
  },
  {
    header: 'REGISTRATION NUMBER',
    key: 'registration_number',
    width: 30,
    style: { numFmt: '@' },
  },
  {
    header: 'CAMPUS',
    key: 'campus',
    width: 45,
    style: { numFmt: '@' },
  },
  {
    header: 'PROG-TYPE',
    key: 'programme_type',
    width: 15,
    style: { numFmt: '@' },
  },
  {
    header: 'STUDY YEAR',
    key: 'programme_study_years',
    width: 20,
    style: { numFmt: '@' },
  },
  // arrears
  {
    header: 'OPENING BALANCE',
    key: 'arrears_invoice_amount',
    width: 45,
    style: { numFmt: '@' },
  },
  {
    header: 'OPENING BALANCE PAID',
    key: 'arrears_amount_paid',
    width: 45,
    style: { numFmt: '@' },
  },
  {
    header: 'OPENING BALANCE DUE',
    key: 'arrears_amount_due',
    width: 45,
    style: { numFmt: '@' },
  },
  {
    header: 'TUITION AMOUNT',
    key: 'tuition_invoice_amount',
    width: 30,
    style: { numFmt: '@' },
  },
  {
    header: 'TUITION PAID',
    key: 'tuition_amount_paid',
    width: 30,
    style: { numFmt: '@' },
  },
  {
    header: 'TUITION DUE',
    key: 'tuition_amount_due',
    width: 30,
    style: { numFmt: '@' },
  },
  {
    header: 'FUNCTIONAL FEES AMOUNT',
    key: 'functional_fees_invoice_amount',
    width: 40,
    style: { numFmt: '@' },
  },
  {
    header: 'FUNCTIONAL FEES PAID',
    key: 'functional_fees_amount_paid',
    width: 40,
    style: { numFmt: '@' },
  },
  {
    header: 'FUNCTIONAL FEES DUE',
    key: 'functional_fees_amount_due',
    width: 40,
    style: { numFmt: '@' },
  },
  {
    header: 'OTHER FEES AMOUNT',
    key: 'other_fees_invoice_amount',
    width: 45,
    style: { numFmt: '@' },
  },
  {
    header: 'OTHER FEES  PAID',
    key: 'other_fees_amount_paid',
    width: 45,
    style: { numFmt: '@' },
  },
  {
    header: 'OTHER FEES DUE',
    key: 'other_fees_amount_due',
    width: 45,
    style: { numFmt: '@' },
  },
  {
    header: 'MANUAL INVOICE  AMOUNT',
    key: 'manual_invoices_invoice_amount',
    width: 45,
    style: { numFmt: '@' },
  },
  {
    header: 'MANUAL INVOICE PAID',
    key: 'manual_invoices_amount_paid',
    width: 45,
    style: { numFmt: '@' },
  },
  {
    header: 'MANUAL INVOICE DUE',
    key: 'manual_invoices_amount_due',
    width: 45,
    style: { numFmt: '@' },
  },
  {
    header: 'IS ENROLLED',
    key: 'is_enrolled',
    width: 30,
    style: { numFmt: '@' },
  },
  {
    header: 'ENROLLMENT CONDITION',
    key: 'enrollment_condition',
    width: 30,
    style: { numFmt: '@' },
  },
  {
    header: 'IS REGISTERED',
    key: 'is_registered',
    width: 30,
    style: { numFmt: '@' },
  },
  {
    header: 'REGISTRATION TYPE',
    key: 'registration_type',
    width: 30,
    style: { numFmt: '@' },
  },
  {
    header: 'PROV-REG TYPE',
    key: 'provisional_registration_type',
    width: 40,
    style: { numFmt: '@' },
  },
  {
    header: 'REGISTRATION CONDITION',
    key: 'registration_condition',
    width: 30,
    style: { numFmt: '@' },
  },
  {
    header: 'TOTAL AMOUNT BILLED',
    key: 'totalAmountInvoiced',
    width: 30,
    style: { numFmt: '@' },
  },
  {
    header: 'TOTAL AMOUNT PAID',
    key: 'totalAmountPaid',
    width: 30,
    style: { numFmt: '@' },
  },
  {
    header: 'TOTAL AMOUNT DUE',
    key: 'totalAmountDue',
    width: 30,
    style: { numFmt: '@' },
  },
  {
    header: 'PERCENT COMPLETION',
    key: 'percentCompletion',
    width: 30,
    style: { numFmt: '@' },
  },
  {
    header: 'SPONSORSHIP',
    key: 'sponsorship',
    width: 45,
    style: { numFmt: '@' },
  },
  {
    header: 'WAIVER SCHEME',
    key: 'fees_waiver',
    width: 45,
    style: { numFmt: '@' },
  },
  {
    header: 'SPONSOR',
    key: 'sponsor_name',
    width: 80,
    style: { numFmt: '@' },
  },
];

const feesDepositsColumns = [
  {
    header: 'SURNAME',
    key: 'surname',
    width: 30,
  },
  {
    header: 'OTHER NAMES',
    key: 'other_names',
    width: 30,
  },
  {
    header: 'EMAIL',
    key: 'email',
    width: 30,
  },
  {
    header: 'PHONE',
    key: 'phone',
    width: 30,
  },
  {
    header: 'ENTRY ACADEMIC YEAR',
    key: 'entry_academic_year',
    width: 30,
  },
  {
    header: 'GENDER',
    key: 'gender',
    width: 10,
  },
  {
    header: 'STD No',
    key: 'student_number',
    width: 30,
  },
  {
    header: 'REG No',
    key: 'registration_number',
    width: 30,
  },
  {
    header: 'PROG CODE',
    key: 'programme_code',
    width: 30,
  },
  {
    header: 'PROG TITLE',
    key: 'programme_title',
    width: 30,
  },

  {
    header: 'STUDY YEAR',
    key: 'programme_study_year',
    width: 30,
  },
  {
    header: 'URA PRN',
    key: 'ura_prn',
    width: 30,
  },
  {
    header: 'AMOUNT DEPOSITED',
    key: 'amount',
    width: 30,
  },
  {
    header: 'AMOUNT ALLOCATED',
    key: 'allocated_amount',
    width: 30,
  },
  {
    header: 'PREPAYMENT/UNALLOCATED AMOUNT',
    key: 'unallocated_amount',
    width: 45,
  },
  {
    header: 'PAYMENT DATE',
    key: 'payment_date',
    width: 30,
  },
  {
    header: 'SPONSORSHIP',
    key: 'sponsorship',
    width: 45,
  },
  {
    header: 'SCHEME/FEES WAIVER',
    key: 'fees_waiver',
    width: 45,
  },
  {
    header: 'ON PROVISIONAL LIST',
    key: 'provisional_list',
    width: 45,
  },
  {
    header: 'ON GRADUATION LIST',
    key: 'graduation_list',
    width: 45,
  },
  {
    header: 'COMPLETION YEAR',
    key: 'completion_year',
    width: 45,
  },

  {
    header: 'COMPLETED',
    key: 'has_completed',
    width: 45,
  },
  {
    header: 'STUDENT ACADEMIC STATUS',
    key: 'student_academic_status',
    width: 45,
  },
];

const paymentProgColumns = [
  {
    header: 'FULL NAME',
    key: 'surname',
    width: 45,
    style: { numFmt: '@' },
  },
  {
    header: 'OTHER NAMES',
    key: 'other_names',
    width: 50,
    style: { numFmt: '@' },
  },
  {
    header: 'NATIONALITY',
    key: 'nationality',
    width: 45,
    style: { numFmt: '@' },
  },
  {
    header: 'SEX',
    key: 'gender',
    width: 10,
    style: { numFmt: '@' },
  },
  {
    header: 'PROG-CODE',
    key: 'programme_code',
    width: 20,
    style: { numFmt: '@' },
  },
  {
    header: 'PROG NAME',
    key: 'programme_title',
    width: 70,
    style: { numFmt: '@' },
  },
  {
    header: 'ENROLLMENT STATUS',
    key: 'enrollment_status',
    width: 50,
    style: { numFmt: '@' },
  },
  {
    header: 'STUDENT NUMBER',
    key: 'student_number',
    width: 30,
    style: { numFmt: '@' },
  },
  {
    header: 'REGISTRATION NUMBER',
    key: 'registration_number',
    width: 30,
    style: { numFmt: '@' },
  },
  {
    header: 'CAMPUS',
    key: 'campus',
    width: 45,
    style: { numFmt: '@' },
  },
  {
    header: 'PROG-TYPE',
    key: 'programme_type',
    width: 15,
    style: { numFmt: '@' },
  },
  {
    header: 'STUDY YEAR',
    key: 'programme_study_years',
    width: 20,
    style: { numFmt: '@' },
  },
  {
    header: 'OPENING BALANCE',
    key: 'arrears_invoice_amount',
    width: 45,
    style: { numFmt: '@' },
  },
  {
    header: 'OPENING BALANCE PAID',
    key: 'arrears_amount_paid',
    width: 45,
    style: { numFmt: '@' },
  },
  {
    header: 'OPENING BALANCE DUE',
    key: 'arrears_amount_due',
    width: 45,
    style: { numFmt: '@' },
  },
  {
    header: 'TUITION AMOUNT',
    key: 'tuition_invoice_amount',
    width: 30,
    style: { numFmt: '@' },
  },
  {
    header: 'TUITION PAID',
    key: 'tuition_amount_paid',
    width: 30,
    style: { numFmt: '@' },
  },
  {
    header: 'TUITION DUE',
    key: 'tuition_amount_due',
    width: 30,
    style: { numFmt: '@' },
  },
  {
    header: 'FUNCTIONAL FEES AMOUNT',
    key: 'functional_fees_invoice_amount',
    width: 40,
    style: { numFmt: '@' },
  },
  {
    header: 'FUNCTIONAL FEES PAID',
    key: 'functional_fees_amount_paid',
    width: 40,
    style: { numFmt: '@' },
  },
  {
    header: 'FUNCTIONAL FEES DUE',
    key: 'functional_fees_amount_due',
    width: 40,
    style: { numFmt: '@' },
  },
  {
    header: 'OTHER FEES AMOUNT',
    key: 'other_fees_invoice_amount',
    width: 45,
    style: { numFmt: '@' },
  },
  {
    header: 'OTHER FEES  PAID',
    key: 'other_fees_amount_paid',
    width: 45,
    style: { numFmt: '@' },
  },
  {
    header: 'OTHER FEES DUE',
    key: 'other_fees_amount_due',
    width: 45,
    style: { numFmt: '@' },
  },
  {
    header: 'MANUAL INVOICE  AMOUNT',
    key: 'manual_invoices_invoice_amount',
    width: 45,
    style: { numFmt: '@' },
  },
  {
    header: 'MANUAL INVOICE PAID',
    key: 'manual_invoices_amount_paid',
    width: 45,
    style: { numFmt: '@' },
  },
  {
    header: 'MANUAL INVOICE DUE',
    key: 'manual_invoices_amount_due',
    width: 45,
    style: { numFmt: '@' },
  },
  {
    header: 'IS ENROLLED',
    key: 'is_enrolled',
    width: 30,
    style: { numFmt: '@' },
  },
  {
    header: 'ENROLLMENT CONDITION',
    key: 'enrollment_condition',
    width: 30,
    style: { numFmt: '@' },
  },
  {
    header: 'IS REGISTERED',
    key: 'is_registered',
    width: 30,
    style: { numFmt: '@' },
  },
  {
    header: 'REGISTRATION TYPE',
    key: 'registration_type',
    width: 30,
    style: { numFmt: '@' },
  },
  {
    header: 'PROV-REG TYPE',
    key: 'provisional_registration_type',
    width: 40,
    style: { numFmt: '@' },
  },
  {
    header: 'REGISTRATION CONDITION',
    key: 'registration_condition',
    width: 30,
    style: { numFmt: '@' },
  },
  {
    header: 'TOTAL AMOUNT BILLED',
    key: 'totalAmountInvoiced',
    width: 30,
    style: { numFmt: '@' },
  },
  {
    header: 'TOTAL AMOUNT PAID',
    key: 'totalAmountPaid',
    width: 30,
    style: { numFmt: '@' },
  },
  {
    header: 'TOTAL AMOUNT DUE',
    key: 'totalAmountDue',
    width: 30,
    style: { numFmt: '@' },
  },
  {
    header: 'PERCENT COMPLETION',
    key: 'percentCompletion',
    width: 30,
    style: { numFmt: '@' },
  },
  {
    header: 'SPONSORSHIP',
    key: 'sponsorship',
    width: 45,
    style: { numFmt: '@' },
  },
  {
    header: 'WAIVER SCHEME',
    key: 'fees_waiver',
    width: 45,
    style: { numFmt: '@' },
  },
  {
    header: 'SPONSOR',
    key: 'sponsor_name',
    width: 80,
    style: { numFmt: '@' },
  },
];

module.exports = {
  paymentTransactionsColumns,
  feesDepositsColumns,
  paymentProgColumns,
};
