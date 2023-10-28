const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const toursRouter = require('./routes/toursRoutes');
const usersRoutes = require('./routes/usersRoutes');
const reviewsRouter = require('./routes/reviewsRoutes');
const bookingsRouter = require('./routes/bookingRoutes');

const app = express();

//Enable outsource proxies
// app.enable('trust proxy');

//allow cors
app.use(cors({
  credentials: true,
  origin: 'http://localhost:3000'
}));

//Set security http headers
app.use(helmet());

//Use morgan logger in the develpment
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

//Prevent parameter pollution
app.use(hpp({
  whitelist: [
    'duration',
    'ratingsAverage',
    'ratingsQuantity',
    'difficulty',
    'price',
    'maxGroupSize'
  ]
}));

//Parse and manipulate cookies 
app.use(cookieParser());

//Compress all text sent in the response to the client
if (process.env.NODE_ENV === 'production') {
  app.use(compression());
}

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
  .use('/api/v1/users', usersRoutes)
  .use('/api/v1/reviews', reviewsRouter)
  .use('/api/v1/bookings', bookingsRouter);

// Handle requests from wrong urls
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

//Using global error handling middleware
app.use(globalErrorHandler);

module.exports = app;
