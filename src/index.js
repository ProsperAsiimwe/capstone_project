const globalAny = global;

require('module-alias/register');
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const Sentry = require('@sentry/node');
const Tracing = require('@sentry/tracing');
const routes = require('./routes');
const winston = require('./config/winston');
const { appConfig } = require('./config');

const logger = require('morgan');
const indexRouter = require('./routes/index');
const { cwd } = require('process');
const { filterMiddleware } = require('./app/middleware');
const app = express();

globalAny.__basedir = __dirname;

Sentry.init({
  dsn: appConfig.SENTRY_DNS,
  integrations: [
    // enable HTTP calls tracing
    new Sentry.Integrations.Http({ tracing: true }),
    // enable Express.js middleware tracing
    new Tracing.Integrations.Express({
      // to trace all requests to the default router
      app,
      // alternatively, you can specify the routes you want to trace:
      // router: someRouter,
    }),
  ],
  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: appConfig.SENTRY_TRACE_SAMPLE_RATE,
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());
app.use(compression());
app.use(helmet());
app.use(cookieParser());
app.use(express.static(path.join(appConfig.ASSETS_ROOT_DIRECTORY)));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
// setup the logger
app.use(morgan('combined', { stream: winston.stream }));

app.use('/', [filterMiddleware], routes);

// view engine setup
app.set('views', path.join(cwd(), 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(appConfig.ASSETS_ROOT_DIRECTORY)));

app.use('/', indexRouter);

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// Setup a default catch-all route that JSON response.
app.get('*', (req, res) =>
  res.status(404).send({ message: 'Resource Not Found!' })
);

app.use(
  Sentry.Handlers.errorHandler({
    shouldHandleError(error) {
      // Capture all 400, 404 and 500 errors
      if (
        error.status === 400 ||
        error.status === 404 ||
        error.status === 500
      ) {
        return true;
      }

      return false;
    },
  })
);

module.exports = app;
