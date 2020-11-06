const envs = require('dotenv').config();

if (envs.error) {
  console.warn(`error loading env vars. ${envs.error}`);
}
console.info('env vars loaded');

const createError = require('http-errors');
const express = require('express');
const favicon = require('express-favicon');
const compression = require('compression');
const useragent = require('express-useragent');
const fileUpload = require('express-fileupload');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const { Logger } = require('./utils/Logger');
const responseHelper = require('./utils/response_helper');
const utils = require('./utils/utils');

const log = new Logger('app');

const indexRouter = require('./routes/index');
// const sitemapRouter = require('./routes/sitemap');
const adminRouter = require('./routes/admin');

const app = express();
app.use(compression());
app.use(useragent.express());
app.use(fileUpload());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// redirect any page form http to https
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'test' && !utils.isSecure(req)) {
    res.redirect(301, `https://${req.headers.host}${req.url}`);
  } else {
    next();
  }
});

app.use('/', indexRouter);
app.use('/admin', adminRouter);
// app.use('/sitemap.xml', sitemapRouter);

// // catch 404 and forward to error handler
// app.use((req, res, next) => {
//   next(createError(404));
// });

// // error handler
// app.use((err, req, res, next) => {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};
//
//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  const showExtendedErrors = process.env.NODE_ENV !== 'production';
  res.locals.error = showExtendedErrors ? err : {};
  if (req.app.get('env') === 'test') {
    log.error(err.message);
  } else {
    log.error(err);
  }

  const responseJson = responseHelper.getResponseJson(req);

  if (err.status === 404) {
    responseJson.message = 'Página no encontrada';
  } else if (process.env.NODE_ENV === 'production') {
    // do not print internal messages in production
    responseJson.message = 'Error inesperado.';
  }

  // render the error page
  res.status(err.status || 500);
  res.render('error', responseJson);
});

module.exports = app;
