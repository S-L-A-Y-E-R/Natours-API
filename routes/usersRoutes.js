const express = require('express');
const {
    signUp,
    login,
    protect,
    forgotPassword,
    resetPassword,
    updatePassword
} = require('../controllers/authController');

const {
    getAllUsers,
    getOneUser,
    updateMe,
    deleteUser
} = require('../controllers/usersController');

const router = express.Router();

router.post('/signup', signUp);
router.post('/login', login);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);
router.patch('/updatePassword', protect, updatePassword);
router.patch('/updateMe', protect, updateMe);

router.
    route('/').
    get(protect, getAllUsers);

router.
    route('/:id').
    get(protect, getOneUser).
    delete(protect, deleteUser);

module.exports = router;