/* eslint-disable prettier/prettier */
const express = require('express');

const {
    getAllTours,
    addTour,
    getOneTour,
    updateTour,
    deleteTour
} =
    require('../controllers/toursController');

const router = express.Router();

// router.param('id');

router.
    route('/').
    get(getAllTours).
    post(addTour);

router.
    route('/:id').
    get(getOneTour).
    patch(updateTour).
    delete(deleteTour);

module.exports = router;