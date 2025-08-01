const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay instance
const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create a Razorpay order
// @route   POST /api/payment/create-order
exports.createOrder = async (req, res) => {
    const { amount, currency = 'INR' } = req.body; // amount is in the smallest currency unit (e.g., paise)

    const options = {
        amount: Number(amount) * 100, // Convert rupees to paise
        currency,
        receipt: `receipt_order_${new Date().getTime()}`,
    };

    try {
        const order = await instance.orders.create(options);
        res.json(order);
    } catch (error) {
        console.error('RAZORPAY ORDER CREATION ERROR:', error);
        res.status(500).send('Something went wrong');
    }
};


// @desc    Verify a Razorpay payment
// @route   POST /api/payment/verify
exports.verifyPayment = (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
        // Payment is authentic. Now you can save the appointment in the database.
        // We will send a success response, and the frontend will call the 'createAppointment' API.
        res.json({
            success: true,
            message: 'Payment verified successfully.',
        });
    } else {
        res.status(400).json({
            success: false,
            message: 'Payment verification failed.',
        });
    }
};