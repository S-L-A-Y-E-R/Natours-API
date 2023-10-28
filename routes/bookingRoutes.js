const express = require('express');
const {
    getCheckoutSession,
    createBooking,
    updateBooking,
    deleteBooking,
    getOneBooking,
    getAllBookings
} = require('../controllers/bookingController');
const {
    protect,
    restrictTo
} = require('../controllers/authController');

const router = express.Router();

router.route('/').
    get(getAllBookings).
    get(getOneBooking);

router.use(protect);

router.get('/checkout-session/:tourId', getCheckoutSession);

router.post(createBooking);

router.
    route('/:id').
    patch(restrictTo('admin'), updateBooking).
    delete(restrictTo('admin'), deleteBooking);

module.exports = router;