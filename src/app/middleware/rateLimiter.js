const { isEmpty } = require('lodash');
const moment = require('moment');
const redis = require('redis');
const { HttpResponse } = require('@helpers');

const http = new HttpResponse();

const redisClient = redis.createClient();
const WINDOW_SIZE_IN_HOURS = 24;
const MAX_WINDOW_REQUEST_COUNT = 10;
const WINDOW_LOG_INTERVAL_IN_HOURS = 1;

const customRedisRateLimiter = async (req, res, next) => {
  try {
    // check that redis client exists
    if (!redisClient) {
      throw new Error('Redis client does not exist!');
      //   process.exit(1);
    }
    // fetch records of current user using IP address, returns null when no record is found
    await redisClient.get(req.ip, function (err, record) {
      if (err) throw err;
      const currentRequestTime = moment();

      // console.log('<<<<<<>>>>>>>>>>>>>', req.ip, record);
      //  if no record is found , create a new record for user and store to redis
      if (isEmpty(record)) {
        const newRecord = [];

        const requestLog = {
          requestTimeStamp: currentRequestTime.unix(),
          requestCount: 1,
        };

        newRecord.push(requestLog);
        redisClient.set(req.ip, JSON.stringify(newRecord));
        next();
      }
      // if record is found, parse it's value and calculate number of requests users has made within the last window
      const data = JSON.parse(record);

      const windowStartTimestamp = moment()
        .subtract(WINDOW_SIZE_IN_HOURS, 'hours')
        .unix();

      const requestsWithinWindow = data.filter((entry) => {
        return entry.requestTimeStamp > windowStartTimestamp;
      });

      // console.log(
      //   'requestsWithinWindow',
      //   moment(requestsWithinWindow[0].requestTimeStamp).format()
      // );

      const totalWindowRequestsCount = requestsWithinWindow.reduce(
        (accumulator, entry) => {
          return accumulator + entry.requestCount;
        },
        0
      );
      // if number of requests made is greater than or equal to the desired maximum, return error

      if (totalWindowRequestsCount >= MAX_WINDOW_REQUEST_COUNT) {
        http.setError(
          429,
          `You have exceeded the ${MAX_WINDOW_REQUEST_COUNT} requests in ${WINDOW_SIZE_IN_HOURS} hrs limit!`
        );

        return http.send(res);
      } else {
        // if number of requests made is less than allowed maximum, log new entry
        const lastRequestLog = data[data.length - 1];

        const potentialCurrentWindowIntervalStartTimeStamp = currentRequestTime
          .subtract(WINDOW_LOG_INTERVAL_IN_HOURS, 'hours')
          .unix();
        //  if interval has not passed since last request log, increment counter

        if (
          lastRequestLog.requestTimeStamp >
          potentialCurrentWindowIntervalStartTimeStamp
        ) {
          lastRequestLog.requestCount++;
          data[data.length - 1] = lastRequestLog;
        } else {
          //  if interval has passed, log new entry for current user and timestamp
          data.push({
            requestTimeStamp: currentRequestTime.unix(),
            requestCount: 1,
          });
        }
        redisClient.set(req.ip, JSON.stringify(data));
        next();
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { customRedisRateLimiter };
