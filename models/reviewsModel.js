const mongoose = require('mongoose');

const reviewsSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, 'Please write your review'],
        trim: true
    },
    rating: {
        type: Number,
        required: [true, 'Please give a rating to your expierience'],
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must belong to a tour']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to a user']
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

reviewsSchema.pre(/^find/, function (next) {
    this
        // .populate({
        //     path: 'tour',
        //     select: 'name'
        // })
        .populate({
            path: 'user',
            select: 'name'
        });

    next();
});

const Review = mongoose.model('Review', reviewsSchema);

module.exports = Review;