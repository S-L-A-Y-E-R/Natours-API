const express = require('express');

const {
    getAllTours,
    addTour,
    getOneTour,
    updateTour,
    deleteTour,
    getTopCheapest
} =
    require('../controllers/toursController');

const router = express.Router();

//Aliasing route
router.
    route('/top-5-cheapest').
    get(getTopCheapest, getAllTours);

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