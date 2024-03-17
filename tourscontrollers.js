const Tour = require('./../models/tourmodel');
const APIFeatures = require('./../utils/resource');
const createAsync = require('.././utils/catchAsync');
const AppError = require('../app-errror');
// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

////////building the api////////////////////////////
//creating the database
// const testtour = new Tour({
//   name: 'Aniket Gaur',
//   rating: 4.6,
//   price: 678,
// });

// testtour
//   .save()
//   .then((doc) => console.log(doc))
//   .catch((err) => console.log(err));

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';

  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAlltour = createAsync(async (req, res) => {
  //   const queryObj = { ...req.query };
  //   console.log(queryObj);
  //   const excludedObject = ['page', 'fields', 'sort', 'limit'];
  //   excludedObject.forEach((ele) => delete queryObj[ele]);

  //filtering using query object
  // const tours = await Tour.find({
  //   duration: 5,
  //   difficulty: 'easy',
  // });
  //using special fn
  // const tours = await Tour.find()
  //   .where('duration')
  //   .equals(5)
  //   .where('difficulty')
  //   .equals('easy');

  ////////// advanced filtering option ///////////

  // standard way of writing advanced query
  //{difficulty:"easy",duration :{$gte :5}};
  // we have to include this $in the query expression
  //standard way
  //by using a regular expression

  //2. Advanced filter option

  // let queryStr = JSON.stringify(queryObj);
  // queryStr = queryStr.replace(/\b(gte|gt|lt|lte)\b/g, (match) => `$${match}`);

  // console.log(JSON.parse(queryStr));
  // let query = Tour.find(JSON.parse(queryStr)); // this method returns a query

  // 3. sorting
  // if (req.query.sort) {
  // //adding other fields to sort
  // const sortBy = req.query.sort.split(',').join(' ');
  // console.log(sortBy);
  // query = query.sort(sortBy);
  //   //look like sort{price ratingsAverage}
  //   // this sort fn takes the entites like shown above
  // } else {
  //   query = query.sort('-createdAt');
  // }

  //field limiting
  //why it is a good practice as it creates a load balance over the server
  // if (req.query.fields) {
  //   const selectFields = req.query.fields.split(',').join(' ');
  //   query = query.select(selectFields);
  // }

  //4. applying pagination
  // const page = req.query.page * 1 || 1;
  // const limit = req.query.page * 1 || 100;
  // const skip = (page - 1) * limit;

  // query = query.skip(skip).limit(limit);
  // //overflow condition

  // if (req.query.page) {
  //   const allTour = await Tour.countDocuments();
  //   if (skip >= allTour) throw new Error('can not get the data '); //this will go in catch block
  // }

  //execute query
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const tours = await features.query;

  res.status(200).json({
    status: 'success',
    results: tours.length,
    requestedAt: req.requestTime,
    data: {
      tours,
    },
  });
});

exports.getTour = createAsync(
  async (req, res, next) => {
    /////req.parnams means the the parameters of the url encoded that is :id

    console.log(req.params);
    const tour = await Tour.findById(req.params.id);
    if (!tour) {
      return next(new AppError('no data is found ', 404));
    }
    //here findbyid real meaning
    // Tour.findOne({id:req.params.id})
    res.status(200).json({
      status: 'success',

      data: {
        tour,
      },
    });
  }

  /////we are doing this trick to convert this into a string to number

  //////here find method takes a callback fn
);

exports.createTour = createAsync(
  async (req, res, next) => {
    //handling error using try and catch

    const newTour = await Tour.create(req.body);
    console.log(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  }
  // const newTour= new Tour({});
  // newTour.save();

  //using create method instead of new keyword
);
exports.updateTour = createAsync(
  async (req, res, next) => {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runvalidators: true,
    });

    res.status(200).json({
      status: 'success',
      message: '<>updation done <>',
      data: {
        tour,
      },
    });
  }

  // if (req.params.id > tours.length) {
  //   res.status(404).json({
  //     message: 'not found ',
  //   });
  // }
);
exports.deleteTour = createAsync(
  async (req, res, next) => {
    await Tour.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  }

  // if (req.params.id > tours.length) {
  //   res.status(404).json({
  //     message: 'not found ',
  //   });
  // }
  // res.status(204).json({
  //   status: 'success',
  //   data: null,
  // });
);
exports.getTourStats = createAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTour: { $sum: 1 },

        minPrice: { $min: `$price` },
        maxPrice: { $max: `$price` },
        avgprice: { $avg: `$price` },
        sumRating: { $sum: `$price` },
      },
      //adding another pipeline
    },
    {
      $sort: {
        avgprice: 1,
      },
    },
    {
      $match: { _id: { $ne: 'EASY' } },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: { tour: stats },
  });
});

exports.getmonthyplan = createAsync(async (req, res, next) => {
  const year = req.params.year * 1; // converting string into a number
  const stats = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: `$startDates` },
        numTour: { $sum: 1 },
        tours: { $push: `$name` },
      },
    },
    {
      $addFields: {
        month: `$_id`,
      },
    },
  ]);
  res.status(200).json({
    status: 'success',
    reslength: res.length,
    data: { tour: stats },
  });
});
