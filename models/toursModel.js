const mongoose = require('mongoose');
const slugify = require('slug');

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'You must give a name'],
        unique: true,
        trim: true,
        maxlength: [40, 'A tour name must have less or equal than 40 characters'],
        minlength: [10, 'A tour name must have more than or equal 10 characters'],
    },
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a group size']
    },
    difficulty: {
        type: String,
        required: true,
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Difficulty must be easy,medium or difficult'
        }
    },
    slug: String,
    secretTure: {
        type: Boolean,
        default: false
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'The rating must be above 1'],
        max: [5, 'The rating must be below 5']
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'You must specify a price'],
    },
    priceDiscount: {
        type: Number,
        validate: {
            validator: function (val) {
                return val < this.price;
            },
            message: 'A price discount of ({VALUE}) must be below the regular price.'
        }
    },
    summary: {
        type: String,
        required: [true, 'A tour must have a description'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, 'A tour must have a cover image']
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now()
    },
    startDates: [Date],
    startLocation: {
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String
    },
    locations: [
        {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number
        }
    ],
    guides: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }
    ]
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

//Add virtual field to the schema
tourSchema.virtual('durationInWeeks').get(function () {
    return this.duration / 7;
});

//Virtual populating
tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id'
});

//Document middleware (excutes before saving the document)
tourSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { toLower: true });
    next();
});

//Embeded users in the tours model
// tourSchema.pre('save', async function (next) {
//     const guidesPromises = this.guides.map(async id => await User.findById(id));
//     this.guides = await Promise.all(guidesPromises);

//     next();
// });

//Populate guides in the pre query middleware
tourSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'guides',
        select: '-__v'
    });

    next();
});

//Query middleware (excutes before finding the documents)
tourSchema.pre(/^find/, function (next) {
    this.find({ secretTure: { $ne: true } });
    next();
});

//Aggregation middleware (excutes before applying aggregation on the document)
tourSchema.pre('aggregate', function (next) {
    this.pipeline().unshift({ $match: { secretTure: { $ne: true } } });
    next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;