const catchAsync = require('../utils/catchAsync');
const Review = require('../models/reviewsModel');
const {
    deleteOne,
    updateOne
} = require('./factoryHandler');

const addReview = catchAsync(async (req, res, next) => {
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = req.user.id;

    const newReview = await Review.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            newReview
        }
    });
});

const getAllReviews = catchAsync(async (req, res, next) => {
    let filter = {};

    if (req.params.tourId) filter = { tour: req.params.tourId };

    const reviews = await Review.find(filter);

    res.status(200).json({
        status: 'success',
        results: reviews.length,
        data: reviews
    });
});

const deleteReview = deleteOne(Review);

const updateReview = updateOne(Review);

module.exports = {
    addReview,
    getAllReviews,
    deleteReview,
    updateReview
};