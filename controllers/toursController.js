const Tour = require('../models/toursModel');

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
        const excludeFields = ['page', 'sort', 'limit', 'fields'];
        let queryObj = { ...req.query };

        excludeFields.forEach(ele => delete queryObj[ele]);

        //Filtering
        let queryString = JSON.stringify(queryObj);
        queryString = queryString.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`);

        queryObj = JSON.parse(queryString);

        let query = Tour.find(queryObj);

        //Sorting
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query.sort(sortBy);
        } else {
            query.sort('-createdAt');
        }

        const tours = await query;

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

module.exports = { getAllTours, getOneTour, addTour, updateTour, deleteTour };