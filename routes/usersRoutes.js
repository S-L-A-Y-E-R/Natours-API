const express = require('express');
const {
    getAllUsers,
    createUser,
    getOneUser,
    updateUser,
    deleteUser
} = require('../controllers/usersController');

const router = express.Router();

router.
    route('/').
    get(getAllUsers).
    post(createUser);

router.
    route('/:id').
    get(getOneUser).
    patch(updateUser).
    delete(deleteUser);

module.exports = router;