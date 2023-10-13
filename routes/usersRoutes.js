const express = require('express');
const {
    signUp,
    login,
    protect,
    forgotPassword,
    resetPassword,
    updatePassword,
    restrictTo
} = require('../controllers/authController');

const {
    getAllUsers,
    getOneUser,
    updateMe,
    deleteMe
} = require('../controllers/usersController');

const router = express.Router();

router.post('/signup', signUp);

router.post('/login', login);

router.post('/forgotPassword', forgotPassword);

router.patch('/resetPassword/:token', resetPassword);

router.patch('/updatePassword', protect, updatePassword);

router.patch('/updateMe', protect, updateMe);

router.delete('/deleteMe', protect, deleteMe);

router.get('/', protect, restrictTo('admin'), getAllUsers);

router.get('/:id', protect, restrictTo('admin'), getOneUser);

module.exports = router;