const express = require('express');

const {
    getAllTours,
    addTour,
    getOneTour,
    updateTour,
    deleteTour,
    getTopCheapest,
    toursStatistics,
    getMonthlyPlan,
    getToursWithin,
    getDistances,
    resizeTourImages,
    uploadTourImages
} =
    require('../controllers/toursController');
const { protect, restrictTo } = require('../controllers/authController');
const reviewRouter = require(('./reviewsRoutes'));

const router = express.Router();

//Reviews nested route
router.use('/:tourId/reviews', reviewRouter);

//Aliasing route
router.
    route('/top-5-cheapest').
    get(getTopCheapest, getAllTours);

router.
    route('/tours-within/:distance/center/:latlng/unit/:unit').
    get(getToursWithin);

router.
    route('/distances/:latlng/unit/:unit').
    get(getDistances);

router.
    route('/toursStats').
    get(toursStatistics);

router.
    route('/monthly-plan/:year').
    get(protect, restrictTo('lead-guide', 'admin', 'guide'), getMonthlyPlan);

router.
    route('/').
    get(getAllTours).
    post(protect, restrictTo('lead-guide', 'admin'), addTour);

router.
    route('/:id').
    get(getOneTour).
    patch(protect, restrictTo('lead-guide', 'admin'), uploadTourImages, resizeTourImages, updateTour).
    delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);

module.exports = router;