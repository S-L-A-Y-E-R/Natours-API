const Review = require('../models/reviewsModel');
const {
    deleteOne,
    updateOne,
    createOne,
    getOne,
    getAll
} = require('./factoryHandler');

const addParamsToBody = (req, res, next) => {
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = req.user.id;

    next();
};

const addReview = createOne(Review);

const getAllReviews = getAll(Review);

const getOneReview = getOne(Review);

const deleteReview = deleteOne(Review);

const updateReview = updateOne(Review);

module.exports = {
    addReview,
    getAllReviews,
    deleteReview,
    updateReview,
    addParamsToBody,
    getOneReview
};