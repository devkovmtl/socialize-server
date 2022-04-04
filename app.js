require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const logger = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');

const indexRouter = require('./routes/index');

const { NODE_ENV } = process.env;
const { MONGO_URI, MONGO_OPTIONS } = require('./config/database');

// Database connection
mongoose.connect(MONGO_URI, MONGO_OPTIONS);
mongoose.connection.on('connected', () => {
  console.log('Database connected');
});

// Passport configuration (authentication)
require('./config/passport');

const app = express();

// middlewares
app.use(logger('dev'));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// routes
app.use('/api/v1/', indexRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // render the error page
  res.status(err.status || 500);
  res.json({
    success: false,
    message: err.message || 'Something went wrong',
    error: NODE_ENV === 'development' ? err : {},
  });
});

module.exports = app;
