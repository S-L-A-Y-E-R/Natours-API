const express = require('express');

const { protect, restrictTo } = require('../controllers/authController');
const {
    addReview,
    getAllReviews
} = require('../controllers/reviewsController');

const router = express.Router({ mergeParams: true });

router.
    route('/').
    get(protect, getAllReviews).
    post(protect, restrictTo('user'), addReview);

module.exports = router;