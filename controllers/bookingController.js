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
const User = require('../models/usersmodel');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
    const tour = await Tour.findById(req.params.tourId);

    const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        billing_address_collection: 'required',
        phone_number_collection: {
            enabled: true,
        },
        success_url: `${req.protocol}://${req.get('host')}/my-tours`,
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

const createBookingCheckout = async session => {
    const tour = session.client_reference_id;
    const user = (await User.findOne({ email: session.customer_email }))._id;
    const price = session.line_items[0].price_data.unit_amount / 100;

    await Booking.create({ tour, user, price });
};

exports.webhookCheckout = (req, res, next) => {
    const signature = req.headers['stripe-signature'];

    /*We need the signature and the secret to validate 
    the data in the body and make the process super secure*/
    let event;
    try {
        event = stripe.webhooks.constructEvents(
            req.body,
            signature,
            process.env.WEBHOOK_SECRET
        );
    } catch (err) {
        return res.status(400).send(`Webhook error: ${err.message}`);
    }

    if (event.type === 'checkout.session.complete') createBookingCheckout(event.data.object);

    res.status(200).json({
        recieved: true
    });

};

exports.createBooking = createOne(Booking);

exports.updateBooking = updateOne(Booking);

exports.deleteBooking = deleteOne(Booking);

exports.getOneBooking = getOne(Booking);

exports.getAllBookings = getAll(Booking);