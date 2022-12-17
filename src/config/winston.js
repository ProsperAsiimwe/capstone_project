const appRoot = require('app-root-path');
const Winston = require('winston');

const options = {
  file: {
    level: 'info',
    filename: `${appRoot}/storage/logs/access.log`,
    handleExceptions: true,
    json: true,
    // 5MB
    maxsize: 5242880,
    maxFiles: 5,
    colorize: true,
  },
  console: {
    level: 'debug',
    handleExceptions: true,
    json: false,
    colorize: true,
  },
};

// eslint-disable-next-line new-cap
const logger = new Winston.createLogger({
  transports: [
    new Winston.transports.File(options.file),
    new Winston.transports.Console(options.console),
  ],
  // do not exit on handled exceptions
  exitOnError: false,
});

logger.stream = {
  write: function (message) {
    logger.info(message);
  },
};

module.exports = logger;
