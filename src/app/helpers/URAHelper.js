/* eslint-disable no-underscore-dangle */
const axios = require('axios');
const { appConfig } = require('../../config');

/**
 *
 * @param {*} requestUraPrnData
 */
const generatePRN = async function (requestUraPrnData) {
  try {
    const response = await axios({
      method: 'post',
      url: `${appConfig.BRIDGE_BASE_URL}/api/payments-prn/create`,
      data: requestUraPrnData,
    })
      .then((res) => {
        const response = res.data.__values__;

        if (response.PRN === null || response.PRN === 'null') {
          throw new Error(
            `Unable to generate Payment Reference: ${response.ErrorDesc}`
          );
        }
        const data = {
          ura_prn: response.PRN,
          expiry_date: response.ExpiryDate,
          search_code: response.SearchCode,
        };

        return data;
      })
      .catch((error) => {
        throw new Error(error.message);
      });

    return response;
  } catch (error) {
    throw new Error(
      `Sorry, we are unable to Generate your Payment Reference: ${error.message}`
    );
  }
};

/**
 *
 * @param {*} prn
 * @returns
 */
const getPRNStatus = async function (prn) {
  try {
    const status = await axios({
      method: 'get',
      url: `${appConfig.BRIDGE_BASE_URL}/api/payments-prn/status/${prn}`,
    })
      .then((res) => res.data.__values__)
      .catch((error) => {
        throw new Error(error.message);
      });

    return status;
  } catch (error) {
    throw new Error(
      `Unable To Get Your Payment Reference Status: ${error.message}`
    );
  }
};

/**
 *
 * @param {*} acknowledgeBulkPaymentData
 */
const acknowledgeBulkPayment = async function (acknowledgeBulkPaymentData) {
  try {
    const response = await axios({
      method: 'post',
      url: `${appConfig.URA_PORTAL_BASE_URL}/api/bulk-payments`,
      data: acknowledgeBulkPaymentData,
    })
      .then((res) => res.data)
      .catch((error) => {
        throw new Error(error.message);
      });

    return response;
  } catch (error) {
    throw new Error(
      `Something went wrong while submitting acknowledgement to URA: ${error.message}`
    );
  }
};

/**
 *
 * @param {*} taxHeadData
 */
const refreshBulkPayment = async function (taxHeadData) {
  try {
    const response = await axios({
      method: 'get',
      url: `${appConfig.URA_PORTAL_BASE_URL}/api/bulk-payments`,
      data: taxHeadData,
    })
      .then((res) => res.data)
      .catch((error) => {
        throw new Error(error.message);
      });

    return response;
  } catch (error) {
    throw new Error(
      `Something went wrong while refreshing bulk payments from URA: ${error.message}`
    );
  }
};

module.exports = {
  generatePRN,
  getPRNStatus,
  acknowledgeBulkPayment,
  refreshBulkPayment,
};
