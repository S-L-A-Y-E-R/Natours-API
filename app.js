const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const toursRouter = require('./routes/toursRoutes');
const usersRoutes = require('./routes/usersRoutes');

const app = express();

//Set security http headers
app.use(helmet());


if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

//Limiting num.of requests for certain IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from that IP, try again within an hour!'
});

app.use('/api', limiter);

//Limit data incoming from the request body
app.use(express.json({ limit: '10kb' }));

//Data sanitization agains noSQL query injection
app.use(mongoSanitize());

//Data sanitization against xss attacks
app.use(xssClean());

//Manipulating request object
app.use((req, res, next) => {
  req.requestedAt = new Date().toISOString();
  next();
});

//Allowig access to the static files
app.use(express.static(`${__dirname}/public`));

//Global resources
app
  .use('/api/v1/tours', toursRouter)
  .use('/api/v1/users', usersRoutes);

// Handling wrong urls
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

//Using global error handling middleware
app.use(globalErrorHandler);

module.exports = app;
