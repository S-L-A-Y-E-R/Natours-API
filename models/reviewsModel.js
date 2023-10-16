const mongoose = require('mongoose');

const Tour = require('./toursModel');

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

//Prevent the user to add more then 1 review for each tour
reviewsSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewsSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'user',
        select: 'name'
    });

    next();
});

reviewsSchema.statics.calcAvgRatings = async function (tourId) {
    const statistics = await this.aggregate([
        {
            $match: { tour: tourId }
        },
        {
            $group: {
                _id: '$tour',
                numOfRatings: { $sum: 1 },
                avgRatings: { $avg: '$rating' }
            }
        }
    ]);

    if (statistics.length > 0) {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: statistics[0].numOfRatings,
            ratingsAverage: statistics[0].avgRatings
        });
    } else {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: 0,
            ratingsAverage: 4.5
        });
    }
};

reviewsSchema.post('save', function () {
    this.constructor.calcAvgRatings(this.tour);
});

reviewsSchema.pre(/^findOneAnd/, async function (next) {
    this.query = await this.clone().findOne();

    next();
});

reviewsSchema.post(/^findOneAnd/, async function () {
    await this.query.constructor.calcAvgRatings(this.query.tour);
});

const Review = mongoose.model('Review', reviewsSchema);

module.exports = Review;