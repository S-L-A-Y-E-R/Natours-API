const Tour = require('../models/toursModel');
const User = require('../models/usersmodel');
const catchAsync = require('../utils/catchAsync');
const {
    deleteOne,
    updateOne,
    createOne,
    getOne,
    getAll
} = require('./factoryHandler');

//Aliasing Middleware
const getTopCheapest = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    next();
};

const addTour = createOne(Tour);

const getAllTours = getAll(Tour);

const getOneTour = getOne(Tour, { path: 'reviews' });

const updateTour = updateOne(Tour);

const deleteTour = deleteOne(Tour);

const toursStatistics = catchAsync(async (req, res, next) => {
    const tours = await Tour.aggregate([
        {
            $match: { ratingsAverage: { $gte: 4.5 } }
        },
        {
            $group: {
                _id: { $toUpper: '$difficulty' },
                numTours: { $sum: 1 },
                numRatings: { $sum: '$ratingsQuantity' },
                avgRatings: { $avg: '$ratingsAverage' },
                avgPrice: { $avg: '$price' },
                maxPrice: { $max: '$price' },
                minPrice: { $min: '$price' }
            }
        },
        {
            $sort: { avgPrice: 1 }
        }
    ]);

    res.status(200).json({
        status: 'success',
        tours: tours
    });
});

const getMonthlyPlan = catchAsync(async (req, res, next) => {
    const year = +req.params.year;
    const plan = await Tour.aggregate([
        {
            $unwind: '$startDates'
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            }
        },
        {
            $group: {
                _id: { $month: '$startDates' },
                numTourStarts: { $sum: 1 },
                tours: { $push: '$name' }
            }
        },
        {
            $addFields: { month: '$_id' }
        },
        {
            $project: {
                _id: 0
            }
        },
        {
            $sort: { numTourStarts: -1 }
        },
    ]);

    res.status(200).json({
        status: 'success',
        plan: plan
    });
});

module.exports = {
    getAllTours,
    getOneTour,
    addTour,
    updateTour,
    deleteTour,
    getTopCheapest,
    toursStatistics,
    getMonthlyPlan
};