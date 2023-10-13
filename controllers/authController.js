const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const crypto = require('crypto');

const catchAsync = require('../utils/catchAsync');
const User = require('../models/usersmodel');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

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
        role: req.body.role,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
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
        data: await User.findOne({ email }).select('-__v')
    });
});

const protect = catchAsync(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(new AppError('You are not loggedIn. Please logIn to get access!', 401));
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
        return next(new AppError('The user belonging to this token deos not exist', 401));
    };

    if (user.passwordChanged(decoded.iat)) {
        return new AppError('User recently changed his password. Please logIn again!', 401);
    };

    req.user = user;

    next();
});

const restrictTo = (...roles) => {

    return catchAsync(async (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError("You don't have a permision to perform this action", 403));
        };

        next();
    });
};

const forgotPassword = catchAsync(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new AppError('There is no user with that email', 404));
    };

    const resetToken = user.createResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

    const message = `Forgot your password? Click this URL to reset your password: ${resetURL}`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Your password reset token (valid for 10 minutes)',
            message
        });
    } catch (e) {
        user.passwordResetToken = undefined;
        user.passowordExpireToken = undefined;
        user.save({ validateBeforeSave: false });

        return next(new AppError('There is an error while sending the emial', 500));
    };

    res.status(200).json({
        status: 'success',
        message: 'Token sent to email'
    });
});

const resetPassword = catchAsync(async (req, res, next) => {
    const resetToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
        passwordResetToken: resetToken,
        passowordExpireToken: { $gt: Date.now() }
    });

    console.log(user);

    if (!user) {
        return next(new AppError('Invalid token or it has expired'), 400);
    };

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passowordExpireToken = undefined;

    await user.save();

    const token = generateJWT(user);

    res.status(200).json({
        status: 'success',
        token,
        data: user
    });

});

const updatePassword = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');
    const checkValidPassword = await user.checkPassword(req.body.password, user.password);

    if (!checkValidPassword) {
        return next(new AppError("The provided password does'nt match the current password", 400));
    };

    const checkTypicalPasswords = await user.checkPassword(req.body.newPassword, user.password);

    if (checkTypicalPasswords) {
        return next(new AppError("The new password and the current password must'nt be the same", 400));
    }

    user.password = req.body.newPassword;
    user.passwordConfirm = req.body.passwordConfirm;

    await user.save();

    const token = generateJWT(user);

    res.status(200).json({
        status: 'success',
        token,
        data: user
    });
});


module.exports = {
    signUp,
    login,
    protect,
    restrictTo,
    resetPassword,
    forgotPassword,
    updatePassword
};