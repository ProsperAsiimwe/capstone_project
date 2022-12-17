const NTCStudentTemplateColumns = [
  // A
  {
    header: 'FULL NAME',
    key: 'fullName',
    width: 20,
  },
  // B
  {
    header: 'REG NO',
    key: 'registration_number',
    width: 35,
  },
  // C
  {
    header: 'SEX',
    key: 'sex',
    style: { numFmt: '@' },
    width: 20,
  },
  // D
  {
    header: 'NATIONALITY',
    key: 'nationality',
    style: { numFmt: '@' },
    width: 35,
  },
  // E
  {
    header: 'PROGRAMME',
    key: 'programme',
    style: { numFmt: '@' },
    width: 35,
  },
  // F
  {
    header: 'PROGRAMME CODE',
    key: 'programmeCode',
    style: { numFmt: '@' },
    width: 35,
  },
  // G
  {
    header: 'FACULTY',
    key: 'FACULTY',
    style: { numFmt: '@' },
    width: 35,
  },
  // H
  {
    header: 'DATE OF BIRTH (MM/DD/YYYY)',
    key: 'DOB',
    style: { numFmt: '@' },
    width: 35,
  },
  // I
  {
    header: 'TYPE OF ENTRY',
    key: 'typeOfEntry',
    style: { numFmt: '@' },
    width: 35,
  },
  // J
  {
    header: 'YEAR OF ENTRY',
    key: 'yearOfEntry',
    style: { numFmt: '@' },
    width: 35,
  },
  // K
  {
    header: 'YEAR OF COMPLETION',
    key: 'yearOfCompletion',
    style: { numFmt: '@' },
    width: 35,
  },
  // L
  {
    header: 'CURRENT STUDY YEAR',
    key: 'programme',
    style: { numFmt: '@' },
    width: 35,
  },
  // M
  {
    header: 'SUBJECTS (COMMA SEPARATED)',
    key: 'college_email',
    style: { numFmt: '@' },
    width: 30,
  },
  // N
  {
    header: 'EMAIL',
    key: 'email',
    width: 35,
    style: { numFmt: '@' },
  },
  // O
  {
    header: 'PHONE',
    key: 'phone',
    width: 35,
  },
];

const NTCResultTemplateColumns = [
  // A
  {
    header: 'REG NO',
    key: 'regNo',
    style: { numFmt: '@' },
    width: 30,
  },
  // B
  {
    header: 'ACADEMIC YEAR',
    key: 'academicYear',
    style: { numFmt: '@' },
    width: 20,
  },
  // C
  {
    header: 'STUDY YEAR',
    key: 'studyYear',
    style: { numFmt: '@' },
    width: 20,
  },
  // D
  {
    header: 'TERM',
    key: 'term',
    style: { numFmt: '@' },
    width: 20,
  },
  // E
  {
    header: 'SUBJECT',
    key: 'subject',
    style: { numFmt: '@' },
    width: 20,
  },
  // F
  {
    header: 'CW MARK',
    key: 'cw',
    style: { numFmt: '@' },
    width: 20,
  },
  // G
  {
    header: 'EX MARK',
    key: 'examMark',
    style: { numFmt: '@' },
    width: 20,
  },
  // H
  {
    header: 'TOTAL MARK',
    key: 'totalMark',
    style: { numFmt: '@' },
    width: 20,
  },
  // I
  {
    header: 'FLAG',
    key: 'flag',
    style: { numFmt: '@' },
    width: 20,
  },
  // J
  {
    header: 'IS FIRST SITTING',
    key: 'firstSitting',
    style: { numFmt: '@' },
    width: 30,
  },
  // K
  {
    header: 'RETAKE COUNT',
    key: 'retakeCount',
    style: { numFmt: '@' },
    width: 20,
  },
  {
    header: 'EXAM DATE (MM/DD/YYYY)',
    key: 'examDate',
    style: { numFmt: '@' },
    width: 20,
  },
];

const NTCSubjectsTemplateColumns = [
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
    header: 'PAPERS (COMMA SEPARATED) eg. (P) 31',
    key: 'papers',
    width: 45,
  },
  // D
  {
    header: 'SUBJECT CATEGORY',
    key: 'subject-category',
    width: 30,
  },
];

module.exports = {
  NTCStudentTemplateColumns,
  NTCResultTemplateColumns,
  NTCSubjectsTemplateColumns,
};
