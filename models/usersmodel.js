const mongoose = require('mongoose');
const validator = require('validator');

const usersSchema = new mongoose.Schema({
    name: {
        type: string,
        required: [true, 'Please insert your name']
    },
    email: {
        type: string,
        required: [true, 'Please insert your email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please insert a vaild email']
    },
    photo: {
        type: string
    },
    password: {
        type: string,
        required: [true, 'Please insert password'],
        minlength: 8
    },
    passowordConfirm: {
        type: string,
        required: [true, 'Please confirm the password']
    },
});

const User = mongoose.model('User', usersSchema);

module.exports = User;