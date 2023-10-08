const express = require('express');
const morgan = require('morgan');

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

module.exports = app;
