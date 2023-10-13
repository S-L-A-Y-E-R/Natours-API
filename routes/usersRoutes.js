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
    deleteUser,
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

router.
    route('/').
    get(protect, restrictTo('admin'), getAllUsers);

router.
    route('/:id').
    get(protect, restrictTo('admin'), getOneUser).
    delete(protect, deleteUser);

module.exports = router;