const model = require('@models');
const { toUpper, trim, isEmpty, sumBy, find } = require('lodash');
const moment = require('moment');
const {
  paymentReferenceService,
  bulkPaymentService,
  runningAdmissionApplicantService,
  universalInvoiceService,
  paymentTransactionService,
  systemPRNTrackerService,
  studentService,
  invoiceService,
  sponsorService,
  metadataValueService,
  changeOfProgrammeService,
  graduationFeesService,
  graduationListService,
  pujabApplicantPaymentService,
  pujabApplicationService,
} = require('@services/index');
const PaymentEvent = require('@events/PaymentEvent');
const { appConfig } = require('@root/config');
const { generatePRN } = require('@helpers');
const envConfig = require('../../../config/app');
const { getMetadataValueId } = require('@controllers/Helpers/programmeHelper');

const paymentStatuses = [
  {
    code: 'C',
    description: 'CANCELLED',
  },
  {
    code: 'X',
    description: 'EXPIRED',
  },
  {
    code: 'A',
    description: 'AVAILABLE - This PRN has not been paid against',
  },
  {
    code: 'R',
    description: 'RECEIVED BUT NOT CREDITED - The Cheque is not yet matured',
  },
  {
    code: 'D',
    description: 'RECEIVED BUT DISHONORED - Cheque is Dishonored',
  },
  {
    code: 'T',
    description: 'RECEIVED AND CREDITED - Payment is Reconciled with the Bank',
  },
];

const generateSystemReference = (prefix = null) => {
  const random = Math.floor(Math.random() * moment().unix());
  const institutionCode = appConfig.INSTITUTION_SHORT_CODE;

  return `${institutionCode}-${
    prefix ? `${prefix}-` : ''
  }${moment().unix()}${random}`;
};

const findPaymentStatus = (status) =>
  find(
    paymentStatuses,
    (paymentStatus) => toUpper(trim(status)) === toUpper(paymentStatus.code)
  );

const deletePRNFromTracker = async (findPRN, transaction) => {
  await systemPRNTrackerService.deleteSystemPRNTracker(findPRN.id, transaction);
};

/**
 * UPDATE Payment Reference Tables and Transactions
 *
 * @param {*} data
 * @returns json
 */
const updatePRNTransaction = async (data) => {
  const findPRN = await systemPRNTrackerService.findOneSystemPRNTracker({
    where: {
      ura_prn: trim(data.prn),
      is_used: false,
      // amount: parseInt(data.amount, 10),
    },
    raw: true,
  });

  if (!findPRN) {
    // Find If it's APPLICANT TRANSACTION.
    const findTrxn =
      await runningAdmissionApplicantService.findOneApplicantPaymentTransaction(
        {
          where: {
            ura_prn: trim(data.prn),
            amount: parseInt(data.amount, 10),
          },
        }
      );

    if (findTrxn) return findTrxn;

    // Find If it's PUJAB APPLICANT TRANSACTION.
    const findPujabPayment = await pujabApplicantPaymentService.findOne({
      where: {
        ura_prn: trim(data.prn),
        amount_paid: parseInt(data.amount, 10),
      },
    });

    if (findPujabPayment) return findPujabPayment;

    // Find If it's STUDENT TRANSACTION.
    const findStudentTrxn = await paymentTransactionService.findOneRecord({
      where: { ura_prn: trim(data.prn) },
    });

    if (findStudentTrxn) return findStudentTrxn;

    // Find If it's UNIVERSAL TRANSACTION.
    const findUniversalTrxn = await universalInvoiceService.findOneRecord({
      where: { ura_prn: trim(data.prn), amount: parseInt(data.amount, 10) },
    });

    if (findUniversalTrxn) return findUniversalTrxn;

    // Find If it's BULK TRANSACTION.
    const findBulkPaymentPRN = await bulkPaymentService.findOneRecord({
      where: {
        //  approved: true,
        acknowledge_prn: trim(data.prn),
        amount_paid: parseInt(data.amount, 10),
      },
      raw: true,
    });

    if (findBulkPaymentPRN) return findBulkPaymentPRN;

    throw new Error('Unable To Find PRN.');
  }

  if (parseInt(data.amount, 10) !== parseInt(findPRN.amount, 10)) {
    throw new Error(
      `Amounts Do not match. Incoming: ${parseInt(
        data.amount,
        10
      )} and Requested: ${parseInt(findPRN.amount, 10)}`
    );
  }

  const paymentEvent = new PaymentEvent();

  await model.sequelize.transaction(async (transaction) => {
    let paymentStatus = findPaymentStatus(trim(data.paymentStatus));

    if (!paymentStatus) {
      paymentStatus = {
        code: data.paymentStatus,
        description: 'Unknown status',
      };
    }

    if (
      findPRN.category === 'STUDENT-TRANSACTION' ||
      findPRN.category === 'GRADUATION-FEES'
    ) {
      const findEnrollmentPRN = await paymentReferenceService
        .findOnePaymentReference({
          where: {
            ura_prn: trim(data.prn),
          },
          include: [
            {
              association: 'tuitionInvoice',
              attributes: [
                'id',
                'payment_reference_id',
                'tuition_invoice_id',
                'amount',
              ],
            },
            {
              association: 'functionalFeesInvoice',
              attributes: [
                'id',
                'payment_reference_id',
                'functional_fees_invoice_id',
                'amount',
              ],
            },
            {
              association: 'otherFeesInvoices',
              attributes: [
                'id',
                'payment_reference_id',
                'other_fees_invoice_id',
                'amount',
              ],
            },
            {
              association: 'manualInvoices',
              attributes: [
                'id',
                'payment_reference_id',
                'manual_invoice_id',
                'amount',
              ],
            },
            {
              association: 'graduationInvoices',
              attributes: [
                'id',
                'payment_reference_id',
                'graduation_fees_invoice_id',
                'amount',
              ],
            },
          ],
          nest: true,
        })
        .then((res) => {
          if (res) {
            return res.toJSON();
          }
        });

      if (
        parseInt(data.amount, 10) !== parseInt(findEnrollmentPRN.amount, 10)
      ) {
        throw new Error(
          `Amounts Do not match. Incoming: ${parseInt(
            data.amount,
            10
          )} and Requested: ${parseInt(findEnrollmentPRN.amount, 10)}`
        );
      }

      const prnInvoices = [];

      if (findEnrollmentPRN) {
        if (findEnrollmentPRN.is_used === false) {
          if (!isEmpty(findEnrollmentPRN.tuitionInvoice)) {
            prnInvoices.push(...findEnrollmentPRN.tuitionInvoice);
          }
          if (!isEmpty(findEnrollmentPRN.functionalFeesInvoice)) {
            prnInvoices.push(...findEnrollmentPRN.functionalFeesInvoice);
          }
          if (!isEmpty(findEnrollmentPRN.otherFeesInvoices)) {
            prnInvoices.push(...findEnrollmentPRN.otherFeesInvoices);
          }
          if (!isEmpty(findEnrollmentPRN.manualInvoices)) {
            prnInvoices.push(...findEnrollmentPRN.manualInvoices);
          }
          if (!isEmpty(findEnrollmentPRN.graduationInvoices)) {
            prnInvoices.push(...findEnrollmentPRN.graduationInvoices);
          }

          // Update The PRN
          await paymentReferenceService.updatePaymentReference(
            findEnrollmentPRN.id,
            {
              is_used: toUpper(paymentStatus.code) === 'T',
              bank: trim(data.bank),
              branch: trim(data.branch),
              payment_status: paymentStatus.code,
              payment_status_description: paymentStatus.paymentStatusDesc,
            },
            transaction
          );

          // Create A Payment Transaction
          if (toUpper(paymentStatus.code) === 'T') {
            if (!isEmpty(prnInvoices)) {
              await offsetInvoices(
                findEnrollmentPRN.tuitionInvoice,
                findEnrollmentPRN.functionalFeesInvoice,
                findEnrollmentPRN.otherFeesInvoices,
                findEnrollmentPRN.manualInvoices,
                findEnrollmentPRN.graduationInvoices,
                parseFloat(data.amount),
                findPRN,
                data,
                paymentStatus,
                transaction
              );
            } else {
              await paymentTransactionService.createPaymentTransactionRecord(
                {
                  student_id: findPRN.student_id,
                  student_programme_id: findPRN.student_programme_id,
                  ura_prn: trim(data.prn),
                  system_prn: findPRN.system_prn,
                  bank: trim(data.bank),
                  branch: trim(data.branch),
                  banktxnid: trim(data.banktxnid),
                  payment_date: moment(data.paymentdate).format('YYYY-MM-DD'),
                  amount: parseFloat(data.amount),
                  signature: trim(data.signature),
                  currency: data.currencyCode,
                  payment_mode: data.paymentMode,
                  transaction_origin: 'URA',
                  create_approval_status: 'APPROVED',
                  create_approval_date: moment.now(),
                  allocated_amount: 0,
                  unallocated_amount: parseFloat(data.amount),
                  approved: true,
                  payment_status: paymentStatus.code,
                  payment_status_description: trim(
                    paymentStatus.paymentStatusDesc
                  ),
                },
                transaction
              );
            }

            const findStudent = await studentService.findOneStudent({
              where: {
                id: findPRN.student_id,
              },
              attributes: ['id', 'surname', 'other_names', 'phone', 'email'],
              raw: true,
            });

            if (findStudent) {
              if (findStudent.email) {
                paymentEvent.notifyPayer(
                  'FEES PAYMENT RECEIPT',
                  {
                    prn: data.prn,
                    amount: findPRN.amount,
                    currency: data.currencyCode,
                    fullname: `${findStudent.surname} ${findStudent.other_names}`,
                    email: trim(findStudent.email),
                    phone: findStudent.phone,
                    paymentDate: moment(data.paymentdate).format('YYYY-MM-DD'),
                    bank: trim(data.bank),
                    branch: trim(data.branch),
                    url: appConfig.STAFF_PORTAL_URL,
                    paymentType: 'ACADEMIC FEES PAYMENT',
                  },
                  {
                    email: trim(findStudent.email),
                  }
                );
              }
            }

            await deletePRNFromTracker(findPRN, transaction);

            await paymentReferenceService.updateAllInvoiceElements(
              trim(data.prn),
              moment(data.paymentdate).format('YYYY-MM-DD').toString(),
              transaction
            );
          }
        }
      }
    } else if (findPRN.category === 'UNIVERSAL') {
      const findUniversalInvoicePRN = await universalInvoiceService
        .findOneUniversalPaymentReference({
          where: {
            ura_prn: trim(data.prn),
            is_used: false,
            amount: parseInt(data.amount, 10),
          },
          include: [
            {
              association: 'universalInvoice',
              attributes: ['id', 'full_name', 'email', 'phone_number'],

              include: [
                {
                  association: 'invoiceReceivables',
                  separate: true,
                  attributes: ['id', 'receivable_id', 'quantity', 'amount'],
                  include: [
                    {
                      association: 'receivable',
                      attributes: ['id', 'receivable_name'],
                    },
                  ],
                },
              ],
            },
          ],
          nest: true,
        })
        .then(function (res) {
          if (res) {
            const result = res.toJSON();

            return result;
          }
        });

      if (findUniversalInvoicePRN) {
        // Update The PRN
        const updateData = {
          is_used: toUpper(paymentStatus.code) === 'T',
          bank: trim(data.bank),
          branch: trim(data.branch),
          payment_status: paymentStatus.code,
          payment_status_description: paymentStatus.paymentStatusDesc,
          payment_date: moment(data.paymentdate).format('YYYY-MM-DD'),
          signature: trim(data.signature),
        };

        if (toUpper(paymentStatus.code) === 'T') {
          updateData.create_approval_status = 'APPROVED';
          updateData.create_approval_date = moment.now();
        }

        await universalInvoiceService.updateUniversalPaymentReference(
          findUniversalInvoicePRN.id,
          updateData,
          transaction
        );

        // Create A Payment Transaction
        if (toUpper(paymentStatus.code) === 'T') {
          await universalInvoiceService.updateUniversalInvoice(
            findUniversalInvoicePRN.universal_invoice_id,
            {
              amount_paid: parseFloat(data.amount),
              create_approval_status: 'APPROVED',
              create_approval_date: moment.now(),
            },
            transaction
          );

          await universalInvoiceService.createUniversalPaymentTransaction(
            {
              universal_invoice_id: findPRN.universal_invoice_id,
              ura_prn: trim(data.prn),
              mode_reference: trim(data.prn),
              system_prn: findPRN.system_prn,
              bank: trim(data.bank),
              branch: trim(data.branch),
              banktxnid: trim(data.banktxnid),
              payment_date: trim(data.paymentdate),
              currency: data.currencyCode,
              payment_mode: data.paymentMode,
              amount: parseFloat(data.amount),
              signature: trim(data.signature),
              create_approval_status: 'APPROVED',
              create_approval_date: moment.now(),
              transaction_origin: 'URA',
              payment_status: paymentStatus.code,
              payment_status_description: trim(paymentStatus.paymentStatusDesc),
            },
            transaction
          );

          const invoiceReceivables = [];

          if (
            !isEmpty(
              findUniversalInvoicePRN.universalInvoice.invoiceReceivables
            )
          ) {
            findUniversalInvoicePRN.universalInvoice.invoiceReceivables.forEach(
              (item) => {
                invoiceReceivables.push({
                  receivable: item.receivable.receivable_name,
                  quantity: item.quantity,
                  amount: item.amount,
                });
              }
            );
          }

          if (findUniversalInvoicePRN.universalInvoice.email) {
            paymentEvent.notifyPayer(
              'UNIVERSAL PAYMENT RECEIPT',
              {
                prn: data.prn,
                amount: findPRN.amount,
                currency: data.currencyCode,
                fullname: findUniversalInvoicePRN.universalInvoice.full_name,
                email: trim(findUniversalInvoicePRN.universalInvoice.email),
                phone: findUniversalInvoicePRN.universalInvoice.phone_number,
                paymentDate: moment(data.paymentdate).format('YYYY-MM-DD'),
                bank: trim(data.bank),
                branch: trim(data.branch),
                receivables: invoiceReceivables,
                url: appConfig.PAYMENT_PORTAL_URL,
                paymentType: 'UNIVERSAL PAYMENT',
              },
              {
                email: trim(findUniversalInvoicePRN.universalInvoice.email),
              }
            );
          }
          await deletePRNFromTracker(findPRN, transaction);
        }
      }
    } else if (findPRN.category === 'SPONSOR-BULK-PAYMENT') {
      const findSponsorPRN = await sponsorService
        .findOneSponsorPaymentReference({
          where: {
            ura_prn: trim(data.prn),
            is_used: false,
            amount: parseInt(data.amount, 10),
          },
          include: [
            {
              association: 'sponsorInvoice',
              attributes: [
                'id',
                'sponsor_id',
                'invoice_number',
                'invoice_amount',
                'amount_due',
                'amount_paid',
              ],
              include: [
                {
                  association: 'sponsor',
                  attributes: [
                    'id',
                    'sponsor_name',
                    'sponsor_email',
                    'sponsor_phone',
                  ],
                },
              ],
            },
          ],
          nest: true,
        })
        .then(function (res) {
          if (res) {
            const result = res.toJSON();

            return result;
          }
        });

      if (findSponsorPRN) {
        // Update The PRN
        const updateData = {
          is_used: toUpper(paymentStatus.code) === 'T',
          bank: trim(data.bank),
          branch: trim(data.branch),
          payment_status: paymentStatus.code,
          payment_status_description: paymentStatus.paymentStatusDesc,
          payment_date: moment(data.paymentdate).format('YYYY-MM-DD'),
          signature: trim(data.signature),
        };

        if (toUpper(paymentStatus.code) === 'T') {
          updateData.create_approval_status = 'APPROVED';
          updateData.create_approval_date = moment.now();
        }

        await sponsorService.updateSponsorPaymentReference(
          findSponsorPRN.id,
          updateData,
          transaction
        );

        // Create A Payment Transaction
        if (toUpper(paymentStatus.code) === 'T') {
          await sponsorService.updateSponsorInvoice(
            findSponsorPRN.sponsor_invoice_id,
            {
              amount_paid:
                parseFloat(data.amount) +
                parseFloat(findSponsorPRN.sponsorInvoice.amount_paid),
              amount_due:
                parseFloat(findSponsorPRN.sponsorInvoice.amount_due) -
                parseFloat(data.amount),
              create_approval_status: 'APPROVED',
              create_approval_date: moment.now(),
            },
            transaction
          );

          await sponsorService.createSponsorPaymentTransaction(
            {
              sponsor_invoice_id: findPRN.sponsor_invoice_id,
              sponsor_id: findSponsorPRN.sponsorInvoice.sponsor.id,
              ura_prn: trim(data.prn),
              mode_reference: trim(data.prn),
              system_prn: findPRN.system_prn,
              bank: trim(data.bank),
              branch: trim(data.branch),
              banktxnid: trim(data.banktxnid),
              payment_date: trim(data.paymentdate),
              currency: data.currencyCode,
              payment_mode: data.paymentMode,
              amount: parseFloat(data.amount),
              signature: trim(data.signature),
              create_approval_status: 'APPROVED',
              create_approval_date: moment.now(),
              transaction_origin: 'URA',
              payment_status: paymentStatus.code,
              unallocated_amount: parseFloat(data.amount),
              payment_status_description: trim(paymentStatus.paymentStatusDesc),
            },
            transaction
          );

          if (findSponsorPRN.sponsorInvoice.sponsor.sponsor_email) {
            paymentEvent.notifyPayer(
              'SPONSOR BULK PAYMENT RECEIPT',
              {
                prn: data.prn,
                amount: findPRN.amount,
                currency: data.currencyCode,
                fullname: findSponsorPRN.sponsorInvoice.sponsor.sponsor_name,
                email: trim(
                  findSponsorPRN.sponsorInvoice.sponsor.sponsor_email
                ),
                phone: findSponsorPRN.sponsorInvoice.sponsor.sponsor_phone,
                paymentDate: moment(data.paymentdate).format('YYYY-MM-DD'),
                bank: trim(data.bank),
                branch: trim(data.branch),
                paymentType: 'SPONSOR BULK PAYMENT',
              },
              {
                email: trim(
                  findSponsorPRN.sponsorInvoice.sponsor.sponsor_email
                ),
              }
            );
          }
          await deletePRNFromTracker(findPRN, transaction);
        }
      }
    } else if (findPRN.category === 'BULK-PAYMENTS') {
      const findBulkPaymentPRN = await bulkPaymentService.findOneRecord({
        where: {
          is_used: false,
          acknowledge_prn: trim(data.prn),
          payment_forwarded: false,
          amount_paid: parseInt(data.amount, 10),
        },
        raw: true,
      });

      if (findBulkPaymentPRN) {
        const updateData = {
          is_used: false,
          approved: false,
          bank: trim(data.bank),
          branch: trim(data.branch),
          payment_status: paymentStatus.code,
          payment_status_description: paymentStatus.paymentStatusDesc,
        };

        if (toUpper(paymentStatus.code) === 'T') {
          updateData.approved_by = 'AUTO-APPROVED';
          updateData.is_used = true;
          updateData.approved = true;
          updateData.payment_forwarded = true;
          updateData.approval_date = moment.now();
          updateData.forwarded_on = moment.now();
        }

        // Update The PRN
        await bulkPaymentService.updateRecord(
          findBulkPaymentPRN.id,
          updateData,
          transaction
        );

        if (toUpper(paymentStatus.code) === 'T') {
          // use this to notify bulk payments
          await paymentEvent.notifyURAPortal({
            prn: data.prn,
            tax_head: appConfig.TAX_HEAD_CODE,
            currency: data.currencyCode,
            amount_paid: findPRN.amount,
            payment_uuid: findBulkPaymentPRN.uuid,
          });
          await deletePRNFromTracker(findPRN, transaction);
        }
      }
    } else if (findPRN.category === 'APPLICANTS') {
      const findApplicantPRN = await runningAdmissionApplicantService
        .findOneRunningAdmissionApplicant({
          where: {
            id: findPRN.running_admission_applicant_id,
            is_used: false,
            amount: parseInt(data.amount, 10),
          },
          include: [
            {
              association: 'applicant',
              attributes: ['id', 'surname', 'other_names', 'email', 'phone'],
            },
          ],
          nest: true,
        })
        .then(function (res) {
          if (res) {
            const result = res.toJSON();

            return result;
          }
        });

      if (findApplicantPRN) {
        const updateData = {
          is_used: toUpper(paymentStatus.code) === 'T',
          ura_prn: trim(data.prn),
          expiry_date: findPRN.expiry_date,
          search_code: trim(data.searchCode),
          currency: trim(data.currency),
          bank: trim(data.bank),
          branch: trim(data.branch),
          payment_status: paymentStatus.code,
          payment_status_description: paymentStatus.paymentStatusDesc,
        };

        // Update The PRN
        await runningAdmissionApplicantService.updateRunningAdmissionApplicant(
          findApplicantPRN.id,
          updateData,
          transaction
        );

        // Create A Payment Transaction
        if (toUpper(paymentStatus.code) === 'T') {
          await runningAdmissionApplicantService.createApplicantPaymentTransaction(
            {
              running_admission_applicant_id:
                findPRN.running_admission_applicant_id,
              ura_prn: trim(data.prn),
              system_prn: findPRN.system_prn,
              bank: trim(data.bank),
              branch: trim(data.branch),
              banktxnid: trim(data.banktxnid),
              payment_date: moment(data.paymentdate).format('YYYY-MM-DD'),
              amount: parseFloat(data.amount),
              signature: trim(data.signature),
              currency: data.currencyCode,
              payment_mode: data.paymentMode,
              create_approval_status: 'APPROVED',
              create_approval_date: moment.now(),
              transaction_origin: 'URA',
              payment_status: data.paymentStatus,
            },
            transaction
          );

          if (findApplicantPRN.applicant.email) {
            paymentEvent.notifyPayer(
              'APPLICATION FEE PAYMENT RECEIPT',
              {
                prn: data.prn,
                amount: findPRN.amount,
                currency: data.currencyCode,
                fullname: `${findApplicantPRN.applicant.surname} ${findApplicantPRN.applicant.other_names}`,
                email: trim(findApplicantPRN.applicant.email),
                phone: findApplicantPRN.applicant.phone,
                paymentDate: moment(data.paymentdate).format('YYYY-MM-DD'),
                bank: trim(data.bank),
                branch: trim(data.branch),
                url: appConfig.APPLICATION_PORTAL_URL,
                paymentType: 'APPLICATION FEE PAYMENT',
              },
              {
                email: trim(findApplicantPRN.applicant.email),
              }
            );
          }
          await deletePRNFromTracker(findPRN, transaction);
        }
      }
    } else if (findPRN.category === 'CHANGE-OF-PROGRAMME') {
      const findServicePRN = await changeOfProgrammeService.findOne({
        where: {
          ura_prn: trim(findPRN.ura_prn),
          is_used: false,
        },
        raw: true,
      });

      if (findServicePRN) {
        const updateData = {
          is_used: true,
          ura_prn: trim(data.prn),
          expiry_date: findPRN.expiry_date,
          search_code: trim(data.searchCode),
          currency: trim(data.currency),
          bank: trim(data.bank),
          branch: trim(data.branch),
          payment_status: paymentStatus.code,
          payment_status_description: paymentStatus.paymentStatusDesc,
          paid: parseFloat(data.amount),
          balance: parseFloat(findServicePRN.amount) - parseFloat(data.amount),
        };

        // Update The PRN
        await changeOfProgrammeService.update(
          findServicePRN.id,
          updateData,
          transaction
        );

        // Create A Payment Transaction
        if (toUpper(paymentStatus.code) === 'T') {
          await paymentTransactionService.createPaymentTransactionRecord(
            {
              student_id: findPRN.student_id,
              student_programme_id: findPRN.student_programme_id,
              ura_prn: trim(data.prn),
              system_prn: findPRN.system_prn,
              bank: trim(data.bank),
              branch: trim(data.branch),
              banktxnid: trim(data.banktxnid),
              payment_date: moment(data.paymentdate).format('YYYY-MM-DD'),
              amount: parseFloat(data.amount),
              signature: trim(data.signature),
              currency: data.currencyCode,
              payment_mode: data.paymentMode,
              transaction_origin: 'URA',
              create_approval_status: 'APPROVED',
              create_approval_date: moment.now(),
              allocated_amount: parseFloat(data.amount),
              unallocated_amount: 0,
              approved: true,
              payment_status: paymentStatus.code,
              payment_status_description: trim(paymentStatus.paymentStatusDesc),
              narration: 'CHANGE OF PROGRAMME',
            },
            transaction
          );

          await deletePRNFromTracker(findPRN, transaction);
        }
      }
    } else if (findPRN.category === 'PUJAB-APPLICATION') {
      let findApplication = await pujabApplicationService.findOneAdmission({
        where: {
          prn: trim(findPRN.ura_prn),
          amount_billed: parseFloat(data.amount),
        },
        include: ['applicant'],
        attributes: ['id', 'amount_billed', 'amount_paid'],
      });

      if (!findApplication && findPRN.pujab_application_id) {
        findApplication = await pujabApplicationService.findOneAdmission({
          where: {
            id: findPRN.pujab_application_id,
            amount_billed: parseFloat(data.amount),
          },
          include: ['applicant'],
          attributes: ['id', 'amount_billed', 'amount_paid'],
        });
      }

      if (!findApplication) throw new Error('Invalid PRN Provided');

      const applicationID = findApplication.id;

      if (findApplication) {
        const updateData = {
          prn: trim(data.prn),
          expiry_date: findPRN.expiry_date,
          search_code: trim(data.searchCode),
          payment_date: moment(data.paymentdate).format('YYYY-MM-DD'),
          payment_mode: data.paymentMode,
          currency: data.currencyCode,
          bank: trim(data.bank),
          branch: trim(data.branch),
          payment_status: paymentStatus.description,
          payment_status_description: paymentStatus.description,
          amount_paid: parseFloat(data.amount),
          balance:
            parseFloat(findApplication.amount_billed) - parseFloat(data.amount),
        };

        // Update The PRN
        await pujabApplicationService.updateAdmission(
          updateData,
          {
            id: applicationID,
          },
          transaction
        );

        // Create A Payment Transaction
        if (toUpper(paymentStatus.code) === 'T') {
          await pujabApplicantPaymentService.findOrCreate(
            {
              pujab_application_id: applicationID,
              ura_prn: trim(data.prn),
              system_prn: findPRN.system_prn,
              bank: trim(data.bank),
              branch: trim(data.branch),
              banktxnid: trim(data.banktxnid),
              payment_date: moment(data.paymentdate).format('YYYY-MM-DD'),
              amount_paid: parseFloat(data.amount),
              amount_billed: findApplication.amount_billed,
              signature: trim(data.signature),
              currency: data.currencyCode,
              payment_mode: data.paymentMode,
              create_approval_status: 'APPROVED',
              create_approval_date: moment.now(),
              transaction_origin: 'URA',
              payment_status: data.paymentStatus,
            },
            {
              ura_prn: trim(data.prn),
            },
            transaction
          );

          if (findApplication.applicant.email) {
            paymentEvent.notifyPayer(
              'PUJAB APPLICATION FEE PAYMENT RECEIPT',
              {
                prn: data.prn,
                amount: findPRN.amount,
                amount_billed: findApplication.application_fee,
                currency: data.currencyCode,
                fullname: `${findApplication.applicant.surname} ${findApplication.applicant.other_names}`,
                email: trim(findApplication.applicant.email),
                phone: findApplication.applicant.phone,
                paymentDate: moment(data.paymentdate).format('YYYY-MM-DD'),
                bank: trim(data.bank),
                branch: trim(data.branch),
                url: appConfig.APPLICATION_PORTAL_URL,
                paymentType: 'PUJAB APPLICATION FEE PAYMENT',
              },
              {
                email: trim(findApplication.applicant.email),
              }
            );
          }
          await deletePRNFromTracker(findPRN, transaction);
        }
      }
    } else throw new Error('Invalid Category');
  });

  return { message: 'success' };
};

/**
 *
 *
 * @param {*} data
 * @returns json
 */
const manuallyOverridePRNTransaction = async () => {
  try {
    const systemPRNTrackers =
      await systemPRNTrackerService.findAllSystemPRNTrackers({
        where: {
          category: 'STUDENT-TRANSACTION',
        },
        raw: true,
      });

    const result = await model.sequelize.transaction(async (transaction) => {
      if (!isEmpty(systemPRNTrackers)) {
        for (const tracker of systemPRNTrackers) {
          const findStudentReference =
            await paymentReferenceService.findOnePaymentReference({
              where: {
                system_prn: trim(tracker.system_prn),
              },
              raw: true,
            });

          if (findStudentReference) {
            if (
              findStudentReference.is_used === true &&
              findStudentReference.payment_status === 'T'
            ) {
              const findTransaction =
                await paymentTransactionService.findOneRecord({
                  where: {
                    system_prn: trim(findStudentReference.system_prn),
                  },
                  raw: true,
                });

              if (findTransaction) {
                if (!findTransaction.ura_prn) {
                  await paymentTransactionService.updateRecord(
                    findTransaction.id,
                    {
                      ura_prn: findStudentReference.ura_prn,
                    },
                    transaction
                  );

                  await deletePRNFromTracker(tracker, transaction);
                }
              }
            }
          }
        }
      }
    });

    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 *
 * @param {*} data
 * @returns json
 */
const confirmManualOverridePRNTransaction = async () => {
  try {
    const studentReferences =
      await paymentReferenceService.findAllPaymentReferences({
        where: {
          is_used: true,
          payment_status: 'T',
        },
        raw: true,
      });

    const result = await model.sequelize.transaction(async (transaction) => {
      if (!isEmpty(studentReferences)) {
        for (const reference of studentReferences) {
          const findTransaction = await paymentTransactionService.findOneRecord(
            {
              where: {
                system_prn: trim(reference.system_prn),
              },
              raw: true,
            }
          );

          if (findTransaction) {
            if (!findTransaction.ura_prn) {
              await paymentTransactionService.updateRecord(
                findTransaction.id,
                {
                  ura_prn: reference.ura_prn,
                },
                transaction
              );
            }
          }
        }
      }
    });

    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 *
 * @param {*} data
 * @returns json
 */
const balanceInvoicesFromStudentTransactions = async () => {
  try {
    const studentReferences = await paymentReferenceService
      .findAllPaymentReferences({
        where: {
          is_used: true,
          payment_status: 'T',
        },
        include: [
          {
            association: 'tuitionInvoice',
          },
          {
            association: 'functionalFeesInvoice',
          },
          {
            association: 'otherFeesInvoices',
          },
          {
            association: 'manualInvoices',
          },
        ],
      })
      .then((res) => {
        if (res) {
          return res.map((item) => item.get({ plain: true }));
        }
      });

    const result = await model.sequelize.transaction(async (transaction) => {
      if (!isEmpty(studentReferences)) {
        for (const reference of studentReferences) {
          const findTransaction = await paymentTransactionService.findOneRecord(
            {
              where: {
                system_prn: trim(reference.system_prn),
              },
              raw: true,
            }
          );

          if (findTransaction) {
            if (parseFloat(findTransaction.allocated_amount) > 0) {
              let allocatedBalance = parseFloat(
                findTransaction.allocated_amount
              );

              if (!isEmpty(reference.tuitionInvoice)) {
                for (const invoice of reference.tuitionInvoice) {
                  if (parseFloat(invoice.amount_paid) <= 0) {
                    let newAmountPaid = 0;

                    if (allocatedBalance >= parseFloat(invoice.amount)) {
                      newAmountPaid =
                        allocatedBalance - parseFloat(invoice.amount);

                      allocatedBalance =
                        allocatedBalance - parseFloat(invoice.amount);
                    } else {
                      newAmountPaid =
                        parseFloat(invoice.amount) - allocatedBalance;

                      allocatedBalance =
                        parseFloat(invoice.amount) - allocatedBalance;
                    }

                    await invoiceService.updateEnrollmentTuitionInvoice(
                      invoice.id,
                      {
                        amount_paid: newAmountPaid,
                        amount_due:
                          parseFloat(invoice.amount_due) - newAmountPaid,
                      },
                      transaction
                    );
                  }
                }
              }

              if (!isEmpty(reference.functionalFeesInvoice)) {
                for (const invoice of reference.functionalFeesInvoice) {
                  if (parseFloat(invoice.amount_paid) <= 0) {
                    // unbalancedInvoices.push(invoice);

                    let newAmountPaid = 0;

                    if (allocatedBalance >= parseFloat(invoice.amount)) {
                      newAmountPaid =
                        allocatedBalance - parseFloat(invoice.amount);

                      allocatedBalance =
                        allocatedBalance - parseFloat(invoice.amount);
                    } else {
                      newAmountPaid =
                        parseFloat(invoice.amount) - allocatedBalance;

                      allocatedBalance =
                        parseFloat(invoice.amount) - allocatedBalance;
                    }

                    await invoiceService.updateEnrollmentFunctionalInvoice(
                      invoice.id,
                      {
                        amount_paid: newAmountPaid,
                      },
                      transaction
                    );
                  }
                }
              }

              if (!isEmpty(reference.otherFeesInvoices)) {
                for (const invoice of reference.otherFeesInvoices) {
                  if (parseFloat(invoice.amount_paid) <= 0) {
                    let newAmountPaid = 0;

                    if (allocatedBalance >= parseFloat(invoice.amount)) {
                      newAmountPaid =
                        allocatedBalance - parseFloat(invoice.amount);

                      allocatedBalance =
                        allocatedBalance - parseFloat(invoice.amount);
                    } else {
                      newAmountPaid =
                        parseFloat(invoice.amount) - allocatedBalance;

                      allocatedBalance =
                        parseFloat(invoice.amount) - allocatedBalance;
                    }

                    await invoiceService.updateEnrollmentOtherFeesInvoice(
                      invoice.id,
                      {
                        amount_paid: newAmountPaid,
                      },
                      transaction
                    );
                  }
                }
              }

              if (!isEmpty(reference.manualInvoices)) {
                for (const invoice of reference.manualInvoices) {
                  if (parseFloat(invoice.amount_paid) <= 0) {
                    let newAmountPaid = 0;

                    if (allocatedBalance >= parseFloat(invoice.amount)) {
                      newAmountPaid =
                        allocatedBalance - parseFloat(invoice.amount);

                      allocatedBalance =
                        allocatedBalance - parseFloat(invoice.amount);
                    } else {
                      newAmountPaid =
                        parseFloat(invoice.amount) - allocatedBalance;

                      allocatedBalance =
                        parseFloat(invoice.amount) - allocatedBalance;
                    }

                    await invoiceService.updateEnrollmentManualInvoice(
                      invoice.id,
                      {
                        amount_paid: newAmountPaid,
                      },
                      transaction
                    );
                  }
                }
              }
            }
          }
        }
      }
    });

    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 *
 * @param {*} data
 * @returns json
 */
const balanceStudentInvoiceElements = async () => {
  try {
    const metadataValues = await metadataValueService.findAllMetadataValues({
      include: {
        association: 'metadata',
        attributes: ['id', 'metadata_name'],
      },
      attributes: ['id', 'metadata_value'],
    });

    const findActiveInvoiceStatusId = getMetadataValueId(
      metadataValues,
      'ACTIVE',
      'INVOICE STATUSES'
    );

    const tuitionInvoices = await invoiceService
      .findAllTuitionInvoices({
        where: {
          invoice_status_id: findActiveInvoiceStatusId,
        },
        include: [
          {
            association: 'tuitionInvoiceFeesElement',
            attributes: [
              'id',
              'tuition_invoice_id',
              'fees_element_id',
              'amount',
              'new_amount',
              'amount_paid',
              'cleared',
            ],
          },
        ],
      })
      .then((res) => {
        if (res) {
          return res.map((item) => item.get({ plain: true }));
        }
      });

    const functionalInvoices = await invoiceService
      .findAllFunctionalFeesInvoices({
        where: {
          invoice_status_id: findActiveInvoiceStatusId,
        },
        include: [
          {
            association: 'functionalElements',
            attributes: [
              'id',
              'functional_invoice_id',
              'fees_element_id',
              'amount',
              'new_amount',
              'amount_paid',
              'cleared',
            ],
          },
        ],
      })
      .then((res) => {
        if (res) {
          return res.map((item) => item.get({ plain: true }));
        }
      });

    const otherInvoices = await invoiceService
      .findAllOtherFeesInvoices({
        where: {
          invoice_status_id: findActiveInvoiceStatusId,
        },
        include: [
          {
            association: 'otherFeesInvoiceFeesElements',
            attributes: [
              'id',
              'other_fees_invoice_id',
              'fees_element_id',
              'amount',
              'new_amount',
              'amount_paid',
              'cleared',
            ],
          },
        ],
      })
      .then((res) => {
        if (res) {
          return res.map((item) => item.get({ plain: true }));
        }
      });

    const manualInvoices = await invoiceService
      .findAllEnrollmentManualInvoices({
        where: {
          invoice_status_id: findActiveInvoiceStatusId,
        },
        include: [
          {
            association: 'elements',
            attributes: [
              'id',
              'manual_invoice_id',
              'fees_element_id',
              'amount',
              'amount_paid',
              'cleared',
            ],
          },
        ],
      })
      .then((res) => {
        if (res) {
          return res.map((item) => item.get({ plain: true }));
        }
      });

    const result = await model.sequelize.transaction(async (transaction) => {
      // Tuition
      if (!isEmpty(tuitionInvoices)) {
        for (const invoice of tuitionInvoices) {
          if (!isEmpty(invoice.tuitionInvoiceFeesElement)) {
            let elementAmountPaid = sumBy(
              invoice.tuitionInvoiceFeesElement,
              'amount_paid'
            );

            if (!elementAmountPaid) {
              elementAmountPaid = 0;
            }

            if (
              parseFloat(elementAmountPaid) < parseFloat(invoice.amount_paid)
            ) {
              let remainingInvoiceAmount = parseFloat(invoice.amount_paid);

              for (const element of invoice.tuitionInvoiceFeesElement) {
                await paymentReferenceService.updateTuitionInvoiceFeesElement(
                  element.id,
                  {
                    amount_paid: 0,
                    cleared: false,
                  },
                  transaction
                );

                let amountPaid = 0;

                let hasCleard = false;

                if (element.new_amount) {
                  if (
                    remainingInvoiceAmount >= parseFloat(element.new_amount)
                  ) {
                    amountPaid = parseFloat(element.new_amount);
                    hasCleard = true;

                    remainingInvoiceAmount =
                      remainingInvoiceAmount - parseFloat(element.new_amount);
                  } else {
                    amountPaid = remainingInvoiceAmount;
                    hasCleard = false;

                    remainingInvoiceAmount = 0;
                  }
                } else {
                  if (remainingInvoiceAmount >= parseFloat(element.amount)) {
                    amountPaid = parseFloat(element.amount);
                    hasCleard = true;

                    remainingInvoiceAmount =
                      remainingInvoiceAmount - parseFloat(element.amount);
                  } else {
                    amountPaid = remainingInvoiceAmount;
                    hasCleard = false;

                    remainingInvoiceAmount = 0;
                  }
                }

                await paymentReferenceService.updateTuitionInvoiceFeesElement(
                  element.id,
                  {
                    amount_paid: amountPaid,
                    cleared: hasCleard,
                  },
                  transaction
                );
              }
            }
          }
        }
      }

      // Functional
      if (!isEmpty(functionalInvoices)) {
        for (const invoice of functionalInvoices) {
          if (!isEmpty(invoice.functionalElements)) {
            let elementAmountPaid = sumBy(
              invoice.functionalElements,
              'amount_paid'
            );

            if (!elementAmountPaid) {
              elementAmountPaid = 0;
            }

            if (
              parseFloat(elementAmountPaid) < parseFloat(invoice.amount_paid)
            ) {
              let remainingInvoiceAmount = parseFloat(invoice.amount_paid);

              for (const element of invoice.functionalElements) {
                await paymentReferenceService.updateFunctionalInvoiceFeesElement(
                  element.id,
                  {
                    amount_paid: 0,
                    cleared: false,
                  },
                  transaction
                );

                let amountPaid = 0;

                let hasCleard = false;

                if (element.new_amount) {
                  if (
                    remainingInvoiceAmount >= parseFloat(element.new_amount)
                  ) {
                    amountPaid = parseFloat(element.new_amount);
                    hasCleard = true;

                    remainingInvoiceAmount =
                      remainingInvoiceAmount - parseFloat(element.new_amount);
                  } else {
                    amountPaid = remainingInvoiceAmount;
                    hasCleard = false;

                    remainingInvoiceAmount = 0;
                  }
                } else {
                  if (remainingInvoiceAmount >= parseFloat(element.amount)) {
                    amountPaid = parseFloat(element.amount);
                    hasCleard = true;

                    remainingInvoiceAmount =
                      remainingInvoiceAmount - parseFloat(element.amount);
                  } else {
                    amountPaid = remainingInvoiceAmount;
                    hasCleard = false;

                    remainingInvoiceAmount = 0;
                  }
                }

                await paymentReferenceService.updateFunctionalInvoiceFeesElement(
                  element.id,
                  {
                    amount_paid: amountPaid,
                    cleared: hasCleard,
                  },
                  transaction
                );
              }
            }
          }
        }
      }

      // otherInvoices
      if (!isEmpty(otherInvoices)) {
        for (const invoice of otherInvoices) {
          if (!isEmpty(invoice.otherFeesInvoiceFeesElements)) {
            let elementAmountPaid = sumBy(
              invoice.otherFeesInvoiceFeesElements,
              'amount_paid'
            );

            if (!elementAmountPaid) {
              elementAmountPaid = 0;
            }

            if (
              parseFloat(elementAmountPaid) < parseFloat(invoice.amount_paid)
            ) {
              let remainingInvoiceAmount = parseFloat(invoice.amount_paid);

              for (const element of invoice.otherFeesInvoiceFeesElements) {
                await paymentReferenceService.updateOtherInvoiceFeesElement(
                  element.id,
                  {
                    amount_paid: 0,
                    cleared: false,
                  },
                  transaction
                );

                let amountPaid = 0;

                let hasCleard = false;

                if (element.new_amount) {
                  if (
                    remainingInvoiceAmount >= parseFloat(element.new_amount)
                  ) {
                    amountPaid = parseFloat(element.new_amount);
                    hasCleard = true;

                    remainingInvoiceAmount =
                      remainingInvoiceAmount - parseFloat(element.new_amount);
                  } else {
                    amountPaid = remainingInvoiceAmount;
                    hasCleard = false;

                    remainingInvoiceAmount = 0;
                  }
                } else {
                  if (remainingInvoiceAmount >= parseFloat(element.amount)) {
                    amountPaid = parseFloat(element.amount);
                    hasCleard = true;

                    remainingInvoiceAmount =
                      remainingInvoiceAmount - parseFloat(element.amount);
                  } else {
                    amountPaid = remainingInvoiceAmount;
                    hasCleard = false;

                    remainingInvoiceAmount = 0;
                  }
                }

                await paymentReferenceService.updateOtherInvoiceFeesElement(
                  element.id,
                  {
                    amount_paid: amountPaid,
                    cleared: hasCleard,
                  },
                  transaction
                );
              }
            }
          }
        }
      }

      // manualInvoices
      if (!isEmpty(manualInvoices)) {
        for (const invoice of manualInvoices) {
          if (!isEmpty(invoice.elements)) {
            let elementAmountPaid = sumBy(invoice.elements, 'amount_paid');

            if (!elementAmountPaid) {
              elementAmountPaid = 0;
            }

            if (
              parseFloat(elementAmountPaid) < parseFloat(invoice.amount_paid)
            ) {
              let remainingInvoiceAmount = parseFloat(invoice.amount_paid);

              for (const element of invoice.elements) {
                await paymentReferenceService.updateManualInvoiceFeesElement(
                  element.id,
                  {
                    amount_paid: 0,
                    cleared: false,
                  },
                  transaction
                );

                let amountPaid = 0;

                let hasCleard = false;

                if (remainingInvoiceAmount >= parseFloat(element.amount)) {
                  amountPaid = parseFloat(element.amount);
                  hasCleard = true;

                  remainingInvoiceAmount =
                    remainingInvoiceAmount - parseFloat(element.amount);
                } else {
                  amountPaid = remainingInvoiceAmount;
                  hasCleard = false;

                  remainingInvoiceAmount = 0;
                }

                await paymentReferenceService.updateManualInvoiceFeesElement(
                  element.id,
                  {
                    amount_paid: amountPaid,
                    cleared: hasCleard,
                  },
                  transaction
                );
              }
            }
          }
        }
      }
    });

    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};

const updateStudentPRNTransaction = async (findPRN, prnStatus) => {
  const checkPRNTransaction = await paymentTransactionService.findOneRecord({
    where: { ura_prn: findPRN.ura_prn },
    raw: true,
  });

  let result = {};

  // Only Update if Transaction has not been recorded
  if (!checkPRNTransaction) {
    result = await model.sequelize.transaction(async (transaction) => {
      await paymentReferenceService.updatePaymentReference(
        findPRN.id,
        {
          is_used: toUpper(prnStatus.code) === 'T',
          bank: trim(prnStatus.PaymentBank),
          payment_status: prnStatus.code,
          payment_status_description: prnStatus.description,
        },
        transaction
      );

      // Create A Payment Transaction
      if (toUpper(prnStatus.code) === 'T') {
        await paymentTransactionService.createPaymentTransactionRecord(
          {
            student_id: findPRN.student_id,
            student_programme_id: findPRN.student_programme_id,
            ura_prn: trim(prnStatus.prn),
            system_prn: findPRN.system_prn,
            bank: trim(prnStatus.bank),
            payment_date: moment(prnStatus.DatePaid).format('YYYY-MM-DD'),
            amount: parseFloat(prnStatus.AmountPaid),
            currency: prnStatus.Currency,
            payment_mode: prnStatus.PaymentMode,
            transaction_origin: 'URA',
            create_approval_status: 'APPROVED',
            create_approval_date: moment.now(),
            unallocated_amount: parseFloat(prnStatus.AmountPaid),
            approved: true,
            payment_status: prnStatus.code,
            payment_status_description: prnStatus.description,
          },
          transaction
        );
        await deletePRNFromTracker(findPRN, transaction);
      }
    });
  }

  return result;
};

/**
 *
 * @param {*} prn
 * @param {*} amount
 * @param {*} transaction
 */
const offsetInvoices = async (
  tuitionInvoices,
  functionalFeesInvoices,
  otherFeesInvoices,
  manualInvoices,
  graduationInvoices,
  amount,
  findPRN,
  data,
  paymentStatus,
  transaction
) => {
  try {
    let amountBalance = parseFloat(amount);

    if (!isEmpty(functionalFeesInvoices)) {
      for (const item of functionalFeesInvoices) {
        const findInvoice = await invoiceService.findOneFunctionalInvoiceRecord(
          {
            where: {
              id: item.functional_fees_invoice_id,
            },
            attributes: [
              'id',
              'invoice_amount',
              'amount_paid',
              'amount_due',
              'percentage_completion',
            ],
            raw: true,
          }
        );

        if (findInvoice) {
          amountBalance = await handleOffsettingFunctionalInvoice(
            findInvoice,
            amountBalance,
            transaction
          );
        }
      }
    }

    if (!isEmpty(tuitionInvoices)) {
      for (const item of tuitionInvoices) {
        const findInvoice = await invoiceService.findOneTuitionInvoiceRecord({
          where: {
            id: item.tuition_invoice_id,
          },
          attributes: [
            'id',
            'invoice_amount',
            'amount_paid',
            'amount_due',
            'percentage_completion',
          ],
          raw: true,
        });

        if (findInvoice) {
          amountBalance = await handleOffsettingTuitionInvoice(
            findInvoice,
            amountBalance,
            transaction
          );
        }
      }
    }

    if (!isEmpty(otherFeesInvoices)) {
      for (const item of otherFeesInvoices) {
        const findInvoice = await invoiceService.findOneOtherFeesInvoiceRecords(
          {
            where: {
              id: item.other_fees_invoice_id,
            },
            attributes: [
              'id',
              'invoice_amount',
              'amount_paid',
              'amount_due',
              'percentage_completion',
            ],
            raw: true,
          }
        );

        if (findInvoice) {
          amountBalance = await handleOffsettingOtherFeesInvoice(
            findInvoice,
            amountBalance,
            transaction
          );
        }
      }
    }

    if (!isEmpty(manualInvoices)) {
      for (const item of manualInvoices) {
        const findInvoice = await invoiceService.findOneManualInvoiceRecord({
          where: {
            id: item.manual_invoice_id,
          },
          attributes: [
            'id',
            'invoice_amount',
            'amount_paid',
            'amount_due',
            'percentage_completion',
          ],
          raw: true,
        });

        if (findInvoice) {
          amountBalance = await handleOffsettingManualInvoice(
            findInvoice,
            amountBalance,
            transaction
          );
        }
      }
    }

    let gradStudentId = null;

    if (!isEmpty(graduationInvoices)) {
      for (const item of graduationInvoices) {
        const findInvoice =
          await graduationFeesService.findOneGraduationFeesInvoice({
            where: {
              id: item.graduation_fees_invoice_id,
            },
            attributes: [
              'id',
              'grad_list_id',
              'student_id',
              'student_programme_id',
              'invoice_amount',
              'amount_paid',
              'amount_due',
              'percentage_completion',
            ],
            raw: true,
          });

        if (findInvoice) {
          amountBalance = await handleOffsettingGraduationInvoice(
            findInvoice,
            amountBalance,
            transaction
          );

          gradStudentId = findInvoice.student_id;
        }
      }
    }

    const allocatedAmount = parseFloat(amount) - parseFloat(amountBalance);

    await paymentTransactionService.createPaymentTransactionRecord(
      {
        student_id: findPRN.student_id ? findPRN.student_id : gradStudentId,
        ura_prn: trim(data.prn),
        system_prn: findPRN.system_prn,
        bank: trim(data.bank),
        branch: trim(data.branch),
        banktxnid: trim(data.banktxnid),
        payment_date: moment(data.paymentdate).format('YYYY-MM-DD'),
        amount: parseFloat(data.amount),
        signature: trim(data.signature),
        currency: data.currencyCode,
        payment_mode: data.paymentMode,
        transaction_origin: 'URA',
        create_approval_status: 'APPROVED',
        create_approval_date: moment.now(),
        allocated_amount: allocatedAmount,
        unallocated_amount: amountBalance,
        approved: true,
        payment_status: paymentStatus.code,
        payment_status_description: trim(paymentStatus.paymentStatusDesc),
      },
      transaction
    );
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} tuitionInvoice
 * @param {*} amountAllocated
 * @param {*} transaction
 */
const handleOffsettingTuitionInvoice = async (
  tuitionInvoice,
  amountAllocated,
  transaction
) => {
  try {
    if (parseFloat(tuitionInvoice.amount_due) > 0) {
      let balance = 0;

      let newAmountPaid = 0;

      let newAmountDue = 0;

      let newPercentageCompletion = 0;

      if (
        parseFloat(amountAllocated) >= parseFloat(tuitionInvoice.amount_due)
      ) {
        newAmountDue = 0;

        balance =
          parseFloat(amountAllocated) - parseFloat(tuitionInvoice.amount_due);

        newAmountPaid =
          parseFloat(tuitionInvoice.amount_paid) +
          parseFloat(tuitionInvoice.amount_due);
      } else {
        newAmountDue =
          parseFloat(tuitionInvoice.amount_due) - parseFloat(amountAllocated);

        balance = 0;

        newAmountPaid =
          parseFloat(tuitionInvoice.amount_paid) + parseFloat(amountAllocated);
      }

      newPercentageCompletion = Math.floor(
        (newAmountPaid / parseFloat(tuitionInvoice.invoice_amount)) * 100
      );

      const newInvoiceData = {
        amount_paid: newAmountPaid,
        amount_due: newAmountDue,
        percentage_completion: newPercentageCompletion,
      };

      await invoiceService.updateEnrollmentTuitionInvoice(
        tuitionInvoice.id,
        newInvoiceData,
        transaction
      );

      return balance;
    } else {
      return parseFloat(amountAllocated);
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} functionalInvoice
 * @param {*} amountAllocated
 * @param {*} transaction
 */
const handleOffsettingFunctionalInvoice = async (
  functionalInvoice,
  amountAllocated,
  transaction
) => {
  try {
    if (parseFloat(functionalInvoice.amount_due) > 0) {
      let balance = 0;

      let newAmountPaid = 0;

      let newAmountDue = 0;

      let newPercentageCompletion = 0;

      if (
        parseFloat(amountAllocated) >= parseFloat(functionalInvoice.amount_due)
      ) {
        newAmountDue = 0;

        balance =
          parseFloat(amountAllocated) -
          parseFloat(functionalInvoice.amount_due);

        newAmountPaid =
          parseFloat(functionalInvoice.amount_paid) +
          parseFloat(functionalInvoice.amount_due);
      } else {
        newAmountDue =
          parseFloat(functionalInvoice.amount_due) -
          parseFloat(amountAllocated);

        balance = 0;

        newAmountPaid =
          parseFloat(functionalInvoice.amount_paid) +
          parseFloat(amountAllocated);
      }

      newPercentageCompletion = Math.floor(
        (newAmountPaid / parseFloat(functionalInvoice.invoice_amount)) * 100
      );

      const newInvoiceData = {
        amount_paid: newAmountPaid,
        amount_due: newAmountDue,
        percentage_completion: newPercentageCompletion,
      };

      await invoiceService.updateEnrollmentFunctionalInvoice(
        functionalInvoice.id,
        newInvoiceData,
        transaction
      );

      return balance;
    } else {
      return parseFloat(amountAllocated);
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} otherFeesInvoice
 * @param {*} amountAllocated
 * @param {*} transaction
 */
const handleOffsettingOtherFeesInvoice = async (
  otherFeesInvoice,
  amountAllocated,
  transaction
) => {
  try {
    if (parseFloat(otherFeesInvoice.amount_due) > 0) {
      let balance = 0;

      let newAmountPaid = 0;

      let newAmountDue = 0;

      let newPercentageCompletion = 0;

      if (
        parseFloat(amountAllocated) >= parseFloat(otherFeesInvoice.amount_due)
      ) {
        newAmountDue = 0;

        balance =
          parseFloat(amountAllocated) - parseFloat(otherFeesInvoice.amount_due);

        newAmountPaid =
          parseFloat(otherFeesInvoice.amount_paid) +
          parseFloat(otherFeesInvoice.amount_due);
      } else {
        newAmountDue =
          parseFloat(otherFeesInvoice.amount_due) - parseFloat(amountAllocated);

        balance = 0;

        newAmountPaid =
          parseFloat(otherFeesInvoice.amount_paid) +
          parseFloat(amountAllocated);
      }

      newPercentageCompletion = Math.floor(
        (newAmountPaid / parseFloat(otherFeesInvoice.invoice_amount)) * 100
      );

      const newInvoiceData = {
        amount_paid: newAmountPaid,
        amount_due: newAmountDue,
        percentage_completion: newPercentageCompletion,
      };

      await invoiceService.updateEnrollmentOtherFeesInvoice(
        otherFeesInvoice.id,
        newInvoiceData,
        transaction
      );

      return balance;
    } else {
      return parseFloat(amountAllocated);
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} manualInvoice
 * @param {*} amountAllocated
 * @param {*} transaction
 */
const handleOffsettingManualInvoice = async (
  manualInvoice,
  amountAllocated,
  transaction
) => {
  try {
    if (parseFloat(manualInvoice.amount_due) > 0) {
      let balance = 0;

      let newAmountPaid = 0;

      let newAmountDue = 0;

      let newPercentageCompletion = 0;

      if (parseFloat(amountAllocated) >= parseFloat(manualInvoice.amount_due)) {
        newAmountDue = 0;

        balance =
          parseFloat(amountAllocated) - parseFloat(manualInvoice.amount_due);

        newAmountPaid =
          parseFloat(manualInvoice.amount_paid) +
          parseFloat(manualInvoice.amount_due);
      } else {
        newAmountDue =
          parseFloat(manualInvoice.amount_due) - parseFloat(amountAllocated);

        balance = 0;

        newAmountPaid =
          parseFloat(manualInvoice.amount_paid) + parseFloat(amountAllocated);
      }

      newPercentageCompletion = Math.floor(
        (newAmountPaid / parseFloat(manualInvoice.invoice_amount)) * 100
      );

      const newInvoiceData = {
        amount_paid: newAmountPaid,
        amount_due: newAmountDue,
        percentage_completion: newPercentageCompletion,
      };

      await invoiceService.updateEnrollmentManualInvoice(
        manualInvoice.id,
        newInvoiceData,
        transaction
      );

      return balance;
    } else {
      return parseFloat(amountAllocated);
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} graduationInvoice
 * @param {*} amountAllocated
 * @param {*} transaction
 */
const handleOffsettingGraduationInvoice = async (
  graduationInvoice,
  amountAllocated,
  transaction
) => {
  try {
    if (parseFloat(graduationInvoice.amount_due) > 0) {
      let balance = 0;

      let newAmountPaid = 0;

      let newAmountDue = 0;

      let newPercentageCompletion = 0;

      if (
        parseFloat(amountAllocated) >= parseFloat(graduationInvoice.amount_due)
      ) {
        newAmountDue = 0;

        balance =
          parseFloat(amountAllocated) -
          parseFloat(graduationInvoice.amount_due);

        newAmountPaid =
          parseFloat(graduationInvoice.amount_paid) +
          parseFloat(graduationInvoice.amount_due);
      } else {
        newAmountDue =
          parseFloat(graduationInvoice.amount_due) -
          parseFloat(amountAllocated);

        balance = 0;

        newAmountPaid =
          parseFloat(graduationInvoice.amount_paid) +
          parseFloat(amountAllocated);
      }

      newPercentageCompletion = Math.floor(
        (newAmountPaid / parseFloat(graduationInvoice.invoice_amount)) * 100
      );

      const newInvoiceData = {
        amount_paid: newAmountPaid,
        amount_due: newAmountDue,
        percentage_completion: newPercentageCompletion,
      };

      await graduationFeesService.updateGraduationFeesInvoice(
        graduationInvoice.id,
        newInvoiceData,
        transaction
      );

      await graduationListService.updateFinalGraduationList(
        graduationInvoice.grad_list_id,
        { has_paid: true },
        transaction
      );

      return balance;
    } else {
      return parseFloat(amountAllocated);
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} amount
 * @param {*} taxPayerName
 * @param {*} paymentMode
 * @param {*} paymentBankCode
 * @param {*} paymentMobileNo
 * @returns
 */
const generatePaymentReference = async function (
  amount,
  taxPayerName,
  paymentMode,
  paymentBankCode,
  paymentMobileNo
) {
  try {
    const payload = {};

    payload.tax_head = envConfig.TAX_HEAD_CODE;
    payload.system_prn = generateSystemReference();
    payload.tax_payer_name = taxPayerName;
    payload.amount = amount;

    const requestUraPrnData = {
      TaxHead: payload.tax_head,
      TaxPayerName: payload.tax_payer_name,
      TaxPayerBankCode: paymentBankCode,
      PaymentBankCode: paymentBankCode,
      MobileNo: paymentMobileNo,
      ReferenceNo: payload.system_prn,
      ExpiryDays: envConfig.PAYMENT_REFERENCE_EXPIRES_IN,
      Amount: payload.amount,
      PaymentMode: paymentMode,
    };

    const genPRN = await generatePRN(requestUraPrnData);

    payload.ura_prn = genPRN.ura_prn;
    payload.expiry_date = genPRN.expiry_date;
    payload.search_code = genPRN.search_code;

    return payload;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} payload
 * @param {*} transaction
 */
const prnTrackerRecord = async function (payload, transaction) {
  try {
    const response = await universalInvoiceService.createPrnTrackerRecord(
      payload,
      transaction
    );

    return response;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  paymentStatuses,
  findPaymentStatus,
  updatePRNTransaction,
  updateStudentPRNTransaction,
  generateSystemReference,
  generatePaymentReference,
  prnTrackerRecord,
  manuallyOverridePRNTransaction,
  confirmManualOverridePRNTransaction,
  balanceStudentInvoiceElements,
  balanceInvoicesFromStudentTransactions,
};
