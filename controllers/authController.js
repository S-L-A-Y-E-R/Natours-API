const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const crypto = require('crypto');

const catchAsync = require('../utils/catchAsync');
const User = require('../models/usersmodel');
const AppError = require('../utils/appError');
const Email = require('../utils/email');

const generateAccessToken = (newUser) => {
    const accessToken = jwt.sign({ id: newUser._id }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN
    });

    return accessToken;
};

const generateRefreshToken = (newUser) => {
    const refreshToken = jwt.sign({ id: newUser._id }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN
    });

    return refreshToken;
};

const createAndSendTokens = (user, res, statusCode) => {
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    const cookieOptions = (tokenType) => {
        return {
            expires: new Date(Date.now() +
                `${tokenType === 'accessToken' ? process.env.ACCESS_TOKEN_COOKIE_EXPIRES_IN
                    : process.env.REFRESHH_TOKEN_COOKIE_EXPIRES_IN}`
                * 24 * 60 * 60 * 1000),
            httpOnly: true,
            secure: `${process.env.NODE_ENV === 'production' ? true : false}`
        };
    };

    res.cookie('accessToken', accessToken, cookieOptions('accessToken'));
    res.cookie('refreshToken', refreshToken, cookieOptions('refreshToken'));

    user.password = undefined;
    user.active = undefined;

    res.status(statusCode).json({
        message: 'success',
        accessToken,
        data: {
            user
        }
    });
};

const signUp = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
    });

    createAndSendTokens(newUser, res, 201);
});

const login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) return next(new AppError('Please provide email and password', 400));

    const user = await User.findOne({ email }).select('+password');

    if (!user || ! await user.checkPassword(password, user.password)) {
        return next(new AppError('Invalid email or password', 401));
    };

    createAndSendTokens(user, res, 200);
});

const protect = catchAsync(async (req, res, next) => {
    let accessToken;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        accessToken = req.headers.authorization.split(' ')[1];
    }

    if (!accessToken) {
        return next(new AppError('You are not loggedIn. Please logIn to get access!', 401));
    }

    const decoded = await promisify(jwt.verify)(accessToken, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
        return next(new AppError('The user belonging to this AccessToken deos not exist', 401));
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

    const resetToken = user.createResetPasswordAccessToken();
    await user.save({ validateBeforeSave: false });

    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

    try {
        await new Email(user, resetURL).sendPasswordReset();
    } catch (e) {
        user.passwordResetToken = undefined;
        user.passowordExpireToken = undefined;
        user.save({ validateBeforeSave: false });

        return next(new AppError('There is an error while sending the email', 500));
    };

    res.status(200).json({
        status: 'success',
        message: 'Access token sent to email'
    });
});

const resetPassword = catchAsync(async (req, res, next) => {
    const resetToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
        passwordResetToken: resetToken,
        passowordExpireToken: { $gt: Date.now() }
    });

    if (!user) {
        return next(new AppError('Invalid access token or it is expired'), 400);
    };

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passowordExpireToken = undefined;

    await user.save();

    createAndSendTokens(user, res, 200);

});

const updatePassword = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');
    const isValidPassword = await user.checkPassword(req.body.password, user.password);

    if (!isValidPassword) {
        return next(new AppError("The provided password does'nt match the current password", 400));
    };

    const isTypicalPasswords = await user.checkPassword(req.body.newPassword, user.password);

    if (isTypicalPasswords) {
        return next(new AppError("The new password and the current password must'nt be the same", 400));
    }

    user.password = req.body.newPassword;
    user.passwordConfirm = req.body.passwordConfirm;

    await user.save();

    createAndSendTokens(user, res, 200);
});

const logout = (req, res) => {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.status(200).json({
        status: 'success',
    });
};

const refreshAccessToken = catchAsync(async (req, res, next) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return next(new AppError('Please provide the refresh token', 400));
    }

    const decoded = await promisify(jwt.verify)(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
        return next(new AppError('Refresh token is invalid or has expired', 401));
    };

    createAndSendTokens(user, res, 200);
});


module.exports = {
    signUp,
    login,
    protect,
    restrictTo,
    resetPassword,
    forgotPassword,
    updatePassword,
    logout,
    refreshAccessToken
};