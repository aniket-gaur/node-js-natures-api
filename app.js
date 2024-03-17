const express = require('express');

const morgan = require('morgan');

const tourRouter = require('./routes/tourRoute');
const Users = require('./routes/userRouter');
const AppError = require('./app-errror');

// const { dirname } = require('path');

const app = express();
const port = 3000;
// this is to use a middleware
app.use(express.json());
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  next();
});

//third party middleware
app.use(morgan('dev'));

// app.get('/', (req, res) => {
//   res.status(404).json({
//     NAME: 'AYUSH',
//   });
// });
// app.post('/', (req, res) => {
//   res.send('you can post some good stuffs ');
// });

// app.get('/api/v1/tours', getAlltour);

// app.get('/api/v1/tours/:id', getTour);
// app.post('/api/v1/tours', createTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

//better file structure
//using middleware

//users resource

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', Users);

// error handling
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'failure',
  //   message: `can not get ${req.originalUrl}`,
  // });
  // const err = new Error(`can not get the url -- ${req.originalUrl}`);
  // err.status = 'failure';
  // err.statusCode = 404;

  //whats imp here that :: next is passed with a err parameter means it will skip all the other middleware in the middleware stack

  next(new AppError(`can not get the url -- ${req.originalUrl}`, 404));
});

// express error handling

app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
  next();
});

//we cannot get the middleware result as the response cycle is ended when the res.status
app.use((req, res, next) => {
  console.log('this is to test middlware');
  next();
});

module.exports = app;
