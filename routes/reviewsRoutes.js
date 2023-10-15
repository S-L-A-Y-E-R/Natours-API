const express = require('express');

const { protect, restrictTo } = require('../controllers/authController');
const {
    addReview,
    getAllReviews,
    deleteReview,
    updateReview,
    addParamsToBody
} = require('../controllers/reviewsController');

const router = express.Router({ mergeParams: true });

router.
    route('/').
    get(protect, getAllReviews).
    post(protect, restrictTo('user'), addParamsToBody, addReview);

router.
    route('/:id').
    delete(protect, restrictTo('user', 'admin'), deleteReview).
    patch(protect, restrictTo('user'), updateReview);

module.exports = router;