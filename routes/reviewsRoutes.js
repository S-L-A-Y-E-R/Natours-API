const express = require('express');

const { protect, restrictTo } = require('../controllers/authController');
const {
    addReview,
    getAllReviews,
    deleteReview,
    updateReview,
    addParamsToBody,
    getOneReview
} = require('../controllers/reviewsController');

const router = express.Router({ mergeParams: true });

router.use(protect);

router.
    route('/').
    get(getAllReviews).
    post(restrictTo('user'), addParamsToBody, addReview);

router.
    route('/:id').
    get(getOneReview).
    delete(restrictTo('user', 'admin'), deleteReview).
    patch(restrictTo('user', 'admin'), updateReview);

module.exports = router;