const migratedApplicantsColumns = [
  // A
  {
    header: 'SALUTATION',
    key: 'salutation_id',
    width: 20,
  },
  // B
  {
    header: 'SURNAME',
    key: 'surname',
    width: 30,
  },
  // C
  {
    header: 'OTHER NAMES',
    key: 'other_names',
    width: 30,
  },
  // D
  {
    header: 'PHONE NUMBER (256...)',
    key: 'phone',
    width: 30,
    style: { numFmt: '@' },
  },
  // E
  {
    header: 'EMAIL',
    key: 'email',
    width: 30,
    style: { numFmt: '@' },
  },
  // F
  {
    header: 'DATE OF BIRTH (MM/DD/YYYY)',
    key: 'date_of_birth',
    width: 30,
    style: { numFmt: '@' },
  },
  // G
  {
    header: 'DISTRICT OF ORIGIN',
    key: 'district_of_origin',
    width: 25,
    style: { numFmt: '@' },
  },
  // H
  {
    header: 'GENDER',
    key: 'gender',
    width: 20,
  },
  // I
  {
    header: 'RELIGION',
    key: 'religion',
    width: 20,
  },
  // J
  {
    header: 'MARITAL STATUS',
    key: 'marital_status',
    width: 20,
  },
  // K
  {
    header: 'NATIONALITY',
    key: 'nationality',
    width: 20,
  },
  // L
  {
    header: 'NATIONAL ID NUMBER',
    key: 'national_id_number',
    width: 30,
    style: { numFmt: '@' },
  },
  // M
  {
    header: 'PASSPORT ID NUMBER',
    key: 'passport_id_number',
    width: 30,
    style: { numFmt: '@' },
  },
  // N
  {
    header: 'EMIS NUMBER',
    key: 'emis_id_number',
    width: 30,
    style: { numFmt: '@' },
  },
  // O
  {
    header: 'PLACE OF RESIDENCE',
    key: 'place_of_residence',
    width: 30,
  },
  // P
  {
    header: 'DISTRICT OF BIRTH',
    key: 'district_of_birth',
    width: 30,
  },
  // Q
  {
    header: 'DISABILITY DETAILS',
    key: 'disability_details',
    width: 30,
  },
  // R
  {
    header: 'PROGRAMME CHOICE CODES (comma separated)',
    key: 'programme_choices',
    width: 45,
  },
  // S
  {
    header: 'CHOICE ORDER (comma separated)',
    key: 'choice_order',
    width: 45,
  },
  // T
  {
    header: 'CHOICE ALIAS CODES (comma separated)',
    key: 'programme_aliases',
    width: 45,
  },
  // U
  {
    header: 'CHOICE STUDY TYPES (comma separated)',
    key: 'programme_types',
    width: 45,
  },
  // V
  {
    header: 'CHOICE ENTRY STUDY YEARS (comma separated)',
    key: 'programme_entry_study_years',
    width: 45,
  },
  // W
  {
    header: 'CHOICE CAMPUSES (comma separated)',
    key: 'programme_campuses',
    width: 45,
  },
  // X
  {
    header: 'INTAKE',
    key: 'intake',
    width: 30,
  },
  // Y
  {
    header: 'ENTRY ACADEMIC YEAR',
    key: 'entry_academic_year',
    width: 30,
  },
  // Z
  {
    header: 'SPONSORSHIP',
    key: 'sponsorship_id',
    width: 30,
  },
  // AA
  {
    header: 'ADMISSION SCHEME',
    key: 'admission_scheme_id',
    width: 30,
  },
  // AB
  {
    header: 'DEGREE CATEGORY',
    key: 'degree_category_id',
    width: 30,
  },
  // AC
  {
    header: 'MIGRATED PRN',
    key: 'migrated_prn',
    width: 30,
    style: { numFmt: '@' },
  },
  // AD
  {
    header: 'APPLICATION FEE',
    key: 'application_fee',
    width: 30,
    style: { numFmt: '@' },
  },
  // AE
  {
    header: 'AMOUNT PAID',
    key: 'amount_paid',
    width: 30,
    style: { numFmt: '@' },
  },
  // AF
  {
    header: 'FEE PAYMENT BANK',
    key: 'fee_payment_bank',
    width: 30,
  },
  // AG
  {
    header: 'FEE PAYMENT BANK BRANCH',
    key: 'fee_payment_branch',
    width: 30,
  },
  // AH
  {
    header: 'SAT O-LEVEL?',
    key: 'sat_o_level_exams',
    width: 30,
  },
  // AI
  {
    header: 'O-LEVEL INDEX NUMBER',
    key: 'o_level_index_number',
    style: { numFmt: '@' },
    width: 30,
  },
  // AJ
  {
    header: 'O-LEVEL YEAR',
    key: 'o_level_year_of_sitting',
    width: 30,
    style: { numFmt: '@' },
  },
  // AK
  {
    header: 'O-LEVEL SCHOOL',
    key: 'o_level_school',
    style: { numFmt: '@' },
    width: 30,
  },
  // AL
  {
    header: 'SAT A-LEVEL?',
    key: 'sat_a_level_exams',
    width: 30,
  },
  // AM
  {
    header: 'A-LEVEL INDEX NUMBER',
    key: 'a_level_index_number',
    style: { numFmt: '@' },
    width: 30,
  },
  // AN
  {
    header: 'A-LEVEL YEAR',
    key: 'a_level_year_of_sitting',
    width: 30,
    style: { numFmt: '@' },
  },
  // AO
  {
    header: 'A-LEVEL SCHOOL',
    key: 'a_level_school',
    style: { numFmt: '@' },
    width: 30,
  },
  // AP
  {
    header: 'MIGRATED FORM ID',
    key: 'migrated_form_id',
    style: { numFmt: '@' },
    width: 30,
  },
  // AQ
  {
    header: 'APPLICANT EMPLOYERS (comma separated)',
    key: 'employer',
    width: 45,
  },
  // AR
  {
    header: 'EMPLOYMENT POSTS HELD (comma separated)',
    key: 'post_held',
    width: 45,
  },
  // AS
  {
    header: 'EMPLOYMENT START DATES (comma separated MM/DD/YYYY)',
    key: 'employment_start_date',
    width: 50,
  },
  // AT
  {
    header: 'EMPLOYMENT END DATES (comma separated MM/DD/YYYY)',
    key: 'employment_end_date',
    width: 50,
  },
  // AU
  {
    header: 'APPLICANT REFEREE NAMES (comma separated)',
    key: 'referee_name',
    width: 45,
  },
  // AV
  {
    header: 'REFEREE EMAILS (comma separated)',
    key: 'referee_email',
    width: 45,
  },
  // AW
  {
    header: 'REFEREE PHONES (comma separated)',
    key: 'referee_phone',
    width: 45,
  },
  // AX
  {
    header: 'REFEREE ADDRESSES (comma separated)',
    key: 'referee_address',
    width: 45,
  },
  // AY
  {
    header: 'APPLICANT OTHER QUALIFICATIONS (comma separated)',
    key: 'award_obtained',
    width: 45,
  },
  // AZ
  {
    header: 'AWARDING INSTITUTIONS (comma separated)',
    key: 'institution_name',
    width: 45,
  },
  // BA
  {
    header: 'AWARDING BODIES (comma separated)',
    key: 'awarding_body',
    width: 45,
  },
  // BB
  {
    header: 'AWARD TYPES (comma separated)',
    key: 'award_type',
    width: 45,
  },
  // BC
  {
    header: 'AWARD DURATIONS (comma separated)',
    key: 'award_duration',
    width: 45,
  },
  // BD
  {
    header: 'AWARD START DATES (comma separated MM/DD/YYYY)',
    key: 'award_start_date',
    style: { numFmt: '@' },
    width: 50,
  },
  // BE
  {
    header: 'AWARD END DATES (comma separated MM/DD/YYYY)',
    key: 'award_end_date',
    style: { numFmt: '@' },
    width: 50,
  },
  // BF
  {
    header: 'AWARD CLASSIFICATIONS (comma separated)',
    key: 'award_classification',
    style: { numFmt: '@' },
    width: 45,
  },
  // BG
  {
    header: 'GRADES OBTAINED (comma separated)',
    key: 'grade_obtained',
    style: { numFmt: '@' },
    width: 45,
  },
];

const admitApplicantsColumns = [
  // A
  {
    header: 'SURNAME',
    key: 'surname',
    width: 30,
  },
  // B
  {
    header: 'OTHER NAMES',
    key: 'other_names',
    width: 30,
  },
  // C
  {
    header: 'GENDER',
    key: 'gender',
    width: 20,
  },
  // D
  {
    header: 'FORM ID (ACMIS APPLICANTS ONLY)',
    key: 'form_id',
    style: { numFmt: '@' },
    width: 35,
  },
  // E
  {
    header: 'PROGRAMME CODE',
    key: 'programme',
    style: { numFmt: '@' },
    width: 30,
  },
  // F
  {
    header: 'SUBJECT COMBINATION CODE',
    key: 'subject_combination',
    style: { numFmt: '@' },
    width: 30,
  },
  // G
  {
    header: 'PROGRAMME TYPE/STUDY TIME',
    key: 'programme_types',
    width: 30,
  },
  // H
  {
    header: 'ENTRY STUDY YEAR',
    key: 'programme_entry_study_years',
    width: 30,
  },
  // I
  {
    header: 'CAMPUS',
    key: 'campus',
    width: 30,
  },
  // J
  {
    header: 'SPONSORSHIP',
    key: 'sponsorship_id',
    width: 30,
  },
  // K
  {
    header: 'ACADEMIC YEAR',
    key: 'entry_academic_year',
    width: 30,
  },
  // L
  {
    header: 'INTAKE',
    key: 'intake',
    width: 30,
  },
  // M
  {
    header: 'DEGREE CATEGORY',
    key: 'degree_category',
    width: 30,
  },
  // N
  {
    header: 'ADMISSION SCHEME',
    key: 'admission_scheme',
    width: 30,
  },
  // O
  {
    header: 'NATIONALITY',
    key: 'nationality',
    width: 30,
  },
  // P
  {
    header: 'A-LEVEL INDEX',
    key: 'a_level_index',
    style: { numFmt: '@' },
    width: 30,
  },
  // Q
  {
    header: 'A-LEVEL YEAR',
    key: 'a_level_year',
    style: { numFmt: '@' },
    width: 30,
  },
  // R
  {
    header: 'FEES WAIVER',
    key: 'fees_waiver',
    width: 30,
  },
  // S
  {
    header: 'BILLING CATEGORY',
    key: 'billing_category',
    width: 30,
  },
  // T
  {
    header: 'IS ADMINISTRATIVELY ADMITTED ?',
    key: 'is_administratively',
    width: 35,
  },
  // U
  {
    header: 'PROGRAMME ALIAS CODE',
    key: 'alias_code',
    width: 25,
  },
  // V
  {
    header: 'RESIDENCE STATUS',
    key: 'residence_status',
    width: 25,
  },
  // W
  {
    header: 'HALL OF ATTACHMENT',
    key: 'hall_of_attachment',
    width: 25,
  },
  // X
  {
    header: 'HALL OF RESIDENCE',
    key: 'hall_of_residence',
    width: 25,
  },
  // Y
  {
    header: 'SPONSOR',
    key: 'sponsor',
    width: 25,
  },
  // Z
  {
    header: 'PHONE',
    key: 'phone',
    width: 25,
    style: { numFmt: '@' },
  },
  // AA
  {
    header: 'EMAIL',
    key: 'email',
    width: 25,
    style: { numFmt: '@' },
  },
  // AB
  {
    header: 'DATE OF BIRTH (MM/DD/YYYY)',
    key: 'DOB',
    width: 35,
    style: { numFmt: '@' },
  },
  // AC
  {
    header: 'DISTRICT OF ORIGIN',
    key: 'doo',
    width: 25,
    style: { numFmt: '@' },
  },
  // AD
  {
    header: 'MODE OF ENTRY',
    key: 'modeOfEntry',
    width: 25,
  },
];

const selectedApplicantColumns = [
  // A
  {
    header: 'SURNAME',
    key: 'surname',
    width: 30,
  },
  // B
  {
    header: 'OTHER NAMES',
    key: 'other_names',
    width: 30,
  },
  // C
  {
    header: 'GENDER',
    key: 'gender',
    width: 20,
  },
  // D
  {
    header: 'FORM ID (ACMIS APPLICANTS ONLY)',
    key: 'form_id',
    style: { numFmt: '@' },
    width: 35,
  },
  // E
  {
    header: 'PROGRAMME CODE',
    key: 'programme',
    style: { numFmt: '@' },
    width: 20,
  },
  // F
  {
    header: 'PROGRAMME TITLE',
    key: 'programme_title',
    style: { numFmt: '@' },
    width: 40,
  },
  // G
  {
    header: 'SUBJECT COMBINATION CODE',
    key: 'subject_combination',
    style: { numFmt: '@' },
    width: 30,
  },
  // H
  {
    header: 'PROGRAMME TYPE',
    key: 'programme_types',
    width: 30,
  },
  // I
  {
    header: 'ENTRY STUDY YEAR',
    key: 'programme_entry_study_years',
    width: 30,
  },
  // J
  {
    header: 'CAMPUS',
    key: 'campus',
    width: 30,
  },
  // K
  {
    header: 'SPONSORSHIP',
    key: 'sponsorship_id',
    width: 30,
  },
  // L
  {
    header: 'ACADEMIC YEAR',
    key: 'entry_academic_year',
    width: 30,
  },
  // M
  {
    header: 'INTAKE',
    key: 'intake',
    width: 30,
  },
  // N
  {
    header: 'DEGREE CATEGORY',
    key: 'degree_category',
    width: 30,
  },
  // O
  {
    header: 'ADMISSION SCHEME',
    key: 'admission_scheme',
    width: 30,
  },
  // P
  {
    header: 'NATIONALITY',
    key: 'nationality',
    width: 30,
  },
  // Q
  {
    header: 'A-LEVEL INDEX',
    key: 'a_level_index',
    style: { numFmt: '@' },
    width: 30,
  },
  // R
  {
    header: 'A-LEVEL YEAR',
    key: 'a_level_year',
    style: { numFmt: '@' },
    width: 30,
  },
  // S
  {
    header: 'FEES WAIVER',
    key: 'fees_waiver',
    width: 30,
  },
  // T
  {
    header: 'BILLING CATEGORY',
    key: 'billing_category',
    width: 30,
  },
  // U
  {
    header: 'IS ADMINISTRATIVELY ADMITTED ?',
    key: 'is_administratively',
    width: 35,
  },
  // V
  {
    header: 'PROGRAMME ALIAS CODE',
    key: 'alias_code',
    width: 25,
  },
  // W
  {
    header: 'WEIGHT',
    key: 'weight',
    style: { numFmt: '@' },
    width: 25,
  },
  // X
  {
    header: 'CHOICE',
    key: 'choice',
    style: { numFmt: '@' },
    width: 25,
  },
];

const manageRunningAdmissionsColumns = [
  {
    // A
    header: 'PROGRAMME',
    key: 'programme',
    width: 45,
  },
  {
    // B
    header: 'CAMPUS',
    key: 'campus',
    width: 30,
  },
  {
    // C
    header: 'PROGRAMME TYPE',
    key: 'programme-type',
    width: 30,
  },
  {
    // D
    header: 'CAPACITY',
    key: 'capacity',
    width: 25,
  },
  {
    // E
    header: 'ENTRY YEARS',
    key: 'entry-years',
    width: 40,
  },
  {
    // F
    header: 'SPONSORSHIPS',
    key: 'sponsorships',
    width: 25,
  },
  {
    // G
    header: 'SPECIAL REMARKS/REQUIREMENTS',
    key: 'remarks',
    width: 50,
    style: { numFmt: '@' },
  },
];

const manageApplicantsColumns = [
  {
    // A
    header: 'FORM ID',
    key: 'form_id',
    width: 30,
    style: { numFmt: '@' },
  },
  {
    // B
    header: 'NAME',
    key: 'name',
    width: 45,
  },
  {
    // C
    header: 'EMAIL',
    key: 'email',
    width: 30,
  },
  {
    // D
    header: 'PHONE NUMBER',
    key: 'phone_number',
    width: 30,
  },
  {
    // E
    header: 'GENDER',
    key: 'gender',
    width: 25,
  },
  {
    // F
    header: 'SPONSORSHIP',
    key: 'sponsorship',
    width: 25,
  },
  {
    // G
    header: 'CHOICE NUMBER',
    key: 'choice_number',
    width: 25,
  },
  {
    // H
    header: 'ENTRY YEAR',
    key: 'entry_year',
    width: 25,
  },
  {
    // I
    header: 'APPLICATION STATUS',
    key: 'application_status',
    width: 25,
  },
  {
    // J
    header: 'APPLICATION SUBMISSION DATE',
    key: 'application_submission_date',
    width: 35,
  },
  {
    // K
    header: 'AMOUNT BILLED',
    key: 'amount_billed',
    width: 30,
  },
  {
    // L
    header: 'PAYMENT STATUS',
    key: 'payment_status',
    width: 30,
  },
  {
    // M
    header: 'REFERENCE NUMBER',
    key: 'reference_number',
    width: 30,
  },
  {
    //
    header: 'O-LEVEL INFORMATION',
    key: 'o_level_information',
    width: 50,
  },
  {
    //
    header: 'A-LEVEL INFORMATION',
    key: 'a_level_information',
    width: 50,
  },
  {
    // N
    header: 'OTHER QUALIFICATIONS',
    key: 'other_qualifications',
    width: 50,
  },
  {
    // O
    header: 'DIPLOMA QUALIFICATIONS',
    key: 'diploma_qualifications',
    width: 50,
  },
  {
    // P
    header: 'RELEVANT QUALIFICATIONS',
    key: 'relevant_qualifications',
    width: 50,
  },
  {
    // Q
    header: 'CERTIFICATE QUALIFICATIONS',
    key: 'certificate_qualifications',
    width: 50,
  },
  {
    // R
    header: 'BACHELORS QUALIFICATIONS',
    key: 'bachelors_qualifications',
    width: 50,
  },
  {
    // S
    header: 'MASTERS QUALIFICATIONS',
    key: 'masters_qualifications',
    width: 50,
  },
];

const getUNEBReportColumns = (choiceColumns) => [
  {
    header: 'FORM ID',
    key: 'form_id',
    width: 30,
  },
  {
    header: 'NAME',
    key: 'name',
    width: 35,
  },
  {
    header: 'GENDER',
    key: 'gender',
    width: 20,
  },
  {
    header: 'COUNTRY',
    key: 'country',
    width: 15,
  },
  {
    header: 'NATIONALITY',
    key: 'nationality',
    width: 20,
  },
  {
    header: 'DISTRICT OF ORIGIN',
    key: 'district_of-origin',
    width: 30,
  },
  {
    header: 'DISTRICT OF BIRTH',
    key: 'district_of_birth',
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
    header: 'PAYMENT STATUS',
    key: 'payment_status',
    width: 20,
  },
  ...choiceColumns,
  {
    header: 'O-LEVEL INDEX',
    key: 'o_level_index',
    width: 20,
  },
  {
    header: 'O-LEVEL YEAR',
    key: 'o_level_year',
    width: 20,
  },
  {
    header: 'O-LEVEL DISTINCTIONS',
    key: 'o_level_distinctions',
    width: 20,
  },
  {
    header: 'O-LEVEL CREDITS',
    key: 'o_level_credits',
    width: 20,
  },
  {
    header: 'O-LEVEL PASSES',
    key: 'o_level_passes',
    width: 20,
  },
  {
    header: 'O-LEVEL SCHOOL',
    key: 'o_level_school',
    width: 35,
  },
  {
    header: 'O-LEVEL RESULT',
    key: 'o_level_school',
    width: 40,
  },
  {
    header: 'A-LEVEL INDEX',
    key: 'a_level_index',
    width: 20,
  },
  {
    header: 'A-LEVEL YEAR',
    key: 'a_level_year',
    width: 20,
  },
  {
    header: 'A-LEVEL SCHOOL',
    key: 'a_level_school',
    width: 35,
  },
  {
    header: 'A-LEVEL RESULT',
    key: 'a_level_results',
    width: 60,
  },
  {
    header: 'DATE OF BIRTH',
    key: 'date_of_birth',
    width: 60,
  },
  {
    header: 'OTHER QUALIFICATIONS',
    key: 'other_qualifications',
    width: 150,
  },
];

const getKYUDiplomaReportColumns = (choiceColumns) => [
  {
    header: 'FORM ID',
    key: 'form_id',
    width: 30,
  },
  {
    header: 'NAME',
    key: 'name',
    width: 35,
  },
  {
    header: 'GENDER',
    key: 'gender',
    width: 20,
  },
  ...choiceColumns,
  {
    header: 'NATIONALITY',
    key: 'nationality',
    width: 20,
  },
  {
    header: 'PAYMENT STATUS',
    key: 'payment_status',
    width: 20,
  },
  {
    header: 'UCE GRADES / EQUIVALENT',
    key: 'uce_grades',
    width: 40,
  },
  {
    header: 'YEAR OF COMP',
    key: 'district_of_birth',
    width: 20,
  },
  {
    header: 'UACE GRADES / EQUIVALENT',
    key: 'uace_grades',
    width: 40,
  },
  {
    header: 'YEAR OF COMP',
    key: 'district_of_birth',
    width: 20,
  },
  {
    header: 'DIPLOMA/ CERTIFICATE ATTAINED',
    key: 'o_level_index',
    width: 20,
  },
  {
    header: 'INSTITUTE/ AWARDING BODY',
    key: 'o_level_year',
    width: 20,
  },
  {
    header: 'DIPLOMA GRADES',
    key: 'o_level_distinctions',
    width: 20,
  },
  {
    header: 'CGPA',
    key: 'o_level_credits',
    width: 20,
  },
  {
    header: 'AVERAGE OF GRADE',
    key: 'o_level_passes',
    width: 20,
  },
  {
    header: 'CLASSIFICATION',
    key: 'o_level_school',
    width: 35,
  },
];

const getMUBSUNEBReportColumns = (choiceColumns) => [
  {
    header: 'FORM ID',
    key: 'form_id',
    width: 30,
  },
  {
    header: 'NAME',
    key: 'name',
    width: 35,
  },
  {
    header: 'GENDER',
    key: 'gender',
    width: 20,
  },
  {
    header: 'COUNTRY',
    key: 'country',
    width: 15,
  },
  {
    header: 'NATIONALITY',
    key: 'nationality',
    width: 30,
  },
  {
    header: 'DISTRICT OF ORIGIN',
    key: 'district_of-origin',
    width: 30,
  },
  {
    header: 'DISTRICT OF BIRTH',
    key: 'district_of_birth',
    width: 30,
  },
  {
    header: 'PAYMENT STATUS',
    key: 'payment_status',
    width: 20,
  },
  ...choiceColumns,
  {
    header: 'O-LEVEL INDEX',
    key: 'o_level_index',
    width: 20,
  },
  {
    header: 'O-LEVEL YEAR',
    key: 'o_level_year',
    width: 20,
  },
  {
    header: 'A-LEVEL INDEX',
    key: 'a_level_index',
    width: 20,
  },
  {
    header: 'A-LEVEL YEAR',
    key: 'a_level_year',
    width: 20,
  },
  {
    header: 'UCE RESULTS',
    key: 'uce_levels',
    width: 20,
  },
  {
    header: 'UACE RESULTS',
    key: 'uace_levels',
    width: 50,
  },
];

const weightedApplicantColumns = [
  {
    // A
    header: 'FORM ID',
    key: 'form_id',
    width: 30,
    style: { numFmt: '@' },
  },
  {
    // B
    header: 'SURNAME',
    key: 'surname',
    width: 30,
  },
  {
    // C
    header: 'OTHER NAMES',
    key: 'other_names',
    width: 30,
  },
  {
    // E
    header: 'EMAIL',
    key: 'email',
    width: 30,
  },
  {
    // F
    header: 'PHONE NUMBER',
    key: 'phone_number',
    width: 20,
  },
  {
    // G
    header: 'GENDER',
    key: 'gender',
    width: 20,
  },
  {
    //
    header: 'PROGRAMME',
    key: 'programme',
    width: 20,
  },
  {
    //
    header: 'ALIAS',
    key: 'alias',
    width: 20,
  },
  {
    //
    header: 'CAMPUS',
    key: 'campus',
    width: 20,
  },
  {
    //
    header: 'PROGRAMME TYPE',
    key: 'programme_type',
    width: 20,
  },
  {
    // H
    header: 'WEIGHT',
    key: 'weight',
    width: 20,
  },
  {
    // I
    header: 'CHOICE NUMBER',
    key: 'choice_number',
    width: 20,
  },
  {
    header: 'APPLICATION PAYMENT STATUS',
    key: 'payment_status',
    width: 30,
  },
  {
    header: 'APPLICATION AMOUNT',
    key: 'amount',
    width: 30,
  },
  {
    header: 'GENERATED PRN',
    key: 'ura_prn',
    width: 30,
  },
  {
    // J
    header: 'OTHER PROGRAMME CHOICE CODES',
    key: 'other_choices',
    width: 45,
  },
  {
    // K
    header: 'OTHER PROGRAMME CHOICE ALIASES',
    key: 'other_choice_aliases',
    width: 45,
  },
  {
    // L
    header: 'OTHER PROGRAMME CHOICE NUMBERS',
    key: 'other_choice_numbers',
    width: 45,
  },
  {
    // M
    header: 'OTHER PROGRAMME CHOICE CAMPUSES',
    key: 'other_choice_campuses',
    width: 45,
  },
  {
    // N
    header: 'OTHER PROGRAMME CHOICE TYPES',
    key: 'other_choice_types',
    width: 45,
  },
  {
    // O
    header: 'OTHER PROGRAMME CHOICE ENTRY YEARS',
    key: 'other_choice_entry_years',
    width: 45,
  },
  {
    // P
    header: 'OTHER PROGRAMME CHOICE WEIGHTS',
    key: 'other_choice_weights',
    width: 45,
  },
  {
    // Q
    header: 'REASON',
    key: 'reason',
    width: 55,
  },
];

// applicant subject combination

const applicantSubjectCombination = [
  {
    // A
    header: 'FORM ID',
    key: 'form_id',
    width: 50,
    style: { numFmt: '@' },
  },
  {
    // B
    header: 'SURNAME',
    key: 'surname',
    width: 30,
  },
  {
    // C
    header: 'OTHER NAMES',
    key: 'other_names',
    width: 30,
  },
  {
    // E
    header: 'EMAIL',
    key: 'email',
    width: 50,
  },
  {
    // E
    header: 'PHONE',
    key: 'phone',
    width: 30,
  },
  {
    // E
    header: 'GENDER',
    key: 'gender',
    width: 30,
  },
  {
    // E
    header: 'PROGRAMME CODE',
    key: 'programme_code',
    width: 30,
  },
  {
    // E
    header: 'ALIAS CODE',
    key: 'alias_code',
    width: 30,
  },
  {
    // E
    header: 'CHOICE NUMBER NAME',
    key: 'choice_number_name',
    width: 30,
  },
  {
    // E
    header: 'CHOICE NUMBER',
    key: 'choice_number',
    width: 30,
  },
  {
    // E
    header: 'SUBJECT COMBINATION CODE',
    key: 'subject_combination_code',
    width: 30,
  },
  {
    // E
    header: 'SUBJECT COMBINATION TITLE',
    key: 'subject_combination_title',
    width: 30,
  },
  {
    // E
    header: 'COMBINATION SUBJECTS',
    key: 'subjects',
    width: 50,
  },
  {
    // E
    header: 'COMBINATION SUBJECTS CODES',
    key: 'subjects',
    width: 50,
  },
];

// admittedApplicantsDownload

const admittedApplicantsColumns = [
  {
    // A
    header: 'NAME',
    key: 'full_name',
    width: 40,
    style: { numFmt: '@' },
  },
  {
    // B
    header: 'GENDER',
    key: 'gender',
    width: 15,
  },
  {
    // C
    header: 'NATIONALITY',
    key: 'nationality',
    width: 30,
  },
  {
    // D
    header: 'STUDENT NUMBER',
    key: 'student_number',
    width: 30,
  },
  {
    // D
    header: 'REGISTRATION NUMBER',
    key: 'registration_number',
    width: 30,
  },
  {
    // D
    header: 'PROGRAMME CODE',
    key: 'programme_code',
    width: 15,
  },
  {
    // D
    header: 'ALIAS CODE',
    key: 'alias_code',
    width: 15,
  },
  {
    // D
    header: 'CAMPUS',
    key: 'campus',
    width: 30,
  },
  {
    // D
    header: 'PROGRAMME TYPE',
    key: 'programme_type',
    width: 30,
  },
  {
    // D
    header: 'SPONSORSHIP',
    key: 'sponsorship',
    width: 30,
  },
  {
    // D
    header: 'HALL OF ATTACHMENT',
    key: 'hall_of_attachment',
    width: 60,
  },
  {
    // D
    header: 'YEAR OF ENTRY',
    key: 'year_of_entry',
    width: 30,
  },
  {
    // D
    header: 'DISTRICT',
    key: 'district_of_origin',
    width: 60,
  },
  {
    // D
    header: 'SUBJECTS',
    key: 'subjects',
    width: 100,
  },
  {
    // D
    header: 'EMAIL',
    key: 'email',
    width: 100,
  },
  {
    // D
    header: 'PHONE',
    key: 'phone',
    width: 50,
  },
];

// admittedApplicantsDownload

const graduateApplicantsColumns = [
  {
    header: 'FORM ID',
    key: 'form_id',
    width: 30,
    style: { numFmt: '@' },
  },
  {
    header: 'SURNAME',
    key: 'surname',
    width: 40,
    style: { numFmt: '@' },
  },
  {
    header: 'OTHER NAMES',
    key: 'other_names',
    width: 40,
    style: { numFmt: '@' },
  },
  {
    // B
    header: 'GENDER',
    key: 'gender',
    width: 10,
  },
  {
    header: 'NATIONALITY',
    key: 'nationality',
    width: 30,
  },
  {
    header: 'PAYMENT STATUS',
    key: 'payment_status',
    width: 30,
  },
  {
    header: 'FIRST DEGREE',
    key: 'award_obtained',
    width: 60,
  },
  {
    header: 'CLASS OF AWARD',
    key: 'award_classification',
    width: 30,
  },
  {
    header: 'GRADE',
    key: 'grade_obtained',
    width: 15,
  },
  {
    header: 'INSTITUTION',
    key: 'institution_name',
    width: 60,
  },

  {
    header: 'END YEAR',
    key: 'award_end_year',
    width: 15,
  },
  {
    header: 'OTHER QUALIFICATIONS',
    key: 'other_qualifications',
    width: 200,
  },
];

const getKYUDiplomaColumns = (choiceColumns) => [
  {
    header: 'FORM ID',
    key: 'form_id',
    width: 30,
  },
  {
    header: 'NAME',
    key: 'name',
    width: 40,
  },
  {
    header: 'GENDER',
    key: 'gender',
    width: 20,
  },
  {
    header: 'PROGRAMME CODE',
    key: 'programme_code',
    width: 30,
  },
  {
    header: 'ALIAS CODE',
    key: 'alias_code',
    width: 30,
  },
  {
    header: 'CAMPUS',
    key: 'campus',
    width: 30,
  },
  {
    header: 'PROGRAMME TYPE',
    key: 'programme_type',
    width: 30,
  },
  {
    header: 'ENTRY STUDY YEAR',
    key: 'entry_study_year',
    width: 30,
  },
  {
    header: 'CHOICE NAME',
    key: 'choice_number_name',
    width: 30,
  },
  {
    header: 'COUNTRY',
    key: 'country',
    width: 20,
  },
  {
    header: 'NATIONALITY',
    key: 'nationality',
    width: 20,
  },
  {
    header: 'DISTRICT OF ORIGIN',
    key: 'district_of_origin',
    width: 20,
  },
  {
    header: 'DISTRICT OF BIRTH',
    key: 'district_of_birth',
    width: 20,
  },
  {
    header: 'EMAIL',
    key: 'email',
    width: 40,
  },
  {
    header: 'PHONE',
    key: 'phone',
    width: 30,
  },
  {
    header: 'PAYMENT STATUS',
    key: 'payment_status',
    width: 20,
  },
  {
    header: 'O LEVEL INDEX',
    key: 'olevel_index',
    width: 30,
  },
  {
    header: 'O LEVEL YEAR',
    key: 'olevel_year:',
    width: 30,
  },
  {
    header: 'DISTINCTIONS',
    key: 'distinctions',
    width: 20,
  },
  {
    header: 'CREDITS',
    key: 'credits',
    width: 20,
  },
  {
    header: 'PASSES',
    key: 'passes',
    width: 20,
  },
  {
    header: 'O LEVEL SCHOOL',
    key: 'olevel_school',
    width: 60,
  },
  {
    header: 'O LEVEL RESULTS',
    key: 'o_level_subjects',
    width: 100,
  },
  {
    header: 'A LEVEL INDEX',
    key: 'alevel_index',
    width: 20,
  },
  {
    header: 'A LEVEL YEAR',
    key: 'alevel_year',
    width: 20,
  },
  {
    header: 'A LEVEL SCHOOL',
    key: 'alevel_school',
    width: 100,
  },
  {
    header: 'UACE GRADES / EQUIVALENT',
    key: 'results',
    width: 100,
  },
  {
    header: 'DATE OF BIRTH',
    key: 'date_of_birth',
    width: 40,
  },
  {
    // O
    header: 'DIPLOMA QUALIFICATIONS',
    key: 'diploma_qualifications',
    width: 100,
  },
  {
    header: 'OTHER QUALIFICATIONS',
    key: 'other_qualifications',
    width: 150,
  },
  ...choiceColumns,
];

module.exports = {
  manageRunningAdmissionsColumns,
  manageApplicantsColumns,
  getUNEBReportColumns,
  getMUBSUNEBReportColumns,
  migratedApplicantsColumns,
  admitApplicantsColumns,
  selectedApplicantColumns,
  weightedApplicantColumns,
  applicantSubjectCombination,
  admittedApplicantsColumns,
  getKYUDiplomaReportColumns,
  graduateApplicantsColumns,
  getKYUDiplomaColumns,
};
