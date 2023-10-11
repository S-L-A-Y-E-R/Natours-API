const express = require('express');
const {
    signUp,
    login
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

router.
    route('/').
    get(getAllUsers);

router.
    route('/:id').
    get(getOneUser).
    patch(updateUser).
    delete(deleteUser);

module.exports = router;