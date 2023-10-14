const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Review = require('../models/reviewsModel');
const APIFeatures = require('../utils/apiFeatures');

const addReview = catchAsync(async (req, res, next) => {
    const newReview = await Review.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            newReview
        }
    });
});

const getAllReviews = catchAsync(async (req, res, next) => {
    const apiFeatures = new APIFeatures(Review.find(), req.query).
        filter().
        limitFields().
        paginate().
        sort();

    const reviews = await apiFeatures.query;

    res.status(200).json({
        status: 'success',
        results: reviews.length,
        data: reviews
    });
});

module.exports = {
    addReview,
    getAllReviews
};