const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const toursRouter = require('./routes/toursRoutes');
const usersRoutes = require('./routes/usersRoutes');

const app = express();

if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

//Limiting num.of requests for certain IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from that IP, try again within an hour!'
});

app.use('/api', limiter);

app
  .use(express.json())
  .use((req, res, next) => {
    req.requestedAt = new Date().toISOString();
    next();
  })
  .use(express.static(`${__dirname}/public`))
  .use('/api/v1/tours', toursRouter)
  .use('/api/v1/users', usersRoutes);

// Handling wrong urls
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
