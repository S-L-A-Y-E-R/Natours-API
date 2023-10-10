const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const toursRouter = require('./routes/toursRoutes');

const app = express();

if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

app
  .use(express.json())
  .use((req, res, next) => {
    req.requestedAt = new Date().toISOString();
    next();
  })
  .use(express.static(`${__dirname}/public`))
  .use('/api/v1/tours', toursRouter);

// Handling wrong urls
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
