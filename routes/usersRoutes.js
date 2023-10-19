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
    deleteMe,
    deleteUser,
    updateUser,
    getMe,
    updateUserPhoto,
    resizeUserPhoto
} = require('../controllers/usersController');

const router = express.Router();

router.post('/signup', signUp);

router.post('/login', login);

router.post('/forgotPassword', forgotPassword);

router.patch('/resetPassword/:token', resetPassword);

//This middleware will protect all the incoming routes
router.use(protect);

router.patch('/updatePassword', updatePassword);

router.patch('/updateMe',
    updateUserPhoto,
    resizeUserPhoto,
    updateMe
);

router.delete('/deleteMe', deleteMe);

router.get('/me', getMe, getOneUser);

//This middleware will restrict all the incoming routes
router.use(restrictTo('admin'));

router.get('/', getAllUsers);

router.
    route('/:id').
    get(getOneUser).
    delete(deleteUser).
    patch(updateUser);

module.exports = router;