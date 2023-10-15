const express = require('express');

const {
    getAllTours,
    addTour,
    getOneTour,
    updateTour,
    deleteTour,
    getTopCheapest,
    toursStatistics,
    getMonthlyPlan
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
    get(protect, getTopCheapest, getAllTours);

router.
    route('/toursStats').
    get(protect, toursStatistics);

router.
    route('/monthly-plan/:year').
    get(protect, getMonthlyPlan);

router.
    route('/').
    get(protect, getAllTours).
    post(protect, addTour);

router.
    route('/:id').
    get(protect, getOneTour).
    patch(protect, updateTour).
    delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);

module.exports = router;