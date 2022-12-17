'use strict';

const axios = require('axios');
const { appConfig } = require('@root/config');
const { pick } = require('lodash');

const webhookUri = null;

const institutionCode = appConfig.INSTITUTION_SHORT_CODE;

/**
 *
 * @param {*} caughtError
 * @param {*} service
 * @param {*} action
 * @param {*} requestType
 */
const sequelizeErrorHandler = async (
  caughtError,
  service,
  action,
  requestType
) => {
  try {
    const obscuredError = `Oops, a technical error has been detected!  Try again, if the error persists, contact IT Support. Thank you for your patience.`;

    if (caughtError.name === 'SequelizeUniqueConstraintError') {
      await slackBot(
        webhookUri,
        caughtError.parent.detail,
        service,
        action,
        requestType,
        institutionCode
      );

      throw new Error(obscuredError);
    } else if (caughtError.name === 'SequelizeValidationError') {
      const errorObject = caughtError.errors[0];

      await slackBot(
        webhookUri,
        errorObject.path,
        service,
        action,
        requestType,
        institutionCode
      );

      throw new Error(obscuredError);
    } else if (caughtError.name === 'SequelizeDatabaseError') {
      await slackBot(
        webhookUri,
        caughtError.message,
        service,
        action,
        requestType,
        institutionCode
      );

      throw new Error(obscuredError);
    } else if (caughtError.name === 'SequelizeForeignKeyConstraintError') {
      await slackBot(
        webhookUri,
        caughtError.message,
        service,
        action,
        requestType,
        institutionCode
      );

      throw new Error(obscuredError);
    } else {
      throw new Error(caughtError.message);
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 *
 * @param {*} webhookUri
 * @param {*} error
 * @param {*} service
 * @param {*} action
 * @param {*} requestType
 * @param {*} institutionCode
 */
const slackBot = async (
  webhookUri,
  error,
  service,
  action,
  requestType,
  institutionCode
) => {
  try {
    await axios.post(webhookUri, {
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `ERROR: *${error}*, HAS BEEN THROWN FROM SERVICE: *${service}* WHILE PERFORMING ACTION: *${action}* OF REQUEST TYPE: *${requestType}*, FROM INSTANCE: *${institutionCode}*.`,
          },
        },
      ],
    });
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * SEND MIDDLEWARE ERROR TO SLACK
 *
 * @param {*} error
 * @param {*} service
 * @param {*} action
 * @param {*} requestType
 */
const middlewareSlackBot = async (req, error) => {
  try {
    await axios.post(webhookUri, {
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `FORBIDDEN WORDS DETECTED FROM INSTANCE: *${institutionCode}*:`,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `RESPONSE MESSAGE: ${error}`,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text:
              '```' +
              JSON.stringify(
                pick(req, [
                  'query',
                  'params',
                  'body',
                  'path',
                  'originalUrl',
                  'method',
                  'ip',
                  'ips',
                  'url',
                  'headers',
                ])
              ) +
              '```',
          },
        },
      ],
    });
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * GENERAL SLACK BOT
 *
 * @param {*} req
 * @param {*} error
 */
const generalSlackBot = async (req, error) => {
  try {
    await axios.post(webhookUri, {
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `CUSTOM ERROR: *${institutionCode}*.`,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `RESPONSE MESSAGE: ${error}`,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text:
              '```' +
              JSON.stringify(
                pick(req, [
                  'query',
                  'params',
                  'body',
                  'path',
                  'originalUrl',
                  'method',
                  'ip',
                  'ips',
                  'url',
                  'headers',
                ])
              ) +
              '```',
          },
        },
      ],
    });
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  sequelizeErrorHandler,
  middlewareSlackBot,
  generalSlackBot,
};
