require('dotenv').config();

// GET environment variables and freeze to prevent value edit
module.exports = Object.freeze({
  MAIL_USERNAME: process.env.MAIL_USERNAME,
  MAIL_PASSWORD: process.env.MAIL_PASSWORD,
  MAIL_FROM: process.env.MAIL_FROM || '',
  MAIL_PORT: process.env.MAIL_PORT || 587,
  MAIL_HOST: process.env.MAIL_HOST || '',
  MAIL_EXPIRY: process.env.MAIL_EXPIRY || '1d',

  // TWILIO ACCOUNT SETTINGS
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
  TWILIO_PHONE: process.env.TWILIO_PHONE,

  // Default value of 10 Mins expiry
  PASSWORD_EXPIRES_IN: process.env.PASSWORD_EXPIRES_IN || 10,
  PASSWORD_SALT_ROUNDS: process.env.PASSWORD_SALT_ROUNDS || 10,

  ADMISSION_DOWNLOAD_LIMIT: process.env.ADMISSION_DOWNLOAD_LIMIT || 1000,

  ASSETS_ROOT_DIRECTORY: process.env.ASSETS_ROOT_DIRECTORY || 'src/assets',
  STAFF_PORTAL_URL: process.env.STAFF_PORTAL_URL || '',
  APP_URL: process.env.APP_URL || '',
  APPLICATION_PORTAL_URL: process.env.APPLICATION_PORTAL_URL || '',
  PAYMENT_PORTAL_URL: process.env.PAYMENT_PORTAL_URL || '',
  STUDENT_PORTAL_URL: process.env.STUDENT_PORTAL_URL || '',
  INSTITUTION_NAME: process.env.INSTITUTION_NAME || 'ACMIS',
  INSTITUTION_SHORT_CODE: process.env.INSTITUTION_SHORT_CODE || 'ACMIS',
  DOCUMENT_VERIFICATION_LINK: process.env.DOCUMENT_VERIFICATION_LINK || '',
  DOCUMENTS_STUDENT_PHOTO_LINK: process.env.DOCUMENTS_STUDENT_PHOTO_LINK || '',

  // DEFAULT SMS GATEWAY
  DEFAULT_SMS_GATEWAY: process.env.DEFAULT_SMS_GATEWAY || 'TWILIO',

  // REGISTRATION NUMBER FORMATS
  DEFAULT_REGISTRATION_NUMBER_FORMAT:
    process.env.DEFAULT_REGISTRATION_NUMBER_FORMAT || 'STANDARD',
  // STUDENT NUMBER FORMATS
  DEFAULT_STUDENT_NUMBER_FORMAT:
    process.env.DEFAULT_STUDENT_NUMBER_FORMAT || 'STANDARD',

  STUDENT_NUMBER_INSTITUTION_CODE:
    process.env.STUDENT_NUMBER_INSTITUTION_CODE || '000',

  INSTITUTION_EMAIL_EXTENSION:
    process.env.INSTITUTION_EMAIL_EXTENSION || '@acmis.ac.ug',

  // Default values of URA Data Integrations
  TAX_HEAD_CODE: process.env.TAX_HEAD_CODE || '',
  BRIDGE_BASE_URL: process.env.BRIDGE_BASE_URL || 'http://localhost:5000',
  URA_PORTAL_BASE_URL:
    process.env.URA_PORTAL_BASE_URL || 'http://uraportal.acmis.ac.ug',
  URA_ONLINE_PAYMENT_REDIRECT: process.env.URA_ONLINE_PAYMENT_REDIRECT,
  PAYMENT_REFERENCE_EXPIRES_IN: process.env.PAYMENT_REFERENCE_EXPIRES_IN || 2,
  BULK_PAYMENT_REFERENCE_EXPIRES_IN:
    process.env.BULK_PAYMENT_REFERENCE_EXPIRES_IN || 7,

  // Default values for SpeedaMobile Web API
  SPEEDA_API_ID: process.env.SPEEDA_API_ID || 'API53139997707',
  SPEEDA_API_PASSWORD: process.env.SPEEDA_API_PASSWORD || 'acmis2021',
  SPEEDA_SENDER_ID: process.env.SPEEDA_SENDER_ID || 'BULKSMS',
  SPEEDA_SMS_TYPE: process.env.SPEEDA_SMS_TYPE || 'T',
  SPEEDA_ENCODING: process.env.SPEEDA_ENCODING || 'T',
  SPEEDA_BRAND: process.env.SPEEDA_BRAND || 'ACMIS',
  SPEEDA_BASE_URL:
    process.env.SPEEDA_BASE_URL || 'http://apidocs.speedamobile.com/api',

  // Default values for ACMIS Email Gateway
  SMTP_HOST: process.env.SMTP_HOST || 'mail.acmis.ac.ug',
  SMTP_PORT: process.env.SMTP_PORT || 465,
  SMTP_USER_NAME: process.env.SMTP_USER_NAME || 'smtp@acmis.ac.ug',
  SMTP_PASSWORD: process.env.SMTP_PASSWORD || 'Mw6a6b_4',
  SMTP_FROM:
    process.env.SMTP_FROM || `ACMIS UNIVERSITY <acmis.university@acmis.ac.ug>`,
  SECRET: process.env.HASH_SECRET,
  ACMIS_TERMS_AND_CONDITIONS_BASE_URL: 'https://staff.testing.aims.ac.ug/',

  SENTRY_DNS: process.env.SENTRY_DNS,
  SENTRY_TRACE_SAMPLE_RATE: process.env.SENTRY_TRACE_SAMPLE_RATE || 1.0,

  WORKSHEET_PASSWORD: process.env.WORKSHEET_PASSWORD || 'ter@dmin',

  UNEB_API_BASE_URL: process.env.UNEB_API_BASE_URL,
  UNEB_API_USERNAME: process.env.UNEB_API_USERNAME,
  UNEB_API_PASSWORD: process.env.UNEB_API_PASSWORD,

  // EMIS_BASE_URL

  EMIS_BASE_URL: process.env.EMIS_BASE_URL,
  EMIS_NUMBER: process.env.EMIS_NUMBER,

  // Student Avatar Folder
  STUDENTS_PHOTO_DIRECTORY: process.env.STUDENTS_PHOTO_DIRECTORY || '',
  // Applicant Forms Folder
  APPLICANT_FORMS_DIRECTORY: process.env.APPLICANT_FORMS_DIRECTORY || '',
});
