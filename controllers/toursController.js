const multer = require('multer');
const sharp = require('sharp');

const Tour = require('../models/toursModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const {
    deleteOne,
    updateOne,
    createOne,
    getOne,
    getAll
} = require('./factoryHandler');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new AppError('Please upload only images', 400), false);
    }
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

const uploadTourImages = upload.fields([
    { name: 'imageCover', maxCount: 1 },
    { name: 'images', maxCount: 3 }
]);

const resizeTourImages = async (req, res, next) => {
    if (!req.file.imageCover || !req.file.images) next();

    //Cover Image
    req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
    await sharp(req.files.imageCover[0].buffer).
        resize(2000, 1333).
        toFormat('jpeg').
        jpeg({ quality: 90 }).
        toFile(`public/images/${req.body.imageCover}`);

    //Images
    req.body.images = [];

    await Promise.all(
        req.files.images.map(async (file, index) => {
            const filename = `tour-${req.params.id}-${Date.now()}-${index + 1}.jpeg`;

            await sharp(file.buffer).
                resize(2000, 1333).
                toFormat('jpeg').
                jpeg({ quality: 90 }).
                toFile(`public/images/${filename}`);

            req.body.images.push(filename);
        })
    );

    next();
};

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
                _id: 0,
                month: 1,
                numTourStarts: 1,
                tours: 1,
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

const getToursWithin = catchAsync(async (req, res, next) => {
    const { distance, latlng, unit } = req.params;

    const [lat, lng] = latlng.split(',');

    if (!lat, !lng) {
        return next(new AppError('Please provide a latitude and longitude in form of lat,lng'), 400);
    };

    const radius = unit === 'miles' ? distance / 3963.2 : distance / 6378.1;

    const tours = await Tour.find({
        startLocation: {
            $geoWithin: { $centerSphere: [[lng, lat], radius] }
        }
    });

    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            tours
        }
    });
});

const getDistances = catchAsync(async (req, res, next) => {
    const { latlng, unit } = req.params;

    const [lat, lng] = latlng.split(',');

    const multiplier = unit === 'miles' ? 0.000621371 : 0.001;

    if (!lat, !lng) {
        return next(new AppError('Please provide a latitude and longitude in form of lat,lng'), 400);
    };

    const distances = await Tour.aggregate([
        {
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [+lng, +lat]
                },
                distanceField: 'distance',
                distanceMultiplier: multiplier
            }
        },
        {
            $project: {
                name: 1,
                distance: 1
            }
        }
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            distances
        }
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
    getMonthlyPlan,
    getToursWithin,
    getDistances,
    resizeTourImages,
    uploadTourImages
};