const express = require('express');
const {
    signUp,
    login,
    protect,
    forgotPassword,
    resetPassword
} = require('../controllers/authController');

const {
    getAllUsers,
    getOneUser,
    updateUser,
    deleteUser
} = require('../controllers/usersController');

const router = express.Router();

router.post('/signup', signUp);
router.post('/login', login);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

router.
    route('/').
    get(protect, getAllUsers);

router.
    route('/:id').
    get(protect, getOneUser).
    patch(protect, updateUser).
    delete(protect, deleteUser);

module.exports = router;