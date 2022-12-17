const collegeTemplateColumns = [
  // A
  {
    header: 'COLLEGE CODE',
    key: 'college_code',
    width: 20,
  },
  // B
  {
    header: 'COLLEGE TITLE',
    key: 'college_title',
    width: 35,
  },
  // C
  {
    header: 'COLLEGE CONTACT',
    key: 'college_contact',
    style: { numFmt: '@' },
    width: 20,
  },
  // D
  {
    header: 'COLLEGE WEBSITE',
    key: 'college_website',
    style: { numFmt: '@' },
    width: 35,
  },
  // E
  {
    header: 'COLLEGE ADDRESS',
    key: 'college_address',
    style: { numFmt: '@' },
    width: 35,
  },
  // F
  {
    header: 'COLLEGE EMAIL',
    key: 'college_email',
    style: { numFmt: '@' },
    width: 30,
  },
  // G
  {
    header: 'DATE ESTABLISHED (MM/DD/YYYY)',
    key: 'date_established',
    width: 35,
    style: { numFmt: '@' },
  },
  // H
  {
    header: 'COLLEGE HEAD',
    key: 'headed_by_id',
    width: 35,
  },
];

const facultyTemplateColumns = [
  // A
  {
    header: 'FACULTY CODE',
    key: 'faculty_code',
    width: 20,
  },
  // B
  {
    header: 'FACULTY TITLE',
    key: 'faculty_title',
    width: 35,
  },
  // C
  {
    header: 'FACULTY CONTACT',
    key: 'faculty_contact',
    style: { numFmt: '@' },
    width: 20,
  },
  // D
  {
    header: 'FACULTY WEBSITE',
    key: 'faculty_website',
    style: { numFmt: '@' },
    width: 35,
  },
  // E
  {
    header: 'FACULTY ADDRESS',
    key: 'faculty_address',
    style: { numFmt: '@' },
    width: 35,
  },
  // F
  {
    header: 'FACULTY EMAIL',
    key: 'faculty_email',
    style: { numFmt: '@' },
    width: 30,
  },
  // G
  {
    header: 'DATE ESTABLISHED (MM/DD/YYYY)',
    key: 'date_established',
    width: 35,
    style: { numFmt: '@' },
  },
  // H
  {
    header: 'FACULTY HEAD',
    key: 'headed_by_id',
    width: 35,
  },
  // I
  {
    header: 'COLLEGE',
    key: 'college_id',
    width: 35,
  },
];

const departmentTemplateColumns = [
  // A
  {
    header: 'DEPARTMENT CODE',
    key: 'department_code',
    width: 20,
  },
  // B
  {
    header: 'DEPARTMENT TITLE',
    key: 'department_title',
    width: 35,
  },
  // C
  {
    header: 'DEPARTMENT CONTACT',
    key: 'department_contact',
    style: { numFmt: '@' },
    width: 20,
  },
  // D
  {
    header: 'DEPARTMENT WEBSITE',
    key: 'department_website',
    style: { numFmt: '@' },
    width: 35,
  },
  // E
  {
    header: 'DEPARTMENT ADDRESS',
    key: 'department_address',
    style: { numFmt: '@' },
    width: 35,
  },
  // F
  {
    header: 'DEPARTMENT EMAIL',
    key: 'department_email',
    style: { numFmt: '@' },
    width: 30,
  },
  // G
  {
    header: 'DATE ESTABLISHED (MM/DD/YYYY)',
    key: 'date_established',
    width: 35,
    style: { numFmt: '@' },
  },
  // H
  {
    header: 'DEPARTMENT HEAD',
    key: 'headed_by_id',
    width: 35,
  },
  // I
  {
    header: 'FACULTY',
    key: 'faculty_id',
    width: 35,
  },
];

module.exports = {
  collegeTemplateColumns,
  facultyTemplateColumns,
  departmentTemplateColumns,
};
