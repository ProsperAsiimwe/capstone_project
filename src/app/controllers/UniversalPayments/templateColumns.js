const accountColumns = [
  {
    // A
    header: 'ACCOUNT CODE',
    key: 'account-code',
    width: 30,
    style: { numFmt: '@' },
  },
  {
    // B
    header: 'ACCOUNT NAME',
    key: 'account-name',
    width: 40,
  },
  {
    // C
    header: 'ACCOUNT TYPE',
    key: 'account-type',
    width: 38,
  },
  {
    // D
    header: 'ACCOUNT STATUS',
    key: 'account-status',
    width: 38,
  },
  {
    // E
    header: 'TAX',
    key: 'tax',
    width: 40,
  },
];

const receivableColumns = [
  {
    // A
    header: 'RECEIVABLE NAME',
    key: 'account-code',
    width: 45,
  },
  {
    // B
    header: 'ACCOUNT',
    key: 'account',
    width: 40,
  },
  {
    // C
    header: 'UNIT COST',
    key: 'unit-cost',
    width: 30,
  },
  {
    // D
    header: 'CURRENCY',
    key: 'currency',
    width: 30,
  },
  {
    // E
    header: 'DESCRIPTION',
    key: 'description',
    width: 45,
  },
];

const previousTransactionColumns = [
  {
    // A
    header: 'TRANSACTION ORIGIN',
    key: 'origin',
    width: 35,
  },
  {
    // B
    header: 'FULL NAME',
    key: 'full-name',
    width: 45,
    style: { numFmt: '@' },
  },
  {
    // C
    header: 'STUDENT NUMBER',
    key: 'student-number',
    width: 25,
    style: { numFmt: '@' },
  },
  {
    // D
    header: 'PHONE',
    key: 'phone',
    width: 30,
    style: { numFmt: '@' },
  },
  {
    // E
    header: 'EMAIL',
    key: 'email',
    width: 30,
    style: { numFmt: '@' },
  },
  {
    // F
    header: 'PAYMENT REFERENCE',
    key: 'reference',
    width: 35,
    style: { numFmt: '@' },
  },
  {
    // G
    header: 'AMOUNT',
    key: 'amount',
    width: 25,
  },
  {
    // H
    header: 'BANK',
    key: 'bank',
    width: 35,
  },
  {
    // I
    header: 'BRANCH',
    key: 'branch',
    width: 45,
  },
  {
    // J
    header: 'TRANSACTION DATE',
    key: 'date',
    width: 25,
  },
];

const sponsorStudentsColumns = [
  {
    // A
    header: 'SPONSOR',
    key: 'sponsor',
    width: 45,
  },
  {
    // B
    header: 'STUDENT NUMBER',
    key: 'student-number',
    width: 45,
    style: { numFmt: '@' },
  },
];

const sponsorAllocationsColumns = [
  {
    // A
    header: 'SPONSOR',
    key: 'sponsor',
    width: 45,
  },
  {
    // B
    header: 'STUDENT NUMBER',
    key: 'student-number',
    width: 45,
    style: { numFmt: '@' },
  },
  {
    // C
    header: 'AMOUNT',
    key: 'amount',
    width: 30,
  },
  {
    // D
    header: 'TRANSACTION PRN',
    key: 'transaction_prn',
    width: 35,
    style: { numFmt: '@' },
  },
];

const accountReportColumns = [
  {
    // A
    header: 'FULL NAME',
    key: 'full_name',
    width: 60,
  },
  {
    // B
    header: 'PHONE NUMBER',
    key: 'phone_number',
    width: 30,
    style: { numFmt: '@' },
  },
  {
    // C
    header: 'EMAIL',
    key: 'email',
    width: 45,
    style: { numFmt: '@' },
  },
  {
    // D
    header: 'RECEIVABLE',
    key: 'receivable_name',
    width: 45,
  },
  {
    // E
    header: 'UNIT COST',
    key: 'unit_cost',
    width: 25,
  },
  {
    // F
    header: 'QUANTITY',
    key: 'quantity',
    width: 20,
  },
  {
    // G
    header: 'TOTAL COST',
    key: 'receivable_amount',
    width: 25,
  },
  {
    // H
    header: 'PAYMENT REFERENCE',
    key: 'ura_prn',
    width: 45,
  },
  {
    // I
    header: 'AMOUNT PAID',
    key: 'amount',
    width: 25,
  },
  {
    // J
    header: 'BANK',
    key: 'bank',
    width: 30,
  },
  {
    // K
    header: 'BRANCH',
    key: 'branch',
    width: 50,
  },
  {
    // L
    header: 'PAYMENT DATE',
    key: 'payment_date',
    width: 25,
  },
];

const allTransactionReportColumns = [
  {
    // A
    header: 'FULL NAME',
    key: 'full_name',
    width: 60,
  },
  {
    // B
    header: 'PHONE NUMBER',
    key: 'phone_number',
    width: 30,
    style: { numFmt: '@' },
  },
  {
    // C
    header: 'EMAIL',
    key: 'email',
    width: 50,
    style: { numFmt: '@' },
  },
  {
    // H
    header: 'PAYMENT REFERENCE',
    key: 'ura_prn',
    width: 30,
  },
  {
    // I
    header: 'AMOUNT PAID',
    key: 'amount',
    width: 25,
  },
  {
    // J
    header: 'BANK',
    key: 'bank',
    width: 30,
  },
  {
    // J
    header: 'BRANCH',
    key: 'branch',
    width: 50,
  },
  {
    // K
    header: 'PAYMENT DATE',
    key: 'payment_date',
    width: 25,
  },

  {
    // K
    header: 'PAYMENT CATEGORY',
    key: 'category',
    width: 40,
  },
];

// all universal transactions

const allUniversalTransactionsColumns = [
  {
    // A
    header: 'ACCOUNT CODE',
    key: 'account_code',
    width: 45,
  },
  {
    // A
    header: 'ACCOUNT NAME',
    key: 'account_name',
    width: 45,
  },
  {
    // D
    header: 'RECEIVABLE',
    key: 'receivable_name',
    width: 45,
  },
  {
    // E
    header: 'UNIT COST',
    key: 'unit_cost',
    width: 25,
  },
  {
    // G
    header: 'TOTAL COST',
    key: 'receivable_amount',
    width: 25,
  },
  {
    // F
    header: 'QUANTITY',
    key: 'quantity',
    width: 20,
  },
  {
    // A
    header: 'FULL NAME',
    key: 'full_name',
    width: 45,
  },
  {
    // B
    header: 'PHONE NUMBER',
    key: 'phone_number',
    width: 30,
    style: { numFmt: '@' },
  },
  {
    // C
    header: 'EMAIL',
    key: 'email',
    width: 30,
    style: { numFmt: '@' },
  },
  {
    // I
    header: 'AMOUNT PAID',
    key: 'amount',
    width: 25,
  },
  {
    // A
    header: 'CURRENCY',
    key: 'currency',
    width: 45,
  },
  {
    // J
    header: 'BANK',
    key: 'bank',
    width: 30,
  },
  {
    // K
    header: 'BRANCH',
    key: 'branch',
    width: 30,
  },
  {
    // H
    header: 'PAYMENT REFERENCE',
    key: 'ura_prn',
    width: 30,
  },
  {
    // L
    header: 'PAYMENT DATE',
    key: 'payment_date',
    width: 25,
  },

  {
    // A
    header: 'TRANSACTIONS ORIGIN',
    key: 'transaction_origin',
    width: 45,
  },
  {
    // A
    header: 'STUDENT STATUS',
    key: 'student_status',
    width: 45,
  },
];

// account summary

const accountSummaryColumns = [
  {
    // A
    header: 'A/C CODE',
    key: 'account_code',
    width: 20,
  },
  {
    // A
    header: 'ACCOUNT NAME',
    key: 'account_name',
    width: 45,
  },
  {
    header: 'TL AMOUNT BILLED',
    key: 'total_billed',
    width: 30,
  },
  {
    header: 'TL AMOUNT COLLECTED',
    key: 'total_received',
    width: 30,
  },
];

module.exports = {
  accountColumns,
  receivableColumns,
  previousTransactionColumns,
  sponsorStudentsColumns,
  accountReportColumns,
  allTransactionReportColumns,
  sponsorAllocationsColumns,
  allUniversalTransactionsColumns,
  accountSummaryColumns,
};
