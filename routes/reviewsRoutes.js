const express = require('express');

const { protect, restrictTo } = require('../controllers/authController');
const {
    addReview,
    getAllReviews,
    deleteReview
} = require('../controllers/reviewsController');

const router = express.Router({ mergeParams: true });

router.
    route('/').
    get(protect, getAllReviews).
    post(protect, restrictTo('user'), addReview);

router.
    route('/:id').
    delete(protect, restrictTo('admin'), deleteReview);

module.exports = router;