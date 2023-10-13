const catchAsync = require('../utils/catchAsync');
const User = require('../models/usersmodel');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');

const getAllUsers = catchAsync(async (req, res, next) => {
    const features = new APIFeatures(User.find(), req.query).
        filter().
        limitFields()
        .paginate()
        .sort();

    const users = await features.query;

    res.status(200).json({
        message: 'success',
        results: users.length,
        data: users
    });
});

const getOneUser = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) next(new AppError('Invalid user ID', 404));

    res.status(200).json({
        message: 'success',
        data: user
    });
});

const deleteUser = catchAsync(async (req, res, next) => {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) next(new AppError('Invalid user ID', 404));

    res.status(204).json({
        message: 'success',
        data: null
    });
});

const updateMe = catchAsync(async (req, res, next) => {
    if (req.body.password || req.body.passowordConfirm) {
        return next(new AppError('You are not allowed to update the password using this route'));
    };

    const { name, email } = req.body;

    const filteredBody = { name, email };

    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        status: 'success',
        data: updatedUser
    });
});

module.exports = { getAllUsers, getOneUser, updateMe, deleteUser };