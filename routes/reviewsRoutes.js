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

router.
    route('/').
    get(protect, getAllReviews).
    post(protect, restrictTo('user'), addParamsToBody, addReview);

router.
    route('/:id').
    get(protect,getOneReview).
    delete(protect, restrictTo('user', 'admin'), deleteReview).
    patch(protect, restrictTo('user'), updateReview);

module.exports = router;