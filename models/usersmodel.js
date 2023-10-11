const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const usersSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please insert your name']
    },
    email: {
        type: String,
        required: [true, 'Please insert your email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a vaild email']
    },
    photo: {
        type: String
    },
    password: {
        type: String,
        required: [true, 'Please insert password'],
        minlength: 8,
        select: false
    },
    passowordConfirm: {
        type: String,
        required: [true, 'Please confirm the password'],
        validate: {
            validator: function (val) {
                return val === this.password;
            },
            message: 'Password and password confirm must be identical'
        }
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
});

usersSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);
    this.passowordConfirm = undefined;

    next();
});

usersSchema.methods.checkPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', usersSchema);

module.exports = User;