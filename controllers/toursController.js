const Tour = require('../models/toursModel');
const APIFeatures = require('../utils/apiFeatures');

//Aliasing Middleware
const getTopCheapest = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    next();
};

const addTour = async (req, res) => {
    try {
        const newTour = await Tour.create(req.body);

        res.status(201).json({
            status: 'success',
            data: newTour
        });
    } catch (e) {
        res.status(400).json({
            status: 'fail',
            message: 'Invalid data sent!'
        });
    }
};

const getAllTours = async (req, res) => {
    try {
        const features = new APIFeatures(Tour.find(), req.query).
            filter().
            limitFields().
            paginate().
            sort();

        const tours = await features.query;

        res.status(200).json({
            status: 'success',
            results: tours.length,
            data: tours
        });
    } catch (e) {
        res.status(404).json({
            status: 'fail',
            massage: e
        });
    }
};

const getOneTour = async (req, res) => {
    try {
        const tour = await Tour.findById(req.params.id);

        res.status(200).json({
            status: 'success',
            data: tour
        });
    } catch (e) {
        res.status(404).json({
            status: 'fail',
            massage: e
        });
    }

};

const updateTour = async (req, res) => {
    try {
        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            status: 'success',
            message: tour
        });
    } catch (e) {
        res.status(404).json({
            status: 'fail',
            massage: e
        });
    }
};

const deleteTour = async (req, res) => {
    try {
        await Tour.findByIdAndDelete(req.params.id);

        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (e) {
        res.status(404).json({
            status: 'fail',
            massage: e
        });
    }
};

module.exports = {
    getAllTours,
    getOneTour,
    addTour,
    updateTour,
    deleteTour,
    getTopCheapest
};