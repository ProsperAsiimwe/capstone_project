const nodeUploadTemplateColumns = [
  {
    header: 'STUDENT NAME',
    key: 'name',
    width: 35,
  },
  {
    header: 'STUDENT NUMBER',
    key: 'student_number',
    style: { numFmt: '@' },
    width: 20,
  },
  {
    header: 'REG. NUMBER',
    key: 'registration_number',
    style: { numFmt: '@' },
    width: 20,
  },
];

const bulkUploadTemplateColumns = [
  {
    // A
    header: 'REGISTRATION NUMBER',
    key: 'reg-no',
    style: { numFmt: '@' },
    width: 35,
  },
  {
    // B
    header: 'STUDENT NUMBER',
    key: 'student-number',
    style: { numFmt: '@' },
    width: 35,
  },
  {
    // C
    header: 'COURSE CODE',
    key: 'course-code',
    width: 20,
  },
  {
    // D
    header: 'ACADEMIC YEAR',
    key: 'academic-year',
    width: 20,
  },
  {
    // E
    header: 'STUDY YEAR',
    key: 'study-year',
    width: 20,
  },
  {
    // F
    header: 'SEMESTER',
    key: 'semester',
    width: 20,
  },
  {
    // G
    header: 'COURSE WORK MARK',
    key: 'cw',
    width: 20,
  },
  {
    // H
    header: 'FINAL EXAM MARK',
    key: 'ex',
    width: 20,
  },
  {
    // I
    header: 'FINAL MARK',
    key: 'final',
    width: 20,
  },
  {
    // J
    header: 'IS FIRST SITTING ?',
    key: 'is_first_sitting',
    width: 30,
  },
  {
    // K
    header: 'RETAKE COUNT',
    key: 'retake_count',
    width: 20,
  },
  {
    // L
    header: 'IS AUDITED COURSE?',
    key: 'audited_course',
    width: 20,
  },
];

const studentAssessmentTemplateColumns = [
  {
    // A
    header: 'REGISTRATION NUMBER',
    key: 'reg-no',
    style: { numFmt: '@' },
    width: 35,
  },
  {
    // B
    header: 'PROGRAMME CODE',
    key: 'prog',
    width: 35,
  },
  {
    // C
    header: 'ACADEMIC YEAR',
    key: 'academic-year',
    width: 20,
  },
  {
    // D
    header: 'STUDY YEAR',
    key: 'study-year',
    width: 20,
  },
  {
    // E
    header: 'SEMESTER',
    key: 'semester',
    width: 20,
  },
  {
    // F
    header: 'GPA',
    key: 'gpa',
    width: 25,
  },
  {
    // G
    header: 'CGPA',
    key: 'cgpa',
    width: 25,
  },
  {
    // H
    header: 'TCU',
    key: 'tcu',
    width: 25,
  },
  {
    // I
    header: 'CTCU',
    key: 'ctcu',
    width: 25,
  },
  {
    // J
    header: 'TWS',
    key: 'tws',
    width: 25,
  },
  {
    // K
    header: 'CTWS',
    key: 'ctws',
    width: 25,
  },
];

const resultsViewTemplateColumns = [
  {
    // A
    header: 'STUDENT',
    key: 'student',
    style: { numFmt: '@' },
    width: 40,
  },
  {
    // B
    header: 'REGISTRATION NUMBER',
    key: 'registration_number',
    style: { numFmt: '@' },
    width: 25,
  },
  {
    // C
    header: 'STUDENT NUMBER',
    key: 'student_number',
    style: { numFmt: '@' },
    width: 25,
  },
  {
    // D
    header: 'PROGRAMME',
    key: 'prog',
    width: 25,
  },
  {
    // E
    header: 'PROGRAMME TYPE',
    key: 'programme_type',
    width: 25,
  },
];

const dissertationTemplateColumns = [
  {
    // A
    header: 'REGISTRATION NUMBER',
    key: 'registration_number',
    style: { numFmt: '@' },
    width: 25,
  },
  {
    // B
    header: 'STUDENT NUMBER',
    key: 'student_number',
    style: { numFmt: '@' },
    width: 25,
  },
  {
    // D
    header: 'DISSERTATION TITLE',
    key: 'title',
    width: 40,
  },
  {
    // E
    header: 'DISSERTATION REMARK',
    key: 'remark',
    width: 80,
  },
];

const nodeIdentityColumns = [
  {
    // A
    header: 'NODE',
    key: 'node',
    width: 20,
  },
  {
    // B
    header: 'ASSESSMENT',
    key: 'ass',
    width: 20,
  },
];

const graduationListColumns = [
  {
    header: 'REG. NUMBER',
    key: 'registration_number',
    width: 25,
  },
  {
    header: 'NAME',
    key: 'name',
    width: 45,
  },
  {
    header: 'STUDENT NUMBER',
    key: 'student_number',
    width: 25,
  },
  {
    header: 'SEX',
    key: 'gender',
    width: 25,
  },
  {
    header: 'PROGRAMME TYPE',
    key: 'prog_type',
    width: 25,
  },
  {
    header: 'STUDY LEVEL',
    key: 'study_level',
    width: 25,
  },
  {
    header: 'TOTAL CREDIT UNITS',
    key: 'credit_units',
    width: 25,
  },
  {
    header: 'GRADUATION LOAD',
    key: 'grad_load',
    width: 25,
  },
  {
    header: 'CGPA',
    key: 'cgpa',
    width: 25,
  },
  {
    header: 'DEGREE CLASS',
    key: 'grad_load',
    width: 25,
  },
  {
    header: 'ENTRY ACADEMIC YEAR',
    key: 'grad_load',
    width: 25,
  },
  {
    header: 'CURRENT STUDY YEAR',
    key: 'grad_load',
    width: 25,
  },
];

const batchReportColumns = [
  {
    header: 'STUDENT NAME',
    key: 'progCode',
    style: { numFmt: '@' },
    width: 35,
  },
  {
    header: 'REGISTRATION NUMBER',
    key: 'reg-no',
    style: { numFmt: '@' },
    width: 20,
  },
  {
    // B
    header: 'STUDENT NUMBER',
    key: 'student-number',
    style: { numFmt: '@' },
    width: 20,
  },
  {
    // C
    header: 'PROG CODE',
    key: 'prog',
    width: 10,
  },
  {
    // E
    header: 'COURSE CODE',
    key: 'course-code',
    width: 10,
  },
  {
    // D
    header: 'CAMPUS',
    key: 'campus',
    width: 10,
  },
  {
    // F
    header: 'ACADEMIC YEAR',
    key: 'academic-year',
    width: 10,
  },
  {
    // H
    header: 'SEMESTER',
    key: 'semester',
    width: 10,
  },
  {
    // G
    header: 'STUDY YEAR',
    key: 'study-year',
    width: 10,
  },
  {
    // I
    header: 'C.W MARK',
    key: 'cw',
    width: 10,
  },
  {
    // J
    header: 'EX MARK',
    key: 'ex',
    width: 10,
  },
  {
    // K
    header: 'FINAL MARK',
    key: 'final',
    width: 10,
  },
  {
    // L
    header: 'REMARK',
    key: 'remarks',
    width: 10,
  },
  {
    // M
    header: 'IS FIRST SITTING ?',
    key: 'is_first_sitting',
    width: 10,
  },
  {
    // N
    header: 'RETAKE COUNT',
    key: 'retake_count',
    width: 10,
  },
  {
    header: 'IS AUDITED COURSE?',
    key: 'audited_course',
    width: 10,
  },
  {
    header: 'IS SUBMITTED?',
    key: 'is_submitted',
    width: 10,
  },
  {
    header: 'IS PUBLISHED?',
    key: 'is_published',
    width: 10,
  },
  {
    header: 'IS APPROVED?',
    key: 'is_approved',
    width: 10,
  },
  {
    header: 'UPLOAD DATE?',
    key: 'upload_date',
    width: 10,
  },
];

const finalGraduationListColumns = [
  {
    header: 'REG. NUMBER',
    key: 'registration_number',
    width: 25,
  },
  {
    header: 'NAME',
    key: 'name',
    width: 50,
  },
  {
    header: 'SEX',
    key: 'gender',
    width: 25,
  },
  // {
  //   header: 'PROGRAMME TYPE',
  //   key: 'prog_type',
  //   width: 25,
  // },
  // {
  //   header: 'STUDY LEVEL',
  //   key: 'study_level',
  //   width: 25,
  // },
  {
    header: 'TOTAL CREDIT UNITS',
    key: 'total_credit_units',
    width: 25,
  },

  {
    header: 'CGPA',
    key: 'cgpa',
    width: 25,
  },
  {
    header: 'DEGREE CLASS',
    key: 'degree_class',
    width: 25,
  },
  {
    header: 'ENTRY ACADEMIC YEAR',
    key: 'entry_academic_year',
    width: 25,
  },
  {
    header: 'GRADUATION YEAR',
    key: 'graduation_academic_year',
    width: 25,
  },
];

const bulkGraduationListBillingColumns = [
  {
    header: 'STUDENT NUMBER',
    key: 'student_number',
    width: 25,
  },
  {
    header: 'GRADUATION ACADEMIC YEAR',
    key: 'graduation_academic_year',
    width: 25,
  },
];

module.exports = {
  nodeUploadTemplateColumns,
  bulkUploadTemplateColumns,
  studentAssessmentTemplateColumns,
  nodeIdentityColumns,
  graduationListColumns,
  resultsViewTemplateColumns,
  batchReportColumns,
  finalGraduationListColumns,
  bulkGraduationListBillingColumns,
  dissertationTemplateColumns,
};
