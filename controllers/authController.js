const jwt = require('jsonwebtoken');

const catchAsync = require('../utils/catchAsync');
const User = require('../models/usersmodel');
const AppError = require('../utils/appError');

const generateJWT = (newUser) => {
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });

    return token;
};

const signUp = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passowordConfirm: req.body.passowordConfirm
    });

    const token = generateJWT(newUser);

    res.status(201).json({
        message: 'success',
        token,
        data: newUser
    });
});

const login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) return next(new AppError('Please provide email and password', 400));

    const user = await User.findOne({ email }).select('+password');

    if (!user || ! await user.checkPassword(password, user.password)) {
        return next(new AppError('Invalid email or password', 401));
    };

    const token = generateJWT(user);

    res.status(200).json({
        status: 'success',
        token,
        data:  await User.findOne({ email }).select('-__v')
    });
});



module.exports = { signUp, login };