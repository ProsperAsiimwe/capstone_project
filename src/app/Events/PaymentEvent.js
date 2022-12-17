const EventEmitter = require('events');
const axios = require('axios').default;
const { isEmpty } = require('lodash');
const { appConfig } = require('../../config');
const { sendMail } = require('@helpers');

class PaymentEvent extends EventEmitter {
  uraPortalURL = appConfig.URA_PORTAL_BASE_URL;

  constructor(data) {
    super({ captureRejections: true });
  }

  notifyURAPortal = (formData) => {
    this.on('notifyURAPortal', async () => {
      await axios
        .post(`${this.uraPortalURL}/api/notify-prn-payment`, formData)
        .then((res) => res.data)
        .catch((err) => `Notification Error: ${err.message}`);
    });
    this.emit('notifyURAPortal');
    this.removeAllListeners();
  };

  notifyPayer = (title, transactionData, payerData) => {
    if (isEmpty(transactionData.receivables)) {
      transactionData.receivables = [];
    }

    this.on('notifyPayer', async () => {
      await sendMail(
        payerData.email,
        title,
        {
          ...transactionData,
          app: 'PAYMENT RECEIPT',
          title,
        },
        'receipt'
      ).catch((err) => {
        throw new Error(err.message);
      });
    });
    this.emit('notifyPayer');
    this.removeAllListeners();
  };
}

module.exports = PaymentEvent;
