const programmeTemplateColumns = [
  {
    header: 'PROGRAMME TITLE',
    key: 'title',
    width: 32,
  },
  {
    header: 'CODE',
    key: 'code',
    width: 10,
  },
  {
    header: 'AWARD',
    key: 'award',
    width: 15,
  },
  {
    header: 'DATE ESTABLISHED',
    key: 'date_established',
    width: 20,
    style: { numFmt: 'dd/mm/yyyy' },
  },
  {
    header: 'CAMPUSES',
    key: 'campuses',
    width: 15,
  },
  {
    header: 'PROGRAMME DESCRIPTION',
    key: 'programme_description',
    width: 32,
  },
  {
    header: 'DEPARTMENT',
    key: 'department',
    width: 20,
  },
  {
    header: 'PROGRAMME HEAD',
    key: 'programme_head',
    width: 25,
  },
  {
    header: 'PROGRAMME TYPES',
    key: 'programme_types',
    width: 25,
  },
  {
    header: 'ENTRY YEARS',
    key: 'entry_years',
    width: 15,
  },
  {
    header: 'STUDY LEVEL',
    key: 'study_level',
    width: 40,
  },
  {
    header: 'MODES OF DELIVERY',
    key: 'modes_of_delivery',
    width: 20,
  },
  {
    header: 'PROGRAMME DURATION',
    key: 'duration',
    width: 25,
  },
  {
    header: 'DURATION MEASURE',
    key: 'duration_measure',
    width: 25,
  },
  {
    header: 'PROGRAMME VERSION',
    key: 'version',
    width: 25,
  },
  {
    header: 'SPECIALIZATIONS',
    key: 'specializations',
    width: 20,
  },
  {
    header: 'SPECIALIZATION YEAR',
    key: 'specializations',
    width: 25,
  },
  {
    header: 'SPECIALIZATION SEMESTER',
    key: 'specializations',
    width: 25,
  },
  {
    header: 'SUBJECT COMBINATION CATEGORIES',
    key: 'subject_combination_categories',
    width: 33,
  },
  {
    header: 'SUBJECT COMBINATION YEAR',
    key: 'subject_combination_categories',
    width: 30,
  },
  {
    header: 'SUBJECT COMBINATION SEMESTER',
    key: 'subject_combination_categories',
    width: 33,
  },
  {
    header: 'VERSION PLANS',
    key: 'plans',
    width: 20,
  },
  {
    header: 'PLAN YEAR',
    key: 'plans',
    width: 20,
  },
  {
    header: 'PLAN SEMESTER',
    key: 'plans',
    width: 20,
  },
  {
    header: 'PLAN GRADUATION LOADS',
    key: 'plan_graduation_loads',
    width: 25,
  },
  {
    header: 'ENTRY YEAR GRADUATION LOADS',
    key: 'graduation_load',
    width: 30,
  },
  {
    header: 'OTHER DEPARTMENTS (comma separated CODES)',
    key: 'other_departments',
    width: 50,
  },
  // {
  //   header: 'PROGRAMME MODULES',
  //   key: 'modules',
  //   width: 25,
  // },
];

const studentTemplateColumns = [
  {
    header: 'SURNAME',
    key: 'FIRST-NAME',
    width: 30,
  },
  {
    header: 'OTHER NAMES',
    key: 'OTHER-NAME',
    width: 30,
  },
  {
    header: 'SPONSORSHIP',
    key: 'SPONSORSHIP',
    width: 20,
  },
  {
    header: 'PROGRAMME',
    key: 'PROGRAMME',
    width: 40,
  },
  {
    header: 'VERSION',
    key: 'VERSION',
    width: 20,
  },
  {
    header: 'PROGRAMME TYPE',
    key: 'PROGRAMME-TYPE',
    width: 20,
  },
  {
    header: 'ENTRY ACADEMIC YEAR',
    key: 'ENTRY-ACADEMIC-YEAR',
    width: 25,
  },
  {
    header: 'ENTRY STUDY YEAR',
    key: 'ENTRY-STUDY-YEAR',
    width: 25,
  },
  {
    header: 'CURRENT STUDY YEAR',
    key: 'CURRENT-STUDY-YEAR',
    width: 25,
  },
  {
    header: 'INTAKE',
    key: 'INTAKE',
    width: 20,
  },
  {
    header: 'CAMPUS',
    key: 'CAMPUS',
    width: 30,
  },
  {
    header: 'PLAN',
    key: 'PLAN',
    width: 20,
  },
  {
    header: 'SPECIALIZATION',
    key: 'SPECIALIZATION',
    width: 35,
  },
  {
    header: 'SUBJECT COMBINATION',
    key: 'SUBJECT-COMBINATION',
    width: 35,
  },
  {
    header: 'FEES WAIVER',
    key: 'FEES-WAVER',
    width: 35,
  },
  {
    header: 'BILLING CATEGORY',
    key: 'BILLING-CATEGORY',
    width: 20,
  },
  {
    header: 'RESIDENCE STATUS',
    key: 'RESIDENCE-STATUS',
    width: 20,
  },
  {
    header: 'HALL OF ATTACHMENT',
    key: 'HALL-OF-ATTACHMENT',
    width: 30,
  },
  {
    header: 'HALL OF RESIDENCE',
    key: 'HALL-OF-RESIDENCE',
    width: 30,
  },
  {
    header: 'ACADEMIC STATUS',
    key: 'ACADEMIC-STATUS',
    width: 30,
  },
  {
    header: 'PHONE',
    key: 'PHONE',
    width: 30,
    style: { numFmt: '@' },
  },
  {
    header: 'EMAIL',
    key: 'EMAIL',
    width: 25,
  },
  {
    header: 'STUDENT NUMBER',
    key: 'STUDENT-NO',
    width: 25,
    style: { numFmt: '@' },
  },
  {
    header: 'REGISTRATION NUMBER',
    key: 'REGISTRATION-NO',
    width: 25,
    style: { numFmt: '@' },
  },
  {
    header: 'GENDER',
    key: 'GENDER',
    width: 20,
  },
  {
    header: 'DATE OF BIRTH (MM/DD/YYYY)',
    key: 'DOB',
    width: 35,
    style: { numFmt: '@' },
  },
  {
    header: 'HOME DISTRICT',
    key: 'HOME-DISTRICT',
    width: 30,
  },
  {
    header: 'NATIONALITY',
    key: 'NATIONALITY',
    width: 30,
  },
  {
    header: 'SPONSOR',
    key: 'SPONSOR',
    width: 35,
  },
  {
    header: 'MARITAL STATUS',
    key: 'MARITAL-STATUS',
    width: 20,
  },
  {
    header: 'NATIONAL ID NUMBER',
    key: 'NATIONAL-ID',
    width: 35,
  },
  {
    header: 'PASSPORT NUMBER',
    key: 'PASSPORT-NUMBER',
    width: 30,
  },
  {
    header: 'RELIGION',
    key: 'RELIGION',
    width: 30,
  },
  {
    header: 'IS AFFILIATED',
    key: 'IS-AFFILIATED',
    width: 20,
  },
  {
    header: 'AFFILIATE INSTITUTE',
    key: 'AFFILIATE-INSTITUTE',
    width: 30,
  },
  {
    header: 'IS ON LOAN SCHEME',
    key: 'LOAN-SCHEME',
    width: 20,
  },
  {
    header: 'HAS COMPLETED',
    key: 'HAS-COMPLETED',
    width: 20,
  },
  {
    header: 'EMIS NUMBER',
    key: 'EMIS-NUMBER',
    width: 30,
  },
  {
    header: 'GUARDIAN NAME',
    key: 'GUARDIAN-NAME',
    width: 30,
  },
  {
    header: 'GUARDIAN-EMAIL',
    key: 'GUARDIAN EMAIL',
    width: 20,
  },
  {
    header: 'GUARDIAN PHONE',
    key: 'GUARDIAN-PHONE',
    width: 20,
  },
  {
    header: 'GUARDIAN RELATIONSHIP',
    key: 'GUARDIAN-RELATIONSHIP',
    width: 30,
  },
  {
    header: 'GUARDIAN ADDRESS',
    key: 'GUARDIAN-ADDRESS',
    width: 35,
  },
  {
    header: 'REQUIRES NEW STUDENT NUMBER?',
    key: 'REQUIRES NEW IDENTITY?',
    width: 45,
  },
];

const bulkUpdateStudentTemplateColumns = [
  {
    header: 'STUDENT NUMBER',
    key: 'STUDENT-NO',
    width: 25,
    style: { numFmt: '@' },
  },
  {
    header: 'PHONE',
    key: 'PHONE',
    width: 30,
    style: { numFmt: '@' },
  },
  {
    header: 'EMAIL',
    key: 'EMAIL',
    width: 25,
  },
  {
    header: 'DATE OF BIRTH (MM/DD/YYYY)',
    key: 'DOB',
    width: 35,
    style: { numFmt: '@' },
  },
  {
    header: 'CURRENT STUDY YEAR',
    key: 'current_study_year',
    width: 25,
  },
  {
    header: 'CURRENT SEMESTER',
    key: 'current_semester',
    width: 25,
  },
  {
    header: 'STUDENT ACADEMIC STATUS',
    key: 'academic_status',
    width: 25,
  },
  {
    header: 'STATUS ACADEMIC YEAR',
    key: 'academic_status_academic_year',
    width: 25,
  },
  {
    header: 'ACADEMIC STATUS REASON',
    key: 'academic_status_reason',
    width: 30,
    style: { numFmt: '@' },
  },
];

const courseTemplateColumns = [
  {
    header: 'CODE',
    key: 'CODE',
    width: 20,
  },
  {
    header: 'COURSE/MODULE NAME',
    key: 'COURSE-NAME',
    width: 40,
  },
  {
    header: 'CREDIT UNITS',
    key: 'CREDIT-UNITS',
    width: 20,
  },
  {
    header: 'LECTURE HRS',
    key: 'LECTURE-HOURS',
    width: 20,
  },
  {
    header: 'PRACTICAL HRS',
    key: 'PRACTICAL-HRS',
    width: 20,
  },
  {
    header: 'CONTACT HRS',
    key: 'CONTACT-HRS',
    width: 20,
  },
  {
    header: 'CLINICAL HRS',
    key: 'CLINICAL-HRS',
    width: 20,
  },
  {
    header: 'NOTIONAL HRS',
    key: 'NOTIONAL-HOURS',
    width: 20,
  },
  {
    header: 'FIELD WORK HRS',
    key: 'FIELD-WORK-HRS',
    width: 20,
  },
  {
    header: 'TUTORIAL HRS',
    key: 'TUTORIAL-HRS',
    width: 20,
  },
  {
    header: 'STATUS',
    key: 'STATUS',
    width: 20,
  },
  {
    header: 'CATEGORY',
    key: 'CATEGORY',
    width: 20,
  },
  {
    header: 'SEMESTER',
    key: 'SEMESTER',
    width: 20,
  },
  {
    header: 'STUDY YEAR',
    key: 'STUDY-YEAR',
    width: 20,
  },
  {
    header: 'NUMBER OF ASSESSMENTS',
    key: 'NUMBER-OF-ASSESSMENTS',
    width: 30,
  },
  {
    header: 'GRADING',
    key: 'GRADING',
    width: 20,
  },
  {
    header: 'DEPARTMENT',
    key: 'DEPARTMENT',
    width: 40,
  },
  {
    header: 'PLAN',
    key: 'PLAN',
    width: 30,
  },
  {
    header: 'SPECIALIZATION',
    key: 'SPECIALIZATION',
    width: 30,
  },
  {
    header: 'SUBJECT',
    key: 'SUBJECT',
    width: 30,
  },
  {
    header: 'MARKS COMPUTATION METHODS',
    key: 'MARKS-COMPUTATION',
    width: 30,
  },
  {
    header: 'HAS PREREQUISITE COURSES',
    key: 'HAS-PREREQUISITE-COURSES',
    width: 30,
  },
  {
    header: 'PREREQUISITE COURSE CODES (comma separated)',
    key: 'PREREQUISITE-CODES',
    width: 45,
  },
  {
    header: 'IS AUDITED COURSE?',
    key: 'AUDITED-COURSE',
    width: 45,
  },
];

const modularProgrammeCourseTemplateColumns = [
  {
    header: 'CODE',
    key: 'CODE',
    width: 20,
  },
  {
    header: 'COURSE/MODULE NAME',
    key: 'COURSE-NAME',
    width: 40,
  },
  {
    header: 'CREDIT UNITS',
    key: 'CREDIT-UNITS',
    width: 20,
  },
  {
    header: 'LECTURE HRS',
    key: 'LECTURE-HOURS',
    width: 20,
  },
  {
    header: 'PRACTICAL HRS',
    key: 'PRACTICAL-HRS',
    width: 20,
  },
  {
    header: 'CONTACT HRS',
    key: 'CONTACT-HRS',
    width: 20,
  },
  {
    header: 'CLINICAL HRS',
    key: 'CLINICAL-HRS',
    width: 20,
  },
  {
    header: 'NOTIONAL HRS',
    key: 'NOTIONAL-HOURS',
    width: 20,
  },
  {
    header: 'FIELD WORK HRS',
    key: 'FIELD-WORK-HRS',
    width: 20,
  },
  {
    header: 'TUTORIAL HRS',
    key: 'TUTORIAL-HRS',
    width: 20,
  },
  {
    header: 'STATUS',
    key: 'STATUS',
    width: 20,
  },
  {
    header: 'CATEGORY',
    key: 'CATEGORY',
    width: 20,
  },
  {
    header: 'SEMESTER',
    key: 'SEMESTER',
    width: 20,
  },
  {
    header: 'STUDY YEAR',
    key: 'STUDY-YEAR',
    width: 20,
  },
  {
    header: 'NUMBER OF ASSESSMENTS',
    key: 'NUMBER-OF-ASSESSMENTS',
    width: 30,
  },
  {
    header: 'GRADING',
    key: 'GRADING',
    width: 20,
  },
  {
    header: 'DEPARTMENT',
    key: 'DEPARTMENT',
    width: 40,
  },
  {
    header: 'MARKS COMPUTATION METHODS',
    key: 'MARKS-COMPUTATION',
    width: 30,
  },
  {
    header: 'MODULE',
    key: 'MODULE',
    width: 30,
  },
  {
    header: 'MODULE OPTION',
    key: 'MODULE-OPTION',
    width: 30,
  },
  {
    header: 'HAS PREREQUISITE COURSES',
    key: 'HAS-PREREQUISITE-COURSES',
    width: 30,
  },
  {
    header: 'PREREQUISITE COURSE CODES (comma separated)',
    key: 'PREREQUISITE-CODES',
    width: 45,
  },
  {
    header: 'IS AUDITED COURSE?',
    key: 'IS-AUDITED-COURSE',
    width: 45,
  },
];

const unebSubjectsTemplateColumns = [
  // A
  {
    header: 'SUBJECT CODE',
    key: 'code',
    width: 25,
    style: { numFmt: '@' },
  },
  // B
  {
    header: 'SUBJECT TITLE',
    key: 'title',
    width: 40,
    style: { numFmt: '@' },
  },
  // C
  {
    header: 'UNEB STUDY LEVEL',
    key: 'study-level',
    width: 30,
  },
  // D
  {
    header: 'GENERAL SUBJECT CATEGORY',
    key: 'general-subject-category',
    width: 30,
  },
  // E
  {
    header: 'UNEB SUBJECT CATEGORY',
    key: 'uneb-subject-category',
    width: 30,
  },
  // F
  {
    header: 'PAPERS (COMMA SEPARATED) eg. Paper 1, Paper 2',
    key: 'papers',
    width: 45,
  },
];

const previousEnrollmentRecordsTemplateColumns = [
  // A
  {
    header: 'STUDENT NUMBER',
    key: 'student-number',
    width: 30,
    style: { numFmt: '@' },
  },
  // B
  {
    header: 'ACADEMIC YEAR',
    key: 'academic-year',
    width: 25,
  },
  // C
  {
    header: 'STUDY YEAR',
    key: 'study-year',
    width: 25,
  },
  // D
  {
    header: 'SEMESTER',
    key: 'semester',
    width: 25,
  },
  // E
  {
    header: 'ENROLLMENT TOKEN',
    key: 'enrollment-token',
    width: 30,
    style: { numFmt: '@' },
  },
  // F
  {
    header: 'ENROLLMENT STATUS',
    key: 'enrollment-status',
    width: 25,
  },
  // G
  {
    header: 'ENROLLMENT DATE',
    key: 'enrollment-date',
    width: 25,
    style: { numFmt: '@' },
  },
  // H
  {
    header: 'REGISTRATION TOKEN',
    key: 'registration-token',
    width: 30,
    style: { numFmt: '@' },
  },
  // I
  {
    header: 'REGISTRATION STATUS',
    key: 'registration-status',
    width: 25,
  },
  // J
  {
    header: 'REGISTRATION DATE',
    key: 'registration-date',
    width: 25,
    style: { numFmt: '@' },
  },
  // K
  {
    header: 'IS CARD PRINTED ?',
    key: 'is_card_printed',
    width: 25,
  },
  // L
  {
    header: 'TUITION INVOICE NUMBER',
    key: 'tuition_invoice_no',
    width: 30,
    style: { numFmt: '@' },
  },
  // M
  {
    header: 'TUITION AMOUNT',
    key: 'tuition_amount',
    width: 25,
  },
  // N
  {
    header: 'TUITION CREDIT',
    key: 'tuition_credit',
    width: 25,
  },
  // O
  {
    header: 'TUITION PAID',
    key: 'tuition_paid',
    width: 25,
  },
  // P
  {
    header: 'TUITION BALANCE DUE',
    key: 'tuition_balance_due',
    width: 25,
  },
  // Q
  {
    header: 'FUNCTIONAL INVOICE NUMBER',
    key: 'functional_invoice_no',
    width: 30,
    style: { numFmt: '@' },
  },
  // R
  {
    header: 'FUNCTIONAL AMOUNT',
    key: 'functional_amount',
    width: 25,
  },
  // S
  {
    header: 'FUNCTIONAL CREDIT',
    key: 'functional_credit',
    width: 25,
  },
  // T
  {
    header: 'FUNCTIONAL PAID',
    key: 'functional_paid',
    width: 25,
  },
  // U
  {
    header: 'FUNCTIONAL BALANCE DUE',
    key: 'functional_balance_due',
    width: 25,
  },
  // V
  {
    header: 'OTHER FEES INVOICE NUMBERS (COMMA SEPARATED eg. INV01,INV02)',
    key: 'other_invoice_no',
    width: 45,
    style: { numFmt: '@' },
  },
  // W
  {
    header: 'OTHER FEES AMOUNTS (COMMA SEPARATED eg. 5000,10000)',
    key: 'other_amount',
    width: 45,
  },
  // X
  {
    header: 'OTHER FEES CREDIT (COMMA SEPARATED eg. 5000,10000)',
    key: 'other_credit',
    width: 45,
  },
  // Y
  {
    header: 'OTHER FEES PAID (COMMA SEPARATED eg. 5000,10000)',
    key: 'other_paid',
    width: 45,
  },
  // Z
  {
    header: 'OTHER FEES BALANCES DUE (COMMA SEPARATED eg. 5000,10000)',
    key: 'other_balance_due',
    width: 45,
  },
  // AA
  {
    header:
      'OTHER FEES NARRATIONS (COMMA SEPARATED eg. RETAKE FEE,MISSING PAPER)',
    key: 'other_fees_narration',
    width: 45,
    style: { numFmt: '@' },
  },
  // AB
  {
    header: 'TOTAL BILL',
    key: 'total_bill',
    width: 25,
  },
  // AC
  {
    header: 'TOTAL CREDIT',
    key: 'total_credit',
    width: 25,
  },
  // AD
  {
    header: 'TOTAL PAID',
    key: 'total_paid',
    width: 25,
  },
  // AE
  {
    header: 'TOTAL DUE',
    key: 'total_due',
    width: 25,
  },
];

const verifyTopushToSICTemplateColumns = [
  // A
  {
    header: 'SURNAME',
    key: 'surname',
    width: 25,
  },
  // B
  {
    header: 'OTHER NAME',
    key: 'otherName',
    width: 25,
  },
  // D
  {
    header: 'EMAIL',
    key: 'email',
    width: 25,
    style: { numFmt: '@' },
  },
  // E
  {
    header: 'PHONE NUMBER',
    key: 'phone-number',
    width: 25,
    style: { numFmt: '@' },
  },
  // F
  {
    header: 'REGISTRATION NUMBER',
    key: 'registration-number',
    width: 25,
    style: { numFmt: '@' },
  },
  // G
  {
    header: 'STUDENT NUMBER',
    key: 'student-number',
    width: 25,
    style: { numFmt: '@' },
  },
  // H
  {
    header: 'PROGRAMME CODE',
    key: 'programme-code',
    width: 10,
    style: { numFmt: '@' },
  },
  //
  {
    header: 'PROGRAMME',
    key: 'programme',
    width: 25,
    style: { numFmt: '@' },
  },
  // I
  {
    header: 'APPLICATION FORM ID',
    key: 'application-form-id',
    width: 25,
    style: { numFmt: '@' },
  },
  // J
  {
    header: 'DETECTED ERROR',
    key: 'detected-error',
    width: 30,
  },
  // K
  {
    header: 'NARRATION',
    key: 'narration',
    width: 80,
    style: { numFmt: '@' },
  },
];

module.exports = {
  studentTemplateColumns,
  programmeTemplateColumns,
  courseTemplateColumns,
  modularProgrammeCourseTemplateColumns,
  bulkUpdateStudentTemplateColumns,
  unebSubjectsTemplateColumns,
  previousEnrollmentRecordsTemplateColumns,
  verifyTopushToSICTemplateColumns,
};
