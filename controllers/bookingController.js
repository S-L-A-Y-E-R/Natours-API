const catchAsync = require('../utils/catchAsync');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/toursModel');
const Booking = require('../models/bookingModel');
const {
    createOne,
    updateOne,
    deleteOne,
    getOne,
    getAll
} = require('./factoryHandler');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
    const tour = await Tour.findById(req.params.tourId);

    const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        billing_address_collection: 'required',
        phone_number_collection: {
            enabled: true,
        },
        success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=
        ${req.user.id}&price=${tour.price}`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourId,
        line_items: [
            {
                price_data: {
                    currency: 'usd',
                    unit_amount: tour.price * 100, // Amount in cents
                    product_data: {
                        name: `${tour.name} Tour`,
                        description: tour.description,
                        images: [],
                        metadata: {
                            category: '',
                            brand: '',
                        },
                    },
                },
                quantity: 1,
            },
        ],
    });

    res.status(200).json({
        status: 'success',
        session
    });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
    const { tour, user, price } = req.query;

    if (!tour && !user && !price) next();

    await Booking.create({ tour, user, price });

    res.redirect(req.originalUrl.split('?')[0]);
});

exports.createBooking = createOne(Booking);

exports.updateBooking = updateOne(Booking);

exports.deleteBooking = deleteOne(Booking);

exports.getOneBooking = getOne(Booking);

exports.getAllBookings = getAll(Booking);